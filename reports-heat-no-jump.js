(() => {
  const PATCHED = 'hotbHeatNoJump';

  function patchButton(button) {
    if (!button || button.dataset[PATCHED] === '1') return;
    button.dataset[PATCHED] = '1';

    // Capture before HotB's normal click handler. In selected/group reports the
    // normal full render can close the report modal and reveal Reports main.
    // Stop that handler and update only the heat chart inside the open report.
    button.addEventListener('click', event => {
      const oldBackdrop = button.closest('.modal-backdrop');
      const oldModal = button.closest('.modal');
      const oldHeat = button.closest('.report-heat');
      if (!oldBackdrop || !oldModal || !oldHeat) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      const oldScrollTop = oldModal.scrollTop;
      const oldTitle = oldHeat.querySelector(':scope > h3');
      const result = button.dataset.heatResult;
      const display = button.dataset.heatDisplay;

      // Use HotB's existing report state/render handler without allowing the
      // newly-rendered modal to replace/close the report the coach is viewing.
      const original = button.onclick;
      if (typeof original !== 'function') return;
      original.call(button, event);

      const renderedBackdrops = [...document.querySelectorAll('.modal-backdrop')]
        .filter(backdrop => backdrop !== oldBackdrop && backdrop.querySelector('.report-heat'));
      const renderedBackdrop = renderedBackdrops.at(-1);
      const renderedHeat = renderedBackdrop?.querySelector('.report-heat');

      if (renderedHeat) {
        const renderedTitle = renderedHeat.querySelector(':scope > h3');
        if (oldTitle && renderedTitle) renderedTitle.replaceWith(oldTitle);
        oldHeat.replaceWith(renderedHeat);
        renderedBackdrop.remove();
        oldBackdrop.style.display = '';
        oldModal.scrollTop = oldScrollTop;
        patchAll();
        return;
      }

      // If the main render reused the same backdrop, keep it visible and restore
      // the user's scroll position rather than dropping back to Reports main.
      oldBackdrop.style.display = '';
      oldModal.scrollTop = oldScrollTop;
      if (result || display) patchAll();
    }, true);
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
