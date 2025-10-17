// Service Worker for Push Notifications
const SW_VERSION = '1.0.1';
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
      type: 'message',
      title: 'Nouveau message',
      body: 'Vous avez reçu un nouveau message'
    };
  }

  // Extract notification data
  const {
    title = 'EDUPRENEURS',
    body = 'Nouvelle notification',
    icon = '/logo.png',
    badge = '/logo.png',
    tag,
    data = {}
  } = payload;

  console.log('🔔 Creating notification:', { title, body, data });

  // Detect if we're on iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  // Prepare notification options - simpler for iOS
  const notificationOptions = {
    body,
    icon: isIOS ? undefined : icon,  // iOS doesn't support custom icons
    badge: isIOS ? undefined : badge, // iOS doesn't support custom badges
    tag: tag || `notif-${Date.now()}`,
    data: {
      url: data.url || '/notifications',
      type: data.type || 'general',
      timestamp: data.timestamp || Date.now()
    },
    requireInteraction: false, // Changed to false for better iOS compatibility
    vibrate: isIOS ? undefined : [200, 100, 200], // iOS doesn't support vibrate in web push
    silent: false
  };

  // Only add actions for non-iOS platforms
  if (!isIOS) {
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
        // Fallback: try with minimal options
        return self.registration.showNotification(title, {
          body,
          data: { url: data.url || '/notifications' }
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
