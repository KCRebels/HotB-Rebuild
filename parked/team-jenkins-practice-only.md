# Team Jenkins practice-only work — parked 2026-09-20

This file preserves the Team Jenkins practice-only roster/module while Jenkins is disconnected from the active HotB app. Do not load this file into the coach app until the original KC Rebels practice system is verified stable.

Original team-jenkins.js follows:

```js
(()=>{
'use strict';

if(new URLSearchParams(location.search).has('portal'))return;
const DBKEY='hotbRebuildDbV1';
const TEAM='Team Jenkins';
const players=[
 {name:'Neveah Schlappi',phone:'816-708-5835',positions:'UT'},
 {name:'Lilliana Schlappi',phone:'816-656-6698',positions:'C'},
 {name:'Taylor Woods',phone:'816-509-9701',positions:'P'},
 {name:'Perri Wagner',phone:'913-961-8168',positions:'P'},
 {name:'Pacie Dougherty',phone:'785-760-3964',positions:'C'},
 {name:'Amelia Steffen',phone:'913-413-5995',positions:'UT'},
 {name:'Emmie Wible',phone:'913-905-9251',positions:'UT'},
 {name:'Leslie Cundiff',phone:'785-917-2893',positions:'UT'}
];
const names=new Set(players.map(p=>p.name));
function read(){try{return JSON.parse(localStorage.getItem(DBKEY)||'null')}catch(e){return null}}
function write(db){localStorage.setItem(DBKEY,JSON.stringify(db))}
function practiceOnlyPlayer(existing,profile){const next={...profile,side:existing?.side||'R',isGuest:true,isTeamJenkins:true,teamName:TEAM,isPracticeGuest:false};['portalId','portalSecret'].forEach(key=>{if(existing?.[key])next[key]=existing[key]});return next}
function seed(){const db=read();if(!db||!Array.isArray(db.roster))return;let changed=false;players.forEach(profile=>{const index=db.roster.findIndex(x=>x.name===profile.name),next=practiceOnlyPlayer(index>=0?db.roster[index]:null,profile);if(index<0){db.roster.push(next);changed=true}else if(JSON.stringify(next)!==JSON.stringify(db.roster[index])){db.roster[index]=next;changed=true}});if(changed)write(db)}
function groupAttendance(){const box=document.querySelector('.practice-setup .practice-attendance');if(!box||box.dataset.jenkinsGrouped)return;const rows=[...box.querySelectorAll(':scope > .practice-attendance-row')];if(!rows.length)return;const firstJ=rows.find(r=>names.has(r.querySelector('b')?.textContent?.trim()));if(!firstJ)return;const h=document.createElement('div');h.className='team-jenkins-heading';h.textContent=TEAM.toUpperCase();box.insertBefore(h,firstJ);rows.filter(r=>names.has(r.querySelector('b')?.textContent?.trim())).forEach(r=>r.classList.add('team-jenkins-player'));box.dataset.jenkinsGrouped='1'}
seed();
const style=document.createElement('style');style.textContent='.team-jenkins-heading{font-size:12px;font-weight:900;letter-spacing:.12em;color:#b5121b;padding:16px 4px 7px;border-top:2px solid #111;border-bottom:2px solid #111;margin-top:12px;margin-bottom:4px}.practice-attendance-row.team-jenkins-player{background:#f1f3f5!important;border-color:#c6cdd3!important}';document.head.appendChild(style);
const observer=new MutationObserver(groupAttendance);observer.observe(document.documentElement,{childList:true,subtree:true});window.addEventListener('load',groupAttendance);
})();
```
