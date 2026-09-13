(()=>{
 function alignNewGameHeader(){
  const head=document.querySelector('.page-match-head');
  if(!head)return;
  const title=head.querySelector('h1');
  const home=head.querySelector('.page-head-nav[data-go="home"]');
  if(!title||!home||title.textContent.trim()!=='New Game')return;
  if(head.classList.contains('page-head-centered')&&head.firstElementChild===home)return;
  head.classList.add('page-head-centered');
  head.innerHTML='';
  head.append(home,title);
  const spacer=document.createElement('span');
  spacer.className='page-head-spacer';
  head.append(spacer);
 }
 const app=document.getElementById('app')||document.body;
 new MutationObserver(()=>requestAnimationFrame(alignNewGameHeader)).observe(app,{childList:true,subtree:true});
 alignNewGameHeader();
})();
