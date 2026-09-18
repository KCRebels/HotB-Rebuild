(() => {
  
if(new URLSearchParams(location.search).has('portal'))return;
const PATCHED = 'hotbHeatNoJump';

  function patchButton(button) {
    if (!button || button.dataset[PATCHED] === '1' || typeof button.onclick !== 'function') return;
    const original = button.onclick;
    button.dataset[PATCHED] = '1';

    button.onclick = function (event) {
      const oldBackdrop = button.closest('.modal-backdrop');
      const oldModal = button.closest('.modal');
      const oldHeat = button.closest('.report-heat');
      if (!oldBackdrop || !oldModal || !oldHeat) return original.call(this, event);

      const oldScrollTop = oldModal.scrollTop;

      // Let HotB update its real reportHeatResult/reportHeatDisplay state and build
      // the new chart, but do not keep the newly-created Reports modal.
      original.call(this, event);

      const renderedBackdrop = document.querySelector('.modal-backdrop');
      const renderedHeat = renderedBackdrop?.querySelector('.report-heat');
      if (!renderedBackdrop || !renderedHeat || renderedBackdrop === oldBackdrop) return;

      // Move only the newly-rendered Heat Chart into the existing modal. Keeping
      // the original modal node prevents iOS from resetting/repositioning scroll.
      oldHeat.replaceWith(renderedHeat);
      renderedBackdrop.replaceWith(oldBackdrop);
      oldModal.scrollTop = oldScrollTop;

      // reports-heat-match.js will restyle the inserted chart on the next frame.
      patchAll();
    };
  }

  function patchAll() {
    document.querySelectorAll('.report-heat [data-heat-result], .report-heat [data-heat-display]').forEach(patchButton);
  }

  let queued = false;
  function queuePatch() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      patchAll();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', patchAll, { once: true });
  else patchAll();

  new MutationObserver(queuePatch).observe(document.getElementById('app') || document.body, { childList: true, subtree: true });
})();
