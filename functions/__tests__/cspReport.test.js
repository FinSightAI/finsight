/**
 * cspReport (onRequest) — stores genuine CSP violations, filters browser-extension
 * noise, accepts both report-uri and report-to payload shapes. Real Firestore emulator.
 *   firebase emulators:exec --only firestore 'npm test --prefix functions'
 */
const admin = require('firebase-admin');
const fns = require('../index');
const db = admin.firestore();

function mockRes() {
  return {
    statusCode: 200, body: null, headers: {},
    set(k, v) { this.headers[k] = v; return this; },
    status(c) { this.statusCode = c; return this; },
    send(b) { this.body = b; return this; },
  };
}
async function post(body) {
  const res = mockRes();
  await fns.cspReport({ method: 'POST', headers: {}, body }, res);
  return res;
}
async function countCsp(blocked) {
  return (await db.collection('cspReports').where('blockedUri', '==', blocked).get()).size;
}

describe('cspReport', () => {
  it('stores a genuine report-uri violation', async () => {
    const res = await post({ 'csp-report': {
      'violated-directive': 'script-src',
      'blocked-uri': 'https://evil.example/x.js',
      'document-uri': 'https://check-deal.vercel.app/',
    } });
    expect(res.statusCode).toBe(204);
    expect(await countCsp('https://evil.example/x.js')).toBe(1);
  });

  it('filters browser-extension noise (no write)', async () => {
    await post({ 'csp-report': { 'violated-directive': 'script-src', 'blocked-uri': 'chrome-extension://abc/inject.js' } });
    expect(await countCsp('chrome-extension://abc/inject.js')).toBe(0);
  });

  it('handles the report-to array format', async () => {
    await post([{ body: { effectiveDirective: 'img-src', blockedURL: 'https://evil.example/pixel.png' } }]);
    expect(await countCsp('https://evil.example/pixel.png')).toBe(1);
  });

  it('rejects non-POST with 405', async () => {
    const res = mockRes();
    await fns.cspReport({ method: 'GET', headers: {}, body: {} }, res);
    expect(res.statusCode).toBe(405);
  });
});
