/**
 * Cloud backup smoke test — static checks only (no Firestore writes from CI).
 *
 * Verifies:
 *  - wize-cloud-backup.js exists + exports the expected API
 *  - All BACKUP_KEYS look like real localStorage keys (finance_* convention)
 *  - Every HTML page that loads firebase-config.js also loads wize-cloud-backup.js
 *  - firestore.rules contains userBackups/{uid} owner-only rule
 *
 * Run: node qa/cloud-backup-smoke.js
 */
const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const FAILS = [];

function ok(msg) { console.log('  ✓ ' + msg); }
function fail(msg) { FAILS.push(msg); console.log('  ✗ ' + msg); }

console.log('## WizeMoney cloud backup smoke test\n');

// 1. Module exists
const modPath = path.join(ROOT, 'js', 'wize-cloud-backup.js');
if (!fs.existsSync(modPath)) {
    fail('js/wize-cloud-backup.js missing');
    process.exit(1);
}
const mod = fs.readFileSync(modPath, 'utf8');
ok('js/wize-cloud-backup.js exists (' + Math.round(mod.length / 1024) + ' KB)');

// 2. Required API surface
const requiredFns = ['pushNow', 'scheduleBackup', 'snapshotLocal', 'status', 'init', 'BACKUP_KEYS'];
for (const fn of requiredFns) {
    if (mod.includes(fn)) ok('exports ' + fn);
    else fail('missing export: ' + fn);
}

// 3. BACKUP_KEYS includes the critical user-data keys
const critical = ['finance_stocks', 'finance_bank_accounts', 'finance_income', 'finance_credit_cards', 'finance_goals'];
for (const k of critical) {
    if (mod.includes("'" + k + "'")) ok('backs up ' + k);
    else fail('BACKUP_KEYS missing critical: ' + k);
}

// 4. Skip-encrypted protection (PIN-lock blobs must not be pushed)
if (mod.includes('looksEncrypted') && mod.includes('__enc')) ok('skips PIN-locked entries');
else fail('no PIN-lock protection — would push encrypted blobs to cloud');

// 5. Firestore rules
const rulesPath = path.join(ROOT, 'firestore.rules');
if (fs.existsSync(rulesPath)) {
    const rules = fs.readFileSync(rulesPath, 'utf8');
    if (/match \/userBackups\/\{[^}]+\}\s*\{[\s\S]*?isOwner/.test(rules)) {
        ok('firestore.rules: userBackups/{uid} owner-only rule present');
    } else {
        fail('firestore.rules: userBackups rule missing or not owner-gated');
    }
} else {
    fail('firestore.rules not found at repo root');
}

// 6. Every page that loads firebase-config.js must also load wize-cloud-backup.js
function walk(dir, out = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
        const p = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(p, out);
        else if (entry.name.endsWith('.html')) out.push(p);
    }
    return out;
}
const htmlFiles = walk(ROOT);
let pagesChecked = 0;
let pagesMissing = [];
for (const f of htmlFiles) {
    const c = fs.readFileSync(f, 'utf8');
    if (!c.includes('firebase-config.js')) continue;
    pagesChecked++;
    if (!c.includes('wize-cloud-backup.js')) {
        pagesMissing.push(path.relative(ROOT, f));
    }
}
if (pagesMissing.length === 0) ok(`all ${pagesChecked} Firebase-enabled pages load wize-cloud-backup.js`);
else fail(`${pagesMissing.length} page(s) load Firebase but NOT wize-cloud-backup.js: ${pagesMissing.slice(0,3).join(', ')}${pagesMissing.length > 3 ? '…' : ''}`);

// Summary
console.log('\n' + (FAILS.length === 0 ? '✅ PASS' : `❌ ${FAILS.length} FAIL`));
if (FAILS.length > 0) {
    console.log('\nFailures:');
    FAILS.forEach((m, i) => console.log(`  ${i + 1}. ${m}`));
    process.exit(1);
}
