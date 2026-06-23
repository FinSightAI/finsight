/**
 * GDPR delete completeness — deleteUserAccount must leave ZERO residual data
 * for the caller (across every subcollection + the userBackups mirror) while
 * never touching another user's data.
 *
 * Needs BOTH the firestore and auth emulators:
 *   firebase emulators:exec --only firestore,auth 'npx jest deleteUserAccount'
 *
 * This is the test that proves the bug the old client-side delete had (it only
 * cleared disclaimers/preferences/feedback) is fixed.
 */
const fft = require('firebase-functions-test')();
const admin = require('firebase-admin');
const fns = require('../index');
const db = admin.firestore();

const deleteUserAccount = fft.wrap(fns.deleteUserAccount);

// Every place a user's personal data can live (from firestore.rules).
const USER_SUBCOLLECTIONS = ['context', 'cross_app', 'checkdeal_deals', 'consent', 'disclaimers', 'preferences', 'feedback'];

async function seedUser(uid) {
  await db.doc(`users/${uid}`).set({ plan: 'pro', email: `${uid}@x.com` });
  for (const sub of USER_SUBCOLLECTIONS) {
    await db.doc(`users/${uid}/${sub}/doc1`).set({ v: 1 });
  }
  await db.doc(`userBackups/${uid}`).set({ updatedAt: 1 });
  await db.doc(`userBackups/${uid}/data/wizemoney`).set({ blob: 'x' });
  // WizeHealth public share stamped with this user's uid (special-category health
  // data — must be erased on account delete, see the wizehealth_shares purge).
  await db.doc(`wizehealth_shares/share_${uid}`).set({ uid, payload: { messages: [] } });
}

async function residualPaths(uid) {
  const left = [];
  if ((await db.doc(`users/${uid}`).get()).exists) left.push(`users/${uid}`);
  for (const sub of USER_SUBCOLLECTIONS) {
    const s = await db.collection(`users/${uid}/${sub}`).get();
    if (!s.empty) left.push(`users/${uid}/${sub}`);
  }
  if ((await db.doc(`userBackups/${uid}`).get()).exists) left.push(`userBackups/${uid}`);
  const bk = await db.collection(`userBackups/${uid}/data`).get();
  if (!bk.empty) left.push(`userBackups/${uid}/data`);
  const hs = await db.collection('wizehealth_shares').where('uid', '==', uid).get();
  if (!hs.empty) left.push('wizehealth_shares');
  return left;
}

describe('deleteUserAccount — GDPR completeness', () => {
  it('rejects an unauthenticated caller', async () => {
    let err;
    try { await deleteUserAccount({}, {}); } catch (e) { err = e; }
    expect(`${err && err.code}`).toContain('unauthenticated');
  });

  it('erases ALL of the caller’s data, leaving zero residual', async () => {
    await seedUser('victim');
    expect(await residualPaths('victim')).not.toHaveLength(0); // sanity: seeded

    await deleteUserAccount({}, { auth: { uid: 'victim' } });

    expect(await residualPaths('victim')).toEqual([]); // nothing left anywhere
  });

  it('never touches another user’s data', async () => {
    await seedUser('alice');
    await seedUser('bob');

    await deleteUserAccount({}, { auth: { uid: 'alice' } });

    expect(await residualPaths('alice')).toEqual([]);
    expect(await residualPaths('bob')).not.toHaveLength(0); // bob untouched
  });

  afterAll(() => fft.cleanup());
});
