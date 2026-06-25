/**
 * Currency Exchange Rates Module
 * Fetches real-time exchange rates from free API
 */
const CurrencyRates = {
    STORAGE_KEY: 'finance_currency_rates',
    CACHE_DURATION: 4 * 60 * 60 * 1000, // 4 hours cache

    // Free API for exchange rates (no API key required)
    API_URL: 'https://api.exchangerate-api.com/v4/latest/ILS',

    // Fallback rates (ILS per 1 unit) used only when the API is unreachable.
    // Verified 2026-06-14 (USD/ILS ≈ 2.92). Were stale (~3.65 USD) and BRL was
    // missing entirely → Brazilian (Nubank/Itaú) balances counted 1 BRL = 1 ILS.
    fallbackRates: {
        USD: 2.92,
        EUR: 3.16,
        GBP: 3.68,
        BRL: 0.53,
        CAD: 2.13,
        AUD: 1.90,
        ILS: 1
    },

    /**
     * Get current rates (from cache or fetch new)
     */
    async getRates() {
        const cached = this.getCachedRates();

        if (cached && !this.isCacheExpired(cached)) {
            return cached.rates;
        }

        try {
            const rates = await this.fetchRates();
            this.cacheRates(rates);
            return rates;
        } catch (error) {
            console.error('Error fetching rates:', error);
            return cached?.rates || this.fallbackRates;
        }
    },

    /**
     * Fetch rates from API
     */
    async fetchRates() {
        // 5s timeout so a stalled exchange-rate API can't hang every
        // multi-currency total forever — on abort/timeout this fetch rejects
        // and getRates()'s catch falls back to cached/fallbackRates.
        const response = await fetch(this.API_URL, { signal: AbortSignal.timeout(5000) });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // API returns rates relative to ILS (rate[X] = X per 1 ILS); we store the
        // inverse (ILS per 1 X). Invert EVERY currency the API returns — the old code
        // kept only USD/EUR/GBP, so BRL (and any other held currency) fell through to
        // 1:1 and silently corrupted multi-currency totals.
        const rates = { ILS: 1 };
        for (const [cur, v] of Object.entries(data.rates || {})) {
            if (typeof v === 'number' && v > 0) rates[cur] = 1 / v;
        }
        return rates;
    },

    /**
     * Get cached rates
     */
    getCachedRates() {
        try {
            const cached = localStorage.getItem(this.STORAGE_KEY);
            return cached ? JSON.parse(cached) : null;
        } catch (e) {
            return null;
        }
    },

    /**
     * Check if cache is expired
     */
    isCacheExpired(cached) {
        if (!cached?.timestamp) return true;
        return Date.now() - cached.timestamp > this.CACHE_DURATION;
    },

    /**
     * Cache rates
     */
    cacheRates(rates) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
                rates,
                timestamp: Date.now()
            }));
        } catch (e) {
            console.error('Error caching rates:', e);
        }
    },

    /**
     * Resolve the ILS-per-unit rate for a currency, never silently 1:1 for
     * cross-currency pairs.  Priority: live/cached rates → fallbackRates →
     * undefined (caller must guard).  Same-currency short-circuit handles ILS→ILS.
     */
    _resolveRate(rates, currency) {
        if (!currency || currency === 'ILS') return 1;
        // Live/cached rates take precedence
        if (rates[currency] != null) return rates[currency];
        // Hardcoded last-known fallback (verified 2026-06-21, see fallbackRates above)
        if (this.fallbackRates[currency] != null) {
            console.warn(`[CurrencyRates] live rate missing for ${currency} — using hardcoded fallback ${this.fallbackRates[currency]}`);
            return this.fallbackRates[currency];
        }
        // Unknown currency: return null so callers can decide (never silently 1:1)
        console.error(`[CurrencyRates] no rate at all for unknown currency ${currency} — conversion skipped`);
        return null;
    },

    /**
     * Convert amount between currencies
     */
    async convert(amount, fromCurrency, toCurrency) {
        if (fromCurrency === toCurrency) return amount;

        const rates = await this.getRates();

        const fromRate = this._resolveRate(rates, fromCurrency);
        const toRate   = this._resolveRate(rates, toCurrency);

        // If either rate is unknown, return the raw amount with a warning rather
        // than silently distorting the figure with a 1:1 rate.
        if (fromRate == null || toRate == null) {
            console.error(`[CurrencyRates] convert(${fromCurrency}→${toCurrency}) incomplete — returning raw amount`);
            return amount;
        }

        // Convert to ILS first, then to target currency
        const inILS = amount * fromRate;
        return inILS / toRate;
    },

    /**
     * Get rate for a specific currency (in ILS)
     */
    async getRate(currency) {
        if (!currency || currency === 'ILS') return 1;
        const rates = await this.getRates();
        const rate = this._resolveRate(rates, currency);
        if (rate != null) return rate;
        // Truly unknown currency: approximate via USD rather than 1:1 ILS,
        // which would be wildly wrong for any real currency.
        const usdFallback = rates.USD ?? this.fallbackRates.USD ?? 2.92;
        console.error(`[CurrencyRates] getRate(${currency}) — no data, approximating via USD ${usdFallback}`);
        return usdFallback;
    },

    /**
     * Format currency with symbol — locale-aware via Intl.NumberFormat.
     * Keyed off the active UI language so the number grouping/decimal style
     * matches the user's locale (e.g. BRL renders 'R$ 1.234,56', ILS '₪ 1,234.56',
     * USD '$1,234.56', EUR '1.234,56 €'). Falls back to a symbol prefix if the
     * runtime can't format the requested currency.
     */
    formatCurrency(amount, currency = 'ILS') {
        const lang = (typeof I18n !== 'undefined' && I18n?.currentLanguage)
            || (typeof localStorage !== 'undefined' && localStorage.getItem('wl_lang'))
            || 'he';
        const localeByLang = {
            he: 'he-IL',
            en: 'en-US',
            pt: 'pt-BR',
            es: 'es-ES'
        };
        const locale = localeByLang[lang] || 'he-IL';
        try {
            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(amount);
        } catch (e) {
            const symbols = { ILS: '₪', USD: '$', EUR: '€', GBP: '£', BRL: 'R$' };
            const symbol = symbols[currency] || currency;
            return `${symbol}${amount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;
        }
    },

    /**
     * Display current rates in UI
     */
    async displayRates(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const rates = await this.getRates();
        const lang = I18n?.currentLanguage || 'he';

        container.innerHTML = `
            <div class="currency-rates">
                <div class="rate-item">
                    <span class="currency-flag">🇺🇸</span>
                    <span class="currency-code">USD</span>
                    <span class="currency-rate">₪${rates.USD.toFixed(2)}</span>
                </div>
                <div class="rate-item">
                    <span class="currency-flag">🇪🇺</span>
                    <span class="currency-code">EUR</span>
                    <span class="currency-rate">₪${rates.EUR.toFixed(2)}</span>
                </div>
                <div class="rate-item">
                    <span class="currency-flag">🇬🇧</span>
                    <span class="currency-code">GBP</span>
                    <span class="currency-rate">₪${rates.GBP.toFixed(2)}</span>
                </div>
            </div>
            <div class="rates-updated">
                ${lang === 'he' ? 'עדכון אחרון:' : lang === 'pt' ? 'Última atualização:' : lang === 'es' ? 'Última actualización:' : 'Last update:'} ${new Date().toLocaleTimeString(lang === 'he' ? 'he-IL' : 'en-US')}
            </div>
        `;
    },

    /**
     * Initialize - fetch rates on load
     */
    async init() {
        await this.getRates();
    }
};

// Make available globally
window.CurrencyRates = CurrencyRates;

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    CurrencyRates.init();
});
