from pathlib import Path

# Exact practice layouts. Preserve the current 120-minute 10x12 structure.
LAYOUT_JS="const durationLayout=value=>({60:[5,12],75:[5,15],90:[9,10],105:[7,15],120:[10,12],135:[9,15],150:[10,15],165:[11,15],180:[12,15]}[Number(value)]||[10,12]);"

# Scheduler
p=Path('practice-scheduler.js')
s=p.read_text(encoding='utf-8')
old="const DEFAULT_BLOCK_COUNT=10,MAX_BLOCK_COUNT=11,BLOCK_MINUTES=12;"
new="const DEFAULT_BLOCK_COUNT=10,MAX_BLOCK_COUNT=12,BLOCK_MINUTES=12;\n "+LAYOUT_JS
if old in s:
    s=s.replace(old,new,1)
elif new not in s:
    raise SystemExit('scheduler constants anchor missing')

old="const BLOCK_COUNT=Number(durationMinutes)===132?MAX_BLOCK_COUNT:DEFAULT_BLOCK_COUNT;"
new="const [BLOCK_COUNT,blockMinutes]=durationLayout(durationMinutes);"
if old in s:
    s=s.replace(old,new,2)
elif s.count(new)<2:
    raise SystemExit('scheduler block count anchors missing')

old="const duration=BLOCK_COUNT*BLOCK_MINUTES,blockMinutes=BLOCK_MINUTES;"
new="const duration=BLOCK_COUNT*blockMinutes;"
if old in s:
    s=s.replace(old,new,2)
elif s.count(new)<2:
    raise SystemExit('scheduler duration anchors missing')

old="const times=blockTimes(startTime,duration),warnings=[],fallbackWarnings=[];"
new="const times=blockTimes(startTime,durationMinutes),warnings=[],fallbackWarnings=[];"
if old in s:
    s=s.replace(old,new,1)
elif new not in s:
    raise SystemExit('scheduler times anchor missing')

old="if(!plan||![DEFAULT_BLOCK_COUNT,MAX_BLOCK_COUNT].includes(BLOCK_COUNT))errors.push('Schedule must contain ten blocks, or eleven when the emergency extension is approved.');"
new="if(!plan||BLOCK_COUNT<5||BLOCK_COUNT>MAX_BLOCK_COUNT)errors.push('Schedule has an unsupported number of practice blocks.');"
if old in s:
    s=s.replace(old,new,1)
elif new not in s:
    raise SystemExit('scheduler validation anchor missing')

old="return {BLOCK_COUNT:DEFAULT_BLOCK_COUNT,DEFAULT_BLOCK_COUNT,MAX_BLOCK_COUNT,BLOCK_MINUTES,blockTimes,buildSchedule,validate};"
new="return {BLOCK_COUNT:DEFAULT_BLOCK_COUNT,DEFAULT_BLOCK_COUNT,MAX_BLOCK_COUNT,BLOCK_MINUTES,durationLayout,blockTimes,buildSchedule,validate};"
if old in s:
    s=s.replace(old,new,1)
elif new not in s:
    raise SystemExit('scheduler export anchor missing')
p.write_text(s,encoding='utf-8')

# Coach app availability + duration dropdown.
p=Path('app-coach-rebels-portals-v10.js')
s=p.read_text(encoding='utf-8')
anchor="function practiceAvailability(startTime,durationMinutes,arrival,departure){\n const start=practiceTimeMinutes(startTime),blockCount=Number(durationMinutes)===132?11:Number(durationMinutes)===120?10:0,blockMinutes=12;"
replacement="function practiceDurationLayout(value){return ({60:[5,12],75:[5,15],90:[9,10],105:[7,15],120:[10,12],135:[9,15],150:[10,15],165:[11,15],180:[12,15]}[Number(value)]||[10,12])}\nfunction practiceAvailability(startTime,durationMinutes,arrival,departure){\n const start=practiceTimeMinutes(startTime),[blockCount,blockMinutes]=practiceDurationLayout(durationMinutes);"
if anchor in s:
    s=s.replace(anchor,replacement,1)
elif replacement not in s:
    raise SystemExit('coach availability anchor missing')

old="duration=practiceSetupState.durationMinutes||120,startTime=practiceSetupState.startTime||'17:30'"
new="duration=practiceSetupState.durationMinutes||120,durationOptions=[60,75,90,105,120,135,150,165,180],startTime=practiceSetupState.startTime||'17:30'"
if old in s:
    s=s.replace(old,new,1)
elif new not in s:
    raise SystemExit('coach duration variable anchor missing')

old="${[120,...(duration===132?[132]:[])].map(minutes=>`<option value=\"${minutes}\" ${minutes===duration?'selected':''}>${minutes}${minutes===132?' Minutes · Emergency Block 11':' Minutes'}</option>`).join('')}"
new="${durationOptions.map(minutes=>`<option value=\"${minutes}\" ${minutes===duration?'selected':''}>${minutes} Minutes</option>`).join('')}"
if old in s:
    s=s.replace(old,new,1)
elif new not in s:
    raise SystemExit('coach duration selector anchor missing')

# Cache bust live scheduler and app bundle.
p.write_text(s,encoding='utf-8')
idx=Path('index.html')
x=idx.read_text(encoding='utf-8')
x=x.replace('practice-scheduler.js?v=20260922-resolution503','practice-scheduler.js?v=20261025-duration646',1)
x=x.replace('app-coach-rebels-portals-v10.js?v=20261019-portalsync643','app-coach-rebels-portals-v10.js?v=20261025-duration646',1)
idx.write_text(x,encoding='utf-8')
