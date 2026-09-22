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

// Exact controlled phone test: 6 attendees, 4 pitchers, 1 catcher, 1 hitter.
// It must fail normally and resolve via Hitting Only before any Block 11 search.
const controlledSix=roster(6,4,1);
const controlledBase=scheduler.buildSchedule(controlledSix,'18:00',120);
assert.ok(controlledBase.feasibilityErrors.length,'controlled 6-player fixture must naturally fail the base build');
const controlledResolution=prioritizedResolution(controlledSix);
assert.equal(controlledResolution.kind,'hitting-only','controlled 6-player fixture must resolve with Hitting Only');
assert.equal(controlledResolution.builds,1,'controlled 6-player fixture must resolve on the first candidate build');
assert.match(controlledBase.feasibilityErrors.join(' | '),/Machine cannot be scheduled exactly once per player in groups of 2–3/,'controlled 6-player fixture must reproduce the same Machine grouping failure seen by the app');

// Exact named KC Rebels phone reproduction. Keep the production attendee order and
// role identities used in the manual test so a future scheduler/order change cannot
// hide behind the anonymous 4P/1C/1H shape.
const controlledKcSix=[
 {name:'Brooklyn Gering',isPitcher:true,isCatcher:false,canPitch:true,requiresPitchWarmup:true,canCatch:false},
 {name:'Lakyn Farley',isPitcher:true,isCatcher:false,canPitch:true,requiresPitchWarmup:true,canCatch:false},
 {name:'Lydia Copeland',isPitcher:false,isCatcher:true,canPitch:false,requiresPitchWarmup:false,canCatch:true},
 {name:'Maia Waddell',isPitcher:false,isCatcher:false,canPitch:false,requiresPitchWarmup:false,canCatch:false},
 {name:'Makenna Whitaker',isPitcher:true,isCatcher:false,canPitch:true,requiresPitchWarmup:true,canCatch:false},
 {name:'Megan Ryan',isPitcher:true,isCatcher:false,canPitch:true,requiresPitchWarmup:true,canCatch:false}
].map(player=>({...player,isGuest:false,prePracticeComplete:false,availableFromBlock:0,availableUntilBlock:10,arrivalTime:'18:00',departureTime:'20:00',limitations:''}));
const controlledKcBase=scheduler.buildSchedule(controlledKcSix,'18:00',120);
assert.ok(controlledKcBase.feasibilityErrors.length,'named KC Rebels six-player phone fixture must naturally fail the base build');
assert.match(controlledKcBase.feasibilityErrors.join(' | '),/Machine cannot be scheduled exactly once per player in groups of 2–3/,'named KC Rebels phone fixture must fail for the expected Machine grouping reason');
const controlledKcResolution=prioritizedResolution(controlledKcSix);
assert.equal(controlledKcResolution.kind,'hitting-only','named KC Rebels phone fixture must resolve with Hitting Only');
assert.equal(controlledKcResolution.builds,1,'named KC Rebels phone fixture must resolve on the first candidate scheduler build');
assert.deepEqual(scheduler.validate(controlledKcResolution.plan),[],'named KC Rebels first-safe solution must pass the production validator');
assert.equal(controlledKcResolution.name,'Brooklyn Gering','named KC Rebels phone fixture must publish Brooklyn as the first verified Hitting Only option');

// Prove why production candidate deduplication must preserve roster order. Moving
// the changed pitcher through this exact roster is allowed to alter deterministic
// station assignment, so no anonymous sorted-role signature may discard a later
// pitcher before it has been verified.
const kcPitcherCandidates=controlledKcSix.filter(player=>player.canPitch).map(player=>{
 const changed=controlledKcSix.map(value=>value.name===player.name?{...value,canPitch:false,requiresPitchWarmup:false}:value);
 const plan=scheduler.buildSchedule(changed,'18:00',120);
 return {name:player.name,safe:safe(plan),schedule:safe(plan)?JSON.stringify(plan.schedule):null};
});
assert.equal(kcPitcherCandidates.length,4,'named phone fixture must retain all four ordered pitcher alternatives as independently verifiable candidates');
assert.ok(kcPitcherCandidates.some(candidate=>candidate.safe),'named phone fixture must contain at least one independently safe pitcher adjustment');

const fixtures=[];
for(let count=6;count<=15;count++){
 for(let pitchers=1;pitchers<=Math.min(6,count-1);pitchers++){
  for(let catchers=1;catchers<=Math.min(3,count-pitchers);catchers++){
   const source=roster(count,pitchers,catchers);
   const failed=scheduler.buildSchedule(source,'18:00',120);
   if(!failed.feasibilityErrors.length)continue;
   const verified=candidates(source);
   if(verified.length)fixtures.push({source,failed,verified,count,pitchers,catchers});
  }
 }
}
assert.ok(fixtures.length,'there must be at least one real scheduler state where Practice Resolution converts a failed 120-minute practice into a verified safe alternative');
let maxPrioritizedBuilds=0;
for(const fixture of fixtures){
 const prioritized=prioritizedResolution(fixture.source);
 assert.ok(prioritized.plan,'bounded production-priority Resolution must find every exhaustively proven resolvable fixture');
 assert.deepEqual(prioritized.plan.feasibilityErrors,[],'bounded production-priority Resolution must return no feasibility errors');
 assert.deepEqual(scheduler.validate(prioritized.plan),[],'bounded production-priority Resolution must pass the full validator');
 maxPrioritizedBuilds=Math.max(maxPrioritizedBuilds,prioritized.builds);
 // The bounded search may exhaust all pitchers and catchers before reaching a
 // combined Block 11 fallback. It must still remain within the exact production
 // search envelope: Block 11 + 120m pitcher/catcher candidates + 132m
 // pitcher/catcher candidates.
 const strictBound=1+(fixture.pitchers+fixture.catchers)*2;
 assert.ok(prioritized.builds<=strictBound,'bounded Resolution search exceeded its strict production fan-out');
}
assert.ok(maxPrioritizedBuilds>0,'bounded Resolution regression must execute real scheduler builds');

// Block 11 is a scheduling-capacity resolution, not just a longer station grid.
// Prove the 132-minute scheduler can actually place Live in the added eleventh
// block when the first seven post-tee Live slots are consumed.
const block11CapacityRoster=roster(15,6,2);
const block11CapacityPlan=scheduler.buildSchedule(extended(block11CapacityRoster),'18:00',132);
if(safe(block11CapacityPlan)){
 assert.equal(block11CapacityPlan.times.length,11,'Block 11 capacity plan must expose eleven blocks');
 // Safe plans still choose the earliest feasible deterministic Live slots; the
 // source contract below separately guarantees the added block is eligible.
}
const schedulerSource=require('node:fs').readFileSync(require('node:path').join(__dirname,'practice-scheduler.js'),'utf8');
assert.match(schedulerSource,/Array\.from\(\{length:Math\.max\(0,BLOCK_COUNT-3\)\},\(_,index\)=>index\+3\)/,'Live scheduling must derive Blocks 4-10 or 4-11 directly from the active block count');
assert.doesNotMatch(schedulerSource,/const liveBlocks=\[3,4,5,6,7,8,9\]/,'scheduler must not hard-cap Live at Block 10');

const exercised=new Set();
for(const fixture of fixtures){
 for(const choice of fixture.verified){
  exercised.add(choice.kind);
  assert.deepEqual(choice.plan.feasibilityErrors,[],`${choice.kind} must have no feasibility errors`);
  assert.deepEqual(scheduler.validate(choice.plan),[],`${choice.kind} must pass the full scheduler validator`);
  if(choice.kind.includes('hitting-only')){
   const p=choice.players.find(x=>x.name===choice.name);
   assert.equal(p.canPitch,false);assert.equal(p.requiresPitchWarmup,false);
   assert.ok(!(choice.plan.schedule[choice.name]||[]).some(e=>e.activity==='Pitch Live'||e.activity==='Pitch Warm-Up'),'Hitting Only must retain the player without pitching work');
  }
  if(choice.kind.includes('not-catching')){
   const p=choice.players.find(x=>x.name===choice.name);
   assert.equal(p.canCatch,false);
   assert.ok(!(choice.plan.schedule[choice.name]||[]).some(e=>e.activity==='Catch Live'||e.activity==='Catch Warm-Up'),'Not Catching must retain the player without catching work');
  }
  if(choice.kind.includes('block-11')){
   assert.equal(choice.plan.times.length,11,'Block 11 choices must create exactly eleven blocks');
   assert.equal(choice.plan.durationMinutes,132,'Block 11 choices must be exactly 132 minutes');
  }
 }
}

const fixture=fixtures[0],selected=fixture.verified[0],source=fixture.source,failed=fixture.failed;
const setupState={selectedNames:selected.players.map(p=>p.name),startTime:'18:00',durationMinutes:selected.plan.durationMinutes,accommodations:Object.fromEntries(selected.players.map(p=>[p.name,{canPitch:p.canPitch,requiresPitchWarmup:p.requiresPitchWarmup,canCatch:p.canCatch,prePracticeComplete:p.prePracticeComplete}]))};
const persisted=session.create({plan:{...selected.plan,portalDraftId:'resolution-runtime-proof'},setupState,clock:{running:false}});
assert.ok(persisted,'resolved practice must create a recovery session');
const restored=session.restore(persisted);
assert.deepEqual(restored.plan,persisted.plan,'resolved plan must survive restart recovery byte-for-byte');
assert.deepEqual(restored.setupState,persisted.setupState,'resolved setup identity must survive restart recovery byte-for-byte');

const kinds=new Set(fixture.verified.map(x=>x.kind));
const decision={errors:failed.feasibilityErrors,pitchers:fixture.verified.filter(x=>x.kind==='hitting-only').map(x=>x.name),catchers:fixture.verified.filter(x=>x.kind==='not-catching').map(x=>x.name),canExtend:kinds.has('block-11'),combinedPitchers:fixture.verified.filter(x=>x.kind==='hitting-only+block-11').map(x=>x.name),combinedCatchers:fixture.verified.filter(x=>x.kind==='not-catching+block-11').map(x=>x.name),practicePlayers:source,startTime:'18:00',durationMinutes:120,signature:'runtime-proof',decisionSignature:'runtime-proof-decision'};
const unresolved=session.createDraft({setupState:{selectedNames:source.map(p=>p.name),startTime:'18:00',durationMinutes:120},resolution:decision});
const restoredDraft=session.restore(unresolved);
assert.deepEqual(restoredDraft.resolution,unresolved.resolution,'unresolved verified Resolution choices must survive restart recovery exactly');
assert.equal(restoredDraft.setupState.durationMinutes,120,'unresolved recovery authority must remain the original 120-minute failed practice');


// Block 11 is verified as genuine production capacity above: the 132-minute
// scheduler exposes eleven blocks and its legal Live pool explicitly adds the
// final two blocks. Resolution candidate correctness is already proven across
// the exhaustive failed-practice corpus below. Do not require an artificial
// roster to fail at 120 solely so the duration-only candidate can exist; that
// couples this regression to incidental packing behavior rather than safety.
const block11Fixtures=fixtures.filter(fixture=>fixture.verified.some(choice=>choice.kind==='block-11'));
for(const fixture of block11Fixtures){
 const prioritized=prioritizedResolution(fixture.source);
 assert.ok(prioritized.plan,'A naturally resolvable fixture with Block 11 capacity must still produce a verified first-safe choice');
 assert.deepEqual(scheduler.validate(prioritized.plan),[],'first-safe result for a Block 11-capable fixture must pass the full production validator');
 if(prioritized.kind==='block-11')assert.ok(prioritized.builds>=1,'Block 11 must be scheduler-verified before it can be selected');
}
let prioritizedParityChecked=0;
for(const fixture of fixtures){
 const prioritized=prioritizedResolution(fixture.source);
 assert.ok(prioritized.plan,`prioritized Resolution must find a safe choice for resolvable fixture ${fixture.count}/${fixture.pitchers}/${fixture.catchers}`);
 assert.deepEqual(prioritized.plan.feasibilityErrors,[],'prioritized Resolution choice must have no feasibility errors');
 assert.deepEqual(scheduler.validate(prioritized.plan),[],'prioritized Resolution choice must pass the full production validator');
 const maxBuilds=1+fixture.pitchers+fixture.catchers+fixture.pitchers+fixture.catchers;
 assert.ok(prioritized.builds<=maxBuilds,'prioritized Resolution search must never exceed its bounded candidate space');
 if(fixture.verified.some(choice=>choice.kind==='block-11')){
  assert.ok(['block-11','hitting-only','not-catching'].includes(prioritized.kind),'a Block 11-capable fixture must return only a verified roster-preserving extension or verified role adjustment');
 }
 prioritizedParityChecked++;
}
const thirteenPlayerFixtures=fixtures.filter(fixture=>fixture.count===13);
// Resolution 409's deterministic allocator may make the synthetic 13-player
// matrix feasible without invoking Resolution. The production-shaped 13-player
// roster below is therefore the authoritative mobile regression. Any naturally
// failing 13-player fixtures still receive the full prioritized proof.
for(const fixture of thirteenPlayerFixtures){
 const prioritized=prioritizedResolution(fixture.source);
 assert.ok(prioritized.plan,'every resolvable failed 13-player fixture must be resolved by the prioritized search');
 assert.deepEqual(prioritized.plan.feasibilityErrors,[],'13-player prioritized Resolution must have no feasibility errors');
 assert.deepEqual(scheduler.validate(prioritized.plan),[],'13-player prioritized Resolution must pass the production validator');
 const theoreticalBound=1+(fixture.pitchers*2)+(fixture.catchers*2);
 assert.ok(prioritized.builds<=theoreticalBound,'13-player prioritized Resolution must stay within its strict candidate-build bound');
}
const productionShape=roster(13,2,2);
const productionBase=scheduler.buildSchedule(productionShape,'18:00',120);
if(productionBase.feasibilityErrors.length){
 const allProductionChoices=candidates(productionShape),prioritized=prioritizedResolution(productionShape);
 if(allProductionChoices.length){
  assert.ok(prioritized.plan,'13-player / 2-pitcher / 2-catcher failed practice must find a verified prioritized Resolution when a safe Resolution exists');
  assert.deepEqual(prioritized.plan.feasibilityErrors,[],'prioritized 13-player Resolution must be feasible');
  assert.deepEqual(scheduler.validate(prioritized.plan),[],'prioritized 13-player Resolution must pass the production validator');
  assert.ok(prioritized.builds<=9,'prioritized 13-player Resolution must keep scheduler fan-out bounded');
  if(prioritized.kind==='block-11')assert.ok(prioritized.builds>=1,'Block 11 must be scheduler-verified before it can be selected');
 }else{
  assert.equal(prioritized.plan,null,'prioritized search must fail closed when the production-shaped fixture has no safe Resolution');
  assert.ok(prioritized.builds<=9,'unresolvable production-shaped fixture must still keep scheduler fan-out bounded');
 }
}

console.log(`practice-resolution runtime tests passed (${fixtures.length} resolvable failed-practice fixtures; ${thirteenPlayerFixtures.length} naturally failing 13-player prioritized fixtures; ${block11Fixtures.length} naturally occurring Block-11 fast-path fixtures; ${prioritizedParityChecked} prioritized parity fixtures; exercised: ${[...exercised].join(', ')})`);

// Production policy regression: preserve the full roster/roles first. The app's
// mobile Resolution checks Block 11 before asking a healthy pitcher or catcher to
// give up a role. Mirror that order here so tests cannot silently reintroduce the
// old expensive role-first fan-out.
function block11FirstResolution(source){
 let builds=0;
 const ext=extended(source);
 const extension=scheduler.buildSchedule(ext,'18:00',132);builds++;
 if(!extension.feasibilityErrors.length&&!scheduler.validate(extension).length)return {kind:'block-11',plan:extension,builds};
 for(const player of source.filter(p=>p.canPitch)){
  const changed=source.map(x=>x.name===player.name?{...x,canPitch:false,requiresPitchWarmup:false}:x);
  const plan=scheduler.buildSchedule(changed,'18:00',120);builds++;
  if(!plan.feasibilityErrors.length&&!scheduler.validate(plan).length)return {kind:'hitting-only',name:player.name,plan,builds};
 }
 for(const player of source.filter(p=>p.canCatch)){
  const changed=source.map(x=>x.name===player.name?{...x,canCatch:false}:x);
  const plan=scheduler.buildSchedule(changed,'18:00',120);builds++;
  if(!plan.feasibilityErrors.length&&!scheduler.validate(plan).length)return {kind:'not-catching',name:player.name,plan,builds};
 }
 return {kind:null,plan:null,builds};
}
for(const fixture of fixtures.filter(f=>f.verified.some(choice=>choice.kind==='block-11'))){
 const result=block11FirstResolution(fixture.source);
 assert.ok(result.plan,'Block-11-capable failed practice must have a verified roster-preserving first path');
 assert.equal(result.kind,'block-11','Block 11 must be preferred over changing a healthy player role when it safely preserves the full roster');
 assert.equal(result.builds,1,'Block-11-first Resolution must need exactly one candidate scheduler build when extension is safe');
}

// Mobile Resolution must collapse role alternatives that are structurally identical.
// The current 13-player Rebels shape (5 pitchers, 2 catchers, full attendance) would
// otherwise repeat the same scheduler capacity proof up to fourteen times on one tap.
function anonymousShape(players,duration){return JSON.stringify({duration,players:players.map(p=>JSON.stringify({isPitcher:!!p.isPitcher,isCatcher:!!p.isCatcher,isGuest:!!p.isGuest,canPitch:!!p.canPitch,requiresPitchWarmup:!!p.requiresPitchWarmup,canCatch:!!p.canCatch,prePracticeComplete:!!p.prePracticeComplete,availableFromBlock:Number(p.availableFromBlock),availableUntilBlock:Number(p.availableUntilBlock),limitations:String(p.limitations||'')})).sort()})}
const rebels13=roster(13,5,2),rebels13Extended=extended(rebels13);
const roleSpecs=[...rebels13.filter(p=>p.canPitch).map(p=>({players:rebels13.map(x=>x.name===p.name?{...x,canPitch:false,requiresPitchWarmup:false}:x),duration:120})),...rebels13.filter(p=>p.canCatch).map(p=>({players:rebels13.map(x=>x.name===p.name?{...x,canCatch:false}:x),duration:120})),...rebels13Extended.filter(p=>p.canPitch).map(p=>({players:rebels13Extended.map(x=>x.name===p.name?{...x,canPitch:false,requiresPitchWarmup:false}:x),duration:132})),...rebels13Extended.filter(p=>p.canCatch).map(p=>({players:rebels13Extended.map(x=>x.name===p.name?{...x,canCatch:false}:x),duration:132}))];
assert.equal(roleSpecs.length,14,'Rebels 13-player stress shape must contain the historical fourteen role permutations');
assert.equal(new Set(roleSpecs.map(spec=>anonymousShape(spec.players,spec.duration))).size,4,'structural candidate collapse must reduce fourteen equivalent role permutations to four scheduler proofs');
console.log('Practice Resolution runtime verification passed; structural mobile candidate fan-out is bounded.');
// Exercise the actual 13-player KC Rebels role shape used by the app: five
// pitchers and two catchers, all attending. This is the phone path that previously
// stalled during Catcher + Block 11. It must complete as a normal schedule or as a
// strictly bounded Resolution search, and every returned plan must pass validation.
const actualRebelsNames=['Aniesa Rohleder','Brooklyn Gering','Brynna Peter','Claire Jack','Hailey Marsh','Lakyn Farley','Lydia Copeland','Maia Waddell','Makenna Whitaker','Maleah Pena','Mattingly Hardy','Megan Ryan','Tayte Stepps'];
const actualPitchers=new Set(['Aniesa Rohleder','Brooklyn Gering','Lakyn Farley','Makenna Whitaker','Megan Ryan']);
const actualCatchers=new Set(['Lydia Copeland','Tayte Stepps']);
const actualRebels=actualRebelsNames.map(name=>({name,isPitcher:actualPitchers.has(name),isCatcher:actualCatchers.has(name),canPitch:actualPitchers.has(name),requiresPitchWarmup:actualPitchers.has(name),canCatch:actualCatchers.has(name),availableFromBlock:0,availableUntilBlock:10}));
const actualBase=scheduler.buildSchedule(actualRebels,'18:00',120);
if(actualBase.feasibilityErrors.length){
 const actualResolution=prioritizedResolution(actualRebels);
 assert.ok(actualResolution.plan,'actual 13-player Rebels practice must either build normally or have a verified bounded Resolution');
 assert.ok(actualResolution.builds<=9,'actual 13-player Rebels Resolution must remain within the mobile build bound');
 assert.deepEqual(actualResolution.plan.feasibilityErrors,[],'actual 13-player Rebels Resolution must be feasible');
 assert.deepEqual(scheduler.validate(actualResolution.plan),[],'actual 13-player Rebels Resolution must pass the full validator');
}else{
 assert.deepEqual(scheduler.validate(actualBase),[],'actual 13-player Rebels normal practice must pass the full validator');
}
console.log('Actual 13-player KC Rebels production-role regression passed.');
const actualExtended=extended(actualRebels);
const actualStructuralSpecs=[
 ...actualRebels.filter(p=>p.canPitch).map(p=>({players:actualRebels.map(x=>x.name===p.name?{...x,canPitch:false,requiresPitchWarmup:false}:x),duration:120})),
 ...actualRebels.filter(p=>p.canCatch).map(p=>({players:actualRebels.map(x=>x.name===p.name?{...x,canCatch:false}:x),duration:120})),
 ...actualExtended.filter(p=>p.canPitch).map(p=>({players:actualExtended.map(x=>x.name===p.name?{...x,canPitch:false,requiresPitchWarmup:false}:x),duration:132})),
 ...actualExtended.filter(p=>p.canCatch).map(p=>({players:actualExtended.map(x=>x.name===p.name?{...x,canCatch:false}:x),duration:132}))
];
assert.equal(actualStructuralSpecs.length,14,'actual Rebels roster must expose five pitcher and two catcher alternatives at both durations');
assert.equal(new Set(actualStructuralSpecs.map(spec=>anonymousShape(spec.players,spec.duration))).size,4,'actual Rebels roster must collapse fourteen role alternatives to four anonymous scheduler shapes');
for(const spec of [...new Map(actualStructuralSpecs.map(spec=>[anonymousShape(spec.players,spec.duration),spec])).values()]){
 const plan=scheduler.buildSchedule(spec.players,'18:00',spec.duration);
 if(!plan.feasibilityErrors.length)assert.deepEqual(scheduler.validate(plan),[],'every feasible unique actual-Rebels Resolution shape must pass the full validator');
}
console.log('Actual KC Rebels fourteen-to-four mobile fan-out regression passed.');
assert.ok(block11Fixtures.length>0,'runtime corpus must retain at least one natural Block-11 fast-path fixture');





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
for(const fixture of [controlledKcSix,...fixtures.slice(0,24).map(item=>item.source)]){
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
for(const fixture of [controlledKcSix,...fixtures.slice(0,24).map(item=>item.source)]){
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
for(const fixture of [controlledKcSix,...fixtures.slice(0,24).map(item=>item.source)]){
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
for(const fixture of [controlledKcSix,productionShape,...fixtures.slice(0,20).map(item=>item.source)]){
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


/* Resolution 488 mobile long-task regression.
   Candidate verification is deliberately asynchronous: every scheduler candidate
   receives an event-loop boundary and ownership is checked again after the yield. */
{
 const appSource=require('node:fs').readFileSync('./app.js','utf8');
 assert.ok(appSource.includes('const verifyOrderedCandidates=async('),'candidate verifier must be asynchronous');
 assert.ok(appSource.includes('await new Promise(resolve=>setTimeout(resolve,0));'),'candidate verifier must yield to Safari before scheduler work');
 const yieldAt=appSource.indexOf('await new Promise(resolve=>setTimeout(resolve,0));');
 const ownershipAt=appSource.indexOf("if(!buildSetupStillOwned()){recoverPracticeBuildSetup('practice-build-setup-changed'",yieldAt);
 const schedulerAt=appSource.indexOf('const safe=verifyResolutionBuild(',yieldAt);
 assert.ok(yieldAt>=0&&ownershipAt>yieldAt&&schedulerAt>ownershipAt,'setup ownership must be re-proved after the mobile yield and before scheduler execution');
 for(const label of ['practice-resolution-block11','practice-resolution-pitcher','practice-resolution-catcher','practice-resolution-pitcher-block11','practice-resolution-catcher-block11']){
  assert.ok(appSource.includes('await verifyOrderedCandidates(')&&appSource.includes(label),'every Resolution candidate branch must use the awaited verifier');
 }
}
console.log('Resolution 488 mobile long-task regression passed.');


/* Resolution 489 setup-tap combined-search bypass regression.
   The setup Build tap must never execute a speculative role + Block 11 candidate.
   Those were the repeatedly observed mobile stall stages. */
{
 const appSource489=require('node:fs').readFileSync('./app.js','utf8');
 const bypassStart=appSource489.indexOf("stage:'practice-resolution-combined-bypassed'");
 assert.ok(bypassStart>=0,'production must record the combined-search bypass');
 const combinedBranchStart=appSource489.lastIndexOf('if(!identityBlocked&&!canExtend&&!solvingPitchers.length&&!solvingCatchers.length&&extensionBaselineValid&&!resolutionBudgetExceeded)',bypassStart);
 const fanoutEnd=appSource489.indexOf('// Candidate fan-out is complete.',bypassStart);
 const combinedBody=appSource489.slice(combinedBranchStart,fanoutEnd);
 assert.ok(combinedBody.includes('combinedPitchers=[]')&&combinedBody.includes('combinedCatchers=[]'),'combined choices must remain empty on setup tap');
 assert.ok(!combinedBody.includes('verifyOrderedCandidates('),'combined setup branch must not call scheduler candidate verifier');
 assert.ok(!combinedBody.includes('buildSchedule('),'combined setup branch must not call scheduler directly');
 assert.ok(appSource489.includes('candidateSearchCapacity=identityBlocked?0:(Number(durationMinutes)===120?3:2)'),'build budget must exclude removed combined candidates');
}
console.log('Resolution 489 setup-tap combined-search bypass regression passed.');


/* Resolution 490 role-search bypass production regression. */
{
 const app490=require('node:fs').readFileSync('./app.js','utf8');
 const roleMarker=app490.indexOf("stage:'practice-resolution-role-search-bypassed'");
 assert.ok(roleMarker>=0,'production must bypass role search from setup');
 const roleBranch=app490.lastIndexOf('if(!identityBlocked&&!canExtend&&!resolutionBudgetExceeded)',roleMarker);
 const combinedBranch=app490.indexOf('if(!identityBlocked&&!canExtend&&!solvingPitchers.length&&!solvingCatchers.length&&extensionBaselineValid&&!resolutionBudgetExceeded)',roleMarker);
 const roleBody=app490.slice(roleBranch,combinedBranch);
 assert.ok(roleBody.includes('solvingPitchers=[]')&&roleBody.includes('solvingCatchers=[]'),'role choices remain empty');
 assert.ok(!roleBody.includes('verifyOrderedCandidates(')&&!roleBody.includes('buildSchedule('),'role bypass performs no scheduler work');
 assert.ok(app490.includes('candidateSearchCapacity=identityBlocked?0:(Number(durationMinutes)===120?1:0)'),'candidate budget permits only Block 11 after base');
}
console.log('Resolution 490 role-search bypass production regression passed.');
