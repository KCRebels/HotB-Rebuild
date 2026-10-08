/* HotB Observation -> Player Focus direct-publish staging module.
 * Staging only. Production 547 does not load this file.
 */
(() => {
  'use strict';

  const MAX_TAGS = 3;
  const MAX_DRILLS = 3;
  const state = { draft:null, selectedDrills:[], suggestedDrills:[], publishing:false, error:'' };

  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];
  const esc = value => String(value ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const unique = (values, limit) => [...new Set((Array.isArray(values)?values:[]).map(v=>String(v||'').trim()).filter(Boolean))].slice(0,limit);

  function normalizeDraft(input={}) {
    return {
      mode: input.mode === 'focus' ? 'focus' : 'game',
      playerName: String(input.playerName||'').trim(),
      paId: String(input.paId||'').trim(),
      tags: unique(input.tags,MAX_TAGS),
      note: String(input.note||''),
      inning: Number(input.inning)||0,
      fromInningPrompt: input.fromInningPrompt===true
    };
  }

  function snapshot(){
    return {
      draft:state.draft?{...state.draft,tags:state.draft.tags.slice()}:null,
      selectedDrills:state.selectedDrills.slice(),
      suggestedDrills:state.suggestedDrills.slice(),
      publishing:state.publishing,
      error:state.error
    };
  }

  function begin(input,suggestedDrills=[]){
    state.draft=normalizeDraft(input);
    state.suggestedDrills=unique(suggestedDrills,12);
    state.selectedDrills=unique(suggestedDrills,MAX_DRILLS);
    state.publishing=false;state.error='';
    return snapshot();
  }

  function setDraft(input){state.draft=normalizeDraft(input);state.error='';return snapshot()}
  function setDrills(names){state.selectedDrills=unique(names,MAX_DRILLS);state.error='';return snapshot()}
  function setSuggestions(names){state.suggestedDrills=unique(names,12);return snapshot()}
  function toggleDrill(name){
    const drill=String(name||'').trim();if(!drill)return snapshot();
    const next=state.selectedDrills.slice(),i=next.indexOf(drill);
    if(i>=0)next.splice(i,1);else if(next.length<MAX_DRILLS)next.push(drill);
    state.selectedDrills=unique(next,MAX_DRILLS);state.error='';return snapshot();
  }

  function validate(){
    if(!state.draft?.playerName)throw new Error('Choose a player before publishing.');
    if(!state.draft.tags.length&&!String(state.draft.note||'').trim())throw new Error('Add an observation or note before publishing.');
    return true;
  }

  function bridge(){
    const api=window.HotBObservationPublishBridge;
    if(!api||typeof api.publish!=='function')throw new Error('Observation publishing is not connected to this HotB build.');
    return api;
  }

  async function publish(){
    validate();if(state.publishing)return false;
    const api=bridge();state.publishing=true;state.error='';renderMounted();
    try{
      // Production bridge must preflight cloud auth + the EXISTING permanent portal
      // before it persists the new observation. This is the no-halfway guarantee.
      if(typeof api.preflight==='function'){
        const ready=await api.preflight({playerName:state.draft.playerName});
        if(!ready||ready.ok!==true)throw new Error(ready?.message||'Player portal is not ready for publishing.');
      }
      const result=await api.publish({observation:{...state.draft,tags:state.draft.tags.slice()},drills:state.selectedDrills.slice()});
      if(!result||result.ok!==true)throw new Error(result?.message||'Player Focus was not published.');
      state.draft=null;state.selectedDrills=[];state.suggestedDrills=[];
      return result;
    }catch(error){state.error=String(error?.message||error||'Player Focus was not published.');throw error}
    finally{state.publishing=false;renderMounted()}
  }

  function drillMarkup(){
    const choices=unique([...state.selectedDrills,...state.suggestedDrills],12);
    if(!choices.length)return '<div class="small muted">No drill suggestions yet. You can publish the observation without a drill.</div>';
    return `<div class="observation-publish-drills">${choices.map(name=>{
      const active=state.selectedDrills.includes(name);
      return `<button type="button" class="btn observation-publish-drill${active?' active':''}" data-observation-publish-drill="${esc(name)}" aria-pressed="${active?'true':'false'}">${esc(name)}</button>`;
    }).join('')}</div><div class="small observation-publish-count">${state.selectedDrills.length} of ${MAX_DRILLS} drills selected</div>`;
  }

  function panelMarkup(){
    return `<section class="observation-publish-panel" data-observation-publish-panel>
      <div class="observation-publish-heading"><b>Suggested Drills</b><span class="small">Pick up to ${MAX_DRILLS}</span></div>
      ${drillMarkup()}
      ${state.error?`<div class="observation-publish-error" role="alert">${esc(state.error)}</div>`:''}
      <button type="button" class="btn red block observation-publish-action" data-observation-publish-action ${state.publishing?'disabled':''}>${state.publishing?'Publishing…':'Publish'}</button>
    </section>`;
  }

  function syncDraftFromModal(root){
    if(!state.draft)return;
    const tags=$$('.observation-option.active',root).map(button=>button.dataset.observationOption).filter(Boolean).slice(0,MAX_TAGS);
    const note=$('#observationNote',root)?.value??state.draft.note;
    state.draft={...state.draft,tags,note};
  }

  function bindPanel(panel){
    $$('[data-observation-publish-drill]',panel).forEach(button=>button.onclick=()=>{syncDraftFromModal(panel.closest('.modal')||document);toggleDrill(button.dataset.observationPublishDrill);renderMounted()});
    $('[data-observation-publish-action]',panel)?.addEventListener('click',async()=>{
      syncDraftFromModal(panel.closest('.modal')||document);
      try{await publish()}catch(error){/* message remains in panel */}
    });
  }

  function mount(root=document){
    const modal=$('.modal',root)||root;
    if(!state.draft||!modal)return false;
    // The production integration removes/hides the old Save button. If it remains
    // during staging, hide it so there is never a second competing action.
    const oldSave=$('#saveCoachObservation',modal);if(oldSave)oldSave.hidden=true;
    let panel=$('[data-observation-publish-panel]',modal);
    if(!panel){
      const holder=document.createElement('div');holder.innerHTML=panelMarkup();panel=holder.firstElementChild;
      (oldSave?.parentElement||modal).appendChild(panel);
    }else panel.outerHTML=panelMarkup();
    panel=$('[data-observation-publish-panel]',modal);if(panel)bindPanel(panel);
    return !!panel;
  }

  function renderMounted(){
    const current=$('[data-observation-publish-panel]');
    if(!current)return;
    const modal=current.closest('.modal')||document;syncDraftFromModal(modal);
    current.outerHTML=panelMarkup();const next=$('[data-observation-publish-panel]',modal);if(next)bindPanel(next);
  }

  function reset(){state.draft=null;state.selectedDrills=[];state.suggestedDrills=[];state.publishing=false;state.error=''}

  window.HotBObservationPublish=Object.freeze({begin,setDraft,setDrills,setSuggestions,toggleDrill,snapshot,validate,publish,mount,reset});
})();
