from pathlib import Path

app=Path('app-coach-rebels-portals-v10.js')
s=app.read_text()

old="""function currentHitter(g=currentGame()){return hitterObj(g?.battingOrder?.[g.currentIdx]||'')}"""
new="""function currentHitter(g=currentGame()){return hitterObj(g?.battingOrder?.[g.currentIdx]||'')}
function currentPitcherStartIndex(g=currentGame()){
 const used=g?.pitchersUsed||[];
 return Number(used.length?used[used.length-1]?.pitchIndex:0)||0;
}
function currentPitcherPitches(g=currentGame()){return (g?.pitches||[]).slice(currentPitcherStartIndex(g))}"""
if old not in s: raise SystemExit('current hitter helper anchor not found')
s=s.replace(old,new,1)

old="""if(g.zoneScope==='TEAM'&&!g.previewNext) sourcePitches=g.pitches.filter(p=>activeNames.has(p.hitter));"""
new="""if(g.zoneScope==='TEAM'&&!g.previewNext) sourcePitches=currentPitcherPitches(g).filter(p=>activeNames.has(p.hitter));"""
if old not in s: raise SystemExit('team pitch scope anchor not found')
s=s.replace(old,new,1)

old="""function aiPitchRecords(g){
 const season=aiSeason(g),opponent=normalized(g.opponent),pitcherName=normalized(g.pitcherName),pitcherNumber=normalized(g.pitcherNumber);
 const games=[...db.savedGames,...(db.currentGame?[db.currentGame]:[])].filter(game=>
  (game.id===g.id||aiSeason(game)===season)&&normalized(game.opponent)===opponent
 );
 const hasPitcher=game=>(game.pitches||[]).some(pitch=>normalized(pitch.pitcherName)===pitcherName&&normalized(pitch.pitcherNumber)===pitcherNumber);
 const prior=games.filter(game=>game.id!==g.id&&hasPitcher(game)).sort((a,b)=>new Date(b.date)-new Date(a.date));
 const recentIds=new Set(prior.slice(0,3).map(game=>game.id));
 const records=[];
 games.forEach(game=>{
  const paIndexes=new Map();
  (game.pitches||[]).forEach(pitch=>{
   if(normalized(pitch.pitcherName)!==pitcherName||normalized(pitch.pitcherNumber)!==pitcherNumber)return;
   const paKey=`${pitch.hitter}::${pitch.pa}`,paPitchIndex=paIndexes.get(paKey)||0;paIndexes.set(paKey,paPitchIndex+1);
   records.push({pitch,game,paPitchIndex,gameWeight:game.id===g.id?3:recentIds.has(game.id)?1.5:.75});
  });
 });
 return records;
}"""
new="""function aiPitchRecords(g){
 const pitcherName=normalized(g.pitcherName),pitcherNumber=normalized(g.pitcherNumber),records=[],paIndexes=new Map();
 currentPitcherPitches(g).forEach(pitch=>{
  if(normalized(pitch.pitcherName)!==pitcherName||normalized(pitch.pitcherNumber)!==pitcherNumber)return;
  const paKey=`${pitch.hitter}::${pitch.pa}`,paPitchIndex=paIndexes.get(paKey)||0;paIndexes.set(paKey,paPitchIndex+1);
  records.push({pitch,game:g,paPitchIndex,gameWeight:3});
 });
 return records;
}"""
if old not in s: raise SystemExit('AI pitch records anchor not found')
s=s.replace(old,new,1)
app.write_text(s)

pwa=Path('pwa-update.js')
s=pwa.read_text()
if "BUILD_VERSION='2026.10.10.622'" not in s: raise SystemExit('PWA build 622 anchor not found')
s=s.replace("BUILD_VERSION='2026.10.10.622'","BUILD_VERSION='2026.10.18.623'",1)
s=s.replace("launch','622'","launch','623'",1)
pwa.write_text(s)

index=Path('index.html')
s=index.read_text()
if 'app-coach-rebels-portals-v10.js?v=20261010-gameguest622' not in s: raise SystemExit('coach bundle cache anchor not found')
s=s.replace('app-coach-rebels-portals-v10.js?v=20261010-gameguest622','app-coach-rebels-portals-v10.js?v=20261018-pitcherreset623',1)
s=s.replace('pwa-update.js?v=20261010-622','pwa-update.js?v=20261018-623',1)
index.write_text(s)

sw=Path('service-worker-v618.js')
s=sw.read_text()
if "const CACHE='hotb-app-2026.10.10.622';" not in s: raise SystemExit('service worker cache 622 anchor not found')
s=s.replace("const CACHE='hotb-app-2026.10.10.622';","const CACHE='hotb-app-2026.10.18.623';",1)
sw.write_text(s)
