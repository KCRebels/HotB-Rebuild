(() => {
  const BUCKETS=new Set(['0-0','0-2','1-2','2-2','3-2','6+']);
  function bucketElements(){return [...document.querySelectorAll('.eval-count-card b,.report-detail b,.report-detail strong,.report-detail span,.count-label,.count,[data-count-bucket]')].filter(el=>BUCKETS.has((el.textContent||'').trim()))}
  function rowFor(bucket){let row=bucket.parentElement;while(row&&row!==document.body){const text=(row.textContent||'').trim();if((row.children.length>=4||row.querySelectorAll('span,b,strong').length>=4)&&text.length<80)return row;row=row.parentElement}return bucket.parentElement}
  function copyType(source,target){const s=getComputedStyle(source);target.style.setProperty('font-size',s.fontSize,'important');target.style.setProperty('font-weight',s.fontWeight,'important');target.style.setProperty('font-family',s.fontFamily,'important');target.style.setProperty('letter-spacing',s.letterSpacing,'important');if(s.lineHeight!=='normal')target.style.setProperty('line-height',s.lineHeight,'important')}
  function directPieces(row,bucket){return [...row.children].filter(el=>el!==bucket)}
  function numericLeafs(row,bucket){return [...row.querySelectorAll('*')].filter(el=>el!==bucket&&!el.children.length&&(/^\.?\d+(?:\.\d+)?$/.test((el.textContent||'').trim())||(el.textContent||'').trim()==='|'||(el.textContent||'').trim()==='X'))}
  function ensureZeroZeroX(row,bucket){if((bucket.textContent||'').trim()!=='0-0')return;let k=row.querySelector('.strikeout,.count-k,[data-count-stat="K"]');if(k){k.textContent='X';k.classList.remove('positive','zero');k.style.setProperty('color','#111','important');return}const pieces=directPieces(row,bucket),seps=pieces.filter(el=>(el.textContent||'').trim()==='|');if(seps.length===2){const sep=document.createElement('span');sep.textContent='|';const x=document.createElement('span');x.textContent='X';x.className='count-k-placeholder';seps[1].before(sep,x);copyType(bucket,sep);copyType(bucket,x)}else if(seps.length>=3){const candidate=seps[1].nextElementSibling;if(candidate&&candidate!==seps[2]){candidate.textContent='X';candidate.style.setProperty('color','#111','important')}}}
  function fixRow(bucket){const row=rowFor(bucket);if(!row)return;ensureZeroZeroX(row,bucket);const targets=new Set([...directPieces(row,bucket),...numericLeafs(row,bucket)]);targets.forEach(el=>copyType(bucket,el))}
  function sync(){bucketElements().forEach(fixRow)}
  function queue(){requestAnimationFrame(sync)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',queue,{once:true});else queue();
  document.addEventListener('change',e=>{if(e.target.closest('#evalSelect,#evalSeasonFilter,#evalDateRange,#evalDateStart,#evalDateEnd,.report-detail select'))setTimeout(sync,0)});
  document.addEventListener('click',e=>{if(e.target.closest('.eval-app button,.report-detail button,[data-heat-result],[data-heat-display],[data-eval-heat-result],[data-eval-heat-display]'))setTimeout(sync,0)});
})();
