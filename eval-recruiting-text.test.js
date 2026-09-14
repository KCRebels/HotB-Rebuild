const fs=require('node:fs');
const assert=require('node:assert/strict');
const app=fs.readFileSync('app.js','utf8');
const css=fs.readFileSync('styles.css','utf8');
const index=fs.readFileSync('index.html','utf8');
const workflow=fs.readFileSync('recruiting-workflow.js','utf8');

assert.doesNotMatch(app,/id="openRecruitingEmail"/,'legacy Eval recruiting handler is removed');
assert.match(workflow,/class="rw-profile"[^>]*>Recruiting Profile<\/button>/);
assert.match(workflow,/class="rw-email"[^>]*>Email Coach<\/button>/);
assert.match(workflow,/class="rw-text"[^>]*>Text Profile<\/button>/);
assert.ok(workflow.includes('HotBSms?.recruitingProfileMessage'),'recruiting Text uses the shared standalone-link message builder');
assert.match(css,/\.rw-buttons\{display:grid;grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
assert.match(css,/\.rw-email,\.rw-text\{background:#cf112d;color:#fff\}/);
assert.match(index,/sms-links\.js\?v=/,'shared SMS helper loads before app.js');
console.log('eval recruiting text tests passed');
