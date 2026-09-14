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
 let guideScrollY=0;
 function lockGuideScroll(){
  if(document.body.dataset.evalGuideLocked==='1')return;
  guideScrollY=window.scrollY||window.pageYOffset||0;
  document.body.dataset.evalGuideLocked='1';
  document.body.style.position='fixed';
  document.body.style.top=`-${guideScrollY}px`;
  document.body.style.left='0';
  document.body.style.right='0';
  document.body.style.width='100%';
  document.body.style.overflow='hidden';
 }
 function unlockGuideScroll(){
  if(document.body.dataset.evalGuideLocked!=='1')return;
  delete document.body.dataset.evalGuideLocked;
  document.body.style.position='';
  document.body.style.top='';
  document.body.style.left='';
  document.body.style.right='';
  document.body.style.width='';
  document.body.style.overflow='';
  window.scrollTo(0,guideScrollY);
 }
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
 function nativeControlFor(result){
  return result.closest('.eval-tile')?.querySelector('.metric-all')||result.closest('.perf')?.querySelector('.perf-all')||null;
 }
 function openNativeRanking(result,event){
  const control=nativeControlFor(result);if(!control)return;
  event.preventDefault();event.stopPropagation();
  if(typeof control.onclick==='function'){control.onclick.call(control,event);return}
  control.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window}));
 }
 function refresh(){requestAnimationFrame(restoreColors)}
 document.addEventListener('click',event=>{
  const guide=event.target.closest('.eval-app [data-guide]');
  if(guide)lockGuideScroll();
  if(event.target.closest('.eval-app [data-close]')&&document.body.dataset.evalGuideLocked==='1')setTimeout(unlockGuideScroll,0);
  const result=event.target.closest('.eval-app .eval-tile>.value,.eval-app .perf>b');
  if(result)openNativeRanking(result,event);
 },true);
 const observer=new MutationObserver(()=>{
  refresh();
  if(document.body.dataset.evalGuideLocked==='1'&&!document.querySelector('.eval-app .modal-backdrop'))unlockGuideScroll();
 });
 observer.observe(document.documentElement,{childList:true,subtree:true});
 window.addEventListener('pagehide',unlockGuideScroll);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh);else refresh();
})();
