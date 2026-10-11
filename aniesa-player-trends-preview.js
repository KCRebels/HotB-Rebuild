(()=>{
'use strict';
if(new URLSearchParams(location.search).has('portal'))return;
const STYLE_ID='approved-player-trends-style';
function ensureStyle(){
 if(document.getElementById(STYLE_ID))return;
 const style=document.createElement('style');
 style.id=STYLE_ID;
 style.textContent=`
 .bpt-panel[data-approved-trends="1"] .bpt-table{grid-template-columns:1.05fr repeat(3,1fr)!important;gap:0!important;background:#fff!important;border:2px solid #111!important;border-radius:10px!important;overflow:hidden!important}
 .bpt-panel[data-approved-trends="1"] .bpt-cell{margin:0!important;border:0!important;border-right:1.5px solid #111!important;border-bottom:1.5px solid #111!important;background:#f5f6f7!important;color:#111827!important;min-height:70px!important;padding:0!important;display:flex!important;align-items:center!important;justify-content:center!important}
 .bpt-panel[data-approved-trends="1"] .bpt-cell:nth-child(4n){border-right:0!important}.bpt-panel[data-approved-trends="1"] .bpt-cell:nth-last-child(-n+4){border-bottom:0!important}
 .bpt-panel[data-approved-trends="1"] .bpt-head{min-height:46px!important;padding:8px 4px!important;background:#f1f2f4!important;color:#4b5563!important;font-size:12px!important;letter-spacing:.035em!important;white-space:nowrap!important;font-weight:900!important}
 .bpt-panel[data-approved-trends="1"] .bpt-label{justify-content:flex-start!important;padding-left:10px!important;background:#f5f6f7!important;color:#111827!important;font-size:15px!important;font-weight:900!important}
 .bpt-panel[data-approved-trends="1"] .bpt-head.bpt-label{background:#f1f2f4!important;color:#4b5563!important}
 .bpt-panel[data-approved-trends="1"] .approved-trend-cell{width:100%;height:100%;min-height:70px;display:grid;grid-template-columns:34% 66%;align-items:stretch}
 .bpt-panel[data-approved-trends="1"] .approved-trend-status{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;border-right:1px solid #aeb4ba;background:#eef0f2;color:#5b6168;font-weight:950;line-height:1}
 .bpt-panel[data-approved-trends="1"] .approved-trend-status.good{background:#e6f6e9;color:#128536}.bpt-panel[data-approved-trends="1"] .approved-trend-status.bad{background:#fde8e8;color:#c71f27}
 .bpt-panel[data-approved-trends="1"] .approved-trend-arrow{font-size:27px;line-height:.9;font-weight:950}.bpt-panel[data-approved-trends="1"] .approved-trend-delta{font-size:18px;line-height:1;font-weight:950;white-space:nowrap}
 .bpt-panel[data-approved-trends="1"] .approved-trend-even{display:inline-block;font-size:13px;line-height:1;font-weight:950;letter-spacing:.04em;white-space:nowrap;transform:rotate(-90deg);transform-origin:center}
 .bpt-panel[data-approved-trends="1"] .approved-trend-value{display:flex;align-items:center;justify-content:center;background:#fff;color:#111827;font-size:19px;font-weight:950;white-space:nowrap}
 @media (max-width:430px){.bpt-panel[data-approved-trends="1"] .bpt-cell{min-height:66px!important}.bpt-panel[data-approved-trends="1"] .approved-trend-cell{min-height:66px;grid-template-columns:34% 66%}.bpt-panel[data-approved-trends="1"] .approved-trend-arrow{font-size:25px}.bpt-panel[data-approved-trends="1"] .approved-trend-delta{font-size:17px}.bpt-panel[data-approved-trends="1"] .approved-trend-value{font-size:18px}.bpt-panel[data-approved-trends="1"] .approved-trend-even{font-size:12px}}
 `;
 document.head.appendChild(style);
}
function selectedPlayer(){return String(document.querySelector('#evalSelect')?.value||'').trim()}
function directText(cell){for(const node of cell.childNodes){if(node.nodeType===Node.TEXT_NODE&&String(node.textContent||'').trim())return String(node.textContent||'').trim()}return''}
function statusFromCell(cell,isSeason,metricLabel){
 if(isSeason)return{kind:'even',delta:''};
 const raw=String(cell.querySelector('.bpt-change')?.textContent||'').replace(/PTS/gi,'').trim();
 if(!raw||/EVEN/i.test(raw))return{kind:'even',delta:''};
 const isK=/^K\s*%$/i.test(String(metricLabel||'').trim());
 if(raw.startsWith('+'))return{kind:isK?'bad':'good',direction:'up',delta:raw.replace(/\s+/g,'')};
 if(raw.startsWith('−')||raw.startsWith('-'))return{kind:isK?'good':'bad',direction:'down',delta:'−'+raw.replace(/^[−-]/,'').replace(/\s+/g,'')};
 return{kind:'even',delta:''};
}
function decorate(){
 const panel=document.querySelector('[data-bpt-panel]');if(!panel)return;
 const player=selectedPlayer();if(!player||player==='Team'){panel.removeAttribute('data-approved-trends');return}
 ensureStyle();const table=panel.querySelector('.bpt-table');if(!table)return;panel.dataset.approvedTrends='1';
 const cells=[...table.children];if(cells.length<8)return;
 for(let i=4;i<cells.length;i++){
  if(i%4===0)continue;
  const cell=cells[i];if(cell.dataset.approvedDecorated==='1')continue;
  const value=directText(cell)||'—',isSeason=i%4===3,metricLabel=String(cells[i-(i%4)]?.textContent||'').trim(),status=statusFromCell(cell,isSeason,metricLabel);
  const statusHtml=status.kind==='even'?'<div class="approved-trend-status even"><span class="approved-trend-even">EVEN</span></div>':`<div class="approved-trend-status ${status.kind}"><span class="approved-trend-arrow">${status.direction==='up'?'↑':'↓'}</span><span class="approved-trend-delta">${status.delta}</span></div>`;
  cell.innerHTML=`<div class="approved-trend-cell">${statusHtml}<div class="approved-trend-value">${value}</div></div>`;cell.dataset.approvedDecorated='1';
 }
}
let queued=false;function queue(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;decorate()})}
document.addEventListener('change',e=>{if(e.target instanceof Element&&e.target.matches('#evalSelect,#evalSeasonFilter,#evalDateRange,#evalDateStart,#evalDateEnd'))setTimeout(queue,0)},true);
new MutationObserver(queue).observe(document.querySelector('#app')||document.body,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(queue,0),{once:true});else setTimeout(queue,0);
})();