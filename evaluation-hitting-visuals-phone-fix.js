(() => {
  const STYLE_ID='eval-hitting-visuals-phone-fix-style';

  function ensureStyles(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      /* Eval heat chart: keep the four strike-zone cells clean and thin. */
      .eval-zone-layout .zone.core{
        border:1px solid #111 !important;
        border-radius:5px !important;
      }
      .eval-zone-layout .zone .pct{
        font-weight:950 !important;
        text-shadow:none !important;
      }

      /* Count Performance colors. Zero values remain black. */
      .eval-count-key .hit{color:#3862db !important}
      .eval-count-key .out{color:#cd3a32 !important}
      .eval-count-key .strikeout{color:#cd3a32 !important}
      .eval-count-key .average{color:#3d8c52 !important}
      .eval-count-card .hit.zero,
      .eval-count-card .out.zero,
      .eval-count-card .strikeout.zero,
      .eval-count-card .average.zero{color:#111 !important;opacity:1 !important}
      .eval-count-card .hit.positive{color:#3862db !important}
      .eval-count-card .out.positive{color:#cd3a32 !important}
      .eval-count-card .strikeout.positive{color:#cd3a32 !important}
      .eval-count-card .average.positive{color:#3d8c52 !important}
    `;
    document.head.appendChild(style);
  }

  function syncHeatText(){
    ensureStyles();
    const active=document.querySelector('[data-eval-heat-result].active')?.dataset.evalHeatResult||'ALL';
    const foul=active==='FOUL';
    document.querySelectorAll('.eval-zone-layout .zone').forEach(zone=>{
      const pct=zone.querySelector('.pct');
      if(!pct)return;
      const numeric=parseFloat((pct.textContent||'').replace('%',''))||0;
      const color=numeric>0?(foul?'#111':'#fff'):'#667085';
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
