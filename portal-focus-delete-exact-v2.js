/* Player portal Focus delete: resolve the exact displayed record at Delete time. */
(()=>{
 const key=item=>String(item?.publishedAt||item?.archivedAt||'');
 const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 async function ready(){for(let i=0;i<40;i++){const fb=window.firebase,store=fb?.firestore?.();if(store)return{fb,store};await wait(250)}return null}
 async function cloud(){const token=new URLSearchParams(location.search).get('portal'),ctx=await ready();if(!token||!ctx)return null;const ref=ctx.store.collection('playerPortals').doc(token),snap=await ref.get();if(!snap.exists)return null;return{...ctx,ref,data:snap.data()||{}}}
 const label=item=>{const d=new Date(item?.publishedAt||item?.archivedAt||0);return Number.isNaN(d.getTime())?'Saved Focus':d.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})};
 const text=v=>String(v||'').replace(/\s+/g,' ').trim();
 function displayed(){const card=document.querySelector('.portal-focus-archive-list .portal-focus-archive-card')||document.querySelector('#deleteMegArchivedFocus')?.closest('article');if(!card)return null;const date=text(card.querySelector('time')?.textContent),paras=[...card.querySelectorAll('p')].map(p=>text(p.textContent)).filter(Boolean);return{date,paras}}
 function resolve(archive,view){if(!view?.date)return null;let matches=archive.filter(item=>label(item)===view.date);if(matches.length===1)return matches[0];if(matches.length>1&&view.paras.length){const scored=matches.map(item=>{const hay=text([item?.coachNote,item?.needsWork,item?.title,item?.buildOn,item?.buildOnThis,item?.focus].flat().join(' '));return{item,score:view.paras.reduce((n,p)=>n+(p&&hay.includes(p)?1:0),0)}}).sort((a,b)=>b.score-a.score);if(scored[0]?.score>0&&scored[0].score>Number(scored[1]?.score||0))return scored[0].item}return null}
 document.addEventListener('click',async event=>{
  const button=event.target?.closest?.('#deleteMegArchivedFocus');if(!button)return;
  event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();if(button.dataset.hotbDeleting==='1')return;
  const view=displayed();let c;try{c=await cloud()}catch(_){c=null}if(!c||!view){alert('HotB could not verify the saved Focus. Nothing was deleted.');return}
  const archive=Array.isArray(c.data.focusArchive)?c.data.focusArchive.slice():[],target=resolve(archive,view);if(!target||!key(target)){alert('HotB could not verify the exact Focus you selected. Nothing was deleted.');return}
  const targetKey=key(target);if(!confirm('Delete this Focus permanently?'))return;
  button.dataset.hotbDeleting='1';button.disabled=true;button.textContent='Deleting…';
  try{const fresh=await c.ref.get(),remote=fresh.data()||{},freshArchive=Array.isArray(remote.focusArchive)?remote.focusArchive.slice():[],freshTarget=freshArchive.find(item=>key(item)===targetKey);if(!freshTarget)throw new Error('selected Focus changed');const next=freshArchive.filter(item=>key(item)!==targetKey),update={focusArchive:next,updatedAt:c.fb.firestore.FieldValue.serverTimestamp()};if(key(remote.focus)===targetKey)update.focus=next.slice().sort((a,b)=>key(b).localeCompare(key(a)))[0]||null;await c.ref.update(update);const verify=await c.ref.get(),saved=verify.data()||{};if((Array.isArray(saved.focusArchive)?saved.focusArchive:[]).some(item=>key(item)===targetKey))throw new Error('delete did not persist');location.reload()}catch(error){console.error('HotB exact portal Focus delete failed',error);button.dataset.hotbDeleting='';button.disabled=false;button.textContent='Delete';alert('HotB could not delete that exact Focus. Nothing else was changed.')}
 },true);
})();