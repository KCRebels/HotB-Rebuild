/* Coach-side Player Focus opened-status refresh. */
(()=>{
 const KEY='hotbRebuildDbV1';let busy=false,lastRun=0;
 const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(_){return{}}};
 const write=db=>{try{localStorage.setItem(KEY,JSON.stringify(db))}catch(_){}};
 const ms=v=>{try{if(v?.toDate)return v.toDate().getTime();if(v instanceof Date)return v.getTime();if(typeof v==='number')return v;return Date.parse(v||0)||0}catch(_){return 0}};
 const norm=v=>String(v||'').trim().toLowerCase().replace(/[^a-z0-9]/g,'');
 async function refresh(){
  const now=Date.now();if(busy||now-lastRun<1500)return;lastRun=now;
  if(!document.querySelector('.practice-focus-roster'))return;
  const store=window.firebase?.firestore?.();if(!store)return;
  const db=read(),players=(db.roster||[]).filter(p=>p&&!p.isGuest&&!p.isTeamJenkins&&db.playerFocusLastReviewed?.[p.name]);
  if(!players.length)return;busy=true;let changed=false;
  try{
   if(!db.playerFocusOpened||typeof db.playerFocusOpened!=='object'||Array.isArray(db.playerFocusOpened))db.playerFocusOpened={};
   /* Read the coach-authorized portal collection once. This deliberately does not depend on the
      coach device having the same portalId cached in its local roster as the permanent portal. */
   const all=await store.collection('playerPortals').get(),docs=[];
   all.forEach(s=>{if(s.exists)docs.push({id:s.id,data:s.data()||{}})});
   for(const p of players){
    try{
     const wanted=norm(p.name),candidates=docs.filter(x=>x.data.portalType==='player'&&(x.id===p.portalId||norm(x.data.playerName)===wanted||norm(x.data.name)===wanted||norm(x.data.player)===wanted));
     /* Prefer a portal that actually contains an opened receipt for its current Focus. */
     const hit=candidates.find(x=>{const d=x.data,remotePublished=String(d.focus?.publishedAt||''),openedPublished=String(d.focusOpenedPublishedAt||'');return remotePublished&&openedPublished===remotePublished&&ms(d.focusOpenedAt)})||candidates[0];
     if(!hit)continue;
     const remote=hit.data,localPublished=String(db.playerFocusLastReviewed[p.name]||''),remotePublished=String(remote.focus?.publishedAt||''),openedPublished=String(remote.focusOpenedPublishedAt||''),opened=ms(remote.focusOpenedAt);
     if(!localPublished||!remotePublished||openedPublished!==remotePublished||!opened)continue;
     const current=ms(db.playerFocusOpened[p.name]?.openedAt);
     if(opened>current||String(db.playerFocusOpened[p.name]?.publishedAt||'')!==localPublished){db.playerFocusOpened[p.name]={publishedAt:localPublished,openedAt:new Date(opened).toISOString()};changed=true}
    }catch(_){}
   }
   if(changed){write(db);location.reload()}
  }catch(error){console.error('HotB could not refresh Player Focus opened receipts.',error)}finally{busy=false}
 }
 const queue=()=>setTimeout(refresh,50);
 addEventListener('load',queue);addEventListener('pageshow',queue);document.addEventListener('click',queue);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')queue()});
 new MutationObserver(queue).observe(document.documentElement,{childList:true,subtree:true});
})();
