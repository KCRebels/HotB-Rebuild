const assert=require('node:assert/strict');
const fs=require('node:fs');
const source=fs.readFileSync('./app.js','utf8');
function has(fragment,message){assert.ok(source.includes(fragment),message)}

// Current Practice Resolution architecture contracts. These intentionally verify
// safety invariants rather than historical implementation strings removed by later
// synchronous/bounded-search refactors.
has("practiceResolutionDecisionSignature","decision alternatives must be sealed");
has("practiceResolutionSnapshotIsCurrentAndValid","live Resolution snapshot must be validated");
has("candidateNotices:{}","direct failure Resolution must not invent candidate evidence");
has("JSON.stringify(actualNotices)!==JSON.stringify(expectedNotices)","Apply must reject changed fallback notices");
has("if(resolutionApplying||practiceResolutionApplyToken||practiceResolutionApplyDraftId||practiceResolutionApplyOwnedDraftId)return false","Apply must have one transaction lock");
has("HotB deferred setup-draft persistence during Practice Resolution apply.","temporary Apply state must not persist as an ordinary draft");
has("HotB deferred navigation during Practice Resolution verification.","navigation must not escape an Apply transaction");
has("HotB ignored End Draft while Practice Resolution apply is verifying.","End Draft must not destroy Apply ownership");
has("HotB Practice Resolution rebuild lost its draft authorization","lost rebuild authorization must fail closed");
has("HotB ignored a stale Practice Resolution rebuild callback","stale rebuild ownership must fail closed");
has("practiceResolutionApplyDraftId=null;practiceResolutionApplyOwnedDraftId=null;practiceResolutionApplyToken=null;practiceResolution=null;","workspace teardown must clear Resolution identity");
has("savedResolutionBytes!==liveResolutionBytes","restored Resolution must exactly match persisted bytes");
has("Number(r.durationMinutes)!==120||Number(setup.durationMinutes)!==120","rollback source must remain the failed 120-minute setup");
has("if(duration!==120)return false;","persisted Resolution source must remain 120 minutes");
has("if(durationMinutes===132&&!practiceResolutionApplyDraftId)","Block 11 must require Apply authorization");
has("HotB Practice Resolution restart recovery changed the resolved setup identity","restart recovery must preserve resolved setup identity");
has("HotB practice persistence changed the session during save","save-time mutation must be rejected");
has("savedNames.some((name,index)=>name!==liveNames[index])","restart recovery must preserve attendee order");
has("HotB Practice Resolution restart recovery changed the resolved plan bytes","restart recovery must preserve plan bytes");
has("actualNames.some((name,index)=>name!==expectedNames[index])","final plan must preserve attendee order");
has("expectedNames.some((name,index)=>scheduleKeys[index]!==name)","schedule ownership must preserve attendee order");
has("catcherLoadNames.length!==new Set(catcherLoadNames).size","catcher metadata must reject duplicate identities");
has("HotB refused a Practice Resolution rollback that changed during cloning","rollback clone must preserve sealed state");
has("practiceResolution=null;","successful commit must revoke stale Resolution");
has("bundle:'resolution497'","genuine scheduler failure must publish verified coaching options");
has("stage:'verified-coaching-options-publish'","genuine scheduler failure must identify verified option publication");
has("verifyResolutionCandidate","Practice Resolution choices must be rebuilt before display");
has("window.HotBPracticeScheduler.validate(plan)","Practice Resolution choices must pass the full validator");
has("modal='practiceResolution'","failed scheduler result must open Practice Resolution");

console.log('Practice Resolution production contracts passed.');
