from pathlib import Path

# HotB 638: Refresh Player Records must honor Hailey's verified legacy no-PIN
# permanent portal without generating or rotating any player's credentials.
app=Path('app-coach-rebels-portals-v10.js')
s=app.read_text(encoding='utf-8')
old="""  const missingCredential=players.find(player=>!player.portalId||!player.portalPin);
  if(missingCredential)throw new Error('permanent-player-portal-locked-missing-credential:'+missingCredential.name);
  for(const player of players){
   player.portalPinHash=await portalHash(player.portalId,player.portalPin);
  }"""
new="""  const credentialReady=player=>!!player.portalId&&(player.name==='Hailey Marsh'||!!player.portalPin);
  const missingCredential=players.find(player=>!credentialReady(player));
  if(missingCredential)throw new Error('permanent-player-portal-locked-missing-credential:'+missingCredential.name);
  for(const player of players){
   // Hailey's verified permanent portal is intentionally the legacy no-PIN exception.
   // Preserve that credential exactly as-is; never invent or rotate a PIN during refresh.
   if(player.name==='Hailey Marsh')continue;
   player.portalPinHash=await portalHash(player.portalId,player.portalPin);
  }"""
if old not in s: raise SystemExit('HotB 638 credential block anchor not found')
if s.count(old)!=1: raise SystemExit(f'HotB 638 expected one credential block, found {s.count(old)}')
s=s.replace(old,new,1)
app.write_text(s,encoding='utf-8')

# Bump the app build/cache so installed iPhone PWAs receive the corrected bundle.
pwa=Path('pwa-update.js')
s=pwa.read_text(encoding='utf-8')
if "BUILD_VERSION='2026.10.18.637'" not in s: raise SystemExit('PWA build 637 anchor not found')
s=s.replace("BUILD_VERSION='2026.10.18.637'","BUILD_VERSION='2026.10.18.638'",1)
s=s.replace("launch','637'","launch','638'",1)
pwa.write_text(s,encoding='utf-8')

sw=Path('service-worker-v618.js')
s=sw.read_text(encoding='utf-8')
old_cache="const CACHE='hotb-app-2026.10.18.637';"
if old_cache not in s: raise SystemExit('service worker cache 637 anchor not found')
s=s.replace(old_cache,"const CACHE='hotb-app-2026.10.18.638';",1)
sw.write_text(s,encoding='utf-8')

# Local verification before the workflow commit.
assert "const credentialReady=player=>!!player.portalId&&(player.name==='Hailey Marsh'||!!player.portalPin);" in app.read_text(encoding='utf-8')
assert "if(player.name==='Hailey Marsh')continue;" in app.read_text(encoding='utf-8')
assert "players.find(player=>!player.portalId||!player.portalPin)" not in app.read_text(encoding='utf-8')
print('HotB 638 player portal refresh patch applied')
