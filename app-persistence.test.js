const assert=require('node:assert/strict');
const fs=require('node:fs');

const source=fs.readFileSync('./app.js','utf8');
const saveSource=source.match(/function save\(\)\{[\s\S]*?\n\}/)?.[0]||'';
const cloudScheduleSource=source.match(/function scheduleCloudBackup\(\)\{[^\n]+/)?.[0]||'';

assert.ok(saveSource.includes("localStorage.setItem(DBKEY,JSON.stringify(db))"),'every save must persist the current app state on the phone');
assert.ok(saveSource.includes('scheduleCloudBackup()'),'every local save must queue an automatic cloud backup');
assert.ok(cloudScheduleSource.includes('setTimeout(()=>backupToCloud(true),1800)'),'automatic cloud saves must be debounced by 1.8 seconds');
assert.match(source,/'Mattingly Hardy':'IN'/,"Matti's default hitting plan must be IN");

console.log('app-persistence tests passed');
