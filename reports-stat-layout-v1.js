/* Reports stat tiles: PA AVG OBP SLG RBI / HHB% HITS K K% BB. */
(()=>{
 const DBKEY='hotbRebuildDbV1',SELKEY='hotbReportSelectedIds';
 const db=()=>{try{return JSON.parse(localStorage.getItem(DBKEY)||'{}')||{}}catch(_){return{}}};
 const fmtPct=v=>`${Math.round((Number(v)||0)*100)}%`;
 function rememberSelection(){const boxes=[...document.querySelectorAll('.game-choice input[type="checkbox"]')];if(boxes.length)try{sessionStorage.setItem(SELKEY,JSON.stringify(boxes.filter(x=>x.checked).map(x=>x.value)))}catch(_){}}
 function contextGames(data,title){
  const saved=data.savedGames||[],text=String(title||'').replace(/^Games:\s*/i,'').trim();
  if(/^Current Game$/i.test(text))return data.currentGame?[data.currentGame]:[];
  if(/^All Games$/i.test(text))return saved;
  const selected=text.match(/^(\d+) Selected Games?$/i);if(selected){try{const ids=JSON.parse(sessionStorage.getItem(SELKEY)||'[]');if(ids.length)return saved.filter(g=>ids.includes(g.id))}catch(_){}}
  const group=(data.gameGroups||[]).find(g=>String(g.name||'').trim()===text);if(group)return saved.filter(g=>(group.gameIds||[]).includes(g.id));
  const parts=text.split('·').map(x=>x.trim());if(parts.length>=2){const date=parts[0],opp=parts.slice(1).join(' · ');const matches=saved.filter(g=>new Date(g.date).toLocaleDateString()===date&&String(g.opponent||'Opponent')===opp);if(matches.length)return matches}
  return saved;
 }
 function filteredPas(data){
  const panel=document.querySelector('.report-detail');if(!panel)return[];
  const title=panel.querySelector('.report-context-title')?.textContent||'',games=contextGames(data,title),player=panel.querySelector('#reportHitter')?.value||'All Hitters',opponent=panel.querySelector('#reportOpponent')?.value||'All Opponents';
  return games.filter(g=>opponent==='All Opponents'||g.opponent===opponent).flatMap(g=>g.plateAppearances||[]).filter(pa=>player==='All Hitters'||pa.hitter===player);
 }
 function apply(){
  rememberSelection();const grid=document.querySelector('.report-detail .report-stat-grid');if(!grid||grid.dataset.hotbStatLayout==='1')return;
  const current={};grid.querySelectorAll('.report-stat').forEach(tile=>{const label=tile.querySelector('span')?.textContent?.trim(),value=tile.querySelector('b')?.textContent?.trim();if(label)current[label]=value});
  const pas=filteredPas(db()),s=window.HotBEvaluationStats?.statsForPAs?.(pas);if(!s)return;
  const stats=[['PA',current.PA??s.PA],['AVG',current.AVG??'—'],['OBP',current.OBP??'—'],['SLG',current.SLG??'—'],['RBI',current.RBI??s.RBI],['HHB%',fmtPct(s.hhbPct)],['HITS',s.H],['K',s.K],['K%',fmtPct(s.kPct)],['BB',s.BB]];
  grid.innerHTML=stats.map(([k,v])=>`<div class="report-stat"><b>${v}</b><span>${k}</span></div>`).join('');grid.dataset.hotbStatLayout='1';
 }
 document.addEventListener('change',event=>{if(event.target?.matches?.('.game-choice input[type="checkbox"]'))rememberSelection();setTimeout(apply,0)},true);
 document.addEventListener('click',()=>setTimeout(apply,0),true);
 new MutationObserver(()=>setTimeout(apply,0)).observe(document.documentElement,{childList:true,subtree:true});
 addEventListener('load',()=>setTimeout(apply,0));
})();