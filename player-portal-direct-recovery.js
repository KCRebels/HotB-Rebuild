(()=>{
'use strict';
const params=new URLSearchParams(location.search),token=params.get('portal');
if(!token)return;
const COACH='hotbkcrebels@gmail.com';
let shown=false;
async function hash(pin){const bytes=new TextEncoder().encode(`${token}:${String(pin||'').trim()}`),digest=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(digest)].map(v=>v.toString(16).padStart(2,'0')).join('')}
function opening(){return [...document.querySelectorAll('h1,h2')].some(el=>/Opening Your Portal/i.test(el.textContent||''))}
function showPin(message='Enter the six-digit PIN provided by your coach.'){
 if(shown||document.getElementById('hotbDirectPortalRecovery'))return;shown=true;
 const box=document.createElement('div');box.id='hotbDirectPortalRecovery';box.style.cssText='position:fixed;inset:0;z-index:99999;background:#f4f4f4;display:flex;align-items:flex-start;justify-content:center;padding:70px 22px 30px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif';
 box.innerHTML=`<div style="width:100%;max-width:520px;background:#fff;border:1px solid #ddd;border-radius:22px;padding:26px;box-shadow:0 8px 30px rgba(0,0,0,.08)"><div style="font-size:12px;font-weight:900;letter-spacing:.12em;margin-bottom:8px">PRIVATE ACCESS</div><h2 style="margin:0 0 10px;font-size:28px">Open Your HotB Portal</h2><p id="hotbDirectPortalMessage" style="margin:0 0 20px;line-height:1.45">${message}</p><input id="hotbDirectPortalPin" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="6-digit PIN" style="box-sizing:border-box;width:100%;font-size:24px;letter-spacing:.18em;padding:14px;border:2px solid #222;border-radius:12px;text-align:center"><button id="hotbDirectPortalOpen" type="button" style="width:100%;margin-top:14px;padding:15px;border:0;border-radius:12px;background:#111;color:#fff;font-size:18px;font-weight:900">OPEN PORTAL</button></div>`;
 document.body.appendChild(box);
 const button=document.getElementById('hotbDirectPortalOpen'),input=document.getElementById('hotbDirectPortalPin'),msg=document.getElementById('hotbDirectPortalMessage');
 button.onclick=async()=>{const pin=String(input.value||'').trim();if(!/^\d{6}$/.test(pin)){msg.textContent='Enter the six-digit PIN provided by your coach.';return}button.disabled=true;button.textContent='OPENING…';msg.textContent='Checking your PIN…';try{const auth=firebase.auth();let user=auth.currentUser;if(!user||(!user.isAnonymous&&String(user.email||'').toLowerCase()!==COACH)){if(user)await auth.signOut();const cred=await auth.signInAnonymously();user=cred.user||auth.currentUser}const doc=firebase.firestore().collection('playerPortals').doc(token),proof=await hash(pin);try{await doc.update({authorizedUids:firebase.firestore.FieldValue.arrayUnion(user.uid),pinProof:proof,claimedAt:firebase.firestore.FieldValue.serverTimestamp()})}catch(first){await doc.update({ownerUid:user.uid,pinProof:proof,claimedAt:firebase.firestore.FieldValue.serverTimestamp()})}sessionStorage.removeItem('hotbPortalAuthRetryV1');sessionStorage.removeItem('hotbPortalAuthRetryV2');location.replace(location.href)}catch(err){console.error('Direct portal recovery failed',err);msg.textContent='That PIN did not work. Please check the six digits and try again.';button.disabled=false;button.textContent='OPEN PORTAL'}};
 setTimeout(()=>input.focus(),50);
}
// If the normal portal loader succeeds, do nothing. If it is still visibly stuck
// after four seconds, expose the PIN path directly. This avoids depending on a
// Firestore read that security rules intentionally reject before the PIN is claimed.
function watchdog(){if(!opening())return;try{const user=firebase.auth().currentUser;if(user&&!user.isAnonymous&&String(user.email||'').toLowerCase()===COACH)return}catch(e){}showPin()}
window.addEventListener('load',()=>setTimeout(watchdog,4000));
setTimeout(watchdog,5000);
})();
