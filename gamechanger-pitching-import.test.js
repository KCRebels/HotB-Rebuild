const assert=require('node:assert/strict');
const importer=require('./gamechanger-pitching-import.js');

const roster=[{name:'Aniesa Rohleder'},{name:'Brooklyn Gering'},{name:'Megan Ryan'}];
const result=importer.parseSheets([{name:'Pitching',rows:[
 ['Player','GP','IP','ERA','WHIP','K','BB','BAA','P-S'],
 ['Aniesa Rohleder','2','4.0','3.50','1.25','6','2','.250','80-52'],
 ['Gering, Brooklyn','2','3.1','0','0.60','4','0','.091','51-39'],
 ['Team Totals','','','','','','','','']
]}],roster);

assert.equal(result.ready.length,2);
assert.deepEqual(result.ready[0].values,{pitcherIP:'4.0',pitcherERA:'3.50',pitcherWHIP:'1.25',pitcherKBB:'3',pitcherOBA:'.250',pitcherStrikePct:'65%'});
assert.equal(result.ready[1].playerName,'Brooklyn Gering');
assert.equal(result.ready[1].values.pitcherKBB,'—');
assert.equal(result.ready[1].values.pitcherStrikePct,'76.47%');
assert.ok(result.problems.some(problem=>problem.playerName==='Megan Ryan'&&problem.message.includes('not found')));

const direct=importer.parseSheets([{name:'Stats',rows:[
 ['Name','IP','ERA','WHIP','K/BB','OBA','Strike %'],
 ['Megan Ryan','2','1.75','.875','2.5','.143','62.75%']
]}],[roster[2]]);
assert.equal(direct.ready[0].values.pitcherStrikePct,'62.75%');
assert.equal(direct.ready[0].values.pitcherKBB,'2.5');

const unsafe=importer.parseSheets([{name:'Pitching',rows:[
 ['Player','IP','ERA','WHIP','K','BB'],['Aniesa Rohleder','2','1','1','3','1']
]}],[roster[0]]);
assert.equal(unsafe.ready.length,0);
assert.ok(unsafe.problems.some(problem=>problem.message.includes('missing OBA/BAA')));

assert.throws(()=>importer.parseSheets([{name:'Hitting',rows:[['Player','AVG'],['Aniesa Rohleder','.300']]}],roster),/could not find a GameChanger pitching table/i);
console.log('gamechanger pitching import tests passed');
