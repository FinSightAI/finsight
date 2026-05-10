/**
 * Haptic feedback utility (Android only — iOS Safari blocks navigator.vibrate)
 */
const Haptic = {
    light()   { navigator.vibrate?.(10); },
    medium()  { navigator.vibrate?.(25); },
    success() { navigator.vibrate?.([10, 40, 10]); },
    error()   { navigator.vibrate?.([50, 30, 50]); },
    warning() { navigator.vibrate?.(40); }
};
window.Haptic = Haptic;

/**
 * Main Application Module
 */
const App = {
    currentPage: 'dashboard',

    /**
     * Initialize the application
     */
    init() {
        // Initialize storage and i18n
        I18n.init();

        // Register service worker
        this.registerServiceWorker();

        // Setup event listeners
        this.setupEventListeners();

        // Load current page data
        this.loadPageData();

        // Update dashboard if on main page
        if (this.currentPage === 'dashboard') {
            this.updateDashboard();
        }
    },

    /**
     * Register service worker for PWA
     */
    async registerServiceWorker() {
        if (!('serviceWorker' in navigator)) return;
        try {
            const basePath = window.location.pathname.includes('/pages/')
                ? window.location.pathname.split('/pages/')[0]
                : window.location.pathname.replace(/\/[^/]*$/, '');
            const swPath = basePath + '/sw.js';
            const registration = await navigator.serviceWorker.register(swPath, { scope: basePath + '/' });

            // SILENT auto-update: every push reaches users with zero clicks.
            // - new SW installed → SKIP_WAITING immediately
            // - controllerchange → reload, but only when the user isn't actively
            //   typing (to avoid eating mid-form data) or when the tab hides.
            registration.addEventListener('updatefound', () => {
                const newSW = registration.installing;
                if (!newSW) return;
                newSW.addEventListener('statechange', () => {
                    if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
                        try { newSW.postMessage({ type: 'SKIP_WAITING' }); } catch (e) {}
                    }
                });
            });

            let refreshing = false;
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                if (refreshing) return;
                refreshing = true;
                const safeReload = () => {
                    const a = document.activeElement;
                    const typing = a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA' || a.isContentEditable);
                    if (typing) return;
                    window.location.reload();
                };
                if (document.visibilityState === 'hidden') return window.location.reload();
                document.addEventListener('visibilitychange', () => {
                    if (document.visibilityState === 'hidden') window.location.reload();
                    else safeReload();
                });
                setTimeout(safeReload, 30 * 60 * 1000);
            });

            // Periodic update check while page is open
            setInterval(() => { try { registration.update(); } catch {} }, 5 * 60 * 1000);
            window.addEventListener('focus', () => { try { registration.update(); } catch {} });
            registration.update();  // initial check
        } catch (error) { /* silent */ }
    },

    /**
     * Setup global event listeners
     */
    setupEventListeners() {
        // Language toggle
        document.querySelectorAll('.lang-toggle').forEach(btn => {
            btn.addEventListener('click', () => I18n.toggleLanguage());
        });

        // Brand click → dashboard
        const brand = document.querySelector('.sidebar-header .brand');
        if (brand) {
            brand.style.cursor = 'pointer';
            brand.addEventListener('click', () => {
                const isInPages = window.location.pathname.includes('/pages/');
                window.location.href = isInPages ? '../index.html' : './index.html';
            });
        }

        // Mobile header + sidebar
        this.setupMobileHeader();

        // Bottom tab bar (iOS-style)
        this.setupBottomTabBar();

        // Pull-to-refresh
        this.setupPullToRefresh();

        // Offline banner
        this.setupOfflineBanner();

        // Push notification permission + budget check
        this.setupNotifications();

        // Modal close on overlay click
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeModal(overlay.id);
                }
            });
        });

        // Export data button
        document.getElementById('exportDataBtn')?.addEventListener('click', () => this.exportData());

        // Import data button
        document.getElementById('importDataBtn')?.addEventListener('click', () => this.importData());
    },

    /**
     * Inject mobile header bar and sidebar overlay, wire up toggle logic
     */
    setupMobileHeader() {
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) return;

        // Build logo src from existing brand icon (handles both root and /pages/ paths)
        const existingLogo = document.querySelector('.sidebar .brand-icon');
        const logoSrc = existingLogo ? existingLogo.src : '';
        const isInPages = window.location.pathname.includes('/pages/');
        const homeHref = isInPages ? '../index.html' : './index.html';

        // Inject mobile header
        const header = document.createElement('header');
        header.className = 'mobile-header';
        /* No lang pills here — they live inside the sidebar drawer + the
           WizeLife hamburger menu, so the top bar stays clean. */
        header.innerHTML =
            '<button class="mobile-header-toggle" aria-label="תפריט">☰</button>' +
            '<a href="' + homeHref + '" class="mobile-header-brand">' +
                '<span class="mobile-header-name">Wize<span class="brand-highlight">Money</span></span>' +
            '</a>';

        // Inject overlay
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';

        const appContainer = document.querySelector('.app-container') || document.body;
        appContainer.insertBefore(header, appContainer.firstChild);
        appContainer.appendChild(overlay);

        const toggle = header.querySelector('.mobile-header-toggle');

        const openSidebar = () => {
            sidebar.classList.add('open');
            overlay.classList.add('active');
            toggle.textContent = '✕';
            document.body.style.overflow = 'hidden';
        };

        const closeSidebar = () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
            toggle.textContent = '☰';
            document.body.style.overflow = '';
        };

        toggle.addEventListener('click', () => {
            sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
        });

        overlay.addEventListener('click', closeSidebar);

        // Close on nav link click (navigate to page)
        sidebar.querySelectorAll('.nav-link[href]').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) closeSidebar();
            });
        });

        // Swipe-to-close: detect horizontal swipe on the sidebar (iOS UX)
        let touchStartX = 0;
        let touchStartY = 0;
        sidebar.addEventListener('touchstart', e => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });
        sidebar.addEventListener('touchend', e => {
            const dx = e.changedTouches[0].clientX - touchStartX;
            const dy = Math.abs(e.changedTouches[0].clientY - touchStartY);
            const isRTL = document.documentElement.dir === 'rtl';
            const swipeClose = isRTL ? dx > 60 : dx < -60; // RTL: swipe right to close; LTR: swipe left
            if (swipeClose && dy < 60 && window.innerWidth <= 768) closeSidebar();
        }, { passive: true });

    },

    /**
     * Bottom tab bar — 5 main tabs + "more" to open sidebar
     */
    setupBottomTabBar() {
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) return;

        const isInPages = window.location.pathname.includes('/pages/');
        const base = isInPages ? '' : 'pages/';
        const rootBase = isInPages ? '../' : './';

        const tabs = [
            { icon: '🏠', label: 'דאשבורד', href: rootBase + 'index.html',  category: 'dashboard' },
            { icon: '🏦', label: 'בנק',      href: base + 'bank.html',        category: 'bank' },
            { icon: '💳', label: 'אשראי',    href: base + 'credit.html',      category: 'credit' },
            { icon: '📈', label: 'מניות',    href: base + 'stocks.html',      category: 'stocks' },
            { icon: '☰',  label: 'עוד',      href: null,                       category: 'more' }
        ];

        // Detect current tab
        const path = window.location.pathname;
        const currentCategory = path.includes('bank') ? 'bank'
            : path.includes('credit') ? 'credit'
            : path.includes('stocks') ? 'stocks'
            : path.includes('index') || path.endsWith('/') ? 'dashboard'
            : 'other';

        const bar = document.createElement('nav');
        bar.className = 'mobile-tab-bar';
        bar.setAttribute('aria-label', 'ניווט ראשי');

        tabs.forEach(tab => {
            const el = tab.href
                ? document.createElement('a')
                : document.createElement('button');

            el.className = 'tab-item' + (tab.category === currentCategory ? ' active' : '');
            if (tab.href) el.href = tab.href;
            el.innerHTML = `<span class="tab-icon">${tab.icon}</span><span class="tab-label">${tab.label}</span>`;

            if (tab.category === 'more') {
                el.addEventListener('click', () => {
                    Haptic.light();
                    const isOpen = sidebar.classList.contains('open');
                    // Trigger the existing toggle
                    document.querySelector('.mobile-header-toggle')?.click();
                });
            } else {
                el.addEventListener('click', () => Haptic.light());
            }

            bar.appendChild(el);
        });

        document.body.appendChild(bar);
    },

    /**
     * Offline banner — shows when network is lost
     */
    setupOfflineBanner() {
        const banner = document.createElement('div');
        banner.className = 'offline-banner';
        banner.innerHTML = '📡 <span>אין חיבור לאינטרנט — האפליקציה פועלת במצב מקוון-לא</span>';
        document.body.appendChild(banner);

        const update = () => {
            banner.classList.toggle('visible', !navigator.onLine);
        };

        window.addEventListener('online',  () => { update(); Haptic.success(); });
        window.addEventListener('offline', () => { update(); Haptic.warning(); });
        update(); // check immediately
    },

    /**
     * Push notifications — request permission + check budgets on load
     */
    async setupNotifications() {
        if (typeof Notifications === 'undefined' || typeof Alerts === 'undefined') return;
        if (!Notifications.isSupported()) return;

        // Show a permission prompt once if not yet asked (after 5 seconds)
        const alreadyAsked = localStorage.getItem('notif_permission_asked');
        if (!alreadyAsked && Notifications.getPermission() === 'default') {
            setTimeout(() => this._showNotifPrompt(), 5000);
        }

        // If already granted, run budget checks
        if (Notifications.getPermission() === 'granted') {
            this._checkBudgetNotifications();
        }

        // Fire smart alerts (push notifications)
        if (typeof Alerts !== 'undefined') {
            Alerts.fireSmartAlertNotifications();
        }
    },

    _showNotifPrompt() {
        // Only show on dashboard main page
        const mainContent = document.querySelector('.main-content');
        if (!mainContent) return;

        const prompt = document.createElement('div');
        prompt.className = 'notif-prompt';
        prompt.innerHTML = `
            <span>🔔</span>
            <span class="notif-prompt-text">אפשר התראות תקציב כדי לקבל עדכונים חשובים</span>
            <div class="notif-prompt-btns">
                <button class="btn btn-primary btn-sm" id="notifAllow">אפשר</button>
                <button class="btn btn-secondary btn-sm" id="notifDismiss">לא עכשיו</button>
            </div>
        `;

        mainContent.insertBefore(prompt, mainContent.firstChild);
        localStorage.setItem('notif_permission_asked', '1');

        document.getElementById('notifAllow')?.addEventListener('click', async () => {
            prompt.remove();
            const result = await Notifications.requestPermission();
            if (result.success) this._checkBudgetNotifications();
        });

        document.getElementById('notifDismiss')?.addEventListener('click', () => prompt.remove());
    },

    _checkBudgetNotifications() {
        if (typeof Alerts === 'undefined') return;

        // Only notify once per day per alert
        const today = new Date().toISOString().slice(0, 10);
        const lastNotifDay = localStorage.getItem('notif_last_budget_check');
        if (lastNotifDay === today) return;

        try {
            const alerts = Alerts.checkBudgets();
            if (alerts && alerts.length > 0) {
                const top = alerts[0];
                Notifications.show(`${top.icon} ${top.title}`, {
                    body: top.message,
                    tag: 'budget-check-daily'
                });
                localStorage.setItem('notif_last_budget_check', today);
            }
        } catch (e) {
            console.warn('Budget notification check failed:', e);
        }
    },

    /**
     * Pull-to-refresh: swipe down at top of page to reload data
     */
    setupPullToRefresh() {
        const mainContent = document.querySelector('.main-content');
        if (!mainContent) return;

        const indicator = document.createElement('div');
        indicator.className = 'pull-refresh-indicator';
        indicator.textContent = '↓';
        document.body.appendChild(indicator);

        let startY = 0;
        let pulling = false;
        const THRESHOLD = 72;

        mainContent.addEventListener('touchstart', e => {
            if (mainContent.scrollTop === 0) {
                startY = e.touches[0].clientY;
                pulling = true;
            }
        }, { passive: true });

        mainContent.addEventListener('touchmove', e => {
            if (!pulling) return;
            const dy = e.touches[0].clientY - startY;
            if (dy > 20 && dy < THRESHOLD + 20) {
                indicator.classList.add('visible');
                indicator.textContent = dy >= THRESHOLD ? '↺' : '↓';
            }
        }, { passive: true });

        mainContent.addEventListener('touchend', e => {
            if (!pulling) return;
            const dy = e.changedTouches[0].clientY - startY;
            pulling = false;

            if (dy >= THRESHOLD) {
                indicator.textContent = '↺';
                indicator.classList.add('refreshing');
                Haptic.success();
                setTimeout(() => {
                    indicator.classList.remove('visible', 'refreshing');
                    indicator.textContent = '↓';
                    location.reload();
                }, 600);
            } else {
                indicator.classList.remove('visible');
                indicator.textContent = '↓';
            }
        }, { passive: true });
    },

    /**
     * Load data for current page
     */
    loadPageData() {
        // Override in specific page scripts
    },

    /**
     * Update dashboard with current totals
     */
    updateDashboard() {
        const bankTotal = Storage.getTotalBankBalance();
        const creditTotal = Storage.getTotalCreditExpenses(this.getCurrentMonth());
        const stocksTotal = Storage.getTotalStocksValue();
        const fundsTotal = Storage.getTotalFundsValue();
        const assetsTotal = Storage.getTotalAssetsValue();
        const loansTotal = Storage.getTotalLoansBalance();
        const netWorth = Storage.getNetWorth();

        // Update summary cards + remove skeleton loaders
        const cardIds = ['bankTotal','creditTotal','stocksTotal','fundsTotal','assetsTotal','loansTotal','netWorthTotal'];
        cardIds.forEach(id => document.getElementById(id)?.classList.remove('skeleton'));

        this.updateElement('bankTotal', I18n.formatCurrency(bankTotal));
        this.updateElement('creditTotal', I18n.formatCurrency(creditTotal));
        this.updateElement('stocksTotal', I18n.formatCurrency(stocksTotal));
        this.updateElement('fundsTotal', I18n.formatCurrency(fundsTotal));
        this.updateElement('assetsTotal', I18n.formatCurrency(assetsTotal));
        this.updateElement('loansTotal', I18n.formatCurrency(loansTotal));
        this.updateElement('netWorthTotal', I18n.formatCurrency(netWorth));

        // Update charts if Charts module is available
        if (typeof Charts !== 'undefined') {
            Charts.updateAssetDistribution({
                bank: bankTotal,
                stocks: stocksTotal,
                funds: fundsTotal,
                assets: assetsTotal
            });
        }
    },

    /**
     * Get current month in YYYY-MM format
     */
    getCurrentMonth() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    },

    /**
     * Update element text content safely
     */
    updateElement(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    },

    /**
     * Open modal
     */
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    },

    /**
     * Close modal
     */
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            // Reset form if exists
            const form = modal.querySelector('form');
            if (form) form.reset();
        }
    },

    /**
     * Show confirmation dialog
     */
    confirm(message) {
        return window.confirm(message);
    },

    /**
     * Show notification
     */
    notify(message, type = 'info') {
        // Simple notification - can be enhanced with toast library
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 12px 24px;
            background: ${type === 'success' ? 'var(--color-positive)' : type === 'error' ? 'var(--color-negative)' : 'var(--color-bank)'};
            color: ${type === 'success' ? 'var(--color-bg-primary)' : 'white'};
            border-radius: var(--radius-sm);
            z-index: 2000;
            animation: fadeIn 0.3s ease;
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    },

    /**
     * Export all data as JSON file
     */
    exportData() {
        const data = Storage.exportData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `finance-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.notify(I18n.t('common.export') + ' ✓', 'success');
    },

    /**
     * Import data from JSON file
     */
    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const data = JSON.parse(event.target.result);
                        if (this.confirm(I18n.currentLanguage === 'he' ?
                            'האם לייבא את הנתונים? פעולה זו תחליף את הנתונים הקיימים.' :
                            'Import data? This will replace existing data.')) {
                            Storage.importData(data);
                            location.reload();
                        }
                    } catch (error) {
                        this.notify('Error importing data', 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    },

    /**
     * Format number for display
     */
    formatNumber(num) {
        return I18n.formatNumber(num);
    },

    /**
     * Format currency for display
     */
    formatCurrency(amount, currency = 'ILS') {
        return I18n.formatCurrency(amount, currency);
    },

    /**
     * Format date for display
     */
    formatDate(date) {
        return I18n.formatDate(date);
    },

    /**
     * Create table row element
     */
    createTableRow(data, columns) {
        const tr = document.createElement('tr');
        columns.forEach(col => {
            const td = document.createElement('td');
            if (typeof col === 'function') {
                const content = col(data);
                if (typeof content === 'string') {
                    td.innerHTML = content;
                } else {
                    td.appendChild(content);
                }
            } else {
                td.textContent = data[col] ?? '';
            }
            tr.appendChild(td);
        });
        return tr;
    },

    /**
     * Render empty state
     */
    renderEmptyState(container, icon, message) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon">${icon}</div>
                <p>${message}</p>
            </div>
        `;
    }
};

/**
 * Sanitize string to prevent XSS when used in innerHTML
 */
function sanitize(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
window.sanitize = sanitize;

// ─── PWA Install Prompt ───────────────────────────────────────────────────────
(function () {
    const DISMISSED_KEY = 'wl_pwa_install_dismissed';
    let deferredPrompt = null;

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        if (localStorage.getItem(DISMISSED_KEY)) return;
        // Show after 8s so it doesn't interrupt first load
        setTimeout(showInstallToast, 8000);
    });

    function showInstallToast() {
        if (document.getElementById('pwaInstallToast')) return;
        const toast = document.createElement('div');
        toast.id = 'pwaInstallToast';
        toast.style.cssText = [
            'position:fixed', 'bottom:80px', 'left:50%', 'transform:translateX(-50%)',
            'background:#1e293b', 'border:1px solid #334155', 'border-radius:14px',
            'padding:14px 18px', 'display:flex', 'align-items:center', 'gap:12px',
            'box-shadow:0 8px 32px rgba(0,0,0,0.4)', 'z-index:9999',
            'max-width:360px', 'width:90%', 'cursor:pointer',
            'animation:slideUpToast 0.3s ease',
        ].join(';');
        toast.innerHTML = `
            <span style="font-size:1.5rem">📲</span>
            <div style="flex:1">
                <div style="font-weight:700;font-size:0.9rem;color:#f1f5f9">הוסף למסך הבית</div>
                <div style="font-size:0.78rem;color:#94a3b8;margin-top:2px">חוויה כמו אפליקציה — ללא דפדפן</div>
            </div>
            <button id="pwaInstallBtn" style="background:linear-gradient(135deg,#6c63ff,#a855f7);color:white;border:none;border-radius:8px;padding:7px 14px;font-size:0.82rem;font-weight:600;cursor:pointer;white-space:nowrap">התקן</button>
            <button id="pwaInstallClose" style="background:none;border:none;color:#64748b;font-size:1.2rem;cursor:pointer;padding:0 2px;line-height:1">&times;</button>
        `;
        if (!document.getElementById('pwaInstallStyle')) {
            const s = document.createElement('style');
            s.id = 'pwaInstallStyle';
            s.textContent = '@keyframes slideUpToast{from{opacity:0;transform:translateX(-50%) translateY(20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}';
            document.head.appendChild(s);
        }
        document.body.appendChild(toast);

        document.getElementById('pwaInstallBtn').addEventListener('click', async () => {
            toast.remove();
            if (!deferredPrompt) return;
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') localStorage.setItem(DISMISSED_KEY, '1');
            deferredPrompt = null;
        });
        document.getElementById('pwaInstallClose').addEventListener('click', () => {
            toast.remove();
            localStorage.setItem(DISMISSED_KEY, '1');
        });
    }
})();

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => App.init());

// Make App available globally
window.App = App;
