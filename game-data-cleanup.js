(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.HotBGameDataCleanup=api;
})(typeof window!=='undefined'?window:globalThis,function(){
 function localDateKey(value){
  const date=new Date(value);
  if(Number.isNaN(date.getTime()))return'';
  return`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
 }
 function cleanup(db,cutoffDate){
  if(!db||!cutoffDate)throw new Error('A database and cutoff date are required.');
  const before=Array.isArray(db.savedGames)?db.savedGames:[];
  db.savedGames=before.filter(game=>localDateKey(game?.date)>=cutoffDate);
  const removeCurrent=!!db.currentGame&&localDateKey(db.currentGame.date)<cutoffDate;
  if(removeCurrent)db.currentGame=null;
  return{removedSaved:before.length-db.savedGames.length,removedCurrent:removeCurrent};
 }
 return{localDateKey,cleanup};
});

/* Reports game picker: keep the picker above HotB's bottom navigation and let its contents scroll. */
(function(){
 if(typeof document==='undefined')return;
 const id='hotb-reports-game-picker-mobile-fix';
 if(document.getElementById(id))return;
 const style=document.createElement('style');
 style.id=id;
 style.textContent=`
 .games-selection-modal{
   max-height:calc(100dvh - 118px)!important;
   overflow-y:auto!important;
   overscroll-behavior:contain!important;
   -webkit-overflow-scrolling:touch!important;
   padding-bottom:0!important;
 }
 .games-selection-modal .game-selection-footer{
   position:sticky!important;
   bottom:0!important;
   z-index:8!important;
   margin-left:-1px!important;
   margin-right:-1px!important;
   padding:12px 0 max(12px,env(safe-area-inset-bottom))!important;
   background:#fff!important;
   border-top:1px solid #d9deda!important;
 }
 @media(max-width:560px){
   .games-selection-modal{max-height:calc(100dvh - 108px)!important;}
 }
 `;
 document.head.appendChild(style);
})();
