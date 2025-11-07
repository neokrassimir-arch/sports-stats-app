const CACHE_NAME = 'bbstats-v1';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/leaderboard.html',
  '/live.html',
  '/teams.html',
  '/compare.html',
  '/favorites.html',
  '/styles.css',
  '/app.js',
  '/charts.js',
  '/leaderboard.js',
  '/live.js',
  '/teams.js',
  '/compare.js',
  '/favorites.js'
];

self.addEventListener('install', (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => { if (k !== CACHE_NAME) return caches.delete(k); })))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (evt) => {
  evt.respondWith(
    caches.match(evt.request).then(response => {
      if (response) return response;
      return fetch(evt.request).catch(()=>caches.match('/index.html'));
    })
  );
});
