(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.HotBSms=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';

 function cleanLine(value){return String(value??'').replace(/[\r\n]+/g,' ').trim()}
 function cleanWebUrl(value){
  const raw=String(value??'').trim();
  if(!raw)return'';
  try{
   const parsed=new URL(raw);
   return /^https?:$/.test(parsed.protocol)?parsed.href:'';
  }catch{return''}
 }
 function buildStandaloneLinkMessage({before=[],url,after=[]}={}){
  const link=cleanWebUrl(url);
  if(!link)return'';
  const leading=(Array.isArray(before)?before:[before]).map(cleanLine).filter(Boolean);
  const trailing=(Array.isArray(after)?after:[after]).map(cleanLine).filter(Boolean);
  return [...leading,'',link,'',...trailing].join('\r\n');
 }
 function composeSmsUrl({phone='',message='',userAgent=''}={}){
  const recipient=String(phone??'').replace(/[^\d+]/g,'');
  const body=String(message??'').replace(/\r?\n/g,'\r\n');
  if(!body)return'';
  const separator=/iPad|iPhone|iPod/.test(String(userAgent||''))?'&':'?';
  return `sms:${recipient}${separator}body=${encodeURIComponent(body)}`;
 }
 function guestPracticeMessage({firstName,url}={}){
  // Guest links contain their access secret in the URL, so send only the URL.
  // This guarantees the recipient can tap it directly or copy/paste it without
  // any welcome text, PIN text, or instructions becoming part of the address.
  return cleanWebUrl(url);
 }
 function recruitingProfileMessage({name,grad,positions,url}={}){
  return buildStandaloneLinkMessage({
   before:`${cleanLine(name)||'Player'} | ${cleanLine(grad)||'Grad Year'} | ${cleanLine(positions)||'Softball'} | KC Rebels`,
   url,
   after:'Coach-verified scouting report and current results.'
  });
 }

 return{buildStandaloneLinkMessage,composeSmsUrl,cleanWebUrl,guestPracticeMessage,recruitingProfileMessage};
});
