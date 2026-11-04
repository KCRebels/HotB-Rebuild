const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const context=vm.createContext({window:{}});
for(const name of ['drill-library.js','observation-publish-v2.js'])vm.runInContext(fs.readFileSync(name,'utf8'),context);
const api=context.window.HotBObservationPublish;
const library=context.window.HotBDrillLibrary;
const categories=require('./coach-observations-core-v1.js').CATEGORIES;
for(const tag of categories.flatMap(category=>category.options)){
 api.begin({mode:'focus',playerName:'Claire Jack',tags:[tag]});
 const names=Array.from(api.recommendDrills());
 assert.ok(names.length>0&&names.length<=3,tag+' must suggest drills');
 assert.equal(new Set(names).size,names.length);
 assert.ok(names.every(name=>library.some(drill=>drill.name===name)));
}
for(const [tag,expected] of [['Guessing','Plate Recognition'],['Casting','Knob to Ball'],['Tentative','Hunt Your Zone'],['Lack of confidence','Hunt Your Zone']])assert.equal(api.recommendDrills(tag)[0],expected);
assert.equal(api.recommendDrills('').length,0);
const app=fs.readFileSync('app-coach-rebels-portals-v10.js','utf8');
vm.runInContext(app.slice(app.indexOf('function recommendPortalDrills('),app.indexOf('function focusDrillKey(')),context);
const tags='Guessing Casting Tentative';
assert.deepEqual(Array.from(context.recommendPortalDrills(tags),drill=>drill.name),Array.from(api.recommendDrills(tags,4)));
console.log('All 35 observation options produce library drills; coach and note suggestions agree.');
