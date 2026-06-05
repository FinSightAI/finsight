/**
 * Callable Cloud Functions — auth/entitlement guards.
 * Real Firestore emulator; Resend mocked.
 *   firebase emulators:exec --only firestore 'npm test --prefix functions'
 *
 * Covers: validateCode (access-code redemption), awardReferral (anti-forgery +
 * idempotency), issueCustomToken (input guard).
 */
jest.mock('resend', () => ({
  Resend: class {
    constructor() {
      this.emails = { send: async () => ({ id: 'mock' }) };
      this.contacts = { create: async () => ({ id: 'mock' }) };
    }
  },
}));

process.env.ACCESS_CODES = 'WELCOME50,FRIEND-PRO';
process.env.YOLO_ACCESS_CODES = 'YOLO-PASS';
process.env.RESEND_API_KEY = 'test-resend';

const fft = require('firebase-functions-test')();
const admin = require('firebase-admin');
const fns = require('../index');
const db = admin.firestore();

const validateCode = fft.wrap(fns.validateCode);
const awardReferral = fft.wrap(fns.awardReferral);
const issueCustomToken = fft.wrap(fns.issueCustomToken);

const verifiedAuth = (uid) => ({ auth: { uid, token: { email_verified: true } } });

async function expectError(thunk, needle) {
  let err;
  try { await thunk(); } catch (e) { err = e; }
  expect(err).toBeTruthy();
  expect(`${err.code || ''} ${err.message || ''}`).toContain(needle);
}

describe('validateCode', () => {
  it('rejects an unauthenticated caller', async () => {
    await expectError(() => validateCode({ code: 'WELCOME50' }, {}), 'unauthenticated');
  });

  it('requires a verified email', async () => {
    await expectError(
      () => validateCode({ code: 'WELCOME50' }, { auth: { uid: 'vc_unverified', token: { email_verified: false } } }),
      'failed-precondition'
    );
  });

  it('redeems a valid PRO code → plan becomes pro', async () => {
    const out = await validateCode({ code: 'welcome50' }, verifiedAuth('vc_pro')); // lower-case tolerated
    expect(out).toEqual({ valid: true, plan: 'pro' });
    expect((await db.doc('users/vc_pro').get()).data().plan).toBe('pro');
  });

  it('redeems a valid YOLO code → plan becomes yolo', async () => {
    const out = await validateCode({ code: 'YOLO-PASS' }, verifiedAuth('vc_yolo'));
    expect(out).toEqual({ valid: true, plan: 'yolo' });
    expect((await db.doc('users/vc_yolo').get()).data().plan).toBe('yolo');
  });

  it('rejects an unknown code without changing the plan', async () => {
    await db.doc('users/vc_bad').set({ plan: 'free' });
    const out = await validateCode({ code: 'NOPE-123' }, verifiedAuth('vc_bad'));
    expect(out).toEqual({ valid: false });
    expect((await db.doc('users/vc_bad').get()).data().plan).toBe('free');
  });
});

describe('awardReferral (anti-forgery + idempotency)', () => {
  it('rejects an unauthenticated caller', async () => {
    await expectError(() => awardReferral({ tier: 'pro' }, {}), 'unauthenticated');
  });

  it('rejects an invalid tier', async () => {
    await expectError(() => awardReferral({ tier: 'gold' }, { auth: { uid: 'ar_x' } }), 'invalid-argument');
  });

  it('refuses to reward when the caller has NOT actually upgraded', async () => {
    await db.doc('users/ar_free').set({ plan: 'free' });
    const out = await awardReferral({ tier: 'pro' }, { auth: { uid: 'ar_free' } });
    expect(out).toEqual({ rewarded: null, reason: 'plan_not_upgraded' });
  });

  it('grants the referrer exactly once even when called twice', async () => {
    await db.doc('users/ar_ref').set({ plan: 'free' });
    await db.doc('users/ar_buyer').set({ plan: 'pro', referredBy: 'ar_ref' });

    await awardReferral({ tier: 'pro' }, { auth: { uid: 'ar_buyer' } });
    await awardReferral({ tier: 'pro' }, { auth: { uid: 'ar_buyer' } });

    expect((await db.doc('users/ar_ref').get()).data().referralCount).toBe(1);
  });
});

describe('issueCustomToken', () => {
  it('rejects a missing idToken', async () => {
    await expectError(() => issueCustomToken({}, {}), 'invalid-argument');
  });
  // Full token exchange needs the Auth emulator + a real ID token — covered separately.
});

afterAll(() => fft.cleanup());
