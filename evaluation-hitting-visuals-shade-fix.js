(() => {
  const STYLE_ID='eval-hitting-visuals-shade-fix-style';

  function ensureStyles(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .eval-zone-layout .zone .pct{
        font-weight:950 !important;
        text-shadow:none !important;
      }
    `;
    document.head.appendChild(style);
  }

  function syncHeatText(){
    ensureStyles();
    const active=document.querySelector('[data-eval-heat-result].active')?.dataset.evalHeatResult||'ALL';
    const foul=active==='FOUL';
    const cells=[...document.querySelectorAll('.eval-zone-layout .zone')].map(zone=>{
      const pct=zone.querySelector('.pct');
      const numeric=pct ? (parseFloat((pct.textContent||'').replace('%',''))||0) : 0;
      return {pct,numeric};
    }).filter(item=>item.pct);

    const positive=[...new Set(cells.map(item=>item.numeric).filter(value=>value>0))].sort((a,b)=>a-b);
    const firstTwo=new Set(positive.slice(0,2));

    cells.forEach(({pct,numeric})=>{
      let color='#667085';
      if(numeric>0){
        if(foul || firstTwo.has(numeric)) color='#111';
        else color='#fff';
      }
      pct.style.setProperty('color',color,'important');
    });
  }

  let queued=false;
  function queue(){
    if(queued)return;
    queued=true;
    requestAnimationFrame(()=>{queued=false;syncHeatText()});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',queue,{once:true});
  else queue();
  document.addEventListener('click',event=>{
    if(event.target.closest('[data-eval-heat-result],[data-eval-heat-display]'))setTimeout(queue,0);
  });
  new MutationObserver(queue).observe(document.documentElement,{childList:true,subtree:true});
})();
