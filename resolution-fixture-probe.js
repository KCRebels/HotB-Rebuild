const scheduler=require('./practice-scheduler.js');
const roster=[
 ['Aniesa Rohleder',1,0],['Brooklyn Gering',1,0],['Brynna Peter',0,0],['Claire Jack',0,0],['Hailey Marsh',0,0],['Lakyn Farley',1,0],['Lydia Copeland',0,1],['Maia Waddell',0,0],['Makenna Whitaker',1,0],['Maleah Pena',0,0],['Mattingly Hardy',0,0],['Megan Ryan',1,0],['Tayte Stepps',0,1]
].map(([name,p,c])=>({name,isPitcher:!!p,isCatcher:!!c,canPitch:!!p,requiresPitchWarmup:!!p,canCatch:!!c,availableFromBlock:0,availableUntilBlock:10,prePracticeComplete:false,isGuest:false}));
const safe=(players,duration)=>{const p=scheduler.buildSchedule(players,'18:00',duration);return !(p.feasibilityErrors||[]).length&&!scheduler.validate(p).length};
const extend=players=>players.map(p=>({...p,availableUntilBlock:p.availableUntilBlock===10?11:p.availableUntilBlock}));
const pitcherIndexes=roster.map((p,i)=>p.isPitcher?i:-1).filter(i=>i>=0);
const departures=[4,5,6,7,8,9,10],found={extension:null,combinedPitcher:null,combinedCatcher:null};
let checks=0; const MAX_CHECKS=900;
for(let mask=0;mask<(1<<pitcherIndexes.length);mask++){
 for(let early=-1;early<roster.length;early++)for(const until of departures){
  if(++checks>MAX_CHECKS)break;
  const r=roster.map(p=>({...p}));
  pitcherIndexes.forEach((idx,bit)=>{if(mask&(1<<bit)){r[idx].canPitch=false;r[idx].requiresPitchWarmup=false}});
  if(early>=0)r[early].availableUntilBlock=until;
  if(safe(r,120))continue;
  const ext=extend(r);
  if(!found.extension&&safe(ext,132))found.extension={mask,early:early<0?null:roster[early].name,until};
  for(const p of r.filter(x=>x.canPitch)){
   const single=r.map(x=>x.name===p.name?{...x,canPitch:false,requiresPitchWarmup:false}:x);
   const combo=ext.map(x=>x.name===p.name?{...x,canPitch:false,requiresPitchWarmup:false}:x);
   if(!found.combinedPitcher&&!safe(single,120)&&safe(combo,132))found.combinedPitcher={mask,early:early<0?null:roster[early].name,until,name:p.name};
  }
  for(const p of r.filter(x=>x.canCatch)){
   const single=r.map(x=>x.name===p.name?{...x,canCatch:false}:x);
   const combo=ext.map(x=>x.name===p.name?{...x,canCatch:false}:x);
   if(!found.combinedCatcher&&!safe(single,120)&&safe(combo,132))found.combinedCatcher={mask,early:early<0?null:roster[early].name,until,name:p.name};
  }
  if(found.extension&&found.combinedPitcher&&found.combinedCatcher)break;
 }
 if(found.extension&&found.combinedPitcher&&found.combinedCatcher)break;
 if(checks>MAX_CHECKS)break;
}
console.log(JSON.stringify({checks,found}));
