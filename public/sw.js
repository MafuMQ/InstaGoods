// Service Worker for InstaGoods Performance Optimization
const CACHE_VERSION = 'v4';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;

// Precache manifest - update this when deploying new versions
// Vite uses content-hashed filenames, so we cache dynamically
const STATIC_FILES = [
  '/',
  '/index.html'
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker: Static files cached');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete all caches that don't match current version
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle same-origin requests only
  if (url.origin !== location.origin) {
    // For cross-origin (like CDN), try network first
    event.respondWith(networkFirst(request));
    return;
  }

  // For navigation requests (HTML pages), use network first
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  // For static assets, use network-only for JS/CSS to prevent stale cache issues
  // For images and other assets, use network first with cache fallback
  if (isStaticAsset(request.url)) {
    // Never cache JS and CSS - always get fresh from network
    if (isJsOrCss(request.url)) {
      event.respondWith(networkOnly(request));
      return;
    }
    // For images and other assets, try network first
    event.respondWith(networkFirst(request));
    return;
  }

  // Default: network first
  event.respondWith(networkFirst(request));
});

// Check if request is for a static asset
function isStaticAsset(url) {
  return url.includes('/assets/') || 
         url.includes('.js') || 
         url.includes('.css') ||
         url.includes('.png') ||
         url.includes('.jpg') ||
         url.includes('.jpeg') ||
         url.includes('.webp') ||
         url.includes('.svg');
}

// Check if request is for JS or CSS (should never be cached)
function isJsOrCss(url) {
  return url.includes('.js') || url.includes('.css');
}

// Network only - always fetch from network, never use cache
async function networkOnly(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network failed for:', request.url);
    return new Response('Network error', { status: 503, statusText: 'Service Unavailable' });
  }
}

// Network first strategy - try network, fallback to cache
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Only cache successful responses
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      
      // Clone the response before caching
      const responseToCache = networkResponse.clone();
      
      // Don't cache non-basic responses (cross-origin)
      if (responseToCache.type === 'basic' || responseToCache.type === 'cors') {
        console.log('Service Worker: Caching new resource:', request.url);
        cache.put(request, responseToCache);
      }
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network failed, falling back to cache for:', request.url);
    
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If no cache and offline, return offline page for navigation
    if (request.mode === 'navigate') {
      return caches.match('/index.html');
    }
    
    // Return a basic error response for other requests
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

// Listen for messages from the main app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('Service Worker: Skip waiting triggered');
    self.skipWaiting();
  }
  
  // Force update - clear all caches and reload
  if (event.data && event.data.type === 'FORCE_UPDATE') {
    console.log('Service Worker: Force update triggered');
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('Service Worker: Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      self.clients.claim();
      self.skipWaiting();
    });
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Background sync triggered');
    // Implement background sync logic here
  }
});
