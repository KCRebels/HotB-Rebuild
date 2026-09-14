(()=>{
 const definitions={
  'HOTB+':'HotB+ compares overall offensive production to the team baseline. Higher is better.',
  'RP':'Runs Produced measures how effectively a hitter creates or drives in runs through offensive outcomes.',
  'HP%':'Hitting Plan shows how consistently the hitter executes the assigned hitting plan.',
  'AVG':'Batting Average: hits divided by official at-bats.',
  'OBP':'On-Base Percentage: how often the hitter reaches base.',
  'SLG':'Slugging Percentage: total bases divided by at-bats; it reflects extra-base impact.',
  'CONTACT':'Contact Percentage: how often swings result in contact rather than a miss.',
  'K%':'Strikeout Percentage: the percentage of plate appearances ending in a strikeout. Lower is better.',
  'HHB%':'Hard-Hit Ball Percentage: the percentage of balls in play classified as hard hit.',
  'QAB':'Quality At-Bat Percentage: the percentage of plate appearances that meet the app’s quality-at-bat criteria.',
  'QAB%':'Quality At-Bat Percentage: the percentage of plate appearances that meet the app’s quality-at-bat criteria.',
  'IP':'Innings Pitched.',
  'ERA':'Earned Run Average: earned runs allowed per seven innings.',
  'WHIP':'Walks plus hits allowed per inning pitched. Lower is better.',
  'K/BB':'Strikeout-to-walk ratio. Higher is better.',
  'OBA':'Opponent Batting Average: opponents’ batting average against the pitcher. Lower is better.',
  'STRIKE %':'Strike Percentage: percentage of pitches recorded as strikes.',
  'STRIKE%':'Strike Percentage: percentage of pitches recorded as strikes.',
  'HOME TO FIRST':'Home-to-First time. Lower is faster.',
  'FASTBALL':'Best recorded fastball velocity.',
  'CHANGEUP':'Best recorded changeup velocity.',
  'POP TIME':'Best recorded catcher pop time. Lower is faster.',
  'EXIT VELOCITY':'Best recorded exit velocity.',
  'OVERHAND THROW':'Best recorded overhand throwing velocity.',
  'BROAD JUMP':'Best recorded broad-jump distance.'
 };
 const norm=v=>String(v||'').trim().replace(/\s+/g,' ').toUpperCase();
 function definitionFor(el){
  let key=norm(el.textContent);
  if(key==='HHB')key='HHB%';
  return definitions[key]||`${String(el.textContent||'').trim()} is one of the tracked Player Eval metrics.`;
 }
 function showDefinition(el){
  const title=String(el.textContent||'').trim();
  const backdrop=document.createElement('div');
  backdrop.className='modal-backdrop eval-definition-backdrop';
  backdrop.innerHTML=`<div class="modal eval-definition-modal"><div class="modal-header"><h2>${title}</h2><button class="btn" data-eval-def-close>Close</button></div><p>${definitionFor(el)}</p></div>`;
  document.body.append(backdrop);
  const close=()=>backdrop.remove();
  backdrop.querySelector('[data-eval-def-close]')?.addEventListener('click',close);
  backdrop.addEventListener('click',e=>{if(e.target===backdrop)close()});
 }
 function allButtonFor(result){
  const tile=result.closest('.eval-tile');
  if(tile)return tile.querySelector('.metric-all');
  const perf=result.closest('.perf');
  if(perf)return perf.querySelector('.perf-all');
  const pitch=result.closest('.pitcher-stat');
  if(pitch)return pitch.querySelector('.metric-all,.perf-all,[data-pitch-ranking],[data-ranking]');
  return null;
 }
 document.addEventListener('click',event=>{
  const title=event.target.closest('.eval-app .metric-title,.eval-app .perf-metric,.eval-app .pitcher-stat span,.eval-app .measure h3');
  if(title){event.preventDefault();event.stopPropagation();showDefinition(title);return}
  const result=event.target.closest('.eval-app .eval-tile>.value,.eval-app .perf>b,.eval-app .pitcher-stat>b');
  if(!result)return;
  const all=allButtonFor(result);
  if(all&&all!==result){event.preventDefault();event.stopPropagation();all.click()}
 },true);
})();
