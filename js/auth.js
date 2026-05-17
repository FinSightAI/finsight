/**
 * Authentication & Cloud Sync Module
 */
const Auth = {
    currentUser: null,
    isInitialized: false,

    /**
     * Initialize auth state listener
     */
    init() {
        if (this.isInitialized) return;
        this.isInitialized = true;

        // Inject auth UI into sidebar if not already present
        this.injectAuthUI();

        firebaseAuth.onAuthStateChanged(async (user) => {
            this.currentUser = user;
            this.updateUI();

            if (user) {
                // Lazy-load firestore-compat if needed (landing pages defer this lib)
                if (typeof window.ensureFirestore === 'function') {
                    try { await window.ensureFirestore(); } catch (e) {}
                }
                // Sync data from cloud on login
                await this.syncFromCloud();
                // Push aggregated context to Firestore for WizeAI
                if (typeof WizeAISync !== 'undefined') WizeAISync.sync(user.uid);
            }
        });
    },

    /**
     * Inject auth UI into sidebar
     */
    injectAuthUI() {
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar || document.getElementById('authButtons')) return;

        // Add styles if not present
        if (!document.getElementById('authStyles')) {
            const style = document.createElement('style');
            style.id = 'authStyles';
            style.textContent = `
                .user-avatar { width: 32px; height: 32px; border-radius: 50%; }
                .user-name { font-size: 0.9rem; color: var(--color-text); }
                .user-profile { display: flex; align-items: center; gap: 8px; }
                .sync-status { font-size: 0.75rem; padding: 3px 8px; border-radius: 10px; }
                .sync-status.synced { background: rgba(16, 185, 129, 0.2); color: #10b981; }
                .sync-status.local { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
                .sync-status.syncing { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
                .auth-section .btn-auth { width: 100%; margin-bottom: 5px; padding: 8px; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; gap: 6px; }
            `;
            document.head.appendChild(style);
        }

        const authSection = document.createElement('div');
        authSection.className = 'auth-section';
        authSection.style.cssText = 'padding: 10px 15px; border-bottom: 1px solid var(--color-border);';
        authSection.innerHTML = `
            <div id="userInfo" style="display: none; align-items: center; gap: 10px; margin-bottom: 10px;"></div>
            <div id="authButtons" class="auth-buttons" style="display:none;"></div>
            <div id="authLogout" style="display: none;">
                <button id="authBtn" class="btn btn-secondary btn-sm" style="width: 100%;" onclick="Auth.signOut()">
                    <span data-i18n="auth.signOut">${typeof I18n !== 'undefined' ? I18n.t('auth.signOut') : 'התנתק'}</span>
                </button>
            </div>
            <div id="securityBadge" style="cursor: pointer; display: block; font-size: 0.8rem; padding: 6px 10px; border-radius: 10px; text-align: center; user-select: none; -webkit-tap-highlight-color: transparent;"></div>
        `;

        // Insert after sidebar-header
        const sidebarHeader = sidebar.querySelector('.sidebar-header');
        if (sidebarHeader) {
            sidebarHeader.after(authSection);
        } else {
            sidebar.prepend(authSection);
        }

        // Security badge click → navigate to settings
        const badge = authSection.querySelector('#securityBadge');
        if (badge) {
            badge.addEventListener('click', () => {
                const isInPages = window.location.pathname.includes('/pages/');
                window.location.href = isInPages ? 'settings.html' : 'pages/settings.html';
            });
        }

        this.updateSecurityBadge();
    },

    /**
     * Update security status badge in sidebar
     */
    updateSecurityBadge() {
        const badge = document.getElementById('securityBadge');
        if (!badge) return;

        const t = (key, fallback) => {
            if (typeof I18n !== 'undefined' && I18n.t) {
                const val = I18n.t(key);
                return val !== key ? val : fallback;
            }
            return fallback;
        };

        const pinEnabled = typeof PinLock !== 'undefined' && PinLock.isEnabled();
        const isLoggedIn = !!this.currentUser;

        if (pinEnabled && isLoggedIn) {
            badge.textContent = t('security.badgeCloudEncrypted', '☁️🔒 מוצפן + ענן');
            badge.style.background = 'rgba(16, 185, 129, 0.2)';
            badge.style.color = '#10b981';
        } else if (pinEnabled) {
            badge.textContent = t('security.badgeEncrypted', '🛡️ נתונים מוצפנים');
            badge.style.background = 'rgba(16, 185, 129, 0.2)';
            badge.style.color = '#10b981';
        } else if (isLoggedIn) {
            badge.textContent = t('security.badgeCloudSync', '☁️🔒 מוצפן בענן');
            badge.style.background = 'rgba(59, 130, 246, 0.2)';
            badge.style.color = '#3b82f6';
        } else {
            badge.textContent = t('security.badgeLocalOnly', '🔒 אחסון מקומי');
            badge.style.background = 'rgba(245, 158, 11, 0.2)';
            badge.style.color = '#f59e0b';
        }
    },

    /**
     * Sign in with Google
     */
    async signInWithGoogle() {
        try {
            const result = await firebaseAuth.signInWithPopup(googleProvider);
            // Ensure firestore-compat is loaded (lazy on landing pages)
            if (typeof window.ensureFirestore === 'function') {
                try { await window.ensureFirestore(); } catch (e) {}
            }
            // First-time Google sign-in: create user doc with trial start
            if (window.firebaseDb) {
                const ref = window.firebaseDb.collection('users').doc(result.user.uid);
                const doc = await ref.get();
                if (!doc.exists) {
                    await ref.set({
                        plan: 'free',
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    App.notify('ברוכים הבאים! 3 ימי Pro חינם מופעלים 🎉', 'success');
                } else {
                    App.notify(`${I18n.t('auth.welcome')}, ${result.user.displayName}!`, 'success');
                }
            } else {
                App.notify(`${I18n.t('auth.welcome')}, ${result.user.displayName}!`, 'success');
            }
            return result.user;
        } catch (error) {
            console.error('Sign in error:', error);
            if (error.code === 'auth/popup-closed-by-user') {
                App.notify(I18n.t('auth.loginCancelled'), 'info');
            } else {
                App.notify(I18n.t('auth.loginError') + ': ' + error.message, 'error');
            }
            return null;
        }
    },

    /**
     * Sign in with Email/Password
     */
    async signInWithEmail(email, password) {
        try {
            const result = await firebaseAuth.signInWithEmailAndPassword(email, password);
            App.notify(`${I18n.t('auth.welcome')}, ${result.user.email}!`, 'success');
            this.closeEmailModal();
            return result.user;
        } catch (error) {
            console.error('Email sign in error:', error);
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                App.notify(I18n.t('auth.wrongPassword'), 'error');
            } else if (error.code === 'auth/invalid-email') {
                App.notify(I18n.t('auth.invalidEmail'), 'error');
            } else {
                App.notify(I18n.t('auth.loginError') + ': ' + error.message, 'error');
            }
            return null;
        }
    },

    /**
     * Register with Email/Password
     */
    async registerWithEmail(email, password) {
        try {
            const result = await firebaseAuth.createUserWithEmailAndPassword(email, password);
            // Ensure firestore-compat is loaded (lazy on landing pages)
            if (typeof window.ensureFirestore === 'function') {
                try { await window.ensureFirestore(); } catch (e) {}
            }
            // Create user doc with trial start timestamp
            if (window.firebaseDb) {
                await window.firebaseDb.collection('users').doc(result.user.uid).set({
                    plan: 'free',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            }
            App.notify('ברוכים הבאים! 3 ימי Pro חינם מופעלים 🎉', 'success');
            this.closeEmailModal();
            return result.user;
        } catch (error) {
            console.error('Email register error:', error);
            if (error.code === 'auth/email-already-in-use') {
                App.notify(I18n.t('auth.emailInUse'), 'error');
            } else if (error.code === 'auth/weak-password') {
                App.notify(I18n.t('auth.weakPassword'), 'error');
            } else if (error.code === 'auth/invalid-email') {
                App.notify(I18n.t('auth.invalidEmail'), 'error');
            } else {
                App.notify(I18n.t('auth.registerError') + ': ' + error.message, 'error');
            }
            return null;
        }
    },

    /**
     * Show email login modal
     */
    showEmailLogin() {
        let modal = document.getElementById('emailAuthModal');
        if (modal) {
            modal.remove();
        }

        modal = document.createElement('div');
        modal.id = 'emailAuthModal';
        modal.className = 'modal-overlay active';
        modal.innerHTML = `
            <div class="modal" style="max-width: 400px;">
                <div class="modal-header">
                    <h2>📧 ${I18n.t('auth.emailLogin')}</h2>
                    <button class="modal-close" onclick="Auth.closeEmailModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <!-- Sign-in only — signup is handled on wizelife.ai -->
                    <div id="authTabLogin" style="display:none;"></div>
                    <div id="authTabRegister" style="display:none;"></div>

                    <div class="form-group">
                        <label>${I18n.t('auth.email')}</label>
                        <input type="email" id="emailAuthInput" class="form-control" placeholder="email@example.com" dir="ltr">
                    </div>
                    <div class="form-group">
                        <label>${I18n.t('auth.password')}</label>
                        <div style="position: relative;">
                            <input type="password" id="emailAuthPassword" class="form-control" placeholder="${I18n.t('auth.passwordPlaceholder8')}" dir="ltr" style="padding-left: 40px;" oninput="Auth.checkPasswordStrength()">
                            <button type="button" id="togglePasswordBtn" onclick="Auth.togglePasswordVisibility()" style="position: absolute; left: 8px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 1.2rem; color: var(--color-text-secondary); padding: 4px;">👁️</button>
                        </div>
                        <div id="passwordStrength" style="display: none; margin-top: 5px; font-size: 0.8rem;"></div>
                    </div>

                    <!-- Confirm password (register only) -->
                    <div class="form-group" id="confirmPasswordGroup" style="display: none;">
                        <label>${I18n.t('auth.confirmPassword')}</label>
                        <input type="password" id="emailAuthPasswordConfirm" class="form-control" placeholder="${I18n.t('auth.confirmPasswordPlaceholder')}" dir="ltr">
                    </div>

                    <!-- Forgot password (login only) -->
                    <div id="forgotPasswordLink" style="text-align: center; margin-top: 5px;">
                        <a href="#" onclick="Auth.resetPassword(); return false;" style="color: var(--color-training); font-size: 0.85rem; text-decoration: none;">${I18n.t('auth.forgotPassword')}</a>
                        <div style="margin-top:10px; font-size:0.8rem; color:var(--color-text-secondary);">
                          New here? <a href="https://wizelife.ai/auth.html" target="_blank" style="color: var(--color-training); text-decoration: none; font-weight: 600;">Create an account at WizeLife</a>
                        </div>
                    </div>

                    <div style="margin-top: 15px;">
                        <button id="authSubmitBtn" class="btn btn-primary" style="width: 100%; padding: 12px;" onclick="Auth.submitEmailAuth()">
                            ${I18n.t('auth.signIn')}
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeEmailModal();
        });
        this._authMode = 'login';
        document.getElementById('emailAuthInput').focus();
    },

    _authMode: 'login',

    /**
     * Switch between login and register tabs
     */
    switchAuthTab(_mode) {
        // Signup is disabled on WizeMoney — handled on wizelife.ai only.
        this._authMode = 'login';
        _mode = 'login';
        const loginTab = document.getElementById('authTabLogin');
        const registerTab = document.getElementById('authTabRegister');
        const confirmGroup = document.getElementById('confirmPasswordGroup');
        const forgotLink = document.getElementById('forgotPasswordLink');
        const submitBtn = document.getElementById('authSubmitBtn');
        const strengthEl = document.getElementById('passwordStrength');

        if (mode === 'register') {
            loginTab.style.color = 'var(--color-text-secondary)';
            loginTab.style.borderBottomColor = 'transparent';
            registerTab.style.color = 'var(--color-text)';
            registerTab.style.borderBottomColor = 'var(--color-training)';
            confirmGroup.style.display = 'block';
            forgotLink.style.display = 'none';
            submitBtn.textContent = I18n.t('auth.register');
            strengthEl.style.display = 'block';
            this.checkPasswordStrength();
        } else {
            loginTab.style.color = 'var(--color-text)';
            loginTab.style.borderBottomColor = 'var(--color-training)';
            registerTab.style.color = 'var(--color-text-secondary)';
            registerTab.style.borderBottomColor = 'transparent';
            confirmGroup.style.display = 'none';
            forgotLink.style.display = 'block';
            submitBtn.textContent = I18n.t('auth.signIn');
            strengthEl.style.display = 'none';
        }
    },

    /**
     * Submit email auth (login or register based on active tab)
     */
    submitEmailAuth() {
        const email = document.getElementById('emailAuthInput').value;
        const password = document.getElementById('emailAuthPassword').value;

        if (this._authMode === 'register') {
            const confirm = document.getElementById('emailAuthPasswordConfirm').value;
            if (password !== confirm) {
                App.notify(I18n.t('auth.passwordMismatch'), 'error');
                return;
            }
            if (password.length < 8) {
                App.notify(I18n.t('auth.passwordTooShort8'), 'error');
                return;
            }
            if (!/[A-Z]/.test(password)) {
                App.notify('Password must contain at least one uppercase letter (A-Z).', 'error');
                return;
            }
            if (!/[a-z]/.test(password)) {
                App.notify('Password must contain at least one lowercase letter (a-z).', 'error');
                return;
            }
            if (!/[0-9]/.test(password)) {
                App.notify('Password must contain at least one digit (0-9).', 'error');
                return;
            }
            if (!/[^A-Za-z0-9]/.test(password)) {
                App.notify('Password must contain at least one special character (!@#$% etc.).', 'error');
                return;
            }
            this.registerWithEmail(email, password);
        } else {
            this.signInWithEmail(email, password);
        }
    },

    /**
     * Check password strength indicator
     */
    checkPasswordStrength() {
        const el = document.getElementById('passwordStrength');
        const password = document.getElementById('emailAuthPassword')?.value || '';
        if (!el || this._authMode !== 'register') return;

        if (password.length === 0) {
            el.innerHTML = `<span style="color: var(--color-text-secondary);">${I18n.t('auth.passwordMinLength8')}</span>`;
            return;
        }
        if (password.length < 8) {
            el.innerHTML = `<span style="color: var(--color-negative);">⚠️ ${I18n.t('auth.passwordTooShort8')}</span>`;
            return;
        }
        const hasUpper   = /[A-Z]/.test(password);
        const hasLower   = /[a-z]/.test(password);
        const hasNumber  = /[0-9]/.test(password);
        const hasSpecial = /[^A-Za-z0-9]/.test(password);
        const missing = [];
        if (!hasUpper)   missing.push('uppercase');
        if (!hasLower)   missing.push('lowercase');
        if (!hasNumber)  missing.push('digit');
        if (!hasSpecial) missing.push('special');
        if (missing.length) {
            el.innerHTML = `<span style="color: var(--color-negative);">⚠️ Missing: ${missing.join(', ')}</span>`;
            return;
        }
        if (password.length >= 12) {
            el.innerHTML = `<span style="color: var(--color-positive);">✅ ${I18n.t('auth.passwordStrong')}</span>`;
        } else {
            el.innerHTML = `<span style="color: #f59e0b;">👍 ${I18n.t('auth.passwordOk')}</span>`;
        }
    },

    /**
     * Toggle password visibility
     */
    togglePasswordVisibility() {
        const input = document.getElementById('emailAuthPassword');
        const btn = document.getElementById('togglePasswordBtn');
        if (input.type === 'password') {
            input.type = 'text';
            btn.textContent = '🙈';
        } else {
            input.type = 'password';
            btn.textContent = '👁️';
        }
    },

    /**
     * Reset password via email
     */
    async resetPassword() {
        const email = document.getElementById('emailAuthInput')?.value?.trim();
        if (!email) {
            App.notify(I18n.t('auth.enterEmailFirst'), 'warning');
            return;
        }
        try {
            await firebaseAuth.sendPasswordResetEmail(email);
            App.notify(I18n.t('auth.resetSent'), 'success');
        } catch (error) {
            console.error('Password reset error:', error);
            if (error.code === 'auth/user-not-found') {
                App.notify(I18n.t('auth.userNotFound'), 'error');
            } else if (error.code === 'auth/invalid-email') {
                App.notify(I18n.t('auth.invalidEmail'), 'error');
            } else {
                App.notify(I18n.t('auth.resetError') + ': ' + error.message, 'error');
            }
        }
    },

    /**
     * Close email login modal
     */
    closeEmailModal() {
        const modal = document.getElementById('emailAuthModal');
        if (modal) modal.style.display = 'none';
    },

    /**
     * Sign out
     */
    async signOut() {
        try {
            await firebaseAuth.signOut();
            // Also clear all WizeLife SSO state — otherwise the WizeBar pill
            // keeps showing the previous YOLO/PRO plan + nickname.
            try {
                ['wl_sso', 'wl_token', 'wl_plan', 'wl_nickname', 'wl_access_code'].forEach(k => localStorage.removeItem(k));
            } catch {}
            App.notify(I18n.t('auth.signedOut'), 'success');
            // Refresh so the WizeBar re-renders with the signed-out state
            setTimeout(() => location.reload(), 500);
        } catch (error) {
            console.error('Sign out error:', error);
            App.notify(I18n.t('auth.signOutError'), 'error');
        }
    },

    /**
     * Update UI based on auth state
     */
    updateUI() {
        const authButtons = document.getElementById('authButtons');
        const authLogout = document.getElementById('authLogout');
        const userInfo = document.getElementById('userInfo');

        if (!authButtons && !authLogout) return;

        if (this.currentUser) {
            // User is signed in - hide login buttons, show logout
            if (authButtons) authButtons.style.display = 'none';
            if (authLogout) authLogout.style.display = 'block';

            if (userInfo) {
                const photo = this.currentUser.photoURL || '';
                const name = sanitize(this.currentUser.displayName || this.currentUser.email);
                const safePhoto = photo && /^https:\/\//.test(photo) ? sanitize(photo) : '';
                userInfo.innerHTML = `
                    <div class="user-profile">
                        ${safePhoto ? `<img src="${safePhoto}" alt="profile" class="user-avatar">` : ''}
                        <span class="user-name">${name}</span>
                    </div>
                `;
                userInfo.style.display = 'flex';
            }
        } else {
            // Signed out — auth happens via WizeLife SSO, so don't show internal sign-in.
            // The WizeBar at top has a sign-in pill that redirects to wizelife.ai/auth.html.
            if (authButtons) authButtons.style.display = 'none';
            if (authLogout) authLogout.style.display = 'none';

            if (userInfo) {
                userInfo.style.display = 'none';
            }
        }
        this.updateSecurityBadge();
    },

    /**
     * Save all data to Firestore
     */
    async saveToCloud() {
        if (!this.currentUser) {
            return false;
        }

        // Ensure firestore-compat is loaded (lazy on landing pages)
        if (typeof window.ensureFirestore === 'function') {
            try { await window.ensureFirestore(); } catch (e) {}
        }
        if (!window.firebaseDb) return false;

        try {
            const userId = this.currentUser.uid;
            const sensitiveData = {
                bankAccounts: Storage.getBankAccounts(),
                creditCards: Storage.getCreditCards(),
                stocks: Storage.getStocks(),
                assets: Storage.getAssets(),
                myFunds: Storage.getMyFunds(),
                settings: Storage.getSettings(),
                stockAlerts: Storage.get(Storage.KEYS.STOCK_ALERTS),
                tvCustomSymbols: Storage.getTVCustomSymbols(),
                notifications: Storage.getNotifications(),
                dashboardWidgets: Storage.getDashboardWidgets(),
                importTemplates: Storage.getImportTemplates(),
                userProfile: Storage.getUserProfile(),
                dismissedTips: Storage.getDismissedTips(),
                loans: Storage.getLoans(),
                creditScore: Storage.getCreditScore(),
                subscriptions: Storage.getSubscriptions()
            };

            // Trim old transactions to prevent exceeding Firestore 1MB limit
            if (sensitiveData.stocks && Array.isArray(sensitiveData.stocks.transactions)) {
                const txs = sensitiveData.stocks.transactions;
                if (txs.length > 200) {
                    sensitiveData.stocks.transactions = txs
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .slice(0, 200);

                }
            }

            // Encrypt sensitive data before uploading
            let data;
            const rawSize = new Blob([JSON.stringify(sensitiveData)]).size;
            console.log(`Cloud sync: raw data size = ${(rawSize / 1024).toFixed(1)} KB`);

            if (typeof DataCrypto !== 'undefined') {
                const encrypted = await DataCrypto.encrypt(sensitiveData, userId);
                if (!encrypted) {
                    console.error('Encryption failed, aborting cloud save');
                    App.notify('שגיאה בהצפנה - הנתונים לא נשמרו בענן', 'error');
                    return false;
                }
                const encSize = new Blob([encrypted]).size;
                console.log(`Cloud sync: encrypted size = ${(encSize / 1024).toFixed(1)} KB`);
                if (encSize > 900000) {
                    console.warn('Cloud sync: data approaching Firestore 1MB limit!');
                    App.notify('אזהרה: הנתונים גדולים מאוד, ייתכן שהסנכרון ייכשל', 'warning');
                }
                data = {
                    encryptedData: encrypted,
                    encrypted: true,
                    lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
                    lastUpdatedBy: this.currentUser.email
                };
            } else {
                data = {
                    ...sensitiveData,
                    encrypted: false,
                    lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
                    lastUpdatedBy: this.currentUser.email
                };
            }

            await window.firebaseDb.collection('users').doc(userId).set(data, { merge: false });

            // Update sync status
            const syncStatus = document.getElementById('syncStatus');
            if (syncStatus) {
                syncStatus.innerHTML = '☁️ ' + I18n.t('auth.cloudSaved');
                syncStatus.className = 'sync-status synced';
                setTimeout(() => {
                    syncStatus.innerHTML = '☁️ ' + I18n.t('auth.cloudSynced');
                }, 2000);
            }

            return true;
        } catch (error) {
            console.error('Cloud save error:', error.message || error);
            App.notify(I18n.t('auth.cloudSaveError') + ' — ' + (error.message || ''), 'error');
            const syncStatus = document.getElementById('syncStatus');
            if (syncStatus) {
                syncStatus.innerHTML = '⚠️ שגיאת סנכרון';
                syncStatus.className = 'sync-status local';
            }
            return false;
        }
    },

    /**
     * Load data from Firestore
     */
    _refreshPageData() {
        if (typeof loadAssets === 'function') loadAssets();
        if (typeof loadAccounts === 'function') loadAccounts();
        if (typeof loadCards === 'function') loadCards();
        if (typeof loadExpenses === 'function') loadExpenses();
        if (typeof loadGoals === 'function') loadGoals();
        if (typeof loadFunds === 'function') loadFunds();
        if (typeof loadStocks === 'function') loadStocks();
        if (typeof loadWatchlist === 'function') loadWatchlist();
        if (typeof refreshAllPrices === 'function') refreshAllPrices();
        if (typeof rebuildTVDropdown === 'function') rebuildTVDropdown();
        if (typeof loadLoans === 'function') loadLoans();
        if (typeof loadSubscriptions === 'function') loadSubscriptions();
        if (typeof loadProfile === 'function') loadProfile();
        if (typeof App !== 'undefined') App.updateDashboard();
    },

    async syncFromCloud() {
        if (!this.currentUser) {
            return false;
        }

        // Prevent re-syncing right after a sync-triggered reload
        if (sessionStorage.getItem('finance_just_synced')) {
            sessionStorage.removeItem('finance_just_synced');
            return true;
        }

        // Ensure firestore-compat is loaded (lazy on landing pages)
        if (typeof window.ensureFirestore === 'function') {
            try { await window.ensureFirestore(); } catch (e) {}
        }
        if (!window.firebaseDb) return false;

        try {
            const userId = this.currentUser.uid;
            const doc = await window.firebaseDb.collection('users').doc(userId).get();

            if (doc.exists) {
                const rawData = doc.data();
                console.log('Cloud sync: document found, encrypted:', !!rawData.encrypted, 'lastUpdated:', rawData.lastUpdated?.toDate?.());
                const localLastUpdate = localStorage.getItem('finance_last_update');
                const cloudLastUpdate = rawData.lastUpdated?.toDate?.()?.getTime() || 0;
                const localTime = localLastUpdate ? new Date(localLastUpdate).getTime() : 0;

                // Decrypt cloud data
                let data;
                if (rawData.encrypted && rawData.encryptedData && typeof DataCrypto !== 'undefined') {
                    data = await DataCrypto.decrypt(rawData.encryptedData, userId);
                    if (!data) {
                        console.error('Failed to decrypt cloud data');
                        App.notify(I18n.t('auth.decryptError'), 'error');
                        return false;
                    }
                } else {
                    data = rawData;
                }

                // Count data items in cloud vs local
                const stockData = data.stocks;
                console.log('Cloud sync: decrypted data keys:', Object.keys(data).join(', '));

                const cloudItemCount = this._countDataItems(data);
                const localItemCount = this._countDataItems({
                    bankAccounts: Storage.getBankAccounts(),
                    creditCards: Storage.getCreditCards(),
                    stocks: Storage.getStocks(),
                    assets: Storage.getAssets(),
                    myFunds: Storage.getMyFunds(),
                    loans: Storage.getLoans(),
                    subscriptions: Storage.getSubscriptions()
                });

                // Check if cloud data is newer or if this is first sync


                if (cloudLastUpdate > localTime || !localLastUpdate) {
                    // If cloud is empty but local has data, don't overwrite — upload local instead
                    if (cloudItemCount === 0 && localItemCount > 0) {
                        App.notify(I18n.t('auth.localDataPreserved') || 'הנתונים המקומיים נשמרו ועולים לענן', 'info');
                        await this.saveToCloud();
                        return true;
                    }

                    // If cloud has significantly less data, ask user
                    if (localItemCount > 0 && cloudItemCount < localItemCount * 0.5) {
                        const lang = I18n?.currentLanguage || 'he';
                        const msg = lang === 'he'
                            ? `בענן יש ${cloudItemCount} פריטים, במכשיר הזה יש ${localItemCount}. לדרוס את הנתונים המקומיים?`
                            : `Cloud has ${cloudItemCount} items, this device has ${localItemCount}. Overwrite local data?`;
                        if (!confirm(msg)) {
                            await this.saveToCloud();
                            return true;
                        }
                    }

                    // Cloud is newer, update local

                    if (data.bankAccounts) Storage.saveBankAccounts(data.bankAccounts);
                    if (data.creditCards) Storage.saveCreditCards(data.creditCards);
                    if (data.stocks) { Storage.saveStocks(data.stocks); console.log('Cloud sync: stocks restored -', data.stocks.holdings?.length, 'holdings,', data.stocks.transactions?.length, 'transactions'); }
                    if (data.assets) Storage.saveAssets(data.assets);
                    if (data.myFunds) Storage.saveMyFunds(data.myFunds);
                    if (data.settings) Storage.saveSettings(data.settings);
                    if (data.stockAlerts) Storage.set(Storage.KEYS.STOCK_ALERTS, data.stockAlerts);
                    if (data.tvCustomSymbols) Storage.saveTVCustomSymbols(data.tvCustomSymbols);
                    if (data.notifications) Storage.saveNotifications(data.notifications);
                    if (data.dashboardWidgets) Storage.saveDashboardWidgets(data.dashboardWidgets);
                    if (data.importTemplates) Storage.saveImportTemplates(data.importTemplates);
                    if (data.userProfile) Storage.saveUserProfile(data.userProfile);
                    if (data.dismissedTips) Storage.saveDismissedTips(data.dismissedTips);
                    if (data.loans) Storage.saveLoans(data.loans);
                    if (data.creditScore) Storage.saveCreditScore(data.creditScore);
                    if (data.subscriptions) Storage.saveSubscriptions(data.subscriptions);

                    localStorage.setItem('finance_last_update', new Date().toISOString());

                    // Refresh all page data after cloud sync
                    this._refreshPageData();
                    App.notify(I18n.t('auth.dataSynced'), 'success');

                    return true;
                } else {
                    // Local timestamp is newer — but check if local actually has data
                    if (localItemCount > 0) {
                        await this.saveToCloud();
                    } else if (cloudItemCount > 0) {
                        // Local is empty but cloud has data — download from cloud instead
                        if (data.bankAccounts) Storage.saveBankAccounts(data.bankAccounts);
                        if (data.creditCards) Storage.saveCreditCards(data.creditCards);
                        if (data.stocks) Storage.saveStocks(data.stocks);
                        if (data.assets) Storage.saveAssets(data.assets);
                        if (data.myFunds) Storage.saveMyFunds(data.myFunds);
                        if (data.settings) Storage.saveSettings(data.settings);
                        if (data.stockAlerts) Storage.set(Storage.KEYS.STOCK_ALERTS, data.stockAlerts);
                        if (data.tvCustomSymbols) Storage.saveTVCustomSymbols(data.tvCustomSymbols);
                        if (data.notifications) Storage.saveNotifications(data.notifications);
                        if (data.dashboardWidgets) Storage.saveDashboardWidgets(data.dashboardWidgets);
                        if (data.importTemplates) Storage.saveImportTemplates(data.importTemplates);
                        if (data.userProfile) Storage.saveUserProfile(data.userProfile);
                        if (data.dismissedTips) Storage.saveDismissedTips(data.dismissedTips);
                        if (data.loans) Storage.saveLoans(data.loans);
                        if (data.creditScore) Storage.saveCreditScore(data.creditScore);
                        if (data.subscriptions) Storage.saveSubscriptions(data.subscriptions);
                        localStorage.setItem('finance_last_update', new Date().toISOString());

                        // Refresh all page data after cloud sync
                        this._refreshPageData();
                        App.notify(I18n.t('auth.dataSynced'), 'success');
                    } else {
                    }
                }
            } else {

                // No cloud data — only save if local has actual data
                const localCount = this._countDataItems({
                    bankAccounts: Storage.getBankAccounts(),
                    creditCards: Storage.getCreditCards(),
                    stocks: Storage.getStocks(),
                    assets: Storage.getAssets(),
                    myFunds: Storage.getMyFunds(),
                    loans: Storage.getLoans(),
                    subscriptions: Storage.getSubscriptions()
                });
                if (localCount > 0) {
                    await this.saveToCloud();
                } else {
                }
            }

            return true;
        } catch (error) {
            console.error('Cloud sync error:', error.message || error);
            App.notify(I18n.t('auth.cloudSyncError') + ' — ' + (error.message || ''), 'error');
            return false;
        }
    },

    /**
     * Force sync (manual trigger) — downloads from cloud first, then uploads
     */
    async forceSync() {
        if (!this.currentUser) {
            App.notify(I18n.t('auth.loginFirst'), 'warning');
            return;
        }

        const syncStatus = document.getElementById('syncStatus');
        if (syncStatus) {
            syncStatus.innerHTML = '🔄 ' + I18n.t('auth.syncing');
            syncStatus.className = 'sync-status syncing';
        }

        // First pull from cloud (handles conflict resolution)
        await this.syncFromCloud();

        // Then push local state to cloud
        await this.saveToCloud();
        App.notify(I18n.t('auth.syncSuccess'), 'success');
    },

    /**
     * Count total data items across financial categories
     */
    _countDataItems(data) {
        let count = 0;
        if (data.bankAccounts) count += Array.isArray(data.bankAccounts) ? data.bankAccounts.length : 0;
        if (data.creditCards) {
            const cc = data.creditCards;
            count += (cc.cards?.length || 0) + (cc.expenses?.length || 0);
        }
        if (data.stocks) {
            const s = data.stocks;
            count += (s.holdings?.length || 0) + (s.transactions?.length || 0);
        }
        if (data.assets) count += Array.isArray(data.assets) ? data.assets.length : 0;
        if (data.myFunds) count += Array.isArray(data.myFunds) ? data.myFunds.length : 0;
        if (data.loans) count += Array.isArray(data.loans) ? data.loans.length : 0;
        if (data.subscriptions) count += Array.isArray(data.subscriptions) ? data.subscriptions.length : 0;
        return count;
    },

    /**
     * Delete all user data from cloud and local
     */
    async deleteAllData() {
        if (!confirm(I18n.t('auth.deleteConfirm1'))) return;
        if (!confirm(I18n.t('auth.deleteConfirm2'))) return;

        try {
            // Delete from Firestore — ensure firestore-compat is loaded (lazy on landing)
            if (this.currentUser) {
                if (typeof window.ensureFirestore === 'function') {
                    try { await window.ensureFirestore(); } catch (e) {}
                }
                if (window.firebaseDb) {
                    await window.firebaseDb.collection('users').doc(this.currentUser.uid).delete();
                }
            }

            // Delete from localStorage
            const keysToDelete = Object.keys(localStorage).filter(k => k.startsWith('finance_') || k.startsWith('market_') || k.startsWith('mygemel_'));
            keysToDelete.forEach(k => localStorage.removeItem(k));

            App.notify(I18n.t('auth.allDataDeleted'), 'success');
            setTimeout(() => location.reload(), 1500);
        } catch (error) {
            console.error('Delete all data error:', error);
            App.notify(I18n.t('auth.deleteError'), 'error');
        }
    }
};

// Auto-logout after 30 minutes of inactivity
let inactivityTimer = null;
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    if (Auth.currentUser) {
        inactivityTimer = setTimeout(() => {
            Auth.signOut();
            App.notify(I18n.t('auth.autoLogout'), 'info');
        }, INACTIVITY_TIMEOUT);
    }
}

['click', 'keydown', 'scroll', 'touchstart'].forEach(event => {
    document.addEventListener(event, resetInactivityTimer, { passive: true });
});

// Auto-save to cloud when data changes (debounced)
// Only track meaningful financial data keys for timestamp updates
const FINANCIAL_KEYS = ['finance_bank_accounts', 'finance_credit_cards', 'finance_stocks',
    'finance_assets', 'finance_my_funds', 'finance_loans', 'finance_user_profile',
    'finance_stock_alerts', 'finance_goals', 'finance_subscriptions'];
let saveTimeout = null;
const originalStorageSet = Storage.set.bind(Storage);
Storage.set = function(key, data) {
    originalStorageSet(key, data);

    // Only update timestamp for meaningful financial data changes
    if (FINANCIAL_KEYS.includes(key)) {
        localStorage.setItem('finance_last_update', new Date().toISOString());
    }

    // Debounced cloud save — only if we have actual data to save
    if (Auth.currentUser && FINANCIAL_KEYS.includes(key)) {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            const count = Auth._countDataItems({
                bankAccounts: Storage.getBankAccounts(),
                creditCards: Storage.getCreditCards(),
                stocks: Storage.getStocks(),
                assets: Storage.getAssets(),
                myFunds: Storage.getMyFunds(),
                loans: Storage.getLoans(),
                subscriptions: Storage.getSubscriptions()
            });
            if (count > 0) {
                Auth.saveToCloud();
            }
        }, 2000);
    }
};

// Make available globally
window.Auth = Auth;

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Firebase to be ready
    if (typeof firebase !== 'undefined' && typeof firebaseAuth !== 'undefined') {
        Auth.init();
    }
});
