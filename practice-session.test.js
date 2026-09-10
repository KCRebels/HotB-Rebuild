const assert=require('node:assert/strict');
const session=require('./practice-session.js');

assert.equal(session.create(),null);
assert.equal(session.restore(null),null);

const draft=session.createDraft({setupState:{selectedNames:['Aniesa'],guestPlayers:[{name:'Guest',phone:'9135551212'}]}});
assert.equal(draft.stage,'setup');
assert.equal(draft.plan,null);
assert.deepEqual(session.restore(draft).setupState.selectedNames,['Aniesa'],'an unfinished attendance draft must restore before a schedule exists');
assert.equal(session.restore(draft).setupState.guestPlayers[0].phone,'9135551212','guest contact information must survive draft recovery');

const source={plan:{portalDraftId:'practice-1',blockMinutes:12,machineFocus:'High Tee Machine',frontTossFocus:'Opposite Field Toss',players:[{name:'Aniesa'}],schedule:{Aniesa:[{block:1,activity:'Machine'}]},liveSessions:[{block:4,pitcher:'Aniesa',catcher:'Tayte'}]},chosenDrills:[{name:'Two Tee'}],draftDrills:[{name:'Connection Ball'}],drillPickerOpen:true,setupState:{selectedNames:['Aniesa'],guestPlayers:[{name:'Guest Ava',phone:'9135550000'}]},portalState:{active:true,id:'practice-1',players:['Aniesa','Guest Ava']},clock:{running:true,finished:false,startAt:1000,lastBlock:1,lastTwoMinuteBlock:1}};
const saved=session.create(source);
source.plan.players[0].name='Changed';
assert.equal(saved.plan.players[0].name,'Aniesa','saved practice must be independent of working memory');
assert.equal(saved.plan.machineFocus,'High Tee Machine','machine selection must be saved');
assert.equal(saved.plan.frontTossFocus,'Opposite Field Toss','front toss selection must be saved');
assert.equal(saved.plan.liveSessions[0].catcher,'Tayte','pitcher and catcher assignments must be saved');
assert.equal(saved.setupState.guestPlayers[0].phone,'9135550000','guest access information must be saved');
assert.equal(saved.portalState.id,'practice-1','portal activation must be saved with the practice');
assert.equal(saved.draftDrills[0].name,'Connection Ball','partially selected drill stations must survive leaving the app');
assert.equal(saved.drillPickerOpen,true,'resume must return to an unfinished drill picker');

const restored=session.restore(saved,1000+25*60000);
assert.equal(restored.clock.running,true);
assert.equal(restored.clock.lastBlock,3,'restored clock must calculate the current block from elapsed time');
assert.equal(restored.clock.lastTwoMinuteBlock,1,'saved warning state must survive recovery');
assert.equal(restored.clock.startAt,1000,'the original real-time start timestamp must survive recovery');
restored.plan.players[0].name='Changed Again';
assert.equal(saved.plan.players[0].name,'Aniesa','restoring must not mutate the saved session');

const clock={running:true,startAt:1000,lastBlock:1,lastTwoMinuteBlock:0};
assert.deepEqual(session.timing(saved.plan,clock,1000+54*60000),{block:5,remaining:6*60000,transition:false},'clock must derive block 5 and six minutes left from real time');
assert.deepEqual(session.timing(saved.plan,clock,1000+60*60000),{block:6,remaining:12*60000,transition:false},'six minutes away must resume at block 6 with twelve minutes left');
assert.equal(session.pendingTwoMinuteWarning(saved.plan,clock,1000+10*60000),1,'warning must become due at two minutes remaining');
clock.lastTwoMinuteBlock=1;
assert.equal(session.pendingTwoMinuteWarning(saved.plan,clock,1000+10*60000),null,'warning must not repeat in the same block');
assert.equal(session.pendingTwoMinuteWarning(saved.plan,{...clock,lastTwoMinuteBlock:1},1000+22*60000),2,'the next block receives its own warning');
assert.equal(session.pendingTwoMinuteWarning(saved.plan,{...clock,lastTwoMinuteBlock:0},1000+10*60000+6000),null,'a late resume must not announce an inaccurate two-minute warning');

console.log('practice-session tests passed');
