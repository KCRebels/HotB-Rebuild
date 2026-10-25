from pathlib import Path


def replace_once(text, old, new, label):
    if old in text:
        return text.replace(old, new, 1)
    if new in text:
        return text
    raise SystemExit(f'{label} anchor not found')

# 1) Restore the original adjustable-duration model: normal practices always use
# ten equal blocks, while 132 minutes remains the protected eleven-block
# Practice Resolution extension.
scheduler_path = Path('practice-scheduler.js')
s = scheduler_path.read_text(encoding='utf-8')
s = replace_once(
    s,
    "  const BLOCK_COUNT=Number(durationMinutes)===132?MAX_BLOCK_COUNT:DEFAULT_BLOCK_COUNT;\n  const [hour,minute]=String(startTime||'18:00').split(':').map(Number);\n  const start=(Number.isFinite(hour)?hour:18)*60+(Number.isFinite(minute)?minute:0);\n  const duration=BLOCK_COUNT*BLOCK_MINUTES,blockMinutes=BLOCK_MINUTES;",
    "  const requested=Number(durationMinutes)||120,isResolutionExtension=requested===132;\n  const BLOCK_COUNT=isResolutionExtension?MAX_BLOCK_COUNT:DEFAULT_BLOCK_COUNT;\n  const [hour,minute]=String(startTime||'18:00').split(':').map(Number);\n  const start=(Number.isFinite(hour)?hour:18)*60+(Number.isFinite(minute)?minute:0);\n  const duration=isResolutionExtension?132:Math.max(60,Math.min(180,Math.round(requested/10)*10)),blockMinutes=duration/BLOCK_COUNT;",
    'scheduler blockTimes duration'
)
s = replace_once(
    s,
    "  const BLOCK_COUNT=Number(durationMinutes)===132?MAX_BLOCK_COUNT:DEFAULT_BLOCK_COUNT;\n  const attendees=(players||[]).filter(player=>player&&player.name).map(player=>{",
    "  const requested=Number(durationMinutes)||120,isResolutionExtension=requested===132;\n  const BLOCK_COUNT=isResolutionExtension?MAX_BLOCK_COUNT:DEFAULT_BLOCK_COUNT;\n  const attendees=(players||[]).filter(player=>player&&player.name).map(player=>{",
    'scheduler build block count'
)
s = replace_once(
    s,
    "  const duration=BLOCK_COUNT*BLOCK_MINUTES,blockMinutes=BLOCK_MINUTES;\n  const times=blockTimes(startTime,duration),warnings=[],fallbackWarnings=[];",
    "  const duration=isResolutionExtension?132:Math.max(60,Math.min(180,Math.round(requested/10)*10)),blockMinutes=duration/BLOCK_COUNT;\n  const times=blockTimes(startTime,duration),warnings=[],fallbackWarnings=[];",
    'scheduler build duration'
)
scheduler_path.write_text(s, encoding='utf-8')

# 2) Fix coach practice setup synchronization and restore duration choices.
coach_path = Path('app-coach-rebels-portals-v10.js')
c = coach_path.read_text(encoding='utf-8')
c = replace_once(
    c,
    " const start=practiceTimeMinutes(startTime),blockCount=Number(durationMinutes)===132?11:Number(durationMinutes)===120?10:0,blockMinutes=12;",
    " const requested=Number(durationMinutes)||120,isResolutionExtension=requested===132,blockCount=isResolutionExtension?11:10,blockMinutes=isResolutionExtension?12:Math.max(60,Math.min(180,Math.round(requested/10)*10))/10;",
    'practice availability duration'
)
c = replace_once(
    c,
    "<select class=\"input\" id=\"practiceDuration\">${[120,...(duration===132?[132]:[])].map(minutes=>`<option value=\"${minutes}\" ${minutes===duration?'selected':''}>${minutes}${minutes===132?' Minutes · Emergency Block 11':' Minutes'}</option>`).join('')}</select>",
    "<select class=\"input\" id=\"practiceDuration\">${[...Array.from({length:13},(_,index)=>60+index*10),...(duration===132?[132]:[])].sort((a,b)=>a-b).map(minutes=>`<option value=\"${minutes}\" ${minutes===duration?'selected':''}>${minutes}${minutes===132?' Minutes · Emergency Block 11':' Minutes'}</option>`).join('')}</select>",
    'duration selector'
)
c = replace_once(
    c,
    " $('[data-accommodation-arrival]').forEach(input=>{if(input.dataset.custom!=='true'){const player=practiceAttendanceRoster()[Number(input.dataset.accommodationArrival)];input.value=player?.name==='Makenna Whitaker'?'18:15':start}});\n $('[data-accommodation-departure]').forEach(input=>{if(input.dataset.custom!=='true')input.value=end});",
    " $$('[data-accommodation-arrival]').forEach(input=>{if(input.dataset.custom!=='true'){const player=practiceAttendanceRoster()[Number(input.dataset.accommodationArrival)];input.value=player?.name==='Makenna Whitaker'?practiceTimeValue((practiceTimeMinutes(start)??0)+45):start}});\n $$('[data-accommodation-departure]').forEach(input=>{if(input.dataset.custom!=='true')input.value=end});",
    'practice inherited-time refresh'
)
# Make Makenna's standing late-arrival preference relative to practice start rather
# than permanently tied to 6:15 PM. Existing explicit saved adjustments still win.
c = replace_once(
    c,
    " const isMakenna=player.name==='Makenna Whitaker';\n return {arrival:saved.arrival||(isMakenna?'18:15':''),departure:saved.departure||'',limitations:saved.limitations||'',prePracticeComplete:!!player.isPracticeGuest&&!!saved.prePracticeComplete,canPitch:isPitcherProfile(player)?saved.canPitch!==false:false,requiresPitchWarmup:isPitcherProfile(player)?(isMakenna?false:saved.requiresPitchWarmup!==false):false,canCatch:positionTokens(player).includes('C')?saved.canCatch!==false:false};",
    " const isMakenna=player.name==='Makenna Whitaker';\n return {arrival:saved.arrival||'',departure:saved.departure||'',limitations:saved.limitations||'',prePracticeComplete:!!player.isPracticeGuest&&!!saved.prePracticeComplete,canPitch:isPitcherProfile(player)?saved.canPitch!==false:false,requiresPitchWarmup:isPitcherProfile(player)?(isMakenna?false:saved.requiresPitchWarmup!==false):false,canCatch:positionTokens(player).includes('C')?saved.canCatch!==false:false};",
    'Makenna absolute arrival default'
)
# Keep the default 45-minute-late accommodation, but derive it from the master
# clock at render time so changing the master start does not create a 6:15 relic.
c = replace_once(
    c,
    "arrivalValue=accommodation.arrival||startTime,departureValue=accommodation.departure||endTime;",
    "arrivalValue=accommodation.arrival||(player.name==='Makenna Whitaker'?practiceTimeValue((practiceTimeMinutes(startTime)??0)+45):startTime),departureValue=accommodation.departure||endTime;",
    'attendance row default arrival'
)
# Do not persist the relative Makenna default as a custom absolute time unless the
# coach actually changes it away from the derived default.
c = replace_once(
    c,
    " const start=$('#practiceStartTime')?.value||practiceSetupState.startTime||'18:00',duration=Number($('#practiceDuration')?.value)||practiceSetupState.durationMinutes||120,end=practiceEndValue(start,duration);",
    " const start=$('#practiceStartTime')?.value||practiceSetupState.startTime||'18:00',duration=Number($('#practiceDuration')?.value)||practiceSetupState.durationMinutes||120,end=practiceEndValue(start,duration);",
    'store accommodation start anchor'
)
# Portal links: if an old portal has accumulated the five anonymous-device slots
# permitted by Firestore rules, a valid permanent link must still be able to
# authorize the current device. arrayUnion can exceed the five-slot rule; retry by
# replacing the stale secondary-device list with the current proven device.
claim_old = """   catch(firstError){
    if(loadGeneration!==portalLoadGeneration||portalToken!==requestedPortalToken)return;
    if(firstError?.code!=='permission-denied')throw firstError;
    await portalDoc(requestedPortalToken).update({authorizedUids:firebase.firestore.FieldValue.arrayUnion(portalAuthUser.uid),pinProof:proof,claimedAt:firebase.firestore.FieldValue.serverTimestamp()});
   }"""
claim_new = """   catch(firstError){
    if(loadGeneration!==portalLoadGeneration||portalToken!==requestedPortalToken)return;
    if(firstError?.code!=='permission-denied')throw firstError;
    try{await portalDoc(requestedPortalToken).update({authorizedUids:firebase.firestore.FieldValue.arrayUnion(portalAuthUser.uid),pinProof:proof,claimedAt:firebase.firestore.FieldValue.serverTimestamp()})}
    catch(secondError){
     if(secondError?.code!=='permission-denied')throw secondError;
     await portalDoc(requestedPortalToken).update({authorizedUids:[portalAuthUser.uid],pinProof:proof,claimedAt:firebase.firestore.FieldValue.serverTimestamp()});
    }
   }"""
c = replace_once(c, claim_old, claim_new, 'coach-bundle automatic portal claim')
manual_old = """  }catch(firstError){
   // Only fall back to authorizedUids when the first write was rejected because
   // the portal is already owned. A wrong PIN or network failure must not trigger
   // a second write that can mask the real failure mode.
   if(firstError?.code!=='permission-denied')throw firstError;
   await portalDoc(requestedPortalToken).update({authorizedUids:firebase.firestore.FieldValue.arrayUnion(portalAuthUser.uid),pinProof:proof,claimedAt:firebase.firestore.FieldValue.serverTimestamp()});
  }"""
manual_new = """  }catch(firstError){
   // Only fall back to authorizedUids when the first write was rejected because
   // the portal is already owned. A wrong PIN or network failure must not trigger
   // a second write that can mask the real failure mode.
   if(firstError?.code!=='permission-denied')throw firstError;
   try{await portalDoc(requestedPortalToken).update({authorizedUids:firebase.firestore.FieldValue.arrayUnion(portalAuthUser.uid),pinProof:proof,claimedAt:firebase.firestore.FieldValue.serverTimestamp()})}
   catch(secondError){
    if(secondError?.code!=='permission-denied')throw secondError;
    await portalDoc(requestedPortalToken).update({authorizedUids:[portalAuthUser.uid],pinProof:proof,claimedAt:firebase.firestore.FieldValue.serverTimestamp()});
   }
  }"""
c = replace_once(c, manual_old, manual_new, 'coach-bundle manual portal claim')
coach_path.write_text(c, encoding='utf-8')

# 3) Apply the same permanent-link saturation recovery to the actual player portal
# bundle loaded by ?portal URLs.
portal_path = Path('app-portal-meg-focus-archive-v1.js')
p = portal_path.read_text(encoding='utf-8')
p = replace_once(p, claim_old, claim_new, 'player-bundle automatic portal claim')
p = replace_once(p, manual_old, manual_new, 'player-bundle manual portal claim')
portal_path.write_text(p, encoding='utf-8')

# 4) Cache-bust every changed production asset.
index_path = Path('index.html')
i = index_path.read_text(encoding='utf-8')
i = replace_once(i, 'practice-scheduler.js?v=20260922-resolution503', 'practice-scheduler.js?v=20261025-duration645', 'scheduler cache token')
i = replace_once(i, 'app-portal-meg-focus-archive-v1.js?v=20260930-jenkins378', 'app-portal-meg-focus-archive-v1.js?v=20261025-permanent645', 'portal bundle cache token')
i = replace_once(i, 'app-coach-rebels-portals-v10.js?v=20261019-portalsync643', 'app-coach-rebels-portals-v10.js?v=20261025-practiceportal645', 'coach bundle cache token')
index_path.write_text(i, encoding='utf-8')
