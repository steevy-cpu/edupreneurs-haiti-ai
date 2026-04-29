// Service Worker for Push Notifications and Asset Caching - Optimized for 3G
// Phase 9: Enhanced "Load Once" Behavior
const SW_VERSION = '2.0.0';
const CACHE_NAME = `edupreneurs-v${SW_VERSION}`;
const STATIC_CACHE_NAME = `edupreneurs-static-v${SW_VERSION}`;
const API_CACHE_NAME = `edupreneurs-api-v${SW_VERSION}`;
const JS_CACHE_NAME = `edupreneurs-js-v${SW_VERSION}`;
const MAX_CACHE_ITEMS = 50;
// TTL constants for cache expiry — prevents serving stale assets on slow connections
const MAX_IMAGE_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days for images
const MAX_JS_AGE_MS = 7 * 24 * 60 * 60 * 1000;     // 7 days for JS/CSS (Vite content-hashed)
const MAX_API_CACHE_ITEMS = 100;

// Supabase host for API caching
const SUPABASE_HOST = 'xdyavylcmucjpueybdku.supabase.co';

// Critical assets to precache for offline/slow network support
const PRECACHE_ASSETS = [
  '/logo.png',
  '/pwa-icon.jpeg',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/characters/eric-ai-helper.png',
  '/offline.html'
];

// API endpoints with their cache durations (in seconds)
const API_CACHE_CONFIG = {
  // Static/rarely changing data - long cache
  '/rest/v1/subjects': 3600, // 1 hour
  '/rest/v1/lessons': 3600, // 1 hour
  '/rest/v1/ebooks': 1800, // 30 minutes
  '/rest/v1/daily_words': 3600, // 1 hour
  
  // User data - medium cache
  '/rest/v1/profiles': 300, // 5 minutes
  '/rest/v1/quiz_battle_stats': 300, // 5 minutes
  '/rest/v1/chess_player_stats': 300, // 5 minutes
  '/rest/v1/lesson_completions': 300, // 5 minutes
  '/rest/v1/achievements': 300, // 5 minutes
  
  // Semi-dynamic - short cache
  '/rest/v1/posts': 120, // 2 minutes
  '/rest/v1/follows': 120, // 2 minutes
};

// Endpoints that should NEVER be cached (real-time critical)
const NO_CACHE_ENDPOINTS = [
  '/rest/v1/messages',
  '/rest/v1/notifications',
  '/rest/v1/conversation_participants',
  '/rest/v1/conversations',
  '/auth/',
  '/realtime/',
  '/functions/',
];

// BroadcastChannel for cross-tab sync
const notificationChannel = new BroadcastChannel('edupreneurs-notifications');

// Detect browser and OS
function detectEnvironment() {
  const ua = self.navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isSafari = ua.includes('Safari') && !ua.includes('Chrome');
  const isChrome = ua.includes('Chrome') && !ua.includes('Edg');
  const isEdge = ua.includes('Edg');
  const isSamsung = ua.includes('SamsungBrowser');
  
  return {
    isIOS,
    isSafari,
    isChrome,
    isEdge,
    isSamsung,
    browser: isSamsung ? 'Samsung' : isEdge ? 'Edge' : isChrome ? 'Chrome' : isSafari ? 'Safari' : 'Unknown'
  };
}

self.addEventListener('install', (event) => {
  const env = detectEnvironment();
  console.log(`📦 Service Worker ${SW_VERSION} installing...`);
  console.log(`🌐 Browser: ${env.browser}, iOS: ${env.isIOS}`);
  
  // Precache critical assets
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('📦 Precaching critical assets...');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log('✅ Critical assets cached');
        return self.skipWaiting();
      })
      .catch(err => {
        console.warn('⚠️ Precaching failed:', err);
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log(`✅ Service Worker ${SW_VERSION} activated`);
  
  // Clean up old caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name.startsWith('edupreneurs-') && 
            name !== CACHE_NAME && 
            name !== STATIC_CACHE_NAME && 
            name !== API_CACHE_NAME &&
            name !== JS_CACHE_NAME)
          .map(name => {
            console.log(`🗑️ Deleting old cache: ${name}`);
            return caches.delete(name);
          })
      );
    })
    .then(() => trimCache(STATIC_CACHE_NAME, MAX_CACHE_ITEMS))
    .then(() => trimCache(API_CACHE_NAME, MAX_API_CACHE_ITEMS))
    .then(() => trimCache(JS_CACHE_NAME, MAX_CACHE_ITEMS))
    .then(() => clients.claim())
  );
});

// Trim cache to prevent unbounded growth
async function trimCache(cacheName, maxItems) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length > maxItems) {
      console.log(`✂️ Trimming ${cacheName}: ${keys.length} → ${maxItems}`);
      await Promise.all(
        keys.slice(0, keys.length - maxItems).map(key => cache.delete(key))
      );
    }
  } catch (err) {
    console.warn('⚠️ Cache trim failed:', err);
  }
}

/** Check if a cached response is older than maxAgeMs using its date header */
function isCacheExpired(response, maxAgeMs) {
  const dateHeader = response.headers.get('date');
  if (!dateHeader) return false; // No date header — assume fresh
  const cachedTime = new Date(dateHeader).getTime();
  return (Date.now() - cachedTime) > maxAgeMs;
}

// Check if an endpoint should never be cached
function shouldNeverCache(pathname) {
  return NO_CACHE_ENDPOINTS.some(endpoint => pathname.includes(endpoint));
}

// Get cache duration for an API endpoint
function getCacheDuration(pathname) {
  for (const [endpoint, duration] of Object.entries(API_CACHE_CONFIG)) {
    if (pathname.includes(endpoint)) {
      return duration;
    }
  }
  return 120; // Default 2 minutes
}

// Fetch handler with comprehensive caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Handle navigation requests with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match('/offline.html');
      })
    );
    return;
  }
  
  // ===== PHASE 9: JavaScript/CSS Bundle Caching =====
  // Cache-first with background update for JS files
  if (request.destination === 'script' || url.pathname.match(/\.(js|mjs)$/i)) {
    event.respondWith(
      caches.open(JS_CACHE_NAME).then(cache => {
        return cache.match(request).then(cached => {
          const fetchPromise = fetch(request).then(response => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          }).catch(() => cached);
          
          // Serve cached if fresh; bypass if expired (7-day TTL)
          if (cached && !isCacheExpired(cached, MAX_JS_AGE_MS)) {
            return cached;
          }
          return fetchPromise;
        });
      })
    );
    return;
  }
  
  // Cache-first for CSS files with 7-day TTL
  if (request.destination === 'style' || url.pathname.match(/\.css$/i)) {
    event.respondWith(
      caches.open(STATIC_CACHE_NAME).then(cache => {
        return cache.match(request).then(cached => {
          const fetchPromise = fetch(request).then(response => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          }).catch(() => cached);
          
          if (cached && !isCacheExpired(cached, MAX_JS_AGE_MS)) {
            return cached;
          }
          return fetchPromise;
        });
      })
    );
    return;
  }
  
  // ===== PHASE 9: Supabase API Response Caching =====
  // Stale-while-revalidate for Supabase REST API
  if (url.hostname === SUPABASE_HOST && url.pathname.startsWith('/rest/v1/')) {
    // Skip endpoints that need real-time freshness
    if (shouldNeverCache(url.pathname)) {
      return; // Let browser handle normally
    }
    
    event.respondWith(
      caches.open(API_CACHE_NAME).then(cache => {
        return cache.match(request).then(cached => {
          // Always fetch in background to update cache
          const fetchPromise = fetch(request).then(response => {
            if (response.ok) {
              // Clone and cache the response
              const responseToCache = response.clone();
              cache.put(request, responseToCache);
            }
            return response;
          }).catch(err => {
            console.warn('📡 Network error, using cache:', err);
            return cached; // Fallback to cache on network error
          });
          
          // Return cached immediately if available (stale-while-revalidate)
          return cached || fetchPromise;
        });
      })
    );
    return;
  }
  
  // Skip other cross-origin requests except for fonts and CDN assets
  if (url.origin !== location.origin && 
      !url.hostname.includes('fonts.googleapis.com') &&
      !url.hostname.includes('fonts.gstatic.com')) {
    return;
  }
  
  // Handle images with cache-first strategy
  if (request.destination === 'image' || url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|avif)$/i)) {
    event.respondWith(
      caches.open(STATIC_CACHE_NAME).then(cache => {
        return cache.match(request).then(cached => {
          const fetchPromise = fetch(request).then(response => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          }).catch(() => cached);
          
          // Serve cached if within 30-day TTL; refetch if expired
          if (cached && !isCacheExpired(cached, MAX_IMAGE_AGE_MS)) {
            return cached;
          }
          return fetchPromise;
        });
      })
    );
    return;
  }
  
  // Handle fonts with cache-first (they rarely change)
  if (request.destination === 'font' || url.pathname.match(/\.(woff2?|ttf|otf|eot)$/i)) {
    event.respondWith(
      caches.open(STATIC_CACHE_NAME).then(cache => {
        return cache.match(request).then(cached => {
          if (cached) return cached;
          
          return fetch(request).then(response => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          });
        });
      })
    );
    return;
  }
});

// Handle push events - Multi-browser compatible
self.addEventListener('push', (event) => {
  console.log('═══════════════════════════════════════════');
  console.log('📬 PUSH NOTIFICATION RECEIVED');
  console.log('═══════════════════════════════════════════');
  
  const env = detectEnvironment();
  console.log(`🌐 Environment: ${env.browser}, iOS: ${env.isIOS}`);
  
  let payload = {};
  
  try {
    payload = event.data ? event.data.json() : {};
    console.log('📦 Parsed payload:', JSON.stringify(payload, null, 2));
  } catch (e) {
    console.error('❌ Failed to parse push data:', e);
    payload = {
      title: 'EDUPRENEURS',
      body: 'Nouvelle notification'
    };
  }

  // Extract notification data - handle iOS APNS and standard formats
  let title, body, url, notificationData;
  
  if (payload.aps) {
    // iOS APNS format
    console.log('📱 iOS APNS format detected');
    title = payload.aps.alert?.title || payload.aps.alert || 'EDUPRENEURS';
    body = payload.aps.alert?.body || 'Nouvelle notification';
    url = payload.url || payload['url-args']?.[0] || '/notifications';
    notificationData = {
      url: url,
      conversationId: payload.conversationId,
      notificationId: payload.notificationId,
      category: payload.category,
      timestamp: payload.timestamp || Date.now()
    };
  } else {
    // Standard format (Chrome, Edge, Samsung, Firefox)
    console.log('🌐 Standard push format detected');
    title = payload.title || 'EDUPRENEURS';
    body = payload.body || 'Nouvelle notification';
    notificationData = payload.data || { url: '/notifications' };
    url = notificationData.url || payload.url || '/notifications';
  }

  console.log('🔔 Notification details:', { title, body, url });

  // Prepare notification options
  const notificationOptions = {
    body,
    tag: payload.tag || `notif-${Date.now()}`,
    data: notificationData,
    requireInteraction: false,
    silent: false,
    timestamp: notificationData.timestamp || Date.now(),
    renotify: true // Allow replacing old notifications with same tag
  };

  // Add browser-specific features
  if (env.isIOS) {
    // iOS Safari - minimal options only
    console.log('📱 iOS: Using minimal notification options');
    // iOS doesn't support icon, badge, vibrate, or actions
  } else if (env.isSamsung || env.isChrome || env.isEdge) {
    // Chrome, Edge, Samsung Internet - full features
    console.log('🌐 Chrome-based: Using full notification features');
    notificationOptions.icon = payload.icon || '/logo.png';
    notificationOptions.badge = payload.badge || '/logo.png';
    notificationOptions.vibrate = [200, 100, 200];
    notificationOptions.actions = [
      { action: 'open', title: '📱 Ouvrir' },
      { action: 'mark_read', title: '✓ Marquer lu' }
    ];
  } else {
    // Firefox and others - basic features
    console.log('🦊 Other browser: Using basic notification features');
    notificationOptions.icon = payload.icon || '/logo.png';
    notificationOptions.badge = payload.badge || '/logo.png';
  }

  event.waitUntil(
    self.registration.showNotification(title, notificationOptions)
      .then(() => {
        console.log('✅ Notification displayed successfully');
        console.log('═══════════════════════════════════════════\n');
        
        // Broadcast to all tabs
        try {
          notificationChannel.postMessage({
            type: 'notification_received',
            notificationId: notificationData.notificationId,
            category: notificationData.category
          });
          console.log('📡 Broadcast sent to all tabs');
        } catch (broadcastError) {
          console.warn('⚠️ Could not broadcast:', broadcastError);
        }
      })
      .catch(err => {
        console.error('❌ Notification display failed:', err);
        console.error('❌ Error details:', err.message);
        
        // Ultimate fallback - absolute minimal notification
        console.log('🔄 Attempting minimal fallback notification...');
        return self.registration.showNotification(title, {
          body,
          data: { url: url || '/notifications' }
        }).then(() => {
          console.log('✅ Fallback notification displayed');
        }).catch(fallbackErr => {
          console.error('❌ Even fallback failed:', fallbackErr);
        });
      })
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ Notification clicked:', event.action, event.notification.data);
  
  event.notification.close();

  const notificationData = event.notification.data || {};
  const action = event.action;

  event.waitUntil(
    (async () => {
      try {
        // Handle mark as read action
        if (action === 'mark_read' && notificationData.notificationId) {
          console.log('✅ Marking notification as read:', notificationData.notificationId);
          
          // Call edge function to mark as read
          try {
            const response = await fetch('https://xdyavylcmucjpueybdku.supabase.co/functions/v1/mark-notification-read', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ notificationId: notificationData.notificationId })
            });
            
            if (response.ok) {
              console.log('✅ Notification marked as read via API');
              // Broadcast to all tabs that notification was marked as read
              try {
                notificationChannel.postMessage({
                  type: 'notification_read',
                  notificationId: notificationData.notificationId
                });
              } catch (broadcastError) {
                console.warn('⚠️ Could not broadcast read status:', broadcastError);
              }
            } else {
              console.error('❌ API returned error:', response.status);
            }
          } catch (error) {
            console.error('❌ Failed to mark as read:', error);
          }
          
          return;
        }

        // Determine URL to open
        const targetUrl = notificationData.deeplink || notificationData.url || '/notifications';
        const urlToOpen = new URL(targetUrl, self.location.origin).href;
        console.log('🔗 Opening URL:', urlToOpen);

        // Mark as read when opening notification
        if (notificationData.notificationId) {
          try {
            const response = await fetch('https://xdyavylcmucjpueybdku.supabase.co/functions/v1/mark-notification-read', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ notificationId: notificationData.notificationId })
            });
            
            if (response.ok) {
              try {
                notificationChannel.postMessage({
                  type: 'notification_read',
                  notificationId: notificationData.notificationId
                });
              } catch (broadcastError) {
                console.warn('⚠️ Could not broadcast read status:', broadcastError);
              }
            }
          } catch (error) {
            console.error('❌ Failed to mark as read on open:', error);
          }
        }

        const clientList = await clients.matchAll({ 
          type: 'window', 
          includeUncontrolled: true 
        });

        // Try to focus existing window with same URL
        for (const client of clientList) {
          if (client.url.includes(targetUrl.split('?')[0]) && 'focus' in client) {
            console.log('🎯 Focusing existing window with same route');
            await client.focus();
            if ('navigate' in client) {
              return client.navigate(urlToOpen);
            }
            return;
          }
        }

        // Focus any window and navigate
        if (clientList.length > 0) {
          const client = clientList[0];
          console.log('🔄 Navigating existing window');
          await client.focus();
          if ('navigate' in client) {
            return client.navigate(urlToOpen);
          }
        }

        // Open new window
        if (clients.openWindow) {
          console.log('🆕 Opening new window');
          return clients.openWindow(urlToOpen);
        }
      } catch (error) {
        console.error('❌ Error handling notification click:', error);
      }
    })()
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('🔕 Notification closed:', event.notification.tag);
});

// Log environment on load
const initialEnv = detectEnvironment();
console.log(`🚀 Service Worker ${SW_VERSION} loaded`);
console.log(`🌐 Environment: ${initialEnv.browser} on ${initialEnv.isIOS ? 'iOS' : 'Desktop/Android'}`);
console.log('═══════════════════════════════════════════');
