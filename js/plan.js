/**
 * Plan — Free / Pro management
 * PAYWALL_ACTIVE = false  →  everyone gets Pro (pre-launch mode)
 * PAYWALL_ACTIVE = true   →  paywall enforced, Stripe + access codes required
 */
const Plan = (() => {
    // ─── MASTER SWITCH ────────────────────────────────────────────
    const PAYWALL_ACTIVE = true;

    // Access codes validated server-side via Firebase Function (validateCode)

    const PRO_FEATURES = {
        export:          { he: "ייצוא נתונים",        en: "Export Data" },
        stocks:          { he: "מעקב מניות",           en: "Stock Tracker" },
        stockAlerts:     { he: "התראות מניות",         en: "Stock Alerts" },
        aiStory:         { he: "סיפור AI",             en: "AI Story" },
        aiChat:          { he: "צ'אט AI",              en: "AI Chat" },
        reports:         { he: "דוחות",                en: "Reports" },
        taxOptimizer:    { he: "אופטימיזציית מס",      en: "Tax Optimizer" },
        pensionOptimizer:{ he: "אופטימיזציית פנסיה",   en: "Pension Optimizer" },
        simulator:       { he: "סימולטור",             en: "Simulator" },
        compareFunds:    { he: "השוואת קרנות",         en: "Compare Funds" },
        multiProfile:    { he: "פרופילים מרובים",      en: "Multiple Profiles" },
        unlimitedTx:     { he: "עסקאות ללא הגבלה",    en: "Unlimited Transactions" },
    };

    // Yolo-only features — require plan === "yolo" explicitly
    const YOLO_FEATURES = {
        crossAppAI: { he: "AI פאנל — כל הכלים", en: "AI Panel — All Tools" },
    };

    const FREE_TX_LIMIT = 50;
    let _plan = null;
    let _listeners = [];

    function _lang() {
        try { return (I18n && I18n.current) || "he"; } catch { return "he"; }
    }

    // ── Access Code ───────────────────────────────────────────────

    async function redeemCode(code) {
        const normalized = code.trim().toUpperCase();
        if (!normalized) return false;
        try {
            const fn = firebase.functions().httpsCallable("validateCode");
            const result = await fn({ code: normalized });
            if (result.data.valid) {
                _plan = result.data.plan || "pro";
                localStorage.setItem("wl_plan", _plan);
                localStorage.setItem("wl_access_code", normalized);
                // Save to Firestore so it persists across devices/browsers
                try {
                    if (typeof firebaseAuth !== "undefined" && firebaseAuth.currentUser) {
                        const _uid = firebaseAuth.currentUser.uid;
                        await firebaseDb.collection("users").doc(_uid).set({
                            plan: _plan,
                            accessCode: normalized,
                            accessCodeRedeemedAt: firebase.firestore.FieldValue.serverTimestamp(),
                        }, { merge: true });
                        // Referral reward: if this user was referred, give the referrer
                        // 30 days of the matching tier (pro/yolo). Inline since wizelife-auth.js
                        // is not loaded inside individual app pages.
                        try {
                            if (["pro","yolo"].includes(_plan)) {
                                const _udoc = await firebaseDb.collection("users").doc(_uid).get();
                                const _u = _udoc.exists ? _udoc.data() : {};
                                if (_u.referredBy && !_u.referralRewardSent) {
                                    await firebaseDb.collection("users").doc(_u.referredBy).set({
                                        referralRewards: firebase.firestore.FieldValue.arrayUnion({
                                            tier: _plan, days: 30, from: _uid, ts: Date.now(),
                                        }),
                                        referralCount: firebase.firestore.FieldValue.increment(1),
                                    }, { merge: true });
                                    await firebaseDb.collection("users").doc(_uid).set({ referralRewardSent: true }, { merge: true });
                                }
                            }
                        } catch (e) { console.warn("Referral reward failed:", e); }
                    }
                } catch (e) { console.warn("Could not save plan to Firestore:", e); }
                _notify();
                return true;
            }
            return false;
        } catch (e) {
            console.error("Code validation error:", e);
            return false;
        }
    }

    function getRedeemedCode() {
        return localStorage.getItem("wl_access_code") || null;
    }

    // ── Plan Loading ──────────────────────────────────────────────

    const TRIAL_DAYS = 3;

    function _trialDaysLeft(createdAt) {
        try {
            const created = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
            const msLeft = TRIAL_DAYS * 24 * 60 * 60 * 1000 - (Date.now() - created.getTime());
            return Math.max(0, Math.ceil(msLeft / (24 * 60 * 60 * 1000)));
        } catch { return 0; }
    }

    async function load() {
        if (!PAYWALL_ACTIVE) { _plan = "pro"; _notify(); return "pro"; }

        // Honor previously-redeemed access code — don't make user re-enter
        const _storedCode = localStorage.getItem("wl_access_code");
        const _storedPlan = localStorage.getItem("wl_plan");
        if (_storedCode && (_storedPlan === "pro" || _storedPlan === "yolo")) {
            _plan = _storedPlan;
            _notify();
            return _plan;
        }

        if (typeof firebaseAuth !== "undefined" && firebaseAuth.currentUser) {
            try {
                const uid = firebaseAuth.currentUser.uid;
                const doc = await firebaseDb.collection("users").doc(uid).get();
                const data = doc.exists ? doc.data() : {};
                const storedPlan = data.plan || "free";

                if (storedPlan === "pro" || storedPlan === "yolo") {
                    _plan = storedPlan;
                    // Sync access code to localStorage (for offline/cache)
                    if (data.accessCode) localStorage.setItem("wl_access_code", data.accessCode);
                } else if (data.createdAt && _trialDaysLeft(data.createdAt) > 0) {
                    _plan = "pro_trial";
                } else {
                    _plan = "free";
                }

                localStorage.setItem("wl_plan", _plan);
                _notify();
                // Trial is silent — no banner. Users discover the limit on day 8.
                return _plan;
            } catch (e) {
                console.warn("Plan: Firestore read failed, using localStorage");
            }
        }
        _plan = localStorage.getItem("wl_plan") || "free";
        _notify();
        return _plan;
    }

    function _showTrialBanner(daysLeft) {
        if (document.getElementById("wlTrialBanner")) return;
        const lang = _lang();
        const msg = lang === "he"
            ? `🎁 ניסיון Pro חינמי — נותרו <strong>${daysLeft}</strong> ימים. <a href="#" onclick="Paywall.show('trial');return false;" style="color:#fff;text-decoration:underline;">שדרג לשמור על הגישה →</a>`
            : `🎁 Pro trial — <strong>${daysLeft}</strong> day${daysLeft !== 1 ? "s" : ""} left. <a href="#" onclick="Paywall.show('trial');return false;" style="color:#fff;text-decoration:underline;">Upgrade to keep Pro →</a>`;
        const banner = document.createElement("div");
        banner.id = "wlTrialBanner";
        banner.style.cssText = "position:fixed;top:0;left:0;right:0;z-index:2000;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-align:center;padding:9px 40px;font-size:0.82rem;font-weight:600;line-height:1.4;";
        banner.innerHTML = msg + `<button onclick="this.parentElement.remove()" style="position:absolute;right:14px;top:50%;transform:translateY(-50%);background:none;border:none;color:rgba(255,255,255,0.7);cursor:pointer;font-size:1.1rem;line-height:1;">×</button>`;
        document.body.prepend(banner);
    }

    async function setPro(uid) {
        _plan = "pro";
        localStorage.setItem("wl_plan", "pro");
        if (uid && typeof firebaseDb !== "undefined") {
            await firebaseDb.collection("users").doc(uid).set({ plan: "pro" }, { merge: true });
        }
        _notify();
    }

    function isPro() {
        if (!PAYWALL_ACTIVE) return true;
        return _plan === "pro" || _plan === "yolo" || _plan === "pro_trial";
    }

    function isYolo() {
        if (!PAYWALL_ACTIVE) return false; // yolo is always explicit, never free-tier
        return _plan === "yolo";
    }

    function checkYolo(featureKey, { silent = false } = {}) {
        if (isYolo()) return true;
        if (!silent) _showYoloWall(featureKey);
        return false;
    }

    function _showYoloWall(featureKey) {
        const lang = _lang();
        const feat = YOLO_FEATURES[featureKey] || PRO_FEATURES[featureKey];
        const name = feat ? (lang === "he" ? feat.he : feat.en) : featureKey;
        const msg = lang === "he"
            ? `✨ <strong>${name}</strong> זמין בתכנית <strong>Yolo</strong> בלבד.<br><span style="font-size:0.85em;opacity:0.8">צור קשר: support@wizelife.ai</span>`
            : `✨ <strong>${name}</strong> is available on the <strong>Yolo</strong> plan only.<br><span style="font-size:0.85em;opacity:0.8">Contact: support@wizelife.ai</span>`;
        if (typeof Paywall !== "undefined" && Paywall.showCustom) {
            Paywall.showCustom(msg);
        } else {
            // Fallback inline banner
            const id = "wlYoloBanner";
            if (document.getElementById(id)) return;
            const el = document.createElement("div");
            el.id = id;
            el.style.cssText = "position:fixed;top:0;left:0;right:0;z-index:3000;background:linear-gradient(135deg,#f59e0b,#ef4444);color:#fff;text-align:center;padding:10px 50px;font-size:0.85rem;line-height:1.5;";
            el.innerHTML = msg + `<button onclick="this.parentElement.remove()" style="position:absolute;right:14px;top:50%;transform:translateY(-50%);background:none;border:none;color:rgba(255,255,255,0.8);cursor:pointer;font-size:1.2rem;">×</button>`;
            document.body.prepend(el);
            setTimeout(() => el.remove(), 6000);
        }
    }

    function isTrialing() { return _plan === "pro_trial"; }

    function isPaywallActive() { return PAYWALL_ACTIVE; }

    function check(featureKey, { silent = false } = {}) {
        if (!PAYWALL_ACTIVE) return true;
        if (_plan === null) {
            load().then(() => { if (!isPro() && !silent) Paywall.show(featureKey); });
            return true;
        }
        if (isPro()) return true;
        if (!silent) Paywall.show(featureKey);
        return false;
    }

    function freeTxLimit() { return FREE_TX_LIMIT; }

    function featureName(key) {
        const f = PRO_FEATURES[key];
        if (!f) return key;
        return _lang() === "he" ? f.he : f.en;
    }

    function onChange(cb) { _listeners.push(cb); }
    function _notify() { _listeners.forEach(cb => cb(_plan)); }

    if (typeof firebaseAuth !== "undefined") {
        firebaseAuth.onAuthStateChanged(() => load());
    } else {
        load();
    }

    return { load, setPro, isPro, isYolo, checkYolo, isTrialing, isPaywallActive, check, redeemCode, getRedeemedCode, freeTxLimit, featureName, onChange };
})();
