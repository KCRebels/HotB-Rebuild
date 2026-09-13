const assert=require('node:assert/strict');
const sms=require('./sms-links.js');

function generatedBody(composeUrl){
 const match=String(composeUrl).match(/[?&]body=(.*)$/);
 return match?decodeURIComponent(match[1]):'';
}

const guestUrl='https://kcrebels.github.io/HotB-Rebuild/?portal=guest-id&guest=guest-secret';
const guestMessage=sms.guestPracticeMessage({firstName:'Brooklyn',url:guestUrl});
assert.deepEqual(guestMessage.split('\r\n'),[
 'Welcome to HotB, Brooklyn.','',guestUrl,'','This link expires when practice ends.'
]);

const iphoneBody=generatedBody(sms.composeSmsUrl({phone:'(913) 555-1212',message:guestMessage,userAgent:'iPhone'}));
const androidBody=generatedBody(sms.composeSmsUrl({phone:'913-555-1212',message:guestMessage,userAgent:'Android'}));
assert.equal(iphoneBody,guestMessage,'iPhone composer preserves the exact standalone URL line');
assert.equal(androidBody,guestMessage,'Android composer preserves the exact standalone URL line');
assert.match(sms.composeSmsUrl({phone:'9135551212',message:guestMessage,userAgent:'iPhone'}),/^sms:9135551212&body=/);
assert.match(sms.composeSmsUrl({phone:'9135551212',message:guestMessage,userAgent:'Android'}),/^sms:9135551212\?body=/);

const recruitingUrl='https://kcrebels.github.io/HotB-Rebuild/brooklyn-gering-recruiting-profile.html';
const recruitingMessage=sms.recruitingProfileMessage({name:'Brooklyn Gering',grad:'2029',positions:'RHP/OF',url:recruitingUrl});
assert.equal(recruitingMessage.split('\r\n')[2],recruitingUrl,'recruiting URL occupies its own line');
assert.deepEqual(recruitingMessage.split('\r\n'),[
 'Brooklyn Gering | 2029 | RHP/OF | KC Rebels','',recruitingUrl,'','Coach-verified scouting report and current results.'
]);
assert.equal(generatedBody(sms.composeSmsUrl({message:recruitingMessage,userAgent:'iPhone'})),recruitingMessage);

console.log('sms-links tests passed');
