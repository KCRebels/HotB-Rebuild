(() => {
  
if(new URLSearchParams(location.search).has('portal'))return;
const DBKEY='hotbRebuildDbV1';
  const MAPKEY='hotbSprayLocationsV1';
  let pending=null;

  const loadMap=()=>{try{return JSON.parse(localStorage.getItem(MAPKEY)||'{}')}catch{return {}}};
  const saveMap=map=>localStorage.setItem(MAPKEY,JSON.stringify(map));
  const loadDb=()=>{try{return JSON.parse(localStorage.getItem(DBKEY)||'{}')}catch{return {}}};
  const clamp=n=>Math.max(2,Math.min(98,n));

  function ensureStyles(){
    if(document.getElementById('spray-location-style'))return;
    const style=document.createElement('style');
    style.id='spray-location-style';
    style.textContent=`
      .hit-modal .field{position:relative;cursor:crosshair}
      .spray-entry-hint{margin:2px 0 8px;text-align:center;color:#667085;font-size:12px;font-weight:900;letter-spacing:.2px}
      .spray-entry-dot{position:absolute;z-index:8;width:14px;height:14px;border:2px solid #111;border-radius:50%;transform:translate(-50%,-50%);pointer-events:none;box-shadow:0 1px 2px rgba(0,0,0,.22)}
      .hit-contact .spray-entry-dot{background:#3862db}
      .out-contact .spray-entry-dot{background:#cd3a32}
      .report-spray-dot{width:12px!important;height:12px!important;min-width:12px!important;min-height:12px!important;border-width:1.5px!important}
      .report-spray-dot.hit{background:#3862db!important}
      .report-spray-dot.h4o{background:#cd3a32!important}
      .report-spray-dot.selected{width:22px!important;height:22px!important;min-width:22px!important;min-height:22px!important}
    `;
    document.head.appendChild(style);
  }

  function decorateHitModal(){
    const modal=document.querySelector('.hit-modal');
    const field=modal?.querySelector('.field');
    if(!modal||!field||field.dataset.sprayReady==='1')return;
    field.dataset.sprayReady='1';
    const wrap=field.closest('.field-wrap');
    if(wrap&&!wrap.querySelector('.spray-entry-hint')){
      const hint=document.createElement('div');
      hint.className='spray-entry-hint';
      hint.textContent='Tap where the ball landed, then select the fielder.';
      wrap.prepend(hint);
    }
    field.addEventListener('click',event=>{
      if(event.target.closest('[data-fielder]'))return;
      const rect=field.getBoundingClientRect();
      if(!rect.width||!rect.height)return;
      const x=clamp((event.clientX-rect.left)/rect.width*100);
      const y=clamp((event.clientY-rect.top)/rect.height*100);
      pending={x:+x.toFixed(2),y:+y.toFixed(2),at:Date.now()};
      field.querySelector('.spray-entry-dot')?.remove();
      const dot=document.createElement('span');
      dot.className='spray-entry-dot';
      dot.style.left=`${pending.x}%`;
      dot.style.top=`${pending.y}%`;
      field.appendChild(dot);
    });
  }

  function captureSavedSpray(){
    if(!pending)return;
    const point={...pending};
    setTimeout(()=>{
      const db=loadDb();
      const game=db.currentGame;
      const pitches=game?.pitches||[];
      const pitch=[...pitches].reverse().find(p=>Date.now()-(p.ts||0)<5000&&['HIT','H4O','E','FC','SAC'].includes(p.result));
      if(game&&pitch){
        const map=loadMap();
        map[`${game.id}|${pitch.id}`]={x:point.x,y:point.y,result:pitch.result,ts:pitch.ts||Date.now()};
        saveMap(map);
      }
      pending=null;
    },80);
  }

  function allGames(db){
    const games=[...(db.savedGames||[])];
    if(db.currentGame&&!games.some(g=>g.id===db.currentGame.id))games.push(db.currentGame);
    return games;
  }

  function applyReportSprays(){
    const dots=[...document.querySelectorAll('.report-spray-dot[data-report-pa]')];
    if(!dots.length)return;
    const db=loadDb(),map=loadMap(),games=allGames(db);
    dots.forEach(dot=>{
      const paId=dot.dataset.reportPa;
      let found=null;
      for(const game of games){
        const pa=(game.plateAppearances||[]).find(item=>String(item.id)===String(paId));
        if(!pa)continue;
        const pitch=[...(game.pitches||[])].reverse().find(p=>p.pa===pa.pa&&p.hitter===pa.hitter&&['HIT','H4O','E','FC','SAC'].includes(p.result));
        if(pitch){found=map[`${game.id}|${pitch.id}`]||null;break}
      }
      if(found){dot.style.left=`${found.x}%`;dot.style.top=`${found.y}%`}
    });
  }

  document.addEventListener('click',event=>{
    if(event.target.closest('#saveContact'))captureSavedSpray();
  },true);

  let queued=false;
  function sync(){queued=false;ensureStyles();decorateHitModal();applyReportSprays()}
  function queue(){if(queued)return;queued=true;requestAnimationFrame(sync)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync,{once:true});else sync();
  new MutationObserver(queue).observe(document.documentElement,{childList:true,subtree:true});
})();
