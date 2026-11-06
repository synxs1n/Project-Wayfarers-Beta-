// =================== SKILL DATA (skills, limit breaks, bonds). Split out of data.js ===================
// =================== SKILLS ===================
const SPELL={fire:['Ember','Inferno','Pyroclasm'],water:['Splash','Torrent','Deluge'],earth:['Rock Toss','Quake','Landslide'],wind:['Gust','Cyclone','Tempest'],
 lightning:['Spark','Chain Bolt','Thunderfall'],ice:['Frost','Blizzard','Absolute Zero'],light:['Gleam','Radiant Burst','Sunfall'],shadow:['Gloom','Umbral Wave','Eclipse']};
const ATTACK={id:'attack',n:'Attack',k:'phys',pw:1,mp:0,t:'one',cost:1,hits:1,el:null,lv:1,d:'A basic strike.'};
const COMBO={
 'fire+water':{n:'Scalding Steam',k:'mag',pw:1.05,t:'all',fx:[['burn',.45],['blind',.3]],d:'Steam scalds every foe. May Burn or Blind.'},
 'earth+fire':{n:'Magma Surge',k:'mag',pw:2.1,t:'one',fx:[['burn',.7],['break',.6]],d:'Molten rock. Burns and cracks armor.'},
 'fire+wind':{n:'Firestorm',k:'mag',pw:1.15,t:'all',fx:[['burn',.45]],d:'A whirling blaze on all foes.'},
 'fire+lightning':{n:'Plasma Lance',k:'mag',pw:2.5,t:'one',fx:[['stun',.3]],d:'A searing bolt of plasma. May Stun.'},
 'fire+ice':{n:'Thermal Shock',k:'mag',pw:1.8,t:'one',fx:[['break',.9]],afflicted:1.5,d:'Hits 50% harder on afflicted foes. Breaks armor.'},
 'fire+light':{n:'Solar Flare',k:'mag',pw:1.1,t:'all',fx:[['blind',.55]],d:'Blinding sunfire on all foes.'},
 'fire+shadow':{n:'Hellfire',k:'mag',pw:2.0,t:'one',fx:[['burn',.8],['weaken',.5]],d:'Black flame. Burns and saps strength.'},
 'earth+water':{n:'Mudslide',k:'mag',pw:1.0,t:'all',fx:[['slow',.7],['blind',.4],['root',.4]],d:'A wave of mud. Slows, clouds their aim and roots them in place.'},
 'water+wind':{n:'Monsoon',k:'mag',pw:1.05,t:'all',fx:[['slow',.5],['weaken',.3]],d:'Driving rain that slows and weakens all foes.'},
 'lightning+water':{n:'Electrocute',k:'mag',pw:2.2,t:'one',fx:[['stun',.45]],d:'Water carries the current. High Stun chance.'},
 'ice+water':{n:'Glacial Tide',k:'mag',pw:1.0,t:'all',fx:[['slow',.6]],d:'A freezing wave that slows all foes.'},
 'light+water':{n:'Holy Spring',k:'heal',pw:1.0,t:'allyAll',fx:[['regen',1]],cleanse:1,d:'Heals and cleanses the vanguard and grants Regen.'},
 'shadow+water':{n:'Undertow',k:'mag',pw:1.9,t:'one',fx:[['root',.8],['slow',.6]],d:'Drags a foe under. Roots and slows.'},
 'earth+wind':{n:'Sandstorm',k:'mag',pw:1.0,t:'all',fx:[['blind',.6]],d:'Scouring sand that blinds all foes.'},
 'earth+lightning':{n:'Magnet Quake',k:'phys',pw:1.9,t:'one',fx:[['root',.7],['break',.5]],d:'A charged quake. Roots and breaks armor.'},
 'earth+ice':{n:'Permafrost',k:'phys',pw:1.9,t:'one',fx:[['slow',.8]],self:[['bulwark',1]],d:'Frozen earth slows a foe and shields you with Bulwark.'},
 'earth+light':{n:'Crystal Bastion',k:'status',t:'allyAll',fx:[['ward',1],['bulwark',1]],d:'Crystal walls give the vanguard Ward and Bulwark.'},
 'earth+shadow':{n:'Grave Grasp',k:'phys',pw:1.8,t:'one',fx:[['root',.8],['bleed',.7]],d:'Hands from the earth. Roots and bleeds.'},
 'lightning+wind':{n:'Thunderstorm',k:'mag',pw:1.15,t:'all',fx:[['stun',.15]],d:'Lightning rakes all foes. May Stun.'},
 'ice+wind':{n:'Whiteout',k:'mag',pw:1.05,t:'all',fx:[['slow',.5],['blind',.3]],d:'A blizzard on all foes. Slows and blinds.'},
 'light+wind':{n:'Aurora',k:'status',t:'allyAll',fx:[['regen',1],['haste',1]],d:'Shimmering lights grant Regen and Haste to the vanguard.'},
 'shadow+wind':{n:'Night Wind',k:'mag',pw:1.05,t:'all',fx:[['blind',.5],['bleed',.3]],d:'Cutting dark wind on all foes.'},
 'ice+lightning':{n:'Cryo Spark',k:'mag',pw:2.0,t:'one',fx:[['stun',.35],['slow',.5]],d:'Freezing current. Stuns and slows.'},
 'light+lightning':{n:'Judgement Bolt',k:'mag',pw:2.6,t:'one',pierce:1,d:'Holy lightning that ignores half of resistance.'},
 'lightning+shadow':{n:'Black Lightning',k:'mag',pw:2.1,t:'one',fx:[['break',.7]],d:'Dark lightning that breaks defenses.'},
 'ice+light':{n:'Prism Lance',k:'mag',pw:1.1,t:'all',fx:[['blind',.5]],d:'Refracted light on all foes.'},
 'ice+shadow':{n:'Frostbite Curse',k:'phys',pw:1.9,t:'one',fx:[['bleed',.8],['slow',.6]],d:'Cursed frost. Bleeds and slows.'},
 'light+shadow':{n:'Twilight',k:'mag',pw:1.2,t:'all',fx:[['weaken',.5],['break',.5]],d:'Light and dark at once. Weakens and breaks every foe.'}
};
const comboKey=els=>els.slice().sort().join('+');
const SKC={};
// v5.1 role fills: added only when a class would otherwise miss a Primer or Detonator in that band
const ROLE_FILL={
 warrior:{eP:n=>({id:'brand',n:'Branding Strike',k:'phys',pw:1.25,mp:4,lv:6,d:`A glancing blow that leaves ${n} clinging to the foe.`}),lP:n=>({id:'warbrand',n:'Warbrand Sweep',k:'phys',t:'all',pw:.85,mp:10,lv:18,d:`Sweeps every foe and brands them with ${n}.`})},
 knight:{eD:n=>({id:'sburst',n:'Shield Burst',k:'phys',pw:1.5,mp:5,lv:9,d:`Slams the shield home and bursts ${n} through the foe.`}),lP:n=>({id:'consec',n:'Consecrate',k:'phys',t:'all',pw:.8,mp:10,lv:18,d:`Hallows the ground under every foe with ${n}.`})},
 mage:{eD:n=>({id:'burst',n:`${n} Burst`,k:'mag',pw:1.7,mp:6,lv:6,d:`A focused blast of ${n} that sets off a prime.`}),lP:n=>({id:'rune',n:`${n} Rune`,k:'mag',pw:1.3,mp:9,lv:18,d:`Carves a ${n} rune into a foe.`})},
 healer:{eD:n=>({id:'smite',n:'Smite',k:'mag',pw:1.45,mp:5,lv:7,d:`A lance of ${n} from above.`}),lP:n=>({id:'halo',n:`Halo of ${n}`,k:'mag',t:'all',pw:.7,mp:10,lv:18,d:`Rings every foe with ${n}.`}),lD:n=>({id:'verdict',n:'Verdict',k:'mag',pw:2.4,mp:14,cost:1.2,lv:21,d:`Final judgement in ${n}. Slow recovery.`})},
 thief:{eP:n=>({id:'dart2',n:`${n} Dart`,k:'phys',pw:1.1,mp:3,cost:.8,lv:3,d:`A quick dart tipped with ${n}.`}),lP:n=>({id:'fan',n:`${n} Fan`,k:'phys',t:'all',pw:.8,mp:10,lv:18,d:`A fan of ${n} knives at every foe.`})},
 archer:{eD:n=>({id:'burstarrow',n:'Burst Arrow',k:'phys',pw:1.6,mp:5,lv:7,d:`An arrowhead packed with ${n} that bursts on impact.`}),lP:n=>({id:'rain',n:`${n} Rain`,k:'phys',t:'all',pw:.85,mp:10,lv:18,d:`A rain of ${n} arrows on every foe.`}),lD:{retag:'pierce'}},
 monk:{eP:n=>({id:'palm2',n:`${n} Palm`,k:'phys',pw:1.2,mp:4,lv:6,d:`An open palm that leaves ${n} humming in the foe.`}),lP:n=>({id:'whirl',n:`${n} Whirl`,k:'phys',t:'all',pw:.8,mp:10,lv:18,d:`A spinning kick that marks every foe with ${n}.`})},
 bard:{eD:n=>({id:'cresc',n:`${n} Crescendo`,k:'mag',pw:1.5,mp:6,lv:6,d:`A rising ${n} chord that sets off a prime.`}),lP:n=>({id:'refrain',n:`${n} Refrain`,k:'mag',t:'all',pw:.7,mp:10,lv:18,d:`A ${n} refrain that lingers on every foe.`}),lD:n=>({id:'finale',n:'Grand Finale',k:'mag',pw:2.2,mp:14,cost:1.2,lv:21,d:`The last, loudest ${n} note. Slow recovery.`})}
};
function classSkills(t){
  if(SKC[t.id])return SKC[t.id];
  const e1=t.el[0],e2=t.el[1],n1=EL[e1],n2=e2?EL[e2]:'',S=[];
  const add=o=>S.push(Object.assign({cost:1,hits:1,t:'one',mp:0,el:null},o));
  switch(t.cls){
  case 'warrior':
    add({id:'pstrike',n:'Power Strike',k:'phys',pw:1.5,mp:3,lv:1,d:'A heavy swing.'});
    add({id:'edge1',n:n1+' Edge',k:'phys',pw:1.7,mp:5,el:e1,lv:3,d:`Blade wreathed in ${n1}.`});
    add({id:'rend',n:'Rend',k:'phys',pw:1.2,mp:5,lv:6,fx:[['bleed',.8]],d:'A tearing cut. Likely Bleeds.'});
    add({id:'hurl',n:'Hand Axe',k:'phys',pw:1.2,mp:3,lv:4,dl:'ranged',d:'Hurl an axe across the field. Flying foes cannot weave away from it.'});
    if(e2)add({id:'edge2',n:n2+' Edge',k:'phys',pw:1.7,mp:5,el:e2,lv:8,d:`Blade wreathed in ${n2}.`});
    add({id:'cleave',n:'Cleave',k:'phys',pw:1,mp:9,t:'all',lv:10,d:'Sweeps every foe.'});
    add({id:'cry',n:'War Cry',k:'status',t:'self',mp:6,lv:13,fx:[['might',1],['taunt',1]],d:'Gain Might and Taunt: foes come for you.'});
    add({id:'titan',n:'Titan Blow',k:'phys',pw:3,mp:16,el:e1,cost:1.3,lv:22,d:`Crushing ${n1} blow. Slow recovery.`});
    break;
  case 'knight':
    add({id:'bash',n:'Shield Bash',k:'phys',pw:1.3,mp:3,lv:1,fx:[['stun',.25]],d:'May Stun.'});
    add({id:'provoke',n:'Provoke',k:'status',t:'self',mp:4,lv:3,fx:[['taunt',1],['bulwark',1]],d:'Taunt foes and gain Bulwark.'});
    add({id:'lance1',n:n1+' Lance',k:'phys',pw:1.6,mp:5,el:e1,lv:5,d:`Charge tipped with ${n1}.`});
    add({id:'javelin',n:'Javelin',k:'phys',pw:1.2,mp:3,lv:9,dl:'ranged',d:'Throw a javelin. Flying foes cannot weave away from it.'});
    add({id:'aegis',n:'Aegis',k:'status',t:'ally',mp:6,lv:7,fx:[['ward',1]],d:'Ward an ally: blocks the next hit completely.'});
    if(e2)add({id:'lance2',n:n2+' Lance',k:'phys',pw:1.6,mp:5,el:e2,lv:8,d:`Charge tipped with ${n2}.`});
    add({id:'wall',n:'Guard Wall',k:'status',t:'allyAll',mp:10,lv:11,fx:[['bulwark',1]],d:'Bulwark for the vanguard.'});
    add({id:'rally',n:'Rally',k:'status',t:'allyAll',mp:12,lv:16,fx:[['might',1]],d:'Might for the vanguard.'});
    add({id:'judge',n:'Judgement',k:'phys',pw:2.8,mp:15,el:e1,cost:1.3,lv:22,d:`Heavy ${n1} strike. Slow recovery.`});
    break;
  case 'mage':
    add({id:'s1a',n:SPELL[e1][0],k:'mag',pw:1.5,mp:4,el:e1,lv:1,d:`A bolt of ${n1}.`});
    if(e2)add({id:'s1b',n:SPELL[e2][0],k:'mag',pw:1.5,mp:4,el:e2,lv:4,d:`A bolt of ${n2}.`});
    add({id:'quicken',n:'Quicken',k:'status',t:'ally',mp:6,lv:5,fx:[['haste',1]],d:'Haste an ally.'});
    add({id:'s2a',n:SPELL[e1][1],k:'mag',pw:.95,mp:11,t:'all',el:e1,lv:8,d:`${n1} storm on all foes.`});
    add({id:'hex',n:'Hex',k:'status',t:'one',mp:6,lv:12,fx:[['break',.9],['weaken',.5]],d:'Curse a foe: likely Break, may Weaken.'});
    if(e2)add({id:'s2b',n:SPELL[e2][1],k:'mag',pw:.95,mp:11,t:'all',el:e2,lv:14,d:`${n2} storm on all foes.`});
    add({id:'s3a',n:SPELL[e1][2],k:'mag',pw:3.1,mp:22,cost:1.3,el:e1,lv:20,d:`Devastating ${n1}. Slow recovery.`});
    break;
  case 'healer':
    add({id:'mend',n:'Mend',k:'heal',pw:1.6,mp:4,t:'ally',lv:1,d:'Heals one ally.'});
    add({id:'renew',n:'Renew',k:'status',t:'ally',mp:5,lv:3,fx:[['regen',1]],d:'Regen on an ally: heals every turn.'});
    add({id:'ray1',n:n1+' Ray',k:'mag',pw:1.3,mp:5,el:e1,lv:4,d:`Beam of ${n1}.`});
    add({id:'purify',n:'Purify',k:'heal',pw:.6,mp:4,t:'ally',cleanse:1,lv:6,d:'Cures all ailments and heals a little.'});
    add({id:'mendall',n:'Mend All',k:'heal',pw:1.1,mp:12,t:'allyAll',lv:8,d:'Heals the vanguard.'});
    if(e2)add({id:'ray2',n:n2+' Ray',k:'mag',pw:1.3,mp:5,el:e2,lv:8,d:`Beam of ${n2}.`});
    add({id:'raise',n:'Raise',k:'revive',pw:.4,mp:14,t:'dead',lv:11,d:'Revives a fallen ally at 40% HP.'});
    add({id:'sanct',n:'Sanctuary',k:'status',t:'allyAll',mp:14,lv:14,fx:[['regen',1]],d:'Regen for the whole vanguard.'});
    add({id:'fullmend',n:'Full Mend',k:'heal',pw:4,mp:18,cost:1.2,t:'ally',lv:20,d:'Powerful single heal.'});
    break;
  case 'thief':
    add({id:'stab',n:'Quick Stab',k:'phys',pw:1,mp:0,cost:.6,lv:1,d:'Fast, free, light.'});
    add({id:'steal',n:'Steal',k:'phys',pw:.6,mp:0,steal:1,lv:3,d:'Hit and grab gold or an item.'});
    add({id:'shiv1',n:n1+' Shiv',k:'phys',pw:1.5,mp:4,cost:.8,el:e1,lv:5,d:`Quick ${n1} stab.`});
    add({id:'dart',n:'Venom Dart',k:'phys',pw:.8,mp:5,lv:7,fx:[['poison',.9]],d:'Likely Poisons the target.'});
    if(e2)add({id:'shiv2',n:n2+' Shiv',k:'phys',pw:1.5,mp:4,cost:.8,el:e2,lv:9,d:`Quick ${n2} stab.`});
    add({id:'smoke',n:'Smoke Bomb',k:'status',t:'all',mp:8,lv:10,fx:[['blind',.7]],d:'May Blind every foe.'});
    add({id:'flurry',n:'Flurry',k:'phys',pw:.9,mp:10,t:'all',cost:.8,lv:14,d:'Fast cuts on all foes.'});
    add({id:'assn',n:'Assassinate',k:'phys',pw:3,mp:14,el:e1,crit:.25,lv:22,d:`${n1} killing blow. High crit.`});
    break;
  case 'archer':
    add({id:'aim',n:'Aimed Shot',k:'phys',pw:1.4,mp:2,lv:1,d:'A careful shot.'});
    add({id:'arrow1',n:n1+' Arrow',k:'phys',pw:1.6,mp:4,el:e1,lv:4,d:`Arrow charged with ${n1}.`});
    add({id:'barb',n:'Barbed Arrow',k:'phys',pw:1.1,mp:5,lv:6,fx:[['bleed',.85]],d:'Likely Bleeds.'});
    add({id:'hawk',n:'Hawkeye',k:'status',t:'self',mp:4,lv:8,fx:[['focus',1]],d:'Focus: your next attack is a critical.'});
    if(e2)add({id:'arrow2',n:n2+' Arrow',k:'phys',pw:1.6,mp:4,el:e2,lv:9,d:`Arrow charged with ${n2}.`});
    add({id:'volley',n:'Volley',k:'phys',pw:1,mp:9,t:'all',lv:10,d:'Rain of arrows on all foes.'});
    add({id:'pin',n:'Pin Down',k:'phys',pw:.9,mp:6,lv:13,fx:[['root',.9],['slow',.5]],d:'Roots a foe in place. May Slow.'});
    add({id:'pierce',n:'Piercing Shot',k:'phys',pw:2.8,mp:14,pierce:1,cost:1.2,lv:20,d:'Ignores half of foe defense.'});
    break;
  case 'monk':
    add({id:'palm',n:'Palm Strike',k:'phys',pw:1.4,mp:0,lv:1,d:'Free and reliable.'});
    add({id:'chi1',n:n1+' Chi Burst',k:'phys',pw:1.6,mp:4,el:e1,lv:4,d:`Fist of ${n1}.`});
    add({id:'med',n:'Meditate',k:'mpself',pw:1,mp:0,t:'self',lv:6,fx:[['regen',1]],d:'Restores HP and MP and grants Regen.'});
    add({id:'fists',n:'Flurry of Fists',k:'phys',pw:.7,hits:3,mp:8,lv:9,d:'Three quick hits.'});
    if(e2)add({id:'chi2',n:n2+' Chi Burst',k:'phys',pw:1.6,mp:4,el:e2,lv:10,d:`Fist of ${n2}.`});
    add({id:'stunb',n:'Stunning Blow',k:'phys',pw:1.2,mp:8,lv:12,fx:[['stun',.4]],d:'May Stun.'});
    add({id:'iron',n:'Iron Body',k:'status',t:'self',mp:8,lv:15,fx:[['ward',1],['bulwark',1]],d:'Gain Ward and Bulwark.'});
    add({id:'dragon',n:'Dragon Fist',k:'phys',pw:3.1,mp:16,el:e1,cost:1.3,lv:22,d:`Blazing ${n1} strike. Slow recovery.`});
    break;
  case 'sniper':
    add({id:'s1a',n:'Thunder Quarrel',k:'phys',pw:1.45,mp:3,el:'lightning',lv:1,d:'A crossbow bolt crackling with Lightning.'});
    add({id:'s1b',n:'Shadow Quarrel',k:'phys',pw:1.6,mp:4,el:'shadow',lv:3,d:'A black-fletched bolt that drinks the light.'});
    add({id:'charge',n:'Hoofbeat Charge',k:'phys',pw:1.8,mp:6,lv:6,fx:[['stun',.25]],d:'Rides a foe down. May Stun.'});
    add({id:'wheel',n:'Wheeling Volley',k:'phys',pw:.95,mp:9,t:'all',lv:9,fx:[['slow',.3]],d:'Circles the field, shooting every foe. May Slow.'});
    add({id:'khan',n:"Khan's Focus",k:'status',t:'self',mp:6,lv:12,fx:[['focus',1],['haste',1]],d:'Focus and Haste: his next shot is a sure critical.'});
    add({id:'squall',n:'Black Squall',k:'phys',pw:1.15,mp:13,t:'all',el:['shadow','lightning'],lv:16,d:'A storm of shadow-lightning bolts on every foe.'});
    add({id:'s3a',n:'Shadowstorm',k:'phys',pw:3.2,mp:16,cost:1.25,crit:.2,el:['shadow','lightning'],lv:22,d:'His namesake shot. Slow to draw, high crit.'});
    break;
  case 'druid':
    add({id:'s1a',n:'Shade Arrow',k:'phys',pw:1.45,mp:3,el:'shadow',lv:1,d:'A longbow arrow wrapped in dusk.'});
    add({id:'hawk',n:'Call Hawk',k:'phys',pw:.62,hits:2,mp:4,lv:3,fx:[['blind',.45]],d:'His hawk dives twice. May Blind.'});
    add({id:'wolf',n:'Call Wolf',k:'phys',pw:1.55,mp:5,lv:5,fx:[['bleed',.6]],d:'His wolf goes for the throat. Likely Bleeds.'});
    add({id:'thorn',n:'Thornwhisper',k:'status',t:'all',mp:7,lv:8,fx:[['root',.5],['slow',.4]],d:'Brambles answer his whisper. May Root and Slow every foe.'});
    add({id:'s1b',n:'Nightbloom Arrow',k:'phys',pw:1.75,mp:5,el:'shadow',lv:11,d:'An arrow that blooms dark on impact.'});
    add({id:'pack',n:'Pack Hunt',k:'phys',pw:1,mp:10,t:'all',lv:14,fx:[['bleed',.4]],d:'Wolf, hawk and ranger hit every foe together.'});
    add({id:'wildmend',n:'Wild Mend',k:'heal',pw:.9,mp:10,t:'allyAll',lv:17,d:'Old forest medicine for the vanguard.'});
    add({id:'s3a',n:'Moonless Volley',k:'phys',pw:1.25,mp:14,cost:1.2,t:'all',el:'shadow',lv:22,d:'A volley loosed in perfect dark.'});
    break;
  case 'archmage':
    add({id:'s1a',n:'Frost Spark',k:'mag',pw:1.4,mp:3,el:'ice',lv:1,d:'A chip of living frost.'});
    add({id:'s1b',n:'Volt Lance',k:'mag',pw:1.5,mp:3,el:'lightning',lv:3,d:'A spear of lightning.'});
    add({id:'rime',n:'Rimebolt',k:'mag',pw:1.9,mp:7,el:['ice','lightning'],lv:6,fx:[['slow',.4]],d:'Frost-coated lightning. May Slow.'});
    add({id:'ward',n:'Prism Ward',k:'status',t:'ally',mp:4,lv:9,fx:[['ward',1]],d:'A lens of ice that blocks the next hit on an ally.'});
    add({id:'s2a',n:'Glacial Tempest',k:'mag',pw:1.05,mp:8,t:'all',el:['ice','lightning'],lv:12,d:'Hail and lightning on every foe.'});
    add({id:'quick',n:'Quicken',k:'status',t:'ally',mp:4,lv:14,fx:[['haste',1]],d:'Haste an ally.'});
    add({id:'s3a',n:'Absolute Zero Surge',k:'mag',pw:3.4,mp:15,cost:1.3,el:['ice','lightning'],lv:22,fx:[['stun',.3]],d:'Freezes the air, then splits it with lightning. May Stun. Slow recovery.'});
    break;
  case 'chronicler':
    add({id:'s1a',n:'Ink Bolt',k:'mag',pw:1.5,mp:4,el:e1,lv:1,d:`A lash of living ${n1} ink.`});
    add({id:'annotate',n:'Annotate',k:'status',t:'one',mp:5,lv:3,fx:[['break',.85],['weaken',.4]],d:'Writes a weakness into a foe: likely Break, may Weaken.'});
    if(e2)add({id:'s1b',n:'Gilded Verse',k:'mag',pw:1.55,mp:5,el:e2,lv:5,d:`A line of ${n2} script that burns where it lands.`});
    add({id:'footnote',n:'Footnote',k:'heal',pw:1.3,mp:6,t:'ally',lv:8,d:'Heals one ally and corrects the record.'});
    add({id:'s2a',n:'Errata',k:'mag',pw:1,mp:12,t:'all',el:e1,lv:12,d:`${n1} ink floods every foe.`});
    add({id:'redact',n:'Redact',k:'status',t:'all',mp:10,lv:15,fx:[['blind',.6]],d:'Blacks out every foe. May Blind.'});
    add({id:'s3a',n:'Final Chapter',k:'mag',pw:3.3,mp:24,cost:1.3,el:e1,lv:20,d:`The last page, written in ${n1}. Slow recovery.`});
    break;
  case 'bard':
    add({id:'song',n:'Soothing Song',k:'heal',pw:.8,mp:8,t:'allyAll',lv:1,d:'Heals the vanguard.'});
    add({id:'hymn',n:'Battle Hymn',k:'status',t:'allyAll',mp:8,lv:3,fx:[['might',1]],d:'Might for the vanguard.'});
    add({id:'dis',n:'Dissonance',k:'status',t:'all',mp:8,lv:6,fx:[['break',.8]],d:'May Break every foe.'});
    add({id:'tune1',n:n1+' Tune',k:'mag',pw:.9,mp:10,t:'all',el:e1,lv:9,d:`${n1} melody on all foes.`});
    add({id:'lull',n:'Lullaby',k:'status',t:'all',mp:9,lv:11,fx:[['slow',.7]],d:'May Slow every foe.'});
    if(e2)add({id:'tune2',n:n2+' Tune',k:'mag',pw:.9,mp:10,t:'all',el:e2,lv:13,d:`${n2} melody on all foes.`});
    add({id:'allegro',n:'Allegro',k:'status',t:'allyAll',mp:14,lv:15,fx:[['haste',1]],d:'Haste for the vanguard.'});
    add({id:'req',n:'Requiem',k:'revive',pw:.5,mp:20,t:'dead',lv:24,d:'Revives a fallen ally at 50% HP.'});
    break;
  }
  if(e2){const c=COMBO[comboKey(t.el)];add(Object.assign({id:'combo',lv:1,mp:16,cost:1.15,combo:1,el:t.el.slice()},c));}
  S.forEach(s=>{if(SKILL_ROLE[s.id]&&s.el)s.role=SKILL_ROLE[s.id];});
  // v5.1: every standard class gets at least one Primer and one Detonator early (lv 1-10) and again late (lv 18+)
  const T=ROLE_FILL[t.cls];
  if(T){const has=(band,role)=>S.some(x=>x.role===role&&(band==='e'?x.lv<=10:x.lv>=18));
    [['e','primer'],['e','det'],['l','primer'],['l','det']].forEach(([band,role])=>{if(has(band,role))return;const k=band+(role==='primer'?'P':'D'),f=T[k];if(!f)return;
      if(f.retag){const x=S.find(q=>q.id===f.retag);if(x){x.el=x.el||e1;x.role=role;x.d+=` Carries ${n1}.`;}return;}
      add(Object.assign({el:e1,role},f(n1,e1)));});}
  S.sort((a,b)=>a.lv-b.lv);
  S.forEach(x=>{x.lv0=x.lv;});
  respaceSkills(S,t,T,n1,e1);
  lateSkills(t.cls,e1,e2,n1,n2).forEach(x=>{x.lv0=x.lv;S.push(x);});
  S.sort((a,b)=>a.lv-b.lv||a.lv0-b.lv0);
  return SKC[t.id]=S;
}
// Beta v0.2.0 pacing: two skills at level 1, then one about every 3.3 levels. The big finishers stay last and the
// dual-element art lands mid-game. lv0 keeps the old level so saves made before this keep what they already learned.
const SKILL_STEP=3.3,BAND_E=10,BAND_L=18;
function skillWeight(x){if(x.combo)return 9.5;if((x.cost||1)>=1.2&&(x.pw||0)>=2.4)return 40+(x.lv0||0);if(x.k==='revive'&&(x.mp||0)>=18)return 39;return x.lv0;}
function respaceSkills(S,t,T,n1,e1){
  const order=S.slice().sort((a,b)=>skillWeight(a)-skillWeight(b)||a.lv0-b.lv0);
  const lvAt=i=>i<2?1:1+Math.round((i-1)*SKILL_STEP);
  order.forEach((x,i)=>{x.lv=lvAt(i);});
  // the early band (lv 10 and under) and the late band (lv 18 and up) each need a Primer and a Detonator
  const band=(x,b)=>b==='e'?x.lv<=BAND_E:x.lv>=BAND_L;
  ['primer','det'].forEach(role=>{
    if(!S.some(x=>x.role===role&&band(x,'e'))){const src=S.filter(x=>x.role===role).sort((a,b)=>a.lv-b.lv)[0];
      const dst=S.filter(x=>band(x,'e')&&!x.role&&x.lv>1).sort((a,b)=>b.lv-a.lv)[0];
      if(src&&dst){const l=src.lv;src.lv=dst.lv;dst.lv=l;}}
  });
  ['primer','det'].forEach(role=>{
    if(S.some(x=>x.role===role&&band(x,'l')))return;
    const f=T&&T['l'+(role==='primer'?'P':'D')];
    if(f&&!f.retag&&!S.some(x=>x.id===f(n1,e1).id)){const o=Object.assign({cost:1,hits:1,t:'one',mp:0,el:e1,role},f(n1,e1));o.lv0=o.lv;o.lv=Math.max(BAND_L,Math.max(...S.map(x=>x.lv))+3);S.push(o);return;}
    const early=S.filter(x=>x.role===role&&band(x,'e')).length;
    const src=S.filter(x=>x.role===role&&(!band(x,'e')||early>1)).sort((a,b)=>b.lv-a.lv)[0]||null,dst=S.filter(x=>band(x,'l')&&!x.role).sort((a,b)=>a.lv-b.lv)[0];
    if(src&&dst){const l=src.lv;src.lv=dst.lv;dst.lv=l;}
    else if(src)src.lv=Math.max(BAND_L,Math.max(...S.map(x=>x.lv))+3);
  });
}


// =================== LIMIT BREAKS ===================
// One per class, themed by the hero's first element. The gauge fills from damage dealt and taken.
const LIMIT={
 warrior:{n:'Worldsplitter',k:'phys',pw:2.4,t:'all',fx:[['break',.6]],d:'A ground-splitting blow on every foe. May Break.'},
 knight:{n:'Bastion',k:'status',t:'allyAll',fx:[['ward',1],['bulwark',1],['might',1]],heal:.2,d:'Ward, Bulwark and Might for the vanguard, and a small heal.'},
 mage:{n:'Starfall',k:'mag',pw:2.6,t:'all',d:'Calls a rain of elemental stars on every foe.'},
 healer:{n:'Benediction',k:'heal',pw:3,t:'allyAll',revive:.4,cleanse:1,d:'Fully restores and cleanses the vanguard and revives every fallen hero at 40% HP.'},
 thief:{n:'Thousand Cuts',k:'phys',pw:.8,t:'rand',hits:7,crit:.2,d:'Seven blinding strikes at random foes.'},
 archer:{n:'Arrowstorm',k:'phys',pw:2.2,t:'all',fx:[['bleed',.7]],d:'A storm of arrows on every foe. Likely Bleeds.'},
 monk:{n:'Hundred Fists',k:'phys',pw:.65,t:'one',hits:7,d:'Seven blows on one foe.'},
 sniper:{n:'Thousand Hooves',k:'phys',pw:2.5,t:'all',fx:[['stun',.3]],d:'A whole horde of storm riders thunders through every foe. May Stun.'},
 druid:{n:'Call of the Wild',k:'phys',pw:.8,t:'rand',hits:6,fx:[['bleed',.5]],d:'Every beast in earshot answers: six savage strikes at random foes.'},
 archmage:{n:'Stormfrost Singularity',k:'mag',pw:2.8,t:'all',fx:[['slow',.6],['stun',.25]],d:'A point of absolute cold that throws lightning in every direction.'},
 chronicler:{n:'Index of Ruin',k:'mag',pw:2.7,t:'all',fx:[['weaken',.5],['break',.5]],d:'Reads every catalogued horror aloud at once. Strikes all foes; may Weaken and Break.'},
 bard:{n:'Grand Anthem',k:'status',t:'allyAll',fx:[['might',1],['haste',1],['regen',1]],heal:.3,d:'Might, Haste and Regen for the vanguard, plus a 30% heal.'}
};
// Beta v0.3.0: Limit I opens at level 15 (70% of the values above); at level 30 it becomes Limit II, a new move at ~130% power.
const LIMIT2={
 warrior:{n:'Cataclysm Edge',k:'phys',pw:3.1,t:'all',fx:[['break',.9]],self:[['might',1]],shieldChip:2,d:'Splits the battlefield with one swing: every foe takes a huge hit and likely Breaks, and you gain Might. Chips 2 shield pips.'},
 knight:{n:'Citadel of Dawn',k:'status',t:'allyAll',fx:[['ward',1],['bulwark',1],['might',1],['regen',1]],heal:.3,d:'A fortress of light: Ward, Bulwark, Might and Regen for the vanguard, and a 30% heal.'},
 mage:{n:'Meteor Requiem',k:'mag',pw:3.4,t:'all',fx:[['break',.5]],shieldChip:2,d:'A falling sky of elemental stars on every foe. May Break; chips 2 shield pips.'},
 healer:{n:"Seraph's Grace",k:'heal',pw:3.9,t:'allyAll',revive:.7,cleanse:1,fx:[['regen',1]],d:'Restores and cleanses the vanguard, grants Regen, and revives every fallen hero at 70% HP.'},
 thief:{n:'Phantom Waltz',k:'phys',pw:1.04,t:'rand',hits:7,crit:.3,steal:1,d:'Seven strikes from nowhere at random foes, each with a high crit chance, and a pocket picked on the way out.'},
 archer:{n:'Skyfall Volley',k:'phys',pw:2.86,t:'all',fx:[['bleed',.9],['slow',.5]],d:'The sky goes dark with arrows. Every foe likely Bleeds and may Slow.'},
 monk:{n:"Heaven's Thousand",k:'phys',pw:.85,t:'one',hits:7,fx:[['stun',.4]],d:'Seven blows too fast to see, ending in a strike that may Stun.'},
 sniper:{n:"Khan's Tempest",k:'phys',pw:3.25,t:'all',fx:[['stun',.4]],shieldChip:2,d:'The whole horde rides through a thunderstorm of bolts. Every foe may Stun; chips 2 shield pips.'},
 druid:{n:'Primal Stampede',k:'phys',pw:1.04,t:'rand',hits:6,fx:[['bleed',.7],['root',.4]],d:'The forest itself charges: six savage strikes at random foes. Likely Bleeds, may Root.'},
 archmage:{n:'Absolute Tempest',k:'mag',pw:3.64,t:'all',fx:[['slow',.8],['stun',.35]],shieldChip:2,d:'A storm of ice and lightning that stops time. Every foe likely Slows and may Stun; chips 2 shield pips.'},
 chronicler:{n:'The Last Index',k:'mag',pw:3.5,t:'all',fx:[['weaken',.7],['break',.7]],shieldChip:2,d:'Closes the book on every foe at once. Likely Weakens and Breaks; chips 2 shield pips.'},
 bard:{n:'Encore Eternal',k:'status',t:'allyAll',fx:[['might',1],['haste',1],['regen',1],['ward',1]],heal:.4,d:'The song that never ends: Might, Haste, Regen and Ward for the vanguard, plus a 40% heal.'}
};
// Beta v0.3.0: level 42 and 46 skills and a level 50 capstone for every class. Fixed levels: the respacer leaves them alone.
// New skill flags: execute (x2 damage below that HP share), drain (heal by that share of damage), shieldChip (extra Break pips),
// strip (removes the target's boons), lbParty (adds Limit gauge to the vanguard).
function lateSkills(cls,e1,e2,n1,n2){const E2=e2||e1,N2=n2||n1;const L={
 warrior:[{id:'quake',n:'Earthshaker',k:'phys',pw:1.3,mp:14,t:'all',el:e1,role:'primer',lv:42,fx:[['slow',.4]],d:`Stamps ${n1} through the ground under every foe. May Slow.`},
  {id:'laststand',n:'Last Stand',k:'status',t:'self',mp:12,lv:46,fx:[['might',1],['bulwark',1],['regen',1]],d:'Plants his feet: Might, Bulwark and Regen.'},
  {id:'ragnarok',n:'Ragnarok',k:'phys',pw:4.2,mp:28,cost:1.3,el:e1,role:'det',lv:50,execute:.3,shieldChip:3,cap:1,d:`The end of the world in one ${n1} blow. Double damage below 30% HP; chips 3 shield pips.`}],
 knight:[{id:'consground',n:'Consecrated Ground',k:'phys',pw:.95,mp:16,t:'all',el:e1,role:'primer',lv:42,allyFx:[['bulwark',1]],d:`Hallows the ground under every foe with ${n1} and gives the line Bulwark.`},
  {id:'holylance',n:'Holy Lance',k:'phys',pw:2.6,mp:16,el:E2,role:'det',pierce:1,lv:46,d:`A ${N2} lance that ignores half of defense.`},
  {id:'oath',n:'Unbreakable Oath',k:'status',t:'allyAll',mp:30,lv:50,fx:[['ward',1],['bulwark',1],['might',1],['regen',1]],heal:.25,lbParty:25,cap:1,d:'Swears the line will hold: Ward, Bulwark, Might and Regen for all, a 25% heal, and +25 Limit gauge.'}],
 mage:[{id:'seal',n:'Prismatic Seal',k:'mag',pw:.95,mp:16,t:'all',el:E2,role:'primer',lv:42,fx:[['weaken',.4]],d:`Seals every foe in ${N2}. May Weaken.`},
  {id:'overchan',n:'Overchannel',k:'status',t:'self',mp:10,lv:46,fx:[['might',1],['haste',1]],d:'Burns the reserves: Might and Haste.'},
  {id:'cataclysm',n:'Cataclysm',k:'mag',pw:2.1,mp:34,cost:1.4,t:'all',el:e2?[e1,e2]:e1,role:'det',lv:50,strip:1,shieldChip:2,cap:1,d:'Unmakes the field: huge damage to every foe, strips their boons and chips 2 shield pips.'}],
 healer:[{id:'radward',n:'Radiant Ward',k:'heal',pw:1.4,mp:18,t:'allyAll',cleanse:1,lv:42,fx:[['ward',1]],d:'Heals and cleanses the vanguard and gives everyone Ward.'},
  {id:'judgray',n:'Brand of Dawn',k:'mag',pw:1.1,mp:14,t:'all',el:e1,role:'primer',lv:46,fx:[['blind',.3]],d:`Brands every foe with ${n1}. May Blind.`},
  {id:'miracle',n:'Miracle',k:'heal',pw:3.5,mp:40,t:'allyAll',revive:.6,cleanse:1,lv:50,fx:[['regen',1]],lbParty:30,cap:1,d:'Full heal and cleanse for the line, every fallen hero back at 60%, Regen, and +30 Limit gauge.'}],
 thief:[{id:'shadowstep',n:'Shadowstep',k:'phys',pw:1.6,mp:10,cost:.7,el:e1,role:'primer',crit:.3,lv:42,fx:[['blind',.5]],d:`Steps through the dark with a ${n1} blade. High crit, may Blind.`},
  {id:'larceny',n:'Grand Larceny',k:'phys',pw:.9,mp:14,t:'all',steal:1,lv:46,fx:[['weaken',.4]],d:'Robs every foe at once. May Weaken.'},
  {id:'lotus',n:'Death Lotus',k:'phys',pw:.72,mp:30,t:'rand',hits:9,crit:.35,el:e1,role:'det',lv:50,cap:1,d:`Nine ${n1} petals of steel at random foes, each a likely crit.`}],
 archer:[{id:'mark',n:"Hunter's Mark",k:'phys',pw:1.5,mp:10,el:e1,role:'primer',lv:42,fx:[['break',.8]],d:`Pins a ${n1} mark on the prey. Likely Breaks.`},
  {id:'galebar',n:'Gale Barrage',k:'phys',pw:.72,hits:2,mp:18,t:'all',el:E2,role:'det',lv:46,d:`Two ${N2} volleys over every foe.`},
  {id:'heavenp',n:'Heavenpiercer',k:'phys',pw:4.4,mp:30,cost:1.3,pierce:1,crit:.3,el:e1,role:'det',lv:50,shieldChip:3,cap:1,d:'One arrow loosed at the sky that comes down through anything. Ignores half of defense; chips 3 shield pips.'}],
 monk:[{id:'furnace',n:'Inner Furnace',k:'mpself',pw:1.6,mp:0,t:'self',lv:42,fx:[['haste',1],['might',1]],d:'Restores HP and MP and lights the furnace: Haste and Might.'},
  {id:'tempkick',n:'Tempest Kick',k:'phys',pw:1.3,mp:14,t:'all',el:e1,role:'primer',lv:46,fx:[['stun',.2]],d:`A ${n1} whirlwind kick through every foe. May Stun.`},
  {id:'ascend',n:'Ascension Fist',k:'phys',pw:.95,hits:5,mp:28,el:e2?[e1,e2]:e1,role:'det',drain:.2,lv:50,cap:1,d:'Five blows that climb to the heavens. Heals him for 20% of the damage.'}],
 bard:[{id:'rondo',n:'Rondo of Ruin',k:'mag',pw:1.1,mp:16,t:'all',el:e1,role:'primer',lv:42,fx:[['break',.5]],d:`A ${n1} rondo on every foe. May Break.`},
  {id:'secondwind',n:'Second Wind',k:'heal',pw:1.2,mp:18,t:'allyAll',lv:46,fx:[['haste',1]],lbParty:20,d:'Heals the line, grants Haste and +20 Limit gauge.'},
  {id:'symphony',n:'Symphony of Stars',k:'mag',pw:1.6,mp:34,t:'all',el:E2,role:'det',allyFx:[['might',1],['haste',1],['regen',1]],lv:50,cap:1,d:'The finale: every foe takes the full orchestra while the line gains Might, Haste and Regen.'}],
 sniper:[{id:'stormmark',n:"Stormrider's Mark",k:'phys',pw:1,mp:12,t:'all',el:'lightning',role:'primer',lv:42,fx:[['slow',.4]],d:'Bolts every foe with Lightning to mark the charge. May Slow.'},
  {id:'eclipse',n:'Eclipse Bolt',k:'phys',pw:2.8,mp:16,el:'shadow',role:'det',pierce:1,lv:46,d:'A black bolt that ignores half of defense.'},
  {id:'tenk',n:'Ten Thousand Hooves',k:'phys',pw:.75,hits:8,mp:32,t:'rand',el:['lightning','shadow'],role:'det',crit:.25,lv:50,fx:[['stun',.2]],cap:1,d:'Eight storm riders at random foes, shadow and lightning. May Stun.'}],
 druid:[{id:'wildmark',n:'Wild Hunt',k:'phys',pw:1,mp:12,t:'all',el:'shadow',role:'primer',lv:42,fx:[['bleed',.5]],d:'The pack marks every foe with dusk. May Bleed.'},
  {id:'bramble',n:'Bramble Prison',k:'status',t:'all',mp:14,lv:46,fx:[['root',.8],['slow',.6],['break',.4]],d:'Thorns close over every foe: Root, Slow, maybe Break.'},
  {id:'oldwood',n:'Heart of the Old Wood',k:'phys',pw:1.9,mp:32,t:'all',el:'shadow',role:'det',drain:.15,allyFx:[['regen',1]],lv:50,cap:1,d:'The oldest tree wakes and strikes every foe; the line gains Regen and he drinks 15% of the damage.'}],
 archmage:[{id:'hoarfield',n:'Hoarfrost Field',k:'mag',pw:1,mp:12,t:'all',el:'ice',role:'primer',lv:42,fx:[['slow',.5]],d:'Freezes the ground under every foe. May Slow.'},
  {id:'lattice',n:'Thunder Lattice',k:'mag',pw:1.3,mp:16,t:'all',el:'lightning',role:'det',lv:46,fx:[['stun',.2]],d:'A cage of lightning on every foe. May Stun.'},
  {id:'zeropoint',n:'Zero Point',k:'mag',pw:2.3,mp:34,cost:1.4,t:'all',el:['ice','lightning'],role:'det',lv:50,fx:[['stun',.35]],shieldChip:3,cap:1,d:'Everything stops, then shatters. Every foe may Stun; chips 3 shield pips.'}],
 chronicler:[{id:'marginalia',n:'Marginalia',k:'status',t:'all',mp:12,lv:42,fx:[['break',.7],['weaken',.5]],d:'Scribbles weaknesses into every foe: likely Break, may Weaken.'},
  {id:'livescript',n:'Living Script',k:'mag',pw:1.2,mp:16,t:'all',el:e1,role:'primer',lv:46,d:`${n1} words crawl over every foe.`},
  {id:'finaled',n:'Final Edition',k:'mag',pw:4.5,mp:34,cost:1.3,el:e1,role:'det',strip:1,execute:.3,shieldChip:3,lv:50,cap:1,d:'Publishes the foe\'s ending: double damage below 30% HP, strips boons, chips 3 shield pips.'}]
};return (L[cls]||[]).map(o=>Object.assign({cost:1,hits:1,t:'one',mp:0,el:null,fixed:1},o));}

// =================== BONDS ===================
// Pairs who fight side by side grow a bond. Level 1 unlocks a campfire talk, level 2 a joint tech, level 3 powers it up.
const BONDS=[
 {a:'brann',b:'gilda',tech:{n:'Last Call',k:'phys',pw:1.6,t:'all',el:'fire',fx:[['burn',.6]],d:'A tankard-swinging fire brawl across every foe.'},
  talk:[["Brann","You sing that ballad about me one more time, Gilda."],["Gilda","Which one? The one where you lose a fight to a door?"],["Brann","...the door was enchanted."]],
  talk2:[["Gilda","When this is over, I'm writing you a proper song."],["Brann","No doors in it."],["Gilda","One door. A small one. For realism."]]},
 {a:'oren',b:'halden',tech:{n:'Shieldwall',k:'status',t:'allyAll',fx:[['ward',1],['bulwark',1]],d:'Two old wardens lock shields: Ward and Bulwark for the line.'},
  talk:[["Halden","You plant your feet wrong, Oren."],["Oren","I have planted them this way for twenty years."],["Halden","And look how far you have walked."]],
  talk2:[["Oren","...Teach me, then."],["Halden","Heels in, shoulders loose. The wall does not need to be angry. It just needs to stay."]]},
 {a:'tess',b:'wren',tech:{n:'Crossfire',k:'phys',pw:1.4,hits:2,t:'one',el:['wind','earth'],fx:[['bleed',.8]],d:'Two arrows from two angles. Likely Bleeds.'},
  talk:[["Tess","Bet you a silver I hit the crow first."],["Wren","The crow is my friend."],["Tess","...Bet you a silver I hit the pinecone first?"]],
  talk2:[["Wren","You aim with your shoulders. Breathe with your feet."],["Tess","That's not a real thing."],["Wren","Then why did you just hit it?"]]},
 {a:'sable',b:'pip',tech:{n:'Pickpocket Waltz',k:'phys',pw:.9,hits:3,t:'one',el:['shadow','water'],steal:1,d:'Three quick cuts and a stolen purse.'},
  talk:[["Pip","How did you get my lunch out of a sealed bag?"],["Sable","What lunch?"],["Pip","...exactly."]],
  talk2:[["Sable","You have quick hands. Quicker than mine, once."],["Pip","Once?"],["Sable","Before I stopped being seen."]]},
 {a:'lumen',b:'corwin',tech:{n:'Dawnbreaker',k:'mag',pw:1.5,t:'all',el:'light',fx:[['blind',.5]],d:'Lamp and blade together: a sunrise on every foe.'},
  talk:[["Corwin","Little lamp-keeper. You walk into fights smaller than my shield."],["Lumen","And I walk out of them, sir."]],
  talk2:[["Corwin","I have been knighted by kings, Lumen. It meant less than you thanking me."],["Lumen","Then thank you. Again. For tomorrow too."]]},
 {a:'kael',b:'taro',tech:{n:'Thunderclap',k:'phys',pw:3,t:'one',el:'lightning',fx:[['stun',.5]],d:'Two storm-born fists meet on one foe. May Stun.'},
  talk:[["Taro","You talk to the thunder?"],["Kael","It talks. I listen."],["Taro","What does it say?"],["Kael","Mostly BOOM."]],
  talk2:[["Taro","I heard it tonight. During the storm."],["Kael","See? BOOM."],["Taro","...BOOM."]]},
 {a:'fenn',b:'frey',tech:{n:'Glacier Library',k:'mag',pw:1.5,t:'all',el:'ice',fx:[['slow',.7]],d:'Catalogued frost on every foe. Likely Slows.'},
  talk:[["Fenn","Your people keep records of the glacier?"],["Frey","Six thousand years of ice."],["Fenn","May I...?"],["Frey","Bring a coat."]]},
 {a:'mira',b:'marisol',tech:{n:'Twin Tides',k:'mag',pw:1.4,t:'all',el:'water',allyFx:[['regen',1]],d:'A wave for the foes, a spring for the line.'},
  talk:[["Mira","You read the tides with your fins?"],["Marisol","And you read them with books."],["Mira","Mine are less wet."]]},
 {a:'jun',b:'shen',tech:{n:'Fire and Ice Fists',k:'phys',pw:.8,hits:4,t:'one',el:['fire','ice'],d:'Four blows that alternate scorch and frost.'},
  talk:[["Jun","You bathe in ice water? Every morning?"],["Shen","You set your gloves on fire. Every morning."],["Jun","Fair."]]},
 {a:'vael',b:'rook',tech:{n:'Grave Hymn',k:'mag',pw:2.6,t:'one',el:'shadow',fx:[['poison',.8]],d:'A hymn the dead hum along to.'},
  talk:[["Vael","The dark talks to you too, doesn't it?"],["Rook","It mostly asks about the weather."]]},
 {a:'lark',b:'zephra',tech:{n:'Skysong',k:'status',t:'allyAll',fx:[['haste',1],['regen',1],['might',1]],d:'A duet the wind joins in on: Haste, Regen and Might.'},
  talk:[["Lark","You conduct the wind. I just sing at it."],["Zephra","Then sing, and I will tell it where to go."]]},
 {a:'sylva',b:'alder',tech:{n:'Overgrowth',k:'mag',pw:1.3,t:'all',el:['earth','water'],fx:[['root',.7]],d:'Roots burst from the mud under every foe.'},
  talk:[["Alder","The marsh speaks well of you."],["Sylva","The marsh speaks?"],["Alder","Slowly. Mostly in frogs."]]},
 {a:'cass',b:'kit',tech:{n:'Updraft Heist',k:'phys',pw:2.4,t:'one',el:['wind','lightning'],crit:.3,d:'Cass throws Kit into the sky. Kit comes down shooting.'},
  talk:[["Kit","If you throw me, I can hit it from above."],["Cass","Last time I threw you, you landed in a well."],["Kit","And found treasure!"]]},
 {a:'sorrel',b:'ember',tech:{n:'Twin Pyres',k:'mag',pw:1.8,t:'all',el:'fire',fx:[['burn',.7]],d:'Two scholars of fire, one very large fire.'},
  talk:[["Sorrel","Your hair is on fire."],["Ember","Always."],["Sorrel","May I take notes?"]]},
 {a:'dagna',b:'brann',tech:{n:'Forge and Frost',k:'phys',pw:2.8,t:'one',el:['fire','ice'],fx:[['break',.8]],d:'Hot hammer, cold hammer. Shatters armor.'},
  talk:[["Dagna","Northern forges run cold, Brann."],["Brann","That's not a forge, that's a fridge."],["Dagna","And yet my steel never cracks."]]},
 {a:'isolde',b:'lumen',tech:{n:'Tide of Grace',k:'heal',pw:1.6,t:'allyAll',cleanse:1,d:'Two lights, one prayer: heals and cleanses the line.'},
  talk:[["Isolde","You glow when you are nervous."],["Lumen","Everyone glows when they are nervous."],["Isolde","No, child. Only you."]]},
 {a:'nyx',b:'sable',tech:{n:'Twin Shadows',k:'phys',pw:1.5,hits:2,t:'one',el:['shadow','ice'],fx:[['blind',.7]],d:'Two shadows, one target. Likely Blinds.'},
  talk:[["Nyx","You stole my spot by the fire."],["Sable","You stole my scarf."],["Nyx","It looked cold."]]},
 {a:'astra',b:'vael',tech:{n:'Event Horizon',k:'mag',pw:2.0,t:'all',el:['light','shadow'],fx:[['weaken',.6],['break',.6]],d:'Light bends into dark on every foe.'},
  talk:[["Vael","I have studied the eclipse my whole life."],["Astra","I was born in one. It was very loud."]]},
 {a:'ciro',b:'jun',tech:{n:'Sunrise Kick',k:'phys',pw:2.2,t:'one',el:['fire','light'],d:'A flying kick off a flaming arrow.'},
  talk:[["Jun","Shoot an arrow and I'll kick it."],["Ciro","That is the worst idea I have ever heard."],["Jun","So, yes?"]]}
];
const bondKey=(a,b)=>[a,b].sort().join('|');
const BONDMAP={};BONDS.forEach(b=>{BONDMAP[bondKey(b.a,b.b)]=b;});
