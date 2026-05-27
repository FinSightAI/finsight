/**
 * WizeCloudBackup — automatic Firestore backup for all WizeMoney localStorage data.
 *
 * WHY: WizeMoney stored everything in localStorage. localStorage is per-origin,
 * so a domain change (finsightai.github.io → money.wizelife.ai) or a browser
 * data-clear permanently lost the user's bank accounts / stocks / income. This
 * module keeps a copy of every BACKUP_KEYS entry in Firestore so the data
 * follows the user across devices, domains, and reinstalls.
 *
 * MODEL: one document per user at `userBackups/{uid}`:
 *   { data: { finance_stocks: "<stringified JSON>", ... },
 *     updatedAt: Firestore.serverTimestamp(),
 *     version: 2 }
 *
 * FLOWS:
 *   - On login: read cloud doc → compare server `updatedAt` against
 *     local `wize_backup_local_ts`. If cloud is newer, restore missing/older
 *     keys into localStorage and reload.
 *   - On every write: debounced 8s push of all BACKUP_KEYS to cloud doc.
 */
(function () {
    'use strict';

    const BACKUP_KEYS = [
        'finance_bank_accounts',
        'finance_credit_cards',
        'finance_stocks',
        'finance_assets',
        'finance_my_funds',
        'finance_settings',
        'finance_stock_alerts',
        'finance_tv_custom_symbols',
        'finance_notifications',
        'finance_dashboard_widgets',
        'finance_import_templates',
        'finance_user_profile',
        'finance_dismissed_tips',
        'finance_loans',
        'finance_credit_score',
        'finance_subscriptions',
        'finance_summary_schedule',
        'finance_income',
        'finance_goals',
        'finance_transactions',
        'finance_expenses',
        'finance_pension',
        'finance_gemel',
        'finance_my_gemel',
    ];

    const DEBOUNCE_MS = 8000;
    const LOCAL_TS_KEY = 'wize_backup_local_ts';
    const RESTORED_FLAG = 'wize_backup_restored_once';
    const MAX_DOC_BYTES = 900 * 1024; // Firestore limit is 1MB; leave room for metadata

    let _debounceTimer = null;
    let _currentUid = null;
    let _initialRestoreDone = false;

    function nowTs() { return Date.now(); }

    function getLocalKey(key) {
        try {
            const v = localStorage.getItem(key);
            return v == null ? null : v; // already JSON string
        } catch { return null; }
    }

    function setLocalKey(key, valueStr) {
        try {
            localStorage.setItem(key, valueStr);
            // Refresh Storage._cache if Storage module is loaded
            if (typeof Storage !== 'undefined' && Storage._cache) {
                try { Storage._cache[key] = JSON.parse(valueStr); } catch { /* keep raw */ }
            }
        } catch (e) { console.warn('CloudBackup setLocalKey failed:', e); }
    }

    function snapshotLocal() {
        const data = {};
        for (const k of BACKUP_KEYS) {
            const v = getLocalKey(k);
            if (v == null) continue;
            data[k] = v;
        }
        return data;
    }

    function jsonSize(obj) {
        try { return new Blob([JSON.stringify(obj)]).size; } catch { return 0; }
    }

    async function ensureFirestore() {
        if (typeof firebase === 'undefined' || !firebase.auth) return null;
        if (typeof firebase.firestore !== 'function') {
            if (typeof window.ensureFirestore === 'function') {
                try { await window.ensureFirestore(); } catch { return null; }
            }
        }
        if (typeof firebase.firestore !== 'function') return null;
        return firebase.firestore();
    }

    function looksEncrypted(valueStr) {
        // Pin-lock encrypts entries as {"__enc":true,...}. We must NOT push
        // encrypted blobs — they'd be useless on another device with a
        // different PIN, AND would mask the user's real data on cloud restore.
        try {
            const p = JSON.parse(valueStr);
            return p && p.__enc === true;
        } catch { return false; }
    }

    function snapshotLocalSafe() {
        const data = {};
        let skipped = 0;
        for (const k of BACKUP_KEYS) {
            const v = getLocalKey(k);
            if (v == null) continue;
            if (looksEncrypted(v)) { skipped++; continue; }
            data[k] = v;
        }
        if (skipped > 0) console.info(`WizeCloudBackup: skipped ${skipped} PIN-locked keys`);
        return data;
    }

    async function pushNow() {
        if (!_currentUid) return;
        const db = await ensureFirestore();
        if (!db) return;

        const data = snapshotLocalSafe();
        if (!Object.keys(data).length) return;

        const sizeBytes = jsonSize(data);
        if (sizeBytes > MAX_DOC_BYTES) {
            console.warn(`WizeCloudBackup: snapshot ${(sizeBytes/1024).toFixed(0)}KB exceeds safe limit. Backup skipped.`);
            return;
        }

        const ts = nowTs();
        try {
            await db.collection('userBackups').doc(_currentUid).set({
                data,
                version: 2,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                clientTs: ts,
                keyCount: Object.keys(data).length,
            }, { merge: false });
            localStorage.setItem(LOCAL_TS_KEY, String(ts));
            return { ok: true, keys: Object.keys(data).length };
        } catch (e) {
            console.warn('WizeCloudBackup: push failed', e?.code || e?.message);
            return { ok: false, error: e?.code || e?.message };
        }
    }

    function scheduleBackup() {
        if (!_currentUid) return;
        clearTimeout(_debounceTimer);
        _debounceTimer = setTimeout(() => { pushNow(); }, DEBOUNCE_MS);
    }

    /**
     * On login, compare cloud vs local. Restore if cloud is newer or local is empty.
     * If cloud is empty and local has data → push immediately (first-device case).
     */
    async function initialRestore(uid) {
        if (_initialRestoreDone) return;
        _initialRestoreDone = true;

        const db = await ensureFirestore();
        if (!db) return;

        let cloudDoc;
        try {
            cloudDoc = await db.collection('userBackups').doc(uid).get();
        } catch (e) {
            console.warn('WizeCloudBackup: initial fetch failed', e?.code || e?.message);
            return;
        }
        // No cloud doc yet — if local has data, push immediately so first-device
        // users get protection without waiting for the next Storage.set.
        if (!cloudDoc.exists) {
            const localHasData = BACKUP_KEYS.some(k => {
                const v = getLocalKey(k);
                return v && !looksEncrypted(v);
            });
            if (localHasData) {
                console.log('WizeCloudBackup: no cloud doc yet — pushing initial snapshot');
                await pushNow();
            }
            return;
        }

        const cloud = cloudDoc.data() || {};
        if (!cloud.data || typeof cloud.data !== 'object') return;

        const localTs = parseInt(localStorage.getItem(LOCAL_TS_KEY) || '0', 10);
        const cloudTs = cloud.clientTs || 0;

        // Decide: restore from cloud when (a) local has no data at all, OR
        //         (b) cloud is strictly newer than local last push.
        const localEmpty = BACKUP_KEYS.every(k => !getLocalKey(k));
        const cloudIsNewer = cloudTs > localTs;
        if (!localEmpty && !cloudIsNewer) return;

        let restoredCount = 0;
        for (const k of BACKUP_KEYS) {
            const v = cloud.data[k];
            if (typeof v !== 'string') continue;
            const localVal = getLocalKey(k);
            if (localVal !== v) {
                setLocalKey(k, v);
                restoredCount++;
            }
        }
        if (restoredCount > 0) {
            localStorage.setItem(LOCAL_TS_KEY, String(cloudTs || nowTs()));
            localStorage.setItem(RESTORED_FLAG, '1');
            console.log(`WizeCloudBackup: restored ${restoredCount} keys from cloud`);
            // Soft-reload so UIs that already rendered an empty state pick up the data
            try {
                if (typeof window !== 'undefined' && location && !sessionStorage.getItem('wize_backup_reloaded')) {
                    sessionStorage.setItem('wize_backup_reloaded', '1');
                    setTimeout(() => location.reload(), 400);
                }
            } catch { /* no-op */ }
        }
    }

    /**
     * Wire into Storage.set so every write is mirrored to cloud (debounced).
     */
    function instrumentStorage() {
        if (typeof Storage === 'undefined' || !Storage.set || Storage.__cloudWrapped) return;
        const orig = Storage.set.bind(Storage);
        Storage.set = function (key, data) {
            const r = orig(key, data);
            if (BACKUP_KEYS.includes(key)) scheduleBackup();
            return r;
        };
        Storage.__cloudWrapped = true;
    }

    /**
     * Initialize: wait for Firebase auth → trigger restore + instrument writes.
     */
    function init() {
        if (typeof firebase === 'undefined' || !firebase.auth) return;
        firebase.auth().onAuthStateChanged((user) => {
            if (!user) { _currentUid = null; return; }
            _currentUid = user.uid;
            instrumentStorage();
            initialRestore(user.uid).catch(() => {});
        });
        // Push on tab close (best-effort)
        window.addEventListener('beforeunload', () => {
            if (_debounceTimer) {
                clearTimeout(_debounceTimer);
                pushNow();
            }
        });
    }

    // Diagnostic: callable from console as WizeCloudBackup.status()
    async function status() {
        const out = {
            uid: _currentUid,
            wrapped: typeof Storage !== 'undefined' && Storage.__cloudWrapped === true,
            localKeys: BACKUP_KEYS.filter(k => getLocalKey(k)).length,
            localTs: parseInt(localStorage.getItem(LOCAL_TS_KEY) || '0', 10),
            cloud: null,
        };
        const db = await ensureFirestore();
        if (db && _currentUid) {
            try {
                const d = await db.collection('userBackups').doc(_currentUid).get();
                if (d.exists) {
                    const c = d.data();
                    out.cloud = {
                        keyCount: c.keyCount || Object.keys(c.data || {}).length,
                        clientTs: c.clientTs,
                        ageSec: c.clientTs ? Math.round((Date.now() - c.clientTs) / 1000) : null,
                    };
                } else {
                    out.cloud = 'no-doc-yet';
                }
            } catch (e) {
                out.cloud = 'fetch-error: ' + (e?.code || e?.message);
            }
        }
        console.table(out);
        return out;
    }

    // Expose for manual triggers + diagnostics
    window.WizeCloudBackup = {
        init,
        pushNow,
        scheduleBackup,
        snapshotLocal,
        status,
        BACKUP_KEYS,
    };

    // Auto-init when DOM + Firebase are ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
