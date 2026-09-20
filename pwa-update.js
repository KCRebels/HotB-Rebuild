(() => {
  const BUILD_VERSION = '2026.09.19.200';
  window.HOTB_BUILD_VERSION = BUILD_VERSION;
  // Player portals must always use the current network app. They do not install,
  // update, or re-register the coach PWA service worker.
  if (new URLSearchParams(window.location.search).has('portal')) return;
  if (!('serviceWorker' in navigator) || !window.isSecureContext) return;

  let updateShown = false;
  const hadControllerAtLoad = Boolean(navigator.serviceWorker.controller);
  function showUpdate(version = BUILD_VERSION) {
    if (updateShown) return;
    updateShown = true;
    const notice = document.createElement('aside');
    notice.className = 'pwa-update-notice';
    notice.setAttribute('role', 'status');
    notice.innerHTML = '<span>New HotB version available</span><button type="button">UPDATE NOW</button>';
    notice.querySelector('button').addEventListener('click', async () => {
      const button=notice.querySelector('button');button.disabled=true;button.textContent='UPDATING…';
      // iOS standalone mode can ignore location replacement during a service-worker
      // controller transition. Activate the waiting worker, unregister the old
      // registration, then perform a hard cache-busted navigation. localStorage
      // and IndexedDB are origin data and are intentionally preserved.
      const url=new URL('./',window.location.href);
      url.searchParams.set('source','pwa');
      url.searchParams.set('launch','200');
      url.searchParams.set('hotb-update',version);
      url.searchParams.set('reload',Date.now().toString());
      try{
        const registration=await navigator.serviceWorker.getRegistration('./');
        if(registration?.waiting)registration.waiting.postMessage({type:'SKIP_WAITING'});
        await new Promise(resolve=>setTimeout(resolve,350));
        const current=await navigator.serviceWorker.getRegistration('./');
        if(current)await current.unregister();
      }catch(_){}
      window.location.href=url.href;
      setTimeout(()=>window.location.reload(),1200);
    });
    document.body.appendChild(notice);
  }

  async function checkForUpdate(registration) {
    if (navigator.onLine) {
      try { await registration.update(); } catch (_) { /* Retry on the next open or focus. */ }
    }
    if (registration.waiting) {
      showUpdate();
    }
  }

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('./service-worker.js', {scope: './', updateViaCache: 'none'});
      await checkForUpdate(registration);
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        worker?.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) showUpdate();
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
    if (hadControllerAtLoad) showUpdate();
  });
  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data?.type === 'HOTB_UPDATE_READY' && event.data.version !== BUILD_VERSION) showUpdate(event.data.version);
  });
})();
