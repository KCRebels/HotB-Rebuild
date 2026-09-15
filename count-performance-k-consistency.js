(() => {
  const BUCKETS=['0-0','0-2','1-2','2-2','3-2','6+'];
  const COLS='72px 1fr 34px 12px 52px 12px 34px 12px 82px';

  function findTitle(scope){return [...scope.querySelectorAll('h2,h3')].find(el=>el.textContent?.trim()==='Count Performance')}
  function findKey(scope){return scope.querySelector('.eval-count-key,.count-key')}

  function makeHeader(scope,grid){
    const title=findTitle(scope),key=findKey(scope);
    if(!title||!key||!grid)return;
    let header=scope.querySelector(':scope > .hotb-count-header');
    if(!header){
      header=document.createElement('div');
      header.className='hotb-count-header';
      grid.parentNode.insertBefore(header,grid);
    }
    if(title.parentNode!==header)header.appendChild(title);
    if(key.parentNode!==header)header.appendChild(key);
    header.style.cssText='display:grid!important;grid-template-columns:72px 1fr 34px 12px 52px 12px 34px 12px 82px!important;align-items:center!important;column-gap:3px!important;width:100%!important;margin:0 0 10px!important;position:static!important;';
    title.style.cssText='grid-column:1 / 3!important;margin:0!important;white-space:nowrap!important;line-height:1.05!important;';
    key.style.cssText='grid-column:3 / 10!important;display:grid!important;grid-template-columns:34px 12px 52px 12px 34px 12px 82px!important;column-gap:3px!important;align-items:center!important;margin:0!important;position:static!important;right:auto!important;top:auto!important;width:100%!important;';
    [...key.children].forEach((el,i)=>{el.style.setProperty('justify-self',i===6?'end':'center','important');el.style.setProperty('white-space','nowrap','important')});
  }

  function fixGroup(row){
    const grid=row.parentElement;if(!grid)return;
    grid.style.setProperty('display','grid','important');
    grid.style.setProperty('grid-template-columns','1fr','important');
    grid.style.setProperty('gap','7px','important');
    grid.style.setProperty('width','100%','important');
    const scope=row.closest('.eval-count-panel')||grid.parentElement;
    makeHeader(scope,grid);
  }

  function fixRow(row){
    const count=row.querySelector(':scope > b');if(!count)return;
    const bucket=(count.textContent||'').trim();if(!BUCKETS.includes(bucket))return;
    const type=getComputedStyle(count);
    fixGroup(row);
    row.style.cssText+='display:grid!important;grid-template-columns:'+COLS+'!important;align-items:center!important;column-gap:3px!important;width:100%!important;white-space:nowrap!important;min-width:0!important;';
    count.style.cssText+='grid-column:1!important;white-space:nowrap!important;word-break:keep-all!important;overflow-wrap:normal!important;justify-self:start!important;';
    const values=[...row.children].filter(el=>el!==count),columns=[3,4,5,6,7,8,9];
    values.forEach((el,i)=>{
      el.style.setProperty('grid-column',String(columns[i]),'important');
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
