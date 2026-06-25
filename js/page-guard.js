/**
 * page-guard.js — lightweight Pro-feature gate for the standalone /pages/*.html
 * screens that do NOT load plan.js (simulator, stocks, reports, …).
 *
 * Those pages previously had no in-page entitlement check, so a free user who
 * navigated directly to the URL got the Pro feature for free. This reads the
 * `wl_plan` signal that plan.js maintains in localStorage on every login, and
 * overlays a paywall when the user is NOT entitled.
 *
 * FAIL-OPEN by design: it blocks ONLY when wl_plan is an explicit non-pro tier.
 * When the plan is unknown/missing (e.g. a paid user whose state hasn't synced
 * yet) it does nothing — never wrongly locks out a paying customer. The real
 * security boundary stays server-side (Firestore rules + AI quota); this just
 * closes the casual direct-URL UI bypass.
 *
 * Usage: <script src="../js/page-guard.js?v=…" data-feature="simulator"></script>
 *        add data-yolo="1" for Yolo-only features.
 */
(function () {
    var s = document.currentScript;
    var feature = (s && s.getAttribute('data-feature')) || 'upgrade';
    var yoloOnly = (s && s.getAttribute('data-yolo')) === '1';

    function planNow() {
        try { return localStorage.getItem('wl_plan'); } catch (e) { return null; }
    }
    function allowed(p) {
        if (p === 'yolo') return true;
        if (p === 'pro' || p === 'pro_trial') return !yoloOnly;
        if (p === 'free') return false;   // explicitly free → block
        return true;                       // null/unknown → fail-open (never block a paid-but-unsynced user)
    }

    function lock() {
        if (document.getElementById('wlPageLock')) return;
        var he = false;
        try { he = (localStorage.getItem('wl_lang') || 'he').slice(0, 2) === 'he'; } catch (e) {}
        var ov = document.createElement('div');
        ov.id = 'wlPageLock';
        ov.setAttribute('dir', he ? 'rtl' : 'ltr');
        ov.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(8,11,18,0.94);backdrop-filter:blur(7px);-webkit-backdrop-filter:blur(7px);display:flex;align-items:center;justify-content:center;padding:24px;font-family:Inter,system-ui,-apple-system,sans-serif;';
        ov.innerHTML =
            '<div style="max-width:380px;width:100%;text-align:center;background:#11151f;border:1px solid rgba(52,211,153,0.28);border-radius:18px;padding:34px 26px;color:#e5e7eb;box-shadow:0 20px 60px rgba(0,0,0,0.5);">' +
            '<div style="font-size:2.4rem;margin-bottom:10px;">🔒</div>' +
            '<h2 style="margin:0 0 8px;font-size:1.18rem;font-weight:800;color:#fff;">' + (he ? 'תכונת Pro' : 'Pro feature') + '</h2>' +
            '<p style="margin:0 0 22px;font-size:0.9rem;opacity:0.82;line-height:1.55;">' +
            (he ? 'התכונה הזו זמינה למנויי Pro. שדרג כדי לפתוח אותה.' : 'This feature is available on Pro. Upgrade to unlock it.') + '</p>' +
            '<a href="../?upgrade=' + encodeURIComponent(feature) + '" style="display:block;background:linear-gradient(135deg,#34d399,#10b981);color:#04130c;font-weight:800;padding:13px;border-radius:12px;text-decoration:none;margin-bottom:11px;">' +
            (he ? 'שדרג עכשיו →' : 'Upgrade now →') + '</a>' +
            '<a href="../" style="display:block;color:#94a3b8;font-size:0.86rem;text-decoration:none;">' +
            (he ? 'חזרה לדשבורד' : 'Back to dashboard') + '</a>' +
            '</div>';
        document.body.appendChild(ov);
        try { document.body.style.overflow = 'hidden'; } catch (e) {}
    }

    function check() { if (!allowed(planNow())) lock(); }

    // Small delay tolerates a late wl_plan write from an in-flight auth bridge;
    // re-check on cross-tab storage changes too.
    function run() { setTimeout(check, 350); }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
    else run();
    window.addEventListener('storage', function (e) { if (e.key === 'wl_plan') check(); });
})();
