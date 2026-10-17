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

/* Reports summary tiles: open the same roster-ranking presentation used by Evals. */
(() => {
  if (new URLSearchParams(location.search).has('portal')) return;

  const DBKEY = 'hotbRebuildDbV1';
  const CTXKEY = 'hotbReportExactContextV1';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[char]));
  const round3 = value => Number.isFinite(Number(value)) ? Number(value).toFixed(3).replace(/^0/, '') : '.000';
  const pct0 = value => `${Math.round((Number(value) || 0) * 100)}%`;
  const integer = value => String(Number(value) || 0);
  const definitions = {
    PA:     { key: 'PA',     label: 'PA',   format: integer },
    AVG:    { key: 'AVG',    label: 'AVG',  format: round3 },
    OBP:    { key: 'OBP',    label: 'OBP',  format: round3 },
    SLG:    { key: 'SLG',    label: 'SLG',  format: round3 },
    RBI:    { key: 'RBI',    label: 'RBI',  format: integer },
    'HHB%': { key: 'hhbPct', label: 'HHB%', format: pct0 },
    HITS:   { key: 'H',      label: 'HITS', format: integer },
    K:      { key: 'K',      label: 'K',    format: integer, lowerIsBetter: true },
    'K%':   { key: 'kPct',   label: 'K%',   format: pct0, lowerIsBetter: true },
    BB:     { key: 'BB',     label: 'BB',   format: integer }
  };

  function readDb() {
    try { return JSON.parse(localStorage.getItem(DBKEY) || '{}') || {}; }
    catch (_) { return {}; }
  }

  function exactContextIds() {
    try {
      const context = JSON.parse(sessionStorage.getItem(CTXKEY) || 'null');
      return context?.mode === 'ids' && Array.isArray(context.ids) ? context.ids.filter(Boolean) : null;
    } catch (_) { return null; }
  }

  function seasonMeta(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return { season: '', segment: '' };
    const year = date.getFullYear(), month = date.getMonth() + 1, day = date.getDate();
    if (month === 8 && day >= 2) return { season: '', segment: 'Dead Period' };
    const startYear = month >= 9 ? year : year - 1;
    return {
      season: `${startYear}–${String(startYear + 1).slice(-2)}`,
      segment: month >= 9 ? 'Fall' : 'Summer'
    };
  }

  function matchesDateFilter(game) {
    const seasonInput = document.getElementById('reportSeasonFilter');
    const rangeInput = document.getElementById('reportDateRange');
    const mode = rangeInput?.value || 'full';
    if (mode === 'custom') {
      const time = new Date(game.date).getTime();
      if (Number.isNaN(time)) return false;
      const startValue = document.getElementById('reportDateStart')?.value || '';
      const endValue = document.getElementById('reportDateEnd')?.value || '';
      const start = startValue ? new Date(`${startValue}T00:00:00`).getTime() : -Infinity;
      const end = endValue ? new Date(`${endValue}T23:59:59.999`).getTime() : Infinity;
      return time >= start && time <= end;
    }
    const meta = seasonMeta(game.date);
    const season = seasonInput?.value || meta.season;
    if (meta.season !== season) return false;
    if (mode === 'full') return meta.segment !== 'Dead Period';
    return meta.segment === (mode === 'fall' ? 'Fall' : mode === 'summer' ? 'Summer' : 'Off Season');
  }

  function inferGamesFromAudit(savedGames) {
    const text = document.querySelector('.hotb-report-audit')?.textContent || '';
    const colon = text.indexOf(':');
    if (colon < 0) return null;
    const entries = text.slice(colon + 1).split('|').map(part => part.trim()).filter(Boolean);
    if (!entries.length) return null;
    const matched = [];
    entries.forEach(entry => {
      const parts = entry.split('·').map(part => part.trim());
      if (parts.length < 2) return;
      const [dateLabel, opponent, paLabel = ''] = parts;
      const paCount = Number((paLabel.match(/(\d+)\s*PA/i) || [])[1]);
      const game = savedGames.find(candidate =>
        new Date(candidate.date).toLocaleDateString() === dateLabel &&
        String(candidate.opponent || 'Opponent') === opponent &&
        (!Number.isFinite(paCount) || (candidate.plateAppearances || []).length === paCount) &&
        !matched.includes(candidate)
      );
      if (game) matched.push(game);
    });
    return matched.length ? matched : null;
  }

  function activeReportGames(db) {
    const savedGames = Array.isArray(db.savedGames) ? db.savedGames : [];
    const contextButton = document.getElementById('showReportGames');
    const contextText = (contextButton?.textContent || '').replace(/^Games:\s*/i, '').replace(/›/g, '').trim();
    const exactIds = exactContextIds();
    let games = null;

    if (exactIds?.length && !/All Games/i.test(contextText)) {
      const ids = new Set(exactIds);
      games = savedGames.filter(game => ids.has(game.id));
    }
    if (!games?.length && !/All Games/i.test(contextText)) games = inferGamesFromAudit(savedGames);
    if (!games?.length && contextText && !/All Games/i.test(contextText)) {
      const group = (db.gameGroups || []).find(item => String(item?.name || '') === contextText);
      if (group) {
        const ids = new Set(group.gameIds || []);
        games = savedGames.filter(game => ids.has(game.id));
      }
    }
    if (!games?.length && /Current/i.test(document.querySelector('.report-tabs .black')?.textContent || '')) {
      games = db.currentGame ? [db.currentGame] : [];
    }
    if (!games) games = savedGames.filter(game => !game.scrimmage);

    const hasDateControls = !!document.getElementById('reportDateRange');
    if (hasDateControls) games = games.filter(matchesDateFilter);
    const opponent = document.getElementById('reportOpponent')?.value || 'All Opponents';
    if (opponent !== 'All Opponents') games = games.filter(game => game.opponent === opponent);
    return games;
  }

  function rosterNames(db, games) {
    const names = [];
    const add = name => { if (name && !names.includes(name)) names.push(name); };
    (db.roster || []).filter(player => player && !player.isTeamJenkins).forEach(player => add(player.name));
    (games || []).flatMap(game => game.plateAppearances || []).forEach(pa => add(pa.hitter));
    return names;
  }

  function rankingKicker() {
    const season = document.getElementById('reportSeasonFilter')?.value || '';
    const context = (document.getElementById('showReportGames')?.textContent || '')
      .replace(/^Games:\s*/i, '').replace(/›/g, '').trim();
    const range = document.getElementById('reportDateRange')?.selectedOptions?.[0]?.textContent?.trim() || '';
    const opponent = document.getElementById('reportOpponent')?.value || 'All Opponents';
    const scope = context && !/^All Games$/i.test(context) ? context : range;
    return ['ALL PLAYERS', season, scope, opponent !== 'All Opponents' ? opponent : ''].filter(Boolean).join(' · ');
  }

  function openRanking(metric) {
    const definition = definitions[metric];
    const api = window.HotBEvaluationStats;
    if (!definition || !api?.statsForPAs) return;
    document.querySelector('.hotb-report-ranking-backdrop')?.remove();

    const db = readDb();
    const games = activeReportGames(db);
    const allPAs = games.flatMap(game => game.plateAppearances || []);
    const rows = rosterNames(db, games).map(name => {
      const stats = api.statsForPAs(allPAs.filter(pa => pa.hitter === name));
      return { name, stats, value: stats.PA ? stats[definition.key] : null };
    }).sort((a, b) => {
      if (a.value === null && b.value === null) return a.name.localeCompare(b.name);
      if (a.value === null) return 1;
      if (b.value === null) return -1;
      const delta = definition.lowerIsBetter ? Number(a.value) - Number(b.value) : Number(b.value) - Number(a.value);
      return delta || a.name.localeCompare(b.name);
    });

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop hotb-report-ranking-backdrop';
    backdrop.innerHTML = `<div class="modal dark ranking-modal hotb-report-ranking-modal"><div class="modal-header"><div><div class="small ranking-kicker">${esc(rankingKicker())}</div><h2>${esc(definition.label)}</h2></div><button type="button" class="btn" data-report-ranking-close>Close</button></div><div class="ranking-list">${rows.map((row, index) => `<div class="ranking-row hitting-ranking-row"><span class="ranking-place">${index + 1}</span><span class="ranking-name">${esc(row.name)}<small>${row.stats.PA} PA</small></span><strong>${row.value === null ? '—' : esc(definition.format(row.value))}</strong></div>`).join('')}</div></div>`;
    (document.getElementById('app') || document.body).appendChild(backdrop);
  }

  document.addEventListener('click', event => {
    const close = event.target instanceof Element ? event.target.closest('[data-report-ranking-close]') : null;
    if (close) {
      event.preventDefault();
      event.stopPropagation();
      close.closest('.hotb-report-ranking-backdrop')?.remove();
      return;
    }
    const card = event.target instanceof Element ? event.target.closest('.report-detail .report-stat') : null;
    if (!card || card.closest('.hotb-report-ranking-backdrop')) return;
    const label = (card.querySelector('span')?.textContent || '').trim().toUpperCase();
    if (!definitions[label]) return;
    event.preventDefault();
    event.stopPropagation();
    openRanking(label);
  }, true);
})();
