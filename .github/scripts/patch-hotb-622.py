from pathlib import Path

app=Path('app-coach-rebels-portals-v10.js')
s=app.read_text()

old=''' const opts=competitionRoster().map(r=>`<option value="${esc(r.name)}">${esc(r.name)} (${r.side})</option>`).join('');'''
new=''' const opts=competitionRoster().map(r=>`<option value="${esc(r.name)}">${esc(r.name)} (${r.side})</option>`).join('')+'<option value="Guest">Guest</option>';'''
if old not in s: raise SystemExit('new game hitter options anchor not found')
s=s.replace(old,new,1)

old='''   s.innerHTML=`<option value="">Select hitter</option>${available.map(r=>`<option value="${esc(r.name)}">${esc(r.name)} (${r.side})</option>`).join('')}`;'''
new='''   s.innerHTML=`<option value="">Select hitter</option>${available.map(r=>`<option value="${esc(r.name)}">${esc(r.name)} (${r.side})</option>`).join('')}<option value="Guest">Guest</option>`;'''
if old not in s: raise SystemExit('lineup availability options anchor not found')
s=s.replace(old,new,1)

old=''' const allowed=new Set(competitionRoster().map(player=>player.name));
 order=[...new Set((order||[]).filter(name=>allowed.has(name)))];'''
new=''' const allowed=new Set(competitionRoster().map(player=>player.name));
 const seen=new Set();
 order=(order||[]).filter(name=>{
  if(name==='Guest')return true;
  if(!allowed.has(name)||seen.has(name))return false;
  seen.add(name);
  return true;
 });'''
if old not in s: raise SystemExit('createGame lineup normalization anchor not found')
s=s.replace(old,new,1)
app.write_text(s)

pwa=Path('pwa-update.js')
s=pwa.read_text()
if "BUILD_VERSION='2026.10.10.621'" not in s: raise SystemExit('PWA build 621 anchor not found')
s=s.replace("BUILD_VERSION='2026.10.10.621'","BUILD_VERSION='2026.10.10.622'",1)
s=s.replace("launch','621'","launch','622'",1)
pwa.write_text(s)

index=Path('index.html')
s=index.read_text()
if 'app-coach-rebels-portals-v10.js?v=20261010-bottomnav621' not in s: raise SystemExit('coach bundle cache anchor not found')
s=s.replace('app-coach-rebels-portals-v10.js?v=20261010-bottomnav621','app-coach-rebels-portals-v10.js?v=20261010-gameguest622',1)
s=s.replace('pwa-update.js?v=20261010-621','pwa-update.js?v=20261010-622',1)
index.write_text(s)

sw=Path('service-worker-v618.js')
s=sw.read_text()
if "const CACHE='hotb-app-2026.10.10.621';" not in s: raise SystemExit('service worker cache 621 anchor not found')
s=s.replace("const CACHE='hotb-app-2026.10.10.621';","const CACHE='hotb-app-2026.10.10.622';",1)
sw.write_text(s)
