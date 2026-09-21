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
mustInclude("HotB ignored a stale Practice Resolution rebuild callback","workspace teardown must make the first deferred Resolution callback harmless");
mustInclude("HotB Practice Resolution transaction changed during restart-recovery verification","Resolution ownership must be rechecked at the final commit boundary");
mustInclude("HotB Practice Resolution restart recovery changed the resolved setup identity","Resolution persistence must retain exact resolved setup identity");
mustInclude("HotB refused a Practice Resolution rollback that changed during cloning","rollback clones must preserve the sealed failed-practice snapshot");
mustInclude("HotB Practice Resolution rollback failed post-save verification","rollback must remain valid after its recovery save");
mustInclude("HotB ignored Return to Practice Setup while Practice Resolution apply is verifying.","Return to Setup must not race an in-flight Resolution apply");
mustInclude("HotB refused Return to Practice Setup because the verified failed practice could not be reconstructed.","Return to Setup must reconstruct the exact verified failed practice before discarding its seal");
mustInclude("HotB could not persist Return to Practice Setup after Practice Resolution.","Return to Setup must prove its ordinary recovery draft was persisted");

const selectorBug="attendees=$('[data-practice-player]:checked').map";
assert.equal(source.includes(selectorBug),false,'Build Practice attendee collection must use querySelectorAll helper, never the single-element helper');
mustInclude("attendees=Array.from(document.querySelectorAll('[data-practice-player]:checked')).map","Build Practice must collect the full checked attendee set");
mustInclude("if(resolutionApplyBuild)return;\n  if(practicePlan.buildNotices?.length)","automatic Resolution rebuild must not render an uncommitted builder or notice");
mustInclude("verifiedCandidateNotices[label]=candidateNotices;\n     return true;","candidate notice evidence must publish only after the candidate passes every proof");
mustInclude("HotB refused to publish an internally inconsistent Practice Resolution.","new Resolution decisions must pass the full live snapshot validator before display");
mustInclude("HotB could not persist the verified Practice Resolution draft.","a verified Resolution must persist successfully before its modal is shown");

const noticeCommit=source.indexOf("modal=practicePlan?.buildNotices?.length?'practiceBuildNotice':null;");
const tokenClear=source.lastIndexOf("practiceResolutionApplyToken=null;",noticeCommit);
assert.ok(tokenClear>=0&&tokenClear<noticeCommit,'Resolution build notice may appear only after the transaction token is cleared');

console.log('practice-resolution static contract tests passed');
