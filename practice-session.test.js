const assert=require('node:assert/strict');
const session=require('./practice-session.js');

assert.equal(session.create(),null);
assert.equal(session.restore(null),null);

const source={plan:{portalDraftId:'practice-1',blockMinutes:12,players:[{name:'Aniesa'}]},chosenDrills:[{name:'Two Tee'}],setupState:{selectedNames:['Aniesa']},clock:{running:true,finished:false,startAt:1000,lastBlock:1,lastTwoMinuteBlock:1}};
const saved=session.create(source);
source.plan.players[0].name='Changed';
assert.equal(saved.plan.players[0].name,'Aniesa','saved practice must be independent of working memory');

const restored=session.restore(saved,1000+25*60000);
assert.equal(restored.clock.running,true);
assert.equal(restored.clock.lastBlock,3,'restored clock must calculate the current block from elapsed time');
assert.equal(restored.clock.lastTwoMinuteBlock,1,'saved warning state must survive recovery');
restored.plan.players[0].name='Changed Again';
assert.equal(saved.plan.players[0].name,'Aniesa','restoring must not mutate the saved session');

const clock={running:true,startAt:1000,lastBlock:1,lastTwoMinuteBlock:0};
assert.equal(session.pendingTwoMinuteWarning(saved.plan,clock,1000+10*60000),1,'warning must become due at two minutes remaining');
clock.lastTwoMinuteBlock=1;
assert.equal(session.pendingTwoMinuteWarning(saved.plan,clock,1000+10*60000),null,'warning must not repeat in the same block');
assert.equal(session.pendingTwoMinuteWarning(saved.plan,{...clock,lastTwoMinuteBlock:1},1000+22*60000),2,'the next block receives its own warning');
assert.equal(session.pendingTwoMinuteWarning(saved.plan,{...clock,lastTwoMinuteBlock:0},1000+10*60000+6000),null,'a late resume must not announce an inaccurate two-minute warning');

console.log('practice-session tests passed');
