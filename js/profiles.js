/**
 * ProfileManager — Multi-profile family support
 *
 * How it works:
 *  • Default profile (the original user) keeps all keys as-is: finance_*
 *  • Extra profiles store data under: fp_{id}_finance_*
 *  • When a non-default profile is active, localStorage.getItem/setItem/removeItem
 *    are transparently patched at startup so the rest of the app is unaware.
 *  • The family page reads from ALL prefixes via __rawLS to build a combined view.
 */

// ── Raw localStorage access (bypasses any patch) ──────────────
const __rawLS = {
    get:    k      => Object.getPrototypeOf(localStorage).getItem.call(localStorage, k),
    set:    (k, v) => Object.getPrototypeOf(localStorage).setItem.call(localStorage, k, v),
    remove: k      => Object.getPrototypeOf(localStorage).removeItem.call(localStorage, k),
    keys:   ()     => Object.keys(localStorage),
};
window.__rawLS = __rawLS;

// ── Keys shared across all profiles (never prefixed) ──────────
const _SHARED = new Set([
    'finance_profiles', 'finance_active_profile',
    'finance_settings', 'finance_pin_hash', 'finance_pin_salt',
    'finance_lock_timeout', 'finance_last_update',
    'finance_dashboard_widgets', 'finance_health_score_history',
    'finance_networth_history', 'finance_calendar_events',
    'finance_summary_schedule',
]);

// ── Compute active prefix & patch localStorage ─────────────────
const _activeId  = __rawLS.get('finance_active_profile') || '';
const _pfx       = _activeId ? `fp_${_activeId}_` : '';
window.__profilePrefix = _pfx;

if (_pfx) {
    // Only need to patch when a non-default profile is active
    const _og = {
        get:    localStorage.getItem.bind(localStorage),
        set:    localStorage.setItem.bind(localStorage),
        remove: localStorage.removeItem.bind(localStorage),
    };
    const _wrap = k => (_SHARED.has(k) || k.startsWith('fp_')) ? k : _pfx + k;

    localStorage.getItem    = k      => _og.get(_wrap(k));
    localStorage.setItem    = (k, v) => _og.set(_wrap(k), v);
    localStorage.removeItem = k      => _og.remove(_wrap(k));
}

// ── ProfileManager ─────────────────────────────────────────────
const ProfileManager = {

    // ── Storage helpers ───────────────────────────────────────
    getProfiles() {
        try { return JSON.parse(__rawLS.get('finance_profiles')) || []; }
        catch { return []; }
    },
    saveProfiles(arr) { __rawLS.set('finance_profiles', JSON.stringify(arr)); },

    getActiveId()   { return __rawLS.get('finance_active_profile') || ''; },

    getAllMembers() {
        return [
            { id: '', name: 'אני', emoji: '👤', color: '#10b981', type: 'adult', isDefault: true },
            ...this.getProfiles(),
        ];
    },

    getActiveMember() {
        const id = this.getActiveId();
        return this.getAllMembers().find(m => m.id === id) ||
               { id: '', name: 'אני', emoji: '👤', color: '#10b981', type: 'adult' };
    },

    // ── Switch profile ────────────────────────────────────────
    switchTo(id) {
        __rawLS.set('finance_active_profile', id);
        // Clear Storage cache so next reads go to localStorage (now patched)
        if (typeof Storage !== 'undefined' && Storage._cache) {
            Storage._cache = Object.create(null);
        }
        window.location.reload();
    },

    // ── CRUD ──────────────────────────────────────────────────
    createMember({ name, emoji, color, type }) {
        const id = 'm' + Date.now();
        const profiles = this.getProfiles();
        profiles.push({ id, name, emoji, color: color || '#8b5cf6', type: type || 'adult' });
        this.saveProfiles(profiles);
        return id;
    },

    updateMember(id, updates) {
        const profiles = this.getProfiles().map(p => p.id === id ? { ...p, ...updates } : p);
        this.saveProfiles(profiles);
    },

    deleteMember(id) {
        if (!id) return; // can't delete default
        // Remove all profile data
        const pfx = `fp_${id}_`;
        __rawLS.keys().filter(k => k.startsWith(pfx)).forEach(k => __rawLS.remove(k));
        this.saveProfiles(this.getProfiles().filter(p => p.id !== id));
        // If deleted profile was active, switch to default
        if (this.getActiveId() === id) this.switchTo('');
    },

    // ── Read data for any profile (for family page) ───────────
    readProfileData(memberId) {
        const pfx = memberId ? `fp_${memberId}_` : '';
        const raw = k => {
            try { return JSON.parse(__rawLS.get(pfx + k)); } catch { return null; }
        };

        const bank        = raw('finance_bank_accounts') || [];
        const stocks      = raw('finance_stocks') || { holdings: [] };
        const myFunds     = raw('finance_my_funds') || [];
        const assets      = raw('finance_assets') || [];
        const loans       = raw('finance_loans') || [];
        const goals       = raw('finance_goals') || [];
        const credit      = raw('finance_credit_cards') || { expenses: [] };
        const subs        = raw('finance_subscriptions') || [];

        const bankTotal   = bank.reduce((s, a) => s + (a.balance || 0), 0);
        const stocksTotal = (stocks.holdings || []).reduce(
            (s, h) => s + ((h.currentPrice || h.avgPrice || 0) * (h.quantity || 0)), 0);
        const fundsTotal  = myFunds.reduce((s, f) => s + (f.value || f.currentValue || 0), 0);
        const assetsTotal = assets.reduce((s, a) => s + (a.estimatedValue || 0), 0);
        const loansTotal  = loans.reduce((s, l) => s + (l.remainingBalance || 0), 0);
        const netWorth    = bankTotal + stocksTotal + fundsTotal + assetsTotal - loansTotal;

        const now = new Date();
        const mon = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
        const monthExpenses = (credit.expenses || [])
            .filter(e => (e.date || '').startsWith(mon))
            .reduce((s, e) => s + (e.amount || 0), 0);

        return { bankTotal, stocksTotal, fundsTotal, assetsTotal, loansTotal,
                 netWorth, goals, myFunds, loans, subs, monthExpenses };
    },

    // ── Sidebar UI ────────────────────────────────────────────
    renderSidebar() {
        const members  = this.getAllMembers();
        const active   = this.getActiveMember();
        const isPages  = window.location.pathname.includes('/pages/');
        const base     = isPages ? '../' : '';
        // XSS-safe HTML escape for member names/emojis/ids (user-controlled)
        const esc = s => (s == null ? '' : String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])));

        // Inject CSS
        if (!document.getElementById('ps-style')) {
            const s = document.createElement('style');
            s.id = 'ps-style';
            s.textContent = `
                .ps-wrap { position: relative; margin-bottom: 12px; }
                .ps-btn {
                    display: flex; align-items: center; gap: 8px;
                    width: 100%; padding: 9px 12px;
                    background: rgba(255,255,255,0.06);
                    border: 1px solid var(--color-border);
                    border-radius: 10px; cursor: pointer;
                    color: var(--color-text-primary);
                    font-size: 0.85rem; font-weight: 500;
                    transition: border-color 0.2s;
                }
                .ps-btn:hover { border-color: rgba(255,255,255,0.25); }
                .ps-emoji { font-size: 1.1rem; flex-shrink: 0; }
                .ps-name  { flex: 1; text-align: right; }
                .ps-arrow { font-size: 0.65rem; color: var(--color-text-secondary); transition: transform 0.2s; }
                .ps-arrow.open { transform: rotate(180deg); }
                .ps-dropdown {
                    display: none; position: absolute; top: calc(100% + 4px);
                    right: 0; left: 0;
                    background: var(--color-bg-secondary);
                    border: 1px solid var(--color-border);
                    border-radius: 12px; z-index: 200;
                    overflow: hidden;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
                }
                .ps-dropdown.open { display: block; }
                .ps-item {
                    display: flex; align-items: center; gap: 10px;
                    padding: 10px 14px; cursor: pointer;
                    font-size: 0.84rem;
                    border-bottom: 1px solid var(--color-border);
                    transition: background 0.15s;
                }
                .ps-item:last-child { border-bottom: none; }
                .ps-item:hover { background: rgba(255,255,255,0.05); }
                .ps-item.active { background: rgba(16,185,129,0.08); }
                .ps-item-name { flex: 1; font-weight: 500; }
                .ps-item-type { font-size: 0.7rem; color: var(--color-text-secondary); }
                .ps-check { color: #10b981; font-size: 0.9rem; }
                .ps-add {
                    display: flex; align-items: center; gap: 8px;
                    padding: 10px 14px; cursor: pointer;
                    font-size: 0.82rem; color: var(--color-text-secondary);
                    transition: color 0.15s;
                }
                .ps-add:hover { color: var(--color-text-primary); }
                .ps-family-link {
                    display: flex; align-items: center; gap: 8px;
                    padding: 8px 14px;
                    border-top: 1px solid var(--color-border);
                    font-size: 0.78rem; color: #8b5cf6;
                    text-decoration: none;
                    background: rgba(139,92,246,0.06);
                }
                .ps-family-link:hover { background: rgba(139,92,246,0.12); }
            `;
            document.head.appendChild(s);
        }

        const typeLabel = t => t === 'child' ? 'ילד/ה' : 'מבוגר';
        const activeId  = this.getActiveId();

        const html = `
            <div class="ps-wrap" id="psSwitcherWrap">
                <button class="ps-btn" onclick="ProfileManager.toggleDropdown()">
                    <span class="ps-emoji">${esc(active.emoji)}</span>
                    <span class="ps-name">${esc(active.name)}</span>
                    <span class="ps-arrow" id="psArrow">▾</span>
                </button>
                <div class="ps-dropdown" id="psDropdown">
                    ${members.map(m => `
                        <div class="ps-item ${m.id === activeId ? 'active' : ''}"
                             onclick="ProfileManager.switchTo('${esc(m.id)}')">
                            <span style="font-size:1.1rem">${esc(m.emoji)}</span>
                            <div style="flex:1">
                                <div class="ps-item-name">${esc(m.name)}</div>
                                <div class="ps-item-type">${typeLabel(m.type)}</div>
                            </div>
                            ${m.id === activeId ? '<span class="ps-check">✓</span>' : ''}
                        </div>
                    `).join('')}
                    <div class="ps-add" onclick="ProfileManager.openAddModal()">
                        <span>➕</span><span>הוסף בן משפחה</span>
                    </div>
                    <a href="${base}pages/family.html" class="ps-family-link">
                        <span>👨‍👩‍👧‍👦</span><span>דשבורד משפחתי</span>
                    </a>
                </div>
            </div>
        `;

        // Inject after sidebar-header
        const header = document.querySelector('.sidebar-header');
        if (header) {
            const div = document.createElement('div');
            div.innerHTML = html;
            header.insertAdjacentElement('afterend', div.firstElementChild);
        }

        // Close dropdown on outside click
        document.addEventListener('click', e => {
            if (!e.target.closest('#psSwitcherWrap')) this.closeDropdown();
        });

        // Inject add-member modal
        this._injectAddModal(base);
    },

    toggleDropdown() {
        const dd = document.getElementById('psDropdown');
        const ar = document.getElementById('psArrow');
        if (!dd) return;
        const open = dd.classList.toggle('open');
        ar && ar.classList.toggle('open', open);
    },

    closeDropdown() {
        const dd = document.getElementById('psDropdown');
        const ar = document.getElementById('psArrow');
        if (dd) dd.classList.remove('open');
        if (ar) ar.classList.remove('open');
    },

    // ── Add member modal ──────────────────────────────────────
    _injectAddModal(base) {
        if (document.getElementById('psAddModal')) return;
        const el = document.createElement('div');
        el.id = 'psAddModal';
        el.style.cssText = 'display:none;position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.65);align-items:center;justify-content:center;padding:20px;';
        el.innerHTML = `
            <div style="background:var(--color-bg-secondary);border-radius:20px;padding:26px;max-width:380px;width:100%;border:1px solid var(--color-border);">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;">
                    <h3 style="font-size:1.05rem;">👨‍👩‍👧‍👦 הוסף בן משפחה</h3>
                    <button onclick="ProfileManager.closeAddModal()" style="background:none;border:none;color:var(--color-text-secondary);font-size:1.5rem;cursor:pointer;">&times;</button>
                </div>
                <div style="margin-bottom:12px;">
                    <label style="display:block;font-size:0.82rem;color:var(--color-text-secondary);margin-bottom:5px;">שם</label>
                    <input id="pmName" type="text" placeholder="לדוגמה: שרה, נועה, עמית"
                        style="width:100%;padding:10px 13px;border:1px solid var(--color-border);border-radius:10px;background:var(--color-bg);color:var(--color-text-primary);font-size:0.92rem;box-sizing:border-box;">
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;">
                    <div>
                        <label style="display:block;font-size:0.82rem;color:var(--color-text-secondary);margin-bottom:5px;">אמוג'י</label>
                        <input id="pmEmoji" type="text" placeholder="👤" value="👤" maxlength="2"
                            style="width:100%;padding:10px 13px;border:1px solid var(--color-border);border-radius:10px;background:var(--color-bg);color:var(--color-text-primary);font-size:1.3rem;box-sizing:border-box;text-align:center;">
                    </div>
                    <div>
                        <label style="display:block;font-size:0.82rem;color:var(--color-text-secondary);margin-bottom:5px;">סוג</label>
                        <select id="pmType" style="width:100%;padding:10px 13px;border:1px solid var(--color-border);border-radius:10px;background:var(--color-bg);color:var(--color-text-primary);font-size:0.92rem;box-sizing:border-box;">
                            <option value="adult">👤 מבוגר</option>
                            <option value="child">👧 ילד/ה</option>
                        </select>
                    </div>
                </div>
                <div style="margin-bottom:18px;">
                    <label style="display:block;font-size:0.82rem;color:var(--color-text-secondary);margin-bottom:8px;">צבע</label>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;" id="pmColors">
                        ${['#10b981','#3b82f6','#8b5cf6','#f59e0b','#ef4444','#06b6d4','#ec4899','#f97316'].map(c =>
                            `<div onclick="ProfileManager._pickColor(this,'${c}')"
                                 style="width:28px;height:28px;border-radius:50%;background:${c};cursor:pointer;border:2px solid transparent;transition:border-color 0.15s;"
                                 data-color="${c}"></div>`
                        ).join('')}
                    </div>
                </div>
                <div style="display:flex;gap:10px;">
                    <button onclick="ProfileManager.closeAddModal()"
                        style="flex:1;padding:11px;background:var(--color-bg-card);border:1px solid var(--color-border);border-radius:10px;color:var(--color-text-primary);cursor:pointer;font-size:0.9rem;">
                        ביטול
                    </button>
                    <button onclick="ProfileManager.saveMember()"
                        style="flex:1;padding:11px;background:#10b981;border:none;border-radius:10px;color:white;font-weight:700;cursor:pointer;font-size:0.9rem;">
                        הוסף
                    </button>
                </div>
            </div>
        `;
        el.addEventListener('click', e => { if (e.target === el) this.closeAddModal(); });
        document.body.appendChild(el);
        this._selectedColor = '#10b981';
    },

    _selectedColor: '#10b981',

    _pickColor(el, color) {
        this._selectedColor = color;
        document.querySelectorAll('#pmColors > div').forEach(d => {
            d.style.borderColor = d.dataset.color === color ? 'white' : 'transparent';
        });
    },

    openAddModal() {
        this.closeDropdown();
        const m = document.getElementById('psAddModal');
        if (m) { m.style.display = 'flex'; }
    },

    closeAddModal() {
        const m = document.getElementById('psAddModal');
        if (m) m.style.display = 'none';
    },

    saveMember() {
        const name  = document.getElementById('pmName')?.value.trim();
        const emoji = document.getElementById('pmEmoji')?.value.trim() || '👤';
        const type  = document.getElementById('pmType')?.value || 'adult';
        if (!name) { alert('נא למלא שם'); return; }
        const id = this.createMember({ name, emoji, color: this._selectedColor, type });
        this.closeAddModal();
        this.switchTo(id);
    },
};

window.ProfileManager = ProfileManager;

// Auto-render sidebar on every page
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.sidebar-header')) {
        ProfileManager.renderSidebar();
    }
});
