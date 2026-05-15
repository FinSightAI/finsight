/**
 * Alerts & Budget Module - Budget limits and notifications
 */
const Alerts = {
    STORAGE_KEY: 'finance_alerts',

    /**
     * Get alerts configuration
     */
    getConfig() {
        return Storage.get(this.STORAGE_KEY) || {
            budgets: {
                total: 0, // Total monthly budget
                categories: {} // Per-category budgets
            },
            thresholds: {
                warning: 80,  // Warning at this percentage
                danger: 100   // Danger at this percentage
            },
            enabled: true,
            lastCheck: null
        };
    },

    /**
     * Set alert thresholds
     */
    setThresholds(warning, danger) {
        const config = this.getConfig();
        config.thresholds = { warning, danger };
        this.saveConfig(config);
    },

    /**
     * Get thresholds
     */
    getThresholds() {
        const config = this.getConfig();
        return config.thresholds || { warning: 80, danger: 100 };
    },

    /**
     * Save alerts configuration
     */
    saveConfig(config) {
        Storage.set(this.STORAGE_KEY, config);
    },

    /**
     * Set total monthly budget
     */
    setTotalBudget(amount) {
        const config = this.getConfig();
        config.budgets.total = amount;
        this.saveConfig(config);
    },

    /**
     * Set category budget
     */
    setCategoryBudget(category, amount) {
        const config = this.getConfig();
        config.budgets.categories[category] = amount;
        this.saveConfig(config);
    },

    /**
     * Get all budgets
     */
    getBudgets() {
        return this.getConfig().budgets;
    },

    /**
     * Check budget status and return alerts
     */
    checkBudgets() {
        const config = this.getConfig();
        const thresholds = config.thresholds || { warning: 80, danger: 100 };
        const alerts = [];
        const currentMonth = new Date().toISOString().slice(0, 7);

        // Get current month expenses
        const creditData = Storage.getCreditCards();
        const monthExpenses = creditData.expenses.filter(e => e.date.startsWith(currentMonth));

        // Calculate total spent
        const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

        // Check total budget
        if (config.budgets.total > 0) {
            const percentage = (totalSpent / config.budgets.total) * 100;
            if (percentage >= thresholds.danger) {
                alerts.push({
                    type: 'danger',
                    icon: '🚨',
                    title: I18n.currentLanguage === 'he' ? 'חריגה מהתקציב!' : 'Budget Exceeded!',
                    message: I18n.currentLanguage === 'he'
                        ? `הוצאת ${I18n.formatCurrency(totalSpent)} מתוך ${I18n.formatCurrency(config.budgets.total)}`
                        : `Spent ${I18n.formatCurrency(totalSpent)} of ${I18n.formatCurrency(config.budgets.total)}`,
                    percentage
                });
            } else if (percentage >= thresholds.warning) {
                alerts.push({
                    type: 'warning',
                    icon: '⚠️',
                    title: I18n.currentLanguage === 'he' ? 'מתקרב לתקציב' : 'Approaching Budget',
                    message: I18n.currentLanguage === 'he'
                        ? `הוצאת ${percentage.toFixed(0)}% מהתקציב החודשי`
                        : `Spent ${percentage.toFixed(0)}% of monthly budget`,
                    percentage
                });
            }
        }

        // Check category budgets
        const categoryTotals = {};
        monthExpenses.forEach(e => {
            categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
        });

        Object.entries(config.budgets.categories).forEach(([category, budget]) => {
            if (budget > 0) {
                const spent = categoryTotals[category] || 0;
                const percentage = (spent / budget) * 100;

                if (percentage >= thresholds.danger) {
                    alerts.push({
                        type: 'danger',
                        icon: '🚨',
                        category,
                        title: I18n.currentLanguage === 'he'
                            ? `חריגה ב${I18n.t('credit.categories.' + category)}`
                            : `${I18n.t('credit.categories.' + category)} Exceeded`,
                        message: `${I18n.formatCurrency(spent)} / ${I18n.formatCurrency(budget)}`,
                        percentage
                    });
                } else if (percentage >= thresholds.warning) {
                    alerts.push({
                        type: 'warning',
                        icon: '⚠️',
                        category,
                        title: I18n.currentLanguage === 'he'
                            ? `${I18n.t('credit.categories.' + category)} - ${percentage.toFixed(0)}%`
                            : `${I18n.t('credit.categories.' + category)} - ${percentage.toFixed(0)}%`,
                        message: `${I18n.formatCurrency(spent)} / ${I18n.formatCurrency(budget)}`,
                        percentage
                    });
                }
            }
        });

        return alerts;
    },

    /**
     * Get budget progress for display
     */
    getBudgetProgress() {
        const config = this.getConfig();
        const currentMonth = new Date().toISOString().slice(0, 7);
        const creditData = Storage.getCreditCards();
        const monthExpenses = creditData.expenses.filter(e => e.date.startsWith(currentMonth));

        const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
        const totalBudget = config.budgets.total;

        // Category breakdown
        const categoryTotals = {};
        monthExpenses.forEach(e => {
            categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
        });

        const categories = Object.entries(config.budgets.categories).map(([category, budget]) => ({
            category,
            budget,
            spent: categoryTotals[category] || 0,
            percentage: budget > 0 ? ((categoryTotals[category] || 0) / budget) * 100 : 0
        }));

        return {
            total: {
                budget: totalBudget,
                spent: totalSpent,
                remaining: totalBudget - totalSpent,
                percentage: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
            },
            categories
        };
    },

    /**
     * Render alerts HTML
     */
    renderAlerts(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const alerts = this.checkBudgets();

        if (alerts.length === 0) {
            container.innerHTML = '';
            return;
        }

        const _esc = (s) => (window.sanitize ? window.sanitize(s) : String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])));
        container.innerHTML = alerts.map(alert => `
            <div class="alert alert-${_esc(alert.type)}">
                <span class="alert-icon">${_esc(alert.icon)}</span>
                <div class="alert-content">
                    <strong>${_esc(alert.title)}</strong>
                    <p>${_esc(alert.message)}</p>
                </div>
            </div>
        `).join('');
    },

    checkSmartAlerts() {
        const triggered = [];
        const fmt = n => (typeof I18n !== 'undefined' && I18n.formatCurrency) ? I18n.formatCurrency(n) : '₪' + Math.round(n).toLocaleString('he-IL');
        const config = this.getConfig();

        // 1. Bank balance below threshold
        const balanceThreshold = config.bankBalanceThreshold || 0;
        if (balanceThreshold > 0) {
            const bankTotal = Storage.getTotalBankBalance?.() || 0;
            if (bankTotal < balanceThreshold) {
                triggered.push({
                    key: 'low_bank_balance',
                    title: '🏦 יתרת בנק נמוכה',
                    body: `יתרה ${fmt(bankTotal)} — מתחת לסף ${fmt(balanceThreshold)}`,
                    type: 'danger'
                });
            }
        }

        // 2. Monthly expenses > X% of monthly income
        const incomeAlert = config.incomeExpenseAlert || 0;
        if (incomeAlert > 0) {
            try {
                const incomeEntries = Storage.get('finance_income') || [];
                const monthlyIncome = incomeEntries.reduce((s, e) => {
                    if (e.frequency === 'monthly') return s + (e.amount || 0);
                    if (e.frequency === 'annual') return s + (e.amount || 0) / 12;
                    return s;
                }, 0);
                if (monthlyIncome > 0) {
                    const mon = new Date();
                    const monStr = `${mon.getFullYear()}-${String(mon.getMonth()+1).padStart(2,'0')}`;
                    const expenses = Storage.getTotalCreditExpenses?.(monStr) || 0;
                    const pct = (expenses / monthlyIncome) * 100;
                    if (pct >= incomeAlert) {
                        triggered.push({
                            key: 'high_expense_ratio',
                            title: '💸 הוצאות גבוהות',
                            body: `הוצאת ${pct.toFixed(0)}% מההכנסה החודשית (${fmt(expenses)} מתוך ${fmt(monthlyIncome)})`,
                            type: pct >= 100 ? 'danger' : 'warning'
                        });
                    }
                }
            } catch(e) {}
        }

        // 3. Loan payment coming in next 3 days
        try {
            const loans = Storage.getLoans?.() || Storage.get('finance_loans') || [];
            const today = new Date();
            const todayDay = today.getDate();
            loans.forEach(loan => {
                const payDay = parseInt(loan.paymentDay) || 1;
                const diff = payDay - todayDay;
                if (diff >= 0 && diff <= 3 && loan.monthlyPayment > 0) {
                    triggered.push({
                        key: `loan_due_${loan.id}`,
                        title: '🏦 תשלום הלוואה בקרוב',
                        body: `${loan.name || 'הלוואה'}: ${fmt(loan.monthlyPayment)} בעוד ${diff === 0 ? 'היום' : diff + ' ימים'}`,
                        type: 'warning'
                    });
                }
            });
        } catch(e) {}

        // 4. Subscription total over 500₪/month
        try {
            const subs = Storage.getSubscriptions?.() || Storage.get('finance_subscriptions') || [];
            const monthlyTotal = subs.reduce((s, x) => {
                const amt = parseFloat(x.amount) || 0;
                const freq = x.frequency || 'monthly';
                const m = freq === 'annual' ? amt/12 : freq === 'quarterly' ? amt/3 : freq === 'weekly' ? amt*4.3 : amt;
                return s + m;
            }, 0);
            const subThreshold = config.subscriptionThreshold || 500;
            if (monthlyTotal > subThreshold) {
                triggered.push({
                    key: 'high_subscriptions',
                    title: '🔄 מנויים גבוהים',
                    body: `סה״כ מנויים: ${fmt(monthlyTotal)}/חודש — שווה לבדוק מה ניתן לבטל`,
                    type: 'warning'
                });
            }
        } catch(e) {}

        return triggered;
    },

    /**
     * Fire push notifications for triggered smart alerts (once per day per key)
     */
    async fireSmartAlertNotifications() {
        if (typeof Notifications === 'undefined' || Notifications.getPermission() !== 'granted') return;
        const today = new Date().toISOString().split('T')[0];
        const sentKey = 'finance_smart_alerts_sent_' + today;
        let sent = [];
        try { sent = JSON.parse(localStorage.getItem(sentKey) || '[]'); } catch(e) {}

        const alerts = this.checkSmartAlerts();
        for (const alert of alerts) {
            if (sent.includes(alert.key)) continue;
            await Notifications.show(alert.title, {
                body: alert.body,
                tag: alert.key,
                type: alert.type
            });
            sent.push(alert.key);
        }
        try { localStorage.setItem(sentKey, JSON.stringify(sent)); } catch(e) {}
    },

    setBankBalanceThreshold(amount) {
        const config = this.getConfig();
        config.bankBalanceThreshold = amount;
        this.saveConfig(config);
    },

    setIncomeExpenseAlert(pct) {
        const config = this.getConfig();
        config.incomeExpenseAlert = pct;
        this.saveConfig(config);
    }
};

// Make available globally
window.Alerts = Alerts;
