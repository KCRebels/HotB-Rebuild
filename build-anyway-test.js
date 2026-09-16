(()=>{
'use strict';
const api=window.HotBPracticeScheduler;if(!api?.buildSchedule)return;
const original=api.buildSchedule,originalValidate=api.validate?.bind(api);
function repair(plan){
 const players=plan.players||[],schedule=plan.schedule||{},live=new Set((plan.liveSessions||[]).map(s=>s.block)),old=structuredClone(schedule),byName=Object.fromEntries(players.map(p=>[p.name,p]));
 players.forEach(p=>(schedule[p.name]||[]).forEach((e,b)=>{if(e?.activity?.startsWith('Front Toss')||e?.activity==='Machine')schedule[p.name][b]={activity:'Drill'}}));
 const replaceable=e=>!!e&&(/^(Drill|Equipment|Front Toss Support|Machine Feed|Live Pitching Support)/.test(e.activity||''));
 const free=(name,block)=>{const p=byName[name],e=schedule[name]?.[block];return !!p&&block>=p.availableFromBlock&&block<p.availableUntilBlock&&replaceable(e)};
 // Facility rule: when Tunnel 2 is NOT live, two Front Toss lanes are available there.
 // During Live, Tunnel 2 is occupied, but Tunnel 1 may be used for ONE Front Toss lane instead of Machine.
 const frontSlots=[];for(let b=0;b<10;b++){if(live.has(b))frontSlots.push({block:b,lane:1,inMachineTunnel:true});else{frontSlots.push({block:b,lane:1},{block:b,lane:2})}}
 const names=players.map(p=>p.name);
 function partitions(total,max4=1,p=[]){if(total===0)return[p];if(total<0||p.length>=frontSlots.length)return[];let out=[];for(const s of [3,2,4]){if(s===4&&!max4)continue;out.push(...partitions(total-s,s===4?max4-1:max4,[...p,s]))}return out}
 function solveGroups(slots,sizes,eligible){
  const groups=sizes.map(size=>({size,slot:null,names:[]})),remaining=new Set(names),used=new Set();
  function rec(gi){
   if(gi===groups.length)return remaining.size===0;
   const g=groups[gi],candidates=slots.map((s,i)=>({s,i,pool:[...remaining].filter(n=>eligible(n,s))})).filter(x=>!used.has(x.i)&&x.pool.length>=g.size).sort((a,b)=>a.pool.length-b.pool.length);
   for(const c of candidates){const pool=c.pool.sort((a,b)=>slots.filter(s=>eligible(a,s)).length-slots.filter(s=>eligible(b,s)).length);function pick(start,chosen){if(chosen.length===g.size){g.slot=c.s;g.names=[...chosen];chosen.forEach(n=>remaining.delete(n));used.add(c.i);if(rec(gi+1))return true;used.delete(c.i);chosen.forEach(n=>remaining.add(n));g.slot=null;g.names=[];return false}for(let j=start;j<pool.length;j++){chosen.push(pool[j]);if(pick(j+1,chosen))return true;chosen.pop()}return false}if(pick(0,[]))return true}return false
  }
  return rec(0)?groups:null;
 }
 const shapes=partitions(names.length).filter(x=>x.filter(n=>n===4).length<=1).sort((a,b)=>a.length-b.length||b.includes(4)-a.includes(4));
 let front=null;for(const shape of shapes){front=solveGroups(frontSlots,shape,(n,s)=>free(n,s.block));if(front)break}
 if(!front){Object.keys(schedule).forEach(n=>schedule[n]=old[n]);return null}
 const frontAssignments=[];front.forEach(g=>g.names.forEach(n=>{schedule[n][g.slot.block]={activity:`Front Toss Lane ${g.slot.lane}`};frontAssignments.push({player:n,block:g.slot.block,lane:g.slot.lane})}));
 // Rebuild Machine too, because the normal scheduler stops before Machine when Front Toss fails.
 // Machine may run during Live unless that same block's Tunnel 1 is being used for fallback Front Toss.
 const machineBlocked=new Set(front.filter(g=>g.slot.inMachineTunnel).map(g=>g.slot.block));
 const machineSlots=[0,1,2,3,4,5,6,7,8,9].filter(b=>!machineBlocked.has(b)).map(block=>({block}));
 let machine=null;const machineShapes=partitions(names.length,0).filter(x=>x.every(n=>n===2||n===3)).sort((a,b)=>a.length-b.length);
 for(const shape of machineShapes){machine=solveGroups(machineSlots,shape,(n,s)=>free(n,s.block));if(machine)break}
 if(!machine){Object.keys(schedule).forEach(n=>schedule[n]=old[n]);return null}
 machine.forEach(g=>g.names.forEach(n=>{schedule[n][g.slot.block]={activity:'Machine'}}));
 plan.frontTossAssignments=frontAssignments;plan.frontTossBlocks=[...new Set(frontAssignments.map(a=>a.block))].sort((a,b)=>a-b);plan.feasibilityErrors=(plan.feasibilityErrors||[]).filter(e=>!/Front toss/i.test(e));plan.buildAnywayFrontToss=true;
 const four=front.find(g=>g.size===4),liveFront=front.filter(g=>g.slot.inMachineTunnel);
 plan.fallbackWarnings=[...(plan.fallbackWarnings||[]),four?`BUILD ANYWAY: Block ${four.slot.block+1} has one Front Toss group of 4.`:'BUILD ANYWAY: Front Toss fallback used.',...(liveFront.length?[`Front Toss uses Tunnel 1 during Live in Block${liveFront.length>1?'s':''} ${liveFront.map(g=>g.slot.block+1).join(', ')}; Machine is not scheduled in those blocks.`]:[])];
 plan.blocks=(plan.times||[]).map((time,index)=>{const assignments={};players.forEach(p=>{const e=schedule[p.name][index],label=e?.partner?`${e.activity} — ${e.partner}`:(e?.activity||'Drill');(assignments[label]||(assignments[label]=[])).push(p.name)});return {...time,assignments}});return plan;
}
api.buildSchedule=function(players,start,duration,options){const plan=original(players,start,duration,options);if(!(plan.feasibilityErrors||[]).length)return plan;if(!plan.feasibilityErrors.every(e=>/Front toss/i.test(e)))return plan;const ok=window.confirm(`${plan.feasibilityErrors.join('\n\n')}\n\nBuild anyway by allowing ONE Front Toss group of up to 4 players and, if needed, using Tunnel 1 for Front Toss during a Live block?\n\nOK = Build Anyway\nCancel = Keep the rule`);if(!ok)return plan;const fixed=repair(plan);if(fixed&&(fixed.feasibilityErrors||[]).length===0)return fixed;alert('Build Anyway still could not create both Front Toss and Machine assignments around tonight’s protected activities. No schedule was changed.');return plan};
if(originalValidate)api.validate=function(plan){const errors=originalValidate(plan)||[];if(!plan?.buildAnywayFrontToss)return errors;return errors.filter(e=>!/Front Toss lane must have 2–3 players/i.test(e));};
})();