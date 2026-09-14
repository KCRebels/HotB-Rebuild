const fs=require('node:fs');
const assert=require('node:assert/strict');
const app=fs.readFileSync('app.js','utf8');
const css=fs.readFileSync('styles.css','utf8');

assert.match(app,/class="performance-sample"><b>\$\{s\.PA\} PA<\/b>/,'Hitting Results shows the selected team or player plate-appearance count');
assert.match(app,/class="performance-sample"[\s\S]*activeDateFilterLabel\(\)/,'the sample size stays beside the active date range');
assert.match(css,/\.performance-head\{display:flex/,'the Hitting Results heading and sample size share one header row');

console.log('evaluation sample-size tests passed');
