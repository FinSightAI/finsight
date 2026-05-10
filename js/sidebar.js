/**
 * sidebar.js — Dynamic sidebar generator
 * Renders the nav sidebar into <aside class="sidebar"> on every page.
 * Determines root vs pages/ prefix from window.location, marks the active item.
 */
(function () {
    // ── Microsoft Clarity (loads once on every page via this shared script) ──
    try {
        if (!window.clarity) {
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "wnvlwv7gu0");
        }
    } catch(e) {}

    // ── WL SSO bridge: read wl_token + wl_nick from URL, save to wl_sso ──
    try {
        var _p = new URLSearchParams(window.location.search);
        var _t = _p.get('wl_token'), _n = _p.get('wl_nick');
        if (_t || _n) {
            var _st = JSON.parse(localStorage.getItem('wl_sso') || '{}');
            if (_t) {
                _st.token = _t;
                try {
                    var _pl = JSON.parse(atob(_t.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));
                    if (_pl.email) _st.email = _pl.email;
                    if (_pl.user_id) _st.uid = _pl.user_id;
                } catch(e) {}
            }
            if (_n) _st.nick = decodeURIComponent(_n);
            // Read wl_plan from URL too
            var _plan = _p.get('wl_plan');
            if (_plan && ['pro', 'yolo', 'free'].includes(_plan)) {
                _st.plan = _plan;
                localStorage.setItem('wl_plan', _plan);
                // Set a synthetic access code so plan persists
                if (_plan !== 'free') localStorage.setItem('wl_access_code', 'WL_SSO_' + _plan.toUpperCase());
            }
            localStorage.setItem('wl_sso', JSON.stringify(_st));
            if (_n) localStorage.setItem('wl_nickname', decodeURIComponent(_n));
            // Clean URL
            var _url = new URL(window.location.href);
            _url.searchParams.delete('wl_token');
            _url.searchParams.delete('wl_nick');
            _url.searchParams.delete('wl_plan');
            window.history.replaceState({}, '', _url.toString());
        }
    } catch(e) {}

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
        { icon: '🏠', label: 'דאשבורד', i18n: 'nav.dashboard', file: inPages ? '../index.html' : 'index.html', category: 'dashboard' },

        // ── חשבונות (Bank, Income, Credit, Loans, Subscriptions) ──
        {
            icon: '🏦', label: 'חשבונות', i18n: 'nav.accounts',
            submenu: [
                { icon: '🏦', label: 'חשבונות בנק', i18n: 'nav.bankAccounts', file: prefix + 'bank.html', category: 'bank' },
                { icon: '💰', label: 'מעקב הכנסות', i18n: 'nav.income', file: prefix + 'income.html', category: 'income' },
                { icon: '💳', label: 'כרטיסי אשראי', i18n: 'nav.creditCards', file: prefix + 'credit.html', category: 'credit' },
                { icon: '🏦', label: 'הלוואות', i18n: 'nav.loans', file: prefix + 'loans.html', category: 'loans' },
                { icon: '🔄', label: 'תשלומים קבועים', i18n: 'nav.subscriptions', file: prefix + 'subscriptions.html', category: 'subscriptions' },
            ]
        },

        // ── השקעות (Stocks, Analytics, Investment Advisor) ──
        {
            icon: '📈', label: 'השקעות', i18n: 'nav.investments',
            submenu: [
                { icon: '📈', label: 'מניות', i18n: 'nav.stocks', file: prefix + 'stocks.html', category: 'stocks', pro: true, proKey: 'stocks' },
                { icon: '📊', label: 'אנליטיקת תיק', i18n: 'nav.stockAnalytics', file: prefix + 'stock-analytics.html', category: 'stock-analytics', pro: true, proKey: 'stocks' },
                { icon: '🏛️', label: 'סקטורים', i18n: 'nav.sectors', file: prefix + 'sectors.html', category: 'sectors' },
                { icon: '🌍', label: 'יועץ השקעות', i18n: 'nav.investAdvisor', file: prefix + 'investment-advisor.html', category: 'investment-advisor', pro: true, proKey: 'aiChat' },
            ]
        },

        // ── מוצרים פיננסיים (existing submenu — kept) ──
        {
            icon: '📊', label: 'מוצרים פיננסיים', i18n: 'nav.financialProducts',
            submenu: [
                { icon: '🇧🇷', label: 'Tesouro Direto', i18n: 'nav.tesouroDireto', file: prefix + 'tesouro-direto.html', category: 'tesouro-direto', market: 'br' },
                { icon: '🏢', label: 'FIIs', i18n: 'nav.fiis', file: prefix + 'fiis.html', category: 'fiis', market: 'br' },
                { icon: '📄', label: 'Renda Fixa', i18n: 'nav.rendaFixa', file: prefix + 'renda-fixa.html', category: 'renda-fixa', market: 'br' },
                { icon: '🏪', label: 'מוצרים בשוק', i18n: 'nav.marketProducts', file: prefix + 'market-products.html', category: 'market-products' },
                { icon: '💎', label: 'החסכונות שלי', i18n: 'nav.myProducts', file: prefix + 'my-funds.html', category: 'my-products' },
                { icon: '⚖️', label: 'השוואת מוצרים', i18n: 'nav.compareFunds', file: prefix + 'compare-funds.html', category: 'compare-funds', pro: true, proKey: 'compareFunds' },
            ]
        },

        { icon: '🏠', label: 'נכסים', i18n: 'nav.assets', file: prefix + 'assets.html', category: 'assets' },

        // ── תכנון (Goals, Simulator, Pension, Tax) ──
        {
            icon: '🎯', label: 'תכנון', i18n: 'nav.planning',
            submenu: [
                { icon: '🎯', label: 'יעדי חיסכון', i18n: 'nav.goals', file: prefix + 'goals.html', category: 'goals' },
                { icon: '⏳', label: 'סימולטור', i18n: 'nav.simulator', file: prefix + 'simulator.html', category: 'simulator', pro: true, proKey: 'simulator' },
                { icon: '🧮', label: 'מחשבון פנסיה', i18n: 'nav.pensionCalc', file: prefix + 'pension-calc.html', category: 'pension-calc' },
                { icon: '🎯', label: 'אופטימיזטור פנסיה', i18n: 'nav.pensionOptimizer', file: prefix + 'pension-optimizer.html', category: 'pension-optimizer', pro: true, proKey: 'pensionOptimizer' },
                { icon: '🧾', label: 'מייעל מס', i18n: 'nav.taxOptimizer', file: prefix + 'tax-optimizer.html', category: 'tax-optimizer', pro: true, proKey: 'taxOptimizer' },
                { icon: '📅', label: 'לוח שנה', i18n: 'nav.calendar', file: prefix + 'calendar.html', category: 'calendar' },
            ]
        },

        // ── AI Tools (Chat, Story, Reports) ──
        {
            icon: '🤖', label: 'AI', i18n: 'nav.aiTools',
            submenu: [
                { icon: '🤖', label: 'יועץ AI', i18n: 'nav.aiChat', file: prefix + 'ai-chat.html', category: 'ai-chat', pro: true, proKey: 'aiChat' },
                { icon: '✨', label: 'סיפור השבוע', i18n: 'nav.aiStory', file: prefix + 'ai-story.html', category: 'ai-story', pro: true, proKey: 'aiStory' },
                { icon: '📋', label: 'דוחות', i18n: 'nav.reports', file: prefix + 'reports.html', category: 'reports', pro: true, proKey: 'reports' },
            ]
        },

        // ── חשבון (Family, Health Score, Profile, Settings) ──
        {
            icon: '👤', label: 'חשבון', i18n: 'nav.account',
            submenu: [
                { icon: '👨‍👩‍👧‍👦', label: 'דשבורד משפחתי', i18n: 'nav.family', file: prefix + 'family.html', category: 'family', pro: true, proKey: 'multiProfile' },
                { icon: '🩺', label: 'בריאות פיננסית', i18n: 'nav.healthScore', file: prefix + 'health-score.html', category: 'health-score' },
                { icon: '👤', label: 'פרופיל פיננסי', i18n: 'nav.profile', file: prefix + 'profile.html', category: 'profile' },
                { icon: '⚙️', label: 'הגדרות', i18n: 'nav.settings', file: prefix + 'settings.html', category: 'settings' },
            ]
        },
    ];

    // SVG icon map — by category. Falls back to emoji if not found.
    const ICONS = {
        'dashboard':         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
        'bank':              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>',
        'income':            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
        'credit':            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>',
        'stocks':            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l5-5 4 4 8-8"/><path d="M14 8h6v6"/></svg>',
        'stock-analytics':   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
        'sectors':           '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V8l4-4 4 4v13M13 21V12l4-4 4 4v9"/></svg>',
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
            const groupKey = item.i18n || item.label;
            // Default closed unless this group contains the active page
            const openByDefault = subActive;
            let isOpen;
            try {
                const stored = localStorage.getItem('wl_nav_open_' + groupKey);
                isOpen = stored === null ? openByDefault : stored === '1';
            } catch(e) { isOpen = openByDefault; }
            const openCls = isOpen ? ' open' : '';
            return `<li class="nav-item nav-group${openCls}" data-group="${groupKey}">
                <span class="nav-link nav-group-toggle" style="cursor:pointer;user-select:none;" onclick="(function(li){const o=li.classList.toggle('open');try{localStorage.setItem('wl_nav_open_'+li.dataset.group,o?'1':'0');}catch(e){}})(this.parentElement)">
                    <span class="icon">${getIcon(item)}</span>
                    <span${i18nAttr}>${item.label}</span>
                    <span class="nav-chevron" style="margin-inline-start:auto;font-size:10px;opacity:.6;transition:transform .2s;">▾</span>
                </span>
                <ul class="nav-submenu">${subItems}</ul>
            </li>`;
        }
        const active = isActive(item) ? ' active' : '';
        const lockAttr = item.pro ? ` data-pro="${item.proKey}"` : '';
        // Hide "Pro" badges while paywall is off — they confuse users when
        // the features are actually accessible. Plan logic still tracks
        // item.pro for when PAYWALL_ACTIVE flips on.
        const _showProBadge = (typeof Plan !== 'undefined' && Plan.isPaywallActive && Plan.isPaywallActive());
        const lockBadge = (item.pro && _showProBadge) ? ' <span class="pro-lock">Pro</span>' : '';
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
    const _wizeAILang = localStorage.getItem('wl_lang') || 'he';
    const _wizeAITagline = ({ he: 'יועץ חוצה-אפליקציות', en: 'Cross-app advisor', pt: 'Consultor multi-app', es: 'Asesor entre apps' })[_wizeAILang] || 'Cross-app advisor';
    const wizeAILink = `<a href="https://wizelife.ai/wize-ai.html" target="_blank" style="display:flex;align-items:center;gap:8px;padding:8px 10px;margin-bottom:6px;background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.2);border-radius:10px;text-decoration:none;color:#818cf8;font-size:13px;font-weight:600;">🤖 WizeAI <span style="font-size:10px;opacity:.6;margin-inline-start:auto;">${_wizeAITagline}</span></a>`;
    // Plan pill at bottom removed — top WizeBar already shows plan/nick.
    const footer = wizeAILink + footerBtns + mktToggle;

    const html = `
        <div class="sidebar-header">
            <div class="brand">
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
            `<button data-wl-lang="${lng}" onclick="(function(l){localStorage.setItem('wl_lang',l);if(typeof I18n!=='undefined')I18n.setLanguage(l);document.getElementById('wl-bar').querySelectorAll('[data-wl-lang]').forEach(function(b){b.style.cssText='${pillCSS(false)}';if(b.getAttribute('data-wl-lang')===l)b.style.cssText='${pillCSS(true)}'});})('${lng}')" style="${pillCSS(lng===l)}">${lng.toUpperCase()}</button>`
        ).join('');
        bar.innerHTML =
            '<a href="https://finsightai.github.io/wizelife/dashboard.html" style="display:flex;align-items:center;gap:8px;text-decoration:none;line-height:1;">' +
            '<svg width="20" height="20" viewBox="0 0 100 100" style="flex-shrink:0"><defs><linearGradient id="wlbg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6366f1"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs><rect width="100" height="100" rx="22" fill="url(#wlbg)"/><text x="50" y="72" text-anchor="middle" font-family="Arial Black,sans-serif" font-weight="900" font-size="58" fill="white">W</text></svg>' +
            '<span style="font-size:13px;font-weight:800;color:#eef2ff;letter-spacing:-0.3px;font-family:Plus Jakarta Sans,sans-serif;">WizeLife</span>' +
            '<span style="font-size:11px;font-weight:600;color:#10b981;background:rgba(16,185,129,0.12);padding:2px 8px;border-radius:99px;line-height:1.4;">WizeMoney</span></a>' +
            '<div style="display:flex;align-items:center;gap:10px;">' +
            /* Hidden on mobile (lang lives in the hamburger drawer there).
               Inline display is set via JS below to dodge any CSS specificity surprises. */
            '<div class="wl-bar-lang" style="gap:2px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:8px;padding:3px;">' + langPills + '</div>' +
            '<span id="wl-bar-plan" style="display:none;font-family:Plus Jakarta Sans,sans-serif;font-size:11px;font-weight:800;letter-spacing:.5px;padding:3px 10px;border-radius:99px;background:rgba(99,102,241,0.15);color:#a5b4fc;border:1px solid rgba(99,102,241,0.25);white-space:nowrap;">FREE</span>' +
            '<span id="wl-bar-nick" style="font-size:11px;font-weight:600;color:#6ee7b7;background:rgba(110,231,183,0.1);padding:2px 8px;border-radius:99px;white-space:nowrap;display:none;"></span>' +
            '<a href="https://finsightai.github.io/wizelife/dashboard.html" style="font-size:12px;color:#7b88ad;text-decoration:none;font-weight:500;white-space:nowrap;">' + arrow + '</a>' +
            '</div>';
        document.body.prepend(bar);

    /* Hide WizeBar lang pills + floating lang switcher on mobile (inline JS so
       no CSS specificity surprise). On mobile both live in the hamburger drawer. */
    function applyMobileVisibility(){
      var mobile = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
      var lang = bar.querySelector('.wl-bar-lang');
      if (lang) lang.style.display = mobile ? 'none' : 'flex';
      var floating = document.getElementById('globalLangSwitcher');
      if (floating) floating.style.display = mobile ? 'none' : '';
    }
    applyMobileVisibility();
    window.addEventListener('resize', applyMobileVisibility);

    // Hook Firebase auth state to refresh link status
    try {
        if (typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().onAuthStateChanged(function() {
                setTimeout(function(){ updateWizeBarPlan(); updateWizeBarLink(); }, 100);
            });
        }
    } catch(e) {}
        const s = document.createElement('style');
        s.textContent =
            'body{padding-top:36px!important}.sidebar{top:36px!important;height:calc(100vh - 36px)!important}'
            /* Hide WizeBar lang pills + floating lang switcher on mobile —
               they live inside the sidebar (hamburger drawer) instead. */
            + '@media (max-width: 768px){'
            + '  .wl-bar-lang,#globalLangSwitcher{display:none !important;}'
            /* Defensive: kill the legacy .mobile-tab-bar in case any old
               cached app.js still creates it. The shared #wize-bottom-nav
               replaces it. */
            + '  .mobile-tab-bar{display:none !important;}'
            + '}';
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


    
    function updateWizeBarPlan() {
        const el = document.getElementById('wl-bar-plan');
        const signin = document.getElementById('wl-bar-signin');
        if (!el) return;

        // Resolve auth state. We are "logged in" if either firebase.auth has
        // a user OR an SSO token exists in localStorage.
        let isAuthed = false;
        try {
            if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser) isAuthed = true;
        } catch(e) {}
        try {
            const sso = JSON.parse(localStorage.getItem('wl_sso') || '{}');
            if (sso.token || sso.email) isAuthed = true;
        } catch(e) {}

        if (!isAuthed) {
            // Not logged in: show prominent Sign in pill, hide plan badge + nick
            if (signin) signin.style.display = 'inline-flex';
            el.style.display = 'none';
            const nick = document.getElementById('wl-bar-nick');
            if (nick) nick.style.display = 'none';
            return;
        }

        // Logged in: hide sign-in pill, show plan
        if (signin) signin.style.display = 'none';
        el.style.display = 'inline-flex';

        let plan = 'free';
        try {
            if (typeof Plan !== 'undefined' && Plan.get) {
                const p = Plan.get();
                if (p) plan = p;
            }
        } catch(e) {}
        if (plan === 'free' || !plan) plan = localStorage.getItem('wl_plan') || 'free';
        const labels = { yolo: '⚡ YOLO', pro: '✦ PRO', free: 'FREE', pro_trial: '✦ PRO' };
        el.textContent = labels[plan] || 'FREE';
        if (plan === 'yolo') {
            el.style.background = 'linear-gradient(135deg,rgba(245,158,11,0.2),rgba(239,68,68,0.2))';
            el.style.color = '#fbbf24';
            el.style.borderColor = 'rgba(245,158,11,0.35)';
        } else if (plan === 'pro' || plan === 'pro_trial') {
            el.style.background = 'rgba(16,185,129,0.18)';
            el.style.color = '#34d399';
            el.style.borderColor = 'rgba(16,185,129,0.35)';
        } else {
            el.style.background = 'rgba(99,102,241,0.15)';
            el.style.color = '#a5b4fc';
            el.style.borderColor = 'rgba(99,102,241,0.25)';
        }
    }

    // Show link status: connected user vs WizeLife SSO user
    function updateWizeBarLink() {
        const el = document.getElementById('wl-bar-link');
        if (!el) return;
        let ssoEmail = null, fbEmail = null, fbUid = null;
        try {
            const sso = JSON.parse(localStorage.getItem('wl_sso') || '{}');
            ssoEmail = sso.email || null;
        } catch(e) {}
        try {
            if (typeof firebase !== 'undefined' && firebase.auth) {
                const u = firebase.auth().currentUser;
                if (u) { fbEmail = u.email; fbUid = u.uid; }
            }
        } catch(e) {}
        // No data to display
        if (!ssoEmail && !fbEmail) {
            el.style.display = 'none';
            return;
        }
        el.style.display = 'inline-flex';
        // Match
        if (ssoEmail && fbEmail && ssoEmail.toLowerCase() === fbEmail.toLowerCase()) {
            el.textContent = '✓ ' + (fbEmail.length > 22 ? fbEmail.slice(0,20)+'…' : fbEmail);
            el.style.background = 'rgba(16,185,129,0.12)';
            el.style.color = '#34d399';
            el.style.border = '1px solid rgba(16,185,129,0.3)';
            el.title = 'מקושר ל-WizeLife: ' + fbEmail;
        } else if (fbEmail && !ssoEmail) {
            el.textContent = fbEmail.length > 22 ? fbEmail.slice(0,20)+'…' : fbEmail;
            el.style.background = 'rgba(99,102,241,0.12)';
            el.style.color = '#a5b4fc';
            el.style.border = '1px solid rgba(99,102,241,0.25)';
            el.title = 'חשבון WizeMoney: ' + fbEmail + ' — לא מחובר ל-WizeLife';
        } else if (ssoEmail && !fbEmail) {
            el.textContent = '⚠ ' + (ssoEmail.length > 22 ? ssoEmail.slice(0,20)+'…' : ssoEmail);
            el.style.background = 'rgba(245,158,11,0.12)';
            el.style.color = '#fbbf24';
            el.style.border = '1px solid rgba(245,158,11,0.3)';
            el.title = 'WizeLife: ' + ssoEmail + ' — היכנס בדף זה כדי לסנכרן';
        } else if (ssoEmail && fbEmail) {
            // Mismatch
            el.textContent = '⚠ אימייל שונה';
            el.style.background = 'rgba(239,68,68,0.12)';
            el.style.color = '#f87171';
            el.style.border = '1px solid rgba(239,68,68,0.3)';
            el.title = 'WizeMoney: ' + fbEmail + ' | WizeLife: ' + ssoEmail;
        }
    }


    function updateWizeBarNick() {
        const el = document.getElementById('wl-bar-nick');
        if (!el) return;
        const stored = localStorage.getItem('wl_nickname');
        const cu = (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser) ? firebase.auth().currentUser : null;
        let nick = stored || (cu && cu.displayName) || null;
        if (!nick && cu && cu.email) {
            nick = cu.email.includes('@') ? cu.email.split('@')[0] : cu.email;
        }
        // First name only \u2014 Google sign-in often returns "John Doe"; nicer to greet "John".
        // Heuristic: take everything before the first whitespace.
        if (nick && /\s/.test(nick)) nick = nick.split(/\s+/)[0];
        if (nick) {
            const short = nick.length > 20 ? nick.substring(0, 18) + '\u2026' : nick;
            el.textContent = '\u25cf ' + short;
            el.style.display = 'inline';
        }
    }

    // Update pill once Plan is ready
    function waitForPlan() {
        if (typeof Plan !== 'undefined') { updatePlanPill(); updateWizeBarPlan(); updateWizeBarLink(); Plan.onChange(function(){updatePlanPill();updateWizeBarPlan(); updateWizeBarLink();}); }
        else setTimeout(waitForPlan, 300);
    }

    

    // ── WizeMoney right panel injector ──
    function injectRightPanel() {
        if (document.getElementById('wl-money-rpanel')) return;
        // Don't inject on small screens
        if (window.innerWidth < 1280) return;

        const panel = document.createElement('aside');
        panel.id = 'wl-money-rpanel';
        panel.style.cssText = 'position:fixed;top:36px;left:0;width:240px;height:calc(100vh - 36px);padding:14px;display:flex;flex-direction:column;gap:12px;z-index:50;overflow-y:auto;font-family:Inter,-apple-system,sans-serif;direction:ltr;';
        panel.classList.add('wl-rpanel-themed');
        panel.innerHTML = `
            <button id="wl-rp-collapse" aria-label="Collapse panel" style="position:absolute;top:10px;right:10px;width:24px;height:24px;border-radius:6px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:#94a3b8;cursor:pointer;font-size:14px;line-height:1;display:flex;align-items:center;justify-content:center;font-family:inherit;padding:0">×</button>
            <div style="font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;font-weight:800;color:#eef2ff;margin-bottom:4px;padding-right:30px">AI Insights</div>
            <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:12px">
                <div style="font-family:'Plus Jakarta Sans',sans-serif;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:8px">Net Worth</div>
                <div id="wl-rp-networth" style="font-family:'Plus Jakarta Sans',sans-serif;font-size:24px;font-weight:900;color:#10b981;letter-spacing:-0.5px">—</div>
                <div style="font-size:10px;color:#6b7280;margin-top:4px">Connect bank for live data</div>
            </div>
            <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:12px">
                <div style="font-family:'Plus Jakarta Sans',sans-serif;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:8px">Quick Tips</div>
                <div class="wl-rp-tip-row" data-tip-key="tip1" style="font-size:11.5px;color:#94a3b8;line-height:1.55;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.04)">Track all accounts in Bank tab</div>
                <div class="wl-rp-tip-row" data-tip-key="tip2" style="font-size:11.5px;color:#94a3b8;line-height:1.55;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.04)">Set goals to see progress charts</div>
                <div class="wl-rp-tip-row" data-tip-key="tip3" style="font-size:11.5px;color:#94a3b8;line-height:1.55;padding:6px 0">Pro unlocks AI advisor & sims</div>
            </div>
            <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:12px">
                <div style="font-family:'Plus Jakarta Sans',sans-serif;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:8px">WizeAI</div>
                <a href="https://wizelife.ai/wize-ai.html" target="_blank" style="display:flex;align-items:center;gap:6px;text-decoration:none;color:#a5b4fc;font-size:12px;font-weight:600;padding:8px;background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.2);border-radius:8px">🤖 Cross-app advisor →</a>
            </div>
        `;
        document.body.appendChild(panel);

        // Translate right panel tips
        function wlMoneyRpTranslate() {
            const TR = {
                he: { tip1: 'עקוב אחרי כל החשבונות בלשונית בנק', tip2: 'הגדר יעדים כדי לראות גרפי התקדמות', tip3: 'Pro פותח יועץ AI וסימולטורים', tipsLabel: 'טיפים מהירים', netLabel: 'שווי נטו', netSub: 'חבר בנק לנתונים חיים' },
                en: { tip1: 'Track all accounts in Bank tab', tip2: 'Set goals to see progress charts', tip3: 'Pro unlocks AI advisor & sims', tipsLabel: 'Quick Tips', netLabel: 'Net Worth', netSub: 'Connect bank for live data' },
                pt: { tip1: 'Acompanhe contas na aba Banco', tip2: 'Defina metas para ver progresso', tip3: 'Pro libera consultor IA', tipsLabel: 'Dicas', netLabel: 'Patrimônio', netSub: 'Conecte banco para dados ao vivo' },
                es: { tip1: 'Sigue cuentas en la pestaña Banco', tip2: 'Define metas para ver progreso', tip3: 'Pro desbloquea asesor IA', tipsLabel: 'Consejos', netLabel: 'Patrimonio', netSub: 'Conecta banco para datos en vivo' },
            };
            const lang = localStorage.getItem('wl_lang') || 'he';
            const t = TR[lang] || TR.en;
            document.querySelectorAll('[data-tip-key]').forEach(el => {
                const k = el.dataset.tipKey;
                if (t[k]) el.textContent = t[k];
            });
        }
        wlMoneyRpTranslate();


        // Reopen tab (visible when collapsed)
        const reopenTab = document.createElement('button');
        reopenTab.id = 'wl-rp-reopen';
        reopenTab.setAttribute('aria-label', 'Open AI panel');
        reopenTab.style.cssText = 'position:fixed;top:50%;left:0;transform:translateY(-50%);width:24px;height:60px;border-radius:0 8px 8px 0;background:rgba(99,102,241,0.18);border:1px solid rgba(99,102,241,0.3);border-left:none;color:#a5b4fc;cursor:pointer;font-size:14px;line-height:60px;text-align:center;font-family:inherit;padding:0;z-index:51;display:none';
        reopenTab.innerHTML = '›';
        document.body.appendChild(reopenTab);

        // Wire up collapse/reopen
        const collapseBtn = panel.querySelector('#wl-rp-collapse');
        const KEY = 'wl_rp_collapsed';
        const setState = (collapsed) => {
            panel.style.display = collapsed ? 'none' : 'flex';
            reopenTab.style.display = collapsed ? 'block' : 'none';
            const styleTag = document.getElementById('wl-rp-padding-style');
            if (styleTag) styleTag.disabled = collapsed;
            localStorage.setItem(KEY, collapsed ? '1' : '0');
        };
        collapseBtn.onclick = () => setState(true);
        reopenTab.onclick = () => setState(false);
        if (localStorage.getItem(KEY) === '1') setState(true);

        // Add main padding-left to account for panel
        const s = document.createElement('style');
        s.id = 'wl-rp-padding-style';
        s.textContent = '@media (min-width: 1280px) { body { padding-left: 240px !important; box-sizing: border-box; } #wl-bar { padding-left: 256px !important; } }';
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
        updateWizeBarPlan(); updateWizeBarLink();
        // Re-update plan when localStorage changes
        window.addEventListener('storage', function(e){if(e.key==='wl_plan')updateWizeBarPlan(); updateWizeBarLink();});
        // re-check once Firebase Auth resolves
        if (typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().onAuthStateChanged(function() { updateWizeBarNick(); });
        }
        const aside = document.querySelector('aside.sidebar');
        if (aside) {
            aside.innerHTML = html;
            // Append a compact lang switcher inside the sidebar so mobile users
            // can change language from the hamburger drawer.
            try {
                if (!aside.querySelector('.sidebar-lang-pills')) {
                    const wrap = document.createElement('div');
                    wrap.className = 'sidebar-lang-pills';
                    wrap.style.cssText = 'display:flex;gap:4px;margin:14px 12px 6px;padding:4px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:8px;';
                    ['he','en','pt','es'].forEach(function(l){
                        const b = document.createElement('button');
                        b.textContent = l.toUpperCase();
                        b.style.cssText = 'flex:1;background:none;border:none;color:#94a3b8;padding:6px 4px;border-radius:6px;font:700 11px Inter,sans-serif;cursor:pointer;letter-spacing:.4px;';
                        b.onclick = function(){
                            try { localStorage.setItem('wl_lang', l); } catch(e){}
                            if (typeof I18n !== 'undefined' && I18n.setLanguage) I18n.setLanguage(l);
                            wrap.querySelectorAll('button').forEach(function(x){
                                x.style.color = x.textContent.toLowerCase() === l ? '#10b981' : '#94a3b8';
                                x.style.background = x.textContent.toLowerCase() === l ? 'rgba(16,185,129,0.18)' : 'none';
                            });
                        };
                        wrap.appendChild(b);
                    });
                    aside.appendChild(wrap);
                    // initial active state
                    var cur = (localStorage.getItem('wl_lang') || 'he').toLowerCase();
                    wrap.querySelectorAll('button').forEach(function(x){
                        if (x.textContent.toLowerCase() === cur) {
                            x.style.color = '#10b981';
                            x.style.background = 'rgba(16,185,129,0.18)';
                        }
                    });
                }
            } catch(e) {}
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

    // Cross-app bottom navigation + first-visit onboarding (mobile only).
    // (Reuses the `inPages`/`prefix` consts declared at the top of this IIFE
    // — earlier we had a duplicate `var inPages` here which broke the whole
    // file with a SyntaxError, so neither sidebar nor the bottom-nav rendered.)
    try {
        var _navPrefix = inPages ? '../js/' : 'js/';
        function loadOnce(name, marker) {
            if (document.querySelector('script[data-' + marker + ']')) return;
            if (window['__' + marker + 'Loaded']) return;
            var s = document.createElement('script');
            s.src = _navPrefix + name;
            s.async = true; s.defer = true;
            s.setAttribute('data-' + marker, '1');
            document.head.appendChild(s);
        }
        loadOnce('wize-bottom-nav.js', 'wbn');
        loadOnce('wize-onboarding.js', 'wob');
        loadOnce('wize-hamburger.js', 'wha');
    } catch(e) { console.warn('shared nav scripts failed to load', e); }
})();
