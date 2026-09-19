(()=>{
'use strict';
const DBKEY='hotbRebuildDbV1';
const COACH_EMAIL='hotbkcrebels@gmail.com';
const PLAYER='Brooklyn Gering';
const PROFILE_ID='brooklyn-gering';
const firebaseConfig={apiKey:'AIzaSyBAMVx6umLKwVj9QVC-rWSFQFuR23-rlrA',authDomain:'hotb-kc-rebels.firebaseapp.com',projectId:'hotb-kc-rebels',storageBucket:'hotb-kc-rebels.firebasestorage.app',messagingSenderId:'412203516902',appId:'1:412203516902:web:397dccc597ac1149ee4c27'};
let lastSignature='',busy=false,coachUser=null,store=null;
function readDb(){try{return JSON.parse(localStorage.getItem(DBKEY)||'{}')}catch{return {}}}
function currentSeasonGame(game){const d=new Date(game?.date);if(Number.isNaN(d.getTime()))return false;const y=d.getFullYear(),m=d.getMonth()+1,day=d.getDate(),sy=m>=9?y:y-1;return sy===2026&&!((m===7&&day>=31)||m===8)}
function formatAvg(n){return Number(n||0).toFixed(3).replace(/^0/,'')}
function hitting(db){const games=[...(db.savedGames||[]),...(db.currentGame?[db.currentGame]:[])].filter(currentSeasonGame);const pas=games.flatMap(g=>g.plateAppearances||g.pas||[]).filter(pa=>pa.hitter===PLAYER);const stats=window.HotBEvaluationStats?.statsForPAs?.(pas);if(!stats)return null;return{PA:String(stats.PA),AVG:formatAvg(stats.AVG),OBP:formatAvg(stats.OBP),CONTACT:stats.AB?`${Math.round(stats.contactPct*100)}%`:'—'}}
function pitching(db){const p=(db.roster||[]).find(x=>x.name===PLAYER);if(!p)return null;return{IP:String(p.pitcherIP??'—'),ERA:String(p.pitcherERA??'—'),WHIP:String(p.pitcherWHIP??'—'),'K/BB':String(p.pitcherKBB??'—'),OBA:String(p.pitcherOBA??'—'),'STRIKE %':String(p.pitcherStrikePct??'—')}}
function payload(){const db=readDb(),hit=hitting(db),pitch=pitching(db);if(!hit||!pitch)return null;return{hitting:hit,pitching:pitch}}
async function sync(){if(busy||!coachUser||!store)return;const data=payload();if(!data)return;const signature=JSON.stringify(data);if(signature===lastSignature)return;busy=true;try{await store.collection('recruitingProfiles').doc(PROFILE_ID).set({...data,performanceSource:'HotB Eval',performanceSeason:'2026–27 full season',updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});lastSignature=signature}catch(e){console.warn('Recruiting profile sync deferred',e)}finally{busy=false}}
function start(){if(!window.firebase||!window.HotBEvaluationStats)return;try{if(!firebase.apps.length)firebase.initializeApp(firebaseConfig);store=firebase.firestore();firebase.auth().onAuthStateChanged(user=>{coachUser=user&&!user.isAnonymous&&String(user.email||'').toLowerCase()===COACH_EMAIL?user:null;if(coachUser)sync()});setInterval(sync,3000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync()});window.addEventListener('online',sync)}catch(e){console.warn('Recruiting profile sync unavailable',e)}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();