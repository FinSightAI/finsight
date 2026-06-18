/**
 * deepflow-money-i18n-cachebust.js
 * REGRESSION test for the stale-i18n cache-bust bug found in the 8ff868d deploy:
 *   the deploy ADDED chat.send to js/i18n.js but did NOT bump the `?v=` query on the
 *   <script src="i18n.js?v=..."> tags. The CDN kept serving the OLD i18n.js for that
 *   exact versioned URL, so on every real load `I18n.t('chat.send')` returned the raw
 *   key 'chat.send' and the ai-chat send button's aria-label literally read "chat.send".
 *
 * ORACLE: query↔response / state. The new i18n key MUST resolve to a real word, and
 * the versioned i18n.js the page actually requests MUST contain it.
 *
 * Run: node qa/deepflow-money-i18n-cachebust.js
 */
const path = require('path');
const { chromium } = require(path.resolve(__dirname, '../../TOTALIST/wizelife/node_modules/playwright'));
const ORIGIN = process.env.MONEY_ORIGIN || 'https://money.wizelife.ai';
let failures = 0;
const step = (l, ok, d) => { if (!ok) failures++; console.log(`[${ok ? 'PASS' : 'FAIL'}] ${l}${d ? '  — ' + d : ''}`); };

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  try {
    await page.goto(ORIGIN + '/pages/ai-chat.html', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(4000);

    // 1) Runtime resolution: I18n.t('chat.send') must NOT return the raw key.
    const r = await page.evaluate(() => ({
      lang: I18n.currentLanguage,
      tSend: I18n.t('chat.send'),
      hasSendKey: !!(I18n.translations?.en?.chat && 'send' in I18n.translations.en.chat),
      sendAria: document.getElementById('sendBtn')?.getAttribute('aria-label'),
    }));
    console.log('  runtime:', JSON.stringify(r));
    step("I18n.t('chat.send') resolves to a word (not the raw key)",
      r.tSend && r.tSend !== 'chat.send', 'got=' + JSON.stringify(r.tSend));
    step('translations.en.chat actually contains key "send"', r.hasSendKey === true, 'hasSendKey=' + r.hasSendKey);
    step('ai-chat send button aria-label is human text (not "chat.send")',
      r.sendAria && r.sendAria !== 'chat.send' && r.sendAria.length > 0, 'aria=' + JSON.stringify(r.sendAria));

    // 2) Cache-bust integrity: the EXACT versioned i18n.js URL the page loads must
    //    contain the key (proves the ?v= token points at the fresh file, not a stale CDN copy).
    const i18nUrl = await page.evaluate(() => {
      const s = [...document.querySelectorAll('script[src]')].map(x => x.getAttribute('src')).find(u => /i18n\.js/.test(u));
      return s ? new URL(s, location.href).href : null;
    });
    step('found versioned i18n.js script tag', !!i18nUrl, i18nUrl);
    if (i18nUrl) {
      const body = await page.evaluate(async (u) => (await (await fetch(u)).text()), i18nUrl);
      const hasSend = /send:\s*'(Send|שלח|Enviar)'/.test(body);
      step('the page-requested versioned i18n.js contains the chat.send key (fresh, not stale CDN copy)',
        hasSend, i18nUrl + ' hasSend=' + hasSend);
    }
  } catch (e) {
    step('harness completed without throwing', false, e.message);
  } finally {
    await browser.close();
    console.log(`\n=== ${failures === 0 ? 'ALL PASS' : failures + ' FAILURE(S)'} ===`);
    process.exit(failures === 0 ? 0 : 1);
  }
})();
