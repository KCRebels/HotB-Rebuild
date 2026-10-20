from pathlib import Path

p = Path('app-coach-rebels-portals-v10.js')
s = p.read_text(encoding='utf-8')

old1 = """  const missingPortal=players.find(player=>!player.portalId);\n  if(missingPortal)throw new Error('permanent-player-portal-locked-missing-id:'+missingPortal.name);\n"""
new1 = """  const publishablePlayers=players.filter(player=>!!player.portalId);\n  const missingPortalNames=players.filter(player=>!player.portalId).map(player=>player.name);\n  if(!publishablePlayers.length)throw new Error('permanent-player-portal-locked-no-ids');\n"""
if old1 in s:
    s = s.replace(old1, new1, 1)
elif new1 not in s:
    raise SystemExit('portal id block not found')

old2 = """  // Write existing permanent portals in small independent batches. The full\n  // 13-player evaluation payload can be large enough that one mobile Firestore\n  // batch does not acknowledge within Safari's timeout window.\n  for(let i=0;i<players.length;i+=3){\n   const group=players.slice(i,i+3),batch=cloudStore.batch();\n   group.forEach(player=>{\n    const evaluationData=playerEvaluationPortalPayload(player.name),evaluationVersion=`${Date.now()}-${player.name}`;\n    batch.update(portalDoc(player.portalId),{portalType:'player',playerName:player.name,firstName:practiceFirstName(player.name),evaluationData,evaluationVersion,updatedAt:firebase.firestore.FieldValue.serverTimestamp()});\n   });\n   portalMessage=`Refreshing player records… ${Math.min(i+group.length,players.length)} of ${players.length}`;render();\n   await timed(batch.commit(),'player-portal-write',20000);\n  }\n"""
new2 = """  // Refresh each permanent portal independently so one stale or missing portal\n  // cannot block the rest of the roster from receiving current stats.\n  const failedPortalRefreshes=[];\n  for(let i=0;i<publishablePlayers.length;i++){\n   const player=publishablePlayers[i],evaluationData=playerEvaluationPortalPayload(player.name),evaluationVersion=`${Date.now()}-${player.name}`;\n   try{\n    await timed(portalDoc(player.portalId).update({portalType:'player',playerName:player.name,firstName:practiceFirstName(player.name),evaluationData,evaluationVersion,updatedAt:firebase.firestore.FieldValue.serverTimestamp()}),'player-portal-write:'+player.name,20000);\n   }catch(error){\n    failedPortalRefreshes.push(player.name);\n    console.warn('Player portal refresh failed for '+player.name,error);\n   }\n   portalMessage=`Refreshing player records… ${i+1} of ${publishablePlayers.length}`;render();\n  }\n  if(failedPortalRefreshes.length===publishablePlayers.length)throw new Error('all-player-portal-writes-failed');\n"""
if old2 in s:
    s = s.replace(old2, new2, 1)
elif new2 not in s:
    raise SystemExit('portal write loop not found')

old3 = "  portalMessage=`Player records refreshed, including My Evaluation (${activeDateFilterLabel()}). Existing permanent links were kept.`;"
new3 = "  const notUpdated=[...missingPortalNames,...failedPortalRefreshes];\n  portalMessage=notUpdated.length?`Player records refreshed for ${publishablePlayers.length-failedPortalRefreshes.length} players. Could not refresh: ${notUpdated.join(', ')}.`:`Player records refreshed, including My Evaluation (${activeDateFilterLabel()}). Existing permanent links were kept.`;"
if old3 in s:
    s = s.replace(old3, new3, 1)
elif new3 not in s:
    raise SystemExit('portal success message not found')

p.write_text(s, encoding='utf-8')

idx = Path('index.html')
x = idx.read_text(encoding='utf-8')
oldv = 'app-coach-rebels-portals-v10.js?v=20261019-portalsync642'
newv = 'app-coach-rebels-portals-v10.js?v=20261019-portalsync643'
if oldv in x:
    x = x.replace(oldv, newv, 1)
elif newv not in x:
    raise SystemExit('cache reference not found')
idx.write_text(x, encoding='utf-8')
