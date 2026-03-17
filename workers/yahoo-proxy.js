/**
 * Cloudflare Worker — Yahoo Finance + Maya API CORS Proxy
 * Deploy at: https://dash.cloudflare.com → Workers & Pages → Create Worker
 * Paste this code, click Deploy, then copy your worker URL into stock-api.js
 *
 * Routes:
 *   /v8/finance/chart/*  → Yahoo Finance
 *   /maya/*              → Maya API (mayaapi.tase.co.il) — for Israeli funds/stocks
 */

const YAHOO_BASE = 'https://query1.finance.yahoo.com';
const MAYA_BASE  = 'https://mayaapi.tase.co.il/api';
const ALLOWED_ORIGIN = '*'; // or restrict to 'https://finsightai.github.io'

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            headers: {
                'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Max-Age': '86400',
            }
        });
    }

    const url = new URL(request.url);

    // ── Maya API route: /maya/* ───────────────────────────────────────────────
    if (url.pathname.startsWith('/maya/')) {
        const mayaPath = url.pathname.slice(5); // strip /maya prefix
        const mayaUrl  = MAYA_BASE + mayaPath + url.search;

        try {
            const response = await fetch(mayaUrl, {
                headers: {
                    'X-Maya-With': 'allow',
                    'User-Agent': 'Mozilla/5.0 (compatible; FinSightBot/1.0)',
                    'Accept': 'application/json',
                }
            });

            const body = await response.text();
            return new Response(body, {
                status: response.status,
                headers: {
                    'Content-Type': 'application/json;charset=utf-8',
                    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
                    'Cache-Control': 'public, max-age=300',
                }
            });
        } catch (e) {
            return new Response(JSON.stringify({ error: e.message }), {
                status: 502,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': ALLOWED_ORIGIN }
            });
        }
    }

    // ── Yahoo Finance route (default) ─────────────────────────────────────────
    const yahooUrl = YAHOO_BASE + url.pathname + url.search;

    try {
        const response = await fetch(yahooUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; FinSightBot/1.0)',
                'Accept': 'application/json',
            }
        });

        const body = await response.text();
        return new Response(body, {
            status: response.status,
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
                'Cache-Control': 'public, max-age=300',
            }
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
            status: 502,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': ALLOWED_ORIGIN }
        });
    }
}
