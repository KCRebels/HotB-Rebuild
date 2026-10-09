/* Player-side Player Focus opened receipt. */
(()=>{
 const portalId=new URLSearchParams(location.search).get('portal');if(!portalId)return;
 let busy=false,pending=false;
 const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 async function record(){
  if(busy){pending=true;return}busy=true;
  try{
   const fb=window.firebase;
   for(let attempt=0;attempt<20;attempt++){
    const store=fb?.firestore?.(),user=fb?.auth?.().currentUser;
    if(store&&user){
     const ref=store.collection('playerPortals').doc(portalId),snap=await ref.get();
     if(!snap.exists)return;
     const data=snap.data()||{},published=data.focus?.publishedAt;
     if(!published)return;
     const openedAt=new Date().toISOString();
     await ref.update({focusOpenedPublishedAt:published,focusOpenedAt:openedAt,updatedAt:fb.firestore.FieldValue.serverTimestamp()});
     return;
    }
    await wait(250);
   }
   console.error('HotB could not record Player Focus opened receipt because portal authentication was not ready.');
  }catch(error){console.error('HotB could not record Player Focus opened receipt.',error)}finally{busy=false;if(pending){pending=false;setTimeout(record,100)}}
 }
 function focusVisible(){
  const focusButton=document.querySelector('[data-portal-view="focus"]');
  return !!focusButton&&(focusButton.getAttribute('aria-current')==='page'||document.body.textContent.includes('MY FOCUS'));
 }
 document.addEventListener('click',event=>{if(event.target?.closest?.('[data-portal-view="focus"]'))setTimeout(record,150)},true);
 addEventListener('pageshow',()=>{if(focusVisible())setTimeout(record,300)});
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&focusVisible())setTimeout(record,300)});
})();
