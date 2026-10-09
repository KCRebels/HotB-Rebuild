/* Player-side Player Focus opened receipt. */
(()=>{
 const portalId=new URLSearchParams(location.search).get('portal');if(!portalId)return;
 let busy=false,pending=false;
 const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 async function ready(){
  for(let attempt=0;attempt<40;attempt++){
   const fb=window.firebase,store=fb?.firestore?.(),auth=fb?.auth?.();
   if(store&&auth){
    if(auth.currentUser)return {fb,store,user:auth.currentUser};
    await new Promise(resolve=>{let done=false,off;const finish=()=>{if(done)return;done=true;try{off?.()}catch(_){}resolve()};try{off=auth.onAuthStateChanged(()=>finish(),()=>finish())}catch(_){finish()}setTimeout(finish,250)});
    if(auth.currentUser)return {fb,store,user:auth.currentUser};
   }
   await wait(250);
  }
  return null;
 }
 async function record(){
  if(busy){pending=true;return}busy=true;
  try{
   const ctx=await ready();if(!ctx)throw new Error('portal authentication was not ready');
   const {store}=ctx,ref=store.collection('playerPortals').doc(portalId),snap=await ref.get();
   if(!snap.exists)return;
   const data=snap.data()||{},published=data.focus?.publishedAt;if(!published)return;
   const openedAt=new Date().toISOString();
   /* Keep this update to the exact fields allowed by the player receipt rule. */
   await ref.update({focusOpenedPublishedAt:published,focusOpenedAt:openedAt});
   const verify=await ref.get(),saved=verify.data()||{};
   if(String(saved.focusOpenedPublishedAt||'')!==String(published)||!saved.focusOpenedAt)throw new Error('opened receipt did not persist');
  }catch(error){console.error('HotB could not record Player Focus opened receipt.',error)}finally{busy=false;if(pending){pending=false;setTimeout(record,100)}}
 }
 document.addEventListener('click',event=>{if(event.target?.closest?.('[data-portal-view="focus"]'))setTimeout(record,100)},true);
 addEventListener('pageshow',()=>setTimeout(record,500));
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')setTimeout(record,500)});
})();
