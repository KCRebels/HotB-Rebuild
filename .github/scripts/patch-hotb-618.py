from pathlib import Path

app=Path('app-coach-rebels-portals-v10.js')
s=app.read_text()
old=''' return `<nav class="reports-test-bottom-nav" aria-label="HotB test navigation">'''
new=''' return `<nav class="reports-test-bottom-nav" aria-label="HotB test navigation" style="display:grid!important;grid-template-columns:repeat(6,minmax(0,1fr))!important;grid-template-rows:1fr!important;width:100%!important;max-width:720px!important;overflow:hidden!important">'''
if old not in s: raise SystemExit('bottom nav opening tag not found')
s=s.replace(old,new,1)
app.write_text(s)

pwa=Path('pwa-update.js')
s=pwa.read_text().replace("BUILD_VERSION='2026.10.10.620'","BUILD_VERSION='2026.10.10.621'").replace("launch','620'","launch','621'")
pwa.write_text(s)

index=Path('index.html')
s=index.read_text().replace('app-coach-rebels-portals-v10.js?v=20261010-evalrouter619','app-coach-rebels-portals-v10.js?v=20261010-bottomnav621').replace('pwa-update.js?v=20261010-620','pwa-update.js?v=20261010-621')
index.write_text(s)

sw=Path('service-worker-v618.js')
sw_text=sw.read_text().replace("const CACHE='hotb-app-2026.10.10.620';","const CACHE='hotb-app-2026.10.10.621';")
sw.write_text(sw_text)
