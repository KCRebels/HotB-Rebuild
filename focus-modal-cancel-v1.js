/* Empty Add Observation -> Close is a true cancel, then recompute the same Player Focus range. */
(()=>{
 let armed=false,range='weekend',scrollY=0;
 function arm(){const add=document.getElementById('addFocusObservation');if(!add||add.dataset.cancelGuard==='2')return;add.dataset.cancelGuard='2';add.addEventListener('click',()=>{armed=true;range=document.querySelector('[data-focus-range].active')?.dataset.focusRange||'weekend';scrollY=window.scrollY},true)}
 document.addEventListener('click',e=>{
  if(e.target.closest('[data-observation-publish-action],#saveCoachObservation')){armed=false;return}
  const close=e.target.closest('[data-close]');if(!close||!armed)return;
  const modal=close.closest('.modal')||document;
  const hasTags=!!modal.querySelector('.observation-option.active'),hasNote=!!String(modal.querySelector('#observationNote')?.value||'').trim();
  if(hasTags||hasNote){armed=false;return}
  armed=false;try{window.HotBObservationPublish?.reset()}catch(_){}
  setTimeout(()=>{const target=document.querySelector(`[data-focus-range="${range}"]`);if(target){target.click();setTimeout(()=>window.scrollTo(0,scrollY),0)}arm()},25)
 },true);
 new MutationObserver(arm).observe(document.documentElement,{childList:true,subtree:true});addEventListener('load',arm);
})();
