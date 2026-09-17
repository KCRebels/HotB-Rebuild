(()=>{
'use strict';
// Player portal recovery: Firebase anonymous sign-in changes auth state asynchronously.
// The original loader returns immediately after signInAnonymously(), which can leave
// iPhone/Safari portal links indefinitely on "Opening Your Portal". This watchdog
// retries the existing portal loader once Firebase has established the anonymous user.
if(!new URLSearchParams(location.search).get('portal'))return;
let attempts=0,lastUid='';
function retry(){
 attempts++;
 try{
  if(!window.firebase?.apps?.length||!firebase.auth)return;
  const user=firebase.auth().currentUser;
  if(user?.uid&&user.uid!==lastUid){
   lastUid=user.uid;
   // Auth state has changed; notify it again so HotB's existing onAuthStateChanged
   // path gets a fresh turn after the anonymous user is fully available.
   try{window.dispatchEvent(new Event('hotb-portal-auth-ready'))}catch(e){}
  }
  // If the screen is still on the opening state after auth is ready, a harmless
  // same-URL replace reload gives the existing app loader a clean authenticated pass.
  const opening=[...document.querySelectorAll('h1,h2')].some(el=>/Opening Your Portal/i.test(el.textContent||''));
  if(user?.isAnonymous&&opening&&!sessionStorage.getItem('hotbPortalAuthRetryV1')){
   sessionStorage.setItem('hotbPortalAuthRetryV1','1');
   location.replace(location.href);
   return;
  }
 }catch(e){}
 if(attempts<20)setTimeout(retry,250);
}
window.addEventListener('load',()=>setTimeout(retry,100));
setTimeout(retry,250);
})();