const assert=require('node:assert/strict');
const equipment=require('./practice-equipment.js');

assert.deepEqual(equipment.equipmentItems({equipment:'Tee & Net',hittingMethod:'Tee'}),['Tee','Net','Balls']);
assert.deepEqual(equipment.equipmentItems({equipment:'L-screen, balls, plate',hittingMethod:'Front Toss'},{protectiveScreen:true}),['Protective Screen','balls','plate'],'front toss must include one protective screen without duplicating balls');
assert.deepEqual(equipment.equipmentItems({equipment:'Pitching machine, balls, tunnel',hittingMethod:'Machine'},{protectiveScreen:true}),['Pitching machine','balls','tunnel','Protective Screen']);
assert.deepEqual(equipment.equipmentItems({equipment:'RMT Bats',hittingMethod:'Dry / No Ball'}),['RMT Bats'],'dry drills must not receive regular balls');
assert.equal(equipment.station('Drill Station 1',{name:'Skater',equipment:'Tee',hittingMethod:'Tee',spaceSetup:'Hitting Nets'}).spaceSetup,'Hitting Nets');

console.log('practice-equipment tests passed');
