(() => {
  const TWO_STRIKE_BUCKETS=new Set(['0-2','1-2','2-2','3-2','6+']);
  const BUCKETS=['0-0','0-2','1-2','2-2','3-2','6+'];
  const VALUE_SELECTOR='.hit,.out,.strikeout,.average,.count-hit,.count-h4o,.count-k,.count-ave,[data-count-stat]';

  function exactText(el,text){return el?.textContent?.trim()===text}
  function bucketElement(card){return [...card.querySelectorAll('b,strong,[data-count-bucket],.count-label,.count')].find(el=>BUCKETS.includes(el.textContent?.trim()))}

  function removeKFromNonTwoStrikeCard(card){
    const bucketEl=bucketElement(card),bucket=bucketEl?.textContent?.trim();
    if(!bucket||TWO_STRIKE_BUCKETS.has(bucket))return;
    const k=card.querySelector('.strikeout,.count-k,[data-count-stat="K"]');
    if(k){const before=k.previousElementSibling;if(exactText(before,'|'))before.remove();k.remove();return}
  }

  function matchValueFontToCount(card){
    const bucketEl=bucketElement(card);if(!bucketEl)return;
    const size=getComputedStyle(bucketEl).fontSize;
    card.querySelectorAll(VALUE_SELECTOR).forEach(el=>el.style.setProperty('font-size',size,'important'));
    [...card.children].forEach(el=>{
      if(el===bucketEl)return;
      const text=(el.textContent||'').trim();
      if(text==='|'||/^\.?\d+(?:\.\d+)?$/.test(text))el.style.setProperty('font-size',size,'important');
    });
  }

  function cards(){
    const found=new Set(document.querySelectorAll('.eval-count-card,.report-count-card,.count-performance-card,.count-card,[data-count-bucket]'));
    document.querySelectorAll('.report-detail *').forEach(el=>{if(bucketElement(el)&&el.children.length>=2)found.add(el)});
    return [...found];
  }

  function sync(){cards().forEach(card=>{removeKFromNonTwoStrikeCard(card);matchValueFontToCount(card)})}
  function queue(){requestAnimationFrame(sync)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',queue,{once:true});else queue();
  document.addEventListener('change',event=>{if(event.target.closest('#evalSelect,#evalSeasonFilter,#evalDateRange,#evalDateStart,#evalDateEnd,.report-detail select'))setTimeout(sync,0)});
  document.addEventListener('click',event=>{if(event.target.closest('[data-heat-result],[data-heat-display],[data-eval-heat-result],[data-eval-heat-display],.report-detail button,.eval-app button'))setTimeout(sync,0)});
})();
