const assert=require('node:assert/strict');
const session=require('./practice-session.js');

assert.equal(session.create(),null);
assert.equal(session.restore(null),null);

const source={plan:{portalDraftId:'practice-1',blockMinutes:12,players:[{name:'Aniesa'}]},chosenDrills:[{name:'Two Tee'}],setupState:{selectedNames:['Aniesa']},clock:{running:true,finished:false,startAt:1000,lastBlock:1}};
const saved=session.create(source);
source.plan.players[0].name='Changed';
assert.equal(saved.plan.players[0].name,'Aniesa','saved practice must be independent of working memory');

const restored=session.restore(saved,1000+25*60000);
assert.equal(restored.clock.running,true);
assert.equal(restored.clock.lastBlock,3,'restored clock must calculate the current block from elapsed time');
restored.plan.players[0].name='Changed Again';
assert.equal(saved.plan.players[0].name,'Aniesa','restoring must not mutate the saved session');

console.log('practice-session tests passed');
