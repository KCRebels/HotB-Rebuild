(()=>{
'use strict';
const api=window.HotBPracticeScheduler;if(!api?.buildSchedule)return;
const original=api.buildSchedule,originalValidate=api.validate?.bind(api);
function isFree(entry){return entry&&(/^(Drill|Equipment|Front Toss Support|Machine Feed|Live Pitching Support)/.test(entry.activity||''));}
function repairFrontToss(plan){
 const players=plan.players||[],schedule=plan.schedule||{},live=new Set((plan.liveSessions||[]).map(s=>s.block));
 const old=JSON.parse(JSON.stringify(schedule));
 players.forEach(p=>(schedule[p.name]||[]).forEach(e=>{if(e?.activity?.startsWith('Front Toss Lane'))e.activity='Drill'}));
 const slots=[];for(let b=0;b<10;b++)if(!live.has(b)){slots.push({block:b,lane:1},{block:b,lane:2})}
 const byName=Object.fromEntries(players.map(p=>[p.name,p]));
 const eligible=(name,slot)=>{const p=byName[name],e=schedule[name]?.[slot.block];return !!p&&slot.block>=p.availableFromBlock&&slot.block<p.availableUntilBlock&&isFree(e)};
 const groups=Array.from({length:slots.length},()=>[]),remaining=new Set(players.map(p=>p.name));
 function solve(fourUsed=false){
  if(!remaining.size){const active=groups.filter(g=>g.length);return active.every(g=>g.length>=2&&g.length<=4)&&active.filter(g=>g.length===4).length<=1;}
  const name=[...remaining].sort((a,b)=>slots.filter((s,i)=>groups[i].length<4&&eligible(a,s)).length-slots.filter((s,i)=>groups[i].length<4&&eligible(b,s)).length)[0];
  const candidates=slots.map((s,i)=>({s,i,n:groups[i].length})).filter(x=>eligible(name,x.s)&&x.n<4&&!(x.n===3&&fourUsed)).sort((a,b)=>{const pa=a.n===1?0:a.n===2?1:a.n===3?2:3,pb=b.n===1?0:b.n===2?1:b.n===3?2:3;return pa-pb||a.i-b.i});
  for(const c of candidates){const makesFour=c.n===3;groups[c.i].push(name);remaining.delete(name);const singles=groups.filter(g=>g.length===1).length;if(singles<=remaining.size&&solve(fourUsed||makesFour))return true;remaining.add(name);groups[c.i].pop();}
  return false;
 }
 if(!solve(false)){Object.keys(schedule).forEach(n=>schedule[n]=old[n]);return null;}
 const assignments=[];groups.forEach((g,i)=>{if(!g.length)return;const s=slots[i];g.forEach(name=>{schedule[name][s.block]={activity:`Front Toss Lane ${s.lane}`};assignments.push({player:name,block:s.block,lane:s.lane})})});
 plan.frontTossAssignments=assignments;plan.frontTossBlocks=[...new Set(assignments.map(a=>a.block))].sort((a,b)=>a-b);
 plan.feasibilityErrors=(plan.feasibilityErrors||[]).filter(e=>!/Front toss/i.test(e));
 plan.buildAnywayFrontToss=true;
 plan.fallbackWarnings=[...(plan.fallbackWarnings||[]),'BUILD ANYWAY: Coach approved one Front Toss group of up to 4 players.'];
 plan.blocks=(plan.times||[]).map((time,index)=>{const assignments={};players.forEach(p=>{const e=schedule[p.name][index],label=e.partner?`${e.activity} — ${e.partner}`:e.activity;(assignments[label]||(assignments[label]=[])).push(p.name)});return {...time,assignments}});
 return plan;
}
api.buildSchedule=function(players,start,duration,options){const plan=original(players,start,duration,options);if(!(plan.feasibilityErrors||[]).length)return plan;if(!plan.feasibilityErrors.every(e=>/Front toss/i.test(e)))return plan;const ok=window.confirm(`${plan.feasibilityErrors.join('\n\n')}\n\nBuild anyway by allowing ONE Front Toss group of up to 4 players?\n\nOK = Build Anyway\nCancel = Keep the rule`);if(!ok)return plan;const repaired=repairFrontToss(plan);if(repaired&&(repaired.feasibilityErrors||[]).length===0)return repaired;alert('Build Anyway could not create the Front Toss exception with this attendance. No schedule was changed.');return plan;};
if(originalValidate)api.validate=function(plan){const errors=originalValidate(plan)||[];if(!plan?.buildAnywayFrontToss)return errors;return errors.filter(e=>!/Front Toss lane must have 2–3 players/i.test(e));};
})();