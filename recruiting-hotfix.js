(()=>{
 const ACTIVE='Brooklyn Gering';
 function wire(){
  const select=document.querySelector('#evalSelect');
  if(!select||select.value!==ACTIVE)return;
  const email=document.querySelector('#rwRecruitingSection .rw-email');
  const legacy=document.querySelector('#openRecruitingEmail');
  if(email&&legacy&&!email.dataset.legacyEmail){
   email.dataset.legacyEmail='1';
   const replacement=email.cloneNode(true);
   email.replaceWith(replacement);
   replacement.addEventListener('click',()=>legacy.click());
  }
 }
 const obs=new MutationObserver(()=>requestAnimationFrame(wire));
 obs.observe(document.getElementById('app')||document.body,{childList:true,subtree:true});
 document.addEventListener('change',e=>{if(e.target?.id==='evalSelect')setTimeout(wire,0)});
 wire();
})();
