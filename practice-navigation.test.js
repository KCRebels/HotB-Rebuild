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
assert.ok(source.includes("if(!confirm('Discard this practice plan before it starts? It will not be added to Practice History.'))return;"),'DONE must confirm and discard an unstarted practice without archiving it');
assert.ok(source.includes("if(!confirm('End this practice now? It will be saved to Practice History and removed from the player and coach portals.'))return;"),'DONE must confirm before ending an active practice');
assert.ok(source.includes("$('#endPracticeClock')?.addEventListener('click',endPracticeFromScreen)"),'DONE must use the before-start and active-practice ending flow');
assert.ok(!source.includes("id=\"endPracticeClock\" ${practiceClock.running?'':'disabled'}"),'DONE must be available before the clock starts');

console.log('practice-navigation tests passed');
