(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.HotBPracticeHistory=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 function records(history){return(Array.isArray(history)?history:[]).filter(item=>item&&item.completedAt)}
 function saveCompleted(history,record){
  const next=records(history).map(item=>({...item,attendees:[...(item.attendees||[])],drills:[...(item.drills||[])]}));
  const clean={...record,attendees:[...new Set(record?.attendees||[])],drills:[...new Set(record?.drills||[])]};
  const index=next.findIndex(item=>item.id===clean.id);
  if(index>=0)next[index]=clean;else next.push(clean);
  return next.sort((a,b)=>String(a.completedAt).localeCompare(String(b.completedAt)));
 }
 function drillUsage(history,drillName){
  const completed=records(history),used=completed.filter(item=>(item.drills||[]).includes(drillName)),last=used.sort((a,b)=>String(b.completedAt).localeCompare(String(a.completedAt)))[0];
  return{percentage:completed.length?Math.round(used.length/completed.length*100):null,lastDate:last?.practiceDate||null};
 }
 function attendance(history,playerName){
  const completed=records(history),attended=completed.filter(item=>(item.attendees||[]).includes(playerName)).length;
  return{percentage:completed.length?Math.round(attended/completed.length*100):null};
 }
 function dateLabel(value){
  const match=String(value||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);if(!match)return'—';
  const day=Number(match[3]),mod100=day%100,suffix=mod100>=11&&mod100<=13?'th':day%10===1?'st':day%10===2?'nd':day%10===3?'rd':'th';
  const month=new Date(Number(match[1]),Number(match[2])-1,day).toLocaleDateString('en-US',{month:'long'});
  return`${month} ${day}${suffix}`;
 }
 return{saveCompleted,drillUsage,attendance,dateLabel};
});
