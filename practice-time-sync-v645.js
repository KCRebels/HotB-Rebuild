(()=>{
 const DURATIONS=[60,75,90,105,120,135,150,165,180];
 const toMinutes=value=>{const m=String(value||'').match(/^(\d{2}):(\d{2})$/);if(!m)return null;return Number(m[1])*60+Number(m[2])};
 const timeValue=minutes=>{const total=(Math.round(minutes)+1440)%1440;return `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`};
 const timeLabel=value=>{const total=toMinutes(value);if(total===null)return '—';const h=Math.floor(total/60),m=total%60;return `${h%12||12}:${String(m).padStart(2,'0')}${h<12?'a':'p'}`};
 const endValue=(start,duration)=>{const s=toMinutes(start),d=Number(duration);if(s===null||!Number.isFinite(d))return '';return timeValue(s+d)};
 const setDisplay=input=>{const display=input?.parentElement?.querySelector('.practice-accommodation-time-display');if(display)display.textContent=timeLabel(input.value)};
 const syncAllPlayerTimes=()=>{
  const start=document.getElementById('practiceStartTime'),duration=document.getElementById('practiceDuration');
  if(!start||!duration)return;
  const newStart=start.value||'17:30',newDuration=Number(duration.value)||120,newEnd=endValue(newStart,newDuration);
  document.querySelectorAll('[data-accommodation-arrival]').forEach(input=>{input.dataset.custom='false';input.value=newStart;setDisplay(input)});
  document.querySelectorAll('[data-accommodation-departure]').forEach(input=>{input.dataset.custom='false';input.value=newEnd;setDisplay(input)});
 };
 const installDurationOptions=select=>{
  const current=Number(select.value)||120;
  const desired=DURATIONS.includes(current)?current:120;
  const signature=DURATIONS.join(',');
  if(select.dataset.hotbDurationOptions===signature)return;
  select.innerHTML='';
  DURATIONS.forEach(minutes=>{const option=document.createElement('option');option.value=String(minutes);option.textContent=`${minutes} Minutes`;select.appendChild(option)});
  select.value=String(desired);
  select.dataset.hotbDurationOptions=signature;
 };
 const apply=()=>{
  const start=document.getElementById('practiceStartTime'),duration=document.getElementById('practiceDuration');
  if(!start||!duration)return;
  installDurationOptions(duration);
  if(!start.dataset.hotbMasterTimeBound){
   start.dataset.hotbMasterTimeBound='1';
   start.dataset.hotbPreviousStart=start.value||'17:30';
   duration.dataset.hotbPreviousDuration=duration.value||'120';
  }
 };
 document.addEventListener('change',event=>{
  const start=document.getElementById('practiceStartTime'),duration=document.getElementById('practiceDuration');
  if(!start||!duration)return;
  if(event.target===start||event.target===duration){
   syncAllPlayerTimes();
   start.dataset.hotbPreviousStart=start.value||'17:30';
   duration.dataset.hotbPreviousDuration=duration.value||'120';
  }
 },true);
 new MutationObserver(apply).observe(document.documentElement,{childList:true,subtree:true});
 addEventListener('DOMContentLoaded',apply);setTimeout(apply,0);
})();