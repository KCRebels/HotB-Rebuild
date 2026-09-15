(() => {
  function fixCountCards(){
    document.querySelectorAll('.eval-count-card').forEach(card=>{
      const bucket=card.querySelector('b')?.textContent?.trim();
      if(bucket!=='0-0')return;
      const k=card.querySelector('.strikeout');
      if(!k)return;
      const before=k.previousElementSibling;
      if(before?.textContent?.trim()==='|')before.remove();
      k.remove();
    });
  }

  let queued=false;
  function queue(){
    if(queued)return;
    queued=true;
    requestAnimationFrame(()=>{queued=false;fixCountCards()});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',queue,{once:true});
  else queue();
  new MutationObserver(queue).observe(document.documentElement,{childList:true,subtree:true});
})();
