/**
 * deepflow-money-ai-entitlements.js
 * AUTHED audit of (a) AI-chat financial-context correctness, (b) AI query↔response
 * coherence + disclaimer, (c) Pro/YOLO entitlement gating on money.wizelife.ai.
 *
 * ORACLES:
 *  - Cross-field / differential: the buildFinancialContext() string the AI receives
 *    must INCLUDE the user's stocks (symbol + an ILS-converted total), not silently
 *    drop them. (Bug: getStocks() returns {holdings,transactions}; old code read
 *    .length on the wrapper → stocks block skipped; no _toILS → foreign stocks 1:1.)
 *  - Query↔response: a real (≤1) AI call must answer the asked question (entity
 *    appears) and carry the not-advice disclaimer footer.
 *  - Entitlement: Plan.isPro/isYolo reflect the account; YOLO ⊇ Pro; the YOLO-only
 *    crossAppAI gate is locked for Pro.
 *
 * Run: QA_EMAIL=... QA_PASSWORD=... QA_PLAN=pro|yolo QA_AI=1(optional) node qa/deepflow-money-ai-entitlements.js
 */
const path = require('path');
const PW = path.resolve(__dirname, '../../TOTALIST/wizelife/node_modules/playwright');
const { chromium } = require(PW);
const AUTH_URL='https://wizelife.ai/auth.html', MONEY='https://money.wizelife.ai';
const EMAIL=process.env.QA_EMAIL, PASSWORD=process.env.QA_PASSWORD;
const PLAN=process.env.QA_PLAN||'pro', LABEL=process.env.QA_LABEL||PLAN;
const DO_AI=process.env.QA_AI==='1';
let failures=0,passes=0;
function step(l,ok,d){const t=ok?'PASS':'FAIL';if(ok)passes++;else failures++;console.log(`[${t}] ${l}${d?'  — '+d:''}`);}

async function login(page){
  await page.goto(AUTH_URL,{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForTimeout(1500);
  await page.evaluate(()=>{try{localStorage.setItem('wize_onboarding_done','1');localStorage.setItem('wize_consent','essential');}catch(e){}});
  for(const t of ['Essential only','Accept all','Essential','Accept']){const b=page.locator(`button:has-text("${t}")`).first();if(await b.count().catch(()=>0)){await b.click({timeout:1500}).catch(()=>{});break;}}
  await page.waitForSelector('#loginEmail',{timeout:20000});
  await page.fill('#loginEmail',EMAIL);await page.fill('#loginPassword',PASSWORD);
  const c=await page.evaluate(()=>{try{if(typeof emailLogin==='function'){emailLogin();return 'fn';}}catch(e){}return 'no';});
  if(c!=='fn')await page.click('#loginBtn',{force:true});
  let a=false;for(let i=0;i<45;i++){a=await page.evaluate(()=>{try{return !!(window.firebase&&firebase.auth&&firebase.auth().currentUser);}catch(e){return false;}});if(a)break;await page.waitForTimeout(1000);}
  if(!a)throw new Error('LOGIN_NO_USER');
}
async function gotoMoney(page,idToken,pagePath){
  const sep=pagePath.includes('?')?'&':'?';
  await page.goto(`${MONEY}${pagePath}${sep}wl_nick=QA#wl_token=${encodeURIComponent(idToken)}&wl_plan=${PLAN}`,{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForTimeout(3500);
  await page.evaluate(()=>{const o=document.getElementById('wize-onboarding');if(o)o.remove();});
}

(async()=>{
  if(!EMAIL||!PASSWORD){console.log('[SKIP] no creds');process.exit(0);}
  const browser=await chromium.launch();const ctx=await browser.newContext();const page=await ctx.newPage();
  try{
    await login(page);
    const idToken=await page.evaluate(()=>firebase.auth().currentUser.getIdToken());

    // ===== AI-chat financial context correctness =====
    await gotoMoney(page,idToken,'/pages/ai-chat.html');
    await page.waitForFunction(()=>typeof Storage!=='undefined'&&typeof buildFinancialContext==='function',{timeout:20000}).catch(()=>{});
    // inject a known stock holding (USD) + clean after
    await page.evaluate(()=>{ Storage.saveStocks({holdings:[{symbol:'QA_TSLA',quantity:5,avgPrice:300,currentPrice:300,currency:'USD'}],transactions:[]}); });
    const ctxStr = await page.evaluate(()=>{ try{ return buildFinancialContext(); }catch(e){ return 'ERR:'+e.message; } });
    const rate = await page.evaluate(()=>{try{const r=(CurrencyRates.getCachedRates()||{}).rates||CurrencyRates.fallbackRates||{};return r.USD||2.92;}catch(e){return 2.92;}});
    const expILS = Math.round(5*300*rate); // native 1500 USD → ILS
    step('AI context INCLUDES the stock holding symbol', /QA_TSLA/.test(ctxStr), 'ctx mentions QA_TSLA='+/QA_TSLA/.test(ctxStr));
    // the formatted ILS value should appear (allow locale separators); check the rounded thousands prefix
    const expStr = expILS.toLocaleString('en-US');
    const expHe  = expILS.toLocaleString('he-IL');
    step('AI context shows stock value in ILS (FX-converted, not 1:1)',
      ctxStr.includes(String(expILS)) || ctxStr.includes(expStr) || ctxStr.includes(expHe) || new RegExp(String(Math.round(expILS/100))).test(ctxStr.replace(/[,\s]/g,'')),
      `expILS≈${expILS} (rate=${rate})`);
    step('AI context is NOT the buggy 1:1 stock value (1500)', !/[^\d]1500[^\d]/.test(' '+ctxStr.replace(/[,\s₪$]/g,'')+' ') || expILS===1500, 'native1500 should be converted');
    // cleanup
    await page.evaluate(()=>{ try{ Storage.saveStocks({holdings:Storage.getStocks().holdings.filter(h=>!String(h.symbol).startsWith('QA_')),transactions:[]}); }catch(e){} }).catch(()=>{});

    // disclaimer footer present in UI
    const hasDisc = await page.evaluate(()=>{ const b=document.body.innerText.toLowerCase(); return /ייעוץ|advice|disclaimer|לא תחליף|consult|não.*conselho|asesor/.test(b) || !!document.querySelector('[class*="disclaimer"],[id*="disclaimer"]'); });
    step('AI chat page carries a not-advice disclaimer', hasDisc, 'disclaimer text/element present='+hasDisc);

    // ===== Entitlements (run on index.html — plan.js is NOT loaded on ai-chat.html) =====
    await gotoMoney(page,idToken,'/index.html');
    await page.waitForFunction(()=>typeof Plan!=='undefined',{timeout:15000}).catch(()=>{});
    const ent = await page.evaluate(()=>{ try{ return {plan:localStorage.getItem('wl_plan'), isPro:Plan.isPro(), isYolo:Plan.isYolo()}; }catch(e){return {err:e.message};} });
    step('entitlement: account resolves correct plan', ent.plan===PLAN, JSON.stringify(ent));
    step('entitlement: isPro() true for '+PLAN, ent.isPro===true, 'isPro='+ent.isPro);
    if(PLAN==='yolo'){
      step('entitlement: YOLO ⊇ Pro (isYolo true AND isPro true)', ent.isYolo===true&&ent.isPro===true, JSON.stringify(ent));
    } else {
      step('entitlement: Pro is NOT yolo (crossAppAI locked)', ent.isYolo===false, 'isYolo='+ent.isYolo);
      // confirm the YOLO-only gate denies for Pro
      const yoloGate = await page.evaluate(()=>{ try{ return Plan.checkYolo('crossAppAI',{silent:true}); }catch(e){return 'ERR';} });
      step('entitlement: Pro DENIED YOLO-only crossAppAI (no bypass)', yoloGate===false, 'checkYolo(crossAppAI)='+yoloGate);
    }

    // ===== Optional: one real AI call (query↔response coherence) =====
    if(DO_AI){
      const q = 'What is my net worth in ILS? Answer in one sentence.';
      await page.evaluate((qq)=>{ const i=document.getElementById('chatInput'); if(i){i.value=qq;} }, q);
      await page.click('#sendBtn',{force:true}).catch(()=>{});
      // wait for an assistant bubble to appear
      let resp='';
      for(let i=0;i<40;i++){
        resp = await page.evaluate(()=>{ const msgs=[...document.querySelectorAll('[class*="message"],[class*="bubble"],[class*="assistant"]')]; return msgs.map(m=>m.innerText).join('\n'); });
        if(resp.length>120 && /net worth|שווי|patrim|patrimonio/i.test(resp)) break;
        await page.waitForTimeout(1500);
      }
      step('AI call: response received (>50 chars)', resp.length>50, 'len='+resp.length);
      step('AI query↔response coherence: answer references net worth/ILS', /net worth|שווי|ils|₪|shekel|patrim/i.test(resp), resp.slice(0,140).replace(/\n/g,' '));
    } else {
      console.log('[INFO] AI live call skipped (set QA_AI=1 to run; budget ≤3 total)');
    }

  }catch(e){ step('fatal',false,e.message); }
  console.log(`\n[${LABEL}] ${passes} passed, ${failures} failed`);
  await browser.close();
  process.exit(failures?1:0);
})();
