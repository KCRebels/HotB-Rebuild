(()=>{
'use strict';

if(new URLSearchParams(location.search).has('portal'))return;
const DBKEY='hotbRebuildDbV1';
function db(){try{return JSON.parse(localStorage.getItem(DBKEY)||'null')}catch(e){return null}}
function player(name){return (db()?.roster||[]).find(p=>p.name===name)}
function portalUrl(id){return `${location.origin}${location.pathname}?portal=${encodeURIComponent(id)}`}
function textFor(p){return `${p.name} HotB Portal\n${portalUrl(p.portalId)}\nPIN: ${p.portalPin}`}
function valid(p){return !!(p?.portalId&&/^\d{6}$/.test(String(p?.portalPin||'')))}
function sms(phone,body){const number=String(phone||'').replace(/\D/g,'');if(!number)return false;window.location.href=`sms:${number}&body=${encodeURIComponent(body)}`;return true}
async function share(p){const text=textFor(p);try{if(navigator.share){await navigator.share({title:`${p.name} HotB Portal`,text});return}}catch(e){if(e?.name==='AbortError')return}try{await navigator.clipboard.writeText(text);alert(`${p.name}'s portal link and PIN were copied.`)}catch(e){prompt('Copy this portal link and PIN:',text)}}
function originalPlayers(){return (db()?.roster||[]).filter(p=>!p.isGuest&&!p.isPracticeGuest&&!p.isTeamJenkins&&p.teamName!=='Team Jenkins'&&valid(p))}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function managerHtml(){const d=db(),players=originalPlayers(),coach=d?.coachPortal;return `<main class="portal-page"><section class="portal-welcome"><span>COACH SETUP</span><h2>Player Portals Are Ready</h2><p>Your saved KC Rebels portal links and PINs are available on this device.</p></section>${valid(coach)?`<section class="portal-coach-setup"><span>ONE COACH</span><h2>Coach Portal Is Ready</h2><div class="portal-coach-ready"><b>${esc(coach.name||'Bob')}</b><span>PIN ${esc(coach.portalPin)}</span><div class="portal-player-actions"><button class="btn" data-share-coach="1">Share</button></div></div></section>`:''}<section class="portal-player-list">${players.map(p=>`<article><div><b>${esc(String(p.name||'').split(/\s+/)[0])}</b><span>PIN ${esc(p.portalPin)}</span></div><div class="portal-player-actions"><button class="btn" data-share-portal="${esc(p.name)}">Share</button><button class="btn" data-text-portal="${esc(p.name)}" ${p.phone?'':'disabled'}>${p.phone?'Text':'No Cell'}</button></div></article>`).join('')}</section><p class="portal-private-note">Text opens an individual message with that player’s private link and PIN. Share opens the iPhone share sheet.</p></main>`}
function restoreManager(){if(!location.hash.includes('portal')&&!document.querySelector('.portal-page'))return;const gate=[...document.querySelectorAll('.portal-welcome h2')].find(x=>/Private Player Access/i.test(x.textContent));if(!gate)return;const players=originalPlayers();if(!players.length)return;const main=gate.closest('main');if(main)main.outerHTML=managerHtml()}
document.addEventListener('click',e=>{
 const t=e.target.closest?.('[data-text-portal]');
 if(t){const p=player(t.dataset.textPortal);if(!valid(p))return;e.preventDefault();e.stopImmediatePropagation();if(!sms(p.phone,textFor(p)))alert(`No cell number is saved for ${p.name}.`);return}
 const s=e.target.closest?.('[data-share-portal]');
 if(s){const p=player(s.dataset.sharePortal);if(!valid(p))return;e.preventDefault();e.stopImmediatePropagation();share(p);return}
 const c=e.target.closest?.('[data-share-coach]');if(c){const coach=db()?.coachPortal;if(valid(coach)){e.preventDefault();e.stopImmediatePropagation();share({...coach,name:coach.name||'Bob'})}}
},true);
new MutationObserver(restoreManager).observe(document.documentElement,{childList:true,subtree:true});window.addEventListener('load',restoreManager);setTimeout(restoreManager,250);
})();