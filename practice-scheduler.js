(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.HotBPracticeScheduler=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 const DEFAULT_BLOCK_COUNT=10,MAX_BLOCK_COUNT=11,BLOCK_MINUTES=12;
 const fixedActivities=['Stretch','Tee Work'];
 const pad=value=>String(value).padStart(2,'0');
 function blockTimes(startTime='18:00',durationMinutes=120){
  const BLOCK_COUNT=Number(durationMinutes)===132?MAX_BLOCK_COUNT:DEFAULT_BLOCK_COUNT;
  const [hour,minute]=String(startTime||'18:00').split(':').map(Number);
  const start=(Number.isFinite(hour)?hour:18)*60+(Number.isFinite(minute)?minute:0);
  const duration=BLOCK_COUNT*BLOCK_MINUTES,blockMinutes=BLOCK_MINUTES;
  const label=minutes=>{
   const normalized=(minutes+1440)%1440,h=Math.floor(normalized/60),m=normalized%60;
   const displayHour=h%12||12,period=h<12?'a':'p';
   return `${displayHour}:${pad(m)}${period}`;
  };
  return Array.from({length:BLOCK_COUNT},(_,index)=>({block:index+1,start:label(start+index*blockMinutes),end:label(start+(index+1)*blockMinutes)}));
 }
 function buildSchedule(players,startTime='18:00',durationMinutes=120,options={}){
  const BLOCK_COUNT=Number(durationMinutes)===132?MAX_BLOCK_COUNT:DEFAULT_BLOCK_COUNT;
  const attendees=(players||[]).filter(player=>player&&player.name).map(player=>{
   const from=Math.max(0,Math.min(BLOCK_COUNT,Number(player.availableFromBlock)||0));
   const until=Math.max(from,Math.min(BLOCK_COUNT,Number.isFinite(Number(player.availableUntilBlock))?Number(player.availableUntilBlock):BLOCK_COUNT));
   return {...player,isGuest:!!player.isGuest,isPitcher:!!player.isPitcher,isCatcher:!!player.isCatcher,prePracticeComplete:!!player.prePracticeComplete,canPitch:!!player.isPitcher&&player.canPitch!==false,requiresPitchWarmup:!!player.isPitcher&&player.canPitch!==false&&player.requiresPitchWarmup!==false,canCatch:!!player.isCatcher&&player.canCatch!==false,availableFromBlock:from,availableUntilBlock:until};
  });
  const activeAttendees=attendees.filter(player=>player.availableFromBlock<player.availableUntilBlock);
  const duration=BLOCK_COUNT*BLOCK_MINUTES,blockMinutes=BLOCK_MINUTES;
  const times=blockTimes(startTime,duration),warnings=[],fallbackWarnings=[];
  const schedule=Object.fromEntries(attendees.map(player=>[player.name,Array.from({length:BLOCK_COUNT},(_,block)=>block<player.availableFromBlock||block>=player.availableUntilBlock?{activity:'Not Present'}:null)]));
  const teeBlocks={};
  attendees.forEach(player=>{
   if(player.availableFromBlock>=player.availableUntilBlock){warnings.push(`${player.name} is not available for a complete practice block.`);return}
   if(player.prePracticeComplete){teeBlocks[player.name]=-1;return}
   const warmupBlock=player.availableFromBlock,teeBlock=warmupBlock+1;
   schedule[player.name][warmupBlock]={activity:fixedActivities[0]};
   if(teeBlock<player.availableUntilBlock){schedule[player.name][teeBlock]={activity:fixedActivities[1]};teeBlocks[player.name]=teeBlock}
   else{teeBlocks[player.name]=warmupBlock;warnings.push(`${player.name} is not present long enough to complete both Warm-Up and Tee Work.`)}
   if(player.availableFromBlock>0)warnings.push(`${player.name} arrives late and is assigned Warm-Up, then Tee Work, in the first two available blocks.`);
  });
  const isOpen=(player,block)=>block>=0&&block<BLOCK_COUNT&&schedule[player.name][block]===null&&block>(teeBlocks[player.name]??-1);
  const feasibilityErrors=[];
  if(activeAttendees.length===0)feasibilityErrors.push('At least two available players are required to build a practice.');
  else if(activeAttendees.length===1)feasibilityErrors.push('At least two available players are required because every hitting station must have 2–3 players.');
  function groupedAssignment(playersToAssign,slots,eligible,requireAllSlots=false){
   const keyFor=player=>player.assignmentKey||player.name;
   const assignments=Array(slots.length).fill(null).map(()=>[]),remaining=new Set(playersToAssign.map(keyFor));
   const byName=Object.fromEntries(playersToAssign.map(player=>[keyFor(player),player]));
   const failedStates=new Set();
   function solve(){
    if(!remaining.size)return assignments.every(group=>(!requireAllSlots&&group.length===0)||group.length===2||group.length===3);
    const stateKey=[...remaining].sort().join(',')+'|'+assignments.map(group=>group.slice().sort().join(',')).join(';');
    if(failedStates.has(stateKey))return false;
    const openNames=[...remaining],name=openNames.sort((a,b)=>{
     const options=playerName=>slots.filter((slot,index)=>assignments[index].length<3&&eligible(byName[playerName],slot,index,assignments[index])).length;
     return options(a)-options(b)||a.localeCompare(b);
    })[0],player=byName[name];
    const candidates=slots.map((slot,index)=>({slot,index,count:assignments[index].length})).filter(item=>item.count<3&&eligible(player,item.slot,item.index,assignments[item.index])).sort((a,b)=>{
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
    failedStates.add(stateKey);
    return false;
   }
   return solve()?assignments:null;
  }
  const pitchers=activeAttendees.filter(player=>player.canPitch),catchers=activeAttendees.filter(player=>player.canCatch);
  const liveSessions=[],coachPitch=false;
  if(!pitchers.length)feasibilityErrors.push('No pitcher is available for Live. Live requires an attending player pitcher; Coach Pitch is Front Toss and cannot replace Live.');
  const today=new Date(),todayDate=Date.UTC(today.getFullYear(),today.getMonth(),today.getDate());
  const weekNumber=Math.floor((todayDate-Date.UTC(2026,7,31))/(7*24*60*60*1000));
  const heavyCatcherIndex=((weekNumber%2)+2)%2;
  const catcherRotate=catchers.length?heavyCatcherIndex%catchers.length:0;
  const orderedCatchers=catchers.slice(catcherRotate).concat(catchers.slice(0,catcherRotate));
  const hitterSessionsNeeded=Math.ceil(activeAttendees.length/3);
  const orderedPitchers=pitchers.slice().sort((a,b)=>a.availableUntilBlock-b.availableUntilBlock||a.availableFromBlock-b.availableFromBlock||a.name.localeCompare(b.name));
  const plannedSessionCount=pitchers.length?Math.max(pitchers.length,hitterSessionsNeeded):0;
  const rotatedPitchers=orderedPitchers.length?orderedPitchers.slice((weekNumber%orderedPitchers.length+orderedPitchers.length)%orderedPitchers.length).concat(orderedPitchers.slice(0,(weekNumber%orderedPitchers.length+orderedPitchers.length)%orderedPitchers.length)):[];
  let pitcherGroups=[];
  if(pitchers.length===1&&plannedSessionCount>1){
   const pitcherSessionCount=Math.min(2,plannedSessionCount-1);
   pitcherGroups=[Array(pitcherSessionCount).fill(orderedPitchers[0]),...Array.from({length:plannedSessionCount-pitcherSessionCount},()=>[null])];
   if(plannedSessionCount>pitcherSessionCount)feasibilityErrors.push(`${activeAttendees.length} available players require ${plannedSessionCount} Live blocks, but ${orderedPitchers[0].name} can safely cover only ${pitcherSessionCount}. Add another pitcher, make an attending pitcher available, or adjust attendance.`);
  }else if(pitchers.length){
   const extraPitcherSessions=plannedSessionCount-pitchers.length;
   if(extraPitcherSessions>pitchers.length)feasibilityErrors.push(`${activeAttendees.length} available players require at least ${hitterSessionsNeeded} live blocks. Even if each of the ${pitchers.length} available pitchers throws two consecutive blocks, HotB is short ${extraPitcherSessions-pitchers.length} live block${extraPitcherSessions-pitchers.length===1?'':'s'}. Add another pitcher, make an attending pitcher available, or adjust attendance.`);
   const doubleNames=new Set(rotatedPitchers.slice(0,Math.min(extraPitcherSessions,pitchers.length)).map(player=>player.name));
   pitcherGroups=orderedPitchers.map(pitcher=>doubleNames.has(pitcher.name)?[pitcher,pitcher]:[pitcher]);
  }
  function placePitcherGroups(groups){
   const liveBlocks=[3,4,5,6,7,8,9],used=new Set(),placed=[];
   function solve(remaining){
    if(!remaining.length)return true;
    const candidates=remaining.map((group,index)=>({group,index,starts:liveBlocks.filter(block=>group.every((pitcher,offset)=>liveBlocks.includes(block+offset)&&!used.has(block+offset)&&(!pitcher||isOpen(pitcher,block+offset))))})).sort((a,b)=>a.starts.length-b.starts.length||b.group.length-a.group.length);
    const next=candidates[0];
    for(const start of next.starts){
     next.group.forEach((pitcher,offset)=>{used.add(start+offset);placed.push({pitcher,liveBlock:start+offset})});
     const rest=remaining.filter((_,index)=>index!==next.index);
     if(solve(rest))return true;
     next.group.forEach(()=>placed.pop());next.group.forEach((_,offset)=>used.delete(start+offset));
    }
    return false;
   }
   return solve(groups)?placed.slice():null;
  }
  let plannedSessions=feasibilityErrors.length?[]:placePitcherGroups(pitcherGroups);
  if(!plannedSessions&&pitcherGroups.length){feasibilityErrors.push('The available pitchers cannot be placed into the live blocks while honoring arrival times, departure times, and consecutive blocks for any pitcher who throws twice.');plannedSessions=[]}
  plannedSessions.sort((a,b)=>a.liveBlock-b.liveBlock);
  const repeatedPitchers=orderedPitchers.filter(pitcher=>plannedSessions.filter(session=>session.pitcher?.name===pitcher.name).length===2);
  repeatedPitchers.forEach(pitcher=>{
   const pitcherBlocks=plannedSessions.filter(session=>session.pitcher?.name===pitcher.name).map(session=>session.liveBlock+1).sort((a,b)=>a-b);
   fallbackWarnings.push(`${pitcher.name} will pitch two consecutive live sessions in Blocks ${pitcherBlocks[0]}–${pitcherBlocks[1]}.`);
  });
  const sessionCount=plannedSessions.length;
  if(activeAttendees.length===1)feasibilityErrors.push('At least two available players are required because every hitting station must have 2–3 players.');
  const repeatHittersNeeded=Math.max(0,sessionCount*2-activeAttendees.length);
  if(repeatHittersNeeded>activeAttendees.length)feasibilityErrors.push(`${sessionCount} live blocks require more second live-hitting assignments than the attendance can safely provide.`);
  const catcherTargets=[];
  if(sessionCount===0){}
  else if(coachPitch)catcherTargets.push(...Array(sessionCount).fill(true));
  else if(sessionCount===1)catcherTargets.push(orderedCatchers.length>0);
  else if(orderedCatchers.length>1){
   const playerCaughtBlocks=Math.min(sessionCount,orderedCatchers.length*2),firstCount=Math.ceil(playerCaughtBlocks/2),secondCount=Math.floor(playerCaughtBlocks/2),nineSquareCount=sessionCount-playerCaughtBlocks;
   catcherTargets.push(...Array(firstCount).fill(true),...Array(nineSquareCount).fill(false),...Array(secondCount).fill(true));
  }else if(orderedCatchers.length===1){
   const playerCaughtBlocks=Math.min(2,sessionCount-1);
   catcherTargets.push(...Array(sessionCount-playerCaughtBlocks).fill(false),...Array(playerCaughtBlocks).fill(true));
  }else catcherTargets.push(...Array(sessionCount).fill(false));
  const liveCatcherLoads=new Map(orderedCatchers.map(catcher=>[catcher.name,0]));
  const sessionPlans=plannedSessions.map((item,index)=>{
   const {pitcher,liveBlock}=item;
   const usePlayerCatcher=catcherTargets[index],catcherChoices=usePlayerCatcher?orderedCatchers.slice().sort((a,b)=>{
    const aMatch=pitcher&&a.isGuest===pitcher.isGuest?0:1,bMatch=pitcher&&b.isGuest===pitcher.isGuest?0:1;
    return aMatch-bMatch||(liveCatcherLoads.get(a.name)||0)-(liveCatcherLoads.get(b.name)||0)||orderedCatchers.indexOf(a)-orderedCatchers.indexOf(b);
   }):[];
   const catcher=catcherChoices.find(candidate=>(liveCatcherLoads.get(candidate.name)||0)<2&&candidate.name!==pitcher?.name&&isOpen(candidate,liveBlock))||null;
   if(usePlayerCatcher&&!catcher){
    if(coachPitch)feasibilityErrors.push(`Block ${liveBlock+1} cannot use Coach Pitch because no eligible catcher is available. Add a catcher, adjust availability, or use a player pitcher.`);
    else fallbackWarnings.push(`Block ${liveBlock+1} uses 9Square because no eligible catcher is available for that live session.`);
   }
   if(catcher)liveCatcherLoads.set(catcher.name,(liveCatcherLoads.get(catcher.name)||0)+1);
   return {pitcher,index,liveBlock,catcher};
  });
  sessionPlans.forEach(({pitcher,liveBlock,catcher})=>{
   const pitcherName=pitcher?.name||'Coach';
   if(pitcher)schedule[pitcher.name][liveBlock]={activity:'Pitch Live',partner:catcher?.name||'9Square'};
   if(catcher)schedule[catcher.name][liveBlock]={activity:'Catch Live',partner:pitcherName};
   liveSessions.push({block:liveBlock,pitcher:pitcherName,catcher:catcher?.name||'9Square',hitters:[]});
  });
  const warmedPitchers=new Set(),warmupCatcherLoads=new Map(orderedCatchers.map(catcher=>[catcher.name,0])),coachWarmupBlocks=new Set();
  sessionPlans.forEach(({pitcher,liveBlock,catcher})=>{
   if(!pitcher||!pitcher.requiresPitchWarmup||warmedPitchers.has(pitcher.name))return;
   warmedPitchers.add(pitcher.name);
   let warmBlock,warmCatcher=null,warmPartner='';
   for(const candidateBlock of [liveBlock-1,liveBlock-2]){
    if(candidateBlock<2||!isOpen(pitcher,candidateBlock))continue;
    const playerCatcher=[catcher,...orderedCatchers].filter((candidate,candidateIndex,list)=>candidate&&list.indexOf(candidate)===candidateIndex).sort((a,b)=>(a.isGuest===pitcher.isGuest?0:1)-(b.isGuest===pitcher.isGuest?0:1)).find(candidate=>(warmupCatcherLoads.get(candidate.name)||0)<1&&candidate.name!==pitcher.name&&isOpen(candidate,candidateBlock));
    if(playerCatcher){warmBlock=candidateBlock;warmCatcher=playerCatcher;warmPartner=playerCatcher.name;break}
    if(!coachWarmupBlocks.has(candidateBlock)){warmBlock=candidateBlock;warmPartner='Coach';coachWarmupBlocks.add(candidateBlock);break}
   }
   if(warmBlock===undefined){feasibilityErrors.push(`${pitcher.name} cannot be assigned a pitching warm-up within two blocks before live with the available catchers and one warm-up coach.`);return}
   if(warmCatcher)warmupCatcherLoads.set(warmCatcher.name,(warmupCatcherLoads.get(warmCatcher.name)||0)+1);
   schedule[pitcher.name][warmBlock]={activity:'Pitch Warm-Up',partner:warmPartner};
   if(warmCatcher)schedule[warmCatcher.name][warmBlock]={activity:'Catch Warm-Up',partner:pitcher.name};
  });
  let liveHitterRepeats=[];
  if(liveSessions.length&&!feasibilityErrors.length){
   // Deterministic Rebels-only live hitter assignment. Fill each live session to
   // two hitters first, then place every remaining hitter once; only repeat when
   // total live capacity requires it. This avoids recursive roster permutation.
   const hitCounts=new Map(activeAttendees.map(player=>[player.name,0]));
   const canHit=(player,session)=>session.pitcher!==player.name&&session.catcher!==player.name&&isOpen(player,session.block)&&!session.hitters.includes(player.name);
   function placeOne(session,allowRepeat){
    const candidates=activeAttendees.filter(player=>canHit(player,session)&&(allowRepeat||!(hitCounts.get(player.name)||0)))
     .sort((a,b)=>(hitCounts.get(a.name)||0)-(hitCounts.get(b.name)||0)||a.name.localeCompare(b.name));
    const player=candidates[0];
    if(!player)return false;
    session.hitters.push(player.name);hitCounts.set(player.name,(hitCounts.get(player.name)||0)+1);
    schedule[player.name][session.block]={activity:'Hit Live',partner:session.pitcher};
    return true;
   }
   for(const session of liveSessions)while(session.hitters.length<2&&placeOne(session,false)){}
   for(const player of activeAttendees.filter(player=>!(hitCounts.get(player.name)||0))){
    const session=liveSessions.filter(item=>item.hitters.length<3&&canHit(player,item)).sort((x,y)=>x.hitters.length-y.hitters.length||x.block-y.block)[0];
    if(session){session.hitters.push(player.name);hitCounts.set(player.name,1);schedule[player.name][session.block]={activity:'Hit Live',partner:session.pitcher}}
   }
   for(const session of liveSessions)while(session.hitters.length<2&&placeOne(session,true)){}
   const missing=activeAttendees.filter(player=>!(hitCounts.get(player.name)||0));
   if(missing.length||liveSessions.some(session=>session.hitters.length<2)){
    feasibilityErrors.push('The selected pitchers, catchers, arrival times and departure times cannot provide 2–3 hitters in every live block. Adjust availability or mark a pitcher Hitting Only and build again.');
   }else{
    liveHitterRepeats=activeAttendees.filter(player=>(hitCounts.get(player.name)||0)>1).map(player=>player.name);
    if(liveHitterRepeats.length)fallbackWarnings.push(`${liveHitterRepeats.join(', ')} ${liveHitterRepeats.length===1?'will receive':'will each receive'} a second live-hitting session so every live block has at least two hitters.`);
   }
  }
  const liveBlocks=new Set(liveSessions.map(session=>session.block));
  const frontTossAssignments=[];
  // Assign fixed hitting stations greedily. With the normal Rebels roster all
  // players share the same availability after Warm-Up/Tee, so recursive search
  // adds exponential work without improving the result.
  function assignStationGroups(playersToAssign,slots,eligible,allowOneFrontTossFour=false){
   const assignments=Array.from({length:slots.length},()=>[]);
   const remaining=playersToAssign.slice().sort((a,b)=>{
    const count=player=>slots.filter((slot,index)=>eligible(player,slot,index,assignments[index])).length;
    return count(a)-count(b)||a.name.localeCompare(b.name);
   });
   while(remaining.length){
    let placed=false;
    for(let ri=0;ri<remaining.length&&!placed;ri++){
     const player=remaining[ri];
     const candidates=slots.map((slot,index)=>({slot,index,count:assignments[index].length}))
      .filter(item=>item.count<(allowOneFrontTossFour?4:3)&&eligible(player,item.slot,item.index,assignments[item.index])&&(item.count<3||!assignments.some(group=>group.length===4)))
      .sort((a,b)=>{
       const priority=count=>count===1?0:count===2?1:2;
       return priority(a.count)-priority(b.count)||a.index-b.index;
      });
     for(const candidate of candidates){
      const openAfter=remaining.length-1;
      if(candidate.count===0&&openAfter===0)continue;
      assignments[candidate.index].push(player.name);
      remaining.splice(ri,1);
      placed=true;
      break;
     }
    }
    if(!placed)return null;
   }
   const singles=assignments.map((group,index)=>({group,index})).filter(item=>item.group.length===1);
   for(const single of singles){
    const name=single.group[0],player=playersToAssign.find(item=>item.name===name);
    const donor=assignments.map((group,index)=>({group,index}))
     .find(item=>item.group.length===3&&item.index!==single.index&&eligible(player,slots[item.index],item.index,item.group));
    if(donor){single.group.push(donor.group.pop());continue}
    const target=assignments.map((group,index)=>({group,index}))
     .find(item=>item.group.length===2&&item.index!==single.index&&eligible(player,slots[item.index],item.index,item.group));
    if(target){target.group.push(name);single.group.length=0}
   }
   return assignments.every(group=>group.length===0||group.length===2||group.length===3||(allowOneFrontTossFour&&group.length===4))?assignments:null;
  }
  const prePracticePlayers=activeAttendees.filter(player=>player.prePracticeComplete),reserveEarlyFront=prePracticePlayers.length>=2&&prePracticePlayers.length<=12;
  const frontTossCandidates=Array.from({length:BLOCK_COUNT},(_,block)=>block).filter(block=>!liveBlocks.has(block));
  const orderedFrontBlocks=frontTossCandidates.slice().sort((a,b)=>(a>=8?0:1)-(b>=8?0:1)||a-b),frontSlots=orderedFrontBlocks.flatMap(block=>[{block,lane:1},{block,lane:2}]);
  if(!feasibilityErrors.length){
   let frontGroups=assignStationGroups(activeAttendees,frontSlots,(player,slot)=>isOpen(player,slot.block)&&(!reserveEarlyFront||(player.prePracticeComplete?slot.block<2:slot.block>=2)));
   if(!frontGroups)frontGroups=assignStationGroups(activeAttendees,frontSlots,(player,slot)=>isOpen(player,slot.block)&&(!reserveEarlyFront||(player.prePracticeComplete?slot.block<2:slot.block>=2)),true);
   if(!frontGroups)feasibilityErrors.push('Front toss cannot be scheduled exactly once per player while keeping at least 2 players at every station, even after using the one allowed 4-player Front Toss block.');
   else{
    const fourIndex=frontGroups.findIndex(names=>names.length===4);
    if(fourIndex>=0){const slot=frontSlots[fourIndex];fallbackWarnings.push(`Block ${slot.block+1} uses 4 players at Front Toss Lane ${slot.lane}. This is the one automatic 4-player Front Toss block allowed for this practice.`)}
    frontGroups.forEach((names,index)=>names.forEach(name=>{const {block,lane}=frontSlots[index];schedule[name][block]={activity:`Front Toss Lane ${lane}`};frontTossAssignments.push({player:name,block,lane})}));
   }
  }
  const frontTossBlocks=[...new Set(frontTossAssignments.map(item=>item.block))].sort((a,b)=>a-b);
  if(!feasibilityErrors.length){
   const machineSlots=Array.from({length:BLOCK_COUNT},(_,block)=>({block})),machineGroups=assignStationGroups(activeAttendees,machineSlots,(player,slot)=>isOpen(player,slot.block));
   if(!machineGroups)feasibilityErrors.push('Machine cannot be scheduled exactly once per player in groups of 2–3 with the selected attendance and availability.');
   else machineGroups.forEach((names,index)=>names.forEach(name=>{schedule[name][machineSlots[index].block]={activity:'Machine'}}));
  }
  attendees.forEach(player=>{
   for(let block=0;block<BLOCK_COUNT;block++)if(schedule[player.name][block]===null)schedule[player.name][block]={activity:'Drill'};
  });
  for(let block=0;block<BLOCK_COUNT;block++){
   const drillPlayers=attendees.filter(player=>schedule[player.name][block].activity==='Drill');
   if(drillPlayers.length===1&&activeAttendees.length>1){
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
  activeAttendees.forEach(player=>{
   if(!schedule[player.name].some(entry=>entry.activity.startsWith('Drill #')))feasibilityErrors.push(`${player.name} cannot receive mandatory drill work with this attendance and live-pitching combination.`);
  });
  const blocks=times.map((time,index)=>{
   const assignments={};
   attendees.forEach(player=>{
    const entry=schedule[player.name][index],label=entry.partner?`${entry.activity} — ${entry.partner}`:entry.activity;
    (assignments[label]||(assignments[label]=[])).push(player.name);
   });
   return {...time,assignments};
  });
  const catcherLoads=catchers.map(catcher=>({name:catcher.name,liveBlocks:schedule[catcher.name].filter(entry=>entry?.activity==='Catch Live').length}));
  return {attendance:attendees.length,players:attendees,startTime,durationMinutes:duration,blockMinutes,times,schedule,blocks,liveSessions,liveHitterRepeats,pitcherRepeats:repeatedPitchers.map(player=>player.name),fallbackWarnings,frontTossBlocks,frontTossAssignments,drillStations,catcherLoads,warnings,feasibilityErrors};
 }
 function validate(plan){
  const errors=[],BLOCK_COUNT=Number(plan?.times?.length)||DEFAULT_BLOCK_COUNT;
  if(!plan||![DEFAULT_BLOCK_COUNT,MAX_BLOCK_COUNT].includes(BLOCK_COUNT))errors.push('Schedule must contain ten blocks, or eleven when the emergency extension is approved.');
  if(!plan||!Array.isArray(plan.players)||!plan.schedule||typeof plan.schedule!=='object'){errors.push('Practice roster or schedule data is invalid.');return [...new Set(errors)]}
  const availablePlayers=plan.players.filter(player=>(player?.availableFromBlock??0)<(player?.availableUntilBlock??BLOCK_COUNT));
  if(availablePlayers.length<2)errors.push('Practice must have at least two available players.');
  Object.entries(plan?.schedule||{}).forEach(([name,entries])=>{
   if(!Array.isArray(entries)){errors.push(`${name} has an invalid schedule.`);return}
   if(entries.length!==BLOCK_COUNT||entries.some(entry=>!entry?.activity))errors.push(`${name} has downtime while present.`);
   const player=plan?.players?.find(item=>item.name===name),from=player?.availableFromBlock||0,until=player?.availableUntilBlock??BLOCK_COUNT;
   entries.forEach((entry,index)=>{const shouldBeAbsent=index<from||index>=until;if(shouldBeAbsent&&entry?.activity!=='Not Present')errors.push(`${name} is scheduled in Block ${index+1} while unavailable.`);if(!shouldBeAbsent&&entry?.activity==='Not Present')errors.push(`${name} is marked Not Present in Block ${index+1} while available.`)});
   if(!player?.prePracticeComplete&&from<until&&entries[from]?.activity!=='Stretch')errors.push(`${name} must complete Warm-Up in the first attended block.`);
   if(!player?.prePracticeComplete&&from+1<until&&entries[from+1]?.activity!=='Tee Work')errors.push(`${name} must complete Tee Work in the second attended block.`);
   if(entries.some((entry,index)=>entry?.activity==='Tee Work'&&(player?.prePracticeComplete||index!==from+1)))errors.push(`${name} has Tee Work outside the one required tee block.`);
   if(from<until&&entries.filter(entry=>entry.activity==='Machine').length!==1)errors.push(`${name} must complete Machine exactly once.`);
   if(from<until&&entries.filter(entry=>entry.activity.startsWith('Front Toss Lane')).length!==1)errors.push(`${name} must complete Front Toss exactly once.`);
   if(from<until&&!entries.some(entry=>entry.activity.startsWith('Drill #')))errors.push(`${name} is missing drill work.`);
   const drillEntries=entries.filter(entry=>entry.activity.startsWith('Drill #')).map(entry=>entry.activity);
   if(new Set(drillEntries).size!==drillEntries.length)errors.push(`${name} repeats a drill station.`);
   const liveHitCount=entries.filter(entry=>entry.activity==='Hit Live').length,expectedLiveHits=plan.liveHitterRepeats?.includes(name)?2:1;
   if(from<until&&plan.liveSessions?.length&&liveHitCount!==expectedLiveHits)errors.push(`${name} must complete live hitting exactly ${expectedLiveHits===1?'once':'twice'}.`);
  });
  Object.keys(plan?.schedule||{}).filter(name=>!(plan?.players||[]).some(player=>player.name===name)).forEach(name=>errors.push(`${name} is scheduled but is not in the attending-player list.`));
  (plan?.players||[]).forEach(player=>{
   if(!Object.prototype.hasOwnProperty.call(plan.schedule||{},player.name)){errors.push(`${player.name} is missing from the practice schedule.`);return}
   const entries=plan.schedule[player.name]||[];
   if(player.canPitch===false&&entries.some(entry=>entry?.activity==='Pitch Live'||entry?.activity==='Pitch Warm-Up'))errors.push(`${player.name} is Hitting Only but has pitching work assigned.`);
   if(player.canCatch===false&&entries.some(entry=>entry?.activity==='Catch Live'||entry?.activity==='Catch Warm-Up'))errors.push(`${player.name} is Not Catching but has catching work assigned.`);
   if(entries.filter(entry=>entry?.activity==='Catch Live').length>2)errors.push(`${player.name} catches more than two live blocks.`);
   if(entries.filter(entry=>entry?.activity==='Catch Warm-Up').length>1)errors.push(`${player.name} catches more than one pitching warm-up.`);
   if(player.requiresPitchWarmup&&plan.liveSessions?.some(session=>session.pitcher===player.name)){
    const warm=entries.findIndex(entry=>entry?.activity==='Pitch Warm-Up'),live=entries.findIndex(entry=>entry?.activity==='Pitch Live');
    if(warm<0||live<0||warm>=live||live-warm>2)errors.push(`${player.name}'s pitching warm-up is not within two blocks before live.`);
    const livePitchBlocks=entries.map((entry,index)=>entry?.activity==='Pitch Live'?index:-1).filter(index=>index>=0);
    if(livePitchBlocks.length===2&&livePitchBlocks[1]!==livePitchBlocks[0]+1)errors.push(`${player.name}'s two live pitching sessions must be consecutive.`);
   }
  });
  for(let block=0;block<BLOCK_COUNT;block++){
   const entries=Object.values(plan.schedule||{}).map(items=>items[block]);
   if(entries.filter(entry=>entry?.activity==='Pitch Warm-Up'&&entry?.partner==='Coach').length>1)errors.push(`Block ${block+1} assigns the warm-up coach to more than one pitcher.`);
   const machineCount=entries.filter(entry=>entry?.activity==='Machine').length;
   if(machineCount!==0&&(machineCount<2||machineCount>3))errors.push(`Block ${block+1} Machine must have 2–3 players.`);
   const frontCounts={};entries.filter(entry=>entry?.activity.startsWith('Front Toss Lane')).forEach(entry=>frontCounts[entry.activity]=(frontCounts[entry.activity]||0)+1);
   const frontFours=Object.values(frontCounts).filter(count=>count===4).length;
   if(Object.values(frontCounts).some(count=>count<2||count>4)||frontFours>1)errors.push(`Block ${block+1} each Front Toss lane must have 2–3 players, with at most one 4-player Front Toss lane allowed in the practice.`);
   if(plan.liveSessions?.some(session=>session.block===block)&&entries.some(entry=>entry?.activity.startsWith('Front Toss')))errors.push(`Block ${block+1} has Front Toss while live pitching is active.`);
   const drillCounts={};entries.filter(entry=>entry?.activity.startsWith('Drill #')).forEach(entry=>drillCounts[entry.activity]=(drillCounts[entry.activity]||0)+1);
   if(Object.values(drillCounts).some(count=>count>3||(count<2&&availablePlayers.length>1)))errors.push(`Block ${block+1} has a drill station without 2–3 players.`);
   if(Object.values(drillCounts).includes(1)&&Object.values(drillCounts).includes(3))errors.push(`Block ${block+1} must rebalance one- and three-player drill groups into two-player groups.`);
  }
  const totalFrontFours=Array.from({length:BLOCK_COUNT},(_,block)=>{const counts={};Object.values(plan.schedule||{}).map(items=>items[block]).filter(entry=>entry?.activity?.startsWith('Front Toss Lane')).forEach(entry=>counts[entry.activity]=(counts[entry.activity]||0)+1);return Object.values(counts).filter(count=>count===4).length}).reduce((a,b)=>a+b,0);
  if(totalFrontFours>1)errors.push('Practice uses more than one 4-player Front Toss block.');
  (plan?.liveSessions||[]).forEach(session=>{
   if(session.hitters.length<2||session.hitters.length>3)errors.push(`Block ${session.block+1} must have 2–3 live hitters.`);
   if(session.catcher==='Coach')errors.push(`Block ${session.block+1} assigns Coach as the live catcher.`);
  });
  const pitcherBlockCounts={};
  (plan?.liveSessions||[]).filter(session=>session.pitcher&&session.pitcher!=='Coach').forEach(session=>pitcherBlockCounts[session.pitcher]=(pitcherBlockCounts[session.pitcher]||0)+1);
  Object.entries(pitcherBlockCounts).forEach(([name,count])=>{if(count>2)errors.push(`${name} exceeds the two-block live pitching limit.`)});
  return [...new Set(errors)];
 }
 return {BLOCK_COUNT:DEFAULT_BLOCK_COUNT,DEFAULT_BLOCK_COUNT,MAX_BLOCK_COUNT,BLOCK_MINUTES,blockTimes,buildSchedule,validate};
});
