(()=>{
'use strict';
if(!new URLSearchParams(location.search).get('portal'))return;
let portalScreen=null;
function app(){return document.getElementById('app')}
function savePortal(){const a=app();if(!a||portalScreen||!a.querySelector('[data-hbp-view]'))return;const f=document.createDocumentFragment();while(a.firstChild)f.appendChild(a.firstChild);portalScreen=f}
function restorePortal(){const a=app();if(!a||!portalScreen)return false;a.replaceChildren(portalScreen);portalScreen=null;return true}
document.addEventListener('click',e=>{
 const t=e.target instanceof Element?e.target:null;if(!t)return;
 const tile=t.closest('[data-hbp-view]');if(tile){if(tile.dataset.hbpView==='trends'||tile.dataset.hbpView==='practice')return;savePortal();return}
 const modalClose=t.closest('[data-pc-close],[data-aba-close],[data-hhb-close],[data-decision-close],[data-bpp-close],.pem-close');if(modalClose)return;
 const back=t.closest('#hbpBack,#hbpEvalBack,#pemBack,.hbp-back');if(!back)return;
 const openModal=document.querySelector('#playerCoachModal,#abaModal,#hhbContactPopup,#decisionQualityModal,#bppModal,.pem-modal');
 if(openModal){e.preventDefault();e.stopImmediatePropagation();openModal.remove();return}
 if(document.querySelector('.hbp-main.eval-match')&&portalScreen){e.preventDefault();e.stopImmediatePropagation();restorePortal();return}
 if(portalScreen){e.preventDefault();e.stopImmediatePropagation();restorePortal();return}
},true);
const fix=()=>document.querySelectorAll('#hbpBack,#hbpEvalBack,#pemBack,.hbp-back').forEach(b=>{if(b.textContent.trim()!=='Back')b.textContent='Back'});
new MutationObserver(fix).observe(document.documentElement,{childList:true,subtree:true});fix();
})();