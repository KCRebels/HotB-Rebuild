(()=>{
 // Keep all title behavior inside app.js exactly as originally designed.
 // This file only makes the visible stat VALUE act as the old hidden ALL control.
 function rankingControlFor(result){
  const tile=result.closest('.eval-tile');
  if(tile)return tile.querySelector('.metric-all');
  const perf=result.closest('.perf');
  if(perf)return perf.querySelector('.perf-all');
  const pitch=result.closest('.pitcher-stat');
  if(pitch)return pitch;
  return null;
 }
 document.addEventListener('click',event=>{
  const result=event.target.closest('.eval-app .eval-tile>.value,.eval-app .perf>b,.eval-app .pitcher-stat>b');
  if(!result)return;
  const control=rankingControlFor(result);
  if(!control)return;
  event.preventDefault();
  event.stopPropagation();
  // Call the app's already-bound native ranking handler directly when available.
  // This avoids relying on a hidden button receiving a synthetic click on iOS.
  if(typeof control.onclick==='function'){
   control.onclick.call(control,event);
   return;
  }
  control.click();
 },true);
})();
