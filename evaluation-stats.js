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

 function statsForPAs(pas){
  let AB=0,H=0,TB=0,BB=0,HBP=0,K=0,contact=0,RBI=0,HHB=0,WEAK=0,battedBalls=0,trackedHHB=0,QAB=0;
  pas.forEach(pa=>{
    if(pa.outcome==='HIT'){H++;AB++;contact++;TB += ({'1B':1,'2B':2,'3B':3,'HR':4}[pa.hitType]||1)}
    else if(pa.outcome==='H4O'){AB++;contact++}
    else if(pa.outcome==='E'||pa.outcome==='FC'){AB++;contact++}
    else if(pa.outcome==='SAC'){contact++}
    else if(pa.outcome==='K'){AB++;K++}
    else if(pa.outcome==='BB'){BB++}
    else if(pa.outcome==='HBP'){HBP++}
    RBI+=Number(pa.rbiCount??(pa.rbi?1:0));
    if(pa.hhb)HHB++;
    if(pa.weak)WEAK++;
    if(isTrackedBallInPlay(pa)){battedBalls++;if(pa.hhb)trackedHHB++}
    if(isQualityAtBat(pa))QAB++;
  });
  const PA=pas.length,AVG=AB?H/AB:0,OBP=(AB+BB+HBP)?(H+BB+HBP)/(AB+BB+HBP):0,SLG=AB?TB/AB:0;
  const OPS=OBP+SLG,contactPct=AB?contact/AB:0,kPct=PA?K/PA:0,bbPct=PA?BB/PA:0;
  const hhbPct=battedBalls?trackedHHB/battedBalls:0,qabPct=PA?QAB/PA:0;
  // Provisional Runs Produced model for rebuild; calibrate against legacy app.
  const rp = H + Math.max(0,TB-H)*0.65 + BB*0.7 + HBP*0.7 + RBI*0.75 + HHB*0.25 - WEAK*0.25;
  return {PA,AB,H,TB,BB,HBP,K,RBI,HHB,WEAK,battedBalls,QAB,AVG,OBP,SLG,OPS,contactPct,kPct,bbPct,hhbPct,qabPct,rp};
 }

 return{statsForPAs,isTrackedBallInPlay,isQualityAtBat};
});
