(()=>{
 // Preserve the app's original title behavior. HotB and Hitting titles already
 // use the built-in dark guide modals; Pitching/Athletic titles get no extra definitions.
 function hiddenRankingButtonFor(result){
  const tile=result.closest('.eval-tile');
  if(tile)return tile.querySelector('.metric-all');
  const perf=result.closest('.perf');
  if(perf)return perf.querySelector('.perf-all');
  return null;
 }
 document.addEventListener('click',event=>{
  // HotB-row and Hitting result values replace the old visible ALL buttons.
  const result=event.target.closest('.eval-app .eval-tile>.value,.eval-app .perf>b');
  if(!result)return;
  const ranking=hiddenRankingButtonFor(result);
  if(ranking){
   event.preventDefault();
   event.stopPropagation();
   ranking.click();
  }
  // Pitching cards are already buttons with data-pitch-ranking, so their
  // normal click behavior is intentionally left untouched.
 },true);
})();
