const BUILD_VERSION = '2026.10.07.546';
const CACHE_PREFIX = 'hotb-app-';
const CACHE_NAME = `${CACHE_PREFIX}${BUILD_VERSION}`;
const OFFLINE_SHELL = './index.html';
const CANONICAL_LAUNCH = './?source=pwa&launch=546';
const LEGACY_SHELL = './hotb-fresh.html';
const CORE_FILES = ['./index.html', './hotb-fresh.html', './manifest.webmanifest', './pwa-update.js', './styles.css', './evaluation-cleanup.css', './app.js', './practice-scheduler.js', './team-recommendations.js', './practice-bypass.js'];
const VERSIONED_CORE_PATTERNS = [/\/app\.js(?:\?|$)/, /\/practice-scheduler\.js(?:\?|$)/, /\/pwa-update\.js(?:\?|$)/, /\/practice-bypass\.js(?:\?|$)/, /\/manifest\.webmanifest(?:\?|$)/, /\/decision-quality\.js(?:\?|$)/, /\/coach-observations\.js(?:\?|$)/, /\/team-recommendations\.js(?:\?|$)/, /\/styles\.css(?:\?|$)/, /\/evaluation-cleanup\.css(?:\?|$)/];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(CORE_FILES.map(async path => {
      try {
        const response = await fetch(path, {cache: 'reload'});
        if (response.ok) await cache.put(path, response);
      } catch (_) {}
    }));
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME).map(name => caches.delete(name)));
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

async function patchFocusReceiptSync(request,response){
  const pathname=new URL(request.url).pathname;
  if(!pathname.endsWith('/app-coach-rebels-portals-v10.js')||!response.ok)return response;
  try{
    let source=await response.text();
    const needle="if(!selected){queueMicrotask(refreshPlayerFocusOpenedReceipts);return `${practiceSectionHeader('Player Focus')}";
    const replacement="if(!selected){queueMicrotask(refreshPlayerFocusOpenedReceipts);clearTimeout(window.__hotbFocusReceiptTimer);window.__hotbFocusReceiptTimer=setTimeout(()=>{if(route==='practice'&&practiceScreen==='player-focus'&&!practiceFocusPlayer){playerFocusReceiptRefreshStarted=false;refreshPlayerFocusOpenedReceipts()}},4000);return `${practiceSectionHeader('Player Focus')}";
    if(source.includes(needle))source=source.replace(needle,replacement);
    const dashboardBuildPractice="+(analysis.mode==='development'?'<button class=\"dash-action\" style=\"width:100%;margin-top:12px;background:#111827!important;color:#fff!important;border:1.5px solid #111827!important\" data-team-focus-build>Build Practice</button>':'')+";
    if(source.includes(dashboardBuildPractice))source=source.replace(dashboardBuildPractice,'+');
    return new Response(source,{status:response.status,statusText:response.statusText,headers:response.headers});
  }catch(_){return response}
}

async function newestAsset(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    let response = await fetch(request, {cache: 'no-store'});
    response = await patchFocusReceiptSync(request,response);
    if (response.ok) {
      await cache.put(request, response.clone());
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
  if (request.mode === 'navigate' && url.searchParams.has('portal')) return event.respondWith(fetch(request, {cache: 'no-store'}));
  if (request.mode === 'navigate') {
    if (!url.searchParams.has('portal') && (url.searchParams.get('source')==='pwa' || url.pathname.endsWith('/hotb-fresh.html'))) {
      const canonicalUrl=new URL(CANONICAL_LAUNCH,self.location.href);
      const canonical=new Request(canonicalUrl.href,{cache:'no-store'});
      return event.respondWith(newestNavigation(canonical));
    }
    if (url.pathname.endsWith('/hotb-fresh.html')) {
      const canonical = new Request(new URL('./index.html', self.location.href).href, {cache:'no-store'});
      return event.respondWith(newestNavigation(canonical));
    }
    return event.respondWith(newestNavigation(request));
  }
  if (['script', 'style', 'worker'].includes(request.destination)) event.respondWith(newestAsset(request));
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
