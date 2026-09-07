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
