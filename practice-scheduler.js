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
  const firstChunk=Math.ceil(sessionCount/2);
  const sessionPlans=plannedSessions.map((item,index)=>{
   const {pitcher,liveBlock}=item;
   const singleCatcherBlocks=Math.min(3,Math.max(0,sessionCount-1));
   const preferred=catchers.length>1&&sessionCount>1?(index<firstChunk?orderedCatchers[0]:orderedCatchers[1]):catchers.length===1&&index>=sessionCount-singleCatcherBlocks?catchers[0]:null;
   const catcher=[preferred,...orderedCatchers].find((candidate,candidateIndex,list)=>candidate&&list.indexOf(candidate)===candidateIndex&&candidate.name!==pitcher?.name&&isOpen(candidate,liveBlock))||null;
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
    const remainingOpen=schedule[candidate.name].slice(2,8).filter(entry=>entry===null).length;
    return remainingOpen>2;
   })||null;
   const warmPartner=warmCatcher?.name||'Coach';
   schedule[pitcher.name][warmBlock]={activity:'Pitch Warm-Up',partner:warmPartner};
   if(warmCatcher)schedule[warmCatcher.name][warmBlock]={activity:'Catch Warm-Up',partner:pitcher.name};
  });
  const livePriority=[...catchers,...pitchers,...attendees].filter((player,index,list)=>list.findIndex(item=>item.name===player.name)===index);
  const needsLive=new Set(attendees.map(player=>player.name));
  livePriority.forEach(player=>{
   const session=liveSessions
    .filter(item=>item.hitters.length<3&&item.pitcher!==player.name&&item.catcher!==player.name&&isOpen(player,item.block))
    .sort((a,b)=>a.hitters.length-b.hitters.length||a.block-b.block)[0];
   if(session){session.hitters.push(player.name);schedule[player.name][session.block]={activity:'Hit Live',partner:session.pitcher};needsLive.delete(player.name)}
  });
  const liveHitCounts=Object.fromEntries(attendees.map(player=>[player.name,schedule[player.name].filter(entry=>entry?.activity==='Hit Live').length]));
  liveSessions.forEach(session=>{
   while(session.hitters.length<2){
    const candidate=attendees
     .filter(player=>!session.hitters.includes(player.name)&&session.pitcher!==player.name&&session.catcher!==player.name&&isOpen(player,session.block))
     .sort((a,b)=>liveHitCounts[a.name]-liveHitCounts[b.name]||a.name.localeCompare(b.name))[0];
    if(!candidate)break;
    session.hitters.push(candidate.name);schedule[candidate.name][session.block]={activity:'Hit Live',partner:session.pitcher};liveHitCounts[candidate.name]++;
   }
  });
  liveSessions.filter(session=>session.hitters.length===1).forEach(session=>{
   const donor=liveSessions.find(other=>other!==session&&other.hitters.length===3&&other.hitters.some(name=>{
    const player=attendees.find(item=>item.name===name);
    return player&&session.pitcher!==name&&session.catcher!==name&&!session.hitters.includes(name)&&isOpen(player,session.block);
   }));
   if(!donor)return;
   const name=donor.hitters.find(candidate=>{const player=attendees.find(item=>item.name===candidate);return player&&session.pitcher!==candidate&&session.catcher!==candidate&&!session.hitters.includes(candidate)&&isOpen(player,session.block)});
   donor.hitters=donor.hitters.filter(candidate=>candidate!==name);schedule[name][donor.block]=null;
   session.hitters.push(name);schedule[name][session.block]={activity:'Hit Live',partner:session.pitcher};
  });
  liveSessions.filter(session=>session.hitters.length<2).forEach(session=>{
   attendees.forEach(player=>{const entry=schedule[player.name][session.block];if(entry&&['Pitch Live','Catch Live','Hit Live'].includes(entry.activity))schedule[player.name][session.block]=null});
   warnings.push(`Live pitching in Block ${session.block+1} was removed because fewer than two hitters were available.`);
  });
  const validLiveSessions=liveSessions.filter(session=>session.hitters.length>=2);
  liveSessions.length=0;liveSessions.push(...validLiveSessions);
  if(liveSessions.length&&needsLive.size)warnings.push(`${needsLive.size} player${needsLive.size===1?'':'s'} could not be assigned live hitting with the attending pitchers and catchers.`);
  const liveBlocks=new Set(liveSessions.map(session=>session.block));
  const frontTossAssignments=[],frontTossCounts={};
  const frontTossCandidates=[2,3,4,5,6,7,8,9].filter(block=>!liveBlocks.has(block));
  attendees.slice().sort((a,b)=>a.availableUntilBlock-b.availableUntilBlock||a.availableFromBlock-b.availableFromBlock||a.name.localeCompare(b.name)).forEach(player=>{
   const preferred=player.availableUntilBlock<BLOCK_COUNT
    ? frontTossCandidates.slice().sort((a,b)=>a-b)
    : frontTossCandidates.slice().sort((a,b)=>{
      const aLate=a>=8?0:1,bLate=b>=8?0:1;
      return aLate-bLate||a-b;
     });
   const block=preferred.find(index=>isOpen(player,index)&&(frontTossCounts[index]||0)<8);
   if(block===undefined){warnings.push(`${player.name} could not be assigned Front Toss during the time present.`);return}
   const count=frontTossCounts[block]||0,lane=count<4?1:2;
   frontTossCounts[block]=count+1;schedule[player.name][block]={activity:`Front Toss Lane ${lane}`};frontTossAssignments.push({player:player.name,block,lane});
  });
  const frontTossBlocks=Object.keys(frontTossCounts).map(Number).sort((a,b)=>a-b);
  function assignOnce(activity,capacity,preferredBlocks){
   const counts=Object.fromEntries(preferredBlocks.map(block=>[block,0]));
   const missed=[];
   attendees.forEach(player=>{
    const block=preferredBlocks.filter(index=>isOpen(player,index)&&counts[index]<capacity).sort((a,b)=>counts[a]-counts[b]||a-b)[0];
    if(block===undefined)missed.push(player.name);
    else{schedule[player.name][block]={activity};counts[block]++}
   });
   if(missed.length)warnings.push(`${missed.length} player${missed.length===1?'':'s'} could not be assigned ${activity}.`);
  }
  assignOnce('Machine',3,[2,3,4,5,6,7,8,9]);
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
  return {attendance:attendees.length,players:attendees,startTime,durationMinutes:duration,blockMinutes,times,schedule,blocks,liveSessions,frontTossBlocks,frontTossAssignments,drillStations,catcherLoads,warnings};
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
   if(!entries.some(entry=>entry.activity==='Machine'))errors.push(`${name} is missing Machine.`);
   if(!entries.some(entry=>entry.activity.startsWith('Front Toss')))errors.push(`${name} is missing Front Toss.`);
   if(!entries.some(entry=>entry.activity.startsWith('Drill #')))errors.push(`${name} is missing drill work.`);
   const drillEntries=entries.filter(entry=>entry.activity.startsWith('Drill #')).map(entry=>entry.activity);
   if(new Set(drillEntries).size!==drillEntries.length)errors.push(`${name} repeats a drill station.`);
   if(plan.liveSessions?.length&&!entries.some(entry=>entry.activity==='Hit Live'))errors.push(`${name} is missing live hitting.`);
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
   if(entries.filter(entry=>entry?.activity==='Machine').length>3)errors.push(`Block ${block+1} exceeds machine capacity.`);
   if(entries.filter(entry=>entry?.activity.startsWith('Front Toss')).length>8)errors.push(`Block ${block+1} exceeds Front Toss capacity.`);
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
