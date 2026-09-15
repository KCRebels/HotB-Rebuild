(() => {
  const TWO_STRIKE_BUCKETS=new Set(['0-2','1-2','2-2','3-2','6+']);
  const BUCKETS=['0-0','0-2','1-2','2-2','3-2','6+'];

  function exactText(el,text){return el?.textContent?.trim()===text}
  function bucketElement(card){return [...card.querySelectorAll('b,strong,[data-count-bucket],.count-label,.count')].find(el=>BUCKETS.includes(el.textContent?.trim()))}

  function removeKFromNonTwoStrikeCard(card){
    const bucketEl=bucketElement(card),bucket=bucketEl?.textContent?.trim();
    if(!bucket||TWO_STRIKE_BUCKETS.has(bucket))return;
    const k=card.querySelector('.strikeout,.count-k,[data-count-stat="K"]');
    if(k){const before=k.previousElementSibling;if(exactText(before,'|'))before.remove();k.remove();return}
    const plainK=[...card.children].find(el=>exactText(el,'K'));
    if(plainK){const next=plainK.nextElementSibling,before=plainK.previousElementSibling;if(next&&/^\d+$/.test(next.textContent?.trim()||''))next.remove();if(exactText(before,'|'))before.remove();plainK.remove()}
  }

  function matchValueFontToCount(card){
    const bucketEl=bucketElement(card);if(!bucketEl)return;
    const size=getComputedStyle(bucketEl).fontSize;
    [...card.children].forEach(el=>{if(el!==bucketEl&&el.style.fontSize!==size)el.style.setProperty('font-size',size,'important')});
  }

  function sync(){
    const selectors='.eval-count-card,.report-count-card,.count-performance-card,.count-card,[data-count-bucket]';
    document.querySelectorAll(selectors).forEach(card=>{removeKFromNonTwoStrikeCard(card);matchValueFontToCount(card)});
  }

  // Run only when the relevant screen is rendered or its selection changes.
  // Do not observe the whole document: changing inline styles can feed a MutationObserver
  // and make iPhone taps/navigation unresponsive.
  function queue(){requestAnimationFrame(sync)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',queue,{once:true});else queue();
  document.addEventListener('change',event=>{
    if(event.target.closest('#evalSelect,#evalSeasonFilter,#evalDateRange,#evalDateStart,#evalDateEnd,.report-detail select'))queue();
  });
  document.addEventListener('click',event=>{
    if(event.target.closest('[data-heat-result],[data-heat-display],.report-detail button,.eval-app button'))setTimeout(queue,0);
  });
})();
