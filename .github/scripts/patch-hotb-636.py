from pathlib import Path

app=Path('app-coach-rebels-portals-v10.js')
s=app.read_text()
old=""" if(outcome==='FC')g.runners=batterToFirst(g.runners);
 if(outcome==='H4O'&&extra.rba)g.runners=runnersAfterRBA(g.runners);
 if(outcome==='H4O'&&Number(extra.rbiCount)>0)g.runners=runnersAfterRBI(g.runners,extra.rbiCount);
 const completedInning=g.inning,inningEnded=['H4O','K','SAC'].includes(outcome)&&recordOut(g);"""
new=""" if(outcome==='FC')g.runners=batterToFirst(g.runners);
 if(outcome==='H4O'&&extra.rba)g.runners=runnersAfterRBA(g.runners);
 if(outcome==='H4O'&&Number(extra.rbiCount)>0)g.runners=runnersAfterRBI(g.runners,extra.rbiCount);
 if(outcome==='SAC'&&Number(extra.rbiCount)>0)g.runners=runnersAfterRBI(g.runners,extra.rbiCount);
 const completedInning=g.inning,inningEnded=['H4O','K','SAC','FC'].includes(outcome)&&recordOut(g);"""
if old not in s: raise SystemExit('FC/SAC scoring anchor not found')
s=s.replace(old,new,1)
app.write_text(s)

pwa=Path('pwa-update.js')
s=pwa.read_text()
if "BUILD_VERSION='2026.10.18.635'" not in s: raise SystemExit('PWA build 635 anchor not found')
s=s.replace("BUILD_VERSION='2026.10.18.635'","BUILD_VERSION='2026.10.18.636'",1)
s=s.replace("launch','635'","launch','636'",1)
pwa.write_text(s)

sw=Path('service-worker-v618.js')
s=sw.read_text()
old_cache="const CACHE='hotb-app-2026.10.18.635';"
if old_cache not in s: raise SystemExit('service worker cache 635 anchor not found')
s=s.replace(old_cache,"const CACHE='hotb-app-2026.10.18.636';",1)
sw.write_text(s)
