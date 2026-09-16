(()=>{
'use strict';
const api=window.HotBPracticeScheduler;if(!api?.buildSchedule)return;
const original=api.buildSchedule,originalValidate=api.validate?.bind(api);
function repairFrontToss(plan){
 const players=plan.players||[],schedule=plan.schedule||{},live=new Set((plan.liveSessions||[]).map(s=>s.block));
 const old=structuredClone(schedule),byName=Object.fromEntries(players.map(p=>[p.name,p]));
 // Restore any partial Front Toss entries to ordinary drill time before solving.
 players.forEach(p=>(schedule[p.name]||[]).forEach((e,b)=>{if(e?.activity?.startsWith('Front Toss Lane'))schedule[p.name][b]={activity:'Drill'}}));
 const slots=[];
 for(let block=0;block<10;block++)if(!live.has(block))for(let lane=1;lane<=2;lane++)slots.push({block,lane});
 const free=(name,slot)=>{
   const p=byName[name],e=schedule[name]?.[slot.block];
   if(!p||slot.block<p.availableFromBlock||slot.block>=p.availableUntilBlock)return false;
   // Front Toss may replace ordinary open-area work/support, but never warm-up, tee, machine, or live assignments.
   return !!e&&(/^(Drill|Equipment|Front Toss Support|Machine Feed|Live Pitching Support)/.test(e.activity||''));
 };
 const names=players.map(p=>p.name);
 // With 16 players the approved exception is exactly 4+3+3+3+3. For other totals,
 // generate every 2/3 partition plus at most one 4 and prefer fewer/lower-size groups.
 function partitions(total,max4=1,maxGroups=slots.length,prefix=[]){
   if(total===0)return [prefix];if(total<0||prefix.length>=maxGroups)return [];
   const out=[];
   for(const size of [3,2,4]){
     if(size===4&&max4<1)continue;
     out.push(...partitions(total-size,size===4?max4-1:max4,maxGroups,[...prefix,size]));
   }
   return out;
 }
 const shapes=partitions(names.length).filter(shape=>shape.filter(x=>x===4).length<=1).sort((a,b)=>a.length-b.length||a.filter(x=>x===4).length-b.filter(x=>x===4).length);
 let solution=null;
 function tryShape(shape){
   const groups=shape.map(size=>({size,slot:null,names:[]})),remaining=new Set(names),usedSlots=new Set();
   function assignGroup(gi){
     if(gi===groups.length)return remaining.size===0;
     const g=groups[gi];
     // Choose a slot, then choose the hardest-to-place eligible players for it.
     const candidateSlots=slots.map((s,i)=>({s,i,eligible:[...remaining].filter(n=>free(n,s))})).filter(x=>!usedSlots.has(x.i)&&x.eligible.length>=g.size).sort((a,b)=>a.eligible.length-b.eligible.length);
     for(const cs of candidateSlots){
       const pool=cs.eligible.sort((a,b)=>slots.filter(s=>free(a,s)).length-slots.filter(s=>free(b,s)).length);
       function choose(start,picked){
         if(picked.length===g.size){g.slot=cs.s;g.names=picked.slice();picked.forEach(n=>remaining.delete(n));usedSlots.add(cs.i);if(assignGroup(gi+1))return true;usedSlots.delete(cs.i);picked.forEach(n=>remaining.add(n));g.slot=null;g.names=[];return false;}
         for(let j=start;j<pool.length;j++){picked.push(pool[j]);if(choose(j+1,picked))return true;picked.pop();}
         return false;
       }
       if(choose(0,[]))return true;
     }
     return false;
   }
   return assignGroup(0)?groups:null;
 }
 for(const shape of shapes){solution=tryShape(shape);if(solution)break;}
 if(!solution){Object.keys(schedule).forEach(n=>schedule[n]=old[n]);return null;}
 const assignments=[];
 solution.forEach(g=>g.names.forEach(name=>{schedule[name][g.slot.block]={activity:`Front Toss Lane ${g.slot.lane}`};assignments.push({player:name,block:g.slot.block,lane:g.slot.lane})}));
 plan.frontTossAssignments=assignments;plan.frontTossBlocks=[...new Set(assignments.map(a=>a.block))].sort((a,b)=>a-b);
 plan.feasibilityErrors=(plan.feasibilityErrors||[]).filter(e=>!/Front toss/i.test(e));
 plan.buildAnywayFrontToss=true;
 const four=solution.find(g=>g.size===4);
 plan.fallbackWarnings=[...(plan.fallbackWarnings||[]),four?`BUILD ANYWAY: Block ${four.slot.block+1}, Front Toss Lane ${four.slot.lane} has 4 players.`:'BUILD ANYWAY: Front Toss was rebuilt using approved fallback grouping.'];
 plan.blocks=(plan.times||[]).map((time,index)=>{const assignments={};players.forEach(p=>{const e=schedule[p.name][index],label=e?.partner?`${e.activity} — ${e.partner}`:(e?.activity||'Drill');(assignments[label]||(assignments[label]=[])).push(p.name)});return {...time,assignments}});
 return plan;
}
api.buildSchedule=function(players,start,duration,options){
 const plan=original(players,start,duration,options);
 if(!(plan.feasibilityErrors||[]).length)return plan;
 if(!plan.feasibilityErrors.every(e=>/Front toss/i.test(e)))return plan;
 const ok=window.confirm(`${plan.feasibilityErrors.join('\n\n')}\n\nBuild anyway by allowing ONE Front Toss group of 4 players?\n\nOK = Build Anyway\nCancel = Keep the rule`);
 if(!ok)return plan;
 const repaired=repairFrontToss(plan);
 if(repaired&&(repaired.feasibilityErrors||[]).length===0)return repaired;
 alert('Build Anyway still could not fit Front Toss around the protected warm-up, tee, machine, live, and availability blocks. No schedule was changed.');
 return plan;
};
if(originalValidate)api.validate=function(plan){const errors=originalValidate(plan)||[];if(!plan?.buildAnywayFrontToss)return errors;return errors.filter(e=>!/Front Toss lane must have 2–3 players/i.test(e));};
})();