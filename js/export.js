/**
 * Export Module - Export data to Excel (CSV) and PDF
 */
const ExportManager = {
    /**
     * Export data to CSV (Excel compatible)
     * @param {Array} data - Array of objects to export
     * @param {Array} columns - Column definitions [{key, label}]
     * @param {string} filename - Filename without extension
     */
    toCSV(data, columns, filename) {
        // BOM for Excel to recognize UTF-8
        const BOM = '\uFEFF';

        // Header row
        const headers = columns.map(col => `"${col.label}"`).join(',');

        // Data rows
        const rows = data.map(item => {
            return columns.map(col => {
                let value = item[col.key];
                if (value === null || value === undefined) value = '';
                if (typeof value === 'number') return value;
                // Escape quotes, prevent CSV formula injection
                let str = String(value).replace(/"/g, '""');
                if (/^[=+\-@\t\r]/.test(str)) str = "'" + str;
                return `"${str}"`;
            }).join(',');
        });

        const csv = BOM + headers + '\n' + rows.join('\n');

        // Download
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        this.downloadBlob(blob, `${filename}.csv`);
    },

    /**
     * Export to PDF using print dialog
     * @param {string} title - Report title
     * @param {string} content - HTML content to print
     */
    toPDF(title, content) {
        const printWindow = window.open('', '_blank');
        const lang = I18n?.currentLanguage || 'he';
        const dir = lang === 'he' ? 'rtl' : 'ltr';
        const dateStr = new Date().toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        printWindow.document.write(`<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: #f0f2f5;
            color: #1a1a2e;
            direction: ${dir};
            font-size: 14px;
            line-height: 1.5;
        }

        .page-wrapper {
            max-width: 900px;
            margin: 0 auto;
            background: #fff;
            min-height: 100vh;
        }

        /* ── Hero Header ── */
        .hero-header {
            background: linear-gradient(135deg, #10b981 0%, #8b5cf6 100%);
            padding: 40px 48px 36px;
            color: #fff;
            position: relative;
            overflow: hidden;
        }
        .hero-header::before {
            content: '';
            position: absolute;
            top: -60px;
            ${dir === 'rtl' ? 'left' : 'right'}: -60px;
            width: 240px;
            height: 240px;
            border-radius: 50%;
            background: rgba(255,255,255,0.08);
        }
        .hero-header::after {
            content: '';
            position: absolute;
            bottom: -80px;
            ${dir === 'rtl' ? 'right' : 'left'}: -40px;
            width: 300px;
            height: 300px;
            border-radius: 50%;
            background: rgba(255,255,255,0.05);
        }
        .brand-row {
            display: flex;
            align-items: center;
            gap: 14px;
            margin-bottom: 24px;
        }
        .brand-logo {
            width: 48px;
            height: 48px;
            background: rgba(255,255,255,0.2);
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 26px;
            font-weight: 800;
            letter-spacing: -1px;
            backdrop-filter: blur(4px);
        }
        .brand-name {
            font-size: 26px;
            font-weight: 800;
            letter-spacing: 0.5px;
        }
        .brand-tagline {
            font-size: 12px;
            opacity: 0.75;
            margin-top: 2px;
        }
        .hero-meta {
            font-size: 13px;
            opacity: 0.8;
            margin-bottom: 8px;
        }
        .hero-title {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 4px;
        }

        /* ── Report Body ── */
        .report-body {
            padding: 36px 48px 48px;
        }

        /* ── KPI Grid ── */
        .kpi-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            margin-bottom: 36px;
        }
        .kpi-card {
            border-radius: 14px;
            padding: 20px 16px;
            color: #fff;
            text-align: center;
            box-shadow: 0 4px 14px rgba(0,0,0,0.12);
        }
        .kpi-label {
            font-size: 11px;
            opacity: 0.88;
            margin-bottom: 8px;
            font-weight: 500;
            letter-spacing: 0.3px;
        }
        .kpi-value {
            font-size: 20px;
            font-weight: 700;
            letter-spacing: -0.5px;
        }

        /* ── Sections ── */
        .section {
            margin-bottom: 32px;
            break-inside: avoid;
        }
        .section-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 14px;
            padding-bottom: 10px;
            border-bottom: 2px solid #f0f2f5;
        }
        .section-icon {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            background: linear-gradient(135deg, #10b981, #8b5cf6);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            flex-shrink: 0;
        }
        .section-title {
            font-size: 17px;
            font-weight: 700;
            color: #1a1a2e;
        }

        /* ── Tables ── */
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
        }
        thead tr {
            background: linear-gradient(135deg, #10b981, #8b5cf6);
            color: #fff;
        }
        thead th {
            padding: 11px 14px;
            font-weight: 600;
            text-align: ${dir === 'rtl' ? 'right' : 'left'};
            font-size: 12px;
            letter-spacing: 0.3px;
        }
        tbody tr:nth-child(odd) {
            background: #f9fafb;
        }
        tbody tr:nth-child(even) {
            background: #fff;
        }
        tbody tr:hover {
            background: #f0fdf4;
        }
        tbody td {
            padding: 10px 14px;
            text-align: ${dir === 'rtl' ? 'right' : 'left'};
            border-bottom: 1px solid #f0f2f5;
            color: #374151;
        }
        tfoot tr {
            background: #f0fdf4;
            font-weight: 700;
        }
        tfoot td {
            padding: 10px 14px;
            text-align: ${dir === 'rtl' ? 'right' : 'left'};
            border-top: 2px solid #10b981;
            color: #1a1a2e;
        }

        .positive { color: #059669; font-weight: 600; }
        .negative { color: #dc2626; font-weight: 600; }

        /* ── Net Worth Summary ── */
        .networth-summary {
            background: linear-gradient(135deg, #f0fdf4, #faf5ff);
            border: 1px solid #d1fae5;
            border-radius: 14px;
            padding: 24px 28px;
            margin-top: 8px;
        }
        .networth-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            font-size: 14px;
        }
        .networth-row.total-row {
            border-top: 2px solid #10b981;
            margin-top: 8px;
            padding-top: 14px;
            font-size: 20px;
            font-weight: 800;
        }
        .networth-row .nw-label { color: #4b5563; }
        .networth-row .nw-value { font-weight: 600; color: #1a1a2e; }
        .networth-row.total-row .nw-label { color: #059669; }
        .networth-row.total-row .nw-value { color: #059669; }

        /* ── Footer ── */
        .report-footer {
            text-align: center;
            padding: 20px 48px 28px;
            font-size: 11px;
            color: #9ca3af;
            border-top: 1px solid #f0f2f5;
        }

        /* ── Print ── */
        @media print {
            body { background: #fff; }
            .page-wrapper { max-width: 100%; box-shadow: none; }
            .hero-header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .kpi-card { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            thead tr { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .section { break-inside: avoid; page-break-inside: avoid; }
            .no-print { display: none !important; }
        }
    </style>
</head>
<body>
<div class="page-wrapper">
    ${content}
    <div class="report-footer">
        ${lang === 'he'
            ? `דוח זה נוצר על ידי FinSight &bull; ${dateStr}`
            : `Report generated by FinSight &bull; ${dateStr}`}
    </div>
</div>
<script>
    window.onload = function() {
        window.print();
    };
</script>
</body>
</html>`);
        printWindow.document.close();
    },

    /**
     * Download a blob as file
     * @param {Blob} blob - Blob to download
     * @param {string} filename - Filename
     */
    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    /**
     * Generate full financial report
     */
    generateFullReport() {
        const lang = I18n?.currentLanguage || 'he';
        const isHebrew = lang === 'he';
        const fmt = v => I18n?.formatCurrency(v) ?? Number(v).toLocaleString('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 });

        // ── Gather all data ──
        const bankAccounts  = Storage.getBankAccounts();
        const creditData    = Storage.getCreditCards();
        const stockData     = Storage.getStocks();
        const fundsData     = Storage.getMyFunds ? Storage.getMyFunds() : Storage.getFunds();
        const assetsData    = Storage.getAssets();
        const loansData     = Storage.getLoans ? Storage.getLoans() : [];
        const subscriptions = Storage.getSubscriptions ? Storage.getSubscriptions() : [];
        const storedNetWorth = Storage.getNetWorth ? Storage.getNetWorth() : null;

        // ── Calculate totals ──
        const now = new Date();
        const bankTotal  = bankAccounts.reduce((s, a) => s + (a.balance || 0), 0);
        const creditTotal = creditData.expenses
            .filter(e => new Date(e.date).getMonth() === now.getMonth() && new Date(e.date).getFullYear() === now.getFullYear())
            .reduce((s, e) => s + (e.amount || 0), 0);
        const stocksTotal = stockData.holdings.reduce((s, h) => s + h.quantity * (h.currentPrice || h.avgPrice), 0);
        const fundsTotal  = fundsData.reduce((s, f) => s + (f.currentValue || 0), 0);
        const assetsTotal = assetsData.reduce((s, a) => s + (a.estimatedValue || 0), 0);
        const loansTotal  = loansData.reduce((s, l) => s + (l.remainingBalance || l.balance || 0), 0);
        const netWorth    = storedNetWorth != null ? storedNetWorth : (bankTotal + stocksTotal + fundsTotal + assetsTotal - loansTotal);

        const dateStr = now.toLocaleDateString(isHebrew ? 'he-IL' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        // ── Helper: section wrapper ──
        const section = (icon, titleHe, titleEn, tableHtml) => `
        <div class="section">
            <div class="section-header">
                <div class="section-icon">${icon}</div>
                <div class="section-title">${isHebrew ? titleHe : titleEn}</div>
            </div>
            ${tableHtml}
        </div>`;

        // ── Hero Header ──
        let content = `
        <div class="hero-header">
            <div class="brand-row">
                <div class="brand-logo">F</div>
                <div>
                    <div class="brand-name">FinSight</div>
                    <div class="brand-tagline">${isHebrew ? 'ניהול פיננסי חכם' : 'Smart Financial Management'}</div>
                </div>
            </div>
            <div class="hero-meta">${isHebrew ? 'דוח נוצר ב' : 'Report generated'} &bull; ${dateStr}</div>
            <div class="hero-title">${isHebrew ? 'דוח פיננסי מלא' : 'Full Financial Report'}</div>
        </div>
        <div class="report-body">`;

        // ── KPI Grid ──
        content += `
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:32px;">
            <div class="kpi-card" style="background:linear-gradient(135deg,#10b981,#059669);">
                <div class="kpi-label">${isHebrew ? 'שווי נקי' : 'Net Worth'}</div>
                <div class="kpi-value">${fmt(netWorth)}</div>
            </div>
            <div class="kpi-card" style="background:linear-gradient(135deg,#3b82f6,#1d4ed8);">
                <div class="kpi-label">${isHebrew ? 'בנק' : 'Bank'}</div>
                <div class="kpi-value">${fmt(bankTotal)}</div>
            </div>
            <div class="kpi-card" style="background:linear-gradient(135deg,#ef4444,#dc2626);">
                <div class="kpi-label">${isHebrew ? 'הוצאות חודש' : 'This Month'}</div>
                <div class="kpi-value">${fmt(creditTotal)}</div>
            </div>
            <div class="kpi-card" style="background:linear-gradient(135deg,#8b5cf6,#7c3aed);">
                <div class="kpi-label">${isHebrew ? 'חסכונות וקרנות' : 'Savings & Funds'}</div>
                <div class="kpi-value">${fmt(fundsTotal)}</div>
            </div>
        </div>`;

        // ── Bank Accounts ──
        if (bankAccounts.length > 0) {
            const rows = bankAccounts.map(acc => `
                <tr>
                    <td>${acc.nameHe || acc.nameEn || acc.bank || '-'}</td>
                    <td>${acc.accountNumber || '-'}</td>
                    <td>${fmt(acc.balance || 0)}</td>
                </tr>`).join('');
            content += section('🏦',
                'חשבונות בנק', 'Bank Accounts',
                `<table>
                    <thead><tr>
                        <th>${isHebrew ? 'בנק' : 'Bank'}</th>
                        <th>${isHebrew ? 'מספר חשבון' : 'Account #'}</th>
                        <th>${isHebrew ? 'יתרה' : 'Balance'}</th>
                    </tr></thead>
                    <tbody>${rows}</tbody>
                    <tfoot><tr>
                        <td colspan="2">${isHebrew ? 'סה"כ' : 'Total'}</td>
                        <td>${fmt(bankTotal)}</td>
                    </tr></tfoot>
                </table>`);
        }

        // ── Stock Portfolio ──
        if (stockData.holdings.length > 0) {
            const rows = stockData.holdings.map(h => {
                const cur  = h.currentPrice || h.avgPrice;
                const val  = h.quantity * cur;
                const cost = h.quantity * h.avgPrice;
                const pl   = val - cost;
                const pct  = cost > 0 ? ((pl / cost) * 100).toFixed(1) : '0.0';
                return `
                <tr>
                    <td><strong>${h.symbol}</strong></td>
                    <td>${h.name || '-'}</td>
                    <td>${h.quantity}</td>
                    <td>${h.avgPrice.toFixed(2)}</td>
                    <td>${cur.toFixed(2)}</td>
                    <td>${fmt(val)}</td>
                    <td class="${pl >= 0 ? 'positive' : 'negative'}">${pl >= 0 ? '+' : ''}${fmt(pl)} (${pct}%)</td>
                </tr>`;
            }).join('');
            content += section('📈',
                'תיק מניות', 'Stock Portfolio',
                `<table>
                    <thead><tr>
                        <th>${isHebrew ? 'סימול' : 'Symbol'}</th>
                        <th>${isHebrew ? 'שם' : 'Name'}</th>
                        <th>${isHebrew ? 'כמות' : 'Qty'}</th>
                        <th>${isHebrew ? 'מחיר ממוצע' : 'Avg Price'}</th>
                        <th>${isHebrew ? 'מחיר נוכחי' : 'Current'}</th>
                        <th>${isHebrew ? 'שווי' : 'Value'}</th>
                        <th>${isHebrew ? 'רווח/הפסד' : 'P/L'}</th>
                    </tr></thead>
                    <tbody>${rows}</tbody>
                    <tfoot><tr>
                        <td colspan="5">${isHebrew ? 'סה"כ' : 'Total'}</td>
                        <td colspan="2">${fmt(stocksTotal)}</td>
                    </tr></tfoot>
                </table>`);
        }

        // ── Savings & Funds ──
        if (fundsData.length > 0) {
            const rows = fundsData.map(f => `
                <tr>
                    <td>${f.name || '-'}</td>
                    <td>${f.type || '-'}</td>
                    <td>${fmt(f.currentValue || 0)}</td>
                    <td>${fmt(f.monthlyDeposit || 0)}</td>
                </tr>`).join('');
            content += section('💰',
                'חסכונות וקרנות', 'Savings & Funds',
                `<table>
                    <thead><tr>
                        <th>${isHebrew ? 'שם' : 'Name'}</th>
                        <th>${isHebrew ? 'סוג' : 'Type'}</th>
                        <th>${isHebrew ? 'שווי נוכחי' : 'Current Value'}</th>
                        <th>${isHebrew ? 'הפקדה חודשית' : 'Monthly Deposit'}</th>
                    </tr></thead>
                    <tbody>${rows}</tbody>
                    <tfoot><tr>
                        <td colspan="2">${isHebrew ? 'סה"כ' : 'Total'}</td>
                        <td>${fmt(fundsTotal)}</td>
                        <td></td>
                    </tr></tfoot>
                </table>`);
        }

        // ── Assets ──
        if (assetsData.length > 0) {
            const rows = assetsData.map(a => `
                <tr>
                    <td>${a.name || '-'}</td>
                    <td>${a.type || '-'}</td>
                    <td>${fmt(a.estimatedValue || 0)}</td>
                </tr>`).join('');
            content += section('🏠',
                'נכסים', 'Assets',
                `<table>
                    <thead><tr>
                        <th>${isHebrew ? 'שם הנכס' : 'Asset Name'}</th>
                        <th>${isHebrew ? 'סוג' : 'Type'}</th>
                        <th>${isHebrew ? 'שווי מוערך' : 'Estimated Value'}</th>
                    </tr></thead>
                    <tbody>${rows}</tbody>
                    <tfoot><tr>
                        <td colspan="2">${isHebrew ? 'סה"כ' : 'Total'}</td>
                        <td>${fmt(assetsTotal)}</td>
                    </tr></tfoot>
                </table>`);
        }

        // ── Loans ──
        if (loansData.length > 0) {
            const rows = loansData.map(l => `
                <tr>
                    <td>${l.name || l.lender || '-'}</td>
                    <td class="negative">${fmt(l.remainingBalance || l.balance || 0)}</td>
                    <td>${fmt(l.monthlyPayment || 0)}</td>
                    <td>${l.interestRate != null ? l.interestRate + '%' : '-'}</td>
                </tr>`).join('');
            content += section('🏦',
                'הלוואות', 'Loans',
                `<table>
                    <thead><tr>
                        <th>${isHebrew ? 'שם' : 'Name'}</th>
                        <th>${isHebrew ? 'יתרה לתשלום' : 'Remaining'}</th>
                        <th>${isHebrew ? 'תשלום חודשי' : 'Monthly Payment'}</th>
                        <th>${isHebrew ? 'ריבית' : 'Interest Rate'}</th>
                    </tr></thead>
                    <tbody>${rows}</tbody>
                    <tfoot><tr>
                        <td>${isHebrew ? 'סה"כ' : 'Total'}</td>
                        <td class="negative">${fmt(loansTotal)}</td>
                        <td colspan="2"></td>
                    </tr></tfoot>
                </table>`);
        }

        // ── Subscriptions ──
        if (subscriptions.length > 0) {
            const rows = subscriptions.map(s => `
                <tr>
                    <td>${s.name || '-'}</td>
                    <td>${fmt(s.amount || s.monthlyAmount || 0)}</td>
                    <td>${s.category || '-'}</td>
                </tr>`).join('');
            content += section('🔄',
                'מנויים קבועים', 'Recurring Subscriptions',
                `<table>
                    <thead><tr>
                        <th>${isHebrew ? 'שם' : 'Name'}</th>
                        <th>${isHebrew ? 'סכום/חודש' : 'Amount/Month'}</th>
                        <th>${isHebrew ? 'קטגוריה' : 'Category'}</th>
                    </tr></thead>
                    <tbody>${rows}</tbody>
                </table>`);
        }

        // ── Net Worth Summary ──
        const totalAssets = bankTotal + stocksTotal + fundsTotal + assetsTotal;
        content += `
        <div class="section">
            <div class="section-header">
                <div class="section-icon">📊</div>
                <div class="section-title">${isHebrew ? 'סיכום שווי נקי' : 'Net Worth Summary'}</div>
            </div>
            <div class="networth-summary">
                <div class="networth-row">
                    <span class="nw-label">${isHebrew ? 'חשבונות בנק' : 'Bank Accounts'}</span>
                    <span class="nw-value">${fmt(bankTotal)}</span>
                </div>
                <div class="networth-row">
                    <span class="nw-label">${isHebrew ? 'תיק מניות' : 'Stock Portfolio'}</span>
                    <span class="nw-value">${fmt(stocksTotal)}</span>
                </div>
                <div class="networth-row">
                    <span class="nw-label">${isHebrew ? 'חסכונות וקרנות' : 'Savings & Funds'}</span>
                    <span class="nw-value">${fmt(fundsTotal)}</span>
                </div>
                <div class="networth-row">
                    <span class="nw-label">${isHebrew ? 'נכסים' : 'Assets'}</span>
                    <span class="nw-value">${fmt(assetsTotal)}</span>
                </div>
                <div class="networth-row" style="border-top:1px solid #d1fae5;margin-top:4px;padding-top:10px;font-weight:600;">
                    <span class="nw-label">${isHebrew ? 'סה"כ נכסים' : 'Total Assets'}</span>
                    <span class="nw-value positive">${fmt(totalAssets)}</span>
                </div>
                ${loansTotal > 0 ? `
                <div class="networth-row">
                    <span class="nw-label">${isHebrew ? 'הלוואות' : 'Loans'}</span>
                    <span class="nw-value negative">- ${fmt(loansTotal)}</span>
                </div>` : ''}
                <div class="networth-row total-row">
                    <span class="nw-label">${isHebrew ? 'שווי נקי' : 'Net Worth'}</span>
                    <span class="nw-value">${fmt(netWorth)}</span>
                </div>
            </div>
        </div>`;

        content += `</div>`; // close .report-body

        return {
            title: isHebrew ? 'דוח פיננסי מלא' : 'Full Financial Report',
            content
        };
    },

    /**
     * Export bank accounts to CSV
     */
    exportBankAccountsCSV() {
        const lang = I18n?.currentLanguage || 'he';
        const isHebrew = lang === 'he';
        const data = Storage.getBankAccounts();

        const columns = [
            { key: 'bank', label: isHebrew ? 'בנק' : 'Bank' },
            { key: 'accountNumber', label: isHebrew ? 'מספר חשבון' : 'Account Number' },
            { key: 'balance', label: isHebrew ? 'יתרה' : 'Balance' },
            { key: 'currency', label: isHebrew ? 'מטבע' : 'Currency' }
        ];

        const exportData = data.map(acc => ({
            bank: acc.nameHe || acc.nameEn || acc.bank,
            accountNumber: acc.accountNumber || '',
            balance: acc.balance,
            currency: acc.currency || 'ILS'
        }));

        this.toCSV(exportData, columns, isHebrew ? 'חשבונות_בנק' : 'bank_accounts');
    },

    /**
     * Export stocks to CSV
     */
    exportStocksCSV() {
        const lang = I18n?.currentLanguage || 'he';
        const isHebrew = lang === 'he';
        const data = Storage.getStocks();

        const columns = [
            { key: 'symbol', label: isHebrew ? 'סימול' : 'Symbol' },
            { key: 'name', label: isHebrew ? 'שם' : 'Name' },
            { key: 'quantity', label: isHebrew ? 'כמות' : 'Quantity' },
            { key: 'avgPrice', label: isHebrew ? 'מחיר ממוצע' : 'Avg Price' },
            { key: 'currentPrice', label: isHebrew ? 'מחיר נוכחי' : 'Current Price' },
            { key: 'value', label: isHebrew ? 'שווי' : 'Value' },
            { key: 'profitLoss', label: isHebrew ? 'רווח/הפסד' : 'Profit/Loss' },
            { key: 'profitLossPercent', label: isHebrew ? 'אחוז רווח' : 'P/L %' }
        ];

        const exportData = data.holdings.map(h => {
            const currentPrice = h.currentPrice || h.avgPrice;
            const value = h.quantity * currentPrice;
            const cost = h.quantity * h.avgPrice;
            const pl = value - cost;
            return {
                symbol: h.symbol,
                name: h.name || '',
                quantity: h.quantity,
                avgPrice: h.avgPrice,
                currentPrice: currentPrice,
                value: value,
                profitLoss: pl,
                profitLossPercent: ((pl / cost) * 100).toFixed(2)
            };
        });

        this.toCSV(exportData, columns, isHebrew ? 'תיק_מניות' : 'stock_portfolio');
    },

    /**
     * Export expenses to CSV
     */
    exportExpensesCSV(month = null) {
        const lang = I18n?.currentLanguage || 'he';
        const isHebrew = lang === 'he';
        const data = Storage.getCreditCards();

        let expenses = data.expenses;

        if (month !== null) {
            expenses = expenses.filter(e => new Date(e.date).getMonth() === month);
        }

        const columns = [
            { key: 'date', label: isHebrew ? 'תאריך' : 'Date' },
            { key: 'description', label: isHebrew ? 'תיאור' : 'Description' },
            { key: 'category', label: isHebrew ? 'קטגוריה' : 'Category' },
            { key: 'amount', label: isHebrew ? 'סכום' : 'Amount' },
            { key: 'card', label: isHebrew ? 'כרטיס' : 'Card' }
        ];

        const exportData = expenses.map(e => ({
            date: e.date,
            description: e.description,
            category: e.category,
            amount: e.amount,
            card: e.cardId || ''
        }));

        this.toCSV(exportData, columns, isHebrew ? 'הוצאות' : 'expenses');
    },

    /**
     * Export full report to PDF
     */
    exportFullReportPDF() {
        const report = this.generateFullReport();
        this.toPDF(report.title, report.content);
    },

    /**
     * Show export options modal
     */
    showExportOptions() {
        const lang = I18n?.currentLanguage || 'he';
        const isHebrew = lang === 'he';

        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.id = 'exportModal';
        modal.innerHTML = `
            <div class="modal" style="max-width: 460px;">
                <div class="modal-header" style="background: linear-gradient(135deg, #10b981, #8b5cf6); margin: -1px -1px 0; border-radius: var(--radius-lg) var(--radius-lg) 0 0; padding: 20px 24px;">
                    <h2 style="color: #fff; font-size: 18px; display: flex; align-items: center; gap: 10px;">
                        <span style="background: rgba(255,255,255,0.2); border-radius: 8px; width: 32px; height: 32px; display: inline-flex; align-items: center; justify-content: center; font-size: 17px;">📤</span>
                        ${isHebrew ? 'ייצוא נתונים' : 'Export Data'}
                    </h2>
                    <button class="modal-close" onclick="ExportManager.closeExportModal()" style="color: rgba(255,255,255,0.8);">&times;</button>
                </div>
                <div class="modal-body" style="padding: 24px;">
                    <div class="export-section">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 14px;">
                            <span style="font-size: 15px;">📊</span>
                            <h3 style="font-size: 14px; font-weight: 600; color: var(--color-text-secondary);">${isHebrew ? 'ייצוא ל-Excel (CSV)' : 'Export to Excel (CSV)'}</h3>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            <button class="btn btn-secondary" style="justify-content: flex-start; gap: 10px; text-align: ${isHebrew ? 'right' : 'left'};" onclick="ExportManager.exportBankAccountsCSV(); ExportManager.closeExportModal();">
                                <span>🏦</span> ${isHebrew ? 'חשבונות בנק' : 'Bank Accounts'}
                            </button>
                            <button class="btn btn-secondary" style="justify-content: flex-start; gap: 10px; text-align: ${isHebrew ? 'right' : 'left'};" onclick="ExportManager.exportStocksCSV(); ExportManager.closeExportModal();">
                                <span>📈</span> ${isHebrew ? 'תיק מניות' : 'Stock Portfolio'}
                            </button>
                            <button class="btn btn-secondary" style="justify-content: flex-start; gap: 10px; text-align: ${isHebrew ? 'right' : 'left'};" onclick="ExportManager.exportExpensesCSV(); ExportManager.closeExportModal();">
                                <span>💳</span> ${isHebrew ? 'הוצאות אשראי' : 'Credit Expenses'}
                            </button>
                        </div>
                    </div>

                    <div class="export-section" style="margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--color-border);">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 14px;">
                            <span style="font-size: 15px;">📋</span>
                            <h3 style="font-size: 14px; font-weight: 600; color: var(--color-text-secondary);">${isHebrew ? 'ייצוא ל-PDF' : 'Export to PDF'}</h3>
                        </div>
                        <button class="btn btn-primary" style="width: 100%; flex-direction: column; align-items: center; padding: 16px; gap: 6px;" onclick="ExportManager.exportFullReportPDF(); ExportManager.closeExportModal();">
                            <span style="font-size: 22px;">📄</span>
                            <span style="font-size: 15px; font-weight: 700;">${isHebrew ? 'דוח פיננסי מלא' : 'Full Financial Report'}</span>
                            <span style="font-size: 12px; opacity: 0.85; font-weight: 400;">${isHebrew ? 'דוח מלא עם כל הנתונים הפיננסיים' : 'Complete report with all financial data'}</span>
                        </button>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="ExportManager.closeExportModal()">${isHebrew ? 'סגור' : 'Close'}</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    },

    /**
     * Close export modal
     */
    closeExportModal() {
        const modal = document.getElementById('exportModal');
        if (modal) {
            modal.remove();
        }
    }
};

// Make available globally
window.ExportManager = ExportManager;
