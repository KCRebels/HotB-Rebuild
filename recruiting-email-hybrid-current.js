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
 const readDb=()=>{try{return JSON.parse(localStorage.getItem(DB_KEY)||'{}')}catch{return{}}};
 const saveDb=db=>localStorage.setItem(DB_KEY,JSON.stringify(db));
 function lastName(name){const p=clean(name).replace(/^Coach\s+/i,'').split(/\s+/);return p[p.length-1]||'Coach'}
 function subject(player){const pos=clean(player?.positions).replace(/\s*\|\s*/g,'/');return `${player?.name||'Player'} | ${player?.grad||'Grad Year'} | ${pos||'Positions'} | ${player?.gpa||'—'} GPA | #${player?.jersey||'—'}`}
 function body(name){return `Coach ${lastName(name)},\n\nI wanted to introduce you to Brooklyn Gering, a 2029 player with the KC Rebels.\n\nBrooklyn is a competitor who wants the ball, throws with good velocity, and consistently finds the strike zone. At the plate she makes consistent contact, can hit the ball hard, and has developing extra-base power. She is an outstanding teammate, extremely coachable, and actively seeks feedback to improve.\n\nPLAYER PROFILE / CURRENT RESULTS\n${PROFILE}\n\nHer KC Rebels Recruiting Profile includes my coach evaluation along with her current hitting and pitching results.\n\nUPCOMING SCHEDULE\n${EVENTS.join('\n')}\n\nGAMECHANGER\n${GAMECHANGER}\n\nPlease feel free to contact me if you'd like additional information about Brooklyn.\n\nDan Lickel\nHead Coach | KC Rebels 16U Regional\nDirector of Recruiting | Kansas City Rebels\n913-485-6576\nrecruiting@rebelssoftball.org`}
 function close(){document.querySelector('#hybridRecruitingBackdrop')?.remove()}
 function coachKey(c){return clean(c?.coachEmail).toLowerCase()}
 function gmailToken(){return new Promise((resolve,reject)=>{if(!window.google?.accounts?.oauth2)return reject(new Error('Google sign-in is still loading. Wait a few seconds and try again.'));const client=google.accounts.oauth2.initTokenClient({client_id:GMAIL_CLIENT_ID,scope:GMAIL_SCOPE,callback:r=>r?.access_token?resolve(r.access_token):reject(new Error(r?.error||'Google authorization failed.'))});client.requestAccessToken({prompt:''})})}
 function rawMessage(to,cc,subj,text){const headers=[`To: ${to}`,cc?`Cc: ${cc}`:'',`Subject: ${subj}`,'MIME-Version: 1.0','Content-Type: text/plain; charset=UTF-8','',text].filter((x,i)=>x!==''||i>4).join('\r\n');return btoa(unescape(encodeURIComponent(headers))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
 async function sendMail(token,to,cc,subj,text){const res=await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({raw:rawMessage(to,cc,subj,text)})});if(!res.ok)throw new Error('Gmail could not send this email. Nothing was sent.');return res.json()}
 function open(){
  const db=readDb(),player=(db.roster||[]).find(p=>p.name===ACTIVE);if(!player)return;
  const coaches=[...(db.coaches||[])].sort((a,b)=>clean(a.coachName).localeCompare(clean(b.coachName),undefined,{sensitivity:'base'}));
  document.body.insertAdjacentHTML('beforeend',`<div id="hybridRecruitingBackdrop" class="modal-backdrop"><div class="modal recruiting-email-modal"><div class="modal-header"><div><div class="small info-kicker">RECRUITING EMAIL</div><h2>${esc(player.name)}</h2></div><button class="btn" id="hybridClose">Cancel</button></div>
  <div class="info-field"><span>Coach List</span><select id="hybridCoachList" class="input"><option value="">Choose a saved coach</option>${coaches.map(c=>`<option value="${esc(c.coachEmail||'')}">${esc(c.coachName||'Coach')} — ${esc(c.collegeName||'')}</option>`).join('')}</select></div>
  <label class="info-field"><span>Coach’s Name</span><input id="hybridCoachName" value="" placeholder="Example: Coach Smith" autocomplete="off"></label>
  <label class="info-field"><span>Coach’s Email</span><input id="hybridCoachEmail" type="email" value="" placeholder="coach@college.edu"></label>
  <label class="info-field"><span>College Name</span><input id="hybridCollege" value="" placeholder="College or university" autocomplete="off"></label>
  <div class="coach-save-row"><button class="btn black" id="hybridSaveCoach">Save New Coach</button><span id="hybridSavedStatus"></span></div>
  <label class="info-field"><span>Optional Personal Note</span><textarea id="hybridNote" rows="3" placeholder="Add a personal message for this coach if needed."></textarea></label>
  <div class="email-preview-group"><label class="info-field"><span>Email Message — You Can Edit It Here</span><textarea id="hybridBody" class="email-body-preview">${esc(body('Coach'))}</textarea></label><p class="email-note">Select the coach above, review the message, then send directly through Gmail.</p><button class="btn red block" id="hybridSend" disabled>Send with Gmail</button><div class="email-copy-row"><span><b>CC:</b> ${esc(player.email||'No player email saved')}</span></div></div>
  </div></div>`);
  const list=document.querySelector('#hybridCoachList'),name=document.querySelector('#hybridCoachName'),email=document.querySelector('#hybridCoachEmail'),college=document.querySelector('#hybridCollege'),note=document.querySelector('#hybridNote'),msg=document.querySelector('#hybridBody'),send=document.querySelector('#hybridSend'),save=document.querySelector('#hybridSaveCoach'),status=document.querySelector('#hybridSavedStatus');
  let auto=body('Coach'),selected=null;
  const sync=()=>{const next=body(name.value||'Coach');if(!msg.value||msg.value===auto){msg.value=next;auto=next}send.disabled=!email.validity.valid||!clean(email.value)};
  list.addEventListener('change',()=>{selected=coaches.find(c=>coachKey(c)===clean(list.value).toLowerCase())||null;if(selected){name.value=selected.coachName||'';email.value=selected.coachEmail||'';college.value=selected.collegeName||'';save.textContent='Save Coach Changes'}else save.textContent='Save New Coach';sync()});
  [name,email].forEach(el=>el.addEventListener('input',sync));
  save.addEventListener('click',()=>{const n=clean(name.value),e=clean(email.value),c=clean(college.value);if(!n||!e||!c){alert('Enter the coach name, email, and college first.');return}const latest=readDb();latest.coaches=latest.coaches||[];const idx=latest.coaches.findIndex(x=>coachKey(x)===e.toLowerCase());const rec={...(idx>=0?latest.coaches[idx]:{}),coachName:n,coachEmail:e,collegeName:c,lastUpdated:new Date().toISOString()};if(idx>=0)latest.coaches[idx]=rec;else latest.coaches.push(rec);saveDb(latest);status.textContent='Saved';selected=rec;save.textContent='Save Coach Changes'});
  document.querySelector('#hybridClose').addEventListener('click',close);
  document.querySelector('#hybridRecruitingBackdrop').addEventListener('click',e=>{if(e.target.id==='hybridRecruitingBackdrop')close()});
  send.addEventListener('click',async()=>{const to=clean(email.value);if(!to)return;let text=msg.value||body(name.value);const personal=clean(note.value);if(personal)text=text.replace(/\n\nPLAYER PROFILE/,`\n\n${personal}\n\nPLAYER PROFILE`);if(!confirm(`Send this recruiting email now to ${to}${player.email?` and CC ${player.email}`:''}?`))return;send.disabled=true;send.textContent='Connecting to Gmail…';try{const token=await gmailToken();send.textContent='Sending…';await sendMail(token,to,player.email||'',subject(player),text);close();alert('Recruiting email sent through Gmail.')}catch(err){send.disabled=false;send.textContent='Send with Gmail';alert(err?.message||'Gmail could not send this email. Nothing was sent.')}});
  sync();
 }
 document.addEventListener('click',event=>{const button=event.target.closest('#rwRecruitingSection .rw-email');if(!button)return;event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();open()},true);
})();
