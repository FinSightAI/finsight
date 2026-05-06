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
                { icon: '🇧🇷', label: 'Tesouro Direto',    i18n: 'nav.tesouroDireto',   file: prefix + 'tesouro-direto.html',    category: 'tesouro-direto',   market: 'br' },
        { icon: '🏢', label: 'FIIs',                i18n: 'nav.fiis',            file: prefix + 'fiis.html',              category: 'fiis',             market: 'br' },
        { icon: '📄', label: 'Renda Fixa',           i18n: 'nav.rendaFixa',       file: prefix + 'renda-fixa.html',        category: 'renda-fixa',       market: 'br' },
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
        { icon: '🌍', label: 'יועץ השקעות',           i18n: 'nav.investAdvisor',     file: prefix + 'investment-advisor.html',category: 'investment-advisor',pro: true, proKey: 'aiChat' },
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

    // SVG icon map — by category. Falls back to emoji if not found.
    const ICONS = {
        'dashboard':         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
        'bank':              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>',
        'income':            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
        'credit':            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>',
        'stocks':            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l5-5 4 4 8-8"/><path d="M14 8h6v6"/></svg>',
        'stock-analytics':   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
        'assets':            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
        'loans':             '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="6" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
        'subscriptions':     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>',
        'goals':             '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
        'simulator':         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
        'investment-advisor':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
        'ai-chat':           '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
        'ai-story':          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
        'tax-optimizer':     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>',
        'pension-optimizer': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
        'pension-calc':      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="10" y2="10"/><line x1="14" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="10" y2="14"/><line x1="14" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="10" y2="18"/><line x1="14" y1="18" x2="16" y2="18"/></svg>',
        'reports':           '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
        'calendar':          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
        'family':            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
        'health-score':      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
        'profile':           '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
        'settings':          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
        'tesouro-direto':    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
        'fiis':              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M9 12h.01M9 15h.01M14 9h.01M14 12h.01M14 15h.01"/></svg>',
        'renda-fixa':        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/></svg>',
        'market-products':   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>',
        'my-products':       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0"/></svg>',
        'compare-funds':     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>'
    };
    function getIcon(item){ return ICONS[item.category] || '<span style="font-size:14px">'+item.icon+'</span>'; }


    function isActive(item) {
        if (item.category === 'dashboard') return currentFile === 'index.html';
        return currentFile === (item.file || '').split('/').pop();
    }

    function buildItem(item) {
        if (item.submenu) {
            const subActive = item.submenu.some(s => currentFile === s.file.split('/').pop());
            const subItems = item.submenu.filter(s => !s.market || localStorage.getItem('wl_market') === s.market).map(s => {
                const a = subActive && currentFile === s.file.split('/').pop() ? ' active' : '';
                const lockAttr = s.pro ? ` data-pro="${s.proKey}"` : '';
                const lockBadge = s.pro ? ' <span class="pro-lock">Pro</span>' : '';
                const i18nAttr = s.i18n ? ` data-i18n="${s.i18n}"` : '';
                return `<li class="nav-item"><a href="${s.file}" class="nav-link${a}"${lockAttr} data-category="${s.category}"><span class="icon">${getIcon(s)}</span><span${i18nAttr}>${s.label}</span>${lockBadge}</a></li>`;
            }).join('');
            const i18nAttr = item.i18n ? ` data-i18n="${item.i18n}"` : '';
            return `<li class="nav-item">
                <span class="nav-link" style="cursor:default;">
                    <span class="icon">${getIcon(item)}</span>
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
                <span class="icon">${getIcon(item)}</span>
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
    const mkt = localStorage.getItem('wl_market');
    const mktToggle = `<div style="margin-top:10px;">
        <button id="wlMarketToggle" onclick="(function(){
            var m=localStorage.getItem('wl_market');
            if(m==='br'){localStorage.removeItem('wl_market');}else{localStorage.setItem('wl_market','br');}
            location.reload();
        })()" style="width:100%;padding:7px 12px;border-radius:10px;border:1px solid ${mkt==='br'?'rgba(34,197,94,0.4)':'var(--color-border)'};background:${mkt==='br'?'rgba(34,197,94,0.1)':'none'};color:${mkt==='br'?'#22c55e':'var(--color-text-secondary)'};font-size:0.78rem;cursor:pointer;font-family:inherit;text-align:center;">
            ${(function(){const lang=localStorage.getItem('wl_lang')||'he';const labels={he:'שוק ברזיל',en:'Brazilian Market',pt:'Mercado Brasileiro',es:'Mercado Brasileño'};const l=labels[lang]||labels.en;return mkt==='br'?'🇧🇷 '+l+' ✓':'🇧🇷 '+l;}())}
        </button>
    </div>`;
    const wizeAILink = '<a href="https://wizelife.ai/wize-ai.html" target="_blank" style="display:flex;align-items:center;gap:8px;padding:8px 10px;margin-bottom:6px;background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.2);border-radius:10px;text-decoration:none;color:#818cf8;font-size:13px;font-weight:600;">🤖 WizeAI <span style="font-size:10px;opacity:.6;margin-right:auto;">יועץ cross-app</span></a>';
    const footer = wizeAILink + footerBtns + mktToggle + '<div id="sidebarPlanPill" style="margin-top:6px;"></div>';

    const html = `
        <div class="sidebar-header">
            <div class="brand">
                <img src="${imgPrefix}img/logo.png" class="brand-icon" alt="WizeMoney">
                <span class="brand-name">Wize<span class="brand-highlight">Money</span></span>
            </div>
        </div>
        <nav>
            <ul class="nav-menu">
                ${NAV.filter(item => !item.market || localStorage.getItem('wl_market') === item.market).map(buildItem).join('\n')}
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
            '<span id="wl-bar-nick" style="font-size:11px;font-weight:600;color:#6ee7b7;background:rgba(110,231,183,0.1);padding:2px 8px;border-radius:99px;white-space:nowrap;display:none;"></span>' +
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
            el.innerHTML = '<button onclick="if(typeof Paywall!==\'undefined\')Paywall.show(\'upgrade\')" style="width:100%;padding:7px 12px;background:linear-gradient(135deg,rgba(245,158,11,0.12),rgba(239,68,68,0.12));border:1px solid rgba(245,158,11,0.25);border-radius:10px;font-size:0.78rem;font-weight:700;color:#f59e0b;cursor:pointer;font-family:inherit;">'
                + (lang === 'he' ? '⚡ שדרג ל-YOLO' : '⚡ Upgrade to YOLO') + '</button>';
        } else {
            el.innerHTML = '<button onclick="if(typeof Paywall!==\'undefined\')Paywall.show(\'upgrade\')" style="width:100%;padding:7px 12px;background:linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.15));border:1px solid rgba(99,102,241,0.3);border-radius:10px;font-size:0.78rem;font-weight:700;color:#818cf8;cursor:pointer;font-family:inherit;">'
                + (lang === 'he' ? '💎 שדרג ל-Pro' : '💎 Upgrade to Pro') + '</button>';
        }
    }


    function updateWizeBarNick() {
        const el = document.getElementById('wl-bar-nick');
        if (!el) return;
        const stored = localStorage.getItem('wl_nickname');
        const authName = (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser)
            ? (firebase.auth().currentUser.displayName || firebase.auth().currentUser.email) : null;
        const nick = stored || authName;
        if (nick) {
            const short = nick.length > 20 ? nick.substring(0, 18) + '\u2026' : nick;
            el.textContent = '\u25cf ' + short;
            el.style.display = 'inline';
        }
    }

    // Update pill once Plan is ready
    function waitForPlan() {
        if (typeof Plan !== 'undefined') { updatePlanPill(); Plan.onChange(updatePlanPill); }
        else setTimeout(waitForPlan, 300);
    }

    

    // ── WizeMoney right panel injector ──
    function injectRightPanel() {
        if (document.getElementById('wl-money-rpanel')) return;
        // Don't inject on small screens
        if (window.innerWidth < 1280) return;

        const panel = document.createElement('aside');
        panel.id = 'wl-money-rpanel';
        panel.style.cssText = 'position:fixed;top:36px;left:0;width:240px;height:calc(100vh - 36px);background:#060810;border-right:1px solid rgba(255,255,255,0.07);padding:14px;display:flex;flex-direction:column;gap:12px;z-index:50;overflow-y:auto;font-family:Inter,-apple-system,sans-serif;direction:ltr;';
        panel.innerHTML = `
            <div style="font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;font-weight:800;color:#eef2ff;margin-bottom:4px">AI Insights</div>
            <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:12px">
                <div style="font-family:'Plus Jakarta Sans',sans-serif;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:8px">Net Worth</div>
                <div id="wl-rp-networth" style="font-family:'Plus Jakarta Sans',sans-serif;font-size:24px;font-weight:900;color:#10b981;letter-spacing:-0.5px">—</div>
                <div style="font-size:10px;color:#6b7280;margin-top:4px">Connect bank for live data</div>
            </div>
            <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:12px">
                <div style="font-family:'Plus Jakarta Sans',sans-serif;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:8px">Quick Tips</div>
                <div style="font-size:11.5px;color:#94a3b8;line-height:1.55;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.04)">Track all accounts in Bank tab</div>
                <div style="font-size:11.5px;color:#94a3b8;line-height:1.55;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.04)">Set goals to see progress charts</div>
                <div style="font-size:11.5px;color:#94a3b8;line-height:1.55;padding:6px 0">Pro unlocks AI advisor & sims</div>
            </div>
            <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:12px">
                <div style="font-family:'Plus Jakarta Sans',sans-serif;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:8px">WizeAI</div>
                <a href="https://wizelife.ai/wize-ai.html" target="_blank" style="display:flex;align-items:center;gap:6px;text-decoration:none;color:#a5b4fc;font-size:12px;font-weight:600;padding:8px;background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.2);border-radius:8px">🤖 Cross-app advisor →</a>
            </div>
        `;
        document.body.appendChild(panel);

        // Add main padding-left to account for panel
        const s = document.createElement('style');
        s.textContent = '@media (min-width: 1280px) { main, .main-content, .container, body > *:not(#wl-bar):not(#wl-money-rpanel):not(aside.sidebar):not(#wlThemeToggle):not(#globalLangSwitcher) { padding-left: 240px !important; box-sizing: border-box; } }';
        document.head.appendChild(s);

        // Try to populate net worth if Plan/data is available
        setTimeout(() => {
            try {
                const nw = window.NetWorthCalculator?.getCurrent?.() || window.netWorth;
                if (typeof nw === 'number') {
                    document.getElementById('wl-rp-networth').textContent = '₪' + nw.toLocaleString();
                }
            } catch(e) {}
        }, 800);
    }

    function inject() {
        injectWizeBar();
        updateWizeBarNick();
        // re-check once Firebase Auth resolves
        if (typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().onAuthStateChanged(function() { updateWizeBarNick(); });
        }
        const aside = document.querySelector('aside.sidebar');
        if (aside) {
            aside.innerHTML = html;
            attachProGates(aside);
        }
        injectThemeToggle();
        injectRightPanel();
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
