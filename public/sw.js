// Service Worker for Push Notifications
self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(clients.claim());
});

self.addEventListener('push', (event) => {
  console.log('Push notification received', event);
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Nouveau message';
  const options = {
    body: data.body || 'Vous avez reçu un nouveau message',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: {
      url: data.url || '/community',
      conversationId: data.conversationId
    },
    tag: data.conversationId || 'message-notification',
    requireInteraction: true
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked', event);
  event.notification.close();

  const urlToOpen = event.notification.data.url || '/community';
  const conversationId = event.notification.data.conversationId;
  
  const finalUrl = conversationId 
    ? `${urlToOpen}?conversation=${conversationId}`
    : urlToOpen;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url.includes('/community') && 'focus' in client) {
            return client.focus().then(() => client.navigate(finalUrl));
          }
        }
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(finalUrl);
        }
      })
  );
});
