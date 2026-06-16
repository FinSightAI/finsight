/**
 * wize-track.js — first-party funnel / activation event logging.
 *
 * Privacy-first by design: NO third-party analytics, NO PII. Events are written
 * to the Firestore `events` collection (App Check enforced, admin-only reads).
 * This is the missing "funnel" layer on top of Cloudflare's pageview analytics
 * — it answers: of N visitors, how many sign up, open a tool, reach the "aha"
 * action, and return.
 *
 * Requires the Firebase compat SDK (firebase.firestore / firebase.auth) already
 * loaded on the page — same setup as wizelife-auth.js.
 *
 * Usage (drop-in, after firebase + config are loaded):
 *   <script src="https://wizelife.ai/js/wize-track.js"></script>
 *   WizeTrack.init('wizemoney');                 // app id + logs a page_view
 *   WizeTrack.track('tool_open', { tool: 'stocks' });
 *   WizeTrack.signup();                          // after successful signup
 *   WizeTrack.activation({ action: 'ran_comparison' });   // the "aha" moment
 *
 * Analyze the results at:  https://wizelife.ai/funnel.html  (admin only)
 */
(function () {
  'use strict';

  var APP = 'wizelife';
  var ANON_KEY = 'wl_anon';
  var SESSION_KEY = 'wl_session';

  function rid() {
    try {
      if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    } catch (e) { /* fall through */ }
    return 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  }

  // Stable anonymous id (no PII) — lets us follow a visitor from landing →
  // signup without knowing who they are.
  function anonId() {
    try {
      var v = localStorage.getItem(ANON_KEY);
      if (!v) { v = rid(); localStorage.setItem(ANON_KEY, v); }
      return v;
    } catch (e) { return 'nols'; }
  }

  // Per-tab session id — resets when the tab/session ends.
  function sessionId() {
    try {
      var v = sessionStorage.getItem(SESSION_KEY);
      if (!v) { v = rid(); sessionStorage.setItem(SESSION_KEY, v); }
      return v;
    } catch (e) { return 'noss'; }
  }

  // Resolve a Firestore instance. Firestore is lazy-loaded on WizeMoney pages via
  // window._wlLazy.firestore() (keeps ~600KB off the critical path), so we must
  // await it before writing — otherwise firebase.firestore is undefined and every
  // event is silently dropped.
  function db() {
    try {
      if (window._wlLazy && typeof window._wlLazy.firestore === 'function') {
        return Promise.resolve(window._wlLazy.firestore()).catch(function () { return null; });
      }
      return Promise.resolve((window.firebase && firebase.firestore) ? firebase.firestore() : null);
    } catch (e) { return Promise.resolve(null); }
  }

  function currentUid() {
    try { var u = firebase.auth().currentUser; return u ? u.uid : null; }
    catch (e) { return null; }
  }

  function today() {
    // Local date as YYYY-MM-DD — lexicographically sortable, good for range
    // queries + per-day grouping in the dashboard.
    var d = new Date();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + day;
  }

  // Only allow short scalar meta — never free-text / PII. Caps keys + lengths.
  function sanitizeMeta(m) {
    var out = {};
    if (!m || typeof m !== 'object') return out;
    Object.keys(m).slice(0, 8).forEach(function (k) {
      var v = m[k];
      if (typeof v === 'string') v = v.slice(0, 60);
      if (v === null || ['string', 'number', 'boolean'].indexOf(typeof v) >= 0) {
        out[String(k).slice(0, 30)] = v;
      }
    });
    return out;
  }

  var WizeTrack = {
    /** Set the app id and log the initial page_view. Call once per page. */
    init: function (appId) {
      if (appId) APP = String(appId).slice(0, 24);
      this.track('page_view');
      return this;
    },

    /** Log any funnel event. Fire-and-forget; never throws, never blocks UI.
     *  Awaits the lazy-loaded Firestore before writing. */
    track: function (event, meta) {
      if (!event) return Promise.resolve();
      // CONSENT GATE (GDPR/ePrivacy): the persistent wl_anon id + funnel events
      // are non-essential analytics — only fire after explicit consent
      // (wize-consent.js sets wl_consent='all'). Read the flag directly so this
      // works regardless of consent-script load order; default = no tracking.
      try { if (localStorage.getItem('wl_consent') !== 'all') return Promise.resolve(); } catch (e) { return Promise.resolve(); }
      return Promise.resolve(db()).then(function (d) {
        if (!d) return;
        try {
          var doc = {
            app: APP,
            event: String(event).slice(0, 40),
            uid: currentUid(),
            anonId: anonId(),
            sessionId: sessionId(),
            ts: firebase.firestore.FieldValue.serverTimestamp(),
            day: today(),
            lang: (function () { try { return localStorage.getItem('wl_lang') || 'he'; } catch (e) { return 'he'; } })(),
            path: (location.pathname || '').slice(0, 120),
            meta: sanitizeMeta(meta)
          };
          return d.collection('events').add(doc).catch(function () { /* never surface */ });
        } catch (e) { /* never surface */ }
      }).catch(function () { /* never surface */ });
    },

    /** Convenience: account created. */
    signup: function (meta) { return this.track('signup', meta); },
    /** Convenience: returning sign-in. */
    login: function (meta) { return this.track('login', meta); },
    /** Convenience: a tool/feature was opened. */
    toolOpen: function (meta) { return this.track('tool_open', meta); },
    /** Convenience: the "aha" — user completed a meaningful, value-delivering action.
     *  Fires AT MOST ONCE per browser (guarded by the wl_act_<app> flag) so we
     *  don't double-count activation across page loads. */
    activation: function (meta) {
      try {
        var flag = 'wl_act_' + APP;
        if (localStorage.getItem(flag)) return Promise.resolve();
        localStorage.setItem(flag, '1');
      } catch (e) { /* storage blocked — fall through and fire */ }
      return this.track('activation', meta);
    }
  };

  window.WizeTrack = WizeTrack;
})();
