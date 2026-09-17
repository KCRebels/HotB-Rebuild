(()=>{
'use strict';
if(!new URLSearchParams(location.search).get('portal'))return;
let portalScreen=null;
function app(){return document.getElementById('app')}
function savePortal(){const a=app();if(!a||portalScreen||!a.querySelector('[data-hbp-view]'))return;const f=document.createDocumentFragment();while(a.firstChild)f.appendChild(a.firstChild);portalScreen=f}
function restorePortal(){const a=app();if(!a||!portalScreen)return false;a.replaceChildren(portalScreen);portalScreen=null;return true}
document.addEventListener('click',e=>{
 const t=e.target instanceof Element?e.target:null;if(!t)return;
 const tile=t.closest('[data-hbp-view]');if(tile){savePortal();return}
 const directBack=t.closest('#hbpBack');if(directBack&&portalScreen){e.preventDefault();e.stopImmediatePropagation();restorePortal();return}
 const evalBack=t.closest('#hbpEvalBack');if(evalBack&&portalScreen&&/Hitting Results/i.test(app()?.textContent||'')){e.preventDefault();e.stopImmediatePropagation();restorePortal()}
},true);
const fix=()=>document.querySelectorAll('#hbpBack').forEach(b=>{if(b.textContent.trim()!=='Back')b.textContent='Back'});
new MutationObserver(fix).observe(document.documentElement,{childList:true,subtree:true});fix();
})();