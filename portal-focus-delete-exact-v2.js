/* Player portal Focus delete: bind the selected archived record to its exact cloud key before deleting. */
(()=>{
 const key=item=>String(item?.publishedAt||item?.archivedAt||'');
 const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 async function ready(){for(let i=0;i<40;i++){const fb=window.firebase,store=fb?.firestore?.();if(store)return{fb,store};await wait(250)}return null}
 async function cloudArchive(){const token=new URLSearchParams(location.search).get('portal'),ctx=await ready();if(!token||!ctx)return null;const ref=ctx.store.collection('playerPortals').doc(token),snap=await ref.get();if(!snap.exists)return null;return{...ctx,ref,data:snap.data()||{}}}
 /* When a dated archive button is tapped, remember the exact publishedAt/archivedAt key from the fresh cloud archive at that sorted position. This removes the date-only ambiguity that broke 596. */
 document.addEventListener('click',async event=>{
  const open=event.target?.closest?.('[data-open-meg-focus-archive]');if(!open)return;
  const index=Number(open.dataset.openMegFocusArchive);if(!Number.isInteger(index))return;
  try{const c=await cloudArchive();if(!c)return;const sorted=(Array.isArray(c.data.focusArchive)?c.data.focusArchive:[]).slice().sort((a,b)=>key(b).localeCompare(key(a))),item=sorted[index],k=key(item);if(k)sessionStorage.setItem('hotbPortalSelectedFocusKey',k)}catch(_){}
 },true);
 document.addEventListener('click',async event=>{
  const button=event.target?.closest?.('#deleteMegArchivedFocus');if(!button)return;
  event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();if(button.dataset.hotbDeleting==='1')return;
  let c;try{c=await cloudArchive()}catch(_){c=null}if(!c){alert('HotB could not verify the saved Focus. Nothing was deleted.');return}
  const selectedKey=sessionStorage.getItem('hotbPortalSelectedFocusKey')||'';if(!selectedKey){alert('HotB could not verify the exact Focus you selected. Nothing was deleted.');return}
  const archive=Array.isArray(c.data.focusArchive)?c.data.focusArchive.slice():[],matches=archive.filter(item=>key(item)===selectedKey);if(matches.length!==1){alert('HotB could not verify the exact Focus you selected. Nothing was deleted.');return}
  if(!confirm('Delete this Focus permanently?'))return;
  button.dataset.hotbDeleting='1';button.disabled=true;button.textContent='Deleting…';
  try{const fresh=await c.ref.get(),remote=fresh.data()||{},freshArchive=Array.isArray(remote.focusArchive)?remote.focusArchive.slice():[],freshMatches=freshArchive.filter(item=>key(item)===selectedKey);if(freshMatches.length!==1)throw new Error('selected key changed');const next=freshArchive.filter(item=>key(item)!==selectedKey),update={focusArchive:next,updatedAt:c.fb.firestore.FieldValue.serverTimestamp()};if(key(remote.focus)===selectedKey)update.focus=next.slice().sort((a,b)=>key(b).localeCompare(key(a)))[0]||null;await c.ref.update(update);const verify=await c.ref.get(),saved=verify.data()||{};if((Array.isArray(saved.focusArchive)?saved.focusArchive:[]).some(item=>key(item)===selectedKey))throw new Error('delete did not persist');sessionStorage.removeItem('hotbPortalSelectedFocusKey');location.reload()}catch(error){console.error('HotB exact portal Focus delete failed',error);button.dataset.hotbDeleting='';button.disabled=false;button.textContent='Delete';alert('HotB could not delete that exact Focus. Nothing else was changed.')}
 },true);
})();