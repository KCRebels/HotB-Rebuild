(() => {
  const BUCKETS=['0-0','0-2','1-2','2-2','3-2','6+'];
  function panelFor(row){return row.closest('.eval-count-panel')||row.closest('.report-detail')||row.parentElement?.parentElement}
  function fixPanel(panel){
    if(!panel)return;
    const title=[...panel.querySelectorAll('h2,h3')].find(el=>el.textContent?.trim()==='Count Performance');
    const key=panel.querySelector('.eval-count-key,.count-key');
    if(title&&key){
      const header=title.parentElement;
      if(header){header.style.setProperty('position','relative','important')}
      title.style.setProperty('margin-right','300px','important');
      key.style.setProperty('position','absolute','important');
      key.style.setProperty('right','18px','important');
      key.style.setProperty('top',`${title.offsetTop}px`,'important');
      key.style.setProperty('margin','0','important');
      key.style.setProperty('display','grid','important');
      key.style.setProperty('grid-template-columns','34px 12px 52px 12px 34px 12px 82px','important');
      key.style.setProperty('column-gap','3px','important');
      key.style.setProperty('align-items','center','important');
      [...key.children].forEach((el,i)=>{el.style.setProperty('justify-self',i===6?'end':'center','important');el.style.setProperty('white-space','nowrap','important')});
    }
  }
  function fixRow(row){
    const count=row.querySelector(':scope > b');
    if(!count)return;
    const bucket=(count.textContent||'').trim();
    if(!BUCKETS.includes(bucket))return;
    const type=getComputedStyle(count);
    row.style.setProperty('display','grid','important');
    row.style.setProperty('grid-template-columns','72px 1fr 34px 12px 52px 12px 34px 12px 82px','important');
    row.style.setProperty('align-items','center','important');
    row.style.setProperty('column-gap','3px','important');
    row.style.setProperty('width','100%','important');
    row.style.setProperty('white-space','nowrap','important');
    row.style.setProperty('min-width','0','important');
    count.style.setProperty('grid-column','1','important');
    count.style.setProperty('white-space','nowrap','important');
    count.style.setProperty('word-break','keep-all','important');
    count.style.setProperty('overflow-wrap','normal','important');
    count.style.setProperty('justify-self','start','important');
    const values=[...row.children].filter(el=>el!==count),columns=[3,4,5,6,7,8,9];
    values.forEach((el,i)=>{
      el.style.setProperty('grid-column',String(columns[i]||9),'important');
      el.style.setProperty('font-size',type.fontSize,'important');
      el.style.setProperty('font-weight',type.fontWeight,'important');
      el.style.setProperty('font-family',type.fontFamily,'important');
      el.style.setProperty('letter-spacing',type.letterSpacing,'important');
      el.style.setProperty('white-space','nowrap','important');
      el.style.setProperty('text-align','center','important');
      el.style.setProperty('justify-self',i===6?'end':'center','important');
    });
    if(bucket==='0-0'){
      const k=row.querySelector('.strikeout,.count-k,[data-count-stat="K"]');
      if(k){k.textContent='X';k.classList.remove('zero','positive');k.style.setProperty('color','#111','important')}
    }
    fixPanel(panelFor(row));
  }
  function sync(){document.querySelectorAll('.count-card,.eval-count-card').forEach(fixRow)}
  function burst(){sync();setTimeout(sync,40);setTimeout(sync,150);setTimeout(sync,400)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',burst,{once:true});else burst();
  document.addEventListener('click',burst,true);document.addEventListener('change',burst,true);
  setInterval(()=>{if(document.querySelector('.count-card,.eval-count-card'))sync()},500);
})();
