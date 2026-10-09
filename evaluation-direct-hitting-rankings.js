(()=>{
 function wirePitchControls(){
  document.querySelectorAll('.eval-app .pitcher-stat[data-pitch-ranking]').forEach(card=>{
   card.onpointerup=event=>{
    const native=card;
    if(typeof native.onclick==='function'){
     event.preventDefault();
     event.stopPropagation();
     native.onclick.call(native,event);
    }
   };
  });
 }
 const app=document.querySelector('#app');
 if(!app)return;
 wirePitchControls();
 app.addEventListener('change',event=>{
  if(event.target instanceof Element&&['evalSelect','evalCustomStart','evalCustomEnd'].includes(event.target.id))setTimeout(wirePitchControls,0);
 });
 app.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;
  if(!target)return;
  if(target.closest('[data-go],[data-range],[data-custom-range],[data-date-filter],[data-close]'))setTimeout(wirePitchControls,0);
 });
})();