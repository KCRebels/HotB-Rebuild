(() => {
  const STYLE_ID='reports-standard-section-style';

  function ensureStyles(){
    let s=document.getElementById(STYLE_ID);
    if(!s){s=document.createElement('style');s.id=STYLE_ID;document.head.appendChild(s)}
    s.textContent=`
      .reports-sections-root{background:transparent!important;border:0!important;border-radius:0!important;box-shadow:none!important;padding:0!important;margin:0!important;width:100%!important;max-width:none!important}
      .report-standard-section{margin:12px 0!important;padding:14px 12px 16px!important;background:#fff!important;border:1px solid #ccc!important;border-radius:14px!important;box-sizing:border-box!important;width:100%!important;max-width:none!important}
      .report-standard-section-title{display:block!important;width:auto!important;margin:0 0 12px!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;color:#111!important;font-size:22px!important;line-height:1.08!important;font-weight:950!important;text-align:left!important;box-shadow:none!important;white-space:nowrap!important}
      .report-standard-section .hotb-count-header{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:10px!important;width:100%!important;margin:0 0 12px!important;padding:0!important;border:0!important;background:transparent!important;box-shadow:none!important}
      .report-standard-section .hotb-count-header .report-standard-section-title{margin:0!important;flex:0 1 auto!important;min-width:0!important}
      .report-standard-section .hotb-count-header .count-key,.report-standard-section .hotb-count-header .eval-count-key{margin-left:auto!important;flex:0 0 auto!important;font-size:16px!important;white-space:nowrap!important}
      .report-standard-section-title-row{display:flex!important;align-items:flex-start!important;gap:10px!important;width:100%!important;margin:0 0 12px!important}
      .report-standard-section-title-row .report-standard-section-title{margin:0!important;flex:0 0 auto!important}
      .report-standard-section-subtitle{margin:1px 0 0!important;flex:1 1 auto!important;text-align:left!important;font-size:14px!important;line-height:1.15!important;font-weight:900!important;color:#111!important;white-space:normal!important;min-width:0!important}
      @media(max-width:560px){
        .report-standard-section{padding:12px 10px 14px!important;border-radius:12px!important}
        .report-standard-section-title{font-size:20px!important}
        .report-standard-section .hotb-count-header .count-key,.report-standard-section .hotb-count-header .eval-count-key{font-size:14px!important}
        .report-standard-section-subtitle{font-size:13px!important}
      }
    `;
  }

  function title(text){
    return [...document.querySelectorAll('.modal h1,.modal h2,.modal h3,.modal h4,.modal div,.modal span,.modal strong,.modal b')]
      .find(el=>el.children.length===0&&el.textContent.trim().toUpperCase()===text);
  }

  function commonParent(a,b){
    if(!a||!b)return null;
    const parents=[];for(let n=a.parentElement;n;n=n.parentElement)parents.push(n);
    return parents.find(n=>n.contains(b))||null;
  }

  function directChild(node,parent){let n=node;while(n&&n.parentElement!==parent)n=n.parentElement;return n}

  function boxBetween(startTitle,endTitle){
    if(!startTitle)return;
    const root=endTitle?commonParent(startTitle,endTitle):startTitle.closest('.modal');if(!root)return;
    root.classList.add('reports-sections-root');
    const start=directChild(startTitle.closest('.hotb-count-header')||startTitle,root);
    const stop=endTitle?directChild(endTitle.closest('.hotb-count-header')||endTitle,root):null;if(!start)return;
    const nodes=[];for(let n=start;n&&n!==stop;n=n.nextSibling)nodes.push(n);if(!nodes.length)return;
    const existing=start.closest('.report-standard-section');if(existing)return;
    const box=document.createElement('section');box.className='report-standard-section';root.insertBefore(box,start);nodes.forEach(n=>box.appendChild(n));startTitle.classList.add('report-standard-section-title');
  }

  function plainTitle(el){if(!el)return;el.classList.add('report-standard-section-title')}

  function fixCount(){
    const c=title('COUNT PERFORMANCE');if(!c)return;plainTitle(c);
    const header=c.closest('.hotb-count-header');if(!header)return;
    header.style.setProperty('display','flex','important');header.style.setProperty('align-items','center','important');header.style.setProperty('justify-content','space-between','important');header.style.setProperty('gap','10px','important');
  }

  function fixStrike(){
    const k=title('STRIKEOUTS');if(!k)return;plainTitle(k);
    const box=k.closest('.report-standard-section');if(!box)return;
    if(k.parentElement?.classList.contains('report-standard-section-title-row'))return;
    const subtitle=[...box.querySelectorAll('span,div,b,strong,p')].find(el=>el!==k&&!el.contains(k)&&/^\(\d+\)\s*\(COUNT\)\s*\(TOTAL PITCHES\)$/i.test(el.textContent.trim()));
    if(!subtitle)return;
    const row=document.createElement('div');row.className='report-standard-section-title-row';k.parentNode.insertBefore(row,k);row.appendChild(k);row.appendChild(subtitle);subtitle.classList.add('report-standard-section-subtitle');
  }

  function removeLargeOuterBox(){
    const sections=[...document.querySelectorAll('.report-standard-section')];if(!sections.length)return;
    let parent=sections[0].parentElement;if(!parent||!sections.every(x=>x.parentElement===parent))return;
    parent.classList.add('reports-sections-root');
  }

  function apply(){
    ensureStyles();
    const c=title('COUNT PERFORMANCE'),k=title('STRIKEOUTS'),s=title('SPRAY CHART'),h=title('HEAT CHART');
    if(c&&!c.closest('.report-standard-section'))boxBetween(c,k||s||h);
    if(k&&!k.closest('.report-standard-section'))boxBetween(k,s||h);
    if(s&&!s.closest('.report-standard-section'))boxBetween(s,h);
    if(h&&!h.closest('.report-standard-section'))boxBetween(h,null);
    fixCount();fixStrike();plainTitle(s);plainTitle(h);removeLargeOuterBox();
  }

  function run(){apply();setTimeout(apply,60);setTimeout(apply,180)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  document.addEventListener('click',run,true);document.addEventListener('change',run,true);
})();
