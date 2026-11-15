/* HotB startup compatibility loader. Older cached pages may still request
   either activation-wrapper URL. Load the same coach bundle directly instead
   of fetching and executing a rewritten Blob (the H684 failure path). */
(()=>{
 if(window.__HOTB_COACH_BUNDLE_REQUESTED__)return;
 window.__HOTB_COACH_BUNDLE_REQUESTED__=true;
 window.__HOTB_DIRECT_BUNDLE_FALLBACK__=true;
 const script=document.createElement('script');
 script.src='app-coach-rebels-portals-v10.js?v=20261115-h684-safe-startup-693&fresh='+Date.now();
 script.async=false;
 script.onerror=()=>{
  const app=document.getElementById('app');
  if(app)app.innerHTML='<div class="app"><main style="padding:24px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif"><strong>HotB Startup Error</strong><p>The coach program could not be downloaded. Verify network access and reopen HotB.</p><p>Error code: H200-DIRECT</p></main></div>';
 };
 document.body.appendChild(script);
})();
