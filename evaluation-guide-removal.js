(()=>{
 const isHittingTitle=target=>target instanceof Element&&!!target.closest('.eval-app .perf-metric');
 const stopGuide=event=>{
  if(!isHittingTitle(event.target))return;
  event.preventDefault();
  event.stopImmediatePropagation();
 };
 // Intercept before the legacy guide handler can open its modal.
 window.addEventListener('pointerup',stopGuide,true);
 window.addEventListener('click',stopGuide,true);
 // Remove any legacy guide that was already open when this asset loaded.
 const removeLegacyGuide=()=>{
  document.querySelectorAll('.modal-backdrop').forEach(backdrop=>{
   const text=String(backdrop.textContent||'').toUpperCase();
   if(text.includes('PLAYER EVALUATION GUIDE'))backdrop.remove();
  });
 };
 removeLegacyGuide();
})();