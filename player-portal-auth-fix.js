(()=>{
'use strict';
// Portal auth recovery for Safari/iPhone. The main app starts anonymous auth and
// returns while Firebase is changing auth state. If that callback is missed or
// delayed, the portal can remain forever on "Opening Your Portal". Once auth is
// settled, reload the same private link once so app.js gets a clean authenticated pass.
if(!new URLSearchParams(location.search).get('portal'))return;
const RETRY_KEY='hotbPortalAuthRetryV2';
let attempts=0;
function isOpening(){return [...document.querySelectorAll('h1,h2')].some(el=>/Opening Your Portal/i.test(el.textContent||''))}
function retry(){
 attempts++;
 try{
  if(!window.firebase?.apps?.length||!firebase.auth){if(attempts<30)setTimeout(retry,200);return}
  const auth=firebase.auth(),user=auth.currentUser;
  if(user&&isOpening()){
   if(!sessionStorage.getItem(RETRY_KEY)){
    sessionStorage.setItem(RETRY_KEY,'1');
    location.replace(location.href);
    return;
   }
   try{window.dispatchEvent(new Event('hotb-portal-auth-ready'))}catch(e){}
  }
 }catch(e){}
 if(attempts<30)setTimeout(retry,200);
}
window.addEventListener('load',()=>setTimeout(retry,150));
setTimeout(retry,350);
})();
