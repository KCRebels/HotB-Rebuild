/* Player-side Player Focus opened receipt. */
(()=>{
 const portalId=new URLSearchParams(location.search).get('portal');if(!portalId)return;
 let busy=false;
 async function record(){
  if(busy)return;busy=true;
  try{
   const fb=window.firebase,store=fb?.firestore?.();if(!store){setTimeout(()=>{busy=false;record()},300);return}
   const ref=store.collection('playerPortals').doc(portalId),snap=await ref.get();if(!snap.exists)return;
   const data=snap.data()||{},published=data.focus?.publishedAt;if(!published)return;
   const openedAt=new Date().toISOString();
   await ref.set({focusOpenedPublishedAt:published,focusOpenedAt:openedAt,updatedAt:fb.firestore.FieldValue.serverTimestamp()},{merge:true});
  }catch(error){console.error('HotB could not record Player Focus opened receipt.',error)}finally{busy=false}
 }
 document.addEventListener('click',event=>{if(event.target?.closest?.('[data-portal-view="focus"]'))setTimeout(record,0)},true);
})();
