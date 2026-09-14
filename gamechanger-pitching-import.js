(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 root.HotBGameChangerPitching=api;
})(typeof window!=='undefined'?window:globalThis,function(){
 const fields=['pitcherIP','pitcherERA','pitcherWHIP','pitcherKBB','pitcherOBA','pitcherStrikePct'];
 const aliases={
  name:['player','playername','name','pitcher'],jersey:['jersey','jerseynumber','number','no'],
  pitcherIP:['ip','inningspitched'],pitcherERA:['era'],pitcherWHIP:['whip'],
  pitcherKBB:['kbb','sobbratio','strikeoutwalkratio','strikeouttowalkratio'],
  pitcherOBA:['oba','baa','opponentbattingaverage','oppbattingaverage','opponentaverage','oppaverage'],
  pitcherStrikePct:['strikepct','strikepercentage','strikepercent','spct','strpct'],
  strikeouts:['k','so','strikeouts'],walks:['bb','walks'],pitchStrike:['ps','pitchesstrikes'],
  pitches:['p','pitches','totalpitches'],strikes:['s','strikes']
 };
 const text=value=>String(value??'').trim();
 function headerKey(value){return text(value).toLowerCase().replace(/%/g,'pct').replace(/[^a-z0-9]/g,'')}
 function nameKey(value){return text(value).toLowerCase().replace(/^#?\d+\s*[-–—:]?\s*/,'').replace(/[^a-z0-9]/g,'')}
 function possibleNameKeys(value){
  const cleaned=text(value).replace(/^#?\d+\s*[-–—:]?\s*/,'');
  const keys=[nameKey(cleaned)];
  if(cleaned.includes(',')){const parts=cleaned.split(',').map(text).filter(Boolean);if(parts.length===2)keys.push(nameKey(`${parts[1]} ${parts[0]}`))}
  return [...new Set(keys.filter(Boolean))];
 }
 function columnMap(row){
  const keys=row.map(headerKey),map={};
  Object.entries(aliases).forEach(([field,names])=>{const index=keys.findIndex(key=>names.includes(key));if(index>=0)map[field]=index});
  return map;
 }
 function headerScore(map){
  let score=['name','pitcherIP','pitcherERA','pitcherWHIP','pitcherOBA'].filter(key=>map[key]!==undefined).length*3;
  if(map.pitcherKBB!==undefined||(map.strikeouts!==undefined&&map.walks!==undefined))score+=3;
  if(map.pitcherStrikePct!==undefined||map.pitchStrike!==undefined||(map.pitches!==undefined&&map.strikes!==undefined))score+=3;
  return score;
 }
 function number(value){const parsed=Number(text(value).replace(/,/g,'').replace('%',''));return Number.isFinite(parsed)?parsed:null}
 function compactNumber(value,maxDigits=3){
  const parsed=number(value);if(parsed===null)return text(value);
  return parsed.toFixed(maxDigits).replace(/\.0+$|(?<=\.[0-9]*?)0+$/g,'').replace(/^0\./,'.').replace(/^-0\./,'-.');
 }
 function percent(value){
  const raw=text(value);if(!raw)return'';
  let parsed=number(raw);if(parsed===null)return'';
  if(!raw.includes('%')&&Math.abs(parsed)<=1)parsed*=100;
  return `${parsed.toFixed(2).replace(/\.00$/,'').replace(/(\.\d)0$/,'$1')}%`;
 }
 function ratio(strikeouts,walks){
  const so=number(strikeouts),bb=number(walks);if(so===null||bb===null)return'';
  if(bb===0)return'—';
  return compactNumber(so/bb,2);
 }
 function pitchStrikePercent(value){
  const match=text(value).match(/([\d,.]+)\s*[-/]\s*([\d,.]+)/);if(!match)return'';
  const pitches=number(match[1]),strikes=number(match[2]);return pitches>0&&strikes!==null?percent(strikes/pitches):'';
 }
 function valuesFor(row,map){
  const value=key=>map[key]===undefined?'':text(row[map[key]]);
  const kbb=value('pitcherKBB')||ratio(value('strikeouts'),value('walks'));
  let strikePct=percent(value('pitcherStrikePct'))||pitchStrikePercent(value('pitchStrike'));
  if(!strikePct){const pitches=number(value('pitches')),strikes=number(value('strikes'));if(pitches>0&&strikes!==null)strikePct=percent(strikes/pitches)}
  return {
   pitcherIP:value('pitcherIP'),pitcherERA:value('pitcherERA'),
   pitcherWHIP:value('pitcherWHIP'),pitcherKBB:kbb,
   pitcherOBA:value('pitcherOBA'),pitcherStrikePct:strikePct
  };
 }
 function parseSheets(sheets,roster){
  const candidates=[];
  (sheets||[]).forEach(sheet=>(sheet.rows||[]).forEach((row,index)=>{const map=columnMap(row||[]),score=headerScore(map);if(map.name!==undefined&&score>=9)candidates.push({sheet,index,map,score})}));
  candidates.sort((a,b)=>b.score-a.score);
  const candidate=candidates[0];
  if(!candidate)throw new Error('HotB could not find a GameChanger pitching table with Player, IP, ERA, and WHIP columns. No statistics were changed.');
  const missingHeaders=[];
  if(candidate.map.pitcherOBA===undefined)missingHeaders.push('OBA/BAA');
  if(candidate.map.pitcherKBB===undefined&&(candidate.map.strikeouts===undefined||candidate.map.walks===undefined))missingHeaders.push('K/BB (or K and BB)');
  if(candidate.map.pitcherStrikePct===undefined&&candidate.map.pitchStrike===undefined&&(candidate.map.pitches===undefined||candidate.map.strikes===undefined))missingHeaders.push('Strike % (or pitches and strikes)');
  const rosterEntries=(roster||[]).map((player,index)=>({player,index,key:nameKey(player.name)}));
  const ready=[],problems=[],seen=new Set();
  if(missingHeaders.length)problems.push({message:`The pitching table is missing ${missingHeaders.join(', ')}. No pitcher from this file can be updated.`});
  candidate.sheet.rows.slice(candidate.index+1).forEach(row=>{
   const sourceName=text(row[candidate.map.name]);
   if(!sourceName||/^(team|totals?|team totals?)$/i.test(sourceName))return;
   const matches=rosterEntries.filter(entry=>possibleNameKeys(sourceName).includes(entry.key));
   if(matches.length!==1){problems.push({sourceName,message:matches.length?'More than one HotB player matches this row.':'No HotB pitcher confidently matches this GameChanger row.'});return}
   const match=matches[0];
   if(seen.has(match.index)){problems.push({sourceName,message:`${match.player.name} appears more than once in the pitching table.`});return}
   seen.add(match.index);
   const values=valuesFor(row,candidate.map),missing=fields.filter(field=>values[field]==='');
   if(missingHeaders.length||missing.length){problems.push({sourceName,playerName:match.player.name,message:missingHeaders.length?'Required pitching columns are missing.':`Missing ${missing.map(field=>({pitcherIP:'IP',pitcherERA:'ERA',pitcherWHIP:'WHIP',pitcherKBB:'K/BB',pitcherOBA:'OBA',pitcherStrikePct:'Strike %'}[field])).join(', ')}.`});return}
   ready.push({sourceName,playerName:match.player.name,playerIndex:match.index,values});
  });
  rosterEntries.filter(entry=>!seen.has(entry.index)).forEach(entry=>problems.push({playerName:entry.player.name,message:'This HotB pitcher was not found in the GameChanger pitching table. Existing statistics will stay unchanged.'}));
  if(!ready.length&&!problems.length)throw new Error('No pitcher rows were found in the GameChanger pitching table. No statistics were changed.');
  return {sheetName:candidate.sheet.name||'',ready,problems};
 }
 return {fields,parseSheets,headerKey,nameKey,percent};
});
