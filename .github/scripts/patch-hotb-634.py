from pathlib import Path

app=Path('app-coach-rebels-portals-v10.js')
s=app.read_text()

old=""" const allChartHitterPitches=g.pitches.filter(p=>p.hitter===chartName);"""
new=""" const allChartHitterPitches=g.pitches.filter(p=>p.hitter===chartName);
 const currentPitcherChartHitterPitches=currentPitcherPitches(g).filter(p=>p.hitter===chartName);"""
if old not in s: raise SystemExit('chart hitter pitch anchor not found')
s=s.replace(old,new,1)

old=""" else if(g.previewNext) sourcePitches=allChartHitterPitches;"""
new=""" else if(g.previewNext) sourcePitches=currentPitcherChartHitterPitches;"""
if old not in s: raise SystemExit('next hitter preview anchor not found')
s=s.replace(old,new,1)

old=""" const allActivePitches=g.pitches.filter(p=>activeNames.has(p.hitter));
 const firstPitches=allActivePitches.filter((p,i,a)=>i===0||p.pa!==a[i-1].pa||p.hitter!==a[i-1].hitter);"""
new=""" const allActivePitches=g.pitches.filter(p=>activeNames.has(p.hitter));
 const currentPitcherActivePitches=currentPitcherPitches(g).filter(p=>activeNames.has(p.hitter));
 const firstPitches=currentPitcherActivePitches.filter((p,i,a)=>i===0||p.pa!==a[i-1].pa||p.hitter!==a[i-1].hitter);"""
if old not in s: raise SystemExit('first pitch chart anchor not found')
s=s.replace(old,new,1)
app.write_text(s)

pwa=Path('pwa-update.js')
s=pwa.read_text()
if "BUILD_VERSION='2026.10.17.633'" not in s: raise SystemExit('PWA build 633 anchor not found')
s=s.replace("BUILD_VERSION='2026.10.17.633'","BUILD_VERSION='2026.10.18.634'",1)
s=s.replace("launch','633'","launch','634'",1)
pwa.write_text(s)

index=Path('index.html')
s=index.read_text()
if 'app-coach-rebels-portals-v10.js?v=20261010-gameguest622' not in s: raise SystemExit('coach bundle cache anchor not found')
s=s.replace('app-coach-rebels-portals-v10.js?v=20261010-gameguest622','app-coach-rebels-portals-v10.js?v=20261018-livepitcher634',1)
index.write_text(s)

sw=Path('service-worker-v618.js')
s=sw.read_text()
old_cache="const CACHE='hotb-app-2026.10.17.633';"
if old_cache not in s: raise SystemExit('service worker cache 633 anchor not found')
s=s.replace(old_cache,"const CACHE='hotb-app-2026.10.18.634';",1)
sw.write_text(s)
