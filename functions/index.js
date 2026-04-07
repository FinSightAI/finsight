/**
 * Firebase Functions — Stripe Webhook Handler
 * Project: finzilla-7f1f9 (FinSight)
 *
 * Setup steps:
 *   1. firebase functions:config:set stripe.secret="sk_live_..." stripe.webhook_secret="whsec_..."
 *   2. firebase deploy --only functions
 *   3. In Stripe dashboard → Webhooks → add endpoint:
 *      https://us-central1-finzilla-7f1f9.cloudfunctions.net/stripeWebhook
 *      Events: checkout.session.completed, customer.subscription.deleted
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe = require("stripe");

admin.initializeApp();
const db = admin.firestore();

// Loaded from Firebase config (never hard-code secrets)
const STRIPE_SECRET         = functions.config().stripe.secret;
const STRIPE_WEBHOOK_SECRET = functions.config().stripe.webhook_secret;

const stripeClient = stripe(STRIPE_SECRET);

/**
 * stripeWebhook — receives all Stripe events
 * Must be a raw HTTP function so we can verify the signature
 */
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;
    try {
        event = stripeClient.webhooks.constructEvent(req.rawBody, sig, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error("Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        switch (event.type) {

            // Payment successful → activate Pro
            case "checkout.session.completed": {
                const session = event.data.object;
                const uid = session.client_reference_id; // Firebase UID passed from paywall.js
                if (!uid) {
                    console.warn("checkout.session.completed: no client_reference_id");
                    break;
                }
                await db.collection("users").doc(uid).set(
                    {
                        plan: "pro",
                        stripeCustomerId: session.customer,
                        stripeSubscriptionId: session.subscription,
                        planActivatedAt: admin.firestore.FieldValue.serverTimestamp(),
                    },
                    { merge: true }
                );
                console.log(`✅ Pro activated for uid=${uid}`);
                break;
            }

            // Subscription cancelled or payment failed → revert to Free
            case "customer.subscription.deleted":
            case "invoice.payment_failed": {
                const obj = event.data.object;
                const customerId = obj.customer;
                if (!customerId) break;

                // Find user by Stripe customer ID
                const snap = await db
                    .collection("users")
                    .where("stripeCustomerId", "==", customerId)
                    .limit(1)
                    .get();

                if (snap.empty) {
                    console.warn(`No user found for Stripe customer ${customerId}`);
                    break;
                }

                const docRef = snap.docs[0].ref;
                await docRef.set(
                    {
                        plan: "free",
                        planCancelledAt: admin.firestore.FieldValue.serverTimestamp(),
                    },
                    { merge: true }
                );
                console.log(`⬇️  Plan reverted to free for customer=${customerId}`);
                break;
            }

            default:
                // Ignore other events
                break;
        }
    } catch (err) {
        console.error("Error processing webhook event:", err);
        return res.status(500).send("Internal error");
    }

    res.json({ received: true });
});
