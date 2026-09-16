(()=>{
'use strict';
const api=window.HotBPracticeScheduler;if(!api?.buildSchedule)return;
const original=api.buildSchedule;
function canReplace(entry){return entry&&(/^(Drill|Equipment|Front Toss Support|Machine Feed|Live Pitching Support)/.test(entry.activity||''));}
function repairFrontToss(plan){
 const players=plan.players||[],schedule=plan.schedule||{},live=new Set((plan.liveSessions||[]).map(s=>s.block));
 players.forEach(p=>(schedule[p.name]||[]).forEach(e=>{if(e?.activity?.startsWith('Front Toss Lane'))e.activity='Drill'}));
 const slots=[];for(let b=0;b<10;b++)if(!live.has(b)){slots.push({block:b,lane:1},{block:b,lane:2})}
 const groups=Array(slots.length).fill(0).map(()=>[]),remaining=new Set(players.map(p=>p.name));let usedFour=false;
 const byName=Object.fromEntries(players.map(p=>[p.name,p]));
 const eligible=(name,slot)=>{const p=byName[name],e=schedule[name]?.[slot.block];return slot.block>=p.availableFromBlock&&slot.block<p.availableUntilBlock&&canReplace(e)};
 function solve(){
  if(!remaining.size){const active=groups.filter(g=>g.length);return active.every(g=>g.length>=2&&g.length<=4)&&active.filter(g=>g.length===4).length<=1}
  const names=[...remaining].sort((a,b)=>slots.filter((s,i)=>groups[i].length<(usedFour?3:4)&&eligible(a,s)).length-slots.filter((s,i)=>groups[i].length<(usedFour?3:4)&&eligible(b,s)).length);
  const name=names[0];
  for(let i=0;i<slots.length;i++){
   const g=groups[i],max=usedFour?3:4;if(g.length>=max||!eligible(name,slots[i]))continue;
   const makesFour=g.length===3;if(makesFour&&usedFour)continue;
   g.push(name);remaining.delete(name);const prev=usedFour;if(makesFour)usedFour=true;
   const singles=groups.filter(x=>x.length===1).length;if(singles<=remaining.size&&solve())return true;
   usedFour=prev;remaining.add(name);g.pop();
  }
  return false;
 }
 if(!solve())return null;
 const assignments=[];groups.forEach((g,i)=>g.forEach(name=>{if(!g.length)return;const s=slots[i];schedule[name][s.block]={activity:`Front Toss Lane ${s.lane}`};assignments.push({player:name,block:s.block,lane:s.lane})}));
 plan.frontTossAssignments=assignments;plan.frontTossBlocks=[...new Set(assignments.map(a=>a.block))].sort((a,b)=>a-b);
 plan.feasibilityErrors=(plan.feasibilityErrors||[]).filter(e=>!/Front toss/i.test(e));
 plan.fallbackWarnings=[...(plan.fallbackWarnings||[]),'BUILD ANYWAY: One Front Toss group may contain 4 players. This exception was approved by the coach.'];
 plan.blocks=(plan.times||[]).map((time,index)=>{const assignments={};players.forEach(p=>{const e=schedule[p.name][index],label=e.partner?`${e.activity} — ${e.partner}`:e.activity;(assignments[label]||(assignments[label]=[])).push(p.name)});return {...time,assignments}});
 return plan;
}
api.buildSchedule=function(players,start,duration,options){const plan=original(players,start,duration,options);if(!(plan.feasibilityErrors||[]).length)return plan;const onlyFront=plan.feasibilityErrors.every(e=>/Front toss/i.test(e));if(!onlyFront)return plan;const ok=window.confirm(`${plan.feasibilityErrors.join('\n\n')}\n\nBuild anyway by allowing ONE Front Toss group of 4 players?\n\nOK = Build Anyway\nCancel = Keep the rule`);if(!ok)return plan;return repairFrontToss(plan)||plan};
})();