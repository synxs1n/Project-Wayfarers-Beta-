# Handoff after 0.10.8 to 0.11.1

Shipped to main (CI "Build and release" green for 0.11.0; 0.11.1 pushed): 0.10.8 quick fixes, 0.10.9 reactions/purpose tags/sneak/field skills,
0.11.0 Sell junk/Echo respawn/Echo Rift gates, 0.11.1 Dens, sites by thirds, completion marks. Owner said "push all" during the pass, so
0.10.8 to 0.11.0 went out together before their full test groups finished.

## What changed where
- 0.10.8: battle5.js b5Icon draws the unknown "?" as an svg (B5Q; the 7px text glyph blanked under text scaling and left an empty box);
  guild7.js g7OnBoard + boardState (board "!" = this town's acceptable notices or a claimable quest); items.js tier 4 is "Heroic", Elixir tier 3;
  tiers.js craftOnly needs a recipe (recipeOuts); skills.js skHitsFoe: roles only on foe-targeting moves (Bard support combos were Detonators);
  sigskills.js warriors keep Rend's Bleed under the element rider; recruit3.js rows show elements; ui.js mMenu party note outside town;
  ui.js no detList in the skill menu; roleTag full text with Settings > Skill tags (META.cfg.skTags 'sym').
- 0.10.9: data.js REACT = 28 sorted pairs, REACT_V both orientations, reactKey sorted, reactFor via REACT_V; ui.js skPurpose/purposeTag
  (inside roleTag, so battle list, sheet and learn notice); p2world.js "Sneak attack!" banner, Unaware floats, first-time log line
  (META.cfg.sneakSeen); field9.js travel skills (FLD9, G.fsx).
- 0.11.0: junk9.js (junkList, keep lock G.keepG, junk confirm popup); echo2.js storyEchoUp no longer needs !echoStory, a win calls echoHold
  (respawn after leaving); sanctum.js gates: Scourges north row, Calamities crimson south row, locks, portalLockWhy.
- 0.11.1: siteHasMini true for 'k' ids; CAVE_NAMES "... Den"; realms.js newRun sets G.run.lay3=1 (lay3On) -> world4.js placeCaveMouth first
  third, sites.js placeFort middle third, worldgen.js lair final third; complete9.js (denDone, fortDoneS, lairDone, REALM_DONE,
  realmProgress, checkmarks via mapMarks/drawMarks wrappers, world map in map.js, bigmap.js; Journey tab "Realms" rows).

## Tests
- New: tools/chrome/v109a.js (reactions, purpose tags, field skills), v110a.js (Sell junk, Echo respawn). Not yet added to runall GROUPS.
- Updated to the new design: v063bc (no detonation list in the skill menu), v095na (Lore lists all 28), v050p2b (Sneak attack! banner).
- Pre-existing failures (same on 0.10.7): v063ba and v070ib (label overlaps in a few seeds). Flaky under load: v050p1d, v070m1 (pass alone).
- tools/dunaudit.js is stale (does not load world4.js: buildDungeon3 undefined) on any build. gatetest/worldtest pass (need a tools/v3 symlink).
- Not yet run after 0.10.9+: world, menus, party, saves groups; fullsim (reactions changed m for reverse pairs, so balance shifts a little).

## Next: Phase 5 realm identity (approved table in the chat: 5 new tilesets forest, marsh, volcanic, desert, mountain)
Step 1 tilesets, step 2 town layouts. Old journeys keep their layout tileset (store a theme version on G.run, like lay3).

## 0.11.2 Phase 5 step 1 (realm looks) done
- look9.js (last in MODS): LOOK9 per realm key (palette, tree sprite, terrain density, base override); lookOn() = G.run.tv===2 (newRun), never in the
  Daily Trial; lookSync sets Ironroot's layout tileset to heights for new journeys; realmVariant adds '~v2' variants; objCanvas trees/bushes use
  the map's look variant (drawObjects passes the base theme); look9Terrain converts grass only where all eight neighbours are open grass.
- worldgfx.js new tree kinds: canopy, fir, dead, cactus, basalt.
- Not done yet from the approved table: per-realm weather tables, music moods, monster pool variants, town layouts (step 2).

## 0.11.3 and the test pass after it
- 0.11.3: look9 terrain only inside 7x7 open grass (keeps pathguard rooms/corridors); look variant ids use '%v2' (a '~' marks a boss overlay).
- Groups run on 0.11.2/0.11.3: battle, menus, party, world. Everything that fails also fails on 0.10.7:
  battle v063ba, v070ib (label overlaps), v050p1d (flaky in the runner); menus/party v043c, v050p4, v063m2, v072a, v077a, v095m1 (written for the
  pre-0.10.6 board with Guilds and Arena tabs, never updated), v063pb (camp equip). Not run yet: saves, audio, title, app.
- Sims: SEED=1 fullsim stage1 careful 97%, auto 92%; xp catch up unchanged.
- Next: Phase 5 step 2 (town layouts per realm), realm weather tables, music moods, monster variants; update the six stale board tests.

## Owner feedback batch 2 (after 0.11.3), grouped into phases
P1 0.11.4 quick fixes: clicking the minimap opens the area map (remove its button), minimap flush top right; remove the boss HP bar at the top;
  Tavern: Pork Chop sandwiches at the top of the hire list (one menu); Alchemy lists potions, then charms; Pork Chop first in the Backpack;
  battle Lore -> Guide (battle system summary + link to the full Guides); Expert battle info shows every weakness/resistance (not 2 each);
  timed hits ON by default, a tap anywhere counts (no stray clicks), find abilities that fire without the ring; Auto can be pressed mid-action;
  Inn: confirm when already full, bond scenes can trigger on rest; Tents trigger camp; Training team button reshuffles;
  REVERT the Echo respawn (owner prefers the old once-only Echo); site names keep the originals with a tag shown on first entry only
  ("Den: Rimewood Grotto", "Lair: ..."); Tidegrave lighthouse is flat; Nikaris legend quest missing from the board when a code was entered before start.
P2 0.11.5 party and gear: Build Party balances elements; Fresh mix stays balanced but favours heroes not used recently; Equip best by main role
  with stable tie-breaks, includes charms (and pets); companions become Pets, shown and equipped in the Equipment menu, part of Equip party;
  Smithy "Upgrade whole party" buys, forges and tempers toward the best final stats (max forge per piece); same for the charm shop.
P3 0.11.6 quests and guidance: hand in where you got it (realm quests and bounties at that town's board, guild missions at any Guild Hall);
  map markers for bounties, rival missions and hand-in points; Guild Hall "!" marker; Next goals shows the main quest plus the nearest
  quests, tap to expand into a step-by-step guide; hint pacing (spread out, early hints on core mechanics) and a Hint log (sort by time/type);
  guilds back to 5 ranks.
P4 0.11.7 world: roamers slightly stronger than random encounters; no weather in lairs and Dens (Sanctums only, some open to the sky);
  Sanctums look like sacred places on the field; guardians Scourge-sized, unique and visible in their Sanctum (Monk summon stays small);
  quest board and waystone near but not on top of each other, no anvils blocking the board; buildings hiding town exits;
  more varied chest and battle loot (bandage, tent, ash).
P5 0.11.8+ realms: realm order rises in fantasy with the most intricate final towns; town layouts per realm; bond system expansion.

### Owner decisions on batch 2
- Hand-in: quests accepted before the update can still be claimed anywhere (flag on the quest at accept time); new ones follow the new rule.
- Guilds: 5 ranks over the same mission count, one perk per rank; saves map their progress onto the matching rank.
- Realm order: tiered draw for new journeys. Tier 1 thistle, orchard, strand, lakes; tier 2 mire, grotto, tundra, peaks;
  tier 3 deeps, mines, glacier, mesa. Realms 1-2 from tiers 1-2, realms 3-4 from tiers 2-3, random within tiers.
- Bonds: NO bond levels. Yes to more bond pairs, more scenes (camp, inn, after big fights), more bond techs, a Bonds screen.

## 0.11.4 = batch 2 P1 done
- map.js/visuals7.js/style.css minimap tap opens the map, flush top right; battleui.js boss bar hidden; battle3.js b9Chips shows all;
  ui.js + ailments.js Guide (battleguide popup, guideFull opens menu charts, guideLore old lore); menus3.js Tavern one screen;
  ui.js Backpack porkchop first; party3.js Training team reshuffles (p6Train jitter); town2.js innSure/innTalk; v063prog.js tents camp (campItem);
  echo2.js respawn reverted; complete9.js siteKind first-entry tag (G.siteTag); hd2d.js lighthouse 'keep'; legends.js legMiss guarantee;
  battle5.js timed hits default on (window.__PWTEST keeps them off in tools/chrome/pw.js and tools/fullsim.js), click eater, chain ring,
  Auto/Pause/Speed on pointerdown while not in cmd mode.
- Alchemy order was already potions then charms (the owner may have meant side by side; ask if it comes back).
- Next: P2 (party and gear), then P3, P4, P5 as listed above.

## Owner feedback batch 3 (after 0.11.6)
- Lighthouse in Tidegrave rendered as a striped box with the top cut (the 'keep' box cuts the tall sprite); needs its own tall tower shape.
- Massive sprite quality pass: overworld and battle sprites, animation and effects; skill effects when they go off; everything more distinct;
  wayfarers unique beyond class and element; better boss designs and animations.
- Reorganize the battle screen and menus by logic.
- Single target preview is cut off when targeting one foe among many.
- Toggle: skills with only one possible target fire at once (option).
- Party MP visible in the battle window.
- Guard cue only when the hero is about to be hit (not when the hero acts twice before the foe).
- A successful guard grants some Limit gauge.
- Purple (epic) card border without the Epic tag on some heroes; not every dual type is epic, some single types are (never starters).
- Guild recruits: 5 of a possible 15 per playthrough, one unlocked per town.

## 0.11.8 (in progress at the time of writing)
- config.js BP6 el .3, elDup .2, rest .6; party3.js p6Score element dup penalty and Fresh mix recency (c.lastB set in engine.js finishBattle, saved in packG)
- equip.js ROLE_W/roleW blend into loadoutScore; equip2.js planGear sorted ids and stable tie-break
- p3shop.js p3Chain + p3SmithPlan(slots) temper chains, p3SmithRun tempers in the pack, ACT.p3Alch (charms) + Alchemy button in menus3.js m3CharmBtn
- chain5.js guarded hit -> lbAdd(G5.lb=12); battle5.js/chain5.js Guard cue skips stunned foes
- heroes.js EPIC_IDS (helper), progression.js G.run.gpick 5 of the 14 CHALL recruits, one per town (helper)
- battleui.js/battle3.js: party MP on cards, single target preview fit, Settings "Single target skills: Ask / Fire at once" (META.cfg.autoOne) (helper)

## 0.11.9 (in progress)
- handin9.js: quests/bounties accepted from now on carry hand:'board' and claim only at their realm's Notice Board (canHandIn, atBoardOf);
  bounty rewards wait at the board (state 'ready', ACT.bountyClaim, Ready section); win hook takes the reward back out; boardState
  redefined here; far markers for active quest targets (mapMarks far:1); world map town label " · hand in!". Test v119a.
- guidance9.js: guildState + Guild Hall marker (2D townDecorActors wrap, HD hdActors wrap); quest goals in Next goals (glList wrap) with
  goal rows -> ACT.goalGuide popup (type 'goalguide'); hint pacing (obGap/obPickNext used by onboard.js obTick, OB_CORE first early) and
  META.tipLog + Hint log popup (type 'hintlog', Settings Tips row button, Log button on the tip card). Test v119b.
- Helpers (in flight at the time of writing): factions.js 5 ranks + guild mission hand-in at a Guild Hall + the six stale board tests;
  world: mapIndoor (no weather in lairs/Dens, open Sanctums), ROAM.boost, loot variety (bandage/tent/ash), board/waystone spacing.

## 0.12.0 (in progress)
- bonds9.js: 15 new pairs (BONDS9), after-the-battle lines for the 19 old pairs (BONDS9_BOSS), scenes camp/inn (lv 2) and boss (lv 3),
  ctxOffer at campMake / ACT.rest / win (boss), G.ctxTalks once-only, readyTalks wrap (talkArg is a const: never reassign it), ACT.bondTalk
  'k:lv:ctx' args, vBonds -> vBondsAll (every pair, next unlock, scene buttons). Test v120a (party group).
- Helpers in flight: Pets (companions renamed, Pet row in the Equipment menu, Equip party pairs pets); Sanctum shrine look + guardians visible,
  Scourge-sized and unique per journey + town exits kept clear.
- Still open from batch 3: sprite/animation/effects quality pass (big), battle screen and menu reorganization (big), tests for the new world
  rules in battle (weather in an open Sanctum battle, hdstage/hd2d indoor checks).

## Shipped since: 0.12.0 bonds + Pets, 0.12.1 hint queue order, 0.12.2 Camp Supplies fix (the Tent branch in v063prog useTravel skipped items with camp:1)
## Plan for the two big batch 3 items (not started)
1. Sprite and effects quality pass (several bumps): (a) hero sprites: a second idle frame and a 2 frame walk per class/race in art2.js, per hero
   accents (hair, cape, weapon tint) read from TPL so wayfarers differ beyond class and element; (b) battle poses: anim.js adds cast, hit and
   guard poses per class; (c) skill effects: hdspell.js/gfx6battle.js per element projectile, burst and lingering particle with a shape per
   element (not just colour), and a screen flash for Limits; (d) boss art: art3.js 60x60 guardians get idle animation (breathing, glow pulse),
   bosses a telegraph pose. Keep SPRITE_HD fallbacks. Test with tools/chrome/iconsheet.js and rostersheet.js screenshots.
2. Battle screen and menu reorganization: group commands (Attack, Skills, Items, Guard first; Scan, Guide, Switch, Flee under a second row
   or a ... button on phones), hero cards on the right/bottom by layout, forecast bar above the stage, foe cards under it; menus: Party
   (party, roster, loadouts, pets), Gear (equipment, items, pouch), Quests (quests, guilds, bounties), Map, Records (journey, bestiary,
   guides), Settings. Update v063bd and the layout tests (v076b, v080b) to the new order.

## Shipped: 0.12.3 Sanctum shrine look, visible Scourge-sized unique guardians, clear town exits; 0.12.4 Bonds lock note. Live = 0.12.4, CI green.
Test state: menus+party on 0.11.9: 42 pass; the failures were fixed later (v070oa/ob, v063g, v095p3) or are old (v063pb, v080cb). Battle group
last run on 0.11.4 (v063ba, v070ib old label overlaps; v050p1d flaky). World group last run on 0.11.3. Worth a full battle+world run on 0.12.4.
Open: the sprite/effects pass and the battle screen/menu reorganization (plans above); HD-2D indoor checks for open Sanctums (hdstage.js
hbLook, hd2d.js hdLook, daylight.js, gfx6world.js still treat every dungeon as indoor); a 15th guild recruit if the owner wants 15.

## 0.12.6 menus regrouped (menus9.js: Party/Backpack/Quests/World/Records/Guides/Settings, Bonds tab); 0.12.7 (pending): phone battle layout puts
the hero cards above the commands (battle3.css m-tall order). Sprite pass helpers in flight: A hero accents + idle (art.js/art2.js/sprhd.js/anim.js),
B skill effect shapes per element + boss idle/telegraph (battle.js/anim.js/fx2.js/gfx6battle.js/hdspell.js/art3.js).

## 0.12.9 sprite and effects pass shipped
- art2.js "per-hero accents" section (hashS('acc:'+id); hair style/colour, skin shift, 1-2 accessories, weapon tint via palette keys v/x/y; wraps
  heroGridSide/heroGridView/heroPal/drawFlair/backItemsFB/weaponFB and WPN draws; legends, Vaelith, mounts untouched).
- anim.js appended: anElem (8 element shapes), anPhys (by attacker pose), heal/buff/debuff marks, Limit flash (BV.flash, ANX.tint under reduced
  motion), bossTele (charge status or B.b4g pending); battle.js drawUnit: boss idle frames (art3.js bossHasIdle/bossIdle), telegraph swell/glow;
  hdspell.js hbsHit calls anElem(...,lit=1) for the HD extras. Effects use Math.random like burstAt (no battle logic touched).
- Known sprite caveat: an eyepatch strap shows across the back of a hooded head (Hollis). Hair/cape sway not done (needs a second sprite variant in battle.js).
- v080b: re-running against the new phone layout with the updated rule (cards above commands, action rows on screen). The full battle group has not
  run since 0.11.4; run `runall.js battle` then `world` on 0.12.9 next.

## 0.12.10 to 0.12.12
- 0.12.10 battle.js layoutBattle tall: wrap height = canvas + 8 (border-box frame): B3EB is 0 again, labels have the bottom strip back.
- 0.12.11/12 factions.js: rank 1 perks for wardens/archive/hand are inn 3% (were XP +1% at zero standing, which moved every fight's XP; v095na caught it).
- Battle group on 0.12.10: 31 pass; v063ba old; v070m1 and v080b flaky under load (rerun alone pending). Everything the owner listed in batches 1 to 3
  is shipped except: hair/cape sway on hero sprites (needs a second sprite variant in battle.js), HD physical-hit shapes were only seen at their tail.

## Owner feedback batch 4 (after 0.12.12), grouped
P1 quick/UI: phones: REVERT cards-above-commands; action menu takes the bottom half, info (cards, foes) below it, scrollable; fix the scroll bug in the
  battle skills list (cannot scroll to the end); Invoke and Summon become one command; action menu organization/split pass; World menu group -> "Map"
  (area map with a world map button); Records opens on the 100% realm tracker, account stats under Journey; dual element strip colours on single types
  too; "!" over NPCs who have a quest when talked to; bond menus only show bonds workable with heroes you have; unique tame names (no "X the old" repeats).
P2 shops/rift: Upgrade whole party must temper to the highest forge level and the per-slot "best upgrade" should be empty after it unless it is a good
  upgrade you could not afford (then show the goal: gold and materials needed, clickable in "Out of reach"); same for charms; charms rarer than Rare should
  drop/sell; guild shop section listing every unlocked counter + an Arena guild; Echoforge only inside the Echo Rift; Rift: beaten echo gates glow,
  Calamity gates look different and sit apart, a rest option at the Riftkeeper, Riftkeeper = ultimate final boss after all echoes are beaten.
P3 world/content: arena only from the Guild Hall and the main gold/rare-material farm by tier; Lore = world book (history, customs, per realm visited);
  healing on undead stronger than normal skills most of the time; skills menu filters (heal, prime, ranged, blunt...); graphics sweep for smoother look.
P4 big design: battle rebalance (roles: 1 main + 2 sub per hero, supported by skills, natures, equipment; stats rework incl. faith scaling for e.g. monk
  and invoke strength; 3 weapon types per class; RPS slash/blunt/piercing back instead of "physical"; swarms resist single target; role switching in the
  party menu drives suggested gear and auto stats; subrole skills weaker than primary); 20 Scourges (one a swarm) and a 5th Calamity.
### Owner decisions on batch 4 (all approved as proposed)
- Roles: 8 roles {Striker, Marksman, Caster, Guardian, Healer, Support, Saboteur, Summoner}; 1 main + 2 sub per hero by class (Warrior Str/Gua/Sab, Knight
  Gua/Str/Sup, Archer Mar/Sab/Str, Thief Sab/Str/Mar, Monk Str/Hea/Sup, Mage Cas/Sab/Sup, Priest Hea/Sum/Sup, Bard Sup/Cas/Hea); main role swappable in
  the Party menu in town; natures and gear tilt sub roles; sub role skills ~80%; 3 weapon types per class follow the 3 roles; one free stat reset for old saves.
- Stats: STR slash/blunt/piercing (+HP a little), DEX ranged+crit, INT magic, FAITH healing/Invoke/Summon/light+shadow dmg/ailment resist (Monk, Priest),
  VIT HP+phys def, SPIRIT MP+magic res, AGI speed+evasion. Damage kinds slash/blunt/piercing/ranged/magic; RPS per archetype (armored weak blunt, resists
  slash/piercing; swarm resists single target, weak to area; flyers weak to ranged).
- Bosses: Scourges The Locust Choir (swarm, wind/earth), Ironmaw Tortoise (armored, earth/water), Candleking Moth (fire/light flyer), Brinehag Matriarch
  (water/shadow summoner); 5th Calamity The Hollow Sun (light/fire) with realm The Ashglass Reach (scorched salt flat).
- Riftkeeper: opens when every Rift gate is beaten; 3 phases (element cycle; two Echo shades; 3-turn Unmaking, break the shield); lv 60, no auto; rewards
  Riftkeeper charm, title Riftwalker, NG+ Rift modifier; free rest at its shrine.

### Owner (after batch 4): DEEP SPRITE OVERHAUL. All sprites (heroes, NPCs, foes, bosses) clean, cool, distinct, interesting, fitting the world;
massive presentation and animation upgrade; characters move in skill-specific ways. Rework as needed. Plan: a written style guide
(docs/art-style.md: 4-shade ramps, one light direction, 1px dark outline, silhouettes per class/archetype, proportions), then rebuild in order:
hero bases per class+race (art2.js) with pose set {idle, walk, swing, thrust, shoot, cast, pray, guard, hit, down}; foes by archetype (art.js MART)
with idle+attack+hit; bosses (art3.js) with idle, telegraph, attack; townsfolk (npc2/villagerLook). Verify every step with sheets.

## 0.13.3 (was going to be 0.12.13; the owner: after .9 the middle digit bumps, so 0.12.10..12 = 0.13.0..2) shipped from this session: batch 4 P1 + P2 (part), Riftkeeper, foe sprite family 1, tents
- menus9 (Map group, Records opens on Realms, Journey holds the account stats), complete9 vRealms, element strips everywhere (nav.js .elstrip),
  bonds9 filtered to recruited pairs, p3shop chains + "What I need" (ACT.p3Need, popup p3need, SMITH_PLAN.minPct .03), battle9 one Summon
  command (sumChoices / ACT.sumOne), battle3.css commands-first on phones + single scroller for the skills list, npcmark9 "!" markers,
  comp.js unique tame names (TAME_EPI), rift9 (Echoforge anvil key '__forge' in the Sanctum, efTabOn only inside the Rift, won glow, Calamity arch),
  riftkeeper9 (gate at 13,4 key '__riftkeeper', RKC tunables, META.riftkeeper, c_riftkeeper, title riftwalker, TWISTS.ng rift modifier from twists.js,
  ACT.riftRest on the Echo Warden; test hooks window.__RK), foes.js RIFTKEEPER (bossClass 'Ultimate', guardianDef('riftkeeper')), art3 rkArt + 9 sprites.
- Sprite frame API (art helper 1): MART arts may take (g,f) with f={t:'idle'|'atk'|'hit',i:0|1}; monCanvas(art,f) caches per frame ('art#ti');
  MFR global + mfr(f) for wrappers; .fr marks framed arts (56); battle.js foeFrame() (hit 180 ms from hitT+IMPACT, atk 60..380 ms into an action,
  idle alternates every 700 ms; reduced motion freezes idle 0); redrawn mossling, dewtoad, cinderpup, frostwolf, crawler, shellguard, magmaslime,
  gnatswarm (monsters2.js); realms.js SHP shape library + SHAPE_OF + shapeWrap (variants get a shape, not a recolour); sprhd.js/sites.js pass f.
  Sheets: node tools/chrome/sheets.js <html> <out.png> foes (CHUNK, ONLY=a,b, ZOOM). Weak spots to revisit: crawler claws same blue as body,
  magmaslime eyes.
- Tents: worldgfx.js drawTent is a shaded cone (lit left, shade right, N panels with seams, hem sag, guy ropes, base shadow); the small camp tent
  object got a lit face and hem; hd2d.js hdTentCone builds 18 textured slices (hd2dgl.js H2Batch.quad4 = per-corner UVs) instead of a card.
- Tests: sanct counts gates without the anvil and the Riftkeeper gate; v080b back on the commands-first rule.
### Still open from batch 4 (next): guild shop section listing every unlocked counter + an Arena guild; charms rarer than Rare drop/sell; arena only
from the Guild Hall and tiered as the gold/rare-mat farm; Lore world book per realm; undead healing stronger; skills menu filters; graphics sweep;
P4 rebalance (roles/sub roles, FAITH, 3 weapon types, RPS, swarms, subrole 80%, one free stat reset); 4 Scourges + 5th Calamity + The Ashglass Reach.
Sprite overhaul next families: toads/gulls/hawks/bats/rays, wisps/jellies/wraiths, golems/husks/knights, then bosses, heroes (pose set), NPCs.

- Versioning rule (owner, 0.13.3): the last digit never passes 9; 0.12.9 -> 0.13.0. Party slot cards carry no element strip (only reserve minis and roster cards do).

## 0.13.4 to 0.13.6 (this session, owner asleep: "push through all changes")
- 0.13.4 arena9.js: arena enterable only from the Guild Hall (Menu tab reads), ARENA rewards raised + ARENA9_RARE tiered purse on every win (win hook),
  the Pit Masters guild (FAC 'pit', standing 8+6*tier per win, perks agold/amat/stock/charm c_fa6/sig c_fb6, FSTOCK.pit, FMIS p1..p5, facDerived
  'arena'/'arenaHi'), vGuildShop() section before "Ranks and perks" on the Guilds tab. Tests: v134a; v041p65/v095m2/v077a now expect 7 guilds; v095m1 arena.
- 0.13.5 charms9.js (c_ep0..5 Epic tier 3, c_hr0..3 Heroic tier 4; shopStock charms from stage 2/4; RECIPES t:1/t:2 since matTier caps at 2; genBounties
  re-rolls charm rewards from stage 2; win hook: Echo first fall 50% Heroic, arena tier 3/4 40%/30%), holy9.js (holyHit redefined: 135%/100%, cap 3.2,
  Light weakness x1.3), skillfilt9.js (SKF chips over the Skills list for 6+ skills, V.skF, ACT.skF), lore9.js (helper: LORE_WORLD 7 chapters, LORE_REALM
  16 + LORE_LEGACY 6, vLoreBook via nbMenuBody; g7Charts wrapped to carry overlayGuide, weather, superGuide). Tests v135a, v136a.
- 0.13.6 roles9.js: ROLE9 (names Striker/Marksman/Caster/Guardian/Healer/Support/Saboteur/Summoner over the old keys phys/ranged/magic/tank/healer/
  buffer/debuffer + 'summoner'), ROLES.cls per approved table, heroMain(c)/c.role (optional save field) with ACT.rolePick/roleSet/roleBack and a
  'rolepick' modal, known() returns cached copies of sub-role skills at pw x.85 (fx chance x.9, .sub=1), autoAlloc follows ROLE9.stat of the main role,
  FAITH: elBoost light/shadow +.003/pt (cap .25), S.fthRes shrug chance .006/pt (cap .35) in addSt, summons x(1+.008*fth) via sumFire/sumMake,
  ARCH.armored = blunt 1.25 / magic 1.1 / slash .6 / piercing .7 / ranged .6, foe cards split slash/blunt/piercing (DG_* extended, foeDg wrapped),
  respecCost 0 until G.rs9. Tests v137a; v080b/v095b armored expectations updated; v095p3 Echoforge expectation updated (tab never in town).
  Sprite family 2 (helper): gull, thunderhawk, cavebat, cloudray, tidewisp, brinejelly, ashwraith, eclipsewraith + 22 variant shapes (art.js FAMILY2
  block, monsters2.js, realms.js SHP/SHAPE_OF). Known stale/flaky: v040p2 (Auto settings swap toggle locator) fails on 0.13.5 too; v063ba label overlaps.
- Still open: 3 weapon types per class are only named per role (ROLE9.wpn) and not enforced; swarms resist single target (already in ARCH); 4 new Scourges
  + 5th Calamity + The Ashglass Reach; sprite families 3+ (golems/husks/knights incl. barrowbones, toads done, bosses, heroes pose set, NPCs); graphics sweep.
- 0.13.7 (helper): GUARDIANS +4 (locustchoir swarm wind/earth, ironmaw armored earth/water, candlemoth flying fire/light, brinehag water/shadow), FINALS +1
  (hollowsun light/fire), REALMS 'ashglass' cal:1 theme heights (Saltwick, The Glass Cathedral, dust), bosses9.js wires BOSS_TY, BOSS_GIM.def, native foes
  v_saltcrawler/v_glasswisp, D8_REALM/LOOK9; sanctum.js 2 rows of 8 Scourge gates + 5 Calamity arches (21 gates; Riftkeeper counts echoKeys()). Tests v138a;
  sanct 21 gates; v095p2 21 gimmicks; p4.js 21. Flaky: v095p2 "Guard halves a marked hit" (random roll).
- Running helpers after 0.13.7: sprite family 3 (golems/husks/knights/barrowbones) and heropose9.js (hero pose frames per skill kind: swing/thrust/smash/
  shoot/cast/pray/guard/cheer/hit/idle A-B, wired through spriteOf; sheets `poses` mode; test v139a).
- 0.13.8: heropose9.js (hero pose frames per skill kind, wired through spriteOf; `perform` wrapped to record u.actSk/actDl; sheets `poses` mode; test
  v139a), sprite family 3 (slaggolem, iceknight, huskguard, barrowbones + 9 variant shapes), balance: brinehag hp 5.0 mag 1.15 res 1.1 (was 8% to 42%
  careful win rate in `fullsim gim`), ironmaw up a notch (was 92 to 100%). Journey sim (v080cb) on 0.13.7 draws siren/frostlich/seraph with SEED=1 and
  shows 21 boss tries per journey (old bosses in hard slots; the draw changed with the bigger pool), so v080cb's pacing thresholds are not met on that
  seed. Not retuned further this session; revisit the slot scaling of Scourge multipliers (engine.js makeEnemy BOSS_HP by stage; power is flat).
  CI: the windows (Electron download) and android (gradle.org download) jobs timed out repeatedly on 0.13.7; the web job (the site) succeeded each time.
- 0.13.9: foe sprite family 4 (gustimp, snowharpy, yeti, stormling, gargoyle, voidspawn, stareater, mimic, drownedsailor, rimewight, galephantom + 22
  variant shapes; mimic.js MART.mimic removed). Every MON base art now has .fr.
- 0.14.0: npcart9.js (helper): villagerLook adds vill/role from the NPC's name (NPC9_ACT maps act kinds), heroPal mutes cloth 50%, weaponFB/raceSide
  finishing pass draws role garments + props + lit/shade split, walkerCanvas frame 3 = idle B (world clock floor(now/700+hx)%2), drawSprite wrap cancels
  the old 1px hop for idle canvases; sheets `npcs` mode (ONLY, RND, ZOOM); test v140a (world group). CI: release.yml retries npm install, dist:win and
  gradlew (GitHub release/gradle.org downloads 504'd for an hour on 2026-11-09).
- Versioning: 0.13.9 -> 0.14.0 (last digit never passes 9).

## Owner batch 5 (2026-11-09 morning) and 0.14.1
Batch 5: (1) NPC behind a Sanctum gatehouse unreachable; (2) Sanctums should look sacred, outside and inside; (3) Dens: no chest-triggered boss, the
miniboss waits at the end; (4) boss sprites redesigned from the ground up (Thornback, Drake worst); (5) 20 Scourges + 5 Calamities; (6) hero features
too common (eye patches); (7) animations should match the skill (Water Storm Song too small; spin on all-foe physical; more tells); (8) endgame area
after the Calamity with foes from every visited realm, the place to farm to level 50.
- 0.14.1 (mine): fixes10.js (dynActors relocates actors off solid/site-mouth tiles; mini actor type 'elite' with .mini at miniSpot(m) = guardAt or
  the tile below the prize; sanctGuard() returns null; actorTalk -> modal 'miniask' -> ACT.miniGo; askBoss in a den asks the mini; openChest refuses
  the prize while miniPending; accOf trims eye patches to 1 in 5 carriers, a third of scarves/earrings), endgame10.js (BREACH 'x0': getMap wrap builds
  f4 from seed+424242 and relabels; gates -> last town; Waystone row when G.won; encounterFoes before-hook: union pool of visited realms, lv partyHi+2
  capped 50, hpM 1.3 powM 1.15, elite 20%; roamers remapped; win hook: gold +60% +20+3*lv, 50% rare mat, 8% Epic/Heroic charm), anim10.js (spin via
  rotated spriteOf canvases for all-foe phys skills, onAction wrap adds rays/rings/bolts/slashes + BV.shake for big spells, rings+motes for party
  heals/buffs, triple rings for songs). Tests v141a (world group); v041p47 updated to the waiting-miniboss flow.
- Helpers running: boss sprite redesign (art3.js in place) and four more Scourges (foes.js/bosses10.js/art3.js append/sanctum gates 25).
- Still open from batch 5: (2) Sanctum look rework outside and inside.
- 0.14.2: four more Scourges (hollowshepherd earth/light plant veil; paleweaver ice/lightning beast slot; crowregent wind/shadow flying phase2;
  geysermatron fire/water jelly tide; bosses10.js wiring), 25 Sanctum gates (two Scourge rows y=1/y=3 x=2..10,16..24; Calamity row y=14 free on the
  floor; sanct.js checks no gate in the bottom 3 rows and no solid tile south of a gate), every boss sprite redrawn from scratch in art3.js
  (BOSSART-A toolkit bsh/btube/bT4; the six old art.js boss arts overridden from art3.js; bossFrame1 starts from frame B via monFramed/BART;
  an 'atk' roar pose exists but is not wired to the telegraph). Journey sim SEED=1 with the 25-boss pool: 12.9 boss tries, top level 41.3 sd 1.9.
  v141a's "chest opens after the miniboss" check flaked once under load; passes alone.
- 0.14.3 voidsky10.js (dark/stars realms: hdLook fog = T.cl[1], fogA >= .62; worldDraw after-hook twinkles stars over the band above the map).
- 0.14.4 sanctlook10.js (helper): shrine gate on the 3x2 U/E footprint (2D paint + HD geometry via hdGatePart/hdGateGeo wraps), inside palette variant
  'theme#fort%sanct' (pale stone + realm accent), prayer cloths, stained glass, cloister garden, columns, carpet to the rune circle, 'sanctmotes'
  ambience, D8M.sanct battle backdrop, MOODS.fort 62 bpm dorian + MTRACK.fort "Sanctum: Still Hours". Test v142a (world group). Weak spots: HD
  windows follow tile-hash variants; no real pool (layout untouched); boss stage keeps red banners; pale stone a bit hot by lanterns in HD.
Batch 5 is complete with 0.14.4.
- 0.14.5 menu group tabs 4+3 on phones (style.css). 0.14.6 equipbtn10.js (Equip beside Sheet on party cards -> Backpack > Equipment, row
  data-hero + eqfocus via V.eqFocus; test v143a). 0.14.7 hero pass one (helper): heroTone shading pass in art2.js, heroPalD keys (p j z k q l h c 9),
  faces/necks/knees/quivers/weapon edges in art.js tables, heropose9 recipes updated, sheets `heroes` mode; v140a hash re-taken. Geometry unchanged
  (pose markers '#'/'!' and npcart9 props still valid). Owner wants a boss-level leap for heroes: pass two must re-proportion the rig.
- 0.14.8 equipbtn10.js: card buttons are a grid row under .swm (no overlay on the Fold), stack under 480px; pet slot is one .eqs button (petPick;
  the picker has Remove); .eqrow wraps so Auto is not cut on phones. v143a updated. KNOWN STALE: v063pb (camp equip from the pack via __P6.autoCamp)
  fails on 0.14.6 too (camp heroes get no gear, companions moved); predates this session's menu work; investigate separately.
- 0.14.9 hero rig pass two (helper): 40x56 canvas, ~6.3 heads, rigSide/rigFB in art.js with the hsh 3-tone shader, HP.body[b]={S,H,slv,hand},
  toTall/stretchHero pass-through, applySize refit; heropose9 anchors scaled (HPS_K/HPS_W 1.3), npcart9 anchors front (11,32) back (28,32) side (26,29);
  legends.js mount/pet canvases resized; portrait crop .port img 93x130 at -25,0 (style.css 291/294). v080b proportion rule relaxed 1.1x -> 1.2x
  (heroes 45 px vs 38 px foes). Weak spots per helper: monk side torso thin, Kaevan small on the horse, knights/warriors a little blotchy.
- 0.15.0 compact overworld rig (helper): 28x40 canvas at scale 0.7 via HRS/rigScale and scale-aware PG methods; walkerCanvas wrapped at the end of
  sprhd.js (compact keys end in '|c'; 'big:' keys get the big rig, title7 uses it); npcart9 npcShift scales; v140a hash re-taken. v071wt (minimap tap
  walks) fails 15 checks on pre-rig builds too: stale, investigate separately. Versioning: 0.14.9 -> 0.15.0.

## Owner batch 6 (2026-11-09) and 0.15.1
Batch 6: (1) den entrances themed per interior; (2) Sanctum entrance less gate-like, interior symmetric with a straight shot to the guardian,
oriented by the entrance facing; (3) dungeon entrances themed per realm (not tents); (4) battle heroes a bit big, overworld walkers lost detail;
(5) the Breach walkable from the Calamity field's last gate; (6) Echo Warden = Riftkeeper in both forms, Rift Echoes lv 55, he vanishes when all
gates are beaten, cutscene on entering the gate, returns with a new look, rematch via the gate.
- 0.15.1 (mine): scale10.js (HB10 flag during spriteOf -> heroCanvas at rigScale .85; walkers .8 in sprhd.js key '|c8'; rigScale H=round(56f)),
  rk10.js (RK10; riftSpec lv 55; buildSanctum renames the NPC, isRK; worldDraw before-hook hides him while rkUnlocked && !META.riftkeeper and
  swaps look2 after; vModal xform renames rest popup/gate card and labels Rematch; interact wrap maps the name back for riftkeeper9's rest; ACT.rkFight
  wrap plays a 4-line say() scene once), endgame10.js breachLinkField (f4 gateOut exit -> x0 g:'start'; f4.gates.breach; x0 start -> f4 g:'breach';
  sign). Tests v145a (world group); v140a hash 5bc61619.
- Helpers running: sitelook10.js (den mouths, lair facades, Sanctum gate per realm, 2D + HD) and the Sanctum interior rebuild (sites.js buildFort
  axial/symmetric/oriented + sanctlook10 adaptation, v142a extended).

## 0.15.2
- Sanctum interiors (sites.js buildFort/genFort, sanctlook10.js adapted): one symmetric 41x62 temple on a single axis, carpet from the door to the guardian, turned by the entrance facing (map fields fo/enterDir/exitAt). Test v142a extended.
- Site entrances (sitelook10.js, new, last in MODS): den mouths per realm preview the interior palette; lair fronts per realm (plus Calamity realms) with a lit cleared variant; Sanctum shrine approach with realm guardians. Fixes an HD bug where sanctlook10's hdGateGeo caught the lair mound. Lair mound heights scaled to .32. Test v144a (world group).
- Weak spots: lair fronts are upright cards whatever the door faces; dungeon8 torch/bone extras still sit beside the new doors; 2D view clipped at top far from the gate.

## 0.15.3
- worldzoom10.js: HD2D.zoom x1.2; hdChar wrapped so characters (default sc) are placed at spr.sc/1.2 and sampled with HD.px doubled (2 texels per art px). Net: world 20% bigger on screen, characters unchanged on screen, about door high. Flat 2D view untouched (integer grid). HD.chH in a town fell 40.5 -> 33.3 world px at the same screen size.

## 0.15.4
- battle3.js b3PlateGeo/unitHud: heroes with mmp>0 get `mp` in the plate geometry (bkH +3) and a 1px blue MP bar under the HP bar; limit bar and shield pips shift down by 3. `_plate.by` keeps the HP row.
- breach10.js (new, after worldzoom10): outer HOOK.wrap('getMap') builds 'x0' as islands in the void sea (84x44): landing west with the 3-wide gate back to f4 ('breach' gate), hub with Waystone 'W' at (42,19) in a ring of 'N' stones and 'P' crystals, five outer islands with a LANDMARKS stamp each from the visited realms' themes (no chests), bridges 'B'. mapIssues 0, placeNodes + tone set. endgame10's own x0 wrap is now never reached (dead).
- Tests: v141a exits expectation now 'f4'; v080b tooltip regex accepts the damage-kind names (pre-existing since 0.13.6), label clearance tolerance 8% (taller hero plates). v080b "mini battle start: the stage keeps its size" fails on a different size each run (705x455, then 344x882) at low load: flaky timing, not the HUD.

## 0.15.5
- portrait10.js: portraitCanvas(id) crops the full-size front walker ('big:' key) to a 24-logical-px square from the first painted row (hat) centred on the head; cvURL cache 'pt10:'+id+lookKey. ui.js port() uses it (class .pt10; monsters keep heroURL); style.css forces .port.pt10 img to fill the box. Note: an HD canvas's drawImage takes SOURCE coords in logical px (sprhd patch multiplies by k).
- breach10.js: islands mostly grass (d>.3, 82%); breachTurn(m) rotates the canonical west-landing Breach by quarter turns so the landing is opposite the walk direction through f4's seal (breachWalkDir from gateAt->gateOut); exits, gate, signs, free rotated; bld restamped.
- endgame10.js breachLinkField: the 'breach' gate's arrive is the gateAt tile facing back toward gateIn (was hard-coded one tile west, which on a turned field put you beside the road: the "can't re-enter" glitch).

## 0.15.6 (graphics sweep)
- worldzoom10.js: WZ10.k back to 1 (owner: the zoomed world looked worse); character cards still sampled at 2 texels per art px.
- sprhd.js walker wrapper rigScale .9 (key '|c9'), scale10.js SC10.battle .9. v145a expects 36x50 for both. HD town walker chH 43.7 at zoom 1.
- Gotcha repeated: a // comment appended to a line swallows the rest of the line (scale10 HB10 vanished once; use /* */).

## 0.15.7 (graphics sweep, part two)
- sitelook10.js: light() ramp pass + outline2() per sprite; ground contact shadow via the drawTile wrapper; mound AO and HD face shading by normal; hdBakeCards wrapped to clear x-ray flag 8 on entrance quads. v144a extended (tone count, lit upper-left, shadow present, flag cleared).
- worldgfx2.js wraps objCanvas (worldgfx.js) and redraws most prop kinds with lit/base/shade tones, rim light, contact shadows; towngfx.js landmark props shaded. New test v146a (world group): 396 canvases, sizes unchanged, min distinct colours.
- Weak spots: Sanctum HD still pale/low contrast; lair fronts are south-facing cards whatever entFace says; 2D lair mound is dungeon8's slab with AO only; crate blotchy; stall goods small; keychest/lever/bars/door/facade/cavemouth untouched.
- 0.15.7 also: walkers back to .8 (sprhd.js '|c8'), battle .9; walkanim10.js (new, last in MODS) sways the body 1px left/right and bobs 1px on front/back stride frames 1 and 2 (wraps walkerCanvas, caches in IMG 'wa10:'). v140a hero walker hash now c4672172 (changes whenever hero art or scale changes; update to the new value after checking the art).

## 0.15.8
- worldgfx.js drawBuilding: door height 22 when the wall below the roof is >= 24 px (3+ tile buildings), else 16; handles at 40% of the door. HD building fronts use the 2D canvas (m.bsp), so it carries over.
- worldzoom10.js: WZ10.chars=1.2: HD character cards placed at spr.sc/1.2 (hero chH 39.2 -> 33.3 world px), px 2 sampling. Flat 2D view untouched (walkers .8).

## 0.15.9
- portrait10.js heroFrontURL(id): full front walker ('big:' key) as a data URL (cvURL 'fr10:'); used by the roster grid (ui.js tab 'roster', .mini cards) and the party tab's reserves grid (nav.js). The heroCard() starter/recruit card does not use heroURL directly and was left alone; the sheet's big image (pbig) is still the side view.

## 0.16.0
- art.js side view (rigSide): three-quarter profile head (nose, lip, chin, ear, near eye 3 px with iris/catchlight, far eye at the contour), face fields and hat side variants re-laid, wider torso with far-side shading, head layer composited 2 logical px back. Front/back untouched. New test v147a (battle group, 92 heroes at scales 1/.9/.8). v140a HERO_BASE hash 311b33ac.
- Weak spots: art2.js raceTop/drawAcc (tusks, glasses, earrings) at old coordinates; weapons overlapping the head (Brann's axe); helm wearers show little face; strong lip/blush under HD light; spiky/wild/mohawk hair not re-centred; long hair over the back shoulder.

## 0.16.1 (batch 7, owner fixes)
- worldgfx.js door 16 px again. style.css #toast top:38%. p2world.js hint hide 30 s. battle5.js ring pointerdown skips #bcmd auto/pause/speed. handin9.js canHandIn: guild/arena quests only in the guild modal (checked before handFree). battle3.css .b3tg overflow visible, b3TagSize +7. zones.js Eclipse Gauntlet rec 50.
- fixes11.js: p6Train wrapped: set = trainees (>= gap behind) + anchors, free slots filled by power (XP catch up untouched, the owner corrected me); arena results -> V.modal {type:'guild',tab:'arena'} via finishBattle flag + ACT.resultOk wrap.
- Open from batch 7 (helpers / later): side heads pass 2 (art.js), selling, crafting +0 start, max-temper comparisons, personal quest BiS reward, temper cost display (econ helper); arena menu clear count + score, medals, journey record stat, Daily -> Weekly trials; material sprites in the overworld.
- Side heads pass 2 (art.js hFace/hHair side branches, rigSide long hair behind torso; art2.js raceTop/drawAcc side coordinates). v140a HERO_BASE f74a4dfe. Weak: elf/fox/cat ears at old coords, Brann's axe over the head, mohawk a blob.

## 0.16.2 / 0.16.3
- style.css #toast bottom 112px (owner: middle was worse). worldgen.js genFieldRaw: for a bending field the rows ey-1..ey+1 east of ex+1 become '#'/'~'; for s>=4 the lane past the seal ends at bx+2.

## 0.16.4
- arena11.js (new, after fixes11): G.arenaBest[tier]={score,turns,kos} (score = waves*1500 - turns*18 - KOs*250 + avg HP frac*2000, win only); nbArena rows "Cleared Nx · Best score"; SVG medals per tier before the title when G.arena[i]>0; Records > Journey "Arena medals collected n of 5"; dailyKey() -> Monday of the local week (trial, twist, leaderboard key); META.trialBest[key]; player text Daily -> Weekly via vModal xform; "Weekly Terror". Test v149a (menus group). Weak: medals tiny (18px); pre-change daily board entries show only on their own date.
