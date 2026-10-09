from pathlib import Path

app = Path('app-coach-rebels-portals-v10.js')
s = app.read_text()

old = """  return `<div class=\"perf ${rating}\" data-hitting-ranking-tile=\"${statKey}\"><b>${value}</b><div class=\"perf-label-row\">${guide?`<button class=\"perf-metric\" data-guide=\"${label}\">${label}</button>`:`<span class=\"perf-metric\">${label}</span>`}<button class=\"perf-all\" data-hitting-ranking=\"${statKey}\">ALL</button></div></div>`;"""
new = """  const tileRanking=['AVG','OBP','CONTACT','K%'].includes(label)?` data-hitting-ranking-tile=\"${statKey}\"`:'';
  return `<div class=\"perf ${rating}\"${tileRanking}><b>${value}</b><div class=\"perf-label-row\">${guide?`<button class=\"perf-metric\" data-guide=\"${label}\">${label}</button>`:`<span class=\"perf-metric\">${label}</span>`}<button class=\"perf-all\" data-hitting-ranking=\"${statKey}\">ALL</button></div></div>`;"""
if old not in s:
    raise SystemExit('performanceTile markup not found')
s = s.replace(old, new, 1)

old = """  <div class=\"eval-tile dark\">${metricHead('HotB+')} ${hotb===null?emptyComparison():(player?comparison(hotb,hotb-100,0):`<div class=\"value\">${hotb}</div>`)}<div class=\"note\">Production vs Team</div></div>
  <div class=\"eval-tile\">${metricHead('Runs Produced','RP')} ${s.PA?(player?comparison(s.rp.toFixed(1),s.rp-avgPlayerRp,1):`<div class=\"value\">${s.rp.toFixed(1)}</div>`):emptyComparison()}<div class=\"note\">Runs Produced</div></div>"""
new = """  <div class=\"eval-tile dark\" data-summary-ranking-tile=\"HotB+\">${metricHead('HotB+')} ${hotb===null?emptyComparison():(player?comparison(hotb,hotb-100,0):`<div class=\"value\">${hotb}</div>`)}<div class=\"note\">Production vs Team</div></div>
  <div class=\"eval-tile\" data-summary-ranking-tile=\"Runs Produced\">${metricHead('Runs Produced','RP')} ${s.PA?(player?comparison(s.rp.toFixed(1),s.rp-avgPlayerRp,1):`<div class=\"value\">${s.rp.toFixed(1)}</div>`):emptyComparison()}<div class=\"note\">Runs Produced</div></div>"""
if old not in s:
    raise SystemExit('summary tile markup not found')
s = s.replace(old, new, 1)

needle = """ $$('[data-ranking]').forEach(x=>x.onclick=()=>{modal='ranking:'+x.dataset.ranking;render()});
 $$('[data-hitting-ranking]').forEach(x=>x.onclick=()=>{modal='hittingRanking:'+x.dataset.hittingRanking;render()});"""
replace = """ $$('[data-ranking]').forEach(x=>x.onclick=()=>{modal='ranking:'+x.dataset.ranking;render()});
 $$('[data-summary-ranking-tile]').forEach(x=>x.onclick=event=>{if(event.target.closest('.metric-title,[data-ranking]'))return;modal='ranking:'+x.dataset.summaryRankingTile;render()});
 $$('[data-hitting-ranking]').forEach(x=>x.onclick=()=>{modal='hittingRanking:'+x.dataset.hittingRanking;render()});"""
if needle not in s:
    raise SystemExit('ranking binder block not found')
s = s.replace(needle, replace, 1)
app.write_text(s)

index = Path('index.html')
s = index.read_text()
helper = ',\"evaluation-direct-hitting-rankings.js?v=20261010-hittiles613\"'
if helper not in s:
    raise SystemExit('legacy Evaluation ranking helper dependency not found')
s = s.replace(helper, '', 1)
s = s.replace('app-coach-rebels-portals-v10.js?v=20261010-evalrankbind615', 'app-coach-rebels-portals-v10.js?v=20261010-evalnative616')
s = s.replace('pwa-update.js?v=20261010-615', 'pwa-update.js?v=20261010-616')
index.write_text(s)

pwa = Path('pwa-update.js')
s = pwa.read_text()
s = s.replace("BUILD_VERSION='2026.10.10.615'", "BUILD_VERSION='2026.10.10.616'")
s = s.replace("launch','615'", "launch','616'")
s = s.replace('service-worker-v615.js', 'service-worker-v616.js')
pwa.write_text(s)

Path('service-worker-v616.js').write_text("""const CACHE='hotb-app-2026.10.10.616';
self.addEventListener('install',event=>{self.skipWaiting();event.waitUntil(caches.open(CACHE))});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{for(const name of await caches.keys())if(name.startsWith('hotb-app-')&&name!==CACHE)await caches.delete(name);await self.clients.claim()})())});
self.addEventListener('fetch',event=>{const request=event.request;if(request.method!=='GET')return;const url=new URL(request.url);if(url.origin!==self.location.origin)return;event.respondWith((async()=>{try{const response=await fetch(request,{cache:'no-store'});if(response.ok){const cache=await caches.open(CACHE);cache.put(request,response.clone()).catch(()=>{})}return response}catch(_){return(await caches.match(request))||Response.error()}})())});
""")
