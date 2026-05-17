/**
 * Firebase Configuration
 * Replace with your own Firebase project config
 *
 * Perf note (2026-05-17): Firestore + Functions compat libraries (~630KB total)
 * are now lazy-loaded on index.html via window._wlLazy. This file MUST be
 * tolerant of firebase.firestore being undefined at load time. window.firebaseDb
 * starts null and is populated either:
 *   a) immediately, if firestore-compat was loaded synchronously (most pages), or
 *   b) lazily via window.ensureFirestore() on first access (index.html landing)
 */
const firebaseConfig = {
    apiKey: "AIzaSyDuzJHOMe89YmEFpKlaTgxT40BCNhK6PU0",
    authDomain: "finzilla-7f1f9.firebaseapp.com",
    projectId: "finzilla-7f1f9",
    storageBucket: "finzilla-7f1f9.firebasestorage.app",
    messagingSenderId: "1027614800253",
    appId: "1:1027614800253:web:ddfb62426252e0e8ebb414"
};

// Initialize Firebase (firebase-app-compat is always loaded eagerly)
firebase.initializeApp(firebaseConfig);

// Auth — always loaded (firebase-auth-compat is eager on every page)
const auth = firebase.auth();

// Firestore — may not be loaded yet on landing pages (index.html)
let db = null;
try {
    if (typeof firebase.firestore === 'function') {
        db = firebase.firestore();
    }
} catch (e) { /* firestore-compat not loaded yet — that's OK */ }

// Google Auth Provider
const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

// Make available globally
window.firebaseAuth = auth;
window.firebaseDb = db; // may be null on landing pages until ensureFirestore() runs
window.googleProvider = googleProvider;

/**
 * window.ensureFirestore() — call this before touching window.firebaseDb on
 * pages where firestore-compat is lazy-loaded. On pages where firestore-compat
 * is loaded eagerly (most pages), this is a no-op and resolves immediately.
 * Safe to call multiple times.
 */
window.ensureFirestore = async function() {
    if (window.firebaseDb) return window.firebaseDb;
    // If the lazy loader exists, use it
    if (window._wlLazy && typeof window._wlLazy.firestore === 'function') {
        await window._wlLazy.firestore();
    }
    // Initialize db now that firestore-compat is available
    try {
        if (!window.firebaseDb && typeof firebase.firestore === 'function') {
            window.firebaseDb = firebase.firestore();
        }
    } catch (e) {
        console.error('ensureFirestore: failed to init firestore', e);
    }
    return window.firebaseDb;
};

/**
 * window.ensureFunctions() — same pattern for firebase-functions-compat.
 */
window.ensureFunctions = async function() {
    if (typeof firebase.functions === 'function') {
        try { return firebase.functions(); } catch (e) {}
    }
    if (window._wlLazy && typeof window._wlLazy.functions === 'function') {
        return await window._wlLazy.functions();
    }
    return firebase.functions();
};
