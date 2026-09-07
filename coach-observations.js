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
 function summarize(games,playerName){
  const rows=(games||[]).flatMap(game=>observations(game).filter(item=>item.playerName===playerName).map(item=>({...item,gameId:game.id,gameDate:game.date})));
  const counts=new Map();
  rows.forEach(row=>(row.tags||[]).forEach(tag=>counts.set(tag,(counts.get(tag)||0)+1)));
  const patterns=[...counts].map(([tag,count])=>({tag,count,status:count>=3?'Strong recurring pattern':count===2?'Recurring pattern':'One-time observation'})).sort((a,b)=>b.count-a.count||a.tag.localeCompare(b.tag));
  return{rows,patterns,total:rows.length};
 }
 return{CATEGORIES,observations,observationFor,lastCompletedTarget,recentTargets,saveObservation,rangeBounds,gamesInRange,summarize};
});
