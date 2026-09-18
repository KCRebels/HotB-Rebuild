(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.HotBEvaluationStats=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 function isTrackedBallInPlay(pa){
  return Boolean(String(pa?.contactType||'').trim());
 }

 function isQualityAtBat(pa){
  return pa?.outcome==='HIT'||pa?.outcome==='BB'||pa?.outcome==='HBP'||
   pa?.outcome==='SAC'||Boolean(pa?.sac)||Number(pa?.rbiCount??(pa?.rbi?1:0))>0||
   Boolean(pa?.rba)||Boolean(pa?.hhb)||Number(pa?.pitchCount)>=8;
 }

 function countPerformance(pas,bucket){
  const matches=(pas||[]).filter(pa=>bucket==='6+'?Number(pa.pitchCount||0)>=6:String(pa.finalCount||'')===bucket);
  const H=matches.filter(pa=>pa.outcome==='HIT').length,H4O=matches.filter(pa=>pa.outcome==='H4O').length,K=matches.filter(pa=>pa.outcome==='K').length;
  return{bucket,H,H4O,K,AVG:(H+H4O+K)?H/(H+H4O+K):0};
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

 function statsForPAs(pas){
  let AB=0,H=0,TB=0,BB=0,HBP=0,K=0,contact=0,SF=0,RBI=0,HHB=0,WEAK=0,battedBalls=0,trackedHHB=0,QAB=0,REACH=0;
  pas.forEach(pa=>{
    if(pa.outcome==='HIT'){H++;AB++;contact++;TB += ({'1B':1,'2B':2,'3B':3,'HR':4}[pa.hitType]||1)}
    else if(pa.outcome==='H4O'){AB++;contact++}
    else if(pa.outcome==='E'||pa.outcome==='FC'){AB++;contact++}
    else if(pa.outcome==='SAC'){
      // Sacrifice bunts do not affect OBP; sacrifice flies do.
      // HotB records bunt=true when the SAC was a bunt, so a non-bunt SAC is an SF.
      if(!pa.bunt)SF++;
    }
    else if(pa.outcome==='K'){AB++;K++}
    else if(pa.outcome==='BB'){BB++}
    else if(pa.outcome==='HBP'){HBP++}
    RBI+=Number(pa.rbiCount??(pa.rbi?1:0));
    if(pa.hhb)HHB++;
    if(pa.weak)WEAK++;
    if(isTrackedBallInPlay(pa)){battedBalls++;if(pa.hhb)trackedHHB++}
    if(isQualityAtBat(pa))QAB++;
    if(['HIT','BB','HBP','E','FC'].includes(pa.outcome))REACH++;
  });
  const PA=pas.length,AVG=AB?H/AB:0,obDen=AB+BB+HBP+SF,OBP=obDen?(H+BB+HBP)/obDen:0,SLG=AB?TB/AB:0;
  const OPS=OBP+SLG;
  // Historical HotB PAs do not store per-PA swing/contact totals. Keep Contact% bounded and
  // internally consistent from the saved PA record: ABs ending with contact / official ABs.
  // SACs are excluded from both sides because they are not official ABs.
  const contactPct=AB?contact/AB:0,kPct=PA?K/PA:0,bbPct=PA?BB/PA:0;
  const hhbPct=battedBalls?trackedHHB/battedBalls:0,qabPct=PA?QAB/PA:0,reachPct=PA?REACH/PA:0;
  // Provisional Runs Produced model for rebuild; calibrate against legacy app.
  const rp = H + Math.max(0,TB-H)*0.65 + BB*0.7 + HBP*0.7 + RBI*0.75 + HHB*0.25 - WEAK*0.25;
  return {PA,AB,H,TB,BB,HBP,K,SF,RBI,HHB,WEAK,battedBalls,QAB,REACH,AVG,OBP,SLG,OPS,contactPct,kPct,bbPct,hhbPct,qabPct,reachPct,rp};
 }

 return{statsForPAs,isTrackedBallInPlay,isQualityAtBat,countPerformance,pitchMatchesHeatResult};
});
