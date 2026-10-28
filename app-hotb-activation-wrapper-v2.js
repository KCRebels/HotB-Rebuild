(()=>{
 const originalFetch=window.fetch.bind(window);
 const patchSource=source=>{
  const anchor=source.indexOf("const conflicting=activationDocs.filter");
  const start=source.indexOf("if(conflicting.length){",anchor);
  const endMarker="\n  // A matching practice ID already in Firebase";
  const end=source.indexOf(endMarker,start);
  if(anchor<0||start<0||end<0)throw new Error('stale-conflict-patch-anchor');
  const replacement=`if(conflicting.length){
 const unsafe=conflicting.filter(({snapshot})=>{
  const active=snapshot.data()?.activePractice,clock=active?.clock||{},status=String(clock.status||'');
  return !active||status==='running'||(!!clock.startedAt&&!clock.endedAt&&status!=='finished');
 });
 if(unsafe.length)throw new Error('portal-activation-live-practice-conflict');
 const staleBatch=cloudStore.batch();
 for(const {target,snapshot} of conflicting){
  const remote=snapshot.exists?snapshot.data():null;
  if(!remote?.activePractice?.id)continue;
  const data=target.type==='jenkinsPlayer'
   ?jenkinsPortalCleanupPayload(db.roster.find(item=>item.portalId===target.id),{name:target.name,portalId:target.id,isTeamJenkins:true})
   :['guestPlayer','guestCoach'].includes(target.type)
    ?{activePractice:null,expired:true,accessStatus:'ended',endedAt:firebase.firestore.FieldValue.serverTimestamp(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()}
    :{activePractice:null,updatedAt:firebase.firestore.FieldValue.serverTimestamp()};
  staleBatch.update(portalDoc(target.id),data);
 }
 await staleBatch.commit();
 const staleVerify=await Promise.all(conflicting.map(async ({target})=>{
  const snap=await portalDoc(target.id).get();
  return !snap.exists||!snap.data()?.activePractice?.id;
 }));
 if(staleVerify.some(ok=>!ok))throw new Error('portal-activation-stale-cleanup-failed');
}`;
  return source.slice(0,start)+replacement+source.slice(end);
 };
 window.fetch=async(input,init)=>{
  const url=typeof input==='string'?input:input?.url||'';
  const response=await originalFetch(input,init);
  if(!url.includes('app-coach-rebels-portals-v10.js'))return response;
  const source=await response.text();
  const patched=patchSource(source);
  return new Response(patched,{status:response.status,statusText:response.statusText,headers:response.headers});
 };
 const script=document.createElement('script');
 script.src='app-hotb-activation-wrapper-v1.js?v=20261028-stale-conflict-685&fresh='+Date.now();
 script.async=false;
 script.onload=()=>{window.fetch=originalFetch;window.__HOTB_STALE_CONFLICT_PATCH__='685'};
 script.onerror=()=>{window.fetch=originalFetch;throw new Error('stale-conflict-wrapper-load')};
 document.body.appendChild(script);
})();