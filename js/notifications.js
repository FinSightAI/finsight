/**
 * Notifications Module - PWA Push Notifications
 */
const Notifications = {
    STORAGE_KEY: 'finance_notifications',

    // Default settings
    DEFAULT_SETTINGS: {
        enabled: false,
        stockAlerts: true,
        budgetWarnings: true,
        monthlyReminder: true,
        reminderDay: 1, // Day of month for reminder
        lastNotifications: []
    },

    /**
     * Check if notifications are supported
     */
    isSupported() {
        return 'Notification' in window && 'serviceWorker' in navigator;
    },

    /**
     * Get current permission status
     */
    getPermission() {
        if (!this.isSupported()) return 'unsupported';
        return Notification.permission;
    },

    /**
     * Request notification permission
     */
    async requestPermission() {
        if (!this.isSupported()) {
            return { success: false, error: 'Notifications not supported' };
        }

        try {
            const permission = await Notification.requestPermission();

            if (permission === 'granted') {
                this.updateSettings({ enabled: true });
                return { success: true, permission };
            } else {
                return { success: false, permission };
            }
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get notification settings
     */
    getSettings() {
        try {
            const data = Storage.get(Storage.KEYS.NOTIFICATIONS);
            if (data) {
                return { ...this.DEFAULT_SETTINGS, ...data };
            }
        } catch (error) {
            console.error('Error getting notification settings:', error);
        }
        return { ...this.DEFAULT_SETTINGS };
    },

    /**
     * Update notification settings
     */
    updateSettings(updates) {
        const settings = this.getSettings();
        const newSettings = { ...settings, ...updates };
        Storage.set(Storage.KEYS.NOTIFICATIONS, newSettings);
        return newSettings;
    },

    /**
     * Show a notification
     */
    async show(title, options = {}) {
        if (!this.isSupported() || Notification.permission !== 'granted') {

            return false;
        }

        const settings = this.getSettings();
        if (!settings.enabled) {
            return false;
        }

        try {
            const defaultOptions = {
                icon: '💰',
                badge: '💰',
                tag: options.tag || 'finance-notification',
                requireInteraction: false,
                silent: false,
                ...options
            };

            // Try to use service worker notification for better support
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                const registration = await navigator.serviceWorker.ready;
                await registration.showNotification(title, defaultOptions);
            } else {
                new Notification(title, defaultOptions);
            }

            // Log notification
            this.logNotification(title, options);

            return true;
        } catch (error) {
            console.error('Error showing notification:', error);
            return false;
        }
    },

    /**
     * Log notification to history
     */
    logNotification(title, options) {
        const settings = this.getSettings();
        const notification = {
            id: Date.now(),
            title,
            body: options.body || '',
            type: options.type || 'general',
            timestamp: new Date().toISOString()
        };

        settings.lastNotifications = [notification, ...settings.lastNotifications].slice(0, 50);
        this.updateSettings({ lastNotifications: settings.lastNotifications });
    },

    /**
     * Stock alert notification
     */
    async notifyStockAlert(alert, currentData) {
        const settings = this.getSettings();
        if (!settings.stockAlerts) return;

        const title = `🔔 התראת מניה: ${alert.symbol}`;
        let body = '';

        switch (alert.type) {
            case 'price_above':
                body = `המחיר הגיע ל-${currentData.currentPrice?.toFixed(2)} (מעל ${alert.value})`;
                break;
            case 'price_below':
                body = `המחיר ירד ל-${currentData.currentPrice?.toFixed(2)} (מתחת ל-${alert.value})`;
                break;
            case 'percent_change':
                body = `שינוי של ${currentData.priceChangePercent?.toFixed(2)}%`;
                break;
            case 'ma150_cross_above':
                body = `המחיר חצה את ה-MA150 מלמעלה`;
                break;
            case 'ma150_cross_below':
                body = `המחיר חצה את ה-MA150 מלמטה`;
                break;
        }

        return this.show(title, {
            body,
            type: 'stock_alert',
            tag: `stock-${alert.symbol}-${alert.type}`,
            data: { url: '/pages/stocks.html' }
        });
    },

    /**
     * Budget warning notification
     */
    async notifyBudgetWarning(category, spent, budget, percentage) {
        const settings = this.getSettings();
        if (!settings.budgetWarnings) return;

        const title = `⚠️ התראת תקציב`;
        const body = `הגעת ל-${percentage.toFixed(0)}% מהתקציב בקטגוריה ${category}`;

        return this.show(title, {
            body,
            type: 'budget_warning',
            tag: `budget-${category}`,
            data: { url: '/pages/reports.html' }
        });
    },

    /**
     * Monthly reminder notification
     */
    async notifyMonthlyReminder() {
        const settings = this.getSettings();
        if (!settings.monthlyReminder) return;

        const title = `📊 תזכורת חודשית`;
        const body = `הגיע הזמן לעדכן את הקרנות והקופות שלך`;

        return this.show(title, {
            body,
            type: 'monthly_reminder',
            tag: 'monthly-reminder',
            data: { url: '/pages/funds-update.html' }
        });
    },

    /**
     * Check if monthly reminder should be shown
     */
    checkMonthlyReminder() {
        const settings = this.getSettings();
        if (!settings.monthlyReminder) return;

        const now = new Date();
        const reminderDay = settings.reminderDay || 1;

        // Check if today is the reminder day
        if (now.getDate() === reminderDay) {
            const lastReminder = settings.lastMonthlyReminder;
            const currentMonth = `${now.getFullYear()}-${now.getMonth() + 1}`;

            // Only show once per month
            if (lastReminder !== currentMonth) {
                this.updateSettings({ lastMonthlyReminder: currentMonth });
                this.notifyMonthlyReminder();
            }
        }
    },

    /**
     * Unusual expense notification
     */
    async notifyUnusualExpense(expense, averageForCategory) {
        const title = `💸 הוצאה חריגה`;
        const body = `${expense.description}: ₪${expense.amount} (ממוצע: ₪${averageForCategory.toFixed(0)})`;

        return this.show(title, {
            body,
            type: 'unusual_expense',
            tag: `expense-${expense.id}`,
            data: { url: '/pages/credit.html' }
        });
    },

    /**
     * Weekly/monthly financial summary notification
     */
    async notifyWeeklySummary() {
        const settings = this.getSettings();
        if (!settings.enabled) return false;

        try {
            const netWorth  = Storage.getNetWorth?.() || 0;
            const expenses  = Storage.getTotalCreditExpenses?.(
                (() => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}`; })()
            ) || 0;
            const fmt = n => '₪' + Math.round(n).toLocaleString('he-IL');

            const title = '📊 הסיכום הפיננסי השבועי שלך מוכן';
            const body  = `שווי נקי: ${fmt(netWorth)}  |  הוצאות החודש: ${fmt(expenses)}\nלחץ לפתיחה ושיתוף`;

            return this.show(title, {
                body,
                type: 'weekly_summary',
                tag:  'weekly-summary',
                requireInteraction: true,
                data: { url: '/' }
            });
        } catch (e) {
            console.warn('notifyWeeklySummary error:', e);
            return false;
        }
    },

    /**
     * Get notification history
     */
    getHistory() {
        return this.getSettings().lastNotifications || [];
    },

    /**
     * Clear notification history
     */
    clearHistory() {
        this.updateSettings({ lastNotifications: [] });
    }
};

// Make available globally
window.Notifications = Notifications;

// Check for monthly reminder on load
document.addEventListener('DOMContentLoaded', () => {
    if (Notifications.getPermission() === 'granted') {
        Notifications.checkMonthlyReminder();
    }
});
