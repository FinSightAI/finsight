/**
 * Paywall — modal shown when a free user hits a Pro feature
 * Customize STRIPE_LINK before going live
 */
const Paywall = (() => {
    const STRIPE_LINK = "https://buy.stripe.com/REPLACE_WITH_YOUR_LINK"; // TODO: replace

    const COPY = {
        he: {
            title: "פיצ'ר Premium",
            sub: (name) => `<strong>${name}</strong> זמין בתוכנית Pro בלבד`,
            perks: ["ייצוא ל-CSV ו-PDF", "מעקב מניות + התראות", "AI Story וצ'אט", "דוחות ואופטימיזציית מס", "פנסיה, סימולטור והשוואת קרנות", "עסקאות ויעדים ללא הגבלה"],
            price: "₪35 / חודש",
            btn: "שדרג ל-Pro",
            dismiss: "אולי אחר כך",
        },
        en: {
            title: "Premium Feature",
            sub: (name) => `<strong>${name}</strong> is available on Pro only`,
            perks: ["Export to CSV & PDF", "Stock tracker + alerts", "AI Story & Chat", "Reports & Tax Optimizer", "Pension, Simulator & Fund Comparison", "Unlimited transactions & goals"],
            price: "$9.90 / month",
            btn: "Upgrade to Pro",
            dismiss: "Maybe later",
        }
    };

    function _lang() {
        try { return (I18n && I18n.current) || "he"; } catch { return "he"; }
    }

    function _inject() {
        if (document.getElementById("paywallOverlay")) return;

        const style = document.createElement("style");
        style.textContent = `
          #paywallOverlay {
            position: fixed; inset: 0; z-index: 9999;
            background: rgba(0,0,0,0.7); backdrop-filter: blur(6px);
            display: flex; align-items: center; justify-content: center;
            animation: pwFadeIn 0.2s ease;
          }
          @keyframes pwFadeIn { from { opacity:0 } to { opacity:1 } }
          #paywallBox {
            background: #0d1117; border: 1px solid rgba(255,255,255,0.12);
            border-radius: 20px; padding: 40px 36px; max-width: 420px; width: 92%;
            text-align: center; box-shadow: 0 24px 60px rgba(0,0,0,0.6);
            animation: pwSlideUp 0.25s ease;
          }
          @keyframes pwSlideUp { from { transform: translateY(24px); opacity:0 } to { transform: translateY(0); opacity:1 } }
          #paywallBox .pw-icon { font-size: 2.5rem; margin-bottom: 12px; }
          #paywallBox h2 { font-size: 1.4rem; font-weight: 700; margin-bottom: 8px; color: #f0f4ff; }
          #paywallBox .pw-sub { color: #8892a4; font-size: 0.95rem; margin-bottom: 20px; }
          #paywallBox .pw-perks { list-style: none; padding: 0; margin: 0 0 24px; text-align: right; }
          #paywallBox .pw-perks li { font-size: 0.88rem; color: #c9d1e0; padding: 5px 0; }
          #paywallBox .pw-perks li::before { content: "✓  "; color: #10b981; font-weight: 700; }
          #paywallBox .pw-price { font-size: 1.1rem; font-weight: 600; color: #f0f4ff; margin-bottom: 20px; }
          #paywallBox .pw-btn {
            display: block; width: 100%; padding: 14px;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: #fff; font-size: 1rem; font-weight: 700;
            border: none; border-radius: 12px; cursor: pointer;
            text-decoration: none; margin-bottom: 12px;
            transition: opacity 0.2s;
          }
          #paywallBox .pw-btn:hover { opacity: 0.88; }
          #paywallBox .pw-dismiss { background: none; border: none; color: #8892a4; font-size: 0.85rem; cursor: pointer; }
          #paywallBox .pw-dismiss:hover { color: #f0f4ff; }
          #paywallBox .pw-code-row { display: flex; gap: 8px; margin: 12px 0 4px; }
          #paywallBox .pw-code-input { flex: 1; padding: 10px 12px; background: #161b27; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #f0f4ff; font-size: 0.88rem; font-family: inherit; }
          #paywallBox .pw-code-input:focus { outline: none; border-color: #6366f1; }
          #paywallBox .pw-code-input::placeholder { color: #8892a4; }
          #paywallBox .pw-code-btn { padding: 10px 16px; background: #161b27; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #f0f4ff; font-size: 0.88rem; font-weight: 600; cursor: pointer; white-space: nowrap; }
          #paywallBox .pw-code-btn:hover { border-color: #6366f1; }
          #paywallBox .pw-code-msg { font-size: 0.82rem; min-height: 18px; margin-bottom: 8px; }
          #paywallBox .pw-code-msg.ok  { color: #10b981; }
          #paywallBox .pw-code-msg.err { color: #f87171; }
        `;
        document.head.appendChild(style);
    }

    function _stripeUrl() {
        // Append Firebase UID as client_reference_id so the webhook can identify the user
        try {
            const uid = firebaseAuth && firebaseAuth.currentUser && firebaseAuth.currentUser.uid;
            if (uid) return `${STRIPE_LINK}?client_reference_id=${encodeURIComponent(uid)}`;
        } catch (_) {}
        return STRIPE_LINK;
    }

    function show(featureKey) {
        _inject();

        const lang = _lang();
        const c = COPY[lang] || COPY.he;
        const name = Plan.featureName(featureKey);

        // Remove existing
        const old = document.getElementById("paywallOverlay");
        if (old) old.remove();

        const overlay = document.createElement("div");
        overlay.id = "paywallOverlay";
        overlay.innerHTML = `
          <div id="paywallBox">
            <div class="pw-icon">⭐</div>
            <h2>${c.title}</h2>
            <p class="pw-sub">${c.sub(name)}</p>
            <ul class="pw-perks">
              ${c.perks.map(p => `<li>${p}</li>`).join("")}
            </ul>
            <p class="pw-price">${c.price}</p>
            <a class="pw-btn" href="${_stripeUrl()}" target="_blank" rel="noopener">${c.btn}</a>
            <div class="pw-code-row">
              <input class="pw-code-input" id="pwCodeInput" placeholder="${lang === 'he' ? 'יש לך קוד גישה?' : 'Have an access code?'}" />
              <button class="pw-code-btn" onclick="Paywall.applyCode()">${lang === 'he' ? 'אשר' : 'Apply'}</button>
            </div>
            <div class="pw-code-msg" id="pwCodeMsg"></div>
            <button class="pw-dismiss" onclick="document.getElementById('paywallOverlay').remove()">${c.dismiss}</button>
          </div>
        `;

        // Close on backdrop click
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) overlay.remove();
        });

        document.body.appendChild(overlay);
    }

    function hide() {
        const el = document.getElementById("paywallOverlay");
        if (el) el.remove();
    }

    function applyCode() {
        const input = document.getElementById("pwCodeInput");
        const msg   = document.getElementById("pwCodeMsg");
        if (!input || !msg) return;
        const code = input.value.trim();
        if (!code) return;
        const success = Plan.redeemCode(code);
        if (success) {
            msg.className = "pw-code-msg ok";
            msg.textContent = "✓ קוד תקין! גישת Pro הופעלה.";
            setTimeout(() => { hide(); location.reload(); }, 1200);
        } else {
            msg.className = "pw-code-msg err";
            msg.textContent = "קוד לא תקין. נסה שוב.";
            input.value = "";
        }
    }

    return { show, hide, applyCode };
})();
