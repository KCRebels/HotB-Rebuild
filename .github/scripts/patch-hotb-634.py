# HotB 634 live pitcher context patch
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
