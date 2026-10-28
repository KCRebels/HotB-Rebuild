(()=> {
 const BUILD_VERSION='2026.10.28.686';window.HOTB_BUILD_VERSION=BUILD_VERSION;const params=new URLSearchParams(location.search);
 const load=(tag,attrs)=>{const e=document.createElement(tag);Object.assign(e,attrs);document.head.appendChild(e)};
 if(params.has('portal')){load('script',{src:'player-focus-opened-portal-v1.js?v=20261010-600',async:false});load('script',{src:'portal-focus-delete-exact-v2.js?v=20261010-600',async:false});load('script',{src:'player-portal-trends-approved.js?v=20261017-allplayers1',async:false});return}
 const append=Element.prototype.appendChild;
 Element.prototype.appendChild=function(node){
  try{
   if(node?.tagName==='SCRIPT'&&String(node.src||'').includes('app-coach-rebels-portals-v10.js'))node.src='app-hotb-activation-wrapper-v2.js?v=20261028-685&fresh='+Date.now();
  }catch(_){}
  return append.call(this,node);
 };
 const forceHome=()=>{try{const key='hotbRebuildDbV1',db=JSON.parse(localStorage.getItem(key)||'null');if(db&&typeof db==='object'&&db.route!=='home'){db.route='home';localStorage.setItem(key,JSON.stringify(db))}}catch(_){}};
 if(!params.has('screen'))forceHome();

 load('script',{src:'practice-time-sync-v645.js?v=20261025-651',async:false});load('script',{src:'stale-practice-clear-v648.js?v=20261025-648',async:false});load('script',{src:'practice-attendance-stability-v649.js?v=20261025-649',async:false});load('script',{src:'pitching-eval-weekend-20261018-v1.js?v=20261018-639',async:false});load('script',{src:'backup-file-restore-v1.js?v=20261018-638',async:false});load('script',{src:'practice-bypass.js?v=20261010-undo10keyfix1',async:false});load('link',{rel:'stylesheet',href:'hotb-night-fixes.css?v=20261007-1'});load('link',{rel:'stylesheet',href:'eval-ranking-bottom-fix.css?v=20261010-624'});load('link',{rel:'stylesheet',href:'focus-drill-cards-v1.css?v=20261009-580'});load('link',{rel:'stylesheet',href:'observation-publish-v2.css?v=20261009-593'});load('script',{src:'observation-publish-v2.js?v=20261008-gated-actions-1',async:false});load('script',{src:'observation-focus-persist-v1.js?v=20261009-593',async:false});load('script',{src:'practice-focus-integration.js?v=20261009-focus-practice-16',async:false});load('script',{src:'focus-page-cleanup-v1.js?v=20261009-593',async:false});load('script',{src:'focus-cloud-manage-v1.js?v=20261009-594',async:false});load('script',{src:'player-focus-archive-delete-v1.js?v=20261009-595',async:false});load('script',{src:'reports-stat-layout-v1.js?v=20261010-603',async:false});load('script',{src:'focus-modal-cancel-v1.js?v=20261009-570',async:false});load('script',{src:'player-focus-followthrough-v1.js?v=20261009-577',async:false});load('script',{src:'player-focus-opened-status-v1.js?v=20261009-583',async:false});load('script',{src:'aniesa-player-trends-preview.js?v=20261017-allplayers1',async:false});

 // 686: Team Jenkins players join the HotB hitting rotation already warmed up.
 // Their entered arrival time therefore means "ready to hit at this time" instead
 // of "begin Stretch/Tee at this time". This keeps late Jenkins arrivals from
 // creating a false live-hitter feasibility failure.
 const jenkinsNames=new Set(['Neveah Schlappi','Lilliana Schlappi','Perri Wagner','Pacie Dougherty','Emmie Wible','Taylor Woods','Amelia Steffen','Leslie Cundiff']);
 let schedulerPatchAttempts=0;
 const patchScheduler=()=>{
  const scheduler=window.HotBPracticeScheduler;
  if(!scheduler||typeof scheduler.buildSchedule!=='function'){
   if(++schedulerPatchAttempts<400)setTimeout(patchScheduler,25);
   return;
  }
  if(scheduler.__jenkinsReadyAtArrival686)return;
  const original=scheduler.buildSchedule.bind(scheduler);
  scheduler.buildSchedule=(players,startTime,durationMinutes,options)=>original((players||[]).map(player=>jenkinsNames.has(player?.name)?{...player,prePracticeComplete:true}:player),startTime,durationMinutes,options);
  scheduler.__jenkinsReadyAtArrival686=true;
 };
 patchScheduler();

 if(!('serviceWorker'in navigator)||!window.isSecureContext)return;let shown=false,accepted=sessionStorage.getItem('hotbUpdateAccepted')===BUILD_VERSION,had=!!navigator.serviceWorker.controller;function show(v='new'){if(shown||accepted)return;shown=true;const n=document.createElement('aside');n.className='pwa-update-notice';n.setAttribute('role','status');n.innerHTML='<span>New HotB version available</span><button type="button">UPDATE NOW</button>';n.querySelector('button').onclick=()=>{accepted=true;sessionStorage.setItem('hotbUpdateAccepted',BUILD_VERSION);const u=new URL('./',location.href);u.searchParams.set('source','pwa');u.searchParams.set('launch','686');u.searchParams.set('hotb-update',v);u.searchParams.set('reload',Date.now());location.replace(u.href)};document.body.appendChild(n)}async function check(r){try{await r.update()}catch(_){}if(r.waiting)show('waiting-worker')}addEventListener('load',async()=>{try{const r=await navigator.serviceWorker.register('./service-worker-v620.js',{scope:'./',updateViaCache:'none'});await check(r);r.addEventListener('updatefound',()=>r.installing?.addEventListener('statechange',()=>{if(r.installing?.state==='installed'&&navigator.serviceWorker.controller)show('installed-worker')}))}catch(_){}});navigator.serviceWorker.addEventListener('controllerchange',()=>{if(had)show('controller-changed')});
})();