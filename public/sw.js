// Service Worker for Push Notifications and Asset Caching - Optimized for 3G
const SW_VERSION = '1.4.1';
const CACHE_NAME = `edupreneurs-v${SW_VERSION}`;
const STATIC_CACHE_NAME = `edupreneurs-static-v${SW_VERSION}`;

// Critical assets to precache for offline/slow network support
const PRECACHE_ASSETS = [
  '/logo.png',
  '/pwa-icon.jpeg',
  '/manifest.webmanifest'
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
          .filter(name => name.startsWith('edupreneurs-') && name !== CACHE_NAME && name !== STATIC_CACHE_NAME)
          .map(name => {
            console.log(`🗑️ Deleting old cache: ${name}`);
            return caches.delete(name);
          })
      );
    }).then(() => clients.claim())
  );
});

// Fetch handler with stale-while-revalidate for images
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip cross-origin requests except for fonts and CDN assets
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
          
          // Return cached immediately, update in background
          return cached || fetchPromise;
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
