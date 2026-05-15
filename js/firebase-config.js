/**
 * Firebase Configuration
 * Replace with your own Firebase project config
 */
const firebaseConfig = {
    apiKey: "AIzaSyDuzJHOMe89YmEFpKlaTgxT40BCNhK6PU0",
    authDomain: "finzilla-7f1f9.firebaseapp.com",
    projectId: "finzilla-7f1f9",
    storageBucket: "finzilla-7f1f9.firebasestorage.app",
    messagingSenderId: "1027614800253",
    appId: "1:1027614800253:web:ddfb62426252e0e8ebb414"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();

// Google Auth Provider
const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

// Make available globally
window.firebaseAuth = auth;
window.firebaseDb = db;
window.googleProvider = googleProvider;
