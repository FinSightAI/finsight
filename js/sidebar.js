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
        { icon: '🏠', label: 'דאשבורד',           file: inPages ? '../index.html' : 'index.html', category: 'dashboard' },
        { icon: '🏦', label: 'חשבונות בנק',         file: prefix + 'bank.html',              category: 'bank' },
        { icon: '💰', label: 'מעקב הכנסות',          file: prefix + 'income.html',            category: 'income' },
        { icon: '💳', label: 'כרטיסי אשראי',         file: prefix + 'credit.html',            category: 'credit' },
        { icon: '📈', label: 'מניות',                file: prefix + 'stocks.html',            category: 'stocks',           pro: true, proKey: 'stocks' },
        { icon: '📊', label: 'אנליטיקת תיק',          file: prefix + 'stock-analytics.html',   category: 'stock-analytics',  pro: true, proKey: 'stocks' },
        {
            icon: '📊', label: 'מוצרים פיננסיים',
            submenu: [
                { label: '🏪 מוצרים בשוק',   file: prefix + 'market-products.html', category: 'market-products' },
                { label: '💎 החסכונות שלי',  file: prefix + 'my-funds.html',        category: 'my-products' },
                { label: '⚖️ השוואת מוצרים', file: prefix + 'compare-funds.html',   category: 'compare-funds',  pro: true, proKey: 'compareFunds' },
            ]
        },
        { icon: '🏠', label: 'נכסים',                file: prefix + 'assets.html',            category: 'assets' },
        { icon: '🏦', label: 'הלוואות',               file: prefix + 'loans.html',             category: 'loans' },
        { icon: '🔄', label: 'תשלומים קבועים',        file: prefix + 'subscriptions.html',     category: 'subscriptions' },
        { icon: '🎯', label: 'יעדי חיסכון',           file: prefix + 'goals.html',             category: 'goals' },
        { icon: '⏳', label: 'סימולטור מה היה קורה',   file: prefix + 'simulator.html',         category: 'simulator',        pro: true, proKey: 'simulator' },
        { icon: '🤖', label: 'יועץ AI',               file: prefix + 'ai-chat.html',           category: 'ai-chat',          pro: true, proKey: 'aiChat' },
        { icon: '✨', label: 'סיפור השבוע',            file: prefix + 'ai-story.html',          category: 'ai-story',         pro: true, proKey: 'aiStory' },
        { icon: '🧾', label: 'מייעל מס',              file: prefix + 'tax-optimizer.html',     category: 'tax-optimizer',    pro: true, proKey: 'taxOptimizer' },
        { icon: '🎯', label: 'אופטימיזטור פנסיה',     file: prefix + 'pension-optimizer.html', category: 'pension-optimizer',pro: true, proKey: 'pensionOptimizer' },
        { icon: '🧮', label: 'מחשבון פנסיה',          file: prefix + 'pension-calc.html',      category: 'pension-calc' },
        { icon: '📋', label: 'דוחות',                 file: prefix + 'reports.html',           category: 'reports',          pro: true, proKey: 'reports' },
        { icon: '📅', label: 'לוח שנה פיננסי',        file: prefix + 'calendar.html',          category: 'calendar' },
        { icon: '👨‍👩‍👧‍👦', label: 'דשבורד משפחתי',     file: prefix + 'family.html',            category: 'family',           pro: true, proKey: 'multiProfile' },
        { icon: '🩺', label: 'בריאות פיננסית',        file: prefix + 'health-score.html',      category: 'health-score' },
        { icon: '👤', label: 'פרופיל פיננסי',          file: prefix + 'profile.html',           category: 'profile' },
        { icon: '⚙️', label: 'הגדרות',                file: prefix + 'settings.html',          category: 'settings' },
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
                return `<li class="nav-item"><a href="${s.file}" class="nav-link${a}"${lockAttr} data-category="${s.category}">${s.label}${lockBadge}</a></li>`;
            }).join('');
            return `<li class="nav-item">
                <span class="nav-link" style="cursor:default;">
                    <span class="icon">${item.icon}</span>
                    <span>${item.label}</span>
                </span>
                <ul class="nav-submenu">${subItems}</ul>
            </li>`;
        }
        const active = isActive(item) ? ' active' : '';
        const lockAttr = item.pro ? ` data-pro="${item.proKey}"` : '';
        const lockBadge = item.pro ? ' <span class="pro-lock">Pro</span>' : '';
        return `<li class="nav-item">
            <a href="${item.file}" class="nav-link${active}"${lockAttr} data-category="${item.category || ''}">
                <span class="icon">${item.icon}</span>
                <span>${item.label}${lockBadge}</span>
            </a>
        </li>`;
    }

    const footer = inPages ? '' : `
        <div style="display:flex;gap:10px;">
            <button class="btn btn-secondary btn-sm" onclick="if(typeof Plan!=='undefined'&&!Plan.check('export'))return;ExportManager.showExportOptions()">
                <span>📤</span><span>ייצוא</span>
            </button>
            <button class="btn btn-secondary btn-sm" id="importDataBtn">
                <span>📥</span><span>ייבוא</span>
            </button>
        </div>`;

    const html = `
        <div class="sidebar-header">
            <div class="brand">
                <img src="${imgPrefix}img/logo.png" class="brand-icon" alt="FinSight">
                <span class="brand-name">Fin<span class="brand-highlight">Sight</span></span>
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
            '<button class="lang-btn" data-lang="pt" onclick="I18n.setLanguage(\'pt\')">PT</button>';
        sw.style.cssText =
            'position:fixed;top:14px;z-index:1200;' +
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
    function inject() {
        const aside = document.querySelector('aside.sidebar');
        if (aside) {
            aside.innerHTML = html;
            attachProGates(aside);
        }
        injectLangSwitcher();
        injectThemeToggle();
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
        document.addEventListener('DOMContentLoaded', inject);
    } else {
        inject();
    }
})();
