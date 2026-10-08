/* Player Focus practice follow-through: compact approved card beneath Suggested Drills. */
(()=>{
 const KEY='hotbRebuildDbV1';
 const db=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(_){return{}}};
 const norm=s=>String(s||'').trim().toLowerCase();
 const player=()=>document.querySelector('.practice-feature-lead h2')?.textContent?.trim()||'';
 const currentDrills=main=>[...main.querySelectorAll('.focus-drill-row')].map(row=>row.querySelector('b')?.textContent?.trim()).filter(Boolean);
 const when=p=>Date.parse(p?.completedAt||p?.endedAt||p?.date||p?.practiceDate||p?.startedAt||p?.createdAt||0)||0;
 function plans(d){const pools=[d.practiceHistory,d.completedPractices,d.practiceArchive,d.practiceSessions,d.practicePlans].filter(Array.isArray);return pools.flat().filter(p=>p&&(p.completed||p.status==='complete'||p.status==='completed'||p.endedAt||p.completedAt));}
 function matches(p,name,drills){const sched=p?.schedule?.[name]||p?.assignments?.[name]||p?.players?.[name]||[];const text=Array.isArray(sched)?sched.map(x=>typeof x==='string'?x:(x?.drill||x?.drillName||x?.activity||'')).join('|'):JSON.stringify(sched||'');return drills.filter(drill=>norm(text).includes(norm(drill)));}
 function render(){
  const main=document.querySelector('.practice-feature-page'),name=player();
  if(!main||!name||name==='Choose A Player'||main.querySelector('[data-focus-followthrough]'))return;
  const suggested=[...main.querySelectorAll('.focus-evidence-section')].find(s=>s.querySelector('h3')?.textContent.trim()==='Suggested Drills');if(!suggested)return;
  const drills=currentDrills(main);if(!drills.length)return;
  const rows=plans(db()).map(p=>({p,hits:matches(p,name,drills),time:when(p)})).filter(x=>x.hits.length&&x.time).sort((a,b)=>b.time-a.time).slice(0,3);
  const section=document.createElement('section');section.dataset.focusFollowthrough='1';
  section.style.cssText='margin-top:14px;background:#fff;border:2px solid #c71920;border-radius:14px;padding:14px 16px 12px;box-sizing:border-box';
  const records=rows.length?rows.map(({hits,time})=>`<div style="display:grid;grid-template-columns:145px minmax(0,1fr);gap:14px;padding:10px 0;border-top:1px solid #d9dede;align-items:start"><div><b style="display:block;color:#111827;font-size:15px;line-height:1.15">${new Date(time).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})}</b><span style="display:block;margin-top:3px;color:#667085;font-size:12px;font-weight:650">Hitting Practice</span></div><div>${hits.map(d=>`<div style="display:flex;align-items:center;gap:8px;margin:0 0 7px;color:#111827;font-size:14px;font-weight:700;line-height:1.2"><span aria-hidden="true" style="display:inline-grid;place-items:center;flex:0 0 20px;width:20px;height:20px;border-radius:50%;background:#2e9b45;color:#fff;font-size:13px;font-weight:900">✓</span><span>${d} — 1 session</span></div>`).join('')}</div></div>`).join(''):`<div style="border-top:1px solid #d9dede;padding:11px 0 2px;color:#667085;font-size:14px;font-weight:700;line-height:1.3">No completed Focus-drill practice sessions recorded yet.</div>`;
  section.innerHTML=`<div style="display:flex;align-items:center;justify-content:space-between;gap:12px"><h3 style="margin:0;color:#111827;font-size:21px;line-height:1.1">Practice Follow-Through</h3><button type="button" data-focus-followthrough-all style="background:#fff;color:#111;border:2px solid #111;border-radius:9px;padding:6px 12px;font-size:13px;font-weight:800;white-space:nowrap">View All</button></div><p style="margin:6px 0 10px;color:#667085;font-size:13px;line-height:1.3;font-weight:650">See when ${name.split(' ')[0]} worked on her current Focus drills.</p>${records}`;
  suggested.after(section);
 }
 let queued=false;const q=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;render()})};addEventListener('load',q);document.addEventListener('click',()=>setTimeout(q,0));new MutationObserver(q).observe(document.documentElement,{childList:true,subtree:true});
})();