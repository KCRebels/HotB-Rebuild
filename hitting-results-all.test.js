const fs=require('node:fs');
const assert=require('node:assert/strict');

const app=fs.readFileSync('app.js','utf8');
const css=fs.readFileSync('styles.css','utf8');

assert.match(app,/data-hitting-ranking="\$\{statKey\}">ALL<\/button>/,'every Hitting Results tile receives an ALL button');
assert.match(app,/function hittingRankingModal\(metric\)[\s\S]*filteredPAs\(\)[\s\S]*db\.roster\.map/,'ALL uses the active filtered plate appearances for every rostered player');
assert.match(app,/kPct:\{label:'K%',key:'kPct',format:pct1,lowerIsBetter:true\}/,'K% is ordered with the lower value first');
assert.match(app,/class="performance-sample"><span>\$\{esc\(activeDateFilterLabel\(\)\)\}<\/span><b>\$\{s\.PA\} PA<\/b>/,'PA is shown directly beside the active season label');
assert.match(css,/\.perf-all/,'Hitting Results ALL buttons have a dedicated tap style');

console.log('hitting results ALL tests passed');
