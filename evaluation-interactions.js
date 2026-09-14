(()=>{
 // Keep title behavior inside app.js exactly as originally designed.
 // This helper restores hitting colors, formats displayed pitching stats,
 // and opens direct ranking modals from Player Eval stat cards.
 const spreadsheetPitchingV2={
  'Aniesa Rohleder':{pitcherIP:'5.0',pitcherERA:'7.000',pitcherWHIP:'2.000',pitcherKBB:'1.333',pitcherOBA:'.292',pitcherStrikePct:'57.58%'},
  'Brooklyn Gering':{pitcherIP:'3.0',pitcherERA:'9.333',pitcherWHIP:'2.667',pitcherKBB:'.167',pitcherOBA:'.200',pitcherStrikePct:'49.23%'},
  'Lakyn Farley':{pitcherIP:'6.1',pitcherERA:'1.105',pitcherWHIP:'.632',pitcherKBB:'1.500',pitcherOBA:'.095',pitcherStrikePct:'59.09%'},
  'Megan Ryan':{pitcherIP:'4.0',pitcherERA:'5.250',pitcherWHIP:'1.750',pitcherKBB:'3.000',pitcherOBA:'.353',pitcherStrikePct:'62.34%'},
  'Makenna Whitaker':{pitcherIP:'2.0',pitcherERA:'7.000',pitcherWHIP:'2.500',pitcherKBB:'.000',pitcherOBA:'.286',pitcherStrikePct:'44.12%'}
 };
 function applySpreadsheetPitchingV2(){
  try{
   const key='hotbRebuildDbV1',stored=localStorage.getItem(key);
   if(!stored)return false;
   const data=JSON.parse(stored);
   if(!data||!Array.isArray(data.roster)||(data.pitchingSpreadsheetVersion||0)>=1)return false;
   data.roster.forEach(player=>{if(spreadsheetPitchingV2[player.name])Object.assign(player,spreadsheetPitchingV2[player.name])});
   data.pitchingSpreadsheetVersion=1;
   localStorage.setItem(key,JSON.stringify(data));
   if(localStorage.getItem('hotbCloudBackupEnabledV1')==='true')localStorage.setItem('hotbCloudPendingV1','true');
   return true;
  }catch(error){return false}
 }
 const grade=(value,metric)=>{
  if(!Number.isFinite(value))return'';
  if(metric==='AVG')return value>=.4?'excellent':value>=.35?'good':value>=.3?'acceptable':value>=.25?'concern':'serious';
  if(metric==='OBP')return value>=.475?'excellent':value>=.425?'good':value>=.375?'acceptable':value>=.325?'concern':'serious';
  if(metric==='SLG')return value>=.6?'excellent':value>=.5?'good':value>=.4?'acceptable':value>=.325?'concern':'serious';
  if(metric==='CONTACT')return value>=90?'excellent':value>=85?'good':value>=80?'acceptable':value>=75?'concern':'serious';
  if(metric==='K%')return value<10?'excellent':value<=15?'good':value<=20?'acceptable':value<=25?'concern':'serious';
  return'';
 };
 function restoreColorsAndRoundHitting(){
  document.querySelectorAll('.eval-app .perf').forEach(card=>{
   const metric=String(card.querySelector('.perf-metric')?.textContent||'').trim().toUpperCase();
   const stat=card.querySelector(':scope>b');
   const text=String(stat?.textContent||'').trim();
   let value=Number(text.replace('%',''));
   if(['AVG','OBP','SLG'].includes(metric))value=Number(text);
   ['excellent','good','acceptable','concern','serious'].forEach(name=>card.classList.remove(name));
   const rating=grade(value,metric);if(rating)card.classList.add(rating);
   if(stat&&['K%','HHB%'].includes(metric)&&Number.isFinite(value))stat.textContent=`${Math.round(value)}%`;
  });
 }
 function refreshPitchingDisplay(){
  document.querySelectorAll('.eval-app .pitcher-stat').forEach(card=>{
   const label=card.querySelector('span');
   const labelText=String(label?.textContent||'').trim().toUpperCase();
   if(labelText==='OBA'&&label)label.textContent='BAA';
   const value=card.querySelector(':scope>b');
   if(!value)return;
   const number=Number(String(value.textContent||'').replace('%','').trim());
   if(!Number.isFinite(number))return;
   if(labelText==='STRIKE %')value.textContent=`${Math.round(number)}%`;
   else if(labelText==='ERA'||labelText==='WHIP')value.textContent=number.toFixed(2);
  });
  document.querySelectorAll('.pitching-import-modal small').forEach(label=>{if(String(label.textContent||'').trim().toUpperCase()==='OBA')label.textContent='BAA'});
  document.querySelectorAll('.player-info-modal .info-field>span').forEach(label=>{if(String(label.textContent||'').includes('Opponent Batting Average (OBA)'))label.textContent='Batting Average Against (BAA)'});
 }
 const readDb=()=>{try{return JSON.parse(localStorage.getItem('hotbRebuildDbV1')||'{}')}catch(error){return{}}};
 const selectedPlayer=()=>String(document.querySelector('#evalSelect')?.value||'').trim();
 function allPlateAppearances(data){return (Array.isArray(data.savedGames)?data.savedGames:[]).flatMap(game=>Array.isArray(game.plateAppearances)?game.plateAppearances:[])}
 function statForPas(pas){return window.HotBEvaluationStats?.statsForPAs?window.HotBEvaluationStats.statsForPAs(pas):null}
 function showRanking({label,rows,note=''}){
  document.querySelector('#directPlayerEvalRankingBackdrop')?.remove();
  const selected=selectedPlayer(),backdrop=document.createElement('div');
  backdrop.id='directPlayerEvalRankingBackdrop';backdrop.className='modal-backdrop';
  backdrop.innerHTML=`<div class="modal dark ranking-modal"><div class="modal-header"><div><div class="small ranking-kicker">FULL ROSTER RANKINGS</div><h2>${label}</h2></div><button class="btn" data-direct-rank-close>Close</button></div><div class="ranking-list">${rows.map((row,index)=>`<div class="ranking-row ${row.name===selected?'selected-player':''}"><span class="ranking-place">${row.value===null?'—':index+1}</span><span class="ranking-name">${row.name}${row.sub?`<small>${row.sub}</small>`:''}</span><strong>${row.display}</strong></div>`).join('')}</div>${note?`<p class="small" style="color:#ddd;margin:14px 4px 0">${note}</p>`:''}</div>`;
  backdrop.querySelector('[data-direct-rank-close]')?.addEventListener('click',()=>backdrop.remove());
  backdrop.addEventListener('click',event=>{if(event.target===backdrop)backdrop.remove()});
  document.body.appendChild(backdrop);
 }
 function sortRows(rows,lowerIsBetter=false){
  return rows.sort((a,b)=>{
   if(a.value===null&&b.value===null)return a.name.localeCompare(b.name);
   if(a.value===null)return 1;if(b.value===null)return-1;
   return (lowerIsBetter?a.value-b.value:b.value-a.value)||a.name.localeCompare(b.name);
  });
 }
 const pitchingDefinitions={
  pitcherIP:{label:'IP',lowerIsBetter:false,format:value=>String(value)},
  pitcherERA:{label:'ERA',lowerIsBetter:true,format:value=>Number(value).toFixed(2)},
  pitcherWHIP:{label:'WHIP',lowerIsBetter:true,format:value=>Number(value).toFixed(2)},
  pitcherKBB:{label:'K/BB',lowerIsBetter:false,format:value=>Number(value).toFixed(3)},
  pitcherOBA:{label:'BAA',lowerIsBetter:true,format:value=>Number(value).toFixed(3).replace(/^0/,'.')},
  pitcherStrikePct:{label:'Strike %',lowerIsBetter:false,format:value=>`${Math.round(Number(value))}%`}
 };
 function openPitchingRanking(key){
  const definition=pitchingDefinitions[key];if(!definition)return;
  const data=readDb(),roster=Array.isArray(data.roster)?data.roster:[];
  const pitchers=roster.filter(player=>Object.keys(pitchingDefinitions).some(statKey=>String(player[statKey]??'').trim()!==''));
  const rows=sortRows(pitchers.map(player=>{const raw=String(player[key]??'').trim(),number=raw===''?null:Number(raw.replace('%',''));return{name:player.name,value:Number.isFinite(number)?number:null,display:Number.isFinite(number)?definition.format(number):'—'}}),definition.lowerIsBetter);
  showRanking({label:definition.label,rows,note:`${definition.lowerIsBetter?'Lower':'Higher'} ${definition.label} ranks first.`});
 }
 const hittingDefinitions={
  AVG:{label:'AVG',key:'AVG',lowerIsBetter:false,format:value=>Number(value).toFixed(3).replace(/^0/,'.')},
  OBP:{label:'OBP',key:'OBP',lowerIsBetter:false,format:value=>Number(value).toFixed(3).replace(/^0/,'.')},
  SLG:{label:'SLG',key:'SLG',lowerIsBetter:false,format:value=>Number(value).toFixed(3).replace(/^0/,'.')},
  CONTACT:{label:'CONTACT',key:'contactPct',lowerIsBetter:false,format:value=>`${Math.round(Number(value)*100)}%`},
  'K%':{label:'K%',key:'kPct',lowerIsBetter:true,format:value=>`${Math.round(Number(value)*100)}%`},
  'HHB%':{label:'HHB%',key:'hhbPct',lowerIsBetter:false,format:value=>`${Math.round(Number(value)*100)}%`},
  'QAB%':{label:'QAB%',key:'qabPct',lowerIsBetter:false,format:value=>`${Math.round(Number(value)*100)}%`}
 };
 function openHittingRanking(label){
  const definition=hittingDefinitions[label];if(!definition)return;
  const data=readDb(),roster=Array.isArray(data.roster)?data.roster:[],pas=allPlateAppearances(data);
  const rows=sortRows(roster.map(player=>{const stats=statForPas(pas.filter(pa=>pa.hitter===player.name)),value=stats&&stats.PA?Number(stats[definition.key]):null;return{name:player.name,value:Number.isFinite(value)?value:null,display:Number.isFinite(value)?definition.format(value):'—',sub:`${stats?.PA||0} PA`}}),definition.lowerIsBetter);
  showRanking({label:definition.label,rows,note:`${definition.lowerIsBetter?'Lower':'Higher'} ${definition.label} ranks first.`});
 }
 function openSummaryRanking(metric){
  const data=readDb(),roster=Array.isArray(data.roster)?data.roster:[],pas=allPlateAppearances(data),teamStats=statForPas(pas),teamRate=teamStats?.PA?teamStats.rp/teamStats.PA:0;
  const rows=roster.map(player=>{
   const playerPas=pas.filter(pa=>pa.hitter===player.name),stats=statForPas(playerPas);let value=null,display='—';
   if(metric==='HotB+')value=stats?.PA&&teamRate?(stats.rp/stats.PA)/teamRate*100:null;
   else if(metric==='Runs Produced')value=stats?.PA?stats.rp:null;
   else if(metric==='Reach%')value=stats?.PA?stats.reachPct:null;
   else if(metric==='Execution'){
    const totals=playerPas.reduce((sum,pa)=>({success:sum.success+Number(pa.executionSuccesses||0),attempts:sum.attempts+Number(pa.executionAttempts||0)}),{success:0,attempts:0});
    value=totals.attempts?totals.success/totals.attempts:null;
   }
   if(Number.isFinite(value))display=metric==='HotB+'?String(Math.round(value)):metric==='Runs Produced'?Number(value).toFixed(1):`${Math.round(value*100)}%`;
   return{name:player.name,value:Number.isFinite(value)?value:null,display,sub:`${stats?.PA||0} PA`};
  });
  sortRows(rows,false);
  const label=metric==='Execution'?'HP%':metric;
  showRanking({label,rows,note:`Higher ${label} ranks first.`});
 }
 function refresh(){requestAnimationFrame(()=>{restoreColorsAndRoundHitting();refreshPitchingDisplay()});}
 document.addEventListener('click',event=>{
  const pitchCard=event.target.closest('.eval-app .pitcher-stat[data-pitch-ranking]');
  if(pitchCard){event.preventDefault();event.stopImmediatePropagation();openPitchingRanking(pitchCard.dataset.pitchRanking);return}
  const perfCard=event.target.closest('.eval-app .perf');
  if(perfCard&&!event.target.closest('.perf-metric')){
   const label=String(perfCard.querySelector('.perf-metric')?.textContent||'').trim().toUpperCase();
   if(hittingDefinitions[label]){event.preventDefault();event.stopImmediatePropagation();openHittingRanking(label);return}
  }
  const summaryValue=event.target.closest('.eval-app .eval-tile>.value');
  if(summaryValue){
   const tile=summaryValue.closest('.eval-tile'),metric=tile?.querySelector('.metric-title')?.dataset.guide;
   if(metric){event.preventDefault();event.stopImmediatePropagation();openSummaryRanking(metric);return}
  }
  if(event.target.closest('[data-close],#uploadPitchingStats,#pitchingStatsFile,[data-info]'))setTimeout(refresh,0);
 },true);
 document.addEventListener('change',event=>{if(event.target.closest('.eval-app')||event.target.matches('#pitchingStatsFile'))setTimeout(refresh,0)},true);
 window.addEventListener('pageshow',refresh);
 if(applySpreadsheetPitchingV2()){location.reload();return}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh,{once:true});else refresh();
})();
