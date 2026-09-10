(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.HotBPracticeEquipment=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 const clean=value=>String(value||'').trim();
 const key=value=>clean(value).toLowerCase().replace(/[^a-z0-9]/g,'');
 function equipmentItems(drill,{protectiveScreen=false}={}){
  const items=[];
  const add=item=>{
   item=clean(item);
   if(!item||/^(none|n\/a)$/i.test(item)||items.some(saved=>key(saved)===key(item)))return;
   items.push(item);
  };
  clean(drill?.equipment).split(/\s*(?:,|&|\band\b)\s*/i).forEach(add);
  const dry=/dry\s*\/\s*no ball/i.test(clean(drill?.hittingMethod));
  if(!dry&&!items.some(item=>/\bballs?\b/i.test(item)))add('Balls');
  if(protectiveScreen){
   const screenIndex=items.findIndex(item=>/^(?:l-?screen|protective screen)$/i.test(item));
   if(screenIndex>=0)items[screenIndex]='Protective Screen';else add('Protective Screen');
  }
  return items;
 }
 function station(label,drill,options={}){
  return{label,drill:drill||null,equipment:equipmentItems(drill,options),hittingMethod:clean(drill?.hittingMethod)||'Not specified',spaceSetup:clean(drill?.spaceSetup)||'Not specified'};
 }
 return{equipmentItems,station};
});
