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
            en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        };

        const monthName = monthNames[lang][parseInt(month) - 1];

        const messages = {
            igemel: {
                he: `נתוני iGemel-Net עודכנו ל${monthName} ${year}`,
                en: `iGemel-Net data updated for ${monthName} ${year}`
            },
            themarket: {
                he: `נתוני TheMarker עודכנו ל${monthName} ${year}`,
                en: `TheMarker data updated for ${monthName} ${year}`
            }
        };

        return messages[type]?.[lang] || messages[type]?.he;
    },

    /**
     * Show update notification banner
     */
    showUpdateNotification(updates) {
        const lang = I18n?.currentLanguage || 'he';
        const isHebrew = lang === 'he';

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
                    bottom: 20px;
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
            banner.style.animation = 'slideUp 0.3s ease reverse';
            setTimeout(() => banner.remove(), 300);
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
