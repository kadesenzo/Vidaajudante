// LIFE OS Service Worker - Push Notifications & Local Reminder Triggers
const CACHE_NAME = 'life-os-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handling notification clicks to navigate directly to the target module/screen
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetTab = event.notification.data?.tab || 'reminders';
  const urlToOpen = new URL('/', self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          client.postMessage({ type: 'NAVIGATE_TAB', tab: targetTab, reminderId: event.notification.data?.reminderId });
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(`/?tab=${targetTab}`);
      }
    })
  );
});

// Listen for messages from frontend to show local notifications
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    self.registration.showNotification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [200, 100, 200],
      ...options,
    });
  }
});
