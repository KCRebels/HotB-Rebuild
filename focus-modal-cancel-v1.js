/* Empty Add Observation -> Close is a true cancel. Preserve the Player Focus analysis already on screen. */
(()=>{
 let armed=false,scrollY=0,snapshot=null;
 const sectionByTitle=title=>[...document.querySelectorAll('.focus-evidence-section')].find(s=>s.querySelector('h3')?.textContent.trim()===title)||null;
 function capture(){
  const hotb=sectionByTitle('What HotB Detects'),drills=sectionByTitle('Suggested Drills');
  snapshot={hotb:hotb?.innerHTML||'',drills:drills?.innerHTML||''};
 }
 function restore(){
  if(!snapshot)return;
  const hotb=sectionByTitle('What HotB Detects'),drills=sectionByTitle('Suggested Drills');
  if(hotb&&snapshot.hotb)hotb.innerHTML=snapshot.hotb;
  if(drills&&snapshot.drills)drills.innerHTML=snapshot.drills;
  requestAnimationFrame(()=>window.scrollTo(0,scrollY));
  snapshot=null;
 }
 function arm(){const add=document.getElementById('addFocusObservation');if(!add||add.dataset.cancelGuard==='3')return;add.dataset.cancelGuard='3';add.addEventListener('click',()=>{armed=true;scrollY=window.scrollY;capture()},true)}
 document.addEventListener('click',e=>{
  if(e.target.closest('[data-observation-publish-action],#saveCoachObservation')){armed=false;snapshot=null;return}
  const close=e.target.closest('[data-close]');if(!close||!armed)return;
  const modal=close.closest('.modal')||document;
  const hasTags=!!modal.querySelector('.observation-option.active'),hasNote=!!String(modal.querySelector('#observationNote')?.value||'').trim();
  if(hasTags||hasNote){armed=false;snapshot=null;return}
  armed=false;try{window.HotBObservationPublish?.reset()}catch(_){}
  setTimeout(()=>{restore();arm()},25)
 },true);
 new MutationObserver(arm).observe(document.documentElement,{childList:true,subtree:true});addEventListener('load',arm);
})();
