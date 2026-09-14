const fs=require('node:fs');
const assert=require('node:assert/strict');
const app=fs.readFileSync('app.js','utf8');
const css=fs.readFileSync('styles.css','utf8');

assert.match(app,/class="performance-sample"><span>\$\{esc\(activeDateFilterLabel\(\)\)\}<\/span><b>\$\{s\.PA\} PA<\/b>/,'Hitting Results shows the selected team or player plate-appearance count beside the active date range');
assert.match(css,/\.performance-sample\{display:flex/,'the active date range and plate-appearance count share one row below Hitting Results');

console.log('evaluation sample-size tests passed');
