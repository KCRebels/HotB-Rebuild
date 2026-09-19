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
assert(app.includes("PORTAL_BUILD_TOKEN='20260919-103'"));
assert(index.includes('portal-button-repair.js?v=20260919-sharetext9'));
assert(index.includes('app.js?v=20260919-portal143'));

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
