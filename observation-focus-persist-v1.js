/* Preserve published Observation options + drills on coach Player Focus and player portal. */
(()=>{'use strict';
 if(window.__HOTB_OBS_FOCUS_PERSIST_V1__)return;window.__HOTB_OBS_FOCUS_PERSIST_V1__=true;
 const KEY='hotbRebuildDbV1';
 const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
 const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(_){return{}}};
 const write=db=>{try{localStorage.setItem(KEY,JSON.stringify(db))}catch(_){}};
 const uniq=(arr,n=3)=>[...new Set((Array.isArray(arr)?arr:[]).map(x=>String(x||'').trim()).filter(Boolean))].slice(0,n);
 const archiveFor=(db,name)=>name==='Megan Ryan'?(db.megFocusArchive||(db.megFocusArchive=[])):((db.playerFocusArchives||(db.playerFocusArchives={}))[name]||((db.playerFocusArchives[name]=[])));
 const splitNeeds=v=>String(v||'').split(' · ').map(x=>x.trim()).filter(Boolean);
 function patchLocalPublished(playerName,publishedAt,tags,drills){
  const db=read(),archive=archiveFor(db,playerName),idx=archive.findIndex(x=>String(x?.publishedAt||'')===String(publishedAt||''));
  if(idx<0)return null;
  const current=archive[idx]||{},options=uniq(tags),selected=uniq(drills),needs=uniq([...options,...splitNeeds(current.needsWork)],3);
  archive[idx]={...current,observationOptions:options,needsWork:needs.join(' · '),drills:selected.length?selected:(Array.isArray(current.drills)?current.drills:[])};
  write(db);return archive[idx];
 }
 async function patchRemote(playerName,publishedAt,tags,drills){
  const db=read(),player=(db.roster||[]).find(x=>x?.name===playerName),id=player?.portalId;if(!id||!window.firebase?.firestore)return;
  const ref=window.firebase.firestore().collection('playerPortals').doc(id),snap=await ref.get();if(!snap.exists)return;
  const data=snap.data()||{},focus=data.focus;if(!focus||String(focus.publishedAt||'')!==String(publishedAt||''))return;
  const options=uniq(tags),selected=uniq(drills),needs=uniq([...options,...splitNeeds(focus.needsWork)],3);
  await ref.set({focus:{...focus,observationOptions:options,needsWork:needs.join(' · '),drills:selected.length?selected:(Array.isArray(focus.drills)?focus.drills:[])}},{merge:true});
 }
 function wrapBridge(){
  const bridge=window.HotBObservationPublishBridge;if(!bridge||typeof bridge.publish!=='function'||bridge.publish.__hotbPersistWrapped)return false;
  const original=bridge.publish.bind(bridge);
  const wrapped=async input=>{const observation=input?.observation||{},tags=uniq(observation.tags),drills=uniq(input?.drills),result=await original(input);if(result?.ok){patchLocalPublished(result.playerName||observation.playerName,result.publishedAt,tags,drills);try{await patchRemote(result.playerName||observation.playerName,result.publishedAt,tags,drills)}catch(_){}setTimeout(paint,0)}return result};
  wrapped.__hotbPersistWrapped=true;bridge.publish=wrapped;return true;
 }
 function currentPublished(db,name){const archive=archiveFor(db,name),published=String(db.playerFocusLastReviewed?.[name]||'');return (published&&archive.find(x=>String(x?.publishedAt||'')===published))||archive.slice().sort((a,b)=>(Date.parse(b?.publishedAt||0)||0)-(Date.parse(a?.publishedAt||0)||0))[0]||null}
 function paint(){
  const main=document.querySelector('.practice-feature-page'),name=document.querySelector('.practice-feature-lead h2')?.textContent?.trim()||'';if(!main||!name||name==='Choose A Player')return;
  const focus=currentPublished(read(),name);if(!focus)return;
  const coach=[...main.querySelectorAll('.focus-evidence-section')].find(s=>s.querySelector('h3')?.textContent.trim()==='Coach Observations');
  if(coach&&Array.isArray(focus.observationOptions)&&focus.observationOptions.length&&!coach.querySelector('[data-published-observation-options]')){
   const box=document.createElement('div');box.dataset.publishedObservationOptions='1';box.style.cssText='margin-top:10px;padding-top:10px;border-top:1px solid #d9dede';box.innerHTML=`<div style="font-size:12px;font-weight:850;color:#667085;margin-bottom:7px;text-transform:uppercase;letter-spacing:.04em">Observation Options</div><div style="display:flex;flex-wrap:wrap;gap:7px">${focus.observationOptions.map(t=>`<span style="display:inline-block;border:1.5px solid #c71920;border-radius:999px;padding:5px 9px;color:#111827;background:#fff;font-size:12px;font-weight:800">${esc(t)}</span>`).join('')}</div>`;coach.appendChild(box)
  }
  const suggested=[...main.querySelectorAll('.focus-evidence-section')].find(s=>s.querySelector('h3')?.textContent.trim()==='Suggested Drills');
  const drills=uniq(focus.drills);if(suggested&&drills.length&&!suggested.querySelector('[data-published-focus-drills]')){
   suggested.querySelector('.focus-empty-copy')?.remove();const wrap=document.createElement('div');wrap.dataset.publishedFocusDrills='1';wrap.style.cssText='margin-top:8px';wrap.innerHTML=drills.map((d,i)=>`<div class="focus-drill-row" style="display:flex;align-items:center;gap:10px;padding:10px 0;${i?'border-top:1px solid #e5e7eb;':''}"><span style="display:inline-grid;place-items:center;flex:0 0 24px;width:24px;height:24px;border-radius:50%;background:#111827;color:#fff;font-size:12px;font-weight:900">${i+1}</span><b style="font-size:15px;color:#111827">${esc(d)}</b></div>`).join('');suggested.appendChild(wrap)
  }
 }
 let tries=0;const timer=setInterval(()=>{tries++;wrapBridge();paint();if(tries>120)clearInterval(timer)},250);addEventListener('load',()=>{wrapBridge();paint()});document.addEventListener('click',()=>setTimeout(paint,0));new MutationObserver(()=>requestAnimationFrame(paint)).observe(document.documentElement,{childList:true,subtree:true});
})();
