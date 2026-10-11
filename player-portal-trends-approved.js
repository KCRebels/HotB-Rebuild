(()=>{
'use strict';
if(!new URLSearchParams(location.search).has('portal'))return;
const STYLE_ID='player-portal-trends-approved-style';
function ensureStyle(){
 if(document.getElementById(STYLE_ID))return;
 const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
 .pem-panel[data-approved-portal-trends="1"] .pem-trend-table{grid-template-columns:52px repeat(3,minmax(0,1fr))!important;gap:0!important;background:#fff!important;border:2px solid #111!important;border-radius:10px!important;overflow:hidden!important}
 .pem-panel[data-approved-portal-trends="1"] .pem-trend-cell{margin:0!important;border:0!important;border-right:1.5px solid #111!important;border-bottom:1.5px solid #111!important;background:#f3f4f6!important;color:#111827!important;min-height:66px!important;padding:0!important;display:flex!important;align-items:center!important;justify-content:center!important}
 .pem-panel[data-approved-portal-trends="1"] .pem-trend-cell:nth-child(4n){border-right:0!important}.pem-panel[data-approved-portal-trends="1"] .pem-trend-cell:nth-last-child(-n+4){border-bottom:0!important}
 .pem-panel[data-approved-portal-trends="1"] .pem-trend-head{min-height:46px!important;padding:8px 4px!important;background:#f3f4f6!important;color:#4b5563!important;font-size:12px!important;letter-spacing:.035em!important;white-space:nowrap!important;font-weight:900!important}
 .pem-panel[data-approved-portal-trends="1"] .pem-trend-label{justify-content:flex-start!important;padding-left:4px!important;background:#f3f4f6!important;color:#111827!important;font-size:15px!important;font-weight:900!important}
 .pem-panel[data-approved-portal-trends="1"] .pem-trend-head.pem-trend-label{background:#f3f4f6!important;color:#4b5563!important}
 .pem-panel[data-approved-portal-trends="1"] .approved-portal-trend-cell{width:100%;height:100%;min-height:66px;display:grid;grid-template-columns:44px minmax(0,1fr);align-items:stretch}
 .pem-panel[data-approved-portal-trends="1"] .approved-portal-trend-status{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;border-right:1px solid #c8cdd1;background:#f3f4f6;color:#667085;font-weight:950;line-height:1;min-width:0}
 .pem-panel[data-approved-portal-trends="1"] .approved-portal-trend-status.good{background:#e5f5e9;color:#14913f}.pem-panel[data-approved-portal-trends="1"] .approved-portal-trend-status.bad{background:#fde8e8;color:#b5121b}
 .pem-panel[data-approved-portal-trends="1"] .approved-portal-trend-arrow{font-size:25px;line-height:.9;font-weight:950}.pem-panel[data-approved-portal-trends="1"] .approved-portal-trend-delta{font-size:15px;line-height:1;font-weight:950;white-space:nowrap;margin-top:4px}
 .pem-panel[data-approved-portal-trends="1"] .approved-portal-trend-even{display:inline-block;font-size:12px;line-height:1;font-weight:900;white-space:nowrap;transform:rotate(-90deg);transform-origin:center;color:#667085}
 .pem-panel[data-approved-portal-trends="1"] .approved-portal-trend-value{display:flex;align-items:center;justify-content:center;background:#f3f4f6;color:#111827;font-size:16px;font-weight:900;white-space:nowrap;min-width:0;padding:14px 0}
 .pem-panel[data-approved-portal-trends="1"] .pem-trend-card{background:#fff!important;color:#111827!important;border:3px solid #111!important;border-radius:10px!important;padding:12px!important}.pem-panel[data-approved-portal-trends="1"] .pem-trend-card b,.pem-panel[data-approved-portal-trends="1"] .pem-trend-card span{color:#111827!important}.pem-panel[data-approved-portal-trends="1"] .pem-up{border-color:#16833d!important}.pem-panel[data-approved-portal-trends="1"] .pem-watch{border-color:#d7aa35!important}
 `;document.head.appendChild(s)
}
function directText(cell){for(const node of cell.childNodes){if(node.nodeType===Node.TEXT_NODE&&String(node.textContent||'').trim())return String(node.textContent||'').trim()}return''}
function metricInfo(label){const raw=String(label||'').trim().toUpperCase();if(raw==='DECISION'||raw==='DEC')return{label:'DEC',key:'decision',invert:false};if(raw==='CONTACT'||raw==='CON')return{label:'CON',key:'contact',invert:false};if(raw==='K%')return{label:'K%',key:'k',invert:true};if(raw==='AVG')return{label:'AVG',key:'avg',invert:false};if(raw==='OBP')return{label:'OBP',key:'obp',invert:false};return{label:raw,key:raw==='IPA'?'ipa':'hhb',invert:false}}
function numeric(text,key){const s=String(text||'').trim();if(!s||s==='—')return null;if(key==='avg'||key==='obp')return Number(s);if(s.endsWith('%'))return Number(s.slice(0,-1))/100;return Number(s)}
function pointsDelta(recent,season,key){if(recent==null||season==null)return 0;return Math.round((recent-season)*((key==='avg'||key==='obp')?1000:100))}
function statusHtml(d,invert){if(!d)return'<div class="approved-portal-trend-status even"><span class="approved-portal-trend-even">EVEN</span></div>';const good=invert?d<0:d>0;return `<div class="approved-portal-trend-status ${good?'good':'bad'}"><span class="approved-portal-trend-arrow">${good?'↑':'↓'}</span><span class="approved-portal-trend-delta">${d>0?'+':'−'}${Math.abs(d)}</span></div>`}
function decorate(){
 ensureStyle();
 const table=document.querySelector('.pem-trend-table');if(!table)return;
 const panel=table.closest('.pem-panel');if(!panel)return;panel.dataset.approvedPortalTrends='1';
 const cells=[...table.children];if(cells.length<8)return;
 cells[0].textContent='MET';
 const rows=[];
 for(let row=4;row<cells.length;row+=4){const info=metricInfo(cells[row]?.textContent),v15=directText(cells[row+1])||'—',v30=directText(cells[row+2])||'—',vs=directText(cells[row+3])||'—',season=numeric(vs,info.key),d15=pointsDelta(numeric(v15,info.key),season,info.key),d30=pointsDelta(numeric(v30,info.key),season,info.key);cells[row].textContent=info.label;rows.push({...info,v15,v30,vs,d15,d30});[[1,v15,d15],[2,v30,d30],[3,vs,0]].forEach(([offset,value,d])=>{const cell=cells[row+offset];cell.innerHTML=`<div class="approved-portal-trend-cell">${statusHtml(d,info.invert)}<div class="approved-portal-trend-value">${value}</div></div>`;cell.dataset.approvedPortalDecorated='1'})}
 const up=[],watch=[];rows.forEach(r=>{if(!r.d15)return;const good=r.invert?r.d15<0:r.d15>0;(good?up:watch).push(`${r.label} ${r.d15>0?'+':'−'}${Math.abs(r.d15)} pts`)});
 const cards=panel.querySelectorAll('.pem-trend-card span');if(cards[0])cards[0].innerHTML=up.length?up.slice(0,3).join('<br>'):'No clear upward trend yet';if(cards[1])cards[1].innerHTML=watch.length?watch.slice(0,2).join('<br>'):'No declining trend flagged';
}
let queued=false;function queue(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;decorate()})}
new MutationObserver(queue).observe(document.getElementById('app')||document.body,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(queue,0),{once:true});else setTimeout(queue,0);
})();