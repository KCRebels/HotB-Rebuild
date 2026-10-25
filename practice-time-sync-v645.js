(()=>{
 const BLOCK_MINUTES=12;
 const toMinutes=value=>{const m=String(value||'').match(/^(\d{2}):(\d{2})$/);if(!m)return null;return Number(m[1])*60+Number(m[2])};
 const endValue=(start,duration)=>{const s=toMinutes(start),d=Number(duration);if(s===null||!Number.isFinite(d))return '';const total=(s+d+1440)%1440;return `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`};
 const outsidePractice=(value,start,duration)=>{const s=toMinutes(start),v=toMinutes(value),d=Number(duration);if(s===null||v===null||!Number.isFinite(d))return false;let delta=v-s;if(delta<0)delta+=1440;return delta>d};
 const syncInheritedTimes=(oldStart,oldDuration,newStart,newDuration)=>{
  const oldEnd=endValue(oldStart,oldDuration),newEnd=endValue(newStart,newDuration);
  document.querySelectorAll('[data-accommodation-arrival]').forEach(input=>{
   const inherited=input.dataset.custom!=='true'||input.value===oldStart||outsidePractice(input.value,newStart,newDuration);
   if(inherited){input.dataset.custom='false';input.value=newStart;const display=input.parentElement?.querySelector('.practice-accommodation-time-display');if(display)display.textContent=''}
  });
  document.querySelectorAll('[data-accommodation-departure]').forEach(input=>{
   const inherited=input.dataset.custom!=='true'||input.value===oldEnd||outsidePractice(input.value,newStart,newDuration);
   if(inherited){input.dataset.custom='false';input.value=newEnd;const display=input.parentElement?.querySelector('.practice-accommodation-time-display');if(display)display.textContent=''}
  });
 };
 const apply=()=>{
  const start=document.getElementById('practiceStartTime'),duration=document.getElementById('practiceDuration');
  if(!start||!duration)return;
  if(!duration.querySelector('option[value="132"]')){
   const option=document.createElement('option');option.value='132';option.textContent='132 Minutes · 11 Blocks';duration.appendChild(option);
  }
  if(!start.dataset.hotbSyncBound){
   start.dataset.hotbSyncBound='1';start.dataset.hotbPreviousStart=start.value||'17:30';duration.dataset.hotbPreviousDuration=duration.value||'120';
  }
 };
 document.addEventListener('change',event=>{
  const start=document.getElementById('practiceStartTime'),duration=document.getElementById('practiceDuration');if(!start||!duration)return;
  if(event.target===start){
   const oldStart=start.dataset.hotbPreviousStart||start.value||'17:30',oldDuration=Number(duration.dataset.hotbPreviousDuration||duration.value||120),newStart=start.value||oldStart,newDuration=Number(duration.value||oldDuration);
   syncInheritedTimes(oldStart,oldDuration,newStart,newDuration);
   start.dataset.hotbPreviousStart=newStart;duration.dataset.hotbPreviousDuration=String(newDuration);
  }else if(event.target===duration){
   const oldStart=start.dataset.hotbPreviousStart||start.value||'17:30',oldDuration=Number(duration.dataset.hotbPreviousDuration||120),newStart=start.value||oldStart,newDuration=Number(duration.value||oldDuration);
   syncInheritedTimes(oldStart,oldDuration,newStart,newDuration);
   duration.dataset.hotbPreviousDuration=String(newDuration);
  }
 },true);
 new MutationObserver(apply).observe(document.documentElement,{childList:true,subtree:true});
 addEventListener('DOMContentLoaded',apply);setTimeout(apply,0);
})();