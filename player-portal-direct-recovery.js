(()=>{
'use strict';
const params=new URLSearchParams(location.search),token=params.get('portal');
if(!token)return;
const COACH='hotbkcrebels@gmail.com';
let started=false;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function hash(pin){const bytes=new TextEncoder().encode(`${token}:${String(pin||'').trim()}`),digest=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(digest)].map(v=>v.toString(16).padStart(2,'0')).join('')}
function opening(){return [...document.querySelectorAll('h1,h2')].some(el=>/Opening Your Portal/i.test(el.textContent||''))}
function showPin(message='Enter the six-digit PIN provided by your coach.'){
 if(document.getElementById('hotbDirectPortalRecovery'))return;
 const app=document.getElementById('app');if(!app)return;
 const box=document.createElement('div');box.id='hotbDirectPortalRecovery';box.style.cssText='position:fixed;inset:0;z-index:99999;background:#f4f4f4;display:flex;align-items:flex-start;justify-content:center;padding:70px 22px 30px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif';
 box.innerHTML=`<div style="width:100%;max-width:520px;background:#fff;border:1px solid #ddd;border-radius:22px;padding:26px;box-shadow:0 8px 30px rgba(0,0,0,.08)"><div style="font-size:12px;font-weight:900;letter-spacing:.12em;margin-bottom:8px">PRIVATE ACCESS</div><h2 style="margin:0 0 10px;font-size:28px">Open Your HotB Portal</h2><p id="hotbDirectPortalMessage" style="margin:0 0 20px;line-height:1.45">${message}</p><input id="hotbDirectPortalPin" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="6-digit PIN" style="box-sizing:border-box;width:100%;font-size:24px;letter-spacing:.18em;padding:14px;border:2px solid #222;border-radius:12px;text-align:center"><button id="hotbDirectPortalOpen" type="button" style="width:100%;margin-top:14px;padding:15px;border:0;border-radius:12px;background:#111;color:#fff;font-size:18px;font-weight:900">OPEN PORTAL</button></div>`;
 document.body.appendChild(box);
 const button=document.getElementById('hotbDirectPortalOpen'),input=document.getElementById('hotbDirectPortalPin'),msg=document.getElementById('hotbDirectPortalMessage');
 button.onclick=async()=>{const pin=String(input.value||'').trim();if(!/^\d{6}$/.test(pin)){msg.textContent='Enter the six-digit PIN provided by your coach.';return}button.disabled=true;button.textContent='OPENING…';msg.textContent='Checking your PIN…';try{const auth=firebase.auth();let user=auth.currentUser;if(!user||(!user.isAnonymous&&String(user.email||'').toLowerCase()!==COACH)){if(user)await auth.signOut();const cred=await auth.signInAnonymously();user=cred.user||auth.currentUser}const doc=firebase.firestore().collection('playerPortals').doc(token),proof=await hash(pin);try{await doc.update({authorizedUids:firebase.firestore.FieldValue.arrayUnion(user.uid),pinProof:proof,claimedAt:firebase.firestore.FieldValue.serverTimestamp()})}catch(first){await doc.update({ownerUid:user.uid,pinProof:proof,claimedAt:firebase.firestore.FieldValue.serverTimestamp()})}sessionStorage.removeItem('hotbPortalAuthRetryV1');location.replace(location.href)}catch(err){console.error('Direct portal recovery failed',err);msg.textContent='That PIN did not work. Please check the six digits and try again.';button.disabled=false;button.textContent='OPEN PORTAL'}};
 input.focus();
}
async function run(){if(started)return;started=true;for(let i=0;i<30&&!window.firebase?.auth;i++)await sleep(100);if(!window.firebase?.auth)return;try{const auth=firebase.auth();let user=auth.currentUser;if(!user){const cred=await auth.signInAnonymously();user=cred.user||auth.currentUser}if(user&&!user.isAnonymous&&String(user.email||'').toLowerCase()===COACH)return;const doc=firebase.firestore().collection('playerPortals').doc(token);try{const snap=await doc.get();if(snap.exists)return}catch(e){}for(let i=0;i<12;i++){await sleep(250);if(!opening())return}showPin()}catch(e){for(let i=0;i<8;i++){await sleep(250);if(!opening())return}showPin()}}
window.addEventListener('load',()=>setTimeout(run,150));setTimeout(run,400);
})();