(()=>{
const DBKEY='hotb_rebuild_v1';
const readDb=()=>{try{return JSON.parse(localStorage.getItem(DBKEY)||'{}')||{}}catch(_){return{}}};
function enhance(modal){
 if(modal.dataset.hotbPublish==='1')return;
 const button=modal.querySelector('#saveCoachObservation');
 if(!button||/update observation/i.test(button.textContent||''))return;
 modal.dataset.hotbPublish='1';
 button.textContent='Publish to Player Focus';
 button.classList.remove('black');button.classList.add('red');
 button.addEventListener('click',()=>{
  const active=modal.querySelector('[data-observation-player].active');
  const locked=modal.querySelector('.observation-player-locked strong');
  const playerName=active?.dataset.observationPlayer||locked?.textContent?.trim()||'';
  const tags=[...modal.querySelectorAll('.observation-option.active')].map(item=>item.dataset.observationOption).filter(Boolean);
  const note=modal.querySelector('#observationNote')?.value?.trim()||'';
  if(!playerName||(!tags.length&&!note))return;
  sessionStorage.setItem('hotbObservationPublishPending',JSON.stringify({playerName,tags,note,createdAt:Date.now()}));
 },true);
}
const observer=new MutationObserver(()=>document.querySelectorAll('.observation-modal').forEach(enhance));
observer.observe(document.documentElement,{childList:true,subtree:true});
document.querySelectorAll('.observation-modal').forEach(enhance);
})();
