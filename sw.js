
const CACHE = 'konnekt-pwa-v3';
const APP_ROOT = new URL('./', self.location.href).pathname;

const CORE = [
  APP_ROOT,
  `${APP_ROOT}index.html`,
  `${APP_ROOT}manifest.webmanifest`,
  `${APP_ROOT}konnekt-192.png`,
  `${APP_ROOT}konnekt-512.png`,
  `${APP_ROOT}konnekt.svg`
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
          .filter(key => key.startsWith('konnekt-pwa-') && key !== CACHE)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  if (
    request.method !== 'GET' ||
    url.origin !== self.location.origin ||
    !url.pathname.startsWith(APP_ROOT)
  ) {
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
        caches.match(request).then(hit => {
          if (hit) return hit;

          if (request.mode === 'navigate') {
            return caches.match(`${APP_ROOT}index.html`);
          }

          return Response.error();
        })
      )
  );
});

self.addEventListener('push', event => {
  let payload = {
    title: 'KONNEKT',
    body: 'You have a new notification.',
    url: APP_ROOT
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
      icon: `${APP_ROOT}konnekt-192.png`,
      badge: `${APP_ROOT}konnekt-192.png`,
      data: { url: payload.url || APP_ROOT },
      tag: payload.tag || 'konnekt-notification'
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  const target = new URL(
    event.notification.data?.url || APP_ROOT,
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
