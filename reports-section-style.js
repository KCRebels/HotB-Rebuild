(() => {
  const STYLE_ID='reports-standard-section-style';
  const TARGETS=['COUNT PERFORMANCE','STRIKEOUTS','SPRAY CHART'];

  function ensureStyles(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style');s.id=STYLE_ID;
    s.textContent=`
      .report-standard-section{margin:12px 0!important;padding:14px 12px 16px!important;background:#fff!important;border:1px solid #ccc!important;border-radius:14px!important;box-sizing:border-box!important}
      .report-standard-section-title{display:block!important;width:auto!important;margin:0 0 12px!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;color:#111!important;font-size:22px!important;line-height:1.08!important;font-weight:950!important;text-align:left!important}
      .report-standard-section .hotb-count-header{margin-bottom:10px!important}
      .report-standard-section .hotb-count-header .report-standard-section-title{margin:0!important}
      @media(max-width:560px){.report-standard-section{padding:12px 10px 14px!important;border-radius:12px!important}.report-standard-section-title{font-size:20px!important}}
    `;document.head.appendChild(s);
  }

  function exactTitle(text){
    return [...document.querySelectorAll('.modal h1,.modal h2,.modal h3,.modal h4,.modal div,.modal span,.modal strong,.modal b')]
      .find(el=>el.children.length===0&&el.textContent.trim().toUpperCase()===text);
  }

  function wrap(titleText,nextTitles){
    const title=exactTitle(titleText);if(!title||title.closest('.report-standard-section'))return;
    let start=title.closest('.hotb-count-header')||title;
    const parent=start.parentElement;if(!parent)return;
    const box=document.createElement('section');box.className='report-standard-section';
    parent.insertBefore(box,start);title.classList.add('report-standard-section-title');box.appendChild(start);
    let node=box.nextSibling;
    while(node){
      const next=node.nextSibling;
      if(node.nodeType===1){
        const own=node.children.length===0?node.textContent.trim().toUpperCase():'';
        const nested=[...node.querySelectorAll?.('h1,h2,h3,h4')||[]].some(h=>nextTitles.has(h.textContent.trim().toUpperCase()));
        if(nextTitles.has(own)||nested)break;
      }
      box.appendChild(node);node=next;
    }
  }

  function apply(){
    ensureStyles();
    wrap('COUNT PERFORMANCE',new Set(['STRIKEOUTS','SPRAY CHART']));
    wrap('STRIKEOUTS',new Set(['SPRAY CHART']));
    wrap('SPRAY CHART',new Set());
  }

  function run(){apply();setTimeout(apply,80);setTimeout(apply,250)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  document.addEventListener('click',run,true);document.addEventListener('change',run,true);
})();
