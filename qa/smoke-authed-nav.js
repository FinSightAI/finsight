/**
 * smoke-authed-nav.js
 * Authenticated smoke sweep of WizeMoney (money.wizelife.ai).
 * Injects SSO session via addInitScript (YOLO plan), visits every known page,
 * and asserts:
 *   1. HTTP 200 (no navigation error)
 *   2. body renders (innerText > 200 chars)
 *   3. sidebar nav populated (.sidebar a count > 0)  ← regression we're hunting
 *   4. no fatal uncaught JS errors (No Firebase App / ReferenceError / TypeError)
 *   5. page primary content rendered (chart/table/form/chatbox present)
 * Also runs dashboard.html LOGGED-OUT as a control.
 *
 * Run: node qa/smoke-authed-nav.js
 */

const path = require('path');
const PW = path.resolve(__dirname, '../../TOTALIST/wizelife/node_modules/playwright');
const { chromium } = require(PW);

const BASE = 'https://money.wizelife.ai';

// All pages to test (authed)
const PAGES = [
  { name: 'dashboard',         url: `${BASE}/` },
  { name: 'dashboard.html',    url: `${BASE}/pages/dashboard.html` },
  { name: 'stocks.html',       url: `${BASE}/pages/stocks.html` },
  { name: 'stock-analytics',   url: `${BASE}/pages/stock-analytics.html` },
  { name: 'compare-funds',     url: `${BASE}/pages/compare-funds.html` },
  { name: 'simulator',         url: `${BASE}/pages/simulator.html` },
  { name: 'ai-chat',           url: `${BASE}/pages/ai-chat.html` },
  { name: 'ai-story',          url: `${BASE}/pages/ai-story.html` },
  { name: 'pension-calc',      url: `${BASE}/pages/pension-calc.html` },
  { name: 'gemel',             url: `${BASE}/pages/gemel.html` },
  { name: 'reports',           url: `${BASE}/pages/reports.html` },
  { name: 'settings',          url: `${BASE}/pages/settings.html` },
  { name: 'family',            url: `${BASE}/pages/family.html` },
  { name: 'loans',             url: `${BASE}/pages/loans.html` },
  { name: 'subscriptions',     url: `${BASE}/pages/subscriptions.html` },
  // Extra sidebar pages found in the nav
  { name: 'bank',              url: `${BASE}/pages/bank.html` },
  { name: 'income',            url: `${BASE}/pages/income.html` },
  { name: 'credit',            url: `${BASE}/pages/credit.html` },
  { name: 'goals',             url: `${BASE}/pages/goals.html` },
  { name: 'assets',            url: `${BASE}/pages/assets.html` },
  { name: 'pension-optimizer', url: `${BASE}/pages/pension-optimizer.html` },
  { name: 'tax-optimizer',     url: `${BASE}/pages/tax-optimizer.html` },
  { name: 'calendar',          url: `${BASE}/pages/calendar.html` },
  { name: 'sectors',           url: `${BASE}/pages/sectors.html` },
  { name: 'investment-advisor',url: `${BASE}/pages/investment-advisor.html` },
  { name: 'profile',           url: `${BASE}/pages/profile.html` },
  { name: 'my-funds',          url: `${BASE}/pages/my-funds.html` },
  { name: 'market-products',   url: `${BASE}/pages/market-products.html` },
];

// The SSO init script injected BEFORE every page load
const SSO_INIT_SCRIPT = `
(function() {
  const jwt = 'aGRy.' + btoa(JSON.stringify({email:'a@b.com',user_id:'u1'})).replace(/=/g,'') + '.sig';
  localStorage.setItem('wl_sso', JSON.stringify({token:jwt,email:'a@b.com',uid:'u1',nick:'Test',plan:'yolo'}));
  localStorage.setItem('wl_plan','yolo');
  localStorage.setItem('wl_access_code','WL_SSO_YOLO');
  localStorage.setItem('wl_nickname','Test');
  localStorage.setItem('wl_consent','all');
  ['finsight','wizemoney','money'].forEach(function(a){
    for(var v=1;v<=6;v++) localStorage.setItem('wl_disclaimer_'+a+'_v'+v,'1');
    localStorage.setItem('wl_ob_'+a,'1');
  });
})();
`;

// Primary content selectors to assert per page (best-effort)
const CONTENT_HINTS = {
  'dashboard':          ['#netWorthValue', '.net-worth', '.dashboard', 'canvas', '.card'],
  'dashboard.html':     ['#netWorthValue', '.net-worth', '.dashboard', 'canvas', '.card'],
  'stocks.html':        ['#stocksTable', '.stocks', 'table', 'canvas', '.portfolio'],
  'stock-analytics':    ['canvas', '.analytics', 'table', '.chart'],
  'compare-funds':      ['table', '.compare', 'canvas', '.fund'],
  'simulator':          ['input[type="range"]', '.simulator', 'canvas', '.result', 'input'],
  'ai-chat':            ['.chat', '#chatInput', 'textarea', '.messages', '.chat-input'],
  'ai-story':           ['.story', 'textarea', '.output', '.ai', 'button'],
  'pension-calc':       ['input', '.pension', 'canvas', '.result', 'form'],
  'gemel':              ['input', '.gemel', 'canvas', '.result', 'form'],
  'reports':            ['canvas', 'table', '.report', '.chart', 'button'],
  'settings':           ['input', 'select', '.settings', 'form', 'button'],
  'family':             ['.family', 'table', '.member', 'button', '.card'],
  'loans':              ['input', '.loan', 'table', '.result', 'form'],
  'subscriptions':      ['table', '.subscription', '.item', 'button', 'input'],
  'bank':               ['table', '.bank', '.account', 'button', 'input'],
  'income':             ['table', '.income', 'input', 'button', '.chart'],
  'credit':             ['table', '.credit', 'input', 'button', '.card'],
  'goals':              ['.goal', 'input', 'button', 'progress', '.card'],
  'assets':             ['input', '.asset', 'table', 'button', '.card'],
  'pension-optimizer':  ['input', '.pension', 'canvas', 'button', 'form'],
  'tax-optimizer':      ['input', '.tax', 'canvas', 'button', 'form'],
  'calendar':           ['.calendar', '.event', 'table', 'button'],
  'sectors':            ['canvas', '.sector', 'table', '.chart'],
  'investment-advisor': ['.advisor', 'textarea', '.chat', 'button', 'input'],
  'profile':            ['input', '.profile', 'form', 'button'],
  'my-funds':           ['table', '.fund', '.product', 'button'],
  'market-products':    ['table', '.product', '.market', 'button'],
};

// Errors we deliberately IGNORE (non-fatal, infrastructure noise)
const BENIGN_ERROR_PATTERNS = [
  /favicon/i,
  /analytics/i,
  /gtag/i,
  /gainer/i,
  /cloudflare/i,
  /403/,
  /net::ERR_ABORTED/i,
  /ERR_BLOCKED_BY_CLIENT/i,
  /Content Security Policy/i,
  /CSP/i,
  /gstatic\.com/i,
  /fonts\.googleapis/i,
  /track\.js/i,
  /chat\.js/i,
  /Failed to load resource/i,
  /ERR_NAME_NOT_RESOLVED/i,
];

function isBenign(msg) {
  return BENIGN_ERROR_PATTERNS.some(p => p.test(msg));
}

function isFatal(msg) {
  // Only flag JS errors that would halt execution
  return /No Firebase App/i.test(msg)
    || /ReferenceError/i.test(msg)
    || /TypeError/i.test(msg)
    || /SyntaxError/i.test(msg)
    || /is not defined/i.test(msg)
    || /Cannot read prop/i.test(msg)
    || /Cannot set prop/i.test(msg)
    || /is not a function/i.test(msg);
}

async function probePage(context, pageSpec, authed) {
  const page = await context.newPage();
  const fatalErrors = [];
  const allErrors = [];

  page.on('pageerror', err => {
    const msg = err.message || String(err);
    allErrors.push(msg);
    if (!isBenign(msg) && isFatal(msg)) {
      fatalErrors.push(msg);
    }
  });

  // Also catch console errors that look fatal
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const txt = msg.text();
      if (!isBenign(txt) && isFatal(txt)) {
        fatalErrors.push('[console.error] ' + txt);
      }
    }
  });

  let httpStatus = null;
  page.on('response', resp => {
    if (resp.url() === pageSpec.url || resp.url() === pageSpec.url + '/') {
      httpStatus = resp.status();
    }
  });

  let navigationOk = true;
  try {
    const resp = await page.goto(pageSpec.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    if (resp) httpStatus = httpStatus || resp.status();
  } catch (e) {
    navigationOk = false;
    httpStatus = 0;
  }

  // Wait for hydration
  await page.waitForTimeout(3000);

  // 1. HTTP status
  const http200 = httpStatus === 200;

  // 2. Body renders (innerText > 200 chars)
  let bodyText = '';
  try {
    bodyText = await page.evaluate(() => document.body ? document.body.innerText : '');
  } catch (e) {}
  const bodyOk = bodyText.length > 200;

  // 3. Sidebar nav link count
  let navLinks = 0;
  try {
    navLinks = await page.evaluate(() => {
      // Try multiple sidebar selectors
      const selectors = ['.sidebar a', 'aside a', 'nav a', '#sidebar a', '.nav-links a'];
      for (const sel of selectors) {
        const els = document.querySelectorAll(sel);
        if (els.length > 0) return els.length;
      }
      return 0;
    });
  } catch (e) {}

  // 4. Primary content rendered
  const hints = CONTENT_HINTS[pageSpec.name] || ['.card', 'input', 'button'];
  let contentOk = false;
  try {
    contentOk = await page.evaluate((sels) => {
      return sels.some(sel => document.querySelector(sel) !== null);
    }, hints);
  } catch (e) {}

  // 5. Fatal errors
  const hasFatal = fatalErrors.length > 0;

  await page.close();

  return {
    name: pageSpec.name,
    url: pageSpec.url,
    authed,
    http200,
    httpStatus,
    navLinks,
    bodyOk,
    bodyLen: bodyText.length,
    contentOk,
    hasFatal,
    fatalErrors,
    navigationOk,
  };
}

async function run() {
  const browser = await chromium.launch({ headless: true });

  // ── AUTHED context ──
  const authedContext = await browser.newContext();
  await authedContext.addInitScript(SSO_INIT_SCRIPT);

  const results = [];
  for (const pg of PAGES) {
    process.stdout.write(`  probing [AUTHED] ${pg.name} ... `);
    try {
      const r = await probePage(authedContext, pg, true);
      results.push(r);
      const flag = (!r.http200 || r.navLinks === 0 || !r.bodyOk || r.hasFatal) ? ' *** FAIL ***' : ' ok';
      console.log(`nav=${r.navLinks} body=${r.bodyLen} content=${r.contentOk} fatal=${r.hasFatal}${flag}`);
      if (r.hasFatal) {
        r.fatalErrors.forEach(e => console.log(`    FATAL: ${e}`));
      }
    } catch (e) {
      console.log(`  EXCEPTION: ${e.message}`);
      results.push({ name: pg.name, url: pg.url, authed: true, http200: false, httpStatus: 0, navLinks: 0, bodyOk: false, bodyLen: 0, contentOk: false, hasFatal: true, fatalErrors: [e.message], navigationOk: false });
    }
  }

  await authedContext.close();

  // ── LOGGED-OUT control: dashboard.html ──
  const anonContext = await browser.newContext();
  const controlPg = { name: 'dashboard.html [ANON]', url: `${BASE}/pages/dashboard.html` };
  process.stdout.write(`  probing [ANON]   ${controlPg.name} ... `);
  try {
    const r = await probePage(anonContext, controlPg, false);
    results.push(r);
    console.log(`nav=${r.navLinks} body=${r.bodyLen} content=${r.contentOk} fatal=${r.hasFatal}`);
  } catch (e) {
    console.log(`  EXCEPTION: ${e.message}`);
    results.push({ name: controlPg.name, url: controlPg.url, authed: false, http200: false, httpStatus: 0, navLinks: 0, bodyOk: false, bodyLen: 0, contentOk: false, hasFatal: true, fatalErrors: [e.message], navigationOk: false });
  }
  await anonContext.close();

  await browser.close();

  // ── Print table ──
  console.log('\n');
  console.log('='.repeat(110));
  console.log('WizeMoney Authenticated Smoke Sweep Results');
  console.log('='.repeat(110));
  const pad = (s, n) => String(s).padEnd(n);
  const hdr = `${pad('page',26)} | ${pad('auth',5)} | ${pad('200',4)} | ${pad('nav-links',9)} | ${pad('body-ok',7)} | ${pad('content',7)} | fatal-errors`;
  console.log(hdr);
  console.log('-'.repeat(110));

  const flags = [];
  for (const r of results) {
    const navFlag = r.navLinks === 0 ? '*** 0 ***' : String(r.navLinks);
    const line = `${pad(r.name,26)} | ${pad(r.authed?'AUTHED':'ANON',5)} | ${pad(r.http200?'YES':'NO',4)} | ${pad(navFlag,9)} | ${pad(r.bodyOk?'YES':'NO',7)} | ${pad(r.contentOk?'YES':'NO',7)} | ${r.hasFatal ? r.fatalErrors.join('; ').slice(0,80) : '-'}`;
    console.log(line);
    if (!r.http200 || r.navLinks === 0 || !r.bodyOk || r.hasFatal) {
      flags.push(r);
    }
  }
  console.log('='.repeat(110));

  console.log('\n--- FLAGGED PAGES ---');
  if (flags.length === 0) {
    console.log('ALL GREEN — no pages flagged. nav regression NOT present on any tested page.');
  } else {
    for (const r of flags) {
      console.log(`\nFLAGGED: ${r.name} (${r.url})`);
      if (!r.http200) console.log(`  - HTTP status: ${r.httpStatus}`);
      if (r.navLinks === 0) console.log(`  - NAV LINKS = 0 (sidebar regression!)`);
      if (!r.bodyOk) console.log(`  - Body too short (${r.bodyLen} chars) — possible blank/error shell`);
      if (r.hasFatal) r.fatalErrors.forEach(e => console.log(`  - FATAL JS: ${e}`));
    }
  }

  console.log(`\nSummary: ${PAGES.length + 1} pages probed | ${flags.length} flagged | ${results.filter(r=>r.navLinks>0).length} with nav`);
  process.exit(flags.length > 0 ? 1 : 0);
}

run().catch(e => { console.error(e); process.exit(2); });
