/**
 * captureLeadEmail (onRequest) — CORS allow-list, method/email validation,
 * rate-limit, and the leads write. Real Firestore emulator; Resend mocked.
 *   firebase emulators:exec --only firestore 'npm test --prefix functions'
 */
jest.mock('resend', () => ({
  Resend: class {
    constructor() {
      this.emails = { send: async () => ({ id: 'mock' }) };
      this.contacts = { create: async () => ({ id: 'mock' }) };
    }
  },
}));

process.env.RESEND_API_KEY = 'test-resend';

const admin = require('firebase-admin');
const fns = require('../index');
const db = admin.firestore();

const ALLOWED = 'https://wizelife.ai';

function mockRes() {
  return {
    statusCode: 200,
    body: null,
    headers: {},
    set(k, v) { this.headers[k] = v; return this; },
    status(c) { this.statusCode = c; return this; },
    send(b) { this.body = b; return this; },
    json(b) { this.body = b; return this; },
  };
}

function req({ method = 'POST', origin = ALLOWED, body = {} } = {}) {
  return { method, headers: { origin }, body };
}

async function call(opts) {
  const res = mockRes();
  await fns.captureLeadEmail(req(opts), res);
  return res;
}

async function leadsFor(email) {
  const snap = await db.collection('leads').where('email', '==', email).get();
  return snap.size;
}

describe('captureLeadEmail', () => {
  it('answers CORS preflight (OPTIONS) from an allowed origin with 204 + headers', async () => {
    const res = await call({ method: 'OPTIONS' });
    expect(res.statusCode).toBe(204);
    expect(res.headers['Access-Control-Allow-Origin']).toBe(ALLOWED);
  });

  it('rejects non-POST with 405', async () => {
    const res = await call({ method: 'GET' });
    expect(res.statusCode).toBe(405);
  });

  it('silently drops POST from a disallowed origin (204, no lead stored)', async () => {
    const res = await call({ origin: 'https://evil.example', body: { email: 'evil@x.com' } });
    expect(res.statusCode).toBe(204);
    expect(await leadsFor('evil@x.com')).toBe(0);
  });

  it('rejects an email containing markup characters with 400', async () => {
    const res = await call({ body: { email: 'a<b@x.com' } });
    expect(res.statusCode).toBe(400);
  });

  it('rejects a malformed email with 400', async () => {
    const res = await call({ body: { email: 'notanemail' } });
    expect(res.statusCode).toBe(400);
  });

  it('accepts a valid lead from an allowed origin and stores it', async () => {
    const email = 'good.lead@example.com';
    const res = await call({ body: { email, lang: 'he', source: 'landing', country: 'portugal' } });
    expect(res.statusCode).toBe(204);
    expect(await leadsFor(email)).toBe(1);
  });

  it('rate-limits a hammering email (6th submit → 429)', async () => {
    const email = 'spammer@example.com';
    const codes = [];
    for (let i = 0; i < 6; i++) {
      codes.push((await call({ body: { email } })).statusCode);
    }
    expect(codes.filter((c) => c === 429).length).toBeGreaterThanOrEqual(1);
  });
});
