const assert=require('node:assert/strict');
const fs=require('node:fs');

const app=fs.readFileSync('app.js','utf8');
const index=fs.readFileSync('index.html','utf8');
const workflow=fs.readFileSync('recruiting-workflow.js','utf8');
const profile=fs.readFileSync('brooklyn-gering-recruiting-profile.html','utf8');
const styles=fs.readFileSync('styles.css','utf8');

assert.match(index,/src="recruiting-workflow\.js\?v=/);
assert.doesNotMatch(index,/recruiting-(?:hotfix|email-hybrid|motto|workflow-v[23])|new-game-header-fix/);
assert.match(app,/page-match-head page-head-centered"><button class="page-head-nav" data-go="home">Home<\/button><h1>New Game<\/h1><span class="page-head-spacer"/);
assert.match(workflow,/Coach's Name<input id="rwCoachName"/);
assert.match(workflow,/College<input id="rwCollegeName"/);
assert.doesNotMatch(workflow,/coach-list-menu|Choose a saved coach/);
assert.match(workflow,/Email Message — You Can Edit It Here<textarea id="rwEmailBody"/);
assert.match(workflow,/if\(!confirm\(`Send this recruiting email now/);
assert.ok(workflow.includes("cc?`Cc: ${cc}`:''"));
assert.match(workflow,/motto:clean\(entry\.motto\)/);
assert.match(profile,/const value=String\(data\.motto\|\|''\)\.trim\(\);mottoText\.textContent=value;motto\.hidden=!value/);
assert.match(styles,/\.rw-recruiting\{[^}]*border-top:5px solid #cf112d;[^}]*border-bottom:5px solid #cf112d/);
console.log('recruiting consolidation tests passed');
