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
assert.deepEqual(nineFourOne.feasibilityErrors,[],'nine players, four pitchers and one catcher should work using Coach for one live block');
assert.deepEqual(nineFourOne.liveSessions.map(session=>session.hitters.length).sort(),[2,2,2,3]);
assert.equal(nineFourOne.liveSessions.filter(session=>session.catcher==='Coach').length,1);
assert.deepEqual(scheduler.validate(nineFourOne),[]);
const nineTwoOne=scheduler.buildSchedule(scenario(9,2,1));
assert.deepEqual(nineTwoOne.feasibilityErrors,[],'nine players, two pitchers and one catcher must remain feasible');
assert.deepEqual(scheduler.validate(nineTwoOne),[]);
const eightFiveTwo=scheduler.buildSchedule(scenario(8,5,2));
assert.ok(eightFiveTwo.feasibilityErrors.some(error=>error.includes('require at least 10 unique live hitters')),'an impossible pitcher-to-attendance ratio must produce a clear warning');

console.log('practice-scheduler tests passed');
