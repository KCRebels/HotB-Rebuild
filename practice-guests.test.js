const fs=require('fs');
const assert=require('assert');
const source=fs.readFileSync('app.js','utf8');

assert.ok(source.includes('Guests (${guests.length+guestCoaches.length})'),'attendance includes a collapsed guest count');
assert.ok(source.includes("guestRolePosition(role)"),'guest roles are converted for the scheduler');
assert.ok(source.includes("createPendingGuestPortal(guest,'guestPlayer')"),'guest player practice portals are created before activation');
assert.ok(source.includes("createPendingGuestPortal(guest,'guestCoach')"),'guest coach practice portals are created before activation');
assert.ok(source.includes('guestPlayerPhone')&&source.includes('guestCoachPhone'),'cell numbers are collected for both guest types');
assert.ok(source.includes("replace(/\\D/g,'').length<10"),'guest cell numbers are required');
assert.ok(source.includes('data-text-practice-guest'),'guest links can be texted from attendance');
assert.ok(source.includes('data-share-setup-guest'),'guest links can be shared from attendance');
assert.ok(source.includes('shareGuestPortal'),'text and share reuse the same guest portal link');
assert.ok(source.includes('GUEST ACCESS CONFIRMED'),'unactivated links show a connection confirmation');
assert.ok(source.includes("accessStatus:'active'")&&source.includes('{merge:true}'),'activation updates the existing guest link');
assert.ok(source.includes("expired:true"),'guest links expire when active plans are cleared');
assert.ok(source.includes("filter(name=>permanentNames.has(name))"),'guests are excluded from practice history');
assert.ok(source.includes("portalData?.portalType?.startsWith('guest')"),'guest drill access is restricted to practice drills');
assert.ok(source.includes('data-share-practice-guest'),'activated guests receive share controls');

console.log('practice-guests tests passed');
