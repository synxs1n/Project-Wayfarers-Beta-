// ===== foes.js (v0.4.0): foe data: monsters, bosses, guardians (split out of data.js) =====
// =================== FOE DATA (monsters, bosses). Split out of data.js ===================
// =================== FOES ===================
// skills: [name, element, power, target, kind, effects]
const MON={
 mossling:{n:'Mossling',art:'mossling',el:['earth'],hp:1,atk:.9,def:1.1,mag:.8,res:.9,spd:.8,sk:[['Spore Puff','earth',1.1,'one','mag',[['poison',.5]]]]},
 gustimp:{n:'Gust Imp',art:'gustimp',el:['wind'],hp:.8,atk:.9,def:.8,mag:1,res:.9,spd:1.3,sk:[['Razor Gale','wind',1.1,'one','mag',[['bleed',.35]]]]},
 dewtoad:{n:'Dewtoad',art:'dewtoad',el:['water'],hp:1.15,atk:1,def:1,mag:.8,res:.9,spd:.85,sk:[['Tongue Lash','water',1.25,'one','phys'],['Puff Up','water',0,'self','buff',[['bulwark',1]]]]},
 cinderpup:{n:'Cinder Pup',art:'cinderpup',el:['fire'],hp:.9,atk:1.1,def:.8,mag:.8,res:.8,spd:1.1,sk:[['Ember Bite','fire',1.3,'one','phys',[['burn',.35]]]]},
 crawler:{n:'Brine Crawler',art:'crawler',el:['water'],hp:1.1,atk:1.05,def:1.2,mag:.8,res:.9,spd:.8,sk:[['Pincer','water',1.3,'one','phys',[['bleed',.4]]],['Harden','water',0,'self','buff',[['bulwark',1]]]]},
 gull:{n:'Glass Gull',art:'gull',el:['wind','light'],hp:.8,atk:1.1,def:.8,mag:1,res:1,spd:1.4,sk:[['Glint Dive','light',1.3,'one','phys',[['blind',.3]]]]},
 tidewisp:{n:'Tide Wisp',art:'tidewisp',el:['water','lightning'],hp:.8,atk:.8,def:.8,mag:1.25,res:1.1,spd:1.1,sk:[['Static Tide','lightning',1,'all','mag',[['stun',.1]]]]},
 shellguard:{n:'Shellguard',art:'shellguard',el:['earth','water'],hp:1.4,atk:1,def:1.5,mag:.7,res:1,spd:.6,sk:[['Shell Slam','earth',1.5,'one','phys'],['Withdraw','earth',0,'self','buff',[['ward',1]]]]},
 magmaslime:{n:'Magma Slime',art:'magmaslime',el:['fire','earth'],hp:1.2,atk:1,def:1.1,mag:1,res:.9,spd:.8,sk:[['Lava Splash','fire',1.05,'all','mag',[['burn',.3]]]]},
 cavebat:{n:'Cave Bat',art:'cavebat',el:['shadow'],hp:.75,atk:1.1,def:.7,mag:.9,res:.9,spd:1.5,sk:[['Dusk Screech','shadow',1.1,'one','mag',[['blind',.5]]]]},
 ashwraith:{n:'Ash Wraith',art:'ashwraith',el:['fire','shadow'],hp:.9,atk:.8,def:.8,mag:1.3,res:1.2,spd:1,sk:[['Cinder Wail','fire',1.1,'all','mag',[['weaken',.3]]]]},
 slaggolem:{n:'Slag Golem',art:'slaggolem',el:['earth','fire'],hp:1.5,atk:1.2,def:1.4,mag:.7,res:.9,spd:.6,sk:[['Molten Fist','fire',1.6,'one','phys',[['burn',.4]]]]},
 frostwolf:{n:'Frost Wolf',art:'frostwolf',el:['ice'],hp:1,atk:1.2,def:.9,mag:.8,res:.9,spd:1.2,sk:[['Rime Fang','ice',1.5,'one','phys',[['bleed',.4]]]]},
 snowharpy:{n:'Snow Harpy',art:'snowharpy',el:['ice','wind'],hp:.8,atk:1,def:.8,mag:1.1,res:1,spd:1.4,sk:[['Hail Gale','wind',1,'all','mag',[['slow',.35]]]]},
 yeti:{n:'Frostling Yeti',art:'yeti',el:['ice'],hp:1.4,atk:1.25,def:1,mag:.7,res:.9,spd:.75,sk:[['Avalanche Slam','ice',1.6,'one','phys',[['stun',.2]]]]},
 iceknight:{n:'Icebound Knight',art:'iceknight',el:['ice','earth'],hp:1.5,atk:1.2,def:1.5,mag:.7,res:1,spd:.6,sk:[['Glacier Cleave','ice',1.5,'one','phys'],['Frost Guard','ice',0,'self','buff',[['bulwark',1]]]]},
 thunderhawk:{n:'Thunder Hawk',art:'thunderhawk',el:['lightning','wind'],hp:.9,atk:1.2,def:.8,mag:1,res:1,spd:1.4,sk:[['Thunder Dive','lightning',1.5,'one','phys',[['stun',.2]]]]},
 stormling:{n:'Stormling',art:'stormling',el:['lightning'],hp:.85,atk:.8,def:.8,mag:1.3,res:1.1,spd:1.2,sk:[['Arc Flash','lightning',1,'all','mag',[['stun',.1]]]]},
 gargoyle:{n:'Skyshaper',art:'gargoyle',el:['earth','lightning'],hp:1.5,atk:1.2,def:1.4,mag:.8,res:1,spd:.6,sk:[['Stone Gaze','earth',1.15,'one','mag',[['root',.6]]],['Crushing Leap','earth',1.5,'one','phys']]},
 cloudray:{n:'Cloud Ray',art:'cloudray',el:['wind'],hp:1,atk:.9,def:.9,mag:1.1,res:1,spd:1.2,sk:[['Downdraft','wind',1.1,'all','mag',[['slow',.3]]]]},
 voidspawn:{n:'Void Spawn',art:'voidspawn',el:['shadow'],hp:1.2,atk:1.1,def:1,mag:1.1,res:1,spd:.9,sk:[['Void Pulse','shadow',1.1,'all','mag',[['poison',.3]]]]},
 eclipsewraith:{n:'Eclipse Wraith',art:'eclipsewraith',el:['shadow','light'],hp:1,atk:.9,def:.9,mag:1.4,res:1.3,spd:1.1,sk:[['Penumbra','shadow',1.4,'one','mag',[['blind',.4]]]]},
 stareater:{n:'Star Eater',art:'stareater',el:['shadow','fire'],hp:1.1,atk:1.3,def:1,mag:.9,res:1,spd:1.1,sk:[['Starbite','shadow',1.7,'one','phys',[['bleed',.5]]]]},
 huskguard:{n:'Husk Watcher',art:'huskguard',el:['light','shadow'],hp:1.6,atk:1.3,def:1.5,mag:.8,res:1.1,spd:.6,sk:[['Hollow Slam','light',1.6,'one','phys'],['Vigil','light',0,'self','buff',[['bulwark',1]]]]}
};
// Scourges (GUARDIANS, 12, four drawn per run) and Calamities (FINALS, 4, one per run).
// phase: triggers once when HP falls below 'at'.
const GUARDIANS={
 thornwarden:{n:'Thornback Warden',art:'thornwarden',el:['earth','water'],hp:5.2,atk:1.2,def:1.25,mag:1,res:1.1,spd:.95,sk:[['Bramble Lash','earth',1.5,'one','phys',[['bleed',.6]]],['Rainroot Surge','water',1.1,'all','mag',[['slow',.4]]],['Bark Skin','earth',0,'self','buff',[['bulwark',1]]]],
   phase:{at:.5,say:'The Warden sinks its roots and regrows!',self:[['regen',1],['bulwark',1]],heal:.1},intro:'A hedge of thorn and stone rises in the barrow: the Thornback Warden, still guarding a beacon it no longer remembers how to light.'},
 drake:{n:'Maelstrom Drake',art:'drake',el:['water','lightning'],hp:5.4,atk:1.2,def:1.2,mag:1.2,res:1.1,spd:1,sk:[['Tidal Fang','water',1.6,'one','phys',[['bleed',.4]]],['Storm Surge','lightning',1.15,'all','mag',[['stun',.12]]],['Undertow','water',1.2,'one','mag',[['root',.6]]]],
   phase:{at:.5,say:'The Drake calls down the storm!',self:[['haste',1]]},intro:'The water heaves. The Maelstrom Drake coils through the grotto, crackling with stolen storm.'},
 cinderking:{n:'Cinderking Varroth',art:'cinderking',el:['fire','earth'],hp:5.6,atk:1.3,def:1.3,mag:1.1,res:1.1,spd:.95,sk:[['Magma Crush','fire',1.7,'one','phys',[['burn',.5]]],['Eruption','fire',1.2,'all','mag',[['burn',.3]]],['Iron Will','earth',0,'self','buff',[['might',1]]]],
   phase:{at:.5,say:'Varroth wraps himself in magma armor!',self:[['ward',1],['might',1]]},intro:'Cinderking Varroth rises from the slag, crowned in cooling iron.'},
 hoarwyrm:{n:'Hoarwyrm',art:'hoarwyrm',el:['ice','wind'],hp:5.2,atk:1.2,def:1.2,mag:1.2,res:1.2,spd:1.05,sk:[['Glacial Bite','ice',1.7,'one','phys',[['bleed',.5]]],['Whiteout','ice',1.15,'all','mag',[['slow',.45]]],['Frost Breath','ice',1.3,'one','mag',[['slow',1]]]],
   phase:{at:.5,say:'The Hoarwyrm summons a blizzard!',party:[['slow',.8]]},intro:'The Hoarwyrm unfolds from the ice, wings like sheets of glass.'},
 ysolde:{n:'Stormcaller Ysolde',art:'ysolde',el:['lightning','light'],hp:5.2,atk:1,def:1.1,mag:1.35,res:1.4,spd:1.15,sk:[['Judgement Bolt','lightning',1.7,'one','mag',[['stun',.22]]],['Thunderhead','lightning',1.2,'all','mag'],['Radiant Veil','light',0,'self','buff',[['ward',1]]]],
   phase:{at:.5,say:'Ysolde calls a Stormling to her side!',summon:'stormling'},intro:'Stormcaller Ysolde hangs in the air, eyes white with lightning, the beacon bleeding shadow behind her.'},
 bonecolossus:{n:'Bone Colossus',art:'bonecolossus',el:['shadow','earth'],hp:5.8,atk:1.3,def:1.35,mag:.9,res:1,spd:.85,sk:[['Ossuary Slam','earth',1.7,'one','phys',[['stun',.2]]],['Grave Dust','shadow',1.1,'all','mag',[['poison',.4]]]],
   phase:{at:.4,say:'The Colossus pulls its bones back together!',heal:.18},intro:'Bones grind together in the dark: a Colossus built from every warrior the barrow ever took.'},
 queenmantis:{n:'Queen Mantis',art:'queenmantis',el:['wind','earth'],hp:5,atk:1.35,def:1.1,mag:.9,res:1,spd:1.2,sk:[['Scythe Dance','wind',.8,'one','phys',[['bleed',.6]]],['Dust Wings','earth',1.05,'all','mag',[['blind',.4]]]],multi:2,
   phase:{at:.5,say:'The Queen calls her brood!',summon:'gustimp'},intro:'Chitin clicks overhead. The Queen Mantis drops from the ceiling, blades raised in prayer.'},
 gloomcap:{n:'Gloomcap Matriarch',art:'gloomcap',el:['shadow','water'],hp:5.6,atk:1,def:1.15,mag:1.3,res:1.2,spd:.9,sk:[['Spore Burst','shadow',1.1,'all','mag',[['poison',.6]]],['Drowning Mold','water',1.5,'one','mag',[['weaken',.5]]]],
   phase:{at:.5,say:'The Matriarch fills the air with choking spores!',party:[['poison',.7],['blind',.4]]},intro:'A towering mushroom breathes out a sigh of glowing spores. Something old and patient lives in its gills.'},
 ironsentinel:{n:'Iron Sentinel',art:'ironsentinel',el:['lightning','fire'],hp:5.6,atk:1.3,def:1.45,mag:1.1,res:.95,spd:.9,sk:[['Piston Fist','fire',1.6,'one','phys',[['burn',.4]]],['Arc Discharge','lightning',1.15,'all','mag',[['stun',.15]]]],
   phase:{at:.5,say:'OVERCLOCK. The Sentinel vents steam and speeds up!',self:[['haste',1],['might',1]],selfBad:[['break',1]]},intro:'Gears turn in the walls. An Iron Sentinel built by a forgotten guild clanks awake, its furnace heart blazing.'},
 siren:{n:'Siren of the Deep',art:'siren',el:['water','light'],hp:5.2,atk:.95,def:1.05,mag:1.35,res:1.3,spd:1.1,sk:[['Drowning Song','water',1.2,'all','mag',[['slow',.4]]],['Lure','light',1.5,'one','mag',[['stun',.3]]]],
   phase:{at:.5,say:'The Siren sings a healing hymn to herself!',self:[['regen',1]],heal:.1},intro:'A voice hums under the water, impossibly sweet. The Siren of the Deep rises, pearl-eyed.'},
 ashwyvern:{n:'Ashen Wyvern',art:'ashwyvern',el:['fire','wind'],hp:5.2,atk:1.3,def:1.1,mag:1.15,res:1,spd:1.15,sk:[['Cinder Dive','fire',1.6,'one','phys',[['burn',.5]]],['Ash Gale','wind',1.1,'all','mag',[['blind',.35]]]],
   phase:{at:.5,say:'The Wyvern takes to the air!',self:[['haste',1],['bulwark',1]]},intro:'Ash rains from the rafters. An Ashen Wyvern lands on the beacon and screams.'},
 frostlich:{n:'Frost Lich',art:'frostlich',el:['ice','shadow'],hp:5,atk:.9,def:1,mag:1.4,res:1.35,spd:1,sk:[['Soul Frost','ice',1.6,'one','mag',[['slow',.6]]],['Grave Chill','shadow',1.15,'all','mag',[['weaken',.4]]]],
   phase:{at:.5,say:'The Lich hides behind its phylactery ward!',self:[['ward',1]],wardEvery:3},intro:'Frost crawls up the walls in the shape of letters. The Frost Lich turns a page of its book and smiles.'}
};
const FINALS={
 dimmer:{n:'The Dimmer',art:'dimmer',el:['shadow','light'],hp:6.2,atk:1.25,def:1.3,mag:1.35,res:1.4,spd:1.1,sk:[['Hollow Hand','shadow',1.8,'one','phys',[['weaken',.5]]],['Dimming','shadow',1.25,'all','mag',[['blind',.3]]],['Starfall','light',1.3,'all','mag',[['break',.4]]]],
   phase:{at:.5,say:'The Dimmer swallows the light around it!',self:[['might',1],['bulwark',1]],party:[['blind',.5]]},intro:'The Dimmer waits in the black: a tall hollow in the shape of a figure, wearing every light it has swallowed.'},
 nidhra:{n:'Nidhra, Eclipse Dragon',art:'nidhra',el:['shadow','fire'],hp:6.4,atk:1.35,def:1.3,mag:1.3,res:1.25,spd:1.05,sk:[['Black Flame','fire',1.25,'all','mag',[['burn',.5]]],['Umbral Fang','shadow',1.9,'one','phys',[['bleed',.6]]],['Wingbeat','shadow',1.1,'all','phys',[['slow',.3]]]],
   phase:{at:.5,say:'Nidhra devours the eclipse and burns brighter!',self:[['might',1],['haste',1]]},intro:'Wings blot out the dead sky. Nidhra, the dragon who ate the sun, opens one burning eye.'},
 hollowking:{n:'The Hollow King',art:'hollowking',el:['shadow','lightning'],hp:6.2,atk:1.4,def:1.4,mag:1.2,res:1.3,spd:1,sk:[['Regicide','shadow',2.0,'one','phys',[['break',.6]]],['Crown of Storms','lightning',1.25,'all','mag',[['stun',.15]]]],
   phase:{at:.5,say:'The King calls his last loyal knight!',summon:'huskguard'},intro:'An empty throne. An empty crown. An empty king, rising from both, still giving orders to a kingdom that is gone.'},
 seraph:{n:'Seraph of Ash',art:'seraph',el:['light','fire'],hp:6,atk:1.15,def:1.2,mag:1.45,res:1.4,spd:1.15,sk:[['Ashen Halo','fire',1.25,'all','mag',[['burn',.5]]],['Fallen Spear','light',1.9,'one','phys',[['blind',.4]]],['Last Prayer','light',0,'self','buff',[['regen',1]]]],
   phase:{at:.5,say:'The Seraph burns its own wings to rise again!',heal:.2,self:[['might',1]]},intro:'Six wings of cinder unfold. The Seraph of Ash, once the first lamplighter, has decided the world is better dark.'}
};
const GPOOL=Object.keys(GUARDIANS),FPOOL=Object.keys(FINALS);
// v4.8: the 12 lesser bosses are SCOURGES, the 4 world-eaters are CALAMITIES
const bossClass=k=>FINALS[String(k).replace(/^echo_/,'')]?'Calamity':'Scourge';
const BOSS_CLASS_D={Scourge:'A Scourge: one of the twelve beast-lords that seized the beacons.',Calamity:'A Calamity: a world-eater that drinks the Meridian itself.'};
function guardianDef(key){return GUARDIANS[key]||FINALS[key];}
