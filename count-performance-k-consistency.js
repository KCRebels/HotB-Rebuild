(() => {
  const BUCKETS=['0-0','0-2','1-2','2-2','3-2','6+'];
  const C={h:'#3862db',h4o:'#cd3a32',k:'#cd3a32',ave:'#3d8c52',black:'#111'};
  const mk=(text,color)=>{const s=document.createElement('span');s.textContent=text;s.style.color=color;return s};
  const pipe=()=>mk(' | ',C.black);

  function header(scope){
    const title=[...scope.querySelectorAll('h2,h3')].find(e=>e.textContent?.trim()==='Count Performance');
    const key=scope.querySelector('.eval-count-key,.count-key');
    if(!title||!key)return;
    let wrap=scope.querySelector('.hotb-count-header');
    if(!wrap){wrap=document.createElement('div');wrap.className='hotb-count-header';title.parentNode.insertBefore(wrap,title)}
    wrap.replaceChildren(title,key);
    wrap.style.cssText='display:flex!important;align-items:center!important;justify-content:space-between!important;gap:8px!important;width:100%!important;margin:0 0 10px!important;';
    title.style.cssText='margin:0!important;white-space:nowrap!important;flex:0 0 auto!important;';
    key.replaceChildren(mk('H',C.h),pipe(),mk('H4O',C.h4o),pipe(),mk('K',C.k),pipe(),mk('AVE',C.ave));
    key.style.cssText='display:inline-flex!important;align-items:center!important;gap:0!important;margin-left:auto!important;width:auto!important;white-space:nowrap!important;flex:0 0 auto!important;';
  }

  function rowFix(row){
    const count=row.querySelector(':scope > b'); if(!count)return;
    const bucket=count.textContent.trim(); if(!BUCKETS.includes(bucket))return;
    const grid=row.parentElement,scope=row.closest('.eval-count-panel')||grid?.parentElement;if(!grid||!scope)return;
    grid.style.cssText+='display:grid!important;grid-template-columns:1fr!important;gap:7px!important;width:100%!important;';
    header(scope);

    let group=row.querySelector(':scope > .hotb-count-values');
    const originals=[...row.children].filter(e=>e!==count&&e!==group);
    const raw=(group?[...group.children]:originals).filter(e=>e.textContent.trim()!=='|').map(e=>e.textContent.trim());
    const h=raw[0]||'0', h4o=raw[1]||'0', k=bucket==='0-0'?'X':(raw[2]||'0'), ave=raw[3]||'.000';

    // Remove the original renderer's values so only one stat string remains.
    originals.forEach(e=>e.remove());
    if(!group){group=document.createElement('span');group.className='hotb-count-values';row.appendChild(group)}
    group.replaceChildren(mk(h,+h?C.h:C.black),pipe(),mk(h4o,+h4o?C.h4o:C.black),pipe(),mk(k,k!=='0'&&k!=='X'?C.k:C.black),pipe(),mk(ave,+ave?C.ave:C.black));

    const cs=getComputedStyle(count);
    row.style.cssText+='display:flex!important;align-items:center!important;justify-content:space-between!important;gap:8px!important;width:100%!important;white-space:nowrap!important;';
    count.style.cssText+='margin-right:auto!important;white-space:nowrap!important;flex:0 0 auto!important;';
    group.style.cssText='display:inline-flex!important;align-items:center!important;gap:0!important;margin-left:auto!important;width:auto!important;white-space:nowrap!important;flex:0 0 auto!important;';
    [...group.children].forEach(e=>{e.style.setProperty('font-size',cs.fontSize,'important');e.style.setProperty('font-weight',cs.fontWeight,'important');e.style.setProperty('font-family',cs.fontFamily,'important');e.style.setProperty('margin','0','important');e.style.setProperty('padding','0','important');e.style.setProperty('width','auto','important');e.style.setProperty('flex','none','important')});
  }

  function sync(){document.querySelectorAll('.count-card,.eval-count-card').forEach(rowFix)}
  function run(){sync();setTimeout(sync,80);setTimeout(sync,250)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  document.addEventListener('click',run,true);document.addEventListener('change',run,true);
})();
