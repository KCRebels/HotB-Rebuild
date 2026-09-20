(()=>{
'use strict';
if(new URLSearchParams(location.search).has('portal'))return;
window.HOTB_PORTAL_BUTTON_REPAIR_ACTIVE=true;
document.addEventListener('click',event=>{
 const target=event.target.closest?.('button,a');if(!target)return;
 let action='',name;
 if(target.matches('[data-share-portal]')){action='HotBPortalShare';name=target.dataset.sharePortal}
 else if(target.matches('[data-text-portal]')){action='HotBPortalText';name=target.dataset.textPortal}
 else if(target.id==='shareCoachPortal')action='HotBCoachPortalShare';
 else if(target.id==='textCoachPortal')action='HotBCoachPortalText';
 else return;
 event.__hotbPortalDeliveryHandled=true;event.preventDefault();event.stopImmediatePropagation();
 const fn=window[action];
 if(typeof fn!=='function'){
  // app.js can finish a fraction after this capture listener on a fresh PWA boot.
  // Retry inside the same tap turn rather than silently swallowing the button.
  queueMicrotask(()=>{const retry=window[action];if(typeof retry==='function')try{retry(name)}catch(error){console.error('Portal delivery action failed',error)}});
  return;
 }
 try{fn(name)}catch(error){console.error('Portal delivery action failed',error)}
},true);
})();