
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
 {name:'Claire Jack',side:'R',jersey:'25',grad:'2029',positions:'CIF | OF',gpa:'4.0',interest:'Biology',school:'Pratt HS',photo:'Claire-headshot.png'},
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
let infoPlayerIndex=0;
let pendingRosterImport=null;
let recruitingEmail={coachName:'',coachEmail:'',collegeName:'',personalNote:'',subject:'',body:''};
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
 const openingPitcher={name:pitcherName,number:pitcherNumber,enteredAt:Date.now(),pitchIndex:0};
 const g={
  id:crypto.randomUUID(),date:new Date().toISOString(),opponent,pitcherName,pitcherNumber,
  pitchersUsed:[openingPitcher],battingOrder:order,hittersUsed:[...order],hitterSubstitutions:[],currentIdx:0,inning:1,outs:0,runners:[],plan:planFor(order[0]),pitchType:'FB',
  balls:0,strikes:0,paNumber:1,pitches:[],plateAppearances:[],ended:false,
  pendingZone:null,zoneScope:'HITTER',zoneFilter:'K',previewNext:false,showAi:false,historyTab:'LIVE',allView:'DOTS',firstPitchView:false
 };
 db.currentGame=g;
 if(opponent&&!db.teams.includes(opponent))db.teams.push(opponent);
 rememberPitcher(opponent,pitcherName,pitcherNumber);
 save();return g;
}
function rememberPitcher(team,name,number){
 if(!name&&!number)return;
 const found=db.pitchers.find(p=>p.name===name&&p.number===number);
 if(found){
  found.teams=[...new Set([...(found.teams||[]),...(found.team?[found.team]:[]),...(team?[team]:[])])];
 }else db.pitchers.push({name,number,teams:team?[team]:[]});
}
function hitterObj(name){return db.roster.find(r=>r.name===name)||{name,side:'R',jersey:'',grad:'',positions:'',gpa:'',interest:'',school:''}}
const recruitingColumns=[
 ['Player Name','name'],['Jersey #','jersey'],['Grad Year','grad'],['Positions','positions'],['GPA','gpa'],['High School','school'],
 ['Intended College Major','interest'],['Bats','side'],['Throws','throws'],['Player Email','email'],['Player Phone','phone'],
 ['Twitter / X URL','twitter'],['SportsRecruits URL','sportsRecruits'],['Highlight Video URL','highlightVideo'],['NCAA ID','ncaaId'],
 ['Recruiting Statement','recruitingStatement'],['Accomplishments / Honors','accomplishments'],['Additional Notes','notes']
];
function cleanCell(value){return String(value??'').trim()}
function normalizeName(value){return cleanCell(value).toLowerCase().replace(/\s+/g,' ')}
function syncRosterNames(){
 $$('.roster-name').forEach(input=>{const player=db.roster[+input.dataset.i];if(player)player.name=input.value.trim()||'Unnamed Player'});
}
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
  zone:g.pendingZone||'',pitchType:g.pitchType,plan:g.plan,result,pitcherName:g.pitcherName||'',pitcherNumber:g.pitcherNumber||'',ts:Date.now(),...extra
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
 return `<div class="page-match-head"><h1>New Game</h1><button class="page-head-nav" data-go="home">Home</button></div>
 <div class="panel"><div class="section-title">MATCHUP</div>
  <label class="label">Opponent</label><input id="opponent" class="input" placeholder="Select or enter team" list="teamList"><datalist id="teamList">${db.teams.map(t=>`<option>${esc(t)}</option>`).join('')}</datalist>
  <div class="grid2"><div><label class="label">Pitcher Name</label><input id="pitcherName" class="input" placeholder="Select or enter pitcher name" list="pitcherList"><datalist id="pitcherList">${db.pitchers.map(p=>`<option value="${esc(p.name)}"></option>`).join('')}</datalist></div>
  <div><label class="label">Number</label><input id="pitcherNumber" class="input" placeholder="Auto"></div></div>
 </div>
 <div class="panel"><div style="display:flex"><div class="section-title">BATTING ORDER</div><div style="flex:1"></div><span class="small" id="hitterCount">0 hitters</span></div>${rows}</div>
 <div class="bottom-action"><button class="btn block black" id="startGame" disabled>START GAME</button></div>`;
}
function rosterView(){
 return `<div class="roster-hero"><div class="roster-hero-row"><button class="roster-nav roster-cancel" data-go="home">Cancel</button><h1>Edit Roster</h1><button class="roster-nav roster-save" id="saveRoster">Save</button></div></div>
 <div class="roster-data-tools"><button class="btn black" id="importRosterInfo">Import Info</button><button class="btn" id="exportRosterInfo">Export Info</button><input id="rosterInfoFile" type="file" accept=".xlsx,.csv" hidden><p>Import the Excel template for larger updates, or tap <b>Info</b> beside one player for a quick change. Blank imported cells leave saved information unchanged.</p></div>
 <div class="roster-editor">${db.roster.map((r,i)=>`<div class="roster-edit-row">
 <input class="input roster-name" data-i="${i}" value="${esc(r.name)}">
 <button class="sidebtn ${r.side==='R'?'active':''}" data-side="R" data-i="${i}">R</button>
 <button class="sidebtn ${r.side==='L'?'active':''}" data-side="L" data-i="${i}">L</button>
 <button class="infobtn" data-info="${i}">Info</button>
 <button class="deletebtn" data-del="${i}">×</button>
 </div>`).join('')}
 <button class="btn black block" id="addPlayer">+ Add Player</button></div>`;
}
function liveView(){
 const g=currentGame();if(!g)return `<div class="panel"><p>No current game.</p><button class="btn" data-go="new">New Game</button></div>`;
 const h=currentHitter(g);
 const currentPlan=g.plan||planFor(h.name);
 const activePitchType=g.pitchType||'FB';
 const aps=g.plateAppearances.filter(p=>p.hitter===h.name);
 const nextName=g.battingOrder.length>1?g.battingOrder[(g.currentIdx+1)%g.battingOrder.length]:'';
 const chartName=g.previewNext?nextName:h.name;
 const activeNames=new Set(g.hittersUsed||g.battingOrder);
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
 const histPitches=g.firstPitchView?firstPitches.filter(p=>p.result!=='B'):percentMode?sourcePitches.filter(p=>resultGroup(p)===filter):sourcePitches;
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
 return `<div class="topbar chart-head"><div class="brand">Hit Chart</div><button id="openProfile">Profile</button><button id="openReports">Reports</button><button class="end" id="endGame">End</button></div>
 <div class="live-top">
  <button class="statbox hitter-box live-stat-button" id="changeHitter" aria-label="Substitute for ${esc(h.name)}"><div class="cap">HITTER</div><div class="big">${esc(h.name)}</div><div class="sidebadge">${h.side}</div></button>
  <div class="statbox"><div class="cap">INN</div><div class="big">${g.inning}</div></div>
  <div class="statbox"><div class="cap">COUNT</div><div class="big">${g.balls}-${g.strikes}</div></div>
  <button class="statbox live-stat-button" id="changePitcher" aria-label="Change pitcher"><div class="cap">PITCHER</div><div class="big">#${esc(g.pitcherNumber||'')}</div></button>
 </div>
 <div class="control-row">
  <div class="control-card"><div class="pill-row">${['IN','OUT','CH','NO'].map(x=>`<button class="pill red ${g.strikes<2&&currentPlan===x?'active':''}" data-plan="${x}">${x}</button>`).join('')}</div></div>
  <div class="control-card"><div class="pill-row">${[0,1,2].map(x=>`<button class="pill ${g.outs===x?'active':''}" data-outs="${x}">${x}</button>`).join('')}</div></div>
  <div class="control-card"><div class="pill-row">${[3,2,1].map(x=>`<button class="runner ${g.runners.includes(x)?'active':''}" data-runner="${x}"><span>${x}</span></button>`).join('')}</div></div>
 </div>
 <div class="live-workspace"><div class="live-left"><div class="zone-card">
  <div class="pitchtypes">${['FB','CH','RS','DP','CV','SC'].map(x=>`<button class="pitchtype ${activePitchType===x?'active':''}" data-ptype="${x}">${x}</button>`).join('')}</div>
  <div class="zone-layout">
   <button class="zone-scope ${g.zoneScope==='TEAM'?'active':''}" id="zoneScope">${g.zoneScope==='TEAM'?'HTR':'TM'}</button>
   <div class="zone zone-top ${showPct?'heat-zone':''} ${g.pendingZone==='T'?'selected':''}" style="${showPct?heat.T:''}" data-zone="T">${zoneContent('T')}</div>
   <div class="zone zone-left ${showPct?'heat-zone':''} ${g.pendingZone==='L'?'selected':''}" style="${showPct?heat.L:''}" data-zone="L">${zoneContent('L')}</div>
   <div class="core-grid">${['C1','C2','C3','C4'].map(z=>`<div class="zone core ${showPct?'heat-zone':''} ${g.pendingZone===z?'selected':''}" style="${showPct?heat[z]:''}" data-zone="${z}">${zoneContent(z)}</div>`).join('')}</div>
   <div class="zone zone-right ${showPct?'heat-zone':''} ${g.pendingZone==='R'?'selected':''}" style="${showPct?heat.R:''}" data-zone="R">${zoneContent('R')}</div>
   <div class="zone zone-bottom ${showPct?'heat-zone':''} ${g.pendingZone==='B'?'selected':''}" style="${showPct?heat.B:''}" data-zone="B">${zoneContent('B')}</div>
   <button class="zone-next ${g.previewNext?'active':''}" id="zoneNext" ${nextName?'': 'disabled'}>${g.previewNext?nextInitials:'NXT'}</button>
   <button class="fps ${g.firstPitchView?'active':''}" id="fpsBtn" aria-label="First-pitch strike percentage"><strong class="${Math.round(fps(g)*100)===100?'fps-compact':'fps-standard'}">${Math.round(fps(g)*100)}%</strong></button>
  </div>
  <div class="zone-tools"><button class="ai" id="aiBtn">Ai</button>
   ${g.showAi?`<div class="ai-suggestions">${suggestions.map((s,i)=>`<div class="ai-box"><span class="ai-rank">#${i+1}</span><span class="ai-pitch">${esc(s.label)}</span><span class="ai-pct">${s.pct}%</span></div>`).join('')}</div>`:''}
  </div>
 </div>
 <div class="tabs ${showAll?'with-all':'without-all'}"><button class="tab fixed-tab ${(g.historyTab||'LIVE')==='LIVE'?'active':''}" data-tab="LIVE">LIVE</button><div class="ab-scroll">${abTabNames.map(t=>`<button class="tab ${(g.historyTab||'LIVE')===t?'active':''}" data-tab="${t}">${t}</button>`).join('')}${showAll?`<button class="tab ${(g.historyTab||'LIVE')==='ALL'?'active':''}" data-tab="ALL">${g.historyTab==='ALL'&&(g.allView||'DOTS')==='DOTS'?'%':'ALL'}</button>`:''}</div></div>
 <div class="results">
  <button class="result hbp" data-result="HBP" ${statsMode?'disabled':''}>HBP</button><button class="result ball ${percentMode&&filter==='B'?'filter-active':''}" data-result="B">B</button><button class="result foul ${percentMode&&filter==='F'?'filter-active':''}" data-result="F">F</button><button class="result hit ${percentMode&&filter==='HIT'?'filter-active':''}" data-result="HIT">HIT</button>
  <button class="result undo" id="undo" ${statsMode?'disabled':''}>Undo</button><button class="result strike ${percentMode&&filter==='K'?'filter-active':''}" data-result="K">K</button><button class="result strike ${percentMode&&filter==='K'?'filter-active':''}" data-result="KL">KL</button><button class="result out ${percentMode&&filter==='H4O'?'filter-active':''}" data-result="H4O">H4O</button>
 </div></div><div class="history-panel">${historyHtml(g,g.previewNext?chartName:h.name)}</div></div>`;
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
 return ordered.map((p,i)=>{
   const divider=tab==='ALL'&&i>0&&p.pa!==ordered[i-1].pa?'<div class="history-ab-divider" aria-hidden="true"></div>':'';
   return `${divider}<div class="history-chip"><div class="history-chip-head"><strong>${esc(p.result)}</strong><span>${esc(p.pitchType)}</span></div><div class="mini-zone">
 ${['T','L','C1','C2','C3','C4','R','B'].map(z=>`<span class="mini-zone-cell mz-${z.toLowerCase()} ${p.zone===z?pitchMarkClass(p):''}"></span>`).join('')}</div></div>`;
 }).join('')||'<div class="history-empty" aria-label="Next pitch"></div>';
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
 return `<div class="page-match-head page-head-centered"><button class="page-head-nav" data-go="home">Home</button><h1>Reports</h1><span class="page-head-spacer"></span></div>
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
 const teamPas=allPAs();
 const pas=teamPas.filter(p=>!player||p.hitter===player.name);
 const s=statsForPAs(pas);
 const teamS=statsForPAs(teamPas);
 const rp100=s.PA?s.rp/s.PA*100:0;
 const teamRate=teamS.PA?teamS.rp/teamS.PA:0;
 const teamRp100=teamRate*100;
 const playerTotals=db.roster.map(r=>statsForPAs(teamPas.filter(p=>p.hitter===r.name))).filter(x=>x.PA>0);
 const avgPlayerRp=playerTotals.length?playerTotals.reduce((sum,x)=>sum+x.rp,0)/playerTotals.length:0;
 const hotb=s.PA&&teamRate?Math.round((s.rp/s.PA)/teamRate*100):null;
 const signed=(n,digits=1)=>`${n>0?'+':''}${n.toFixed(digits)}`;
 const deltaClass=n=>n>0?'positive':n<0?'negative':'neutral';
 const comparison=(value,delta,digits=1)=>`<div class="value compare-value"><span>${value}</span><span class="metric-pipe">|</span><span class="metric-delta ${deltaClass(delta)}">${signed(delta,digits)}</span></div>`;
 const execs=pas.map(p=>p.execution).filter(v=>v!==null);
 const execution=execs.length?execs.filter(Boolean).length/execs.length:null;
 const ms=measurementTypes(player);
 const metricHead=(title)=>`<div class="eval-tile-head"><button class="metric-title" data-guide="${title}">${title}</button><button class="metric-all" data-ranking="${title}">ALL</button></div>`;
 return `<div class="eval-head"><button class="btn eval-nav" data-go="${currentGame()?'live':'home'}">${currentGame()?'Return':'Home'}</button><div class="eval-title"><h1>Evaluation</h1></div><button class="btn eval-email" id="openRecruitingEmail" ${player?'':'disabled'}>Email</button></div>
 <select class="player-select" id="evalSelect"><option>Team</option>${db.roster.map(r=>`<option ${evalPlayer===r.name?'selected':''}>${esc(r.name)}</option>`).join('')}</select>
 ${player?`<div class="player-card player-profile"><div class="grad-year">${esc(player.grad)}</div><div class="player-photo">${player.photo?`<img src="${encodeURI(player.photo)}" alt="${esc(player.name)}">`:esc(player.name.split(' ').map(x=>x[0]).join(''))}</div><div class="player-info"><div class="name">${esc(player.name)}</div><div class="meta"><span>#${esc(player.jersey)}</span> | ${esc(player.positions)} | GPA ${esc(player.gpa)}</div><div class="interest">${esc(player.interest)} <span>| ${esc(player.school)}</span></div></div></div>`:
 `<div class="player-card team-profile"><div class="player-photo team-photo"><img src="Rebels%20REG%20White%20with%20red%20wing%20-%20REGIONAL.png" alt="KC Rebels"></div><div class="player-info"><div class="name">KC Rebels</div><div class="meta">${pas.length} saved plate appearances</div></div></div>`}
 <div class="eval-tiles">
  <div class="eval-tile dark">${metricHead('HotB+')} ${player&&hotb!==null?comparison(hotb,hotb-100,0):`<div class="value">${hotb??'—'}</div>`}<div class="note">${player?(hotb===null?'More saved data needed':'100 = team average'):'Current-team benchmark'}</div></div>
  <div class="eval-tile">${metricHead('Runs Produced')} ${player?comparison(s.rp.toFixed(1),s.rp-avgPlayerRp,1):`<div class="value">${s.rp.toFixed(1)}</div>`}<div class="note">${player?`Player average ${avgPlayerRp.toFixed(1)}`:'Team total'}</div></div>
  <div class="eval-tile">${metricHead('RP / 100 PA')} ${player?comparison(rp100.toFixed(1),rp100-teamRp100,1):`<div class="value">${rp100.toFixed(1)}</div>`}<div class="note">${player?`Team average ${teamRp100.toFixed(1)}`:'Team rate'}</div></div>
  <div class="eval-tile">${metricHead('Execution')}<div class="value">${execution===null?'—':pct0(execution)}</div><div class="note">Hitting Plan</div></div>
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
function evalRankingModal(metric){
 const teamPas=allPAs();
 const teamStats=statsForPAs(teamPas);
 const teamRate=teamStats.PA?teamStats.rp/teamStats.PA:0;
 const rows=db.roster.map(player=>{
  const pas=teamPas.filter(pa=>pa.hitter===player.name);
  const stats=statsForPAs(pas);
  const execs=pas.map(pa=>pa.execution).filter(value=>value===true||value===false);
  let value=null;
  if(metric==='HotB+')value=stats.PA&&teamRate?(stats.rp/stats.PA)/teamRate*100:null;
  else if(metric==='Runs Produced')value=stats.PA?stats.rp:null;
  else if(metric==='RP / 100 PA')value=stats.PA?stats.rp/stats.PA*100:null;
  else if(metric==='Execution')value=execs.length?execs.filter(Boolean).length/execs.length:null;
  return {player,value};
 }).sort((a,b)=>{
  if(a.value===null&&b.value===null)return a.player.name.localeCompare(b.player.name);
  if(a.value===null)return 1;if(b.value===null)return-1;
  return b.value-a.value||a.player.name.localeCompare(b.player.name);
 });
 const formatted=value=>value===null?'—':metric==='HotB+'?Math.round(value):metric==='Execution'?pct0(value):value.toFixed(1);
 return `<div class="modal-backdrop"><div class="modal dark ranking-modal"><div class="modal-header"><div><div class="small ranking-kicker">TEAM RANKINGS</div><h2>${esc(metric)}</h2></div><button class="btn" data-close>Close</button></div>
  <div class="ranking-list">${rows.map((row,index)=>`<div class="ranking-row ${row.player.name===evalPlayer?'selected-player':''}"><span class="ranking-place">${index+1}</span><span class="ranking-number">#${esc(row.player.jersey||'—')}</span><span class="ranking-name">${esc(row.player.name)}</span><strong>${formatted(row.value)}</strong></div>`).join('')}</div>
 </div></div>`;
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
 const opponent=g?.opponent?.trim()||'this opponent';
 if(kind==='discardConfirm')return `<div class="modal-backdrop"><div class="modal game-action-modal" role="alertdialog" aria-modal="true" aria-label="Are You Sure">
  <h2>Are You Sure</h2>
  <p>End this game without saving? This will permanently erase the current game.</p>
  <div class="game-action-buttons confirm-discard-buttons"><button class="btn" id="cancelDiscard">No</button><button class="btn red" id="confirmDiscard">Yes</button></div>
 </div></div>`;
 return `<div class="modal-backdrop"><div class="modal game-action-modal" role="alertdialog" aria-modal="true" aria-label="End Game">
  <h2>End Game</h2>
  <p>Save and end the game against ${esc(opponent)}?</p>
  <div class="game-action-buttons end-game-buttons"><button class="btn" data-close>Cancel</button><button class="btn red" id="saveAndExit">Save &amp; Exit</button><button class="btn dark" id="discardGame">End &amp; Don’t Save</button></div>
 </div></div>`;
}
function pitcherChangeModal(){
 const g=currentGame();
 const known=db.pitchers.filter(p=>!g.opponent||(p.teams||[]).includes(g.opponent)||p.team===g.opponent);
 return `<div class="modal-backdrop"><div class="modal substitution-modal"><div class="modal-header"><h2>Change Pitcher</h2><button class="btn" data-close>Cancel</button></div>
  <p class="substitution-note">Enter the new pitcher for ${esc(g.opponent||"this team")}.</p>
  <label class="label">Pitcher Name</label><input id="subPitcherName" class="input" placeholder="Enter pitcher name" list="subPitcherList"><datalist id="subPitcherList">${known.map(p=>`<option value="${esc(p.name)}"></option>`).join("")}</datalist>
  <label class="label">Number</label><input id="subPitcherNumber" class="input" placeholder="Enter number" inputmode="numeric">
  <button class="btn block red savebar" id="savePitcherChange" disabled>Use New Pitcher</button>
 </div></div>`;
}
function hitterChangeModal(){
 const g=currentGame(), outgoing=currentHitter(g);
 const inLineup=new Set(g.battingOrder);
 const available=db.roster.filter(r=>!inLineup.has(r.name));
 return `<div class="modal-backdrop"><div class="modal substitution-modal"><div class="modal-header"><h2>Substitute Hitter</h2><button class="btn" data-close>Cancel</button></div>
  <p class="substitution-note">Choose who will bat for <b>${esc(outgoing.name)}</b> in this lineup spot.</p>
  <div class="substitute-list">${available.length?available.map(r=>`<button class="substitute-player" data-sub-hitter="${esc(r.name)}"><span>${esc(r.name)}</span><strong>${esc(r.side)}</strong></button>`).join(""):`<div class="substitution-empty">Every rostered player is already in the lineup.</div>`}</div>
 </div></div>`;
}
function playerInfoModal(){
 const player=db.roster[infoPlayerIndex];
 if(!player)return '';
 const input=(label,key,type='text')=>`<label class="info-field"><span>${label}</span>${type==='textarea'?`<textarea data-info-field="${key}" rows="4">${esc(player[key]||'')}</textarea>`:`<input data-info-field="${key}" type="${type}" value="${esc(player[key]||'')}">`}</label>`;
 return `<div class="modal-backdrop"><div class="modal player-info-modal"><div class="modal-header"><div><div class="small info-kicker">PLAYER INFORMATION</div><h2>${esc(player.name)}</h2></div><button class="btn" data-close>Cancel</button></div>
  <p class="info-privacy">This information is saved only in HotB on this device. It is not added to the public website code.</p>
  <div class="info-grid">
   ${input('Jersey #','jersey')}${input('Graduation Year','grad')}${input('Positions','positions')}${input('GPA','gpa')}${input('High School','school')}${input('Intended College Major','interest')}
   ${input('Bats (R, L, or S)','side')}${input('Throws (R or L)','throws')}${input('Player Email','email','email')}${input('Player Phone','phone','tel')}
   ${input('Twitter / X Full Link','twitter','url')}${input('SportsRecruits Full Link','sportsRecruits','url')}${input('Highlight Video Full Link','highlightVideo','url')}${input('NCAA ID','ncaaId')}
  </div>
  ${input('Recruiting Statement','recruitingStatement','textarea')}${input('Accomplishments / Honors','accomplishments','textarea')}${input('Additional Notes','notes','textarea')}
  <button class="btn black block info-save" id="savePlayerInfo">Save Player Information</button>
 </div></div>`;
}
function playerMeasurementLines(player){
 const units={'Home to First':' sec','Pop Time':' sec','Overhand Throw':' mph','Exit Velocity':' mph','Fastball':' mph','Changeup':' mph','Broad Jump':' in'};
 return measurementTypes(player).flatMap(type=>{
  const values=db.measurements.filter(m=>m.player===player.name&&m.type===type).map(m=>Number(m.value)).filter(Number.isFinite);
  if(!values.length)return [];
  const best=['Home to First','Pop Time'].includes(type)?Math.min(...values):Math.max(...values);
  return [`• ${type}: ${best}${units[type]||''}`];
 });
}
function emailSubject(player){
 const positions=cleanCell(player.positions).replace(/\s*\|\s*/g,'/');
 return `${player.name} | ${player.grad||'Grad Year'} | ${positions||'Positions'} | ${player.gpa||'—'} GPA | #${player.jersey||'—'}`;
}
function buildRecruitingEmail(player,details){
 const firstName=player.name.split(/\s+/)[0];
 const profile=[
  `• Positions: ${cleanCell(player.positions).replace(/\s*\|\s*/g,'/')}`,
  player.side||player.throws?`• Bats/Throws: ${player.side||'—'}/${player.throws||'—'}`:'',
  `• Jersey: #${player.jersey||'—'}`,
  player.school?`• High School: ${player.school}`:'',
  player.gpa?`• GPA: ${player.gpa}`:'',
  player.interest?`• Intended Major: ${player.interest}`:'',
  player.ncaaId?`• NCAA ID: ${player.ncaaId}`:''
 ].filter(Boolean);
 const sections=[];
 const greeting=/^coach\b/i.test(details.coachName)?details.coachName:`Coach ${details.coachName}`;
 sections.push(`${greeting},`);
 sections.push(`My name is Dan Lickel, and I am the head coach of KC Rebels 16U Regional Lickel. I would like to introduce you to ${player.name}, a ${player.grad} student-athlete who is interested in learning more about ${details.collegeName} and its softball program.`);
 if(details.personalNote)sections.push(details.personalNote);
 sections.push(`𝗣𝗟𝗔𝗬𝗘𝗥 𝗣𝗥𝗢𝗙𝗜𝗟𝗘\n${profile.join('\n')}`);
 const measurements=playerMeasurementLines(player);if(measurements.length)sections.push(`𝗔𝗧𝗛𝗟𝗘𝗧𝗜𝗖 𝗠𝗘𝗔𝗦𝗨𝗥𝗘𝗠𝗘𝗡𝗧𝗦\n${measurements.join('\n')}`);
 if(player.recruitingStatement)sections.push(`𝗣𝗟𝗔𝗬𝗘𝗥 𝗦𝗧𝗔𝗧𝗘𝗠𝗘𝗡𝗧\n${player.recruitingStatement}`);
 if(player.accomplishments)sections.push(`𝗔𝗖𝗖𝗢𝗠𝗣𝗟𝗜𝗦𝗛𝗠𝗘𝗡𝗧𝗦\n${player.accomplishments}`);
 const links=[];
 if(player.twitter)links.push(`Twitter/X: ${player.twitter}`);
 if(player.sportsRecruits)links.push(`SportsRecruits: ${player.sportsRecruits}`);
 if(player.highlightVideo)links.push(`Highlight Video: ${player.highlightVideo}`);
 links.push('Full 2026–27 Game Videos on GameChanger: https://web.gc.com/teams/K1E4TcPCwGKj/2027-summer-kc-rebels-16-regional-lickel');
 if(player.twitter||player.sportsRecruits)links.push(`Individual highlight videos are available through ${firstName}’s Twitter/X and SportsRecruits profiles.`);
 sections.push(`𝗥𝗘𝗖𝗥𝗨𝗜𝗧𝗜𝗡𝗚 𝗟𝗜𝗡𝗞𝗦\n${links.map(link=>`  • ${link}`).join('\n')}`);
 sections.push(`𝗙𝗔𝗟𝗟 𝟮𝟬𝟮𝟲 𝗦𝗖𝗛𝗘𝗗𝗨𝗟𝗘\nOctober 16–18\nTriple Crown St. Louis Showcase\nChesterfield, Missouri\n\nOctober 30–November 1\nTop Gun Select Invite\nKansas City Metro\n\nNovember 6–8\nRecruitLook Showcase\nKansas City Metro`);
 sections.push(`I believe ${firstName} would be a strong addition to a college program, both as a student-athlete and as a teammate. Please feel free to contact ${firstName} or me if you would like any additional information.`);
 sections.push('Thank you for your time and consideration.');
 sections.push('Dan Lickel\nHead Coach\nKC Rebels 16U Regional Lickel\n913-485-6576\nrecruiting@rebelssoftball.org');
 return {subject:emailSubject(player),body:sections.join('\n\n')};
}
function recruitingEmailModal(){
 const player=hitterObj(evalPlayer);
 return `<div class="modal-backdrop"><div class="modal recruiting-email-modal"><div class="modal-header"><div><div class="small info-kicker">RECRUITING EMAIL</div><h2>${esc(player.name)}</h2></div><button class="btn" data-close>Cancel</button></div>
  <p class="email-note">The player will automatically be copied using the email saved in her roster information.</p>
  <label class="info-field"><span>Coach’s Name</span><input id="emailCoachName" value="${esc(recruitingEmail.coachName)}" placeholder="Example: Coach Smith"></label>
  <label class="info-field"><span>Coach’s Email</span><input id="emailCoachAddress" type="email" value="${esc(recruitingEmail.coachEmail)}" placeholder="coach@college.edu"></label>
  <label class="info-field"><span>College Name</span><input id="emailCollegeName" value="${esc(recruitingEmail.collegeName)}" placeholder="College or university"></label>
  <label class="info-field"><span>Optional Personal Note</span><textarea id="emailPersonalNote" rows="3" placeholder="Add a personal message for this coach if needed.">${esc(recruitingEmail.personalNote)}</textarea></label>
  <div class="email-copy-row"><span><b>CC:</b> ${esc(player.email||'No player email saved')}</span></div>
  <button class="btn black block" id="previewRecruitingEmail" disabled>Preview Email</button>
 </div></div>`;
}
function recruitingEmailPreviewModal(){
 const player=hitterObj(evalPlayer);
 return `<div class="modal-backdrop"><div class="modal email-preview-modal"><div class="modal-header"><div><div class="small info-kicker">EMAIL PREVIEW</div><h2>${esc(player.name)}</h2></div><button class="btn" id="backToEmailSetup">Back</button></div>
  <div class="email-addresses"><div><b>To:</b> ${esc(recruitingEmail.coachEmail)}</div><div><b>CC:</b> ${esc(player.email||'None')}</div><div><b>Subject:</b> ${esc(recruitingEmail.subject)}</div></div>
  <label class="info-field"><span>Email Message — You Can Edit It Here</span><textarea id="emailBodyPreview" class="email-body-preview">${esc(recruitingEmail.body)}</textarea></label>
  <p class="email-note">Gmail will open a new draft. Confirm that recruiting@rebelssoftball.org is selected in the From field before sending.</p>
  <button class="btn red block" id="openGmailDraft">Open in Gmail</button>
 </div></div>`;
}
function importRosterModal(){
 const items=pendingRosterImport?.items||[];
 const updates=items.filter(item=>item.kind==='update');
 const additions=items.filter(item=>item.kind==='add');
 const unchanged=items.filter(item=>item.kind==='unchanged');
 return `<div class="modal-backdrop"><div class="modal import-preview-modal"><div class="modal-header"><div><div class="small info-kicker">IMPORT PREVIEW</div><h2>Player Information</h2></div><button class="btn" data-close>Cancel</button></div>
  <div class="import-counts"><div><b>${updates.length}</b><span>Players Updated</span></div><div><b>${additions.length}</b><span>Players Added</span></div><div><b>${unchanged.length}</b><span>No Changes</span></div></div>
  <p class="import-note">Blank cells will not erase information already saved in HotB.</p>
  <div class="import-player-list">${items.map(item=>`<div class="import-player ${item.kind}"><span>#${esc(item.data.jersey||item.player?.jersey||'—')}</span><b>${esc(item.data.name||item.player?.name)}</b><small>${item.kind==='update'?`${item.changes.length} field${item.changes.length===1?'':'s'} changing`:item.kind==='add'?'New player':'No changes'}</small></div>`).join('')}</div>
  <button class="btn black block" id="confirmRosterImport" ${updates.length||additions.length?'':'disabled'}>Import These Changes</button>
 </div></div>`;
}
async function unzipWorkbook(buffer){
 const bytes=new Uint8Array(buffer),view=new DataView(buffer);let end=-1;
 for(let i=bytes.length-22;i>=Math.max(0,bytes.length-65557);i--){if(view.getUint32(i,true)===0x06054b50){end=i;break}}
 if(end<0)throw new Error('That does not appear to be a valid Excel file.');
 const count=view.getUint16(end+10,true),decoder=new TextDecoder(),files={};let offset=view.getUint32(end+16,true);
 for(let i=0;i<count;i++){
  if(view.getUint32(offset,true)!==0x02014b50)break;
  const method=view.getUint16(offset+10,true),size=view.getUint32(offset+20,true),nameLength=view.getUint16(offset+28,true),extraLength=view.getUint16(offset+30,true),commentLength=view.getUint16(offset+32,true),local=view.getUint32(offset+42,true);
  const name=decoder.decode(bytes.slice(offset+46,offset+46+nameLength));
  if(name==='xl/sharedStrings.xml'||name==='xl/worksheets/sheet1.xml'){
   const localName=view.getUint16(local+26,true),localExtra=view.getUint16(local+28,true),start=local+30+localName+localExtra,compressed=bytes.slice(start,start+size);
   if(method===0)files[name]=compressed;
   else if(method===8){const stream=new Blob([compressed]).stream().pipeThrough(new DecompressionStream('deflate-raw'));files[name]=new Uint8Array(await new Response(stream).arrayBuffer())}
   else throw new Error('This Excel compression format is not supported.');
  }
  offset+=46+nameLength+extraLength+commentLength;
 }
 return Object.fromEntries(Object.entries(files).map(([name,data])=>[name,decoder.decode(data)]));
}
function spreadsheetRowsFromXml(files){
 const parser=new DOMParser(),shared=[];
 if(files['xl/sharedStrings.xml'])parser.parseFromString(files['xl/sharedStrings.xml'],'application/xml').querySelectorAll('si').forEach(si=>shared.push([...si.querySelectorAll('t')].map(t=>t.textContent).join('')));
 const xml=files['xl/worksheets/sheet1.xml'];if(!xml)throw new Error('The first worksheet could not be read.');
 const rows=[];parser.parseFromString(xml,'application/xml').querySelectorAll('sheetData row').forEach(row=>{
  const values=[];row.querySelectorAll('c').forEach(cell=>{
   const ref=cell.getAttribute('r')||'',letters=(ref.match(/[A-Z]+/)||['A'])[0];let column=0;for(const letter of letters)column=column*26+letter.charCodeAt(0)-64;column--;
   const type=cell.getAttribute('t'),raw=cell.querySelector('v')?.textContent??'',inline=cell.querySelector('is t')?.textContent??'';
   values[column]=type==='s'?(shared[Number(raw)]??''):type==='inlineStr'?inline:raw;
  });rows.push(values);
 });return rows;
}
function csvRows(text){
 const rows=[];let row=[],value='',quoted=false;
 for(let i=0;i<text.length;i++){const char=text[i];if(char==='"'){if(quoted&&text[i+1]==='"'){value+='"';i++}else quoted=!quoted}else if(char===','&&!quoted){row.push(value);value=''}else if((char==='\n'||char==='\r')&&!quoted){if(char==='\r'&&text[i+1]==='\n')i++;row.push(value);rows.push(row);row=[];value=''}else value+=char}
 if(value||row.length){row.push(value);rows.push(row)}return rows;
}
async function parseRosterWorkbook(file){
 let rows;
 if(file.name.toLowerCase().endsWith('.csv'))rows=csvRows(await file.text());
 else{
  const buffer=await file.arrayBuffer();
  if(window.XLSX){const workbook=XLSX.read(buffer,{type:'array'}),sheet=workbook.Sheets.Players||workbook.Sheets[workbook.SheetNames[0]];rows=XLSX.utils.sheet_to_json(sheet,{header:1,defval:'',raw:false})}
  else rows=spreadsheetRowsFromXml(await unzipWorkbook(buffer));
 }
  const headerIndex=rows.findIndex(row=>row.some(cell=>cleanCell(cell)==='Player Name'));
  if(headerIndex<0)throw new Error('The Player Name header was not found. Please use the HotB template.');
  const headers=rows[headerIndex].map(cleanCell);
  const missing=recruitingColumns.filter(([label])=>!headers.includes(label)).map(([label])=>label);
  if(missing.length)throw new Error(`The spreadsheet is missing: ${missing.join(', ')}.`);
  const items=[];
  rows.slice(headerIndex+1).forEach(row=>{
   const data={};
   recruitingColumns.forEach(([label,key])=>data[key]=cleanCell(row[headers.indexOf(label)]));
   if(!data.name)return;
   const matches=db.roster.map((player,index)=>({player,index})).filter(({player})=>normalizeName(player.name)===normalizeName(data.name));
   const exact=matches.find(({player})=>!data.jersey||cleanCell(player.jersey)===data.jersey);
   const match=exact||(matches.length===1?matches[0]:null);
   if(!match){items.push({kind:'add',data});return}
   const changes=recruitingColumns.filter(([,key])=>data[key]&&cleanCell(match.player[key])!==data[key]).map(([,key])=>key);
   items.push({kind:changes.length?'update':'unchanged',data,player:match.player,index:match.index,changes});
  });
  if(!items.length)throw new Error('No player rows were found in the spreadsheet.');
  return {items};
}
function applyRosterImport(){
 (pendingRosterImport?.items||[]).forEach(item=>{
  if(item.kind==='unchanged')return;
  const target=item.kind==='add'?{name:item.data.name,side:item.data.side||'R',isGuest:true}:db.roster[item.index];
  recruitingColumns.forEach(([,key])=>{if(item.data[key])target[key]=item.data[key]});
  if(item.kind==='add')db.roster.push(target);
 });
 save();pendingRosterImport=null;modal=null;render();
 alert('Player information imported successfully.');
}
function exportRosterWorkbook(){
 const headings=recruitingColumns.map(([label])=>label);
 const rows=db.roster.map(player=>recruitingColumns.map(([,key])=>player[key]||''));
 if(!window.XLSX){
  const csv=[headings,...rows].map(row=>row.map(value=>`"${String(value).replace(/"/g,'""')}"`).join(',')).join('\r\n');
  const link=document.createElement('a');link.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));link.download='HotB_Player_Recruiting_Information.csv';link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000);return;
 }
 const sheet=XLSX.utils.aoa_to_sheet([['HOTB PLAYER RECRUITING INFORMATION'],['Blank imported cells leave existing HotB information unchanged.'],[],headings,...rows]);
 sheet['!cols']=headings.map(label=>({wch:Math.min(48,Math.max(12,label.length+2))}));
 const workbook=XLSX.utils.book_new();XLSX.utils.book_append_sheet(workbook,sheet,'Players');
 XLSX.writeFile(workbook,'HotB_Player_Recruiting_Information.xlsx');
}
function modalView(){
 if(modal==='changePitcher')return pitcherChangeModal();
 if(modal==='changeHitter')return hitterChangeModal();
 if(modal==='playerInfo')return playerInfoModal();
 if(modal==='recruitingEmail')return recruitingEmailModal();
 if(modal==='recruitingEmailPreview')return recruitingEmailPreviewModal();
 if(modal==='importRoster')return importRosterModal();
 if(modal?.startsWith('ranking:'))return evalRankingModal(modal.slice(8));
 if(modal==='HIT'||modal==='H4O')return hitModal(modal);
 if(modal==='reports')return reportModal();
 if(modal==='record')return recordModal();
 if(modal==='endGame'||modal==='discardConfirm')return gameActionModal(modal);
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
 if(modal==='endGame'||modal==='discardConfirm')bindGameAction();
 if(modal==='changePitcher')bindPitcherChange();
 if(modal==='changeHitter')bindHitterChange();
 if(modal==='playerInfo')bindPlayerInfo();
 if(modal==='recruitingEmail')bindRecruitingEmail();
 if(modal==='recruitingEmailPreview')bindRecruitingEmailPreview();
 if(modal==='importRoster')$('#confirmRosterImport')?.addEventListener('click',applyRosterImport);
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
 $$('[data-info]').forEach(b=>b.onclick=()=>{syncRosterNames();infoPlayerIndex=+b.dataset.info;save();modal='playerInfo';render()});
 $('#addPlayer').onclick=()=>{db.roster.push({name:'Guest',side:'R',jersey:'',grad:'',positions:'',gpa:'',interest:'',school:'',isGuest:true});save();render();setTimeout(()=>window.scrollTo(0,document.body.scrollHeight),0)};
 $('#saveRoster').onclick=()=>{syncRosterNames();save();go('home')};
 $('#importRosterInfo').onclick=()=>{syncRosterNames();save();$('#rosterInfoFile').click()};
 $('#rosterInfoFile').onchange=async event=>{
  const file=event.target.files?.[0];if(!file)return;
  try{pendingRosterImport=await parseRosterWorkbook(file);modal='importRoster';render()}catch(error){alert(error.message||'HotB could not read that spreadsheet.')}
 };
 $('#exportRosterInfo').onclick=()=>{syncRosterNames();save();exportRosterWorkbook()};
}
function bindPlayerInfo(){
 $('#savePlayerInfo').onclick=()=>{
  const player=db.roster[infoPlayerIndex];if(!player)return;
  $$('[data-info-field]').forEach(field=>player[field.dataset.infoField]=field.value.trim());
  if(!['R','L','S'].includes(player.side.toUpperCase()))player.side='R';else player.side=player.side.toUpperCase();
  player.throws=(player.throws||'').toUpperCase();
  save();modal=null;render();
 };
}
function bindRecruitingEmail(){
 const coachName=$('#emailCoachName'),coachEmail=$('#emailCoachAddress'),collegeName=$('#emailCollegeName'),note=$('#emailPersonalNote'),preview=$('#previewRecruitingEmail');
 const update=()=>{
  recruitingEmail.coachName=coachName.value.trim();recruitingEmail.coachEmail=coachEmail.value.trim();recruitingEmail.collegeName=collegeName.value.trim();recruitingEmail.personalNote=note.value.trim();
  preview.disabled=!recruitingEmail.coachName||!recruitingEmail.coachEmail||!recruitingEmail.collegeName||!coachEmail.validity.valid;
 };
 [coachName,coachEmail,collegeName,note].forEach(field=>field.addEventListener('input',update));update();
 preview.onclick=()=>{
  update();const player=hitterObj(evalPlayer),built=buildRecruitingEmail(player,recruitingEmail);
  recruitingEmail.subject=built.subject;recruitingEmail.body=built.body;modal='recruitingEmailPreview';render();
 };
}
function bindRecruitingEmailPreview(){
 $('#backToEmailSetup').onclick=()=>{recruitingEmail.body=$('#emailBodyPreview').value;modal='recruitingEmail';render()};
 $('#openGmailDraft').onclick=()=>{
  const player=hitterObj(evalPlayer),body=$('#emailBodyPreview').value;
  recruitingEmail.body=body;
  const cc=player.email?`&cc=${encodeURIComponent(player.email)}`:'';
  window.location.href=`mailto:${encodeURIComponent(recruitingEmail.coachEmail)}?subject=${encodeURIComponent(recruitingEmail.subject)}${cc}&body=${encodeURIComponent(body)}`;
 };
}
function bindLive(){
 const g=currentGame();
 $('.live-app')?.addEventListener('click',event=>{
  const button=event.target.closest('button');
  if(button&&!button.matches('[data-zone],[data-result]')&&g.pendingZone){g.pendingZone=null;save()}
 },true);
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
 $('#aiBtn').onclick=()=>{g.showAi=!g.showAi;save();render()};
 $('#changePitcher').onclick=()=>{modal='changePitcher';render()};
 $('#changeHitter').onclick=()=>{modal='changeHitter';render()};
}
function bindPitcherChange(){
 const g=currentGame(), name=$('#subPitcherName'), number=$('#subPitcherNumber'), saveButton=$('#savePitcherChange');
 const update=()=>{saveButton.disabled=!name.value.trim()&&!number.value.trim()};
 name.addEventListener('input',update);number.addEventListener('input',update);
 name.addEventListener('change',()=>{
  const known=db.pitchers.find(p=>p.name===name.value&&(!g.opponent||(p.teams||[]).includes(g.opponent)||p.team===g.opponent));
  if(known&&!number.value)number.value=known.number||'';
  update();
 });
 saveButton.onclick=()=>{
  const pitcherName=name.value.trim(),pitcherNumber=number.value.trim();
  g.pitcherName=pitcherName;g.pitcherNumber=pitcherNumber;
  g.pitchersUsed=g.pitchersUsed||[];
  g.pitchersUsed.push({name:pitcherName,number:pitcherNumber,enteredAt:Date.now(),pitchIndex:g.pitches.length});
  rememberPitcher(g.opponent,pitcherName,pitcherNumber);
  modal=null;save();render();
 };
}
function bindHitterChange(){
 $$("[data-sub-hitter]").forEach(button=>button.onclick=()=>{
  const g=currentGame(),outgoing=currentHitter(g).name,incoming=button.dataset.subHitter;
  g.pitches.filter(p=>p.pa===g.paNumber&&p.hitter===outgoing).forEach(p=>p.hitter=incoming);
  g.battingOrder[g.currentIdx]=incoming;
  g.hittersUsed=[...new Set([...(g.hittersUsed||g.battingOrder),outgoing,incoming])];
  g.hitterSubstitutions=g.hitterSubstitutions||[];
  g.hitterSubstitutions.push({out:outgoing,in:incoming,lineupIndex:g.currentIdx,pa:g.paNumber,ts:Date.now()});
  g.plan=planFor(incoming);g.pendingZone=null;g.historyTab='LIVE';g.previewNext=false;g.firstPitchView=false;g.showAi=false;
  modal=null;save();render();
 });
}
function bindGameAction(){
 $('#saveAndExit')?.addEventListener('click',()=>{
   const g=currentGame();
   if(!g)return;
   g.ended=true;
   db.savedGames.push(structuredClone(g));
   db.currentGame=null;
   modal=null;
   save();
   go('home');
 });
 $('#discardGame')?.addEventListener('click',()=>{modal='discardConfirm';render()});
 $('#cancelDiscard')?.addEventListener('click',()=>{modal='endGame';render()});
 $('#confirmDiscard')?.addEventListener('click',()=>{
   db.currentGame=null;
   modal=null;
   save();
   go('home');
 });
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
 $('#openRecruitingEmail').onclick=()=>{recruitingEmail={coachName:'',coachEmail:'',collegeName:'',personalNote:'',subject:'',body:''};modal='recruitingEmail';render()};
 $('#recordMeasure2').onclick=()=>{recordType='';modal='record';render()};
 $$('[data-measure]').forEach(x=>x.onclick=()=>{recordType=x.dataset.measure;modal='record';render()});
 $$('[data-guide]').forEach(x=>x.onclick=()=>{modal='guide:'+x.dataset.guide;render()});
 $$('[data-ranking]').forEach(x=>x.onclick=()=>{modal='ranking:'+x.dataset.ranking;render()});
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
