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
                _plan = "pro";
                localStorage.setItem("wl_plan", "pro");
                localStorage.setItem("wl_access_code", normalized);
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

    async function load() {
        if (!PAYWALL_ACTIVE) { _plan = "pro"; _notify(); return "pro"; }

        if (typeof firebaseAuth !== "undefined" && firebaseAuth.currentUser) {
            try {
                const uid = firebaseAuth.currentUser.uid;
                const doc = await firebaseDb.collection("users").doc(uid).get();
                _plan = (doc.exists && doc.data().plan === "pro") ? "pro" : "free";
                localStorage.setItem("wl_plan", _plan);
                _notify();
                return _plan;
            } catch (e) {
                console.warn("Plan: Firestore read failed, using localStorage");
            }
        }
        _plan = localStorage.getItem("wl_plan") || "free";
        _notify();
        return _plan;
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
        return _plan === "pro";
    }

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

    return { load, setPro, isPro, isPaywallActive, check, redeemCode, getRedeemedCode, freeTxLimit, featureName, onChange };
})();
