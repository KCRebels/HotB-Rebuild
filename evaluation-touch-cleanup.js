(()=>{
 const MOVE_LIMIT=10;
 let start=null,moved=false;
 const inEval=target=>target instanceof Element&&!!target.closest('.eval-app');
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
  const wasMoved=moved;start=null;moved=false;
  if(wasMoved){event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();}
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
  const title=event.target instanceof Element?event.target.closest('.eval-app .perf .perf-metric'):null;
  if(!title)return;
  event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
 },true);
 let queued=false;
 function refresh(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;cleanHittingResults()})}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh,{once:true});else refresh();
 new MutationObserver(refresh).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
})();