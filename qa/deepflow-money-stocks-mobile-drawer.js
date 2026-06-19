/*
 * deepflow-money-stocks-mobile-drawer.js
 * Oracle: STATE-TRANSITION. At 390px mobile, tapping the real hamburger
 * (.mobile-header-toggle, built by js/app.js setupMobileHeader) must add
 * `.open` to .sidebar and slide it on-screen (transform -> translateX(0),
 * bounding x === 0) — INCLUDING when the stocks-only desktop "collapse"
 * flag (localStorage stocks_sidebar_collapsed='1', body.sidebar-collapsed)
 * is set. Regression: the collapse CSS was once unscoped and beat
 * `.sidebar.open` on mobile, trapping the drawer off-canvas. The fix scoped
 * the collapse rules to @media (min-width:769px) in pages/stocks.html.
 *
 * GOTCHA this test guards against: the page shows TWO full-screen overlays on
 * first load (#wl-disclaimer-modal z=2147483646, then #wize-onboarding
 * z=2147483000) sitting ON TOP of the hamburger. A real pointer tap is
 * intercepted by them — so the drawer "not opening" is an overlay artifact,
 * NOT a drawer bug. The test dismisses both before tapping, then asserts a
 * genuine (non-forced) click opens the drawer. goals.html is checked as the
 * shared-css regression baseline.
 *
 * Run: node qa/deepflow-money-stocks-mobile-drawer.js
 * Requires Playwright resolvable (uses TOTALIST/wizelife/node_modules).
 */
const path = require('path');
let chromium;
try { ({ chromium } = require('playwright')); }
catch (e) { ({ chromium } = require('/Users/s/Desktop/Desktop - O’s MacBook Air/TOTALIST/wizelife/node_modules/playwright')); }

const BASE = 'https://money.wizelife.ai';
let failures = 0;
function step(label, ok, detail) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? '  ' + detail : ''}`);
  if (!ok) failures++;
}

async function clearOverlays(page) {
  // disclaimer: tick checkbox + click accept
  await page.$('#wl-disc-check').then(c => c && c.check({ force: true })).catch(() => {});
  await page.waitForTimeout(200);
  await page.$('#wl-disc-accept').then(b => b && b.click({ force: true })).catch(() => {});
  await page.waitForTimeout(600);
  // onboarding coach overlay sits above the hamburger — remove it
  await page.evaluate(() => { const o = document.querySelector('#wize-onboarding'); if (o) o.remove(); });
  await page.waitForTimeout(300);
}

async function probe(page) {
  return page.evaluate(() => {
    const sb = document.querySelector('.sidebar');
    const b = sb.getBoundingClientRect();
    return {
      open: sb.classList.contains('open'),
      transform: getComputedStyle(sb).transform,
      x: Math.round(b.x),
      bodyCollapsed: document.body.classList.contains('sidebar-collapsed'),
      navLinks: sb.querySelectorAll('.nav-link').length,
    };
  });
}

async function realTap(page) {
  // NO force -> respects hit-testing; fails if an overlay still covers the toggle
  await page.waitForSelector('.mobile-header-toggle', { state: 'visible', timeout: 8000 });
  await page.click('.mobile-header-toggle', { timeout: 6000 });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
  });
  const page = await ctx.newPage();

  // ---- stocks.html WITH collapse flag (the regression scenario) ----
  await page.addInitScript(() => { try { localStorage.setItem('stocks_sidebar_collapsed', '1'); } catch (e) {} });
  await page.goto(`${BASE}/pages/stocks.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4500);
  await clearOverlays(page);

  const sBefore = await probe(page);
  step('stocks: collapse flag applied (body.sidebar-collapsed)', sBefore.bodyCollapsed === true, JSON.stringify(sBefore));
  step('stocks: drawer starts closed off-canvas (x=-230)', sBefore.x <= -200 && !sBefore.open, `x=${sBefore.x}`);

  let tapOk = true;
  try { await realTap(page); } catch (e) { tapOk = false; }
  await page.waitForTimeout(900);
  const sAfter = await probe(page);
  step('stocks: real hamburger tap not intercepted by an overlay', tapOk, '');
  step('stocks: drawer OPENS on real tap despite collapse flag', sAfter.open && sAfter.x === 0, `open=${sAfter.open} x=${sAfter.x} transform=${sAfter.transform} collapsed=${sAfter.bodyCollapsed} navLinks=${sAfter.navLinks}`);

  // ---- goals.html: shared-css regression baseline ----
  await page.goto(`${BASE}/pages/goals.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  await clearOverlays(page);
  let gOk = true;
  try { await realTap(page); } catch (e) { gOk = false; }
  await page.waitForTimeout(900);
  const gAfter = await probe(page);
  step('goals: drawer still OPENS (shared app.css not regressed)', gOk && gAfter.open && gAfter.x === 0, `open=${gAfter.open} x=${gAfter.x}`);

  await browser.close();
  console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAILURE(S)`);
  process.exit(failures === 0 ? 0 : 1);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
