(()=>{
'use strict';
if(!new URLSearchParams(location.search).has('portal'))return;
const STYLE_ID='player-portal-trends-approved-style';
function ensureStyle(){
 if(document.getElementById(STYLE_ID))return;
 const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
 .pem-panel[data-approved-portal-trends="1"] .pem-trend-table{grid-template-columns:1.05fr repeat(3,1fr)!important;gap:0!important;background:#fff!important;border:2px solid #111!important;border-radius:10px!important;overflow:hidden!important}
 .pem-panel[data-approved-portal-trends="1"] .pem-trend-cell{margin:0!important;border:0!important;border-right:1.5px solid #111!important;border-bottom:1.5px solid #111!important;background:#f5f6f7!important;color:#111827!important;min-height:70px!important;padding:0!important;display:flex!important;align-items:center!important;justify-content:center!important}
 .pem-panel[data-approved-portal-trends="1"] .pem-trend-cell:nth-child(4n){border-right:0!important}.pem-panel[data-approved-portal-trends="1"] .pem-trend-cell:nth-last-child(-n+4){border-bottom:0!important}
 .pem-panel[data-approved-portal-trends="1"] .pem-trend-head{min-height:46px!important;padding:8px 4px!important;background:#f1f2f4!important;color:#4b5563!important;font-size:12px!important;letter-spacing:.035em!important;white-space:nowrap!important;font-weight:900!important}
 .pem-panel[data-approved-portal-trends="1"] .pem-trend-label{justify-content:flex-start!important;padding-left:10px!important;background:#f5f6f7!important;color:#111827!important;font-size:15px!important;font-weight:900!important}
 .pem-panel[data-approved-portal-trends="1"] .pem-trend-head.pem-trend-label{background:#f1f2f4!important;color:#4b5563!important}
 .pem-panel[data-approved-portal-trends="1"] .approved-portal-trend-cell{width:100%;height:100%;min-height:70px;display:grid;grid-template-columns:34% 66%;align-items:stretch}
 .pem-panel[data-approved-portal-trends="1"] .approved-portal-trend-status{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;border-right:1px solid #aeb4ba;background:#eef0f2;color:#5b6168;font-weight:950;line-height:1}
 .pem-panel[data-approved-portal-trends="1"] .approved-portal-trend-status.good{background:#e6f6e9;color:#128536}.pem-panel[data-approved-portal-trends="1"] .approved-portal-trend-status.bad{background:#fde8e8;color:#c71f27}
 .pem-panel[data-approved-portal-trends="1"] .approved-portal-trend-arrow{font-size:27px;line-height:.9;font-weight:950}.pem-panel[data-approved-portal-trends="1"] .approved-portal-trend-delta{font-size:18px;line-height:1;font-weight:950;white-space:nowrap}
 .pem-panel[data-approved-portal-trends="1"] .approved-portal-trend-even{display:inline-block;font-size:13px;line-height:1;font-weight:950;letter-spacing:.04em;white-space:nowrap;transform:rotate(-90deg);transform-origin:center}
 .pem-panel[data-approved-portal-trends="1"] .approved-portal-trend-value{display:flex;align-items:center;justify-content:center;background:#fff;color:#111827;font-size:19px;font-weight:950;white-space:nowrap}
 .pem-panel[data-approved-portal-trends="1"] .pem-trend-card{background:#fff!important;color:#111827!important;border:3px solid #111!important;border-radius:10px!important;padding:12px!important}.pem-panel[data-approved-portal-trends="1"] .pem-trend-card b,.pem-panel[data-approved-portal-trends="1"] .pem-trend-card span{color:#111827!important}.pem-panel[data-approved-portal-trends="1"] .pem-up{border-color:#16833d!important}.pem-panel[data-approved-portal-trends="1"] .pem-watch{border-color:#d7aa35!important}
 @media (max-width:430px){.pem-panel[data-approved-portal-trends="1"] .pem-trend-cell{min-height:66px!important}.pem-panel[data-approved-portal-trends="1"] .approved-portal-trend-cell{min-height:66px;grid-template-columns:34% 66%}.pem-panel[data-approved-portal-trends="1"] .approved-portal-trend-arrow{font-size:25px}.pem-panel[data-approved-portal-trends="1"] .approved-portal-trend-delta{font-size:17px}.pem-panel[data-approved-portal-trends="1"] .approved-portal-trend-value{font-size:18px}.pem-panel[data-approved-portal-trends="1"] .approved-portal-trend-even{font-size:12px}}
 `;document.head.appendChild(s)
}
function directText(cell){for(const node of cell.childNodes){if(node.nodeType===Node.TEXT_NODE&&String(node.textContent||'').trim())return String(node.textContent||'').trim()}return''}
function statusFromCell(cell,isSeason,metricLabel){
 if(isSeason)return{kind:'even',delta:''};
 const raw=String(cell.querySelector('.pem-change')?.textContent||'').replace(/PTS/gi,'').trim();
 if(!raw||/EVEN/i.test(raw))return{kind:'even',delta:''};
 const isK=/^K\s*%$/i.test(String(metricLabel||'').trim());
 if(raw.startsWith('+'))return{kind:isK?'bad':'good',direction:'up',delta:raw.replace(/\s+/g,'')};
 if(raw.startsWith('−')||raw.startsWith('-'))return{kind:isK?'good':'bad',direction:'down',delta:'−'+raw.replace(/^[−-]/,'').replace(/\s+/g,'')};
 return{kind:'even',delta:''};
}
function decorate(){
 ensureStyle();
 const table=document.querySelector('.pem-trend-table');if(!table)return;
 const panel=table.closest('.pem-panel');if(!panel)return;panel.dataset.approvedPortalTrends='1';
 const cells=[...table.children];if(cells.length<8)return;
 for(let i=4;i<cells.length;i++){
  if(i%4===0)continue;
  const cell=cells[i];if(cell.dataset.approvedPortalDecorated==='1')continue;
  const value=directText(cell)||'—',isSeason=i%4===3,metricLabel=String(cells[i-(i%4)]?.textContent||'').trim(),status=statusFromCell(cell,isSeason,metricLabel);
  const statusHtml=status.kind==='even'?'<div class="approved-portal-trend-status even"><span class="approved-portal-trend-even">EVEN</span></div>':`<div class="approved-portal-trend-status ${status.kind}"><span class="approved-portal-trend-arrow">${status.direction==='up'?'↑':'↓'}</span><span class="approved-portal-trend-delta">${status.delta}</span></div>`;
  cell.innerHTML=`<div class="approved-portal-trend-cell">${statusHtml}<div class="approved-portal-trend-value">${value}</div></div>`;cell.dataset.approvedPortalDecorated='1';
 }
}
let queued=false;function queue(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;decorate()})}
new MutationObserver(queue).observe(document.getElementById('app')||document.body,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(queue,0),{once:true});else setTimeout(queue,0);
})();