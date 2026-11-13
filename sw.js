
const CACHE = 'konnekt-pwa-v2';

const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './konnekt-192.png',
  './konnekt-512.png',
  './konnekt.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(CORE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key.startsWith('konnekt-') && key !== CACHE)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(request, copy));
        }
        return response;
      })
      .catch(() =>
        caches.match(request).then(
          hit => hit || caches.match('./index.html')
        )
      )
  );
});

self.addEventListener('push', event => {
  let payload = {
    title: 'KONNEKT',
    body: 'You have a new notification.',
    url: './'
  };

  try {
    if (event.data) {
      payload = { ...payload, ...event.data.json() };
    }
  } catch (_) {
    if (event.data) payload.body = event.data.text();
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: './konnekt-192.png',
      badge: './konnekt-192.png',
      data: { url: payload.url || './' },
      tag: payload.tag || 'konnekt-notification'
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  const target = new URL(
    event.notification.data?.url || './',
    self.registration.scope
  ).href;

  event.waitUntil(
    self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(list => {
      for (const client of list) {
        if (client.url.startsWith(self.registration.scope)) {
          client.focus();
          client.navigate(target);
          return;
        }
      }

      return self.clients.openWindow(target);
    })
  );
});
