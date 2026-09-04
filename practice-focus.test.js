const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const app=fs.readFileSync('./app.js','utf8');
const source=fs.readFileSync('./drill-library.js','utf8');
const context={window:{}};
vm.runInNewContext(source,context);
const drills=context.window.HotBDrillLibrary;

assert.equal(drills.length,34);
assert.equal(drills.find(drill=>drill.name==='Small Ball Machine').hittingMethod,'Other');
assert.match(app,/practiceMachineFocus/);
assert.match(app,/practiceFrontTossFocus/);
assert.match(app,/Machine — \$\{machineFocus\}/);
assert.match(app,/\$\{activity\} — \$\{frontTossFocus\}/);
assert.match(app,/!\['Machine','Front Toss'\]\.includes\(drill\.hittingMethod\)/);
assert.match(app,/practiceAllSelectedDrills\(\)\.map\(drill=>drill\.name\)/);

console.log('practice-focus tests passed');
