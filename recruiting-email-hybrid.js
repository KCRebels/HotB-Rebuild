(()=>{
 const DB_KEY='hotbRebuildDbV1';
 const PLAYER='Brooklyn Gering';
 const PROFILE_URL='https://kcrebels.github.io/HotB-Rebuild/brooklyn-gering-recruiting-profile.html';
 const GAMECHANGER_URL='https://web.gc.com/teams/K1E4TcPCwGKj/2027-summer-kc-rebels-16-regional-lickel';
 const GMAIL_CLIENT_ID='412203516902-el4rhl939lb6frbbvh4krvqequ8ut7v3.apps.googleusercontent.com';
 const GMAIL_SCOPE='https://www.googleapis.com/auth/gmail.send';
 const EVENTS=['Triple Crown St. Louis Showcase — Oct. 16–18 — Chesterfield, Missouri','Top Gun Select Invite — Oct. 30–Nov. 1 — Kansas City Metro','RecruitLook Showcase — Nov. 6–8 — Kansas City Metro'];
 const clean=v=>String(v??'').trim();
 const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
 function db(){try{return JSON.parse(localStorage.getItem(DB_KEY)||'{}')}catch{return{}}}
 function player(){return(db().roster||[]).find(p=>p.name===PLAYER)||null}
 function subject(p){const pos=clean(p?.positions).replace(/\s*\|\s*/g,'/');return `${clean(p?.name)||'Player'} | ${clean(p?.grad)||'Grad Year'} | ${pos||'Positions'} | ${clean(p?.gpa)||'—'} GPA | #${clean(p?.jersey)||'—'}`}
 function lastName(name){const parts=clean(name).split(/\s+/);return parts[parts.length-1]||'Coach'}
 function body(coachName){return `Coach ${lastName(coachName)},\n\nI wanted to introduce you to Brooklyn Gering, a 2029 player with the KC Rebels.\n\nBrooklyn is a competitor who wants the ball, throws with good velocity, and consistently finds the strike zone. At the plate she makes consistent contact, can hit the ball hard, and has developing extra-base power. She is an outstanding teammate, extremely coachable, and actively seeks feedback to improve.\n\nPLAYER PROFILE / CURRENT RESULTS\n${PROFILE_URL}\n\nHer KC Rebels Recruiting Profile includes my coach evaluation along with her current hitting and pitching results.\n\nUPCOMING SCHEDULE\n${EVENTS.join('\n')}\n\nGAMECHANGER\n${GAMECHANGER_URL}\n\nPlease feel free to contact me if you'd like additional information about Brooklyn.\n\nDan Lickel\nHead Coach | KC Rebels 16U Regional\nDirector of Recruiting | Kansas City Rebels`}
 function token(){return new Promise((resolve,reject)=>{if(!window.google?.accounts?.oauth2){reject(new Error('Google sign-in is still loading. Wait a few seconds and try again.'));return}const client=google.accounts.oauth2.initTokenClient({client_id:GMAIL_CLIENT_ID,scope:GMAIL_SCOPE,callback:r=>r.error?reject(new Error('Gmail authorization was not completed.')):resolve(r.access_token),error_callback:()=>reject(new Error('Gmail authorization was closed or blocked.'))});client.requestAccessToken({prompt:'select_account consent'})})}
 function b64(value){const bytes=new TextEncoder().encode(String(value));let binary='';for(let i=0;i<bytes.length;i+=0x8000)binary+=String.fromCharCode(...bytes.subarray(i,i+0x8000));return btoa(binary)}
 function htmlText(v){return esc(v).replace(/(https?:\/\/[^\s<]+)/g,url=>`<a href="${url}" style="color:#b3262d">${url}</a>`)}
 function bodyHtml(value){let html='';String(value||'').split(/\r?\n/).forEach(line=>{const v=line.trim();if(!v){html+='<div style="height:10px"></div>';return}if(['PLAYER PROFILE / CURRENT RESULTS','UPCOMING SCHEDULE','GAMECHANGER'].includes(v)){html+=`<h3 style="margin:20px 0 8px;font-size:16px">${esc(v)}</h3>`;return}html+=`<div style="margin:3px 0">${htmlText(v)}</div>`});return `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#111">${html}</div>`}
 async function send(accessToken,to,cc,subj,message){const headers=[`To: ${to}`,cc?`Cc: ${cc}`:'',`Subject: =?UTF-8?B?${b64(subj)}?=`,'MIME-Version: 1.0','Content-Type: text/html; charset="UTF-8"','Content-Transfer-Encoding: 8bit'].filter(Boolean).join('\r\n');const raw=b64(`${headers}\r\n\r\n${bodyHtml(message)}`).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');const response=await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send',{method:'POST',headers:{Authorization:`Bearer ${accessToken}`,'Content-Type':'application/json'},body:JSON.stringify({raw})});if(!response.ok){const detail=await response.json().catch(()=>({}));throw new Error(detail?.error?.message||'Gmail rejected the message. Nothing was sent.')}}
 function install(){
  const preview=document.querySelector('#previewRecruitingEmail');
  const coachName=document.querySelector('#emailCoachName');
  const coachEmail=document.querySelector('#emailCoachAddress');
  const college=document.querySelector('#emailCollegeName');
  if(!preview||!coachName||!coachEmail||!college||document.querySelector('#rwHybridComposer'))return;
  const p=player();if(!p)return;
  preview.style.display='none';
  const wrap=document.createElement('section');wrap.id='rwHybridComposer';wrap.className='rw-hybrid-composer';
  wrap.innerHTML=`<div class="rw-email-meta"><b>To:</b> <span id="rwHybridTo">Select a coach above</span><br><b>CC:</b> <span>${esc(p.email||'None')}</span><br><b>Subject:</b> <span>${esc(subject(p))}</span></div><label class="rw-label">Email Message — You Can Edit It Here<textarea id="rwHybridBody"></textarea></label><p class="rw-help">Nothing sends until you confirm and Gmail completes authorization.</p><div class="rw-actions"><button type="button" class="rw-primary" id="rwHybridSend" disabled>Send with Gmail</button></div>`;
  preview.parentNode.insertBefore(wrap,preview.nextSibling);
  const to=wrap.querySelector('#rwHybridTo'),text=wrap.querySelector('#rwHybridBody'),button=wrap.querySelector('#rwHybridSend');
  let lastAutoBody='';
  const sync=()=>{const email=clean(coachEmail.value),name=clean(coachName.value);to.textContent=email||'Select a coach above';button.disabled=!email||!coachEmail.validity.valid;const next=body(name||'Coach');if(!text.value||text.value===lastAutoBody){text.value=next;lastAutoBody=next}};
  ['input','change'].forEach(type=>{coachName.addEventListener(type,()=>setTimeout(sync,0));coachEmail.addEventListener(type,()=>setTimeout(sync,0));college.addEventListener(type,()=>setTimeout(sync,0))});
  button.addEventListener('click',async()=>{const email=clean(coachEmail.value);if(!email||!coachEmail.validity.valid){alert('Select a saved coach with a valid email address first.');return}if(!confirm(`Send this recruiting email now to ${email}${p.email?` and CC ${p.email}`:''}?`))return;button.disabled=true;button.textContent='Connecting to Gmail…';try{const access=await token();button.textContent='Sending…';await send(access,email,p.email||'',subject(p),text.value||body(coachName.value));document.querySelector('[data-close]')?.click();alert('Recruiting email sent through Gmail.')}catch(error){button.disabled=false;button.textContent='Send with Gmail';alert(error?.message||'Gmail could not send this email. Nothing was sent.')}});
  sync();
 }
 const obs=new MutationObserver(()=>requestAnimationFrame(install));obs.observe(document.body,{childList:true,subtree:true});install();
})();