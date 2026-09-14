const assert=require('node:assert/strict');
const fs=require('node:fs');
const workflow=fs.readFileSync('./recruiting-workflow.js','utf8');
const styles=fs.readFileSync('./styles.css','utf8');

assert.match(workflow,/button\.addEventListener\('pointerdown',event=>\{event\.preventDefault\(\);choose\(coach\)\}\)/);
assert.match(workflow,/\.slice\(0,8\)/,'autocomplete limits matches instead of rendering a giant list');
assert.match(styles,/\.rw-search-results\{[^}]*overflow:auto;[^}]*touch-action:pan-y;[^}]*-webkit-overflow-scrolling:touch/);
console.log('coach-search-touch tests passed');
