(function(root){
  const scheduler=root.HotBPracticeScheduler;
  if(!scheduler||typeof scheduler.buildSchedule!=='function')return;
  const originalBuild=scheduler.buildSchedule.bind(scheduler);
  const STATIONS=['Machine','Front Toss'];
  const replaceable=entry=>!entry||entry.activity==='Drill'||entry.activity==='Recovery / Skill Work'||entry.activity==='Machine'||String(entry.activity||'').startsWith('Front Toss');
  function stationMatch(entry,activity){return activity==='Machine'?entry?.activity==='Machine':String(entry?.activity||'').startsWith('Front Toss')}
  function legalSizes(count){if(count<2)return null;const sizes=[];if(count%2){sizes.push(3);count-=3}while(count>0){sizes.push(2);count-=2}return sizes}
  function reserveGroups(plan,players,activity){
    const sizes=legalSizes(players.length);if(!sizes)return null;
    const blocks=Array.from({length:10},(_,block)=>block);
    const options=new Map(players.map(player=>[player.name,blocks.filter(block=>replaceable(plan.schedule[player.name]?.[block]))]));
    if([...options.values()].some(list=>!list.length))return null;
    const remaining=new Set(players.map(player=>player.name)),groups=[];
    function solve(groupIndex){
      if(groupIndex===sizes.length)return remaining.size===0;
      const size=sizes[groupIndex];
      const names=[...remaining].sort((a,b)=>options.get(a).length-options.get(b).length||a.localeCompare(b));
      const anchor=names[0];
      for(const block of options.get(anchor)){
        const mates=names.slice(1).filter(name=>options.get(name).includes(block));
        const need=size-1;
        function choose(start,picked){
          if(picked.length===need){
            const group=[anchor,...picked];group.forEach(name=>remaining.delete(name));groups.push({block,names:group});
            if(solve(groupIndex+1))return true;
            groups.pop();group.forEach(name=>remaining.add(name));return false;
          }
          for(let i=start;i<=mates.length-(need-picked.length);i++)if(choose(i+1,[...picked,mates[i]]))return true;
          return false;
        }
        if(choose(0,[]))return true;
      }
      return false;
    }
    return solve(0)?groups:null;
  }
  function applyStation(plan,players,activity){
    const groups=reserveGroups(plan,players,activity);if(!groups)return false;
    for(const player of players)for(let block=0;block<10;block++)if(stationMatch(plan.schedule[player.name]?.[block],activity))plan.schedule[player.name][block]={activity:'Drill'};
    groups.forEach((group,index)=>group.names.forEach(name=>{plan.schedule[name][group.block]={activity:activity==='Front Toss'?`Front Toss Lane ${index+1}`:'Machine'}}));
    return true;
  }
  scheduler.buildSchedule=function(players,startTime,durationMinutes,options){
    const plan=originalBuild(players,startTime,durationMinutes,options);
    const attendees=(players||[]).filter(player=>player&&player.name&&Number(player.availableFromBlock??0)<Number(player.availableUntilBlock??10));
    if(!plan||!plan.schedule||attendees.length<2)return plan;
    let changed=false;
    for(const activity of STATIONS){
      const missing=attendees.some(player=>!plan.schedule[player.name]?.some(entry=>stationMatch(entry,activity)));
      if(missing&&applyStation(plan,attendees,activity))changed=true;
    }
    if(changed){
      const stationError=/could not give every player (Machine|Front Toss)|keeping all (Machine|Front Toss) groups/i;
      if(Array.isArray(plan.errors))plan.errors=plan.errors.filter(error=>!stationError.test(error));
      if(Array.isArray(plan.feasibilityErrors))plan.feasibilityErrors=plan.feasibilityErrors.filter(error=>!stationError.test(error));
    }
    return plan;
  };
})(typeof globalThis!=='undefined'?globalThis:this);
