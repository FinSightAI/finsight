/**
 * deepflow-money-pension-calc.js
 * ANON deep-flow audit of the PUBLIC pension calculator on money.wizelife.ai.
 *
 * ORACLE: Recompute. Re-derives the expected balance / monthly pension / totals
 * IN THIS TEST from the same inputs using the SAME formula the page documents
 * (ordinary annuity, compound-then-deposit, deposit invested net of deposit fee,
 *  accumulation fee subtracted from annual return), then asserts the live UI
 * matches within tolerance. Also checks cross-field invariants and a NaN edge.
 *
 * Run: node qa/deepflow-money-pension-calc.js
 * (uses playwright from ../TOTALIST/wizelife/node_modules)
 */
const path = require('path');
const PW = path.resolve(__dirname, '../../TOTALIST/wizelife/node_modules/playwright');
const { chromium } = require(PW);

const URL = process.env.MONEY_URL || 'https://money.wizelife.ai/pages/pension-calc.html';
let failures = 0;
function step(label, ok, detail) {
  const tag = ok ? 'PASS' : 'FAIL';
  if (!ok) failures++;
  console.log(`[${tag}] ${label}${detail ? '  — ' + detail : ''}`);
}

// ---- ORACLE: exact reproduction of calculatePension() ----
function recompute(i) {
  const { currentAge, retirementAge, lifeExpectancy, currentBalance,
          monthlyDeposit, expectedReturn, depositFee, managementFee } = i;
  const yearsToRetirement = retirementAge - currentAge;
  const netReturn = expectedReturn - managementFee;
  const monthlyReturn = netReturn / 12 / 100;
  const netMonthlyDeposit = monthlyDeposit * (1 - depositFee / 100);
  let balance = currentBalance;
  let totalDeposits = currentBalance;
  for (let year = 0; year < yearsToRetirement; year++) {
    let yearDeposits = 0;
    for (let m = 0; m < 12; m++) {
      balance = balance * (1 + monthlyReturn) + netMonthlyDeposit;
      yearDeposits += monthlyDeposit;
    }
    totalDeposits += yearDeposits;
  }
  const totalReturns = balance - totalDeposits;
  const retirementYears = lifeExpectancy - retirementAge;
  const monthlyPension = balance / (retirementYears * 12);
  return { balance, totalDeposits, totalReturns, monthlyPension, netReturn, yearsToRetirement };
}

function parseILS(txt) {
  // "₪1,234,567" -> 1234567 ; tolerate non-breaking spaces / locale separators
  return Number(String(txt).replace(/[^\d.-]/g, ''));
}

async function setInput(page, id, val) {
  await page.fill(`#${id}`, String(val));
  await page.dispatchEvent(`#${id}`, 'input');
  await page.dispatchEvent(`#${id}`, 'change');
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', m => { if (m.type() === 'error') console.log('  [console.error]', m.text()); });

  try {
    const resp = await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(2500);
    step('pension-calc page loads (200, anon)', resp && resp.status() === 200, 'status=' + (resp && resp.status()));

    // The page may add body.light and default inputs; wait for the calc button.
    await page.waitForSelector('#monthlyPension', { timeout: 15000 }).catch(() => {});

    // Dismiss the first-run onboarding overlay (intercepts pointer events).
    await page.evaluate(() => {
      const ob = document.getElementById('wize-onboarding');
      if (ob) ob.remove();
      try { localStorage.setItem('wize_onboarding_done', '1'); } catch (e) {}
    });
    await page.waitForTimeout(300);

    // --- TEST 1: default-ish realistic inputs ---
    const inputs = {
      currentAge: 35, retirementAge: 67, lifeExpectancy: 85,
      currentBalance: 100000, monthlyDeposit: 3000,
      expectedReturn: 5, depositFee: 1, managementFee: 0.5,
    };
    for (const [id, v] of Object.entries(inputs)) {
      const has = await page.$(`#${id}`);
      if (has) await setInput(page, id, v);
    }
    // Trigger calculation (function is global / called inline by the page button).
    await page.evaluate(() => { try { calculatePension(); } catch (e) {} });
    await page.waitForTimeout(1500);

    const expect = recompute(inputs);
    const ui = await page.evaluate(() => ({
      balance: document.getElementById('totalAtRetirement')?.textContent,
      totalDeposits: document.getElementById('totalDeposits')?.textContent,
      totalReturns: document.getElementById('totalReturns')?.textContent,
      monthlyPension: document.getElementById('monthlyPension')?.textContent,
      netReturn: document.getElementById('netReturn')?.textContent,
      yearsToRetirement: document.getElementById('yearsToRetirement')?.textContent,
    }));
    console.log('  inputs:', JSON.stringify(inputs));
    console.log('  expected:', JSON.stringify({
      balance: Math.round(expect.balance), totalDeposits: Math.round(expect.totalDeposits),
      totalReturns: Math.round(expect.totalReturns), monthlyPension: Math.round(expect.monthlyPension),
    }));
    console.log('  ui:', JSON.stringify(ui));

    const within = (a, b, tolRel) => Math.abs(a - b) <= Math.max(2, Math.abs(b) * tolRel);
    step('balance @ retirement matches recompute (±0.5%)',
      within(parseILS(ui.balance), expect.balance, 0.005),
      `ui=${parseILS(ui.balance)} expected=${Math.round(expect.balance)}`);
    step('monthly pension matches recompute (±0.5%)',
      within(parseILS(ui.monthlyPension), expect.monthlyPension, 0.005),
      `ui=${parseILS(ui.monthlyPension)} expected=${Math.round(expect.monthlyPension)}`);
    step('total deposits matches recompute (±0.5%)',
      within(parseILS(ui.totalDeposits), expect.totalDeposits, 0.005),
      `ui=${parseILS(ui.totalDeposits)} expected=${Math.round(expect.totalDeposits)}`);
    step('total returns matches recompute (±1%)',
      within(parseILS(ui.totalReturns), expect.totalReturns, 0.01),
      `ui=${parseILS(ui.totalReturns)} expected=${Math.round(expect.totalReturns)}`);
    step('years to retirement = retire - current',
      parseILS(ui.yearsToRetirement) === expect.yearsToRetirement,
      `ui=${ui.yearsToRetirement} expected=${expect.yearsToRetirement}`);

    // --- CROSS-FIELD INVARIANT: balance == totalDeposits + totalReturns ---
    const b = parseILS(ui.balance), td = parseILS(ui.totalDeposits), tr = parseILS(ui.totalReturns);
    step('INVARIANT: balance ≈ totalDeposits + totalReturns (±0.2% rounding)',
      Math.abs(b - (td + tr)) <= Math.max(3, b * 0.002),
      `balance=${b} deposits+returns=${td + tr}`);

    // --- TEST 2: second input set (sensitivity / formula robustness) ---
    const inputs2 = {
      currentAge: 50, retirementAge: 67, lifeExpectancy: 90,
      currentBalance: 500000, monthlyDeposit: 5000,
      expectedReturn: 7, depositFee: 0, managementFee: 0.3,
    };
    for (const [id, v] of Object.entries(inputs2)) {
      const has = await page.$(`#${id}`); if (has) await setInput(page, id, v);
    }
    await page.evaluate(() => { try { calculatePension(); } catch (e) {} });
    await page.waitForTimeout(1200);
    const expect2 = recompute(inputs2);
    const ui2b = parseILS(await page.$eval('#totalAtRetirement', e => e.textContent));
    step('TEST2 balance matches recompute (±0.5%)',
      within(ui2b, expect2.balance, 0.005),
      `ui=${ui2b} expected=${Math.round(expect2.balance)}`);

    // --- NEGATIVE/EDGE: currentAge >= retirementAge should NOT produce a result ---
    await setInput(page, 'currentAge', 70);
    await setInput(page, 'retirementAge', 67);
    let alertFired = false;
    page.once('dialog', d => { alertFired = true; d.dismiss().catch(() => {}); });
    await page.evaluate(() => { try { calculatePension(); } catch (e) {} });
    await page.waitForTimeout(800);
    step('EDGE: currentAge>=retirementAge handled (alert, no NaN result)',
      alertFired, `alertFired=${alertFired}`);

  } catch (e) {
    step('test harness completed without throwing', false, e.message);
  } finally {
    await browser.close();
    console.log(`\n=== ${failures === 0 ? 'ALL PASS' : failures + ' FAILURE(S)'} ===`);
    process.exit(failures === 0 ? 0 : 1);
  }
})();
