(()=>{
'use strict';
let timer=0;
function needsVisuals(){
 const evalApp=document.querySelector('.eval-app');
 if(!evalApp)return false;
 const hitting=[...evalApp.querySelectorAll('.performance')].find(el=>el.querySelector('h2')?.textContent?.trim()==='Hitting Results');
 return !!hitting&&!evalApp.querySelector('[data-eval-visual="heat"]');
}
function refresh(){
 clearTimeout(timer);
 timer=setTimeout(()=>{
  if(!needsVisuals())return;
  const select=document.querySelector('#evalSelect');
  if(!select)return;
  select.dispatchEvent(new Event('change',{bubbles:true}));
 },35);
}
document.addEventListener('change',e=>{
 if(e.target instanceof Element&&e.target.matches('#evalSelect,#evalSeasonFilter,#evalDateRange,#evalDateStart,#evalDateEnd')){
  clearTimeout(timer);
  timer=setTimeout(()=>{
   if(needsVisuals())e.target.dispatchEvent(new Event('change',{bubbles:true}));
  },60);
 }
},true);
const app=document.querySelector('#app');
if(app)new MutationObserver(ms=>{
 if(ms.some(m=>[...m.addedNodes].some(n=>n.nodeType===1&&(n.matches?.('.eval-app,.performance')||n.querySelector?.('.eval-app,.performance')))))refresh();
}).observe(app,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh,{once:true});else refresh();
})();