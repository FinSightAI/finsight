/**
 * Currency Exchange Rates Module
 * Fetches real-time exchange rates from free API
 */
const CurrencyRates = {
    STORAGE_KEY: 'finance_currency_rates',
    CACHE_DURATION: 4 * 60 * 60 * 1000, // 4 hours cache

    // Free API for exchange rates (no API key required)
    API_URL: 'https://api.exchangerate-api.com/v4/latest/ILS',

    // Fallback rates if API fails
    fallbackRates: {
        USD: 3.65,
        EUR: 3.95,
        GBP: 4.60,
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
        const response = await fetch(this.API_URL);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // API returns rates relative to ILS, we need to invert
        // e.g., if 1 ILS = 0.27 USD, then 1 USD = 3.70 ILS
        const rates = {
            ILS: 1,
            USD: 1 / data.rates.USD,
            EUR: 1 / data.rates.EUR,
            GBP: 1 / data.rates.GBP
        };

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
     * Convert amount between currencies
     */
    async convert(amount, fromCurrency, toCurrency) {
        if (fromCurrency === toCurrency) return amount;

        const rates = await this.getRates();

        // Convert to ILS first, then to target currency
        const inILS = amount * (rates[fromCurrency] || 1);
        const result = inILS / (rates[toCurrency] || 1);

        return result;
    },

    /**
     * Get rate for a specific currency (in ILS)
     */
    async getRate(currency) {
        const rates = await this.getRates();
        return rates[currency] || 1;
    },

    /**
     * Format currency with symbol
     */
    formatCurrency(amount, currency = 'ILS') {
        const symbols = {
            ILS: '₪',
            USD: '$',
            EUR: '€',
            GBP: '£'
        };

        const symbol = symbols[currency] || currency;
        return `${symbol}${amount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
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
