const assert=require('node:assert/strict');
const history=require('./practice-history.js');

assert.deepEqual(history.drillUsage([], 'Two Tee'),{percentage:null,lastDate:null});
assert.deepEqual(history.attendance([], 'Aniesa Rohleder'),{percentage:null});

let records=[];
records=history.saveCompleted(records,{id:'p1',practiceDate:'2026-09-02',completedAt:'2026-09-03T00:00:00.000Z',attendees:['Aniesa Rohleder','Lydia Copeland'],drills:['Two Tee','Two Tee','Rear Toss']});
records=history.saveCompleted(records,{id:'p2',practiceDate:'2026-09-09',completedAt:'2026-09-10T00:00:00.000Z',attendees:['Lydia Copeland'],drills:['Rear Toss']});
assert.equal(records.length,2);
assert.deepEqual(history.drillUsage(records,'Two Tee'),{percentage:50,lastDate:'2026-09-02'});
assert.deepEqual(history.drillUsage(records,'Rear Toss'),{percentage:100,lastDate:'2026-09-09'});
assert.deepEqual(history.attendance(records,'Aniesa Rohleder'),{percentage:50});
assert.deepEqual(history.attendance(records,'Lydia Copeland'),{percentage:100});

records=history.saveCompleted(records,{id:'p2',practiceDate:'2026-09-09',completedAt:'2026-09-10T00:05:00.000Z',attendees:['Aniesa Rohleder','Lydia Copeland'],drills:['Rear Toss']});
assert.equal(records.length,2,'ending the same practice again must not add a second record');
assert.deepEqual(history.attendance(records,'Aniesa Rohleder'),{percentage:100});
assert.equal(history.dateLabel('2026-09-02'),'September 2nd');
assert.equal(history.dateLabel('2026-11-18'),'November 18th');

console.log('practice-history tests passed');
