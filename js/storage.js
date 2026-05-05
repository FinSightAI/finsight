/**
 * Storage Module - Manages localStorage operations for the finance app
 */
const Storage = {
    _encryptionKey: null,
    _cache: Object.create(null),
    _skipEncryptionKeys: [
        'finance_settings', 'finance_pin_hash', 'finance_pin_salt',
        'finance_lock_timeout', 'finance_last_update'
    ],

    KEYS: {
        BANK_ACCOUNTS: 'finance_bank_accounts',
        CREDIT_CARDS: 'finance_credit_cards',
        STOCKS: 'finance_stocks',
        ASSETS: 'finance_assets',
        MY_FUNDS: 'finance_my_funds',
        SETTINGS: 'finance_settings',
        STOCK_ALERTS: 'finance_stock_alerts',
        TV_CUSTOM_SYMBOLS: 'finance_tv_custom_symbols',
        NOTIFICATIONS: 'finance_notifications',
        DASHBOARD_WIDGETS: 'finance_dashboard_widgets',
        IMPORT_TEMPLATES: 'finance_import_templates',
        USER_PROFILE: 'finance_user_profile',
        DISMISSED_TIPS: 'finance_dismissed_tips',
        LOANS: 'finance_loans',
        CREDIT_SCORE: 'finance_credit_score',
        SUBSCRIPTIONS: 'finance_subscriptions',
        SUMMARY_SCHEDULE: 'finance_summary_schedule'
    },

    /**
     * Check if a stored value is encrypted
     */
    _isEncrypted(key) {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return false;
            const parsed = JSON.parse(raw);
            return parsed && parsed.__enc === true;
        } catch { return false; }
    },

    /**
     * Get data from localStorage
     * During unlocked session: data is plain JSON (readable synchronously)
     * During locked session: encrypted data returns null
     */
    get(key) {
        if (key in this._cache) return this._cache[key];
        try {
            const raw = localStorage.getItem(key);
            if (!raw) { this._cache[key] = null; return null; }
            const parsed = JSON.parse(raw);
            if (parsed && parsed.__enc === true) return null; // don't cache encrypted values
            this._cache[key] = parsed;
            return parsed;
        } catch (error) {
            console.error('Storage get error:', error);
            return null;
        }
    },

    /**
     * Set data in localStorage (plain JSON — encryption happens on lock)
     */
    set(key, data) {
        try {
            this._cache[key] = data;
            localStorage.setItem(key, JSON.stringify(data));
            // Warn if approaching 5MB localStorage limit
            if (typeof IDB !== 'undefined' && IDB.isNearLimit()) {
                console.warn(`Storage: localStorage near limit (${IDB.getUsageMB()} MB). Consider clearing old data.`);
            }
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                console.error('Storage: localStorage quota exceeded! Triggering IDB migration...');
                if (typeof IDB !== 'undefined') IDB.migrateIfNeeded();
            } else {
                console.error('Storage set error:', error);
            }
        }
    },

    async _encrypt(data, cryptoKey) {
        const encoder = new TextEncoder();
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const plaintext = encoder.encode(JSON.stringify(data));
        const ciphertext = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            cryptoKey,
            plaintext
        );
        return {
            __enc: true,
            iv: btoa(String.fromCharCode(...iv)),
            data: btoa(String.fromCharCode(...new Uint8Array(ciphertext)))
        };
    },

    async _decrypt(ivB64, dataB64, cryptoKey) {
        const iv = Uint8Array.from(atob(ivB64), c => c.charCodeAt(0));
        const ciphertext = Uint8Array.from(atob(dataB64), c => c.charCodeAt(0));
        const plaintext = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            cryptoKey,
            ciphertext
        );
        return JSON.parse(new TextDecoder().decode(plaintext));
    },

    setEncryptionKey(cryptoKey) {
        this._encryptionKey = cryptoKey;
    },

    clearEncryptionKey() {
        this._encryptionKey = null;
    },

    /**
     * Decrypt all sensitive keys in-place (called on unlock)
     * After this, all data is plain JSON and get() works synchronously
     */
    async decryptAll(cryptoKey) {
        this._encryptionKey = cryptoKey;
        this._cache = Object.create(null);
        const allKeys = Object.keys(localStorage);
        for (const key of allKeys) {
            if (!key.startsWith('finance_')) continue;
            if (this._skipEncryptionKeys.includes(key)) continue;
            try {
                const raw = localStorage.getItem(key);
                if (!raw) continue;
                const parsed = JSON.parse(raw);
                if (!parsed || parsed.__enc !== true) continue;
                const decrypted = await this._decrypt(parsed.iv, parsed.data, cryptoKey);
                localStorage.setItem(key, JSON.stringify(decrypted));
            } catch (e) {
                console.error('Decrypt error for', key, e);
            }
        }
    },

    /**
     * Encrypt all sensitive keys in-place (called on lock)
     * After this, sensitive data is encrypted and get() returns null for them
     */
    async encryptAll(cryptoKey) {
        const key = cryptoKey || this._encryptionKey;
        if (!key) return;
        this._cache = Object.create(null);
        const allKeys = Object.keys(localStorage);
        for (const k of allKeys) {
            if (!k.startsWith('finance_')) continue;
            if (this._skipEncryptionKeys.includes(k)) continue;
            try {
                const raw = localStorage.getItem(k);
                if (!raw) continue;
                const parsed = JSON.parse(raw);
                if (parsed && parsed.__enc === true) continue;
                const enc = await this._encrypt(parsed, key);
                localStorage.setItem(k, JSON.stringify(enc));
            } catch (e) {
                console.error('Encrypt error for', k, e);
            }
        }
        this._encryptionKey = null;
    },

    /**
     * Migrate to encrypted (first time enabling PIN)
     */
    async migrateToEncrypted(cryptoKey) {
        await this.encryptAll(cryptoKey);
    },

    /**
     * Migrate back to plain (disabling PIN)
     */
    async migrateToDecrypted(cryptoKey) {
        await this.decryptAll(cryptoKey);
        this._encryptionKey = null;
    },

    /**
     * Remove data from localStorage
     * @param {string} key - Storage key
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Storage remove error:', error);
        }
    },

    /**
     * Generate a unique ID
     * @returns {string} UUID
     */
    generateId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    // Bank Accounts
    getBankAccounts() {
        return this.get(this.KEYS.BANK_ACCOUNTS) || [];
    },

    saveBankAccounts(accounts) {
        this.set(this.KEYS.BANK_ACCOUNTS, accounts);
        if(typeof WizeAISync!=='undefined')WizeAISync.scheduleSync();
    },

    addBankAccount(account) {
        const accounts = this.getBankAccounts();
        account.id = this.generateId();
        account.history = account.history || [{ date: new Date().toISOString().split('T')[0], balance: account.balance }];
        accounts.push(account);
        this.saveBankAccounts(accounts);
        return account;
    },

    updateBankAccount(id, updates) {
        const accounts = this.getBankAccounts();
        const index = accounts.findIndex(a => a.id === id);
        if (index !== -1) {
            // Add balance to history if changed
            if (updates.balance !== undefined && updates.balance !== accounts[index].balance) {
                accounts[index].history = accounts[index].history || [];
                accounts[index].history.push({ date: new Date().toISOString().split('T')[0], balance: updates.balance });
            }
            accounts[index] = { ...accounts[index], ...updates };
            this.saveBankAccounts(accounts);
            return accounts[index];
        }
        return null;
    },

    deleteBankAccount(id) {
        const accounts = this.getBankAccounts().filter(a => a.id !== id);
        this.saveBankAccounts(accounts);
    },

    // Credit Cards
    getCreditCards() {
        return this.get(this.KEYS.CREDIT_CARDS) || { cards: [], expenses: [] };
    },

    saveCreditCards(data) {
        this.set(this.KEYS.CREDIT_CARDS, data);
        if(typeof WizeAISync!=='undefined')WizeAISync.scheduleSync();
    },

    addCreditCard(card) {
        const data = this.getCreditCards();
        card.id = this.generateId();
        data.cards.push(card);
        this.saveCreditCards(data);
        return card;
    },

    addExpense(expense) {
        const data = this.getCreditCards();
        expense.id = this.generateId();
        data.expenses.push(expense);
        this.saveCreditCards(data);
        return expense;
    },

    updateExpense(id, updates) {
        const data = this.getCreditCards();
        const index = data.expenses.findIndex(e => e.id === id);
        if (index !== -1) {
            data.expenses[index] = { ...data.expenses[index], ...updates };
            this.saveCreditCards(data);
            return data.expenses[index];
        }
        return null;
    },

    deleteExpense(id) {
        const data = this.getCreditCards();
        data.expenses = data.expenses.filter(e => e.id !== id);
        this.saveCreditCards(data);
    },

    deleteCreditCard(id) {
        const data = this.getCreditCards();
        data.cards = data.cards.filter(c => c.id !== id);
        data.expenses = data.expenses.filter(e => e.cardId !== id);
        this.saveCreditCards(data);
    },

    // Recurring Expenses
    getRecurringExpenses() {
        const data = this.getCreditCards();
        return data.expenses.filter(e => e.isRecurring);
    },

    getMonthlyRecurringTotal() {
        const recurring = this.getRecurringExpenses();
        const multipliers = {
            weekly: 52 / 12,
            biweekly: 26 / 12,
            monthly: 1,
            bimonthly: 0.5,
            quarterly: 1 / 3,
            annually: 1 / 12
        };
        return recurring.reduce((sum, e) => {
            const freq = e.recurringFrequency || 'monthly';
            const mult = multipliers[freq] || 1;
            return sum + (e.amount || 0) * mult;
        }, 0);
    },

    // Stocks
    getStocks() {
        return this.get(this.KEYS.STOCKS) || { holdings: [], transactions: [] };
    },

    saveStocks(data) {
        this.set(this.KEYS.STOCKS, data);
        if(typeof WizeAISync!=='undefined')WizeAISync.scheduleSync();
    },

    addStock(holding) {
        const data = this.getStocks();
        const existing = data.holdings.find(h => h.symbol === holding.symbol);
        if (existing) {
            // Update existing holding
            const totalQuantity = existing.quantity + holding.quantity;
            existing.avgPrice = ((existing.avgPrice * existing.quantity) + (holding.avgPrice * holding.quantity)) / totalQuantity;
            existing.quantity = totalQuantity;
            existing.currentPrice = holding.currentPrice || existing.currentPrice;
        } else {
            holding.id = this.generateId();
            data.holdings.push(holding);
        }
        // Add transaction
        data.transactions.push({
            id: this.generateId(),
            symbol: holding.symbol,
            type: 'buy',
            quantity: holding.quantity,
            price: holding.avgPrice,
            date: new Date().toISOString().split('T')[0]
        });
        this.saveStocks(data);
        return holding;
    },

    // Import stock directly without creating a transaction (for broker imports)
    importStock(holding) {
        const data = this.getStocks();
        const existing = data.holdings.find(h => h.symbol === holding.symbol);
        if (existing) {
            const totalQuantity = existing.quantity + holding.quantity;
            existing.avgPrice = ((existing.avgPrice * existing.quantity) + (holding.avgPrice * holding.quantity)) / totalQuantity;
            existing.quantity = totalQuantity;
            existing.currentPrice = holding.currentPrice || existing.currentPrice;
            // Preserve imported ILS values
            existing.valueILS = (existing.valueILS || 0) + (holding.valueILS || 0);
            existing.profitILS = (existing.profitILS || 0) + (holding.profitILS || 0);
            existing.currency = holding.currency || existing.currency;
            existing.market = holding.market || existing.market;
        } else {
            holding.id = this.generateId();
            data.holdings.push(holding);
        }
        this.saveStocks(data);
        return holding;
    },

    updateStockPrice(symbol, currentPrice) {
        const data = this.getStocks();
        const holding = data.holdings.find(h => h.symbol === symbol);
        if (holding) {
            holding.currentPrice = currentPrice;
            this.saveStocks(data);
            return holding;
        }
        return null;
    },

    sellStock(symbol, quantity, price, extras = {}) {
        const data = this.getStocks();
        const holding = data.holdings.find(h => h.symbol === symbol);
        if (holding && holding.quantity >= quantity) {
            holding.quantity -= quantity;
            if (holding.quantity === 0) {
                data.holdings = data.holdings.filter(h => h.symbol !== symbol);
            }
            data.transactions.push({
                id: this.generateId(),
                symbol,
                type: 'sell',
                quantity,
                price,
                date: new Date().toISOString().split('T')[0],
                ...extras
            });
            this.saveStocks(data);
            return true;
        }
        return false;
    },

    deleteStock(symbol) {
        const data = this.getStocks();
        data.holdings = data.holdings.filter(h => h.symbol !== symbol);
        this.saveStocks(data);
    },

    updateTransaction(id, updates) {
        const data = this.getStocks();
        const index = data.transactions.findIndex(t => t.id === id);
        if (index !== -1) {
            data.transactions[index] = { ...data.transactions[index], ...updates };
            this.saveStocks(data);
            return data.transactions[index];
        }
        return null;
    },

    deleteTransaction(id) {
        const data = this.getStocks();
        data.transactions = data.transactions.filter(t => t.id !== id);
        this.saveStocks(data);
    },

    // Assets
    getAssets() {
        return this.get(this.KEYS.ASSETS) || [];
    },

    saveAssets(assets) {
        this.set(this.KEYS.ASSETS, assets);
        if(typeof WizeAISync!=='undefined')WizeAISync.scheduleSync();
    },

    addAsset(asset) {
        const assets = this.getAssets();
        asset.id = this.generateId();
        assets.push(asset);
        this.saveAssets(assets);
        return asset;
    },

    updateAsset(id, updates) {
        const assets = this.getAssets();
        const index = assets.findIndex(a => a.id === id);
        if (index !== -1) {
            assets[index] = { ...assets[index], ...updates };
            this.saveAssets(assets);
            return assets[index];
        }
        return null;
    },

    deleteAsset(id) {
        const assets = this.getAssets().filter(a => a.id !== id);
        this.saveAssets(assets);
    },

    // My Accounts (Training, Pension, Gemel, Savings Policy)
    getMyFunds() {
        return this.get(this.KEYS.MY_FUNDS) || [];
    },

    saveMyFunds(funds) {
        this.set(this.KEYS.MY_FUNDS, funds);
        if(typeof WizeAISync!=='undefined')WizeAISync.scheduleSync();
    },

    addMyFund(fund) {
        const funds = this.getMyFunds();
        fund.id = this.generateId();
        funds.push(fund);
        this.saveMyFunds(funds);
        return fund;
    },

    updateMyFund(id, updates) {
        const funds = this.getMyFunds();
        const index = funds.findIndex(f => f.id === id);
        if (index !== -1) {
            funds[index] = { ...funds[index], ...updates };
            this.saveMyFunds(funds);
            return funds[index];
        }
        return null;
    },

    deleteMyFund(id) {
        const funds = this.getMyFunds().filter(f => f.id !== id);
        this.saveMyFunds(funds);
    },

    // TradingView Custom Symbols
    getTVCustomSymbols() {
        return this.get(this.KEYS.TV_CUSTOM_SYMBOLS) || [];
    },

    saveTVCustomSymbols(symbols) {
        this.set(this.KEYS.TV_CUSTOM_SYMBOLS, symbols);
    },

    // Notifications
    getNotifications() {
        return this.get(this.KEYS.NOTIFICATIONS) || { enabled: true, history: [] };
    },

    saveNotifications(data) {
        this.set(this.KEYS.NOTIFICATIONS, data);
    },

    // Dashboard Widgets
    getDashboardWidgets() {
        return this.get(this.KEYS.DASHBOARD_WIDGETS) || {};
    },

    saveDashboardWidgets(widgets) {
        this.set(this.KEYS.DASHBOARD_WIDGETS, widgets);
    },

    // Import Templates
    getImportTemplates() {
        return this.get(this.KEYS.IMPORT_TEMPLATES) || [];
    },

    saveImportTemplates(templates) {
        this.set(this.KEYS.IMPORT_TEMPLATES, templates);
    },

    // User Profile
    getUserProfile() {
        return this.get(this.KEYS.USER_PROFILE) || null;
    },

    saveUserProfile(profile) {
        this.set(this.KEYS.USER_PROFILE, profile);
    },

    // Loans
    getLoans() {
        return this.get(this.KEYS.LOANS) || [];
    },

    saveLoans(loans) {
        this.set(this.KEYS.LOANS, loans);
        if(typeof WizeAISync!=='undefined')WizeAISync.scheduleSync();
    },

    addLoan(loan) {
        const loans = this.getLoans();
        loan.id = this.generateId();
        loans.push(loan);
        this.saveLoans(loans);
        return loan;
    },

    updateLoan(id, updates) {
        const loans = this.getLoans();
        const index = loans.findIndex(l => l.id === id);
        if (index !== -1) {
            loans[index] = { ...loans[index], ...updates };
            this.saveLoans(loans);
            return loans[index];
        }
        return null;
    },

    deleteLoan(id) {
        const loans = this.getLoans().filter(l => l.id !== id);
        this.saveLoans(loans);
    },

    getTotalLoansBalance() {
        return this.getLoans().reduce((sum, l) => sum + (l.remainingBalance || 0), 0);
    },

    getTotalMonthlyLoanPayments() {
        return this.getLoans().reduce((sum, l) => sum + (l.monthlyPayment || 0), 0);
    },

    // Dismissed Tips
    getDismissedTips() {
        return this.get(this.KEYS.DISMISSED_TIPS) || [];
    },

    saveDismissedTips(tips) {
        this.set(this.KEYS.DISMISSED_TIPS, tips);
    },

    dismissTip(tipId) {
        const dismissed = this.getDismissedTips();
        if (!dismissed.includes(tipId)) {
            dismissed.push(tipId);
            this.saveDismissedTips(dismissed);
        }
    },

    resetDismissedTips() {
        this.saveDismissedTips([]);
    },

    // Credit Score
    getCreditScore() {
        return this.get(this.KEYS.CREDIT_SCORE) || { external: null, history: [] };
    },

    saveCreditScore(data) {
        this.set(this.KEYS.CREDIT_SCORE, data);
    },

    saveExternalCreditScore(score, source, date) {
        const data = this.getCreditScore();
        data.external = { score, source, date };
        this.saveCreditScore(data);
    },

    addScoreToHistory(internalScore, factors) {
        const data = this.getCreditScore();
        const today = new Date().toISOString().split('T')[0];
        // Don't add duplicate for same day
        if (data.history.length > 0 && data.history[data.history.length - 1].date === today) {
            data.history[data.history.length - 1] = { date: today, internalScore, factors };
        } else {
            data.history.push({ date: today, internalScore, factors });
        }
        // Keep last 12 entries
        if (data.history.length > 12) {
            data.history = data.history.slice(-12);
        }
        this.saveCreditScore(data);
    },

    // Subscriptions (recurring payments)
    getSubscriptions() {
        return this.get(this.KEYS.SUBSCRIPTIONS) || [];
    },

    saveSubscriptions(subs) {
        this.set(this.KEYS.SUBSCRIPTIONS, subs);
        if(typeof WizeAISync!=='undefined')WizeAISync.scheduleSync();
    },

    addSubscription(sub) {
        const subs = this.getSubscriptions();
        sub.id = this.generateId();
        subs.push(sub);
        this.saveSubscriptions(subs);
        return sub;
    },

    updateSubscription(id, updates) {
        const subs = this.getSubscriptions();
        const index = subs.findIndex(s => s.id === id);
        if (index !== -1) {
            subs[index] = { ...subs[index], ...updates };
            this.saveSubscriptions(subs);
            return subs[index];
        }
        return null;
    },

    deleteSubscription(id) {
        const subs = this.getSubscriptions().filter(s => s.id !== id);
        this.saveSubscriptions(subs);
    },

    getTotalSubscriptionsMonthly() {
        const subs = this.getSubscriptions().filter(s => s.active !== false);
        const multipliers = {
            weekly: 52 / 12,
            monthly: 1,
            bimonthly: 0.5,
            quarterly: 1 / 3,
            semi_annual: 1 / 6,
            annual: 1 / 12
        };
        return subs.reduce((sum, s) => {
            const mult = multipliers[s.frequency] || 1;
            return sum + (s.amount || 0) * mult;
        }, 0);
    },

    // Settings
    getSettings() {
        return this.get(this.KEYS.SETTINGS) || { language: 'he', currency: 'ILS' };
    },

    saveSettings(settings) {
        this.set(this.KEYS.SETTINGS, settings);
    },

    // Export/Import
    exportData() {
        return {
            bankAccounts: this.getBankAccounts(),
            creditCards: this.getCreditCards(),
            stocks: this.getStocks(),
            assets: this.getAssets(),
            myFunds: this.getMyFunds(),
            settings: this.getSettings(),
            stockAlerts: this.get(this.KEYS.STOCK_ALERTS),
            tvCustomSymbols: this.getTVCustomSymbols(),
            notifications: this.getNotifications(),
            dashboardWidgets: this.getDashboardWidgets(),
            importTemplates: this.getImportTemplates(),
            userProfile: this.getUserProfile(),
            dismissedTips: this.getDismissedTips(),
            loans: this.getLoans(),
            creditScore: this.getCreditScore(),
            subscriptions: this.getSubscriptions(),
            summarySchedule: this.getSummarySchedule(),
            exportDate: new Date().toISOString()
        };
    },

    importData(data) {
        if (data.bankAccounts) this.saveBankAccounts(data.bankAccounts);
        if (data.creditCards) this.saveCreditCards(data.creditCards);
        if (data.stocks) this.saveStocks(data.stocks);
        if (data.assets) this.saveAssets(data.assets);
        if (data.myFunds) this.saveMyFunds(data.myFunds);
        if (data.settings) this.saveSettings(data.settings);
        if (data.stockAlerts) this.set(this.KEYS.STOCK_ALERTS, data.stockAlerts);
        if (data.tvCustomSymbols) this.saveTVCustomSymbols(data.tvCustomSymbols);
        if (data.notifications) this.saveNotifications(data.notifications);
        if (data.dashboardWidgets) this.saveDashboardWidgets(data.dashboardWidgets);
        if (data.importTemplates) this.saveImportTemplates(data.importTemplates);
        if (data.userProfile) this.saveUserProfile(data.userProfile);
        if (data.dismissedTips) this.saveDismissedTips(data.dismissedTips);
        if (data.loans) this.saveLoans(data.loans);
        if (data.creditScore) this.saveCreditScore(data.creditScore);
        if (data.subscriptions) this.saveSubscriptions(data.subscriptions);
        if (data.summarySchedule) this.saveSummarySchedule(data.summarySchedule);
    },

    // Summary calculations
    getTotalBankBalance(excludeSecurities = false) {
        return this.getBankAccounts().reduce((sum, acc) => {
            if (excludeSecurities && acc.type === 'securities') return sum;
            return sum + (acc.balance || 0);
        }, 0);
    },

    getTotalCreditExpenses(month = null) {
        const data = this.getCreditCards();
        let expenses = data.expenses;
        if (month) {
            expenses = expenses.filter(e => e.date.startsWith(month));
        }
        return expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    },

    getTotalStocksValue() {
        const data = this.getStocks();
        return data.holdings.reduce((sum, h) => {
            // Use valueILS if available (from broker import), otherwise calculate
            if (h.valueILS && h.valueILS > 0) {
                return sum + h.valueILS;
            }
            return sum + (h.quantity * (h.currentPrice || h.avgPrice));
        }, 0);
    },

    getTotalAssetsValue() {
        return this.getAssets().reduce((sum, a) => sum + (a.value || 0), 0);
    },

    getTotalFundsValue() {
        return this.getMyFunds().reduce((sum, f) => sum + (f.value || f.currentValue || 0), 0);
    },

    getTotalLoansBalance() {
        return this.getLoans().reduce((sum, l) => sum + (l.remainingBalance || l.amount || 0), 0);
    },

    getSummarySchedule() {
        return this.get(this.KEYS.SUMMARY_SCHEDULE) || {
            enabled: false, frequency: 'weekly', dayOfWeek: 5,
            dayOfMonth: 1, lastSentDate: null, recipientPhone: '', recipientEmail: '',
            callmebotApiKey: ''
        };
    },

    saveSummarySchedule(data) {
        this.set(this.KEYS.SUMMARY_SCHEDULE, data);
    },

    getNetWorth() {
        const hasStocks = this.getTotalStocksValue() > 0;
        return this.getTotalBankBalance(hasStocks) +
               this.getTotalStocksValue() +
               this.getTotalAssetsValue() +
               this.getTotalFundsValue() -
               this.getTotalLoansBalance();
    }
};

// Make available globally
window.Storage = Storage;
