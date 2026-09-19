(() => {
  const BUILD_VERSION = '2026.09.19.1';
  window.HOTB_BUILD_VERSION = BUILD_VERSION;
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
    notice.querySelector('button').addEventListener('click', () => {
      const url = new URL(window.location.href);
      url.searchParams.set('hotb-update', version);
      if (url.searchParams.has('portal')) {
        url.searchParams.set('hotb-portal-refresh', Date.now().toString());
      }
      window.location.assign(url.href);
    });
    document.body.appendChild(notice);
  }

  async function checkForUpdate(registration) {
    if (navigator.onLine) {
      try { await registration.update(); } catch (_) { /* Retry on the next open or focus. */ }
    }
    if (registration.waiting) {
      showUpdate();
      registration.waiting.postMessage({type: 'SKIP_WAITING'});
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
