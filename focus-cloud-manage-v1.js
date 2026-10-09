/* Adds cloud-only published Focus entries to the coach Manage window. Deletion is always an explicit coach tap. */
(()=>{
 const DBKEY='hotbRebuildDbV1';
 const readDb=()=>{try{return JSON.parse(localStorage.getItem(DBKEY)||'{}')||{}}catch(_){return{}}};
 const nameNow=()=>document.querySelector('.practice-feature-lead h2')?.textContent?.trim()||'';
 const stamp=x=>Date.parse(x?.publishedAt||x?.archivedAt||x?.observedAt||0)||0;
 const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#039;'}[m]));
 async function loadCloud(){
  const modal=document.getElementById('hotbFocusManageRepair'),name=nameNow();
  if(!modal||!name||!window.firebase?.firestore)return;
  const db=readDb(),player=(db.roster||[]).find(x=>x?.name===name),portalId=player?.portalId;
  if(!portalId)return;
  try{
   const ref=window.firebase.firestore().collection('playerPortals').doc(portalId),snap=await ref.get();
   if(!snap.exists)return;
   const data=snap.data()||{},items=Array.isArray(data.focusArchive)?data.focusArchive.slice():[];
   if(data.focus&&(data.focus.publishedAt||data.focus.archivedAt)&&!items.some(x=>String(x?.publishedAt||x?.archivedAt||'')===String(data.focus.publishedAt||data.focus.archivedAt)))items.push(data.focus);
   const section=modal.querySelector('section');if(!section)return;
   const existing=new Set([...section.querySelectorAll('[data-hotb-published]')].map(b=>String(b.dataset.hotbPublished||'')));
   items.sort((a,b)=>stamp(b)-stamp(a)).forEach(item=>{
    const published=String(item?.publishedAt||item?.archivedAt||'');if(!published||existing.has(published))return;
    const article=document.createElement('article');article.style.cssText='border:1px solid #d9dede;border-radius:14px;padding:14px;margin:10px 0';
    const date=stamp(item)?new Date(stamp(item)).toLocaleString(undefined,{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'}):'No date';
    const tags=(Array.isArray(item?.observationOptions)?item.observationOptions:[]).filter(Boolean).map(t=>`<span style="display:inline-block;border:1px solid #d9dede;border-radius:999px;padding:4px 8px;margin:3px 4px 0 0;font-size:12px">${esc(t)}</span>`).join('');
    const note=String(item?.coachNote||'').trim();
    article.innerHTML=`<div style="font-size:12px;color:#667085;margin-bottom:6px">${esc(date)}</div>${tags}${note?`<p style="margin:9px 0 0">${esc(note)}</p>`:''}<div style="margin-top:12px;text-align:right"><button type="button" class="btn" data-cloud-focus-delete="${esc(published)}">Delete</button></div>`;
    section.appendChild(article);existing.add(published);
   });
   modal.querySelectorAll('[data-cloud-focus-delete]').forEach(button=>button.onclick=async()=>{
    if(button.disabled)return;button.disabled=true;button.textContent='Deleting…';
    const published=button.dataset.cloudFocusDelete;
    try{
     const fresh=await ref.get(),remote=fresh.data()||{},archive=(Array.isArray(remote.focusArchive)?remote.focusArchive:[]).filter(x=>String(x?.publishedAt||x?.archivedAt||'')!==published),update={focusArchive:archive,updatedAt:window.firebase.firestore.FieldValue.serverTimestamp()};
     if(String(remote.focus?.publishedAt||remote.focus?.archivedAt||'')===published)update.focus=archive.slice().sort((a,b)=>stamp(b)-stamp(a))[0]||null;
     await ref.set(update,{merge:true});button.closest('article')?.remove();
    }catch(error){console.error('HotB cloud Focus delete failed',error);button.disabled=false;button.textContent='Delete';alert('HotB could not remove that player-portal observation. Please retry while online.')}
   });
  }catch(error){console.error('HotB cloud Focus history load failed',error)}
 }
 const observer=new MutationObserver(()=>{if(document.getElementById('hotbFocusManageRepair'))setTimeout(loadCloud,0)});
 observer.observe(document.documentElement,{childList:true,subtree:true});
})();