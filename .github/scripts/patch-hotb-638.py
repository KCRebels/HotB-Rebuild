from pathlib import Path

app = Path('app-coach-rebels-portals-v10.js')
text = app.read_text(encoding='utf-8')

old = """  const missingCredential=players.find(player=>!player.portalId||!player.portalPin);\n  if(missingCredential)throw new Error('permanent-player-portal-locked-missing-credential:'+missingCredential.name);\n  for(const player of players){\n   player.portalPinHash=await portalHash(player.portalId,player.portalPin);\n  }"""
new = """  const credentialReady=player=>!!player.portalId&&(player.name==='Hailey Marsh'||!!player.portalPin);\n  const missingCredential=players.find(player=>!credentialReady(player));\n  if(missingCredential)throw new Error('permanent-player-portal-locked-missing-credential:'+missingCredential.name);\n  for(const player of players){\n   // Hailey's verified permanent portal is intentionally the legacy no-PIN exception.\n   // Preserve that credential exactly as-is; never invent or rotate a PIN during refresh.\n   if(player.name==='Hailey Marsh')continue;\n   player.portalPinHash=await portalHash(player.portalId,player.portalPin);\n  }"""
if old not in text:
    raise SystemExit('HotB 638: expected setupPlayerPortals credential block not found')
if text.count(old) != 1:
    raise SystemExit(f'HotB 638: expected exactly one credential block, found {text.count(old)}')
text = text.replace(old, new, 1)
app.write_text(text, encoding='utf-8')

index = Path('index.html')
html = index.read_text(encoding='utf-8')
old_src = "app-coach-rebels-portals-v10.js?v=20261018-pitcherreset634"
new_src = "app-coach-rebels-portals-v10.js?v=20261018-portalrefresh638"
if old_src not in html:
    raise SystemExit('HotB 638: production bundle cache-buster not found')
html = html.replace(old_src, new_src, 1)
index.write_text(html, encoding='utf-8')

print('HotB 638 patched: Refresh Player Records now honors Hailey legacy no-PIN portal without changing any permanent credential.')
