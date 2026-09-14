(()=>{
 // Titles keep their native app.js guide behavior.
 // The visible HotB and hitting VALUES replace the hidden ALL buttons.
 // Pitching cards already have their own native data-pitch-ranking click handler.
 document.addEventListener('click',event=>{
  const result=event.target.closest('.eval-app .eval-tile>.value,.eval-app .perf>b');
  if(!result)return;
  const tile=result.closest('.eval-tile');
  const perf=result.closest('.perf');
  const control=tile?.querySelector('.metric-all')||perf?.querySelector('.perf-all');
  if(!control)return;
  event.preventDefault();
  event.stopPropagation();
  // Use the app's existing bound ranking control. This keeps sorting,
  // selected-player highlighting, date filters and modal rendering native.
  control.click();
 });
})();
