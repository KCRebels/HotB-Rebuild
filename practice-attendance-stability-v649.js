(()=>{
 const KEY='hotb-practice-attendance-manual-v649';
 const rows=()=>[...document.querySelectorAll('[data-practice-player]')];
 const playerName=input=>input?.closest('.practice-attendance-row')?.querySelector('.practice-player b')?.textContent?.trim()||'';
 const readState=()=>{
  const state={};
  rows().forEach(input=>{const name=playerName(input);if(name)state[name]=!!input.checked});
  return state;
 };
 const saveState=()=>{
  const list=rows();if(!list.length)return;
  try{sessionStorage.setItem(KEY,JSON.stringify(readState()))}catch(_){}
 };
 const loadState=()=>{try{const raw=sessionStorage.getItem(KEY);return raw?JSON.parse(raw):null}catch(_){return null}};
 const clearState=()=>{try{sessionStorage.removeItem(KEY)}catch(_){}};
 let restoring=false;
 const restoreState=()=>{
  if(restoring)return;
  const state=loadState(),list=rows();if(!state||!list.length)return;
  restoring=true;
  try{
   list.forEach(input=>{
    const name=playerName(input);
    if(name&&Object.prototype.hasOwnProperty.call(state,name))input.checked=!!state[name];
   });
  }finally{restoring=false}
 };
 document.addEventListener('change',event=>{
  if(event.target?.matches?.('[data-practice-player]'))setTimeout(saveState,0);
 },true);
 document.addEventListener('click',event=>{
  const target=event.target?.closest?.('button');if(!target)return;
  if(target.id==='practiceSelectAll'||target.id==='practiceSelectNone')setTimeout(saveState,0);
  if(target.id==='endPracticeClock')clearState();
 },true);
 new MutationObserver(()=>{if(rows().length)restoreState()}).observe(document.documentElement,{childList:true,subtree:true});
 addEventListener('pageshow',restoreState);
 setTimeout(restoreState,0);
})();