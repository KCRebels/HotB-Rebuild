from pathlib import Path

app=Path('app-coach-rebels-portals-v10.js')
s=app.read_text()
old=""" if(modal?.startsWith('hittingRanking:'))return isCoachEvaluation()?withCoachEvaluationData(()=>hittingRankingModal(modal.slice(15))):hittingRankingModal(modal.slice(15));
 if(modal?.startsWith('ranking:'))return isCoachEvaluation()?withCoachEvaluationData(()=>evalRankingModal(modal.slice(8))):evalRankingModal(modal.slice(8));
 if(modal?.startsWith('pitchRanking:'))return isCoachEvaluation()?withCoachEvaluationData(()=>pitcherRankingModal(modal.slice(13))):pitcherRankingModal(modal.slice(13));"""
new=""" if(modal?.startsWith('hittingRanking:'))return evaluationReadOnly&&portalData?.evaluationData?withCoachEvaluationData(()=>hittingRankingModal(modal.slice(15))):hittingRankingModal(modal.slice(15));
 if(modal?.startsWith('ranking:'))return evaluationReadOnly&&portalData?.evaluationData?withCoachEvaluationData(()=>evalRankingModal(modal.slice(8))):evalRankingModal(modal.slice(8));
 if(modal?.startsWith('pitchRanking:'))return evaluationReadOnly&&portalData?.evaluationData?withCoachEvaluationData(()=>pitcherRankingModal(modal.slice(13))):pitcherRankingModal(modal.slice(13));"""
if old not in s: raise SystemExit('broken Evaluation ranking modal router not found')
s=s.replace(old,new,1)
app.write_text(s)

index=Path('index.html')
s=index.read_text().replace('app-coach-rebels-portals-v10.js?v=20261010-evaldelegate618','app-coach-rebels-portals-v10.js?v=20261010-evalrouter619').replace('pwa-update.js?v=20261010-618','pwa-update.js?v=20261010-619')
index.write_text(s)

pwa=Path('pwa-update.js')
s=pwa.read_text().replace("BUILD_VERSION='2026.10.10.618'","BUILD_VERSION='2026.10.10.619'").replace("launch','618'","launch','619'")
pwa.write_text(s)

sw=Path('service-worker-v618.js')
sw_text=sw.read_text().replace("const CACHE='hotb-app-2026.10.10.618';","const CACHE='hotb-app-2026.10.10.619';")
sw.write_text(sw_text)
