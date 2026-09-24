(() => {
  const BUILD_VERSION = '2026.09.24.291';
  window.HOTB_BUILD_VERSION = BUILD_VERSION;
  // Player portals must always use the current network app. They do not install,
  // update, or re-register the coach PWA service worker.
  if (new URLSearchParams(window.location.search).has('portal')) return;
  if (!('serviceWorker' in navigator) || !window.isSecureContext) return;

  let updateShown = false;
  let updateAccepted = sessionStorage.getItem('hotbUpdateAccepted') === BUILD_VERSION;
  const hadControllerAtLoad = Boolean(navigator.serviceWorker.controller);
  function showUpdate(version = 'new') {
    // The running pwa-update.js describes the CURRENT page, not the waiting worker.
    // A waiting worker therefore means an update exists even when no version string
    // is available (or when an old worker reports the same value as this page).
    if (updateShown || updateAccepted) return;
    updateShown = true;
    const notice = document.createElement('aside');
    notice.className = 'pwa-update-notice';
    notice.setAttribute('role', 'status');
    notice.innerHTML = '<span>New HotB version available</span><button type="button">UPDATE NOW</button>';
    notice.querySelector('button').addEventListener('click', () => {
      const button=notice.querySelector('button');button.disabled=true;button.textContent='UPDATING…';
      updateAccepted=true;sessionStorage.setItem('hotbUpdateAccepted',BUILD_VERSION);
      // Do not wait on iOS service-worker promises before navigating. A waiting
      // worker can leave those promises unresolved in standalone mode and the
      // user sees a dead button. Send activation as best-effort and navigate
      // synchronously in the tap gesture to a unique network URL.
      try{
        navigator.serviceWorker.getRegistration('./').then(registration=>{
          try{registration?.waiting?.postMessage({type:'SKIP_WAITING'})}catch(_){}
          try{registration?.update()}catch(_){}
        }).catch(()=>{});
      }catch(_){}
      const url=new URL('./',window.location.href);
      url.searchParams.set('source','pwa');
      url.searchParams.set('launch','288');
      url.searchParams.set('hotb-update',version);
      url.searchParams.set('reload',Date.now().toString());
      window.location.replace(url.href);
    });
    document.body.appendChild(notice);
  }

  async function checkForUpdate(registration) {
    if (navigator.onLine) {
      try { await registration.update(); } catch (_) { /* Retry on the next open or focus. */ }
    }
    if (registration.waiting) {
      showUpdate('waiting-worker');
    }
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
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') checkForUpdate(registration);
      });
    } catch (_) {
      // The app remains usable if service workers are unavailable or registration fails.
    }
  });

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hadControllerAtLoad) showUpdate('controller-changed');
  });
  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data?.type === 'HOTB_UPDATE_READY' && event.data.version !== BUILD_VERSION) showUpdate(event.data.version);
  });
})();
