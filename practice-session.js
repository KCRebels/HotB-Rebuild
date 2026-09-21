(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.HotBPracticeSession=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 function clone(value){return value==null?value:JSON.parse(JSON.stringify(value))}
 function create({plan,chosenDrills=[],draftDrills=[],drillPickerOpen=false,equipmentSetupOpen=false,setupState={},clock={},portalState=null}={}){
  if(!plan||!plan.portalDraftId)return null;
  return{version:4,stage:equipmentSetupOpen?'equipment':'schedule',savedAt:new Date().toISOString(),plan:clone(plan),chosenDrills:clone(chosenDrills),draftDrills:clone(draftDrills),drillPickerOpen:!!drillPickerOpen,equipmentSetupOpen:!!equipmentSetupOpen,setupState:clone(setupState),portalState:clone(portalState),clock:{running:!!clock.running,finished:!!clock.finished,endAnnounced:!!clock.endAnnounced,startAt:Number(clock.startAt)||0,lastBlock:Number(clock.lastBlock)||1,lastTwoMinuteBlock:Number(clock.lastTwoMinuteBlock)||0,lastTransitionBlock:Number(clock.lastTransitionBlock)||0,completedAt:clock.completedAt||null}};
 }
 function createDraft({setupState={},resolution=null}={}){return{version:5,stage:'setup',savedAt:new Date().toISOString(),plan:null,chosenDrills:[],setupState:clone(setupState),resolution:clone(resolution),portalState:null,clock:{running:false,finished:false,endAnnounced:false,startAt:0,lastBlock:1,lastTwoMinuteBlock:0,lastTransitionBlock:0,completedAt:null}}}
 function restore(saved,now=Date.now()){
  if(!saved||(!saved?.plan?.portalDraftId&&saved.stage!=='setup'))return null;
  const session=clone(saved),clock=session.clock||{};
  session.chosenDrills=Array.isArray(session.chosenDrills)?session.chosenDrills:[];
  session.draftDrills=Array.isArray(session.draftDrills)?session.draftDrills:[];
  session.drillPickerOpen=!!session.drillPickerOpen;
  session.equipmentSetupOpen=!!session.equipmentSetupOpen||session.stage==='equipment';
  session.setupState=session.setupState&&typeof session.setupState==='object'?session.setupState:{};
  session.resolution=session.resolution&&typeof session.resolution==='object'?session.resolution:null;
  session.portalState=session.portalState&&typeof session.portalState==='object'?session.portalState:null;
  session.clock={running:!!clock.running,finished:!!clock.finished,endAnnounced:!!clock.endAnnounced,startAt:Number(clock.startAt)||0,lastBlock:Number(clock.lastBlock)||1,lastTwoMinuteBlock:Number(clock.lastTwoMinuteBlock)||0,lastTransitionBlock:Number(clock.lastTransitionBlock)||0,completedAt:clock.completedAt||null};
  if(session.plan&&session.clock.running&&session.clock.startAt){
   const blockMs=(Number(session.plan.blockMinutes)||12)*60000,elapsed=Math.max(0,Number(now)-session.clock.startAt),recoveredBlock=Math.max(1,Math.min(Number(session.plan?.times?.length)||10,Math.floor(elapsed/blockMs)+1));
   session.clock.lastBlock=Math.max(Number(session.clock.lastBlock)||1,recoveredBlock);
  }
  return session;
 }
 function layout(plan){
  const blockMs=(Number(plan?.blockMinutes)||12)*60000,transitionMs=Math.min(60000,Math.max(0,blockMs-60000)),workMs=blockMs-transitionMs;
  const blockCount=Number(plan?.times?.length)||10;return{blockMs,transitionMs,workMs,blockCount,totalMs:blockMs*blockCount-transitionMs};
 }
 function timing(plan,clock,now=Date.now()){
  if(!plan||!clock?.running||!clock.startAt)return null;
  const {blockMs,workMs,totalMs,blockCount}=layout(plan),elapsed=Math.max(0,Number(now)-Number(clock.startAt));
  if(elapsed>=totalMs)return null;
  const block=Math.min(blockCount,Math.floor(elapsed/blockMs)+1),elapsedInBlock=elapsed%blockMs,transition=block<blockCount&&elapsedInBlock>=workMs;
  const remaining=block===blockCount?totalMs-elapsed:(transition?blockMs:workMs)-elapsedInBlock;
  return{block,remaining,transition};
 }
 function pendingTwoMinuteWarning(plan,clock,now=Date.now()){
  const state=timing(plan,clock,now),{workMs}=layout(plan);
  if(!state||state.transition||workMs<=120000)return null;
  if(state.remaining<=120000&&state.remaining>0&&Number(clock.lastTwoMinuteBlock)!==state.block)return state.block;
  return null;
 }
 function pendingTransitionWarning(plan,clock,now=Date.now()){
  const state=timing(plan,clock,now);
  if(!state||!state.transition||Number(clock.lastTransitionBlock)===state.block)return null;
  return state.block;
 }
 return{create,createDraft,restore,layout,timing,pendingTwoMinuteWarning,pendingTransitionWarning};
});
