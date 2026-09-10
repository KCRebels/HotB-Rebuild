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
assert.ok(source.includes('function persistPracticeDraft()'),'attendance setup must have persistent draft storage');
assert.ok(source.includes("input.addEventListener('change',persistPracticeDraft)"),'attendance edits must save automatically');
assert.ok(source.includes("id=\"endPracticeDraft\""),'Build Practice must provide an End button');
assert.ok(source.includes('every guest link will expire'),'ending a draft must confirm that temporary links expire');
assert.ok(source.includes("db.activePracticeSession?.stage==='setup'"),'the practice hub must identify a saved setup draft');
assert.ok(source.includes("if(route==='practice'&&practicePlan)persistPracticeSession();"),'leaving Hitting Practice must save the complete built practice');
assert.ok(source.includes("window.addEventListener('pagehide',()=>{if(practicePlan)persistPracticeSession()})"),'closing or backgrounding the PWA must save the built practice');
assert.ok(!source.includes('finishPracticeClock(true)'),'elapsed scheduled time must not automatically clear the active practice');
assert.ok(source.includes('if(activeTiming&&practiceClock.running&&!practiceClockTimer)'),'a completed clock must remain saved without restarting a background update loop');
assert.ok(!source.includes('id="practiceCurrentTime"'),'the live practice screen must not display clock time');
assert.ok(!source.includes('id="portalCurrentTime"'),'player and guest portals must not display clock time');

console.log('practice-navigation tests passed');
