/* HotB direct Observation publishing bridge contract.
 * STAGING SUPPORT FILE — not loaded by production 547.
 *
 * The actual bridge is installed from inside app-coach-rebels-portals-v10.js so it
 * can safely use its closed-scope db/cloudStore/save/recoverPermanentPlayerPortal
 * functions. This file documents and validates the boundary used by
 * observation-publish-v2.js.
 */
(() => {
  'use strict';
  const REQUIRED_RESULT_FIELDS=['ok'];
  const MAX_TAGS=3,MAX_DRILLS=3;

  function cleanNames(values,max){return [...new Set((Array.isArray(values)?values:[]).map(v=>String(v||'').trim()).filter(Boolean))].slice(0,max)}
  function normalizeRequest(request={}){
    const raw=request.observation||{};
    return {
      observation:{
        mode:raw.mode==='focus'?'focus':'game',
        playerName:String(raw.playerName||'').trim(),
        paId:String(raw.paId||'').trim(),
        tags:cleanNames(raw.tags,MAX_TAGS),
        note:String(raw.note||'').trim(),
        inning:Number(raw.inning)||0,
        fromInningPrompt:raw.fromInningPrompt===true
      },
      drills:cleanNames(request.drills,MAX_DRILLS)
    };
  }
  function validateRequest(request){
    const normalized=normalizeRequest(request),o=normalized.observation;
    if(!o.playerName)throw new Error('observation-player-required');
    if(!o.tags.length&&!o.note)throw new Error('observation-content-required');
    return normalized;
  }
  function validateResult(result){
    if(!result||typeof result!=='object'||REQUIRED_RESULT_FIELDS.some(key=>!(key in result)))throw new Error('invalid-observation-publish-result');
    return result;
  }
  window.HotBObservationPublishContract=Object.freeze({normalizeRequest,validateRequest,validateResult,MAX_TAGS,MAX_DRILLS});
})();
