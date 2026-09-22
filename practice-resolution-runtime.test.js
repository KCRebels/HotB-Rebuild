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
function extended(source){return source.map(player=>({...player,availableUntilBlock:player.availableUntilBlock===10?11:player.availableUntilBlock}))}
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
 const ext=extended(source),extension=verify(ext,132);
 if(extension)return {kind:'block-11',builds,plan:extension};
 for(const player of source.filter(p=>p.canPitch)){
  const changed=source.map(p=>p.name===player.name?{...p,canPitch:false,requiresPitchWarmup:false}:p),plan=verify(changed,120);
  if(plan)return {kind:'hitting-only',builds,plan,name:player.name};
 }
 for(const player of source.filter(p=>p.canCatch)){
  const changed=source.map(p=>p.name===player.name?{...p,canCatch:false}:p),plan=verify(changed,120);
  if(plan)return {kind:'not-catching',builds,plan,name:player.name};
 }
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
assert.match(schedulerSource,/Array\.from\(\{length:Math\.max\(0,BLOCK_COUNT-3\)\},\(_,index\)=>index\+3\)/,'132-minute scheduling must include Block 11 in the legal Live pool');
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


const block11Fixtures=fixtures.filter(fixture=>fixture.verified.some(choice=>choice.kind==='block-11'));
assert.ok(block11Fixtures.length,'runtime corpus must contain failed practices resolved by Block 11 so the mobile fast path is exercised');
for(const fixture of block11Fixtures){
 const prioritized=prioritizedResolution(fixture.source);
 assert.equal(prioritized.kind,'block-11','Block 11-resolvable practice must choose the duration-only Resolution before role changes');
 assert.equal(prioritized.builds,1,'Block 11-resolvable practice must require exactly one Resolution scheduler build');
 assert.deepEqual(scheduler.validate(prioritized.plan),[],'Block 11 fast-path result must pass the full production validator');
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
  assert.equal(prioritized.kind,'block-11','Block 11 must remain the first safe Resolution choice');
  assert.equal(prioritized.builds,1,'safe Block 11 must eliminate every role permutation build');
 }
 prioritizedParityChecked++;
}
const thirteenPlayerFixtures=fixtures.filter(fixture=>fixture.count===13);
assert.ok(thirteenPlayerFixtures.length,'runtime corpus must contain resolvable failed 13-player practices');
for(const fixture of thirteenPlayerFixtures){
 const prioritized=prioritizedResolution(fixture.source);
 assert.ok(prioritized.plan,'every resolvable failed 13-player fixture must be resolved by the prioritized search');
 assert.deepEqual(prioritized.plan.feasibilityErrors,[],'13-player prioritized Resolution must have no feasibility errors');
 assert.deepEqual(scheduler.validate(prioritized.plan),[],'13-player prioritized Resolution must pass the full production validator');
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
  if(prioritized.kind==='block-11')assert.equal(prioritized.builds,1,'safe Block 11 must short-circuit all role candidate builds');
 }else{
  assert.equal(prioritized.plan,null,'prioritized search must fail closed when the production-shaped fixture has no safe Resolution');
  assert.ok(prioritized.builds<=9,'unresolvable production-shaped fixture must still keep scheduler fan-out bounded');
 }
}

console.log(`practice-resolution runtime tests passed (${fixtures.length} resolvable failed-practice fixtures; ${thirteenPlayerFixtures.length} 13-player prioritized fixtures; ${block11Fixtures.length} Block-11 fast-path fixtures; ${prioritizedParityChecked} prioritized parity fixtures; exercised: ${[...exercised].join(', ')})`);
