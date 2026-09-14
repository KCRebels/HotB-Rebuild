(()=>{
 const ACTIVE='Brooklyn Gering';
 const PROFILE='https://kcrebels.github.io/HotB-Rebuild/brooklyn-gering-recruiting-profile.html';
 const GAMECHANGER='https://web.gc.com/teams/K1E4TcPCwGKj/2027-summer-kc-rebels-16-regional-lickel';
 const EVENTS=['Triple Crown St. Louis Showcase — Oct. 16–18 — Chesterfield, Missouri','Top Gun Select Invite — Oct. 30–Nov. 1 — Kansas City Metro','RecruitLook Showcase — Nov. 6–8 — Kansas City Metro'];
 const clean=v=>String(v??'').trim();
 let pendingBody='';
 function newBody(name){const parts=clean(name).split(/\s+/),last=parts[parts.length-1]||'Coach';return `Coach ${last},\n\nI wanted to introduce you to Brooklyn Gering, a 2029 player with the KC Rebels.\n\nBrooklyn is a competitor who wants the ball, throws with good velocity, and consistently finds the strike zone. At the plate she makes consistent contact, can hit the ball hard, and has developing extra-base power. She is an outstanding teammate, extremely coachable, and actively seeks feedback to improve.\n\nPLAYER PROFILE / CURRENT RESULTS\n${PROFILE}\n\nHer KC Rebels Recruiting Profile includes my coach evaluation along with her current hitting and pitching results.\n\nUPCOMING SCHEDULE\n${EVENTS.join('\n')}\n\nGAMECHANGER\n${GAMECHANGER}\n\nPlease feel free to contact me if you'd like additional information about Brooklyn.\n\nDan Lickel\nHead Coach | KC Rebels 16U Regional\nDirector of Recruiting | Kansas City Rebels`}
 function wireButton(){
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
 function hybridize(){
  const preview=document.querySelector('#previewRecruitingEmail');
  const name=document.querySelector('#emailCoachName');
  const address=document.querySelector('#emailCoachAddress');
  if(!preview||!name||!address||document.querySelector('#rwHybridArea'))return;
  preview.style.display='none';
  const area=document.createElement('div');area.id='rwHybridArea';area.className='email-preview-group';
  area.innerHTML='<label class="info-field"><span>Email Message — You Can Edit It Here</span><textarea id="rwHybridBody" class="email-body-preview"></textarea></label><p class="email-note">Select the coach above, review the message, then send directly through Gmail.</p><button class="btn red block" id="rwHybridSend" disabled>Send with Gmail</button>';
  preview.parentNode.insertBefore(area,preview.nextSibling);
  const body=area.querySelector('#rwHybridBody'),send=area.querySelector('#rwHybridSend');let auto='';
  const sync=()=>{const next=newBody(name.value);if(!body.value||body.value===auto){body.value=next;auto=next}send.disabled=!clean(address.value)||!address.validity.valid};
  ['input','change'].forEach(type=>{name.addEventListener(type,()=>setTimeout(sync,0));address.addEventListener(type,()=>setTimeout(sync,0))});
  send.addEventListener('click',()=>{if(!clean(address.value)||!address.validity.valid)return;pendingBody=body.value||newBody(name.value);preview.click()});
  sync();
 }
 function applyPreview(){
  if(!pendingBody)return;
  const textarea=document.querySelector('#emailBodyPreview'),send=document.querySelector('#openGmailDraft');
  if(!textarea||!send)return;
  textarea.value=pendingBody;pendingBody='';
  setTimeout(()=>send.click(),0);
 }
 const obs=new MutationObserver(()=>requestAnimationFrame(()=>{wireButton();hybridize();applyPreview()}));
 obs.observe(document.getElementById('app')||document.body,{childList:true,subtree:true});
 document.addEventListener('change',e=>{if(e.target?.id==='evalSelect')setTimeout(wireButton,0)});
 wireButton();hybridize();applyPreview();
})();
