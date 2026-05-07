export const FORMS=[
 {name:'Mosca Piccola',need:80,r:18,maxVX:260,flapImpulse:255,maxRise:520,maxFall:720,stamina:70,sprite:'assets/evolutions/evolution_01_mosca_piccola.png'},
 {name:'Moscerino Verde',need:205,r:19,maxVX:278,flapImpulse:265,maxRise:538,maxFall:733,stamina:76,sprite:'assets/evolutions/evolution_02_moscerino_verde.png'},
 {name:'Ape Agile',need:390,r:20,maxVX:296,flapImpulse:275,maxRise:556,maxFall:746,stamina:82,sprite:'assets/evolutions/evolution_03_ape_agile.png'},
 {name:'Farfalla Blu',need:635,r:21,maxVX:314,flapImpulse:285,maxRise:574,maxFall:759,stamina:88,sprite:'assets/evolutions/evolution_04_farfalla_blu.png'},
 {name:'Libellula',need:940,r:23,maxVX:332,flapImpulse:295,maxRise:592,maxFall:772,stamina:94,sprite:'assets/evolutions/evolution_05_libellula.png'},
 {name:'Passero',need:1305,r:24,maxVX:350,flapImpulse:305,maxRise:610,maxFall:785,stamina:100,sprite:'assets/evolutions/evolution_06_passero.png'},
 {name:'Rondine',need:1730,r:25,maxVX:368,flapImpulse:315,maxRise:628,maxFall:798,stamina:106,sprite:'assets/evolutions/evolution_07_rondine.png'},
 {name:'Pipistrello',need:2215,r:26,maxVX:386,flapImpulse:325,maxRise:646,maxFall:811,stamina:112,sprite:'assets/evolutions/evolution_08_pipistrello.png'},
 {name:'Corvo',need:2760,r:28,maxVX:404,flapImpulse:335,maxRise:664,maxFall:824,stamina:118,sprite:'assets/evolutions/evolution_09_corvo.png'},
 {name:'Falco',need:3365,r:29,maxVX:422,flapImpulse:345,maxRise:682,maxFall:837,stamina:124,sprite:'assets/evolutions/evolution_10_falco.png'},
 {name:'Gufo',need:4030,r:30,maxVX:440,flapImpulse:355,maxRise:700,maxFall:850,stamina:130,sprite:'assets/evolutions/evolution_11_gufo.png'},
 {name:'Fenicottero',need:4755,r:31,maxVX:458,flapImpulse:365,maxRise:718,maxFall:863,stamina:136,sprite:'assets/evolutions/evolution_12_fenicottero.png'},
 {name:'Aquila',need:5540,r:33,maxVX:476,flapImpulse:375,maxRise:736,maxFall:876,stamina:142,sprite:'assets/evolutions/evolution_13_aquila.png'},
 {name:'Grifone',need:6385,r:34,maxVX:494,flapImpulse:385,maxRise:754,maxFall:889,stamina:148,sprite:'assets/evolutions/evolution_14_grifone.png'},
 {name:'Drago Verde',need:7290,r:35,maxVX:512,flapImpulse:395,maxRise:772,maxFall:902,stamina:154,sprite:'assets/evolutions/evolution_15_drago_verde.png'},
 {name:'Drago Rosso',need:8255,r:36,maxVX:530,flapImpulse:405,maxRise:790,maxFall:915,stamina:160,sprite:'assets/evolutions/evolution_16_drago_rosso.png'},
 {name:'Drago Blu',need:9280,r:38,maxVX:548,flapImpulse:415,maxRise:808,maxFall:928,stamina:166,sprite:'assets/evolutions/evolution_17_drago_blu.png'},
 {name:'Fenice',need:10365,r:39,maxVX:566,flapImpulse:425,maxRise:826,maxFall:941,stamina:172,sprite:'assets/evolutions/evolution_18_fenice.png'},
 {name:'Wyvern Viola',need:11510,r:40,maxVX:584,flapImpulse:435,maxRise:844,maxFall:954,stamina:178,sprite:'assets/evolutions/evolution_19_wyvern_viola.png'},
 {name:'Serpente Alato',need:12715,r:41,maxVX:602,flapImpulse:445,maxRise:862,maxFall:967,stamina:184,sprite:'assets/evolutions/evolution_20_serpente_alato.png'},
 {name:'Spirito Celeste',need:13980,r:43,maxVX:620,flapImpulse:455,maxRise:880,maxFall:980,stamina:190,sprite:'assets/evolutions/evolution_21_spirito_celeste.png'},
 {name:'Titano Solare',need:15240,r:44,maxVX:638,flapImpulse:465,maxRise:898,maxFall:993,stamina:196,sprite:'assets/evolutions/evolution_22_titano_solare.png'},
 {name:'Reaper Supremo',need:16950,r:47,maxVX:666,flapImpulse:485,maxRise:930,maxFall:1010,stamina:215,sprite:'assets/evolutions/evolution_23_reaper_supremo.png'},
 {name:'Divinità Primordiale',need:Infinity,r:51,maxVX:705,flapImpulse:515,maxRise:980,maxFall:1040,stamina:240,sprite:'assets/evolutions/evolution_24_divinita_primordiale.png'},
];
export function applyForm(p){const f=FORMS[p.form];p.name=f.name;p.r=f.r;p.maxVX=f.maxVX;p.flapImpulse=f.flapImpulse;p.maxRise=f.maxRise;p.maxFall=f.maxFall;p.maxStamina=f.stamina;p.stamina=Math.min(p.stamina??f.stamina,f.stamina);p.sprite=f.sprite;}
export function gainXP(p,amount){p.xp+=amount;let changed=false;while(p.form<FORMS.length-1 && p.xp>=FORMS[p.form].need){p.xp-=FORMS[p.form].need;p.form++;applyForm(p);changed=true;}return changed;}

window.debugAddXP = () => gainXP(player, 500);