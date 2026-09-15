(() => {
  const TWO_STRIKE_BUCKETS=new Set(['0-2','1-2','2-2','3-2','6+']);

  function exactText(el,text){return el?.textContent?.trim()===text}

  function removeKFromNonTwoStrikeCard(card){
    const bucketEl=[...card.querySelectorAll('b,strong,[data-count-bucket],.count-label,.count')].find(el=>['0-0','0-2','1-2','2-2','3-2','6+'].includes(el.textContent?.trim()));
    const bucket=bucketEl?.textContent?.trim();
    if(!bucket||TWO_STRIKE_BUCKETS.has(bucket))return;

    const k=card.querySelector('.strikeout,.count-k,[data-count-stat="K"]');
    if(k){
      const before=k.previousElementSibling;
      if(exactText(before,'|'))before.remove();
      k.remove();
      return;
    }

    // Fallback for Count Performance cards that render K as a plain element.
    const plainK=[...card.children].find(el=>exactText(el,'K'));
    if(plainK){
      const next=plainK.nextElementSibling;
      const before=plainK.previousElementSibling;
      if(next && /^\d+$/.test(next.textContent?.trim()||''))next.remove();
      if(exactText(before,'|'))before.remove();
      plainK.remove();
    }
  }

  function sync(){
    const selectors='.eval-count-card,.report-count-card,.count-performance-card,.count-card,[data-count-bucket]';
    document.querySelectorAll(selectors).forEach(removeKFromNonTwoStrikeCard);
  }

  let queued=false;
  function queue(){
    if(queued)return;
    queued=true;
    requestAnimationFrame(()=>{queued=false;sync()});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',queue,{once:true});
  else queue();
  new MutationObserver(queue).observe(document.documentElement,{childList:true,subtree:true});
})();
