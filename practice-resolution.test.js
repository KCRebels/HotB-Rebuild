const assert=require('node:assert/strict');
const fs=require('node:fs');

const source=fs.readFileSync('./app.js','utf8');

function mustInclude(fragment,message){assert.ok(source.includes(fragment),message)}

mustInclude("candidateNotices:Object.fromEntries","Practice Resolution decisions must seal candidate fallback notices");
mustInclude("const survivingCandidateLabels=new Set([","Resolution must derive candidate evidence from the final filtered coaching choices");
mustInclude("if(!survivingCandidateLabels.has(label))delete verifiedCandidateNotices[label]","filtered Resolution choices must not leave stale candidate evidence");
mustInclude("Practice Resolution candidate evidence did not match the final verified choices.","Resolution must fail closed when final choices and candidate evidence diverge");
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
mustInclude("HotB practice persistence changed the session during save","Resolution commit must reject save-time session mutation");
mustInclude("savedNames.some((name,index)=>name!==liveNames[index])","Resolution restart recovery must preserve exact attendee order");
mustInclude("HotB Practice Resolution restart recovery changed the resolved plan bytes","Resolution restart recovery must preserve the exact committed plan object");
mustInclude("actualNames.some((name,index)=>name!==expectedNames[index])","Resolution final plan must preserve verified attendee order");
mustInclude("expectedNames.some((name,index)=>scheduleKeys[index]!==name)","Resolution schedule ownership must preserve verified attendee order");
mustInclude("catcherLoadNames.length!==new Set(catcherLoadNames).size","Resolution catcher load metadata must reject duplicate identities");
mustInclude("practicePlan.pitcherRepeats.length!==new Set(practicePlan.pitcherRepeats).size","Resolution pitcher repeat metadata must reject duplicate identities");
mustInclude("practicePlan.liveHitterRepeats.length!==new Set(practicePlan.liveHitterRepeats).size","Resolution hitter repeat metadata must reject duplicate identities");
mustInclude("HotB refused a Practice Resolution rollback that changed during cloning","rollback clones must preserve the sealed failed-practice snapshot");
mustInclude("const releaseFailedRollback=message=>","rollback corruption must have one fail-closed transaction release path");
mustInclude("HotB could not clone the Practice Resolution rollback snapshot","rollback clone exceptions must release Resolution ownership safely");
mustInclude("if(Number(practiceSetupState.durationMinutes)!==120)practiceSetupState.durationMinutes=120;","failed rollback recovery must not leave emergency Block 11 duration live");
mustInclude("HotB Practice Resolution rollback failed post-save verification","rollback must remain valid after its recovery save");
mustInclude("selected.some((name,index)=>name!==names[index])","Resolution rollback setup must preserve exact verified attendee order");
mustInclude("!saved.resolution||JSON.stringify(saved.resolution)!==JSON.stringify(r)","Resolution rollback must be byte-identical to its persisted decision object");
mustInclude("JSON.stringify(saved.setupState)!==JSON.stringify(setup)","Resolution rollback must be byte-identical to its persisted failed setup");
mustInclude("HotB ignored Return to Practice Setup while Practice Resolution apply is verifying.","Return to Setup must not race an in-flight Resolution apply");
mustInclude("HotB refused Return to Practice Setup because the verified failed practice could not be reconstructed.","Return to Setup must reconstruct the exact verified failed practice before discarding its seal");
mustInclude("HotB could not persist Return to Practice Setup after Practice Resolution.","Return to Setup must prove its ordinary recovery draft was persisted");
mustInclude("const originalSetup=structuredClone(practiceSetupState),originalResolution=practiceResolution?structuredClone(practiceResolution):null,originalSession=structuredClone(db.activePracticeSession),originalModal=modal;","Return to Setup must snapshot the complete pre-exit Resolution recovery state");
mustInclude("const verifiedResolution=practiceResolutionSnapshotIsCurrentAndValid()?practiceResolution:null;","Return to Setup reconstruction must be driven only by a currently valid Resolution");
mustInclude("HotB refused Return to Practice Setup because a verified player is no longer in the attendance roster.","Return to Setup must fail closed when verified roster identity cannot be reconstructed");
mustInclude("HotB rolled back Return to Practice Setup because recovery changed the ordinary setup.","Return to Setup must restore the sealed Resolution if ordinary recovery serialization drifts");

const selectorBug="attendees=$('[data-practice-player]:checked').map";
assert.equal(source.includes(selectorBug),false,'Build Practice attendee collection must use querySelectorAll helper, never the single-element helper');
mustInclude("attendees=Array.from(document.querySelectorAll('[data-practice-player]:checked')).map","Build Practice must collect the full checked attendee set");
mustInclude("if(resolutionApplyBuild)return;\n  if(practicePlan.buildNotices?.length)","automatic Resolution rebuild must not render an uncommitted builder or notice");
mustInclude("verifiedCandidateNotices[label]=candidateNotices;\n     return true;","candidate notice evidence must publish only after the candidate passes every proof");
mustInclude("actualNames.some((name,index)=>name!==expectedNames[index])","Resolution candidate verification must preserve exact attendee order before a choice is advertised");
mustInclude("scheduleKeys.some((name,index)=>name!==planNames[index])","Resolution candidate schedule ownership must preserve exact attendee order");
mustInclude("HotB Practice Resolution build failed","Resolution candidate verification must fail closed when candidate generation throws");
mustInclude("HotB refused to publish an internally inconsistent Practice Resolution.","new Resolution decisions must pass the full live snapshot validator before display");
mustInclude("HotB could not persist the verified Practice Resolution draft.","a verified Resolution must persist successfully before its modal is shown");
mustInclude("const canonicalStringList=values=>values.length===new Set(values).size","Resolution persisted string collections must be unique and canonical");
mustInclude("candidateNoticeEntries.some(([,values])=>!canonicalStringList(values))","candidate fallback notices must remain canonical after restore");
mustInclude("candidateNoticeEntries.some(([label],index)=>index>0&&candidateNoticeEntries[index-1][0].localeCompare(label)>0)","candidate notice labels must retain canonical order");
mustInclude("HotB refused a Practice Resolution that changed during startup recovery.","startup recovery must preserve the sealed Resolution object byte-for-byte");
mustInclude("HotB ignored Practice Hub Back while Practice Resolution apply is verifying.","Practice Hub Back must not escape an in-flight Resolution transaction");
mustInclude("HotB refused Practice Hub Back because the Practice Resolution draft could not be persisted.","Practice Hub Back must not leave setup when Resolution recovery persistence fails");

const noticeCommit=source.indexOf("modal=practicePlan?.buildNotices?.length?'practiceBuildNotice':null;");
const tokenClear=source.lastIndexOf("practiceResolutionApplyToken=null;",noticeCommit);
assert.ok(tokenClear>=0&&tokenClear<noticeCommit,'Resolution build notice may appear only after the transaction token is cleared');

mustInclude("selectedNames.some((name,index)=>name!==expectedNames[index])","live Resolution validity must preserve exact verified attendee order");
mustInclude("if(duration!==120)return false;","Resolution snapshot validator must reject emergency Block 11 as source state");
mustInclude("if(!r.errors.length)return false;","Resolution snapshots must retain the original failed-build evidence");

mustInclude("const choiceAuthorized=role==='pitcher'","Resolution expected-state construction must authorize against the sealed final choice arrays");
mustInclude("Object.prototype.hasOwnProperty.call(practiceResolution.candidateNotices,'Block 11')","Block 11 apply authorization must retain its sealed candidate evidence");
mustInclude("if(!label||!Object.prototype.hasOwnProperty.call(practiceResolution.candidateNotices,label))return false;","role apply authorization must require its exact sealed candidate evidence");

mustInclude("practiceResolution=null;modal=null;","failed Resolution rollback must not leave an untrusted Resolution modal live");
mustInclude("if(Number(practiceSetupState.durationMinutes)!==120)practiceSetupState.durationMinutes=120;","failed Resolution rollback must remove transient Block 11 duration");
mustInclude("attempting sealed JSON recovery","Resolution rollback must recover from structuredClone failure using its sealed snapshot");
mustInclude("const sealed=JSON.parse(state.rollbackSignature);","Resolution rollback clone fallback must come from the already-verified rollback signature");
mustInclude("HotB could not recover the sealed Practice Resolution rollback snapshot","Resolution rollback must fail closed if sealed recovery also fails");

console.log('practice-resolution static contract tests passed');
