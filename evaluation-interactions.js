(()=>{
 // Keep title behavior inside app.js exactly as originally designed.
 // This helper restores hitting colors, rounds selected displayed percentages,
 // keeps the pitching labels current, and lets visible stat values use the native ranking controls.
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
   if(labelText!=='STRIKE %')return;
   const value=card.querySelector(':scope>b');
   if(!value)return;
   const number=Number(String(value.textContent||'').replace('%','').trim());
   if(Number.isFinite(number))value.textContent=`${Math.round(number)}%`;
  });
  const modal=document.querySelector('.ranking-modal');
  const modalHeading=modal?.querySelector('h2');
  let modalTitle=String(modalHeading?.textContent||'').trim().toUpperCase();
  if(modalTitle==='OBA'&&modalHeading){modalHeading.textContent='BAA';modalTitle='BAA'}
  if(['STRIKE %','K%','HHB%'].includes(modalTitle)){
   modal.querySelectorAll('.ranking-row strong').forEach(value=>{
    const number=Number(String(value.textContent||'').replace('%','').trim());
    if(Number.isFinite(number))value.textContent=`${Math.round(number)}%`;
   });
  }
  document.querySelectorAll('.pitching-import-modal small').forEach(label=>{if(String(label.textContent||'').trim().toUpperCase()==='OBA')label.textContent='BAA'});
  document.querySelectorAll('.player-info-modal .info-field>span').forEach(label=>{if(String(label.textContent||'').includes('Opponent Batting Average (OBA)'))label.textContent='Batting Average Against (BAA)'});
 }
 function rankingControlFor(result){
  const tile=result.closest('.eval-tile');
  if(tile)return tile.querySelector('.metric-all');
  const perf=result.closest('.perf');
  if(perf)return perf.querySelector('.perf-all');
  const pitch=result.closest('.pitcher-stat');
  if(pitch)return pitch;
  return null;
 }
 function refresh(){requestAnimationFrame(()=>{restoreColorsAndRoundHitting();refreshPitchingDisplay()});}
 document.addEventListener('click',event=>{
  const result=event.target.closest('.eval-app .eval-tile>.value,.eval-app .perf>b,.eval-app .pitcher-stat>b');
  if(result){
   const control=rankingControlFor(result);
   if(control){
    event.preventDefault();event.stopPropagation();
    if(typeof control.onclick==='function')control.onclick.call(control,event);else control.click();
    setTimeout(refresh,0);return;
   }
  }
  if(event.target.closest('.eval-app [data-guide],.eval-app [data-ranking],.eval-app [data-hitting-ranking],.eval-app [data-pitch-ranking],[data-close],#uploadPitchingStats,#pitchingStatsFile,[data-info]'))setTimeout(refresh,0);
 },true);
 document.addEventListener('change',event=>{if(event.target.closest('.eval-app')||event.target.matches('#pitchingStatsFile'))setTimeout(refresh,0)},true);
 window.addEventListener('pageshow',refresh);
 if(applySpreadsheetPitchingV2()){location.reload();return}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh,{once:true});else refresh();
})();
