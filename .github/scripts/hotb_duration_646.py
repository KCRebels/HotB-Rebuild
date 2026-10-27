from pathlib import Path

# HotB practices use fixed 12-minute blocks. Duration choices must therefore be
# exact multiples of 12 so the scheduler, player availability, and UI all agree.
BLOCK_MINUTES = 12
MIN_DURATION = 60
MAX_DURATION = 180
DURATION_OPTIONS = list(range(MIN_DURATION, MAX_DURATION + 1, BLOCK_MINUTES))
DURATION_OPTIONS_JS = '[' + ','.join(map(str, DURATION_OPTIONS)) + ']'

# Scheduler
p = Path('practice-scheduler.js')
s = p.read_text(encoding='utf-8')

old = "const DEFAULT_BLOCK_COUNT=10,MAX_BLOCK_COUNT=11,BLOCK_MINUTES=12;"
new = "const DEFAULT_BLOCK_COUNT=10,MAX_BLOCK_COUNT=15,BLOCK_MINUTES=12;\n const validDuration=value=>{const duration=Number(value)||120;return duration>=60&&duration<=180&&duration%BLOCK_MINUTES===0?duration:120};"
if old in s:
    s = s.replace(old, new, 1)
elif new not in s:
    raise SystemExit('scheduler constants anchor missing')

old = "const requested=Number(durationMinutes)||120,isResolutionExtension=requested===132;\n  const BLOCK_COUNT=isResolutionExtension?MAX_BLOCK_COUNT:DEFAULT_BLOCK_COUNT;"
new = "const duration=validDuration(durationMinutes),BLOCK_COUNT=duration/BLOCK_MINUTES;"
if old in s:
    s = s.replace(old, new, 2)
elif s.count(new) < 2:
    raise SystemExit('scheduler block count anchors missing')

old = "const duration=isResolutionExtension?132:Math.max(60,Math.min(180,Math.round(requested/10)*10)),blockMinutes=duration/BLOCK_COUNT;"
new = "const blockMinutes=BLOCK_MINUTES;"
if old in s:
    s = s.replace(old, new, 2)
elif s.count(new) < 2:
    raise SystemExit('scheduler duration anchors missing')

old = "const times=blockTimes(startTime,duration),warnings=[],fallbackWarnings=[];"
if old not in s:
    raise SystemExit('scheduler times anchor missing')

old = "if(!plan||![DEFAULT_BLOCK_COUNT,MAX_BLOCK_COUNT].includes(BLOCK_COUNT))errors.push('Schedule must contain ten blocks, or eleven when the emergency extension is approved.');"
new = "if(!plan||BLOCK_COUNT<5||BLOCK_COUNT>MAX_BLOCK_COUNT)errors.push('Schedule has an unsupported number of practice blocks.');"
if old in s:
    s = s.replace(old, new, 1)
elif new not in s:
    raise SystemExit('scheduler validation anchor missing')

old = "return {BLOCK_COUNT:DEFAULT_BLOCK_COUNT,DEFAULT_BLOCK_COUNT,MAX_BLOCK_COUNT,BLOCK_MINUTES,blockTimes,buildSchedule,validate};"
new = "return {BLOCK_COUNT:DEFAULT_BLOCK_COUNT,DEFAULT_BLOCK_COUNT,MAX_BLOCK_COUNT,BLOCK_MINUTES,validDuration,blockTimes,buildSchedule,validate};"
if old in s:
    s = s.replace(old, new, 1)
elif new not in s:
    raise SystemExit('scheduler export anchor missing')

p.write_text(s, encoding='utf-8')

# Coach app availability + duration dropdown.
p = Path('app-coach-rebels-portals-v10.js')
s = p.read_text(encoding='utf-8')

old = "function practiceAvailability(startTime,durationMinutes,arrival,departure){\n const requested=Number(durationMinutes)||120,isResolutionExtension=requested===132,blockCount=isResolutionExtension?11:10,blockMinutes=isResolutionExtension?12:Math.max(60,Math.min(180,Math.round(requested/10)*10))/10;"
new = "function practiceAvailability(startTime,durationMinutes,arrival,departure){\n const start=practiceTimeMinutes(startTime),duration=Number(durationMinutes)||120,blockMinutes=12,blockCount=duration>=60&&duration<=180&&duration%blockMinutes===0?duration/blockMinutes:10;"
if old in s:
    s = s.replace(old, new, 1)
elif new not in s:
    raise SystemExit('coach availability anchor missing')

old = "duration=practiceSetupState.durationMinutes||120,startTime=practiceSetupState.startTime||'17:30'"
new = f"duration=practiceSetupState.durationMinutes||120,durationOptions={DURATION_OPTIONS_JS},startTime=practiceSetupState.startTime||'17:30'"
if old in s:
    s = s.replace(old, new, 1)
elif new not in s:
    raise SystemExit('coach duration variable anchor missing')

old = "${[...Array.from({length:13},(_,index)=>60+index*10),...(duration===132?[132]:[])].sort((a,b)=>a-b).map(minutes=>`<option value=\"${minutes}\" ${minutes===duration?'selected':''}>${minutes}${minutes===132?' Minutes · Emergency Block 11':' Minutes'}</option>`).join('')}"
new = "${durationOptions.map(minutes=>`<option value=\"${minutes}\" ${minutes===duration?'selected':''}>${minutes} Minutes</option>`).join('')}"
if old in s:
    s = s.replace(old, new, 1)
elif new not in s:
    raise SystemExit('coach duration selector anchor missing')

p.write_text(s, encoding='utf-8')

# Cache-bust the current live scheduler and coach bundle references.
idx = Path('index.html')
x = idx.read_text(encoding='utf-8')
old_scheduler = 'practice-scheduler.js?v=20261025-duration645'
old_coach = 'app-coach-rebels-portals-v10.js?v=20261025-practiceportal645'
new_scheduler = 'practice-scheduler.js?v=20261027-duration647'
new_coach = 'app-coach-rebels-portals-v10.js?v=20261027-duration647'
if new_scheduler not in x:
    if old_scheduler not in x:
        raise SystemExit('scheduler cache-bust anchor missing')
    x = x.replace(old_scheduler, new_scheduler, 1)
if new_coach not in x:
    if old_coach not in x:
        raise SystemExit('coach cache-bust anchor missing')
    x = x.replace(old_coach, new_coach, 1)
idx.write_text(x, encoding='utf-8')
