const assert=require('assert');
const fs=require('fs');
const app=fs.readFileSync('app.js','utf8');
const rules=fs.readFileSync('firestore.rules','utf8');
assert(app.includes('authorizedUids:firebase.firestore.FieldValue.arrayUnion(portalAuthUser.uid)'));
assert(app.includes('ownerUid:portalAuthUser.uid'));
assert(app.includes('authorizedUids:firebase.firestore.FieldValue.delete()'));
assert(rules.includes("resource.data.authorizedUids.hasAny([request.auth.uid])"));
assert(rules.includes("request.resource.data.authorizedUids.hasAny([request.auth.uid])"));
assert(rules.includes('request.resource.data.authorizedUids.size() <= 5'));
console.log('portal-auth tests passed');

const buttons=fs.readFileSync('portal-button-repair.js','utf8');
const index=fs.readFileSync('index.html','utf8');
assert(buttons.includes("document.addEventListener('click'"));
assert(buttons.includes("stopImmediatePropagation"));
assert(buttons.includes("HotBPortalShare"));
assert(buttons.includes("HotBPortalText"));
assert(app.includes("PORTAL_BUILD_TOKEN='20260919-134'"));
assert(index.includes('portal-button-repair.js?v=20260919-sharetext10'));
assert(index.includes('app.js?v=20260919-portal174'));

assert(app.includes('cloudAuth.signInAnonymously()'));

assert(app.includes("$$('[data-reset-portal]').forEach"));
assert(!app.includes("$('[data-share-portal]').forEach"));
assert(!app.includes("$('[data-text-portal]').forEach"));

assert(app.includes("previousClockStart=portalData?.activePractice?.clock?.startedAt||''"));
assert(app.includes("delete portalData._localPracticeEnded"));

assert(app.includes('const requestedPortalToken=portalToken'));
assert(app.includes('portalDoc(requestedPortalToken).get()'));
assert(app.includes('portalDoc(requestedPortalToken).onSnapshot'));
assert(app.includes('portalToken!==requestedPortalToken'));

assert(app.includes("if(clock.status==='finished')throw new Error('practice-already-finished')"));
assert(app.includes("startedAt<activatedAt"));
assert(app.includes("orphan-cleanup-verification-failed"));
assert(app.includes("kept the local recovery reference"));

assert(app.includes("const expectedStartedAt=new Date(practiceClock.startAt).toISOString()"));
assert(app.includes("remote?.clock?.startedAt===expectedStartedAt"));
assert(app.includes("same live start time on every portal"));
assert(app.includes("$$('[data-reset-portal]').forEach"));

assert(app.includes("coach-portal-reset-verification-failed"));
assert(!app.includes("$('[data-reset-portal]').forEach"));

assert(app.includes("portalHash(requestedPortalToken,guestPortalSecret)"));
assert(app.includes("portalDoc(requestedPortalToken).get()"));
assert(app.includes("portalDoc(requestedPortalToken).update({ownerUid"));
assert(app.includes("if(portalToken===requestedPortalToken)"));

assert(app.includes("const requestedPortalToken=portalToken"));
assert(app.includes("portalHash(requestedPortalToken,pin)"));
assert(app.includes("portalData.id!==requestedPortalToken"));
assert(app.includes("portal-claim-token-changed"));

assert(app.includes("if(!cloudAuth||!cloudStore){"));
assert(app.includes("new Error('portal-auth-timeout')"));
assert(app.includes("HotB could not finish connecting this device"));
assert(!app.includes("$('[data-share-portal]').forEach"));
assert(!app.includes("$('[data-text-portal]').forEach"));
assert(!app.includes("$('[data-reset-portal]').forEach"));

assert(!app.includes("addEventListener('click',window.HotBCoachPortalShare)"));
assert(!app.includes("addEventListener('click',window.HotBCoachPortalText)"));
assert(!app.includes("[data-share-portal]').forEach"));
assert(!app.includes("[data-text-portal]').forEach"));
assert(app.includes("$$('[data-reset-portal]').forEach"));
assert(buttons.includes("target.matches('[data-share-portal]')"));
assert(buttons.includes("target.matches('[data-text-portal]')"));
assert(buttons.includes("target.id==='shareCoachPortal'"));
assert(buttons.includes("target.id==='textCoachPortal'"));

assert(app.includes("document.createElement('a')"));
assert(app.includes("link.href=url"));
assert(app.includes("link.click();link.remove()"));
assert(app.includes("window.location.assign(url)"));

assert(app.includes("portal-player-type-mismatch"));
assert(app.includes("portal-coach-type-mismatch"));
assert(app.includes("portalType:'player',playerName:player.name"));
assert(app.includes("remote.portalType==='player'"));
assert(app.includes("remote.pinHash===player.portalPinHash"));
assert(app.includes("remote.portalType!=='coach'"));
assert(app.includes("remote.pinHash!==db.coachPortal.portalPinHash"));

assert(app.includes("portalLoadGeneration=0"));
assert(app.includes("loadGeneration=++portalLoadGeneration"));
assert(app.includes("loadGeneration!==portalLoadGeneration||portalToken!==requestedPortalToken"));
assert(app.includes("loadGeneration===portalLoadGeneration&&portalToken===requestedPortalToken"));

assert(app.includes("active?.activatedAt===activationTimestamp"));
assert(app.includes("active?.clock?.status==='not-started'"));
assert(app.includes("!active?.clock?.startedAt"));
assert(app.includes("if(guestPortalIds.has(id))return remote.expired===true"));
assert(app.includes("remote.accessStatus==='waiting'&&remote.expired===false"));

assert(app.includes("Player portal clock read-back verification failed"));
assert(app.includes("remoteClock.status===clock.status"));
assert(app.includes("remoteClock.startedAt===clock.startedAt"));
assert(app.includes("remoteClock.endedAt===clock.endedAt"));

assert(app.includes("async function verifyPublishedPracticeClock()"));
assert(app.includes("const clockVerified=await verifyPublishedPracticeClock()"));
assert(app.includes("coach timer is paused so it cannot overwrite the player portals"));
assert(!app.includes("if(activeTiming&&practiceClock.running){syncPlayerPracticeClock()"));

assert(app.includes("if(recoveredPracticeExpired&&practicePlan&&practiceClock.running)"));
assert(app.includes("await finishPracticeClock(true)"));
assert(!app.includes("recoveredPracticeExpired&&practicePlan&&practiceClock.running){\n    practiceClock.running=false;practiceClock.finished=true"));

assert(app.includes("draft-guest-expiry-verification-failed"));
assert(app.includes("remote.expired===true&&remote.accessStatus==='ended'&&!remote.activePractice"));
assert(app.includes("guest links could not be expired and verified"));

assert(app.match(/catch\(error\)\{\n\s+if\(loadGeneration!==portalLoadGeneration\|\|portalToken!==requestedPortalToken\)return;/g)?.length>=3);
assert(app.includes("},()=>{\n    if(loadGeneration!==portalLoadGeneration||portalToken!==requestedPortalToken)return;"));

assert(app.includes("batch.update(target.ref,target.data)"));
assert(app.includes("remote.portalType!=='player'||remote.playerName!==player.name"));
assert(app.includes("remote.portalType!=='coach'"));
assert(!app.includes("portalDoc(player.portalId).set({evaluationData:"));
assert(!app.includes("portalDoc(db.coachPortal.portalId).set({evaluationData:"));

assert(app.includes("remote.ownerUid!==uid&&!(Array.isArray(remote.authorizedUids)&&remote.authorizedUids.includes(uid))"));
assert(app.includes("if(portalData?.id===requestedPortalToken){portalBusy=false"));
assert(app.includes("const verified=await portalDoc(requestedPortalToken).get()"));

assert(app.includes("if(!url||!/^sms:/i.test(String(url)))return false"));
assert(app.includes("setTimeout(()=>link.remove(),0)"));
assert(!app.includes("link.style.left='-9999px'"));

assert(app.includes("if(remote.clock?.status==='finished')"));
assert(app.includes("stale portal plans were cleared instead of reopening the practice"));

assert(app.includes("if(cloudUser&&recoveredPracticeExpired&&practicePlan&&practiceClock.running)"));
assert(app.includes("else if(cloudUser&&!portalToken&&practicePlan&&practiceClock.running&&!recoveredPracticeExpired)"));
assert(!app.includes("if(!recoveredPracticeExpired)resumeRecoveredPracticeClock();"));

assert(app.includes("const existingCleanup=await Promise.all(cleanupTargets.map"));
assert(app.includes("existingCleanup.filter(Boolean).forEach(target=>batch.update"));

assert(app.includes("const existingOrphans=await Promise.all(orphanTargets.map"));
assert(app.includes("existingOrphans.filter(Boolean).forEach(target=>batch.update"));

assert(app.includes("throw new Error('portal-activation-target-missing')"));
assert(app.includes("throw new Error('portal-activation-player-mismatch')"));
assert(app.includes("permanentPlayers.forEach(player=>batch.update"));
assert(app.includes("jenkinsPlayers.forEach(player=>batch.update"));

assert(app.includes("const existingGuests=await Promise.all(guests.map"));
assert(app.includes("existingGuests.filter(Boolean).forEach(guest=>batch.update"));
assert(!app.includes("portalId).set({expired:true,accessStatus:'removed'"));

assert(app.includes("const playerType=['player','jenkinsPlayer','guestPlayer'].includes(loaded.portalType)"));
assert(app.includes("playerType&&!loaded.playerName||coachType&&!loaded.coachName"));
assert(app.includes("nextPlayerType&&!nextData.playerName||nextCoachType&&!nextData.coachName"));

assert(app.includes("const practiceOnly=['guestPlayer','jenkinsPlayer'].includes(portalData?.portalType),allowed=!practiceOnly"));
assert(app.includes("!(portalData?.activePractice?.drills||[]).includes(drill)"));

assert(app.includes("drillAllowed=!!details.drill&&(!practiceOnly||(portalData?.activePractice?.drills||[]).includes(details.drill))"));
assert(app.includes("nextButton.dataset.portalPracticeDrill=drillAllowed?details.drill:''"));

assert(app.includes("['guestPlayer','guestCoach','jenkinsPlayer'].includes(portalData?.portalType)"));
assert(!app.includes("['guestPlayer','jenkinsPlayer'].includes(portalData?.portalType)"));

assert(app.includes("let practiceResumeVerificationBusy=false"));
assert(app.includes("if(practiceResumeVerificationBusy||!practicePlan||!practiceClock.running)return"));
assert(app.includes("if(!cloudUser||!cloudStore)return"));
assert(app.includes("finally{practiceResumeVerificationBusy=false}"));

assert(app.includes("async function clearFinishedOrphanedPractice(state)"));
assert(app.includes("await clearFinishedOrphanedPractice(state)"));
assert(!app.includes("if(remote.clock?.status==='finished'){\n   await clearActivePlayerPlans()"));
assert(app.includes("accessStatus:'ended'"));
assert(app.includes("finished-orphan-cleanup-verification-failed"));

assert(app.includes("if(guestPortalIds.has(id))return remote.expired===true&&remote.accessStatus==='ended'"));

assert(app.includes("if(clock.status==='finished')return {block:'DONE!',left:'0:00',transition:false,currentBlock:10,ended:true}"));
assert(app.includes("if(values.ended&&!portalData._localPracticeEnded)"));
assert(app.includes("if(values.ended){"));

assert(app.includes("if(!portalData.activePractice){"));
assert(app.includes("else if(portalPracticeClockValues(portalData.activePractice).ended)"));
assert(app.includes("portalData._localPracticeEnded=true"));

assert(app.includes("throw new Error('portal-active-practice-conflict')"));
assert(app.includes("throw new Error('coach-active-practice-conflict')"));
assert(!app.includes("pinHash:player.portalPinHash,evaluationData:playerEvaluationPortalPayload(player.name),activePractice:localActive"));
assert(!app.includes("pinHash:db.coachPortal.portalPinHash,activePractice,..."));

assert(app.includes("throw new Error('portal-activation-live-practice-conflict')"));
assert(app.includes("persisted?.isTeamJenkins||rosterPlayer?.isTeamJenkins"));

assert(app.includes("const finishedSynced=await syncPlayerPracticeClock()"));
assert(app.includes("could not confirm the finished clock on every portal"));

assert(app.includes("throw new Error('finished-clock-retry-verification-failed')"));
assert(app.includes("could not verify and remove every player plan"));

assert(app.includes("if(route==='portal'&&portalData?.activePractice){updatePortalPracticeClock();portalClockTimer=setInterval(updatePortalPracticeClock,500)}"));
assert(!app.includes("portalView==='practice'||portalData.portalType==='coach'||portalData.portalType==='jenkinsPlayer'||portalData.portalType?.startsWith('guest')"));

assert(app.includes("if(portalToken&&r!=='portal')"));
assert(app.includes("portalLoadGeneration++;"));
assert(app.includes("if(r==='portal'&&portalToken&&!portalUnsubscribe&&!portalBusy)loadPlayerPortal()"));

// iPhone/PWA suspend-resume guards

assert(app.includes("document.addEventListener('visibilitychange'"));
assert(app.includes("if(document.visibilityState==='hidden'&&practicePlan)persistPracticeSession()"));
assert(app.includes("if(document.visibilityState==='visible'&&practicePlan&&practiceClock.running)resumeRecoveredPracticeClock()"));
assert(app.includes("window.addEventListener('pagehide',()=>{if(practicePlan)persistPracticeSession()})"));
assert(app.includes("const clockVerified=await verifyPublishedPracticeClock()"));
assert(app.includes("if(clockVerified!==true)"));
assert(app.includes("if(cloudUser&&recoveredPracticeExpired&&practicePlan&&practiceClock.running)"));
assert(app.includes("await finishPracticeClock(true)"));
