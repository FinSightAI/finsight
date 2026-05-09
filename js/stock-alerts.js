/**
 * Stock Alerts Module - Manages watchlist and price alerts
 */
const StockAlerts = {
    STORAGE_KEY: 'finance_stock_alerts',

    // Alert types
    ALERT_TYPES: {
        PRICE_ABOVE: 'price_above',
        PRICE_BELOW: 'price_below',
        PERCENT_CHANGE: 'percent_change',
        MA150_CROSS_ABOVE: 'ma150_cross_above',
        MA150_CROSS_BELOW: 'ma150_cross_below'
    },

    // Default configuration
    DEFAULT_CONFIG: {
        watchlist: [],
        alerts: [],
        settings: {
            autoRefresh: true,
            refreshInterval: 60, // seconds
            showMA150: true,
            notifyOnTrigger: true
        },
        cache: {
            prices: {},
            lastFullUpdate: null
        }
    },

    /**
     * Get all stock alerts configuration
     * @returns {Object} Stock alerts config
     */
    getConfig() {
        try {
            const data = Storage.get(Storage.KEYS.STOCK_ALERTS);
            if (data) {
                // Merge with defaults to ensure all properties exist
                return {
                    ...this.DEFAULT_CONFIG,
                    ...data,
                    settings: { ...this.DEFAULT_CONFIG.settings, ...data.settings },
                    cache: { ...this.DEFAULT_CONFIG.cache, ...data.cache }
                };
            }
        } catch (error) {
            console.error('Error getting stock alerts config:', error);
        }
        return { ...this.DEFAULT_CONFIG };
    },

    /**
     * Save stock alerts configuration
     * @param {Object} config - Configuration to save
     */
    saveConfig(config) {
        try {
            Storage.set(Storage.KEYS.STOCK_ALERTS, config);
        } catch (error) {
            console.error('Error saving stock alerts config:', error);
        }
    },

    // ========== Watchlist Management ==========

    /**
     * Get watchlist
     * @returns {Array} Watchlist items
     */
    getWatchlist() {
        return this.getConfig().watchlist;
    },

    /**
     * Add stock to watchlist
     * @param {string} symbol - Stock symbol
     * @param {string} name - Company name
     * @param {string} market - Market code ('US' or 'IL')
     * @returns {Object} Added watchlist item
     */
    addToWatchlist(symbol, name, market = 'US') {
        const config = this.getConfig();
        const upperSymbol = symbol.toUpperCase();

        // Check if already exists
        if (config.watchlist.some(w => w.symbol.toUpperCase() === upperSymbol)) {
            return null; // Already in watchlist
        }

        const item = {
            id: Storage.generateId(),
            symbol: upperSymbol,
            name: name || upperSymbol,
            market,
            addedAt: new Date().toISOString().split('T')[0]
        };

        config.watchlist.push(item);
        this.saveConfig(config);
        return item;
    },

    /**
     * Remove stock from watchlist
     * @param {string} symbolOrId - Stock symbol or watchlist item ID
     */
    removeFromWatchlist(symbolOrId) {
        const config = this.getConfig();
        const upperSymbol = symbolOrId.toUpperCase();

        config.watchlist = config.watchlist.filter(w =>
            w.id !== symbolOrId && w.symbol.toUpperCase() !== upperSymbol
        );

        // Also remove related alerts
        config.alerts = config.alerts.filter(a =>
            a.symbol.toUpperCase() !== upperSymbol
        );

        this.saveConfig(config);
    },

    /**
     * Update watchlist item
     * @param {string} id - Watchlist item ID
     * @param {Object} updates - Updates to apply
     * @returns {Object|null} Updated item or null
     */
    updateWatchlistItem(id, updates) {
        const config = this.getConfig();
        const index = config.watchlist.findIndex(w => w.id === id);

        if (index !== -1) {
            config.watchlist[index] = { ...config.watchlist[index], ...updates };
            this.saveConfig(config);
            return config.watchlist[index];
        }
        return null;
    },

    // ========== Alert Management ==========

    /**
     * Get all alerts
     * @returns {Array} All alerts
     */
    getAlerts() {
        return this.getConfig().alerts;
    },

    /**
     * Get alerts for a specific symbol
     * @param {string} symbol - Stock symbol
     * @returns {Array} Alerts for the symbol
     */
    getAlertsForSymbol(symbol) {
        const upperSymbol = symbol.toUpperCase();
        return this.getAlerts().filter(a => a.symbol.toUpperCase() === upperSymbol);
    },

    /**
     * Add new alert
     * @param {string} symbol - Stock symbol
     * @param {string} type - Alert type
     * @param {number} value - Target value
     * @returns {Object} Created alert
     */
    addAlert(symbol, type, value) {
        const config = this.getConfig();

        const alert = {
            id: Storage.generateId(),
            symbol: symbol.toUpperCase(),
            type,
            value: parseFloat(value),
            enabled: true,
            triggered: false,
            triggeredAt: null,
            createdAt: new Date().toISOString().split('T')[0]
        };

        config.alerts.push(alert);
        this.saveConfig(config);
        return alert;
    },

    /**
     * Remove alert
     * @param {string} alertId - Alert ID
     */
    removeAlert(alertId) {
        const config = this.getConfig();
        config.alerts = config.alerts.filter(a => a.id !== alertId);
        this.saveConfig(config);
    },

    /**
     * Toggle alert enabled state
     * @param {string} alertId - Alert ID
     * @returns {Object|null} Updated alert or null
     */
    toggleAlert(alertId) {
        const config = this.getConfig();
        const alert = config.alerts.find(a => a.id === alertId);

        if (alert) {
            alert.enabled = !alert.enabled;
            if (alert.enabled) {
                // Reset triggered state when re-enabling
                alert.triggered = false;
                alert.triggeredAt = null;
            }
            this.saveConfig(config);
            return alert;
        }
        return null;
    },

    /**
     * Reset triggered alert
     * @param {string} alertId - Alert ID
     */
    resetAlert(alertId) {
        const config = this.getConfig();
        const alert = config.alerts.find(a => a.id === alertId);

        if (alert) {
            alert.triggered = false;
            alert.triggeredAt = null;
            this.saveConfig(config);
        }
    },

    // ========== Alert Checking ==========

    /**
     * Check all enabled alerts against current prices
     * @param {Object} priceData - Map of symbol to price data
     * @returns {Array} Newly triggered alerts
     */
    checkAlerts(priceData) {
        const config = this.getConfig();
        const newlyTriggered = [];

        config.alerts.forEach(alert => {
            if (!alert.enabled || alert.triggered) {
                return;
            }

            const symbolData = priceData[alert.symbol] || priceData[alert.symbol.replace('.TA', '')];
            if (!symbolData || !symbolData.success) {
                return;
            }

            const { currentPrice, ma150, priceChangePercent, previousClose } = symbolData;
            let isTriggered = false;

            switch (alert.type) {
                case this.ALERT_TYPES.PRICE_ABOVE:
                    isTriggered = currentPrice >= alert.value;
                    break;

                case this.ALERT_TYPES.PRICE_BELOW:
                    isTriggered = currentPrice <= alert.value;
                    break;

                case this.ALERT_TYPES.PERCENT_CHANGE:
                    isTriggered = Math.abs(priceChangePercent) >= Math.abs(alert.value);
                    break;

                case this.ALERT_TYPES.MA150_CROSS_ABOVE:
                    // Check if price crossed above MA150
                    if (ma150 !== null && previousClose !== null) {
                        const wasBelow = previousClose < ma150;
                        const isAbove = currentPrice >= ma150;
                        isTriggered = wasBelow && isAbove;
                    }
                    break;

                case this.ALERT_TYPES.MA150_CROSS_BELOW:
                    // Check if price crossed below MA150
                    if (ma150 !== null && previousClose !== null) {
                        const wasAbove = previousClose > ma150;
                        const isBelow = currentPrice <= ma150;
                        isTriggered = wasAbove && isBelow;
                    }
                    break;
            }

            if (isTriggered) {
                alert.triggered = true;
                alert.triggeredAt = new Date().toISOString();
                alert.lastPrice = currentPrice;
                alert.lastMA150 = ma150;
                newlyTriggered.push({ ...alert, currentData: symbolData });
            }
        });

        this.saveConfig(config);
        // Fire browser notifications for newly triggered alerts (if user opted in)
        if (newlyTriggered.length && config.settings?.notifyOnTrigger !== false) {
            newlyTriggered.forEach(a => this._fireNotification(a));
        }
        return newlyTriggered;
    },

    _fireNotification(alert) {
        if (!('Notification' in window) || Notification.permission !== 'granted') return;
        const lang = (typeof I18n !== 'undefined' && I18n.currentLang) || localStorage.getItem('wl_lang') || 'he';
        const labels = ({
            he: { title: '📈 התראת מניה — WizeMoney', above: 'עלה מעל', below: 'ירד מתחת', pct: 'תזוזה של', goldcross: 'חצה את MA150 כלפי מעלה', deathcross: 'חצה את MA150 כלפי מטה' },
            en: { title: '📈 Stock Alert — WizeMoney', above: 'rose above', below: 'fell below', pct: 'moved by', goldcross: 'crossed above MA150', deathcross: 'crossed below MA150' },
            pt: { title: '📈 Alerta — WizeMoney', above: 'subiu acima de', below: 'caiu abaixo de', pct: 'variou', goldcross: 'cruzou acima MA150', deathcross: 'cruzou abaixo MA150' },
            es: { title: '📈 Alerta — WizeMoney', above: 'subió arriba de', below: 'cayó debajo de', pct: 'se movió', goldcross: 'cruzó arriba MA150', deathcross: 'cruzó abajo MA150' },
        })[lang] || { title: 'Stock Alert', above: 'above', below: 'below', pct: 'moved', goldcross: 'above MA150', deathcross: 'below MA150' };
        let body;
        switch (alert.type) {
            case this.ALERT_TYPES.PRICE_ABOVE:        body = `${alert.symbol} ${labels.above} ${alert.value} (current: ${alert.lastPrice})`; break;
            case this.ALERT_TYPES.PRICE_BELOW:        body = `${alert.symbol} ${labels.below} ${alert.value} (current: ${alert.lastPrice})`; break;
            case this.ALERT_TYPES.PERCENT_CHANGE:     body = `${alert.symbol} ${labels.pct} ${alert.value}%`; break;
            case this.ALERT_TYPES.MA150_CROSS_ABOVE:  body = `${alert.symbol} ${labels.goldcross}`; break;
            case this.ALERT_TYPES.MA150_CROSS_BELOW:  body = `${alert.symbol} ${labels.deathcross}`; break;
            default: body = alert.symbol;
        }
        try {
            new Notification(labels.title, { body, icon: '/finsight/img/logo.svg', tag: `wize-alert-${alert.id || alert.symbol}` });
        } catch {}
    },

    // Request browser permission for notifications. Call once from a UI button.
    async requestNotificationPermission() {
        if (!('Notification' in window)) return 'unsupported';
        return await Notification.requestPermission();
    },

    /**
     * Get all triggered alerts
     * @returns {Array} Triggered alerts
     */
    getTriggeredAlerts() {
        return this.getAlerts().filter(a => a.triggered);
    },

    // ========== Price Cache ==========

    /**
     * Update price cache for a symbol
     * @param {string} symbol - Stock symbol
     * @param {Object} data - Price data to cache
     */
    updatePriceCache(symbol, data) {
        const config = this.getConfig();
        config.cache.prices[symbol.toUpperCase()] = {
            ...data,
            cachedAt: new Date().toISOString()
        };
        config.cache.lastFullUpdate = new Date().toISOString();
        this.saveConfig(config);
    },

    /**
     * Get cached price for a symbol
     * @param {string} symbol - Stock symbol
     * @returns {Object|null} Cached data or null
     */
    getCachedPrice(symbol) {
        const config = this.getConfig();
        return config.cache.prices[symbol.toUpperCase()] || null;
    },

    /**
     * Get all cached prices
     * @returns {Object} All cached prices
     */
    getAllCachedPrices() {
        return this.getConfig().cache.prices;
    },

    /**
     * Clear price cache
     */
    clearCache() {
        const config = this.getConfig();
        config.cache.prices = {};
        config.cache.lastFullUpdate = null;
        this.saveConfig(config);
    },

    // ========== Settings ==========

    /**
     * Get settings
     * @returns {Object} Settings
     */
    getSettings() {
        return this.getConfig().settings;
    },

    /**
     * Update settings
     * @param {Object} updates - Settings to update
     */
    updateSettings(updates) {
        const config = this.getConfig();
        config.settings = { ...config.settings, ...updates };
        this.saveConfig(config);
    },

    // ========== Utilities ==========

    /**
     * Get alert type display name
     * @param {string} type - Alert type
     * @returns {string} Display name
     */
    getAlertTypeName(type) {
        const names = {
            [this.ALERT_TYPES.PRICE_ABOVE]: 'מחיר מעל',
            [this.ALERT_TYPES.PRICE_BELOW]: 'מחיר מתחת',
            [this.ALERT_TYPES.PERCENT_CHANGE]: 'שינוי אחוזי',
            [this.ALERT_TYPES.MA150_CROSS_ABOVE]: 'חציית MA150 מעלה',
            [this.ALERT_TYPES.MA150_CROSS_BELOW]: 'חציית MA150 מטה'
        };
        return names[type] || type;
    },

    /**
     * Get alert type display name (English)
     * @param {string} type - Alert type
     * @returns {string} Display name
     */
    getAlertTypeNameEn(type) {
        const names = {
            [this.ALERT_TYPES.PRICE_ABOVE]: 'Price Above',
            [this.ALERT_TYPES.PRICE_BELOW]: 'Price Below',
            [this.ALERT_TYPES.PERCENT_CHANGE]: 'Percent Change',
            [this.ALERT_TYPES.MA150_CROSS_ABOVE]: 'MA150 Cross Above',
            [this.ALERT_TYPES.MA150_CROSS_BELOW]: 'MA150 Cross Below'
        };
        return names[type] || type;
    },

    /**
     * Format alert message
     * @param {Object} alert - Alert object
     * @param {Object} currentData - Current price data
     * @returns {string} Formatted message
     */
    formatAlertMessage(alert, currentData) {
        const symbol = alert.symbol;
        const price = currentData?.currentPrice?.toFixed(2) || 'N/A';

        switch (alert.type) {
            case this.ALERT_TYPES.PRICE_ABOVE:
                return `${symbol} הגיע למחיר ${price} (מעל ${alert.value})`;
            case this.ALERT_TYPES.PRICE_BELOW:
                return `${symbol} הגיע למחיר ${price} (מתחת ל-${alert.value})`;
            case this.ALERT_TYPES.PERCENT_CHANGE:
                return `${symbol} שינוי של ${currentData?.priceChangePercent?.toFixed(2)}%`;
            case this.ALERT_TYPES.MA150_CROSS_ABOVE:
                return `${symbol} חצה את MA150 מלמעלה`;
            case this.ALERT_TYPES.MA150_CROSS_BELOW:
                return `${symbol} חצה את MA150 מלמטה`;
            default:
                return `התראה: ${symbol}`;
        }
    }
};

// Make available globally
window.StockAlerts = StockAlerts;
