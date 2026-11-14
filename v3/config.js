// ===== config.js (v0.4.0): every tunable number, in nine numbered sections (contents below) =====
// This file loads FIRST. Changing a value here changes the game; nothing else in the code needs to be touched.
// Rarity colours live with their tables (ITEM_TIERS in data.js, tier colours in tiers.js); heroes, skills, monsters, items, natures, the type chart,
// weapon and armor rules, zone themes, factions, encounters and weather each have their own table, listed in the developer guide in the design notes.

// Contents (search for "// ==== N." to jump):
//   1. Progression: XP, levels, difficulty, Limit Breaks, bonds
//   2. Battle rules: drops, auto battle, ailments, reactions, archetypes, companions, Momentum and foe roles (B4)
//   3. Foes and bosses: boss levels and muscle, field packs, creep, echoes, roamers, side sites, mimics, surprise starts
//   4. Economy and shops: prices, gold and XP rates, pack size, Smithy, tempering, Echoforged, capes
//   5. Party and roster: taverns, the journey roster, personal quests, Best Party, loadouts, Make camp
//   6. World: encounters, chance meetings, travel items, day and night, weather tables, factions, map generation
//   7. Interface timings: transitions, the save indicator, hints, battle information (B5)
//   8. Graphics: quality tiers, HD sprites, HD-2D battle stage and world, world effects, weather layers, battle screen layout (B3)
//   9. Twists: the Daily Trial weekly twist and New Game+ modifiers
// Tunables that used to sit in their modules are at the end of their section (the module keeps a one line pointer).

// ==== 1. Progression: XP, levels, difficulty, Limit Breaks, bonds ====
// leveling and difficulty
// Beta v0.3.2: leveling is about 15% slower (XP_SLOW); the level 50 cap and the above-40 scaling are unchanged
const XP_SLOW=1.15;
const need=lv=>Math.round(11*XP_SLOW*Math.pow(lv,1.55)); // XP to go from level lv to lv+1
const DIFF={story:{hp:.8,pow:.8,rew:1},normal:{hp:1,pow:1,rew:1},hard:{hp:1.18,pow:1.18,rew:1.25}};
// limit breaks and bonds
const LIMIT_I=.7;        // Limit Break skills are this much stronger than the normal version
const BOND_LV=[4,10,20]; // fights side by side needed for bond levels 1, 2 and 3
// 4.3 XP catch up: +per for each level a hero is below the party's highest, at most +max. Reserve heroes get bench x that bonus.
// v0.7.1: much bigger for heroes far behind: bonus = per*gap + sq*gap^2, capped at max (gap 2: +38%, 5: +125%, 8: +248%, 10+: +300%)
const XPCU={per:.15,sq:.02,max:3,bench:1};
// v0.7.2: the Rearguard earns the same battle XP as the Vanguard (was 0.6), so the six stay about the same level
const XP_REAR=1;
// LV_CAP: hard level cap (v0.3.0; heroes already above it in old saves keep their level). LIMIT_LV / LIMIT2_LV: Limit I and
// Limit II open at these levels (level is the only gate since v0.3.0).
const LV_CAP=50;
const LIMIT_LV=15;
const LIMIT2_LV=30;
// STARTER_LV: the level a starter hero begins at (and the starter sheets show).
const STARTER_LV=3;

// ==== 2. Battle rules: drops, auto battle, ailments, reactions, archetypes, companions, Momentum and foe roles (B4) ====
// battle drops: chance per beaten foe, multiplied by the party's luck bonus
const DROP={realm:.38,part:.55,potion:.15,ether:.07,remedy:.07,hipotion:.05};
// DROP_MIX: weights inside the remedy-slot drop roll (engine.js win): remedy keeps its DROP.remedy rate, the others are extra on top, picked from the same roll
const DROP_MIX={remedy:1,bandage:.22,ash:.16,tent:.05};
// Beta v0.4.1 2.5: the auto battle brain. healAt: heal an ally below this percent of max HP. skillChance: how often a turn uses a plain damage skill
// instead of a basic attack. power: damage multiplier for everything auto does outside the Trial. spread: how often a single target attack picks a random foe instead of the first in line. dailySmart: keep the careful old brain inside the Daily Trial (the Trial must stay identical).
const AUTO_NERF={healAt:40,skillChance:1,spread:0,power:.85,aware:.6,potion:0,smart:.6,limit:.5,det:.5,dailySmart:true};
// Beta v0.4.1 2.2: persistent ailments. A hero that finishes a fight Poisoned, Cursed or Wounded keeps it until cured.
// poisonSteps / poisonPct: out of battle a Poisoned hero loses poisonPct of max HP every poisonSteps steps (never below 1 HP).
// curseHeal: share of healing a Cursed hero receives. woundMhp: share of max HP a Wounded hero keeps.
// bossWound: chance a Scourge or Calamity's heaviest single hit leaves a Wound. foeCurse: chance for undead and shadow foes' skills to Curse.
const AIL={poisonSteps:5,poisonPct:.01,curseHeal:.6,woundMhp:.8,bossWound:.3,foeCurse:.18};
// Beta v0.7.0 battle mechanics (battle4.js, battle4.css)
// det: a hero who detonates a reaction gets mpPct of max MP back (at least mpMin), shown in the reaction text ("+N MP"); at most
//   maxPerAct refunds per action (an all-foes detonator can set off several reactions).
// swap: a free swap (another Vanguard hero trades places with a Rearguard hero while the acting hero keeps its turn) once every cd
//   party turns. Rooted heroes cannot step back. autoWhy: the auto switch rules (autoSwitchPick) auto battle may use it for. The acting hero stepping back itself is the old Switch (its turn goes to the newcomer).
// mo: the party's Momentum gauge, 0..max. Each hero action has a kind (attack; a skill's element and delivery; guard; heal; item;
//   support; scan; limit). The same kind as the party's last action adds rep; a different kind moves it toward the middle of the
//   zone by vary; Guard above the middle cools it by guard. In the zone [lo,hi] heroes deal dmg more and take taken less. Reaching
//   max overheats it: heroes deal pen less and take pen more until it falls back to hi. Every battle starts at start.
// roles: foe roles (Scan and the Bestiary name them). roleOf: MON key -> role; realm, night and overlay variants inherit their base's.
//   guard (Shieldbearer): pips shield pips; while they hold, its allies take cover less damage. hex (Hexer): every other turn it
//   stacks Hex on a hero (hexDmg less damage per stack); a Hex on a hero already at hexMax bursts for doom of max HP.
//   charge (Charger): every chargeEvery turns it winds up, next turn it hits that hero's slot for chargePw (Guard halves it).
//   leech (Leech): every leechEvery turns it drains each Vanguard hero not guarding (leechPw) and heals leechHeal of its max HP per hero.
//   flank (Skirmisher): once the same three heroes have stood in the Vanguard for flankAt party actions, it hits the weakest for flankPw.
//   boss: every Scourge and Calamity gathers power on every every-th turn (its turn is spent) and next turn strikes the whole
//   Vanguard for pw (its usual all-foes skills are about 1.1 to 1.25). Guard halves it for each hero who guards.
// daily: which systems run in the Daily Trial (all of them are deterministic: no clock, only the battle's seeded RNG).
const B4={det:{on:true,mpPct:.1,mpMin:4,maxPerAct:2},
  swap:{on:true,cd:3,autoWhy:['hurt','debuffed','healer']},
  // v0.9.4 (the owner's simpler rule): a different kind of action than the last fills it (vary); the same kind again drains it (rep), and
  // so does attacking after offN offensive actions in a row (off). Full (max): Surge, heroes deal dmg more and take taken less until it
  // falls below fullOff. Empty (0): Drained, heroes deal pen less and take pen more until it climbs above emptyOff.
  mo:{on:true,start:30,max:100,vary:16,rep:15,offN:3,off:10,fullOff:80,emptyOff:20,dmg:.15,taken:.1,pen:.1},
  roles:{on:true,cover:.4,pips:2,hexDmg:.08,hexMax:3,doom:.3,chargeEvery:3,chargePw:2.6,leechEvery:2,leechPw:.6,leechHeal:.07,flankAt:6,flankPw:1.9,
    boss:{on:true,every:4,pw:3}},
  roleOf:{shellguard:'guard',iceknight:'guard',huskguard:'guard',
    ashwraith:'hex',eclipsewraith:'hex',rimewight:'hex',galephantom:'hex',
    barrowbones:'charge',yeti:'charge',slaggolem:'charge',gargoyle:'charge',drownedsailor:'charge',
    brinejelly:'leech',voidspawn:'leech',cavebat:'leech',
    frostwolf:'flank',thunderhawk:'flank',stareater:'flank',gull:'flank'},
  daily:{det:true,swap:true,mo:true,roles:true}};
// CLS_ATK (v0.10.5, atk6.js): the basic Attack by class. pw: damage multiplier on ATTACK's pw 1; k:'mag' swings with magic (MAG vs RES).
// Mages, healers and bards swing with magic; archers hit hardest as ranged; the front line trades a little less for staying power.
const CLS_ATK={warrior:{pw:1.15},knight:{pw:1.05},monk:{pw:1.15,hits:1},thief:{pw:1.1},archer:{pw:1.2},mage:{k:'mag',pw:1.1},healer:{k:'mag',pw:.95},bard:{k:'mag',pw:1}};
// DET_BONUS: detonations take two deliberate steps, so they hit harder than the old free reactions did.
const DET_BONUS=1.3;
// AUTO_SWAP_CD: auto battle brings in a reserve hero at most once every this many party turns, and a hero who just came in stays
// at least this many turns (v0.3.1).
const AUTO_SWAP_CD=3;
// AUTO_REW: a win where auto ran more than half of the heroes' turns pays this share of XP and gold (prog2.js; drops unchanged;
// not the Daily Trial). v0.4.3: was .75, then .6.
const AUTO_REW=.66;// v0.4.3: was .75, then .6
// QUIRK_RES: damage share a foe quirk resistance lets through (insight.js). PERK_*: bestiary mastery perks per tier: kills needed
// (bosses: PERK_KILLS_BOSS), extra damage and extra drop chance against that monster.
const QUIRK_RES=.4;
const PERK_KILLS=[10,25,50],PERK_KILLS_BOSS=[2,4,6],PERK_DMG=[.03,.05,.08],PERK_DROP=[0,.05,.1];
// archetypes (archetype.js)
const UNDEAD_LIGHT=1.35;//  extra Light damage taken by Undead (on top of the type chart; the better of the two applies)
const HEAL_HURT=.75;//  share of a heal's amount that an Undead foe takes as holy damage
const HEAL_HURT_AOE=.6;//  same, for heals that cover the whole party
const HEAL_HURT_PW_CAP=2.2;//  heals above this power do not hurt any more (Full Mend and Miracle stay fair)
const ARCH_BOSS_CLAMP=[.75,1.3]; // Scourges and Calamities never swing further than this, so no one hero is mandatory
const ARCH_FOE_CLAMP=[.4,1.8];
// companions (comp.js): a summoned companion stays COMP_TURNS of its own turns; COMP_BONUS: the paired hero's stat bonus
// (base, with Beastbond, for a tamed Scourge).
const COMP_TURNS=3,COMP_BONUS={base:.04,bb:.06,scourge:.08};
// TAME (v0.9.5, comp3.js): companions grow with the battles they win beside their hero (o.bt, an optional save field). At skillAt battles
// they learn a second skill (sk, by family: name, power, target, kind, effects; the element is the companion's own); at evoAt they evolve:
// a new name (pre + the monster's name), +evoBonus on the paired hero's stat bonus and a recoloured sprite (the monster's palette pulled
// toward col by k, the same repaint the realm variants use; no new art).
const TAME={skillAt:12,evoAt:30,evoBonus:.03,k:.45,
  pre:{beast:'Alpha',flyer:'Sky',spirit:'Elder',shell:'Iron',ooze:'Grand',scourge:'Dread'},
  col:{beast:'#e0a040',flyer:'#7ac8ff',spirit:'#c8a0ff',shell:'#b0b8c8',ooze:'#6ad07a',scourge:'#ff5a4a'},
  sk:{beast:['Feral Rush',1.35,'one','phys',[['bleed',.3]]],flyer:['Gale Sweep',1.0,'all','mag',[['slow',.25]]],spirit:['Spirit Flare',1.25,'one','mag',[['weaken',.3]]],
    shell:['Shell Bash',1.4,'one','phys',[['stun',.15]]],ooze:['Engulf',1.05,'all','mag',[['poison',.3]]],scourge:['Dread Roar',1.15,'all','mag',[['weaken',.3]]]}};

// CHAIN (v0.10.4, chain5.js): a Chain skill starts on one foe and may leap to another live foe, one at a time (leap: chance per
// leap, rolled again each time; max: foes hit at most). Single hits hardest, Chain a little less (its pw), All least.
const CHAIN={leap:.55,max:4};
// G5 (v0.10.4, chain5.js): the Guard cue and reward. Foes plan their target with their move (the telegraph shows it); the Guard button
// glows when the acting hero is the planned target of a hit worth heavy of their HP or more (or of two foes). A hero who guards a
// hit aimed at them acts again sooner: their next turn costs quick of the usual delay.
const G5={heavy:.3,quick:.7,lb:12};// lb (v0.11.8): Limit gauge a hero gains for a hit taken while guarding
// ==== 3. Foes and bosses: boss levels and muscle, field packs, creep, echoes, roamers, side sites, mimics, surprise starts ====
// SURPRISE: touching a roaming dungeon foe that has not seen you gives a free first round: every hero in the vanguard acts free times
// before any foe moves. A "Surprise!" banner shows. Elite roamers keep their no auto rule.
const SURPRISE={free:1};
// DUAL_FROM: the first stage (0 = the first realm) where dual type wayfarers (taverns, challenges, chance meetings) and dual type regular
// monsters appear. Bosses, minibosses, elites, mimics and other special foes may be dual at any stage.
const DUAL_FROM=1;
// Beta v0.4.1 Phase 3 balance knobs (one place, editable)
// 3.2 boss level = max(base, base + frac*(party highest - base)), never more than cap above base
const BOSS_LV={frac:.5,cap:12};
// 3.2 bosses: shield pips +50% (5 to 8, 7 to 11); the break window hits for less and is over once the foe loses the turn it staggers
const BOSS_PIPS={mult:1.5};const BREAK_WIN={bonus:1.3,short:true};
// 3.2 extra boss muscle on top of the old stat table (hp and power multipliers)
const BOSS_BUFF={hp:[.8,1.34,1.39,1.53,1.22],pow:[.955,1.28,1.32,1.535,1.23]}// v0.19: eased about 7% hp and 3% pow with the role power change (was hp [.9,1.5,1.55,1.7,1.36], pow [1,1.34,1.38,1.6,1.28]) to pay for the 12 skill kit, role power and no dual ultimates, so the journey sim stays at level 41.3 and 14.6 boss tries (before the skill changes: 40.5 and 11.1; without the ease: 42.6 and 19.6); v0.4.3: re-tuned with capes; v0.8.2: the first three Scourges eased (were hp 1.3, 1.75, 1.8 and pow 1.15, 1.4, 1.44) so no boss is a wall; v0.9.5: hp [1.15,1.65,1.7,2.0,1.52] -> about 4 to 10% less, the realm gimmicks (BOSS_GIM) carry the rest
// BOSS_GIM (v0.9.5, battle4.js): every Scourge and Calamity brings one realm gimmick to its first fight (kind 'boss'; not Echoes, not the Daily
// Trial). Each is telegraphed on the boss's turn (a log line, a "Telegraph" chip on the boss, a mark on the heroes it will hit) and lands on its
// next turn, so reading it pays. first: the boss's turn of the first telegraph; every: turns between telegraphs (per boss: every).
// Types: slot (a Vanguard spot, or n spots, takes pct of max HP; Guard halves it and stops st), rod (the strongest hero is marked; pct to
// them and arc of that to the neighbours; swap them out to ground it), chill (each Vanguard hero not guarding gains a Chill stack: x(1+spd)
// slower per stack, Frozen (a lost turn) at max; a Fire skill clears it), tide and dark (an arena level rises to max; tide: heroes without
// Water are x(1+spd) slower per level and Water skills deal x(1+dmg) more per level, an Earth skill lowers it; dark: heroes deal dmg less
// per level, a Fire or Light skill lights a torch and clears it), sac (the boss readies something: thr = damage share that stops it,
// els = elements that stop it, brk = a Break stops it; fx: heal, summon (mon), spores (st on the Vanguard), buff (self)), mirror (for one
// round the boss takes cut less from kind and reflects refl of the damage), veil (for one round it takes cut less until a Scan or a Light
// skill reveals it), wing (it takes off for a round: non Ranged physical hits deal cut less; then it dives at a marked spot for pct),
// phase2 (at warn of its HP it cracks; at at a new move set (sk) and its shield back).
// stageK: the gimmick's damage and healing by stage (the first Scourge is the gentle introduction; reactions only open in the second realm).
const BOSS_GIM={on:true,daily:false,first:2,every:4,stageK:[.5,.85,1,1,1],
  def:{thornwarden:{t:'slot',n:'Thorn Snare',pct:.14,el:'earth',st:'root',d:'Roots erupt under one Vanguard spot on its next turn',tell:'Thorny roots creep under {who}',hit:'Roots burst under {who}'},
    drake:{t:'tide',n:'Rising Tide',every:3,max:3,spd:.05,dmg:.08,d:'The water rises every few turns: heroes without Water slow down and Water skills hit harder. An Earth skill dams it',tell:'The water swells around your feet',hit:'The tide rises'},
    cinderking:{t:'slot',n:'Lava Vents',pct:.17,el:'fire',st:'burn',d:'A lava vent erupts under one Vanguard spot on its next turn',tell:'The ground glows red under {who}',hit:'A lava vent erupts under {who}'},
    hoarwyrm:{t:'chill',n:'Blizzard',max:3,spd:.12,d:'The blizzard chills every hero who is not guarding; three stacks freeze a hero for a turn. A Fire skill thaws the caster',tell:'The blizzard thickens',hit:'The blizzard howls through the Vanguard'},
    ysolde:{t:'rod',n:'Lightning Rod',pct:.2,arc:.35,el:'lightning',d:'She marks the strongest hero; lightning strikes them on her next turn and arcs to their neighbours. Swap them out to ground it',tell:'The air crackles around {who}',hit:'Lightning strikes {who}'},
    bonecolossus:{t:'sac',n:'Reassemble',fx:'heal',heal:.12,thr:.07,d:'It gathers its bones to heal; deal enough damage before its next turn to scatter them',tell:'Bones rattle toward the Colossus',hit:'The Colossus pulls its bones back together',stop:'The bones scatter'},
    queenmantis:{t:'sac',n:'Brood',fx:'summon',mon:'gustimp',thr:.07,d:'An egg sac swells; burst it with enough damage before her next turn or it hatches',tell:'An egg sac swells on the Queen',hit:'The egg sac hatches',stop:'The egg sac bursts'},
    gloomcap:{t:'sac',n:'Spore Bloom',fx:'spores',st:['poison'],els:['fire'],thr:.06,d:'A spore pod swells; a Fire skill or heavy damage pops it, or it poisons every hero not guarding',tell:'A spore pod swells on the Matriarch',hit:'The spore pod bursts over the Vanguard',stop:'The spore pod shrivels'},
    ironsentinel:{t:'sac',n:'Overheat',fx:'buff',buff:['might','haste'],els:['water','ice'],thr:.08,d:'Its furnace glows white; a Water or Ice hit or heavy damage cools it, or it overclocks (Might and Haste)',tell:'The Sentinel\'s furnace glows white',hit:'The Sentinel overclocks',stop:'Steam hisses: the furnace cools'},
    siren:{t:'mirror',n:'Mirror Song',every:5,kinds:['mag'],cut:.35,refl:.12,d:'Every few turns she raises a water mirror for a round: magic deals less and part of it splashes back. Use weapons then',tell:'The Siren\'s song turns glassy',hit:'A mirror of water rises around the Siren'},
    ashwyvern:{t:'wing',n:'Take Wing',every:5,cut:.35,pct:.16,el:'fire',d:'It takes to the air for a round (weapon hits glance off unless Ranged), then dives at a marked spot',tell:'The Wyvern spreads its wings',hit:'The Wyvern takes to the air',dive:'The Wyvern dives at {who}'},
    frostlich:{t:'veil',n:'Grave Mist',cut:.5,d:'Every few turns it fades into mist for a round and takes far less damage, until a Scan or a Light skill reveals it',tell:'Frost mist gathers around the Lich',hit:'The Lich fades into the mist'},
    dimmer:{t:'dark',n:'Swallowed Light',every:3,max:2,dmg:.1,d:'The dark deepens every few turns: heroes deal less per level. A Fire or Light skill lights a torch and clears it',tell:'The lights around you gutter',hit:'The dark deepens'},
    nidhra:{t:'phase2',n:'Eclipse Form',warn:.65,at:.5,sk:[['Corona Flare','fire',1.3,'all','mag',[['burn',.5]]],['Night Talon','shadow',2.0,'one','phys',[['bleed',.6]]],['Eclipse Roar','shadow',1.1,'all','phys',[['weaken',.4]]]],d:'At half HP it becomes the Eclipse: new moves and its shield back. Save a weakness hit for after',tell:'Cracks of black fire spread across Nidhra',hit:'Nidhra becomes the Eclipse'},
    hollowking:{t:'sac',n:'Royal Guard',fx:'summon',mon:'drownedsailor',brk:1,thr:.08,d:'He calls a drowned guard up from the deep; Break his shield or hit him hard before his next turn to stop it',tell:'The King raises his hand to call a servant',hit:'A drowned guard answers the King',stop:'The call goes unanswered'},
    seraph:{t:'slot',n:'Pillars of Light',n2:2,pct:.12,el:'light',st:'blind',d:'Pillars of shattered light fall on two Vanguard spots on its next turn',tell:'Light gathers over {who}',hit:'Pillars of glass light fall on {who}'}}};
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
// ROAM: roaming dungeon foes (roam.js): base + perStage per dungeon, elite share, sight (tiles), patrol and chase step ms, giveUp
// (tiles before a chaser walks home), minFromStart (tiles from the entrance), lvUp, hpM and powM over random battles.
// v0.9.5: field: roamers on each realm's field too (base + perStage), never within minFromExit tiles of an exit, cave, dungeon or town gate.
// roles: each realm's roamers include at least one of every foe role in its pool (B4.roleOf), so the fights teach the roles.
const ROAM={base:4,perStage:1,elite:.2,sight:4,patrolMs:620,chaseMs:330,giveUp:7,minFromStart:9,lvUp:2,hpM:1.3,powM:1.12,// v0.9.5: base 3 -> 4
  field:{base:2,perStage:1,minFromExit:7},roles:true,
  boost:{hp:1.1,pow:1.06}};// boost: every non-elite foe in a roamer fight (lead and company) on top of hpM/powM: HP and ATK/MAG multipliers; elites keep their own mod boost
// SITES: side fortresses (fortW x fortH tiles) and minibosses (sites.js): mini = share of caves and fortresses with one, miniHp,
// miniPow and miniLv: its HP, power and level over the area.
const SITES={fortW:62,fortH:40,mini:.9,miniHp:6,miniPow:1.55,miniLv:4};
// MIMIC_RATE: share of ordinary dungeon chests that are mimics (mimic.js; picked from the run seed).
const MIMIC_RATE=.13;

// ==== 4. Economy and shops: prices, gold and XP rates, pack size, Smithy, tempering, Echoforged, capes ====
// prices
const MAT_PRICE={copper:18,iron:45,mythril:110,oak:14,ash:40,elder:95,healroot:10,bluecap:22,sunpetal:48,starbloom:120};
// Beta v0.4.1 3.5 economy (all editable here)
// gold/xp: multipliers on what the player earns (the Daily Trial is exempt). gear/items/forge: price multipliers. recruit: tavern hire price.
const ECON={gold:.9,xp:.82,gear:1.6,items:1.6,recruit:3,rareRecruit:2.6,inn:{base:30,per:25}};// v0.4.3: gold easier, prices lower (was gold .75, gear and items x2, recruits x3.5) v0.8.2: xp .85 -> .87 with more encounters (ENC_RATE) v0.9.9: xp .87 -> .82 (journey sim top level 42.4 -> target 38 to 42)
const econG=n=>(typeof G!=='undefined'&&G&&G.daily)?n:Math.round(n*ECON.gold);
// Beta v0.5.0 Phase 3: shops, gear and items (p3shop.js)
// 3.8 how many of one item the pack holds (was 9). The Daily Trial keeps its old cap so its runs stay exactly as before.
const ITEM_MAX=50,ITEM_MAX_DAILY=9;
const invCap=()=>(typeof G!=='undefined'&&G&&G.daily)?ITEM_MAX_DAILY:ITEM_MAX;
// 3.1 "Best for party" ordering: two upgrades for the same hero and slot count as close when their gains differ by at most
// closeAbs (absolute share of the hero's gear score) or closeRel (relative), and then get a short tradeoff line.
const SHOP_BEST={closeAbs:.02,closeRel:.2,minPct:.005};
// 3.3 Smithy plan: the smallest gain worth buying or crafting for (share of the hero's gear score)
const SMITH_PLAN={minPct:.03};// v0.12.13: a step must gain 3% (was 1%: tiny upgrades kept showing after Upgrade whole party)
// 3.9 Pork Chop Sandwiches handed over after the first boss victory, and how many it takes to walk back to town from a dungeon
const PORK={firstBoss:2,toTown:2};
// TEMPER: tempering costs for +1, +2, +3 (temper.js): raw material, monster parts, realm relics, Dread Cores, gold factor, floor.
const TEMPER={raw:[2,3,4],part:[1,2,3],relic:[1,2,2],core:[0,0,1],goldK:[.6,1.2,1.8],floor:.25};
// Echoforged weapons (echocore.js): EF_K = tier 6 stats multiplier; forging costs EF_SHARDS shards, EF_ESS essence, EF_CORE cores
// and EF_GOLD gold.
const EF_K=1.18;
const EF_SHARDS=2,EF_ESS=6,EF_CORE=3,EF_GOLD=3000;
// capes (capes.js): CAPE_ST per tier [HP, resistance, speed]; CAPE_PRICE per tier.
const CAPE_ST=[[25,4,0],[45,8,1],[70,13,2],[100,19,3],[140,26,4],[190,36,5]]/* gear16: the top cape's RES 36 (was 34), clear of the tier below at +3 */,CAPE_PRICE=[60,120,240,420,700,1000];
// STICK_Q: Bestiary entries the Tamer's Stick quest asks for (equip.js).
const STICK_Q=6;

// ==== 5. Party and roster: taverns, the journey roster, personal quests, Best Party, loadouts, Make camp ====
// taverns and the Guild Hall board
const TAV_BATTLES=[0,12,32,55,80];
const CHALL_POST=3;// how many open challenges a board shows at once (accepted ones always stay posted on top)
const TV_SLOTS=4,TV_CAP=Infinity,TV_CD=5;     // 4 tables, no per area recruit cap (v0.5.0), 5 battles between shuffles
// 6.6 personal quests: a hero must also have fought this many battles beside you in this journey (per hero, saved as bt)
const PERSONAL_BT=50;
// Beta v0.5.0 phases 4 and 5 (p4xp.js, p4party.js, p5settings.js)
// 4.1 personal quests: no level gate any more; PERSONAL_BT battles together and the party in this realm (0 based) or later.
const PERSONAL_REALM=2;// v0.7.2: third realm (was the second), see pacing.js
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
// v0.11.8: el per distinct element in the six (was .05, too small to matter), elDup per repeat of an element, rest: Fresh mix bonus for a hero
// who has not fought lately (full after 20 battles out, or never fought)
const BP6={str:.5,weak:.55,weakPen:1.6,role:{tank:[1,.15,-.4],heal:[1,.3,-.3],sup:[.35,-.05,-.2],dmg:[.4,.35,.12,0]},pr:.4,de:.4,dup:.28,dl:.08,el:.3,elDup:.2,rest:.6,
  boss:{el:3,arch:2,area:2.5},overlap:{boss:0,mix:.32,rot:.32},train:{gap:3,max:4},
  fly:{one:1.2,two:.35,archer:.45,boss:.6}};// v0.8.1 fly: flying foes ahead want real ranged attackers (party3.js p6Fly)
// Beta v0.6.3: Make camp (v063prog.js)
// price: Camp Supplies (Alchemy, from stage fromStage, 0 based: 2 = the third realm, about level 15). heal: share of max HP and MP
// standing heroes get back (an inn gives everything, a Tent 60%). cool: battles between camps. dur: battles a boon lasts.
// atk / def: boon stat bonus. first: first turn delay multiplier for Early rise. drop: extra drop chance for Forager's luck.
const CAMP={price:40,fromStage:2,heal:.25,cool:2,dur:3,atk:.1,def:.1,first:.35,drop:.25};
// the journey roster (tavern2.js): SUB_MIN + up to SUB_SPAN-1 wayfarers exist in a journey
const SUB_MIN=28,SUB_SPAN=5;//  target size 28..32
// LOADMAX: saved team loadouts (party2.js).
const LOADMAX=8;
// v0.8.2 class roles (roles.js). Every class has a primary role and one or two secondary roles, delivered by skills (sk, added to the
// class list at fixed levels, so old saves learn them on load by level) and by gear that leans into them (new weapon families in items.js,
// role charms below). A secondary role's output is meant to land at band[0] to band[1] of the dedicated class's (ded) primary output,
// measured by roleOut on a plain template per class (its element taken from ref; no signature skill) at level lv with each class's standard weapon and armor of tier tier.
// Roles: tank, phys (physical damage), magic, ranged (ranged delivery, catches flyers), healer, buffer (support), debuffer.
// Every class also primes and detonates (skills.js ROLE_FILL), so primer/detonator is a shared tag, not a secondary.
// w: how roleOut weighs statuses (per target per turn); area: targets an all-foes or all-allies move counts for; self: weight of a buff
// that only lands on the user; tauntless: a would-be tank without a taunt; tankRef: foe attack multiplier for the tank measure;
// top: roleOut adds up a hero's best this-many moves for the role; chiK: Monk and Druid chi heals (chi:1) use the better of healing power and chiK x attack.
// sk: the new skills per class. el 'e1' takes the hero's first element; {n1} in names and text is its name. charms: role charms
// (sold at the charm stall from stage 2, 0 based shopFrom) and their perks (healUp, spellPow, buffT, debT, status, rngPow, tauntDef).
const ROLES={
  cls:{warrior:{p:'phys',s:['tank','debuffer']},knight:{p:'tank',s:['buffer']},archer:{p:'ranged',s:['debuffer']},thief:{p:'debuffer',s:['ranged']},
    monk:{p:'phys',s:['healer','buffer']},mage:{p:'magic',s:['debuffer']},healer:{p:'healer',s:['buffer']},bard:{p:'buffer',s:['magic','healer']},
    sniper:{p:'ranged',s:['debuffer']},druid:{p:'ranged',s:['healer','debuffer']},archmage:{p:'magic',s:['buffer']},chronicler:{p:'magic',s:['debuffer','healer']}},
  ded:{tank:'knight',phys:'warrior',magic:'mage',ranged:'archer',healer:'healer',buffer:'bard',debuffer:'thief'},
  ref:{warrior:'brann',knight:'oren',archer:'tess',thief:'sable',monk:'dorn',mage:'mira',healer:'lumen',bard:'brook',sniper:'kaevan',druid:'nikaris',archmage:'jaeson',chronicler:'vaelith'},
  band:[.55,.78],lv:30,tier:3,// v0.10.5: .75 -> .78 (the sub-role natures lift a few secondaries a hair, chronicler healer .755)
  names:{tank:'Tank',phys:'Physical damage',magic:'Magic damage',ranged:'Ranged',healer:'Healer',buffer:'Support',debuffer:'Debuffer'},
  w:{buff:{might:1,haste:1,bulwark:1,regen:.8,ward:.7,focus:.5,taunt:.2},debuff:{break:1,weaken:1,slow:.8,stun:1.4,blind:.7,poison:.6,bleed:.6,burn:.6,root:.4},
    area:2,self:.6,tauntless:.55,tankRef:1.12,top:2,chiK:1.25},
  sk:{
    warrior:[{id:'r_sunder',n:'Sunder',k:'phys',pw:1.1,mp:5,lv:11,fx:[['break',.8]],d:'A splitting blow that cracks armor. Likely Breaks.',r:'debuffer'},
      {id:'r_shout',n:'Intimidating Shout',k:'status',t:'all',mp:8,lv:16,fx:[['weaken',.8]],d:'A roar that shakes every foe. Likely Weakens them.',r:'debuffer'},
      {id:'r_stance',n:'Iron Stance',k:'status',t:'self',mp:7,lv:20,fx:[['taunt',1],['regen',1]],d:'Plants his feet: Taunt and Regen. The line hides behind him.',r:'tank'}],
    knight:[{id:'r_banner',n:'Raise the Banner',k:'status',t:'allyAll',mp:12,lv:19,fx:[['haste',1]],d:'The standard goes up: Haste for the vanguard.',r:'buffer'},
      {id:'r_cover',n:'Shield Ally',k:'status',t:'ally',mp:5,lv:13,fx:[['bulwark',1],['regen',1]],d:'Covers an ally: Bulwark and Regen.',r:'buffer'}],
    archer:[{id:'r_cripple',n:'Crippling Shot',k:'phys',pw:1,mp:6,lv:15,dl:'ranged',fx:[['weaken',.85],['slow',.7]],d:'An arrow to the sword arm. Likely Weakens, may Slow.',r:'debuffer'},
      {id:'r_flare',n:'Flare Arrow',k:'phys',pw:.8,mp:8,t:'all',lv:18,dl:'ranged',fx:[['blind',.85]],d:'A burning flare bursts over every foe. May Blind.',r:'debuffer'}],
    thief:[{id:'r_stars',n:'Throwing Stars',k:'phys',pw:.7,hits:2,mp:3,cost:.8,lv:4,dl:'piercing',d:'Two quick stars from the hip. Piercing: they find the gaps in armor.',r:'ranged'},
      {id:'r_kunai',n:'Kunai Volley',k:'phys',pw:.8,mp:9,t:'all',lv:16,dl:'piercing',fx:[['bleed',.4]],d:'A fan of kunai at every foe. Piercing; may Bleed.',r:'ranged'},
      {id:'r_hamstr',n:'Hamstring',k:'phys',pw:.8,mp:5,cost:.8,lv:12,fx:[['slow',.8],['weaken',.5]],d:'A cut behind the knee. Likely Slows, may Weaken.',r:'debuffer'},
      {id:'r_toxin',n:'Toxic Cloud',k:'status',t:'all',mp:10,lv:18,fx:[['poison',.85],['weaken',.6]],d:'A cloud of venom over every foe. Likely Poisons, may Weaken.',r:'debuffer'},
      {id:'r_fuma',n:'Fuma Shuriken',k:'phys',pw:1.9,mp:12,cost:1.1,pierce:1,lv:24,dl:'piercing',d:'A great folding shuriken that cuts through armor. Piercing; ignores half of defense.',r:'ranged'}],
    monk:[{id:'r_chimend',n:'Chi Mend',k:'heal',chi:1,pw:1.6,mp:5,t:'ally',lv:7,d:'Pushes chi into an ally to close their wounds.',r:'healer'},
      {id:'r_harmony',n:'Harmony Meditation',k:'status',t:'allyAll',mp:10,lv:14,fx:[['focus',1]],heal:.2,d:'The line breathes with him: Focus (more crit chance for a few turns) for the vanguard and a 20% heal.',r:'buffer'},
      {id:'r_lotus',n:'Lotus Circle',k:'heal',chi:1,pw:1.1,mp:12,t:'allyAll',lv:21,d:'A shared meditation that heals the vanguard.',r:'healer'}],
    mage:[{id:'r_snare',n:'Time Snare',k:'status',t:'all',mp:10,lv:16,fx:[['slow',.6],['weaken',.25]],d:'Thickens time around every foe. Likely Slows, may Weaken.',r:'debuffer'}],
    healer:[{id:'r_bless',n:'Blessing',k:'status',t:'ally',mp:6,lv:10,fx:[['might',1],['regen',1]],d:'A blessing on one ally: Might and Regen.',r:'buffer'},
      {id:'r_aegis',n:'Holy Aegis',k:'status',t:'allyAll',mp:14,lv:17,fx:[['bulwark',1]],d:'A dome of light: Bulwark for the vanguard.',r:'buffer'}],
    bard:[{id:'r_anthem',n:'Anthem of Valor',k:'status',t:'allyAll',mp:16,lv:14,fx:[['might',1],['haste',1]],d:'The battle anthem: Might and Haste for the vanguard.',r:'buffer'},
      {id:'r_aria',n:'{n1} Aria',k:'mag',pw:2.1,mp:5,lv:5,el:'e1',d:'A piercing {n1} note aimed at one foe.',r:'magic'},
      {id:'r_ballad',n:'Healing Ballad',k:'heal',pw:1.75,mp:6,t:'ally',lv:8,d:'A slow ballad that mends one ally.',r:'healer'},
      {id:'r_chorus',n:'Restoring Chorus',k:'heal',pw:1.2,mp:12,t:'allyAll',lv:18,fx:[['regen',1]],d:'The whole line sings along: heals the vanguard and grants Regen.',r:'healer'},
      {id:'r_storm',n:'{n1} Storm Song',k:'mag',pw:2.8,mp:14,cost:1.2,lv:26,el:'e1',d:'The song rises into a {n1} storm on one foe. Slow recovery.',r:'magic'}],
    sniper:[{id:'r_hobble',n:'Hobbling Bolt',k:'phys',pw:1,mp:6,lv:14,dl:'ranged',fx:[['slow',.8],['weaken',.6]],d:'A bolt to the leg. Likely Slows, may Weaken.',r:'debuffer'},
      {id:'r_flash',n:'Flash Bolt',k:'phys',pw:.9,mp:11,t:'all',lv:20,dl:'ranged',fx:[['blind',.7],['slow',.4]],d:'A bolt that bursts into light over every foe. May Blind and Slow.',r:'debuffer'}],
    druid:[{id:'r_tangle',n:'Tangleroot',k:'status',t:'all',mp:9,lv:12,fx:[['root',.7],['slow',.6]],d:'Roots burst up under every foe. May Root and Slow.',r:'debuffer'},
      {id:'r_sap',n:'Healing Sap',k:'heal',chi:1,pw:1.9,mp:6,t:'ally',lv:7,d:'Old tree sap on a wound.',r:'healer'}],
    archmage:[{id:'r_frostmail',n:'Frost Mail',k:'status',t:'allyAll',mp:12,lv:18,fx:[['bulwark',1]],heal:.1,d:'A skin of rime for the vanguard: Bulwark and a 10% heal.',r:'buffer'}],
    chronicler:[{id:'r_draft',n:'Corrected Draft',k:'heal',pw:1.15,mp:12,t:'allyAll',lv:18,d:'Rewrites the last page: heals the vanguard.',r:'healer'}]},
  // adj: changes to existing class skills (by class and skill id), merged in when the list is built
  adj:{chronicler:{annotate:{fx:[['break',.9],['weaken',.5]],rl:'debuffer'},redact:{fx:[['blind',.7]]}},bard:{tune1:{pw:1},tune2:{pw:1}},druid:{wildmend:{chi:1,pw:1.15}},
    // v0.19: role power now comes from ROLEPW, so a few sub role numbers are set to keep every secondary in the 55 to 78% band
    knight:{lance1:{pw:1.75},lance2:{pw:1.75},judge:{pw:3}},thief:{assn:{pw:2.3}}},
  charms:[{id:'c_rl_mend',n:"Mender's Locket",st:{mag:8,res:6},attr:{fth:3},perk:{healUp:.12},d:'+12% healing',price:520},
    {id:'c_rl_song',n:'Spellstring Charm',st:{mag:12,mp:30},perk:{spellPow:.08},d:'+8% spell damage',price:520},
    {id:'c_rl_quiv',n:'Kunai Pouch',st:{atk:8,spd:4},attr:{dex:3},perk:{rngPow:.1},d:'+10% Ranged damage',price:520},
    {id:'c_rl_herald',n:"Herald's Horn",st:{hp:60,res:6},perk:{buffT:1},d:'Buffs you give last 1 turn longer',price:560},
    {id:'c_rl_hex',n:"Hexer's Eye",st:{mag:6},attr:{luk:4},perk:{status:1.2,debT:1},d:'Debuffs land 20% more often and last 1 turn longer',price:560},
    {id:'c_rl_ward',n:"Warden's Badge",st:{hp:110,def:10},perk:{tauntDef:.15},d:'Takes 15% less while Taunting',price:560}],
  shopFrom:1};

// v0.19 skills12.js: Focus, the skill cap, dual types, and role power.
// FOCUS: the Focus status gives +crit chance (added to the hero's crit chance, all damage skills) for `turns` of the holder's turns; it is no longer spent by the first attack.
// SK12: cap = most class skills a hero can learn (Limit Breaks, bond techs, Archive skills and the basic Attack are outside it). dualUlt false: a dual type
// (two elements) never learns the elemental ultimates listed in ult (by class); legendsKeepUlt keeps them for legendary and special wayfarers (src L or x).
// physCls: classes whose dual art is a physical move (kind from the weapon, dmg11.js); every other class casts it as magic. gen: names of the filler Primer (P) and
// Detonator (D) a dual type gets for an element that lacks one; genLv: where they land. dualReact: how much of the second reaction a dual art adds (1 = in full).
const FOCUS={crit:.4,turns:3};
const SK12={cap:12,dualUlt:false,legendsKeepUlt:true,
  ult:{warrior:['titan','ragnarok'],knight:['judge'],mage:['s3a','cataclysm'],healer:['verdict'],thief:['assn','lotus'],archer:['heavenp'],monk:['dragon','ascend'],bard:['finale','symphony'],
    sniper:['s3a','tenk'],druid:['s3a','oldwood'],archmage:['s3a','zeropoint'],chronicler:['s3a','finaled']},
  physCls:['warrior','knight','thief','archer','monk','sniper','druid'],
  // gen (v0.19.2, kits12.js): the filler a dual type gets for an element that lacks a Primer or Detonator. Its name is the class's own primer / detonator
  // family ({n} = the element), the same family the class's first elemental skills carry (slotNames below), so a kit reads as one voice. voice: the class's
  // description of that family (never the words Primer, Detonator or prime). genLv: where the fillers land.
  gen:{warrior:['{n} Brand','{n} Edge'],knight:['{n} Seal','{n} Lance'],thief:['{n} Needle','{n} Shiv'],archer:['{n} Tracer','{n} Arrow'],monk:['{n} Palm','{n} Chi Burst'],
    mage:['{n} Mark','{n} Lance'],healer:['{n} Halo','{n} Smite'],bard:['{n} Tune','{n} Crescendo'],sniper:['{n} Mark','{n} Quarrel'],druid:['{n} Thorn','{n} Fang'],
    archmage:['{n} Glyph','{n} Lance'],chronicler:['{n} Gloss','{n} Verse']},
  voice:{warrior:["A branding blow that sets {n} into the foe and leaves it clinging.","A heavy {n} cut swung with the whole shoulder."],
    knight:["A rap of the shield that seals the foe in {n}; the seal lingers.","A charge with a lance of {n} that drives home."],
    thief:["A needle dipped in {n}, left in the foe.","A fast {n} blade through the gap in the guard."],
    archer:["A tracer arrow that leaves {n} hanging on the foe's trail.","An arrow of {n} loosed at full draw."],
    monk:["An open palm that leaves {n} humming in the foe.","A fist of {n} driven through the guard."],
    mage:["Marks the foe with a mote of {n} that lingers.","A lance of {n}, focused to a point."],
    healer:["A halo of {n} settles on the foe and lingers.","A smite of {n} from above."],
    bard:["A {n} tune that lingers on the foe.","A rising {n} crescendo that crashes on one foe."],
    sniper:["A bolt that leaves {n} clinging to the foe.","A {n} quarrel loosed at full gallop."],
    druid:["Thorns of {n} snag the foe and linger.","The pack's fang, wreathed in {n}."],
    archmage:["A glyph of {n} traced on the foe, glowing.","A lance of {n} cast through the glyph."],
    chronicler:["A gloss of {n} ink written across the foe.","A verse of {n} that ends the sentence."]},
  // slotNames: the first elemental skills of a class (skills.js) keep a fixed Primer or Detonator role by slot; where the family name says the opposite
  // (an Edge that primes, a Ray that detonates) the skill takes the class's voice for the role it has. id -> name pattern.
  slotNames:{warrior:{edge2:'{n} Brand'},knight:{lance2:'{n} Seal'},mage:{s1b:'{n} Lance'},healer:{ray1:'{n} Halo',ray2:'{n} Smite'},thief:{shiv2:'{n} Needle'},
    archer:{arrow1:'{n} Tracer'},monk:{chi2:'{n} Palm'}},
  // roleSwap: classes whose first two spells have the opposite roles by their names (Thunder Quarrel bursts, Shadow Quarrel lingers)
  roleSwap:{sniper:['s1a','s1b']},
  genLv:{P:8,D:12},dualReact:1,
  // keep / drop (v0.19.2): the skills that define how a class plays are protected from the cap (an identity skill the cap left out takes the place of the
  // first skill in drop that is in the kit, never one a dual type needs for its Primers and Detonators)
  keep:{warrior:['cleave'],knight:['wall'],healer:['purify'],thief:['smoke','flurry'],archer:['mark'],monk:['fists','med'],bard:['dis','req']},
  drop:{warrior:['hurl','r_shout','rend'],knight:['javelin','r_cover','r_banner'],healer:['r_aegis','r_bless'],thief:['dart','r_fuma','r_stars'],
    archer:['galebar','r_cripple','r_flare'],monk:['r_harmony','tempkick','iron'],bard:['r_storm','secondwind','rondo','r_ballad']},
  // arts: the dual art of a physical class (physCls) is a martial move that still names its two elements: "{word a} and {word b} {noun}". The noun is
  // picked from the kind of art (all foes, one foe, the vanguard) by the pair; casters keep the spell names in COMBO (skills.js).
  arts:{w:{fire:'Cinder',water:'Tide',earth:'Loam',wind:'Gale',lightning:'Thunder',ice:'Frost',light:'Dawn',shadow:'Dusk'},
    n:{warrior:{all:['Sweep','Reaping'],one:['Hammerfall','Breaker'],ally:['Banner','Stand']},knight:{all:['Sweep','Rampart'],one:['Slam','Charge'],ally:['Bastion','Wall Stance']},
      thief:{all:['Knife Storm','Dance'],one:['Backstab','Cut'],ally:['Veil','Hush']},archer:{all:['Arrowfall','Downpour'],one:['Longshot','Deadeye'],ally:['Cover']},
      monk:{all:['Whirlwind','Spin Kick'],one:['Rush','Dragon Palm'],ally:['Stance','Breath']},sniper:{all:['Gallop','Stampede'],one:['Riding Shot','Longshot'],ally:['Cover']},
      druid:{all:['Stampede','Rampage'],one:['Rake','Maul'],ally:['Grove','Howl']}},
    d:{warrior:{all:"A wide, two handed sweep that carries {a} and {b} through every foe.",one:"One crushing blow, the blade alive with {a} and {b}.",ally:"Plants the banner and calls on {a} and {b} for the whole vanguard."},
      knight:{all:"The shield leads a charge through every foe, edged in {a} and {b}.",one:"A lance charge tipped with {a} and {b}.",ally:"Grounds the shield and calls up {a} and {b} around the vanguard."},
      thief:{all:"A fan of knives laced with {a} and {b} through every foe.",one:"A single cut laced with {a} and {b}.",ally:"Slips the vanguard into {a} and {b} cover."},
      archer:{all:"A volley of arrows tipped with {a} and {b} over every foe.",one:"One arrow loosed with {a} and {b} on the head.",ally:"Covering fire dressed in {a} and {b} for the vanguard."},
      monk:{all:"A spinning kick that drags {a} and {b} through every foe.",one:"A palm strike that drives {a} and {b} home.",ally:"A still stance that draws {a} and {b} around the vanguard."},
      sniper:{all:"A galloping volley shot in {a} and {b} across every foe.",one:"A bolt loosed at full gallop with {a} and {b}.",ally:"Covering fire dressed in {a} and {b} for the vanguard."},
      druid:{all:"The pack and the weather answer in {a} and {b} on every foe.",one:"Claw and root together, {a} and {b}, on one foe.",ally:"The grove answers in {a} and {b} for the vanguard."}}}};

// ROLEPW: skill power by how a skill's role sits in the hero's class role list (roles9.js ROLE9.cls: main, then two sub roles): the hero's main role 1,
// a sub role `secondary`, any other role `off`. Primer, Detonator and dual art damage never counts below `secondary`. A nature that leans into a skill's role
// adds `natLift` to that skill's multiplier, never above `natCap` (so a lifted off-role skill never matches a main-role one). Debuff chances move by
// fxShare of the gap; a buff of an off-role skill lasts offBuff turns less (at least 1).
const ROLEPW={primary:1,secondary:.8,off:.5,natLift:.14,natCap:.9,fxShare:.33,offBuff:1};
// PACE (v0.9.5, pacing.js): the realm (0 = the first) in which each system opens on a journey started on v0.9.5 or later. Older journeys,
// New Game+ cycles and the Daily Trial have everything open. pcUnlocked(system) reads it (the onboarding tips can ask it too).
// combat, elements and taming are always open; tempering keeps its own rule (after the first Scourge); camp follows CAMP.fromStage.
const PACE={at:{elements:0,combat:0,taming:0,reactions:1,gear:1,bonds:1,camp:2,guilds:2,echoforge:3,arenaGold:3,ngplus:3}};

// ==== 6. World: encounters, chance meetings, travel items, day and night, weather tables, factions, map generation ====
// encounters on the road
// ENC_RATE: chance per step to meet a random battle, by the Settings choice. CE_*: chance meetings with a wayfarer (chance.js), about 1 in 170 steps after a 30 step gap, 2 per area at most
const ENC_RATE={off:0,low:.02,normal:.035,high:.06};// v0.9.5: fewer, better fights: one random battle about every 41 steps on Normal instead of every 15 (v0.8.2: .07/.13/.18); visible roamers (ROAM) and side sites make up the rest
const ENC_MIN_STEPS=12;// v0.9.5: at least 12 tiles walked between random battles (v0.8.2: 7)
// ENC (v0.9.5, roam.js): what an ordinary fight pays now that there are fewer of them. rew: XP and gold multipliers for random field and
// dungeon battles and roamers (a number, or one per stage: the early realms lost the most fights); roam: an extra multiplier for a roamer (on top of rew). Bosses, elites, minibosses, the arena and the Daily
// Trial are not touched. Applied through facMul (engine.js win), like the NG+ modifiers.
const ENC={rew:{xp:[2,1.6,1.2,1,.85],gold:1.45},roam:{xp:1.1,gold:1.15}};
// chance meetings with a wayfarer (chance.js): about 1 in 170 steps after a 30 step quiet gap, at most 2 per area
const CE_ODDS=1/170, CE_GAP=30, CE_AREA_CAP=2;
// v0.18.7 wild recruit events (chance meetings, a Den or cave prize that is a wayfarer, the keep's cells; world12.js): at least minSteps steps (on fields and in caves
// and dungeons) and minBattles battles since the last one (firstSteps before the first), at most perRealm[stage] per realm (the realm's place in the journey, 0 to 4) and total per journey; dual type wayfarers are
// kept (not re-drawn) with the chance dual[stage] (the stage is the realm's place in the journey, 0 to 4)
const WREC={minSteps:240,minBattles:3,firstSteps:120,perRealm:[1,2,2,2,1],total:8,dual:[.08,.2,.5,.85,1]};
// TOWN_LANE: every town gate gets a clear approach lane at least this many tiles wide to the main road
const TOWN_LANE=2;
// day and night
const CLK_LEN=900,CLK_PH=[['day',0,495],['dusk',495,585],['night',585,810],['dawn',810,900]]; // v0.4.0 3.7: every phase is 50% longer than in v0.3.x (was 600 steps around)
const NIGHT_POW=1.1;
// weather: how many steps a weather lasts, and the odds out of 100 per realm
const WX_MIN=300,WX_MAX=520;
// everyday weather, shares out of 100
const WX_TABLE={meadow:[['clear',72],['rain',14],['fog',9],['storm',5]],coast:[['clear',70],['rain',12],['fog',8],['sand',6],['storm',4]],
  cave:[['clear',72],['heat',13],['fog',8],['ashfall',7]],snow:[['clear',65],['snow',23],['blizzard',6],['aurora',4],['fog',2]],
  heights:[['clear',65],['storm',15],['gale',14],['fog',4],['blizzard',2]],void:[['clear',66],['starfall',16],['fog',8],['aurora',6],['ashfall',4]]};
// rare skies (Blood Moon, Eclipse, Meteor Shower, Elemental Surge): shares out of 100, taken out of the clear share. Day or night limits are set by "when" on each sky in world3.js
const SUPER_TABLE={meadow:[['surge_earth',2],['bloodmoon',2],['eclipse',1]],coast:[['surge_water',2],['meteor',1.5],['bloodmoon',1.5]],cave:[['surge_fire',2],['bloodmoon',2],['meteor',1]],
  snow:[['surge_ice',2],['eclipse',1.5],['meteor',1.5]],heights:[['surge_wind',2],['eclipse',1.5],['meteor',1.5]],void:[['surge_shadow',2],['eclipse',1],['bloodmoon',1.5],['meteor',1.5]]};
// factions: standing needed for ranks 1 to 6
const REP_AT=[0,40,110,230,400,640];
// Beta v0.4.1 1.7: where the dungeon lever may sit. minFrac: the lever is at least route/minFrac steps from the stairs (3 = outside the first third),
// plus minExtra steps; minHops: rooms walked through before the lever room (1 = never in the first two rooms).
const DUN_LEVER={minFrac:3,minExtra:4,minHops:1};
// Beta v0.4.1 1.8: at most this share of a journey's forward gate exits (town and field ends) may face east.
const GATE_EAST_MAX=.4;
// travel items (travel.js): a Tent heals TENT_HEAL and revives at TENT_REVIVE; camping can be ambushed (AMBUSH_RATE per
// area kind, foes AMBUSH_POW stronger).
const TENT_HEAL=.6,TENT_REVIVE=.3,AMBUSH_RATE={field:.3,dungeon:.45},AMBUSH_POW=1.15;

// ==== 7. Interface timings: transitions, the save indicator, hints, battle information (B5) ====
// HINTS: early game hints show only while the journey is in stages below HINTS_UNTIL; delay before one appears (ms)
const HINTS_UNTIL=1,HINT_DELAY=1400;
// 5.4 transitions, in ms of world screen time: time of day blends over tod, weather over wx (visuals and ambience beds).
const TRANS={tod:11000,wx:6500,ambTod:10,ambWx:6};
// 5.5 save indicator: show "Saving..." this long, then "Saved", hold, then fade. minGap = autosaves closer than this share one message.
// syncDelay: the cloud upload waits this long after the last save (debounced, signed in players with write access only).
// v0.8.5: syncMax = never more than this unsynced while saves keep coming; recheck = compare every slot with the cloud this often
// while the page is visible; cloudWait = Continue waits at most this long for the first cloud check.
const SAVE_UI={saving:350,hold:2000,fade:450,minGap:2500,syncDelay:2000,syncMax:30000,recheck:60000,cloudWait:6000};
// Beta v0.7.0 battle information and input (battle5.js)
// order: turns shown in the order bar on portrait phones (tall), elsewhere (wide); bigPw: a foe damage skill at or above this power (or
// one that hits the whole party) shows the "big hit" intent; stCh: a skill whose status chance is at least this shows "status";
// it: the stage intent label's size (logical stage px); ringMs: how long the timing ring takes to close; win / winRM: half the timing
// window in ms (reduced motion: the ring does not move, it lights up for the window instead); atkUp: damage bonus of a timed hit;
// defDown: damage cut of a timed guard against a foe's single target attack; grace: ms after the ring opens before a press counts.
const B5={order:{tall:6,wide:8},bigPw:1.55,stCh:.4,it:{w:11,h:10},ringMs:900,win:130,winRM:260,atkUp:.15,defDown:.15,grace:90};

// ==== 8. Graphics: quality tiers, HD sprites, HD-2D battle stage and world, world effects, weather layers, battle screen layout (B3) ====
// Beta v0.5.0 phase 2: battle and world logic (p2world.js)
// BATTLE_GROUND: every battle backdrop has a solid ground plane from gy (share of the stage height) down; units stand between top and bot,
// flying foes hover hover px above their shadow. Water, lava and sky are only drawn above gy, as scenery.
const BATTLE_GROUND={gy:.5,top:.56,bot:.96,hover:9};
// Beta v0.5.0 Phase 6: graphics quality (gfx6*.js)
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
// Beta v0.5.3: HD sprites (sprhd.js, sprhd2.js)
// SPRITE_HD true: heroes, townsfolk and monsters are painted at twice the detail (SPR.k) with five step light ramps, rim light and coloured
// line art, heroes stand SPR.addH logical px taller (longer legs and torso, same head), and the world and battle canvases render at SPR.k
// so that detail shows. Every sprite canvas still reports its logical size (width/height), so nothing that places sprites changes.
// false: the v0.5.2 sprites and canvases, exactly as before.
const SPRITE_HD=true;
const SPR={k:2,addH:6,rimA:.5,outA:.55};
// v0.5.3 HD-2D battle stage (hdstage.js, hdspell.js)
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
  medium:{on:1,mode:'under',res:1,maxPx:900000,lights:4,shadows:6, decals:3,bloomK:.55,dof:1,  rays:1,rim:1,spell:1,props:1},
  high:  {on:1,res:2,  maxPx:3200000,lights:8,shadows:12,decals:4,bloomK:.7, dof:1.2,rays:1,rim:1,spell:2,props:1}};
// The floor: persp is the perspective offset as a share of the floor height (smaller = deeper perspective), tile is the world size of
// one floor texture tile in logical px, sq is the depth squash of floor circles and shadows, focus is the sharp band [top, bottom] as a
// share of the floor (units stand there; above it the floor blurs toward the horizon, below it a little toward the bottom edge).
// v0.17.3 RENDER (res11.js, hd2d.js, hdstage.js, battle11.js): render resolution follows the display. d = device pixels per art pixel =
// view scale x page zoom x devicePixelRatio. Auto: internal pixels per art pixel = clamp(floor(d / k + bias), 1, tier max) (d 3 -> 1, 4 -> 2,
// 6 -> 3). META.cfg.render: 'auto' | '1' | '2' | '3' (Settings > Render scale) forces the value (still capped by the GPU: maxTex).
// tex: ground, prop and building textures are upscaled once with EPX (Scale2x) from this many internal px per art px on.
// bk: the battle unit layer's backing pixels per logical px (2 below d bk, else bkHi, an integer multiple of the 2x HD paint).
// sc4W/sc5W/scH: the flat view may use scale 4 or 5 on boxes this wide and tall (layout px); minVw: the narrowest view (art px) a
// dpr-aware scale change may produce. stage: the GL battle stage's backing pixels per CSS pixel, from the display, capped per tier by resMax.
const RENDER={k:2,bias:.25,max:3,tex:2,bk:3,bkHi:4,sc4W:1360,sc5W:1760,scH:520,minVw:150,maxArea:4200000,texArea:16000000,stageMax:{medium:2,high:3}};
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
// v0.6.3 world pass (worldfx.js, hd2d.js, map.js)
// WFX: ambience particles live in world space (art px), repeated on a lattice of cells about one view in size and wrapped around the
// camera, so they stay where they are when the camera moves (in 2D and HD-2D alike). ref: the view area the per view counts are for.
// hero: no particle is drawn over the hero's box (half width, height above the feet, below the feet; art px). n: counts per ref area.
// bird: one flock crossing per period (ms) at height h. chestGone: opened chests vanish from the map and can be walked over.
const WFX={ref:80000,cell:128,margin:96,maxN:120,hero:[10,30,3],n:{spark:14,snow:46,wind:8,fly:4,spray:5,mote:12,dust:10,lantern:7,firefly:12,dew:12},
  bird:{period:26000,dur:11000,h:64,span:560},chestGone:true,chestAnim:{open:320,hold:250,fade:450},hdZ:[560,180]};
// v0.7.7 weather (weather7.js)
// WX7: every weather drawn in layers. tier: per graphics tier. cap: most falling particles on the 2D canvas per frame (world 2D, the
// HD-2D overlay, battle); rain/snow/sand/ash/wind: base counts per 2D view (far, mid, near layer); ground: puddles, ripples, splashes and
// settling flakes (0 off, 1 on, 2 more); banks: fog and dust banks per layer; shimmer: heat haze distortion (0 off, 1 on); soft: soft
// sprites for near particles (0: plain pixels); gl: weather particles inside the HD-2D scene; glN: their count scale; glCap: most GL
// weather quads. par: parallax of the far, mid and near layers against the camera (1 = moves with the ground). bolt: storm strikes
// (gap: shortest and longest time between strikes in ms; pulses: [start ms, length ms, peak] of each flash of a strike: two brief
// flashes per strike at most and strikes at least 4 s apart, so never more than 2 flashes in any second; peak: the white over the
// screen; light: how much a flash lights the HD-2D scene). gl: GL counts per glRef world area. heroPad: px kept clear around the hero.
const WX7={on:true,
  tier:{low:   {cap:90, rain:[46,24,0], snow:[40,22,0],sand:[34,16,0],ash:[22,10,0],wind:[12,6,0],ground:0,banks:[6,0,0],shimmer:0,soft:0,gl:0,glN:0,glCap:0,stars:10},
        medium:{cap:260,rain:[70,48,12],snow:[60,40,10],sand:[56,34,8],ash:[34,20,6],wind:[16,10,4],ground:1,banks:[4,4,2],shimmer:1,soft:1,gl:1,glN:1,glCap:900,stars:24},
        high:  {cap:460,rain:[110,80,20],snow:[96,64,16],sand:[90,56,12],ash:[56,32,10],wind:[24,16,6],ground:2,banks:[5,5,3],shimmer:1,soft:2,gl:1,glN:1.7,glCap:1800,stars:40}},
  par:[.82,1,1.35],
  bolt:{gap:[4200,9200],pulses:[[0,70,.42],[150,60,.24]],light:1.1,life:260},
  gl:{rain:420,storm:540,snow:320,blizzard:420,sand:280,ash:120,ember:30,gale:70,leaf:24,heat:40,bank:1},glRef:420000,heroPad:4,
  // v0.8.0: readability around the hero is a feathered ellipse, never a clear box. face: centre y (share of his box from the top), radii
  // (shares of the box), core (squared elliptical distance below which nothing is drawn; the rest fades in smoothly), bank: the least
  // alpha a near fog bank keeps over his face. fogPar: parallax of ground fog banks (they lie on the ground; falling layers use par)
  face:{y:.28,rx:.85,ry:.4,core:.22,bank:.4},fogPar:[.96,1,1.05]};
// WMAP: the illustrated world map (map.js). vig: vignette size in cells.
const WMAP={cell:[64,150,38],vig:.78,names:84};// cell: px per area (normal min, max, min on short landscape screens); names: written out from this cell size
// Beta v0.5.3: HD-2D world renderer (hd2d.js, hd2dgl.js)
// Medium and High graphics draw the world maps through WebGL as a lit diorama (Low, no WebGL or Settings > HD-2D world off: the 2D view).
// pitch: camera tilt in degrees below the horizon; fov: vertical field of view (maxHfov caps the horizontal one on wide views); zoom: 1 =
// sprites as big as in the 2D view; follow: camera glide time constant (ms); topSlack: how far past the map's top edge the camera may
// look (share of the view); sway: idle camera drift (px, degrees, ms; off under reduced motion; v0.10.0: amp and pitch 0, the drift made the whole pixel scene jump a pixel at rest). wall: block heights in art pixels
// (dungeon walls, field cliffs, town walls); water/deep: how far water and cloud seas sit below the ground. fogStart/fogEnd: distance
// fog, in camera distances. xray: radius (art px) around the hero where props and walls in front of him thin out; actMin: the least
// light characters get (dark places stay readable); heroLight: radius of the hero's lantern; shaft: light shaft strength.
// dof: tilt shift (shift of the sharp band from the hero, band half height, ramp, strength; all shares of the view height).
// bloom: threshold and strength (Medium, High). tiers: px = the least internal pixels per art pixel (1 = the 2D view's own grid; v0.17.3: the
// real value follows the display, see RENDER and resPx in res11.js), pxMax = the most (3 = the HD paint's own detail), blur = size
// divisor of the blurred copy, lmap = light map size (every light in view is drawn into it each frame), bloom 1 = from the blurred copy,
// 2 = its own wider pass, dof 1 or 2 blur rounds, shafts on or off, every = remake the blurred copy every n frames.
// lmMax: most lights per frame; lightK: light strength; chunk: static geometry chunk size in tiles (culling).
// look: lighting and grade per time of day and place; weather: how each weather scales ambient and sun and tints the fog.
// fogN (v0.8.0): where the distance fog starts in that weather, as a share of fogStart (fog 0.3: it thickens smoothly from near the hero).
const HD2D={pitch:40,fov:28,maxHfov:40,zoom:1,follow:85,topSlack:.2,sway:{amp:0,pitch:0,ms:11000},
  wall:{dungeon:22,cliff:12,town:14},water:-3,deep:-14,fogStart:1.15,fogEnd:2.7,xray:{out:26,dun:40},actMin:{out:.62,dun:.58},heroLight:120,shaft:.09,
  dof:{shift:.06,band:.24,ramp:.5,max:.7},bloom:{thr:.86,med:.5,high:.55},
  tiers:{medium:{px:1,pxMax:2,blur:2,lmap:128,bloom:1,dof:1,shafts:1,every:2},high:{px:1,pxMax:3,blur:2,lmap:192,bloom:2,dof:1,shafts:1}},lmMax:96,lightK:.8,chunk:8,
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
    snow:{amb:1.04,sun:.6,fog:[.88,.93,1],fogA:.25,sat:.9,shaft:.4},blizzard:{amb:1,sun:.3,fog:[.92,.95,1],fogA:.55,sat:.8,shaft:0,fogN:.55},fog:{amb:.95,sun:.45,fog:[.8,.83,.88],fogA:.55,sat:.85,shaft:.2,fogN:.3},
    gale:{amb:1,sun:.9,shaft:.6},sand:{amb:.95,sun:.7,fog:[.86,.72,.5],fogA:.4,sat:.95,shaft:.5,fogN:.65},heat:{amb:1.04,sun:1.15,fog:[1,.82,.62],fogA:.15,warm:1},
    ashfall:{amb:.8,sun:.45,fog:[.45,.38,.36],fogA:.35,sat:.8,shaft:.3},aurora:{amb:.95,sun:.8,fog:[.3,.6,.55],fogA:.12},starfall:{amb:.95,sun:.9,fog:[.3,.3,.5],fogA:.1},
    bloodmoon:{amb:.8,sun:.5,fog:[.5,.1,.12],fogA:.3,warm:1,shaft:0},eclipse:{amb:.6,sun:.1,fog:[.1,.1,.2],fogA:.3,shaft:0},meteor:{amb:.9,sun:.8}}};
// v0.5.8 sprites in the scene (world): sc = billboard scale (1 = the 2D view's size; 2/3 puts a hero at about 1.5 tiles, one pixel per 3x3 texels of the HD bitmap), drawn from a
// copy shrunk on the CPU to the GL pixel grid (crisp, one texel per pixel); sat and con soften the raw sprite colours before the grade;
// spread: how far to each side the light map is read (px), so a lamp on one side lights that side; rim: key light rim strength;
// act: the least light a character gets (outdoors at night, in dungeons), added in the ambient's colour; shadow: contact shadow
// [width as a share of the sprite, depth as a share of the width, core darkness, soft darkness, offset away from the key light px].
HD2D.spr={sc:2/3,sat:.86,con:.9,spread:9,rim:.75,act:{out:.3,dun:.34},shadow:[.8,.55,.36,.3,1.6]};
// v0.6.3 battle screen (battle3.js, battle3.css)
// B3: the stage label layout, in logical stage px (the stage is drawn at BL.sc CSS px per px). body: margin kept around each sprite's
// visible pixels; pad: gap between labels; R: how far a label may move from its spot (step: search grid); barW: HP bar widths;
// prim: primed badge size; sti/stiH: one status icon; tagF: font of the target tag, tagN: longest name on it, tagR: how far it looks first
// (it stays close to its unit, shorter without the name if it must); fxRise: how far an effect text drifts up; minSc: the smallest
// scale of the wide stage (it shrinks toward it so the commands fit under it); sideCol: width kept for the command column on landscape phones;
// memo: ms the canvas reuses the last layout before checking whether anything changed. v0.7.6: wideMin / wideStep: the smallest scale and the
// step of the wide stage when it is sized from the columns under it (1.35 keeps it at least 210 px tall on the Fold open at 933x705).
// slots: where units stand, [x share of the stage, depth 0..1 on the ground band (BATTLE_GROUND top..bot)], for the tall (portrait)
// and the wide stage; e[n-1] for n foes, boss[n-1] for boss fights, p for the three heroes on the field.
const B3={body:1,pad:1,R:40,step:2,barW:{hero:24,foe:30},prim:13,sti:12,stiH:10,tagF:5,tagN:13,tagR:28,fxRise:3,minSc:1.5,wideMin:1.35,wideStep:.05,sideCol:360,memo:40,
  slots:{
    tall:{p:[[.72,0],[.89,.42],[.71,.84]],
      e:[[[.27,.5]],[[.22,.05],[.36,.8]],[[.33,0],[.12,.42],[.4,.84]],[[.34,0],[.1,.28],[.47,.5],[.2,.84]],[[.34,0],[.1,.22],[.52,.36],[.3,.6],[.09,.84]]],
      boss:[[[.27,.62]],[[.24,.75],[.48,.05]],[[.22,.7],[.47,0],[.5,.84]]]},
    wide:{p:[[.74,0],[.88,.42],[.71,.84]],
      e:[[[.27,.5]],[[.2,.08],[.36,.8]],[[.3,0],[.12,.42],[.4,.84]],[[.31,0],[.1,.28],[.46,.5],[.22,.84]],[[.3,0],[.09,.22],[.5,.36],[.28,.6],[.08,.84]]],
      boss:[[[.25,.62]],[[.22,.75],[.44,.05]],[[.2,.7],[.42,0],[.46,.84]]]}}};

// ==== 9. Twists: the Daily Trial weekly twist and New Game+ modifiers ====
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

// ==== NUDGE (v0.9.5): lead players into the systems (prog2.js, results.js, onboard.js, goals.js; docs/v095-nudges.md) ====
// Nothing here runs in the Daily Trial.
// Manual bonus: the economy is unchanged. An auto win still pays AUTO_REW of a hand played win; the rewards screen now counts from the
// auto level up, so a win you play yourself shows "+X% for playing it yourself" with X = 1/AUTO_REW - 1 (52% at .66).
// sys: a small bonus on a win's XP and gold for each system used in that battle (once each per battle), capped at cap per battle.
//   react: a hero set off a reaction; brk: a foe's shield broke; guard: a guarded hero took a telegraphed hit (Crushing Charge,
//   Cataclysm); surge: Momentum reached a Surge; tame: a creature was tamed on the rewards screen. Auto wins earn them too.
// autoKills: auto battle opens against a foe type once it has been beaten by hand this many times this journey (or scanned).
//   A fight allows auto when every foe type in it is open. Bosses keep their own rule (win that fight by hand once).
// goals: the "Next goals" panel in the world. max items shown (one story goal and up to max-1 system goals); a done goal pays
//   gold[realm] gold and xp x the XP to the next level to every party hero (fallen ones too), plus the goal's item if it has one.
const NUDGE={on:true,
  sys:{react:.04,brk:.04,guard:.04,surge:.04,tame:.04,cap:.20},
  autoKills:3,
  goals:{on:true,max:4,gold:[40,80,130,180,240],xp:.03}};
