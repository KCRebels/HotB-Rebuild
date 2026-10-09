/* Player portal Focus delete: delete the exact selected archived record and preserve the current Focus unless it is that same record. */
(()=>{
 const key=item=>String(item?.publishedAt||item?.archivedAt||'');
 const same=(a,b)=>a===b||(
  key(a)&&key(a)===key(b)&&
  String(a?.archivedAt||'')===String(b?.archivedAt||'')&&
  String(a?.coachNote||'')===String(b?.coachNote||'')&&
  String(a?.needsWork||a?.title||'')===String(b?.needsWork||b?.title||'')
 );
 const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 async function firebaseReady(){
  for(let i=0;i<40;i++){
   const fb=window.firebase,store=fb?.firestore?.();
   if(store)return {fb,store};
   await wait(250);
  }
  return null;
 }
 document.addEventListener('click',async event=>{
  const button=event.target?.closest?.('#deleteMegArchivedFocus');if(!button)return;
  event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
  if(button.dataset.hotbDeleting==='1')return;
  const token=new URLSearchParams(location.search).get('portal');
  if(!token){alert('HotB could not verify this player portal. Nothing was deleted.');return}
  const ctx=await firebaseReady();if(!ctx){alert('HotB is reconnecting. Nothing was deleted. Please try again.');return}
  const {fb,store}=ctx,ref=store.collection('playerPortals').doc(token);
  let snap;
  try{snap=await ref.get()}catch(_){alert('HotB could not verify the saved Focus. Nothing was deleted.');return}
  if(!snap.exists){alert('HotB could not verify the saved Focus. Nothing was deleted.');return}
  const data=snap.data()||{},archive=Array.isArray(data.focusArchive)?data.focusArchive.slice():[];
  /* The portal's selected detail is represented by the date button that was opened. Read the displayed detail and match it against fresh cloud records; never delete by a stale array index. */
  const detail=document.querySelector('.portal-focus-archive-list .portal-focus-archive-card'),dateText=detail?.querySelector('time')?.textContent?.trim()||'',noteText=[...detail?.querySelectorAll('div')||[]].find(el=>el.querySelector?.('span')?.textContent?.trim()==='COACH NOTE')?.querySelector('p')?.textContent?.trim()||'';
  const dateLabel=item=>{const d=new Date(item?.publishedAt||item?.archivedAt||0);return Number.isNaN(d.getTime())?'Saved Focus':d.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})};
  let matches=archive.filter(item=>dateLabel(item)===dateText);
  if(noteText)matches=matches.filter(item=>String(item?.coachNote||'').trim()===noteText);
  if(matches.length!==1){alert('HotB could not uniquely verify the exact Focus you selected. Nothing was deleted.');return}
  const target=matches[0];
  if(!confirm('Delete this Focus permanently?'))return;
  button.dataset.hotbDeleting='1';button.disabled=true;button.textContent='Deleting…';
  try{
   const fresh=await ref.get(),remote=fresh.data()||{},freshArchive=Array.isArray(remote.focusArchive)?remote.focusArchive.slice():[];
   const exact=freshArchive.find(item=>same(item,target));
   if(!exact)throw new Error('selected Focus changed before delete');
   const next=freshArchive.filter(item=>!same(item,exact));
   const update={focusArchive:next,updatedAt:fb.firestore.FieldValue.serverTimestamp()};
   if(remote.focus&&same(remote.focus,exact))update.focus=next.slice().sort((a,b)=>Date.parse(b?.publishedAt||b?.archivedAt||0)-Date.parse(a?.publishedAt||a?.archivedAt||0))[0]||null;
   await ref.update(update);
   const verify=await ref.get(),saved=verify.data()||{},remaining=Array.isArray(saved.focusArchive)?saved.focusArchive:[];
   if(remaining.some(item=>same(item,exact)))throw new Error('delete did not persist');
   location.reload();
  }catch(error){console.error('HotB exact portal Focus delete failed',error);button.dataset.hotbDeleting='';button.disabled=false;button.textContent='Delete';alert('HotB could not delete that exact Focus. Nothing else was changed.');}
 },true);
})();
