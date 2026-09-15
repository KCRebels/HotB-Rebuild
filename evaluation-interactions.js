(()=>{
 // Display/data maintenance only. Ranking interactions live in one consolidated file.
 const spreadsheetPitchingV2={
  'Aniesa Rohleder':{pitcherIP:'5.0',pitcherERA:'7.000',pitcherWHIP:'2.000',pitcherKBB:'1.333',pitcherOBA:'.292',pitcherStrikePct:'57.58%'},
  'Brooklyn Gering':{pitcherIP:'3.0',pitcherERA:'9.333',pitcherWHIP:'2.667',pitcherKBB:'.167',pitcherOBA:'.200',pitcherStrikePct:'49.23%'},
  'Lakyn Farley':{pitcherIP:'6.1',pitcherERA:'1.105',pitcherWHIP:'.632',pitcherKBB:'1.500',pitcherOBA:'.095',pitcherStrikePct:'59.09%'},
  'Megan Ryan':{pitcherIP:'4.0',pitcherERA:'5.250',pitcherWHIP:'1.750',pitcherKBB:'3.000',pitcherOBA:'.353',pitcherStrikePct:'62.34%'},
  'Makenna Whitaker':{pitcherIP:'2.0',pitcherERA:'7.000',pitcherWHIP:'2.500',pitcherKBB:'.000',pitcherOBA:'.286',pitcherStrikePct:'44.12%'}
 };
 function applySpreadsheetPitchingV2(){
  try{
   const key='hotbRebuildDbV1',stored=localStorage.getItem(key);if(!stored)return false;
   const data=JSON.parse(stored);if(!data||!Array.isArray(data.roster)||(data.pitchingSpreadsheetVersion||0)>=1)return false;
   data.roster.forEach(player=>{if(spreadsheetPitchingV2[player.name])Object.assign(player,spreadsheetPitchingV2[player.name])});
   data.pitchingSpreadsheetVersion=1;localStorage.setItem(key,JSON.stringify(data));
   if(localStorage.getItem('hotbCloudBackupEnabledV1')==='true')localStorage.setItem('hotbCloudPendingV1','true');
   return true;
  }catch(error){return false}
 }
 function neutralizeAndRoundHitting(){
  document.querySelectorAll('.eval-app .perf').forEach(card=>{
   const metric=String(card.querySelector('.perf-metric')?.textContent||'').trim().toUpperCase(),stat=card.querySelector(':scope>b'),text=String(stat?.textContent||'').trim();
   const value=Number(text.replace('%',''));
   ['excellent','good','acceptable','concern','serious'].forEach(name=>card.classList.remove(name));
   if(stat&&['K%','HHB%'].includes(metric)&&Number.isFinite(value))stat.textContent=`${Math.round(value)}%`;
  });
 }
 function refreshPitchingDisplay(){
  document.querySelectorAll('.eval-app .pitcher-stat').forEach(card=>{
   const label=card.querySelector('span'),labelText=String(label?.textContent||'').trim().toUpperCase();if(labelText==='OBA'&&label)label.textContent='BAA';
   const value=card.querySelector(':scope>b');if(!value)return;const number=Number(String(value.textContent||'').replace('%','').trim());if(!Number.isFinite(number))return;
   if(labelText==='STRIKE %')value.textContent=`${Math.round(number)}%`;else if(labelText==='ERA'||labelText==='WHIP')value.textContent=number.toFixed(2);
  });
  document.querySelectorAll('.pitching-import-modal small').forEach(label=>{if(String(label.textContent||'').trim().toUpperCase()==='OBA')label.textContent='BAA'});
  document.querySelectorAll('.player-info-modal .info-field>span').forEach(label=>{if(String(label.textContent||'').includes('Opponent Batting Average (OBA)'))label.textContent='Batting Average Against (BAA)'});
 }
 function refresh(){requestAnimationFrame(()=>{neutralizeAndRoundHitting();refreshPitchingDisplay()})}
 document.addEventListener('click',event=>{if(event.target.closest('[data-close],#uploadPitchingStats,#pitchingStatsFile,[data-info]'))setTimeout(refresh,0)},true);
 document.addEventListener('change',event=>{if(event.target.closest('.eval-app')||event.target.matches('#pitchingStatsFile'))setTimeout(refresh,0)},true);
 window.addEventListener('pageshow',refresh);
 if(applySpreadsheetPitchingV2()){location.reload();return}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh,{once:true});else refresh();
})();