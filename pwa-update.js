(() => {
  const BUILD_VERSION = '2026.10.08.549';
  window.HOTB_BUILD_VERSION = BUILD_VERSION;
  if (new URLSearchParams(window.location.search).has('portal')) return;

  const runtimeSafety=document.createElement('script');
  runtimeSafety.src='practice-bypass.js?v=20261007-undo10';
  runtimeSafety.async=false;
  document.head.appendChild(runtimeSafety);

  const nightFixes=document.createElement('link');
  nightFixes.rel='stylesheet';
  nightFixes.href='hotb-night-fixes.css?v=20261007-1';
  document.head.appendChild(nightFixes);

  const observationStyles=document.createElement('link');
  observationStyles.rel='stylesheet';
  observationStyles.href='observation-publish-v2.css?v=20261008-549';
  document.head.appendChild(observationStyles);

  const observationPublish=document.createElement('script');
  observationPublish.src='observation-publish-v2.js?v=20261008-549';
  observationPublish.async=false;
  document.head.appendChild(observationPublish);

  if (!('serviceWorker' in navigator) || !window.isSecureContext) return;

  let updateShown = false;
  let updateAccepted = sessionStorage.getItem('hotbUpdateAccepted') === BUILD_VERSION;
  const hadControllerAtLoad = Boolean(navigator.serviceWorker.controller);
  function showUpdate(version = 'new') {
    if (updateShown || updateAccepted) return;
    updateShown = true;
    const notice = document.createElement('aside');
    notice.className = 'pwa-update-notice';
    notice.setAttribute('role', 'status');
    notice.innerHTML = '<span>New HotB version available</span><button type="button">UPDATE NOW</button>';
    notice.querySelector('button').addEventListener('click', () => {
      const button=notice.querySelector('button');button.disabled=true;button.textContent='UPDATING…';
      updateAccepted=true;sessionStorage.setItem('hotbUpdateAccepted',BUILD_VERSION);
      try{
        navigator.serviceWorker.getRegistration('./').then(registration=>{
          try{registration?.waiting?.postMessage({type:'SKIP_WAITING'})}catch(_){}
          try{registration?.update()}catch(_){}
        }).catch(()=>{});
      }catch(_){}
      const url=new URL('./',window.location.href);
      url.searchParams.set('source','pwa');
      url.searchParams.set('launch','549');
      url.searchParams.set('hotb-update',version);
      url.searchParams.set('reload',Date.now().toString());
      window.location.replace(url.href);
    });
    document.body.appendChild(notice);
  }

  async function checkForUpdate(registration) {
    if (navigator.onLine) { try { await registration.update(); } catch (_) {} }
    if (registration.waiting) showUpdate('waiting-worker');
  }

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('./service-worker.js', {scope: './', updateViaCache: 'none'});
      await checkForUpdate(registration);
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        worker?.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) showUpdate('installed-worker');
        });
      });
      window.addEventListener('pageshow', () => checkForUpdate(registration));
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') checkForUpdate(registration); });
    } catch (_) {}
  });

  navigator.serviceWorker.addEventListener('controllerchange', () => { if (hadControllerAtLoad) showUpdate('controller-changed'); });
  navigator.serviceWorker.addEventListener('message', event => { if (event.data?.type === 'HOTB_UPDATE_READY' && event.data.version !== BUILD_VERSION) showUpdate(event.data.version); });
})();
