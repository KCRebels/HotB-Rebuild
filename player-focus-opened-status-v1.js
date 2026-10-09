/* Coach-side Player Focus opened-status refresh. */
(()=>{
 const KEY='hotbRebuildDbV1';let busy=false,lastRun=0;
 const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(_){return{}}};
 const write=db=>{try{localStorage.setItem(KEY,JSON.stringify(db))}catch(_){}};
 const ms=v=>{try{if(v?.toDate)return v.toDate().getTime();if(v instanceof Date)return v.getTime();if(typeof v==='number')return v;return Date.parse(v||0)||0}catch(_){return 0}};
 async function refresh(){
  const now=Date.now();if(busy||now-lastRun<1500)return;lastRun=now;
  if(!document.querySelector('.practice-focus-roster'))return;
  const store=window.firebase?.firestore?.();if(!store)return;
  const db=read(),players=(db.roster||[]).filter(p=>p&&!p.isGuest&&!p.isTeamJenkins&&p.portalId&&db.playerFocusLastReviewed?.[p.name]);
  if(!players.length)return;busy=true;let changed=false;
  try{
   if(!db.playerFocusOpened||typeof db.playerFocusOpened!=='object'||Array.isArray(db.playerFocusOpened))db.playerFocusOpened={};
   for(const p of players){
    try{
     const snap=await store.collection('playerPortals').doc(p.portalId).get();if(!snap.exists)continue;
     const remote=snap.data()||{},localPublished=String(db.playerFocusLastReviewed[p.name]||''),remotePublished=String(remote.focus?.publishedAt||''),openedPublished=String(remote.focusOpenedPublishedAt||''),opened=ms(remote.focusOpenedAt);
     /* The portal receipt is authoritative for whether the currently published remote Focus was opened.
        The coach's local published key can use a different timestamp representation, so do not require
        those two representations to be text-identical. */
     if(!localPublished||!remotePublished||openedPublished!==remotePublished||!opened)continue;
     const current=ms(db.playerFocusOpened[p.name]?.openedAt);
     if(opened>current||String(db.playerFocusOpened[p.name]?.publishedAt||'')!==localPublished){db.playerFocusOpened[p.name]={publishedAt:localPublished,openedAt:new Date(opened).toISOString()};changed=true}
    }catch(_){}
   }
   if(changed){write(db);location.reload()}
  }finally{busy=false}
 }
 const queue=()=>setTimeout(refresh,50);
 addEventListener('load',queue);addEventListener('pageshow',queue);document.addEventListener('click',queue);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')queue()});
 new MutationObserver(queue).observe(document.documentElement,{childList:true,subtree:true});
})();
