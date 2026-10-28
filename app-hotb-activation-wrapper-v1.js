(()=>{
 const sourceUrl='app-coach-rebels-portals-v10.js?v=20261027-activate-direct-671&fresh='+Date.now();
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

   if(!source.includes('HotB deferred activation persistence failed')||!source.includes('HotB deferred recovered-activation persistence failed'))throw new Error('activation-wrapper-patch-anchor');

   const blob=new Blob([source],{type:'text/javascript'}),url=URL.createObjectURL(blob),script=document.createElement('script');
   script.src=url;script.async=false;
   script.onload=()=>{URL.revokeObjectURL(url);window.__HOTB_ACTIVATION_DIRECT_PATCH__='671'};
   script.onerror=()=>{URL.revokeObjectURL(url);throw new Error('activation-wrapper-execute')};
   document.body.appendChild(script);
  }catch(error){
   console.error('HotB activation wrapper failed',error);
   const app=document.getElementById('app');
   if(app)app.innerHTML='<div class="app"><main style="padding:24px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif"><section style="max-width:520px;margin:40px auto;background:#fff;border:2px solid #d4d9d7;border-radius:18px;padding:24px"><strong>HotB Startup Error</strong><p style="margin:8px 0 0">The activation update could not load. Close HotB and reopen it once.</p><p style="margin:8px 0 0">Error code: H671</p></section></main></div>';
  }
 };
 load();
})();