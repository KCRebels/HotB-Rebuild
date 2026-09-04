const assert=require('assert');
const coach=require('./coach-practice');
const plan={blocks:[
 {block:1,start:'6:00p',end:'6:12p',assignments:{Stretch:['A','B']}},
 {block:2,start:'6:12p',end:'6:24p',assignments:{'Tee Work':['A','B']}},
 {block:3,start:'6:24p',end:'6:36p',assignments:{'Pitch Warm-Up — Coach':['Aniesa Rohleder'],Machine:['Maia Waddell']}},
 {block:4,start:'6:36p',end:'6:48p',assignments:{'Front Toss Lane 1':['Maia Waddell','Brynna Peter'],Machine:['Claire Jack']}},
 {block:5,start:'6:48p',end:'7:00p',assignments:{Machine:['Claire Jack']}},
 {block:6,start:'7:00p',end:'7:12p',assignments:{'Pitch Live — Brooklyn Gering':['Brooklyn Gering'],'Hit Live — Brooklyn Gering':['Maia Waddell','Claire Jack']}},
 {block:7,start:'7:12p',end:'7:24p',assignments:{'Drill #1':['A','B']}}
],liveSessions:[{block:5,pitcher:'Brooklyn Gering',catcher:'9Square',hitters:['Maia Waddell','Claire Jack']} ]};
const schedule=coach.build(plan,[{name:'High Tee'}]);
assert.equal(schedule[0].assignment,'Help Lead Warm-Up');
assert.equal(schedule[1].assignment,'Help With Tee Work');
assert.equal(schedule[2].assignment,'Catch Pitch Warm-Up — Aniesa');
assert.equal(schedule[3].assignment,'Throw Front Toss — Lane 1 — Maia, Brynna');
assert.equal(schedule[4].assignment,'Run Machine — Claire');
assert.equal(schedule[5].assignment,'Live Support — Brooklyn (9Square)');
assert.equal(schedule[6].assignment,'Help With High Tee — A, B');
const focused=coach.build({...plan,machineFocus:'Velocity Training',frontTossFocus:'Hunt Your Zone'},[{name:'High Tee'}]);
assert.equal(focused[3].assignment,'Throw Front Toss — Lane 1 — Hunt Your Zone — Maia, Brynna');
assert.equal(focused[4].assignment,'Run Machine — Velocity Training — Claire');
console.log('coach-practice tests passed');
