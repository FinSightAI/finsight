/**
 * Paywall — 3-tier pricing modal: Free / Pro / YOLO
 */
const Paywall = (() => {
    const PAYPAL_PRO_PLAN_ID  = "P-42B26777LT293231BNHMVWNA";
    const PAYPAL_YOLO_PLAN_ID = "P-3WT61990FP2103335NH32GVA";

    const PLANS = {
        he: {
            free: {
                name: "Free",
                price: "חינם",
                color: "#6b7280",
                perks: ["2 שאלות AI ביום", "עד 50 עסקאות", "לוח בקרה בסיסי", "יעדי חיסכון"],
            },
            pro: {
                name: "Pro",
                price: "$4.99",
                period: "/ חודש",
                color: "#6366f1",
                highlight: true,
                perks: ["20 שאלות AI ביום", "AI Story יומי", "ייצוא CSV & PDF", "מעקב מניות + התראות", "דוחות ואופטימיזציית מס", "פנסיה, סימולטור, השוואת קרנות", "עסקאות ויעדים ללא הגבלה"],
            },
            yolo: {
                name: "YOLO ⚡",
                price: "$4.90",
                period: "/ חודש",
                color: "#f59e0b",
                perks: [
                    "40 שאלות AI ביום — פי 2 מ-Pro",
                    "יועץ השקעות עם נתוני שוק חיים — מחיר, RSI, MACD, P/E, חדשות",
                    "AI שמכיר את כל החיים הפיננסיים שלך — 5 כלים מחוברים",
                    "השוואת מסים גלובלית — 20 מדינות עם נתוני PwC/OECD 2025",
                    "גישה ראשונה לכל פיצ'ר חדש לפני כולם",
                    "תמיכה מועדפת — תגובה תוך 24 שעות",
                    "כל מה שב-Pro ✓",
                ],
            },
        },
        en: {
            free: {
                name: "Free",
                price: "Free",
                color: "#6b7280",
                perks: ["2 AI questions/day", "Up to 50 transactions", "Basic dashboard", "Savings goals"],
            },
            pro: {
                name: "Pro",
                price: "$4.99",
                period: "/ month",
                color: "#6366f1",
                highlight: true,
                perks: ["20 AI questions/day", "Daily AI Story", "Export CSV & PDF", "Stock tracker + alerts", "Reports & Tax Optimizer", "Pension, Simulator & Fund Comparison", "Unlimited transactions & goals"],
            },
            yolo: {
                name: "YOLO ⚡",
                price: "$4.90",
                period: "/ month",
                color: "#f59e0b",
                perks: [
                    "40 AI questions/day — 2× more than Pro",
                    "Investment advisor with live market data — price, RSI, MACD, P/E, news",
                    "AI that knows your full financial life — 5 apps connected",
                    "Global tax comparison — 20 countries, PwC/OECD 2025 data",
                    "First access to every new feature before anyone else",
                    "Priority support — response within 24 hours",
                    "Everything in Pro ✓",
                ],
            },
        },
    };

    const AI_FEATURES = new Set(["aiChat", "aiStory", "taxOptimizer", "pensionOptimizer"]);
    const DATA_FEATURES = new Set(["export", "reports", "compareFunds"]);

    function _smartSub(featureKey, name, lang) {
        if (featureKey === "quota") {
            return lang === "he"
                ? `השתמשת בכל שאלות ה-AI שלך להיום. <strong>Pro מעניק לך 20 שאלות ביום</strong> — פי 10 מהחינמי.`
                : `You've used all your free AI questions today. <strong>Pro gives you 20/day</strong> — 10× more.`;
        }
        if (AI_FEATURES.has(featureKey)) {
            return lang === "he"
                ? `<strong>${name}</strong> זמין בתוכנית Pro — יחד עם 20 שאלות AI ביום, AI Story, ואופטימיזציית מס.`
                : `<strong>${name}</strong> is on Pro — along with 20 AI questions/day, AI Story, and tax optimizer.`;
        }
        if (DATA_FEATURES.has(featureKey)) {
            return lang === "he"
                ? `<strong>${name}</strong> ודוחות מפורטים זמינים בתוכנית Pro בלבד.`
                : `<strong>${name}</strong> and detailed reports are available on Pro only.`;
        }
        return lang === "he"
            ? `<strong>${name}</strong> זמין בתוכנית Pro ומעלה.`
            : `<strong>${name}</strong> is available on Pro and above.`;
    }

    const COPY = {
        he: { title: "בחר תוכנית", sub: _smartSub, btn_pro: "שדרג ל-Pro", btn_yolo: "שדרג ל-YOLO", current: "התוכנית שלך", dismiss: "אולי אחר כך", code_placeholder: "יש לך קוד גישה?", code_btn: "אשר" },
        en: { title: "Choose a Plan", sub: _smartSub, btn_pro: "Upgrade to Pro", btn_yolo: "Upgrade to YOLO", current: "Your plan", dismiss: "Maybe later", code_placeholder: "Have an access code?", code_btn: "Apply" },
    };

    function _lang() { try { return (I18n && I18n.current) || "he"; } catch { return "he"; } }

    function _paypalUrl(planId) {
        try {
            const uid = firebaseAuth && firebaseAuth.currentUser && firebaseAuth.currentUser.uid;
            const base = `https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=${planId}`;
            return uid ? `${base}&custom_id=${encodeURIComponent(uid)}` : base;
        } catch (_) {
            return `https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=${planId}`;
        }
    }

    function _inject() {
        if (document.getElementById("paywallOverlay")) return;
        const style = document.createElement("style");
        style.textContent = `
          #paywallOverlay {
            position: fixed; inset: 0; z-index: 9999;
            background: rgba(0,0,0,0.75); backdrop-filter: blur(6px);
            display: flex; align-items: center; justify-content: center;
            padding: 16px;
            animation: pwFadeIn 0.2s ease;
          }
          @keyframes pwFadeIn { from { opacity:0 } to { opacity:1 } }
          #paywallBox {
            background: #0d1117; border: 1px solid rgba(255,255,255,0.1);
            border-radius: 20px; padding: 32px 28px; max-width: 620px; width: 100%;
            text-align: center; box-shadow: 0 24px 60px rgba(0,0,0,0.6);
            animation: pwSlideUp 0.25s ease;
          }
          @keyframes pwSlideUp { from { transform: translateY(20px); opacity:0 } to { transform: translateY(0); opacity:1 } }
          #paywallBox h2 { font-size: 1.3rem; font-weight: 700; color: #f0f4ff; margin: 0 0 6px; }
          #paywallBox .pw-sub { color: #8892a4; font-size: 0.9rem; margin: 0 0 24px; }
          .pw-plans { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; margin-bottom: 20px; }
          @media (max-width: 480px) { .pw-plans { grid-template-columns: 1fr; } }
          .pw-plan {
            border-radius: 14px; padding: 18px 14px;
            border: 1px solid rgba(255,255,255,0.08);
            background: #161b27; text-align: right; position: relative;
          }
          .pw-plan.highlight { border-color: #6366f1; background: rgba(99,102,241,0.08); }
          .pw-plan .badge {
            position: absolute; top: -10px; left: 50%; transform: translateX(-50%);
            background: #6366f1; color: #fff; font-size: 0.7rem; font-weight: 700;
            padding: 2px 10px; border-radius: 99px; white-space: nowrap;
          }
          .pw-plan-name { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; }
          .pw-plan-price { font-size: 1.5rem; font-weight: 800; color: #f0f4ff; line-height: 1; }
          .pw-plan-period { font-size: 0.75rem; color: #8892a4; margin-bottom: 14px; }
          .pw-plan-perks { list-style: none; padding: 0; margin: 0; }
          .pw-plan-perks li { font-size: 0.8rem; color: #c9d1e0; padding: 3px 0; }
          .pw-plan-perks li::before { content: "✓  "; color: #10b981; font-weight: 700; }
          .pw-plan-perks li.dim { color: #4b5563; }
          .pw-plan-perks li.dim::before { content: "—  "; color: #4b5563; }
          .pw-btns { display: flex; gap: 10px; margin-bottom: 16px; }
          @media (max-width: 480px) { .pw-btns { flex-direction: column; } }
          .pw-btn {
            flex: 1; display: block; padding: 13px;
            font-size: 0.95rem; font-weight: 700;
            border: none; border-radius: 12px; cursor: pointer;
            text-decoration: none; text-align: center;
            transition: opacity 0.2s;
          }
          .pw-btn:hover { opacity: 0.85; }
          .pw-btn-pro  { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; }
          .pw-btn-yolo { background: linear-gradient(135deg, #f59e0b, #ef4444); color: #fff; }
          .pw-code-row { display: flex; gap: 8px; margin: 4px 0 8px; }
          .pw-code-input { flex: 1; padding: 9px 12px; background: #161b27; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #f0f4ff; font-size: 0.85rem; font-family: inherit; }
          .pw-code-input:focus { outline: none; border-color: #6366f1; }
          .pw-code-input::placeholder { color: #8892a4; }
          .pw-code-btn { padding: 9px 14px; background: #161b27; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #f0f4ff; font-size: 0.85rem; font-weight: 600; cursor: pointer; white-space: nowrap; }
          .pw-code-btn:hover { border-color: #6366f1; }
          .pw-code-msg { font-size: 0.82rem; min-height: 16px; margin-bottom: 6px; }
          .pw-code-msg.ok  { color: #10b981; }
          .pw-code-msg.err { color: #f87171; }
          .pw-dismiss { background: none; border: none; color: #8892a4; font-size: 0.82rem; cursor: pointer; }
          .pw-dismiss:hover { color: #f0f4ff; }
        `;
        document.head.appendChild(style);
    }

    function show(featureKey) {
        _inject();
        const lang = _lang();
        const c    = COPY[lang]  || COPY.he;
        const p    = PLANS[lang] || PLANS.he;
        const name = featureKey === "quota" ? (lang === "he" ? "יועץ AI" : "AI") : Plan.featureName(featureKey);

        const old = document.getElementById("paywallOverlay");
        if (old) old.remove();

        const currentPlan = typeof Plan !== "undefined" && Plan.isYolo() ? "yolo" : Plan.isPro() ? "pro" : "free";

        const planCard = (key, plan) => {
            const isCurrent = key === currentPlan;
            return `
              <div class="pw-plan ${plan.highlight ? 'highlight' : ''}">
                ${plan.highlight ? `<div class="badge">${lang === 'he' ? '⭐ הכי פופולרי' : '⭐ Most Popular'}</div>` : ''}
                <div class="pw-plan-name" style="color:${plan.color}">${plan.name}</div>
                <div class="pw-plan-price">${plan.price}</div>
                <div class="pw-plan-period">${plan.period || (lang === 'he' ? 'לתמיד' : 'forever')}</div>
                <ul class="pw-plan-perks">
                  ${plan.perks.map(perk => `<li>${perk}</li>`).join('')}
                </ul>
                ${isCurrent ? `<div style="margin-top:12px;font-size:0.78rem;color:#10b981;font-weight:600">✓ ${c.current}</div>` : ''}
              </div>`;
        };

        const overlay = document.createElement("div");
        overlay.id = "paywallOverlay";
        overlay.innerHTML = `
          <div id="paywallBox">
            <h2>✨ ${c.title}</h2>
            <p class="pw-sub">${c.sub(featureKey, name, lang)}</p>
            <div class="pw-plans">
              ${planCard('free', p.free)}
              ${planCard('pro',  p.pro)}
              ${planCard('yolo', p.yolo)}
            </div>
            <div class="pw-btns">
              <a class="pw-btn pw-btn-pro"  href="${_paypalUrl(PAYPAL_PRO_PLAN_ID)}"  target="_blank" rel="noopener">${c.btn_pro}</a>
              <a class="pw-btn pw-btn-yolo" href="${_paypalUrl(PAYPAL_YOLO_PLAN_ID)}" target="_blank" rel="noopener">${c.btn_yolo} ⚡</a>
            </div>
            <div class="pw-code-row">
              <input class="pw-code-input" id="pwCodeInput" placeholder="${c.code_placeholder}" />
              <button class="pw-code-btn" onclick="Paywall.applyCode()">${c.code_btn}</button>
            </div>
            <div class="pw-code-msg" id="pwCodeMsg"></div>
            <button class="pw-dismiss" onclick="document.getElementById('paywallOverlay').remove()">${c.dismiss}</button>
          </div>`;

        overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
        document.body.appendChild(overlay);
    }

    function hide() {
        const el = document.getElementById("paywallOverlay");
        if (el) el.remove();
    }

    async function applyCode() {
        const input = document.getElementById("pwCodeInput");
        const msg   = document.getElementById("pwCodeMsg");
        if (!input || !msg) return;
        const code = input.value.trim();
        if (!code) return;
        msg.className = "pw-code-msg";
        msg.textContent = _lang() === 'he' ? "בודק קוד..." : "Checking...";
        const success = await Plan.redeemCode(code);
        if (success) {
            msg.className = "pw-code-msg ok";
            msg.textContent = _lang() === 'he' ? "✓ קוד תקין! גישה הופעלה." : "✓ Code valid! Access granted.";
            setTimeout(() => { hide(); location.reload(); }, 1200);
        } else {
            msg.className = "pw-code-msg err";
            msg.textContent = _lang() === 'he' ? "קוד לא תקין. נסה שוב." : "Invalid code. Try again.";
            input.value = "";
        }
    }

    // Call this when user hits daily AI quota (e.g., Paywall.showQuota())
    function showQuota() { show("quota"); }

    return { show, hide, applyCode, showQuota };
})();
