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
 const fn=window[action];
 if(typeof fn!=='function'){
  // Do not consume the user's tap when app.js has not installed the authoritative
  // delivery action yet. Let the normal bubble listener receive this same gesture.
  // A deferred retry is unreliable for iOS share/sms because it loses user activation.
  event.__hotbPortalDeliveryHandled=false;
  return;
 }
 event.__hotbPortalDeliveryHandled=true;event.preventDefault();event.stopImmediatePropagation();
 try{fn(name)}catch(error){console.error('Portal delivery action failed',error)}
},true);
})();