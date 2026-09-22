const assert=require('node:assert/strict');
const fs=require('node:fs');

const worker=fs.readFileSync('./service-worker.js','utf8');
const client=fs.readFileSync('./pwa-update.js','utf8');
const app=fs.readFileSync('./app.js','utf8');
const index=fs.readFileSync('./index.html','utf8');
const fresh=fs.readFileSync('./hotb-fresh.html','utf8');
const manifest=JSON.parse(fs.readFileSync('./manifest.webmanifest','utf8'));

assert.match(worker,/CACHE_PREFIX = 'hotb-app-'/,'HotB caches must have an app-only prefix');
assert.match(worker,/CORE_FILES = \[[^\n]*'\.\/manifest\.webmanifest'[^\n]*'\.\/pwa-update\.js'/,'offline core must include the manifest and PWA updater that select the installed build');
assert.match(worker,/\/\\\/pwa-update\\\.js/,'versioned PWA updater requests must participate in the network-first offline alias strategy');
assert.match(worker,/manifest\\\.webmanifest/,'versioned manifest requests must participate in the network-first offline alias strategy');
assert.match(worker,/name\.startsWith\(CACHE_PREFIX\).*name !== CACHE_NAME/,'activation must remove only obsolete HotB caches');
assert.match(worker,/request\.mode === 'navigate'/,'navigations must have an explicit strategy');
assert.match(worker,/fetch\(request, \{cache: 'no-store'\}\)/,'online navigations and code must prefer the network');
assert.match(worker,/cache\.match\(new Request\(new URL\(OFFLINE_SHELL, self\.location\.href\)\.href\)\)/,'navigation must retain an offline app-shell fallback using the canonical absolute cache key');
assert.match(worker,/self\.skipWaiting\(\)/,'new workers must activate without remaining stuck waiting');
assert.match(worker,/self\.clients\.claim\(\)/,'new workers must take control of open clients');
assert.doesNotMatch(worker,/\blocalStorage\b|\bindexedDB\b|\bdeleteDatabase\b/,'service-worker executable source must not access or delete application data stores');
assert.match(client,/updateViaCache: 'none'/,'the service-worker script must bypass the HTTP cache during update checks');
assert.match(client,/registration\.update\(\)/,'the app must explicitly check for updates');
assert.match(client,/visibilitychange/,'resumed Home Screen apps must check for updates');
assert.match(client,/New HotB version available/,'an in-app update notice must be available');
assert.match(client,/UPDATE NOW/,'the update notice must provide a reload action');
assert.ok(index.includes('pwa-update.js'),'canonical app entry point must register update handling');
assert.match(fresh,/launch=229/,'legacy recovery shell must redirect directly to the current canonical launch');
assert.doesNotMatch(fresh,/launch=136/,'legacy recovery shell must not send installed iPhones through the stale launch route');
assert.equal(manifest.start_url,'./?source=pwa&launch=229','the installed app must open the current canonical build-229 network-first entry point');
assert.match(index,/manifest\.webmanifest\?v=20260922-launch229/,'canonical shell must cache-bust the manifest at the current installed-app generation');
assert.doesNotMatch(index,/manifest\.webmanifest\?v=20260921-launch226/,'canonical shell must not keep advertising the stale launch-138 manifest URL');
assert.match(app,/Version:.*HOTB_BUILD_VERSION/,'the Home page must display the running build');

console.log('pwa-update tests passed');
