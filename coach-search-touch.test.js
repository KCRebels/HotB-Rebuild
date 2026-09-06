const assert=require('node:assert/strict');
const fs=require('node:fs');

const app=fs.readFileSync('./app.js','utf8');
const styles=fs.readFileSync('./styles.css','utf8');

assert.doesNotMatch(app,/coach-search-result[^\n]+addEventListener\('pointerdown'/);
assert.match(app,/button\.addEventListener\('click',\(\)=>chooseCoach\(coach\)\)/);
assert.match(styles,/\.coach-search-results\{[^}]*overflow-y:auto;[^}]*touch-action:pan-y;[^}]*-webkit-overflow-scrolling:touch/);

console.log('coach-search-touch tests passed');
