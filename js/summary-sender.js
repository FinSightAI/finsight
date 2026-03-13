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
        lines.push(``, `_נשלח מ-FinSight_`);

        return lines.join('\n');
    },

    checkAndShowBanner() {
        if (!this.isDue()) return;
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
        const emailUrl = `mailto:${schedule.recipientEmail || ''}?subject=${encodeURIComponent('סיכום פיננסי – FinSight')}&body=${encodeURIComponent(text)}`;

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
