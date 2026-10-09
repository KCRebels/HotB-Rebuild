/* Narrow Evals fix only: AVG, OBP, K% and CONTACT labels open the app's existing ordered roster ranking. HHB/ABA untouched. */
(()=>{
 const labels=new Set(['AVG','OBP','K%','CONTACT']);
 document.addEventListener('click',event=>{
  const metric=event.target?.closest?.('.eval-app .perf-metric');
  if(!metric)return;
  const label=String(metric.textContent||'').trim().toUpperCase();
  if(!labels.has(label))return;
  const all=metric.closest('.perf')?.querySelector('[data-hitting-ranking]');
  if(!all)return;
  event.preventDefault();
  event.stopImmediatePropagation();
  /* The native ALL handler is bound by HotB after each render and already uses filteredPAs(), including Custom Dates. */
  if(typeof all.onclick==='function')all.onclick.call(all,event);
  else all.click();
 },true);
})();