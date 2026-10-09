(()=>{
 const app=document.querySelector('#app');
 if(!app)return;

 function wirePitchControls(){
  document.querySelectorAll('.eval-app .pitcher-stat[data-pitch-ranking]').forEach(card=>{
   card.onpointerup=event=>{
    if(typeof card.onclick!=='function')return;
    event.preventDefault();
    event.stopPropagation();
    card.onclick.call(card,event);
   };
  });
 }

 // The coach app owns the Evaluation player state. On some cached builds an older
 // ranking helper could interfere before the select's native onchange completed.
 // Run that existing native handler exactly once, before any helper/bubble listeners.
 app.addEventListener('change',event=>{
  const target=event.target instanceof Element?event.target:null;
  if(!target)return;
  if(target.id==='evalSelect'){
   const nativeHandler=target.onchange;
   if(typeof nativeHandler==='function'){
    event.stopImmediatePropagation();
    nativeHandler.call(target,event);
    setTimeout(wirePitchControls,0);
   }
   return;
  }
  if(['evalCustomStart','evalCustomEnd'].includes(target.id))setTimeout(wirePitchControls,0);
 },true);

 // HotB+, RP, and HP/Reach use the app's own full-roster ranking modal. Clicking
 // anywhere on the summary tile (except its guide title) forwards to its native ALL control.
 app.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;
  if(!target)return;
  const tile=target.closest('.eval-app .eval-tile');
  if(tile&&!target.closest('.metric-title,[data-ranking]')){
   const ranking=tile.querySelector('[data-ranking]');
   if(ranking&&typeof ranking.onclick==='function'){
    event.preventDefault();
    event.stopPropagation();
    ranking.onclick.call(ranking,event);
    return;
   }
  }
  if(target.closest('[data-go],[data-range],[data-custom-range],[data-date-filter],[data-close]'))setTimeout(wirePitchControls,0);
 },true);

 wirePitchControls();
})();