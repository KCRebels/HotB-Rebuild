const fs=require('node:fs');
const assert=require('node:assert/strict');
const app=fs.readFileSync('app.js','utf8');
const css=fs.readFileSync('styles.css','utf8');
const index=fs.readFileSync('index.html','utf8');

assert.match(app,/id="openRecruitingEmail"[^>]*>EM<\/button>/,'Eval email button is labeled EM');
assert.doesNotMatch(app,/id="openRecruitingText"/,'Eval header no longer includes the TX button');
const workflow=fs.readFileSync('recruiting-workflow-v3.js','utf8');
assert.match(workflow,/const PUBLIC_PROFILE_URL='https:\/\/kcrebels\.github\.io\/HotB-Rebuild\/'\+PUBLIC_PROFILE_PATH/);
assert.match(workflow,/class="rw-profile"[^>]*>Recruiting Profile<\/button>/);
assert.match(workflow,/class="rw-email"[^>]*>Email<\/button>/);
assert.match(workflow,/class="rw-text"[^>]*>Text<\/button>/);
assert.ok(workflow.includes('HotBSms?.recruitingProfileMessage'),'recruiting Text uses the shared standalone-link message builder');
assert.match(index,/\.rw-buttons\{grid-template-columns:repeat\(3,minmax\(0,1fr\)\)!important\}/,'Recruiting Workflow uses one row of three buttons');
assert.match(index,/\.rw-text\{background:#cf112d;color:#fff\}/,'Text button matches the red Email button');
assert.match(css,/\.eval-contact-actions>\.eval-contact\{width:56px;height:56px/,'desktop Eval contact buttons are square');
assert.match(css,/\.eval-contact-actions>\.eval-contact\{width:46px;height:46px/,'phone Eval contact buttons are square and tap-sized');
assert.match(index,/sms-links\.js\?v=/,'shared SMS helper loads before app.js');

console.log('eval recruiting text tests passed');
