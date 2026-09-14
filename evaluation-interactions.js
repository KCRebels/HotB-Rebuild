(()=>{
 // Keep title behavior inside app.js exactly as originally designed.
 // This helper only restores hitting colors, rounds displayed Strike %, and lets visible stat values use the native ranking controls.
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
 function roundStrikePct(){
  document.querySelectorAll('.eval-app .pitcher-stat').forEach(card=>{
   const label=String(card.querySelector('span')?.textContent||'').trim().toUpperCase();
   if(label!=='STRIKE %')return;
   const value=card.querySelector(':scope>b');
   if(!value)return;
   const number=Number(String(value.textContent||'').replace('%','').trim());
   if(Number.isFinite(number))value.textContent=`${Math.round(number)}%`;
  });
  const modal=document.querySelector('.ranking-modal');
  if(String(modal?.querySelector('h2')?.textContent||'').trim().toUpperCase()==='STRIKE %'){
   modal.querySelectorAll('.ranking-row strong').forEach(value=>{
    const number=Number(String(value.textContent||'').replace('%','').trim());
    if(Number.isFinite(number))value.textContent=`${Math.round(number)}%`;
   });
  }
 }
 function rankingControlFor(result){
  const tile=result.closest('.eval-tile');
  if(tile)return tile.querySelector('.metric-all');
  const perf=result.closest('.perf');
  if(perf)return perf.querySelector('.perf-all');
  const pitch=result.closest('.pitcher-stat');
  if(pitch)return pitch;
  return null;
 }
 function refresh(){
  requestAnimationFrame(()=>{restoreColors();roundStrikePct()});
 }
 document.addEventListener('click',event=>{
  const result=event.target.closest('.eval-app .eval-tile>.value,.eval-app .perf>b,.eval-app .pitcher-stat>b');
  if(result){
   const control=rankingControlFor(result);
   if(control){
    event.preventDefault();
    event.stopPropagation();
    if(typeof control.onclick==='function')control.onclick.call(control,event);
    else control.click();
    setTimeout(refresh,0);
    return;
   }
  }
  // Modal/title clicks can replace Eval markup; refresh once after the native app finishes.
  if(event.target.closest('.eval-app [data-guide],.eval-app [data-ranking],.eval-app [data-hitting-ranking],.eval-app [data-pitch-ranking],[data-close]'))setTimeout(refresh,0);
 },true);
 document.addEventListener('change',event=>{if(event.target.closest('.eval-app'))setTimeout(refresh,0)},true);
 window.addEventListener('pageshow',refresh);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh,{once:true});else refresh();
})();
