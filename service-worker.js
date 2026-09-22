const BUILD_VERSION = '2026.09.22.265';
const CACHE_PREFIX = 'hotb-app-';
const CACHE_NAME = `${CACHE_PREFIX}${BUILD_VERSION}`;
const OFFLINE_SHELL = './index.html';
const CANONICAL_LAUNCH = './?source=pwa&launch=265';
const LEGACY_SHELL = './hotb-fresh.html';
const CORE_FILES = ['./index.html', './hotb-fresh.html', './manifest.webmanifest', './pwa-update.js', './styles.css', './evaluation-cleanup.css', './app.js', './practice-scheduler.js'];
const VERSIONED_CORE_PATTERNS = [/\/app\.js(?:\?|$)/, /\/practice-scheduler\.js(?:\?|$)/, /\/pwa-update\.js(?:\?|$)/, /\/manifest\.webmanifest(?:\?|$)/, /\/decision-quality\.js(?:\?|$)/, /\/coach-observations\.js(?:\?|$)/, /\/styles\.css(?:\?|$)/, /\/evaluation-cleanup\.css(?:\?|$)/];

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
    if (response.ok) await cache.put(new Request(new URL(OFFLINE_SHELL, self.location.href).href), response.clone());
    return response;
  } catch (_) {
    return (await cache.match(new Request(new URL(OFFLINE_SHELL, self.location.href).href))) || Response.error();
  }
}

async function newestAsset(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request, {cache: 'no-store'});
    if (response.ok) {
      await cache.put(request, response.clone());
      // Keep an unversioned offline alias for versioned core assets loaded by index.html.
      // Without this, an offline launch can find index.html but fail its ?v= script/style URL.
      const pathname=new URL(request.url).pathname;
      const corePattern=VERSIONED_CORE_PATTERNS.find(pattern=>pattern.test(pathname));
      if(corePattern){
        const aliasUrl=new URL(request.url);aliasUrl.search='';
        await cache.put(new Request(aliasUrl.href),response.clone());
      }
    }
    return response;
  } catch (_) {
    const exact=await cache.match(request);
    if(exact)return exact;
    const pathname=new URL(request.url).pathname;
    if(VERSIONED_CORE_PATTERNS.some(pattern=>pattern.test(pathname))){
      const aliasUrl=new URL(request.url);aliasUrl.search='';
      return (await cache.match(new Request(aliasUrl.href))) || Response.error();
    }
    return Response.error();
  }
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Player/coach portal links must never be served by the coach PWA cache.
  // Safari can still route a normal portal link through the installed worker before
  // the page gets a chance to unregister it.
  if (request.mode === 'navigate' && url.searchParams.has('portal')) {
    return event.respondWith(fetch(request, {cache: 'no-store'}));
  }
  if (request.mode === 'navigate') {
    // Normalize old installed launch URLs to the canonical current shell while
    // preserving all application-owned saved data. This repairs stale Home Screen
    // launch targets without deleting or reinstalling HotB.
    if (!url.searchParams.has('portal') && (url.searchParams.get('source')==='pwa' || url.pathname.endsWith('/hotb-fresh.html'))) {
      const canonicalUrl=new URL(CANONICAL_LAUNCH,self.location.href);
      const canonical=new Request(canonicalUrl.href,{cache:'no-store'});
      return event.respondWith(newestNavigation(canonical));
    }
    // hotb-fresh.html was an emergency bootstrap shell and is now stale.
    // Always route installed-app navigations to the canonical current index.html.
    if (url.pathname.endsWith('/hotb-fresh.html')) {
      const canonical = new Request(new URL('./index.html', self.location.href).href, {cache: 'no-store'});
      return event.respondWith(newestNavigation(canonical));
    }
    return event.respondWith(newestNavigation(request));
  }
  if (['script', 'style', 'worker'].includes(request.destination)) event.respondWith(newestAsset(request));
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
