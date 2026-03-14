/**
 * Stock API Module - Fetches stock data from Yahoo Finance + TASE
 */
const StockAPI = {
    YAHOO_URLS: [
        'https://query1.finance.yahoo.com/v8/finance/chart',
        'https://query2.finance.yahoo.com/v8/finance/chart',
    ],
    YAHOO_URL: 'https://query1.finance.yahoo.com/v8/finance/chart',
    TASE_API_URL: 'https://api.tase.co.il/api',
    PROXY_URLS: [
        'https://api.allorigins.win/raw?url=',
        'https://corsproxy.io/?url=',
        'https://api.codetabs.com/v1/proxy/?quest='
    ],
    _currentProxyIndex: 0,
    _taseIdCache: {},

    /**
     * Format symbol for Yahoo Finance API
     * @param {string} symbol - Stock symbol
     * @param {string} market - Market code ('US' or 'IL')
     * @returns {string} Formatted symbol
     */
    formatSymbol(symbol, market = 'US') {
        const upperSymbol = symbol.toUpperCase().trim();
        // Israeli stocks need .TA suffix
        if (market === 'IL' && !upperSymbol.endsWith('.TA')) {
            return `${upperSymbol}.TA`;
        }
        // Remove .TA for US stocks if accidentally added
        if (market === 'US' && upperSymbol.endsWith('.TA')) {
            return upperSymbol.replace('.TA', '');
        }
        return upperSymbol;
    },

    /**
     * Detect market from symbol
     * @param {string} symbol - Stock symbol
     * @returns {string} Market code ('US' or 'IL')
     */
    detectMarket(symbol) {
        return symbol.toUpperCase().endsWith('.TA') ? 'IL' : 'US';
    },

    /**
     * Fetch URL through CORS proxy with fallback
     */
    async _fetchWithFallback(targetUrl) {
        const startIndex = this._currentProxyIndex;
        for (let i = 0; i < this.PROXY_URLS.length; i++) {
            const proxyIndex = (startIndex + i) % this.PROXY_URLS.length;
            const proxy = this.PROXY_URLS[proxyIndex];
            const url = `${proxy}${encodeURIComponent(targetUrl)}`;
            try {
                const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data = await response.json();
                this._currentProxyIndex = proxyIndex;
                return data;
            } catch (e) {
                console.warn(`Proxy ${proxyIndex} failed:`, proxy, e.message);
            }
        }
        throw new Error('All proxies failed');
    },

    /**
     * Resolve TASE security ID for a symbol (cached)
     * @param {string} symbol - Symbol with or without .TA
     * @returns {Promise<number>} TASE security ID
     */
    async _resolveTaseId(symbol) {
        const cleanSymbol = symbol.replace(/\.TA$/i, '').toUpperCase();

        if (this._taseIdCache[cleanSymbol] !== undefined) {
            return this._taseIdCache[cleanSymbol];
        }

        // Numeric symbol is already a TASE security ID — use directly
        if (/^\d+$/.test(cleanSymbol)) {
            const id = parseInt(cleanSymbol, 10);
            this._taseIdCache[cleanSymbol] = id;
            return id;
        }

        const url = `${this.TASE_API_URL}/security/search?str=${encodeURIComponent(cleanSymbol)}&lang=1`;
        const data = await this._fetchWithFallback(url);

        // TASE API may return an array or an object with a results list
        const results = Array.isArray(data) ? data : (data.results || data.securities || data.items || []);
        if (!results.length) throw new Error(`No TASE results for ${cleanSymbol}`);

        const securityId = results[0].securityId || results[0].SecurityId || results[0].id;
        if (securityId === undefined || securityId === null) {
            throw new Error(`No securityId in TASE response for ${cleanSymbol}`);
        }

        this._taseIdCache[cleanSymbol] = securityId;
        return securityId;
    },

    /**
     * Try to fetch from Maya API directly (no proxy).
     * First attempts a plain GET (no custom headers = no CORS preflight).
     * If the server returns CORS Allow-Origin, this works without any proxy.
     */
    async _fetchMayaDirectly(id) {
        const endpoints = [
            `https://mayaapi.tase.co.il/api/fund/details?fundId=${id}`,
            `https://mayaapi.tase.co.il/api/company/tradedata?companyId=${id}`
        ];
        for (const url of endpoints) {
            // Attempt 1: plain GET — no custom headers, no CORS preflight
            try {
                const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
                if (r.ok) {
                    const data = await r.json();
                    console.error(`[TASE Maya] plain GET success from ${url}:`, JSON.stringify(data).slice(0, 600));
                    const parsed = this._parseMayaPrice(data);
                    if (parsed) return parsed;
                    console.error(`[TASE Maya] parse failed, full response:`, data);
                } else {
                    console.error(`[TASE Maya] plain GET ${url} → HTTP ${r.status}`);
                }
            } catch (e) {
                console.error(`[TASE Maya] plain GET failed for ${url}:`, e.message);
            }

            // Attempt 2: with X-Maya-With header (triggers CORS preflight — may be blocked)
            try {
                const r = await fetch(url, {
                    headers: { 'X-Maya-With': 'allow' },
                    signal: AbortSignal.timeout(8000)
                });
                if (r.ok) {
                    const data = await r.json();
                    console.error(`[TASE Maya] header GET success from ${url}:`, JSON.stringify(data).slice(0, 600));
                    const parsed = this._parseMayaPrice(data);
                    if (parsed) return parsed;
                } else {
                    console.error(`[TASE Maya] header GET ${url} → HTTP ${r.status}`);
                }
            } catch (e) {
                console.error(`[TASE Maya] header GET failed for ${url}:`, e.message);
            }
        }
        return null;
    },

    /**
     * Parse a Maya API response into a price object.
     * Handles nested TradeData/FundDetails structures and flat responses.
     */
    _parseMayaPrice(data) {
        // Flatten nested wrappers
        const d = data.tradeData || data.TradeData || data.fundDetails || data.FundDetails || data;

        const rawPrice = d.lastPrice ?? d.LastPrice ?? d.tradePrice ?? d.TradePrice
                      ?? d.navPerUnit ?? d.NavPerUnit ?? d.unitPrice ?? d.UnitPrice
                      ?? d.currentNAV ?? d.CurrentNAV ?? d.nav ?? d.NAV;
        if (rawPrice == null) return null;

        const currentPrice = rawPrice > 100000 ? rawPrice : rawPrice / 100;

        const rawPrev = d.basePrice ?? d.BasePrice ?? d.previousClose ?? d.PreviousClose
                     ?? d.previousNavPerUnit ?? d.PreviousNavPerUnit ?? d.prevNavPerUnit;
        const previousClose = rawPrev != null ? (rawPrev > 100000 ? rawPrev : rawPrev / 100) : null;

        const priceChange = previousClose !== null ? currentPrice - previousClose : 0;
        const priceChangePercent = previousClose ? (priceChange / previousClose) * 100 : 0;
        return { currentPrice, previousClose, priceChange, priceChangePercent, currency: 'ILS' };
    },

    /**
     * Fetch live price for an Israeli security.
     * Strategy: GitHub Actions cache → Maya API direct → api.tase.co.il via proxy
     * @param {string} symbol - Israeli stock symbol (e.g. 'LEUMI.TA' or '5106810.TA')
     * @returns {Promise<Object>} Live price data in ILS
     */
    async fetchTaseLivePrice(symbol) {
        const id = await this._resolveTaseId(symbol);

        // 1. Read from GitHub Actions daily cache (tase-prices.json)
        //    Updated server-side so no CORS issues. Best for mutual funds (numeric IDs).
        try {
            const res = await fetch(`./data/tase-prices.json?v=${Math.floor(Date.now() / 300000)}`);
            if (res.ok) {
                const cache = await res.json();
                const cached = cache[String(id)];
                if (cached && cached.currentPrice) {
                    console.log(`[TASE cache] ${symbol}: ₪${cached.currentPrice} (updated ${cached.lastUpdate})`);
                    return { ...cached, fromCache: true };
                }
            }
        } catch {}

        // 2. Try Maya API directly (no proxy) — works only if server allows plain CORS
        const mayaResult = await this._fetchMayaDirectly(id);
        if (mayaResult) return mayaResult;

        // 3. Fall back to api.tase.co.il via CORS proxy
        const url = `${this.TASE_API_URL}/security/data?securityId=${id}`;
        const data = await this._fetchWithFallback(url);
        console.log(`[TASE proxy] Raw response for ${symbol}:`, JSON.stringify(data).slice(0, 300));

        const parsed = this._parseMayaPrice(data);
        if (!parsed) throw new Error('No price in TASE response');
        return parsed;
    },

    /**
     * Fetch historical prices from Yahoo (for MA150 calculation)
     * @param {string} symbol - Stock symbol
     * @returns {Promise<Object>} Historical data + MA150
     */
    async _fetchYahooHistorical(symbol) {
        const detectedMarket = this.detectMarket(symbol);
        const formattedSymbol = this.formatSymbol(symbol, detectedMarket);
        const suffix = `/${encodeURIComponent(formattedSymbol)}?interval=1d&range=1y&includePrePost=false`;
        const data = await Promise.any(
            this.YAHOO_URLS.map(base => this._fetchWithFallback(base + suffix)
                .then(d => { if (!d?.chart?.result?.length) throw new Error('empty'); return d; })
            )
        ).catch(() => { throw new Error('No historical data found'); });

        const result = data.chart.result[0];
        const quotes = result.indicators.quote[0];
        const timestamps = result.timestamp || [];

        const historicalData = [];
        for (let i = 0; i < timestamps.length; i++) {
            if (quotes.close[i] !== null) {
                historicalData.push({ date: new Date(timestamps[i] * 1000), close: quotes.close[i] });
            }
        }

        const closePrices = historicalData.map(d => d.close);
        return {
            historicalPrices: closePrices,
            historicalData,
            ma150: this.calculateMA150(closePrices),
            ma150Series: this.calculateMA150Series(historicalData)
        };
    },

    /**
     * Fetch stock data including historical prices for MA150 calculation.
     * Uses TASE as primary source for Israeli stocks, falls back to Yahoo.
     * @param {string} symbol - Stock symbol
     * @param {string} market - Market code ('US' or 'IL')
     * @returns {Promise<Object>} Stock data with price and MA150
     */
    async fetchStockData(symbol, market = null) {
        const detectedMarket = market || this.detectMarket(symbol);
        const formattedSymbol = this.formatSymbol(symbol, detectedMarket);

        // Check GitHub Actions daily price cache (works for any symbol stored there)
        if (detectedMarket !== 'IL') {
            try {
                const res = await fetch(`./data/tase-prices.json?v=${Math.floor(Date.now() / 300000)}`);
                if (res.ok) {
                    const cache = await res.json();
                    const entry = cache[formattedSymbol] || cache[symbol.toUpperCase()];
                    if (entry?.currentPrice) {
                        console.log(`[cache] ${formattedSymbol}: ${entry.currentPrice} (${entry.lastUpdate})`);
                        return {
                            symbol: formattedSymbol, originalSymbol: symbol, market: detectedMarket,
                            ...entry,
                            historicalPrices: [], historicalData: [], ma150: null, ma150Series: [],
                            ma150Position: null, ma150PositionPercent: null,
                            source: 'cache', success: true
                        };
                    }
                }
            } catch {}
        }

        // Try TASE API first for Israeli stocks
        if (detectedMarket === 'IL') {
            try {
                const live = await this.fetchTaseLivePrice(symbol);

                // Historical is best-effort — numeric IDs won't resolve on Yahoo
                let historical = { historicalPrices: [], historicalData: [], ma150: null, ma150Series: [] };
                try {
                    historical = await this._fetchYahooHistorical(symbol);
                } catch (he) {
                    console.warn('Yahoo historical unavailable (MA150 skipped):', he.message);
                }

                const ma150Position = historical.ma150 !== null
                    ? (live.currentPrice > historical.ma150 ? 'above' : 'below')
                    : null;
                const ma150PositionPercent = historical.ma150 !== null
                    ? ((live.currentPrice - historical.ma150) / historical.ma150) * 100
                    : null;

                return {
                    symbol: formattedSymbol,
                    originalSymbol: symbol,
                    market: detectedMarket,
                    ...live,
                    ...historical,
                    ma150Position,
                    ma150PositionPercent,
                    source: 'TASE',
                    lastUpdate: new Date().toISOString(),
                    success: true
                };
            } catch (e) {
                console.warn('TASE API failed, falling back to Yahoo:', e.message);
            }
        }

        // Yahoo Finance (primary for US, fallback for IL) — race query1 vs query2 for speed
        try {
            const suffix = `/${encodeURIComponent(formattedSymbol)}?interval=1d&range=1y&includePrePost=false`;
            const data = await Promise.any(
                this.YAHOO_URLS.map(base => this._fetchWithFallback(base + suffix)
                    .then(d => { if (!d?.chart?.result?.length) throw new Error('empty'); return d; })
                )
            ).catch(() => { throw new Error('All Yahoo endpoints failed'); });

            if (!data?.chart?.result?.length) {
                throw new Error('No data found for symbol');
            }

            const result = data.chart.result[0];
            const meta = result.meta;
            const quotes = result.indicators.quote[0];
            const timestamps = result.timestamp || [];

            // Build historical data with timestamps
            const historicalData = [];
            for (let i = 0; i < timestamps.length; i++) {
                if (quotes.close[i] !== null) {
                    historicalData.push({
                        date: new Date(timestamps[i] * 1000),
                        close: quotes.close[i]
                    });
                }
            }

            const closePrices = historicalData.map(d => d.close);

            const currentPrice = meta.regularMarketPrice;
            // previousClose from meta is unreliable (often missing or shows chart start price)
            // Use second-to-last close from historical data instead
            const previousClose = closePrices.length >= 2 ? closePrices[closePrices.length - 2] : meta.previousClose || meta.chartPreviousClose;
            const currency = meta.currency || 'USD';
            const ma150 = this.calculateMA150(closePrices);

            // Calculate MA150 series for charting
            const ma150Series = this.calculateMA150Series(historicalData);

            // Calculate price change
            const priceChange = currentPrice - previousClose;
            const priceChangePercent = previousClose ? ((priceChange / previousClose) * 100) : 0;

            // Calculate position relative to MA150
            let ma150Position = null;
            let ma150PositionPercent = null;
            if (ma150 !== null) {
                ma150Position = currentPrice > ma150 ? 'above' : 'below';
                ma150PositionPercent = ((currentPrice - ma150) / ma150) * 100;
            }

            return {
                symbol: formattedSymbol,
                originalSymbol: symbol,
                market: detectedMarket,
                currentPrice,
                previousClose,
                priceChange,
                priceChangePercent,
                currency,
                ma150,
                ma150Position,
                ma150PositionPercent,
                historicalPrices: closePrices,
                historicalData,
                ma150Series,
                lastUpdate: new Date().toISOString(),
                success: true
            };
        } catch (error) {
            console.error(`Error fetching data for ${symbol}:`, error);
            return {
                symbol: formattedSymbol,
                originalSymbol: symbol,
                market: detectedMarket,
                error: error.message,
                success: false,
                lastUpdate: new Date().toISOString()
            };
        }
    },

    /**
     * Calculate 150-day Moving Average
     * @param {number[]} closePrices - Array of closing prices
     * @returns {number|null} MA150 value or null if insufficient data
     */
    calculateMA150(closePrices) {
        if (!closePrices || closePrices.length < 150) {
            return null;
        }
        const last150 = closePrices.slice(-150);
        const sum = last150.reduce((acc, price) => acc + price, 0);
        return sum / 150;
    },

    /**
     * Calculate MA150 series over time for charting
     * @param {Array<{date: Date, close: number}>} historicalData - Array of historical data points
     * @returns {Array<{date: Date, value: number}>} MA150 values over time
     */
    calculateMA150Series(historicalData) {
        if (!historicalData || historicalData.length < 150) {
            return [];
        }

        const ma150Series = [];
        for (let i = 149; i < historicalData.length; i++) {
            let sum = 0;
            for (let j = i - 149; j <= i; j++) {
                sum += historicalData[j].close;
            }
            ma150Series.push({
                date: historicalData[i].date,
                value: sum / 150
            });
        }
        return ma150Series;
    },

    /**
     * Check if markets are currently open using browser Intl timezone API
     * @param {string[]} markets - Markets to check (['IL', 'US'])
     * @returns {{ taseOpen: boolean, nyseOpen: boolean, anyOpen: boolean }}
     */
    isMarketOpen(markets = ['IL', 'US']) {
        const now = new Date();
        let taseOpen = false;
        let nyseOpen = false;

        // TASE: Sun–Thu 09:30–17:35 Asia/Jerusalem
        if (markets.includes('IL')) {
            const il = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' }));
            const ilMin = il.getHours() * 60 + il.getMinutes();
            taseOpen = il.getDay() <= 4 &&
                       ilMin >= 9 * 60 + 30 && ilMin < 17 * 60 + 35;
        }

        // NYSE: Mon–Fri 09:30–16:00 America/New_York
        if (markets.includes('US')) {
            const et = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
            const etMin = et.getHours() * 60 + et.getMinutes();
            nyseOpen = et.getDay() >= 1 && et.getDay() <= 5 &&
                       etMin >= 9 * 60 + 30 && etMin < 16 * 60;
        }

        return { taseOpen, nyseOpen, anyOpen: taseOpen || nyseOpen };
    },

    /**
     * Get list of markets from a holdings array
     * @param {Array} holdings - Array of holding objects with symbol property
     * @returns {string[]} Array of market codes present in holdings
     */
    getMarketsFromHoldings(holdings) {
        if (!holdings || !Array.isArray(holdings) || holdings.length === 0) {
            return ['IL', 'US'];
        }
        const markets = new Set();
        holdings.forEach(h => {
            const symbol = (h.symbol || '').toString();
            markets.add(this.detectMarket(symbol));
        });
        return [...markets];
    },

    /**
     * Fetch data for multiple symbols
     * @param {Array<{symbol: string, market?: string}>} symbols - Array of symbol objects
     * @returns {Promise<Object>} Map of symbol to stock data
     */
    async fetchMultiple(symbols) {
        const results = {};

        // Process in batches to avoid rate limiting
        const batchSize = 5;
        const batches = [];

        for (let i = 0; i < symbols.length; i += batchSize) {
            batches.push(symbols.slice(i, i + batchSize));
        }

        for (const batch of batches) {
            const promises = batch.map(item => {
                const symbol = typeof item === 'string' ? item : item.symbol;
                const market = typeof item === 'string' ? null : item.market;
                return this.fetchStockData(symbol, market);
            });

            const batchResults = await Promise.all(promises);

            batchResults.forEach(result => {
                results[result.symbol] = result;
            });

            // Small delay between batches to be respectful of rate limits
            if (batches.indexOf(batch) < batches.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        }

        return results;
    },

    /**
     * Benchmark indices available for comparison
     */
    BENCHMARKS: [
        { symbol: '^GSPC', name: 'S&P 500', market: 'US' },
        { symbol: '^IXIC', name: 'NASDAQ', market: 'US' },
        { symbol: '^TA125.TA', name: 'TA-125', market: 'IL' },
        { symbol: '^TA35.TA', name: 'TA-35', market: 'IL' },
        { symbol: 'URTH', name: 'MSCI World', market: 'US' }
    ],

    /**
     * Fetch benchmark/index historical data
     * @param {string} symbol - Index symbol (e.g. '^GSPC')
     * @param {string} range - Time range ('1mo','3mo','6mo','1y','5y')
     * @returns {Promise<Object>} Historical data with timestamps and prices
     */
    async fetchBenchmarkData(symbol, range = '1y') {
        try {
            let data = null;
            for (const base of this.YAHOO_URLS) {
                const yahooUrl = `${base}/${encodeURIComponent(symbol)}?interval=1d&range=${range}&includePrePost=false`;
                try {
                    data = await this._fetchWithFallback(yahooUrl);
                    if (data?.chart?.result?.length > 0) break;
                } catch (e) {}
            }
            if (!data?.chart?.result?.length) {
                throw new Error('No data found for benchmark');
            }

            const result = data.chart.result[0];
            const meta = result.meta;
            const quotes = result.indicators.quote[0];
            const timestamps = result.timestamp || [];

            const historicalData = [];
            for (let i = 0; i < timestamps.length; i++) {
                if (quotes.close[i] !== null) {
                    historicalData.push({
                        date: new Date(timestamps[i] * 1000),
                        close: quotes.close[i]
                    });
                }
            }

            return {
                symbol,
                name: meta.shortName || meta.symbol || symbol,
                currency: meta.currency || 'USD',
                historicalData,
                success: true
            };
        } catch (error) {
            console.error(`Error fetching benchmark data for ${symbol}:`, error);
            return { symbol, error: error.message, success: false };
        }
    },

    /**
     * Search for stock by name/symbol (basic implementation)
     * @param {string} query - Search query
     * @returns {Promise<Array>} Array of matching stocks
     */
    async searchStock(query) {
        try {
            // Yahoo Finance search endpoint via CORS proxy
            const yahooUrl = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=6&newsCount=0`;
            const data = await this._fetchWithFallback(yahooUrl);

            if (!data.quotes) {
                return [];
            }

            return data.quotes
                .filter(q => q.quoteType === 'EQUITY')
                .map(q => ({
                    symbol: q.symbol,
                    name: q.shortname || q.longname || q.symbol,
                    exchange: q.exchange,
                    market: q.symbol.endsWith('.TA') ? 'IL' : 'US'
                }));
        } catch (error) {
            console.error('Error searching stocks:', error);
            return [];
        }
    }
};

// Make available globally
window.StockAPI = StockAPI;
