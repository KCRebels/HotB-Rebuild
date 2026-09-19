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
assert(app.includes("PORTAL_BUILD_TOKEN='20260919-94'"));
assert(index.includes('portal-button-repair.js?v=20260919-sharetext9'));
assert(index.includes('app.js?v=20260919-portal134'));

assert(app.includes('cloudAuth.signInAnonymously()'));

assert(app.includes("$$('[data-share-portal]').forEach"));
assert(app.includes("$$('[data-text-portal]').forEach"));
assert(app.includes("$$('[data-reset-portal]').forEach"));
assert(!app.includes("$('[data-share-portal]').forEach"));
assert(!app.includes("$('[data-text-portal]').forEach"));

assert(app.includes("previousClockStart=portalData?.activePractice?.clock?.startedAt||''"));
assert(app.includes("delete portalData._localPracticeEnded"));

assert(app.includes('const requestedPortalToken=portalToken'));
assert(app.includes('portalDoc(requestedPortalToken).get()'));
assert(app.includes('portalDoc(requestedPortalToken).onSnapshot'));
assert(app.includes('portalToken!==requestedPortalToken'));
