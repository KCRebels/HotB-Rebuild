// HotB runtime storage safety patch.
// Keep only the 10 most recent live-game undo snapshots so long games cannot grow the
// full-game snapshot history until iOS PWA localStorage is exhausted.
(() => {
  // Must match the production DBKEY used by app-coach-rebels-portals-v10.js.
  const DB_KEY = 'hotbRebuildDbV1';
  const UNDO_LIMIT = 10;
  const nativeSetItem = Storage.prototype.setItem;

  function isQuotaError(err) {
    return !!err && (
      err.name === 'QuotaExceededError' ||
      err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      err.code === 22 ||
      err.code === 1014
    );
  }

  function trimGameUndoStack(serialized, keep = UNDO_LIMIT) {
    const data = JSON.parse(serialized);
    const game = data && data.currentGame;
    if (!game || !Array.isArray(game.undoStack) || game.undoStack.length <= keep) return null;
    game.undoStack = game.undoStack.slice(-keep);
    return JSON.stringify(data);
  }

  Storage.prototype.setItem = function(key, value) {
    let valueToStore = value;

    // Enforce the rolling limit on every normal game save, not only after storage fills.
    if (String(key) === DB_KEY && typeof value === 'string') {
      try {
        valueToStore = trimGameUndoStack(value, UNDO_LIMIT) || value;
      } catch (_) {}
    }

    try {
      return nativeSetItem.call(this, key, valueToStore);
    } catch (err) {
      if (String(key) !== DB_KEY || !isQuotaError(err) || typeof valueToStore !== 'string') throw err;

      // Extra protection for an already-tight device: sacrifice older Undo entries before
      // allowing storage pressure to interrupt the live-game render.
      for (const keep of [8, 4, 1, 0]) {
        try {
          const trimmed = trimGameUndoStack(valueToStore, keep);
          if (trimmed == null) continue;
          return nativeSetItem.call(this, key, trimmed);
        } catch (retryErr) {
          if (!isQuotaError(retryErr)) throw retryErr;
        }
      }

      // If the DB still cannot be written with no Undo history, preserve the current
      // rendered game instead of letting a reconstructable Undo cache freeze the UI.
      console.warn('[HotB] localStorage full after removing live-game undo history; render preserved.');
      return undefined;
    }
  };
})();
