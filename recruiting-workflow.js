(function(root,factory){
 const api=factory(root);
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.HotBRecruitingWorkflow=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
 'use strict';
 const DB_KEY='hotbRebuildDbV1';
 const RECRUITING_KEY='hotbRecruitingV1';
 const PROFILE_PATH='player-recruiting-profile.html';
 const PROFILE_BASE_URL='https://kcrebels.github.io/HotB-Rebuild/'+PROFILE_PATH;
 const slugFor=name=>clean(name).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
 const profileUrl=name=>PROFILE_BASE_URL+'?player='+encodeURIComponent(slugFor(name));
 const GMAIL_CLIENT_ID='412203516902-el4rhl939lb6frbbvh4krvqequ8ut7v3.apps.googleusercontent.com';
 const GMAIL_SEND_SCOPE='https://www.googleapis.com/auth/gmail.send';
 const GAMECHANGER_URL='https://web.gc.com/teams/K1E4TcPCwGKj/2027-summer-kc-rebels-16-regional-lickel';
 const DEFAULT_EVALUATION=`Brooklyn is a competitor who wants the ball and expects a lot from herself. She throws with good velocity and consistently finds the strike zone. At the plate, she makes consistent contact and has the ability to hit the ball hard. I believe there is more power coming as she continues to develop, with the potential to become a legitimate extra-base and home-run threat.\n\nBrooklyn is also an outstanding teammate and extremely coachable. She's friendly, eager to learn, actively seeks feedback, and works to apply what she's taught. She can be hard on herself because she cares about performing well, but that competitiveness and desire to improve are also two of the qualities that make her such an enjoyable player to coach.`;
 const EVENTS=[
  {name:'Triple Crown St. Louis Showcase',detail:'Oct. 16–18 · Chesterfield, Missouri'},
  {name:'Top Gun Select Invite',detail:'Oct. 30–Nov. 1 · Kansas City Metro'},
  {name:'RecruitLook Showcase',detail:'Nov. 6–8 · Kansas City Metro'}
 ];
 const esc=value=>String(value??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#039;'}[m]));
 const clean=value=>String(value??'').trim();
 const normalize=value=>clean(value).toLowerCase().replace(/\s+/g,' ');
 function readDb(){try{return JSON.parse(localStorage.getItem(DB_KEY)||'{}')}catch{return{}}}
 function readRecruiting(){try{const value=JSON.parse(localStorage.getItem(RECRUITING_KEY)||'{}');return value&&typeof value==='object'?value:{}}catch{return{}}}
 function saveRecruiting(value){localStorage.setItem(RECRUITING_KEY,JSON.stringify(value))}
 function playerRecord(name){return (readDb().roster||[]).find(player=>player.name===name)||null}
 function activePlayer(name){return !!clean(name)&&name!=='Team'}
 function buildEmailSubject(player){
  const positions=clean(player?.positions).replace(/\s*\|\s*/g,'/');
  return `${clean(player?.name)||'Player'} | ${clean(player?.grad)||'Grad Year'} | ${positions||'Positions'} | ${clean(player?.gpa)||'—'} GPA | #${clean(player?.jersey)||'—'}`;
 }
 function shortCoachIntro(player){const text=clean(player?.coachEvaluation);return text?text.split(/\n\s*\n/)[0]:`${player?.name||'This player'} is a coach-verified member of the KC Rebels.`}
 function scheduleText(){return EVENTS.map(event=>`${event.name} — ${event.detail.replace(' · ',' — ')}`).join('\n')}
 function buildPlayerEmailBody(player,coachLastName='Coach'){
  const first=clean(player?.name).split(/\s+/)[0]||'this player',url=profileUrl(player?.name);
  return `Coach ${coachLastName || 'Coach'},\n\nI wanted to introduce you to ${player.name}, a ${player.grad} player with the KC Rebels.\n\n${shortCoachIntro(player)}\n\nPLAYER PROFILE / CURRENT RESULTS\n${url}\n\n${first}'s KC Rebels Recruiting Profile includes my coach evaluation along with current results and development notes.\n\nUPCOMING SCHEDULE\n${scheduleText()}\n\nGAMECHANGER\n${GAMECHANGER_URL}\n\nPlease feel free to contact me if you'd like additional information about ${first}.\n\nDan Lickel\nHead Coach | KC Rebels 16U Regional\nDirector of Recruiting | Kansas City Rebels\n913-485-6576\nrecruiting@rebelssoftball.org`;
 }
 function statsForPlayer(name){
  const db=readDb();
  const pas=(db.savedGames||[]).flatMap(game=>game.plateAppearances||[]).filter(pa=>pa.hitter===name);
  return root.HotBEvaluationStats?.statsForPAs?root.HotBEvaluationStats.statsForPAs(pas):{PA:pas.length,AVG:0,OBP:0,contactPct:0};
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
 function evaluationStatus(name){const player=playerRecord(name),entry=readRecruiting().players?.[name]||{};const stamp=entry.coachEvaluationUpdatedAt;if(!stamp)return player?.coachEvaluation?'Current':'Not set';const date=new Date(stamp);return Number.isNaN(date.getTime())?'Current':`Current · Updated ${date.toLocaleDateString('en-US',{month:'short',year:'numeric'})}`}
 function payload(name){
  const db=readDb(),player=(db.roster||[]).find(item=>item.name===name);if(!player)return null;
  const stats=statsForPlayer(name),recruiting=readRecruiting(),entry=recruiting.players?.[name]||{},slug=slugFor(name);
  const measurements={};['Fastball','Changeup','Exit Velocity','Home to First','Pop Time'].forEach(type=>{const row=bestMeasurement(db,name,type);if(row)measurements[type]={value:row.value,date:dateLabel(row.date)}});
  return {slug,updatedAt:new Date().toISOString(),player:{name:player.name,jersey:player.jersey||'',grad:player.grad||'',positions:player.positions||'',gpa:player.gpa||'',school:player.school||'',interest:player.interest||'',side:player.side||'',throws:player.throws||'R',email:player.email||'',twitter:player.twitter||'',sportsRecruits:player.sportsRecruits||'',photo:player.photo||''},coachEvaluation:entry.coachEvaluation||player.coachEvaluation||'',coachEvaluationUpdatedAt:entry.coachEvaluationUpdatedAt||'',motto:clean(entry.motto||player.quote),mottoUpdatedAt:entry.mottoUpdatedAt||'',developmentStrengths:player.developmentStrengths||[],developmentGrowth:player.developmentGrowth||[],hitting:{PA:stats.PA,AVG:round3(stats.AVG),OBP:round3(stats.OBP),CONTACT:pct0(stats.contactPct)},pitching:{IP:player.pitcherIP||'—',ERA:player.pitcherERA||'—',WHIP:player.pitcherWHIP||'—','K/BB':player.pitcherKBB||'—',OBA:player.pitcherOBA||'—','STRIKE %':player.pitcherStrikePct||'—'},measurements,events:EVENTS,gameChangerUrl:GAMECHANGER_URL,sportsRecruitsUrl:player.sportsRecruits||''};
 }
 function modalShell(inner){return `<div class="rw-backdrop" data-rw-close><section class="rw-modal" role="dialog" aria-modal="true">${inner}</section></div>`}
 function closeModal(){document.querySelector('.rw-backdrop')?.remove()}
 function openEvaluation(name){const player=playerRecord(name),entry=readRecruiting().players?.[name]||{};if(!player)return;document.body.insertAdjacentHTML('beforeend',modalShell(`<div class="rw-modal-head"><div><span>COACH EVALUATION</span><h2>${esc(name)}</h2></div><button class="rw-close" type="button" data-rw-close>Close</button></div><p class="rw-help">Changes here also update this player's Recruiting Profile.</p><textarea id="rwCoachEvaluation">${esc(entry.coachEvaluation||player.coachEvaluation||'')}</textarea><div class="rw-actions"><button class="rw-secondary" type="button" data-rw-close>Cancel</button><button class="rw-primary" id="rwSaveEvaluation" type="button">Save Evaluation</button></div>`));document.querySelector('#rwSaveEvaluation')?.addEventListener('click',async()=>{const value=clean(document.querySelector('#rwCoachEvaluation')?.value);if(!value)return;const store=readRecruiting();store.players=store.players||{};store.players[name]={...(store.players[name]||{}),coachEvaluation:value,coachEvaluationUpdatedAt:new Date().toISOString()};saveRecruiting(store);closeModal();await publishProfile(name,true);inject(true)})}
 function openMotto(name){const player=playerRecord(name),entry=readRecruiting().players?.[name]||{};if(!player)return;document.body.insertAdjacentHTML('beforeend',modalShell(`<div class="rw-modal-head"><div><span>PLAYER MOTTO</span><h2>${esc(name)}</h2></div><button class="rw-close" type="button" data-rw-close>Close</button></div><label class="rw-label">Player Motto<input id="rwMottoInput" maxlength="220" value="${esc(entry.motto||player.quote||'')}"></label><div class="rw-actions"><button class="rw-secondary" type="button" data-rw-close>Cancel</button><button class="rw-primary" id="rwSaveMotto" type="button">Save Motto</button></div>`));document.querySelector('#rwSaveMotto')?.addEventListener('click',async()=>{const store=readRecruiting(),motto=clean(document.querySelector('#rwMottoInput')?.value);store.players=store.players||{};store.players[name]={...(store.players[name]||{}),motto,mottoUpdatedAt:new Date().toISOString()};saveRecruiting(store);closeModal();await publishProfile(name,true);inject(true)})}
 function coachLastName(coach){const parts=clean(coach?.coachName).split(/\s+/);return parts[parts.length-1]||'Coach'}
 function coachMatches(coaches,query,key){
  const q=normalize(query);if(!q)return[];
  return [...coaches].filter(coach=>normalize(coach[key]).includes(q)).sort((a,b)=>{
   const aStart=normalize(a[key]).startsWith(q),bStart=normalize(b[key]).startsWith(q);
   return Number(bStart)-Number(aStart)||(a[key]||'').localeCompare(b[key]||'');
  }).slice(0,8);
 }
 function openEmail(name){
  const db=readDb(),player=(db.roster||[]).find(item=>item.name===name);if(!player)return;
  const coaches=db.coaches||[];let selectedCoach=null;
  document.body.insertAdjacentHTML('beforeend',modalShell(`<div class="rw-modal-head"><div><span>EMAIL COACH</span><h2>${esc(player.name)}</h2></div><button class="rw-close" type="button" data-rw-close>Close</button></div><p class="rw-help">Start typing a coach name or college. Tap a match to select that coach.</p><div class="rw-search-grid"><label class="rw-label">Coach's Name<input id="rwCoachName" autocomplete="off" placeholder="Start typing a coach name"><div class="rw-search-results" id="rwCoachNameMatches" hidden></div></label><label class="rw-label">College<input id="rwCollegeName" autocomplete="off" placeholder="Start typing a college"><div class="rw-search-results" id="rwCollegeMatches" hidden></div></label></div><div class="rw-email-meta"><b>To:</b> <span id="rwTo">Select a coach</span><br><b>CC:</b> <span>${esc(player.email||'None')}</span><br><b>Subject:</b> <span>${esc(buildEmailSubject(player))}</span></div><label class="rw-label">Email Message — You Can Edit It Here<textarea id="rwEmailBody">${esc(buildPlayerEmailBody(player,'Coach'))}</textarea></label><p class="rw-help">Nothing sends until you confirm and Gmail completes authorization.</p><div class="rw-actions"><button class="rw-secondary" type="button" data-rw-close>Cancel</button><button class="rw-primary" id="rwSendEmail" type="button" disabled>Send with Gmail</button></div>`));
  const coachInput=document.querySelector('#rwCoachName'),collegeInput=document.querySelector('#rwCollegeName'),coachResults=document.querySelector('#rwCoachNameMatches'),collegeResults=document.querySelector('#rwCollegeMatches'),to=document.querySelector('#rwTo'),textarea=document.querySelector('#rwEmailBody'),send=document.querySelector('#rwSendEmail');
  const choose=coach=>{selectedCoach=coach;coachInput.value=coach.coachName||'';collegeInput.value=coach.collegeName||'';to.textContent=coach.coachEmail||'No saved email';textarea.value=buildPlayerEmailBody(player,coachLastName(coach));send.disabled=!clean(coach.coachEmail);coachResults.hidden=true;collegeResults.hidden=true};
  const showMatches=(input,container,key)=>{
   const matches=coachMatches(coaches,input.value,key);container.replaceChildren();
   matches.forEach(coach=>{const button=document.createElement('button');button.type='button';button.className='rw-search-result';const primary=document.createElement('b'),secondary=document.createElement('span');primary.textContent=coach.coachName||'Coach';secondary.textContent=`${coach.collegeName||''}${coach.coachEmail?` · ${coach.coachEmail}`:''}`;button.append(primary,secondary);button.addEventListener('pointerdown',event=>{event.preventDefault();choose(coach)});container.append(button)});
   container.hidden=!matches.length;
  };
  coachInput.addEventListener('input',()=>showMatches(coachInput,coachResults,'coachName'));
  collegeInput.addEventListener('input',()=>showMatches(collegeInput,collegeResults,'collegeName'));
  coachInput.addEventListener('focus',()=>showMatches(coachInput,coachResults,'coachName'));
  collegeInput.addEventListener('focus',()=>showMatches(collegeInput,collegeResults,'collegeName'));
  [coachInput,collegeInput].forEach(input=>input.addEventListener('blur',()=>setTimeout(()=>{coachResults.hidden=true;collegeResults.hidden=true},120)));
  send.addEventListener('click',async event=>{
   const email=clean(selectedCoach?.coachEmail);if(!email){alert('Select a saved coach with an email address first.');return}
   if(!confirm(`Send this recruiting email now to ${email}${player.email?` and CC ${player.email}`:''}?`))return;
   const button=event.currentTarget;button.disabled=true;button.textContent='Connecting to Gmail…';
   try{const token=await requestGmailAccessToken();button.textContent='Sending…';await sendEmail(token,email,player.email||'',buildEmailSubject(player),textarea.value||'');closeModal();alert('Recruiting email sent through Gmail.')}catch(error){button.disabled=false;button.textContent='Send with Gmail';alert(error?.message||'Gmail could not send this email. Nothing was sent.')}
  });
 }
 function openText(player){
  const positions=clean(player?.positions).replace(/\s*\|\s*/g,'/');
  const message=root.HotBSms?.recruitingProfileMessage({name:player?.name,grad:player?.grad,positions,url:profileUrl(player?.name)})||'';
  const destination=root.HotBSms?.composeSmsUrl({message,userAgent:root.navigator?.userAgent||''})||'';
  if(destination)root.location.href=destination;
 }
 function requestGmailAccessToken(){return new Promise((resolve,reject)=>{if(!root.google?.accounts?.oauth2){reject(new Error('Google sign-in is still loading. Wait a few seconds and try again.'));return}const client=root.google.accounts.oauth2.initTokenClient({client_id:GMAIL_CLIENT_ID,scope:GMAIL_SEND_SCOPE,callback:response=>response.error?reject(new Error('Gmail authorization was not completed.')):resolve(response.access_token),error_callback:()=>reject(new Error('Gmail authorization was closed or blocked.'))});client.requestAccessToken({prompt:'select_account consent'})})}
 function htmlText(value){return esc(value).replace(/(https?:\/\/[^\s<]+)/g,url=>`<a href="${url}" style="color:#b3262d">${url}</a>`)}
 function bodyHtml(body){let html='';String(body||'').split(/\r?\n/).forEach(line=>{const value=line.trim();if(!value){html+='<div style="height:10px"></div>';return}if(['PLAYER PROFILE / CURRENT RESULTS','UPCOMING SCHEDULE','GAMECHANGER'].includes(value)){html+=`<h3 style="margin:20px 0 8px;font-size:16px">${esc(value)}</h3>`;return}html+=`<div style="margin:3px 0">${htmlText(value)}</div>`});return `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#111">${html}</div>`}
 function utf8Base64(value){const bytes=new TextEncoder().encode(String(value)),step=0x8000;let binary='';for(let i=0;i<bytes.length;i+=step)binary+=String.fromCharCode(...bytes.subarray(i,i+step));return btoa(binary)}
 async function sendEmail(token,to,cc,subject,body){const headers=[`To: ${to}`,cc?`Cc: ${cc}`:'',`Subject: =?UTF-8?B?${utf8Base64(subject)}?=`,'MIME-Version: 1.0','Content-Type: text/html; charset="UTF-8"','Content-Transfer-Encoding: 8bit'].filter(Boolean).join('\r\n');const raw=utf8Base64(`${headers}\r\n\r\n${bodyHtml(body)}`).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');const response=await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({raw})});if(!response.ok){const detail=await response.json().catch(()=>({}));throw new Error(detail?.error?.message||'Gmail rejected the message. Nothing was sent.')}}
 async function publishProfile(name,force=false){if(!root.firebase?.apps?.length)return false;const auth=root.firebase.auth(),user=auth.currentUser;if(!user||user.isAnonymous||String(user.email||'').toLowerCase()!=='hotbkcrebels@gmail.com')return false;const data=payload(name);if(!data)return false;const serialized=JSON.stringify(data),key='hotbRecruitingPublishedV2:'+data.slug;if(!force&&sessionStorage.getItem(key)===serialized)return true;try{await root.firebase.firestore().collection('recruitingProfiles').doc(data.slug).set(data,{merge:true});sessionStorage.setItem(key,serialized);return true}catch(error){console.warn('Recruiting Profile publish failed',error);return false}} async function publishAllProfiles(force=false){const names=(readDb().roster||[]).map(player=>player?.name).filter(Boolean);if(!names.length)return false;const results=await Promise.allSettled(names.map(name=>publishProfile(name,force)));return results.every(result=>result.status==='fulfilled'&&result.value===true)}
 function inject(force=false){const evalApp=document.querySelector('.eval-app'),select=document.querySelector('#evalSelect');if(!evalApp||!select)return;const name=select.value,player=name==='Team'?null:playerRecord(name),existing=document.querySelector('#rwRecruitingSection');if(!force&&existing?.dataset.player===name)return;if(existing)existing.remove();if(!player)return;const anchor=document.querySelector('.player-card.player-profile');if(!anchor)return;const entry=readRecruiting().players?.[name]||{},motto=clean(entry.motto||player.quote);const html=`<section class="rw-recruiting" id="rwRecruitingSection" data-player="${esc(name)}"><div class="rw-section-head"><div><span>RECRUITING</span><h2>Recruiting</h2></div><small>Coach Verified</small></div><div class="rw-buttons"><button type="button" class="rw-profile">Recruiting Profile</button><button type="button" class="rw-email">Email Coach</button><button type="button" class="rw-text">Text Profile</button></div><div class="rw-eval-line"><span><b>Coach Evaluation:</b> ${esc(evaluationStatus(name))}</span><button type="button" class="rw-evaluation-link">Edit</button></div><div class="rw-eval-line rw-motto-line"><span><b>Player Motto:</b> ${esc(motto||'Not set')}</span><button type="button" class="rw-evaluation-link rw-motto-edit">Edit</button></div><p>Public scouting report · Coach-to-coach introduction</p></section>`;anchor.insertAdjacentHTML('afterend',html);document.querySelector('.rw-profile')?.addEventListener('click',()=>{const url=PROFILE_PATH+'?player='+encodeURIComponent(slugFor(name));root.open(url,'_blank','noopener');publishProfile(name,true)});document.querySelector('.rw-evaluation-link')?.addEventListener('click',()=>openEvaluation(name));document.querySelector('.rw-motto-edit')?.addEventListener('click',()=>openMotto(name));document.querySelector('.rw-email')?.addEventListener('click',()=>openEmail(name));document.querySelector('.rw-text')?.addEventListener('click',()=>openText(player));publishProfile(name,false)}
 function init(){
  if(typeof document==='undefined')return;
  document.addEventListener('click',event=>{if(event.target.matches('[data-rw-close]'))closeModal()});
  const observer=new MutationObserver(()=>requestAnimationFrame(inject));observer.observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('change',event=>{if(event.target?.id==='evalSelect')setTimeout(inject,0)});
  if(root.firebase?.auth)root.firebase.auth().onAuthStateChanged(()=>setTimeout(()=>publishAllProfiles(false),200));
  inject();
 }
 if(typeof document!=='undefined'&&document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
 return {PROFILE_BASE_URL,DEFAULT_EVALUATION,EVENTS,activePlayer,buildEmailSubject,buildPlayerEmailBody,shortCoachIntro,coachMatches,payload,slugFor,profileUrl,publishAllProfiles};
});