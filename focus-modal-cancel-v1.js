/* Preserve the selected Player Focus review state when Add Observation is opened and closed without saving. */
(()=>{
 let snapshot=null;
 const capture=()=>{
  const add=document.getElementById('addFocusObservation');
  if(!add||add.dataset.cancelGuard==='1')return;
  add.dataset.cancelGuard='1';
  add.addEventListener('click',()=>{
   const active=document.querySelector('[data-focus-range].active');
   snapshot={range:active?.dataset.focusRange||null,scrollY:window.scrollY};
  },true);
 };
 const restore=()=>{
  if(!snapshot)return;
  const modal=document.querySelector('.modal-backdrop');
  if(modal)return;
  if(snapshot.range){const target=document.querySelector(`[data-focus-range="${snapshot.range}"]`),active=document.querySelector('[data-focus-range].active');if(target&&active!==target)target.click()}
  const y=snapshot.scrollY;snapshot=null;requestAnimationFrame(()=>window.scrollTo(0,y));
 };
 document.addEventListener('click',e=>{
  const close=e.target.closest('[data-close]');
  if(close&&snapshot)setTimeout(restore,0);
  setTimeout(capture,0);
 },true);
 new MutationObserver(capture).observe(document.documentElement,{childList:true,subtree:true});
 addEventListener('load',capture);
})();
