(()=>{
 const DBKEY='hotbRebuildDbV1';
 const CLOUD_PENDING_KEY='hotbCloudPendingV1';
 const RESTORE_NOTICE_KEY='hotbFileRestoreSuccessV1';
 const RECOVERY_PREFIX=`${DBKEY}_before_file_restore_`;
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
 function clearOldRecoveryCopies(){
  const keys=[];
  for(let i=0;i<localStorage.length;i++){
   const key=localStorage.key(i);
   if(key&&key.startsWith(RECOVERY_PREFIX))keys.push(key);
  }
  keys.forEach(key=>{try{localStorage.removeItem(key)}catch(_){}});
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
  if(!confirm(`Restore ${file.name}?\n\nThis will replace the HotB data on this device with the backup (${gameCount} saved game${gameCount===1?'':'s'}). HotB will first try to keep one recovery copy of the current device data.`))return;

  const current=localStorage.getItem(DBKEY);
  let recoveryKey=null;
  let restoreStarted=false;
  try{
   // Failed restore attempts used to accumulate full-size recovery snapshots and
   // eventually exhaust iPhone/Safari localStorage. Keep at most one recovery copy.
   clearOldRecoveryCopies();
   if(current){
    recoveryKey=`${RECOVERY_PREFIX}${Date.now()}`;
    try{localStorage.setItem(recoveryKey,current)}
    catch(recoveryError){
     console.warn('HotB could not store a local pre-restore recovery copy.',recoveryError);
     recoveryKey=null;
     const proceed=confirm('HotB can read this backup, but this iPhone does not have enough browser storage for an extra local recovery copy.\n\nThe backup file you selected will remain available outside HotB. Restore it anyway?');
     if(!proceed)return;
    }
   }

   const restored=stripPortalState(payload.db);
   const serialized=JSON.stringify(restored);
   restoreStarted=true;
   localStorage.setItem(DBKEY,serialized);
   const check=JSON.parse(localStorage.getItem(DBKEY)||'null');
   if(!check||!Array.isArray(check.roster)||!Array.isArray(check.savedGames))throw new Error('restore-verification-failed');

   // Do not immediately overwrite the cloud copy. The coach can verify the restored
   // games first, then use Back Up Now to make this restored device state the cloud copy.
   try{localStorage.setItem(CLOUD_PENDING_KEY,'false')}catch(error){console.warn('HotB restored the backup but could not update the cloud-pending marker.',error)}
   sessionStorage.setItem(RESTORE_NOTICE_KEY,`Backup restored: ${gameCount} saved game${gameCount===1?'':'s'}.`);
   location.reload();
  }catch(error){
   console.error('HotB file restore failed',error);
   let rolledBack=!restoreStarted;
   if(current&&restoreStarted){
    try{
     localStorage.setItem(DBKEY,current);
     rolledBack=localStorage.getItem(DBKEY)===current;
    }catch(rollbackError){console.error('HotB file restore rollback failed',rollbackError)}
   }
   if(rolledBack&&recoveryKey){try{localStorage.removeItem(recoveryKey)}catch(_){}}
   alert(rolledBack?'HotB could not restore that backup. Your existing device data was kept unchanged.':'HotB could not complete the restore or verify a rollback. Do not make additional changes in HotB until you reload the app and verify your data.');
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