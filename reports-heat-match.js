(() => {
  const STYLE_ID = 'reports-heat-match-style';
  const COLORS = {
    ALL: '#101011',
    BALL: '#3d8c52',
    FOUL: '#f0c94d',
    KS: '#cd3a32',
    KL: '#cd3a32',
    HIT: '#3862db',
    H4O: '#cd3a32'
  };

  function ensureStyles(){
    if(document.getElementById(STYLE_ID)) return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .report-heat .heat-key{display:none!important}
      .report-heat .heat-result-filters{display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr));gap:4px!important;margin:10px 0 8px}
      .report-heat .heat-result-filters button{min-width:0!important;min-height:48px!important;padding:8px 2px!important;border:3px solid rgba(0,0,0,.18)!important;border-radius:10px!important;background:#fff!important;color:#111!important;font-size:17px!important;line-height:1!important;font-weight:950!important}
      .report-heat .heat-result-filters button[data-heat-result="ALL"]{background:#101011!important;color:#fff!important}
      .report-heat .heat-result-filters button[data-heat-result="BALL"]{background:#3d8c52!important;color:#fff!important}
      .report-heat .heat-result-filters button[data-heat-result="FOUL"]{background:#f0c94d!important;color:#111!important}
      .report-heat .heat-result-filters button[data-heat-result="KS"],
      .report-heat .heat-result-filters button[data-heat-result="KL"],
      .report-heat .heat-result-filters button[data-heat-result="H4O"]{background:#cd3a32!important;color:#fff!important}
      .report-heat .heat-result-filters button[data-heat-result="HIT"]{background:#3862db!important;color:#fff!important}
      .report-heat .heat-result-filters button.active{outline:3px solid #efc52f!important;outline-offset:1px!important;box-shadow:inset 0 0 0 2px #fff!important}
      .report-heat .report-zone-layout{width:min(100%,305px)!important;max-width:305px!important;margin:8px auto 0!important}
      .report-detail .report-zone-layout .zone .pct{font-size:24px!important}

      .report-detail .report-stat{padding:16px 8px!important}
      .report-detail .report-stat b{font-size:28px!important;line-height:1!important}
      .report-detail .report-stat span{font-size:14px!important;line-height:1.1!important;margin-top:8px!important}
      .report-detail .count-performance-title .count-key,
      .report-detail .count-performance-title .count-separator{font-size:24px!important;line-height:1!important}
      .report-section-label,
      .report-heat>h3{display:block;width:max-content;max-width:100%;margin:26px 0 12px!important;padding:13px 16px;border-radius:11px;background:#111;color:#fff;font-size:20px!important;line-height:1.1;font-weight:900;letter-spacing:.2px}
      .report-spray-box{margin-top:0!important}

      @media(max-width:560px){
        .report-heat .heat-result-filters button{min-height:40px!important;padding:4px 1px!important;border-width:3px!important;border-radius:8px!important;font-size:16px!important}
        .report-heat .report-zone-layout{width:min(100%,305px)!important;max-width:305px!important}
        .report-detail .report-zone-layout .zone .pct{font-size:18px!important}
        .report-detail .report-stat{padding:11px 2px!important}
        .report-detail .report-stat b{font-size:20px!important}
        .report-detail .report-stat span{font-size:12px!important;margin-top:6px!important}
        .report-detail .count-performance-title .count-key,
        .report-detail .count-performance-title .count-separator{font-size:17px!important}
        .report-section-label,
        .report-heat>h3{margin:24px 0 10px!important;padding:10px 8px;font-size:16px!important}
      }
    `;
    document.head.appendChild(style);
  }

  function mixHexWithWhite(hex,amount){
    const n=parseInt(hex.slice(1),16);
    const rgb=[n>>16,(n>>8)&255,n&255];
    const mixed=rgb.map(v=>Math.round(255+(v-255)*amount));
    return `rgb(${mixed.join(',')})`;
  }

  function applyGameHeatColors(root){
    const active=root.querySelector('[data-heat-result].active');
    const result=active?.dataset.heatResult||'ALL';
    const color=COLORS[result]||'#101011';
    const zones=[...root.querySelectorAll('.report-zone-layout .heat-zone')];
    if(!zones.length) return;
    const values=zones.map(zone=>Number.parseFloat(zone.querySelector('.pct')?.textContent)||0);
    const distinct=[...new Set(values.filter(v=>v>0))].sort((a,b)=>a-b);
    const n=parseInt(color.slice(1),16);
    const light=((n>>16)*299+((n>>8)&255)*587+(n&255)*114)/1000;
    zones.forEach((zone,index)=>{
      const value=values[index];
      if(!value){
        zone.style.background='#edf2ef';
        zone.style.color='#667085';
        return;
      }
      const rank=distinct.indexOf(value);
      const strength=distinct.length===1?1:.15+.85*(rank/(distinct.length-1));
      zone.style.background=strength===1?color:mixHexWithWhite(color,strength);
      zone.style.color=strength>.62&&light<155?'#fff':'#111';
    });
  }

  function simplifyReport(){
    document.querySelectorAll('.report-outcome-section').forEach(section=>{
      const title=section.querySelector('.report-outcome-heading b')?.textContent?.trim();
      if(title==='BASE HITS'||title==='HITS 4 OUTS') section.remove();
    });

    document.querySelectorAll('.report-spray-box').forEach(box=>{
      const previous=box.previousElementSibling;
      if(previous?.classList.contains('report-section-label')&&previous.textContent==='Spray Chart') return;
      const title=document.createElement('h3');
      title.className='report-section-label';
      title.textContent='Spray Chart';
      box.before(title);
    });

    document.querySelectorAll('.report-heat>h3').forEach(title=>{
      title.textContent='Heat Chart';
    });
  }

  function sync(){
    ensureStyles();
    simplifyReport();
    document.querySelectorAll('.report-heat .heat-key').forEach(key=>key.remove());
    document.querySelectorAll('.report-heat').forEach(applyGameHeatColors);
  }

  let queued=false;
  function queueSync(){
    if(queued) return;
    queued=true;
    requestAnimationFrame(()=>{queued=false;sync()});
  }

  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-heat-result],[data-heat-display]');
    if(!button) return;
    const modal=button.closest('.modal');
    const scrollTop=modal?.scrollTop ?? window.scrollY;
    const heat=button.closest('.report-heat');
    const heatTop=heat?.getBoundingClientRect().top ?? 0;
    setTimeout(()=>{
      const nextModal=document.querySelector('.modal');
      const nextHeat=document.querySelector('.report-heat');
      if(nextModal){
        if(nextHeat){
          const nextHeatTop=nextHeat.getBoundingClientRect().top;
          nextModal.scrollTop += nextHeatTop-heatTop;
        }else nextModal.scrollTop=scrollTop;
      }else window.scrollTo(0,scrollTop);
    },0);
  },true);

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',sync,{once:true});
  else sync();
  new MutationObserver(queueSync).observe(document.documentElement,{childList:true,subtree:true});
})();
