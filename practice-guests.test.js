const fs=require('fs');
const assert=require('assert');
const source=fs.readFileSync('app.js','utf8');

assert.ok(source.includes('Guests (${guests.length+guestCoaches.length})'),'attendance includes a collapsed guest count');
assert.ok(source.includes("guestRolePosition(role)"),'guest roles are converted for the scheduler');
assert.ok(source.includes("portalType:'guestPlayer'"),'guest player practice portals are created');
assert.ok(source.includes("portalType:'guestCoach'"),'guest coach practice portals are created');
assert.ok(source.includes("expired:true"),'guest links expire when active plans are cleared');
assert.ok(source.includes("filter(name=>permanentNames.has(name))"),'guests are excluded from practice history');
assert.ok(source.includes("portalData?.portalType?.startsWith('guest')"),'guest drill access is restricted to practice drills');
assert.ok(source.includes('data-share-practice-guest'),'activated guests receive share controls');

console.log('practice-guests tests passed');
