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
     * Apply widget configuration to DOM (visibility + order)
     */
    applyConfig() {
        const config = this.getConfig();
        const main = document.querySelector('.main-content');

        document.querySelectorAll('[data-widget]').forEach(element => {
            const widgetId = element.getAttribute('data-widget');
            const widgetConfig = config[widgetId];

            if (widgetConfig && !widgetConfig.enabled) {
                element.style.display = 'none';
            } else {
                element.style.display = '';
            }

            // Apply CSS order for drag-reorder
            if (widgetConfig && widgetConfig.order != null) {
                element.style.order = widgetConfig.order;
            }
        });

        // Make main-content a flex column so `order` works
        if (main) {
            main.style.display = 'flex';
            main.style.flexDirection = 'column';
        }
    },

    /**
     * Check if widget is enabled
     */
    isEnabled(widgetId) {
        const config = this.getConfig();
        return config[widgetId]?.enabled !== false;
    },

    /**
     * Show customization modal with drag-and-drop ordering
     */
    showCustomizeModal() {
        const lang = I18n?.currentLanguage || 'he';
        const isHebrew = lang === 'he';
        const config = this.getConfig();

        // Sort widgets by current order
        const sortedWidgets = [...this.widgets].sort((a, b) => {
            const oa = config[a.id]?.order ?? 999;
            const ob = config[b.id]?.order ?? 999;
            return oa - ob;
        });

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
                    <p style="color: var(--color-text-secondary); margin-bottom: 6px;">
                        ${isHebrew ? 'בחר אילו רכיבים להציג, וגרור לשינוי סדר:' : 'Select widgets to show, drag to reorder:'}
                    </p>
                    <p style="color: var(--color-text-secondary); font-size:0.78rem; margin-bottom: 16px;">
                        ${isHebrew ? '↕️ גרור ∙ ✓ הפעל/כבה' : '↕️ Drag to reorder ∙ ✓ Toggle'}
                    </p>
                    <div class="widget-list" id="widgetDragList">
                        ${sortedWidgets.map(widget => {
                            const isEnabled = config[widget.id]?.enabled !== false;
                            const name = widget.name[lang] || widget.name.en;
                            return `
                                <div class="widget-item ${isEnabled ? 'enabled' : ''}"
                                     data-widget-id="${widget.id}"
                                     draggable="true">
                                    <div class="widget-drag-handle" title="${isHebrew ? 'גרור לשינוי סדר' : 'Drag to reorder'}">⠿</div>
                                    <div class="widget-icon">${widget.icon}</div>
                                    <div class="widget-info">
                                        <div class="widget-name">${name}</div>
                                    </div>
                                    <div class="widget-toggle">
                                        <input type="checkbox" ${isEnabled ? 'checked' : ''}
                                               onclick="event.stopPropagation(); WidgetManager.toggleWidgetFromModal('${widget.id}')">
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="WidgetManager.resetToDefault()">
                        ${isHebrew ? '↩️ איפוס' : '↩️ Reset'}
                    </button>
                    <button class="btn btn-primary" onclick="WidgetManager.closeModal()">
                        ${isHebrew ? 'סיום' : 'Done'}
                    </button>
                </div>
            </div>
        `;

        // Styles
        const style = document.createElement('style');
        style.id = 'widget-modal-styles';
        style.textContent = `
            .widget-list { display: flex; flex-direction: column; gap: 8px; }
            .widget-item {
                display: flex; align-items: center; gap: 12px;
                padding: 12px 14px;
                background: var(--color-bg-hover);
                border-radius: 10px;
                cursor: default;
                transition: all 0.2s;
                border: 2px solid transparent;
                user-select: none;
            }
            .widget-item:hover { background: var(--color-bg-card); }
            .widget-item.enabled { border-color: var(--color-primary); }
            .widget-item.drag-over { border-color: #f59e0b; background: rgba(245,158,11,0.06); }
            .widget-item.dragging { opacity: 0.4; }
            .widget-drag-handle {
                font-size: 1.1rem; color: var(--color-text-secondary);
                cursor: grab; padding: 2px 4px; line-height: 1;
                flex-shrink: 0;
            }
            .widget-drag-handle:active { cursor: grabbing; }
            .widget-icon { font-size: 1.4rem; flex-shrink: 0; }
            .widget-info { flex: 1; }
            .widget-name { font-weight: 500; font-size: 0.92rem; }
            .widget-toggle input { width: 20px; height: 20px; cursor: pointer; }
        `;
        if (!document.getElementById('widget-modal-styles')) {
            document.head.appendChild(style);
        }

        document.body.appendChild(modal);

        // Wire up drag-and-drop ordering
        this._initDragOrder(document.getElementById('widgetDragList'));
    },

    /**
     * Init drag-to-reorder on widget list
     */
    _initDragOrder(list) {
        if (!list) return;
        let dragSrc = null;

        list.addEventListener('dragstart', (e) => {
            dragSrc = e.target.closest('.widget-item');
            if (!dragSrc) return;
            dragSrc.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });

        list.addEventListener('dragend', () => {
            list.querySelectorAll('.widget-item').forEach(el => {
                el.classList.remove('dragging', 'drag-over');
            });
            dragSrc = null;
        });

        list.addEventListener('dragover', (e) => {
            e.preventDefault();
            const target = e.target.closest('.widget-item');
            if (!target || target === dragSrc) return;
            list.querySelectorAll('.widget-item').forEach(el => el.classList.remove('drag-over'));
            target.classList.add('drag-over');
        });

        list.addEventListener('drop', (e) => {
            e.preventDefault();
            const target = e.target.closest('.widget-item');
            if (!target || !dragSrc || target === dragSrc) return;

            // Reorder in DOM
            const items = [...list.querySelectorAll('.widget-item')];
            const srcIdx = items.indexOf(dragSrc);
            const tgtIdx = items.indexOf(target);
            if (srcIdx < tgtIdx) {
                list.insertBefore(dragSrc, target.nextSibling);
            } else {
                list.insertBefore(dragSrc, target);
            }

            // Save new order to config
            const config = this.getConfig();
            [...list.querySelectorAll('.widget-item')].forEach((el, i) => {
                const id = el.dataset.widgetId;
                if (id) {
                    if (!config[id]) config[id] = { enabled: true };
                    config[id].order = i;
                }
            });
            this.saveConfig(config);
            this.applyConfig();
        });
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
