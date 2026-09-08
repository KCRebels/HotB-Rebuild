(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.HotBCoachObservations=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 const CATEGORIES=[
  {name:'Approach',options:['Poor pitch selection','Too passive / hesitant','Chasing','Not attacking hittable pitches','Guessing','Poor two-strike approach','Taking too many strikes','Expanding the zone early']},
  {name:'Timing',options:['Early','Late','Lunging / drifting forward','Off-balance','Not getting foot down','Rushing','Commitment too early','Not adjusting to off-speed']},
  {name:'Mechanics',options:['Flying open','Rolling over','Dropping hands','Casting','Pulling off the ball','Poor outside-pitch approach','Under the ball / excessive pop-ups','Down-up swing path','Poor extension','Losing posture','Collapsing back side','Long swing path']},
  {name:'Mental / Competitive',options:['Tentative','Pressing','Lack of confidence','Poor adjustment','Repeating same mistake','At-bat carried into next at-bat','Lost plan / approach']}
 ];

 function observations(game){
  if(!game)return[];
  if(!Array.isArray(game.observations))game.observations=[];
  return game.observations;
 }
 function observationFor(game,paId,playerName){
  return observations(game).find(item=>paId?item.paId===paId:!item.paId&&item.playerName===playerName)||null;
 }
 function lastCompletedTarget(game,playerName=''){
  const pas=(game?.plateAppearances||[]).filter(pa=>!playerName||pa.hitter===playerName);
  const pa=pas[pas.length-1];
  return pa?{playerName:pa.hitter,paId:pa.id,inning:pa.inning,pa:pa.pa}:null;
 }
 function recentTargets(game){
  const pas=game?.plateAppearances||[];
  if(!pas.length)return[];
  const newestInning=pas[pas.length-1].inning;
  const ordered=[...pas].sort((a,b)=>Number(b.inning)-Number(a.inning)||Number(b.pa)-Number(a.pa));
  const seen=new Set(),targets=[];
  ordered.forEach(pa=>{
   if(seen.has(pa.hitter))return;
   seen.add(pa.hitter);
   const existing=observationFor(game,pa.id,pa.hitter);
   targets.push({playerName:pa.hitter,paId:pa.id,inning:pa.inning,pa:pa.pa,recentHalf:pa.inning===newestInning,observed:!!existing,tagCount:existing?.tags?.length||0});
  });
  return targets.sort((a,b)=>Number(b.recentHalf)-Number(a.recentHalf)||Number(b.pa)-Number(a.pa));
 }
 function orderedUniqueTargets(game,pas,firstPlayer=''){
  const ordered=[...(pas||[])].sort((a,b)=>Number(b.pa)-Number(a.pa)||Number(b.ts||0)-Number(a.ts||0)),seen=new Set(),targets=[];
  if(firstPlayer){const existing=observationFor(game,'',firstPlayer);seen.add(firstPlayer);targets.push({playerName:firstPlayer,paId:'',current:true,observed:!!existing,tagCount:existing?.tags?.length||0})}
  ordered.forEach(pa=>{if(!pa?.hitter||seen.has(pa.hitter))return;seen.add(pa.hitter);const existing=observationFor(game,pa.id,pa.hitter);targets.push({playerName:pa.hitter,paId:pa.id,inning:pa.inning,pa:pa.pa,observed:!!existing,tagCount:existing?.tags?.length||0})});
  return targets;
 }
 function targetsForScope(game,scope='current'){
  if(!game)return[];
  const lineup=[...new Set(game.battingOrder||[])],current=lineup[Number(game.currentIdx)||0]||'';
  if(scope==='previous')return orderedUniqueTargets(game,(game.plateAppearances||[]).filter(pa=>Number(pa.inning)===Number(game.inning)-1));
  if(scope==='lineup'){
   const completed=orderedUniqueTargets(game,(game.plateAppearances||[]).filter(pa=>lineup.includes(pa.hitter))),anchor=(game.outs||0)>0||completed.some(item=>Number(item.inning)===Number(game.inning))?current:(completed[0]?.playerName||current),byName=new Map(completed.map(item=>[item.playerName,item])),ordered=[];
   if(anchor)ordered.push(byName.get(anchor)||{playerName:anchor,paId:'',current:anchor===current});
   completed.forEach(item=>{if(!ordered.some(row=>row.playerName===item.playerName))ordered.push(item)});
   if(lineup.length){const start=Math.max(0,lineup.indexOf(anchor));for(let step=1;step<=lineup.length;step++){const name=lineup[(start-step+lineup.length)%lineup.length];if(name&&!ordered.some(row=>row.playerName===name))ordered.push({playerName:name,paId:'',current:name===current})}}
   return ordered;
  }
  return orderedUniqueTargets(game,(game.plateAppearances||[]).filter(pa=>Number(pa.inning)===Number(game.inning)),current);
 }
 function saveObservation(game,{playerName,paId='',tags=[],note=''}){
  if(!game||!playerName)throw new Error('Choose a player.');
  const cleanTags=[...new Set(tags.map(value=>String(value||'').trim()).filter(Boolean))].slice(0,3);
  const cleanNote=String(note||'').trim().slice(0,160);
  if(!cleanTags.length&&!cleanNote)throw new Error('Select an observation or enter a short note.');
  const list=observations(game),existing=observationFor(game,paId,playerName);
  const pa=(game.plateAppearances||[]).find(item=>item.id===paId);
  const record={id:existing?.id||((globalThis.crypto?.randomUUID&&globalThis.crypto.randomUUID())||`obs-${Date.now()}-${Math.random()}`),playerName,paId:paId||'',inning:pa?.inning??existing?.inning??null,pa:pa?.pa??existing?.pa??null,tags:cleanTags,note:cleanNote,createdAt:existing?.createdAt||Date.now(),updatedAt:Date.now()};
  if(existing)Object.assign(existing,record);else list.push(record);
  return record;
 }
 function saveStandalone(list,{playerName,tags=[],note='',observedAt=''}){
  if(!Array.isArray(list))throw new Error('Coach observations are not available.');
  if(!playerName)throw new Error('Choose a player.');
  const cleanTags=[...new Set(tags.map(value=>String(value||'').trim()).filter(Boolean))].slice(0,3),cleanNote=String(note||'').trim().slice(0,160);
  if(!cleanTags.length&&!cleanNote)throw new Error('Select an observation or enter a short note.');
  const now=Date.now(),anchorTime=new Date(observedAt||now).getTime(),record={id:(globalThis.crypto?.randomUUID&&globalThis.crypto.randomUUID())||`obs-${now}-${Math.random()}`,playerName,paId:'',inning:null,pa:null,tags:cleanTags,note:cleanNote,source:'player-focus',observedAt:new Date(Number.isFinite(anchorTime)?anchorTime:now).toISOString(),createdAt:now,updatedAt:now};
  list.push(record);return record;
 }
 function anchorLegacyStandalone(rows,games){
  let updated=0;
  (rows||[]).forEach(item=>{
   if(item?.source!=='player-focus'||item.observedAt)return;
   const createdTime=new Date(item.createdAt||item.updatedAt||Date.now()).getTime();
   const matching=(games||[]).filter(game=>{
    const gameTime=new Date(game?.date).getTime(),names=[...(game?.battingOrder||[]),...(game?.hittersUsed||[]),...(game?.plateAppearances||[]).map(pa=>pa.hitter)];
    return Number.isFinite(gameTime)&&gameTime<=createdTime&&names.includes(item.playerName);
   }).sort((a,b)=>new Date(b.date)-new Date(a.date));
   item.observedAt=matching[0]?.date||new Date(createdTime).toISOString();updated++;
  });
  return updated;
 }
 function rangeBounds(mode,now=Date.now()){
  const current=new Date(now),endOfToday=new Date(current);endOfToday.setHours(23,59,59,999);
  if(mode==='two-weeks')return{start:new Date(current.getFullYear(),current.getMonth(),current.getDate()-13).getTime(),end:endOfToday.getTime()};
  const day=current.getDay(),daysBack=day===0?2:day===6?1:day===5?0:day+2;
  const start=new Date(current.getFullYear(),current.getMonth(),current.getDate()-daysBack);start.setHours(0,0,0,0);
  const end=new Date(start);end.setDate(start.getDate()+2);end.setHours(23,59,59,999);
  return{start:start.getTime(),end:Math.min(end.getTime(),endOfToday.getTime())};
 }
 function gamesInRange(games,mode,now=Date.now()){
  const bounds=rangeBounds(mode,now);
  return (games||[]).filter(game=>{const time=new Date(game?.date).getTime();return Number.isFinite(time)&&time>=bounds.start&&time<=bounds.end});
 }
 function standaloneInRange(rows,mode,now=Date.now()){
  const bounds=rangeBounds(mode,now);
  return (rows||[]).filter(item=>{const time=new Date(item.observedAt||item.date||item.createdAt||item.updatedAt||0).getTime();return Number.isFinite(time)&&time>=bounds.start&&time<=bounds.end});
 }
 function summarize(games,playerName,standalone=[]){
  const rows=[...(games||[]).flatMap(game=>observations(game).filter(item=>item.playerName===playerName).map(item=>({...item,gameId:game.id,gameDate:game.date}))),...(standalone||[]).filter(item=>item.playerName===playerName)];
  const counts=new Map();
  rows.forEach(row=>(row.tags||[]).forEach(tag=>counts.set(tag,(counts.get(tag)||0)+1)));
  const patterns=[...counts].map(([tag,count])=>({tag,count,status:count>=3?'Strong recurring pattern':count===2?'Recurring pattern':'One-time observation'})).sort((a,b)=>b.count-a.count||a.tag.localeCompare(b.tag));
  return{rows,patterns,total:rows.length};
 }
 function tagUsage(games,standalone=[]){
  const counts={};
  (games||[]).forEach(game=>observations(game).forEach(item=>(item.tags||[]).forEach(tag=>counts[tag]=(counts[tag]||0)+1)));
  (standalone||[]).forEach(item=>(item.tags||[]).forEach(tag=>counts[tag]=(counts[tag]||0)+1));
  return counts;
 }
 return{CATEGORIES,observations,observationFor,lastCompletedTarget,recentTargets,targetsForScope,saveObservation,saveStandalone,anchorLegacyStandalone,rangeBounds,gamesInRange,standaloneInRange,summarize,tagUsage};
});
