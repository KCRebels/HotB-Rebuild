(() => {
  const STYLE_ID='reports-standard-section-style';

  function ensureStyles(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');s.id=STYLE_ID;
    s.textContent=`
      .report-standard-section{margin:12px 0!important;padding:14px 12px 16px!important;background:#fff!important;border:1px solid #ccc!important;border-radius:14px!important;box-sizing:border-box!important;width:100%!important}
      .report-standard-section-title{display:block!important;width:auto!important;margin:0 0 12px!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;color:#111!important;font-size:22px!important;line-height:1.08!important;font-weight:950!important;text-align:left!important;box-shadow:none!important}
      .report-standard-section .hotb-count-header{margin:0 0 12px!important;padding:0!important;border:0!important;background:transparent!important;box-shadow:none!important}
      .report-standard-section .hotb-count-header .report-standard-section-title{margin:0!important}
      @media(max-width:560px){.report-standard-section{padding:12px 10px 14px!important;border-radius:12px!important}.report-standard-section-title{font-size:20px!important}}
    `;document.head.appendChild(s);
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

  function directChild(node,parent){
    let n=node;while(n&&n.parentElement!==parent)n=n.parentElement;return n;
  }

  function boxBetween(startTitle,endTitle){
    if(!startTitle)return;
    const root=endTitle?commonParent(startTitle,endTitle):startTitle.closest('.modal');
    if(!root)return;
    let start=directChild(startTitle.closest('.hotb-count-header')||startTitle,root);
    let stop=endTitle?directChild(endTitle.closest('.hotb-count-header')||endTitle,root):null;
    if(!start)return;

    const nodes=[];for(let n=start;n&&n!==stop;n=n.nextSibling)nodes.push(n);
    if(!nodes.length)return;
    const existing=start.closest('.report-standard-section');if(existing)return;
    const box=document.createElement('section');box.className='report-standard-section';
    root.insertBefore(box,start);nodes.forEach(n=>box.appendChild(n));
    startTitle.classList.add('report-standard-section-title');
  }

  function apply(){
    ensureStyles();
    const c=title('COUNT PERFORMANCE'),k=title('STRIKEOUTS'),s=title('SPRAY CHART');
    if(!c&&!k&&!s)return;
    if(c&&!c.closest('.report-standard-section'))boxBetween(c,k||s);
    if(k&&!k.closest('.report-standard-section'))boxBetween(k,s);
    if(s&&!s.closest('.report-standard-section')){
      const sprayContainer=s.closest('.report-spray,.spray-chart-section,.spray-section');
      if(sprayContainer){sprayContainer.classList.add('report-standard-section');s.classList.add('report-standard-section-title')}
      else boxBetween(s,null);
    }
  }

  function run(){apply();setTimeout(apply,60);setTimeout(apply,180)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  document.addEventListener('click',run,true);document.addEventListener('change',run,true);
})();
