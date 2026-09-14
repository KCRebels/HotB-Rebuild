(()=>{
 const readDb=()=>{try{return JSON.parse(localStorage.getItem('hotbRebuildDbV1')||'{}')}catch(error){return{}}};
 const selectedPlayer=()=>String(document.querySelector('.eval-app .player-profile .name')?.textContent||document.querySelector('#evalSelect')?.value||'').trim();
 const allPAs=data=>(Array.isArray(data.savedGames)?data.savedGames:[]).flatMap(game=>Array.isArray(game.plateAppearances)?game.plateAppearances:[]);
 const statsFor=pas=>window.HotBEvaluationStats?.statsForPAs?window.HotBEvaluationStats.statsForPAs(pas):null;
 const decimal3=v=>Number(v).toFixed(3).replace(/^0(?=\.)/,'');
 const sortRows=(rows,lower=false)=>rows.sort((a,b)=>{
  if(a.value===null&&b.value===null)return a.name.localeCompare(b.name);
  if(a.value===null)return 1;if(b.value===null)return-1;
  return (lower?a.value-b.value:b.value-a.value)||a.name.localeCompare(b.name);
 });
 function showRanking(label,rows,note){
  document.querySelector('#directPlayerEvalRankingBackdrop')?.remove();
  const selected=selectedPlayer(),backdrop=document.createElement('div');
  backdrop.id='directPlayerEvalRankingBackdrop';backdrop.className='modal-backdrop';
  backdrop.innerHTML=`<div class="modal dark ranking-modal"><div class="modal-header"><div><div class="small ranking-kicker">FULL ROSTER RANKINGS</div><h2>${label}</h2></div><button class="btn" data-direct-hitting-close>Close</button></div><div class="ranking-list">${rows.map((row,index)=>`<div class="ranking-row ${row.name===selected?'selected-player':''}"><span class="ranking-place">${row.value===null?'—':index+1}</span><span class="ranking-name">${row.name}${row.sub?`<small>${row.sub}</small>`:''}</span><strong>${row.display}</strong></div>`).join('')}</div><p class="small" style="color:#ddd;margin:14px 4px 0">${note}</p></div>`;
  backdrop.querySelector('[data-direct-hitting-close]')?.addEventListener('click',()=>backdrop.remove());
  backdrop.addEventListener('click',event=>{if(event.target===backdrop)backdrop.remove()});
  document.body.appendChild(backdrop);
 }
 const hitting={
  AVG:{key:'AVG',lower:false,format:decimal3},
  OBP:{key:'OBP',lower:false,format:decimal3},
  SLG:{key:'SLG',lower:false,format:decimal3},
  CONTACT:{key:'contactPct',lower:false,format:v=>`${Math.round(Number(v)*100)}%`},
  'K%':{key:'kPct',lower:true,format:v=>`${Math.round(Number(v)*100)}%`},
  'HHB%':{key:'hhbPct',lower:false,format:v=>`${Math.round(Number(v)*100)}%`},
  'QAB%':{key:'qabPct',lower:false,format:v=>`${Math.round(Number(v)*100)}%`}
 };
 function openHitting(label){
  const def=hitting[label];if(!def)return false;
  const data=readDb(),roster=Array.isArray(data.roster)?data.roster:[],pas=allPAs(data);
  const rows=sortRows(roster.map(player=>{
   const stats=statsFor(pas.filter(pa=>pa.hitter===player.name));
   const number=stats&&stats.PA?Number(stats[def.key]):null,value=Number.isFinite(number)?number:null;
   return{name:player.name,value,display:value===null?'—':def.format(value),sub:`${stats?.PA||0} PA`};
  }),def.lower);
  showRanking(label,rows,`${def.lower?'Lower':'Higher'} ${label} ranks first.`);return true;
 }
 function openSummary(metric){
  if(!['HotB+','Runs Produced','Execution','Reach%'].includes(metric))return false;
  const data=readDb(),roster=Array.isArray(data.roster)?data.roster:[],pas=allPAs(data),team=statsFor(pas),teamRate=team?.PA?team.rp/team.PA:0;
  const rows=roster.map(player=>{
   const playerPas=pas.filter(pa=>pa.hitter===player.name),stats=statsFor(playerPas);let value=null,display='—';
   if(metric==='HotB+')value=stats?.PA&&teamRate?(stats.rp/stats.PA)/teamRate*100:null;
   else if(metric==='Runs Produced')value=stats?.PA?stats.rp:null;
   else if(metric==='Reach%')value=stats?.PA?stats.reachPct:null;
   else{
    const totals=playerPas.reduce((sum,pa)=>({success:sum.success+Number(pa.executionSuccesses||0),attempts:sum.attempts+Number(pa.executionAttempts||0)}),{success:0,attempts:0});
    value=totals.attempts?totals.success/totals.attempts:null;
   }
   if(Number.isFinite(value))display=metric==='HotB+'?String(Math.round(value)):metric==='Runs Produced'?Number(value).toFixed(1):`${Math.round(value*100)}%`;
   return{name:player.name,value:Number.isFinite(value)?value:null,display,sub:`${stats?.PA||0} PA`};
  });
  sortRows(rows,false);const label=metric==='Execution'?'HP%':metric;
  showRanking(label,rows,`Higher ${label} ranks first.`);return true;
 }
 let lastOpen=0;
 function handle(event){
  const target=event.target instanceof Element?event.target:null;if(!target||!target.closest('.eval-app'))return;
  if(target.closest('.metric-title,.perf-metric'))return;
  let opened=false;
  const perf=target.closest('.eval-app .perf');
  if(perf){const label=String(perf.querySelector('.perf-metric')?.textContent||'').trim().toUpperCase();opened=openHitting(label)}
  else{
   const tile=target.closest('.eval-app .eval-tile');
   if(tile){const metric=tile.querySelector('.metric-title')?.dataset.guide;opened=openSummary(metric)}
  }
  if(!opened)return;
  event.preventDefault();event.stopImmediatePropagation();lastOpen=Date.now();
 }
 // Window capture runs before the older document handler, so every player uses one direct path.
 window.addEventListener('pointerup',handle,true);
 window.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;
  if(!target||!target.closest('.eval-app .perf,.eval-app .eval-tile')||target.closest('.metric-title,.perf-metric'))return;
  if(Date.now()-lastOpen<700){event.preventDefault();event.stopImmediatePropagation();return}
  handle(event);
 },true);
})();