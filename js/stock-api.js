/**
 * Stock API Module - Fetches stock data from Yahoo Finance + TASE
 */
const StockAPI = {
    CF_WORKER_URL: 'https://lucky-hill-f215.ofirshamir57.workers.dev/v8/finance/chart',

    YAHOO_URLS: [
        'https://query1.finance.yahoo.com/v8/finance/chart',
        'https://query2.finance.yahoo.com/v8/finance/chart',
    ],
    YAHOO_URL: 'https://query1.finance.yahoo.com/v8/finance/chart',
    TASE_API_URL: 'https://api.tase.co.il/api',
    PROXY_URLS: [
        'https://api.codetabs.com/v1/proxy/?quest=',  // ← currently the only reliable one
        'https://corsproxy.io/?url=',
        'https://api.allorigins.win/raw?url='
    ],
    _currentProxyIndex: 0,
    _taseIdCache: {},
    _taseJsonPromise: null,
    _taseJsonExpiry: 0,

    // Short-term price cache — avoids hitting the network on every page load
    // Keyed by formatted symbol, stored in localStorage
    PRICE_CACHE_TTL_MS: 10 * 60 * 1000, // 10 minutes
    _getLsPrice(symbol) {
        try {
            const raw = localStorage.getItem(`sp_${symbol}`);
            if (!raw) return null;
            const { ts, data } = JSON.parse(raw);
            if (Date.now() - ts > this.PRICE_CACHE_TTL_MS) { localStorage.removeItem(`sp_${symbol}`); return null; }
            return data;
        } catch { return null; }
    },
    _setLsPrice(symbol, data) {
        try { localStorage.setItem(`sp_${symbol}`, JSON.stringify({ ts: Date.now(), data })); } catch {}
    },
    clearPriceCache() {
        Object.keys(localStorage).filter(k => k.startsWith('sp_')).forEach(k => localStorage.removeItem(k));
    },

    // Historical data cache — keyed by symbol, stores {data, timestamp}
    // Avoids re-fetching 1yr of OHLCV on every price refresh (expensive via CORS proxies)
    HISTORICAL_TTL_MS: 24 * 60 * 60 * 1000, // 24 hours
    _getHistoricalCache(symbol) {
        try {
            const raw = localStorage.getItem(`stock_hist_${symbol}`);
            if (!raw) return null;
            const { ts, data } = JSON.parse(raw);
            if (Date.now() - ts > this.HISTORICAL_TTL_MS) { localStorage.removeItem(`stock_hist_${symbol}`); return null; }
            return data;
        } catch { return null; }
    },
    _setHistoricalCache(symbol, data) {
        try { localStorage.setItem(`stock_hist_${symbol}`, JSON.stringify({ ts: Date.now(), data })); } catch {}
    },

    async _fetchTaseJson() {
        const now = Date.now();
        if (this._taseJsonPromise && now < this._taseJsonExpiry) return this._taseJsonPromise;
        const dataBase = location.pathname.includes('/pages/') ? '../' : './';
        this._taseJsonExpiry = now + 5 * 60 * 1000;
        this._taseJsonPromise = fetch(`${dataBase}data/tase-prices.json?v=${Math.floor(now / 300000)}`)
            .then(res => res.ok ? res.json() : null)
            .catch(() => null);
        return this._taseJsonPromise;
    },

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
        // Run all proxies in parallel — resolves on first success, fails only when all fail
        return Promise.any(
            this.PROXY_URLS.map((proxy, i) => {
                const url = `${proxy}${encodeURIComponent(targetUrl)}`;
                return fetch(url, { signal: AbortSignal.timeout(4000) })
                    .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
                    .then(data => { this._currentProxyIndex = i; return data; })
                    .catch(e => { console.warn(`Proxy ${i} failed:`, proxy, e.message); throw e; });
            })
        ).catch(() => { throw new Error('All proxies failed'); });
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
     * Fetch Maya API via Cloudflare Worker (bypasses CORS + browser restrictions).
     * Worker route: /maya/* → https://mayaapi.tase.co.il/api/*
     */
    async _fetchMayaViaWorker(id) {
        if (!this.CF_WORKER_URL) return null;
        const workerBase = this.CF_WORKER_URL.replace(/\/v8\/finance\/chart$/, '');
        const endpoints = [
            `${workerBase}/maya/fund/funddata?fundId=${id}&lang=1`,
            `${workerBase}/maya/security/securitydata?securityId=${id}&lang=1`,
        ];
        for (const url of endpoints) {
            try {
                const r = await fetch(url, { signal: AbortSignal.timeout(5000) });
                if (!r.ok) continue;
                const data = await r.json();
                const parsed = this._parseMayaPrice(data);
                if (parsed) {

                    return parsed;
                }
            } catch (e) {
                console.warn(`[TASE Worker] ${url} failed:`, e.message);
            }
        }
        return null;
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
                const r = await fetch(url, { signal: AbortSignal.timeout(2000) });
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
                    signal: AbortSignal.timeout(2000)
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
            const cache = await this._fetchTaseJson();
            if (cache) {
                const cached = cache[String(id)];
                if (cached && cached.currentPrice) {
                    console.log(`[TASE cache] ${symbol}: ₪${cached.currentPrice} (updated ${cached.lastUpdate})`);
                    return { ...cached, fromCache: true };
                }
            }
        } catch {}

        // 2. Try Maya via Cloudflare Worker (no CORS issues, works for all users)
        const workerResult = await this._fetchMayaViaWorker(id);
        if (workerResult) return workerResult;

        // 3. Try Maya API directly (no proxy) — works only if server allows plain CORS
        const mayaResult = await this._fetchMayaDirectly(id);
        if (mayaResult) return mayaResult;

        // No more fallbacks — TASE APIs are geo-blocked outside Israel and proxies are broken.
        // User must update manually via the update-price modal.
        throw new Error(`TASE ${id}: not in cache, update manually`);
    },

    /**
     * Fetch historical prices from Yahoo (for MA150 calculation).
     * Caches result in localStorage for 24h — only re-fetches when stale.
     * @param {string} symbol - Stock symbol
     * @returns {Promise<Object>} Historical data + MA150
     */
    async _fetchYahooHistorical(symbol) {
        const detectedMarket = this.detectMarket(symbol);
        const formattedSymbol = this.formatSymbol(symbol, detectedMarket);
        const cacheKey = formattedSymbol;

        // Return cached data if fresh
        const cached = this._getHistoricalCache(cacheKey);
        if (cached) return cached;

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
        const out = {
            historicalPrices: closePrices,
            historicalData,
            ma150: this.calculateMA150(closePrices),
            ma150Series: this.calculateMA150Series(historicalData)
        };
        this._setHistoricalCache(cacheKey, out);
        return out;
    },

    /**
     * Fetch just the current price via Yahoo Finance (range=5d — much faster than range=1y).
     * @param {string} formattedSymbol - Already-formatted Yahoo symbol
     * @returns {Promise<Object>} Price fields only
     */
    async _fetchYahooPriceOnly(formattedSymbol) {
        const suffix = `/${encodeURIComponent(formattedSymbol)}?interval=1d&range=5d&includePrePost=false`;
        const tryDirect = url => fetch(url, { signal: AbortSignal.timeout(4000) })
            .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
            .then(d => { if (!d?.chart?.result?.length) throw new Error('empty'); return d; });
        const tryProxy = base => this._fetchWithFallback(base + suffix)
            .then(d => { if (!d?.chart?.result?.length) throw new Error('empty'); return d; });

        // Race direct Yahoo AND proxies simultaneously — whichever wins first
        const data = await Promise.any([
            ...(this.CF_WORKER_URL ? [tryDirect(this.CF_WORKER_URL + suffix)] : []),
            ...this.YAHOO_URLS.map(base => tryDirect(base + suffix)),
            ...this.YAHOO_URLS.map(base => tryProxy(base)),
        ]).catch(() => { throw new Error('All Yahoo endpoints failed'); });

        const result = data.chart.result[0];
        const meta = result.meta;
        const quotes = result.indicators.quote[0];
        const timestamps = result.timestamp || [];

        const rawCurrency = meta.currency || 'USD';
        const isGBX = rawCurrency === 'GBp' || rawCurrency === 'GBX';
        const priceScale = isGBX ? 0.01 : 1;
        const currency = isGBX ? 'GBP' : rawCurrency;
        const currentPrice = meta.regularMarketPrice * priceScale;

        // previousClose: use second-to-last close
        const closes = timestamps.map((_, i) => quotes.close[i]).filter(c => c != null);
        const previousClose = closes.length >= 2
            ? closes[closes.length - 2] * priceScale
            : (meta.previousClose || meta.chartPreviousClose || 0) * priceScale;

        const priceChange = currentPrice - previousClose;
        const priceChangePercent = previousClose ? (priceChange / previousClose) * 100 : 0;

        return { currentPrice, previousClose, priceChange, priceChangePercent, currency };
    },

    /**
     * Fetch stock data including historical prices for MA150 calculation.
     * Uses TASE as primary source for Israeli stocks, falls back to Yahoo.
     * @param {string} symbol - Stock symbol
     * @param {string} market - Market code ('US' or 'IL')
     * @returns {Promise<Object>} Stock data with price and MA150
     */
    async fetchStockData(symbol, market = null, forceRefresh = false) {
        const detectedMarket = market || this.detectMarket(symbol);
        const formattedSymbol = this.formatSymbol(symbol, detectedMarket);

        // Return cached price immediately (skip network entirely)
        if (!forceRefresh) {
            const cached = this._getLsPrice(formattedSymbol);
            if (cached) return { ...cached, fromPriceCache: true };
        }

        // Check GitHub Actions daily price cache (works for any symbol stored there)
        if (detectedMarket !== 'IL') {
            try {
                const cache = await this._fetchTaseJson();
                if (cache) {
                    const entry = cache[formattedSymbol] || cache[symbol.toUpperCase()];
                    if (entry?.currentPrice) {
                        const ageHours = entry.lastUpdate
                            ? (Date.now() - new Date(entry.lastUpdate).getTime()) / 3600000
                            : 999;
                        if (ageHours < 8) {
                            console.log(`[cache] ${formattedSymbol}: ${entry.currentPrice} (${entry.lastUpdate})`);
                            return {
                                symbol: formattedSymbol, originalSymbol: symbol, market: detectedMarket,
                                ...entry,
                                historicalPrices: [], historicalData: [], ma150: null, ma150Series: [],
                                ma150Position: null, ma150PositionPercent: null,
                                source: 'cache', success: true
                            };
                        }
                        console.log(`[cache] ${formattedSymbol}: cache stale (${ageHours.toFixed(1)}h), fetching live`);
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

                const taseResult = {
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
                this._setLsPrice(formattedSymbol, taseResult);
                return taseResult;
            } catch (e) {
                console.warn('TASE API failed, falling back to Yahoo:', e.message);
            }
        }

        // Yahoo Finance — fast price-only fetch (range=5d), historical cached separately
        try {
            const data = await this._fetchYahooPriceOnly(formattedSymbol).then(priceData => {
                // Wrap in the shape the code below expects
                return { _priceOnly: priceData };
            });

            const { currentPrice, previousClose, priceChange, priceChangePercent, currency } = data._priceOnly;

            // Load MA150 from cache (non-blocking) — stale cache returns null, fresh fetch happens in background
            const cachedHist = this._getHistoricalCache(formattedSymbol);
            const ma150 = cachedHist ? this.calculateMA150(cachedHist.historicalPrices) : null;
            const ma150Position = ma150 !== null ? (currentPrice > ma150 ? 'above' : 'below') : null;
            const ma150PositionPercent = ma150 !== null ? ((currentPrice - ma150) / ma150) * 100 : null;

            // Refresh historical cache in background (doesn't block price display)
            if (!cachedHist) {
                this._fetchYahooHistorical(symbol).catch(() => {});
            }

            const yahooResult = {
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
                historicalPrices: cachedHist?.historicalPrices || [],
                historicalData: cachedHist?.historicalData || [],
                ma150Series: cachedHist?.ma150Series || [],
                lastUpdate: new Date().toISOString(),
                success: true
            };
            this._setLsPrice(formattedSymbol, yahooResult);
            return yahooResult;
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
        let sum = 0;
        for (let i = 0; i < 150; i++) sum += historicalData[i].close;
        ma150Series.push({ date: historicalData[149].date, value: sum / 150 });
        for (let i = 150; i < historicalData.length; i++) {
            sum += historicalData[i].close - historicalData[i - 150].close;
            ma150Series.push({ date: historicalData[i].date, value: sum / 150 });
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
     * Bulk-fetch prices for multiple symbols in ONE Yahoo Finance spark request.
     * Uses /v7/finance/spark — Yahoo's own multi-symbol endpoint, no auth needed.
     * @param {string[]} formattedSymbols - Already-formatted Yahoo symbols
     * @returns {Promise<Object>} Map of symbol → price fields
     */
    async _fetchYahooBulk(formattedSymbols) {
        if (!formattedSymbols.length) return {};
        const joined = formattedSymbols.join(',');
        const base1 = `https://query1.finance.yahoo.com/v7/finance/spark?symbols=${encodeURIComponent(joined)}&range=5d&interval=1d&includePrePost=false`;
        const base2 = `https://query2.finance.yahoo.com/v7/finance/spark?symbols=${encodeURIComponent(joined)}&range=5d&interval=1d&includePrePost=false`;

        const parse = d => { if (!d?.spark?.result?.length) throw new Error('empty'); return d; };
        const tryDirect = url => fetch(url, { signal: AbortSignal.timeout(4000) })
            .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(parse);
        const tryProxy = proxy => fetch(`${proxy}${encodeURIComponent(base1)}`, { signal: AbortSignal.timeout(8000) })
            .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(parse);

        // Cloudflare Worker (your own) — fastest path, no CORS issues
        const workerBase = `https://lucky-hill-f215.ofirshamir57.workers.dev/v7/finance/spark?symbols=${encodeURIComponent(joined)}&range=5d&interval=1d&includePrePost=false`;
        const tryWorker = () => fetch(workerBase, { signal: AbortSignal.timeout(6000) })
            .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(parse);

        const data = await Promise.any([
            tryWorker(),  // ← preferred
            tryDirect(base1), tryDirect(base2),
            ...this.PROXY_URLS.map(tryProxy),
        ]);

        const map = {};
        for (const item of (data.spark?.result || [])) {
            const sym = item.symbol;
            const resp = item.response?.[0];
            if (!resp) continue;
            const meta = resp.meta || {};
            const quotes = resp.indicators?.quote?.[0] || {};
            const timestamps = resp.timestamp || [];
            const rawCurrency = meta.currency || 'USD';
            const isGBX = rawCurrency === 'GBp' || rawCurrency === 'GBX';
            const scale = isGBX ? 0.01 : 1;
            const currency = isGBX ? 'GBP' : rawCurrency;
            const currentPrice = (meta.regularMarketPrice || 0) * scale;
            const closes = timestamps.map((_, i) => quotes.close?.[i]).filter(c => c != null);
            const previousClose = closes.length >= 2
                ? closes[closes.length - 2] * scale
                : (meta.previousClose || meta.chartPreviousClose || currentPrice) * scale;
            const priceChange = currentPrice - previousClose;
            const priceChangePercent = previousClose ? (priceChange / previousClose) * 100 : 0;
            map[sym] = { currentPrice, previousClose, priceChange, priceChangePercent, currency };
        }
        return map;
    },

    /**
     * Fetch data for multiple symbols.
     * Strategy: one bulk spark request for all US symbols; individual fallback only
     * for symbols missing from the bulk response.
     * @param {Array<{symbol: string, market?: string}>} symbols
     * @param {boolean} forceRefresh - Bypass price cache
     * @returns {Promise<Object>} Map of symbol to stock data
     */
    async fetchMultiple(symbols, forceRefresh = false) {
        const results = {};
        const toFetchUS = [];
        const toFetchIL = [];

        for (const item of symbols) {
            const symbol    = typeof item === 'string' ? item : item.symbol;
            const market    = typeof item === 'string' ? this.detectMarket(symbol) : (item.market || this.detectMarket(symbol));
            const formatted = this.formatSymbol(symbol, market);
            if (!forceRefresh) {
                const cached = this._getLsPrice(formatted);
                if (cached) { results[formatted] = { ...cached, fromPriceCache: true }; continue; }
            }
            (market === 'IL' ? toFetchIL : toFetchUS).push({ symbol, market, formatted });
        }

        if (toFetchUS.length > 0) {
            // One bulk request for all US symbols
            let bulkMap = {};
            try { bulkMap = await this._fetchYahooBulk(toFetchUS.map(s => s.formatted)); } catch {}

            const missing = [];
            for (const item of toFetchUS) {
                const p = bulkMap[item.formatted];
                if (p) {
                    const cachedHist = this._getHistoricalCache(item.formatted);
                    const ma150 = cachedHist ? this.calculateMA150(cachedHist.historicalPrices) : null;
                    if (!cachedHist) this._fetchYahooHistorical(item.symbol).catch(() => {});
                    const r = {
                        symbol: item.formatted, originalSymbol: item.symbol, market: item.market,
                        ...p, ma150,
                        ma150Position: ma150 !== null ? (p.currentPrice > ma150 ? 'above' : 'below') : null,
                        ma150PositionPercent: ma150 !== null ? ((p.currentPrice - ma150) / ma150) * 100 : null,
                        historicalPrices: cachedHist?.historicalPrices || [],
                        historicalData:   cachedHist?.historicalData   || [],
                        ma150Series:      cachedHist?.ma150Series      || [],
                        source: 'Yahoo bulk', lastUpdate: new Date().toISOString(), success: true
                    };
                    this._setLsPrice(item.formatted, r);
                    results[item.formatted] = r;
                } else {
                    missing.push(item);
                }
            }

            // Individual parallel fallback only for symbols not returned by bulk
            if (missing.length > 0) {
                const fallback = await Promise.allSettled(
                    missing.map(item => this.fetchStockData(item.symbol, item.market, true))
                );
                fallback.forEach(r => { if (r.status === 'fulfilled') results[r.value.symbol] = r.value; });
            }
        }

        if (toFetchIL.length > 0) {
            const ilRes = await Promise.allSettled(
                toFetchIL.map(item => this.fetchStockData(item.symbol, item.market, true))
            );
            ilRes.forEach(r => { if (r.status === 'fulfilled') results[r.value.symbol] = r.value; });
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
            const suffix = `/${encodeURIComponent(symbol)}?interval=1d&range=${range}&includePrePost=false`;

            // Try Cloudflare Worker first (most reliable)
            if (this.CF_WORKER_URL) {
                try {
                    const workerUrl = this.CF_WORKER_URL + suffix;
                    const res = await fetch(workerUrl);
                    if (res.ok) {
                        const json = await res.json();
                        if (json?.chart?.result?.length > 0) data = json;
                    }
                } catch (e) {}
            }

            // Fallback: direct Yahoo + proxies
            if (!data?.chart?.result?.length) {
                for (const base of this.YAHOO_URLS) {
                    try {
                        const d = await this._fetchWithFallback(base + suffix);
                        if (d?.chart?.result?.length > 0) { data = d; break; }
                    } catch (e) {}
                }
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
