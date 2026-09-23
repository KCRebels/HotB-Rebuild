(()=>{
 'use strict';
 // Temporary, reversible scouting pause. No recruiting data is read or changed.
 function mount(){
  const app=document.querySelector('#app .eval-app');
  if(!app)return;
  const anchor=app.querySelector('.player-card.player-profile');
  if(!anchor||app.querySelector('#rwRecruitingSection'))return;
  const section=document.createElement('section');
  section.id='rwRecruitingSection';section.className='rw-recruiting';
  section.innerHTML='<div class="rw-section-head"><h2>Scouting reports</h2></div><div class="rw-buttons"><button type="button" disabled aria-disabled="true">Profile — Paused</button><button type="button" disabled aria-disabled="true">Email — Paused</button><button type="button" disabled aria-disabled="true">Text — Paused</button></div>';
  section.querySelectorAll('button').forEach(button=>{button.style.opacity='.45';button.style.cursor='not-allowed'});
  anchor.insertAdjacentElement('afterend',section);
 }
 const root=document.getElementById('app');
 if(root)new MutationObserver(records=>{
  // Main app replaces the direct root children on navigation and popup updates.
  if(records.some(record=>record.target===root))mount();
 }).observe(root,{childList:true});
 document.addEventListener('change',event=>{if(event.target?.id==='evalSelect')queueMicrotask(mount)});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
