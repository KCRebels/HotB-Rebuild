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

const source=roster();
const failed=scheduler.buildSchedule(source,'18:00',120);
assert.ok(failed.feasibilityErrors.length,'fixture must begin as a genuinely unresolved 120-minute practice');

const verified=candidates(source);
assert.ok(verified.length,'Practice Resolution must discover at least one independently safe alternative for the regression fixture');
for(const choice of verified){
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

const kinds=new Set(verified.map(x=>x.kind));
assert.ok([...kinds].some(k=>k==='hitting-only'||k==='not-catching'||k==='block-11'||k.includes('+block-11')),'verified alternatives must be one of the supported Resolution decisions');

const selected=verified[0],setupState={selectedNames:selected.players.map(p=>p.name),startTime:'18:00',durationMinutes:selected.plan.durationMinutes,accommodations:Object.fromEntries(selected.players.map(p=>[p.name,{canPitch:p.canPitch,requiresPitchWarmup:p.requiresPitchWarmup,canCatch:p.canCatch,prePracticeComplete:p.prePracticeComplete}]))};
const persisted=session.create({plan:{...selected.plan,portalDraftId:'resolution-runtime-proof'},setupState,clock:{running:false}});
assert.ok(persisted,'resolved practice must create a recovery session');
const restored=session.restore(persisted);
assert.deepEqual(restored.plan,persisted.plan,'resolved plan must survive restart recovery byte-for-byte');
assert.deepEqual(restored.setupState,persisted.setupState,'resolved setup identity must survive restart recovery byte-for-byte');

const decision={errors:failed.feasibilityErrors,pitchers:verified.filter(x=>x.kind==='hitting-only').map(x=>x.name),catchers:verified.filter(x=>x.kind==='not-catching').map(x=>x.name),canExtend:kinds.has('block-11'),combinedPitchers:verified.filter(x=>x.kind==='hitting-only+block-11').map(x=>x.name),combinedCatchers:verified.filter(x=>x.kind==='not-catching+block-11').map(x=>x.name),practicePlayers:source,startTime:'18:00',durationMinutes:120,signature:'runtime-proof',decisionSignature:'runtime-proof-decision'};
const unresolved=session.createDraft({setupState:{selectedNames:source.map(p=>p.name),startTime:'18:00',durationMinutes:120},resolution:decision});
const restoredDraft=session.restore(unresolved);
assert.deepEqual(restoredDraft.resolution,unresolved.resolution,'unresolved verified Resolution choices must survive restart recovery exactly');
assert.equal(restoredDraft.setupState.durationMinutes,120,'unresolved recovery authority must remain the original 120-minute failed practice');

console.log(`practice-resolution runtime tests passed (${verified.length} verified alternatives: ${[...kinds].join(', ')})`);
