(()=>{
 const sourceUrl='app-coach-rebels-portals-v10.js?v=20261027-activate-direct-674&fresh='+Date.now();
 const load=async()=>{
  try{
   const response=await fetch(sourceUrl,{cache:'no-store'});
   if(!response.ok)throw new Error('activation-wrapper-source-'+response.status);
   let source=await response.text();

   const recoveredOld="persistPracticeSession();practicePortalActionBusy=false;render();return;";
   const recoveredNew="practicePortalActionBusy=false;render();setTimeout(()=>{try{persistPracticeSession()}catch(error){console.warn('HotB deferred recovered-activation persistence failed',error)}},0);return;";
   if(source.includes(recoveredOld))source=source.replace(recoveredOld,recoveredNew);

   const successOld=`db.activePortalPractice=pendingPortalPractice;\n  try{persistPracticeSession()}\n  catch(error){\n   // Keep the verified publication pointer in memory so the catch path can route\n   // to recovery instead of treating a successful Firebase activation as failed.\n   if(String(error?.message||'').includes('device-storage-quota-exceeded'))throw error;\n   throw error;\n  }\n  practicePortalActionBusy=false;render();`;
   const successNew=`db.activePortalPractice=pendingPortalPractice;\n  practicePortalActionBusy=false;render();\n  setTimeout(()=>{try{persistPracticeSession()}catch(error){console.warn('HotB deferred activation persistence failed',error)}},0);`;
   if(source.includes(successOld))source=source.replace(successOld,successNew);

   const preflightOld=`const activationDocs=await Promise.all(activationTargets.map(async target=>({target,snapshot:await portalDoc(target.id).get()})));`;
   const preflightNew=`const activationDocs=await Promise.all(activationTargets.map(async target=>({target,snapshot:await Promise.race([portalDoc(target.id).get(),new Promise((_,reject)=>setTimeout(()=>reject(new Error('portal-activation-preflight-timeout:'+target.id)),8000))])})));`;
   if(source.includes(preflightOld))source=source.replace(preflightOld,preflightNew);

   const commitOld=`// Do not mark the practice locally active until Firebase has accepted every portal update.\n  try{await batch.commit()}\n  catch(error){throw error}`;
   const commitNew=`// Do not mark the practice locally active until Firebase has accepted every portal update.\n  try{await Promise.race([batch.commit(),new Promise((_,reject)=>setTimeout(()=>reject(new Error('portal-activation-commit-timeout')),12000))])}\n  catch(error){throw error}`;
   if(source.includes(commitOld))source=source.replace(commitOld,commitNew);

   const cleanupReadsOld=`const existingCleanup=await Promise.all(cleanupTargets.map(async target=>{const snapshot=await portalDoc(target.id).get();if(!snapshot.exists)return null;const remote=snapshot.data()||{},remotePracticeId=remote.activePractice?.id||'';if(remotePracticeId&&remotePracticeId!==practicePlan.portalDraftId)throw new Error('portal-clear-newer-practice-conflict');`;
   const cleanupReadsNew=`const existingCleanup=await Promise.all(cleanupTargets.map(async target=>{const snapshot=await Promise.race([portalDoc(target.id).get(),new Promise((_,reject)=>setTimeout(()=>reject(new Error('portal-deactivation-preflight-timeout:'+target.id)),8000))]);if(!snapshot.exists)return null;const remote=snapshot.data()||{},remotePracticeId=remote.activePractice?.id||'';if(remotePracticeId&&remotePracticeId!==practicePlan.portalDraftId)throw new Error('portal-clear-newer-practice-conflict');`;
   if(source.includes(cleanupReadsOld))source=source.replace(cleanupReadsOld,cleanupReadsNew);

   const cleanupCommitOld=`if(existingCleanup.some(item=>item&&!item.alreadyCleared))await batch.commit();`;
   const cleanupCommitNew=`if(existingCleanup.some(item=>item&&!item.alreadyCleared))await Promise.race([batch.commit(),new Promise((_,reject)=>setTimeout(()=>reject(new Error('portal-deactivation-commit-timeout')),12000))]);`;
   if(source.includes(cleanupCommitOld))source=source.replace(cleanupCommitOld,cleanupCommitNew);

   const deactivateOld=`db.activePortalPractice=null;\n if(db.activePracticeSession&&practicePlan)persistPracticeSession();else save();\n}`;
   const deactivateNew=`db.activePortalPractice=null;\n setTimeout(()=>{try{if(db.activePracticeSession&&practicePlan)persistPracticeSession();else save()}catch(error){console.warn('HotB deferred deactivation persistence failed',error)}},0);\n}`;
   if(source.includes(deactivateOld))source=source.replace(deactivateOld,deactivateNew);

   if(!source.includes('HotB deferred activation persistence failed')||!source.includes('HotB deferred recovered-activation persistence failed')||!source.includes('HotB deferred deactivation persistence failed')||!source.includes('portal-activation-preflight-timeout')||!source.includes('portal-activation-commit-timeout')||!source.includes('portal-deactivation-preflight-timeout')||!source.includes('portal-deactivation-commit-timeout'))throw new Error('activation-wrapper-patch-anchor');

   const blob=new Blob([source],{type:'text/javascript'}),url=URL.createObjectURL(blob),script=document.createElement('script');
   script.src=url;script.async=false;
   script.onload=()=>{URL.revokeObjectURL(url);window.__HOTB_ACTIVATION_DIRECT_PATCH__='674'};
   script.onerror=()=>{URL.revokeObjectURL(url);throw new Error('activation-wrapper-execute')};
   document.body.appendChild(script);
  }catch(error){
   console.error('HotB activation wrapper failed',error);
   const app=document.getElementById('app');
   if(app)app.innerHTML='<div class="app"><main style="padding:24px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif"><section style="max-width:520px;margin:40px auto;background:#fff;border:2px solid #d4d9d7;border-radius:18px;padding:24px"><strong>HotB Startup Error</strong><p style="margin:8px 0 0">The activation update could not load. Close HotB and reopen it once.</p><p style="margin:8px 0 0">Error code: H674</p></section></main></div>';
  }
 };
 load();
})();