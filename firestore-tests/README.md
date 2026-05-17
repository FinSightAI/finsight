# Firestore Security Rules — unit tests

Verifies the contract defined in `../firestore.rules`. Runs against the Firebase **emulator** — no network, no prod credentials, no risk to production data.

## One-time setup

```sh
# 1) Install Firebase CLI (once, globally)
npm i -g firebase-tools

# 2) Install test deps
cd firestore-tests
npm install
```

## Run the tests

From the repo root (`finance dashboard/`):

```sh
firebase emulators:exec --only firestore 'npm test --prefix firestore-tests'
```

Or interactively (one shell starts the emulator, another runs the tests):

```sh
# shell A
firebase emulators:start --only firestore

# shell B
cd firestore-tests && npm test
```

## What's covered

| Path | Scenarios |
|---|---|
| `/users/{uid}` | owner read/write ✓, other-user read ✗, anon read ✗ |
| `/users/{uid}/context/{appId}` | owner read/write ✓, other-user ✗ |
| `/users/{uid}/cross_app/{appId}` | owner read ✓, owner write ✗ (Admin SDK only) |
| `/users/{uid}/disclaimers/{key}` | create ✓ (shape/size validated), update ✗, delete ✗ |
| `/feedback/{id}` | anon create ✓ (validated), anon read ✗, update/delete ✗ |
| `/shared_deals/{token}` | anon read ✓, client write ✗ (Admin SDK only) |
| anything else | default-deny |

## Why this matters

Today the rules file is comprehensive but **never regression-tested**. One careless edit (e.g. broadening a wildcard) could expose every user's data. Run these tests before merging any change to `firestore.rules`.

Pure additive — these tests **do not deploy anything**, do not modify the rules, do not touch CI.
