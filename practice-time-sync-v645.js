(()=>{
 const DURATIONS=[60,75,90,105,120,135,150,165,180];
 const toMinutes=value=>{const m=String(value||'').match(/^(\d{2}):(\d{2})$/);if(!m)return null;return Number(m[1])*60+Number(m[2])};
 const timeValue=minutes=>{const total=(Math.round(minutes)+1440)%1440;return `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`};
 const timeLabelFromMinutes=minutes=>{const normalized=(Math.round(minutes)+1440)%1440,h=Math.floor(normalized/60),m=normalized%60;return `${h%12||12}:${String(m).padStart(2,'0')}${h<12?'a':'p'}`};
 const timeLabel=value=>{const total=toMinutes(value);return total===null?'—':timeLabelFromMinutes(total)};
 const endValue=(start,duration)=>{const s=toMinutes(start),d=Number(duration);if(s===null||!Number.isFinite(d))return '';return timeValue(s+d)};
 const setDisplay=input=>{const display=input?.parentElement?.querySelector('.practice-accommodation-time-display');if(display)display.textContent=timeLabel(input.value)};
 const syncAllPlayerTimes=()=>{
  const start=document.getElementById('practiceStartTime'),duration=document.getElementById('practiceDuration');
  if(!start||!duration)return;
  const newStart=start.value||'17:30',newDuration=Number(duration.value)||120,newEnd=endValue(newStart,newDuration);
  window.start=toMinutes(newStart);
  document.querySelectorAll('[data-accommodation-arrival]').forEach(input=>{input.dataset.custom='false';input.value=newStart;setDisplay(input)});
  document.querySelectorAll('[data-accommodation-departure]').forEach(input=>{input.dataset.custom='false';input.value=newEnd;setDisplay(input)});
 };
 const installDurationOptions=select=>{
  const current=Number(select.value)||120,desired=DURATIONS.includes(current)?current:120,signature=DURATIONS.join(',');
  if(select.dataset.hotbDurationOptions===signature)return;
  select.innerHTML='';
  DURATIONS.forEach(minutes=>{const option=document.createElement('option');option.value=String(minutes);option.textContent=`${minutes} Minutes`;select.appendChild(option)});
  select.value=String(desired);select.dataset.hotbDurationOptions=signature;
 };
 const exactAvailability=(player,startTime,duration)=>{
  const blockCount=10,blockMinutes=Number(duration)/blockCount,startMin=toMinutes(startTime);
  if(startMin===null||!Number.isFinite(blockMinutes)||blockMinutes<=0)return player;
  const endMin=startMin+Number(duration),arrivalRaw=toMinutes(player.arrivalTime||startTime),departureRaw=toMinutes(player.departureTime||endValue(startTime,duration));
  if(arrivalRaw===null||departureRaw===null)return player;
  let arrive=arrivalRaw,leave=departureRaw;
  if(arrive<startMin)arrive+=1440;
  if(leave<startMin)leave+=1440;
  arrive=Math.max(startMin,arrive);leave=Math.min(endMin,leave);
  const from=Math.max(0,Math.min(blockCount,Math.ceil((arrive-startMin)/blockMinutes-1e-9)));
  const until=Math.max(from,Math.min(blockCount,Math.floor((leave-startMin)/blockMinutes+1e-9)));
  return {...player,availableFromBlock:from,availableUntilBlock:until};
 };
 const exactTimes=(startTime,duration)=>{
  const startMin=toMinutes(startTime);if(startMin===null)return [];
  const blockCount=10,blockMinutes=Number(duration)/blockCount;
  return Array.from({length:blockCount},(_,index)=>({block:index+1,start:timeLabelFromMinutes(startMin+index*blockMinutes),end:timeLabelFromMinutes(startMin+(index+1)*blockMinutes)}));
 };
 const patchScheduler=()=>{
  const scheduler=window.HotBPracticeScheduler;
  if(!scheduler||scheduler.__hotbExactDuration646)return;
  const originalBuild=scheduler.buildSchedule.bind(scheduler),originalValidate=scheduler.validate?.bind(scheduler);
  scheduler.blockTimes=(startTime='18:00',durationMinutes=120)=>{
   const duration=Number(durationMinutes)||120;
   if(duration===132){const startMin=toMinutes(startTime)||1080;return Array.from({length:11},(_,i)=>({block:i+1,start:timeLabelFromMinutes(startMin+i*12),end:timeLabelFromMinutes(startMin+(i+1)*12)}))}
   return exactTimes(startTime,DURATIONS.includes(duration)?duration:120);
  };
  scheduler.buildSchedule=(players,startTime='18:00',durationMinutes=120,options={})=>{
   const duration=Number(durationMinutes)||120;
   if(duration===132)return originalBuild(players,startTime,duration,options);
   const exact=DURATIONS.includes(duration)?duration:120,normalized=(players||[]).map(player=>exactAvailability(player,startTime,exact));
   const plan=originalBuild(normalized,startTime,exact,options);
   if(!plan)return plan;
   const times=exactTimes(startTime,exact),blocks=(plan.blocks||[]).map((block,index)=>({...block,...(times[index]||{})}));
   return {...plan,startTime,durationMinutes:exact,blockMinutes:exact/10,times,blocks};
  };
  if(originalValidate)scheduler.validate=plan=>originalValidate(plan);
  scheduler.__hotbExactDuration646=true;
 };
 const apply=()=>{
  patchScheduler();
  const start=document.getElementById('practiceStartTime'),duration=document.getElementById('practiceDuration');
  if(!start||!duration)return;
  installDurationOptions(duration);window.start=toMinutes(start.value||'17:30');
  if(!start.dataset.hotbMasterTimeBound){start.dataset.hotbMasterTimeBound='1';start.dataset.hotbPreviousStart=start.value||'17:30';duration.dataset.hotbPreviousDuration=duration.value||'120'}
 };
 document.addEventListener('change',event=>{
  const start=document.getElementById('practiceStartTime'),duration=document.getElementById('practiceDuration');if(!start||!duration)return;
  if(event.target===start||event.target===duration){syncAllPlayerTimes();start.dataset.hotbPreviousStart=start.value||'17:30';duration.dataset.hotbPreviousDuration=duration.value||'120'}
 },true);
 new MutationObserver(apply).observe(document.documentElement,{childList:true,subtree:true});
 addEventListener('DOMContentLoaded',apply);setInterval(patchScheduler,500);setTimeout(apply,0);
})();