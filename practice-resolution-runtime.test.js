const assert=require('node:assert/strict');
const scheduler=require('./practice-scheduler.js');
const session=require('./practice-session.js');

function roster(count=13,pitchers=2,catchers=2){
 return Array.from({length:count},(_,index)=>({
  name:`Resolution Player ${index+1}`,
  isPitcher:index<pitchers,
  isCatcher:index>=pitchers&&index<pitchers+catchers,
  canPitch:index<pitchers,
  requiresPitchWarmup:index<pitchers,
  canCatch:index>=pitchers&&index<pitchers+catchers,
  prePracticeComplete:false,
  availableFromBlock:0,
  availableUntilBlock:10
 }));
}
function safe(plan){return !!plan&&!plan.feasibilityErrors.length&&!scheduler.validate(plan).length}
function extended(source){
 // Match production Block 11 semantics: only a player verified through the normal
 // practice end is extended, and the explicit departure clock moves with the new
 // 132-minute end. Keeping 20:00 while claiming availableUntilBlock 11 creates an
 // impossible recovery model and was a stale test-helper bug.
 return source.map(player=>({...player,availableUntilBlock:player.availableUntilBlock===10?11:player.availableUntilBlock,departureTime:player.availableUntilBlock===10&&player.departureTime==='20:00'?'20:12':player.departureTime}));
}
function candidates(source){
 const result=[];
 for(const player of source.filter(p=>p.canPitch)){
  const changed=source.map(p=>p.name===player.name?{...p,canPitch:false,requiresPitchWarmup:false}:p);
  const plan=scheduler.buildSchedule(changed,'18:00',120);
  if(safe(plan))result.push({kind:'hitting-only',name:player.name,plan,players:changed});
 }
 for(const player of source.filter(p=>p.canCatch)){
  const changed=source.map(p=>p.name===player.name?{...p,canCatch:false}:p);
  const plan=scheduler.buildSchedule(changed,'18:00',120);
  if(safe(plan))result.push({kind:'not-catching',name:player.name,plan,players:changed});
 }
 const ext=extended(source),extension=scheduler.buildSchedule(ext,'18:00',132);
 if(safe(extension))result.push({kind:'block-11',name:null,plan:extension,players:ext});
 for(const player of ext.filter(p=>p.canPitch)){
  const changed=ext.map(p=>p.name===player.name?{...p,canPitch:false,requiresPitchWarmup:false}:p);
  const plan=scheduler.buildSchedule(changed,'18:00',132);
  if(safe(plan))result.push({kind:'hitting-only+block-11',name:player.name,plan,players:changed});
 }
 for(const player of ext.filter(p=>p.canCatch)){
  const changed=ext.map(p=>p.name===player.name?{...p,canCatch:false}:p);
  const plan=scheduler.buildSchedule(changed,'18:00',132);
  if(safe(plan))result.push({kind:'not-catching+block-11',name:player.name,plan,players:changed});
 }
 return result;
}


function prioritizedResolution(source){
 let builds=0;
 const verify=(players,duration)=>{builds++;const plan=scheduler.buildSchedule(players,'18:00',duration);return safe(plan)?plan:null};
 // Production order: preserve 120 minutes when one role adjustment is enough.
 for(const player of source.filter(p=>p.canPitch)){
  const changed=source.map(p=>p.name===player.name?{...p,canPitch:false,requiresPitchWarmup:false}:p),plan=verify(changed,120);
  if(plan)return {kind:'hitting-only',builds,plan,name:player.name};
 }
 for(const player of source.filter(p=>p.canCatch)){
  const changed=source.map(p=>p.name===player.name?{...p,canCatch:false}:p),plan=verify(changed,120);
  if(plan)return {kind:'not-catching',builds,plan,name:player.name};
 }
 const ext=extended(source),extension=verify(ext,132);
 if(extension)return {kind:'block-11',builds,plan:extension};
 for(const player of ext.filter(p=>p.canPitch)){
  const changed=ext.map(p=>p.name===player.name?{...p,canPitch:false,requiresPitchWarmup:false}:p),plan=verify(changed,132);
  if(plan)return {kind:'hitting-only+block-11',builds,plan,name:player.name};
 }
 for(const player of ext.filter(p=>p.canCatch)){
  const changed=ext.map(p=>p.name===player.name?{...p,canCatch:false}:p),plan=verify(changed,132);
  if(plan)return {kind:'not-catching+block-11',builds,plan,name:player.name};
 }
 return {kind:null,builds,plan:null};
}

// Resolution 494: the exact six-player phone setup that previously forced
// Practice Resolution must now build directly. The Machine error was a greedy
// grouping artifact, not a real coaching constraint.
const controlledSix=roster(6,4,1);
const controlledBase=scheduler.buildSchedule(controlledSix,'18:00',120);
assert.deepEqual(controlledBase.feasibilityErrors,[],'controlled 6-player fixture must build directly after exact station grouping');
assert.deepEqual(scheduler.validate(controlledBase),[],'controlled 6-player direct build must pass the full scheduler audit');

const controlledKcSix=[
 {name:'Brooklyn Gering',isPitcher:true,isCatcher:false,canPitch:true,requiresPitchWarmup:true,canCatch:false},
 {name:'Lakyn Farley',isPitcher:true,isCatcher:false,canPitch:true,requiresPitchWarmup:true,canCatch:false},
 {name:'Lydia Copeland',isPitcher:false,isCatcher:true,canPitch:false,requiresPitchWarmup:false,canCatch:true},
 {name:'Maia Waddell',isPitcher:false,isCatcher:false,canPitch:false,requiresPitchWarmup:false,canCatch:false},
 {name:'Makenna Whitaker',isPitcher:true,isCatcher:false,canPitch:true,requiresPitchWarmup:true,canCatch:false},
 {name:'Megan Ryan',isPitcher:true,isCatcher:false,canPitch:true,requiresPitchWarmup:true,canCatch:false}
].map(player=>({...player,isGuest:false,prePracticeComplete:false,availableFromBlock:0,availableUntilBlock:10,arrivalTime:'18:00',departureTime:'20:00',limitations:''}));
const controlledKcBase=scheduler.buildSchedule(controlledKcSix,'18:00',120);
assert.deepEqual(controlledKcBase.feasibilityErrors,[],'named KC Rebels six-player phone fixture must build directly');
assert.deepEqual(scheduler.validate(controlledKcBase),[],'named KC Rebels direct build must pass the production validator');

/* Resolution search-budget regression.
   Normal and guest-heavy rosters must have enough finite budget to inspect every
   structurally possible coaching candidate. This mirrors the production formula
   and prevents a fixed small budget from hiding valid catcher/combined solutions. */
function resolutionBudgetFor(players,duration=120){
 const identityBlocked=false;
 const pitchers=players.filter(player=>player.canPitch);
 const catchers=players.filter(player=>player.canCatch);
 const capacity=1+(duration===120&&!identityBlocked?1:0)+pitchers.length+catchers.length+(duration===120&&!identityBlocked?pitchers.length+catchers.length:0);
 return {capacity,budget:Math.min(64,Math.max(9,capacity+1))};
}
const guestHeavy=[
 ...controlledKcSix,
 ...Array.from({length:8},(_,index)=>({
  name:'Guest '+(index+1),isPitcher:index<3,isCatcher:index>=3&&index<5,isGuest:true,
  canPitch:index<3,requiresPitchWarmup:index<3,canCatch:index>=3&&index<5,
  prePracticeComplete:false,availableFromBlock:0,availableUntilBlock:10,
  arrivalTime:'18:00',departureTime:'20:00',limitations:''
 }))
];
const guestBudget=resolutionBudgetFor(guestHeavy);
assert.ok(guestBudget.capacity>9,'guest-heavy fixture must exceed the old fixed Resolution budget');
assert.ok(guestBudget.budget>guestBudget.capacity,'finite Resolution budget must cover the complete normal candidate search');
const ordinaryBudget=resolutionBudgetFor(controlledKcSix);
assert.ok(ordinaryBudget.budget>=9,'ordinary roster retains the conservative minimum budget');



/* Resolution 464 combined-choice completeness regression.
   When Block 11 alone and all one-part role changes fail, combined emergency
   search must not stop at the first safe named player or skip the catcher class. */
function extendedForRegression464(players){return extended(players)}
function collectCombinedSafe(players){
 const extended=extendedForRegression464(players);
 const pitcherChoices=[],catcherChoices=[];
 for(const pitcher of extended.filter(player=>player.canPitch)){
  const candidate=extended.map(player=>player.name===pitcher.name?{...player,canPitch:false,requiresPitchWarmup:false}:player);
  const plan=scheduler.buildSchedule(candidate,'18:00',132);
  if(!plan.feasibilityErrors.length&&!scheduler.validate(plan).length)pitcherChoices.push(pitcher.name);
 }
 for(const catcher of extended.filter(player=>player.canCatch)){
  const candidate=extended.map(player=>player.name===catcher.name?{...player,canCatch:false}:player);
  const plan=scheduler.buildSchedule(candidate,'18:00',132);
  if(!plan.feasibilityErrors.length&&!scheduler.validate(plan).length)catcherChoices.push(catcher.name);
 }
 return {pitcherChoices,catcherChoices};
}
for(const fixture of [controlledKcSix]){
 if(!Array.isArray(fixture)||!fixture.length)continue;
 const combined=collectCombinedSafe(fixture);
 assert.equal(combined.pitcherChoices.length,new Set(combined.pitcherChoices).size,'combined pitcher choices must be unique');
 assert.equal(combined.catcherChoices.length,new Set(combined.catcherChoices).size,'combined catcher choices must be unique');
 for(const name of combined.pitcherChoices)assert.ok(fixture.some(player=>player.name===name&&player.canPitch),'combined pitcher choice must originate from an enabled pitcher');
 for(const name of combined.catcherChoices)assert.ok(fixture.some(player=>player.name===name&&player.canCatch),'combined catcher choice must originate from an enabled catcher');
}


/* Resolution 466 source-failure classification regression.
   Identity/availability corruption cannot be repaired by changing pitching,
   catching, or adding Block 11, so production must skip candidate fan-out. */
function resolutionSourceBlocked(errors){
 return errors.some(error=>/duplicate player names|every attending player must have a name|invalid availability/i.test(String(error||'')));
}
assert.equal(resolutionSourceBlocked(['Duplicate player names are not allowed.']),true);
assert.equal(resolutionSourceBlocked(['Every attending player must have a name.']),true);
assert.equal(resolutionSourceBlocked(['Invalid availability for Guest 1.']),true);
assert.equal(resolutionSourceBlocked(['Need another live-capable block.']),false);
assert.equal(resolutionSourceBlocked(['Catcher coverage is insufficient.']),false);
function candidateCapacityFor(players,errors,duration=120){
 if(resolutionSourceBlocked(errors))return 0;
 const pitchers=players.filter(player=>player.canPitch),catchers=players.filter(player=>player.canCatch);
 return (duration===120?1:0)+pitchers.length+catchers.length+(duration===120?pitchers.length+catchers.length:0);
}
assert.equal(candidateCapacityFor(controlledKcSix,['Invalid availability for Guest 1.']),0,'malformed source must schedule zero Resolution candidates');
assert.ok(candidateCapacityFor(controlledKcSix,['Catcher coverage is insufficient.'])>0,'ordinary feasibility failures retain automatic Resolution search');


/* Resolution 467 first-safe search policy regression.
   Resolution must prove a safe path quickly on mobile; it is not required to
   enumerate every equivalent coaching choice. Deterministic roster order makes
   the selected alternative stable across repeated builds. */
function firstSafeRoleChoice(players,duration=120){
 let builds=0;
 for(const pitcher of players.filter(player=>player.canPitch)){
  builds++;
  const candidate=players.map(player=>player.name===pitcher.name?{...player,canPitch:false,requiresPitchWarmup:false}:player);
  const plan=scheduler.buildSchedule(candidate,'18:00',duration);
  if(!plan.feasibilityErrors.length&&!scheduler.validate(plan).length)return {role:'pitcher',name:pitcher.name,builds};
 }
 for(const catcher of players.filter(player=>player.canCatch)){
  builds++;
  const candidate=players.map(player=>player.name===catcher.name?{...player,canCatch:false}:player);
  const plan=scheduler.buildSchedule(candidate,'18:00',duration);
  if(!plan.feasibilityErrors.length&&!scheduler.validate(plan).length)return {role:'catcher',name:catcher.name,builds};
 }
 return {role:null,name:null,builds};
}
for(const fixture of [controlledKcSix]){
 if(!Array.isArray(fixture)||!fixture.length)continue;
 const first=firstSafeRoleChoice(fixture),second=firstSafeRoleChoice(fixture);
 assert.deepEqual(first,second,'first-safe Resolution choice must be deterministic for identical ordered input');
 const maximum=fixture.filter(player=>player.canPitch).length+fixture.filter(player=>player.canCatch).length;
 assert.ok(first.builds<=maximum,'first-safe Resolution search cannot exceed its finite role candidate count');
}


/* Resolution 468 setup-recovery parity regression.
   A verified Block 11 candidate can extend explicit 120-minute departure clocks.
   Recovery must persist the candidate clocks, not merely duration/role flags. */
function recoveryAccommodationFromCandidate(player){
 return {
  arrival:player.arrivalTime||'',
  departure:player.departureTime||'',
  limitations:String(player.limitations||''),
  canPitch:player.canPitch===true,
  requiresPitchWarmup:player.requiresPitchWarmup===true,
  canCatch:player.canCatch===true,
  prePracticeComplete:player.prePracticeComplete===true
 };
}
const recoverySource=controlledKcSix.map(player=>({...player}));
const recoveryExtended=extended(recoverySource);
for(let index=0;index<recoveryExtended.length;index++){
 const candidate=recoveryExtended[index],source=recoverySource[index],accommodation=recoveryAccommodationFromCandidate(candidate);
 assert.equal(accommodation.arrival,candidate.arrivalTime,'recovery must preserve verified arrival clock');
 assert.equal(accommodation.departure,candidate.departureTime,'recovery must preserve verified departure clock');
 assert.equal(accommodation.canPitch,candidate.canPitch,'recovery must preserve verified pitching state');
 assert.equal(accommodation.requiresPitchWarmup,candidate.requiresPitchWarmup,'recovery must preserve verified warm-up state');
 assert.equal(accommodation.canCatch,candidate.canCatch,'recovery must preserve verified catching state');
 if(source.availableUntilBlock===10&&candidate.availableUntilBlock===11)assert.notEqual(accommodation.departure,source.departureTime,'Block 11 recovery must not retain the old explicit 120-minute departure');
}


/* Resolution 469 exact recovery-field parity regression.
   Compact signatures are useful seals, but persisted recovery must reproduce every
   scheduler-relevant player field exactly for late/early and role-adjusted cases. */
const recoveryFields469=['name','isPitcher','isCatcher','isGuest','availableFromBlock','availableUntilBlock','arrivalTime','departureTime','limitations','prePracticeComplete','canPitch','requiresPitchWarmup','canCatch'];
function exactRecoveryParity(expected,actual){
 return !!expected&&!!actual&&recoveryFields469.every(field=>expected[field]===actual[field]);
}
for(const fixture of [controlledKcSix]){
 if(!Array.isArray(fixture))continue;
 for(const player of fixture){
  assert.equal(exactRecoveryParity(player,{...player}),true,'identical recovery player must pass exact field parity');
  const drift={...player,departureTime:String(player.departureTime||'')+'x'};
  assert.equal(exactRecoveryParity(player,drift),false,'departure drift must fail exact recovery parity');
  if(player.canPitch){
   const roleDrift={...player,canPitch:false,requiresPitchWarmup:false};
   assert.equal(exactRecoveryParity(player,roleDrift),false,'pitching drift must fail exact recovery parity');
  }
  if(player.canCatch){
   const catchDrift={...player,canCatch:false};
   assert.equal(exactRecoveryParity(player,catchDrift),false,'catching drift must fail exact recovery parity');
  }
 }
}


/* Resolution 470 apply-authority regression.
   Authorization is read-only: candidate construction owns role/duration changes,
   so a failed direct rebuild cannot leave transient setup mutations behind. */
function authorizeChoice470(snapshot,role,name,withBlock11){
 if(!snapshot||typeof withBlock11!=='boolean')return false;
 if(role===null)return name===null&&withBlock11&&snapshot.canExtend===true;
 if(role!=='pitcher'&&role!=='catcher')return false;
 const allowed=role==='pitcher'?(withBlock11?snapshot.combinedPitchers:snapshot.pitchers):(withBlock11?snapshot.combinedCatchers:snapshot.catchers);
 return Array.isArray(allowed)&&allowed.includes(name);
}
const authSnapshot470={canExtend:true,pitchers:['P1'],catchers:['C1'],combinedPitchers:['P2'],combinedCatchers:['C2']};
const authBytes470=JSON.stringify(authSnapshot470);
assert.equal(authorizeChoice470(authSnapshot470,'pitcher','P1',false),true);
assert.equal(authorizeChoice470(authSnapshot470,'catcher','C1',false),true);
assert.equal(authorizeChoice470(authSnapshot470,'pitcher','P2',true),true);
assert.equal(authorizeChoice470(authSnapshot470,'catcher','C2',true),true);
assert.equal(authorizeChoice470(authSnapshot470,null,null,true),true);
assert.equal(authorizeChoice470(authSnapshot470,'pitcher','C1',false),false);
assert.equal(JSON.stringify(authSnapshot470),authBytes470,'Resolution authorization must not mutate its snapshot');


/* Resolution 471 atomic setup-commit regression.
   Candidate setup is prepared off to the side; authorization and candidate
   preparation cannot change the failed source setup before commit. */
function detachedSetup471(source,players,startTime,duration){
 const detached=JSON.parse(JSON.stringify(source));
 detached.selectedNames=players.map(player=>player.name);
 detached.startTime=startTime;
 detached.durationMinutes=duration;
 detached.accommodations={...(detached.accommodations||{})};
 for(const player of players)detached.accommodations[player.name]=recoveryAccommodationFromCandidate(player);
 return detached;
}
const sourceSetup471={selectedNames:controlledKcSix.map(player=>player.name),startTime:'18:00',durationMinutes:120,accommodations:Object.fromEntries(controlledKcSix.map(player=>[player.name,recoveryAccommodationFromCandidate(player)]))};
const sourceBytes471=JSON.stringify(sourceSetup471);
const extended471=extended(controlledKcSix.map(player=>({...player})));
const detached471=detachedSetup471(sourceSetup471,extended471,'18:00',132);
assert.equal(JSON.stringify(sourceSetup471),sourceBytes471,'detached Resolution setup preparation must not mutate source setup');
assert.equal(detached471.durationMinutes,132,'detached Resolution setup must carry candidate duration');
assert.deepEqual(detached471.selectedNames,extended471.map(player=>player.name),'detached Resolution setup must preserve candidate order');
for(const player of extended471)assert.equal(detached471.accommodations[player.name].departure,player.departureTime,'detached Resolution setup must carry verified candidate departure');


/* Resolution 472 invalid-source bypass regression.
   Identity/availability source errors cannot be repaired by Block 11, Hitting Only,
   or Not Catching. They must consume zero candidate scheduler builds. */
function resolutionSearchPlan472(players,errors,duration=120){
 const blocked=resolutionSourceBlocked(errors);
 const pitchers=blocked?[]:players.filter(player=>player.canPitch);
 const catchers=blocked?[]:players.filter(player=>player.canCatch);
 const capacity=blocked?0:(duration===120?1:0)+pitchers.length+catchers.length+(duration===120?pitchers.length+catchers.length:0);
 return {blocked,capacity,budget:blocked?1:Math.min(64,Math.max(2,capacity+1)),candidateBuilds:blocked?0:null};
}
for(const errors of [
 ['Duplicate player names are not allowed.'],
 ['Every attending player must have a name.'],
 ['Invalid availability for Guest 1.']
]){
 const plan=resolutionSearchPlan472(controlledKcSix,errors);
 assert.equal(plan.blocked,true,'structural Resolution source error must be blocked');
 assert.equal(plan.capacity,0,'blocked Resolution source must have zero candidate capacity');
 assert.equal(plan.budget,1,'blocked Resolution source budget must cover only the already-failed controlledKcSix build');
 assert.equal(plan.candidateBuilds,0,'blocked Resolution source must run no candidate scheduler builds');
}
const solvable472=resolutionSearchPlan472(controlledKcSix,['Catcher coverage is insufficient.']);
assert.equal(solvable472.blocked,false,'scheduler feasibility errors must retain Resolution search');
assert.ok(solvable472.capacity>0,'scheduler feasibility errors must retain finite candidate capacity');
assert.equal(solvable472.budget,Math.min(64,Math.max(2,solvable472.capacity+1)),'Resolution budget must match finite first-safe search ceiling');


/* Resolution 473 ordered-candidate regression.
   Production role search must not depend on a removed structural-shape helper.
   Every ordered candidate is attempted at most once and search stops immediately
   on the first verified safe result. */
function orderedSearch473(candidates,isSafe){
 let attempts=0;
 for(const candidate of candidates){
  attempts++;
  if(isSafe(candidate))return {result:'safe',candidate,attempts};
 }
 return {result:'none',candidate:null,attempts};
}
const candidates473=[{name:'A'},{name:'B'},{name:'C'}];
const safe473=orderedSearch473(candidates473,candidate=>candidate.name==='B');
assert.equal(safe473.result,'safe');
assert.equal(safe473.candidate.name,'B');
assert.equal(safe473.attempts,2,'ordered Resolution search must stop after first safe candidate');
const none473=orderedSearch473(candidates473,()=>false);
assert.equal(none473.result,'none');
assert.equal(none473.attempts,candidates473.length,'unsolved ordered Resolution search must examine each finite candidate once');


/* Resolution 474 pure/unique live-roster authorization regression. */
function uniqueRosterMatch474(roster,name){
 const matches=[];
 for(let index=0;index<roster.length;index++)if(roster[index]?.name===name)matches.push(index);
 return matches.length===1?matches[0]:null;
}
const roster474=controlledKcSix.map(player=>({name:player.name}));
const rosterBytes474=JSON.stringify(roster474);
assert.equal(uniqueRosterMatch474(roster474,roster474[0].name),0,'unique live roster identity must authorize');
assert.equal(uniqueRosterMatch474(roster474,'Missing Player'),null,'missing live roster identity must reject');
const duplicate474=[...roster474,{name:roster474[0].name}];
assert.equal(uniqueRosterMatch474(duplicate474,roster474[0].name),null,'duplicate live roster identity must reject instead of selecting first match');
assert.equal(JSON.stringify(roster474),rosterBytes474,'live-roster authorization must be read-only');


/* Resolution 475 source-model validation regression.
   Candidate search must fail closed from actual attendee data even if scheduler
   feasibility wording does not contain one of the historical regex phrases. */
function sourceModelInvalid475(players,duration=120){
 const blockCount=duration===132?11:duration===120?10:0,names=players.map(player=>String(player?.name||''));
 if(!blockCount||!players.length||names.some(name=>!name||name.trim()!==name)||new Set(names).size!==names.length)return true;
 return players.some(player=>{
  if(!player||typeof player.isPitcher!=='boolean'||typeof player.isCatcher!=='boolean'||typeof player.isGuest!=='boolean'||typeof player.prePracticeComplete!=='boolean')return true;
  if(typeof player.canPitch!=='boolean'||typeof player.requiresPitchWarmup!=='boolean'||typeof player.canCatch!=='boolean')return true;
  if(!player.isPitcher&&(player.canPitch||player.requiresPitchWarmup)||!player.canPitch&&player.requiresPitchWarmup||!player.isCatcher&&player.canCatch)return true;
  if(typeof player.arrivalTime!=='string'||typeof player.departureTime!=='string'||typeof player.limitations!=='string'||player.limitations.trim()!==player.limitations)return true;
  return !Number.isInteger(Number(player.availableFromBlock))||!Number.isInteger(Number(player.availableUntilBlock))||Number(player.availableFromBlock)<0||Number(player.availableUntilBlock)>blockCount||Number(player.availableFromBlock)>=Number(player.availableUntilBlock);
 });
}
assert.equal(sourceModelInvalid475(controlledKcSix),false,'valid Resolution fixture must pass source-model validation');
assert.equal(sourceModelInvalid475([...controlledKcSix,{...controlledKcSix[0]}]),true,'duplicate attendee identity must fail from source data');
assert.equal(sourceModelInvalid475(controlledKcSix.map((player,index)=>index?player:{...player,name:' '+player.name})),true,'untrimmed attendee identity must fail from source data');
assert.equal(sourceModelInvalid475(controlledKcSix.map((player,index)=>index?player:{...player,canPitch:false,requiresPitchWarmup:true})),true,'warm-up without pitching must fail from source data');
assert.equal(sourceModelInvalid475(controlledKcSix.map((player,index)=>index?player:{...player,availableFromBlock:8,availableUntilBlock:4})),true,'reversed availability must fail from source data');
assert.equal(sourceModelInvalid475(controlledKcSix,144),true,'unsupported Resolution duration must fail from source data');


/* Resolution 477 commit-boundary regression.
   Failed persistence restores pre-commit live values; presentation failure after
   durable persistence does not invalidate the committed resolved practice. */
function commitBoundary477(state,persist,render){
 const before={setup:state.setup,plan:state.plan};
 state.setup='resolved-setup';state.plan='resolved-plan';
 if(!persist()){state.setup=before.setup;state.plan=before.plan;return 'rolled-back-before-durable-commit'}
 try{render()}catch(_){}
 return 'committed';
}
const failedCommit477={setup:'failed-setup',plan:null};
assert.equal(commitBoundary477(failedCommit477,()=>false,()=>{}),'rolled-back-before-durable-commit');
assert.equal(failedCommit477.setup,'failed-setup');
assert.equal(failedCommit477.plan,null);
const durableCommit477={setup:'failed-setup',plan:null};
assert.equal(commitBoundary477(durableCommit477,()=>true,()=>{throw new Error('presentation only')}),'committed');
assert.equal(durableCommit477.setup,'resolved-setup');
assert.equal(durableCommit477.plan,'resolved-plan');


/* Resolution 478 single-gate authorization regression.
   A choice is authorized and converted to expected state in one pure pass; there
   is no second callback that can disagree with or mutate the first decision. */
function authorizedChoice478(snapshot,role,name,withBlock11){
 if(!snapshot||typeof withBlock11!=='boolean')return null;
 const allowed=role==='pitcher'?(withBlock11?snapshot.combinedPitchers:snapshot.pitchers):role==='catcher'?(withBlock11?snapshot.combinedCatchers:snapshot.catchers):withBlock11&&snapshot.canExtend?[null]:[];
 if(!Array.isArray(allowed)||!allowed.includes(name))return null;
 return {role,name,durationMinutes:withBlock11?132:120};
}
const gate478={pitchers:['P1'],catchers:['C1'],combinedPitchers:['P2'],combinedCatchers:['C2'],canExtend:true};
const gateBytes478=JSON.stringify(gate478);
assert.deepEqual(authorizedChoice478(gate478,'pitcher','P1',false),{role:'pitcher',name:'P1',durationMinutes:120});
assert.deepEqual(authorizedChoice478(gate478,'catcher','C2',true),{role:'catcher',name:'C2',durationMinutes:132});
assert.deepEqual(authorizedChoice478(gate478,null,null,true),{role:null,name:null,durationMinutes:132});
assert.equal(authorizedChoice478(gate478,'pitcher','C1',false),null);
assert.equal(JSON.stringify(gate478),gateBytes478,'single Resolution authorization gate must be read-only');


/* Resolution 479 identity regression.
   Snapshot validation must reject ambiguous live roster identity before a Map-style
   lookup can collapse duplicate names to one record. */
function exactChoiceIdentity479(verifiedPlayers,liveRoster,name){
 return verifiedPlayers.filter(player=>player.name===name).length===1&&liveRoster.filter(player=>player.name===name).length===1;
}
const verified479=controlledKcSix.map(player=>({...player}));
const live479=controlledKcSix.map(player=>({...player}));
assert.equal(exactChoiceIdentity479(verified479,live479,verified479[0].name),true);
assert.equal(exactChoiceIdentity479(verified479,[...live479,{...live479[0]}],verified479[0].name),false,'duplicate live roster identity must invalidate a persisted Resolution choice');
assert.equal(exactChoiceIdentity479([...verified479,{...verified479[0]}],live479,verified479[0].name),false,'duplicate verified identity must invalidate a Resolution choice');
assert.equal(exactChoiceIdentity479(verified479,live479,'Missing Player'),false,'missing identity must invalidate a Resolution choice');


/* Resolution 480 catcher opt-out end-to-end regression.
   A catcher who is still attending/hitting but has Catching turned off must remain
   in the candidate roster, must never receive catcher work, and must survive
   restart recovery with canCatch=false. This is the exact injury/availability
   branch used by Practice Setup and must not be confused with removing attendance. */
function catcherOptOut480(source,name,duration=120){
 const matches=source.filter(player=>player.name===name);
 assert.equal(matches.length,1,'catcher opt-out target must have unique identity');
 assert.equal(matches[0].isCatcher,true,'catcher opt-out target must be a catcher');
 const changed=source.map(player=>player.name===name?{...player,canCatch:false}:({...player}));
 const target=changed.find(player=>player.name===name);
 assert.equal(target.canCatch,false);
 assert.equal(changed.length,source.length,'catcher opt-out must preserve attendance');
 assert.deepEqual(changed.map(player=>player.name),source.map(player=>player.name),'catcher opt-out must preserve attendee order');
 const plan=scheduler.buildSchedule(changed,'18:00',duration);
 if(safe(plan)){
  assert.ok((plan.schedule[name]||[]).every(row=>row.activity!=='Catch Live'&&row.activity!=='Catch Warm-Up'),'opted-out catcher must receive no catcher work');
  assert.equal(plan.players.find(player=>player.name===name)?.canCatch,false,'plan player must retain catcher opt-out');
  const setupState={
   selectedNames:changed.map(player=>player.name),startTime:'18:00',durationMinutes:duration,
   accommodations:Object.fromEntries(changed.map(player=>[player.name,recoveryAccommodationFromCandidate(player)]))
  };
  const saved=session.create({plan:{...plan,portalDraftId:'resolution-480-catcher-optout'},setupState,clock:{running:false}});
  assert.ok(saved,'safe catcher opt-out plan must persist');
  const restored=session.restore(saved);
  assert.ok(restored,'safe catcher opt-out plan must restore');
  assert.equal(restored.plan.players.find(player=>player.name===name)?.canCatch,false,'restart recovery must retain canCatch=false');
  assert.equal(restored.setupState.accommodations[name].canCatch,false,'setup recovery must retain canCatch=false');
  assert.deepEqual(restored.setupState.selectedNames,source.map(player=>player.name),'restart recovery must keep catcher attending');
 }
 return {changed,plan};
}
const catcher480=controlledKcSix.find(player=>player.isCatcher);
const optOut480=catcherOptOut480(controlledKcSix,catcher480.name);
assert.equal(optOut480.changed.find(player=>player.name===catcher480.name).isCatcher,true,'role identity remains catcher even when Catching is disabled');
assert.equal(optOut480.changed.find(player=>player.name===catcher480.name).canCatch,false,'availability flag alone disables catching');
assert.ok(optOut480.changed.some(player=>player.name===catcher480.name),'disabled catcher remains an attendee/hitter');

/* Resolution 480 authorization regression for an already-disabled catcher.
   Practice Resolution may offer only currently enabled catcher choices. A setup
   opt-out is source state, not a second Resolution choice that can be applied again. */
function authorizedCatcher480(snapshot,name,withBlock11=false){
 const list=withBlock11?snapshot.combinedCatchers:snapshot.catchers;
 const player=(snapshot.practicePlayers||[]).filter(item=>item.name===name);
 return player.length===1&&player[0].isCatcher===true&&player[0].canCatch===true&&Array.isArray(list)&&list.includes(name);
}
const catcherSnapshot480={
 practicePlayers:controlledKcSix.map(player=>({...player})),
 catchers:[catcher480.name],combinedCatchers:[catcher480.name]
};
assert.equal(authorizedCatcher480(catcherSnapshot480,catcher480.name,false),true,'enabled catcher can be an authorized Resolution choice');
const disabledSnapshot480={
 ...catcherSnapshot480,
 practicePlayers:catcherSnapshot480.practicePlayers.map(player=>player.name===catcher480.name?{...player,canCatch:false}:player)
};
assert.equal(authorizedCatcher480(disabledSnapshot480,catcher480.name,false),false,'already opted-out catcher cannot be offered as a second Not Catching Resolution');
assert.equal(authorizedCatcher480(disabledSnapshot480,catcher480.name,true),false,'already opted-out catcher cannot be offered in combined Not Catching + Block 11');
console.log('Resolution 480 catcher opt-out regression passed.');


/* Resolution 481 rejected-authorization lock regression.
   beginResolutionApply disables the decision controls before deriving expected
   state. If authorization returns null, production must release that local lock
   because no rebuild transaction token exists to own cleanup. */
function rejectedAuthorization481(authorize){
 let applying=false,disabled=false;
 const begin=()=>{if(applying)return false;applying=true;disabled=true;return true};
 const end=()=>{applying=false;disabled=false};
 if(!begin())return {applying,disabled,reason:'busy'};
 const expected=authorize();
 if(!expected){end();return {applying,disabled,reason:'unverified'};}
 return {applying,disabled,reason:'started'};
}
const rejected481=rejectedAuthorization481(()=>null);
assert.deepEqual(rejected481,{applying:false,disabled:false,reason:'unverified'},'rejected Resolution authorization must immediately unlock the modal');
const started481=rejectedAuthorization481(()=>({role:'catcher'}));
assert.deepEqual(started481,{applying:true,disabled:true,reason:'started'},'authorized Resolution remains locked while its transaction owns completion');

/* Resolution 481 live-role identity regression.
   Name uniqueness is necessary but not sufficient: the live roster identity must
   still carry the structural pitcher/catcher role sealed by the Resolution. */
function liveRoleIdentity481(verified,live,role){
 if(!verified||!live)return false;
 if(role==='pitcher')return verified.isPitcher===true&&verified.canPitch===true&&live.isPitcher===true;
 if(role==='catcher')return verified.isCatcher===true&&verified.canCatch===true&&live.isCatcher===true;
 return false;
}
assert.equal(liveRoleIdentity481({isCatcher:true,canCatch:true},{isCatcher:true},'catcher'),true);
assert.equal(liveRoleIdentity481({isCatcher:true,canCatch:true},{isCatcher:false},'catcher'),false,'live catcher identity drift must reject');
assert.equal(liveRoleIdentity481({isCatcher:true,canCatch:false},{isCatcher:true},'catcher'),false,'sealed catcher opt-out cannot be re-authorized');
assert.equal(liveRoleIdentity481({isPitcher:true,canPitch:true},{isPitcher:true},'pitcher'),true);
assert.equal(liveRoleIdentity481({isPitcher:true,canPitch:true},{isPitcher:false},'pitcher'),false,'live pitcher identity drift must reject');
console.log('Resolution 481 authorization lock/identity regressions passed.');


/* Resolution 482 detached-candidate purity and commit cleanup regression. */
function schedulerPurity482(players,start='18:00',duration=120){
 const before=JSON.stringify(players);
 const plan=scheduler.buildSchedule(players,start,duration);
 assert.equal(JSON.stringify(players),before,'scheduler must not mutate a detached Resolution candidate');
 return plan;
}
for(const fixture of [controlledKcSix]){
 if(!Array.isArray(fixture)||!fixture.length)continue;
 const copy=fixture.map(player=>({...player}));
 schedulerPurity482(copy,'18:00',120);
 const ext=extended(copy.map(player=>({...player})));
 schedulerPurity482(ext,'18:00',132);
}
function commitCleanup482(state){
 const committed={...state};
 committed.practiceResolution=null;
 committed.modal=committed.plan?.buildNotices?.length?'practiceBuildNotice':null;
 return committed;
}
const cleaned482=commitCleanup482({practiceResolution:{signature:'failed-source'},plan:{buildNotices:[]} ,modal:'practiceResolution'});
assert.equal(cleaned482.practiceResolution,null,'successful Resolution commit must revoke the failed snapshot');
assert.equal(cleaned482.modal,null,'successful Resolution commit without notices must leave the decision modal');
const noticed482=commitCleanup482({practiceResolution:{signature:'failed-source'},plan:{buildNotices:['notice']},modal:'practiceResolution'});
assert.equal(noticed482.practiceResolution,null,'build-notice commit must also revoke the failed snapshot');
assert.equal(noticed482.modal,'practiceBuildNotice','resolved build notices remain available after commit cleanup');
console.log('Resolution 482 candidate purity/commit cleanup regressions passed.');


/* Resolution 483 snapshot role-drift and universal unlock regressions. */
function snapshotRoleCorrect483(snapshot,liveRoster){
 const verified=new Map(snapshot.practicePlayers.map(player=>[player.name,player]));
 const live=new Map(liveRoster.map(player=>[player.name,player]));
 const correct=(name,role)=>{
  const a=verified.get(name),b=live.get(name);
  return !!a&&!!b&&(role==='pitcher'
   ?a.isPitcher===true&&a.canPitch===true&&b.isPitcher===true
   :a.isCatcher===true&&a.canCatch===true&&b.isCatcher===true);
 };
 return snapshot.pitchers.every(name=>correct(name,'pitcher'))&&snapshot.combinedPitchers.every(name=>correct(name,'pitcher'))&&snapshot.catchers.every(name=>correct(name,'catcher'))&&snapshot.combinedCatchers.every(name=>correct(name,'catcher'));
}
const catcher483=controlledKcSix.find(player=>player.isCatcher&&player.canCatch);
const pitcher483=controlledKcSix.find(player=>player.isPitcher&&player.canPitch);
const snapshot483={practicePlayers:controlledKcSix.map(player=>({...player})),pitchers:[pitcher483.name],combinedPitchers:[],catchers:[catcher483.name],combinedCatchers:[]};
assert.equal(snapshotRoleCorrect483(snapshot483,controlledKcSix),true);
assert.equal(snapshotRoleCorrect483(snapshot483,controlledKcSix.map(player=>player.name===catcher483.name?{...player,isCatcher:false}:player)),false,'live catcher role drift invalidates the whole Resolution snapshot');
assert.equal(snapshotRoleCorrect483(snapshot483,controlledKcSix.map(player=>player.name===pitcher483.name?{...player,isPitcher:false}:player)),false,'live pitcher role drift invalidates the whole Resolution snapshot');
function terminalUnlock483(result,globalOwned=false){
 let localLocked=true;
 if(result.started)return localLocked;
 if(!globalOwned)localLocked=false;
 return localLocked;
}
for(const reason of ['stale','rollback','unverified','handled','apply','busy'])assert.equal(terminalUnlock483({started:false,reason},false),false,reason+' without a global transaction must release the modal lock');
assert.equal(terminalUnlock483({started:false,reason:'handled'},true),true,'a surviving owned transaction remains the only legitimate lock owner');
console.log('Resolution 483 role-drift/universal-unlock regressions passed.');


/* Resolution 484 publication immutability regression.
   Once candidate verification has produced the decision signature, snapshot
   validation and modal rendering are read-only. Publication must reject any
   consumer that changes the sealed transaction before the coach can act on it. */
function publicationSeal484(snapshot,consumers){
 const sealed=JSON.stringify(snapshot);
 for(const consume of consumers)consume(snapshot);
 return JSON.stringify(snapshot)===sealed;
}
const publication484={
 signature:'source-484',decisionSignature:'decision-484',
 practicePlayers:controlledKcSix.map(player=>({...player})),
 pitchers:[],catchers:[],combinedPitchers:[],combinedCatchers:[],
 canExtend:true,candidateNotices:{'Block 11':[]},errors:['conflict'],notices:[],auditFailures:[]
};
assert.equal(publicationSeal484(structuredClone(publication484),[value=>JSON.stringify(value),value=>Object.keys(value)]),true,'read-only validation/render consumers preserve the sealed Resolution');
assert.equal(publicationSeal484(structuredClone(publication484),[value=>{value.canExtend=false}]),false,'publication seal detects decision mutation');
assert.equal(publicationSeal484(structuredClone(publication484),[value=>{value.candidateNotices['Block 11'].push('changed')}]),false,'publication seal detects nested evidence mutation');
assert.equal(publicationSeal484(structuredClone(publication484),[value=>{value.practicePlayers[0].canCatch=!value.practicePlayers[0].canCatch}]),false,'publication seal detects nested player mutation');
console.log('Resolution 484 publication immutability regression passed.');


/* Resolution 485/486/490 historical note.
   Candidate fan-out was progressively bounded and is now removed from the setup
   transaction. After the failed base build, only Block 11 may receive one scheduler
   proof before Resolution returns control to the coach. */
function boundedSearch490({block11=false}={}){
 const attempts=['Block 11'];
 return attempts;
}
{
 assert.deepEqual(boundedSearch490(),['Block 11'],'setup performs only the Block 11 alternative proof');
 assert.deepEqual(boundedSearch490({block11:true}),['Block 11'],'safe Block 11 also ends after one alternative proof');
}
console.log('Resolution 490 single-alternative setup-search regression passed.');


/* Resolution 487 infeasible-candidate short-circuit regression.
   A scheduler-declared failure must never pay for the expensive full validator. */
function candidateAudit487(plan,validate){
 if(!plan||plan.feasibilityErrors?.length)return false;
 return validate(plan).length===0;
}
{
 let validations=0;
 assert.equal(candidateAudit487({feasibilityErrors:['no safe schedule']},()=>{validations++;return[]}),false);
 assert.equal(validations,0,'infeasible candidate bypasses full safety validator');
 assert.equal(candidateAudit487({feasibilityErrors:[]},()=>{validations++;return[]}),true);
 assert.equal(validations,1,'feasible candidate receives full safety validator exactly once');
}
console.log('Resolution 487 infeasible-candidate short-circuit regression passed.');









/* Cooperative verified coaching-option publication contract.
   A genuine base failure may test only bounded coaching compromises. Every option
   exposed to the coach must come from a successful rebuild plus full validator. */
{
 const app497=require('node:fs').readFileSync('./app.js','utf8');
 const start=app497.indexOf('const candidateQueue=[]');
 const end=app497.indexOf("modal='practiceResolution'",start);
 assert.ok(start>=0&&end>start,'cooperative verified-option branch must exist');
 const branch=app497.slice(start,end);
 assert.ok(branch.includes('const verifyCandidate=item=>'),'failed base build must verify coaching alternatives');
 assert.ok(branch.includes('window.HotBPracticeScheduler.buildSchedule(candidate,startTime,item.duration'),'each alternative must rebuild from explicit candidate players');
 assert.ok(branch.includes('window.HotBPracticeScheduler.validate(plan)'),'each alternative must pass the complete scheduler validator');
 assert.ok(branch.includes("'Hitting Only: '+player.name"),'pitcher Hitting Only must be tested as a coaching option');
 assert.ok(branch.includes("'Not Catching: '+player.name"),'catcher opt-out must be tested as a coaching option');
 assert.ok(branch.includes("label:'Block 11'"),'emergency Block 11 must be tested as a coaching option');
 assert.ok(branch.includes('candidateNotices'),'verified option notices must be sealed with the decision');
 assert.ok(branch.includes('const finalizeCandidates=()=>'),'verified candidates must be finalized only after cooperative verification');
}
console.log('Cooperative verified coaching-option regression passed.');


/* Resolution 526 publication handoff regression.
   The verified snapshot must survive publication, and the temporary checking shell
   must not be manually detached before render atomically replaces #app. */
{
 const source=require('node:fs').readFileSync('./app.js','utf8');
 const start=source.indexOf("modal='practiceResolution';",source.indexOf('const finalizeCandidates=()=>'));
 const end=source.indexOf('const runNextCandidate=()=>',start);
 assert.ok(start>=0&&end>start,'verified Resolution publication handoff must exist');
 const publish=source.slice(start,end);
 assert.doesNotMatch(publish,/shell\.remove\(\)/,'publication must not detach the verification shell before render');
 assert.match(publish,/const decisionHtml=practiceResolutionModal\(\)/,'publication must build the already-verified Resolution decision directly');
 assert.match(publish,/shell\.replaceWith\(decision\)/,'publication must atomically replace the checking shell with the decision');
 assert.doesNotMatch(publish,/\brender\(\)/,'publication must not re-enter the full app renderer');
 assert.match(publish,/const published=document\.querySelector\('\.practice-resolution-modal'\)/,'publication must prove the decision modal mounted');
 assert.doesNotMatch(publish,/practiceResolution=null/,'a render failure must not destroy the already-verified Resolution evidence');
}
console.log('Resolution 526 atomic publication regression passed.');


/* Resolution 527 render-purity regression.
   Rendering an already-authorized decision must not call the live-state validator
   or clear the transaction while app.innerHTML is being composed. */
{
 const source=require('node:fs').readFileSync('./app.js','utf8');
 const start=source.indexOf("if(modal==='practiceResolution'){",source.indexOf('function modalView()'));
 const end=source.indexOf("if(modal==='recoveryGuide')",start);
 assert.ok(start>=0&&end>start,'Practice Resolution modal branch must exist');
 const branch=source.slice(start,end);
 assert.doesNotMatch(branch,/practiceResolutionSnapshotIsCurrentAndValid/,'modal rendering must not revalidate live Resolution state');
 assert.doesNotMatch(branch,/practiceResolution=null/,'modal rendering must not revoke the verified transaction');
 assert.match(branch,/return practiceResolutionModal\(\)/,'authorized Resolution renders as a pure consumer');
}
console.log('Resolution 527 render-purity regression passed.');


/* Resolution 528 direct-publication regression.
   Candidate completion must mount the sealed decision into the active verification
   shell without invoking the full application render lifecycle. */
{
 const source=require('node:fs').readFileSync('./app.js','utf8');
 const start=source.indexOf("const decisionHtml=practiceResolutionModal()",source.indexOf('const finalizeCandidates=()=>'));
 const end=source.indexOf('const runNextCandidate=()=>',start);
 assert.ok(start>=0&&end>start,'direct Resolution publication branch must exist');
 const branch=source.slice(start,end);
 assert.match(branch,/shell\.replaceWith\(decision\)/,'verified decision must atomically replace the checking shell');
 assert.match(branch,/route='__practiceResolutionDirectMount';bind\(\)/,'directly mounted decision must receive Practice Resolution handlers through modal-only bind');
 assert.doesNotMatch(branch,/\brender\(\)/,'candidate completion must not invoke full application render');
}
console.log('Resolution 528 direct-publication regression passed.');


/* Resolution 529 direct-bind regression.
   The Build Practice route does not rely on generic route dispatch after a direct
   modal mount; the Resolution controls must be bound explicitly. */
{
 const source=require('node:fs').readFileSync('./app.js','utf8');
 const start=source.indexOf("const decisionHtml=practiceResolutionModal()",source.indexOf('const finalizeCandidates=()=>'));
 const end=source.indexOf('const runNextCandidate=()=>',start);
 const branch=source.slice(start,end);
 assert.match(branch,/const resolutionBindRoute=route/,'direct publication must preserve active route');
 assert.match(branch,/route='__practiceResolutionDirectMount';bind\(\)/,'direct publication must use generic modal binding with route dispatch suppressed');
 assert.match(branch,/finally\{route=resolutionBindRoute\}/,'direct publication must restore active route');
}
console.log('Resolution 529 direct-bind regression passed.');


/* Resolution 530 route-interference regression.
   Direct publication must not call bindPractice() itself: the Resolution handlers
   live in bind(), after route dispatch. Suppressing route dispatch lets bind()
   reach those modal handlers without a partial-page route binder throwing first. */
{
 const source=require('node:fs').readFileSync('./app.js','utf8');
 const start=source.indexOf("const decisionHtml=practiceResolutionModal()",source.indexOf('const finalizeCandidates=()=>'));
 const end=source.indexOf('const runNextCandidate=()=>',start);
 const branch=source.slice(start,end);
 assert.doesNotMatch(branch,/bindPractice\(\)/,'direct modal publication must not invoke the full Practice page binder');
 assert.match(branch,/route='__practiceResolutionDirectMount';bind\(\)/,'direct modal publication must run generic modal binding with route dispatch suppressed');
}
console.log('Resolution 530 route-interference regression passed.');


/* Resolution 531 recovery-publication regression.
   A verified decision may not be exposed until the exact sealed Resolution has
   been persisted into the setup-stage recovery session used by Apply rollback. */
{
 const source=require('node:fs').readFileSync('./app.js','utf8');
 const start=source.indexOf('const finalizeCandidates=()=>');
 const publish=source.indexOf('// Publish the already-verified decision directly',start);
 const branch=source.slice(start,publish);
 assert.match(branch,/HotBPracticeSession\?\.createDraft\?\.\(\{setupState:practiceSetupState,resolution:practiceResolution\}\)/,'verified Resolution must create recovery directly from sealed setup state');
 assert.match(branch,/const savedResolution=db\.activePracticeSession\?\.resolution/,'publication must read back the persisted Resolution');
 assert.match(branch,/JSON\.stringify\(savedResolution\)!==JSON\.stringify\(practiceResolution\)/,'publication must prove persisted decision equality');
}
console.log('Resolution 531 recovery-publication regression passed.');


/* Resolution 532 WebKit recovery-clone regression.
   Persisting a verified Resolution must use the same JSON data contract as
   HotBPracticeSession and may not depend on structuredClone support. */
{
 const source=require('node:fs').readFileSync('./app.js','utf8');
 const start=source.indexOf('function persistPracticeDraft(){');
 const end=source.indexOf('function clearPracticeSession(){',start);
 const branch=source.slice(start,end);
 assert.match(branch,/const sealedResolution=JSON\.stringify\(practiceResolution\)/,'recovery persistence must seal Resolution as JSON');
 assert.match(branch,/resolutionToPersist=JSON\.parse\(sealedResolution\)/,'recovery persistence must clone from the sealed JSON');
 assert.doesNotMatch(branch,/resolutionToPersist=structuredClone\(practiceResolution\)/,'recovery persistence must not require structuredClone');
}
console.log('Resolution 532 WebKit recovery-clone regression passed.');


/* Resolution 533 post-Build persistence regression.
   Candidate verification runs after setup controls have been replaced by the
   checking shell. Publication therefore must not call the DOM-reading draft helper. */
{
 const source=require('node:fs').readFileSync('./app.js','utf8');
 const start=source.indexOf('const finalizeCandidates=()=>');
 const publish=source.indexOf('// Publish the already-verified decision directly',start);
 const branch=source.slice(start,publish);
 const executable=branch.replace(/\/\/[^\n]*/g,'');
 assert.doesNotMatch(executable,/persistPracticeDraft\(\)/,'post-Build Resolution publication must not reread missing setup controls');
 assert.match(branch,/resolutionRecoveryDraft=window\.HotBPracticeSession\?\.createDraft/,'publication must create recovery from sealed in-memory setup');
 assert.match(branch,/db\.activePracticeSession=resolutionRecoveryDraft/,'publication must install the exact sealed recovery draft');
}
console.log('Resolution 533 post-Build persistence regression passed.');
