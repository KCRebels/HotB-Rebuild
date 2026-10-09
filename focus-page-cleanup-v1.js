/* Coach Player Focus repair: keep status styling, expose complete Manage history, delete exact records only. */
(()=>{
 const KEY='hotbRebuildDbV1';
 const state=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(_){return{}}};
 const save=db=>{try{localStorage.setItem(KEY,JSON.stringify(db))}catch(_){}};
 const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
 const playerName=()=>document.querySelector('.practice-feature-lead h2')?.textContent?.trim()||'';
 const archiveFor=(db,name)=>name==='Megan Ryan'?(Array.isArray(db.megFocusArchive)?db.megFocusArchive:[]):(Array.isArray(db.playerFocusArchives?.[name])?db.playerFocusArchives[name]:[]);
 const stamp=x=>Date.parse(x?.observedAt||x?.gameDate||x?.publishedAt||x?.archivedAt||x?.createdAt||x?.updatedAt||0)||Number(x?.createdAt||x?.updatedAt||0)||0;
 const norm=s=>String(s||'').trim().replace(/\s+/g,' ').toLowerCase();
 const publishedId=(name,row)=>`published-focus:${name}:${String(row?.publishedAt||row?.archivedAt||stamp(row))}`;
 function allRows(db,name){
  const rows=[];
  (db.coachObservations||[]).filter(x=>x?.playerName===name).forEach(x=>rows.push({...x,_kind:'standalone'}));
  (db.savedGames||[]).forEach(game=>(game?.observations||[]).filter(x=>x?.playerName===name).forEach(x=>rows.push({...x,gameId:game.id,gameDate:game.date,_kind:'game'})));
  archiveFor(db,name).forEach(x=>rows.push({id:publishedId(name,x),playerName:name,tags:Array.isArray(x?.observationOptions)?x.observationOptions:[],note:String(x?.coachNote||''),observedAt:x?.publishedAt||x?.archivedAt,focusPublishedAt:x?.publishedAt||x?.archivedAt,publishedFocus:true,_kind:'published'}));
  const seen=new Set();return rows.filter(x=>{const key=x.id||[x._kind,stamp(x),norm(x.note),(x.tags||[]).map(norm).join('|')].join('::');if(seen.has(key))return false;seen.add(key);return true}).sort((a,b)=>stamp(b)-stamp(a));
 }
 function paintNotOpenedRed(){document.querySelectorAll('.practice-focus-roster *').forEach(el=>{const text=el.textContent.trim().replace(/\s+/g,' ').toUpperCase();if((text==='NOT OPENED'||text==='NOT OPENED YET')&&el.children.length===0)el.style.setProperty('color','#c71920','important')})}
 function isManageButton(button){if(!button)return false;const text=button.textContent.trim().toUpperCase();return text==='MANAGE'&&!!button.closest('.practice-feature-page')}
 function closeManage(){document.getElementById('hotbFocusManageRepair')?.remove()}
 function renderManage(name){
  closeManage();const db=state(),rows=allRows(db,name),shell=document.createElement('div');shell.id='hotbFocusManageRepair';shell.className='modal-backdrop';
  const cards=rows.map(row=>{const d=stamp(row)?new Date(stamp(row)).toLocaleString(undefined,{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'}):'No date',tags=(row.tags||[]).filter(Boolean).map(t=>`<span style="display:inline-block;border:1px solid #d9dede;border-radius:999px;padding:4px 8px;margin:3px 4px 0 0;font-size:12px">${esc(t)}</span>`).join(''),note=String(row.note||'').trim();return `<article style="border:1px solid #d9dede;border-radius:14px;padding:14px;margin:10px 0"><div style="font-size:12px;color:#667085;margin-bottom:6px">${esc(d)}</div>${tags}${note?`<p style="margin:9px 0 0">${esc(note)}</p>`:''}<div style="margin-top:12px;text-align:right"><button type="button" class="btn" data-hotb-exact-delete="${esc(row.id||'')}" data-hotb-kind="${esc(row._kind)}" data-hotb-game="${esc(row.gameId||'')}" data-hotb-published="${esc(row.focusPublishedAt||'')}">Delete</button></div></article>`}).join('');
  shell.innerHTML=`<div class="modal"><div class="modal-header"><div><div class="small info-kicker">PLAYER FOCUS</div><h2>Manage ${esc(name)} Observations</h2></div><button type="button" class="btn" data-hotb-close-manage>Close</button></div><section style="max-height:65vh;overflow:auto">${cards||'<p>There are no saved observations for this player.</p>'}</section></div>`;
  document.body.appendChild(shell);
 }
 async function deleteExact(name,id,kind,gameId,publishedAt){
  const db=state();let changed=false;
  if(kind==='game'){const game=(db.savedGames||[]).find(x=>String(x?.id||'')===String(gameId));if(game&&Array.isArray(game.observations)){const n=game.observations.length;game.observations=game.observations.filter(x=>String(x?.id||'')!==String(id));changed=game.observations.length!==n}}
  else if(kind==='published'){
   const filter=x=>String(x?.publishedAt||x?.archivedAt||'')!==String(publishedAt);
   if(name==='Megan Ryan'){const old=archiveFor(db,name);db.megFocusArchive=old.filter(filter);changed=db.megFocusArchive.length!==old.length}else{db.playerFocusArchives=db.playerFocusArchives||{};const old=archiveFor(db,name);db.playerFocusArchives[name]=old.filter(filter);changed=db.playerFocusArchives[name].length!==old.length}
   const before=(db.coachObservations||[]).length;db.coachObservations=(db.coachObservations||[]).filter(x=>!(x?.playerName===name&&(String(x?.id||'')===String(id)||String(x?.focusPublishedAt||'')===String(publishedAt))));changed=changed||db.coachObservations.length!==before;
  }else{const before=(db.coachObservations||[]).length;db.coachObservations=(db.coachObservations||[]).filter(x=>String(x?.id||'')!==String(id));changed=db.coachObservations.length!==before}
  if(changed)save(db);
  if(kind==='published'){
   const player=(db.roster||[]).find(x=>x?.name===name),portalId=player?.portalId;
   if(portalId&&window.firebase?.firestore){try{const ref=window.firebase.firestore().collection('playerPortals').doc(portalId),snap=await ref.get();if(snap.exists){const data=snap.data()||{},remoteArchive=(Array.isArray(data.focusArchive)?data.focusArchive:[]).filter(x=>String(x?.publishedAt||x?.archivedAt||'')!==String(publishedAt)),update={focusArchive:remoteArchive,updatedAt:window.firebase.firestore.FieldValue.serverTimestamp()};if(String(data.focus?.publishedAt||'')===String(publishedAt))update.focus=remoteArchive.slice().sort((a,b)=>stamp(b)-stamp(a))[0]||null;await ref.set(update,{merge:true})}}catch(e){console.error('HotB exact published observation delete failed',e)}}
  }
  renderManage(name);
 }
 function apply(){paintNotOpenedRed()}
 document.addEventListener('click',event=>{
  const close=event.target?.closest?.('[data-hotb-close-manage]');if(close){event.preventDefault();event.stopImmediatePropagation();closeManage();return}
  const del=event.target?.closest?.('[data-hotb-exact-delete]');if(del){event.preventDefault();event.stopImmediatePropagation();const name=playerName();if(name)deleteExact(name,del.dataset.hotbExactDelete,del.dataset.hotbKind,del.dataset.hotbGame,del.dataset.hotbPublished);return}
  const button=event.target?.closest?.('button');if(isManageButton(button)){const name=playerName();if(name&&name!=='Choose A Player'){event.preventDefault();event.stopImmediatePropagation();renderManage(name);return}}
 },true);
 let queued=false;const queue=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply()})};addEventListener('load',queue);new MutationObserver(queue).observe(document.documentElement,{childList:true,subtree:true});
})();
