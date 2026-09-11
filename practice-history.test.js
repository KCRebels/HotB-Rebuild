const assert=require('node:assert/strict');
const fs=require('node:fs');
const history=require('./practice-history.js');

assert.deepEqual(history.drillUsage([], 'Two Tee'),{percentage:null,lastDate:null});
assert.deepEqual(history.attendance([], 'Aniesa Rohleder'),{percentage:null,eligible:true});

let records=[];
records=history.saveCompleted(records,{id:'p1',practiceDate:'2026-09-02',completedAt:'2026-09-03T00:00:00.000Z',attendees:['Aniesa Rohleder','Lydia Copeland'],drills:['Two Tee','Two Tee','Rear Toss']});
records=history.saveCompleted(records,{id:'p2',practiceDate:'2026-09-09',completedAt:'2026-09-10T00:00:00.000Z',attendees:['Lydia Copeland'],drills:['Rear Toss']});
assert.equal(records.length,2);
assert.deepEqual(history.drillUsage(records,'Two Tee'),{percentage:50,lastDate:'2026-09-02'});
assert.deepEqual(history.drillUsage(records,'Rear Toss'),{percentage:100,lastDate:'2026-09-09'});
assert.deepEqual(history.attendance(records,'Aniesa Rohleder'),{percentage:50,eligible:true});
assert.deepEqual(history.attendance(records,'Lydia Copeland'),{percentage:100,eligible:true});

records=history.saveCompleted(records,{id:'p2',practiceDate:'2026-09-09',completedAt:'2026-09-10T00:05:00.000Z',attendees:['Aniesa Rohleder','Lydia Copeland'],drills:['Rear Toss']});
assert.equal(records.length,2,'ending the same practice again must not add a second record');
assert.deepEqual(history.attendance(records,'Aniesa Rohleder'),{percentage:100,eligible:true});
assert.deepEqual(history.attendance(records,{name:'Claire Jack',hittingPracticeAttendanceEligible:false}),{percentage:null,eligible:false},'an ineligible player is always N/A without changing history');

records=history.saveCompleted(records,{id:'p3',practiceDate:'2026-09-16',completedAt:'2026-09-17T00:00:00.000Z',attendees:['Guest Player','Aniesa Rohleder','Aniesa Rohleder'],drills:[]});
assert.deepEqual(history.attendance(records,'Lydia Copeland'),{percentage:67,eligible:true},'a full absence lowers the percentage');
assert.deepEqual(history.attendance(records,'Aniesa Rohleder'),{percentage:100,eligible:true},'an attendee is credited once regardless of accommodations or duplicate names');

records=history.saveCompleted(records,{id:'p4',practiceDate:'2026-09-23',completedAt:'2026-09-24T00:00:00.000Z',attendees:['Aniesa Rohleder'],accommodations:{'Aniesa Rohleder':{arrival:'18:20',departure:'19:20',limitations:'Pitching only'}},drills:[]});
assert.deepEqual(history.attendance(records,'Aniesa Rohleder'),{percentage:100,eligible:true},'late arrival, early departure, pitching, and physical limitations still count as attendance');

const withIncomplete=[...records,{id:'draft',status:'unfinished',completedAt:'2026-09-18T00:00:00.000Z',attendees:[]},{id:'canceled',status:'canceled',completedAt:'2026-09-19T00:00:00.000Z',attendees:[]}];
assert.deepEqual(history.attendance(withIncomplete,'Aniesa Rohleder'),{percentage:100,eligible:true},'unfinished and canceled practices do not enter the denominator');
assert.throws(()=>history.saveCompleted(records,{completedAt:'2026-09-20T00:00:00.000Z'}),/stable id/,'completed practices need an id so repeated completion cannot duplicate them');

const app=fs.readFileSync('./app.js','utf8');
assert.match(app,/Brynna Peter[^\n]+hittingPracticeAttendanceEligible:false/,'Brynna has a maintainable attendance eligibility flag');
assert.match(app,/Claire Jack[^\n]+hittingPracticeAttendanceEligible:false/,'Claire has a maintainable attendance eligibility flag');
assert.match(app,/filter\(player=>!player\.isGuest\)\.map\(player=>player\.name\)/,'only permanent players are committed as attendees');
assert.match(app,/practiceRateResult|practiceAttendanceResult/,'Evaluation reads attendance through the eligibility-aware result');
assert.match(app,/'N\/A'/,'Evaluation displays N/A for an ineligible player');
assert.match(app,/archiveCompletedPractice\(completedAt\);clearPracticeSession\(\)/,'ending a completed practice archives attendance before clearing its recoverable session');
assert.equal(history.dateLabel('2026-09-02'),'September 2nd');
assert.equal(history.dateLabel('2026-11-18'),'November 18th');

console.log('practice-history tests passed');
