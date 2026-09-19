const BUILD_VERSION = '2026.09.19.5';
const CACHE_PREFIX = 'hotb-app-';
const CACHE_NAME = `${CACHE_PREFIX}${BUILD_VERSION}`;
const OFFLINE_SHELL = './index.html';
const CORE_FILES = ['./index.html', './hotb-fresh.html', './styles.css', './evaluation-cleanup.css', './app.js'];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(CORE_FILES.map(async path => {
      try {
        const response = await fetch(path, {cache: 'reload'});
        if (response.ok) await cache.put(path, response);
      } catch (_) {
        // A temporarily unavailable file must not prevent the update from activating.
      }
    }));
    // Keep the current HotB session under its existing worker until the user chooses UPDATE NOW.
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names
      .filter(name => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
      .map(name => caches.delete(name)));
    await self.clients.claim();
    const windows = await self.clients.matchAll({type: 'window', includeUncontrolled: true});
    windows.forEach(client => client.postMessage({type: 'HOTB_UPDATE_READY', version: BUILD_VERSION}));
  })());
});

async function newestNavigation(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request, {cache: 'no-store'});
    if (response.ok) await cache.put(OFFLINE_SHELL, response.clone());
    return response;
  } catch (_) {
    return (await cache.match(OFFLINE_SHELL)) || Response.error();
  }
}

async function newestAsset(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request, {cache: 'no-store'});
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch (_) {
    return (await cache.match(request)) || Response.error();
  }
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') return event.respondWith(newestNavigation(request));
  if (['script', 'style', 'worker'].includes(request.destination)) event.respondWith(newestAsset(request));
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
