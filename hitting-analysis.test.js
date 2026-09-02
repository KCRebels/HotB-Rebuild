const assert=require('node:assert/strict');
const analysis=require('./hitting-analysis.js');

const NOW='2026-09-01T12:00:00.000Z';
function makeGame({date='2026-08-28T12:00:00.000Z',hitter='Test Hitter',style='R',pas=[]}={}){
 const game={id:`g-${date}-${Math.random()}`,date,plateAppearances:[],pitches:[]};
 pas.forEach((spec,index)=>{
  const pa=index+1,contactType=spec.contactType||'',outcome=spec.outcome||'H4O';
  game.plateAppearances.push({id:`pa-${pa}`,hitter,pa,outcome,contactType,fielder:spec.fielder||null,weak:!!spec.weak,hhb:!!spec.hhb,bunt:!!spec.bunt,slap:!!spec.slap,sac:!!spec.sac,executionSuccesses:spec.executionSuccesses||0,executionAttempts:spec.executionAttempts||0});
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
assert.equal(popup.issues.find(item=>item.id==='popups').label,'Too Many Pop Flies');
assert.ok(popup.issues.some(item=>item.id==='groundouts-third'));
assert.ok(popup.issues.some(item=>item.id==='groundballs'));

const twoStrikePopupGame=makeGame({pas:repeat(10,index=>({
 outcome:'H4O',contactType:index<4?'PO':'LD',fielder:index<4?2:6,
 pitches:[{result:'H4O',zone:'C1',pitchType:'FB',strikesBefore:2}]
}))});
const twoStrikePopups=analysis.analyzePlayer([twoStrikePopupGame],{name:'Test Hitter',side:'R'},{now:NOW});
assert.ok(twoStrikePopups.issues.some(item=>item.id==='popups'),'pop flies with two strikes must count');

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

const chaseGame=makeGame({pas:repeat(10,index=>({
 outcome:'H4O',contactType:'LO',
 pitches:[{result:index<4?'K':'B',zone:'T1',pitchType:'FB',strikesBefore:0},{result:'H4O',zone:'C1',pitchType:'FB',strikesBefore:1}]
}))});
const chase=analysis.analyzePlayer([chaseGame],{name:'Test Hitter',side:'R'},{now:NOW});
assert.ok(chase.issues.some(item=>item.id==='chase-rate'));

const twoStrikeGame=makeGame({pas:repeat(10,index=>({
 outcome:index<4?'K':'H4O',contactType:index<4?'':'LO',
 pitches:[{result:index<4?'K':'H4O',zone:'C1',pitchType:'FB',strikesBefore:2}]
}))});
const twoStrike=analysis.analyzePlayer([twoStrikeGame],{name:'Test Hitter',side:'R'},{now:NOW});
assert.ok(twoStrike.issues.some(item=>item.id==='two-strike-contact'));

const highStrikeMissGame=makeGame({pas:repeat(10,index=>({
 outcome:index<4?'K':'H4O',contactType:index<4?'':'LD',
 pitches:[{result:index<4?'K':'H4O',zone:index%2?'C1':'C2',pitchType:'FB',strikesBefore:index<2?2:1}]
}))});
const highStrikeMisses=analysis.analyzePlayer([highStrikeMissGame],{name:'Test Hitter',side:'R'},{now:NOW});
assert.ok(highStrikeMisses.issues.some(item=>item.id==='high-strike-misses'));

const highBallMissGame=makeGame({pas:repeat(10,index=>({
 outcome:index<4?'K':'H4O',contactType:index<4?'':'LD',
 pitches:[{result:index<4?'K':'H4O',zone:index%2?'T1':'T2',pitchType:'FB',strikesBefore:2}]
}))});
const highBallMisses=analysis.analyzePlayer([highBallMissGame],{name:'Test Hitter',side:'R'},{now:NOW});
assert.ok(!highBallMisses.issues.some(item=>item.id==='high-strike-misses'),'high balls outside the strike zone must not trigger the high-strike rule');

const rolloverGame=makeGame({pas:[
 ...repeat(4,()=>({outcome:'HIT',contactType:'LD',fielder:8})),
 {outcome:'H4O',contactType:'GO',fielder:5,weak:true},
 {outcome:'HIT',contactType:'LD',fielder:7},
 {outcome:'H4O',contactType:'GO',fielder:6,weak:true},
 {outcome:'H4O',contactType:'GO',fielder:4,weak:true},
 {outcome:'H4O',contactType:'GO',fielder:5,weak:true},
 {outcome:'HIT',contactType:'LD',fielder:9}
]});
const rollover=analysis.analyzePlayer([rolloverGame],{name:'Test Hitter',side:'R'},{now:NOW});
const rolloverIssue=rollover.issues.find(item=>item.id==='likely-rollover');
assert.equal(rolloverIssue?.label,'Likely Cause: Rolling Over');
assert.match(rolloverIssue?.diagnosis||'',/Video or a coach’s observation should confirm/);

const rolloverExcludedGame=makeGame({pas:[
 ...repeat(4,()=>({outcome:'HIT',contactType:'LD',fielder:8})),
 {outcome:'H4O',contactType:'GO',fielder:5,weak:true,bunt:true},
 {outcome:'H4O',contactType:'GO',fielder:6,weak:true,slap:true},
 {outcome:'SAC',contactType:'GO',fielder:5,weak:true,sac:true},
 {outcome:'H4O',contactType:'GO',fielder:6,weak:true,hhb:true},
 {outcome:'H4O',contactType:'GO',fielder:5,weak:true},
 {outcome:'H4O',contactType:'GO',fielder:6,weak:true}
]});
const rolloverExcluded=analysis.analyzePlayer([rolloverExcludedGame],{name:'Test Hitter',side:'R'},{now:NOW});
assert.ok(!rolloverExcluded.issues.some(item=>item.id==='likely-rollover'),'excluded and isolated grounders must not trigger rollover');
const leftHandedRollover=analysis.analyzePlayer([rolloverGame],{name:'Test Hitter',side:'L'},{now:NOW});
assert.ok(!leftHandedRollover.issues.some(item=>item.id==='likely-rollover'),'right-handed rollover rule must not trigger for a left-handed hitter');

const outsidePullGame=makeGame({pas:repeat(10,index=>({
 outcome:index<5?'H4O':'HIT',contactType:index<5?'GO':'LD',fielder:index<5?5:9,
 pitches:[{result:index<5?'H4O':'HIT',zone:'L1',pitchType:'FB',strikesBefore:1}]
}))});
const outsidePull=analysis.analyzePlayer([outsidePullGame],{name:'Test Hitter',side:'R'},{now:NOW});
assert.ok(outsidePull.issues.some(item=>item.id==='outside-pull-grounders'));

const outsideStayThroughGame=makeGame({pas:repeat(10,index=>({
 outcome:index<5?'H4O':'HIT',contactType:index<5?'GO':'LD',fielder:index<5?4:9,
 pitches:[{result:index<5?'H4O':'HIT',zone:'L1',pitchType:'FB',strikesBefore:1}]
}))});
const outsideStayThrough=analysis.analyzePlayer([outsideStayThroughGame],{name:'Test Hitter',side:'R'},{now:NOW});
assert.ok(!outsideStayThrough.issues.some(item=>item.id==='outside-pull-grounders'),'outside-pitch grounders to the opposite side should not trigger a pull-off warning');

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
