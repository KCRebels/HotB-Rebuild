(()=>{
 const DBKEY='hotbRebuildDbV1';
 const VERSION_KEY='pitchingEvalWeekend20261018Version';
 const updates={
  'Brooklyn Gering':{pitcherIP:'6.1',pitcherERA:'9.947',pitcherWHIP:'2.211',pitcherKBB:'1.250',pitcherOBA:'.333',pitcherStrikePct:'61.54%'},
  'Megan Ryan':{pitcherIP:'4.0',pitcherERA:'1.750',pitcherWHIP:'1.250',pitcherKBB:'3.000',pitcherOBA:'.250',pitcherStrikePct:'64.86%'},
  'Lakyn Farley':{pitcherIP:'6.0',pitcherERA:'9.333',pitcherWHIP:'2.167',pitcherKBB:'3.000',pitcherOBA:'.400',pitcherStrikePct:'66.28%'},
  'Makenna Whitaker':{pitcherIP:'1.0',pitcherERA:'.000',pitcherWHIP:'.000',pitcherKBB:'—',pitcherOBA:'.000',pitcherStrikePct:'57.89%'},
  'Aniesa Rohleder':{pitcherIP:'8.0',pitcherERA:'7.000',pitcherWHIP:'2.875',pitcherKBB:'2.333',pitcherOBA:'.435',pitcherStrikePct:'66.23%'}
 };
 function apply(){
  try{
   const raw=localStorage.getItem(DBKEY);if(!raw)return false;
   const db=JSON.parse(raw);if(!db||typeof db!=='object'||!Array.isArray(db.roster))return false;
   if(Number(db[VERSION_KEY]||0)>=1)return true;
   let changed=false;
   db.roster.forEach(player=>{const next=updates[player?.name];if(!next)return;Object.assign(player,next);changed=true});
   if(!changed)return false;
   db[VERSION_KEY]=1;
   localStorage.setItem(DBKEY,JSON.stringify(db));
   return true;
  }catch(error){console.error('HotB weekend pitching tile update failed',error);return false}
 }
 if(!apply())addEventListener('load',()=>{if(apply())location.reload()},{once:true});
})();