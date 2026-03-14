#!/usr/bin/env node
/**
 * Fetches daily price data for Israeli securities (Maya API) and
 * US/UK stocks (Yahoo Finance). Runs server-side via GitHub Actions — no CORS.
 *
 * Config:  data/tase-ids.json   — numbers = TASE IDs, strings = Yahoo symbols
 * Output:  data/tase-prices.json — cached prices read by the browser app
 */

const { readFileSync, writeFileSync, existsSync } = require('fs');

const MAYA_BASE = 'https://mayaapi.tase.co.il/api';
const MAYA_HEADERS = {
    'X-Maya-With': 'allow',
    'User-Agent': 'Mozilla/5.0 (compatible; FinSightBot/1.0)',
    'Accept': 'application/json'
};
const YAHOO_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart';

// Load existing prices
let prices = {};
if (existsSync('data/tase-prices.json')) {
    try { prices = JSON.parse(readFileSync('data/tase-prices.json', 'utf8')); } catch {}
}

// Load IDs/symbols to fetch
let ids = [];
try {
    ids = JSON.parse(readFileSync('data/tase-ids.json', 'utf8'));
} catch {
    console.error('Could not read data/tase-ids.json');
    process.exit(1);
}

// ── TASE (Maya API) ──────────────────────────────────────────────────────────

function parseMayaPrice(data) {
    const d = data?.tradeData || data?.TradeData
           || data?.fundDetails || data?.FundDetails
           || data;

    const raw = d?.lastPrice ?? d?.LastPrice ?? d?.tradePrice ?? d?.TradePrice
             ?? d?.navPerUnit ?? d?.NavPerUnit ?? d?.unitPrice ?? d?.UnitPrice
             ?? d?.currentNAV ?? d?.CurrentNAV;
    if (raw == null) return null;

    // TASE prices are in agora (1/100 ILS); divide by 100 to get ILS
    const currentPrice = raw / 100;

    const rawPrev = d?.basePrice ?? d?.BasePrice
                 ?? d?.previousClose ?? d?.PreviousClose
                 ?? d?.previousNavPerUnit ?? d?.PreviousNavPerUnit;
    const previousClose = rawPrev != null ? rawPrev / 100 : null;

    const priceChange = previousClose != null ? currentPrice - previousClose : 0;
    const priceChangePercent = previousClose ? (priceChange / previousClose) * 100 : 0;

    return { currentPrice, previousClose, priceChange, priceChangePercent, currency: 'ILS' };
}

async function fetchTaseId(id) {
    const endpoints = [
        `${MAYA_BASE}/fund/details?fundId=${id}`,
        `${MAYA_BASE}/company/tradedata?companyId=${id}`
    ];
    for (const url of endpoints) {
        try {
            const res = await fetch(url, { headers: MAYA_HEADERS });
            if (!res.ok) { console.log(`  ${url} → HTTP ${res.status}`); continue; }
            const data = await res.json();
            const parsed = parseMayaPrice(data);
            if (parsed) {
                const sign = parsed.priceChangePercent >= 0 ? '+' : '';
                console.log(`✓ TASE ${id}: ₪${parsed.currentPrice.toFixed(2)} (${sign}${parsed.priceChangePercent.toFixed(2)}%)`);
                return parsed;
            }
            console.warn(`⚠ TASE ${id}: no price. Keys: ${Object.keys(data).join(', ')}`);
        } catch (e) {
            console.warn(`  ${url}: ${e.message}`);
        }
    }
    return null;
}

// ── Yahoo Finance ─────────────────────────────────────────────────────────────

async function fetchYahooSymbol(symbol) {
    const url = `${YAHOO_BASE}/${encodeURIComponent(symbol)}?interval=1d&range=5d&includePrePost=false`;
    const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FinSightBot/1.0)' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const result = data?.chart?.result?.[0];
    if (!result) throw new Error('No chart result');

    const meta = result.meta;
    const closes = (result.indicators?.quote?.[0]?.close || []).filter(c => c != null);

    let currentPrice = meta.regularMarketPrice ?? closes[closes.length - 1];
    if (!currentPrice) throw new Error('No price in response');

    let previousClose = meta.chartPreviousClose ?? (closes.length >= 2 ? closes[closes.length - 2] : null);
    let currency = meta.currency || 'USD';

    // Yahoo returns GBp (pence) for London stocks — convert to GBP
    if (currency === 'GBp') {
        currentPrice = currentPrice / 100;
        if (previousClose) previousClose = previousClose / 100;
        currency = 'GBP';
    }

    const priceChange = previousClose ? currentPrice - previousClose : 0;
    const priceChangePercent = previousClose ? (priceChange / previousClose) * 100 : 0;

    const sign = priceChangePercent >= 0 ? '+' : '';
    const sym = { USD: '$', GBp: 'p', GBP: '£', EUR: '€', ILS: '₪' }[currency] || currency;
    console.log(`✓ ${symbol}: ${sym}${currentPrice.toFixed(2)} (${sign}${priceChangePercent.toFixed(2)}%)`);

    return { currentPrice, previousClose, priceChange, priceChangePercent, currency };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
    const taseIds = ids.filter(id => typeof id === 'number');
    const symbols = ids.filter(id => typeof id === 'string');

    console.log(`Fetching ${taseIds.length} TASE securities + ${symbols.length} stock symbols...`);

    for (const id of taseIds) {
        process.stdout.write(`Fetching TASE ${id}... `);
        const result = await fetchTaseId(id);
        if (result) {
            prices[String(id)] = { ...result, lastUpdate: new Date().toISOString() };
        } else {
            console.error(`✗ TASE ${id}: all endpoints failed`);
        }
    }

    for (const symbol of symbols) {
        process.stdout.write(`Fetching ${symbol}... `);
        try {
            const result = await fetchYahooSymbol(symbol);
            prices[symbol] = { ...result, lastUpdate: new Date().toISOString() };
        } catch (e) {
            console.error(`✗ ${symbol}: ${e.message}`);
        }
        // Small delay to be polite to Yahoo
        await new Promise(r => setTimeout(r, 300));
    }

    writeFileSync('data/tase-prices.json', JSON.stringify(prices, null, 2));
    console.log(`\nDone. Saved ${Object.keys(prices).length} prices to data/tase-prices.json`);
}

main().catch(e => { console.error(e); process.exit(1); });
