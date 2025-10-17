// Service Worker for Push Notifications
const SW_VERSION = '1.0.2';
const CACHE_NAME = `edupreneurs-v${SW_VERSION}`;

self.addEventListener('install', (event) => {
  console.log(`📦 Service Worker ${SW_VERSION} installing...`);
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log(`✅ Service Worker ${SW_VERSION} activated`);
  event.waitUntil(clients.claim());
});

// Handle push events
self.addEventListener('push', (event) => {
  console.log('📬 Push received:', event);
  
  let payload = {};
  
  try {
    payload = event.data ? event.data.json() : {};
    console.log('📦 Parsed push payload:', payload);
  } catch (e) {
    console.error('❌ Failed to parse push data:', e);
    payload = {
      title: 'EDUPRENEURS',
      body: 'Nouvelle notification'
    };
  }

  // Detect if we're on iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  // Extract notification data - handle both iOS (aps) and standard formats
  let title, body, url, notificationData;
  
  if (payload.aps) {
    // iOS format with aps structure
    title = payload.aps.alert?.title || 'EDUPRENEURS';
    body = payload.aps.alert?.body || 'Nouvelle notification';
    url = payload.url || '/notifications';
    notificationData = {
      url: url,
      conversationId: payload.conversationId,
      timestamp: payload.timestamp || Date.now()
    };
  } else {
    // Standard format
    title = payload.title || 'EDUPRENEURS';
    body = payload.body || 'Nouvelle notification';
    notificationData = payload.data || { url: '/notifications' };
    url = notificationData.url || '/notifications';
  }

  console.log('🔔 Creating notification:', { title, body, url, isIOS });

  // Prepare notification options - minimal for iOS
  const notificationOptions = {
    body,
    tag: payload.tag || `notif-${Date.now()}`,
    data: notificationData,
    requireInteraction: false,
    silent: false
  };

  // Only add features for non-iOS platforms
  if (!isIOS) {
    notificationOptions.icon = payload.icon || '/logo.png';
    notificationOptions.badge = payload.badge || '/logo.png';
    notificationOptions.vibrate = [200, 100, 200];
    notificationOptions.actions = [
      { action: 'open', title: '📱 Ouvrir' },
      { action: 'dismiss', title: '✖️ Fermer' }
    ];
  }

  event.waitUntil(
    self.registration.showNotification(title, notificationOptions)
      .then(() => console.log('✅ Notification displayed successfully'))
      .catch(err => {
        console.error('❌ Notification failed:', err);
        // Fallback: try with absolute minimal options
        return self.registration.showNotification(title, {
          body,
          data: { url: url || '/notifications' }
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
        // Handle specific actions
        if (action === 'dismiss') {
          console.log('🚫 Notification dismissed');
          return;
        }

        if (action === 'mark_read' && notificationData.threadId) {
          // Mark as read (would need backend endpoint)
          console.log('✅ Mark as read:', notificationData.threadId);
        }

        // Determine URL to open
        const targetUrl = notificationData.url || '/notifications';
        const urlToOpen = new URL(targetUrl, self.location.origin).href;
        console.log('🔗 Opening URL:', urlToOpen);

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

console.log(`🚀 Service Worker ${SW_VERSION} loaded`);
