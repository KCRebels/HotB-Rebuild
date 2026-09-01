
(() => {
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;' }[m]));
const round3 = n => Number.isFinite(n) ? n.toFixed(3).replace(/^0/,'') : '.000';
const pct1 = n => `${(n*100).toFixed(1)}%`;
const pct0 = n => `${Math.round(n*100)}%`;
const requestedPlanPreferences={
 'Lakyn Farley':'IN','Maleah Pena':'IN','Hailey Marsh':'NO','Maia Waddell':'NO',
 'Aniesa Rohleder':'OUT','Makenna Whitaker':'OUT','Brynna Peter':'OUT',
 'Tayte Stepps':'OUT','Claire Jack':'OUT','Mattingly Hardy':'OUT','Lydia Copeland':'OUT'
};
const heatColors={B:'#3d8c52',F:'#f0c94d',HIT:'#3862db',K:'#cd3a32',H4O:'#cd3a32',FPS:'#cd3a32',REPORT:'#101011'};
const chartZoneIds=['T1','T2','L1','L2','C1','C2','C3','C4','R1','R2','B1','B2'];
const legacyChartZone={T:'T1',L:'L1',R:'R1',B:'B1'};
const displayedChartZone=zone=>legacyChartZone[zone]||zone;

const defaultRoster = [
 {name:'Aniesa Rohleder',side:'R',jersey:'9',grad:'2029',positions:'RHP | 1B',gpa:'3.98',interest:'Sports Medicine',school:'Olathe South HS',photo:'Aniesa.jpg'},
 {name:'Brooklyn Gering',side:'R',jersey:'16',grad:'2029',positions:'RHP | OF',gpa:'4.0',interest:'Nursing',school:'Spring Hill HS',photo:'Brooklyn.JPEG'},
 {name:'Brynna Peter',side:'R',jersey:'11',grad:'2028',positions:'SS | UT',gpa:'3.78',interest:'Occupational Therapy',school:'Chanute HS',photo:'Brynna.jpg'},
 {name:'Claire Jack',side:'R',jersey:'25',grad:'2029',positions:'CIF | OF',gpa:'4.0',interest:'Biology',school:'Pratt HS',photo:'Claire-headshot-small.png'},
 {name:'Hailey Marsh',side:'SL',jersey:'23',grad:'2029',positions:'CF | OF',gpa:'4.0',interest:'Dentist',school:'Louisburg HS',photo:'Hailey.jpg'},
 {name:'Lakyn Farley',side:'R',jersey:'8',grad:'2028',positions:'RHP | OF',gpa:'4.0',interest:'Sports Medicine',school:'Fort Scott HS',photo:'lakyn.jpg'},
 {name:'Lydia Copeland',side:'R',jersey:'27',grad:'2028',positions:'C | CIF',gpa:'4.0',interest:'Child Psychology',school:'Louisburg HS',photo:'Lydia.JPEG'},
 {name:'Maia Waddell',side:'SL',jersey:'1',grad:'2028',positions:'2B | OF',gpa:'4.1',interest:'Criminal Justice / Film',school:'Olathe NW HS',photo:'Maia.jpg'},
 {name:'Makenna Whitaker',side:'R',jersey:'10',grad:'2029',positions:'RHP | UT',gpa:'4.3',interest:'Undecided',school:'Olathe NW HS',photo:'makenna.jpg'},
 {name:'Maleah Pena',side:'R',jersey:'20',grad:'2028',positions:'3B | 1B',gpa:'3.52',interest:'Sports Medicine',school:'Olathe NW HS',photo:'Maleah.jpg'},
 {name:'Mattingly Hardy',side:'R',jersey:'99',grad:'2029',positions:'OF | UT',gpa:'3.81',interest:'Biology',school:'Pembroke Hill HS',photo:'matti.jpg'},
 {name:'Megan Ryan',side:'R',jersey:'22',grad:'2028',positions:'RHP | UT',gpa:'4.0',interest:'Engineering',school:'Rock Creek HS',photo:'meg.jpg'},
 {name:'Tayte Stepps',side:'R',jersey:'00',grad:'2029',positions:'C | OF',gpa:'3.9',interest:'Nursing',school:'Fort Scott HS',photo:'Tayte.JPEG'}
];

const defaultCoaches = [
 {
  "coachName": "Steve Babinski",
  "coachEmail": "sjbabinski@mnu.edu",
  "collegeName": "MidAmerica Nazarene University"
 },
 {
  "coachName": "Olivia Pino",
  "coachEmail": "olpino@mnu.edu",
  "collegeName": "MidAmerica Nazarene University"
 },
 {
  "coachName": "Brandon Russell",
  "coachEmail": "barussell3@mnu.edu",
  "collegeName": "MidAmerica Nazarene University"
 },
 {
  "coachName": "Tony Austin",
  "coachEmail": "tony.austin@bakeru.edu",
  "collegeName": "Baker University"
 },
 {
  "coachName": "Riley Phillips",
  "coachEmail": "riley.phillips@bakeru.edu",
  "collegeName": "Baker University"
 },
 {
  "coachName": "Adrianna \"AD\" Solary",
  "coachEmail": "adrianna.solary@bakeru.edu",
  "collegeName": "Baker University"
 },
 {
  "coachName": "Maile Deutsch",
  "coachEmail": "maile.deutsch@ottawa.edu",
  "collegeName": "Ottawa University"
 },
 {
  "coachName": "Katie Enneking",
  "coachEmail": "kathryn.enneking@ottawa.edu",
  "collegeName": "Ottawa University"
 },
 {
  "coachName": "Paul Hunt",
  "coachEmail": "phunt@benedictine.edu",
  "collegeName": "Benedictine College"
 },
 {
  "coachName": "Jenna Schwartzhoff",
  "coachEmail": "jschwartzhoff@benedictine.edu",
  "collegeName": "Benedictine College"
 },
 {
  "coachName": "Jay Monhollon",
  "coachEmail": "Jay.Monhollon@stmary.edu",
  "collegeName": "University of Saint Mary"
 },
 {
  "coachName": "Jolona Shield-Dzakic",
  "coachEmail": "jdzakic@haskell.edu",
  "collegeName": "Haskell Indian Nations University"
 },
 {
  "coachName": "Charlie Kennedy",
  "coachEmail": "coach_kennedy@yahoo.com",
  "collegeName": "Avila University"
 },
 {
  "coachName": "Lindsey Derry",
  "coachEmail": "lderry@park.edu",
  "collegeName": "Park University"
 },
 {
  "coachName": "Alyssa Ramirez",
  "coachEmail": "alyssa.ramirez@park.edu",
  "collegeName": "Park University"
 },
 {
  "coachName": "Clarissa Hagler",
  "coachEmail": "haglerc@moval.edu",
  "collegeName": "Missouri Valley College"
 },
 {
  "coachName": "Pat Reardon",
  "coachEmail": "preardon@centralmethodist.edu",
  "collegeName": "Central Methodist University"
 },
 {
  "coachName": "Gene Reardon",
  "coachEmail": "freardon@centralmethodist.edu",
  "collegeName": "Central Methodist University"
 },
 {
  "coachName": "Wendy Spratt",
  "coachEmail": "wsspratt@ccis.edu",
  "collegeName": "Columbia College"
 },
 {
  "coachName": "Jordan Logan",
  "coachEmail": "jclogan1@ccis.edu",
  "collegeName": "Columbia College"
 },
 {
  "coachName": "Clint Poulsen",
  "coachEmail": "cpoulsen@stephens.edu",
  "collegeName": "Stephens College"
 },
 {
  "coachName": "Rebekah Klinginsmith",
  "coachEmail": "rklinginsmith@cottey.edu",
  "collegeName": "Cottey College"
 },
 {
  "coachName": "Gracie Lopez",
  "coachEmail": "ggl4@graceland.edu",
  "collegeName": "Graceland University"
 },
 {
  "coachName": "Layne Nowlin",
  "coachEmail": "lnowlin@graceland.edu",
  "collegeName": "Graceland University"
 },
 {
  "coachName": "Suzanne Unruh",
  "coachEmail": "suzanne_unruh@friends.edu",
  "collegeName": "Friends University"
 },
 {
  "coachName": "Brady Walker",
  "coachEmail": "duckdog@sutv.com",
  "collegeName": "Friends University"
 },
 {
  "coachName": "Jay Halbrook",
  "coachEmail": "halbrookja@evangel.edu",
  "collegeName": "Evangel University"
 },
 {
  "coachName": "Sony Mitchell",
  "coachEmail": "mitchells@evangel.edu",
  "collegeName": "Evangel University"
 },
 {
  "coachName": "Rob Brice",
  "coachEmail": "bricer@evangel.edu",
  "collegeName": "Evangel University"
 },
 {
  "coachName": "Justin Hale",
  "coachEmail": "halej@evangel.edu",
  "collegeName": "Evangel University"
 },
 {
  "coachName": "Cayleigh Berry",
  "coachEmail": "berryc@evangel.edu",
  "collegeName": "Evangel University"
 },
 {
  "coachName": "Jennifer McFalls",
  "coachEmail": "jmcfalls@ku.edu",
  "collegeName": "University of Kansas"
 },
 {
  "coachName": "Laura Heberling",
  "coachEmail": "laura.heberling@ku.edu",
  "collegeName": "University of Kansas"
 },
 {
  "coachName": "Justin Lewis",
  "coachEmail": "Justin.lewis@ku.edu",
  "collegeName": "University of Kansas"
 },
 {
  "coachName": "Kiki Stokes O'Connor",
  "coachEmail": "kstokes@umkc.edu",
  "collegeName": "University of Missouri-Kansas City"
 },
 {
  "coachName": "Cody Barham",
  "coachEmail": "cb687@umkc.edu",
  "collegeName": "University of Missouri-Kansas City"
 },
 {
  "coachName": "Josie Tofpi",
  "coachEmail": "josietofpi@umkc.edu",
  "collegeName": "University of Missouri-Kansas City"
 },
 {
  "coachName": "Kinsey Fiedler",
  "coachEmail": "kfiedler@umkc.edu",
  "collegeName": "University of Missouri-Kansas City"
 },
 {
  "coachName": "Larissa Anderson",
  "coachEmail": "andersonlar@missouri.edu",
  "collegeName": "University of Missouri"
 },
 {
  "coachName": "Bella Norton",
  "coachEmail": "inry3@missouri.edu",
  "collegeName": "University of Missouri"
 },
 {
  "coachName": "Jake Epstein",
  "coachEmail": "jepstein@missouri.edu",
  "collegeName": "University of Missouri"
 },
 {
  "coachName": "Kasey Griffith",
  "coachEmail": "KaseyGriffith@MissouriState.edu",
  "collegeName": "Missouri State University"
 },
 {
  "coachName": "Shelby Hiers",
  "coachEmail": "srh276e@missouristate.edu",
  "collegeName": "Missouri State University"
 },
 {
  "coachName": "Brittany Gray-Cardenas",
  "coachEmail": "bjg675e@MissouriState.edu",
  "collegeName": "Missouri State University"
 },
 {
  "coachName": "Carly Brousek",
  "coachEmail": "CarlyBrousek@missouristate.edu",
  "collegeName": "Missouri State University"
 },
 {
  "coachName": "Kristi Bredbenner",
  "coachEmail": "kbredbenner@goshockers.com",
  "collegeName": "Wichita State University"
 },
 {
  "coachName": "Elizabeth Economon",
  "coachEmail": "eeconomon@goshockers.com",
  "collegeName": "Wichita State University"
 },
 {
  "coachName": "Sara Driesenga",
  "coachEmail": "sdriesenga@goshockers.com",
  "collegeName": "Wichita State University"
 },
 {
  "coachName": "Sydney McKinney",
  "coachEmail": "smckinney@goshockers.com",
  "collegeName": "Wichita State University"
 },
 {
  "coachName": "Mike Heard",
  "coachEmail": "mikeheard@omavs.com",
  "collegeName": "University of Nebraska Omaha"
 },
 {
  "coachName": "Jen Brauer",
  "coachEmail": "jendaro@omavs.com",
  "collegeName": "University of Nebraska Omaha"
 },
 {
  "coachName": "Brooke Dumont",
  "coachEmail": "bdumont@omavs.com",
  "collegeName": "University of Nebraska Omaha"
 },
 {
  "coachName": "Krista Wood",
  "coachEmail": "kristawood@creighton.edu",
  "collegeName": "Creighton University"
 },
 {
  "coachName": "Garrett Furnal",
  "coachEmail": "garrettfurnal@creighton.edu",
  "collegeName": "Creighton University"
 },
 {
  "coachName": "Cylie Halvorson",
  "coachEmail": "cyliehalvorson@creighton.edu",
  "collegeName": "Creighton University"
 },
 {
  "coachName": "Lindsay Diehl",
  "coachEmail": "lindsay.diehl@drake.edu",
  "collegeName": "Drake University"
 },
 {
  "coachName": "Jenn Marshall",
  "coachEmail": "jenn.marshall@drake.edu",
  "collegeName": "Drake University"
 },
 {
  "coachName": "Molly Jacobsen McCargar",
  "coachEmail": "molly.jacobsen@drake.edu",
  "collegeName": "Drake University"
 },
 {
  "coachName": "Jamie Pinkerton",
  "coachEmail": "jdpinker@iastate.edu",
  "collegeName": "Iowa State University"
 },
 {
  "coachName": "Kate Sinnott",
  "coachEmail": "ksinnott@iastate.edu",
  "collegeName": "Iowa State University"
 },
 {
  "coachName": "Lindsey Ubrun",
  "coachEmail": "lubrun@iastate.edu",
  "collegeName": "Iowa State University"
 },
 {
  "coachName": "Milaysia Ochoa",
  "coachEmail": "milaysia@iastate.edu",
  "collegeName": "Iowa State University"
 },
 {
  "coachName": "Dana Goss",
  "coachEmail": "dana.goss@rockhurst.edu",
  "collegeName": "Rockhurst University"
 },
 {
  "coachName": "Suzie Muenz",
  "coachEmail": "Suzanne.Muenz@rockhurst.edu",
  "collegeName": "Rockhurst University"
 },
 {
  "coachName": "Susan Anderson",
  "coachEmail": "sanderson@ucmo.edu",
  "collegeName": "University of Central Missouri"
 },
 {
  "coachName": "Jeremy Eilert",
  "coachEmail": "eilert@ucmo.edu",
  "collegeName": "University of Central Missouri"
 },
 {
  "coachName": "Taryan Barrick-Wessels",
  "coachEmail": "tlb91900@ucmo.edu",
  "collegeName": "University of Central Missouri"
 },
 {
  "coachName": "Brenda Holaday",
  "coachEmail": "brenda.holaday@washburn.edu",
  "collegeName": "Washburn University"
 },
 {
  "coachName": "Taylor Zordel",
  "coachEmail": "taylor.zordel@washburn.edu",
  "collegeName": "Washburn University"
 },
 {
  "coachName": "Andi Wehrli",
  "coachEmail": "andi.anti@washburn.edu",
  "collegeName": "Washburn University"
 },
 {
  "coachName": "Jaycee Ginter",
  "coachEmail": "jaycee.ginter@washburn.edu",
  "collegeName": "Washburn University"
 },
 {
  "coachName": "Megan Hill",
  "coachEmail": "mhill25@emporia.edu",
  "collegeName": "Emporia State University"
 },
 {
  "coachName": "Dustin Snyder",
  "coachEmail": "dsnyder4@emporia.edu",
  "collegeName": "Emporia State University"
 },
 {
  "coachName": "Beau Schultz",
  "coachEmail": "bschultz@pittstate.edu",
  "collegeName": "Pittsburg State University"
 },
 {
  "coachName": "Naomi Tellez",
  "coachEmail": "ntellez@nwmissouri.edu",
  "collegeName": "Northwest Missouri State University"
 },
 {
  "coachName": "Lillie Filger",
  "coachEmail": "lfilger@nwmissouri.edu",
  "collegeName": "Northwest Missouri State University"
 },
 {
  "coachName": "Mariah Wheeler",
  "coachEmail": "s585205@nwmissouri.edu",
  "collegeName": "Northwest Missouri State University"
 },
 {
  "coachName": "Bianca Duran",
  "coachEmail": "bduran@missouriwestern.edu",
  "collegeName": "Missouri Western State University"
 },
 {
  "coachName": "Ron Ferrill",
  "coachEmail": "rferrill@truman.edu",
  "collegeName": "Truman State University"
 },
 {
  "coachName": "Josie Buhr",
  "coachEmail": "jbuhr@truman.edu",
  "collegeName": "Truman State University"
 },
 {
  "coachName": "Hallie Blackney",
  "coachEmail": "blackney-h@mssu.edu",
  "collegeName": "Missouri Southern State University"
 },
 {
  "coachName": "Lauren Fuller",
  "coachEmail": "Fuller-L@mssu.edu",
  "collegeName": "Missouri Southern State University"
 },
 {
  "coachName": "Brittany Henning",
  "coachEmail": "henningb@newmanu.edu",
  "collegeName": "Newman University"
 },
 {
  "coachName": "Trinity Kuntz",
  "coachEmail": "kuntzt@newmanu.edu",
  "collegeName": "Newman University"
 },
 {
  "coachName": "Kyleigh Lay",
  "coachEmail": "layk@newmanu.edu",
  "collegeName": "Newman University"
 },
 {
  "coachName": "Andrea Vaughan",
  "coachEmail": "avaughan@rsu.edu",
  "collegeName": "Rogers State University"
 },
 {
  "coachName": "Malori Belcher",
  "coachEmail": "mbelcher@rsu.edu",
  "collegeName": "Rogers State University"
 },
 {
  "coachName": "Cassidy Bowen",
  "coachEmail": "bowen15@nsuok.edu",
  "collegeName": "Northeastern State University"
 },
 {
  "coachName": "Macy Taylor",
  "coachEmail": "taylo259@nsuok.edu",
  "collegeName": "Northeastern State University"
 },
 {
  "coachName": "Kylie Pavlicek",
  "coachEmail": "pavlicek@nsuok.edu",
  "collegeName": "Northeastern State University"
 },
 {
  "coachName": "Tripp Swisher",
  "coachEmail": "tswisher@sbuniv.edu",
  "collegeName": "Southwest Baptist University"
 },
 {
  "coachName": "Dez Duncan",
  "coachEmail": "dez.duncan@sbuniv.edu",
  "collegeName": "Southwest Baptist University"
 },
 {
  "coachName": "Emma Ryan",
  "coachEmail": "ryane@william.jewell.edu",
  "collegeName": "William Jewell College"
 },
 {
  "coachName": "Makaela Carr",
  "coachEmail": "carrm@william.jewell.edu",
  "collegeName": "William Jewell College"
 },
 {
  "coachName": "Samantha Moran",
  "coachEmail": "smoran@highlandcc.edu",
  "collegeName": "Highland Community College"
 },
 {
  "coachName": "Ryan Phillips",
  "coachEmail": "ryanp@labette.edu",
  "collegeName": "Labette Community College"
 },
 {
  "coachName": "Chelsea Beville",
  "coachEmail": "chelseab@labette.edu",
  "collegeName": "Labette Community College"
 },
 {
  "coachName": "Kim Alexander",
  "coachEmail": "kalexander@neosho.edu",
  "collegeName": "Neosho County Community College"
 },
 {
  "coachName": "Mateighia Tanner",
  "coachEmail": "mtanner@neosho.edu",
  "collegeName": "Neosho County Community College"
 },
 {
  "coachName": "Morgan Bohanan",
  "coachEmail": "mbohanan@butlercc.edu",
  "collegeName": "Butler Community College"
 },
 {
  "coachName": "Jaime Rose",
  "coachEmail": "rosej@hutchcc.edu",
  "collegeName": "Hutchinson Community College"
 },
 {
  "coachName": "Kiana Saint Pierre",
  "coachEmail": "kianas@fortscott.edu",
  "collegeName": "Fort Scott Community College"
 },
 {
  "coachName": "Ashton Friend",
  "coachEmail": "ashton.friend@coffeyville.edu",
  "collegeName": "Coffeyville Community College"
 },
 {
  "coachName": "TJ Segebart",
  "coachEmail": "tj.segebart@cloud.edu",
  "collegeName": "Cloud County Community College"
 },
 {
  "coachName": "Michele Rupard",
  "coachEmail": "mrupard@sfccmo.edu",
  "collegeName": "State Fair Community College"
 },
 {
  "coachName": "Zach Sigler",
  "coachEmail": "zsigler@iwcc.edu",
  "collegeName": "Iowa Western Community College"
 },
 {
  "coachName": "Adrian Pilkington",
  "coachEmail": "ammohr2@fhsu.edu",
  "collegeName": "Fort Hays State University"
 },
 {
  "coachName": "Lawren McKinney",
  "coachEmail": "llmckinney@fhsu.edu",
  "collegeName": "Fort Hays State University"
 },
 {
  "coachName": "Lily Fritsch-Sale",
  "coachEmail": "llsale@fhsu.edu",
  "collegeName": "Fort Hays State University"
 },
 {
  "coachName": "Katie Ackermann",
  "coachEmail": "ackermannk@unk.edu",
  "collegeName": "University of Nebraska at Kearney"
 },
 {
  "coachName": "Cory Castellano",
  "coachEmail": "castellanoc@unk.edu",
  "collegeName": "University of Nebraska at Kearney"
 },
 {
  "coachName": "Sam Maples",
  "coachEmail": "smaples1@uco.edu",
  "collegeName": "University of Central Oklahoma"
 },
 {
  "coachName": "Jessica Boone",
  "coachEmail": "jboone9@uco.edu",
  "collegeName": "University of Central Oklahoma"
 },
 {
  "coachName": "Hailey Neira",
  "coachEmail": "hneira@uco.edu",
  "collegeName": "University of Central Oklahoma"
 },
 {
  "coachName": "Jace Brewer",
  "coachEmail": "jace.brewer@okbu.edu",
  "collegeName": "Oklahoma Baptist University"
 },
 {
  "coachName": "Brady Rowland",
  "coachEmail": "brady.rowland@okbu.edu",
  "collegeName": "Oklahoma Baptist University"
 },
 {
  "coachName": "Brian Madden",
  "coachEmail": "bmadden@snu.edu",
  "collegeName": "Southern Nazarene University"
 },
 {
  "coachName": "Mickey Brown",
  "coachEmail": "mbrown1016@mail.snu.edu",
  "collegeName": "Southern Nazarene University"
 },
 {
  "coachName": "Kierra Homan",
  "coachEmail": "kmcfadden@mail.snu.edu",
  "collegeName": "Southern Nazarene University"
 },
 {
  "coachName": "Whitney Baze",
  "coachEmail": "whitney@thestrengthfactoryokc.com",
  "collegeName": "Southern Nazarene University"
 },
 {
  "coachName": "Mckayla Franks",
  "coachEmail": "kfranks@mail.snu.edu",
  "collegeName": "Southern Nazarene University"
 },
 {
  "coachName": "Emma Swearingen",
  "coachEmail": "eswearingen@mail.snu.edu",
  "collegeName": "Southern Nazarene University"
 },
 {
  "coachName": "Hailey Evans",
  "coachEmail": "hevans@mail.snu.edu",
  "collegeName": "Southern Nazarene University"
 },
 {
  "coachName": "Jordon Jones",
  "coachEmail": "jjones132@atu.edu",
  "collegeName": "Arkansas Tech University"
 },
 {
  "coachName": "Avery Sanders",
  "coachEmail": "asanders40@atu.edu",
  "collegeName": "Arkansas Tech University"
 },
 {
  "coachName": "Scott Gongola",
  "coachEmail": "sgongola@atu.edu",
  "collegeName": "Arkansas Tech University"
 },
 {
  "coachName": "Ashley Reeves",
  "coachEmail": "areeves2@harding.edu",
  "collegeName": "Harding University"
 },
 {
  "coachName": "Riley Price",
  "coachEmail": "rprice3@harding.edu",
  "collegeName": "Harding University"
 },
 {
  "coachName": "Bailey Willis",
  "coachEmail": "bwillis3@harding.edu",
  "collegeName": "Harding University"
 },
 {
  "coachName": "Mackenzie Sher",
  "coachEmail": "msher@se.edu",
  "collegeName": "Southeastern Oklahoma State University"
 },
 {
  "coachName": "Maddison Welch",
  "coachEmail": "mwelch@se.edu",
  "collegeName": "Southeastern Oklahoma State University"
 },
 {
  "coachName": "Ryan Wondrasek",
  "coachEmail": "ryan-wondrasek@utulsa.edu",
  "collegeName": "University of Tulsa"
 },
 {
  "coachName": "Amber Fiser",
  "coachEmail": "amf8603@utulsa.edu",
  "collegeName": "University of Tulsa"
 },
 {
  "coachName": "Kenny Gajewski",
  "coachEmail": "kenny.g@okstate.edu",
  "collegeName": "Oklahoma State University"
 },
 {
  "coachName": "Vanessa Shippy-Fletcher",
  "coachEmail": "vshippy@okstate.edu",
  "collegeName": "Oklahoma State University"
 },
 {
  "coachName": "Ryan Jacobs",
  "coachEmail": "ryan.jacobs@uni.edu",
  "collegeName": "University of Northern Iowa"
 },
 {
  "coachName": "Monica Adams",
  "coachEmail": "monica.wright@uni.edu",
  "collegeName": "University of Northern Iowa"
 },
 {
  "coachName": "Ozzie Adams",
  "coachEmail": "ozzie.adams@uni.edu",
  "collegeName": "University of Northern Iowa"
 },
 {
  "coachName": "Kyle Alstott",
  "coachEmail": "alstottk@uni.edu",
  "collegeName": "University of Northern Iowa"
 },
 {
  "coachName": "Michael Bumpers",
  "coachEmail": "bumpersm@uapb.edu",
  "collegeName": "University of Arkansas at Pine Bluff"
 },
 {
  "coachName": "Kristy Woods",
  "coachEmail": "woodsk@uapb.edu",
  "collegeName": "University of Arkansas at Pine Bluff"
 },
 {
  "coachName": "Efrain Barraza",
  "coachEmail": "eabarraza@nwosu.edu",
  "collegeName": "Northwestern Oklahoma State University"
 },
 {
  "coachName": "Gabriel Chavez",
  "coachEmail": "bchavez@nwosu.edu",
  "collegeName": "Northwestern Oklahoma State University"
 },
 {
  "coachName": "Mike Viramontez",
  "coachEmail": "mviramontez@dc3.edu",
  "collegeName": "Dodge City Community College"
 },
 {
  "coachName": "Riley Ludlam",
  "coachEmail": "rludlam@dc3.edu",
  "collegeName": "Dodge City Community College"
 },
 {
  "coachName": "Nickie Madden",
  "coachEmail": "nmadden@rose.edu",
  "collegeName": "Rose State College"
 },
 {
  "coachName": "Jessica Sisemore",
  "coachEmail": "jsisemore@rose.edu",
  "collegeName": "Rose State College"
 },
 {
  "coachName": "Amber Flores",
  "coachEmail": "A.Flores@sscok.edu",
  "collegeName": "Seminole State College (Oklahoma)"
 },
 {
  "coachName": "Bailey Burnett",
  "coachEmail": "bburnett@neosho.edu",
  "collegeName": "Neosho County Community College"
 }
];

const DBKEY='hotbRebuildDbV1';
const CLOUD_ENABLED_KEY='hotbCloudBackupEnabledV1';
const CLOUD_LAST_SUCCESS_KEY='hotbCloudLastSuccessV1';
const CLOUD_PENDING_KEY='hotbCloudPendingV1';
const CLOUD_ERROR_KEY='hotbCloudErrorV1';
const CLOUD_EMAIL='hotbkcrebels@gmail.com';
const PORTAL_QUERY_KEY='portal';
const portalToken=new URLSearchParams(window.location.search).get(PORTAL_QUERY_KEY)||'';
const firebaseConfig={apiKey:'AIzaSyAxMXEExEsFJkVkK0l_DWbE92Q_S27jjMI',authDomain:'hotb-kc-rebels.firebaseapp.com',projectId:'hotb-kc-rebels',storageBucket:'hotb-kc-rebels.firebasestorage.app',messagingSenderId:'412203516902',appId:'1:412203516902:web:397dccc597ac1149ee4c27'};
const seed = {
 roster: defaultRoster,
 teams:[],
 pitchers:[],
 savedGames:[],
 measurements:[],
 coaches:defaultCoaches,
 planPreferences:{},
 currentGame:null,
 route:'home'
};
let db = load();
if(!Array.isArray(db.coaches))db.coaches=structuredClone(defaultCoaches);
// Apply the requested player plans once, then preserve any changes made in the app.
if((db.planPreferencesVersion||0)<2){
 db.planPreferences={...(db.planPreferences||{}),...requestedPlanPreferences};
 db.planPreferencesVersion=2;
 localStorage.setItem(DBKEY,JSON.stringify(db));
}
if((db.planPreferencesVersion||0)<3){
 db.planPreferences={...(db.planPreferences||{}),'Brooklyn Gering':'OUT','Megan Ryan':'OUT'};
 db.planPreferencesVersion=3;
 localStorage.setItem(DBKEY,JSON.stringify(db));
}
if((db.battingStyleVersion||0)<1){
 db.roster.forEach(player=>{if(['Maia Waddell','Hailey Marsh'].includes(player.name))player.side='SL'});
 db.battingStyleVersion=1;
 localStorage.setItem(DBKEY,JSON.stringify(db));
}
// For now, a refresh abandons only the unfinished game and returns to setup.
if(db.route==='live'){
 db.currentGame=null;
 db.route='new';
 localStorage.setItem(DBKEY,JSON.stringify(db));
}
let route = portalToken?'portal':db.route || 'home';
let modal = null;
let reportMode='current', reportSub='spray', reportFilterHitter='All Hitters';
let reportGameId=null;
let reportSelectedPaId=null;
let selectedSeason=currentSeasonLabel(), dateFilterMode='full', customDateStart='', customDateEnd='';
let evalPlayer='Team';
let recordType='';
let infoPlayerIndex=0;
let pendingRosterImport=null;
let recruitingEmail={coachName:'',coachEmail:'',collegeName:'',personalNote:'',subject:'',body:'',selectedCoachEmail:''};
let timerInt=null,timerStart=0,timerElapsed=0;
let lastRenderedUndoState=null;
let practicePlan=null;
let practiceSetupState={selectedNames:null,startTime:'18:00',durationMinutes:120},practiceCoachOpen=false,practiceCardsOpen=false;
let practiceSection='hub',practiceFocusPlayer='',practiceDrillQuery='',practiceDrillCategory='All Drills',practiceSelectedDrill='';
let practiceChosenDrills=[],practiceDraftDrills=[],practiceDrillPickerOpen=false,practicePickerQuery='',practicePickerCategory='All Drills';
let practiceClock={running:false,finished:false,startAt:0,lastBlock:1},practiceClockTimer=null;
let cloudAuth=null,cloudStore=null,cloudUser=null,cloudBusy=false,cloudMessage='',cloudBackupTimer=null;
let cloudLastBackup=localStorage.getItem(CLOUD_LAST_SUCCESS_KEY)?new Date(localStorage.getItem(CLOUD_LAST_SUCCESS_KEY)):null,cloudSnapshotCount=0;
let portalAuthUser=null,portalData=null,portalBusy=!!portalToken,portalMessage='',portalView='home',portalSelectedDrill='',portalDrillQuery='',portalDrillResults=[],portalUnsubscribe=null;

function initCloud(){
 if(!window.firebase)return;
 try{
  if(!firebase.apps.length)firebase.initializeApp(firebaseConfig);
  cloudAuth=firebase.auth();cloudStore=firebase.firestore();
  cloudAuth.onAuthStateChanged(async user=>{
   if(user&&!user.isAnonymous&&String(user.email||'').toLowerCase()!==CLOUD_EMAIL){await cloudAuth.signOut();cloudMessage=`Please sign in with ${CLOUD_EMAIL}.`;cloudUser=null;portalAuthUser=null}
   else{
    cloudUser=user&&!user.isAnonymous?user:null;
    portalAuthUser=user||null;
   }
   if(cloudUser){await loadCloudStatus();if(localStorage.getItem(CLOUD_PENDING_KEY)==='true')scheduleCloudBackup()}
   if(portalToken)await loadPlayerPortal();
   if(route==='home'||route==='portal')render();
  });
 }catch(error){cloudMessage='Cloud backup could not start. Your phone data is still safe.'}
}
function isCoachPortalUser(user=portalAuthUser){return !!user&&!user.isAnonymous&&String(user.email||'').toLowerCase()===CLOUD_EMAIL}
function portalDoc(id=portalToken){return cloudStore?.collection('playerPortals').doc(id)}
async function portalHash(token,pin){
 const bytes=new TextEncoder().encode(`${token}:${String(pin||'').trim()}`),digest=await crypto.subtle.digest('SHA-256',bytes);
 return [...new Uint8Array(digest)].map(value=>value.toString(16).padStart(2,'0')).join('');
}
function newPortalId(){
 const bytes=crypto.getRandomValues(new Uint8Array(18));
 return btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function newPortalPin(){return String(crypto.getRandomValues(new Uint32Array(1))[0]%1000000).padStart(6,'0')}
function playerPortalUrl(player){return `${location.origin}${location.pathname}?${PORTAL_QUERY_KEY}=${encodeURIComponent(player.portalId||'')}`}
async function loadPlayerPortal(){
 if(!portalToken||!cloudAuth||!cloudStore)return;
 portalBusy=true;portalMessage='';
 if(!portalAuthUser){
  try{await cloudAuth.signInAnonymously()}catch(error){portalBusy=false;portalMessage='Player access is not active yet. The coach must finish Firebase portal setup.'}
  return;
 }
 try{
  const snapshot=await portalDoc().get();
  if(snapshot.exists){
   portalData={id:snapshot.id,...snapshot.data()};portalMessage='';
   if(portalUnsubscribe)portalUnsubscribe();
   portalUnsubscribe=portalDoc().onSnapshot(next=>{
    if(next.exists){portalData={id:next.id,...next.data()};if(route==='portal')render()}
   },()=>{
    portalData=null;portalMessage='This portal is no longer connected to this device.';
    if(route==='portal')render();
   });
  }
  else portalMessage='This player portal link is not valid.';
 }catch(error){
  portalData=null;
  if(!isCoachPortalUser())portalMessage='Enter your six-digit PIN to open this portal.';
  else portalMessage='This player portal link is not valid.';
 }
 portalBusy=false;
}
async function claimPlayerPortal(pin){
 if(!portalToken||!portalAuthUser||isCoachPortalUser()||portalBusy)return;
 if(!/^\d{6}$/.test(String(pin||'').trim())){portalMessage='Enter the six-digit PIN provided by your coach.';render();return}
 portalBusy=true;portalMessage='Checking your PIN…';render();
 try{
  const proof=await portalHash(portalToken,pin);
  await portalDoc().update({ownerUid:portalAuthUser.uid,pinProof:proof,claimedAt:firebase.firestore.FieldValue.serverTimestamp()});
  await loadPlayerPortal();
 }catch(error){portalBusy=false;portalMessage='That PIN did not work, or this portal is already linked to another device.'}
 render();
}
async function setupPlayerPortals(){
 if(!cloudUser||!cloudStore||cloudBusy)return;
 cloudBusy=true;portalMessage='Creating private player portals…';render();
 const players=db.roster.filter(item=>!item.isGuest),originals=players.map(player=>({player,portalId:player.portalId,portalPin:player.portalPin,portalPinHash:player.portalPinHash}));
 try{
  const batch=cloudStore.batch();
  for(const player of players){
   if(!player.portalId)player.portalId=newPortalId();
   if(!player.portalPin)player.portalPin=newPortalPin();
   player.portalPinHash=await portalHash(player.portalId,player.portalPin);
   const existing=await portalDoc(player.portalId).get();
   batch.set(portalDoc(player.portalId),{playerName:player.name,firstName:practiceFirstName(player.name),pinHash:player.portalPinHash,...(!existing.exists?{ownerUid:null,activePractice:null,focus:null}:{}),updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
  }
  await batch.commit();save();portalMessage='Private links and PINs are ready.';
 }catch(error){originals.forEach(({player,portalId,portalPin,portalPinHash})=>{if(portalId===undefined)delete player.portalId;else player.portalId=portalId;if(portalPin===undefined)delete player.portalPin;else player.portalPin=portalPin;if(portalPinHash===undefined)delete player.portalPinHash;else player.portalPinHash=portalPinHash});portalMessage='Player portals could not be created. Confirm Anonymous Authentication and the Player Portal security rules are active.'}
 cloudBusy=false;render();
}
async function resetPlayerPortal(player){
 if(!cloudUser||!player?.portalId||!confirm(`Reset ${practiceFirstName(player.name)}’s saved portal device? Her link and PIN will stay the same.`))return;
 try{await portalDoc(player.portalId).update({ownerUid:null,pinProof:firebase.firestore.FieldValue.delete(),claimedAt:firebase.firestore.FieldValue.delete()});portalMessage=`${practiceFirstName(player.name)} can connect a new device.`}
 catch(error){portalMessage='That portal could not be reset.'}
 render();
}
function cloudRoot(){return cloudStore.collection('hotbUsers').doc(cloudUser.uid)}
async function loadCloudStatus(){
 try{
  const [snap,history]=await Promise.all([cloudRoot().get(),cloudRoot().collection('snapshots').get()]);
  cloudLastBackup=snap.exists?snap.data().updatedAt?.toDate?.()||cloudLastBackup:null;cloudSnapshotCount=history.size;
  if(cloudLastBackup)localStorage.setItem(CLOUD_LAST_SUCCESS_KEY,cloudLastBackup.toISOString());
 }catch(error){}
}
function scheduleCloudBackup(){if(!cloudUser||localStorage.getItem(CLOUD_ENABLED_KEY)!=='true'||cloudBusy)return;clearTimeout(cloudBackupTimer);cloudBackupTimer=setTimeout(()=>backupToCloud(true),1800)}
function dailySnapshotId(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`}
async function pruneDailySnapshots(root){
 const history=await root.collection('snapshots').orderBy(firebase.firestore.FieldPath.documentId(),'desc').get(),expired=history.docs.slice(30);
 for(const snapshot of expired){const chunks=await snapshot.ref.collection('chunks').get(),batch=cloudStore.batch();chunks.docs.forEach(doc=>batch.delete(doc.ref));batch.delete(snapshot.ref);await batch.commit()}
 cloudSnapshotCount=Math.min(history.size,30);
}
async function backupToCloud(automatic=false){
 if(!cloudUser||cloudBusy)return;cloudBusy=true;if(!automatic){cloudMessage='Creating a protected cloud backup…';render()}
 try{
  const json=JSON.stringify(db),chunks=[];for(let i=0;i<json.length;i+=180000)chunks.push(json.slice(i,i+180000));
  const root=cloudRoot(),dailyRef=root.collection('snapshots').doc(dailySnapshotId()),[old,daily]=await Promise.all([root.collection('chunks').get(),dailyRef.get()]),batch=cloudStore.batch();old.docs.forEach(doc=>batch.delete(doc.ref));
  chunks.forEach((data,index)=>batch.set(root.collection('chunks').doc(String(index).padStart(4,'0')),{index,data}));
  batch.set(root,{email:CLOUD_EMAIL,chunkCount:chunks.length,updatedAt:firebase.firestore.FieldValue.serverTimestamp(),formatVersion:1});
  if(!daily.exists){chunks.forEach((data,index)=>batch.set(dailyRef.collection('chunks').doc(String(index).padStart(4,'0')),{index,data}));batch.set(dailyRef,{email:CLOUD_EMAIL,chunkCount:chunks.length,createdAt:firebase.firestore.FieldValue.serverTimestamp(),formatVersion:1})}
  await batch.commit();if(!daily.exists){cloudSnapshotCount++;pruneDailySnapshots(root).catch(()=>{})}
  localStorage.setItem(CLOUD_ENABLED_KEY,'true');localStorage.setItem(CLOUD_PENDING_KEY,'false');localStorage.removeItem(CLOUD_ERROR_KEY);cloudLastBackup=new Date();localStorage.setItem(CLOUD_LAST_SUCCESS_KEY,cloudLastBackup.toISOString());cloudMessage=automatic?'':'Cloud backup completed.';
 }catch(error){localStorage.setItem(CLOUD_PENDING_KEY,'true');localStorage.setItem(CLOUD_ERROR_KEY,new Date().toISOString());cloudMessage='Backup needs attention. Your phone data is safe; HotB will retry when it is online.'}
 cloudBusy=false;if(route==='home')render();
}
async function restoreFromCloud(){
 if(!cloudUser||cloudBusy||!confirm('Replace the data on this device with the latest cloud backup? Your current device data will be replaced.'))return;
 cloudBusy=true;cloudMessage='Downloading cloud backup…';render();
 try{const root=cloudRoot(),meta=await root.get();if(!meta.exists)throw new Error('No backup');const snap=await root.collection('chunks').orderBy('index').get(),restored=JSON.parse(snap.docs.map(doc=>doc.data().data).join(''));if(!Array.isArray(restored.roster)||!Array.isArray(restored.savedGames))throw new Error('Invalid backup');localStorage.setItem(DBKEY,JSON.stringify(restored));localStorage.setItem(CLOUD_ENABLED_KEY,'true');location.reload()}
 catch(error){cloudBusy=false;cloudMessage='No usable cloud backup was found. Your device data was not changed.';render()}
}
async function cloudPasswordAuth(createAccount=false){
 const password=$('#cloudPassword')?.value||'';
 if(!cloudAuth||cloudBusy)return;
 if(password.length<6){cloudMessage='Your HotB backup password must be at least 6 characters.';render();return}
 cloudBusy=true;cloudMessage=createAccount?'Creating your protected backup login…':'Signing in…';render();
 try{
  if(createAccount){
   const result=await cloudAuth.createUserWithEmailAndPassword(CLOUD_EMAIL,password);await result.user.sendEmailVerification();await cloudAuth.signOut();
   cloudMessage=`A verification email was sent to ${CLOUD_EMAIL}. Open that email, verify the address, then return here and sign in.`;
  }else{
   const result=await cloudAuth.signInWithEmailAndPassword(CLOUD_EMAIL,password);
   if(!result.user.emailVerified){await result.user.sendEmailVerification();await cloudAuth.signOut();cloudMessage=`Verify ${CLOUD_EMAIL} using the email Google sent, then sign in again.`}
   else cloudMessage='Signed in. Create the first backup when you are ready.';
  }
 }catch(error){
  const code=String(error?.code||'unknown-error').replace('auth/','');
  cloudMessage=createAccount?`HotB could not create the login (${code}).`:`HotB could not sign in (${code}).`;
 }
 cloudBusy=false;render();
}

function load(){
 try{
  const d=JSON.parse(localStorage.getItem(DBKEY));
  if(d){
   const aliases={'Matti Hardy':'Mattingly Hardy'};
   const savedByName=new Map((d.roster||[]).map(r=>[aliases[r.name]||r.name,r]));
   const roster=defaultRoster.map(profile=>({...savedByName.get(profile.name),...profile,side:savedByName.get(profile.name)?.side||profile.side}));
   const standardNames=new Set(defaultRoster.map(r=>r.name));
   const guests=(d.roster||[]).filter(r=>!standardNames.has(aliases[r.name]||r.name)).map(r=>({...r,isGuest:true}));
   roster.push(...guests);
   return {...seed,...d,roster,coaches:mergeCoachDirectories(d.coaches)};
  }
 }catch(e){}
 return structuredClone(seed);
}
function mergeCoachDirectories(savedCoaches){
 const merged=new Map(defaultCoaches.map(coach=>[String(coach.coachEmail||'').trim().toLowerCase(),{...coach}]));
 (Array.isArray(savedCoaches)?savedCoaches:[]).forEach(coach=>{
  const key=String(coach?.coachEmail||'').trim().toLowerCase();
  (Array.isArray(coach?.previousEmails)?coach.previousEmails:[]).forEach(previous=>merged.delete(String(previous||'').trim().toLowerCase()));
  if(key)merged.set(key,{...(merged.get(key)||{}),...coach});
 });
 return [...merged.values()];
}
function save(){
 db.route=route;
 localStorage.setItem(DBKEY,JSON.stringify(db));
 if(localStorage.getItem(CLOUD_ENABLED_KEY)==='true')localStorage.setItem(CLOUD_PENDING_KEY,'true');
 scheduleCloudBackup();
}
window.addEventListener('online',()=>{if(localStorage.getItem(CLOUD_PENDING_KEY)==='true')scheduleCloudBackup()});
function go(r){if(route==='practice'&&r==='home'){stopPracticeClock();practicePlan=null;practiceSetupState={selectedNames:null,startTime:'18:00',durationMinutes:120};practiceCoachOpen=false;practiceCardsOpen=false;practiceSection='hub';practiceFocusPlayer='';practiceChosenDrills=[];practiceDraftDrills=[];practiceDrillPickerOpen=false}if(r==='practice'&&route!=='practice')practiceSection='hub';route=r;modal=null;save();render();window.scrollTo(0,0)}
function currentGame(){return db.currentGame}
function planFor(name){
 const saved=db.planPreferences?.[name];
 if(saved)return saved;
 return db.roster.find(r=>r.name===name)?.isGuest?'OUT':'IN';
}
function mixHexWithWhite(hex,amount){
 const n=parseInt(hex.slice(1),16), rgb=[n>>16,(n>>8)&255,n&255];
 const mixed=rgb.map(v=>Math.round(255+(v-255)*amount));
 return `rgb(${mixed.join(',')})`;
}
function heatStyles(values,color){
 const distinct=[...new Set(Object.values(values).filter(v=>v>0))].sort((a,b)=>a-b);
 const map={};
 Object.entries(values).forEach(([zone,value])=>{
  if(!value){map[zone]='background:#edf2ef;color:#667085';return}
  const rank=distinct.indexOf(value), strength=distinct.length===1?1:.15+.85*(rank/(distinct.length-1));
  const bg=strength===1?color:mixHexWithWhite(color,strength);
  const n=parseInt(color.slice(1),16), light=((n>>16)*299+((n>>8)&255)*587+(n&255)*114)/1000;
  map[zone]=`background:${bg};color:${strength>.62&&light<155?'#fff':'#111'}`;
 });
 return map;
}
function createGame(opponent,pitcherName,pitcherNumber,order){
 const openingPitcher={name:pitcherName,number:pitcherNumber,enteredAt:Date.now(),pitchIndex:0};
 const g={
  id:crypto.randomUUID(),date:new Date().toISOString(),opponent,pitcherName,pitcherNumber,
  pitchersUsed:[openingPitcher],battingOrder:order,hittersUsed:[...order],hitterSubstitutions:[],currentIdx:0,inning:1,outs:0,runners:[],plan:planFor(order[0]),pitchType:'FB',
  balls:0,strikes:0,paNumber:1,pitches:[],plateAppearances:[],ended:false,
  pendingZone:null,zoneScope:'HITTER',zoneFilter:'K',previewNext:false,showAi:false,historyTab:'LIVE',allView:'DOTS',firstPitchView:false
 };
 db.currentGame=g;
 if(opponent&&!db.teams.includes(opponent))db.teams.push(opponent);
 rememberPitcher(opponent,pitcherName,pitcherNumber);
 save();return g;
}
function rememberPitcher(team,name,number){
 if(!name&&!number)return;
 const found=db.pitchers.find(p=>p.name===name&&p.number===number);
 if(found){
  found.teams=[...new Set([...(found.teams||[]),...(found.team?[found.team]:[]),...(team?[team]:[])])];
 }else db.pitchers.push({name,number,teams:team?[team]:[]});
}
function knownPitchersForOpponent(opponent){
 const opponentKey=normalized(opponent),pitchers=new Map();
 const add=(name,number)=>{
  name=String(name||'').trim();number=String(number||'').trim();
  if(!name&&!number)return;
  const key=`${normalized(name)}::${normalized(number)}`;
  if(!pitchers.has(key))pitchers.set(key,{name,number});
 };
 (db.pitchers||[]).forEach(pitcher=>{
  const teams=[...(pitcher.teams||[]),...(pitcher.team?[pitcher.team]:[])];
  if(!opponentKey||teams.some(team=>normalized(team)===opponentKey))add(pitcher.name,pitcher.number);
 });
 [...(db.savedGames||[]),...(db.currentGame?[db.currentGame]:[])].forEach(game=>{
  if(opponentKey&&normalized(game.opponent)!==opponentKey)return;
  (game.pitchersUsed||[]).forEach(pitcher=>add(pitcher.name,pitcher.number));
  (game.pitches||[]).forEach(pitch=>add(pitch.pitcherName,pitch.pitcherNumber));
 });
 return [...pitchers.values()].sort((a,b)=>(a.name||'').localeCompare(b.name||'',undefined,{sensitivity:'base'})||(a.number||'').localeCompare(b.number||'',undefined,{numeric:true}));
}
function hitterObj(name){return db.roster.find(r=>r.name===name)||{name,side:'R',jersey:'',grad:'',positions:'',gpa:'',interest:'',school:''}}
function isLeftBatter(player){return ['L','SL'].includes(player?.side)}
function recruitingBatSide(player){return player?.side==='SL'?'L':player?.side}
const recruitingColumns=[
 ['Player Name','name'],['Jersey #','jersey'],['Grad Year','grad'],['Positions','positions'],['GPA','gpa'],['High School','school'],
 ['Intended College Major','interest'],['Bats','side'],['Throws','throws'],['Player Email','email'],['Player Phone','phone'],
 ['Twitter / X URL','twitter'],['SportsRecruits URL','sportsRecruits'],['Highlight Video URL','highlightVideo'],['NCAA ID','ncaaId'],
 ['Recruiting Statement','recruitingStatement'],['Accomplishments / Honors','accomplishments'],['Additional Notes','notes']
];
const pitchingColumns=[
 ['Pitcher IP','pitcherIP'],['Pitcher ERA','pitcherERA'],['Pitcher WHIP','pitcherWHIP'],
 ['Pitcher K/BB','pitcherKBB'],['Pitcher OBA','pitcherOBA'],['Pitcher Strike %','pitcherStrikePct']
];
const playerInfoColumns=[...recruitingColumns,...pitchingColumns];
const coachColumns=[['Coach Name','coachName'],['Coach Email','coachEmail'],['School','collegeName']];
function cleanCell(value){return String(value??'').trim()}
function normalizeName(value){return cleanCell(value).toLowerCase().replace(/\s+/g,' ')}
if((db.measurementCleanupVersion||0)<1){
 db.measurements=(db.measurements||[]).filter(measurement=>normalizeName(measurement.player)!=='brynna peter');
 db.measurementCleanupVersion=1;
 localStorage.setItem(DBKEY,JSON.stringify(db));
}
function positionTokens(player){return cleanCell(player?.positions).split(/\s*[|,\/]\s*/).map(position=>position.toUpperCase()).filter(Boolean)}
function isPitcherProfile(player){return positionTokens(player).some(position=>['P','RHP','LHP','PITCHER'].includes(position))}
function syncRosterNames(){
 $$('.roster-name').forEach(input=>{const player=db.roster[+input.dataset.i];if(player)player.name=input.value.trim()||'Unnamed Player'});
}
function currentHitter(g=currentGame()){return hitterObj(g?.battingOrder?.[g.currentIdx]||'')}
const undoViewKeys=['historyTab','allView','zoneScope','zoneFilter','previewNext','firstPitchView','showAi','pendingZone','pitchType'];
function gameWithoutUndoViews(game){
 const actionGame=structuredClone(game||{});
 undoViewKeys.forEach(key=>delete actionGame[key]);
 return actionGame;
}
function gameUndoState(g){
 if(!g)return null;
 const {pitches=[],plateAppearances=[],undoStack,...game}=g;
 return {gameId:g.id,game:gameWithoutUndoViews(game),pitchesLength:pitches.length,plateAppearancesLength:plateAppearances.length,pitchHitters:pitches.map(pitch=>[pitch.id,pitch.hitter])};
}
function captureGameUndo(){
 const g=currentGame();
 if(!g){lastRenderedUndoState=null;return}
 const current=gameUndoState(g);
 if(!lastRenderedUndoState||lastRenderedUndoState.gameId!==g.id){lastRenderedUndoState=current;return}
 if(JSON.stringify(current)===JSON.stringify(lastRenderedUndoState))return;
 g.undoStack=Array.isArray(g.undoStack)?g.undoStack:[];
 g.undoStack.push(lastRenderedUndoState);
 if(g.undoStack.length>50)g.undoStack=g.undoStack.slice(-50);
 lastRenderedUndoState=current;
 localStorage.setItem(DBKEY,JSON.stringify(db));
}
function isStrikeResult(r){return ['F','K','KL','HIT','H4O','E','FC','SAC'].includes(r)}
function resultGroup(p){return p.result==='KL'?'K':p.result}
function pitchMarkClass(p){
 if(p.result==='HIT')return 'hit';
 if(['H4O','K','KL','SAC'].includes(p.result))return 'bad';
 if(p.result==='F')return 'foul';
 return 'good';
}
function pitchDotLabel(p){
 if(p.result==='HIT')return ({'1B':'1','2B':'2','3B':'3','HR':'4'})[p.hitType]||'';
 if(['H4O','E','FC','SAC'].includes(p.result))return p.fielder||'';
 return '';
}
function pitchExecutesPlan(pitch,player){
 const plan=pitch.plan;
 if(plan==='CH')return pitch.pitchType==='CH';
 if(plan==='NO')return true;
 const leftHanded=isLeftBatter(player);
 const insideZones=new Set(leftHanded?['L','L1','L2','C1','C3']:['R','R1','R2','C2','C4']);
 const outsideZones=new Set(leftHanded?['R','R1','R2','C2','C4']:['L','L1','L2','C1','C3']);
 return plan==='IN'?insideZones.has(pitch.zone):plan==='OUT'?outsideZones.has(pitch.zone):false;
}
function executionFromPitches(pitches,player){
 let successes=0,attempts=0;
 pitches.forEach(pitch=>{
  const inPlan=pitchExecutesPlan(pitch,player);
  const swing=['F','HIT','H4O','E','FC','SAC','K'].includes(pitch.result);
  const contact=['F','HIT','H4O','E','FC','SAC'].includes(pitch.result);
  const take=['B','KL'].includes(pitch.result);
  if(pitch.strikesBefore<2){
   // With no assigned location, only actual swings/contact are graded.
   if(pitch.plan==='NO'){
    if(swing){attempts++;successes++}
   }else if(swing||take){
    attempts++;
    if(swing?inPlan:!inPlan)successes++;
   }
  }else if(contact&&inPlan){
   // With two strikes, correct-location contact may help; nothing can hurt.
   attempts++;successes++;
  }
 });
 return {successes,attempts,rate:attempts?successes/attempts:null};
}
function recalculateGameExecution(game){
 (game?.plateAppearances||[]).forEach(pa=>{
  const pitches=(game.pitches||[]).filter(pitch=>pitch.hitter===pa.hitter&&pitch.pa===pa.pa);
  const execution=executionFromPitches(pitches,hitterObj(pa.hitter));
  pa.executionSuccesses=execution.successes;
  pa.executionAttempts=execution.attempts;
  pa.execution=execution.rate;
 });
}
if((db.executionFormulaVersion||0)<5){
 (db.savedGames||[]).forEach(recalculateGameExecution);
 recalculateGameExecution(db.currentGame);
 db.executionFormulaVersion=5;
 localStorage.setItem(DBKEY,JSON.stringify(db));
}
function runnersAfterHit(currentRunners,hitType){
 const batterBase=({'1B':1,'2B':2,'3B':3,'HR':4})[hitType];
 if(!batterBase)return [...currentRunners];
 if(batterBase===4)return [];
 let occupied=batterBase;
 const next=[];
 [...new Set(currentRunners)].sort((a,b)=>a-b).forEach(base=>{
  const destination=Math.max(base,occupied+1);
  occupied=destination;
  if(destination<=3)next.push(destination);
 });
 next.push(batterBase);
 return [...new Set(next)].sort((a,b)=>a-b);
}
function batterToFirst(currentRunners,{force=false}={}){
 if(force)return runnersAfterHit(currentRunners,'1B');
 return [...new Set([...currentRunners,1])].sort((a,b)=>a-b);
}
function runnersAfterRBA(currentRunners){
 const occupied=new Set(currentRunners);
 for(const base of [2,1]){
  if(occupied.has(base)&&!occupied.has(base+1)){occupied.delete(base);occupied.add(base+1)}
 }
 return [...occupied].sort((a,b)=>a-b);
}
function runnersAfterRBI(currentRunners,rbiCount){
 const scoringOrder=[...new Set(currentRunners)].sort((a,b)=>b-a);
 const scored=new Set(scoringOrder.slice(0,Math.max(0,Number(rbiCount)||0)));
 return scoringOrder.filter(base=>!scored.has(base)).sort((a,b)=>a-b);
}
function recordOut(g){
 g.outs+=1;
 if(g.outs>=3){g.outs=0;g.inning+=1;g.runners=[]}
}
function addPitch(result,extra={}){
 const g=currentGame(); if(!g)return;
 const h=currentHitter(g);
 const pitch={
  id:crypto.randomUUID(),hitter:h.name,pa:g.paNumber,inning:g.inning,ballsBefore:g.balls,strikesBefore:g.strikes,
  zone:g.pendingZone||'',pitchType:g.pitchType,plan:g.plan,result,pitcherName:g.pitcherName||'',pitcherNumber:g.pitcherNumber||'',
  opponent:g.opponent||'',gameId:g.id,hitterStyle:h.side||'R',runnersBefore:[...g.runners],outsBefore:g.outs,ts:Date.now(),...extra
 };
 g.pitches.push(pitch);
 let end=null;
 if(result==='B'){g.balls++;if(g.balls>=4) end='BB'}
 else if(result==='HBP') end='HBP';
 else if(result==='F'){if(g.strikes<2)g.strikes++}
 else if(result==='K'||result==='KL'){g.strikes++;if(g.strikes>=3) end='K'}
 else if(result==='HIT') end='HIT';
 else if(result==='H4O') end='H4O';
 else if(['E','FC','SAC'].includes(result))end=result;
 g.pendingZone=null;
 if(end) closePA(end, extra);
 g.showAi=false;
 g.pitchType='FB';
 save();render();
}
function closePA(outcome,extra={}){
 const g=currentGame(), h=currentHitter(g);
 const paPitches=g.pitches.filter(p=>p.pa===g.paNumber&&p.hitter===h.name);
 const firstPitchStrike = paPitches.length ? isStrikeResult(paPitches[0].result) : false;
 const execution=executionFromPitches(paPitches,h);
 const pa={
  id:crypto.randomUUID(),hitter:h.name,inning:g.inning,pa:g.paNumber,outcome,
  hitType:extra.hitType||'',contactType:extra.contactType||'',fielder:extra.fielder||null,
  rbi:Number(extra.rbiCount||0)>0,rbiCount:Number(extra.rbiCount||0),rba:!!extra.rba,sac:!!extra.sac,error:!!extra.error,fc:!!extra.fc,
  bunt:!!extra.bunt,slap:!!extra.slap,hhb:!!extra.hhb,weak:!!extra.weak,
  pitchCount:paPitches.length,finalCount:`${Math.min(g.balls,3)}-${Math.min(g.strikes,2)}`,
  firstPitchStrike,execution:execution.rate,executionSuccesses:execution.successes,executionAttempts:execution.attempts,ts:Date.now()
 };
 g.plateAppearances.push(pa);
 if(outcome==='HIT')g.runners=runnersAfterHit(g.runners,extra.hitType);
 if(outcome==='BB'||outcome==='HBP')g.runners=batterToFirst(g.runners,{force:true});
 if(outcome==='E')g.runners=batterToFirst(g.runners,{force:true});
 if(outcome==='FC')g.runners=batterToFirst(g.runners);
 if(outcome==='H4O'&&extra.rba)g.runners=runnersAfterRBA(g.runners);
 if(outcome==='H4O'&&Number(extra.rbiCount)>0)g.runners=runnersAfterRBI(g.runners,extra.rbiCount);
 if(['H4O','K','SAC'].includes(outcome))recordOut(g);
 g.balls=0;g.strikes=0;g.paNumber++;
 g.currentIdx=(g.currentIdx+1)%g.battingOrder.length;
 g.plan=planFor(g.battingOrder[g.currentIdx]);
 g.pitchType='FB';
}
function undo(){
 const g=currentGame();if(!g)return;
 const stack=Array.isArray(g.undoStack)?g.undoStack:[];
 const current=gameUndoState(g);
 const viewState={historyTab:'LIVE',allView:'DOTS',zoneScope:'HITTER',zoneFilter:'K',previewNext:false,firstPitchView:false,showAi:false,pendingZone:null,pitchType:'FB'};
 let previous=null;
 while(stack.length){
  const candidate=stack.pop();
  const normalized={...candidate,game:gameWithoutUndoViews(candidate.game)};
  if(JSON.stringify(normalized)!==JSON.stringify(current)){previous=normalized;break}
 }
 if(!previous)return;
 const pitches=g.pitches.slice(0,previous.pitchesLength);
 const hitterByPitch=new Map(previous.pitchHitters||[]);
 pitches.forEach(pitch=>{if(hitterByPitch.has(pitch.id))pitch.hitter=hitterByPitch.get(pitch.id)});
 const plateAppearances=g.plateAppearances.slice(0,previous.plateAppearancesLength);
 db.currentGame={...structuredClone(previous.game),...viewState,pitches,plateAppearances,undoStack:stack};
 lastRenderedUndoState=gameUndoState(db.currentGame);
 save();render();
}
function statsForPAs(pas){
 let AB=0,H=0,TB=0,BB=0,HBP=0,K=0,contact=0,RBI=0,HHB=0,WEAK=0;
 pas.forEach(pa=>{
   if(pa.outcome==='HIT'){H++;AB++;contact++;TB += ({'1B':1,'2B':2,'3B':3,'HR':4}[pa.hitType]||1)}
   else if(pa.outcome==='H4O'){AB++;contact++}
   else if(pa.outcome==='E'||pa.outcome==='FC'){AB++;contact++}
   else if(pa.outcome==='SAC'){contact++}
   else if(pa.outcome==='K'){AB++;K++}
   else if(pa.outcome==='BB'){BB++}
   else if(pa.outcome==='HBP'){HBP++}
   RBI+=Number(pa.rbiCount??(pa.rbi?1:0));
   if(pa.hhb)HHB++;
   if(pa.weak)WEAK++;
 });
 const PA=pas.length, AVG=AB?H/AB:0, OBP=(AB+BB+HBP)?(H+BB+HBP)/(AB+BB+HBP):0, SLG=AB?TB/AB:0;
 const OPS=OBP+SLG, contactPct=AB?contact/AB:0, kPct=PA?K/PA:0, bbPct=PA?BB/PA:0;
 // Provisional Runs Produced model for rebuild; calibrate against legacy app.
 const rp = H + Math.max(0,TB-H)*0.65 + BB*0.7 + HBP*0.7 + RBI*0.75 + HHB*0.25 - WEAK*0.25;
 return {PA,AB,H,TB,BB,HBP,K,RBI,HHB,WEAK,AVG,OBP,SLG,OPS,contactPct,kPct,bbPct,rp};
}
function allPAs(includeCurrent=true){
 let arr=[...db.savedGames.flatMap(g=>g.plateAppearances||[])];
 if(includeCurrent&&db.currentGame)arr.push(...db.currentGame.plateAppearances);
 return arr;
}
function allPitches(includeCurrent=true){
 let arr=[...db.savedGames.flatMap(g=>g.pitches||[])];
 if(includeCurrent&&db.currentGame)arr.push(...db.currentGame.pitches);
 return arr;
}
function seasonMeta(value){
 const date=new Date(value);
 if(Number.isNaN(date.getTime()))return {season:'',segment:''};
 const year=date.getFullYear(),month=date.getMonth()+1,day=date.getDate();
 if((month===7&&day>=31)||month===8)return {season:'',segment:'Dead Period'};
 const startYear=month>=9?year:year-1;
 const season=`${startYear}–${String(startYear+1).slice(-2)}`;
 let segment='Off Season';
 if(month>=9&&month<=11)segment='Fall';
 else if((month===5&&day>=20)||month===6||(month===7&&day<=30))segment='Summer';
 return {season,segment};
}
function currentSeasonLabel(now=new Date()){
 const year=now.getFullYear(),month=now.getMonth()+1,day=now.getDate();
 const startYear=(month>=9||month===8||(month===7&&day>=31))?year:year-1;
 return `${startYear}–${String(startYear+1).slice(-2)}`;
}
function availableSeasons(){
 return [...new Set([selectedSeason,currentSeasonLabel(),...db.savedGames.map(game=>seasonMeta(game.date).season),...(db.currentGame?[seasonMeta(db.currentGame.date).season]:[])].filter(Boolean))].sort().reverse();
}
function gameMatchesDateFilter(game){
 const time=new Date(game.date).getTime();
 if(Number.isNaN(time))return false;
 if(dateFilterMode==='custom'){
  const start=customDateStart?new Date(`${customDateStart}T00:00:00`).getTime():-Infinity;
  const end=customDateEnd?new Date(`${customDateEnd}T23:59:59.999`).getTime():Infinity;
  return time>=start&&time<=end;
 }
 const meta=seasonMeta(game.date);
 if(meta.season!==selectedSeason)return false;
 if(dateFilterMode==='full')return meta.segment!=='Dead Period';
 return meta.segment===({fall:'Fall',summer:'Summer',offseason:'Off Season'}[dateFilterMode]);
}
function filteredGames(includeCurrent=true){return [...db.savedGames,...(includeCurrent&&db.currentGame?[db.currentGame]:[])].filter(gameMatchesDateFilter)}
function filteredPAs(includeCurrent=true){return filteredGames(includeCurrent).flatMap(game=>game.plateAppearances||[])}
function filteredPitches(includeCurrent=true){return filteredGames(includeCurrent).flatMap(game=>game.pitches||[])}
function activeDateFilterLabel(){
 if(dateFilterMode==='custom')return customDateStart||customDateEnd?`${customDateStart||'Beginning'} to ${customDateEnd||'Today'}`:'Custom Dates';
 return `${selectedSeason} · ${{full:'Full Season',fall:'Fall',summer:'Summer',offseason:'Off Season'}[dateFilterMode]}`;
}
function dateFilterControls(prefix){
 if(dateFilterMode==='offseason')dateFilterMode='full';
 return `<div class="date-filter-controls"><select class="input" id="${prefix}SeasonFilter" aria-label="Season">${availableSeasons().map(season=>`<option ${season===selectedSeason?'selected':''}>${season}</option>`).join('')}</select><select class="input" id="${prefix}DateRange" aria-label="Date range"><option value="full" ${dateFilterMode==='full'?'selected':''}>Full Season</option><option value="fall" ${dateFilterMode==='fall'?'selected':''}>Fall</option><option value="summer" ${dateFilterMode==='summer'?'selected':''}>Summer</option><option value="custom" ${dateFilterMode==='custom'?'selected':''}>Custom Dates</option></select>${dateFilterMode==='custom'?`<label>Start<input class="input" id="${prefix}DateStart" type="date" value="${customDateStart}"></label><label>End<input class="input" id="${prefix}DateEnd" type="date" value="${customDateEnd}"></label>`:''}</div>`;
}
function bindDateFilters(prefix){
 $(`#${prefix}SeasonFilter`)?.addEventListener('change',event=>{selectedSeason=event.target.value;render()});
 $(`#${prefix}DateRange`)?.addEventListener('change',event=>{dateFilterMode=event.target.value;render()});
 const startInput=$(`#${prefix}DateStart`),endInput=$(`#${prefix}DateEnd`);
 startInput?.addEventListener('change',event=>{customDateStart=event.target.value});
 endInput?.addEventListener('change',event=>{customDateEnd=event.target.value});
 startInput?.addEventListener('blur',()=>render());
 endInput?.addEventListener('blur',()=>render());
}
function gameStats(g){return statsForPAs(g?.plateAppearances||[])}
function fps(g){
 const seen=new Set();
 const first=(g?.pitches||[]).filter(p=>{const key=`${p.hitter}::${p.pa}`;if(seen.has(key))return false;seen.add(key);return true});
 return first.length?first.filter(p=>isStrikeResult(p.result)).length/first.length:0;
}
function render(){
 captureGameUndo();
 const app=document.getElementById('app');
 app.innerHTML=`<div class="app ${route==='live'?'live-app':route==='eval'?'eval-app':route==='practice'?'practice-app':route==='portal'?'portal-app':''}">${route==='home'?homeView():
 route==='new'?newGameView():route==='roster'?rosterView():
 route==='live'?liveView():route==='eval'?evalView():route==='reports'?reportsPage():route==='practice'?practicePage():route==='portal'?playerPortalPage():homeView()}</div>${modal?modalView():''}`;
 bind();
 if(route==='eval')requestAnimationFrame(fitEvalMetricValues);
}
function fitEvalMetricValues(){
 document.querySelectorAll('.eval-tiles .eval-tile>.value').forEach(value=>{
  value.style.fontSize='';
  let size=parseFloat(getComputedStyle(value).fontSize);
  while(value.scrollWidth>value.clientWidth&&size>12){
   size-=1;
   value.style.fontSize=`${size}px`;
  }
 });
}
function homeView(){
 const cloudPending=localStorage.getItem(CLOUD_PENDING_KEY)==='true',cloudError=localStorage.getItem(CLOUD_ERROR_KEY),cloudText=!cloudUser?'Sign in to protect this device\'s data':cloudPending&&!navigator.onLine?'Waiting for internet':cloudError?'Backup needs attention':cloudLastBackup?`Backed up ${cloudLastBackup.toLocaleString()}`:'Ready for first backup';
 return `<div class="home-hero">
   <div class="home-brand">
    <img class="home-logo-img" src="Rebels%20REG%20White%20with%20red%20wing%20-%20REGIONAL.png" alt="Kansas City Rebels Regional">
   </div>
   <div class="home-actions">
    <button class="home-card primary" data-go="new"><h3>New Game</h3></button>
    <button class="home-card" data-go="reports"><h3>Reports</h3></button>
    <button class="home-card" data-go="eval"><h3>Player Eval</h3></button>
    <button class="home-card" data-go="roster"><h3>Edit Roster</h3></button>
    <button class="home-card" data-go="practice"><h3>Hitting Practice</h3></button>
    <button class="home-card cloud-card ${cloudError?'attention':cloudLastBackup?'healthy':''}" id="openCloudBackup"><h3>Cloud Backup</h3></button>
   </div>
 </div><div class="home-footer"><span>HOTB (THE ELITE HITTING APP) · REBUILD</span><div class="home-footer-actions"><button class="home-guide-button" id="openRecoveryGuide">Recovery Guide</button><button class="home-guide-button home-portal-button" data-go="portal">Player Portal</button></div></div>`;
}
function portalHeader(title='Player Portal',showBack=false){
 return `<div class="page-match-head page-head-centered portal-head"><button class="page-head-nav" ${showBack?'id="portalBack"':portalToken?'id="portalDashboard"':'data-go="home"'}>${showBack?'Back':portalToken?'Portal':'Home'}</button><h1>${esc(title)}</h1><span class="page-head-spacer"></span></div>`;
}
function portalProblemWords(query){
 const text=String(query||'').toLowerCase(),words=text.match(/[a-z0-9]+/g)||[],expanded=[...words];
 const add=(pattern,terms)=>{if(pattern.test(text))expanded.push(...terms.split(' '))};
 add(/pop|fly ball|under (the )?ball/, 'pop-ups dropped hands contact under ball barrel path');
 add(/ground|roll.?over|third base/, 'ground balls rollover barrel control contact');
 add(/outside|away/, 'outside pitch zone coverage');add(/inside|jam/, 'inside pitch zone coverage');
 add(/rise|high pitch/, 'high pitch barrel path vision');add(/low pitch/, 'low pitch posture barrel path');
 add(/change|off.?speed|too early|out front/, 'changeup offspeed early commitment timing weight back');
 add(/late|behind|velocity|fast/, 'late timing game-speed velocity quick');
 add(/strike.?out|chase|ball|recogn/, 'pitch recognition swing decisions chasing zone');
 add(/weak|power|harder|exit/, 'weak contact power lower-half stride weight transfer');
 add(/balance|drift|front foot|lunge/, 'balance drifting forward front foot posture');
 return [...new Set(expanded.filter(word=>word.length>2))];
}
function recommendPortalDrills(query){
 const terms=portalProblemWords(query),drills=Array.isArray(window.HotBDrillLibrary)?window.HotBDrillLibrary:[];
 if(!terms.length)return [];
 return drills.map(drill=>{
  const fields=[[drill.bestUsedFor,5],[drill.primaryPurpose,4],[drill.secondaryFocus,3],[drill.coachingCues,2],[drill.success,2],[drill.howItWorks,1],[drill.category,1],[drill.hittingMethod,1]];
  const score=terms.reduce((total,term)=>total+fields.reduce((fieldTotal,[value,weight])=>fieldTotal+(String(value||'').toLowerCase().includes(term)?weight:0),0),0);
  return {drill,score};
 }).filter(item=>item.score>0).sort((a,b)=>b.score-a.score||a.drill.name.localeCompare(b.drill.name)).slice(0,4).map(item=>item.drill);
}
function portalCoachView(){
 const players=db.roster.filter(player=>!player.isGuest),ready=players.length&&players.every(player=>player.portalId&&player.portalPin);
 if(!cloudUser)return `${portalHeader()}<main class="portal-page"><section class="portal-welcome"><span>COACH SETUP</span><h2>Private Player Access</h2><p>Sign in through Cloud Backup on this device before creating or managing player links.</p></section><button class="btn black block" data-go="home">Return Home</button></main>`;
 return `${portalHeader()}<main class="portal-page"><section class="portal-welcome"><span>COACH SETUP</span><h2>${ready?'Player Portals Are Ready':'Create Private Player Portals'}</h2><p>Each player receives one private link and a six-digit PIN. Her first successful login connects that portal to her device.</p></section>${portalMessage?`<p class="portal-message">${esc(portalMessage)}</p>`:''}<button class="btn black block portal-setup-button" id="setupPlayerPortals" ${cloudBusy?'disabled':''}>${ready?'Refresh Portal Records':'Create Player Portals'}</button>${ready?`<section class="portal-player-list">${players.map(player=>`<article><div><b>${esc(practiceFirstName(player.name))}</b><span>PIN ${esc(player.portalPin)}</span></div><div class="portal-player-actions"><button class="btn" data-share-portal="${esc(player.name)}">Share</button><button class="btn" data-reset-portal="${esc(player.name)}">Reset</button></div></article>`).join('')}</section><p class="portal-private-note">Share each link and PIN only with that player. Reset connects the portal to a replacement phone without changing her link or PIN.</p>`:''}</main>`;
}
function portalLoginView(){
 return `${portalHeader()}<main class="portal-page"><section class="portal-welcome"><span>PRIVATE ACCESS</span><h2>${portalBusy?'Opening Your Portal':'Enter Your PIN'}</h2><p>${portalBusy?'HotB is checking this private player link.':'Use the six-digit PIN your coach provided. This portal will then connect to this device.'}</p></section>${portalMessage?`<p class="portal-message">${esc(portalMessage)}</p>`:''}${portalBusy?'':`<label class="label" for="portalPin">Player PIN</label><input class="input portal-pin" id="portalPin" inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="000000"><button class="btn black block" id="openPlayerPortal">Open My Portal</button>`}</main>`;
}
function portalPracticeView(){
 const practice=portalData?.activePractice;
 const first=portalData?.firstName||practiceFirstName(portalData?.playerName),role=practice?.role;
 return `${portalHeader('My Practice',true)}<main class="portal-page">${practice?`<section class="portal-welcome active"><span>ACTIVE PRACTICE</span><h2>${esc(practice.title||'This Week’s Practice')}</h2><p>${esc(practice.startLabel||'')} · ${esc(practice.blockMinutes)}-minute blocks</p></section><article class="practice-player-card portal-player-card"><header><h2>${esc(first)}${role?` <small>(${esc(role)})</small>`:''}</h2></header><ol>${(practice.schedule||[]).map(entry=>`<li><b>B${entry.block}</b><span class="card-time">${esc(entry.time)}</span><strong>${esc(entry.assignment)}</strong></li>`).join('')}</ol></article>${practice.drills?.length?`<section class="portal-practice-drills"><h3>Practice Drills</h3>${practice.drills.map((drill,index)=>`<p><b>${index+1}</b><span>${esc(drill)}</span></p>`).join('')}</section>`:''}`:`<section class="portal-empty"><span>MY PRACTICE</span><h2>No Active Practice</h2><p>Your coach has not activated a practice plan for you right now.</p></section>`}</main>`;
}
function portalFocusView(){
 const focus=portalData?.focus;
 return `${portalHeader('My Focus',true)}<main class="portal-page">${focus?`<section class="portal-welcome"><span>MY PLAYER FOCUS</span><h2>${esc(focus.title||'Current Hitting Focus')}</h2><p>${esc(focus.summary||'')}</p></section><section class="portal-focus-content">${focus.needsWork?`<div><span>NEEDS WORK</span><b>${esc(focus.needsWork)}</b></div>`:''}${focus.drills?.length?`<div><span>DRILL PLAN</span><b>${esc(focus.drills.join(' · '))}</b></div>`:''}</section>`:`<section class="portal-empty"><span>MY FOCUS</span><h2>No Focus Plan Yet</h2><p>Your private two-week hitting analysis has not been published. No other player’s information is available from this portal.</p></section>`}</main>`;
}
function portalLibraryView(){
 const drills=Array.isArray(window.HotBDrillLibrary)?window.HotBDrillLibrary:[],selected=drills.find(drill=>drill.name===portalSelectedDrill);
 if(selected){const detail=(title,value)=>value?`<section class="practice-drill-detail-section"><h3>${esc(title)}</h3><p>${esc(value)}</p></section>`:'';return `${portalHeader('Drill Library',true)}<main class="portal-page practice-drill-detail"><button class="practice-library-return" id="portalLibraryBack">‹ Back To All Drills</button><section class="practice-drill-detail-head"><span>${esc(selected.category)}</span><h2>${esc(selected.name)}</h2><p>${esc(selected.primaryPurpose)}</p><div class="practice-drill-tags"><span>${esc(selected.hittingMethod)}</span>${selected.equipment?`<span>${esc(selected.equipment)}</span>`:''}</div></section>${detail('Best Used For',selected.bestUsedFor)}${detail('How It Works',selected.howItWorks)}${detail('Key Coaching Cues',selected.coachingCues)}${detail('What Success Looks Like',selected.success)}${detail('Space / Setup',selected.spaceSetup)}${selected.mediaLink?`<a class="btn black block" href="${esc(selected.mediaLink)}" target="_blank" rel="noopener">Watch Drill</a>`:''}</main>`}
 const query=portalDrillQuery.trim().toLowerCase(),shown=drills.filter(drill=>!query||Object.values(drill).some(value=>String(value).toLowerCase().includes(query)));
 return `${portalHeader('Drill Library',true)}<main class="portal-page"><div class="practice-library-search"><input class="input" id="portalDrillSearch" type="search" placeholder="Search drills" value="${esc(portalDrillQuery)}" aria-label="Search drills"></div><p class="practice-library-count">${shown.length} ${shown.length===1?'drill':'drills'}</p><section class="practice-drill-list">${shown.map(drill=>`<button class="practice-drill-card" data-portal-drill="${esc(drill.name)}"><span>${esc(drill.category)}</span><h3>${esc(drill.name)}</h3><p>${esc(drill.primaryPurpose)}</p><div class="practice-drill-tags"><span>${esc(drill.hittingMethod)}</span></div></button>`).join('')}</section></main>`;
}
function portalAskView(){
 return `${portalHeader('Ask The Library',true)}<main class="portal-page"><section class="portal-welcome"><span>DRILL FINDER</span><h2>What Do You Want To Work On?</h2><p>Describe what is happening in your swing or the pitch you are struggling to hit. HotB will recommend drills only from the KC Rebels library.</p></section><div class="portal-ask"><textarea class="input" id="portalProblem" rows="4" placeholder="Example: I keep popping up.">${esc(portalDrillQuery)}</textarea><button class="btn black block" id="findPortalDrills">Find My Drills</button></div>${portalDrillResults.length?`<section class="portal-recommendations"><h3>Recommended Drills</h3>${portalDrillResults.map((drill,index)=>`<button data-portal-recommendation="${esc(drill.name)}"><b>${index+1}</b><span><strong>${esc(drill.name)}</strong><small>${esc(drill.bestUsedFor||drill.primaryPurpose)}</small></span></button>`).join('')}</section>`:portalDrillQuery?`<section class="portal-empty compact"><h2>No Strong Match Yet</h2><p>Try describing the result, pitch location, timing problem, or part of the swing you want to improve.</p></section>`:''}</main>`;
}
function portalDashboardView(){
 const first=portalData?.firstName||practiceFirstName(portalData?.playerName),active=!!portalData?.activePractice;
 return `${portalHeader()}<main class="portal-page"><section class="portal-welcome ${active?'active':''}"><span>${active?'PRACTICE ACTIVE':'PLAYER PORTAL'}</span><h2>Hi, ${esc(first)}</h2><p>${active?'Your current practice plan is ready below.':'Your practice, personal focus and KC Rebels drill library are all in one place.'}</p></section><section class="portal-dashboard"><button class="${active?'active':''}" data-portal-view="practice"><span>PRACTICE</span><h3>My Practice</h3><p>${active?'View your active rotation.':'No practice is active.'}</p></button><button data-portal-view="focus"><span>PLAYER</span><h3>My Focus</h3><p>Your private hitting focus and assigned drills.</p></button><button data-portal-view="library"><span>LIBRARY</span><h3>Drill Library</h3><p>Search every approved KC Rebels hitting drill.</p></button><button data-portal-view="ask"><span>DRILL FINDER</span><h3>Ask The Library</h3><p>Describe a problem and find drills that address it.</p></button></section><p class="portal-private-note">This portal is linked only to ${esc(first)}. It does not provide access to another player’s practice or Player Focus.</p></main>`;
}
function playerPortalPage(){
 if(!portalToken)return portalCoachView();
 if(!portalData)return portalLoginView();
 if(portalView==='practice')return portalPracticeView();
 if(portalView==='focus')return portalFocusView();
 if(portalView==='library')return portalLibraryView();
 if(portalView==='ask')return portalAskView();
 return portalDashboardView();
}
function practicePlayerModel(player){
 const positions=positionTokens(player);
 return {name:player.name,isPitcher:isPitcherProfile(player),isCatcher:positions.includes('C')};
}
function practiceRole(player){
 const model=practicePlayerModel(player);
 return model.isPitcher&&model.isCatcher?'P/C':model.isPitcher?'P':model.isCatcher?'C':'';
}
function practiceFirstName(name){return String(name||'').trim().split(/\s+/)[0]||''}
function practiceEntryText(entry,plan=null,blockIndex=-1){
 if(!entry.partner)return practiceActivityLabel(entry.activity);
 const partner=practiceFirstName(entry.partner);
 if(entry.activity==='Hit Live'&&plan){
  const session=plan.liveSessions?.find(item=>item.block===blockIndex);
  if(session)return `Hit Live — ${practiceFirstName(session.pitcher)} (${practiceFirstName(session.catcher||'Coach')})`;
 }
 return entry.activity.startsWith('Pitch ')?`${entry.activity} (${partner})`:`${entry.activity} — ${partner}`;
}
function practiceCoachLabel(label,plan=null,blockIndex=-1){
 const [activity,partner]=String(label).split(' — ');
 if(!partner)return practiceActivityLabel(activity);
 if(activity==='Hit Live'&&plan){
  const session=plan.liveSessions?.find(item=>item.block===blockIndex);
  if(session)return `Hit Live — ${practiceFirstName(session.pitcher)} (${practiceFirstName(session.catcher||'Coach')})`;
 }
 return activity.startsWith('Pitch ')?`${activity} (${practiceFirstName(partner)})`:`${activity} — ${practiceFirstName(partner)}`;
}
function practiceClockText(date=new Date()){
 const hour=date.getHours(),minute=String(date.getMinutes()).padStart(2,'0');
 return `${hour%12||12}:${minute}${hour<12?'a':'p'}`;
}
function practiceActivityLabel(activity){
 const match=String(activity||'').match(/^Drill #(\d+)$/),drill=match?practiceChosenDrills[Number(match[1])-1]:null;
 return drill?.name||activity;
}
function practiceHeader(title='Hitting Practice',backToHub=false){
 return `<div class="page-match-head page-head-centered no-print"><button class="page-head-nav" ${backToHub?'id="practiceHubBack"':'data-go="home"'}>${backToHub?'Back':'Home'}</button><h1>${esc(title)}</h1><span class="page-head-spacer"></span></div>`;
}
function practiceHub(){
 return `${practiceHeader()}<main class="practice-hub no-print"><section class="practice-hub-intro"><h2>Plan Your Hitting Practice</h2><p>Build today’s schedule, organize your drills, or focus on one player.</p></section><section class="practice-hub-actions"><button class="practice-hub-card primary" id="openPracticeBuilder"><span>PLAN</span><h3>Build Practice</h3><p>Choose attendance, time and create the complete rotation.</p></button><button class="practice-hub-card" id="openDrillLibrary"><span>LIBRARY</span><h3>Drill Library</h3><p>Search your hitting drills, setups and coaching purposes.</p></button><button class="practice-hub-card" id="openPlayerFocus"><span>PLAYER</span><h3>Player Focus</h3><p>Select one player for a future two-week review and targeted drill plan.</p><small>LOOK ONLY</small></button></section></main>`;
}
function practiceLibrary(){
 const drills=Array.isArray(window.HotBDrillLibrary)?window.HotBDrillLibrary:[];
 const selected=drills.find(drill=>drill.name===practiceSelectedDrill);
 if(selected){
  const detail=(title,value)=>value?`<section class="practice-drill-detail-section"><h3>${esc(title)}</h3><p>${esc(value)}</p></section>`:'';
  return `${practiceHeader('Drill Library',true)}<main class="practice-feature-page practice-drill-detail no-print"><button class="practice-library-return" id="backToDrillList">‹ Back To All Drills</button><section class="practice-drill-detail-head"><span>${esc(selected.category)}</span><h2>${esc(selected.name)}</h2><p>${esc(selected.primaryPurpose)}</p><div class="practice-drill-tags"><span>${esc(selected.hittingMethod)}</span>${selected.equipment?`<span>${esc(selected.equipment)}</span>`:''}</div></section>${detail('Best Used For',selected.bestUsedFor)}${detail('How It Works',selected.howItWorks)}${detail('Key Coaching Cues',selected.coachingCues)}${detail('What Success Looks Like',selected.success)}${detail('Secondary Focus',selected.secondaryFocus)}${detail('Space / Setup',selected.spaceSetup)}${detail('Equipment',selected.equipment)}${detail('Notes / Variations',selected.notes)}${selected.mediaLink?`<a class="btn black block practice-drill-media-link" href="${esc(selected.mediaLink)}" target="_blank" rel="noopener">Watch Drill</a>`:''}</main>`;
 }
 const filters=['All Drills',...new Set(drills.map(drill=>drill.category).filter(Boolean))];
 const query=practiceDrillQuery.trim().toLowerCase();
 const shown=drills.filter(drill=>(practiceDrillCategory==='All Drills'||drill.category===practiceDrillCategory)&&(!query||Object.values(drill).some(value=>String(value).toLowerCase().includes(query))));
 return `${practiceHeader('Drill Library',true)}<main class="practice-feature-page no-print"><section class="practice-feature-lead"><span>HITTING LIBRARY</span><h2>${drills.length} Hitting Drills</h2><p>Search by drill name, hitting problem, purpose, equipment or coaching cue. This library does not change the practice scheduler yet.</p></section><div class="practice-library-search"><input class="input" id="practiceDrillSearch" type="search" placeholder="Search drills" value="${esc(practiceDrillQuery)}" aria-label="Search drills"></div><div class="practice-filter-preview">${filters.map(filter=>`<button class="${filter===practiceDrillCategory?'active':''}" data-drill-category="${esc(filter)}">${esc(filter)}</button>`).join('')}</div><p class="practice-library-count">${shown.length} ${shown.length===1?'drill':'drills'}</p><section class="practice-drill-list">${shown.map(drill=>`<button class="practice-drill-card" data-drill-name="${esc(drill.name)}"><span>${esc(drill.category)}</span><h3>${esc(drill.name)}</h3><p>${esc(drill.primaryPurpose)}</p><div class="practice-drill-tags"><span>${esc(drill.hittingMethod)}</span>${drill.equipment?`<span>${esc(drill.equipment)}</span>`:''}</div></button>`).join('')||`<div class="practice-library-empty"><b>No Drills Found</b><p>Try another search or category.</p></div>`}</section></main>`;
}
function practicePlayerFocus(){
 const selected=db.roster.find(player=>player.name===practiceFocusPlayer);
 return `${practiceHeader('Player Focus',true)}<main class="practice-feature-page no-print"><section class="practice-feature-lead"><span>FUTURE FEATURE</span><h2>${selected?esc(selected.name):'Choose A Player'}</h2><p>${selected?'This is how her two-week hitting review and targeted drill plan will be displayed. No performance analysis is active yet.':'Select a player to preview where her future two-week review and drill plan will appear.'}</p></section>${selected?`<section class="practice-focus-preview"><div><span>PAST 14 DAYS</span><b>Waiting for analysis</b></div><div><span>NEEDS WORK</span><b>Not calculated yet</b></div><div><span>DRILL PLAN</span><b>Not created yet</b></div></section><button class="btn block" id="changeFocusPlayer">Choose Another Player</button>`:`<section class="practice-focus-roster">${db.roster.map(player=>`<button data-focus-player="${esc(player.name)}"><b>${esc(player.name)}</b><span>${practiceRole(player)||'Hitter'}</span></button>`).join('')}</section>`}</main>`;
}
function practiceSetup(){
 const selected=practiceSetupState.selectedNames?new Set(practiceSetupState.selectedNames):null,duration=practiceSetupState.durationMinutes||120;
 return `${practiceHeader('Build Practice',true)}
 <div class="panel practice-setup no-print"><section class="practice-team-focus-preview"><div><span>TEAM FOCUS · PAST 14 DAYS</span><b>Drill recommendations will appear here</b></div><small>LOOK ONLY</small></section><div class="practice-intro"><h2>Who Is At Practice?</h2><p>Select everyone attending. HotB will divide the practice into ten blocks with no downtime.</p></div>
 <div class="practice-attendance-tools"><button class="btn" id="practiceSelectAll">All</button><button class="btn" id="practiceSelectNone">None</button><label>Start Time<div class="practice-field-shell practice-time-shell"><input class="input" id="practiceStartTime" type="time" value="${esc(practiceSetupState.startTime||'18:00')}" aria-label="Practice start time"><span id="practiceStartTimeDisplay">${esc(window.HotBPracticeScheduler.blockTimes(practiceSetupState.startTime||'18:00',duration)[0].start)}</span></div></label><label>Duration<div class="practice-field-shell"><select class="input" id="practiceDuration">${Array.from({length:13},(_,index)=>60+index*10).map(minutes=>`<option value="${minutes}" ${minutes===duration?'selected':''}>${minutes} Minutes</option>`).join('')}</select></div></label></div>
 <div class="practice-attendance">${db.roster.map((player,index)=>`<label class="practice-player"><input type="checkbox" data-practice-player="${index}" ${!selected||selected.has(player.name)?'checked':''}><span><b>${esc(player.name)}</b><small>${practiceRole(player)||'Hitter'}</small></span></label>`).join('')}</div>
 <button class="btn black block practice-generate" id="generatePractice">Build Practice Schedule</button></div>`;
}
function practiceCoachView(plan){
 return `<section class="practice-coach no-print"><h2>Coach View</h2>${plan.blocks.map(block=>`<article class="practice-block"><header><b>Block ${block.block}</b><span>${esc(block.start)}–${esc(block.end)}</span></header><div>${Object.entries(block.assignments).map(([activity,names])=>`<p><strong>${esc(practiceCoachLabel(activity,plan,block.block-1))}</strong><span>${esc(names.map(practiceFirstName).join(', '))}</span></p>`).join('')}</div></article>`).join('')}</section>`;
}
function practicePlayerCards(plan,hidden=false){
 const names=Object.keys(plan.schedule);
 const pages=Array.from({length:Math.ceil(names.length/6)},(_,index)=>names.slice(index*6,index*6+6));
 return `<section class="practice-player-cards ${hidden?'practice-cards-screen-hidden':''}"><div class="practice-cards-title no-print"><h2>Player Cards</h2><p>Each card gives one player her complete rotation.</p></div>${pages.map(page=>`<div class="practice-card-page">${page.map(name=>{
  const player=db.roster.find(item=>item.name===name),role=practiceRole(player||{name,positions:''});
  return `<article class="practice-player-card"><header><div><h2>${esc(practiceFirstName(name))}${role?` <small>(${role})</small>`:''}</h2></div></header><ol>${plan.schedule[name].map((entry,index)=>`<li><b>B${index+1}</b><span class="card-time">${esc(plan.times[index].start)}–${esc(plan.times[index].end)}</span><strong>${esc(practiceEntryText(entry,plan,index))}</strong></li>`).join('')}</ol></article>`;
 }).join('')}</div>`).join('')}</section>`;
}
function practiceSelectableDrills(){
 const excluded=new Set(['Basic Tee Work','Front Toss','Machine Pitch']);
 return (Array.isArray(window.HotBDrillLibrary)?window.HotBDrillLibrary:[]).filter(drill=>!excluded.has(drill.name));
}
function practiceDrillResourceWarnings(drills){
 const constrained=drills.filter(drill=>/tunnel/i.test(`${drill.spaceSetup} ${drill.equipment}`)||['Front Toss','Machine','Live Pitching'].includes(drill.hittingMethod));
 if(!constrained.length)return [];
 return [`${constrained.map(drill=>drill.name).join(', ')} ${constrained.length===1?'uses':'use'} tunnel or delivery space. Confirm the station can run during blocks when live pitching, machine or front toss is active.`];
}
function playerPracticePortalPayload(name){
 const schedule=practicePlan.schedule[name]||[];
 const player=db.roster.find(item=>item.name===name);
 return {id:practicePlan.portalDraftId,title:'This Week’s Hitting Practice',playerName:practiceFirstName(name),role:practiceRole(player||{name,positions:''}),startLabel:practicePlan.times?.[0]?.start||practicePlan.startTime,blockMinutes:practicePlan.blockMinutes,activatedAt:new Date().toISOString(),schedule:schedule.map((entry,index)=>({block:index+1,time:`${practicePlan.times[index].start}–${practicePlan.times[index].end}`,assignment:practiceEntryText(entry,practicePlan,index)})),drills:practiceChosenDrills.map(drill=>drill.name)};
}
async function activatePlayerPlans(){
 if(!cloudUser||!cloudStore){alert('Sign in through Cloud Backup before activating player portals.');return}
 if(!practicePlan||practiceChosenDrills.length!==practicePlan.drillStations){alert('Choose all practice drills before activating player plans.');return}
 const attending=new Set(practicePlan.players.map(player=>player.name)),missing=db.roster.filter(player=>attending.has(player.name)&&!player.portalId);
 if(missing.length){alert(`Create Player Portals first. Missing: ${missing.map(player=>practiceFirstName(player.name)).join(', ')}.`);return}
 const button=$('#activatePlayerPlans');if(button){button.disabled=true;button.textContent='Activating…'}
 try{
  const batch=cloudStore.batch();
  db.roster.filter(player=>player.portalId).forEach(player=>batch.set(portalDoc(player.portalId),{activePractice:attending.has(player.name)?playerPracticePortalPayload(player.name):null,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true}));
  await batch.commit();db.activePortalPractice={active:true,id:practicePlan.portalDraftId,activatedAt:new Date().toISOString(),players:[...attending]};save();render();alert(`Player plans activated for ${attending.size} ${attending.size===1?'player':'players'}.`);
 }catch(error){if(button){button.disabled=false;button.textContent='Activate Player Plans'}alert('The player plans could not be activated. Confirm the portal security setup and internet connection.')}
}
async function deactivatePlayerPlans(){
 if(!cloudUser||!cloudStore||!confirm('Remove the active practice from every player portal?'))return;
 const button=$('#deactivatePlayerPlans');if(button)button.disabled=true;
 try{const batch=cloudStore.batch();db.roster.filter(player=>player.portalId).forEach(player=>batch.set(portalDoc(player.portalId),{activePractice:null,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true}));await batch.commit();db.activePortalPractice=null;save();render();alert('Player practice plans are no longer active.')}
 catch(error){if(button)button.disabled=false;alert('The active player plans could not be removed.')}
}
function practiceDrillPicker(){
 const needed=practicePlan.drillStations,drills=practiceSelectableDrills(),filters=['All Drills',...new Set(drills.map(drill=>drill.category).filter(Boolean))],query=practicePickerQuery.trim().toLowerCase();
 const shown=drills.filter(drill=>(practicePickerCategory==='All Drills'||drill.category===practicePickerCategory)&&(!query||Object.values(drill).some(value=>String(value).toLowerCase().includes(query))));
 return `<div class="page-match-head page-head-centered no-print"><button class="page-head-nav" id="cancelPracticeDrills">Back</button><h1>Choose Drills</h1><span class="page-head-spacer"></span></div><main class="practice-feature-page practice-drill-picker no-print"><section class="practice-feature-lead"><span>PRACTICE DRILLS</span><h2>Choose ${needed} Drills</h2><p>Select exactly ${needed}. The order you select them assigns Drill #1 through Drill #${needed}.</p></section><div class="practice-picker-progress"><b>${practiceDraftDrills.length} of ${needed} selected</b><div>${practiceDraftDrills.map((drill,index)=>`<span>${index+1}. ${esc(drill.name)}</span>`).join('')||'<span>No drills selected yet</span>'}</div></div><div class="practice-library-search"><input class="input" id="practicePickerSearch" type="search" placeholder="Search drills" value="${esc(practicePickerQuery)}" aria-label="Search practice drills"></div><div class="practice-filter-preview">${filters.map(filter=>`<button class="${filter===practicePickerCategory?'active':''}" data-picker-category="${esc(filter)}">${esc(filter)}</button>`).join('')}</div><section class="practice-picker-list">${shown.map(drill=>{const selectedIndex=practiceDraftDrills.findIndex(item=>item.name===drill.name),selected=selectedIndex>=0,full=practiceDraftDrills.length>=needed&&!selected;return `<button class="practice-picker-card ${selected?'selected':''}" data-picker-drill="${esc(drill.name)}" ${full?'disabled':''}><span class="practice-picker-number">${selected?selectedIndex+1:'+'}</span><span><b>${esc(drill.name)}</b><small>${esc(drill.category)} · ${esc(drill.hittingMethod)}</small></span></button>`}).join('')}</section><button class="btn black block practice-save-drills" id="savePracticeDrills" ${practiceDraftDrills.length===needed?'':'disabled'}>Use These ${needed} Drills</button><p class="practice-picker-note">Basic Tee Work, Front Toss and Machine Pitch are already built into every practice and are not listed as drill-station choices.</p></main>`;
}
function practicePage(){
 if(!practicePlan&&practiceSection==='hub')return practiceHub();
 if(!practicePlan&&practiceSection==='library')return practiceLibrary();
 if(!practicePlan&&practiceSection==='player')return practicePlayerFocus();
 if(!practicePlan)return practiceSetup();
 if(practiceDrillPickerOpen)return practiceDrillPicker();
 const catcherText=practicePlan.catcherLoads.map(item=>`${item.name.split(' ')[0]} ${item.liveBlocks}`).join(' · ');
 const chosenComplete=practiceChosenDrills.length===practicePlan.drillStations,resourceWarnings=practiceDrillResourceWarnings(practiceChosenDrills),portalsActive=!!db.activePortalPractice?.active,currentPortalsActive=portalsActive&&db.activePortalPractice.id===practicePlan.portalDraftId;
 return `<div class="page-match-head page-head-centered no-print"><button class="page-head-nav" data-go="home">Home</button><h1>Hitting Practice</h1><span class="page-head-spacer"></span></div>
 <div class="practice-results">
  <section class="practice-summary no-print"><div><b>${practicePlan.attendance}</b><span>Player</span></div><div><b>10</b><span>${practicePlan.blockMinutes}M Blocks</span></div><div><b>${practicePlan.drillStations}</b><span>Drills</span></div></section>
  <section class="practice-live-control no-print"><div class="practice-clock-actions"><button class="btn red" id="startPracticeClock">${practiceClock.running||practiceClock.finished?'Restart':'Start'}</button><button class="btn" id="editPracticePlayers">Edit</button><button class="btn black" id="endPracticeClock" ${practiceClock.running?'':'disabled'}>End</button></div><div class="practice-live-clock" id="practiceLiveClock" ${practiceClock.running||practiceClock.finished?'':'hidden'}><div><span>Time</span><b id="practiceCurrentTime">${practiceClock.finished?practiceClockText():'--:--'}</b></div><div><span>Block</span><b id="practiceCurrentBlock">${practiceClock.finished?'DONE!':'1 of 10'}</b></div><div><span>Time Left</span><b id="practiceTimeLeft">${practiceClock.finished?'0:00':`${practicePlan.blockMinutes}:00`}</b></div></div></section>
  <section class="practice-selected-drills no-print"><div><span>DRILL STATIONS</span><h2>${chosenComplete?'Practice Drills Selected':`Choose ${practicePlan.drillStations} Practice Drills`}</h2>${chosenComplete?`<ol>${practiceChosenDrills.map((drill,index)=>`<li><b>${index+1}</b><span>${esc(drill.name)}</span></li>`).join('')}</ol>`:'<p>Select the actual drills before printing the coach schedule or player cards.</p>'}</div><button class="btn ${chosenComplete?'':'red'}" id="choosePracticeDrills">${chosenComplete?'Change Drills':'Choose Drills'}</button></section>
  <section class="practice-portal-publish no-print"><div><span>PLAYER PORTALS</span><h2>${currentPortalsActive?'Practice Is Active':portalsActive?'Replace Active Practice':'Activate This Practice'}</h2><p>${currentPortalsActive?'Attending players can view their individual plans now.':portalsActive?'A previous practice is active. Replace it when this schedule is ready.':'Publish each attending player’s individual rotation after you finish reviewing the schedule.'}</p></div><button class="btn ${currentPortalsActive?'':'black'}" id="${currentPortalsActive?'deactivatePlayerPlans':'activatePlayerPlans'}" ${chosenComplete?'':'disabled'}>${currentPortalsActive?'Deactivate':portalsActive?'Replace Plans':'Activate Player Plans'}</button></section>
  ${resourceWarnings.map(warning=>`<div class="practice-resource-warning no-print"><b>Resource Check</b><p>${esc(warning)}</p></div>`).join('')}
  <div class="practice-actions practice-actions-three no-print"><button class="btn ${practiceCoachOpen?'active':''}" id="togglePracticeCoach" aria-pressed="${practiceCoachOpen}">Coach</button><button class="btn ${practiceCardsOpen?'active':''}" id="togglePracticeCards" aria-pressed="${practiceCardsOpen}">Player</button><button class="btn black" id="printPracticeCards" ${chosenComplete?'':'disabled'}>Print</button></div>
  ${catcherText?`<p class="practice-catcher-load no-print"><b>Live Catching Blocks:</b> ${esc(catcherText)}</p>`:''}
  ${practicePlan.warnings.length?`<div class="practice-warnings no-print"><b>Schedule Check</b>${practicePlan.warnings.map(warning=>`<p>${esc(warning)}</p>`).join('')}</div>`:''}
  ${practiceCoachOpen?practiceCoachView(practicePlan):''}${practicePlayerCards(practicePlan,!practiceCardsOpen)}
 </div>`;
}
function newGameView(){
 const opts=db.roster.map(r=>`<option value="${esc(r.name)}">${esc(r.name)} (${r.side})</option>`).join('');
 const teams=[...new Set(db.teams||[])].sort((a,b)=>a.localeCompare(b,undefined,{sensitivity:'base'}));
 const pitchers=[...(db.pitchers||[])].sort((a,b)=>(a.name||'').localeCompare(b.name||'',undefined,{sensitivity:'base'}));
 const rows=Array.from({length:13},(_,i)=>`<div class="batting-row"><div class="batting-num">${i+1}</div>
 <select class="input batting-select" data-idx="${i}"><option value="">Select hitter</option>${opts}</select></div>`).join('');
 return `<div class="page-match-head"><h1>New Game</h1><button class="page-head-nav" data-go="home">Home</button></div>
 <div class="panel"><div class="section-title">MATCHUP</div>
  <label class="label">Opponent Name</label><div class="matchup-picker"><input id="opponent" class="input matchup-input" placeholder="Team Name" autocomplete="off"><button type="button" class="matchup-picker-arrow" data-matchup-open="opponent" aria-label="Show saved opponents">⌄</button><div class="matchup-picker-menu" id="opponentMenu" hidden>${teams.map(team=>`<div class="matchup-picker-option"><button type="button" class="matchup-picker-choice" data-opponent-choice="${esc(team)}">${esc(team)}</button><button type="button" class="matchup-picker-delete" data-delete-opponent="${esc(team)}" aria-label="Delete saved opponent ${esc(team)}">Delete</button></div>`).join('')}</div></div>
  <div class="grid2"><div><label class="label">Pitcher</label><div class="matchup-picker"><input id="pitcherName" class="input matchup-input" placeholder="Pitcher Name" autocomplete="off"><button type="button" class="matchup-picker-arrow" data-matchup-open="pitcher" aria-label="Show saved pitchers">⌄</button><div class="matchup-picker-menu" id="pitcherMenu" hidden>${pitchers.map(p=>`<div class="matchup-picker-option"><button type="button" class="matchup-picker-choice" data-pitcher-choice="${esc(p.name)}" data-pitcher-number="${esc(p.number||'')}"><b>${esc(p.name)}</b>${p.number?`<span>#${esc(p.number)}</span>`:''}</button><button type="button" class="matchup-picker-delete" data-delete-pitcher-name="${esc(p.name)}" data-delete-pitcher-number="${esc(p.number||'')}" aria-label="Delete saved pitcher ${esc(p.name)}">Delete</button></div>`).join('')}</div></div></div>
  <div><label class="label">Number</label><input id="pitcherNumber" class="input" placeholder="Auto"></div></div>
 </div>
 <div class="panel"><div style="display:flex"><div class="section-title">BATTING ORDER</div><div style="flex:1"></div><span class="small" id="hitterCount">0 hitters</span></div>${rows}</div>
 <div class="bottom-action"><button class="btn block black" id="startGame" disabled>START GAME</button></div>`;
}
function rosterView(){
 return `<div class="roster-hero"><div class="roster-hero-row"><button class="roster-nav roster-cancel" data-go="home">Cancel</button><h1>Edit Roster</h1><button class="roster-nav roster-save" id="saveRoster">Save</button></div></div>
 <div class="roster-data-tools"><button class="btn black" id="importRosterInfo">Import Info</button><button class="btn" id="exportRosterInfo">Export Info</button><input id="rosterInfoFile" type="file" accept=".xlsx,.csv" hidden><p>Import the Excel template for larger updates, or tap <b>Info</b> beside one player for a quick change. Blank imported cells leave saved information unchanged.</p></div>
 <div class="roster-editor">${db.roster.map((r,i)=>`<div class="roster-edit-row">
 <input class="input roster-name" data-i="${i}" value="${esc(r.name)}">
 <button class="sidebtn ${r.side==='R'?'active':''}" data-side="R" data-i="${i}">R</button>
 <button class="sidebtn ${r.side==='L'?'active':''}" data-side="L" data-i="${i}">L</button>
 <button class="sidebtn ${r.side==='SL'?'active':''}" data-side="SL" data-i="${i}">SL</button>
 <button class="infobtn" data-info="${i}">Info</button>
 <button class="deletebtn" data-del="${i}">×</button>
 </div>`).join('')}
 <button class="btn black block" id="addPlayer">+ Add Player</button></div>`;
}
function liveView(){
 const g=currentGame();if(!g)return `<div class="panel"><p>No current game.</p><button class="btn" data-go="new">New Game</button></div>`;
 const h=currentHitter(g);
 const currentPlan=g.plan||planFor(h.name);
 const activePitchType=g.pitchType||'FB';
 const aps=g.plateAppearances.filter(p=>p.hitter===h.name);
 const nextName=g.battingOrder.length>1?g.battingOrder[(g.currentIdx+1)%g.battingOrder.length]:'';
 const chartName=g.previewNext?nextName:h.name;
 const activeNames=new Set(g.hittersUsed||g.battingOrder);
 const allChartHitterPitches=g.pitches.filter(p=>p.hitter===chartName);
 let sourcePitches;
 if(g.zoneScope==='TEAM'&&!g.previewNext) sourcePitches=g.pitches.filter(p=>activeNames.has(p.hitter));
 else if(g.previewNext) sourcePitches=allChartHitterPitches;
 else if(/^AB\d+$/.test(g.historyTab||'')){
   const n=Number(g.historyTab.slice(2)), completed=aps[n-1];
   sourcePitches=completed?allChartHitterPitches.filter(p=>p.pa===completed.pa):[];
 }else if(g.historyTab==='ALL') sourcePitches=allChartHitterPitches;
 else sourcePitches=allChartHitterPitches.filter(p=>p.pa===g.paNumber);
 const allActivePitches=g.pitches.filter(p=>activeNames.has(p.hitter));
 const firstPitches=allActivePitches.filter((p,i,a)=>i===0||p.pa!==a[i-1].pa||p.hitter!==a[i-1].hitter);
 const statsMode=g.zoneScope==='TEAM'||g.previewNext||g.historyTab==='ALL';
 const percentMode=!g.firstPitchView&&(g.zoneScope==='TEAM'||g.previewNext||(g.historyTab==='ALL'&&(g.allView||'DOTS')==='PCT'));
 const filter=g.zoneFilter||'K';
 const histPitches=g.firstPitchView?firstPitches.filter(p=>p.result!=='B'):percentMode?sourcePitches.filter(p=>resultGroup(p)===filter):sourcePitches;
 const abTabNames=aps.map((p,i)=>`AB${i+1}`);
 const showAll=aps.length>=2;
 const zoneFreq=Object.fromEntries(chartZoneIds.map(zone=>[zone,0])); const hp=histPitches.length||1;
 histPitches.forEach(p=>{const zone=displayedChartZone(p.zone);if(zoneFreq[zone]!=null)zoneFreq[zone]++});
 const showPct=percentMode;
 const heat=heatStyles(zoneFreq,heatColors[filter]||heatColors.K);
 const zoneContent=z=>{
  if(showPct)return `<span class="pct">${Math.round(zoneFreq[z]/hp*100)}%</span>`;
  const pitches=histPitches.filter(p=>displayedChartZone(p.zone)===z), horizontal=/^[TB]/.test(z), vertical=/^[LR]/.test(z);
  const cols=horizontal?8:vertical?2:4, rows=Math.max(1,Math.ceil(pitches.length/cols));
  const available=horizontal?44:vertical?140:70;
  const dotSize=Math.max(3,Math.min(16,Math.floor(available/rows)-3));
  const gap=dotSize<=6?.5:dotSize<=10?1:1.5;
  const wrap=cols*dotSize+(cols-1)*gap;
  const dotFont=Math.max(5,Math.min(11,Math.floor(dotSize*.65)));
  return `<span class="pitch-dot-grid" style="--dot-size:${dotSize}px;--dot-gap:${gap}px;--dot-wrap:${wrap}px;--dot-font:${dotFont}px">${pitches.map(p=>`<i class="pitch-dot ${pitchMarkClass(p)}">${pitchDotLabel(p)}</i>`).join('')}</span>`;
 };
 const suggestions=g.showAi?aiSuggestions(g,chartName):[];
 const nextInitials=nextName?nextName.split(' ').map(x=>x[0]).join(''):'';
 return `<div class="topbar chart-head"><div class="brand">Hit Chart</div><button id="openProfile">Profile</button><button id="openReports">Reports</button><button class="end" id="endGame">End</button></div>
 <div class="live-top">
  <button class="statbox hitter-box live-stat-button" id="changeHitter" aria-label="Substitute for ${esc(h.name)}"><div class="cap">HITTER</div><div class="big">${esc(h.name)}</div></button>
  <div class="statbox"><div class="cap">INN</div><div class="big">${g.inning}</div></div>
  <div class="statbox"><div class="cap">COUNT</div><div class="big">${g.balls}-${g.strikes}</div></div>
  <button class="statbox live-stat-button" id="changePitcher" aria-label="Change pitcher"><div class="cap">PITCHER</div><div class="big">#${esc(g.pitcherNumber||'')}</div></button>
 </div>
 <div class="control-row">
  <div class="control-card"><div class="pill-row">${['IN','OUT','CH','NO'].map(x=>`<button class="pill red ${g.strikes<2&&currentPlan===x?'active':''}" data-plan="${x}">${x}</button>`).join('')}</div></div>
  <div class="control-card"><div class="pill-row">${[0,1,2].map(x=>`<button class="pill ${g.outs===x?'active':''}" data-outs="${x}">${x}</button>`).join('')}</div></div>
  <div class="control-card"><div class="pill-row">${[3,2,1].map(x=>`<button class="runner ${g.runners.includes(x)?'active':''}" data-runner="${x}"><span>${x}</span></button>`).join('')}</div></div>
 </div>
 <div class="live-workspace"><div class="live-left"><div class="zone-card">
  <div class="pitchtypes">${['FB','CH','RS','DP','CV','SC'].map(x=>`<button class="pitchtype ${activePitchType===x?'active':''}" data-ptype="${x}">${x}</button>`).join('')}</div>
  <div class="zone-layout">
   <button class="zone-scope ${g.zoneScope==='TEAM'?'active':''}" id="zoneScope">${g.zoneScope==='TEAM'?'HTR':'TM'}</button>
   ${['T1','T2'].map(z=>`<div class="zone zone-${z.toLowerCase()} ${showPct?'heat-zone':''} ${g.pendingZone===z?'selected':''}" style="${showPct?heat[z]:''}" data-zone="${z}">${zoneContent(z)}</div>`).join('')}
   ${['L1','L2'].map(z=>`<div class="zone zone-${z.toLowerCase()} ${showPct?'heat-zone':''} ${g.pendingZone===z?'selected':''}" style="${showPct?heat[z]:''}" data-zone="${z}">${zoneContent(z)}</div>`).join('')}
   <div class="core-grid">${['C1','C2','C3','C4'].map(z=>`<div class="zone core ${showPct?'heat-zone':''} ${g.pendingZone===z?'selected':''}" style="${showPct?heat[z]:''}" data-zone="${z}">${zoneContent(z)}</div>`).join('')}</div>
   ${['R1','R2'].map(z=>`<div class="zone zone-${z.toLowerCase()} ${showPct?'heat-zone':''} ${g.pendingZone===z?'selected':''}" style="${showPct?heat[z]:''}" data-zone="${z}">${zoneContent(z)}</div>`).join('')}
   ${['B1','B2'].map(z=>`<div class="zone zone-${z.toLowerCase()} ${showPct?'heat-zone':''} ${g.pendingZone===z?'selected':''}" style="${showPct?heat[z]:''}" data-zone="${z}">${zoneContent(z)}</div>`).join('')}
   <button class="zone-next ${g.previewNext?'active':''}" id="zoneNext" ${nextName?'': 'disabled'}>${g.previewNext?nextInitials:'NXT'}</button>
   <button class="fps ${g.firstPitchView?'active':''}" id="fpsBtn" aria-label="First-pitch strike percentage"><strong class="${Math.round(fps(g)*100)===100?'fps-compact':'fps-standard'}">${Math.round(fps(g)*100)}%</strong></button>
  </div>
  <div class="zone-tools"><button class="ai" id="aiBtn">Ai</button>
   ${g.showAi?`<div class="ai-suggestions">${suggestions.map((s,i)=>`<div class="ai-box"><span class="ai-rank">#${i+1}</span><span class="ai-pitch">${esc(s.label)}</span><span class="ai-pct">${s.pct===null?'':`${s.pct}%`}</span></div>`).join('')}</div>`:''}
  </div>
 </div>
 <div class="tabs ${showAll?'with-all':'without-all'}"><button class="tab fixed-tab ${(g.historyTab||'LIVE')==='LIVE'?'active':''}" data-tab="LIVE">LIVE</button><div class="ab-scroll">${abTabNames.map(t=>`<button class="tab ${(g.historyTab||'LIVE')===t?'active':''}" data-tab="${t}">${t}</button>`).join('')}${showAll?`<button class="tab ${(g.historyTab||'LIVE')==='ALL'?'active':''}" data-tab="ALL">${g.historyTab==='ALL'&&(g.allView||'DOTS')==='DOTS'?'%':'ALL'}</button>`:''}</div></div>
 <div class="results">
  <button class="result hbp" data-result="HBP" ${statsMode?'disabled':''}>HBP</button><button class="result ball ${percentMode&&filter==='B'?'filter-active':''}" data-result="B">B</button><button class="result foul ${percentMode&&filter==='F'?'filter-active':''}" data-result="F">F</button><button class="result hit ${percentMode&&filter==='HIT'?'filter-active':''}" data-result="HIT">HIT</button>
  <button class="result undo" id="undo">Undo</button><button class="result strike ${percentMode&&filter==='K'?'filter-active':''}" data-result="K">K</button><button class="result strike ${percentMode&&filter==='K'?'filter-active':''}" data-result="KL">KL</button><button class="result out ${percentMode&&filter==='H4O'?'filter-active':''}" data-result="H4O">H4O</button>
 </div></div><div class="history-panel">${historyHtml(g,g.previewNext?chartName:h.name)}</div></div>`;
}
function historyHtml(g,hitter){
 const pitches=g.pitches.filter(p=>p.hitter===hitter);
 const tab=g.historyTab||'LIVE';
 let show=pitches.filter(p=>p.pa===g.paNumber);
 if(/^AB\d+$/.test(tab)){
   const n=Number(tab.slice(2)), completed=g.plateAppearances.filter(pa=>pa.hitter===hitter)[n-1];
   show=completed?pitches.filter(p=>p.pa===completed.pa):[];
 }else if(tab==='ALL')show=pitches;
 const ordered=[...show].reverse();
 return ordered.map((p,i)=>{
   const divider=tab==='ALL'&&i>0&&p.pa!==ordered[i-1].pa?'<div class="history-ab-divider" aria-hidden="true"></div>':'';
   return `${divider}<div class="history-chip"><div class="history-chip-head"><strong>${esc(p.result)}</strong><span>${esc(p.pitchType)}</span></div><div class="mini-zone">
 ${chartZoneIds.map(z=>`<span class="mini-zone-cell mz-${z.toLowerCase()} ${displayedChartZone(p.zone)===z?pitchMarkClass(p):''}"></span>`).join('')}</div></div>`;
 }).join('')||'<div class="history-empty" aria-label="Next pitch"></div>';
}
function zoneGroup(zone,player){
 const leftHanded=isLeftBatter(player);
 const inside=new Set(leftHanded?['L','L1','L2','C1','C3']:['R','R1','R2','C2','C4']);
 const outside=new Set(leftHanded?['R','R1','R2','C2','C4']:['L','L1','L2','C1','C3']);
 if(inside.has(zone))return'IN';
 if(outside.has(zone))return'OUT';
 return ['T','T1','T2'].includes(zone)?'HIGH':['B','B1','B2'].includes(zone)?'LOW':'';
}
function normalized(value){return String(value||'').trim().toLowerCase()}
function aiSeason(game){return seasonMeta(game?.date).season||currentSeasonLabel(new Date(game?.date||Date.now()))}
function aiLocation(zone,player){return ({IN:'in',OUT:'ot',HIGH:'hi',LOW:'lo'})[zoneGroup(zone,player)]||''}
function aiPitchKey(pitch,player){
 const location=aiLocation(pitch.zone,player);
 return pitch.pitchType&&location?`${pitch.pitchType}${location}`:'';
}
function aiResultGroup(result){
 if(result==='B'||result==='KL')return'TAKE';
 if(result==='K')return'MISS';
 if(result==='F')return'FOUL';
 return['HIT','H4O','E','FC','SAC'].includes(result)?'CONTACT':result;
}
function aiCountGroup(balls,strikes){
 const key=`${balls}-${strikes}`;
 if(['0-0','0-2','3-0','3-2'].includes(key))return key;
 if(['0-1','1-2'].includes(key))return'PITCHER_AHEAD';
 if(['1-1','2-2'].includes(key))return'EVEN';
 if(['1-0','2-0','2-1','3-1'].includes(key))return'HITTER_AHEAD';
 return key;
}
function aiCountWeight(pitch,balls,strikes){
 const key=`${pitch.ballsBefore}-${pitch.strikesBefore}`,current=`${balls}-${strikes}`;
 if(key===current)return 2.4;
 const nearby={
  '0-0':[],
  '0-2':['1-2','2-2'],
  '3-0':['2-0','3-1'],
  '3-2':['2-2','3-1']
 }[current];
 if(nearby)return nearby.includes(key)?.65:.2;
 return aiCountGroup(pitch.ballsBefore,pitch.strikesBefore)===aiCountGroup(balls,strikes)?1.2:.3;
}
function aiRunnerSituation(runners){
 const set=new Set(runners||[]);
 if(set.has(1)&&set.has(2)&&set.has(3))return'LOADED';
 if(set.has(1)&&set.has(2))return'FORCE_THIRD';
 if(set.has(3))return'THIRD';
 if(set.has(1)&&set.has(3))return'CORNERS';
 if(set.has(1))return'FIRST';
 if(set.has(2))return'SECOND';
 return'EMPTY';
}
function aiStyle(playerOrPitch){
 const style=playerOrPitch?.hitterStyle||playerOrPitch?.side||hitterObj(playerOrPitch?.hitter).side||'R';
 return ['R','L','SL'].includes(style)?style:'R';
}
function aiPitchRecords(g){
 const season=aiSeason(g),opponent=normalized(g.opponent),pitcherName=normalized(g.pitcherName),pitcherNumber=normalized(g.pitcherNumber);
 const games=[...db.savedGames,...(db.currentGame?[db.currentGame]:[])].filter(game=>
  (game.id===g.id||aiSeason(game)===season)&&normalized(game.opponent)===opponent
 );
 const hasPitcher=game=>(game.pitches||[]).some(pitch=>normalized(pitch.pitcherName)===pitcherName&&normalized(pitch.pitcherNumber)===pitcherNumber);
 const prior=games.filter(game=>game.id!==g.id&&hasPitcher(game)).sort((a,b)=>new Date(b.date)-new Date(a.date));
 const recentIds=new Set(prior.slice(0,3).map(game=>game.id));
 const records=[];
 games.forEach(game=>{
  const paIndexes=new Map();
  (game.pitches||[]).forEach(pitch=>{
   if(normalized(pitch.pitcherName)!==pitcherName||normalized(pitch.pitcherNumber)!==pitcherNumber)return;
   const paKey=`${pitch.hitter}::${pitch.pa}`,paPitchIndex=paIndexes.get(paKey)||0;paIndexes.set(paKey,paPitchIndex+1);
   records.push({pitch,game,paPitchIndex,gameWeight:game.id===g.id?3:recentIds.has(game.id)?1.5:.75});
  });
 });
 return records;
}
function aiSuggestions(g,hitter){
 const player=hitterObj(hitter),targetStyle=aiStyle(player),records=aiPitchRecords(g);
 const locations=['in','ot','lo','hi'],types=['FB','CH','RS','DP','CV','SC'];
 const scores=Object.fromEntries(types.flatMap(type=>locations.map(location=>[`${type}${location}`,1.5])));
 const relevant=records.filter(({pitch})=>{
  const relation=pitch.hitter===hitter?'EXACT':aiStyle(pitch)===targetStyle?'SAME':'OTHER';
  return relation!=='OTHER'&&aiPitchKey(pitch,hitterObj(pitch.hitter));
 });
 if(relevant.length<6)return [{label:'—',pct:null},{label:'—',pct:null}];
 const currentPaPitches=g.pitches.filter(pitch=>pitch.hitter===hitter&&pitch.pa===g.paNumber);
 const longAtBat=currentPaPitches.length>=5,currentSituation=aiRunnerSituation(g.runners);
 const comparableSituationCount=relevant.filter(({pitch})=>Array.isArray(pitch.runnersBefore)&&aiRunnerSituation(pitch.runnersBefore)===currentSituation).length;
 const comparableOutCount=relevant.filter(({pitch})=>Number.isInteger(pitch.outsBefore)&&pitch.outsBefore===g.outs).length;
 const typeUse={};relevant.forEach(({pitch})=>typeUse[pitch.pitchType]=(typeUse[pitch.pitchType]||0)+1);
 const locationUse=Object.fromEntries(locations.map(location=>[location,1]));
 relevant.forEach(({pitch})=>{const location=aiLocation(pitch.zone,hitterObj(pitch.hitter));if(location)locationUse[location]++});
 const locationTotal=Object.values(locationUse).reduce((sum,value)=>sum+value,0);
 const controlPitch=Object.entries(typeUse).sort((a,b)=>b[1]-a[1])[0]?.[0]||'FB';
 records.forEach(({pitch,gameWeight,paPitchIndex})=>{
  if(!pitch.pitchType)return;
  const sourcePlayer=hitterObj(pitch.hitter),key=aiPitchKey(pitch,sourcePlayer);if(!key)return;
  const sourceStyle=aiStyle(pitch),exact=pitch.hitter===hitter,sameStyle=sourceStyle===targetStyle;
  const base=gameWeight*(exact?1.4:sameStyle?1:.05)*aiCountWeight(pitch,g.balls,g.strikes)*(longAtBat&&paPitchIndex>=5?1.25:1);
  if(exact||sameStyle){
   const situationWeight=comparableSituationCount>=5&&Array.isArray(pitch.runnersBefore)&&aiRunnerSituation(pitch.runnersBefore)===currentSituation?1.35:1;
   const outsWeight=comparableOutCount>=5&&Number.isInteger(pitch.outsBefore)&&pitch.outsBefore===g.outs?1.08:1;
   scores[key]+=base*situationWeight*outsWeight;
  }else locations.forEach(location=>scores[`${pitch.pitchType}${location}`]+=base*(locationUse[location]/locationTotal));
 });
 if(currentPaPitches.length>=2){
  const currentPair=currentPaPitches.slice(-2).map(pitch=>`${aiPitchKey(pitch,player)}:${aiResultGroup(pitch.result)}`);
  const byPa=new Map();records.filter(({pitch})=>pitch.hitter===hitter||aiStyle(pitch)===targetStyle).forEach(record=>{
   const id=`${record.game.id}:${record.pitch.hitter}:${record.pitch.pa}`;if(!byPa.has(id))byPa.set(id,[]);byPa.get(id).push(record);
  });
  const nextMatches=[];
  byPa.forEach(group=>{group.sort((a,b)=>a.pitch.ts-b.pitch.ts);for(let i=2;i<group.length;i++){
   const previous=group.slice(i-2,i).map(({pitch})=>`${aiPitchKey(pitch,hitterObj(pitch.hitter))}:${aiResultGroup(pitch.result)}`);
   if(previous[0]===currentPair[0]&&previous[1]===currentPair[1])nextMatches.push(group[i]);
  }});
  if(nextMatches.length>=3)nextMatches.forEach(({pitch,gameWeight})=>{const key=aiPitchKey(pitch,hitterObj(pitch.hitter));if(key)scores[key]+=2.5*gameWeight});
 }
 const forceSituation=['FORCE_THIRD','LOADED'].includes(currentSituation);
 Object.keys(scores).forEach(key=>{
  const type=types.find(value=>key.startsWith(value)),location=key.slice(type.length);
  if(forceSituation&&((targetStyle==='R'&&location==='in')||(targetStyle==='SL'&&location==='ot')))scores[key]*=1.15;
  if(currentSituation==='LOADED'&&type===controlPitch)scores[key]*=1.1;
  if(currentSituation==='THIRD'){
   if(g.outs<2){if(type===controlPitch)scores[key]*=1.1;if(location==='lo'&&['CH','DP'].includes(type))scores[key]*=.75}
   else{if(type===controlPitch)scores[key]*=1.03;if(location==='lo'&&['CH','DP'].includes(type))scores[key]*=.95}
  }
 });
 const total=Object.values(scores).reduce((sum,value)=>sum+value,0)||1;
 return Object.entries(scores).sort((a,b)=>b[1]-a[1]).slice(0,2).map(([label,value])=>({label,pct:Math.round(value/total*100)}));
}
function hitModal(kind){
 const isOut=kind==='H4O';
 return `<div class="modal-backdrop hit-backdrop"><div class="modal hit-modal ${isOut?'out-contact':'hit-contact'}">
 <div class="topbar"><button class="btn" data-close>Cancel</button><div class="brand" style="text-align:center">${kind}</div><div style="width:94px"></div></div>
 <div class="field-wrap"><div class="field">${[1,2,3,4,5,6,7,8,9].map(n=>`<button class="pos p${n}" data-fielder="${n}">${n}</button>`).join('')}</div></div>
 <div class="hit-options"><div class="contact-board">
  <div class="contact-left">
   <div class="compact-three">${['HIT','BUNT','SLAP'].map(x=>`<button class="choice" data-contact="${x}">${x}</button>`).join('')}</div>
   ${isOut?`<div class="compact-four out-grid">${['GO','LO','FO','PO'].map(x=>`<button class="choice" data-outtype="${x}">${x}</button>`).join('')}</div>`:
   `<div class="compact-three">${['GB','LD','FB'].map(x=>`<button class="choice" data-batted="${x}">${x}</button>`).join('')}</div>
    <div class="compact-four bases-grid">${['1B','2B','3B','HR'].map(x=>`<button class="choice blue" data-hit="${x}">${x}</button>`).join('')}</div>`}
  </div>
  <div class="contact-right">
   <div class="qual-grid">${isOut
    ?`<button class="choice" data-rbi-open>RBI</button><button class="choice" data-qual="SAC">SAC</button><button class="choice qual-wide" data-qual="RBA">RBA</button>`
    :`<button class="choice" data-qual="E">E</button><button class="choice" data-qual="FC">FC</button><button class="choice" data-rbi-open>RBI</button><button class="choice" data-qual="SAC">SAC</button>`}<button class="choice" data-strength="HHB">HHB</button><button class="choice" data-strength="WEAK">WEAK</button></div>
   <div class="rbi-picker" hidden><div class="rbi-picker-title">RBI</div><div class="rbi-picker-options">${[1,2,3].map(n=>`<button type="button" data-rbi-count="${n}">${n}</button>`).join('')}</div><button type="button" class="rbi-picker-cancel" data-rbi-cancel>Cancel</button></div>
  </div>
 </div><button class="btn block black save-contact" id="saveContact" disabled>${isOut?'Save Out':'Save Hit'}</button></div></div></div>`;
}
function reportModal(){
 const g=reportMode==='current'?currentGame():reportMode==='game'?db.savedGames.find(game=>game.id===reportGameId):null;
 const reportGames=reportMode==='saved'?filteredGames(false):(g?[g]:[]);
 const source=reportGames.flatMap(game=>game.plateAppearances||[]);
 const filtered=reportFilterHitter==='All Hitters'?source:source.filter(p=>p.hitter===reportFilterHitter);
 const s=statsForPAs(filtered);
 const hitters=[...new Set(source.map(p=>p.hitter))];
 return `<div class="modal-backdrop"><div class="modal">
 <div class="report-tabs"><button class="btn ${reportMode==='current'?'black':''}" data-rmode="current">Current</button><button class="btn ${reportMode!=='current'?'black':''}" data-rmode="saved">Saved</button><button class="btn gold" id="exportReport">Export</button><button class="btn" data-close>Close</button></div>
 <div class="panel" style="margin:14px 0 0">
 ${reportMode==='saved'?dateFilterControls('report'):''}
 <select class="input" id="reportHitter"><option>All Hitters</option>${db.roster.map(r=>`<option ${reportFilterHitter===r.name?'selected':''}>${esc(r.name)}</option>`).join('')}</select>
 <div class="report-context-title">${reportMode==='saved'?`${reportGames.length} Saved Games · ${esc(activeDateFilterLabel())}`:reportMode==='game'?`${new Date(g.date).toLocaleDateString()} · ${esc(g.opponent||'Opponent')}`:'Current Game'}</div>
 <div class="report-stat-grid">${[['PA',s.PA],['AVG',round3(s.AVG)],['OBP',round3(s.OBP)],['SLG',round3(s.SLG)],['OPS',round3(s.OPS)],['RBI',s.RBI],['HHB',s.HHB],['WEAK',s.WEAK]].map(([k,v])=>`<div class="report-stat"><b>${v}</b><span>${k}</span></div>`).join('')}</div>
 <h3 class="count-performance-title"><b>COUNT PERFORMANCE</b><span class="count-key hit">H</span><span class="count-separator">|</span><span class="count-key out">H4O</span><span class="count-separator">|</span><span class="count-key strikeout">K</span><span class="count-separator">|</span><span class="count-key average">AVE</span></h3>
 <div class="count-grid">${['0-0','0-2','1-2','2-2','3-2','6+'].map(c=>countCard(filtered,c)).join('')}</div>
 ${outcomeReport(filtered)}
 </div></div></div>`;
}
function countCard(pas,bucket){
 const matches=pas.filter(pa=>{
  if(bucket==='6+')return pa.pitchCount>=6;
  return pa.finalCount===bucket;
 });
 const h=matches.filter(p=>p.outcome==='HIT').length,o=matches.filter(p=>p.outcome==='H4O').length,k=matches.filter(p=>p.outcome==='K').length,ave=(h+o+k)?h/(h+o+k):0;
 return `<div class="count-card"><b>${bucket}</b><span class="count-value hit ${h===0?'zero':''}">${h}</span><span class="count-separator">|</span><span class="count-value out ${o===0?'zero':''}">${o}</span><span class="count-separator">|</span><span class="count-value strikeout ${k===0?'zero':''}">${k}</span><span class="count-separator">|</span><span class="count-value average ${ave===0?'zero':''}">${round3(ave)}</span></div>`;
}
function reportPitchSource(){
 return reportMode==='current'?(currentGame()?.pitches||[]):reportMode==='game'?(db.savedGames.find(game=>game.id===reportGameId)?.pitches||[]):filteredPitches(false);
}
function reportPitchForPA(pa){
 const pitches=reportPitchSource().filter(p=>p.pa===pa.pa&&p.hitter===pa.hitter);
 return pitches[pitches.length-1]||{};
}
function reportPitchLabel(pa){
 const pitch=reportPitchForPA(pa),zone=String(pitch.zone||'').replace(/^C/,'');
 return `${pitch.pitchType||'—'}${zone||''} (${pa.finalCount||'0-0'}) (${pa.pitchCount||0})`;
}
function reportOutcomeItem(pa,kind){
 const lead=kind==='HIT'?(pa.hitType||'H'):kind==='H4O'?(pa.fielder||'O'):'';
 return `<button class="report-outcome-item ${kind.toLowerCase()}" data-report-pa="${pa.id}">${lead?`<span>${lead}</span>`:''}<strong>${esc(reportPitchLabel(pa))}</strong></button>`;
}
function reportSection(title,items,kind){
 return `<section class="report-outcome-section"><div class="report-outcome-heading"><b>${title}</b><span>(${items.length}) (COUNT) (TOTAL PITCHES)</span></div><div class="report-outcome-list">${items.length?items.map(pa=>reportOutcomeItem(pa,kind)).join(''):'<span class="report-empty">None</span>'}</div></section>`;
}
function outcomeReport(pas){
 const strikeouts=pas.filter(p=>p.outcome==='K'),hits=pas.filter(p=>p.outcome==='HIT'),outs=pas.filter(p=>p.outcome==='H4O');
 const items=[...hits,...outs];
 return `${reportSection('STRIKEOUTS',strikeouts,'K')}${reportSection('BASE HITS',hits,'HIT')}
 <div class="report-spray-box"><div class="field report-spray-field">${items.map(p=>{
  const coords={1:[50,66],2:[50,85],3:[66,59],4:[62,47],5:[34,59],6:[38,47],7:[22,34],8:[50,25],9:[78,34]}[p.fielder]||[50,65];
  return `<button class="report-spray-dot ${p.outcome==='HIT'?'hit':'h4o'} ${reportSelectedPaId===p.id?'selected':''}" style="left:${coords[0]}%;top:${coords[1]}%" data-report-pa="${p.id}" aria-label="Select ${p.outcome} by ${esc(p.hitter)}"></button>`;
 }).join('')}</div></div>${reportSection('HITS 4 OUTS',outs,'H4O')}`;
}
function zoneReport(pas){
 const pitchSource=reportMode==='current'?(currentGame()?.pitches||[]):reportMode==='game'?(db.savedGames.find(game=>game.id===reportGameId)?.pitches||[]):filteredPitches(false);
 const ps=pitchSource.filter(p=>reportFilterHitter==='All Hitters'||p.hitter===reportFilterHitter);
 const z=Object.fromEntries(chartZoneIds.map(zone=>[zone,0]));ps.forEach(p=>{const zone=displayedChartZone(p.zone);if(z[zone]!=null)z[zone]++});const n=ps.length||1;
 const heat=heatStyles(z,heatColors.REPORT);
 return `<h3 style="margin-top:22px">ZONE CHART</h3><div class="zone-layout" style="max-width:480px;margin:10px auto">
 ${['T1','T2','L1','L2'].map(zone=>`<div class="zone zone-${zone.toLowerCase()} heat-zone" style="${heat[zone]}"><span class="pct">${Math.round(z[zone]/n*100)}%</span></div>`).join('')}
 <div class="core-grid">${['C1','C2','C3','C4'].map(k=>`<div class="zone core heat-zone" style="${heat[k]}"><span class="pct">${Math.round(z[k]/n*100)}%</span></div>`).join('')}</div>
 ${['R1','R2','B1','B2'].map(zone=>`<div class="zone zone-${zone.toLowerCase()} heat-zone" style="${heat[zone]}"><span class="pct">${Math.round(z[zone]/n*100)}%</span></div>`).join('')}</div>`;
}
function reportsPage(){
 const games=filteredGames(false);
 return `<div class="page-match-head page-head-centered"><button class="page-head-nav" data-go="home">Home</button><h1>Reports</h1><span class="page-head-spacer"></span></div>
 <div class="panel"><button class="btn black block" id="openSavedReports">Open Saved Reports</button>
 <div class="roster-data-tools backup-tools"><button class="btn black" id="exportFullBackup">Export Full Backup</button><button class="btn" id="restoreFullBackup">Restore Backup</button><input id="fullBackupFile" type="file" accept=".json,application/json" hidden><p>A full backup preserves games, pitches, roster information, measurements, pitchers and app preferences.</p></div>
 ${dateFilterControls('saved')}<div class="saved-game-list">${games.length?games.map(g=>{const meta=seasonMeta(g.date);return `<div class="saved-game-card"><div><b>${new Date(g.date).toLocaleDateString()} · ${esc(g.opponent||'Opponent')}</b><span>${esc(meta.season)} · ${esc(meta.segment)} · ${(g.plateAppearances||[]).length} PA</span></div><div class="saved-game-actions"><button class="btn black" data-view-game="${g.id}">View</button><button class="btn red" data-delete-game="${g.id}">Delete</button></div></div>`}).join(''):'No saved games match this date range.'}</div></div>`;
}
function exportFullBackup(){
 const payload={format:'HotB Full Backup',version:1,exportedAt:new Date().toISOString(),db};
 const a=document.createElement('a');
 a.href=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));
 a.download=`HotB_Full_Backup_${new Date().toISOString().slice(0,10)}.json`;
 a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
async function restoreFullBackup(file){
 const payload=JSON.parse(await file.text());
 if(payload?.format!=='HotB Full Backup'||!payload.db||!Array.isArray(payload.db.roster)||!Array.isArray(payload.db.savedGames))throw new Error('This is not a valid HotB full backup file.');
 if(!confirm('Restore this backup? It will replace all HotB information currently saved on this device.'))return;
 db=payload.db;route='home';db.route='home';modal=null;lastRenderedUndoState=null;save();render();
 alert('HotB backup restored successfully.');
}
function grade(value,metric){
 const rules={
  AVG:[[.4,'excellent'],[.35,'good'],[.3,'acceptable'],[.25,'concern'],[-Infinity,'serious']],
  OBP:[[.475,'excellent'],[.425,'good'],[.375,'acceptable'],[.325,'concern'],[-Infinity,'serious']],
  SLG:[[.6,'excellent'],[.5,'good'],[.4,'acceptable'],[.325,'concern'],[-Infinity,'serious']],
  contact:[[.9,'excellent'],[.85,'good'],[.8,'acceptable'],[.75,'concern'],[-Infinity,'serious']],
  BB:[[.15,'excellent'],[.10,'good'],[.07,'acceptable'],[.04,'concern'],[-Infinity,'serious']]
 };
 if(metric==='K'){
  if(value<.10)return'excellent';if(value<=.15)return'good';if(value<=.20)return'acceptable';if(value<=.25)return'concern';return'serious';
 }
 return rules[metric].find(([min])=>value>=min)[1];
}
function evalView(){
 const player=evalPlayer==='Team'?null:hitterObj(evalPlayer);
 const teamPas=filteredPAs();
 const pas=teamPas.filter(p=>!player||p.hitter===player.name);
 const s=statsForPAs(pas);
 const teamS=statsForPAs(teamPas);
 const teamRate=teamS.PA?teamS.rp/teamS.PA:0;
 const playerTotals=db.roster.map(r=>statsForPAs(teamPas.filter(p=>p.hitter===r.name))).filter(x=>x.PA>0);
 const avgPlayerRp=playerTotals.length?playerTotals.reduce((sum,x)=>sum+x.rp,0)/playerTotals.length:0;
 const hotb=s.PA&&teamRate?Math.round((s.rp/s.PA)/teamRate*100):null;
 const signed=(n,digits=1)=>`${n>0?'+':''}${n.toFixed(digits)}`;
 const deltaClass=n=>n>0?'positive':n<0?'negative':'neutral';
 const comparison=(value,delta,digits=1)=>`<div class="value compare-value"><span>${value}</span><span class="metric-pipe">|</span><span class="metric-delta ${deltaClass(delta)}">${signed(delta,digits)}</span></div>`;
 const emptyComparison=()=>`<div class="value compare-value empty-value"><span>—</span><span class="metric-pipe">|</span><span>—</span></div>`;
 const executionTotals=pas.reduce((totals,pa)=>({successes:totals.successes+Number(pa.executionSuccesses||0),attempts:totals.attempts+Number(pa.executionAttempts||0)}),{successes:0,attempts:0});
 const execution=executionTotals.attempts?executionTotals.successes/executionTotals.attempts:null;
 const ms=measurementTypes(player);
 const metricHead=(metric,label=metric)=>`<div class="eval-tile-head"><button class="metric-title" data-guide="${metric}">${label}</button><button class="metric-all" data-ranking="${metric}">ALL</button></div>`;
 return `<div class="eval-head"><button class="btn eval-nav" data-go="${currentGame()?'live':'home'}">${currentGame()?'Return':'Home'}</button><div class="eval-title"><h1>Evaluation</h1></div><button class="btn eval-email" id="openRecruitingEmail" ${player?'':'disabled'}>Email</button></div>
 <select class="player-select" id="evalSelect"><option>Team</option>${db.roster.map(r=>`<option ${evalPlayer===r.name?'selected':''}>${esc(r.name)}</option>`).join('')}</select>
 ${dateFilterControls('eval')}
 ${player?`<div class="player-card player-profile"><div class="grad-year">${esc(player.grad)}</div><div class="player-photo">${player.photo?`<img src="${encodeURI(player.photo)}" alt="${esc(player.name)}">`:esc(player.name.split(' ').map(x=>x[0]).join(''))}</div><div class="player-info"><div class="name">${esc(player.name)}</div><div class="meta"><span>#${esc(player.jersey)}</span> | ${esc(player.positions)} | GPA ${esc(player.gpa)}</div><div class="interest">${esc(player.interest)} <span>| ${esc(player.school)}</span></div></div></div>`:
 `<div class="player-card team-profile"><div class="player-photo team-photo"><img src="Rebels%20REG%20White%20with%20red%20wing%20-%20REGIONAL.png" alt="KC Rebels"></div><div class="player-info"><div class="name">KC Rebels</div><div class="meta">${pas.length} saved plate appearances</div></div></div>`}
 <div class="eval-tiles">
  <div class="eval-tile dark">${metricHead('HotB+')} ${hotb===null?emptyComparison():(player?comparison(hotb,hotb-100,0):`<div class="value">${hotb}</div>`)}<div class="note">Production vs Team</div></div>
  <div class="eval-tile">${metricHead('Runs Produced','RP')} ${s.PA?(player?comparison(s.rp.toFixed(1),s.rp-avgPlayerRp,1):`<div class="value">${s.rp.toFixed(1)}</div>`):emptyComparison()}<div class="note">Runs Produced</div></div>
  <div class="eval-tile">${metricHead('Execution','HP%')}<div class="value">${execution===null?'—%':pct0(execution)}</div><div class="note">Hitting Plan</div></div>
 </div>
 <div class="performance"><h2>Hitting Results <span class="small" style="float:right">${esc(activeDateFilterLabel())}</span></h2><div class="perf-grid">
 ${[['AVG',round3(s.AVG),'AVG'],['OBP',round3(s.OBP),'OBP'],['SLG',round3(s.SLG),'SLG'],['CONTACT',pct0(s.contactPct),'contact'],['K%',pct1(s.kPct),'K'],['BB%',pct1(s.bbPct),'BB']].map(([label,val,key])=>`<div class="perf ${s.PA>=25?grade(s[key==='contact'?'contactPct':key==='K'?'kPct':key==='BB'?'bbPct':key],key):''}" data-guide="${label}"><b>${val}</b><span>${label}</span></div>`).join('')}
 </div></div>
 ${player&&isPitcherProfile(player)?`<section class="pitcher-performance"><h2>Pitching Results <span class="small">GAMECHANGER</span></h2><div class="pitcher-stat-grid">
  ${[['IP','pitcherIP'],['ERA','pitcherERA'],['WHIP','pitcherWHIP'],['K/BB','pitcherKBB'],['OBA','pitcherOBA'],['STRIKE %','pitcherStrikePct']].map(([label,key])=>`<button class="pitcher-stat" data-pitch-ranking="${key}"><b>${esc(player[key]||'—')}</b><span>${label}</span></button>`).join('')}
 </div></section>`:''}
 <div class="athletic"><div class="athletic-head"><h2>Athletic Bests</h2>${player?'<button class="btn black" id="recordMeasure2">+ Record</button>':''}</div>
 <div class="measure-grid">${ms.map(m=>measurementCard(player,m)).join('')}</div></div>`;
}
function measurementTypes(player){
 const base=['Home to First','Overhand Throw','Exit Velocity','Broad Jump'];
 const positions=positionTokens(player);
 if(isPitcherProfile(player))base.push('Fastball','Changeup');
 if(positions.includes('C'))base.push('Pop Time');
 return base;
}
const stopwatchMeasurements=['Home to First'];
function measurementUnit(type){
 if(['Home to First','Pop Time'].includes(type))return'Seconds';
 if(['Overhand Throw','Fastball','Changeup','Exit Velocity'].includes(type))return'MPH';
 if(type==='Broad Jump')return'Inches';
 return'Value';
}
function formatMeasurementValue(type,value){
 const number=Number(value);
 return type==='Home to First'&&Number.isFinite(number)?number.toFixed(2):value;
}
function measurementCard(player,type){
 const rows=db.measurements.filter(m=>(!player||m.player===player.name)&&m.type===type);
 const isTime=['Home to First','Pop Time'].includes(type);
 const entries=rows.map(row=>({row,value:Number(row.value)})).filter(entry=>Number.isFinite(entry.value));
 const vals=entries.map(entry=>entry.value);
 const best=vals.length?(isTime?Math.min(...vals):Math.max(...vals)):null;
 if(!player){
  const bestPlayers=best===null?[]:[...new Set(entries.filter(entry=>entry.value===best).map(entry=>entry.row.player))];
  return `<div class="measure team-measure"><h3>${type}</h3><div class="best">${best===null?'—':formatMeasurementValue(type,best)}</div><div class="note">${bestPlayers.length?esc(bestPlayers.join(' / ')):'No results recorded'}</div></div>`;
 }
 return `<button class="measure" data-measure="${esc(type)}"><h3>${type}</h3><div class="best">${best===null?'—':formatMeasurementValue(type,best)}</div><div class="note">${vals.length?`${vals.length} attempt${vals.length===1?'':'s'} recorded`:'Tap to record'}</div></button>`;
}
function evalGuide(title){
 const content={
 'HotB+':`HotB+ compares the hitter’s Runs Produced rate with the current team rate. Runs Produced assigns 1.00 for a single, 1.65 for a double, 2.30 for a triple, 2.95 for a home run, 0.70 for a walk or hit-by-pitch, 0.75 for each RBI, plus 0.25 for hard-hit contact and minus 0.25 for weak contact. The app divides the hitter’s Runs Produced by her plate appearances, divides that rate by the team’s Runs Produced-per-plate-appearance rate, then multiplies by 100. A score of 100 is team average; 120 is 20% above the team rate; 80 is 20% below.`,
 'Runs Produced':`Runs Produced estimates the hitter’s total accumulated offensive contribution. It credits hits, extra bases, walks, hit-by-pitches, each RBI, and hard-hit balls; weak contact reduces the total. Because it is cumulative, hitters with more plate appearances have more opportunities to add Runs Produced. The comparison shows how her total differs from the average total of teammates with saved plate appearances.`,
 'Execution':`Execution grades pitch-by-pitch decisions against the selected IN, OUT, or CH plan. Before two strikes, swinging in the plan location and taking pitches outside it are successful; swinging outside the plan or taking a pitch in it are unsuccessful. With two strikes, correct-location contact can improve the score, while nothing can lower it.`
 }[title];
 if(content){
  const guideTitle=title==='Execution'?'Hitting Plan Percentage':title;
  return `<div class="modal-backdrop"><div class="modal dark"><div class="modal-header"><div><div class="small" style="color:#ddd;letter-spacing:2px">PLAYER EVALUATION GUIDE</div><h2>${guideTitle}</h2></div><button class="btn" data-close>Close</button></div><hr style="border-color:#555"><p style="font-size:22px;line-height:1.45;font-weight:400">${content}</p></div></div>`;
 }
 const metricMap={AVG:'Batting Average',SLG:'Slugging Percentage',OBP:'On-Base Percentage',CONTACT:'Contact Percentage','K%':'Strikeout Percentage','BB%':'Walk Percentage'};
 const table={
  AVG:[['Excellent','.400+'],['Good','.350–.399'],['Acceptable','.300–.349'],['Concern','.250–.299'],['Serious concern','Under .250']],
  SLG:[['Excellent','.600+'],['Good','.500–.599'],['Acceptable','.400–.499'],['Concern','.325–.399'],['Serious concern','Under .325']],
  OBP:[['Excellent','.475+'],['Good','.425–.474'],['Acceptable','.375–.424'],['Concern','.325–.374'],['Serious concern','Under .325']],
  CONTACT:[['Excellent','90%+'],['Good','85–89.9%'],['Acceptable','80–84.9%'],['Concern','75–79.9%'],['Serious concern','Below 75%']],
  'BB%':[['Excellent','15%+'],['Good','10–14.9%'],['Acceptable','7–9.9%'],['Concern','4–6.9%'],['Serious concern','Under 4%']],
  'K%':[['Excellent','Under 10%'],['Good','10–15%'],['Acceptable','15.1–20%'],['Concern','20.1–25%'],['Serious concern','Over 25%']]
 }[title];
 return `<div class="modal-backdrop"><div class="modal dark"><div class="modal-header"><div><div class="small" style="color:#ddd;letter-spacing:2px">PLAYER EVALUATION GUIDE</div><h2>${metricMap[title]}</h2></div><button class="btn" data-close>Close</button></div><table class="guide-table"><thead><tr><th>Rating</th><th>${title.replace('CONTACT','Contact%')}</th></tr></thead><tbody>${table.map(([r,v],i)=>`<tr><td class="${['excellent','good','acceptable','concern','serious'][i]}">${r}</td><td><b>${v}</b></td></tr>`).join('')}</tbody></table><p class="small" style="color:#ddd">The app begins color-grading a player after 25 saved plate appearances.</p></div></div>`;
}
function evalRankingModal(metric){
 const teamPas=filteredPAs();
 const teamStats=statsForPAs(teamPas);
 const teamRate=teamStats.PA?teamStats.rp/teamStats.PA:0;
 const rows=db.roster.map(player=>{
  const pas=teamPas.filter(pa=>pa.hitter===player.name);
  const stats=statsForPAs(pas);
  const executionTotals=pas.reduce((totals,pa)=>({successes:totals.successes+Number(pa.executionSuccesses||0),attempts:totals.attempts+Number(pa.executionAttempts||0)}),{successes:0,attempts:0});
  let value=null;
  if(metric==='HotB+')value=stats.PA&&teamRate?(stats.rp/stats.PA)/teamRate*100:null;
  else if(metric==='Runs Produced')value=stats.PA?stats.rp:null;
  else if(metric==='Execution')value=executionTotals.attempts?executionTotals.successes/executionTotals.attempts:null;
  return {player,value};
 }).sort((a,b)=>{
  if(a.value===null&&b.value===null)return a.player.name.localeCompare(b.player.name);
  if(a.value===null)return 1;if(b.value===null)return-1;
  return b.value-a.value||a.player.name.localeCompare(b.player.name);
 });
 const formatted=value=>value===null?'—':metric==='HotB+'?Math.round(value):metric==='Execution'?pct0(value):value.toFixed(1);
 return `<div class="modal-backdrop"><div class="modal dark ranking-modal"><div class="modal-header"><div><div class="small ranking-kicker">TEAM RANKINGS</div><h2>${esc(metric)}</h2></div><button class="btn" data-close>Close</button></div>
  <div class="ranking-list">${rows.map((row,index)=>`<div class="ranking-row ${row.player.name===evalPlayer?'selected-player':''}"><span class="ranking-place">${index+1}</span><span class="ranking-name">${esc(row.player.name)}</span><strong>${formatted(row.value)}</strong></div>`).join('')}</div>
 </div></div>`;
}
function pitcherRankingModal(key){
 const labels={pitcherIP:'IP',pitcherERA:'ERA',pitcherWHIP:'WHIP',pitcherKBB:'K/BB',pitcherOBA:'OBA',pitcherStrikePct:'Strike %'};
 const lowerIsBetter=['pitcherERA','pitcherWHIP','pitcherOBA'].includes(key);
 const rows=db.roster.filter(isPitcherProfile).map(player=>{
  const display=cleanCell(player[key]);
  const value=display?Number(display.replace('%','')):null;
  return {player,display:display||'—',value:Number.isFinite(value)?value:null};
 }).sort((a,b)=>{
  if(a.value===null&&b.value===null)return a.player.name.localeCompare(b.player.name);
  if(a.value===null)return 1;if(b.value===null)return-1;
  return (lowerIsBetter?a.value-b.value:b.value-a.value)||a.player.name.localeCompare(b.player.name);
 });
 return `<div class="modal-backdrop"><div class="modal dark ranking-modal"><div class="modal-header"><div><div class="small ranking-kicker">PITCHER RANKINGS</div><h2>${labels[key]}</h2></div><button class="btn" data-close>Close</button></div>
  <div class="ranking-list">${rows.map((row,index)=>`<div class="ranking-row ${row.player.name===evalPlayer?'selected-player':''}"><span class="ranking-place">${index+1}</span><span class="ranking-name">${esc(row.player.name)}</span><strong>${esc(row.display)}</strong></div>`).join('')}</div>
 </div></div>`;
}
function recordModal(){
 const p=evalPlayer==='Team'?db.roster[0]?.name:evalPlayer;
 const player=hitterObj(p);
 const types=measurementTypes(player);
 const selectedType=recordType&&types.includes(recordType)?recordType:types[0];
 const timed=stopwatchMeasurements.includes(selectedType);
 const attempts=db.measurements.filter(m=>m.player===p&&m.type===selectedType);
 return `<div class="modal-backdrop"><div class="modal"><div class="modal-header"><h2>Record Measurement</h2><button class="btn" data-close>Close</button></div>
 <label class="label">Player</label><select class="input" id="mPlayer">${db.roster.map(r=>`<option ${r.name===p?'selected':''}>${esc(r.name)}</option>`).join('')}</select>
 <label class="label">Measurement</label><select class="input" id="mType">${types.map(t=>`<option ${t===selectedType?'selected':''}>${t}</option>`).join('')}</select>
 <div class="stopwatch" id="measurementStopwatch" ${timed?'':'hidden'}><div class="timer-actions"><button class="btn green" id="timerStart">Start</button><button class="btn red" id="timerSave" hidden>Save</button></div><div class="timer-display"><div class="small">STOPWATCH</div><div class="time" id="timerTime">0.00</div></div></div>
 <div class="manual-entry ${timed?'':'manual-entry-large'}" id="manualEntryPanel" ${timed?'hidden':''}><label class="label" id="measurementUnitLabel">${measurementUnit(selectedType)}</label><div class="manual-entry-row"><input class="input" id="mValue" inputmode="decimal" placeholder="${timed?'0.00':'0'}"><button class="btn red" id="saveManualMeasurement" disabled>Save</button></div></div>
 <div class="measurement-attempt-row ${timed?'':'without-manual'}" id="measurementAttemptRow"><button class="tab fixed-tab manual-attempt" id="manualEntryToggle" ${timed?'':'hidden'}>Manual</button><div class="measurement-attempt-scroll" id="measurementAttempts">${attempts.map((m,i)=>`<button class="tab attempt-box" data-delete-measurement="${m.id}" title="Delete attempt ${i+1}">${esc(formatMeasurementValue(selectedType,m.value))}</button>`).join('')}</div></div>
 <div class="measurement-date"><label class="label" for="mDate">Date</label><input class="input" id="mDate" type="date" value="${new Date().toISOString().slice(0,10)}"></div>
 <div class="measurement-finish-row savebar"><button class="btn clear-measurements" id="clearMeasurements">Clear All</button><button class="btn black" id="finishMeasurements">Save &amp; Close</button></div>
 <p class="small">Every attempt is retained. The player page displays the best result.</p></div></div>`;
}
function gameActionModal(kind){
 const g=currentGame();
 const opponent=g?.opponent?.trim()||'this opponent';
 if(kind==='discardConfirm')return `<div class="modal-backdrop"><div class="modal game-action-modal" role="alertdialog" aria-modal="true" aria-label="Are You Sure">
  <h2>Are You Sure</h2>
  <p>End this game without saving? This will permanently erase the current game.</p>
  <div class="game-action-buttons confirm-discard-buttons"><button class="btn" id="cancelDiscard">No</button><button class="btn red" id="confirmDiscard">Yes</button></div>
 </div></div>`;
 return `<div class="modal-backdrop"><div class="modal game-action-modal" role="alertdialog" aria-modal="true" aria-label="End Game">
  <h2>End Game</h2>
  <p>Save and end the game against ${esc(opponent)}?</p>
  <div class="game-action-buttons end-game-buttons"><button class="btn" data-close>Cancel</button><button class="btn red" id="saveAndExit">Save &amp; Exit</button><button class="btn dark" id="discardGame">End &amp; Don’t Save</button></div>
 </div></div>`;
}
function pitcherChangeModal(){
 const g=currentGame();
 const known=knownPitchersForOpponent(g.opponent);
 return `<div class="modal-backdrop"><div class="modal substitution-modal"><div class="modal-header"><h2>Change Pitcher</h2><button class="btn" data-close>Cancel</button></div>
  <p class="substitution-note">Enter the new pitcher for ${esc(g.opponent||"this team")}.</p>
  ${known.length?`<div class="saved-pitcher-options"><div class="label">Saved Pitchers</div>${known.map(pitcher=>`<button type="button" data-saved-pitcher-name="${esc(pitcher.name)}" data-saved-pitcher-number="${esc(pitcher.number)}"><b>${esc(pitcher.name||'Pitcher')}</b><span>${pitcher.number?`#${esc(pitcher.number)}`:'No number'}</span></button>`).join('')}</div>`:''}
  <label class="label">Pitcher Name</label><input id="subPitcherName" class="input" placeholder="Enter pitcher name" list="subPitcherList"><datalist id="subPitcherList">${known.map(p=>`<option value="${esc(p.name)}"></option>`).join("")}</datalist>
  <label class="label">Number</label><input id="subPitcherNumber" class="input" placeholder="Enter number" inputmode="numeric">
  <button class="btn block red savebar" id="savePitcherChange" disabled>Use New Pitcher</button>
 </div></div>`;
}
function hitterChangeModal(){
 const g=currentGame(), outgoing=currentHitter(g);
 const inLineup=new Set(g.battingOrder);
 const available=db.roster.filter(r=>!inLineup.has(r.name));
 return `<div class="modal-backdrop"><div class="modal substitution-modal"><div class="modal-header"><h2>Substitute Hitter</h2><button class="btn" data-close>Cancel</button></div>
  <p class="substitution-note">Choose who will bat for <b>${esc(outgoing.name)}</b> in this lineup spot.</p>
  <div class="substitute-list">${available.length?available.map(r=>`<button class="substitute-player" data-sub-hitter="${esc(r.name)}"><span>${esc(r.name)}</span><strong>${esc(r.side)}</strong></button>`).join(""):`<div class="substitution-empty">Every rostered player is already in the lineup.</div>`}</div>
 </div></div>`;
}
function playerInfoModal(){
 const player=db.roster[infoPlayerIndex];
 if(!player)return '';
 const input=(label,key,type='text')=>`<label class="info-field"><span>${label}</span>${type==='textarea'?`<textarea data-info-field="${key}" rows="4">${esc(player[key]||'')}</textarea>`:`<input data-info-field="${key}" type="${type}" value="${esc(player[key]||'')}">`}</label>`;
 return `<div class="modal-backdrop"><div class="modal player-info-modal"><div class="modal-header"><div><div class="small info-kicker">PLAYER INFORMATION</div><h2>${esc(player.name)}</h2></div><button class="btn" data-close>Cancel</button></div>
  <p class="info-privacy">This information is saved only in HotB on this device. It is not added to the public website code.</p>
  <div class="info-grid">
   ${input('Jersey #','jersey')}${input('Graduation Year','grad')}${input('Positions','positions')}${input('GPA','gpa')}${input('High School','school')}${input('Intended College Major','interest')}
   ${input('Bats (R, L, or SL)','side')}${input('Throws (R or L)','throws')}${input('Player Email','email','email')}${input('Player Phone','phone','tel')}
   ${input('Twitter / X Full Link','twitter','url')}${input('SportsRecruits Full Link','sportsRecruits','url')}${input('Highlight Video Full Link','highlightVideo','url')}${input('NCAA ID','ncaaId')}
  </div>
  <h3 class="info-section-title">Pitching Statistics</h3>
  <p class="info-section-note">Enter these manually or copy them from GameChanger. They appear on Evaluation only when Positions includes P, RHP, LHP, or Pitcher.</p>
  <div class="info-grid">
   ${input('Innings Pitched (IP)','pitcherIP')}${input('ERA','pitcherERA')}${input('WHIP','pitcherWHIP')}${input('Strikeout-to-Walk Ratio (K/BB)','pitcherKBB')}${input('Opponent Batting Average (OBA)','pitcherOBA')}${input('Strike Percentage','pitcherStrikePct')}
  </div>
  ${input('Recruiting Statement','recruitingStatement','textarea')}${input('Accomplishments / Honors','accomplishments','textarea')}${input('Additional Notes','notes','textarea')}
  <button class="btn black block info-save" id="savePlayerInfo">Save Player Information</button>
 </div></div>`;
}
function playerMeasurementLines(player){
 const units={'Home to First':' sec','Pop Time':' sec','Overhand Throw':' mph','Exit Velocity':' mph','Fastball':' mph','Changeup':' mph','Broad Jump':' in'};
 return measurementTypes(player).flatMap(type=>{
  const values=db.measurements.filter(m=>m.player===player.name&&m.type===type).map(m=>Number(m.value)).filter(Number.isFinite);
  if(!values.length)return [];
  const best=['Home to First','Pop Time'].includes(type)?Math.min(...values):Math.max(...values);
  return [`• ${type}: ${formatMeasurementValue(type,best)}${units[type]||''}`];
 });
}
function emailSubject(player){
 const positions=cleanCell(player.positions).replace(/\s*\|\s*/g,'/');
 return `${player.name} | ${player.grad||'Grad Year'} | ${positions||'Positions'} | ${player.gpa||'—'} GPA | #${player.jersey||'—'}`;
}
function buildRecruitingEmail(player,details){
 const firstName=player.name.split(/\s+/)[0];
 const profile=[
  `• Positions: ${cleanCell(player.positions).replace(/\s*\|\s*/g,'/')}`,
  player.side||player.throws?`• Bats/Throws: ${recruitingBatSide(player)||'—'}/${player.throws||'—'}`:'',
  `• Jersey: #${player.jersey||'—'}`,
  player.school?`• High School: ${player.school}`:'',
  player.gpa?`• GPA: ${player.gpa}`:'',
  player.interest?`• Intended Major: ${player.interest}`:'',
  player.ncaaId?`• NCAA ID: ${player.ncaaId}`:''
 ].filter(Boolean);
 const sections=[];
 const greeting=/^coach\b/i.test(details.coachName)?details.coachName:`Coach ${details.coachName}`;
 sections.push(`${greeting},`);
 sections.push(`My name is Dan Lickel, and I am the head coach of KC Rebels 16U Regional Lickel. I would like to introduce you to ${player.name}, a ${player.grad} student-athlete who is interested in learning more about ${details.collegeName} and its softball program.`);
 if(details.personalNote)sections.push(details.personalNote);
 sections.push(`𝗣𝗟𝗔𝗬𝗘𝗥 𝗣𝗥𝗢𝗙𝗜𝗟𝗘\n${profile.join('\n')}`);
 const measurements=playerMeasurementLines(player);if(measurements.length)sections.push(`𝗔𝗧𝗛𝗟𝗘𝗧𝗜𝗖 𝗠𝗘𝗔𝗦𝗨𝗥𝗘𝗠𝗘𝗡𝗧𝗦\n${measurements.join('\n')}`);
 if(player.recruitingStatement)sections.push(`𝗣𝗟𝗔𝗬𝗘𝗥 𝗦𝗧𝗔𝗧𝗘𝗠𝗘𝗡𝗧\n${player.recruitingStatement}`);
 if(player.accomplishments)sections.push(`𝗔𝗖𝗖𝗢𝗠𝗣𝗟𝗜𝗦𝗛𝗠𝗘𝗡𝗧𝗦\n${player.accomplishments}`);
 const links=[];
 if(player.twitter)links.push(`Twitter/X: ${player.twitter}`);
 if(player.sportsRecruits)links.push(`SportsRecruits: ${player.sportsRecruits}`);
 if(player.highlightVideo)links.push(`Highlight Video: ${player.highlightVideo}`);
 links.push('Full 2026–27 Game Videos on GameChanger: https://web.gc.com/teams/K1E4TcPCwGKj/2027-summer-kc-rebels-16-regional-lickel');
 if(player.twitter||player.sportsRecruits)links.push(`Individual highlight videos are available through ${firstName}’s Twitter/X and SportsRecruits profiles.`);
 sections.push(`𝗥𝗘𝗖𝗥𝗨𝗜𝗧𝗜𝗡𝗚 𝗟𝗜𝗡𝗞𝗦\n${links.map(link=>`  • ${link}`).join('\n')}`);
 sections.push(`𝗙𝗔𝗟𝗟 𝟮𝟬𝟮𝟲 𝗦𝗖𝗛𝗘𝗗𝗨𝗟𝗘\nOctober 16–18\nTriple Crown St. Louis Showcase\nChesterfield, Missouri\n\nOctober 30–November 1\nTop Gun Select Invite\nKansas City Metro\n\nNovember 6–8\nRecruitLook Showcase\nKansas City Metro`);
 sections.push(`I believe ${firstName} would be a strong addition to a college program, both as a student-athlete and as a teammate. Please feel free to contact ${firstName} or me if you would like any additional information.`);
 sections.push('Thank you for your time and consideration.');
 sections.push('Dan Lickel\nHead Coach\nKC Rebels 16U Regional Lickel\n913-485-6576\nrecruiting@rebelssoftball.org');
 return {subject:emailSubject(player),body:sections.join('\n\n')};
}
function recruitingEmailModal(){
 const player=hitterObj(evalPlayer);
 const coaches=[...(db.coaches||[])].sort((a,b)=>(a.coachName||'').localeCompare(b.coachName||'',undefined,{sensitivity:'base'})||(a.collegeName||'').localeCompare(b.collegeName||''));
 const selectedCoach=(db.coaches||[]).find(coach=>coachEmailKey(coach.coachEmail)===coachEmailKey(recruitingEmail.selectedCoachEmail));
 const shortCollege=value=>String(value||'').replace(/\bUniversity\b/gi,'U');
 const updatedText=selectedCoach?.lastUpdated?`Last updated ${formatCoachUpdated(selectedCoach.lastUpdated)}`:'No changes saved on this device';
 return `<div class="modal-backdrop"><div class="modal recruiting-email-modal"><div class="modal-header"><div><div class="small info-kicker">RECRUITING EMAIL</div><h2>${esc(player.name)}</h2></div><button class="btn" data-close>Cancel</button></div>
  <div class="info-field"><span>Coach List</span><div class="coach-list-picker"><button class="coach-list-toggle" id="coachListToggle" type="button" aria-expanded="false"><b>${selectedCoach?esc(selectedCoach.coachName):'Choose a saved coach'}</b><small>${selectedCoach?esc(shortCollege(selectedCoach.collegeName)):'Alphabetical by first name'}</small></button><div class="coach-list-menu" id="coachListMenu" hidden>${coaches.map(coach=>`<button type="button" class="coach-list-option" data-coach-email="${esc(coach.coachEmail)}"><b>${esc(coach.coachName)}</b><span>${esc(shortCollege(coach.collegeName))}</span></button>`).join('')}</div></div></div>
  <label class="info-field coach-search-field"><span>Coach’s Name</span><input id="emailCoachName" value="${esc(recruitingEmail.coachName)}" placeholder="Example: Coach Smith" autocomplete="off"><div class="coach-search-results" id="coachNameMatches" hidden></div></label>
  <label class="info-field"><span>Coach’s Email</span><input id="emailCoachAddress" type="email" value="${esc(recruitingEmail.coachEmail)}" placeholder="coach@college.edu"></label>
  <label class="info-field coach-search-field"><span>College Name</span><input id="emailCollegeName" value="${esc(recruitingEmail.collegeName)}" placeholder="College or university" autocomplete="off"><div class="coach-search-results" id="collegeNameMatches" hidden></div></label>
  <div class="coach-save-row"><button class="btn black" id="saveCoachChanges" disabled>${selectedCoach?'Save Coach Changes':'Save New Coach'}</button><span id="coachLastUpdated">${esc(updatedText)}</span></div>
  <label class="info-field"><span>Optional Personal Note</span><textarea id="emailPersonalNote" rows="3" placeholder="Add a personal message for this coach if needed.">${esc(recruitingEmail.personalNote)}</textarea></label>
  <div class="email-preview-group"><button class="btn black block preview-recruiting-email" id="previewRecruitingEmail" disabled>Preview Email</button>
  <div class="email-copy-row"><span><b>CC:</b> ${esc(player.email||'No player email saved')}</span></div></div>
  <div class="email-template-actions"><button class="btn" id="downloadCoachTemplate">Download Coach Template</button><button class="btn" id="importCoachList">Import Coach List</button><input id="coachImportFile" type="file" accept=".xlsx,.xls,.csv" hidden></div>
 </div></div>`;
}
function recruitingEmailPreviewModal(){
 const player=hitterObj(evalPlayer);
 return `<div class="modal-backdrop"><div class="modal email-preview-modal"><div class="modal-header"><div><div class="small info-kicker">EMAIL PREVIEW</div><h2>${esc(player.name)}</h2></div><button class="btn" id="backToEmailSetup">Back</button></div>
  <div class="email-addresses"><div><b>To:</b> ${esc(recruitingEmail.coachEmail)}</div><div><b>CC:</b> ${esc(player.email||'None')}</div><div><b>Subject:</b> ${esc(recruitingEmail.subject)}</div></div>
  <label class="info-field"><span>Email Message — You Can Edit It Here</span><textarea id="emailBodyPreview" class="email-body-preview">${esc(recruitingEmail.body)}</textarea></label>
  <p class="email-note">Gmail will open a new draft. Confirm that recruiting@rebelssoftball.org is selected in the From field before sending.</p>
  <button class="btn red block" id="openGmailDraft">Open in Gmail</button>
 </div></div>`;
}
function importRosterModal(){
 const items=pendingRosterImport?.items||[];
 const updates=items.filter(item=>item.kind==='update');
 const additions=items.filter(item=>item.kind==='add');
 const unchanged=items.filter(item=>item.kind==='unchanged');
 return `<div class="modal-backdrop"><div class="modal import-preview-modal"><div class="modal-header"><div><div class="small info-kicker">IMPORT PREVIEW</div><h2>Player Information</h2></div><button class="btn" data-close>Cancel</button></div>
  <div class="import-counts"><div><b>${updates.length}</b><span>Players Updated</span></div><div><b>${additions.length}</b><span>Players Added</span></div><div><b>${unchanged.length}</b><span>No Changes</span></div></div>
  <p class="import-note">Blank cells will not erase information already saved in HotB.</p>
  <div class="import-player-list">${items.map(item=>`<div class="import-player ${item.kind}"><span>#${esc(item.data.jersey||item.player?.jersey||'—')}</span><b>${esc(item.data.name||item.player?.name)}</b><small>${item.kind==='update'?`${item.changes.length} field${item.changes.length===1?'':'s'} changing`:item.kind==='add'?'New player':'No changes'}</small></div>`).join('')}</div>
  <button class="btn black block" id="confirmRosterImport" ${updates.length||additions.length?'':'disabled'}>Import These Changes</button>
 </div></div>`;
}
async function unzipWorkbook(buffer){
 const bytes=new Uint8Array(buffer),view=new DataView(buffer);let end=-1;
 for(let i=bytes.length-22;i>=Math.max(0,bytes.length-65557);i--){if(view.getUint32(i,true)===0x06054b50){end=i;break}}
 if(end<0)throw new Error('That does not appear to be a valid Excel file.');
 const count=view.getUint16(end+10,true),decoder=new TextDecoder(),files={};let offset=view.getUint32(end+16,true);
 for(let i=0;i<count;i++){
  if(view.getUint32(offset,true)!==0x02014b50)break;
  const method=view.getUint16(offset+10,true),size=view.getUint32(offset+20,true),nameLength=view.getUint16(offset+28,true),extraLength=view.getUint16(offset+30,true),commentLength=view.getUint16(offset+32,true),local=view.getUint32(offset+42,true);
  const name=decoder.decode(bytes.slice(offset+46,offset+46+nameLength));
  if(name==='xl/sharedStrings.xml'||name==='xl/worksheets/sheet1.xml'){
   const localName=view.getUint16(local+26,true),localExtra=view.getUint16(local+28,true),start=local+30+localName+localExtra,compressed=bytes.slice(start,start+size);
   if(method===0)files[name]=compressed;
   else if(method===8){const stream=new Blob([compressed]).stream().pipeThrough(new DecompressionStream('deflate-raw'));files[name]=new Uint8Array(await new Response(stream).arrayBuffer())}
   else throw new Error('This Excel compression format is not supported.');
  }
  offset+=46+nameLength+extraLength+commentLength;
 }
 return Object.fromEntries(Object.entries(files).map(([name,data])=>[name,decoder.decode(data)]));
}
function spreadsheetRowsFromXml(files){
 const parser=new DOMParser(),shared=[];
 if(files['xl/sharedStrings.xml'])parser.parseFromString(files['xl/sharedStrings.xml'],'application/xml').querySelectorAll('si').forEach(si=>shared.push([...si.querySelectorAll('t')].map(t=>t.textContent).join('')));
 const xml=files['xl/worksheets/sheet1.xml'];if(!xml)throw new Error('The first worksheet could not be read.');
 const rows=[];parser.parseFromString(xml,'application/xml').querySelectorAll('sheetData row').forEach(row=>{
  const values=[];row.querySelectorAll('c').forEach(cell=>{
   const ref=cell.getAttribute('r')||'',letters=(ref.match(/[A-Z]+/)||['A'])[0];let column=0;for(const letter of letters)column=column*26+letter.charCodeAt(0)-64;column--;
   const type=cell.getAttribute('t'),raw=cell.querySelector('v')?.textContent??'',inline=cell.querySelector('is t')?.textContent??'';
   values[column]=type==='s'?(shared[Number(raw)]??''):type==='inlineStr'?inline:raw;
  });rows.push(values);
 });return rows;
}
function csvRows(text){
 const rows=[];let row=[],value='',quoted=false;
 for(let i=0;i<text.length;i++){const char=text[i];if(char==='"'){if(quoted&&text[i+1]==='"'){value+='"';i++}else quoted=!quoted}else if(char===','&&!quoted){row.push(value);value=''}else if((char==='\n'||char==='\r')&&!quoted){if(char==='\r'&&text[i+1]==='\n')i++;row.push(value);rows.push(row);row=[];value=''}else value+=char}
 if(value||row.length){row.push(value);rows.push(row)}return rows;
}
async function parseRosterWorkbook(file){
 let rows;
 if(file.name.toLowerCase().endsWith('.csv'))rows=csvRows(await file.text());
 else{
  const buffer=await file.arrayBuffer();
  if(window.XLSX){const workbook=XLSX.read(buffer,{type:'array'}),sheet=workbook.Sheets.Players||workbook.Sheets[workbook.SheetNames[0]];rows=XLSX.utils.sheet_to_json(sheet,{header:1,defval:'',raw:false})}
  else rows=spreadsheetRowsFromXml(await unzipWorkbook(buffer));
 }
  const headerIndex=rows.findIndex(row=>row.some(cell=>cleanCell(cell)==='Player Name'));
  if(headerIndex<0)throw new Error('The Player Name header was not found. Please use the HotB template.');
  const headers=rows[headerIndex].map(cleanCell);
  const missing=recruitingColumns.filter(([label])=>!headers.includes(label)).map(([label])=>label);
  if(missing.length)throw new Error(`The spreadsheet is missing: ${missing.join(', ')}.`);
  const items=[];
  rows.slice(headerIndex+1).forEach(row=>{
   const data={};
   playerInfoColumns.forEach(([label,key])=>data[key]=headers.includes(label)?cleanCell(row[headers.indexOf(label)]):'');
   if(!data.name)return;
   const matches=db.roster.map((player,index)=>({player,index})).filter(({player})=>normalizeName(player.name)===normalizeName(data.name));
   const exact=matches.find(({player})=>!data.jersey||cleanCell(player.jersey)===data.jersey);
   const match=exact||(matches.length===1?matches[0]:null);
   if(!match){items.push({kind:'add',data});return}
   const changes=playerInfoColumns.filter(([,key])=>data[key]&&cleanCell(match.player[key])!==data[key]).map(([,key])=>key);
   items.push({kind:changes.length?'update':'unchanged',data,player:match.player,index:match.index,changes});
  });
  if(!items.length)throw new Error('No player rows were found in the spreadsheet.');
  return {items};
}
function applyRosterImport(){
 (pendingRosterImport?.items||[]).forEach(item=>{
  if(item.kind==='unchanged')return;
  const target=item.kind==='add'?{name:item.data.name,side:item.data.side||'R',isGuest:true}:db.roster[item.index];
  playerInfoColumns.forEach(([,key])=>{if(item.data[key])target[key]=item.data[key]});
  if(item.kind==='add')db.roster.push(target);
 });
 save();pendingRosterImport=null;modal=null;render();
 alert('Player information imported successfully.');
}
function exportRosterWorkbook(){
 const headings=playerInfoColumns.map(([label])=>label);
 const rows=db.roster.map(player=>playerInfoColumns.map(([,key])=>player[key]||''));
 if(!window.XLSX){
  const csv=[headings,...rows].map(row=>row.map(value=>`"${String(value).replace(/"/g,'""')}"`).join(',')).join('\r\n');
  const link=document.createElement('a');link.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));link.download='HotB_Player_Recruiting_Information.csv';link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000);return;
 }
 const sheet=XLSX.utils.aoa_to_sheet([['HOTB PLAYER RECRUITING INFORMATION'],['Blank imported cells leave existing HotB information unchanged.'],[],headings,...rows]);
 sheet['!cols']=headings.map(label=>({wch:Math.min(48,Math.max(12,label.length+2))}));
 const workbook=XLSX.utils.book_new();XLSX.utils.book_append_sheet(workbook,sheet,'Players');
 XLSX.writeFile(workbook,'HotB_Player_Recruiting_Information.xlsx');
}
function coachEmailKey(value){return cleanCell(value).toLowerCase()}
function formatCoachUpdated(value){
 const date=new Date(value);return Number.isNaN(date.getTime())?'':date.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});
}
function rememberCoach(details,originalEmail=''){
 const key=coachEmailKey(details.coachEmail);if(!key)return;
 const originalKey=coachEmailKey(originalEmail),coaches=db.coaches||[];
 const original=originalKey?coaches.find(item=>coachEmailKey(item.coachEmail)===originalKey):null;
 const conflict=coaches.find(item=>item!==original&&coachEmailKey(item.coachEmail)===key);
 if(conflict)return {error:'That email address is already saved for another coach.'};
 const previousEmails=[...(Array.isArray(original?.previousEmails)?original.previousEmails:[])];
 if(originalKey&&originalKey!==key&&!previousEmails.includes(originalKey))previousEmails.push(originalKey);
 const coach={coachName:cleanCell(details.coachName),coachEmail:cleanCell(details.coachEmail),collegeName:cleanCell(details.collegeName),lastUpdated:new Date().toISOString(),previousEmails};
 const existing=original||coaches.find(item=>coachEmailKey(item.coachEmail)===key);
 if(existing)Object.assign(existing,coach);else coaches.push(coach);
 save();return {coach:existing||coach};
}
function coachTemplateWorkbook(){
 const headings=coachColumns.map(([label])=>label),sheet=XLSX.utils.aoa_to_sheet([['KC REBELS COACH DIRECTORY'],['Fill in one coach per row. Do not change the column headings.'],[],headings]);
 sheet['!cols']=[{wch:24},{wch:34},{wch:34}];
 const instructions=XLSX.utils.aoa_to_sheet([['HOW TO USE THIS TEMPLATE'],[],['1','Enter one college coach per row on the Coach Directory tab.'],['2','Coach Name, Coach Email, and School are required.'],['3','HotB uses Coach Email to recognize and update an existing coach.'],['4',"Save the file, then choose Import Coach List in HotB's Email window."]]);
 const workbook=XLSX.utils.book_new();XLSX.utils.book_append_sheet(workbook,sheet,'Coach Directory');XLSX.utils.book_append_sheet(workbook,instructions,'Instructions');return workbook;
}
function downloadCoachTemplate(){
 if(window.XLSX)XLSX.writeFile(coachTemplateWorkbook(),'KC_Rebels_Coach_Directory_Template.xlsx');
 else{const csv='Coach Name,Coach Email,School\r\n';const link=document.createElement('a');link.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));link.download='KC_Rebels_Coach_Directory_Template.csv';link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000)}
}
async function importCoachWorkbook(file){
 let rows;if(file.name.toLowerCase().endsWith('.csv'))rows=csvRows(await file.text());else{if(!window.XLSX)throw new Error('Excel import is not available right now. Please use a CSV file.');const workbook=XLSX.read(await file.arrayBuffer(),{type:'array'}),sheet=workbook.Sheets['Coach Directory']||workbook.Sheets[workbook.SheetNames[0]];rows=XLSX.utils.sheet_to_json(sheet,{header:1,defval:'',raw:false})}
 const headerIndex=rows.findIndex(row=>row.some(cell=>cleanCell(cell)==='Coach Name'));if(headerIndex<0)throw new Error('The Coach Name header was not found. Please use the HotB coach template.');
 const headers=rows[headerIndex].map(cleanCell),missing=coachColumns.filter(([label])=>!headers.includes(label)).map(([label])=>label);if(missing.length)throw new Error(`The spreadsheet is missing: ${missing.join(', ')}.`);
 let added=0,updated=0,skipped=0;
 rows.slice(headerIndex+1).forEach(row=>{const data={};coachColumns.forEach(([label,key])=>data[key]=cleanCell(row[headers.indexOf(label)]));if(!data.coachName&&!data.coachEmail&&!data.collegeName)return;if(!data.coachName||!data.coachEmail||!data.collegeName||!/^\S+@\S+\.\S+$/.test(data.coachEmail)){skipped++;return}const existing=db.coaches.find(coach=>coachEmailKey(coach.coachEmail)===coachEmailKey(data.coachEmail));if(existing){Object.assign(existing,data);updated++}else{db.coaches.push(data);added++}});
 save();render();alert(`Coach list imported. ${added} added, ${updated} updated${skipped?`, ${skipped} skipped because information was missing or invalid`:''}.`);
}
function modalView(){
 if(modal==='recoveryGuide')return recoveryGuideModal();
 if(modal==='cloudBackup')return cloudBackupModal();
 if(modal==='changePitcher')return pitcherChangeModal();
 if(modal==='changeHitter')return hitterChangeModal();
 if(modal==='playerInfo')return playerInfoModal();
 if(modal==='recruitingEmail')return recruitingEmailModal();
 if(modal==='recruitingEmailPreview')return recruitingEmailPreviewModal();
 if(modal==='importRoster')return importRosterModal();
 if(modal?.startsWith('ranking:'))return evalRankingModal(modal.slice(8));
 if(modal?.startsWith('pitchRanking:'))return pitcherRankingModal(modal.slice(13));
 if(modal==='HIT'||modal==='H4O')return hitModal(modal);
 if(modal==='reports')return reportModal();
 if(modal==='record')return recordModal();
 if(modal==='endGame'||modal==='discardConfirm')return gameActionModal(modal);
 if(modal?.startsWith('guide:'))return evalGuide(modal.slice(6));
 return '';
}
function bind(){
 $$('[data-go]').forEach(el=>el.onclick=()=>go(el.dataset.go));
 $$('[data-close]').forEach(el=>el.onclick=()=>{if(modal==='record'){if(timerInt)clearInterval(timerInt);timerInt=null;timerElapsed=0;recordType=''}modal=null;render()});
 if(route==='new')bindNew();
 if(route==='roster')bindRoster();
 if(route==='live')bindLive();
 if(route==='eval')bindEval();
 if(route==='reports')bindReportsPage();
 if(route==='practice')bindPractice();
 if(route==='portal')bindPlayerPortal();
 if(modal==='HIT'||modal==='H4O')bindContact();
 if(modal==='reports')bindReports();
 if(modal==='record')bindRecord();
 if(modal==='endGame'||modal==='discardConfirm')bindGameAction();
 if(modal==='changePitcher')bindPitcherChange();
 if(modal==='changeHitter')bindHitterChange();
 if(modal==='playerInfo')bindPlayerInfo();
 if(modal==='recruitingEmail')bindRecruitingEmail();
 if(modal==='recruitingEmailPreview')bindRecruitingEmailPreview();
 if(modal==='importRoster')$('#confirmRosterImport')?.addEventListener('click',applyRosterImport);
 if(modal==='cloudBackup')bindCloudBackup();
 $('#openCloudBackup')?.addEventListener('click',()=>{modal='cloudBackup';render()});
 $('#openRecoveryGuide')?.addEventListener('click',()=>{modal='recoveryGuide';render()});
}

function stopPracticeClock(){
 if(practiceClockTimer)clearInterval(practiceClockTimer);
 practiceClockTimer=null;practiceClock={running:false,finished:false,startAt:0,lastBlock:1};
 if('speechSynthesis'in window)window.speechSynthesis.cancel();
}
function speakPracticeClock(message,quiet=false){
 if(!('speechSynthesis'in window))return;
 const voice=new SpeechSynthesisUtterance(message);voice.rate=.92;voice.volume=quiet?0:1;
 window.speechSynthesis.cancel();window.speechSynthesis.speak(voice);
}
function updatePracticeClock(){
 if(!practicePlan||!practiceClock.running)return;
 const now=Date.now(),blockMs=practicePlan.blockMinutes*60000,totalMs=blockMs*10,elapsed=Math.max(0,now-practiceClock.startAt);
 const currentTime=$('#practiceCurrentTime'),currentBlock=$('#practiceCurrentBlock'),timeLeft=$('#practiceTimeLeft');
 if(currentTime)currentTime.textContent=practiceClockText(new Date(now));
 if(elapsed>=totalMs){
  if(currentBlock)currentBlock.textContent='DONE!';if(timeLeft)timeLeft.textContent='0:00';
  practiceClock.running=false;practiceClock.finished=true;if(practiceClockTimer)clearInterval(practiceClockTimer);practiceClockTimer=null;
  const endButton=$('#endPracticeClock');if(endButton)endButton.disabled=true;
  speakPracticeClock('Times Up, Good Practice, Please start to clean up');return;
 }
 const block=Math.floor(elapsed/blockMs)+1,remaining=Math.max(0,blockMs-(elapsed%blockMs)),seconds=Math.ceil(remaining/1000);
 if(block>practiceClock.lastBlock){practiceClock.lastBlock=block;speakPracticeClock('Ladies, Time to Rotate')}
 if(currentBlock)currentBlock.textContent=`${block} of 10`;
 if(timeLeft)timeLeft.textContent=`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;
}
function beginPracticeClock(){
 if(practiceClockTimer)clearInterval(practiceClockTimer);
 practiceClock={running:true,finished:false,startAt:Date.now(),lastBlock:1};
 speakPracticeClock('.',true);render();updatePracticeClock();practiceClockTimer=setInterval(updatePracticeClock,250);
}
function finishPracticeClock(){
 if(practiceClockTimer)clearInterval(practiceClockTimer);practiceClockTimer=null;
 practiceClock.running=false;practiceClock.finished=true;
 speakPracticeClock('Times Up, Good Practice, Please start to clean up');render();
}
function bindPlayerPortal(){
 $('#setupPlayerPortals')?.addEventListener('click',setupPlayerPortals);
 $$('[data-share-portal]').forEach(button=>button.addEventListener('click',async()=>{
  const player=db.roster.find(item=>item.name===button.dataset.sharePortal);if(!player?.portalId)return;
  const share={title:`${practiceFirstName(player.name)}’s HotB Player Portal`,text:`${practiceFirstName(player.name)}’s private HotB Player Portal\nPIN: ${player.portalPin}\n${playerPortalUrl(player)}`};
  try{if(navigator.share)await navigator.share(share);else{await navigator.clipboard.writeText(share.text);portalMessage='Portal link and PIN copied.';render()}}catch(error){if(error?.name!=='AbortError'){portalMessage='The portal link could not be shared from this device.';render()}}
 }));
 $$('[data-reset-portal]').forEach(button=>button.addEventListener('click',()=>resetPlayerPortal(db.roster.find(item=>item.name===button.dataset.resetPortal))));
 $('#openPlayerPortal')?.addEventListener('click',()=>claimPlayerPortal($('#portalPin')?.value));
 $('#portalPin')?.addEventListener('keydown',event=>{if(event.key==='Enter')claimPlayerPortal(event.currentTarget.value)});
 $('#portalDashboard')?.addEventListener('click',()=>{portalView='home';portalSelectedDrill='';portalDrillResults=[];render();window.scrollTo(0,0)});
 $('#portalBack')?.addEventListener('click',()=>{portalView='home';portalSelectedDrill='';render();window.scrollTo(0,0)});
 $$('[data-portal-view]').forEach(button=>button.addEventListener('click',()=>{portalView=button.dataset.portalView;portalSelectedDrill='';portalDrillQuery='';portalDrillResults=[];render();window.scrollTo(0,0)}));
 $('#portalDrillSearch')?.addEventListener('input',event=>{portalDrillQuery=event.target.value;render();const search=$('#portalDrillSearch');if(search){search.focus();search.setSelectionRange(search.value.length,search.value.length)}});
 $$('[data-portal-drill]').forEach(button=>button.addEventListener('click',()=>{portalSelectedDrill=button.dataset.portalDrill;render();window.scrollTo(0,0)}));
 $('#portalLibraryBack')?.addEventListener('click',()=>{portalSelectedDrill='';render();window.scrollTo(0,0)});
 $('#findPortalDrills')?.addEventListener('click',()=>{portalDrillQuery=$('#portalProblem')?.value.trim()||'';portalDrillResults=recommendPortalDrills(portalDrillQuery);render();window.scrollTo(0,0)});
 $$('[data-portal-recommendation]').forEach(button=>button.addEventListener('click',()=>{portalSelectedDrill=button.dataset.portalRecommendation;portalView='library';render();window.scrollTo(0,0)}));
}
function bindPractice(){
 $('#choosePracticeDrills')?.addEventListener('click',()=>{practiceDraftDrills=practiceChosenDrills.slice(0,practicePlan.drillStations);practiceDrillPickerOpen=true;practicePickerQuery='';practicePickerCategory='All Drills';render();window.scrollTo(0,0)});
 $('#cancelPracticeDrills')?.addEventListener('click',()=>{practiceDraftDrills=[];practiceDrillPickerOpen=false;render();window.scrollTo(0,0)});
 $('#practicePickerSearch')?.addEventListener('input',event=>{practicePickerQuery=event.target.value;render();const search=$('#practicePickerSearch');if(search){search.focus();search.setSelectionRange(search.value.length,search.value.length)}});
 $$('[data-picker-category]').forEach(button=>button.addEventListener('click',()=>{practicePickerCategory=button.dataset.pickerCategory;render();window.scrollTo(0,0)}));
 $$('[data-picker-drill]').forEach(button=>button.addEventListener('click',()=>{const drill=practiceSelectableDrills().find(item=>item.name===button.dataset.pickerDrill);if(!drill)return;const index=practiceDraftDrills.findIndex(item=>item.name===drill.name);if(index>=0)practiceDraftDrills.splice(index,1);else if(practiceDraftDrills.length<practicePlan.drillStations)practiceDraftDrills.push(drill);render()}));
 $('#savePracticeDrills')?.addEventListener('click',()=>{if(practiceDraftDrills.length!==practicePlan.drillStations)return;practiceChosenDrills=practiceDraftDrills.slice();practiceDraftDrills=[];practiceDrillPickerOpen=false;render();window.scrollTo(0,0)});
 $('#practiceHubBack')?.addEventListener('click',()=>{stopPracticeClock();practicePlan=null;practiceSection='hub';practiceFocusPlayer='';practiceSelectedDrill='';render();window.scrollTo(0,0)});
 $('#openPracticeBuilder')?.addEventListener('click',()=>{practiceSection='setup';render();window.scrollTo(0,0)});
 $('#openDrillLibrary')?.addEventListener('click',()=>{practiceSection='library';render();window.scrollTo(0,0)});
 $('#practiceDrillSearch')?.addEventListener('input',event=>{practiceDrillQuery=event.target.value;render();const search=$('#practiceDrillSearch');if(search){search.focus();search.setSelectionRange(search.value.length,search.value.length)}});
 $$('[data-drill-category]').forEach(button=>button.addEventListener('click',()=>{practiceDrillCategory=button.dataset.drillCategory;render();window.scrollTo(0,0)}));
 $$('[data-drill-name]').forEach(button=>button.addEventListener('click',()=>{practiceSelectedDrill=button.dataset.drillName;render();window.scrollTo(0,0)}));
 $('#backToDrillList')?.addEventListener('click',()=>{practiceSelectedDrill='';render();window.scrollTo(0,0)});
 $('#openPlayerFocus')?.addEventListener('click',()=>{practiceSection='player';practiceFocusPlayer='';render();window.scrollTo(0,0)});
 $$('[data-focus-player]').forEach(button=>button.addEventListener('click',()=>{practiceFocusPlayer=button.dataset.focusPlayer;render();window.scrollTo(0,0)}));
 $('#changeFocusPlayer')?.addEventListener('click',()=>{practiceFocusPlayer='';render();window.scrollTo(0,0)});
 $('#practiceSelectAll')?.addEventListener('click',()=>$$('[data-practice-player]').forEach(input=>input.checked=true));
 $('#practiceSelectNone')?.addEventListener('click',()=>$$('[data-practice-player]').forEach(input=>input.checked=false));
 $('#practiceStartTime')?.addEventListener('change',event=>{if(!event.target.value)return;const [hour,minute]=event.target.value.split(':').map(Number),displayHour=hour%12||12;$('#practiceStartTimeDisplay').textContent=`${displayHour}:${String(minute).padStart(2,'0')}${hour<12?'a':'p'}`});
 $('#generatePractice')?.addEventListener('click',()=>{
  const attendees=$$('[data-practice-player]:checked').map(input=>db.roster[Number(input.dataset.practicePlayer)]).filter(Boolean);
  if(!attendees.length){alert('Select at least one player attending practice.');return}
  if(!window.HotBPracticeScheduler){alert('The practice scheduler did not load. Close and reopen HotB, then try again.');return}
  const startTime=$('#practiceStartTime').value||'18:00',durationMinutes=Number($('#practiceDuration').value)||120;
  const practicePlayers=attendees.map(practicePlayerModel);
  const noPitchersMode=practicePlayers.some(player=>player.isPitcher)?null:(confirm('No pitchers are attending.\n\nPress OK to use Coach Pitch for live at-bats.\nPress Cancel to replace live with additional skill work.')?'coach':'skills');
  stopPracticeClock();practiceSetupState={selectedNames:attendees.map(player=>player.name),startTime,durationMinutes};practiceCoachOpen=false;practiceCardsOpen=false;practiceChosenDrills=[];practiceDraftDrills=[];practiceDrillPickerOpen=false;
  practicePlan=window.HotBPracticeScheduler.buildSchedule(practicePlayers,startTime,durationMinutes,{noPitchersMode});
  practicePlan.portalDraftId=crypto.randomUUID();
  const errors=window.HotBPracticeScheduler.validate(practicePlan);
  if(errors.length)practicePlan.warnings.push(...errors);
  render();window.scrollTo(0,0);
 });
 $('#editPracticePlayers')?.addEventListener('click',()=>{stopPracticeClock();practiceSetupState={selectedNames:practicePlan.players.map(player=>player.name),startTime:practicePlan.startTime,durationMinutes:practicePlan.durationMinutes};practicePlan=null;practiceSection='setup';render();window.scrollTo(0,0)});
 $('#togglePracticeCoach')?.addEventListener('click',()=>{practiceCoachOpen=!practiceCoachOpen;if(practiceCoachOpen)practiceCardsOpen=false;render();window.scrollTo(0,0);if(practiceClock.running)updatePracticeClock()});
 $('#togglePracticeCards')?.addEventListener('click',()=>{practiceCardsOpen=!practiceCardsOpen;if(practiceCardsOpen)practiceCoachOpen=false;render();window.scrollTo(0,0);if(practiceClock.running)updatePracticeClock()});
 $('#startPracticeClock')?.addEventListener('click',beginPracticeClock);
 $('#endPracticeClock')?.addEventListener('click',finishPracticeClock);
 $('#activatePlayerPlans')?.addEventListener('click',activatePlayerPlans);
 $('#deactivatePlayerPlans')?.addEventListener('click',deactivatePlayerPlans);
 $('#printPracticeCards')?.addEventListener('click',()=>window.print());
}

function recoveryGuideModal(){
 return `<div class="modal-backdrop"><div class="modal recovery-guide-modal"><div class="modal-header"><div><div class="small info-kicker">OWNER SAFETY GUIDE</div><h2>HotB Recovery Guide</h2></div><button class="btn" data-close>Close</button></div>
  <section><h3>Where everything lives</h3><p><b>App code:</b> GitHub repository KCRebels/HotB-Rebuild<br><b>Live app:</b> GitHub Pages<br><b>Team data:</b> This device plus Firebase project HotB KC Rebels<br><b>Backup account:</b> hotbkcrebels@gmail.com</p></section>
  <section><h3>If this phone is lost</h3><ol><li>Open the official HotB website on the replacement device.</li><li>Open Cloud Backup and sign in.</li><li>Check the backup date, then choose Restore From Cloud.</li><li>Verify the roster, games, reports and measurements.</li></ol></section>
  <section><h3>Before a major update</h3><ol><li>Open Cloud Backup.</li><li>Tap Back Up Now and wait for completion.</li><li>Publish only from the current GitHub main branch.</li><li>Keep the last working GitHub version available for rollback.</li></ol></section>
  <section><h3>If backup fails</h3><p>Keep using the same device. Do not delete the Home Screen app or clear Safari website data. Record the exact error, reconnect to the internet and try Back Up Now again.</p></section>
  <section><h3>If a ChatGPT conversation ends</h3><p>In the new conversation, provide the GitHub repository, Firebase project, backup email and this guide. Ask it to inspect the current main branch before changing anything.</p></section>
  <div class="recovery-warning"><b>Never do these without a current backup:</b> delete the Home Screen app, clear Safari website data, restore onto the primary phone merely as a test, or publish from an older copy of the code.</div>
  <p class="small">The complete guide is stored in GitHub as HOTB_RECOVERY_GUIDE.md. It contains no passwords.</p></div></div>`;
}

function cloudBackupModal(){
 const enabled=localStorage.getItem(CLOUD_ENABLED_KEY)==='true',last=cloudLastBackup?cloudLastBackup.toLocaleString():'No cloud backup yet';
  return `<div class="modal-backdrop"><div class="modal cloud-modal"><div class="modal-header"><div><div class="small info-kicker">DATA PROTECTION</div><h2>Cloud Backup</h2></div><button class="btn" data-close>Close</button></div><p class="cloud-explain">Your HotB data stays on this device. After the first successful backup, HotB will also save changes securely to Firebase.</p><div class="cloud-status"><b>${cloudUser?esc(cloudUser.email):'Not signed in'}</b><span>Last successful backup: ${esc(last)}</span>${cloudUser?`<span>Historical daily copies: ${cloudSnapshotCount} of 30</span>`:''}</div>${cloudMessage?`<p class="cloud-message">${esc(cloudMessage)}</p>`:''}${!cloudUser?`<label class="label" for="cloudPassword">HotB Backup Password</label><input class="input" id="cloudPassword" type="password" autocomplete="current-password" placeholder="At least 6 characters"><p class="small">Use a password for HotB backup. Do not enter your Gmail password.</p><button class="btn black block" id="cloudEmailSignIn" ${cloudBusy?'disabled':''}>Sign In</button><button class="btn block" id="cloudCreateLogin" ${cloudBusy?'disabled':''}>First Time: Create Login</button>`:`<button class="btn red block" id="cloudBackupNow" ${cloudBusy?'disabled':''}>${enabled?'Back Up Now':'Create First Backup'}</button><button class="btn block" id="cloudRestore" ${cloudBusy||!cloudLastBackup?'disabled':''}>Restore From Cloud</button><button class="btn block" id="cloudDownloadBackup">Download Backup File</button><button class="btn block cloud-signout" id="cloudSignOut" ${cloudBusy?'disabled':''}>Sign Out</button>`}<p class="small">HotB keeps the latest backup plus up to 30 daily historical copies. Restore never happens automatically.</p></div></div>`;
}
function bindCloudBackup(){
 $('#cloudEmailSignIn')?.addEventListener('click',()=>cloudPasswordAuth(false));$('#cloudCreateLogin')?.addEventListener('click',()=>cloudPasswordAuth(true));$('#cloudBackupNow')?.addEventListener('click',()=>backupToCloud(false));$('#cloudRestore')?.addEventListener('click',restoreFromCloud);$('#cloudDownloadBackup')?.addEventListener('click',exportFullBackup);$('#cloudSignOut')?.addEventListener('click',async()=>{await cloudAuth.signOut();cloudMessage='Signed out.';render()});
}
function bindNew(){
 const sels=$$('.batting-select');
 const opponent=$('#opponent'),pitcherName=$('#pitcherName'),pitcherNumber=$('#pitcherNumber'),opponentMenu=$('#opponentMenu'),pitcherMenu=$('#pitcherMenu');
 const update=()=>{
  const selections=sels.map(s=>s.value);
  sels.forEach((s,i)=>{
   const current=selections[i];
   const used=new Set(selections.filter((v,j)=>j!==i&&v));
   const available=db.roster.filter(r=>!used.has(r.name));
   s.innerHTML=`<option value="">Select hitter</option>${available.map(r=>`<option value="${esc(r.name)}">${esc(r.name)} (${r.side})</option>`).join('')}`;
   s.value=current;
  });
  const vals=selections.filter(Boolean);
  $('#hitterCount').textContent=`${vals.length} hitters`;
  $('#startGame').disabled=!(vals.length&&opponent.value.trim()&&pitcherName.value.trim()&&pitcherNumber.value.trim());
 };
 ['input','change'].forEach(evt=>[opponent,pitcherName,pitcherNumber,...sels].forEach(x=>x?.addEventListener(evt,update)));
 const filterMenu=(input,menu)=>{const query=normalizeName(input.value);[...menu.children].forEach(button=>button.hidden=!!query&&!normalizeName(button.textContent).includes(query));menu.hidden=false};
 opponent.addEventListener('focus',()=>filterMenu(opponent,opponentMenu));pitcherName.addEventListener('focus',()=>filterMenu(pitcherName,pitcherMenu));
 opponent.addEventListener('click',()=>filterMenu(opponent,opponentMenu));pitcherName.addEventListener('click',()=>filterMenu(pitcherName,pitcherMenu));
 opponent.addEventListener('input',()=>filterMenu(opponent,opponentMenu));pitcherName.addEventListener('input',()=>filterMenu(pitcherName,pitcherMenu));
 [opponent,pitcherName].forEach(input=>input.addEventListener('blur',()=>setTimeout(()=>{opponentMenu.hidden=true;pitcherMenu.hidden=true},120)));
 $$('[data-matchup-open]').forEach(button=>{
  button.onpointerdown=event=>event.preventDefault();
  button.onclick=()=>{
   const isOpponent=button.dataset.matchupOpen==='opponent',menu=isOpponent?opponentMenu:pitcherMenu,otherMenu=isOpponent?pitcherMenu:opponentMenu,shouldOpen=menu.hidden;
   otherMenu.hidden=true;
   if(shouldOpen){[...menu.children].forEach(choice=>choice.hidden=false);menu.hidden=false}
   else menu.hidden=true;
  };
 });
 $$('[data-opponent-choice]').forEach(button=>button.onpointerdown=event=>{event.preventDefault();opponent.value=button.dataset.opponentChoice;opponentMenu.hidden=true;update()});
 $$('[data-pitcher-choice]').forEach(button=>button.onpointerdown=event=>{event.preventDefault();pitcherName.value=button.dataset.pitcherChoice;pitcherNumber.value=button.dataset.pitcherNumber||'';pitcherMenu.hidden=true;update()});
 $$('[data-delete-opponent]').forEach(button=>button.onpointerdown=event=>{
  event.preventDefault();event.stopPropagation();
  const team=button.dataset.deleteOpponent;
  if(!confirm(`Remove ${team} from the saved opponent list? Previous games and hitter data will not be changed.`))return;
  db.teams=(db.teams||[]).filter(item=>item!==team);
  if(opponent.value===team)opponent.value='';
  save();button.closest('.matchup-picker-option')?.remove();update();
 });
 $$('[data-delete-pitcher-name]').forEach(button=>button.onpointerdown=event=>{
  event.preventDefault();event.stopPropagation();
  const name=button.dataset.deletePitcherName,number=button.dataset.deletePitcherNumber||'';
  if(!confirm(`Remove ${name}${number?` #${number}`:''} from the saved pitcher list? Previous games and hitter data will not be changed.`))return;
  db.pitchers=(db.pitchers||[]).filter(item=>!(item.name===name&&String(item.number||'')===number));
  if(pitcherName.value===name&&String(pitcherNumber.value||'')===number){pitcherName.value='';pitcherNumber.value=''}
  save();button.closest('.matchup-picker-option')?.remove();update();
 });
 pitcherName.addEventListener('change',()=>{
   const p=db.pitchers.find(p=>p.name===pitcherName.value);if(p&&!pitcherNumber.value)pitcherNumber.value=p.number||'';
   update();
 });
 $('#startGame').onclick=()=>{
  const order=sels.map(s=>s.value).filter(Boolean);
  createGame(opponent.value.trim(),pitcherName.value.trim(),pitcherNumber.value.trim(),order);go('live');
 };
}
function bindReportsPage(){
 $('#openSavedReports')?.addEventListener('click',()=>{modal='reports';reportMode='saved';render()});
 bindDateFilters('saved');
 $$('[data-view-game]').forEach(button=>button.onclick=()=>{reportGameId=button.dataset.viewGame;reportMode='game';reportFilterHitter='All Hitters';modal='reports';render()});
 $$('[data-delete-game]').forEach(button=>button.onclick=()=>{
  const game=db.savedGames.find(item=>item.id===button.dataset.deleteGame);if(!game)return;
  if(!confirm(`Delete the saved game against ${game.opponent||'Opponent'} from ${new Date(game.date).toLocaleDateString()}? This cannot be undone.`))return;
  db.savedGames=db.savedGames.filter(item=>item.id!==game.id);save();render();
 });
 $('#exportFullBackup')?.addEventListener('click',exportFullBackup);
 $('#restoreFullBackup')?.addEventListener('click',()=>$('#fullBackupFile').click());
 $('#fullBackupFile')?.addEventListener('change',async event=>{
  const file=event.target.files?.[0];if(!file)return;
  try{await restoreFullBackup(file)}catch(error){alert(error.message||'HotB could not restore that backup.')}
 });
}
function bindRoster(){
 $$('.sidebtn').forEach(b=>b.onclick=()=>{db.roster[+b.dataset.i].side=b.dataset.side;save();render()});
 $$('[data-del]').forEach(b=>b.onclick=()=>{if(confirm('Remove this player?')){db.roster.splice(+b.dataset.del,1);save();render()}});
 $$('[data-info]').forEach(b=>b.onclick=()=>{syncRosterNames();infoPlayerIndex=+b.dataset.info;save();modal='playerInfo';render()});
 $('#addPlayer').onclick=()=>{db.roster.push({name:'Guest',side:'R',jersey:'',grad:'',positions:'',gpa:'',interest:'',school:'',isGuest:true});save();render();setTimeout(()=>window.scrollTo(0,document.body.scrollHeight),0)};
 $('#saveRoster').onclick=()=>{syncRosterNames();save();go('home')};
 $('#importRosterInfo').onclick=()=>{syncRosterNames();save();$('#rosterInfoFile').click()};
 $('#rosterInfoFile').onchange=async event=>{
  const file=event.target.files?.[0];if(!file)return;
  try{pendingRosterImport=await parseRosterWorkbook(file);modal='importRoster';render()}catch(error){alert(error.message||'HotB could not read that spreadsheet.')}
 };
 $('#exportRosterInfo').onclick=()=>{syncRosterNames();save();exportRosterWorkbook()};
}
function bindPlayerInfo(){
 $('#savePlayerInfo').onclick=()=>{
  const player=db.roster[infoPlayerIndex];if(!player)return;
  $$('[data-info-field]').forEach(field=>player[field.dataset.infoField]=field.value.trim());
  if(!['R','L','SL'].includes(player.side.toUpperCase()))player.side='R';else player.side=player.side.toUpperCase();
  player.throws=(player.throws||'').toUpperCase();
  save();modal=null;render();
 };
}
function bindRecruitingEmail(){
 const coachName=$('#emailCoachName'),coachEmail=$('#emailCoachAddress'),collegeName=$('#emailCollegeName'),note=$('#emailPersonalNote'),preview=$('#previewRecruitingEmail');
 const coachListToggle=$('#coachListToggle'),coachListMenu=$('#coachListMenu'),nameMatches=$('#coachNameMatches'),collegeMatches=$('#collegeNameMatches'),saveCoachButton=$('#saveCoachChanges'),updatedLabel=$('#coachLastUpdated');
 const update=()=>{
  recruitingEmail.coachName=coachName.value.trim();recruitingEmail.coachEmail=coachEmail.value.trim();recruitingEmail.collegeName=collegeName.value.trim();recruitingEmail.personalNote=note.value.trim();
  const invalid=!recruitingEmail.coachName||!recruitingEmail.coachEmail||!recruitingEmail.collegeName||!coachEmail.validity.valid;
  preview.disabled=invalid;saveCoachButton.disabled=invalid;
 };
 [coachName,coachEmail,collegeName,note].forEach(field=>field.addEventListener('input',update));update();
 const chooseCoach=coach=>{recruitingEmail.selectedCoachEmail=coach.coachEmail;coachName.value=coach.coachName;coachEmail.value=coach.coachEmail;collegeName.value=coach.collegeName;coachListToggle.querySelector('b').textContent=coach.coachName;coachListToggle.querySelector('small').textContent=String(coach.collegeName||'').replace(/\bUniversity\b/gi,'U');coachListToggle.setAttribute('aria-expanded','false');coachListMenu.hidden=true;saveCoachButton.textContent='Save Coach Changes';updatedLabel.textContent=coach.lastUpdated?`Last updated ${formatCoachUpdated(coach.lastUpdated)}`:'No changes saved on this device';nameMatches.hidden=true;collegeMatches.hidden=true;update()};
 const showCoachMatches=(input,container,key)=>{
  const query=normalizeName(input.value);container.replaceChildren();
  if(!query){container.hidden=true;return}
  const matches=[...(db.coaches||[])].filter(coach=>normalizeName(coach[key]).includes(query)).sort((a,b)=>{
   const aStart=normalizeName(a[key]).startsWith(query),bStart=normalizeName(b[key]).startsWith(query);return Number(bStart)-Number(aStart)||(a[key]||'').localeCompare(b[key]||'');
  }).slice(0,8);
  matches.forEach(coach=>{const button=document.createElement('button');button.type='button';button.className='coach-search-result';const primary=document.createElement('b'),secondary=document.createElement('span');primary.textContent=coach.coachName;secondary.textContent=`${coach.collegeName} · ${coach.coachEmail}`;button.append(primary,secondary);button.addEventListener('pointerdown',event=>{event.preventDefault();chooseCoach(coach)});container.append(button)});
  container.hidden=!matches.length;
 };
 coachName.addEventListener('input',()=>showCoachMatches(coachName,nameMatches,'coachName'));
 collegeName.addEventListener('input',()=>showCoachMatches(collegeName,collegeMatches,'collegeName'));
 coachName.addEventListener('focus',()=>showCoachMatches(coachName,nameMatches,'coachName'));
 collegeName.addEventListener('focus',()=>showCoachMatches(collegeName,collegeMatches,'collegeName'));
 [coachName,collegeName].forEach(input=>input.addEventListener('blur',()=>setTimeout(()=>{nameMatches.hidden=true;collegeMatches.hidden=true},100)));
 coachListToggle.onclick=()=>{coachListMenu.hidden=!coachListMenu.hidden;coachListToggle.setAttribute('aria-expanded',String(!coachListMenu.hidden))};
 $$('.coach-list-option').forEach(button=>button.onclick=()=>{const coach=db.coaches.find(item=>coachEmailKey(item.coachEmail)===coachEmailKey(button.dataset.coachEmail));if(coach)chooseCoach(coach)});
 saveCoachButton.onclick=()=>{
  update();const result=rememberCoach(recruitingEmail,recruitingEmail.selectedCoachEmail);
  if(result?.error){alert(result.error);return}
  recruitingEmail.selectedCoachEmail=result.coach.coachEmail;saveCoachButton.textContent='Save Coach Changes';updatedLabel.textContent=`Last updated ${formatCoachUpdated(result.coach.lastUpdated)}`;alert('Coach information saved.');render();
 };
 $('#downloadCoachTemplate').onclick=downloadCoachTemplate;
 $('#importCoachList').onclick=()=>$('#coachImportFile').click();
 $('#coachImportFile').onchange=async event=>{const file=event.target.files[0];if(!file)return;try{await importCoachWorkbook(file)}catch(error){alert(error.message||'HotB could not read that coach spreadsheet.')}};
 preview.onclick=()=>{
  update();const saved=rememberCoach(recruitingEmail,recruitingEmail.selectedCoachEmail);if(saved?.error){alert(saved.error);return}recruitingEmail.selectedCoachEmail=saved.coach.coachEmail;const player=hitterObj(evalPlayer),built=buildRecruitingEmail(player,recruitingEmail);
  recruitingEmail.subject=built.subject;recruitingEmail.body=built.body;modal='recruitingEmailPreview';render();
 };
}
function bindRecruitingEmailPreview(){
 $('#backToEmailSetup').onclick=()=>{recruitingEmail.body=$('#emailBodyPreview').value;modal='recruitingEmail';render()};
 $('#openGmailDraft').onclick=()=>{
  const player=hitterObj(evalPlayer),body=$('#emailBodyPreview').value;
  recruitingEmail.body=body;
  const cc=player.email?`&cc=${encodeURIComponent(player.email)}`:'';
  window.location.href=`mailto:${encodeURIComponent(recruitingEmail.coachEmail)}?subject=${encodeURIComponent(recruitingEmail.subject)}${cc}&body=${encodeURIComponent(body)}`;
 };
}
function bindLive(){
 const g=currentGame();
 $('.live-app')?.addEventListener('click',event=>{
  const button=event.target.closest('button');
  if(button&&button.id!=='undo'&&!button.matches('[data-zone],[data-result]')&&g.pendingZone){g.pendingZone=null;save()}
 },true);
 const percentMode=!g.firstPitchView&&(g.zoneScope==='TEAM'||g.previewNext||(g.historyTab==='ALL'&&(g.allView||'DOTS')==='PCT'));
 $$('[data-plan]').forEach(b=>b.onclick=()=>{
   g.plan=b.dataset.plan;
   db.planPreferences=db.planPreferences||{};
   db.planPreferences[currentHitter(g).name]=b.dataset.plan;
   save();render();
 });
 $$('[data-outs]').forEach(b=>b.onclick=()=>{g.outs=+b.dataset.outs;save();render()});
 $$('[data-runner]').forEach(b=>b.onclick=()=>{const n=+b.dataset.runner;g.runners=g.runners.includes(n)?g.runners.filter(x=>x!==n):[...g.runners,n];save();render()});
 $$('[data-ptype]').forEach(b=>b.onclick=()=>{g.pitchType=b.dataset.ptype;save();render()});
 $$('[data-zone]').forEach(z=>z.onclick=()=>{g.historyTab='LIVE';g.zoneScope='HITTER';g.previewNext=false;g.firstPitchView=false;g.allView='DOTS';g.showAi=false;g.pendingZone=z.dataset.zone;save();render()});
 $$('[data-tab]').forEach(b=>b.onclick=()=>{const tab=b.dataset.tab;if(tab==='ALL'){if(g.historyTab!=='ALL'){g.historyTab='ALL';g.allView='DOTS'}else{g.allView=(g.allView||'DOTS')==='DOTS'?'PCT':'DOTS';if(g.allView==='PCT')g.zoneFilter='K'}}else{g.historyTab=tab}g.zoneScope='HITTER';g.previewNext=false;g.firstPitchView=false;save();render()});
 $('#zoneScope').onclick=()=>{const team=(g.zoneScope||'HITTER')!=='TEAM';g.zoneScope=team?'TEAM':'HITTER';g.zoneFilter='K';g.previewNext=false;g.historyTab='LIVE';g.firstPitchView=false;g.showAi=false;save();render()};
 $('#zoneNext').onclick=()=>{if(g.battingOrder.length<2)return;g.previewNext=!g.previewNext;g.zoneScope='HITTER';g.zoneFilter='K';g.historyTab='LIVE';g.firstPitchView=false;g.showAi=false;save();render()};
 $('#fpsBtn').onclick=()=>{g.firstPitchView=!g.firstPitchView;g.zoneScope='HITTER';g.previewNext=false;g.showAi=false;save();render()};
 $$('[data-result]').forEach(b=>b.onclick=()=>{
   const r=b.dataset.result;
   if(percentMode){if(r!=='HBP'){g.zoneFilter=r==='KL'?'K':r;save();render()}return}
   if(g.previewNext||g.historyTab==='ALL'||g.firstPitchView)return;
   if(!g.pendingZone && !['HBP'].includes(r)){alert('Select a pitch location first.');return}
   if(r==='HIT'||r==='H4O'){modal=r;render()} else addPitch(r);
 });
 $('#undo').onclick=undo;
 $('#openProfile').onclick=()=>{evalPlayer=currentHitter(g).name;go('eval')};
 $('#openReports').onclick=()=>{modal='reports';reportMode='current';render()};
 $('#endGame').onclick=()=>{modal='endGame';render()};
 $('#aiBtn').onclick=()=>{g.showAi=!g.showAi;g.zoneScope='HITTER';g.previewNext=false;g.historyTab='LIVE';g.firstPitchView=false;save();render()};
 $('#changePitcher').onclick=()=>{modal='changePitcher';render()};
 $('#changeHitter').onclick=()=>{modal='changeHitter';render()};
}
function bindPitcherChange(){
 const g=currentGame(), name=$('#subPitcherName'), number=$('#subPitcherNumber'), saveButton=$('#savePitcherChange');
 const update=()=>{saveButton.disabled=!name.value.trim()&&!number.value.trim()};
 $$('[data-saved-pitcher-name]').forEach(button=>button.onclick=()=>{name.value=button.dataset.savedPitcherName;number.value=button.dataset.savedPitcherNumber;update()});
 name.addEventListener('input',update);number.addEventListener('input',update);
 name.addEventListener('change',()=>{
  const known=knownPitchersForOpponent(g.opponent).find(p=>p.name===name.value);
  if(known&&!number.value)number.value=known.number||'';
  update();
 });
 saveButton.onclick=()=>{
  const pitcherName=name.value.trim(),pitcherNumber=number.value.trim();
  g.pitcherName=pitcherName;g.pitcherNumber=pitcherNumber;
  g.pitchersUsed=g.pitchersUsed||[];
  g.pitchersUsed.push({name:pitcherName,number:pitcherNumber,enteredAt:Date.now(),pitchIndex:g.pitches.length});
  rememberPitcher(g.opponent,pitcherName,pitcherNumber);
  modal=null;save();render();
 };
}
function bindHitterChange(){
 $$("[data-sub-hitter]").forEach(button=>button.onclick=()=>{
  const g=currentGame(),outgoing=currentHitter(g).name,incoming=button.dataset.subHitter;
  g.pitches.filter(p=>p.pa===g.paNumber&&p.hitter===outgoing).forEach(p=>p.hitter=incoming);
  g.battingOrder[g.currentIdx]=incoming;
  g.hittersUsed=[...new Set([...(g.hittersUsed||g.battingOrder),outgoing,incoming])];
  g.hitterSubstitutions=g.hitterSubstitutions||[];
  g.hitterSubstitutions.push({out:outgoing,in:incoming,lineupIndex:g.currentIdx,pa:g.paNumber,ts:Date.now()});
  g.plan=planFor(incoming);g.pendingZone=null;g.historyTab='LIVE';g.previewNext=false;g.firstPitchView=false;g.showAi=false;
  modal=null;save();render();
 });
}
function bindGameAction(){
 $('#saveAndExit')?.addEventListener('click',()=>{
   const g=currentGame();
   if(!g)return;
   g.ended=true;
   db.savedGames.push(structuredClone(g));
   db.currentGame=null;
   modal=null;
   save();
   go('home');
 });
 $('#discardGame')?.addEventListener('click',()=>{modal='discardConfirm';render()});
 $('#cancelDiscard')?.addEventListener('click',()=>{modal='endGame';render()});
 $('#confirmDiscard')?.addEventListener('click',()=>{
   db.currentGame=null;
   modal=null;
   save();
   go('home');
 });
}
function bindContact(){
 let st={fielder:null,contact:null,batted:null,hitType:null,outType:null,rbiCount:0,strength:null,quals:new Set()};
 $$('[data-fielder]').forEach(b=>b.onclick=()=>{$$('[data-fielder]').forEach(x=>x.classList.remove('active'));b.classList.add('active');st.fielder=+b.dataset.fielder;update()});
 $$('[data-contact]').forEach(b=>b.onclick=()=>{$$('[data-contact]').forEach(x=>x.classList.remove('active'));b.classList.add('active');st.contact=b.dataset.contact;update()});
 $$('[data-batted]').forEach(b=>b.onclick=()=>{$$('[data-batted]').forEach(x=>x.classList.remove('active'));b.classList.add('active');st.batted=b.dataset.batted;update()});
 $$('[data-hit]').forEach(b=>b.onclick=()=>{$$('[data-hit]').forEach(x=>x.classList.remove('active'));b.classList.add('active');st.hitType=b.dataset.hit;['E','FC','SAC'].forEach(q=>st.quals.delete(q));$$('[data-qual]').filter(x=>['E','FC','SAC'].includes(x.dataset.qual)).forEach(x=>x.classList.remove('active'));update()});
 $$('[data-outtype]').forEach(b=>b.onclick=()=>{$$('[data-outtype]').forEach(x=>x.classList.remove('active'));b.classList.add('active');st.outType=b.dataset.outtype;update()});
 $$('[data-qual]').forEach(b=>b.onclick=()=>{const q=b.dataset.qual;if(st.quals.has(q)){st.quals.delete(q);b.classList.remove('active')}else{if(['E','FC','SAC'].includes(q)){['E','FC','SAC'].forEach(x=>st.quals.delete(x));$$('[data-qual]').filter(x=>['E','FC','SAC'].includes(x.dataset.qual)).forEach(x=>x.classList.remove('active'));st.hitType=null;$$('[data-hit]').forEach(x=>x.classList.remove('active'))}if(q==='RBA'){st.rbiCount=0;const rbi=$('[data-rbi-open]');rbi.textContent='RBI';rbi.classList.remove('active')}st.quals.add(q);b.classList.add('active')}update()});
 $('[data-rbi-open]').onclick=()=>{$('.rbi-picker').hidden=false};
 $('[data-rbi-cancel]').onclick=()=>{$('.rbi-picker').hidden=true};
 $$('[data-rbi-count]').forEach(b=>b.onclick=()=>{st.rbiCount=Number(b.dataset.rbiCount);st.quals.delete('RBA');$('[data-qual="RBA"]')?.classList.remove('active');const rbi=$('[data-rbi-open]');rbi.textContent=`RBI ${st.rbiCount}`;rbi.classList.add('active');$('.rbi-picker').hidden=true;update()});
 $$('[data-strength]').forEach(b=>b.onclick=()=>{const strength=b.dataset.strength;st.strength=st.strength===strength?null:strength;$$('[data-strength]').forEach(x=>x.classList.toggle('active',x.dataset.strength===st.strength));update()});
 const update=()=>{const special=['E','FC','SAC'].some(q=>st.quals.has(q));$('#saveContact').disabled=!(st.fielder&&(modal==='H4O'?(st.contact&&st.outType):(st.contact&&st.batted&&(st.hitType||special))))};
 $('#saveContact').onclick=()=>{const kind=st.quals.has('E')?'E':st.quals.has('FC')?'FC':st.quals.has('SAC')?'SAC':modal;modal=null;addPitch(kind,{fielder:st.fielder,contactType:st.batted||st.outType,hitType:st.hitType||'',bunt:st.contact==='BUNT',slap:st.contact==='SLAP',rbiCount:st.rbiCount,rba:st.quals.has('RBA'),sac:st.quals.has('SAC'),error:st.quals.has('E'),fc:st.quals.has('FC'),hhb:st.strength==='HHB',weak:st.strength==='WEAK'})};
}
function bindReports(){
 $$('[data-rmode]').forEach(b=>b.onclick=()=>{reportMode=b.dataset.rmode;reportGameId=null;reportSelectedPaId=null;render()});
 bindDateFilters('report');
 $$('[data-rsub]').forEach(b=>b.onclick=()=>{reportSub=b.dataset.rsub;render()});
 $('#reportHitter').onchange=e=>{reportFilterHitter=e.target.value;reportSelectedPaId=null;render()};
 $$('[data-report-pa]').forEach(button=>button.onclick=()=>{
  reportSelectedPaId=reportSelectedPaId===button.dataset.reportPa?null:button.dataset.reportPa;
  $$('.report-spray-dot').forEach(dot=>dot.classList.toggle('selected',dot.dataset.reportPa===reportSelectedPaId));
 });
 $('#exportReport').onclick=()=>exportCsv();
}
function exportCsv(){
 const source=reportMode==='current'?(currentGame()?.plateAppearances||[]):reportMode==='game'?(db.savedGames.find(game=>game.id===reportGameId)?.plateAppearances||[]):filteredPAs(false);
 const rows=[['Hitter','Inning','PA','Outcome','Contact Type','Hit Type','Fielder','Final Count','Pitch Count','RBI','RBA','SAC','HHB','WEAK'],...source.map(p=>[p.hitter,p.inning,p.pa,p.outcome,p.contactType||'',p.hitType,p.fielder||'',p.finalCount,p.pitchCount,p.rbiCount??(p.rbi?1:0),p.rba,p.sac,p.hhb,p.weak])];
 const csv=rows.map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(',')).join('\n');
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download=`HotB_${reportMode}_report.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
function bindEval(){
 $('#evalSelect').onchange=e=>{evalPlayer=e.target.value;render()};
 bindDateFilters('eval');
 $('#openRecruitingEmail').onclick=()=>{recruitingEmail={coachName:'',coachEmail:'',collegeName:'',personalNote:'',subject:'',body:'',selectedCoachEmail:''};modal='recruitingEmail';render()};
 const recordMeasureButton=$('#recordMeasure2');
 if(recordMeasureButton)recordMeasureButton.onclick=()=>{recordType='';modal='record';render()};
 $$('[data-measure]').forEach(x=>x.onclick=()=>{recordType=x.dataset.measure;modal='record';render()});
 $$('[data-guide]').forEach(x=>x.onclick=()=>{modal='guide:'+x.dataset.guide;render()});
 $$('[data-ranking]').forEach(x=>x.onclick=()=>{modal='ranking:'+x.dataset.ranking;render()});
 $$('[data-pitch-ranking]').forEach(x=>x.onclick=()=>{modal='pitchRanking:'+x.dataset.pitchRanking;render()});
}
function bindRecord(){
 const resetTimer=()=>{
  if(timerInt)clearInterval(timerInt);timerInt=null;timerElapsed=0;
  $('#timerStart').textContent='Start';$('#timerStart').className='btn green';
  $('#timerSave').hidden=true;$('#timerTime').textContent='0.00';
 };
 const attemptRows=()=>db.measurements.filter(m=>m.player===$('#mPlayer').value&&m.type===$('#mType').value);
 const updateAttemptBoxes=()=>{const type=$('#mType').value;$('#measurementAttempts').innerHTML=attemptRows().map((m,i)=>`<button class="tab attempt-box" data-delete-measurement="${m.id}" title="Delete attempt ${i+1}">${esc(formatMeasurementValue(type,m.value))}</button>`).join('')};
 const storeMeasurement=value=>{
  db.measurements.push({id:crypto.randomUUID(),player:$('#mPlayer').value,type:$('#mType').value,value:Number(value),date:$('#mDate').value});
  save();updateAttemptBoxes();
 };
 const updateStopwatch=()=>{
  const type=$('#mType').value;
  const show=stopwatchMeasurements.includes(type);
  $('#measurementUnitLabel').textContent=measurementUnit(type);
  $('#measurementStopwatch').hidden=!show;
  resetTimer();
  $('#manualEntryPanel').hidden=show;
  $('#manualEntryPanel').classList.toggle('manual-entry-large',!show);
  $('#manualEntryToggle').hidden=!show;
  $('#manualEntryToggle').classList.remove('active');
  $('#measurementAttemptRow').classList.toggle('without-manual',!show);
  $('#mValue').placeholder=show?'0.00':'0';
  $('#mValue').value='';$('#saveManualMeasurement').disabled=true;
  updateAttemptBoxes();
 };
 const updateTypes=()=>{
  const p=hitterObj($('#mPlayer').value); const types=measurementTypes(p);$('#mType').innerHTML=types.map(t=>`<option>${t}</option>`).join('');
  updateStopwatch();
 };
 $('#mPlayer').onchange=updateTypes;
 $('#mType').onchange=updateStopwatch;
 $('#manualEntryToggle').onclick=()=>{
  const panel=$('#manualEntryPanel');panel.hidden=!panel.hidden;
  $('#manualEntryToggle').classList.toggle('active',!panel.hidden);
  if(!panel.hidden)$('#mValue').focus();
 };
 $('#mValue').oninput=()=>{const value=$('#mValue').value.trim();$('#saveManualMeasurement').disabled=!value||!Number.isFinite(Number(value))};
 $('#saveManualMeasurement').onclick=()=>{
  const value=Number($('#mValue').value);if(!Number.isFinite(value))return;
  storeMeasurement(value);$('#mValue').value='';$('#saveManualMeasurement').disabled=true;
 };
 $('#timerStart').onclick=()=>{
  if(timerInt){clearInterval(timerInt);timerInt=null;$('#timerStart').textContent='Clear';$('#timerStart').className='btn';$('#timerSave').hidden=false;return}
  if(timerElapsed){resetTimer();return}
  timerStart=performance.now();$('#timerStart').textContent='Stop';$('#timerStart').className='btn red';
  timerInt=setInterval(()=>{timerElapsed=performance.now()-timerStart;$('#timerTime').textContent=(timerElapsed/1000).toFixed(2)},30);
 };
 $('#timerSave').onclick=()=>{
  if(!timerElapsed)return;storeMeasurement((timerElapsed/1000).toFixed(2));resetTimer();
 };
 $('#measurementAttempts').onclick=event=>{
  const attempt=event.target.closest('[data-delete-measurement]');if(!attempt)return;
  const row=db.measurements.find(m=>m.id===attempt.dataset.deleteMeasurement);if(!row)return;
  if(!confirm(`Delete the ${formatMeasurementValue(row.type,row.value)} attempt?`))return;
  db.measurements=db.measurements.filter(m=>m.id!==row.id);save();updateAttemptBoxes();
 };
 $('#clearMeasurements').onclick=()=>{
  const rows=attemptRows();if(!rows.length)return;
  const player=$('#mPlayer').value,type=$('#mType').value;
  if(!confirm(`Clear all ${rows.length} saved ${type} attempt${rows.length===1?'':'s'} for ${player}?`))return;
  const ids=new Set(rows.map(row=>row.id));db.measurements=db.measurements.filter(row=>!ids.has(row.id));save();updateAttemptBoxes();resetTimer();
 };
 $('#finishMeasurements').onclick=()=>{
  resetTimer();modal=null;recordType='';render();
 };
}
render();
initCloud();
})();
