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

    // Inject as soon as possible — script is deferred, so DOM is ready
    function inject() {
        const aside = document.querySelector('aside.sidebar');
        if (aside) {
            aside.innerHTML = html;
            attachProGates(aside);
        }
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
