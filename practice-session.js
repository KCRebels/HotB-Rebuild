(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.HotBPracticeSession=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 function clone(value){return value==null?value:JSON.parse(JSON.stringify(value))}
 function create({plan,chosenDrills=[],setupState={},clock={}}={}){
  if(!plan||!plan.portalDraftId)return null;
  return{version:1,savedAt:new Date().toISOString(),plan:clone(plan),chosenDrills:clone(chosenDrills),setupState:clone(setupState),clock:{running:!!clock.running,finished:!!clock.finished,startAt:Number(clock.startAt)||0,lastBlock:Number(clock.lastBlock)||1,lastTwoMinuteBlock:Number(clock.lastTwoMinuteBlock)||0,lastTransitionBlock:Number(clock.lastTransitionBlock)||0}};
 }
 function restore(saved,now=Date.now()){
  if(!saved?.plan?.portalDraftId)return null;
  const session=clone(saved),clock=session.clock||{};
  session.chosenDrills=Array.isArray(session.chosenDrills)?session.chosenDrills:[];
  session.setupState=session.setupState&&typeof session.setupState==='object'?session.setupState:{};
  session.clock={running:!!clock.running,finished:!!clock.finished,startAt:Number(clock.startAt)||0,lastBlock:Number(clock.lastBlock)||1,lastTwoMinuteBlock:Number(clock.lastTwoMinuteBlock)||0,lastTransitionBlock:Number(clock.lastTransitionBlock)||0};
  if(session.clock.running&&session.clock.startAt){
   const blockMs=(Number(session.plan.blockMinutes)||12)*60000,elapsed=Math.max(0,Number(now)-session.clock.startAt);
   session.clock.lastBlock=Math.max(1,Math.min(10,Math.floor(elapsed/blockMs)+1));
  }
  return session;
 }
 function timing(plan,clock,now=Date.now()){
  if(!plan||!clock?.running||!clock.startAt)return null;
  const blockMs=(Number(plan.blockMinutes)||12)*60000,totalMs=blockMs*10,elapsed=Math.max(0,Number(now)-Number(clock.startAt));
  if(elapsed>=totalMs)return null;
  const block=Math.floor(elapsed/blockMs)+1,remaining=blockMs-(elapsed%blockMs);
  return{block,remaining,transition:block<10&&remaining<=60000};
 }
 function pendingTwoMinuteWarning(plan,clock,now=Date.now()){
  const state=timing(plan,clock,now),blockMs=(Number(plan?.blockMinutes)||12)*60000;
  if(!state||blockMs<=120000)return null;
  if(state.remaining<=120000&&state.remaining>115000&&Number(clock.lastTwoMinuteBlock)!==state.block)return state.block;
  return null;
 }
 function pendingTransitionWarning(plan,clock,now=Date.now()){
  const state=timing(plan,clock,now);
  if(!state||!state.transition||state.remaining<=55000||Number(clock.lastTransitionBlock)===state.block)return null;
  return state.block;
 }
 return{create,restore,timing,pendingTwoMinuteWarning,pendingTransitionWarning};
});
