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
   pa?.outcome==='E'||pa?.outcome==='FC'||pa?.outcome==='SAC'||Boolean(pa?.sac)||
   Number(pa?.rbiCount??(pa?.rbi?1:0))>0||Boolean(pa?.rba)||Boolean(pa?.hhb)||
   Number(pa?.pitchCount)>=8;
 }

 // Impactful Plate Appearance (IPA): a PA that creates a positive offensive result.
 // A PA counts once if it includes at least one of these: reaching base, producing/
 // advancing a run, executing a recorded sacrifice, or winning an 8+ pitch battle.
 // HHB and simply putting the ball in play do not earn IPA credit by themselves.
 function isImpactfulPlateAppearance(pa){
  const reached=['HIT','BB','HBP','E','FC'].includes(pa?.outcome);
  const produced=Number(pa?.rbiCount??(pa?.rbi?1:0))>0||Boolean(pa?.rba);
  const sacrifice=pa?.outcome==='SAC'||Boolean(pa?.sac);
  const longBattle=Number(pa?.pitchCount)>=8;
  return reached||produced||sacrifice||longBattle;
 }

 function statsForPAs(pas){
  let AB=0,H=0,TB=0,BB=0,HBP=0,K=0,contact=0,SF=0,RBI=0,HHB=0,WEAK=0,battedBalls=0,trackedHHB=0,QAB=0,IPA=0,REACH=0;
  pas.forEach(pa=>{
    if(pa.outcome==='HIT'){H++;AB++;contact++;TB += ({'1B':1,'2B':2,'3B':3,'HR':4}[pa.hitType]||1)}
    else if(pa.outcome==='H4O'){AB++;contact++}
    else if(pa.outcome==='E'||pa.outcome==='FC'){AB++;contact++}
    else if(pa.outcome==='SAC'){if(!pa.bunt)SF++}
    else if(pa.outcome==='K'){AB++;K++}
    else if(pa.outcome==='BB'){BB++}
    else if(pa.outcome==='HBP'){HBP++}
    RBI+=Number(pa.rbiCount??(pa.rbi?1:0));
    if(pa.hhb)HHB++;
    if(pa.weak)WEAK++;
    if(isTrackedBallInPlay(pa)){battedBalls++;if(pa.hhb)trackedHHB++}
    if(isQualityAtBat(pa))QAB++;
    if(isImpactfulPlateAppearance(pa))IPA++;
    if(['HIT','BB','HBP','E','FC'].includes(pa.outcome))REACH++;
  });
  const PA=pas.length,AVG=AB?H/AB:0,obDen=AB+BB+HBP+SF,OBP=obDen?(H+BB+HBP)/obDen:0,SLG=AB?TB/AB:0;
  const OPS=OBP+SLG;
  const contactPct=AB?contact/AB:0,kPct=PA?K/PA:0,bbPct=PA?BB/PA:0;
  const hhbPct=battedBalls?trackedHHB/battedBalls:0,qabPct=PA?QAB/PA:0,ipaPct=PA?IPA/PA:0,reachPct=PA?REACH/PA:0;
  const rp = H + Math.max(0,TB-H)*0.65 + BB*0.7 + HBP*0.7 + RBI*0.75 + HHB*0.25 - WEAK*0.25;
  return {PA,AB,H,TB,BB,HBP,K,SF,RBI,HHB,WEAK,battedBalls,QAB,IPA,REACH,AVG,OBP,SLG,OPS,contactPct,kPct,bbPct,hhbPct,qabPct,ipaPct,reachPct,rp};
 }

 return{statsForPAs,isTrackedBallInPlay,isQualityAtBat,isImpactfulPlateAppearance};
});
