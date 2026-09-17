(()=>{
'use strict';
const DBKEY='hotbRebuildDbV1';
function db(){try{return JSON.parse(localStorage.getItem(DBKEY)||'null')}catch(e){return null}}
function player(name){return (db()?.roster||[]).find(p=>p.name===name)}
function portalUrl(id){return `${location.origin}${location.pathname}?portal=${encodeURIComponent(id)}`}
function textFor(p){return `${p.name} HotB Portal\n${portalUrl(p.portalId)}\nPIN: ${p.portalPin}`}
function valid(p){return !!(p?.portalId&&/^\d{6}$/.test(String(p?.portalPin||'')))}
function sms(phone,body){const number=String(phone||'').replace(/\D/g,'');if(!number)return false;window.location.href=`sms:${number}&body=${encodeURIComponent(body)}`;return true}
async function share(p){const text=textFor(p);try{if(navigator.share){await navigator.share({title:`${p.name} HotB Portal`,text});return}}catch(e){if(e?.name==='AbortError')return}try{await navigator.clipboard.writeText(text);alert(`${p.name}'s portal link and PIN were copied.`)}catch(e){prompt('Copy this portal link and PIN:',text)}}
document.addEventListener('click',e=>{
 const t=e.target.closest?.('[data-text-portal]');
 if(t){const p=player(t.dataset.textPortal);if(!valid(p))return;e.preventDefault();e.stopImmediatePropagation();if(!sms(p.phone,textFor(p)))alert(`No cell number is saved for ${p.name}.`);return}
 const s=e.target.closest?.('[data-share-portal]');
 if(s){const p=player(s.dataset.sharePortal);if(!valid(p))return;e.preventDefault();e.stopImmediatePropagation();share(p)}
},true);
})();