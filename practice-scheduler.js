(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.HotBPracticeScheduler=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 const BLOCK_COUNT=10,BLOCK_MINUTES=12;
 const fixedActivities=['Stretch','Tee Work'];
 const pad=value=>String(value).padStart(2,'0');
 function blockTimes(startTime='18:00',durationMinutes=120){
  const [hour,minute]=String(startTime||'18:00').split(':').map(Number);
  const start=(Number.isFinite(hour)?hour:18)*60+(Number.isFinite(minute)?minute:0);
  const duration=Math.max(10,Math.round((Number(durationMinutes)||120)/10)*10),blockMinutes=duration/BLOCK_COUNT;
  const label=minutes=>{
   const normalized=(minutes+1440)%1440,h=Math.floor(normalized/60),m=normalized%60;
   const displayHour=h%12||12,period=h<12?'a':'p';
   return `${displayHour}:${pad(m)}${period}`;
  };
  return Array.from({length:BLOCK_COUNT},(_,index)=>({block:index+1,start:label(start+index*blockMinutes),end:label(start+(index+1)*blockMinutes)}));
 }
 function buildSchedule(players,startTime='18:00',durationMinutes=120,options={}){
  const attendees=(players||[]).filter(player=>player&&player.name).map(player=>{
   const from=Math.max(0,Math.min(BLOCK_COUNT,Number(player.availableFromBlock)||0));
   const until=Math.max(from,Math.min(BLOCK_COUNT,Number.isFinite(Number(player.availableUntilBlock))?Number(player.availableUntilBlock):BLOCK_COUNT));
   return {...player,isPitcher:!!player.isPitcher,isCatcher:!!player.isCatcher,canPitch:!!player.isPitcher&&player.canPitch!==false,requiresPitchWarmup:!!player.isPitcher&&player.canPitch!==false&&player.requiresPitchWarmup!==false,canCatch:!!player.isCatcher&&player.canCatch!==false,availableFromBlock:from,availableUntilBlock:until};
  });
  const duration=Math.max(10,Math.round((Number(durationMinutes)||120)/10)*10),blockMinutes=duration/BLOCK_COUNT;
  const times=blockTimes(startTime,duration),warnings=[];
  const schedule=Object.fromEntries(attendees.map(player=>[player.name,Array.from({length:BLOCK_COUNT},(_,block)=>block<player.availableFromBlock||block>=player.availableUntilBlock?{activity:'Not Present'}:null)]));
  const teeBlocks={};
  attendees.forEach(player=>{
   if(player.availableFromBlock>=player.availableUntilBlock){warnings.push(`${player.name} is not available for a complete practice block.`);return}
   const warmupBlock=player.availableFromBlock,teeBlock=warmupBlock+1;
   schedule[player.name][warmupBlock]={activity:fixedActivities[0]};
   if(teeBlock<player.availableUntilBlock){schedule[player.name][teeBlock]={activity:fixedActivities[1]};teeBlocks[player.name]=teeBlock}
   else{teeBlocks[player.name]=warmupBlock;warnings.push(`${player.name} is not present long enough to complete both Warm-Up and Tee Work.`)}
   if(player.availableFromBlock>0)warnings.push(`${player.name} arrives late and is assigned Warm-Up, then Tee Work, in the first two available blocks.`);
  });
  const isOpen=(player,block)=>block>=0&&block<BLOCK_COUNT&&schedule[player.name][block]===null&&block>(teeBlocks[player.name]??-1);
  const feasibilityErrors=[];
  function groupedAssignment(playersToAssign,slots,eligible,requireAllSlots=false){
   const assignments=Array(slots.length).fill(null).map(()=>[]),remaining=new Set(playersToAssign.map(player=>player.name));
   const byName=Object.fromEntries(playersToAssign.map(player=>[player.name,player]));
   function solve(){
    if(!remaining.size)return assignments.every(group=>(!requireAllSlots&&group.length===0)||group.length===2||group.length===3);
    const openNames=[...remaining],name=openNames.sort((a,b)=>{
     const options=playerName=>slots.filter((slot,index)=>assignments[index].length<3&&eligible(byName[playerName],slot,index)).length;
     return options(a)-options(b)||a.localeCompare(b);
    })[0],player=byName[name];
    const candidates=slots.map((slot,index)=>({slot,index,count:assignments[index].length})).filter(item=>item.count<3&&eligible(player,item.slot,item.index)).sort((a,b)=>{
     const priority=count=>count===1?0:count===2?1:2;
     return priority(a.count)-priority(b.count)||a.index-b.index;
    });
    const triedEmpty=new Set();
    for(const candidate of candidates){
     if(candidate.count===0){
      const signature=String(candidate.slot.block);
      if(triedEmpty.has(signature))continue;
      triedEmpty.add(signature);
     }
     assignments[candidate.index].push(name);remaining.delete(name);
     const minimumNeeded=assignments.reduce((sum,group)=>sum+(group.length===1?1:requireAllSlots&&group.length===0?2:0),0);
     const capacity=assignments.reduce((sum,group)=>sum+(group.length?3-group.length:3),0);
     if(minimumNeeded<=remaining.size&&capacity>=remaining.size&&solve())return true;
     remaining.add(name);assignments[candidate.index].pop();
    }
    return false;
   }
   return solve()?assignments:null;
  }
  const pitchers=attendees.filter(player=>player.canPitch),catchers=attendees.filter(player=>player.canCatch);
  const liveSessions=[];
  const coachPitch=!pitchers.length&&options.noPitchersMode==='coach';
  if(!pitchers.length&&!coachPitch)warnings.push('Live pitching was replaced because no pitchers are attending.');
  const today=new Date(),todayDate=Date.UTC(today.getFullYear(),today.getMonth(),today.getDate());
  const weekNumber=Math.floor((todayDate-Date.UTC(2026,7,31))/(7*24*60*60*1000));
  const heavyCatcherIndex=((weekNumber%2)+2)%2;
  const orderedCatchers=catchers.length>1
   ? [catchers[heavyCatcherIndex],catchers[1-heavyCatcherIndex]]
   : catchers;
  const hitterSessionsNeeded=Math.ceil(attendees.length/3);
  const baseSessionCount=coachPitch
   ? Math.min(5,Math.max(1,hitterSessionsNeeded))
   : pitchers.length?Math.min(5,pitchers.length*3,Math.max(pitchers.length,hitterSessionsNeeded)):0;
  const onePitcherCoachBlocks=pitchers.length===1?Math.min(5-baseSessionCount,Math.max(1,hitterSessionsNeeded-baseSessionCount)):0;
  const orderedPitchers=pitchers.slice().sort((a,b)=>a.availableUntilBlock-b.availableUntilBlock||a.availableFromBlock-b.availableFromBlock||a.name.localeCompare(b.name));
  const livePitchers=[...Array.from({length:baseSessionCount},(_,index)=>coachPitch?null:orderedPitchers[index%orderedPitchers.length]),...Array(onePitcherCoachBlocks).fill(null)];
  const plannedSessions=[];
  const unusedLiveBlocks=[3,4,5,6,7,8,9];
  livePitchers.forEach((pitcher,index)=>{
   const blockAt=unusedLiveBlocks.findIndex(block=>!pitcher||isOpen(pitcher,block));
   if(blockAt<0){warnings.push(`${pitcher.name} could not be scheduled to pitch while present.`);return}
   plannedSessions.push({pitcher,index,liveBlock:unusedLiveBlocks.splice(blockAt,1)[0]});
  });
  plannedSessions.sort((a,b)=>a.liveBlock-b.liveBlock);
  const sessionCount=plannedSessions.length;
  if(attendees.length<2)feasibilityErrors.push('At least two attending players are required because every hitting station must have 2–3 players.');
  const maximumPitchers=Math.floor(attendees.length/2),pitchersToRemove=Math.max(0,pitchers.length-maximumPitchers);
  if(pitchersToRemove)feasibilityErrors.push(`${pitchers.length} available pitchers would require at least ${pitchers.length*2} unique live-hitting assignments, but only ${attendees.length} players are attending. At least ${pitchersToRemove} of the ${pitchers.length} available pitchers must be marked Hitting Only. Then build the practice again.`);
  else if(sessionCount>maximumPitchers)feasibilityErrors.push(`${sessionCount} live-pitching blocks require at least ${sessionCount*2} unique live hitters, but only ${attendees.length} players are attending. Reduce live pitching by at least ${sessionCount-maximumPitchers} block${sessionCount-maximumPitchers===1?'':'s'} and build again.`);
  const firstChunk=Math.ceil(sessionCount/2);
  const sessionPlans=plannedSessions.map((item,index)=>{
   const {pitcher,liveBlock}=item;
   const singleCatcherBlocks=Math.min(3,Math.max(0,sessionCount-1));
   const preferred=catchers.length>1&&sessionCount>1?(index<firstChunk?orderedCatchers[0]:orderedCatchers[1]):catchers.length===1&&index>=sessionCount-singleCatcherBlocks?catchers[0]:null;
   const catcherChoices=catchers.length===1?[preferred]:[preferred,...orderedCatchers];
   const catcher=catcherChoices.find((candidate,candidateIndex,list)=>candidate&&list.indexOf(candidate)===candidateIndex&&candidate.name!==pitcher?.name&&isOpen(candidate,liveBlock))||null;
   return {pitcher,index,liveBlock,catcher};
  });
  sessionPlans.forEach(({pitcher,liveBlock,catcher})=>{
   const pitcherName=pitcher?.name||'Coach';
   if(pitcher)schedule[pitcher.name][liveBlock]={activity:'Pitch Live',partner:catcher?.name||'Coach'};
   if(catcher)schedule[catcher.name][liveBlock]={activity:'Catch Live',partner:pitcherName};
   liveSessions.push({block:liveBlock,pitcher:pitcherName,catcher:catcher?.name||'Coach',hitters:[]});
  });
  const warmedPitchers=new Set();
  sessionPlans.forEach(({pitcher,liveBlock,catcher})=>{
   if(!pitcher||!pitcher.requiresPitchWarmup||warmedPitchers.has(pitcher.name))return;
   warmedPitchers.add(pitcher.name);
   const warmBlock=[liveBlock-1,liveBlock-2].find(block=>block>=2&&isOpen(pitcher,block));
   if(warmBlock===undefined){warnings.push(`${pitcher.name} could not be assigned a pitching warm-up.`);return}
   const warmCatcher=[catcher,...orderedCatchers].find((candidate,candidateIndex,list)=>{
    if(!candidate||list.indexOf(candidate)!==candidateIndex||candidate.name===pitcher.name||!isOpen(candidate,warmBlock))return false;
    if(catchers.length===1&&sessionCount>1)return false;
    const remainingOpen=schedule[candidate.name].slice(2,8).filter(entry=>entry===null).length;
    return remainingOpen>2;
   })||null;
   const warmPartner=warmCatcher?.name||'Coach';
   schedule[pitcher.name][warmBlock]={activity:'Pitch Warm-Up',partner:warmPartner};
   if(warmCatcher)schedule[warmCatcher.name][warmBlock]={activity:'Catch Warm-Up',partner:pitcher.name};
  });
  if(liveSessions.length&&!feasibilityErrors.length){
   const liveGroups=groupedAssignment(attendees,liveSessions,(player,session)=>session.pitcher!==player.name&&session.catcher!==player.name&&isOpen(player,session.block),true);
   if(!liveGroups)feasibilityErrors.push('The selected pitchers, catchers, arrival times and departure times cannot provide every player exactly one live-hitting block with 2–3 hitters. Adjust availability or mark a pitcher Hitting Only and build again.');
   else liveGroups.forEach((names,index)=>names.forEach(name=>{liveSessions[index].hitters.push(name);schedule[name][liveSessions[index].block]={activity:'Hit Live',partner:liveSessions[index].pitcher}}));
  }
  const liveBlocks=new Set(liveSessions.map(session=>session.block));
  const frontTossAssignments=[];
  const frontTossCandidates=[2,3,4,5,6,7,8,9].filter(block=>!liveBlocks.has(block));
  const orderedFrontBlocks=frontTossCandidates.slice().sort((a,b)=>(a>=8?0:1)-(b>=8?0:1)||a-b),frontSlots=orderedFrontBlocks.flatMap(block=>[{block,lane:1},{block,lane:2}]);
  if(!feasibilityErrors.length){
   const frontGroups=groupedAssignment(attendees,frontSlots,(player,slot)=>isOpen(player,slot.block));
   if(!frontGroups)feasibilityErrors.push('Front toss cannot be scheduled exactly once per player in groups of 2–3 with the selected attendance and availability.');
   else frontGroups.forEach((names,index)=>names.forEach(name=>{const {block,lane}=frontSlots[index];schedule[name][block]={activity:`Front Toss Lane ${lane}`};frontTossAssignments.push({player:name,block,lane})}));
  }
  const frontTossBlocks=[...new Set(frontTossAssignments.map(item=>item.block))].sort((a,b)=>a-b);
  if(!feasibilityErrors.length){
   const machineSlots=[2,3,4,5,6,7,8,9].map(block=>({block})),machineGroups=groupedAssignment(attendees,machineSlots,(player,slot)=>isOpen(player,slot.block));
   if(!machineGroups)feasibilityErrors.push('Machine cannot be scheduled exactly once per player in groups of 2–3 with the selected attendance and availability.');
   else machineGroups.forEach((names,index)=>names.forEach(name=>{schedule[name][machineSlots[index].block]={activity:'Machine'}}));
  }
  attendees.forEach(player=>{
   for(let block=0;block<BLOCK_COUNT;block++)if(schedule[player.name][block]===null)schedule[player.name][block]={activity:'Drill'};
  });
  for(let block=0;block<BLOCK_COUNT;block++){
   const drillPlayers=attendees.filter(player=>schedule[player.name][block].activity==='Drill');
   if(drillPlayers.length===1&&attendees.length>1){
    const activities=attendees.map(player=>schedule[player.name][block].activity);
    const support=activities.includes('Machine')?'Machine Feed':activities.some(activity=>activity.startsWith('Front Toss'))?'Front Toss Support':liveSessions.some(session=>session.block===block)?'Live Pitching Support':'Equipment / Ball Reset';
    schedule[drillPlayers[0].name][block]={activity:support};
   }
  }
  const drillSlotsByPlayer=Object.fromEntries(attendees.map(player=>[player.name,schedule[player.name].map((entry,index)=>entry.activity==='Drill'?index:-1).filter(index=>index>=0)]));
  const drillPlayersByBlock=Array.from({length:BLOCK_COUNT},(_,block)=>attendees.filter(player=>schedule[player.name][block].activity==='Drill'));
  let drillStations=Math.max(0,...Object.values(drillSlotsByPlayer).map(slots=>slots.length),...drillPlayersByBlock.map(list=>Math.ceil(list.length/3))),drillsAssigned=false;
  while(!drillsAssigned&&drillStations<=BLOCK_COUNT){
   attendees.forEach(player=>schedule[player.name].forEach(entry=>{if(entry.activity.startsWith('Drill #'))entry.activity='Drill'}));
   const usedByPlayer=Object.fromEntries(attendees.map(player=>[player.name,new Set()]));
   let failed=false;
   for(let block=0;block<BLOCK_COUNT&&!failed;block++){
    const drillPlayers=drillPlayersByBlock[block].slice().sort((a,b)=>drillSlotsByPlayer[b.name].length-drillSlotsByPlayer[a.name].length||a.name.localeCompare(b.name));
    if(!drillPlayers.length)continue;
    const groupSizes=drillPlayers.length===1?[1]:drillPlayers.length%2?[3,...Array((drillPlayers.length-3)/2).fill(2)]:Array(drillPlayers.length/2).fill(2);
    const groupCount=groupSizes.length;
    const groups=[];
    let cursor=0;
    for(const size of groupSizes){groups.push(drillPlayers.slice(cursor,cursor+size));cursor+=size}
    const availableStations=Array.from({length:drillStations},(_,index)=>index);
    groups.sort((a,b)=>{
     const aOptions=availableStations.filter(station=>a.every(player=>!usedByPlayer[player.name].has(station))).length;
     const bOptions=availableStations.filter(station=>b.every(player=>!usedByPlayer[player.name].has(station))).length;
     return aOptions-bOptions;
    });
    for(const group of groups){
     const stationAt=availableStations.findIndex(station=>group.every(player=>!usedByPlayer[player.name].has(station)));
     if(stationAt<0){failed=true;break}
     const station=availableStations.splice(stationAt,1)[0];
     group.forEach(player=>{
      usedByPlayer[player.name].add(station);
      schedule[player.name][block].activity=`Drill #${station+1}`;
     });
    }
   }
   if(failed)drillStations++;else drillsAssigned=true;
  }
  if(!drillsAssigned)warnings.push('The drill stations could not be assigned without a repeat.');
  const blocks=times.map((time,index)=>{
   const assignments={};
   attendees.forEach(player=>{
    const entry=schedule[player.name][index],label=entry.partner?`${entry.activity} — ${entry.partner}`:entry.activity;
    (assignments[label]||(assignments[label]=[])).push(player.name);
   });
   return {...time,assignments};
  });
  const catcherLoads=catchers.map(catcher=>({name:catcher.name,liveBlocks:schedule[catcher.name].filter(entry=>entry?.activity==='Catch Live').length}));
  return {attendance:attendees.length,players:attendees,startTime,durationMinutes:duration,blockMinutes,times,schedule,blocks,liveSessions,frontTossBlocks,frontTossAssignments,drillStations,catcherLoads,warnings,feasibilityErrors};
 }
 function validate(plan){
  const errors=[];
  if(!plan||plan.times?.length!==BLOCK_COUNT)errors.push('Schedule must contain ten blocks.');
  Object.entries(plan?.schedule||{}).forEach(([name,entries])=>{
   if(entries.length!==BLOCK_COUNT||entries.some(entry=>!entry?.activity))errors.push(`${name} has downtime while present.`);
   const player=plan.players?.find(item=>item.name===name),from=player?.availableFromBlock||0,until=player?.availableUntilBlock??BLOCK_COUNT;
   if(from<until&&entries[from]?.activity!=='Stretch')errors.push(`${name} must complete Warm-Up in the first attended block.`);
   if(from+1<until&&entries[from+1]?.activity!=='Tee Work')errors.push(`${name} must complete Tee Work in the second attended block.`);
   if(entries.some((entry,index)=>entry?.activity==='Tee Work'&&index!==from+1))errors.push(`${name} repeats Tee Work after the required block.`);
   if(entries.filter(entry=>entry.activity==='Machine').length!==1)errors.push(`${name} must complete Machine exactly once.`);
   if(entries.filter(entry=>entry.activity.startsWith('Front Toss')).length!==1)errors.push(`${name} must complete Front Toss exactly once.`);
   if(!entries.some(entry=>entry.activity.startsWith('Drill #')))errors.push(`${name} is missing drill work.`);
   const drillEntries=entries.filter(entry=>entry.activity.startsWith('Drill #')).map(entry=>entry.activity);
   if(new Set(drillEntries).size!==drillEntries.length)errors.push(`${name} repeats a drill station.`);
   if(plan.liveSessions?.length&&entries.filter(entry=>entry.activity==='Hit Live').length!==1)errors.push(`${name} must complete live hitting exactly once.`);
  });
  (plan?.players||[]).forEach(player=>{
   const entries=plan.schedule[player.name]||[];
   if(player.requiresPitchWarmup&&plan.liveSessions?.some(session=>session.pitcher===player.name)){
    const warm=entries.findIndex(entry=>entry?.activity==='Pitch Warm-Up'),live=entries.findIndex(entry=>entry?.activity==='Pitch Live');
    if(warm<0||live<0||warm>=live||live-warm>2)errors.push(`${player.name}'s pitching warm-up is not within two blocks before live.`);
   }
  });
  for(let block=0;block<BLOCK_COUNT;block++){
   const entries=Object.values(plan.schedule||{}).map(items=>items[block]);
   const machineCount=entries.filter(entry=>entry?.activity==='Machine').length;
   if(machineCount!==0&&(machineCount<2||machineCount>3))errors.push(`Block ${block+1} Machine must have 2–3 players.`);
   const frontCounts={};entries.filter(entry=>entry?.activity.startsWith('Front Toss Lane')).forEach(entry=>frontCounts[entry.activity]=(frontCounts[entry.activity]||0)+1);
   if(Object.values(frontCounts).some(count=>count<2||count>3))errors.push(`Block ${block+1} each Front Toss lane must have 2–3 players.`);
   if(plan.liveSessions?.some(session=>session.block===block)&&entries.some(entry=>entry?.activity.startsWith('Front Toss')))errors.push(`Block ${block+1} has Front Toss while live pitching is active.`);
   const drillCounts={};entries.filter(entry=>entry?.activity.startsWith('Drill #')).forEach(entry=>drillCounts[entry.activity]=(drillCounts[entry.activity]||0)+1);
   if(Object.values(drillCounts).some(count=>count>3||(count<2&&plan.attendance>1)))errors.push(`Block ${block+1} has a drill station without 2–3 players.`);
   if(Object.values(drillCounts).includes(1)&&Object.values(drillCounts).includes(3))errors.push(`Block ${block+1} must rebalance one- and three-player drill groups into two-player groups.`);
  }
  (plan?.liveSessions||[]).forEach(session=>{
   if(session.hitters.length<2||session.hitters.length>3)errors.push(`Block ${session.block+1} must have 2–3 live hitters.`);
  });
  const pitcherBlockCounts={};
  (plan?.liveSessions||[]).filter(session=>session.pitcher&&session.pitcher!=='Coach').forEach(session=>pitcherBlockCounts[session.pitcher]=(pitcherBlockCounts[session.pitcher]||0)+1);
  Object.entries(pitcherBlockCounts).forEach(([name,count])=>{if(count>3)errors.push(`${name} exceeds the three-block live pitching limit.`)});
  return errors;
 }
 return {BLOCK_COUNT,BLOCK_MINUTES,blockTimes,buildSchedule,validate};
});
