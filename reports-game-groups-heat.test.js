const assert=require('node:assert/strict');
const fs=require('node:fs');
const source=fs.readFileSync('./app.js','utf8');
const styles=fs.readFileSync('./styles.css','utf8');

assert.match(source,/gameGroups:\[\]/,'new databases must store game groups');
assert.match(source,/if\(!Array\.isArray\(db\.gameGroups\)\)db\.gameGroups=\[\]/,'existing databases must gain game groups without changing games');
assert.match(source,/reportMode==='selection'/,'reports must support multiple selected games');
assert.match(source,/reportMode==='group'/,'reports must support saved game groups');
assert.match(source,/Saved games will not be deleted/,'group deletion must explicitly preserve saved games');
for(const result of ['ALL','BALL','FOUL','KS','KL','HIT','H4O','GB','LD','FB'])assert.ok(source.includes(`'${result}'`),`heat chart must include ${result}`);
assert.match(source,/pitch\.result==='K'/,'KS must use swinging strike results');
assert.match(source,/\['KL','HIT','H4O'\]\.includes\(result\).*pitch\.result===result/,'KL must remain separate from KS');
assert.match(source,/pitch\.contactType===result/,'batted-ball heat filters must use stored contact type');
assert.match(source,/if\(z\[zone\]!=null\)\{z\[zone\]\+\+;located\+\+\}/,'only pitches with stored locations may enter the denominator');
assert.match(source,/reportHeatDisplay==='COUNT'/,'heat cells must toggle counts and percentages');
assert.match(source,/reportGames\(\)\.flatMap\(game=>game\.pitches/,'heat data must use the exact report game scope');
assert.match(styles,/\.report-heat/,'heat chart must have report-specific presentation');
console.log('reports game groups and heat chart tests passed');
