
(() => {
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;' }[m]));
const round3 = n => Number.isFinite(n) ? n.toFixed(3).replace(/^0/,'') : '.000';
const pct1 = n => `${(n*100).toFixed(1)}%`;
const pct0 = n => `${Math.round(n*100)}%`;
const requestedPlanPreferences={
 'Lakyn Farley':'IN','Maleah Pena':'IN','Hailey Marsh':'NO','Maia Waddell':'NO',
 'Aniesa Rohleder':'OUT','Makenna Whitaker':'OUT','Brynna Peter':'OUT',
 'Tayte Stepps':'OUT','Claire Jack':'OUT','Mattingly Hardy':'OUT','Lydia Copeland':'OUT'
};
const heatColors={B:'#3d8c52',F:'#f0c94d',HIT:'#3862db',K:'#cd3a32',H4O:'#cd3a32',FPS:'#cd3a32',REPORT:'#101011'};

const defaultRoster = [
 {name:'Aniesa Rohleder',side:'R',jersey:'9',grad:'2029',positions:'RHP | 1B',gpa:'3.98',interest:'Sports Medicine',school:'Olathe South HS',photo:'Aniesa.jpg'},
 {name:'Brooklyn Gering',side:'R',jersey:'16',grad:'2029',positions:'RHP | OF',gpa:'4.0',interest:'Nursing',school:'Spring Hill HS',photo:'Brooklyn.JPEG'},
 {name:'Brynna Peter',side:'R',jersey:'11',grad:'2028',positions:'SS | UT',gpa:'3.78',interest:'Occupational Therapy',school:'Chanute HS',photo:'Brynna.jpg'},
 {name:'Claire Jack',side:'R',jersey:'25',grad:'2029',positions:'CIF | OF',gpa:'4.0',interest:'Biology',school:'Pratt HS',photo:'jack.jpg'},
 {name:'Hailey Marsh',side:'L',jersey:'23',grad:'2029',positions:'CF | OF',gpa:'4.0',interest:'Dentist',school:'Louisburg HS',photo:'Hailey.jpg'},
 {name:'Lakyn Farley',side:'R',jersey:'8',grad:'2028',positions:'RHP | OF',gpa:'4.0',interest:'Sports Medicine',school:'Fort Scott HS',photo:'lakyn.jpg'},
 {name:'Lydia Copeland',side:'R',jersey:'27',grad:'2028',positions:'C | CIF',gpa:'4.0',interest:'Child Psychology',school:'Louisburg HS',photo:'Lydia.JPEG'},
 {name:'Maia Waddell',side:'L',jersey:'1',grad:'2028',positions:'2B | OF',gpa:'4.1',interest:'Criminal Justice / Film',school:'Olathe NW HS',photo:'Maia.jpg'},
 {name:'Makenna Whitaker',side:'R',jersey:'10',grad:'2029',positions:'RHP | UT',gpa:'4.3',interest:'Undecided',school:'Olathe NW HS',photo:'makenna.jpg'},
 {name:'Maleah Pena',side:'R',jersey:'20',grad:'2028',positions:'3B | 1B',gpa:'3.52',interest:'Sports Medicine',school:'Olathe NW HS',photo:'Maleah.jpg'},
 {name:'Mattingly Hardy',side:'R',jersey:'99',grad:'2029',positions:'OF | UT',gpa:'3.81',interest:'Biology',school:'Pembroke Hill HS',photo:'matti.jpg'},
 {name:'Megan Ryan',side:'R',jersey:'22',grad:'2028',positions:'RHP | UT',gpa:'4.0',interest:'Engineering',school:'Rock Creek HS',photo:'meg.jpg'},
 {name:'Tayte Stepps',side:'R',jersey:'00',grad:'2029',positions:'C | OF',gpa:'3.9',interest:'Nursing',school:'Fort Scott HS',photo:'Tayte.JPEG'}
];

const DBKEY='hotbRebuildDbV1';
const seed = {
 roster: defaultRoster,
 teams:[],
 pitchers:[],
 savedGames:[],
 measurements:[],
 planPreferences:{},
 currentGame:null,
 route:'home'
};
let db = load();
// Apply the requested player plans once, then preserve any changes made in the app.
if((db.planPreferencesVersion||0)<2){
 db.planPreferences={...(db.planPreferences||{}),...requestedPlanPreferences};
 db.planPreferencesVersion=2;
 localStorage.setItem(DBKEY,JSON.stringify(db));
}
if((db.planPreferencesVersion||0)<3){
 db.planPreferences={...(db.planPreferences||{}),'Brooklyn Gering':'OUT','Megan Ryan':'OUT'};
 db.planPreferencesVersion=3;
 localStorage.setItem(DBKEY,JSON.stringify(db));
}
// For now, a refresh abandons only the unfinished game and returns to setup.
if(db.route==='live'){
 db.currentGame=null;
 db.route='new';
 localStorage.setItem(DBKEY,JSON.stringify(db));
}
let route = db.route || 'home';
let modal = null;
let reportMode='current', reportSub='spray', reportFilterHitter='All Hitters';
let evalPlayer='Team';
let recordType='';
let timerInt=null,timerStart=0,timerElapsed=0;

function load(){
 try{
  const d=JSON.parse(localStorage.getItem(DBKEY));
  if(d){
   const aliases={'Matti Hardy':'Mattingly Hardy'};
   const savedByName=new Map((d.roster||[]).map(r=>[aliases[r.name]||r.name,r]));
   const roster=defaultRoster.map(profile=>({...savedByName.get(profile.name),...profile,side:savedByName.get(profile.name)?.side||profile.side}));
   const standardNames=new Set(defaultRoster.map(r=>r.name));
   const guests=(d.roster||[]).filter(r=>!standardNames.has(aliases[r.name]||r.name)).map(r=>({...r,isGuest:true}));
   roster.push(...guests);
   return {...seed,...d,roster};
  }
 }catch(e){}
 return structuredClone(seed);
}
function save(){
 db.route=route;
 localStorage.setItem(DBKEY,JSON.stringify(db));
}
function go(r){route=r;modal=null;save();render();window.scrollTo(0,0)}
function currentGame(){return db.currentGame}
function planFor(name){
 const saved=db.planPreferences?.[name];
 if(saved)return saved;
 return db.roster.find(r=>r.name===name)?.isGuest?'OUT':'IN';
}
function mixHexWithWhite(hex,amount){
 const n=parseInt(hex.slice(1),16), rgb=[n>>16,(n>>8)&255,n&255];
 const mixed=rgb.map(v=>Math.round(255+(v-255)*amount));
 return `rgb(${mixed.join(',')})`;
}
function heatStyles(values,color){
 const distinct=[...new Set(Object.values(values).filter(v=>v>0))].sort((a,b)=>a-b);
 const map={};
 Object.entries(values).forEach(([zone,value])=>{
  if(!value){map[zone]='background:#edf2ef;color:#667085';return}
  const rank=distinct.indexOf(value), strength=distinct.length===1?1:.15+.85*(rank/(distinct.length-1));
  const bg=strength===1?color:mixHexWithWhite(color,strength);
  const n=parseInt(color.slice(1),16), light=((n>>16)*299+((n>>8)&255)*587+(n&255)*114)/1000;
  map[zone]=`background:${bg};color:${strength>.62&&light<155?'#fff':'#111'}`;
 });
 return map;
}
function createGame(opponent,pitcherName,pitcherNumber,order){
 const g={
  id:crypto.randomUUID(),date:new Date().toISOString(),opponent,pitcherName,pitcherNumber,
  battingOrder:order,currentIdx:0,inning:1,outs:0,runners:[],plan:planFor(order[0]),pitchType:'FB',
  balls:0,strikes:0,paNumber:1,pitches:[],plateAppearances:[],ended:false,
  pendingZone:null,zoneScope:'HITTER',zoneFilter:'K',previewNext:false,showAi:false,historyTab:'LIVE',allView:'DOTS',firstPitchView:false
 };
 db.currentGame=g;
 if(opponent&&!db.teams.includes(opponent))db.teams.push(opponent);
 if(pitcherName&&!db.pitchers.some(p=>p.name===pitcherName&&p.number===pitcherNumber))db.pitchers.push({name:pitcherName,number:pitcherNumber});
 save();return g;
}
function hitterObj(name){return db.roster.find(r=>r.name===name)||{name,side:'R',jersey:'',grad:'',positions:'',gpa:'',interest:'',school:''}}
function currentHitter(g=currentGame()){return hitterObj(g?.battingOrder?.[g.currentIdx]||'')}
function isStrikeResult(r){return ['F','K','KL','HIT','H4O'].includes(r)}
function resultGroup(p){return p.result==='KL'?'K':p.result}
function pitchMarkClass(p){
 if(p.result==='HIT')return 'hit';
 if(p.result==='H4O'||p.result==='K'||p.result==='KL')return 'bad';
 if(p.result==='F')return 'foul';
 return 'good';
}
function pitchDotLabel(p){
 if(p.result==='HIT')return ({'1B':'1','2B':'2','3B':'3','HR':'4'})[p.hitType]||'';
 if(p.result==='H4O')return p.fielder||'';
 return '';
}
function zoneGroup(z){return ['L'].includes(z)?'IN':['R'].includes(z)?'OUT':['T','B'].includes(z)?'OUT':'IN'}
function addPitch(result,extra={}){
 const g=currentGame(); if(!g)return;
 const h=currentHitter(g);
 const pitch={
  id:crypto.randomUUID(),hitter:h.name,pa:g.paNumber,inning:g.inning,ballsBefore:g.balls,strikesBefore:g.strikes,
  zone:g.pendingZone||'',pitchType:g.pitchType,plan:g.plan,result,ts:Date.now(),...extra
 };
 g.pitches.push(pitch);
 let end=null;
 if(result==='B'){g.balls++;if(g.balls>=4) end='BB'}
 else if(result==='HBP') end='HBP';
 else if(result==='F'){if(g.strikes<2)g.strikes++}
 else if(result==='K'||result==='KL'){g.strikes++;if(g.strikes>=3) end='K'}
 else if(result==='HIT') end='HIT';
 else if(result==='H4O') end='H4O';
 g.pendingZone=null;
 if(end) closePA(end, extra);
 save();render();
}
function closePA(outcome,extra={}){
 const g=currentGame(), h=currentHitter(g);
 const paPitches=g.pitches.filter(p=>p.pa===g.paNumber&&p.hitter===h.name);
 const contact = ['HIT','H4O'].includes(outcome);
 const firstPitchStrike = paPitches.length ? isStrikeResult(paPitches[0].result) : false;
 let execution=null;
 if(contact){
  const final=paPitches.at(-1);
  const twoStrike=final.strikesBefore>=2;
  if(!twoStrike){
    if(g.plan==='CH') execution = final.pitchType!=='FB';
    else if(g.plan==='NO') execution = true;
    else execution = zoneGroup(final.zone)===g.plan;
  }
 }
 const pa={
  id:crypto.randomUUID(),hitter:h.name,inning:g.inning,pa:g.paNumber,outcome,
  hitType:extra.hitType||'',contactType:extra.contactType||'',fielder:extra.fielder||null,
  rbi:!!extra.rbi,rba:!!extra.rba,sac:!!extra.sac,error:!!extra.error,fc:!!extra.fc,
  bunt:!!extra.bunt,slap:!!extra.slap,hhb:!!extra.hhb,weak:!!extra.weak,
  pitchCount:paPitches.length,finalCount:`${Math.min(g.balls,3)}-${Math.min(g.strikes,2)}`,
  firstPitchStrike,execution,ts:Date.now()
 };
 g.plateAppearances.push(pa);
 if(outcome==='H4O'||outcome==='K') g.outs=Math.min(2,g.outs+1);
 g.balls=0;g.strikes=0;g.paNumber++;
 g.currentIdx=(g.currentIdx+1)%g.battingOrder.length;
 if(g.currentIdx===0) g.inning++;
 g.plan=planFor(g.battingOrder[g.currentIdx]);
 g.pitchType='FB';
}
function undo(){
 const g=currentGame(); if(!g||!g.pitches.length)return;
 // safest rebuild from all pitches except last, preserving PA metadata only if not affected.
 const removed=g.pitches.pop();
 const keep=g.pitches.map(p=>({...p}));
 const base={...g,pitches:[],plateAppearances:[],balls:0,strikes:0,paNumber:1,currentIdx:0,inning:1,outs:0,pendingZone:null};
 db.currentGame=base;
 keep.forEach(p=>{
   base.pendingZone=p.zone;base.pitchType=p.pitchType;base.plan=p.plan;
   addPitch(p.result,p);
 });
 save();render();
}
function statsForPAs(pas){
 let AB=0,H=0,TB=0,BB=0,HBP=0,K=0,contact=0,RBI=0;
 pas.forEach(pa=>{
   if(pa.outcome==='HIT'){H++;AB++;contact++;TB += ({'1B':1,'2B':2,'3B':3,'HR':4}[pa.hitType]||1)}
   else if(pa.outcome==='H4O'){AB++;contact++}
   else if(pa.outcome==='K'){AB++;K++}
   else if(pa.outcome==='BB'){BB++}
   else if(pa.outcome==='HBP'){HBP++}
   if(pa.rbi)RBI++;
 });
 const PA=pas.length, AVG=AB?H/AB:0, OBP=(AB+BB+HBP)?(H+BB+HBP)/(AB+BB+HBP):0, SLG=AB?TB/AB:0;
 const OPS=OBP+SLG, contactPct=AB?contact/AB:0, kPct=PA?K/PA:0, bbPct=PA?BB/PA:0;
 // Provisional Runs Produced model for rebuild; calibrate against legacy app.
 const rp = H + Math.max(0,TB-H)*0.65 + BB*0.7 + HBP*0.7 + RBI*0.75;
 return {PA,AB,H,TB,BB,HBP,K,AVG,OBP,SLG,OPS,contactPct,kPct,bbPct,rp};
}
function allPAs(includeCurrent=true){
 let arr=[...db.savedGames.flatMap(g=>g.plateAppearances||[])];
 if(includeCurrent&&db.currentGame)arr.push(...db.currentGame.plateAppearances);
 return arr;
}
function allPitches(includeCurrent=true){
 let arr=[...db.savedGames.flatMap(g=>g.pitches||[])];
 if(includeCurrent&&db.currentGame)arr.push(...db.currentGame.pitches);
 return arr;
}
function gameStats(g){return statsForPAs(g?.plateAppearances||[])}
function fps(g){
 const seen=new Set();
 const first=(g?.pitches||[]).filter(p=>{const key=`${p.hitter}::${p.pa}`;if(seen.has(key))return false;seen.add(key);return true});
 return first.length?first.filter(p=>isStrikeResult(p.result)).length/first.length:0;
}
function render(){
 const app=document.getElementById('app');
 app.innerHTML=`<div class="app ${route==='live'?'live-app':''}">${route==='home'?homeView():
 route==='new'?newGameView():route==='roster'?rosterView():
 route==='live'?liveView():route==='eval'?evalView():route==='reports'?reportsPage():homeView()}</div>${modal?modalView():''}`;
 bind();
}
function homeView(){
 return `<div class="home-hero">
   <div class="home-brand">
    <img class="home-logo-img" src="Rebels%20REG%20White%20with%20red%20wing%20-%20REGIONAL.png" alt="Kansas City Rebels Regional">
    <div class="home-title">KC REBELS REGIONAL LICKEL</div>
   </div>
   <div class="home-actions">
    <button class="home-card primary" data-go="new"><h3>New Game</h3><p>Set matchup and batting order</p></button>
    <button class="home-card" data-go="roster"><h3>Edit Roster</h3><p>Add, remove, or update hitters</p></button>
    <button class="home-card" data-go="reports"><h3>Reports</h3><p>Review saved games and trends</p></button>
    <button class="home-card" data-go="eval"><h3>Player / Team Eval</h3><p>Performance and athletic measurements</p></button>
   </div>
 </div><div class="home-footer">HOTB (THE ELITE HITTING APP) · REBUILD</div>`;
}
function newGameView(){
 const opts=db.roster.map(r=>`<option value="${esc(r.name)}">${esc(r.name)} (${r.side})</option>`).join('');
 const rows=Array.from({length:13},(_,i)=>`<div class="batting-row"><div class="batting-num">${i+1}</div>
 <select class="input batting-select" data-idx="${i}"><option value="">Select hitter</option>${opts}</select></div>`).join('');
 return `<div class="hero"><div class="hero-row"><div><div class="kicker">KC REBELS</div><h1>New Game</h1><p>Set the matchup and batting order.</p></div><div class="spacer"></div><button data-go="home">Home</button></div></div>
 <div class="panel"><div class="section-title">MATCHUP</div>
  <label class="label">Opponent</label><input id="opponent" class="input" placeholder="Select or enter team" list="teamList"><datalist id="teamList">${db.teams.map(t=>`<option>${esc(t)}</option>`).join('')}</datalist>
  <div class="grid2"><div><label class="label">Pitcher Name</label><input id="pitcherName" class="input" placeholder="Select or enter pitcher name" list="pitcherList"><datalist id="pitcherList">${db.pitchers.map(p=>`<option value="${esc(p.name)}"></option>`).join('')}</datalist></div>
  <div><label class="label">Number</label><input id="pitcherNumber" class="input" placeholder="Auto"></div></div>
 </div>
 <div class="panel"><div style="display:flex"><div class="section-title">BATTING ORDER</div><div style="flex:1"></div><span class="small" id="hitterCount">0 hitters</span></div>${rows}</div>
 <div class="bottom-action"><button class="btn block black" id="startGame" disabled>START GAME</button></div>`;
}
function rosterView(){
 return `<div class="hero" style="padding:18px 22px"><div class="hero-row"><button class="btn" data-go="home">Cancel</button><div style="flex:1;text-align:center"><div class="kicker">KC REBELS</div><h1 style="font-size:34px">Edit Roster</h1></div><button class="btn gold" id="saveRoster">Save</button></div></div>
 <div class="roster-editor">${db.roster.map((r,i)=>`<div class="roster-edit-row">
 <input class="input roster-name" data-i="${i}" value="${esc(r.name)}">
 <button class="sidebtn ${r.side==='R'?'active':''}" data-side="R" data-i="${i}">R</button>
 <button class="sidebtn ${r.side==='L'?'active':''}" data-side="L" data-i="${i}">L</button>
 <button class="deletebtn" data-del="${i}">×</button>
 </div>`).join('')}
 <button class="btn black block" id="addPlayer">+ Add Player</button></div>`;
}
function liveView(){
 const g=currentGame();if(!g)return `<div class="panel"><p>No current game.</p><button class="btn" data-go="new">New Game</button></div>`;
 const h=currentHitter(g);
 const currentPlan=planFor(h.name);
 const activePitchType=g.pitchType||'FB';
 const aps=g.plateAppearances.filter(p=>p.hitter===h.name);
 const nextName=g.battingOrder.length>1?g.battingOrder[(g.currentIdx+1)%g.battingOrder.length]:'';
 const chartName=g.previewNext?nextName:h.name;
 const activeNames=new Set(g.battingOrder);
 const allChartHitterPitches=g.pitches.filter(p=>p.hitter===chartName);
 let sourcePitches;
 if(g.zoneScope==='TEAM'&&!g.previewNext) sourcePitches=g.pitches.filter(p=>activeNames.has(p.hitter));
 else if(g.previewNext) sourcePitches=allChartHitterPitches;
 else if(/^AB\d+$/.test(g.historyTab||'')){
   const n=Number(g.historyTab.slice(2)), completed=aps[n-1];
   sourcePitches=completed?allChartHitterPitches.filter(p=>p.pa===completed.pa):[];
 }else if(g.historyTab==='ALL') sourcePitches=allChartHitterPitches;
 else sourcePitches=allChartHitterPitches.filter(p=>p.pa===g.paNumber);
 const allActivePitches=g.pitches.filter(p=>activeNames.has(p.hitter));
 const firstPitches=allActivePitches.filter((p,i,a)=>i===0||p.pa!==a[i-1].pa||p.hitter!==a[i-1].hitter);
 const statsMode=g.zoneScope==='TEAM'||g.previewNext||g.historyTab==='ALL';
 const percentMode=!g.firstPitchView&&(g.zoneScope==='TEAM'||g.previewNext||(g.historyTab==='ALL'&&(g.allView||'DOTS')==='PCT'));
 const filter=g.zoneFilter||'K';
 const histPitches=g.firstPitchView?firstPitches:percentMode?sourcePitches.filter(p=>resultGroup(p)===filter):sourcePitches;
 const abTabNames=aps.map((p,i)=>`AB${i+1}`);
 const showAll=aps.length>=2;
 const zoneFreq={T:0,L:0,R:0,B:0,C1:0,C2:0,C3:0,C4:0}; const hp=histPitches.length||1;
 histPitches.forEach(p=>{if(zoneFreq[p.zone]!=null)zoneFreq[p.zone]++});
 const showPct=percentMode;
 const heat=heatStyles(zoneFreq,heatColors[filter]||heatColors.K);
 const zoneContent=z=>{
  if(showPct)return `<span class="pct">${Math.round(zoneFreq[z]/hp*100)}%</span>`;
  const pitches=histPitches.filter(p=>p.zone===z), horizontal=['T','B'].includes(z), vertical=['L','R'].includes(z);
  const cols=horizontal?8:vertical?2:4, rows=Math.max(1,Math.ceil(pitches.length/cols));
  const available=horizontal?44:vertical?140:70;
  const dotSize=Math.max(3,Math.min(16,Math.floor(available/rows)-3));
  const gap=dotSize<=6?.5:dotSize<=10?1:1.5;
  const wrap=cols*dotSize+(cols-1)*gap;
  const dotFont=Math.max(5,Math.min(11,Math.floor(dotSize*.65)));
  return `<span class="pitch-dot-grid" style="--dot-size:${dotSize}px;--dot-gap:${gap}px;--dot-wrap:${wrap}px;--dot-font:${dotFont}px">${pitches.map(p=>`<i class="pitch-dot ${pitchMarkClass(p)}">${pitchDotLabel(p)}</i>`).join('')}</span>`;
 };
 const suggestions=aiSuggestions(g,chartName);
 const nextInitials=nextName?nextName.split(' ').map(x=>x[0]).join(''):'';
 return `<div class="topbar"><div class="brand">KC REBELS</div><button id="openProfile">Profile</button><button id="openReports">Reports</button><button class="end" id="endGame">End</button><button id="newGame">New</button></div>
 <div class="live-top">
  <div class="statbox hitter-box"><div class="cap">HITTER</div><div class="big">${esc(h.name)}</div><div class="sidebadge">${h.side}</div></div>
  <div class="statbox"><div class="cap">INN</div><div class="big">${g.inning}</div></div>
  <div class="statbox"><div class="cap">COUNT</div><div class="big">${g.balls}-${g.strikes}</div></div>
  <div class="statbox"><div class="cap">PITCHER</div><div class="big">#${esc(g.pitcherNumber||'')}</div></div>
 </div>
 <div class="control-row">
  <div class="control-card"><div class="pill-row">${['IN','OUT','CH','NO'].map(x=>`<button class="pill red ${currentPlan===x?'active':''}" data-plan="${x}">${x}</button>`).join('')}</div></div>
  <div class="control-card"><div class="pill-row">${[0,1,2].map(x=>`<button class="pill ${g.outs===x?'active':''}" data-outs="${x}">${x}</button>`).join('')}</div></div>
  <div class="control-card"><div class="pill-row">${[3,2,1].map(x=>`<button class="runner ${g.runners.includes(x)?'active':''}" data-runner="${x}"><span>${x}</span></button>`).join('')}</div></div>
 </div>
 <div class="live-workspace"><div class="zone-card">
  <div class="pitchtypes">${['FB','CH','RS','DP','CV','SC'].map(x=>`<button class="pitchtype ${activePitchType===x?'active':''}" data-ptype="${x}">${x}</button>`).join('')}</div>
  <div class="zone-layout">
   <button class="zone-scope ${g.zoneScope==='TEAM'?'active':''}" id="zoneScope">${g.zoneScope==='TEAM'?'HTR':'TM'}</button>
   <div class="zone zone-top ${showPct?'heat-zone':''} ${g.pendingZone==='T'?'selected':''}" style="${showPct?heat.T:''}" data-zone="T">${zoneContent('T')}</div>
   <div class="zone zone-left ${showPct?'heat-zone':''} ${g.pendingZone==='L'?'selected':''}" style="${showPct?heat.L:''}" data-zone="L">${zoneContent('L')}</div>
   <div class="core-grid">${['C1','C2','C3','C4'].map(z=>`<div class="zone core ${showPct?'heat-zone':''} ${g.pendingZone===z?'selected':''}" style="${showPct?heat[z]:''}" data-zone="${z}">${zoneContent(z)}</div>`).join('')}</div>
   <div class="zone zone-right ${showPct?'heat-zone':''} ${g.pendingZone==='R'?'selected':''}" style="${showPct?heat.R:''}" data-zone="R">${zoneContent('R')}</div>
   <div class="zone zone-bottom ${showPct?'heat-zone':''} ${g.pendingZone==='B'?'selected':''}" style="${showPct?heat.B:''}" data-zone="B">${zoneContent('B')}</div>
   <button class="zone-next ${g.previewNext?'active':''}" id="zoneNext" ${nextName?'': 'disabled'}>${g.previewNext?nextInitials:'NXT'}</button>
   <button class="fps ${g.firstPitchView?'active':''}" id="fpsBtn"><span>FPS</span><strong>${pct0(fps(g))}</strong></button>
  </div>
  <div class="zone-tools"><button class="ai" id="aiBtn">Ai</button>
   ${g.showAi?`<div class="ai-suggestions">${suggestions.map((s,i)=>`<div class="ai-box">#${i+1} ${esc(s.label)} &nbsp; ${s.pct}%</div>`).join('')}</div>`:''}
  </div>
 </div>
 <div class="history-panel">${historyHtml(g,g.previewNext?chartName:h.name)}</div>
 <div class="tabs ${showAll?'with-all':'without-all'}"><button class="tab fixed-tab ${(g.historyTab||'LIVE')==='LIVE'?'active':''}" data-tab="LIVE">LIVE</button><div class="ab-scroll">${abTabNames.map(t=>`<button class="tab ${(g.historyTab||'LIVE')===t?'active':''}" data-tab="${t}">${t}</button>`).join('')}</div>${showAll?`<button class="tab fixed-tab ${(g.historyTab||'LIVE')==='ALL'?'active':''}" data-tab="ALL">${g.historyTab==='ALL'&&(g.allView||'DOTS')==='DOTS'?'%':'ALL'}</button>`:''}</div>
 <div class="results">
  <button class="result hbp" data-result="HBP" ${statsMode?'disabled':''}>HBP</button><button class="result ball ${percentMode&&filter==='B'?'filter-active':''}" data-result="B">B</button><button class="result foul ${percentMode&&filter==='F'?'filter-active':''}" data-result="F">F</button><button class="result hit ${percentMode&&filter==='HIT'?'filter-active':''}" data-result="HIT">HIT</button>
  <button class="result undo" id="undo" ${statsMode?'disabled':''}>Undo</button><button class="result strike ${percentMode&&filter==='K'?'filter-active':''}" data-result="K">K</button><button class="result strike ${percentMode&&filter==='K'?'filter-active':''}" data-result="KL">KL</button><button class="result out ${percentMode&&filter==='H4O'?'filter-active':''}" data-result="H4O">H4O</button>
 </div></div>`;
}
function historyHtml(g,hitter){
 const pitches=g.pitches.filter(p=>p.hitter===hitter);
 const tab=g.historyTab||'LIVE';
 let show=pitches.filter(p=>p.pa===g.paNumber);
 if(/^AB\d+$/.test(tab)){
   const n=Number(tab.slice(2)), completed=g.plateAppearances.filter(pa=>pa.hitter===hitter)[n-1];
   show=completed?pitches.filter(p=>p.pa===completed.pa):[];
 }else if(tab==='ALL')show=pitches;
 const ordered=[...show].reverse();
 return ordered.map(p=>`<div class="history-chip"><div class="history-chip-head"><strong>${esc(p.result)}</strong><span>${esc(p.pitchType)}</span></div><div class="mini-zone">
 ${['T','L','C1','C2','C3','C4','R','B'].map(z=>`<span class="mini-zone-cell mz-${z.toLowerCase()} ${p.zone===z?pitchMarkClass(p):''}"></span>`).join('')}</div></div>`).join('')||'<div class="history-empty" aria-label="Next pitch"></div>';
}
function aiSuggestions(g,hitter){
 const ps=allPitches(true).filter(p=>p.hitter===hitter&&p.pitchType);
 if(!ps.length)return [{label:'—',pct:0},{label:'—',pct:0}];
 const m={}; ps.forEach(p=>{const key=`${p.zone?zoneGroup(p.zone):''} ${p.pitchType}`.trim();m[key]=(m[key]||0)+1});
 return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,2).map(([k,v])=>({label:k.replace('IN FB','IN').replace('OUT FB','OUT').replace('IN CH','CHin').replace('OUT CH','CHout'),pct:Math.round(v/ps.length*100)})).concat([{label:'—',pct:0},{label:'—',pct:0}]).slice(0,2);
}
function hitModal(kind){
 const isOut=kind==='H4O';
 return `<div class="modal-backdrop hit-backdrop"><div class="modal hit-modal ${isOut?'out-contact':'hit-contact'}">
 <div class="topbar"><button class="btn" data-close>Cancel</button><div class="brand" style="text-align:center">${kind}</div><div style="width:94px"></div></div>
 <div class="field-wrap"><div class="field">${[1,2,3,4,5,6,7,8,9].map(n=>`<button class="pos p${n}" data-fielder="${n}">${n}</button>`).join('')}</div></div>
 <div class="hit-options"><div class="contact-board">
  <div class="contact-left">
   <div class="compact-three">${['HIT','BUNT','SLAP'].map(x=>`<button class="choice" data-contact="${x}">${x}</button>`).join('')}</div>
   ${isOut?`<div class="compact-four out-grid">${['GO','LO','FO','PO'].map(x=>`<button class="choice" data-outtype="${x}">${x}</button>`).join('')}</div>`:
   `<div class="compact-three">${['GB','LD','FB'].map(x=>`<button class="choice" data-batted="${x}">${x}</button>`).join('')}</div>
    <div class="compact-four bases-grid">${['1B','2B','3B','HR'].map(x=>`<button class="choice blue" data-hit="${x}">${x}</button>`).join('')}</div>`}
  </div>
  <div class="contact-right">
   <div class="qual-grid">${isOut?'':`<button class="choice" data-qual="E">E</button><button class="choice" data-qual="FC">FC</button>`}<button class="choice qual-wide" data-qual="SAC">SAC</button><button class="choice" data-qual="RBI">RBI</button><button class="choice" data-qual="RBA">RBA</button></div>
  </div>
 </div><button class="btn block black save-contact" id="saveContact" disabled>${isOut?'Save Out':'Save Hit'}</button></div></div></div>`;
}
function reportModal(){
 const g=reportMode==='current'?currentGame():null;
 const source=reportMode==='current'?(g?.plateAppearances||[]):allPAs(false);
 const filtered=reportFilterHitter==='All Hitters'?source:source.filter(p=>p.hitter===reportFilterHitter);
 const s=statsForPAs(filtered);
 const hitters=[...new Set(source.map(p=>p.hitter))];
 return `<div class="modal-backdrop"><div class="modal">
 <div class="report-tabs"><button class="btn ${reportMode==='current'?'black':''}" data-rmode="current">Current</button><button class="btn ${reportMode==='saved'?'black':''}" data-rmode="saved">Saved</button><button class="btn gold" id="exportReport">Export</button><button class="btn" data-close>Close</button></div>
 <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px"><button class="btn ${reportSub==='spray'?'black':''}" data-rsub="spray">Spray Chart</button><button class="btn ${reportSub==='zone'?'black':''}" data-rsub="zone">Zone Chart</button></div>
 <div class="panel" style="margin:14px 0 0">
 <select class="input" id="reportHitter"><option>All Hitters</option>${db.roster.map(r=>`<option ${reportFilterHitter===r.name?'selected':''}>${esc(r.name)}</option>`).join('')}</select>
 <div style="font-size:26px;margin-top:14px">${reportMode==='saved'?db.savedGames.length+' Saved Games':'Current Game'}</div>
 <div class="report-stat-grid">${[['PA',s.PA],['AVG',round3(s.AVG)],['OBP',round3(s.OBP)],['SLG',round3(s.SLG)],['OPS',round3(s.OPS)]].map(([k,v])=>`<div class="report-stat"><b>${v}</b><span>${k}</span></div>`).join('')}</div>
 <h3>COUNT PERFORMANCE <span style="color:#3762db">H</span> | <span style="color:#c83832">H4O</span> | <span style="color:#c83832">K</span> | AVE</h3>
 <div class="count-grid">${['0-0','0-2','1-2','2-2','3-2','6+'].map(c=>countCard(filtered,c)).join('')}</div>
 ${reportSub==='spray'?sprayReport(filtered):zoneReport(filtered)}
 </div></div></div>`;
}
function countCard(pas,bucket){
 const matches=pas.filter(pa=>{
  if(bucket==='6+')return pa.pitchCount>=6;
  return pa.finalCount===bucket;
 });
 const h=matches.filter(p=>p.outcome==='HIT').length,o=matches.filter(p=>p.outcome==='H4O').length,k=matches.filter(p=>p.outcome==='K').length,ave=(h+o+k)?h/(h+o+k):0;
 return `<div class="count-card"><b>${bucket}</b>${h} | ${o} | ${k} | ${round3(ave)}</div>`;
}
function sprayReport(pas){
 const items=pas.filter(p=>['HIT','H4O'].includes(p.outcome));
 return `<h3 style="margin-top:22px">SPRAY CHART</h3><div class="field" style="margin:0 auto;max-width:500px">${items.map((p,i)=>{
  const coords={1:[50,66],2:[50,85],3:[66,59],4:[62,47],5:[34,59],6:[38,47],7:[22,24],8:[50,13],9:[78,24]}[p.fielder]||[50,65];
  return `<span style="position:absolute;left:${coords[0]}%;top:${coords[1]}%;width:22px;height:22px;border-radius:50%;background:${p.outcome==='HIT'?'#3862db':'#cf3832'};border:3px solid white;transform:translate(-50%,-50%)"></span>`;
 }).join('')}</div>`;
}
function zoneReport(pas){
 const ps=allPitches(reportMode==='current').filter(p=>reportFilterHitter==='All Hitters'||p.hitter===reportFilterHitter);
 const z={T:0,L:0,R:0,B:0,C1:0,C2:0,C3:0,C4:0};ps.forEach(p=>z[p.zone]=(z[p.zone]||0)+1);const n=ps.length||1;
 const heat=heatStyles(z,heatColors.REPORT);
 return `<h3 style="margin-top:22px">ZONE CHART</h3><div class="zone-layout" style="max-width:480px;margin:10px auto">
 <div class="zone zone-top heat-zone" style="${heat.T}"><span class="pct">${Math.round(z.T/n*100)}%</span></div><div class="zone zone-left heat-zone" style="${heat.L}"><span class="pct">${Math.round(z.L/n*100)}%</span></div>
 <div class="core-grid">${['C1','C2','C3','C4'].map(k=>`<div class="zone core heat-zone" style="${heat[k]}"><span class="pct">${Math.round(z[k]/n*100)}%</span></div>`).join('')}</div>
 <div class="zone zone-right heat-zone" style="${heat.R}"><span class="pct">${Math.round(z.R/n*100)}%</span></div><div class="zone zone-bottom heat-zone" style="${heat.B}"><span class="pct">${Math.round(z.B/n*100)}%</span></div></div>`;
}
function reportsPage(){
 return `<div class="hero"><div class="hero-row"><button class="btn" data-go="home">Home</button><div><div class="kicker">KC REBELS</div><h1>Reports</h1><p>Review saved games and trends.</p></div></div></div>
 <div class="panel"><button class="btn black block" id="openSavedReports">Open Saved Reports</button>
 <div style="margin-top:20px">${db.savedGames.length?db.savedGames.map(g=>`<div class="count-card" style="margin-bottom:10px"><b>${new Date(g.date).toLocaleDateString()}</b> ${esc(g.opponent||'Opponent')} · ${g.plateAppearances.length} PA</div>`).join(''):'No saved games yet.'}</div></div>`;
}
function grade(value,metric){
 const rules={
  AVG:[[.4,'excellent'],[.35,'good'],[.3,'acceptable'],[.25,'concern'],[-Infinity,'serious']],
  OBP:[[.475,'excellent'],[.425,'good'],[.375,'acceptable'],[.325,'concern'],[-Infinity,'serious']],
  SLG:[[.6,'excellent'],[.5,'good'],[.4,'acceptable'],[.325,'concern'],[-Infinity,'serious']],
  contact:[[.9,'excellent'],[.85,'good'],[.8,'acceptable'],[.75,'concern'],[-Infinity,'serious']],
  BB:[[.15,'excellent'],[.10,'good'],[.07,'acceptable'],[.04,'concern'],[-Infinity,'serious']]
 };
 if(metric==='K'){
  if(value<.10)return'excellent';if(value<=.15)return'good';if(value<=.20)return'acceptable';if(value<=.25)return'concern';return'serious';
 }
 return rules[metric].find(([min])=>value>=min)[1];
}
function evalView(){
 const player=evalPlayer==='Team'?null:hitterObj(evalPlayer);
 const pas=allPAs().filter(p=>!player||p.hitter===player.name);
 const s=statsForPAs(pas);
 const teamS=statsForPAs(allPAs());
 const rp100=s.PA?s.rp/s.PA*100:0;
 const teamRate=teamS.PA?teamS.rp/teamS.PA:0;
 const hotb=s.PA&&teamRate?Math.round((s.rp/s.PA)/teamRate*100):null;
 const execs=pas.map(p=>p.execution).filter(v=>v!==null);
 const execution=execs.length?execs.filter(Boolean).length/execs.length:null;
 const ms=measurementTypes(player);
 return `<div class="eval-head"><button class="btn eval-nav" data-go="${currentGame()?'live':'home'}">${currentGame()?'Return':'Home'}</button><div class="eval-title"><div class="teamname">KC REBELS REGIONAL LICKEL</div><h1>Player / Team Eval</h1></div></div>
 <select class="player-select" id="evalSelect"><option>Team</option>${db.roster.map(r=>`<option ${evalPlayer===r.name?'selected':''}>${esc(r.name)}</option>`).join('')}</select>
 ${player?`<div class="player-card player-profile"><div class="grad-year">${esc(player.grad)}</div><div class="player-photo">${player.photo?`<img src="${encodeURI(player.photo)}" alt="${esc(player.name)}">`:esc(player.name.split(' ').map(x=>x[0]).join(''))}</div><div class="player-info"><div class="name">${esc(player.name)}</div><div class="meta"><span>#${esc(player.jersey)}</span> | ${esc(player.positions)} | GPA ${esc(player.gpa)}</div><div class="interest">${esc(player.interest)} <span>| ${esc(player.school)}</span></div></div></div>`:
 `<div class="player-card team-profile"><div class="player-photo team-photo"><img src="Rebels%20REG%20White%20with%20red%20wing%20-%20REGIONAL.png" alt="KC Rebels"></div><div class="player-info"><div class="name">KC Rebels</div><div class="meta">${pas.length} saved plate appearances</div></div></div>`}
 <div class="eval-tiles">
  <div class="eval-tile dark" data-guide="HotB+"><h3>HotB+</h3><div class="value">${hotb??'—'}</div><div class="note">${player?'More saved data needed':'Current-team benchmark'}</div></div>
  <div class="eval-tile" data-guide="Runs Produced"><h3>Runs Produced</h3><div class="value">${s.rp.toFixed(1)}</div><div class="note">${player?`Team player avg ${(teamS.rp/Math.max(1,db.roster.length)).toFixed(1)}`:'Team total'}</div></div>
  <div class="eval-tile" data-guide="RP / 100 PA"><h3>RP / 100 PA</h3><div class="value">${rp100.toFixed(1)}</div><div class="note">Detailed production rate</div></div>
  <div class="eval-tile" data-guide="Execution"><h3>Execution</h3><div class="value">${execution===null?'—':pct0(execution)}</div><div class="note">Hitting Plan</div></div>
 </div>
 <div class="performance"><h2>Game Performance <span class="small" style="float:right">CUMULATIVE TO DATE</span></h2><div class="perf-grid">
 ${[['AVG',round3(s.AVG),'AVG'],['OBP',round3(s.OBP),'OBP'],['SLG',round3(s.SLG),'SLG'],['CONTACT',pct0(s.contactPct),'contact'],['K%',pct1(s.kPct),'K'],['BB%',pct1(s.bbPct),'BB']].map(([label,val,key])=>`<div class="perf ${s.PA>=25?grade(s[key==='contact'?'contactPct':key==='K'?'kPct':key==='BB'?'bbPct':key],key):''}" data-guide="${label}"><b>${val}</b><span>${label}</span></div>`).join('')}
 </div></div>
 <div class="athletic"><div class="athletic-head"><h2>Athletic Bests</h2><button class="btn black" id="recordMeasure2">+ Record</button></div>
 <div class="measure-grid">${ms.map(m=>measurementCard(player,m)).join('')}</div></div>`;
}
function measurementTypes(player){
 const base=['Home to First','Overhand Throw','Exit Velocity','Broad Jump'];
 if(player?.positions?.includes('RHP'))base.push('Fastball','Changeup');
 if(player?.positions?.includes('C'))base.push('Pop Time');
 return base;
}
function measurementCard(player,type){
 const rows=db.measurements.filter(m=>(!player||m.player===player.name)&&m.type===type);
 const isTime=['Home to First','Pop Time'].includes(type);
 const vals=rows.map(r=>Number(r.value)).filter(Number.isFinite);
 const best=vals.length?(isTime?Math.min(...vals):Math.max(...vals)):null;
 return `<button class="measure" data-measure="${esc(type)}"><h3>${type}</h3><div class="best">${best===null?'—':best}</div><div class="note">${vals.length?`${vals.length} attempt${vals.length===1?'':'s'} recorded`:'Tap to record'}</div></button>`;
}
function evalGuide(title){
 const content={
 'HotB+':`HotB+ compares this hitter’s Runs Produced rate per plate appearance with the current team rate. 100 is team average; 120 is 20% above it.`,
 'Runs Produced':`Runs Produced estimates total offensive contribution. It is cumulative, so playing time matters. The comparison underneath shows the average total among players with saved plate appearances.`,
 'RP / 100 PA':`RP / 100 PA puts every hitter on the same 100-plate-appearance workload, making production rates easier to compare regardless of playing time.`,
 'Execution':`Execution measures qualifying at-bats in which the hitter made contact with the selected plan before reaching two strikes. Two-strike at-bats are excluded because the plan changes to protect and make contact.`
 }[title];
 if(content)return `<div class="modal-backdrop"><div class="modal dark"><div class="modal-header"><div><div class="small" style="color:#ddd;letter-spacing:2px">PLAYER EVALUATION GUIDE</div><h2>${title}</h2></div><button class="btn" data-close>Close</button></div><hr style="border-color:#555"><p style="font-size:22px;line-height:1.45;font-weight:800">${content}</p></div></div>`;
 const metricMap={AVG:'Batting Average',SLG:'Slugging Percentage',OBP:'On-Base Percentage',CONTACT:'Contact Percentage','K%':'Strikeout Percentage','BB%':'Walk Percentage'};
 const table={
  AVG:[['Excellent','.400+'],['Good','.350–.399'],['Acceptable','.300–.349'],['Concern','.250–.299'],['Serious concern','Under .250']],
  SLG:[['Excellent','.600+'],['Good','.500–.599'],['Acceptable','.400–.499'],['Concern','.325–.399'],['Serious concern','Under .325']],
  OBP:[['Excellent','.475+'],['Good','.425–.474'],['Acceptable','.375–.424'],['Concern','.325–.374'],['Serious concern','Under .325']],
  CONTACT:[['Excellent','90%+'],['Good','85–89.9%'],['Acceptable','80–84.9%'],['Concern','75–79.9%'],['Serious concern','Below 75%']],
  'BB%':[['Excellent','15%+'],['Good','10–14.9%'],['Acceptable','7–9.9%'],['Concern','4–6.9%'],['Serious concern','Under 4%']],
  'K%':[['Excellent','Under 10%'],['Good','10–15%'],['Acceptable','15.1–20%'],['Concern','20.1–25%'],['Serious concern','Over 25%']]
 }[title];
 return `<div class="modal-backdrop"><div class="modal dark"><div class="modal-header"><div><div class="small" style="color:#ddd;letter-spacing:2px">PLAYER EVALUATION GUIDE</div><h2>${metricMap[title]}</h2></div><button class="btn" data-close>Close</button></div><table class="guide-table"><thead><tr><th>Rating</th><th>${title.replace('CONTACT','Contact%')}</th></tr></thead><tbody>${table.map(([r,v],i)=>`<tr><td class="${['excellent','good','acceptable','concern','serious'][i]}">${r}</td><td><b>${v}</b></td></tr>`).join('')}</tbody></table><p class="small" style="color:#ddd">The app begins color-grading a player after 25 saved plate appearances.</p></div></div>`;
}
function recordModal(){
 const p=evalPlayer==='Team'?db.roster[0]?.name:evalPlayer;
 const player=hitterObj(p);
 const types=measurementTypes(player);
 return `<div class="modal-backdrop"><div class="modal"><div class="modal-header"><h2>Record Measurement</h2><button class="btn" data-close>Close</button></div>
 <label class="label">Player</label><select class="input" id="mPlayer">${db.roster.map(r=>`<option ${r.name===p?'selected':''}>${esc(r.name)}</option>`).join('')}</select>
 <label class="label">Measurement</label><select class="input" id="mType">${types.map(t=>`<option ${t===recordType?'selected':''}>${t}</option>`).join('')}</select>
 <div class="stopwatch" style="margin-top:18px"><button class="btn green" id="timerStart" style="font-size:28px">Start</button><div style="flex:1;text-align:center"><div class="small">STOPWATCH</div><div class="time" id="timerTime">0.00</div></div></div>
 <label class="label">Manual Time / Value</label><input class="input" id="mValue" inputmode="decimal" placeholder="0.00">
 <label class="label">Date</label><input class="input" id="mDate" type="date" value="${new Date().toISOString().slice(0,10)}">
 <button class="btn block red savebar" id="saveMeasurement" disabled>Save Attempt</button>
 <p class="small">Every attempt is retained. The player page displays the best result.</p></div></div>`;
}
function gameActionModal(kind){
 const g=currentGame();
 const isEnd=kind==='endGame';
 const opponent=g?.opponent?.trim()||'this opponent';
 return `<div class="modal-backdrop"><div class="modal game-action-modal" role="alertdialog" aria-modal="true" aria-label="${isEnd?'End Game':'Unsaved Game'}">
  <h2>${isEnd?'End Game':'Unsaved Game'}</h2>
  <p>${isEnd?`Save and End the game against ${esc(opponent)}?`:'To keep this game, select Cancel and then use End Game. Continuing will permanently erase the current game.'}</p>
  <div class="game-action-buttons"><button class="btn" data-close>Cancel</button><button class="btn red" id="confirmGameAction">${isEnd?'Save & End Game':'Continue Without Saving'}</button></div>
 </div></div>`;
}
function modalView(){
 if(modal==='HIT'||modal==='H4O')return hitModal(modal);
 if(modal==='reports')return reportModal();
 if(modal==='record')return recordModal();
 if(modal==='newWarning'||modal==='endGame')return gameActionModal(modal);
 if(modal?.startsWith('guide:'))return evalGuide(modal.slice(6));
 return '';
}
function bind(){
 $$('[data-go]').forEach(el=>el.onclick=()=>go(el.dataset.go));
 $$('[data-close]').forEach(el=>el.onclick=()=>{modal=null;render()});
 if(route==='new')bindNew();
 if(route==='roster')bindRoster();
 if(route==='live')bindLive();
 if(route==='eval')bindEval();
 if(route==='reports') $('#openSavedReports')?.addEventListener('click',()=>{modal='reports';reportMode='saved';render()});
 if(modal==='HIT'||modal==='H4O')bindContact();
 if(modal==='reports')bindReports();
 if(modal==='record')bindRecord();
 if(modal==='newWarning'||modal==='endGame')bindGameAction();
}
function bindNew(){
 const sels=$$('.batting-select');
 const update=()=>{
  const selections=sels.map(s=>s.value);
  sels.forEach((s,i)=>{
   const current=selections[i];
   const used=new Set(selections.filter((v,j)=>j!==i&&v));
   const available=db.roster.filter(r=>!used.has(r.name));
   s.innerHTML=`<option value="">Select hitter</option>${available.map(r=>`<option value="${esc(r.name)}">${esc(r.name)} (${r.side})</option>`).join('')}`;
   s.value=current;
  });
  const vals=selections.filter(Boolean);
  $('#hitterCount').textContent=`${vals.length} hitters`;
  // A selected hitter is enough to begin; matchup details may be added later.
  $('#startGame').disabled=!vals.length;
 };
 ['input','change'].forEach(evt=>[$('#opponent'),$('#pitcherName'),$('#pitcherNumber'),...sels].forEach(x=>x?.addEventListener(evt,update)));
 $('#pitcherName').addEventListener('change',()=>{
   const p=db.pitchers.find(p=>p.name===$('#pitcherName').value);if(p&&!$('#pitcherNumber').value)$('#pitcherNumber').value=p.number||'';
 });
 $('#startGame').onclick=()=>{
  const order=sels.map(s=>s.value).filter(Boolean);
  createGame($('#opponent').value.trim(),$('#pitcherName').value.trim(),$('#pitcherNumber').value.trim(),order);go('live');
 };
}
function bindRoster(){
 $$('.sidebtn').forEach(b=>b.onclick=()=>{db.roster[+b.dataset.i].side=b.dataset.side;save();render()});
 $$('[data-del]').forEach(b=>b.onclick=()=>{if(confirm('Remove this player?')){db.roster.splice(+b.dataset.del,1);save();render()}});
 $('#addPlayer').onclick=()=>{db.roster.push({name:'Guest',side:'R',jersey:'',grad:'',positions:'',gpa:'',interest:'',school:'',isGuest:true});save();render();setTimeout(()=>window.scrollTo(0,document.body.scrollHeight),0)};
 $('#saveRoster').onclick=()=>{$$('.roster-name').forEach(inp=>db.roster[+inp.dataset.i].name=inp.value.trim()||'Unnamed Player');save();go('home')};
}
function bindLive(){
 const g=currentGame();
 const percentMode=!g.firstPitchView&&(g.zoneScope==='TEAM'||g.previewNext||(g.historyTab==='ALL'&&(g.allView||'DOTS')==='PCT'));
 $$('[data-plan]').forEach(b=>b.onclick=()=>{
   g.plan=b.dataset.plan;
   db.planPreferences=db.planPreferences||{};
   db.planPreferences[currentHitter(g).name]=b.dataset.plan;
   save();render();
 });
 $$('[data-outs]').forEach(b=>b.onclick=()=>{g.outs=+b.dataset.outs;save();render()});
 $$('[data-runner]').forEach(b=>b.onclick=()=>{const n=+b.dataset.runner;g.runners=g.runners.includes(n)?g.runners.filter(x=>x!==n):[...g.runners,n];save();render()});
 $$('[data-ptype]').forEach(b=>b.onclick=()=>{g.pitchType=b.dataset.ptype;save();render()});
 $$('[data-zone]').forEach(z=>z.onclick=()=>{g.historyTab='LIVE';g.zoneScope='HITTER';g.previewNext=false;g.firstPitchView=false;g.allView='DOTS';g.showAi=false;g.pendingZone=z.dataset.zone;save();render()});
 $$('[data-tab]').forEach(b=>b.onclick=()=>{const tab=b.dataset.tab;if(tab==='ALL'){if(g.historyTab!=='ALL'){g.historyTab='ALL';g.allView='DOTS'}else{g.allView=(g.allView||'DOTS')==='DOTS'?'PCT':'DOTS';if(g.allView==='PCT')g.zoneFilter='K'}}else{g.historyTab=tab}g.zoneScope='HITTER';g.previewNext=false;g.firstPitchView=false;save();render()});
 $('#zoneScope').onclick=()=>{const team=(g.zoneScope||'HITTER')!=='TEAM';g.zoneScope=team?'TEAM':'HITTER';g.zoneFilter='K';g.previewNext=false;g.historyTab='LIVE';g.firstPitchView=false;g.showAi=false;save();render()};
 $('#zoneNext').onclick=()=>{if(g.battingOrder.length<2)return;g.previewNext=!g.previewNext;g.zoneScope='HITTER';g.zoneFilter='K';g.historyTab='LIVE';g.firstPitchView=false;g.showAi=false;save();render()};
 $('#fpsBtn').onclick=()=>{g.firstPitchView=!g.firstPitchView;g.zoneScope='HITTER';g.previewNext=false;g.showAi=false;save();render()};
 $$('[data-result]').forEach(b=>b.onclick=()=>{
   const r=b.dataset.result;
   if(percentMode){if(r!=='HBP'){g.zoneFilter=r==='KL'?'K':r;save();render()}return}
   if(g.previewNext||g.historyTab==='ALL'||g.firstPitchView)return;
   if(!g.pendingZone && !['HBP'].includes(r)){alert('Select a pitch location first.');return}
   if(r==='HIT'||r==='H4O'){modal=r;render()} else addPitch(r);
 });
 $('#undo').onclick=undo;
 $('#openProfile').onclick=()=>{evalPlayer=currentHitter(g).name;go('eval')};
 $('#openReports').onclick=()=>{modal='reports';reportMode='current';render()};
 $('#endGame').onclick=()=>{modal='endGame';render()};
 $('#newGame').onclick=()=>{modal='newWarning';render()};
 $('#aiBtn').onclick=()=>{g.showAi=!g.showAi;save();render()};
}
function bindGameAction(){
 $('#confirmGameAction').onclick=()=>{
   const g=currentGame();
   if(modal==='endGame'&&g){g.ended=true;db.savedGames.push(structuredClone(g));db.currentGame=null;modal=null;save();go('home');return}
   db.currentGame=null;modal=null;save();go('new');
 };
}
function bindContact(){
 let st={fielder:null,contact:null,batted:null,hitType:null,outType:null,quals:new Set()};
 $$('[data-fielder]').forEach(b=>b.onclick=()=>{$$('[data-fielder]').forEach(x=>x.classList.remove('active'));b.classList.add('active');st.fielder=+b.dataset.fielder;update()});
 $$('[data-contact]').forEach(b=>b.onclick=()=>{$$('[data-contact]').forEach(x=>x.classList.remove('active'));b.classList.add('active');st.contact=b.dataset.contact;update()});
 $$('[data-batted]').forEach(b=>b.onclick=()=>{$$('[data-batted]').forEach(x=>x.classList.remove('active'));b.classList.add('active');st.batted=b.dataset.batted;update()});
 $$('[data-hit]').forEach(b=>b.onclick=()=>{$$('[data-hit]').forEach(x=>x.classList.remove('active'));b.classList.add('active');st.hitType=b.dataset.hit;update()});
 $$('[data-outtype]').forEach(b=>b.onclick=()=>{$$('[data-outtype]').forEach(x=>x.classList.remove('active'));b.classList.add('active');st.outType=b.dataset.outtype;update()});
 $$('[data-qual]').forEach(b=>b.onclick=()=>{const q=b.dataset.qual;if(st.quals.has(q)){st.quals.delete(q);b.classList.remove('active')}else{st.quals.add(q);b.classList.add('active')}update()});
 const update=()=>{$('#saveContact').disabled=!(st.fielder&&(modal==='H4O'?(st.contact&&st.outType):(st.contact&&st.batted&&st.hitType)))};
 $('#saveContact').onclick=()=>{const kind=modal;modal=null;addPitch(kind,{fielder:st.fielder,contactType:st.batted||st.outType,hitType:st.hitType||'',bunt:st.contact==='BUNT',slap:st.contact==='SLAP',rbi:st.quals.has('RBI'),rba:st.quals.has('RBA'),sac:st.quals.has('SAC'),error:st.quals.has('E'),fc:st.quals.has('FC'),hhb:st.quals.has('HHB')})};
}
function bindReports(){
 $$('[data-rmode]').forEach(b=>b.onclick=()=>{reportMode=b.dataset.rmode;render()});
 $$('[data-rsub]').forEach(b=>b.onclick=()=>{reportSub=b.dataset.rsub;render()});
 $('#reportHitter').onchange=e=>{reportFilterHitter=e.target.value;render()};
 $('#exportReport').onclick=()=>exportCsv();
}
function exportCsv(){
 const source=reportMode==='current'?(currentGame()?.plateAppearances||[]):allPAs(false);
 const rows=[['Hitter','Inning','PA','Outcome','Hit Type','Fielder','Final Count','Pitch Count','RBI','RBA','SAC'],...source.map(p=>[p.hitter,p.inning,p.pa,p.outcome,p.hitType,p.fielder||'',p.finalCount,p.pitchCount,p.rbi,p.rba,p.sac])];
 const csv=rows.map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(',')).join('\n');
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download=`HotB_${reportMode}_report.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
function bindEval(){
 $('#evalSelect').onchange=e=>{evalPlayer=e.target.value;render()};
 $('#recordMeasure2').onclick=()=>{recordType='';modal='record';render()};
 $$('[data-measure]').forEach(x=>x.onclick=()=>{recordType=x.dataset.measure;modal='record';render()});
 $$('[data-guide]').forEach(x=>x.onclick=()=>{modal='guide:'+x.dataset.guide;render()});
}
function bindRecord(){
 const updateTypes=()=>{
  const p=hitterObj($('#mPlayer').value); const types=measurementTypes(p);$('#mType').innerHTML=types.map(t=>`<option>${t}</option>`).join('');
 };
 $('#mPlayer').onchange=updateTypes;
 $('#mValue').oninput=()=>{$('#saveMeasurement').disabled=!Number.isFinite(Number($('#mValue').value))};
 $('#timerStart').onclick=()=>{
  if(timerInt){clearInterval(timerInt);timerInt=null;$('#timerStart').textContent='Start';$('#mValue').value=(timerElapsed/1000).toFixed(2);$('#saveMeasurement').disabled=false;return}
  timerStart=performance.now()-timerElapsed;$('#timerStart').textContent='Stop';
  timerInt=setInterval(()=>{timerElapsed=performance.now()-timerStart;$('#timerTime').textContent=(timerElapsed/1000).toFixed(2)},30);
 };
 $('#saveMeasurement').onclick=()=>{
  db.measurements.push({id:crypto.randomUUID(),player:$('#mPlayer').value,type:$('#mType').value,value:Number($('#mValue').value),date:$('#mDate').value});
  save();modal=null;recordType='';timerElapsed=0;if(timerInt){clearInterval(timerInt);timerInt=null}render();
 };
}
render();
})();
