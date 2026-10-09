from pathlib import Path

app = Path('app-coach-rebels-portals-v10.js')
s = app.read_text()
old = """ const evalSelect=$('#evalSelect');
 if(evalSelect)evalSelect.onchange=e=>{evalPlayer=e.target.value;modal=null;render()};
 try{if(!evaluationReadOnly)bindTestNavigation()}catch(error){console.error('HotB Evaluation navigation binding failed without disabling Evaluation controls',error)}
 $('#openRebelsScout')?.addEventListener('click',()=>{
  const scoutSlug=String(evalPlayer||'').trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const url=`https://rebelsscout.com/${scoutSlug}/`;
  window.open(url,'_blank','noopener');
 });
 bindDateFilters('eval');
 const recordMeasureButton=$('#recordMeasure2');
 if(recordMeasureButton)recordMeasureButton.onclick=()=>{recordType='';modal='record';render()};
 $$('[data-measure]').forEach(x=>x.onclick=()=>{recordType=x.dataset.measure;modal='record';render()});
 $$('[data-guide]').forEach(x=>x.onclick=()=>{modal='guide:'+x.dataset.guide;render()});
 $$('[data-ranking]').forEach(x=>x.onclick=()=>{modal='ranking:'+x.dataset.ranking;render()});
 $$('[data-hitting-ranking]').forEach(x=>x.onclick=()=>{modal='hittingRanking:'+x.dataset.hittingRanking;render()});
 $$('[data-hitting-ranking-tile]').forEach(x=>x.onclick=()=>{modal='hittingRanking:'+x.dataset.hittingRankingTile;render()});
 $$('[data-pitch-ranking]').forEach(x=>x.onclick=()=>{modal='pitchRanking:'+x.dataset.pitchRanking;render()});"""
new = """ const evalSelect=$('#evalSelect');
 if(evalSelect)evalSelect.onchange=e=>{evalPlayer=e.target.value;modal=null;render()};
 // Evaluation's ranking controls are core controls. Bind them before any optional
 // navigation/date-filter setup so an unrelated binder cannot disable rankings.
 $$('[data-ranking]').forEach(x=>x.onclick=()=>{modal='ranking:'+x.dataset.ranking;render()});
 $$('[data-hitting-ranking]').forEach(x=>x.onclick=()=>{modal='hittingRanking:'+x.dataset.hittingRanking;render()});
 $$('[data-hitting-ranking-tile]').forEach(x=>x.onclick=()=>{modal='hittingRanking:'+x.dataset.hittingRankingTile;render()});
 $$('[data-pitch-ranking]').forEach(x=>x.onclick=()=>{modal='pitchRanking:'+x.dataset.pitchRanking;render()});
 try{if(!evaluationReadOnly)bindTestNavigation()}catch(error){console.error('HotB Evaluation navigation binding failed without disabling Evaluation controls',error)}
 $('#openRebelsScout')?.addEventListener('click',()=>{
  const scoutSlug=String(evalPlayer||'').trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const url=`https://rebelsscout.com/${scoutSlug}/`;
  window.open(url,'_blank','noopener');
 });
 try{bindDateFilters('eval')}catch(error){console.error('HotB Evaluation date-filter binding failed without disabling Evaluation controls',error)}
 const recordMeasureButton=$('#recordMeasure2');
 if(recordMeasureButton)recordMeasureButton.onclick=()=>{recordType='';modal='record';render()};
 $$('[data-measure]').forEach(x=>x.onclick=()=>{recordType=x.dataset.measure;modal='record';render()});
 $$('[data-guide]').forEach(x=>x.onclick=()=>{modal='guide:'+x.dataset.guide;render()});"""
if old not in s:
    raise SystemExit('Expected bindEval block was not found; no files changed')
app.write_text(s.replace(old, new, 1))

index = Path('index.html')
s = index.read_text()
for old_tag in ['app-coach-rebels-portals-v10.js?v=20261010-evalnative612', 'app-coach-rebels-portals-v10.js?v=20261010-evalrankbind614']:
    s = s.replace(old_tag, 'app-coach-rebels-portals-v10.js?v=20261010-evalrankbind615')
s = s.replace('evaluation-direct-hitting-rankings.js?v=20261010-evalrank613', 'evaluation-direct-hitting-rankings.js?v=20261010-evalrank615')
for old_tag in ['pwa-update.js?v=20261010-613', 'pwa-update.js?v=20261010-614']:
    s = s.replace(old_tag, 'pwa-update.js?v=20261010-615')
index.write_text(s)

pwa = Path('pwa-update.js')
s = pwa.read_text()
s = s.replace("BUILD_VERSION='2026.10.10.613'", "BUILD_VERSION='2026.10.10.615'")
s = s.replace("BUILD_VERSION='2026.10.10.614'", "BUILD_VERSION='2026.10.10.615'")
s = s.replace("launch','613'", "launch','615'")
s = s.replace("launch','614'", "launch','615'")
s = s.replace('service-worker-v613.js', 'service-worker-v615.js')
s = s.replace('service-worker-v614.js', 'service-worker-v615.js')
pwa.write_text(s)

Path('service-worker-v615.js').write_text("""const CACHE='hotb-app-2026.10.10.615';
self.addEventListener('install',event=>{self.skipWaiting();event.waitUntil(caches.open(CACHE))});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{for(const name of await caches.keys())if(name.startsWith('hotb-app-')&&name!==CACHE)await caches.delete(name);await self.clients.claim()})())});
self.addEventListener('fetch',event=>{const request=event.request;if(request.method!=='GET')return;const url=new URL(request.url);if(url.origin!==self.location.origin)return;event.respondWith((async()=>{try{const response=await fetch(request,{cache:'no-store'});if(response.ok){const cache=await caches.open(CACHE);cache.put(request,response.clone()).catch(()=>{})}return response}catch(_){return(await caches.match(request))||Response.error()}})())});
""")
