/* Preserve Player Focus review when Add Observation is opened and closed without saving. */
(()=>{
 const KEY='hotbRebuildDbV1';let snapshot=null,closing=false;
 const read=()=>{try{return localStorage.getItem(KEY)||''}catch(_){return''}};
 const write=s=>{try{if(s!==null)localStorage.setItem(KEY,s)}catch(_){}};
 function arm(){const add=document.getElementById('addFocusObservation');if(!add||add.dataset.cancelGuard==='1')return;add.dataset.cancelGuard='1';add.addEventListener('click',()=>{const active=document.querySelector('[data-focus-range].active');snapshot={db:read(),range:active?.dataset.focusRange||'weekend',scrollY:window.scrollY};},true)}
 function cancelClose(e){const close=e.target.closest('[data-close]');if(!close||!snapshot||closing)return;const save=document.getElementById('saveCoachObservation');if(!save)return;closing=true;e.preventDefault();e.stopImmediatePropagation();write(snapshot.db);const range=snapshot.range,y=snapshot.scrollY;snapshot=null;close.click();setTimeout(()=>{const target=document.querySelector(`[data-focus-range="${range}"]`),active=document.querySelector('[data-focus-range].active');if(target&&active!==target)target.click();requestAnimationFrame(()=>window.scrollTo(0,y));closing=false;arm()},0)}
 document.addEventListener('click',cancelClose,true);
 document.addEventListener('click',e=>{if(e.target.closest('#saveCoachObservation'))snapshot=null;setTimeout(arm,0)},true);
 new MutationObserver(arm).observe(document.documentElement,{childList:true,subtree:true});addEventListener('load',arm);
})();
