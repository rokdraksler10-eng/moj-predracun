// Service Worker - Moj Predračun v2
// Omogoča offline uporabo aplikacije

const CACHE_NAME = 'moj-predracun-v2';
const STATIC_CACHE = 'static-v2';
const DYNAMIC_CACHE = 'dynamic-v2';

// Statične datoteke za cache (core app files)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/toast.js',
  '/calc-quote-simple.js',
  '/manifest.json',
  '/favicon.svg',
  '/assets/logo.svg',
  '/splash.html'
];

// PWA ikone (SVG - scalable in manjše)
const ICONS = [
  '/icon-72.svg',
  '/icon-96.svg',
  '/icon-128.svg',
  '/icon-144.svg',
  '/icon-152.svg',
  '/icon-192.svg',
  '/icon-384.svg',
  '/icon-512.svg'
];

// External CDN resources
const EXTERNAL_ASSETS = [
  'https://cdn.jsdelivr.net/npm/alpinejs@3.13.3/dist/cdn.min.js',
  'https://unpkg.com/feather-icons',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

// ============================================
// INSTALL - Cache core assets
// ============================================
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets...');
        return cache.addAll([...STATIC_ASSETS, ...ICONS]);
      })
      .then(() => {
        // Try to cache external assets (may fail due to CORS)
        return caches.open(DYNAMIC_CACHE)
          .then((cache) => {
            return Promise.allSettled(
              EXTERNAL_ASSETS.map((url) => 
                fetch(url, { mode: 'no-cors' })
                  .then((response) => cache.put(url, response))
                  .catch((err) => console.log('[SW] External cache skip:', url))
              )
            );
          });
      })
      .then(() => {
        console.log('[SW] Install complete');
        return self.skipWaiting();
      })
      .catch((err) => console.error('[SW] Install failed:', err))
  );
});

// ============================================
// ACTIVATE - Clean old caches
// ============================================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              // Keep only current caches
              return name !== STATIC_CACHE && name !== DYNAMIC_CACHE;
            })
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Activation complete');
        return self.clients.claim();
      })
  );
});

// ============================================
// FETCH - Serve from cache, fallback to network
// ============================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Strategy 1: API calls - Network first, cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleAPIRequest(request));
    return;
  }
  
  // Strategy 2: Static assets - Cache first, network fallback
  event.respondWith(handleStaticRequest(request));
});

// Handle API requests (Network First)
async function handleAPIRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache successful GET responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed - try cache
    console.log('[SW] API offline - serving from cache:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // No cache - return offline response
    return new Response(
      JSON.stringify({ 
        error: 'Offline', 
        message: 'Brez internetne povezave. Podatki bodo sinhronizirani kasneje.'
      }),
      { 
        status: 503, 
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle static requests (Cache First)
async function handleStaticRequest(request) {
  // Try cache first
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Return cached version immediately
    // But also update cache in background
    fetchAndCache(request);
    return cachedResponse;
  }
  
  // Not in cache - fetch from network
  try {
    return await fetchAndCache(request);
  } catch (error) {
    console.log('[SW] Network failed for:', request.url);
    
    // If it's a page request, return offline page
    if (request.mode === 'navigate') {
      return caches.match('/splash.html');
    }
    
    throw error;
  }
}

// Fetch and cache helper
async function fetchAndCache(request) {
  const response = await fetch(request);
  
  // Cache successful responses
  if (response.ok && response.type !== 'opaque') {
    const cache = await caches.open(DYNAMIC_CACHE);
    cache.put(request, response.clone());
  }
  
  return response;
}

// ============================================
// BACKGROUND SYNC - Queue actions when offline
// ============================================
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-quotes') {
    console.log('[SW] Background sync triggered');
    event.waitUntil(syncQuotes());
  }
});

async function syncQuotes() {
  // This will be called when connection returns
  // The app will handle actual sync via IndexedDB
  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({
      type: 'SYNC_REQUIRED',
      message: 'Povezava vzpostavljena. Sinhroniziram podatke...'
    });
  });
}

// ============================================
// PUSH NOTIFICATIONS (for future use)
// ============================================
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png'
      })
    );
  }
});

// ============================================
// MESSAGE HANDLER - Communication with app
// ============================================
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'CHECK_ONLINE') {
    event.ports[0].postMessage({ online: navigator.onLine });
  }
});

console.log('[SW] Service Worker loaded');
