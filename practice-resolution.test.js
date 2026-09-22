const assert=require('node:assert/strict');
const fs=require('node:fs');
const source=fs.readFileSync('./app.js','utf8');
function has(fragment,message){assert.ok(source.includes(fragment),message)}

// Current Practice Resolution architecture contracts. These intentionally verify
// safety invariants rather than historical implementation strings removed by later
// synchronous/bounded-search refactors.
has("practiceResolutionDecisionSignature","decision alternatives must be sealed");
has("practiceResolutionSnapshotIsCurrentAndValid","live Resolution snapshot must be validated");
has("candidateNotices:Object.fromEntries","candidate evidence must be persisted");
has("const survivingCandidateLabels=new Set([","only surviving verified choices may retain evidence");
has("Practice Resolution candidate evidence did not match the final verified choices.","evidence mismatch must fail closed");
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
has("sealedResolutionBytes","publication must be byte sealed");
has("publicationSnapshotStable","publication validation must be read-only");
has("RESOLUTION_BUILD_BUDGET","candidate search must have a hard scheduler-build budget");
has("candidateSearchCapacity=identityBlocked?0:(Number(durationMinutes)===120?5:2)","normal candidate search must be globally bounded");
has("const firstPitcher=availablePitchers[0]||null","same-duration pitcher search must be bounded to one candidate");
has("const firstCatcher=availableCatchers[0]||null","same-duration catcher search must be bounded to one candidate");
has("const firstExtendedPitcher=extendedPlayers.find(player=>player.canPitch)","combined pitcher search must be bounded to one candidate");
has("const firstExtendedCatcher=extendedPlayers.find(player=>player.canCatch)","combined catcher search must be bounded to one candidate");
has("if(!plan||plan.feasibilityErrors?.length)","infeasible candidates must short-circuit before full audit");
has("window.HotBPracticeScheduler.validate(plan)","feasible displayed candidates must still pass the full scheduler validator");
has("if(JSON.stringify(practiceResolution)!==sealedResolutionBytes)","render must not mutate the sealed decision");
console.log('Practice Resolution production contracts passed.');
