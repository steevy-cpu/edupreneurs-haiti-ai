// Service Worker for Push Notifications
const SW_VERSION = '1.0.0';
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

  const {
    type = 'message',
    title = 'Edupreneurs',
    body = 'Nouvelle notification',
    icon = '/logo.png',
    badge = '/logo.png',
    tag,
    renotify = true,
    data = {},
    actions = []
  } = payload;

  console.log('🔔 Creating notification:', { title, body, type });

  const notificationOptions = {
    body,
    icon,
    badge,
    tag: tag || `${type}-${Date.now()}`,
    renotify,
    data: {
      type,
      deeplink: data.url || data.deeplink || '/community',
      conversationId: data.conversationId,
      ...data
    },
    actions: actions.length > 0 ? actions : [
      { action: 'open', title: 'Ouvrir', icon: '/logo.png' },
      { action: 'dismiss', title: 'Ignorer' }
    ],
    requireInteraction: true, // All notifications require interaction for better visibility
    vibrate: [200, 100, 200],
    timestamp: Date.now(),
    silent: false
  };

  event.waitUntil(
    self.registration.showNotification(title, notificationOptions)
      .then(() => console.log('✅ Notification displayed successfully'))
      .catch(err => console.error('❌ Notification failed:', err))
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
      // Handle specific actions
      if (action === 'dismiss') {
        console.log('🚫 Notification dismissed');
        return;
      }

      if (action === 'mark_read' && notificationData.threadId) {
        // Mark as read (would need backend endpoint)
        console.log('✅ Mark as read:', notificationData.threadId);
      }

      // Focus or open window
      const urlToOpen = new URL(notificationData.deeplink || '/community', self.location.origin).href;
      console.log('🔗 Opening:', urlToOpen);

      const clientList = await clients.matchAll({ 
        type: 'window', 
        includeUncontrolled: true 
      });

      // Try to focus existing window
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          console.log('🎯 Focusing existing window');
          return client.focus();
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
    })()
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('🔕 Notification closed:', event.notification.tag);
});

console.log(`🚀 Service Worker ${SW_VERSION} loaded`);
