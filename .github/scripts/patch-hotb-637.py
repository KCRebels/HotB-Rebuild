from pathlib import Path

app=Path('app-coach-rebels-portals-v10.js')
s=app.read_text()
old="""function reportBaseGames(){
 if(reportMode==='current')return currentGame()?[currentGame()]:[];
 if(reportMode==='game')return db.savedGames.filter(game=>game.id===reportGameId);
 if(reportMode==='selection')return db.savedGames.filter(game=>reportSelectedGameIds.includes(game.id));
 if(reportMode==='group'){
  const group=db.gameGroups.find(item=>item.id===reportGroupId);
  return db.savedGames.filter(game=>(group?.gameIds||[]).includes(game.id));
 }
 return db.savedGames;
}"""
new="""function reportBaseGames(){
 if(reportMode==='current')return currentGame()?[currentGame()]:[];
 // A coach may open a saved scrimmage directly for review, but scrimmages are
 // never part of aggregate reports, selections, saved groups or All Games.
 if(reportMode==='game')return db.savedGames.filter(game=>game.id===reportGameId);
 if(reportMode==='selection')return db.savedGames.filter(game=>!game.scrimmage&&reportSelectedGameIds.includes(game.id));
 if(reportMode==='group'){
  const group=db.gameGroups.find(item=>item.id===reportGroupId);
  return db.savedGames.filter(game=>!game.scrimmage&&(group?.gameIds||[]).includes(game.id));
 }
 return db.savedGames.filter(game=>!game.scrimmage);
}"""
if old not in s: raise SystemExit('reportBaseGames anchor not found')
s=s.replace(old,new,1)

old="function gameChoiceList(selectedIds){return db.savedGames.map(game=>`<label class=\"game-choice\"><input type=\"checkbox\" value=\"${game.id}\" ${selectedIds.includes(game.id)?'checked':''}><span><b>${new Date(game.date).toLocaleDateString()} · ${esc(game.opponent||'Opponent')}</b><small>${(game.plateAppearances||[]).length} PA</small></span></label>`).join('')}"
new="function gameChoiceList(selectedIds){return db.savedGames.filter(game=>!game.scrimmage).map(game=>`<label class=\"game-choice\"><input type=\"checkbox\" value=\"${game.id}\" ${selectedIds.includes(game.id)?'checked':''}><span><b>${new Date(game.date).toLocaleDateString()} · ${esc(game.opponent||'Opponent')}</b><small>${(game.plateAppearances||[]).length} PA</small></span></label>`).join('')}"
if old not in s: raise SystemExit('gameChoiceList anchor not found')
s=s.replace(old,new,1)
app.write_text(s)

pwa=Path('pwa-update.js')
s=pwa.read_text()
if "BUILD_VERSION='2026.10.18.636'" not in s: raise SystemExit('PWA build 636 anchor not found')
s=s.replace("BUILD_VERSION='2026.10.18.636'","BUILD_VERSION='2026.10.18.637'",1)
s=s.replace("launch','636'","launch','637'",1)
pwa.write_text(s)

sw=Path('service-worker-v618.js')
s=sw.read_text()
old_cache="const CACHE='hotb-app-2026.10.18.636';"
if old_cache not in s: raise SystemExit('service worker cache 636 anchor not found')
s=s.replace(old_cache,"const CACHE='hotb-app-2026.10.18.637';",1)
sw.write_text(s)
