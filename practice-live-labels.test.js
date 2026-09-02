const assert=require('node:assert/strict');
const fs=require('node:fs');

const source=fs.readFileSync('./app.js','utf8');
assert.match(source,/Hit Live — 12 pitches minimum/);
assert.match(source,/Pitch Live \([^`]+\) — 12 pitches minimum per hitter/);
assert.match(source,/Catch Live — [^`]+ — 12 pitches minimum per hitter/);

console.log('practice-live-label tests passed');
