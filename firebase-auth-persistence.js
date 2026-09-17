(()=>{
'use strict';
const config={apiKey:'AIzaSyBAMVx6umLKwVj9QVC-rWSFQFuR23-rlrA',authDomain:'hotb-kc-rebels.firebaseapp.com',projectId:'hotb-kc-rebels',storageBucket:'hotb-kc-rebels.firebasestorage.app',messagingSenderId:'412203516902',appId:'1:412203516902:web:397dccc597ac1149ee4c27'};
try{
 if(!window.firebase?.auth)return;
 if(!firebase.apps.length)firebase.initializeApp(config);
 const auth=firebase.auth();
 auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(error=>console.warn('HotB auth persistence could not be enabled',error));
}catch(error){console.warn('HotB auth persistence setup skipped',error)}
})();
