const assert=require('node:assert/strict');
const fs=require('node:fs');

const app=fs.readFileSync('./app.js','utf8');
const styles=fs.readFileSync('./styles.css','utf8');

assert.match(app,/return `Drill Station \$\{match\[1\]\} — \$\{drill\.name\}`/,'numbered drill stations should flow into generated assignments');
assert.match(app,/drillAssignments=\[\.\.\.assigned\]/,'portal drill links should retain each player’s actual physical station instead of renumbering her subset');
assert.match(app,/NEXT — DRILL STATION/,'the rotate panel should identify the next physical drill station');
assert.match(app,/NEXT — MACHINE/);
assert.match(app,/NEXT — FRONT TOSS/);
assert.match(app,/NEXT — LIVE/);
assert.match(app,/values\.transition\?\(portalData\?\.activePractice\?\.schedule\|\|\[\]\)\.find/,'NEXT should be derived from the live transition state and upcoming block');
assert.match(app,/nextPanel\.hidden=!nextEntry/,'NEXT should disappear outside the rotate period');
assert.match(app,/data-portal-practice-drill=""/,'the rotating NEXT panel should support drill-detail navigation');
assert.match(styles,/\.portal-practice-next button\{[^}]*min-height:150px/,'NEXT should be visibly prominent');

console.log('practice station and next-assignment tests passed');
