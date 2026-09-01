const assert=require('node:assert/strict');
const analysis=require('./hitting-analysis.js');

const NOW='2026-09-01T12:00:00.000Z';
function makeGame({date='2026-08-28T12:00:00.000Z',hitter='Test Hitter',style='R',pas=[]}={}){
 const game={id:`g-${date}-${Math.random()}`,date,plateAppearances:[],pitches:[]};
 pas.forEach((spec,index)=>{
  const pa=index+1,contactType=spec.contactType||'',outcome=spec.outcome||'H4O';
  game.plateAppearances.push({id:`pa-${pa}`,hitter,pa,outcome,contactType,fielder:spec.fielder||null,weak:!!spec.weak,hhb:!!spec.hhb,bunt:!!spec.bunt,slap:!!spec.slap,executionSuccesses:spec.executionSuccesses||0,executionAttempts:spec.executionAttempts||0});
  const pitchSpecs=spec.pitches||[{result:outcome==='K'?'K':'H4O',zone:'C1',pitchType:'FB'}];
  pitchSpecs.forEach((pitch,pitchIndex)=>game.pitches.push({id:`p-${pa}-${pitchIndex}`,hitter,pa,hitterStyle:style,zone:'C1',pitchType:'FB',...pitch}));
 });
 return game;
}
function repeat(count,factory){return Array.from({length:count},(_,index)=>factory(index))}

assert.equal(analysis.normalizeContact({contactType:'GB'}),'GROUND');
assert.equal(analysis.normalizeContact({contactType:'GO'}),'GROUND');
assert.equal(analysis.normalizeContact({contactType:'LD'}),'LINE');
assert.equal(analysis.normalizeContact({contactType:'FO'}),'FLY');
assert.equal(analysis.normalizeContact({contactType:'PO'}),'POPUP');

const empty=analysis.analyzePlayer([],{name:'Test Hitter',side:'R'},{now:NOW});
assert.equal(empty.confidence,'no-data');
assert.equal(empty.issues.length,0);

const popupGame=makeGame({pas:[
 ...repeat(7,()=>({outcome:'H4O',contactType:'PO',fielder:2})),
 ...repeat(13,()=>({outcome:'H4O',contactType:'GO',fielder:5})),
 ...repeat(5,()=>({outcome:'HIT',contactType:'LD'}))
]});
const popup=analysis.analyzePlayer([popupGame],{name:'Test Hitter',side:'R'},{now:NOW});
assert.equal(popup.confidence,'standard');
assert.ok(popup.issues.some(item=>item.id==='popups'));
assert.ok(popup.issues.some(item=>item.id==='groundouts-third'));
assert.ok(popup.issues.some(item=>item.id==='groundballs'));

const slapperGame=makeGame({style:'SL',pas:repeat(25,()=>({outcome:'H4O',contactType:'GO',fielder:5}))});
const slapper=analysis.analyzePlayer([slapperGame],{name:'Test Hitter',side:'SL'},{now:NOW});
assert.ok(!slapper.issues.some(item=>item.id==='groundballs'));

const outsideGame=makeGame({pas:repeat(12,index=>({
 outcome:index<4?'K':'H4O',contactType:index<4?'':'GO',fielder:5,
 pitches:[{result:index<8?'K':'F',zone:'L1',pitchType:index<6?'RS':'CH'}]
}))});
const outside=analysis.analyzePlayer([outsideGame],{name:'Test Hitter',side:'R'},{now:NOW});
assert.equal(outside.confidence,'preliminary');
assert.ok(outside.issues.some(item=>item.id==='outside-pitches'));

const approachGame=makeGame({pas:repeat(25,index=>({
 outcome:index<13?'K':'H4O',contactType:index<13?'':'LO',weak:index>=13&&index<20,
 executionSuccesses:index%3===0?1:0,executionAttempts:1,
 pitches:[{result:index<6?'KL':index<13?'K':'H4O',zone:'T1',pitchType:'RS'}]
}))});
const approach=analysis.analyzePlayer([approachGame],{name:'Test Hitter',side:'R'},{now:NOW});
for(const id of ['strikeouts','called-strikeouts','swing-miss','weak-contact','high-rise','execution'])assert.ok(approach.issues.some(item=>item.id===id),`missing ${id}`);

const changeupGame=makeGame({pas:repeat(12,index=>({
 outcome:index<8?'K':'H4O',contactType:index<8?'':'GO',
 pitches:[{result:index<8?'K':'F',zone:'C1',pitchType:'CH'}]
}))});
const changeup=analysis.analyzePlayer([changeupGame],{name:'Test Hitter',side:'R'},{now:NOW});
assert.ok(changeup.issues.some(item=>item.id==='changeup'));

const foulGame=makeGame({pas:repeat(10,index=>({
 outcome:'H4O',contactType:'LO',
 pitches:index<8
  ?[{result:'F',zone:'C1',pitchType:'FB',strikesBefore:index%2},{result:'H4O',zone:'C1',pitchType:'FB',strikesBefore:1}]
  :[{result:'H4O',zone:'C1',pitchType:'FB',strikesBefore:1}]
}))});
const fouls=analysis.analyzePlayer([foulGame],{name:'Test Hitter',side:'R'},{now:NOW});
assert.ok(fouls.issues.some(item=>item.id==='foul-balls'));

const twoStrikeFoulGame=makeGame({pas:repeat(10,index=>({
 outcome:'H4O',contactType:'LO',
 pitches:index<8
  ?[{result:'F',zone:'C1',pitchType:'FB',strikesBefore:2},{result:'H4O',zone:'C1',pitchType:'FB',strikesBefore:2}]
  :[{result:'H4O',zone:'C1',pitchType:'FB',strikesBefore:1}]
}))});
const twoStrikeFouls=analysis.analyzePlayer([twoStrikeFoulGame],{name:'Test Hitter',side:'R'},{now:NOW});
assert.ok(!twoStrikeFouls.issues.some(item=>item.id==='foul-balls'),'two-strike spoil fouls should not trigger the under-ball rule');

const fallbackGame=makeGame({date:'2026-08-10T12:00:00.000Z',pas:repeat(10,()=>({outcome:'HIT',contactType:'LD'}))});
const fallback=analysis.analyzePlayer([fallbackGame],{name:'Test Hitter',side:'R'},{now:NOW});
assert.equal(fallback.window,'fallback-30-days');
assert.equal(fallback.confidence,'preliminary');

const tooOld=analysis.analyzePlayer([makeGame({date:'2026-06-01T12:00:00.000Z',pas:repeat(25,()=>({outcome:'K'}))})],{name:'Test Hitter',side:'R'},{now:NOW});
assert.equal(tooOld.confidence,'no-data');
assert.equal(tooOld.issues.length,0);

const teamGame=makeGame({style:'SL',pas:repeat(80,()=>({outcome:'H4O',contactType:'GO',fielder:5}))});
const team=analysis.analyzeTeam([teamGame],{now:NOW});
assert.equal(team.confidence,'standard');
assert.ok(!team.issues.some(item=>item.id==='groundballs'),'intentional slapper groundballs should not create a team groundball issue');

const source=JSON.stringify([popupGame]);
analysis.analyzeTeam([popupGame],{now:NOW,thresholds:{minimumPA:10,standardPA:20,battedBalls:6}});
assert.equal(JSON.stringify([popupGame]),source,'analysis must not mutate game history');

console.log('hitting-analysis tests passed');
