const fs=require('node:fs');
const assert=require('node:assert/strict');

const app=fs.readFileSync('app.js','utf8');
const css=fs.readFileSync('styles.css','utf8');

assert.match(app,/<div class="brand">Chart<\/div><button id="openLineup">Lineup<\/button>/,'the live-game header is renamed Chart and includes Lineup');
assert.match(app,/function lineupModal\(\)[\s\S]*g\.battingOrder[\s\S]*current-hitter[\s\S]*lineup-number/,'the lineup is generated from the active batting order and marks the current hitter');
assert.doesNotMatch(app,/data-sub-hitter[^\n]*lineup-row/,'the lineup display does not expose substitution controls');

assert.match(app,/function endInningNow\(g\)[\s\S]*g\.outs=0;g\.inning\+=1;g\.runners=\[\];resetLiveCount\(g\);queueInningObservation/,'End Inning Now clears outs, bases, and count before the observation prompt');
assert.match(app,/id="confirmEndInning"/,'forcing the inning requires confirmation');
assert.match(app,/id="undo">Undo/,'the existing game Undo control remains available');
assert.match(app,/id="openOutsControl"/,'the Outs display opens the new controls');

assert.match(app,/class="observation-saved-summary"[\s\S]*saved[\s\S]*this game[\s\S]*New entry will be #/,'new observations show total, current-game count, and next entry number');
assert.match(css,/\.lineup-row\.current-hitter/,'the current hitter has a prominent lineup style');

console.log('live game controls tests passed');
