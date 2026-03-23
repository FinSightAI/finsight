/**
 * Widget Manager - Customizable dashboard widgets
 */
const WidgetManager = {
    STORAGE_KEY: 'finance_dashboard_widgets',

    // Available widgets
    widgets: [
        { id: 'netWorth', name: { he: 'שווי נקי', en: 'Net Worth' }, icon: '💰', default: true },
        { id: 'summaryCards', name: { he: 'כרטיסי סיכום', en: 'Summary Cards' }, icon: '📊', default: true },
        { id: 'fullPicture', name: { he: 'תמונה פיננסית מלאה', en: 'Full Financial Picture' }, icon: '🗺️', default: true },
        { id: 'assetDistribution', name: { he: 'חלוקת נכסים', en: 'Asset Distribution' }, icon: '🥧', default: true },
        { id: 'monthlyExpenses', name: { he: 'הוצאות חודשיות', en: 'Monthly Expenses' }, icon: '💳', default: true },
        { id: 'recentTransactions', name: { he: 'פעולות אחרונות', en: 'Recent Transactions' }, icon: '📋', default: true },
        { id: 'stockAlerts', name: { he: 'התראות מניות', en: 'Stock Alerts' }, icon: '🔔', default: false },
        { id: 'goalsProgress', name: { he: 'התקדמות יעדים', en: 'Goals Progress' }, icon: '🎯', default: false },
        { id: 'quickStats', name: { he: 'סטטיסטיקות מהירות', en: 'Quick Stats' }, icon: '📈', default: false },
        { id: 'currencyRates', name: { he: 'שערי מטבע', en: 'Currency Rates' }, icon: '💱', default: false },
        { id: 'smartTips', name: { he: 'טיפים חכמים', en: 'Smart Tips' }, icon: '💡', default: false }
    ],

    /**
     * Get current widget configuration
     */
    getConfig() {
        try {
            const saved = Storage.get(Storage.KEYS.DASHBOARD_WIDGETS);
            if (saved) {
                return saved;
            }
        } catch (e) {
            console.error('Error loading widget config:', e);
        }
        // Return default config
        return this.getDefaultConfig();
    },

    /**
     * Get default configuration
     */
    getDefaultConfig() {
        const config = {};
        this.widgets.forEach(w => {
            config[w.id] = {
                enabled: w.default,
                order: this.widgets.indexOf(w)
            };
        });
        return config;
    },

    /**
     * Save widget configuration
     */
    saveConfig(config) {
        try {
            Storage.set(Storage.KEYS.DASHBOARD_WIDGETS, config);
        } catch (e) {
            console.error('Error saving widget config:', e);
        }
    },

    /**
     * Toggle widget visibility
     */
    toggleWidget(widgetId) {
        const config = this.getConfig();
        if (config[widgetId]) {
            config[widgetId].enabled = !config[widgetId].enabled;
        } else {
            config[widgetId] = { enabled: true, order: 999 };
        }
        this.saveConfig(config);
        this.applyConfig();
    },

    /**
     * Apply widget configuration to DOM
     */
    applyConfig() {
        const config = this.getConfig();

        // Hide/show widgets based on config
        document.querySelectorAll('[data-widget]').forEach(element => {
            const widgetId = element.getAttribute('data-widget');
            const widgetConfig = config[widgetId];

            if (widgetConfig && !widgetConfig.enabled) {
                element.style.display = 'none';
            } else {
                element.style.display = '';
            }
        });
    },

    /**
     * Check if widget is enabled
     */
    isEnabled(widgetId) {
        const config = this.getConfig();
        return config[widgetId]?.enabled !== false;
    },

    /**
     * Show customization modal
     */
    showCustomizeModal() {
        const lang = I18n?.currentLanguage || 'he';
        const isHebrew = lang === 'he';
        const config = this.getConfig();

        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.id = 'widgetModal';
        modal.innerHTML = `
            <div class="modal" style="max-width: 500px;">
                <div class="modal-header">
                    <h2>${isHebrew ? '⚙️ התאמת דשבורד' : '⚙️ Customize Dashboard'}</h2>
                    <button class="modal-close" onclick="WidgetManager.closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <p style="color: var(--color-text-secondary); margin-bottom: 20px;">
                        ${isHebrew ? 'בחר אילו רכיבים להציג בדשבורד:' : 'Select which widgets to display on the dashboard:'}
                    </p>
                    <div class="widget-list">
                        ${this.widgets.map(widget => {
                            const isEnabled = config[widget.id]?.enabled !== false;
                            const name = widget.name[lang] || widget.name.en;
                            return `
                                <div class="widget-item ${isEnabled ? 'enabled' : ''}" onclick="WidgetManager.toggleWidgetFromModal('${widget.id}')">
                                    <div class="widget-icon">${widget.icon}</div>
                                    <div class="widget-info">
                                        <div class="widget-name">${name}</div>
                                    </div>
                                    <div class="widget-toggle">
                                        <input type="checkbox" ${isEnabled ? 'checked' : ''} onclick="event.stopPropagation(); WidgetManager.toggleWidgetFromModal('${widget.id}')">
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="WidgetManager.resetToDefault()">
                        ${isHebrew ? '↩️ איפוס לברירת מחדל' : '↩️ Reset to Default'}
                    </button>
                    <button class="btn btn-primary" onclick="WidgetManager.closeModal()">
                        ${isHebrew ? 'סיום' : 'Done'}
                    </button>
                </div>
            </div>
        `;

        // Add styles for widget list
        const style = document.createElement('style');
        style.id = 'widget-modal-styles';
        style.textContent = `
            .widget-list {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            .widget-item {
                display: flex;
                align-items: center;
                gap: 15px;
                padding: 15px;
                background: var(--color-bg-hover);
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.2s;
                border: 2px solid transparent;
            }
            .widget-item:hover {
                background: var(--color-bg-card);
            }
            .widget-item.enabled {
                border-color: var(--color-primary);
            }
            .widget-icon {
                font-size: 1.5rem;
            }
            .widget-info {
                flex: 1;
            }
            .widget-name {
                font-weight: 500;
            }
            .widget-toggle input {
                width: 20px;
                height: 20px;
                cursor: pointer;
            }
        `;

        if (!document.getElementById('widget-modal-styles')) {
            document.head.appendChild(style);
        }

        document.body.appendChild(modal);
    },

    /**
     * Toggle widget from modal
     */
    toggleWidgetFromModal(widgetId) {
        this.toggleWidget(widgetId);
        // Update modal UI
        const modal = document.getElementById('widgetModal');
        if (modal) {
            this.closeModal();
            this.showCustomizeModal();
        }
    },

    /**
     * Reset to default configuration
     */
    resetToDefault() {
        const config = this.getDefaultConfig();
        this.saveConfig(config);
        this.applyConfig();
        this.closeModal();
        this.showCustomizeModal();

        if (typeof App !== 'undefined' && App.notify) {
            const lang = I18n?.currentLanguage || 'he';
            App.notify(lang === 'he' ? 'הדשבורד אופס לברירת מחדל' : 'Dashboard reset to default', 'success');
        }
    },

    /**
     * Close modal
     */
    closeModal() {
        const modal = document.getElementById('widgetModal');
        if (modal) {
            modal.remove();
        }
    },

    /**
     * Initialize widget system
     */
    init() {
        this.applyConfig();
    }
};

// Make available globally
window.WidgetManager = WidgetManager;
