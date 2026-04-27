/**
 * PIN Lock Module — App lock, auto-lock & localStorage encryption
 */
const PinLock = {
    _autoLockTimer: null,
    _overlay: null,
    _mode: null, // 'unlock', 'setup', 'confirm', 'verify'
    _setupPin: null,
    _onVerifySuccess: null,
    _pinLength: 0,

    init() {
        if (!this.isEnabled()) return;

        // If already unlocked this session and within the timeout window, skip PIN
        const sessionTs = parseInt(sessionStorage.getItem('pin_session_unlocked')) || 0;
        const timeoutMs = this.getTimeout() * 60 * 1000;
        if (sessionTs && (Date.now() - sessionTs) < timeoutMs) {
            this.startAutoLock();
            return;
        }

        this._injectOverlay();
        this.showLockScreen();
        // Auto-lock timer starts after successful unlock, not here
    },

    isEnabled() {
        return !!localStorage.getItem('finance_pin_hash');
    },

    getTimeout() {
        try {
            return parseInt(localStorage.getItem('finance_lock_timeout')) || 5;
        } catch { return 5; }
    },

    setTimeout(minutes) {
        localStorage.setItem('finance_lock_timeout', String(minutes));
    },

    // ── Crypto helpers ──

    async _hash(pin, salt) {
        const encoder = new TextEncoder();
        const data = encoder.encode(pin + ':' + salt);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
    },

    async _deriveKey(pin, salt) {
        const encoder = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            encoder.encode(pin),
            'PBKDF2',
            false,
            ['deriveKey']
        );
        return crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: encoder.encode(salt),
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
    },

    async verifyPin(pin) {
        const salt = localStorage.getItem('finance_pin_salt');
        const storedHash = localStorage.getItem('finance_pin_hash');
        if (!salt || !storedHash) return false;
        const hash = await this._hash(pin, salt);
        return hash === storedHash;
    },

    // ── Lock / Unlock ──

    async unlock(pin) {
        const valid = await this.verifyPin(pin);
        if (!valid) return false;

        const salt = localStorage.getItem('finance_pin_salt');
        const cryptoKey = await this._deriveKey(pin, salt);

        await Storage.decryptAll(cryptoKey);
        Storage.setEncryptionKey(cryptoKey);
        this._hideOverlay();
        sessionStorage.setItem('pin_session_unlocked', Date.now());
        this.startAutoLock();

        // Reload page data
        if (typeof App !== 'undefined' && App.init) {
            try { App.init(); } catch (e) { console.error('App.init error:', e); }
        }
        return true;
    },

    async lock() {
        if (!this.isEnabled()) return;
        if (this._overlay && this._overlay.style.display !== 'none') return; // already locked

        sessionStorage.removeItem('pin_session_unlocked');
        await Storage.encryptAll();
        this._stopAutoLock();
        this.showLockScreen();
    },

    async enable(pin) {
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const saltStr = btoa(String.fromCharCode(...salt));

        const hash = await this._hash(pin, saltStr);
        const cryptoKey = await this._deriveKey(pin, saltStr);

        localStorage.setItem('finance_pin_salt', saltStr);
        localStorage.setItem('finance_pin_hash', hash);
        if (!localStorage.getItem('finance_lock_timeout')) {
            localStorage.setItem('finance_lock_timeout', '5');
        }

        await Storage.migrateToEncrypted(cryptoKey);
        // After migration data is encrypted — decrypt for current session
        const key2 = await this._deriveKey(pin, saltStr);
        await Storage.decryptAll(key2);
        Storage.setEncryptionKey(key2);

        this.startAutoLock();
    },

    async disable(pin) {
        const salt = localStorage.getItem('finance_pin_salt');
        const cryptoKey = await this._deriveKey(pin, salt);
        await Storage.migrateToDecrypted(cryptoKey);

        localStorage.removeItem('finance_pin_hash');
        localStorage.removeItem('finance_pin_salt');
        localStorage.removeItem('finance_lock_timeout');

        this._stopAutoLock();
    },

    async changePin(oldPin, newPin) {
        const oldSalt = localStorage.getItem('finance_pin_salt');
        const oldKey = await this._deriveKey(oldPin, oldSalt);

        // Decrypt with old key
        await Storage.decryptAll(oldKey);

        // Remove old credentials
        localStorage.removeItem('finance_pin_hash');
        localStorage.removeItem('finance_pin_salt');

        // Enable with new PIN (encrypts with new key)
        await this.enable(newPin);
    },

    forgotPin() {
        const msg = typeof I18n !== 'undefined'
            ? I18n.t('pinLock.resetWarning')
            : 'Reset will delete all data!';
        if (!confirm(msg)) return;
        if (!confirm(msg)) return; // double confirm
        localStorage.clear();
        location.reload();
    },

    // ── Auto-lock ──

    startAutoLock() {
        if (!this.isEnabled()) return;
        const events = ['click', 'keydown', 'scroll', 'touchstart'];
        events.forEach(e => document.addEventListener(e, this._onActivity, { passive: true }));
        this._resetTimer();
    },

    _stopAutoLock() {
        if (this._autoLockTimer) clearTimeout(this._autoLockTimer);
        const events = ['click', 'keydown', 'scroll', 'touchstart'];
        events.forEach(e => document.removeEventListener(e, this._onActivity));
    },

    _onActivity: (() => {
        // Bound function so we can remove listener
        const fn = () => PinLock._resetTimer();
        return fn;
    })(),

    _resetTimer() {
        if (this._autoLockTimer) clearTimeout(this._autoLockTimer);
        sessionStorage.setItem('pin_session_unlocked', Date.now());
        const minutes = this.getTimeout();
        this._autoLockTimer = window.setTimeout(() => {
            this.lock();
        }, minutes * 60 * 1000);
    },

    // ── UI ──

    _injectOverlay() {
        if (this._overlay) return;

        const overlay = document.createElement('div');
        overlay.id = 'pinLockOverlay';
        overlay.innerHTML = `
            <div class="pin-lock-container">
                <img src="" class="pin-lock-logo" alt="WizeMoney" id="pinLockLogo">
                <h2 class="pin-lock-title" id="pinLockTitle"></h2>
                <div class="pin-lock-dots" id="pinLockDots"></div>
                <div class="pin-lock-error" id="pinLockError"></div>
                <div class="pin-lock-keypad" id="pinLockKeypad">
                    <button class="pin-key" data-key="1">1</button>
                    <button class="pin-key" data-key="2">2</button>
                    <button class="pin-key" data-key="3">3</button>
                    <button class="pin-key" data-key="4">4</button>
                    <button class="pin-key" data-key="5">5</button>
                    <button class="pin-key" data-key="6">6</button>
                    <button class="pin-key" data-key="7">7</button>
                    <button class="pin-key" data-key="8">8</button>
                    <button class="pin-key" data-key="9">9</button>
                    <button class="pin-key pin-key-action" data-key="back">&larr;</button>
                    <button class="pin-key" data-key="0">0</button>
                    <button class="pin-key pin-key-action pin-key-submit" data-key="ok">&#10003;</button>
                </div>
                <button class="pin-lock-biometric" id="pinLockBiometric" style="display:none">
                    <span class="biometric-icon">🔒</span>
                    <span id="pinLockBiometricLabel">Face ID / Touch ID</span>
                </button>
                <button class="pin-lock-forgot" id="pinLockForgot"></button>
            </div>
        `;

        // Logo path — detect if we're in pages/ or root
        const logo = overlay.querySelector('#pinLockLogo');
        logo.src = location.pathname.includes('/pages/') ? '../img/logo.svg' : './img/logo.svg';

        // Inject styles
        const style = document.createElement('style');
        style.textContent = `
            #pinLockOverlay {
                position: fixed; inset: 0; z-index: 10000;
                background: rgba(15, 15, 20, 0.97);
                backdrop-filter: blur(20px);
                display: flex; align-items: center; justify-content: center;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                direction: ltr;
            }
            .pin-lock-container {
                text-align: center; max-width: 340px; width: 90%;
            }
            .pin-lock-logo {
                width: 72px; height: 72px; border-radius: 18px; margin-bottom: 18px;
            }
            .pin-lock-title {
                color: #e5e7eb; font-size: 1.3rem; font-weight: 500; margin-bottom: 24px;
            }
            .pin-lock-dots {
                display: flex; gap: 14px; justify-content: center; margin-bottom: 12px; min-height: 22px;
            }
            .pin-dot {
                width: 16px; height: 16px; border-radius: 50%;
                border: 2px solid #6b7280; transition: all 0.15s;
            }
            .pin-dot.filled {
                background: #10b981; border-color: #10b981;
            }
            .pin-lock-error {
                color: #ef4444; font-size: 0.9rem; min-height: 24px; margin-bottom: 8px;
            }
            .pin-lock-keypad {
                display: grid; grid-template-columns: repeat(3, 1fr);
                gap: 12px; max-width: 280px; margin: 0 auto 24px;
            }
            .pin-key {
                width: 100%; aspect-ratio: 1.3; border-radius: 14px;
                border: 1px solid #374151; background: rgba(55, 65, 81, 0.5);
                color: #e5e7eb; font-size: 1.5rem; cursor: pointer;
                transition: all 0.12s; display: flex; align-items: center; justify-content: center;
                -webkit-tap-highlight-color: transparent; user-select: none;
            }
            .pin-key:active { background: rgba(55, 65, 81, 0.9); transform: scale(0.95); }
            .pin-key-submit { background: rgba(16, 185, 129, 0.2); border-color: #10b981; color: #10b981; }
            .pin-key-submit:active { background: rgba(16, 185, 129, 0.4); }
            .pin-lock-biometric {
                display: flex; align-items: center; gap: 8px;
                background: rgba(0, 210, 255, 0.1); border: 1px solid rgba(0, 210, 255, 0.3);
                color: #00d2ff; border-radius: 14px; padding: 10px 22px;
                font-size: 0.95rem; cursor: pointer; margin: 0 auto 12px;
                transition: background 0.15s; -webkit-tap-highlight-color: transparent;
            }
            .pin-lock-biometric:active { background: rgba(0, 210, 255, 0.2); }
            .biometric-icon { font-size: 1.3rem; }
            .pin-lock-forgot {
                background: none; border: none; color: #6b7280; font-size: 0.85rem;
                cursor: pointer; padding: 8px 16px; text-decoration: underline;
            }
            .pin-lock-forgot:hover { color: #9ca3af; }

            @keyframes pinShake {
                0%, 100% { transform: translateX(0); }
                20%, 60% { transform: translateX(-8px); }
                40%, 80% { transform: translateX(8px); }
            }
            .pin-lock-shake .pin-lock-dots { animation: pinShake 0.4s ease; }
        `;
        document.head.appendChild(style);
        document.body.appendChild(overlay);
        this._overlay = overlay;

        // Event listeners
        overlay.querySelector('#pinLockKeypad').addEventListener('click', (e) => {
            const btn = e.target.closest('.pin-key');
            if (!btn) return;
            this._onKeyPress(btn.dataset.key);
        });

        overlay.querySelector('#pinLockForgot').addEventListener('click', () => {
            this.forgotPin();
        });

        // Physical keyboard support
        this._keyHandler = (e) => {
            if (this._overlay.style.display === 'none') return;
            if (e.key >= '0' && e.key <= '9') this._onKeyPress(e.key);
            else if (e.key === 'Backspace') this._onKeyPress('back');
            else if (e.key === 'Enter') this._onKeyPress('ok');
        };
        document.addEventListener('keydown', this._keyHandler);
    },

    _currentPin: '',

    _renderDots(count) {
        const container = this._overlay.querySelector('#pinLockDots');
        const maxDots = 6;
        container.innerHTML = '';
        for (let i = 0; i < maxDots; i++) {
            const dot = document.createElement('div');
            dot.className = 'pin-dot' + (i < count ? ' filled' : '');
            container.appendChild(dot);
        }
    },

    _onKeyPress(key) {
        const errorEl = this._overlay.querySelector('#pinLockError');

        if (key === 'back') {
            if (this._currentPin.length > 0) {
                this._currentPin = this._currentPin.slice(0, -1);
                this._renderDots(this._currentPin.length);
            }
            return;
        }

        if (key === 'ok') {
            if (this._currentPin.length < 4) {
                errorEl.textContent = this._t('pinLock.pinTooShort', 'PIN must be 4-6 digits');
                return;
            }
            this._submitPin(this._currentPin);
            return;
        }

        // Digit
        if (this._currentPin.length < 6) {
            this._currentPin += key;
            this._renderDots(this._currentPin.length);
            errorEl.textContent = '';
        }
    },

    // ── Brute Force Protection ──

    _getFailCount() {
        return parseInt(sessionStorage.getItem('pin_fail_count')) || 0;
    },

    _setFailCount(n) {
        sessionStorage.setItem('pin_fail_count', String(n));
    },

    _getLockoutUntil() {
        return parseInt(sessionStorage.getItem('pin_lockout_until')) || 0;
    },

    _setLockoutUntil(ts) {
        sessionStorage.setItem('pin_lockout_until', String(ts));
    },

    _clearLockout() {
        sessionStorage.removeItem('pin_fail_count');
        sessionStorage.removeItem('pin_lockout_until');
    },

    _getLockoutDuration(failCount) {
        if (failCount >= 12) return 10 * 60 * 1000; // 10 minutes
        if (failCount >= 8) return 2 * 60 * 1000;   // 2 minutes
        if (failCount >= 5) return 30 * 1000;        // 30 seconds
        return 0;
    },

    _isLockedOut() {
        const until = this._getLockoutUntil();
        return until > Date.now();
    },

    _startLockoutTimer() {
        if (this._lockoutInterval) clearInterval(this._lockoutInterval);
        const errorEl = this._overlay?.querySelector('#pinLockError');
        const keypad = this._overlay?.querySelector('#pinLockKeypad');
        if (!errorEl) return;

        const tick = () => {
            const remaining = this._getLockoutUntil() - Date.now();
            if (remaining <= 0) {
                clearInterval(this._lockoutInterval);
                this._lockoutInterval = null;
                errorEl.textContent = '';
                if (keypad) keypad.style.opacity = '1';
                if (keypad) keypad.style.pointerEvents = '';
                return;
            }
            const secs = Math.ceil(remaining / 1000);
            const mins = Math.floor(secs / 60);
            const secsPart = secs % 60;
            const timeStr = mins > 0
                ? `${mins}:${String(secsPart).padStart(2, '0')}`
                : `${secs}`;
            errorEl.textContent = this._t('pinLock.lockoutMessage', `Try again in ${timeStr} seconds`)
                .replace('{time}', timeStr);
            if (keypad) keypad.style.opacity = '0.4';
            if (keypad) keypad.style.pointerEvents = 'none';
        };
        tick();
        this._lockoutInterval = setInterval(tick, 1000);
    },

    async _submitPin(pin) {
        const errorEl = this._overlay.querySelector('#pinLockError');
        const container = this._overlay.querySelector('.pin-lock-container');

        if (this._mode === 'unlock' || this._mode === 'verify') {
            // Check lockout before attempting
            if (this._isLockedOut()) {
                this._startLockoutTimer();
                this._currentPin = '';
                this._renderDots(0);
                return;
            }

            const success = await this.verifyPin(pin);
            if (success) {
                this._clearLockout();
                if (this._mode === 'unlock') {
                    await this.unlock(pin);
                } else if (this._mode === 'verify' && this._onVerifySuccess) {
                    this._onVerifySuccess(pin);
                    this._hideOverlay();
                }
            } else {
                const fails = this._getFailCount() + 1;
                this._setFailCount(fails);
                const lockDuration = this._getLockoutDuration(fails);
                if (lockDuration > 0) {
                    this._setLockoutUntil(Date.now() + lockDuration);
                    this._startLockoutTimer();
                } else {
                    errorEl.textContent = this._t('pinLock.wrongPin', 'Wrong PIN');
                }
                container.classList.add('pin-lock-shake');
                setTimeout(() => container.classList.remove('pin-lock-shake'), 500);
                this._currentPin = '';
                this._renderDots(0);
            }
        } else if (this._mode === 'setup') {
            this._setupPin = pin;
            this._mode = 'confirm';
            this._currentPin = '';
            this._renderDots(0);
            this._overlay.querySelector('#pinLockTitle').textContent =
                this._t('pinLock.confirmPin', 'Confirm PIN');
            errorEl.textContent = '';
        } else if (this._mode === 'confirm') {
            if (pin === this._setupPin) {
                if (this._onVerifySuccess) {
                    this._onVerifySuccess(pin);
                }
                this._hideOverlay();
            } else {
                errorEl.textContent = this._t('pinLock.pinMismatch', "PINs don't match");
                container.classList.add('pin-lock-shake');
                setTimeout(() => container.classList.remove('pin-lock-shake'), 500);
                this._currentPin = '';
                this._renderDots(0);
                // Go back to setup
                this._mode = 'setup';
                this._setupPin = null;
                this._overlay.querySelector('#pinLockTitle').textContent =
                    this._t('pinLock.setupPin', 'Set PIN');
            }
        }
    },

    showLockScreen() {
        this._injectOverlay();
        this._mode = 'unlock';
        this._currentPin = '';
        this._setupPin = null;
        this._overlay.style.display = 'flex';
        this._overlay.querySelector('#pinLockTitle').textContent =
            this._t('pinLock.enterPin', 'Enter PIN');
        this._overlay.querySelector('#pinLockError').textContent = '';
        this._overlay.querySelector('#pinLockForgot').textContent =
            this._t('pinLock.forgotPin', 'Forgot PIN?');
        this._overlay.querySelector('#pinLockForgot').style.display = '';
        this._renderDots(0);
        // Resume lockout timer if still locked
        if (this._isLockedOut()) {
            this._startLockoutTimer();
        }
        // Show biometric button if enrolled
        this._setupBiometricButton();
    },

    _setupBiometricButton() {
        const btn = this._overlay?.querySelector('#pinLockBiometric');
        if (!btn) return;

        if (!this.biometricEnabled()) { btn.style.display = 'none'; return; }

        // Detect Face ID vs Touch ID by platform hint
        const isMac = /Mac|iPhone|iPad/.test(navigator.userAgent);
        const label = this._overlay.querySelector('#pinLockBiometricLabel');
        if (label) label.textContent = isMac ? 'Face ID / Touch ID' : 'פתח עם טביעת אצבע';

        // Detect icon
        const icon = btn.querySelector('.biometric-icon');
        if (icon) icon.textContent = isMac ? '🔐' : '👆';

        btn.style.display = 'flex';
        btn.onclick = async () => {
            btn.disabled = true;
            const ok = await this.tryBiometricUnlock();
            if (!ok) {
                btn.disabled = false;
                const err = this._overlay?.querySelector('#pinLockError');
                if (err) err.textContent = 'אימות ביומטרי נכשל — הזן PIN';
            }
        };

        // Auto-trigger biometric after short delay (iOS UX pattern)
        setTimeout(() => {
            if (this._overlay?.style.display !== 'none') btn.click();
        }, 400);
    },

    showSetupScreen(onComplete) {
        this._injectOverlay();
        this._mode = 'setup';
        this._currentPin = '';
        this._setupPin = null;
        this._onVerifySuccess = onComplete;
        this._overlay.style.display = 'flex';
        this._overlay.querySelector('#pinLockTitle').textContent =
            this._t('pinLock.setupPin', 'Set PIN');
        this._overlay.querySelector('#pinLockError').textContent = '';
        this._overlay.querySelector('#pinLockForgot').textContent =
            this._t('common.cancel', 'Cancel');
        this._overlay.querySelector('#pinLockForgot').style.display = '';
        // Override forgot to cancel
        this._overlay.querySelector('#pinLockForgot').onclick = () => this._hideOverlay();
        this._renderDots(0);
    },

    showVerifyScreen(onSuccess) {
        this._injectOverlay();
        this._mode = 'verify';
        this._currentPin = '';
        this._onVerifySuccess = onSuccess;
        this._overlay.style.display = 'flex';
        this._overlay.querySelector('#pinLockTitle').textContent =
            this._t('pinLock.enterPin', 'Enter PIN');
        this._overlay.querySelector('#pinLockError').textContent = '';
        this._overlay.querySelector('#pinLockForgot').textContent =
            this._t('pinLock.forgotPin', 'Forgot PIN?');
        this._overlay.querySelector('#pinLockForgot').style.display = '';
        this._overlay.querySelector('#pinLockForgot').onclick = () => this.forgotPin();
        this._renderDots(0);
    },

    _hideOverlay() {
        if (this._overlay) {
            this._overlay.style.display = 'none';
            this._currentPin = '';
            this._setupPin = null;
            this._onVerifySuccess = null;
        }
    },

    _t(key, fallback) {
        if (typeof I18n !== 'undefined' && I18n.t) {
            const val = I18n.t(key);
            return val !== key ? val : fallback;
        }
        return fallback;
    },

    // ── Biometric (Face ID / Touch ID via WebAuthn) ──

    async biometricSupported() {
        if (!window.PublicKeyCredential) return false;
        try {
            return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        } catch { return false; }
    },

    biometricEnabled() {
        return !!localStorage.getItem('finance_biometric_id');
    },

    async registerBiometric(pin) {
        try {
            const challenge = crypto.getRandomValues(new Uint8Array(32));
            const hostname = location.hostname || 'localhost';
            const credential = await navigator.credentials.create({
                publicKey: {
                    challenge,
                    rp: { name: 'WizeMoney', id: hostname },
                    user: {
                        id: new TextEncoder().encode('finsight-user'),
                        name: 'WizeMoney',
                        displayName: 'WizeMoney'
                    },
                    pubKeyCredParams: [
                        { type: 'public-key', alg: -7 },
                        { type: 'public-key', alg: -257 }
                    ],
                    authenticatorSelection: {
                        authenticatorAttachment: 'platform',
                        userVerification: 'required',
                        residentKey: 'preferred'
                    },
                    timeout: 60000
                }
            });
            const credId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
            localStorage.setItem('finance_biometric_id', credId);
            // Store PIN obfuscated for biometric retrieval
            const mask = crypto.getRandomValues(new Uint8Array(pin.length));
            const pinBytes = new TextEncoder().encode(pin);
            const enc = pinBytes.map((b, i) => b ^ mask[i]);
            localStorage.setItem('finance_biometric_enc', btoa(String.fromCharCode(...enc)));
            localStorage.setItem('finance_biometric_mask', btoa(String.fromCharCode(...mask)));
            return true;
        } catch (e) {
            console.warn('Biometric registration failed:', e);
            return false;
        }
    },

    async _getBiometricPin() {
        const credIdBase64 = localStorage.getItem('finance_biometric_id');
        if (!credIdBase64) return null;
        try {
            const credIdBytes = Uint8Array.from(atob(credIdBase64), c => c.charCodeAt(0));
            const challenge = crypto.getRandomValues(new Uint8Array(32));
            const assertion = await navigator.credentials.get({
                publicKey: {
                    challenge,
                    allowCredentials: [{ type: 'public-key', id: credIdBytes, transports: ['internal'] }],
                    userVerification: 'required',
                    timeout: 60000,
                    rpId: location.hostname || 'localhost'
                }
            });
            if (!assertion) return null;
            // Retrieve obfuscated PIN
            const enc  = Uint8Array.from(atob(localStorage.getItem('finance_biometric_enc')),  c => c.charCodeAt(0));
            const mask = Uint8Array.from(atob(localStorage.getItem('finance_biometric_mask')), c => c.charCodeAt(0));
            const pinBytes = enc.map((b, i) => b ^ mask[i]);
            return new TextDecoder().decode(pinBytes);
        } catch (e) {
            console.warn('Biometric auth failed:', e);
            return null;
        }
    },

    async tryBiometricUnlock() {
        if (!this.biometricEnabled()) return false;
        const pin = await this._getBiometricPin();
        if (!pin) return false;
        return await this.unlock(pin);
    },

    disableBiometric() {
        localStorage.removeItem('finance_biometric_id');
        localStorage.removeItem('finance_biometric_enc');
        localStorage.removeItem('finance_biometric_mask');
    }
};

window.PinLock = PinLock;

// Auto-init on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    PinLock.init();
});
