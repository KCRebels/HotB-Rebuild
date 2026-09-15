(() => {
  const BUCKETS=['0-0','0-2','1-2','2-2','3-2','6+'];
  // Compact H | H4O | K | AVE group. Header and every row use this exact grid.
  const STAT_COLS='28px 8px 38px 8px 28px 8px 64px';

  function titleIn(scope){return [...scope.querySelectorAll('h2,h3')].find(el=>el.textContent?.trim()==='Count Performance')}
  function keyIn(scope){return scope.querySelector('.eval-count-key,.count-key')}

  function normalizePanel(row){
    const grid=row.parentElement;if(!grid)return;
    grid.style.setProperty('display','grid','important');
    grid.style.setProperty('grid-template-columns','1fr','important');
    grid.style.setProperty('gap','7px','important');
    grid.style.setProperty('width','100%','important');
    const scope=row.closest('.eval-count-panel')||grid.parentElement;if(!scope)return;
    const title=titleIn(scope),key=keyIn(scope);if(!title||!key)return;
    let header=scope.querySelector('.hotb-count-header');
    if(!header){header=document.createElement('div');header.className='hotb-count-header';grid.parentNode.insertBefore(header,grid)}
    if(title.parentNode!==header)header.appendChild(title);
    if(key.parentNode!==header)header.appendChild(key);
    header.style.cssText='display:flex!important;align-items:center!important;justify-content:space-between!important;gap:8px!important;width:100%!important;margin:0 0 10px!important;position:static!important;';
    title.style.cssText='margin:0!important;white-space:nowrap!important;line-height:1!important;flex:0 0 auto!important;';
    key.style.cssText=`display:grid!important;grid-template-columns:${STAT_COLS}!important;column-gap:1px!important;align-items:center!important;margin:0 0 0 auto!important;position:static!important;right:auto!important;top:auto!important;width:auto!important;flex:0 0 auto!important;`;
    [...key.children].forEach((el,i)=>{el.style.setProperty('justify-self',i===6?'end':'center','important');el.style.setProperty('white-space','nowrap','important')});
  }

  function fixRow(row){
    const count=row.querySelector(':scope > b');if(!count)return;
    const bucket=(count.textContent||'').trim();if(!BUCKETS.includes(bucket))return;
    normalizePanel(row);
    const type=getComputedStyle(count);
    row.style.cssText+=`display:grid!important;grid-template-columns:minmax(64px,1fr) ${STAT_COLS}!important;align-items:center!important;column-gap:1px!important;width:100%!important;white-space:nowrap!important;min-width:0!important;`;
    count.style.cssText+='grid-column:1!important;white-space:nowrap!important;word-break:keep-all!important;overflow-wrap:normal!important;justify-self:start!important;';
    const values=[...row.children].filter(el=>el!==count),cols=[2,3,4,5,6,7,8];
    values.forEach((el,i)=>{
      el.style.setProperty('grid-column',String(cols[i]),'important');
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
  }
  function sync(){document.querySelectorAll('.count-card,.eval-count-card').forEach(fixRow)}
  function burst(){sync();setTimeout(sync,50);setTimeout(sync,180)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',burst,{once:true});else burst();
  document.addEventListener('click',burst,true);document.addEventListener('change',burst,true);
})();
