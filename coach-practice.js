(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.HotBCoachPractice=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 const first=name=>String(name||'').trim().split(/\s+/)[0]||'';
 function build(plan,drills=[]){
  if(!plan?.blocks?.length)return [];
  return plan.blocks.map((block,index)=>{
   const entries=Object.entries(block.assignments||{}),live=(plan.liveSessions||[]).find(session=>session.block===index);
   const namesFor=predicate=>entries.filter(([label])=>predicate(label)).flatMap(([,names])=>names||[]).map(first);
   const coachWarmups=namesFor(label=>/^Pitch Warm-Up — Coach$/.test(label));
   let assignment='Equipment / Float';
   if(live?.pitcher==='Coach')assignment=`Coach Pitch Live — ${(live.hitters||[]).map(first).join(', ')}`;
   else if(coachWarmups.length)assignment=`Catch Pitch Warm-Up — ${coachWarmups[0]}`;
   else{
    const front=entries.find(([label])=>/^Front Toss Lane 1$/.test(label));
    const machine=entries.find(([label])=>label==='Machine');
    if(front)assignment=`Throw Front Toss — Lane 1 — ${(front[1]||[]).map(first).join(', ')}`;
    else if(machine)assignment=`Run Machine — ${(machine[1]||[]).map(first).join(', ')}`;
    else if(index===0)assignment='Help Lead Warm-Up';
    else if(index===1)assignment='Help With Tee Work';
    else if(live)assignment=`Live Support — ${first(live.pitcher)} (${first(live.catcher)})`;
    else{
     const drill=entries.find(([label])=>/^Drill #(\d+)$/.test(label));
     if(drill){
      const number=Number(drill[0].match(/\d+/)?.[0]),name=drills[number-1]?.name||drill[0];
      assignment=`Help With ${name} — ${(drill[1]||[]).map(first).join(', ')}`;
     }
    }
   }
   return{block:block.block||index+1,time:`${block.start}–${block.end}`,assignment};
  });
 }
 return{build};
});
