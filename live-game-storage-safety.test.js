const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');

const patch=fs.readFileSync('practice-bypass.js','utf8');
const updater=fs.readFileSync('pwa-update.js','utf8');

class Storage{
 constructor(){this.values=new Map()}
 setItem(key,value){this.values.set(String(key),String(value))}
 getItem(key){return this.values.get(String(key))??null}
}

const context={Storage,console};
vm.createContext(context);
vm.runInContext(patch,context);

const storage=new Storage();
const snapshots=Array.from({length:25},(_,index)=>({index,pitches:Array.from({length:index+1},(_,pitch)=>({pitch}))}));
const db={route:'live',currentGame:{id:'stress-game',pitches:[{id:'saved-pitch'}],plateAppearances:[],undoStack:snapshots}};
storage.setItem('hotbRebuildDbV1',JSON.stringify(db));
const stored=JSON.parse(storage.getItem('hotbRebuildDbV1'));

assert.equal(stored.currentGame.pitches.length,1,'the live pitch is preserved');
assert.equal(stored.currentGame.undoStack.length,10,'production live-game Undo history is capped at 10 snapshots');
assert.deepEqual(stored.currentGame.undoStack.map(item=>item.index),Array.from({length:10},(_,i)=>i+15),'the newest 10 Undo snapshots are retained');
assert.match(patch,/const DB_KEY = 'hotbRebuildDbV1'/,'the safety patch watches the production HotB database key');
assert.match(updater,/practice-bypass\.js\?v=20261010-undo10keyfix1/,'the PWA loads the corrected storage patch with a new cache key');

console.log('live game storage safety tests passed');
