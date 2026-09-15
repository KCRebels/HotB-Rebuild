(() => {
  const BUCKETS=['0-0','0-2','1-2','2-2','3-2','6+'];
  const colors={h:'#3862db',h4o:'#cd3a32',k:'#cd3a32',ave:'#3d8c52',black:'#111'};

  function titleIn(scope){return [...scope.querySelectorAll('h2,h3')].find(el=>el.textContent?.trim()==='Count Performance')}
  function keyIn(scope){return scope.querySelector('.eval-count-key,.count-key')}
  function styleGroup(el){
    el.style.cssText='display:inline-flex!important;align-items:center!important;gap:0!important;width:auto!important;min-width:0!important;margin-left:auto!important;white-space:nowrap!important;flex:0 0 auto!important;';
    [...el.children].forEach(c=>{c.style.cssText+='display:inline!important;width:auto!important;min-width:0!important;margin:0!important;padding:0!important;white-space:nowrap!important;flex:none!important;'});
  }
  function span(text,color){const s=document.createElement('span');s.textContent=text;if(color)s.style.color=color;return s}
  function sep(){return span(' | ',colors.black)}

  function normalizeHeader(scope,title,key){
    let header=scope.querySelector('.hotb-count-header');
    if(!header){header=document.createElement('div');header.className='hotb-count-header';title.parentNode.insertBefore(header,title)}
    if(title.parentNode!==header)header.appendChild(title);
    if(key.parentNode!==header)header.appendChild(key);
    header.style.cssText='display:flex!important;align-items:center!important;justify-content:space-between!important;gap:8px!important;width:100%!important;margin:0 0 10px!important;';
    title.style.cssText='margin:0!important;white-space:nowrap!important;line-height:1!important;flex:0 0 auto!important;';
    key.replaceChildren(span('H',colors.h),sep(),span('H4O',colors.h4o),sep(),span('K',colors.k),sep(),span('AVE',colors.ave));
    styleGroup(key);
  }

  function fixRow(row){
    const count=row.querySelector(':scope > b');if(!count)return;
    const bucket=(count.textContent||'').trim();if(!BUCKETS.includes(bucket))return;
    const grid=row.parentElement,scope=row.closest('.eval-count-panel')||grid?.parentElement;if(!grid||!scope)return;
    grid.style.cssText+='display:grid!important;grid-template-columns:1fr!important;gap:7px!important;width:100%!important;';
    const title=titleIn(scope),key=keyIn(scope);if(title&&key)normalizeHeader(scope,title,key);
    const type=getComputedStyle(count);
    row.style.cssText+='display:flex!important;align-items:center!important;justify-content:space-between!important;gap:8px!important;width:100%!important;white-space:nowrap!important;min-width:0!important;';
    count.style.cssText+='white-space:nowrap!important;flex:0 0 auto!important;margin-right:auto!important;';
    let group=row.querySelector(':scope > .hotb-count-values');
    const source=group?[...group.children]:[...row.children].filter(el=>el!==count);
    const vals=source.filter(el=>(el.textContent||'').trim()!=='|').map(el=>(el.textContent||'').trim());
    const h=vals[0]??'0',h4o=vals[1]??'0',k=bucket==='0-0'?'X':(vals[2]??'0'),ave=vals[3]??'.000';
    if(!group){group=document.createElement('span');group.className='hotb-count-values';row.appendChild(group)}
    group.replaceChildren(span(h,Number(h)>0?colors.h:colors.black),sep(),span(h4o,Number(h4o)>0?colors.h4o:colors.black),sep(),span(k,k!=='0'&&k!=='X'?colors.k:colors.black),sep(),span(ave,Number(ave)>0?colors.ave:colors.black));
    styleGroup(group);
    [...group.children].forEach(el=>{el.style.setProperty('font-size',type.fontSize,'important');el.style.setProperty('font-weight',type.fontWeight,'important');el.style.setProperty('font-family',type.fontFamily,'important');el.style.setProperty('letter-spacing',type.letterSpacing,'important')});
  }

  function sync(){document.querySelectorAll('.count-card,.eval-count-card').forEach(fixRow)}
  function burst(){sync();setTimeout(sync,50);setTimeout(sync,180)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',burst,{once:true});else burst();
  document.addEventListener('click',burst,true);document.addEventListener('change',burst,true);
})();
