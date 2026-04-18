const CACHE_NAME = 'finsight-v166';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './img/logo.png',
    './css/app.css',
    './js/app.js',
    './js/idb.js',
    './js/storage.js',
    './js/pin-lock.js',
    './js/i18n.js',
    './js/charts.js',
    './js/csv-import.js',
    './js/smart-import.js',
    './js/alerts.js',
    './js/goals.js',
    './js/reports.js',
    './js/tags.js',
    './js/stock-api.js',
    './js/stock-alerts.js',
    './js/notifications.js',
    './js/export.js',
    './js/widgets.js',
    './js/smart-tips.js',
    './js/currency.js',
    './js/data-updates.js',
    './js/image-import.js',
    './js/firebase-config.js',
    './js/crypto.js',
    './js/auth.js',
    './js/plan.js',
    './js/paywall.js',
    './js/summary-sender.js',
    './pages/bank.html',
    './pages/credit.html',
    './pages/income.html',
    './pages/stocks.html',
    './pages/stock-analytics.html',
    './pages/tax-optimizer.html',
    './pages/training.html',
    './pages/pension.html',
    './pages/gemel.html',
    './pages/funds-update.html',
    './pages/market-update.html',
    './pages/mygemel.html',
    './pages/mygemel-training.html',
    './pages/mygemel-pension.html',
    './pages/mygemel-gemel.html',
    './data/mygemel-funds.js',
    './pages/assets.html',
    './pages/goals.html',
    './pages/my-funds.html',
    './pages/ai-chat.html',
    './pages/ai-story.html',
    './pages/pension-optimizer.html',
    './pages/pension-calc.html',
    './pages/reports.html',
    './pages/settings.html',
    './pages/profile.html',
    './pages/loans.html',
    './pages/subscriptions.html',
    './pages/compare-funds.html',
    './pages/calendar.html',
    './pages/simulator.html',
    './pages/family.html',
    './js/sidebar.js',
    './js/profiles.js',
    './pages/market-products.html',
    './data/sample-data.js',
    './data/market-funds.js',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching app assets');
                // Cache each asset individually so one failure doesn't block everything
                return Promise.all(
                    ASSETS_TO_CACHE.map(url =>
                        cache.add(url).catch(err => console.warn('Failed to cache:', url, err))
                    )
                );
            })
    );
    self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Notification click — open/focus the app
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const targetUrl = event.notification.data?.url || '/';
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
            // Focus existing tab if open
            const existing = clients.find(c => c.url.includes(self.location.origin));
            if (existing) return existing.focus();
            // Otherwise open new tab
            return self.clients.openWindow(targetUrl);
        })
    );
});

// Fetch event - network-first for HTML, cache-first for assets
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    const isHTML = url.pathname.endsWith('.html') || url.pathname.endsWith('/') || url.pathname === '';

    if (isHTML) {
        // Always fetch HTML fresh from network, fall back to cache when offline
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    if (response && response.status === 200) {
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
                    }
                    return response;
                })
                .catch(() => caches.match(event.request) || caches.match('./index.html'))
        );
    } else {
        // Stale-while-revalidate for JS/CSS/images: serve cache instantly, update in background
        event.respondWith(
            caches.open(CACHE_NAME).then((cache) => {
                return cache.match(event.request).then((cached) => {
                    const networkFetch = fetch(event.request).then((response) => {
                        if (response && response.status === 200 && response.type === 'basic') {
                            cache.put(event.request, response.clone());
                        }
                        return response;
                    }).catch(() => null);
                    return cached || networkFetch;
                });
            }).catch(() => caches.match('./index.html'))
        );
    }
});
