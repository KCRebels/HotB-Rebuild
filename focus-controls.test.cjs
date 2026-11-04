const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const read = name => fs.readFileSync(name, 'utf8');

// The observation-history capture handler must leave drill management alone.
const cleanup = read('focus-page-cleanup-v1.js');
const predicate = cleanup.match(/function isManageButton\(button\)\{[^\n]+\}/)[0];
const capture = vm.createContext({});
vm.runInContext(predicate, capture);
for (const id of ['manageFocusDrills', 'unrelatedManage']) {
  assert.equal(capture.isManageButton({id, textContent:'Manage', closest:()=>({})}), false);
}
assert.equal(capture.isManageButton({id:'manageFocusObservations', closest:()=>({})}), true);
assert.equal(capture.isManageButton(null), false);

// Publishing remains available on a player screen with no session dirty flag.
let hidden = true;
const helper = read('assistant-coach-focus-v2.js');
const clean = helper.slice(helper.indexOf('function cleanFocusScreen()'), helper.indexOf('function rememberPublishedObservation'));
const coach = vm.createContext({
  focusPlayer:()=> 'Aniesa Rohleder', seedPublishedHistory:()=>{},
  document:{querySelectorAll:()=>[], getElementById:()=>({style:{removeProperty(name){assert.equal(name,'display');hidden=false;}}})},
});
vm.runInContext(clean+';cleanFocusScreen();', coach);
assert.equal(hidden, false);

// A drill-only revision must survive the player-facing preview without a new observation.
const app = read('app-coach-rebels-portals-v10.js');
const payload = app.slice(app.indexOf('function playerFocusPortalPayload('), app.indexOf('let playerFocusReviewRecoveryStarted'));
const preview = vm.createContext({
  practiceFocusPlayer:'Aniesa Rohleder', practiceFocusRange:'two-weeks',
  db:{roster:[{name:'Aniesa Rohleder'}],coachObservations:[]},
  playerFocusGames:()=>[], window:{}, modal:null,
  playerHasNewFocusObservation:()=>false,
  focusSuggestedDrills:()=>[{name:'Front Toss'},{name:'Plate Recognition'}],
});
vm.runInContext(payload, preview);
assert.deepEqual(Array.from(preview.playerFocusPortalPayload().drills), ['Front Toss','Plate Recognition']);
console.log('Player Focus control and preview checks passed.');
