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
        if ('serviceWorker' in navigator) {
            try {
                // Detect base path for GitHub Pages compatibility
                const basePath = window.location.pathname.includes('/pages/')
                    ? window.location.pathname.split('/pages/')[0]
                    : window.location.pathname.replace(/\/[^/]*$/, '');
                const swPath = basePath + '/sw.js';
                const registration = await navigator.serviceWorker.register(swPath, { scope: basePath + '/' });
                console.log('ServiceWorker registered:', registration.scope);
            } catch (error) {
                console.log('ServiceWorker registration failed:', error);
            }
        }
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
        header.innerHTML =
            '<button class="mobile-header-toggle" aria-label="תפריט">☰</button>' +
            '<a href="' + homeHref + '" class="mobile-header-brand">' +
                (logoSrc ? '<img src="' + logoSrc + '" class="mobile-header-logo" alt="FinSight">' : '') +
                '<span class="mobile-header-name">Fin<span class="brand-highlight">Sight</span></span>' +
            '</a>' +
            '<div class="mobile-header-lang">' +
                '<button class="lang-btn" data-lang="he" onclick="I18n.setLanguage(\'he\')">HE</button>' +
                '<button class="lang-btn" data-lang="en" onclick="I18n.setLanguage(\'en\')">EN</button>' +
                '<button class="lang-btn" data-lang="pt" onclick="I18n.setLanguage(\'pt\')">PT</button>' +
            '</div>';

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

        // Update summary cards
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

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => App.init());

// Make App available globally
window.App = App;
