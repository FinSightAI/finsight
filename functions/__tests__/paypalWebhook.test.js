/**
 * Integration tests for the paypalWebhook Cloud Function — the revenue path.
 *
 * Runs against the REAL Firestore emulator (so entitlement writes are exercised
 * for real, not mocked), while the two PayPal network calls (OAuth token +
 * signature verification) and Resend email are mocked — those are external and
 * not what we're testing here.
 *
 * MUST be run via the emulator, e.g.:
 *   firebase emulators:exec --only firestore 'npm test --prefix functions'
 * (emulators:exec sets FIRESTORE_EMULATOR_HOST + GCLOUD_PROJECT.)
 *
 * What this protects: a silent regression that stops a paid user from getting
 * Pro/YOLO, mis-detects the tier, accepts an unverified webhook, or double-pays
 * a referral reward.
 */

// Toggle the mocked PayPal signature result per-test. Must be `mock`-prefixed
// to satisfy jest.mock's out-of-scope variable restriction.
const mockPaypal = { verifyStatus: 'SUCCESS' };

// Mock node 'https' so getAccessToken() and verifyWebhook() resolve without
// real network. Branch on the request path to return the right payload.
jest.mock('https', () => ({
  request: (options, cb) => {
    const path = (options && options.path) || '';
    let payload = '{}';
    if (path.includes('oauth2/token')) {
      payload = JSON.stringify({ access_token: 'fake-token' });
    } else if (path.includes('verify-webhook-signature')) {
      payload = JSON.stringify({ verification_status: mockPaypal.verifyStatus });
    }
    const res = {
      on: (event, fn) => {
        if (event === 'data') fn(payload);
        if (event === 'end') fn();
      },
    };
    process.nextTick(() => cb(res));
    return { on: () => {}, write: () => {}, end: () => {} };
  },
}));

// Mock Resend so referral / confirmation emails are no-ops.
jest.mock('resend', () => ({
  Resend: class {
    constructor() {
      this.emails = { send: async () => ({ id: 'mock-email' }) };
    }
  },
}));

// Secrets are read via process.env by firebase-functions params .value().
process.env.PAYPAL_CLIENT_ID = 'test-client';
process.env.PAYPAL_SECRET = 'test-secret';
process.env.PAYPAL_WEBHOOK_ID = 'test-webhook';
process.env.RESEND_API_KEY = 'test-resend';

const admin = require('firebase-admin');
const fns = require('../index'); // inits admin + connects to the emulator
const db = admin.firestore();

const YOLO_PLAN_ID = 'P-3WT61990FP2103335NH32GVA';

function mockRes() {
  return {
    statusCode: 200,
    body: null,
    status(c) { this.statusCode = c; return this; },
    send(b) { this.body = b; return this; },
    json(b) { this.body = b; return this; },
  };
}

function activatedReq(uid, subId, planId) {
  return {
    method: 'POST',
    headers: {
      'paypal-auth-algo': 'SHA256withRSA',
      'paypal-cert-url': 'https://api-m.paypal.com/cert',
      'paypal-transmission-id': 'tx-1',
      'paypal-transmission-sig': 'sig',
      'paypal-transmission-time': '2026-06-04T00:00:00Z',
    },
    body: {
      event_type: 'BILLING.SUBSCRIPTION.ACTIVATED',
      resource: { custom_id: uid, id: subId, plan_id: planId },
    },
  };
}

async function invoke(req) {
  const res = mockRes();
  await fns.paypalWebhook(req, res);
  return res;
}

beforeEach(() => {
  mockPaypal.verifyStatus = 'SUCCESS';
});

describe('paypalWebhook — entitlement (money path)', () => {
  it('SUBSCRIPTION.ACTIVATED flips a free user to PRO and stores the sub id', async () => {
    await db.collection('users').doc('u_pro').set({ plan: 'free' });

    const res = await invoke(activatedReq('u_pro', 'SUB-PRO-1', 'SOME-OTHER-PLAN'));

    expect(res.statusCode).toBe(200);
    const snap = await db.collection('users').doc('u_pro').get();
    expect(snap.data().plan).toBe('pro');
    expect(snap.data().paypalSubscriptionId).toBe('SUB-PRO-1');
  });

  it('detects the YOLO tier from the PayPal plan_id', async () => {
    await db.collection('users').doc('u_yolo').set({ plan: 'free' });

    await invoke(activatedReq('u_yolo', 'SUB-YOLO-1', YOLO_PLAN_ID));

    const snap = await db.collection('users').doc('u_yolo').get();
    expect(snap.data().plan).toBe('yolo');
  });

  it('rejects an unverified signature with 401 and does NOT upgrade', async () => {
    mockPaypal.verifyStatus = 'FAILURE';
    await db.collection('users').doc('u_forged').set({ plan: 'free' });

    const res = await invoke(activatedReq('u_forged', 'SUB-X', 'SOME-PLAN'));

    expect(res.statusCode).toBe(401);
    const snap = await db.collection('users').doc('u_forged').get();
    expect(snap.data().plan).toBe('free'); // untouched
  });

  it('rejects non-POST with 405', async () => {
    const res = await invoke({ method: 'GET', headers: {}, body: {} });
    expect(res.statusCode).toBe(405);
  });
});

describe('paypalWebhook — referral reward idempotency', () => {
  it('grants the referrer exactly once even if the webhook fires twice', async () => {
    await db.collection('users').doc('ref_bob').set({ plan: 'free' });
    await db.collection('users').doc('ref_alice').set({ plan: 'free', referredBy: 'ref_bob' });

    // Same activation delivered twice (PayPal retries / at-least-once delivery).
    await invoke(activatedReq('ref_alice', 'SUB-REF-1', 'PRO-PLAN'));
    await invoke(activatedReq('ref_alice', 'SUB-REF-1', 'PRO-PLAN'));

    const alice = (await db.collection('users').doc('ref_alice').get()).data();
    const bob = (await db.collection('users').doc('ref_bob').get()).data();

    expect(alice.plan).toBe('pro');
    expect(alice.referralRewardSent).toBe(true);
    expect(bob.referralCount).toBe(1); // not 2 — idempotent
  });
});
