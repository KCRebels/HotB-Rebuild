from pathlib import Path

app=Path('app-coach-rebels-portals-v10.js')
s=app.read_text()

old=""" const performanceTile=([label,value,key])=>{
  const statKey=key==='contact'?'contactPct':key==='K'?'kPct':key,guide=['AVG','OBP','SLG','CONTACT','K%'].includes(label);
  const rating=s.PA>=25&&!['hhbPct','qabPct','ipaPct'].includes(statKey)?grade(s[statKey],key):'';
  if(['AVG','OBP','CONTACT','K%'].includes(label))return `<button type=\"button\" class=\"perf ${rating}\" data-hitting-ranking-button=\"${statKey}\"><b>${value}</b><div class=\"perf-label-row\"><span class=\"perf-metric\">${label}</span><span class=\"perf-all\">ALL</span></div></button>`;
  return `<div class=\"perf ${rating}\"><b>${value}</b><div class=\"perf-label-row\">${guide?`<button class=\"perf-metric\" data-guide=\"${label}\">${label}</button>`:`<span class=\"perf-metric\">${label}</span>`}<button class=\"perf-all\" data-hitting-ranking=\"${statKey}\">ALL</button></div></div>`;
 };"""
new=""" const performanceTile=([label,value,key])=>{
  const statKey=key==='contact'?'contactPct':key==='K'?'kPct':key,guide=['AVG','OBP','SLG','CONTACT','K%'].includes(label);
  const rating=s.PA>=25&&!['hhbPct','qabPct','ipaPct'].includes(statKey)?grade(s[statKey],key):'';
  const tileRanking=['AVG','OBP','CONTACT','K%'].includes(label)?` data-hitting-ranking-tile=\"${statKey}\"`:'';
  return `<div class=\"perf ${rating}\"${tileRanking}><b>${value}</b><div class=\"perf-label-row\">${guide?`<button class=\"perf-metric\" data-guide=\"${label}\">${label}</button>`:`<span class=\"perf-metric\">${label}</span>`}<button class=\"perf-all\" data-hitting-ranking=\"${statKey}\">ALL</button></div></div>`;
 };"""
if old not in s: raise SystemExit('617 performance tile block not found')
s=s.replace(old,new,1)

old2=""" <div class=\"eval-tiles\">
  <button type=\"button\" class=\"eval-tile dark\" data-summary-ranking-button=\"HotB+\"><div class=\"eval-tile-head\"><span class=\"metric-title\">HotB+</span><span class=\"metric-all\">ALL</span></div>${hotb===null?emptyComparison():(player?comparison(hotb,hotb-100,0):`<div class=\"value\">${hotb}</div>`)}<div class=\"note\">Production vs Team</div></button>
  <button type=\"button\" class=\"eval-tile\" data-summary-ranking-button=\"Runs Produced\"><div class=\"eval-tile-head\"><span class=\"metric-title\">RP</span><span class=\"metric-all\">ALL</span></div>${s.PA?(player?comparison(s.rp.toFixed(1),s.rp-avgPlayerRp,1):`<div class=\"value\">${s.rp.toFixed(1)}</div>`):emptyComparison()}<div class=\"note\">Runs Produced</div></button>
  <div class=\"eval-tile\">${slapHitter?metricHead('Reach%'):metricHead('Execution','HP%')}<div class=\"value\">${slapHitter?(reach===null?'—%':pct0(reach)):(execution===null?'—%':pct0(execution))}</div><div class=\"note\">${slapHitter?'Reached Base':'Hitting Plan'}</div></div>
 </div>"""
new2=""" <div class=\"eval-tiles\">
  <div class=\"eval-tile dark\" data-summary-ranking-tile=\"HotB+\">${metricHead('HotB+')} ${hotb===null?emptyComparison():(player?comparison(hotb,hotb-100,0):`<div class=\"value\">${hotb}</div>`)}<div class=\"note\">Production vs Team</div></div>
  <div class=\"eval-tile\" data-summary-ranking-tile=\"Runs Produced\">${metricHead('Runs Produced','RP')} ${s.PA?(player?comparison(s.rp.toFixed(1),s.rp-avgPlayerRp,1):`<div class=\"value\">${s.rp.toFixed(1)}</div>`):emptyComparison()}<div class=\"note\">Runs Produced</div></div>
  <div class=\"eval-tile\">${slapHitter?metricHead('Reach%'):metricHead('Execution','HP%')}<div class=\"value\">${slapHitter?(reach===null?'—%':pct0(reach)):(execution===null?'—%':pct0(execution))}</div><div class=\"note\">${slapHitter?'Reached Base':'Hitting Plan'}</div></div>
 </div>"""
if old2 not in s: raise SystemExit('617 summary tile block not found')
s=s.replace(old2,new2,1)

old3=""" $$('[data-ranking]').forEach(x=>x.onclick=()=>{modal='ranking:'+x.dataset.ranking;render()});
 $$('[data-summary-ranking-button]').forEach(x=>x.onclick=()=>{modal='ranking:'+x.dataset.summaryRankingButton;render()});
 $$('[data-hitting-ranking]').forEach(x=>x.onclick=()=>{modal='hittingRanking:'+x.dataset.hittingRanking;render()});
 $$('[data-hitting-ranking-button]').forEach(x=>x.onclick=()=>{modal='hittingRanking:'+x.dataset.hittingRankingButton;render()});"""
new3=""" $$('[data-ranking]').forEach(x=>x.onclick=()=>{modal='ranking:'+x.dataset.ranking;render()});
 $$('[data-summary-ranking-tile]').forEach(x=>x.onclick=()=>{modal='ranking:'+x.dataset.summaryRankingTile;render()});
 $$('[data-hitting-ranking]').forEach(x=>x.onclick=()=>{modal='hittingRanking:'+x.dataset.hittingRanking;render()});
 $$('[data-hitting-ranking-tile]').forEach(x=>x.onclick=()=>{modal='hittingRanking:'+x.dataset.hittingRankingTile;render()});"""
if old3 not in s: raise SystemExit('617 ranking bind block not found')
s=s.replace(old3,new3,1)

needle="""function bindEval(){
 const evalSelect=$('#evalSelect');
 if(evalSelect)evalSelect.onchange=e=>{evalPlayer=e.target.value;modal=null;render()};"""
insert="""function bindEval(){
 const evalSelect=$('#evalSelect');
 if(evalSelect)evalSelect.onchange=e=>{evalPlayer=e.target.value;modal=null;render()};
 const appRoot=$('#app');
 if(appRoot&&!appRoot.dataset.evalRankingDelegated){
  appRoot.dataset.evalRankingDelegated='1';
  appRoot.addEventListener('click',event=>{
   const target=event.target instanceof Element?event.target:null;if(!target)return;
   const hittingTile=target.closest('[data-hitting-ranking-tile]');
   if(hittingTile){event.preventDefault();event.stopPropagation();modal='hittingRanking:'+hittingTile.dataset.hittingRankingTile;render();return}
   const summaryTile=target.closest('[data-summary-ranking-tile]');
   if(summaryTile){event.preventDefault();event.stopPropagation();modal='ranking:'+summaryTile.dataset.summaryRankingTile;render();return}
  },true);
 }"""
if needle not in s: raise SystemExit('bindEval start not found')
s=s.replace(needle,insert,1)
app.write_text(s)

index=Path('index.html')
s=index.read_text().replace('app-coach-rebels-portals-v10.js?v=20261010-evalbuttons617','app-coach-rebels-portals-v10.js?v=20261010-evaldelegate618').replace('pwa-update.js?v=20261010-617','pwa-update.js?v=20261010-618')
index.write_text(s)

pwa=Path('pwa-update.js')
s=pwa.read_text().replace("BUILD_VERSION='2026.10.10.617'","BUILD_VERSION='2026.10.10.618'").replace("launch','617'","launch','618'").replace('service-worker-v617.js','service-worker-v618.js')
pwa.write_text(s)
Path('service-worker-v618.js').write_text("""const CACHE='hotb-app-2026.10.10.618';
self.addEventListener('install',event=>{self.skipWaiting();event.waitUntil(caches.open(CACHE))});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{for(const name of await caches.keys())if(name.startsWith('hotb-app-')&&name!==CACHE)await caches.delete(name);await self.clients.claim()})())});
self.addEventListener('fetch',event=>{const request=event.request;if(request.method!=='GET')return;const url=new URL(request.url);if(url.origin!==self.location.origin)return;event.respondWith((async()=>{try{const response=await fetch(request,{cache:'no-store'});if(response.ok){const cache=await caches.open(CACHE);cache.put(request,response.clone()).catch(()=>{})}return response}catch(_){return(await caches.match(request))||Response.error()}})())});
""")
