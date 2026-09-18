(() => {
  
if(new URLSearchParams(location.search).has('portal'))return;
const STYLE_ID='heat-map-standard-style';
  const COLORS={
    ALL:'#101011',BALL:'#3d8c52',FOUL:'#f0c94d',KS:'#cd3a32',KL:'#cd3a32',
    HIT:'#3862db',H4O:'#cd3a32',GB:'#101011',LD:'#101011',FB:'#101011'
  };

  function mixHexWithWhite(hex,amount){
    const n=parseInt(hex.slice(1),16),rgb=[n>>16,(n>>8)&255,n&255];
    const mixed=rgb.map(v=>Math.round(255+(v-255)*amount));
    return `rgb(${mixed.join(',')})`;
  }

  function gameHeatStyles(values,color){
    const distinct=[...new Set(values.filter(v=>v>0))].sort((a,b)=>a-b);
    const n=parseInt(color.slice(1),16);
    const light=((n>>16)*299+((n>>8)&255)*587+(n&255)*114)/1000;
    return values.map(value=>{
      if(!value)return {background:'#edf2ef',color:'#667085'};
      const rank=distinct.indexOf(value);
      const strength=distinct.length===1?1:.15+.85*(rank/(distinct.length-1));
      return {
        background:strength===1?color:mixHexWithWhite(color,strength),
        color:strength>.62&&light<155?'#fff':'#111'
      };
    });
  }

  function ensureStyles(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      /* Reports/Eval use the in-game heat behavior, with more room and cleaner borders. */
      .eval-zone-layout,.report-heat .report-zone-layout{
        width:min(100%,305px)!important;
        max-width:305px!important;
      }
      .eval-zone-layout .zone,.report-heat .report-zone-layout .zone{
        border:2px solid #cdd5d1!important;
        border-radius:7px!important;
        box-shadow:none!important;
      }
      .eval-zone-layout .zone.core,.eval-zone-layout .core-grid>.zone,
      .report-heat .report-zone-layout .zone.core,.report-heat .report-zone-layout .core-grid>.zone{
        border:1px solid #111!important;
        border-radius:4px!important;
        box-shadow:none!important;
      }
      .eval-zone-layout .core-grid,.report-heat .report-zone-layout .core-grid{gap:3px!important}
      .eval-zone-layout .zone .pct,.report-heat .report-zone-layout .zone .pct{
        color:inherit!important;
        text-shadow:0 1px 1px rgba(255,255,255,.24)!important;
      }
    `;
    document.head.appendChild(style);
  }

  function parseValue(zone){
    return Number.parseFloat((zone.querySelector('.pct')?.textContent||'').replace('%',''))||0;
  }

  function apply(root,buttonSelector,zoneSelector){
    const active=root.querySelector(buttonSelector+'.active');
    const result=active?.dataset.evalHeatResult||active?.dataset.heatResult||'ALL';
    const color=COLORS[result]||'#101011';
    const zones=[...root.querySelectorAll(zoneSelector)];
    if(!zones.length)return;
    const values=zones.map(parseValue);
    const styles=gameHeatStyles(values,color);
    zones.forEach((zone,i)=>{
      zone.style.setProperty('background',styles[i].background,'important');
      zone.style.setProperty('color',styles[i].color,'important');
      const pct=zone.querySelector('.pct');
      if(pct)pct.style.setProperty('color',styles[i].color,'important');
    });
  }

  function sync(){
    ensureStyles();
    document.querySelectorAll('.eval-heat-panel').forEach(root=>apply(root,'[data-eval-heat-result]','.eval-zone-layout .zone'));
    document.querySelectorAll('.report-heat').forEach(root=>apply(root,'[data-heat-result]','.report-zone-layout .heat-zone'));
  }

  let queued=false;
  function queue(){
    if(queued)return;
    queued=true;
    requestAnimationFrame(()=>{queued=false;sync()});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',queue,{once:true});
  else queue();
  document.addEventListener('click',event=>{
    if(event.target.closest('[data-eval-heat-result],[data-eval-heat-display],[data-heat-result],[data-heat-display]'))setTimeout(queue,0);
  });
  new MutationObserver(queue).observe(document.documentElement,{childList:true,subtree:true});
})();
