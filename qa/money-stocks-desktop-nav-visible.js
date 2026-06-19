#!/usr/bin/env node
/**
 * Regression: WizeMoney /pages/stocks.html must NEVER hide the whole desktop nav.
 *
 * Bug (2026-06-19): a stocks-only 💰 ".sidebar-toggle" collapsed body.sidebar-collapsed
 * and pushed the entire desktop nav off-canvas, leaving only a 44px button users
 * couldn't find to reopen it. The state persisted in localStorage.stocks_sidebar_collapsed,
 * so the nav looked permanently gone on every visit. Fix: removed the toggle + auto-clear
 * the stuck flag on load.
 *
 * This test presets the exact stuck flag and asserts the desktop nav is on-screen
 * and the collapse class is gone. Run: node qa/money-stocks-desktop-nav-visible.js
 */
const { chromium } = require('../../TOTALIST/wizelife/node_modules/playwright');

const URL = process.env.MONEY_URL || 'https://money.wizelife.ai/pages/stocks.html';

(async () => {
  const b = await chromium.launch();
  let failed = 0;
  const check = (name, ok, detail) => {
    console.log(`${ok ? '✅' : '❌'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!ok) failed++;
  };
  try {
    const ctx = await b.newContext({ viewport: { width: 1366, height: 800 } });
    const p = await ctx.newPage();
    // Reproduce the exact stuck state a real user had.
    await p.addInitScript(() => {
      try { localStorage.setItem('wl_lang', 'he'); localStorage.setItem('stocks_sidebar_collapsed', '1'); } catch (e) {}
    });
    await p.goto(URL + '?cb=' + Date.now(), { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
    await p.waitForTimeout(4000);

    const r = await p.evaluate(() => {
      const el = document.querySelector('aside.sidebar');
      const rect = el ? el.getBoundingClientRect() : null;
      return {
        navExists: !!el,
        navLeft: rect ? Math.round(rect.left) : null,
        navWidth: rect ? Math.round(rect.width) : null,
        onScreen: rect ? (rect.left < window.innerWidth && rect.right > 0 && rect.width > 100) : false,
        collapsed: document.body.classList.contains('sidebar-collapsed'),
        vw: window.innerWidth,
      };
    });

    check('desktop nav element exists', r.navExists);
    check('desktop nav is on-screen even with stuck collapse flag', r.onScreen, `left=${r.navLeft} w=${r.navWidth} vw=${r.vw}`);
    check('body.sidebar-collapsed is NOT applied (auto-recovered)', !r.collapsed);
    await ctx.close();
  } catch (e) {
    check('test ran', false, e.message);
  }
  await b.close();
  console.log(failed ? `\n❌ ${failed} check(s) failed` : '\n✅ all checks passed');
  process.exit(failed ? 1 : 0);
})();
