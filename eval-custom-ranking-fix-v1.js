/* Narrow Evals fix: AVG, OBP, K% and CONTACT ALL buttons must open rankings after Custom Dates re-render. */
(()=>{
 const allowed=new Set(['AVG','OBP','kPct','contactPct']);
 document.addEventListener('click',event=>{
  const button=event.target?.closest?.('[data-hitting-ranking]');
  if(!button)return;
  const metric=button.dataset.hittingRanking;
  if(!allowed.has(metric))return;
  event.preventDefault();
  event.stopImmediatePropagation();
  /* Use the app's existing modal route and existing hittingRankingModal. The native
     ranking function already uses filteredPAs(), so Custom Dates remain authoritative. */
  const app=document.getElementById('app');
  if(!app)return;
  /* Native click binding is installed during render. Re-dispatch through the exact
     working modal trigger contract by temporarily mirroring a click on a fresh button. */
  const native=[...document.querySelectorAll('[data-hitting-ranking]')].find(el=>el!==button&&el.dataset.hittingRanking===metric&&typeof el.onclick==='function');
  if(native){native.onclick.call(button,event);return}
  /* If this is the only tile for the metric, let a zero-delay second click reach the
     app after bind() has completed. Guard prevents recursion. */
  if(button.dataset.customRankRetry==='1')return;
  button.dataset.customRankRetry='1';
  setTimeout(()=>{delete button.dataset.customRankRetry;button.click()},0);
 },true);
})();