(function(root,factory){
 const api=factory(root);
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.HotBRecruitingWorkflow=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
 'use strict';
 const DB_KEY='hotbRebuildDbV1';
 const RECRUITING_KEY='hotbRecruitingV1';
 const ACTIVE_PLAYER='Brooklyn Gering';
 const PROFILE_SLUG='brooklyn-gering';
 const PUBLIC_PROFILE_PATH='brooklyn-gering-recruiting-profile.html';
 const PUBLIC_PROFILE_URL='https://kcrebels.github.io/HotB-Rebuild/'+PUBLIC_PROFILE_PATH;
 const GMAIL_CLIENT_ID='412203516902-el4rhl939lb6frbbvh4krvqequ8ut7v3.apps.googleusercontent.com';
 const GMAIL_SEND_SCOPE='https://www.googleapis.com/auth/gmail.send';
 const GAMECHANGER_URL='https://web.gc.com/teams/K1E4TcPCwGKj/2027-summer-kc-rebels-16-regional-lickel';
 const DEFAULT_EVALUATION=`Brooklyn is a competitor who wants the ball and expects a lot from herself. She throws with good velocity and consistently finds the strike zone. At the plate, she makes consistent contact and has the ability to hit the ball hard. I believe there is more power coming as she continues to develop, with the potential to become a legitimate extra-base and home-run threat.\n\nBrooklyn is also an outstanding teammate and extremely coachable. She's friendly, eager to learn, actively seeks feedback, and works to apply what she's taught. She can be hard on herself because she cares about performing well, but that competitiveness and desire to improve are also two of the qualities that make her such an enjoyable player to coach.`;
 const EVENTS=[
  {name:'Triple Crown St. Louis Showcase',detail:'Oct. 16–18 · Chesterfield, Missouri'},
  {name:'Top Gun Select Invite',detail:'Oct. 30–Nov. 1 · Kansas City Metro'},
  {name:'RecruitLook Showcase',detail:'Nov. 6–8 · Kansas City Metro'}
 ];
 const esc=value=>String(value??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
 const clean=value=>String(value??'').trim();
 function readDb(){try{return JSON.parse(localStorage.getItem(DB_KEY)||'{}')}catch{return{}}}
 function readRecruiting(){try{const value=JSON.parse(localStorage.getItem(RECRUITING_KEY)||'{}');return value&&typeof value==='object'?value:{}}catch{return{}}}
 function saveRecruiting(value){localStorage.setItem(RECRUITING_KEY,JSON.stringify(value))}
 function playerRecord(name=ACTIVE_PLAYER){return (readDb().roster||[]).find(player=>player.name===name)||null}
 function activePlayer(name){return name===ACTIVE_PLAYER}
 function buildEmailSubject(player){
  const positions=clean(player?.positions).replace(/\s*\|\s*/g,'/');
  return `${clean(player?.name)||'Player'} | ${clean(player?.grad)||'Grad Year'} | ${positions||'Positions'} | ${clean(player?.gpa)||'—'} GPA | #${clean(player?.jersey)||'—'}`;
 }
 function shortCoachIntro(){return `Brooklyn is a competitor who wants the ball, throws with good velocity, and consistently finds the strike zone. At the plate she makes consistent contact, can hit the ball hard, and has developing extra-base power. She is an outstanding teammate, extremely coachable, and actively seeks feedback to improve.`}
 function scheduleText(){return EVENTS.map(event=>`${event.name} — ${event.detail.replace(' · ',' — ')}`).join('\n')}
 function buildBrooklynEmailBody(player,coachLastName='Coach'){
  return `Coach ${coachLastName || 'Coach'},\n\nI wanted to introduce you to Brooklyn Gering, a 2029 player with the KC Rebels.\n\n${shortCoachIntro()}\n\nPLAYER PROFILE / CURRENT RESULTS\n${PUBLIC_PROFILE_URL}\n\nHer KC Rebels Recruiting Profile includes my coach evaluation along with her current hitting and pitching results.\n\nUPCOMING SCHEDULE\n${scheduleText()}\n\nGAMECHANGER\n${GAMECHANGER_URL}\n\nPlease feel free to contact me if you'd like additional information about Brooklyn.\n\nDan Lickel\nHead Coach | KC Rebels 16U Regional\nDirector of Recruiting | Kansas City Rebels\n913-485-6576\nrecruiting@rebelssoftball.org`;
 }
 function statsForPlayer(name){
  const db=readDb();
  const pas=(db.savedGames||[]).flatMap(game=>game.plateAppearances||[]).filter(pa=>pa.hitter===name);
  const stats=root.HotBEvaluationStats?.statsForPAs?root.HotBEvaluationStats.statsForPAs(pas):{PA:pas.length,AVG:0,OBP:0,contactPct:0};
  return stats;
 }
 function round3(value){return Number.isFinite(value)?Number(value).toFixed(3).replace(/^0/,''):'.000'}
 function pct0(value){return `${Math.round((Number(value)||0)*100)}%`}
 function bestMeasurement(db,name,type){
  const rows=(db.measurements||[]).filter(row=>row.player===name&&row.type===type&&Number.isFinite(Number(row.value)));
  if(!rows.length)return null;
  const isTime=['Home to First','Pop Time'].includes(type);
  const best=rows.reduce((winner,row)=>!winner||(isTime?Number(row.value)<Number(winner.value):Number(row.value)>Number(winner.value))?row:winner,null);
  return {value:Number(best.value),date:best.date||''};
 }
 function dateLabel(value){if(!value)return'';const date=new Date(`${value}T12:00:00`);return Number.isNaN(date.getTime())?'':date.toLocaleDateString('en-US',{month:'short',year:'numeric'})}
 function payload(){
  const db=readDb(),player=(db.roster||[]).find(item=>item.name===ACTIVE_PLAYER);if(!player)return null;
  const stats=statsForPlayer(ACTIVE_PLAYER),recruiting=readRecruiting(),entry=recruiting.players?.[ACTIVE_PLAYER]||{};
  const measurements={};['Fastball','Changeup','Exit Velocity','Home to First'].forEach(type=>{const row=bestMeasurement(db,ACTIVE_PLAYER,type);if(row)measurements[type]={value:row.value,date:dateLabel(row.date)}});
  return {
   slug:PROFILE_SLUG,
   updatedAt:new Date().toISOString(),
   player:{name:player.name,jersey:player.jersey||'',grad:player.grad||'',positions:player.positions||'',gpa:player.gpa||'',school:player.school||'',interest:player.interest||'',side:player.side||'',throws:player.throws||'R',email:player.email||'',twitter:player.twitter||'',sportsRecruits:player.sportsRecruits||'',photo:player.photo||''},
   coachEvaluation:entry.coachEvaluation||DEFAULT_EVALUATION,
   coachEvaluationUpdatedAt:entry.coachEvaluationUpdatedAt||'',
   hitting:{PA:stats.PA,AVG:round3(stats.AVG),OBP:round3(stats.OBP),CONTACT:pct0(stats.contactPct)},
   pitching:{IP:player.pitcherIP||'—',ERA:player.pitcherERA||'—',WHIP:player.pitcherWHIP||'—','K/BB':player.pitcherKBB||'—',OBA:player.pitcherOBA||'—','STRIKE %':player.pitcherStrikePct||'—'},
   measurements,
   events:EVENTS,
   gameChangerUrl:GAMECHANGER_URL,
   sportsRecruitsUrl:player.sportsRecruits||'https://my.sportsrecruits.com/athlete/brooklyn_gering'
  };
 }
 function modalShell(inner){return `<div class="rw-backdrop" data-rw-close><section class="rw-modal" role="dialog" aria-modal="true">${inner}</section></div>`}
 function closeModal(){document.querySelector('.rw-backdrop')?.remove()}
 function openEvaluation(){
  const recruiting=readRecruiting(),entry=recruiting.players?.[ACTIVE_PLAYER]||{};
  document.body.insertAdjacentHTML('beforeend',modalShell(`<div class="rw-modal-head"><div><span>COACH EVALUATION</span><h2>Brooklyn Gering</h2></div><button class="rw-close" type="button" data-rw-close>Close</button></div><p class="rw-help">Edit this once here. The same evaluation is published to Brooklyn's Recruiting Profile.</p><textarea id="rwCoachEvaluation">${esc(entry.coachEvaluation||DEFAULT_EVALUATION)}</textarea><div class="rw-actions"><button class="rw-secondary" type="button" data-rw-close>Cancel</button><button class="rw-primary" id="rwSaveEvaluation" type="button">Save Evaluation</button></div>`));
  document.querySelector('#rwSaveEvaluation')?.addEventListener('click',async()=>{
   const value=clean(document.querySelector('#rwCoachEvaluation')?.value);if(!value)return;
   const store=readRecruiting();store.players=store.players||{};store.players[ACTIVE_PLAYER]={...(store.players[ACTIVE_PLAYER]||{}),coachEvaluation:value,coachEvaluationUpdatedAt:new Date().toISOString()};saveRecruiting(store);closeModal();await publishProfile(true);inject();
  });
 }
 function coachLastName(coach){const parts=clean(coach?.coachName).split(/\s+/);return parts[parts.length-1]||'Coach'}
 function openEmail(){
  const db=readDb(),player=(db.roster||[]).find(item=>item.name===ACTIVE_PLAYER);if(!player)return;
  const coaches=db.coaches||[];const first=coaches[0]||{};
  const body=buildBrooklynEmailBody(player,coachLastName(first));
  document.body.insertAdjacentHTML('beforeend',modalShell(`<div class="rw-modal-head"><div><span>EMAIL COACH</span><h2>Brooklyn Gering</h2></div><button class="rw-close" type="button" data-rw-close>Close</button></div><label class="rw-label">College Coach<select id="rwCoachSelect">${coaches.map((coach,index)=>`<option value="${index}">${esc(coach.coachName)} — ${esc(coach.collegeName)}</option>`).join('')}</select></label><div class="rw-email-meta"><b>To:</b> <span id="rwTo">${esc(first.coachEmail||'')}</span><br><b>CC:</b> <span>${esc(player.email||'None')}</span><br><b>Subject:</b> <span>${esc(buildEmailSubject(player))}</span></div><label class="rw-label">Email Message — You Can Edit It Here<textarea id="rwEmailBody">${esc(body)}</textarea></label><p class="rw-help">Nothing sends until you confirm and Gmail completes authorization.</p><div class="rw-actions"><button class="rw-secondary" type="button" data-rw-close>Cancel</button><button class="rw-primary" id="rwSendEmail" type="button">Send with Gmail</button></div>`));
  const select=document.querySelector('#rwCoachSelect'),textarea=document.querySelector('#rwEmailBody'),to=document.querySelector('#rwTo');
  select?.addEventListener('change',()=>{const coach=coaches[Number(select.value)]||{};if(to)to.textContent=coach.coachEmail||'';if(textarea)textarea.value=buildBrooklynEmailBody(player,coachLastName(coach))});
  document.querySelector('#rwSendEmail')?.addEventListener('click',async event=>{
   const coach=coaches[Number(select?.value||0)]||{},email=clean(coach.coachEmail);if(!email){alert('This coach does not have a saved email address.');return}
   if(!confirm(`Send this recruiting email now to ${email}${player.email?` and CC ${player.email}`:''}?`))return;
   const button=event.currentTarget;button.disabled=true;button.textContent='Connecting to Gmail…';
   try{const token=await requestGmailAccessToken();button.textContent='Sending…';await sendEmail(token,email,player.email||'',buildEmailSubject(player),textarea?.value||'');closeModal();alert('Recruiting email sent through Gmail.')}catch(error){button.disabled=false;button.textContent='Send with Gmail';alert(error?.message||'Gmail could not send this email. Nothing was sent.')}
  });
 }
 function requestGmailAccessToken(){return new Promise((resolve,reject)=>{if(!root.google?.accounts?.oauth2){reject(new Error('Google sign-in is still loading. Wait a few seconds and try again.'));return}const client=root.google.accounts.oauth2.initTokenClient({client_id:GMAIL_CLIENT_ID,scope:GMAIL_SEND_SCOPE,callback:response=>response.error?reject(new Error('Gmail authorization was not completed.')):resolve(response.access_token),error_callback:()=>reject(new Error('Gmail authorization was closed or blocked.'))});client.requestAccessToken({prompt:'select_account consent'})})}
 function htmlText(value){return esc(value).replace(/(https?:\/\/[^\s<]+)/g,url=>`<a href="${url}" style="color:#b3262d">${url}</a>`)}
 function bodyHtml(body){let html='';String(body||'').split(/\r?\n/).forEach(line=>{const value=line.trim();if(!value){html+='<div style="height:10px"></div>';return}if(['PLAYER PROFILE / CURRENT RESULTS','UPCOMING SCHEDULE','GAMECHANGER'].includes(value)){html+=`<h3 style="margin:20px 0 8px;font-size:16px">${esc(value)}</h3>`;return}html+=`<div style="margin:3px 0">${htmlText(value)}</div>`});return `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#111">${html}</div>`}
 function utf8Base64(value){const bytes=new TextEncoder().encode(String(value)),step=0x8000;let binary='';for(let i=0;i<bytes.length;i+=step)binary+=String.fromCharCode(...bytes.subarray(i,i+step));return btoa(binary)}
 async function sendEmail(token,to,cc,subject,body){const headers=[`To: ${to}`,cc?`Cc: ${cc}`:'',`Subject: =?UTF-8?B?${utf8Base64(subject)}?=`,'MIME-Version: 1.0','Content-Type: text/html; charset="UTF-8"','Content-Transfer-Encoding: 8bit'].filter(Boolean).join('\r\n');const raw=utf8Base64(`${headers}\r\n\r\n${bodyHtml(body)}`).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');const response=await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({raw})});if(!response.ok){const detail=await response.json().catch(()=>({}));throw new Error(detail?.error?.message||'Gmail rejected the message. Nothing was sent.')}}
 async function publishProfile(force=false){
  if(!root.firebase?.apps?.length)return false;
  const auth=root.firebase.auth(),user=auth.currentUser;if(!user||user.isAnonymous||String(user.email||'').toLowerCase()!=='hotbkcrebels@gmail.com')return false;
  const data=payload();if(!data)return false;
  const serialized=JSON.stringify(data);if(!force&&sessionStorage.getItem('hotbRecruitingPublishedV1')===serialized)return true;
  try{await root.firebase.firestore().collection('recruitingProfiles').doc(PROFILE_SLUG).set(data,{merge:true});sessionStorage.setItem('hotbRecruitingPublishedV1',serialized);return true}catch(error){console.warn('Recruiting Profile publish is waiting for Firestore rules deployment.',error);return false}
 }
 function inject(){
  const evalApp=document.querySelector('.eval-app'),select=document.querySelector('#evalSelect');if(!evalApp||!select)return;
  const name=select.value,player=name==='Team'?null:playerRecord(name),existing=document.querySelector('#rwRecruitingSection');if(existing)existing.remove();if(!player)return;
  const enabled=activePlayer(name),anchor=document.querySelector('.player-card.player-profile');if(!anchor)return;
  const html=`<section class="rw-recruiting" id="rwRecruitingSection"><div class="rw-section-head"><div><span>RECRUITING</span><h2>Recruiting Workflow</h2></div>${enabled?'<small>Brooklyn pilot</small>':'<small>Coming Soon</small>'}</div><div class="rw-buttons"><button type="button" class="rw-profile" ${enabled?'':'disabled'}>Recruiting Profile</button><button type="button" class="rw-evaluation" ${enabled?'':'disabled'}>Coach Evaluation</button><button type="button" class="rw-email" ${enabled?'':'disabled'}>Email Coach</button></div>${enabled?'<p>Public scouting report · Coach evaluation · Coach-to-coach introduction</p>':'<p>Recruiting controls are visible for planning but inactive for this player.</p>'}</section>`;
  anchor.insertAdjacentHTML('afterend',html);
  if(enabled){document.querySelector('.rw-profile')?.addEventListener('click',()=>root.open(PUBLIC_PROFILE_PATH,'_blank','noopener'));document.querySelector('.rw-evaluation')?.addEventListener('click',openEvaluation);document.querySelector('.rw-email')?.addEventListener('click',openEmail);publishProfile(false)}
 }
 function init(){
  if(typeof document==='undefined')return;
  document.addEventListener('click',event=>{if(event.target.matches('[data-rw-close]'))closeModal()});
  const observer=new MutationObserver(()=>requestAnimationFrame(inject));observer.observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('change',event=>{if(event.target?.id==='evalSelect')setTimeout(inject,0)});
  if(root.firebase?.auth)root.firebase.auth().onAuthStateChanged(()=>setTimeout(()=>publishProfile(false),200));
  inject();
 }
 if(typeof document!=='undefined'&&document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
 return {ACTIVE_PLAYER,PUBLIC_PROFILE_URL,DEFAULT_EVALUATION,EVENTS,activePlayer,buildEmailSubject,buildBrooklynEmailBody,shortCoachIntro,payload};
});
