(()=>{
'use strict';
const JENKINS_NAMES=new Set(['Neveah Schlappi','Lilliana Schlappi','Taylor Woods','Perri Wagner','Pacie Dougherty','Amelia Steffen','Emmie Wible','Leslie Cundiff']);
function applyJenkinsAttendanceStyle(){
 const attendance=document.querySelector('.practice-setup .practice-attendance');
 if(!attendance)return;
 const rows=[...attendance.querySelectorAll(':scope > .practice-attendance-row')];
 rows.forEach(row=>{
  const name=row.querySelector('.practice-player b')?.textContent?.trim()||'';
  const isJenkins=JENKINS_NAMES.has(name);
  row.classList.toggle('team-jenkins-attendance-row',isJenkins);
  row.querySelector('.practice-player')?.classList.toggle('team-jenkins-player',isJenkins);
 });
}
const observer=new MutationObserver(applyJenkinsAttendanceStyle);
observer.observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('load',applyJenkinsAttendanceStyle);
applyJenkinsAttendanceStyle();
})();
