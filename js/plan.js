/**
 * Plan — Free / Pro management
 * Reads plan from Firestore users/{uid}.plan
 * Falls back to localStorage for offline / unauthenticated users
 */
const Plan = (() => {
    const PRO_FEATURES = {
        export:          { he: "ייצוא נתונים", en: "Export Data" },
        stocks:          { he: "מעקב מניות", en: "Stock Tracker" },
        stockAlerts:     { he: "התראות מניות", en: "Stock Alerts" },
        aiStory:         { he: "סיפור AI", en: "AI Story" },
        aiChat:          { he: "צ'אט AI", en: "AI Chat" },
        reports:         { he: "דוחות", en: "Reports" },
        taxOptimizer:    { he: "אופטימיזציית מס", en: "Tax Optimizer" },
        pensionOptimizer:{ he: "אופטימיזציית פנסיה", en: "Pension Optimizer" },
        simulator:       { he: "סימולטור", en: "Simulator" },
        compareFunds:    { he: "השוואת קרנות", en: "Compare Funds" },
        multiProfile:    { he: "פרופילים מרובים", en: "Multiple Profiles" },
        unlimitedTx:     { he: "עסקאות ללא הגבלה", en: "Unlimited Transactions" },
    };

    const FREE_TX_LIMIT = 50;
    let _plan = null; // "free" | "pro" | null (not loaded yet)
    let _listeners = [];

    function _lang() {
        try { return (I18n && I18n.current) || "he"; } catch { return "he"; }
    }

    async function load() {
        // 1. Try Firestore if logged in
        if (typeof firebaseAuth !== "undefined" && firebaseAuth.currentUser) {
            try {
                const uid = firebaseAuth.currentUser.uid;
                const doc = await firebaseDb.collection("users").doc(uid).get();
                _plan = (doc.exists && doc.data().plan === "pro") ? "pro" : "free";
                localStorage.setItem("wl_plan", _plan);
                _notify();
                return _plan;
            } catch (e) {
                console.warn("Plan: Firestore read failed, falling back to localStorage");
            }
        }
        // 2. localStorage fallback
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
        return _plan === "pro";
    }

    /**
     * Returns true if feature is allowed.
     * If not allowed, triggers paywall and returns false.
     */
    function check(featureKey, { silent = false } = {}) {
        if (_plan === null) {
            // Plan not loaded yet — allow and re-check after load
            load().then(() => {
                if (!isPro() && !silent) Paywall.show(featureKey);
            });
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

    // Auto-load when auth state changes
    if (typeof firebaseAuth !== "undefined") {
        firebaseAuth.onAuthStateChanged(() => load());
    } else {
        load();
    }

    return { load, setPro, isPro, check, freeTxLimit, featureName, onChange };
})();
