(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.HotBSms=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';

 function cleanLine(value){return String(value??'').replace(/[\r\n]+/g,' ').trim()}
 function cleanWebUrl(value){
  const raw=String(value??'').trim();
  if(!raw)return'';
  try{
   const parsed=new URL(raw);
   return /^https?:$/.test(parsed.protocol)?parsed.href:'';
  }catch{return''}
 }
 function buildStandaloneLinkMessage({before=[],url,after=[]}={}){
  const link=cleanWebUrl(url);
  if(!link)return'';
  const leading=(Array.isArray(before)?before:[before]).map(cleanLine).filter(Boolean);
  const trailing=(Array.isArray(after)?after:[after]).map(cleanLine).filter(Boolean);
  return [...leading,'',link,'',...trailing].join('\r\n');
 }
 function composeSmsUrl({phone='',message='',userAgent=''}={}){
  const recipient=String(phone??'').replace(/[^\d+]/g,'');
  const body=String(message??'').replace(/\r?\n/g,'\r\n');
  if(!recipient||!body)return'';
  const separator=/iPad|iPhone|iPod/.test(String(userAgent||''))?'&':'?';
  return `sms:${recipient}${separator}body=${encodeURIComponent(body)}`;
 }
 function guestPracticeMessage({firstName,url}={}){
  return buildStandaloneLinkMessage({
   before:`Welcome to HotB, ${cleanLine(firstName)||'Guest'}.`,
   url,
   after:'This link expires when practice ends.'
  });
 }
 function recruitingProfileMessage({name,grad,positions,url}={}){
  return buildStandaloneLinkMessage({
   before:`${cleanLine(name)||'Player'} | ${cleanLine(grad)||'Grad Year'} | ${cleanLine(positions)||'Softball'} | KC Rebels`,
   url,
   after:'Coach-verified scouting report and current results.'
  });
 }

 if(typeof document!=='undefined'&&typeof location!=='undefined'&&new URLSearchParams(location.search).has('portal')&&!document.querySelector('script[data-hotb-portal-trends]')){
  const s=document.createElement('script');s.src='player-portal-trends-approved.js?v=20261011-allplayers1';s.async=false;s.dataset.hotbPortalTrends='1';document.head.appendChild(s);
 }

 /* 2026-10-12: player portal language + route. Keep the portal card and page aligned on “Ask the Librarian.” */
 if(typeof document!=='undefined'&&typeof location!=='undefined'&&new URLSearchParams(location.search).has('portal')){
  const patchLibrarian=()=>{
   const ask=document.querySelector('[data-hbp-view="ask"]');
   if(ask){
    const h=ask.querySelector('h3');if(h&&h.textContent.trim()!=='Ask the Librarian')h.textContent='Ask the Librarian';
    const p=ask.querySelector('p');if(p&&/find the right drill/i.test(p.textContent||''))p.textContent='Ask the Librarian to find the right drill for what you want to work on.';
   }
   document.querySelectorAll('h1,h2,h3,label,button,span').forEach(el=>{
    const t=(el.textContent||'').trim();
    if(/^Ask\s+The\s+Library$/i.test(t))el.textContent='Ask the Librarian';
   });
  };
  let frame=0;const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(patchLibrarian)};
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true,characterData:true});
  document.addEventListener('pointerdown',e=>{
   const ask=e.target.closest?.('[data-hbp-view="ask"]');if(!ask)return;
   e.preventDefault();e.stopImmediatePropagation();
   location.href='player-librarian-20261012.html?return='+encodeURIComponent(location.href);
  },true);
  schedule();
 }

 return{buildStandaloneLinkMessage,composeSmsUrl,cleanWebUrl,guestPracticeMessage,recruitingProfileMessage};
});
