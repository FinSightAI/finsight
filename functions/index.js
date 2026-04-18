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

const GMAIL_EMAIL    = defineSecret("GMAIL_EMAIL");
const GMAIL_PASSWORD = defineSecret("GMAIL_APP_PASSWORD");

const PAYPAL_CLIENT_ID  = defineSecret("PAYPAL_CLIENT_ID");
const PAYPAL_SECRET     = defineSecret("PAYPAL_SECRET");
const PAYPAL_WEBHOOK_ID = defineSecret("PAYPAL_WEBHOOK_ID");
const GEMINI_API_KEY    = defineSecret("GEMINI_API_KEY");
const ACCESS_CODES_SEC  = defineSecret("ACCESS_CODES");

// ─── Access Code Validation ───────────────────────────────────────────────────

exports.validateCode = functions
    .runWith({ secrets: [ACCESS_CODES_SEC] })
    .https.onCall(async (data, context) => {
        if (!context.auth) {
            throw new functions.https.HttpsError("unauthenticated", "יש להתחבר כדי לממש קוד");
        }

        const code = (data.code || "").trim().toUpperCase();
        if (!code) throw new functions.https.HttpsError("invalid-argument", "קוד נדרש");

        const validCodes = new Set(
            ACCESS_CODES_SEC.value()
                .split(",")
                .map(c => c.trim().toUpperCase())
                .filter(Boolean)
        );

        if (!validCodes.has(code)) return { valid: false };

        await db.collection("users").doc(context.auth.uid).set(
            { plan: "pro", accessCode: code, planActivatedAt: admin.firestore.FieldValue.serverTimestamp() },
            { merge: true }
        );

        return { valid: true };
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
                ? " שדרג ל-Pro ($4.90/חודש) לקבל 20 שאלות ביום."
                : plan === "pro"
                ? " שדרג ל-YOLO ($9.90/חודש) לקבל 40 שאלות ביום."
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
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
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

                    await db.collection("users").doc(uid).set(
                        {
                            plan: "pro",
                            paypalSubscriptionId: subId || null,
                            planActivatedAt: admin.firestore.FieldValue.serverTimestamp(),
                        },
                        { merge: true }
                    );
                    console.log(`✅ Pro activated for uid=${uid}, sub=${subId}`);
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
