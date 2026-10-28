(()=>{
 const sourceUrl='app-coach-rebels-portals-v10.js?v=20261028-practice-reset-678&fresh='+Date.now();
 const load=async()=>{
  try{
   const response=await fetch(sourceUrl,{cache:'no-store'});
   if(!response.ok)throw new Error('activation-wrapper-source-'+response.status);
   let source=await response.text();

   const recoveredOld="persistPracticeSession();practicePortalActionBusy=false;render();return;";
   const recoveredNew="practicePortalActionBusy=false;render();setTimeout(()=>{try{persistPracticeSession()}catch(error){console.warn('HotB deferred recovered-activation persistence failed',error)}},0);return;";
   if(source.includes(recoveredOld))source=source.replace(recoveredOld,recoveredNew);

   const successOld=`db.activePortalPractice=pendingPortalPractice;\n  try{persistPracticeSession()}\n  catch(error){\n   if(String(error?.message||'').includes('device-storage-quota-exceeded'))throw error;\n   throw error;\n  }\n  practicePortalActionBusy=false;render();`;
   const successNew=`db.activePortalPractice=pendingPortalPractice;\n  practicePortalActionBusy=false;render();\n  setTimeout(()=>{try{persistPracticeSession()}catch(error){console.warn('HotB deferred activation persistence failed',error)}},0);`;
   if(source.includes(successOld))source=source.replace(successOld,successNew);

   const preflightOld=`const activationDocs=await Promise.all(activationTargets.map(async target=>({target,snapshot:await portalDoc(target.id).get()})));`;
   const preflightNew=`const activationDocs=await Promise.all(activationTargets.map(async target=>({target,snapshot:await Promise.race([portalDoc(target.id).get(),new Promise((_,reject)=>setTimeout(()=>reject(new Error('portal-activation-preflight-timeout:'+target.id)),8000))])})));`;
   if(source.includes(preflightOld))source=source.replace(preflightOld,preflightNew);

   const commitOld=`// Do not mark the practice locally active until Firebase has accepted every portal update.\n  try{await batch.commit()}\n  catch(error){throw error}`;
   const commitNew=`// Do not mark the practice locally active until Firebase has accepted every portal update.\n  try{await Promise.race([batch.commit(),new Promise((_,reject)=>setTimeout(()=>reject(new Error('portal-activation-commit-timeout')),12000))])}\n  catch(error){throw error}`;
   if(source.includes(commitOld))source=source.replace(commitOld,commitNew);

   const cleanupReadsOld=`const existingCleanup=await Promise.all(cleanupTargets.map(async target=>{const snapshot=await portalDoc(target.id).get();if(!snapshot.exists)return null;const remote=snapshot.data()||{},remotePracticeId=remote.activePractice?.id||'';if(remotePracticeId&&remotePracticeId!==practicePlan.portalDraftId)throw new Error('portal-clear-newer-practice-conflict');`;
   const cleanupReadsNew=`const existingCleanup=await Promise.all(cleanupTargets.map(async target=>{const snapshot=await Promise.race([portalDoc(target.id).get(),new Promise((_,reject)=>setTimeout(()=>reject(new Error('portal-deactivation-preflight-timeout:'+target.id)),8000))]);if(!snapshot.exists)return null;const remote=snapshot.data()||{},remotePracticeId=remote.activePractice?.id||'';if(remotePracticeId&&remotePracticeId!==practicePlan.portalDraftId)throw new Error('portal-clear-newer-practice-conflict');`;
   if(source.includes(cleanupReadsOld))source=source.replace(cleanupReadsOld,cleanupReadsNew);

   const cleanupCommitOld=`if(existingCleanup.some(item=>item&&!item.alreadyCleared))await batch.commit();`;
   const cleanupCommitNew=`if(existingCleanup.some(item=>item&&!item.alreadyCleared))await Promise.race([batch.commit(),new Promise((_,reject)=>setTimeout(()=>reject(new Error('portal-deactivation-commit-timeout')),12000))]);`;
   if(source.includes(cleanupCommitOld))source=source.replace(cleanupCommitOld,cleanupCommitNew);

   const deactivateOld=`db.activePortalPractice=null;\n if(db.activePracticeSession&&practicePlan)persistPracticeSession();else save();\n}`;
   const deactivateNew=`db.activePortalPractice=null;\n setTimeout(()=>{try{if(db.activePracticeSession&&practicePlan)persistPracticeSession();else save()}catch(error){console.warn('HotB deferred deactivation persistence failed',error)}},0);\n}`;
   if(source.includes(deactivateOld))source=source.replace(deactivateOld,deactivateNew);

   const makennaWarmupOld=`requiresPitchWarmup:isPitcherProfile(player)?(isMakenna?false:saved.requiresPitchWarmup!==false):false`;
   const makennaWarmupNew=`requiresPitchWarmup:isPitcherProfile(player)?(isMakenna?saved.requiresPitchWarmup===true:saved.requiresPitchWarmup!==false):false`;
   if(source.includes(makennaWarmupOld))source=source.replace(makennaWarmupOld,makennaWarmupNew);

   const refreshOld=`function refreshPracticeAccommodationDefaults(){\n const start=$('#practiceStartTime')?.value||'17:30',duration=Number($('#practiceDuration')?.value)||120,end=practiceEndValue(start,duration);\n $$('[data-accommodation-arrival]').forEach(input=>{if(input.dataset.custom!=='true'){const player=practiceAttendanceRoster()[Number(input.dataset.accommodationArrival)];input.value=player?.name==='Makenna Whitaker'?practiceTimeValue((practiceTimeMinutes(start)??0)+45):start}});\n $$('[data-accommodation-departure]').forEach(input=>{if(input.dataset.custom!=='true')input.value=end});\n practiceAttendanceRoster().forEach((player,index)=>storePracticeAccommodation(index));\n}`;
   const refreshNew=`function refreshPracticeAccommodationDefaults(){\n const start=$('#practiceStartTime')?.value||'17:30',duration=Number($('#practiceDuration')?.value)||120,end=practiceEndValue(start,duration);\n $$('[data-accommodation-arrival]').forEach(input=>{const player=practiceAttendanceRoster()[Number(input.dataset.accommodationArrival)];if(player?.name==='Makenna Whitaker'){input.value=start;input.dataset.custom='true'}else if(input.dataset.custom!=='true')input.value=start});\n $$('[data-accommodation-departure]').forEach(input=>{if(input.dataset.custom!=='true')input.value=end});\n const makennaIndex=practiceAttendanceRoster().findIndex(player=>player.name==='Makenna Whitaker');\n if(makennaIndex>=0){const pitch=$('[data-accommodation-pitch="'+makennaIndex+'"]'),warmup=$('[data-accommodation-warmup="'+makennaIndex+'"]');if(pitch)pitch.checked=true;if(warmup){warmup.disabled=false;warmup.checked=true}}\n practiceAttendanceRoster().forEach((player,index)=>storePracticeAccommodation(index));\n}`;
   if(source.includes(refreshOld))source=source.replace(refreshOld,refreshNew);

   const buttonsOld=`<div class="practice-build-bottom-actions" style="display:grid;grid-template-columns:1fr 1fr 1.5fr;gap:10px;margin-top:14px;margin-bottom:110px"><button class="btn" id="closePracticeSetup">Close</button><button class="btn red" id="savePracticeSetup" style="background:#c71920!important;color:#fff!important;border-color:#c71920!important">Save</button><button class="btn black" id="generatePractice">Build Practice</button></div>`;
   const buttonsNew=`<div class="practice-build-bottom-actions" style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:10px;margin-top:14px;margin-bottom:110px"><button class="btn" id="closePracticeSetup">Close</button><button class="btn red" id="savePracticeSetup" style="background:#c71920!important;color:#fff!important;border-color:#c71920!important">Save</button><button class="btn black" id="generatePractice">Build</button><button class="btn" type="button" id="resetPracticeSetup">Reset</button></div>`;
   if(source.includes(buttonsOld))source=source.replace(buttonsOld,buttonsNew);

   const durationHandler=`$('#practiceDuration')?.addEventListener('change',()=>{refreshPracticeAccommodationDefaults();if(practiceResolution){practiceResolution=null;if(modal==='practiceResolution')modal=null}persistPracticeDraft()});`;
   const resetHandler=`${durationHandler}\n $('#resetPracticeSetup')?.addEventListener('click',event=>{\n  event.preventDefault();\n  const roster=practiceAttendanceRoster();\n  const regionalDefaults=roster.filter(player=>!player.isTeamJenkins&&!player.isPracticeGuest&&!player.isGuest&&!['Brynna Peter','Claire Jack'].includes(player.name)).map(player=>player.name);\n  const regionalSet=new Set(regionalDefaults);\n  practiceSetupState={...practiceSetupState,selectedNames:regionalDefaults,startTime:'17:30',durationMinutes:120,accommodations:{'Makenna Whitaker':{arrival:'18:15',requiresPitchWarmup:false}}};\n  practiceResolution=null;if(modal==='practiceResolution')modal=null;\n  const start=$('#practiceStartTime'),duration=$('#practiceDuration');\n  if(start){start.value='17:30';start.dataset.hotbPreviousStart='17:30'}\n  if(duration){duration.value='120';duration.dataset.hotbPreviousDuration='120'}\n  const startDisplay=$('#practiceStartTimeDisplay');if(startDisplay)startDisplay.textContent='5:30p';\n  const attendanceState={};\n  $$('[data-practice-player]').forEach(input=>{const player=roster[Number(input.dataset.practicePlayer)];if(!player)return;const checked=regionalSet.has(player.name);input.checked=checked;attendanceState[player.name]=checked});\n  try{sessionStorage.setItem('hotb-practice-attendance-manual-v649',JSON.stringify(attendanceState))}catch(_){}\n  $$('[data-accommodation-arrival]').forEach(input=>{const player=roster[Number(input.dataset.accommodationArrival)];input.value=player?.name==='Makenna Whitaker'?'18:15':'17:30';input.dataset.custom=player?.name==='Makenna Whitaker'?'true':'false';const display=input.parentElement?.querySelector('.practice-accommodation-time-display');if(display)display.textContent=player?.name==='Makenna Whitaker'?'6:15p':'5:30p'});\n  $$('[data-accommodation-departure]').forEach(input=>{input.value='19:30';input.dataset.custom='false';const display=input.parentElement?.querySelector('.practice-accommodation-time-display');if(display)display.textContent='7:30p'});\n  const makennaIndex=roster.findIndex(player=>player.name==='Makenna Whitaker');\n  if(makennaIndex>=0){const pitch=$('[data-accommodation-pitch="'+makennaIndex+'"]'),warmup=$('[data-accommodation-warmup="'+makennaIndex+'"]');if(pitch){pitch.checked=true;pitch.disabled=false}if(warmup){warmup.checked=false;warmup.disabled=false}}\n  roster.forEach((player,index)=>storePracticeAccommodation(index));\n  persistPracticeDraft();\n  window.scrollTo(0,0);\n });`;
   if(source.includes(durationHandler)&&!source.includes("$('#resetPracticeSetup')?.addEventListener"))source=source.replace(durationHandler,resetHandler);

   if(!source.includes('HotB deferred activation persistence failed')||!source.includes('HotB deferred recovered-activation persistence failed')||!source.includes('HotB deferred deactivation persistence failed')||!source.includes('portal-activation-preflight-timeout')||!source.includes('portal-activation-commit-timeout')||!source.includes('portal-deactivation-preflight-timeout')||!source.includes('portal-deactivation-commit-timeout')||!source.includes('id="resetPracticeSetup"')||!source.includes("$('#resetPracticeSetup')?.addEventListener")||!source.includes("isMakenna?saved.requiresPitchWarmup===true")||!source.includes('hotb-practice-attendance-manual-v649'))throw new Error('activation-wrapper-patch-anchor');

   const blob=new Blob([source],{type:'text/javascript'}),url=URL.createObjectURL(blob),script=document.createElement('script');
   script.src=url;script.async=false;
   script.onload=()=>{URL.revokeObjectURL(url);window.__HOTB_ACTIVATION_DIRECT_PATCH__='678'};
   script.onerror=()=>{URL.revokeObjectURL(url);throw new Error('activation-wrapper-execute')};
   document.body.appendChild(script);
  }catch(error){
   console.error('HotB activation wrapper failed',error);
   const app=document.getElementById('app');
   if(app)app.innerHTML='<div class="app"><main style="padding:24px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif"><section style="max-width:520px;margin:40px auto;background:#fff;border:2px solid #d4d9d7;border-radius:18px;padding:24px"><strong>HotB Startup Error</strong><p style="margin:8px 0 0">The HotB update could not load. Close HotB and reopen it once.</p><p style="margin:8px 0 0">Error code: H678</p></section></main></div>';
  }
 };
 load();
})();