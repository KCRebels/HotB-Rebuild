/* Loads the unchanged HotB observation module plus the permanent assistant-coach Focus indicator. */
document.write('<script src="coach-observations-core-v1.js?v=20261009-focus-coach-2"><\/script><script src="assistant-coach-focus-v2.js?v=20261009-focus-coach-2"><\/script>');

/* Keep the bottom of the coach Observation editor comfortably above HotB's fixed navigation. */
(()=>{
 const style=document.createElement('style');
 style.id='hotb-observation-bottom-clearance-582';
 style.textContent=`
  @media(max-width:560px){
   .observation-modal{padding-bottom:110px!important;scroll-padding-bottom:130px!important}
   .observation-save{margin-bottom:54px!important}
  }
 `;
 document.head.appendChild(style);
})();
