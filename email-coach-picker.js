(()=>{
 const DB_KEY='hotbRebuildDbV1';
 const esc=value=>String(value??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
 function coaches(){
  try{
   const db=JSON.parse(localStorage.getItem(DB_KEY)||'{}');
   return [...(db.coaches||[])].sort((a,b)=>(a.coachName||'').localeCompare(b.coachName||'',undefined,{sensitivity:'base'})||(a.collegeName||'').localeCompare(b.collegeName||''));
  }catch{return[]}
 }
 function addPicker(){
  if(document.querySelector('#rwSavedCoachPicker'))return;
  const coachInput=document.querySelector('#rwCoachName');
  const collegeInput=document.querySelector('#rwCollegeName');
  const grid=document.querySelector('.rw-search-grid');
  if(!coachInput||!collegeInput||!grid)return;
  const list=coaches();
  const label=document.createElement('label');
  label.className='rw-label';
  label.id='rwSavedCoachPicker';
  label.innerHTML=`Saved Coach<select id="rwSavedCoachSelect"><option value="">Choose a saved coach</option>${list.map((coach,index)=>`<option value="${index}">${esc(coach.coachName||'Coach')} — ${esc(coach.collegeName||'')}</option>`).join('')}</select>`;
  grid.parentNode.insertBefore(label,grid);
  const select=label.querySelector('#rwSavedCoachSelect');
  select.addEventListener('change',()=>{
   if(select.value==='')return;
   const coach=list[Number(select.value)];if(!coach)return;
   coachInput.value=coach.coachName||'';
   collegeInput.value=coach.collegeName||'';
   coachInput.dispatchEvent(new Event('input',{bubbles:true}));
   setTimeout(()=>{
    const buttons=[...document.querySelectorAll('#rwCoachNameMatches .rw-search-result')];
    const email=String(coach.coachEmail||'').trim().toLowerCase();
    const exact=buttons.find(button=>email&&button.textContent.toLowerCase().includes(email))||buttons.find(button=>button.querySelector('b')?.textContent.trim()===String(coach.coachName||'').trim())||buttons[0];
    if(exact)exact.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,cancelable:true,pointerType:'touch'}));
   },0);
  });
 }
 document.addEventListener('click',event=>{
  if(event.target.closest('#rwRecruitingSection .rw-email'))setTimeout(addPicker,0);
 },true);
})();
