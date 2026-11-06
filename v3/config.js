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
const TV_SLOTS=4,TV_CAP=Infinity,TV_CD=5;     // 4 tables, no per area recruit cap (v0.5.0), 5 battles between shuffles

// ----- encounters on the road -----
// ENC_RATE: chance per step to meet a random battle, by the Settings choice. CE_*: chance meetings with a wayfarer (chance.js), about 1 in 170 steps after a 30 step gap, 2 per area at most
const ENC_RATE={off:0,low:.05,normal:.095,high:.14};// v0.4.3: about 13% fewer at every setting
const ENC_MIN_STEPS=8;// v0.4.3: at least 8 tiles walked between random battles
// chance meetings with a wayfarer (chance.js): about 1 in 170 steps after a 30 step quiet gap, at most 2 per area
const CE_ODDS=1/170, CE_GAP=30, CE_AREA_CAP=2;

// ----- Beta v0.5.0 phase 2: battle and world logic (p2world.js) -----
// BATTLE_GROUND: every battle backdrop has a solid ground plane from gy (share of the stage height) down; units stand between top and bot,
// flying foes hover hover px above their shadow. Water, lava and sky are only drawn above gy, as scenery.
const BATTLE_GROUND={gy:.5,top:.56,bot:.96,hover:9};
// SURPRISE: touching a roaming dungeon foe that has not seen you gives a free first round: every hero in the vanguard acts free times
// before any foe moves. A "Surprise!" banner shows. Elite roamers keep their no auto rule.
const SURPRISE={free:1};
// DUAL_FROM: the first stage (0 = the first realm) where dual type wayfarers (taverns, challenges, chance meetings) and dual type regular
// monsters appear. Bosses, minibosses, elites, mimics and other special foes may be dual at any stage.
const DUAL_FROM=1;
// TOWN_LANE: every town gate gets a clear approach lane at least this many tiles wide to the main road
const TOWN_LANE=2;
// HINTS: early game hints show only while the journey is in stages below HINTS_UNTIL; delay before one appears (ms)
const HINTS_UNTIL=1,HINT_DELAY=1400;

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
// ===== Beta v0.5.0 phases 4 and 5 (p4xp.js, p4party.js, p5settings.js) =====
// 4.1 personal quests: no level gate any more; PERSONAL_BT battles together and the party in this realm (0 based) or later.
const PERSONAL_REALM=1;
// 4.3 XP catch up: +per for each level a hero is below the party's highest, at most +max. Reserve heroes get bench x that bonus.
// v0.7.1: much bigger for heroes far behind: bonus = per*gap + sq*gap^2, capped at max (gap 2: +38%, 5: +125%, 8: +248%, 10+: +300%)
const XPCU={per:.15,sq:.02,max:3,bench:.5};
// 5.4 transitions, in ms of world screen time: time of day blends over tod, weather over wx (visuals and ambience beds).
const TRANS={tod:11000,wx:6500,ambTod:10,ambWx:6};
// 5.5 save indicator: show "Saving..." this long, then "Saved", hold, then fade. minGap = autosaves closer than this share one message.
// syncDelay: the cloud upload waits this long after the last save (debounced, signed in players with write access only).
const SAVE_UI={saving:350,hold:2000,fade:450,minGap:2500,syncDelay:6000};
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
// v0.6.3 Best Party formations (party3.js). Role balance outweighs raw level and gear:
//   str: weight per hero of sqrt(power / the roster's best power), so a big level or gear lead only counts a little;
//   weak/weakPen: below this share of the best power a hero costs weakPen x the shortfall (they would not hold up; not for Training);
//   role: value of the 1st, 2nd, 3rd hero who fills each role (negative = too many), pr/de: the first Primer and Detonator;
//   dup: cost of each extra hero of a class already in the six; dl: each delivery covered (piercing, blunt, ranged, magic); el: each element;
//   boss: how much more the Boss ready formation values the boss's element and archetype (or the area's, once the boss is down);
//   overlap: cost per hero shared with earlier formations (Fresh mix: Balanced; Rotation: all; Boss ready: none, it says when it matches Balanced);
//   train: a hero this many levels or more below the roster's top level is a trainee; at most max trainees in a Training team.
const BP6={str:.5,weak:.55,weakPen:1.6,role:{tank:[1,.15,-.4],heal:[1,.3,-.3],sup:[.35,-.05,-.2],dmg:[.4,.35,.12,0]},pr:.4,de:.4,dup:.28,dl:.08,el:.05,
  boss:{el:3,arch:2,area:2.5},overlap:{boss:0,mix:.32,rot:.32},train:{gap:3,max:4}};
// 3.9 Pork Chop Sandwiches handed over after the first boss victory, and how many it takes to walk back to town from a dungeon
const PORK={firstBoss:2,toTown:2};

// ===== Beta v0.5.0 Phase 6: graphics quality (gfx6*.js) =====
// Settings > Graphics stores META.cfg.gfx: 'auto' (default), 'low', 'medium' or 'high'. Auto measures the frame rate on the world and
// battle screens and steps a tier down or up (GFX_AUTO), remembering its last pick in META.cfg.gfxAuto. Every feature below is per tier:
// parts: battle particle cap. amb: drifting leaves or dust on the world. birds: birds crossing the sky (fields and towns, by day). critters:
// hopping critters per field. grass: swaying tall grass. water: moving glints on water. bloom: soft glow around lamps, torches, windows and
// spells (2 = also battle particles). vignette: soft dark edges. ao: soft contact shading at the foot of walls and buildings (baked into the
// map, free per frame). shadows: soft shadows under townsfolk on the map. gest: townsfolk idle gestures. parallax: battle and title backdrop
// layers drift apart. camera: battle camera pushes on big hits and Limit Breaks. impact: one dark impact frame on crits, breaks and reactions.
// elfx: richer elemental particles (2 = more of them). dof: menus soften the scene behind them (0 none, 1 dim, 2 blur). shake: largest screen shake in px.
const GFX_Q={
  low:   {parts:140,amb:0, birds:0,critters:0,grass:0,water:1,bloom:0,vignette:1,ao:1,shadows:1,gest:1,parallax:0,camera:1,impact:0,elfx:0,dof:1,shake:1},
  medium:{parts:280,amb:10,birds:3,critters:3,grass:1,water:1,bloom:1,vignette:1,ao:1,shadows:1,gest:1,parallax:1,camera:1,impact:1,elfx:1,dof:1,shake:2},
  high:  {parts:500,amb:22,birds:5,critters:5,grass:1,water:1,bloom:2,vignette:1,ao:1,shadows:1,gest:1,parallax:1,camera:1,impact:1,elfx:2,dof:2,shake:2}};
// Auto: start tier when nothing is remembered, the measuring window, step down below `down` fps, step up at or above `up` fps
// (never back up to a tier that already failed this session). Frames slower than `gap` ms (tab switches, loading) are ignored.
const GFX_AUTO={start:'medium',windowMs:3000,down:45,up:57,gap:250};
// Parallax: how far (logical px) the sky and far layers drift from the ground plane, and the title screen's slow drift period (ms).
const GFX_PARA={px:4,titleMs:24000};
// Camera pushes [zoom, ms]: crits, reactions, shield breaks, Limit Breaks.
const GFX_CAM={crit:[1.035,360],react:[1.05,520],brk:[1.06,600],limit:[1.05,760]};

// ===== Beta v0.5.3: HD sprites (sprhd.js, sprhd2.js) =====
// SPRITE_HD true: heroes, townsfolk and monsters are painted at twice the detail (SPR.k) with five step light ramps, rim light and coloured
// line art, heroes stand SPR.addH logical px taller (longer legs and torso, same head), and the world and battle canvases render at SPR.k
// so that detail shows. Every sprite canvas still reports its logical size (width/height), so nothing that places sprites changes.
// false: the v0.5.2 sprites and canvases, exactly as before.
const SPRITE_HD=true;
const SPR={k:2,addH:6,rimA:.5,outA:.55};
// ===== v0.5.3 HD-2D battle stage (hdstage.js, hdspell.js) =====
// Medium and High draw the battle stage with WebGL1 under the DOM unit layer: a perspective ground plane per backdrop, a blurred far
// backdrop (depth of field), point lights (theme torches, lava, crystals, the moon, spells), bloom, colour grading by time of day and
// weather, soft unit shadows. Low, no WebGL, a lost context or GFX.off keep the old 2D stage exactly. Per tier:
// on: use the GL stage. mode: 'full' draws the units through GL too (lit, graded, bloomed, rim light) every frame; 'under' bakes the lit
// stage once and draws it under the visible 2D unit canvas, redrawing only when shadows, lights or the shake change (much cheaper; sprites
// are tinted in 2D, no parallax, torches and light shafts stand still, floor circles are drawn in the unit layer). res: backing pixels per CSS pixel (capped by the device pixel ratio). maxPx: cap on backing pixels.
// lights: point lights per frame. shadows: soft unit shadows. decals: glowing floor circles (casting circles, boss runes, ripples).
// bloomK: bloom strength (0 = no bloom pass). dof: far backdrop and floor blur (0 = none). rays: light shafts (0 = off). rim: rim light on
// units from the key light. spell: element spell effects (0 none, 1 some, 2 more; also capped by GFX_Q.parts). props: far scenery props.
const HD_BATTLE={
  low:   {on:0},
  medium:{on:1,mode:'under',res:1,maxPx:520000,lights:4,shadows:6, decals:3,bloomK:.55,dof:1,  rays:1,rim:1,spell:1,props:1},
  high:  {on:1,res:2,  maxPx:2300000,lights:8,shadows:12,decals:4,bloomK:.7, dof:1.2,rays:1,rim:1,spell:2,props:1}};
// The floor: persp is the perspective offset as a share of the floor height (smaller = deeper perspective), tile is the world size of
// one floor texture tile in logical px, sq is the depth squash of floor circles and shadows, focus is the sharp band [top, bottom] as a
// share of the floor (units stand there; above it the floor blurs toward the horizon, below it a little toward the bottom edge).
const HD_FLOOR={persp:.32,tile:96,sq:.34,focus:[.12,.9],fog:.55};
// Colour grade per time of day (outdoor battles) and weather: gain (rgb multiplier), lift (rgb added), sat, contrast, amb (light on units,
// rgb), key (key light colour), vig (vignette). Indoor stages (caves, halls, boss stages) use `indoor`.
const HD_LOOK={
  day:  {gain:[1.04,1.02,.98],lift:[0,0,.01],sat:1.1,con:1.08,amb:[1,1,.98],key:[1,.95,.82],vig:.32,sky:[.82,.9,1.08]},
  dusk: {gain:[1.08,.9,.8],lift:[.02,0,.03],sat:1.04,con:1.08,amb:[1,.86,.78],key:[1,.62,.38],vig:.34,sky:[.9,.7,.86]},
  night:{gain:[.74,.8,1],lift:[0,.01,.045],sat:.86,con:1.08,amb:[.86,.9,1.04],key:[.62,.72,1],vig:.42,sky:[.7,.75,1]},
  dawn: {gain:[1.02,.92,.92],lift:[.02,.01,.03],sat:1,con:1.05,amb:[.98,.9,.92],key:[1,.78,.62],vig:.3,sky:[.92,.86,1.02]},
  indoor:{gain:[.92,.9,.92],lift:[.01,0,.02],sat:1.02,con:1.1,amb:[.84,.82,.86],key:[1,.8,.6],vig:.38},
  wx:{rain:{gain:[.82,.86,.94],sat:.82},storm:{gain:[.7,.74,.86],sat:.75},fog:{gain:[.92,.94,.96],sat:.7,fog:.5},snow:{gain:[.98,1,1.06],sat:.88},
      blizzard:{gain:[.9,.95,1.05],sat:.75,fog:.35},sand:{gain:[1.04,.94,.78],sat:.85,fog:.3},heat:{gain:[1.08,.96,.86],sat:1.05},
      ashfall:{gain:[.86,.8,.78],sat:.8,fog:.2},aurora:{gain:[.92,1,1.04],sat:1.1},starfall:{gain:[.9,.9,1.04],sat:1.05}}};
// Camera pushes [zoom, ms] for big element hits (weak or crit) and every Limit Break hit, on top of GFX_CAM (GL stage only).
const HD_CAM={big:[1.04,480],limit:[1.07,900]};
// v0.5.8 units in the battle stage (Medium 'under' and High 'full'): sat and con soften the raw sprite colours before the light and the
// grade, ao is the light left at the feet (a little darker toward the ground), rim the key light rim strength on Medium (High: HD_BATTLE rim).
const HD_SPR={sat:.86,con:.9,ao:.74,rim:.7};
// ===== v0.6.3 world pass (worldfx.js, hd2d.js, map.js) =====
// WFX: ambience particles live in world space (art px), repeated on a lattice of cells about one view in size and wrapped around the
// camera, so they stay where they are when the camera moves (in 2D and HD-2D alike). ref: the view area the per view counts are for.
// hero: no particle is drawn over the hero's box (half width, height above the feet, below the feet; art px). n: counts per ref area.
// bird: one flock crossing per period (ms) at height h. chestGone: opened chests vanish from the map and can be walked over.
const WFX={ref:80000,cell:128,margin:96,maxN:120,hero:[10,30,3],n:{spark:14,snow:46,wind:8,fly:4,spray:5,mote:12,dust:10,lantern:7,firefly:12,dew:12},
  bird:{period:26000,dur:11000,h:64,span:560},chestGone:true,hdZ:[560,180]};
// WMAP: the illustrated world map (map.js). vig: vignette size in cells.
const WMAP={cell:[64,150,38],vig:.78,names:84};// cell: px per area (normal min, max, min on short landscape screens); names: written out from this cell size
// ===== Beta v0.5.3: HD-2D world renderer (hd2d.js, hd2dgl.js) =====
// Medium and High graphics draw the world maps through WebGL as a lit diorama (Low, no WebGL or Settings > HD-2D world off: the 2D view).
// pitch: camera tilt in degrees below the horizon; fov: vertical field of view (maxHfov caps the horizontal one on wide views); zoom: 1 =
// sprites as big as in the 2D view; follow: camera glide time constant (ms); topSlack: how far past the map's top edge the camera may
// look (share of the view); sway: idle camera drift (px, degrees, ms; off under reduced motion). wall: block heights in art pixels
// (dungeon walls, field cliffs, town walls); water/deep: how far water and cloud seas sit below the ground. fogStart/fogEnd: distance
// fog, in camera distances. xray: radius (art px) around the hero where props and walls in front of him thin out; actMin: the least
// light characters get (dark places stay readable); heroLight: radius of the hero's lantern; shaft: light shaft strength.
// dof: tilt shift (shift of the sharp band from the hero, band half height, ramp, strength; all shares of the view height).
// bloom: threshold and strength (Medium, High). tiers: px = internal pixels per art pixel (1 = the 2D view's own grid), blur = size
// divisor of the blurred copy, lmap = light map size (every light in view is drawn into it each frame), bloom 1 = from the blurred copy,
// 2 = its own wider pass, dof 1 or 2 blur rounds, shafts on or off, every = remake the blurred copy every n frames.
// lmMax: most lights per frame; lightK: light strength; chunk: static geometry chunk size in tiles (culling).
// look: lighting and grade per time of day and place; weather: how each weather scales ambient and sun and tints the fog.
const HD2D={pitch:40,fov:28,maxHfov:40,zoom:1,follow:85,topSlack:.2,sway:{amp:.7,pitch:.25,ms:11000},
  wall:{dungeon:22,cliff:12,town:14},water:-3,deep:-14,fogStart:1.15,fogEnd:2.7,xray:{out:26,dun:40},actMin:{out:.62,dun:.58},heroLight:120,shaft:.09,
  dof:{shift:.06,band:.24,ramp:.5,max:.7},bloom:{thr:.86,med:.5,high:.55},
  tiers:{medium:{px:1,blur:2,lmap:128,bloom:1,dof:1,shafts:1,every:2},high:{px:1,blur:2,lmap:192,bloom:2,dof:1,shafts:1}},lmMax:96,lightK:.8,chunk:8,
  suns:{day:[-.55,.78,.3],dusk:[-.9,.36,.25],dawn:[.9,.36,.25]},
  look:{
    day:  {amb:[.66,.66,.7],sun:[.5,.47,.4],sd:[-.55,.78,.3],sh:[.55,0,0],fog:[.74,.84,.98],fogA:.32,exp:1,con:1.07,sat:1.14,vig:.32,lift:[0,0,.02],gain:[1.03,1,.96],emis:0,lamp:0,shaft:1,shC:[1,.93,.72],pl:0},
    dusk: {amb:[.52,.4,.46],sun:[.72,.4,.2],sd:[-.9,.36,.25],sh:[0,.62,0],fog:[.86,.52,.42],fogA:.42,exp:1,con:1.06,sat:1.08,vig:.4,lift:[.02,0,.03],gain:[1.08,.95,.86],emis:.75,lamp:.8,shaft:1.3,shC:[1,.62,.35],pl:.25},
    night:{amb:[.28,.33,.54],sun:[.1,.14,.25],sd:[.3,.85,.4],sh:[.28,0,0],fog:[.07,.09,.2],fogA:.55,exp:1.06,con:1.05,sat:.86,vig:.5,lift:[0,.01,.04],gain:[.94,.97,1.08],emis:1,lamp:1,shaft:0,shC:[.6,.7,1],pl:.6},
    dawn: {amb:[.5,.47,.58],sun:[.62,.48,.38],sd:[.9,.36,.25],sh:[0,0,.58],fog:[.82,.76,.88],fogA:.45,exp:1,con:1.03,sat:1,vig:.36,lift:[.02,.01,.03],gain:[1.04,.98,1],emis:.45,lamp:.5,shaft:1.2,shC:[1,.8,.62],pl:.2},
    dungeon:{amb:[.3,.27,.34],sun:[0,0,0],sd:[0,1,.3],sh:[0,0,0],fog:[.03,.02,.04],fogA:.72,exp:1.1,con:1.08,sat:1.06,vig:.56,lift:[0,0,.015],gain:[1.04,1,.98],emis:1,lamp:1,shaft:0,pl:1,bloom:.2},
    cave: {amb:[.28,.25,.32],sun:[0,0,0],sd:[0,1,.3],sh:[0,0,0],fog:[.03,.025,.04],fogA:.72,exp:1.1,con:1.08,sat:1.08,vig:.58,lift:[0,0,.015],gain:[1.05,1,.97],emis:1,lamp:1,shaft:0,pl:1,bloom:.2},
    hall: {amb:[.42,.36,.56],sun:[0,0,0],sd:[0,1,.3],sh:[0,0,0],fog:[.06,.04,.1],fogA:.6,exp:1.05,con:1.05,sat:1.08,vig:.45,lift:[.01,0,.03],gain:[1.02,1,1.04],emis:1,lamp:1,shaft:0,pl:.5,bloom:.25},
    darkRealm:{amb:[.86,.76,.72],sun:.5}},
  weather:{clear:{amb:1,sun:1},rain:{amb:.84,sun:.35,fog:[.5,.58,.68],fogA:.14,sat:.86,shaft:0},storm:{amb:.7,sun:.15,fog:[.3,.33,.45],fogA:.35,sat:.8,shaft:0},
    snow:{amb:1.04,sun:.6,fog:[.88,.93,1],fogA:.25,sat:.9,shaft:.4},blizzard:{amb:1,sun:.3,fog:[.92,.95,1],fogA:.55,sat:.8,shaft:0},fog:{amb:.95,sun:.45,fog:[.8,.83,.88],fogA:.55,sat:.85,shaft:.2},
    gale:{amb:1,sun:.9,shaft:.6},sand:{amb:.95,sun:.7,fog:[.86,.72,.5],fogA:.4,sat:.95,shaft:.5},heat:{amb:1.04,sun:1.15,fog:[1,.82,.62],fogA:.15,warm:1},
    ashfall:{amb:.8,sun:.45,fog:[.45,.38,.36],fogA:.35,sat:.8,shaft:.3},aurora:{amb:.95,sun:.8,fog:[.3,.6,.55],fogA:.12},starfall:{amb:.95,sun:.9,fog:[.3,.3,.5],fogA:.1},
    bloodmoon:{amb:.8,sun:.5,fog:[.5,.1,.12],fogA:.3,warm:1,shaft:0},eclipse:{amb:.6,sun:.1,fog:[.1,.1,.2],fogA:.3,shaft:0},meteor:{amb:.9,sun:.8}}};
// v0.5.8 sprites in the scene (world): sc = billboard scale (1 = the 2D view's size; 2/3 puts a hero at about 1.5 tiles, one pixel per 3x3 texels of the HD bitmap), drawn from a
// copy shrunk on the CPU to the GL pixel grid (crisp, one texel per pixel); sat and con soften the raw sprite colours before the grade;
// spread: how far to each side the light map is read (px), so a lamp on one side lights that side; rim: key light rim strength;
// act: the least light a character gets (outdoors at night, in dungeons), added in the ambient's colour; shadow: contact shadow
// [width as a share of the sprite, depth as a share of the width, core darkness, soft darkness, offset away from the key light px].
HD2D.spr={sc:2/3,sat:.86,con:.9,spread:9,rim:.75,act:{out:.3,dun:.34},shadow:[.8,.55,.36,.3,1.6]};
// ===== Beta v0.6.3: Make camp (v063prog.js) =====
// price: Camp Supplies (Alchemy, from stage fromStage, 0 based: 2 = the third realm, about level 15). heal: share of max HP and MP
// standing heroes get back (an inn gives everything, a Tent 60%). cool: battles between camps. dur: battles a boon lasts.
// atk / def: boon stat bonus. first: first turn delay multiplier for Early rise. drop: extra drop chance for Forager's luck.
const CAMP={price:40,fromStage:2,heal:.25,cool:2,dur:3,atk:.1,def:.1,first:.35,drop:.25};
// v0.6.3 TWISTS (twists.js): small rule changes for repeat content.
// daily: one twist per ISO week of the trial's date (the same for all seven days, never random), picked as (isoYear*53+isoWeek) mod the pool
// size, so two weeks in a row never share one. Each twist only works inside the Daily Trial. c is the short battle chip, d the one line.
// ng: New Game+ modifiers, up to max picked on the starter screen (off by default), stored in G.ngMods. xp/gold multiply battle rewards.
const TWISTS={on:true,
  daily:[
    {id:'fire2',n:'Fire reactions deal double',c:'Fire x2',d:'Any reaction with Fire in it, primed or detonated, hits twice as hard.',m:2},
    {id:'heal',n:'Healing halved',c:'Heals ½',d:'Heal skills and potions restore half as much.',m:.5},
    {id:'shield',n:'Shields start one pip higher',c:'Shield +1',d:'The Daily Terror and the Echo start with one more shield pip.',add:1},
    {id:'weak',n:'Weak spots hurt more',c:'Weakness +25%',d:'Super effective hits deal 25% more, for you and for them.',m:1.25},
    {id:'linger',n:'Status effects last a turn longer',c:'Effects +1',d:'Every status lasts one more turn, good or bad.',add:1},
    {id:'primed',n:'Every foe is primed at start',c:'All primed',d:'Each foe enters primed, so your detonators can strike at once.',t:3},
    {id:'crit',n:'Sharp eyes',c:'Crits +10%',d:'Everyone lands critical hits 10% more often.',add:.1},
    {id:'ward',n:'Warded entry',c:'Ward start',d:'Your vanguard start every wave with Ward, which blocks one hit.'},
    {id:'limit',n:'Limits half charged',c:'Limit 50%',d:'Your heroes start the trial with Limit gauges half full.',v:50},
    {id:'glass',n:'Glass foes',c:'Glass foes',d:'Foes have 20% less HP but hit 20% harder.',hp:.8,pow:1.2}],
  ng:{max:2,mods:[
    {id:'brutal',n:'Foes hit harder',risk:'Foes deal 30% more damage.',gain:'+30% XP and gold.',pow:1.3,xp:1.3,gold:1.3},
    {id:'coldinn',n:'Cold inns',risk:'Inns heal only half of what you are missing.',gain:'+50% gold.',heal:.5,gold:1.5},
    {id:'elites',n:'Elites everywhere',risk:'Every wild fight has one shielded elite with 50% more HP.',gain:'+25% XP and gold.',pips:2,hp:1.5,xp:1.25,gold:1.25},
    {id:'react',n:'Reactions only',risk:'Only reactions crack shields; weak hits and skills no longer chip them.',gain:'Reactions hit 30% harder, +15% XP.',m:1.3,xp:1.15},
    {id:'iron',n:'Ironman',risk:'Fallen heroes stay down until you rest at an inn. No feathers, salts, tents or revive spells.',gain:'+40% XP.',xp:1.4}]}};
// ===== v0.6.3 battle screen (battle3.js, battle3.css) =====
// B3: the stage label layout, in logical stage px (the stage is drawn at BL.sc CSS px per px). body: margin kept around each sprite's
// visible pixels; pad: gap between labels; R: how far a label may move from its spot (step: search grid); barW: HP bar widths;
// prim: primed badge size; sti/stiH: one status icon; tagF: font of the target tag, tagN: longest name on it, tagR: how far it looks first
// (it stays close to its unit, shorter without the name if it must); fxRise: how far an effect text drifts up; minSc: the smallest
// scale of the wide stage (it shrinks toward it so the commands fit under it); sideCol: width kept for the command column on landscape phones;
// memo: ms the canvas reuses the last layout before checking whether anything changed.
// slots: where units stand, [x share of the stage, depth 0..1 on the ground band (BATTLE_GROUND top..bot)], for the tall (portrait)
// and the wide stage; e[n-1] for n foes, boss[n-1] for boss fights, p for the three heroes on the field.
const B3={body:1,pad:1,R:40,step:2,barW:{hero:24,foe:30},prim:13,sti:12,stiH:10,tagF:5,tagN:13,tagR:28,fxRise:3,minSc:1.5,sideCol:360,memo:40,
  slots:{
    tall:{p:[[.72,0],[.89,.42],[.71,.84]],
      e:[[[.27,.5]],[[.22,.05],[.36,.8]],[[.33,0],[.12,.42],[.4,.84]],[[.34,0],[.1,.28],[.47,.5],[.2,.84]],[[.34,0],[.1,.22],[.52,.36],[.3,.6],[.09,.84]]],
      boss:[[[.27,.62]],[[.24,.75],[.48,.05]],[[.22,.7],[.47,0],[.5,.84]]]},
    wide:{p:[[.74,0],[.88,.42],[.71,.84]],
      e:[[[.27,.5]],[[.2,.08],[.36,.8]],[[.3,0],[.12,.42],[.4,.84]],[[.31,0],[.1,.28],[.46,.5],[.22,.84]],[[.3,0],[.09,.22],[.5,.36],[.28,.6],[.08,.84]]],
      boss:[[[.25,.62]],[[.22,.75],[.44,.05]],[[.2,.7],[.42,0],[.46,.84]]]}}};
