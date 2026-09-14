const fs=require('node:fs');
const assert=require('node:assert/strict');

const app=fs.readFileSync('app.js','utf8');
const css=fs.readFileSync('styles.css','utf8');

assert.match(app,/<div class="brand">Chart<\/div><button id="openLineup">Lineup<\/button>/,'the live-game header is renamed Chart and includes Lineup');
assert.match(app,/function lineupModal\(\)[\s\S]*g\.battingOrder[\s\S]*current-hitter[\s\S]*lineup-number/,'the lineup is generated from the active batting order and marks the current hitter');
assert.doesNotMatch(app,/data-sub-hitter[^\n]*lineup-row/,'the lineup display does not expose substitution controls');

assert.match(app,/function addManualOut\(g\)[\s\S]*recordOut\(g\)[\s\S]*resetLiveCount\(g\);queueInningObservation/,'adding the third out ends the inning, clears the bases through recordOut, resets the count, and opens the observation prompt');
assert.match(app,/function subtractManualOut\(g\)[\s\S]*Math\.max\(0,g\.outs-1\)/,'subtracting an out cannot go below zero');
assert.match(app,/id="undo">Undo/,'the existing game Undo control remains available');
assert.match(app,/class="control-card outs-stepper"[\s\S]*id="decreaseOuts"[\s\S]*class="outs-stepper-circle outs-count"[\s\S]*id="increaseOuts"/,'the live controls show minus, current outs, and plus in that order');
assert.doesNotMatch(app,/openOutsControl|outsControlModal|confirmEndInning/,'the old outs modal is removed');

assert.match(app,/class="observation-saved-summary"[\s\S]*saved[\s\S]*this game[\s\S]*New entry will be #/,'new observations show total, current-game count, and next entry number');
assert.match(css,/\.lineup-row\.current-hitter/,'the current hitter has a prominent lineup style');

console.log('live game controls tests passed');
