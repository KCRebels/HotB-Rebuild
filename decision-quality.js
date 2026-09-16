(() => {
  const DBKEY='hotbRebuildDbV1';
  const VALUES={GOOD:1,MINOR:.5,POOR:0};
  const SWINGS=new Set(['F','HIT','H4O','E','FC','SAC','K']);
  const TAKES=new Set(['B','KL']);
  const OUTSIDE_ZONE=new Set(['T','T1','T2','B','B1','B2','L','L1','L2','R','R1','R2']);
  let overridePitchId='';

  function readDb(){try{return JSON.parse(localStorage.getItem(DBKEY)||'{}')}catch{return {}}}
  function isLeft(player,pitch){return ['L','SL'].includes(String(pitch?.hitterStyle||player?.side||'R').toUpperCase())}
  function inPlan(pitch,player){
    const plan=String(pitch?.plan||'').toUpperCase();
    if(plan==='CH')return String(pitch?.pitchType||'').toUpperCase()==='CH';
    if(plan==='NO')return true;
    const left=isLeft(player,pitch);
    const inside=new Set(left?['L','L1','L2','C1','C3']:['R','R1','R2','C2','C4']);
    const outside=new Set(left?['R','R1','R2','C2','C4']:['L','L1','L2','C1','C3']);
    return plan==='IN'?inside.has(pitch.zone):plan==='OUT'?outside.has(pitch.zone):false;
  }
  function autoGrade(pitch,player){
    if(!pitch||pitch.result==='HBP'||pitch.intentionalBall||pitch.pitchout)return 'NOT_SCORED';
    const override=String(pitch.decisionOverride||'').toUpperCase();
    if(['GOOD','MINOR','POOR','NOT_SCORED'].includes(override))return override;
    const result=String(pitch.result||'').toUpperCase(),swing=SWINGS.has(result),take=TAKES.has(result),two=Number(pitch.strikesBefore)>=2;
    if(!swing&&!take)return 'NOT_SCORED';
    if(two){
      if(take)return result==='B'?'GOOD':'POOR';
      // A two-strike swing is protection unless the coach identifies a clearly noncompetitive chase.
      return 'GOOD';
    }
    const plan=String(pitch.plan||'').toUpperCase();
    if(plan==='NO')return swing?'GOOD':'NOT_SCORED';
    if(plan==='CH'){
      if(String(pitch.pitchType||'').toUpperCase()==='CH')return swing?'GOOD':take?'POOR':'NOT_SCORED';
      if(take)return 'GOOD';
      return pitch.hhb?'GOOD':'MINOR';
    }
    if(!['IN','OUT'].includes(plan))return 'NOT_SCORED';
    const planned=inPlan(pitch,player);
    if(swing){if(planned)return 'GOOD';return pitch.hhb?'MINOR':'POOR'}
    if(take)return planned?'POOR':'GOOD';
    return 'NOT_SCORED';
  }
  function gradeValue(grade){return Object.prototype.hasOwnProperty.call(VALUES,grade)?VALUES[grade]:null}
  function records(games,playerName,roster){
    const player=(roster||[]).find(p=>p.name===playerName)||{};
    return (games||[]).flatMap(game=>(game.pitches||[]).filter(p=>!playerName||p.hitter===playerName).map(pitch=>({game,pitch,grade:autoGrade(pitch,player)})));
  }
  function summary(games,playerName,roster){
    const rows=records(games,playerName,roster),scored=rows.filter(r=>gradeValue(r.grade)!==null),points=scored.reduce((n,r)=>n+gradeValue(r.grade),0);
    const counts={GOOD:0,MINOR:0,POOR:0,NOT_SCORED:0};rows.forEach(r=>counts[r.grade]=(counts[r.grade]||0)+1);
    return {rate:scored.length?points/scored.length:null,points,attempts:scored.length,counts,rows};
  }
  function pct(rate){return rate===null?'—%':`${Math.round(rate*100)}%`}
  function currentGames(db){return [...(db.savedGames||[]),...(db.currentGame?[db.currentGame]:[])];}
  function filteredByEval(games){
    const season=document.querySelector('#evalSeasonFilter')?.value||'',mode=document.querySelector('#evalDateRange')?.value||'full',start=document.querySelector('#evalDateStart')?.value||'',end=document.querySelector('#evalDateEnd')?.value||'';
    return games.filter(game=>{const d=new Date(game.date),time=d.getTime();if(Number.isNaN(time))return false;if(mode==='custom')return time>=(start?new Date(`${start}T00:00:00`).getTime():-Infinity)&&time<=(end?new Date(`${end}T23:59:59.999`).getTime():Infinity);const y=d.getFullYear(),m=d.getMonth()+1,day=d.getDate(),sy=m>=9?y:y-1,s=`${sy}–${String(sy+1).slice(-2)}`;if(season&&s!==season)return false;if(mode==='full')return !((m===7&&day>=31)||m===8);if(mode==='fall')return m>=9&&m<=11;if(mode==='summer')return (m===5&&day>=20)||m===6||(m===7&&day<=30);return true});
  }
  function replaceEvalTile(){
    const root=document.querySelector('.eval-app');if(!root)return;
    const select=root.querySelector('#evalSelect'),player=select?.value;if(!player||player==='Team')return;
    const tiles=[...root.querySelectorAll('.eval-tiles .eval-tile')],target=tiles[2];if(!target)return;
    const db=readDb(),sum=summary(filteredByEval(currentGames(db)),player,db.roster);
    target.innerHTML=`<div class="eval-tile-head"><button class="metric-title" type="button" data-decision-detail>Decision %</button><button class="metric-all" type="button" data-decision-detail>DETAIL</button></div><div class="value">${pct(sum.rate)}</div><div class="note">Decision Quality · ${sum.attempts} scored</div>`;
  }
  function detailModal(){
    const db=readDb(),player=document.querySelector('#evalSelect')?.value;if(!player||player==='Team')return;
    const sum=summary(filteredByEval(currentGames(db)),player,db.roster),old=document.getElementById('decisionQualityModal');old?.remove();
    const el=document.createElement('div');el.id='decisionQualityModal';el.className='modal-backdrop';el.innerHTML=`<div class="modal dark"><div class="modal-header"><div><div class="small" style="color:#ddd;letter-spacing:2px">PLAYER EVALUATION</div><h2>Decision Quality</h2></div><button class="btn" data-decision-close>Close</button></div><hr style="border-color:#555"><div class="decision-summary"><b>${pct(sum.rate)}</b><span>${sum.attempts} scored decisions</span></div><div class="decision-breakdown"><div><b>${sum.counts.GOOD}</b><span>Good</span></div><div><b>${sum.counts.MINOR}</b><span>Minor Poor</span></div><div><b>${sum.counts.POOR}</b><span>Poor</span></div><div><b>${sum.counts.NOT_SCORED}</b><span>Not Scored</span></div></div><p class="small" style="color:#ddd">Good = full credit · Minor Poor = half credit · Poor = zero credit · Not Scored is excluded.</p></div>`;document.body.appendChild(el);
  }
  function latestPoor(){const db=readDb(),g=db.currentGame;if(!g)return null;const pitch=[...(g.pitches||[])].reverse().find(p=>!p.decisionOverride);if(!pitch)return null;const player=(db.roster||[]).find(p=>p.name===pitch.hitter)||{};return autoGrade(pitch,player)==='POOR'?pitch:null}
  function liveOverride(){
    const app=document.querySelector('.live-app'),results=app?.querySelector('.results');if(!app||!results)return;
    app.querySelector('.decision-override-strip')?.remove();const pitch=latestPoor();if(!pitch)return;
    const strip=document.createElement('div');strip.className='decision-override-strip';strip.innerHTML=overridePitchId===pitch.id?`<span>Decision</span><button data-dq="GOOD">Good</button><button data-dq="MINOR">Minor</button><button data-dq="NOT_SCORED">N/S</button><button data-dq-cancel>×</button>`:`<button class="decision-review" data-dq-review>Decision: Poor · Change</button>`;results.after(strip);
  }
  function setOverride(value){const db=readDb(),g=db.currentGame,p=(g?.pitches||[]).find(x=>x.id===overridePitchId);if(!p)return;p.decisionOverride=value;localStorage.setItem(DBKEY,JSON.stringify(db));overridePitchId='';window.dispatchEvent(new Event('hotb-decision-updated'));}
  function enhance(){replaceEvalTile();liveOverride()}
  document.addEventListener('click',e=>{const t=e.target instanceof Element?e.target:null;if(!t)return;if(t.closest('[data-decision-detail]')){e.preventDefault();detailModal();return}if(t.closest('[data-decision-close]')){document.getElementById('decisionQualityModal')?.remove();return}const review=t.closest('[data-dq-review]');if(review){const p=latestPoor();overridePitchId=p?.id||'';enhance();return}const grade=t.closest('[data-dq]');if(grade){setOverride(grade.dataset.dq);enhance();return}if(t.closest('[data-dq-cancel]')){overridePitchId='';enhance()}});
  document.addEventListener('change',e=>{if(e.target instanceof Element&&e.target.matches('#evalSelect,#evalSeasonFilter,#evalDateRange,#evalDateStart,#evalDateEnd'))setTimeout(enhance,0)});
  window.addEventListener('hotb-decision-updated',()=>setTimeout(enhance,0));
  const observer=new MutationObserver(()=>{if(!document.querySelector('.decision-override-strip')&&!document.querySelector('#decisionQualityModal'))requestAnimationFrame(enhance);else if(document.querySelector('.eval-app'))requestAnimationFrame(replaceEvalTile)});observer.observe(document.documentElement,{childList:true,subtree:true});
  const style=document.createElement('style');style.textContent=`.decision-override-strip{display:flex;gap:6px;align-items:center;margin:5px 0;padding:4px 0}.decision-override-strip button{min-height:34px;border:0;border-radius:8px;padding:5px 9px;font-weight:900}.decision-review{width:100%;background:#b5121b;color:#fff}.decision-override-strip span{font-size:12px;font-weight:900}.decision-summary{text-align:center;padding:14px}.decision-summary>b{display:block;font-size:42px}.decision-summary span{color:#ddd}.decision-breakdown{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:10px 0}.decision-breakdown div{text-align:center;background:#222;border-radius:8px;padding:10px 3px}.decision-breakdown b{display:block;font-size:24px}.decision-breakdown span{font-size:11px}`;document.head.appendChild(style);
  window.HotBDecisionQuality={autoGrade,summary};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(enhance,0),{once:true});else setTimeout(enhance,0);
})();
