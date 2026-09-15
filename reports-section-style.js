(() => {
  const STYLE_ID='reports-clean-layout-style';

  function styles(){
    let s=document.getElementById(STYLE_ID);
    if(!s){s=document.createElement('style');s.id=STYLE_ID;document.head.appendChild(s)}
    s.textContent=`
      html,body,#app{max-width:100%;overflow-x:hidden!important}
      .modal-backdrop,.modal{max-width:100vw!important;overflow-x:hidden!important}
      .modal .report-detail{margin:14px 0 0!important;padding:0!important;border:0!important;border-radius:0!important;box-shadow:none!important;background:transparent!important;width:100%!important;max-width:100%!important;overflow-x:hidden!important;box-sizing:border-box!important}
      .report-filter-box{margin:0 8px 12px!important;padding:14px 12px!important;background:#fff!important;border:1px solid #ccc!important;border-radius:14px!important;box-sizing:border-box!important;width:calc(100% - 16px)!important;max-width:calc(100% - 16px)!important}
      .report-filter-box .report-filter-grid{margin-top:0!important}

      .modal .report-detail>.report-stat-grid{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:6px!important;margin:12px 8px 14px!important;width:calc(100% - 16px)!important;max-width:calc(100% - 16px)!important;box-sizing:border-box!important;overflow:hidden!important}
      .modal .report-detail>.report-stat-grid>.report-stat{width:auto!important;min-width:0!important;max-width:100%!important;min-height:0!important;height:68px!important;aspect-ratio:auto!important;padding:8px 2px!important;box-sizing:border-box!important}
      .modal .report-detail>.report-stat-grid>.report-stat b{font-size:23px!important;line-height:1!important;white-space:nowrap!important}
      .modal .report-detail>.report-stat-grid>.report-stat span{font-size:13px!important;line-height:1.05!important;white-space:nowrap!important}

      .report-standard-section{margin:12px 8px!important;padding:14px 12px 16px!important;background:#fff!important;border:1px solid #ccc!important;border-radius:14px!important;box-sizing:border-box!important;width:calc(100% - 16px)!important;max-width:calc(100% - 16px)!important;overflow-x:hidden!important}
      .report-standard-section *{max-width:100%;box-sizing:border-box}
      .report-standard-section-title{display:block!important;width:auto!important;margin:0 0 12px!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;color:#111!important;font-size:22px!important;line-height:1.08!important;font-weight:950!important;text-align:left!important;box-shadow:none!important}

      .report-standard-section .hotb-count-header{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:8px!important;width:100%!important;max-width:100%!important;margin:0 0 10px!important;padding:0!important;overflow:hidden!important}
      .report-standard-section .hotb-count-header .report-standard-section-title{margin:0!important;white-space:nowrap!important;flex:0 1 auto!important;min-width:0!important}
      .report-standard-section .hotb-count-header .count-key,.report-standard-section .hotb-count-header .eval-count-key{display:inline-flex!important;align-items:center!important;gap:0!important;margin-left:auto!important;width:auto!important;white-space:nowrap!important;flex:0 1 auto!important;font-size:16px!important;min-width:0!important}
      .report-standard-section .count-grid{display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:7px!important;width:100%!important;max-width:100%!important}
      .report-standard-section .count-card{min-height:58px!important;width:100%!important;max-width:100%!important;min-width:0!important}

      .report-strike-heading{display:flex!important;align-items:baseline!important;gap:10px!important;flex-wrap:wrap!important;margin:0 0 12px!important;max-width:100%!important}
      .report-strike-heading .report-standard-section-title{margin:0!important}
      .report-strike-subtitle{font-size:15px!important;line-height:1.1!important;font-weight:900!important;color:#111!important}
      .report-spray-box,.report-spray-field,.report-heat{max-width:100%!important;box-sizing:border-box!important;overflow-x:hidden!important}

      @media(max-width:560px){
        .report-standard-section{margin:12px 8px!important;padding:12px 10px 14px!important;border-radius:12px!important}
        .report-standard-section-title{font-size:20px!important}
        .report-standard-section .hotb-count-header .count-key,.report-standard-section .hotb-count-header .eval-count-key{font-size:13px!important}
        .report-strike-subtitle{font-size:14px!important}
      }
      @media(max-width:390px){
        .modal .report-detail>.report-stat-grid{gap:4px!important}
        .modal .report-detail>.report-stat-grid>.report-stat b{font-size:21px!important}
        .modal .report-detail>.report-stat-grid>.report-stat span{font-size:12px!important}
        .report-standard-section .hotb-count-header .report-standard-section-title{font-size:18px!important}
        .report-standard-section .hotb-count-header .count-key,.report-standard-section .hotb-count-header .eval-count-key{font-size:12px!important}
      }
    `;
  }

  function leafTitle(root,text){
    return [...root.querySelectorAll('h1,h2,h3,h4,div,span,strong,b')].find(el=>el.children.length===0&&el.textContent.trim().toUpperCase()===text);
  }

  function unwrapOld(d){
    [...d.querySelectorAll(':scope > .report-filter-box')].forEach(box=>{while(box.firstChild)d.insertBefore(box.firstChild,box);box.remove()});
    [...d.querySelectorAll(':scope > .report-count-section,:scope > .report-standard-section')].forEach(box=>{while(box.firstChild)d.insertBefore(box.firstChild,box);box.remove()});
  }

  function filterBox(d){
    const stat=d.querySelector(':scope > .report-stat-grid');if(!stat)return;
    const first=d.firstElementChild;if(!first||first===stat)return;
    const box=document.createElement('section');box.className='report-filter-box';d.insertBefore(box,first);
    let n=first;while(n&&n!==stat){const next=n.nextElementSibling;box.appendChild(n);n=next}
  }

  function directChild(node,parent){let n=node;while(n&&n.parentElement!==parent)n=n.parentElement;return n}

  function wrapRange(d,startNode,stopNode){
    if(!startNode)return null;
    const start=directChild(startNode,d),stop=stopNode?directChild(stopNode,d):null;if(!start)return null;
    const box=document.createElement('section');box.className='report-standard-section';d.insertBefore(box,start);
    let n=start;while(n&&n!==stop){const next=n.nextSibling;box.appendChild(n);n=next}
    return box;
  }

  function normalizeTitle(el){if(!el)return;el.classList.add('report-standard-section-title');el.style.cssText='';}

  function fixCount(box){
    if(!box)return;
    const title=leafTitle(box,'COUNT PERFORMANCE')||[...box.querySelectorAll('h2,h3')].find(e=>e.textContent.trim().toUpperCase()==='COUNT PERFORMANCE');
    if(!title)return;normalizeTitle(title);
    const key=box.querySelector('.eval-count-key,.count-key');
    if(!key)return;
    let header=title.closest('.hotb-count-header');
    if(!header){header=document.createElement('div');header.className='hotb-count-header';title.parentNode.insertBefore(header,title);header.append(title,key)}
    else if(key.parentElement!==header)header.appendChild(key);
    header.style.cssText='';title.style.cssText='';key.style.cssText='';
  }

  function fixStrike(box){
    if(!box)return;
    const title=leafTitle(box,'STRIKEOUTS');if(!title)return;normalizeTitle(title);
    const subtitle=[...box.querySelectorAll('div,span,strong,b,p')].find(el=>el!==title&&!el.contains(title)&&/^\(\d+\)\s*\(COUNT\)\s*\(TOTAL PITCHES\)$/i.test(el.textContent.trim()));
    if(!subtitle)return;
    let row=title.parentElement?.classList.contains('report-strike-heading')?title.parentElement:null;
    if(!row){row=document.createElement('div');row.className='report-strike-heading';title.parentNode.insertBefore(row,title);row.append(title,subtitle)}
    subtitle.classList.add('report-strike-subtitle');subtitle.style.cssText='';
  }

  function clean(){
    styles();
    const d=document.querySelector('.modal .report-detail');if(!d)return;
    d.classList.remove('panel');d.removeAttribute('style');
    unwrapOld(d);filterBox(d);

    const count=leafTitle(d,'COUNT PERFORMANCE');
    const strike=leafTitle(d,'STRIKEOUTS');
    const spray=leafTitle(d,'SPRAY CHART');
    const heat=leafTitle(d,'HEAT CHART');

    const countBox=wrapRange(d,count,strike||spray||heat);
    const strikeBox=wrapRange(d,strike,spray||heat);
    const sprayBox=wrapRange(d,spray,heat);
    const heatBox=wrapRange(d,heat,null);

    fixCount(countBox);fixStrike(strikeBox);
    [sprayBox,heatBox].forEach(box=>{if(!box)return;const t=[...box.querySelectorAll('h1,h2,h3,h4,div,span,strong,b')].find(el=>el.children.length===0&&['SPRAY CHART','HEAT CHART'].includes(el.textContent.trim().toUpperCase()));normalizeTitle(t)});
  }

  function run(){clean();setTimeout(clean,80);setTimeout(clean,220)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  document.addEventListener('click',run,true);document.addEventListener('change',run,true);
})();
