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
assert.ok(!scheduler.validate(standardPlan).some(error=>error.includes('Tee Work')));
assert.ok(Object.values(standardPlan.schedule).every(entries=>entries.filter(entry=>entry.activity==='Tee Work').length===1));

console.log('practice-scheduler tests passed');
