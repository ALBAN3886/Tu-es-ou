// TrackTeam Service Worker — arrière-plan GPS
const VERSION = 'trackteam-v2';

self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => { clients.claim(); });

// Notification persistante
self.addEventListener('message', e => {
  if (!e.data) return;

  if (e.data === 'ping') {
    e.source && e.source.postMessage('pong');
  }

  if (e.data.type === 'SHOW_NOTIF') {
    self.registration.showNotification('🟢 TrackTeam — Partage actif', {
      body: e.data.text || 'Votre position est partagée en direct',
      tag: 'trackteam-bg',
      renotify: false,
      requireInteraction: true,
      silent: true,
      actions: [
        { action: 'open', title: '📱 Ouvrir' },
        { action: 'stop', title: '⏹ Arrêter' }
      ]
    });
  }

  if (e.data.type === 'HIDE_NOTIF') {
    self.registration.getNotifications({ tag: 'trackteam-bg' })
      .then(notifs => notifs.forEach(n => n.close()));
  }
});

// Clic sur la notification
self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action === 'stop') {
    clients.matchAll({ type: 'window' }).then(cls => {
      cls.forEach(c => c.postMessage('STOP_TRACKING'));
    });
  } else {
    clients.matchAll({ type: 'window' }).then(cls => {
      if (cls.length) cls[0].focus();
      else clients.openWindow('./tracker.html');
    });
  }
});

// Cache réseau pour garder le SW vivant
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
