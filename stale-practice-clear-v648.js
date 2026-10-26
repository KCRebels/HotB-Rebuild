(()=>{
 const DBKEY='hotbRebuildDbV1';
 const collectPortalIds=value=>{
  const ids=new Set();
  const walk=(node,key='')=>{
   if(node==null)return;
   if(typeof node==='string'){
    if(/portalid/i.test(key)&&node.trim())ids.add(node.trim());
    return;
   }
   if(Array.isArray(node)){node.forEach(item=>walk(item,key));return;}
   if(typeof node==='object')Object.entries(node).forEach(([k,v])=>walk(v,k));
  };
  walk(value);
  return [...ids];
 };
 const getSavedDb=()=>{try{return JSON.parse(localStorage.getItem(DBKEY)||'null')}catch(_){return null}};
 const clearStalePractice=async button=>{
  const db=getSavedDb(),active=db?.activePortalPractice;
  if(!active){button.textContent='No Active Practice';button.disabled=true;return;}
  if(!window.firebase?.firestore||!window.firebase?.auth){alert('HotB is still connecting to Firebase. Reopen HotB and try again.');return;}
  const user=window.firebase.auth().currentUser;
  if(!user||user.isAnonymous){alert('HotB is not signed into the coach Firebase account yet. Reopen HotB and try again.');return;}
  const ids=collectPortalIds(active);
  button.disabled=true;button.textContent='Clearing Previous Practice…';
  try{
   const store=window.firebase.firestore();
   const batch=store.batch();
   ids.forEach(id=>batch.set(store.collection('playerPortals').doc(id),{activePractice:null,updatedAt:window.firebase.firestore.FieldValue.serverTimestamp()},{merge:true}));
   if(ids.length)await batch.commit();
   const latest=getSavedDb()||db;
   latest.activePortalPractice=null;
   localStorage.setItem(DBKEY,JSON.stringify(latest));
   button.textContent='Previous Practice Cleared';
   setTimeout(()=>location.reload(),250);
  }catch(error){
   console.error('HotB stale practice cleanup failed',error);
   button.disabled=false;button.textContent='Clear Previous Practice';
   alert('HotB could not clear the previous practice from the portals. Check the connection and try again.');
  }
 };
 const install=()=>{
  const buttons=[...document.querySelectorAll('button')];
  const button=buttons.find(el=>/Finish Active Practice First/i.test(el.textContent||''));
  if(!button||button.dataset.hotbStaleClear==='1')return;
  button.dataset.hotbStaleClear='1';
  button.disabled=false;
  button.removeAttribute('aria-disabled');
  button.classList.add('black');
  button.textContent='Clear Previous Practice';
  button.addEventListener('click',event=>{event.preventDefault();event.stopImmediatePropagation();clearStalePractice(button)} ,true);
 };
 new MutationObserver(install).observe(document.documentElement,{childList:true,subtree:true});
 addEventListener('DOMContentLoaded',install);setTimeout(install,0);
})();