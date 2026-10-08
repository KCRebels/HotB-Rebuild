/* HotB Observation -> Player Focus direct-publish staging module.
 * Staging only. This file is intentionally not loaded by production build 547.
 *
 * Integration contract:
 * - New game/end-inning/focus observations use Publish, never Save-then-publish.
 * - The production bundle owns DB/Firebase state and exposes only the narrow bridge
 *   this module needs. That keeps permanent portal recovery and archive semantics
 *   in one authoritative place.
 */
(() => {
  'use strict';

  const state = {
    draft: null,
    selectedDrills: [],
    publishing: false
  };

  function uniqueNames(values) {
    return [...new Set((Array.isArray(values) ? values : []).map(v => String(v || '').trim()).filter(Boolean))].slice(0, 3);
  }

  function normalizeDraft(input = {}) {
    return {
      mode: input.mode === 'focus' ? 'focus' : 'game',
      playerName: String(input.playerName || '').trim(),
      paId: String(input.paId || '').trim(),
      tags: uniqueNames(input.tags),
      note: String(input.note || '').trim(),
      inning: Number(input.inning) || 0,
      fromInningPrompt: input.fromInningPrompt === true
    };
  }

  function begin(input, suggestedDrills = []) {
    state.draft = normalizeDraft(input);
    state.selectedDrills = uniqueNames(suggestedDrills);
    state.publishing = false;
    return snapshot();
  }

  function setDraft(input) {
    state.draft = normalizeDraft(input);
    return snapshot();
  }

  function toggleDrill(name) {
    const drill = String(name || '').trim();
    if (!drill) return snapshot();
    const current = state.selectedDrills.slice();
    const index = current.indexOf(drill);
    if (index >= 0) current.splice(index, 1);
    else if (current.length < 3) current.push(drill);
    state.selectedDrills = uniqueNames(current);
    return snapshot();
  }

  function setDrills(names) {
    state.selectedDrills = uniqueNames(names);
    return snapshot();
  }

  function snapshot() {
    return {
      draft: state.draft ? { ...state.draft, tags: state.draft.tags.slice() } : null,
      selectedDrills: state.selectedDrills.slice(),
      publishing: state.publishing
    };
  }

  function validate() {
    if (!state.draft?.playerName) throw new Error('Choose a player before publishing.');
    if (!state.draft.tags.length && !state.draft.note) throw new Error('Add an observation or note before publishing.');
    return true;
  }

  async function publish() {
    validate();
    if (state.publishing) return false;
    const bridge = window.HotBObservationPublishBridge;
    if (!bridge || typeof bridge.publish !== 'function') {
      throw new Error('Observation publishing is not connected to this HotB build.');
    }
    state.publishing = true;
    try {
      const result = await bridge.publish({
        observation: { ...state.draft, tags: state.draft.tags.slice() },
        drills: state.selectedDrills.slice()
      });
      if (!result || result.ok !== true) throw new Error(result?.message || 'Player Focus was not published.');
      state.draft = null;
      state.selectedDrills = [];
      return result;
    } finally {
      state.publishing = false;
    }
  }

  window.HotBObservationPublish = Object.freeze({
    begin,
    setDraft,
    toggleDrill,
    setDrills,
    snapshot,
    validate,
    publish
  });
})();
