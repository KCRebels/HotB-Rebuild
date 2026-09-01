(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.HotBHittingAnalysis=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 const DAY_MS=24*60*60*1000;
 const SWING_RESULTS=new Set(['F','HIT','H4O','E','FC','SAC','K']);
 const CONTACT_RESULTS=new Set(['F','HIT','H4O','E','FC','SAC']);
 const DEFAULT_THRESHOLDS={
  player:{minimumPA:10,standardPA:25,relevantPitches:8,relevantSwings:6,battedBalls:6,executionAttempts:10},
  team:{minimumPA:40,standardPA:75,relevantPitches:20,relevantSwings:15,battedBalls:18,executionAttempts:30}
 };

 function normalizeContact(pa){
  const type=String(pa?.contactType||'').toUpperCase();
  if(['GB','GO'].includes(type))return'GROUND';
  if(['LD','LO'].includes(type))return'LINE';
  if(['FB','FO'].includes(type))return'FLY';
  if(type==='PO')return'POPUP';
  return'';
 }
 function isSlapper(style){return String(style||'').toUpperCase()==='SL'}
 function isSwing(pitch){return SWING_RESULTS.has(pitch?.result)}
 function isContact(pitch){return CONTACT_RESULTS.has(pitch?.result)}
 function sideFor(pitch,player){return String(pitch?.hitterStyle||player?.side||'R').toUpperCase()}
 function locationGroup(pitch,player){
  const zone=String(pitch?.zone||'').toUpperCase(),left=['L','SL'].includes(sideFor(pitch,player));
  const inside=new Set(left?['L','L1','L2','C1','C3']:['R','R1','R2','C2','C4']);
  const outside=new Set(left?['R','R1','R2','C2','C4']:['L','L1','L2','C1','C3']);
  if(inside.has(zone))return'INSIDE';
  if(outside.has(zone))return'OUTSIDE';
  if(['T','T1','T2'].includes(zone))return'HIGH';
  if(['B','B1','B2'].includes(zone))return'LOW';
  return'MIDDLE';
 }
 function confidenceFor(paCount,thresholds){
  if(!paCount)return'no-data';
  if(paCount<thresholds.minimumPA)return'insufficient';
  if(paCount<thresholds.standardPA)return'preliminary';
  return'standard';
 }
 function ratio(part,total){return total?part/total:0}
 function percent(value){return`${Math.round(value*100)}%`}
 function gameTime(game){const value=new Date(game?.date).getTime();return Number.isFinite(value)?value:null}
 function paCount(games,hitter){return games.reduce((sum,game)=>sum+(game.plateAppearances||[]).filter(pa=>!hitter||pa.hitter===hitter).length,0)}
 function selectAnalysisGames(games,hitter,now,thresholds){
  const current=new Date(now||Date.now()).getTime(),valid=(games||[]).filter(game=>{
   const time=gameTime(game);return time!==null&&time<=current;
  }).sort((a,b)=>gameTime(b)-gameTime(a));
  const recent=valid.filter(game=>current-gameTime(game)<=14*DAY_MS);
  if(paCount(recent,hitter)>=thresholds.minimumPA)return{games:recent,window:'14-days'};
  const fallback=valid.filter(game=>current-gameTime(game)<=30*DAY_MS).slice(0,5);
  return{games:fallback,window:fallback.length?'fallback-30-days':'no-data'};
 }
 function collectRecords(games,hitter){
  const records=[];
  (games||[]).forEach(game=>(game.plateAppearances||[]).forEach(pa=>{
   if(hitter&&pa.hitter!==hitter)return;
   const pitches=(game.pitches||[]).filter(pitch=>pitch.hitter===pa.hitter&&pitch.pa===pa.pa);
   records.push({game,pa,pitches});
  }));
  return records;
 }
 function issue(id,label,category,rate,opportunities,evidence,focus){
  return{id,label,category,rate,opportunities,evidence,focus};
 }
 function detectIssues(records,player,scope,thresholds){
  const issues=[],pas=records.map(record=>record.pa),pitches=records.flatMap(record=>record.pitches);
  const battedRecords=records.filter(record=>normalizeContact(record.pa)&&!record.pa.bunt&&!record.pa.slap),batted=battedRecords.map(record=>record.pa),strikeouts=pas.filter(pa=>pa.outcome==='K');
  const kRate=ratio(strikeouts.length,pas.length);
  if(pas.length>=thresholds.minimumPA&&kRate>=(scope==='team'?.22:.25))issues.push(issue('strikeouts','Too Many Strikeouts','Swing Decisions',kRate,pas.length,`${strikeouts.length} strikeouts in ${pas.length} plate appearances`,'Pitch Recognition / Two-Strike Approach'));

  const terminalCalled=strikeouts.filter(pa=>{
   const record=records.find(item=>item.pa===pa),last=record?.pitches?.[record.pitches.length-1];return last?.result==='KL';
  }).length;
  const calledRate=ratio(terminalCalled,strikeouts.length);
  if(strikeouts.length>=3&&calledRate>=.4)issues.push(issue('called-strikeouts','Too Many Called Strikeouts','Swing Decisions',calledRate,strikeouts.length,`${terminalCalled} of ${strikeouts.length} strikeouts were called`,'Pitch Recognition / Two-Strike Approach'));

  const swings=pitches.filter(isSwing),misses=swings.filter(pitch=>pitch.result==='K'),missRate=ratio(misses.length,swings.length);
  if(swings.length>=thresholds.relevantPitches&&missRate>=.3)issues.push(issue('swing-miss','High Swing-and-Miss Rate','Contact / Barrel Control',missRate,swings.length,`${misses.length} misses on ${swings.length} swings`,'Contact / Barrel Control'));

  const contactCounts={GROUND:0,LINE:0,FLY:0,POPUP:0};
  batted.forEach(pa=>contactCounts[normalizeContact(pa)]++);
  const popupRate=ratio(contactCounts.POPUP,batted.length);
  if(batted.length>=thresholds.battedBalls&&contactCounts.POPUP>=2&&popupRate>=.18)issues.push(issue('popups','Frequent Pop-Ups','Contact / Barrel Control',popupRate,batted.length,`${contactCounts.POPUP} pop-ups in ${batted.length} batted balls`,'Posture / Barrel Path'));
  const groundEligible=battedRecords.filter(record=>!isSlapper(record.pitches[0]?.hitterStyle||player?.side)).map(record=>record.pa),groundCount=groundEligible.filter(pa=>normalizeContact(pa)==='GROUND').length,groundRate=ratio(groundCount,groundEligible.length);
  if(groundEligible.length>=thresholds.battedBalls&&groundRate>=.5)issues.push(issue('groundballs','High Groundball Rate','Contact Quality',groundRate,groundEligible.length,`${groundCount} groundballs in ${groundEligible.length} non-slap batted balls`,'Contact Point / Barrel Direction'));

  const weak=pas.filter(pa=>pa.weak).length,weakRate=ratio(weak,batted.length);
  if(batted.length>=thresholds.battedBalls&&weak>=2&&weakRate>=.3)issues.push(issue('weak-contact','Frequent Weak Contact','Contact Quality',weakRate,batted.length,`${weak} weak-contact results in ${batted.length} batted balls`,'Power / Centered Contact'));

  const groundThird=batted.filter(pa=>normalizeContact(pa)==='GROUND'&&Number(pa.fielder)===5&&pa.outcome==='H4O').length,thirdRate=ratio(groundThird,batted.length);
  if(batted.length>=thresholds.battedBalls&&groundThird>=2&&thirdRate>=.25)issues.push(issue('groundouts-third','Repeated Groundouts To Third','Contact Direction',thirdRate,batted.length,`${groundThird} groundouts to third in ${batted.length} batted balls`,'Timing / Opposite-Field Direction'));

  function contactIssue(id,label,category,filter,focus){
   const relevant=pitches.filter(filter),relevantSwings=relevant.filter(isSwing),contacts=relevantSwings.filter(isContact),contactRate=ratio(contacts.length,relevantSwings.length);
   if(relevant.length>=thresholds.relevantPitches&&relevantSwings.length>=thresholds.relevantSwings&&contactRate<.65)issues.push(issue(id,label,category,1-contactRate,relevantSwings.length,`${contacts.length} contacts on ${relevantSwings.length} swings`,focus));
  }
  contactIssue('outside-pitches','Struggling With Outside Pitches','Zone Coverage',pitch=>locationGroup(pitch,player)==='OUTSIDE','Outside Pitch Coverage');
  contactIssue('inside-pitches','Struggling With Inside Pitches','Zone Coverage',pitch=>locationGroup(pitch,player)==='INSIDE','Inside Pitch Coverage');
  contactIssue('high-rise','Struggling With High Or Rise Pitches','Pitch Type / Zone',pitch=>locationGroup(pitch,player)==='HIGH'||pitch.pitchType==='RS','High Pitch / Rise-Ball Coverage');
  contactIssue('changeup','Struggling With Changeups','Pitch Recognition',pitch=>pitch.pitchType==='CH','Changeup Recognition / Adjustability');

  const executionSuccesses=pas.reduce((sum,pa)=>sum+(Number(pa.executionSuccesses)||0),0),executionAttempts=pas.reduce((sum,pa)=>sum+(Number(pa.executionAttempts)||0),0),executionRate=ratio(executionSuccesses,executionAttempts);
  if(executionAttempts>=thresholds.executionAttempts&&executionRate<.65)issues.push(issue('execution','Low Hitting-Plan Execution','Approach',1-executionRate,executionAttempts,`${executionSuccesses} successful decisions in ${executionAttempts} graded opportunities`,'Approach / Zone Discipline'));

  return issues.sort((a,b)=>b.rate-a.rate||b.opportunities-a.opportunities||a.label.localeCompare(b.label));
 }
 function summarize(scope,games,player,options={}){
  const thresholds={...DEFAULT_THRESHOLDS[scope],...(options.thresholds||{})},hitter=scope==='player'?player?.name:null;
  const selection=selectAnalysisGames(games,hitter,options.now,thresholds),records=collectRecords(selection.games,hitter),PA=records.length,confidence=confidenceFor(PA,thresholds);
  const issues=['preliminary','standard'].includes(confidence)?detectIssues(records,player,scope,thresholds):[];
  return{scope,playerName:hitter||null,window:selection.window,gameCount:selection.games.length,plateAppearances:PA,confidence,thresholds,issues};
 }
 function analyzePlayer(games,player,options={}){return summarize('player',games,player,options)}
 function analyzeTeam(games,options={}){return summarize('team',games,null,options)}
 return{analyzePlayer,analyzeTeam,normalizeContact,locationGroup,DEFAULT_THRESHOLDS};
});
