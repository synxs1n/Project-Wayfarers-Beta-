// =================== CONFIG: every tunable number in one place (Beta v0.4.0, Phase 11) ===================
// This file loads FIRST. Changing a value here changes the game; nothing else in the code needs to be touched.
// Rarity colours live with their tables (ITEM_TIERS in data.js, tier colours in tiers.js); heroes, skills, monsters, items, natures, the type chart,
// weapon and armor rules, zone themes, factions, encounters and weather each have their own table, listed in the developer guide in the design notes.

// ----- leveling and difficulty -----
// Beta v0.3.2: leveling is about 15% slower (XP_SLOW); the level 50 cap and the above-40 scaling are unchanged
const XP_SLOW=1.15;
const need=lv=>Math.round(11*XP_SLOW*Math.pow(lv,1.55)); // XP to go from level lv to lv+1
const DIFF={story:{hp:.8,pow:.8,rew:1},normal:{hp:1,pow:1,rew:1},hard:{hp:1.18,pow:1.18,rew:1.25}};

// ----- battle drops: chance per beaten foe, multiplied by the party's luck bonus -----
const DROP={realm:.38,part:.55,potion:.15,ether:.07,remedy:.07,hipotion:.05};

// ----- limit breaks and bonds -----
const LIMIT_I=.7;        // Limit Break skills are this much stronger than the normal version
const BOND_LV=[4,10,20]; // fights side by side needed for bond levels 1, 2 and 3

// ----- prices -----
const MAT_PRICE={copper:18,iron:45,mythril:110,oak:14,ash:40,elder:95,healroot:10,bluecap:22,sunpetal:48,starbloom:120};

// ----- taverns and the Guild Hall board -----
const TAV_BATTLES=[0,12,32,55,80];
const CHALL_POST=3;// how many open challenges a board shows at once (accepted ones always stay posted on top)
const TV_SLOTS=4,TV_CAP=3,TV_CD=5;     // 4 tables, 3 tavern recruits per area, 5 battles between shuffles

// ----- encounters on the road -----
// ENC_RATE: chance per step to meet a random battle, by the Settings choice. CE_*: chance meetings with a wayfarer (chance.js), about 1 in 170 steps after a 30 step gap, 2 per area at most
const ENC_RATE={off:0,low:.05,normal:.095,high:.14};// v0.4.3: about 13% fewer at every setting
const ENC_MIN_STEPS=8;// v0.4.3: at least 8 tiles walked between random battles
// chance meetings with a wayfarer (chance.js): about 1 in 170 steps after a 30 step quiet gap, at most 2 per area
const CE_ODDS=1/170, CE_GAP=30, CE_AREA_CAP=2;

// ----- day and night -----
const CLK_LEN=900,CLK_PH=[['day',0,495],['dusk',495,585],['night',585,810],['dawn',810,900]]; // v0.4.0 3.7: every phase is 50% longer than in v0.3.x (was 600 steps around)
const NIGHT_POW=1.1;

// ----- weather: how many steps a weather lasts, and the odds out of 100 per realm -----
const WX_MIN=300,WX_MAX=520;
// everyday weather, shares out of 100
const WX_TABLE={meadow:[['clear',72],['rain',14],['fog',9],['storm',5]],coast:[['clear',70],['rain',12],['fog',8],['sand',6],['storm',4]],
  cave:[['clear',72],['heat',13],['fog',8],['ashfall',7]],snow:[['clear',65],['snow',23],['blizzard',6],['aurora',4],['fog',2]],
  heights:[['clear',65],['storm',15],['gale',14],['fog',4],['blizzard',2]],void:[['clear',66],['starfall',16],['fog',8],['aurora',6],['ashfall',4]]};
// rare skies (Blood Moon, Eclipse, Meteor Shower, Elemental Surge): shares out of 100, taken out of the clear share. Day or night limits are set by "when" on each sky in world3.js
const SUPER_TABLE={meadow:[['surge_earth',2],['bloodmoon',2],['eclipse',1]],coast:[['surge_water',2],['meteor',1.5],['bloodmoon',1.5]],cave:[['surge_fire',2],['bloodmoon',2],['meteor',1]],
  snow:[['surge_ice',2],['eclipse',1.5],['meteor',1.5]],heights:[['surge_wind',2],['eclipse',1.5],['meteor',1.5]],void:[['surge_shadow',2],['eclipse',1],['bloodmoon',1.5],['meteor',1.5]]};

// ----- factions: standing needed for ranks 1 to 6 -----
const REP_AT=[0,40,110,230,400,640];

// Beta v0.4.1 1.7: where the dungeon lever may sit. minFrac: the lever is at least route/minFrac steps from the stairs (3 = outside the first third),
// plus minExtra steps; minHops: rooms walked through before the lever room (1 = never in the first two rooms).
const DUN_LEVER={minFrac:3,minExtra:4,minHops:1};
// Beta v0.4.1 1.8: at most this share of a journey's forward gate exits (town and field ends) may face east.
const GATE_EAST_MAX=.4;
// Beta v0.4.1 2.5: the auto battle brain. healAt: heal an ally below this percent of max HP. skillChance: how often a turn uses a plain damage skill
// instead of a basic attack. power: damage multiplier for everything auto does outside the Trial. spread: how often a single target attack picks a random foe instead of the first in line. dailySmart: keep the careful old brain inside the Daily Trial (the Trial must stay identical).
const AUTO_NERF={healAt:40,skillChance:1,spread:0,power:.85,aware:.6,potion:0,smart:.6,limit:.5,det:.5,dailySmart:true};
// Beta v0.4.1 2.2: persistent ailments. A hero that finishes a fight Poisoned, Cursed or Wounded keeps it until cured.
// poisonSteps / poisonPct: out of battle a Poisoned hero loses poisonPct of max HP every poisonSteps steps (never below 1 HP).
// curseHeal: share of healing a Cursed hero receives. woundMhp: share of max HP a Wounded hero keeps.
// bossWound: chance a Scourge or Calamity's heaviest single hit leaves a Wound. foeCurse: chance for undead and shadow foes' skills to Curse.
const AIL={poisonSteps:5,poisonPct:.01,curseHeal:.6,woundMhp:.8,bossWound:.3,foeCurse:.18};

// ===== Beta v0.4.1 3.5 economy (all editable here) =====
// gold/xp: multipliers on what the player earns (the Daily Trial is exempt). gear/items/forge: price multipliers. recruit: tavern hire price.
const ECON={gold:.9,xp:.85,gear:1.6,items:1.6,recruit:3,rareRecruit:2.6,inn:{base:30,per:25}};// v0.4.3: gold easier, prices lower (was gold .75, gear and items x2, recruits x3.5)
const econG=n=>(typeof G!=='undefined'&&G&&G.daily)?n:Math.round(n*ECON.gold);
// 6.6 personal quests: a hero must also have fought this many battles beside you in this journey (per hero, saved as bt)
const PERSONAL_BT=40;
// ===== Beta v0.4.1 Phase 3 balance knobs (one place, editable) =====
// 3.2 boss level = max(base, base + frac*(party highest - base)), never more than cap above base
const BOSS_LV={frac:.5,cap:12};
// 3.2 bosses: shield pips +50% (5 to 8, 7 to 11); the break window hits for less and is over once the foe loses the turn it staggers
const BOSS_PIPS={mult:1.5};const BREAK_WIN={bonus:1.3,short:true};
// 3.2 extra boss muscle on top of the old stat table (hp and power multipliers)
const BOSS_BUFF={hp:[1.3,1.75,1.8,2.0,1.52],pow:[1.15,1.4,1.44,1.6,1.28]}// v0.4.3: re-tuned with capes;
// 3.4 small parties: each hero short of six makes Scourges and Calamities this much beefier (a full party of six is the benchmark)
const BOSS_SIZE={hp:.07,pow:.06};// per stage 1 to 5
// 3.3 echo levels. Story echo base = boss base + storyAdd; Sanctum echoes use fixed bases. While the party's highest hero is more than
// window below the base the echo stays at base; once within window of it (or higher) the echo is exactly party highest + window. No cap.
const ECHO_LV={window:2,storyAdd:2,sanctum:50,sanctumFinal:56};

// 3.1 regular encounters: field foes hit a little harder with more HP, and packs work together (never in the Daily Trial)
const FIELD_FOE={hp:[.9,.9,1,1.05,1.08],pow:[.85,.86,.97,1,1.02]};// per stage 1 to 5
const PACK={focus:.6,frenzy:.05,maxFrenzy:.15,fromStage:2};// v0.4.3: no pack tactics in the first realm

// 3.7 world strength creep: every base boss defeated makes all foes this much stronger (hp and power), stacking. Not in the Daily Trial.
const CREEP={per:.05,field:.5};

// 5.5 early game with a short party: regular foes in the first two stages are eased for parties of 1 or 2 (index = heroes - 1)
const SMALL_PARTY={stages:2,hp:[.55,.85],pow:[.6,.88]};

// ===== Beta v0.5.0 Phase 3: shops, gear and items (p3shop.js) =====
// 3.8 how many of one item the pack holds (was 9). The Daily Trial keeps its old cap so its runs stay exactly as before.
const ITEM_MAX=50,ITEM_MAX_DAILY=9;
const invCap=()=>(typeof G!=='undefined'&&G&&G.daily)?ITEM_MAX_DAILY:ITEM_MAX;
// 3.1 "Best for party" ordering: two upgrades for the same hero and slot count as close when their gains differ by at most
// closeAbs (absolute share of the hero's gear score) or closeRel (relative), and then get a short tradeoff line.
const SHOP_BEST={closeAbs:.02,closeRel:.2,minPct:.005};
// 3.3 Smithy plan: the smallest gain worth buying or crafting for (share of the hero's gear score)
const SMITH_PLAN={minPct:.01};
// 3.4 Best Party: extra weight for answering what the area and its boss are known to be (archetypes, elements) and for delivery spread
const BP_AWARE={arch:.18,el:.12,boss:1.5,dl:.04};
// 3.6 boss readiness: how far below the boss the party average may be, and the potions and revives worth carrying
const READY={lvGap:2,potions:4,revives:2};
// 3.9 Pork Chop Sandwiches handed over after the first boss victory, and how many it takes to walk back to town from a dungeon
const PORK={firstBoss:2,toTown:2};
