/**
 * Firebase Functions — PayPal Webhook Handler
 * Project: finzilla-7f1f9 (FinSight)
 *
 * Secrets (set via firebase functions:secrets:set):
 *   PAYPAL_CLIENT_ID, PAYPAL_SECRET, PAYPAL_WEBHOOK_ID
 *
 * PayPal Dashboard → Webhooks → endpoint:
 *   https://us-central1-finzilla-7f1f9.cloudfunctions.net/paypalWebhook
 */

// firebase-functions v6: the v1 (Gen-1) API used throughout this file
// (functions.https.onCall((data, context)), functions.pubsub.schedule, .runWith,
// functions.https.HttpsError) now lives under the /v1 entrypoint. Importing it
// here preserves all existing behavior with no logic changes.
const functions        = require("firebase-functions/v1");
const { defineSecret } = require("firebase-functions/params");
const admin            = require("firebase-admin");
const https            = require("https");
const { Resend }       = require("resend");

admin.initializeApp();
const db = admin.firestore();

// ─── Referral reward helpers ──────────────────────────────────────────────────
// Tier rank — higher number = bigger benefit. Used so a YOLO reward isn't
// downgraded to PRO if the referrer is already on a higher plan.
const TIER_RANK = { free: 0, pro: 1, yolo: 2 };
const REWARD_DAYS = 30;

// Anti-hallucination guardrails — Phase 1 (free, ~200 tokens/req).
// Injected into every Gemini chat call's system_instruction. Phase 2 (RAG)
// and Phase 3 (self-verification) are intentionally NOT here.
const ANTI_HALLUCINATION_PREFIX = `GUARDRAILS (must follow):
1. If you don't know a fact for certain, say "I don't know — not in my data" (in user's language). Never guess numbers, dates, names, laws.
2. Every numerical claim must include a source tag: [verified DB], [user data], [web-search], or [provider].
3. Banned hedge words — do NOT use: approximately / around / roughly / probably / I believe / generally — and their he (בערך/סביב/לרוב/בדרך כלל/אני מאמין/למיטב ידיעתי), pt (aproximadamente/cerca de/geralmente), es (aproximadamente/alrededor/generalmente) equivalents. Use exact numbers or admit you don't know.
4. If confidence < 70%, start with "⚠️".
5. End advice with: "AI may make mistakes. Verify with a licensed professional before deciding." (translated).`;

/**
 * Award the referrer a 30-day bonus when `upgradedUid` first hits Pro/YOLO.
 * Idempotent — sets `referralRewardSent: true` on the upgraded user so it
 * never fires twice for the same upgrade. Safe to call from any code path
 * (validateCode, PayPal webhook, callable, etc).
 */
async function _grantReferrerReward(upgradedUid, newTier) {
    if (!upgradedUid || !["pro", "yolo"].includes(newTier)) return null;
    try {
        const upRef  = db.collection("users").doc(upgradedUid);
        const upSnap = await upRef.get();
        if (!upSnap.exists) return null;
        const u = upSnap.data();
        if (!u.referredBy) return null;
        if (u.referralRewardSent)  return null; // already credited

        const referrerRef = db.collection("users").doc(u.referredBy);
        await referrerRef.set({
            referralRewards: admin.firestore.FieldValue.arrayUnion({
                tier: newTier,
                days: REWARD_DAYS,
                from: upgradedUid,
                ts: Date.now(),
                applied: false,
            }),
            referralCount: admin.firestore.FieldValue.increment(1),
        }, { merge: true });

        await upRef.set({ referralRewardSent: true }, { merge: true });

        console.log(`🎁 referral reward queued: ${u.referredBy} +${REWARD_DAYS}d ${newTier} (from ${upgradedUid})`);

        // Apply the reward immediately (don't make the referrer wait until 03:00 UTC)
        try { await _applyOneUserRewards(referrerRef); } catch (e) { console.warn("immediate apply failed", e); }

        // Email the referrer with a thank-you + the gift they just got
        try { await _emailReferralBonus(u.referredBy, newTier, REWARD_DAYS); }
        catch (e) { console.warn("referral email failed", e); }

        return { rewarded: u.referredBy, tier: newTier, days: REWARD_DAYS };
    } catch (e) {
        console.warn("_grantReferrerReward failed", e);
        return null;
    }
}

/**
 * Email the referrer "your friend joined — you got X days of TIER".
 * Best-effort: reads RESEND_API_KEY secret. If not bound in runWith,
 * .value() throws and we silently skip — Firestore record still has the bonus.
 */
async function _emailReferralBonus(referrerUid, tier, days) {
    let resendKey;
    try { resendKey = RESEND_API_KEY.value(); } catch (e) { resendKey = ''; }
    if (!resendKey) {
        console.log('referral email skipped — RESEND_API_KEY not bound');
        return;
    }
    const userSnap = await db.collection('users').doc(referrerUid).get();
    if (!userSnap.exists) return;
    const u = userSnap.data() || {};
    const email = u.email
        || (u.profile && u.profile.email)
        || (await admin.auth().getUser(referrerUid).then(r => r.email).catch(() => null));
    if (!email) return;

    const lang = (u.lang || u.preferredLang || 'he').slice(0, 2);
    const TR = {
        he: { subject: '🎁 חבר שלך הצטרף — קיבלת ' + days + ' ימי ' + tier.toUpperCase() + ' חינם!', greet: 'יששש 🎉', body: 'חבר שהזמנת ל-WizeLife שדרג עכשיו, ובזכות זה — הוסף לך:', got: days + ' ימים של ' + tier.toUpperCase(), already: 'נשמר לחשבון שלך — יופעל אוטומטית אחרי תום המנוי הנוכחי.', cta: 'לאפליקציות שלי', sign: 'תודה על השיתוף,\nצוות WizeLife' },
        en: { subject: '🎁 Your friend joined — you got ' + days + ' free days of ' + tier.toUpperCase() + '!', greet: 'Yesss 🎉', body: 'A friend you invited to WizeLife just upgraded — that earned you:', got: days + ' days of ' + tier.toUpperCase(), already: 'Saved to your account — activates automatically when your current subscription ends.', cta: 'Open my apps', sign: 'Thanks for sharing,\nThe WizeLife Team' },
        pt: { subject: '🎁 Seu amigo entrou — você ganhou ' + days + ' dias grátis de ' + tier.toUpperCase() + '!', greet: 'Boa 🎉', body: 'Um amigo que você convidou para o WizeLife fez upgrade — você ganhou:', got: days + ' dias de ' + tier.toUpperCase(), already: 'Salvo na sua conta — ativa automaticamente quando a assinatura atual terminar.', cta: 'Abrir meus apps', sign: 'Obrigado por compartilhar,\nEquipe WizeLife' },
        es: { subject: '🎁 Tu amigo se unió — ¡ganaste ' + days + ' días gratis de ' + tier.toUpperCase() + '!', greet: '¡Genial! 🎉', body: 'Un amigo que invitaste a WizeLife actualizó — ganaste:', got: days + ' días de ' + tier.toUpperCase(), already: 'Guardado en tu cuenta — se activa automáticamente cuando termine tu suscripción actual.', cta: 'Abrir mis apps', sign: 'Gracias por compartir,\nEquipo WizeLife' },
    };
    const t = TR[lang] || TR.en;
    const accent = tier === 'yolo' ? '#f59e0b' : '#10b981';
    const html = `
<!DOCTYPE html><html lang="${lang}"><head><meta charset="UTF-8"><style>
body{font-family:Arial,sans-serif;background:#f4f4f8;margin:0;color:#1e293b}
.wrap{max-width:520px;margin:24px auto;background:#fff;border-radius:14px;padding:28px;box-shadow:0 2px 12px rgba(0,0,0,.08)}
h1{font-size:1.4rem;margin:0 0 12px;color:${accent}}
p{line-height:1.7;font-size:1rem}
.gift{background:linear-gradient(135deg,#fef3c7,#fde68a);border:1px solid #f59e0b;border-radius:10px;padding:16px 18px;margin:20px 0;text-align:center}
.gift-amount{font-size:1.4rem;font-weight:800;color:${accent};margin:6px 0}
.gift-note{font-size:.85rem;color:#64748b}
.cta{display:inline-block;margin-top:14px;background:#6366f1;color:#fff;padding:11px 22px;border-radius:99px;text-decoration:none;font-weight:700}
.foot{margin-top:24px;font-size:.85rem;color:#64748b;white-space:pre-line}
</style></head><body><div class="wrap">
  <h1>${t.greet}</h1>
  <p>${t.body}</p>
  <div class="gift">
    <div style="font-size:2rem;line-height:1">🎁</div>
    <div class="gift-amount">${t.got}</div>
    <div class="gift-note">${t.already}</div>
  </div>
  <a class="cta" href="https://wizelife.ai/dashboard.html">${t.cta} →</a>
  <div class="foot">${t.sign}</div>
</div></body></html>`;
    const resend = new Resend(resendKey);
    await resend.emails.send({
        from: 'WizeLife <noreply@wizelife.ai>',
        to: email,
        subject: t.subject,
        html,
    });
    console.log(`📨 referral bonus emailed → ${email}: +${days}d ${tier}`);
}

/**
 * Apply queued (unapplied) referral rewards onto the referrer's plan —
 * extends `planExpiresAt` by N days at the awarded tier. Marks each reward
 * `applied: true`. Run from a daily scheduled function.
 */
async function _applyOneUserRewards(userRef) {
    const snap = await userRef.get();
    if (!snap.exists) return 0;
    const u = snap.data();
    const rewards = Array.isArray(u.referralRewards) ? u.referralRewards : [];
    const pending = rewards.filter(r => r && !r.applied);
    if (!pending.length) return 0;

    let plan = u.plan || "free";
    let expiresAtMs = (u.planExpiresAt && u.planExpiresAt.toMillis) ? u.planExpiresAt.toMillis() : (u.planExpiresAt || 0);
    let now = Date.now();
    let applied = 0;

    for (const r of pending) {
        const tier = r.tier;
        if (!["pro", "yolo"].includes(tier)) continue;
        // Only upgrade plan if the bonus tier is >= current plan
        if (TIER_RANK[tier] >= TIER_RANK[plan] || expiresAtMs < now) {
            plan = TIER_RANK[tier] > TIER_RANK[plan] ? tier : plan;
        }
        const baseMs = Math.max(now, expiresAtMs || 0);
        expiresAtMs = baseMs + (r.days || REWARD_DAYS) * 24 * 60 * 60 * 1000;
        applied++;
    }

    if (!applied) return 0;

    // Mark all pending as applied — preserve any that were already applied
    const newRewards = rewards.map(r => (r && !r.applied) ? { ...r, applied: true, appliedAt: Date.now() } : r);

    await userRef.set({
        plan,
        planExpiresAt: admin.firestore.Timestamp.fromMillis(expiresAtMs),
        referralRewards: newRewards,
    }, { merge: true });

    console.log(`✅ applied ${applied} reward(s) for ${userRef.id} → ${plan} until ${new Date(expiresAtMs).toISOString()}`);
    return applied;
}

const GMAIL_EMAIL    = defineSecret("GMAIL_EMAIL");   // kept for legacy; not used for sending
const GMAIL_PASSWORD = defineSecret("GMAIL_APP_PASSWORD"); // kept for legacy
const RESEND_API_KEY  = defineSecret("RESEND_API_KEY");

const PAYPAL_CLIENT_ID  = defineSecret("PAYPAL_CLIENT_ID");
const PAYPAL_SECRET     = defineSecret("PAYPAL_SECRET");
const PAYPAL_WEBHOOK_ID = defineSecret("PAYPAL_WEBHOOK_ID");
const GEMINI_API_KEY    = defineSecret("GEMINI_API_KEY");
const ACCESS_CODES_SEC  = defineSecret("ACCESS_CODES");
const YOLO_CODES_SEC    = defineSecret("YOLO_ACCESS_CODES");
const TWELVE_DATA_KEY   = defineSecret("TWELVE_DATA_KEY");
const FINNHUB_KEY       = defineSecret("FINNHUB_KEY");
const ADMIN_TOKEN       = defineSecret("ADMIN_TOKEN");

// ─── Rate-limit helper ────────────────────────────────────────────────────────
// Tracks recent attempts per uid in /rate_limits/{key}_{uid}. Returns true if
// the call should be allowed, false if exceeded. Best-effort — never blocks
// success path on its own failure.
async function _rateLimit(key, uid, maxPerMin) {
    if (!uid) return true;
    const ref = db.collection('rate_limits').doc(key + '_' + uid);
    try {
        const now = Date.now();
        const windowStart = now - 60_000;
        const snap = await ref.get();
        let attempts = (snap.exists && Array.isArray(snap.data().attempts)) ? snap.data().attempts : [];
        attempts = attempts.filter(t => t > windowStart);
        if (attempts.length >= maxPerMin) {
            console.warn(`rate-limit hit: ${key}/${uid} (${attempts.length}/${maxPerMin})`);
            return false;
        }
        attempts.push(now);
        await ref.set({ attempts, lastAt: now }, { merge: true });
        return true;
    } catch (e) {
        console.warn('rate-limit lookup failed', e);
        return true; // fail-open so a Firestore hiccup doesn't lock users out
    }
}

// ─── PII scrubber for AI prompts ──────────────────────────────────────────────
// Replaces emails, Israeli ID numbers, phone numbers, and credit-card-like
// strings with placeholders before sending text to Gemini. Used by ai-proxy
// and the severity classifier so user-private data never leaves our backend
// in raw form.
function scrubPII(s) {
    if (!s || typeof s !== 'string') return s;
    return s
        .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, '[email]')
        .replace(/\b\d{9}\b/g, '[id]') // Israeli teudat zehut (9 digits)
        .replace(/\b\d{3}[- ]?\d{3}[- ]?\d{4}\b/g, '[phone]')
        .replace(/\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, '[card]');
}

// ─── Access Code Validation ───────────────────────────────────────────────────

exports.validateCode = functions
    .runWith({ secrets: [ACCESS_CODES_SEC, YOLO_CODES_SEC, RESEND_API_KEY] })
    .https.onCall(async (data, context) => {
        if (!context.auth) {
            throw new functions.https.HttpsError("unauthenticated", "יש להתחבר כדי לממש קוד");
        }

        // Require a verified email address before granting Pro/YOLO.
        // Stops attackers from creating throwaway accounts with fake email,
        // redeeming a leaked code, then never paying / verifying.
        if (!context.auth.token || !context.auth.token.email_verified) {
            throw new functions.https.HttpsError(
                "failed-precondition",
                "Please verify your email address first (check your inbox)."
            );
        }

        // Rate limit: max 5 redeem attempts per UID per minute (defends
        // against brute-forcing access codes).
        if (!(await _rateLimit('validateCode', context.auth.uid, 5))) {
            throw new functions.https.HttpsError("resource-exhausted", "Too many attempts. Wait a minute.");
        }

        const code = (data.code || "").trim().toUpperCase();
        if (!code) throw new functions.https.HttpsError("invalid-argument", "קוד נדרש");

        const yoloCodes = new Set(
            (YOLO_CODES_SEC.value() || "")
                .split(",")
                .map(c => c.trim().toUpperCase())
                .filter(Boolean)
        );

        const proCodes = new Set(
            (ACCESS_CODES_SEC.value() || "")
                .split(",")
                .map(c => c.trim().toUpperCase())
                .filter(Boolean)
        );

        const grantedPlan = yoloCodes.has(code) ? "yolo" : proCodes.has(code) ? "pro" : null;
        if (!grantedPlan) return { valid: false };

        await db.collection("users").doc(context.auth.uid).set(
            { plan: grantedPlan, accessCode: code, planActivatedAt: admin.firestore.FieldValue.serverTimestamp() },
            { merge: true }
        );

        // Reward the referrer (if any) — best-effort, never blocks success.
        try { await _grantReferrerReward(context.auth.uid, grantedPlan); } catch (e) { console.warn("referral grant failed", e); }

        return { valid: true, plan: grantedPlan };
    });

// Server-side fallback callable — clients call this after a PayPal upgrade
// returns them to the dashboard. Idempotent on the server side.
exports.awardReferral = functions
    .runWith({ secrets: [RESEND_API_KEY] })
    .https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Sign in first");
    }
    // 10 invocations per UID per minute is plenty (this only fires once per
    // dashboard load), and stops anyone scripting referral abuse.
    if (!(await _rateLimit('awardReferral', context.auth.uid, 10))) {
        throw new functions.https.HttpsError("resource-exhausted", "Too many requests");
    }
    const tier = (data && data.tier) || null;
    if (!["pro", "yolo"].includes(tier)) {
        throw new functions.https.HttpsError("invalid-argument", "tier must be pro or yolo");
    }
    // Verify the caller actually has that plan in Firestore — defends against
    // a malicious caller trying to forge upgrades.
    const snap = await db.collection("users").doc(context.auth.uid).get();
    const userPlan = snap.exists ? (snap.data().plan || "free") : "free";
    if (TIER_RANK[userPlan] < TIER_RANK[tier]) {
        return { rewarded: null, reason: "plan_not_upgraded" };
    }
    const result = await _grantReferrerReward(context.auth.uid, tier);
    return result || { rewarded: null, reason: "no_referrer_or_already_sent" };
});

// ─── Gemini severity classifier (best-effort) ────────────────────────────────
// Reads loved/missing/rating + app and returns one of {critical, major, minor,
// not_a_bug} along with a short reasoning string. Used purely as a HINT in the
// admin email — always requires admin approval. Never blocks the email.
async function _classifySeverityWithAI(fb) {
    let key;
    try { key = GEMINI_API_KEY.value(); } catch (e) { return null; }
    if (!key) return null;
    const prompt = [
        'You are triaging a WizeLife user-feedback submission. Classify into ONE of:',
        '- critical: security flaw, data loss, wrong charge, payment broken, app totally unusable',
        '- major: a feature is broken, wrong calculations, UI breaks on a real device, login fails, API errors visible to users',
        '- minor: cosmetic glitch, typo, low-impact UX issue',
        '- not_a_bug: feature request, opinion, low rating with no concrete issue, "would be nice if…"',
        '',
        'Return STRICT JSON: {"severity":"critical|major|minor|not_a_bug","reason":"one short sentence"}.',
        '',
        '— Submission —',
        'App: ' + (fb.app || '—'),
        'Rating: ' + (fb.rating || '—') + '/5',
        'Loved: ' + scrubPII(fb.loved || '—'),
        'Missing/confusing: ' + scrubPII(fb.missing || '—'),
        'Plan: ' + (fb.plan || '—'),
        'Lang: ' + (fb.lang || '—'),
    ].join('\n');
    try {
        const body = JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 200, responseMimeType: 'application/json' },
        });
        const resp = await new Promise((resolve, reject) => {
            const req = https.request({
                hostname: 'generativelanguage.googleapis.com',
                path: '/v1beta/models/gemini-2.5-flash-lite:generateContent?key=' + encodeURIComponent(key),
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
            }, (r) => {
                let chunks = '';
                r.on('data', d => chunks += d);
                r.on('end', () => resolve(chunks));
                r.on('error', reject);
            });
            req.on('error', reject);
            req.write(body);
            req.end();
        });
        const j = JSON.parse(resp);
        const text = j && j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts
                   && j.candidates[0].content.parts[0] && j.candidates[0].content.parts[0].text;
        if (!text) return null;
        const parsed = JSON.parse(text);
        if (!['critical','major','minor','not_a_bug'].includes(parsed.severity)) return null;
        return { severity: parsed.severity, reason: String(parsed.reason || '').slice(0, 200) };
    } catch (e) {
        console.warn('Gemini classification failed', e.message);
        return null;
    }
}

// ─── Bug bounty config ───────────────────────────────────────────────────────
// Severity levels granted by approveBugReport. Tier auto-determined: critical→
// yolo, major→pro. Minor reports get a thank-you email but no plan reward.
const BUG_BOUNTY = {
    critical: { tier: 'yolo', days: 30, label: 'Critical' },
    major:    { tier: 'pro',  days: 14, label: 'Major'    },
    minor:    { tier: null,   days: 0,  label: 'Minor'    },
};

// ─── Feedback email — fires on every new feedback submission ─────────────────
// Triggered when a doc is created in the `feedback` collection (written by
// wizelife/feedback.html). Sends a formatted email to wizelife.ai@gmail.com.
exports.onFeedbackSubmitted = functions
    .runWith({ secrets: [ADMIN_TOKEN, GEMINI_API_KEY, RESEND_API_KEY] })
    .firestore.document('feedback/{id}')
    .onCreate(async (snap) => {
        const FEEDBACK_INBOX = 'wizelife.ai@gmail.com';
        const data = snap.data() || {};
        const docId = snap.id;
        // AI suggestion — never blocks the email
        const aiHint = await _classifySeverityWithAI(data).catch(() => null);
        const safe = (v) => (v === null || v === undefined ? '—' : String(v));
        const star = (n) => n ? '★'.repeat(Math.max(0, Math.min(5, Number(n)))) + '☆'.repeat(5 - Math.max(0, Math.min(5, Number(n)))) : '—';

        const subject = `🗣️ Feedback — ${safe(data.app)} — ${star(data.rating)}`;

        // One-click "approve as bug" links — only render if we have a uid (so
        // we know whom to credit) and an admin token configured.
        const adminTok = ADMIN_TOKEN.value();
        const FN_BASE = `https://us-central1-${process.env.GCLOUD_PROJECT || 'finzilla-7f1f9'}.cloudfunctions.net/approveBugReport`;
        const approveLink = (sev) =>
            `${FN_BASE}?id=${encodeURIComponent(docId)}&severity=${sev}&token=${encodeURIComponent(adminTok || '')}`;
        // Resolve THIS reporter's current plan + name + email so the admin
        // sees exactly who they're crediting and what that user will get.
        let userCtx = { plan: 'free', currentPlanName: 'FREE', expiresAtMs: 0, displayName: '', email: data.email || '' };
        if (data.uid) {
            try {
                const u = (await db.collection('users').doc(data.uid).get()).data() || {};
                const planRaw = (u.plan || 'free').toLowerCase();
                const expMs = u.planExpiresAt && u.planExpiresAt.toMillis ? u.planExpiresAt.toMillis() : (u.planExpiresAt || 0);
                userCtx = {
                    plan: planRaw,
                    currentPlanName: planRaw.toUpperCase(),
                    expiresAtMs: expMs,
                    displayName: u.displayName || u.nick || u.name || (u.email ? u.email.split('@')[0] : ''),
                    email: u.email || data.email || '',
                };
            } catch (e) {}
        }
        const fmtDate = (ms) => ms ? new Date(ms).toISOString().slice(0, 10) : '';
        // Predict the outcome for each severity option (the same math the
        // _applyOneUserRewards helper does — base = max(now, current expiry)).
        const predictOutcome = (sev) => {
            const cfg = BUG_BOUNTY[sev];
            if (!cfg.tier) return 'Reporter gets a thank-you email — no plan change.';
            const baseMs = Math.max(Date.now(), userCtx.expiresAtMs || 0);
            const newExpMs = baseMs + cfg.days * 24 * 60 * 60 * 1000;
            const tier = TIER_RANK[cfg.tier] > TIER_RANK[userCtx.plan] ? cfg.tier.toUpperCase() : userCtx.currentPlanName;
            return `Reporter (${userCtx.displayName || 'user'}, currently <b>${userCtx.currentPlanName}</b>${userCtx.expiresAtMs ? ' until ' + fmtDate(userCtx.expiresAtMs) : ''}) will be on <b>${tier}</b> until <b>${fmtDate(newExpMs)}</b> (+${cfg.days}d).`;
        };

        // Build the AI hint pill — highlights the suggested button.
        const hintMap = {
            critical: { color: '#dc2626', label: '🔴 Critical', bg: '#fee2e2' },
            major:    { color: '#f59e0b', label: '🟡 Major',    bg: '#fef3c7' },
            minor:    { color: '#64748b', label: '⚪ Minor',    bg: '#e2e8f0' },
            not_a_bug:{ color: '#6366f1', label: '💡 Not a bug (feature/opinion)', bg: '#e0e7ff' },
        };
        const hint = aiHint && hintMap[aiHint.severity];
        const hintBox = hint ? `
    <div style="background:${hint.bg};border:1.5px solid ${hint.color}55;border-radius:10px;padding:11px 14px;margin:10px 0;font-size:.85rem;line-height:1.5;color:#1e293b">
      <b style="color:${hint.color}">🤖 AI suggests: ${hint.label}</b><br>
      <span style="font-size:.78rem;color:#475569">${aiHint.reason}</span>
    </div>` : '';

        // Highlight the AI-suggested button with a thicker border / scale
        const btnStyle = (sev, bg) => {
            const isHinted = aiHint && aiHint.severity === sev;
            const ring = isHinted ? 'box-shadow:0 0 0 3px ' + bg + '88;transform:scale(1.04);' : '';
            return `background:${bg};color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:700;font-size:.88rem;${ring}`;
        };

        // Severity guide so the admin doesn't need to remember the
        // matrix — included inline in every feedback email.
        const bountyBlock = (data.uid && adminTok) ? `
  <div class="row" style="margin-top:14px;padding:14px 0 0;border-top:2px solid #f59e0b">
    <div class="label" style="color:#f59e0b">🐛 Approve as bug (one-click — credits the user + emails them a thank-you)</div>

    ${hintBox}

    <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:12px 14px;margin:10px 0;font-size:.78rem;line-height:1.55;color:#1e293b">
      <b style="color:#9a3412">Severity guide:</b><br>
      <span style="color:#dc2626;font-weight:700">🔴 Critical (30d YOLO):</span> security flaw · data loss · wrong charge · payment broken · user data exposed · app totally unusable<br>
      <span style="color:#f59e0b;font-weight:700">🟡 Major (14d Pro):</span> a feature is broken · wrong numbers / calculations · UI breaks on a real device · login fails · API errors users see<br>
      <span style="color:#64748b;font-weight:700">⚪ Minor (thank-you only):</span> typo · cosmetic glitch · feature request · suggestion · 'wouldn't it be nice if'... · low rating but no concrete bug
    </div>

    <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:10px">
      <a href="${approveLink('critical')}" style="${btnStyle('critical','#dc2626')}">🔴 Critical → 30d YOLO</a>
      <a href="${approveLink('major')}"    style="${btnStyle('major','#f59e0b')}">🟡 Major → 14d Pro</a>
      <a href="${approveLink('minor')}"    style="${btnStyle('minor','#64748b')}">⚪ Minor → thank-you only</a>
    </div>

    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:11px 14px;margin-top:12px;font-size:.78rem;line-height:1.6;color:#1e293b">
      <b style="color:#475569">📋 What this exact user gets if you click:</b><br>
      <span style="color:#dc2626;font-weight:700">🔴 Critical:</span> ${predictOutcome('critical')}<br>
      <span style="color:#f59e0b;font-weight:700">🟡 Major:</span> ${predictOutcome('major')}<br>
      <span style="color:#64748b;font-weight:700">⚪ Minor:</span> ${predictOutcome('minor')}
    </div>

    <div style="margin-top:10px;font-size:.78rem;color:#475569">
      💬 To <b>reply directly to the reporter</b>, just hit Reply in Gmail — replyTo is set to ${safe(userCtx.email) || 'the reporter\'s email'}.
    </div>
    <div style="margin-top:6px;font-size:.74rem;color:#94a3b8">
      Doc id: <code>${docId}</code> · UID: <code>${safe(data.uid)}</code>
    </div>
  </div>` : '';

        const html = `
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><style>
  body{font-family:Arial,sans-serif;background:#f4f4f8;margin:0;padding:0;color:#1e293b}
  .wrap{max-width:560px;margin:24px auto;background:#fff;border-radius:14px;padding:28px;box-shadow:0 2px 12px rgba(0,0,0,.08)}
  h1{font-size:1.3rem;margin:0 0 6px}
  .row{padding:8px 0;border-bottom:1px solid #e2e8f0}
  .row:last-child{border-bottom:0}
  .label{color:#64748b;font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px}
  .value{font-size:.95rem;line-height:1.55;white-space:pre-wrap}
  .stars{color:#f59e0b;font-size:1.1rem}
</style></head><body><div class="wrap">
  <h1>🗣️ New WizeLife feedback</h1>
  <div class="row"><div class="label">App</div><div class="value">${safe(data.app)}</div></div>
  <div class="row"><div class="label">Rating</div><div class="value stars">${star(data.rating)}</div></div>
  <div class="row"><div class="label">Would pay</div><div class="value">${safe(data.pay)}</div></div>
  <div class="row"><div class="label">Loved</div><div class="value">${safe(data.loved)}</div></div>
  <div class="row"><div class="label">Missing / confusing</div><div class="value">${safe(data.missing)}</div></div>
  <div class="row"><div class="label">From</div><div class="value">${safe(data.email)} ${data.uid ? '(' + safe(data.uid) + ')' : ''}</div></div>
  <div class="row"><div class="label">Plan / Lang</div><div class="value">${safe(data.plan)} · ${safe(data.lang)}</div></div>
  <div class="row"><div class="label">Referrer</div><div class="value">${safe(data.referrer)}</div></div>
  <div class="row"><div class="label">User-Agent</div><div class="value" style="font-size:.78rem;color:#64748b">${safe(data.ua)}</div></div>
  ${bountyBlock}
</div></body></html>`;

        try {
            const resend = new Resend(RESEND_API_KEY.value());
            await resend.emails.send({
                from: 'WizeLife <noreply@wizelife.ai>',
                to: FEEDBACK_INBOX,
                replyTo: data.email || undefined,
                subject,
                html,
            });
            console.log(`📨 feedback emailed → ${FEEDBACK_INBOX}: ${subject}`);
        } catch (e) {
            console.warn('feedback email failed', e);
        }
        return null;
    });

// ─── Approve a feedback report as a bug + credit the reporter ────────────────
// One-click HTTP endpoint hit from the admin email. Adds a reward entry to
// the user's referralRewards array (re-using the same machinery), and emails
// the user a Hebrew/English thank-you with the bonus they got.
//
// URL: GET /approveBugReport?id=<docId>&severity=critical|major|minor&token=<ADMIN_TOKEN>
exports.approveBugReport = functions
    .runWith({ secrets: [ADMIN_TOKEN, RESEND_API_KEY] })
    .https.onRequest(async (req, res) => {
        try {
            const tok = req.query.token || '';
            const want = ADMIN_TOKEN.value();
            if (!want || String(tok) !== String(want)) {
                return res.status(401).send('unauthorized');
            }
            const docId = String(req.query.id || '');
            const severity = String(req.query.severity || '').toLowerCase();
            if (!docId || !BUG_BOUNTY[severity]) {
                return res.status(400).send('bad request');
            }
            const ref = db.collection('feedback').doc(docId);
            const snap = await ref.get();
            if (!snap.exists) return res.status(404).send('feedback not found');
            const fb = snap.data() || {};
            if (fb.bugApprovedAt) {
                return res.status(200).send(`Already approved as ${fb.bugSeverity}.`);
            }
            const uid = fb.uid;
            if (!uid) return res.status(400).send('feedback has no uid — cannot credit');

            const cfg = BUG_BOUNTY[severity];
            // Mark the feedback as approved so we don't double-credit
            await ref.set({
                bugApprovedAt: admin.firestore.FieldValue.serverTimestamp(),
                bugSeverity: severity,
            }, { merge: true });

            // Credit the user (only for major/critical — minor is thank-you only)
            if (cfg.tier && cfg.days > 0) {
                const userRef = db.collection('users').doc(uid);
                await userRef.set({
                    referralRewards: admin.firestore.FieldValue.arrayUnion({
                        tier: cfg.tier,
                        days: cfg.days,
                        from: 'bug_bounty:' + docId,
                        ts: Date.now(),
                        applied: false,
                    }),
                }, { merge: true });
                // Apply immediately — the daily cron also handles it, but the
                // user shouldn't have to wait until 03:00 UTC.
                try { await _applyOneUserRewards(userRef); } catch (e) { console.warn('apply on approve failed', e); }
            }

            // Thank-you email to the reporter
            try {
                if (fb.email) {
                    const lang = (fb.lang || 'he').slice(0, 2);
                    const TR = {
                        he: { subject: '🎁 תודה על הדיווח!', greet: 'תודה ענקית', sub: 'הדיווח שלך עזר לנו לתקן בעיה — בזכותך WizeLife טובה יותר.', got_yolo: 'מחזיק לך', got_pro: 'מחזיק לך', days: 'ימים', of: 'של', no_gift: 'אין מתנה הפעם, אבל המשוב שלך נקרא ומוערך — נמשיך לטפל.', open: 'לכלי שלי', sign: 'תודה,\nצוות WizeLife' },
                        en: { subject: '🎁 Thanks for the bug report!', greet: 'Huge thanks', sub: 'Your report helped us fix something — WizeLife got better because of you.', got_yolo: 'Locking in', got_pro: 'Locking in', days: 'days', of: 'of', no_gift: 'No gift this round, but your feedback was read and matters — we’re on it.', open: 'Open my tools', sign: 'Thanks,\nThe WizeLife Team' },
                        pt: { subject: '🎁 Obrigado pelo bug report!', greet: 'Muito obrigado', sub: 'Seu relato nos ajudou a consertar — o WizeLife melhorou graças a você.', got_yolo: 'Liberei', got_pro: 'Liberei', days: 'dias', of: 'de', no_gift: 'Sem brinde desta vez, mas seu feedback foi lido — estamos cuidando disso.', open: 'Abrir minhas ferramentas', sign: 'Obrigado,\nEquipe WizeLife' },
                        es: { subject: '🎁 ¡Gracias por reportar el bug!', greet: 'Muchas gracias', sub: 'Tu reporte nos ayudó a arreglar algo — WizeLife mejoró gracias a ti.', got_yolo: 'Activé', got_pro: 'Activé', days: 'días', of: 'de', no_gift: 'Sin regalo esta vez, pero tu feedback se leyó y importa — estamos en ello.', open: 'Abrir mis herramientas', sign: 'Gracias,\nEquipo WizeLife' },
                    };
                    const t = TR[lang] || TR.en;
                    const giftLine = cfg.tier
                        ? `🎁 <b>${cfg.tier === 'yolo' ? t.got_yolo : t.got_pro} ${cfg.days} ${t.days} ${t.of} ${cfg.tier.toUpperCase()}</b> — already on your account.`
                        : t.no_gift;
                    const html = `
<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
body{font-family:Arial,sans-serif;background:#f4f4f8;margin:0;color:#1e293b}
.wrap{max-width:520px;margin:24px auto;background:#fff;border-radius:14px;padding:28px;box-shadow:0 2px 12px rgba(0,0,0,.08)}
h1{font-size:1.4rem;margin:0 0 12px;color:#10b981}
p{line-height:1.7;font-size:1rem}
.gift{background:linear-gradient(135deg,#fef3c7,#fde68a);border:1px solid #f59e0b;border-radius:10px;padding:14px 16px;margin:18px 0;font-size:1rem;line-height:1.55}
.cta{display:inline-block;margin-top:14px;background:#6366f1;color:#fff;padding:11px 22px;border-radius:99px;text-decoration:none;font-weight:700}
.foot{margin-top:24px;font-size:.85rem;color:#64748b;white-space:pre-line}
</style></head><body><div class="wrap">
  <h1>${t.greet} 🙏</h1>
  <p>${t.sub}</p>
  <div class="gift">${giftLine}</div>
  <a class="cta" href="https://wizelife.ai/dashboard.html">${t.open} →</a>
  <div class="foot">${t.sign}</div>
</div></body></html>`;
                    const resend = new Resend(RESEND_API_KEY.value());
                    await resend.emails.send({
                        from: 'WizeLife <noreply@wizelife.ai>',
                        to: fb.email,
                        subject: t.subject,
                        html,
                    });
                    console.log(`📨 thank-you sent to ${fb.email} for ${severity} bug`);
                }
            } catch (e) {
                console.warn('thank-you email failed', e);
            }

            const human = `Approved as ${cfg.label}.${cfg.tier ? ` Reporter credited with ${cfg.days}d ${cfg.tier}.` : ' Thank-you email sent.'}`;
            return res.status(200).send(`<!DOCTYPE html><html><body style="font-family:sans-serif;padding:40px;text-align:center"><h2>✅ ${human}</h2><p style="color:#64748b">You can close this tab.</p></body></html>`);
        } catch (e) {
            console.error('approveBugReport failed', e);
            return res.status(500).send('error: ' + e.message);
        }
    });

// Daily cron — converts queued rewards into actual plan extensions.
// Schedule: 03:00 UTC every day (light, off-peak).
exports.applyReferralRewards = functions.pubsub
    .schedule("0 3 * * *")
    .timeZone("UTC")
    .onRun(async () => {
        const snap = await db.collection("users")
            .where("referralCount", ">", 0)
            .get();
        let total = 0;
        for (const doc of snap.docs) {
            try { total += await _applyOneUserRewards(doc.ref); }
            catch (e) { console.warn("apply failed for", doc.id, e); }
        }
        console.log(`applyReferralRewards: applied ${total} reward(s) across ${snap.size} candidate(s)`);
        return null;
    });

// ─── Welcome Email — on new user registration ─────────────────────────────────

/**
 * Welcome email — sent on Firebase Auth user create. Multi-lang (HE/EN/PT/ES).
 * Detects language from common email TLD heuristic; default English. The Money
 * client also writes `preferred_lang` to /users/{uid} *after* this fires, so for
 * future iterations consider a Firestore-trigger approach for language accuracy.
 */
exports.sendWelcomeEmail = functions
    .runWith({ secrets: [RESEND_API_KEY] })
    .auth.user().onCreate(async (user) => {
        const email = user.email;
        if (!email) return;

        let resendKey;
        try { resendKey = RESEND_API_KEY.value(); } catch (e) { resendKey = ''; }
        if (!resendKey) {
            console.log('Welcome email skipped — RESEND_API_KEY not bound');
            return;
        }

        const resendClient = new Resend(resendKey);
        const name = user.displayName || email.split("@")[0];

        // Lightweight lang detection from email TLD — better than always-Hebrew.
        const lower = email.toLowerCase();
        let lang = 'en';
        if (lower.endsWith('.il') || lower.endsWith('.co.il')) lang = 'he';
        else if (lower.endsWith('.br') || lower.endsWith('.com.br')) lang = 'pt';
        else if (lower.endsWith('.es') || lower.endsWith('.mx') || lower.endsWith('.ar') ||
                 lower.endsWith('.cl') || lower.endsWith('.pe') || lower.endsWith('.co')) lang = 'es';

        const T = {
            en: {
                subject: "Welcome to WizeLife — your 5-in-1 AI life suite 🎉",
                title:   "Welcome to WizeLife",
                greet:   `Hi ${name},`,
                p1:      "Your account is ready. You now have access to 5 AI tools under one login:",
                tools:   ["💰 Money — finance + investments", "✈️ Travel — flight deals + AI agent",
                          "🧮 Tax — compare 20+ countries", "💊 Health — lab interpretation",
                          "🏠 Deal — real-estate ROI"],
                cta:     "Open dashboard →",
                spamHelp:"📥 Found this in spam? Tap \"Not Spam\" so your friends get theirs in Inbox 🙏",
                footer:  "WizeLife · sent on signup",
                unsub:   "Manage preferences",
                dir: 'ltr',
            },
            he: {
                subject: "ברוכים הבאים ל-WizeLife — חבילת AI לחיים 🎉",
                title:   "ברוכים הבאים ל-WizeLife",
                greet:   `היי ${name},`,
                p1:      "החשבון שלך מוכן. יש לך גישה ל-5 כלי AI בכניסה אחת:",
                tools:   ["💰 Money — כספים והשקעות", "✈️ Travel — דילי טיסות + סוכן AI",
                          "🧮 Tax — השוואה בין 20+ מדינות", "💊 Health — פירוש בדיקות",
                          "🏠 Deal — תשואת נדל\"ן"],
                cta:     "פתח את הדאשבורד ←",
                spamHelp:"📥 הגיע לתיקיית ספאם? לחץ \"Not Spam\" וגרור ל-Inbox — זה עוזר לחברים שלך לקבל בInbox 🙏",
                footer:  "WizeLife · נשלח אוטומטית בעת ההרשמה",
                unsub:   "ניהול העדפות",
                dir: 'rtl',
            },
            pt: {
                subject: "Bem-vindo ao WizeLife — sua suíte de IA 5-em-1 🎉",
                title:   "Bem-vindo ao WizeLife",
                greet:   `Olá ${name},`,
                p1:      "Sua conta está pronta. Você tem acesso a 5 ferramentas de IA em um único login:",
                tools:   ["💰 Money — finanças + investimentos", "✈️ Travel — promoções de voos + agente IA",
                          "🧮 Tax — compare 20+ países", "💊 Health — interpretação de exames",
                          "🏠 Deal — ROI imobiliário"],
                cta:     "Abrir painel →",
                spamHelp:"📥 Foi para o spam? Toque em \"Not Spam\" para ajudar seus amigos a receberem no Inbox 🙏",
                footer:  "WizeLife · enviado no cadastro",
                unsub:   "Gerenciar preferências",
                dir: 'ltr',
            },
            es: {
                subject: "Bienvenido a WizeLife — tu suite de IA 5-en-1 🎉",
                title:   "Bienvenido a WizeLife",
                greet:   `Hola ${name},`,
                p1:      "Tu cuenta está lista. Tienes acceso a 5 herramientas de IA con un solo inicio de sesión:",
                tools:   ["💰 Money — finanzas + inversiones", "✈️ Travel — ofertas de vuelos + agente IA",
                          "🧮 Tax — compara 20+ países", "💊 Health — interpretación de análisis",
                          "🏠 Deal — ROI inmobiliario"],
                cta:     "Abrir panel →",
                spamHelp:"📥 ¿Fue al spam? Toca \"Not Spam\" para ayudar a tus amigos a recibir en Inbox 🙏",
                footer:  "WizeLife · enviado al registrarse",
                unsub:   "Gestionar preferencias",
                dir: 'ltr',
            },
        };

        const t = T[lang];
        const toolsList = t.tools.map(item => `<li style="margin:6px 0;color:#334155;">${item}</li>`).join('');

        const html = `
<!DOCTYPE html>
<html dir="${t.dir}" lang="${lang}">
<head><meta charset="UTF-8"><style>
  body { font-family: Arial, sans-serif; background:#f4f4f8; margin:0; padding:0; }
  .wrap { max-width:560px; margin:32px auto; background:#fff; border-radius:16px;
          padding:36px 32px; box-shadow:0 2px 12px rgba(0,0,0,.08); }
  h1 { background:linear-gradient(135deg,#6366f1,#a78bfa,#ec4899);
       -webkit-background-clip:text; background-clip:text;
       -webkit-text-fill-color:transparent; font-size:1.7rem; margin-bottom:8px; font-weight:900; letter-spacing:-0.5px; }
  p  { color:#334155; line-height:1.7; }
  ul { list-style:none; padding:0; margin:14px 0; }
  .cta { display:inline-block; margin-top:20px; background:linear-gradient(135deg,#6366f1,#a78bfa); color:#fff;
         padding:14px 30px; border-radius:12px; text-decoration:none;
         font-weight:700; font-size:1rem; }
  .help { margin-top:24px; padding:14px 18px; background:#fef3c7; border-radius:10px;
          color:#78350f; font-size:0.88rem; }
  .footer { margin-top:28px; font-size:0.8rem; color:#94a3b8; text-align:center; }
  .footer a { color:#6366f1; text-decoration:none; }
</style></head>
<body>
  <div class="wrap">
    <h1>${t.title}</h1>
    <p>${t.greet}</p>
    <p>${t.p1}</p>
    <ul>${toolsList}</ul>
    <a class="cta" href="https://wizelife.ai/dashboard.html">${t.cta}</a>
    <div class="help">${t.spamHelp}</div>
    <div class="footer">
      ${t.footer}<br>
      <a href="https://wizelife.ai/dashboard.html">${t.unsub}</a>
    </div>
  </div>
</body>
</html>`;

        try {
            await resendClient.emails.send({
                from: 'WizeLife <noreply@wizelife.ai>',
                to:   email,
                subject: t.subject,
                html,
            });
            console.log(`✅ Welcome email sent to ${email} (${lang})`);
        } catch (err) {
            console.error("Welcome email failed:", err.message);
        }

        // Save drip state so dripEmailScheduler can send Day-1/3/7 follow-ups
        try {
            await db.collection('users').doc(user.uid).set({
                email,
                name,
                lang,
                drip1_sent: false,
                drip2_sent: false,
                drip3_sent: false,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            }, { merge: true });
        } catch (e) {
            console.warn('drip state save failed', e.message);
        }
    });


// ─── Drip Email — Day 1 follow-up ────────────────────────────────────────────
// Runs every 6 hours. Finds users who signed up 20-36h ago and haven't
// received the Day-1 email yet. Sends a direct link to WizeTax advisor.
exports.dripEmailScheduler = functions
    .runWith({ secrets: [RESEND_API_KEY] })
    .pubsub.schedule('every 6 hours')
    .onRun(async () => {
        let resendKey;
        try { resendKey = RESEND_API_KEY.value(); } catch (e) { resendKey = ''; }
        if (!resendKey) { console.log('drip skipped — no RESEND_API_KEY'); return; }
        const resend = new Resend(resendKey);

        const now = Date.now();
        const min20h = new Date(now - 36 * 60 * 60 * 1000); // 36h ago
        const max20h = new Date(now - 20 * 60 * 60 * 1000); // 20h ago

        const snap = await db.collection('users')
            .where('drip1_sent', '==', false)
            .where('createdAt', '>=', min20h)
            .where('createdAt', '<=', max20h)
            .limit(50)
            .get();

        console.log(`drip Day-1: ${snap.size} users to email`);

        for (const doc of snap.docs) {
            const u = doc.data();
            const email = u.email;
            if (!email) continue;

            const lang = (u.lang || 'en').slice(0, 2);
            const name = u.name || email.split('@')[0];

            const T = {
                he: {
                    subject: `${name}, כמה תחסוך אם תעבור לפורטוגל? 🧮`,
                    title: 'חישוב מס אישי — 2 דקות',
                    body: `ישראלים שעשו את החישוב גילו שהם יכולים לחסוך ₪40,000–₪120,000 בשנה במס.<br><br>WizeTax מחשב בדיוק <strong>את המצב שלך</strong> — לפי ההכנסה, הנכסים, ומצב המשפחה שלך — מול 26 מדינות.`,
                    cta: 'חשב את החיסכון שלי ←',
                    urgencyBadge: 'Pro בטא — $4.99/חודש',
                    urgencyNote: 'YOLO $9.99 · מחיר עולה אחרי הבטא',
                    upgradeTitle: '⏳ Pro בטא — $4.99/חודש בלבד, לא יישאר כך לנצח',
                    upgradeLink: 'שדרג ל-Pro ($4.99) או YOLO ($9.99)',
                    ps: `💡 P.S. — תוצאת "מס יציאה" מפתיעה הרבה אנשים. כדאי לדעת לפני שמחליטים.`,
                    dir: 'rtl',
                },
                en: {
                    subject: `${name}, how much tax could you save by relocating? 🧮`,
                    title: 'Your personal tax calculation — 2 min',
                    body: `Israelis who ran the numbers found they could save $30,000–$80,000/year in taxes by relocating.<br><br>WizeTax calculates exactly <strong>your situation</strong> — based on your income, assets, and family — across 26 countries.`,
                    cta: 'Calculate my savings →',
                    urgencyBadge: 'Pro beta — $4.99/mo',
                    urgencyNote: 'YOLO $9.99 · prices rise after beta',
                    upgradeTitle: "⏳ Pro beta — $4.99/mo only, won't last forever",
                    upgradeLink: 'Upgrade: Pro ($4.99) or YOLO ($9.99)',
                    ps: `💡 P.S. — The "exit tax" result surprises most people. Worth knowing before you decide.`,
                    dir: 'ltr',
                },
                pt: {
                    subject: `${name}, quanto você economizaria em impostos emigrando? 🧮`,
                    title: 'Seu cálculo fiscal pessoal — 2 min',
                    body: `Israelenses que fizeram as contas descobriram que podem economizar R$150.000–R$400.000/ano em impostos.<br><br>WizeTax calcula exatamente <strong>a sua situação</strong> — pela sua renda, ativos e família — em 26 países.`,
                    cta: 'Calcular minha economia →',
                    urgencyBadge: 'Pro beta — $4,99/mês',
                    urgencyNote: 'YOLO $9,99 · preços sobem após o beta',
                    upgradeTitle: '⏳ Pro beta — $4,99/mês apenas',
                    upgradeLink: 'Upgrade: Pro ($4,99) ou YOLO ($9,99)',
                    ps: `💡 P.S. — O resultado do "imposto de saída" surpreende a maioria. Vale saber antes de decidir.`,
                    dir: 'ltr',
                },
                es: {
                    subject: `${name}, ¿cuánto podrías ahorrar en impuestos emigrando? 🧮`,
                    title: 'Tu cálculo fiscal personal — 2 min',
                    body: `Israelíes que hicieron los cálculos descubrieron que pueden ahorrar $30,000–$80,000/año en impuestos.<br><br>WizeTax calcula exactamente <strong>tu situación</strong> — según tus ingresos, activos y familia — en 26 países.`,
                    cta: 'Calcular mis ahorros →',
                    urgencyBadge: 'Pro beta — $4,99/mes',
                    urgencyNote: 'YOLO $9,99 · precios suben tras el beta',
                    upgradeTitle: '⏳ Pro beta — $4,99/mes solamente',
                    upgradeLink: 'Upgrade: Pro ($4,99) o YOLO ($9,99)',
                    ps: `💡 P.S. — El resultado del "impuesto de salida" sorprende a la mayoría. Vale saber antes de decidir.`,
                    dir: 'ltr',
                },
            };

            const t = T[lang] || T.en;
            const utmLink = `https://tax.wizelife.ai/advisor?utm_source=drip&utm_medium=email&utm_campaign=day1&lang=${lang}`;

            const urgencyLink = `https://wizelife.ai/auth.html?next=/dashboard.html&utm_source=drip&utm_medium=email&utm_campaign=day1_urgency&lang=${lang}`;
            const html = `<!DOCTYPE html><html dir="${t.dir}" lang="${lang}"><head><meta charset="UTF-8"><style>
body{font-family:Arial,sans-serif;background:#f4f4f8;margin:0}
.wrap{max-width:520px;margin:24px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08)}
.urgency{background:linear-gradient(135deg,#dc2626,#b91c1c);color:#fff;text-align:center;padding:10px 16px;font-size:.85rem;font-weight:700;letter-spacing:.3px}
.urgency span{opacity:.85;font-weight:400}
.body{padding:32px}
h1{font-size:1.3rem;font-weight:900;background:linear-gradient(135deg,#f59e0b,#ef4444);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;margin:0 0 16px}
p{color:#334155;line-height:1.7;margin:0 0 20px}
.cta{display:inline-block;background:linear-gradient(135deg,#f59e0b,#ef4444);color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:700;font-size:1rem}
.upgrade{margin-top:20px;padding:16px;background:linear-gradient(135deg,rgba(99,102,241,.06),rgba(168,85,247,.06));border:1px solid rgba(99,102,241,.2);border-radius:12px}
.upgrade p{margin:0 0 10px;font-size:.88rem;color:#4338ca;font-weight:600}
.upgrade a{color:#6366f1;font-size:.85rem;font-weight:700;text-decoration:none}
.ps{margin-top:20px;padding:14px;background:#fffbeb;border-radius:10px;color:#78350f;font-size:.88rem}
.foot{margin-top:24px;font-size:.78rem;color:#94a3b8;text-align:center}
</style></head><body>
<div class="wrap">
<div class="urgency">🔥 ${t.urgencyBadge} <span>— ${t.urgencyNote}</span></div>
<div class="body">
<h1>${t.title}</h1>
<p>${t.body}</p>
<a class="cta" href="${utmLink}">${t.cta}</a>
<div class="upgrade"><p>${t.upgradeTitle}</p><a href="${urgencyLink}">${t.upgradeLink} →</a></div>
<div class="ps">${t.ps}</div>
<div class="foot">WizeLife · <a href="https://wizelife.ai/dashboard.html" style="color:#6366f1">dashboard</a></div>
</div></div></body></html>`;

            try {
                await resend.emails.send({
                    from: 'WizeLife <noreply@wizelife.ai>',
                    to: email,
                    subject: t.subject,
                    html,
                });
                await doc.ref.update({ drip1_sent: true });
                console.log(`✅ drip Day-1 sent to ${email}`);
            } catch (e) {
                console.error(`drip Day-1 failed for ${email}:`, e.message);
            }
        }

        // ── Day-3 (60–90h): country spotlight ───────────────────────────────
        const snap3 = await db.collection('users')
            .where('drip2_sent', '==', false)
            .where('createdAt', '>=', new Date(now - 90 * 60 * 60 * 1000))
            .where('createdAt', '<=', new Date(now - 60 * 60 * 60 * 1000))
            .limit(50)
            .get();

        console.log(`drip Day-3: ${snap3.size} users to email`);

        for (const doc of snap3.docs) {
            const u = doc.data();
            const email = u.email;
            if (!email) continue;
            const lang = (u.lang || 'en').slice(0, 2);
            const name = u.name || email.split('@')[0];

            const T3 = {
                he: {
                    banner: '🌍 מדריך השוואת מדינות — WizeTax',
                    subject: `${name}, 3 מדינות שישראלים בוחרים — מה מתאים לך?`,
                    title: '🌍 פורטוגל, קפריסין, איחוד האמירויות',
                    body: `כל אחת מהן מציעה משהו שונה:<br><br>
🇵🇹 <strong>פורטוגל NHR</strong> — מס שטוח 10% על פנסיה, 0% על דיבידנדים זרים. מבוקשת ע"י שכירים ובעלי עסקים.<br><br>
🇨🇾 <strong>קפריסין 60 יום</strong> — לא חייבים 183 יום. 0% מס יציאה ישראלי אם עוברים נכון.<br><br>
🇦🇪 <strong>איחוד האמירויות</strong> — 0% מס הכנסה. מתאים לפרילנסרים ויזמים.`,
                    cta: 'השווה את שלושתן ←',
                    ps: '💡 P.S. — WizeTax מחשב בדיוק כמה כל מדינה שווה לך אישית.',
                    dir: 'rtl',
                },
                en: {
                    banner: '🌍 Country Comparison Guide — WizeTax',
                    subject: `${name}, 3 countries Israelis choose — which fits you?`,
                    title: '🌍 Portugal, Cyprus, UAE',
                    body: `Each offers something different:<br><br>
🇵🇹 <strong>Portugal NHR</strong> — flat 10% tax on pension, 0% on foreign dividends. Popular with employees and business owners.<br><br>
🇨🇾 <strong>Cyprus 60-day rule</strong> — no need for 183 days. 0% Israeli exit tax if done correctly.<br><br>
🇦🇪 <strong>UAE</strong> — 0% income tax. Great for freelancers and entrepreneurs.`,
                    cta: 'Compare all three →',
                    ps: '💡 P.S. — WizeTax calculates exactly how much each country is worth for you personally.',
                    dir: 'ltr',
                },
                pt: {
                    banner: '🌍 Guia de Comparação de Países — WizeTax',
                    subject: `${name}, 3 países que israelenses escolhem — qual é o seu?`,
                    title: '🌍 Portugal, Chipre, Emirados',
                    body: `Cada um oferece algo diferente:<br><br>
🇵🇹 <strong>Portugal NHR</strong> — imposto fixo de 10% sobre pensão, 0% sobre dividendos estrangeiros.<br><br>
🇨🇾 <strong>Chipre regra 60 dias</strong> — sem necessidade de 183 dias. 0% imposto de saída israelense se feito corretamente.<br><br>
🇦🇪 <strong>Emirados</strong> — 0% imposto de renda. Ótimo para freelancers e empreendedores.`,
                    cta: 'Comparar os três →',
                    ps: '💡 P.S. — WizeTax calcula exatamente quanto cada país vale para você pessoalmente.',
                    dir: 'ltr',
                },
                es: {
                    banner: '🌍 Guía de Comparación de Países — WizeTax',
                    subject: `${name}, 3 países que israelíes eligen — ¿cuál te conviene?`,
                    title: '🌍 Portugal, Chipre, Emiratos',
                    body: `Cada uno ofrece algo diferente:<br><br>
🇵🇹 <strong>Portugal NHR</strong> — impuesto fijo del 10% sobre pensión, 0% sobre dividendos extranjeros.<br><br>
🇨🇾 <strong>Chipre regla 60 días</strong> — sin necesidad de 183 días. 0% impuesto de salida israelí si se hace correctamente.<br><br>
🇦🇪 <strong>Emiratos</strong> — 0% impuesto sobre la renta. Ideal para freelancers y emprendedores.`,
                    cta: 'Comparar los tres →',
                    ps: '💡 P.S. — WizeTax calcula exactamente cuánto vale cada país para ti personalmente.',
                    dir: 'ltr',
                },
            };
            const t3 = T3[lang] || T3.en;
            const utmLink3 = `https://tax.wizelife.ai/relocation-analyzer?utm_source=drip&utm_medium=email&utm_campaign=day3&lang=${lang}`;
            const html3 = `<!DOCTYPE html><html dir="${t3.dir}" lang="${lang}"><head><meta charset="UTF-8"><style>
body{font-family:Arial,sans-serif;background:#f4f4f8;margin:0}
.wrap{max-width:520px;margin:24px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08)}
.banner{background:linear-gradient(135deg,#3b82f6,#6366f1);color:#fff;text-align:center;padding:10px 16px;font-size:.85rem;font-weight:700}
.body{padding:32px}
h1{font-size:1.2rem;font-weight:900;color:#1e293b;margin:0 0 16px}
p{color:#334155;line-height:1.8;margin:0 0 20px}
.cta{display:inline-block;background:linear-gradient(135deg,#3b82f6,#6366f1);color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:700;font-size:1rem}
.ps{margin-top:20px;padding:14px;background:#eff6ff;border-radius:10px;color:#1e40af;font-size:.88rem}
.foot{margin-top:24px;font-size:.78rem;color:#94a3b8;text-align:center}
</style></head><body><div class="wrap">
<div class="banner">${t3.banner}</div>
<div class="body">
<h1>${t3.title}</h1>
<p>${t3.body}</p>
<a class="cta" href="${utmLink3}">${t3.cta}</a>
<div class="ps">${t3.ps}</div>
<div class="foot">WizeLife · <a href="https://wizelife.ai/dashboard.html" style="color:#6366f1">dashboard</a></div>
</div></div></body></html>`;
            try {
                await resend.emails.send({
                    from: 'WizeLife <noreply@wizelife.ai>',
                    to: email,
                    subject: t3.subject,
                    html: html3,
                });
                await doc.ref.update({ drip2_sent: true });
                console.log(`✅ drip Day-3 sent to ${email}`);
            } catch (e) {
                console.error(`drip Day-3 failed for ${email}:`, e.message);
            }
        }

        // ── Day-7 (160–175h): final urgency ─────────────────────────────────
        const snap7 = await db.collection('users')
            .where('drip3_sent', '==', false)
            .where('createdAt', '>=', new Date(now - 175 * 60 * 60 * 1000))
            .where('createdAt', '<=', new Date(now - 160 * 60 * 60 * 1000))
            .limit(50)
            .get();

        console.log(`drip Day-7: ${snap7.size} users to email`);

        for (const doc of snap7.docs) {
            const u = doc.data();
            const email = u.email;
            if (!email) continue;
            const lang = (u.lang || 'en').slice(0, 2);
            const name = u.name || email.split('@')[0];

            const T7 = {
                he: {
                    subject: `${name}, מחיר הבטא נגמר בקרוב ⏰`,
                    title: 'הזדמנות אחרונה — Pro $4.99 / YOLO $9.99',
                    body: `שבוע עבר מאז שנרשמת ל-WizeLife.<br><br>
מחיר הבטא של <strong>$4.99/חודש</strong> עדיין פעיל — אבל לא לנצח.<br><br>
Pro כולל: ניתוח מס מלא ב-26 מדינות, יועץ AI ללא הגבלה, השוואת קרנות, מחשבון מס יציאה מלא, ועוד.`,
                    cta: 'נעל את מחיר הבטא ←',
                    sub: 'ביטול בכל עת. ללא מחויבות.',
                    ps: '⏳ המחיר עולה ל-$9.99 אחרי סיום הבטא. ששלמת עכשיו — נשאר קבוע.',
                    dir: 'rtl',
                },
                en: {
                    subject: `${name}, beta pricing ends soon ⏰`,
                    title: 'Last chance — Pro $4.99 / YOLO $9.99',
                    body: `One week since you joined WizeLife.<br><br>
The <strong>$4.99/month</strong> beta price is still active — but not forever.<br><br>
Pro includes: full tax analysis across 26 countries, unlimited AI advisor, fund comparison, full exit tax calculator, and more.`,
                    cta: 'Lock in beta pricing →',
                    sub: 'Cancel anytime. No commitment.',
                    ps: "⏳ Price increases to $9.99 after beta ends. What you pay now — stays fixed.",
                    dir: 'ltr',
                },
                pt: {
                    subject: `${name}, preço beta termina em breve ⏰`,
                    title: 'Última chance — Pro $4,99 / YOLO $9,99',
                    body: `Uma semana desde que você entrou no WizeLife.<br><br>
O preço beta de <strong>$4,99/mês</strong> ainda está ativo — mas não para sempre.<br><br>
Pro inclui: análise fiscal completa em 26 países, consultor IA ilimitado, comparação de fundos, calculadora de imposto de saída completa e mais.`,
                    cta: 'Garantir preço beta →',
                    sub: 'Cancele a qualquer momento. Sem compromisso.',
                    ps: '⏳ O preço sobe para $9,99 após o beta. O que você paga agora — fica fixo.',
                    dir: 'ltr',
                },
                es: {
                    subject: `${name}, el precio beta termina pronto ⏰`,
                    title: 'Última oportunidad — Pro $4,99 / YOLO $9,99',
                    body: `Una semana desde que te uniste a WizeLife.<br><br>
El precio beta de <strong>$4,99/mes</strong> sigue activo — pero no para siempre.<br><br>
Pro incluye: análisis fiscal completo en 26 países, asesor IA ilimitado, comparación de fondos, calculadora de impuesto de salida completa y más.`,
                    cta: 'Asegurar precio beta →',
                    sub: 'Cancela cuando quieras. Sin compromiso.',
                    ps: '⏳ El precio sube a $9,99 después del beta. Lo que pagas ahora — queda fijo.',
                    dir: 'ltr',
                },
            };
            const t7 = T7[lang] || T7.en;
            const utmLink7 = `https://wizelife.ai/auth.html?next=/dashboard.html&utm_source=drip&utm_medium=email&utm_campaign=day7&lang=${lang}`;
            const html7 = `<!DOCTYPE html><html dir="${t7.dir}" lang="${lang}"><head><meta charset="UTF-8"><style>
body{font-family:Arial,sans-serif;background:#f4f4f8;margin:0}
.wrap{max-width:520px;margin:24px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08)}
.countdown{background:linear-gradient(135deg,#dc2626,#9f1239);color:#fff;text-align:center;padding:12px 16px;font-size:.9rem;font-weight:800;letter-spacing:.5px}
.body{padding:32px}
h1{font-size:1.3rem;font-weight:900;color:#dc2626;margin:0 0 16px}
p{color:#334155;line-height:1.8;margin:0 0 20px}
.price{font-size:2.2rem;font-weight:900;color:#dc2626;text-align:center;margin:16px 0 4px;font-variant-numeric:tabular-nums}
.price-sub{text-align:center;color:#6b7280;font-size:.85rem;margin-bottom:24px}
.cta{display:block;text-align:center;background:linear-gradient(135deg,#dc2626,#b91c1c);color:#fff;padding:16px 28px;border-radius:12px;text-decoration:none;font-weight:800;font-size:1.05rem}
.cta-sub{text-align:center;font-size:.78rem;color:#94a3b8;margin-top:8px}
.ps{margin-top:20px;padding:14px;background:#fef2f2;border-radius:10px;color:#991b1b;font-size:.88rem}
.foot{margin-top:24px;font-size:.78rem;color:#94a3b8;text-align:center}
</style></head><body><div class="wrap">
<div class="countdown">⏰ ${lang==='he'?'מחיר בטא — עוד מעט נגמר':'Beta pricing — ending soon'}</div>
<div class="body">
<h1>${t7.title}</h1>
<p>${t7.body}</p>
<div class="price">$4.99</div>
<div class="price-sub">${lang==='he'?'לחודש · ביטול בכל עת':'/month · cancel anytime'}</div>
<a class="cta" href="${utmLink7}">${t7.cta}</a>
<div class="cta-sub">${t7.sub}</div>
<div class="ps">${t7.ps}</div>
<div class="foot">WizeLife · <a href="https://wizelife.ai/dashboard.html" style="color:#6366f1">dashboard</a></div>
</div></div></body></html>`;
            try {
                await resend.emails.send({
                    from: 'WizeLife <noreply@wizelife.ai>',
                    to: email,
                    subject: t7.subject,
                    html: html7,
                });
                await doc.ref.update({ drip3_sent: true });
                console.log(`✅ drip Day-7 sent to ${email}`);
            } catch (e) {
                console.error(`drip Day-7 failed for ${email}:`, e.message);
            }

        // ── Leads collection: users who came via landing-page email capture
        // captureLeadEmail saves to `leads` (not `users`), using capturedAt field.

        // leads Day-1 (20-36h)
        const lSnap1 = await db.collection('leads')
            .where('drip1_sent', '==', false)
            .where('capturedAt', '>=', min20h)
            .where('capturedAt', '<=', max20h)
            .limit(50).get();
        console.log(`leads drip Day-1: ${lSnap1.size} leads to email`);
        for (const doc of lSnap1.docs) {
            const u = doc.data(); const email = u.email; if (!email) continue;
            const lang = (u.lang || 'en').slice(0, 2);
            const name = email.split('@')[0];
            const TL1 = {
                he: { subject: `${name}, כמה תחסכ אם תעבור לחו"ל? 🧮`, title: 'חישוב מס אישי — 2 דקות', body: 'ישראלים שעשו את החישוב גילו שהם יכולים לחסכ ₪40,000–₪120,000 בשנה במס.<br><br>WizeTax מחשב בדיוק <strong>את המצב שלך</strong>.', cta: 'חשב את החיסכון שלי ←', dir: 'rtl' },
                en: { subject: `${name}, how much would you save moving abroad? 🧮`, title: 'Personal Tax Calculator — 2 min', body: 'Israelis who ran the numbers found they can save ₪40,000–₪120,000 per year in taxes.<br><br>WizeTax calculates <strong>your exact situation</strong>.', cta: 'Calculate my savings →', dir: 'ltr' },
                pt: { subject: `${name}, quanto pouparia mudando para o exterior? 🧮`, title: 'Calculadora Fiscal Pessoal — 2 min', body: 'Israelenses podem poupar ₪40.000–₪120.000 por ano em impostos.<br><br>WizeTax calcula <strong>a sua situação exata</strong>.', cta: 'Calcular minha poupança →', dir: 'ltr' },
                es: { subject: `${name}, ¿cuánto ahorrarías mudándote al exterior? 🧮`, title: 'Calculadora Fiscal Personal — 2 min', body: 'Israelíes pueden ahorrar ₪40.000–₪120.000 al año en impuestos.<br><br>WizeTax calcula <strong>tu situación exacta</strong>.', cta: 'Calcular mis ahorros →', dir: 'ltr' },
            };
            const tL1 = TL1[lang] || TL1.en;
            const utmLink1L = `https://tax.wizelife.ai/advisor?utm_source=drip&utm_medium=email&utm_campaign=lead_day1&lang=${lang}`;
            const html1L = `<!DOCTYPE html><html dir="${tL1.dir}" lang="${lang}"><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;background:#f4f4f8;margin:0}.wrap{max-width:520px;margin:24px auto;background:#fff;border-radius:16px;overflow:hidden}.badge{background:linear-gradient(135deg,#6366f1,#a855f7);color:#fff;text-align:center;padding:10px;font-size:.85rem;font-weight:700}.body{padding:32px}h1{font-size:1.2rem;font-weight:900;color:#1e293b;margin:0 0 16px}p{color:#334155;line-height:1.8;margin:0 0 20px}.cta{display:inline-block;background:linear-gradient(135deg,#6366f1,#a855f7);color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:700}.foot{margin-top:24px;font-size:.78rem;color:#94a3b8;text-align:center}</style></head><body><div class="wrap"><div class="badge">Pro בטא — $4.99/חודש</div><div class="body"><h1>${tL1.title}</h1><p>${tL1.body}</p><a class="cta" href="${utmLink1L}">${tL1.cta}</a><div class="foot">WizeLife · <a href="https://wizelife.ai/dashboard.html" style="color:#6366f1">dashboard</a></div></div></div></body></html>`;
            try { await resend.emails.send({ from: 'WizeLife <noreply@wizelife.ai>', to: email, subject: tL1.subject, html: html1L }); await doc.ref.update({ drip1_sent: true }); console.log(`✅ leads drip Day-1 sent to ${email}`); } catch (e) { console.error(`leads drip Day-1 failed for ${email}:`, e.message); }
        }

        // leads Day-3 (60-90h)
        const lSnap3 = await db.collection('leads')
            .where('drip2_sent', '==', false)
            .where('capturedAt', '>=', new Date(now - 90 * 60 * 60 * 1000))
            .where('capturedAt', '<=', new Date(now - 60 * 60 * 60 * 1000))
            .limit(50).get();
        console.log(`leads drip Day-3: ${lSnap3.size} leads to email`);
        for (const doc of lSnap3.docs) {
            const u = doc.data(); const email = u.email; if (!email) continue;
            const lang = (u.lang || 'en').slice(0, 2);
            const name = email.split('@')[0];
            const TL3 = {
                he: { banner: '🌍 מדריך השוואת מדינות — WizeTax', subject: `${name}, 3 מדינות שישראלים בוחרים — מה מתאים לך?`, title: '🌍 פורטוגל, קפריסין, איחוד האמירויות', body: 'כל אחת מהן מציעה משהו שונה. WizeTax מחשב בדיוק כמה כל מדינה שווה לך אישית.', cta: 'השווה את שלושתן ←', dir: 'rtl' },
                en: { banner: '🌍 Country Comparison Guide — WizeTax', subject: `${name}, 3 countries Israelis choose — which fits you?`, title: '🌍 Portugal, Cyprus, UAE', body: 'Each offers something different. WizeTax calculates exactly how much each country is worth for you.', cta: 'Compare all three →', dir: 'ltr' },
                pt: { banner: '🌍 Guia de Comparação de Países — WizeTax', subject: `${name}, 3 países que israelenses escolhem — qual é o seu?`, title: '🌍 Portugal, Chipre, Emirados', body: 'Cada um oferece algo diferente. WizeTax calcula exatamente quanto cada país vale para você.', cta: 'Comparar os três →', dir: 'ltr' },
                es: { banner: '🌍 Guía de Comparación de Países — WizeTax', subject: `${name}, 3 países que israelíes eligen — ¿cuál te conviene?`, title: '🌍 Portugal, Chipre, Emiratos', body: 'Cada uno ofrece algo diferente. WizeTax calcula exactamente cuánto vale cada país para ti.', cta: 'Comparar los tres →', dir: 'ltr' },
            };
            const tL3 = TL3[lang] || TL3.en;
            const utmLink3L = `https://tax.wizelife.ai/relocation-analyzer?utm_source=drip&utm_medium=email&utm_campaign=lead_day3&lang=${lang}`;
            const html3L = `<!DOCTYPE html><html dir="${tL3.dir}" lang="${lang}"><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;background:#f4f4f8;margin:0}.wrap{max-width:520px;margin:24px auto;background:#fff;border-radius:16px;overflow:hidden}.banner{background:linear-gradient(135deg,#3b82f6,#6366f1);color:#fff;text-align:center;padding:10px;font-size:.85rem;font-weight:700}.body{padding:32px}h1{font-size:1.2rem;font-weight:900;color:#1e293b;margin:0 0 16px}p{color:#334155;line-height:1.8;margin:0 0 20px}.cta{display:inline-block;background:linear-gradient(135deg,#3b82f6,#6366f1);color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:700}.foot{margin-top:24px;font-size:.78rem;color:#94a3b8;text-align:center}</style></head><body><div class="wrap"><div class="banner">${tL3.banner}</div><div class="body"><h1>${tL3.title}</h1><p>${tL3.body}</p><a class="cta" href="${utmLink3L}">${tL3.cta}</a><div class="foot">WizeLife · <a href="https://wizelife.ai/dashboard.html" style="color:#6366f1">dashboard</a></div></div></div></body></html>`;
            try { await resend.emails.send({ from: 'WizeLife <noreply@wizelife.ai>', to: email, subject: tL3.subject, html: html3L }); await doc.ref.update({ drip2_sent: true }); console.log(`✅ leads drip Day-3 sent to ${email}`); } catch (e) { console.error(`leads drip Day-3 failed for ${email}:`, e.message); }
        }

        // leads Day-7 (160-175h)
        const lSnap7 = await db.collection('leads')
            .where('drip3_sent', '==', false)
            .where('capturedAt', '>=', new Date(now - 175 * 60 * 60 * 1000))
            .where('capturedAt', '<=', new Date(now - 160 * 60 * 60 * 1000))
            .limit(50).get();
        console.log(`leads drip Day-7: ${lSnap7.size} leads to email`);
        for (const doc of lSnap7.docs) {
            const u = doc.data(); const email = u.email; if (!email) continue;
            const lang = (u.lang || 'en').slice(0, 2);
            const name = email.split('@')[0];
            const TL7 = {
                he: { subject: `${name}, מחיר הבטא נגמר בקרוב ⏰`, title: 'הזדמנות אחרונה — Pro $4.99 / YOLO $9.99', body: 'שבוע עבר מאז שהכנסת את המייל שלך.<br><br>מחיר הבטא עדיין פעיל — אבל לא לנצח.', cta: 'נעל את מחיר הבטא ←', sub: 'ביטול בכל עת.', ps: '⏳ המחיר עולה ל-$9.99 אחרי סיום הבטא.', dir: 'rtl' },
                en: { subject: `${name}, beta pricing ends soon ⏰`, title: 'Last chance — Pro $4.99 / YOLO $9.99', body: 'One week since you entered your email.<br><br>The <strong>$4.99/month</strong> beta price is still active — but not forever.', cta: 'Lock in beta pricing →', sub: 'Cancel anytime.', ps: '⏳ Price increases to $9.99 after beta ends.', dir: 'ltr' },
                pt: { subject: `${name}, preço beta termina em breve ⏰`, title: 'Última chance — Pro $4,99 / YOLO $9,99', body: 'Uma semana desde que introduziu o seu e-mail.<br><br>O preço beta de <strong>$4,99/mês</strong> ainda está ativo — mas não para sempre.', cta: 'Garantir preço beta →', sub: 'Cancele a qualquer momento.', ps: '⏳ O preço sobe para $9,99 após o beta.', dir: 'ltr' },
                es: { subject: `${name}, el precio beta termina pronto ⏰`, title: 'Última oportunidad — Pro $4,99 / YOLO $9,99', body: 'Una semana desde que introdujiste tu email.<br><br>El precio beta de <strong>$4,99/mes</strong> sigue activo — pero no para siempre.', cta: 'Asegurar precio beta →', sub: 'Cancela cuando quieras.', ps: '⏳ El precio sube a $9,99 después del beta.', dir: 'ltr' },
            };
            const tL7 = TL7[lang] || TL7.en;
            const utmLink7L = `https://wizelife.ai/auth.html?next=/dashboard.html&utm_source=drip&utm_medium=email&utm_campaign=lead_day7&lang=${lang}`;
            const html7L = `<!DOCTYPE html><html dir="${tL7.dir}" lang="${lang}"><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;background:#f4f4f8;margin:0}.wrap{max-width:520px;margin:24px auto;background:#fff;border-radius:16px;overflow:hidden}.countdown{background:linear-gradient(135deg,#dc2626,#9f1239);color:#fff;text-align:center;padding:12px;font-size:.9rem;font-weight:800}.body{padding:32px}h1{font-size:1.3rem;font-weight:900;color:#dc2626;margin:0 0 16px}p{color:#334155;line-height:1.8;margin:0 0 20px}.price{font-size:2.2rem;font-weight:900;color:#dc2626;text-align:center;margin:16px 0 4px}.price-sub{text-align:center;color:#6b7280;font-size:.85rem;margin-bottom:24px}.cta{display:block;text-align:center;background:linear-gradient(135deg,#dc2626,#b91c1c);color:#fff;padding:16px 28px;border-radius:12px;text-decoration:none;font-weight:800;font-size:1.05rem}.cta-sub{text-align:center;font-size:.78rem;color:#94a3b8;margin-top:8px}.ps{margin-top:20px;padding:14px;background:#fef2f2;border-radius:10px;color:#991b1b;font-size:.88rem}.foot{margin-top:24px;font-size:.78rem;color:#94a3b8;text-align:center}</style></head><body><div class="wrap"><div class="countdown">⏰ ${lang==='he'?'מחיר בטא — עוד מעט נגמר':'Beta pricing — ending soon'}</div><div class="body"><h1>${tL7.title}</h1><p>${tL7.body}</p><div class="price">$4.99</div><div class="price-sub">${lang==='he'?'לחודש · ביטול בכל עת':'/month · cancel anytime'}</div><a class="cta" href="${utmLink7L}">${tL7.cta}</a><div class="cta-sub">${tL7.sub}</div><div class="ps">${tL7.ps}</div><div class="foot">WizeLife · <a href="https://wizelife.ai/dashboard.html" style="color:#6366f1">dashboard</a></div></div></div></body></html>`;
            try { await resend.emails.send({ from: 'WizeLife <noreply@wizelife.ai>', to: email, subject: tL7.subject, html: html7L }); await doc.ref.update({ drip3_sent: true }); console.log(`✅ leads drip Day-7 sent to ${email}`); } catch (e) { console.error(`leads drip Day-7 failed for ${email}:`, e.message); }
        }

        }
    });

// ─── AI Proxy — callable function ────────────────────────────────────────────

const AI_LIMIT = { free: 3, pro: 20, yolo: 40 };

/**
 * Firestore-backed rate limiting — tiered by plan.
 * Free: 1 call/day. Pro: 10 calls/day.
 */
async function checkAiRateLimit(uid) {
    const [rateSnap, userSnap] = await Promise.all([
        db.collection("ai_rate").doc(uid).get(),
        db.collection("users").doc(uid).get(),
    ]);

    const plan  = userSnap.exists ? (userSnap.data().plan || "free") : "free";
    const limit = AI_LIMIT[plan] ?? AI_LIMIT.free;
    const isPaid = plan === "pro" || plan === "yolo";

    const ref = db.collection("ai_rate").doc(uid);
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    await db.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        const d = snap.exists ? snap.data() : {};

        const dayCount   = (d.dayResetAt > now) ? (d.dayCount || 0) : 0;
        const dayResetAt = (d.dayResetAt > now) ? d.dayResetAt : now + dayMs;

        if (dayCount >= limit) {
            const minLeft = Math.ceil((dayResetAt - now) / 60000);
            const upgradeHint = plan === "free"
                ? " שדרג ל-Pro ($4.99/חודש) לקבל 20 שאלות ביום."
                : plan === "pro"
                ? " שדרג ל-YOLO ($9.99/חודש) לקבל 40 שאלות ביום."
                : "";
            throw new functions.https.HttpsError(
                "resource-exhausted",
                `הגעת למגבלת ${limit} שאלות יומיות.${upgradeHint} נסה שוב בעוד ~${minLeft} דקות.`
            );
        }

        tx.set(ref, {
            dayCount:  dayCount + 1,
            dayResetAt,
            lastCall:  now,
        }, { merge: true });
    });
}

exports.aiProxy = functions
    .runWith({ secrets: [GEMINI_API_KEY, RESEND_API_KEY] })
    .https.onCall(async (data, context) => {
        if (!context.auth) {
            throw new functions.https.HttpsError("unauthenticated", "יש להתחבר כדי להשתמש ביועץ ה-AI");
        }

        const uid = context.auth.uid;
        await checkAiRateLimit(uid);

        const { messages, system, maxTokens = 2048 } = data;
        if (!messages || !Array.isArray(messages)) {
            throw new functions.https.HttpsError("invalid-argument", "messages required");
        }

        // Wrap user-provided system prompt with anti-hallucination guardrails.
        const wrappedSystem = (system || '') + (system ? '\n\n' : '') + ANTI_HALLUCINATION_PREFIX;
        const body = {
            contents: messages,
            // Deterministic generation — temperature 0 kills creative drift.
            generationConfig: { maxOutputTokens: maxTokens, temperature: 0, topP: 0.1 },
            system_instruction: { parts: [{ text: wrappedSystem }] },
        };

        const apiKey = GEMINI_API_KEY.value();
        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            }
        );

        if (!res.ok) {
            const err = await res.text().catch(() => "");
            console.error("Gemini error:", res.status, err.slice(0, 200));
            throw new functions.https.HttpsError("internal", "AI error");
        }

        const result = await res.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new functions.https.HttpsError("internal", "Empty AI response");

        return { text };
    });

// ─── Cross-app data sync — called by other WizeLife tools ────────────────────
//
// Each app calls this to push a plain-text summary of the user's state.
// WizeMoney's AI reads it from users/{uid}/cross_app/{appId}.
//
// Payload: { appId: string, appName: string, summary: string }
// appId must be one of the known WizeLife app identifiers.
//
const KNOWN_APP_IDS = new Set(["wize_tax", "wize_deal", "wize_travel", "wize_health"]);

exports.syncCrossAppData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Login required");
    }

    const uid = context.auth.uid;

    // Check caller is on yolo plan
    const userSnap = await db.collection("users").doc(uid).get();
    const plan = userSnap.exists ? (userSnap.data().plan || "free") : "free";
    if (plan !== "yolo") {
        throw new functions.https.HttpsError("permission-denied", "Yolo plan required for cross-app AI");
    }

    // Suite-wide AI cost cap (shared aiQuota/{date}__GLOBAL across ALL apps) —
    // bounds total LLM spend regardless of IP rotation. ~800/day ≈ $10/mo. Fails
    // open if Firestore errors (the GCP budget is the hard backstop).
    {
        const _today = new Date().toISOString().slice(0, 10);
        const _capRef = db.collection("aiQuota").doc(`${_today}__GLOBAL`);
        const _CAP = parseInt(process.env.AI_GLOBAL_DAILY_CAP || "800", 10);
        const _ok = await db.runTransaction(async (txn) => {
            const s = await txn.get(_capRef);
            const c = s.exists ? (s.data().count || 0) : 0;
            if (c >= _CAP) return false;
            txn.set(_capRef, { count: c + 1, date: _today }, { merge: true });
            return true;
        }).catch(() => true);
        if (!_ok) throw new functions.https.HttpsError("resource-exhausted", "AI at daily capacity — try again tomorrow.");
    }

    const { appId, appName, summary } = data;
    if (!appId || !KNOWN_APP_IDS.has(appId)) {
        throw new functions.https.HttpsError("invalid-argument", "Unknown appId");
    }
    if (typeof summary !== "string" || summary.length > 8000) {
        throw new functions.https.HttpsError("invalid-argument", "summary must be a string ≤ 8000 chars");
    }

    await db
        .collection("users").doc(uid)
        .collection("cross_app").doc(appId)
        .set({
            appId,
            appName: appName || appId,
            summary,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

    return { ok: true };
});

// ─── PayPal token ─────────────────────────────────────────────────────────────

function getAccessToken(clientId, secret) {
    return new Promise((resolve, reject) => {
        const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");
        const req  = https.request({
            hostname: "api-m.paypal.com",
            path:     "/v1/oauth2/token",
            method:   "POST",
            headers:  {
                "Authorization": `Basic ${auth}`,
                "Content-Type":  "application/x-www-form-urlencoded",
            },
        }, (res) => {
            let data = "";
            res.on("data", (c) => data += c);
            res.on("end", () => {
                try { resolve(JSON.parse(data).access_token); }
                catch (e) { reject(e); }
            });
        });
        req.on("error", reject);
        req.write("grant_type=client_credentials");
        req.end();
    });
}

// ─── Verify PayPal webhook signature ─────────────────────────────────────────

function verifyWebhook(token, webhookId, headers, body) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify({
            auth_algo:         headers["paypal-auth-algo"],
            cert_url:          headers["paypal-cert-url"],
            transmission_id:   headers["paypal-transmission-id"],
            transmission_sig:  headers["paypal-transmission-sig"],
            transmission_time: headers["paypal-transmission-time"],
            webhook_id:        webhookId,
            webhook_event:     body,
        });

        const req = https.request({
            hostname: "api-m.paypal.com",
            path:     "/v1/notifications/verify-webhook-signature",
            method:   "POST",
            headers:  {
                "Authorization": `Bearer ${token}`,
                "Content-Type":  "application/json",
                "Content-Length": Buffer.byteLength(payload),
            },
        }, (res) => {
            let data = "";
            res.on("data", (c) => data += c);
            res.on("end", () => {
                try {
                    const result = JSON.parse(data);
                    resolve(result.verification_status === "SUCCESS");
                } catch (e) { reject(e); }
            });
        });
        req.on("error", reject);
        req.write(payload);
        req.end();
    });
}

// ─── Webhook handler ──────────────────────────────────────────────────────────

exports.paypalWebhook = functions
    .runWith({ secrets: [PAYPAL_CLIENT_ID, PAYPAL_SECRET, PAYPAL_WEBHOOK_ID, RESEND_API_KEY] })
    .https.onRequest(async (req, res) => {
        if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

        try {
            const token = await getAccessToken(
                PAYPAL_CLIENT_ID.value(),
                PAYPAL_SECRET.value()
            );

            const verified = await verifyWebhook(
                token,
                PAYPAL_WEBHOOK_ID.value(),
                req.headers,
                req.body
            );

            if (!verified) {
                console.warn("PayPal webhook signature verification failed");
                return res.status(401).send("Unauthorized");
            }
        } catch (err) {
            console.error("Verification error:", err);
            return res.status(500).send("Verification failed");
        }

        const eventType = req.body && req.body.event_type;
        const eventId   = req.body && req.body.id;
        console.log("PayPal event:", eventType, eventId);

        // Replay protection — PayPal delivers webhooks at-least-once and retries
        // failures, so the same event can arrive multiple times. We've already
        // verified the signature above; now dedup on the PayPal event id using an
        // atomic create() (fails if the doc already exists) so a duplicate can
        // never re-run the side effects below. Defence-in-depth on top of the
        // per-user referralRewardSent guard.
        if (eventId) {
            try {
                await db.collection("processedWebhooks").doc(String(eventId)).create({
                    type: eventType || null,
                    at: admin.firestore.FieldValue.serverTimestamp(),
                });
            } catch (e) {
                console.log("Duplicate PayPal webhook ignored:", eventId);
                return res.json({ received: true, duplicate: true });
            }
        }

        try {
            switch (eventType) {

                case "BILLING.SUBSCRIPTION.ACTIVATED": {
                    // resource IS the subscription — custom_id is directly available
                    const sub   = req.body.resource || {};
                    const uid   = sub.custom_id;
                    const subId = sub.id;

                    if (!uid) {
                        console.warn("SUBSCRIPTION.ACTIVATED: no custom_id — cannot identify user");
                        break;
                    }

                    // Detect tier from the PayPal plan_id when available
                    const planId = sub.plan_id || "";
                    const YOLO_PLAN_ID = "P-3WT61990FP2103335NH32GVA"; // same ID as dashboard.html PAYPAL_YOLO_PLAN_ID
                    const tier   = planId === YOLO_PLAN_ID ? "yolo" : "pro";

                    await db.collection("users").doc(uid).set(
                        {
                            plan: tier,
                            paypalSubscriptionId: subId || null,
                            planActivatedAt: admin.firestore.FieldValue.serverTimestamp(),
                        },
                        { merge: true }
                    );
                    console.log(`✅ ${tier.toUpperCase()} activated for uid=${uid}, sub=${subId}`);

                    // Award the referrer (best-effort, idempotent)
                    try { await _grantReferrerReward(uid, tier); } catch (e) { console.warn("referral grant failed", e); }
                    break;
                }

                case "PAYMENT.SALE.COMPLETED": {
                    // resource is a Sale — custom_id lives on the parent subscription
                    const sale  = req.body.resource || {};
                    const subId = sale.billing_agreement_id;
                    if (!subId) break;

                    // Look up user by subscription ID (set during ACTIVATED event)
                    const snap = await db
                        .collection("users")
                        .where("paypalSubscriptionId", "==", subId)
                        .limit(1)
                        .get();

                    if (snap.empty) {
                        console.warn(`SALE.COMPLETED: no user for sub=${subId}`);
                        break;
                    }

                    // A renewal (SALE.COMPLETED) carries only billing_agreement_id —
                    // NOT plan_id — so we can't re-derive the tier here. Preserve the
                    // tier set at ACTIVATED; hardcoding "pro" silently downgraded paying
                    // YOLO subscribers on every monthly charge. Only fall back to "pro"
                    // if the doc somehow lost its paid tier (e.g. ACTIVATED was missed).
                    const existingPlan = (snap.docs[0].data() || {}).plan;
                    const renewTier = (existingPlan === "yolo" || existingPlan === "pro") ? existingPlan : "pro";
                    await snap.docs[0].ref.set(
                        {
                            plan: renewTier,
                            planLastPayment: admin.firestore.FieldValue.serverTimestamp(),
                        },
                        { merge: true }
                    );
                    console.log(`✅ ${renewTier.toUpperCase()} renewed for sub=${subId}`);
                    break;
                }

                case "BILLING.SUBSCRIPTION.CANCELLED":
                case "BILLING.SUBSCRIPTION.EXPIRED":
                case "BILLING.SUBSCRIPTION.SUSPENDED": {
                    const sub   = req.body.resource || {};
                    const subId = sub.id;
                    if (!subId) break;

                    const snap = await db
                        .collection("users")
                        .where("paypalSubscriptionId", "==", subId)
                        .limit(1)
                        .get();

                    if (snap.empty) {
                        console.warn(`No user found for subscription ${subId}`);
                        break;
                    }

                    await snap.docs[0].ref.set(
                        {
                            plan: "free",
                            planCancelledAt: admin.firestore.FieldValue.serverTimestamp(),
                        },
                        { merge: true }
                    );
                    console.log(`⬇️  Plan reverted to free for subscription=${subId}`);
                    break;
                }

                default:
                    break;
            }
        } catch (err) {
            console.error("Error processing event:", err);
            return res.status(500).send("Internal error");
        }

        res.json({ received: true });
    }
);

// ─── Market Data (Twelve Data + Finnhub, server-side cached) ─────────────────

exports.marketData = functions
    .runWith({ secrets: [TWELVE_DATA_KEY, FINNHUB_KEY, RESEND_API_KEY] })
    .https.onCall(async (data, context) => {
        if (!context.auth) {
            throw new functions.https.HttpsError("unauthenticated", "Login required");
        }

        const ticker = (data.ticker || "").toUpperCase().trim();
        if (!ticker || ticker.length > 12) {
            throw new functions.https.HttpsError("invalid-argument", "Invalid ticker");
        }

        const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
        const cacheRef = db.collection("marketDataCache").doc(ticker);

        // Return cached if fresh
        const cached = await cacheRef.get();
        if (cached.exists) {
            const d = cached.data();
            if (Date.now() - d.ts < CACHE_TTL_MS) return d.result;
        }

        const tdKey = TWELVE_DATA_KEY.value();
        const fhKey = FINNHUB_KEY.value();
        const result = { ticker };

        // Helper: fetch JSON via https
        function fetchJson(url) {
            return new Promise((resolve, reject) => {
                https.get(url, res => {
                    let body = "";
                    res.on("data", c => body += c);
                    res.on("end", () => { try { resolve(JSON.parse(body)); } catch { resolve(null); } });
                }).on("error", reject);
            });
        }

        // Fetch everything in parallel
        const tdBase = "https://api.twelvedata.com";
        const sym = encodeURIComponent(ticker);
        const today = new Date().toISOString().split("T")[0];
        const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString().split("T")[0];

        const [quote, rsi, macd, sma50, sma200, news, fundamentals, peers] = await Promise.allSettled([
            fetchJson(`${tdBase}/quote?symbol=${sym}&apikey=${tdKey}`),
            fetchJson(`${tdBase}/rsi?symbol=${sym}&interval=1day&time_period=14&outputsize=1&apikey=${tdKey}`),
            fetchJson(`${tdBase}/macd?symbol=${sym}&interval=1day&outputsize=1&apikey=${tdKey}`),
            fetchJson(`${tdBase}/sma?symbol=${sym}&interval=1day&time_period=50&outputsize=1&apikey=${tdKey}`),
            fetchJson(`${tdBase}/sma?symbol=${sym}&interval=1day&time_period=200&outputsize=1&apikey=${tdKey}`),
            fetchJson(`https://finnhub.io/api/v1/company-news?symbol=${sym}&from=${threeDaysAgo}&to=${today}&token=${fhKey}`),
            fetchJson(`https://finnhub.io/api/v1/stock/metric?metric=all&symbol=${sym}&token=${fhKey}`),
            fetchJson(`https://finnhub.io/api/v1/stock/peers?symbol=${sym}&token=${fhKey}`),
        ]);

        // Quote
        if (quote.status === "fulfilled" && quote.value?.close) {
            const q = quote.value;
            result.price     = parseFloat(q.close).toFixed(2);
            result.open      = parseFloat(q.open).toFixed(2);
            result.high      = parseFloat(q.high).toFixed(2);
            result.low       = parseFloat(q.low).toFixed(2);
            result.change    = parseFloat(q.change).toFixed(2);
            result.changePct = parseFloat(q.percent_change).toFixed(2);
            result.volume    = q.volume ? parseInt(q.volume).toLocaleString() : null;
            result.name      = q.name || ticker;
            result.exchange  = q.exchange || null;
        }

        // RSI
        if (rsi.status === "fulfilled" && rsi.value?.values?.[0]?.rsi) {
            result.rsi = parseFloat(rsi.value.values[0].rsi).toFixed(1);
        }

        // MACD
        if (macd.status === "fulfilled" && macd.value?.values?.[0]) {
            const m = macd.value.values[0];
            result.macd      = parseFloat(m.macd).toFixed(4);
            result.macdSig   = parseFloat(m.macd_signal).toFixed(4);
            result.macdHist  = parseFloat(m.macd_hist).toFixed(4);
        }

        // SMA 50 / 200
        if (sma50.status === "fulfilled" && sma50.value?.values?.[0]?.sma) {
            result.sma50 = parseFloat(sma50.value.values[0].sma).toFixed(2);
        }
        if (sma200.status === "fulfilled" && sma200.value?.values?.[0]?.sma) {
            result.sma200 = parseFloat(sma200.value.values[0].sma).toFixed(2);
        }

        // News (Finnhub)
        if (news.status === "fulfilled" && Array.isArray(news.value)) {
            result.news = news.value.slice(0, 5).map(n => ({
                headline: n.headline,
                source:   n.source,
                url:      n.url,
                datetime: n.datetime,
            }));
        }

        // Fundamentals (Finnhub /stock/metric)
        if (fundamentals.status === "fulfilled" && fundamentals.value?.metric) {
            const m = fundamentals.value.metric;
            const f = {};
            if (m["52WeekHigh"])                  f.week52High      = m["52WeekHigh"];
            if (m["52WeekLow"])                   f.week52Low       = m["52WeekLow"];
            if (m["peNormalizedAnnual"])           f.pe              = m["peNormalizedAnnual"].toFixed(1);
            if (m["epsNormalizedAnnual"])          f.eps             = m["epsNormalizedAnnual"].toFixed(2);
            if (m["revenueGrowthTTMYoy"] != null)  f.revenueGrowth  = (m["revenueGrowthTTMYoy"] * 100).toFixed(1) + "%";
            if (m["grossMarginTTM"] != null)       f.grossMargin    = m["grossMarginTTM"].toFixed(1) + "%";
            if (m["netMarginTTM"] != null)         f.netMargin      = m["netMarginTTM"].toFixed(1) + "%";
            if (m["debtEquityQuarterly"] != null)  f.debtEquity     = m["debtEquityQuarterly"].toFixed(2);
            if (m["marketCapitalization"])         f.marketCap      = m["marketCapitalization"];
            if (m["dividendYieldIndicatedAnnual"]) f.dividendYield  = m["dividendYieldIndicatedAnnual"].toFixed(2) + "%";
            if (m["beta"])                         f.beta           = m["beta"].toFixed(2);
            if (m["roeTTM"] != null)               f.roe            = m["roeTTM"].toFixed(1) + "%";
            if (Object.keys(f).length) result.fundamentals = f;
        }

        // Peers (Finnhub /stock/peers)
        if (peers.status === "fulfilled" && Array.isArray(peers.value)) {
            result.peers = peers.value.filter(p => p !== ticker).slice(0, 5);
        }

        // Cache result
        if (result.price) {
            await cacheRef.set({ ts: Date.now(), result }).catch(() => {});
        }

        return result;
    });


// ── getUserContext ────────────────────────────────────────────────────────────
exports.getUserContext = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Login required');
    }
    const uid = context.auth.uid;
    const snap = await db.collection('users').doc(uid).collection('context').get();
    const ctx = {};
    snap.forEach(doc => { ctx[doc.id] = doc.data(); });

    const parts = [];

    if (ctx.money) {
        const m = ctx.money;
        let line = '[WizeMoney] Income: ' + m.monthlyIncome + '/mo | Expenses: ' + m.monthlyExpenses + '/mo';
        if (m.expenseDelta !== 0) line += ' (' + (m.expenseDelta > 0 ? '+' : '') + m.expenseDelta + '% vs last month)';
        line += '\nTop categories: ' + ((m.topCategories || []).map(c => c.cat + ' ' + c.amt).join(', '));
        line += '\nBank: ' + m.bankBalance + ' | Stocks: ' + m.stocksValue + ' | Net worth: ' + m.netWorth;
        if (m.loansBalance > 0) line += '\nLoans: ' + m.loansBalance + ' (payments: ' + m.loanPayments + '/mo)';
        if (m.subscriptions > 0) line += '\nSubscriptions: ' + m.subscriptions + '/mo';
        if (m.goals && m.goals.length > 0) {
            line += '\nGoals: ' + m.goals.map(g => g.name + ' ' + g.current + '/' + g.target + ' (' + g.pct + '%)').join(' | ');
        }
        parts.push(line);
    }

    if (ctx.tax) {
        const t = ctx.tax;
        let tline = '[WizeTax]';
        if (t.totalIncomeUSD) tline += ' Income: $' + t.totalIncomeUSD;
        if (t.residency) tline += ' | Residency: ' + t.residency;
        if (Array.isArray(t.citizenships) && t.citizenships.length) tline += ' | Citizenships: ' + t.citizenships.join(', ');
        if (t.totalAssetsUSD) tline += ' | Assets: $' + t.totalAssetsUSD;
        if (Array.isArray(t.goals) && t.goals.length) tline += ' | Goals: ' + t.goals.join(', ');
        parts.push(tline);
    }
    if (ctx.travel) {
        const t = ctx.travel;
        const routes = Array.isArray(t.watchedRoutes) ? t.watchedRoutes : [];
        let tline = '[WizeTravel] Watched routes: ' + (routes.join(', ') || 'none');
        if (t.travelBudget) tline += ' | Budget: $' + t.travelBudget;
        if (Array.isArray(t.topDestinations) && t.topDestinations.length) tline += ' | Top destinations: ' + t.topDestinations.join(', ');
        parts.push(tline);
    }
    if (ctx.health) {
        const h = ctx.health;
        let hline = '[WizeHealth]';
        if (h.age) hline += ' Age: ' + h.age;
        if (h.conditions) hline += ' | Conditions: ' + h.conditions;
        if (h.meds) hline += ' | Meds: ' + h.meds;
        if (h.allergies) hline += ' | Allergies: ' + h.allergies;
        parts.push(hline);
    }
    if (ctx.deals) {
        const d = ctx.deals;
        let dline = '[WizeDeal] Deals tracked: ' + (d.dealCount || 0);
        if (d.totalValue) dline += ' | Total value: $' + d.totalValue;
        const countries = Array.isArray(d.countries) ? d.countries : [];
        if (countries.length) dline += ' | Markets: ' + countries.join(', ');
        const strategies = Array.isArray(d.strategies) ? d.strategies : [];
        if (strategies.length) dline += ' | Strategies: ' + strategies.join(', ');
        parts.push(dline);
    }

    return { summary: parts.join('\n'), apps: Object.keys(ctx) };
});

// ─── Daily Firestore backup ───────────────────────────────────────────────────
// Exports the entire `users` + `feedback` collection to a Cloud Storage
// bucket every night at 02:00 UTC. Lets us recover from accidental delete,
// rule mistake, or a corrupted write. Bucket name is derived from project.
// (Cloud Storage is free up to 5 GB total — these exports stay small.)
exports.dailyFirestoreBackup = functions.pubsub
    .schedule('0 2 * * *')
    .timeZone('UTC')
    .onRun(async () => {
        try {
            const project = process.env.GCLOUD_PROJECT || 'finzilla-7f1f9';
            const bucket = 'gs://' + project + '-backups';
            const datestamp = new Date().toISOString().slice(0, 10);
            const outputUriPrefix = bucket + '/' + datestamp;

            const client = new (require('@google-cloud/firestore')).v1.FirestoreAdminClient();
            const [op] = await client.exportDocuments({
                name: client.databasePath(project, '(default)'),
                outputUriPrefix,
                collectionIds: ['users', 'feedback', 'rate_limits'],
            });
            console.log(`✅ Firestore backup started → ${outputUriPrefix} (op=${op.name})`);
            return null;
        } catch (e) {
            console.error('Backup failed', e);
            return null;
        }
    });

// ─── Login alert — email user when a new device signs in ─────────────────────
// Compares the request's UA + IP to the most recent value stored on the user
// doc. If it's new, fires an email "🔐 New sign-in to your WizeLife account"
// with timestamp + UA + approximate location (none, since we don't geocode).
// Triggered by client after Firebase Auth resolves; rate-limited to 1/hour.
exports.notifyLoginAlert = functions
    .runWith({ secrets: [RESEND_API_KEY] })
    .https.onCall(async (data, context) => {
        if (!context.auth) return { skipped: 'no-auth' };
        const uid = context.auth.uid;
        if (!(await _rateLimit('loginAlert', uid, 1))) return { skipped: 'rate-limit' };

        const ua = String(data && data.ua || '').slice(0, 300);
        const platform = String(data && data.platform || '').slice(0, 40);
        const ip = (context.rawRequest && (context.rawRequest.headers['x-forwarded-for'] || context.rawRequest.ip)) || '';
        const fingerprint = (ua + '|' + platform).slice(0, 200);

        const userRef = db.collection('users').doc(uid);
        const userSnap = await userRef.get();
        const u = userSnap.exists ? userSnap.data() : {};
        const knownFingerprints = Array.isArray(u.knownDevices) ? u.knownDevices : [];
        const isNew = !knownFingerprints.includes(fingerprint);

        // Always remember; only email if it's new
        if (isNew) {
            await userRef.set({
                knownDevices: admin.firestore.FieldValue.arrayUnion(fingerprint),
                lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
            }, { merge: true });

            const email = u.email || (await admin.auth().getUser(uid).then(r => r.email).catch(() => null));
            if (email) {
                try {
                    const lang = (u.lang || 'he').slice(0, 2);
                    const TR = {
                        he: { subject: '🔐 כניסה חדשה לחשבון WizeLife', body: 'זיהינו כניסה חדשה לחשבון שלך מהמכשיר הזה:', notyou: 'אם זה לא אתה — שנה סיסמה מיד.' },
                        en: { subject: '🔐 New sign-in to your WizeLife account', body: 'We noticed a new sign-in to your account from this device:', notyou: 'If this wasn\'t you, change your password immediately.' },
                        pt: { subject: '🔐 Novo login na sua conta WizeLife', body: 'Detectamos um novo login na sua conta a partir deste dispositivo:', notyou: 'Se não foi você, altere a senha imediatamente.' },
                        es: { subject: '🔐 Nuevo inicio de sesión en tu cuenta WizeLife', body: 'Detectamos un nuevo inicio de sesión desde este dispositivo:', notyou: 'Si no fuiste tú, cambia tu contraseña de inmediato.' },
                    };
                    const t = TR[lang] || TR.en;
                    const resend = new Resend(RESEND_API_KEY.value());
                    await resend.emails.send({
                        from: 'WizeLife Security <noreply@wizelife.ai>',
                        to: email,
                        subject: t.subject,
                        html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:24px auto;background:#fff;border-radius:12px;padding:24px;border:1px solid #e2e8f0">
                          <h2 style="color:#dc2626;margin:0 0 12px">🔐 ${t.subject}</h2>
                          <p style="color:#1e293b;line-height:1.6">${t.body}</p>
                          <pre style="background:#f1f5f9;padding:10px 14px;border-radius:8px;font-size:.78rem;color:#475569;white-space:pre-wrap;word-break:break-all">${ua}\n${platform}\n${ip}</pre>
                          <p style="color:#dc2626;font-weight:700;margin-top:16px">${t.notyou}</p>
                        </div>`,
                    });
                    console.log(`📨 login alert sent → ${email}`);
                } catch (e) { console.warn('login alert email failed', e); }
            }
        }
        return { isNew };
    });

// ─── logEvent — universal funnel beacon ───────────────────────────────────────
// The Next.js / React sub-apps can't load the compat `firebase` global that
// wize-track.js needs, so they POST a small JSON event here instead. We write to
// /events via the Admin SDK (which bypasses App Check + rules — so we validate &
// sanitize here ourselves). CORS-restricted to our own origins; rate-limited by
// anonId. Mirrors the schema written by the client tracker.
const TRACK_ORIGINS = [
    'https://wizelife.ai',
    // Custom subdomains the apps are actually served from (Cloudflare proxy) —
    // the browser sends THESE as the Origin, not the underlying host.
    'https://deal.wizelife.ai',
    'https://tax.wizelife.ai',
    'https://money.wizelife.ai',
    'https://health.wizelife.ai',
    'https://travel.wizelife.ai',
    // Underlying hosts (kept as fallback / direct access).
    'https://finsightai.github.io',
    'https://check-deal.vercel.app',
    'https://mastermove.vercel.app',
    'https://wizehealth-3ol2retcla-uc.a.run.app', // WizeHealth backend (migrated off Render → Cloud Run)
    'https://wizetravel.hf.space',
    'https://ofirofir-wizetravel.hf.space',
];

function _trkStr(v, max) { return (typeof v === 'string') ? v.slice(0, max) : ''; }

exports.logEvent = functions
    .runWith({ memory: '128MB' })
    .https.onRequest(async (req, res) => {
        const origin = req.headers.origin || '';
        const allowed = TRACK_ORIGINS.indexOf(origin) >= 0;
        if (allowed) {
            res.set('Access-Control-Allow-Origin', origin);
            res.set('Vary', 'Origin');
            res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
            res.set('Access-Control-Allow-Headers', 'Content-Type');
            res.set('Access-Control-Max-Age', '3600');
        }
        if (req.method === 'OPTIONS') return res.status(204).send('');
        if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
        // Disallowed origin → silently drop (204). Returning 403 here polluted the
        // function/execution_count metric with bot-noise (~30-120 hits/5min from
        // scrapers without Origin headers), making the error-spike alert useless.
        // The request is still dropped (no Firestore write); we just don't 4xx
        // back. Real server errors (5xx) below still surface to the alert.
        if (!allowed) return res.status(204).send('');

        try {
            const b = (req.body && typeof req.body === 'object') ? req.body : {};
            const app = _trkStr(b.app, 24);
            const event = _trkStr(b.event, 40);
            const anonId = _trkStr(b.anonId, 64);
            if (!app || !event || !anonId) return res.status(400).json({ error: 'app, event, anonId required' });

            if (!(await _rateLimit('logEvent', anonId, 60))) return res.status(429).json({ error: 'rate' });

            // Sanitize meta → short scalars only (no PII / free text).
            const meta = {};
            if (b.meta && typeof b.meta === 'object') {
                Object.keys(b.meta).slice(0, 8).forEach((k) => {
                    let v = b.meta[k];
                    if (typeof v === 'string') v = v.slice(0, 60);
                    if (v === null || ['string', 'number', 'boolean'].indexOf(typeof v) >= 0) meta[String(k).slice(0, 30)] = v;
                });
            }

            const now = new Date();
            const utcDay = now.getUTCFullYear() + '-' + String(now.getUTCMonth() + 1).padStart(2, '0') + '-' + String(now.getUTCDate()).padStart(2, '0');

            await db.collection('events').add({
                app, event,
                uid: _trkStr(b.uid, 128) || null,
                anonId,
                sessionId: _trkStr(b.sessionId, 64) || 'beacon',
                ts: admin.firestore.FieldValue.serverTimestamp(),
                day: _trkStr(b.day, 10) || utcDay,
                lang: _trkStr(b.lang, 8) || 'he',
                path: _trkStr(b.path, 120),
                meta,
                via: 'beacon',
            });
            return res.status(204).send('');
        } catch (e) {
            console.warn('logEvent failed', e);
            return res.status(500).json({ error: 'failed' });
        }
    });




// ─── captureLeadEmail — landing page inline email capture ────────────────────
// Called from /p/relocate-*.html widgets after user sees their savings number.
// Body: { email, source, lang, savingsUSD, country }
// Returns 204 on success (or silently on invalid origin/rate-limit).
exports.captureLeadEmail = functions
    .runWith({ secrets: [RESEND_API_KEY], memory: '256MB' })
    .https.onRequest(async (req, res) => {
        const ALLOWED = ['https://wizelife.ai', 'https://finsightai.github.io'];
        const origin = req.headers.origin || '';
        if (ALLOWED.includes(origin)) {
            res.set('Access-Control-Allow-Origin', origin);
            res.set('Vary', 'Origin');
            res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
            res.set('Access-Control-Allow-Headers', 'Content-Type');
            res.set('Access-Control-Max-Age', '3600');
        }
        if (req.method === 'OPTIONS') return res.status(204).send('');
        if (req.method !== 'POST') return res.status(405).send('');
        if (!ALLOWED.includes(origin)) return res.status(204).send('');

        const b = (req.body && typeof req.body === 'object') ? req.body : {};
        if (typeof b.email === 'string' && /[<>"'`]/.test(b.email)) return res.status(400).json({ error: 'invalid email' });
        const email = (typeof b.email === 'string') ? b.email.trim().toLowerCase().slice(0, 254) : '';
        if (!email || !email.includes('@') || email.indexOf('.') < 0) return res.status(400).json({ error: 'invalid email' });

        // Rate limit: 5 submissions per email per minute
        if (!(await _rateLimit('captureLead', email, 5))) return res.status(429).json({ error: 'rate' });

        const lang       = ['he','en','pt','es'].includes(b.lang) ? b.lang : 'en';
        const source     = typeof b.source === 'string' ? b.source.slice(0, 60) : 'landing';
        const savingsRaw = (typeof b.savingsUSD === 'number' && isFinite(b.savingsUSD)) ? Math.round(b.savingsUSD) : 0;
        const country    = (typeof b.country === 'string') ? b.country.slice(0, 40).replace(/[^a-z]/g, '') : '';

        const fmt = n => n >= 1e6 ? '$' + (n/1e6).toFixed(1) + 'M' : '$' + Math.round(n).toLocaleString();
        const savingsStr = savingsRaw > 1000 ? fmt(savingsRaw) : null;

        const COUNTRIES = {
            uae:      { flag: '\u{1F1E6}\u{1F1EA}', he: '\u05D0\u05D9\u05D7\u05D5\u05D3 \u05D4\u05D0\u05DE\u05D9\u05E8\u05D5\u05D9\u05D5\u05EA', en: 'UAE',       pt: 'EAU',       es: 'EAU'        },
            cyprus:   { flag: '\u{1F1E8}\u{1F1FE}', he: '\u05E7\u05E4\u05E8\u05D9\u05E1\u05D9\u05DF',        en: 'Cyprus',    pt: 'Chipre',    es: 'Chipre'     },
            italy:    { flag: '\u{1F1EE}\u{1F1F9}', he: '\u05D0\u05D9\u05D8\u05DC\u05D9\u05D4',         en: 'Italy',     pt: 'It\u00E1lia',   es: 'Italia'     },
            greece:   { flag: '\u{1F1EC}\u{1F1F7}', he: '\u05D9\u05D5\u05D5\u05DF',           en: 'Greece',    pt: 'Gr\u00E9cia',   es: 'Grecia'     },
            brazil:   { flag: '\u{1F1E7}\u{1F1F7}', he: '\u05D1\u05E8\u05D6\u05D9\u05DC',          en: 'Brazil',    pt: 'Brasil',    es: 'Brasil'     },
            usa:      { flag: '\u{1F1FA}\u{1F1F8}', he: '\u05D0\u05E8\u05D4"\u05D1',          en: 'USA',       pt: 'EUA',       es: 'EE.UU.'     },
            bali:     { flag: '\u{1F1EE}\u{1F1E9}', he: '\u05D1\u05D0\u05DC\u05D9',           en: 'Bali',      pt: 'Bali',      es: 'Bali'       },
            thailand: { flag: '\u{1F1F9}\u{1F1ED}', he: '\u05EA\u05D0\u05D9\u05DC\u05E0\u05D3',         en: 'Thailand',  pt: 'Tail\u00E2ndia', es: 'Tailandia'  },
            portugal: { flag: '\u{1F1F5}\u{1F1F9}', he: '\u05E4\u05D5\u05E8\u05D8\u05D5\u05D2\u05DC',        en: 'Portugal',  pt: 'Portugal',  es: 'Portugal'   },
        };
        const ci = COUNTRIES[country] || { flag: '\uD83C\uDF0D', he: country, en: country, pt: country, es: country };
        const cname = ci[lang] || ci.en;
        const cflag = ci.flag;

        const T = {
            he: {
                subject: savingsStr ? cflag + ' \u05D7\u05E1\u05DB\u05EA ' + savingsStr + ' \u05D1-10 \u05E9\u05E0\u05D9\u05DD \u2014 ' + cname + ' \u05DE\u05D5\u05DC \u05D9\u05E9\u05E8\u05D0\u05DC'
                                    : cflag + ' \u05D4\u05DE\u05D3\u05E8\u05D9\u05DA \u05E9\u05DC\u05DA \u05DC' + cname + ' \u05DE-WizeLife',
                title:   savingsStr ? '\u05D7\u05E1\u05DB\u05EA ' + savingsStr + ' \u05D1-10 \u05E9\u05E0\u05D9\u05DD' : '\u05D4\u05DE\u05D3\u05E8\u05D9\u05DA \u05E9\u05DC\u05DA \u05DC' + cname,
                sub:     '\u05D9\u05E9\u05E8\u05D0\u05DC \u05DE\u05D5\u05DC ' + cname + ' \u2014 \u05E0\u05D9\u05EA\u05D5\u05D7 \u05D0\u05D9\u05E9\u05D9',
                savingsLabel: '\u05D7\u05D9\u05E1\u05DB\u05D5\u05DF \u05DE\u05E6\u05D8\u05D1\u05E8 \u05D1-10 \u05E9\u05E0\u05D9\u05DD \u05DE\u05D5\u05DC \u05D9\u05E9\u05E8\u05D0\u05DC',
                tip1: 'WizeTax \u05DE\u05D7\u05E9\u05D1 \u05D0\u05EA \u05DE\u05E1 \u05D4\u05D9\u05E6\u05D9\u05D0\u05D4 \u05D4\u05D0\u05D9\u05E9\u05D9 \u05E9\u05DC\u05DA',
                tip2: '\u05EA\u05D6\u05DE\u05D5\u05DF \u05D0\u05D5\u05E4\u05D8\u05D9\u05DE\u05DC\u05D9 \u05E2\u05D1\u05D5\u05E8 \u2014 \u05DE\u05EA\u05D9 \u05E4\u05D3\u05D0\u05D9 \u05DC\u05E2\u05D6\u05D5\u05D1',
                tip3: '\u05D4\u05E9\u05D5\u05D5\u05D0\u05D4 \u05DC-8 \u05DE\u05D3\u05D9\u05E0\u05D5\u05EA \u05E0\u05D5\u05E1\u05E4\u05D5\u05EA \u05D1\u05DC\u05D7\u05D9\u05E6\u05D4',
                cta:  '\u05E4\u05EA\u05D7 \u05D7\u05E9\u05D1\u05D5\u05DF \u05D7\u05D9\u05E0\u05DD \u2190',
                footer: 'WizeLife \u00B7 \u05E0\u05E9\u05DC\u05D7 \u05DB\u05D9 \u05D4\u05DB\u05E0\u05E1\u05EA \u05D0\u05EA \u05D4\u05D0\u05D9\u05DE\u05D9\u05D9\u05DC \u05E9\u05DC\u05DA \u05D1\u05D3\u05E3 \u05D4\u05DE\u05D7\u05E9\u05D1\u05D5\u05DF',
                dir:  'rtl',
            },
            en: {
                subject: savingsStr ? cflag + " You'd save " + savingsStr + " in 10 years \u2014 " + cname + " vs Israel"
                                    : cflag + " Your " + cname + " tax guide from WizeLife",
                title:   savingsStr ? "You'd save " + savingsStr + " in 10 years" : "Your " + cname + " tax guide",
                sub:     "Israel vs " + cname + " \u2014 personalized analysis",
                savingsLabel: "10-year cumulative savings vs Israel",
                tip1: "WizeTax calculates your personal exit tax",
                tip2: "Optimal timing \u2014 when to actually make the move",
                tip3: "Compare 8 more countries in one click",
                cta:  "Sign up free \u2192",
                footer: "WizeLife \u00B7 sent because you entered your email on the calculator page",
                dir:  'ltr',
            },
            pt: {
                subject: savingsStr ? cflag + " Pouparia " + savingsStr + " em 10 anos \u2014 " + cname + " vs Israel"
                                    : cflag + " O seu guia fiscal de " + cname + " da WizeLife",
                title:   savingsStr ? "Pouparia " + savingsStr + " em 10 anos" : "O seu guia fiscal de " + cname,
                sub:     "Israel vs " + cname + " \u2014 an\u00E1lise personalizada",
                savingsLabel: "Poupan\u00E7a cumulativa de 10 anos vs Israel",
                tip1: "WizeTax calcula o seu imposto de sa\u00EDda pessoal",
                tip2: "Timing ideal \u2014 quando fazer a mudan\u00E7a",
                tip3: "Compare mais 8 pa\u00EDses com um clique",
                cta:  "Registar gr\u00E1tis \u2192",
                footer: "WizeLife \u00B7 enviado porque introduziu o seu e-mail na p\u00E1gina da calculadora",
                dir:  'ltr',
            },
            es: {
                subject: savingsStr ? cflag + " Ahorrar\u00EDas " + savingsStr + " en 10 a\u00F1os \u2014 " + cname + " vs Israel"
                                    : cflag + " Tu gu\u00EDa fiscal de " + cname + " de WizeLife",
                title:   savingsStr ? "Ahorrar\u00EDas " + savingsStr + " en 10 a\u00F1os" : "Tu gu\u00EDa fiscal de " + cname,
                sub:     "Israel vs " + cname + " \u2014 an\u00E1lisis personalizado",
                savingsLabel: "Ahorro acumulado de 10 a\u00F1os vs Israel",
                tip1: "WizeTax calcula tu impuesto de salida personal",
                tip2: "Timing \u00F3ptimo \u2014 cu\u00E1ndo hacer el movimiento",
                tip3: "Compara 8 pa\u00EDses m\u00E1s en un clic",
                cta:  "Registrarse gratis \u2192",
                footer: "WizeLife \u00B7 enviado porque introdujiste tu email en la p\u00E1gina de la calculadora",
                dir:  'ltr',
            },
        };

        const t = T[lang];

        const savingsCard = savingsStr
            ? `<div style="background:linear-gradient(135deg,#064e3b,#065f46);border:1px solid #10b981;border-radius:14px;padding:20px 24px;text-align:center;margin:20px 0;"><div style="font-size:0.75rem;font-weight:700;color:#6ee7b7;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">${t.savingsLabel}</div><div style="font-size:2.6rem;font-weight:900;color:#6ee7b7;line-height:1.1;">${savingsStr}</div><div style="font-size:0.85rem;color:#a7f3d0;margin-top:4px;">${cflag} ${cname}</div></div>`
            : '';

        const html = `<!DOCTYPE html><html dir="${t.dir}" lang="${lang}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0;background:#0d0f1a;font-family:Arial,sans-serif;"><div style="max-width:520px;margin:32px auto;background:#11142a;border-radius:18px;padding:36px 28px;border:1px solid rgba(255,255,255,0.08);"><div style="text-align:center;margin-bottom:20px;"><span style="font-size:2.2rem;">${cflag}</span><h1 style="margin:10px 0 4px;font-size:1.5rem;font-weight:900;color:#eef2ff;">${t.title}</h1><p style="margin:0;font-size:0.88rem;color:#9ca3af;">${t.sub}</p></div>${savingsCard}<div style="margin:20px 0;background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.2);border-radius:12px;padding:16px;"><div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:10px;"><span style="font-size:1.1rem;flex-shrink:0;">🧮</span><span style="color:#cbd5e1;font-size:0.88rem;">${t.tip1}</span></div><div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:10px;"><span style="font-size:1.1rem;flex-shrink:0;">⏱️</span><span style="color:#cbd5e1;font-size:0.88rem;">${t.tip2}</span></div><div style="display:flex;align-items:flex-start;gap:10px;"><span style="font-size:1.1rem;flex-shrink:0;">🌍</span><span style="color:#cbd5e1;font-size:0.88rem;">${t.tip3}</span></div></div><div style="text-align:center;margin-top:24px;"><a href="https://wizelife.ai/auth.html?next=%2Fdashboard.html&utm_source=lead_email&utm_campaign=${country}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#a855f7);color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:800;font-size:1rem;">${t.cta}</a></div><p style="margin-top:28px;font-size:0.75rem;color:#475569;text-align:center;">${t.footer}</p></div></body></html>`;

        // Save lead to Firestore
        try {
            await db.collection('leads').add({
                email,
                source,
                country,
                lang,
                savingsUSD: savingsRaw,
                capturedAt: admin.firestore.FieldValue.serverTimestamp(),
                drip1_sent: false,
                drip2_sent: false,
                drip3_sent: false,
            });
        } catch (e) { console.warn('lead save failed', e.message); }

        let resendKey;
        try { resendKey = RESEND_API_KEY.value(); } catch (e) { resendKey = ''; }
        if (!resendKey) return res.status(204).send('');

        const resend = new Resend(resendKey);

        // Add to Resend audience
        try {
            await resend.contacts.create({
                email,
                audienceId: 'd266041d-86c8-4d43-8da9-cd2a10a4ad23',
                unsubscribed: false,
                firstName: email.split('@')[0],
            });
        } catch (e) { console.warn('Resend audience add failed', e.message); }

        // Send immediate personalized email
        try {
            await resend.emails.send({
                from:    'WizeLife <noreply@wizelife.ai>',
                to:      email,
                subject: t.subject,
                html,
            });
            console.log('captureLeadEmail sent to', email, country, savingsStr || 'no-savings');
        } catch (e) { console.warn('captureLeadEmail send failed', e.message); }

        return res.status(204).send('');
    });

// ─── SSO: issue custom token from Firebase ID token ──────────────────────────
// Sub-apps (WizeTravel, WizeTax) receive a Firebase ID token via URL SSO but
// cannot call signInWithCustomToken with it. This function exchanges a valid ID
// token for a custom token, allowing the client SDK to materialise a session and
// activate CloudBackup. Rate-limited server-side; no secrets needed.
exports.issueCustomToken = functions.https.onCall(async (data) => {
    const idToken = data && data.idToken;
    if (!idToken || typeof idToken !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'idToken required');
    }
    try {
        const decoded = await admin.auth().verifyIdToken(idToken);
        const customToken = await admin.auth().createCustomToken(decoded.uid);
        return { customToken };
    } catch (e) {
        console.warn('issueCustomToken failed', e.message);
        throw new functions.https.HttpsError('unauthenticated', 'Invalid or expired token');
    }
});

// ─── GDPR: complete account + data deletion ──────────────────────────────────
// The old client-side delete (account.html) only cleared a few subcollections
// and the users/{uid} doc — leaving context / cross_app / checkdeal_deals /
// consent subcollections AND the whole userBackups/{uid} mirror behind
// (Firestore does NOT cascade-delete subcollections when a parent doc is
// deleted). This callable uses recursiveDelete to erase the entire tree for the
// caller, plus their cloud-backup mirror, plus the Auth account — so "delete my
// account" actually removes everything. Auth-only: a user can only delete self.
exports.deleteUserAccount = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Sign in first");
    }
    const uid = context.auth.uid;
    const fs = admin.firestore();

    // recursiveDelete clears the doc AND every nested subcollection.
    await fs.recursiveDelete(fs.collection("users").doc(uid));
    await fs.recursiveDelete(fs.collection("userBackups").doc(uid));

    // Best-effort Auth deletion (Firestore data is already gone regardless).
    let authDeleted = false;
    try { await admin.auth().deleteUser(uid); authDeleted = true; }
    catch (e) { console.warn("deleteUserAccount: auth delete failed", e.message); }

    return { deleted: true, authDeleted };
});

// ─── CSP violation report collector ──────────────────────────────────────────
// Receives Content-Security-Policy violation reports (report-uri / report-to)
// from the apps, so genuine XSS / inline-script attempts and CSP misconfig become
// visible. Browser extensions generate the bulk of real-world CSP noise, so those
// are filtered out. No auth (browsers post anonymously); capped + never throws.
exports.cspReport = functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') return res.status(204).send('');
    if (req.method !== 'POST') return res.status(405).send('');
    try {
        const body = req.body || {};
        // report-uri → { "csp-report": {...} } ; report-to → [ { body: {...} }, ... ]
        const raw = Array.isArray(body) ? body.map(r => (r && r.body) || r) : [body['csp-report'] || body];
        const NOISE = /^(chrome|moz|safari|webkit)-extension:|^about:|^chrome:|^data:text\/html/i;
        const trunc = (s, n) => (typeof s === 'string' ? s.slice(0, n) : '');
        for (const r of raw.slice(0, 5)) { // cap per request — no write-spam
            if (!r || typeof r !== 'object') continue;
            const blocked = r['blocked-uri'] || r.blockedURL || '';
            const source  = r['source-file'] || r.sourceFile || '';
            if (NOISE.test(blocked) || NOISE.test(source)) continue; // extension noise
            await db.collection('cspReports').add({
                directive:   trunc(r['violated-directive'] || r['effective-directive'] || r.effectiveDirective, 80),
                blockedUri:  trunc(blocked, 300),
                documentUri: trunc(r['document-uri'] || r.documentURL, 300),
                sourceFile:  trunc(source, 300),
                at: admin.firestore.FieldValue.serverTimestamp(),
            }).catch(() => {});
        }
    } catch (e) { /* never fail a report */ }
    return res.status(204).send('');
});

// ─── FinSight Terminal — background price-push alerts ─────────────────────────
// The FinSight PWA (finsight-terminal.vercel.app) registers a Web-Push
// subscription + its price-alert rules here; a 5-minute cron checks live prices
// and pushes a notification when a target is hit — even when the app is closed.
//
// Secret (set via `firebase functions:secrets:set VAPID_PRIVATE`):
//   VAPID_PRIVATE — the VAPID private key (public key is below + in the client).
const webpush       = require("web-push");
const crypto        = require("crypto");
const VAPID_PRIVATE = defineSecret("VAPID_PRIVATE");
const VAPID_PUBLIC  = "BHwC1Eq9iPE0pw9acgTjT7VZBE2OVFtrYZnvK_OklVATa5iRjpcIDeSk0XP99z47YNfbJunxkKwTRLMUNkcgR5U";
const FINSIGHT_API  = "https://finsight-terminal.vercel.app";
const FINSIGHT_ORIGIN = "https://finsight-terminal.vercel.app";
const pushSubId = (endpoint) => crypto.createHash("sha256").update(endpoint).digest("hex").slice(0, 32);

// Save / update / clear a device's push subscription + alert rules.
exports.finsightSavePush = functions.https.onRequest(async (req, res) => {
    res.set("Access-Control-Allow-Origin", FINSIGHT_ORIGIN);
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(204).send("");
    if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
    try {
        const { subscription, alerts, symbols, signals } = req.body || {};
        if (!subscription || !subscription.endpoint) return res.status(400).json({ error: "no subscription" });
        const id = pushSubId(subscription.endpoint);
        const ref = db.collection("finsightPush").doc(id);
        const clean = (Array.isArray(alerts) ? alerts : [])
            .map((a) => {
                const o = { symbol: String(a.symbol || ""), dir: a.dir === "below" ? "below" : "above", price: Number(a.price) };
                const trail = Number(a.trail);
                if (trail > 0) { o.trail = trail; o.peak = Number(a.peak) || o.price; }
                return o;
            })
            .filter((a) => a.symbol && a.price > 0);
        // Symbols to watch for background technical signals (150-day MA cross) + earnings.
        const watchSymbols = [...new Set((Array.isArray(symbols) ? symbols : [])
            .map((s) => String(s || "").toUpperCase().trim()).filter(Boolean))].slice(0, 80);
        const wantSignals = signals !== false && watchSymbols.length > 0;
        const prev = (await ref.get()).data() || {};
        if (!clean.length && !wantSignals) { // nothing left to track → drop the device record
            await ref.delete().catch(() => {});
            return res.json({ ok: true, cleared: true });
        }
        // Merge trailing peaks with any peak already stored — the cloud peak only ever
        // rises, so a stale client (peak frozen while it was closed) can't lower the stop.
        const prevPeak = {};
        (prev.alerts || []).forEach((a) => { if (a.trail) prevPeak[a.symbol] = a.peak; });
        clean.forEach((a) => {
            if (a.trail) {
                a.peak = Math.max(a.peak || 0, prevPeak[a.symbol] || 0);
                a.price = Math.round(a.peak * (1 - a.trail / 100) * 100) / 100;
            }
        });
        await ref.set({
            subscription,
            alerts: clean,
            watchSymbols: wantSignals ? watchSymbols : [],
            signals: wantSignals,
            ma150: prev.ma150 || {},           // preserve 150-MA cross baseline across saves
            earnPushed: prev.earnPushed || {}, // remember which earnings dates we've already pushed
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        res.json({ ok: true, alerts: clean.length, watching: wantSignals ? watchSymbols.length : 0 });
    } catch (e) {
        console.error("finsightSavePush", e);
        res.status(500).json({ error: String(e.message || e) });
    }
});

// Every 5 minutes: check live prices against stored alerts; push when hit.
exports.finsightCheckAlerts = functions
    .runWith({ secrets: [VAPID_PRIVATE] })
    .pubsub.schedule("every 5 minutes")
    .timeZone("UTC")
    .onRun(async () => {
        // Cross-app keepalive (free): WizeHealth runs on Cloud Run with
        // min-instances=0, so the first visitor after an idle gap eats a
        // ~2-3s cold start. This job already fires every 5 min (well inside
        // Cloud Run's idle window) via an existing Scheduler trigger, so a
        // cheap fire-and-forget ping keeps that instance warm at $0 — no paid
        // min-instance, no extra Scheduler job. Lives here purely because this
        // is the only thing already running every 5 min.
        try {
            await fetch("https://wizehealth-1027614800253.us-central1.run.app/api/config", { signal: AbortSignal.timeout(8000) });
        } catch (_) { /* keepalive is best-effort; never blocks alert delivery */ }

        const snap = await db.collection("finsightPush").get();
        if (snap.empty) return null;
        webpush.setVapidDetails("mailto:ofirshamir57@gmail.com", VAPID_PUBLIC, VAPID_PRIVATE.value());

        // Two kinds of symbols: price-alert targets (need a live quote) and
        // signal-watch tickers (need the technical read + earnings calendar).
        const priceSyms = new Set(), watchSyms = new Set();
        snap.forEach((d) => {
            const data = d.data();
            (data.alerts || []).forEach((a) => priceSyms.add(a.symbol));
            if (data.signals) (data.watchSymbols || []).forEach((s) => watchSyms.add(s));
        });
        if (!priceSyms.size && !watchSyms.size) return null;

        // Quotes (live price + display name) for the union, in ≤40-symbol chunks.
        const quoteSyms = [...new Set([...priceSyms, ...watchSyms])], prices = {};
        for (let i = 0; i < quoteSyms.length; i += 40) {
            const chunk = quoteSyms.slice(i, i + 40);
            try {
                const r = await fetch(`${FINSIGHT_API}/api/quote?symbols=${encodeURIComponent(chunk.join(","))}`).then((x) => x.json());
                (r.quotes || []).forEach((q) => q.symbol && q.price != null && !q.error && (prices[q.symbol] = q));
            } catch (e) { console.error("finsight quote fetch", e.message); }
        }
        const nameOf = (sym) => (prices[sym] && (prices[sym].ticker || prices[sym].name)) || sym;

        // Technical read (above150 / verdict) for watched tickers — analyze is per-symbol, so fan out with bounded concurrency.
        const tech = {};
        const wsyms = [...watchSyms];
        let wi = 0;
        await Promise.all(Array.from({ length: Math.min(6, wsyms.length) }, async () => {
            while (wi < wsyms.length) {
                const sym = wsyms[wi++];
                try {
                    const r = await fetch(`${FINSIGHT_API}/api/analyze?symbol=${encodeURIComponent(sym)}`).then((x) => x.json());
                    if (r && r.analysis && r.analysis.above150 != null) tech[sym] = { above150: !!r.analysis.above150, verdict: r.analysis.verdict };
                } catch (e) { console.error("finsight analyze", sym, e.message); }
            }
        }));

        // Upcoming earnings for watched tickers, in ≤25-symbol chunks.
        const earn = {};
        for (let i = 0; i < wsyms.length; i += 25) {
            const chunk = wsyms.slice(i, i + 25);
            try {
                const r = await fetch(`${FINSIGHT_API}/api/earnings?symbols=${encodeURIComponent(chunk.join(","))}`).then((x) => x.json());
                Object.assign(earn, r.earnings || {});
            } catch (e) { console.error("finsight earnings", e.message); }
        }
        const todayISO = new Date().toISOString().slice(0, 10);
        const daysUntil = (iso) => Math.round((Date.parse(iso + "T00:00:00Z") - Date.parse(todayISO + "T00:00:00Z")) / 86400000);

        const jobs = [];
        snap.forEach((doc) => {
            const data = doc.data();
            const send = (title, body, symbol) => jobs.push(
                webpush.sendNotification(data.subscription, JSON.stringify({ title, body, symbol })).catch((err) => {
                    if (err.statusCode === 404 || err.statusCode === 410) return doc.ref.delete();
                    console.error("finsight push", err.statusCode);
                })
            );

            // ── price-target + trailing-stop alerts ──
            const remaining = [], fired = [];
            let mutated = false; // a trailing peak ratcheted up → persist even if nothing fired
            (data.alerts || []).forEach((a) => {
                const q = prices[a.symbol], p = q && q.price;
                if (a.trail && p != null) { // trailing stop: ratchet the peak; the trigger only rises
                    const peak = Math.max(a.peak || p, p);
                    if (peak !== a.peak) { a.peak = peak; mutated = true; }
                    const trig = Math.round(peak * (1 - a.trail / 100) * 100) / 100;
                    if (trig !== a.price) { a.price = trig; mutated = true; }
                }
                const hit = p != null && (a.dir === "above" ? p >= a.price : p <= a.price);
                if (hit) fired.push({ a, p, name: (q.ticker || q.name || a.symbol) });
                else remaining.push(a);
            });
            fired.forEach((f) => send(
                f.a.trail ? `${f.name} 🛑 trailing stop ${f.a.price}` : `${f.name} ${f.a.dir === "above" ? "↑" : "↓"} ${f.a.price}`,
                `${f.a.dir === "below" ? "Dropped to" : "Rose to"} ${f.p}`,
                f.a.symbol
            ));

            // ── technical signals: 150-day MA cross + upcoming earnings ──
            const ma150 = { ...(data.ma150 || {}) }, earnPushed = { ...(data.earnPushed || {}) };
            let sigMutated = false;
            if (data.signals) (data.watchSymbols || []).forEach((sym) => {
                const t = tech[sym];
                if (t) {
                    const prevAbove = ma150[sym];
                    if (prevAbove != null && prevAbove !== t.above150) // a genuine flip since last run
                        send(`${nameOf(sym)} ${t.above150 ? "📈 reclaimed 150-day MA" : "📉 lost 150-day MA"}`,
                            t.above150 ? "Long-term trend turned bullish." : "Long-term trend turned cautious — protect the position.", sym);
                    if (prevAbove !== t.above150) { ma150[sym] = t.above150; sigMutated = true; }
                }
                const e = earn[sym];
                if (e && e.date) {
                    const d = daysUntil(e.date);
                    if (d >= 0 && d <= 2 && earnPushed[sym] !== e.date) { // report imminent, not yet pushed
                        send(`${nameOf(sym)} 📅 earnings ${d === 0 ? "today" : d === 1 ? "tomorrow" : "in " + d + " days"}`,
                            `Reports on ${e.date}${e.hour ? " (" + e.hour + ")" : ""}.`, sym);
                        earnPushed[sym] = e.date; sigMutated = true;
                    }
                }
            });
            for (const s in earnPushed) if (daysUntil(earnPushed[s]) < -2) { delete earnPushed[s]; sigMutated = true; } // bound growth

            // ── persist all changes for this device in a single write ──
            if (fired.length && !remaining.length && !data.signals) { jobs.push(doc.ref.delete()); return; }
            const upd = {};
            if (fired.length || mutated) upd.alerts = remaining;
            if (sigMutated) { upd.ma150 = ma150; upd.earnPushed = earnPushed; }
            if (Object.keys(upd).length) jobs.push(doc.ref.update(upd));
        });
        await Promise.all(jobs);
        console.log(`finsightCheckAlerts: ${snap.size} device(s), ${priceSyms.size} price, ${watchSyms.size} watch`);
        return null;
    });
