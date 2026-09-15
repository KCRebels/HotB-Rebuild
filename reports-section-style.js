(() => {
  const STYLE_ID='reports-standard-section-style';

  function ensureStyles(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style');s.id=STYLE_ID;
    s.textContent=`
      .report-standard-section{margin:12px 0!important;padding:14px 12px 16px!important;background:#fff!important;border:1px solid #ccc!important;border-radius:14px!important;box-sizing:border-box!important;width:100%!important}
      .report-standard-section-title{display:block!important;width:auto!important;margin:0 0 12px!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;color:#111!important;font-size:22px!important;line-height:1.08!important;font-weight:950!important;text-align:left!important}
      .report-standard-section .hotb-count-header{margin:0 0 12px!important}
      .report-standard-section .hotb-count-header .report-standard-section-title{margin:0!important}
      @media(max-width:560px){.report-standard-section{padding:12px 10px 14px!important;border-radius:12px!important}.report-standard-section-title{font-size:20px!important}}
    `;document.head.appendChild(s);
  }

  function leafTitle(text){
    return [...document.querySelectorAll('.modal h1,.modal h2,.modal h3,.modal h4,.modal div,.modal span,.modal strong,.modal b')]
      .find(el=>el.children.length===0&&el.textContent.trim().toUpperCase()===text);
  }

  function topChildWithin(node,ancestor){
    let cur=node;
    while(cur&&cur.parentElement!==ancestor)cur=cur.parentElement;
    return cur;
  }

  function reportContent(){
    const modal=document.querySelector('.modal');
    if(!modal)return null;
    const count=leafTitle('COUNT PERFORMANCE'),strike=leafTitle('STRIKEOUTS'),spray=leafTitle('SPRAY CHART');
    if(!count&&!strike&&!spray)return null;
    let root=(count||strike||spray)?.parentElement;
    while(root&&root!==modal){
      const hasCount=count&&root.contains(count),hasStrike=strike&&root.contains(strike),hasSpray=spray&&root.contains(spray);
      if((hasCount?1:0)+(hasStrike?1:0)+(hasSpray?1:0)>=2)break;
      root=root.parentElement;
    }
    return root&&root!==modal?root:modal;
  }

  function unwrapOld(root){
    root.querySelectorAll('.report-standard-section').forEach(box=>{
      const parent=box.parentElement;
      while(box.firstChild)parent.insertBefore(box.firstChild,box);
      box.remove();
    });
  }

  function wrapRange(root,titleText,nextTitleText){
    const title=leafTitle(titleText);if(!title||!root.contains(title))return;
    const startNode=title.closest('.hotb-count-header')||title;
    const start=topChildWithin(startNode,root);if(!start)return;
    const nextTitle=nextTitleText?leafTitle(nextTitleText):null;
    const stop=nextTitle&&root.contains(nextTitle)?topChildWithin(nextTitle.closest('.hotb-count-header')||nextTitle,root):null;
    const box=document.createElement('section');box.className='report-standard-section';
    root.insertBefore(box,start);title.classList.add('report-standard-section-title');
    let node=start;
    while(node&&node!==stop){const next=node.nextSibling;box.appendChild(node);node=next}
  }

  function apply(){
    ensureStyles();
    const root=reportContent();if(!root)return;
    unwrapOld(root);
    wrapRange(root,'COUNT PERFORMANCE','STRIKEOUTS');
    wrapRange(root,'STRIKEOUTS','SPRAY CHART');
    wrapRange(root,'SPRAY CHART',null);
  }

  let queued=false;
  function run(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply()})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  document.addEventListener('click',run,true);document.addEventListener('change',run,true);
})();
