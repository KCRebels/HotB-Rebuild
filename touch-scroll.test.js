const assert=require('node:assert/strict');
const fs=require('node:fs');

const app=fs.readFileSync('./app.js','utf8');
const styles=fs.readFileSync('./styles.css','utf8');

assert.doesNotMatch(app,/\[data-opponent-choice\][^\n]+onpointerdown/);
assert.doesNotMatch(app,/\[data-pitcher-choice\][^\n]+onpointerdown/);
assert.doesNotMatch(app,/\[data-delete-opponent\][^\n]+onpointerdown/);
assert.doesNotMatch(app,/\[data-delete-pitcher-name\][^\n]+onpointerdown/);
assert.match(app,/\[data-opponent-choice\][^\n]+onclick/);
assert.match(app,/\[data-pitcher-choice\][^\n]+onclick/);
assert.match(styles,/\.matchup-picker-menu,\.coach-list-menu,\.coach-search-results,\.history-panel,\.import-player-list,\.hit-modal\{touch-action:pan-y/);
assert.match(styles,/\.measurement-attempt-scroll,\.ab-scroll,\.practice-filter-preview\{touch-action:pan-x/);

console.log('touch-scroll tests passed');
