(()=>{
'use strict';
const api=window.HotBPracticeScheduler;if(!api?.buildSchedule)return;
const original=api.buildSchedule,originalValidate=api.validate?.bind(api);
function repair(plan){
 const players=plan.players||[],schedule=plan.schedule||{},live=new Set((plan.liveSessions||[]).map(s=>s.block)),old=structuredClone(schedule),byName=Object.fromEntries(players.map(p=>[p.name,p]));
 players.forEach(p=>(schedule[p.name]||[]).forEach((e,b)=>{if(e?.activity?.startsWith('Front Toss')||e?.activity==='Machine')schedule[p.name][b]={activity:'Drill'}}));
 const replaceable=e=>!e||/^(Drill|Drill #|Equipment|Front Toss Support|Machine Feed|Live Pitching Support)/.test(e.activity||'');
 const free=(name,block)=>{const p=byName[name],e=schedule[name]?.[block];return !!p&&block>=p.availableFromBlock&&block<p.availableUntilBlock&&replaceable(e)};
 const names=players.map(p=>p.name),frontSlots=[];for(let b=0;b<10;b++){if(live.has(b))frontSlots.push({block:b,lane:1,inMachineTunnel:true});else frontSlots.push({block:b,lane:1},{block:b,lane:2})}
 function parts(total,max4,maxSlots,p=[]){if(total===0)return[p];if(total<0||p.length>=maxSlots)return[];let out=[];for(const s of [4,3,2]){if(s===4&&!max4)continue;out.push(...parts(total-s,s===4?max4-1:max4,maxSlots,[...p,s]))}return out}
 function solve(slots,sizes){const groups=sizes.map(size=>({size,slot:null,names:[]})),remaining=new Set(names),used=new Set();function rec(gi){if(gi===groups.length)return !remaining.size;const g=groups[gi];const candidates=slots.map((s,i)=>({s,i,pool:[...remaining].filter(n=>free(n,s.block))})).filter(x=>!used.has(x.i)&&x.pool.length>=g.size).sort((a,b)=>a.pool.length-b.pool.length);for(const c of candidates){const pool=c.pool.sort((a,b)=>slots.filter(s=>free(a,s.block)).length-slots.filter(s=>free(b,s.block)).length);function pick(start,a){if(a.length===g.size){g.slot=c.s;g.names=[...a];a.forEach(n=>remaining.delete(n));used.add(c.i);if(rec(gi+1))return true;used.delete(c.i);a.forEach(n=>remaining.add(n));g.slot=null;g.names=[];return false}for(let j=start;j<pool.length;j++){a.push(pool[j]);if(pick(j+1,a))return true;a.pop()}return false}if(pick(0,[]))return true}return false}return rec(0)?groups:null}
 let front=null;const frontShapes=parts(names.length,1,frontSlots.length).filter(x=>x.filter(n=>n===4).length===1).sort((a,b)=>a.length-b.length);for(const shape of frontShapes){front=solve(frontSlots,shape);if(front)break}if(!front){Object.keys(schedule).forEach(n=>schedule[n]=old[n]);return {ok:false,reason:'The relaxed Front Toss solver still could not place all players.'}}
 const fa=[];front.forEach(g=>g.names.forEach(n=>{schedule[n][g.slot.block]={activity:`Front Toss Lane ${g.slot.lane}`};fa.push({player:n,block:g.slot.block,lane:g.slot.lane})}));
 const blocked=new Set(front.filter(g=>g.slot.inMachineTunnel).map(g=>g.slot.block)),machineSlots=[0,1,2,3,4,5,6,7,8,9].filter(b=>!blocked.has(b)).map(block=>({block}));let machine=null;
 const machineShapes=parts(names.length,0,machineSlots.length).filter(x=>x.every(n=>n===2||n===3)).sort((a,b)=>a.length-b.length);for(const shape of machineShapes){machine=solve(machineSlots,shape);if(machine)break}if(!machine){Object.keys(schedule).forEach(n=>schedule[n]=old[n]);return {ok:false,reason:'Front Toss fit, but Machine could not be rebuilt around it.'}}
 machine.forEach(g=>g.names.forEach(n=>schedule[n][g.slot.block]={activity:'Machine'}));
 plan.frontTossAssignments=fa;plan.frontTossBlocks=[...new Set(fa.map(a=>a.block))];plan.feasibilityErrors=(plan.feasibilityErrors||[]).filter(e=>!/Front toss|Machine cannot be scheduled/i.test(e));plan.buildAnywayFrontToss=true;const four=front.find(g=>g.size===4);plan.fallbackWarnings=[...(plan.fallbackWarnings||[]),`BUILD ANYWAY: Block ${four.slot.block+1}, Front Toss Lane ${four.slot.lane} has 4 players.`];
 plan.blocks=(plan.times||[]).map((time,index)=>{const assignments={};players.forEach(p=>{const e=schedule[p.name][index],label=e?.partner?`${e.activity} — ${e.partner}`:(e?.activity||'Drill');(assignments[label]||(assignments[label]=[])).push(p.name)});return {...time,assignments}});return {ok:true,plan}
}
api.buildSchedule=function(players,start,duration,options){
 const plan=original(players,start,duration,options),errors=plan.feasibilityErrors||[];
 if(!errors.length)return plan;
 const frontOnly=errors.length===1&&/Front toss/i.test(errors[0]);
 if(!frontOnly)return plan;
 const ok=window.confirm(`ALL FAILED RULES:\n\n1. ${errors[0]}\n\nBuild anyway by allowing ONE Front Toss group of up to 4 players and, if needed, using Tunnel 1 for Front Toss during a Live block?\n\nOK = Build Anyway\nCancel = Keep the rule`);
 if(!ok)return plan;
 const result=repair(plan);
 if(!result.ok){window.alert(`BUILD ANYWAY TEST FAILED\n\n${result.reason}`);return plan}
 return result.plan;
};
if(originalValidate)api.validate=function(plan){const errors=originalValidate(plan)||[];if(!plan?.buildAnywayFrontToss)return errors;let allowedFour=false;return errors.filter(e=>{if(/Front Toss lane must have 2–3 players/i.test(e)&&!allowedFour){allowedFour=true;return false}if(/has Front Toss while live pitching is active/i.test(e))return false;return true})};
})();