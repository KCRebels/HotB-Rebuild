(()=>{
 const closeRanking=()=>document.querySelector('#directPlayerEvalRankingBackdrop')?.remove();
 function wireStatControls(){
  document.querySelectorAll('.eval-app .pitcher-stat[data-pitch-ranking]').forEach(card=>{
   card.onpointerup=event=>{const native=card;if(typeof native.onclick==='function'){event.preventDefault();event.stopPropagation();native.onclick.call(native,event)}};
  });
  document.querySelectorAll('.eval-app .perf').forEach(card=>{
   card.onpointerup=event=>{
    const label=String(card.querySelector('.perf-metric')?.textContent||'').trim().toUpperCase();
    if(label==='HHB%'&&window.HotBHHBPopup?.open){event.preventDefault();event.stopPropagation();window.HotBHHBPopup.open();return}
    if(label==='IPA%'||label==='REACH%')return;
    if(!['AVG','OBP','K%','CONTACT'].includes(label))return;
    const all=card.querySelector('[data-hitting-ranking]');
    if(!all||typeof all.onclick!=='function')return;
    event.preventDefault();event.stopPropagation();
    all.onclick.call(all,event);
   };
  });
 }
 const app=document.querySelector('#app');if(!app)return;
 wireStatControls();
 app.addEventListener('change',event=>{
  if(event.target instanceof Element&&['evalSelect','evalCustomStart','evalCustomEnd'].includes(event.target.id))setTimeout(wireStatControls,0);
 });
 app.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;if(!target)return;
  if(target.closest('[data-go],[data-range],[data-custom-range],[data-date-filter],[data-close]'))setTimeout(wireStatControls,0);
 });
})();