/**
 * CSV Import Module - Import data from Excel/CSV files
 */
const CSVImport = {
    /**
     * Parse CSV string to array of objects
     * @param {string} csvText - Raw CSV text
     * @param {object} options - Parsing options
     * @returns {Array} Array of objects
     */
    parse(csvText, options = {}) {
        const { delimiter = ',', hasHeader = true } = options;

        // Handle both \r\n and \n line endings
        const lines = csvText.trim().split(/\r?\n/);
        if (lines.length === 0) return [];

        // Parse header row
        const headers = this.parseLine(lines[0], delimiter);

        if (!hasHeader) {
            // Generate default headers
            return lines.map(line => {
                const values = this.parseLine(line, delimiter);
                const obj = {};
                values.forEach((val, i) => obj[`col${i}`] = val);
                return obj;
            });
        }

        // Parse data rows
        const data = [];
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim() === '') continue;

            const values = this.parseLine(lines[i], delimiter);
            const obj = {};

            headers.forEach((header, index) => {
                obj[header.trim()] = values[index]?.trim() || '';
            });

            data.push(obj);
        }

        return data;
    },

    /**
     * Parse a single CSV line handling quoted fields
     */
    parseLine(line, delimiter) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === delimiter && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }

        result.push(current);
        return result;
    },

    /**
     * Read file and return CSV data
     */
    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    // Try to detect encoding (Hebrew files might be Windows-1255)
                    const text = e.target.result;
                    resolve(text);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsText(file, 'UTF-8');
        });
    },

    /**
     * Open file picker and import
     */
    async openFilePicker(type) {
        return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.csv,.txt,.xlsx';

            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) {
                    resolve({ success: false, error: 'No file selected' });
                    return;
                }

                try {
                    const csvText = await this.readFile(file);
                    const data = this.parse(csvText);

                    const result = await this.importData(type, data);
                    resolve(result);
                } catch (error) {
                    resolve({ success: false, error: error.message });
                }
            };

            input.click();
        });
    },

    /**
     * Import parsed data based on type
     */
    async importData(type, data) {
        if (!data || data.length === 0) {
            return { success: false, error: 'No data found in file' };
        }

        let imported = 0;
        const errors = [];

        switch (type) {
            case 'expenses':
                imported = this.importExpenses(data, errors);
                break;
            case 'bank':
                imported = this.importBankTransactions(data, errors);
                break;
            case 'stocks':
                imported = this.importStocks(data, errors);
                break;
            case 'funds':
                imported = this.importFunds(data, errors);
                break;
            default:
                return { success: false, error: 'Unknown import type' };
        }

        return {
            success: imported > 0,
            imported,
            total: data.length,
            errors
        };
    },

    /**
     * Import credit card expenses
     * Expected columns: תאריך/Date, סכום/Amount, קטגוריה/Category, תיאור/Description
     */
    importExpenses(data, errors) {
        const creditData = Storage.getCreditCards();

        // Get or create default card
        if (creditData.cards.length === 0) {
            Storage.addCreditCard({ name: 'כרטיס מיובא', lastFour: '0000', creditLimit: 0 });
        }
        const cardId = Storage.getCreditCards().cards[0].id;

        const categoryMap = {
            // Hebrew
            'מזון': 'food', 'אוכל': 'food', 'מסעדות': 'food', 'סופר': 'food',
            'תחבורה': 'transport', 'דלק': 'transport', 'רכב': 'transport',
            'קניות': 'shopping', 'ביגוד': 'shopping',
            'בילויים': 'entertainment', 'פנאי': 'entertainment',
            'חשבונות': 'bills', 'תשלומים': 'bills',
            'בריאות': 'health', 'רפואה': 'health',
            'חינוך': 'education', 'לימודים': 'education',
            // English
            'food': 'food', 'restaurant': 'food', 'groceries': 'food',
            'transport': 'transport', 'gas': 'transport', 'fuel': 'transport',
            'shopping': 'shopping', 'clothing': 'shopping',
            'entertainment': 'entertainment', 'leisure': 'entertainment',
            'bills': 'bills', 'utilities': 'bills',
            'health': 'health', 'medical': 'health',
            'education': 'education'
        };

        let imported = 0;

        data.forEach((row, index) => {
            try {
                // Find date column
                const dateVal = row['תאריך'] || row['Date'] || row['date'] || row['תאריך עסקה'] || '';
                // Find amount column
                let amountVal = row['סכום'] || row['Amount'] || row['amount'] || row['סכום עסקה'] || row['חיוב'] || '0';
                // Find category
                const catVal = row['קטגוריה'] || row['Category'] || row['category'] || row['סוג'] || '';
                // Find description
                const descVal = row['תיאור'] || row['Description'] || row['description'] || row['שם בית העסק'] || row['פרטים'] || '';

                // Parse date
                let date = this.parseDate(dateVal);
                if (!date) {
                    errors.push(`Row ${index + 1}: Invalid date "${dateVal}"`);
                    return;
                }

                // Parse amount (handles Israeli 1,234.56 and Brazilian 1.234,56 formats)
                amountVal = this.parseAmount(String(amountVal));
                const amount = Math.abs(amountVal);

                if (isNaN(amount) || amount === 0) {
                    errors.push(`Row ${index + 1}: Invalid amount "${amountVal}"`);
                    return;
                }

                // Map category
                const categoryKey = catVal.toLowerCase().trim();
                const category = categoryMap[categoryKey] || 'other';

                Storage.addExpense({
                    cardId,
                    date,
                    amount,
                    category,
                    description: descVal || 'יובא מ-CSV',
                    isRecurring: false
                });

                imported++;
            } catch (err) {
                errors.push(`Row ${index + 1}: ${err.message}`);
            }
        });

        return imported;
    },

    /**
     * Import bank transactions/balances
     * Expected columns: תאריך/Date, יתרה/Balance, תיאור/Description
     */
    importBankTransactions(data, errors) {
        let accounts = Storage.getBankAccounts();

        // Create default account if none exists
        if (accounts.length === 0) {
            Storage.addBankAccount({
                nameHe: 'חשבון מיובא',
                nameEn: 'Imported Account',
                bank: 'other',
                accountNumber: '0000',
                balance: 0,
                currency: 'ILS'
            });
            accounts = Storage.getBankAccounts();
        }

        const account = accounts[0];
        let imported = 0;
        const newHistory = [...(account.history || [])];

        data.forEach((row, index) => {
            try {
                const dateVal = row['תאריך'] || row['Date'] || row['date'] || '';
                let balanceVal = row['יתרה'] || row['Balance'] || row['balance'] || row['סכום'] || '';

                const date = this.parseDate(dateVal);
                if (!date) {
                    errors.push(`Row ${index + 1}: Invalid date`);
                    return;
                }

                const balance = this.parseAmount(String(balanceVal));

                if (isNaN(balance)) {
                    errors.push(`Row ${index + 1}: Invalid balance`);
                    return;
                }

                // Add to history if not duplicate
                if (!newHistory.find(h => h.date === date)) {
                    newHistory.push({ date, balance });
                    imported++;
                }
            } catch (err) {
                errors.push(`Row ${index + 1}: ${err.message}`);
            }
        });

        // Sort by date and update
        newHistory.sort((a, b) => new Date(a.date) - new Date(b.date));

        // Update account with latest balance
        const latestBalance = newHistory.length > 0 ? newHistory[newHistory.length - 1].balance : account.balance;
        Storage.updateBankAccount(account.id, {
            history: newHistory,
            balance: latestBalance
        });

        return imported;
    },

    /**
     * Import stocks
     * Expected columns: סימול/Symbol, שם/Name, כמות/Quantity, מחיר/Price
     */
    importStocks(data, errors) {
        let imported = 0;

        data.forEach((row, index) => {
            try {
                const symbol = (row['סימול'] || row['Symbol'] || row['symbol'] || row['ticker'] || '').toUpperCase();
                const name = row['שם'] || row['Name'] || row['name'] || row['שם חברה'] || '';
                let quantity = row['כמות'] || row['Quantity'] || row['quantity'] || row['יחידות'] || '0';
                let price = row['מחיר'] || row['Price'] || row['price'] || row['מחיר קנייה'] || row['עלות'] || '0';
                const currency = row['מטבע'] || row['Currency'] || 'USD';

                if (!symbol) {
                    errors.push(`Row ${index + 1}: Missing symbol`);
                    return;
                }

                quantity = parseFloat(String(quantity).replace(/,/g, ''));
                price = parseFloat(String(price).replace(/[$₪,]/g, ''));

                if (isNaN(quantity) || quantity <= 0) {
                    errors.push(`Row ${index + 1}: Invalid quantity`);
                    return;
                }

                if (isNaN(price) || price <= 0) {
                    errors.push(`Row ${index + 1}: Invalid price`);
                    return;
                }

                Storage.addStock({
                    symbol,
                    name: name || symbol,
                    quantity,
                    avgPrice: price,
                    currentPrice: price,
                    currency: currency.toUpperCase().includes('ILS') ? 'ILS' : 'USD'
                });

                imported++;
            } catch (err) {
                errors.push(`Row ${index + 1}: ${err.message}`);
            }
        });

        return imported;
    },

    /**
     * Import pension/training/gemel funds
     * Expected columns: סוג/Type, שם/Name, חברה/Company, ערך/Value, הפקדה/Deposit
     */
    importFunds(data, errors) {
        const typeMap = {
            // Hebrew
            'השתלמות': 'training', 'קרן השתלמות': 'training', 'training': 'training',
            'פנסיה': 'pension', 'pension': 'pension',
            'גמל': 'gemel', 'קופת גמל': 'gemel', 'gemel': 'gemel'
        };

        let imported = 0;

        data.forEach((row, index) => {
            try {
                // Find type
                const typeVal = row['סוג'] || row['Type'] || row['type'] || '';
                const typeKey = typeVal.toLowerCase().trim();
                const type = typeMap[typeKey];

                if (!type) {
                    errors.push(`Row ${index + 1}: Unknown fund type "${typeVal}"`);
                    return;
                }

                // Find other columns
                const name = row['שם'] || row['Name'] || row['name'] || row['שם קרן'] || '';
                const company = row['חברה'] || row['Company'] || row['company'] || row['חברה מנהלת'] || '';
                let value = row['ערך'] || row['Value'] || row['value'] || row['שווי'] || row['יתרה'] || '0';
                let deposit = row['הפקדה'] || row['Deposit'] || row['deposit'] || row['הפקדה חודשית'] || '0';

                if (!name) {
                    errors.push(`Row ${index + 1}: Missing fund name`);
                    return;
                }

                // Parse values
                value = parseFloat(String(value).replace(/[₪$,]/g, '').trim()) || 0;
                deposit = parseFloat(String(deposit).replace(/[₪$,]/g, '').trim()) || 0;

                // Add fund
                Storage.addMyFund({
                    type,
                    name,
                    company,
                    currentValue: value,
                    monthlyDeposit: deposit,
                    history: [{
                        date: new Date().toISOString().split('T')[0],
                        value: value
                    }],
                    lastUpdate: new Date().toISOString().split('T')[0]
                });

                imported++;
            } catch (err) {
                errors.push(`Row ${index + 1}: ${err.message}`);
            }
        });

        return imported;
    },

    /**
     * Parse various date formats
     */
    parseAmount(str) {
        if (!str) return NaN;
        str = String(str).trim().replace(/\s/g, '').replace(/[₪$R$]/g, '');
        if (!str) return NaN;
        // Brazilian: 1.234,56 or 234,56
        if (/^\-?\d{1,3}(\.\d{3})*(,\d+)?$/.test(str)) return parseFloat(str.replace(/\./g, '').replace(',', '.'));
        if (/^\-?\d+(,\d+)$/.test(str)) return parseFloat(str.replace(',', '.'));
        // Standard: remove thousands commas
        return parseFloat(str.replace(/,/g, ''));
    },

    parseDate(dateStr) {
        if (!dateStr) return null;

        dateStr = String(dateStr).trim();

        // Try ISO format (YYYY-MM-DD)
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            return dateStr;
        }

        // Try DD/MM/YYYY or DD-MM-YYYY (Hebrew format)
        let match = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
        if (match) {
            const [, day, month, year] = match;
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }

        // Try MM/DD/YYYY (US format)
        match = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})$/);
        if (match) {
            const [, month, day, year] = match;
            const fullYear = parseInt(year) > 50 ? `19${year}` : `20${year}`;
            return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }

        // Try to parse with Date
        const parsed = new Date(dateStr);
        if (!isNaN(parsed.getTime())) {
            return parsed.toISOString().split('T')[0];
        }

        return null;
    },

    /**
     * Show import modal with format instructions
     */
    showImportHelp(type) {
        const formats = {
            expenses: {
                title: 'ייבוא הוצאות אשראי',
                columns: ['תאריך / Date', 'סכום / Amount', 'קטגוריה / Category', 'תיאור / Description'],
                example: 'תאריך,סכום,קטגוריה,תיאור\n15/01/2025,150,מזון,רמי לוי\n16/01/2025,80,תחבורה,דלק'
            },
            bank: {
                title: 'ייבוא תנועות בנק',
                columns: ['תאריך / Date', 'יתרה / Balance'],
                example: 'תאריך,יתרה\n01/01/2025,45000\n15/01/2025,42000'
            },
            stocks: {
                title: 'ייבוא מניות',
                columns: ['סימול / Symbol', 'שם / Name', 'כמות / Quantity', 'מחיר / Price'],
                example: 'סימול,שם,כמות,מחיר\nAAPL,Apple Inc.,10,150\nMSFT,Microsoft,5,400'
            },
            funds: {
                title: 'ייבוא קרנות (השתלמות/פנסיה/גמל)',
                columns: ['סוג / Type', 'שם / Name', 'חברה / Company', 'ערך / Value', 'הפקדה / Deposit'],
                example: 'סוג,שם,חברה,ערך,הפקדה\ntraining,קרן השתלמות,מיטב,150000,2500\npension,פנסיה,מנורה,85000,3000\ngemel,גמל להשקעה,אלטשולר,45000,1000'
            }
        };

        const format = formats[type];
        return format;
    }
};

// Make available globally
window.CSVImport = CSVImport;
