(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.HotBEvaluationStats=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 function isTrackedBallInPlay(pa){
  return Boolean(String(pa?.contactType||'').trim());
 }

 function isStrikeResult(result){const type=pitchResultType(result);return type.swing||type.result==='KL'}
 function formatPercent(rate,digits=0,empty='—'){
  const n=Number(rate);
  return rate===null||rate===undefined||!Number.isFinite(n)?empty:`${(n*100).toFixed(digits)}%`;
 }

 function formatAverage(value,empty='—'){
  const n=Number(value);
  return value===null||value===undefined||!Number.isFinite(n)?empty:n.toFixed(3).replace(/^0/,'.');
 }

 function plateAppearanceKey(record){return `${record?.hitter||''}::${record?.pa??''}`}

 function firstPitchStrikeRate(games,playerName){
  let strikes=0,total=0;
  (games||[]).forEach(game=>{const seen=new Set();(game.pitches||[]).forEach(p=>{if(playerName&&p.hitter!==playerName)return;const key=plateAppearanceKey(p);if(seen.has(key))return;seen.add(key);total++;if(isStrikeResult(p.result))strikes++})});
  return{strikes,total,rate:total?strikes/total:null};
 }

 function isSlapHitter(player){return String(player?.side||'').toUpperCase()==='SL'}
 function evaluationResultRate(player,stats){
  return isSlapHitter(player)?{label:'QAB%',key:'qabPct',value:stats?.qabPct}:{label:'HHB%',key:'hhbPct',value:stats?.hhbPct};
 }

 function plateAppearanceType(pa){
  const outcome=String(pa?.outcome||'').toUpperCase();
  return{
   outcome,
   hit:outcome==='HIT',
   hitForOut:outcome==='H4O',
   error:outcome==='E',
   fieldersChoice:outcome==='FC',
   strikeout:outcome==='K',
   walk:outcome==='BB',
   hitByPitch:outcome==='HBP',
   sacrifice:outcome==='SAC',
   atBat:['HIT','H4O','E','FC','K'].includes(outcome),
   contact:['HIT','H4O','E','FC'].includes(outcome),
   reach:['HIT','BB','HBP','E','FC'].includes(outcome)
  };
 }

 function isQualityAtBat(pa){
  const type=plateAppearanceType(pa);
  return type.hit||type.walk||type.hitByPitch||type.sacrifice||Boolean(pa?.sac)||
   Number(pa?.rbiCount??(pa?.rbi?1:0))>0||Boolean(pa?.rba)||Boolean(pa?.hhb)||Number(pa?.pitchCount)>=8;
 }

 function countPerformance(pas,bucket){
  const matches=(pas||[]).filter(pa=>bucket==='6+'?Number(pa.pitchCount||0)>=6:String(pa.finalCount||'')===bucket);
  let H=0,H4O=0,K=0;
  matches.forEach(pa=>{const type=plateAppearanceType(pa);if(type.hit)H++;if(type.hitForOut)H4O++;if(type.strikeout)K++});
  return{bucket,H,H4O,K,AVG:(H+H4O+K)?H/(H+H4O+K):0};
 }

 function normalizeHeatZone(zone){
  const value=String(zone||'').toUpperCase(),legacy={T:'T1',L:'L1',R:'R1',B:'B1'};
  return legacy[value]||value;
 }
 function heatZoneIndex(zone){
  return ['T1','T2','L1','L2','C1','C2','C3','C4','R1','R2','B1','B2'].indexOf(normalizeHeatZone(zone));
 }
 function pitchMatchesHeatResult(pitch,result){
  const r=String(pitch?.result||'').toUpperCase(),filter=String(result||'ALL').toUpperCase(),contact=String(pitch?.contactType||'').toUpperCase();
  if(filter==='ALL')return true;
  if(filter==='BALL')return r==='B';
  if(filter==='FOUL')return r==='F';
  if(filter==='KS')return r==='K';
  if(['KL','HIT','H4O'].includes(filter))return r===filter;
  return ['GB','LD','FB'].includes(filter)&&contact===filter;
 }

 const SWING_RESULTS=new Set(['F','HIT','H4O','E','FC','SAC','K']),CONTACT_RESULTS=new Set(['F','HIT','H4O','E','FC','SAC']),TAKE_RESULTS=new Set(['B','KL']),BATTED_RESULTS=new Set(['HIT','H4O','E','FC','SAC']);
 function pitchResultType(result){const r=String(result||'').toUpperCase();return{result:r,swing:SWING_RESULTS.has(r),contact:CONTACT_RESULTS.has(r),take:TAKE_RESULTS.has(r),batted:BATTED_RESULTS.has(r)}}
 function pitchExecutesPlan(pitch,player){
  const plan=String(pitch?.plan||'').toUpperCase();
  if(plan==='CH')return String(pitch?.pitchType||'').toUpperCase()==='CH';
  if(plan==='NO')return true;
  const leftHanded=['L','SL'].includes(String(player?.side||'').toUpperCase()),zone=normalizeHeatZone(pitch?.zone);
  const insideZones=new Set(leftHanded?['L1','L2','C1','C3']:['R1','R2','C2','C4']),outsideZones=new Set(leftHanded?['R1','R2','C2','C4']:['L1','L2','C1','C3']);
  return plan==='IN'?insideZones.has(zone):plan==='OUT'?outsideZones.has(zone):false;
 }
 function executionFromPitches(pitches,player){
  let successes=0,attempts=0;
  (pitches||[]).forEach(pitch=>{const inPlan=pitchExecutesPlan(pitch,player),{swing,contact,take}=pitchResultType(pitch?.result);
   if(Number(pitch?.strikesBefore||0)<2){if(String(pitch?.plan||'').toUpperCase()==='NO'){if(swing){attempts++;successes++}}else if(swing||take){attempts++;if(swing?inPlan:!inPlan)successes++}}
   else if(contact&&inPlan){attempts++;successes++}
  });
  return{successes,attempts,rate:attempts?successes/attempts:null};
 }

 function playerEvaluationData(db,playerName){
  const games=[...(db?.savedGames||[]),...(db?.currentGame?[db.currentGame]:[])];
  const pitches=games.flatMap(game=>(game.pitches||[]).filter(p=>!playerName||p.hitter===playerName));
  const pas=games.flatMap(game=>(game.plateAppearances||[]).filter(pa=>!playerName||pa.hitter===playerName));
  return{games,pitches,pas};
 }

 function pitchPerformance(games,playerName,pitchType){
  const type=String(pitchType||'FB').toUpperCase();
  const selected=(games||[]).flatMap(game=>(game.pitches||[]).filter(p=>(!playerName||p.hitter===playerName)&&String(p.pitchType||'FB').toUpperCase()===type));
  const swings=selected.filter(p=>pitchResultType(p.result).swing),contacts=swings.filter(p=>pitchResultType(p.result).contact);
  const batted=(games||[]).flatMap(game=>{const paMap=new Map((game.plateAppearances||[]).map(pa=>[plateAppearanceKey(pa),pa]));return(game.pitches||[]).filter(p=>(!playerName||p.hitter===playerName)&&String(p.pitchType||'FB').toUpperCase()===type&&pitchResultType(p.result).batted).map(p=>({pitch:p,pa:paMap.get(plateAppearanceKey(p))})).filter(x=>String(x.pa?.contactType||x.pitch.contactType||'').trim())});
  const hardHit=batted.filter(x=>x.pa?.hhb||x.pitch.hhb).length;
  return{pitches:selected,swings,contacts,batted,n:selected.length,swingRate:selected.length?swings.length/selected.length:null,contactRate:swings.length?contacts.length/swings.length:null,whiffRate:swings.length?(swings.length-contacts.length)/swings.length:null,hhbRate:batted.length?hardHit/batted.length:null,hardHit};
 }

 function executionTotalsFromPAs(pas){
  const totals=(pas||[]).reduce((t,pa)=>({successes:t.successes+Number(pa?.executionSuccesses||0),attempts:t.attempts+Number(pa?.executionAttempts||0)}),{successes:0,attempts:0});
  return{...totals,rate:totals.attempts?totals.successes/totals.attempts:null};
 }

 function hotBMetrics(playerPas,teamPas){
  const player=statsForPAs(playerPas||[]),team=statsForPAs(teamPas||[]);
  const teamRate=team.PA?team.rp/team.PA:0;
  const hotBRaw=player.PA&&teamRate?(player.rp/player.PA)/teamRate*100:null,hotB=hotBRaw===null?null:Math.round(hotBRaw);
  const executionTotals=executionTotalsFromPAs(playerPas);
  return{stats:player,teamStats:team,hotB,hotBRaw,runsProduced:player.rp,execution:executionTotals.rate,executionSuccesses:executionTotals.successes,executionAttempts:executionTotals.attempts};
 }

 function evaluationSnapshot(db,playerName){
  const data=playerEvaluationData(db,playerName),player=(db?.roster||[]).find(p=>p.name===playerName)||{},stats=statsForPAs(data.pas),resultMetric=evaluationResultRate(player,stats),firstPitchStrike=firstPitchStrikeRate(data.games,playerName),execution=executionTotalsFromPAs(data.pas);
  const decision=window.HotBDecisionQuality?.summary?.(data.games,playerName,db?.roster||[])||null,approach=window.HotBAtBatApproach?.summarize?.(playerName,data.games)||null;
  const pitchPerformanceByType=Object.fromEntries(['FB','CH','RS','DP','CV','SC'].map(type=>[type,pitchPerformance(data.games,playerName,type)]));
  return{...data,player,stats,resultMetric,firstPitchStrike,execution,decision,approach,pitchPerformanceByType};
 }

 function statsForPAs(pas){
  let AB=0,H=0,TB=0,BB=0,HBP=0,K=0,contact=0,SF=0,RBI=0,HHB=0,WEAK=0,battedBalls=0,trackedHHB=0,QAB=0,REACH=0;
  pas.forEach(pa=>{
    const type=plateAppearanceType(pa);
    if(type.atBat)AB++;
    if(type.contact)contact++;
    if(type.hit){H++;TB += ({'1B':1,'2B':2,'3B':3,'HR':4}[pa.hitType]||1)}
    if(type.sacrifice&&!pa.bunt)SF++;
    if(type.strikeout)K++;
    if(type.walk)BB++;
    if(type.hitByPitch)HBP++;
    RBI+=Number(pa.rbiCount??(pa.rbi?1:0));
    if(pa.hhb)HHB++;
    if(pa.weak)WEAK++;
    if(isTrackedBallInPlay(pa)){battedBalls++;if(pa.hhb)trackedHHB++}
    if(isQualityAtBat(pa))QAB++;
    if(type.reach)REACH++;
  });
  const PA=pas.length,AVG=AB?H/AB:0,obDen=AB+BB+HBP+SF,OBP=obDen?(H+BB+HBP)/obDen:0,SLG=AB?TB/AB:0;
  const OPS=OBP+SLG;
  // Historical HotB PAs do not store per-PA swing/contact totals. Keep Contact% bounded and
  // internally consistent from the saved PA record: ABs ending with contact / official ABs.
  // SACs are excluded from both sides because they are not official ABs.
  const contactPct=AB?contact/AB:0,kPct=PA?K/PA:0,bbPct=PA?BB/PA:0;
  const hhbPct=battedBalls?trackedHHB/battedBalls:0,qabPct=PA?QAB/PA:0,reachPct=PA?REACH/PA:0;
  // Authoritative HotB Runs Produced model used by Evaluation and team comparisons.
  const rp = H + Math.max(0,TB-H)*0.65 + BB*0.7 + HBP*0.7 + RBI*0.75 + HHB*0.25 - WEAK*0.25;
  return {PA,AB,H,TB,BB,HBP,K,SF,RBI,HHB,WEAK,battedBalls,QAB,REACH,AVG,OBP,SLG,OPS,contactPct,kPct,bbPct,hhbPct,qabPct,reachPct,rp};
 }

 return{statsForPAs,isTrackedBallInPlay,isStrikeResult,formatPercent,formatAverage,plateAppearanceKey,firstPitchStrikeRate,isSlapHitter,evaluationResultRate,plateAppearanceType,isQualityAtBat,countPerformance,pitchMatchesHeatResult,normalizeHeatZone,heatZoneIndex,pitchResultType,pitchExecutesPlan,executionFromPitches,executionTotalsFromPAs,playerEvaluationData,evaluationSnapshot,pitchPerformance,hotBMetrics};
});
