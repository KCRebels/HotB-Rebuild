/* Evals: clicking AVG, OBP, K% or CONTACT opens the native full-roster ranking. */
(()=>{
 const labels=new Set(['AVG','OBP','K%','CONTACT']);
 document.addEventListener('click',event=>{
  const tile=event.target?.closest?.('.eval-app .perf');
  if(!tile)return;
  const label=String(tile.querySelector('.perf-metric')?.textContent||'').trim().toUpperCase();
  if(!labels.has(label))return;
  const rankingButton=tile.querySelector('[data-hitting-ranking]');
  if(!rankingButton||typeof rankingButton.onclick!=='function')return;
  event.preventDefault();
  event.stopImmediatePropagation();
  rankingButton.onclick.call(rankingButton,event);
 },true);
})();