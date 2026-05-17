/**
 * Firestore Security Rules — unit tests.
 *
 * Verifies the contract documented in firestore.rules. Runs against the
 * Firebase emulator (no prod credentials, no network calls outside localhost).
 *
 * Setup:
 *   1. Install Firebase CLI:  npm i -g firebase-tools
 *   2. From repo root:        firebase emulators:exec --only firestore 'npm test --prefix firestore-tests'
 *   3. Or interactively:      firebase emulators:start --only firestore  (then in another shell)
 *                              cd firestore-tests && npm test
 *
 * Why: today the rules file is "default-deny" but never regression-tested.
 * One careless edit (e.g. broadening a path) could expose every user's data.
 * These tests run in the emulator only — they NEVER touch production data.
 */
const fs   = require('fs');
const path = require('path');
const { assertFails, assertSucceeds, initializeTestEnvironment } =
  require('@firebase/rules-unit-testing');

const PROJECT_ID = 'wize-rules-test';
const RULES_PATH = path.join(__dirname, '..', 'firestore.rules');

let env;

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: fs.readFileSync(RULES_PATH, 'utf8'),
      host: '127.0.0.1',
      port: 8080,
    },
  });
});

afterAll(async () => { await env?.cleanup(); });
beforeEach(async () => { await env?.clearFirestore(); });

const alice = () => env.authenticatedContext('alice').firestore();
const bob   = () => env.authenticatedContext('bob').firestore();
const anon  = () => env.unauthenticatedContext().firestore();

describe('/users/{uid} — owner-only', () => {
  test('owner can write own user doc', async () => {
    await assertSucceeds(alice().doc('users/alice').set({ name: 'Alice' }));
  });
  test('owner can read own user doc', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().doc('users/alice').set({ name: 'Alice' });
    });
    await assertSucceeds(alice().doc('users/alice').get());
  });
  test("OTHER user cannot read alice's doc", async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().doc('users/alice').set({ name: 'Alice' });
    });
    await assertFails(bob().doc('users/alice').get());
  });
  test('anonymous cannot read any user doc', async () => {
    await assertFails(anon().doc('users/alice').get());
  });
  test("OTHER user cannot write to alice's doc", async () => {
    await assertFails(bob().doc('users/alice').set({ name: 'Mallory' }));
  });
});

describe('/users/{uid}/context — owner-only', () => {
  test('owner can write own context', async () => {
    await assertSucceeds(alice().doc('users/alice/context/money').set({ income: 1000 }));
  });
  test('other user cannot read context', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().doc('users/alice/context/money').set({ income: 1000 });
    });
    await assertFails(bob().doc('users/alice/context/money').get());
  });
});

describe('/users/{uid}/cross_app — owner READ, admin-only WRITE', () => {
  test('owner cannot write (only Cloud Function via Admin SDK can)', async () => {
    await assertFails(alice().doc('users/alice/cross_app/wizeai').set({ x: 1 }));
  });
  test('owner can read', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().doc('users/alice/cross_app/wizeai').set({ x: 1 });
    });
    await assertSucceeds(alice().doc('users/alice/cross_app/wizeai').get());
  });
  test('other user cannot read', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().doc('users/alice/cross_app/wizeai').set({ x: 1 });
    });
    await assertFails(bob().doc('users/alice/cross_app/wizeai').get());
  });
});

describe('/users/{uid}/disclaimers — immutable acceptance trail', () => {
  const valid = {
    accepted: true, version: 3, at: 1730000000, ua: 'Mozilla/5.0 …',
    lang: 'he', text_hash: 'abc', text_length: 1200,
  };
  test('owner can CREATE valid record', async () => {
    await assertSucceeds(alice().doc('users/alice/disclaimers/tax').set(valid));
  });
  test('owner cannot UPDATE existing record', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().doc('users/alice/disclaimers/tax').set(valid);
    });
    await assertFails(alice().doc('users/alice/disclaimers/tax').update({ accepted: false }));
  });
  test('owner cannot DELETE record', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().doc('users/alice/disclaimers/tax').set(valid);
    });
    await assertFails(alice().doc('users/alice/disclaimers/tax').delete());
  });
  test('extra/unknown field is REJECTED', async () => {
    await assertFails(alice().doc('users/alice/disclaimers/tax').set({ ...valid, secret_field: 'oops' }));
  });
  test('huge UA string (>240 chars) is REJECTED', async () => {
    await assertFails(alice().doc('users/alice/disclaimers/tax').set({ ...valid, ua: 'x'.repeat(241) }));
  });
});

describe('/feedback — public CREATE only', () => {
  const valid = { app: 'money', rating: 4, loved: 'great', missing: 'reports' };
  test('anonymous CAN create well-formed feedback', async () => {
    await assertSucceeds(anon().collection('feedback').add(valid));
  });
  test('anonymous CANNOT read feedback', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().collection('feedback').add(valid);
    });
    const snap = await assertFails(anon().collection('feedback').get());
  });
  test('extra field REJECTED', async () => {
    await assertFails(anon().collection('feedback').add({ ...valid, secret: 'inject' }));
  });
  test('over-size prose (>4000 chars) REJECTED', async () => {
    await assertFails(anon().collection('feedback').add({ ...valid, loved: 'x'.repeat(4001) }));
  });
  test('rating out of range REJECTED', async () => {
    await assertFails(anon().collection('feedback').add({ ...valid, rating: 99 }));
  });
});

describe('/shared_deals — public READ, server-only WRITE', () => {
  test('anonymous CAN read shared deal by token', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().doc('shared_deals/abc123').set({ data: 'demo' });
    });
    await assertSucceeds(anon().doc('shared_deals/abc123').get());
  });
  test('authenticated user CANNOT create shared deal (only Admin SDK can)', async () => {
    await assertFails(alice().doc('shared_deals/xyz').set({ data: 'attacker' }));
  });
  test('cannot update existing shared deal', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().doc('shared_deals/abc123').set({ data: 'demo' });
    });
    await assertFails(alice().doc('shared_deals/abc123').update({ data: 'hijack' }));
  });
});

describe('Catch-all — default-deny on unknown collections', () => {
  test('cannot read arbitrary collection', async () => {
    await assertFails(alice().collection('secrets').get());
  });
  test('cannot write arbitrary collection', async () => {
    await assertFails(alice().collection('admin_inbox').add({ x: 1 }));
  });
  test('anonymous cannot write anywhere', async () => {
    await assertFails(anon().collection('hijack').add({ x: 1 }));
  });
});
