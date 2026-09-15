(() => {
  const STYLE_ID='reports-standard-section-style';

  function ensureStyles(){
    let s=document.getElementById(STYLE_ID);
    if(!s){s=document.createElement('style');s.id=STYLE_ID;document.head.appendChild(s)}
    s.textContent=`
      .report-standard-section{margin:12px 0!important;padding:14px 12px 16px!important;background:#fff!important;border:1px solid #ccc!important;border-radius:14px!important;box-sizing:border-box!important;width:100%!important;max-width:none!important}
      .report-standard-section-title{display:block!important;width:auto!important;margin:0 0 12px!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;color:#111!important;font-size:22px!important;line-height:1.08!important;font-weight:950!important;text-align:left!important;box-shadow:none!important;white-space:nowrap!important}
      .report-standard-section .hotb-count-header{display:block!important;width:100%!important;margin:0 0 12px!important;padding:0!important;border:0!important;background:transparent!important;box-shadow:none!important}
      .report-standard-section .hotb-count-header .report-standard-section-title{margin:0 0 7px!important;font-size:20px!important;white-space:normal!important}
      .report-standard-section .hotb-count-header .count-key,.report-standard-section .hotb-count-header .eval-count-key{display:block!important;position:static!important;transform:none!important;margin:0!important;font-size:14px!important;line-height:1.15!important;white-space:nowrap!important;text-align:left!important}
      .report-standard-section-title-row{display:block!important;width:100%!important;margin:0 0 12px!important}
      .report-standard-section-title-row .report-standard-section-title{margin:0 0 5px!important}
      .report-standard-section-subtitle{display:block!important;position:static!important;transform:none!important;margin:0!important;text-align:left!important;font-size:13px!important;line-height:1.15!important;font-weight:900!important;color:#111!important;white-space:normal!important}
      @media(max-width:560px){.report-standard-section{padding:12px 10px 14px!important;border-radius:12px!important}.report-standard-section-title{font-size:20px!important}}
    `;
  }

  function title(text){return [...document.querySelectorAll('.modal h1,.modal h2,.modal h3,.modal h4,.modal div,.modal span,.modal strong,.modal b')].find(el=>el.children.length===0&&el.textContent.trim().toUpperCase()===text)}
  function commonParent(a,b){if(!a||!b)return null;const p=[];for(let n=a.parentElement;n;n=n.parentElement)p.push(n);return p.find(n=>n.contains(b))||null}
  function directChild(node,parent){let n=node;while(n&&n.parentElement!==parent)n=n.parentElement;return n}

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

  function removeActualMasterBox(){
    const c=title('COUNT PERFORMANCE');if(!c)return;
    const countBox=c.closest('.report-standard-section');if(!countBox)return;
    const modal=countBox.closest('.modal');if(!modal)return;
    let target=null;
    for(let n=countBox.parentElement;n&&n!==modal;n=n.parentElement){
      const hasFilters=!!n.querySelector('select');
      const containsCount=n.contains(countBox);
      const hasSeparateFilterChild=hasFilters&&[...n.children].some(ch=>ch!==countBox&&ch.querySelector?.('select'));
      if(containsCount&&hasSeparateFilterChild){target=n;break}
    }
    if(!target)return;
    target.style.setProperty('border','0','important');
    target.style.setProperty('outline','0','important');
    target.style.setProperty('box-shadow','none','important');
    target.style.setProperty('background','transparent','important');
    target.style.setProperty('border-radius','0','important');
    target.style.setProperty('padding-left','0','important');
    target.style.setProperty('padding-right','0','important');
    target.style.setProperty('width','100%','important');
    target.style.setProperty('max-width','none','important');
    [...target.children].forEach(ch=>{
      if(ch.classList?.contains('report-standard-section')||ch.querySelector?.('select')){
        ch.style.setProperty('width','100%','important');
        ch.style.setProperty('max-width','none','important');
        ch.style.setProperty('box-sizing','border-box','important');
      }
    });
  }

  function apply(){
    ensureStyles();
    const c=title('COUNT PERFORMANCE'),k=title('STRIKEOUTS'),s=title('SPRAY CHART'),h=title('HEAT CHART');
    if(c&&!c.closest('.report-standard-section'))boxBetween(c,k||s||h);
    if(k&&!k.closest('.report-standard-section'))boxBetween(k,s||h);
    if(s&&!s.closest('.report-standard-section'))boxBetween(s,h);
    if(h&&!h.closest('.report-standard-section'))boxBetween(h,null);
    fixCount();fixStrike();plainTitle(s);plainTitle(h);removeActualMasterBox();
  }

  function run(){apply();setTimeout(apply,60);setTimeout(apply,180)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  document.addEventListener('click',run,true);document.addEventListener('change',run,true);
})();
