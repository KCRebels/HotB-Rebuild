const BUILD_VERSION = '2026.10.08.551';
const CACHE_PREFIX = 'hotb-app-';
const CACHE_NAME = `${CACHE_PREFIX}${BUILD_VERSION}`;
const OFFLINE_SHELL = './index.html';
const CANONICAL_LAUNCH = './?source=pwa&launch=551';
const LEGACY_SHELL = './hotb-fresh.html';
const CORE_FILES = ['./index.html','./hotb-fresh.html','./manifest.webmanifest','./pwa-update.js','./styles.css','./evaluation-cleanup.css','./hotb-night-fixes.css','./observation-publish-v2.css','./observation-publish-v2.js','./practice-focus-integration.js','./app.js','./practice-scheduler.js','./team-recommendations.js','./practice-bypass.js'];
const VERSIONED_CORE_PATTERNS = [/\/app\.js(?:\?|$)/,/\/practice-scheduler\.js(?:\?|$)/,/\/pwa-update\.js(?:\?|$)/,/\/practice-bypass\.js(?:\?|$)/,/\/practice-focus-integration\.js(?:\?|$)/,/\/manifest\.webmanifest(?:\?|$)/,/\/decision-quality\.js(?:\?|$)/,/\/coach-observations\.js(?:\?|$)/,/\/team-recommendations\.js(?:\?|$)/,/\/styles\.css(?:\?|$)/,/\/evaluation-cleanup\.css(?:\?|$)/,/\/hotb-night-fixes\.css(?:\?|$)/,/\/observation-publish-v2\.js(?:\?|$)/,/\/observation-publish-v2\.css(?:\?|$)/];

self.addEventListener('install',event=>{event.waitUntil((async()=>{const cache=await caches.open(CACHE_NAME);await Promise.all(CORE_FILES.map(async path=>{try{const response=await fetch(path,{cache:'reload'});if(response.ok)await cache.put(path,response)}catch(_){}}))})())});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{const names=await caches.keys();await Promise.all(names.filter(name=>name.startsWith(CACHE_PREFIX)&&name!==CACHE_NAME).map(name=>caches.delete(name)));await self.clients.claim();const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});windows.forEach(client=>client.postMessage({type:'HOTB_UPDATE_READY',version:BUILD_VERSION}))})())});
async function newestNavigation(request){const cache=await caches.open(CACHE_NAME);try{const response=await fetch(request,{cache:'no-store'});if(response.ok)await cache.put(new Request(new URL(OFFLINE_SHELL,self.location.href).href),response.clone());return response}catch(_){return(await cache.match(new Request(new URL(OFFLINE_SHELL,self.location.href).href)))||Response.error()}}

function patchObservationPublishBridge(source){
 const needle="function bindCoachObservation(){\n const g=currentGame(),api=window.HotBCoachObservations,focusMode=observationMode==='focus',manageMode=observationMode==='manage';if(!api||(!focusMode&&!manageMode&&!g))return;";
 if(!source.includes(needle))return source;
 const replacement=`let observationPublishPending=null;
async function observationPublishPreflight({playerName}={}){
 const player=db.roster.find(item=>!item.isTeamJenkins&&playerName&&item.name===playerName);
 if(!player)return{ok:false,message:'Player Focus is only available for competitive-roster players.'};
 if(!cloudUser||!cloudStore)return{ok:false,message:'Sign in through Cloud Backup before publishing Player Focus.'};
 if(!player.portalId)await recoverPermanentPlayerPortal(player);
 if(!player.portalId)return{ok:false,message:'HotB could not match this player to her existing permanent portal.'};
 const snap=await portalDoc(player.portalId).get(),remote=snap.exists?snap.data()||{}:null;
 if(!remote||remote.portalType!=='player'||remote.playerName!==player.name)return{ok:false,message:'HotB could not verify this player’s existing permanent portal.'};
 return{ok:true,player,remote};
}
async function observationPublishDirect({observation={},drills=[]}={}){
 const api=window.HotBCoachObservations,playerName=String(observation.playerName||'').trim(),ready=await observationPublishPreflight({playerName});
 if(!ready.ok)return ready;
 const player=ready.player,g=currentGame(),focusMode=observation.mode==='focus';
 if(!api||(!focusMode&&!g))return{ok:false,message:'HotB could not find the observation source.'};
 const payload={playerName,paId:String(observation.paId||''),tags:[...new Set(observation.tags||[])].slice(0,3),note:String(observation.note||'').trim()};
 if(!payload.tags.length&&!payload.note)return{ok:false,message:'Add an observation or note before publishing.'};
 let record=null,tempGameIndex=-1,tempGameOriginal=null,previousFocusPlayer=practiceFocusPlayer;
 const restoreGame=()=>{if(tempGameIndex<0)return;if(tempGameOriginal)db.savedGames[tempGameIndex]=tempGameOriginal;else db.savedGames.splice(tempGameIndex,1);tempGameIndex=-1;tempGameOriginal=null};
 const clearPublishedGameObservation=()=>{if(focusMode||!g)return;const matches=item=>item&&(record?.id?item.id===record.id:false||((payload.paId&&item.paId===payload.paId)||(!payload.paId&&!item.paId&&item.playerName===playerName)));g.observations=(g.observations||[]).filter(item=>!matches(item));(db.savedGames||[]).forEach(game=>{if(game?.id===g.id)game.observations=(game.observations||[]).filter(item=>!matches(item))})};
 try{
  if(focusMode){
   const pending=observationPublishPending&&observationPublishPending.mode==='focus'&&observationPublishPending.playerName===playerName?(db.coachObservations||[]).find(item=>item.id===observationPublishPending.id):null;
   if(pending){api.updateRecord(pending,{...payload,observedAt:pending.observedAt||new Date().toISOString()});record=pending}else{record=api.saveStandalone(db.coachObservations,{...payload,observedAt:new Date().toISOString()});observationPublishPending={mode:'focus',playerName,id:record.id}}
  }else{
   record=api.saveObservation(g,payload);observationPublishPending={mode:'game',playerName,id:record.id,gameId:g.id};
   const existingGameIndex=(db.savedGames||[]).findIndex(item=>item.id===g.id);
   if(existingGameIndex>=0){tempGameIndex=existingGameIndex;tempGameOriginal=db.savedGames[existingGameIndex];db.savedGames[existingGameIndex]=g}else{tempGameIndex=db.savedGames.length;db.savedGames.push(g)}
  }
  practiceFocusPlayer=playerName;let focus=playerFocusPortalPayload();if(!focus)throw new Error('HotB could not build Player Focus from this observation.');
  focus={...focus,drills:[...new Set((drills||[]).map(name=>String(name||'').trim()).filter(Boolean))].slice(0,3),publishedAt:new Date().toISOString()};
  restoreGame();practiceFocusPlayer=previousFocusPlayer;
  const snap=await portalDoc(player.portalId).get(),remote=snap.exists?snap.data()||{}:{},remoteArchive=Array.isArray(remote.focusArchive)?remote.focusArchive.slice():[];
  if(remote.focus?.publishedAt&&!remoteArchive.some(item=>item?.publishedAt===remote.focus.publishedAt))remoteArchive.push({...remote.focus,archivedAt:new Date().toISOString(),archiveReason:'replaced'});
  await portalDoc(player.portalId).set({focus,focusArchive:remoteArchive,focusOpenedPublishedAt:firebase.firestore.FieldValue.delete(),focusOpenedAt:firebase.firestore.FieldValue.delete(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
  const localArchive=playerFocusArchive(player.name);if(!localArchive.some(item=>item?.publishedAt===focus.publishedAt))localArchive.push(structuredClone(focus));
  if(!db.playerFocusLastReviewed||typeof db.playerFocusLastReviewed!=='object'||Array.isArray(db.playerFocusLastReviewed))db.playerFocusLastReviewed={};db.playerFocusLastReviewed[player.name]=focus.publishedAt;
  if(!db.playerFocusOpened||typeof db.playerFocusOpened!=='object'||Array.isArray(db.playerFocusOpened))db.playerFocusOpened={};delete db.playerFocusOpened[player.name];
  db.coachObservations=(db.coachObservations||[]).filter(item=>!(item?.source==='player-focus'&&item.playerName===player.name));
  Object.keys(db.playerFocusDrillOverrides||{}).filter(key=>key.startsWith(player.name+'::')).forEach(key=>delete db.playerFocusDrillOverrides[key]);
  clearPublishedGameObservation();
  observationTargetPaId='';observationTargetPlayer='';observationFromInningPrompt=false;
  save();observationPublishPending=null;modal=null;render();return{ok:true,playerName:player.name,publishedAt:focus.publishedAt};
 }catch(error){restoreGame();practiceFocusPlayer=previousFocusPlayer;try{save()}catch(_){}return{ok:false,message:String(error?.message||'Player Focus could not be published. Check Cloud Backup and your internet connection.')}}
}
window.HotBObservationPublishBridge={preflight:observationPublishPreflight,publish:observationPublishDirect};
function bindCoachObservation(){
 const g=currentGame(),api=window.HotBCoachObservations,focusMode=observationMode==='focus',manageMode=observationMode==='manage';if(!api||(!focusMode&&!manageMode&&!g))return;
 if(!manageMode&&window.HotBObservationPublish){
  const existing=focusMode?null:api.observationFor(g,observationTargetPaId,observationTargetPlayer),tags=existing?.tags||[],note=existing?.note||'';
  const suggested=focusSuggestedDrills(tags.join(' '),observationTargetPlayer,practiceFocusRange).map(drill=>drill.name);
  window.HotBObservationPublish.begin({mode:focusMode?'focus':'game',playerName:observationTargetPlayer,paId:observationTargetPaId,tags,note,inning:Number(g?.inning)||0,fromInningPrompt:observationFromInningPrompt},suggested);
  queueMicrotask(()=>window.HotBObservationPublish?.mount(document));
 }`;
 return source.replace(needle,replacement);
}

async function patchCoachBundle(request,response){
 const pathname=new URL(request.url).pathname;if(!pathname.endsWith('/app-coach-rebels-portals-v10.js')||!response.ok)return response;
 try{let source=await response.text();const receiptNeedle="if(!selected){queueMicrotask(refreshPlayerFocusOpenedReceipts);return `${practiceSectionHeader('Player Focus')}";const receiptReplacement="if(!selected){queueMicrotask(refreshPlayerFocusOpenedReceipts);clearTimeout(window.__hotbFocusReceiptTimer);window.__hotbFocusReceiptTimer=setTimeout(()=>{if(route==='practice'&&practiceScreen==='player-focus'&&!practiceFocusPlayer){playerFocusReceiptRefreshStarted=false;refreshPlayerFocusOpenedReceipts()}},4000);return `${practiceSectionHeader('Player Focus')}";if(source.includes(receiptNeedle))source=source.replace(receiptNeedle,receiptReplacement);const dashboardBuildPractice="+(analysis.mode==='development'?'<button class=\"dash-action\" style=\"width:100%;margin-top:12px;background:#111827!important;color:#fff!important;border:1.5px solid #111827!important\" data-team-focus-build>Build Practice</button>':'')+";if(source.includes(dashboardBuildPractice))source=source.replace(dashboardBuildPractice,'+');source=patchObservationPublishBridge(source);const headers=new Headers(response.headers);headers.delete('content-length');headers.delete('content-encoding');headers.delete('etag');return new Response(source,{status:response.status,statusText:response.statusText,headers})}catch(_){return response}}
async function newestAsset(request){const cache=await caches.open(CACHE_NAME);try{let response=await fetch(request,{cache:'no-store'});response=await patchCoachBundle(request,response);if(response.ok){await cache.put(request,response.clone());const pathname=new URL(request.url).pathname,corePattern=VERSIONED_CORE_PATTERNS.find(pattern=>pattern.test(pathname));if(corePattern){const aliasUrl=new URL(request.url);aliasUrl.search='';await cache.put(new Request(aliasUrl.href),response.clone())}}return response}catch(_){const exact=await cache.match(request);if(exact)return exact;const pathname=new URL(request.url).pathname;if(VERSIONED_CORE_PATTERNS.some(pattern=>pattern.test(pathname))){const aliasUrl=new URL(request.url);aliasUrl.search='';return(await cache.match(new Request(aliasUrl.href)))||Response.error()}return Response.error()}}
self.addEventListener('fetch',event=>{const request=event.request;if(request.method!=='GET')return;const url=new URL(request.url);if(url.origin!==self.location.origin)return;if(request.mode==='navigate'&&url.searchParams.has('portal'))return event.respondWith(fetch(request,{cache:'no-store'}));if(request.mode==='navigate'){if(!url.searchParams.has('portal')&&(url.searchParams.get('source')==='pwa'||url.pathname.endsWith('/hotb-fresh.html'))){const canonicalUrl=new URL(CANONICAL_LAUNCH,self.location.href),canonical=new Request(canonicalUrl.href,{cache:'no-store'});return event.respondWith(newestNavigation(canonical))}if(url.pathname.endsWith('/hotb-fresh.html')){const canonical=new Request(new URL('./index.html',self.location.href).href,{cache:'no-store'});return event.respondWith(newestNavigation(canonical))}return event.respondWith(newestNavigation(request))}if(['script','style','worker'].includes(request.destination))event.respondWith(newestAsset(request))});
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting()});