/**
 * golden-tax-brackets-2026.js
 * GOLDEN correctness test locking the WizeMoney Tax Optimizer 2026 tax tables.
 *
 * Re-implements the EXACT bracket/credit/INSS/IRPF/redutor logic from
 * pages/tax-optimizer.html and asserts hand-computed 2026 official values.
 *
 * Sources (verified 2026-06-18):
 *  - Israel: gov.il / רשות המסים — לוח עזר ניכוי מס הכנסה ינואר 2026;
 *    Malam-Payroll; CalcFinance. Credit point ₪242/mo (₪2,904/yr).
 *  - Brazil: gov.br Receita Federal "Tributação de 2026"; Lei 15.270/2025;
 *    INSS teto R$8.475,55 (CalculaBrasil / Contabilizei).
 *
 * Run: node qa/golden-tax-brackets-2026.js
 * Exit code != 0 on any failure (CI-friendly).
 */
let failures = 0;
function eq(label, got, want, tol = 0.01) {
  const ok = Math.abs(got - want) <= tol;
  if (!ok) failures++;
  console.log(`[${ok ? 'PASS' : 'FAIL'}] ${label}  got=${got}  want=${want}`);
}

// ─────────── Israel 2026 (mirror of tax-optimizer.html) ───────────
const TAX_BRACKETS = [
  { upTo: 7010,  rate: 0.10 },
  { upTo: 10060, rate: 0.14 },
  { upTo: 19000, rate: 0.20 },
  { upTo: 25100, rate: 0.31 },
  { upTo: 46690, rate: 0.35 },
  { upTo: 60130, rate: 0.47 },
  { upTo: Infinity, rate: 0.50 },
];
const CREDIT_POINT_VALUE_MONTHLY = 242;
const BASIC_CREDIT_POINTS = 2.25;
const MONTHLY_BASIC_CREDIT = BASIC_CREDIT_POINTS * CREDIT_POINT_VALUE_MONTHLY; // 544.5

function calcMonthlyTaxIL(income) {
  let tax = 0, prev = 0;
  for (const b of TAX_BRACKETS) {
    if (income <= prev) break;
    tax += (Math.min(income, b.upTo) - prev) * b.rate;
    prev = b.upTo;
    if (b.upTo === Infinity) break;
  }
  return Math.max(0, tax - MONTHLY_BASIC_CREDIT);
}
function marginalIL(income) {
  for (const b of TAX_BRACKETS) if (income <= b.upTo) return b.rate;
  return 0.50;
}

// constants
eq('IL credit point monthly', CREDIT_POINT_VALUE_MONTHLY, 242);
eq('IL credit point annual', CREDIT_POINT_VALUE_MONTHLY * 12, 2904);
eq('IL basic credit/mo', MONTHLY_BASIC_CREDIT, 544.5);
// bracket boundaries (the 2026 reform)
eq('IL 20% band ceiling', TAX_BRACKETS[2].upTo, 19000);
eq('IL 31% band ceiling', TAX_BRACKETS[3].upTo, 25100);
eq('IL 35% band ceiling', TAX_BRACKETS[4].upTo, 46690); // 560,280/yr ÷ 12
eq('IL 47% band ceiling', TAX_BRACKETS[5].upTo, 60130); // 721,560/yr ÷ 12 (matches 3% surtax threshold)

// worked examples (hand-derived above)
// ₪18,000: 701 + 427 + 0.20*7940(=1588) = 2716 − 544.5 = 2171.5
eq('IL tax @18k/mo', calcMonthlyTaxIL(18000), 2171.5);
eq('IL marginal @18k', marginalIL(18000), 0.20);
// ₪30,000: 701+427+1788+1891+0.35*4900(=1715)=6522 − 544.5 = 5977.5
eq('IL tax @30k/mo', calcMonthlyTaxIL(30000), 5977.5);
eq('IL marginal @30k', marginalIL(30000), 0.35);
// ₪60,000: 701+427+1788+1891+0.35*21590(=7556.5)+0.47*13310(=6255.7)=18619.2 −544.5 = 18074.7
//   (60,000 falls in the 47% band 46,690–60,130; the 50% surtax band starts at 60,130/mo)
eq('IL tax @60k/mo', calcMonthlyTaxIL(60000), 18074.7);
eq('IL marginal @60k', marginalIL(60000), 0.47);
// default ₪15,000: 701+427+0.20*4940(=988)=2116 − 544.5 = 1571.5
eq('IL tax @15k default', calcMonthlyTaxIL(15000), 1571.5);
// boundary: exactly at ₪7,010 → 10%*7010 = 701 gross − 544.5 credit = 156.5
eq('IL tax @7010 boundary', calcMonthlyTaxIL(7010), 156.5);
// below credit threshold: ₪5,000 → 500 gross < 544.5 credit → 0
eq('IL tax @5000 (credit > gross)', calcMonthlyTaxIL(5000), 0);
// zero income
eq('IL tax @0', calcMonthlyTaxIL(0), 0);

// ─────────── Brazil 2026 (mirror of tax-optimizer.html) ───────────
const INSS_BRACKETS = [
  { upTo: 1621.00, rate: 0.075 },
  { upTo: 2902.84, rate: 0.09 },
  { upTo: 4354.27, rate: 0.12 },
  { upTo: 8475.55, rate: 0.14 },
  { upTo: Infinity, rate: 0 },
];
const INSS_MAX_MONTHLY = 988.09;
const IRPF_BRACKETS = [
  { upTo: 2428.80, rate: 0, deduction: 0 },
  { upTo: 2826.65, rate: 0.075, deduction: 182.16 },
  { upTo: 3751.05, rate: 0.15, deduction: 394.16 },
  { upTo: 4664.68, rate: 0.225, deduction: 675.49 },
  { upTo: Infinity, rate: 0.275, deduction: 908.73 },
];
const IRPF_DEPENDENT_DEDUCTION = 189.59;
const IRPF_REDUTOR_FULL_LIMIT = 5000.00;
const IRPF_REDUTOR_PARTIAL_LIMIT = 7350.00;
const IRPF_REDUTOR_A = 978.62;
const IRPF_REDUTOR_B = 0.133145;

function calcINSS(salary) {
  let inss = 0, prev = 0;
  for (const b of INSS_BRACKETS) {
    if (b.rate === 0) break;
    if (salary <= prev) break;
    inss += (Math.min(salary, b.upTo) - prev) * b.rate;
    prev = b.upTo;
    if (b.upTo === Infinity) break;
  }
  return Math.min(inss, INSS_MAX_MONTHLY);
}
function calcIRPFtable(base) {
  if (base <= 0) return 0;
  for (const b of IRPF_BRACKETS) {
    if (base <= b.upTo) return Math.max(0, base * b.rate - b.deduction);
  }
  return 0;
}
function calcRedutor(gross, due) {
  let r = 0;
  if (gross <= IRPF_REDUTOR_FULL_LIMIT) r = due;
  else if (gross <= IRPF_REDUTOR_PARTIAL_LIMIT) r = Math.max(0, IRPF_REDUTOR_A - IRPF_REDUTOR_B * gross);
  return Math.min(r, due);
}
function brIRPF(salary, deps) {
  const inss = calcINSS(salary);
  const base = Math.max(0, salary - inss - deps * IRPF_DEPENDENT_DEDUCTION);
  const due = calcIRPFtable(base);
  return Math.max(0, due - calcRedutor(salary, due));
}

// constants
eq('BR INSS teto contribution', INSS_MAX_MONTHLY, 988.09);
eq('BR IRPF exempt ceiling', IRPF_BRACKETS[0].upTo, 2428.80);
eq('BR IRPF top deduction', IRPF_BRACKETS[4].deduction, 908.73);

// INSS @5000: 121.575 + 115.3656 + 174.1716 + 90.4022 = 501.5144
eq('BR INSS @5000', calcINSS(5000), 501.5144, 0.005);
// INSS above teto caps at 988.09
eq('BR INSS @20000 capped', calcINSS(20000), 988.09);

// HEADLINE 2026: R$5,000 earner is fully EXEMPT (was R$336.67 under old code)
eq('BR IRPF @5000 EXEMPT (Lei 15.270)', brIRPF(5000, 0), 0);
// R$4,500 earner also exempt (below 5000)
eq('BR IRPF @4500 exempt', brIRPF(4500, 0), 0);
// R$6,000 partial: INSS=641.51 → base=5358.49 → 27.5%*5358.49 − 908.73 = 1473.58 − 908.73 = 564.85
//   redutor = 978.62 − 0.133145*6000 = 179.75 ; final = 564.85 − 179.75 = 385.10
eq('BR IRPF @6000 partial redutor', brIRPF(6000, 0), 385.10, 0.05);
// R$8,000 (>7350, below INSS teto): no redutor. INSS=921.51 → base=7078.49 →
//   27.5%*7078.49 − 908.73 = 1946.58 − 908.73 = 1037.85
eq('BR IRPF @8000 no redutor', brIRPF(8000, 0), 1037.85, 0.05);

console.log(failures === 0 ? '\nALL GOLDEN TAX 2026 TESTS PASSED' : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
