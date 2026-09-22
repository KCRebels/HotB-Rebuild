
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
 'Tayte Stepps':'OUT','Claire Jack':'OUT','Mattingly Hardy':'IN','Lydia Copeland':'OUT'
};
const heatColors={B:'#3d8c52',F:'#f0c94d',HIT:'#3862db',K:'#cd3a32',H4O:'#cd3a32',FPS:'#cd3a32',REPORT:'#101011'};
const chartZoneIds=['T1','T2','L1','L2','C1','C2','C3','C4','R1','R2','B1','B2'];
const displayedChartZone=zone=>window.HotBEvaluationStats?.normalizeHeatZone?window.HotBEvaluationStats.normalizeHeatZone(zone):zone;

const defaultRoster = [
 {name:'Aniesa Rohleder',side:'R',jersey:'9',grad:'2029',positions:'RHP | 1B',gpa:'3.98',interest:'Sports Medicine',school:'Olathe South HS',photo:'Aniesa.jpg'},
 {name:'Brooklyn Gering',side:'R',jersey:'16',grad:'2029',positions:'RHP | OF',gpa:'4.0',interest:'Nursing',school:'Spring Hill HS',photo:'player-photos/brooklyn-2026.jpg'},
 {name:'Brynna Peter',side:'R',jersey:'11',grad:'2028',positions:'SS | UT',gpa:'3.78',interest:'Occupational Therapy',school:'Chanute HS',photo:'Brynna.jpg',hittingPracticeAttendanceEligible:false},
 {name:'Claire Jack',side:'R',jersey:'25',grad:'2029',positions:'CIF | OF',gpa:'4.0',interest:'Biology',school:'Pratt HS',photo:'player-photos/claire-2026.jpg',hittingPracticeAttendanceEligible:false},
 {name:'Hailey Marsh',side:'SL',jersey:'23',grad:'2029',positions:'CF | OF',gpa:'4.0',interest:'Dentist',school:'Louisburg HS',photo:'Hailey.jpg'},
 {name:'Lakyn Farley',side:'R',jersey:'8',grad:'2028',positions:'RHP | OF',gpa:'4.0',interest:'Sports Medicine',school:'Fort Scott HS',photo:'player-photos/lakyn-2026.jpg'},
 {name:'Lydia Copeland',side:'R',jersey:'27',grad:'2028',positions:'C | CIF',gpa:'4.0',interest:'Child Psychology',school:'Louisburg HS',photo:'player-photos/lydia-2026.jpg'},
 {name:'Maia Waddell',side:'SL',jersey:'1',grad:'2028',positions:'2B | OF',gpa:'4.1',interest:'Criminal Justice / Film',school:'Olathe NW HS',photo:'Maia.jpg'},
 {name:'Makenna Whitaker',side:'R',jersey:'10',grad:'2029',positions:'RHP | UT',gpa:'4.3',interest:'Undecided',school:'Olathe NW HS',photo:'player-photos/makenna-2026.jpg'},
 {name:'Maleah Pena',side:'R',jersey:'20',grad:'2028',positions:'3B | 1B',gpa:'3.52',interest:'Sports Medicine',school:'Olathe NW HS',photo:'Maleah.jpg'},
 {name:'Mattingly Hardy',side:'R',jersey:'99',grad:'2029',positions:'OF | UT',gpa:'3.81',interest:'Biology',school:'Pembroke Hill HS',photo:'player-photos/mattingly-2026.jpg'},
 {name:'Megan Ryan',side:'R',jersey:'22',grad:'2028',positions:'RHP | UT',gpa:'4.0',interest:'Engineering',school:'Rock Creek HS',photo:'player-photos/megan-2026.jpg'},
 {name:'Tayte Stepps',side:'R',jersey:'00',grad:'2029',positions:'C | OF',gpa:'3.9',interest:'Nursing',school:'Fort Scott HS',photo:'player-photos/tayte-2026.jpg'}
];
const playerPhotoUpdatesV1={
 'Tayte Stepps':'player-photos/tayte-2026.jpg',
 'Makenna Whitaker':'player-photos/makenna-2026.jpg',
 'Brooklyn Gering':'player-photos/brooklyn-2026.jpg',
 'Lydia Copeland':'player-photos/lydia-2026.jpg',
 'Mattingly Hardy':'player-photos/mattingly-2026.jpg',
 'Megan Ryan':'player-photos/megan-2026.jpg',
 'Claire Jack':'player-photos/claire-2026.jpg',
 'Lakyn Farley':'player-photos/lakyn-2026.jpg'
};
const pitchingStatUpdatesV1={
 'Aniesa Rohleder':{pitcherIP:'2',pitcherERA:'10.5',pitcherWHIP:'2.5',pitcherKBB:'3',pitcherOBA:'.333',pitcherStrikePct:'62.75%'},
 'Brooklyn Gering':{pitcherIP:'1.1',pitcherERA:'0',pitcherWHIP:'0',pitcherKBB:'—',pitcherOBA:'.000',pitcherStrikePct:'76.47%'},
 'Megan Ryan':{pitcherIP:'1',pitcherERA:'7',pitcherWHIP:'3',pitcherKBB:'1',pitcherOBA:'.500',pitcherStrikePct:'66.67%'},
 'Lakyn Farley':{pitcherIP:'2',pitcherERA:'0',pitcherWHIP:'.5',pitcherKBB:'0',pitcherOBA:'.000',pitcherStrikePct:'52.38%'},
 'Makenna Whitaker':{pitcherIP:'2',pitcherERA:'7',pitcherWHIP:'2.5',pitcherKBB:'0',pitcherOBA:'.286',pitcherStrikePct:'44.12%'}
};

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
const PORTAL_BUILD_TOKEN='20260919-217';window.HOTB_PORTAL_BUILD_TOKEN=PORTAL_BUILD_TOKEN;
const portalToken=new URLSearchParams(window.location.search).get(PORTAL_QUERY_KEY)||'';
const guestPortalSecret=new URLSearchParams(window.location.search).get('guest')||'';
const firebaseConfig={apiKey:'AIzaSyBAMVx6umLKwVj9QVC-rWSFQFuR23-rlrA',authDomain:'hotb-kc-rebels.firebaseapp.com',projectId:'hotb-kc-rebels',storageBucket:'hotb-kc-rebels.firebasestorage.app',messagingSenderId:'412203516902',appId:'1:412203516902:web:397dccc597ac1149ee4c27'};
const seed = {
 roster: defaultRoster.map(profile=>({...profile,rosterKey:profile.name})),
 teams:[],
 pitchers:[],
 savedGames:[],
 gameGroups:[],
 removedRosterNames:[],
 measurements:[],
 coaches:defaultCoaches,
 practiceHistory:[],
 coachObservations:[],
 activePracticeSession:null,
 planPreferences:{},
 currentGame:null,
 route:'home'
};
let db;
try{db=load()}
catch(error){
 console.error('HotB saved-data startup failed',error);
 try{const raw=localStorage.getItem(DBKEY);db=structuredClone(seed);if(raw)localStorage.setItem('hotbRebuildDbV1_recovery_'+Date.now(),raw)}catch(_){db=structuredClone(seed)}
}
if(!portalToken){
if(!Array.isArray(db.coaches))db.coaches=structuredClone(defaultCoaches);
if(!Array.isArray(db.gameGroups))db.gameGroups=[];
if(!Array.isArray(db.practiceHistory))db.practiceHistory=[];
if(!Array.isArray(db.coachObservations))db.coachObservations=[];
if(!db.playerFocusDrillOverrides||typeof db.playerFocusDrillOverrides!=='object')db.playerFocusDrillOverrides={};
// Team Jenkins is temporarily parked outside the active HotB app while the original
// KC Rebels practice system is re-verified. Keep no Jenkins players in the live DB.
const parkedJenkinsNames=new Set((db.roster||[]).filter(player=>player.isTeamJenkins||player.teamName==='Team Jenkins').map(player=>player.name));
if(parkedJenkinsNames.size){
 db.roster=(db.roster||[]).filter(player=>!parkedJenkinsNames.has(player.name));
 db.measurements=(db.measurements||[]).filter(item=>!parkedJenkinsNames.has(item.player));
 db.coachObservations=(db.coachObservations||[]).filter(item=>!parkedJenkinsNames.has(item.playerName));
 (db.savedGames||[]).forEach(game=>{game.battingOrder=(game.battingOrder||[]).filter(name=>!parkedJenkinsNames.has(name));game.hittersUsed=(game.hittersUsed||[]).filter(name=>!parkedJenkinsNames.has(name));game.pitches=(game.pitches||[]).filter(item=>!parkedJenkinsNames.has(item.hitter));game.plateAppearances=(game.plateAppearances||[]).filter(item=>!parkedJenkinsNames.has(item.hitter));game.observations=(game.observations||[]).filter(item=>!parkedJenkinsNames.has(item.playerName))});
 if(db.currentGame){db.currentGame.battingOrder=(db.currentGame.battingOrder||[]).filter(name=>!parkedJenkinsNames.has(name));db.currentGame.hittersUsed=(db.currentGame.hittersUsed||[]).filter(name=>!parkedJenkinsNames.has(name));db.currentGame.pitches=(db.currentGame.pitches||[]).filter(item=>!parkedJenkinsNames.has(item.hitter));db.currentGame.plateAppearances=(db.currentGame.plateAppearances||[]).filter(item=>!parkedJenkinsNames.has(item.hitter));db.currentGame.observations=(db.currentGame.observations||[]).filter(item=>!parkedJenkinsNames.has(item.playerName))}
 (db.practiceHistory||[]).forEach(record=>{if(Array.isArray(record.attendees))record.attendees=record.attendees.filter(name=>!parkedJenkinsNames.has(name));if(Array.isArray(record.rosterPlayers))record.rosterPlayers=record.rosterPlayers.filter(name=>!parkedJenkinsNames.has(name))});
 db.teamJenkinsParked=true;
 localStorage.setItem(DBKEY,JSON.stringify(db));
}
// Team Jenkins is practice-only. Purge any legacy performance/history data that may
// have been saved before practice-only isolation was enforced.
if((db.teamJenkinsDataCleanupVersion||0)<5){
 db=sanitizeJenkinsData(db);
 db.teamJenkinsDataCleanupVersion=5;
 localStorage.setItem(DBKEY,JSON.stringify(db));
 if(localStorage.getItem(CLOUD_ENABLED_KEY)==='true')localStorage.setItem(CLOUD_PENDING_KEY,'true');
}
// One-time cleanup: September 6, 2026 is the first legitimate HotB game date.
// This removes only older game records; roster, opponents, pitchers and practice data remain intact.
if((db.gameDataCleanupVersion||0)<1&&window.HotBGameDataCleanup){
 window.HotBGameDataCleanup.cleanup(db,'2026-09-06');
 db.gameDataCleanupVersion=1;
 localStorage.setItem(DBKEY,JSON.stringify(db));
 if(localStorage.getItem(CLOUD_ENABLED_KEY)==='true')localStorage.setItem(CLOUD_PENDING_KEY,'true');
}
// Recover Player Focus observations saved after a weekend by anchoring them to the
// latest included game for that player. This preserves the existing observation.
if((db.coachObservationAnchorVersion||0)<1&&window.HotBCoachObservations){
 window.HotBCoachObservations.anchorLegacyStandalone(db.coachObservations,db.savedGames);
 db.coachObservationAnchorVersion=1;
 localStorage.setItem(DBKEY,JSON.stringify(db));
 if(localStorage.getItem(CLOUD_ENABLED_KEY)==='true')localStorage.setItem(CLOUD_PENDING_KEY,'true');
}
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
// Replace only the eight requested Evaluation portraits on existing devices.
if((db.playerPhotoVersion||0)<1){
 db.roster.forEach(player=>{if(playerPhotoUpdatesV1[player.name])player.photo=playerPhotoUpdatesV1[player.name]});
 db.playerPhotoVersion=1;
 localStorage.setItem(DBKEY,JSON.stringify(db));
 if(localStorage.getItem(CLOUD_ENABLED_KEY)==='true')localStorage.setItem(CLOUD_PENDING_KEY,'true');
}
// Import the September 6 GameChanger pitching totals into the six Evaluation fields only.
if((db.pitchingStatsVersion||0)<1){
 db.roster.forEach(player=>{if(pitchingStatUpdatesV1[player.name])Object.assign(player,pitchingStatUpdatesV1[player.name])});
 db.pitchingStatsVersion=1;
 localStorage.setItem(DBKEY,JSON.stringify(db));
 if(localStorage.getItem(CLOUD_ENABLED_KEY)==='true')localStorage.setItem(CLOUD_PENDING_KEY,'true');
}
// Preserve an unfinished game across refreshes and Home Screen app restarts.
// Only return to setup when the saved route says live but no game exists.
if(db.route==='live'&&!db.currentGame){
 db.route='new';
 localStorage.setItem(DBKEY,JSON.stringify(db));
}
}
if(portalToken){
 // Player portals do not need the coach device's local database migrations.
 // Keeping portal startup independent prevents a stale/malformed coach localStorage
 // record from stopping app.js before the portal can render.
 db=structuredClone(seed);
}
let route = portalToken?'portal':db.route || 'home';
// Never let a saved secondary page make the entire coach app unlaunchable when
// one optional feature module failed to load. Start safely at Home, preserve the
// requested route, and allow the user to enter that feature after startup.
const startupRequestedRoute=route;
if(!portalToken&&route==='eval'&&!window.HotBEvaluationStats)route='home';
let modal = null;
let reportMode='current', reportSub='spray', reportFilterHitter='All Hitters';
let reportGameId=null,reportSelectedGameIds=[],reportGroupId=null,reportOpponent='All Opponents',reportHeatResult='ALL',reportHeatDisplay='COUNT';
let reportSelectedPaId=null;
let selectedSeason=currentSeasonLabel(), dateFilterMode='full', customDateStart='', customDateEnd='';
let evalPlayer='Team',evaluationReadOnly=false;
let pendingPitchingImport=null;
let recordType='';
let infoPlayerIndex=0,infoPlayerName='';
let pendingRosterImport=null;
let timerInt=null,timerStart=0,timerElapsed=0;
let lastRenderedUndoState=null;
let practicePlan=null,practiceResolution=null;
let practiceSetupState={selectedNames:null,startTime:'18:00',durationMinutes:120,accommodations:{},guestPlayers:[],guestCoaches:[],guestsOpen:false},practiceCoachOpen=false,practiceCardsOpen=false;
let practiceSection='hub',practiceFocusPlayer='',practiceFocusRange='weekend',practiceDrillQuery='',practiceDrillCategory='All Drills',practiceSelectedDrill='';
let practiceChosenDrills=[],practiceDraftDrills=[],practiceDrillPickerOpen=false,practiceEquipmentSetupOpen=false,practicePickerQuery='',practicePickerCategory='All Drills';
let focusDrillReplaceIndex=-1,focusDrillQuery='';
let practiceClock={running:false,finished:false,endAnnounced:false,startAt:0,lastBlock:1,lastTwoMinuteBlock:0,lastTransitionBlock:0,completedAt:null},practiceClockTimer=null,practiceEndSpeech=Promise.resolve(),portalClockTimer=null;
let cloudAuth=null,cloudStore=null,cloudUser=null,cloudAuthReady=false,cloudBusy=false,cloudMessage='',cloudBackupTimer=null,playerEvalSyncTimer=null;
let cloudLastBackup=localStorage.getItem(CLOUD_LAST_SUCCESS_KEY)?new Date(localStorage.getItem(CLOUD_LAST_SUCCESS_KEY)):null,cloudSnapshotCount=0;
let portalAuthUser=null,portalData=null,portalBusy=!!portalToken,portalMessage='',portalView='home',portalSelectedDrill='',portalDrillQuery='',portalDrillResults=[],portalUnsubscribe=null,portalLoadGeneration=0,portalLibraryReturnView='library';
let observationTargetPaId='',observationTargetPlayer='',observationMode='game',observationScope='current',observationPromptInning=0,observationFromInningPrompt=false,observationRecognition=null;
let observationEditId='',observationEditGameId='';
if(!db.coachPortal||typeof db.coachPortal!=='object')db.coachPortal={name:'',phone:'',portalId:'',portalPin:'',portalPinHash:''};
let restoredPracticeCandidate=null;
if(!portalToken&&db.activePracticeSession){
 try{restoredPracticeCandidate=window.HotBPracticeSession?.restore?.(db.activePracticeSession)||null}
 catch(error){console.error('HotB could not restore the saved practice session during startup.',error)}
}
// A setup-stage draft has no generated plan yet. Do not install it into the
// live practice workspace: doing so makes practicePlan truthy and hides the
// cloud-publication recovery detector after an activation-local-save failure.
const restoredGeneratedPractice=restoredPracticeCandidate?.plan?.portalDraftId?restoredPracticeCandidate:null;
const recoveredPracticeSession=restoredGeneratedPractice&&(!db.activePortalPractice?.id||db.activePortalPractice.id===restoredGeneratedPractice.plan?.portalDraftId)?restoredGeneratedPractice:null;
if(restoredGeneratedPractice&&!recoveredPracticeSession){
 // Never silently throw away a saved practice just because the local portal pointer
 // belongs to a different publication. Preserve both records and surface recovery;
 // Firebase verification decides which practice is actually live.
 console.warn('Saved practice and portal publication differ; preserving recovery state.');
}
if(restoredPracticeCandidate?.stage==='setup'&&!restoredPracticeCandidate.plan&&!db.activePortalPractice?.id){
 practiceSetupState={...practiceSetupState,...restoredPracticeCandidate.setupState};
 // Setup drafts are the safety net for Practice Resolution. Restore the exact
 // attendance/accommodations/duration and verified decision context so an app
 // refresh cannot silently replace the coach's unresolved practice.
 if(!Array.isArray(practiceSetupState.selectedNames))practiceSetupState.selectedNames=db.roster.filter(player=>!player.isTeamJenkins).map(player=>player.name);
 const savedStartupResolution=db.activePracticeSession?.resolution;
 if(restoredPracticeCandidate.resolution){
  try{practiceResolution=structuredClone(restoredPracticeCandidate.resolution)}
  catch(error){console.error('HotB refused a Practice Resolution that could not be isolated during startup recovery.',error);practiceResolution=null}
 }else practiceResolution=null;
 // Restore is not allowed to migrate/default a sealed Resolution object. Full
 // roster-aware validation happens later, but byte identity is safe to prove here
 // before any restored decision can reach the first render.
 if(practiceResolution){
  let savedStartupBytes='',restoredStartupBytes='';
  try{savedStartupBytes=JSON.stringify(savedStartupResolution);restoredStartupBytes=JSON.stringify(practiceResolution)}
  catch(error){console.error('HotB refused a Practice Resolution that could not be sealed during startup recovery.',error);practiceResolution=null}
  if(practiceResolution&&(!savedStartupResolution||savedStartupBytes!==restoredStartupBytes)){
   console.error('HotB refused a Practice Resolution that changed during startup recovery.');
   practiceResolution=null;
  }
 }
 // Resolution snapshots restore from the failed 120-minute source attempt. Block 11 is apply-transaction-only.
 if(Number(practiceSetupState.durationMinutes)!==120){console.warn('HotB normalized restored setup duration before Practice Resolution validation.');practiceSetupState.durationMinutes=120}
 practiceSection='setup';
 // Full Resolution validation depends on roster/model helpers declared later in this
 // script, so startup only restores the snapshot here. The first normal render/bind
 // pass performs the authoritative validation before the modal can be displayed or
 // any coaching choice can be applied. This avoids calling lexical helpers in their
 // temporal-dead-zone during initial script evaluation.
 if(practiceResolution)modal='practiceResolution';
}
if(recoveredPracticeSession){
 practicePlan=recoveredPracticeSession.plan;
 practiceChosenDrills=recoveredPracticeSession.chosenDrills;
 practiceDraftDrills=recoveredPracticeSession.draftDrills||[];
 practiceDrillPickerOpen=!!recoveredPracticeSession.drillPickerOpen;
 practiceEquipmentSetupOpen=!!recoveredPracticeSession.equipmentSetupOpen;
 practiceSetupState={...practiceSetupState,...recoveredPracticeSession.setupState};
 // An empty saved attendance list is a stale/failed draft, not an intentional default.
 // Fresh/recovered practice setup should start with the full active Rebels roster checked.
 if(!Array.isArray(practiceSetupState.selectedNames)||practiceSetupState.selectedNames.length===0)practiceSetupState.selectedNames=db.roster.filter(player=>!player.isTeamJenkins).map(player=>player.name);
 practiceClock=recoveredPracticeSession.clock;
 if(recoveredPracticeSession.portalState&&(!db.activePortalPractice||db.activePortalPractice.id===recoveredPracticeSession.portalState.id))db.activePortalPractice=recoveredPracticeSession.portalState;
 if(practicePlan)practiceSection='builder';
}
const recoveredPracticeExpired=!!(practicePlan&&practiceClock.running&&!window.HotBPracticeSession?.timing(practicePlan,practiceClock,Date.now()));

let cloudInitStarted=false,cloudInitRetryTimer=null,cloudInitRetryCount=0;
async function initCloud(){
 if(cloudInitStarted)return;
 if(!window.firebase&&window.HotBFirebaseReady){try{await Promise.race([window.HotBFirebaseReady,new Promise((_,reject)=>setTimeout(()=>reject(new Error('firebase-loader-timeout')),8000))])}catch(_){}}
 if(!window.firebase){
  try{
   const sources=['https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js','https://www.gstatic.com/firebasejs/10.14.1/firebase-auth-compat.js','https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore-compat.js'];
   for(const src of sources){
    if(window.firebase&&src.includes('firebase-app-compat'))continue;
    await Promise.race([
     new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.async=false;s.dataset.hotbFirebase=src;s.onload=resolve;s.onerror=()=>reject(new Error('firebase-load-failed'));document.head.appendChild(s)}),
     new Promise((_,reject)=>setTimeout(()=>reject(new Error('firebase-load-timeout')),8000))
    ]);
   }
  }catch(_){}
 }
 if(!window.firebase){
  if(cloudInitRetryCount<12){cloudInitRetryCount++;clearTimeout(cloudInitRetryTimer);cloudInitRetryTimer=setTimeout(initCloud,500);return}
  const dynamicScripts=[...document.scripts].filter(script=>script.dataset?.hotbFirebase);
  const attempted=dynamicScripts.map(script=>script.dataset.hotbFirebase||'').filter(Boolean);
  const loaderPresent=!!window.HotBFirebaseReady;
  const detail=!navigator.onLine?'iPhone reports no network connection.':!loaderPresent?'Firebase loader was not present in this build.':attempted.length?`Firebase loader ran but the SDK did not initialize (${attempted.length} source attempt${attempted.length===1?'':'s'}).`:'Firebase loader started but no SDK source was attempted.';
  if(portalToken){portalBusy=false;portalMessage=`HotB could not connect to the player portal service. ${detail} Please reopen the link.`;if(route==='portal')render()}
  else cloudMessage=`HotB could not start the portal connection. ${detail} Your phone data is still safe.`;
  return;
 }
 try{
  cloudInitStarted=true;clearTimeout(cloudInitRetryTimer);cloudInitRetryTimer=null;
  if(!firebase.apps.length)firebase.initializeApp(firebaseConfig);
  cloudAuth=firebase.auth();cloudStore=firebase.firestore();
  // The first onAuthStateChanged callback is the authoritative persistence
  // restoration barrier in the compat SDK. Do not mark auth ready before it
  // supplies the restored user (or definitively supplies null).
  cloudAuthReady=false;
  cloudAuth.onAuthStateChanged(async user=>{
   if(user&&!user.isAnonymous&&String(user.email||'').toLowerCase()!==CLOUD_EMAIL){await cloudAuth.signOut();cloudMessage=`Please sign in with ${CLOUD_EMAIL}.`;cloudUser=null;portalAuthUser=null}
   else{
    cloudUser=user&&!user.isAnonymous?user:null;
    portalAuthUser=user||null;
   }
   cloudAuthReady=true;
   if(route==='home'||route==='portal')render();
   if(cloudUser){
    // Publish the authenticated coach state immediately. Cloud status reads can be
    // slow on iOS; portal management must not remain stuck on Reconnect while
    // loadCloudStatus is still waiting on Firestore.
    if(route==='home'||route==='portal')render();
    try{await loadCloudStatus()}catch(_){cloudMessage='Signed in. Cloud status will retry automatically.'}
    if(localStorage.getItem(CLOUD_PENDING_KEY)==='true')scheduleCloudBackup();
   }
   if(cloudUser&&recoveredPracticeExpired&&practicePlan&&practiceClock.running){
    // Do not merely mark an expired restored clock finished locally. Wait for the
    // authenticated coach session so the normal completion path can actually
    // clear and verify every published portal.
    await finishPracticeClock(true);
   }else if(cloudUser&&!portalToken&&practicePlan&&practiceClock.running&&!recoveredPracticeExpired){
    // Startup restores the local practice before Firebase auth is ready. Resume
    // only after the coach cloud session exists; otherwise an early verification
    // failure can pause a perfectly healthy live practice.
    await resumeRecoveredPracticeClock();
   }
   // Firebase's first auth callback is the startup barrier for a portal URL.
   // Start exactly one authoritative portal read here. Do not await it inside the
   // auth observer: Firestore/Auth can deliver additional state callbacks while
   // the read is pending, and a second generation would cancel the first loader.
   if(portalToken&&portalLoadGeneration===0&&!portalUnsubscribe)loadPlayerPortal();
   if(route==='home'||route==='portal')render();
  });
 }catch(error){
  cloudInitStarted=false;
  cloudMessage='Cloud backup could not start. Your phone data is still safe.';
  if(portalToken){
   portalBusy=false;
   portalMessage='HotB could not start the player portal connection. Please reopen the link.';
   if(route==='portal')render();
  }
 }
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
function newGuestSecret(){return newPortalId()+newPortalId()}
function standaloneLinkMessage(before,url,after){
 const helper=window.HotBSms?.buildStandaloneLinkMessage?.({before,url,after});
 if(helper)return helper;
 const clean=value=>String(value??'').replace(/[\r\n]+/g,' ').trim(),leading=(Array.isArray(before)?before:[before]).map(clean).filter(Boolean),trailing=(Array.isArray(after)?after:[after]).map(clean).filter(Boolean);
 return [...leading,'',String(url||'').trim(),'',...trailing].filter((value,index,array)=>value!==''||index>0&&index<array.length-1).join('\r\n');
}
function smsComposeUrl(phone,message){
 const helper=window.HotBSms?.composeSmsUrl?.({phone,message,userAgent:navigator.userAgent});
 if(helper)return helper;
 const recipient=String(phone??'').replace(/[^\d+]/g,''),body=String(message??'').replace(/\r?\n/g,'\r\n');
 if(!recipient||!body)return'';
 const separator=/iPad|iPhone|iPod/.test(navigator.userAgent)?'&':'?';
 return `sms:${recipient}${separator}body=${encodeURIComponent(body)}`;
}
function openSmsComposer(url){
 if(!url||!/^sms:/i.test(String(url)))return false;
 // Keep the external sms: navigation synchronous with the original iPhone tap.
 // Do not hide the anchor offscreen: iOS standalone PWAs can ignore synthetic
 // activation of a hidden external-scheme link. Click a temporary visible-sized
 // link during the original capture-phase user gesture, then remove it next tick.
 try{
  const link=document.createElement('a');
  link.href=url;link.setAttribute('aria-label','Open Messages');link.style.position='fixed';link.style.inset='0 auto auto 0';link.style.width='1px';link.style.height='1px';link.style.opacity='0.01';link.style.zIndex='2147483647';
  document.body.appendChild(link);link.click();setTimeout(()=>link.remove(),0);
  return true;
 }catch(_){}
 try{window.location.assign(url);return true}catch(__){return false}
}
function playerPortalUrl(player){return `${location.origin}${location.pathname}?${PORTAL_QUERY_KEY}=${encodeURIComponent(player.portalId||'')}&portalBuild=${PORTAL_BUILD_TOKEN}`}
function playerPortalTextUrl(player){
 const phone=String(player?.phone||'').replace(/[^\d+]/g,'');
 if(!phone||!player?.portalId||!player?.portalPin)return'';
 const first=practiceFirstName(player.name),message=standaloneLinkMessage(`${first}’s private HotB Player Portal`,playerPortalUrl(player),`PIN: ${player.portalPin}`);
 return smsComposeUrl(phone,message);
}
function coachPortalUrl(){return `${location.origin}${location.pathname}?${PORTAL_QUERY_KEY}=${encodeURIComponent(db.coachPortal?.portalId||'')}&portalBuild=${PORTAL_BUILD_TOKEN}`}
function coachPortalShareText(){return standaloneLinkMessage(`${db.coachPortal?.name||'Coach'}’s private HotB Coach Portal`,coachPortalUrl(),`PIN: ${db.coachPortal?.portalPin||''}`)}
function guestPortalUrl(guest){return `${location.origin}${location.pathname}?${PORTAL_QUERY_KEY}=${encodeURIComponent(guest.portalId||'')}&guest=${encodeURIComponent(guest.portalSecret||'')}&portalBuild=${PORTAL_BUILD_TOKEN}`}
function guestPortalShareText(guest){return window.HotBSms?.guestPracticeMessage({firstName:practiceFirstName(guest.name),url:guestPortalUrl(guest)})||''}
function guestPortalTextUrl(guest){
 const phone=String(guest?.phone||'').replace(/[^\d+]/g,'');
 if(!phone||!guest?.portalId||!guest?.portalSecret)return'';
 return smsComposeUrl(phone,guestPortalShareText(guest));
}
async function shareGuestPortal(guest){
 if(!guest?.portalId||!guest?.portalSecret){alert('This guest link is not ready. Remove the guest and add them again.');return}
 const share={title:`${guest.name}’s HotB Practice`,text:guestPortalShareText(guest)};
 try{if(navigator.share)await navigator.share(share);else{await navigator.clipboard.writeText(share.text);alert('Guest practice link copied.')}}catch(error){if(error?.name!=='AbortError')alert('The guest link could not be shared from this device.')}
}
async function createPendingGuestPortal(guest,type){
 if(!cloudUser||!cloudStore)throw new Error('Cloud access is required');
 guest.portalId=guest.portalId||newPortalId();guest.portalSecret=guest.portalSecret||newGuestSecret();
 const pinHash=await portalHash(guest.portalId,guest.portalSecret),coach=type==='guestCoach';
 await portalDoc(guest.portalId).set({portalType:type,...(coach?{coachName:guest.name}:{playerName:guest.name}),firstName:practiceFirstName(guest.name),phone:guest.phone,pinHash,ownerUid:null,expired:false,accessStatus:'waiting',activePractice:null,updatedAt:firebase.firestore.FieldValue.serverTimestamp()});
}
function waitForPortalAuthState(timeout=8000){
 if(!cloudAuth)return Promise.reject(new Error('portal-auth-unavailable'));
 if(cloudAuthReady)return Promise.resolve(cloudAuth.currentUser||null);
 return new Promise((resolve,reject)=>{
  let settled=false,unsubscribe=null,timer=null;
  const cleanup=()=>{
   if(timer){clearTimeout(timer);timer=null}
   if(unsubscribe){try{unsubscribe()}catch(_){}unsubscribe=null}
  };
  const finish=(error,user)=>{
   if(settled)return;settled=true;cleanup();
   if(error)reject(error);else resolve(user||null);
  };
  try{unsubscribe=cloudAuth.onAuthStateChanged(user=>finish(null,user))}
  catch(error){finish(error,null);return}
  // Defensive against auth implementations that invoke the first callback
  // synchronously while registering the listener.
  if(settled){cleanup();return}
  timer=setTimeout(()=>finish(new Error('portal-auth-timeout'),null),timeout);
 });
}
async function loadPlayerPortal(){
 if(!portalToken)return;
 const requestedPortalToken=portalToken,loadGeneration=++portalLoadGeneration;
 if(!cloudAuth||!cloudStore){portalBusy=false;portalData=null;portalMessage='HotB is still connecting to the player portal service. Please wait a moment and reopen this link.';if(route==='portal')render();return;}
 // A reload or token change must never leave the previous portal document
 // listening in the background. That old listener could otherwise repaint
 // stale practice data after a failed read or while PIN entry is shown.
 if(portalUnsubscribe){portalUnsubscribe();portalUnsubscribe=null}
 portalBusy=true;portalMessage='';
 if(!portalAuthUser){
  try{
   // Firebase may already have restored an anonymous session before this function
   // runs. Reuse it instead of issuing another anonymous sign-in request.
   portalAuthUser=cloudAuth.currentUser||null;
   if(!portalAuthUser){
    // Do not replace a still-restoring persisted player session with a new
    // anonymous identity. Wait for the first auth callback before creating one.
    if(!cloudAuthReady){
     const restoredAuthUser=await waitForPortalAuthState();
     if(loadGeneration!==portalLoadGeneration||portalToken!==requestedPortalToken)return;
     portalAuthUser=restoredAuthUser||cloudAuth.currentUser||null;
    }
    if(!portalAuthUser){
     const credential=await Promise.race([
      cloudAuth.signInAnonymously(),
      new Promise((_,reject)=>setTimeout(()=>reject(new Error('portal-auth-timeout')),8000))
     ]);
     portalAuthUser=credential?.user||cloudAuth.currentUser||null;
    }
   }
  }catch(error){
   if(loadGeneration!==portalLoadGeneration||portalToken!==requestedPortalToken)return;
   portalBusy=false;
   portalMessage=String(error?.message||'')==='portal-auth-timeout'
    ?'HotB could not reach the player portal sign-in service. Please reopen the link.'
    :'Player access is not active yet. The coach must finish Firebase portal setup.';
   if(route==='portal')render();
   return;
  }
  if(!portalAuthUser){
   if(loadGeneration!==portalLoadGeneration||portalToken!==requestedPortalToken)return;
   portalBusy=false;
   portalMessage='HotB could not finish opening this player portal. Please reopen the link.';
   if(route==='portal')render();
   return;
  }
 }
 if(loadGeneration!==portalLoadGeneration||portalToken!==requestedPortalToken)return;
 if(guestPortalSecret&&!isCoachPortalUser()){
  try{
   const proof=await portalHash(requestedPortalToken,guestPortalSecret);
   if(loadGeneration!==portalLoadGeneration||portalToken!==requestedPortalToken)return;
   // Guest/Jenkins links use the same Firestore ownership rules as permanent
   // player portals: claim an unowned link first, then authorize extra devices.
   try{await portalDoc(requestedPortalToken).update({ownerUid:portalAuthUser.uid,pinProof:proof,claimedAt:firebase.firestore.FieldValue.serverTimestamp()})}
   catch(firstError){if(loadGeneration!==portalLoadGeneration||portalToken!==requestedPortalToken)return;if(firstError?.code!=='permission-denied')throw firstError;await portalDoc(requestedPortalToken).update({authorizedUids:firebase.firestore.FieldValue.arrayUnion(portalAuthUser.uid),pinProof:proof,claimedAt:firebase.firestore.FieldValue.serverTimestamp()})}
  }catch(error){
   if(loadGeneration!==portalLoadGeneration||portalToken!==requestedPortalToken)return;
   portalBusy=false;portalData=null;portalMessage='This practice link could not be connected. Ask the coach to send a fresh link.';
   if(route==='portal')render();
   return;
  }
 }
 try{
  const snapshot=await Promise.race([
   portalDoc(requestedPortalToken).get(),
   new Promise((_,reject)=>setTimeout(()=>reject(new Error('portal-read-timeout')),8000))
  ]);
  if(snapshot.exists){
   if(loadGeneration!==portalLoadGeneration||portalToken!==requestedPortalToken)return;
   const loaded={id:snapshot.id,...snapshot.data()};
   // A portal URL must never display a cloud document whose identity does not
   // match the requested private portal type. This is a final guard against
   // stale/reused IDs painting another portal's data on screen.
   const playerType=['player','jenkinsPlayer','guestPlayer'].includes(loaded.portalType),coachType=['coach','guestCoach'].includes(loaded.portalType);
   if(!playerType&&!coachType||playerType&&!loaded.playerName||coachType&&!loaded.coachName)throw new Error('portal-identity-missing');
   portalData=loaded;portalMessage='';
   // The initial read must get the same lifecycle normalization as later live
   // snapshots. A reopened iPhone can otherwise keep a stale drill subview from
   // memory while the cloud document is already waiting/ended/no-practice.
   if(!portalData.activePractice){
    portalSelectedDrill='';portalDrillQuery='';portalLibraryReturnView='library';
    if(['guestPlayer','jenkinsPlayer','guestCoach','coach'].includes(portalData.portalType)||portalView==='practice')portalView='home';
   }else if(portalPracticeClockValues(portalData.activePractice).ended){
    // An expired practice is not active access. Normalize the initial read exactly
    // like a cleanup snapshot so a reopened permanent-player link cannot revive
    // the old schedule, and practice-only links go straight to their ended state.
    portalSelectedDrill='';portalDrillQuery='';portalLibraryReturnView='library';portalData._localPracticeEnded=true;
    portalView=['guestPlayer','jenkinsPlayer','guestCoach'].includes(portalData.portalType)?'home':'home';
   }else if(['guestPlayer','jenkinsPlayer','guestCoach'].includes(portalData.portalType)){
    portalView='home';
   }
   if(portalUnsubscribe)portalUnsubscribe();
   portalUnsubscribe=portalDoc(requestedPortalToken).onSnapshot(next=>{
    if(loadGeneration!==portalLoadGeneration||portalToken!==requestedPortalToken)return;
    if(next.exists){
     const nextData={id:next.id,...next.data()},nextPlayerType=['player','jenkinsPlayer','guestPlayer'].includes(nextData.portalType),nextCoachType=['coach','guestCoach'].includes(nextData.portalType);
     if(!nextPlayerType&&!nextCoachType||nextPlayerType&&!nextData.playerName||nextCoachType&&!nextData.coachName){
      portalData=null;portalSelectedDrill='';portalDrillQuery='';portalLibraryReturnView='library';portalView='home';portalMessage='This portal record is incomplete. Ask the coach to refresh the player portal.';
      if(route==='portal')render();return;
     }
     const previousPracticeId=portalData?.activePractice?.id||'';
     const nextPracticeId=nextData?.activePractice?.id||'';
     const previousClockStart=portalData?.activePractice?.clock?.startedAt||'';
     const nextClockStart=nextData?.activePractice?.clock?.startedAt||'';
     const previousActivation=portalData?.activePractice?.activatedAt||'';
     const nextActivation=nextData?.activePractice?.activatedAt||'';
     // Same practice ID is not enough to establish continuity. If a legacy build
     // ever republished an ID, activatedAt is its publication generation. Treat
     // that as a new practice snapshot and discard every local drill/view sentinel.
     const publicationChanged=previousPracticeId===nextPracticeId&&!!nextPracticeId&&previousActivation!==nextActivation;
     portalData=nextData;portalMessage='';
     // Any new/removed practice must reset all practice subviews. Also clear the
     // local-ended sentinel when the coach starts the same published plan; otherwise
     // an iPhone that previously reached DONE can stay stuck on Practice Complete.
     if(previousPracticeId!==nextPracticeId||publicationChanged){
      portalSelectedDrill='';portalDrillQuery='';portalLibraryReturnView='library';
      if(['guestPlayer','jenkinsPlayer','guestCoach','coach'].includes(portalData.portalType))portalView='home';
      else if(nextPracticeId)portalView='practice';
      else portalView='home';
     }
     if(nextPracticeId&&(previousPracticeId!==nextPracticeId||publicationChanged||previousClockStart!==nextClockStart))delete portalData._localPracticeEnded;
     if(route==='portal')render()
    }else{
     // A deleted portal document must immediately invalidate the open screen.
     // Otherwise the last snapshot can remain visible indefinitely.
     portalData=null;portalSelectedDrill='';portalDrillQuery='';portalLibraryReturnView='library';portalView='home';
     portalMessage='This portal is no longer available. Ask the coach to send a fresh link.';
     if(route==='portal')render();
    }
   },()=>{
    if(loadGeneration!==portalLoadGeneration||portalToken!==requestedPortalToken)return;
    portalData=null;portalSelectedDrill='';portalDrillQuery='';portalLibraryReturnView='library';portalView='home';
    portalMessage='This portal is no longer connected to this device.';
    if(portalUnsubscribe){portalUnsubscribe();portalUnsubscribe=null}
    if(route==='portal')render();
   });
  }
  else portalMessage='This player portal link is not valid.';
 }catch(error){
  if(loadGeneration!==portalLoadGeneration||portalToken!==requestedPortalToken)return;
  portalData=null;
  const code=String(error?.code||'');
  if(String(error?.message||'')==='portal-read-timeout')portalMessage='HotB could not reach the player portal. Please reopen the link.';
  else if(code==='permission-denied'&&!isCoachPortalUser())portalMessage='Enter your six-digit PIN to open this portal.';
  else if(code==='unavailable')portalMessage='HotB could not reach the player portal service. Please check the connection and reopen the link.';
  else if(!isCoachPortalUser())portalMessage='Enter your six-digit PIN to open this portal.';
  else portalMessage='This player portal link is not valid.';
 }finally{
  if(loadGeneration===portalLoadGeneration&&portalToken===requestedPortalToken){
   portalBusy=false;
   if(route==='portal')render();
  }
 }
}
window.HotBOpenPlayerPortal=()=>{
 const input=document.getElementById('portalPin');
 const pin=input?.value||'';
 const button=document.getElementById('openPlayerPortal');
 if(button){button.disabled=true;button.textContent='OPENING…'}
 Promise.resolve(claimPlayerPortal(pin)).catch(error=>{
  portalBusy=false;portalData=null;
  const code=String(error?.code||'').replace('auth/','').replace('firestore/','')||'no-code';
  const message=String(error?.message||error||'unknown').slice(0,120);
  portalMessage=`PIN connection failed [P210-${code}]: ${message}`;
  render();
 });
};
async function claimPlayerPortal(pin){
 if(!portalToken||isCoachPortalUser())return;
 // A timed-out startup can leave the UI in PIN mode while an obsolete loader still
 // owns portalBusy. A deliberate PIN tap is authoritative and supersedes that stale
 // startup attempt instead of being silently ignored.
 if(portalBusy){portalLoadGeneration++;portalBusy=false;if(portalUnsubscribe){portalUnsubscribe();portalUnsubscribe=null}}
 const requestedPortalToken=portalToken,claimGeneration=++portalLoadGeneration;
 // A PIN claim supersedes any startup loader/listener for this same URL. Without
 // this, a slower pre-PIN read can repaint the screen while the claim is writing.
 if(portalUnsubscribe){portalUnsubscribe();portalUnsubscribe=null}
 if(!cloudAuth||!cloudStore){
  portalMessage='HotB is still connecting to the player portal service. Please wait a moment and try again.';
  render();return;
 }
 if(!portalAuthUser){
  try{
   portalAuthUser=cloudAuth.currentUser||null;
   if(!portalAuthUser){
    // Do not replace a still-restoring persisted player session with a new
    // anonymous identity. Wait for the first auth callback before creating one.
    if(!cloudAuthReady){
     const restoredAuthUser=await waitForPortalAuthState();
     if(claimGeneration!==portalLoadGeneration||portalToken!==requestedPortalToken)return;
     portalAuthUser=restoredAuthUser||cloudAuth.currentUser||null;
    }
    if(!portalAuthUser){
     const credential=await Promise.race([
      cloudAuth.signInAnonymously(),
      new Promise((_,reject)=>setTimeout(()=>reject(new Error('portal-auth-timeout')),8000))
     ]);
     portalAuthUser=credential?.user||cloudAuth.currentUser||null;
    }
   }
  }catch(error){portalMessage='HotB could not connect this device to the player portal. Please reopen the link.';render();return}
 }
 if(!portalAuthUser){portalMessage='HotB could not finish connecting this device. Please reopen the link.';render();return}
 if(!/^\d{6}$/.test(String(pin||'').trim())){portalMessage='Enter the six-digit PIN provided by your coach.';render();return}
 portalBusy=true;portalMessage='Checking your PIN…';render();
 try{
  const proof=await portalHash(requestedPortalToken,pin);
  // First claim an unowned portal. If it is already owned, add this device as an
  // authorized device. This ordering matches the Firestore rules and avoids a
  // guaranteed permission-denied attempt on every first-time PIN entry.
  try{
   await portalDoc(requestedPortalToken).update({ownerUid:portalAuthUser.uid,pinProof:proof,claimedAt:firebase.firestore.FieldValue.serverTimestamp()});
  }catch(firstError){
   // Only fall back to authorizedUids when the first write was rejected because
   // the portal is already owned. A wrong PIN or network failure must not trigger
   // a second write that can mask the real failure mode.
   if(firstError?.code!=='permission-denied')throw firstError;
   await portalDoc(requestedPortalToken).update({authorizedUids:firebase.firestore.FieldValue.arrayUnion(portalAuthUser.uid),pinProof:proof,claimedAt:firebase.firestore.FieldValue.serverTimestamp()});
  }
  if(claimGeneration!==portalLoadGeneration||portalToken!==requestedPortalToken)throw new Error('portal-claim-token-changed');
  // Verify the authorization directly before starting another loader. A concurrent
  // auth-state loader may supersede this call; that must not turn a correct PIN
  // into a false failure or clear a newer successful portal.
  const verified=await portalDoc(requestedPortalToken).get(),remote=verified.exists?verified.data():null,uid=portalAuthUser?.uid;
  if(!remote||!uid||(remote.ownerUid!==uid&&!(Array.isArray(remote.authorizedUids)&&remote.authorizedUids.includes(uid))))throw new Error('portal-claim-verification-failed');
  if(claimGeneration!==portalLoadGeneration||portalToken!==requestedPortalToken)return;
  portalBusy=false;
  await loadPlayerPortal();
 }catch(error){
  if(claimGeneration!==portalLoadGeneration||portalToken!==requestedPortalToken)return;
  // If a newer loader already opened this exact portal, do not let this older
  // claim path erase it with a misleading PIN error.
  if(portalData?.id===requestedPortalToken){portalBusy=false;if(route==='portal')render();return}
  portalBusy=false;portalData=null;
  const failureCode=String(error?.code||'').replace('auth/','').replace('firestore/','')||'no-code';
  const failureMessage=String(error?.message||error||'unknown').slice(0,120);
  portalMessage=`PIN connection failed [P210-${failureCode}]: ${failureMessage}`;
  render();
 }
}
function schedulePlayerEvaluationPortalSync(delay=2200){
 if(!cloudUser||!cloudStore||portalToken)return;
 clearTimeout(playerEvalSyncTimer);
 playerEvalSyncTimer=setTimeout(async()=>{
  if(cloudBusy){schedulePlayerEvaluationPortalSync(5000);return}
  // Evaluation sync is background convenience data. Never create an aggressive
  // retry loop when Firestore rejects a request (including daily quota limits).
  // The next normal save/backup will schedule another attempt.
  await syncPlayerEvaluationPortals();
 },delay);
}
async function syncPlayerEvaluationPortals(){
 if(!cloudUser||!cloudStore||cloudBusy)return false;
 const players=db.roster.filter(player=>!player.isGuest&&!player.isTeamJenkins&&player.portalId),coachPortalId=db.coachPortal?.portalId||'';
 if(!players.length&&!coachPortalId)return true;
 try{
  // Evaluation refreshes are background updates only. They must never recreate a
  // deleted/reset portal as an incomplete document. Verify identity, then update.
  const targets=await Promise.all([
   ...players.map(async player=>{const ref=portalDoc(player.portalId),snapshot=await ref.get(),remote=snapshot.exists?snapshot.data():null;if(!remote||remote.portalType!=='player'||remote.playerName!==player.name)return null;return {ref,data:{evaluationData:playerEvaluationPortalPayload(player.name),updatedAt:firebase.firestore.FieldValue.serverTimestamp()}}}),
   ...(coachPortalId?[async()=>{const ref=portalDoc(coachPortalId),snapshot=await ref.get(),remote=snapshot.exists?snapshot.data():null;if(!remote||remote.portalType!=='coach')return null;return {ref,data:{evaluationData:coachEvaluationPortalPayload(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()}}}] : [])
  ]);
  const valid=targets.filter(Boolean);if(!valid.length)return true;
  const batch=cloudStore.batch();valid.forEach(target=>batch.update(target.ref,target.data));await batch.commit();
  return true;
 }catch(error){console.warn('Evaluation portal sync failed',error);return false}
}
async function setupPlayerPortals(){
 if(!cloudUser||!cloudStore||cloudBusy)return;
 cloudBusy=true;portalMessage='Creating private player portals…';render();
 const players=db.roster.filter(item=>!item.isGuest&&!item.isTeamJenkins),originals=players.map(player=>({player,portalId:player.portalId,portalPin:player.portalPin,portalPinHash:player.portalPinHash}));
 try{
  const batch=cloudStore.batch();
  for(const player of players){
   if(!player.portalId)player.portalId=newPortalId();
   if(!player.portalPin)player.portalPin=newPortalPin();
   player.portalPinHash=await portalHash(player.portalId,player.portalPin);
   const existing=await portalDoc(player.portalId).get();
   if(existing.exists){
    const remote=existing.data()||{};
    // Never let a locally saved portal ID silently attach this player to a
    // different player's existing cloud document or to another portal type.
    if(remote.playerName&&remote.playerName!==player.name)throw new Error('portal-player-identity-mismatch');
    if(remote.portalType&&remote.portalType!=='player')throw new Error('portal-player-type-mismatch');
   }
   const localPracticeId=db.activePortalPractice?.id||'',remoteActive=existing.exists?(existing.data()||{}).activePractice:null;
   // Portal setup is identity/PIN setup, not a practice-lifecycle command. Never
   // erase or replace a live cloud practice just because the coach UI is between
   // local recovery states. Practice activation/clock/end own activePractice.
   const localActive=localPracticeId&&localPracticeId===practicePlan?.portalDraftId&&db.activePortalPractice?.players?.includes(player.name)
    ?playerPracticePortalPayload(player.name,db.activePortalPractice?.activatedAt||null,practiceClockPortalPayload()):null;
   if(remoteActive&&localActive&&remoteActive.id!==localActive.id)throw new Error('portal-active-practice-conflict');
   const portalUpdate={portalType:'player',playerName:player.name,firstName:practiceFirstName(player.name),pinHash:player.portalPinHash,evaluationData:playerEvaluationPortalPayload(player.name),...(!existing.exists?{ownerUid:null,focus:null,activePractice:localActive}:{}),updatedAt:firebase.firestore.FieldValue.serverTimestamp()};
   batch.set(portalDoc(player.portalId),portalUpdate,{merge:true});
  }
  await batch.commit();
  const playerVerification=await Promise.all(players.map(async player=>{
   const snapshot=await portalDoc(player.portalId).get(),remote=snapshot.exists?snapshot.data():null;
   const shouldBeActive=!!(db.activePortalPractice?.id&&db.activePortalPractice.id===practicePlan?.portalDraftId&&db.activePortalPractice.players?.includes(player.name));
   return !!remote&&remote.portalType==='player'&&remote.playerName===player.name&&remote.pinHash===player.portalPinHash&&(!shouldBeActive||remote.activePractice?.id===practicePlan.portalDraftId);
  }));
  if(playerVerification.some(ok=>!ok))throw new Error('player-portal-refresh-verification-failed');
  // Persist portal IDs/PINs immediately before any backup/sync work can run.
  db.route=route;
  localStorage.setItem(DBKEY,JSON.stringify(db));
  if(localStorage.getItem(CLOUD_ENABLED_KEY)==='true')localStorage.setItem(CLOUD_PENDING_KEY,'true');
  portalMessage='Player records refreshed. Existing links and PINs were kept.';
  scheduleCloudBackup();
 }catch(error){originals.forEach(({player,portalId,portalPin,portalPinHash})=>{if(portalId===undefined)delete player.portalId;else player.portalId=portalId;if(portalPin===undefined)delete player.portalPin;else player.portalPin=portalPin;if(portalPinHash===undefined)delete player.portalPinHash;else player.portalPinHash=portalPinHash});portalMessage='Player portals could not be created. Confirm Anonymous Authentication and the Player Portal security rules are active.'}
 cloudBusy=false;render();
}
async function setupCoachPortal(){
 if(!cloudUser||!cloudStore||cloudBusy)return;
 const name=$('#coachPortalName')?.value.trim()||db.coachPortal?.name||'';
 const phone=$('#coachPortalPhone')?.value.trim()||db.coachPortal?.phone||'';
 if(!name){portalMessage='Enter the coach’s name before creating the coach portal.';render();return}
 const originalCoachPortal=structuredClone(db.coachPortal||{});
 cloudBusy=true;portalMessage='Creating the private coach portal…';render();
 try{
  if(!db.coachPortal)db.coachPortal={};
  if(!db.coachPortal.portalId)db.coachPortal.portalId=newPortalId();
  if(!db.coachPortal.portalPin)db.coachPortal.portalPin=newPortalPin();
  db.coachPortal.name=name;db.coachPortal.phone=phone;db.coachPortal.portalPinHash=await portalHash(db.coachPortal.portalId,db.coachPortal.portalPin);
  const ref=portalDoc(db.coachPortal.portalId),existing=await ref.get();
  if(existing.exists){
   const remoteExisting=existing.data()||{};
   if(remoteExisting.coachName&&remoteExisting.coachName!==name)throw new Error('portal-coach-identity-mismatch');
   if(remoteExisting.portalType&&remoteExisting.portalType!=='coach')throw new Error('portal-coach-type-mismatch');
  }
  const activePractice=db.activePortalPractice?.id===practicePlan?.portalDraftId?coachPracticePortalPayload(db.activePortalPractice?.activatedAt||null):null,remoteActive=existing.exists?(existing.data()||{}).activePractice:null;
  if(remoteActive&&activePractice&&remoteActive.id!==activePractice.id)throw new Error('coach-active-practice-conflict');
  const portalUpdate={portalType:'coach',coachName:name,firstName:practiceFirstName(name),pinHash:db.coachPortal.portalPinHash,...(!existing.exists?{ownerUid:null,activePractice}:{}),evaluationData:coachEvaluationPortalPayload(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()};
  await ref.set(portalUpdate,{merge:true});
  const verified=await ref.get(),remote=verified.exists?verified.data():null;
  if(!remote||remote.portalType!=='coach'||remote.coachName!==name||remote.pinHash!==db.coachPortal.portalPinHash||(activePractice&&remote.activePractice?.id!==practicePlan.portalDraftId))throw new Error('coach-portal-refresh-verification-failed');
  save();portalMessage='The private coach link and PIN are ready.';
 }catch(error){db.coachPortal=originalCoachPortal;console.error('Coach portal refresh failed',error);portalMessage=`The coach portal could not be refreshed${error?.message?`: ${error.message}`:'. Check the internet connection and try again.'}`}
 cloudBusy=false;render();
}
async function resetCoachPortal(){
 if(!cloudUser||!db.coachPortal?.portalId||!confirm(`Reset ${db.coachPortal.name||'Coach'}’s saved portal device? The link and PIN will stay the same.`))return;
 try{
  const ref=portalDoc(db.coachPortal.portalId);
  await ref.update({ownerUid:null,authorizedUids:firebase.firestore.FieldValue.delete(),pinProof:firebase.firestore.FieldValue.delete(),claimedAt:firebase.firestore.FieldValue.delete()});
  const verified=await ref.get(),remote=verified.exists?verified.data():null;
  if(!remote||remote.ownerUid!=null||Array.isArray(remote.authorizedUids)&&remote.authorizedUids.length)throw new Error('coach-portal-reset-verification-failed');
  portalMessage=`${practiceFirstName(db.coachPortal.name)} can connect a new device.`;
 }
 catch(error){portalMessage='The coach portal could not be reset.'}
 render();
}
async function resetPlayerPortal(player){
 if(!cloudUser||!player?.portalId||!confirm(`Reset ${practiceFirstName(player.name)}’s saved portal device? Her link and PIN will stay the same.`))return;
 try{
  const ref=portalDoc(player.portalId);
  await ref.update({ownerUid:null,authorizedUids:firebase.firestore.FieldValue.delete(),pinProof:firebase.firestore.FieldValue.delete(),claimedAt:firebase.firestore.FieldValue.delete()});
  const verified=await ref.get(),remote=verified.exists?verified.data():null;
  if(!remote||remote.ownerUid!=null||Array.isArray(remote.authorizedUids)&&remote.authorizedUids.length)throw new Error('player-portal-reset-verification-failed');
  portalMessage=`${practiceFirstName(player.name)} can connect a new device.`;
 }
 catch(error){portalMessage='That portal could not be reset.'}
 render();
}
function cloudRoot(){return cloudStore.collection('hotbUsers').doc(cloudUser.uid)}
async function loadCloudStatus(){
 try{
  // Startup needs the latest-backup timestamp, not a scan of every historical
  // snapshot. Snapshot count is maintained locally as backups are created/pruned.
  const snap=await cloudRoot().get();
  cloudLastBackup=snap.exists?snap.data().updatedAt?.toDate?.()||cloudLastBackup:null;
  if(cloudLastBackup)localStorage.setItem(CLOUD_LAST_SUCCESS_KEY,cloudLastBackup.toISOString());
 }catch(error){}
}
function scheduleCloudBackup(){
 if(!cloudUser||localStorage.getItem(CLOUD_ENABLED_KEY)!=='true'||cloudBusy)return;
 clearTimeout(cloudBackupTimer);
 // HotB can save local state many times while a coach builds/navigates a practice.
 // Debounce cloud backup long enough to collapse that burst into one backup.
 cloudBackupTimer=setTimeout(()=>backupToCloud(true),15000);
}
function dailySnapshotId(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`}
async function pruneDailySnapshots(root){
 // Retention maintenance is bounded to the small overflow beyond 30 snapshots.
 // Do not read chunk subcollections for retained snapshots.
 const history=await root.collection('snapshots').orderBy(firebase.firestore.FieldPath.documentId(),'desc').get(),expired=history.docs.slice(30);
 for(const snapshot of expired){
  const count=Number(snapshot.data()?.chunkCount||0),batch=cloudStore.batch();
  for(let index=0;index<count;index++)batch.delete(snapshot.ref.collection('chunks').doc(String(index).padStart(4,'0')));
  batch.delete(snapshot.ref);await batch.commit();
 }
 cloudSnapshotCount=Math.min(history.size,30);
}
async function backupToCloud(automatic=false){
 if(!cloudUser||cloudBusy)return;cloudBusy=true;if(!automatic){cloudMessage='Creating a protected cloud backup…';render()}
 try{
  const backupDb=sanitizedBackupDb();
  const json=JSON.stringify(backupDb),chunks=[];for(let i=0;i<json.length;i+=180000)chunks.push(json.slice(i,i+180000));
  const root=cloudRoot(),dailyRef=root.collection('snapshots').doc(dailySnapshotId());
  // Normal backup does not need to read the entire old chunk collection first.
  // Write the current chunk set and metadata atomically. Any surplus old chunks
  // are harmless because restore obeys chunkCount and fetches only that range.
  const daily=await dailyRef.get(),batch=cloudStore.batch();
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
 try{const root=cloudRoot(),meta=await root.get();if(!meta.exists)throw new Error('No backup');const count=Number(meta.data()?.chunkCount||0);if(!count)throw new Error('No backup chunks');const docs=await Promise.all(Array.from({length:count},(_,index)=>root.collection('chunks').doc(String(index).padStart(4,'0')).get()));if(docs.some(doc=>!doc.exists))throw new Error('Incomplete backup');const restored=JSON.parse(docs.map(doc=>doc.data().data).join(''));if(!Array.isArray(restored.roster)||!Array.isArray(restored.savedGames))throw new Error('Invalid backup');const cleanRestored=stripRestoredPortalState(restored);localStorage.setItem(DBKEY,JSON.stringify(cleanRestored));localStorage.setItem(CLOUD_ENABLED_KEY,'true');location.reload()}
 catch(error){cloudBusy=false;cloudMessage='No usable cloud backup was found. Your device data was not changed.';render()}
}
async function cloudPasswordAuth(createAccount=false){
 const password=$('#cloudPassword')?.value||'';
 if(cloudBusy)return;
 if(!cloudAuth){
  cloudMessage='Cloud Backup is still connecting. Finishing the connection now…';render();
  await initCloud();
  const deadline=Date.now()+10000;
  while(!cloudAuth&&Date.now()<deadline)await new Promise(resolve=>setTimeout(resolve,200));
  if(!cloudAuth){cloudMessage='Cloud Backup could not finish connecting. Close this window and try once more.';render();return}
 }
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
   const aliases={'Matti Hardy':'Mattingly Hardy'},savedRoster=Array.isArray(d.roster)?d.roster:[],keyFor=player=>player?.rosterKey||aliases[player?.name]||player?.name||'';
   const savedByKey=new Map(savedRoster.map(player=>[keyFor(player),player]));
   const removedNames=new Set(Array.isArray(d.removedRosterNames)?d.removedRosterNames.map(name=>aliases[name]||name):[]);
   const roster=defaultRoster.filter(profile=>!removedNames.has(profile.name)).map(profile=>{const saved=savedByKey.get(profile.name)||{},eligibility=Object.prototype.hasOwnProperty.call(profile,'hittingPracticeAttendanceEligible')?{hittingPracticeAttendanceEligible:profile.hittingPracticeAttendanceEligible}:{};return {...profile,...saved,...eligibility,rosterKey:profile.name,name:saved.name||profile.name,side:saved.side||profile.side}});
   const standardKeys=new Set(defaultRoster.map(r=>r.name));
   const guests=savedRoster.filter(player=>!standardKeys.has(keyFor(player))).map(player=>({...player,isGuest:true}));
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
 persistDbLocal();
}
function persistDbLocal({markCloud=true,scheduleBackup=true}={}){
 db.route=route;
 const json=JSON.stringify(db);
 try{localStorage.setItem(DBKEY,json)}catch(error){
  const quota=error?.name==='QuotaExceededError'||Number(error?.code)===22||/quota/i.test(String(error?.message||''));
  if(quota){
   // First reclaim only data that is provably reconstructable and unused after
   // a game is saved. Never delete stats/history to make room.
   if(compactReconstructableLocalCaches()){
    try{localStorage.setItem(DBKEY,JSON.stringify(db))}
    catch(retryError){console.error('HotB device storage quota exceeded after safe compaction',retryError);throw new Error('device-storage-quota-exceeded')}
   }else{console.error('HotB device storage quota exceeded',error);throw new Error('device-storage-quota-exceeded')}
  }else throw error;
 }
 if(markCloud&&localStorage.getItem(CLOUD_ENABLED_KEY)==='true')localStorage.setItem(CLOUD_PENDING_KEY,'true');
 if(scheduleBackup)scheduleCloudBackup();
}
function compactReconstructableLocalCaches(){
 let changed=false;
 // Completed-game undo stacks are never used by Undo (Undo operates only on
 // currentGame). Removing them cannot change stats, reports, observations,
 // pitches, plate appearances or Practice History.
 for(const game of db.savedGames||[]){if(Array.isArray(game?.undoStack)&&game.undoStack.length){delete game.undoStack;changed=true}}
 return changed;
}


window.addEventListener('online',()=>{if(localStorage.getItem(CLOUD_PENDING_KEY)==='true')scheduleCloudBackup()});
function go(r){
 // A Resolution apply is an atomic practice transaction. Generic navigation must
 // not render another surface, save transient role/Block 11 state, or invalidate
 // controls while its queued verifier still owns the rollback snapshot.
 if(route==='practice'&&r!=='practice'&&(practiceResolutionApplyToken||practiceResolutionApplyDraftId||practiceResolutionApplyOwnedDraftId)){console.warn('HotB deferred navigation during Practice Resolution verification.');return}
 if(route==='practice'&&practicePlan)persistPracticeSession();
 if(r==='practice'&&route!=='practice')practiceSection='hub';
 // A private portal URL is a dedicated surface. Do not let generic app
 // navigation leave its Firestore listener alive while another coach/app view
 // is rendered; invalidate any in-flight load before changing routes.
 if(portalToken&&r!=='portal'){
  portalLoadGeneration++;
  if(portalUnsubscribe){portalUnsubscribe();portalUnsubscribe=null}
  if(portalClockTimer){clearInterval(portalClockTimer);portalClockTimer=null}
 }
 route=r;modal=null;save();render();window.scrollTo(0,0);
 if(r==='practice')resumeRecoveredPracticeClock();
 if(r==='portal'&&portalToken&&!portalUnsubscribe&&!portalBusy)loadPlayerPortal();
}
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
 const allowed=new Set(competitionRoster().map(player=>player.name));
 order=[...new Set((order||[]).filter(name=>allowed.has(name)))];
 if(!order.length)return null;
 const openingPitcher={name:pitcherName,number:pitcherNumber,enteredAt:Date.now(),pitchIndex:0};
 const g={
  id:crypto.randomUUID(),date:new Date().toISOString(),opponent,pitcherName,pitcherNumber,
  pitchersUsed:[openingPitcher],battingOrder:order,hittersUsed:[...order],hitterSubstitutions:[],currentIdx:0,inning:1,outs:0,runners:[],plan:planFor(order[0]),pitchType:'FB',
  balls:0,strikes:0,paNumber:1,pitches:[],plateAppearances:[],observations:[],ended:false,
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
 persistDbLocal();
}
function positionTokens(player){return cleanCell(player?.positions).split(/\s*[|,\/]\s*/).map(position=>position.toUpperCase()).filter(Boolean)}
function isPitcherProfile(player){return positionTokens(player).some(position=>['P','RHP','LHP','PITCHER'].includes(position))}
function renamePlayerReferences(oldName,newName){
 if(!oldName||!newName||oldName===newName)return;
 const renameGame=game=>{
  if(!game)return;
  if(Array.isArray(game.battingOrder))game.battingOrder=game.battingOrder.map(name=>name===oldName?newName:name);
  if(Array.isArray(game.hittersUsed))game.hittersUsed=[...new Set(game.hittersUsed.map(name=>name===oldName?newName:name))];
  (game.pitches||[]).forEach(pitch=>{if(pitch.hitter===oldName)pitch.hitter=newName});
  (game.plateAppearances||[]).forEach(pa=>{if(pa.hitter===oldName)pa.hitter=newName});
  (game.observations||[]).forEach(item=>{if(item.playerName===oldName)item.playerName=newName});
  (game.hitterSubstitutions||[]).forEach(item=>{if(item.out===oldName)item.out=newName;if(item.in===oldName)item.in=newName});
 };
 (db.savedGames||[]).forEach(renameGame);renameGame(db.currentGame);
 (db.measurements||[]).forEach(item=>{if(item.player===oldName)item.player=newName});
 (db.coachObservations||[]).forEach(item=>{if(item.playerName===oldName)item.playerName=newName});
 (db.practiceHistory||[]).forEach(item=>{if(Array.isArray(item.attendees))item.attendees=item.attendees.map(name=>name===oldName?newName:name);if(Array.isArray(item.rosterPlayers))item.rosterPlayers=item.rosterPlayers.map(name=>name===oldName?newName:name);if(Array.isArray(item.excludedAttendancePlayers))item.excludedAttendancePlayers=item.excludedAttendancePlayers.map(name=>name===oldName?newName:name)});
 if(db.planPreferences&&Object.prototype.hasOwnProperty.call(db.planPreferences,oldName)){if(!Object.prototype.hasOwnProperty.call(db.planPreferences,newName))db.planPreferences[newName]=db.planPreferences[oldName];delete db.planPreferences[oldName]}
 if(db.playerFocusDrillOverrides&&typeof db.playerFocusDrillOverrides==='object')Object.keys(db.playerFocusDrillOverrides).filter(key=>key.startsWith(oldName+'::')).forEach(key=>{const next=newName+key.slice(oldName.length);if(!(next in db.playerFocusDrillOverrides))db.playerFocusDrillOverrides[next]=db.playerFocusDrillOverrides[key];delete db.playerFocusDrillOverrides[key]});
 const renamePracticeState=state=>{
  if(!state||typeof state!=='object')return;
  if(Array.isArray(state.selectedNames))state.selectedNames=state.selectedNames.map(name=>name===oldName?newName:name);
  if(state.accommodations&&Object.prototype.hasOwnProperty.call(state.accommodations,oldName)){if(!Object.prototype.hasOwnProperty.call(state.accommodations,newName))state.accommodations[newName]=state.accommodations[oldName];delete state.accommodations[oldName]}
 };
 renamePracticeState(practiceSetupState);
 const renamePracticePlan=plan=>{if(!plan)return;(plan.players||[]).forEach(player=>{if(player.name===oldName)player.name=newName});(plan.schedule||[]).forEach(row=>{if(row.player===oldName)row.player=newName;if(row.playerName===oldName)row.playerName=newName;if(row.pitcher===oldName)row.pitcher=newName;if(row.catcher===oldName)row.catcher=newName});};
 renamePracticePlan(practicePlan);
 if(db.activePracticeSession){renamePracticeState(db.activePracticeSession.setupState);renamePracticePlan(db.activePracticeSession.plan);if(Array.isArray(db.activePracticeSession.portalState?.players))db.activePracticeSession.portalState.players=db.activePracticeSession.portalState.players.map(name=>name===oldName?newName:name)}
 if(Array.isArray(db.activePortalPractice?.players))db.activePortalPractice.players=db.activePortalPractice.players.map(name=>name===oldName?newName:name);
}
function syncRosterNames(){
 const inputs=$$('.roster-name'),desired=inputs.map(input=>({input,player:db.roster[+input.dataset.i],name:input.value.trim()||'Unnamed Player'})).filter(item=>item.player);
 const seen=new Map();
 for(const item of desired){const key=item.name.toLowerCase();if(seen.has(key)){alert(`Player names must be unique. “${item.name}” is listed more than once.`);item.input.focus();return false}seen.set(key,item)}
 desired.forEach(({player,name:next})=>{
  const previous=player.name;if(next===previous)return;
  const canonical=defaultRoster.find(profile=>profile.name.toLowerCase()===next.toLowerCase());
  const removed=new Set(Array.isArray(db.removedRosterNames)?db.removedRosterNames:[]);
  if(player.isGuest&&canonical&&removed.has(canonical.name)){
   renamePlayerReferences(previous,canonical.name);
   Object.assign(player,{...canonical,...player,name:canonical.name,rosterKey:canonical.name,isGuest:false});
   db.removedRosterNames=(db.removedRosterNames||[]).filter(name=>name!==canonical.name);
   return;
  }
  renamePlayerReferences(previous,next);player.name=next;
 });
 return true;
}
function competitionRoster(){return db.roster.filter(player=>!player.isTeamJenkins)}
function currentHitter(g=currentGame()){return hitterObj(g?.battingOrder?.[g.currentIdx]||'')}
const undoViewKeys=['historyTab','allView','zoneScope','zoneFilter','previewNext','firstPitchView','showAi','pendingZone','pitchType','plan'];
function gameWithoutUndoViews(game){
 const actionGame=structuredClone(game||{});
 undoViewKeys.forEach(key=>delete actionGame[key]);
 return actionGame;
}
function gameUndoState(g){
 if(!g)return null;
 const {pitches=[],plateAppearances=[],observations=[],undoStack,...game}=g;
 return {gameId:g.id,game:gameWithoutUndoViews(game),pitches:structuredClone(pitches),plateAppearances:structuredClone(plateAppearances)};
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
 persistDbLocal();
}
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
function recalculateGameExecution(game){
 (game?.plateAppearances||[]).forEach(pa=>{
  const paKey=HotBEvaluationStats.plateAppearanceKey(pa),pitches=(game.pitches||[]).filter(pitch=>HotBEvaluationStats.plateAppearanceKey(pitch)===paKey);
  const execution=HotBEvaluationStats.executionFromPitches(pitches,hitterObj(pa.hitter));
  pa.executionSuccesses=execution.successes;
  pa.executionAttempts=execution.attempts;
  pa.execution=execution.rate;
 });
}
if((db.executionFormulaVersion||0)<5){
 (db.savedGames||[]).forEach(recalculateGameExecution);
 recalculateGameExecution(db.currentGame);
 db.executionFormulaVersion=5;
 persistDbLocal();
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
 if(g.outs>=3){g.outs=0;g.inning+=1;g.runners=[];return true}
 return false;
}
function queueInningObservation(g,completedInning){
 g.observationPromptedInnings=[...new Set([...(g.observationPromptedInnings||[]),completedInning])];
 observationPromptInning=completedInning;
 modal='inningObservationPrompt';
}
function resetLiveCount(g){
 g.balls=0;g.strikes=0;g.pendingZone=null;g.pitchType='FB';g.showAi=false;
}
function addManualOut(g){
 const completedInning=g.inning,inningEnded=recordOut(g);
 if(inningEnded){
  // A manual third out can be a baserunner out while the hitter is still at bat.
  // Preserve every logged pitch in game history, but start that same hitter with a
  // fresh PA/count next inning so the prior inning's pitches do not carry forward.
  const hitter=currentHitter(g),hasOpenPitches=(g.pitches||[]).some(p=>p.pa===g.paNumber&&p.hitter===hitter?.name);
  if(hasOpenPitches)g.paNumber+=1;
  resetLiveCount(g);g.historyTab='LIVE';g.allView='DOTS';g.zoneScope='HITTER';g.zoneFilter='K';g.previewNext=false;g.firstPitchView=false;
  queueInningObservation(g,completedInning);
 }
 return inningEnded;
}
function subtractManualOut(g){
 g.outs=Math.max(0,g.outs-1);
}
function addPitch(result,extra={}){
 const g=currentGame(); if(!g)return;
 const h=currentHitter(g);
 const pitch={
  id:crypto.randomUUID(),hitter:h.name,pa:g.paNumber,inning:g.inning,ballsBefore:g.balls,strikesBefore:g.strikes,
  zone:g.pendingZone||'',pitchType:g.pitchType,plan:g.plan,result,pitcherName:g.pitcherName||'',pitcherNumber:g.pitcherNumber||'',
  opponent:g.opponent||'',gameId:g.id,hitterStyle:h.side||'R',runnersBefore:[...g.runners],outsBefore:g.outs,ts:Date.now(),...extra
 };
 if(g.pendingDecisionOverride)pitch.decisionOverride=g.pendingDecisionOverride;
 g.pendingDecisionOverride='';
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
 const g=currentGame();if(!g||(g.battingOrder||[]).length===0)return;
 const h=currentHitter(g);
 const paPitches=g.pitches.filter(p=>p.pa===g.paNumber&&p.hitter===h.name);
 const firstPitchStrike = HotBEvaluationStats.firstPitchStrikeRate([{pitches:paPitches}],h.name).rate===1;
 const execution=HotBEvaluationStats.executionFromPitches(paPitches,h);
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
 const completedInning=g.inning,inningEnded=['H4O','K','SAC'].includes(outcome)&&recordOut(g);
 g.balls=0;g.strikes=0;g.paNumber++;
 g.currentIdx=(g.currentIdx+1)%g.battingOrder.length;
 g.plan=planFor(g.battingOrder[g.currentIdx]);
 g.pitchType='FB';
 if(inningEnded)queueInningObservation(g,completedInning);
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
 const observations=structuredClone(g.observations||[]);
 const pitches=structuredClone(previous.pitches||[]);
 const plateAppearances=structuredClone(previous.plateAppearances||[]);
 db.currentGame={...structuredClone(previous.game),...viewState,pitches,plateAppearances,observations,undoStack:stack};
 lastRenderedUndoState=gameUndoState(db.currentGame);
 save();render();
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
window.HotBSeasonMeta=seasonMeta;
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
 const yearSelect=`<select class="input" id="${prefix}SeasonFilter" aria-label="Year">${availableSeasons().map(season=>`<option ${season===selectedSeason?'selected':''}>${season}</option>`).join('')}</select>`;
 const seasonSelect=`<select class="input" id="${prefix}DateRange" aria-label="Season"><option value="full" ${dateFilterMode==='full'?'selected':''}>Full Season</option><option value="fall" ${dateFilterMode==='fall'?'selected':''}>Fall</option><option value="summer" ${dateFilterMode==='summer'?'selected':''}>Summer</option><option value="custom" ${dateFilterMode==='custom'?'selected':''}>Custom Dates</option></select>`;
 return `<div class="date-filter-controls">${prefix==='eval'?`<label><span>Year</span>${yearSelect}</label><label><span>Season</span>${seasonSelect}</label>`:`${yearSelect}${seasonSelect}`}${dateFilterMode==='custom'?`<label>Start<input class="input" id="${prefix}DateStart" type="date" value="${customDateStart}"></label><label>End<input class="input" id="${prefix}DateEnd" type="date" value="${customDateEnd}"></label>`:''}</div>`;
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
function render(){
 captureGameUndo();
 if(portalClockTimer){clearInterval(portalClockTimer);portalClockTimer=null}
 const app=document.getElementById('app');
 app.innerHTML=`<div class="app ${route==='live'?'live-app':route==='eval'?'eval-app':route==='practice'?'practice-app':route==='portal'?'portal-app':''}">${route==='home'?homeView():
 route==='new'?newGameView():route==='roster'?rosterView():
 route==='live'?liveView():route==='eval'?evalView():route==='reports'?reportsPage():route==='practice'?practicePage():route==='portal'?playerPortalPage():homeView()}</div>${modal?modalView():''}`;
 bind();
 // Keep the synchronized practice clock alive on every active portal view,
 // including a permanent player's assigned-drill detail. Otherwise a player who
 // opened a drill before the final block could remain on that stale detail after
 // the locally-derived end time if the coach cleanup snapshot is delayed.
 if(route==='portal'&&portalData?.activePractice){updatePortalPracticeClock();portalClockTimer=setInterval(updatePortalPracticeClock,500)}
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
    <button class="home-card" data-go="practice"><h3>${practicePlan||db.activePracticeSession?'Resume Hitting Practice':'Hitting Practice'}</h3></button>
    <button class="home-card cloud-card ${cloudError?'attention':cloudLastBackup?'healthy':''}" id="openCloudBackup"><h3>Cloud Backup</h3></button>
   </div>
 </div><div class="home-footer"><span>HOTB (THE ELITE HITTING APP) · REBUILD <small class="app-version">Version: ${esc(window.HOTB_BUILD_VERSION||'2026.09.14.1')}</small></span><div class="home-footer-actions"><button class="home-guide-button" id="openRecoveryGuide">Recovery Guide</button><button class="home-guide-button home-portal-button" data-go="portal">Player Portal</button></div></div>`;
}
function portalHeader(title='Player Portal',showBack=false){
 const practiceOnly=['guestPlayer','guestCoach','jenkinsPlayer'].includes(portalData?.portalType);
 // Practice-only links do not have a permanent dashboard. Their Back/Portal
 // control must return to the live practice screen, never the full player hub.
 const backId=showBack&&practiceOnly?'portalPracticeBack':showBack?'portalBack':portalToken?'portalDashboard':'';
 return `<div class="page-match-head page-head-centered portal-head"><button class="page-head-nav" ${backId?`id="${backId}"`:'data-go="home"'}>${showBack?'Back':portalToken?'Portal':'Home'}</button><h1>${esc(title)}</h1><span class="page-head-spacer"></span></div>`;
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
function focusDrillKey(playerName=practiceFocusPlayer,range=practiceFocusRange){return`${playerName}::${range}`}
function focusSuggestedDrills(query,playerName=practiceFocusPlayer,range=practiceFocusRange){
 const library=Array.isArray(window.HotBDrillLibrary)?window.HotBDrillLibrary:[],recommended=query?recommendPortalDrills(query).slice(0,3):[],saved=db.playerFocusDrillOverrides?.[focusDrillKey(playerName,range)];
 if(!Array.isArray(saved))return recommended;
 return saved.map(name=>library.find(drill=>drill.name===name)).filter(Boolean).slice(0,3);
}
function portalCoachView(){
 const players=db.roster.filter(player=>!player.isGuest&&!player.isTeamJenkins),ready=players.length&&players.every(player=>player.portalId&&player.portalPin);
 const coachReady=!!(db.coachPortal?.portalId&&db.coachPortal?.portalPin);
 if(!cloudAuthReady)return `${portalHeader()}<main class="portal-page"><section class="portal-welcome"><span>COACH SETUP</span><h2>Connecting Player Portal Manager…</h2><p>Restoring the saved coach cloud session on this device.</p></section><p class="small">No player links are being changed.</p><button class="btn black block" data-go="home">Return Home</button></main>`;
 if(!cloudUser)return `${portalHeader()}<main class="portal-page"><section class="portal-welcome"><span>COACH SETUP</span><h2>Reconnect Player Portal Manager</h2><p>Your saved player links have not been removed. The coach cloud session on this device needs to be reconnected.</p></section><p class="small">Reconnect through Cloud Backup on the Home Screen. Your player links remain saved.</p><button class="btn black block" data-go="home">Return Home</button></main>`;
 return `${portalHeader()}<main class="portal-page"><section class="portal-welcome"><span>COACH SETUP</span><h2>${ready?'Player Portals Are Ready':'Create Private Player Portals'}</h2><p>Each player receives one private link and a six-digit PIN. Her first successful login connects that portal to her device.</p></section>${portalMessage?`<p class="portal-message">${esc(portalMessage)}</p>`:''}<section class="portal-coach-setup"><span>ONE COACH</span><h2>${coachReady?'Coach Portal Is Ready':'Create Coach Portal'}</h2><p>This coach receives one private, block-by-block duty plan for each active practice.</p><label class="label" for="coachPortalName">Coach Name</label><input class="input" id="coachPortalName" value="${esc(db.coachPortal?.name||'')}" placeholder="Coach name"><label class="label" for="coachPortalPhone">Cell Number (optional)</label><input class="input" id="coachPortalPhone" inputmode="tel" value="${esc(db.coachPortal?.phone||'')}" placeholder="Cell number"><button class="btn black block" id="setupCoachPortal" ${cloudBusy?'disabled':''}>${coachReady?'Refresh Coach Portal':'Create Coach Portal'}</button>${coachReady?`<div class="portal-coach-ready"><b>${esc(db.coachPortal.name)}</b><span>PIN ${esc(db.coachPortal.portalPin)}</span><div class="portal-player-actions"><button type="button" class="btn" id="shareCoachPortal">Share</button><button type="button" class="btn" id="textCoachPortal" ${db.coachPortal.phone?'':'disabled'}>${db.coachPortal.phone?'Text':'No Cell'}</button><button class="btn" id="resetCoachPortal">Reset</button></div></div>`:''}</section><button class="btn black block portal-setup-button" id="setupPlayerPortals" ${cloudBusy?'disabled':''}>${ready?'Refresh Player Records':'Create Player Portals'}</button>${ready?`<section class="portal-player-list">${players.map(player=>`<article><div><b>${esc(practiceFirstName(player.name))}</b><span>PIN ${esc(player.portalPin)}</span></div><div class="portal-player-actions"><button type="button" class="btn" data-share-portal="${esc(player.name)}">Share</button><button type="button" class="btn" data-text-portal="${esc(player.name)}" ${player.phone?'':'disabled'}>${player.phone?'Text':'No Cell'}</button><button class="btn" data-reset-portal="${esc(player.name)}">Reset</button></div></article>`).join('')}</section><p class="portal-private-note">Text opens an individual message with that player’s private link and PIN. You review it and tap Send. Reset connects the portal to a replacement phone without changing her link or PIN.</p>`:''}</main>`;
}
function portalLoginView(){
 return `${portalHeader()}<main class="portal-page"><section class="portal-welcome"><span>PRIVATE ACCESS</span><h2>${portalBusy?'Opening Your Portal':'Enter Your PIN'}</h2><p>${portalBusy?'HotB is checking this private link.':'Use the six-digit PIN provided by the head coach. This portal will then connect to this device.'}</p></section>${portalMessage?`<p class="portal-message">${esc(portalMessage)}</p>`:''}${portalBusy?'':`<label class="label" for="portalPin">Portal PIN</label><input class="input portal-pin" id="portalPin" inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="000000"><button class="btn black block" id="openPlayerPortal" type="button" onclick="window.HotBOpenPlayerPortal&&window.HotBOpenPlayerPortal()">Open My Portal</button>`}</main>`;
}
function coachPortalPracticeView(){
 const practice=portalData?.activePractice,name=portalData?.firstName||practiceFirstName(portalData?.coachName)||'Coach',clock=portalPracticeClockValues(practice),current=Number(clock.currentBlock)||0;
 const locallyEnded=!!practice&&clock.ended,clockReady=!practice||['Not Started','DONE!'].includes(clock.block)||/^\\d+ of 10$/.test(clock.block)||clock.block==='ROTATE';
 if(locallyEnded)return `${portalHeader('Coach Portal')}<main class="portal-page"><section class="portal-empty"><span>COACH PORTAL</span><h2>Practice Complete</h2><p>This practice has ended. HotB is waiting for the final cloud cleanup.</p></section><button class="btn red block coach-eval-button" data-portal-view="evaluation">Player Eval</button></main>`;
 if(practice&&!clockReady)return `${portalHeader('Coach Portal')}<main class="portal-page"><section class="portal-empty"><span>COACH PORTAL</span><h2>Syncing Practice</h2><p>HotB is verifying the live practice clock before showing coaching assignments.</p></section><button class="btn red block coach-eval-button" data-portal-view="evaluation">Player Eval</button></main>`;
 return `${portalHeader('Coach Portal')}<main class="portal-page"><section class="portal-welcome ${practice?'active':''}"><span>${practice?'ACTIVE PRACTICE':'COACH PORTAL'}</span><h2>Hi, ${esc(name)}</h2><p>${practice?'Your current coaching assignments are below.':'No practice is active right now.'}</p></section><button class="btn red block coach-eval-button" data-portal-view="evaluation">Player Eval</button>${practice?`<section class="portal-live-clock"><div><span>BLOCK</span><b id="portalCurrentBlock">${esc(clock.block)}</b></div><div><span>TIME LEFT</span><b id="portalTimeLeft">${esc(clock.left)}</b></div></section><article class="practice-player-card portal-player-card portal-coach-card"><header><h2>${esc(name)} <small>(Coach)</small></h2></header><ol>${(practice.schedule||[]).map(entry=>`<li data-portal-block="${entry.block}"${current>0&&Number(entry.block)<current?' hidden':''}><b>B${entry.block}</b><span class="card-time">${esc(entry.time)}</span><strong>${esc(entry.assignment)}</strong></li>`).join('')}</ol></article>`:''}</main>`;
}
function guestPortalEndedView(){return `${portalHeader('Hitting Practice')}<main class="portal-page"><section class="portal-empty"><span>GUEST ACCESS</span><h2>This Practice Has Ended</h2><p>This temporary link is no longer active.</p></section></main>`}
function guestPortalWaitingView(){const first=portalData?.firstName||practiceFirstName(portalData?.playerName||portalData?.coachName),jenkins=portalData?.portalType==='jenkinsPlayer';return `${portalHeader('Hitting Practice')}<main class="portal-page"><section class="portal-empty"><span>${jenkins?'PRACTICE ACCESS':'GUEST ACCESS CONFIRMED'}</span><h2>Hi, ${esc(first)}</h2><p>${jenkins?'No practice is active right now. Use this same link the next time you practice with us.':'You’re connected to tonight’s HotB practice. Your practice plan is not ready yet.'}</p></section></main>`}
function guestCoachPracticeView(){
 const practice=portalData?.activePractice,name=portalData?.firstName||practiceFirstName(portalData?.coachName)||'Coach',clock=portalPracticeClockValues(practice),current=Number(clock.currentBlock)||0,done=clock.ended;
 if(portalData?.expired||!practice||done)return guestPortalEndedView();
 return `${portalHeader('Guest Coach')}<main class="portal-page"><section class="portal-welcome active"><span>GUEST COACH · VIEW ONLY</span><h2>Hi, ${esc(name)}</h2><p>${esc(practice.title||'Current Hitting Practice')}</p></section><section class="portal-live-clock"><div><span>BLOCK</span><b id="portalCurrentBlock">${esc(clock.block)}</b></div><div><span>TIME LEFT</span><b id="portalTimeLeft">${esc(clock.left)}</b></div></section>${(practice.players||[]).map(player=>`<article class="practice-player-card portal-player-card portal-guest-coach-card"><header><h2>${esc(player.name)}${player.role?` <small>(${esc(player.role)})</small>`:''}</h2></header><ol>${player.schedule.map(entry=>`<li data-portal-block="${entry.block}"${current>0&&Number(entry.block)<current?' hidden':''}><b>B${entry.block}</b><span class="card-time">${esc(entry.time)}</span>${portalPracticeAssignment(entry)}</li>`).join('')}</ol></article>`).join('')}</main>`;
}
function playerEvaluationPortalPayload(playerName){
 const player=competitionRoster().find(item=>item.name===playerName);if(!player)return {roster:[],savedGames:[],currentGame:null,evaluationSeason:currentSeasonLabel()};
 const rosterFields=['name','side'];
 const paFields=['hitter','pa','outcome','hitType','contactType','rbi','rbiCount','rba','sac','bunt','hhb','weak','pitchCount','finalCount'];
 const pitchFields=['id','hitter','pa','strikesBefore','zone','pitchType','plan','result','contactType','hitterStyle','intentionalBall','pitchout','decisionOverride','hhb','ts'];
 const pick=(source,fields)=>Object.fromEntries(fields.filter(key=>source?.[key]!==undefined).map(key=>[key,source[key]]));
 const roster=[pick(player,rosterFields)];
 const season=currentSeasonLabel(),sourceGames=[...(db.savedGames||[]),...(db.currentGame?[db.currentGame]:[])].filter(game=>{const meta=seasonMeta(game.date);return meta.season===season&&meta.segment!=='Dead Period'}),games=sourceGames.map(game=>{const pitches=(game.pitches||[]).filter(p=>p.hitter===playerName).map(p=>pick(p,pitchFields)),plateAppearances=(game.plateAppearances||[]).filter(pa=>pa.hitter===playerName).map(pa=>{const payload=pick(pa,paFields),paKey=HotBEvaluationStats.plateAppearanceKey(pa),execution=HotBEvaluationStats.executionFromPitches(pitches.filter(p=>HotBEvaluationStats.plateAppearanceKey(p)===paKey),player);return{...payload,executionSuccesses:execution.successes,executionAttempts:execution.attempts}});return{id:game.id,date:game.date,opponent:game.opponent,plateAppearances,pitches}}).filter(game=>game.plateAppearances.length||game.pitches.length);
 return JSON.parse(JSON.stringify({roster,savedGames:games,currentGame:null,evaluationSeason:season}));
}
function coachEvaluationPortalPayload(){
 const fields=['name','jersey','grad','positions','side','throws','gpa','school','interest','email','twitter','sportsRecruits','highlightVideo','ncaaId','recruitingStatement','accomplishments','photo','pitcherIP','pitcherERA','pitcherWHIP','pitcherKBB','pitcherOBA','pitcherStrikePct','hittingPracticeAttendanceEligible'];
 const pitchFields=['id','hitter','pa','strikesBefore','zone','pitchType','plan','result','contactType','hitterStyle','intentionalBall','pitchout','decisionOverride','hhb','ts'];
 const pick=(source,keys)=>Object.fromEntries(keys.filter(key=>source?.[key]!==undefined).map(key=>[key,source[key]]));
 const compactGame=game=>game?{id:game.id,date:game.date,opponent:game.opponent,plateAppearances:game.plateAppearances||[],pitches:(game.pitches||[]).map(pitch=>pick(pitch,pitchFields))}:null;
 const competitionNames=new Set(competitionRoster().map(player=>player.name)),filterGame=game=>{const compact=compactGame(game);if(!compact)return null;compact.plateAppearances=(compact.plateAppearances||[]).filter(pa=>competitionNames.has(pa.hitter));compact.pitches=(compact.pitches||[]).filter(pitch=>competitionNames.has(pitch.hitter));return compact};
 const practiceHistory=(window.HotBPracticeHistory?.records(db.practiceHistory)||[]).map(record=>({...record,attendees:Array.isArray(record.attendees)?record.attendees.filter(name=>competitionNames.has(name)):record.attendees,rosterPlayers:Array.isArray(record.rosterPlayers)?record.rosterPlayers.filter(name=>competitionNames.has(name)):record.rosterPlayers,excludedAttendancePlayers:Array.isArray(record.excludedAttendancePlayers)?record.excludedAttendancePlayers.filter(name=>competitionNames.has(name)):record.excludedAttendancePlayers})),payload={roster:competitionRoster().filter(player=>!player.isGuest).map(player=>Object.fromEntries(fields.map(key=>[key,player[key]??'']))),savedGames:db.savedGames.map(filterGame),measurements:(db.measurements||[]).filter(item=>competitionNames.has(item.player)).map(({id,player,type,value,date})=>({id,player,type,value,date})),coaches:(db.coaches||[]).map(({coachName,coachEmail,collegeName,lastUpdated})=>({coachName,coachEmail,collegeName,lastUpdated})),practiceHistory,currentGame:filterGame(db.currentGame)};
 return JSON.parse(JSON.stringify(payload));
}
function withCoachEvaluationData(callback){const original=db,readOnly=evaluationReadOnly;db=portalData?.evaluationData||{roster:[],savedGames:[],measurements:[],coaches:[],practiceHistory:[],currentGame:null};evaluationReadOnly=true;try{return callback()}finally{db=original;evaluationReadOnly=readOnly}}
function coachPortalEvaluationView(){return withCoachEvaluationData(()=>evalView())}
function portalAssignmentDrillName(assignment){return (Array.isArray(window.HotBDrillLibrary)?window.HotBDrillLibrary:[]).find(drill=>assignment===drill.name||String(assignment||'').endsWith(`— ${drill.name}`))?.name||''}
function portalPracticeAssignment(entry){const drill=portalAssignmentDrillName(entry.assignment),practiceOnly=['guestPlayer','guestCoach','jenkinsPlayer'].includes(portalData?.portalType),allowed=!practiceOnly||!!drill&&(portalData?.activePractice?.drills||[]).includes(drill);return drill&&allowed?`<button class="portal-practice-drill-link" data-portal-practice-drill="${esc(drill)}">${esc(entry.assignment)}</button>`:`<strong>${esc(entry.assignment)}</strong>`}
function portalNextAssignmentDetails(assignment){
 const value=String(assignment||''),drill=portalAssignmentDrillName(value);
 let match=value.match(/^Drill Station (\d+)\s+—\s+(.+)$/i);
 if(match)return {heading:`NEXT — DRILL STATION ${match[1]}`,detail:match[2],drill};
 match=value.match(/^Machine(?:\s+—\s+(.+))?$/i);
 if(match)return {heading:'NEXT — MACHINE',detail:match[1]||'',drill};
 match=value.match(/^Front Toss(?:\s+—\s+(.+))?$/i);
 if(match)return {heading:'NEXT — FRONT TOSS',detail:match[1]||'',drill};
 if(/\bLive\b/i.test(value))return {heading:'NEXT — LIVE',detail:value,drill};
 const parts=value.split(/\s+—\s+/);
 return {heading:`NEXT — ${(parts.shift()||'ASSIGNMENT').toUpperCase()}`,detail:parts.join(' — '),drill};
}
function portalPracticeView(){
 const practice=portalData?.activePractice,clock=portalPracticeClockValues(practice);
 const locallyEnded=!!practice&&clock.ended;
 if(locallyEnded)return `${portalHeader('My Practice',true)}<main class="portal-page"><section class="portal-empty"><span>MY PRACTICE</span><h2>Practice Complete</h2><p>This practice has ended. Your coach’s portal cleanup will remove it from this link.</p></section></main>`;
 const first=portalData?.firstName||practiceFirstName(portalData?.playerName),role=practice?.role;
 const drillAssignments=practice?.drillAssignments||practice?.drills?.map(drill=>({name:drill,location:'Assigned Drill'}))||[];
 const clockReady=!practice||clock.block==='Not Started'||clock.block==='DONE!'||clock.block==='ROTATE'||(Number(clock.currentBlock)>=1&&Number(clock.currentBlock)<=10);
 if(practice&&!clockReady)return `${portalHeader('My Practice',true)}<main class="portal-page"><section class="portal-empty"><span>MY PRACTICE</span><h2>Syncing Practice</h2><p>HotB is verifying the live practice clock. Your schedule will appear as soon as synchronization is confirmed.</p></section></main>`;
 return `${portalHeader('My Practice',true)}<main class="portal-page">${practice?`<section class="portal-welcome active"><span>ACTIVE PRACTICE</span><h2>${esc(practice.title||'This Week’s Practice')}</h2><p>${esc(practice.startLabel||'')} · ${Math.max(1,(Number(practice.blockMinutes)||12)-1)} minutes + 1-minute rotate</p></section><section class="portal-live-clock"><div><span>BLOCK</span><b id="portalCurrentBlock">${esc(clock.block)}</b></div><div><span>TIME LEFT</span><b id="portalTimeLeft">${esc(clock.left)}</b></div></section><section class="portal-practice-next" id="portalPracticeNext" hidden><button id="portalPracticeNextButton" data-portal-practice-drill=""><span id="portalPracticeNextHeading">NEXT</span><strong id="portalPracticeNextDetail"></strong><small>Tap for drill instructions</small></button></section><article class="practice-player-card portal-player-card"><header><h2>${esc(first)}${role?` <small>(${esc(role)})</small>`:''}</h2></header><ol>${(practice.schedule||[]).map(entry=>`<li data-portal-block="${entry.block}"><b>B${entry.block}</b><span class="card-time">${esc(entry.time)}</span>${portalPracticeAssignment(entry)}</li>`).join('')}</ol></article>${drillAssignments.length?`<section class="portal-practice-drills"><h3>Assigned Drills</h3>${drillAssignments.map(item=>`<p><button class="portal-practice-drill-link" data-portal-practice-drill="${esc(item.name)}"><span>${esc(item.location)}</span>${esc(item.name)}</button></p>`).join('')}</section>`:''}`:`<section class="portal-empty"><span>MY PRACTICE</span><h2>No Active Practice</h2><p>Your coach has not activated a practice plan for you right now.</p></section>`}</main>`;
}
function portalFocusBody(focus){
 return focus?`<section class="portal-welcome"><span>MY PLAYER FOCUS</span><h2>${esc(focus.title||'Current Hitting Focus')}</h2><p>${esc(focus.summary||'')}</p></section><section class="portal-focus-content">${focus.needsWork?`<div><span>NEEDS WORK</span><b>${esc(focus.needsWork)}</b></div>`:''}${focus.coachNote?`<div><span>COACH NOTE</span><b>${esc(focus.coachNote)}</b></div>`:''}${focus.drills?.length?`<div><span>DRILL PLAN</span><b>${esc(focus.drills.join(' · '))}</b></div>`:''}</section>`:`<section class="portal-empty"><span>MY FOCUS</span><h2>No Focus Plan Yet</h2><p>Your private two-week hitting analysis has not been published. No other player’s information is available from this portal.</p></section>`;
}
function portalFocusView(){
 return `${portalHeader('My Focus',true)}<main class="portal-page">${portalFocusBody(portalData?.focus)}</main>`;
}
function portalLibraryView(){
 const allDrills=Array.isArray(window.HotBDrillLibrary)?window.HotBDrillLibrary:[],practiceOnly=['guestPlayer','guestCoach','jenkinsPlayer'].includes(portalData?.portalType),practiceEnded=practiceOnly&&portalPracticeClockValues(portalData?.activePractice).block==='DONE!',allowed=practiceOnly?new Set(practiceEnded?[]:portalData?.activePractice?.drills||[]):null,drills=allowed?allDrills.filter(drill=>allowed.has(drill.name)):allDrills,selected=drills.find(drill=>drill.name===portalSelectedDrill);
 if(selected){const detail=(title,value)=>value?`<section class="practice-drill-detail-section"><h3>${esc(title)}</h3><p>${esc(value)}</p></section>`:'';return `${portalHeader('Drill Library',true)}<main class="portal-page practice-drill-detail"><button class="practice-library-return" id="portalLibraryBack">‹ ${portalLibraryReturnView==='practice'?'Back To My Practice':'Back To All Drills'}</button><section class="practice-drill-detail-head"><span>${esc(selected.category)}</span><h2>${esc(selected.name)}</h2><p>${esc(selected.primaryPurpose)}</p><div class="practice-drill-tags"><span>${esc(selected.hittingMethod)}</span>${selected.equipment?`<span>${esc(selected.equipment)}</span>`:''}</div></section>${detail('Best Used For',selected.bestUsedFor)}${detail('How It Works',selected.howItWorks)}${detail('Key Coaching Cues',selected.coachingCues)}${detail('What Success Looks Like',selected.success)}${detail('Space / Setup',selected.spaceSetup)}${selected.mediaLink?`<a class="btn black block" href="${esc(selected.mediaLink)}" target="_blank" rel="noopener">Watch Drill</a>`:''}</main>`}
 const query=portalDrillQuery.trim().toLowerCase(),shown=drills.filter(drill=>!query||Object.values(drill).some(value=>String(value).toLowerCase().includes(query)));
 return `${portalHeader('Drill Library',true)}<main class="portal-page"><div class="practice-library-search"><input class="input" id="portalDrillSearch" type="search" placeholder="Search drills" value="${esc(portalDrillQuery)}" aria-label="Search drills"></div><p class="practice-library-count">${shown.length} ${shown.length===1?'drill':'drills'}</p><section class="practice-drill-list">${shown.map(drill=>`<button class="practice-drill-card" data-portal-drill="${esc(drill.name)}"><span>${esc(drill.category)}</span><h3>${esc(drill.name)}</h3><p>${esc(drill.primaryPurpose)}</p><div class="practice-drill-tags"><span>${esc(drill.hittingMethod)}</span></div></button>`).join('')}</section></main>`;
}
function portalAskView(){
 return `${portalHeader('Ask The Library',true)}<main class="portal-page"><section class="portal-welcome"><span>DRILL FINDER</span><h2>What Do You Want To Work On?</h2><p>Describe what is happening in your swing or the pitch you are struggling to hit. HotB will recommend drills only from the KC Rebels library.</p></section><div class="portal-ask"><textarea class="input" id="portalProblem" rows="4" placeholder="Example: I keep popping up.">${esc(portalDrillQuery)}</textarea><button class="btn black block" id="findPortalDrills">Find My Drills</button></div>${portalDrillResults.length?`<section class="portal-recommendations"><h3>Recommended Drills</h3>${portalDrillResults.map((drill,index)=>`<button data-portal-recommendation="${esc(drill.name)}"><b>${index+1}</b><span><strong>${esc(drill.name)}</strong><small>${esc(drill.bestUsedFor||drill.primaryPurpose)}</small></span></button>`).join('')}</section>`:portalDrillQuery?`<section class="portal-empty compact"><h2>No Strong Match Yet</h2><p>Try describing the result, pitch location, timing problem, or part of the swing you want to improve.</p></section>`:''}</main>`;
}
function portalDashboardView(){
 const first=portalData?.firstName||practiceFirstName(portalData?.playerName),active=!!portalData?.activePractice&&!portalPracticeClockValues(portalData.activePractice).ended;
 return `${portalHeader()}<main class="portal-page"><section class="portal-welcome ${active?'active':''}"><span>${active?'PRACTICE ACTIVE':'PLAYER PORTAL'}</span><h2>Hi, ${esc(first)}</h2><p>${active?'Your current practice plan is ready below.':'Your practice, personal focus and KC Rebels drill library are all in one place.'}</p></section><section class="portal-dashboard">${active?`<button class="active" data-portal-view="practice"><span>PRACTICE</span><h3>My Practice</h3><p>View your active rotation.</p></button>`:''}<button data-portal-view="focus"><span>PLAYER</span><h3>My Focus</h3><p>Your private hitting focus and assigned drills.</p></button><button data-portal-view="library"><span>LIBRARY</span><h3>Drill Library</h3><p>Search every approved KC Rebels hitting drill.</p></button><button data-portal-view="ask"><span>DRILL FINDER</span><h3>Ask The Library</h3><p>Describe a problem and find drills that address it.</p></button></section><p class="portal-private-note">This portal is linked only to ${esc(first)}. It does not provide access to another player’s practice or Player Focus.</p></main>`;
}
function playerPortalPage(){
 if(!portalToken)return portalCoachView();
 if(!portalData)return portalLoginView();
 const activePracticeClock=portalPracticeClockValues(portalData.activePractice),activePracticeEnded=!!portalData.activePractice&&activePracticeClock.ended;
 if(portalData.portalType==='guestCoach')return portalData.expired||activePracticeEnded?guestPortalEndedView():!portalData.activePractice?guestPortalWaitingView():(portalView==='library'?portalLibraryView():guestCoachPracticeView());
 if(['guestPlayer','jenkinsPlayer'].includes(portalData.portalType))return portalData.expired||activePracticeEnded?guestPortalEndedView():!portalData.activePractice?guestPortalWaitingView():(portalView==='library'?portalLibraryView():portalPracticeView());
 if(portalData.portalType==='coach')return portalView==='evaluation'?coachPortalEvaluationView():coachPortalPracticeView();
 // Permanent-player practice navigation is valid only while a live synchronized
 // practice exists. If a stale view survives a snapshot/update, route home
 // instead of rendering an old/empty practice page.
 if((!portalData.activePractice||activePracticeEnded)&&portalView==='practice'){portalView='home';portalSelectedDrill='';portalDrillQuery='';portalLibraryReturnView='library'}
 // Once practice is removed, no practice-origin drill detail may survive locally.
 // This prevents an already-open iPhone from continuing to show an ended drill
 // after the Firestore cleanup snapshot has correctly cleared activePractice.
 if(!portalData.activePractice&&portalLibraryReturnView==='practice'){portalView='home';portalSelectedDrill='';portalDrillQuery='';portalLibraryReturnView='library'}
 if(portalView==='practice')return portalPracticeView();
 if(portalView==='focus')return portalFocusView();
 if(portalView==='library')return portalLibraryView();
 if(portalView==='ask')return portalAskView();
 return portalDashboardView();
}
function practiceTimeMinutes(value){const match=String(value||'').match(/^(\d{2}):(\d{2})$/);if(!match)return null;const hour=Number(match[1]),minute=Number(match[2]);return hour>=0&&hour<24&&minute>=0&&minute<60?hour*60+minute:null}
function practiceTimeValue(minutes){const normalized=(Math.round(minutes)+1440)%1440;return `${String(Math.floor(normalized/60)).padStart(2,'0')}:${String(normalized%60).padStart(2,'0')}`}
function practiceEndValue(startTime,durationMinutes){const start=practiceTimeMinutes(startTime),duration=Number(durationMinutes);return start===null||!Number.isFinite(duration)||duration<=0?'':practiceTimeValue(start+duration)}
function practiceTimeLabel(value){const minutes=practiceTimeMinutes(value);if(minutes===null)return '—';const hour=Math.floor(minutes/60);return `${hour%12||12}:${String(minutes%60).padStart(2,'0')}${hour<12?'a':'p'}`}
function practiceAccommodation(player){
 const saved=practiceSetupState.accommodations?.[player.name]||{};
 const hasPrePracticeSetting=Object.prototype.hasOwnProperty.call(saved,'prePracticeComplete');
 return {arrival:saved.arrival||'',departure:saved.departure||'',limitations:saved.limitations||'',prePracticeComplete:player.isTeamJenkins?(hasPrePracticeSetting?!!saved.prePracticeComplete:true):(!!player.isPracticeGuest&&!!saved.prePracticeComplete),canPitch:isPitcherProfile(player)?saved.canPitch!==false:false,requiresPitchWarmup:isPitcherProfile(player)?saved.requiresPitchWarmup!==false:false,canCatch:positionTokens(player).includes('C')?saved.canCatch!==false:false};
}
function practiceAccommodationSummary(player,accommodation,startTime,durationMinutes){
 const endTime=practiceEndValue(startTime,durationMinutes),parts=[];
 if(accommodation.arrival&&accommodation.arrival!==startTime)parts.push(`Arrives ${practiceTimeLabel(accommodation.arrival)}`);
 if(accommodation.departure&&accommodation.departure!==endTime)parts.push(`Leaves ${practiceTimeLabel(accommodation.departure)}`);
 if(isPitcherProfile(player)&&!accommodation.canPitch)parts.push('Hitting Only');
 else if(isPitcherProfile(player)&&!accommodation.requiresPitchWarmup)parts.push('No Pitch Warm-Up');
 if(positionTokens(player).includes('C')&&!accommodation.canCatch)parts.push('Not Catching');
 if((player.isPracticeGuest||player.isTeamJenkins)&&accommodation.prePracticeComplete)parts.push('Warm-Up + Tee Done Early');
 if(accommodation.limitations)parts.push(accommodation.limitations);
 return parts.join(' · ')||'Full Practice';
}
function practiceGuestPlayers(){return Array.isArray(practiceSetupState.guestPlayers)?practiceSetupState.guestPlayers:[]}
function practiceGuestCoaches(){return Array.isArray(practiceSetupState.guestCoaches)?practiceSetupState.guestCoaches:[]}
function practiceAttendanceRoster(){return [...db.roster,...practiceGuestPlayers()]}
function guestRolePosition(role){return role==='Pitcher'?'P':role==='Catcher'?'C':'UT'}
function practicePlayerByName(name){return practiceAttendanceRoster().find(player=>player.name===name)}
function practiceAvailability(startTime,durationMinutes,arrival,departure){
 const start=practiceTimeMinutes(startTime),blockCount=Number(durationMinutes)===132?11:Number(durationMinutes)===120?10:0,blockMinutes=12;
 const arrive=practiceTimeMinutes(arrival||startTime),leave=practiceTimeMinutes(departure||practiceEndValue(startTime,durationMinutes));
 if(start===null||!blockCount||arrive===null||leave===null)return {availableFromBlock:-1,availableUntilBlock:-1};
 const end=start+blockCount*blockMinutes;
 let adjustedArrive=arrive,adjustedLeave=leave;
 const crossesMidnight=end>1440,midnightEnd=crossesMidnight?end-1440:0;
 if(adjustedArrive<start)adjustedArrive=crossesMidnight&&adjustedArrive<=midnightEnd?adjustedArrive+1440:start;
 if(adjustedLeave<start)adjustedLeave=crossesMidnight&&adjustedLeave<=midnightEnd?adjustedLeave+1440:adjustedLeave;
 const availableFromBlock=Math.max(0,Math.min(blockCount,Math.ceil((adjustedArrive-start)/blockMinutes-1e-9))),availableUntilBlock=Math.max(0,Math.min(blockCount,Math.floor((Math.min(adjustedLeave,end)-start)/blockMinutes+1e-9)));
 return {availableFromBlock,availableUntilBlock:Math.max(availableFromBlock,availableUntilBlock)};
}
function practicePlayerModel(player,accommodation=null,startTime='18:00',durationMinutes=120){
 const positions=positionTokens(player);
 const model={name:player.name,isPitcher:isPitcherProfile(player),isCatcher:positions.includes('C'),isGuest:!!player.isPracticeGuest};
 if(!accommodation)return model;
 const arrival=accommodation.arrival||startTime,departure=accommodation.departure||practiceEndValue(startTime,durationMinutes),availability=practiceAvailability(startTime,durationMinutes,arrival,departure);
 return {...model,...availability,arrivalTime:arrival,departureTime:departure,limitations:String(accommodation.limitations||'').trim(),prePracticeComplete:!!(player.isPracticeGuest||player.isTeamJenkins)&&!!accommodation.prePracticeComplete,canPitch:model.isPitcher&&accommodation.canPitch!==false,requiresPitchWarmup:model.isPitcher&&accommodation.canPitch!==false&&accommodation.requiresPitchWarmup!==false,canCatch:model.isCatcher&&accommodation.canCatch!==false};
}
function practiceRole(player){
 const model=practicePlayerModel(player);
 return model.isPitcher&&model.isCatcher?'P/C':model.isPitcher?'P':model.isCatcher?'C':'';
}
function practiceFirstName(name){return String(name||'').trim().split(/\s+/)[0]||''}
function practiceCatcherName(name){return String(name||'').replace(/^9Square$/i,'9-Square')==='9-Square'?'9-Square':practiceFirstName(name)}
function practiceEntryText(entry,plan=null,blockIndex=-1){
 if(!entry.partner)return practiceActivityLabel(entry.activity,plan);
 const partner=practiceFirstName(entry.partner);
 if(entry.activity==='Hit Live'&&plan){
  const session=plan.liveSessions?.find(item=>item.block===blockIndex);
  if(session)return `Hit Live — 12 pitches minimum — Pitcher: ${practiceFirstName(session.pitcher)} — Catcher: ${practiceCatcherName(session.catcher||'9Square')}`;
 }
 if(entry.activity==='Pitch Live')return `Pitch Live — Catcher: ${practiceCatcherName(entry.partner)} — 12 pitches minimum per hitter`;
 if(entry.activity==='Catch Live')return `Catch Live — ${partner} — 12 pitches minimum per hitter`;
 return entry.activity.startsWith('Pitch ')?`${entry.activity} (${partner})`:`${entry.activity} — ${partner}`;
}
function practiceCoachLabel(label,plan=null,blockIndex=-1){
 const [activity,partner]=String(label).split(' — ');
 if(!partner)return practiceActivityLabel(activity,plan);
 if(activity==='Hit Live'&&plan){
  const session=plan.liveSessions?.find(item=>item.block===blockIndex);
  if(session)return `Hit Live — 12 pitches minimum — ${practiceFirstName(session.pitcher)} (${practiceFirstName(session.catcher||'9Square')})`;
 }
 if(activity==='Pitch Live')return `Pitch Live — Catcher: ${practiceCatcherName(partner)} — 12 pitches minimum per hitter`;
 if(activity==='Catch Live')return `Catch Live — ${practiceFirstName(partner)} — 12 pitches minimum per hitter`;
 return activity.startsWith('Pitch ')?`${activity} (${practiceFirstName(partner)})`:`${activity} — ${practiceFirstName(partner)}`;
}
function portalPracticeClockValues(practice=portalData?.activePractice,now=Date.now()){
 if(!practice)return {block:'Not Started',left:'—',transition:false,currentBlock:0,ended:false};
 const clock=practice.clock||{},status=String(clock.status||'').toLowerCase();
 if(status==='finished'){const blockCount=Number(practice.blockCount)||Number(practice.schedule?.length)||10;return {block:'DONE!',left:'0:00',transition:false,currentBlock:blockCount,ended:true}}
 if(status==='not-started'&&!clock.startedAt)return {block:'Not Started',left:'—',transition:false,currentBlock:0,ended:false};
 if(status!=='running')return {block:'Syncing',left:'—',transition:false,currentBlock:0,ended:false};
 const raw=clock.startedAt;
 let startMs=NaN;
 if(typeof raw==='number')startMs=raw;
 else if(typeof raw==='string')startMs=new Date(raw).getTime();
 else if(raw&&typeof raw.toMillis==='function')startMs=raw.toMillis();
 else if(raw&&typeof raw.toDate==='function')startMs=raw.toDate().getTime();
 else if(raw&&Number.isFinite(Number(raw.seconds)))startMs=Number(raw.seconds)*1000+Math.floor(Number(raw.nanoseconds||0)/1000000);
 if(!Number.isFinite(startMs))return {block:'Syncing',left:'—',transition:false,currentBlock:0,ended:false};
 const blockMs=(Number(practice.blockMinutes)||12)*60000,blockCount=Number(practice.blockCount)||Number(practice.schedule?.length)||10;
 const rotateMs=60000,workMs=Math.max(0,blockMs-rotateMs),totalMs=blockMs*blockCount-rotateMs;
 const elapsed=Math.max(0,Number(now)-startMs);
 if(elapsed>=totalMs)return {block:'DONE!',left:'0:00',transition:false,currentBlock:blockCount,ended:true};
 const currentBlock=Math.min(blockCount,Math.floor(elapsed/blockMs)+1),within=elapsed%blockMs;
 const transition=currentBlock<blockCount&&within>=workMs;
 const remaining=currentBlock===blockCount?totalMs-elapsed:(transition?blockMs:workMs)-within;
 const seconds=Math.max(0,Math.ceil(remaining/1000));
 return {block:transition?'ROTATE':currentBlock+' of '+blockCount,left:Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0'),transition,currentBlock};
}
function updatePortalPracticeClock(){
 const values=portalPracticeClockValues(portalData?.activePractice),block=$('#portalCurrentBlock'),left=$('#portalTimeLeft');
 if(values.ended&&!portalData._localPracticeEnded){
  // Render the expired state once so old schedule/drill controls disappear
  // immediately instead of waiting for the next Firebase snapshot. Permanent
  // players return home; practice-only links render their dedicated ended view.
  portalData._localPracticeEnded=true;portalView='home';portalSelectedDrill='';portalDrillQuery='';portalLibraryReturnView='library';
  render();return;
 }
 if(block)block.textContent=values.block;if(left)left.textContent=values.left;
 const clockShell=left?.closest('.portal-live-clock'),timeTile=left?.parentElement;
 if(clockShell)clockShell.classList.toggle('is-rotate',!!values.transition);
 if(timeTile){timeTile.classList.toggle('rotate-flash',!!values.transition&&Math.floor(Date.now()/1000)%2===0);timeTile.setAttribute('aria-label',values.transition?`Rotate — ${values.left} remaining`:`Time left — ${values.left}`)}
 const nextPanel=$('#portalPracticeNext'),nextButton=$('#portalPracticeNextButton'),nextHeading=$('#portalPracticeNextHeading'),nextDetail=$('#portalPracticeNextDetail');
 if(values.ended){
  // The coach cleanup write may arrive a moment later; stop presenting live
  // assignments once the synchronized practice duration has elapsed.
  portalSelectedDrill='';portalDrillQuery='';portalLibraryReturnView='library';
  if(portalView==='library')portalView='practice';
 }
 const nextEntry=values.transition?(portalData?.activePractice?.schedule||[]).find(entry=>Number(entry.block)===Number(values.currentBlock)+1):null;
 if(nextPanel&&nextButton){
  nextPanel.hidden=!nextEntry;
  if(nextEntry){const details=portalNextAssignmentDetails(nextEntry.assignment),practiceOnly=['guestPlayer','guestCoach','jenkinsPlayer'].includes(portalData?.portalType),drillAllowed=!!details.drill&&(!practiceOnly||(portalData?.activePractice?.drills||[]).includes(details.drill));nextHeading.textContent=details.heading;nextDetail.textContent=details.detail;nextDetail.hidden=!details.detail;nextButton.dataset.portalPracticeDrill=drillAllowed?details.drill:'';nextButton.classList.toggle('has-drill',drillAllowed);const hint=nextButton.querySelector('small');if(hint)hint.hidden=!drillAllowed}
 }
 const current=Number(values.currentBlock)||0,done=values.block==='DONE!',practiceOnly=['guestPlayer','guestCoach','jenkinsPlayer'].includes(portalData?.portalType),coachPractice=portalData?.portalType==='coach'&&portalView!=='evaluation';
 if(practiceOnly||coachPractice)$('[data-portal-block]').forEach(row=>row.hidden=done||current>0&&Number(row.dataset.portalBlock)<current);
 if(practiceOnly){const drills=$('.portal-practice-drills');if(drills)drills.hidden=done;if(nextPanel&&done)nextPanel.hidden=true;if(done&&portalView==='library'){portalView='practice';portalSelectedDrill='';portalLibraryReturnView='library';render();return}}
}
function practiceActivityLabel(activity,plan=null){
 const match=String(activity||'').match(/^Drill #(\d+)$/),drill=match?practiceChosenDrills[Number(match[1])-1]:null;
 if(drill)return `Drill Station ${match[1]} — ${drill.name}`;
 const machineFocus=plan?.machineFocus||'Standard',frontTossFocus=plan?.frontTossFocus||'Standard';
 if(activity==='Machine'&&machineFocus!=='Standard')return `Machine — ${machineFocus}`;
 if(String(activity||'').startsWith('Front Toss')&&frontTossFocus!=='Standard')return `${activity} — ${frontTossFocus}`;
 return activity;
}
function practiceHeader(title='Hitting Practice',backToHub=false,endDraft=false){
 return `<div class="page-match-head page-head-centered no-print"><button class="page-head-nav" ${backToHub?'id="practiceHubBack"':'data-go="home"'}>${backToHub?'Back':'Home'}</button><h1>${esc(title)}</h1>${endDraft?'<button class="page-head-nav practice-draft-end" id="endPracticeDraft">End</button>':'<span class="page-head-spacer"></span>'}</div>`;
}
function practiceHistoryDateValue(date=new Date()){return`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`}
function practiceDrillUsage(name){return window.HotBPracticeHistory?.drillUsage(db.practiceHistory,name)||{percentage:null,lastDate:null}}
function practiceAttendance(player){return window.HotBPracticeHistory?.attendance(db.practiceHistory,player)||{percentage:null,eligible:player?.hittingPracticeAttendanceEligible!==false}}
function practiceUsageBoxes(name){
 const usage=practiceDrillUsage(name),percent=usage.percentage===null?'—%':`${usage.percentage}%`,date=window.HotBPracticeHistory?.dateLabel(usage.lastDate)||'—';
 return`<div class="practice-usage-stats"><span>${esc(percent)}</span><span>${esc(date)}</span></div>`;
}
function practiceHub(){
 const hasDraft=db.activePracticeSession?.stage==='setup';
 // Hub copy must not advertise a stale/corrupt Resolution as resumable. Full
 // validation still happens after restore, but legacy snapshots without the
 // current decision seal are presented simply as a saved setup draft.
 const savedResolution=db.activePracticeSession?.resolution;
 const hasResolutionDraft=hasDraft&&!!savedResolution&&typeof savedResolution.decisionSignature==='string'&&!!savedResolution.decisionSignature;
 const savedPublishedId=db.activePracticeSession?.plan?.portalDraftId||practicePlan?.portalDraftId||'';
 const lostActivationCandidate=!db.activePortalPractice?.id&&!!savedPublishedId;
 const recoveryNeeded=(db.activePortalPractice?.id&&!practicePlan)||lostActivationCandidate;
 return `${practiceHeader()}<main class="practice-hub no-print"><section class="practice-hub-intro"><h2>Plan Your Hitting Practice</h2><p>Build today's schedule, organize your drills, or focus on one player.</p></section>${recoveryNeeded?`<section class="practice-portal-publish"><div><span>RECOVERY NEEDED</span><h2>Check Published Practice</h2><p>HotB has saved practice work that may already be published. Check the coach portal first so an active practice is never activated twice.</p></div><button class="btn red" id="recoverPublishedPractice">Recover Practice</button></section>`:''}<section class="practice-hub-actions"><button class="practice-hub-card primary" id="openPracticeBuilder"><span>${hasResolutionDraft?'RESOLUTION SAVED':hasDraft?'SAVED DRAFT':'PLAN'}</span><h3>${hasResolutionDraft?'Continue Resolution':hasDraft?'Continue Practice':'Build Practice'}</h3><p>${hasResolutionDraft?'Return to the exact verified coaching decision for this practice.':hasDraft?'Return to your saved attendance and adjustments.':'Choose attendance, time and create the complete rotation.'}</p></button><button class="practice-hub-card" id="openDrillLibrary"><span>LIBRARY</span><h3>Drill Library</h3><p>Search your hitting drills, setups and coaching purposes.</p></button><button class="practice-hub-card" id="openPlayerFocus"><span>PLAYER</span><h3>Player Focus</h3><p>Combine game data and coach observations into an individual hitting focus.</p></button></section></main>`;
}
function practiceLibrary(){
 const drills=Array.isArray(window.HotBDrillLibrary)?window.HotBDrillLibrary:[];
 const selected=drills.find(drill=>drill.name===practiceSelectedDrill);
 if(selected){
  const detail=(title,value)=>value?`<section class="practice-drill-detail-section"><h3>${esc(title)}</h3><p>${esc(value)}</p></section>`:'';
  return `${practiceHeader('Drill Library',true)}<main class="practice-feature-page practice-drill-detail no-print"><button class="practice-library-return" id="backToDrillList">‹ Back To All Drills</button><section class="practice-drill-detail-head"><span>${esc(selected.category)}</span><h2>${esc(selected.name)}</h2><p>${esc(selected.primaryPurpose)}</p><div class="practice-drill-tags"><span>${esc(selected.hittingMethod)}</span>${selected.equipment?`<span>${esc(selected.equipment)}</span>`:''}</div>${practiceUsageBoxes(selected.name)}</section>${detail('Best Used For',selected.bestUsedFor)}${detail('How It Works',selected.howItWorks)}${detail('Key Coaching Cues',selected.coachingCues)}${detail('What Success Looks Like',selected.success)}${detail('Secondary Focus',selected.secondaryFocus)}${detail('Space / Setup',selected.spaceSetup)}${detail('Equipment',selected.equipment)}${detail('Notes / Variations',selected.notes)}${selected.mediaLink?`<a class="btn black block practice-drill-media-link" href="${esc(selected.mediaLink)}" target="_blank" rel="noopener">Watch Drill</a>`:''}</main>`;
 }
 const filters=['All Drills',...new Set(drills.map(drill=>drill.category).filter(Boolean))];
 const query=practiceDrillQuery.trim().toLowerCase();
 const shown=drills.filter(drill=>(practiceDrillCategory==='All Drills'||drill.category===practiceDrillCategory)&&(!query||Object.values(drill).some(value=>String(value).toLowerCase().includes(query))));
 return `${practiceHeader('Drill Library',true)}<main class="practice-feature-page no-print"><section class="practice-feature-lead"><span>HITTING LIBRARY</span><h2>${drills.length} Hitting Drills</h2><p>Search by drill name, hitting problem, purpose, equipment or coaching cue. This library does not change the practice scheduler yet.</p></section><div class="practice-library-search"><input class="input" id="practiceDrillSearch" type="search" placeholder="Search drills" value="${esc(practiceDrillQuery)}" aria-label="Search drills"></div><div class="practice-filter-preview">${filters.map(filter=>`<button class="${filter===practiceDrillCategory?'active':''}" data-drill-category="${esc(filter)}">${esc(filter)}</button>`).join('')}</div><p class="practice-library-count">${shown.length} ${shown.length===1?'drill':'drills'}</p><section class="practice-drill-list">${shown.map(drill=>`<button class="practice-drill-card" data-drill-name="${esc(drill.name)}"><span>${esc(drill.category)}</span><h3>${esc(drill.name)}</h3><p>${esc(drill.primaryPurpose)}</p><div class="practice-drill-tags"><span>${esc(drill.hittingMethod)}</span>${drill.equipment?`<span>${esc(drill.equipment)}</span>`:''}</div>${practiceUsageBoxes(drill.name)}</button>`).join('')||`<div class="practice-library-empty"><b>No Drills Found</b><p>Try another search or category.</p></div>`}</section></main>`;
}
function playerFocusGames(range=practiceFocusRange){
 // Player Focus is an audit of completed, saved games. An unfinished live game is excluded.
 const games=[...(db.savedGames||[])];
 return window.HotBCoachObservations?.gamesInRange(games,range)||games;
}
function playerFocusPortalPayload(playerName=practiceFocusPlayer,range=practiceFocusRange){
 const selected=db.roster.find(player=>!player.isTeamJenkins&&player.name===playerName);if(!selected)return null;
 const games=playerFocusGames(range),standalone=window.HotBCoachObservations?.standaloneInRange(db.coachObservations,range)||[];
 const analysis=window.HotBHittingAnalysis?.analyzePlayer(games,selected)||{issues:[],plateAppearances:0};
 const observed=window.HotBCoachObservations?.summarize(games,selected.name,standalone)||{patterns:[],rows:[]};
 const focusItems=[...observed.patterns.map(item=>item.tag),...(analysis.issues||[]).map(item=>item.label)].filter((item,index,list)=>item&&list.indexOf(item)===index).slice(0,3);
 const query=[...observed.patterns.map(item=>item.tag),...(analysis.issues||[]).map(item=>`${item.label} ${item.focus||''}`)].join(' ');
 const drills=focusSuggestedDrills(query,playerName,range).map(drill=>drill.name);
 const latestNote=(observed.rows||[]).filter(item=>item.note).sort((a,b)=>Number(b.createdAt||b.updatedAt||0)-Number(a.createdAt||a.updatedAt||0))[0]?.note||'';
 const rangeText=range==='weekend'?'this past weekend':'the past two weeks',plateAppearances=analysis.plateAppearances||0;
 return{title:'Current Hitting Focus',summary:`Based on ${games.length} saved game${games.length===1?'':'s'} and ${plateAppearances} plate appearance${plateAppearances===1?'':'s'} from ${rangeText}.`,needsWork:focusItems.join(' · '),coachNote:latestNote,drills,range,publishedAt:new Date().toISOString()};
}
function practicePlayerFocus(){
 const selected=db.roster.find(player=>!player.isTeamJenkins&&player.name===practiceFocusPlayer);
 if(!selected)return `${practiceHeader('Player Focus',true)}<main class="practice-feature-page no-print"><section class="practice-feature-lead"><span>PLAYER FOCUS</span><h2>Choose A Player</h2><p>Review what HotB detects together with what you observed as a coach.</p></section><section class="practice-focus-roster">${competitionRoster().map(player=>`<button data-focus-player="${esc(player.name)}"><b>${esc(player.name)}</b><span>${practiceRole(player)||'Hitter'}</span></button>`).join('')}</section></main>`;
 const games=playerFocusGames(),standalone=window.HotBCoachObservations?.standaloneInRange(db.coachObservations,practiceFocusRange)||[],analysis=window.HotBHittingAnalysis?.analyzePlayer(games,selected)||{issues:[],plateAppearances:0,confidence:'no-data'};
 const observed=window.HotBCoachObservations?.summarize(games,selected.name,standalone)||{patterns:[],rows:[],total:0};
 const combinedQuery=[...observed.patterns.map(item=>item.tag),...(analysis.issues||[]).map(item=>`${item.label} ${item.focus||''}`)].join(' ');
 const drills=focusSuggestedDrills(combinedQuery);
 const rangeLabel=practiceFocusRange==='weekend'?'THIS PAST WEEKEND':'PAST TWO WEEKS';
 const evidenceCount=analysis.plateAppearances||0;
 const notes=(observed.rows||[]).filter(item=>item.note).sort((a,b)=>Number(b.createdAt||b.updatedAt||0)-Number(a.createdAt||a.updatedAt||0));
 const observationDate=item=>new Date(item.observedAt||item.gameDate||item.createdAt||item.updatedAt||Date.now()).toLocaleDateString(undefined,{month:'short',day:'numeric'});
 return `${practiceHeader('Player Focus',true)}<main class="practice-feature-page no-print"><section class="practice-feature-lead"><span>PLAYER FOCUS</span><h2>${esc(selected.name)}</h2><p>Game results and coach observations are reviewed together. Repeated observations carry more weight than a one-time tag.</p></section>
 <div class="focus-range-toggle" role="group" aria-label="Player Focus date range"><button class="${practiceFocusRange==='weekend'?'active':''}" data-focus-range="weekend">This Past Weekend</button><button class="${practiceFocusRange==='two-weeks'?'active':''}" data-focus-range="two-weeks">Past Two Weeks</button></div>
 <section class="practice-focus-summary"><button type="button" class="focus-game-count" id="focusGameCount" aria-label="View games included in ${rangeLabel.toLowerCase()}"><span>${rangeLabel}</span><b>${games.length} game${games.length===1?'':'s'} · ${evidenceCount} PA</b><small>Tap to view games</small></button><div><span>COACH OBSERVATIONS</span><b>${observed.total||0}</b></div></section>
 <section class="focus-evidence-section"><div class="focus-observation-head"><h3>Coach Observations</h3><div class="focus-observation-actions"><button type="button" id="manageFocusObservations">Manage</button><button type="button" id="addFocusObservation">+ Add Observation</button></div></div>${observed.patterns.length?observed.patterns.map(item=>`<article class="focus-evidence-row ${item.count>=2?'recurring':''}"><div><b>${esc(item.tag)}</b><span>${esc(item.status)}</span></div><strong>${item.count}×</strong></article>`).join(''):`<p class="focus-empty-copy">No coach observations for ${practiceFocusRange==='weekend'?'this past weekend':'the past two weeks'}.</p>`}${notes.map(item=>`<article class="focus-note-row"><time>${esc(observationDate(item))}</time><p>${esc(item.note)}</p></article>`).join('')}</section>
 <section class="focus-evidence-section"><h3>What HotB Detects</h3>${analysis.issues?.length?analysis.issues.slice(0,5).map(item=>`<article class="focus-evidence-row"><div><b>${esc(item.label)}</b><span>${esc(item.evidence)}</span></div></article>`).join(''):`<p class="focus-empty-copy">${evidenceCount?'Not enough repeated statistical evidence to identify a tendency yet.':'No plate appearances in this range.'}</p>`}</section>
 <section class="focus-evidence-section"><div class="focus-drill-head"><h3>Suggested Drills</h3>${drills.length?'<button type="button" id="manageFocusDrills">Manage</button>':''}</div>${drills.length?drills.map((drill,index)=>`<article class="focus-drill-row"><strong>${index+1}</strong><div><b>${esc(drill.name)}</b><span>${esc(drill.bestUsedFor||drill.primaryPurpose)}</span></div></article>`).join(''):`<p class="focus-empty-copy">Suggestions will appear when HotB or the coach identifies something to work on.</p>`}</section>
 <div class="focus-bottom-actions"><button class="btn black" id="changeFocusPlayer">Choose Another Player</button><button class="btn red" id="previewPlayerFocus">Publish</button></div></main>`;
}
function practiceAttendanceRow(player,index,selected,startTime,duration,endTime){
 const accommodation=practiceAccommodation(player),summary=practiceAccommodationSummary(player,accommodation,startTime,duration),pitcher=isPitcherProfile(player),catcher=positionTokens(player).includes('C'),arrivalValue=accommodation.arrival||startTime,departureValue=accommodation.departure||endTime;
 const attendanceChecked=!!selected&&selected.has(player.name);
 return `<div class="practice-attendance-row ${player.isPracticeGuest?'practice-guest-attendee':''}"><div class="practice-player-line"><label class="practice-player"><input type="checkbox" data-practice-player="${index}" ${attendanceChecked?'checked="checked"':''}><span><b>${esc(player.name)}</b><small>${player.isPracticeGuest?'GUEST ':''}${practiceRole(player)||'Hitter'}</small></span></label><button class="practice-adjust" type="button" data-practice-adjust="${index}">Adjust</button></div><small class="practice-accommodation-summary" data-accommodation-summary="${index}">${esc(summary)}</small><div class="practice-accommodation" data-accommodation-panel="${index}" hidden><div class="practice-accommodation-times"><label>Arrival<div class="practice-field-shell practice-time-shell practice-accommodation-time-shell"><input class="input" type="time" value="${esc(arrivalValue)}" aria-label="Arrival time for ${esc(player.name)}" data-accommodation-arrival="${index}" data-custom="${accommodation.arrival?'true':'false'}"><span class="practice-accommodation-time-display">${esc(practiceTimeLabel(arrivalValue))}</span></div></label><label>Departure<div class="practice-field-shell practice-time-shell practice-accommodation-time-shell"><input class="input" type="time" value="${esc(departureValue)}" aria-label="Departure time for ${esc(player.name)}" data-accommodation-departure="${index}" data-custom="${accommodation.departure?'true':'false'}"><span class="practice-accommodation-time-display">${esc(practiceTimeLabel(departureValue))}</span></div></label></div>${(player.isPracticeGuest||player.isTeamJenkins)?`<label class="practice-accommodation-toggle practice-prepractice-toggle"><input type="checkbox" data-accommodation-prepractice="${index}" ${accommodation.prePracticeComplete?'checked':''}><span>Warm-Up + Tee completed before practice</span></label>`:''}${pitcher?`<label class="practice-accommodation-toggle"><input type="checkbox" data-accommodation-pitch="${index}" ${accommodation.canPitch?'checked':''}><span>Available to pitch live</span></label><label class="practice-accommodation-toggle"><input type="checkbox" data-accommodation-warmup="${index}" ${accommodation.requiresPitchWarmup?'checked':''} ${accommodation.canPitch?'':'disabled'}><span>Pitch warm-up required</span></label>`:''}${catcher?`<label class="practice-accommodation-toggle"><input type="checkbox" data-accommodation-catch="${index}" ${accommodation.canCatch?'checked':''}><span>Catching</span></label>`:''}<label class="practice-limitations-label">Practice limitations<input class="input" data-accommodation-limitations="${index}" value="${esc(accommodation.limitations||'')}" placeholder="Optional limitation or adjustment"></label>${player.isPracticeGuest?`<button class="practice-remove-guest" type="button" data-remove-guest-player="${esc(player.guestId)}">Remove Guest</button>`:''}<p>${(player.isPracticeGuest||player.isTeamJenkins)&&accommodation.prePracticeComplete?'Warm-Up and Tee are credited before practice. Official Blocks 1 and 2 can be used for assigned work.':'Arrival and departure use complete practice blocks. A late player begins with Warm-Up, then Tee Work.'}</p></div></div>`;
}
function practiceSetup(){
 const roster=practiceAttendanceRoster(),savedNames=Array.isArray(practiceSetupState.selectedNames)?practiceSetupState.selectedNames:null,selected=new Set(savedNames===null?roster.filter(player=>!player.isTeamJenkins).map(player=>player.name):savedNames),duration=practiceSetupState.durationMinutes||120,startTime=practiceSetupState.startTime||'18:00',endTime=practiceEndValue(startTime,duration),guests=practiceGuestPlayers(),guestCoaches=practiceGuestCoaches();
 return `${practiceHeader('Build Practice',true,true)}
 <div class="panel practice-setup no-print"><section class="practice-team-focus-preview"><div><span>TEAM FOCUS · PAST 14 DAYS</span><b>Drill recommendations will appear here</b></div><small>LOOK ONLY</small></section><div class="practice-intro"><h2>Who Is At Practice?</h2><p>Select everyone attending. HotB will build the practice with no downtime.</p></div>
 <div class="practice-attendance-tools"><button class="btn" id="practiceSelectAll">All</button><button class="btn" id="practiceSelectNone">None</button><label>Start Time<div class="practice-field-shell practice-time-shell"><input class="input" id="practiceStartTime" type="time" value="${esc(startTime)}" aria-label="Practice start time"><span id="practiceStartTimeDisplay">${esc(window.HotBPracticeScheduler.blockTimes(startTime,duration)[0].start)}</span></div></label><label>Duration<div class="practice-field-shell"><select class="input" id="practiceDuration">${[120,...(duration===132?[132]:[])].map(minutes=>`<option value="${minutes}" ${minutes===duration?'selected':''}>${minutes}${minutes===132?' Minutes · Emergency Block 11':' Minutes'}</option>`).join('')}</select></div></label>></div>
 <div class="practice-attendance">${db.roster.map((player,index)=>practiceAttendanceRow(player,index,selected,startTime,duration,endTime)).join('')}</div>
 <section class="practice-guests"><button type="button" class="practice-guests-toggle" id="togglePracticeGuests" aria-expanded="${!!practiceSetupState.guestsOpen}"><span>Guests (${guests.length+guestCoaches.length})</span><b>${practiceSetupState.guestsOpen?'−':'+'}</b></button>${practiceSetupState.guestsOpen?`<div class="practice-guests-body"><h3>Guest Players</h3>${guests.length?`<div class="practice-attendance">${guests.map((player,index)=>`${practiceAttendanceRow(player,db.roster.length+index,selected,startTime,duration,endTime)}<div class="practice-guest-access"><small>${esc(player.phone)}</small><span><button type="button" data-text-practice-guest="${esc(player.guestId)}">Text</button><button type="button" class="practice-guest-share" data-share-setup-guest="${esc(player.guestId)}">Share</button></span></div>`).join('')}</div>`:'<p class="practice-guest-empty">No guest players added.</p>'}<div class="practice-guest-form"><input class="input" id="guestPlayerFirstName" placeholder="First name" aria-label="Guest player first name"><select class="input" id="guestPlayerRole" aria-label="Guest player role"><option>Position Player</option><option>Pitcher</option><option>Catcher</option></select><input class="input" id="guestPlayerPhone" type="tel" inputmode="tel" placeholder="Cell number" aria-label="Guest player cell number"><button class="btn black" id="addGuestPlayer">Add Guest Player</button></div><h3>Guest Coaches</h3>${guestCoaches.map(coach=>`<div class="practice-guest-coach"><div><b>${esc(coach.name)}</b><small>${esc(coach.phone)}</small></div><span><button type="button" class="practice-guest-text" data-text-practice-guest="${esc(coach.guestId)}">Text</button><button type="button" class="practice-guest-share" data-share-setup-guest="${esc(coach.guestId)}">Share</button><button type="button" data-remove-guest-coach="${esc(coach.guestId)}">Remove</button></span></div>`).join('')||'<p class="practice-guest-empty">No guest coaches added.</p>'}<div class="practice-guest-form practice-guest-coach-form"><input class="input" id="guestCoachName" placeholder="Coach name" aria-label="Guest coach name"><input class="input" id="guestCoachPhone" type="tel" inputmode="tel" placeholder="Cell number" aria-label="Guest coach cell number"><button class="btn black" id="addGuestCoach">Add Guest Coach</button></div></div>`:''}</section>
 <button class="btn black block practice-generate" id="generatePractice">Build Practice Schedule</button></div>`;
}
function practiceCoachView(plan){
 if(Array.isArray(plan.recoveredCoachSchedule)&&plan.recoveredCoachSchedule.length)return `<section class="practice-coach no-print"><h2>Coach View</h2>${plan.recoveredCoachSchedule.map((entry,index)=>`<article class="practice-block"><header><b>Block ${entry.block||index+1}</b><span>${esc(entry.time||'')}</span></header><div><p><strong>${esc(entry.assignment||'Equipment / Float')}</strong></p></div></article>`).join('')}</section>`;
 return `<section class="practice-coach no-print"><h2>Coach View</h2>${plan.blocks.map(block=>`<article class="practice-block"><header><b>Block ${block.block}</b><span>${esc(block.start)}–${esc(block.end)}</span></header><div>${Object.entries(block.assignments).map(([activity,names])=>`<p><strong>${esc(practiceCoachLabel(activity,plan,block.block-1))}</strong><span>${esc(names.map(practiceFirstName).join(', '))}</span></p>`).join('')}</div></article>`).join('')}</section>`;
}
function practicePlayerCards(plan,hidden=false){
 const names=Object.keys(plan.schedule);
 const pages=Array.from({length:Math.ceil(names.length/6)},(_,index)=>names.slice(index*6,index*6+6));
 return `<section class="practice-player-cards ${hidden?'practice-cards-screen-hidden':''}"><div class="practice-cards-title no-print"><h2>Player Cards</h2><p>Each card gives one player her complete rotation.</p></div>${pages.map(page=>`<div class="practice-card-page">${page.map(name=>{
  const player=practicePlayerByName(name),role=practiceRole(player||{name,positions:''});
  return `<article class="practice-player-card"><header><div><h2>${esc(practiceFirstName(name))}${role?` <small>(${role})</small>`:''}</h2></div></header><ol>${plan.schedule[name].map((entry,index)=>`<li><b>B${index+1}</b><span class="card-time">${esc(plan.times[index].start)}–${esc(plan.times[index].end)}</span><strong>${esc(plan.recoveredPlayerSchedules?.[name]?.[index]?.assignment||practiceEntryText(entry,plan,index))}</strong></li>`).join('')}</ol></article>`;
 }).join('')}</div>`).join('')}</section>`;
}
function practiceSelectableDrills(){
 return (Array.isArray(window.HotBDrillLibrary)?window.HotBDrillLibrary:[]).filter(drill=>drill.name!=='Basic Tee Work'&&!['Machine','Front Toss'].includes(drill.hittingMethod));
}
function practiceFocusDrills(method){
 const baseName=method==='Machine'?'Machine Pitch':'Front Toss';
 return (Array.isArray(window.HotBDrillLibrary)?window.HotBDrillLibrary:[]).filter(drill=>drill.hittingMethod===method&&drill.name!==baseName);
}
function practiceFocusSelection(method){
 const key=method==='Machine'?'machineFocus':'frontTossFocus',name=practicePlan?.[key]||'Standard';
 return name==='Standard'?null:practiceFocusDrills(method).find(drill=>drill.name===name)||null;
}
function practiceAllSelectedDrills(){
 return [...practiceChosenDrills,...['Machine','Front Toss'].map(practiceFocusSelection).filter(Boolean)];
}
function practiceFocusSelector(method,disabled=false){
 const key=method==='Machine'?'machineFocus':'frontTossFocus',id=method==='Machine'?'practiceMachineFocus':'practiceFrontTossFocus',selected=practicePlan?.[key]||'Standard';
 const options=['Standard',...practiceFocusDrills(method).map(drill=>drill.name)];
 return `<label><span>${method}</span><select class="input" id="${id}" ${disabled?'disabled':''}>${options.map(name=>`<option value="${esc(name)}" ${name===selected?'selected':''}>${esc(name)}</option>`).join('')}</select></label>`;
}
function practiceDrillResourceWarnings(drills){
 const constrained=drills.filter(drill=>/tunnel/i.test(`${drill.spaceSetup} ${drill.equipment}`)||['Front Toss','Machine','Live Pitching'].includes(drill.hittingMethod));
 if(!constrained.length)return [];
 return [`${constrained.map(drill=>drill.name).join(', ')} ${constrained.length===1?'uses':'use'} tunnel or delivery space. Confirm the station can run during blocks when live pitching, machine or front toss is active.`];
}
function practiceClockPortalPayload(){
 if(practiceClock.finished)return {status:'finished',startedAt:practiceClock.startAt?new Date(practiceClock.startAt).toISOString():null,endedAt:practiceClock.completedAt||new Date().toISOString()};
 if(practiceClock.running&&practiceClock.startAt)return {status:'running',startedAt:new Date(practiceClock.startAt).toISOString(),endedAt:null};
 return {status:'not-started',startedAt:null,endedAt:null};
}
function playerPracticePortalPayload(name,activatedAt=null,clockOverride=null){
 const schedule=practicePlan.schedule[name]||[];
 const player=practicePlayerByName(name),recoveredSchedule=practicePlan.recoveredPlayerSchedules?.[name],portalSchedule=schedule.map((entry,index)=>({block:index+1,time:`${practicePlan.times[index].start}–${practicePlan.times[index].end}`,assignment:recoveredSchedule?.[index]?.assignment||practiceEntryText(entry,practicePlan,index)}));
 const assigned=new Map();
 portalSchedule.forEach(entry=>{const drill=portalAssignmentDrillName(entry.assignment);if(!drill||assigned.has(drill))return;const station=String(entry.assignment).match(/^Drill Station (\d+)/i);assigned.set(drill,station?`Drill Station ${station[1]}`:/^Machine\b/i.test(entry.assignment)?'Machine':/^Front Toss\b/i.test(entry.assignment)?'Front Toss':'Assigned Drill')});
 const drillAssignments=[...assigned].map(([name,location])=>({name,location})),assignedDrills=drillAssignments.map(item=>item.name);
 return {id:practicePlan.portalDraftId,title:'This Week’s Hitting Practice',playerName:practiceFirstName(name),role:practiceRole(player||{name,positions:''}),startLabel:practicePlan.times?.[0]?.start||practicePlan.startTime,blockMinutes:practicePlan.blockMinutes,blockCount:practicePlan.times?.length||10,activatedAt:activatedAt||new Date().toISOString(),clock:clockOverride||{status:'not-started',startedAt:null,endedAt:null},schedule:portalSchedule,drills:assignedDrills,drillAssignments};
}
function coachPracticePortalPayload(activatedAt=null){
 const schedule=Array.isArray(practicePlan?.recoveredCoachSchedule)&&practicePlan.recoveredCoachSchedule.length?structuredClone(practicePlan.recoveredCoachSchedule):(window.HotBCoachPractice?.build(practicePlan,practiceChosenDrills)||[]);
 const planBlockCount=practicePlan.times?.length||10,players=practicePlan.players.filter(player=>(player.availableFromBlock??0)<(player.availableUntilBlock??planBlockCount)).map(player=>({name:practiceFirstName(player.name),role:practiceRole(practicePlayerByName(player.name)||player),schedule:playerPracticePortalPayload(player.name,activatedAt).schedule}));
 return{id:practicePlan.portalDraftId,title:'This Week’s Hitting Practice',coachName:db.coachPortal?.name||'Coach',startLabel:practicePlan.times?.[0]?.start||practicePlan.startTime,blockMinutes:practicePlan.blockMinutes,blockCount:practicePlan.times?.length||10,activatedAt:activatedAt||new Date().toISOString(),clock:practiceClockPortalPayload(),schedule,players,drills:practiceAllSelectedDrills().map(drill=>drill.name)};
}
function archiveCompletedPractice(completedAt=new Date()){
 if(!practicePlan||!window.HotBPracticeHistory)return;
 const permanentPlayers=db.roster.filter(player=>!player.isGuest&&!player.isTeamJenkins),permanentNames=new Set(permanentPlayers.map(player=>player.name)),planBlockCount=practicePlan.times?.length||10,attendees=practicePlan.players.filter(player=>(player.availableFromBlock??0)<(player.availableUntilBlock??planBlockCount)).map(player=>player.name).filter(name=>permanentNames.has(name)),excludedAttendancePlayers=permanentPlayers.filter(player=>player.hittingPracticeAttendanceEligible===false).map(player=>player.name),record={id:practicePlan.portalDraftId,status:'completed',practiceDate:practiceHistoryDateValue(completedAt),completedAt:completedAt.toISOString(),attendees,rosterPlayers:[...permanentNames],excludedAttendancePlayers,drills:practiceAllSelectedDrills().map(drill=>drill.name)};
 db.practiceHistory=window.HotBPracticeHistory.saveCompleted(db.practiceHistory,record);save();
}
function jenkinsPortalResetPayload(player,activePractice=null,accessStatus='waiting'){
 return {portalType:'jenkinsPlayer',playerName:player.name,firstName:practiceFirstName(player.name),phone:player.phone||'',expired:false,accessStatus,activePractice,evaluationData:firebase.firestore.FieldValue.delete(),focus:firebase.firestore.FieldValue.delete(),coachObservations:firebase.firestore.FieldValue.delete(),observations:firebase.firestore.FieldValue.delete(),measurements:firebase.firestore.FieldValue.delete(),history:firebase.firestore.FieldValue.delete(),practiceHistory:firebase.firestore.FieldValue.delete(),recruiting:firebase.firestore.FieldValue.delete(),stats:firebase.firestore.FieldValue.delete(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()};
}
function jenkinsPortalCleanupPayload(player,entry){
 if(player)return jenkinsPortalResetPayload(player);
 return {portalType:'jenkinsPlayer',playerName:entry?.name||'',firstName:practiceFirstName(entry?.name||''),expired:false,accessStatus:'waiting',activePractice:null,evaluationData:firebase.firestore.FieldValue.delete(),focus:firebase.firestore.FieldValue.delete(),coachObservations:firebase.firestore.FieldValue.delete(),observations:firebase.firestore.FieldValue.delete(),measurements:firebase.firestore.FieldValue.delete(),history:firebase.firestore.FieldValue.delete(),practiceHistory:firebase.firestore.FieldValue.delete(),recruiting:firebase.firestore.FieldValue.delete(),stats:firebase.firestore.FieldValue.delete(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()};
}
async function clearActivePlayerPlans(){
 if(!cloudUser||!cloudStore)throw new Error('cloud-unavailable');
 if(!practicePlan||db.activePortalPractice?.id!==practicePlan.portalDraftId)throw new Error('practice-mismatch');
 const batch=cloudStore.batch();
 const activeNames=new Set(db.activePortalPractice?.players||[]),persistedPlayerPortals=db.activePortalPractice?.playerPortals||[];
 const persistedIds=new Set(persistedPlayerPortals.map(entry=>entry.portalId));
 const coachPortalId=db.activePortalPractice?.coachPortalId||db.coachPortal?.portalId;
 const guestPortalIds=new Set([...(db.activePortalPractice?.guestPlayerPortalIds||[]),...(db.activePortalPractice?.guestCoachPortalIds||[]),...practiceGuestPlayers().filter(guest=>activeNames.has(guest.name)).map(guest=>guest.portalId),...practiceGuestCoaches().map(guest=>guest.portalId)].filter(Boolean));
 // Cleanup is update-only. Ending a practice must never recreate a missing
 // permanent/coach/guest portal document as a partial stale record.
 const cleanupTargets=[
  ...persistedPlayerPortals.map(entry=>({id:entry.portalId,isTeamJenkins:!!entry.isTeamJenkins,data:entry.isTeamJenkins?jenkinsPortalCleanupPayload(db.roster.find(item=>item.name===entry.name),entry):{activePractice:null,updatedAt:firebase.firestore.FieldValue.serverTimestamp()}})),
  ...db.roster.filter(player=>player.portalId&&activeNames.has(player.name)&&!persistedIds.has(player.portalId)).map(player=>({id:player.portalId,isTeamJenkins:!!player.isTeamJenkins,data:player.isTeamJenkins?jenkinsPortalResetPayload(player):{activePractice:null,updatedAt:firebase.firestore.FieldValue.serverTimestamp()}})),
  ...(coachPortalId?[{id:coachPortalId,data:{activePractice:null,updatedAt:firebase.firestore.FieldValue.serverTimestamp()}}]:[]),
  ...[...guestPortalIds].map(id=>({id,isGuest:true,data:{activePractice:null,expired:true,accessStatus:'ended',endedAt:firebase.firestore.FieldValue.serverTimestamp(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()}}))
 ];
 const existingCleanup=await Promise.all(cleanupTargets.map(async target=>{const snapshot=await portalDoc(target.id).get();if(!snapshot.exists)return null;const remote=snapshot.data()||{},remotePracticeId=remote.activePractice?.id||'';if(remotePracticeId&&remotePracticeId!==practicePlan.portalDraftId)throw new Error('portal-clear-newer-practice-conflict');
  // If this target no longer contains the practice being ended, do not mutate it.
  // This matters for reusable Jenkins/coach portals: a late DONE retry must not
  // expire/reset a portal whose old activePractice was already cleared elsewhere.
  if(!remotePracticeId)return {target,alreadyCleared:true};
  return {target,alreadyCleared:false};
 }));
 existingCleanup.filter(item=>item&&!item.alreadyCleared).forEach(item=>batch.update(portalDoc(item.target.id),item.target.data));
 if(existingCleanup.some(item=>item&&!item.alreadyCleared))await batch.commit();
 // Confirm the ended practice is actually gone from every portal before
 // clearing the coach's local active-practice reference.
 const verifyIds=[...new Set([
  ...persistedPlayerPortals.map(entry=>entry.portalId),
  ...db.roster.filter(player=>player.portalId&&activeNames.has(player.name)).map(player=>player.portalId),
  coachPortalId,
  ...guestPortalIds
 ].filter(Boolean))];
 if(!verifyIds.length)throw new Error('portal-clear-no-targets');
 const verification=await Promise.all(verifyIds.map(async id=>{
  const snapshot=await portalDoc(id).get();
  if(!snapshot.exists)return true;
  const remote=snapshot.data()||{};
  if(remote.activePractice)return false;
  // Temporary guest links must be expired at cleanup. Jenkins links are
  // intentionally reusable and return to waiting instead of expiring.
  if(guestPortalIds.has(id))return remote.expired===true&&remote.accessStatus==='ended';
  const persisted=persistedPlayerPortals.find(entry=>entry.portalId===id),rosterPlayer=db.roster.find(player=>player.portalId===id&&activeNames.has(player.name));
  if(persisted?.isTeamJenkins||rosterPlayer?.isTeamJenkins)return remote.portalType==='jenkinsPlayer'&&remote.accessStatus==='waiting'&&remote.expired===false;
  return true;
 }));
 if(verification.some(cleared=>!cleared))throw new Error('portal-clear-verification-failed');
 db.activePortalPractice=null;
 if(db.activePracticeSession&&practicePlan)persistPracticeSession();else save();
}
function recoveryDrillByName(name){
 return (Array.isArray(window.HotBDrillLibrary)?window.HotBDrillLibrary:[]).find(drill=>drill.name===name)||{name,category:'Recovered Practice',hittingMethod:'',primaryPurpose:''};
}
function recoveryAssignmentToEntry(assignment){
 const value=String(assignment||'').trim();
 if(!value)return {activity:'Not Present'};
 let match=value.match(/^Drill Station (\d+)\s+—/i);if(match)return {activity:`Drill #${match[1]}`};
 match=value.match(/^Pitch Live(?: \(([^)]+)\)|\s+—\s+Catcher:\s+([^—]+?)(?:\s+—|$))/i);if(match)return {activity:'Pitch Live',partner:(match[1]||match[2]||'').trim().replace(/^9-Square$/i,'9Square')};
 match=value.match(/^Catch Live\s+—\s+(.+?)(?:\s+—\s+12 pitches minimum per hitter)?$/i);if(match)return {activity:'Catch Live',partner:match[1].trim()};
 match=value.match(/^Hit Live\s+—.*?—\s+([^\s—]+)\s+\(([^)]+)\)/i);if(match)return {activity:'Hit Live',partner:match[1]};
 if(/^Machine\b/i.test(value))return {activity:'Machine'};
 if(/^Front Toss\b/i.test(value))return {activity:'Front Toss'};
 if(/^Stretch$/i.test(value))return {activity:'Stretch'};
 if(/^Tee Work$/i.test(value))return {activity:'Tee Work'};
 if(/^Not Present$/i.test(value))return {activity:'Not Present'};
 return {activity:value};
}
async function clearFinishedOrphanedPractice(state){
 if(!cloudUser||!cloudStore||!state?.id)throw new Error('cloud-unavailable');
 const activeNames=new Set(state.players||[]),persisted=state.playerPortals||[],persistedIds=new Set(persisted.map(entry=>entry.portalId)),guestIds=new Set([...(state.guestPlayerPortalIds||[]),...(state.guestCoachPortalIds||[])].filter(Boolean)),coachId=state.coachPortalId||db.coachPortal?.portalId;
 const targets=[
  ...persisted.map(entry=>({id:entry.portalId,data:entry.isTeamJenkins?jenkinsPortalCleanupPayload(db.roster.find(item=>item.name===entry.name),entry):{activePractice:null,updatedAt:firebase.firestore.FieldValue.serverTimestamp()}})),
  ...db.roster.filter(player=>player.portalId&&activeNames.has(player.name)&&!persistedIds.has(player.portalId)).map(player=>({id:player.portalId,isTeamJenkins:!!player.isTeamJenkins,data:player.isTeamJenkins?jenkinsPortalResetPayload(player):{activePractice:null,updatedAt:firebase.firestore.FieldValue.serverTimestamp()}})),
  ...(coachId?[{id:coachId,data:{activePractice:null,updatedAt:firebase.firestore.FieldValue.serverTimestamp()}}]:[]),
  ...[...guestIds].map(id=>({id,data:{activePractice:null,expired:true,accessStatus:'ended',endedAt:firebase.firestore.FieldValue.serverTimestamp(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()}}))
 ];
 const existing=await Promise.all(targets.map(async target=>{const snapshot=await portalDoc(target.id).get();if(!snapshot.exists)return null;const remote=snapshot.data()||{},remotePracticeId=remote.activePractice?.id||'';if(remotePracticeId&&remotePracticeId!==state.id)throw new Error('finished-orphan-newer-practice-conflict');
  // Recovery cleanup is also idempotent. A portal that no longer contains this
  // finished orphan is verification-only; never expire/reset it on a late retry.
  if(!remotePracticeId)return {target,alreadyCleared:true};
  return {target,alreadyCleared:false};
 })),batch=cloudStore.batch();
 existing.filter(item=>item&&!item.alreadyCleared).forEach(item=>batch.update(portalDoc(item.target.id),item.target.data));if(existing.some(item=>item&&!item.alreadyCleared))await batch.commit();
 const verifyIds=[...new Set(targets.map(target=>target.id).filter(Boolean))],verification=await Promise.all(verifyIds.map(async id=>{const snapshot=await portalDoc(id).get();if(!snapshot.exists)return true;const remote=snapshot.data()||{};if(remote.activePractice)return false;if(guestIds.has(id))return remote.expired===true&&remote.accessStatus==='ended';const entry=persisted.find(item=>item.portalId===id),rosterPlayer=db.roster.find(player=>player.portalId===id&&activeNames.has(player.name));if(entry?.isTeamJenkins||rosterPlayer?.isTeamJenkins)return remote.portalType==='jenkinsPlayer'&&remote.accessStatus==='waiting'&&remote.expired===false;return true}));
 if(!verification.length||verification.some(ok=>!ok))throw new Error('finished-orphan-cleanup-verification-failed');
 // Only discard the local practice session when this exact orphan is still the
 // active portal practice. A late orphan-cleanup result must never erase a newer
 // practice that was created while Firestore verification was in flight.
 if(db.activePortalPractice?.id===state.id){
  db.activePortalPractice=null;
  if(!db.activePracticeSession||db.activePracticeSession?.plan?.portalDraftId===state.id)db.activePracticeSession=null;
  save();
 }
}
async function recoverPublishedPractice(){
 if(db.activePortalPractice?.id){if(practicePlan)practicePlan=null;return recoverOrphanedActivePractice()}
 const coachId=db.coachPortal?.portalId;
 if(!coachId){alert('HotB cannot check the published practice because the saved coach portal reference is missing. Nothing was changed.');return}
 if(!cloudUser||!cloudStore){alert('HotB needs the coach cloud connection before it can check the already-published practice. Nothing was changed.');return}
 const button=$('#recoverPublishedPractice');if(button){button.disabled=true;button.textContent='Checking Portal…'}
 try{
  const snapshot=await Promise.race([portalDoc(coachId).get(),new Promise((_,reject)=>setTimeout(()=>reject(new Error('practice-recovery-timeout')),8000))]),remote=snapshot.exists?snapshot.data()?.activePractice:null;
  if(!remote?.id){alert('HotB checked the coach portal. There is no active published practice to recover. Your saved practice was not changed.');return}
  const localPlan=db.activePracticeSession?.plan||practicePlan;
  // If a generated local plan survived, it must match exactly. If only the setup
  // draft survived the quota failure, the coach portal is authoritative and the
  // existing rigorous recovery routine will reconstruct the exact published plan.
  if(localPlan?.portalDraftId&&localPlan.portalDraftId!==remote.id)throw new Error('published-practice-differs-from-saved-plan');
  const publishedFirstNames=new Set((remote.players||[]).map(item=>practiceFirstName(item.name)));
  const playerPortals=(db.roster||[]).filter(player=>player.portalId&&publishedFirstNames.has(practiceFirstName(player.name))).map(player=>({name:player.name,portalId:player.portalId,isTeamJenkins:!!player.isTeamJenkins}));
  db.activePortalPractice={id:remote.id,active:true,activatedAt:remote.activatedAt||new Date().toISOString(),players:playerPortals.map(item=>item.name),playerPortals,coachPortalId:coachId,guestPlayerPortalIds:[],guestCoachPortalIds:[]};
  compactReconstructableLocalCaches();persistDbLocal();
  practicePlan=null;
  await recoverOrphanedActivePractice();
 }catch(error){
  console.error('Published practice recovery failed',error);
  alert(String(error?.message||'')==='published-practice-differs-from-saved-plan'?'HotB found a different active practice on the coach portal. Nothing was changed.':'HotB could not verify and recover the published practice. Nothing was changed.');
 }finally{if(button){button.disabled=false;button.textContent='Recover Practice'}}
}
async function recoverOrphanedActivePractice(){
 if(practicePlan)return;
 if(!db.activePortalPractice?.id){alert('HotB no longer has the active practice reference. Nothing was changed.');return}
 if(!cloudStore){
  let loaderError='';
  if(!window.HotBFirebaseReady&&!window.firebase){
   try{
    window.HotBFirebaseReady=(async()=>{
     const sources=['https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js','https://www.gstatic.com/firebasejs/10.14.1/firebase-auth-compat.js','https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore-compat.js'];
     for(const src of sources){
      await new Promise((resolve,reject)=>{
       const s=document.createElement('script');s.src=src;s.async=false;s.dataset.hotbFirebase=src;
       s.onload=resolve;s.onerror=()=>reject(new Error('firebase-load-failed:'+src));document.head.appendChild(s);
      });
     }
     if(!window.firebase)throw new Error('firebase-global-missing');
     return window.firebase;
    })();
   }catch(error){loaderError=String(error?.message||error||'loader setup failed')}
  }
  if(window.HotBFirebaseReady){try{await window.HotBFirebaseReady}catch(error){loaderError=String(error?.message||error||'loader failed')}}
  let initError='';
  if(window.firebase){try{if(!firebase.apps.length)firebase.initializeApp(firebaseConfig);cloudAuth=firebase.auth();cloudStore=firebase.firestore();cloudInitStarted=true}catch(error){initError=String(error?.code||error?.message||error||'initialization failed')}}
  if(!cloudStore){
   const attempted=[...document.scripts].filter(s=>s.dataset?.hotbFirebase).map(s=>s.dataset.hotbFirebase||'');
   const detail=!window.firebase?(loaderError||`Firebase SDK unavailable; loader=${window.HotBFirebaseReady?'present':'missing'}; attempts=${attempted.length}`):(initError||'Firebase Firestore unavailable');
   alert(`HotB could not start the portal connection (${detail}). Nothing was changed.`);return
  }
 }
 if(!cloudUser){
  let current=cloudAuth?.currentUser;
  if(!current&&cloudAuth){try{current=await new Promise(resolve=>{let settled=false;const finish=user=>{if(settled)return;settled=true;clearTimeout(timer);unsubscribe?.();resolve(user||cloudAuth.currentUser||null)},unsubscribe=cloudAuth.onAuthStateChanged(finish),timer=setTimeout(()=>finish(cloudAuth.currentUser),4000)})}catch(error){current=cloudAuth.currentUser}}
  if(current&&!current.isAnonymous&&String(current.email||'').toLowerCase()===CLOUD_EMAIL)cloudUser=current;
  else{alert('HotB is connected to the portal service, but the coach cloud session is signed out. Nothing was changed.');return}
 }
 const state=db.activePortalPractice,coachId=state.coachPortalId||db.coachPortal?.portalId;
 if(!state.active){alert('HotB no longer marks this portal practice as active. Nothing was changed.');return}
 if(!coachId){alert('HotB cannot safely recover this practice because the saved coach portal reference is missing. Nothing was changed.');return}
 const button=$('#recoverOrphanedPractice');if(button){button.disabled=true;button.textContent='Recovering…'}
 try{
  const snapshot=await Promise.race([portalDoc(coachId).get(),new Promise((_,reject)=>setTimeout(()=>reject(new Error('practice-recovery-timeout')),8000))]),remote=snapshot.exists?snapshot.data()?.activePractice:null;
  if(!remote||remote.id!==state.id)throw new Error('practice-mismatch');
  // A finished remote clock is authoritative. Never reconstruct it into a new
  // local live practice or give it another chance to republish stale plan data.
  if(remote.clock?.status==='finished'){
   await clearFinishedOrphanedPractice(state);
   alert('HotB found that this practice had already finished. The stale portal plans were cleared instead of reopening the practice.');
   render();return;
  }
  if(!Array.isArray(remote.players)||!remote.players.length||!Number.isFinite(Number(remote.blockMinutes))||Number(remote.blockMinutes)<=0)throw new Error('practice-payload-incomplete');
  const publishedNames=remote.players.map(player=>String(player.name||'').trim()).filter(Boolean),publishedIds=new Set(publishedNames.map(name=>name.toLowerCase()));if(!publishedIds.size||publishedIds.size!==publishedNames.length)throw new Error('practice-player-conflict');
  const blockCount=remote.players[0]?.schedule?.length;if(![10,11].includes(blockCount))throw new Error('practice-schedule-incomplete');
  for(const player of remote.players){if(!Array.isArray(player.schedule)||player.schedule.length!==blockCount)throw new Error('practice-schedule-incomplete');for(let index=0;index<blockCount;index++){const entry=player.schedule[index];if(Number(entry?.block)!==index+1||!String(entry?.time||'').trim()||!String(entry?.assignment||'').trim())throw new Error('practice-schedule-incomplete')}}
  const canonicalTimes=remote.players[0].schedule.map(entry=>String(entry.time||'').trim()),normalizePublishedTime=value=>String(value||'').trim().replace(/\s+/g,'').toLowerCase().replace(/am$/,'a').replace(/pm$/,'p').replace(/-/g,'–');
  for(const player of remote.players)for(let index=0;index<blockCount;index++)if(normalizePublishedTime(player.schedule[index]?.time)!==normalizePublishedTime(canonicalTimes[index]))throw new Error('practice-time-conflict');
  // Older/partial coach portal publications may not carry the coach-only
  // schedule even though every player's exact published schedule is intact.
  // The player schedules are the authoritative rotation. Recover from them and
  // rebuild the coach view locally rather than rejecting a valid publication.
  let recoveredCoachSchedule=null;
  if(Array.isArray(remote.schedule)&&remote.schedule.length===blockCount){
   const complete=remote.schedule.every((coachBlock,index)=>Number(coachBlock?.block)===index+1&&String(coachBlock?.time||'').trim()&&String(coachBlock?.assignment||'').trim());
   if(complete){
    for(let index=0;index<blockCount;index++)if(normalizePublishedTime(remote.schedule[index].time)!==normalizePublishedTime(canonicalTimes[index]))throw new Error('coach-time-conflict');
    recoveredCoachSchedule=structuredClone(remote.schedule);
   }
  }
  const blockMinutes=Number(remote.blockMinutes)||12,durationMinutes=blockMinutes*blockCount;
  const publishedRangeMinutes=value=>{const parts=String(value||'').split(/[–-]/).map(part=>part.trim());if(parts.length!==2)return null;const parse=value=>{const raw=String(value).trim(),m24=raw.match(/^(\d{1,2}):(\d{2})$/);if(m24)return Number(m24[1])*60+Number(m24[2]);const m12=raw.match(/^(\d{1,2}):(\d{2})\s*([ap])(?:m)?$/i);if(!m12)return null;let hour=Number(m12[1])%12;if(m12[3].toLowerCase()==='p')hour+=12;return hour*60+Number(m12[2])};const start=parse(parts[0]),end=parse(parts[1]);if(start===null||end===null)return null;return (end-start+1440)%1440};
  for(const value of canonicalTimes)if(publishedRangeMinutes(value)!==blockMinutes)throw new Error('practice-duration-conflict');
  const firstTime=String(remote.players?.[0]?.schedule?.[0]?.time||'').split('–')[0].trim();
  const startLabel=firstTime||remote.startLabel||'6:00p';
  const parseLabel=value=>{const raw=String(value).trim(),twentyFour=raw.match(/^(\d{1,2}):(\d{2})$/);if(twentyFour&&Number(twentyFour[1])<24)return `${String(Number(twentyFour[1])).padStart(2,'0')}:${twentyFour[2]}`;const match=raw.match(/^(\d{1,2}):(\d{2})\s*([ap])(?:m)?$/i);if(!match)return '18:00';let hour=Number(match[1])%12;if(match[3].toLowerCase()==='p')hour+=12;return `${String(hour).padStart(2,'0')}:${match[2]}`};
  const startTime=parseLabel(startLabel),times=Array.from({length:blockCount},(_,index)=>{const published=remote.players?.[0]?.schedule?.[index],parts=String(published?.time||'').split('–').map(value=>value.trim());if(parts.length===2&&parts[0]&&parts[1])return {block:index+1,start:parts[0],end:parts[1]};const startMinutes=practiceTimeMinutes(startTime);if(startMinutes===null)throw new Error('invalid-practice-start-time');const base=startMinutes+index*blockMinutes;return {block:index+1,start:practiceTimeLabel(practiceTimeValue(base)),end:practiceTimeLabel(practiceTimeValue(base+blockMinutes))}});
  const rosterByFirst=new Map();for(const player of db.roster){const key=practiceFirstName(player.name);if(rosterByFirst.has(key))throw new Error('roster-first-name-conflict');rosterByFirst.set(key,player)}
  const activeNameByFirst=new Map();for(const name of state.players||[]){const key=practiceFirstName(name);if(activeNameByFirst.has(key)&&activeNameByFirst.get(key)!==name)throw new Error('active-first-name-conflict');activeNameByFirst.set(key,name)}
  const players=(remote.players||[]).map(item=>{const first=practiceFirstName(item.name),source=rosterByFirst.get(first),name=source?.name||activeNameByFirst.get(first)||item.name,base=practicePlayerModel(source||{name,positions:item.role||''}),roleTokens=String(item.role||'').toUpperCase().split(/[^A-Z]+/).filter(Boolean),rolePitcher=roleTokens.includes('P'),roleCatcher=roleTokens.includes('C'),published=(item.schedule||[]).map(entry=>recoveryAssignmentToEntry(entry.assignment)),present=published.map((entry,index)=>entry.activity!=='Not Present'?index:-1).filter(index=>index>=0),availableFromBlock=present.length?Math.min(...present):0,availableUntilBlock=present.length?Math.max(...present)+1:0;return {...base,name,isPitcher:base.isPitcher||rolePitcher,isCatcher:base.isCatcher||roleCatcher,canPitch:base.isPitcher||rolePitcher,requiresPitchWarmup:base.isPitcher||rolePitcher,canCatch:base.isCatcher||roleCatcher,availableFromBlock,availableUntilBlock}});
  const schedule={};
  (remote.players||[]).forEach(item=>{const first=practiceFirstName(item.name),source=rosterByFirst.get(first),name=source?.name||activeNameByFirst.get(first)||item.name;schedule[name]=(item.schedule||[]).map(entry=>recoveryAssignmentToEntry(entry.assignment))});
  const stationNumbers=new Set(),stationDrillNames=new Map();
  Object.values(schedule).flat().forEach(entry=>{const match=String(entry.activity).match(/^Drill #(\d+)$/);if(match)stationNumbers.add(Number(match[1]))});
  for(const item of remote.players||[])for(const entry of item.schedule||[]){const match=String(entry.assignment||'').match(/^Drill Station (\d+)\s+—\s+(.+)$/i);if(match){const number=Number(match[1]),name=match[2].trim();if(stationDrillNames.has(number)&&stationDrillNames.get(number)!==name)throw new Error('drill-station-conflict');stationDrillNames.set(number,name)}}
  const drillStations=Math.max(0,...stationNumbers);
  let machineFocus='Standard',frontTossFocus='Standard';
  for(const item of remote.players||[])for(const entry of item.schedule||[]){let match=String(entry.assignment||'').match(/^Machine\s+—\s+(.+)$/i);if(match)machineFocus=match[1].trim();match=String(entry.assignment||'').match(/^Front Toss\s+—\s+(.+)$/i);if(match)frontTossFocus=match[1].trim()}
  const chosenNames=Array.from({length:drillStations},(_,index)=>stationDrillNames.get(index+1)||'');
  if(chosenNames.some(name=>!name))throw new Error('drill-recovery-mismatch');
  const chosenDrills=chosenNames.map(recoveryDrillByName);
  const liveSessions=[];
  for(const item of remote.players||[])for(const [index,published] of (item.schedule||[]).entries()){const publishedText=String(published.assignment||''),legacyMatch=publishedText.match(/^Hit Live\s+—.*?—\s+([^—()]+?)\s+\(([^)]+)\)/i),labeledMatch=publishedText.match(/^Hit Live\s+—.*?Pitcher:\s*([^—]+?)\s+—\s+Catcher:\s*(.+)$/i),match=labeledMatch||legacyMatch;if(!match)continue;const pitcher=match[1].trim(),catcher=match[2].trim().replace(/^9-Square$/i,'9Square');let session=liveSessions.find(entry=>entry.block===index);if(!session){session={block:index,pitcher,catcher,hitters:[]};liveSessions.push(session)}else if(session.pitcher!==pitcher||session.catcher!==catcher)throw new Error('live-session-conflict');const first=practiceFirstName(item.name),hitter=rosterByFirst.get(first)?.name||activeNameByFirst.get(first)||item.name;if(!session.hitters.includes(hitter))session.hitters.push(hitter)}
  Object.entries(schedule).forEach(([name,entries])=>entries.forEach((entry,index)=>{if(entry.activity!=='Pitch Live')return;let session=liveSessions.find(item=>item.block===index);if(!session){session={block:index,pitcher:name,catcher:'9Square',hitters:[]};liveSessions.push(session)}}));
  const blocks=Array.from({length:blockCount},(_,index)=>{const assignments={};Object.entries(schedule).forEach(([name,entries])=>{const entry=entries[index];if(!entry)return;let key=entry.activity;if(entry.activity==='Pitch Live')key=`Pitch Live — ${entry.partner||'9Square'}`;else if(entry.activity==='Catch Live')key=`Catch Live — ${entry.partner||''}`;else if(entry.activity==='Hit Live'){const live=liveSessions.find(item=>item.block===index);key=live?`Hit Live — ${live.pitcher} — ${live.catcher}`:'Hit Live'};(assignments[key]||(assignments[key]=[])).push(name)});return {block:index+1,start:times[index].start,end:times[index].end,assignments}});
  const recoveredPlayerSchedules={};for(const item of remote.players||[]){const first=practiceFirstName(item.name),source=rosterByFirst.get(first),name=source?.name||activeNameByFirst.get(first)||item.name;recoveredPlayerSchedules[name]=structuredClone(item.schedule)}
  const recoveredPlan={portalDraftId:remote.id,startTime,durationMinutes,blockMinutes,times,players,schedule,blocks,drillStations,liveSessions,machineFocus,frontTossFocus,recoveredCoachSchedule:recoveredCoachSchedule||[],recoveredPlayerSchedules,warnings:['Recovered from the activated coach portal without rebuilding the scheduler.']};
  const recoveredChosenDrills=chosenDrills,clock=remote.clock||{},startedAt=Date.parse(clock.startedAt||''),activatedAt=Date.parse(remote.activatedAt||'');
  // Recovery is valid only for this publication, but activation and Start are
  // independent client timestamps. Do not reject a legitimate live practice
  // merely because startedAt sorts a few milliseconds before activatedAt.
  if(clock.status==='finished')throw new Error('practice-already-finished');
  if(!['not-started','running'].includes(clock.status||'not-started'))throw new Error('practice-clock-invalid');
  if(clock.status==='running'&&!Number.isFinite(startedAt))throw new Error('practice-clock-invalid');
  if(clock.status==='not-started'&&clock.startedAt)throw new Error('practice-clock-invalid');
  const recoveredClock={running:clock.status==='running'&&Number.isFinite(startedAt),finished:clock.status==='finished',endAnnounced:false,startAt:Number.isFinite(startedAt)?startedAt:0,lastBlock:1,lastTwoMinuteBlock:0,lastTransitionBlock:0,completedAt:clock.endedAt||null};
  const recoveredLayout=window.HotBPracticeSession?.layout?.(recoveredPlan),scheduledEnd=Number.isFinite(startedAt)&&recoveredLayout?startedAt+recoveredLayout.totalMs:NaN,expiredByTime=Number.isFinite(scheduledEnd)&&Date.now()>=scheduledEnd;
  if(expiredByTime&&!recoveredClock.finished){recoveredClock.running=false;recoveredClock.finished=true;recoveredClock.completedAt=clock.endedAt||new Date(scheduledEnd).toISOString()}
  else if(recoveredClock.running){const recoveredTiming=window.HotBPracticeSession?.timing(recoveredPlan,recoveredClock,Date.now());if(!recoveredTiming){recoveredClock.running=false;recoveredClock.finished=true;recoveredClock.completedAt=clock.endedAt||new Date(recoveredClock.startAt+window.HotBPracticeSession.layout(recoveredPlan).totalMs).toISOString()}else{recoveredClock.lastBlock=recoveredTiming.block;recoveredClock.lastTwoMinuteBlock=window.HotBPracticeSession?.pendingTwoMinuteWarning(recoveredPlan,{...recoveredClock,lastTwoMinuteBlock:0},Date.now())===recoveredTiming.block?recoveredTiming.block:0;recoveredClock.lastTransitionBlock=recoveredTiming.transition?recoveredTiming.block:Math.max(0,recoveredTiming.block-1)}}
  // Before installing reconstructed state, prove the coach document did not
  // change while the larger schedule payload was being validated/rebuilt.
  const finalSnapshot=await portalDoc(coachId).get(),finalRemote=finalSnapshot.exists?finalSnapshot.data()?.activePractice:null;
  if(!finalRemote||finalRemote.id!==state.id||finalRemote.activatedAt!==remote.activatedAt)throw new Error('practice-recovery-changed-during-read');
  const finalClock=finalRemote.clock||{},sameClock=finalClock.status===clock.status&&(finalClock.startedAt||null)===(clock.startedAt||null)&&(finalClock.endedAt||null)===(clock.endedAt||null);
  if(!sameClock)throw new Error('practice-recovery-clock-changed');
  practicePlan=recoveredPlan;practiceChosenDrills=recoveredChosenDrills;practiceClock=recoveredClock;practiceDraftDrills=[];practiceDrillPickerOpen=false;practiceEquipmentSetupOpen=false;practiceSection='builder';
  persistPracticeSession();render();if(practiceClock.running)resumeRecoveredPracticeClock();
  alert('The activated practice was recovered from the coach portal. HotB did not rebuild or reactivate it.');
 }catch(error){
  console.error('Practice recovery failed',error);
  const code=String(error?.message||error||'unknown-recovery-error');
  alert(code==='practice-recovery-timeout'?'HotB could not reach the activated coach practice in time. Nothing was changed.':`HotB recovery stopped safely. Recovery code: ${code}. Nothing was changed. Do not use Clean Up.`);
 }
 finally{if(button){button.disabled=false;button.textContent='Recover Practice'}}
}
async function clearOrphanedActivePractice(){
 if(!cloudUser||!cloudStore||!db.activePortalPractice?.id||practicePlan)return;
 if(!confirm('HotB found active portal plans without a recoverable local practice. Remove those stale portal plans so a new practice can be built?'))return;
 const state=db.activePortalPractice,batch=cloudStore.batch(),activeNames=new Set(state.players||[]),persistedPlayerPortals=state.playerPortals||[];
 const persistedIds=new Set(persistedPlayerPortals.map(entry=>entry.portalId));
 const orphanGuestIds=new Set([...(state.guestPlayerPortalIds||[]),...(state.guestCoachPortalIds||[])].filter(Boolean));
 const orphanTargets=[
  ...persistedPlayerPortals.map(entry=>({id:entry.portalId,data:entry.isTeamJenkins?jenkinsPortalCleanupPayload(db.roster.find(item=>item.name===entry.name),entry):{activePractice:null,updatedAt:firebase.firestore.FieldValue.serverTimestamp()}})),
  ...db.roster.filter(player=>player.portalId&&activeNames.has(player.name)&&!persistedIds.has(player.portalId)).map(player=>({id:player.portalId,data:player.isTeamJenkins?jenkinsPortalResetPayload(player):{activePractice:null,updatedAt:firebase.firestore.FieldValue.serverTimestamp()}})),
  ...(state.coachPortalId?[{id:state.coachPortalId,data:{activePractice:null,updatedAt:firebase.firestore.FieldValue.serverTimestamp()}}]:[]),
  ...[...orphanGuestIds].map(id=>({id,data:{activePractice:null,expired:true,accessStatus:'ended',endedAt:firebase.firestore.FieldValue.serverTimestamp(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()}}))
 ];
 try{
  // Orphan cleanup is also update-only. A missing old portal must not be
  // recreated as a partial document while cleaning a stale practice reference.
  const existingOrphans=await Promise.all(orphanTargets.map(async target=>{const snapshot=await portalDoc(target.id).get();if(!snapshot.exists)return null;const remote=snapshot.data()||{},remotePracticeId=remote.activePractice?.id||'';if(remotePracticeId&&remotePracticeId!==state.id)throw new Error('orphan-cleanup-newer-practice-conflict');if(!remotePracticeId)return {target,alreadyCleared:true};return {target,alreadyCleared:false}}));
  existingOrphans.filter(item=>item&&!item.alreadyCleared).forEach(item=>batch.update(portalDoc(item.target.id),item.target.data));
  if(existingOrphans.some(item=>item&&!item.alreadyCleared))await batch.commit();
  const verifyIds=[...new Set([...persistedPlayerPortals.map(entry=>entry.portalId),...db.roster.filter(player=>player.portalId&&activeNames.has(player.name)).map(player=>player.portalId),state.coachPortalId,...(state.guestPlayerPortalIds||[]),...(state.guestCoachPortalIds||[])].filter(Boolean))];
  if(!verifyIds.length)throw new Error('orphan-cleanup-no-targets');
  const verification=await Promise.all(verifyIds.map(async id=>{const snapshot=await portalDoc(id).get();if(!snapshot.exists)return true;const remote=snapshot.data()||{};if(remote.activePractice)return false;if(orphanGuestIds.has(id))return remote.expired===true;const entry=persistedPlayerPortals.find(item=>item.portalId===id),rosterPlayer=db.roster.find(player=>player.portalId===id&&activeNames.has(player.name));if(entry?.isTeamJenkins||rosterPlayer?.isTeamJenkins)return remote.portalType==='jenkinsPlayer'&&remote.accessStatus==='waiting'&&remote.expired===false;return true}));
  if(verification.some(cleared=>!cleared))throw new Error('orphan-cleanup-verification-failed');
  // Clear only the exact stale reference that was verified. A newer local
  // practice/session created while Firestore cleanup was in flight must survive.
  if(db.activePortalPractice?.id!==state.id)throw new Error('orphan-cleanup-local-practice-changed');
  db.activePortalPractice=null;
  if(!db.activePracticeSession||db.activePracticeSession?.plan?.portalDraftId===state.id)db.activePracticeSession=null;
  save();render();alert('The stale portal practice was removed. You can build a new practice now.');
 }
 catch(error){alert('The stale portal practice could not be removed or verified. HotB kept the local recovery reference so nothing can be silently lost. Check your connection and try again.')}
}
async function syncPlayerPracticeClock(){
 if(!cloudUser||!cloudStore||!practicePlan||db.activePortalPractice?.id!==practicePlan.portalDraftId)return false;
 const clock=practiceClockPortalPayload(),activeId=practicePlan.portalDraftId,ids=[...new Set([
  ...(db.activePortalPractice?.playerPortals||[]).map(entry=>entry.portalId),
  db.activePortalPractice?.coachPortalId||db.coachPortal?.portalId,
  ...(db.activePortalPractice?.guestPlayerPortalIds||[]),
  ...(db.activePortalPractice?.guestCoachPortalIds||[])
 ].filter(Boolean))];
 if(!ids.length){console.warn('Player portal clock sync had no portal targets');return false}
 // Never write a clock from stale local state onto a different/newer practice.
 // First prove every target still contains this exact publication, then update
 // all clocks atomically, then verify the result once.
 const preflight=await Promise.all(ids.map(async id=>{try{
  const snapshot=await portalDoc(id).get(),active=snapshot.exists?snapshot.data()?.activePractice:null;
  return active?.id===activeId;
 }catch(error){return false}}));
 if(preflight.some(ok=>!ok)){console.warn('Player portal clock preflight mismatch');return false}
 const batch=cloudStore.batch();
 ids.forEach(id=>batch.update(portalDoc(id),{'activePractice.clock':clock,updatedAt:firebase.firestore.FieldValue.serverTimestamp()}));
 try{await batch.commit()}catch(error){console.warn('Player portal clock batch failed',error);return false}
 const verification=await Promise.all(ids.map(async id=>{try{
  const snapshot=await portalDoc(id).get(),remote=snapshot.exists?snapshot.data()?.activePractice:null,remoteClock=remote?.clock||{};
  return remote?.id===activeId&&remoteClock.status===clock.status&&(clock.startedAt?remoteClock.startedAt===clock.startedAt:!remoteClock.startedAt)&&(clock.endedAt?remoteClock.endedAt===clock.endedAt:!remoteClock.endedAt);
 }catch(error){return false}}));
 return verification.every(Boolean);
}
async function activatePlayerPlans(){
 if(!cloudUser||!cloudStore){alert('Sign in through Cloud Backup before activating player portals.');return}
 // Firebase can restore an old/anonymous portal identity before the coach auth
 // observer finishes. Activation is a coach-only write, so verify the live Auth
 // user immediately before touching playerPortals instead of trusting stale
 // cloudUser state from an earlier callback.
 let activationUser=cloudAuth?.currentUser||null;
 if(!activationUser||activationUser.isAnonymous||String(activationUser.email||'').toLowerCase()!==CLOUD_EMAIL){
  try{activationUser=await waitForPortalAuthState(5000)}catch(_){activationUser=cloudAuth?.currentUser||null}
 }
 if(!activationUser||activationUser.isAnonymous||String(activationUser.email||'').toLowerCase()!==CLOUD_EMAIL){
  cloudUser=null;
  alert('Your coach cloud session needs to reconnect before HotB can activate player plans. Open Cloud Backup, sign in, then return to this practice. Nothing was changed.');
  return;
 }
 cloudUser=activationUser;
 if(!practicePlan||practiceChosenDrills.length!==practicePlan.drillStations){alert('Choose all practice drills before activating player plans.');return}
 if(practiceClock.finished){alert('This practice is already finished and cannot be activated again. Build a new practice to publish new player plans.');return}
 if(db.activePortalPractice?.id){alert(db.activePortalPractice.id===practicePlan.portalDraftId?'This exact practice is already active on the player and coach portals. HotB will not republish it or reset its live clock.':'Another practice is still active on the player and coach portals. End or deactivate that practice before activating this one.');return}
 if(window.HotBPracticeScheduler?.validate){const errors=window.HotBPracticeScheduler.validate(practicePlan);if(errors.length){alert(`The practice plans cannot be activated because this schedule failed its safety checks:\n\n${errors.join('\n\n')}`);return}}
 const planBlockCount=practicePlan.times?.length||10,attending=new Set(practicePlan.players.filter(player=>(player.availableFromBlock??0)<(player.availableUntilBlock??planBlockCount)).map(player=>player.name)),jenkins=db.roster.filter(player=>player.isTeamJenkins&&attending.has(player.name)),missing=db.roster.filter(player=>!player.isTeamJenkins&&attending.has(player.name)&&!player.portalId);
 if(missing.length){alert(`Create Player Portals first. Missing: ${missing.map(player=>practiceFirstName(player.name)).join(', ')}.`);return}
 const button=$('#activatePlayerPlans');if(button){button.disabled=true;button.textContent='Activating…'}
 try{
  const activationTimestamp=new Date().toISOString();
  for(const player of jenkins)if(!player.portalId||!player.portalSecret)await createPendingGuestPortal(player,'jenkinsPlayer');
  const batch=cloudStore.batch();
  const permanentPlayers=db.roster.filter(player=>!player.isTeamJenkins&&player.portalId&&attending.has(player.name));
  const jenkinsPlayers=db.roster.filter(player=>player.isTeamJenkins&&player.portalId&&attending.has(player.name));
  const activeGuests=practiceGuestPlayers().filter(player=>attending.has(player.name)),activeGuestCoaches=practiceGuestCoaches();
  for(const guest of [...activeGuests,...activeGuestCoaches])if(!guest.portalId||!guest.portalSecret)throw new Error(`Guest link missing for ${guest.name}`);
  // Activation may publish only into complete portal documents that were created
  // by the setup/guest creation flows. Never let Activate recreate a deleted
  // permanent or guest portal as a partial active-practice record.
  const activationTargets=[
   ...permanentPlayers.map(player=>({id:player.portalId,type:'player',name:player.name})),
   ...jenkinsPlayers.map(player=>({id:player.portalId,type:'jenkinsPlayer',name:player.name})),
   ...(db.coachPortal?.portalId?[{id:db.coachPortal.portalId,type:'coach',name:db.coachPortal.name||''}]:[]),
   ...activeGuests.map(guest=>({id:guest.portalId,type:'guestPlayer',name:guest.name})),
   ...activeGuestCoaches.map(guest=>({id:guest.portalId,type:'guestCoach',name:guest.name}))
  ];
  const activationDocs=await Promise.all(activationTargets.map(async target=>({target,snapshot:await portalDoc(target.id).get()})));
  const sameIdActive=activationDocs.filter(({snapshot})=>snapshot.exists&&snapshot.data()?.activePractice?.id===practicePlan.portalDraftId);
  const conflicting=activationDocs.filter(({snapshot})=>{const remote=snapshot.exists?snapshot.data():null;return !!(remote?.activePractice?.id&&remote.activePractice.id!==practicePlan.portalDraftId)});
  for(const {target,snapshot} of activationDocs){const remote=snapshot.exists?snapshot.data():null;if(!remote||remote.portalType!==target.type)throw new Error('portal-activation-target-missing');if(['player','jenkinsPlayer','guestPlayer'].includes(target.type)&&remote.playerName!==target.name)throw new Error('portal-activation-player-mismatch');if(['coach','guestCoach'].includes(target.type)&&target.name&&remote.coachName!==target.name)throw new Error('portal-activation-coach-mismatch')}
  // A previous failed/test activation can leave an old NOT-STARTED practice on
  // portal documents even though the coach device has no active-practice pointer.
  // That stale publication must not permanently block the next real practice.
  // Clear it only when every conflicting portal agrees on the same old practice
  // ID and its clock never started; anything running/finished/mixed remains a
  // hard conflict and is never overwritten.
  if(conflicting.length){
   const conflictIds=[...new Set(conflicting.map(({snapshot})=>snapshot.data()?.activePractice?.id).filter(Boolean))];
   const safeStale=conflictIds.length===1&&conflicting.every(({snapshot})=>{const active=snapshot.data()?.activePractice,clock=active?.clock||{};return active&&(!clock.status||clock.status==='not-started')&&!clock.startedAt&&!clock.endedAt});
   if(!safeStale)throw new Error('portal-activation-live-practice-conflict');
   const staleId=conflictIds[0],staleBatch=cloudStore.batch();
   for(const {target,snapshot} of activationDocs){
    const remote=snapshot.exists?snapshot.data():null;
    if(remote?.activePractice?.id!==staleId)continue;
    const data=target.type==='jenkinsPlayer'?jenkinsPortalCleanupPayload(db.roster.find(item=>item.portalId===target.id),{name:target.name,portalId:target.id,isTeamJenkins:true}):['guestPlayer','guestCoach'].includes(target.type)?{activePractice:null,expired:true,accessStatus:'ended',endedAt:firebase.firestore.FieldValue.serverTimestamp(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()}:{activePractice:null,updatedAt:firebase.firestore.FieldValue.serverTimestamp()};
    staleBatch.update(portalDoc(target.id),data);
   }
   await staleBatch.commit();
   const staleVerify=await Promise.all(conflicting.map(async ({target})=>{const snap=await portalDoc(target.id).get();return !snap.exists||snap.data()?.activePractice?.id!==staleId}));
   if(staleVerify.some(ok=>!ok))throw new Error('portal-activation-stale-cleanup-failed');
  }
  // A matching practice ID already in Firebase is not permission to overwrite it.
  // This is the signature of an activation whose local acknowledgement was lost
  // (or an older partial state). Republishing would reset its live clock to
  // Not Started. Stop and route through recovery instead.
  if(sameIdActive.length)throw new Error(sameIdActive.length===activationTargets.length?'portal-activation-existing-publication':'portal-activation-partial-existing-publication');
  permanentPlayers.forEach(player=>batch.update(portalDoc(player.portalId),{activePractice:{...playerPracticePortalPayload(player.name,activationTimestamp),clock:{status:'not-started',startedAt:null,endedAt:null}},updatedAt:firebase.firestore.FieldValue.serverTimestamp()}));
  jenkinsPlayers.forEach(player=>batch.update(portalDoc(player.portalId),jenkinsPortalResetPayload(player,playerPracticePortalPayload(player.name,activationTimestamp),'active')));
  if(db.coachPortal?.portalId)batch.update(portalDoc(db.coachPortal.portalId),{activePractice:coachPracticePortalPayload(activationTimestamp),updatedAt:firebase.firestore.FieldValue.serverTimestamp()});
  for(const guest of activeGuests)batch.update(portalDoc(guest.portalId),{expired:false,accessStatus:'active',activePractice:playerPracticePortalPayload(guest.name,activationTimestamp),updatedAt:firebase.firestore.FieldValue.serverTimestamp()});
  for(const guest of activeGuestCoaches){const activePractice={...coachPracticePortalPayload(activationTimestamp),coachName:guest.name};batch.update(portalDoc(guest.portalId),{expired:false,accessStatus:'active',activePractice,updatedAt:firebase.firestore.FieldValue.serverTimestamp()})}
  const pendingPortalPractice={active:true,id:practicePlan.portalDraftId,activatedAt:activationTimestamp,players:[...attending],playerPortals:db.roster.filter(player=>attending.has(player.name)&&player.portalId).map(player=>({name:player.name,portalId:player.portalId,isTeamJenkins:!!player.isTeamJenkins})),guestPlayerPortalIds:practiceGuestPlayers().filter(guest=>attending.has(guest.name)&&guest.portalId).map(guest=>guest.portalId),guestCoachPortalIds:practiceGuestCoaches().filter(guest=>guest.portalId).map(guest=>guest.portalId),coachPortalId:db.coachPortal?.portalId||''};
  // Do not mark the practice locally active until Firebase has accepted every portal update.
  try{await batch.commit()}
  catch(error){throw error}
  // Verify every player, coach, guest and Jenkins portal actually received
  // this exact practice before the coach device records it as active.
  const verifyIds=[...new Set([
   ...pendingPortalPractice.playerPortals.map(entry=>entry.portalId),
   pendingPortalPractice.coachPortalId,
   ...pendingPortalPractice.guestPlayerPortalIds,
   ...pendingPortalPractice.guestCoachPortalIds
  ].filter(Boolean))];
  if(!verifyIds.length)throw new Error('portal-activation-no-targets');
  const verification=await Promise.all(verifyIds.map(async id=>{
   const snapshot=await portalDoc(id).get(),remote=snapshot.exists?snapshot.data():null,active=remote?.activePractice;
   return !!remote&&active?.id===practicePlan.portalDraftId&&active?.activatedAt===activationTimestamp&&active?.clock?.status==='not-started'&&!active?.clock?.startedAt;
  }));
  if(verification.some(ok=>!ok)){
   // Firebase batches are atomic, but a successful commit followed by an
   // uncertain/stale read must not leave a published practice that the coach
   // device refuses to remember. Roll back only this exact activation version.
   const rollback=cloudStore.batch();let rollbackCount=0;
   const rollbackReads=await Promise.all(verifyIds.map(async id=>({id,snapshot:await portalDoc(id).get()})));
   for(const {id,snapshot} of rollbackReads){
    const remote=snapshot.exists?snapshot.data():null,active=remote?.activePractice;
    if(active?.id!==practicePlan.portalDraftId)continue;
    if(active?.activatedAt!==activationTimestamp)throw new Error('portal-activation-rollback-conflict');
    const isGuest=pendingPortalPractice.guestPlayerPortalIds.includes(id)||pendingPortalPractice.guestCoachPortalIds.includes(id);
    const playerEntry=pendingPortalPractice.playerPortals.find(entry=>entry.portalId===id);
    const data=isGuest?{activePractice:null,expired:true,accessStatus:'ended',endedAt:firebase.firestore.FieldValue.serverTimestamp(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()}:playerEntry?.isTeamJenkins?jenkinsPortalCleanupPayload(db.roster.find(item=>item.portalId===id),playerEntry):{activePractice:null,updatedAt:firebase.firestore.FieldValue.serverTimestamp()};
    rollback.update(portalDoc(id),data);rollbackCount++;
   }
   if(rollbackCount)await rollback.commit();
   const rollbackVerified=await Promise.all(verifyIds.map(async id=>{const snapshot=await portalDoc(id).get();return !snapshot.exists||!snapshot.data()?.activePractice}));
   if(rollbackVerified.some(ok=>!ok))throw new Error('portal-activation-rollback-verification-failed');
   throw new Error('portal-activation-verification-failed');
  }
  // Firebase publication is now verified. Record the local pointer exactly once.
  // persistPracticeSession() already saves the entire DB; the old second save()
  // duplicated a full localStorage write and could be the write that crossed
  // Safari's quota after a successful portal publication.
  db.activePortalPractice=pendingPortalPractice;
  try{persistPracticeSession()}
  catch(error){
   // Keep the verified publication pointer in memory so the catch path can route
   // to recovery instead of treating a successful Firebase activation as failed.
   if(String(error?.message||'').includes('device-storage-quota-exceeded'))throw error;
   throw error;
  }
  render();alert(`Plans activated for ${attending.size} ${attending.size===1?'player':'players'}${db.coachPortal?.portalId?' and 1 coach':''}${practiceGuestCoaches().length?` and ${practiceGuestCoaches().length} guest coach${practiceGuestCoaches().length===1?'':'es'}`:''}.`);
 }catch(error){
  if(button){button.disabled=false;button.textContent='Activate Player Plans'}
  const rawCode=String(error?.code||error?.message||error||'unknown');
  const code=rawCode==='22'&&error?.message?String(error.message):rawCode;
  console.error('HotB player-plan activation failed',error);
  if(code.includes('portal-activation-existing-publication')||code.includes('portal-activation-partial-existing-publication')){
   alert('HotB found this exact practice already published in the cloud. It was not overwritten or reset. Return to Practice Home and use Recover Practice so the existing live state can be verified.');
  }else if(code.includes('device-storage-quota-exceeded')){
   alert('HotB published the portal work but this iPhone could not save the updated practice locally because its HotB browser storage is full. Do not activate again. Return to Practice Home and use Recover Practice so HotB can verify the already-published practice.');
  }else if(/resource-exhausted|firestore.*quota/i.test(code)){
   alert('Firebase is temporarily refusing portal requests because its service quota is exhausted. Your practice plan is still on this phone. Do not repeatedly retry activation.');
  }else{
   alert('The player plans could not be activated.\n\nActivation error: '+code);
  }
 }
}
async function deactivatePlayerPlans(){
 if(practiceClock.running){alert('This practice is currently running. Use DONE! to end the practice and remove the live player and coach plans together.');return}
 if(!cloudUser||!cloudStore||!practicePlan||db.activePortalPractice?.id!==practicePlan.portalDraftId||!confirm('Remove this active practice from the player and coach portals?'))return;
 const button=$('#deactivatePlayerPlans');if(button)button.disabled=true;
 try{await clearActivePlayerPlans();render();alert('Player practice plans are no longer active.')}
 catch(error){if(button)button.disabled=false;alert('The active player plans could not be removed.')}
}
function practiceDrillPicker(){
 const needed=practicePlan.drillStations,drills=practiceSelectableDrills(),filters=['All Drills',...new Set(drills.map(drill=>drill.category).filter(Boolean))],query=practicePickerQuery.trim().toLowerCase();
 const shown=drills.filter(drill=>(practicePickerCategory==='All Drills'||drill.category===practicePickerCategory)&&(!query||Object.values(drill).some(value=>String(value).toLowerCase().includes(query))));
 return `<div class="page-match-head page-head-centered no-print"><button class="page-head-nav" id="cancelPracticeDrills">Back</button><h1>Choose Drills</h1><span class="page-head-spacer"></span></div><main class="practice-feature-page practice-drill-picker no-print"><section class="practice-feature-lead"><span>PRACTICE DRILLS</span><h2>Choose ${needed} Drills</h2><p>Select exactly ${needed}. The order you select them assigns Drill Station 1 through Drill Station ${needed}.</p></section><div class="practice-picker-progress"><b>${practiceDraftDrills.length} of ${needed} selected</b><div>${practiceDraftDrills.map((drill,index)=>`<span>Drill Station ${index+1} — ${esc(drill.name)}</span>`).join('')||'<span>No drills selected yet</span>'}</div></div><div class="practice-library-search"><input class="input" id="practicePickerSearch" type="search" placeholder="Search drills" value="${esc(practicePickerQuery)}" aria-label="Search practice drills"></div><div class="practice-filter-preview">${filters.map(filter=>`<button class="${filter===practicePickerCategory?'active':''}" data-picker-category="${esc(filter)}">${esc(filter)}</button>`).join('')}</div><section class="practice-picker-list">${shown.map(drill=>{const selectedIndex=practiceDraftDrills.findIndex(item=>item.name===drill.name),selected=selectedIndex>=0,full=practiceDraftDrills.length>=needed&&!selected;return `<button class="practice-picker-card ${selected?'selected':''}" data-picker-drill="${esc(drill.name)}" ${full?'disabled':''}><span class="practice-picker-number">${selected?selectedIndex+1:'+'}</span><span><b>${esc(drill.name)}</b><small>${esc(drill.category)} · ${esc(drill.hittingMethod)}</small></span></button>`}).join('')}</section><button class="btn black block practice-save-drills" id="savePracticeDrills" ${practiceDraftDrills.length===needed?'':'disabled'}>Use These ${needed} Drills</button><p class="practice-picker-note">Tee Work is already built in. Machine and Front Toss drills are selected from their own focus menus on the practice plan.</p></main>`;
}
function practiceEquipmentSetup(){
 const library=Array.isArray(window.HotBDrillLibrary)?window.HotBDrillLibrary:[],find=name=>library.find(drill=>drill.name===name),machine=find(practicePlan.machineFocus==='Standard'?'Machine Pitch':practicePlan.machineFocus),front=find(practicePlan.frontTossFocus==='Standard'?'Front Toss':practicePlan.frontTossFocus);
 const stations=[window.HotBPracticeEquipment.station('Machine Tunnel',machine,{protectiveScreen:true}),window.HotBPracticeEquipment.station('Front Toss Tunnel',front,{protectiveScreen:true}),...practiceChosenDrills.map((drill,index)=>window.HotBPracticeEquipment.station(`Drill Station ${index+1}`,drill))];
 return `<div class="page-match-head page-head-centered no-print"><button class="page-head-nav" id="backToPracticeDrills">Back</button><h1>Practice Setup</h1><span class="page-head-spacer"></span></div><main class="practice-feature-page practice-equipment-setup no-print"><section class="practice-feature-lead"><span>COACH CHECKLIST</span><h2>Set Up Every Station</h2><p>Use the drill details below to prepare equipment and space before opening the completed practice plan.</p></section><section class="practice-equipment-list">${stations.map(station=>`<article class="practice-equipment-card"><header><span>${esc(station.label)}</span><h3>${esc(station.drill?.name||'Standard')}</h3></header><div><b>Required Equipment</b><ul>${station.equipment.map(item=>`<li>${esc(item)}</li>`).join('')||'<li>No equipment required</li>'}</ul></div><p><b>Hitting Method</b><span>${esc(station.hittingMethod)}</span></p><p><b>Space Setup</b><span>${esc(station.spaceSetup)}</span></p></article>`).join('')}</section><button class="btn black block practice-setup-complete" id="completePracticeSetup">Setup Complete</button></main>`;
}
function practicePage(){
 if(!practicePlan&&practiceSection==='hub')return practiceHub();
 if(!practicePlan&&practiceSection==='library')return practiceLibrary();
 if(!practicePlan&&practiceSection==='player')return practicePlayerFocus();
 if(!practicePlan)return practiceSetup();
 if(practiceDrillPickerOpen)return practiceDrillPicker();
 if(practiceEquipmentSetupOpen)return practiceEquipmentSetup();
 const chosenComplete=practiceChosenDrills.length===practicePlan.drillStations,resourceWarnings=practiceDrillResourceWarnings(practiceChosenDrills),portalsActive=!!db.activePortalPractice?.active,currentPortalsActive=portalsActive&&db.activePortalPractice.id===practicePlan.portalDraftId;
 return `<div class="page-match-head page-head-centered no-print"><button class="page-head-nav" data-go="home">Home</button><h1>Hitting Practice</h1><span class="page-head-spacer"></span></div>
 <div class="practice-results">
  <section class="practice-summary no-print"><div><b>${practicePlan.players.filter(player=>(player.availableFromBlock??0)<(player.availableUntilBlock??(practicePlan.times?.length||10))).length}</b><span>Player</span></div><div><b>${practicePlan.times?.length||10}</b><span>${Math.max(1,practicePlan.blockMinutes-1)}M + 1M</span></div><div><b>${practicePlan.drillStations}</b><span>Drills</span></div></section>
  <section class="practice-live-control no-print"><div class="practice-clock-actions">${practiceClock.finished?'':practiceClock.running?`<button class="btn red" type="button" disabled aria-disabled="true">Running</button>`:`<button class="btn red" id="startPracticeClock">Start</button>`}${practiceClock.running||practiceClock.finished?'':`<button class="btn" id="editPracticePlayers">Edit</button>`}<button class="btn black" id="endPracticeClock">DONE!</button></div><div class="practice-live-clock" id="practiceLiveClock" ${practiceClock.running||practiceClock.finished?'':'hidden'}><div><span>Block</span><b id="practiceCurrentBlock">${practiceClock.finished?'DONE!':`1 of ${practicePlan.times?.length||10}`}</b></div><div><span>Time Left</span><b id="practiceTimeLeft">${practiceClock.finished?'0:00':`${Math.max(1,practicePlan.blockMinutes-1)}:00`}</b></div></div></section>
  <section class="practice-delivery-focus no-print"><div><span>BUILT-IN HITTING</span><h2>Machine + Front Toss Focus</h2><p>Choose Standard or a library drill. This changes the existing rotation—it does not add another block.</p></div><div class="practice-delivery-focus-fields">${practiceFocusSelector('Machine',practiceClock.running||practiceClock.finished||currentPortalsActive)}${practiceFocusSelector('Front Toss',practiceClock.running||practiceClock.finished||currentPortalsActive)}</div></section>
  <section class="practice-selected-drills no-print"><div><span>DRILL STATIONS</span><h2>${chosenComplete?'Practice Drills Selected':`Choose ${practicePlan.drillStations} Practice Drills`}</h2>${chosenComplete?`<ol>${practiceChosenDrills.map((drill,index)=>`<li><b>${index+1}</b><span>Drill Station ${index+1} — ${esc(drill.name)}</span></li>`).join('')}</ol>`:'<p>Select the actual drills before printing the coach schedule or player cards.</p>'}</div>${practiceClock.running||practiceClock.finished||currentPortalsActive?'':`<button class="btn ${chosenComplete?'':'red'}" id="choosePracticeDrills">${chosenComplete?'Change Drills':'Choose Drills'}</button>`}</section>
  <section class="practice-portal-publish no-print"><div><span>PLAYER + COACH PORTALS</span><h2>${currentPortalsActive?'Practice Is Active':portalsActive?'Previous Practice Still Active':'Activate This Practice'}</h2><p>${currentPortalsActive?'Attending players and the configured coach can view their plans now.':portalsActive?'End or deactivate the previous practice before publishing this schedule.':'Publish each attending player’s rotation and the coach’s duty plan after reviewing the schedule.'}</p></div><button class="btn ${currentPortalsActive?'':'black'}" id="${currentPortalsActive?'deactivatePlayerPlans':'activatePlayerPlans'}" ${currentPortalsActive||chosenComplete&&!portalsActive?'':'disabled'}>${currentPortalsActive?'Deactivate':portalsActive?'Finish Active Practice First':'Activate Player Plans'}</button></section>
  ${currentPortalsActive&&(practiceGuestPlayers().length||practiceGuestCoaches().length||db.roster.some(player=>player.isTeamJenkins&&practicePlan.schedule[player.name]))?`<section class="practice-guest-links no-print"><span>PRACTICE-ONLY LINKS</span><h2>Share Practice Access</h2>${db.roster.filter(player=>player.isTeamJenkins&&practicePlan.schedule[player.name]&&player.portalId).map(player=>`<article><div><b>${esc(player.name)}</b><small>Team Jenkins · practice plan + assigned drills only</small></div><span><button class="btn" data-text-practice-jenkins="${esc(player.name)}" ${player.phone?'':'disabled'}>${player.phone?'Text':'No Cell'}</button><button class="btn" data-share-practice-jenkins="${esc(player.name)}">Share</button></span></article>`).join('')}${practiceGuestPlayers().filter(guest=>practicePlan.schedule[guest.name]).map(guest=>`<article><div><b>${esc(guest.name)}</b><small>Guest Player · expires when practice ends</small></div><button class="btn" data-share-practice-guest="${esc(guest.guestId)}">Share</button></article>`).join('')}${practiceGuestCoaches().map(guest=>`<article><div><b>${esc(guest.name)}</b><small>Guest Coach · view only</small></div><button class="btn" data-share-practice-guest="${esc(guest.guestId)}">Share</button></article>`).join('')}</section>`:''}
  ${resourceWarnings.map(warning=>`<div class="practice-resource-warning no-print"><b>Resource Check</b><p>${esc(warning)}</p></div>`).join('')}
  <div class="practice-actions practice-actions-three no-print"><button class="btn ${practiceCoachOpen?'active':''}" id="togglePracticeCoach" aria-pressed="${practiceCoachOpen}">Coach</button><button class="btn ${practiceCardsOpen?'active':''}" id="togglePracticeCards" aria-pressed="${practiceCardsOpen}">Player</button><button class="btn black" id="printPracticeCards" ${chosenComplete?'':'disabled'}>Print</button></div>
  ${practicePlan.warnings.length?`<div class="practice-warnings no-print"><b>Schedule Check</b>${practicePlan.warnings.map(warning=>`<p>${esc(warning)}</p>`).join('')}</div>`:''}
  ${practiceCoachOpen?practiceCoachView(practicePlan):''}${practicePlayerCards(practicePlan,!practiceCardsOpen)}
 </div>`;
}
function newGameView(){
 const opts=competitionRoster().map(r=>`<option value="${esc(r.name)}">${esc(r.name)} (${r.side})</option>`).join('');
 const teams=[...new Set(db.teams||[])].sort((a,b)=>a.localeCompare(b,undefined,{sensitivity:'base'}));
 const pitchers=[...(db.pitchers||[])].sort((a,b)=>(a.name||'').localeCompare(b.name||'',undefined,{sensitivity:'base'}));
 const rows=Array.from({length:13},(_,i)=>`<div class="batting-row"><div class="batting-num">${i+1}</div>
 <select class="input batting-select" data-idx="${i}"><option value="">Select hitter</option>${opts}</select></div>`).join('');
 return `<div class="page-match-head page-head-centered"><button class="page-head-nav" data-go="home">Home</button><h1>New Game</h1><span class="page-head-spacer" aria-hidden="true"></span></div>
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
 <div class="roster-editor">${db.roster.map((r,i)=>({r,i})).filter(({r})=>!r.isTeamJenkins).map(({r,i})=>`<div class="roster-edit-row">
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
 if(!(g.battingOrder||[]).length)return `<div class="panel"><h2>Game Recovery</h2><p>This saved game no longer has a valid batting order, so live scoring is disabled to protect its existing game data.</p><button class="btn" data-go="home">Home</button></div>`;
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
 return `<div class="topbar chart-head"><div class="brand">Chart</div><button id="openLineup">Lineup</button><button id="openProfile">Profile</button><button id="openReports">Reports</button><button class="end" id="endGame">End</button></div>
 <div class="live-top">
  <button class="statbox hitter-box live-stat-button" id="changeHitter" aria-label="Substitute for ${esc(h.name)}"><div class="cap">HITTER</div><div class="big">${esc(h.name)}</div></button>
  <div class="statbox"><div class="cap">INN</div><div class="big">${g.inning}</div></div>
  <div class="statbox"><div class="cap">COUNT</div><div class="big">${g.balls}-${g.strikes}</div></div>
  <button class="statbox live-stat-button" id="changePitcher" aria-label="Change pitcher"><div class="cap">PITCHER</div><div class="big">#${esc(g.pitcherNumber||'')}</div></button>
 </div>
 <div class="control-row">
  <div class="control-card"><div class="pill-row">${['IN','OUT','CH','NO'].map(x=>`<button class="pill red ${g.strikes<2&&currentPlan===x?'active':''}" data-plan="${x}">${x}</button>`).join('')}</div></div>
  <div class="control-card outs-stepper" role="group" aria-label="${g.outs} outs"><button class="outs-stepper-circle" id="decreaseOuts" aria-label="Subtract one out" ${g.outs===0?'disabled':''}>−</button><output class="outs-stepper-circle outs-count" aria-live="polite" aria-label="${g.outs} outs">${g.outs}</output><button class="outs-stepper-circle" id="increaseOuts" aria-label="Add one out">+</button><button class="outs-force-end" id="forceEndInning" type="button">END INN</button></div>
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
   <button class="fps ${g.firstPitchView?'active':''}" id="fpsBtn" aria-label="First-pitch strike percentage"><strong class="${Math.round((HotBEvaluationStats.firstPitchStrikeRate([g]).rate||0)*100)===100?'fps-compact':'fps-standard'}">${Math.round((HotBEvaluationStats.firstPitchStrikeRate([g]).rate||0)*100)}%</strong></button>
  </div>
  <div class="zone-tools"><button class="ai" id="aiBtn">Ai</button>
   ${g.showAi?`<div class="ai-suggestions">${suggestions.map((s,i)=>`<div class="ai-box"><span class="ai-rank">#${i+1}</span><span class="ai-pitch">${esc(s.label)}</span><span class="ai-pct">${s.pct===null?'':`${s.pct}%`}</span></div>`).join('')}</div>`:''}
  </div>
 </div>
 <div class="tabs ${showAll?'with-all':'without-all'}"><button class="tab fixed-tab ${(g.historyTab||'LIVE')==='LIVE'?'active':''}" data-tab="LIVE">LIVE</button><div class="ab-scroll">${abTabNames.map(t=>`<button class="tab ${(g.historyTab||'LIVE')===t?'active':''}" data-tab="${t}">${t}</button>`).join('')}${showAll?`<button class="tab ${(g.historyTab||'LIVE')==='ALL'?'active':''}" data-tab="ALL">${g.historyTab==='ALL'&&(g.allView||'DOTS')==='DOTS'?'%':'ALL'}</button>`:''}</div></div>
 <div class="results">
  <button class="result hbp" data-result="HBP" ${statsMode?'disabled':''}>HBP</button><button class="result ball ${percentMode&&filter==='B'?'filter-active':''}" data-result="B">B</button><button class="result foul ${percentMode&&filter==='F'?'filter-active':''}" data-result="F">F</button><button class="result hit ${percentMode&&filter==='HIT'?'filter-active':''}" data-result="HIT">HIT</button>
  <button class="result undo" id="undo">Undo</button><button class="result strike ${percentMode&&filter==='K'?'filter-active':''}" data-result="K">KS</button><button class="result strike ${percentMode&&filter==='K'?'filter-active':''}" data-result="KL">KL</button><button class="result out ${percentMode&&filter==='H4O'?'filter-active':''}" data-result="H4O">H4O</button>
 </div></div><div class="history-column"><div class="history-panel">${historyHtml(g,g.previewNext?chartName:h.name)}</div><button type="button" class="coach-observation-button" id="coachObservation" aria-label="Coach Observation" onclick="window.HotBOpenCoachObservation&&window.HotBOpenCoachObservation()"><svg viewBox="0 0 64 44" aria-hidden="true"><circle cx="13" cy="31" r="10"/><circle cx="51" cy="31" r="10"/><path d="M23 31h18M9 21l7-14h9l5 18M55 21 48 7h-9l-5 18"/></svg><span>OBS</span>${(g.observations||[]).length?`<b>${g.observations.length}</b>`:''}</button></div></div>`;
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
function reportBaseGames(){
 if(reportMode==='current')return currentGame()?[currentGame()]:[];
 if(reportMode==='game')return db.savedGames.filter(game=>game.id===reportGameId);
 if(reportMode==='selection')return db.savedGames.filter(game=>reportSelectedGameIds.includes(game.id));
 if(reportMode==='group'){
  const group=db.gameGroups.find(item=>item.id===reportGroupId);
  return db.savedGames.filter(game=>(group?.gameIds||[]).includes(game.id));
 }
 return db.savedGames;
}
function reportGames(){
 const games=reportBaseGames();
 const dated=reportMode==='current'?games:games.filter(gameMatchesDateFilter);
 return reportOpponent==='All Opponents'?dated:dated.filter(game=>game.opponent===reportOpponent);
}
function reportContext(games){
 if(reportMode==='current')return 'Current Game';
 if(reportMode==='game')return games[0]?`${new Date(games[0].date).toLocaleDateString()} · ${esc(games[0].opponent||'Opponent')}`:'Saved Game';
 if(reportMode==='group')return esc(db.gameGroups.find(item=>item.id===reportGroupId)?.name||'Game Group');
 if(reportMode==='selection')return `${games.length} Selected Game${games.length===1?'':'s'}`;
 return 'All Games';
}
function reportGamesButton(games){
 const single=games.length===1&&(reportMode==='game'||reportMode==='selection');
 const label=single?`${new Date(games[0].date).toLocaleDateString()} · ${esc(games[0].opponent||'Opponent')}`:reportContext(games);
 return `<button type="button" class="report-context-title" id="showReportGames"><span>Games:</span> ${label}<b aria-hidden="true">›</b></button>`;
}
function reportGamesListModal(){
 const games=reportGames();
 return `<div class="modal-backdrop"><div class="modal report-games-modal"><div class="modal-header"><h2>Included Games</h2><button class="btn" data-close>Close</button></div><div class="included-games-list">${games.length?games.map(game=>`<div><b>${esc(game.opponent||'Opponent')}</b><span>${new Date(game.date).toLocaleDateString()}</span></div>`).join(''):'<p>No games match the current filters.</p>'}</div></div></div>`;
}
function reportModal(){
 const games=reportGames(),competitionNames=new Set(competitionRoster().map(player=>player.name)),source=games.flatMap(game=>game.plateAppearances||[]).filter(pa=>competitionNames.has(pa.hitter));
 const filtered=reportFilterHitter==='All Hitters'?source:source.filter(pa=>pa.hitter===reportFilterHitter);
 const s=HotBEvaluationStats.statsForPAs(filtered),opponents=[...new Set(reportBaseGames().map(game=>game.opponent).filter(Boolean))].sort();
 return `<div class="modal-backdrop"><div class="modal">
 <div class="report-tabs"><button class="btn ${reportMode==='current'?'black':''}" data-rmode="current">Current</button><button class="btn ${reportMode==='saved'?'black':''}" data-rmode="saved">All Games</button><button class="btn gold" id="exportReport">Export</button><button class="btn" data-close>Close</button></div>
 <div class="panel report-detail" style="margin:14px 0 0">
 ${reportMode!=='current'?dateFilterControls('report'):''}
 <div class="report-filter-grid"><label>Player<select class="input" id="reportHitter"><option>All Hitters</option>${competitionRoster().map(r=>`<option ${reportFilterHitter===r.name?'selected':''}>${esc(r.name)}</option>`).join('')}</select></label><label>Opponent<select class="input" id="reportOpponent"><option>All Opponents</option>${opponents.map(name=>`<option ${reportOpponent===name?'selected':''}>${esc(name)}</option>`).join('')}</select></label></div>
 ${reportGamesButton(games)}
 <div class="report-stat-grid">${[['PA',s.PA],['AVG',round3(s.AVG)],['OBP',round3(s.OBP)],['SLG',round3(s.SLG)],['OPS',round3(s.OPS)],['RBI',s.RBI],['HHB',s.HHB],['WEAK',s.WEAK]].map(([k,v])=>`<div class="report-stat"><b>${v}</b><span>${k}</span></div>`).join('')}</div>
 <h3 class="count-performance-title"><b>COUNT PERFORMANCE</b><span class="count-key hit">H</span><span class="count-separator">|</span><span class="count-key out">H4O</span><span class="count-separator">|</span><span class="count-key strikeout">K</span><span class="count-separator">|</span><span class="count-key average">AVE</span></h3>
 <div class="count-grid">${['0-0','0-2','1-2','2-2','3-2','6+'].map(c=>countCard(filtered,c)).join('')}</div>
 ${outcomeReport(filtered)}${zoneReport()}
 </div></div></div>`;
}
function countCard(pas,bucket){
 const stats=HotBEvaluationStats.countPerformance(pas,bucket),h=stats.H,o=stats.H4O,k=stats.K,ave=stats.AVG;
 return `<div class="count-card"><b>${bucket}</b><span class="count-value hit ${h===0?'zero':''}">${h}</span><span class="count-separator">|</span><span class="count-value out ${o===0?'zero':''}">${o}</span><span class="count-separator">|</span><span class="count-value strikeout ${k===0?'zero':''}">${k}</span><span class="count-separator">|</span><span class="count-value average ${ave===0?'zero':''}">${round3(ave)}</span></div>`;
}
function reportPitchSource(){const names=new Set(competitionRoster().map(player=>player.name));return reportGames().flatMap(game=>game.pitches||[]).filter(pitch=>names.has(pitch.hitter))}
function reportPitchForPA(pa){
 const game=reportGames().find(item=>(item.plateAppearances||[]).includes(pa));
 const paKey=HotBEvaluationStats.plateAppearanceKey(pa),pitches=(game?.pitches||[]).filter(p=>HotBEvaluationStats.plateAppearanceKey(p)===paKey);
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
function reportSection(title,items,kind){return `<section class="report-outcome-section"><div class="report-outcome-heading"><b>${title}</b><span>(${items.length}) (COUNT) (TOTAL PITCHES)</span></div><div class="report-outcome-list">${items.length?items.map(pa=>reportOutcomeItem(pa,kind)).join(''):'<span class="report-empty">None</span>'}</div></section>`}
function outcomeReport(pas){
 const strikeouts=pas.filter(p=>p.outcome==='K'),hits=pas.filter(p=>p.outcome==='HIT'),outs=pas.filter(p=>p.outcome==='H4O'),items=[...hits,...outs];
 return `${reportSection('STRIKEOUTS',strikeouts,'K')}${reportSection('BASE HITS',hits,'HIT')}<div class="report-spray-box"><div class="field report-spray-field">${items.map(p=>{const coords={1:[50,66],2:[50,85],3:[66,59],4:[62,47],5:[34,59],6:[38,47],7:[22,34],8:[50,25],9:[78,34]}[p.fielder]||[50,65];return `<button class="report-spray-dot ${p.outcome==='HIT'?'hit':'h4o'} ${reportSelectedPaId===p.id?'selected':''}" style="left:${coords[0]}%;top:${coords[1]}%" data-report-pa="${p.id}" aria-label="Select ${p.outcome} by ${esc(p.hitter)}"></button>`}).join('')}</div></div>${reportSection('HITS 4 OUTS',outs,'H4O')}`;
}
function zoneReport(){
 const pitches=reportPitchSource().filter(p=>(reportFilterHitter==='All Hitters'||p.hitter===reportFilterHitter)&&HotBEvaluationStats.pitchMatchesHeatResult(p,reportHeatResult));
 const z=Object.fromEntries(chartZoneIds.map(zone=>[zone,0]));let located=0;
 pitches.forEach(p=>{const zone=displayedChartZone(p.zone);if(z[zone]!=null){z[zone]++;located++}});
 const filters=`<div class="heat-result-filters">${['ALL','BALL','FOUL','KS','KL','HIT','H4O','GB','LD','FB'].map(result=>`<button class="${reportHeatResult===result?'active':''}" data-heat-result="${result}">${result}</button>`).join('')}</div>`;
 if(!located)return `<section class="report-heat"><h3>PITCH LOCATION HEAT CHART</h3>${filters}<p class="report-heat-empty">No pitch-location data for this selection.</p></section>`;
 const heat=heatStyles(z,heatColors[reportHeatResult]||heatColors.REPORT),value=zone=>reportHeatDisplay==='COUNT'?z[zone]:`${Math.round(z[zone]/located*100)}%`;
 const cell=(zone,core='')=>`<div class="zone ${core} zone-${zone.toLowerCase()} heat-zone" style="${heat[zone]}"><span class="pct">${value(zone)}</span></div>`;
 const summaryLabel=reportHeatResult==='ALL'?'ALL':reportHeatResult;
 return `<section class="report-heat"><h3>PITCH LOCATION HEAT CHART</h3>${filters}<div class="report-heat-toggle segmented" aria-label="Heat chart value"><button class="${reportHeatDisplay==='COUNT'?'active':''}" data-heat-display="COUNT">COUNT</button><button class="${reportHeatDisplay==='%'?'active':''}" data-heat-display="%">%</button></div><div class="zone-layout report-zone-layout">${['T1','T2','L1','L2'].map(z=>cell(z)).join('')}<div class="core-grid">${['C1','C2','C3','C4'].map(z=>cell(z,'core')).join('')}</div>${['R1','R2','B1','B2'].map(z=>cell(z)).join('')}</div><p class="report-heat-summary"><b>${summaryLabel}</b> — ${located}${reportHeatDisplay==='%'?' total':''} pitch${located===1?'':'es'}</p><div class="heat-key"><span><b>KS</b> Strike Swinging</span><span><b>KL</b> Strike Looking</span><span><b>H4O</b> Hard Hit Ball for an Out</span></div></section>`;
}

function gameChoiceList(selectedIds){return db.savedGames.map(game=>`<label class="game-choice"><input type="checkbox" value="${game.id}" ${selectedIds.includes(game.id)?'checked':''}><span><b>${new Date(game.date).toLocaleDateString()} · ${esc(game.opponent||'Opponent')}</b><small>${(game.plateAppearances||[]).length} PA</small></span></label>`).join('')}
function gameGroupCard(group){
 const existing=(group.gameIds||[]).filter(id=>db.savedGames.some(game=>game.id===id));
 return `<article class="game-group-card"><div><b>${esc(group.name)}</b><span>${existing.length} game${existing.length===1?'':'s'}</span></div><div class="saved-game-actions"><button class="btn black" data-open-group="${group.id}">Report</button><button class="btn" data-edit-group="${group.id}">Edit</button><button class="btn" data-rename-group="${group.id}">Rename</button><button class="btn red" data-delete-group="${group.id}">Delete Group</button></div></article>`;
}
function reportsPage(){
 const games=filteredGames(false);
 return `<div class="page-match-head page-head-centered"><button class="page-head-nav" data-go="home">Home</button><h1>Reports</h1><span class="page-head-spacer"></span></div><div class="panel reports-builder"><h2>Build a Report</h2><button class="games-selector" id="openGamesSelector"><span>GAMES</span><b>Choose games or a saved group</b><i aria-hidden="true">›</i></button><div class="roster-data-tools backup-tools"><button class="btn black" id="exportFullBackup">Export Full Backup</button><button class="btn" id="restoreFullBackup">Restore Backup</button><input id="fullBackupFile" type="file" accept=".json,application/json" hidden><p>A full backup preserves games, pitches, game groups, roster information, measurements, pitchers and app preferences.</p></div>${dateFilterControls('saved')}<div class="saved-game-list">${games.length?games.map(g=>{const meta=seasonMeta(g.date);return `<div class="saved-game-card"><div><b>${new Date(g.date).toLocaleDateString()} · ${esc(g.opponent||'Opponent')}</b><span>${esc(meta.season)} · ${esc(meta.segment)} · ${(g.plateAppearances||[]).length} PA</span></div><div class="saved-game-actions"><button class="btn black" data-view-game="${g.id}">View</button><button class="btn red" data-delete-game="${g.id}">Delete</button></div></div>`}).join(''):'No saved games match this date range.'}</div></div>`;
}
function gamesSelectionModal(){
 return `<div class="modal-backdrop"><div class="modal games-selection-modal"><div class="modal-header"><div><div class="small info-kicker">REPORT FILTER</div><h2>Games</h2></div><button class="btn" data-close>Close</button></div><button class="games-all-option" id="selectAllGames"><b>ALL GAMES</b><span>Use every saved game</span></button><h3>INDIVIDUAL GAMES</h3><div class="game-select-list" id="reportGameChoices">${gameChoiceList(reportSelectedGameIds)||'<p>No saved games yet.</p>'}</div><h3>SAVED GROUPS</h3><div class="game-group-list">${db.gameGroups.length?db.gameGroups.map(gameGroupCard).join(''):'<p class="report-empty">No saved groups yet.</p>'}</div><div class="game-selection-footer"><button class="btn" id="newGameGroup">Create Group</button><button class="btn gold" id="saveSelectionGroup" hidden>Save as Group</button><button class="btn black" id="openSelectedReports" disabled>View Report</button></div></div></div>`;
}

function gameGroupModal(group=null){
 const selected=(group?.gameIds||reportSelectedGameIds).filter(id=>db.savedGames.some(game=>game.id===id));
 return `<div class="modal-backdrop"><div class="modal game-group-modal"><div class="modal-header"><h2>${group?'Edit':'Create'} Game Group</h2><button class="btn" data-close>Cancel</button></div><label>Group name<input class="input" id="gameGroupName" value="${esc(group?.name||'')}" placeholder="St. Louis Showcase"></label><div class="game-select-list" id="groupGameChoices">${gameChoiceList(selected)||'<p>No saved games are available.</p>'}</div><div class="game-group-footer"><button class="btn" data-close>Cancel</button><button class="btn black" id="saveGameGroup" data-group-id="${group?.id||''}">Save Group</button></div></div></div>`;
}
function practiceOnlyJenkinsRecord(player){
 const allowed=['name','phone','positions','side','isGuest','isTeamJenkins','teamName','isPracticeGuest','portalId','portalSecret'];
 return Object.fromEntries(allowed.filter(key=>player?.[key]!==undefined).map(key=>[key,player[key]]));
}
function sanitizeJenkinsData(sourceDb){
 const cleanDb=structuredClone(sourceDb),jenkinsNames=new Set((cleanDb.roster||[]).filter(player=>player.isTeamJenkins||player.teamName==='Team Jenkins').map(player=>player.name));
 if(jenkinsNames.size){
  cleanDb.roster=(cleanDb.roster||[]).map(player=>jenkinsNames.has(player.name)?practiceOnlyJenkinsRecord(player):player);
  cleanDb.measurements=(cleanDb.measurements||[]).filter(item=>!jenkinsNames.has(item.player));
  cleanDb.coachObservations=(cleanDb.coachObservations||[]).filter(item=>!jenkinsNames.has(item.playerName));
  const sanitizeGame=game=>{if(!game)return;const previousOrder=game.battingOrder||[],previousIdx=Math.max(0,Number(game.currentIdx)||0),previousHitter=previousOrder[previousIdx]||'';game.battingOrder=previousOrder.filter(name=>!jenkinsNames.has(name));game.hittersUsed=(game.hittersUsed||[]).filter(name=>!jenkinsNames.has(name));game.pitches=(game.pitches||[]).filter(item=>!jenkinsNames.has(item.hitter));game.plateAppearances=(game.plateAppearances||[]).filter(item=>!jenkinsNames.has(item.hitter));game.observations=(game.observations||[]).filter(item=>!jenkinsNames.has(item.playerName));game.hitterSubstitutions=(game.hitterSubstitutions||[]).filter(item=>!jenkinsNames.has(item.out)&&!jenkinsNames.has(item.in));if(game.battingOrder.length){const preservedIdx=game.battingOrder.indexOf(previousHitter);game.currentIdx=preservedIdx>=0?preservedIdx:Math.min(previousIdx,game.battingOrder.length-1)}else game.currentIdx=0;if(jenkinsNames.has(previousHitter))game.plan=null};
  (cleanDb.savedGames||[]).forEach(sanitizeGame);
  sanitizeGame(cleanDb.currentGame);
  if(cleanDb.currentGame&&!(cleanDb.currentGame.battingOrder||[]).length&&!(cleanDb.currentGame.pitches||[]).length&&!(cleanDb.currentGame.plateAppearances||[]).length)cleanDb.currentGame=null;
  (cleanDb.practiceHistory||[]).forEach(record=>{if(Array.isArray(record.attendees))record.attendees=record.attendees.filter(name=>!jenkinsNames.has(name));if(Array.isArray(record.rosterPlayers))record.rosterPlayers=record.rosterPlayers.filter(name=>!jenkinsNames.has(name));if(Array.isArray(record.excludedAttendancePlayers))record.excludedAttendancePlayers=record.excludedAttendancePlayers.filter(name=>!jenkinsNames.has(name))});
  Object.keys(cleanDb.planPreferences||{}).forEach(name=>{if(jenkinsNames.has(name))delete cleanDb.planPreferences[name]});
  Object.keys(cleanDb.playerFocusDrillOverrides||{}).forEach(key=>{if([...jenkinsNames].some(name=>key.startsWith(name+'::')))delete cleanDb.playerFocusDrillOverrides[key]});
 }
 cleanDb.teamJenkinsDataCleanupVersion=5;
 return cleanDb;
}
function sanitizedBackupDb(){
 const clean=sanitizeJenkinsData(structuredClone(db));
 // Portal identity and live-practice ownership are device/cloud-runtime state.
 // A historical backup must never roll portal links, PINs or the active portal
 // practice reference back to an older generation during Restore.
 delete clean.activePortalPractice;
 delete clean.activePracticeSession;
 if(clean.coachPortal){delete clean.coachPortal.portalId;delete clean.coachPortal.portalPin;delete clean.coachPortal.portalPinHash}
 (clean.roster||[]).forEach(player=>{delete player.portalId;delete player.portalPin;delete player.portalPinHash;delete player.portalSecret});
 return clean;
}
function exportFullBackup(){
 const payload={format:'HotB Full Backup',version:1,exportedAt:new Date().toISOString(),db:sanitizedBackupDb()};
 const a=document.createElement('a');
 a.href=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));
 a.download=`HotB_Full_Backup_${new Date().toISOString().slice(0,10)}.json`;
 a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
function stripRestoredPortalState(restored){
 const clean=sanitizeJenkinsData(structuredClone(restored));
 delete clean.activePortalPractice;delete clean.activePracticeSession;
 if(clean.coachPortal){delete clean.coachPortal.portalId;delete clean.coachPortal.portalPin;delete clean.coachPortal.portalPinHash}
 (clean.roster||[]).forEach(player=>{delete player.portalId;delete player.portalPin;delete player.portalPinHash;delete player.portalSecret});
 return clean;
}
async function restoreFullBackup(file){
 const payload=JSON.parse(await file.text());
 if(payload?.format!=='HotB Full Backup'||!payload.db||!Array.isArray(payload.db.roster)||!Array.isArray(payload.db.savedGames))throw new Error('This is not a valid HotB full backup file.');
 if(!confirm('Restore this backup? It will replace all HotB information currently saved on this device.'))return;
 db=stripRestoredPortalState(payload.db);db.route='home';
 persistDbLocal();
 if(localStorage.getItem(CLOUD_ENABLED_KEY)==='true')localStorage.setItem(CLOUD_PENDING_KEY,'true');
 alert('HotB backup restored successfully.');
 location.reload();
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
 const practiceAttendanceResult=player?practiceAttendance(player):null,practiceRate=practiceAttendanceResult?.percentage??null,practiceRateLabel=practiceAttendanceResult&&!practiceAttendanceResult.eligible?'N/A':practiceRate===null?'':`${practiceRate}%`;
 const evalGames=filteredGames(),competitionNames=new Set(competitionRoster().map(item=>item.name)),teamPas=evalGames.flatMap(game=>game.plateAppearances||[]).filter(pa=>competitionNames.has(pa.hitter));
 const pas=teamPas.filter(p=>!player||p.hitter===player.name);
 const evalDb={savedGames:evalGames,currentGame:null,roster:db.roster};
 const snapshot=player?HotBEvaluationStats.evaluationSnapshot(evalDb,player.name):null;
 const teamStats=HotBEvaluationStats.statsForPAs(teamPas),metrics=player?HotBEvaluationStats.hotBMetrics(snapshot.pas,teamPas):null,s=player?snapshot.stats:teamStats;
 const playerTotals=competitionRoster().map(r=>HotBEvaluationStats.statsForPAs(teamPas.filter(p=>p.hitter===r.name))).filter(x=>x.PA>0);
 const avgPlayerRp=playerTotals.length?playerTotals.reduce((sum,x)=>sum+x.rp,0)/playerTotals.length:0;
 const hotb=metrics?.hotB??null;
 const signed=(n,digits=1)=>`${n>0?'+':''}${n.toFixed(digits)}`;
 const deltaClass=n=>n>0?'positive':n<0?'negative':'neutral';
 const comparison=(value,delta,digits=1)=>`<div class="value compare-value"><span>${value}</span><span class="metric-pipe">|</span><span class="metric-delta ${deltaClass(delta)}">${signed(delta,digits)}</span></div>`;
 const emptyComparison=()=>`<div class="value compare-value empty-value"><span>—</span><span class="metric-pipe">|</span><span>—</span></div>`;
 const execution=player?snapshot.execution.rate:null;
 const slapHitter=HotBEvaluationStats.isSlapHitter(player);
 const reach=s.PA?s.reachPct:null;
 const ms=measurementTypes(player);
 const metricHead=(metric,label=metric)=>`<div class="eval-tile-head"><button class="metric-title" data-guide="${metric}">${label}</button><button class="metric-all" data-ranking="${metric}">ALL</button></div>`;
 const resultMetric=player?snapshot.resultMetric:HotBEvaluationStats.evaluationResultRate(null,s),resultRate=[resultMetric.label,s.PA?pct1(resultMetric.value):'—',resultMetric.key];
 const performanceTile=([label,value,key])=>{
  const statKey=key==='contact'?'contactPct':key==='K'?'kPct':key,guide=['AVG','OBP','SLG','CONTACT','K%'].includes(label);
  const rating=s.PA>=25&&!['hhbPct','qabPct'].includes(statKey)?grade(s[statKey],key):'';
  return `<div class="perf ${rating}"><b>${value}</b><div class="perf-label-row">${guide?`<button class="perf-metric" data-guide="${label}">${label}</button>`:`<span class="perf-metric">${label}</span>`}<button class="perf-all" data-hitting-ranking="${statKey}">ALL</button></div></div>`;
 };
 return `<div class="eval-head"><button class="btn eval-nav" ${evaluationReadOnly?'id="portalBack"':`data-go="${currentGame()?'live':'home'}"`}>${evaluationReadOnly?'Portal':currentGame()?'Return':'Home'}</button><div class="eval-title"><h1>Evaluation</h1></div><div class="eval-contact-actions" aria-hidden="true"></div></div>
 <label class="eval-player-filter"><span>Player</span><select class="player-select" id="evalSelect"><option>Team</option>${competitionRoster().map(r=>`<option ${evalPlayer===r.name?'selected':''}>${esc(r.name)}</option>`).join('')}</select></label>
 ${dateFilterControls('eval')}
 ${player?`<div class="player-card player-profile ${practiceRateLabel?'has-practice-rate':''}"><div class="grad-year">${esc(player.grad)}</div><div class="player-photo">${player.photo?`<img src="${encodeURI(player.photo)}" alt="${esc(player.name)}">`:esc(player.name.split(' ').map(x=>x[0]).join(''))}</div><div class="player-info"><div class="name">${esc(player.name)}</div><div class="meta"><span>#${esc(player.jersey)}</span> | ${esc(player.positions)} | GPA ${esc(player.gpa)}</div><div class="interest">${esc(player.interest)} <span>| ${esc(player.school)}</span></div></div>${practiceRateLabel?`<div class="player-practice-rate">${practiceRateLabel}</div>`:''}</div>`:
 `<div class="player-card team-profile"><div class="player-photo team-photo"><img src="Rebels%20REG%20White%20with%20red%20wing%20-%20REGIONAL.png" alt="KC Rebels"></div><div class="player-info"><div class="name">KC Rebels</div><div class="meta">${pas.length} saved plate appearances</div></div></div>`}
 <div class="eval-tiles">
  <div class="eval-tile dark">${metricHead('HotB+')} ${hotb===null?emptyComparison():(player?comparison(hotb,hotb-100,0):`<div class="value">${hotb}</div>`)}<div class="note">Production vs Team</div></div>
  <div class="eval-tile">${metricHead('Runs Produced','RP')} ${s.PA?(player?comparison(s.rp.toFixed(1),s.rp-avgPlayerRp,1):`<div class="value">${s.rp.toFixed(1)}</div>`):emptyComparison()}<div class="note">Runs Produced</div></div>
  <div class="eval-tile">${slapHitter?metricHead('Reach%'):metricHead('Execution','HP%')}<div class="value">${slapHitter?(reach===null?'—%':pct0(reach)):(execution===null?'—%':pct0(execution))}</div><div class="note">${slapHitter?'Reached Base':'Hitting Plan'}</div></div>
 </div>
 <div class="performance"><div class="performance-head"><h2>Hitting Results</h2><div class="performance-sample"><span>${esc(activeDateFilterLabel())}</span><b>${s.PA} PA</b></div></div><div class="perf-grid">
 ${[['AVG',round3(s.AVG),'AVG'],['OBP',round3(s.OBP),'OBP'],['SLG',round3(s.SLG),'SLG'],['CONTACT',pct0(s.contactPct),'contact'],['K%',pct1(s.kPct),'K'],resultRate].map(performanceTile).join('')}
 </div></div>
 ${player&&isPitcherProfile(player)?`<section class="pitcher-performance"><div class="pitcher-performance-head"><h2>Pitching Results <span class="small">GAMECHANGER</span></h2>${evaluationReadOnly?'':`<button class="btn black" id="uploadPitchingStats">UPLOAD</button><input id="pitchingStatsFile" type="file" accept=".xlsx,.xls,.csv" hidden>`}</div><div class="pitcher-stat-grid">
  ${[['IP','pitcherIP'],['ERA','pitcherERA'],['WHIP','pitcherWHIP'],['K/BB','pitcherKBB'],['OBA','pitcherOBA'],['STRIKE %','pitcherStrikePct']].map(([label,key])=>`<button class="pitcher-stat" data-pitch-ranking="${key}"><b>${esc(player[key]||'—')}</b><span>${label}</span></button>`).join('')}
 </div></section>`:''}
 <div class="athletic"><div class="athletic-head"><h2>Athletic Bests</h2>${player&&!evaluationReadOnly?'<button class="btn black" id="recordMeasure2">+ Record</button>':''}</div>
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
 if(evaluationReadOnly)return `<div class="measure"><h3>${type}</h3><div class="best">${best===null?'—':formatMeasurementValue(type,best)}</div><div class="note">${vals.length?`${vals.length} attempt${vals.length===1?'':'s'} recorded`:'No result recorded'}</div></div>`;
 return `<button class="measure" data-measure="${esc(type)}"><h3>${type}</h3><div class="best">${best===null?'—':formatMeasurementValue(type,best)}</div><div class="note">${vals.length?`${vals.length} attempt${vals.length===1?'':'s'} recorded`:'Tap to record'}</div></button>`;
}
function evalGuide(title){
 if(title==='Reach%')return `<div class="modal-backdrop"><div class="modal dark"><div class="modal-header"><div><div class="small" style="color:#ddd;letter-spacing:2px">PLAYER EVALUATION GUIDE</div><h2>Reach Percentage</h2></div><button class="btn" data-close>Close</button></div><hr style="border-color:#555"><p style="font-size:22px;line-height:1.45;font-weight:400">Reach% is the percentage of plate appearances in which the hitter reaches base by a hit, walk, hit-by-pitch, error, or fielder’s choice. It gives slap hitters credit for using speed and pressure to reach safely, including outcomes that official OBP does not count.</p><p class="small" style="color:#ddd">Reach% is not color-graded.</p></div></div>`;
 if(title==='HHB%'||title==='QAB%'){
  const isHHB=title==='HHB%';
  const description=isHHB?'Hard-Hit Ball Percentage is balls marked HHB divided by all tracked balls put in play.':'Quality At-Bat Percentage is quality at-bats divided by total plate appearances. A plate appearance counts once when it includes a hit, walk, hit-by-pitch, successful sacrifice, RBI, RBA, HHB, or eight or more pitches.';
  return `<div class="modal-backdrop"><div class="modal dark"><div class="modal-header"><div><div class="small" style="color:#ddd;letter-spacing:2px">PLAYER EVALUATION GUIDE</div><h2>${isHHB?'Hard-Hit Ball Percentage':'Quality At-Bat Percentage'}</h2></div><button class="btn" data-close>Close</button></div><hr style="border-color:#555"><p style="font-size:22px;line-height:1.45;font-weight:400">${description}</p><p class="small" style="color:#ddd">No color-grading ranges have been assigned to this metric.</p></div></div>`;
 }
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
 const competitionNames=new Set(competitionRoster().map(item=>item.name)),teamPas=filteredPAs().filter(pa=>competitionNames.has(pa.hitter));
 const rankingDb={savedGames:filteredGames(),currentGame:null,roster:competitionRoster()};
 const rows=competitionRoster().map(player=>{
  const snapshot=HotBEvaluationStats.evaluationSnapshot(rankingDb,player.name),metrics=HotBEvaluationStats.hotBMetrics(snapshot.pas,teamPas),stats=snapshot.stats;
  let value=null;
  if(metric==='HotB+')value=stats.PA?metrics.hotBRaw:null;
  else if(metric==='Runs Produced')value=stats.PA?metrics.runsProduced:null;
  else if(metric==='Execution')value=snapshot.execution.rate;
  else if(metric==='Reach%')value=stats.PA?stats.reachPct:null;
  return {player,value};
 }).sort((a,b)=>{
  if(a.value===null&&b.value===null)return a.player.name.localeCompare(b.player.name);
  if(a.value===null)return 1;if(b.value===null)return-1;
  return b.value-a.value||a.player.name.localeCompare(b.player.name);
 });
 const formatted=value=>value===null?'—':metric==='HotB+'?Math.round(value):['Execution','Reach%'].includes(metric)?pct0(value):value.toFixed(1);
 return `<div class="modal-backdrop"><div class="modal dark ranking-modal"><div class="modal-header"><div><div class="small ranking-kicker">TEAM RANKINGS</div><h2>${esc(metric)}</h2></div><button class="btn" data-close>Close</button></div>
  <div class="ranking-list">${rows.map((row,index)=>`<div class="ranking-row ${row.player.name===evalPlayer?'selected-player':''}"><span class="ranking-place">${index+1}</span><span class="ranking-name">${esc(row.player.name)}</span><strong>${formatted(row.value)}</strong></div>`).join('')}</div>
 </div></div>`;
}
function hittingRankingModal(metric){
 const definitions={
  AVG:{label:'AVG',key:'AVG',format:round3},OBP:{label:'OBP',key:'OBP',format:round3},SLG:{label:'SLG',key:'SLG',format:round3},
  contactPct:{label:'CONTACT',key:'contactPct',format:pct0},kPct:{label:'K%',key:'kPct',format:pct1,lowerIsBetter:true},
  hhbPct:{label:'HHB%',key:'hhbPct',format:pct1},qabPct:{label:'QAB%',key:'qabPct',format:pct1}
 };
 const competitionNames=new Set(competitionRoster().map(item=>item.name)),definition=definitions[metric]||definitions.AVG,teamPas=filteredPAs().filter(pa=>competitionNames.has(pa.hitter));
 const rows=competitionRoster().map(player=>{const stats=HotBEvaluationStats.statsForPAs(teamPas.filter(pa=>pa.hitter===player.name));return {player,stats,value:stats.PA?stats[definition.key]:null}}).sort((a,b)=>{
  if(a.value===null&&b.value===null)return a.player.name.localeCompare(b.player.name);
  if(a.value===null)return 1;if(b.value===null)return-1;
  return (definition.lowerIsBetter?a.value-b.value:b.value-a.value)||a.player.name.localeCompare(b.player.name);
 });
 return `<div class="modal-backdrop"><div class="modal dark ranking-modal"><div class="modal-header"><div><div class="small ranking-kicker">ALL PLAYERS · ${esc(activeDateFilterLabel())}</div><h2>${esc(definition.label)}</h2></div><button class="btn" data-close>Close</button></div>
  <div class="ranking-list">${rows.map((row,index)=>`<div class="ranking-row hitting-ranking-row ${row.player.name===evalPlayer?'selected-player':''}"><span class="ranking-place">${index+1}</span><span class="ranking-name">${esc(row.player.name)}<small>${row.stats.PA} PA</small></span><strong>${row.value===null?'—':definition.format(row.value)}</strong></div>`).join('')}</div>
 </div></div>`;
}
function pitcherRankingModal(key){
 const labels={pitcherIP:'IP',pitcherERA:'ERA',pitcherWHIP:'WHIP',pitcherKBB:'K/BB',pitcherOBA:'OBA',pitcherStrikePct:'Strike %'};
 const lowerIsBetter=['pitcherERA','pitcherWHIP','pitcherOBA'].includes(key);
 const rows=competitionRoster().filter(isPitcherProfile).map(player=>{
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
 const roster=competitionRoster(),p=evalPlayer==='Team'?roster[0]?.name:evalPlayer;
 const player=hitterObj(p);
 const types=measurementTypes(player);
 const selectedType=recordType&&types.includes(recordType)?recordType:types[0];
 const timed=stopwatchMeasurements.includes(selectedType);
 const attempts=db.measurements.filter(m=>m.player===p&&m.type===selectedType);
 return `<div class="modal-backdrop"><div class="modal"><div class="modal-header"><h2>Record Measurement</h2><button class="btn" data-close>Close</button></div>
 <label class="label">Player</label><select class="input" id="mPlayer">${roster.map(r=>`<option ${r.name===p?'selected':''}>${esc(r.name)}</option>`).join('')}</select>
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
function lineupModal(){
 const g=currentGame();if(!g)return'';
 const rows=(g.battingOrder||[]).map((name,index)=>{const player=hitterObj(name),parts=String(name||'').trim().split(/\s+/),lastName=parts[parts.length-1]||name;return `<div class="lineup-row ${index===g.currentIdx?'current-hitter':''}"><span class="lineup-order">${index+1}</span><span class="lineup-number">#${esc(player.jersey||'—')}</span><strong>${esc(lastName)}</strong>${index===g.currentIdx?'<small>AT BAT</small>':''}</div>`}).join('');
 return `<div class="modal-backdrop"><div class="modal lineup-modal"><div class="modal-header"><div><div class="small info-kicker">READ ONLY</div><h2>Lineup</h2></div><button class="btn" data-close>Close</button></div><div class="lineup-list">${rows}</div></div></div>`;
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
 const available=competitionRoster().filter(r=>!inLineup.has(r.name));
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
function pitchingImportModal(){
 const ready=pendingPitchingImport?.ready||[],problems=pendingPitchingImport?.problems||[];
 const labels=[['IP','pitcherIP'],['ERA','pitcherERA'],['WHIP','pitcherWHIP'],['K/BB','pitcherKBB'],['OBA','pitcherOBA'],['STRIKE %','pitcherStrikePct']];
 return `<div class="modal-backdrop"><div class="modal pitching-import-modal"><div class="modal-header"><div><div class="small info-kicker">GAMECHANGER PREVIEW</div><h2>Pitching Statistics</h2></div><button class="btn" data-close>Cancel</button></div><p class="pitching-import-note">Confirm these cumulative season statistics before HotB replaces the six pitching values shown on Player Eval.</p>
  <section class="pitching-preview-list">${ready.map(item=>`<article class="pitching-preview-player"><h3>${esc(item.playerName)}</h3><div>${labels.map(([label,key])=>`<span><small>${label}</small><b>${esc(item.values[key])}</b></span>`).join('')}</div></article>`).join('')||'<p class="pitching-import-empty">No pitchers are safe to update.</p>'}</section>
  ${problems.length?`<section class="pitching-import-problems"><h3>Will Not Be Updated</h3>${problems.map(problem=>`<p><b>${esc(problem.playerName||problem.sourceName||'Spreadsheet')}</b><span>${esc(problem.message)}</span></p>`).join('')}</section>`:''}
  <button class="btn red block" id="confirmPitchingImport" ${ready.length?'':'disabled'}>CONFIRM UPDATE</button></div></div>`;
}
async function parsePitchingImport(file){
 if(!window.XLSX)throw new Error('Excel import is not available right now. No statistics were changed.');
 const workbook=XLSX.read(await file.arrayBuffer(),{type:'array'}),sheets=workbook.SheetNames.map(name=>({name,rows:XLSX.utils.sheet_to_json(workbook.Sheets[name],{header:1,defval:'',raw:false})}));
 const pitchers=db.roster.map((player,index)=>({player,index})).filter(({player})=>!player.isTeamJenkins&&isPitcherProfile(player));
 const parsed=window.HotBGameChangerPitching.parseSheets(sheets,pitchers.map(({player})=>player));
 parsed.ready.forEach(item=>item.playerIndex=pitchers[item.playerIndex].index);
 return parsed;
}
function applyPitchingImport(){
 const ready=pendingPitchingImport?.ready||[];
 ready.forEach(item=>{const player=db.roster[item.playerIndex];if(player&&!player.isTeamJenkins&&isPitcherProfile(player)&&player.name===item.playerName)window.HotBGameChangerPitching.fields.forEach(field=>{player[field]=item.values[field]})});
 save();pendingPitchingImport=null;modal=null;render();alert(`${ready.length} pitcher${ready.length===1?'':'s'} updated from GameChanger.`);
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
  const items=[],importNames=new Set();
  rows.slice(headerIndex+1).forEach(row=>{
   const data={};
   playerInfoColumns.forEach(([label,key])=>data[key]=headers.includes(label)?cleanCell(row[headers.indexOf(label)]):'');
   if(!data.name)return;
   const importKey=normalizeName(data.name);
   if(importNames.has(importKey))throw new Error(`The spreadsheet lists “${data.name}” more than once. Player names must be unique.`);
   importNames.add(importKey);
   const matches=db.roster.map((player,index)=>({player,index})).filter(({player})=>!player.isTeamJenkins&&normalizeName(player.name)===importKey);
   const jenkinsMatch=db.roster.some(player=>player.isTeamJenkins&&normalizeName(player.name)===importKey);
   if(jenkinsMatch)return;
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
  let target;
  if(item.kind==='add'){
   const canonical=defaultRoster.find(profile=>normalizeName(profile.name)===normalizeName(item.data.name)),removed=new Set(db.removedRosterNames||[]);
   if(canonical&&removed.has(canonical.name)){
    target={...canonical,rosterKey:canonical.name,isGuest:false};
    db.removedRosterNames=(db.removedRosterNames||[]).filter(name=>name!==canonical.name);
   }else target={name:item.data.name,side:item.data.side||'R',isGuest:true};
  }else{
   target=db.roster[item.index];
   if(!target||target.isTeamJenkins||normalizeName(target.name)!==normalizeName(item.player?.name||item.data.name))return;
  }
  playerInfoColumns.forEach(([,key])=>{if(item.data[key])target[key]=item.data[key]});
  if(item.kind==='add')db.roster.push(target);
 });
 save();pendingRosterImport=null;modal=null;render();
 alert('Player information imported successfully.');
}
function exportRosterWorkbook(){
 const headings=playerInfoColumns.map(([label])=>label);
 const rows=competitionRoster().map(player=>playerInfoColumns.map(([,key])=>player[key]||''));
 if(!window.XLSX){
  const csv=[headings,...rows].map(row=>row.map(value=>`"${String(value).replace(/"/g,'""')}"`).join(',')).join('\r\n');
  const link=document.createElement('a');link.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));link.download='HotB_Player_Recruiting_Information.csv';link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000);return;
 }
 const sheet=XLSX.utils.aoa_to_sheet([['HOTB PLAYER RECRUITING INFORMATION'],['Blank imported cells leave existing HotB information unchanged.'],[],headings,...rows]);
 sheet['!cols']=headings.map(label=>({wch:Math.min(48,Math.max(12,label.length+2))}));
 const workbook=XLSX.utils.book_new();XLSX.utils.book_append_sheet(workbook,sheet,'Players');
 XLSX.writeFile(workbook,'HotB_Player_Recruiting_Information.xlsx');
}
function setObservationTarget(playerName='',paId=''){
 const g=currentGame();if(!g)return;
 const target=paId?(g.plateAppearances||[]).find(pa=>pa.id===paId):window.HotBCoachObservations?.lastCompletedTarget(g,playerName);
 observationTargetPlayer=target?.hitter||target?.playerName||playerName||currentHitter(g).name;
 observationTargetPaId=target?.id||target?.paId||'';
}
function openCoachObservation(options={}){
 const g=currentGame();if(!g)return;
 observationMode='game';observationScope=options.scope||'current';observationFromInningPrompt=!!options.fromInningPrompt;
 let api=window.HotBCoachObservations;
 if(!api&&window.HotBEmbeddedCoachObservations){window.HotBCoachObservations=window.HotBEmbeddedCoachObservations;api=window.HotBCoachObservations}
 if(!api){alert('Coach Observation could not initialize in this build.');return}
 const target=api.targetsForScope(g,observationScope)?.[0];
 observationTargetPlayer=target?.playerName||currentHitter(g).name;observationTargetPaId=target?.paId||'';
 modal='coachObservation';render();
}
window.HotBEmbeddedCoachObservations=window.HotBEmbeddedCoachObservations||(()=>{
 const CATEGORIES=[
  {name:'Approach',options:['Poor pitch selection','Too passive / hesitant','Chasing','Not attacking hittable pitches','Guessing','Poor two-strike approach','Taking too many strikes','Expanding the zone early']},
  {name:'Timing',options:['Early','Late','Lunging / drifting forward','Off-balance','Not getting foot down','Rushing','Commitment too early','Not adjusting to off-speed']},
  {name:'Mechanics',options:['Flying open','Rolling over','Dropping hands','Casting','Pulling off the ball','Poor outside-pitch approach','Under the ball / excessive pop-ups','Down-up swing path','Poor extension','Losing posture','Collapsing back side','Long swing path']},
  {name:'Mental / Competitive',options:['Tentative','Pressing','Lack of confidence','Poor adjustment','Repeating same mistake','At-bat carried into next at-bat','Lost plan / approach']}
 ];
 const observations=game=>{if(!game)return[];if(!Array.isArray(game.observations))game.observations=[];return game.observations};
 const observationFor=(game,paId,playerName)=>observations(game).find(item=>paId?item.paId===paId:!item.paId&&item.playerName===playerName)||null;
 const targetsForScope=(game,scope='current')=>{if(!game)return[];const current=currentHitter(game).name,pas=game.plateAppearances||[],inning=Number(game.inning)||1;let rows=scope==='previous'?pas.filter(pa=>Number(pa.inning)===inning-1):scope==='lineup'?pas:pas.filter(pa=>Number(pa.inning)===inning);const seen=new Set(),out=[];[...rows].reverse().forEach(pa=>{if(pa?.hitter&&!seen.has(pa.hitter)){seen.add(pa.hitter);const existing=observationFor(game,pa.id,pa.hitter);out.push({playerName:pa.hitter,paId:pa.id,inning:pa.inning,pa:pa.pa,observed:!!existing,tagCount:existing?.tags?.length||0})}});if(scope!=='previous'&&!seen.has(current))out.unshift({playerName:current,paId:'',current:true});if(scope==='lineup')(game.battingOrder||[]).forEach(name=>{if(name&&!seen.has(name)){seen.add(name);out.push({playerName:name,paId:'',current:name===current})}});return out};
 const saveObservation=(game,{playerName,paId='',tags=[],note=''})=>{const cleanTags=[...new Set(tags)].slice(0,3),cleanNote=String(note||'').trim().slice(0,160);if(!playerName||(!cleanTags.length&&!cleanNote))throw new Error('Choose an observation or enter a note.');const rows=observations(game),existing=observationFor(game,paId,playerName),pa=(game.plateAppearances||[]).find(item=>item.id===paId),record={id:existing?.id||('obs-'+Date.now()+'-'+Math.random()),playerName,paId,inning:pa?.inning??existing?.inning??null,pa:pa?.pa??existing?.pa??null,tags:cleanTags,note:cleanNote,createdAt:existing?.createdAt||Date.now(),updatedAt:Date.now()};if(existing)Object.assign(existing,record);else rows.push(record);return record};
 const tagUsage=(games,standalone=[])=>{const counts={};(games||[]).forEach(game=>observations(game).forEach(item=>(item.tags||[]).forEach(tag=>counts[tag]=(counts[tag]||0)+1)));(standalone||[]).forEach(item=>(item.tags||[]).forEach(tag=>counts[tag]=(counts[tag]||0)+1));return counts};
 const rangeBounds=range=>{const end=new Date(),start=new Date(end);start.setHours(0,0,0,0);if(range==='weekend'){const day=start.getDay(),back=day===0?2:day===1?3:day===2?4:day===3?5:day===4?6:day===5?0:1;start.setDate(start.getDate()-back)}else start.setDate(start.getDate()-13);end.setHours(23,59,59,999);return{start:start.getTime(),end:end.getTime()}};
 const gamesInRange=(games,range)=>{const bounds=rangeBounds(range);return(games||[]).filter(game=>{const time=new Date(game?.date).getTime();return Number.isFinite(time)&&time>=bounds.start&&time<=bounds.end})};
 const standaloneInRange=(rows,range)=>{const bounds=rangeBounds(range);return(rows||[]).filter(item=>{const time=new Date(item.observedAt||item.date||item.createdAt||item.updatedAt||0).getTime();return Number.isFinite(time)&&time>=bounds.start&&time<=bounds.end})};
 const summarize=(games,playerName,standalone=[])=>{const rows=[...(games||[]).flatMap(game=>observations(game).filter(item=>item.playerName===playerName).map(item=>({...item,gameId:game.id,gameDate:game.date}))),...(standalone||[]).filter(item=>item.playerName===playerName)],counts=new Map();rows.forEach(row=>(row.tags||[]).forEach(tag=>counts.set(tag,(counts.get(tag)||0)+1)));const patterns=[...counts].map(([tag,count])=>({tag,count,status:count>=3?'Strong recurring pattern':count===2?'Recurring pattern':'One-time observation'})).sort((a,b)=>b.count-a.count||a.tag.localeCompare(b.tag));return{rows,patterns,total:rows.length}};
 const saveStandalone=(rows,{playerName,tags=[],note='',observedAt}={})=>{const cleanTags=[...new Set(tags)].slice(0,3),cleanNote=String(note||'').trim().slice(0,160);if(!playerName||(!cleanTags.length&&!cleanNote))throw new Error('Choose an observation or enter a note.');const now=Date.now(),record={id:'obs-'+now+'-'+Math.random(),playerName,paId:'',inning:null,pa:null,tags:cleanTags,note:cleanNote,source:'player-focus',observedAt:observedAt||new Date(now).toISOString(),createdAt:now,updatedAt:now};rows.push(record);return record};
 const updateRecord=(record,{tags=[],note='',observedAt}={})=>{if(!record)throw new Error('Observation not found.');record.tags=[...new Set(tags)].slice(0,3);record.note=String(note||'').trim().slice(0,160);if(observedAt)record.observedAt=observedAt;record.updatedAt=Date.now();return record};
 return{CATEGORIES,observations,observationFor,targetsForScope,saveObservation,tagUsage,rangeBounds,gamesInRange,standaloneInRange,summarize,saveStandalone,updateRecord};
})();
window.HotBOpenCoachObservation=()=>openCoachObservation();
function openFocusObservation(){
 const selected=db.roster.find(player=>!player.isTeamJenkins&&player.name===practiceFocusPlayer);if(!selected)return;
 observationMode='focus';observationTargetPlayer=selected.name;observationTargetPaId='';
 modal='coachObservation';render();
}
function openManagedObservation(id,gameId=''){
 const selected=db.roster.find(player=>!player.isTeamJenkins&&player.name===practiceFocusPlayer);if(!selected)return;
 const source=gameId?(db.savedGames||[]).find(game=>game.id===gameId):null,record=(source?.observations||db.coachObservations||[]).find(item=>item.id===id);if(!record||record.playerName!==selected.name)return;
 observationMode='manage';observationEditId=id;observationEditGameId=gameId;observationTargetPlayer=record.playerName;observationTargetPaId=record.paId||'';modal='coachObservation';render();
}
function observationCountSummary(playerName,g=currentGame()){
 const currentRows=(g?.observations||[]).filter(item=>item.playerName===playerName);
 const rows=[...(db.savedGames||[]).flatMap(game=>(game.observations||[]).filter(item=>item.playerName===playerName)),...(db.coachObservations||[]).filter(item=>item.playerName===playerName),...currentRows];
 const unique=new Map();rows.forEach((item,index)=>unique.set(item.id||`${item.playerName}:${item.createdAt||item.observedAt||index}`,item));
 return {total:unique.size,currentGame:currentRows.length};
}
function coachObservationModal(){
 const g=currentGame(),api=window.HotBCoachObservations,focusMode=observationMode==='focus',manageMode=observationMode==='manage';if(!api||(!focusMode&&!manageMode&&!g))return'';
 if(!observationTargetPlayer&&!focusMode)setObservationTarget(currentHitter(g).name,'');
 const editGame=manageMode&&observationEditGameId?(db.savedGames||[]).find(game=>game.id===observationEditGameId):null,editRecord=manageMode?(editGame?.observations||db.coachObservations||[]).find(item=>item.id===observationEditId):null,recent=focusMode||manageMode?[]:api.targetsForScope(g,observationScope);
 const targetPa=focusMode||manageMode?null:(g.plateAppearances||[]).find(pa=>pa.id===observationTargetPaId),existing=manageMode?editRecord:focusMode?null:api.observationFor(g,observationTargetPaId,observationTargetPlayer),selected=new Set(existing?.tags||[]);
 const usage=api.tagUsage([...(db.savedGames||[]),...(g?[g]:[])],db.coachObservations);
 const categoryOptions=category=>category.options.map((option,index)=>({option,index})).sort((a,b)=>Number(selected.has(b.option))-Number(selected.has(a.option))||(usage[b.option]||0)-(usage[a.option]||0)||a.index-b.index).map(item=>item.option);
 const context=focusMode?'General observation · not linked to a game':manageMode?'Saved coach observation':targetPa?`Inning ${targetPa.inning} · completed at-bat ${targetPa.pa}`:'Player observation · no completed at-bat linked';
 const observationCounts=manageMode?null:observationCountSummary(observationTargetPlayer,g);
 return `<div class="modal-backdrop observation-backdrop"><div class="modal observation-modal"><div class="modal-header"><div><div class="small info-kicker">${focusMode||manageMode?'PLAYER FOCUS':'LIVE OR DUGOUT REVIEW'}</div><h2>${manageMode?'Edit Observation':'Coach Observation'}</h2></div><button class="btn" data-close>Close</button></div>
  <p class="observation-help">${focusMode?'Choose up to 3 items or enter a short note.':'Choose a hitter below. They are listed from the current or most recent at-bat backward.'}</p>
  ${!focusMode&&!manageMode?`<div class="observation-scopes">${!observationFromInningPrompt?`<button class="${observationScope==='current'?'active':''}" data-observation-scope="current">Current</button>`:''}${g.inning>1?`<button class="${observationScope==='previous'?'active':''}" data-observation-scope="previous">Previous</button>`:''}<button class="${observationScope==='lineup'?'active':''}" data-observation-scope="lineup">Full</button></div>`:''}
  ${manageMode?'':recent.length?`<div class="observation-recent"><span>${observationScope==='lineup'?'ACTIVE LINEUP':observationScope==='previous'?`INNING ${g.inning-1}`:`INNING ${g.inning}`}</span><div>${recent.map(item=>`<button class="${item.playerName===observationTargetPlayer&&item.paId===observationTargetPaId?'active':''}" data-observation-target="${esc(item.paId)}" data-observation-player="${esc(item.playerName)}"><b>${esc(practiceFirstName(item.playerName))}</b>${item.current?'<small>At Bat</small>':item.observed?`<small>✓ ${item.tagCount||'Note'}</small>`:''}</button>`).join('')}</div></div>`:'<p class="observation-empty">No completed at-bats in that inning.</p>'}
  ${focusMode||manageMode?`<label class="observation-player observation-player-locked"><span>PLAYER</span><strong>${esc(observationTargetPlayer)}</strong><small>${esc(context)}${existing?' · Existing observation loaded':''}</small></label>`:''}
  ${observationCounts?`<div class="observation-saved-summary"><span><b>${observationCounts.total}</b> saved</span>${!focusMode?`<span><b>${observationCounts.currentGame}</b> this game</span>`:''}<strong>${existing?'Updates an existing observation':`New entry will be #${observationCounts.total+1}`}</strong></div>`:''}
  <div class="observation-dictation observation-dictation-primary"><button type="button" class="btn" id="observationMic">🎙 Dictate Note</button><small id="observationMicStatus">Review the words before saving.</small></div>
  <div class="observation-count"><b id="observationSelectionCount">${selected.size}</b><span>of 3 selected</span></div>
  <div class="observation-categories">${api.CATEGORIES.map(category=>{const selectedCount=category.options.filter(option=>selected.has(option)).length;return `<details class="observation-category"><summary><span>${esc(category.name)}</span><small>${selectedCount?`${selectedCount} selected`:'Choose'}</small></summary><div>${categoryOptions(category).map(option=>`<button type="button" class="observation-option ${selected.has(option)?'active':''}" data-observation-option="${esc(option)}" aria-pressed="${selected.has(option)}">${esc(option)}</button>`).join('')}</div></details>`}).join('')}</div>
  <label class="observation-note"><span>OTHER / NOTE</span><textarea class="input" id="observationNote" rows="2" maxlength="160" placeholder="Optional short note">${esc(existing?.note||'')}</textarea></label>
  <button class="btn black block observation-save" id="saveCoachObservation">${existing?'Update Observation':'Save Observation'}</button>
 </div></div>`;
}
function inningObservationPromptModal(){
 return `<div class="modal-backdrop"><div class="modal inning-observation-prompt"><div class="small info-kicker">INNING ${observationPromptInning} COMPLETE</div><h2>Do you have any observations to record from that inning?</h2><div><button class="btn" id="skipInningObservation">Not Now</button><button class="btn black" id="addInningObservation">Yes — Add Observation</button></div></div></div>`;
}
function focusGameAuditModal(){
 const games=playerFocusGames().slice().sort((a,b)=>new Date(b.date)-new Date(a.date));
 const label=practiceFocusRange==='weekend'?'This Past Weekend':'Past Two Weeks';
 const rows=games.map(game=>{
  const appearances=(game.plateAppearances||[]).filter(pa=>pa.hitter===practiceFocusPlayer).length;
  const date=new Date(game.date).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});
  return `<article class="focus-game-audit-row"><div><b>${esc(game.opponent||'Opponent')}</b><span>${esc(date)}</span></div><strong>${appearances} PA</strong></article>`;
 }).join('');
 return `<div class="modal-backdrop"><div class="modal focus-game-audit-modal"><div class="modal-header"><div><div class="small info-kicker">PLAYER FOCUS</div><h2>Included Games</h2></div><button class="btn" data-close>Close</button></div><p class="focus-game-audit-player"><b>${esc(practiceFocusPlayer)}</b><span>${esc(label)}</span></p><section>${rows||'<p class="focus-empty-copy">No saved games are included in this time period.</p>'}</section></div></div>`;
}
function manageFocusObservationsModal(){
 const selected=db.roster.find(player=>!player.isTeamJenkins&&player.name===practiceFocusPlayer);if(!selected)return'';
 const games=playerFocusGames(),standalone=window.HotBCoachObservations?.standaloneInRange(db.coachObservations,practiceFocusRange)||[];
 const observed=window.HotBCoachObservations?.summarize(games,practiceFocusPlayer,standalone)||{rows:[]};
 const rows=(observed.rows||[]).slice().sort((a,b)=>new Date(b.observedAt||b.gameDate||b.createdAt||0)-new Date(a.observedAt||a.gameDate||a.createdAt||0));
 const first=practiceFirstName(practiceFocusPlayer),rangeLabel=practiceFocusRange==='weekend'?'This Past Weekend':'Past Two Weeks';
 const cards=rows.map(item=>{
  const game=item.gameId?(db.savedGames||[]).find(saved=>saved.id===item.gameId):null,date=new Date(item.observedAt||item.gameDate||item.createdAt||Date.now()).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});
  return `<article class="focus-manage-row"><div class="focus-manage-meta"><span>${esc(game?`vs ${game.opponent||'Opponent'}`:'General Observation')}</span><time>${esc(date)}</time></div>${item.tags?.length?`<p class="focus-manage-tags">${item.tags.map(esc).join(' · ')}</p>`:''}${item.note?`<p class="focus-manage-note">${esc(item.note)}</p>`:''}<div class="focus-manage-row-actions"><button type="button" data-edit-focus-observation="${esc(item.id)}" data-observation-game-id="${esc(item.gameId||'')}">Edit</button><button type="button" data-delete-focus-observation="${esc(item.id)}" data-observation-game-id="${esc(item.gameId||'')}">Delete</button></div></article>`;
 }).join('');
 return `<div class="modal-backdrop"><div class="modal focus-manage-modal"><div class="modal-header"><div><div class="small info-kicker">${esc(rangeLabel)}</div><h2>${esc(first)}’s Observations</h2></div><button class="btn" data-close>Close</button></div><p class="focus-manage-help">Delete only the extra entry. ${esc(first)}’s game and statistics will not be changed.</p><section class="focus-manage-list">${cards||'<p class="focus-empty-copy">There are no observations to manage in this time period.</p>'}</section></div></div>`;
}
function manageFocusDrillsModal(){
 const selected=db.roster.find(player=>!player.isTeamJenkins&&player.name===practiceFocusPlayer);if(!selected)return'';
 const games=playerFocusGames(),standalone=window.HotBCoachObservations?.standaloneInRange(db.coachObservations,practiceFocusRange)||[],analysis=window.HotBHittingAnalysis?.analyzePlayer(games,selected)||{issues:[]},observed=window.HotBCoachObservations?.summarize(games,selected.name,standalone)||{patterns:[]};
 const query=[...observed.patterns.map(item=>item.tag),...(analysis.issues||[]).map(item=>`${item.label} ${item.focus||''}`)].join(' '),current=focusSuggestedDrills(query),library=Array.isArray(window.HotBDrillLibrary)?window.HotBDrillLibrary:[];
 if(focusDrillReplaceIndex>=0){
  const search=focusDrillQuery.trim().toLowerCase(),used=new Set(current.map((drill,index)=>index===focusDrillReplaceIndex?'':drill.name)),shown=library.filter(drill=>!used.has(drill.name)&&(!search||Object.values(drill).some(value=>String(value||'').toLowerCase().includes(search))));
  return `<div class="modal-backdrop"><div class="modal focus-drill-manage-modal"><div class="modal-header"><div><div class="small info-kicker">REPLACE DRILL ${focusDrillReplaceIndex+1}</div><h2>Choose From Library</h2></div><button class="btn" id="backToFocusDrills">Back</button></div><div class="practice-library-search"><input class="input" id="focusDrillSearch" type="search" placeholder="Search drills" value="${esc(focusDrillQuery)}"></div><section class="focus-drill-library-list">${shown.map(drill=>`<button type="button" data-focus-replacement="${esc(drill.name)}"><b>${esc(drill.name)}</b><span>${esc(drill.bestUsedFor||drill.primaryPurpose)}</span></button>`).join('')||'<p class="focus-empty-copy">No matching drills found.</p>'}</section></div></div>`;
 }
 return `<div class="modal-backdrop"><div class="modal focus-drill-manage-modal"><div class="modal-header"><div><div class="small info-kicker">PLAYER FOCUS</div><h2>Manage Suggested Drills</h2></div><button class="btn" data-close>Close</button></div><p class="focus-manage-help">Choose the drill you want to replace. The other suggestions will stay the same.</p><section class="focus-manage-drill-slots">${current.map((drill,index)=>`<article><strong>${index+1}</strong><div><b>${esc(drill.name)}</b><span>${esc(drill.bestUsedFor||drill.primaryPurpose)}</span></div><button type="button" data-focus-drill-slot="${index}">Replace</button></article>`).join('')}</section><button type="button" class="btn block" id="resetFocusDrills">Restore HotB Suggestions</button></div></div>`;
}
function focusPublishPreviewModal(){
 const focus=playerFocusPortalPayload(),first=practiceFirstName(practiceFocusPlayer);
 if(!focus)return'';
 return `<div class="modal-backdrop"><div class="modal focus-publish-modal"><div class="modal-header"><div><div class="small info-kicker">PLAYER PORTAL PREVIEW</div><h2>${esc(first)}’s My Focus</h2></div><button class="btn" data-close>Close</button></div><p class="focus-publish-help">This is exactly what ${esc(first)} will see after you publish it.</p><div class="focus-preview-shell"><div class="focus-preview-header"><span>Back</span><b>My Focus</b><i></i></div><div class="focus-portal-preview">${portalFocusBody(focus)}</div></div><div class="focus-publish-actions"><button class="btn" data-close>Cancel</button><button class="btn red" id="confirmPublishPlayerFocus">Publish to ${esc(first)}</button></div></div></div>`;
}
function practiceBuildNoticeModal(){
 const notices=practicePlan?.buildNotices||[];if(!notices.length)return'';
 return `<div class="modal-backdrop"><div class="modal practice-resolution-modal"><div class="modal-header"><div><div class="small info-kicker">PRACTICE BUILD NOTICE</div><h2>HotB built the practice</h2></div></div><p class="practice-resolution-intro">No coaching decision is required. HotB used the following allowed fallback${notices.length===1?'':'s'} to keep every hard practice rule intact.</p><section class="practice-resolution-notices"><ul>${notices.map(note=>`<li>${esc(note)}</li>`).join('')}</ul></section><button class="btn red block" id="acceptPracticeBuildNotice">Continue to Practice Plan</button></div></div>`;
}
function practiceResolutionExtendedPlayers(players,startTime){
 const extendedEnd=practiceEndValue(startTime,132),originalEnd=practiceEndValue(startTime,120);
 if(practiceTimeMinutes(startTime)===null||practiceTimeMinutes(extendedEnd)===null||practiceTimeMinutes(originalEnd)===null)return [];
 return (players||[]).map(player=>{
  // Extend only an attendee whose verified departure was the original practice end.
  // Do not consult mutable setup state here: candidate verification, restart recovery,
  // and final postcondition proof must all derive Block 11 from the same snapshot.
  const verifiedDeparture=player.departureTime||originalEnd;
  // The source snapshot must itself agree with the normal 120-minute availability
  // calculator before we grant the extra block. This prevents malformed/tampered
  // source metadata from being "repaired" into an apparently valid Block 11 choice.
  const sourceAvailability=practiceAvailability(startTime,120,player.arrivalTime,verifiedDeparture);
  if(Number(player.availableFromBlock)!==Number(sourceAvailability.availableFromBlock)||Number(player.availableUntilBlock)!==Number(sourceAvailability.availableUntilBlock))return {...player,availableFromBlock:-1,availableUntilBlock:-1};
  const stayedThroughOriginalEnd=Number(player.availableUntilBlock)===10&&verifiedDeparture===originalEnd;
  const extended={...player,availableUntilBlock:stayedThroughOriginalEnd?11:player.availableUntilBlock,departureTime:stayedThroughOriginalEnd?extendedEnd:player.departureTime};
  // Recalculate through the production availability function and fail closed if
  // the extension helper ever drifts from the scheduler's own time/block rules.
  const availability=practiceAvailability(startTime,132,extended.arrivalTime,extended.departureTime);
  if(Number(extended.availableFromBlock)!==Number(availability.availableFromBlock)||Number(extended.availableUntilBlock)!==Number(availability.availableUntilBlock))return {...extended,availableFromBlock:-1,availableUntilBlock:-1};
  return extended;
 });
}
function practiceResolutionSignature(players,startTime,durationMinutes){
 // Attendee order is transaction data. The scheduler, setup.selectedNames,
 // plan.players and schedule keys all preserve this order, so the source signature
 // must seal it too instead of sorting names and treating reordered attendance as
 // equivalent.
 const orderedPlayers=(players||[]).map(player=>({name:String(player.name||'').trim(),isPitcher:!!player.isPitcher,isCatcher:!!player.isCatcher,isGuest:!!player.isGuest,availableFromBlock:Number(player.availableFromBlock),availableUntilBlock:Number(player.availableUntilBlock),arrivalTime:String(player.arrivalTime||''),departureTime:String(player.departureTime||''),limitations:String(player.limitations||''),canPitch:player.canPitch===true,requiresPitchWarmup:player.requiresPitchWarmup===true,canCatch:player.canCatch===true,prePracticeComplete:player.prePracticeComplete===true}));
 return JSON.stringify({players:orderedPlayers,startTime:String(startTime||''),durationMinutes:Number(durationMinutes)});
}
function practiceResolutionDecisionSignature(r){
 // Seal the verified alternatives as part of the persisted Resolution transaction.
 // The player/setup signature proves what was verified; this decision signature
 // proves which exact coaching choices passed those verification builds.
 if(!r)return'';
 const cleanList=value=>[...new Set((Array.isArray(value)?value:[]).map(item=>String(item||'').trim()).filter(Boolean))].sort();
 return JSON.stringify({
  signature:String(r.signature||''),
  startTime:String(r.startTime||''),
  durationMinutes:Number(r.durationMinutes),
  rosterGuidance:String(r.rosterGuidance||''),
  pitchers:cleanList(r.pitchers),
  catchers:cleanList(r.catchers),
  canExtend:r.canExtend===true,
  combinedPitchers:cleanList(r.combinedPitchers),
  combinedCatchers:cleanList(r.combinedCatchers),
  errors:cleanList(r.errors),
  notices:cleanList(r.notices),
  auditFailures:cleanList(r.auditFailures),
  candidateNotices:Object.fromEntries(Object.entries(r.candidateNotices&&typeof r.candidateNotices==='object'&&!Array.isArray(r.candidateNotices)?r.candidateNotices:{}).sort(([a],[b])=>a.localeCompare(b)).map(([key,value])=>[key,cleanList(value)])),
  noPitchersMode:r.noPitchersMode===null?null:String(r.noPitchersMode)
 });
}
function currentPracticeResolutionSignature(){
 if(!practiceResolution)return'';
 const roster=practiceAttendanceRoster(),expectedNames=practiceResolution.practicePlayers?.map(player=>player.name)||[],byName=new Map(roster.map(player=>[player.name,player]));
 // The verified attendee set is part of the resolution. Fail closed if someone is
 // removed OR another player/guest is added before the coaching choice is applied.
 const selectedNames=Array.isArray(practiceSetupState.selectedNames)?practiceSetupState.selectedNames:[];
 const expectedSet=new Set(expectedNames),selectedSet=new Set(selectedNames);
 // Resolution identity is name-based. Ambiguous names anywhere in the current
 // attendance roster are unsafe even if only one duplicate happens to be selected.
 const rosterNames=roster.map(player=>player.name),rosterNameSet=new Set(rosterNames);
 if(rosterNames.some(name=>!String(name||'').trim()||String(name)!==String(name).trim()))return'__practice_invalid_roster_name__';
 if(rosterNames.length!==rosterNameSet.size)return'__practice_duplicate_roster_name__';
 if(expectedNames.length!==expectedSet.size)return'__practice_duplicate_verified_name__';
 if(selectedNames.some(name=>!String(name||'').trim()||String(name)!==String(name).trim()))return'__practice_invalid_selected_name__';
 if(selectedNames.length!==selectedSet.size)return'__practice_duplicate_selected_name__';
 if(expectedNames.length!==selectedNames.length||selectedNames.some((name,index)=>name!==expectedNames[index]))return'__practice_attendance_changed__';
 if(expectedNames.some(name=>!byName.has(name)))return'__practice_roster_changed__';
 if(expectedNames.some(name=>!String(name||'').trim()))return'__practice_invalid_verified_name__';
 if(expectedNames.some(name=>String(name)!==String(name).trim()))return'__practice_noncanonical_verified_name__';
 if(String(practiceSetupState.startTime||'')!==String(practiceResolution.startTime||''))return'__practice_start_changed__';
 if(Number(practiceSetupState.durationMinutes)!==Number(practiceResolution.durationMinutes))return'__practice_duration_changed__';
 const players=expectedNames.map(name=>{const player=byName.get(name);return practicePlayerModel(player,practiceSetupState.accommodations?.[name]||practiceAccommodation(player),practiceResolution.startTime,practiceResolution.durationMinutes)});
 return practiceResolutionSignature(players,practiceResolution.startTime,practiceResolution.durationMinutes);
}
function practiceResolutionSnapshotIsCurrentAndValid(r=practiceResolution){
 // This validator is intentionally for the live global Resolution transaction.
 // Reject detached/alternate objects instead of comparing their signature against
 // mutable global state and accidentally certifying the wrong snapshot.
 if(!r||r!==practiceResolution)return false;
 if(typeof r.signature!=='string'||!r.signature||r.signature!==currentPracticeResolutionSignature())return false;
 if(typeof r.decisionSignature!=='string'||!r.decisionSignature||r.decisionSignature!==practiceResolutionDecisionSignature(r))return false;
 const players=Array.isArray(r.practicePlayers)?r.practicePlayers:[],duration=Number(r.durationMinutes),blockCount=duration===132?11:duration===120?10:0,names=players.map(player=>player?.name),verifiedNames=new Set(names);
 if(!blockCount||!players.length||names.length!==verifiedNames.size)return false;
 if(typeof r.canExtend!=='boolean'||r.noPitchersMode!==null)return false;
 const startMatch=String(r.startTime||'').match(/^(\d{2}):(\d{2})$/),startHour=Number(startMatch?.[1]),startMinute=Number(startMatch?.[2]);
 if(!startMatch||startHour>23||startMinute>59||String(r.startTime)!==String(practiceSetupState.startTime||''))return false;
 const clockMinutes=value=>{const match=String(value||'').match(/^(\d{2}):(\d{2})$/);if(!match)return null;const hour=Number(match[1]),minute=Number(match[2]);return hour<24&&minute<60?hour*60+minute:null};
 const resolutionStart=clockMinutes(r.startTime),resolutionEnd=resolutionStart===null?null:(resolutionStart+duration)%(24*60);
 if(resolutionStart===null||resolutionEnd===null)return false;
 // A persisted Resolution is always the failed normal practice. Emergency Block 11
 // exists only inside an apply candidate and must never become the source snapshot.
 if(duration!==120)return false;
 if(!players.every(player=>
  player&&String(player.name||'').trim()===String(player.name||'')&&String(player.name||'').length>0&&
  typeof player.isPitcher==='boolean'&&typeof player.isCatcher==='boolean'&&typeof player.isGuest==='boolean'&&typeof player.prePracticeComplete==='boolean'&&
  Number.isInteger(Number(player.availableFromBlock))&&Number.isInteger(Number(player.availableUntilBlock))&&
  Number(player.availableFromBlock)>=0&&Number(player.availableUntilBlock)<=blockCount&&Number(player.availableFromBlock)<Number(player.availableUntilBlock)&&
  typeof player.arrivalTime==='string'&&typeof player.departureTime==='string'&&typeof player.limitations==='string'&&player.limitations.trim()===player.limitations&&
  clockMinutes(player.arrivalTime)!==null&&clockMinutes(player.departureTime)!==null&&
  typeof player.canPitch==='boolean'&&typeof player.requiresPitchWarmup==='boolean'&&typeof player.canCatch==='boolean'&&
  (!player.isPitcher?!player.canPitch&&!player.requiresPitchWarmup:true)&&(!player.isCatcher?!player.canCatch:true)&&(!player.canPitch?!player.requiresPitchWarmup:true)
 ))return false;
 // Availability blocks and displayed arrival/departure clocks must describe the
 // same verified interval. Reuse the production availability calculator here
 // instead of maintaining a second approximation: arrivals round up to the next
 // usable block, departures round down to the last fully available block, and
 // midnight-crossing practices are handled by the same rules used at build time.
 if(players.some(player=>{
  const availability=practiceAvailability(r.startTime,duration,player.arrivalTime,player.departureTime);
  return Number(player.availableFromBlock)!==Number(availability.availableFromBlock)||Number(player.availableUntilBlock)!==Number(availability.availableUntilBlock);
 }))return false;
 const arrays=['pitchers','catchers','combinedPitchers','combinedCatchers','errors','notices','auditFailures'];
 // Resolution snapshots are canonical persisted transactions, not loose UI data.
 // Require every collection to exist as an array so older/partial snapshots cannot
 // silently acquire default empty choices through the ||[] fallbacks below.
 if(!arrays.every(key=>Array.isArray(r[key])))return false;
 if(typeof r.rosterGuidance!=='string'||r.rosterGuidance.trim()!==r.rosterGuidance||!r.rosterGuidance)return false;
 if(!r.errors.length)return false;
 if(!r.candidateNotices||typeof r.candidateNotices!=='object'||Array.isArray(r.candidateNotices))return false;
 const candidatePrototype=Object.getPrototypeOf(r.candidateNotices);
 if(candidatePrototype!==Object.prototype&&candidatePrototype!==null)return false;
 const allowedCandidateLabels=new Set([
  ...r.pitchers.map(name=>'Hitting Only: '+name),
  ...r.catchers.map(name=>'Not Catching: '+name),
  ...(r.canExtend?['Block 11']:[]),
  ...r.combinedPitchers.map(name=>'Hitting Only + Block 11: '+name),
  ...r.combinedCatchers.map(name=>'Not Catching + Block 11: '+name)
 ]);
 const candidateNoticeEntries=Object.entries(r.candidateNotices);
 if(candidateNoticeEntries.some(([label,values])=>!allowedCandidateLabels.has(label)||!Array.isArray(values)||values.some(value=>typeof value!=='string'||value.trim()!==value||!value)))return false;
 if(candidateNoticeEntries.length!==allowedCandidateLabels.size)return false;
 if([...allowedCandidateLabels].some(label=>!Object.prototype.hasOwnProperty.call(r.candidateNotices,label)))return false;
 // Every persisted collection is canonical: unique and sorted exactly as candidate
 // generation sealed it. The decision signature canonicalizes for hashing, so this
 // explicit shape check prevents reordered/duplicated unsigned storage from being
 // accepted as equivalent transaction state.
 const canonicalStringList=values=>values.length===new Set(values).size&&values.every((value,index)=>typeof value==='string'&&value.trim()===value&&value.length>0&&(index===0||values[index-1].localeCompare(value)<=0));
 if(!['errors','notices','auditFailures'].every(key=>canonicalStringList(r[key])))return false;
 if(candidateNoticeEntries.some(([,values])=>!canonicalStringList(values)))return false;
 if(candidateNoticeEntries.some(([label],index)=>index>0&&candidateNoticeEntries[index-1][0].localeCompare(label)>0))return false;
 const choiceKeys=['pitchers','catchers','combinedPitchers','combinedCatchers'];
 if(!choiceKeys.every(key=>canonicalStringList(r[key])&&r[key].every(name=>verifiedNames.has(name))))return false;
 // Block 11 is an emergency extension from the normal 120-minute practice only.
 // A Resolution snapshot itself is always the failed base attempt; 132 minutes may
 // exist only after a verified apply has begun, never as a fresh Resolution source.
 if(duration!==120)return false;
 // A Resolution with no verified coaching path is informational only: it may
 // explain the scheduler conflict and offer attendance changes, but it must not
 // masquerade as an actionable decision snapshot.
 const hasVerifiedChoice=r.pitchers.length||r.catchers.length||r.canExtend===true||r.combinedPitchers.length||r.combinedCatchers.length;
 if(!hasVerifiedChoice&&!r.errors.length)return false;
 // If verified alternatives exist, the original failed build must still carry the
 // scheduler conflict that justified opening Practice Resolution. Conversely, a
 // no-choice Resolution must provide guidance back to setup instead of a dead end.
 if(hasVerifiedChoice&&!r.errors.length)return false;
 if(!hasVerifiedChoice&&!r.rosterGuidance)return false;
 if((r.combinedPitchers||[]).some(name=>(r.pitchers||[]).includes(name))||(r.combinedCatchers||[]).some(name=>(r.catchers||[]).includes(name)))return false;
 if(r.canExtend===true&&duration!==120)return false;
 if(duration!==120&&((r.combinedPitchers||[]).length||(r.combinedCatchers||[]).length))return false;
 if((r.pitchers||[]).some(name=>!players.find(player=>player.name===name)?.canPitch)||(r.combinedPitchers||[]).some(name=>!players.find(player=>player.name===name)?.canPitch))return false;
 if((r.catchers||[]).some(name=>!players.find(player=>player.name===name)?.canCatch)||(r.combinedCatchers||[]).some(name=>!players.find(player=>player.name===name)?.canCatch))return false;
 return true;
}
function practiceResolutionModal(){
 const r=practiceResolution;if(!r)return'';
 const currentResolutionSignature=currentPracticeResolutionSignature();
 if(!r.signature||r.signature!==currentResolutionSignature)return `<div class="modal-backdrop"><div class="modal practice-resolution-modal"><div class="modal-header"><div><div class="small info-kicker">PRACTICE RESOLUTION</div><h2>Practice changed</h2></div></div><p>HotB will not apply a resolution unless its verified safety signature exactly matches the current practice information.</p><button class="btn block" id="returnPracticeAttendance">Return to Practice Setup</button></div></div>`;
 // One validator owns the full verified snapshot contract. Keeping modal display
 // validation on the same path as apply/restore prevents the two safety gates from
 // drifting apart as Practice Resolution evolves.
 if(!practiceResolutionSnapshotIsCurrentAndValid(r))return `<div class="modal-backdrop"><div class="modal practice-resolution-modal"><div class="modal-header"><div><div class="small info-kicker">PRACTICE RESOLUTION</div><h2>Verification data changed</h2></div></div><p>HotB will not display or apply coaching choices from incomplete or inconsistent Practice Resolution data.</p><button class="btn block" id="returnPracticeAttendance">Return to Practice Setup</button></div></div>`;
 const pitchers=(r.pitchers||[]).map(name=>`<label class="practice-resolution-pitcher"><input type="radio" name="practiceResolutionPitcher" value="${esc(name)}"><span><b>${esc(practiceFirstName(name))}</b><small>Hitting Only · this practice only</small></span></label>`).join('');
 const combinedPitchers=(r.combinedPitchers||[]).map(name=>`<label class="practice-resolution-pitcher"><input type="radio" name="practiceResolutionCombinedPitcher" value="${esc(name)}"><span><b>${esc(practiceFirstName(name))}</b><small>Hitting Only + Emergency Block 11</small></span></label>`).join('');
 const catchers=(r.catchers||[]).map(name=>`<label class="practice-resolution-pitcher"><input type="radio" name="practiceResolutionCatcher" value="${esc(name)}"><span><b>${esc(practiceFirstName(name))}</b><small>Not Catching · this practice only</small></span></label>`).join('');
 const combinedCatchers=(r.combinedCatchers||[]).map(name=>`<label class="practice-resolution-pitcher"><input type="radio" name="practiceResolutionCombinedCatcher" value="${esc(name)}"><span><b>${esc(practiceFirstName(name))}</b><small>Not Catching + Emergency Block 11</small></span></label>`).join('');
 const notices=(r.notices||[]).map(note=>`<li>${esc(note)}</li>`).join('');
 const auditFailures=(r.auditFailures||[]).map(note=>`<li>${esc(note)}</li>`).join('');
 const hasVerifiedChoice=!!(r.pitchers.length||r.catchers.length||r.canExtend||r.combinedPitchers.length||r.combinedCatchers.length);
 const decisionHeading=hasVerifiedChoice?'HotB needs a coaching decision':'HotB needs a setup change';
 const decisionIntro=hasVerifiedChoice?'HotB tried the normal rotation first, including aggressive rearranging, the one allowed 4-player Front Toss block, and 9-Square when needed. Every option shown below was rebuilt and passed the full rules audit.':'HotB tried the normal rotation and the allowed Practice Resolution adjustments, but it could not prove a rule-safe coaching shortcut for this exact setup.';
 return `<div class="modal-backdrop"><div class="modal practice-resolution-modal"><div class="modal-header"><div><div class="small info-kicker">PRACTICE RESOLUTION</div><h2>${decisionHeading}</h2></div></div><p class="practice-resolution-intro">${esc(decisionIntro)}</p><section class="practice-resolution-problem"><b>What is preventing the build</b><ul>${(r.errors||[]).map(error=>`<li>${esc(error)}</li>`).join('')}</ul></section>${auditFailures?`<section class="practice-resolution-notices"><b>Safety audit could not verify</b><ul>${auditFailures}</ul></section>`:''}${notices?`<section class="practice-resolution-notices"><b>Automatic equipment / capacity notices</b><ul>${notices}</ul></section>`:''}${pitchers?`<section class="practice-resolution-choice"><h3>Make one pitcher Hitting Only</h3><p>Choose any attending pitcher currently available to pitch. She stays in the full practice as a hitter, does not warm up pitching, and does not pitch Live.</p><div class="practice-resolution-pitchers">${pitchers}</div><button class="btn red block" id="applyPracticePitcherResolution">Apply & Build Practice</button></section>`:''}${catchers?`<section class="practice-resolution-choice"><h3>Remove one catcher from Catching</h3><p>She stays in the full practice as a hitter. HotB verified that removing her only from the catcher rotation resolves this exact practice.</p><div class="practice-resolution-pitchers">${catchers}</div><button class="btn red block" id="applyPracticeCatcherResolution">Apply & Build Practice</button></section>`:''}${r.canExtend?`<section class="practice-resolution-choice"><h3>Add Block 11</h3><p>Extend this practice by 12 minutes, from 120 to 132 minutes. HotB will use this only as an emergency solution and will not add a 12th block.</p><button class="btn black block" id="applyPracticeExtensionResolution">Add Block 11 & Build Practice</button></section>`:''}${combinedPitchers?`<section class="practice-resolution-choice"><h3>Hitting Only + Block 11</h3><p>HotB verified that neither change needs to be guessed: this exact two-part adjustment produces a rule-safe practice.</p><div class="practice-resolution-pitchers">${combinedPitchers}</div><button class="btn black block" id="applyPracticeCombinedResolution">Apply Both & Build Practice</button></section>`:''}${combinedCatchers?`<section class="practice-resolution-choice"><h3>Not Catching + Block 11</h3><p>HotB verified this exact two-part adjustment produces a rule-safe practice while keeping the catcher in the hitting rotation.</p><div class="practice-resolution-pitchers">${combinedCatchers}</div><button class="btn black block" id="applyPracticeCombinedCatcherResolution">Apply Both & Build Practice</button></section>`:''}<section class="practice-resolution-last"><h3>Change Attendance / Availability</h3><p>${esc(r.rosterGuidance||'HotB could not find another rule-safe solution. Change attendance or player availability, then build again.')}</p><button class="btn block" id="returnPracticeAttendance">Change Attendance / Availability</button></section></div></div>`;
}
function modalView(){
 if(modal==='practiceBuildNotice')return practiceBuildNoticeModal();
 if(modal==='practiceResolution'){
  // Startup may restore an unresolved snapshot before the Resolution helpers have
  // been exercised. Validate at the actual display boundary: corrupt/stale data is
  // discarded before any coaching choice is rendered, and the cleaned setup draft
  // is persisted so the same bad snapshot cannot reopen on the next launch.
  if(!practiceResolutionSnapshotIsCurrentAndValid(practiceResolution)){
   console.warn('Saved Practice Resolution failed display validation; returning to setup.');
   practiceResolution=null;modal=null;
   // Never let a rejected emergency Resolution strand setup at 132 minutes.
   // Block 11 exists only while backed by a currently verified Resolution.
   if(Number(practiceSetupState.durationMinutes)===132)practiceSetupState.durationMinutes=120;
   if(!practicePlan&&!db.activePortalPractice?.id&&window.HotBPracticeSession?.createDraft){
    try{
     const cleanedDraft=window.HotBPracticeSession.createDraft({setupState:practiceSetupState,resolution:null});
     const cleanedBytes=JSON.stringify(cleanedDraft);
     const cleanedRestored=window.HotBPracticeSession.restore?.(cleanedDraft);
     if(!cleanedDraft||cleanedDraft.stage!=='setup'||cleanedDraft.plan||cleanedDraft.resolution||!cleanedBytes||!cleanedRestored||JSON.stringify(cleanedRestored)!==cleanedBytes)throw new Error('invalid-cleaned-resolution-draft');
     db.activePracticeSession=cleanedDraft;save();
     if(JSON.stringify(db.activePracticeSession)!==cleanedBytes)throw new Error('cleaned-resolution-draft-save-drift');
    }catch(error){
     console.error('HotB could not persist a verified clean setup after rejecting stale Practice Resolution.',error);
     db.activePracticeSession=null;
     try{save()}catch(cleanError){console.error('HotB could not clear stale Practice Resolution recovery authority.',cleanError)}
    }
   }
   return'';
  }
  return practiceResolutionModal();
 }
 if(modal==='recoveryGuide')return recoveryGuideModal();
 if(modal==='cloudBackup')return cloudBackupModal();
 if(modal==='changePitcher')return pitcherChangeModal();
 if(modal==='changeHitter')return hitterChangeModal();
 if(modal==='playerInfo')return playerInfoModal();
 if(modal==='importRoster')return importRosterModal();
 if(modal==='pitchingImport')return pitchingImportModal();
 if(modal==='coachObservation')return coachObservationModal();
 if(modal==='inningObservationPrompt')return inningObservationPromptModal();
 if(modal==='focusGameAudit')return focusGameAuditModal();
 if(modal==='manageFocusObservations')return manageFocusObservationsModal();
 if(modal==='manageFocusDrills')return manageFocusDrillsModal();
 if(modal==='focusPublishPreview')return focusPublishPreviewModal();
 if(modal==='lineup')return lineupModal();
 if(modal?.startsWith('hittingRanking:'))return isCoachEvaluation()?withCoachEvaluationData(()=>hittingRankingModal(modal.slice(15))):hittingRankingModal(modal.slice(15));
 if(modal?.startsWith('ranking:'))return isCoachEvaluation()?withCoachEvaluationData(()=>evalRankingModal(modal.slice(8))):evalRankingModal(modal.slice(8));
 if(modal?.startsWith('pitchRanking:'))return isCoachEvaluation()?withCoachEvaluationData(()=>pitcherRankingModal(modal.slice(13))):pitcherRankingModal(modal.slice(13));
 if(modal==='HIT'||modal==='H4O')return hitModal(modal);
 if(modal==='reports')return reportModal();
 if(modal==='gamesSelection')return gamesSelectionModal();
 if(modal==='reportGamesList')return reportGamesListModal();
 if(modal?.startsWith('gameGroup:'))return gameGroupModal(db.gameGroups.find(group=>group.id===modal.slice(10)));
 if(modal==='record')return recordModal();
 if(modal==='endGame'||modal==='discardConfirm')return gameActionModal(modal);
 if(modal?.startsWith('guide:'))return evalGuide(modal.slice(6));
 return '';
}
function bind(){
 $$('[data-go]').forEach(el=>el.onclick=()=>go(el.dataset.go));
 $$('[data-close]').forEach(el=>el.onclick=()=>{if(modal==='record'){if(timerInt)clearInterval(timerInt);timerInt=null;timerElapsed=0;recordType=''}modal=modal==='reportGamesList'?'reports':null;render()});
 if(route==='new')bindNew();
 if(route==='roster')bindRoster();
 if(route==='live')bindLive();
 if(route==='eval')bindEval();
 if(route==='reports')bindReportsPage();
 if(route==='practice')bindPractice();
 if(route==='portal')bindPlayerPortal();
 if(modal==='HIT'||modal==='H4O')bindContact();
 if(modal==='reports')bindReports();
 if(modal==='gamesSelection')bindGamesSelection();
 if(modal?.startsWith('gameGroup:'))bindGameGroup();
 if(modal==='record')bindRecord();
 if(modal==='endGame'||modal==='discardConfirm')bindGameAction();
 if(modal==='changePitcher')bindPitcherChange();
 if(modal==='changeHitter')bindHitterChange();
 if(modal==='playerInfo')bindPlayerInfo();
 if(modal==='importRoster')$('#confirmRosterImport')?.addEventListener('click',applyRosterImport);
 if(modal==='pitchingImport')$('#confirmPitchingImport')?.addEventListener('click',applyPitchingImport);
 if(modal==='coachObservation')bindCoachObservation();
 if(modal==='inningObservationPrompt')bindInningObservationPrompt();
 if(modal==='manageFocusDrills')bindManageFocusDrills();
 if(modal==='focusPublishPreview')bindFocusPublishPreview();
 if(modal==='cloudBackup')bindCloudBackup();
 if(modal==='practiceBuildNotice'){
  $('#acceptPracticeBuildNotice')?.addEventListener('click',()=>{
   // A Resolution rebuild may render this notice while its final rules/restart
   // verification is still queued. Do not let the notice become an escape hatch
   // from the transaction; commit/rollback must finish before the coach continues.
   if(practiceResolutionApplyToken){console.warn('HotB deferred Practice Build Notice until Practice Resolution verification finished.');return}
   modal=null;render();window.scrollTo(0,0);
  });
 }
 if(modal==='practiceResolution'){
  const resolutionStillCurrent=()=>{
   if(!practiceResolution?.signature){alert('HotB cannot verify this Practice Resolution because its safety signature is missing. Return to Practice Setup and build again.');return false}
   if(practiceResolutionSnapshotIsCurrentAndValid())return true;
   alert('This practice changed or its verified Resolution data is no longer valid. Return to Practice Setup and build again so HotB can verify the current practice.');return false;
  };
  let resolutionApplying=false;
  const beginResolutionApply=()=>{
   // The local flag is recreated on every render/bind, so the global transaction
   // identities are the durable lock. Never permit a second coaching choice while
   // an earlier Resolution apply is between mutation, rebuild, audit, and commit.
   if(resolutionApplying||practiceResolutionApplyToken||practiceResolutionApplyDraftId||practiceResolutionApplyOwnedDraftId)return false;
   resolutionApplying=true;
   document.querySelectorAll('.practice-resolution-modal button').forEach(button=>button.disabled=true);
   document.querySelectorAll('.practice-resolution-modal input').forEach(input=>input.disabled=true);
   return true;
  };
  const verifiedResolutionChoice=(type,name=null)=>{
   if(!practiceResolutionSnapshotIsCurrentAndValid())return false;
   const verifiedPlayers=practiceResolution.practicePlayers||[],matches=name==null?[]:verifiedPlayers.filter(player=>player.name===name);
   if(type==='extension')return practiceResolution.canExtend===true&&Number(practiceResolution.durationMinutes)===120&&Object.prototype.hasOwnProperty.call(practiceResolution.candidateNotices,'Block 11')&&Array.isArray(practiceResolution.candidateNotices['Block 11']);
   if(matches.length!==1)return false;
   const player=matches[0],blockCount=Number(practiceResolution.durationMinutes)===132?11:Number(practiceResolution.durationMinutes)===120?10:0;
   if(!blockCount||!Number.isInteger(Number(player.availableFromBlock))||!Number.isInteger(Number(player.availableUntilBlock))||Number(player.availableFromBlock)<0||Number(player.availableUntilBlock)>blockCount||Number(player.availableFromBlock)>=Number(player.availableUntilBlock))return false;
   if(typeof player.canPitch!=='boolean'||typeof player.requiresPitchWarmup!=='boolean'||typeof player.canCatch!=='boolean'||(!player.canPitch&&player.requiresPitchWarmup))return false;
   const label=type==='pitcher'?'Hitting Only: '+name:type==='catcher'?'Not Catching: '+name:type==='combinedPitcher'?'Hitting Only + Block 11: '+name:type==='combinedCatcher'?'Not Catching + Block 11: '+name:'';
   if(!label||!Object.prototype.hasOwnProperty.call(practiceResolution.candidateNotices,label)||!Array.isArray(practiceResolution.candidateNotices[label]))return false;
   if(type==='pitcher')return player.canPitch===true&&(practiceResolution.pitchers||[]).includes(name);
   if(type==='catcher')return player.canCatch===true&&(practiceResolution.catchers||[]).includes(name);
   if(type==='combinedPitcher')return Number(practiceResolution.durationMinutes)===120&&player.canPitch===true&&(practiceResolution.combinedPitchers||[]).includes(name);
   if(type==='combinedCatcher')return Number(practiceResolution.durationMinutes)===120&&player.canCatch===true&&(practiceResolution.combinedCatchers||[]).includes(name);
   return false;
  };
  const rejectUnverifiedResolution=()=>{
   alert('HotB will not apply that choice because it is not one of the verified solutions for this practice. Return to Practice Setup and build again.');
  };
  const findResolutionRosterIndex=(name,roleLabel)=>{
   const roster=practiceAttendanceRoster(),index=roster.findIndex(player=>player.name===name);
   if(index<0){alert('HotB could not find that '+roleLabel+' in this practice. Return to Practice Setup and build again.');return null}
   return {roster,index};
  };
  const endResolutionApply=()=>{
   resolutionApplying=false;
   document.querySelectorAll('.practice-resolution-modal button').forEach(button=>button.disabled=false);
   document.querySelectorAll('.practice-resolution-modal input').forEach(input=>input.disabled=false);
  };
  const resolutionPostcondition=(expected)=>{
   if(!expected||!practicePlan)return false;
   // This verifier is intentionally read-only. Capture the plan's serialized shape
   // so any accidental future mutation inside the proof fails the transaction.
   let proofBefore='';
   try{proofBefore=JSON.stringify(practicePlan)}catch(_){return false}
   const finishProof=result=>{
    if(!result)return false;
    try{return JSON.stringify(practicePlan)===proofBefore}catch(_){return false}
   };
   if(String(practicePlan.startTime||'')!==String(expected.startTime||''))return false;
   if(Number(practicePlan.durationMinutes)!==Number(expected.durationMinutes))return false;
   if(!Array.isArray(expected.expectedNotices))return false;
   const actualNotices=[...new Set((practicePlan.fallbackWarnings||[]).map(value=>String(value||'').trim()).filter(Boolean))].sort();
   const expectedNotices=[...new Set(expected.expectedNotices.map(value=>String(value||'').trim()).filter(Boolean))].sort();
   if(JSON.stringify(actualNotices)!==JSON.stringify(expectedNotices))return false;
   const expectedNames=expected.playerNames||[],actualNames=(practicePlan.players||[]).map(player=>player.name);
   const expectedSet=new Set(expectedNames),actualSet=new Set(actualNames);
   if(!Array.isArray(expected.playerNames)||!expectedNames.length||expectedNames.some(name=>typeof name!=='string'||!name.trim()||name.trim()!==name))return false;
   if(actualNames.some(name=>typeof name!=='string'||!name.trim()||name.trim()!==name))return false;
   if(expectedNames.length!==expectedSet.size||actualNames.length!==actualSet.size)return false;
   // Resolution commit preserves the verified attendee order as transaction data.
   // This keeps plan.players, setup.selectedNames and persisted recovery aligned.
   if(expectedNames.length!==actualNames.length||actualNames.some((name,index)=>name!==expectedNames[index]))return false;
   const expectedBlocks=Number(expected.durationMinutes)===132?11:10;
   if(!Array.isArray(practicePlan.times)||practicePlan.times.length!==expectedBlocks)return false;
   const scheduleKeys=Object.keys(practicePlan.schedule||{}),scheduleSet=new Set(scheduleKeys);
   if(scheduleKeys.length!==scheduleSet.size||scheduleSet.size!==expectedSet.size||expectedNames.some((name,index)=>scheduleKeys[index]!==name))return false;
   for(const name of expectedNames)if(!Array.isArray(practicePlan.schedule?.[name])||practicePlan.schedule[name].length!==expectedBlocks)return false;
   // The rebuilt plan must not merely have the right number of blocks. Every time
   // row must be the exact 12-minute sequence implied by the verified start time.
   // This catches shifted, duplicated, skipped, or malformed block clocks before
   // a resolved practice can be committed to restart recovery or player portals.
   const clockMinutes=value=>{const match=String(value||'').trim().match(/^(\d{1,2}):(\d{2})$/);if(!match)return null;const hour=Number(match[1]),minute=Number(match[2]);return hour>=0&&hour<24&&minute>=0&&minute<60?hour*60+minute:null};
   const verifiedStart=clockMinutes(expected.startTime);
   if(verifiedStart===null)return false;
   if(!practicePlan.times.every((time,index)=>{
    if(!time||Number(time.block)!==index+1)return false;
    const start=clockMinutes(time.start),end=clockMinutes(time.end),expectedStart=(verifiedStart+index*12)%(24*60),expectedEnd=(verifiedStart+(index+1)*12)%(24*60);
    return start===expectedStart&&end===expectedEnd;
   }))return false;
   for(const name of expectedNames){
    const rows=practicePlan.schedule[name];
    if(rows.some((row,index)=>!row||typeof row!=='object'||typeof row.activity!=='string'||!row.activity.trim()||row.activity.trim()!==row.activity||(row.block!=null&&Number(row.block)!==index+1)||(row.partner!=null&&(typeof row.partner!=='string'||!row.partner.trim()||row.partner.trim()!==row.partner))))return false;
   }
   // A resolved practice must also be collision-free at the block level. The
   // scheduler audit remains authoritative for station-specific capacities, but
   // this transaction proof independently rejects duplicate player assignments,
   // illegal solo stations, and oversized ordinary hitting groups.
   for(let block=0;block<expectedBlocks;block++){
    const presentNames=expectedNames.filter(name=>{
     const availability=expected.availability?.[name];
     return availability&&block>=Number(availability.availableFromBlock)&&block<Number(availability.availableUntilBlock);
    });
    const assignmentCount=new Map();
    for(const name of presentNames){
     const row=practicePlan.schedule?.[name]?.[block];
     if(!row||row.activity==='Not Present')return false;
     assignmentCount.set(name,(assignmentCount.get(name)||0)+1);
    }
    if([...assignmentCount.values()].some(count=>count!==1))return false;
    const stationGroups=new Map();
    for(const name of presentNames){
     const row=practicePlan.schedule[name][block],activity=row.activity;
     // Only true player-group stations belong in this independent capacity proof.
     // Support/reset roles are intentionally solo, while Stretch/Tee and live roles
     // have their own scheduler/postcondition contracts.
     const stationKey=activity==='Machine'?'Machine':activity.startsWith('Front Toss Lane ')?activity:activity.startsWith('Drill #')?activity:null;
     if(!stationKey)continue;
     if(!stationGroups.has(stationKey))stationGroups.set(stationKey,[]);
     stationGroups.get(stationKey).push(name);
    }
    let frontFourCount=0;
    for(const [station,names] of stationGroups){
     if(station.startsWith('Front Toss Lane ')&&names.length===4){frontFourCount++;continue}
     if(names.length<2||names.length>3)return false;
    }
    if(frontFourCount>1)return false;
   }
   // The four-player Front Toss exception is practice-wide, not per block.
   let totalFrontFours=0;
   for(let block=0;block<expectedBlocks;block++){
    const counts=new Map();
    for(const name of expectedNames){
     const activity=practicePlan.schedule?.[name]?.[block]?.activity;
     if(typeof activity==='string'&&activity.startsWith('Front Toss Lane '))counts.set(activity,(counts.get(activity)||0)+1);
    }
    totalFrontFours+=[...counts.values()].filter(count=>count===4).length;
   }
   if(totalFrontFours>1)return false;
   if(!Array.isArray(practicePlan.liveSessions))return false;
   {
    const liveKeys=new Set(),liveRoleKeys=new Set();
    for(const live of practicePlan.liveSessions){
     const block=Number(live?.block),pitcher=String(live?.pitcher||''),catcher=String(live?.catcher||''),hitters=Array.isArray(live?.hitters)?live.hitters:[];
     if(!Number.isInteger(block)||block<0||block>=expectedBlocks||!pitcher||pitcher.trim()!==pitcher||!expectedSet.has(pitcher)||!catcher||catcher.trim()!==catcher||hitters.length<2||hitters.length>3)return false;
     if(hitters.some(name=>typeof name!=='string'||!name.trim()||name.trim()!==name))return false;
     const liveKey=block+'|'+pitcher;
     if(liveKeys.has(liveKey))return false;
     liveKeys.add(liveKey);
     // A player can hold only one live role in a block, even across multiple
     // sessions. Prove that here rather than relying solely on the later scheduler audit.
     const roleNames=[pitcher,...(catcher==='9Square'?[]:[catcher]),...hitters];
     for(const roleName of roleNames){
      const roleKey=block+'|'+roleName;
      if(liveRoleKeys.has(roleKey))return false;
      liveRoleKeys.add(roleKey);
     }
     // Every player live role must occur inside the exact verified availability
     // interval. Do not rely only on the schedule row: liveSessions is persisted
     // separately and must independently agree with the Resolution snapshot.
     const livePlayerNames=[pitcher,...(catcher==='9Square'?[]:[catcher]),...hitters];
     if(livePlayerNames.some(name=>{
      const availability=expected.availability?.[name];
      return !availability||block<Number(availability.availableFromBlock)||block>=Number(availability.availableUntilBlock);
     }))return false;
     if(catcher!=='9Square'&&!expectedSet.has(catcher))return false;
     if(catcher==='9Square'&&expectedSet.has(catcher))return false;
     if(catcher===pitcher)return false;
     if(hitters.length!==new Set(hitters).size||hitters.some(name=>!expectedSet.has(name)||name===pitcher||name===catcher))return false;
     const pitcherPlayer=(practicePlan.players||[]).find(player=>player.name===pitcher);
     const catcherPlayer=catcher==='9Square'?null:(practicePlan.players||[]).find(player=>player.name===catcher);
     if(!pitcherPlayer||pitcherPlayer.isPitcher!==true||pitcherPlayer.canPitch!==true)return false;
     if(catcherPlayer&&(catcherPlayer.isCatcher!==true||catcherPlayer.canCatch!==true))return false;
     // 9Square is a bounded fallback, never a shortcut while an eligible catcher
     // is actually open in that block. This preserves the scheduler's catcher-first
     // rule after a Hitting Only / Not Catching / Block 11 Resolution rebuild.
     if(catcher==='9Square'){
      // Match the scheduler's actual catcher-selection moment. Before general
      // hitting/drill stations are assigned, a catcher is eligible when available,
      // enabled, not the pitcher, not already reserved by an earlier live session,
      // and still below the two-live-session ceiling. Later Machine/Front Toss/
      // Drill assignments must not make 9Square look justified retroactively.
      const earlierCatcherLoads=new Map();
      for(const prior of practicePlan.liveSessions){
       if(Number(prior?.block)>=block)continue;
       if(prior?.catcher&&prior.catcher!=='9Square')earlierCatcherLoads.set(prior.catcher,(earlierCatcherLoads.get(prior.catcher)||0)+1);
      }
      const eligibleOpenCatcher=(practicePlan.players||[]).some(player=>{
       if(player.isCatcher!==true||player.canCatch!==true||player.name===pitcher||(earlierCatcherLoads.get(player.name)||0)>=2)return false;
       const availability=expected.availability?.[player.name];
       if(!availability||block<Number(availability.availableFromBlock)||block>=Number(availability.availableUntilBlock))return false;
       return !practicePlan.liveSessions.some(other=>Number(other?.block)===block&&other?.catcher===player.name);
      });
      if(eligibleOpenCatcher)return false;
     }
     if(practicePlan.schedule?.[pitcher]?.[block]?.activity!=='Pitch Live')return false;
     if(catcher!=='9Square'&&practicePlan.schedule?.[catcher]?.[block]?.activity!=='Catch Live')return false;
     if(hitters.some(name=>practicePlan.schedule?.[name]?.[block]?.activity!=='Hit Live'))return false;
    }
   }
   // Prove the inverse mapping too: every schedule-side live assignment must be
   // represented by exactly one live-session record for that block.
   for(let block=0;block<expectedBlocks;block++){
    const sessions=practicePlan.liveSessions.filter(session=>Number(session.block)===block);
    for(const name of expectedNames){
     const activity=practicePlan.schedule?.[name]?.[block]?.activity;
     if(activity==='Pitch Live'&&sessions.filter(session=>session.pitcher===name).length!==1)return false;
     if(activity==='Catch Live'&&sessions.filter(session=>session.catcher===name).length!==1)return false;
     if(activity==='Hit Live'&&sessions.filter(session=>Array.isArray(session.hitters)&&session.hitters.includes(name)).length!==1)return false;
    }
   }
   for(const player of practicePlan.players||[]){
    const availability=expected.availability?.[player.name];if(!availability)return false;
    const from=Number(player.availableFromBlock),until=Number(player.availableUntilBlock);
    if(from!==Number(availability.availableFromBlock)||until!==Number(availability.availableUntilBlock)||String(player.arrivalTime||'')!==String(availability.arrivalTime||'')||String(player.departureTime||'')!==String(availability.departureTime||'')||String(player.limitations||'')!==String(availability.limitations||''))return false;
    const rows=practicePlan.schedule?.[player.name]||[];
    for(let block=0;block<expectedBlocks;block++){
     const absent=block<from||block>=until;
     if(absent&&rows[block]?.activity!=='Not Present')return false;
     if(!absent&&rows[block]?.activity==='Not Present')return false;
    }
   }
   for(const player of practicePlan.players||[]){
    const baseline=expected.baselineRoles?.[player.name];if(!baseline)return false;
    if(typeof player.canPitch!=='boolean'||typeof player.requiresPitchWarmup!=='boolean'||typeof player.canCatch!=='boolean'||typeof player.prePracticeComplete!=='boolean'||typeof player.isPitcher!=='boolean'||typeof player.isCatcher!=='boolean'||typeof player.isGuest!=='boolean')return false;
    if(!player.canPitch&&player.requiresPitchWarmup)return false;
    if((player.prePracticeComplete===true)!==baseline.prePracticeComplete||(player.isPitcher===true)!==baseline.isPitcher||(player.isCatcher===true)!==baseline.isCatcher||(player.isGuest===true)!==baseline.isGuest)return false;
    const approvedTarget=expected.role&&player.name===expected.name;
    if(!approvedTarget){
     if(player.canPitch!==baseline.canPitch||player.requiresPitchWarmup!==baseline.requiresPitchWarmup||player.canCatch!==baseline.canCatch)return false;
    }else if(expected.role==='pitcher'){
     if(player.canPitch!==false||player.requiresPitchWarmup!==false||player.canCatch!==baseline.canCatch)return false;
    }else if(expected.role==='catcher'){
     if(player.canCatch!==false||player.canPitch!==baseline.canPitch||player.requiresPitchWarmup!==baseline.requiresPitchWarmup)return false;
    }
    const rows=practicePlan.schedule?.[player.name]||[];
    if(!player.isPitcher&&(player.canPitch||player.requiresPitchWarmup))return false;
    if(!player.isCatcher&&player.canCatch)return false;
    if(player.canPitch===false&&rows.some(row=>row?.activity==='Pitch Live'||row?.activity==='Pitch Warm-Up'))return false;
    if(player.requiresPitchWarmup===false&&rows.some(row=>row?.activity==='Pitch Warm-Up'))return false;
    if(player.canCatch===false&&rows.some(row=>row?.activity==='Catch Live'||row?.activity==='Catch Warm-Up'))return false;
    // Warm-up partner records are transactional data too. A resolved practice may
    // not commit a one-sided pitcher/catcher pairing or an ineligible partner.
    let warmupInvalid=false;
    rows.forEach((row,block)=>{
     if(row?.activity==='Pitch Warm-Up'){
      if(!player.isPitcher||player.canPitch!==true||player.requiresPitchWarmup!==true||!row.partner){warmupInvalid=true;return}
      if(row.partner!=='Coach'){
       const partner=(practicePlan.players||[]).find(item=>item.name===row.partner),partnerRow=practicePlan.schedule?.[row.partner]?.[block];
       if(!partner||partner.isCatcher!==true||partner.canCatch!==true||partnerRow?.activity!=='Catch Warm-Up'||partnerRow?.partner!==player.name)warmupInvalid=true;
      }
     }else if(row?.activity==='Catch Warm-Up'){
      const partner=(practicePlan.players||[]).find(item=>item.name===row.partner),partnerRow=practicePlan.schedule?.[row.partner]?.[block];
      if(!player.isCatcher||player.canCatch!==true||!partner||partner.isPitcher!==true||partner.canPitch!==true||partner.requiresPitchWarmup!==true||partnerRow?.activity!=='Pitch Warm-Up'||partnerRow?.partner!==player.name)warmupInvalid=true;
     }
    });
    if(warmupInvalid)return false
   }
   // Match the production workload ceilings at the transaction boundary too.
   // A resolved plan must not pass merely because its individual role records are
   // internally consistent while overloading one pitcher or catcher.
   const livePitcherLoads=new Map(),liveCatcherLoads=new Map();
   for(const session of practicePlan.liveSessions){
    livePitcherLoads.set(session.pitcher,(livePitcherLoads.get(session.pitcher)||0)+1);
    if(session.catcher!=='9Square')liveCatcherLoads.set(session.catcher,(liveCatcherLoads.get(session.catcher)||0)+1);
   }
   if([...livePitcherLoads.values()].some(count=>count>2)||[...liveCatcherLoads.values()].some(count=>count>2))return false;
   // Persisted summary metadata must agree with the role records it summarizes.
   // Do not allow a resolved plan whose catcherLoads or pitcherRepeats drifted from
   // liveSessions to pass the transaction boundary.
   if(!Array.isArray(practicePlan.catcherLoads)||!Array.isArray(practicePlan.pitcherRepeats)||!Array.isArray(practicePlan.liveHitterRepeats))return false;
   if(practicePlan.catcherLoads.some(item=>!item||typeof item.name!=='string'||!item.name.trim()||item.name.trim()!==item.name||!Number.isInteger(Number(item.liveBlocks))||Number(item.liveBlocks)<0))return false;
   const catcherLoadNames=practicePlan.catcherLoads.map(item=>item.name);
   if(catcherLoadNames.length!==new Set(catcherLoadNames).size)return false;
   const catcherLoadMap=new Map(practicePlan.catcherLoads.map(item=>[item.name,Number(item.liveBlocks)]));
   const eligibleCatchers=(practicePlan.players||[]).filter(player=>player.isCatcher===true).map(player=>player.name);
   if(catcherLoadMap.size!==eligibleCatchers.length||eligibleCatchers.some((name,index)=>catcherLoadNames[index]!==name||catcherLoadMap.get(name)!==(liveCatcherLoads.get(name)||0)))return false;
   const repeatedPitchers=[...livePitcherLoads.entries()].filter(([,count])=>count>1).map(([name])=>name).sort();
   if(practicePlan.pitcherRepeats.some(name=>typeof name!=='string'||!name.trim()||name.trim()!==name)||practicePlan.pitcherRepeats.length!==new Set(practicePlan.pitcherRepeats).size)return false;
   const persistedPitcherRepeats=practicePlan.pitcherRepeats.slice().sort();
   if(repeatedPitchers.length!==persistedPitcherRepeats.length||repeatedPitchers.some((name,index)=>name!==persistedPitcherRepeats[index]))return false;
   const liveHitCounts=new Map(expectedNames.map(name=>[name,0]));
   practicePlan.liveSessions.forEach(session=>(session.hitters||[]).forEach(name=>liveHitCounts.set(name,(liveHitCounts.get(name)||0)+1)));
   const repeatedHitters=[...liveHitCounts.entries()].filter(([,count])=>count>1).map(([name])=>name).sort();
   if(practicePlan.liveHitterRepeats.some(name=>typeof name!=='string'||!name.trim()||name.trim()!==name)||practicePlan.liveHitterRepeats.length!==new Set(practicePlan.liveHitterRepeats).size)return false;
   const persistedHitterRepeats=practicePlan.liveHitterRepeats.slice().sort();
   if(repeatedHitters.length!==persistedHitterRepeats.length||repeatedHitters.some((name,index)=>name!==persistedHitterRepeats[index]))return false;
   return finishProof(true);
  };
  const rebuildResolvedPractice=(rollbackState,expected)=>{
   // Transaction ownership helpers must exist outside the try block. If setup fails
   // before the deferred rebuild is queued, the catch path still needs a valid,
   // ownership-aware rollback instead of throwing a second ReferenceError.
   let resolutionDraftId=null,resolutionApplyToken=null;
   const transactionOwnsToken=()=>!!resolutionDraftId&&!!resolutionApplyToken&&practiceResolutionApplyToken===resolutionApplyToken&&practiceResolutionApplyOwnedDraftId===resolutionDraftId;
   const transactionIsCurrent=()=>transactionOwnsToken()&&(practiceResolutionApplyDraftId===resolutionDraftId||practicePlan?.portalDraftId===resolutionDraftId);
   const rollbackIfOwned=(message=null)=>{
    // Only the transaction that still owns the live token may restore its snapshot.
    // A stale queued callback must never overwrite a newer Resolution/apply.
    if(!transactionOwnsToken())return false;
    const restored=restoreResolutionRollback(rollbackState);
    // Rollback publication is asynchronous on iPhone. Queue the explanation behind
    // that paint instead of alerting immediately and blocking the recovery frame.
    if(restored&&message){
     const notify=()=>alert(message);
     if(typeof requestAnimationFrame==='function')requestAnimationFrame(()=>setTimeout(notify,0));
     else setTimeout(notify,16);
    }
    return restored;
   };
   const rollbackInitialFailure=()=>{
    // Before this apply publishes a token it cannot conflict with a newer apply:
    // beginResolutionApply still owns the modal lock. Restore the captured verified
    // snapshot directly so UUID/setup failures cannot strand the Resolution disabled.
    if(!resolutionApplyToken&&!practiceResolutionApplyToken)return restoreResolutionRollback(rollbackState);
    return rollbackIfOwned();
   };
   try{
    // Allocate the resolved draft identity before leaving the verified Resolution
    // modal. The Build handler consumes it exactly once; rollback clears it.
    resolutionDraftId=crypto.randomUUID();
    // A monotonic apply token makes the deferred rebuild callbacks single-use.
    // If navigation, rollback, or another Resolution invalidates this transaction,
    // stale queued callbacks are forbidden from generating or committing a plan.
    resolutionApplyToken=crypto.randomUUID();
    practiceResolutionApplyDraftId=resolutionDraftId;
    practiceResolutionApplyOwnedDraftId=resolutionDraftId;
    practiceResolutionApplyToken=resolutionApplyToken;
    const verifiedResolution=rollbackState?.resolution;
    if(!resolutionRollbackStateIsValid(rollbackState)||!verifiedResolution||!expected||!Array.isArray(verifiedResolution.practicePlayers)||!verifiedResolution.practicePlayers.length)throw new Error('Verified Practice Resolution snapshot was not available for rebuild.');
    const selectedNames=verifiedResolution.practicePlayers.map(player=>player.name);
    const startTime=verifiedResolution.startTime;
    // The automatic rebuild is driven only by the captured verified transaction.
    // Never fall back to mutable setup state after the coach has approved a change.
    practiceSetupState.selectedNames=selectedNames;practiceSetupState.startTime=startTime;
    practiceResolution=null;modal=null;
    // Do not persist this transient state. Until the resolved schedule has passed
    // its postcondition/rules audit and is committed, restart recovery must retain
    // the original verified Resolution transaction. Do not synchronously rebuild
    // #app from the Apply tap: iPhone Safari must finish that event turn first.
    const deferResolutionFrame=callback=>{
     if(typeof requestAnimationFrame==='function')requestAnimationFrame(()=>setTimeout(callback,0));
     else setTimeout(callback,16);
    };
    deferResolutionFrame(()=>{
     try{
      // The Resolution modal has now yielded its event turn. Publish the transient
      // setup only while this exact apply still owns the transaction; a stale frame
      // must never erase a newer screen.
      if(!transactionOwnsToken()){console.warn('HotB ignored a stale Practice Resolution setup-publication callback');return}
      try{render()}
      catch(error){
       console.error('HotB Practice Resolution could not open the verified rebuild setup',error);
       rollbackIfOwned('HotB could not start the rebuilt practice, so the coaching change was rolled back. Review Practice Resolution and try again.');
       return;
      }
      // Workspace teardown deliberately clears the global identities. A callback
      // that runs afterward is stale and must never resurrect the closed draft.
      if(!transactionOwnsToken()){console.warn('HotB ignored a stale Practice Resolution rebuild callback');return}
      if(!transactionIsCurrent()){
       console.error('HotB Practice Resolution apply lost draft authorization before rebuild');
       rollbackIfOwned('HotB could not verify the rebuilt practice, so the coaching change was rolled back. Review Practice Resolution and try again.');
       return;
      }
      const generate=$('#generatePractice');
      if(!generate)throw new Error('Generate Practice control was not found after resolution apply.');
      // The Build handler is asynchronous because Practice Resolution yields frames
      // on iPhone. Dispatch the click, then wait until that exact resolved build has
      // either produced its authorized plan or clearly finished/failed. The old
      // zero-ms verifier could race the async click handler and roll back a valid
      // Resolution before the plan had reached its commit boundary.
      generate.click();
      const waitForResolvedBuild=async()=>{
       const deadline=Date.now()+30000;
       while(Date.now()<deadline){
        if(!transactionOwnsToken())return false;
        if(practicePlan?.portalDraftId===resolutionDraftId)return true;
        // The automatic Build owns practiceResolutionApplyDraftId until it assigns
        // that exact identity to the finished plan. If the authorization disappears
        // without the plan, the build has definitively failed; otherwise keep waiting
        // across Safari frame yields rather than guessing from button DOM state.
        if(!practiceResolutionApplyDraftId)return false;
        await new Promise(resolve=>{
         if(typeof requestAnimationFrame==='function')requestAnimationFrame(()=>setTimeout(resolve,0));
         else setTimeout(resolve,16);
        });
       }
       return false;
      };
      deferResolutionFrame(async()=>{
       try{
       const buildReady=await waitForResolvedBuild();
       if(!buildReady){
        console.error('HotB Practice Resolution rebuild did not finish before verification');
        rollbackIfOwned('HotB could not verify the rebuilt practice, so the coaching change was rolled back. Review Practice Resolution and try again.');
        return;
       }
       if(!transactionOwnsToken()){console.warn('HotB ignored a stale Practice Resolution verification callback');return}
       if(!transactionIsCurrent()){
        console.error('HotB Practice Resolution rebuild lost its draft authorization');
        rollbackIfOwned('HotB could not verify the rebuilt practice, so the coaching change was rolled back. Review Practice Resolution and try again.');
        return;
       }
       let rebuiltSafe=!!practicePlan&&!practicePlan.feasibilityErrors?.length&&practicePlan.portalDraftId===resolutionDraftId&&resolutionPostcondition(expected);
       if(practicePlan&&practicePlan.portalDraftId!==resolutionDraftId)console.error('HotB Practice Resolution rebuilt plan changed draft identity');
       if(rebuiltSafe){
        // Re-run the immutable postcondition immediately before the authoritative
        // scheduler audit. This catches any synchronous mutation between the first
        // proof and commit preparation instead of relying on the earlier result.
        rebuiltSafe=resolutionPostcondition(expected);
       }
       if(rebuiltSafe){
        try{
         const audit=window.HotBPracticeScheduler?.validate?.(practicePlan);
         rebuiltSafe=Array.isArray(audit)&&audit.length===0;
         if(!rebuiltSafe)console.error('HotB Practice Resolution rebuilt plan failed final rules audit',audit);
        }catch(error){
         console.error('HotB Practice Resolution rebuilt plan final audit failed',error);
         rebuiltSafe=false;
        }
       }
       if(rebuiltSafe){
        // One final proof at the commit boundary: no render/bind/audit side effect
        // is allowed to change the resolved schedule after it was verified.
        rebuiltSafe=resolutionPostcondition(expected);
       }
       if(rebuiltSafe){
        // Commit the resolved setup only after the rebuilt schedule and full rules
        // audit both pass. Keep the apply lock held through persistence: the
        // transaction is not complete until restart recovery contains this exact
        // verified plan and setup.
        practiceSetupState.selectedNames=(practicePlan.players||[]).map(player=>player.name);
        practiceSetupState.startTime=practicePlan.startTime;
        practiceSetupState.durationMinutes=practicePlan.durationMinutes;
        if(persistPracticeSession()!==true){
         rebuiltSafe=false;
         console.error('HotB Practice Resolution rebuilt plan could not be committed to restart recovery');
        }else{
         let committed=null;
         try{committed=window.HotBPracticeSession?.restore?.(db.activePracticeSession)}
         catch(error){console.error('HotB Practice Resolution committed session restore failed',error);rebuiltSafe=false}
         const committedPlan=committed?.plan;
         if(rebuiltSafe&&(!committedPlan||committedPlan.portalDraftId!==resolutionDraftId)){
          rebuiltSafe=false;
          console.error('HotB Practice Resolution restart recovery did not retain the resolved draft identity');
         }else{
          const livePlan=practicePlan;
          let committedSafe=false;
          try{
           // Verify the serialized/restored copy without allowing an exception to
           // strand the global practicePlan on the recovery copy.
           practicePlan=committedPlan;
           committedSafe=resolutionPostcondition(expected);
          }finally{
           practicePlan=livePlan;
          }
          if(!committedSafe){
           rebuiltSafe=false;
           console.error('HotB Practice Resolution restart recovery failed the resolved postcondition');
          }
         }
        }
        // Persistence/restore verification can invoke application code. Re-check
        // ownership at the actual commit boundary so teardown or invalidation that
        // happens during recovery proof cannot be mistaken for a successful apply.
        if(rebuiltSafe&&!transactionIsCurrent()){
         rebuiltSafe=false;
         console.error('HotB Practice Resolution transaction changed during restart-recovery verification');
        }
        if(rebuiltSafe){
         // The complete committed session must survive production restore exactly.
         // A restore migration/default is not allowed to become the successful
         // restart authority for a Resolution apply.
         if(!committed||JSON.stringify(committed)!==JSON.stringify(db.activePracticeSession)){
          rebuiltSafe=false;
          console.error('HotB Practice Resolution committed session changed during restart restore');
         }
        }
        if(rebuiltSafe){
         // The recovery proof temporarily swaps practicePlan to the restored copy.
         // Prove that the live plan itself is still the exact session we committed
         // before consuming transaction ownership. A restore hook or later refactor
         // must never be able to validate one object and leave different live bytes.
         const committedSession=db.activePracticeSession;
         if(!committedSession||JSON.stringify(committedSession.plan)!==JSON.stringify(practicePlan)){
          rebuiltSafe=false;
          console.error('HotB Practice Resolution live plan changed after restart-recovery verification');
         }
        }
        if(rebuiltSafe){
         // Prepare the final UI while this transaction still owns its token. Rendering
         // is part of the commit handoff: if it throws, ownership remains available
         // to restore the sealed failed-practice snapshot instead of leaving a
         // committed session behind a broken/unreleased Resolution UI.
         modal=practicePlan?.buildNotices?.length?'practiceBuildNotice':null;
         // Match the normal iPhone build handoff: publish the verified committed
         // builder on a real paint frame instead of rewriting #app inside the same
         // async verification turn.
         await new Promise(resolve=>{
          if(typeof requestAnimationFrame==='function')requestAnimationFrame(()=>setTimeout(resolve,0));
          else setTimeout(resolve,16);
         });
         if(!transactionIsCurrent()){
          console.error('HotB Practice Resolution transaction changed before final committed render');
          rollbackIfOwned('HotB could not finish opening the verified rebuilt practice, so the coaching change was rolled back. Review Practice Resolution and try again.');
          return;
         }
         try{render();window.scrollTo(0,0)}
         catch(error){
          console.error('HotB Practice Resolution final committed plan render failed',error);
          rollbackIfOwned('HotB could not open the verified rebuilt practice, so the coaching change was rolled back. Review Practice Resolution and try again.');
          return;
         }
         if(!transactionIsCurrent()){
          console.error('HotB Practice Resolution transaction changed during final committed render');
          rollbackIfOwned('HotB could not finish opening the verified rebuilt practice, so the coaching change was rolled back. Review Practice Resolution and try again.');
          return;
         }
         // Consume the transaction identity only after the committed builder has
         // rendered successfully and ownership still matches this exact draft.
         practiceResolutionApplyDraftId=null;
         practiceResolutionApplyOwnedDraftId=null;
         practiceResolutionApplyToken=null;
         endResolutionApply();
         return
        }
       }
       console.error('HotB Practice Resolution rebuild did not produce a verified practice plan');
       rollbackIfOwned('HotB could not verify the rebuilt practice, so the coaching change was rolled back. Review Practice Resolution and try again.');
       }catch(error){
        console.error('HotB Practice Resolution verification callback failed',error);
        rollbackIfOwned('HotB could not verify the rebuilt practice, so the coaching change was rolled back. Review Practice Resolution and try again.');
       }
      },0);
     }catch(error){
      console.error('HotB Practice Resolution automatic rebuild failed',error);
      rollbackIfOwned('HotB could not verify the rebuilt practice, so the coaching change was rolled back. Review Practice Resolution and try again.');
     }
    },0);
   }catch(error){
    console.error('HotB Practice Resolution apply failed',error);
    if(rollbackInitialFailure()){
     const notify=()=>alert('HotB could not safely apply that resolution. The coaching change was rolled back.');
     if(typeof requestAnimationFrame==='function')requestAnimationFrame(()=>setTimeout(notify,0));else setTimeout(notify,16);
    }else if(!practiceResolutionApplyToken)endResolutionApply();
   }
  };
  const startVerifiedResolutionApply=(expectedFactory,mutate)=>{
   // One gate owns the full apply transition: snapshot -> lock UI -> derive immutable
   // expected state -> mutate -> rebuild. Return a reason, not a boolean: a verified
   // choice that hits an internal apply failure must roll back quietly and remain
   // available instead of being mislabeled as an unverified coaching choice.
   if(!practiceResolutionSnapshotIsCurrentAndValid())return {started:false,reason:'stale'};
   let rollbackState=null;
   try{
    rollbackState=resolutionRollbackState();
    if(!rollbackState||!resolutionRollbackStateIsValid(rollbackState))return {started:false,reason:'rollback'};
   }catch(error){
    console.error('HotB Practice Resolution rollback preparation failed',error);
    return {started:false,reason:'rollback'};
   }
   if(!beginResolutionApply())return {started:false,reason:'busy'};
   try{
    let lockedResolutionBytes='';
    try{lockedResolutionBytes=JSON.stringify(rollbackState.resolution)}catch(error){throw new Error('Practice Resolution locked snapshot could not be sealed.')}
    const expected=expectedFactory(rollbackState.resolution);
    if(!expected)throw new Error('Practice Resolution expected state could not be derived.');
    if(JSON.stringify(rollbackState.resolution)!==lockedResolutionBytes)throw new Error('Practice Resolution expected-state derivation changed the locked snapshot.');
    if(mutate(rollbackState.resolution)!==true)throw new Error('Practice Resolution mutation was rejected.');
    if(JSON.stringify(rollbackState.resolution)!==lockedResolutionBytes)throw new Error('Practice Resolution mutation changed the locked snapshot.');
    rebuildResolvedPractice(rollbackState,expected);
    return {started:true,reason:'started'};
   }catch(error){
    console.error('HotB Practice Resolution apply transition failed',error);
    if(!restoreResolutionRollback(rollbackState))endResolutionApply();
    return {started:false,reason:'apply'};
   }
  };
  const runVerifiedResolutionApply=(expectedFactory,mutate)=>{
   const result=startVerifiedResolutionApply(expectedFactory,mutate);
   if(result.started)return true;
   if(result.reason==='stale')rejectUnverifiedResolution();
   else if(result.reason==='busy')console.warn('HotB ignored a duplicate Practice Resolution apply while another apply is running.');
   else alert('HotB could not safely start that verified resolution. Your Practice Resolution was kept unchanged so you can try again.');
   return false;
  };
  const resolutionRollbackState=()=>{
   // Rollback is itself a transaction boundary. Capture only a fully verified
   // Resolution and seal the rollback payload so an interrupted/failed rebuild
   // cannot restore a different setup/session than the one the coach approved.
   if(!practiceResolutionSnapshotIsCurrentAndValid())return null;
   let state;
   try{
    state={setupState:structuredClone(practiceSetupState),resolution:structuredClone(practiceResolution),activePracticeSession:structuredClone(db.activePracticeSession)};
   }catch(error){
    // These transaction objects are persisted JSON data. If a browser/device
    // cannot structuredClone them, capture the rollback from one sealed JSON
    // serialization instead of allowing the Apply click to throw before a safe
    // rollback owner exists.
    console.error('HotB Practice Resolution rollback capture clone failed; attempting JSON capture',error);
    try{
     const captured=JSON.stringify({setupState:practiceSetupState,resolution:practiceResolution,activePracticeSession:db.activePracticeSession});
     state=JSON.parse(captured);
     if(JSON.stringify(state)!==captured)return null;
    }catch(captureError){
     console.error('HotB Practice Resolution rollback capture failed',captureError);
     return null;
    }
   }
   try{
    state.rollbackSignature=JSON.stringify({
     setupState:state.setupState,
     resolution:state.resolution,
     activePracticeSession:state.activePracticeSession
    });
   }catch(error){
    console.error('HotB Practice Resolution rollback signature sealing failed',error);
    return null;
   }
   if(!state.rollbackSignature)return null;
   return state;
  };
  const resolutionRollbackStateIsValid=state=>{
   if(!state||!state.setupState||!state.resolution||typeof state.rollbackSignature!=='string'||!state.rollbackSignature)return false;
   let signature='';
   try{
    signature=JSON.stringify({
     setupState:state.setupState,
     resolution:state.resolution,
     activePracticeSession:state.activePracticeSession
    });
   }catch(error){
    console.error('HotB rejected a Practice Resolution rollback snapshot that could not be sealed.',error);
    return false;
   }
   if(!signature||signature!==state.rollbackSignature)return false;
   const r=state.resolution,setup=state.setupState,players=r.practicePlayers;
   if(!Array.isArray(players)||!players.length||Number(r.durationMinutes)!==120||Number(setup.durationMinutes)!==120)return false;
   if(r.signature!==practiceResolutionSignature(players,r.startTime,r.durationMinutes)||r.decisionSignature!==practiceResolutionDecisionSignature(r))return false;
   // A rollback snapshot is useful only if its setup can recreate the exact failed
   // practice that produced the verified Resolution. Prove that relationship here
   // without consulting live/mutable UI state.
   const names=players.map(player=>player.name),nameSet=new Set(names),selected=Array.isArray(setup.selectedNames)?setup.selectedNames:[];
   if(names.length!==nameSet.size||selected.length!==names.length||new Set(selected).size!==selected.length||selected.some((name,index)=>name!==names[index]))return false;
   if(String(setup.startTime||'')!==String(r.startTime||''))return false;
   const accommodations=setup.accommodations;
   if(!accommodations||typeof accommodations!=='object'||Array.isArray(accommodations))return false;
   for(const player of players){
    const accommodation=accommodations[player.name];
    if(!accommodation||typeof accommodation!=='object')return false;
    const arrival=String(accommodation.arrival||''),departure=String(accommodation.departure||''),limitations=String(accommodation.limitations||'');
    const sourceRoster=practiceAttendanceRoster().filter(item=>item.name===player.name);
    if(sourceRoster.length!==1)return false;
    const rebuiltPlayer=practicePlayerModel(sourceRoster[0],accommodation,r.startTime,120);
    const sourceFields=['name','isPitcher','isCatcher','isGuest','availableFromBlock','availableUntilBlock','arrivalTime','departureTime','limitations','prePracticeComplete','canPitch','requiresPitchWarmup','canCatch'];
    if(sourceFields.some(field=>rebuiltPlayer[field]!==player[field]))return false;
    if(String(player.limitations||'')!==limitations)return false;
    if((accommodation.canPitch===true)!==(player.canPitch===true)||(accommodation.requiresPitchWarmup===true)!==(player.requiresPitchWarmup===true)||(accommodation.canCatch===true)!==(player.canCatch===true)||(accommodation.prePracticeComplete===true)!==(player.prePracticeComplete===true))return false;
    if(accommodation.canPitch!==true&&accommodation.requiresPitchWarmup===true)return false;
   }
   // The failed Resolution was persisted before its modal was exposed, so rollback
   // authority must always include that exact setup-stage recovery record. Accepting
   // null, plan-stage, or unknown session data here would allow an apply to start
   // without a restart-safe copy of the original failed practice.
   const saved=state.activePracticeSession;
   if(!saved||saved.stage!=='setup'||saved.plan)return false;
   // Validate the persisted recovery record through the same restore path startup
   // will actually use. Raw object equality alone is not enough if restore rejects
   // or migrates the session.
   let restoredSaved;
   try{restoredSaved=window.HotBPracticeSession?.restore?.(saved)}
   catch(error){console.error('HotB rejected a Practice Resolution rollback whose saved recovery record could not be restored.',error);return false}
   if(!restoredSaved||restoredSaved.stage!=='setup'||restoredSaved.plan)return false;
   try{
    if(JSON.stringify(restoredSaved)!==JSON.stringify(saved))return false;
    if(!saved.setupState||String(saved.setupState.startTime||'')!==String(setup.startTime||'')||Number(saved.setupState.durationMinutes)!==120)return false;
    const savedNames=Array.isArray(saved.setupState.selectedNames)?saved.setupState.selectedNames:[];
    if(savedNames.length!==names.length||new Set(savedNames).size!==savedNames.length||savedNames.some((name,index)=>name!==names[index]))return false;
    // Rollback recovery is the exact persisted transaction, not merely a session
    // carrying equivalent signatures. Reject restore/default/migration drift here.
    if(!saved.resolution||JSON.stringify(saved.resolution)!==JSON.stringify(r))return false;
    if(JSON.stringify(saved.setupState)!==JSON.stringify(setup))return false;
   }catch(error){
    console.error('HotB rejected a Practice Resolution rollback whose recovery equality proof could not be sealed.',error);
    return false;
   }
   return true;
  };
  const awaitPracticeResolutionPaint=callback=>{
   const run=()=>{try{callback()}catch(error){console.error('HotB Practice Resolution paint callback failed',error)}};
   if(typeof requestAnimationFrame==='function')requestAnimationFrame(()=>setTimeout(run,0));
   else setTimeout(run,16);
  };
  const restoreResolutionRollback=state=>{
   const releaseFailedRollback=message=>{
    console.error(message);
    // If exact rollback recovery is impossible, never release the transaction with
    // its temporary Block 11 or role mutation still installed. Prefer reconstructing
    // the ordinary 120-minute setup from the sealed rollback source; if even that
    // cannot be cloned, clear recovery authority rather than exposing partial state.
    // Invalidate transaction ownership first so any already-queued iPhone frame or
    // verification callback becomes stale before rollback touches live state.
    let safeSetup=null;
    try{safeSetup=state?.setupState?structuredClone(state.setupState):null}catch(error){console.error('HotB could not reconstruct the ordinary setup after rollback failure.',error)}
    practiceResolutionApplyDraftId=null;practiceResolutionApplyOwnedDraftId=null;practiceResolutionApplyToken=null;practicePlan=null;
    practiceResolution=null;modal=null;
    if(safeSetup&&Number(safeSetup.durationMinutes)===120)practiceSetupState=safeSetup;
    else if(Number(practiceSetupState.durationMinutes)!==120)practiceSetupState.durationMinutes=120;
    db.activePracticeSession=null;
    try{save()}catch(error){console.error('HotB could not clear failed Practice Resolution recovery authority.',error)}
    endResolutionApply();
   };
   if(!resolutionRollbackStateIsValid(state)){releaseFailedRollback('HotB refused an invalid Practice Resolution rollback snapshot');return false}
   let restoredSetup,restoredResolution,restoredSession;
   try{
    restoredSetup=structuredClone(state.setupState);restoredResolution=structuredClone(state.resolution);restoredSession=structuredClone(state.activePracticeSession);
   }catch(error){
    console.error('HotB Practice Resolution rollback clone failed; attempting sealed JSON recovery',error);
    // rollbackSignature is already proven byte-identical to the snapshot above.
    // It is therefore a safe, deterministic fallback when structuredClone itself
    // is unavailable or fails on a device.
    try{
     const sealed=JSON.parse(state.rollbackSignature);
     if(JSON.stringify(sealed)!==state.rollbackSignature||!sealed?.setupState||!sealed?.resolution)throw new Error('rollback-signature-roundtrip-failed');
     restoredSetup=sealed.setupState;restoredResolution=sealed.resolution;restoredSession=sealed.activePracticeSession;
    }catch(sealedError){
     console.error('HotB Practice Resolution sealed rollback recovery failed',sealedError);
     releaseFailedRollback('HotB could not recover the sealed Practice Resolution rollback snapshot');
     return false;
    }
   }
   // Validate the clones that will actually become live state. A rollback is atomic
   // only if cloning itself preserves the sealed failed-practice snapshot.
   try{
    if(JSON.stringify(restoredSetup)!==JSON.stringify(state.setupState)||JSON.stringify(restoredResolution)!==JSON.stringify(state.resolution)||JSON.stringify(restoredSession)!==JSON.stringify(state.activePracticeSession)){releaseFailedRollback('HotB refused a Practice Resolution rollback that changed during cloning');return false}
   }catch(error){
    console.error('HotB Practice Resolution rollback clone equality proof failed.',error);
    releaseFailedRollback('HotB refused a Practice Resolution rollback whose cloned recovery state could not be sealed');
    return false;
   }
   // Revoke the apply identities before installing rollback state. Deferred build
   // and verification callbacks check these identities and therefore cannot race
   // the restored Resolution once this atomic handoff begins.
   practiceResolutionApplyDraftId=null;
   practiceResolutionApplyOwnedDraftId=null;
   practiceResolutionApplyToken=null;
   practicePlan=null;
   practiceSetupState=restoredSetup;
   practiceResolution=restoredResolution;
   modal='practiceResolution';
   db.activePracticeSession=restoredSession;
   try{save()}catch(error){
    releaseFailedRollback('HotB could not save the restored Practice Resolution rollback state');
    // releaseFailedRollback has already normalized and unlocked state. Publish that
    // safe setup on a fresh frame instead of synchronously rewriting #app here.
    awaitPracticeResolutionPaint(()=>render());
    return false;
   }
   // save() must not mutate the rollback object or its persisted recovery record.
   let restoredRollbackSession=null,rollbackPostSaveExact=false;
   try{
    restoredRollbackSession=window.HotBPracticeSession?.restore?.(db.activePracticeSession);
    rollbackPostSaveExact=!!restoredRollbackSession&&JSON.stringify(db.activePracticeSession)===JSON.stringify(restoredSession)&&JSON.stringify(restoredRollbackSession)===JSON.stringify(restoredSession);
   }catch(error){console.error('HotB Practice Resolution rollback post-save restore or equality proof failed.',error)}
   if(!practiceResolutionSnapshotIsCurrentAndValid(practiceResolution)||!rollbackPostSaveExact){
    console.error('HotB Practice Resolution rollback failed post-save verification');
    // Do not keep displaying a Resolution whose recovery record no longer proves
    // the same transaction. Normalize the live setup before releasing control.
    practiceResolution=null;modal=null;practicePlan=null;
    if(Number(practiceSetupState.durationMinutes)!==120)practiceSetupState.durationMinutes=120;
    // Never leave a failed/partially restored Resolution session as restart
    // authority after exact rollback verification fails.
    if(db.activePracticeSession?.resolution||db.activePracticeSession?.plan){
     db.activePracticeSession=null;
     try{save()}catch(error){console.error('HotB could not clear invalid Practice Resolution rollback recovery.',error)}
    }
    // Keep the apply lock through the recovery render. A real paint-frame handoff
    // prevents the same iPhone tap/async turn from tearing down and rebuilding #app
    // while rollback persistence is still settling.
    awaitPracticeResolutionPaint(()=>{
     try{render()}
     finally{endResolutionApply()}
    });
    return false
   }
   // Keep the apply lock through post-save restart verification and rendering.
   // Publish rollback on a real browser frame for the same reason as successful
   // Resolution publication: iPhone Safari must finish the current event turn first.
   awaitPracticeResolutionPaint(()=>{
    try{render()}
    catch(error){
     releaseFailedRollback('HotB could not render the restored Practice Resolution rollback state');
     // releaseFailedRollback clears transaction ownership; show the normalized
     // setup on the following frame so a broken Resolution modal cannot remain.
     awaitPracticeResolutionPaint(()=>render());
     return;
    }
    endResolutionApply();
   });
   return true;
  };
  const expectedResolutionState=(role=null,name=null,withBlock11=false,resolutionSnapshot=practiceResolution)=>{
   // Expected postconditions must come from the immutable pre-mutation snapshot.
   // In particular, role accommodations and Block 11 duration are changed before
   // rebuild starts; deriving expectations from mutable setup after that point can
   // accidentally bless state that was never part of the verified Resolution.
   if(!resolutionSnapshot||!Array.isArray(resolutionSnapshot.practicePlayers)||!resolutionSnapshot.practicePlayers.length)return null;
   const basePlayers=resolutionSnapshot.practicePlayers,durationMinutes=withBlock11?132:Number(resolutionSnapshot.durationMinutes),verifiedStart=String(resolutionSnapshot.startTime||'');
   if((durationMinutes!==120&&durationMinutes!==132)||!verifiedStart)return null;
   const expectedPlayers=withBlock11?practiceResolutionExtendedPlayers(basePlayers,verifiedStart):basePlayers;
   const expectedBlockCount=durationMinutes===132?11:10;
   if(expectedPlayers.length!==basePlayers.length||!expectedPlayers.every(player=>{
    if(!Number.isInteger(Number(player.availableFromBlock))||!Number.isInteger(Number(player.availableUntilBlock))||Number(player.availableFromBlock)<0||Number(player.availableUntilBlock)>expectedBlockCount||Number(player.availableFromBlock)>=Number(player.availableUntilBlock))return false;
    const availability=practiceAvailability(verifiedStart,durationMinutes,player.arrivalTime,player.departureTime);
    return Number(player.availableFromBlock)===Number(availability.availableFromBlock)&&Number(player.availableUntilBlock)===Number(availability.availableUntilBlock);
   }))return null;
   const candidateLabel=role==='pitcher'?(withBlock11?'Hitting Only + Block 11: ':'Hitting Only: ')+name:role==='catcher'?(withBlock11?'Not Catching + Block 11: ':'Not Catching: ')+name:withBlock11?'Block 11':null;
   const noticeMap=resolutionSnapshot.candidateNotices;
   if(!candidateLabel||!noticeMap||!Object.prototype.hasOwnProperty.call(noticeMap,candidateLabel)||!Array.isArray(noticeMap[candidateLabel]))return null;
   // Expected-state construction is also an authorization boundary. Do not derive
   // a postcondition for a label that is merely present in candidateNotices; the
   // exact choice must still be one of the sealed final coaching alternatives.
   const choiceAuthorized=role==='pitcher'
    ?(withBlock11?resolutionSnapshot.combinedPitchers:resolutionSnapshot.pitchers)?.includes(name)
    :role==='catcher'
     ?(withBlock11?resolutionSnapshot.combinedCatchers:resolutionSnapshot.catchers)?.includes(name)
     :withBlock11&&resolutionSnapshot.canExtend===true;
   if(!choiceAuthorized)return null;
   return {role,name,startTime:verifiedStart,durationMinutes,playerNames:basePlayers.map(player=>player.name),expectedNotices:[...noticeMap[candidateLabel]],availability:Object.fromEntries(expectedPlayers.map(player=>[player.name,{availableFromBlock:player.availableFromBlock,availableUntilBlock:player.availableUntilBlock,arrivalTime:player.arrivalTime||'',departureTime:player.departureTime||'',limitations:String(player.limitations||'')}])),baselineRoles:Object.fromEntries(basePlayers.map(player=>[player.name,{canPitch:player.canPitch===true,requiresPitchWarmup:player.requiresPitchWarmup===true,canCatch:player.canCatch===true,prePracticeComplete:player.prePracticeComplete===true,isPitcher:player.isPitcher===true,isCatcher:player.isCatcher===true,isGuest:player.isGuest===true}]))};
  };
  const applyResolutionAccommodation=(name,role,withBlock11=false)=>{
   // This is the mutation boundary for a verified coaching choice. Re-check the
   // complete snapshot here even though the button handler already verified it.
   if(!practiceResolutionSnapshotIsCurrentAndValid())return false;
   if(role!=='pitcher'&&role!=='catcher')return false;
   if(typeof withBlock11!=='boolean')return false;
   if(withBlock11&&Number(practiceResolution.durationMinutes)!==120)return false;
   if(withBlock11){
    const extended=practiceResolutionExtendedPlayers(practiceResolution.practicePlayers||[],practiceResolution.startTime);
    if(extended.length!==(practiceResolution.practicePlayers||[]).length||extended.some(player=>Number(player.availableFromBlock)<0||Number(player.availableUntilBlock)<0))return false;
   }
   const target=findResolutionRosterIndex(name,role);if(!target)return false;
   const verifiedPlayers=(practiceResolution.practicePlayers||[]).filter(player=>player.name===name);
   if(verifiedPlayers.length!==1)return false;
   const verifiedPlayer=verifiedPlayers[0];
   // Preserve the exact availability/limitation state that was audited. Only the
   // coach-approved role flag is allowed to change during resolution.
   let accommodation;
   try{accommodation=structuredClone(practiceSetupState.accommodations?.[name]||practiceAccommodation(target.roster[target.index]))}
   catch(error){console.error('HotB Practice Resolution accommodation clone failed',error);return false}
   // The accommodation being mutated must still recreate the exact verified source
   // player. Otherwise a stale/malformed setup object could receive the approved
   // role change even though that exact state was never candidate-verified.
   const sourceModel=practicePlayerModel(target.roster[target.index],accommodation,practiceResolution.startTime,practiceResolution.durationMinutes);
   const sourceFields=['name','isPitcher','isCatcher','isGuest','availableFromBlock','availableUntilBlock','arrivalTime','departureTime','limitations','prePracticeComplete','canPitch','requiresPitchWarmup','canCatch'];
   if(sourceFields.some(field=>sourceModel[field]!==verifiedPlayer[field]))return false;
   if(role==='pitcher'){if(!verifiedPlayer.canPitch)return false;accommodation.canPitch=false;accommodation.requiresPitchWarmup=false}
   else if(role==='catcher'){if(!verifiedPlayer.canCatch)return false;accommodation.canCatch=false}
   practiceSetupState.accommodations[name]=accommodation;
   practiceSetupState.durationMinutes=withBlock11?132:Number(practiceResolution.durationMinutes);
   return true;
  };
  $('#applyPracticePitcherResolution')?.addEventListener('click',()=>{if(!resolutionStillCurrent())return;
   const picked=$('input[name="practiceResolutionPitcher"]:checked')?.value;if(!picked){alert('Choose the pitcher who will be Hitting Only for this practice.');return}if(!verifiedResolutionChoice('pitcher',picked)){rejectUnverifiedResolution();return}runVerifiedResolutionApply(snapshot=>expectedResolutionState('pitcher',picked,false,snapshot),()=>applyResolutionAccommodation(picked,'pitcher'));
  });
  $('#applyPracticeCatcherResolution')?.addEventListener('click',()=>{if(!resolutionStillCurrent())return;
   const picked=$('input[name="practiceResolutionCatcher"]:checked')?.value;if(!picked){alert('Choose the catcher who will not catch this practice.');return}if(!verifiedResolutionChoice('catcher',picked)){rejectUnverifiedResolution();return}runVerifiedResolutionApply(snapshot=>expectedResolutionState('catcher',picked,false,snapshot),()=>applyResolutionAccommodation(picked,'catcher'));
  });
  $('#applyPracticeExtensionResolution')?.addEventListener('click',()=>{if(!resolutionStillCurrent())return;if(!verifiedResolutionChoice('extension')){rejectUnverifiedResolution();return}runVerifiedResolutionApply(snapshot=>expectedResolutionState(null,null,true,snapshot),snapshot=>{if(Number(snapshot.durationMinutes)!==120||snapshot.canExtend!==true)return false;const extended=practiceResolutionExtendedPlayers(snapshot.practicePlayers||[],snapshot.startTime);if(extended.length!==(snapshot.practicePlayers||[]).length||extended.some(player=>Number(player.availableFromBlock)<0||Number(player.availableUntilBlock)<0))return false;practiceSetupState.durationMinutes=132;return true})});
  $('#applyPracticeCombinedResolution')?.addEventListener('click',()=>{if(!resolutionStillCurrent())return;
   const picked=$('input[name="practiceResolutionCombinedPitcher"]:checked')?.value;if(!picked){alert('Choose the pitcher who will be Hitting Only for this practice.');return}if(!verifiedResolutionChoice('combinedPitcher',picked)){rejectUnverifiedResolution();return}runVerifiedResolutionApply(snapshot=>expectedResolutionState('pitcher',picked,true,snapshot),()=>applyResolutionAccommodation(picked,'pitcher',true));
  });
  $('#applyPracticeCombinedCatcherResolution')?.addEventListener('click',()=>{if(!resolutionStillCurrent())return;
   const picked=$('input[name="practiceResolutionCombinedCatcher"]:checked')?.value;if(!picked){alert('Choose the catcher who will not catch this practice.');return}if(!verifiedResolutionChoice('combinedCatcher',picked)){rejectUnverifiedResolution();return}runVerifiedResolutionApply(snapshot=>expectedResolutionState('catcher',picked,true,snapshot),()=>applyResolutionAccommodation(picked,'catcher',true));
  });
  $('#returnPracticeAttendance')?.addEventListener('click',()=>{
   // Return to setup is a destructive exit from the verified decision context.
   // It must never race an apply that already owns rollback/commit state.
   if(practiceResolutionApplyToken||practiceResolutionApplyDraftId||practiceResolutionApplyOwnedDraftId){console.warn('HotB ignored Return to Practice Setup while Practice Resolution apply is verifying.');return}
   let originalSetup,originalResolution,originalSession,originalModal=modal,originalReturnBytes='';
   try{
    originalReturnBytes=JSON.stringify({setupState:practiceSetupState,resolution:practiceResolution,activePracticeSession:db.activePracticeSession});
    const sealed=JSON.parse(originalReturnBytes);
    if(JSON.stringify(sealed)!==originalReturnBytes)throw new Error('return-state-roundtrip-failed');
    originalSetup=sealed.setupState;originalResolution=sealed.resolution;originalSession=sealed.activePracticeSession;
   }catch(error){console.error('HotB refused Return to Practice Setup because its rollback state could not be sealed.',error);return}
   const restoreReturnState=()=>{
    try{
     const sealed=JSON.parse(originalReturnBytes);
     if(JSON.stringify(sealed)!==originalReturnBytes)throw new Error('return-state-restore-roundtrip-failed');
     practiceSetupState=sealed.setupState;practiceResolution=sealed.resolution;db.activePracticeSession=sealed.activePracticeSession;modal=originalModal;
     save();
     if(JSON.stringify({setupState:practiceSetupState,resolution:practiceResolution,activePracticeSession:db.activePracticeSession})!==originalReturnBytes||JSON.stringify(db.activePracticeSession)!==JSON.stringify(originalSession))throw new Error('return-state-post-save-drift');
     return true;
    }catch(error){console.error('HotB could not restore the sealed Practice Resolution Return-to-Setup state.',error);practiceResolution=null;modal=null;practicePlan=null;if(Number(practiceSetupState.durationMinutes)!==120)practiceSetupState.durationMinutes=120;db.activePracticeSession=null;try{save()}catch(clearError){console.error('HotB could not clear failed Return-to-Setup recovery authority.',clearError)}return false}
   };
   // Build the ordinary setup locally. Nothing live changes until the failed
   // practice has been reconstructed and its safety signature matches exactly.
   const verifiedResolution=practiceResolutionSnapshotIsCurrentAndValid()?practiceResolution:null;
   if(verifiedResolution){
    const verifiedPlayers=verifiedResolution.practicePlayers,roster=practiceAttendanceRoster();
    let nextSetup,nextAccommodations;
    try{nextSetup=structuredClone(practiceSetupState);nextAccommodations=structuredClone(nextSetup.accommodations||{})}
    catch(error){console.error('HotB refused Return to Practice Setup because the verified setup could not be cloned.',error);return}
    nextSetup.selectedNames=verifiedPlayers.map(player=>player.name);
    nextSetup.startTime=verifiedResolution.startTime;
    nextSetup.durationMinutes=verifiedResolution.durationMinutes;
    for(const player of verifiedPlayers){
     const rosterPlayer=roster.find(item=>item.name===player.name);
     if(!rosterPlayer){console.error('HotB refused Return to Practice Setup because a verified player is no longer in the attendance roster.');return}
     let accommodation;
     try{accommodation=structuredClone(nextAccommodations[player.name]||practiceAccommodation(rosterPlayer))}
     catch(error){console.error('HotB refused Return to Practice Setup because a verified accommodation could not be cloned.',error);return}
     accommodation.arrival=player.arrivalTime||'';
     accommodation.departure=player.departureTime||'';
     accommodation.limitations=String(player.limitations||'');
     accommodation.canPitch=player.canPitch===true;
     accommodation.requiresPitchWarmup=player.requiresPitchWarmup===true;
     accommodation.canCatch=player.canCatch===true;
     accommodation.prePracticeComplete=player.prePracticeComplete===true;
     nextAccommodations[player.name]=accommodation;
    }
    nextSetup.accommodations=nextAccommodations;
    const reconstructed=verifiedPlayers.map(player=>{
     const rosterPlayer=roster.find(item=>item.name===player.name);
     return rosterPlayer?practicePlayerModel(rosterPlayer,nextAccommodations[player.name]||practiceAccommodation(rosterPlayer),verifiedResolution.startTime,verifiedResolution.durationMinutes):null;
    });
    if(reconstructed.some(player=>!player)||practiceResolutionSignature(reconstructed,verifiedResolution.startTime,verifiedResolution.durationMinutes)!==verifiedResolution.signature){
     console.error('HotB refused Return to Practice Setup because the verified failed practice could not be reconstructed.');
     return;
    }
    practiceSetupState=nextSetup;
   }else if(Number(practiceSetupState.durationMinutes)===132){
    // A corrupt/stale Resolution is not authority for emergency Block 11.
    let normalizedSetup;
    try{normalizedSetup=structuredClone(practiceSetupState)}
    catch(error){console.error('HotB refused Return to Practice Setup because stale Block 11 state could not be cloned.',error);return}
    normalizedSetup.durationMinutes=120;practiceSetupState=normalizedSetup;
   }
   practiceResolution=null;modal=null;
   if(persistPracticeDraft()!==true){
    console.error('HotB could not persist Return to Practice Setup after Practice Resolution.');
    restoreReturnState();render();return
   }
   // Prove persistence did not rewrite the ordinary setup. If it did, restore the
   // exact pre-exit Resolution transaction instead of silently losing recovery.
   let restoredExit=null;
   try{restoredExit=window.HotBPracticeSession?.restore?.(db.activePracticeSession)}
   catch(error){console.error('HotB Return to Practice Setup restart restore failed.',error)}
   if(!restoredExit||restoredExit.stage!=='setup'||restoredExit.plan||restoredExit.resolution||JSON.stringify(restoredExit)!==JSON.stringify(db.activePracticeSession)||JSON.stringify(restoredExit.setupState)!==JSON.stringify(practiceSetupState)){
    console.error('HotB rolled back Return to Practice Setup because recovery changed the ordinary setup.');
    restoreReturnState();render();return
   }
   render();window.scrollTo(0,0);
  });
 }
 $('#openCloudBackup')?.addEventListener('click',()=>{modal='cloudBackup';render()});
 $('#openRecoveryGuide')?.addEventListener('click',()=>{modal='recoveryGuide';render()});
}

function stopPracticeClock(){
 if(practiceClockTimer)clearInterval(practiceClockTimer);
 practiceClockTimer=null;practiceClock={running:false,finished:false,endAnnounced:false,startAt:0,lastBlock:1,lastTwoMinuteBlock:0,lastTransitionBlock:0,completedAt:null};
 if('speechSynthesis'in window)window.speechSynthesis.cancel();
}
function persistPracticeSession(){
 if(!practicePlan||!window.HotBPracticeSession)return;
 // activePortalPractice already lives at the DB root. Do not duplicate that
 // publication record inside every saved practice session; restore can use the
 // root pointer and older sessions with portalState remain backward compatible.
 let session;
 try{session=window.HotBPracticeSession.create({plan:practicePlan,chosenDrills:practiceChosenDrills,draftDrills:practiceDraftDrills,drillPickerOpen:practiceDrillPickerOpen,equipmentSetupOpen:practiceEquipmentSetupOpen,setupState:practiceSetupState,clock:practiceClock,portalState:null})}
 catch(error){console.error('HotB could not create the practice recovery session.',error);return false}
 if(!session?.plan?.portalDraftId||session.plan.portalDraftId!==practicePlan.portalDraftId){console.error('HotB refused to persist an incomplete practice session');return false}
 let serializedSession='';
 try{serializedSession=JSON.stringify(session)}catch(error){console.error('HotB could not seal the practice recovery session.',error);return false}
 if(!serializedSession){console.error('HotB refused an empty practice recovery session.');return false}
 // Persisting while a Resolution transaction is still open is allowed only for
 // the exact plan owned by that transaction. This prevents unrelated UI work from
 // becoming the restart-recovery session during the commit window.
 if(practiceResolutionApplyToken&&(!practiceResolutionApplyOwnedDraftId||!practicePlan.portalDraftId||practicePlan.portalDraftId!==practiceResolutionApplyOwnedDraftId)){console.error('HotB refused to persist a practice outside the active Resolution transaction');return false}
 let previousActivePracticeSession=null,previousActivePracticeSessionBytes='';
 try{
  previousActivePracticeSessionBytes=JSON.stringify(db.activePracticeSession);
  previousActivePracticeSession=previousActivePracticeSessionBytes?JSON.parse(previousActivePracticeSessionBytes):null;
 }catch(error){console.error('HotB refused to replace a practice recovery session whose previous authority could not be sealed.',error);return false}
 const restorePreviousSessionAfterFailure=(message,error=null)=>{
  if(error)console.error(message,error);else console.error(message);
  db.activePracticeSession=previousActivePracticeSession;
  try{
   save();
   const restoredPreviousBytes=JSON.stringify(db.activePracticeSession);
   if(restoredPreviousBytes!==previousActivePracticeSessionBytes)throw new Error('resolved-session-rollback-save-drift');
  }catch(restoreError){console.error('HotB could not restore the previous practice recovery session after resolved-session persistence failure.',restoreError)}
  return false;
 };
 db.activePracticeSession=session;
 try{save()}catch(error){return restorePreviousSessionAfterFailure('HotB could not save the practice recovery session.',error)}
 let persistedSessionBytes='';
 try{persistedSessionBytes=JSON.stringify(db.activePracticeSession)}
 catch(error){return restorePreviousSessionAfterFailure('HotB could not seal the saved practice recovery session.',error)}
 if(persistedSessionBytes!==serializedSession)return restorePreviousSessionAfterFailure('HotB practice persistence changed the session during save');
 // Persistence success means the exact serialized session is immediately
 // restorable, not merely that an object was assigned to db.
 let restored=null;
 try{restored=window.HotBPracticeSession.restore?.(db.activePracticeSession)}
 catch(error){return restorePreviousSessionAfterFailure('HotB could not restore the practice session it just persisted',error)}
 if(!restored?.plan?.portalDraftId||restored.plan.portalDraftId!==practicePlan.portalDraftId||JSON.stringify(restored)!==serializedSession)return restorePreviousSessionAfterFailure('HotB could not restore the exact practice session it just persisted')
 // A Resolution commit is not allowed to report persistence success merely because
 // the draft ID survived serialization. Its setup identity must survive too; the
 // full resolved-plan postcondition is checked by the owning transaction immediately
 // after this function returns.
 if(practiceResolutionApplyToken){
  const restoredSetup=restored.setupState||{},liveNames=(practicePlan.players||[]).map(player=>player.name),savedNames=Array.isArray(restoredSetup.selectedNames)?restoredSetup.selectedNames:[];
  if(String(restoredSetup.startTime||'')!==String(practicePlan.startTime||'')||Number(restoredSetup.durationMinutes)!==Number(practicePlan.durationMinutes)||savedNames.length!==liveNames.length||new Set(savedNames).size!==savedNames.length||savedNames.some((name,index)=>name!==liveNames[index])){
   return restorePreviousSessionAfterFailure('HotB Practice Resolution restart recovery changed the resolved setup identity');
  }
  if(JSON.stringify(restored.plan)!==JSON.stringify(practicePlan))return restorePreviousSessionAfterFailure('HotB Practice Resolution restart recovery changed the resolved plan bytes');
 }
 return true;
}
function persistPracticeDraft(){
 if(practicePlan||db.activePortalPractice?.id||!window.HotBPracticeSession?.createDraft)return;
 // An apply transaction owns persistence until it either commits the verified plan
 // or restores the original failed draft. Never serialize its temporary 132-minute
 // duration/role mutation as an ordinary setup draft from an unrelated render path.
 if(practiceResolutionApplyToken||practiceResolutionApplyDraftId||practiceResolutionApplyOwnedDraftId){console.warn('HotB deferred setup-draft persistence during Practice Resolution apply.');return false}
 const checkboxes=$$('[data-practice-player]');
 if(checkboxes.length){const roster=practiceAttendanceRoster();practiceSetupState.selectedNames=checkboxes.filter(input=>input.checked).map(input=>roster[Number(input.dataset.practicePlayer)]?.name).filter(Boolean)}
 const start=$('#practiceStartTime')?.value;if(start)practiceSetupState.startTime=start;
 const duration=Number($('#practiceDuration')?.value);if(duration)practiceSetupState.durationMinutes=duration;
 // Persistence is the final setup-state gate. First reject stale Resolution data,
 // then normalize duration against the surviving transaction. The order matters:
 // a stale 132-minute snapshot must not leave an emergency Block 11 duration behind.
 if(practiceResolution&&!practiceResolutionSnapshotIsCurrentAndValid(practiceResolution)){
  console.warn('HotB discarded stale Practice Resolution before saving the setup draft.');
  practiceResolution=null;
  if(modal==='practiceResolution')modal=null;
 }
 // Setup drafts never persist the temporary 132-minute apply state. A verified
 // Resolution snapshot itself is also defined as the failed 120-minute source.
 if(Number(practiceSetupState.durationMinutes)!==120)practiceSetupState.durationMinutes=120;
 let resolutionToPersist=null;
 if(practiceResolutionSnapshotIsCurrentAndValid(practiceResolution)){
  try{resolutionToPersist=structuredClone(practiceResolution)}
  catch(error){console.error('HotB refused to persist Practice Resolution because its verified decision could not be cloned.',error);return false}
 }
 let draft;
 try{draft=window.HotBPracticeSession.createDraft({setupState:practiceSetupState,resolution:resolutionToPersist})}
 catch(error){console.error('HotB refused to persist Practice Resolution because its recovery draft could not be created.',error);return false}
 if(!draft||draft.stage!=='setup'||draft.plan){console.error('HotB refused an invalid Practice Resolution recovery draft.');return false}
 // The live Resolution was already fully validated and decision-sealed before this
 // function is called. Persistence therefore proves the recovery envelope and exact
 // decision identity once, rather than restoring/stringifying the entire 13-player
 // draft several times on the iPhone main thread.
 let serializedDraft='',resolutionBytes='';
 try{
  serializedDraft=JSON.stringify(draft);
  if(resolutionToPersist)resolutionBytes=JSON.stringify(resolutionToPersist);
 }catch(error){console.error('HotB refused to persist Practice Resolution because its setup draft could not be sealed.',error);return false}
 if(!serializedDraft)return false;
 let previousActivePracticeSession=null,previousActivePracticeSessionBytes='';
 try{
  previousActivePracticeSessionBytes=JSON.stringify(db.activePracticeSession);
  previousActivePracticeSession=previousActivePracticeSessionBytes?JSON.parse(previousActivePracticeSessionBytes):null;
 }catch(error){console.error('HotB refused to replace a setup recovery draft whose previous authority could not be sealed.',error);return false}
 const restorePreviousDraftAfterFailure=(message,error=null)=>{
  if(error)console.error(message,error);else console.error(message);
  db.activePracticeSession=previousActivePracticeSession;
  try{
   save();
   const restoredPreviousBytes=JSON.stringify(db.activePracticeSession);
   if(restoredPreviousBytes!==previousActivePracticeSessionBytes)throw new Error('setup-draft-rollback-save-drift');
  }catch(restoreError){console.error('HotB could not restore the previous practice recovery session after setup-draft persistence failure.',restoreError)}
  return false;
 };
 db.activePracticeSession=draft;
 try{save()}catch(error){return restorePreviousDraftAfterFailure('HotB Practice Resolution setup draft save failed.',error)}
 // save() is part of the Resolution recovery transaction. Verify only the fields
 // that authorize recovery. This keeps rollback protection while eliminating the
 // duplicate full-session restore/serialization pass that could strand Safari.
 const persisted=db.activePracticeSession,persistedResolution=persisted?.resolution;
 if(!persisted||persisted.stage!=='setup'||persisted.plan)return restorePreviousDraftAfterFailure('HotB Practice Resolution saved an invalid setup draft.');
 if(resolutionToPersist){
  if(!persistedResolution||persistedResolution.signature!==resolutionToPersist.signature||persistedResolution.decisionSignature!==resolutionToPersist.decisionSignature)return restorePreviousDraftAfterFailure('HotB Practice Resolution saved decision identity changed during save.');
  let persistedResolutionBytes='';
  try{persistedResolutionBytes=JSON.stringify(persistedResolution)}
  catch(error){return restorePreviousDraftAfterFailure('HotB Practice Resolution saved decision could not be sealed.',error)}
  if(persistedResolutionBytes!==resolutionBytes)return restorePreviousDraftAfterFailure('HotB Practice Resolution saved decision changed during save.');
 }
 return true;
}
function clearPracticeSession(){
 if(db.activePracticeSession==null)return true;
 if(practicePlan&&db.activePracticeSession?.plan?.portalDraftId&&db.activePracticeSession.plan.portalDraftId!==practicePlan.portalDraftId)return false;
 let previousSession=null,previousSessionBytes='';
 try{
  previousSessionBytes=JSON.stringify(db.activePracticeSession);
  previousSession=JSON.parse(previousSessionBytes);
 }catch(error){console.error('HotB refused to clear a practice recovery session that could not be sealed.',error);return false}
 if(!previousSessionBytes)return false;
 const restorePreviousSession=(message,error=null)=>{
  if(error)console.error(message,error);else console.error(message);
  db.activePracticeSession=previousSession;
  try{save()}catch(restoreError){console.error('HotB could not restore the previous practice recovery session after clear failure.',restoreError)}
  return false;
 };
 db.activePracticeSession=null;
 try{save()}
 catch(error){return restorePreviousSession('HotB could not clear the saved practice session.',error)}
 if(db.activePracticeSession!==null)return restorePreviousSession('HotB saved practice session remained after clear.');
 return true;
}
async function endPracticeDraft(){
 if(practiceResolutionApplyToken||practiceResolutionApplyDraftId||practiceResolutionApplyOwnedDraftId){console.warn('HotB ignored End Draft while Practice Resolution apply is verifying.');return}
 if(db.activePortalPractice?.id){alert(db.activePortalPractice.id===practicePlan?.portalDraftId?'This practice is active on the player and coach portals. Deactivate the portal plans before ending the draft.':'Another practice is still active on the player and coach portals. Finish that active practice before discarding this draft.');return}
 if(!confirm('End this unfinished practice? All attendance, adjustments and guest information will be cleared, and every guest link will expire.'))return;
 const guests=[...practiceGuestPlayers(),...practiceGuestCoaches()].filter(guest=>guest.portalId);
 if(guests.length){
  if(!cloudUser||!cloudStore){alert('Sign in through Cloud Backup before ending this draft so HotB can expire the guest links.');return}
  try{
   const existingGuests=await Promise.all(guests.map(async guest=>{const snapshot=await portalDoc(guest.portalId).get();return snapshot.exists?guest:null})),batch=cloudStore.batch();
   existingGuests.filter(Boolean).forEach(guest=>batch.update(portalDoc(guest.portalId),{expired:true,accessStatus:'ended',activePractice:null,endedAt:firebase.firestore.FieldValue.serverTimestamp(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()}));
   if(existingGuests.some(Boolean))await batch.commit();
   const verification=await Promise.all(guests.map(async guest=>{try{const snapshot=await portalDoc(guest.portalId).get(),remote=snapshot.exists?snapshot.data():null;return !snapshot.exists||!!remote&&remote.expired===true&&remote.accessStatus==='ended'&&!remote.activePractice}catch(error){return false}}));
   if(verification.some(ok=>!ok))throw new Error('draft-guest-expiry-verification-failed');
  }
  catch(error){alert('The guest links could not be expired and verified. Check your connection and try End again.');return}
 }
 closePracticeWorkspace();
}
let practiceResolutionApplyDraftId=null,practiceResolutionApplyToken=null,practiceResolutionApplyOwnedDraftId=null;
let practiceResumeVerificationBusy=false;
async function resumeRecoveredPracticeClock(){
 if(practiceResumeVerificationBusy||!practicePlan||!practiceClock.running)return;
 // Auth restoration can lag local-session restoration on iPhone/PWA startup.
 // Wait for the authenticated callback instead of treating that short gap as a
 // portal mismatch and alarming/pausing a valid recovered practice.
 if(!cloudUser||!cloudStore)return;
 practiceResumeVerificationBusy=true;
 try{
 if(!practicePlan||!practiceClock.running)return;
 if(!window.HotBPracticeSession?.timing(practicePlan,practiceClock,Date.now())){await finishPracticeClock(true);return}
 const activeTiming=window.HotBPracticeSession?.timing(practicePlan,practiceClock,Date.now());
 if(!activeTiming||!practiceClock.running)return;
 // A reopened coach app must prove the restored clock still matches every live
 // portal before resuming announcements/timers. Never overwrite the portals from
 // an unverified local session.
 const clockVerified=await verifyPublishedPracticeClock();
 if(clockVerified!==true){
  if(practiceClockTimer)clearInterval(practiceClockTimer);practiceClockTimer=null;
  alert('HotB restored this practice, but could not verify the same live clock on every portal. The coach timer is paused so it cannot overwrite the player portals. Check the connection and reopen Practice.');
  return;
 }
 updatePracticeClock();
 if(practiceClock.running&&!practiceClockTimer)practiceClockTimer=setInterval(updatePracticeClock,250);
 }finally{practiceResumeVerificationBusy=false}
}
async function verifyPublishedPracticeClock(){
 if(!cloudUser||!cloudStore||!practicePlan||db.activePortalPractice?.id!==practicePlan.portalDraftId)return false;
 const clock=practiceClockPortalPayload(),activeId=practicePlan.portalDraftId,ids=[...new Set([
  ...(db.activePortalPractice?.playerPortals||[]).map(entry=>entry.portalId),
  db.activePortalPractice?.coachPortalId||db.coachPortal?.portalId,
  ...(db.activePortalPractice?.guestPlayerPortalIds||[]),
  ...(db.activePortalPractice?.guestCoachPortalIds||[])
 ].filter(Boolean))];
 if(!ids.length)return false;
 const verification=await Promise.all(ids.map(async id=>{try{const snapshot=await portalDoc(id).get(),remote=snapshot.exists?snapshot.data()?.activePractice:null,remoteClock=remote?.clock||{};return remote?.id===activeId&&remoteClock.status===clock.status&&(clock.startedAt?remoteClock.startedAt===clock.startedAt:!remoteClock.startedAt)&&(clock.endedAt?remoteClock.endedAt===clock.endedAt:!remoteClock.endedAt)}catch(error){return false}}));
 return verification.every(Boolean);
}
function speakPracticeClock(message,quiet=false){
 if(!('speechSynthesis'in window))return Promise.resolve();
 return new Promise(resolve=>{
  const voice=new SpeechSynthesisUtterance(message);voice.rate=.92;voice.volume=quiet?0:1;
  let complete=false;
  const finish=()=>{if(complete)return;complete=true;clearTimeout(fallback);resolve()};
  const fallback=setTimeout(finish,Math.max(4000,Math.min(12000,message.length*160)));
  voice.onend=finish;voice.onerror=finish;
  window.speechSynthesis.cancel();window.speechSynthesis.speak(voice);
 });
}
function updatePracticeClock(){
 if(!practicePlan||!practiceClock.running)return;
 const now=Date.now(),state=window.HotBPracticeSession?.timing(practicePlan,practiceClock,now);
 const currentBlock=$('#practiceCurrentBlock'),timeLeft=$('#practiceTimeLeft');
 if(!state){
  if(currentBlock)currentBlock.textContent='DONE!';
  if(timeLeft)timeLeft.textContent='0:00';
  if(practiceClockTimer)clearInterval(practiceClockTimer);practiceClockTimer=null;
  finishPracticeClock(true);
  return;
 }
 const {block,remaining,transition}=state,seconds=Math.ceil(remaining/1000);
 if(block>practiceClock.lastBlock){
  practiceClock.lastBlock=block;speakPracticeClock(`Begin Block ${block}`);persistPracticeSession();
  // The portal derives block/NEXT from the immutable synchronized start time.
  // Do not fan out redundant clock writes at every block boundary: a transient
  // network failure here used to create needless partial-write opportunities
  // even though no clock value had changed.
 }
 const warningBlock=window.HotBPracticeSession?.pendingTwoMinuteWarning(practicePlan,practiceClock,now);
 if(warningBlock){practiceClock.lastTwoMinuteBlock=warningBlock;speakPracticeClock('Two minutes left');persistPracticeSession()}
 const transitionBlock=window.HotBPracticeSession?.pendingTransitionWarning(practicePlan,practiceClock,now);
 if(transitionBlock){practiceClock.lastTransitionBlock=transitionBlock;speakPracticeClock('Ladies, Time to Rotate. One minute until the next block');persistPracticeSession()}
 if(currentBlock)currentBlock.textContent=transition?'ROTATE':`${block} of 10`;
 if(timeLeft)timeLeft.textContent=`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;
}
async function beginPracticeClock(){
 if(practiceClock.finished)return;
 if(!db.activePortalPractice?.id||db.activePortalPractice.id!==practicePlan?.portalDraftId){alert('Activate the player and coach portal plans before starting practice. This keeps every player’s live block and NEXT display synchronized with the coach clock.');return}
 if(practicePlan&&!practicePlan.recoveredCoachSchedule&&window.HotBPracticeScheduler?.validate){const errors=window.HotBPracticeScheduler.validate(practicePlan);if(errors.length){alert(`This practice cannot start because it failed its safety checks:\n\n${errors.join('\n\n')}`);return}}
 // Starting the clock must never discard drills already saved for this exact practice.
 // Recover them from the persisted session if the in-memory list was lost during a render/navigation.
 const savedSession=db.activePracticeSession;
 if(practicePlan&&practiceChosenDrills.length!==practicePlan.drillStations&&savedSession?.plan?.portalDraftId===practicePlan.portalDraftId&&Array.isArray(savedSession.chosenDrills)&&savedSession.chosenDrills.length===practicePlan.drillStations){
  practiceChosenDrills=structuredClone(savedSession.chosenDrills);
 }
 if(!practicePlan||practiceChosenDrills.length!==practicePlan.drillStations){alert('Choose all practice drills before starting the practice clock.');return}
 if(practiceClockTimer)clearInterval(practiceClockTimer);
 practiceEndSpeech=Promise.resolve();
 practiceClock={running:true,finished:false,endAnnounced:false,startAt:Date.now(),lastBlock:1,lastTwoMinuteBlock:0,lastTransitionBlock:0,completedAt:null};
 persistPracticeSession();
 const clockSynced=await syncPlayerPracticeClock();
 if(clockSynced!==true){
  // The first fan-out can partially succeed. Repair only portals carrying this
  // exact attempted start timestamp; never use the normal sync routine after
  // changing local state because its mismatch guard can strand running players.
  const failedStartedAt=new Date(practiceClock.startAt).toISOString(),activeId=practicePlan.portalDraftId,resetClock={status:'not-started',startedAt:null,endedAt:null},ids=[...new Set([
   ...(db.activePortalPractice?.playerPortals||[]).map(entry=>entry.portalId),db.activePortalPractice?.coachPortalId||db.coachPortal?.portalId,
   ...(db.activePortalPractice?.guestPlayerPortalIds||[]),...(db.activePortalPractice?.guestCoachPortalIds||[])
  ].filter(Boolean))];
  practiceClock={running:false,finished:false,endAnnounced:false,startAt:null,lastBlock:0,lastTwoMinuteBlock:0,lastTransitionBlock:0,completedAt:null};
  const repair=await Promise.allSettled(ids.map(async id=>{const snapshot=await portalDoc(id).get(),remote=snapshot.exists?snapshot.data()?.activePractice:null;if(remote?.id!==activeId)throw new Error('start-repair-practice-mismatch');const rc=remote.clock||{};if(rc.status==='not-started'&&!rc.startedAt)return true;if(rc.status!=='running'||rc.startedAt!==failedStartedAt)throw new Error('start-repair-clock-conflict');await portalDoc(id).update({'activePractice.clock':resetClock,updatedAt:firebase.firestore.FieldValue.serverTimestamp()});return true}));
  const rollbackVerified=repair.every(result=>result.status==='fulfilled')&&await verifyPublishedPracticeClock();
  persistPracticeSession();render();
  alert(rollbackVerified
   ?'Practice did not start because the live portal clock could not be confirmed. Every portal was safely reset to Not Started; check the connection and tap Start again.'
   :'Practice did not start, and HotB could not safely reset every portal. Do not start practice until the connection is restored and Start succeeds.');
  return;
 }
 // syncPlayerPracticeClock already committed the Start atomically and performed
 // the authoritative read-back. Do not immediately read every portal a second time.
 const expectedStartedAt=new Date(practiceClock.startAt).toISOString(),startVerifyIds=[...new Set([
  ...(db.activePortalPractice?.playerPortals||[]).map(entry=>entry.portalId),
  db.activePortalPractice?.coachPortalId||db.coachPortal?.portalId,
  ...(db.activePortalPractice?.guestPlayerPortalIds||[]),
  ...(db.activePortalPractice?.guestCoachPortalIds||[])
 ].filter(Boolean))];
if(!startVerifyIds.length){
  // Preserve the failed start timestamp long enough to repair only portals that
  // actually accepted this exact start. Never issue a blanket rollback through
  // syncPlayerPracticeClock(): that routine refuses mismatched targets and can
  // leave the coach locally Not Started while some players keep counting down.
  const failedStartedAt=expectedStartedAt,activeId=practicePlan.portalDraftId,resetClock={status:'not-started',startedAt:null,endedAt:null};
  practiceClock={running:false,finished:false,endAnnounced:false,startAt:null,lastBlock:0,lastTwoMinuteBlock:0,lastTransitionBlock:0,completedAt:null};
  const rollbackResults=await Promise.allSettled(startVerifyIds.map(async id=>{
   const snapshot=await portalDoc(id).get(),remote=snapshot.exists?snapshot.data()?.activePractice:null;
   if(remote?.id!==activeId)throw new Error('start-rollback-practice-mismatch');
   const remoteClock=remote.clock||{};
   if(remoteClock.status==='not-started'&&!remoteClock.startedAt)return true;
   if(remoteClock.status!=='running'||remoteClock.startedAt!==failedStartedAt)throw new Error('start-rollback-clock-conflict');
   await portalDoc(id).update({'activePractice.clock':resetClock,updatedAt:firebase.firestore.FieldValue.serverTimestamp()});
   return true;
  }));
  const rollbackVerified=rollbackResults.every(result=>result.status==='fulfilled')&&await verifyPublishedPracticeClock();
  persistPracticeSession();render();
  alert(rollbackVerified
   ?'Practice did not start because HotB could not verify the same live start time on every portal. Every portal was safely reset to Not Started; check the connection and tap Start again.'
   :'Practice did not start, and HotB could not safely reset every portal after the start verification failed. Do not start practice until the connection is restored and Start succeeds.');
  return;
 }
 speakPracticeClock('Begin Block 1');render();updatePracticeClock();practiceClockTimer=setInterval(updatePracticeClock,250);
}
document.addEventListener('visibilitychange',()=>{
 if(document.visibilityState==='hidden'&&practicePlan)persistPracticeSession();
 if(document.visibilityState==='visible'&&practicePlan&&practiceClock.running)resumeRecoveredPracticeClock();
});
window.addEventListener('pagehide',()=>{if(practicePlan)persistPracticeSession()});
let practiceCompletionBusy=false;
async function finishPracticeClock(automatic=false){
 if(practiceCompletionBusy)return;
 if(!practicePlan)return;
 // A previously finished local clock may still need its remote DONE transaction.
 // Route that state through the retry path instead of silently returning and
 // leaving activePractice visible on player phones.
 if(practiceClock.finished){await endPracticeFromScreen();return}
 practiceCompletionBusy=true;
 try{
 if(practiceClockTimer)clearInterval(practiceClockTimer);practiceClockTimer=null;
 practiceClock.running=false;practiceClock.finished=true;
 const scheduledEnd=practiceClock.startAt&&practicePlan&&window.HotBPracticeSession?.layout?practiceClock.startAt+window.HotBPracticeSession.layout(practicePlan).totalMs:0,completedAt=new Date(practiceClock.completedAt||(automatic&&scheduledEnd?scheduledEnd:Date.now()));
 practiceClock.completedAt=completedAt.toISOString();
 const shouldClearPortals=db.activePortalPractice?.id===practicePlan?.portalDraftId;
 archiveCompletedPractice(completedAt);
 if(!practiceClock.endAnnounced){practiceClock.endAnnounced=true;practiceEndSpeech=speakPracticeClock('Times Up, Good Practice, Please start to clean up')}
 persistPracticeSession();
 // Publish the finished clock before removing activePractice. This gives every
 // already-open portal an authoritative Practice Complete state immediately,
 // even if the subsequent cleanup/read-back takes a moment or must be retried.
 if(shouldClearPortals){
  const finishedSynced=await syncPlayerPracticeClock();
  if(finishedSynced!==true){
   // Finish fan-out can partially succeed just like Start. Preserve the exact
   // completed timestamp and inspect every target. A portal still carrying this
   // practice may be safely advanced to FINISHED; a different practice is never
   // touched. This converges a split finish before cleanup is allowed.
   const activeId=practicePlan.portalDraftId,finishedClock=practiceClockPortalPayload(),ids=[...new Set([
    ...(db.activePortalPractice?.playerPortals||[]).map(entry=>entry.portalId),db.activePortalPractice?.coachPortalId||db.coachPortal?.portalId,
    ...(db.activePortalPractice?.guestPlayerPortalIds||[]),...(db.activePortalPractice?.guestCoachPortalIds||[])
   ].filter(Boolean))];
   const repair=await Promise.allSettled(ids.map(async id=>{const snapshot=await portalDoc(id).get(),remote=snapshot.exists?snapshot.data()?.activePractice:null;if(remote?.id!==activeId)throw new Error('finish-repair-practice-mismatch');const rc=remote.clock||{};if(rc.status==='finished'&&rc.endedAt===finishedClock.endedAt)return true;if(rc.status==='running'&&rc.startedAt===finishedClock.startedAt){await portalDoc(id).update({'activePractice.clock':finishedClock,updatedAt:firebase.firestore.FieldValue.serverTimestamp()});return true}throw new Error('finish-repair-clock-conflict')}));
   const repaired=repair.every(result=>result.status==='fulfilled')&&await verifyPublishedPracticeClock();
   if(!repaired){
    persistPracticeSession();render();
    alert('Practice is finished, but HotB could not safely converge every portal to the same finished clock. The active plans were left in place so cleanup can be retried safely with DONE!.');
    return;
   }
  }
 }
 const endingSpeech=practiceEndSpeech;render();
 if(automatic&&Array.isArray(practicePlan?.recoveredCoachSchedule)&&practicePlan.recoveredCoachSchedule.length&&!shouldClearPortals){
  return;
 }
 if(shouldClearPortals){
  try{await clearActivePlayerPlans();clearPracticeSession();render()}
  catch(error){
   // Keep the completed practice session intact. DONE is a resumable transaction:
   // the next tap/reopen must still know exactly which published practice to clear.
   persistPracticeSession();render();
   alert(cloudUser&&cloudStore?'Practice was saved, but the player plans could not be removed. Check your connection, then tap DONE! again.':'Practice was saved, but the player plans could not be removed because Cloud Backup is not signed in. Sign in through Cloud Backup, then tap DONE! again.')
  }
 }else clearPracticeSession();
 if(!automatic){
  await endingSpeech;
  if(db.activePortalPractice?.id===practicePlan?.portalDraftId)return;
  closePracticeWorkspace()
 }
 }finally{practiceCompletionBusy=false}
}
function closePracticeWorkspace(){
 // Workspace teardown is also a hard Practice Resolution transaction boundary.
 // No apply identity or failed-build Resolution may survive into the next practice.
 // This prevents a delayed callback from an old workspace from owning, rebuilding,
 // or rolling back state after the coach has intentionally ended/discarded it.
 practiceResolutionApplyDraftId=null;practiceResolutionApplyOwnedDraftId=null;practiceResolutionApplyToken=null;practiceResolution=null;
 if(clearPracticeSession()!==true){console.error('HotB refused to close the practice workspace because recovery state could not be cleared.');return false}
 stopPracticeClock();practicePlan=null;practiceChosenDrills=[];practiceDraftDrills=[];practiceDrillPickerOpen=false;practiceEquipmentSetupOpen=false;practiceCoachOpen=false;practiceCardsOpen=false;practiceSetupState={selectedNames:db.roster.filter(player=>!player.isTeamJenkins).map(player=>player.name),startTime:'18:00',durationMinutes:120,accommodations:{},guestPlayers:[],guestCoaches:[],guestsOpen:false};practiceSection='hub';modal=null;render();window.scrollTo(0,0);return true;
}
async function endPracticeFromScreen(){
 if(practiceCompletionBusy)return;
 if(practiceClock.finished){
  if(practicePlan&&!db.practiceHistory.some(item=>item.id===practicePlan.portalDraftId)){const completedAt=new Date(practiceClock.completedAt||Date.now());practiceClock.completedAt=completedAt.toISOString();archiveCompletedPractice(completedAt);persistPracticeSession()}
  const shouldClearPortals=db.activePortalPractice?.id===practicePlan?.portalDraftId;
  if(shouldClearPortals){
   try{
    // A retry after a failed finish/cleanup must first re-confirm the authoritative
    // finished clock. Never jump straight from an uncertain remote state to deletion.
    const finishedSynced=await syncPlayerPracticeClock();
    if(finishedSynced!==true)throw new Error('finished-clock-retry-verification-failed');
    await clearActivePlayerPlans();
   }
   catch(error){alert(cloudUser&&cloudStore?'The practice is finished, but HotB could not verify and remove every player plan. Check your connection, then tap DONE! again.':'The practice is finished, but the player plans are still active. Sign in through Cloud Backup, then tap DONE! again.');return}
  }
  closePracticeWorkspace();return
 }
 if(practiceClock.running){
  if(!confirm('End this practice now? It will be saved to Practice History and removed from the player and coach portals.'))return;
  await finishPracticeClock(false);return;
 }
 if(!confirm('Discard this practice plan before it starts? It will not be added to Practice History.'))return;
 practiceCompletionBusy=true;
 const shouldClearPortals=db.activePortalPractice?.id===practicePlan?.portalDraftId;
 if(shouldClearPortals){
  try{await clearActivePlayerPlans()}
  catch(error){practiceCompletionBusy=false;const code=String(error?.code||error?.message||error||'unknown');console.error('HotB discard portal cleanup failed',error);alert(cloudUser&&cloudStore?'The plan could not be discarded because the player plans are still active.\n\nCleanup error: '+code:'The player plans are still active. Sign in through Cloud Backup, then tap DONE! again.');return}
 }
 practiceCompletionBusy=false;closePracticeWorkspace();
}
window.HotBCoachPortalShare=async function(){
 if(!db.coachPortal?.portalId){portalMessage='The coach portal is missing its saved link. Tap Refresh Coach Portal once.';render();return}
 const share={title:`${db.coachPortal.name||'Coach'}’s HotB Coach Portal`,text:coachPortalShareText()};
 try{if(typeof navigator.share==='function'){await navigator.share(share);return}if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(share.text);portalMessage='Coach portal link and PIN copied.';render();return}portalMessage='Sharing is unavailable on this screen.';render()}catch(error){if(error?.name!=='AbortError'){portalMessage='The coach portal link could not be shared from this device.';render()}}
};
window.HotBCoachPortalText=function(){
 const phone=String(db.coachPortal?.phone||'').replace(/[^\d+]/g,'');
 if(!phone){portalMessage='The coach portal does not have a saved cell number.';render();return}
 const url=smsComposeUrl(phone,coachPortalShareText());
 if(!url){portalMessage='Messages could not be prepared from this screen.';render();return}
 if(!openSmsComposer(url)){portalMessage='Messages could not be opened from this screen.';render()}
};
window.HotBPortalShare=async function(name){
 const player=db.roster.find(item=>item.name===name);
 if(!player?.portalId){portalMessage='This player portal is missing its saved link. Tap Refresh Player Records once.';render();return}
 const share={title:`${practiceFirstName(player.name)}’s HotB Player Portal`,text:`${practiceFirstName(player.name)}’s private HotB Player Portal\nPIN: ${player.portalPin}\n${playerPortalUrl(player)}`};
 try{
  if(typeof navigator.share==='function'){await navigator.share(share);return}
  if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(share.text);portalMessage='Portal link and PIN copied.';render();return}
  portalMessage='Sharing is unavailable on this screen.';render();
 }catch(error){if(error?.name!=='AbortError'){portalMessage=`Share failed: ${String(error?.name||'unknown')}.`;render()}}
};
window.HotBPortalText=function(name){
 const player=db.roster.find(item=>item.name===name),url=playerPortalTextUrl(player);
 if(!url){portalMessage=(practiceFirstName(player?.name||'This player'))+' does not have a saved cell number.';render();return}
 // Keep the sms handoff inside the original user gesture. This helper creates and
 // clicks the external-scheme anchor synchronously, which is more reliable in an
 // iOS Home Screen PWA than assigning location after other event work has run.
 if(!openSmsComposer(url)){portalMessage='Messages could not be opened from this screen.';render()}
};
function bindPlayerPortal(){
 // Evaluation bindings belong only to the coach portal's evaluation subview.
 // Player/PIN portal startup must not depend on the optional evaluation module.
 if(portalData?.portalType==='coach'&&portalView==='evaluation'&&typeof bindEval==='function')bindEval();
 $('#setupPlayerPortals')?.addEventListener('click',setupPlayerPortals);
 $('#setupCoachPortal')?.addEventListener('click',setupCoachPortal);
 $('#resetCoachPortal')?.addEventListener('click',resetCoachPortal);
 // Bind delivery in app.js as the authoritative path. The capture-phase helper
 // remains only as an early-startup fallback and marks handled taps so these
 // listeners cannot duplicate an iOS Share/Messages handoff.
 $$('[data-share-portal]').forEach(button=>button.addEventListener('click',event=>{if(event.__hotbPortalDeliveryHandled)return;window.HotBPortalShare?.(button.dataset.sharePortal)}));
 $$('[data-text-portal]').forEach(button=>button.addEventListener('click',event=>{if(event.__hotbPortalDeliveryHandled)return;window.HotBPortalText?.(button.dataset.textPortal)}));
 $('#shareCoachPortal')?.addEventListener('click',event=>{if(event.__hotbPortalDeliveryHandled)return;window.HotBCoachPortalShare?.()});
 $('#textCoachPortal')?.addEventListener('click',event=>{if(event.__hotbPortalDeliveryHandled)return;window.HotBCoachPortalText?.()});
 $$('[data-reset-portal]').forEach(button=>button.addEventListener('click',()=>resetPlayerPortal(db.roster.find(item=>item.name===button.dataset.resetPortal))));
 $('#openPlayerPortal')?.addEventListener('click',()=>claimPlayerPortal($('#portalPin')?.value));
 $('#portalPin')?.addEventListener('keydown',event=>{if(event.key==='Enter')claimPlayerPortal(event.currentTarget.value)});
 $('#portalDashboard')?.addEventListener('click',()=>{portalView='home';portalSelectedDrill='';portalDrillResults=[];render();window.scrollTo(0,0)});
 $('#portalBack')?.addEventListener('click',()=>{portalView='home';portalSelectedDrill='';render();window.scrollTo(0,0)});
 $('#portalPracticeBack')?.addEventListener('click',()=>{portalView='practice';portalSelectedDrill='';portalDrillQuery='';portalLibraryReturnView='library';render();window.scrollTo(0,0)});
 $$('[data-portal-view]').forEach(button=>button.addEventListener('click',()=>{portalView=button.dataset.portalView;portalSelectedDrill='';portalDrillQuery='';portalDrillResults=[];render();window.scrollTo(0,0)}));
 $('#portalDrillSearch')?.addEventListener('input',event=>{portalDrillQuery=event.target.value;render();const search=$('#portalDrillSearch');if(search){search.focus();search.setSelectionRange(search.value.length,search.value.length)}});
 $$('[data-portal-drill]').forEach(button=>button.addEventListener('click',()=>{portalSelectedDrill=button.dataset.portalDrill;render();window.scrollTo(0,0)}));
 $$('[data-portal-practice-drill]').forEach(button=>button.addEventListener('click',()=>{const drill=button.dataset.portalPracticeDrill;if(!drill)return;const practiceOnly=['guestPlayer','guestCoach','jenkinsPlayer'].includes(portalData?.portalType);if(practiceOnly&&(portalPracticeClockValues(portalData?.activePractice).block==='DONE!'||!(portalData?.activePractice?.drills||[]).includes(drill)))return;portalLibraryReturnView='practice';portalSelectedDrill=drill;portalView='library';render();window.scrollTo(0,0)}));
 $('#portalLibraryBack')?.addEventListener('click',()=>{if(portalLibraryReturnView==='practice')portalView='practice';portalLibraryReturnView='library';portalSelectedDrill='';render();window.scrollTo(0,0)});
 $('#findPortalDrills')?.addEventListener('click',()=>{portalDrillQuery=$('#portalProblem')?.value.trim()||'';portalDrillResults=recommendPortalDrills(portalDrillQuery);render();window.scrollTo(0,0)});
 $$('[data-portal-recommendation]').forEach(button=>button.addEventListener('click',()=>{portalSelectedDrill=button.dataset.portalRecommendation;portalView='library';render();window.scrollTo(0,0)}));
}
function storePracticeAccommodation(index){
 const player=practiceAttendanceRoster()[Number(index)];if(!player)return;
 const start=$('#practiceStartTime')?.value||practiceSetupState.startTime||'18:00',duration=Number($('#practiceDuration')?.value)||practiceSetupState.durationMinutes||120,end=practiceEndValue(start,duration);
 const arrival=$(`[data-accommodation-arrival="${index}"]`),departure=$(`[data-accommodation-departure="${index}"]`),pitch=$(`[data-accommodation-pitch="${index}"]`),warmup=$(`[data-accommodation-warmup="${index}"]`),catching=$(`[data-accommodation-catch="${index}"]`),prePractice=$(`[data-accommodation-prepractice="${index}"]`),limitations=$(`[data-accommodation-limitations="${index}"]`);
 if(pitch&&warmup&&!pitch.checked)warmup.checked=false;
 if(arrival)arrival.dataset.custom=arrival.value!==start?'true':'false';if(departure)departure.dataset.custom=departure.value!==end?'true':'false';
 [arrival,departure].forEach(input=>{const display=input?.parentElement?.querySelector('.practice-accommodation-time-display');if(display)display.textContent=practiceTimeLabel(input.value)});
 const accommodation={arrival:arrival?.value!==start?arrival.value:'',departure:departure?.value!==end?departure.value:'',limitations:limitations?.value.trim()||'',prePracticeComplete:!!prePractice?.checked,canPitch:pitch?pitch.checked:false,requiresPitchWarmup:warmup?warmup.checked:false,canCatch:catching?catching.checked:false};
 practiceSetupState.accommodations=practiceSetupState.accommodations||{};practiceSetupState.accommodations[player.name]=accommodation;
 const summary=$(`[data-accommodation-summary="${index}"]`);if(summary)summary.textContent=practiceAccommodationSummary(player,accommodation,start,duration);
 if(warmup)warmup.disabled=!!pitch&&!pitch.checked;
}
function refreshPracticeAccommodationDefaults(){
 const start=$('#practiceStartTime')?.value||'18:00',duration=Number($('#practiceDuration')?.value)||120,end=practiceEndValue(start,duration);
 $$('[data-accommodation-arrival]').forEach(input=>{if(input.dataset.custom!=='true')input.value=start});
 $$('[data-accommodation-departure]').forEach(input=>{if(input.dataset.custom!=='true')input.value=end});
 practiceAttendanceRoster().forEach((player,index)=>storePracticeAccommodation(index));
}
function bindPractice(){
 $('#practiceMachineFocus')?.addEventListener('change',event=>{practicePlan.machineFocus=event.target.value||'Standard';persistPracticeSession();render()});
 $('#practiceFrontTossFocus')?.addEventListener('change',event=>{practicePlan.frontTossFocus=event.target.value||'Standard';persistPracticeSession();render()});
 $('#choosePracticeDrills')?.addEventListener('click',()=>{practiceDraftDrills=practiceChosenDrills.slice(0,practicePlan.drillStations);practiceDrillPickerOpen=true;practicePickerQuery='';practicePickerCategory='All Drills';render();window.scrollTo(0,0)});
 $('#cancelPracticeDrills')?.addEventListener('click',()=>{practiceDraftDrills=[];practiceDrillPickerOpen=false;render();window.scrollTo(0,0)});
 $('#practicePickerSearch')?.addEventListener('input',event=>{practicePickerQuery=event.target.value;render();const search=$('#practicePickerSearch');if(search){search.focus();search.setSelectionRange(search.value.length,search.value.length)}});
 document.querySelectorAll('[data-picker-category]').forEach(button=>button.addEventListener('click',()=>{practicePickerCategory=button.dataset.pickerCategory;render();window.scrollTo(0,0)}));
 document.querySelectorAll('[data-picker-drill]').forEach(button=>button.addEventListener('click',()=>{const drill=practiceSelectableDrills().find(item=>item.name===button.dataset.pickerDrill);if(!drill)return;const index=practiceDraftDrills.findIndex(item=>item.name===drill.name);if(index>=0)practiceDraftDrills.splice(index,1);else if(practiceDraftDrills.length<practicePlan.drillStations)practiceDraftDrills.push(drill);render()}));
 $('#savePracticeDrills')?.addEventListener('click',()=>{if(practiceDraftDrills.length!==practicePlan.drillStations)return;practiceChosenDrills=practiceDraftDrills.slice();practiceDrillPickerOpen=false;practiceEquipmentSetupOpen=true;render();window.scrollTo(0,0)});
 $('#backToPracticeDrills')?.addEventListener('click',()=>{practiceDraftDrills=practiceChosenDrills.slice();practiceEquipmentSetupOpen=false;practiceDrillPickerOpen=true;render();window.scrollTo(0,0)});
 $('#completePracticeSetup')?.addEventListener('click',()=>{practiceEquipmentSetupOpen=false;practiceDraftDrills=[];render();window.scrollTo(0,0);setTimeout(()=>persistPracticeSession(),0)});
 $('#practiceHubBack')?.addEventListener('click',()=>{
  if(practiceResolutionApplyToken||practiceResolutionApplyDraftId||practiceResolutionApplyOwnedDraftId){console.warn('HotB ignored Practice Hub Back while Practice Resolution apply is verifying.');return}
  if(practiceSection==='setup'&&persistPracticeDraft()===false){console.error('HotB refused Practice Hub Back because the Practice Resolution draft could not be persisted.');return}
  practiceSection='hub';practiceFocusPlayer='';practiceSelectedDrill='';render();window.scrollTo(0,0)
 });
 $('#recoverOrphanedPractice')?.addEventListener('click',recoverOrphanedActivePractice);
 $('#recoverPublishedPractice')?.addEventListener('click',recoverPublishedPractice);
 $('#openPracticeBuilder')?.addEventListener('click',()=>{if(db.activePortalPractice?.id&&!practicePlan){alert('A practice is still active on the player and coach portals. Resume and finish that practice before building a new one.');return}
  if(!practicePlan){
   // A saved setup/resolution draft is authoritative. Never replace its verified
   // attendance with the full roster merely because the coach returned through
   // the Practice Hub. Fresh setup still starts with every current Rebels player.
   const savedSetupDraft=db.activePracticeSession?.stage==='setup'&&!db.activePracticeSession?.plan;
   if(savedSetupDraft){
    let savedDraftBytes='',restored=null;
    try{savedDraftBytes=JSON.stringify(db.activePracticeSession);restored=window.HotBPracticeSession?.restore?.(db.activePracticeSession)}
    catch(error){console.error('HotB refused Practice Resolution resume because the saved setup recovery could not be restored.',error);return}
    if(restored?.stage==='setup'&&!restored.plan){
     // Resume may not accept a restore migration/default as authority for an
     // unresolved Resolution. The exact saved setup-stage transaction must survive
     // the production restore path byte-for-byte before it can become live state.
     if(restored.resolution&&JSON.stringify(restored)!==savedDraftBytes){
      console.error('HotB refused a saved Practice Resolution draft that changed during session restore.');
      return;
     }
     let previousSetup,previousResolution;
     try{previousSetup=structuredClone(practiceSetupState);previousResolution=practiceResolution?structuredClone(practiceResolution):null}
     catch(error){console.error('HotB refused Practice Resolution resume because live rollback state could not be cloned.',error);return}
     practiceSetupState={...practiceSetupState,...restored.setupState};
     try{practiceResolution=restored.resolution?structuredClone(restored.resolution):null}
     catch(error){console.error('HotB refused Practice Resolution resume because the restored decision could not be cloned.',error);practiceSetupState=previousSetup;practiceResolution=previousResolution;return}
     // Resume follows the same invariant as startup: unresolved Resolution state
     // always comes from the failed 120-minute source attempt. Never render a
     // persisted 132-minute setup even briefly.
     if(Number(practiceSetupState.durationMinutes)!==120)practiceSetupState.durationMinutes=120;
     practiceSection='setup';
     if(practiceResolution&&!practiceResolutionSnapshotIsCurrentAndValid(practiceResolution)){
      console.warn('Saved Practice Resolution failed resume validation; returning to setup.');
      practiceResolution=null;
      // A rejected emergency Resolution cannot leave its 132-minute duration
      // behind when the coach resumes the draft.
      if(Number(practiceSetupState.durationMinutes)===132)practiceSetupState.durationMinutes=120;
      if(persistPracticeDraft()!==true){
       console.error('HotB could not persist the clean setup after rejecting a stale resumed Practice Resolution.');
       practiceSetupState=previousSetup;practiceResolution=previousResolution;practiceSection='hub';modal=null;render();window.scrollTo(0,0);return;
      }
     }else if(practiceResolution){
      // The restored object must be byte-for-byte the sealed object in the saved
      // draft. This catches restore migrations/defaults that might otherwise keep
      // valid signatures while changing recovery metadata.
      const savedResolution=db.activePracticeSession?.resolution;
      let savedResolutionBytes='',liveResolutionBytes='';
      try{savedResolutionBytes=JSON.stringify(savedResolution);liveResolutionBytes=JSON.stringify(practiceResolution)}
      catch(error){console.error('HotB refused a Practice Resolution whose resumed decision could not be sealed.',error);practiceSetupState=previousSetup;practiceResolution=previousResolution;practiceSection='hub';modal=null;render();window.scrollTo(0,0);return}
      if(!savedResolution||savedResolutionBytes!==liveResolutionBytes){
       console.error('HotB refused a Practice Resolution that changed while restoring the saved draft.');
       practiceSetupState=previousSetup;practiceResolution=previousResolution;practiceSection='hub';modal=null;render();window.scrollTo(0,0);return;
      }
      modal='practiceResolution';
     }
     render();window.scrollTo(0,0);return;
    }
   }
   // Fresh Build Practice starts with every current non-Jenkins player selected.
   // Render first, then force actual checkbox properties so stale iOS form-state
   // restoration cannot override the checked markup.
   practiceSetupState.selectedNames=practiceAttendanceRoster().filter(player=>!player.isTeamJenkins).map(player=>player.name);
   practiceSection='setup';
   render();
   $$('[data-practice-player]').forEach((input,index)=>{
    const player=practiceAttendanceRoster()[index];
    input.checked=!!player&&!player.isTeamJenkins;
   });
   persistPracticeDraft();
   window.scrollTo(0,0);
   return;
  }
  practiceSection='setup';render();window.scrollTo(0,0)});
 $('#openDrillLibrary')?.addEventListener('click',()=>{practiceSection='library';render();window.scrollTo(0,0)});
 $('#practiceDrillSearch')?.addEventListener('input',event=>{practiceDrillQuery=event.target.value;render();const search=$('#practiceDrillSearch');if(search){search.focus();search.setSelectionRange(search.value.length,search.value.length)}});
 $$('[data-drill-category]').forEach(button=>button.addEventListener('click',()=>{practiceDrillCategory=button.dataset.drillCategory;render();window.scrollTo(0,0)}));
 $$('[data-drill-name]').forEach(button=>button.addEventListener('click',()=>{practiceSelectedDrill=button.dataset.drillName;render();window.scrollTo(0,0)}));
 $('#backToDrillList')?.addEventListener('click',()=>{practiceSelectedDrill='';render();window.scrollTo(0,0)});
 $('#openPlayerFocus')?.addEventListener('click',()=>{practiceSection='player';practiceFocusPlayer='';render();window.scrollTo(0,0)});
 $$('[data-focus-player]').forEach(button=>button.addEventListener('click',()=>{practiceFocusPlayer=button.dataset.focusPlayer;render();window.scrollTo(0,0)}));
 $$('[data-focus-range]').forEach(button=>button.addEventListener('click',()=>{practiceFocusRange=button.dataset.focusRange;render();window.scrollTo(0,0)}));
 $('#focusGameCount')?.addEventListener('click',()=>{modal='focusGameAudit';render()});
 $('#manageFocusObservations')?.addEventListener('click',()=>{modal='manageFocusObservations';render()});
 $('#manageFocusDrills')?.addEventListener('click',()=>{focusDrillReplaceIndex=-1;focusDrillQuery='';modal='manageFocusDrills';render()});
 $$('[data-edit-focus-observation]').forEach(button=>button.addEventListener('click',()=>openManagedObservation(button.dataset.editFocusObservation,button.dataset.observationGameId)));
 $$('[data-delete-focus-observation]').forEach(button=>button.addEventListener('click',()=>{
  const first=practiceFirstName(practiceFocusPlayer);
  if(!confirm(`Delete this coach observation? ${first}’s game and statistics will not be changed.`))return;
  const id=button.dataset.deleteFocusObservation,gameId=button.dataset.observationGameId;
  if(gameId){const game=(db.savedGames||[]).find(item=>item.id===gameId);if(game)game.observations=(game.observations||[]).filter(item=>item.id!==id)}
  else db.coachObservations=(db.coachObservations||[]).filter(item=>item.id!==id);
  save();render();
 }));
 $('#addFocusObservation')?.addEventListener('click',openFocusObservation);
 $('#previewPlayerFocus')?.addEventListener('click',()=>{modal='focusPublishPreview';render()});
 $('#changeFocusPlayer')?.addEventListener('click',()=>{practiceFocusPlayer='';render();window.scrollTo(0,0)});
 $('#practiceSelectAll')?.addEventListener('click',()=>{$$('[data-practice-player]').forEach(input=>input.checked=true);if(practiceResolution){practiceResolution=null;if(modal==='practiceResolution')modal=null}persistPracticeDraft()});
 $('#practiceSelectNone')?.addEventListener('click',()=>{$$('[data-practice-player]').forEach(input=>input.checked=false);if(practiceResolution){practiceResolution=null;if(modal==='practiceResolution')modal=null}persistPracticeDraft()});
 $$('[data-practice-player]').forEach(input=>input.addEventListener('change',()=>{if(practiceResolution){practiceResolution=null;if(modal==='practiceResolution')modal=null}persistPracticeDraft()}));
 $('#togglePracticeGuests')?.addEventListener('click',()=>{practiceSetupState.guestsOpen=!practiceSetupState.guestsOpen;persistPracticeDraft();render()});
 $('#addGuestPlayer')?.addEventListener('click',async()=>{const first=$('#guestPlayerFirstName')?.value.trim(),role=$('#guestPlayerRole')?.value||'Position Player',phone=$('#guestPlayerPhone')?.value.trim();if(!first){alert('Enter the guest player’s first name.');return}if(String(phone||'').replace(/\D/g,'').length<10){alert('Enter the guest player’s cell number.');return}if(practiceAttendanceRoster().some(player=>player.name.toLowerCase()===first.toLowerCase())){alert('That player name is already listed.');return}const guest={guestId:crypto.randomUUID(),name:first,phone,role,positions:guestRolePosition(role),side:'R',isPracticeGuest:true};const button=$('#addGuestPlayer');if(button){button.disabled=true;button.textContent='Creating Link…'}try{await createPendingGuestPortal(guest,'guestPlayer');practiceSetupState.guestPlayers=practiceGuestPlayers();practiceSetupState.guestPlayers.push(guest);practiceSetupState.selectedNames=[...(practiceSetupState.selectedNames||db.roster.map(player=>player.name)),first];if(practiceResolution){practiceResolution=null;if(modal==='practiceResolution')modal=null}persistPracticeDraft();render()}catch(error){if(button){button.disabled=false;button.textContent='Add Guest Player'}alert('The guest link could not be created. Confirm Cloud Backup is signed in and you have an internet connection.')}});
 $('#addGuestCoach')?.addEventListener('click',async()=>{const name=$('#guestCoachName')?.value.trim(),phone=$('#guestCoachPhone')?.value.trim();if(!name){alert('Enter the guest coach’s name.');return}if(String(phone||'').replace(/\D/g,'').length<10){alert('Enter the guest coach’s cell number.');return}const guest={guestId:crypto.randomUUID(),name,phone,isPracticeGuestCoach:true};const button=$('#addGuestCoach');if(button){button.disabled=true;button.textContent='Creating Link…'}try{await createPendingGuestPortal(guest,'guestCoach');practiceSetupState.guestCoaches=practiceGuestCoaches();practiceSetupState.guestCoaches.push(guest);persistPracticeDraft();render()}catch(error){if(button){button.disabled=false;button.textContent='Add Guest Coach'}alert('The guest link could not be created. Confirm Cloud Backup is signed in and you have an internet connection.')}});
 $$('[data-remove-guest-player]').forEach(button=>button.addEventListener('click',async()=>{const guest=practiceGuestPlayers().find(item=>item.guestId===button.dataset.removeGuestPlayer);if(guest?.portalId){if(!cloudUser||!cloudStore){alert('Sign in through Cloud Backup before removing this guest so HotB can expire the guest link.');return}try{const ref=portalDoc(guest.portalId),snapshot=await ref.get();if(snapshot.exists)await ref.update({expired:true,accessStatus:'removed',activePractice:null,updatedAt:firebase.firestore.FieldValue.serverTimestamp()})}catch(error){alert('The guest could not be removed. Check your connection and try again.');return}}practiceSetupState.guestPlayers=practiceGuestPlayers().filter(item=>item.guestId!==button.dataset.removeGuestPlayer);if(guest){practiceSetupState.selectedNames=(practiceSetupState.selectedNames||[]).filter(name=>name!==guest.name);delete practiceSetupState.accommodations?.[guest.name]}if(practiceResolution){practiceResolution=null;if(modal==='practiceResolution')modal=null}persistPracticeDraft();render()}));
 $$('[data-remove-guest-coach]').forEach(button=>button.addEventListener('click',async()=>{const guest=practiceGuestCoaches().find(item=>item.guestId===button.dataset.removeGuestCoach);if(guest?.portalId){if(!cloudUser||!cloudStore){alert('Sign in through Cloud Backup before removing this guest coach so HotB can expire the guest link.');return}try{const ref=portalDoc(guest.portalId),snapshot=await ref.get();if(snapshot.exists)await ref.update({expired:true,accessStatus:'removed',activePractice:null,updatedAt:firebase.firestore.FieldValue.serverTimestamp()})}catch(error){alert('The guest coach could not be removed. Check your connection and try again.');return}}practiceSetupState.guestCoaches=practiceGuestCoaches().filter(item=>item.guestId!==button.dataset.removeGuestCoach);persistPracticeDraft();render()}));
 $$('[data-text-practice-guest]').forEach(button=>button.addEventListener('click',()=>{const guest=[...practiceGuestPlayers(),...practiceGuestCoaches()].find(item=>item.guestId===button.dataset.textPracticeGuest),url=guestPortalTextUrl(guest);if(url)openSmsComposer(url);else alert('This guest link is not ready. Remove the guest and add them again.')}));
 $$('[data-share-setup-guest]').forEach(button=>button.addEventListener('click',()=>shareGuestPortal([...practiceGuestPlayers(),...practiceGuestCoaches()].find(item=>item.guestId===button.dataset.shareSetupGuest))));
 $$('[data-practice-adjust]').forEach(button=>button.addEventListener('click',()=>{const panel=$(`[data-accommodation-panel="${button.dataset.practiceAdjust}"]`);if(!panel)return;panel.hidden=!panel.hidden;button.textContent=panel.hidden?'Adjust':'Done'}));
 document.querySelectorAll('[data-accommodation-arrival],[data-accommodation-departure],[data-accommodation-pitch],[data-accommodation-warmup],[data-accommodation-catch],[data-accommodation-prepractice],[data-accommodation-limitations]').forEach(input=>input.addEventListener('change',()=>{
  storePracticeAccommodation(input.dataset.accommodationArrival??input.dataset.accommodationDeparture??input.dataset.accommodationPitch??input.dataset.accommodationWarmup??input.dataset.accommodationCatch??input.dataset.accommodationPrepractice??input.dataset.accommodationLimitations);
  // Any setup edit invalidates an unresolved decision immediately. Never persist
  // old verified alternatives alongside the newly edited attendance/role state.
  if(practiceResolution){practiceResolution=null;if(modal==='practiceResolution')modal=null}
  persistPracticeDraft();
 }));
 $('#practiceStartTime')?.addEventListener('change',event=>{if(!event.target.value)return;const [hour,minute]=event.target.value.split(':').map(Number),displayHour=hour%12||12;$('#practiceStartTimeDisplay').textContent=`${displayHour}:${String(minute).padStart(2,'0')}${hour<12?'a':'p'}`;refreshPracticeAccommodationDefaults();if(practiceResolution){practiceResolution=null;if(modal==='practiceResolution')modal=null}persistPracticeDraft()});
 $('#practiceDuration')?.addEventListener('change',()=>{refreshPracticeAccommodationDefaults();if(practiceResolution){practiceResolution=null;if(modal==='practiceResolution')modal=null}persistPracticeDraft()});
 $('#endPracticeDraft')?.addEventListener('click',endPracticeDraft);
 $('#generatePractice')?.addEventListener('click',()=>{
  const roster=practiceAttendanceRoster(),attendees=Array.from(document.querySelectorAll('[data-practice-player]:checked')).map(input=>roster[Number(input.dataset.practicePlayer)]).filter(Boolean);
  // Seal the exact setup this build owns so candidate verification cannot publish a plan for different inputs.
  const buildSetupSignature=()=>{
   try{
    const checked=Array.from(document.querySelectorAll('[data-practice-player]:checked')).map(input=>roster[Number(input.dataset.practicePlayer)]?.name).filter(Boolean);
    const accommodations={};
    roster.forEach(player=>{accommodations[player.name]=practiceAccommodation(player)});
    return JSON.stringify({checked,start:$('#practiceStartTime')?.value||'18:00',duration:Number($('#practiceDuration')?.value)||120,accommodations});
   }catch(error){console.error('HotB could not seal the practice build setup.',error);return ''}
  };
  const initialBuildSetupSignature=buildSetupSignature();
  let buildSetupOwnershipChecked=false;
  let buildSetupOwnershipValid=!!initialBuildSetupSignature;
  // Resolution rebuild failures are owned by rebuildResolvedPractice. Do not clear
  // its token here: doing so makes the queued verifier stale and prevents rollback.
  // Ordinary/manual builds still report these preflight problems directly.
  const resolutionApplyBuild=!!practiceResolutionApplyToken;
  if(!attendees.length){if(!resolutionApplyBuild)alert('Select at least one player attending practice.');return}
  if(!window.HotBPracticeScheduler){if(!resolutionApplyBuild)alert('The practice scheduler did not load. Close and reopen HotB, then try again.');return}
  const startTime=$('#practiceStartTime').value||'18:00',durationMinutes=Number($('#practiceDuration').value)||120;
  // Emergency Block 11 is a verified Resolution-only state. A normal/manual build
  // must never inherit 132 minutes from stale DOM, restored form state, or an
  // interrupted apply transaction.
  if(durationMinutes===132&&!practiceResolutionApplyDraftId){
   // If an apply is active, leave its ownership intact and let the outer verifier
   // restore the verified 120-minute snapshot. Manual stale Block 11 state is still
   // normalized immediately and can never be persisted as a normal setup draft.
   if(resolutionApplyBuild)return;
   alert('Block 11 can only be added by Practice Resolution after HotB verifies it for this exact practice.');
   const durationControl=$('#practiceDuration');if(durationControl)durationControl.value='120';
   practiceSetupState.durationMinutes=120;
   persistPracticeDraft();
   render();
   return;
  }
  if(durationMinutes!==120&&durationMinutes!==132){
   if(resolutionApplyBuild)return;
   alert('HotB can only build the normal 120-minute practice or a verified 132-minute Practice Resolution.');
   return;
  }
  roster.forEach((player,index)=>storePracticeAccommodation(index));
  const accommodations=structuredClone(practiceSetupState.accommodations||{}),practicePlayers=attendees.map(player=>practicePlayerModel(player,accommodations[player.name]||practiceAccommodation(player),startTime,durationMinutes));
  let noPitchersMode=null;
  // Live requires a real attending pitcher. Coach Pitch is front toss, not Live.
  // Let the scheduler return a feasibility error so Practice Resolution can
  // explain the problem instead of silently changing the station type.
  if(!practicePlayers.some(player=>player.canPitch))noPitchersMode=null;
  stopPracticeClock();practiceSetupState={...practiceSetupState,selectedNames:attendees.map(player=>player.name),startTime,durationMinutes,accommodations};practiceCoachOpen=false;practiceCardsOpen=false;practiceChosenDrills=[];practiceDraftDrills=[];practiceDrillPickerOpen=false;practiceEquipmentSetupOpen=false;
  const buildButton=$('#generatePractice');if(buildButton){buildButton.disabled=true;buildButton.textContent='Building Practice…'}
  // The build handler runs synchronously through Practice Resolution and publication.
  let buildStage='pre-scheduler';
  // A completed build publishes synchronously. render() does not require painted
  // geometry, so deferring through rAF/timers only creates another iPhone Safari
  // continuation that can be throttled or stranded after all scheduler work is done.
  let buildPublicationGeneration=0;
  const cancelPracticeBuildPublication=()=>++buildPublicationGeneration;
  const publishPracticeBuildFrame=(stage,callback)=>{
   const publicationGeneration=++buildPublicationGeneration;
   if(buildButton)buildButton.dataset.buildStage=stage;
   if(publicationGeneration!==buildPublicationGeneration)return;
   
   try{callback()}
   catch(error){
    if(publicationGeneration!==buildPublicationGeneration)return;
    console.error('HotB practice build publication failed at '+stage,error);
    
    setPracticeBuildControlsLocked(false);
    const button=$('#generatePractice');
    if(button){button.disabled=false;button.textContent='Build Practice Schedule';button.dataset.buildStage=stage+'-failed'}
    cancelPracticeBuildPublication();
    alert('HotB built the practice but could not open the next screen at '+stage+': '+String(error?.message||error||'unknown'));
   }
  };
  const recoverPracticeBuildSetup=(stage,message=null)=>{
   
   practicePlan=null;practiceResolution=null;modal=null;
   setPracticeBuildControlsLocked(false);
   const button=$('#generatePractice');
   if(button){button.disabled=false;button.textContent='Build Practice Schedule';button.dataset.buildStage=stage}
   // Error recovery uses the same guarded synchronous screen publication path.
   publishPracticeBuildFrame(stage,()=>{
    render();
    const restored=$('#generatePractice');
    if(restored){restored.disabled=false;restored.textContent='Build Practice Schedule';restored.dataset.buildStage=stage}
    if(message)alert(message);
   });
  };
  const buildSetupStillOwned=()=>{
   if(!buildSetupOwnershipValid)return false;
   if(buildSetupOwnershipChecked)return true;
   buildSetupOwnershipChecked=true;
   buildSetupOwnershipValid=buildSetupSignature()===initialBuildSetupSignature;
   return buildSetupOwnershipValid;
  };
  const setPracticeBuildControlsLocked=locked=>{
   // Freeze every setup control for the full build transaction.
   // that can alter scheduler input until publication/recovery owns a fresh screen.
   document.querySelectorAll('[data-practice-player],#practiceStartTime,#practiceDuration,[data-practice-accommodation],[data-practice-pitching],[data-practice-warmup],[data-practice-catching]').forEach(control=>{
    if(!control)return;
    if(locked){
     if(!Object.prototype.hasOwnProperty.call(control.dataset,'buildWasDisabled'))control.dataset.buildWasDisabled=control.disabled?'1':'0';
     control.disabled=true;
    }else{
     const was=control.dataset.buildWasDisabled;
     if(was!==undefined){control.disabled=was==='1';delete control.dataset.buildWasDisabled}
    }
   });
  };
  setPracticeBuildControlsLocked(true);
  buildStage='scheduler';
  if(buildButton)buildButton.dataset.buildStage='scheduler';
  
  try{
   practicePlan=window.HotBPracticeScheduler.buildSchedule(practicePlayers,startTime,durationMinutes,{noPitchersMode});
   
   buildStage='post-scheduler';
   if(buildButton)buildButton.dataset.buildStage='post-scheduler';
  }catch(error){
   console.error('HotB practice scheduler failed',error);practicePlan=null;
   setPracticeBuildControlsLocked(false);
   // During an automatic Resolution rebuild, the outer transaction owns rollback.
   // Preserve its token + draft authorization so the queued verifier can restore
   // the original verified Resolution instead of mistaking this failure for stale work.
   if(buildButton){buildButton.disabled=false;buildButton.textContent='Build Practice Schedule'}
   if(!resolutionApplyBuild)alert('HotB could not build the practice schedule. Scheduler error: '+String(error?.message||error||'unknown'));
   return
  }
  if(practicePlan.feasibilityErrors?.length){
   // The base scheduler has returned. Practice Resolution now runs as one synchronous verified transaction.
   buildStage='practice-resolution';
   // Keep the build state visible and make every long Resolution phase identifiable.
   // This also keeps the Build control locked throughout the verification transaction.
   const setResolutionStage=stage=>{
    const button=$('#generatePractice');
    if(button){
     button.disabled=true;
     const labels={'practice-resolution-budget-exceeded':'Resolution Stopped Safely…','practice-resolution-start':'Checking Practice…','practice-resolution-pitcher':'Checking Pitcher Options…','practice-resolution-catcher':'Checking Catcher Options…','practice-resolution-block11':'Checking Block 11…','practice-resolution-pitcher-block11':'Checking Pitcher + Block 11…','practice-resolution-catcher-block11':'Checking Catcher + Block 11…','practice-resolution-evidence':'Checking Resolution Evidence…','practice-resolution-evidence-complete':'Resolution Evidence Ready…','practice-resolution-seal':'Preparing Resolution…','practice-resolution-byte-seal':'Sealing Resolution…','practice-resolution-snapshot-verify':'Validating Resolution…','practice-resolution-persist':'Saving Resolution…','practice-resolution-publish':'Opening Resolution…'};
     button.textContent=labels[stage]||'Building Practice…';
    }
    
    buildStage=stage;
   };
   setResolutionStage('practice-resolution-start');
   if(!resolutionApplyBuild&&!buildSetupStillOwned()){
    recoverPracticeBuildSetup('practice-build-setup-changed','The practice setup changed while HotB was building. Nothing was committed. Please review the setup and tap Build Practice Schedule again.');
    return;
   }
   // A failed automatic Resolution rebuild must not create a second Resolution on
   // top of the coaching choice being applied. Leave transaction ownership intact;
   // the outer verifier will see this infeasible plan and roll back atomically.
   if(resolutionApplyBuild){
    
    setPracticeBuildControlsLocked(false);
    if(buildButton){buildButton.disabled=false;buildButton.textContent='Build Practice Schedule';buildButton.dataset.buildStage='resolution-rebuild-infeasible'}
    return;
   }
   const errors=practicePlan.feasibilityErrors.slice(),identityBlocked=errors.some(error=>/duplicate player names|every attending player must have a name|invalid availability/i.test(error)),availablePitchers=identityBlocked?[]:practicePlayers.filter(player=>player.canPitch),solvingPitchers=[];
   // Practice Resolution is intentionally stricter than the normal build path. It is rare,
   // so every choice shown to the coach must pass both scheduler feasibility and the full
   // rules validator before HotB is allowed to call that choice a verified solution.
   const resolutionAuditFailures=[];
   const resolutionPlanIsSafe=(plan,label)=>{
    if(!plan){resolutionAuditFailures.push(label+' did not return a schedule.');return false}
    if(plan.feasibilityErrors?.length){resolutionAuditFailures.push(label+' remained infeasible: '+[...new Set(plan.feasibilityErrors.map(error=>String(error||'').trim()).filter(Boolean))].join(' | '));return false}
    if(!Array.isArray(plan.players)||!plan.schedule||!Array.isArray(plan.times)){resolutionAuditFailures.push(label+' returned incomplete schedule data.');return false}
    const planNames=plan.players.map(player=>player.name),planNameSet=new Set(planNames),scheduleKeys=Object.keys(plan.schedule||{}),scheduleKeySet=new Set(scheduleKeys),expectedBlocks=Number(plan.durationMinutes)===132?11:10;
    if(planNames.length!==planNameSet.size||scheduleKeys.length!==scheduleKeySet.size||planNameSet.size!==scheduleKeySet.size||scheduleKeys.some((name,index)=>name!==planNames[index])){resolutionAuditFailures.push(label+' returned inconsistent attendee schedule ownership.');return false}
    if(Number(plan.durationMinutes)!==120&&Number(plan.durationMinutes)!==132){resolutionAuditFailures.push(label+' returned an unsupported practice duration.');return false}
    if(Number(plan.times.length)!==expectedBlocks){resolutionAuditFailures.push(label+' returned schedule timing that does not match its duration.');return false}
    if(planNames.some(name=>!Array.isArray(plan.schedule[name])||plan.schedule[name].length!==expectedBlocks)){resolutionAuditFailures.push(label+' returned incomplete player block coverage.');return false}
    // Candidate verification must prove the same exact clock contract as final
    // Resolution commit; otherwise an option could be advertised as verified and
    // only fail later when the coach applies it.
    const clockMinutes=value=>{const match=String(value||'').trim().match(/^(\d{1,2}):(\d{2})$/);if(!match)return null;const hour=Number(match[1]),minute=Number(match[2]);return hour>=0&&hour<24&&minute>=0&&minute<60?hour*60+minute:null};
    const verifiedStart=clockMinutes(plan.startTime);
    if(verifiedStart===null||!plan.times.every((time,index)=>time&&Number(time.block)===index+1&&clockMinutes(time.start)===(verifiedStart+index*12)%(24*60)&&clockMinutes(time.end)===(verifiedStart+(index+1)*12)%(24*60))){resolutionAuditFailures.push(label+' returned an invalid block clock.');return false}
    try{
     const audit=window.HotBPracticeScheduler.validate(plan);
     if(!Array.isArray(audit)){resolutionAuditFailures.push(label+' returned an invalid safety audit.');return false}
     if(audit.length){resolutionAuditFailures.push(label+' failed the safety audit: '+[...new Set(audit.map(error=>String(error||'').trim()).filter(Boolean))].join(' | '));return false}
     return true;
    }catch(error){
     console.error('HotB Practice Resolution audit failed',label,error);
     resolutionAuditFailures.push(label+' could not complete the safety audit.');
     return false;
    }
   };
   const verifiedCandidateNotices={};
   // One base failure may offer many named role changes, but the scheduler only
   // needs to prove structurally distinct candidates. Keep a hard transaction
   // budget as a second line of defense: if future code accidentally defeats
   // structural deduplication, iPhone Safari fails closed instead of grinding
   // through an unbounded-looking Resolution search.
   const RESOLUTION_BUILD_BUDGET=9;
   let resolutionBuildCount=1,resolutionBudgetExceeded=false;
   // The base scheduler attempt above is build #1. Candidate verification is intentionally single-build. buildSchedule already
   // returns fresh normalized player/schedule objects; cloning every 13-player
   // candidate before every scheduler pass added avoidable allocation/GC pressure
   // on iPhone Safari during the exact failure path we are trying to resolve.
   const verifyResolutionBuild=(players,duration,label,expectedChange=null)=>{
    if(resolutionBuildCount>=RESOLUTION_BUILD_BUDGET){
     if(!resolutionBudgetExceeded)resolutionAuditFailures.push('Practice Resolution stopped because its verified scheduler-build budget was exceeded.');
     resolutionBudgetExceeded=true;
     try{sessionStorage.setItem('hotb-resolution-diagnostic',JSON.stringify({bundle:'resolution436',stage:'practice-resolution-budget',state:'stopped',builds:resolutionBuildCount,budget:RESOLUTION_BUILD_BUDGET,stoppedAt:new Date().toISOString()}))}catch(error){}
     return false;
    }
    resolutionBuildCount++;
    try{
     // buildSchedule is contractually pure for its player input and returns fresh
     // plan data. The runtime regression suite exercises every resolvable fixture
     // against the same source objects, so avoid serializing every candidate twice
     // on the iPhone production path.
     const plan=window.HotBPracticeScheduler.buildSchedule(players,startTime,duration,{noPitchersMode:null});
     if(!resolutionPlanIsSafe(plan,label))return false;
     const candidateNotices=[...new Set((plan.fallbackWarnings||[]).map(value=>String(value||'').trim()).filter(Boolean))].sort();
     const expectedNames=players.map(player=>player.name),actualNames=(plan.players||[]).map(player=>player.name);
     const candidateBlockCount=Number(duration)===132?11:Number(duration)===120?10:0;
     // Combined role + Block 11 candidates must be compared with the already
     // verified 132-minute availability extension. Otherwise every player whose
     // availability legitimately reaches Block 11 is falsely counted as a role
     // mutation and the combined solution can never verify.
     const comparisonPlayers=expectedChange&&Number(duration)===132&&Number(durationMinutes)===120?(extendedPlayers||practiceResolutionExtendedPlayers(practicePlayers,startTime)):practicePlayers;
     const baselineBlockCount=Number(duration)===132?11:10;
     if(comparisonPlayers.length!==practicePlayers.length||comparisonPlayers.some(player=>!Number.isInteger(Number(player.availableFromBlock))||!Number.isInteger(Number(player.availableUntilBlock))||Number(player.availableFromBlock)<0||Number(player.availableUntilBlock)>baselineBlockCount||Number(player.availableFromBlock)>=Number(player.availableUntilBlock))){
      resolutionAuditFailures.push(label+' could not verify its comparison baseline.');return false;
     }
     const baselineByName=new Map(comparisonPlayers.map(player=>[player.name,player]));
     const changedNames=players.filter(player=>{
      const base=baselineByName.get(player.name);
      return !base||player.canPitch!==base.canPitch||player.requiresPitchWarmup!==base.requiresPitchWarmup||player.canCatch!==base.canCatch||
       player.availableFromBlock!==base.availableFromBlock||player.availableUntilBlock!==base.availableUntilBlock||
       player.arrivalTime!==base.arrivalTime||player.departureTime!==base.departureTime||player.limitations!==base.limitations||
       player.prePracticeComplete!==base.prePracticeComplete||player.isPitcher!==base.isPitcher||player.isCatcher!==base.isCatcher||player.isGuest!==base.isGuest;
     }).map(player=>player.name);
     if(!candidateBlockCount||!Array.isArray(players)||!players.length||!players.every(player=>{
      if(!player||String(player.name||'').trim()!==String(player.name||'')||!String(player.name||'').length)return false;
      if(typeof player.isPitcher!=='boolean'||typeof player.isCatcher!=='boolean'||typeof player.isGuest!=='boolean'||typeof player.prePracticeComplete!=='boolean')return false;
      if(!Number.isInteger(Number(player.availableFromBlock))||!Number.isInteger(Number(player.availableUntilBlock))||Number(player.availableFromBlock)<0||Number(player.availableUntilBlock)>candidateBlockCount||Number(player.availableFromBlock)>=Number(player.availableUntilBlock))return false;
      if(typeof player.arrivalTime!=='string'||typeof player.departureTime!=='string'||typeof player.limitations!=='string'||player.limitations.trim()!==player.limitations)return false;
      if(typeof player.canPitch!=='boolean'||typeof player.requiresPitchWarmup!=='boolean'||typeof player.canCatch!=='boolean')return false;
      if(!player.isPitcher&&(player.canPitch||player.requiresPitchWarmup))return false;
      if(!player.isCatcher&&player.canCatch)return false;
      if(!player.canPitch&&player.requiresPitchWarmup)return false;
      const availability=practiceAvailability(startTime,duration,player.arrivalTime,player.departureTime);
      return Number(player.availableFromBlock)===Number(availability.availableFromBlock)&&Number(player.availableUntilBlock)===Number(availability.availableUntilBlock);
     })){resolutionAuditFailures.push(label+' received malformed or internally inconsistent candidate player data.');return false}
     if(expectedNames.length!==new Set(expectedNames).size||actualNames.length!==new Set(actualNames).size||expectedNames.length!==actualNames.length||actualNames.some((name,index)=>name!==expectedNames[index])){resolutionAuditFailures.push(label+' changed the verified attendee order.');return false}
     if(String(plan.startTime||'')!==String(startTime)||Number(plan.durationMinutes)!==Number(duration)){resolutionAuditFailures.push(label+' changed verified practice timing.');return false}
     for(let playerIndex=0;playerIndex<players.length;playerIndex++){
      const expectedPlayer=players[playerIndex],actualPlayer=(plan.players||[])[playerIndex];
      if(actualPlayer?.name!==expectedPlayer.name){resolutionAuditFailures.push(label+' changed verified player ordering during candidate generation.');return false}
      if(!actualPlayer||Number(actualPlayer.availableFromBlock)!==Number(expectedPlayer.availableFromBlock)||Number(actualPlayer.availableUntilBlock)!==Number(expectedPlayer.availableUntilBlock)||String(actualPlayer.arrivalTime||'')!==String(expectedPlayer.arrivalTime||'')||String(actualPlayer.departureTime||'')!==String(expectedPlayer.departureTime||'')||String(actualPlayer.limitations||'')!==String(expectedPlayer.limitations||'')){resolutionAuditFailures.push(label+' changed verified player availability or limitations.');return false}
      if(actualPlayer.canPitch!==expectedPlayer.canPitch||actualPlayer.requiresPitchWarmup!==expectedPlayer.requiresPitchWarmup||actualPlayer.canCatch!==expectedPlayer.canCatch||actualPlayer.prePracticeComplete!==expectedPlayer.prePracticeComplete||actualPlayer.isPitcher!==expectedPlayer.isPitcher||actualPlayer.isCatcher!==expectedPlayer.isCatcher||actualPlayer.isGuest!==expectedPlayer.isGuest){resolutionAuditFailures.push(label+' changed verified player role or practice identity state.');return false}
     }
     if(expectedChange?.role&&expectedChange?.name){
      // A role Resolution may alter exactly one verified player and exactly the
      // approved role fields. For combined Block 11 options the comparison baseline
      // already includes only the legitimate availability extension above.
      if(changedNames.length!==1||changedNames[0]!==expectedChange.name){resolutionAuditFailures.push(label+' changed state outside the approved player.');return false}
      const changed=(plan.players||[]).find(player=>player.name===expectedChange.name),base=baselineByName.get(expectedChange.name);
      if(!changed||!base)return false;
      // The generated plan must preserve the candidate input exactly; role proof is
      // against the correct 10- or 11-block baseline, never against mutable setup.
      const candidate=players.find(player=>player.name===expectedChange.name);
      if(!candidate||changed.canPitch!==candidate.canPitch||changed.requiresPitchWarmup!==candidate.requiresPitchWarmup||changed.canCatch!==candidate.canCatch)return false;
      if(expectedChange.role==='pitcher'){
       if(base.canPitch!==true||changed.canPitch!==false||changed.requiresPitchWarmup!==false||changed.canCatch!==base.canCatch)return false;
      }else if(expectedChange.role==='catcher'){
       if(base.canCatch!==true||changed.canCatch!==false||changed.canPitch!==base.canPitch||changed.requiresPitchWarmup!==base.requiresPitchWarmup)return false;
      }else return false;
     }else if(Number(duration)===Number(durationMinutes)){
      // A same-duration candidate with no declared coaching change must be
      // byte-for-byte equivalent in player state to the failed base attempt.
      if(changedNames.length){resolutionAuditFailures.push(label+' contained an undeclared player-state change.');return false}
     }else{
      // Block 11 is the only duration-only Resolution. It may extend availability
      // only for players who were present through the original practice end.
      if(Number(duration)!==132||Number(durationMinutes)!==120)return false;
      const extended=extendedPlayers||practiceResolutionExtendedPlayers(practicePlayers,startTime);
      if(extended.length!==practicePlayers.length||extended.some(player=>Number(player.availableFromBlock)<0||Number(player.availableUntilBlock)<0)){resolutionAuditFailures.push(label+' could not verify the Block 11 extension baseline.');return false}
      const extendedByName=new Map(extended.map(player=>[player.name,player]));
      if(players.some(player=>{
       const expected=extendedByName.get(player.name);
       return !expected||player.availableFromBlock!==expected.availableFromBlock||player.availableUntilBlock!==expected.availableUntilBlock||
        player.arrivalTime!==expected.arrivalTime||player.departureTime!==expected.departureTime||player.limitations!==expected.limitations||
        player.canPitch!==expected.canPitch||player.requiresPitchWarmup!==expected.requiresPitchWarmup||player.canCatch!==expected.canCatch||
        player.prePracticeComplete!==expected.prePracticeComplete||player.isPitcher!==expected.isPitcher||player.isCatcher!==expected.isCatcher||player.isGuest!==expected.isGuest;
      })){resolutionAuditFailures.push(label+' changed player state beyond the verified Block 11 extension.');return false}
     }
     // Publish candidate metadata only after every identity/availability/role proof
     // above succeeds. A failed candidate must leave no residue that can later be
     // mistaken for a verified coaching choice.
     verifiedCandidateNotices[label]=candidateNotices.slice();
     return true;
    }catch(error){
     console.error('HotB Practice Resolution build failed',label,error);
     resolutionAuditFailures.push(label+' could not complete the verification build.');
     return false;
    }
   };

   // Candidate fan-out is the expensive part of a 13-player Resolution. Verify candidates in deterministic order against the same sealed setup.
   const resolutionCandidateShape=spec=>{
    // Names are intentionally excluded. Candidate alternatives that produce the
    // same scheduling-role/availability shape are interchangeable for feasibility;
    // proving every name permutation only repeats the same 13-player solve and was
    // exhausting iPhone Safari before Practice Resolution could publish.
    const shape=(spec.players||[]).map(player=>({
     isPitcher:!!player.isPitcher,isCatcher:!!player.isCatcher,isGuest:!!player.isGuest,
     canPitch:!!player.canPitch,requiresPitchWarmup:!!player.requiresPitchWarmup,canCatch:!!player.canCatch,
     prePracticeComplete:!!player.prePracticeComplete,
     availableFromBlock:Number(player.availableFromBlock),availableUntilBlock:Number(player.availableUntilBlock),
     limitations:String(player.limitations||'')
    }));
    // Roster order is irrelevant to structural capacity. Sort the anonymous role
    // records so "Lydia not catching" and "Tayte not catching" collapse only when
    // their actual scheduler constraints are identical.
    return JSON.stringify({duration:Number(spec.duration),players:shape.map(value=>JSON.stringify(value)).sort()});
   };
   const runResolutionCandidates=(candidates,stage,buildCandidate,onSafe,ownershipMessage,stopAfterFirst=false)=>{
    const stageLabels={'practice-resolution-pitcher':'Pitcher','practice-resolution-catcher':'Catcher','practice-resolution-pitcher-block11':'Pitcher + Block 11','practice-resolution-catcher-block11':'Catcher + Block 11'};
    const unique=[],seenShapes=new Set();
    for(const candidate of candidates){
     const spec=buildCandidate(candidate),shape=resolutionCandidateShape(spec);
     if(seenShapes.has(shape))continue;
     seenShapes.add(shape);unique.push({candidate,spec});
    }
    for(let index=0;index<unique.length;index++){
     if(!buildSetupStillOwned()){recoverPracticeBuildSetup('practice-build-setup-changed',ownershipMessage);return false}
     const {candidate,spec}=unique[index],button=$('#generatePractice');
     setResolutionStage(stage);
     if(button)button.textContent='Checking '+(stageLabels[stage]||'Resolution')+' '+(index+1)+'/'+unique.length+'…';
     const started=typeof performance!=='undefined'&&performance.now?performance.now():Date.now();
     const diagnosticBase={bundle:'resolution426',stage,label:spec.label,index:index+1,total:unique.length,sourceCandidates:candidates.length,startedAt:new Date().toISOString()};
     try{sessionStorage.setItem('hotb-resolution-diagnostic',JSON.stringify({...diagnosticBase,state:'started'}))}catch(error){}
     const safe=verifyResolutionBuild(spec.players,spec.duration,spec.label,spec.expectedChange);
     const elapsed=Math.round((typeof performance!=='undefined'&&performance.now?performance.now():Date.now())-started);
     // A candidate that returns is never allowed to leave the transaction looking
     // like it is still inside that candidate. Publish completion immediately so a
     // real-device screenshot distinguishes scheduler work from post-search work.
     if(button)button.textContent='Checked '+(stageLabels[stage]||'Resolution')+' '+(index+1)+'/'+unique.length+' — '+(safe?'safe':'not safe')+'…';
     try{sessionStorage.setItem('hotb-resolution-diagnostic',JSON.stringify({...diagnosticBase,state:'completed',elapsedMs:elapsed,safe,completedAt:new Date().toISOString()}))}catch(error){}
     if(safe){
      onSafe(candidate,spec);
      if(stopAfterFirst)return true;
     }
    }
    return true;
   };
   // Resolve the least-disruptive option first. For a normal 120-minute practice,
   // Block 11 changes no player's role and is a single scheduler proof. If it works,
   // publish that verified choice immediately instead of forcing iPhone Safari through
   // every pitcher/catcher permutation before it can open Practice Resolution.
   let canExtend=false,combinedPitchers=[],solvingCatchers=[],combinedCatchers=[];
   const availableCatchers=identityBlocked?[]:practicePlayers.filter(player=>player.canCatch);
   let extendedPlayers=null,extensionBaselineValid=false;
   if(!identityBlocked&&Number(durationMinutes)===120){
    extendedPlayers=practiceResolutionExtendedPlayers(practicePlayers,startTime);
    extensionBaselineValid=extendedPlayers.length===practicePlayers.length&&extendedPlayers.every(player=>Number.isInteger(Number(player.availableFromBlock))&&Number.isInteger(Number(player.availableUntilBlock))&&Number(player.availableFromBlock)>=0&&Number(player.availableUntilBlock)<=11&&Number(player.availableFromBlock)<Number(player.availableUntilBlock));
    if(extensionBaselineValid){
     setResolutionStage('practice-resolution-block11');
     if(!buildSetupStillOwned()){recoverPracticeBuildSetup('practice-build-setup-changed','The practice setup changed while HotB was verifying Block 11. Nothing was committed. Please review the setup and build again.');return}
     canExtend=verifyResolutionBuild(extendedPlayers,132,'Block 11');
    }else resolutionAuditFailures.push('Block 11 availability could not be verified against the production availability rules.');
   }
   // If Block 11 is safe, it is already a complete verified resolution and no role
   // fan-out is needed. Only search role changes when the duration-only solution fails.
   if(!canExtend){
    if(!runResolutionCandidates(
     availablePitchers,'practice-resolution-pitcher',
     pitcher=>({players:practicePlayers.map(player=>player.name===pitcher.name?{...player,canPitch:false,requiresPitchWarmup:false}:player),duration:durationMinutes,label:'Hitting Only: '+pitcher.name,expectedChange:{role:'pitcher',name:pitcher.name}}),
     pitcher=>solvingPitchers.push(pitcher.name),
     'The practice setup changed while HotB was verifying Practice Resolution. Nothing was committed. Please review the setup and build again.',true
    ))return;
    // One verified 120-minute role change is sufficient. If Hitting Only works,
    // do not spend another scheduler build proving a catcher alternative that is
    // unnecessary to unblock this practice.
    if(!solvingPitchers.length){
     if(!runResolutionCandidates(
      availableCatchers,'practice-resolution-catcher',
      catcher=>({players:practicePlayers.map(player=>player.name===catcher.name?{...player,canCatch:false}:player),duration:durationMinutes,label:'Not Catching: '+catcher.name,expectedChange:{role:'catcher',name:catcher.name}}),
      catcher=>solvingCatchers.push(catcher.name),
      'The practice setup changed while HotB was verifying Practice Resolution. Nothing was committed. Please review the setup and build again.',true
     ))return;
    }
    // Combined role + Block 11 choices are fallback proofs only. They are useful when
    // neither the plain extension nor a one-role 120-minute change is sufficient.
    if(extensionBaselineValid&&!solvingPitchers.length&&!solvingCatchers.length){
     const combinedPitcherCandidates=extendedPlayers.filter(player=>player.canPitch);
     if(!runResolutionCandidates(
      combinedPitcherCandidates,'practice-resolution-pitcher-block11',
      pitcher=>({players:extendedPlayers.map(player=>player.name===pitcher.name?{...player,canPitch:false,requiresPitchWarmup:false}:player),duration:132,label:'Hitting Only + Block 11: '+pitcher.name,expectedChange:{role:'pitcher',name:pitcher.name}}),
      pitcher=>combinedPitchers.push(pitcher.name),
      'The practice setup changed while HotB was verifying Practice Resolution. Nothing was committed. Please review the setup and build again.',true
     ))return;
     // As with the 120-minute role search, stop the category fan-out once one
     // combined role + Block 11 solution is proven.
     if(!combinedPitchers.length){
      const combinedCatcherCandidates=extendedPlayers.filter(player=>player.canCatch);
      if(!runResolutionCandidates(
       combinedCatcherCandidates,'practice-resolution-catcher-block11',
       catcher=>({players:extendedPlayers.map(player=>player.name===catcher.name?{...player,canCatch:false}:player),duration:132,label:'Not Catching + Block 11: '+catcher.name,expectedChange:{role:'catcher',name:catcher.name}}),
       catcher=>combinedCatchers.push(catcher.name),
       'The practice setup changed while HotB was verifying Practice Resolution. Nothing was committed. Please review the setup and build again.',true
      ))return;
     }
    }
   }
   // Candidate fan-out is complete. Normalize once, then enter verified evidence publication.
   solvingPitchers=[...new Set(solvingPitchers)].sort();
   solvingCatchers=[...new Set(solvingCatchers)].sort();
   combinedPitchers=[...new Set(combinedPitchers)].filter(name=>!solvingPitchers.includes(name)).sort();
   combinedCatchers=[...new Set(combinedCatchers)].filter(name=>!solvingCatchers.includes(name)).sort();
   try{sessionStorage.setItem('hotb-resolution-diagnostic',JSON.stringify({bundle:'resolution426',stage:'practice-resolution-evidence',state:'candidate-search-complete',at:new Date().toISOString(),canExtend,solvingPitchers:[...solvingPitchers],solvingCatchers:[...solvingCatchers],combinedPitchers:[...combinedPitchers],combinedCatchers:[...combinedCatchers]}))}catch(error){}
   setResolutionStage('practice-resolution-evidence');
   if(!buildSetupStillOwned()){recoverPracticeBuildSetup('practice-build-setup-changed','The practice setup changed while HotB was preparing Practice Resolution evidence. Nothing was committed. Please review the setup and build again.');return}
   const survivingCandidateLabels=new Set([
    ...solvingPitchers.map(name=>'Hitting Only: '+name),
    ...solvingCatchers.map(name=>'Not Catching: '+name),
    ...(canExtend?['Block 11']:[]),
    ...combinedPitchers.map(name=>'Hitting Only + Block 11: '+name),
    ...combinedCatchers.map(name=>'Not Catching + Block 11: '+name)
   ]);
   for(const label of Object.keys(verifiedCandidateNotices)){if(!survivingCandidateLabels.has(label))delete verifiedCandidateNotices[label]}
   const candidateEvidenceComplete=[...survivingCandidateLabels].every(label=>Object.prototype.hasOwnProperty.call(verifiedCandidateNotices,label)&&Array.isArray(verifiedCandidateNotices[label]))&&Object.keys(verifiedCandidateNotices).length===survivingCandidateLabels.size;
   let finalCandidateEvidence='';
   try{finalCandidateEvidence=JSON.stringify(verifiedCandidateNotices)}catch(error){resolutionAuditFailures.push('Practice Resolution candidate evidence could not be sealed after final filtering.')}
   if(!candidateEvidenceComplete||!finalCandidateEvidence){
    resolutionAuditFailures.push('Practice Resolution candidate evidence did not match the final verified choices.');
    solvingPitchers=[];solvingCatchers=[];canExtend=false;combinedPitchers=[];combinedCatchers=[];
    for(const label of Object.keys(verifiedCandidateNotices))delete verifiedCandidateNotices[label];
   }
   const hasVerifiedResolution=!!(solvingPitchers.length||solvingCatchers.length||canExtend||combinedPitchers.length||combinedCatchers.length);
   // Budget exhaustion is a transaction failure, not merely another infeasible
   // candidate. Never publish a partial set of choices after the verifier stops.
   if(resolutionBudgetExceeded){
    setResolutionStage('practice-resolution-budget-exceeded');
    solvingPitchers=[];solvingCatchers=[];canExtend=false;combinedPitchers=[];combinedCatchers=[];
    for(const label of Object.keys(verifiedCandidateNotices))delete verifiedCandidateNotices[label];
    recoverPracticeBuildSetup('practice-resolution-budget-exceeded','HotB stopped Practice Resolution before it could exceed its safe scheduler-build limit. Nothing was committed. Please review the setup and build again.');
    return;
   }
   // Evidence and setup ownership were proven immediately above. Build the sealed
   // decision directly instead of adding two more UI/state transitions on the same tap.
   const rosterGuidance=identityBlocked?'HotB found attendee identity or availability information that must be corrected before resolution. Fix the roster/guest or arrival/departure entry and build again; HotB will not guess or silently normalize it.':resolutionAuditFailures.length&&!hasVerifiedResolution?'HotB could not verify a safe automatic resolution because one or more verification builds/audits did not complete. Change attendance or availability, or build again after correcting the reported verification problem.':availablePitchers.length?'If HotB cannot prove another one-practice solution works, change attendance or availability here. HotB will not choose a hitter to remove.':'HotB needs a change to attendance or availability before it can satisfy every absolute rule.';
   const resolutionSignature=practiceResolutionSignature(practicePlayers,startTime,durationMinutes);
   const cleanResolutionText=value=>String(value??'').trim();
   const cleanResolutionList=values=>[...new Set((Array.isArray(values)?values:[]).map(cleanResolutionText).filter(Boolean))].sort();
   practiceResolution={
    errors:cleanResolutionList(errors),
    pitchers:solvingPitchers,catchers:solvingCatchers,canExtend,combinedPitchers,combinedCatchers,rosterGuidance,
    practicePlayers,startTime,durationMinutes,noPitchersMode,
    notices:cleanResolutionList(practicePlan.fallbackWarnings),
    auditFailures:cleanResolutionList(resolutionAuditFailures),
    candidateNotices:Object.fromEntries(Object.entries(verifiedCandidateNotices).sort(([a],[b])=>a.localeCompare(b)).map(([key,value])=>[key,cleanResolutionList(value)])),
    signature:resolutionSignature,
    decisionSignature:''
   };
   // Persist a second seal over the verified alternatives themselves. A restored
   // Resolution cannot add, remove, or swap a coaching choice without invalidating
   // the transaction and forcing a fresh verification build.
   practiceResolution.decisionSignature=practiceResolutionDecisionSignature(practiceResolution);
   // Candidate evidence was already sealed before this object was constructed.
   // The decision signature plus the full snapshot validator below are the canonical
   // publication proof; avoid a second JSON serialization and two extra stage writes.
   practiceSetupState.selectedNames=practicePlayers.map(player=>player.name);
   practiceSetupState.startTime=startTime;
   practiceSetupState.durationMinutes=durationMinutes;
   if(!practiceResolutionSnapshotIsCurrentAndValid(practiceResolution)){
    console.error('HotB refused to publish an internally inconsistent Practice Resolution.');
    // Nothing from this failed Resolution has been committed yet. Recovery owns
    // restoring/persisting the original setup; do not perform a redundant draft
    // save immediately before that recovery transaction.
    recoverPracticeBuildSetup('practice-resolution-snapshot-invalid','HotB could not verify the Practice Resolution decision data. Your original 120-minute setup was kept unchanged.');
    return;
   }
   // The Resolution object is fully verified above. Do not synchronously serialize,
   // save, restore, stringify and compare the entire active practice session inside
   // the same iPhone tap. That redundant publication transaction was the remaining
   // long main-thread section after candidate generation and could leave Safari
   // visibly stranded at the finalization stage even though the decision was ready.
   // Persist one canonical recovery draft, then do a lightweight identity check.
   setResolutionStage('practice-resolution-persist');
   if(!buildSetupStillOwned()){recoverPracticeBuildSetup('practice-build-setup-changed','The practice setup changed before Practice Resolution could be saved. Nothing was committed. Please review the setup and build again.');return}
   practicePlan=null;
   if(persistPracticeDraft()!==true){console.error('HotB could not persist the verified Practice Resolution draft.');recoverPracticeBuildSetup('practice-resolution-persist-failed','HotB could not save the verified Practice Resolution. Your practice setup was kept so you can build again.');return}
   const savedResolution=db.activePracticeSession?.resolution;
   if(!savedResolution||savedResolution.signature!==practiceResolution.signature||savedResolution.decisionSignature!==practiceResolution.decisionSignature){
    console.error('HotB refused Practice Resolution persistence that did not retain the verified identity.');
    recoverPracticeBuildSetup('practice-resolution-publication-invalid','HotB stopped because the saved Practice Resolution did not retain the verified decision. Please build the practice again.');return;
   }
   // Persistence just proved the saved decision identity against the fully
   // validated live snapshot. Setup controls are still locked and this code has
   // not yielded, so publish immediately rather than recomputing the setup signature.
   setResolutionStage('practice-resolution-publish');
   modal='practiceResolution';
   // All scheduler/evidence/persistence work is complete before the modal handoff.
   // Scheduler/evidence/persistence verification is complete; publish the Resolution screen.
   
   publishPracticeBuildFrame('practice-resolution-publish',()=>{
    render();
    setPracticeBuildControlsLocked(false);
    window.scrollTo(0,0);
   });
   return;
  }
  if(practicePlan.fallbackWarnings?.length){
   practicePlan.buildNotices=practicePlan.fallbackWarnings.slice();
  }
  // A rebuilt Resolution must retain the same draft identity for the entire
  // apply transaction. Ordinary builds get a fresh identity; Resolution rebuilds
  // reuse the verified expected identity assigned before the automatic Build click.
  const resolutionBuildDraftId=practiceResolutionApplyDraftId;
  // All Resolution transaction identities must agree before the generated plan is
  // allowed to inherit the verified draft ID. This catches partial cleanup or a
  // stale authorization before any plan can be committed.
  if(practiceResolutionApplyToken&&(!resolutionBuildDraftId||!practiceResolutionApplyOwnedDraftId||resolutionBuildDraftId!==practiceResolutionApplyOwnedDraftId)){
   console.error('HotB refused mismatched Practice Resolution transaction identities');
   // Keep transaction ownership intact. The outer verifier owns the immutable
   // rollback snapshot and must be allowed to restore it atomically. Stop this
   
   setPracticeBuildControlsLocked(false);
   practicePlan=null;
   if(buildButton){buildButton.disabled=false;buildButton.textContent='Build Practice Schedule';buildButton.dataset.buildStage='resolution-identity-mismatch'}
   return;
  }
  buildStage='finalizing-plan';
  if(buildButton)buildButton.dataset.buildStage='finalizing-plan';
  // Finalization is also protected by the immutable setup seal. Resolution
  // verification may be substantial; never publish a valid schedule
  // after the coach's live setup has diverged from the inputs that produced it.
  if(!resolutionApplyBuild&&!buildSetupStillOwned()){
   recoverPracticeBuildSetup('practice-build-setup-changed','The practice setup changed before HotB could publish the schedule. Nothing was committed. Please review the setup and build again.');
   return;
  }
  try{
   practicePlan.portalDraftId=resolutionBuildDraftId||crypto.randomUUID();
   practicePlan.machineFocus='Standard';
   practicePlan.frontTossFocus='Standard';
  }catch(error){
   console.error('HotB could not finalize the completed practice plan.',error);
   if(resolutionApplyBuild){
    setPracticeBuildControlsLocked(false);practicePlan=null;
    if(buildButton){buildButton.disabled=false;buildButton.textContent='Build Practice Schedule';buildButton.dataset.buildStage='resolution-finalize-failed'}
    return;
   }
   recoverPracticeBuildSetup('practice-plan-finalize-failed','HotB built the schedule but could not finalize the practice plan. Your setup was kept so you can build again.');
   return;
  }
  // Draft identity is authoritative; publication follows immediately.
  buildStage=resolutionApplyBuild?'resolution-apply-ready':'practice-plan-publication-ready';
  if(buildButton)buildButton.dataset.buildStage=buildStage;
  // The build authorization is consumed here, but the transaction token remains
  // alive until the outer Resolution verifier commits or rolls back this exact plan.
  practiceResolutionApplyDraftId=null;
  // Validation remains available for audits, but do not run the full synchronous
  // validator on the iPhone build path. The scheduler already enforces these
  // constraints while constructing the plan, and this second pass can stall the UI.
  // The schedule is complete. Move to the plan screen immediately.
  // Do not persist from the build click path; persistence is handled by the normal
  // practice workflow after the completed screen is visible.
  // Let the Build click finish before replacing the entire practice screen.
  // iOS Home Screen Safari can stall when HotB rewrites #app and rebinds every
  // practice control synchronously inside the same tap handler.
  practiceSection='builder';
  // Automatic Resolution rebuilds are still uncommitted here. The owning
  // transaction will audit persistence/recovery and then render the final builder
  // (or roll back). Never expose this transient plan or its notice as interactive UI.
  if(resolutionApplyBuild){
   // The outer Resolution transaction owns verification and final publication from
   // this point forward. Keep setup controls locked until that transaction either
   // commits or rolls back; exposing them here reopens the race we sealed above.
   
   return;
  }
  if(practicePlan.buildNotices?.length){
   modal='practiceBuildNotice';
   
   publishPracticeBuildFrame('practice-build-notice',()=>{render();setPracticeBuildControlsLocked(false);window.scrollTo(0,0)});
   return;
  }
  
  publishPracticeBuildFrame('practice-plan-publish',()=>{render();setPracticeBuildControlsLocked(false);window.scrollTo(0,0)});
 });
 $('#editPracticePlayers')?.addEventListener('click',()=>{if(db.activePortalPractice?.id===practicePlan?.portalDraftId){alert('Deactivate the player and coach portal plans before editing attendance or rebuilding this practice.');return}stopPracticeClock();const accommodations=Object.fromEntries(practicePlan.players.map(player=>[player.name,{arrival:player.arrivalTime!==practicePlan.startTime?player.arrivalTime:'',departure:player.departureTime!==practiceEndValue(practicePlan.startTime,practicePlan.durationMinutes)?player.departureTime:'',limitations:practiceSetupState.accommodations?.[player.name]?.limitations||'',prePracticeComplete:!!player.prePracticeComplete,canPitch:player.canPitch,requiresPitchWarmup:player.requiresPitchWarmup,canCatch:player.canCatch}]));practiceSetupState={...practiceSetupState,selectedNames:practicePlan.players.map(player=>player.name),startTime:practicePlan.startTime,durationMinutes:practicePlan.durationMinutes,accommodations};practicePlan=null;practiceSection='setup';persistPracticeDraft();render();window.scrollTo(0,0)});
 $('#togglePracticeCoach')?.addEventListener('click',()=>{practiceCoachOpen=!practiceCoachOpen;if(practiceCoachOpen)practiceCardsOpen=false;render();window.scrollTo(0,0);if(practiceClock.running)updatePracticeClock()});
 $('#togglePracticeCards')?.addEventListener('click',()=>{practiceCardsOpen=!practiceCardsOpen;if(practiceCardsOpen)practiceCoachOpen=false;render();window.scrollTo(0,0);if(practiceClock.running)updatePracticeClock()});
 $('#startPracticeClock')?.addEventListener('click',()=>{
  if(practiceClock.finished)return;
  if(practiceClock.running){
   alert('The practice clock is already running. HotB will keep the current block and time so an accidental tap cannot reset the live practice.');
   return;
  }
  beginPracticeClock();
 });
 $('#endPracticeClock')?.addEventListener('click',endPracticeFromScreen);
 $('#activatePlayerPlans')?.addEventListener('click',activatePlayerPlans);
 $('#deactivatePlayerPlans')?.addEventListener('click',deactivatePlayerPlans);
 $$('[data-share-practice-guest]').forEach(button=>button.addEventListener('click',()=>shareGuestPortal([...practiceGuestPlayers(),...practiceGuestCoaches()].find(item=>item.guestId===button.dataset.sharePracticeGuest))));
 $$('[data-share-practice-jenkins]').forEach(button=>button.addEventListener('click',()=>shareGuestPortal(db.roster.find(player=>player.isTeamJenkins&&player.name===button.dataset.sharePracticeJenkins))));
 $$('[data-text-practice-jenkins]').forEach(button=>button.addEventListener('click',()=>{const player=db.roster.find(item=>item.isTeamJenkins&&item.name===button.dataset.textPracticeJenkins),url=guestPortalTextUrl(player);if(url)openSmsComposer(url);else alert('This Team Jenkins practice link is not ready. Activate the practice plan first.')}));
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
   const available=competitionRoster().filter(r=>!used.has(r.name));
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
 $$('[data-opponent-choice]').forEach(button=>button.onclick=()=>{opponent.value=button.dataset.opponentChoice;opponentMenu.hidden=true;update()});
 $$('[data-pitcher-choice]').forEach(button=>button.onclick=()=>{pitcherName.value=button.dataset.pitcherChoice;pitcherNumber.value=button.dataset.pitcherNumber||'';pitcherMenu.hidden=true;update()});
 $$('[data-delete-opponent]').forEach(button=>button.onclick=event=>{
  event.stopPropagation();
  const team=button.dataset.deleteOpponent;
  if(!confirm(`Remove ${team} from the saved opponent list? Previous games and hitter data will not be changed.`))return;
  db.teams=(db.teams||[]).filter(item=>item!==team);
  if(opponent.value===team)opponent.value='';
  save();button.closest('.matchup-picker-option')?.remove();update();
 });
 $$('[data-delete-pitcher-name]').forEach(button=>button.onclick=event=>{
  event.stopPropagation();
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
  try{
   if(createGame(opponent.value.trim(),pitcherName.value.trim(),pitcherNumber.value.trim(),order))go('live');
  }catch(error){
   console.error('HotB Start Game failed',error);
   alert('HotB could not open In Game. Diagnostic: '+String(error?.message||error||'unknown error'));
  }
 };
}
function bindReportsPage(){
 $('#openGamesSelector')?.addEventListener('click',()=>{modal='gamesSelection';render()});
 bindDateFilters('saved');
 $$('[data-view-game]').forEach(button=>button.onclick=()=>{reportGameId=button.dataset.viewGame;reportMode='game';reportFilterHitter='All Hitters';reportOpponent='All Opponents';modal='reports';render()});
 $$('[data-delete-game]').forEach(button=>button.onclick=()=>{const game=db.savedGames.find(item=>item.id===button.dataset.deleteGame);if(!game)return;if(!confirm(`Delete the saved game against ${game.opponent||'Opponent'} from ${new Date(game.date).toLocaleDateString()}? This cannot be undone.`))return;db.savedGames=db.savedGames.filter(item=>item.id!==game.id);(db.gameGroups||[]).forEach(group=>{group.gameIds=(group.gameIds||[]).filter(id=>id!==game.id)});reportSelectedGameIds=reportSelectedGameIds.filter(id=>id!==game.id);if(reportGameId===game.id)reportGameId=null;save();render()});
 $('#exportFullBackup')?.addEventListener('click',exportFullBackup);
 $('#restoreFullBackup')?.addEventListener('click',()=>$('#fullBackupFile').click());
 $('#fullBackupFile')?.addEventListener('change',async event=>{const file=event.target.files?.[0];if(!file)return;try{await restoreFullBackup(file)}catch(error){alert(error.message||'HotB could not restore that backup.')}});
}
function bindGamesSelection(){
 const checked=()=>$$('#reportGameChoices input:checked').map(input=>input.value);
 const update=()=>{reportSelectedGameIds=checked();const view=$('#openSelectedReports'),saveGroup=$('#saveSelectionGroup');if(view){view.disabled=!reportSelectedGameIds.length;view.textContent=reportSelectedGameIds.length===1?'View 1 Game':`View ${reportSelectedGameIds.length} Games`}if(saveGroup)saveGroup.hidden=reportSelectedGameIds.length<2};
 $$('#reportGameChoices input').forEach(input=>input.onchange=update);update();
 $('#selectAllGames')?.addEventListener('click',()=>{reportMode='saved';reportOpponent='All Opponents';modal='reports';render()});
 $('#openSelectedReports')?.addEventListener('click',()=>{if(!reportSelectedGameIds.length)return;reportMode='selection';reportOpponent='All Opponents';modal='reports';render()});
 $('#newGameGroup')?.addEventListener('click',()=>{reportSelectedGameIds=[];modal='gameGroup:new';render()});
 $('#saveSelectionGroup')?.addEventListener('click',()=>{reportSelectedGameIds=checked();modal='gameGroup:new';render()});
 $$('[data-open-group]').forEach(button=>button.onclick=()=>{reportGroupId=button.dataset.openGroup;reportMode='group';reportOpponent='All Opponents';modal='reports';render()});
 $$('[data-edit-group]').forEach(button=>button.onclick=()=>{modal=`gameGroup:${button.dataset.editGroup}`;render()});
 $$('[data-rename-group]').forEach(button=>button.onclick=()=>{const group=db.gameGroups.find(item=>item.id===button.dataset.renameGroup),name=prompt('Group name',group?.name||'')?.trim();if(!group||!name)return;group.name=name;save();render()});
 $$('[data-delete-group]').forEach(button=>button.onclick=()=>{const group=db.gameGroups.find(item=>item.id===button.dataset.deleteGroup);if(!group||!confirm(`Delete the game group “${group.name}”? Saved games will not be deleted.`))return;db.gameGroups=db.gameGroups.filter(item=>item.id!==group.id);if(reportGroupId===group.id){reportGroupId=null;if(reportMode==='group')reportMode='saved'}save();render()});
}

function bindGameGroup(){
 $('#saveGameGroup')?.addEventListener('click',()=>{
  const name=$('#gameGroupName').value.trim(),gameIds=$$('#groupGameChoices input:checked').map(input=>input.value),id=$('#saveGameGroup').dataset.groupId;
  if(!name){alert('Enter a name for this game group.');return}if(!gameIds.length){alert('Select at least one saved game.');return}
  const existing=db.gameGroups.find(group=>group.id===id);
  if(existing){existing.name=name;existing.gameIds=gameIds}else db.gameGroups.push({id:crypto.randomUUID(),name,gameIds,createdAt:new Date().toISOString()});
  save();modal=null;render();
 });
}
function bindRoster(){
 $$('.sidebtn').forEach(b=>b.onclick=()=>{db.roster[+b.dataset.i].side=b.dataset.side;save();render()});
 document.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{if(!confirm('Remove this player?'))return;const index=+b.dataset.del,player=db.roster[index];if(!player)return;const standardName=player.rosterKey||defaultRoster.find(profile=>profile.name===player.name)?.name;if(standardName&&defaultRoster.some(profile=>profile.name===standardName)){db.removedRosterNames=Array.isArray(db.removedRosterNames)?db.removedRosterNames:[];if(!db.removedRosterNames.includes(standardName))db.removedRosterNames.push(standardName)}if(practicePlan||db.activePracticeSession||db.activePortalPractice){alert('End or discard the active practice before removing a player who may be part of its saved schedule.');return}db.roster.splice(index,1);save();render()});
 $$('[data-info]').forEach(b=>b.onclick=()=>{if(!syncRosterNames())return;infoPlayerIndex=+b.dataset.info;infoPlayerName=db.roster[infoPlayerIndex]?.name||'';save();modal='playerInfo';render()});
 $('#addPlayer').onclick=()=>{db.roster.push({name:'Guest',side:'R',jersey:'',grad:'',positions:'',gpa:'',interest:'',school:'',isGuest:true});save();render();setTimeout(()=>window.scrollTo(0,document.body.scrollHeight),0)};
 $('#saveRoster').onclick=()=>{if(!syncRosterNames())return;save();go('home')};
 $('#importRosterInfo').onclick=()=>{if(!syncRosterNames())return;save();$('#rosterInfoFile').click()};
 $('#rosterInfoFile').onchange=async event=>{
  const file=event.target.files?.[0];if(!file)return;
  try{pendingRosterImport=await parseRosterWorkbook(file);modal='importRoster';render()}catch(error){alert(error.message||'HotB could not read that spreadsheet.')}
 };
 $('#exportRosterInfo').onclick=()=>{if(!syncRosterNames())return;save();exportRosterWorkbook()};
}
function bindPlayerInfo(){
 $('#savePlayerInfo').onclick=()=>{
  const player=db.roster[infoPlayerIndex];if(!player||player.name!==infoPlayerName)return;
  $$('[data-info-field]').forEach(field=>player[field.dataset.infoField]=field.value.trim());
  if(!['R','L','SL'].includes(player.side.toUpperCase()))player.side='R';else player.side=player.side.toUpperCase();
  player.throws=(player.throws||'').toUpperCase();
  save();modal=null;render();
 };
}
function bindFocusPublishPreview(){
 $('#confirmPublishPlayerFocus')?.addEventListener('click',async()=>{
  const player=db.roster.find(item=>!item.isTeamJenkins&&item.name===practiceFocusPlayer),focus=playerFocusPortalPayload();
  if(!cloudUser||!cloudStore){alert('Sign in through Cloud Backup before publishing Player Focus.');return}
  if(!player?.portalId){alert(`Create ${practiceFirstName(practiceFocusPlayer)}’s Player Portal before publishing.`);return}
  if(!focus)return;
  const button=$('#confirmPublishPlayerFocus');if(button){button.disabled=true;button.textContent='Publishing…'}
  try{
   await portalDoc(player.portalId).set({focus,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
   modal=null;render();alert(`${practiceFirstName(player.name)}’s Player Focus is now available in her portal.`);
  }catch(error){if(button){button.disabled=false;button.textContent=`Publish to ${practiceFirstName(player.name)}`}alert('Player Focus could not be published. Check Cloud Backup and your internet connection.')}
 });
}
function bindCoachObservation(){
 const g=currentGame(),api=window.HotBCoachObservations,focusMode=observationMode==='focus',manageMode=observationMode==='manage';if(!api||(!focusMode&&!manageMode&&!g))return;
 $$('[data-observation-scope]').forEach(button=>button.onclick=()=>{observationScope=button.dataset.observationScope;const target=api.targetsForScope(g,observationScope)[0];observationTargetPlayer=target?.playerName||'';observationTargetPaId=target?.paId||'';render()});
 $$('[data-observation-target]').forEach(button=>button.onclick=()=>{observationTargetPlayer=button.dataset.observationPlayer;observationTargetPaId=button.dataset.observationTarget||'';render()});
 const updateCount=()=>{
  const count=$$('.observation-option.active').length,label=$('#observationSelectionCount');if(label)label.textContent=String(count);
 };
 $$('.observation-category>div').forEach(list=>{
  let startY=0,moved=false;
  list.addEventListener('pointerdown',event=>{startY=event.clientY;moved=false});
  list.addEventListener('pointermove',event=>{if(Math.abs(event.clientY-startY)>8)moved=true});
  list.addEventListener('click',event=>{if(!moved)return;event.preventDefault();event.stopImmediatePropagation();moved=false},true);
 });
 $$('.observation-option').forEach(button=>button.onclick=()=>{
  if(!button.classList.contains('active')&&$$('.observation-option.active').length>=3){alert('Choose up to 3 observations.');return}
  button.classList.toggle('active');button.setAttribute('aria-pressed',String(button.classList.contains('active')));updateCount();
  const category=button.closest('.observation-category'),categoryCount=category?.querySelectorAll('.observation-option.active').length||0,summary=category?.querySelector('summary small');if(summary)summary.textContent=categoryCount?`${categoryCount} selected`:'Choose';
 });
 const mic=$('#observationMic'),note=$('#observationNote'),status=$('#observationMicStatus'),SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(mic&&note){
  if(!SpeechRecognition){mic.textContent='🎙 Use Keyboard Mic';mic.onclick=()=>{note.focus();if(status)status.textContent='Tap the microphone on your phone keyboard to dictate.'}}
  else mic.onclick=()=>{
   if(observationRecognition){observationRecognition.stop();return}
   const recognition=new SpeechRecognition();observationRecognition=recognition;recognition.lang='en-US';recognition.interimResults=true;recognition.continuous=false;const original=note.value.trim();
   recognition.onstart=()=>{mic.classList.add('listening');mic.textContent='■ Stop Listening';if(status)status.textContent='Listening…'};
   recognition.onresult=event=>{let words='';for(let i=event.resultIndex;i<event.results.length;i++)words+=event.results[i][0].transcript;note.value=[original,words.trim()].filter(Boolean).join(original?' ':'').slice(0,160)};
   recognition.onerror=()=>{if(status)status.textContent='Could not hear that. Try again or use the keyboard microphone.'};
   recognition.onend=()=>{observationRecognition=null;mic.classList.remove('listening');mic.textContent='🎙 Dictate Note';if(status&&status.textContent==='Listening…')status.textContent='Review the words before saving.'};recognition.start();
  };
 }
 $('#saveCoachObservation')?.addEventListener('click',()=>{
  try{
   const payload={playerName:observationTargetPlayer,paId:observationTargetPaId,tags:$$('.observation-option.active').map(button=>button.dataset.observationOption),note:$('#observationNote')?.value||''};
   if(focusMode){const selected=db.roster.find(player=>!player.isTeamJenkins&&player.name===payload.playerName);if(!selected)throw new Error('Player Focus is only available for competitive-roster players.');payload.observedAt=new Date(api.rangeBounds(practiceFocusRange).end).toISOString()}
   if(manageMode){const editGame=observationEditGameId?(db.savedGames||[]).find(game=>game.id===observationEditGameId):null,record=(editGame?.observations||db.coachObservations||[]).find(item=>item.id===observationEditId);api.updateRecord(record,payload)}
   else if(focusMode)api.saveStandalone(db.coachObservations,payload);else api.saveObservation(g,payload);
   modal=null;save();render();
  }catch(error){alert(error.message||'HotB could not save that observation.')}
 });
}
function bindManageFocusDrills(){
 $$('[data-focus-drill-slot]').forEach(button=>button.onclick=()=>{focusDrillReplaceIndex=Number(button.dataset.focusDrillSlot);focusDrillQuery='';render()});
 $('#backToFocusDrills')?.addEventListener('click',()=>{focusDrillReplaceIndex=-1;focusDrillQuery='';render()});
 $('#focusDrillSearch')?.addEventListener('input',event=>{focusDrillQuery=event.target.value;render();const input=$('#focusDrillSearch');if(input){input.focus();input.setSelectionRange(input.value.length,input.value.length)}});
 $$('[data-focus-replacement]').forEach(button=>button.onclick=()=>{
  const selected=db.roster.find(player=>!player.isTeamJenkins&&player.name===practiceFocusPlayer);if(!selected)return;const games=playerFocusGames(),standalone=window.HotBCoachObservations?.standaloneInRange(db.coachObservations,practiceFocusRange)||[],analysis=window.HotBHittingAnalysis?.analyzePlayer(games,selected)||{issues:[]},observed=window.HotBCoachObservations?.summarize(games,selected.name,standalone)||{patterns:[]},query=[...observed.patterns.map(item=>item.tag),...(analysis.issues||[]).map(item=>`${item.label} ${item.focus||''}`)].join(' '),names=focusSuggestedDrills(query).map(drill=>drill.name);
  names[focusDrillReplaceIndex]=button.dataset.focusReplacement;db.playerFocusDrillOverrides[focusDrillKey()]=names;focusDrillReplaceIndex=-1;focusDrillQuery='';save();render();
 });
 $('#resetFocusDrills')?.addEventListener('click',()=>{delete db.playerFocusDrillOverrides[focusDrillKey()];save();modal=null;render()});
}
function bindInningObservationPrompt(){
 $('#skipInningObservation')?.addEventListener('click',()=>{modal=null;render()});
 $('#addInningObservation')?.addEventListener('click',()=>openCoachObservation({scope:'previous',fromInningPrompt:true}));
}
function bindLive(){
 const g=currentGame();
 $('.live-app')?.addEventListener('click',event=>{
  const button=event.target.closest('button');
  if(button&&button.id!=='undo'&&button.id!=='coachObservation'&&!button.matches('[data-zone],[data-result],[data-dq-pending]')&&g.pendingZone){g.pendingZone=null;save()}
 },true);
 const percentMode=!g.firstPitchView&&(g.zoneScope==='TEAM'||g.previewNext||(g.historyTab==='ALL'&&(g.allView||'DOTS')==='PCT'));
 $$('[data-plan]').forEach(b=>b.onclick=()=>{
   g.plan=b.dataset.plan;
   db.planPreferences=db.planPreferences||{};
   db.planPreferences[currentHitter(g).name]=b.dataset.plan;
   save();render();
 });
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
 const observationButton=$('#coachObservation');if(observationButton){observationButton.onclick=event=>{event.preventDefault();event.stopPropagation();openCoachObservation()}}
 $('#decreaseOuts').onclick=()=>{subtractManualOut(g);save();render()};
 $('#increaseOuts').onclick=()=>{addManualOut(g);save();render()};
 $('#forceEndInning').onclick=()=>{if(!confirm(`End inning ${g.inning} now? This will clear the bases and reset the count.`))return;const completedInning=g.inning;g.outs=0;g.inning+=1;g.runners=[];resetLiveCount(g);queueInningObservation(g,completedInning);save();render()};
 $('#openLineup').onclick=()=>{modal='lineup';render()};
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
  const g=currentGame(),outgoing=currentHitter(g).name,incoming=button.dataset.subHitter,player=competitionRoster().find(item=>item.name===incoming);
  if(!player||g.battingOrder.includes(incoming))return;
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
   // Undo snapshots are only needed while a game is live. Each snapshot contains
   // copies of the growing pitch/PA history, so retaining up to 50 of them in a
   // completed game can consume most of Safari localStorage. Preserve every real
   // game pitch, PA and observation, but discard this reconstructable live-only
   // undo cache before archiving.
   const completedGame=structuredClone(g);
   delete completedGame.undoStack;
   db.savedGames.push(completedGame);
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
 document.querySelectorAll('[data-rbi-count]').forEach(b=>b.onclick=()=>{const availableRunners=currentGame()?.runners?.length||0;st.rbiCount=Math.min(Number(b.dataset.rbiCount),availableRunners);st.quals.delete('RBA');$('[data-qual="RBA"]')?.classList.remove('active');const rbi=$('[data-rbi-open]');rbi.textContent=st.rbiCount?`RBI ${st.rbiCount}`:'RBI';rbi.classList.toggle('active',st.rbiCount>0);$('.rbi-picker').hidden=true;update()});
 $$('[data-strength]').forEach(b=>b.onclick=()=>{const strength=b.dataset.strength;st.strength=st.strength===strength?null:strength;$$('[data-strength]').forEach(x=>x.classList.toggle('active',x.dataset.strength===st.strength));update()});
 const update=()=>{const special=['E','FC','SAC'].some(q=>st.quals.has(q));$('#saveContact').disabled=!(st.fielder&&(modal==='H4O'?(st.contact&&st.outType):(st.contact&&st.batted&&(st.hitType||special))))};
 $('#saveContact').onclick=()=>{const kind=st.quals.has('E')?'E':st.quals.has('FC')?'FC':st.quals.has('SAC')?'SAC':modal;modal=null;addPitch(kind,{fielder:st.fielder,contactType:st.batted||st.outType,hitType:st.hitType||'',bunt:st.contact==='BUNT',slap:st.contact==='SLAP',rbiCount:st.rbiCount,rba:st.quals.has('RBA'),sac:st.quals.has('SAC'),error:st.quals.has('E'),fc:st.quals.has('FC'),hhb:st.strength==='HHB',weak:st.strength==='WEAK'})};
}
function bindReports(){
 $('#showReportGames')?.addEventListener('click',()=>{modal='reportGamesList';render()});
 $$('[data-rmode]').forEach(b=>b.onclick=()=>{reportMode=b.dataset.rmode;reportGameId=null;reportSelectedPaId=null;reportOpponent='All Opponents';render()});
 bindDateFilters('report');
 $('#reportHitter')?.addEventListener('change',e=>{reportFilterHitter=e.target.value;reportSelectedPaId=null;render()});
 $('#reportOpponent')?.addEventListener('change',e=>{reportOpponent=e.target.value;reportSelectedPaId=null;render()});
 const bindHeatChart=()=>{
  const refreshHeatChart=()=>{
   const current=$('.report-heat');if(!current)return;
   const template=document.createElement('template');template.innerHTML=zoneReport().trim();const next=template.content.firstElementChild;
   if(next){current.replaceWith(next);bindHeatChart()}
  };
  $$('[data-heat-result]').forEach(button=>button.onclick=()=>{reportHeatResult=button.dataset.heatResult;refreshHeatChart()});
  $$('[data-heat-display]').forEach(button=>button.onclick=()=>{reportHeatDisplay=button.dataset.heatDisplay;refreshHeatChart()});
 };
 bindHeatChart();
 $$('[data-report-pa]').forEach(button=>button.onclick=()=>{reportSelectedPaId=reportSelectedPaId===button.dataset.reportPa?null:button.dataset.reportPa;$$('.report-spray-dot').forEach(dot=>dot.classList.toggle('selected',dot.dataset.reportPa===reportSelectedPaId))});
 $('#exportReport')?.addEventListener('click',exportCsv);
}
function exportCsv(){
 const competitionNames=new Set(competitionRoster().map(player=>player.name));
 let source=reportGames().flatMap(game=>game.plateAppearances||[]).filter(pa=>competitionNames.has(pa.hitter));
 if(reportFilterHitter!=='All Hitters')source=source.filter(pa=>pa.hitter===reportFilterHitter);
 const rows=[['Hitter','Inning','PA','Outcome','Contact Type','Hit Type','Fielder','Final Count','Pitch Count','RBI','RBA','SAC','HHB','WEAK'],...source.map(p=>[p.hitter,p.inning,p.pa,p.outcome,p.contactType||'',p.hitType,p.fielder||'',p.finalCount,p.pitchCount,p.rbiCount??(p.rbi?1:0),p.rba,p.sac,p.hhb,p.weak])];
 const csv=rows.map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(',')).join('\n'),a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download=`HotB_${reportMode}_report.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
function bindEval(){
 $('#evalSelect').onchange=e=>{evalPlayer=e.target.value;render()};
 bindDateFilters('eval');
 const recordMeasureButton=$('#recordMeasure2');
 if(recordMeasureButton)recordMeasureButton.onclick=()=>{recordType='';modal='record';render()};
 $$('[data-measure]').forEach(x=>x.onclick=()=>{recordType=x.dataset.measure;modal='record';render()});
 $$('[data-guide]').forEach(x=>x.onclick=()=>{modal='guide:'+x.dataset.guide;render()});
 $$('[data-ranking]').forEach(x=>x.onclick=()=>{modal='ranking:'+x.dataset.ranking;render()});
 $$('[data-hitting-ranking]').forEach(x=>x.onclick=()=>{modal='hittingRanking:'+x.dataset.hittingRanking;render()});
 $$('[data-pitch-ranking]').forEach(x=>x.onclick=()=>{modal='pitchRanking:'+x.dataset.pitchRanking;render()});
 $('#uploadPitchingStats')?.addEventListener('click',()=>$('#pitchingStatsFile')?.click());
 $('#pitchingStatsFile')?.addEventListener('change',async event=>{
  const file=event.target.files?.[0];event.target.value='';if(!file)return;
  const button=$('#uploadPitchingStats');if(button){button.disabled=true;button.textContent='READING…'}
  try{pendingPitchingImport=await parsePitchingImport(file);modal='pitchingImport';render()}
  catch(error){if(button){button.disabled=false;button.textContent='UPLOAD'}alert(error?.message||'HotB could not read that GameChanger file. No statistics were changed.')}
 });
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
  const playerName=$('#mPlayer').value,player=competitionRoster().find(item=>item.name===playerName);if(!player)return;
  db.measurements.push({id:crypto.randomUUID(),player:player.name,type:$('#mType').value,value:Number(value),date:$('#mDate').value});
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
try{render()}
catch(error){
 console.error('HotB initial render failed',error);
 const app=document.getElementById('app');
 const message=String(error?.message||error||'unknown').slice(0,180);
 const stack=String(error?.stack||'').split('\n').slice(0,3).join(' | ').slice(0,260);
 if(app)app.innerHTML=`<div class="app"><main style="padding:24px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif"><section style="max-width:520px;margin:40px auto;background:#fff;border:2px solid #d4d9d7;border-radius:18px;padding:24px"><strong>HotB Startup Error</strong><p style="margin:8px 0 0">The opening screen hit a specific code error. Your saved data was not erased.</p><p style="margin:8px 0 0"><b>Error code: H200-RENDER</b></p><p style="margin:12px 0 0;font-size:13px;word-break:break-word">Message: ${esc(message)}</p><p style="margin:6px 0 0;font-size:11px;word-break:break-word">Location: ${esc(stack)}</p></section></main></div>`;
}
if(portalToken){
 const portalStartupGuard=setTimeout(()=>{
  if(portalBusy&&!portalData){
   portalBusy=false;
   portalMessage='HotB could not finish the secure portal connection. Please refresh this private link once.';
   render();
  }
 },12000);
 window.addEventListener('pagehide',()=>clearTimeout(portalStartupGuard),{once:true});
}
initCloud();
// A restored live practice is resumed from the authenticated cloud callback.
// Do not verify/pause it here before Firebase has restored the coach session.
})();
