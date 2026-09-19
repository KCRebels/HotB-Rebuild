(()=>{
'use strict';
if(!new URLSearchParams(location.search).get('portal'))return;
// The main HotB portal owns navigation. This compatibility layer only keeps
// legacy preview back buttons labeled consistently and does not intercept taps.
const fix=()=>document.querySelectorAll('#hbpBack,#hbpEvalBack,#pemBack,.hbp-back').forEach(b=>{if(b.textContent.trim()!=='Back')b.textContent='Back'});
new MutationObserver(fix).observe(document.documentElement,{childList:true,subtree:true});fix();
})();
