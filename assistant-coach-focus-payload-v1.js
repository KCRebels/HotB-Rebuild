/* Pure helper used when publishing the permanent assistant-coach practice payload.
   Input contains only practice schedule assignment metadata. */
(() => {
  function firstName(name) {
    return String(name || '').trim().split(/\s+/)[0] || '';
  }

  function focusPlayersForBlock(plan, blockIndex) {
    return Object.entries(plan?.schedule || {})
      .filter(([, rows]) => rows?.[blockIndex]?.focusMatch === true)
      .map(([name]) => firstName(name))
      .filter(Boolean);
  }

  function addFocusPlayers(schedule, plan) {
    return (Array.isArray(schedule) ? schedule : []).map((entry, index) => ({
      ...entry,
      focusPlayers: focusPlayersForBlock(plan, index)
    }));
  }

  window.HotBAssistantCoachFocusPayload = { addFocusPlayers, focusPlayersForBlock };
})();
