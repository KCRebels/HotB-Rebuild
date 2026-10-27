(()=>{'use strict';
 const DBKEY='hotbRebuildDbV1';
 const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#039;'}[m]));
 const first=n=>String(n||'').trim().split(/\s+/)[0]||'';
 const readDb=()=>{try{return JSON.parse(localStorage.getItem(DBKEY)||'{}')}catch(_){return{}}};
 const focusFor=(db,name)=>{const a=name==='Megan Ryan'?db.megFocusArchive:db.playerFocusArchives?.[name];if(!Array.isArray(a)||!a.length)return null;const published=String(db.playerFocusLastReviewed?.[name]||'');if(published){const exact=a.find(x=>String(x?.publishedAt||'')===published);if(exact)return exact}return a.slice().sort((x,y)=>(Date.parse(y?.publishedAt||0)||0)-(Date.parse(x?.publishedAt||0)||0))[0]||null};
 const focusDrills=f=>(Array.isArray(f?.drills)?f.drills:[]).map(x=>typeof x==='string'?x:x?.name||'').filter(Boolean);
 const currentPortalName=()=>{
  const qs=new URLSearchParams(location.search),portal=qs.get('portal')||'';
  const db=readDb();
  const candidates=[...(db.roster||[]),...(db.teamJenkinsRoster||[])];
  const direct=candidates.find(p=>String(p.portalId||p.id||'')===portal);
  if(direct?.name)return direct.name;
  const heading=document.querySelector('.practice-player-card header h2,.portal-player-name,.portal-welcome h2');
  const shown=heading?.textContent?.trim()||'';
  const exact=candidates.find(p=>shown.includes(first(p.name)));
  return exact?.name||shown;
 };
 const badge='<b class="player-practice-focus-badge" style="display:inline-block;margin-left:6px;padding:2px 6px;border:1.5px solid #c71920;border-radius:999px;color:#c71920;background:#fff;font-size:9px;font-weight:950;line-height:1;vertical-align:middle">FOCUS</b>';
 function apply(){
  const db=readDb(),name=currentPortalName();if(!name)return;
  const set=new Set(focusDrills(focusFor(db,name)));if(!set.size)return;
  document.querySelectorAll('.practice-player-card ol li strong,.portal-practice-card ol li strong,.practice-player-view ol li strong').forEach(strong=>{
   const clean=strong.textContent.replace(/FOCUS/g,'').trim(),m=clean.match(/^Drill Station \d+\s*[—-]\s*(.+)$/i);if(!m)return;
   const drill=m[1].trim(),wanted=set.has(drill),sig=clean+'|'+wanted;if(strong.dataset.playerFocusBadgeSignature===sig)return;
   strong.dataset.playerFocusBadgeSignature=sig;strong.innerHTML=esc(clean)+(wanted?' '+badge:'');
  });
 }
 let queued=false;const schedule=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply()})};
 new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
 window.HotBPlayerPracticeFocusBadge={refresh:apply};
})();