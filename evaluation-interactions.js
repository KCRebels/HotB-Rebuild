(()=>{
 const grade=(value,metric)=>{
  if(!Number.isFinite(value))return'';
  if(metric==='AVG')return value>=.4?'excellent':value>=.35?'good':value>=.3?'acceptable':value>=.25?'concern':'serious';
  if(metric==='OBP')return value>=.475?'excellent':value>=.425?'good':value>=.375?'acceptable':value>=.325?'concern':'serious';
  if(metric==='SLG')return value>=.6?'excellent':value>=.5?'good':value>=.4?'acceptable':value>=.325?'concern':'serious';
  if(metric==='CONTACT')return value>=90?'excellent':value>=85?'good':value>=80?'acceptable':value>=75?'concern':'serious';
  if(metric==='K%')return value<10?'excellent':value<=15?'good':value<=20?'acceptable':value<=25?'concern':'serious';
  return'';
 };
 function restoreColors(){
  document.querySelectorAll('.eval-app .perf').forEach(card=>{
   const metric=String(card.querySelector('.perf-metric')?.textContent||'').trim().toUpperCase();
   const text=String(card.querySelector(':scope>b')?.textContent||'').trim();
   let value=Number(text.replace('%',''));
   if(['AVG','OBP','SLG'].includes(metric))value=Number(text);
   ['excellent','good','acceptable','concern','serious'].forEach(name=>card.classList.remove(name));
   const rating=grade(value,metric);if(rating)card.classList.add(rating);
  });
 }
 function refresh(){requestAnimationFrame(restoreColors)}
 document.addEventListener('click',event=>{
  // HotB and hitting VALUES replace the hidden ALL controls.
  const result=event.target.closest('.eval-app .eval-tile>.value,.eval-app .perf>b');
  if(!result)return;
  const control=result.closest('.eval-tile')?.querySelector('.metric-all')||result.closest('.perf')?.querySelector('.perf-all');
  if(!control)return;
  event.preventDefault();event.stopPropagation();
  // Native app.js already bound this control to the correct ranking modal.
  control.click();
 });
 const observer=new MutationObserver(refresh);
 observer.observe(document.documentElement,{childList:true,subtree:true});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh);else refresh();
})();
