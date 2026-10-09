/* Narrow Evals fix: only AVG, OBP, K% and CONTACT result tiles open the existing ordered roster ranking. */
(()=>{
 const labels=new Set(['AVG','OBP','K%','CONTACT']);
 document.addEventListener('click',event=>{
  const tile=event.target?.closest?.('.eval-app .performance .perf');
  if(!tile)return;
  const label=String(tile.querySelector('.perf-metric')?.textContent||'').trim().toUpperCase();
  if(!labels.has(label))return;
  const all=tile.querySelector('[data-hitting-ranking]');
  if(!all||event.target?.closest?.('[data-hitting-ranking]'))return;
  if(typeof all.onclick!=='function')return;
  event.preventDefault();event.stopImmediatePropagation();all.onclick.call(all,event);
 },true);
})();