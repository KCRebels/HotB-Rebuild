/* Narrow Evals fix: AVG, OBP, K% and CONTACT open the existing ordered roster ranking. */
(()=>{
 const labels=new Set(['AVG','OBP','K%','CONTACT']);
 document.addEventListener('pointerup',event=>{
  const metric=event.target?.closest?.('.eval-app .perf-metric');
  if(!metric)return;
  const label=String(metric.textContent||'').trim().toUpperCase();
  if(!labels.has(label))return;
  const all=metric.closest('.perf')?.querySelector('[data-hitting-ranking]');
  if(!all||typeof all.onclick!=='function')return;
  event.preventDefault();event.stopImmediatePropagation();all.onclick.call(all,event);
 },true);
})();