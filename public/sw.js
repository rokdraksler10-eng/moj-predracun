const CACHE_NAME = 'gradbeni-app-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json',
  'https://cdn.jsdelivr.net/npm/alpinejs@3.13.3/dist/cdn.min.js',
  'https://unpkg.com/feather-icons'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    }).catch(err => {
      console.log('[ServiceWorker] Cache failed:', err);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip API requests - always go to network
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // If network fails, return offline message for API calls
        return new Response(
          JSON.stringify({ error: 'Nimate povezave. Podatki se bodo sinhronizirali ko boste spet online.' }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      })
    );
    return;
  }
  
  // For static assets, try cache first
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }
      
      return fetch(event.request).then((response) => {
        // Don't cache if not valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        // Clone and cache the response
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        
        return response;
      });
    }).catch(() => {
      // If both cache and network fail, show offline page
      if (event.request.destination === 'document') {
        return caches.match('/index.html');
      }
    })
  );
});

// Background sync for offline quote creation
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-quotes') {
    event.waitUntil(syncQuotes());
  }
});

async function syncQuotes() {
  // This would sync pending quotes when back online
  console.log('[ServiceWorker] Syncing quotes...');
}