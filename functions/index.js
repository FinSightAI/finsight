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

const functions        = require("firebase-functions");
const { defineSecret } = require("firebase-functions/params");
const admin            = require("firebase-admin");
const https            = require("https");
const nodemailer       = require("nodemailer");

admin.initializeApp();
const db = admin.firestore();

// ─── Referral reward helpers ──────────────────────────────────────────────────
// Tier rank — higher number = bigger benefit. Used so a YOLO reward isn't
// downgraded to PRO if the referrer is already on a higher plan.
const TIER_RANK = { free: 0, pro: 1, yolo: 2 };
const REWARD_DAYS = 30;

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
 * Best-effort: reads GMAIL_EMAIL + GMAIL_APP_PASSWORD secrets directly. If
 * the caller didn't declare them in runWith, .value() returns '' and we
 * silently skip — Firestore record still has the bonus.
 */
async function _emailReferralBonus(referrerUid, tier, days) {
    let gmailUser, gmailPass;
    try { gmailUser = GMAIL_EMAIL.value(); }    catch (e) { gmailUser = ''; }
    try { gmailPass = GMAIL_PASSWORD.value(); } catch (e) { gmailPass = ''; }
    if (!gmailUser || !gmailPass) {
        console.log('referral email skipped — gmail secrets not bound');
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
        he: { subject: '🎁 חבר שלך הצטרף — קיבלת ' + days + ' ימי ' + tier.toUpperCase() + ' חינם!', greet: 'יששש 🎉', body: 'חבר שהזמנת ל-WizeLife שדרג עכשיו, ובזכות זה — הוסף לך:', got: days + ' ימים של ' + tier.toUpperCase(), already: 'כבר נטען לחשבון שלך — אין צורך בקוד.', cta: 'לאפליקציות שלי', sign: 'תודה על השיתוף,\nאופיר · WizeLife' },
        en: { subject: '🎁 Your friend joined — you got ' + days + ' free days of ' + tier.toUpperCase() + '!', greet: 'Yesss 🎉', body: 'A friend you invited to WizeLife just upgraded — that earned you:', got: days + ' days of ' + tier.toUpperCase(), already: 'Already loaded onto your account — no code needed.', cta: 'Open my apps', sign: 'Thanks for sharing,\nOfir · WizeLife' },
        pt: { subject: '🎁 Seu amigo entrou — você ganhou ' + days + ' dias grátis de ' + tier.toUpperCase() + '!', greet: 'Boa 🎉', body: 'Um amigo que você convidou para o WizeLife fez upgrade — você ganhou:', got: days + ' dias de ' + tier.toUpperCase(), already: 'Já está na sua conta — sem código.', cta: 'Abrir meus apps', sign: 'Obrigado por compartilhar,\nOfir · WizeLife' },
        es: { subject: '🎁 Tu amigo se unió — ¡ganaste ' + days + ' días gratis de ' + tier.toUpperCase() + '!', greet: '¡Genial! 🎉', body: 'Un amigo que invitaste a WizeLife actualizó — ganaste:', got: days + ' días de ' + tier.toUpperCase(), already: 'Ya está en tu cuenta — sin código.', cta: 'Abrir mis apps', sign: 'Gracias por compartir,\nOfir · WizeLife' },
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
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: gmailUser, pass: gmailPass },
    });
    await transporter.sendMail({
        from: `"WizeLife" <${gmailUser}>`,
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

const GMAIL_EMAIL    = defineSecret("GMAIL_EMAIL");
const GMAIL_PASSWORD = defineSecret("GMAIL_APP_PASSWORD");

const PAYPAL_CLIENT_ID  = defineSecret("PAYPAL_CLIENT_ID");
const PAYPAL_SECRET     = defineSecret("PAYPAL_SECRET");
const PAYPAL_WEBHOOK_ID = defineSecret("PAYPAL_WEBHOOK_ID");
const GEMINI_API_KEY    = defineSecret("GEMINI_API_KEY");
const ACCESS_CODES_SEC  = defineSecret("ACCESS_CODES");
const YOLO_CODES_SEC    = defineSecret("YOLO_ACCESS_CODES");
const TWELVE_DATA_KEY   = defineSecret("TWELVE_DATA_KEY");
const FINNHUB_KEY       = defineSecret("FINNHUB_KEY");
const ADMIN_TOKEN       = defineSecret("ADMIN_TOKEN");

// ─── Access Code Validation ───────────────────────────────────────────────────

exports.validateCode = functions
    .runWith({ secrets: [ACCESS_CODES_SEC, YOLO_CODES_SEC, GMAIL_EMAIL, GMAIL_PASSWORD] })
    .https.onCall(async (data, context) => {
        if (!context.auth) {
            throw new functions.https.HttpsError("unauthenticated", "יש להתחבר כדי לממש קוד");
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
    .runWith({ secrets: [GMAIL_EMAIL, GMAIL_PASSWORD] })
    .https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Sign in first");
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
// admin email — Ofir always has the final click. Never blocks the email.
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
        'Loved: ' + (fb.loved || '—'),
        'Missing/confusing: ' + (fb.missing || '—'),
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
    .runWith({ secrets: [GMAIL_EMAIL, GMAIL_PASSWORD, ADMIN_TOKEN, GEMINI_API_KEY] })
    .firestore.document('feedback/{id}')
    .onCreate(async (snap) => {
        const FEEDBACK_INBOX = 'wizelife.ai@gmail.com';
        const data = snap.data() || {};
        const docId = snap.id;
        // AI suggestion — never blocks the email
        const aiHint = await _classifySeverityWithAI(data).catch(() => null);
        const gmailUser = GMAIL_EMAIL.value();
        const gmailPass = GMAIL_PASSWORD.value();
        if (!gmailUser || !gmailPass) {
            console.log('Feedback email skipped — GMAIL_EMAIL / GMAIL_APP_PASSWORD not set');
            return null;
        }

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

        // Severity guide so the admin (Ofir) doesn't need to remember the
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
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user: gmailUser, pass: gmailPass },
            });
            await transporter.sendMail({
                from: `"WizeLife Feedback" <${gmailUser}>`,
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
    .runWith({ secrets: [GMAIL_EMAIL, GMAIL_PASSWORD, ADMIN_TOKEN] })
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
                const gmailUser = GMAIL_EMAIL.value();
                const gmailPass = GMAIL_PASSWORD.value();
                if (gmailUser && gmailPass && fb.email) {
                    const lang = (fb.lang || 'he').slice(0, 2);
                    const TR = {
                        he: { subject: '🎁 תודה על הדיווח!', greet: 'תודה ענקית', sub: 'הדיווח שלך עזר לנו לתקן בעיה — בזכותך WizeLife טובה יותר.', got_yolo: 'מחזיק לך', got_pro: 'מחזיק לך', days: 'ימים', of: 'של', no_gift: 'אין מתנה הפעם, אבל המשוב שלך נקרא ומוערך — נמשיך לטפל.', open: 'לכלי שלי', sign: 'תודה,\nאופיר · WizeLife' },
                        en: { subject: '🎁 Thanks for the bug report!', greet: 'Huge thanks', sub: 'Your report helped us fix something — WizeLife got better because of you.', got_yolo: 'Locking in', got_pro: 'Locking in', days: 'days', of: 'of', no_gift: 'No gift this round, but your feedback was read and matters — we’re on it.', open: 'Open my tools', sign: 'Thanks,\nOfir · WizeLife' },
                        pt: { subject: '🎁 Obrigado pelo bug report!', greet: 'Muito obrigado', sub: 'Seu relato nos ajudou a consertar — o WizeLife melhorou graças a você.', got_yolo: 'Liberei', got_pro: 'Liberei', days: 'dias', of: 'de', no_gift: 'Sem brinde desta vez, mas seu feedback foi lido — estamos cuidando disso.', open: 'Abrir minhas ferramentas', sign: 'Obrigado,\nOfir · WizeLife' },
                        es: { subject: '🎁 ¡Gracias por reportar el bug!', greet: 'Muchas gracias', sub: 'Tu reporte nos ayudó a arreglar algo — WizeLife mejoró gracias a ti.', got_yolo: 'Activé', got_pro: 'Activé', days: 'días', of: 'de', no_gift: 'Sin regalo esta vez, pero tu feedback se leyó y importa — estamos en ello.', open: 'Abrir mis herramientas', sign: 'Gracias,\nOfir · WizeLife' },
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
                    const transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: { user: gmailUser, pass: gmailPass },
                    });
                    await transporter.sendMail({
                        from: `"WizeLife" <${gmailUser}>`,
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

exports.sendWelcomeEmail = functions
    .runWith({ secrets: [GMAIL_EMAIL, GMAIL_PASSWORD] })
    .auth.user().onCreate(async (user) => {
        const email = user.email;
        if (!email) return;

        const gmailUser = GMAIL_EMAIL.value();
        const gmailPass = GMAIL_PASSWORD.value();
        if (!gmailUser || !gmailPass) {
            console.log("Welcome email: GMAIL_EMAIL / GMAIL_APP_PASSWORD not configured — skipping");
            return;
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user: gmailUser, pass: gmailPass },
        });

        const name = user.displayName || email.split("@")[0];

        const html = `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="UTF-8"><style>
  body { font-family: Arial, sans-serif; background:#f4f4f8; margin:0; padding:0; }
  .wrap { max-width:520px; margin:32px auto; background:#fff; border-radius:16px;
          padding:36px 32px; box-shadow:0 2px 12px rgba(0,0,0,.08); }
  h1 { color:#10b981; font-size:1.6rem; margin-bottom:8px; }
  p  { color:#334155; line-height:1.7; }
  .badge { display:inline-block; background:#ecfdf5; color:#10b981; font-weight:700;
           padding:6px 16px; border-radius:20px; margin:16px 0; font-size:1rem; }
  .cta { display:inline-block; margin-top:20px; background:#10b981; color:#fff;
         padding:12px 28px; border-radius:10px; text-decoration:none;
         font-weight:700; font-size:1rem; }
  .footer { margin-top:28px; font-size:0.8rem; color:#94a3b8; }
</style></head>
<body>
  <div class="wrap">
    <h1>ברוכים הבאים ל-WizeMoney 💰</h1>
    <p>היי ${name},</p>
    <p>נרשמת בהצלחה! החשבון שלך מוכן.</p>
    <div class="badge">✨ 3 ימי Pro חינם — מופעל עכשיו</div>
    <p>במשך 3 ימים הבאים תוכל לגשת לכל התכונות המתקדמות:<br>
    AI פיננסי אישי, ניתוח תיק השקעות, אופטימיזציית מס ועוד.</p>
    <a class="cta" href="https://finsightai.github.io/finsight/">פתח את הדאשבורד →</a>
    <div class="footer">
      WizeLife · נשלח אוטומטית בעת ההרשמה<br>
      לביטול קבלת אימיילים — <a href="https://finsightai.github.io/finsight/">כניסה להגדרות</a>
    </div>
  </div>
</body>
</html>`;

        try {
            await transporter.sendMail({
                from: `"WizeMoney" <${gmailUser}>`,
                to:   email,
                subject: "ברוכים הבאים ל-WizeMoney — 3 ימי Pro חינם 🎉",
                html,
            });
            console.log(`✅ Welcome email sent to ${email}`);
        } catch (err) {
            console.error("Welcome email failed:", err.message);
        }
    });

// ─── AI Proxy — callable function ────────────────────────────────────────────

const AI_LIMIT = { free: 2, pro: 20, yolo: 40 };

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
    .runWith({ secrets: [GEMINI_API_KEY] })
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

        const body = {
            contents: messages,
            generationConfig: { maxOutputTokens: maxTokens },
        };
        if (system) {
            body.system_instruction = { parts: [{ text: system }] };
        }

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
    .runWith({ secrets: [PAYPAL_CLIENT_ID, PAYPAL_SECRET, PAYPAL_WEBHOOK_ID, GMAIL_EMAIL, GMAIL_PASSWORD] })
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
        console.log("PayPal event:", eventType);

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
                    const tier   = (process.env.PAYPAL_YOLO_PLAN_ID && planId === process.env.PAYPAL_YOLO_PLAN_ID) ? "yolo" : "pro";

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

                    await snap.docs[0].ref.set(
                        {
                            plan: "pro",
                            planLastPayment: admin.firestore.FieldValue.serverTimestamp(),
                        },
                        { merge: true }
                    );
                    console.log(`✅ Pro renewed for sub=${subId}`);
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
    .runWith({ secrets: [TWELVE_DATA_KEY, FINNHUB_KEY] })
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
