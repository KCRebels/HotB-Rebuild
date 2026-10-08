/* A fresh PWA launch opens on Home; normal in-app navigation remains untouched. */
(()=>{
 if(new URLSearchParams(location.search).has('portal'))return;
 const nav=performance.getEntriesByType?.('navigation')?.[0];
 const fresh=nav?nav.type==='navigate':true;
 if(!fresh)return;
 try{sessionStorage.removeItem('hotbRoute');sessionStorage.removeItem('hotbLastRoute');sessionStorage.removeItem('route')}catch(_){}
 addEventListener('load',()=>{setTimeout(()=>{const home=document.querySelector('[data-go="home"]');if(home&&!document.querySelector('.modal-backdrop'))home.click()},0)},{once:true});
})();
