(() => {
  const BUCKETS=['0-0','0-2','1-2','2-2','3-2','6+'];
  function fixRow(row){
    const count=row.querySelector(':scope > b');
    if(!count)return;
    const bucket=(count.textContent||'').trim();
    if(!BUCKETS.includes(bucket))return;
    const type=getComputedStyle(count);

    // Match the annotated target: count at left, then H | H4O | K | AVE
    // spread cleanly across the entire available row in fixed aligned columns.
    row.style.setProperty('display','grid','important');
    row.style.setProperty('grid-template-columns','72px minmax(28px,1fr) 12px minmax(28px,1fr) 12px minmax(28px,1fr) 12px minmax(70px,1.35fr)','important');
    row.style.setProperty('align-items','center','important');
    row.style.setProperty('column-gap','4px','important');
    row.style.setProperty('width','100%','important');
    row.style.setProperty('white-space','nowrap','important');
    row.style.setProperty('min-width','0','important');
    count.style.setProperty('white-space','nowrap','important');
    count.style.setProperty('word-break','keep-all','important');
    count.style.setProperty('overflow-wrap','normal','important');
    count.style.setProperty('justify-self','start','important');

    [...row.children].forEach((el,index)=>{
      if(el===count)return;
      el.style.setProperty('font-size',type.fontSize,'important');
      el.style.setProperty('font-weight',type.fontWeight,'important');
      el.style.setProperty('font-family',type.fontFamily,'important');
      el.style.setProperty('letter-spacing',type.letterSpacing,'important');
      el.style.setProperty('white-space','nowrap','important');
      el.style.setProperty('text-align','center','important');
      el.style.setProperty('justify-self','center','important');
      if(index===7){el.style.setProperty('justify-self','end','important');el.style.setProperty('text-align','right','important')}
    });
    if(bucket==='0-0'){
      const k=row.querySelector('.strikeout,.count-k,[data-count-stat="K"]');
      if(k){k.textContent='X';k.classList.remove('zero','positive');k.style.setProperty('color','#111','important')}
    }
  }
  function sync(){document.querySelectorAll('.count-card,.eval-count-card').forEach(fixRow)}
  function burst(){sync();setTimeout(sync,40);setTimeout(sync,150);setTimeout(sync,400)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',burst,{once:true});else burst();
  document.addEventListener('click',burst,true);
  document.addEventListener('change',burst,true);
  setInterval(()=>{if(document.querySelector('.count-card,.eval-count-card'))sync()},500);
})();
