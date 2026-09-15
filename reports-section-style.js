(() => {
  const STYLE_ID='reports-standard-section-style';

  function ensureStyles(){
    let s=document.getElementById(STYLE_ID);
    if(!s){s=document.createElement('style');s.id=STYLE_ID;document.head.appendChild(s)}
    s.textContent=`
      .reports-master-unboxed{background:transparent!important;border:0!important;border-radius:0!important;box-shadow:none!important;padding-left:0!important;padding-right:0!important;width:100%!important;max-width:none!important;overflow:visible!important}
      .report-standard-section{margin:12px 0!important;padding:14px 12px 16px!important;background:#fff!important;border:1px solid #ccc!important;border-radius:14px!important;box-sizing:border-box!important;width:100%!important;max-width:none!important}
      .report-standard-section-title{display:block!important;width:auto!important;margin:0 0 12px!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;color:#111!important;font-size:22px!important;line-height:1.08!important;font-weight:950!important;text-align:left!important;box-shadow:none!important;white-space:nowrap!important}
      .report-standard-section .hotb-count-header{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;align-items:center!important;column-gap:12px!important;width:100%!important;margin:0 0 12px!important;padding:0!important;border:0!important;background:transparent!important;box-shadow:none!important}
      .report-standard-section .hotb-count-header .report-standard-section-title{margin:0!important;min-width:0!important;font-size:20px!important}
      .report-standard-section .hotb-count-header .count-key,.report-standard-section .hotb-count-header .eval-count-key{position:static!important;transform:none!important;margin:0!important;justify-self:end!important;font-size:14px!important;white-space:nowrap!important}
      .report-standard-section-title-row{display:grid!important;grid-template-columns:auto minmax(0,1fr)!important;align-items:start!important;column-gap:12px!important;width:100%!important;margin:0 0 12px!important}
      .report-standard-section-title-row .report-standard-section-title{margin:0!important}
      .report-standard-section-subtitle{position:static!important;transform:none!important;margin:1px 0 0!important;text-align:left!important;font-size:13px!important;line-height:1.15!important;font-weight:900!important;color:#111!important;white-space:normal!important;min-width:0!important}
      @media(max-width:560px){
        .report-standard-section{padding:12px 10px 14px!important;border-radius:12px!important}
        .report-standard-section-title{font-size:20px!important}
        .report-standard-section .hotb-count-header{grid-template-columns:1fr!important;row-gap:6px!important}
        .report-standard-section .hotb-count-header .report-standard-section-title{font-size:20px!important}
        .report-standard-section .hotb-count-header .count-key,.report-standard-section .hotb-count-header .eval-count-key{justify-self:start!important;font-size:14px!important}
        .report-standard-section-title-row{grid-template-columns:1fr!important;row-gap:5px!important}
        .report-standard-section-subtitle{font-size:13px!important}
      }
    `;
  }

  function title(text){return [...document.querySelectorAll('.modal h1,.modal h2,.modal h3,.modal h4,.modal div,.modal span,.modal strong,.modal b')].find(el=>el.children.length===0&&el.textContent.trim().toUpperCase()===text)}
  function commonParent(a,b){if(!a||!b)return null;const p=[];for(let n=a.parentElement;n;n=n.parentElement)p.push(n);return p.find(n=>n.contains(b))||null}
  function directChild(node,parent){let n=node;while(n&&n.parentElement!==parent)n=n.parentElement;return n}

  function boxBetween(startTitle,endTitle){
    if(!startTitle)return;
    const root=endTitle?commonParent(startTitle,endTitle):startTitle.closest('.modal');if(!root)return;
    const start=directChild(startTitle.closest('.hotb-count-header')||startTitle,root),stop=endTitle?directChild(endTitle.closest('.hotb-count-header')||endTitle,root):null;if(!start)return;
    const nodes=[];for(let n=start;n&&n!==stop;n=n.nextSibling)nodes.push(n);if(!nodes.length)return;
    if(start.closest('.report-standard-section'))return;
    const box=document.createElement('section');box.className='report-standard-section';root.insertBefore(box,start);nodes.forEach(n=>box.appendChild(n));startTitle.classList.add('report-standard-section-title');
  }

  function plainTitle(el){if(el)el.classList.add('report-standard-section-title')}

  function fixCount(){
    const c=title('COUNT PERFORMANCE');if(!c)return;plainTitle(c);
    const header=c.closest('.hotb-count-header');if(!header)return;
    const key=[...header.children].find(el=>el!==c&&/H4O|AVE/.test(el.textContent||''));
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

  function removeMasterBox(){
    const c=title('COUNT PERFORMANCE');if(!c)return;
    const section=c.closest('.report-standard-section');if(!section)return;
    let n=section.parentElement;
    while(n&&n.classList.contains('report-standard-section'))n=n.parentElement;
    if(!n)return;
    const modal=n.closest('.modal');
    let candidate=n;
    while(candidate&&candidate.parentElement&&candidate.parentElement!==modal){
      const p=candidate.parentElement;
      if(p.querySelector('select')&&p.contains(section)){candidate=p;break}
      candidate=p;
    }
    if(candidate&&candidate!==modal)candidate.classList.add('reports-master-unboxed');
  }

  function apply(){
    ensureStyles();
    const c=title('COUNT PERFORMANCE'),k=title('STRIKEOUTS'),s=title('SPRAY CHART'),h=title('HEAT CHART');
    if(c&&!c.closest('.report-standard-section'))boxBetween(c,k||s||h);
    if(k&&!k.closest('.report-standard-section'))boxBetween(k,s||h);
    if(s&&!s.closest('.report-standard-section'))boxBetween(s,h);
    if(h&&!h.closest('.report-standard-section'))boxBetween(h,null);
    fixCount();fixStrike();plainTitle(s);plainTitle(h);removeMasterBox();
  }

  function run(){apply();setTimeout(apply,60);setTimeout(apply,180)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  document.addEventListener('click',run,true);document.addEventListener('change',run,true);
})();
