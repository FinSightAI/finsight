/**
 * deepflow-money-anon-invariants.js
 * ANON audit of money.wizelife.ai covering:
 *  (A) health-score empty-state — ORACLE: negative/edge + cross-field invariant.
 *      Anon user has no data → score must be a real number in [0,100], no NaN, no crash.
 *  (B) just-deployed a11y fixes — ORACLE: state/presence of accessible names on
 *      icon-only controls (index currency-refresh + budget-alert dismiss; ai-chat
 *      send + textarea).
 *  (C) manifest start_url + icon resolve to 200 (PWA installability).
 *
 * Run: node qa/deepflow-money-anon-invariants.js
 */
const path = require('path');
const { chromium } = require(path.resolve(__dirname, '../../TOTALIST/wizelife/node_modules/playwright'));
const ORIGIN = process.env.MONEY_ORIGIN || 'https://money.wizelife.ai';
let failures = 0;
function step(label, ok, detail) {
  if (!ok) failures++;
  console.log(`[${ok ? 'PASS' : 'FAIL'}] ${label}${detail ? '  — ' + detail : ''}`);
}
async function prep(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(2500);
  await page.evaluate(() => { const o = document.getElementById('wize-onboarding'); if (o) o.remove(); });
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', m => { if (m.type() === 'error' && !/frame-ancestors/.test(m.text())) console.log('  [console.error]', m.text()); });
  page.on('pageerror', e => console.log('  [pageerror]', e.message));

  try {
    // ---------- (A) health-score empty state ----------
    await prep(page, ORIGIN + '/pages/health-score.html');
    await page.evaluate(() => { try { renderHealthScore(); } catch (e) { window.__hsErr = e.message; } });
    await page.waitForTimeout(1000);
    const hs = await page.evaluate(() => {
      let scoreNum = NaN, total = NaN, scaled = NaN;
      try { const d = calculateScore(); total = d.total; scaled = d.scaledTotal; } catch (e) {}
      const el = document.getElementById('gaugeScoreText');
      scoreNum = el ? Number(el.textContent) : NaN;
      return { scoreNum, total, scaled, err: window.__hsErr || null,
               gradeText: document.getElementById('gaugeGradeText')?.textContent || '' };
    });
    console.log('  health-score(anon):', JSON.stringify(hs));
    step('health-score did not throw for anon (no data)', !hs.err, hs.err || 'ok');
    step('INVARIANT: scaledTotal is a number in [0,100]',
      Number.isFinite(hs.scaled) && hs.scaled >= 0 && hs.scaled <= 100, 'scaled=' + hs.scaled);
    step('INVARIANT: gauge score text is numeric (not NaN/blank)',
      Number.isFinite(hs.scoreNum) && hs.scoreNum >= 0 && hs.scoreNum <= 100, 'scoreText=' + hs.scoreNum);
    step('empty-state shows a grade label (not blank/crash)',
      hs.gradeText.trim().length > 0, JSON.stringify(hs.gradeText));

    // ---------- (B) a11y: ai-chat icon-only controls ----------
    await prep(page, ORIGIN + '/pages/ai-chat.html');
    const chat = await page.evaluate(() => ({
      sendName: (() => { const b = document.getElementById('sendBtn'); return b ? (b.getAttribute('aria-label') || b.getAttribute('title') || (b.textContent || '').trim()) : null; })(),
      sendType: document.getElementById('sendBtn')?.getAttribute('type') || null,
      taName: (() => { const t = document.getElementById('chatInput'); return t ? (t.getAttribute('aria-label') || t.getAttribute('placeholder')) : null; })(),
    }));
    console.log('  ai-chat a11y:', JSON.stringify(chat));
    step('DEPLOY a11y: ai-chat send button has accessible name (human text, not raw i18n key)',
      !!chat.sendName && chat.sendName.length > 0 && !/^[a-z]+\.[a-zA-Z]+$/.test(chat.sendName),
      'name=' + JSON.stringify(chat.sendName));
    step('DEPLOY a11y: ai-chat send button has type=button',
      chat.sendType === 'button', 'type=' + chat.sendType);
    step('DEPLOY a11y: ai-chat textarea has aria-label',
      !!chat.taName && chat.taName.length > 0, 'name=' + JSON.stringify(chat.taName));

    // ---------- (B2) a11y: index currency-refresh button ----------
    await prep(page, ORIGIN + '/');
    const idx = await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button[onclick*="loadCurrencyWidget"]')][0];
      return { name: btn ? (btn.getAttribute('aria-label') || (btn.textContent || '').trim()) : '__missing__' };
    });
    console.log('  index a11y:', JSON.stringify(idx));
    step('DEPLOY a11y: index currency-refresh button has accessible name (not emoji-only)',
      idx.name !== '__missing__' && idx.name && !/^[🔄\s]*$/.test(idx.name), 'name=' + JSON.stringify(idx.name));

    // ---------- (C) manifest start_url + icon resolve ----------
    const manifest = await page.evaluate(async (origin) => {
      const m = await (await fetch(origin + '/manifest.json')).json();
      const startUrl = new URL(m.start_url, origin + '/manifest.json').href;
      const iconUrl = new URL(m.icons[0].src, origin + '/manifest.json').href;
      const su = await fetch(startUrl, { method: 'GET' });
      const ic = await fetch(iconUrl, { method: 'GET' });
      return { start_url: m.start_url, startResolved: startUrl, startStatus: su.status,
               iconResolved: iconUrl, iconStatus: ic.status };
    }, ORIGIN);
    console.log('  manifest:', JSON.stringify(manifest));
    step('DEPLOY: manifest start_url resolves to 200', manifest.startStatus === 200,
      manifest.startResolved + ' -> ' + manifest.startStatus);
    step('DEPLOY: manifest start_url is the app root (not legacy /finsight/)',
      manifest.startResolved === ORIGIN + '/', manifest.startResolved);
    step('DEPLOY: manifest icon resolves to 200', manifest.iconStatus === 200,
      manifest.iconResolved + ' -> ' + manifest.iconStatus);

  } catch (e) {
    step('harness completed without throwing', false, e.message);
  } finally {
    await browser.close();
    console.log(`\n=== ${failures === 0 ? 'ALL PASS' : failures + ' FAILURE(S)'} ===`);
    process.exit(failures === 0 ? 0 : 1);
  }
})();
