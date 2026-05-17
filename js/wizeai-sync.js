/**
 * WizeAI Sync — computes aggregates from localStorage and writes to Firestore
 * Called once on login so WizeAI can read cross-app context
 */
const WizeAISync = {
    THROTTLE_MS: 5 * 60 * 1000, // sync at most once per 5 min

    _debounceTimer: null,

    scheduleSync() {
        clearTimeout(this._debounceTimer);
        this._debounceTimer = setTimeout(async () => {
            const user = typeof firebase !== 'undefined' && firebase.auth().currentUser;
            if (user) await this.sync(user.uid);
        }, 8000); // 8s debounce — batch rapid changes
    },

    async sync(uid) {
        if (!uid || typeof Storage === 'undefined' || typeof firebase === 'undefined') return;
        const lastSync = parseInt(localStorage.getItem('wizeai_last_sync') || '0');
        if (Date.now() - lastSync < this.THROTTLE_MS) return;

        // Lazy-load firestore-compat on landing pages (perf: ~600KB off critical path)
        if (typeof window.ensureFirestore === 'function') {
            try { await window.ensureFirestore(); } catch (e) { return; }
        }
        if (typeof firebase.firestore !== 'function') return;

        try {
            const now = new Date();
            const monthStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
            const prevMonth = now.getMonth() === 0
                ? `${now.getFullYear()-1}-12`
                : `${now.getFullYear()}-${String(now.getMonth()).padStart(2,'0')}`;

            // ── Income ──────────────────────────────────────────────────────
            const incomeEntries = JSON.parse(localStorage.getItem('finance_income') || '[]');
            const monthlyIncome = incomeEntries.reduce((s, e) => {
                if (e.frequency === 'annual') return s + e.amount / 12;
                if (e.frequency === 'one_time') return s;
                return s + (e.amount || 0);
            }, 0);

            // ── Expenses (credit cards) ──────────────────────────────────────
            const monthlyExpenses  = Storage.getTotalCreditExpenses(monthStr);
            const prevMonthExp     = Storage.getTotalCreditExpenses(prevMonth);

            // ── Top expense categories ───────────────────────────────────────
            const cards = Storage.getCreditCards();
            const catTotals = {};
            (cards.expenses || []).filter(e => e.date && e.date.startsWith(monthStr)).forEach(e => {
                const cat = e.category || 'other';
                catTotals[cat] = (catTotals[cat] || 0) + (e.amount || 0);
            });
            const topCategories = Object.entries(catTotals)
                .sort((a,b) => b[1]-a[1]).slice(0,4)
                .map(([cat,amt]) => ({ cat, amt: Math.round(amt) }));

            // ── Balances & Net Worth ─────────────────────────────────────────
            const bankBalance   = Storage.getTotalBankBalance();
            const stocksValue   = Storage.getTotalStocksValue();
            const assetsValue   = Storage.getTotalAssetsValue();
            const loansBalance  = Storage.getTotalLoansBalance();
            const netWorth      = Storage.getNetWorth();
            const subscriptions = Storage.getTotalSubscriptionsMonthly();
            const loanPayments  = Storage.getTotalMonthlyLoanPayments();

            // ── Goals ────────────────────────────────────────────────────────
            const goals = JSON.parse(localStorage.getItem('finance_goals') || '[]');
            const goalsSnapshot = goals.slice(0,5).map(g => ({
                name: g.name,
                target: Math.round(g.targetAmount || 0),
                current: Math.round(g.currentAmount || 0),
                pct: g.targetAmount > 0 ? Math.round(g.currentAmount / g.targetAmount * 100) : 0
            }));

            // ── Write to Firestore ───────────────────────────────────────────
            await firebase.firestore()
                .collection('users').doc(uid)
                .collection('context').doc('money')
                .set({
                    monthlyIncome:   Math.round(monthlyIncome),
                    monthlyExpenses: Math.round(monthlyExpenses),
                    prevMonthExp:    Math.round(prevMonthExp),
                    expenseDelta:    prevMonthExp > 0
                        ? Math.round((monthlyExpenses - prevMonthExp) / prevMonthExp * 100)
                        : 0,
                    topCategories,
                    bankBalance:   Math.round(bankBalance),
                    stocksValue:   Math.round(stocksValue),
                    assetsValue:   Math.round(assetsValue),
                    loansBalance:  Math.round(loansBalance),
                    netWorth:      Math.round(netWorth),
                    subscriptions: Math.round(subscriptions),
                    loanPayments:  Math.round(loanPayments),
                    goals: goalsSnapshot,
                    syncedAt: now.toISOString(),
                    month: monthStr
                }, { merge: false });

            localStorage.setItem('wizeai_last_sync', String(Date.now()));
        } catch (e) {
            console.warn('WizeAI sync failed:', e);
        }
    }
};
