(() => {
  const DBKEY = 'hotbRebuildDbV1';
  const norm = value => String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));

  function loadDb() {
    try { return JSON.parse(localStorage.getItem(DBKEY)) || {}; }
    catch (_) { return {}; }
  }

  function pitchersForOpponent(opponent) {
    const db = loadDb();
    const opponentKey = norm(opponent);
    if (!opponentKey) return [];
    const found = new Map();
    const add = (name, number) => {
      name = String(name || '').trim();
      number = String(number || '').trim();
      if (!name && !number) return;
      const key = `${norm(name)}::${norm(number)}`;
      if (!found.has(key)) found.set(key, {name, number});
    };

    (db.pitchers || []).forEach(pitcher => {
      const teams = [...(pitcher.teams || []), ...(pitcher.team ? [pitcher.team] : [])];
      if (teams.some(team => norm(team) === opponentKey)) add(pitcher.name, pitcher.number);
    });

    [...(db.savedGames || []), ...(db.currentGame ? [db.currentGame] : [])].forEach(game => {
      if (norm(game?.opponent) !== opponentKey) return;
      add(game.pitcherName, game.pitcherNumber);
      (game.pitchersUsed || []).forEach(pitcher => add(pitcher.name, pitcher.number));
    });

    return [...found.values()].sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, {sensitivity:'base'}));
  }

  function rebuildPitcherMenu() {
    const opponent = document.getElementById('opponent');
    const menu = document.getElementById('pitcherMenu');
    if (!opponent || !menu) return;
    const pitchers = pitchersForOpponent(opponent.value);
    menu.innerHTML = pitchers.map(p => `<div class="matchup-picker-option"><button type="button" class="matchup-picker-choice" data-pitcher-choice="${esc(p.name)}" data-pitcher-number="${esc(p.number)}"><b>${esc(p.name)}</b>${p.number ? `<span>#${esc(p.number)}</span>` : ''}</button><button type="button" class="matchup-picker-delete" data-delete-pitcher-name="${esc(p.name)}" data-delete-pitcher-number="${esc(p.number)}" aria-label="Delete saved pitcher ${esc(p.name)}">Delete</button></div>`).join('');

    menu.querySelectorAll('[data-pitcher-choice]').forEach(button => {
      button.onclick = () => {
        const name = document.getElementById('pitcherName');
        const number = document.getElementById('pitcherNumber');
        if (name) name.value = button.dataset.pitcherChoice || '';
        if (number) number.value = button.dataset.pitcherNumber || '';
        menu.hidden = true;
        name?.dispatchEvent(new Event('input', {bubbles:true}));
      };
    });
  }

  function bind() {
    const opponent = document.getElementById('opponent');
    const pitcherArrow = document.querySelector('[data-matchup-open="pitcher"]');
    if (!opponent || !pitcherArrow || opponent.dataset.pitcherLinkBound === '1') return;
    opponent.dataset.pitcherLinkBound = '1';

    const refresh = () => {
      const name = document.getElementById('pitcherName');
      const number = document.getElementById('pitcherNumber');
      if (name) name.value = '';
      if (number) number.value = '';
      rebuildPitcherMenu();
    };
    opponent.addEventListener('input', refresh);
    opponent.addEventListener('change', refresh);
    document.querySelectorAll('[data-opponent-choice]').forEach(button => button.addEventListener('click', () => requestAnimationFrame(refresh)));
    pitcherArrow.addEventListener('click', () => rebuildPitcherMenu(), true);
    rebuildPitcherMenu();
  }

  let queued = false;
  new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; bind(); });
  }).observe(document.getElementById('app') || document.body, {childList:true, subtree:true});
  bind();
})();
