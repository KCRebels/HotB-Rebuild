// HotB runtime storage safety patch.
// The live-game renderer snapshots the game into currentGame.undoStack on every render.
// Late in a game, those full-game snapshots can exhaust iOS PWA localStorage. The pitch
// itself has already been saved, but the quota exception interrupts render(), making the
// scoring screen appear frozen until the app is restarted.
(() => {
  const DB_KEY = 'hotb_rebuild_v1';
  const nativeSetItem = Storage.prototype.setItem;

  function isQuotaError(err) {
    return !!err && (
      err.name === 'QuotaExceededError' ||
      err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      err.code === 22 ||
      err.code === 1014
    );
  }

  function trimGameUndoStack(serialized, keep) {
    const data = JSON.parse(serialized);
    const game = data && data.currentGame;
    if (!game || !Array.isArray(game.undoStack) || game.undoStack.length <= keep) return null;
    game.undoStack = game.undoStack.slice(-keep);
    return JSON.stringify(data);
  }

  Storage.prototype.setItem = function(key, value) {
    try {
      return nativeSetItem.call(this, key, value);
    } catch (err) {
      if (String(key) !== DB_KEY || !isQuotaError(err) || typeof value !== 'string') throw err;

      // Keep recent Undo useful while preventing historical full-game snapshots from
      // blocking the scoring UI. Retry progressively smaller stacks for tight iOS storage.
      for (const keep of [12, 8, 4, 1, 0]) {
        try {
          const trimmed = trimGameUndoStack(value, keep);
          if (trimmed == null) continue;
          return nativeSetItem.call(this, key, trimmed);
        } catch (retryErr) {
          if (!isQuotaError(retryErr)) throw retryErr;
        }
      }

      // Never let an undo-history storage failure abort the live-game render. The normal
      // pitch save occurs before the renderer takes its next undo snapshot.
      console.warn('[HotB] localStorage full while saving game undo history; render preserved.');
      return undefined;
    }
  };
})();
