(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.HotBPracticeSession=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 function clone(value){return value==null?value:JSON.parse(JSON.stringify(value))}
 function create({plan,chosenDrills=[],setupState={},clock={}}={}){
  if(!plan||!plan.portalDraftId)return null;
  return{version:1,savedAt:new Date().toISOString(),plan:clone(plan),chosenDrills:clone(chosenDrills),setupState:clone(setupState),clock:{running:!!clock.running,finished:!!clock.finished,startAt:Number(clock.startAt)||0,lastBlock:Number(clock.lastBlock)||1}};
 }
 function restore(saved,now=Date.now()){
  if(!saved?.plan?.portalDraftId)return null;
  const session=clone(saved),clock=session.clock||{};
  session.chosenDrills=Array.isArray(session.chosenDrills)?session.chosenDrills:[];
  session.setupState=session.setupState&&typeof session.setupState==='object'?session.setupState:{};
  session.clock={running:!!clock.running,finished:!!clock.finished,startAt:Number(clock.startAt)||0,lastBlock:Number(clock.lastBlock)||1};
  if(session.clock.running&&session.clock.startAt){
   const blockMs=(Number(session.plan.blockMinutes)||12)*60000,elapsed=Math.max(0,Number(now)-session.clock.startAt);
   session.clock.lastBlock=Math.max(1,Math.min(10,Math.floor(elapsed/blockMs)+1));
  }
  return session;
 }
 return{create,restore};
});
