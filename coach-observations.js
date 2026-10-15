/* Loads the unchanged HotB observation module plus the permanent assistant-coach Focus indicator. */
document.write('<script src="coach-observations-core-v1.js?v=20261009-focus-coach-2"><\/script><script src="assistant-coach-focus-v2.js?v=20261009-focus-coach-2"><\/script>');

/* Keep the bottom of the coach Observation editor comfortably above HotB's fixed navigation. */
(()=>{
 const style=document.createElement('style');
 style.id='hotb-observation-bottom-clearance-582';
 style.textContent=`
  @media(max-width:560px){
   .observation-modal{padding-bottom:110px!important;scroll-padding-bottom:130px!important}
   .observation-save{margin-bottom:54px!important}
  }
 `;
 document.head.appendChild(style);
})();

/* Tayte permanent portal repair.
   The verified portal document is unchanged; only the saved share credential was stale.
   Keep Open / Share / Text on Tayte's existing permanent portal and always emit the
   verified credential that successfully reconnects a fresh player device. */
(()=>{
 const PLAYER='Tayte Stepps';
 const PORTAL_ID='SDfyRXOwJePMrQe4i_4eJXLe';
 const PORTAL_CREDENTIAL='397544';
 const BUILD='20260924-631';
 const selector=name=>`[${name}="${PLAYER}"]`;
 const portalUrl=()=>{
  const url=new URL(location.origin+location.pathname);
  url.searchParams.set('portal',PORTAL_ID);
  url.searchParams.set('guest',PORTAL_CREDENTIAL);
  url.searchParams.set('portalBuild',window.HOTB_PORTAL_BUILD_TOKEN||BUILD);
  return url.toString();
 };
 const patchOpenLink=()=>{
  document.querySelectorAll(selector('data-share-portal')).forEach(button=>{
   const article=button.closest('article');
   const link=article?.querySelector('a[href*="portal="]');
   if(link&&link.href!==portalUrl())link.href=portalUrl();
  });
 };
 const observer=new MutationObserver(patchOpenLink);
 observer.observe(document.documentElement,{childList:true,subtree:true});
 document.addEventListener('DOMContentLoaded',patchOpenLink,{once:true});
 setTimeout(patchOpenLink,0);

 document.addEventListener('click',event=>{
  const share=event.target.closest?.(selector('data-share-portal'));
  const text=event.target.closest?.(selector('data-text-portal'));
  if(!share&&!text)return;
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  const url=portalUrl();
  const message=`Tayte’s private HotB Player Portal\r\n\r\n${url}\r\n\r\nUse this same private link each time. No PIN is required.`;
  if(text){
   const article=text.closest('article');
   const phone=(article?.dataset?.phone||'').replace(/[^\d+]/g,'');
   const rosterPhone='6204189280';
   const recipient=phone||rosterPhone;
   const separator=/iPad|iPhone|iPod/.test(navigator.userAgent)?'&':'?';
   location.href=`sms:${recipient}${separator}body=${encodeURIComponent(message)}`;
   return;
  }
  if(navigator.share){
   navigator.share({title:'Tayte’s private HotB Player Portal',text:'Use this same private link each time. No PIN is required.',url}).catch(()=>{});
   return;
  }
  navigator.clipboard?.writeText(url).catch(()=>{});
 },true);
})();
