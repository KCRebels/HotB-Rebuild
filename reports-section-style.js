(() => {
  const STYLE_ID='reports-standard-section-style';

  function ensureStyles(){
    let s=document.getElementById(STYLE_ID);
    if(!s){s=document.createElement('style');s.id=STYLE_ID;document.head.appendChild(s)}
    s.textContent=`
      .modal .panel.report-detail{background:transparent!important;border:0!important;outline:0!important;border-radius:0!important;box-shadow:none!important;padding:0!important;margin:0!important;width:100%!important;max-width:none!important;overflow:visible!important}
      .report-filter-box{margin:14px 8px 12px!important;padding:14px 12px!important;background:#fff!important;border:1px solid #ccc!important;border-radius:14px!important;box-sizing:border-box!important;width:calc(100% - 16px)!important;max-width:none!important}
      .report-filter-box .report-filter-grid{margin-top:0!important}
      .report-filter-box .games-selector,.report-filter-box #showReportGames{margin-bottom:0!important}

      .modal .report-detail>.report-stat-grid{display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:8px!important;margin:12px 8px 14px!important;width:calc(100% - 16px)!important;max-width:none!important;box-sizing:border-box!important;overflow:visible!important}
      .modal .report-detail>.report-stat-grid .report-stat{box-sizing:border-box!important;width:auto!important;min-width:0!important;max-width:none!important;min-height:96px!important;padding:12px 4px!important}
      .modal .report-detail>.report-stat-grid .report-stat b{font-size:26px!important;line-height:1!important;white-space:nowrap!important}
      .modal .report-detail>.report-stat-grid .report-stat span{font-size:15px!important;line-height:1.05!important;white-space:nowrap!important}

      .report-standard-section{margin:12px 8px!important;padding:16px 12px 18px!important;background:#fff!important;border:1px solid #ccc!important;border-radius:14px!important;box-sizing:border-box!important;width:calc(100% - 16px)!important;max-width:none!important}
      .report-standard-section-title{display:block!important;width:auto!important;margin:0 0 14px!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;color:#111!important;font-size:20px!important;line-height:1.08!important;font-weight:950!important;text-align:left!important;box-shadow:none!important;white-space:nowrap!important}
      .report-standard-section .hotb-count-header{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;align-items:center!important;column-gap:8px!important;width:100%!important;margin:0 0 14px!important;padding:0!important;border:0!important;background:transparent!important;box-shadow:none!important}
      .report-standard-section .hotb-count-header .report-standard-section-title{margin:0!important;min-width:0!important;white-space:nowrap!important;font-size:18px!important}
      .report-standard-section .hotb-count-header .count-key,.report-standard-section .hotb-count-header .eval-count-key{display:inline-flex!important;align-items:center!important;position:static!important;transform:none!important;margin:0!important;justify-self:end!important;width:auto!important;white-space:nowrap!important;min-width:0!important;font-size:13px!important;line-height:1!important}
      .report-standard-section .hotb-count-row{min-height:58px!important;padding:10px 12px!important}
      .report-standard-section-title-row{display:block!important;width:100%!important;margin:0 0 12px!important}
      .report-standard-section-title-row .report-standard-section-title{margin:0 0 5px!important}
      .report-standard-section-subtitle{display:block!important;position:static!important;transform:none!important;margin:0!important;text-align:left!important;font-size:13px!important;line-height:1.15!important;font-weight:900!important;color:#111!important;white-space:normal!important}

      @media(max-width:560px){
        .report-filter-box{margin:12px 8px!important;padding:12px 10px!important;border-radius:12px!important}
        .modal .report-detail>.report-stat-grid{grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:5px!important;margin:12px 8px 14px!important;width:calc(100% - 16px)!important}
        .modal .report-detail>.report-stat-grid .report-stat{min-height:92px!important;padding:10px 2px!important}
        .modal .report-detail>.report-stat-grid .report-stat b{font-size:23px!important}
        .modal .report-detail>.report-stat-grid .report-stat span{font-size:13px!important}
        .report-standard-section{margin:12px 8px!important;padding:14px 10px 16px!important;border-radius:12px!important;width:calc(100% - 16px)!important}
        .report-standard-section-title{font-size:20px!important}
        .report-standard-section .hotb-count-header{column-gap:6px!important}
        .report-standard-section .hotb-count-header .report-standard-section-title{font-size:17px!important}
        .report-standard-section .hotb-count-header .count-key,.report-standard-section .hotb-count-header .eval-count-key{font-size:12px!important}
      }
    `;
  }

  function title(text){return [...document.querySelectorAll('.modal h1,.modal h2,.modal h3,.modal h4,.modal div,.modal span,.modal strong,.modal b')].find(el=>el.children.length===0&&el.textContent.trim().toUpperCase()===text)}
  function commonParent(a,b){if(!a||!b)return null;const p=[];for(let n=a.parentElement;n;n=n.parentElement)p.push(n);return p.find(n=>n.contains(b))||null}
  function directChild(node,parent){let n=node;while(n&&n.parentElement!==parent)n=n.parentElement;return n}

  function buildFilterBox(){
    const detail=document.querySelector('.modal .report-detail');if(!detail)return;
    const statGrid=detail.querySelector(':scope > .report-stat-grid');if(!statGrid)return;
    let box=detail.querySelector(':scope > .report-filter-box');
    if(!box){
      const first=detail.firstElementChild;if(!first||first===statGrid)return;
      box=document.createElement('section');box.className='report-filter-box';detail.insertBefore(box,first);
      let n=first;while(n&&n!==statGrid){const next=n.nextElementSibling;box.appendChild(n);n=next}
    }
    /* Never allow the stat grid or report sections inside the filter box. */
    const trapped=[...box.querySelectorAll(':scope > .report-stat-grid,:scope > .report-standard-section')];
    trapped.forEach(n=>detail.insertBefore(n,box.nextSibling));
  }

  function boxBetween(startTitle,endTitle){
    if(!startTitle)return;
    const root=endTitle?commonParent(startTitle,endTitle):startTitle.closest('.modal');if(!root)return;
    const start=directChild(startTitle.closest('.hotb-count-header')||startTitle,root),stop=endTitle?directChild(endTitle.closest('.hotb-count-header')||endTitle,root):null;if(!start)return;
    const nodes=[];for(let n=start;n&&n!==stop;n=n.nextSibling)nodes.push(n);if(!nodes.length||start.closest('.report-standard-section'))return;
    const box=document.createElement('section');box.className='report-standard-section';root.insertBefore(box,start);nodes.forEach(n=>box.appendChild(n));startTitle.classList.add('report-standard-section-title');
  }

  function plainTitle(el){if(el)el.classList.add('report-standard-section-title')}

  function fixCount(){
    const c=title('COUNT PERFORMANCE');if(!c)return;plainTitle(c);
    const header=c.closest('.hotb-count-header');if(!header)return;
    const key=[...header.querySelectorAll('div,span,strong,b')].find(el=>el!==c&&!el.contains(c)&&/H4O/.test(el.textContent||'')&&/AVE/.test(el.textContent||''));
    if(key)key.classList.add('count-key');
  }

  function fixStrike(){
    const k=title('STRIKEOUTS');if(!k)return;plainTitle(k);
    const box=k.closest('.report-standard-section');if(!box)return;
    if(k.parentElement?.classList.contains('report-standard-section-title-row'))return;
    const subtitle=[...box.querySelectorAll('span,div,b,strong,p')].find(el=>el!==k&&!el.contains(k)&&/^\(\d+\)\s*\(COUNT\)\s*\(TOTAL PITCHES\)$/i.test(el.textContent.trim()));
    if(!subtitle)return;
    const row=document.createElement('div');row.className='report-standard-section-title-row';k.parentNode.insertBefore(row,k);row.appendChild(k);row.appendChild(subtitle);subtitle.classList.add('report-standard-section-subtitle');
  }

  function apply(){
    ensureStyles();buildFilterBox();
    const c=title('COUNT PERFORMANCE'),k=title('STRIKEOUTS'),s=title('SPRAY CHART'),h=title('HEAT CHART');
    if(c&&!c.closest('.report-standard-section'))boxBetween(c,k||s||h);
    if(k&&!k.closest('.report-standard-section'))boxBetween(k,s||h);
    if(s&&!s.closest('.report-standard-section'))boxBetween(s,h);
    if(h&&!h.closest('.report-standard-section'))boxBetween(h,null);
    fixCount();fixStrike();plainTitle(s);plainTitle(h);
  }

  function run(){apply();setTimeout(apply,60);setTimeout(apply,180)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  document.addEventListener('click',run,true);document.addEventListener('change',run,true);
})();
