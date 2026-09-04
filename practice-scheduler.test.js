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

console.log('practice-scheduler tests passed');
