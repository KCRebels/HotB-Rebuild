(()=>{
'use strict';
const params=new URLSearchParams(location.search),token=params.get('portal');
if(!token)return;
const COACH='hotbkcrebels@gmail.com';
let shown=false,openingPortal=false;
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
async function hash(pin){const bytes=new TextEncoder().encode(`${token}:${String(pin||'').trim()}`),digest=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(digest)].map(v=>v.toString(16).padStart(2,'0')).join('')}
function opening(){return [...document.querySelectorAll('h1,h2')].some(el=>/Opening Your Portal/i.test(el.textContent||''))}
function firstName(data){return data?.firstName||String(data?.playerName||data?.coachName||'Player').trim().split(/\s+/)[0]||'Player'}
function renderAuthorized(data){
 if(!data||data.portalType==='coach'||data.portalType==='guestCoach'||data.portalType==='guestPlayer')return false;
 const app=document.getElementById('app');if(!app)return false;
 const first=firstName(data),active=!!data.activePractice;
 app.innerHTML=`<div class="app portal-app"><div class="page-match-head page-head-centered portal-head"><span class="page-head-spacer"></span><h1>Player Portal</h1><span class="page-head-spacer"></span></div><main class="portal-page"><section class="portal-welcome ${active?'active':''}"><span>${active?'PRACTICE ACTIVE':'PLAYER PORTAL'}</span><h2>Hi, ${esc(first)}</h2><p>${active?'Your current practice plan is ready below.':'Your practice and personal focus are available here.'}</p></section><section class="portal-dashboard"><button id="hotbRecoveryPractice" class="${active?'active':''}"><span>PRACTICE</span><h3>My Practice</h3><p>${active?'View your active rotation.':'No practice is active.'}</p></button><button id="hotbRecoveryFocus"><span>PLAYER</span><h3>My Focus</h3><p>Your private hitting focus and assigned drills.</p></button></section><p class="portal-private-note">This portal is linked only to ${esc(first)}.</p></main></div>`;
 const practice=document.getElementById('hotbRecoveryPractice'),focus=document.getElementById('hotbRecoveryFocus');
 if(practice)practice.onclick=()=>renderPractice(data);
 if(focus)focus.onclick=()=>renderFocus(data);
 return true;
}
function backButton(data,title){return `<div class="page-match-head page-head-centered portal-head"><button class="page-head-nav" id="hotbRecoveryBack">Back</button><h1>${esc(title)}</h1><span class="page-head-spacer"></span></div>`}
function bindBack(data){document.getElementById('hotbRecoveryBack')?.addEventListener('click',()=>renderAuthorized(data))}
function renderPractice(data){
 const app=document.getElementById('app'),practice=data.activePractice,first=firstName(data);if(!app)return;
 app.innerHTML=`<div class="app portal-app">${backButton(data,'My Practice')}<main class="portal-page">${practice?`<section class="portal-welcome active"><span>ACTIVE PRACTICE</span><h2>${esc(practice.title||'This Week’s Practice')}</h2><p>${esc(practice.startLabel||'')}</p></section><article class="practice-player-card portal-player-card"><header><h2>${esc(first)}</h2></header><ol>${(practice.schedule||[]).map(entry=>`<li><b>B${esc(entry.block)}</b><span class="card-time">${esc(entry.time)}</span><strong>${esc(entry.assignment)}</strong></li>`).join('')}</ol></article>`:`<section class="portal-empty"><span>MY PRACTICE</span><h2>No Active Practice</h2><p>Your coach has not activated a practice plan for you right now.</p></section>`}</main></div>`;bindBack(data);
}
function renderFocus(data){
 const app=document.getElementById('app'),focus=data.focus;if(!app)return;
 app.innerHTML=`<div class="app portal-app">${backButton(data,'My Focus')}<main class="portal-page">${focus?`<section class="portal-welcome"><span>MY PLAYER FOCUS</span><h2>${esc(focus.title||'Current Hitting Focus')}</h2><p>${esc(focus.summary||'')}</p></section><section class="portal-focus-content">${focus.needsWork?`<div><span>NEEDS WORK</span><b>${esc(focus.needsWork)}</b></div>`:''}${focus.coachNote?`<div><span>COACH NOTE</span><b>${esc(focus.coachNote)}</b></div>`:''}${focus.drills?.length?`<div><span>DRILL PLAN</span><b>${esc(focus.drills.join(' · '))}</b></div>`:''}</section>`:`<section class="portal-empty"><span>MY FOCUS</span><h2>No Focus Plan Yet</h2><p>Your hitting focus has not been published yet.</p></section>`}</main></div>`;bindBack(data);
}
async function openAuthorizedPortal(user){
 if(openingPortal)return false;openingPortal=true;
 try{
  const snap=await firebase.firestore().collection('playerPortals').doc(token).get();
  if(!snap.exists)return false;
  const data={id:snap.id,...snap.data()};
  if(!renderAuthorized(data))return false;
  shown=true;
  firebase.firestore().collection('playerPortals').doc(token).onSnapshot(next=>{if(next.exists){const fresh={id:next.id,...next.data()};if(document.getElementById('hotbRecoveryPractice')||document.getElementById('hotbRecoveryFocus'))renderAuthorized(fresh)}},()=>{});
  return true;
 }catch(e){return false}finally{openingPortal=false}
}
function showPin(message='Enter the six-digit PIN provided by your coach.'){
 if(shown||document.getElementById('hotbDirectPortalRecovery'))return;shown=true;
 const box=document.createElement('div');box.id='hotbDirectPortalRecovery';box.style.cssText='position:fixed;inset:0;z-index:99999;background:#f4f4f4;display:flex;align-items:flex-start;justify-content:center;padding:70px 22px 30px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif';
 box.innerHTML=`<div style="width:100%;max-width:520px;background:#fff;border:1px solid #ddd;border-radius:22px;padding:26px;box-shadow:0 8px 30px rgba(0,0,0,.08)"><div style="font-size:12px;font-weight:900;letter-spacing:.12em;margin-bottom:8px">PRIVATE ACCESS</div><h2 style="margin:0 0 10px;font-size:28px">Open Your HotB Portal</h2><p id="hotbDirectPortalMessage" style="margin:0 0 20px;line-height:1.45">${message}</p><input id="hotbDirectPortalPin" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="6-digit PIN" style="box-sizing:border-box;width:100%;font-size:24px;letter-spacing:.18em;padding:14px;border:2px solid #222;border-radius:12px;text-align:center"><button id="hotbDirectPortalOpen" type="button" style="width:100%;margin-top:14px;padding:15px;border:0;border-radius:12px;background:#111;color:#fff;font-size:18px;font-weight:900">OPEN PORTAL</button></div>`;
 document.body.appendChild(box);
 const button=document.getElementById('hotbDirectPortalOpen'),input=document.getElementById('hotbDirectPortalPin'),msg=document.getElementById('hotbDirectPortalMessage');
 button.onclick=async()=>{const pin=String(input.value||'').trim();if(!/^\d{6}$/.test(pin)){msg.textContent='Enter the six-digit PIN provided by your coach.';return}button.disabled=true;button.textContent='OPENING…';msg.textContent='Checking your PIN…';try{const auth=firebase.auth();let user=auth.currentUser;if(!user||(!user.isAnonymous&&String(user.email||'').toLowerCase()!==COACH)){if(user)await auth.signOut();const cred=await auth.signInAnonymously();user=cred.user||auth.currentUser}const doc=firebase.firestore().collection('playerPortals').doc(token),proof=await hash(pin);try{await doc.update({authorizedUids:firebase.firestore.FieldValue.arrayUnion(user.uid),pinProof:proof,claimedAt:firebase.firestore.FieldValue.serverTimestamp()})}catch(first){await doc.update({ownerUid:user.uid,pinProof:proof,claimedAt:firebase.firestore.FieldValue.serverTimestamp()})}const snap=await doc.get();if(!snap.exists)throw new Error('Portal missing');box.remove();shown=false;renderAuthorized({id:snap.id,...snap.data()})}catch(err){console.error('Direct portal recovery failed',err);msg.textContent='That PIN did not work. Please check the six digits and try again.';button.disabled=false;button.textContent='OPEN PORTAL'}};
 setTimeout(()=>input.focus(),50);
}
async function watchdog(){
 if(!opening())return;
 try{
  const auth=firebase.auth();let user=auth.currentUser;
  if(!user){const cred=await auth.signInAnonymously();user=cred.user||auth.currentUser}
  if(user&&!user.isAnonymous&&String(user.email||'').toLowerCase()===COACH)return;
  if(await openAuthorizedPortal(user))return;
 }catch(e){}
 if(opening())showPin();
}
window.addEventListener('load',()=>setTimeout(watchdog,2500));
setTimeout(watchdog,3500);
})();
