(()=>{
 const MOVE_LIMIT=10;
 let start=null,moved=false;
 const inEval=target=>target instanceof Element&&!!target.closest('.eval-app');
 // Do not cancel pointer events. Native controls and several Eval controls use
 // pointerup directly, so suppressing pointerup breaks deliberate taps.
 // Instead remember a real swipe and suppress only the synthetic click that
 // follows it. This preserves selects, heat filters, and other controls.
 let suppressClickUntil=0;
 document.addEventListener('pointerdown',event=>{
  if(!inEval(event.target))return;
  start={id:event.pointerId,x:event.clientX,y:event.clientY};moved=false;
 },true);
 document.addEventListener('pointermove',event=>{
  if(!start||event.pointerId!==start.id)return;
  if(Math.hypot(event.clientX-start.x,event.clientY-start.y)>MOVE_LIMIT)moved=true;
 },true);
 document.addEventListener('pointerup',event=>{
  if(!start||event.pointerId!==start.id)return;
  if(moved)suppressClickUntil=performance.now()+500;
  start=null;moved=false;
 },true);
 document.addEventListener('pointercancel',()=>{start=null;moved=false},true);

 function cleanHittingResults(){
  document.querySelectorAll('.eval-app .perf').forEach(card=>{
   ['excellent','good','acceptable','concern','serious'].forEach(name=>card.classList.remove(name));
   card.style.background='#101011';
   card.style.borderColor='#2b2b2d';
   card.style.color='#fff';
  });
 }
 document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;
  if(!target)return;
  const title=target.closest('.eval-app .perf .perf-metric');
  if(title){event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();return;}
  if(performance.now()<suppressClickUntil&&target.closest('.eval-app')){
   event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
   suppressClickUntil=0;
  }
 },true);
 let queued=false;
 function refresh(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;cleanHittingResults()})}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh,{once:true});else refresh();
 new MutationObserver(refresh).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
})();