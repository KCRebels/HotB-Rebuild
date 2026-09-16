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
  const label=minutes=>{const normalized=(minutes+1440)%1440,h=Math.floor(normalized/60),m=normalized%60;return `${h%12||12}:${pad(m)}${h<12?'a':'p'}`};
  return Array.from({length:BLOCK_COUNT},(_,index)=>({block:index+1,start:label(start+index*blockMinutes),end:label(start+(index+1)*blockMinutes)}));
 }
 function buildSchedule(players,startTime='18:00',durationMinutes=120,options={}){
  const attendees=(players||[]).filter(player=>player&&player.name).map(player=>{
   const from=Math.max(0,Math.min(BLOCK_COUNT,Number(player.availableFromBlock)||0));
   const until=Math.max(from,Math.min(BLOCK_COUNT,Number.isFinite(Number(player.availableUntilBlock))?Number(player.availableUntilBlock):BLOCK_COUNT));
   const prePracticeComplete=!!player.prePracticeComplete||!!player.isTeamJenkins||player.teamName==='Team Jenkins';
   return {...player,isGuest:!!player.isGuest,isPitcher:!!player.isPitcher,isCatcher:!!player.isCatcher,prePracticeComplete,canPitch:!!player.isPitcher&&player.canPitch!==false,requiresPitchWarmup:!!player.isPitcher&&player.canPitch!==false&&player.requiresPitchWarmup!==false,canCatch:!!player.isCatcher&&player.canCatch!==false,availableFromBlock:from,availableUntilBlock:until};
  });
  const duration=Math.max(10,Math.round((Number(durationMinutes)||120)/10)*10),blockMinutes=duration/BLOCK_COUNT;
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
  function groupedAssignment(playersToAssign,slots,eligible,requireAllSlots=false){
   const keyFor=player=>player.assignmentKey||player.name;
   const assignments=Array(slots.length).fill(null).map(()=>[]),remaining=new Set(playersToAssign.map(keyFor));
   const byName=Object.fromEntries(playersToAssign.map(player=>[keyFor(player),player]));
   function solve(){
    if(!remaining.size)return assignments.every(group=>(!requireAllSlots&&group.length===0)||group.length===2||group.length===3);
    const openNames=[...remaining],name=openNames.sort((a,b)=>{const options=playerName=>slots.filter((slot,index)=>assignments[index].length<3&&eligible(byName[playerName],slot,index,assignments[index])).length;return options(a)-options(b)||a.localeCompare(b)})[0],player=byName[name];
    const candidates=slots.map((slot,index)=>({slot,index,count:assignments[index].length})).filter(item=>item.count<3&&eligible(player,item.slot,item.index,assignments[item.index])).sort((a,b)=>{const priority=count=>count===1?0:count===2?1:2;return priority(a.count)-priority(b.count)||a.index-b.index});
    const triedEmpty=new Set();
    for(const candidate of candidates){
     if(candidate.count===0){const signature=String(candidate.slot.block);if(triedEmpty.has(signature))continue;triedEmpty.add(signature)}
     assignments[candidate.index].push(name);remaining.delete(name);
     const minimumNeeded=assignments.reduce((sum,group)=>sum+(group.length===1?1:requireAllSlots&&group.length===0?2:0),0),capacity=assignments.reduce((sum,group)=>sum+(group.length?3-group.length:3),0);
     if(minimumNeeded<=remaining.size&&capacity>=remaining.size&&solve())return true;
     remaining.add(name);assignments[candidate.index].pop();
    }
    return false;
   }
   return solve()?assignments:null;
  }
  const pitchers=attendees.filter(player=>player.canPitch),catchers=attendees.filter(player=>player.canCatch),liveSessions=[];
  const coachPitch=!pitchers.length&&options.noPitchersMode==='coach';
  if(!pitchers.length&&!coachPitch)warnings.push('Live pitching was replaced because no pitchers are attending.');
  const today=new Date(),todayDate=Date.UTC(today.getFullYear(),today.getMonth(),today.getDate()),weekNumber=Math.floor((todayDate-Date.UTC(2026,7,31))/(7*24*60*60*1000));
  const heavyCatcherIndex=((weekNumber%2)+2)%2,catcherRotate=catchers.length?heavyCatcherIndex%catchers.length:0,orderedCatchers=catchers.slice(catcherRotate).concat(catchers.slice(0,catcherRotate));
  const hitterSessionsNeeded=Math.ceil(attendees.length/3),orderedPitchers=pitchers.slice().sort((a,b)=>a.availableUntilBlock-b.availableUntilBlock||a.availableFromBlock-b.availableFromBlock||a.name.localeCompare(b.name));
  const plannedSessionCount=coachPitch?Math.max(1,hitterSessionsNeeded):pitchers.length?Math.max(pitchers.length,hitterSessionsNeeded):0;
  const rotatedPitchers=orderedPitchers.length?orderedPitchers.slice((weekNumber%orderedPitchers.length+orderedPitchers.length)%orderedPitchers.length).concat(orderedPitchers.slice(0,(weekNumber%orderedPitchers.length+orderedPitchers.length)%orderedPitchers.length)):[];
  let pitcherGroups=[];
  if(coachPitch)pitcherGroups=Array.from({length:plannedSessionCount},()=>[null]);
  else if(pitchers.length===1&&plannedSessionCount>1){const pitcherSessionCount=Math.min(2,plannedSessionCount-1);pitcherGroups=[Array(pitcherSessionCount).fill(orderedPitchers[0]),...Array.from({length:plannedSessionCount-pitcherSessionCount},()=>[null])];fallbackWarnings.push(`Coach Pitch is required for ${plannedSessionCount-pitcherSessionCount} live block${plannedSessionCount-pitcherSessionCount===1?'':'s'} so ${orderedPitchers[0].name} can also hit live.`)}
  else if(pitchers.length){const extraPitcherSessions=plannedSessionCount-pitchers.length;if(extraPitcherSessions>pitchers.length)feasibilityErrors.push(`${attendees.length} players require at least ${hitterSessionsNeeded} live blocks. Even if each of the ${pitchers.length} available pitchers throws two consecutive blocks, HotB is short ${extraPitcherSessions-pitchers.length} live block${extraPitcherSessions-pitchers.length===1?'':'s'}. Add another pitcher, allow Coach Pitch, or adjust attendance.`);const doubleNames=new Set(rotatedPitchers.slice(0,Math.min(extraPitcherSessions,pitchers.length)).map(player=>player.name));pitcherGroups=orderedPitchers.map(pitcher=>doubleNames.has(pitcher.name)?[pitcher,pitcher]:[pitcher])}
  function placePitcherGroups(groups){const liveBlocks=[3,4,5,6,7,8,9],used=new Set(),placed=[];function solve(remaining){if(!remaining.length)return true;const candidates=remaining.map((group,index)=>({group,index,starts:liveBlocks.filter(block=>group.every((pitcher,offset)=>liveBlocks.includes(block+offset)&&!used.has(block+offset)&&(!pitcher||isOpen(pitcher,block+offset))))})).sort((a,b)=>a.starts.length-b.starts.length||b.group.length-a.group.length),next=candidates[0];for(const start of next.starts){next.group.forEach((pitcher,offset)=>{used.add(start+offset);placed.push({pitcher,liveBlock:start+offset})});const rest=remaining.filter((_,index)=>index!==next.index);if(solve(rest))return true;next.group.forEach(()=>placed.pop());next.group.forEach((_,offset)=>used.delete(start+offset))}return false}return solve(groups)?placed.slice():null}
  let plannedSessions=feasibilityErrors.length?[]:placePitcherGroups(pitcherGroups);if(!plannedSessions&&pitcherGroups.length){feasibilityErrors.push('The available pitchers cannot be placed into the live blocks while honoring arrival times, departure times, and consecutive blocks for any pitcher who throws twice.');plannedSessions=[]}plannedSessions.sort((a,b)=>a.liveBlock-b.liveBlock);
  orderedPitchers.filter(p=>plannedSessions.filter(s=>s.pitcher?.name===p.name).length===2).forEach(p=>{const blocks=plannedSessions.filter(s=>s.pitcher?.name===p.name).map(s=>s.liveBlock+1).sort((a,b)=>a-b);fallbackWarnings.push(`${p.name} will pitch two consecutive live sessions in Blocks ${blocks[0]}–${blocks[1]}.`)});
  const sessionCount=plannedSessions.length;if(attendees.length<2)feasibilityErrors.push('At least two attending players are required because every hitting station must have 2–3 players.');const repeatHittersNeeded=Math.max(0,sessionCount*2-attendees.length);if(repeatHittersNeeded>attendees.length)feasibilityErrors.push(`${sessionCount} live blocks require more second live-hitting assignments than the attendance can safely provide.`);
  const catcherTargets=[];if(sessionCount===1)catcherTargets.push(false);else if(orderedCatchers.length>1){const playerCaughtBlocks=Math.min(sessionCount,orderedCatchers.length*2),firstCount=Math.ceil(playerCaughtBlocks/2),secondCount=Math.floor(playerCaughtBlocks/2),nineSquareCount=sessionCount-playerCaughtBlocks;catcherTargets.push(...Array(firstCount).fill(true),...Array(nineSquareCount).fill(false),...Array(secondCount).fill(true))}else if(orderedCatchers.length===1){const playerCaughtBlocks=Math.min(2,sessionCount-1);catcherTargets.push(...Array(sessionCount-playerCaughtBlocks).fill(false),...Array(playerCaughtBlocks).fill(true))}else catcherTargets.push(...Array(sessionCount).fill(false));
  const liveCatcherLoads=new Map(orderedCatchers.map(c=>[c.name,0]));
  const sessionPlans=plannedSessions.map((item,index)=>{const {pitcher,liveBlock}=item,usePlayerCatcher=catcherTargets[index],catcherChoices=usePlayerCatcher?orderedCatchers.slice().sort((a,b)=>{const aMatch=pitcher&&a.isGuest===pitcher.isGuest?0:1,bMatch=pitcher&&b.isGuest===pitcher.isGuest?0:1;return aMatch-bMatch||(liveCatcherLoads.get(a.name)||0)-(liveCatcherLoads.get(b.name)||0)||orderedCatchers.indexOf(a)-orderedCatchers.indexOf(b)}):[],catcher=catcherChoices.find(candidate=>(liveCatcherLoads.get(candidate.name)||0)<2&&candidate.name!==pitcher?.name&&isOpen(candidate,liveBlock))||null;if(catcher)liveCatcherLoads.set(catcher.name,(liveCatcherLoads.get(catcher.name)||0)+1);return {pitcher,index,liveBlock,catcher}});
  sessionPlans.forEach(({pitcher,liveBlock,catcher})=>{const pitcherName=pitcher?.name||'Coach';if(pitcher)schedule[pitcher.name][liveBlock]={activity:'Pitch Live',partner:catcher?.name||'9Square'};if(catcher)schedule[catcher.name][liveBlock]={activity:'Catch Live',partner:pitcherName};liveSessions.push({block:liveBlock,pitcher:pitcherName,catcher:catcher?.name||'9Square',hitters:[]})});
  const warmedPitchers=new Set(),warmupCatcherLoads=new Map(orderedCatchers.map(c=>[c.name,0])),coachWarmupBlocks=new Set();
  sessionPlans.forEach(({pitcher,liveBlock,catcher})=>{if(!pitcher||!pitcher.requiresPitchWarmup||warmedPitchers.has(pitcher.name))return;warmedPitchers.add(pitcher.name);let warmBlock,warmCatcher=null,warmPartner='';for(const candidateBlock of [liveBlock-1,liveBlock-2]){if(candidateBlock<2||!isOpen(pitcher,candidateBlock))continue;const playerCatcher=[catcher,...orderedCatchers].filter((candidate,i,list)=>candidate&&list.indexOf(candidate)===i).sort((a,b)=>(a.isGuest===pitcher.isGuest?0:1)-(b.isGuest===pitcher.isGuest?0:1)).find(candidate=>(warmupCatcherLoads.get(candidate.name)||0)<1&&candidate.name!==pitcher.name&&isOpen(candidate,candidateBlock));if(playerCatcher){warmBlock=candidateBlock;warmCatcher=playerCatcher;warmPartner=playerCatcher.name;break}if(!coachWarmupBlocks.has(candidateBlock)){warmBlock=candidateBlock;warmPartner='Coach';coachWarmupBlocks.add(candidateBlock);break}}if(warmBlock===undefined){feasibilityErrors.push(`${pitcher.name} cannot be assigned a pitching warm-up within two blocks before live with the available catchers and one warm-up coach.`);return}if(warmCatcher)warmupCatcherLoads.set(warmCatcher.name,(warmupCatcherLoads.get(warmCatcher.name)||0)+1);schedule[pitcher.name][warmBlock]={activity:'Pitch Warm-Up',partner:warmPartner};if(warmCatcher)schedule[warmCatcher.name][warmBlock]={activity:'Catch Warm-Up',partner:pitcher.name}});
  let liveHitterRepeats=[];
  if(liveSessions.length&&!feasibilityErrors.length){const roleWeight=p=>(p.canPitch?2:0)+(p.canCatch?2:0),preferredRepeatOrder=attendees.slice().sort((a,b)=>roleWeight(a)-roleWeight(b)||a.name.localeCompare(b.name)),rotateBy=preferredRepeatOrder.length?((weekNumber%preferredRepeatOrder.length)+preferredRepeatOrder.length)%preferredRepeatOrder.length:0,repeatOrder=preferredRepeatOrder.slice(rotateBy).concat(preferredRepeatOrder.slice(0,rotateBy)).sort((a,b)=>roleWeight(a)-roleWeight(b));function combinations(items,count,start=0,picked=[]){if(picked.length===count)return[picked.slice()];const result=[];for(let index=start;index<=items.length-(count-picked.length);index++)result.push(...combinations(items,count,index+1,[...picked,items[index]]));return result}const repeatChoices=repeatHittersNeeded?combinations(repeatOrder,repeatHittersNeeded):[[]];let liveGroups=null,chosenRepeats=[];for(const repeats of repeatChoices){const tokens=[...attendees,...repeats.map((p,i)=>({...p,originalName:p.name,assignmentKey:`${p.name}#repeat${i+1}`}))],groups=groupedAssignment(tokens,liveSessions,(player,session)=>{const name=player.originalName||player.name,base=attendees.find(item=>item.name===name);return !!base&&isOpen(base,session.block)&&session.pitcher!==name&&session.catcher!==name},true);if(groups){liveGroups=groups;chosenRepeats=repeats;break}}if(!liveGroups)feasibilityErrors.push('HotB could not form legal 2–3 player live hitting groups around the pitcher and catcher assignments.');else{liveHitterRepeats=chosenRepeats.map(p=>p.name);liveGroups.forEach((group,index)=>group.forEach(key=>{const name=String(key).replace(/#repeat\d+$/,''),session=liveSessions[index];session.hitters.push(name);if(!schedule[name][session.block])schedule[name][session.block]={activity:'Hit Live',partner:session.pitcher}}))}}
  const stationTypes=['Machine','Front Toss'],stationBlocks=[];for(let block=0;block<BLOCK_COUNT;block++)stationTypes.forEach(activity=>stationBlocks.push({block,activity}));const needsStation=attendees.filter(p=>p.availableFromBlock<p.availableUntilBlock);
  for(const activity of stationTypes){const slots=stationBlocks.filter(s=>s.activity===activity),groups=groupedAssignment(needsStation,slots,(p,s)=>isOpen(p,s.block));if(!groups){feasibilityErrors.push(`HotB could not give every player ${activity} while keeping all ${activity} groups at 2–3 players.`);continue}groups.forEach((group,index)=>group.forEach(name=>{const slot=slots[index];if(!schedule[name][slot.block])schedule[name][slot.block]={activity}}))}
  for(let block=0;block<BLOCK_COUNT;block++){const open=attendees.filter(p=>isOpen(p,block));if(!open.length)continue;const groups=groupedAssignment(open,[{block,activity:'Drill'}],()=>true);if(groups&&groups[0]?.length>=2)groups[0].forEach(name=>schedule[name][block]={activity:'Drill'});else open.forEach(p=>schedule[p.name][block]={activity:'Recovery / Skill Work'})}
  return {schedule,times,warnings:[...warnings,...fallbackWarnings],errors:feasibilityErrors,liveSessions,liveHitterRepeats,blockMinutes};
 }
 return {BLOCK_COUNT,BLOCK_MINUTES,fixedActivities,blockTimes,buildSchedule};
});