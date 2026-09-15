(() => {
  const STYLE_ID='reports-clean-layout-style';
  function styles(){
    let s=document.getElementById(STYLE_ID); if(!s){s=document.createElement('style');s.id=STYLE_ID;document.head.appendChild(s)}
    s.textContent=`
      .report-detail{margin:14px 0 0!important;padding:0!important;border:0!important;border-radius:0!important;box-shadow:none!important;background:transparent!important;width:100%!important;max-width:none!important;overflow:visible!important}
      .report-filter-box{margin:0 8px 12px;padding:14px 12px;background:#fff;border:1px solid #d5dcda;border-radius:14px;box-sizing:border-box;width:calc(100% - 16px)}
      .report-filter-box .report-filter-grid{margin-top:0}
      .report-detail>.report-stat-grid{display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:6px!important;margin:12px 8px 14px!important;width:calc(100% - 16px)!important;max-width:none!important;box-sizing:border-box!important;overflow:visible!important}
      .report-detail>.report-stat-grid>.report-stat{width:auto!important;min-width:0!important;max-width:none!important;min-height:92px!important;padding:10px 2px!important;box-sizing:border-box!important}
      .report-detail>.report-stat-grid>.report-stat b{font-size:23px!important;line-height:1!important;white-space:nowrap!important}
      .report-detail>.report-stat-grid>.report-stat span{font-size:13px!important;line-height:1.05!important;white-space:nowrap!important}
      .report-count-section,.report-detail>.report-outcome-section,.report-detail>.report-spray-box,.report-detail>.report-heat{margin:12px 8px!important;padding:14px 10px 16px!important;background:#fff!important;border:1px solid #d5dcda!important;border-radius:14px!important;box-sizing:border-box!important;width:calc(100% - 16px)!important;max-width:none!important}
      .report-count-section>.count-performance-title{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;align-items:center!important;column-gap:8px!important;margin:0 0 12px!important;padding:0!important;background:transparent!important;border:0!important;border-radius:0!important;color:#111!important;box-shadow:none!important;white-space:nowrap!important}
      .report-count-section>.count-performance-title>b{font-size:20px!important;line-height:1.05!important;font-weight:950!important;white-space:nowrap!important}
      .report-count-section>.count-performance-title>.count-key,.report-count-section>.count-performance-title>.count-separator{font-size:14px!important;line-height:1!important;font-weight:900!important;white-space:nowrap!important}
      .report-count-section>.count-performance-title>.count-key.hit{color:#3862db!important}.report-count-section>.count-performance-title>.count-key.out,.report-count-section>.count-performance-title>.count-key.strikeout{color:#cd3a32!important}.report-count-section>.count-performance-title>.count-key.average{color:#3d8c52!important}.report-count-section>.count-performance-title>.count-separator{color:#111!important}
      .report-count-section>.count-grid{display:grid!important;grid-template-columns:1fr!important;gap:7px!important;width:100%!important}
      .report-count-section .count-card{min-height:58px!important;width:100%!important}
      .report-detail>.report-outcome-section>.report-outcome-heading,.report-detail>.report-spray-box>h3,.report-detail>.report-heat>h3{margin:0 0 12px!important;padding:0!important;background:transparent!important;border:0!important;border-radius:0!important;color:#111!important;box-shadow:none!important;font-size:20px!important;line-height:1.08!important;font-weight:950!important;text-align:left!important}
      @media(max-width:390px){
        .report-detail>.report-stat-grid{gap:4px!important}
        .report-detail>.report-stat-grid>.report-stat b{font-size:21px!important}
        .report-detail>.report-stat-grid>.report-stat span{font-size:12px!important}
        .report-count-section>.count-performance-title>b{font-size:18px!important}
        .report-count-section>.count-performance-title>.count-key,.report-count-section>.count-performance-title>.count-separator{font-size:12px!important}
      }
    `;
  }
  function clean(){
    styles();
    const d=document.querySelector('.modal .report-detail'); if(!d)return;
    d.classList.remove('panel'); d.removeAttribute('style');

    /* Undo only wrappers created by earlier Reports layout helpers. */
    [...d.querySelectorAll(':scope > .report-filter-box')].forEach(box=>{while(box.firstChild)d.insertBefore(box.firstChild,box);box.remove()});
    [...d.querySelectorAll(':scope > .report-standard-section')].forEach(box=>{while(box.firstChild)d.insertBefore(box.firstChild,box);box.remove()});

    const stat=d.querySelector(':scope > .report-stat-grid'); if(!stat)return;
    const first=d.firstElementChild;
    if(first&&first!==stat){
      const box=document.createElement('section');box.className='report-filter-box';d.insertBefore(box,first);
      let n=first;while(n&&n!==stat){const next=n.nextElementSibling;box.appendChild(n);n=next}
    }

    const title=d.querySelector(':scope > .count-performance-title');
    const grid=d.querySelector(':scope > .count-grid');
    if(title&&grid){
      const sec=document.createElement('section');sec.className='report-count-section';d.insertBefore(sec,title);sec.append(title,grid);
    }
  }
  function run(){clean();setTimeout(clean,80);setTimeout(clean,220)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  document.addEventListener('click',run,true);document.addEventListener('change',run,true);
})();
