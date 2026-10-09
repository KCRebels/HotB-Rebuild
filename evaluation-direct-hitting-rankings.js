(()=>{
 const app=document.querySelector('#app');
 if(!app)return;

 // Do not touch #evalSelect. The coach app owns player selection and the full
 // Evaluation rerender. Any helper interception here can mix one player's
 // header with another player's metrics.

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

 // Summary cards only: forward a card tap to the native ALL ranking control.
 // This does not calculate, rename, move, or rewrite any Evaluation metric.
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