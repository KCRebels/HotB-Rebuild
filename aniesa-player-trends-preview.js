(()=>{
'use strict';
if(new URLSearchParams(location.search).has('portal'))return;
const TARGET='Aniesa Rohleder';
const STYLE_ID='aniesa-player-trends-preview-style';

function ensureStyle(){
 if(document.getElementById(STYLE_ID))return;
 const style=document.createElement('style');
 style.id=STYLE_ID;
 style.textContent=`
 .bpt-panel[data-aniesa-preview="1"] .bpt-table{
   grid-template-columns:1.05fr repeat(3,1fr)!important;
   gap:0!important;
   background:#fff!important;
   border:2px solid #111!important;
   border-radius:10px!important;
   overflow:hidden!important;
 }
 .bpt-panel[data-aniesa-preview="1"] .bpt-cell{
   margin:0!important;
   border:0!important;
   border-right:1.5px solid #111!important;
   border-bottom:1.5px solid #111!important;
   background:#f5f6f7!important;
   color:#111827!important;
   min-height:70px!important;
   padding:0!important;
   display:flex!important;
   align-items:center!important;
   justify-content:center!important;
 }
 .bpt-panel[data-aniesa-preview="1"] .bpt-cell:nth-child(4n){border-right:0!important}
 .bpt-panel[data-aniesa-preview="1"] .bpt-cell:nth-last-child(-n+4){border-bottom:0!important}
 .bpt-panel[data-aniesa-preview="1"] .bpt-head{
   min-height:46px!important;
   padding:8px 4px!important;
   background:#f1f2f4!important;
   color:#4b5563!important;
   font-size:12px!important;
   letter-spacing:.035em!important;
   white-space:nowrap!important;
   font-weight:900!important;
 }
 .bpt-panel[data-aniesa-preview="1"] .bpt-label{
   justify-content:flex-start!important;
   padding-left:10px!important;
   background:#f5f6f7!important;
   color:#111827!important;
   font-size:15px!important;
   font-weight:900!important;
 }
 .bpt-panel[data-aniesa-preview="1"] .bpt-head.bpt-label{background:#f1f2f4!important;color:#4b5563!important}
 .bpt-panel[data-aniesa-preview="1"] .aniesa-trend-cell{
   width:100%;height:100%;min-height:70px;display:grid;grid-template-columns:42% 58%;align-items:stretch;
 }
 .bpt-panel[data-aniesa-preview="1"] .aniesa-trend-status{
   display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;
   border-right:1px solid #aeb4ba;background:#eef0f2;color:#5b6168;font-weight:950;line-height:1;
 }
 .bpt-panel[data-aniesa-preview="1"] .aniesa-trend-status.up{background:#e6f6e9;color:#128536}
 .bpt-panel[data-aniesa-preview="1"] .aniesa-trend-status.down{background:#fde8e8;color:#c71f27}
 .bpt-panel[data-aniesa-preview="1"] .aniesa-trend-arrow{font-size:27px;line-height:.9;font-weight:950}
 .bpt-panel[data-aniesa-preview="1"] .aniesa-trend-delta{font-size:18px;line-height:1;font-weight:950;white-space:nowrap}
 .bpt-panel[data-aniesa-preview="1"] .aniesa-trend-even{font-size:11px;letter-spacing:.02em;font-weight:950}
 .bpt-panel[data-aniesa-preview="1"] .aniesa-trend-value{
   display:flex;align-items:center;justify-content:center;background:#fff;color:#111827;font-size:19px;font-weight:950;white-space:nowrap;
 }
 @media (max-width:430px){
   .bpt-panel[data-aniesa-preview="1"] .bpt-cell{min-height:66px!important}
   .bpt-panel[data-aniesa-preview="1"] .aniesa-trend-cell{min-height:66px}
   .bpt-panel[data-aniesa-preview="1"] .aniesa-trend-arrow{font-size:25px}
   .bpt-panel[data-aniesa-preview="1"] .aniesa-trend-delta{font-size:17px}
   .bpt-panel[data-aniesa-preview="1"] .aniesa-trend-value{font-size:18px}
 }
 `;
 document.head.appendChild(style);
}

function selectedPlayer(){return String(document.querySelector('#evalSelect')?.value||'').trim()}

function directText(cell){
 for(const node of cell.childNodes){
  if(node.nodeType===Node.TEXT_NODE&&String(node.textContent||'').trim())return String(node.textContent||'').trim();
 }
 return '';
}

function statusFromCell(cell,isSeason){
 if(isSeason)return {kind:'even',delta:''};
 const badge=cell.querySelector('.bpt-change');
 const raw=String(badge?.textContent||'').replace(/PTS/gi,'').trim();
 if(!raw||/EVEN/i.test(raw))return {kind:'even',delta:''};
 if(raw.startsWith('+'))return {kind:'up',delta:raw.replace(/\s+/g,'')};
 if(raw.startsWith('−')||raw.startsWith('-'))return {kind:'down',delta:'−'+raw.replace(/^[−-]/,'').replace(/\s+/g,'')};
 return {kind:'even',delta:''};
}

function decorate(){
 const panel=document.querySelector('[data-bpt-panel]');
 if(!panel)return;
 if(selectedPlayer()!==TARGET){
  panel.removeAttribute('data-aniesa-preview');
  return;
 }
 ensureStyle();
 const table=panel.querySelector('.bpt-table');
 if(!table)return;
 panel.dataset.aniesaPreview='1';
 const cells=[...table.children];
 if(cells.length<8)return;
 for(let i=4;i<cells.length;i++){
  if(i%4===0)continue;
  const cell=cells[i];
  if(cell.dataset.aniesaDecorated==='1')continue;
  const value=directText(cell)||'—';
  const isSeason=i%4===3;
  const status=statusFromCell(cell,isSeason);
  const statusHtml=status.kind==='even'
   ?'<div class="aniesa-trend-status even"><span class="aniesa-trend-even">EVEN</span></div>'
   :`<div class="aniesa-trend-status ${status.kind}"><span class="aniesa-trend-arrow">${status.kind==='up'?'↑':'↓'}</span><span class="aniesa-trend-delta">${status.delta}</span></div>`;
  cell.innerHTML=`<div class="aniesa-trend-cell">${statusHtml}<div class="aniesa-trend-value">${value}</div></div>`;
  cell.dataset.aniesaDecorated='1';
 }
}

let queued=false;
function queue(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;decorate()})}
document.addEventListener('change',e=>{if(e.target instanceof Element&&e.target.matches('#evalSelect,#evalSeasonFilter,#evalDateRange,#evalDateStart,#evalDateEnd'))setTimeout(queue,0)},true);
new MutationObserver(queue).observe(document.querySelector('#app')||document.body,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(queue,0),{once:true});else setTimeout(queue,0);
})();