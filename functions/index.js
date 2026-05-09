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
        return { rewarded: u.referredBy, tier: newTier, days: REWARD_DAYS };
    } catch (e) {
        console.warn("_grantReferrerReward failed", e);
        return null;
    }
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

// ─── Access Code Validation ───────────────────────────────────────────────────

exports.validateCode = functions
    .runWith({ secrets: [ACCESS_CODES_SEC, YOLO_CODES_SEC] })
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
exports.awardReferral = functions.https.onCall(async (data, context) => {
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
    .runWith({ secrets: [PAYPAL_CLIENT_ID, PAYPAL_SECRET, PAYPAL_WEBHOOK_ID] })
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
