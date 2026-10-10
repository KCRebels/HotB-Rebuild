from pathlib import Path

pwa=Path('pwa-update.js')
s=pwa.read_text()
old=""" let hiddenAt=0;document.addEventListener('visibilitychange',()=>{if(params.has('screen'))return;if(document.hidden){hiddenAt=Date.now();forceHome();return}if(hiddenAt&&Date.now()-hiddenAt>750){hiddenAt=0;location.reload()}});"""
if old not in s: raise SystemExit('background reload handler not found')
s=s.replace(old,'',1)
s=s.replace("BUILD_VERSION='2026.10.10.619'","BUILD_VERSION='2026.10.10.620'").replace("launch','619'","launch','620'")
pwa.write_text(s)

index=Path('index.html')
s=index.read_text().replace('pwa-update.js?v=20261010-619','pwa-update.js?v=20261010-620')
index.write_text(s)

sw=Path('service-worker-v618.js')
sw_text=sw.read_text().replace("const CACHE='hotb-app-2026.10.10.619';","const CACHE='hotb-app-2026.10.10.620';")
sw.write_text(sw_text)
