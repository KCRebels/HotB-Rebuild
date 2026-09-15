(() => {
  const BUCKETS=['0-0','0-2','1-2','2-2','3-2','6+'];

  function titleIn(scope){return [...scope.querySelectorAll('h2,h3')].find(el=>el.textContent?.trim()==='Count Performance')}
  function keyIn(scope){return scope.querySelector('.eval-count-key,.count-key')}

  function naturalGroup(el){
    el.style.cssText='display:flex!important;align-items:center!important;justify-content:flex-start!important;gap:0!important;width:auto!important;margin:0 0 0 auto!important;position:static!important;right:auto!important;top:auto!important;white-space:nowrap!important;flex:0 0 auto!important;';
    [...el.children].forEach(child=>{
      child.style.setProperty('display','inline','important');
      child.style.setProperty('width','auto','important');
      child.style.setProperty('min-width','0','important');
      child.style.setProperty('margin','0','important');
      child.style.setProperty('padding','0','important');
      child.style.setProperty('white-space','pre','important');
    });
  }

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
    naturalGroup(key);
  }

  function fixRow(row){
    const count=row.querySelector(':scope > b');if(!count)return;
    const bucket=(count.textContent||'').trim();if(!BUCKETS.includes(bucket))return;
    normalizePanel(row);
    const type=getComputedStyle(count);
    row.style.cssText+='display:flex!important;align-items:center!important;justify-content:space-between!important;gap:8px!important;width:100%!important;white-space:nowrap!important;min-width:0!important;';
    count.style.cssText+='white-space:nowrap!important;word-break:keep-all!important;overflow-wrap:normal!important;flex:0 0 auto!important;margin-right:auto!important;';
    const values=[...row.children].filter(el=>el!==count);
    let group=row.querySelector(':scope > .hotb-count-values');
    if(!group){group=document.createElement('span');group.className='hotb-count-values';values.forEach(el=>group.appendChild(el));row.appendChild(group)}
    naturalGroup(group);
    [...group.children].forEach(el=>{
      el.style.setProperty('font-size',type.fontSize,'important');
      el.style.setProperty('font-weight',type.fontWeight,'important');
      el.style.setProperty('font-family',type.fontFamily,'important');
      el.style.setProperty('letter-spacing',type.letterSpacing,'important');
    });
    if(bucket==='0-0'){
      const k=group.querySelector('.strikeout,.count-k,[data-count-stat="K"]');
      if(k){k.textContent='X';k.classList.remove('zero','positive');k.style.setProperty('color','#111','important')}
    }
  }

  function sync(){document.querySelectorAll('.count-card,.eval-count-card').forEach(fixRow)}
  function burst(){sync();setTimeout(sync,50);setTimeout(sync,180)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',burst,{once:true});else burst();
  document.addEventListener('click',burst,true);document.addEventListener('change',burst,true);
})();
