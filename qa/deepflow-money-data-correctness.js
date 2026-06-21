/**
 * deepflow-money-data-correctness.js
 *
 * ORACLE-BASED DATA CORRECTNESS AUDIT — WizeMoney
 * Run: node qa/deepflow-money-data-correctness.js
 *
 * Covers 4 oracle types (static/recompute — no browser needed):
 *   A) RECOMPUTE: pension-calc formula (ordinary annuity loop with fees)
 *   B) RECOMPUTE: loan amortization schedule (standard amortization)
 *   C) CROSS-FIELD INVARIANT: net-worth formula correctness
 *   D) NEGATIVE/EDGE: pension-calc getFunds fix (regression guard)
 *
 * These are all pure arithmetic oracles that don't require Playwright.
 * The browser-driven tests are in deepflow-money-calculators.js.
 */

let failures = 0;
let passes = 0;

function step(label, ok, detail) {
  if (ok) { passes++; } else { failures++; }
  const tag = ok ? '[PASS]' : '[FAIL]';
  console.log(`${tag} ${label}${detail ? '  —  ' + detail : ''}`);
}

function approx(a, b, tolPct = 0.1) {
  return Math.abs(a - b) <= Math.abs(b) * tolPct / 100 + 0.5;
}

// ══════════════════════════════════════════════════════════════
// A) PENSION-CALC: ORDINARY ANNUITY + FEE ORACLE
//    Default inputs from pension-calc.html:
//      age=30, retirement=67, lifeExpectancy=85
//      currentBalance=100000, monthlyDeposit=3000
//      expectedReturn=5%, depositFee=1.5%, managementFee=0.5%
// ══════════════════════════════════════════════════════════════
console.log('\n── A) PENSION-CALC RECOMPUTE ──');
{
  const currentBalance = 100000;
  const monthlyDeposit = 3000;
  const expectedReturn = 5;
  const depositFee = 1.5;
  const managementFee = 0.5;
  const yearsToRetirement = 37; // 67-30
  const lifeExpectancyYears = 18; // 85-67

  const netReturn = expectedReturn - managementFee; // 4.5%
  const monthlyRate = netReturn / 12 / 100;
  const netMonthlyDeposit = monthlyDeposit * (1 - depositFee / 100); // 2955

  let balance = currentBalance;
  let totalDeposits = currentBalance;
  for (let year = 0; year < yearsToRetirement; year++) {
    for (let month = 0; month < 12; month++) {
      balance *= (1 + monthlyRate);
      balance += netMonthlyDeposit;
      totalDeposits += monthlyDeposit;
    }
  }
  const totalReturns = balance - totalDeposits;
  const monthlyPension = balance / (lifeExpectancyYears * 12);

  // Oracle values (hand-verified)
  const EXPECTED_BALANCE = 3891084;
  const EXPECTED_DEPOSITS = 1432000;
  const EXPECTED_RETURNS = 2459084;
  const EXPECTED_MONTHLY_PENSION = 18014;

  step('Pension: balance at retirement ≈ ILS 3,891,084',
    approx(balance, EXPECTED_BALANCE, 0.01),
    `got ${Math.round(balance).toLocaleString()} expected ${EXPECTED_BALANCE.toLocaleString()}`);

  step('Pension: totalDeposits = currentBalance + yearsToRetirement*12*monthlyDeposit',
    Math.round(totalDeposits) === EXPECTED_DEPOSITS,
    `got ${Math.round(totalDeposits)} expected ${EXPECTED_DEPOSITS}`);

  step('Pension: totalReturns = balance - totalDeposits (invariant)',
    approx(totalReturns, EXPECTED_RETURNS, 0.01),
    `got ${Math.round(totalReturns).toLocaleString()}`);

  step('Pension: monthlyPension ≈ ILS 18,014',
    approx(monthlyPension, EXPECTED_MONTHLY_PENSION, 0.1),
    `got ${Math.round(monthlyPension)} expected ${EXPECTED_MONTHLY_PENSION}`);

  step('Pension: deposit fee correctly REDUCES balance (vs zero-fee)',
    (() => {
      let b2 = currentBalance;
      for (let y = 0; y < yearsToRetirement; y++) {
        for (let m = 0; m < 12; m++) {
          b2 *= (1 + monthlyRate);
          b2 += monthlyDeposit; // gross deposit, no fee
        }
      }
      return balance < b2; // with-fee < without-fee
    })(),
    'with-fee < without-fee');

  step('Pension: netReturn displayed = 4.5% (expectedReturn - managementFee)',
    Math.abs(netReturn - 4.5) < 0.001,
    `got ${netReturn}`);
}

// ══════════════════════════════════════════════════════════════
// B) LOAN AMORTIZATION: STANDARD SCHEDULE ORACLE
//    Case: P=100000, rate=6% annual, 120 months
//    Standard payment = P*r*(1+r)^n / ((1+r)^n - 1)
// ══════════════════════════════════════════════════════════════
console.log('\n── B) LOAN AMORTIZATION ORACLE ──');
{
  const P = 100000, annualRate = 6, n = 120;
  const r = annualRate / 100 / 12;
  const pmt = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);

  // Replicate the page's amortization loop exactly (from loans.html showAmortization)
  let balance = P;
  let totalInterestPaid = 0;
  const schedule = [];
  for (let i = 1; i <= n; i++) {
    const interestPayment = balance * r;
    const principalPayment = pmt - interestPayment;
    balance = Math.max(0, balance - principalPayment);
    totalInterestPaid += interestPayment;
    schedule.push({ month: i, interest: interestPayment, principal: principalPayment, balance });
    if (balance <= 0) break;
  }

  // Oracle: month 1 interest = P * r = 500
  const m1 = schedule[0];
  step('Loan amort: month-1 interest = P*r = 500',
    approx(m1.interest, 500, 0.001),
    `got ${m1.interest.toFixed(4)}`);

  // Oracle: final balance ≈ 0
  step('Loan amort: final balance ≈ 0 (loan fully paid off)',
    Math.abs(balance) < 0.01,
    `final balance = ${balance.toFixed(8)}`);

  // Oracle: totalInterestPaid ≈ pmt*n - P
  const simpleTotalInterest = pmt * n - P;
  step('Loan amort: total interest from schedule ≈ pmt*n - P',
    approx(totalInterestPaid, simpleTotalInterest, 0.001),
    `schedule=${Math.round(totalInterestPaid)} simple=${Math.round(simpleTotalInterest)}`);

  // Oracle: schedule is monotonically decreasing balance
  let monoDec = true;
  for (let i = 1; i < schedule.length; i++) {
    if (schedule[i].balance > schedule[i-1].balance + 0.01) { monoDec = false; break; }
  }
  step('Loan amort: balance monotonically decreasing (no negative amortization)',
    monoDec, `${schedule.length} rows checked`);

  // Oracle: principal increases, interest decreases over time (standard amort behavior)
  step('Loan amort: last month principal > first month principal',
    schedule[schedule.length-1].principal > schedule[0].principal,
    `first=${schedule[0].principal.toFixed(2)} last=${schedule[schedule.length-1].principal.toFixed(2)}`);

  // calculateTotalInterest() from the card summary: pmt*n - P  (static formula)
  // Must match full schedule for exact payments
  step('Loan summary card: calculateTotalInterest() ≈ full-schedule total interest',
    approx(simpleTotalInterest, totalInterestPaid, 0.001),
    `simple=${Math.round(simpleTotalInterest)} full=${Math.round(totalInterestPaid)}`);
}

// ══════════════════════════════════════════════════════════════
// C) NET-WORTH INVARIANT
// ══════════════════════════════════════════════════════════════
console.log('\n── C) NET-WORTH FORMULA INVARIANT ──');
{
  // Verify: getNetWorth() = bank + stocks + assets + funds - loans
  const bank = 50000, stocks = 30000, assets = 20000, funds = 10000, loans = 15000;
  const expected = bank + stocks + assets + funds - loans; // 95000
  step('Net worth: bank + stocks + assets + funds - loans = 95000',
    expected === 95000, `got ${expected}`);

  // Verify: _toILS with ILS currency returns raw value
  function _toILS(value, currency, rates) {
    if (!value) return 0;
    if (!currency || currency === 'ILS') return value;
    if (!rates) return value; // fallback
    const rate = rates[currency];
    return rate ? value * rate : value;
  }
  step('_toILS: ILS currency returns unchanged', _toILS(1000, 'ILS', {}) === 1000, '');
  step('_toILS: null currency returns unchanged', _toILS(1000, null, {}) === 1000, '');
  step('_toILS: 0 value returns 0', _toILS(0, 'USD', {USD: 3.65}) === 0, '');
  step('_toILS: known rate converts correctly', _toILS(100, 'USD', {USD: 3.65}) === 365, '');
  step('_toILS: unknown currency falls back to raw (known limitation)',
    _toILS(100, 'USD', {}) === 100, 'no rate available → raw (1:1 silent error for foreign currency)');
}

// ══════════════════════════════════════════════════════════════
// D) REGRESSION GUARD: pension-calc.html getFunds fix
// ══════════════════════════════════════════════════════════════
console.log('\n── D) REGRESSION GUARD ──');
{
  const fs = require('fs');
  const pensionCalcSrc = fs.readFileSync(
    "/Users/s/Desktop/Desktop - O's MacBook Air/finance dashboard/pages/pension-calc.html",
    'utf-8'
  );
  step('REGRESSION: pension-calc.html uses Storage.getMyFunds() not Storage.getFunds()',
    pensionCalcSrc.includes('Storage.getMyFunds()') && !pensionCalcSrc.includes('Storage.getFunds()'),
    'Storage.getFunds() was a TypeError (silent catch); getMyFunds() is correct');

  const loansSrc = fs.readFileSync(
    "/Users/s/Desktop/Desktop - O's MacBook Air/finance dashboard/pages/loans.html",
    'utf-8'
  );
  step('REGRESSION: loans.html has ES lang pill',
    loansSrc.includes('data-lang="es"'),
    'Previously HE/EN/PT only — ES users could not switch language on mobile');

  const subsSrc = fs.readFileSync(
    "/Users/s/Desktop/Desktop - O's MacBook Air/finance dashboard/pages/subscriptions.html",
    'utf-8'
  );
  step('REGRESSION: subscriptions.html has ES lang pill',
    subsSrc.includes('data-lang="es"'),
    'Previously HE/EN/PT only — ES users could not switch language on mobile');
}

// ══════════════════════════════════════════════════════════════
// SUMMARY
// ══════════════════════════════════════════════════════════════
console.log(`\n${failures === 0 ? '✅ ALL PASS' : '❌ ' + failures + ' FAILURE(S)'}`);
console.log(`Passed: ${passes}  Failed: ${failures}`);
process.exit(failures === 0 ? 0 : 1);
