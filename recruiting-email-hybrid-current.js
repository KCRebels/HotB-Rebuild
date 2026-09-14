(()=>{
 'use strict';
 const DB_KEY='hotbRebuildDbV1';
 const ACTIVE='Brooklyn Gering';
 const PROFILE='https://kcrebels.github.io/HotB-Rebuild/brooklyn-gering-recruiting-profile.html';
 const GAMECHANGER='https://web.gc.com/teams/K1E4TcPCwGKj/2027-summer-kc-rebels-16-regional-lickel';
 const GMAIL_CLIENT_ID='412203516902-el4rhl939lb6frbbvh4krvqequ8ut7v3.apps.googleusercontent.com';
 const GMAIL_SCOPE='https://www.googleapis.com/auth/gmail.send';
 const EVENTS=['Triple Crown St. Louis Showcase — Oct. 16–18 — Chesterfield, Missouri','Top Gun Select Invite — Oct. 30–Nov. 1 — Kansas City Metro','RecruitLook Showcase — Nov. 6–8 — Kansas City Metro'];
 const clean=v=>String(v??'').trim();
 const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
 const normalize=v=>clean(v).toLowerCase().replace(/\s+/g,' ');
 const readDb=()=>{try{return JSON.parse(localStorage.getItem(DB_KEY)||'{}')}catch{return{}}};
 const saveDb=db=>localStorage.setItem(DB_KEY,JSON.stringify(db));
 const shortCollege=v=>String(v||'').replace(/\bUniversity\b/gi,'U');
 function lastName(name){const p=clean(name).replace(/^Coach\s+/i,'').split(/\s+/);return p[p.length-1]||'Coach'}
 function subject(player){const pos=clean(player?.positions).replace(/\s*\|\s*/g,'/');return `${player?.name||'Player'} | ${player?.grad||'Grad Year'} | ${pos||'Positions'} | ${player?.gpa||'—'} GPA | #${player?.jersey||'—'}`}
 function emailBody(name){return `Coach ${lastName(name)},\n\nI wanted to introduce you to Brooklyn Gering, a 2029 player with the KC Rebels.\n\nBrooklyn is a competitor who wants the ball, throws with good velocity, and consistently finds the strike zone. At the plate she makes consistent contact, can hit the ball hard, and has developing extra-base power. She is an outstanding teammate, extremely coachable, and actively seeks feedback to improve.\n\nPLAYER PROFILE / CURRENT RESULTS\n${PROFILE}\n\nHer KC Rebels Recruiting Profile includes my coach evaluation along with her current hitting and pitching results.\n\nUPCOMING SCHEDULE\n${EVENTS.join('\n')}\n\nGAMECHANGER\n${GAMECHANGER}\n\nPlease feel free to contact me if you'd like additional information about Brooklyn.\n\nDan Lickel\nHead Coach | KC Rebels 16U Regional\nDirector of Recruiting | Kansas City Rebels\n913-485-6576\nrecruiting@rebelssoftball.org`}
 function close(){document.querySelector('#hybridRecruitingBackdrop')?.remove()}
 function coachKey(c){return clean(c?.coachEmail).toLowerCase()}
 function formatUpdated(v){if(!v)return'';const d=new Date(v);return Number.isNaN(d.getTime())?'':d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
 function gmailToken(){return new Promise((resolve,reject)=>{if(!window.google?.accounts?.oauth2)return reject(new Error('Google sign-in is still loading. Wait a few seconds and try again.'));const client=google.accounts.oauth2.initTokenClient({client_id:GMAIL_CLIENT_ID,scope:GMAIL_SCOPE,callback:r=>r?.access_token?resolve(r.access_token):reject(new Error(r?.error||'Google authorization failed.'))});client.requestAccessToken({prompt:''})})}
 function rawMessage(to,cc,subj,text){const headers=[`To: ${to}`,cc?`Cc: ${cc}`:'',`Subject: ${subj}`,'MIME-Version: 1.0','Content-Type: text/plain; charset=UTF-8','',text].filter((x,i)=>x!==''||i>4).join('\r\n');return btoa(unescape(encodeURIComponent(headers))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
 async function sendMail(token,to,cc,subj,text){const res=await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({raw:rawMessage(to,cc,subj,text)})});if(!res.ok)throw new Error('Gmail could not send this email. Nothing was sent.');return res.json()}
 function open(){
  close();
  const db=readDb(),player=(db.roster||[]).find(p=>p.name===ACTIVE);if(!player)return;
  const coaches=[...(db.coaches||[])].sort((a,b)=>clean(a.coachName).localeCompare(clean(b.coachName),undefined,{sensitivity:'base'})||clean(a.collegeName).localeCompare(clean(b.collegeName)));
  document.body.insertAdjacentHTML('beforeend',`<div id="hybridRecruitingBackdrop" class="modal-backdrop"><div class="modal recruiting-email-modal"><div class="modal-header"><div><div class="small info-kicker">RECRUITING EMAIL</div><h2>${esc(player.name)}</h2></div><button class="btn" id="hybridClose">Cancel</button></div>
  <div class="info-field"><span>Coach List</span><div class="coach-list-picker"><button class="coach-list-toggle" id="coachListToggle" type="button" aria-expanded="false"><b>Choose a saved coach</b><small>Alphabetical by first name</small></button><div class="coach-list-menu" id="coachListMenu" hidden>${coaches.map(c=>`<button type="button" class="coach-list-option" data-coach-email="${esc(c.coachEmail||'')}"><b>${esc(c.coachName||'Coach')}</b><span>${esc(shortCollege(c.collegeName||''))}</span></button>`).join('')}</div></div></div>
  <label class="info-field coach-search-field"><span>Coach’s Name</span><input id="emailCoachName" value="" placeholder="Example: Coach Smith" autocomplete="off"><div class="coach-search-results" id="coachNameMatches" hidden></div></label>
  <label class="info-field"><span>Coach’s Email</span><input id="emailCoachAddress" type="email" value="" placeholder="coach@college.edu"></label>
  <label class="info-field coach-search-field"><span>College Name</span><input id="emailCollegeName" value="" placeholder="College or university" autocomplete="off"><div class="coach-search-results" id="collegeNameMatches" hidden></div></label>
  <div class="coach-save-row"><button class="btn black" id="saveCoachChanges" disabled>Save New Coach</button><span id="coachLastUpdated">No changes saved on this device</span></div>
  <label class="info-field"><span>Optional Personal Note</span><textarea id="emailPersonalNote" rows="3" placeholder="Add a personal message for this coach if needed."></textarea></label>
  <div class="email-preview-group"><button class="btn black block preview-recruiting-email" id="previewRecruitingEmail" style="display:none" disabled>Preview Email</button><div class="email-preview-group" id="rwHybridArea"><label class="info-field"><span>Email Message — You Can Edit It Here</span><textarea id="rwHybridBody" class="email-body-preview">${esc(emailBody('Coach'))}</textarea></label><p class="email-note">Select the coach above, review the message, then send directly through Gmail.</p><button class="btn red block" id="rwHybridSend" disabled>Send with Gmail</button></div><div class="email-copy-row"><span><b>CC:</b> ${esc(player.email||'No player email saved')}</span></div></div>
  <div class="email-template-actions"><button class="btn" id="downloadCoachTemplate">Download Coach Template</button><button class="btn" id="importCoachList">Import Coach List</button><input id="coachImportFile" type="file" accept=".xlsx,.xls,.csv" hidden></div>
  </div></div>`);
  const toggle=document.querySelector('#coachListToggle'),menu=document.querySelector('#coachListMenu'),name=document.querySelector('#emailCoachName'),email=document.querySelector('#emailCoachAddress'),college=document.querySelector('#emailCollegeName'),nameMatches=document.querySelector('#coachNameMatches'),collegeMatches=document.querySelector('#collegeNameMatches'),save=document.querySelector('#saveCoachChanges'),updated=document.querySelector('#coachLastUpdated'),note=document.querySelector('#emailPersonalNote'),msg=document.querySelector('#rwHybridBody'),send=document.querySelector('#rwHybridSend');
  let selected=null,auto=emailBody('Coach');
  const findByEmail=value=>coaches.find(c=>coachKey(c)===clean(value).toLowerCase())||null;
  const choose=coach=>{selected=coach;name.value=coach.coachName||'';email.value=coach.coachEmail||'';college.value=coach.collegeName||'';toggle.innerHTML=`<b>${esc(coach.coachName||'Coach')}</b><small>${esc(shortCollege(coach.collegeName||''))}</small>`;save.textContent='Save Coach Changes';updated.textContent=coach.lastUpdated?`Last updated ${formatUpdated(coach.lastUpdated)}`:'No changes saved on this device';menu.hidden=true;toggle.setAttribute('aria-expanded','false');nameMatches.hidden=true;collegeMatches.hidden=true;sync()};
  const sync=()=>{const next=emailBody(name.value||'Coach');if(!msg.value||msg.value===auto){msg.value=next;auto=next}send.disabled=!clean(email.value)||!email.validity.valid;save.disabled=!clean(name.value)||!clean(email.value)||!email.validity.valid||!clean(college.value)};
  const renderMatches=(input,container,key)=>{const q=normalize(input.value);container.innerHTML='';if(!q){container.hidden=true;return}const rows=coaches.filter(c=>normalize(c[key]).includes(q)).slice(0,8);rows.forEach(c=>{const b=document.createElement('button');b.type='button';b.className='coach-search-result';b.innerHTML=`<b>${esc(c.coachName||'Coach')}</b><span>${esc(c.collegeName||'')}${c.coachEmail?` · ${esc(c.coachEmail)}`:''}</span>`;b.addEventListener('pointerdown',e=>{e.preventDefault();choose(c)});container.appendChild(b)});container.hidden=!rows.length};
  toggle.addEventListener('click',()=>{menu.hidden=!menu.hidden;toggle.setAttribute('aria-expanded',String(!menu.hidden))});
  menu.querySelectorAll('[data-coach-email]').forEach(b=>b.addEventListener('click',()=>{const c=findByEmail(b.dataset.coachEmail);if(c)choose(c)}));
  name.addEventListener('input',()=>{selected=null;renderMatches(name,nameMatches,'coachName');sync()});
  college.addEventListener('input',()=>{selected=null;renderMatches(college,collegeMatches,'collegeName');sync()});
  email.addEventListener('input',sync);
  [name,college].forEach(input=>input.addEventListener('blur',()=>setTimeout(()=>{nameMatches.hidden=true;collegeMatches.hidden=true},120)));
  save.addEventListener('click',()=>{const n=clean(name.value),e=clean(email.value),c=clean(college.value);if(!n||!e||!c)return;const latest=readDb();latest.coaches=latest.coaches||[];const idx=latest.coaches.findIndex(x=>coachKey(x)===e.toLowerCase());const rec={...(idx>=0?latest.coaches[idx]:{}),coachName:n,coachEmail:e,collegeName:c,lastUpdated:new Date().toISOString()};if(idx>=0)latest.coaches[idx]=rec;else latest.coaches.push(rec);saveDb(latest);selected=rec;save.textContent='Save Coach Changes';updated.textContent=`Last updated ${formatUpdated(rec.lastUpdated)}`});
  document.querySelector('#hybridClose').addEventListener('click',close);
  document.querySelector('#hybridRecruitingBackdrop').addEventListener('click',e=>{if(e.target.id==='hybridRecruitingBackdrop')close()});
  send.addEventListener('click',async()=>{const to=clean(email.value);if(!to)return;let text=msg.value||emailBody(name.value);const personal=clean(note.value);if(personal)text=text.replace(/\n\nPLAYER PROFILE/,`\n\n${personal}\n\nPLAYER PROFILE`);if(!confirm(`Send this recruiting email now to ${to}${player.email?` and CC ${player.email}`:''}?`))return;send.disabled=true;send.textContent='Connecting to Gmail…';try{const token=await gmailToken();send.textContent='Sending…';await sendMail(token,to,player.email||'',subject(player),text);close();alert('Recruiting email sent through Gmail.')}catch(err){send.disabled=false;send.textContent='Send with Gmail';alert(err?.message||'Gmail could not send this email. Nothing was sent.')}});
  document.querySelector('#downloadCoachTemplate').addEventListener('click',()=>alert('Coach template download is unchanged from the original email workflow.'));
  document.querySelector('#importCoachList').addEventListener('click',()=>document.querySelector('#coachImportFile').click());
  sync();
 }
 document.addEventListener('click',event=>{const button=event.target.closest('#rwRecruitingSection .rw-email');if(!button)return;event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();open()},true);
})();
