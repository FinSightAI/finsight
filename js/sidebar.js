/**
 * sidebar.js — Dynamic sidebar generator
 * Renders the nav sidebar into <aside class="sidebar"> on every page.
 * Determines root vs pages/ prefix from window.location, marks the active item.
 */
(function () {
    // Detect whether we're at root or inside pages/
    const path = window.location.pathname;
    const inPages = path.includes('/pages/');
    const prefix = inPages ? '' : 'pages/';
    const imgPrefix = inPages ? '../' : './';

    // Current page filename (e.g. "bank.html")
    const currentFile = path.split('/').pop() || 'index.html';

    // Nav definition — single source of truth
    // Each item: { icon, label, file, category, pro?, proKey? }
    const NAV = [
        { icon: '🏠', label: 'דאשבורד',           i18n: 'nav.dashboard',         file: inPages ? '../index.html' : 'index.html', category: 'dashboard' },
        { icon: '🏦', label: 'חשבונות בנק',         i18n: 'nav.bankAccounts',      file: prefix + 'bank.html',              category: 'bank' },
        { icon: '💰', label: 'מעקב הכנסות',          i18n: 'nav.income',            file: prefix + 'income.html',            category: 'income' },
        { icon: '💳', label: 'כרטיסי אשראי',         i18n: 'nav.creditCards',       file: prefix + 'credit.html',            category: 'credit' },
        { icon: '📈', label: 'מניות',                i18n: 'nav.stocks',            file: prefix + 'stocks.html',            category: 'stocks',           pro: true, proKey: 'stocks' },
        { icon: '📊', label: 'אנליטיקת תיק',          i18n: 'nav.stockAnalytics',    file: prefix + 'stock-analytics.html',   category: 'stock-analytics',  pro: true, proKey: 'stocks' },
        {
            icon: '📊', label: 'מוצרים פיננסיים', i18n: 'nav.financialProducts',
            submenu: [
                { icon: '🏪', label: 'מוצרים בשוק',   i18n: 'nav.marketProducts', file: prefix + 'market-products.html', category: 'market-products' },
                { icon: '💎', label: 'החסכונות שלי',  i18n: 'nav.myProducts',     file: prefix + 'my-funds.html',        category: 'my-products' },
                { icon: '⚖️', label: 'השוואת מוצרים', i18n: 'nav.compareFunds',   file: prefix + 'compare-funds.html',   category: 'compare-funds',  pro: true, proKey: 'compareFunds' },
            ]
        },
        { icon: '🏠', label: 'נכסים',                i18n: 'nav.assets',            file: prefix + 'assets.html',            category: 'assets' },
        { icon: '🏦', label: 'הלוואות',               i18n: 'nav.loans',             file: prefix + 'loans.html',             category: 'loans' },
        { icon: '🔄', label: 'תשלומים קבועים',        i18n: 'nav.subscriptions',     file: prefix + 'subscriptions.html',     category: 'subscriptions' },
        { icon: '🎯', label: 'יעדי חיסכון',           i18n: 'nav.goals',             file: prefix + 'goals.html',             category: 'goals' },
        { icon: '⏳', label: 'סימולטור מה היה קורה',   i18n: 'nav.simulator',         file: prefix + 'simulator.html',         category: 'simulator',        pro: true, proKey: 'simulator' },
        { icon: '🤖', label: 'יועץ AI',               i18n: 'nav.aiChat',            file: prefix + 'ai-chat.html',           category: 'ai-chat',          pro: true, proKey: 'aiChat' },
        { icon: '✨', label: 'סיפור השבוע',            i18n: 'nav.aiStory',           file: prefix + 'ai-story.html',          category: 'ai-story',         pro: true, proKey: 'aiStory' },
        { icon: '🧾', label: 'מייעל מס',              i18n: 'nav.taxOptimizer',      file: prefix + 'tax-optimizer.html',     category: 'tax-optimizer',    pro: true, proKey: 'taxOptimizer' },
        { icon: '🎯', label: 'אופטימיזטור פנסיה',     i18n: 'nav.pensionOptimizer',  file: prefix + 'pension-optimizer.html', category: 'pension-optimizer',pro: true, proKey: 'pensionOptimizer' },
        { icon: '🧮', label: 'מחשבון פנסיה',          i18n: 'nav.pensionCalc',       file: prefix + 'pension-calc.html',      category: 'pension-calc' },
        { icon: '📋', label: 'דוחות',                 i18n: 'nav.reports',           file: prefix + 'reports.html',           category: 'reports',          pro: true, proKey: 'reports' },
        { icon: '📅', label: 'לוח שנה פיננסי',        i18n: 'nav.calendar',          file: prefix + 'calendar.html',          category: 'calendar' },
        { icon: '👨‍👩‍👧‍👦', label: 'דשבורד משפחתי',     i18n: 'nav.family',            file: prefix + 'family.html',            category: 'family',           pro: true, proKey: 'multiProfile' },
        { icon: '🩺', label: 'בריאות פיננסית',        i18n: 'nav.healthScore',       file: prefix + 'health-score.html',      category: 'health-score' },
        { icon: '👤', label: 'פרופיל פיננסי',          i18n: 'nav.profile',           file: prefix + 'profile.html',           category: 'profile' },
        { icon: '⚙️', label: 'הגדרות',                i18n: 'nav.settings',          file: prefix + 'settings.html',          category: 'settings' },
    ];

    function isActive(item) {
        if (item.category === 'dashboard') return currentFile === 'index.html';
        return currentFile === (item.file || '').split('/').pop();
    }

    function buildItem(item) {
        if (item.submenu) {
            const subActive = item.submenu.some(s => currentFile === s.file.split('/').pop());
            const subItems = item.submenu.map(s => {
                const a = subActive && currentFile === s.file.split('/').pop() ? ' active' : '';
                const lockAttr = s.pro ? ` data-pro="${s.proKey}"` : '';
                const lockBadge = s.pro ? ' <span class="pro-lock">Pro</span>' : '';
                const i18nAttr = s.i18n ? ` data-i18n="${s.i18n}"` : '';
                return `<li class="nav-item"><a href="${s.file}" class="nav-link${a}"${lockAttr} data-category="${s.category}"><span class="icon">${s.icon || ''}</span><span${i18nAttr}>${s.label}</span>${lockBadge}</a></li>`;
            }).join('');
            const i18nAttr = item.i18n ? ` data-i18n="${item.i18n}"` : '';
            return `<li class="nav-item">
                <span class="nav-link" style="cursor:default;">
                    <span class="icon">${item.icon}</span>
                    <span${i18nAttr}>${item.label}</span>
                </span>
                <ul class="nav-submenu">${subItems}</ul>
            </li>`;
        }
        const active = isActive(item) ? ' active' : '';
        const lockAttr = item.pro ? ` data-pro="${item.proKey}"` : '';
        const lockBadge = item.pro ? ' <span class="pro-lock">Pro</span>' : '';
        const i18nAttr = item.i18n ? ` data-i18n="${item.i18n}"` : '';
        return `<li class="nav-item">
            <a href="${item.file}" class="nav-link${active}"${lockAttr} data-category="${item.category || ''}">
                <span class="icon">${item.icon}</span>
                <span${i18nAttr}>${item.label}${lockBadge}</span>
            </a>
        </li>`;
    }

    const footerBtns = inPages ? '' : `
        <div style="display:flex;gap:10px;">
            <button class="btn btn-secondary btn-sm" onclick="if(typeof Plan!=='undefined'&&!Plan.check('export'))return;ExportManager.showExportOptions()">
                <span>📤</span><span data-i18n="nav.export">ייצוא</span>
            </button>
            <button class="btn btn-secondary btn-sm" id="importDataBtn">
                <span>📥</span><span data-i18n="nav.import">ייבוא</span>
            </button>
        </div>`;
    const footer = footerBtns + '<div id="sidebarPlanPill" style="margin-top:10px;"></div>';

    const html = `
        <div class="sidebar-header">
            <div class="brand">
                <img src="${imgPrefix}img/logo.png" class="brand-icon" alt="WizeMoney">
                <span class="brand-name">Wize<span class="brand-highlight">Money</span></span>
            </div>
        </div>
        <nav>
            <ul class="nav-menu">
                ${NAV.map(buildItem).join('\n')}
            </ul>
        </nav>
        <div class="sidebar-footer">${footer}</div>`;

    // Theme toggle — floats bottom-left
    function injectThemeToggle() {
        if (document.getElementById('wlThemeToggle')) return;
        var btn = document.createElement('button');
        btn.id = 'wlThemeToggle';
        var light = localStorage.getItem('wl_theme') === 'light';
        if (light) document.body.classList.add('light');
        btn.textContent = light ? '🌙' : '☀️';
        btn.title = 'Toggle theme';
        btn.style.cssText = 'position:fixed;bottom:16px;left:16px;z-index:1200;width:36px;height:36px;border-radius:50%;background:var(--color-bg-card,rgba(255,255,255,0.06));border:1px solid var(--color-border,rgba(255,255,255,0.12));font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.15);transition:all 0.2s;';
        btn.onclick = function() {
            var isLight = document.body.classList.toggle('light');
            localStorage.setItem('wl_theme', isLight ? 'light' : 'dark');
            btn.textContent = isLight ? '🌙' : '☀️';
        };
        document.body.appendChild(btn);
    }

    // Language switcher — floats in the corner opposite the sidebar
    function injectLangSwitcher() {
        if (document.getElementById('globalLangSwitcher')) return;
        const sw = document.createElement('div');
        sw.id = 'globalLangSwitcher';
        sw.innerHTML =
            '<button class="lang-btn" data-lang="he" onclick="I18n.setLanguage(\'he\')">HE</button>' +
            '<button class="lang-btn" data-lang="en" onclick="I18n.setLanguage(\'en\')">EN</button>' +
            '<button class="lang-btn" data-lang="pt" onclick="I18n.setLanguage(\'pt\')">PT</button>' +
            '<button class="lang-btn" data-lang="es" onclick="I18n.setLanguage(\'es\')">ES</button>';
        sw.style.cssText =
            'position:fixed;top:46px;z-index:1200;' +
            'display:flex;gap:4px;' +
            'background:rgba(255,255,255,0.06);' +
            'border:1px solid rgba(255,255,255,0.12);' +
            'border-radius:8px;padding:4px 6px;backdrop-filter:blur(8px);';

        // Position on the side OPPOSITE the sidebar
        // RTL (Hebrew) → sidebar is on the right → switcher goes to the left
        // LTR (English) → sidebar is on the left  → switcher goes to the right
        function positionSwitcher() {
            const isRtl = document.documentElement.dir === 'rtl' ||
                          document.documentElement.lang === 'he';
            sw.style.left  = isRtl  ? '14px' : 'unset';
            sw.style.right = !isRtl ? '14px' : 'unset';
            // Highlight active lang
            sw.querySelectorAll('.lang-btn').forEach(btn => {
                const active = btn.getAttribute('data-lang') ===
                    (typeof I18n !== 'undefined' ? I18n.currentLanguage : 'he');
                btn.classList.toggle('active', active);
            });
        }

        document.body.appendChild(sw);
        positionSwitcher();
        // Re-position whenever language changes (i18n.js calls translatePage → updates .lang-btn.active)
        const origSetLang = typeof I18n !== 'undefined' && I18n.setLanguage;
        if (origSetLang) {
            const _orig = I18n.setLanguage.bind(I18n);
            I18n.setLanguage = function(lang) { _orig(lang); positionSwitcher(); };
        }
        // Also re-run after a short delay to catch i18n init
        setTimeout(positionSwitcher, 300);
    }

    // Inject as soon as possible — script is deferred, so DOM is ready
    function injectWizeBar() {
        if (document.getElementById('wl-bar')) return;
        const bar = document.createElement('div');
        bar.id = 'wl-bar';
        bar.style.cssText = 'position:fixed;top:0;left:0;right:0;height:36px;z-index:99999;background:rgba(5,6,15,0.96);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom:1px solid rgba(255,255,255,0.07);display:flex;align-items:center;justify-content:space-between;padding:0 16px;font-family:Inter,-apple-system,sans-serif;box-sizing:border-box;direction:ltr;';
        const l = localStorage.getItem('wl_lang') || 'he';
        const arrowMap = {he:'← כל הכלים',en:'← All Tools',pt:'← Todas as ferramentas',es:'← Todas las herramientas'};
        const arrow = arrowMap[l] || '← All Tools';
        const LANGS = ['he','en','pt','es'];
        const pillCSS = (active) => `background:${active?'rgba(16,185,129,0.18)':'none'};border:none;color:${active?'#10b981':'#6b7280'};padding:3px 7px;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;letter-spacing:.4px;`;
        const langPills = LANGS.map(lng =>
            `<button data-wl-lang="${lng}" onclick="(function(l){localStorage.setItem('wl_lang',l);if(typeof I18n!=='undefined')I18n.setLanguage(l);document.getElementById('wl-bar').querySelectorAll('[data-wl-lang]').forEach(function(b){b.style.cssText='${pillCSS(false)}';if(b.getAttribute('data-wl-lang')===l)b.style.cssText='${pillCSS(true)}'});})('${lng}')" style="${pillCSS(lng===l)}">${lng==='he'?'עב':lng.toUpperCase()}</button>`
        ).join('');
        bar.innerHTML =
            '<a href="https://finsightai.github.io/wizelife/dashboard.html" style="display:flex;align-items:center;gap:8px;text-decoration:none;line-height:1;">' +
            '<svg width="20" height="20" viewBox="0 0 100 100" style="flex-shrink:0"><defs><linearGradient id="wlbg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6366f1"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs><rect width="100" height="100" rx="22" fill="url(#wlbg)"/><text x="50" y="72" text-anchor="middle" font-family="Arial Black,sans-serif" font-weight="900" font-size="58" fill="white">W</text></svg>' +
            '<span style="font-size:13px;font-weight:700;color:#eef2ff;letter-spacing:-0.3px;">WizeLife</span>' +
            '<span style="font-size:11px;font-weight:600;color:#10b981;background:rgba(16,185,129,0.12);padding:2px 8px;border-radius:99px;line-height:1.4;">WizeMoney</span></a>' +
            '<div style="display:flex;align-items:center;gap:10px;">' +
            '<div style="display:flex;gap:2px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:8px;padding:3px;">' + langPills + '</div>' +
            '<a href="https://finsightai.github.io/wizelife/dashboard.html" style="font-size:12px;color:#7b88ad;text-decoration:none;font-weight:500;white-space:nowrap;">' + arrow + '</a>' +
            '</div>';
        document.body.prepend(bar);
        const s = document.createElement('style');
        s.textContent = 'body{padding-top:36px!important}.sidebar{top:36px!important;height:calc(100vh - 36px)!important}';
        document.head.appendChild(s);
    }


    function updatePlanPill() {
        const el = document.getElementById('sidebarPlanPill');
        if (!el || typeof Plan === 'undefined') return;
        const lang = (typeof I18n !== 'undefined' && I18n.currentLang) || localStorage.getItem('wl_lang') || 'he';
        if (Plan.isYolo()) {
            el.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;gap:6px;padding:7px 12px;background:linear-gradient(135deg,rgba(245,158,11,0.15),rgba(239,68,68,0.15));border:1px solid rgba(245,158,11,0.3);border-radius:10px;font-size:0.78rem;font-weight:700;color:#f59e0b;">⚡ YOLO</div>';
        } else if (Plan.isPro()) {
            el.innerHTML = '<button onclick="if(typeof Paywall!=='undefined')Paywall.show('upgrade')" style="width:100%;padding:7px 12px;background:linear-gradient(135deg,rgba(245,158,11,0.12),rgba(239,68,68,0.12));border:1px solid rgba(245,158,11,0.25);border-radius:10px;font-size:0.78rem;font-weight:700;color:#f59e0b;cursor:pointer;font-family:inherit;">'
                + (lang === 'he' ? '⚡ שדרג ל-YOLO' : '⚡ Upgrade to YOLO') + '</button>';
        } else {
            el.innerHTML = '<button onclick="if(typeof Paywall!=='undefined')Paywall.show('upgrade')" style="width:100%;padding:7px 12px;background:linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.15));border:1px solid rgba(99,102,241,0.3);border-radius:10px;font-size:0.78rem;font-weight:700;color:#818cf8;cursor:pointer;font-family:inherit;">'
                + (lang === 'he' ? '💎 שדרג ל-Pro' : '💎 Upgrade to Pro') + '</button>';
        }
    }

    // Update pill once Plan is ready
    function waitForPlan() {
        if (typeof Plan !== 'undefined') { updatePlanPill(); Plan.onChange(updatePlanPill); }
        else setTimeout(waitForPlan, 300);
    }
    function inject() {
        injectWizeBar();
        const aside = document.querySelector('aside.sidebar');
        if (aside) {
            aside.innerHTML = html;
            attachProGates(aside);
        }
        injectThemeToggle();
        // Apply current language to sidebar labels
        if (typeof I18n !== 'undefined') I18n.translatePage();
        else setTimeout(() => { if (typeof I18n !== 'undefined') I18n.translatePage(); }, 200);
    }

    function attachProGates(aside) {
        aside.querySelectorAll('[data-pro]').forEach(link => {
            link.addEventListener('click', (e) => {
                if (typeof Plan === 'undefined') return; // plan.js not loaded yet
                if (!Plan.isPro()) {
                    e.preventDefault();
                    Paywall.show(link.dataset.pro);
                }
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => { inject(); waitForPlan(); });
    } else {
        inject();
        waitForPlan();
    }
})();
