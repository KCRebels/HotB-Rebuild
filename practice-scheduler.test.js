const assert=require('node:assert/strict');
const scheduler=require('./practice-scheduler.js');

const fullPlayer={name:'Full Player',isPitcher:true,canPitch:true,requiresPitchWarmup:true,availableFromBlock:0,availableUntilBlock:10};
const latePlayer={name:'Late Player',isCatcher:true,canCatch:true,availableFromBlock:3,availableUntilBlock:10};
const plan=scheduler.buildSchedule([fullPlayer,latePlayer],'18:00',120);

assert.equal(plan.schedule['Full Player'][0].activity,'Stretch');
assert.equal(plan.schedule['Full Player'][1].activity,'Tee Work');
assert.equal(plan.schedule['Late Player'][3].activity,'Stretch');
assert.equal(plan.schedule['Late Player'][4].activity,'Tee Work');
for(const player of plan.players){
 const teeBlocks=plan.schedule[player.name].map((entry,index)=>entry?.activity==='Tee Work'?index:-1).filter(index=>index>=0);
 assert.deepEqual(teeBlocks,[player.availableFromBlock+1],`${player.name} must have exactly one Tee Work block`);
}

const invalid=structuredClone(plan);
invalid.schedule['Full Player'][5]={activity:'Tee Work'};
assert.ok(scheduler.validate(invalid).some(error=>error.includes('Tee Work outside the one required tee block')),'validator must reject any repeated or misplaced Tee Work after the required second attended block');

const standardRoster=Array.from({length:13},(_,index)=>({name:`Player ${index+1}`,isPitcher:index<5,isCatcher:index===5||index===6,canPitch:index<5,requiresPitchWarmup:index<5,canCatch:index===5||index===6,availableFromBlock:0,availableUntilBlock:10}));

// Exact current KC Rebels 13-player role mix regression. This is the production
// roster shape that exposed the Practice Resolution stall: five pitchers, two
// catchers, all present for the full ten blocks. The scheduler must solve it
// directly; Practice Resolution is not allowed to become the normal path merely
// because the roster has 13 players.
const rebels13=[
 {name:'Aniesa Rohleder',isPitcher:true,isCatcher:false,canPitch:true,requiresPitchWarmup:true,canCatch:false},
 {name:'Brooklyn Gering',isPitcher:true,isCatcher:false,canPitch:true,requiresPitchWarmup:true,canCatch:false},
 {name:'Brynna Peter',isPitcher:false,isCatcher:false,canPitch:false,requiresPitchWarmup:false,canCatch:false},
 {name:'Claire Jack',isPitcher:false,isCatcher:false,canPitch:false,requiresPitchWarmup:false,canCatch:false},
 {name:'Hailey Marsh',isPitcher:false,isCatcher:false,canPitch:false,requiresPitchWarmup:false,canCatch:false},
 {name:'Lakyn Farley',isPitcher:true,isCatcher:false,canPitch:true,requiresPitchWarmup:true,canCatch:false},
 {name:'Lydia Copeland',isPitcher:false,isCatcher:true,canPitch:false,requiresPitchWarmup:false,canCatch:true},
 {name:'Maia Waddell',isPitcher:false,isCatcher:false,canPitch:false,requiresPitchWarmup:false,canCatch:false},
 {name:'Makenna Whitaker',isPitcher:true,isCatcher:false,canPitch:true,requiresPitchWarmup:true,canCatch:false},
 {name:'Maleah Pena',isPitcher:false,isCatcher:false,canPitch:false,requiresPitchWarmup:false,canCatch:false},
 {name:'Mattingly Hardy',isPitcher:false,isCatcher:false,canPitch:false,requiresPitchWarmup:false,canCatch:false},
 {name:'Megan Ryan',isPitcher:true,isCatcher:false,canPitch:true,requiresPitchWarmup:true,canCatch:false},
 {name:'Tayte Stepps',isPitcher:false,isCatcher:true,canPitch:false,requiresPitchWarmup:false,canCatch:true}
].map(player=>({...player,availableFromBlock:0,availableUntilBlock:10,prePracticeComplete:false,isGuest:false}));
const rebels13Plan=scheduler.buildSchedule(rebels13,'18:00',120);
assert.deepEqual(rebels13Plan.feasibilityErrors,[],'the exact full KC Rebels 13-player roster must build directly without Practice Resolution');
assert.deepEqual(scheduler.validate(rebels13Plan),[],'the exact full KC Rebels 13-player roster must pass the complete rules audit');
assert.equal(rebels13Plan.players.length,13,'the full-roster regression may not silently remove a player');
assert.ok(rebels13Plan.liveSessions.length>=5,'all five available Rebels pitchers must receive live work');
assert.ok(rebels13Plan.liveSessions.every(session=>session.hitters.length>=2&&session.hitters.length<=3),'every full-roster live session must retain 2-3 hitters');
assert.ok(Object.values(rebels13Plan.schedule).every(entries=>entries.length===10),'every full-roster player must receive all ten schedule rows');

const standardPlan=scheduler.buildSchedule(standardRoster);
assert.deepEqual(standardPlan.feasibilityErrors,[]);
assert.ok(!scheduler.validate(standardPlan).some(error=>error.includes('Tee Work')));
assert.ok(Object.values(standardPlan.schedule).every(entries=>entries.filter(entry=>entry.activity==='Tee Work').length===1));
assert.ok(Object.values(standardPlan.schedule).every(entries=>entries.filter(entry=>entry.activity==='Machine').length===1));
assert.ok(Object.values(standardPlan.schedule).every(entries=>entries.filter(entry=>entry.activity.startsWith('Front Toss')).length===1));
assert.ok(Object.values(standardPlan.schedule).every(entries=>entries.filter(entry=>entry.activity==='Hit Live').length===1));
for(let block=0;block<10;block++){
 const entries=Object.values(standardPlan.schedule).map(items=>items[block]);
 const machine=entries.filter(entry=>entry.activity==='Machine').length;
 assert.ok(machine===0||machine===2||machine===3,'machine groups must contain 2–3 players');
 const front={};entries.filter(entry=>entry.activity.startsWith('Front Toss Lane')).forEach(entry=>front[entry.activity]=(front[entry.activity]||0)+1);
 assert.ok(Object.values(front).every(size=>size===2||size===3),'front-toss lanes must contain 2–3 players');
 const counts={};
 Object.values(standardPlan.schedule).map(entries=>entries[block].activity).filter(activity=>activity.startsWith('Drill #')).forEach(activity=>counts[activity]=(counts[activity]||0)+1);
 const sizes=Object.values(counts);
 assert.ok(sizes.every(size=>size===2||size===3),'every standard-practice drill group must contain 2–3 players');
 assert.ok(!(sizes.includes(1)&&sizes.includes(3)),'one- and three-player drill groups must be rebalanced into pairs');
 const drillPlayerCount=sizes.reduce((sum,size)=>sum+size,0);
 if(drillPlayerCount>1&&drillPlayerCount%2===0)assert.ok(sizes.every(size=>size===2),'an even drill-player count should use pairs');
 if(drillPlayerCount>=3&&drillPlayerCount%2===1)assert.equal(sizes.filter(size=>size===3).length,1,'an odd drill-player count should use only one group of three');
}

const soloPlan=scheduler.buildSchedule([{name:'Solo Player',availableFromBlock:0,availableUntilBlock:10}],'18:00',120,{noPitchersMode:'skills'});
assert.ok(soloPlan.feasibilityErrors.some(error=>error.includes('At least two attending players')),'a one-player practice must be rejected');

function scenario(count,pitchers,catchers){
 return Array.from({length:count},(_,index)=>({name:`Scenario ${count}-${index+1}`,isPitcher:index<pitchers,isCatcher:index>=pitchers&&index<pitchers+catchers,canPitch:index<pitchers,requiresPitchWarmup:index<pitchers,canCatch:index>=pitchers&&index<pitchers+catchers,availableFromBlock:0,availableUntilBlock:10}));
}
const nineFourOne=scheduler.buildSchedule(scenario(9,4,1));
assert.deepEqual(nineFourOne.feasibilityErrors,[],'nine players, four pitchers and one catcher should work using 9Square for one live block');
assert.deepEqual(nineFourOne.liveSessions.map(session=>session.hitters.length).sort(),[2,2,2,3]);
assert.equal(nineFourOne.liveSessions.filter(session=>session.catcher==='9Square').length,2,'one catcher may catch only two of four live blocks');
assert.equal(nineFourOne.liveSessions.filter(session=>session.catcher==='Coach').length,0,'Coach must never be assigned as a live catcher');
assert.deepEqual(scheduler.validate(nineFourOne),[]);
const nineTwoOne=scheduler.buildSchedule(scenario(9,2,1));
assert.deepEqual(nineTwoOne.feasibilityErrors,[],'nine players, two pitchers and one catcher must remain feasible');
assert.deepEqual(scheduler.validate(nineTwoOne),[]);
const eightFiveTwo=scheduler.buildSchedule(scenario(8,5,2));
assert.deepEqual(eightFiveTwo.feasibilityErrors,[],'eight players and five pitchers should work with the minimum repeated live hitters');
assert.equal(eightFiveTwo.liveHitterRepeats.length,2,'eight players and five pitchers require exactly two second live-hitting assignments');
assert.ok(eightFiveTwo.fallbackWarnings.some(warning=>warning.includes('second live-hitting session')),'repeated live hitting must generate an explicit warning');
assert.deepEqual(scheduler.validate(eightFiveTwo),[]);
const sevenFourOne=scheduler.buildSchedule(scenario(7,4,1));
assert.deepEqual(sevenFourOne.feasibilityErrors,[],'seven players and four pitchers should work with one repeated live hitter');
assert.equal(sevenFourOne.liveHitterRepeats.length,1,'seven players and four pitchers require exactly one second live-hitting assignment');
assert.deepEqual(scheduler.validate(sevenFourOne),[]);
const sevenThreeOne=scheduler.buildSchedule(scenario(7,3,1));
assert.deepEqual(sevenThreeOne.feasibilityErrors,[],'seven players with three pitchers and one catcher should work');
assert.deepEqual(scheduler.validate(sevenThreeOne),[]);
const tenFiveTwo=scheduler.buildSchedule(scenario(10,5,2));
assert.deepEqual(tenFiveTwo.feasibilityErrors,[],'ten players, five pitchers and two catchers should work');
assert.equal(tenFiveTwo.liveSessions.filter(session=>session.catcher==='9Square').length,1,'9Square must catch the fifth live block');
assert.ok(tenFiveTwo.catcherLoads.every(catcher=>catcher.liveBlocks===2),'each catcher must catch exactly two live blocks');
for(const player of tenFiveTwo.players.filter(player=>player.isPitcher))assert.equal(tenFiveTwo.schedule[player.name].filter(entry=>entry.activity.startsWith('Drill #')).length,3,`${player.name} should receive three numbered drills`);
for(const player of tenFiveTwo.players.filter(player=>player.isCatcher)){
 const entries=tenFiveTwo.schedule[player.name];
 assert.equal(entries.filter(entry=>entry.activity==='Catch Warm-Up').length,1,`${player.name} must catch no more than one warm-up`);
 assert.equal(entries.filter(entry=>entry.activity.startsWith('Drill #')).length,2,`${player.name} should receive two numbered drills`);
}
for(let block=0;block<10;block++)assert.ok(Object.values(tenFiveTwo.schedule).filter(entries=>entries[block].activity==='Pitch Warm-Up'&&entries[block].partner==='Coach').length<=1,'the coach may catch only one pitching warm-up per block');
assert.deepEqual(scheduler.validate(tenFiveTwo),[]);

const tenTwoTwo=scheduler.buildSchedule(scenario(10,2,2));
assert.deepEqual(tenTwoTwo.feasibilityErrors,[],'ten players and two pitchers should work when each pitcher throws twice');
assert.equal(tenTwoTwo.pitcherRepeats.length,2,'both pitchers must be identified as repeat pitchers');
for(const pitcher of tenTwoTwo.pitcherRepeats){
 const blocks=tenTwoTwo.liveSessions.filter(session=>session.pitcher===pitcher).map(session=>session.block).sort((a,b)=>a-b);
 assert.equal(blocks.length,2,`${pitcher} must never pitch more than twice`);
 assert.equal(blocks[1],blocks[0]+1,`${pitcher}'s repeated live sessions must be consecutive`);
}
assert.ok(tenTwoTwo.fallbackWarnings.every(warning=>warning.includes('consecutive live sessions')),'each repeated pitcher must be named in the fallback warning');
assert.deepEqual(scheduler.validate(tenTwoTwo),[]);

const thirteenTwoTwo=scheduler.buildSchedule(scenario(13,2,2));
assert.ok(thirteenTwoTwo.feasibilityErrors.some(error=>error.includes('short 1 live block')),'the scheduler must reject a plan that would require a pitcher to throw more than twice');

/* Resolution 549 live-pitcher capacity boundary.
   This is the exact 13-player boundary exercised on-device after the direct Apply
   transaction was repaired. Zero, one and two available pitchers must fail closed;
   three available pitchers must build without exceeding the two-live-block ceiling. */
for(const pitcherCount of [0,1,2]){
 const roster=scenario(13,pitcherCount,2);
 const plan=scheduler.buildSchedule(roster,'18:00',120);
 assert.ok(plan.feasibilityErrors.length>0,`13 players with ${pitcherCount} available pitcher(s) must not produce a practice`);
 if(pitcherCount===0)assert.ok(plan.feasibilityErrors.some(error=>/pitch/i.test(error)),'zero-pitcher failure must identify pitching');
 if(pitcherCount===1)assert.ok(plan.feasibilityErrors.some(error=>/safely cover only 2|pitch/i.test(error)),'one-pitcher failure must expose the safe capacity limit');
 if(pitcherCount===2)assert.ok(plan.feasibilityErrors.some(error=>/short 1 live block/i.test(error)),'two-pitcher failure must identify the one-block deficit');
}
const thirteenThreeTwo=scheduler.buildSchedule(scenario(13,3,2),'18:00',120);
assert.deepEqual(thirteenThreeTwo.feasibilityErrors,[],'13 players with three available pitchers must cross the capacity boundary and build');
assert.deepEqual(scheduler.validate(thirteenThreeTwo),[],'the three-pitcher boundary plan must pass the full rules audit');
const boundaryPitcherLoads=new Map();
for(const live of thirteenThreeTwo.liveSessions)boundaryPitcherLoads.set(live.pitcher,(boundaryPitcherLoads.get(live.pitcher)||0)+1);
assert.ok([...boundaryPitcherLoads.values()].every(count=>count<=2),'the feasible boundary may not make any pitcher throw more than two live blocks');
assert.ok(thirteenThreeTwo.liveSessions.length>=5,'the feasible boundary must provide the five live blocks required by 13 players');

const earlyGuests=[...scenario(11,4,2),...Array.from({length:6},(_,index)=>({name:`Early Guest ${index+1}`,isGuest:true,isPitcher:index<2,isCatcher:index>=2&&index<4,canPitch:index<2,requiresPitchWarmup:index<2,canCatch:index>=2&&index<4,prePracticeComplete:true,availableFromBlock:0,availableUntilBlock:10}))];
const earlyGuestPlan=scheduler.buildSchedule(earlyGuests);
assert.deepEqual(earlyGuestPlan.feasibilityErrors,[],'17 players should fit when six guests complete warm-up and tee before practice');
assert.deepEqual(scheduler.validate(earlyGuestPlan),[],'the early-guest schedule must pass the complete rules audit');
for(const guest of earlyGuests.filter(player=>player.prePracticeComplete)){
 assert.ok(!earlyGuestPlan.schedule[guest.name].some(entry=>entry.activity==='Stretch'||entry.activity==='Tee Work'),`${guest.name} must not repeat pre-practice work`);
 assert.ok(earlyGuestPlan.schedule[guest.name].slice(0,2).some(entry=>entry.activity.startsWith('Front Toss Lane')),`${guest.name} must use early Front Toss capacity`);
}
for(const session of earlyGuestPlan.liveSessions.filter(session=>session.pitcher.startsWith('Early Guest'))){
 assert.ok(session.catcher.startsWith('Early Guest'),`${session.pitcher} should preferentially throw to a guest catcher`);
}
for(const session of earlyGuestPlan.liveSessions.filter(session=>session.pitcher.startsWith('Scenario'))){
 assert.ok(session.catcher.startsWith('Scenario'),`${session.pitcher} should preferentially throw to a team catcher`);
}


function resolutionCandidates(players,duration=120){
 const base=scheduler.buildSchedule(players,'18:00',duration);
 const safe=plan=>!(plan.feasibilityErrors||[]).length&&!scheduler.validate(plan).length;
 const result={baseErrors:base.feasibilityErrors||[],pitchers:[],catchers:[],canExtend:false,combinedPitchers:[],combinedCatchers:[]};
 if(!result.baseErrors.length)return result;
 for(const player of players.filter(item=>item.canPitch)){
  const changed=players.map(item=>item.name===player.name?{...item,canPitch:false,requiresPitchWarmup:false}:item);
  if(safe(scheduler.buildSchedule(changed,'18:00',duration)))result.pitchers.push(player.name);
 }
 for(const player of players.filter(item=>item.canCatch)){
  const changed=players.map(item=>item.name===player.name?{...item,canCatch:false}:item);
  if(safe(scheduler.buildSchedule(changed,'18:00',duration)))result.catchers.push(player.name);
 }
 if(duration===120){
  const extended=players.map(item=>({...item,availableUntilBlock:item.availableUntilBlock===10?11:item.availableUntilBlock}));
  result.canExtend=safe(scheduler.buildSchedule(extended,'18:00',132));
  if(!result.canExtend){
   for(const player of extended.filter(item=>item.canPitch)){
    const changed=extended.map(item=>item.name===player.name?{...item,canPitch:false,requiresPitchWarmup:false}:item);
    if(safe(scheduler.buildSchedule(changed,'18:00',132)))result.combinedPitchers.push(player.name);
   }
   for(const player of extended.filter(item=>item.canCatch)){
    const changed=extended.map(item=>item.name===player.name?{...item,canCatch:false}:item);
    if(safe(scheduler.buildSchedule(changed,'18:00',132)))result.combinedCatchers.push(player.name);
   }
  }
 }
 return result;
}

const duplicateResolutionRoster=scenario(9,4,2);
duplicateResolutionRoster[8]={...duplicateResolutionRoster[8],name:duplicateResolutionRoster[0].name};
const duplicateResolutionPlan=scheduler.buildSchedule(duplicateResolutionRoster);
assert.ok(duplicateResolutionPlan.feasibilityErrors.some(error=>error.includes('duplicate player names')),'scheduler must stop before resolving a practice with ambiguous duplicate attendee names');
assert.ok(scheduler.validate(duplicateResolutionPlan).some(error=>error.includes('duplicate player names')),'full resolution audit must reject duplicate attendee identities');

const resolutionBase=scenario(13,2,2);
const resolution=resolutionCandidates(resolutionBase);
assert.ok(resolution.baseErrors.length,'resolution audit needs an actually infeasible starting practice');
for(const name of resolution.pitchers){
 const changed=resolutionBase.map(player=>player.name===name?{...player,canPitch:false,requiresPitchWarmup:false}:player);
 {const plan=scheduler.buildSchedule(changed,'18:00',120);assert.deepEqual(plan.feasibilityErrors,[],`displayed Hitting Only choice ${name} must be independently proven`);assert.deepEqual(scheduler.validate(plan),[],`displayed Hitting Only choice ${name} must pass the full validator`);}
}
for(const name of resolution.catchers){
 const changed=resolutionBase.map(player=>player.name===name?{...player,canCatch:false}:player);
 {const plan=scheduler.buildSchedule(changed,'18:00',120);assert.deepEqual(plan.feasibilityErrors,[],`displayed Not Catching choice ${name} must be independently proven`);assert.deepEqual(scheduler.validate(plan),[],`displayed Not Catching choice ${name} must pass the full validator`);}
}
if(resolution.canExtend){
 const extended=resolutionBase.map(player=>({...player,availableUntilBlock:player.availableUntilBlock===10?11:player.availableUntilBlock}));
 {const plan=scheduler.buildSchedule(extended,'18:00',132);assert.deepEqual(plan.feasibilityErrors,[],'displayed Block 11 choice must be independently proven');assert.deepEqual(scheduler.validate(plan),[],'displayed Block 11 choice must pass the full validator');}
}
for(const name of resolution.combinedPitchers){
 const changed=resolutionBase.map(player=>({...player,availableUntilBlock:player.availableUntilBlock===10?11:player.availableUntilBlock})).map(player=>player.name===name?{...player,canPitch:false,requiresPitchWarmup:false}:player);
 {const plan=scheduler.buildSchedule(changed,'18:00',132);assert.deepEqual(plan.feasibilityErrors,[],`displayed Hitting Only + Block 11 choice ${name} must be independently proven`);assert.deepEqual(scheduler.validate(plan),[],`displayed Hitting Only + Block 11 choice ${name} must pass the full validator`);}
}
for(const name of resolution.combinedCatchers){
 const changed=resolutionBase.map(player=>({...player,availableUntilBlock:player.availableUntilBlock===10?11:player.availableUntilBlock})).map(player=>player.name===name?{...player,canCatch:false}:player);
 {const plan=scheduler.buildSchedule(changed,'18:00',132);assert.deepEqual(plan.feasibilityErrors,[],`displayed Not Catching + Block 11 choice ${name} must be independently proven`);assert.deepEqual(scheduler.validate(plan),[],`displayed Not Catching + Block 11 choice ${name} must pass the full validator`);}
}


/* Resolution 550 deterministic candidate-family discovery.
   Search bounded, reproducible attendance/role variations and prove that every
   selectable family the UI can expose is backed by an independently safe rebuild.
   This also gives us exact fixtures instead of asking the coach to hunt manually. */
function cloneRoster(players){return players.map(player=>({...player}));}
function extendForResolution(players){
 return players.map(player=>({...player,availableUntilBlock:player.availableUntilBlock===10?11:player.availableUntilBlock}));
}
function firstFixture(predicate){
 const base=scenario(13,5,2);
 const masks=1<<5;
 for(let disabledPitchMask=0;disabledPitchMask<masks;disabledPitchMask++){
  for(let early=-1;early<13;early++){
   for(const until of [6,7,8,9,10]){
    const roster=cloneRoster(base);
    for(let p=0;p<5;p++)if(disabledPitchMask&(1<<p)){roster[p].canPitch=false;roster[p].requiresPitchWarmup=false;}
    if(early>=0)roster[early].availableUntilBlock=until;
    const found=resolutionCandidates(roster);
    if(predicate(found))return {roster,found,disabledPitchMask,early,until};
   }
  }
 }
 return null;
}
const block11Fixture=firstFixture(result=>result.canExtend===true);
if(block11Fixture){
 const extended=extendForResolution(block11Fixture.roster);
 const plan=scheduler.buildSchedule(extended,'18:00',132);
 assert.deepEqual(plan.feasibilityErrors,[],'deterministic Block 11 fixture must rebuild safely');
 assert.deepEqual(scheduler.validate(plan),[],'deterministic Block 11 fixture must pass the full audit');
}
const pitcherChoiceFixture=firstFixture(result=>result.pitchers.length>0);
if(pitcherChoiceFixture){
 for(const name of pitcherChoiceFixture.found.pitchers){
  const changed=pitcherChoiceFixture.roster.map(player=>player.name===name?{...player,canPitch:false,requiresPitchWarmup:false}:player);
  const plan=scheduler.buildSchedule(changed,'18:00',120);
  assert.deepEqual(plan.feasibilityErrors,[],`deterministic Hitting Only fixture for ${name} must rebuild safely`);
  assert.deepEqual(scheduler.validate(plan),[],`deterministic Hitting Only fixture for ${name} must pass audit`);
 }
}
const catcherChoiceFixture=firstFixture(result=>result.catchers.length>0);
if(catcherChoiceFixture){
 for(const name of catcherChoiceFixture.found.catchers){
  const changed=catcherChoiceFixture.roster.map(player=>player.name===name?{...player,canCatch:false}:player);
  const plan=scheduler.buildSchedule(changed,'18:00',120);
  assert.deepEqual(plan.feasibilityErrors,[],`deterministic Not Catching fixture for ${name} must rebuild safely`);
  assert.deepEqual(scheduler.validate(plan),[],`deterministic Not Catching fixture for ${name} must pass audit`);
 }
}
const combinedPitcherFixture=firstFixture(result=>result.combinedPitchers.length>0);
if(combinedPitcherFixture){
 for(const name of combinedPitcherFixture.found.combinedPitchers){
  const changed=extendForResolution(combinedPitcherFixture.roster).map(player=>player.name===name?{...player,canPitch:false,requiresPitchWarmup:false}:player);
  const plan=scheduler.buildSchedule(changed,'18:00',132);
  assert.deepEqual(plan.feasibilityErrors,[],`deterministic combined Hitting Only + Block 11 fixture for ${name} must rebuild safely`);
  assert.deepEqual(scheduler.validate(plan),[],`deterministic combined Hitting Only + Block 11 fixture for ${name} must pass audit`);
 }
}
const combinedCatcherFixture=firstFixture(result=>result.combinedCatchers.length>0);
if(combinedCatcherFixture){
 for(const name of combinedCatcherFixture.found.combinedCatchers){
  const changed=extendForResolution(combinedCatcherFixture.roster).map(player=>player.name===name?{...player,canCatch:false}:player);
  const plan=scheduler.buildSchedule(changed,'18:00',132);
  assert.deepEqual(plan.feasibilityErrors,[],`deterministic combined Not Catching + Block 11 fixture for ${name} must rebuild safely`);
  assert.deepEqual(scheduler.validate(plan),[],`deterministic combined Not Catching + Block 11 fixture for ${name} must pass audit`);
 }
}
// The bounded search itself is a regression signal: if a family is not reachable
// from ordinary role/availability changes, keep it fail-closed rather than
// fabricating an option. Log the exact fixtures so CI output can be used for the
// next on-device test without trial-and-error.
console.log('Resolution 550 fixtures',JSON.stringify({
 block11:block11Fixture&&{disabledPitchMask:block11Fixture.disabledPitchMask,early:block11Fixture.early,until:block11Fixture.until},
 pitcher:pitcherChoiceFixture&&{disabledPitchMask:pitcherChoiceFixture.disabledPitchMask,early:pitcherChoiceFixture.early,until:pitcherChoiceFixture.until,names:pitcherChoiceFixture.found.pitchers},
 catcher:catcherChoiceFixture&&{disabledPitchMask:catcherChoiceFixture.disabledPitchMask,early:catcherChoiceFixture.early,until:catcherChoiceFixture.until,names:catcherChoiceFixture.found.catchers},
 combinedPitcher:combinedPitcherFixture&&{disabledPitchMask:combinedPitcherFixture.disabledPitchMask,early:combinedPitcherFixture.early,until:combinedPitcherFixture.until,names:combinedPitcherFixture.found.combinedPitchers},
 combinedCatcher:combinedCatcherFixture&&{disabledPitchMask:combinedCatcherFixture.disabledPitchMask,early:combinedCatcherFixture.early,until:combinedCatcherFixture.until,names:combinedCatcherFixture.found.combinedCatchers}
}));


/* Resolution 551 real KC Rebels roster fixture discovery.
   Synthetic Scenario indexes are not allowed to stand in for production identities.
   Search the actual app roster, role model and 6:00p time mapping so the next device
   test can be stated in player names and clock times. */
const realRoster=[
 {name:'Aniesa Rohleder',isPitcher:true,isCatcher:false},
 {name:'Brooklyn Gering',isPitcher:true,isCatcher:false},
 {name:'Brynna Peter',isPitcher:false,isCatcher:false},
 {name:'Claire Jack',isPitcher:false,isCatcher:false},
 {name:'Hailey Marsh',isPitcher:false,isCatcher:false},
 {name:'Lakyn Farley',isPitcher:true,isCatcher:false},
 {name:'Lydia Copeland',isPitcher:false,isCatcher:true},
 {name:'Maia Waddell',isPitcher:false,isCatcher:false},
 {name:'Makenna Whitaker',isPitcher:true,isCatcher:false},
 {name:'Maleah Pena',isPitcher:false,isCatcher:false},
 {name:'Mattingly Hardy',isPitcher:false,isCatcher:false},
 {name:'Megan Ryan',isPitcher:true,isCatcher:false},
 {name:'Tayte Stepps',isPitcher:false,isCatcher:true}
].map(player=>({...player,canPitch:player.isPitcher,requiresPitchWarmup:player.isPitcher,canCatch:player.isCatcher,availableFromBlock:0,availableUntilBlock:10}));
function clockForUntil(until){const total=18*60+until*12;return String(Math.floor(total/60)).padStart(2,'0')+':'+String(total%60).padStart(2,'0');}
function firstRealFixture(predicate){
 const pitcherIndexes=realRoster.map((p,i)=>p.isPitcher?i:-1).filter(i=>i>=0);
 for(let disabledMask=0;disabledMask<(1<<pitcherIndexes.length);disabledMask++){
  for(let early=-1;early<realRoster.length;early++){
   for(const until of [4,5,6,7,8,9,10]){
    const roster=cloneRoster(realRoster);
    pitcherIndexes.forEach((index,bit)=>{if(disabledMask&(1<<bit)){roster[index].canPitch=false;roster[index].requiresPitchWarmup=false;}});
    if(early>=0)roster[early].availableUntilBlock=until;
    const found=resolutionCandidates(roster);
    if(predicate(found))return {roster,found,disabledMask,early,until,departure:clockForUntil(until)};
   }
  }
 }
 return null;
}
const realPitcherFixture=firstRealFixture(r=>r.pitchers.length>0);
const realCatcherFixture=firstRealFixture(r=>r.catchers.length>0);
const realCombinedPitcherFixture=firstRealFixture(r=>r.combinedPitchers.length>0);
const realCombinedCatcherFixture=firstRealFixture(r=>r.combinedCatchers.length>0);
for(const fixture of [realPitcherFixture,realCatcherFixture,realCombinedPitcherFixture,realCombinedCatcherFixture].filter(Boolean)){
 assert.ok(fixture.early<0||realRoster[fixture.early].name,'real fixture must resolve to an actual player identity');
 assert.ok(/^\\d{2}:\\d{2}$/.test(fixture.departure),'real fixture must expose an exact clock departure');
}
// Resolution 551 real roster fixture output is a required CI artifact.\nconsole.log('Resolution 551 real fixtures',JSON.stringify({
 pitcher:realPitcherFixture&&{disabledMask:realPitcherFixture.disabledMask,early:realPitcherFixture.early<0?null:realRoster[realPitcherFixture.early].name,until:realPitcherFixture.until,departure:realPitcherFixture.departure,names:realPitcherFixture.found.pitchers},
 catcher:realCatcherFixture&&{disabledMask:realCatcherFixture.disabledMask,early:realCatcherFixture.early<0?null:realRoster[realCatcherFixture.early].name,until:realCatcherFixture.until,departure:realCatcherFixture.departure,names:realCatcherFixture.found.catchers},
 combinedPitcher:realCombinedPitcherFixture&&{disabledMask:realCombinedPitcherFixture.disabledMask,early:realCombinedPitcherFixture.early<0?null:realRoster[realCombinedPitcherFixture.early].name,until:realCombinedPitcherFixture.until,departure:realCombinedPitcherFixture.departure,names:realCombinedPitcherFixture.found.combinedPitchers},
 combinedCatcher:realCombinedCatcherFixture&&{disabledMask:realCombinedCatcherFixture.disabledMask,early:realCombinedCatcherFixture.early<0?null:realRoster[realCombinedCatcherFixture.early].name,until:realCombinedCatcherFixture.until,departure:realCombinedCatcherFixture.departure,names:realCombinedCatcherFixture.found.combinedCatchers}
}));

const catcherDisabled=scenario(9,4,2);
catcherDisabled[4].canCatch=false;
const catcherDisabledPlan=scheduler.buildSchedule(catcherDisabled);
assert.deepEqual(catcherDisabledPlan.feasibilityErrors,[],'a catcher marked Not Catching must remain a feasible hitter when the remaining catching plan works');
assert.ok(!catcherDisabledPlan.liveSessions.some(session=>session.catcher===catcherDisabled[4].name),'Not Catching player must never be assigned as a live catcher');
assert.ok(catcherDisabledPlan.schedule[catcherDisabled[4].name].some(entry=>entry.activity==='Hit Live'),'Not Catching player must remain in the hitting rotation');
assert.ok(!catcherDisabledPlan.schedule[catcherDisabled[4].name].some(entry=>entry.activity==='Catch Live'||entry.activity==='Catch Warm-Up'),'Not Catching player must never receive catching work');

const pitcherDisabled=scenario(9,4,2);
pitcherDisabled[0].canPitch=false;pitcherDisabled[0].requiresPitchWarmup=false;
const pitcherDisabledPlan=scheduler.buildSchedule(pitcherDisabled);
assert.ok(!pitcherDisabledPlan.liveSessions.some(session=>session.pitcher===pitcherDisabled[0].name),'Hitting Only pitcher must never pitch live');
assert.ok(!pitcherDisabledPlan.schedule[pitcherDisabled[0].name].some(entry=>entry.activity==='Pitch Live'||entry.activity==='Pitch Warm-Up'),'Hitting Only pitcher must never receive pitching work');
assert.ok(pitcherDisabledPlan.schedule[pitcherDisabled[0].name].some(entry=>entry.activity==='Hit Live'),'Hitting Only pitcher must remain in the hitting rotation');

const invalidCatcherResolution=structuredClone(catcherDisabledPlan);
invalidCatcherResolution.schedule[catcherDisabled[4].name][2]={activity:'Catch Warm-Up',partner:'Scenario 9-1'};
assert.ok(scheduler.validate(invalidCatcherResolution).some(error=>error.includes('Not Catching but has catching work assigned')),'full resolution audit must reject catching work assigned to a Not Catching player');

const invalidPitcherResolution=structuredClone(pitcherDisabledPlan);
invalidPitcherResolution.schedule[pitcherDisabled[0].name][2]={activity:'Pitch Warm-Up',partner:'Coach'};
assert.ok(scheduler.validate(invalidPitcherResolution).some(error=>error.includes('Hitting Only but has pitching work assigned')),'full resolution audit must reject pitching work assigned to a Hitting Only player');

const block11DepartureRoster=scenario(13,5,2).map((player,index)=>({...player,availableUntilBlock:index===0?10:11}));
const block11DeparturePlan=scheduler.buildSchedule(block11DepartureRoster,'18:00',132);
assert.ok(block11DeparturePlan.schedule[block11DepartureRoster[0].name][10].activity==='Not Present','a player with a protected departure must remain Not Present in Block 11');
assert.ok(!block11DeparturePlan.liveSessions.some(session=>session.block===10&&(session.pitcher===block11DepartureRoster[0].name||session.catcher===block11DepartureRoster[0].name||session.hitters?.includes(block11DepartureRoster[0].name))),'Block 11 must not assign a protected-departure player to live work');
assert.deepEqual(scheduler.validate(block11DeparturePlan),[],'Block 11 with a protected departure must still pass the full rules audit');
const invalidBlock11Live=structuredClone(block11DeparturePlan);
invalidBlock11Live.liveSessions.push({block:10,pitcher:block11DepartureRoster[0].name,catcher:'9Square',hitters:[block11DepartureRoster[1].name,block11DepartureRoster[2].name]});
assert.ok(scheduler.validate(invalidBlock11Live).some(error=>error.includes('pitches live in Block 11 while unavailable')),'full resolution audit must reject an unavailable Block 11 live pitcher');
const malformedLive=structuredClone(block11DeparturePlan);
malformedLive.liveSessions.push({block:99,pitcher:block11DepartureRoster[1].name,catcher:'9Square'});
assert.ok(scheduler.validate(malformedLive).some(error=>error.includes('invalid block assignment')),'full resolution audit must reject a malformed live-session block instead of trusting it');
const ineligibleLiveRoles=structuredClone(block11DeparturePlan);
ineligibleLiveRoles.liveSessions.push({block:9,pitcher:block11DepartureRoster.find(player=>!player.isPitcher).name,catcher:block11DepartureRoster.find(player=>!player.isCatcher).name,hitters:[block11DepartureRoster[1].name,block11DepartureRoster[2].name]});
assert.ok(scheduler.validate(ineligibleLiveRoles).some(error=>error.includes('not eligible to pitch live')),'full resolution audit must reject a non-pitcher assigned as the live pitcher');
assert.ok(scheduler.validate(ineligibleLiveRoles).some(error=>error.includes('not eligible to catch live')),'full resolution audit must reject a non-catcher assigned as the live catcher');
const conflictingLive=structuredClone(block11DeparturePlan);
const conflictPitcher=conflictingLive.players.find(player=>player.isPitcher&&player.canPitch);
const conflictCatcher=conflictingLive.players.find(player=>player.isCatcher&&player.canCatch&&player.name!==conflictPitcher.name);
const conflictHitter=conflictingLive.players.find(player=>player.name!==conflictPitcher.name&&player.name!==conflictCatcher.name);
conflictingLive.liveSessions.push({block:9,pitcher:conflictPitcher.name,catcher:conflictCatcher.name,hitters:[conflictHitter.name,conflictHitter.name,conflictPitcher.name]});
const conflictingErrors=scheduler.validate(conflictingLive);
assert.ok(conflictingErrors.some(error=>error.includes('repeats the same hitter')),'full resolution audit must reject duplicate hitters inside one live session');
assert.ok(conflictingErrors.some(error=>error.includes('cannot pitch and hit in the same live session')),'full resolution audit must reject a pitcher simultaneously listed as a hitter');
const mismatchedLiveMetadata=structuredClone(block11DeparturePlan);
const recordedLive=mismatchedLiveMetadata.liveSessions.find(session=>session.pitcher&&session.pitcher!=='Coach');
assert.ok(recordedLive,'regression fixture must contain a live session');
mismatchedLiveMetadata.schedule[recordedLive.pitcher][recordedLive.block]={activity:'Drill #99'};
assert.ok(scheduler.validate(mismatchedLiveMetadata).some(error=>error.includes("live-session record does not match Pitch Live")),'full resolution audit must reject live metadata that disagrees with the player schedule');
const overlappingLive=structuredClone(block11DeparturePlan);
const sourceLive=overlappingLive.liveSessions[0];
overlappingLive.liveSessions.push({...structuredClone(sourceLive)});
assert.ok(scheduler.validate(overlappingLive).some(error=>error.includes('assigned to more than one live role/session')),'full resolution audit must reject overlapping live sessions that reuse a player in the same block');
const orphanedScheduleLive=structuredClone(block11DeparturePlan);
const orphanSource=orphanedScheduleLive.liveSessions[0];
orphanedScheduleLive.liveSessions=orphanedScheduleLive.liveSessions.filter(session=>session!==orphanSource);
const orphanErrors=scheduler.validate(orphanedScheduleLive);
assert.ok(orphanErrors.some(error=>error.includes('Pitch Live')&&error.includes('without a matching live-session record')),'full resolution audit must reject scheduled live pitching with missing live-session metadata');
assert.ok(orphanErrors.some(error=>error.includes('Hit Live')&&error.includes('without a matching live-session record')),'full resolution audit must reject scheduled live hitting with missing live-session metadata');
const ineligibleScheduledRole=structuredClone(block11DeparturePlan);
const nonPitcher=ineligibleScheduledRole.players.find(player=>!player.isPitcher);
ineligibleScheduledRole.schedule[nonPitcher.name][9]={activity:'Pitch Live'};
assert.ok(scheduler.validate(ineligibleScheduledRole).some(error=>error.includes('Pitch Live in Block 10')&&error.includes('not eligible to pitch')),'full resolution audit must independently reject ineligible scheduled live pitching even when metadata is absent or corrupt');
const brokenWarmupPair=structuredClone(block11DeparturePlan);
const warmPitcher=brokenWarmupPair.players.find(player=>(brokenWarmupPair.schedule[player.name]||[]).some(entry=>entry.activity==='Pitch Warm-Up'));
assert.ok(warmPitcher,'regression fixture must contain a pitcher warm-up');
const warmBlock=brokenWarmupPair.schedule[warmPitcher.name].findIndex(entry=>entry.activity==='Pitch Warm-Up');
const warmPartner=brokenWarmupPair.schedule[warmPitcher.name][warmBlock].partner;
if(warmPartner!=='Coach')brokenWarmupPair.schedule[warmPartner][warmBlock]={activity:'Drill #98'};
else brokenWarmupPair.schedule[warmPitcher.name][warmBlock].partner='';
assert.ok(scheduler.validate(brokenWarmupPair).some(error=>error.includes('Pitch Warm-Up')&&(error.includes("does not match the catcher's warm-up assignment")||error.includes('missing a catcher/coach partner'))),'full resolution audit must reject a broken pitcher/catcher warm-up pairing');
const malformedAvailability=structuredClone(block11DeparturePlan);
malformedAvailability.players[0].availableUntilBlock=12;
assert.ok(scheduler.validate(malformedAvailability).some(error=>error.includes('invalid practice availability')),'full resolution audit must reject availability outside the verified block range');

const malformedBlockCount=structuredClone(block11DeparturePlan);
malformedBlockCount.schedule[malformedBlockCount.players[0].name].pop();
assert.ok(scheduler.validate(malformedBlockCount).some(error=>error.includes('invalid number of practice blocks')),'full resolution audit must reject a player schedule whose block count does not match the practice');

const unnamedAttendee=structuredClone(block11DeparturePlan);
unnamedAttendee.players[0].name='';
assert.ok(scheduler.validate(unnamedAttendee).some(error=>error.includes('Every attending player must have a name')),'full resolution audit must reject an unnamed attendee rather than verifying ambiguous identity');
const malformedBuildRoster=scenario(13,5,2);
malformedBuildRoster[0].availableUntilBlock=99;
const malformedBuildPlan=scheduler.buildSchedule(malformedBuildRoster,'18:00',120);
assert.ok(malformedBuildPlan.feasibilityErrors.some(error=>error.includes('invalid availability')),'scheduler must reject malformed availability before Practice Resolution searches alternatives');

const unnamedBuildRoster=scenario(13,5,2);
unnamedBuildRoster[0].name='';
const unnamedBuildPlan=scheduler.buildSchedule(unnamedBuildRoster,'18:00',120);
assert.ok(unnamedBuildPlan.feasibilityErrors.some(error=>error.includes('Every attending player must have a name')),'scheduler must reject unnamed attendees before Practice Resolution can silently drop them');
const orphanSupport=structuredClone(block11DeparturePlan);
const supportPlayer=orphanSupport.players.find(player=>(orphanSupport.schedule[player.name]||[]).some(entry=>entry.activity.startsWith('Drill #')));
const supportBlock=orphanSupport.schedule[supportPlayer.name].findIndex(entry=>entry.activity.startsWith('Drill #'));
orphanSupport.schedule[supportPlayer.name][supportBlock]={activity:'Machine Feed'};
orphanSupport.players.forEach(player=>{if(player.name!==supportPlayer.name&&orphanSupport.schedule[player.name][supportBlock]?.activity==='Machine')orphanSupport.schedule[player.name][supportBlock]={activity:'Drill #97'}});
assert.ok(scheduler.validate(orphanSupport).some(error=>error.includes('Machine Feed')&&error.includes('without an active Machine station')),'full resolution audit must reject an orphaned singleton support assignment');
const extraLiveRole=structuredClone(block11DeparturePlan);
const extraRolePlayer=extraLiveRole.players.find(player=>(extraLiveRole.schedule[player.name]||[])[9]?.activity!=='Not Present'&&!extraLiveRole.liveSessions.some(session=>session.block===9&&(session.pitcher===player.name||session.catcher===player.name||session.hitters?.includes(player.name))));
assert.ok(extraRolePlayer,'regression fixture must contain a player outside the Block 10 live session');
extraLiveRole.schedule[extraRolePlayer.name][9]={activity:'Hit Live'};
const extraRoleErrors=scheduler.validate(extraLiveRole);
assert.ok(extraRoleErrors.some(error=>error.includes('live-session role count does not match')||error.includes('without the exact matching live role')),'full resolution audit must reject extra scheduled live roles that are absent from live metadata');














const elevenBlockRoster=scenario(13,5,2).map(player=>({...player,availableUntilBlock:11}));
const elevenBlockPlan=scheduler.buildSchedule(elevenBlockRoster,'18:00',132);
assert.equal(elevenBlockPlan.blocks.length,11,'132-minute emergency practice must contain exactly eleven blocks');
assert.ok(Object.values(elevenBlockPlan.schedule).every(entries=>entries.length===11),'every player schedule must carry Block 11');
assert.deepEqual(scheduler.validate(elevenBlockPlan),[],'verified eleven-block practice must pass the complete rules audit');
assert.ok(elevenBlockPlan.liveSessions.every(session=>session.block>=3&&session.block<=10),'132-minute Live sessions must stay inside Blocks 4-11');
assert.ok(elevenBlockPlan.liveSessions.every(session=>session.block<elevenBlockPlan.blocks.length),'132-minute Live metadata must never exceed the generated block count');


const disableFirstMatching=(roster,predicate,changes)=>{
 const index=roster.findIndex(predicate);
 assert.notEqual(index,-1,'role regression fixture must contain the requested player');
 const copy=roster.map(player=>({...player}));
 copy[index]={...copy[index],...changes};
 return {roster:copy,player:copy[index]};
};

const disabledCatcherFixture=disableFirstMatching(scenario(13,5,2),player=>player.isCatcher,{canCatch:false});
const disabledCatcher=disabledCatcherFixture.player,disabledCatcherPlan=scheduler.buildSchedule(disabledCatcherFixture.roster,'18:00',120);
assert.deepEqual(disabledCatcherPlan.feasibilityErrors,[],'Not Catching regression fixture must remain schedulable');
assert.ok(!(disabledCatcherPlan.schedule[disabledCatcher.name]||[]).some(entry=>entry.activity==='Catch Live'||entry.activity==='Catch Warm-Up'),'Not Catching player must remain in practice without catcher work');
assert.deepEqual(scheduler.validate(disabledCatcherPlan),[],'Not Catching practice must remain fully auditable');

const noWarmupFixture=disableFirstMatching(scenario(13,5,2),player=>player.isPitcher,{requiresPitchWarmup:false});
const noWarmupPitcher=noWarmupFixture.player,noWarmupPlan=scheduler.buildSchedule(noWarmupFixture.roster,'18:00',120);
assert.deepEqual(noWarmupPlan.feasibilityErrors,[],'No Pitch Warm-Up regression fixture must remain schedulable');
assert.ok(!(noWarmupPlan.schedule[noWarmupPitcher.name]||[]).some(entry=>entry.activity==='Pitch Warm-Up'),'No Pitch Warm-Up player may still pitch live but must not receive pitching warm-up');
assert.deepEqual(scheduler.validate(noWarmupPlan),[],'No Pitch Warm-Up practice must remain fully auditable');

const hittingOnlyFixture=disableFirstMatching(scenario(13,5,2),player=>player.isPitcher,{canPitch:false,requiresPitchWarmup:false});
const hittingOnlyPitcher=hittingOnlyFixture.player,hittingOnlyPlan=scheduler.buildSchedule(hittingOnlyFixture.roster,'18:00',120);
assert.deepEqual(hittingOnlyPlan.feasibilityErrors,[],'Hitting Only regression fixture must remain schedulable');
assert.ok(!(hittingOnlyPlan.schedule[hittingOnlyPitcher.name]||[]).some(entry=>entry.activity==='Pitch Live'||entry.activity==='Pitch Warm-Up'),'Hitting Only player must stay in practice without pitching work');
assert.deepEqual(scheduler.validate(hittingOnlyPlan),[],'Hitting Only practice must remain fully auditable');

const resolutionRoleRoster=scenario(13,5,2);
const resolutionRoleBase=scheduler.buildSchedule(resolutionRoleRoster,'18:00',120);
if(resolutionRoleBase.feasibilityErrors.length){
 const verifiedAlternatives=[];
 for(const player of resolutionRoleRoster.filter(player=>player.isPitcher&&player.canPitch!==false)){
  const changed=resolutionRoleRoster.map(item=>item.name===player.name?{...item,canPitch:false,requiresPitchWarmup:false}:item);
  const candidate=scheduler.buildSchedule(changed,'18:00',120);
  if(!candidate.feasibilityErrors.length&&!scheduler.validate(candidate).length)verifiedAlternatives.push({type:'pitcher',name:player.name,candidate});
 }
 for(const player of resolutionRoleRoster.filter(player=>player.isCatcher&&player.canCatch!==false)){
  const changed=resolutionRoleRoster.map(item=>item.name===player.name?{...item,canCatch:false}:item);
  const candidate=scheduler.buildSchedule(changed,'18:00',120);
  if(!candidate.feasibilityErrors.length&&!scheduler.validate(candidate).length)verifiedAlternatives.push({type:'catcher',name:player.name,candidate});
 }
 for(const alternative of verifiedAlternatives){
  assert.deepEqual(scheduler.validate(alternative.candidate),[],`verified Practice Resolution ${alternative.type} alternative for ${alternative.name} must remain fully auditable`);
 }
}



// Resolution 494: Machine grouping must solve valid fragmented availability instead
// of failing because a greedy first-fit leaves an isolated player. This fixture is
// intentionally constrained after fixed work; a complete 2-3 grouping exists.
const fragmentedMachineRoster=[
 {name:'FM1',isPitcher:true,canPitch:true,requiresPitchWarmup:true,availableFromBlock:0,availableUntilBlock:10},
 {name:'FM2',isPitcher:true,canPitch:true,requiresPitchWarmup:true,availableFromBlock:0,availableUntilBlock:10},
 {name:'FM3',isPitcher:true,canPitch:true,requiresPitchWarmup:true,availableFromBlock:0,availableUntilBlock:10},
 {name:'FM4',isPitcher:true,canPitch:true,requiresPitchWarmup:true,availableFromBlock:0,availableUntilBlock:10},
 {name:'FM5',isPitcher:false,availableFromBlock:0,availableUntilBlock:10},
 {name:'FM6',isPitcher:false,isCatcher:true,canCatch:true,availableFromBlock:0,availableUntilBlock:10},
 {name:'FM7',isPitcher:false,isCatcher:true,canCatch:true,availableFromBlock:0,availableUntilBlock:10},
 {name:'FM8',isPitcher:false,availableFromBlock:0,availableUntilBlock:10},
 {name:'FM9',isPitcher:false,availableFromBlock:0,availableUntilBlock:10},
 {name:'FM10',isPitcher:false,availableFromBlock:0,availableUntilBlock:10}
].map(player=>({canPitch:false,requiresPitchWarmup:false,canCatch:false,prePracticeComplete:false,isGuest:false,...player}));
const fragmentedMachinePlan=scheduler.buildSchedule(fragmentedMachineRoster,'18:00',120);
assert.ok(!fragmentedMachinePlan.feasibilityErrors.some(error=>error.includes('Machine cannot be scheduled')),'bounded exact grouping must not manufacture a Machine failure when a valid 2-3 grouping exists');
if(!fragmentedMachinePlan.feasibilityErrors.length)assert.deepEqual(scheduler.validate(fragmentedMachinePlan),[],'fragmented Machine solution must pass the complete audit');



// Resolution 495: exact phone edge case — Tayte absent, Lydia attends but Catching
// is off, and Lakyn attends but Pitching is off. The remaining four pitchers plus
// twelve hitters have a legal Live assignment; greedy hitter filling used to strand
// a player and manufacture a Practice Resolution failure.
const rebels12NoCatchLakynHitOnly=rebels13.filter(player=>player.name!=='Tayte Stepps').map(player=>{
 if(player.name==='Lydia Copeland')return {...player,canCatch:false};
 if(player.name==='Lakyn Farley')return {...player,canPitch:false,requiresPitchWarmup:false};
 return {...player};
});
const rebels12NoCatchLakynHitOnlyPlan=scheduler.buildSchedule(rebels12NoCatchLakynHitOnly,'18:00',120);
assert.deepEqual(rebels12NoCatchLakynHitOnlyPlan.feasibilityErrors,[],'12-player no-catcher/Lakyn-hitting-only phone setup must build directly');
assert.deepEqual(scheduler.validate(rebels12NoCatchLakynHitOnlyPlan),[],'12-player no-catcher/Lakyn-hitting-only plan must pass the full audit');
assert.equal(rebels12NoCatchLakynHitOnlyPlan.liveSessions.length,4,'the four remaining available pitchers must each receive one Live block');
assert.ok(rebels12NoCatchLakynHitOnlyPlan.liveSessions.every(session=>session.hitters.length>=2&&session.hitters.length<=3),'every Live block must contain 2-3 hitters');
assert.ok(rebels12NoCatchLakynHitOnlyPlan.schedule['Lakyn Farley'].every(entry=>entry.activity!=='Pitch Live'&&entry.activity!=='Pitch Warm-Up'),'Lakyn Hitting Only must receive no pitching work');
assert.ok(rebels12NoCatchLakynHitOnlyPlan.schedule['Lydia Copeland'].every(entry=>entry.activity!=='Catch Live'&&entry.activity!=='Catch Warm-Up'),'Lydia Not Catching must receive no catching work');



// Resolution 496: exact phone edge case — Tayte absent, Lydia Not Catching,
// Lakyn pitching normally, and Makenna arrives 30 minutes late. With no catcher,
// Coach must cover pitcher warm-ups. The warm-up matcher must reserve Makenna's
// scarce post-arrival slot rather than greedily consuming it for another pitcher.
const rebels12NoCatchMakennaLate=rebels13.filter(player=>player.name!=='Tayte Stepps').map(player=>{
 if(player.name==='Lydia Copeland')return {...player,canCatch:false};
 if(player.name==='Makenna Whitaker')return {...player,availableFromBlock:3};
 return {...player};
});
const rebels12NoCatchMakennaLatePlan=scheduler.buildSchedule(rebels12NoCatchMakennaLate,'18:00',120);
assert.deepEqual(rebels12NoCatchMakennaLatePlan.feasibilityErrors,[],'12-player no-catcher/Makenna-late phone setup must build directly');
assert.deepEqual(scheduler.validate(rebels12NoCatchMakennaLatePlan),[],'12-player no-catcher/Makenna-late plan must pass the full audit');
assert.equal(rebels12NoCatchMakennaLatePlan.schedule['Makenna Whitaker'][3].activity,'Stretch','late Makenna must warm up in her first attended block');
assert.equal(rebels12NoCatchMakennaLatePlan.schedule['Makenna Whitaker'][4].activity,'Tee Work','late Makenna must tee in her second attended block');
const makennaLatePitch=rebels12NoCatchMakennaLatePlan.schedule['Makenna Whitaker'].findIndex(entry=>entry.activity==='Pitch Live');
const makennaLateWarm=rebels12NoCatchMakennaLatePlan.schedule['Makenna Whitaker'].findIndex(entry=>entry.activity==='Pitch Warm-Up');
assert.ok(makennaLatePitch>=0&&makennaLateWarm>=0&&makennaLatePitch-makennaLateWarm>=1&&makennaLatePitch-makennaLateWarm<=2,'Makenna must receive a legal pitching warm-up within two blocks before Live');
assert.equal(rebels12NoCatchMakennaLatePlan.schedule['Makenna Whitaker'][makennaLateWarm].partner,'Coach','zero-catcher setup must use Coach for Makenna warm-up');
assert.ok(rebels12NoCatchMakennaLatePlan.schedule['Lydia Copeland'].every(entry=>entry.activity!=='Catch Live'&&entry.activity!=='Catch Warm-Up'),'Lydia Not Catching must remain out of all catcher work');


// Resolution 498 deployment regression: exact phone setup after adding Brooklyn 30-minute early departure
// to the verified Resolution 496 case. This is the configuration that surfaced the
// Front Toss failure on-device. Preserve it as an exact regression before changing
// the production search.
const rebels12NoCatchMakennaLateBrooklynEarly=rebels13.filter(player=>player.name!=='Tayte Stepps').map(player=>{
 if(player.name==='Lydia Copeland')return {...player,canCatch:false};
 if(player.name==='Makenna Whitaker')return {...player,availableFromBlock:3};
 if(player.name==='Brooklyn Gering')return {...player,availableUntilBlock:7};
 return {...player};
});
const rebels12NoCatchMakennaLateBrooklynEarlyPlan=scheduler.buildSchedule(rebels12NoCatchMakennaLateBrooklynEarly,'18:00',120);
assert.deepEqual(rebels12NoCatchMakennaLateBrooklynEarlyPlan.feasibilityErrors,[],'exact phone setup with Makenna late and Brooklyn early must build directly');
assert.deepEqual(scheduler.validate(rebels12NoCatchMakennaLateBrooklynEarlyPlan),[],'exact opposite-availability phone setup must pass the full audit');
const brooklynEarlyPitch=rebels12NoCatchMakennaLateBrooklynEarlyPlan.schedule['Brooklyn Gering'].findIndex(entry=>entry.activity==='Pitch Live');
const brooklynEarlyWarm=rebels12NoCatchMakennaLateBrooklynEarlyPlan.schedule['Brooklyn Gering'].findIndex(entry=>entry.activity==='Pitch Warm-Up');
assert.ok(brooklynEarlyPitch>=0&&brooklynEarlyPitch<7,'Brooklyn must pitch before her 30-minute-early departure');
assert.ok(brooklynEarlyWarm>=0&&brooklynEarlyPitch-brooklynEarlyWarm>=1&&brooklynEarlyPitch-brooklynEarlyWarm<=2,'Brooklyn must retain a legal pitching warm-up without consuming her only Front Toss opportunity');
const rebels12NoCatchMakennaLateBrooklynEarly11=rebels12NoCatchMakennaLateBrooklynEarly.map(player=>({...player,availableUntilBlock:player.name==='Brooklyn Gering'?7:11}));
const rebels12NoCatchMakennaLateBrooklynEarly11Plan=scheduler.buildSchedule(rebels12NoCatchMakennaLateBrooklynEarly11,'18:00',132);
assert.deepEqual(rebels12NoCatchMakennaLateBrooklynEarly11Plan.feasibilityErrors,[],'Block 11 should provide a verified resolution for the exact opposite-availability phone setup');
assert.deepEqual(scheduler.validate(rebels12NoCatchMakennaLateBrooklynEarly11Plan),[],'Block 11 resolution for the exact phone setup must pass the full audit');

console.log('practice-scheduler tests passed');
