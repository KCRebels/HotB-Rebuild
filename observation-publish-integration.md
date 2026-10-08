# HotB direct Observation → Player Focus integration

## One-screen behavior
The existing Coach Observation modal remains the single entry point from Live Game, the end-of-inning prompt, and Player Focus. New observations show the existing player selector, Dictate Note, max-three observation tags, note field, Suggested Drills, and one **Publish** button. There is no Save Observation button for a new observation. Manage/edit mode keeps Update Observation and does not silently republish history.

## Required production bridge
`app-coach-rebels-portals-v10.js` installs `window.HotBObservationPublishBridge` from inside its closure. External staging modules never receive `db`, `cloudStore`, portal credentials, or mutation helpers.

### preflight({playerName})
1. Find exactly one competitive-roster player by full name; Jenkins/practice-only players are rejected for Player Focus.
2. Require live Cloud Backup coach auth and `cloudStore`.
3. If the roster player has no `portalId`, call the existing `recoverPermanentPlayerPortal(player)`.
4. Require the recovered/existing permanent `portalId`.
5. Read that exact `playerPortals/{portalId}` document and verify it exists and belongs to the same player/permanent player portal type before returning `{ok:true}`.
6. No observation or Player Focus state is changed during preflight.

### publish({observation,drills})
1. Validate with the bridge contract: player, content, max three tags, max three drills.
2. Run preflight again immediately before the write to avoid stale modal state.
3. Capture rollback copies of the local observation source and all Player Focus local state that this transaction can change.
4. Persist the new observation into its normal evidence source:
   - game/end-inning → `api.saveObservation(currentGame(), payload)`
   - Player Focus → `api.saveStandalone(db.coachObservations, payload)` with `observedAt`.
5. Build the normal `playerFocusPortalPayload()` while the new observation is present so the portal receives the same evidence Player Focus would use. Replace `payload.drills` with the explicitly selected drill names from the modal.
6. Read the existing permanent portal. Archive the previous remote focus exactly as the current Player Focus publisher does.
7. Write `focus`, `focusArchive`, clear `focusOpenedPublishedAt`/`focusOpenedAt`, and update server timestamp to the existing permanent portal document.
8. Only after the remote write succeeds, perform the existing local publication bookkeeping: local focus archive, `playerFocusLastReviewed`, clear local opened receipt, consume player-focus standalone evidence, clear that player's drill overrides, `save()`.
9. Close the Observation modal and return `{ok:true,playerName,publishedAt}`.
10. If any step before the remote write fails, restore the captured local observation/state and leave the modal open.
11. If the remote write succeeds but the final local bookkeeping save fails, do **not** overwrite the successful remote publication. Return a recovery-specific failure, leave enough local evidence intact to reconcile on the next open, and never claim that nothing was published.

## UI integration
When `coachObservationModal()` opens for a new game/focus observation, call `HotBObservationPublish.begin()` with the current target/tags/note and the same `focusSuggestedDrills()` source used by Player Focus. Mount the publish panel after the note area. Tag/player/note changes update the draft. Drill selection is capped at three. The old `#saveCoachObservation` action is removed/hidden only for new game/focus observations; manage mode is unchanged.

## Release verification before production
- Live Game OBS opens one complete screen and publishes to that player's permanent portal.
- End Inning uses the same screen and same Publish action.
- Player Focus entry uses the same screen.
- Dictation still fills the note field.
- A fourth observation tag cannot be selected.
- A fourth drill cannot be selected.
- Publish without observation text/tags is blocked.
- Cloud signed out: no observation is created and modal remains open.
- Missing/unmatched permanent portal: no observation is created and modal remains open.
- Successful publish archives prior focus, resets Opened receipt, and immediately makes the new focus the active portal focus.
- Existing manual Player Focus Publish still works as a backup path.
- Manage/Edit Observation still says Update Observation and does not publish automatically.
- Live scoring, inning advance, Undo, PA history, and current-game recovery are unchanged.
- iPhone PWA receives all new JS/CSS through the same build bump and service-worker cache update.
