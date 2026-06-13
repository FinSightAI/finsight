/**
 * Data Updates Module - Checks for new data versions and notifies users
 */
const DataUpdates = {
    STORAGE_KEY: 'finance_data_version',
    CHECK_INTERVAL: 24 * 60 * 60 * 1000, // Check once a day

    // Current data versions (update these when publishing new data)
    versions: {
        igemel: '2026-05',
        themarket: '2026-05',
        app: '1.0.0'
    },

    /**
     * Initialize update checker
     */
    init() {
        this.checkForUpdates();

        // Check periodically
        setInterval(() => this.checkForUpdates(), this.CHECK_INTERVAL);

        // The banner's message spans have no data-i18n attribute, so I18n's
        // translatePage() doesn't touch them — re-render it ourselves when the
        // user switches language (covers both the in-app switcher, which sets
        // <html lang>, and the shared WizeBar pills, which fire wl-lang-change).
        const onLangChange = () => this.rerenderBanner();
        window.addEventListener('wl-lang-change', onLangChange);
        try {
            new MutationObserver(onLangChange).observe(document.documentElement, {
                attributes: true, attributeFilter: ['lang', 'dir']
            });
        } catch (e) {}
    },

    /**
     * Re-render the update banner in the current language. No-op if the banner
     * isn't currently visible (e.g. dismissed), so it never re-pops itself.
     */
    rerenderBanner() {
        if (!document.getElementById('dataUpdateBanner')) return;
        if (!this._activeUpdates || !this._activeUpdates.length) return;
        const fresh = this._activeUpdates.map(u => ({ ...u, message: this.formatUpdateMessage(u.type) }));
        this.showUpdateNotification(fresh);
    },

    /**
     * Get saved version info
     */
    getSavedVersions() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
        } catch (e) {
            return {};
        }
    },

    /**
     * Save version info
     */
    saveVersions(versions) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
                ...versions,
                lastCheck: new Date().toISOString()
            }));
        } catch (e) {
            console.error('Error saving version info:', e);
        }
    },

    /**
     * Check for updates
     */
    checkForUpdates() {
        const saved = this.getSavedVersions();
        const updates = [];

        // Check iGemel data
        if (saved.igemel !== this.versions.igemel) {
            updates.push({
                type: 'igemel',
                message: this.formatUpdateMessage('igemel'),
                version: this.versions.igemel
            });
        }

        // Check TheMarker data
        if (saved.themarket !== this.versions.themarket) {
            updates.push({
                type: 'themarket',
                message: this.formatUpdateMessage('themarket'),
                version: this.versions.themarket
            });
        }

        // Show notifications for updates
        if (updates.length > 0) {
            this.showUpdateNotification(updates);
        }
    },

    /**
     * Format update message
     */
    formatUpdateMessage(type) {
        const lang = I18n?.currentLanguage || 'he';
        const version = this.versions[type];
        const [year, month] = version.split('-');

        const monthNames = {
            he: ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'],
            en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            pt: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
            es: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
        };

        const monthName = (monthNames[lang] || monthNames.en)[parseInt(month) - 1];

        const messages = {
            igemel: {
                he: `נתוני iGemel-Net עודכנו ל${monthName} ${year}`,
                en: `iGemel-Net data updated for ${monthName} ${year}`,
                pt: `Dados do iGemel-Net atualizados para ${monthName} de ${year}`,
                es: `Datos de iGemel-Net actualizados para ${monthName} de ${year}`
            },
            themarket: {
                he: `נתוני TheMarker עודכנו ל${monthName} ${year}`,
                en: `TheMarker data updated for ${monthName} ${year}`,
                pt: `Dados do TheMarker atualizados para ${monthName} de ${year}`,
                es: `Datos de TheMarker actualizados para ${monthName} de ${year}`
            }
        };

        return messages[type]?.[lang] || messages[type]?.en;
    },

    /**
     * Show update notification banner
     */
    showUpdateNotification(updates) {
        const lang = I18n?.currentLanguage || 'he';
        const isHebrew = lang === 'he';

        // Keep the update list (with their types) so we can re-render in another
        // language without losing track of what's shown.
        this._activeUpdates = updates;

        // Remove existing banner if any
        const existingBanner = document.getElementById('dataUpdateBanner');
        if (existingBanner) existingBanner.remove();

        const banner = document.createElement('div');
        banner.id = 'dataUpdateBanner';
        banner.className = 'data-update-banner';
        banner.innerHTML = `
            <div class="update-content">
                <span class="update-icon">🔄</span>
                <div class="update-messages">
                    ${updates.map(u => `<span>${u.message}</span>`).join('')}
                </div>
                <button class="update-dismiss" onclick="DataUpdates.dismissUpdate()">
                    ${isHebrew ? 'הבנתי' : 'Got it'}
                </button>
            </div>
        `;

        // Add styles
        if (!document.getElementById('data-update-styles')) {
            const style = document.createElement('style');
            style.id = 'data-update-styles';
            style.textContent = `
                .data-update-banner {
                    position: fixed;
                    bottom: calc(76px + env(safe-area-inset-bottom));
                    left: 50%;
                    transform: translateX(-50%);
                    background: linear-gradient(135deg, #10b981, #059669);
                    color: white;
                    padding: 15px 25px;
                    border-radius: 12px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                    z-index: 10000;
                    animation: slideUp 0.3s ease;
                    max-width: 90%;
                }
                @keyframes slideUp {
                    from { transform: translateX(-50%) translateY(100px); opacity: 0; }
                    to { transform: translateX(-50%) translateY(0); opacity: 1; }
                }
                /* Desktop: tuck into a corner instead of dead-center, where the
                   centered pill floated on top of the asset-card grid (looked like
                   it was covering the user's data). Bottom-end corner is the
                   conventional toast slot; flip to the start side for RTL. */
                @media (min-width: 769px) {
                    .data-update-banner {
                        left: auto; right: 24px; bottom: 24px;
                        transform: none; max-width: 380px;
                        animation: slideUpCorner 0.3s ease;
                    }
                    [dir="rtl"] .data-update-banner { right: auto; left: 24px; }
                }
                @keyframes slideUpCorner {
                    from { transform: translateY(100px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .update-content {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    flex-wrap: wrap;
                    justify-content: center;
                }
                .update-icon {
                    font-size: 1.5rem;
                }
                .update-messages {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }
                .update-dismiss {
                    background: rgba(255, 255, 255, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    color: white;
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 500;
                    transition: background 0.2s;
                }
                .update-dismiss:hover {
                    background: rgba(255, 255, 255, 0.3);
                }
                /* Compact pill on mobile — the desktop card was occupying ~90%
                   of viewport width because it stacked verbose 'TheMarker /
                   Gemel-Net updated for {month} {year}' lines vertically. */
                @media (max-width: 768px) {
                    .data-update-banner {
                        max-width: calc(100vw - 32px);
                        padding: 8px 12px;
                        border-radius: 10px;
                        font-size: 12px;
                        line-height: 1.35;
                    }
                    .update-content { gap: 8px; flex-wrap: nowrap; }
                    .update-icon { font-size: 14px; flex-shrink: 0; }
                    .update-messages { gap: 2px; font-size: 11px; min-width: 0; flex: 1; }
                    .update-messages span {
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                    .update-dismiss {
                        padding: 5px 10px;
                        font-size: 11px;
                        font-weight: 600;
                        border-radius: 6px;
                        flex-shrink: 0;
                    }
                }
                /* When the free-tier pricing pill (sets html[data-wl-pill]) shares
                   the bottom band on mobile/tablet, lift the toast above it so it
                   doesn't cover the pill's "See plans →" CTA. Desktop (>=769px)
                   already corners the toast, so no overlap there. */
                @media (max-width: 768px) {
                    html[data-wl-pill] .data-update-banner {
                        bottom: calc(76px + 56px + 12px + env(safe-area-inset-bottom)) !important;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(banner);
    },

    /**
     * Dismiss update notification and save current versions
     */
    dismissUpdate() {
        const banner = document.getElementById('dataUpdateBanner');
        if (banner) {
            // Fade out (layout-agnostic) — the old reverse-slideUp used a
            // translateX(-50%) keyframe that jumped the corner-anchored desktop
            // toast sideways on exit.
            banner.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
            banner.style.opacity = '0';
            banner.style.transform += ' translateY(12px)';
            setTimeout(() => banner.remove(), 260);
        }

        // Save current versions so we don't show again
        this.saveVersions(this.versions);
    },

    /**
     * Force show update notification (for testing)
     */
    forceShowUpdate() {
        localStorage.removeItem(this.STORAGE_KEY);
        this.checkForUpdates();
    }
};

// Make available globally
window.DataUpdates = DataUpdates;

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    DataUpdates.init();
});
