const assert=require('node:assert/strict');
const {targetsForScope}=require('./coach-observations');

const game={inning:3,outs:1,currentIdx:3,battingOrder:['A','B','C','D','E'],observations:[],plateAppearances:[
 {id:'1',hitter:'A',inning:2,pa:1},{id:'2',hitter:'B',inning:2,pa:2},{id:'3',hitter:'C',inning:2,pa:3},
 {id:'4',hitter:'D',inning:3,pa:4},{id:'5',hitter:'E',inning:3,pa:5},{id:'6',hitter:'A',inning:3,pa:6}
]};

assert.deepEqual(targetsForScope(game,'current').map(row=>row.playerName),['D','A','E']);
assert.deepEqual(targetsForScope(game,'previous').map(row=>row.playerName),['C','B','A']);
assert.deepEqual(targetsForScope(game,'lineup').map(row=>row.playerName),['D','A','E','C','B']);

const wrapped={...game,inning:4,outs:0,currentIdx:1};
assert.equal(targetsForScope(wrapped,'lineup')[0].playerName,'A');
console.log('coach-observations tests passed');
