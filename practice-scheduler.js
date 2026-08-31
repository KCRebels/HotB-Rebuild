(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.HotBPracticeScheduler=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 const BLOCK_COUNT=10,BLOCK_MINUTES=12;
 const fixedActivities=['Stretch','Tee Work'];
 const pad=value=>String(value).padStart(2,'0');
 function blockTimes(startTime='18:00'){
  const [hour,minute]=String(startTime||'18:00').split(':').map(Number);
  const start=(Number.isFinite(hour)?hour:18)*60+(Number.isFinite(minute)?minute:0);
  const label=minutes=>{
   const normalized=(minutes+1440)%1440,h=Math.floor(normalized/60),m=normalized%60;
   const displayHour=h%12||12,period=h<12?'AM':'PM';
   return `${displayHour}:${pad(m)} ${period}`;
  };
  return Array.from({length:BLOCK_COUNT},(_,index)=>({block:index+1,start:label(start+index*BLOCK_MINUTES),end:label(start+(index+1)*BLOCK_MINUTES)}));
 }
 function buildSchedule(players,startTime='18:00'){
  const attendees=(players||[]).filter(player=>player&&player.name).map(player=>({...player,isPitcher:!!player.isPitcher,isCatcher:!!player.isCatcher}));
  const times=blockTimes(startTime),warnings=[];
  const schedule=Object.fromEntries(attendees.map(player=>[player.name,Array(BLOCK_COUNT).fill(null)]));
  attendees.forEach(player=>{schedule[player.name][0]={activity:fixedActivities[0]};schedule[player.name][1]={activity:fixedActivities[1]}});
  const pitchers=attendees.filter(player=>player.isPitcher),catchers=attendees.filter(player=>player.isCatcher);
  const liveSessions=[];
  if(!pitchers.length)warnings.push('No attending pitchers are available for live pitching.');
  if(!catchers.length&&pitchers.length)warnings.push('No attending catcher is available for live pitching.');
  const livePitchers=catchers.length?pitchers.slice(0,7):[];
  const firstChunk=Math.ceil(livePitchers.length/2);
  livePitchers.forEach((pitcher,index)=>{
   const liveBlock=3+index;
   const coachCatches=catchers.length===1&&index===livePitchers.length-1;
   const catcher=coachCatches?null:(index<firstChunk?catchers[0]:catchers[Math.min(1,catchers.length-1)]);
   const chunkFirst=index===0||index===firstChunk;
   const warmBlock=Math.max(2,liveBlock-1);
   const catcherHandlesWarmup=chunkFirst&&catchers.length>1&&catcher;
   const warmPartner=catcherHandlesWarmup?catcher.name:'Coach';
   schedule[pitcher.name][warmBlock]={activity:'Pitch Warm-Up',partner:warmPartner};
   schedule[pitcher.name][liveBlock]={activity:'Pitch Live',partner:catcher?.name||'Coach'};
   if(catcher){
    if(catcherHandlesWarmup&&schedule[catcher.name][warmBlock]===null)schedule[catcher.name][warmBlock]={activity:'Catch Warm-Up',partner:pitcher.name};
    schedule[catcher.name][liveBlock]={activity:'Catch Live',partner:pitcher.name};
   }
   liveSessions.push({block:liveBlock,pitcher:pitcher.name,catcher:catcher?.name||'',hitters:[]});
  });
  const livePriority=[...catchers,...pitchers,...attendees.filter(player=>!player.isPitcher&&!player.isCatcher)];
  const needsLive=new Set(attendees.map(player=>player.name));
  livePriority.forEach(player=>{
   const session=liveSessions.find(item=>item.hitters.length<3&&item.pitcher!==player.name&&item.catcher!==player.name&&schedule[player.name][item.block]===null);
   if(session){session.hitters.push(player.name);schedule[player.name][session.block]={activity:'Hit Live',partner:session.pitcher};needsLive.delete(player.name)}
  });
  if(needsLive.size)warnings.push(`${needsLive.size} player${needsLive.size===1?'':'s'} could not be assigned live hitting with the attending pitchers and catchers.`);
  function assignOnce(activity,capacity,preferredBlocks){
   const counts=Object.fromEntries(preferredBlocks.map(block=>[block,0]));
   const missed=[];
   attendees.forEach(player=>{
    const block=preferredBlocks.filter(index=>schedule[player.name][index]===null&&counts[index]<capacity).sort((a,b)=>counts[a]-counts[b]||a-b)[0];
    if(block===undefined)missed.push(player.name);
    else{schedule[player.name][block]={activity};counts[block]++}
   });
   if(missed.length)warnings.push(`${missed.length} player${missed.length===1?'':'s'} could not be assigned ${activity}.`);
  }
  assignOnce('Machine',2,[2,3,4,5,6,7,8,9]);
  assignOnce('Front Toss',8,[8,9,7,6,5,4,3,2]);
  attendees.forEach(player=>{
   for(let block=2;block<BLOCK_COUNT;block++)if(schedule[player.name][block]===null)schedule[player.name][block]={activity:'Drill'};
  });
  let drillStations=0;
  for(let block=2;block<BLOCK_COUNT;block++){
   const drillPlayers=attendees.filter(player=>schedule[player.name][block].activity==='Drill');
   const stations=Math.ceil(drillPlayers.length/4);drillStations=Math.max(drillStations,stations);
   drillPlayers.forEach((player,index)=>schedule[player.name][block].activity=`Drill Station ${Math.floor(index/4)+1}`);
  }
  const blocks=times.map((time,index)=>{
   const assignments={};
   attendees.forEach(player=>{
    const entry=schedule[player.name][index],label=entry.partner?`${entry.activity} — ${entry.partner}`:entry.activity;
    (assignments[label]||(assignments[label]=[])).push(player.name);
   });
   return {...time,assignments};
  });
  const catcherLoads=catchers.map(catcher=>({name:catcher.name,liveBlocks:schedule[catcher.name].filter(entry=>entry?.activity==='Catch Live').length}));
  return {attendance:attendees.length,players:attendees,startTime,times,schedule,blocks,liveSessions,drillStations,catcherLoads,warnings};
 }
 function validate(plan){
  const errors=[];
  if(!plan||plan.times?.length!==BLOCK_COUNT)errors.push('Schedule must contain ten blocks.');
  Object.entries(plan?.schedule||{}).forEach(([name,entries])=>{
   if(entries.length!==BLOCK_COUNT||entries.some(entry=>!entry?.activity))errors.push(`${name} has downtime.`);
   if(entries[0]?.activity!=='Stretch')errors.push(`${name} must stretch first.`);
   if(entries[1]?.activity!=='Tee Work')errors.push(`${name} must complete tee work second.`);
   ['Machine','Front Toss'].forEach(activity=>{if(!entries.some(entry=>entry.activity===activity))errors.push(`${name} is missing ${activity}.`)});
   if(!entries.some(entry=>entry.activity.startsWith('Drill Station')))errors.push(`${name} is missing drill work.`);
   if(plan.liveSessions?.length&&!entries.some(entry=>entry.activity==='Hit Live'))errors.push(`${name} is missing live hitting.`);
  });
  (plan?.players||[]).forEach(player=>{
   const entries=plan.schedule[player.name]||[];
   if(player.isPitcher&&plan.liveSessions?.some(session=>session.pitcher===player.name)){
    const warm=entries.findIndex(entry=>entry?.activity==='Pitch Warm-Up'),live=entries.findIndex(entry=>entry?.activity==='Pitch Live');
    if(warm<0||live<0||warm>=live||live-warm>2)errors.push(`${player.name}'s pitching warm-up is not within two blocks before live.`);
   }
  });
  for(let block=2;block<BLOCK_COUNT;block++){
   const entries=Object.values(plan.schedule||{}).map(items=>items[block]);
   if(entries.filter(entry=>entry?.activity==='Machine').length>2)errors.push(`Block ${block+1} exceeds machine capacity.`);
   if(entries.filter(entry=>entry?.activity==='Front Toss').length>8)errors.push(`Block ${block+1} exceeds front-toss capacity.`);
   const drillCounts={};entries.filter(entry=>entry?.activity.startsWith('Drill Station')).forEach(entry=>drillCounts[entry.activity]=(drillCounts[entry.activity]||0)+1);
   if(Object.values(drillCounts).some(count=>count>4))errors.push(`Block ${block+1} exceeds drill-station capacity.`);
  }
  (plan?.liveSessions||[]).forEach(session=>{if(session.hitters.length>3)errors.push(`Block ${session.block+1} has too many live hitters.`)});
  return errors;
 }
 return {BLOCK_COUNT,BLOCK_MINUTES,blockTimes,buildSchedule,validate};
});
