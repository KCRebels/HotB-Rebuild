(()=>{
'use strict';
const DBKEY='hotbRebuildDbV1';
const TEAM='Team Jenkins';
const players=[
 {name:'Neveah Schlappi',phone:'816-708-5835',positions:'UT'},
 {name:'Lilliana Schlappi',phone:'816-656-6698',positions:'C'},
 {name:'Taylor Woods',phone:'816-509-9701',positions:'P'},
 {name:'Perri Wagner',phone:'913-961-8168',positions:'P'},
 {name:'Pacie Dougherty',phone:'785-760-3228',positions:'C'},
 {name:'Amelia Steffen',phone:'913-413-5995',positions:'UT'},
 {name:'Emmie Wible',phone:'913-905-9251',positions:'UT'},
 {name:'Leslie Cundiff',phone:'785-917-2893',positions:'UT'}
];
const names=new Set(players.map(p=>p.name));
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
function read(){try{return JSON.parse(localStorage.getItem(DBKEY)||'null')}catch(e){return null}}
function write(db){localStorage.setItem(DBKEY,JSON.stringify(db))}
function seed(){
 const db=read();if(!db||!Array.isArray(db.roster))return;
 let changed=false;
 players.forEach(profile=>{
  let p=db.roster.find(x=>x.name===profile.name);
  if(!p){p={...profile,side:'R',isGuest:true,isTeamJenkins:true,teamName:TEAM};db.roster.push(p);changed=true}
  else{
   const next={...p,...profile,isTeamJenkins:true,teamName:TEAM,isPracticeGuest:false};
   if(JSON.stringify(next)!==JSON.stringify(p)){Object.assign(p,next);changed=true}
  }
 });
 db.teamJenkins=db.teamJenkins||{name:TEAM,coach:{name:'Mark Jenkins',phone:'913-484-5626',portalId:'',portalPin:'',portalPinHash:''}};
 if(!db.teamJenkins.coach)db.teamJenkins.coach={name:'Mark Jenkins',phone:'913-484-5626',portalId:'',portalPin:'',portalPinHash:''};
 if(db.teamJenkins.coach.phone!=='913-484-5626'){db.teamJenkins.coach.phone='913-484-5626';changed=true}
 if(changed)write(db);
}
seed();
function bytesId(){const b=crypto.getRandomValues(new Uint8Array(18));return btoa(String.fromCharCode(...b)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function pin(){return String(crypto.getRandomValues(new Uint32Array(1))[0]%1000000).padStart(6,'0')}
async function hash(token,value){const d=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(`${token}:${value}`));return [...new Uint8Array(d)].map(v=>v.toString(16).padStart(2,'0')).join('')}
function firestore(){try{return window.firebase?.firestore?.()}catch(e){return null}}
function signedIn(){const u=window.firebase?.auth?.().currentUser;return !!u&&!u.isAnonymous}
async function ensurePortals(){
 if(!signedIn()||!firestore())return false;
 const db=read();if(!db)return false;let changed=false;
 for(const profile of players){
  const p=db.roster.find(x=>x.name===profile.name);if(!p)continue;
  if(!p.portalId){p.portalId=bytesId();p.portalPin=pin();p.portalPinHash=await hash(p.portalId,p.portalPin);changed=true}
  await firestore().collection('playerPortals').doc(p.portalId).set({portalType:'teamJenkinsPlayer',teamName:TEAM,playerName:p.name,firstName:p.name.split(' ')[0],phone:p.phone,pinHash:p.portalPinHash,accessScope:['practice','library'],persistentAccess:true,updatedAt:window.firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
 }
 const coach=db.teamJenkins?.coach||(db.teamJenkins={name:TEAM,coach:{name:'Mark Jenkins',phone:'913-484-5626'}}).coach;
 coach.phone='913-484-5626';
 if(!coach.portalId){coach.portalId=bytesId();coach.portalPin=pin();coach.portalPinHash=await hash(coach.portalId,coach.portalPin);changed=true}
 await firestore().collection('playerPortals').doc(coach.portalId).set({portalType:'coach',coachName:'Mark Jenkins',firstName:'Mark',phone:coach.phone,pinHash:coach.portalPinHash,teamName:TEAM,accessScope:['practice','library'],noPitcherWarmups:true,updatedAt:window.firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
 if(changed)write(db);return true;
}
function groupAttendance(){
 const box=document.querySelector('.practice-setup .practice-attendance');if(!box||box.dataset.jenkinsGrouped)return;
 const rows=[...box.querySelectorAll(':scope > .practice-attendance-row')];if(!rows.length)return;
 const firstJ=rows.find(r=>names.has(r.querySelector('b')?.textContent?.trim()));if(!firstJ)return;
 const kc=document.createElement('div');kc.className='team-roster-heading';kc.textContent='KC REBELS';box.insertBefore(kc,rows[0]);
 const h=document.createElement('div');h.className='team-roster-heading team-jenkins-heading';h.textContent=TEAM.toUpperCase();box.insertBefore(h,firstJ);box.dataset.jenkinsGrouped='1';
}
function addPortalManager(){
 const main=document.querySelector('.portal-page');if(!main||location.search.includes('portal=')||document.getElementById('teamJenkinsPortalManager'))return;
 const setup=document.querySelector('.portal-coach-setup');if(!setup)return;
 const db=read(),teamPlayers=(db?.roster||[]).filter(p=>names.has(p.name)),coach=db?.teamJenkins?.coach||{};
 const section=document.createElement('section');section.className='portal-coach-setup';section.id='teamJenkinsPortalManager';
 section.innerHTML=`<span>OTHER TEAM</span><h2>Team Jenkins Portals</h2><p>These links stay active for future hitting practices. Players receive Practice Plan + Drill Library only.</p><button class="btn black block" id="setupTeamJenkinsPortals">${teamPlayers.every(p=>p.portalId)&&coach.portalId?'Refresh Team Jenkins Portals':'Create Team Jenkins Portals'}</button><div class="team-jenkins-portal-list">${teamPlayers.map(p=>`<article><b>${esc(p.name)}</b><small>${esc(p.phone)}${p.portalPin?` · PIN ${esc(p.portalPin)}`:''}</small>${p.portalId?`<button class="btn tj-share" data-id="${esc(p.portalId)}" data-pin="${esc(p.portalPin)}" data-name="${esc(p.name)}">Share</button>`:''}</article>`).join('')}${coach.portalId?`<article><b>Mark Jenkins (Coach)</b><small>${esc(coach.phone||'913-484-5626')} · PIN ${esc(coach.portalPin)}</small><button class="btn tj-share" data-id="${esc(coach.portalId)}" data-pin="${esc(coach.portalPin)}" data-name="Mark Jenkins">Share</button></article>`:''}</div>`;
 setup.after(section);
 section.querySelector('#setupTeamJenkinsPortals')?.addEventListener('click',async e=>{e.currentTarget.disabled=true;e.currentTarget.textContent='Creating…';try{await ensurePortals();location.reload()}catch(err){alert('Team Jenkins portals could not be created. Confirm Cloud Backup is signed in and try again.');e.currentTarget.disabled=false}});
 section.querySelectorAll('.tj-share').forEach(b=>b.addEventListener('click',async()=>{const url=`${location.origin}${location.pathname}?portal=${encodeURIComponent(b.dataset.id)}&team=jenkins`;const text=`${b.dataset.name}’s HotB Portal\nPIN: ${b.dataset.pin}\n${url}`;try{if(navigator.share)await navigator.share({title:'HotB Portal',text});else{await navigator.clipboard.writeText(text);alert('Portal link and PIN copied.')}}catch(e){}}));
}
function restrictJenkinsPlayer(){
 if(new URLSearchParams(location.search).get('team')!=='jenkins')return;
 const dash=document.querySelector('.portal-dashboard');if(!dash)return;
 [...dash.querySelectorAll('button')].forEach(b=>{const v=b.dataset.portalView;if(v&& !['practice','library'].includes(v))b.remove()});
 const note=document.querySelector('.portal-private-note');if(note)note.textContent='Team Jenkins access includes the current Practice Plan and the HotB Drill Library.';
}
function coachLibrary(){
 const page=document.querySelector('.portal-page');if(!page||document.getElementById('coachDrillLibraryButton'))return;
 const coachCard=document.querySelector('.portal-coach-card');
 const coachWelcome=[...document.querySelectorAll('.portal-welcome span')].some(x=>/COACH PORTAL|ACTIVE PRACTICE/.test(x.textContent));
 if(!coachCard&&!coachWelcome)return;
 const btn=document.createElement('button');btn.id='coachDrillLibraryButton';btn.className='btn black block';btn.textContent='Drill Library';btn.addEventListener('click',showLibrary);page.querySelector('.portal-welcome')?.after(btn);
}
function showLibrary(){
 const drills=Array.isArray(window.HotBDrillLibrary)?window.HotBDrillLibrary:[];
 const overlay=document.createElement('div');overlay.className='modal-backdrop tj-library-modal';overlay.innerHTML=`<div class="modal"><div class="modal-header"><h2>Drill Library</h2><button class="btn tj-close">Close</button></div><div class="practice-library-search"><input class="input" placeholder="Search drills"></div><section class="practice-drill-list"></section></div>`;document.body.appendChild(overlay);
 const list=overlay.querySelector('.practice-drill-list'),input=overlay.querySelector('input');
 const draw=()=>{const q=input.value.toLowerCase();list.innerHTML=drills.filter(d=>!q||Object.values(d).some(v=>String(v).toLowerCase().includes(q))).map(d=>`<article class="practice-drill-card"><span>${esc(d.category||'')}</span><h3>${esc(d.name)}</h3><p>${esc(d.primaryPurpose||'')}</p><p><b>How It Works:</b> ${esc(d.howItWorks||'')}</p><p><b>Coaching Cues:</b> ${esc(d.coachingCues||'')}</p></article>`).join('')};input.addEventListener('input',draw);overlay.querySelector('.tj-close').onclick=()=>overlay.remove();draw();
}
async function mirrorMarkPractice(action){
 if(!signedIn()||!firestore())return;const db=read(),mark=db?.teamJenkins?.coach,bob=db?.coachPortal;if(!mark?.portalId)return;
 const markRef=firestore().collection('playerPortals').doc(mark.portalId);
 if(action==='clear'){await markRef.set({activePractice:null,updatedAt:window.firebase.firestore.FieldValue.serverTimestamp()},{merge:true});return}
 if(!bob?.portalId)return;
 const snap=await firestore().collection('playerPortals').doc(bob.portalId).get(),practice=snap.data()?.activePractice;if(!practice)return;
 const schedule=(practice.schedule||[]).filter(e=>!/warm.?up/i.test(String(e.assignment||'')));
 await markRef.set({activePractice:{...practice,coachName:'Mark Jenkins',schedule,drills:practice.drills||[]},updatedAt:window.firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
}
document.addEventListener('click',e=>{const id=e.target.closest('button')?.id;if(['activatePlayerPlans','startPractice','beginPractice'].includes(id))setTimeout(()=>mirrorMarkPractice('sync').catch(()=>{}),1200);if(['deactivatePlayerPlans','endPractice','finishPractice'].includes(id))setTimeout(()=>mirrorMarkPractice('clear').catch(()=>{}),800)},true);
const observer=new MutationObserver(()=>{groupAttendance();addPortalManager();restrictJenkinsPlayer();coachLibrary()});
observer.observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('load',()=>{groupAttendance();addPortalManager();restrictJenkinsPlayer();coachLibrary()});
})();