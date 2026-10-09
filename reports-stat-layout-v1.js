/* Reports stat tiles: calculate all counts from the exact plate appearances in the selected report. */
(()=>{
 const DBKEY='hotbRebuildDbV1',SELKEY='hotbReportSelectedIds';
 const db=()=>{try{return JSON.parse(localStorage.getItem(DBKEY)||'{}')||{}}catch(_){return{}}};
 const fmtPct=v=>`${Math.round((Number(v)||0)*100)}%`,round3=n=>Number.isFinite(n)?n.toFixed(3).replace(/^0/,''):'.000';
 const result=pa=>String(pa?.outcome||'').toUpperCase();
 function rememberSelection(){const boxes=[...document.querySelectorAll('.game-choice input[type="checkbox"]')];if(boxes.length)try{sessionStorage.setItem(SELKEY,JSON.stringify(boxes.filter(x=>x.checked).map(x=>x.value)))}catch(_){}}
 function contextGames(data,title){
  const saved=data.savedGames||[],text=String(title||'').replace(/^Games:\s*/i,'').trim();
  if(/^Current Game$/i.test(text))return data.currentGame?[data.currentGame]:[];
  if(/^All Games$/i.test(text))return saved;
  const selected=text.match(/^(\d+) Selected Games?$/i);if(selected){try{const ids=JSON.parse(sessionStorage.getItem(SELKEY)||'[]');if(ids.length)return saved.filter(g=>ids.includes(g.id))}catch(_){}}
  const group=(data.gameGroups||[]).find(g=>String(g.name||'').trim()===text);if(group)return saved.filter(g=>(group.gameIds||[]).includes(g.id));
  const parts=text.split('·').map(x=>x.trim());if(parts.length>=2){const date=parts[0],opp=parts.slice(1).join(' · ');const matches=saved.filter(g=>new Date(g.date).toLocaleDateString()===date&&String(g.opponent||'Opponent')===opp);if(matches.length)return matches}
  return [];
 }
 function filteredPas(data){
  const panel=document.querySelector('.report-detail');if(!panel)return[];
  const title=panel.querySelector('.report-context-title')?.textContent||'',games=contextGames(data,title),player=panel.querySelector('#reportHitter')?.value||'All Hitters',opponent=panel.querySelector('#reportOpponent')?.value||'All Opponents';
  return games.filter(g=>opponent==='All Opponents'||g.opponent===opponent).flatMap(g=>g.plateAppearances||[]).filter(pa=>player==='All Hitters'||pa.hitter===player);
 }
 function canonical(pas){
  const PA=pas.length,H=pas.filter(pa=>result(pa)==='HIT').length,K=pas.filter(pa=>result(pa)==='K').length,BB=pas.filter(pa=>['BB','WALK'].includes(result(pa))).length,HBP=pas.filter(pa=>result(pa)==='HBP').length,RBI=pas.reduce((sum,pa)=>sum+Number(pa?.rbiCount??(pa?.rbi?1:0)||0),0),AB=pas.filter(pa=>!['BB','WALK','HBP','SAC'].includes(result(pa))).length;
  const TB=pas.reduce((sum,pa)=>{if(result(pa)!=='HIT')return sum;const t=String(pa?.hitType||'').toUpperCase();return sum+(t==='HR'||t.includes('HOME')?4:t==='3B'||t.includes('TRIPLE')?3:t==='2B'||t.includes('DOUBLE')?2:1)},0),bip=pas.filter(pa=>String(pa?.contactType||'').trim()),HHB=bip.filter(pa=>pa?.hhb).length;
  return {PA,H,K,BB,RBI,AVG:AB?H/AB:0,OBP:PA?(H+BB+HBP)/PA:0,SLG:AB?TB/AB:0,hhbPct:bip.length?HHB/bip.length:0,kPct:PA?K/PA:0};
 }
 function apply(){
  rememberSelection();const grid=document.querySelector('.report-detail .report-stat-grid');if(!grid)return;
  const pas=filteredPas(db()),s=canonical(pas),stats=[['PA',s.PA],['AVG',round3(s.AVG)],['OBP',round3(s.OBP)],['SLG',round3(s.SLG)],['RBI',s.RBI],['HHB%',fmtPct(s.hhbPct)],['HITS',s.H],['K',s.K],['K%',fmtPct(s.kPct)],['BB',s.BB]];
  grid.innerHTML=stats.map(([k,v])=>`<div class="report-stat"><b>${v}</b><span>${k}</span></div>`).join('');grid.dataset.hotbStatLayout='2';
 }
 document.addEventListener('change',event=>{if(event.target?.matches?.('.game-choice input[type="checkbox"]'))rememberSelection();setTimeout(apply,0)},true);
 document.addEventListener('click',()=>setTimeout(apply,0),true);new MutationObserver(()=>setTimeout(apply,0)).observe(document.documentElement,{childList:true,subtree:true});addEventListener('load',()=>setTimeout(apply,0));
})();