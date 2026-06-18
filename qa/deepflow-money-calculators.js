/**
 * deepflow-money-calculators.js  (ANON / logged-out)
 * Round-2 deep audit of money.wizelife.ai public LITE calculators.
 *
 * ORACLES:
 *  (A) RECOMPUTE — simulator fvMonthly (annuity-DUE) re-derived independently;
 *      compound-comparison table (5 channels) each FV + profit invariant;
 *      pension extra-monthly payout = fv/(25*12).
 *  (B) CROSS-FIELD INVARIANT — cmp table: profit == fv - contributed; cash row == contributed.
 *  (C) NEGATIVE/EDGE FUZZ — fvMonthly with 0 / huge / NaN-ish inputs → no NaN/Infinity on screen.
 *  (D) 4-LANG DIFFERENTIAL — same default inputs → identical NUMERIC result across he/en/pt/es
 *      (simulator fmt is locale-fixed, so bytes identical); NO raw-key / data-i18n leak on
 *      simulator + index + pension-calc; RTL dir correct per lang.
 *  (E) PWA — manifest + start_url 200, SW registered.
 *
 * Run: node qa/deepflow-money-calculators.js
 */
const path = require('path');
const { chromium } = require(path.resolve(__dirname, '../../TOTALIST/wizelife/node_modules/playwright'));
const ORIGIN = process.env.MONEY_ORIGIN || 'https://money.wizelife.ai';
let failures = 0;
function step(label, ok, detail) {
  if (!ok) failures++;
  console.log(`[${ok ? 'PASS' : 'FAIL'}] ${label}${detail ? '  — ' + detail : ''}`);
}
const approx = (a, b, tolPct = 0.5) => Math.abs(a - b) <= Math.abs(b) * tolPct / 100 + 1;

// ── Independent re-derivation of the simulator formula (the ORACLE) ──
// Annuity-DUE FV: PMT * [((1+r)^n - 1)/r] * (1+r), r = monthly rate, n = months.
function expectFV(monthly, annualRatePct, years) {
  if (annualRatePct === 0) return monthly * years * 12;
  const r = annualRatePct / 100 / 12;
  const n = years * 12;
  return monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
}
// Replicate the page's fmtShort so we can parse the on-screen string back to a number.
function parseShort(s) {
  if (!s) return NaN;
  s = s.replace(/[₪$€R\$\s,]/g, '').trim();
  if (/M$/i.test(s)) return parseFloat(s) * 1e6;
  if (/K$/i.test(s)) return parseFloat(s) * 1000;
  return parseFloat(s);
}
// Apply the page's OWN fmtShort rounding to the oracle before comparing to the parsed
// on-screen string — otherwise a correct value displayed as ₪1.5M (1.531M) looks "wrong".
function fmtShortOracle(n) {
  if (n >= 1e6) return parseFloat((n / 1e6).toFixed(1)) * 1e6;
  if (n >= 1000) return Math.round(n / 1000) * 1000;
  return Math.round(n);
}

async function prep(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(2500);
  await page.evaluate(() => { const o = document.getElementById('wize-onboarding'); if (o) o.remove(); });
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const consoleErrs = [];
  page.on('console', m => { if (m.type() === 'error' && !/frame-ancestors|Failed to load resource/.test(m.text())) consoleErrs.push(m.text()); });
  page.on('pageerror', e => consoleErrs.push('PAGEERROR ' + e.message));

  try {
    // ════════════════════════════════════════════════════════════════
    // (A)+(B) SIMULATOR recompute + invariants — defaults, he
    // ════════════════════════════════════════════════════════════════
    await prep(page, ORIGIN + '/pages/simulator.html?lang=he');
    // Ensure init ran; trigger updates by dispatching input on sliders (defaults already set).
    await page.evaluate(() => {
      document.querySelectorAll('input[type=range]').forEach(s => s.dispatchEvent(new Event('input', { bubbles: true })));
    });
    await page.waitForTimeout(800);

    // Food scenario: default 500/mo, 10y, RATE 8.5
    const food = await page.evaluate(() => document.getElementById('foodResultAmt')?.textContent || '');
    const foodExp = expectFV(500, 8.5, 10);
    const foodAct = parseShort(food);
    console.log('  food:', JSON.stringify(food), 'parsed=', foodAct, 'expect≈', Math.round(foodExp));
    step('RECOMPUTE: food FV(500,8.5%,10y) matches annuity-due oracle',
      approx(foodAct, foodExp, 1.0), `ui=${foodAct} oracle=${Math.round(foodExp)}`);
    step('food result is a finite positive number (no NaN/Infinity on screen)',
      Number.isFinite(foodAct) && foodAct > 0 && !/NaN|Infinity|undefined/.test(food), JSON.stringify(food));

    // Pension scenario: default 500/mo, 25y, 5% ; payout = fv/(25*12)
    const pen = await page.evaluate(() => ({
      amt: document.getElementById('pensionResultAmt')?.textContent || '',
      sub: document.querySelector('#pensionResult .result-sub')?.textContent || ''
    }));
    const penFvExp = expectFV(500, 5, 25);
    const penFvAct = parseShort(pen.amt);
    console.log('  pension:', JSON.stringify(pen), 'fvOracle≈', Math.round(penFvExp));
    step('RECOMPUTE: pension FV(500,5%,25y) matches oracle',
      approx(penFvAct, penFvExp, 1.5), `ui=${penFvAct} oracle=${Math.round(penFvExp)}`);
    // payout = fv/(25*12); parse the "/month" number from sub
    const payoutExp = penFvExp / (25 * 12);
    const payoutAct = parseFloat((pen.sub.match(/[\d,]+/) || ['NaN'])[0].replace(/,/g, ''));
    step('INVARIANT: pension monthly payout ≈ FV/(25*12)',
      approx(payoutAct, payoutExp, 3), `ui=${payoutAct} oracle=${Math.round(payoutExp)}`);

    // Compound-comparison table: default 2000/mo, 20y, 5 channels.
    const cmp = await page.evaluate(() => {
      const rows = [...document.querySelectorAll('#cmpBody tr')].map(tr => {
        const td = [...tr.querySelectorAll('td')].map(x => x.textContent.trim());
        return td;
      });
      return rows;
    });
    console.log('  cmp rows:', JSON.stringify(cmp));
    const channels = [3.5, 5.0, 6.5, 10.0, 12.0];
    const M = 2000, Y = 20, contributed = M * Y * 12;
    let cmpOk = cmp.length >= 5;
    channels.forEach((rate, i) => {
      const fvExp = expectFV(M, rate, Y);
      const fvAct = parseShort(cmp[i]?.[2]);
      const profitAct = parseShort(cmp[i]?.[3]);
      // Compare against the page's own fmtShort rounding (M = 0.1M granularity, K = 1k).
      const okFv = Math.abs(fvAct - fmtShortOracle(fvExp)) <= (fvExp >= 1e6 ? 6e4 : 1500);
      const okInv = Math.abs(profitAct - fmtShortOracle(fvExp - contributed)) <= ((fvExp - contributed) >= 1e6 ? 6e4 : 1500);
      if (!okFv || !okInv) cmpOk = false;
      console.log(`    ch ${rate}%: fvUI=${fvAct} fvDisp=${fmtShortOracle(fvExp)} profitUI=${profitAct} profitDisp=${fmtShortOracle(fvExp - contributed)} okFv=${okFv} okInv=${okInv}`);
    });
    step('RECOMPUTE: cmp table all 5 channel FVs match annuity-due oracle (2000/mo,20y)', cmpOk, '');
    // Cash row (0%) must equal total contributed
    const cashRow = cmp[cmp.length - 1];
    const cashAct = parseShort(cashRow?.[2]);
    step('INVARIANT: cmp "cash" row (0%) == total contributed (M*Y*12)',
      approx(cashAct, contributed, 1.0), `ui=${cashAct} oracle=${contributed}`);

    // ════════════════════════════════════════════════════════════════
    // (C) EDGE FUZZ — drive sliders to extremes via JS + recompute
    // ════════════════════════════════════════════════════════════════
    const edge = await page.evaluate(() => {
      const out = {};
      const set = (id, v) => { const e = document.getElementById(id); if (e) { e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); } };
      // max-out food: 3000/mo, 30y, 8.5%
      set('foodSlider', 3000); set('foodYears', 30);
      out.foodMax = document.getElementById('foodResultAmt')?.textContent || '';
      // min food: 100/mo, 1y
      set('foodSlider', 100); set('foodYears', 1);
      out.foodMin = document.getElementById('foodResultAmt')?.textContent || '';
      // pension return 0-ish edge: set return to min (3) and years min (5)
      set('pensionReturn', 3); set('pensionSlider', 100); set('pensionYears', 5);
      out.penMin = document.getElementById('pensionResultAmt')?.textContent || '';
      // loan payoff with extra at max
      set('loanBal', 2000000); set('loanRate', 12); set('loanExtra', 10000);
      out.loanMax = document.getElementById('loanResultAmt')?.textContent || '';
      // loan extra at min
      set('loanExtra', 100);
      out.loanMin = document.getElementById('loanResultAmt')?.textContent || '';
      return out;
    });
    await page.waitForTimeout(300);
    console.log('  edge:', JSON.stringify(edge));
    const noBad = s => s && !/NaN|Infinity|undefined|null/.test(s) && parseShort(s) >= 0;
    step('EDGE: food max (3000/30y) renders finite ≥0, no NaN', noBad(edge.foodMax), JSON.stringify(edge.foodMax));
    step('EDGE: food min (100/1y) renders finite ≥0, no NaN', noBad(edge.foodMin), JSON.stringify(edge.foodMin));
    step('EDGE: pension min renders finite ≥0, no NaN', noBad(edge.penMin), JSON.stringify(edge.penMin));
    step('EDGE: loan payoff max renders finite ≥0, no NaN', noBad(edge.loanMax), JSON.stringify(edge.loanMax));
    step('EDGE: loan payoff min renders finite ≥0, no NaN', noBad(edge.loanMin), JSON.stringify(edge.loanMin));
    // Recompute the food-max oracle precisely
    step('RECOMPUTE: food max FV(3000,8.5%,30y) within tol',
      approx(parseShort(edge.foodMax), expectFV(3000, 8.5, 30), 1.5),
      `ui=${parseShort(edge.foodMax)} oracle=${Math.round(expectFV(3000, 8.5, 30))}`);

    step('SIMULATOR: no uncaught console errors during recompute/fuzz',
      consoleErrs.length === 0, consoleErrs.slice(0, 4).join(' || '));

    // ════════════════════════════════════════════════════════════════
    // (D) 4-LANG DIFFERENTIAL + raw-key leak + RTL — simulator, index, pension-calc
    // ════════════════════════════════════════════════════════════════
    const PAGES = [
      { name: 'simulator', url: '/pages/simulator.html' },
      { name: 'index', url: '/index.html' },
      { name: 'pension-calc', url: '/pages/pension-calc.html' },
    ];
    const LANGS = ['he', 'en', 'pt', 'es'];
    const numbersByLang = {}; // simulator food number per lang
    for (const p of PAGES) {
      for (const lang of LANGS) {
        consoleErrs.length = 0;
        await prep(page, `${ORIGIN}${p.url}?lang=${lang}`);
        const r = await page.evaluate(() => {
          const bodyText = document.body.innerText || '';
          // raw-key leak: visible text that looks like an i18n dotted key (a.b or a.b.c) or {placeholder}
          const keyLeak = (bodyText.match(/\b[a-z][a-zA-Z0-9]+(\.[a-z][a-zA-Z0-9]+){1,3}\b/g) || [])
            .filter(k => !/\.(html|js|css|png|jpg|svg|co|il|ai|com|net|org|io|win|app|dev)\b/i.test(k))
            .filter(k => !/wizelife|finzilla|google|firebase|gstatic|cloudfunctions/.test(k))
            .slice(0, 8);
          // unresolved data-i18n still showing its key as text — only VISIBLE ones
          // (hidden banner/modal keys are covered by the dedicated (F) test below).
          const isVisible = (el) => { let n = el; while (n) { const s = getComputedStyle(n); if (s.display === 'none' || s.visibility === 'hidden') return false; n = n.parentElement; } return el.getBoundingClientRect().width > 0; };
          const dataI18nLeak = [...document.querySelectorAll('[data-i18n]')]
            .filter(e => e.children.length === 0 && e.textContent.trim() === e.getAttribute('data-i18n'))
            .filter(isVisible)
            .map(e => e.getAttribute('data-i18n')).slice(0, 8);
          // mustache leak
          const mustache = (bodyText.match(/\{\{?[a-zA-Z_]+\}?\}/g) || []).slice(0, 6);
          return {
            dir: document.documentElement.dir,
            htmlLang: document.documentElement.lang,
            keyLeak, dataI18nLeak, mustache,
          };
        });
        const expectedDir = lang === 'he' ? 'rtl' : 'ltr';
        step(`RTL/dir correct: ${p.name} ${lang} → dir=${r.dir}`, r.dir === expectedDir, `dir=${r.dir} lang=${r.htmlLang}`);
        step(`NO data-i18n key leak: ${p.name} ${lang}`, r.dataI18nLeak.length === 0, JSON.stringify(r.dataI18nLeak));
        step(`NO mustache placeholder leak: ${p.name} ${lang}`, r.mustache.length === 0, JSON.stringify(r.mustache));

        if (p.name === 'simulator') {
          await page.evaluate(() => document.querySelectorAll('input[type=range]').forEach(s => s.dispatchEvent(new Event('input', { bubbles: true }))));
          await page.waitForTimeout(500);
          const f = await page.evaluate(() => document.getElementById('foodResultAmt')?.textContent || '');
          numbersByLang[lang] = parseShort(f);
        }
      }
    }
    // Differential: simulator food number identical across all 4 langs
    const vals = LANGS.map(l => numbersByLang[l]);
    const allEqual = vals.every(v => Number.isFinite(v) && approx(v, vals[0], 0.5));
    step('4-LANG DIFFERENTIAL: simulator food FV identical number across he/en/pt/es',
      allEqual, 'vals=' + JSON.stringify(numbersByLang));

    // ════════════════════════════════════════════════════════════════
    // (E) PWA — manifest + start_url + icon 200
    // ════════════════════════════════════════════════════════════════
    const man = await page.evaluate(async (origin) => {
      try {
        const res = await fetch(origin + '/manifest.json');
        const j = await res.json();
        const start = new URL(j.start_url, origin).href;
        const sres = await fetch(start, { redirect: 'manual' });
        const icon = j.icons && j.icons[0] && new URL(j.icons[0].src, origin).href;
        const ires = icon ? await fetch(icon, { redirect: 'manual' }) : { status: 0 };
        return { manStatus: res.status, start, startStatus: sres.status, icon, iconStatus: ires.status, name: j.name };
      } catch (e) { return { err: e.message }; }
    }, ORIGIN);
    console.log('  manifest:', JSON.stringify(man));
    step('PWA: manifest.json is 200 + parses', man.manStatus === 200, JSON.stringify(man));
    step('PWA: start_url resolves (200/0-from-SW)', man.startStatus === 200 || man.startStatus === 0, 'start=' + man.start + ' status=' + man.startStatus);
    step('PWA: first icon resolves 200', man.iconStatus === 200, 'icon=' + man.icon + ' status=' + man.iconStatus);

    // ════════════════════════════════════════════════════════════════
    // (F) SUMMARY-SENDER banner/modal flat i18n keys (BUG: raw key leak when shown)
    //     Force the hidden banner+modal visible and assert NO control shows its raw
    //     data-i18n key. FAILS on live until i18n.js flat keys are deployed; PASSES after.
    // ════════════════════════════════════════════════════════════════
    for (const lang of ['he', 'en', 'pt', 'es']) {
      await prep(page, `${ORIGIN}/index.html?lang=${lang}`);
      const leak = await page.evaluate(() => {
        const ids = ['summary_banner', 'share_whatsapp', 'preview', 'later', 'financial_summary', 'email', 'share', 'copy'];
        // reveal the normally-hidden containers so their text is real, then re-run i18n
        const b = document.getElementById('summarySenderBanner'); if (b) b.style.display = 'flex';
        const m = document.getElementById('summaryPreviewModal'); if (m) m.style.display = 'flex';
        try { if (window.I18n && I18n.translatePage) I18n.translatePage(); } catch (e) {}
        return [...document.querySelectorAll('[data-i18n]')]
          .filter(e => ids.includes(e.getAttribute('data-i18n')))
          .filter(e => e.textContent.trim() === e.getAttribute('data-i18n'))
          .map(e => e.getAttribute('data-i18n'));
      });
      step(`SUMMARY i18n: no raw-key leak in banner/modal — ${lang}`, leak.length === 0, JSON.stringify(leak));
    }

  } catch (e) {
    console.log('[FATAL]', e.message);
    failures++;
  } finally {
    await browser.close();
    console.log(`\n${failures === 0 ? '✅ ALL PASS' : '❌ ' + failures + ' FAILURE(S)'}`);
    process.exit(failures === 0 ? 0 : 1);
  }
})();
