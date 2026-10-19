from pathlib import Path

# HotB 640: Refresh Player Records must honor Hailey's verified legacy no-PIN
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
if old not in s: raise SystemExit('HotB 640 credential block anchor not found')
if s.count(old)!=1: raise SystemExit(f'HotB 640 expected one credential block, found {s.count(old)}')
s=s.replace(old,new,1)
app.write_text(s,encoding='utf-8')

# Bump the live iPhone/PWA build so installed apps receive the corrected bundle.
pwa=Path('pwa-update.js')
s=pwa.read_text(encoding='utf-8')
if "BUILD_VERSION='2026.10.18.639'" not in s: raise SystemExit('PWA build 639 anchor not found')
s=s.replace("BUILD_VERSION='2026.10.18.639'","BUILD_VERSION='2026.10.18.640'",1)
s=s.replace("launch','639'","launch','640'",1)
pwa.write_text(s,encoding='utf-8')

sw=Path('service-worker-v620.js')
s=sw.read_text(encoding='utf-8')
old_cache="const CACHE='hotb-app-2026.10.18.639';"
if old_cache not in s: raise SystemExit('service worker cache 639 anchor not found')
s=s.replace(old_cache,"const CACHE='hotb-app-2026.10.18.640';",1)
sw.write_text(s,encoding='utf-8')

# Verify the exact safety behavior before committing.
patched=app.read_text(encoding='utf-8')
assert "const credentialReady=player=>!!player.portalId&&(player.name==='Hailey Marsh'||!!player.portalPin);" in patched
assert "if(player.name==='Hailey Marsh')continue;" in patched
assert "players.find(player=>!player.portalId||!player.portalPin)" not in patched
assert "'Hailey Marsh':{portalId:'FfLTZU3mUG_vCpd7_ulFgAuZ'}" in patched
print('HotB 640 player portal refresh patch applied and verified')
