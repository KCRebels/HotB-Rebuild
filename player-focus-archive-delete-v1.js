/* Exact Player Focus archive deletion: remove the row the coach actually tapped, not another item sharing a date/key. */
(()=>{
 const DBKEY='hotbRebuildDbV1';
 const read=()=>{try{return JSON.parse(localStorage.getItem(DBKEY)||'{}')||{}}catch(_){return null}};
 const write=db=>localStorage.setItem(DBKEY,JSON.stringify(db));
 const stamp=item=>String(item?.publishedAt||'');
 function archiveTargets(db){
  const targets=[];
  if(Array.isArray(db.megFocusArchive))targets.push({name:'Megan Ryan',items:db.megFocusArchive,set:items=>{db.megFocusArchive=items}});
  const all=db.playerFocusArchives&&typeof db.playerFocusArchives==='object'&&!Array.isArray(db.playerFocusArchives)?db.playerFocusArchives:{};
  Object.keys(all).forEach(name=>{if(Array.isArray(all[name]))targets.push({name,items:all[name],set:items=>{all[name]=items}})});
  return targets;
 }
 document.addEventListener('click',event=>{
  const button=event.target?.closest?.('[data-delete-meg-focus]');if(!button)return;
  event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
  if(!confirm('Delete this Focus permanently?'))return;
  const db=read();if(!db){alert('HotB could not read the saved Focus archive. Nothing was deleted.');return}
  const buttons=[...document.querySelectorAll('[data-delete-meg-focus]')],displayIndex=buttons.indexOf(button),shownFirst=document.querySelector('.practice-feature-lead h2')?.textContent?.trim()||'';
  let target=archiveTargets(db).find(x=>x.name===shownFirst||x.name.split(' ')[0]===shownFirst);
  if(!target){const key=String(button.dataset.deleteMegFocus||'');const matches=archiveTargets(db).filter(x=>x.items.some(item=>String(item?.publishedAt||item?.archivedAt||'')===key));if(matches.length===1)target=matches[0]}
  if(!target||displayIndex<0){alert('HotB could not verify the exact Focus you selected. Nothing was deleted.');return}
  const indexed=target.items.map((item,index)=>({item,index})).sort((a,b)=>stamp(b.item).localeCompare(stamp(a.item)));
  const selected=indexed[displayIndex];if(!selected){alert('HotB could not verify the exact Focus you selected. Nothing was deleted.');return}
  const next=target.items.slice();next.splice(selected.index,1);target.set(next);write(db);
  /* Reload so the main HotB data object is rebuilt from the corrected archive before any later save can restore the deleted row. */
  location.reload();
 },true);
})();
