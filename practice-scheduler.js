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
  const rawPlayers=Array.isArray(players)?players:[],unnamedCount=rawPlayers.filter(player=>player&&!String(player.name||'').trim()).length;
  const invalidAvailability=rawPlayers.filter(player=>player&&String(player.name||'').trim()).filter(player=>{
   const rawFrom=player.availableFromBlock??0,rawUntil=player.availableUntilBlock??BLOCK_COUNT,from=Number(rawFrom),until=Number(rawUntil);
   return !Number.isInteger(from)||!Number.isInteger(until)||from<0||until<0||from>BLOCK_COUNT||until>BLOCK_COUNT||from>until;
  }).map(player=>player.name);
  const duplicateNames=[...new Set(attendees.map(player=>player.name).filter((name,index,names)=>names.indexOf(name)!==index))];
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
  if(unnamedCount)feasibilityErrors.push('Every attending player must have a name before HotB can build safely.');
  if(invalidAvailability.length)feasibilityErrors.push(`Practice has invalid availability for: ${[...new Set(invalidAvailability)].join(', ')}. Correct the arrival/departure information before building.`);
  if(duplicateNames.length)feasibilityErrors.push(`Practice has duplicate player names: ${duplicateNames.join(', ')}. Each attendee must be uniquely identified before HotB can build safely.`);
  if(activeAttendees.length<2)feasibilityErrors.push('At least two attending players are required because every hitting station must have 2–3 players.');
  // Removed unused recursive grouped-assignment solver from the production build path.
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
   // Live may use every block after the required Warm-Up/Tee opening: Blocks
   // 4-10 in the normal ten-block practice and Blocks 4-11 in the approved
   // eleven-block extension. Generate the pool directly from BLOCK_COUNT so the
   // production rule has one source of truth and cannot drift between comments,
   // tests, and the mobile Resolution path. Placement below is a finite pass over
   // this fixed pool; there is no retry or recursive search.
   const liveBlocks=Array.from({length:Math.max(0,BLOCK_COUNT-3)},(_,index)=>index+3),used=new Set(),placed=[];
   const pitcherCanUseLiveBlock=(pitcher,block)=>{
    if(!pitcher||!isOpen(pitcher,block))return !pitcher;
    if(!pitcher.requiresPitchWarmup)return true;
    // A pitcher must have at least one open block one or two blocks before Live.
    // This is only a feasibility look-ahead; the exact warm-up matcher below owns
    // coach/catcher resource allocation across all pitchers.
    return [block-1,block-2].some(warmBlock=>warmBlock>=2&&isOpen(pitcher,warmBlock));
   };
   const startsFor=group=>liveBlocks.filter(block=>group.every((pitcher,offset)=>liveBlocks.includes(block+offset)&&pitcherCanUseLiveBlock(pitcher,block+offset)));
   // Resolution 498: pitcher placement is itself a bounded exact matching problem.
   // A greedy "first free Live block" can consume the only non-Live blocks shared
   // by a late arrival and an early departure, making Front Toss look impossible.
   // Explore all legal starts for the most-constrained pitcher group instead.
   const remaining=groups.map((group,index)=>({group,index})),memo=new Set();
   const search=(left)=>{
    if(!left.length)return true;
    const key=left.map(item=>item.index).sort((a,b)=>a-b).join(',')+'|'+[...used].sort((a,b)=>a-b).join(',');
    if(memo.has(key))return false;
    let chosenAt=-1,choices=null;
    for(let i=0;i<left.length;i++){
     const possible=startsFor(left[i].group).filter(block=>left[i].group.every((_,offset)=>!used.has(block+offset)));
     if(!possible.length){memo.add(key);return false}
     if(choices===null||possible.length<choices.length){chosenAt=i;choices=possible}
    }
    const item=left[chosenAt],next=left.slice(0,chosenAt).concat(left.slice(chosenAt+1));
    // Prefer placements that leave the largest number of attendees open in the
    // remaining non-Live blocks. This is only ordering; exact backtracking remains
    // authoritative and will try every legal placement if necessary.
    choices.sort((a,b)=>{
     const score=block=>activeAttendees.reduce((n,player)=>n+(isOpen(player,block)?1:0),0);
     return score(a)-score(b)||b-a;
    });
    for(const start of choices){
     const additions=[];item.group.forEach((pitcher,offset)=>{const block=start+offset;used.add(block);additions.push({pitcher,liveBlock:block})});placed.push(...additions);
     if(search(next))return true;
     placed.splice(placed.length-additions.length,additions.length);additions.forEach(entry=>used.delete(entry.liveBlock));
    }
    memo.add(key);return false;
   };
   return search(remaining)?placed:null;
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
  // Resolution 496: warm-up assignment is a tiny exact matching problem.
  // With no available catchers every required warm-up uses Coach, and the old
  // session-order greedy pass could spend a scarce coach block that was the only
  // legal warm-up for a late-arriving pitcher. Solve all required pitcher warm-ups
  // together before committing any of them.
  const warmupPitchers=[],seenWarmupPitchers=new Set();
  sessionPlans.forEach(({pitcher,liveBlock,catcher})=>{
   if(!pitcher||!pitcher.requiresPitchWarmup||seenWarmupPitchers.has(pitcher.name))return;
   seenWarmupPitchers.add(pitcher.name);warmupPitchers.push({pitcher,liveBlock,catcher});
  });
  const warmAssignments=[],warmupCatcherLoads=new Map(orderedCatchers.map(catcher=>[catcher.name,0])),coachWarmupBlocks=new Set(),warmMemo=new Set();
  const warmOptionsFor=item=>{
   const options=[];
   for(const candidateBlock of [item.liveBlock-1,item.liveBlock-2]){
    if(candidateBlock<2||!isOpen(item.pitcher,candidateBlock))continue;
    const catcherChoices=[item.catcher,...orderedCatchers].filter((candidate,candidateIndex,list)=>candidate&&list.indexOf(candidate)===candidateIndex).sort((a,b)=>(a.isGuest===item.pitcher.isGuest?0:1)-(b.isGuest===item.pitcher.isGuest?0:1)||a.name.localeCompare(b.name));
    catcherChoices.forEach(candidate=>{if(candidate.name!==item.pitcher.name&&isOpen(candidate,candidateBlock))options.push({block:candidateBlock,catcher:candidate,partner:candidate.name})});
    options.push({block:candidateBlock,catcher:null,partner:'Coach'});
   }
   return options;
  };
  const warmSearch=remaining=>{
   if(!remaining.length)return true;
   let chosenIndex=-1,chosenOptions=null;
   for(let index=0;index<remaining.length;index++){
    const item=remaining[index],possible=warmOptionsFor(item).filter(option=>option.catcher?(warmupCatcherLoads.get(option.catcher.name)||0)<1:!coachWarmupBlocks.has(option.block));
    if(!possible.length)return false;
    if(chosenOptions===null||possible.length<chosenOptions.length){chosenIndex=index;chosenOptions=possible}
   }
   const item=remaining[chosenIndex],next=remaining.slice(0,chosenIndex).concat(remaining.slice(chosenIndex+1));
   chosenOptions.sort((a,b)=>(a.catcher?0:1)-(b.catcher?0:1)||b.block-a.block||(a.partner||'').localeCompare(b.partner||''));
   const stateKey=remaining.map(entry=>entry.pitcher.name).sort().join('|')+'#'+[...coachWarmupBlocks].sort().join(',')+'#'+[...warmupCatcherLoads.entries()].map(([name,count])=>name+':'+count).sort().join(',');
   if(warmMemo.has(stateKey))return false;
   for(const option of chosenOptions){
    if(option.catcher)warmupCatcherLoads.set(option.catcher.name,(warmupCatcherLoads.get(option.catcher.name)||0)+1);else coachWarmupBlocks.add(option.block);
    warmAssignments.push({item,option});
    if(warmSearch(next))return true;
    warmAssignments.pop();
    if(option.catcher)warmupCatcherLoads.set(option.catcher.name,(warmupCatcherLoads.get(option.catcher.name)||0)-1);else coachWarmupBlocks.delete(option.block);
   }
   warmMemo.add(stateKey);return false;
  };
  const warmupsOk=warmSearch(warmupPitchers);
  if(!warmupsOk&&warmupPitchers.length){
   const constrained=warmupPitchers.slice().sort((a,b)=>warmOptionsFor(a).length-warmOptionsFor(b).length)[0];
   feasibilityErrors.push(`${constrained.pitcher.name} cannot be assigned a pitching warm-up within two blocks before live with the available catchers and one warm-up coach.`);
  }else{
   warmAssignments.forEach(({item,option})=>{
    schedule[item.pitcher.name][option.block]={activity:'Pitch Warm-Up',partner:option.partner};
    if(option.catcher)schedule[option.catcher.name][option.block]={activity:'Catch Warm-Up',partner:item.pitcher.name};
   });
  }
  let liveHitterRepeats=[];
  if(liveSessions.length&&!feasibilityErrors.length){
   // Resolution 495: live hitting is a constrained matching problem, not a greedy
   // fill. Pitching, catching and warm-up assignments can fragment availability so
   // an early alphabetical choice may consume the only legal slot for another
   // player. Solve the required first live hit for every attendee exactly, then add
   // the minimum repeat hits needed to bring every session to two hitters.
   const players=activeAttendees.slice(),playerIndex=new Map(players.map((player,index)=>[player.name,index]));
   const sessionOptions=liveSessions.map(session=>players.map((player,index)=>({player,index})).filter(({player})=>session.pitcher!==player.name&&session.catcher!==player.name&&isOpen(player,session.block)).map(item=>item.index));
   const playerOptions=players.map((player,index)=>liveSessions.map((session,sessionIndex)=>sessionOptions[sessionIndex].includes(index)?sessionIndex:-1).filter(sessionIndex=>sessionIndex>=0));
   const assignments=Array.from({length:liveSessions.length},()=>[]),memo=new Set(),fullMask=((1<<players.length)-1)>>>0;
   const firstPass=(remaining)=>{
    if(!remaining)return true;
    const loads=assignments.map(group=>group.length),key=remaining+'|'+loads.join(',');
    if(memo.has(key))return false;
    let chosen=-1,options=null;
    for(let index=0;index<players.length;index++)if(remaining&(1<<index)){
     const possible=playerOptions[index].filter(sessionIndex=>assignments[sessionIndex].length<3);
     if(!possible.length){memo.add(key);return false}
     if(options===null||possible.length<options.length){chosen=index;options=possible}
    }
    options.sort((a,b)=>assignments[a].length-assignments[b].length||a-b);
    for(const sessionIndex of options){
     assignments[sessionIndex].push(chosen);
     if(firstPass((remaining&~(1<<chosen))>>>0))return true;
     assignments[sessionIndex].pop();
    }
    memo.add(key);return false;
   };
   const firstPassOk=players.length<=30&&firstPass(fullMask);
   let repeatsOk=firstPassOk;
   if(firstPassOk){
    // Sessions with fewer than two hitters need repeats. Choose distinct legal
    // attendees while preferring players who still have only their required first hit.
    for(let sessionIndex=0;sessionIndex<liveSessions.length&&repeatsOk;sessionIndex++){
     while(assignments[sessionIndex].length<2){
      const counts=players.map((_,index)=>assignments.reduce((n,group)=>n+(group.includes(index)?1:0),0));
      const candidate=sessionOptions[sessionIndex].filter(index=>!assignments[sessionIndex].includes(index)).sort((a,b)=>counts[a]-counts[b]||players[a].name.localeCompare(players[b].name))[0];
      if(candidate===undefined){repeatsOk=false;break}
      assignments[sessionIndex].push(candidate);
     }
    }
   }
   if(!repeatsOk){
    feasibilityErrors.push('The selected pitchers, catchers, arrival times and departure times cannot provide 2–3 hitters in every live block. Adjust availability or mark a pitcher Hitting Only and build again.');
   }else{
    assignments.forEach((group,sessionIndex)=>group.forEach(index=>{
     const player=players[index],session=liveSessions[sessionIndex];
     session.hitters.push(player.name);
     schedule[player.name][session.block]={activity:'Hit Live',partner:session.pitcher};
    }));
    const hitCounts=new Map(players.map((player,index)=>[player.name,assignments.reduce((n,group)=>n+(group.includes(index)?1:0),0)]));
    liveHitterRepeats=players.filter(player=>(hitCounts.get(player.name)||0)>1).map(player=>player.name);
    if(liveHitterRepeats.length)fallbackWarnings.push(`${liveHitterRepeats.join(', ')} ${liveHitterRepeats.length===1?'will receive':'will each receive'} a second live-hitting session so every live block has at least two hitters.`);
   }
  }
  const liveBlocks=new Set(liveSessions.map(session=>session.block));
  const frontTossAssignments=[];
  // Resolution 498: Front Toss and Machine share the same remaining-open-block
  // resource. Solving Front Toss first and Machine second can falsely reject a
  // practice even when another valid Front Toss partition leaves Machine feasible.
  // The station solver below can therefore receive a continuation predicate: a
  // complete Front Toss partition is accepted only when the remaining schedule can
  // still satisfy Machine exactly once for every attendee.
  // Resolution 409: fixed-station assignment is a bounded deterministic pass.
  // Never search/retry the same 13-player state after catcher/live resolution.
  function assignStationGroups(playersToAssign,slots,eligible,allowOneFrontTossFour=false,acceptSolution=null){
   // Resolution 494: solve station grouping as a tiny bounded exact-cover problem
   // instead of greedily filling slots and trying to repair singles afterward.
   // The greedy repair could reject a valid Machine layout when Live/Front Toss had
   // already fragmented player availability. There are at most 13 players and 20
   // Front Toss slots (10 Machine slots), so a deterministic memoized search over
   // the player bitmask is both complete and tightly bounded.
   const players=playersToAssign.slice(),count=players.length;
   if(!count)return Array.from({length:slots.length},()=>[]);
   if(count>30)return null;
   const eligibleMasks=slots.map((slot,index)=>{
    let mask=0;
    players.forEach((player,playerIndex)=>{if(eligible(player,slot,index,[]))mask|=(1<<playerIndex)});
    return mask>>>0;
   });
   const fullMask=((1<<count)-1)>>>0,memo=new Set();
   const popcount=value=>{let n=value>>>0,c=0;while(n){n&=n-1;c++}return c};
   const combinations=(mask,size)=>{
    const bits=[];for(let i=0;i<count;i++)if(mask&(1<<i))bits.push(i);
    const out=[];
    const choose=(at,left,value)=>{if(left===0){out.push(value>>>0);return}for(let i=at;i<=bits.length-left;i++)choose(i+1,left-1,value|(1<<bits[i]))};
    choose(0,size,0);return out;
   };
   const search=(remaining,usedSlots,fourUsed)=>{
    if(!remaining)return [];
    const key=remaining+'|'+usedSlots+'|'+(fourUsed?1:0);if(memo.has(key))return null;
    // Pick the most constrained remaining player. Slots are independent station
    // opportunities, not chronological steps: a later chosen group may legitimately
    // use an earlier block. Track used slots as a bitmask instead of forcing slot
    // indices to increase, which incorrectly discarded valid Machine partitions.
    let anchor=-1,anchorSlots=null;
    for(let playerIndex=0;playerIndex<count;playerIndex++)if(remaining&(1<<playerIndex)){
     const possible=[];for(let slotIndex=0;slotIndex<slots.length;slotIndex++)if(!(usedSlots&(1<<slotIndex))&&(eligibleMasks[slotIndex]&(1<<playerIndex)))possible.push(slotIndex);
     if(!possible.length){memo.add(key);return null}
     if(anchorSlots===null||possible.length<anchorSlots.length){anchor=playerIndex;anchorSlots=possible}
    }
    for(const slotIndex of anchorSlots){
     const available=(eligibleMasks[slotIndex]&remaining)>>>0;
     const sizes=allowOneFrontTossFour&&!fourUsed?[3,2,4]:[3,2];
     for(const size of sizes){
      if(popcount(available)<size)continue;
      const others=available&~(1<<anchor);
      for(const rest of combinations(others,size-1)){
       const groupMask=(rest|(1<<anchor))>>>0;
       // Group-level eligibility can depend on peers. Recheck each member against
       // the actual proposed group rather than assuming the empty-group mask is enough.
       const names=players.filter((_,i)=>groupMask&(1<<i)).map(player=>player.name);
       if(!players.every((player,i)=>!(groupMask&(1<<i))||eligible(player,slots[slotIndex],slotIndex,names.filter(name=>name!==player.name))))continue;
       const tail=search((remaining&~groupMask)>>>0,(usedSlots|(1<<slotIndex))>>>0,fourUsed||size===4);
       if(tail)return [{slotIndex,names},...tail];
      }
     }
    }
    memo.add(key);return null;
   };
   let solution=search(fullMask,0,false);
   if(!solution)return null;
   const materialize=value=>{const assignments=Array.from({length:slots.length},()=>[]);value.forEach(({slotIndex,names})=>{assignments[slotIndex]=names});return assignments};
   if(!acceptSolution)return materialize(solution);
   // A continuation-aware caller may reject an otherwise valid exact cover because
   // it consumes scarce blocks needed by the next mandatory station. Enumerate the
   // same bounded exact-cover tree while pruning rejected complete leaves.
   memo.clear();
   const searchAccepted=(remaining,usedSlots,fourUsed)=>{
    if(remaining===0){const value=current.slice();return acceptSolution(materialize(value))?value:null}
    const key=remaining+'|'+usedSlots+'|'+(fourUsed?1:0);if(memo.has(key))return null;
    let anchor=-1,anchorSlots=null;
    for(let playerIndex=0;playerIndex<count;playerIndex++)if(remaining&(1<<playerIndex)){
     const possible=[];for(let slotIndex=0;slotIndex<slots.length;slotIndex++)if(!(usedSlots&(1<<slotIndex))&&(eligibleMasks[slotIndex]&(1<<playerIndex)))possible.push(slotIndex);
     if(!possible.length){memo.add(key);return null}
     if(anchorSlots===null||possible.length<anchorSlots.length){anchor=playerIndex;anchorSlots=possible}
    }
    for(const slotIndex of anchorSlots){
     const available=(eligibleMasks[slotIndex]&remaining)>>>0,sizes=allowOneFrontTossFour&&!fourUsed?[3,2,4]:[3,2];
     for(const size of sizes){
      if(popcount(available)<size)continue;
      const others=available&~(1<<anchor);
      for(const rest of combinations(others,size-1)){
       const groupMask=(rest|(1<<anchor))>>>0,names=players.filter((_,i)=>groupMask&(1<<i)).map(player=>player.name);
       if(!players.every((player,i)=>!(groupMask&(1<<i))||eligible(player,slots[slotIndex],slotIndex,names.filter(name=>name!==player.name))))continue;
       current.push({slotIndex,names});
       const tail=searchAccepted((remaining&~groupMask)>>>0,(usedSlots|(1<<slotIndex))>>>0,fourUsed||size===4);
       if(tail)return tail;
       current.pop();
      }
     }
    }
    memo.add(key);return null;
   };
   const current=[];solution=searchAccepted(fullMask,0,false);return solution?materialize(solution):null;
  }
  const prePracticePlayers=activeAttendees.filter(player=>player.prePracticeComplete),reserveEarlyFront=prePracticePlayers.length>=2&&prePracticePlayers.length<=12;
  const frontTossCandidates=Array.from({length:BLOCK_COUNT},(_,block)=>block).filter(block=>!liveBlocks.has(block));
  const orderedFrontBlocks=frontTossCandidates.slice().sort((a,b)=>(a>=8?0:1)-(b>=8?0:1)||a-b),frontSlots=orderedFrontBlocks.flatMap(block=>[{block,lane:1},{block,lane:2}]);
  if(!feasibilityErrors.length){
   const eligibleFront=(player,slot)=>isOpen(player,slot.block)&&(!reserveEarlyFront||(player.prePracticeComplete?slot.block<2:slot.block>=2));
   const leavesMachineFeasible=frontGroups=>{
    const occupied=Object.fromEntries(activeAttendees.map(player=>[player.name,new Set()]));
    frontGroups.forEach((names,index)=>names.forEach(name=>occupied[name].add(frontSlots[index].block)));
    const machineSlots=Array.from({length:BLOCK_COUNT},(_,block)=>({block}));
    return !!assignStationGroups(activeAttendees,machineSlots,(player,slot)=>isOpen(player,slot.block)&&!occupied[player.name].has(slot.block),false);
   };
   let frontGroups=assignStationGroups(activeAttendees,frontSlots,eligibleFront,false,leavesMachineFeasible);
   if(!frontGroups)frontGroups=assignStationGroups(activeAttendees,frontSlots,eligibleFront,true,leavesMachineFeasible);
   if(!frontGroups)feasibilityErrors.push('Front toss cannot be scheduled exactly once per player while keeping at least 2 players at every station, even after using the one allowed 4-player Front Toss block.');
   else{
    const fourIndex=frontGroups.findIndex(names=>names.length===4);
    if(fourIndex>=0){const slot=frontSlots[fourIndex];fallbackWarnings.push(`Block ${slot.block+1} uses 4 players at Front Toss Lane ${slot.lane}. This is the one automatic 4-player Front Toss block allowed for this practice.`)}
    frontGroups.forEach((names,index)=>names.forEach(name=>{const {block,lane}=frontSlots[index];schedule[name][block]={activity:`Front Toss Lane ${lane}`};frontTossAssignments.push({player:name,block,lane})}));
   }
  }
  const frontTossBlocks=[...new Set(frontTossAssignments.map(item=>item.block))].sort((a,b)=>a-b);
  if(!feasibilityErrors.length){
   const machineSlots=Array.from({length:BLOCK_COUNT},(_,block)=>({block}));
   const machineGroups=assignStationGroups(activeAttendees,machineSlots,(player,slot)=>isOpen(player,slot.block),false);
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
  // Drill numbering is also a single bounded pass. Station IDs persist across
  // blocks, but a player receives a station she has not already used whenever possible.
  const drillSlotsByPlayer=Object.fromEntries(attendees.map(player=>[player.name,schedule[player.name].map((entry,index)=>entry.activity==='Drill'?index:-1).filter(index=>index>=0)]));
  const drillPlayersByBlock=Array.from({length:BLOCK_COUNT},(_,block)=>attendees.filter(player=>schedule[player.name][block].activity==='Drill'));
  // Drill assignment is bounded by the number of practice blocks. Start with
  // the minimum station count, then increase only when the no-repeat constraint
  // cannot be satisfied. This restores the no-repeat guarantee without any
  // unbounded search: at most BLOCK_COUNT+1 deterministic passes are possible.
  let drillStations=Math.max(0,...Object.values(drillSlotsByPlayer).map(slots=>slots.length),...drillPlayersByBlock.map(list=>Math.ceil(list.length/3))),drillsAssigned=false;
  for(let pass=0;pass<=BLOCK_COUNT&&drillStations<=BLOCK_COUNT&&!drillsAssigned;pass++,drillStations++){
   attendees.forEach(player=>schedule[player.name].forEach(entry=>{if(entry.activity.startsWith('Drill #'))entry.activity='Drill'}));
   const usedByPlayer=Object.fromEntries(attendees.map(player=>[player.name,new Set()]));
   let failed=false;
   for(let block=0;block<BLOCK_COUNT&&!failed;block++){
    const drillPlayers=drillPlayersByBlock[block].slice().sort((a,b)=>drillSlotsByPlayer[b.name].length-drillSlotsByPlayer[a.name].length||a.name.localeCompare(b.name));
    if(!drillPlayers.length)continue;
    const groupSizes=drillPlayers.length===1?[1]:drillPlayers.length%2?[3,...Array((drillPlayers.length-3)/2).fill(2)]:Array(drillPlayers.length/2).fill(2);
    const groups=[];let cursor=0;
    for(const size of groupSizes){groups.push(drillPlayers.slice(cursor,cursor+size));cursor+=size}
    const available=Array.from({length:drillStations},(_,index)=>index);
    groups.sort((a,b)=>{
     const ao=available.filter(station=>a.every(player=>!usedByPlayer[player.name].has(station))).length;
     const bo=available.filter(station=>b.every(player=>!usedByPlayer[player.name].has(station))).length;
     return ao-bo;
    });
    for(const group of groups){
     const at=available.findIndex(station=>group.every(player=>!usedByPlayer[player.name].has(station)));
     if(at<0){failed=true;break}
     const station=available.splice(at,1)[0];
     group.forEach(player=>{usedByPlayer[player.name].add(station);schedule[player.name][block].activity=`Drill #${station+1}`});
    }
   }
   if(!failed){drillsAssigned=true;break}
  }
  if(!drillsAssigned)warnings.push('The drill stations could not be assigned without a repeat.');
  activeAttendees.forEach(player=>{
   if(!schedule[player.name].some(entry=>entry.activity.startsWith('Drill #'))){
    // A late/limited pitcher can legitimately spend every remaining open block on
    // required warm-up, Tee, Live, Machine and Front Toss. Those are all active
    // practice work; do not manufacture a Resolution solely because no numbered
    // open-area drill fits into the shortened attendance window.
    const limited=(player.availableFromBlock??0)>0||(player.availableUntilBlock??BLOCK_COUNT)<BLOCK_COUNT;
    if(limited)warnings.push(`${player.name} has no numbered drill station because required work fills the available practice blocks.`);
    else feasibilityErrors.push(`${player.name} cannot receive mandatory drill work with this attendance and live-pitching combination.`);
   }
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
  const playerNames=plan.players.map(player=>player?.name).filter(Boolean);
  if(playerNames.length!==plan.players.length)errors.push('Every attending player must have a name before HotB can verify the practice.');
  if(new Set(playerNames).size!==playerNames.length)errors.push('Practice roster contains duplicate player names.');
  plan.players.forEach(player=>{
   const from=Number(player?.availableFromBlock??0),until=Number(player?.availableUntilBlock??BLOCK_COUNT);
   if(!Number.isInteger(from)||!Number.isInteger(until)||from<0||until<0||from>BLOCK_COUNT||until>BLOCK_COUNT||from>until)errors.push(`${player?.name||'An attendee'} has invalid practice availability.`);
  });
  const availablePlayers=plan.players.filter(player=>(player?.availableFromBlock??0)<(player?.availableUntilBlock??BLOCK_COUNT));
  if(availablePlayers.length<2)errors.push('Practice must have at least two available players.');
  Object.entries(plan?.schedule||{}).forEach(([name,entries])=>{
   if(!Array.isArray(entries)){errors.push(`${name} has an invalid schedule.`);return}
   if(entries.length!==BLOCK_COUNT){errors.push(`${name} has an invalid number of practice blocks.`);return}
   if(entries.some(entry=>!entry?.activity))errors.push(`${name} has downtime while present.`);
   const player=plan?.players?.find(item=>item.name===name),from=player?.availableFromBlock||0,until=player?.availableUntilBlock??BLOCK_COUNT;
   entries.forEach((entry,index)=>{const shouldBeAbsent=index<from||index>=until;if(shouldBeAbsent&&entry?.activity!=='Not Present')errors.push(`${name} is scheduled in Block ${index+1} while unavailable.`);if(!shouldBeAbsent&&entry?.activity==='Not Present')errors.push(`${name} is marked Not Present in Block ${index+1} while available.`)});
   if(!player?.prePracticeComplete&&from<until&&entries[from]?.activity!=='Stretch')errors.push(`${name} must complete Warm-Up in the first attended block.`);
   if(!player?.prePracticeComplete&&from+1<until&&entries[from+1]?.activity!=='Tee Work')errors.push(`${name} must complete Tee Work in the second attended block.`);
   if(entries.some((entry,index)=>entry?.activity==='Tee Work'&&(player?.prePracticeComplete||index!==from+1)))errors.push(`${name} has Tee Work outside the one required tee block.`);
   if(from<until&&entries.filter(entry=>entry.activity==='Machine').length!==1)errors.push(`${name} must complete Machine exactly once.`);
   if(from<until&&entries.filter(entry=>entry.activity.startsWith('Front Toss Lane')).length!==1)errors.push(`${name} must complete Front Toss exactly once.`);
   if(from<until&&!entries.some(entry=>entry.activity.startsWith('Drill #'))){
    const limited=from>0||until<BLOCK_COUNT;
    if(!limited)errors.push(`${name} is missing drill work.`);
   }
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
   if(player.isPitcher&&player.canPitch!==false&&player.requiresPitchWarmup===false&&entries.some(entry=>entry?.activity==='Pitch Warm-Up'))errors.push(`${player.name} is marked No Pitch Warm-Up but has pitching warm-up assigned.`);
   if(player.isCatcher&&player.canCatch===false&&entries.some(entry=>entry?.activity==='Catch Warm-Up'||entry?.activity==='Catch Live'))errors.push(`${player.name} is marked Not Catching but has catcher work assigned.`);
   entries.forEach((entry,block)=>{
    if(entry?.activity==='Pitch Warm-Up'){
     if(!player.isPitcher||player.canPitch===false||player.requiresPitchWarmup===false)errors.push(`${player.name} has Pitch Warm-Up in Block ${block+1} but is not eligible for pitching warm-up.`);
     if(block<(player.availableFromBlock??0)||block>=(player.availableUntilBlock??BLOCK_COUNT))errors.push(`${player.name} has Pitch Warm-Up in Block ${block+1} while unavailable.`);
     if(!entry.partner)errors.push(`${player.name}'s Pitch Warm-Up in Block ${block+1} is missing a catcher/coach partner.`);
     else if(entry.partner!=='Coach'){
      const partner=plan.players.find(item=>item.name===entry.partner),partnerEntry=plan.schedule?.[entry.partner]?.[block];
      if(!partner||!partner.isCatcher||partner.canCatch===false)errors.push(`${player.name}'s Pitch Warm-Up in Block ${block+1} uses an ineligible catcher.`);
      if(partnerEntry?.activity!=='Catch Warm-Up'||partnerEntry?.partner!==player.name)errors.push(`${player.name}'s Pitch Warm-Up in Block ${block+1} does not match the catcher's warm-up assignment.`);
     }
    }
    if(entry?.activity==='Catch Warm-Up'){
     if(!player.isCatcher||player.canCatch===false)errors.push(`${player.name} has Catch Warm-Up in Block ${block+1} but is not eligible to catch.`);
     if(block<(player.availableFromBlock??0)||block>=(player.availableUntilBlock??BLOCK_COUNT))errors.push(`${player.name} has Catch Warm-Up in Block ${block+1} while unavailable.`);
     const pitcher=plan.players.find(item=>item.name===entry.partner),pitcherEntry=plan.schedule?.[entry.partner]?.[block];
     if(!pitcher||!pitcher.isPitcher||pitcher.canPitch===false||pitcher.requiresPitchWarmup===false)errors.push(`${player.name}'s Catch Warm-Up in Block ${block+1} is not paired with an eligible pitcher.`);
     if(pitcherEntry?.activity!=='Pitch Warm-Up'||pitcherEntry?.partner!==player.name)errors.push(`${player.name}'s Catch Warm-Up in Block ${block+1} does not match the pitcher's warm-up assignment.`);
    }
   });
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
   const namedEntries=(plan.players||[]).map(player=>({player,entry:plan.schedule?.[player.name]?.[block]}));
   namedEntries.forEach(({player,entry})=>{
    if(entry?.activity==='Machine Feed'&&!namedEntries.some(item=>item.entry?.activity==='Machine'))errors.push(`${player.name} has Machine Feed in Block ${block+1} without an active Machine station.`);
    if(entry?.activity==='Front Toss Support'&&!namedEntries.some(item=>item.entry?.activity?.startsWith('Front Toss Lane')))errors.push(`${player.name} has Front Toss Support in Block ${block+1} without an active Front Toss station.`);
    if(entry?.activity==='Live Pitching Support'&&!(plan.liveSessions||[]).some(session=>Number(session.block)===block))errors.push(`${player.name} has Live Pitching Support in Block ${block+1} without an active live session.`);
    if(entry?.activity==='Equipment / Ball Reset'){
     const hasSupportedStation=namedEntries.some(item=>item.entry?.activity==='Machine'||item.entry?.activity?.startsWith('Front Toss Lane'))||(plan.liveSessions||[]).some(session=>Number(session.block)===block);
     if(hasSupportedStation)errors.push(`${player.name} is assigned Equipment / Ball Reset in Block ${block+1} even though a station support role is available.`);
    }
   });
   const drillCounts={};entries.filter(entry=>entry?.activity.startsWith('Drill #')).forEach(entry=>drillCounts[entry.activity]=(drillCounts[entry.activity]||0)+1);
   if(Object.values(drillCounts).some(count=>count>3||(count<2&&availablePlayers.length>1)))errors.push(`Block ${block+1} has a drill station without 2–3 players.`);
   if(Object.values(drillCounts).includes(1)&&Object.values(drillCounts).includes(3))errors.push(`Block ${block+1} must rebalance one- and three-player drill groups into two-player groups.`);
  }
  for(let block=0;block<BLOCK_COUNT;block++){
   const liveForBlock=(plan.liveSessions||[]).filter(session=>Number(session.block)===block);
   const liveRoleNames=new Set();
   liveForBlock.forEach(session=>{
    [session.pitcher,session.catcher,...(Array.isArray(session.hitters)?session.hitters:[])].filter(name=>name&&name!=='9Square'&&name!=='Coach').forEach(name=>{
     if(liveRoleNames.has(name))errors.push(`${name} is assigned to more than one live role/session in Block ${block+1}.`);
     liveRoleNames.add(name);
    });
   });
  }
  for(let block=0;block<BLOCK_COUNT;block++){
   const liveForBlock=(plan.liveSessions||[]).filter(session=>Number(session.block)===block);
   const scheduleLivePitchers=[],scheduleLiveCatchers=[],scheduleLiveHitters=[];
   (plan.players||[]).forEach(player=>{
    const activity=plan.schedule?.[player.name]?.[block]?.activity;
    if(activity==='Pitch Live')scheduleLivePitchers.push(player.name);
    if(activity==='Catch Live')scheduleLiveCatchers.push(player.name);
    if(activity==='Hit Live')scheduleLiveHitters.push(player.name);
   });
   scheduleLivePitchers.forEach(name=>{if(!liveForBlock.some(session=>session.pitcher===name))errors.push(`${name} has Pitch Live in Block ${block+1} without a matching live-session record.`)});
   scheduleLiveCatchers.forEach(name=>{if(!liveForBlock.some(session=>session.catcher===name))errors.push(`${name} has Catch Live in Block ${block+1} without a matching live-session record.`)});
   scheduleLiveHitters.forEach(name=>{if(!liveForBlock.some(session=>Array.isArray(session.hitters)&&session.hitters.includes(name)))errors.push(`${name} has Hit Live in Block ${block+1} without a matching live-session record.`)});
  }
  const totalFrontFours=Array.from({length:BLOCK_COUNT},(_,block)=>{const counts={};Object.values(plan.schedule||{}).map(items=>items[block]).filter(entry=>entry?.activity?.startsWith('Front Toss Lane')).forEach(entry=>counts[entry.activity]=(counts[entry.activity]||0)+1);return Object.values(counts).filter(count=>count===4).length}).reduce((a,b)=>a+b,0);
  if(totalFrontFours>1)errors.push('Practice uses more than one 4-player Front Toss block.');
  (plan?.liveSessions||[]).forEach(session=>{
   const block=Number(session.block),hitters=Array.isArray(session.hitters)?session.hitters:[],pitcher=plan.players.find(player=>player.name===session.pitcher),catcher=plan.players.find(player=>player.name===session.catcher);
   if(!Number.isInteger(block)||block<0||block>=BLOCK_COUNT){errors.push('Live session has an invalid block assignment.');return}
   if(hitters.length<2||hitters.length>3)errors.push(`Block ${block+1} must have 2–3 live hitters.`);
   if(session.catcher==='Coach')errors.push(`Block ${block+1} assigns Coach as the live catcher.`);
   if(!session.pitcher)errors.push(`Block ${block+1} is missing a live pitcher.`);
   else if(session.pitcher==='Coach')errors.push(`Block ${block+1} assigns Coach as the live pitcher.`);
   else if(!pitcher)errors.push(`Block ${block+1} uses a live pitcher who is not attending.`);
   else{
    if(pitcher.canPitch===false||!pitcher.isPitcher)errors.push(`${pitcher.name} is not eligible to pitch live in Block ${block+1}.`);
    if(block<(pitcher.availableFromBlock??0)||block>=(pitcher.availableUntilBlock??BLOCK_COUNT))errors.push(`${pitcher.name} pitches live in Block ${block+1} while unavailable.`);
   }
   if(!session.catcher)errors.push(`Block ${block+1} is missing a live catcher.`);
   else if(session.catcher!=='9Square'&&session.catcher!=='Coach'){
    if(!catcher)errors.push(`Block ${block+1} uses a live catcher who is not attending.`);
    else{
     if(catcher.canCatch===false||!catcher.isCatcher)errors.push(`${catcher.name} is not eligible to catch live in Block ${block+1}.`);
     if(block<(catcher.availableFromBlock??0)||block>=(catcher.availableUntilBlock??BLOCK_COUNT))errors.push(`${catcher.name} catches live in Block ${block+1} while unavailable.`);
    }
   }
   const uniqueHitters=new Set(hitters);
   if(uniqueHitters.size!==hitters.length)errors.push(`Block ${block+1} repeats the same hitter in one live session.`);
   hitters.forEach(name=>{
    const hitter=plan.players.find(player=>player.name===name);
    if(name===session.pitcher)errors.push(`${name} cannot pitch and hit in the same live session in Block ${block+1}.`);
    if(name===session.catcher)errors.push(`${name} cannot catch and hit in the same live session in Block ${block+1}.`);
    if(!hitter)errors.push(`Block ${block+1} uses live hitter ${name} who is not attending.`);
    else if(block<(hitter.availableFromBlock??0)||block>=(hitter.availableUntilBlock??BLOCK_COUNT))errors.push(`${name} hits live in Block ${block+1} while unavailable.`);
   });
   if(session.pitcher&&session.catcher&&session.pitcher===session.catcher)errors.push(`${session.pitcher} cannot pitch and catch in the same live session in Block ${block+1}.`);
   const scheduledPitcher=plan.schedule?.[session.pitcher]?.[block]?.activity;
   if(session.pitcher&&session.pitcher!=='Coach'&&scheduledPitcher!=='Pitch Live')errors.push(`${session.pitcher}'s live-session record does not match Pitch Live in Block ${block+1}.`);
   if(session.catcher&&session.catcher!=='9Square'&&session.catcher!=='Coach'){
    const scheduledCatcher=plan.schedule?.[session.catcher]?.[block]?.activity;
    if(scheduledCatcher!=='Catch Live')errors.push(`${session.catcher}'s live-session record does not match Catch Live in Block ${block+1}.`);
   }
   hitters.forEach(name=>{
    const scheduledHitter=plan.schedule?.[name]?.[block]?.activity;
    if(scheduledHitter!=='Hit Live')errors.push(`${name}'s live-session record does not match Hit Live in Block ${block+1}.`);
   });
  });
  (plan.players||[]).forEach(player=>{
   const entries=plan.schedule?.[player.name]||[];
   entries.forEach((entry,block)=>{
    if(entry?.activity==='Pitch Live'){
     if(!player.isPitcher||player.canPitch===false)errors.push(`${player.name} has Pitch Live in Block ${block+1} but is not eligible to pitch.`);
     if(block<(player.availableFromBlock??0)||block>=(player.availableUntilBlock??BLOCK_COUNT))errors.push(`${player.name} has Pitch Live in Block ${block+1} while unavailable.`);
    }
    if(entry?.activity==='Catch Live'){
     if(!player.isCatcher||player.canCatch===false)errors.push(`${player.name} has Catch Live in Block ${block+1} but is not eligible to catch.`);
     if(block<(player.availableFromBlock??0)||block>=(player.availableUntilBlock??BLOCK_COUNT))errors.push(`${player.name} has Catch Live in Block ${block+1} while unavailable.`);
    }
    if(entry?.activity==='Hit Live'&&(block<(player.availableFromBlock??0)||block>=(player.availableUntilBlock??BLOCK_COUNT)))errors.push(`${player.name} has Hit Live in Block ${block+1} while unavailable.`);
   });
  });
  for(let block=0;block<BLOCK_COUNT;block++){
   const liveForBlock=(plan.liveSessions||[]).filter(session=>Number(session.block)===block);
   const scheduleRoles=(plan.players||[]).map(player=>({name:player.name,activity:plan.schedule?.[player.name]?.[block]?.activity})).filter(item=>['Pitch Live','Catch Live','Hit Live'].includes(item.activity));
   const expectedRoleCount=liveForBlock.reduce((sum,session)=>sum+1+(session.catcher&&session.catcher!=='9Square'&&session.catcher!=='Coach'?1:0)+(Array.isArray(session.hitters)?session.hitters.length:0),0);
   if(scheduleRoles.length!==expectedRoleCount)errors.push(`Block ${block+1} live-session role count does not match the practice schedule.`);
   const roleKeys=new Set();
   liveForBlock.forEach(session=>{
    if(session.pitcher&&session.pitcher!=='Coach')roleKeys.add('Pitch Live|'+session.pitcher);
    if(session.catcher&&session.catcher!=='9Square'&&session.catcher!=='Coach')roleKeys.add('Catch Live|'+session.catcher);
    (Array.isArray(session.hitters)?session.hitters:[]).forEach(name=>roleKeys.add('Hit Live|'+name));
   });
   scheduleRoles.forEach(item=>{if(!roleKeys.has(item.activity+'|'+item.name))errors.push(`${item.name} has ${item.activity} in Block ${block+1} without the exact matching live role.`)});
  }
  const pitcherBlockCounts={};
  (plan?.liveSessions||[]).filter(session=>session.pitcher&&session.pitcher!=='Coach').forEach(session=>pitcherBlockCounts[session.pitcher]=(pitcherBlockCounts[session.pitcher]||0)+1);
  Object.entries(pitcherBlockCounts).forEach(([name,count])=>{if(count>2)errors.push(`${name} exceeds the two-block live pitching limit.`)});
  return [...new Set(errors)];
 }
 return {BLOCK_COUNT:DEFAULT_BLOCK_COUNT,DEFAULT_BLOCK_COUNT,MAX_BLOCK_COUNT,BLOCK_MINUTES,blockTimes,buildSchedule,validate};
});
