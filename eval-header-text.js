(function(root){
 'use strict';
 const DB_KEY='hotbRebuildDbV1';

 function selectedPlayer(){
  const name=document.querySelector('#evalSelect')?.value;
  if(!name||name==='Team')return null;
  try{return(JSON.parse(localStorage.getItem(DB_KEY)||'{}').roster||[]).find(player=>player.name===name)||null}catch{return null}
 }

 function openRecruitingText(){
  const player=selectedPlayer();
  if(player?.name!=='Brooklyn Gering')return;
  const url=root.HotBRecruitingWorkflow?.PUBLIC_PROFILE_URL||'';
  const positions=String(player.positions||'').trim().replace(/\s*\|\s*/g,'/');
  const message=root.HotBSms?.recruitingProfileMessage({name:player.name,grad:player.grad,positions,url})||'';
  const destination=root.HotBSms?.composeSmsUrl({phone:'',message,userAgent:root.navigator?.userAgent||''})||'';
  if(destination)root.location.href=destination;
 }

 function inject(){
  const actions=document.querySelector('.eval-contact-actions');
  if(!actions||document.querySelector('#openRecruitingText'))return;
  const player=selectedPlayer(),button=document.createElement('button');
  button.type='button';button.id='openRecruitingText';button.className='btn eval-contact eval-text';button.textContent='TX';button.setAttribute('aria-label','Text recruiting profile');
  button.disabled=player?.name!=='Brooklyn Gering';button.addEventListener('click',openRecruitingText);actions.append(button);
 }

 function init(){
  const observer=new MutationObserver(()=>requestAnimationFrame(inject));
  observer.observe(document.getElementById('app')||document.body,{childList:true,subtree:true});
  document.addEventListener('change',event=>{if(event.target?.id==='evalSelect')setTimeout(inject,0)});
  inject();
 }

 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})(window);
