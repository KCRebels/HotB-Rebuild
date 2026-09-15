(() => {
  const BUCKETS=['0-0','0-2','1-2','2-2','3-2','6+'];
  const VALUE_SELECTOR='.hit,.out,.strikeout,.average,.count-hit,.count-h4o,.count-k,.count-ave,[data-count-stat]';

  function bucketElement(card){return [...card.querySelectorAll('b,strong,[data-count-bucket],.count-label,.count')].find(el=>BUCKETS.includes(el.textContent?.trim()))}

  function setZeroZeroK(card,bucketEl){
    if(bucketEl?.textContent?.trim()!=='0-0')return;
    const k=card.querySelector('.strikeout,.count-k,[data-count-stat="K"]');
    if(k){k.textContent='X';k.classList.remove('positive','zero');k.style.setProperty('color','#111','important');return}
    const children=[...card.children],bucketIndex=children.indexOf(bucketEl);
    const separators=children.filter((el,i)=>i>bucketIndex&&el.textContent?.trim()==='|');
    if(separators.length>=2){const afterSecond=separators[1].nextElementSibling;if(afterSecond)afterSecond.textContent='X'}
  }

  function matchTypographyToCount(card){
    const bucketEl=bucketElement(card);if(!bucketEl)return;
    const style=getComputedStyle(bucketEl),size=style.fontSize,weight=style.fontWeight,family=style.fontFamily,lineHeight=style.lineHeight;
    const apply=el=>{el.style.setProperty('font-size',size,'important');el.style.setProperty('font-weight',weight,'important');el.style.setProperty('font-family',family,'important');if(lineHeight&&lineHeight!=='normal')el.style.setProperty('line-height',lineHeight,'important')};
    card.querySelectorAll(VALUE_SELECTOR).forEach(apply);
    [...card.children].forEach(el=>{if(el===bucketEl)return;const text=(el.textContent||'').trim();if(text==='|'||text==='X'||/^\.?\d+(?:\.\d+)?$/.test(text))apply(el)});
    setZeroZeroK(card,bucketEl);
  }

  function cards(){
    const found=new Set(document.querySelectorAll('.eval-count-card,.report-count-card,.count-performance-card,.count-card,[data-count-bucket]'));
    document.querySelectorAll('.report-detail *').forEach(el=>{if(bucketElement(el)&&el.children.length>=2)found.add(el)});
    return [...found];
  }

  function sync(){cards().forEach(matchTypographyToCount)}
  function queue(){requestAnimationFrame(sync)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',queue,{once:true});else queue();
  document.addEventListener('change',event=>{if(event.target.closest('#evalSelect,#evalSeasonFilter,#evalDateRange,#evalDateStart,#evalDateEnd,.report-detail select'))setTimeout(sync,0)});
  document.addEventListener('click',event=>{if(event.target.closest('[data-heat-result],[data-heat-display],[data-eval-heat-result],[data-eval-heat-display],.report-detail button,.eval-app button'))setTimeout(sync,0)});
})();
