(()=>{
 const KEY='hotb-practice-attendance-manual-v649';
 const REGIONAL_DEFAULT_FIRST_NAMES=new Set(['Aniesa','Brooklyn','Hailey','Lydia','Makenna','Maleah','Mattingly','Megan','Maia','Tayte','Lakyn']);
 const rows=()=>[...document.querySelectorAll('[data-practice-player]')];
 const playerName=input=>input?.closest('.practice-attendance-row')?.querySelector('.practice-player b')?.textContent?.trim()||'';
 const firstName=name=>String(name||'').trim().split(/\s+/)[0]||'';
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
 const setTimeDisplay=input=>{
  const display=input?.parentElement?.querySelector('.practice-accommodation-time-display');
  if(!display)return;
  if(input.value==='17:30')display.textContent='5:30p';
  else if(input.value==='18:15')display.textContent='6:15p';
  else if(input.value==='19:30')display.textContent='7:30p';
 };
 const applyResetControls=()=>{
  const list=rows(),start=document.getElementById('practiceStartTime'),duration=document.getElementById('practiceDuration');
  if(!list.length||!start||!duration)return false;

  // Store the desired attendance first so any redraw/observer restores the RESET state,
  // not the previous All/None selection.
  const desired={};
  list.forEach(input=>{const name=playerName(input);if(name)desired[name]=REGIONAL_DEFAULT_FIRST_NAMES.has(firstName(name))});
  try{sessionStorage.setItem(KEY,JSON.stringify(desired))}catch(_){}

  start.value='17:30';
  start.dataset.hotbPreviousStart='17:30';
  duration.value='120';
  duration.dataset.hotbPreviousDuration='120';
  start.dispatchEvent(new Event('change',{bubbles:true}));
  duration.dispatchEvent(new Event('change',{bubbles:true}));

  rows().forEach(input=>{
   const name=playerName(input),checked=REGIONAL_DEFAULT_FIRST_NAMES.has(firstName(name));
   if(input.checked!==checked){input.checked=checked;input.dispatchEvent(new Event('change',{bubbles:true}))}
  });

  // Master-time change intentionally syncs everyone first. RESET then reapplies
  // Makenna's normal exception: 6:15 arrival and no pitching warm-up.
  const makenna=[...document.querySelectorAll('.practice-attendance-row')].find(row=>/^Makenna\b/i.test(row.querySelector('.practice-player b')?.textContent?.trim()||''));
  if(makenna){
   const arrival=makenna.querySelector('[data-accommodation-arrival]');
   const departure=makenna.querySelector('[data-accommodation-departure]');
   const pitch=makenna.querySelector('[data-accommodation-pitch]');
   const warmup=makenna.querySelector('[data-accommodation-warmup]');
   if(arrival){arrival.value='18:15';arrival.dataset.custom='true';setTimeDisplay(arrival);arrival.dispatchEvent(new Event('change',{bubbles:true}))}
   if(departure){departure.value='19:30';departure.dataset.custom='false';setTimeDisplay(departure);departure.dispatchEvent(new Event('change',{bubbles:true}))}
   if(pitch){pitch.checked=true;pitch.disabled=false;pitch.dispatchEvent(new Event('change',{bubbles:true}))}
   if(warmup){warmup.checked=false;warmup.disabled=false;warmup.dispatchEvent(new Event('change',{bubbles:true}))}
  }
  saveState();
  return true;
 };
 const runReset=()=>{
  // The app's own Reset handler redraws first. Apply after it completes.
  let tries=0;
  const attempt=()=>{tries+=1;if(applyResetControls()||tries>=5)return;setTimeout(attempt,60)};
  setTimeout(attempt,20);
 };
 document.addEventListener('change',event=>{
  if(event.target?.matches?.('[data-practice-player]'))setTimeout(saveState,0);
 },true);
 document.addEventListener('click',event=>{
  const target=event.target?.closest?.('button');if(!target)return;
  if(target.id==='practiceSelectAll'||target.id==='practiceSelectNone')setTimeout(saveState,0);
  if(target.id==='resetPracticeSetup')runReset();
  if(target.id==='endPracticeClock')clearState();
 },true);
 new MutationObserver(()=>{if(rows().length)restoreState()}).observe(document.documentElement,{childList:true,subtree:true});
 addEventListener('pageshow',restoreState);
 setTimeout(restoreState,0);
})();