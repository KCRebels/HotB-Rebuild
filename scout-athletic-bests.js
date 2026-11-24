/* Read-only Rebels Scout athletic bests for Aniesa's HotB coach Evaluation.
   Scout owns the figures; this script never changes HotB saved attempts. */
(()=>{
 const url='https://rebelsscout.com/aniesa-rohleder/athletic-bests.json';
 let values=null,attempted=false,loading=false,queued=false;
 async function load(){
  if(attempted||loading)return;
  loading=true;
  try{
   const res=await fetch(url,{cache:'no-store'});
   if(!res.ok)throw Error('Scout HTTP '+res.status);
   const data=await res.json();
   if(data.player!=='Aniesa Rohleder'||data.schemaVersion!==1||
      !Array.isArray(data.measurements))throw Error('Unexpected Scout data');
   const expected=['Home to First','Overhand Throw','Exit Velocity','Broad Jump','Fastball','Changeup'];
   const found=Object.fromEntries(data.measurements.filter(x=>expected.includes(x.type)&&
      typeof x.value==='number'&&Number.isFinite(x.value)&&x.value>0).map(x=>[x.type,x.value]));
   if(expected.some(t=>!Number.isFinite(found[t])))throw Error('Incomplete Scout data');
   values=found;
  }catch(e){console.warn('Scout athletic bests could not load in HotB',e)}
  finally{attempted=true;loading=false;apply()}
 }
 function apply(){
  const app=document.querySelector('.eval-app');
  if(!app||app.querySelector('#evalSelect')?.value!=='Aniesa Rohleder')return;
  if(!attempted){load();return}
  if(!values)return;
  const grid=app.querySelector('.athletic .measure-grid');
  if(!grid)return;
  for(const card of grid.querySelectorAll('.measure')){
   const title=card.querySelector('h3')?.textContent?.trim(),best=values[title];
   if(!Number.isFinite(best))continue;
   const value=title==='Home to First'?best.toFixed(2):String(best);
   const bestEl=card.querySelector('.best'),note=card.querySelector('.note');
   if(bestEl&&bestEl.textContent!==value)bestEl.textContent=value;
   const label='Rebels Scout · Verified Sept. 25, 2026';
   if(note&&note.textContent!==label)note.textContent=label;
   if(card.dataset.scoutOwned!=='true'){
    card.dataset.scoutOwned='true';
    card.setAttribute('title','Verified athletic best from Rebels Scout; Scout is the source');
   }
  }
 }
 function queue(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply()})}
 const start=()=>{new MutationObserver(queue).observe(document.getElementById('app')||document.body,{childList:true,subtree:true,characterData:true});queue()};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
