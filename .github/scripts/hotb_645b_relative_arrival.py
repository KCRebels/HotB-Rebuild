from pathlib import Path

p=Path('app-coach-rebels-portals-v10.js')
s=p.read_text(encoding='utf-8')

old=""" const start=$('#practiceStartTime')?.value||practiceSetupState.startTime||'18:00',duration=Number($('#practiceDuration')?.value)||practiceSetupState.durationMinutes||120,end=practiceEndValue(start,duration);
 const arrival=$(`[data-accommodation-arrival=\"${index}\"]`),departure=$(`[data-accommodation-departure=\"${index}\"]`),pitch=$(`[data-accommodation-pitch=\"${index}\"]`),warmup=$(`[data-accommodation-warmup=\"${index}\"]`),catching=$(`[data-accommodation-catch=\"${index}\"]`),prePractice=$(`[data-accommodation-prepractice=\"${index}\"]`),limitations=$(`[data-accommodation-limitations=\"${index}\"]`);
 if(pitch&&warmup&&!pitch.checked)warmup.checked=false;
 if(arrival)arrival.dataset.custom=arrival.value!==start?'true':'false';if(departure)departure.dataset.custom=departure.value!==end?'true':'false';
 [arrival,departure].forEach(input=>{const display=input?.parentElement?.querySelector('.practice-accommodation-time-display');if(display)display.textContent=practiceTimeLabel(input.value)});
 const accommodation={arrival:arrival?.value!==start?arrival.value:'',departure:departure?.value!==end?departure.value:'',limitations:limitations?.value.trim()||'',prePracticeComplete:!!prePractice?.checked,canPitch:pitch?pitch.checked:false,requiresPitchWarmup:warmup?warmup.checked:false,canCatch:catching?catching.checked:false};"""
new=""" const start=$('#practiceStartTime')?.value||practiceSetupState.startTime||'18:00',duration=Number($('#practiceDuration')?.value)||practiceSetupState.durationMinutes||120,end=practiceEndValue(start,duration),defaultArrival=player.name==='Makenna Whitaker'?practiceTimeValue((practiceTimeMinutes(start)??0)+45):start;
 const arrival=$(`[data-accommodation-arrival=\"${index}\"]`),departure=$(`[data-accommodation-departure=\"${index}\"]`),pitch=$(`[data-accommodation-pitch=\"${index}\"]`),warmup=$(`[data-accommodation-warmup=\"${index}\"]`),catching=$(`[data-accommodation-catch=\"${index}\"]`),prePractice=$(`[data-accommodation-prepractice=\"${index}\"]`),limitations=$(`[data-accommodation-limitations=\"${index}\"]`);
 if(pitch&&warmup&&!pitch.checked)warmup.checked=false;
 if(arrival)arrival.dataset.custom=arrival.value!==defaultArrival?'true':'false';if(departure)departure.dataset.custom=departure.value!==end?'true':'false';
 [arrival,departure].forEach(input=>{const display=input?.parentElement?.querySelector('.practice-accommodation-time-display');if(display)display.textContent=practiceTimeLabel(input.value)});
 const accommodation={arrival:arrival?.value!==defaultArrival?arrival.value:'',departure:departure?.value!==end?departure.value:'',limitations:limitations?.value.trim()||'',prePracticeComplete:!!prePractice?.checked,canPitch:pitch?pitch.checked:false,requiresPitchWarmup:warmup?warmup.checked:false,canCatch:catching?catching.checked:false};"""
if old in s:
    s=s.replace(old,new,1)
elif new not in s:
    raise SystemExit('store accommodation block not found')

old_default="accommodations:{'Makenna Whitaker':{arrival:'18:15',requiresPitchWarmup:false}}"
new_default="accommodations:{'Makenna Whitaker':{requiresPitchWarmup:false}}"
if old_default in s:
    s=s.replace(old_default,new_default,1)
elif new_default not in s:
    raise SystemExit('Makenna setup default not found')

p.write_text(s,encoding='utf-8')
