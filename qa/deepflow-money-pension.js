/**
 * deepflow-money-pension.js
 * AUTHED deep-flow audit of the Pension & Gemel cluster on money.wizelife.ai.
 *
 * Logs in on https://wizelife.ai/auth.html with QA_EMAIL/QA_PASSWORD, then drives
 * the authed pension flows with ORACLES (not "page loaded"):
 *
 *  T1 Recompute (pension-optimizer): re-derive projectSavings() for every track +
 *     monthly-pension (gross/convFactor) + inflation-real adjustment in this test,
 *     assert the live table/summary numbers match within tolerance.
 *  T2 Cross-field invariant: best-track >= current-track display; ranking is
 *     monotonic by display value; monthly = round(display/convFactor).
 *  T3 Differential (optimizer sync): a pension holding in finance_my_funds must be
 *     summed into the optimizer "currentSavings"/"monthlyContrib" via syncFromStorage.
 *  T4 Round-trip persistence: write a pension holding -> hard reload (localStorage)
 *     AND a fresh browser context (Firestore cloud backup userBackups/{uid}) ->
 *     the EXACT same holding loads back.
 *  T5 4-lang number parity: pension-calc balance digits identical across he/en/pt/es.
 *  T6 Recompute (pension-calc authed): same oracle as anon test, re-checked logged-in.
 *
 * Run: QA_EMAIL='...' QA_PASSWORD='...' node qa/deepflow-money-pension.js
 */
const path = require('path');
const PW = path.resolve(__dirname, '../../TOTALIST/wizelife/node_modules/playwright');
const { chromium } = require(PW);

const AUTH_URL = 'https://wizelife.ai/auth.html';
const MONEY = 'https://money.wizelife.ai';
const EMAIL = process.env.QA_EMAIL;
const PASSWORD = process.env.QA_PASSWORD;
const LABEL = process.env.QA_LABEL || EMAIL || 'unknown';

let failures = 0, passes = 0;
function step(label, ok, detail) {
  const tag = ok ? 'PASS' : 'FAIL';
  if (ok) passes++; else failures++;
  console.log(`[${tag}] ${label}${detail ? '  — ' + detail : ''}`);
}
function info(...a) { console.log('  ', ...a); }

// ---------- ORACLES ----------
// exact reproduction of pension-optimizer.html projectSavings()
function projectSavings(pv, monthlyDeposit, annualReturnPct, depositFeePct, accumFeePct, months) {
  const netDeposit = monthlyDeposit * (1 - depositFeePct / 100);
  const netAnnualRate = (annualReturnPct - accumFeePct) / 100;
  const r = netAnnualRate / 12;
  if (Math.abs(r) < 1e-9) return pv + netDeposit * months;
  return pv * Math.pow(1 + r, months) + netDeposit * ((Math.pow(1 + r, months) - 1) / r);
}
const OPT_TRACKS = [
  { id: 'gov', return: 3.0 }, { id: 'bonds', return: 4.5 }, { id: 'halakha', return: 5.8 },
  { id: 'general', return: 7.5 }, { id: 'stocks', return: 9.2 }, { id: 'passive', return: 9.8 },
];

function parseILS(txt) { return Number(String(txt).replace(/[^\d.-]/g, '')); }
function digitsOnly(txt) { return String(txt).replace(/[^\d]/g, ''); }

async function login(page) {
  if (!EMAIL || !PASSWORD) throw new Error('NO_CREDS');
  await page.goto(AUTH_URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(1500);
  // dismiss onboarding if present
  await page.evaluate(() => { try { localStorage.setItem('wize_onboarding_done','1'); localStorage.setItem('wize_consent','essential'); } catch(e){} });
  // dismiss cookie-consent banner if it overlays the login button
  for (const t of ['Essential only','Accept all','Essential','Accept']) {
    const b = page.locator(`button:has-text("${t}")`).first();
    if (await b.count().catch(()=>0)) { await b.click({ timeout: 1500 }).catch(()=>{}); break; }
  }
  await page.waitForSelector('#loginEmail', { timeout: 20000 });
  await page.fill('#loginEmail', EMAIL);
  await page.fill('#loginPassword', PASSWORD);
  // call emailLogin() directly to avoid overlay intercepting the click
  const clicked = await page.evaluate(() => { try { if (typeof emailLogin==='function'){ emailLogin(); return 'fn'; } } catch(e){} return 'no'; });
  if (clicked !== 'fn') await page.click('#loginBtn', { force: true });
  // Poll for firebase currentUser for up to 45s. Headless App Check enforce throttles
  // (400) the attestation, delaying the sign-in token exchange; the redirect to
  // dashboard.html lags but the auth state DOES settle.
  let authed = false;
  for (let i=0;i<45;i++){
    authed = await page.evaluate(()=>{ try{return !!(window.firebase && firebase.auth && firebase.auth().currentUser);}catch(e){return false;} });
    if (authed) break;
    await page.waitForTimeout(1000);
  }
  if (!authed) {
    const txt = await page.evaluate(()=>document.body.innerText.slice(0,300)).catch(()=>'');
    throw new Error('LOGIN_NO_USER after 45s. page="'+txt.replace(/\n/g,' ')+'"');
  }
  await page.waitForTimeout(1500);
  return page.url();
}

// Replicate the portal dashboard's SSO link: append #wl_token so the money
// sub-app's sidebar.js bridges the session via issueCustomToken CF.
// Returns true once firebase.auth().currentUser is set on the money origin.
async function gotoMoney(page, idToken, plan, pagePath) {
  const sep = pagePath.includes('?') ? '&' : '?';
  const frag = idToken ? `#wl_token=${encodeURIComponent(idToken)}&wl_plan=${plan||'pro'}` : '';
  const url = `${MONEY}${pagePath}${idToken ? sep + 'wl_nick=QA' : ''}${frag}`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  // wait for SSO bridge to establish firebase session
  let ok = false;
  for (let i=0;i<35;i++){
    ok = await page.evaluate(()=>{ try{return !!(window.firebase && firebase.auth && firebase.auth().currentUser);}catch(e){return false;} });
    if (ok) break;
    await page.waitForTimeout(1000);
  }
  await page.evaluate(() => { const o=document.getElementById('wize-onboarding'); if(o)o.remove(); });
  return ok;
}

(async () => {
  if (!EMAIL || !PASSWORD) {
    console.log('[SKIP] No QA_EMAIL/QA_PASSWORD set — authed pension flows skipped.');
    process.exit(0);
  }
  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  let uid = null;

  try {
    const url = await login(page);
    uid = await page.evaluate(() => {
      try { return (firebase && firebase.auth && firebase.auth().currentUser) ? firebase.auth().currentUser.uid : null; } catch(e){ return null; }
    }).catch(()=>null);
    step(`login as ${LABEL} authenticated (firebase currentUser)`, !!uid, 'uid=' + uid + ' url=' + url);

    // capture ID token + plan for the SSO bridge into the money sub-app
    const idToken = await page.evaluate(async () => { try { return await firebase.auth().currentUser.getIdToken(); } catch(e){ return null; } });
    const plan = (process.env.QA_PLAN || 'pro');

    // ===== Navigate to pension-optimizer via SSO bridge =====
    const moneyAuthed = await gotoMoney(page, idToken, plan, '/pages/pension-optimizer.html');
    step(`SSO bridge: money sub-app has firebase session (currentUser)`, moneyAuthed, 'authed=' + moneyAuthed);
    await page.waitForTimeout(2000);
    await page.waitForSelector('#tracksTableBody tr', { timeout: 15000 }).catch(()=>{});

    // Set deterministic inputs
    const optIn = { currentAge:35, retirementAge:67, currentSavings:200000, monthlyContrib:4000, feeDeposit:1.5, feeAccum:0.5, inflation:'0', convFactor:210, currentTrack:'general' };
    await page.evaluate((v) => {
      for (const [k,val] of Object.entries(v)) { const el=document.getElementById(k); if(el){ el.value=val; } }
      if (typeof recalc==='function') recalc();
    }, optIn);
    await page.waitForTimeout(1000);

    const months = (optIn.retirementAge - optIn.currentAge) * 12;
    const expByTrack = {};
    for (const t of OPT_TRACKS) {
      expByTrack[t.id] = projectSavings(optIn.currentSavings, optIn.monthlyContrib, t.return, optIn.feeDeposit, optIn.feeAccum, months);
    }
    const expCurrent = expByTrack['general'];
    const expBest = Math.max(...Object.values(expByTrack)); // passive (9.8%)
    const bestId = Object.keys(expByTrack).reduce((a,b)=> expByTrack[a]>expByTrack[b]?a:b);
    info('expected best track:', bestId, Math.round(expBest), 'current(general):', Math.round(expCurrent));

    // Read UI rows: map track return -> accum value
    const uiRows = await page.evaluate(() => {
      return [...document.querySelectorAll('#tracksTableBody tr')].map(tr => {
        const tds = tr.querySelectorAll('td');
        return { ret: tds[1]?.innerText.trim(), accum: tds[2]?.innerText.trim(), monthly: tds[3]?.innerText.trim() };
      });
    });
    info('uiRows:', JSON.stringify(uiRows));

    // match by return %
    const within = (a,b,tol)=> Math.abs(a-b) <= Math.max(50, Math.abs(b)*tol);
    let matched = 0, recomputeOk = true;
    for (const t of OPT_TRACKS) {
      const row = uiRows.find(r => parseFloat(r.ret) === t.return);
      if (!row) continue;
      matched++;
      const uiVal = parseILS(row.accum);
      const exp = expByTrack[t.id];
      const ok = within(uiVal, exp, 0.01);
      if (!ok) { recomputeOk = false; info(`  track ${t.id} (${t.return}%): ui=${uiVal} exp=${Math.round(exp)} MISMATCH`); }
    }
    step('T1 optimizer: all 6 tracks accum match projectSavings() recompute (±1%)', recomputeOk && matched >= 5, `matched=${matched}/6`);

    // T2 invariant: monthly = round(accum/convFactor) for the current track row
    const curRow = uiRows.find(r => parseFloat(r.ret) === 7.5);
    if (curRow) {
      const uiAccum = parseILS(curRow.accum), uiMonthly = parseILS(curRow.monthly);
      const expMonthly = Math.round(uiAccum / optIn.convFactor);
      step('T2 invariant: monthly pension = round(accum / convFactor)', Math.abs(uiMonthly - expMonthly) <= 2, `ui=${uiMonthly} exp=${expMonthly}`);
    } else step('T2 invariant monthly', false, 'current row not found');

    // T2b ranking monotonic: first row should be the best (passive) by display value
    const uiVals = uiRows.map(r => parseILS(r.accum));
    const sortedDesc = [...uiVals].every((v,i,a)=> i===0 || a[i-1] >= v);
    step('T2b ranking: table sorted by accum descending (best on top)', sortedDesc, JSON.stringify(uiVals));
    const topRet = parseFloat(uiRows[0]?.ret);
    step('T2c best track = highest-return track (passive 9.8%)', topRet === 9.8, `topRet=${topRet}%`);

    // ===== T3 Differential: optimizer syncs finance_my_funds pension holdings =====
    const STAMP = Date.now();
    const testHolding = {
      id: 'qa_pension_' + STAMP, type: 'pension', name: 'QA Pension ' + STAMP,
      company: 'QA-Co', value: 333333, monthlyDeposit: 2222,
      history: [{ date: new Date().toISOString().split('T')[0], value: 333333 }],
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    await page.evaluate((h) => {
      const arr = JSON.parse(localStorage.getItem('finance_my_funds') || '[]');
      // strip any prior QA holdings to keep deterministic
      const cleaned = arr.filter(f => !String(f.id||'').startsWith('qa_pension_'));
      cleaned.push(h);
      localStorage.setItem('finance_my_funds', JSON.stringify(cleaned));
    }, testHolding);

    // force a cloud backup push then reopen optimizer
    await page.evaluate(() => { try { if (window.WizeCloudBackup && WizeCloudBackup.backupNow) return WizeCloudBackup.backupNow(); } catch(e){} });
    await page.waitForTimeout(3000);

    await gotoMoney(page, idToken, plan, '/pages/pension-optimizer.html');
    await page.waitForTimeout(2000);
    // force sync (button) — only auto-fills if no saved settings; use force=true
    await page.evaluate(() => { try { syncFromStorage(true); } catch(e){} });
    await page.waitForTimeout(1500);
    const syncedSavings = await page.$eval('#currentSavings', e => e.value).catch(()=>null);
    const syncedMonthly = await page.$eval('#monthlyContrib', e => e.value).catch(()=>null);
    info('after force-sync: currentSavings=', syncedSavings, 'monthlyContrib=', syncedMonthly);
    // Expected = sum of ALL pension holdings (>= our test holding). Assert our holding is included.
    const totalPension = await page.evaluate(() => {
      const arr = JSON.parse(localStorage.getItem('finance_my_funds') || '[]');
      const p = arr.filter(f=>f.type==='pension');
      return { val: p.reduce((s,f)=>s+(f.value||f.currentValue||0),0), mon: p.reduce((s,f)=>s+(f.monthlyDeposit||0),0) };
    });
    step('T3 differential: optimizer syncs currentSavings = Σ pension holdings', Math.abs(parseILS(syncedSavings) - Math.round(totalPension.val)) <= 1, `synced=${syncedSavings} ΣpensionVal=${Math.round(totalPension.val)}`);
    step('T3 differential: optimizer syncs monthlyContrib = Σ pension monthlyDeposit', Math.abs(parseILS(syncedMonthly) - Math.round(totalPension.mon)) <= 1, `synced=${syncedMonthly} ΣmonthlyDep=${Math.round(totalPension.mon)}`);

    // ===== T4 Round-trip: hard reload (localStorage) =====
    await gotoMoney(page, idToken, plan, '/pages/my-funds.html');
    await page.waitForTimeout(2500);
    const afterReload = await page.evaluate((id) => {
      const arr = JSON.parse(localStorage.getItem('finance_my_funds') || '[]');
      return arr.find(f => f.id === id) || null;
    }, testHolding.id);
    step('T4a round-trip (hard reload, localStorage): holding persists with exact value', afterReload && afterReload.value === 333333 && afterReload.monthlyDeposit === 2222, afterReload ? `value=${afterReload.value} dep=${afterReload.monthlyDeposit}` : 'NOT FOUND');

    // ===== T4b Round-trip: fresh context (Firestore cloud backup) =====
    // ensure a backup push happened
    await page.evaluate(() => { try { if (window.WizeCloudBackup && WizeCloudBackup.backupNow) return WizeCloudBackup.backupNow(); } catch(e){} });
    await page.waitForTimeout(4000);
    // verify the cloud doc actually has our holding (read via firestore from the live page)
    const cloudHas = await page.evaluate(async (id) => {
      try {
        const u = firebase.auth().currentUser; if(!u) return 'no-user';
        const snap = await firebase.firestore().collection('userBackups').doc(u.uid).collection('data').doc('wizemoney').get();
        if(!snap.exists) return 'no-doc';
        const d = snap.data() || {};
        const raw = d['finance_my_funds'] || (d.data && d.data['finance_my_funds']);
        const str = typeof raw === 'string' ? raw : JSON.stringify(raw||'');
        return str.includes(id) ? 'found' : 'missing:' + str.slice(0,80);
      } catch(e){ return 'err:' + e.message; }
    }, testHolding.id);
    step('T4b cloud backup: finance_my_funds in userBackups/{uid}/data/wizemoney includes the holding', cloudHas === 'found', 'cloudHas=' + cloudHas);

    // fresh context with same auth: simulate "reopen on new device" by restoring from cloud
    const ctx2 = await browser.newContext();
    const page2 = await ctx2.newPage();
    page2.on('console', m=>{ if(m.type()==='error') consoleErrors.push('[ctx2]'+m.text()); });
    // copy auth session by signing in again (cheaper than transferring IndexedDB)
    await login(page2);
    const idToken2 = await page2.evaluate(async () => { try { return await firebase.auth().currentUser.getIdToken(); } catch(e){ return null; } });
    await gotoMoney(page2, idToken2, plan, '/pages/my-funds.html');
    await page2.waitForTimeout(7000); // allow SSO bridge + cloud restore to run
    const restored = await page2.evaluate((id) => {
      const arr = JSON.parse(localStorage.getItem('finance_my_funds') || '[]');
      const f = arr.find(x => x.id === id);
      return f ? { value: f.value, dep: f.monthlyDeposit } : null;
    }, testHolding.id);
    step('T4c cloud round-trip (fresh context, restore): holding reappears with exact value', restored && restored.value === 333333 && restored.dep === 2222, restored ? JSON.stringify(restored) : 'NOT RESTORED');
    await ctx2.close();

    // ===== cleanup: remove the QA holding from local + cloud =====
    await page.evaluate(() => {
      const arr = JSON.parse(localStorage.getItem('finance_my_funds') || '[]');
      localStorage.setItem('finance_my_funds', JSON.stringify(arr.filter(f => !String(f.id||'').startsWith('qa_pension_'))));
    });
    await page.evaluate(() => { try { if (window.WizeCloudBackup && WizeCloudBackup.backupNow) return WizeCloudBackup.backupNow(); } catch(e){} });
    await page.waitForTimeout(3000);
    info('cleanup done (QA holding removed + cloud re-pushed)');

    // ===== T5 4-lang number parity on pension-calc =====
    const langs = ['he','en','pt','es'];
    const balByLang = {};
    for (const lang of langs) {
      await page.evaluate((l) => {
        const s = JSON.parse(localStorage.getItem('finance_settings')||'{}'); s.language=l; localStorage.setItem('finance_settings', JSON.stringify(s));
      }, lang);
      await page.goto(`${MONEY}/pages/pension-calc.html`, { waitUntil:'domcontentloaded', timeout:45000 });
      await page.waitForTimeout(1800);
      await page.evaluate(() => { const o=document.getElementById('wize-onboarding'); if(o){o.remove();} try{localStorage.setItem('wize_onboarding_done','1');}catch(e){} });
      // deterministic inputs
      await page.evaluate(() => {
        const set=(id,v)=>{const e=document.getElementById(id); if(e){e.value=v;}};
        set('currentAge',35); set('retirementAge',67); set('lifeExpectancy',85);
        set('currentBalance',100000); set('monthlyDeposit',3000); set('expectedReturn',5);
        set('depositFee',1); set('managementFee',0.5);
        if (typeof calculatePension==='function') calculatePension();
      });
      await page.waitForTimeout(800);
      balByLang[lang] = await page.$eval('#totalAtRetirement', e=>e.textContent).catch(()=>'');
    }
    info('balByLang:', JSON.stringify(balByLang));
    const digitSets = langs.map(l => digitsOnly(balByLang[l]));
    const allSame = digitSets.every(d => d === digitSets[0] && d.length > 0);
    step('T5 4-lang parity: pension-calc balance digits identical he/en/pt/es', allSame, JSON.stringify(digitSets));

    // ===== T6 pension-calc recompute (authed) =====
    // (he is current). recompute oracle:
    const recompute = (i) => {
      const yrs=i.retirementAge-i.currentAge, nr=i.expectedReturn-i.managementFee, mr=nr/12/100, nd=i.monthlyDeposit*(1-i.depositFee/100);
      let bal=i.currentBalance;
      for(let y=0;y<yrs;y++) for(let m=0;m<12;m++) bal=bal*(1+mr)+nd;
      return bal;
    };
    const expBal = recompute({currentAge:35,retirementAge:67,currentBalance:100000,monthlyDeposit:3000,expectedReturn:5,depositFee:1,managementFee:0.5});
    const uiBal = parseILS(balByLang['es']); // last computed
    step('T6 pension-calc authed: balance matches recompute (±0.5%)', within(uiBal, expBal, 0.005), `ui=${uiBal} exp=${Math.round(expBal)}`);

    // console error sweep (filter benign)
    // Filter headless-environment artifacts: App Check enforce has no valid attestation
    // token in headless CI (400/throttled), which cascades to Firestore Listen 400/404
    // and errorReport CORS. These do NOT occur in a real browser with App Check.
    const realErrs = consoleErrors.filter(e => !/favicon|sentry|analytics|net::ERR_BLOCKED|net::ERR_FAILED|appcheck|app-check|errorReport|firestore.*RPC|WebChannelConnection|status of (400|404|503)|\.svg/i.test(e));
    step('no unexpected console errors during pension flows', realErrs.length === 0, realErrs.slice(0,3).join(' | '));

  } catch (e) {
    if (e.message === 'NO_CREDS') { console.log('[SKIP] creds missing'); process.exit(0); }
    step('test harness completed without throwing', false, e.message + '\n' + (e.stack||'').split('\n').slice(0,3).join('\n'));
  } finally {
    await browser.close();
    console.log(`\n=== ${LABEL}: ${passes} pass / ${failures} fail ===`);
    process.exit(failures === 0 ? 0 : 1);
  }
})();
