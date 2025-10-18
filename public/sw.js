// Service Worker for Push Notifications
const SW_VERSION = '1.1.0';
const CACHE_NAME = `edupreneurs-v${SW_VERSION}`;

// BroadcastChannel for cross-tab sync
const notificationChannel = new BroadcastChannel('edupreneurs-notifications');

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
    silent: false,
    timestamp: payload.timestamp || Date.now()
  };

  // Only add features for non-iOS platforms
  if (!isIOS) {
    notificationOptions.icon = payload.icon || '/logo.png';
    notificationOptions.badge = payload.badge || '/logo.png';
    notificationOptions.vibrate = [200, 100, 200];
    notificationOptions.actions = [
      { action: 'open', title: '📱 Ouvrir' },
      { action: 'mark_read', title: '✓ Marquer lu' }
    ];
  }

  event.waitUntil(
    self.registration.showNotification(title, notificationOptions)
      .then(() => {
        console.log('✅ Notification displayed successfully');
        // Broadcast to all tabs that a new notification arrived
        notificationChannel.postMessage({
          type: 'notification_received',
          notificationId: notificationData.notificationId,
          category: notificationData.category
        });
      })
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
        // Handle mark as read action
        if (action === 'mark_read' && notificationData.notificationId) {
          console.log('✅ Marking notification as read:', notificationData.notificationId);
          
          // Call backend to mark as read
          try {
            const response = await fetch(`${self.location.origin}/api/notifications/${notificationData.notificationId}/read`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' }
            });
            
            if (response.ok) {
              // Broadcast to all tabs that notification was marked as read
              notificationChannel.postMessage({
                type: 'notification_read',
                notificationId: notificationData.notificationId
              });
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
            const response = await fetch(`${self.location.origin}/api/notifications/${notificationData.notificationId}/read`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' }
            });
            
            if (response.ok) {
              notificationChannel.postMessage({
                type: 'notification_read',
                notificationId: notificationData.notificationId
              });
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

console.log(`🚀 Service Worker ${SW_VERSION} loaded`);
