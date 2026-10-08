const BUILD_VERSION = '2026.10.09.564';
const CACHE_PREFIX = 'hotb-app-';
const CACHE_NAME = `${CACHE_PREFIX}${BUILD_VERSION}`;
const OFFLINE_SHELL = './index.html';
const CANONICAL_LAUNCH = './?source=pwa&launch=564';
const LEGACY_SHELL = './hotb-fresh.html';
const CORE_FILES = ['./index.html','./hotb-fresh.html','./manifest.webmanifest','./pwa-update.js','./styles.css','./evaluation-cleanup.css','./hotb-night-fixes.css','./observation-publish-v2.css','./observation-publish-v2.js','./practice-focus-integration.js','./app.js','./practice-scheduler.js','./team-recommendations.js','./practice-bypass.js'];
const VERSIONED_CORE_PATTERNS = [/\/app\.js(?:\?|$)/,/\/practice-scheduler\.js(?:\?|$)/,/\/pwa-update\.js(?:\?|$)/,/\/practice-bypass\.js(?:\?|$)/,/\/practice-focus-integration\.js(?:\?|$)/,/\/manifest\.webmanifest(?:\?|$)/,/\/decision-quality\.js(?:\?|$)/,/\/coach-observations\.js(?:\?|$)/,/\/team-recommendations\.js(?:\?|$)/,/\/styles\.css(?:\?|$)/,/\/evaluation-cleanup\.css(?:\?|$)/,/\/hotb-night-fixes\.css(?:\?|$)/,/\/observation-publish-v2\.js(?:\?|$)/,/\/observation-publish-v2\.css(?:\?|$)/];
self.addEventListener('install',event=>{event.waitUntil((async()=>{const cache=await caches.open(CACHE_NAME);await Promise.all(CORE_FILES.map(async path=>{try{const response=await fetch(path,{cache:'reload'});if(response.ok)await cache.put(path,response)}catch(_){}}))})())});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{const names=await caches.keys();await Promise.all(names.filter(name=>name.startsWith(CACHE_PREFIX)&&name!==CACHE_NAME).map(name=>caches.delete(name)));await self.clients.claim();const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});windows.forEach(client=>client.postMessage({type:'HOTB_UPDATE_READY',version:BUILD_VERSION}))})())});
async function newestNavigation(request){const cache=await caches.open(CACHE_NAME);try{const response=await fetch(request,{cache:'no-store'});if(response.ok)await cache.put(new Request(new URL(OFFLINE_SHELL,self.location.href).href),response.clone());return response}catch(_){return(await cache.match(new Request(new URL(OFFLINE_SHELL,self.location.href).href)))||Response.error()}}
function patchAssistantCoachFocus(source){
 const payloadNeedle="const rawSchedule=recovered||(Array.isArray(built)?built:[]);";
 const payloadReplacement="const rawSchedule=recovered||(Array.isArray(built)?built:[]);const focusPlayersByBlock=Array.from({length:practicePlan.times?.length||practicePlan.blocks?.length||10},(_,index)=>Object.entries(practicePlan.schedule||{}).filter(([,rows])=>rows?.[index]?.focusMatch).map(([name])=>practiceFirstName(name)));";
 if(source.includes(payloadNeedle))source=source.replace(payloadNeedle,payloadReplacement);
 const payloadReturnNeedle="schedule:rawSchedule";
 const payloadReturnReplacement="schedule:rawSchedule.map((entry,index)=>({...entry,focusPlayers:focusPlayersByBlock[index]||[]}))";
 if(source.includes(payloadReturnNeedle))source=source.replace(payloadReturnNeedle,payloadReturnReplacement);
 const viewNeedle="<strong>${esc(entry.assignment||'Coaching')}</strong></li>";
 const viewReplacement="<strong>${esc(entry.assignment||'Coaching')}${Array.isArray(entry.focusPlayers)&&entry.focusPlayers.length?` <span class=\"practice-focus-assignment-badge\" style=\"display:inline-block;margin-left:4px;padding:2px 6px;border:1.5px solid #c71920;border-radius:999px;color:#c71920;background:#fff;font-size:9px;font-weight:950;line-height:1\">FOCUS</span> <small style=\"color:#c71920;font-weight:800\">${esc(entry.focusPlayers.join(', '))}</small>`:''}</strong></li>";
 if(source.includes(viewNeedle))source=source.replace(viewNeedle,viewReplacement);
 return source;
}
async function patchCoachBundle(request,response){const pathname=new URL(request.url).pathname;if(!pathname.endsWith('/app-coach-rebels-portals-v10.js')||!response.ok)return response;try{let source=await response.text();source=patchAssistantCoachFocus(source);const headers=new Headers(response.headers);headers.delete('content-length');headers.delete('content-encoding');headers.delete('etag');return new Response(source,{status:response.status,statusText:response.statusText,headers})}catch(_){return response}}
async function newestAsset(request){const cache=await caches.open(CACHE_NAME);try{let response=await fetch(request,{cache:'no-store'});response=await patchCoachBundle(request,response);if(response.ok){await cache.put(request,response.clone());return response}return response}catch(_){return(await cache.match(request))||Response.error()}}
self.addEventListener('fetch',event=>{const request=event.request;if(request.method!=='GET')return;const url=new URL(request.url);if(url.origin!==self.location.origin)return;if(request.mode==='navigate'&&url.searchParams.has('portal'))return event.respondWith(fetch(request,{cache:'no-store'}));if(request.mode==='navigate')return event.respondWith(newestNavigation(request));event.respondWith(newestAsset(request))});
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting()});