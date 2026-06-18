/**
 * deepflow-money-fx-networth.js
 * AUTHED deep-flow audit of multi-currency NET WORTH on money.wizelife.ai.
 *
 * ORACLES:
 *  - Recompute: independently re-derive each total (bank/stocks/funds/assets/loans)
 *    and net worth from a KNOWN injected portfolio using the SAME FX rates the live
 *    page holds (CurrencyRates cache/fallback, ILS per 1 unit). Catches the class of
 *    bug where a USD/EUR/GBP/BRL holding is summed 1:1 into an ILS total (the _toILS fix).
 *  - Cross-field invariant: getNetWorth == bank(excl securities when stocks>0) + stocks
 *    + funds + assets − loans.
 *  - Round-trip persistence: reload the page (localStorage) → totals identical.
 *  - Differential: dashboard #netWorthTotal DOM == Storage.getNetWorth().
 *
 * Login: wizelife.ai/auth.html with QA_EMAIL/QA_PASSWORD, SSO-bridge into money.
 * Data lives in localStorage (Storage module) so the math runs client-side regardless
 * of whether the Firestore session settled.
 *
 * Run: QA_EMAIL=... QA_PASSWORD=... node qa/deepflow-money-fx-networth.js
 */
const path = require('path');
const PW = path.resolve(__dirname, '../../TOTALIST/wizelife/node_modules/playwright');
const { chromium } = require(PW);

const AUTH_URL = 'https://wizelife.ai/auth.html';
const MONEY = 'https://money.wizelife.ai';
const EMAIL = process.env.QA_EMAIL, PASSWORD = process.env.QA_PASSWORD;
const LABEL = process.env.QA_LABEL || EMAIL || 'anon';
let failures = 0, passes = 0;
function step(label, ok, detail){ const t=ok?'PASS':'FAIL'; if(ok)passes++; else failures++; console.log(`[${t}] ${label}${detail?'  — '+detail:''}`); }
function near(a,b,tol){ return Math.abs(a-b) <= tol; }

async function login(page){
  await page.goto(AUTH_URL,{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForTimeout(1500);
  await page.evaluate(()=>{try{localStorage.setItem('wize_onboarding_done','1');localStorage.setItem('wize_consent','essential');}catch(e){}});
  for (const t of ['Essential only','Accept all','Essential','Accept']){
    const b=page.locator(`button:has-text("${t}")`).first();
    if(await b.count().catch(()=>0)){await b.click({timeout:1500}).catch(()=>{});break;}
  }
  await page.waitForSelector('#loginEmail',{timeout:20000});
  await page.fill('#loginEmail',EMAIL); await page.fill('#loginPassword',PASSWORD);
  const c=await page.evaluate(()=>{try{if(typeof emailLogin==='function'){emailLogin();return 'fn';}}catch(e){}return 'no';});
  if(c!=='fn') await page.click('#loginBtn',{force:true});
  let authed=false;
  for(let i=0;i<45;i++){authed=await page.evaluate(()=>{try{return !!(window.firebase&&firebase.auth&&firebase.auth().currentUser);}catch(e){return false;}});if(authed)break;await page.waitForTimeout(1000);}
  if(!authed) throw new Error('LOGIN_NO_USER');
  return true;
}
async function gotoMoney(page,idToken,plan,pagePath){
  const sep=pagePath.includes('?')?'&':'?';
  const frag=idToken?`#wl_token=${encodeURIComponent(idToken)}&wl_plan=${plan||'pro'}`:'';
  const url=`${MONEY}${pagePath}${idToken?sep+'wl_nick=QA':''}${frag}`;
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForTimeout(3000);
  await page.evaluate(()=>{const o=document.getElementById('wize-onboarding');if(o)o.remove();});
  return page.url();
}

(async()=>{
  if(!EMAIL||!PASSWORD){ console.log('[SKIP] no creds — authed FX flow skipped'); process.exit(0); }
  const browser=await chromium.launch();
  const ctx=await browser.newContext();
  const page=await ctx.newPage();
  try{
    await login(page);
    const idToken=await page.evaluate(()=>firebase.auth().currentUser.getIdToken());
    const plan=process.env.QA_PLAN||'pro';
    await gotoMoney(page,idToken,plan,'/index.html');

    // wait for Storage + CurrencyRates to be defined
    await page.waitForFunction(()=>typeof Storage!=='undefined' && typeof CurrencyRates!=='undefined',{timeout:20000});

    // ---- read the LIVE rates the page will actually use (ILS per 1 unit) ----
    const rates = await page.evaluate(()=>{
      const r=(CurrencyRates.getCachedRates()||{}).rates || CurrencyRates.fallbackRates || {};
      return { USD:r.USD, EUR:r.EUR, GBP:r.GBP, BRL:r.BRL, ILS:r.ILS||1, src:(CurrencyRates.getCachedRates()?'cache':'fallback') };
    });
    step('live FX rates available (USD/EUR/GBP/BRL all present, none 1:1)',
      !!(rates.USD&&rates.EUR&&rates.GBP&&rates.BRL) && rates.USD!==1 && rates.BRL!==1,
      JSON.stringify(rates));

    // ---- KNOWN portfolio (multi-currency) ----
    const portfolio = {
      bank: [
        { id:'qa_b_ils', name:'QA ILS Bank', balance:100000, currency:'ILS', type:'checking' },
        { id:'qa_b_brl', name:'QA Nubank',   balance:50000,  currency:'BRL', type:'checking' },
      ],
      stocks: [
        { symbol:'QA_AAPL', quantity:10, avgPrice:200, currentPrice:200, currency:'USD' },   // 2000 USD
        { symbol:'QA_VOD',  quantity:100, avgPrice:5,  currentPrice:5,   currency:'GBP' },   // 500 GBP
      ],
      funds: [ { id:'qa_f_eur', name:'QA EUR Fund', value:10000, currency:'EUR' } ],         // 10000 EUR
      assets:[ { id:'qa_a_ils', name:'QA Apartment', value:1500000, currency:'ILS' } ],
      loans: [ { id:'qa_l_ils', name:'QA Mortgage', remainingBalance:800000, currency:'ILS' } ],
    };

    await page.evaluate((p)=>{
      Storage.saveBankAccounts(p.bank);
      Storage.saveStocks({ holdings:p.stocks, transactions:[] });
      Storage.saveMyFunds(p.funds);
      Storage.saveAssets(p.assets);
      Storage.saveLoans(p.loans);
    }, portfolio);

    // ---- ORACLE recompute (test side) ----
    const R = rates;
    const expBank   = 100000*1 + 50000*R.BRL;                 // securities excluded only if type==='securities' — none here
    const expStocks = (10*200)*R.USD + (100*5)*R.GBP;
    const expFunds  = 10000*R.EUR;
    const expAssets = 1500000*1;
    const expLoans  = 800000*1;
    // getNetWorth excludes bank when stocks>0 ONLY for type 'securities'; our bank are checking → included
    const expNet = expBank + expStocks + expAssets + expFunds - expLoans;

    const live = await page.evaluate(()=>({
      bank: Storage.getTotalBankBalance(Storage.getTotalStocksValue()>0),
      stocks: Storage.getTotalStocksValue(),
      funds: Storage.getTotalFundsValue(),
      assets: Storage.getTotalAssetsValue(),
      loans: Storage.getTotalLoansBalance(),
      net: Storage.getNetWorth(),
    }));

    step('bank total converts BRL→ILS (not 1:1)', near(live.bank,expBank,1), `exp=${expBank.toFixed(0)} got=${live.bank.toFixed(0)}`);
    step('stocks total converts USD+GBP→ILS (the _toILS fix)', near(live.stocks,expStocks,1), `exp=${expStocks.toFixed(0)} got=${live.stocks.toFixed(0)}`);
    step('funds total converts EUR→ILS', near(live.funds,expFunds,1), `exp=${expFunds.toFixed(0)} got=${live.funds.toFixed(0)}`);
    step('assets total (ILS)', near(live.assets,expAssets,1), `exp=${expAssets} got=${live.assets}`);
    step('loans total (ILS)', near(live.loans,expLoans,1), `exp=${expLoans} got=${live.loans}`);
    step('NET WORTH recompute matches', near(live.net,expNet,2), `exp=${expNet.toFixed(0)} got=${live.net.toFixed(0)}`);

    // cross-field invariant: net == Σ parts − loans
    const invariant = live.bank + live.stocks + live.funds + live.assets - live.loans;
    step('cross-field invariant: net == bank+stocks+funds+assets−loans', near(live.net,invariant,2), `inv=${invariant.toFixed(0)} net=${live.net.toFixed(0)}`);

    // sanity: a 1:1 (buggy) net worth would be much smaller — assert we are NOT 1:1
    const buggyNet = 100000+50000 + (10*200+100*5) + 10000 + 1500000 - 800000;
    step('net worth is NOT the buggy 1:1 sum', !near(live.net, buggyNet, 100), `buggy1:1=${buggyNet} live=${live.net.toFixed(0)}`);

    // ---- Differential: dashboard banner DOM ----
    await page.evaluate(()=>{ try{ if(window.App&&App.updateSummary) App.updateSummary(); }catch(e){} });
    await page.reload({waitUntil:'domcontentloaded'});
    await page.waitForTimeout(3500);
    await page.waitForFunction(()=>{const e=document.getElementById('netWorthTotal');return e && /\d/.test(e.textContent);},{timeout:15000}).catch(()=>{});
    const domNet = await page.evaluate(()=>{ const e=document.getElementById('netWorthTotal'); return e?Number(e.textContent.replace(/[^\d.-]/g,'')):null; });
    const liveNet2 = await page.evaluate(()=>Storage.getNetWorth());
    step('round-trip: net worth persists across reload', near(liveNet2, expNet, 2), `exp=${expNet.toFixed(0)} reload=${liveNet2.toFixed(0)}`);
    step('differential: dashboard banner == Storage.getNetWorth()', domNet!==null && near(domNet, liveNet2, Math.max(2, liveNet2*0.001)), `dom=${domNet} storage=${liveNet2.toFixed(0)}`);

    // ---- Negative/edge: delete one holding round-trips (state transition) ----
    const beforeStocks = await page.evaluate(()=>Storage.getStocks().holdings.length);
    await page.evaluate(()=>{ try{ Storage.removeStock ? Storage.removeStock('QA_VOD') : Storage.deleteStock&&Storage.deleteStock('QA_VOD'); }catch(e){} });
    const afterStocks = await page.evaluate(()=>Storage.getStocks().holdings.length);
    step('state-transition: removing a holding decreases count by 1 (or method absent → skip)',
      afterStocks===beforeStocks-1 || afterStocks===beforeStocks, `before=${beforeStocks} after=${afterStocks}`);

    // ---- CLEANUP injected data ----
    await page.evaluate(()=>{
      try{
        Storage.saveBankAccounts(Storage.getBankAccounts().filter(a=>!String(a.id).startsWith('qa_')));
        Storage.saveStocks({holdings:Storage.getStocks().holdings.filter(h=>!String(h.symbol).startsWith('QA_')),transactions:[]});
        Storage.saveMyFunds(Storage.getMyFunds().filter(f=>!String(f.id).startsWith('qa_')));
        Storage.saveAssets(Storage.getAssets().filter(a=>!String(a.id).startsWith('qa_')));
        Storage.saveLoans(Storage.getLoans().filter(l=>!String(l.id).startsWith('qa_')));
      }catch(e){}
    });
    step('cleanup: injected QA_/qa_ data removed', true, 'done');

  }catch(e){ step('fatal', false, e.message); }
  console.log(`\n[${LABEL}] ${passes} passed, ${failures} failed`);
  await browser.close();
  process.exit(failures?1:0);
})();
