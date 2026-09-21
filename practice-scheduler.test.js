const assert=require('node:assert/strict');
const scheduler=require('./practice-scheduler.js');

const fullPlayer={name:'Full Player',availableFromBlock:0,availableUntilBlock:10};
const latePlayer={name:'Late Player',availableFromBlock:3,availableUntilBlock:10};
const plan=scheduler.buildSchedule([fullPlayer,latePlayer],'18:00',120,{noPitchersMode:'skills'});

assert.equal(plan.schedule['Full Player'][0].activity,'Stretch');
assert.equal(plan.schedule['Full Player'][1].activity,'Tee Work');
assert.equal(plan.schedule['Late Player'][3].activity,'Stretch');
assert.equal(plan.schedule['Late Player'][4].activity,'Tee Work');
for(const player of plan.players){
 const teeBlocks=plan.schedule[player.name].map((entry,index)=>entry.activity==='Tee Work'?index:-1).filter(index=>index>=0);
 assert.deepEqual(teeBlocks,[player.availableFromBlock+1],`${player.name} must have exactly one Tee Work block`);
}

const invalid=structuredClone(plan);
invalid.schedule['Full Player'][5]={activity:'Tee Work'};
assert.ok(scheduler.validate(invalid).some(error=>error.includes('repeats Tee Work')));

const standardRoster=Array.from({length:13},(_,index)=>({name:`Player ${index+1}`,isPitcher:index<5,isCatcher:index===5||index===6,canPitch:index<5,requiresPitchWarmup:index<5,canCatch:index===5||index===6,availableFromBlock:0,availableUntilBlock:10}));
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
assert.ok(block11DeparturePlan.schedule[block11DepartureRoster[0].name][10].activity==='Unavailable','a player with a protected departure must remain unavailable in Block 11');
assert.ok(!block11DeparturePlan.liveSessions.some(session=>session.block===10&&(session.pitcher===block11DepartureRoster[0].name||session.catcher===block11DepartureRoster[0].name||session.hitters?.includes(block11DepartureRoster[0].name))),'Block 11 must not assign a protected-departure player to live work');
assert.deepEqual(scheduler.validate(block11DeparturePlan),[],'Block 11 with a protected departure must still pass the full rules audit');

const elevenBlockRoster=scenario(13,5,2).map(player=>({...player,availableUntilBlock:11}));
const elevenBlockPlan=scheduler.buildSchedule(elevenBlockRoster,'18:00',132);
assert.equal(elevenBlockPlan.blocks.length,11,'132-minute emergency practice must contain exactly eleven blocks');
assert.ok(Object.values(elevenBlockPlan.schedule).every(entries=>entries.length===11),'every player schedule must carry Block 11');
assert.deepEqual(scheduler.validate(elevenBlockPlan),[],'verified eleven-block practice must pass the complete rules audit');

console.log('practice-scheduler tests passed');
