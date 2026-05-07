/**
 * Smart Import Module - Automatic column detection with multi-language support
 */
const SmartImport = {
    // Column name mappings in different languages
    columnMappings: {
        date: [
            // Hebrew (incl. Israeli banks: Hapoalim/Leumi/Discount/Mizrahi/FIBI/Yahav)
            'תאריך', 'תאריך עסקה', 'תאריך חיוב', 'תאריך ערך', 'תאריך הפעולה',
            'תאריך פעולה', 'תאריך ביצוע',
            'date', 'transaction date', 'value date', 'posting date',
            'data', 'data da transação', 'fecha', 'fecha de transacción',
            'datum', 'transaktionsdatum', 'date de transaction'
        ],
        amount: [
            // Hebrew
            'סכום', 'סכום חיוב', 'סכום עסקה', 'סכום העסקה', 'סכום בש"ח', 'סכום בשח',
            // Israeli banks separate debit/credit columns
            'חובה', 'זכות', 'חיוב', 'זיכוי',
            'amount', 'charge amount', 'total', 'debit', 'credit',
            'valor', 'montante', 'débito', 'crédito',
            'importe', 'monto', 'débito', 'crédito',
            'betrag', 'summe', 'soll', 'haben', 'montant', 'débit', 'crédit'
        ],
        originalAmount: [
            'סכום מקורי', 'סכום עסקה מקורי', 'original amount', 'original value',
            'valor original', 'importe original', 'ursprünglicher betrag'
        ],
        description: [
            // Hebrew (incl. Israeli banks)
            'תיאור', 'שם בית העסק', 'פרטים', 'תיאור הפעולה', 'תיאור פעולה',
            'פירוט', 'פירוט פעולה', 'הפעולה', 'מהות העסקה', 'מהות הפעולה',
            'description', 'merchant', 'merchant name', 'memo', 'narrative',
            'descrição', 'estabelecimento', 'descripción', 'comercio',
            'beschreibung', 'händler', 'description du marchand'
        ],
        balance: [
            'יתרה', 'יתרה שוטפת', 'יתרת חשבון', 'יתרה בש"ח', 'balance',
            'saldo', 'solde'
        ],
        reference: [
            'אסמכתא', 'מספר אסמכתא', 'מס\' אסמכתא', 'reference', 'ref', 'ref no',
            'referencia', 'referência'
        ],
        category: [
            'קטגוריה', 'סוג', 'category', 'type', 'categoria', 'categoría',
            'kategorie', 'catégorie'
        ],
        currency: [
            'מטבע', 'מטבע חיוב', 'מטבע עסקה מקורי', 'currency', 'original currency',
            'moeda', 'moneda', 'währung', 'devise'
        ],
        exchangeRate: [
            'שער המרה', 'שער', 'exchange rate', 'rate', 'taxa de câmbio',
            'tipo de cambio', 'wechselkurs', 'taux de change'
        ],
        cardNumber: [
            '4 ספרות', 'ספרות אחרונות', 'כרטיס', 'card', 'last 4', 'card number',
            'cartão', 'tarjeta', 'karte', 'carte'
        ],
        notes: [
            'הערות', 'notes', 'remarks', 'observações', 'notas', 'bemerkungen', 'remarques'
        ]
    },

    // Category mappings from different languages to internal categories
    categoryMappings: {
        food: [
            'מזון', 'מזון ומסעדות', 'מסעדות', 'סופרמרקט', 'מסעדות, קפה וברים',
            'food', 'restaurant', 'restaurants', 'groceries', 'supermarket', 'dining',
            'alimentação', 'restaurante', 'supermercado', 'comida',
            'comida', 'restaurante', 'supermercado', 'alimentación',
            'essen', 'restaurant', 'lebensmittel', 'supermarkt',
            'nourriture', 'restaurant', 'épicerie', 'supermarché'
        ],
        transport: [
            'תחבורה', 'תחבורה ודלק', 'דלק', 'דלק, חשמל וגז',
            'transport', 'transportation', 'gas', 'fuel', 'travel',
            'transporte', 'combustível', 'gasolina', 'viagem',
            'transporte', 'combustible', 'gasolina', 'viaje',
            'transport', 'benzin', 'kraftstoff', 'reise',
            'transport', 'essence', 'carburant', 'voyage'
        ],
        shopping: [
            'קניות', 'אופנה', 'אופנה והנעלה', 'ציוד לבית',
            'shopping', 'clothing', 'fashion', 'retail', 'store',
            'compras', 'roupas', 'moda', 'loja',
            'compras', 'ropa', 'moda', 'tienda',
            'einkaufen', 'kleidung', 'mode', 'geschäft',
            'shopping', 'vêtements', 'mode', 'magasin'
        ],
        entertainment: [
            'בילויים', 'בידור', 'פנאי', 'פנאי, בידור וספורט',
            'entertainment', 'leisure', 'fun', 'movies', 'sports',
            'entretenimento', 'lazer', 'diversão', 'esportes',
            'entretenimiento', 'ocio', 'diversión', 'deportes',
            'unterhaltung', 'freizeit', 'spaß', 'sport',
            'divertissement', 'loisirs', 'plaisir', 'sports'
        ],
        bills: [
            'חשבונות', 'חשבונות קבועים', 'עירייה וממשלה', 'שירותי תקשורת', 'חשמל ומים',
            'bills', 'utilities', 'services', 'subscription', 'government',
            'contas', 'serviços', 'utilidades', 'governo',
            'facturas', 'servicios', 'utilidades', 'gobierno',
            'rechnungen', 'versorgung', 'dienste', 'regierung',
            'factures', 'services', 'utilitaires', 'gouvernement'
        ],
        health: [
            'בריאות', 'בריאות ויופי', 'רפואה',
            'health', 'medical', 'pharmacy', 'healthcare', 'beauty',
            'saúde', 'médico', 'farmácia', 'beleza',
            'salud', 'médico', 'farmacia', 'belleza',
            'gesundheit', 'medizin', 'apotheke', 'schönheit',
            'santé', 'médical', 'pharmacie', 'beauté'
        ],
        education: [
            'חינוך', 'לימודים', 'education', 'school', 'learning', 'courses',
            'educação', 'escola', 'cursos',
            'educación', 'escuela', 'cursos',
            'bildung', 'schule', 'kurse',
            'éducation', 'école', 'cours'
        ],
        other: [
            'אחר', 'שונות', 'other', 'misc', 'miscellaneous',
            'outro', 'diversos', 'otro', 'varios',
            'andere', 'sonstige', 'autre', 'divers'
        ]
    },

    // Saved templates
    TEMPLATES_KEY: 'finance_import_templates',

    /**
     * Parse file content (CSV or Excel XML)
     */
    parseFile: function(content, fileName) {
        var rows = [];
        var isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || content.includes('<?xml');

        if (isExcel) {
            rows = this.parseExcelXML(content);
        } else {
            rows = this.parseCSV(content);
        }

        return rows;
    },

    /**
     * Parse Excel XML content
     */
    parseExcelXML: function(content) {
        var rows = [];
        var rowPattern = /<row[^>]*>([\s\S]*?)<\/row>/gi;
        var cellPattern = /<c[^>]*>([\s\S]*?)<\/c>/gi;
        var valuePattern = /<v>([^<]*)<\/v>/;

        var match;
        while ((match = rowPattern.exec(content)) !== null) {
            var rowContent = match[1];
            var cells = [];
            var cellMatch;
            var cp = new RegExp(cellPattern.source, 'gi');

            while ((cellMatch = cp.exec(rowContent)) !== null) {
                var cellContent = cellMatch[1];
                var valMatch = cellContent.match(valuePattern);
                cells.push(valMatch ? valMatch[1].trim() : '');
            }

            if (cells.length > 0) {
                rows.push(cells);
            }
        }

        return rows;
    },

    /**
     * Parse CSV content
     */
    parseCSV: function(content) {
        var rows = [];
        var lines = content.split(/\r?\n/);

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            if (!line) continue;

            // Handle quoted values
            var cells = [];
            var current = '';
            var inQuotes = false;

            for (var j = 0; j < line.length; j++) {
                var char = line[j];
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if ((char === ',' || char === '\t' || char === ';') && !inQuotes) {
                    cells.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            cells.push(current.trim());

            if (cells.length > 0) {
                rows.push(cells);
            }
        }

        return rows;
    },

    /**
     * Find header row in parsed data
     */
    findHeaderRow: function(rows) {
        for (var i = 0; i < Math.min(rows.length, 10); i++) {
            var row = rows[i];
            var headerText = row.join(' ').toLowerCase();

            // Check if this row contains common header words
            var hasDateWord = this.columnMappings.date.some(function(word) {
                return headerText.includes(word.toLowerCase());
            });
            var hasAmountWord = this.columnMappings.amount.some(function(word) {
                return headerText.includes(word.toLowerCase());
            });

            if (hasDateWord || hasAmountWord) {
                return i;
            }
        }
        return 0; // Default to first row
    },

    /**
     * Auto-detect column mappings
     */
    detectColumns: function(headerRow) {
        var detected = {};
        var self = this;

        headerRow.forEach(function(header, index) {
            var headerLower = header.toLowerCase().trim();

            // Check each field type
            Object.keys(self.columnMappings).forEach(function(field) {
                if (detected[field] !== undefined) return; // Already found

                var matches = self.columnMappings[field].some(function(keyword) {
                    return headerLower.includes(keyword.toLowerCase());
                });

                if (matches) {
                    detected[field] = index;
                }
            });
        });

        return detected;
    },

    /**
     * Map category from any language to internal category
     */
    mapCategory: function(categoryText) {
        if (!categoryText) return 'other';
        var catLower = categoryText.toLowerCase().trim();
        var self = this;

        var foundCategory = 'other';
        Object.keys(this.categoryMappings).forEach(function(internalCat) {
            self.categoryMappings[internalCat].forEach(function(keyword) {
                if (catLower.includes(keyword.toLowerCase())) {
                    foundCategory = internalCat;
                }
            });
        });

        return foundCategory;
    },

    /**
     * Parse date from various formats
     */
    parseDate: function(dateStr) {
        if (!dateStr) return null;

        // Try different date formats
        var formats = [
            // DD-MM-YYYY or DD/MM/YYYY
            /^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/,
            // YYYY-MM-DD or YYYY/MM/DD
            /^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/,
            // MM-DD-YYYY or MM/DD/YYYY (US format)
            /^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/
        ];

        // Try DD-MM-YYYY first (common in Israel/Europe)
        var match = dateStr.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
        if (match) {
            var day = match[1].padStart(2, '0');
            var month = match[2].padStart(2, '0');
            var year = match[3];
            return year + '-' + month + '-' + day;
        }

        // Try YYYY-MM-DD
        match = dateStr.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/);
        if (match) {
            return match[1] + '-' + match[2].padStart(2, '0') + '-' + match[3].padStart(2, '0');
        }

        return null;
    },

    /**
     * Parse amount from various formats
     */
    parseAmount: function(amountStr) {
        if (!amountStr) return 0;
        // Remove currency symbols and spaces
        var cleaned = amountStr.toString().replace(/[₪$€£R\s]/g, '').replace(/,/g, '');
        return parseFloat(cleaned) || 0;
    },

    /**
     * Parse exchange rate from text
     */
    parseExchangeRate: function(rateStr) {
        if (!rateStr) return null;
        var match = rateStr.match(/(\d+\.?\d*)/);
        return match ? parseFloat(match[1]) : null;
    },

    /**
     * Import data with auto-detection
     */
    importWithAutoDetect: function(content, fileName, dataType) {
        var rows = this.parseFile(content, fileName);
        if (rows.length < 2) {
            return { success: false, error: 'הקובץ ריק או לא תקין' };
        }

        var headerIdx = this.findHeaderRow(rows);
        var headerRow = rows[headerIdx];
        var detected = this.detectColumns(headerRow);

        // Check if we have minimum required fields
        var hasDate = detected.date !== undefined;
        var hasAmount = detected.amount !== undefined;
        var hasDescription = detected.description !== undefined;

        if (!hasDate || !hasAmount) {
            // Need manual mapping
            return {
                success: false,
                needsMapping: true,
                headers: headerRow,
                detected: detected,
                rows: rows,
                headerIdx: headerIdx
            };
        }

        // Auto import
        return this.processRows(rows, headerIdx, detected, dataType);
    },

    /**
     * Process rows with given column mapping
     */
    processRows: function(rows, headerIdx, mapping, dataType) {
        var self = this;
        var items = [];
        var errors = [];

        for (var i = headerIdx + 1; i < rows.length; i++) {
            var row = rows[i];
            if (row.length < 2) continue;

            try {
                var dateStr = mapping.date !== undefined ? row[mapping.date] : '';
                var date = this.parseDate(dateStr);
                if (!date) continue;

                var amount = this.parseAmount(mapping.amount !== undefined ? row[mapping.amount] : '0');
                if (amount <= 0) continue;

                var description = mapping.description !== undefined ? row[mapping.description] : '';
                if (!description) continue;

                var item = {
                    date: date,
                    amount: amount,
                    description: description.trim(),
                    category: this.mapCategory(mapping.category !== undefined ? row[mapping.category] : ''),
                    originalAmount: this.parseAmount(mapping.originalAmount !== undefined ? row[mapping.originalAmount] : ''),
                    originalCurrency: mapping.currency !== undefined ? row[mapping.currency] : null,
                    exchangeRate: this.parseExchangeRate(mapping.exchangeRate !== undefined ? row[mapping.exchangeRate] : ''),
                    cardLastFour: mapping.cardNumber !== undefined ? row[mapping.cardNumber] : '',
                    notes: mapping.notes !== undefined ? row[mapping.notes] : ''
                };

                items.push(item);
            } catch (e) {
                errors.push('שורה ' + (i + 1) + ': ' + e.message);
            }
        }

        return {
            success: true,
            items: items,
            errors: errors,
            count: items.length
        };
    },

    /**
     * Save template for future use
     */
    saveTemplate: function(name, mapping, filePattern) {
        var templates = this.getTemplates();
        templates[name] = {
            mapping: mapping,
            filePattern: filePattern,
            createdAt: new Date().toISOString()
        };
        Storage.set(Storage.KEYS.IMPORT_TEMPLATES, templates);
    },

    /**
     * Get saved templates
     */
    getTemplates: function() {
        try {
            return Storage.get(Storage.KEYS.IMPORT_TEMPLATES) || {};
        } catch (e) {
            return {};
        }
    },

    /**
     * Delete template
     */
    deleteTemplate: function(name) {
        var templates = this.getTemplates();
        delete templates[name];
        Storage.set(Storage.KEYS.IMPORT_TEMPLATES, templates);
    },

    /**
     * Show mapping modal
     */
    showMappingModal: function(headers, detected, onConfirm) {
        var self = this;
        var fields = [
            { key: 'date', label: 'תאריך', required: true },
            { key: 'amount', label: 'סכום', required: true },
            { key: 'description', label: 'תיאור', required: true },
            { key: 'category', label: 'קטגוריה', required: false },
            { key: 'originalAmount', label: 'סכום מקורי', required: false },
            { key: 'currency', label: 'מטבע', required: false },
            { key: 'exchangeRate', label: 'שער המרה', required: false },
            { key: 'cardNumber', label: 'מספר כרטיס', required: false },
            { key: 'notes', label: 'הערות', required: false }
        ];

        var modalHtml = '<div class="modal-overlay active" id="mappingModal">';
        modalHtml += '<div class="modal" style="max-width: 600px;">';
        modalHtml += '<div class="modal-header"><h2>🔧 מיפוי עמודות</h2>';
        modalHtml += '<button class="modal-close" onclick="SmartImport.closeMappingModal()">&times;</button></div>';
        modalHtml += '<div class="modal-body">';
        modalHtml += '<p style="margin-bottom: 15px; color: var(--color-text-secondary);">נמצאו ' + headers.length + ' עמודות. התאם כל עמודה לשדה המתאים:</p>';
        modalHtml += '<table style="width: 100%; border-collapse: collapse;">';
        modalHtml += '<thead><tr><th style="text-align: right; padding: 10px;">שדה</th><th style="text-align: right; padding: 10px;">עמודה בקובץ</th></tr></thead>';
        modalHtml += '<tbody>';

        fields.forEach(function(field) {
            var selectedIdx = detected[field.key];
            modalHtml += '<tr style="border-bottom: 1px solid var(--color-border);">';
            modalHtml += '<td style="padding: 10px;">' + field.label + (field.required ? ' *' : '') + '</td>';
            modalHtml += '<td style="padding: 10px;"><select id="map_' + field.key + '" class="form-control">';
            modalHtml += '<option value="">-- בחר עמודה --</option>';
            headers.forEach(function(header, idx) {
                var selected = selectedIdx === idx ? ' selected' : '';
                modalHtml += '<option value="' + idx + '"' + selected + '>' + header + '</option>';
            });
            modalHtml += '</select></td></tr>';
        });

        modalHtml += '</tbody></table>';
        modalHtml += '<div style="margin-top: 15px;"><label><input type="checkbox" id="saveAsTemplate"> שמור כתבנית</label>';
        modalHtml += '<input type="text" id="templateName" class="form-control" placeholder="שם התבנית" style="margin-top: 5px; display: none;"></div>';
        modalHtml += '</div>';
        modalHtml += '<div class="modal-footer">';
        modalHtml += '<button class="btn btn-secondary" onclick="SmartImport.closeMappingModal()">ביטול</button>';
        modalHtml += '<button class="btn btn-primary" onclick="SmartImport.confirmMapping()">ייבא</button>';
        modalHtml += '</div></div></div>';

        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Toggle template name input
        document.getElementById('saveAsTemplate').addEventListener('change', function() {
            document.getElementById('templateName').style.display = this.checked ? 'block' : 'none';
        });

        this._mappingCallback = onConfirm;
        this._headers = headers;
    },

    /**
     * Close mapping modal
     */
    closeMappingModal: function() {
        var modal = document.getElementById('mappingModal');
        if (modal) modal.remove();
        this._mappingCallback = null;
    },

    /**
     * Confirm mapping from modal
     */
    confirmMapping: function() {
        var mapping = {};
        var fields = ['date', 'amount', 'description', 'category', 'originalAmount', 'currency', 'exchangeRate', 'cardNumber', 'notes'];

        fields.forEach(function(field) {
            var select = document.getElementById('map_' + field);
            if (select && select.value !== '') {
                mapping[field] = parseInt(select.value);
            }
        });

        // Validate required fields
        if (mapping.date === undefined || mapping.amount === undefined || mapping.description === undefined) {
            alert('יש למפות לפחות: תאריך, סכום ותיאור');
            return;
        }

        // Save template if requested
        if (document.getElementById('saveAsTemplate').checked) {
            var templateName = document.getElementById('templateName').value.trim();
            if (templateName) {
                this.saveTemplate(templateName, mapping, '');
            }
        }

        if (this._mappingCallback) {
            this._mappingCallback(mapping);
        }

        this.closeMappingModal();
    }
};

// Make available globally
window.SmartImport = SmartImport;
