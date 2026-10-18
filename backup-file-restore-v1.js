(()=>{
 const DBKEY='hotbRebuildDbV1';
 const CLOUD_PENDING_KEY='hotbCloudPendingV1';
 const RESTORE_NOTICE_KEY='hotbFileRestoreSuccessV1';
 const BUTTON_ID='cloudRestoreBackupFile';
 const INPUT_ID='hotbBackupFileInput';

 function validBackup(payload){
  return !!payload&&payload.format==='HotB Full Backup'&&Number(payload.version)===1&&payload.db&&typeof payload.db==='object'&&Array.isArray(payload.db.roster)&&Array.isArray(payload.db.savedGames);
 }
 function stripPortalState(source){
  const clean=structuredClone(source);
  delete clean.activePracticeSession;
  if(clean.coachPortal){delete clean.coachPortal.portalId;delete clean.coachPortal.portalPin;delete clean.coachPortal.portalPinHash}
  (clean.roster||[]).forEach(player=>{delete player.portalId;delete player.portalPin;delete player.portalPinHash;delete player.portalSecret});
  clean.route='home';
  return clean;
 }
 function ensureInput(){
  let input=document.getElementById(INPUT_ID);
  if(input)return input;
  input=document.createElement('input');
  input.id=INPUT_ID;input.type='file';input.accept='.json,application/json';input.hidden=true;
  input.addEventListener('change',handleFile);
  document.body.appendChild(input);
  return input;
 }
 async function handleFile(event){
  const input=event.currentTarget,file=input.files&&input.files[0];
  input.value='';
  if(!file)return;
  let payload;
  try{payload=JSON.parse(await file.text())}
  catch(_){alert('HotB could not read that file. Choose a HotB full backup JSON file.');return}
  if(!validBackup(payload)){alert('That is not a usable HotB Full Backup file. Nothing was changed.');return}
  const gameCount=payload.db.savedGames.length;
  if(!confirm(`Restore ${file.name}?\n\nThis will replace the HotB data on this device with the backup (${gameCount} saved game${gameCount===1?'':'s'}). Your current device data will be kept in a recovery copy on this phone.`))return;
  try{
   const current=localStorage.getItem(DBKEY);
   if(current)localStorage.setItem(`${DBKEY}_before_file_restore_${Date.now()}`,current);
   const restored=stripPortalState(payload.db);
   const serialized=JSON.stringify(restored);
   localStorage.setItem(DBKEY,serialized);
   const check=JSON.parse(localStorage.getItem(DBKEY)||'null');
   if(!check||!Array.isArray(check.roster)||!Array.isArray(check.savedGames))throw new Error('restore-verification-failed');
   // Do not immediately overwrite the cloud copy. The coach can verify the restored
   // games first, then use Back Up Now to make this restored device state the cloud copy.
   localStorage.setItem(CLOUD_PENDING_KEY,'false');
   sessionStorage.setItem(RESTORE_NOTICE_KEY,`Backup restored: ${gameCount} saved game${gameCount===1?'':'s'}.`);
   location.reload();
  }catch(error){
   console.error('HotB file restore failed',error);
   alert('HotB could not restore that backup. Your existing device data was not intentionally changed.');
  }
 }
 function installButton(){
  const download=document.getElementById('cloudDownloadBackup');
  if(!download||document.getElementById(BUTTON_ID))return;
  const button=document.createElement('button');
  button.className='btn block';button.id=BUTTON_ID;button.type='button';button.textContent='Restore From Backup File';
  button.addEventListener('click',()=>ensureInput().click());
  download.insertAdjacentElement('afterend',button);
 }
 const observer=new MutationObserver(installButton);
 observer.observe(document.documentElement,{childList:true,subtree:true});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{ensureInput();installButton()},{once:true});
 else{ensureInput();installButton()}
 const notice=sessionStorage.getItem(RESTORE_NOTICE_KEY);
 if(notice){sessionStorage.removeItem(RESTORE_NOTICE_KEY);setTimeout(()=>alert(notice+' Check Reports, then tap Back Up Now when you are satisfied.'),700)}
})();