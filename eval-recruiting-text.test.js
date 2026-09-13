const fs=require('node:fs');
const assert=require('node:assert/strict');
const app=fs.readFileSync('app.js','utf8');
const css=fs.readFileSync('styles.css','utf8');
const index=fs.readFileSync('index.html','utf8');

assert.match(app,/id="openRecruitingEmail"[^>]*>EM<\/button>/,'Eval email button is labeled EM');
assert.match(app,/id="openRecruitingText"[^>]*>TX<\/button>/,'Eval includes the TX button');
assert.match(app,/const BROOKLYN_RECRUITING_PROFILE_URL='https:\/\/kcrebels\.github\.io\/HotB-Rebuild\/brooklyn-gering-recruiting-profile\.html'/);
assert.ok(app.includes('HotBSms?.recruitingProfileMessage({name:player.name,grad:player.grad,positions,url})'),'recruiting text uses the shared standalone-link message builder');
assert.match(css,/\.eval-contact-actions>\.eval-contact\{width:56px;height:56px/,'desktop Eval contact buttons are square');
assert.match(css,/\.eval-contact-actions>\.eval-contact\{width:46px;height:46px/,'phone Eval contact buttons are square and tap-sized');
assert.match(index,/sms-links\.js\?v=/,'shared SMS helper loads before app.js');

console.log('eval recruiting text tests passed');
