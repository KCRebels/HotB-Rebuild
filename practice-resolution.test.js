const assert=require('node:assert/strict');
const fs=require('node:fs');

const source=fs.readFileSync('./app.js','utf8');

function mustInclude(fragment,message){assert.ok(source.includes(fragment),message)}

mustInclude("candidateNotices:Object.fromEntries","Practice Resolution decisions must seal candidate fallback notices");
mustInclude("JSON.stringify(actualNotices)!==JSON.stringify(expectedNotices)","Resolution apply must reject changed fallback notices");
mustInclude("if(resolutionApplying||practiceResolutionApplyToken||practiceResolutionApplyDraftId||practiceResolutionApplyOwnedDraftId)return false","Resolution apply lock must survive rerenders");
mustInclude("HotB deferred setup-draft persistence during Practice Resolution apply.","temporary Resolution mutations must not persist as ordinary drafts");
mustInclude("HotB deferred navigation during Practice Resolution verification.","navigation must not escape an in-flight Resolution transaction");
mustInclude("HotB ignored End Draft while Practice Resolution apply is verifying.","End Draft must not destroy an in-flight Resolution transaction");
mustInclude("HotB Practice Resolution rebuild lost its draft authorization","owned rebuilds that lose authorization must roll back");
mustInclude("practiceResolutionApplyDraftId=null;practiceResolutionApplyOwnedDraftId=null;practiceResolutionApplyToken=null;practiceResolution=null;","practice workspace teardown must clear every Resolution identity");
mustInclude("HotB refused to persist a Practice Resolution draft that did not survive recovery serialization.","Resolution drafts must prove create/restore recovery");
mustInclude("JSON.stringify(savedResolution)!==JSON.stringify(practiceResolution)","resumed Resolution must exactly match its saved object");
mustInclude("Number(r.durationMinutes)!==120||Number(setup.durationMinutes)!==120","rollback snapshot must be bound to the failed 120-minute setup");
mustInclude("if(duration!==120)return false;","persisted Resolution snapshots must always describe the failed 120-minute source");
mustInclude("if(durationMinutes===132&&!practiceResolutionApplyDraftId)","Block 11 must require Resolution authorization");

const selectorBug="attendees=$('[data-practice-player]:checked').map";
assert.equal(source.includes(selectorBug),false,'Build Practice attendee collection must use querySelectorAll helper, never the single-element helper');

const noticeCommit=source.indexOf("modal=practicePlan?.buildNotices?.length?'practiceBuildNotice':null;");
const tokenClear=source.lastIndexOf("practiceResolutionApplyToken=null;",noticeCommit);
assert.ok(tokenClear>=0&&tokenClear<noticeCommit,'Resolution build notice may appear only after the transaction token is cleared');

console.log('practice-resolution static contract tests passed');
