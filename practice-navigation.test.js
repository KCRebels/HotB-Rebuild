const assert=require('node:assert/strict');
const fs=require('node:fs');

const source=fs.readFileSync('./app.js','utf8');
const goSource=source.match(/function go\(r\)\{[\s\S]*?\n\}/)?.[0]||'';

assert.ok(goSource,'go navigation function must exist');
assert.ok(!goSource.includes('stopPracticeClock'),'Home navigation must not stop an active practice clock');
assert.ok(!goSource.includes('practicePlan=null'),'Home navigation must not discard the active practice plan');
assert.ok(!goSource.includes('activePracticeSession=null'),'Home navigation must not clear practice recovery');
assert.match(source,/Resume Hitting Practice/,'Home must provide a clear way back to the active practice');
assert.ok(source.includes('if(pitch&&warmup&&!pitch.checked)warmup.checked=false;'),'turning off live pitching must also turn off the pitch warm-up requirement');

console.log('practice-navigation tests passed');
