/**
 * SummarySender — weekly/monthly financial summary with WhatsApp/Email share
 */
const SummarySender = {

    isDue() {
        const s = Storage.getSummarySchedule();
        if (!s.enabled) return false;
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        if (s.lastSentDate === todayStr) return false;
        if (s.frequency === 'weekly') return today.getDay() === (s.dayOfWeek || 5);
        if (s.frequency === 'monthly') return today.getDate() === (s.dayOfMonth || 1);
        return false;
    },

    buildSummaryData() {
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

        const bankBalance = Storage.getTotalBankBalance();
        const creditThisMonth = Storage.getTotalCreditExpenses(currentMonth);
        const creditPrevMonth = Storage.getTotalCreditExpenses(prevMonth);
        const stocksValue = Storage.getTotalStocksValue();
        const fundsValue = Storage.getTotalFundsValue();
        const assetsValue = Storage.getTotalAssetsValue();
        const loansBalance = Storage.getTotalLoansBalance();
        const netWorth = Storage.getNetWorth();
        const subscriptionsMonthly = Storage.getTotalSubscriptionsMonthly();

        // Stocks P&L
        const stocksData = Storage.getStocks();
        const stocksCost = stocksData.holdings.reduce((s, h) => s + (h.quantity * (h.avgPrice || 0)), 0);
        const stocksPnl = stocksValue - stocksCost;

        // Funds breakdown by type
        const funds = Storage.getMyFunds();
        const fundsByType = {};
        funds.forEach(f => {
            const type = f.type || 'other';
            fundsByType[type] = (fundsByType[type] || 0) + (f.value || f.currentValue || 0);
        });

        // Credit top category
        const ccData = Storage.getCreditCards();
        const thisMonthExp = ccData.expenses.filter(e => e.date && e.date.startsWith(currentMonth));
        const byCat = {};
        thisMonthExp.forEach(e => { byCat[e.category || 'other'] = (byCat[e.category || 'other'] || 0) + e.amount; });
        const topCatEntry = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0];

        // Save net worth to history (keep last 12 entries)
        try {
            const historyRaw = localStorage.getItem('finance_networth_history');
            const history = historyRaw ? JSON.parse(historyRaw) : [];
            history.push({ date: now.toISOString().split('T')[0], value: netWorth });
            const trimmed = history.slice(-12);
            localStorage.setItem('finance_networth_history', JSON.stringify(trimmed));
        } catch (e) {
            console.warn('SummarySender: could not save net worth history', e);
        }

        return {
            currentMonth, prevMonth, now,
            bankBalance, creditThisMonth, creditPrevMonth,
            stocksValue, stocksPnl, stocksCost,
            fundsValue, fundsByType,
            assetsValue, loansBalance, netWorth,
            subscriptionsMonthly,
            topCat: topCatEntry ? topCatEntry[0] : null,
            topCatAmount: topCatEntry ? topCatEntry[1] : 0,
            expenseCount: thisMonthExp.length
        };
    },

    buildInsights(d) {
        const insights = [];
        const fmt = (n) => '₪' + Math.round(n).toLocaleString('he-IL');

        const catLabels = {
            food: 'מזון', transport: 'תחבורה', shopping: 'קניות',
            entertainment: 'בידור', bills: 'חשבונות', health: 'בריאות',
            education: 'חינוך', other: 'אחר', restaurants: 'מסעדות',
            clothing: 'ביגוד', travel: 'נסיעות'
        };

        // 1. Category spending spike: compare this month vs avg of previous 3 months
        try {
            const ccData = Storage.getCreditCards();
            const allExpenses = ccData.expenses || [];
            const now = d.now;

            // Build per-category totals for the previous 3 months
            const prevMonthsData = []; // array of {cat: amount} objects
            for (let i = 1; i <= 3; i++) {
                const d2 = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthStr = `${d2.getFullYear()}-${String(d2.getMonth() + 1).padStart(2, '0')}`;
                const monthExp = allExpenses.filter(e => e.date && e.date.startsWith(monthStr));
                const catTotals = {};
                monthExp.forEach(e => {
                    const cat = e.category || 'other';
                    catTotals[cat] = (catTotals[cat] || 0) + e.amount;
                });
                prevMonthsData.push(catTotals);
            }

            // Current month per-category
            const thisMonthExp = allExpenses.filter(e => e.date && e.date.startsWith(d.currentMonth));
            const thisByCat = {};
            thisMonthExp.forEach(e => {
                const cat = e.category || 'other';
                thisByCat[cat] = (thisByCat[cat] || 0) + e.amount;
            });

            // Collect all categories that appear this month
            Object.entries(thisByCat).forEach(([cat, thisAmt]) => {
                const prevAmounts = prevMonthsData.map(m => m[cat] || 0);
                const monthsWithData = prevAmounts.filter(v => v > 0).length;
                if (monthsWithData === 0) return; // no history to compare
                const avg = prevAmounts.reduce((a, b) => a + b, 0) / 3;
                if (avg === 0) return;
                const pctChange = (thisAmt - avg) / avg;
                if (pctChange > 0.30 && thisAmt > 300) {
                    const label = catLabels[cat] || cat;
                    insights.push(`📈 הוצאות *${label}* עלו ב-${Math.round(pctChange * 100)}% לעומת ממוצע 3 חודשים אחרונים (${fmt(thisAmt)} vs ממוצע ${fmt(avg)})`);
                }
            });
        } catch (e) {
            console.warn('SummarySender: category insight error', e);
        }

        // 2. Subscriptions over 200₪/month total
        try {
            const subs = Storage.getSubscriptions() || [];
            const monthly = subs.reduce((sum, s) => {
                let amt = s.amount || 0;
                if (s.billingCycle === 'yearly') amt = amt / 12;
                else if (s.billingCycle === 'quarterly') amt = amt / 3;
                return sum + amt;
            }, 0);
            if (monthly > 200) {
                insights.push(`🔄 סך מנויים חודשיים: *${fmt(monthly)}* — שווה לבדוק מה ניתן לבטל`);
            }
        } catch (e) {
            console.warn('SummarySender: subscriptions insight error', e);
        }

        // 3. Net worth trend from history
        try {
            const historyRaw = localStorage.getItem('finance_networth_history');
            if (historyRaw) {
                const history = JSON.parse(historyRaw);
                // history already includes the entry just saved in buildSummaryData,
                // so the previous entry is at index length-2
                if (history.length >= 2) {
                    const prev = history[history.length - 2];
                    const curr = history[history.length - 1];
                    const diff = curr.value - prev.value;
                    const sign = diff >= 0 ? '+' : '';
                    const arrow = diff >= 0 ? '📈' : '📉';
                    insights.push(`${arrow} שווי נקי: ${sign}${fmt(Math.abs(diff))} מאז ${prev.date} (${fmt(prev.value)} ← ${fmt(curr.value)})`);
                }
            }
        } catch (e) {
            console.warn('SummarySender: net worth trend insight error', e);
        }

        return insights;
    },

    formatSummaryText(d) {
        const fmt = (n) => n > 0 ? '₪' + Math.round(n).toLocaleString('he-IL') : '₪0';
        const sign = (n) => n >= 0 ? '+' : '';
        const now = d.now;
        const monthNames = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
        const monthLabel = monthNames[now.getMonth()] + ' ' + now.getFullYear();

        const catLabels = {
            food: 'מזון', transport: 'תחבורה', shopping: 'קניות',
            entertainment: 'בידור', bills: 'חשבונות', health: 'בריאות',
            education: 'חינוך', other: 'אחר'
        };

        const lines = [
            `📊 *סיכום פיננסי – ${monthLabel}*`,
            `━━━━━━━━━━━━━━━━━━━━`,
        ];

        if (d.bankBalance > 0)
            lines.push(`🏦 *בנק:* ${fmt(d.bankBalance)}`);

        lines.push(`💳 *הוצאות החודש:* ${fmt(d.creditThisMonth)} (${d.expenseCount} עסקאות)`);
        if (d.creditPrevMonth > 0) {
            const diff = d.creditThisMonth - d.creditPrevMonth;
            lines.push(`   vs. חודש קודם: ${fmt(d.creditPrevMonth)} (${sign(diff)}${fmt(Math.abs(diff))})`);
        }
        if (d.topCat)
            lines.push(`   קטגוריה מובילה: ${catLabels[d.topCat] || d.topCat} – ${fmt(d.topCatAmount)}`);

        if (d.subscriptionsMonthly > 0)
            lines.push(`🔄 *מנויים קבועים:* ${fmt(d.subscriptionsMonthly)} / חודש`);

        if (d.stocksValue > 0) {
            const pnlStr = d.stocksPnl !== 0 ? ` (${sign(d.stocksPnl)}${fmt(Math.abs(d.stocksPnl))})` : '';
            lines.push(`📈 *מניות:* ${fmt(d.stocksValue)}${pnlStr}`);
        }

        if (d.fundsValue > 0) {
            lines.push(`💼 *חסכונות וקרנות:* ${fmt(d.fundsValue)}`);
            const typeLabels = { pension: 'פנסיה', gemel: 'גמל', savings: 'חסכון', study: 'השתלמות' };
            Object.entries(d.fundsByType).forEach(([t, v]) => {
                if (v > 0) lines.push(`   ${typeLabels[t] || t}: ${fmt(v)}`);
            });
        }

        if (d.assetsValue > 0)
            lines.push(`🏠 *נכסים:* ${fmt(d.assetsValue)}`);

        if (d.loansBalance > 0)
            lines.push(`🔻 *הלוואות:* ${fmt(d.loansBalance)}`);

        lines.push(`━━━━━━━━━━━━━━━━━━━━`);
        lines.push(`💰 *שווי נקי: ${fmt(d.netWorth)}*`);

        const insights = this.buildInsights(d);
        if (insights.length > 0) {
            lines.push(``);
            lines.push(`━━━━━━━━━━━━━━━━━━━━`);
            lines.push(`💡 *תובנות חכמות:*`);
            insights.forEach(i => lines.push(`• ${i}`));
        }

        lines.push(``, `_נשלח מ-WizeMoney_`);

        return lines.join('\n');
    },

    async autoSendWhatsApp() {
        const schedule = Storage.getSummarySchedule();
        const phone = (schedule.recipientPhone || '').replace(/\D/g, '');
        const apiKey = (schedule.callmebotApiKey || '').trim();
        if (!phone || !apiKey) return false;

        const text = this.formatSummaryText(this.buildSummaryData());
        const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(apiKey)}`;
        // Use Image trick to bypass CORS — CallMeBot doesn't send CORS headers
        // so fetch() gets blocked; image requests bypass CORS restrictions.
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = img.onerror = () => { this.markSent(); resolve(true); };
            img.src = url;
            // Fallback: assume sent after 8s if no response
            setTimeout(() => { this.markSent(); resolve(true); }, 8000);
        });
    },

    shareWhatsApp() {
        const data = this.buildSummaryData();
        const text = this.formatSummaryText(data);
        const schedule = Storage.getSummarySchedule();
        const phone = (schedule.recipientPhone || '').replace(/\D/g, '');
        const url = phone
            ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
            : `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
        this.markSent();
        this.dismissBanner();
    },

    checkAndShowBanner() {
        if (!this.isDue()) return;
        // Fire push notification automatically (works even if banner isn't visible)
        if (typeof Notifications !== 'undefined' &&
            Notifications.getPermission() === 'granted') {
            Notifications.notifyWeeklySummary();
        }
        // Also show in-app banner for manual WhatsApp share
        const banner = document.getElementById('summarySenderBanner');
        if (banner) banner.style.display = 'flex';
    },

    dismissBanner() {
        const banner = document.getElementById('summarySenderBanner');
        if (banner) banner.style.display = 'none';
    },

    showPreviewModal() {
        this.dismissBanner();
        const data = this.buildSummaryData();
        const text = this.formatSummaryText(data);
        document.getElementById('summaryPreviewText').textContent = text;

        const schedule = Storage.getSummarySchedule();
        const whatsappNum = (schedule.recipientPhone || '').replace(/\D/g, '');
        const waUrl = whatsappNum
            ? `https://wa.me/${whatsappNum}?text=${encodeURIComponent(text)}`
            : `https://wa.me/?text=${encodeURIComponent(text)}`;
        const emailUrl = `mailto:${schedule.recipientEmail || ''}?subject=${encodeURIComponent('סיכום פיננסי – WizeMoney')}&body=${encodeURIComponent(text)}`;

        document.getElementById('summaryShareWhatsApp').onclick = () => {
            window.open(waUrl, '_blank');
            this.markSent();
        };
        document.getElementById('summaryShareEmail').onclick = () => {
            window.open(emailUrl, '_blank');
            this.markSent();
        };

        const nativeBtn = document.getElementById('summaryShareNative');
        if (navigator.share) {
            nativeBtn.style.display = 'inline-flex';
            nativeBtn.onclick = async () => {
                try {
                    await navigator.share({ title: 'סיכום פיננסי', text });
                    this.markSent();
                } catch(e) {}
            };
        }

        document.getElementById('summaryCopyBtn').onclick = () => {
            navigator.clipboard.writeText(text).catch(() => {});
            document.getElementById('summaryCopyBtn').textContent = '✅ הועתק';
            setTimeout(() => { document.getElementById('summaryCopyBtn').textContent = '📋 העתק'; }, 2000);
        };

        document.getElementById('summaryPreviewModal').style.display = 'flex';
    },

    closeModal() {
        document.getElementById('summaryPreviewModal').style.display = 'none';
    },

    markSent() {
        const s = Storage.getSummarySchedule();
        s.lastSentDate = new Date().toISOString().split('T')[0];
        Storage.saveSummarySchedule(s);
    }
};

window.SummarySender = SummarySender;
