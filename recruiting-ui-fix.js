(()=>{
 function apply(){
  const section=document.querySelector('#rwRecruitingSection');
  if(!section)return;
  const profile=section.querySelector('.rw-profile');
  const email=section.querySelector('.rw-email');
  const text=section.querySelector('.rw-text');
  if(profile)profile.textContent='Profile';
  if(email)email.textContent='Email';
  if(text)text.textContent='Text';
 }
 const observer=new MutationObserver(()=>requestAnimationFrame(apply));
 observer.observe(document.documentElement,{childList:true,subtree:true});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
})();
