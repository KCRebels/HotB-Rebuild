const assert=require('node:assert/strict');
const {statsForPAs,isQualityAtBat}=require('./evaluation-stats.js');

const qualityCriteria=[
 {outcome:'HIT'},
 {outcome:'BB'},
 {outcome:'HBP'},
 {outcome:'SAC'},
 {outcome:'H4O',sac:true},
 {outcome:'H4O',rbiCount:1},
 {outcome:'H4O',rba:true},
 {outcome:'H4O',hhb:true},
 {outcome:'K',pitchCount:8}
];
qualityCriteria.forEach(pa=>assert.equal(isQualityAtBat(pa),true));
assert.equal(isQualityAtBat({outcome:'K',pitchCount:7}),false);

const stats=statsForPAs([
 {outcome:'HIT',hitType:'1B',contactType:'LD',hhb:true,rbiCount:1,rba:true,pitchCount:9},
 {outcome:'H4O',contactType:'GB',hhb:false},
 {outcome:'BB'},
 {outcome:'K',pitchCount:8},
 {outcome:'K',pitchCount:7},
 {outcome:'HBP'},
 {outcome:'BB',hhb:true}
]);
assert.equal(stats.battedBalls,2,'only tracked balls put in play form the HHB denominator');
assert.equal(stats.HHB,2,'the existing raw HHB total remains available');
assert.equal(stats.hhbPct,.5,'HHB markings outside tracked balls in play are excluded from the rate');
assert.equal(stats.QAB,5,'a PA meeting multiple criteria must count only once');
assert.equal(stats.qabPct,5/7);

assert.equal(statsForPAs([{outcome:'BB'}]).hhbPct,0,'HHB% is zero without tracked balls in play');
assert.equal(statsForPAs([]).qabPct,0,'QAB% is zero without plate appearances');

console.log('evaluation-stats tests passed');
