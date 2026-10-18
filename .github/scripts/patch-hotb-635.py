from pathlib import Path

app=Path('app-coach-rebels-portals-v10.js')
s=app.read_text()
old=""" if(outcome==='HIT')g.runners=runnersAfterHit(g.runners,extra.hitType);"""
new=""" if(outcome==='HIT'){
  g.runners=runnersAfterHit(g.runners,extra.hitType);
  if(Number(extra.rbiCount)>0)g.runners=runnersAfterRBI(g.runners,extra.rbiCount);
 }"""
if old not in s: raise SystemExit('hit runner anchor not found')
s=s.replace(old,new,1)
app.write_text(s)

pwa=Path('pwa-update.js')
s=pwa.read_text()
if "BUILD_VERSION='2026.10.18.634'" not in s: raise SystemExit('PWA build 634 anchor not found')
s=s.replace("BUILD_VERSION='2026.10.18.634'","BUILD_VERSION='2026.10.18.635'",1)
s=s.replace("launch','634'","launch','635'",1)
pwa.write_text(s)

sw=Path('service-worker-v618.js')
s=sw.read_text()
old_cache="const CACHE='hotb-app-2026.10.18.634';"
if old_cache not in s: raise SystemExit('service worker cache 634 anchor not found')
s=s.replace(old_cache,"const CACHE='hotb-app-2026.10.18.635';",1)
sw.write_text(s)
