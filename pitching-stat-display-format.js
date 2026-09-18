(() => {
  
if(new URLSearchParams(location.search).has('portal'))return;
function decimal(value, digits) {
    const parsed = Number.parseFloat(String(value ?? '').replace(/,/g, ''));
    return Number.isFinite(parsed) ? parsed.toFixed(digits) : String(value ?? '');
  }

  function wholePercent(value) {
    const parsed = Number.parseFloat(String(value ?? '').replace('%', ''));
    return Number.isFinite(parsed) ? `${Math.round(parsed)}%` : String(value ?? '');
  }

  function formatPitchingStats(root = document) {
    root.querySelectorAll('.pitcher-stats, .pitching-stats, .pitcher-stat-grid, .pitching-stat-grid').forEach(section => {
      section.querySelectorAll('*').forEach(label => {
        if (label.children.length) return;
        const name = label.textContent.trim().toUpperCase();
        if (!['ERA', 'WHIP', 'K/BB', 'STRIKE %'].includes(name)) return;

        const row = label.closest('.stat-row, .pitcher-stat, .pitching-stat, div');
        if (!row) return;
        const leaves = [...row.querySelectorAll('*')].filter(el => !el.children.length && el !== label);
        const value = leaves.find(el => /-?\d/.test(el.textContent));
        if (!value) return;

        if (name === 'ERA' || name === 'WHIP' || name === 'K/BB') value.textContent = decimal(value.textContent, 2);
        else value.textContent = wholePercent(value.textContent);
      });
    });
  }

  let queued = false;
  function queue() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      formatPitchingStats();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', formatPitchingStats, { once: true });
  else formatPitchingStats();

  new MutationObserver(queue).observe(document.getElementById('app') || document.body, { childList: true, subtree: true });
})();
