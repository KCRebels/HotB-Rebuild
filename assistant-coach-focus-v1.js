/* HotB assistant-coach Focus portal enhancement.
   Privacy boundary: this only decorates already-published coach schedule rows.
   It does not expose Player Focus notes, observations, tags, or private portal data. */
(() => {
  const BADGE_CLASS = 'assistant-coach-focus-badge';
  const safeNames = value => Array.isArray(value)
    ? value.map(name => String(name || '').trim()).filter(Boolean)
    : [];

  function decorate(root = document) {
    root.querySelectorAll('.portal-coach-card li').forEach(row => {
      row.querySelectorAll('.' + BADGE_CLASS).forEach(node => node.remove());
      const block = Number(row.dataset.portalBlock || 0);
      const practice = window.__hotbAssistantCoachPractice;
      const entry = practice?.schedule?.find(item => Number(item?.block) === block);
      const names = safeNames(entry?.focusPlayers);
      if (!names.length) return;
      const strong = row.querySelector('strong');
      if (!strong) return;
      const wrap = document.createElement('span');
      wrap.className = BADGE_CLASS;
      wrap.style.cssText = 'display:inline-flex;align-items:center;gap:5px;margin-left:6px;color:#c71920;font-size:10px;font-weight:850;';
      const badge = document.createElement('span');
      badge.textContent = 'FOCUS';
      badge.style.cssText = 'display:inline-block;padding:2px 6px;border:1.5px solid #c71920;border-radius:999px;background:#fff;color:#c71920;font-size:9px;font-weight:950;line-height:1;';
      const players = document.createElement('span');
      players.textContent = names.join(', ');
      wrap.append(badge, players);
      strong.appendChild(wrap);
    });
  }

  window.HotBAssistantCoachFocus = {
    setPractice(practice) {
      window.__hotbAssistantCoachPractice = practice || null;
      queueMicrotask(() => decorate(document));
    },
    decorate
  };
})();
