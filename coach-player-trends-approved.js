(()=>{
'use strict';
if(new URLSearchParams(location.search).has('portal'))return;
const directText=cell=>{for(const node of cell.childNodes){if(node.nodeType===Node.TEXT_NODE&&String(node.textContent||'').trim())return String(node.textContent||'').trim()}return''};
const parse=(text,key)=>{const s=String(text||'').trim();if(!s||s==='—')return null;if(key==='avg'||key==='obp')return Number(s);if(s.endsWith('%'))return Number(s.slice(0,-1))/100;return Number(s)};
const delta=(recent,season,key)=>{if(recent==null||season==null)return 0;return Math.round((recent-season)*((key==='avg'||key==='obp')?1000:100))};
const meta=label=>{const raw=String(label||'').trim().toUpperCase();if(raw==='DECISION'||raw==='DEC')return{label:'DEC',key:'decision',invert:false};if(raw==='CONTACT'||raw==='CON')return{label:'CON',key:'contact',invert:false};if(raw==='K%')return{label:'K%',key:'k',invert:true};if(raw==='AVG')return{label:'AVG',key:'avg',invert:false};if(raw==='OBP')return{label:'OBP',key:'obp',invert:false};return{label:raw,key:raw==='IPA'?'ipa':'hhb',invert:false}};
function trendHtml(d,invert){if(!d)return'<span class="bpt-a-even">EVEN</span>';const good=invert?d<0:d>0;return `<span class="bpt-a-arrow ${good?'good':'bad'}">${good?'↑':'↓'}</span><span class="bpt-a-delta ${good?'good':'bad'}">${d>0?'+':'−'}${Math.abs(d)}</span>`}
function decorate(){
 const panel=document.querySelector('[data-bpt-panel]');if(!panel||panel.dataset.allPlayerTrendApproved==='1')return;
 const table=panel.querySelector('.bpt-table');if(!table){if(panel.querySelector('.bpt-aniesa-grid'))panel.dataset.allPlayerTrendApproved='1';return}
 const cells=[...table.children];if(cells.length<8)return;
 const rows=[];
 for(let row=4;row<cells.length;row+=4){const info=meta(cells[row]?.textContent),v15=directText(cells[row+1])||'—',v30=directText(cells[row+2])||'—',vs=directText(cells[row+3])||'—',season=parse(vs,info.key);rows.push({...info,v15,v30,vs,d15:delta(parse(v15,info.key),season,info.key),d30:delta(parse(v30,info.key),season,info.key)})}
 table.className='bpt-aniesa-grid';
 cells.slice(0,4).forEach((cell,i)=>{cell.className='bpt-aniesa-head';cell.textContent=i===0?'MET':['LAST 15','LAST 30','SEASON'][i-1];if(i===0){cell.style.textAlign='left';cell.style.paddingLeft='4px'}});
 rows.forEach((r,ri)=>{const base=4+ri*4,label=cells[base];label.className='bpt-aniesa-label';label.textContent=r.label;[[1,r.v15,r.d15],[2,r.v30,r.d30],[3,r.vs,0]].forEach(([offset,value,d])=>{const cell=cells[base+offset],good=r.invert?d<0:d>0,cls=!d?'':good?' good':' bad';cell.className='bpt-aniesa-stat';cell.innerHTML=`<div class="bpt-aniesa-trend${cls}">${trendHtml(d,r.invert)}</div><div class="bpt-aniesa-value">${value}</div>`})});
 const up=[],watch=[];rows.forEach(r=>{if(!r.d15)return;const good=r.invert?r.d15<0:r.d15>0;(good?up:watch).push(`${r.label} ${r.d15>0?'+':'−'}${Math.abs(r.d15)} pts`)});
 const cards=panel.querySelectorAll('.bpt-summary-card span');if(cards[0])cards[0].innerHTML=up.length?up.slice(0,3).join('<br>'):'No clear upward trend yet';if(cards[1])cards[1].innerHTML=watch.length?watch.slice(0,2).join('<br>'):'No declining trend flagged';
 panel.dataset.allPlayerTrendApproved='1';
}
let q=false;function queue(){if(q)return;q=true;requestAnimationFrame(()=>{q=false;decorate()})}
new MutationObserver(queue).observe(document.querySelector('#app')||document.body,{childList:true,subtree:true});document.addEventListener('change',e=>{if(e.target instanceof Element&&e.target.matches('#evalSelect,#evalSeasonFilter,#evalDateRange,#evalDateStart,#evalDateEnd'))setTimeout(queue,0)},true);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',queue,{once:true});else queue();
})();
