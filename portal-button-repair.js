(()=>{
'use strict';

if(new URLSearchParams(location.search).has('portal'))return;
const DBKEY='hotbRebuildDbV1';
function db(){try{return JSON.parse(localStorage.getItem(DBKEY)||'null')}catch(e){return null}}
function player(name){return (db()?.roster||[]).find(p=>p.name===name)}
function portalUrl(id){const token=window.HOTB_PORTAL_BUILD_TOKEN||'20260919-77';return `${location.origin}${location.pathname}?portal=${encodeURIComponent(id)}&portalBuild=${encodeURIComponent(token)}`}
function textFor(p){return `${p.name} HotB Portal\n${portalUrl(p.portalId)}\nPIN: ${p.portalPin}`}
function valid(p){return !!(p?.portalId&&/^\d{6}$/.test(String(p?.portalPin||'')))}
function sms(phone,body){const number=String(phone||'').replace(/\D/g,'');if(!number)return false;const separator=/iPad|iPhone|iPod/.test(navigator.userAgent)?'&':'?';window.location.href=`sms:${number}${separator}body=${encodeURIComponent(body)}`;return true}
async function share(p){const text=textFor(p);try{if(navigator.share){await navigator.share({title:`${p.name} HotB Portal`,text});return}}catch(e){if(e?.name==='AbortError')return}try{await navigator.clipboard.writeText(text);alert(`${p.name}'s portal link and PIN were copied.`)}catch(e){prompt('Copy this portal link and PIN:',text)}}
function originalPlayers(){return (db()?.roster||[]).filter(p=>!p.isGuest&&!p.isPracticeGuest&&!p.isTeamJenkins&&p.teamName!=='Team Jenkins'&&valid(p))}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
// Legacy button fallback only. The current app owns all portal-manager rendering.
document.addEventListener('click',e=>{
 const t=e.target.closest?.('[data-text-portal]');
 if(t){const p=player(t.dataset.textPortal);if(!valid(p))return;e.preventDefault();e.stopImmediatePropagation();if(typeof window.HotBPortalText==='function'){window.HotBPortalText(t.dataset.textPortal);return}if(!sms(p.phone,textFor(p)))alert(`No cell number is saved for ${p.name}.`);return}
 const s=e.target.closest?.('[data-share-portal]');
 if(s){const p=player(s.dataset.sharePortal);if(!valid(p))return;e.preventDefault();e.stopImmediatePropagation();if(typeof window.HotBPortalShare==='function'){window.HotBPortalShare(s.dataset.sharePortal);return}share(p);return}
 const c=e.target.closest?.('[data-share-coach]');if(c){const coach=db()?.coachPortal;if(valid(coach)){e.preventDefault();e.stopImmediatePropagation();share({...coach,name:coach.name||'Bob'})}}
},true);
})();