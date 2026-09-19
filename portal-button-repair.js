(()=>{
'use strict';

// Coach-side portal delivery buttons use one delegated capture handler so iOS
// standalone mode keeps the Share/SMS action inside the original user gesture.
// This also survives every HotB render without rebinding individual buttons.
if(new URLSearchParams(location.search).has('portal'))return;

function invoke(action,name,event){
 const fn=window[action];
 if(typeof fn!=='function')return false;
 event.preventDefault();
 event.stopImmediatePropagation();
 try{fn(name);return true}catch(error){console.error('Portal delivery action failed',error);return false}
}

document.addEventListener('click',event=>{
 const target=event.target.closest?.('button,a');
 if(!target)return;
 if(target.matches('[data-share-portal]')){invoke('HotBPortalShare',target.dataset.sharePortal,event);return}
 if(target.matches('[data-text-portal]')){invoke('HotBPortalText',target.dataset.textPortal,event);return}
 if(target.id==='shareCoachPortal'){invoke('HotBCoachPortalShare',undefined,event);return}
 if(target.id==='textCoachPortal'){invoke('HotBCoachPortalText',undefined,event);return}
},true);
})();
