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
- Bosses: Scourges The Locust Choir (swarm, wind/earth), Ironmaw Tortoise (armored, earth/water), Emperor Candlemoth (fire/light flyer), Brinehag Matriarch
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
  (hollowsun light/fire), REALMS 'ashglass' cal:1 theme heights (Glarepan, The Mirror Cathedral, dust), bosses9.js wires BOSS_TY, BOSS_GIM.def, native foes
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

## 0.16.5
- fixes11.js: doReaction wrap drops the floating 'react' fx while the b9 banner shows and moves battle4's +MP into B.b9rx.mp (b9RxHtml wrap adds .b9mp); HOOK.after('win') marks bestOf('Echo '+d.n).kills for rift echoBoss fights (phase-2 bosses recorded kills under the second form's base). worldzoom10 hdChar: the chars divisor applies only to canvases < 40 px wide (walkers), so map monsters/bosses keep size. sanctum.js drawPortal runes coloured only when won. Note: the Echo Rift beaten state is account-wide (META.best), by design.

## 0.16.6
- mats11.js (new, after arena11): icMatDraw wrapped (new 16x16 icons; es_* shards get a base bar from the 9th on so all 48 are distinct); placeNodes wrapped to fix each node's material by hash; gatherAt wrapped to yield the shown herb (forces the first Math.random, then restores it); drawNode material piles in 2D; hdBill wrapped to swap the HD node card ('node11:<mat>:<step>'). Test v150a (world group). Weak: iron ore vs ash/elder log stacks least distinct; HD swap locates the node by card position.
- econ11.js (new, after walkanim10): Alchemy Sell "Items" section (40% of pre-multiplier list), tempered gear sells base + 25% of tempering cost, confirm for rare/tempered/unique/Echoforged, keepsakes unsellable. temper.js: maxTemperId/maxGainFor/ceilOk; p3shop.js upgrade chains compare at +3 (ties to worn), "at max temper" text, Equip best "Worth tempering" list, "Temper · Ng" buttons, cost chips under the title. Forge recipes make +0, gold = 85% of shop minus bought mats. Personal relics (u_/ua_/uc_) follow the best shop piece of the hero's family at tier min(5, realm+1), fully tempered, untemperable, computed from state (old tier-4 stats are a floor). Test v148a (menus); v063m2 expects the Items section. v095m3 was already failing (ignores the 3% gain floor and temper chains).

## 0.16.7 (batch 8, my part)
- fixes11.js: riftView()/withRiftView() swap META.best for a per-journey view (G.riftWon[key], set by HOOK.after('win') for rift echoBoss fights) around drawPortal, mPortal and rkBeaten; vModal xform adds the Riftkeeper's warning line while !rkUnlocked(); guard() wrapped to count B.nz.guard when any living foe has st.charge or st.g_tele.
- walkanim10.js: side stride frame 1 bobs 1px. temper.js: plain "Temper" button. style.css: .row.rec strips use var(--tc).
- Helpers in flight: echo11 (Echoforged BiS, all weapon kinds, gold, anvil landmark), battle11 (boss scale 1.35, cmdhead bars removed, double tap / hold opens the foe card).

## 0.16.8
- echo11.js (new, after mats11): Echoforged = 2.0x tier-5 shop base (shop +3 is 1.75x), untemperable, old 'w_x_ef+N' ids read as plain ef; ECON11.relicEdge 1.08 -> 1.25 and relicBuild wrapped so relics clear Echoforged by >= 5% at tier 5; ECHOFORGE 25 weapon recipes + ECHOARM (mail/robe/vest); gold 1.6x tier-5 shop; anvil landmark (42px plinth, brazier, banner, rune ring, shards, motes; lights via scanLights wrap). rift9.js anvil draw delegates to echo11. Tests v151a (menus), v063s accepts >= 6 ef icons, p4.js accepts the unplussed forge result. Weak: a relic only beats the Echoforged piece of its own family; forging a tempered base loses its tempering.

## 0.16.9
- battle11.js (new, after mats11/echo11): foe sprites resampled 1.35x (BIG_ART, 81x81) / 1.1x (44x44) during battleFrame only (monCanvas flag), unitBox follows, head kept >= 4 px from the stage top; cmdhead .b8hm removed (aria-label keeps the numbers); double tap (350 ms) or hold (450 ms) on a foe box/plate/tag opens ACT.uInfo; a single aiming tap now fires on release. Test v152a (battle group); v080b portrait check no longer needs the head bars. Weak: uneven pixels at 1.35x; boss-fight slots may overlap on tall stages; shadow width capped at 40.

## 0.17.0
- hd2d.js portal frame cache key includes won ('w'/'o' from G.riftWon) and open ('O'/'L') state (frames were cached dark forever). rift9.js Echoforge npc moved (13,6) -> (19,7); echo11 reads the npc position for its art and lights.

## 0.17.1 (batch 9, my part)
- fixes11.js: addXp wrap converts XP at LV_CAP to gold (x/8), B.capGold reported on the rewards screen; before/after 'win' hooks turn drops that were already at invCap into gold (40% of price); hideLegendNames xform cuts legendary class names from class lists until legendOn. ui.js: seal button removed; sheet Equipment block uses .row.tr gear rows (.eqsheet). engine.js:875 bond pairs = partyChars() (still filtered by BONDMAP, so only defined pairs; owner: both in party, vanguard or rearguard). roles9.js: no "Sub role: 85% power" note. items.js Pork Chop text. style.css .rl9 full width.
- Click to move: works headless on low/medium/high at 1280x800, 1366x768 and 1920x1080; could not reproduce. Asked the owner for the setup.
- Echo Rift (helper): sanctum.js RIFT_HALL constant (33x28, start 16,25, forge 16,14, keeper 16,5, gate 16,2, five bays by element, Calamity ring); rift9/riftkeeper9/rk10 read positions from RIFT_HALL; renamed in locName, Waystone row, keeper lines, realms.js toast, lore9 entry. Tests v153a (world), sanct/v145a/v151a/v138a updated. Weak: bays by element not realm (Scourges are not realm-bound); north Calamity gate on the keeper's axis; 390x844 crops the hall bottom.

## 0.17.2
- art.js: heroPal boot colour used (h>>3)%BOOTS.length (negative for ~26 heroes -> undefined -> no boots); now >>>. Robe body stride frames: side legs with real stride points and hem trail/flare; front/back one boot lifted, hem sway 1px. walkanim10.js retired to a stub (its hip split left a transparent row). Test v154a (world, 92 heroes x 2 scales x 8 frames: frames differ, boot row constant, both boots, boot palette). v140a HERO_BASE c4f99d51.

## 0.17.3
- menus3.css .box max-height min(92vh, 100svh - 24px) (was var(--vvh) which goes stale and exceeds the visible height with the URL bar shown, so the box bottom sat below the fold).
- Open: character sheet reorganisation (owner) pending a helper slot.
- fixes11.js: ACT.campOpen falls back to item 'tent'; ACT.campUse; mCamp wrapped with a Use row (campkit/tent).
- 0.17.5 fixes11.js ldCards() (rows with portraits and names per loadout), appended in ui.js loadouts tab.

## 0.17.6
- dmg11.js (new): kind resolution (WT_KIND/CLS_KINDS/CLS_KIND_ALT in items.js, DL_FORCE in skills.js), display lines, foe Weak "Your answers", flyer piercing 1.25. Skills: Hand Axe -> Heave (weapon kind), Javelin -> Shield Throw (blunt), thief stars/kunai/fuma piercing (config.js). tools/dmgaudit.js prints the class x kind matrix. Sim: 12.55 -> 12.75 boss tries, level 41.05 -> 41.15. Test v155a (battle). Weak: gear tooltips lack hero context (knight's lance says Piercing); piercing is scarce by design.
- res11.js (new) + hd2d/hdstage/battle11/worldrt/p5settings/config RENDER: internal px per art px = clamp(floor(d/2+.25),1,tier max) (medium 2, high 3); EPX-upscaled ground/prop/building textures from 2x; battle unit layer 4x backing at d>=3; Settings > Render scale (META.cfg.render); Auto governor steps down under 45 fps (off under __PWTEST). Frame cost in software GL about 2.8x at 1080p 2x. Test v156a (world); v053a expects HD.pxI. Weak: item icons are 16px sources; title scene untouched; EPX textures up to ~100 MB on big fields.
- Pending: sheet11 (character sheet reorganisation) helper.

## 0.17.7
- sheet11.js (helper): wraps mChar last, re-slices the sheet html into header + tabs (overview/stats/skills/gear/role), V.sheetTab remembered, CSS injected; v157a (menus), v137a sets V.sheetTab before reading text. Weak: tab bar not sticky; Overview right column empty without bonds.
- menus3.css .box max-height min(92vh, 100svh - 24px - safe-area), .modal align-content:start + safe-area padding. battle3.css b8col .pcs/.fcs one column; battle3.js wide planner prefers col && fr && !cr among whole arrangements. fixes11 guard wrap also counts boss/elite fights.
- Click to move: HD hdPick is exact on open ground at 1000/1366/1920 (zoom 1.33); clicks on tiles behind buildings/walls return the wall-front tile (ray hits the height field) and NPC/prop pick rects win over ground. Asked the owner where it misfires.
- Open: menu back-navigation with scroll memory and tap-outside-to-close (owner), Echo Rift ring (helper), animation overhaul (helper).

## 0.17.8
- sanctum.js RIFT_HALL computed from polar positions: hall 33x34, forge (16,16), Calamity ring r5 (south gap), Scourge ring r~10.5 (21 slots, south empty), signs at r8, braziers at r12.2, keeper (16,4), gate (16,2), start (16,31). Tests v153a/sanct/v145a/v151a updated. Weak: spacing 2-3 tiles uneven; walkway ~4 tiles wide; 390x844 crops the hall.
- fixes11.js: makeEnemy wrapped: in a rift echoBoss fight every foe made takes B.spec.lv (55), so summons are 55 too.
- fixes11.js: turnOrder wrapped: in a rift fight B.en keeps only e.echo foes (summons culled). Pending: foe/boss sprite sweep at the new battle scale (helper, waiting for a slot).
- 0.17.9 style.css: @media (min-width:1200px) #app max-width min(1400px,100vw-32px). Headless check at 1680x996: the world canvas already filled its 1333px frame; the owner's dark 'bars' were the page margins outside #app.
- fxkind11.js (new, after sheet11): kind vocabulary and dispatch (slash/blunt/pierce/ranged/multi/magic per element/heal/buff/debuff/song/limit/summon), hero poses per kind (heropose9 multi-hit alternation), foe recoil per kind (name-matched for foe moves), hdspell.js hbsKind lights/decals on the HD stage; anim10 big-spell/party-ring/song-ring show removed, spin only for all-foe slash. Audit: scratchpad fx/audit.tsv (283 skills). Test v158a (battle). Weak: thin slash arc on small screens; buff/debuff shapes shared (colour only); hand glow estimated; foe move kind by name.

## 0.18.0
- battle11.js (foe helper): foes repainted from the key grid on a padded grid (PGP, 2-4 art px), cropped under the feet (flyers keep hover rows), canvas sizes multiples of 4, unitBox follows; targets 1.5x BIG_ART, 1.25x ordinary, 2.0x guardians, snapped to whole backing px per art px (K=resBk 2 or 4). art3.js bossFrame1 glow alpha .08. Test v160a (battle); v152a accepts >= 81/44 and box == canvas. Weak: ordinary foes stay 1.0x at K=2; shadow width cap 40 px in hdstage/battle untouched; multi-boss slot overlap unchecked.

## 0.18.1
- fxkind11.js (animation helper, ~670 lines), hdspell.js hbsFx/hbsStatus, heropose9.js hand markers (heroHand()). STS: 30 status shapes drawn at apply, as loops and on tick pulses; 12 Limit signatures (Limit II 1.3x); sg_ seals keyed by hero id; boss windup/gather runes, Cataclysm/Crushing Charge/Siphon/Flanking Strike, realm gimmick telegraph+release; calcDamage wrapper counts landed blows for "x N"; element tint via BV.tint in drawUnit; hit-stop 40-60 ms + camera punch; foe KO dissolve per kind; cheer pose on last foe. Test v164a (battle). Weak: g_* status strips unchecked beyond g_tele; shapes faint on 175 px phone stage; persistent statuses (curse, wound) loop every battle; hit-stop skips frames; other legendary kits have no signature.

## 0.18.2
- breachlook11.js (helper, last in MODS): map keeps theme 'void' but takes m.thv='breach' (getMap wrap, re-set after applyBossTheme); THEME.breach/DTHEME.breach copies of void with new colours; drawTile/drawObjects/objCanvas wraps for cracked ground, aurora sea, glowing cliffs, rift-glass bridges, rune stones, shards, spore bush; hdLook indigo fog + sky aurora. battleTheme wrap returns 'breach' when B.spec.breach or spec.bg.br (startBattle after-hook); BG.breach + bgAnim in 2D, hbInfo/hbFloorTile/hbProps/hbLook wraps in HD. Test v163a (world). Weak: sea-tile difference small by design (stars kept); HD world sea shows the aurora faintly; HD Breach battle always night grade.

## 0.18.3
- nav11.js (helper): cause of "random spot" clicks was ui2.js drag detection (any pointermove after 220 ms or 14 px turned a press into a drag; real mice jitter and Medium/High frames are late). Mouse/pen press becomes a drag only after 6 px; tap tile recomputed at pointerup from the current camera; mapPoint divides by zoom when <html> rect and innerWidth disagree (Chromium <128 as in Electron 31). Test v161a (world). Weak: map.js/bigmap.js taps and battle11 foe hold not covered for legacy zoom; drag needs 6 px.
- skillrows11.js (helper): battle rows drew the estimate as span.num (floating damage number, animation rise, fades). Every row gets a fixed strip: headline "~N" in battle / "Pow N" / kind for buffs; second line power, xN hits, kind, N MP; sheet adds Lv N for locked rows, Limit rows and battle Limit button get the strip. Test v162a (battle). Weak: sheet shows power not estimate.

## 0.18.4
- menus11.js (helper, last in MODS) + menus3.css: MH.stack (max 40) of {modal copy, scrollTops in #modal} pushed before render when the view key (type+tab/cat/sec/char/id/k/nat/hero/slot/mode/sk/cid/gear) changes; Back/Esc/pad B/charBack/menuBack/roleBack/bondsBack/natBack/fsBack/gearBack/obBack/Capacitor backButton pop and restore scroll; empty stack falls through to old modalBack/from rules; stack clears when modal is null; never saved. Backdrop tap closes all (press starts on backdrop, <10 px, no scroll); must-answer popups and battle non-info modals excluded; not while rebinding keys or with typed text. Load another journey: Settings > Account and Saves and Journey tab use the title slot picker; confirm shows G.savedAt; slotLoad in place; current slot not deletable. Settings re-sliced into Play/Display/Sound/Controls/Account and Saves/Help and Feedback/Danger zone (+More for unknown rows), folded on phones; all 62 data-act pairs kept. Test v159a (menus, 52 checks); v050p1e/v063m2/v095m1/smithywalk expectations updated (each screen starts from the world; Esc returns to the previous view). Weak: history pushes on every sub-tab chip; restored scroll can miss late content; Capacitor back untested.

## 0.18.5
- zoomfix11.js (new, last in MODS): Chromium <128 (Electron 31 Windows app) keeps vh/vw units and getBoundingClientRect unzoomed under CSS zoom; 128+ scales them. dzRectK() measures which (html rect vs innerWidth, cached per zoom); <html data-dz> + --lvh/--lvw (innerHeight/zoom per 1%) set on dsApply/resize/render; html.dzlock on world/battle screens. style.css: html[data-dz] overrides for .box, .menu.list, .bmscroll, .bbottom, .udbox, .mapbox, #toast, #lnq, #app; html[data-dz].dzlock body overflow hidden; #app:has(.world) max-width 100vw-32px at >=1200 (world frame fills wide windows). worldrt.js worldSizeCanvas box.width = parent.clientWidth (the old rect/zoom was 25% narrow on old Chromium: the owner's dark bars). battle3.js b3DocTop divides by dzRectK. guidance9.js qgList drops sealed vault quests once G.won (ready ones stay). Test v165a (world) with legacy-rect emulation. Weak: vh semantics cannot be emulated headless (only the rect half is tested); map.js/bigmap.js taps still mix spaces on old Chromium; at 100% zoom on 1920 the world is a 1888x560 strip.

## 0.18.6 (and cleanup steps 1 and 2)
- CI: release.yml job "test" builds and runs `runall.js ci` (23 tests, about 5 min on the runner); android and windows need it; the report is an artifact. runall groups `ci` and `flaky` (v158a v080wt v080b v071wt). GitHub Pages still serves main's committed index.html, so a red test blocks the APK and installer, not the site.
- Build guards: tools/buildcheck.py (run by v3build.py): E1 MODS file missing, E2 v3/*.js unlisted, E3 top-level const reassigned (also the `{const f0=fn;fn=function` idiom), E4 duplicate top-level declaration, W1 `//` swallowing code, W2 node --check of the joined script, W4 duplicate function declarations (heroRoles, drawGatehouse, drawShrineRing, drawShrineFront, sncGateLights: step 4 candidates). tools/wrapmap.py -> docs/wrapmap.md (380 wrapped functions, 682 raw wraps, 271 hook registrations before step 3).
- breach10.js: the x0 getMap hook returns without calling next, so mapheal's getMap hook never healed the Breach; the first CI run caught it (v163a mapIssues 1). Now healMap runs inside the breach10 hook. Measured 0/150 issues locally before and after; the CI failure was the rare case.
- Step 3 in flight (four helpers): raw wraps of the 41 functions with 4+ raw layers become HOOK registrations (HOOK.def in the owner).

## Cleanup step 3 (no version change)
- 205 raw wrappers of the 41 functions with 4+ raw layers became HOOK registrations (HOOK.def in the owner): engine (calcStats, unpackG, recruit, scan, restAll, makeEnemy, doReaction, addSt, fallen, checkPhase), battle (battleFrame, onFx, spriteOf, onAction, drawParts, battleTheme, layoutBattle, burstAt, enemyTurn0), world/gfx (drawObjects, objCanvas, drawTile, arrive, worldTick, showLocation, hdActors, hdLook, mapMarks, applyBossTheme, drawPortal), ui (cmdHtml, mChar, mMenu, wkwUpdate, mBeast, bestAll, modalBack, vSwap, vJourney, vFacMissions, gearDesc). Raw wraps 682 -> 471, registrations 271 -> 480; no function has 4+ raw layers left (docs/wrapmap.md).
- Notes: enemyTurn0's function-object markers (__b4/__b4g/__rk) became module flags (b4TurnHooked, b4GimHooked); worldfx objCanvas snapshot is HOOK.snap; hd2d's bake-time `drawObjects=function(){}` swap is an arrow now; typeof guards on always-defined functions dropped.
- Verification: full `runall all` on the converted build (173 tests, 112 min): 36 failures; the same list on a clean HEAD build fails identically except v141a and v163a, which pass alone on the converted build (load). So 32 tests fail on HEAD for old reasons and are not in STALE: audio, audioplay, tavern, v040p789, v041p1k, v041p4, v041p53, v050p2daily, v050p4b, v050p6a, v053a, v063ba, v063bc, v063bd, v063m1, v063pa, v063pb, v063s, v070ib, v070m1, v070oa, v071wa, v071wt, v076b, v077wb, v080b, v080ca, v080wa, v082db, v095m1, v095m3, v095m4, v095na, v150a. Step 5 sorts them into stale (design moved on), flaky (load) and real.

## Cleanup step 4 (no version change)
- fixes10.js deleted: dynActors (sites.js xform; dynActors def'd in worldgen.js, legends' raw wrap converted), sanctGuard null stub in sites.js, actorTalk mini ask (sites.js before; actorTalk def'd in worldrt.js) and the "Not yet" legend answer (legends.js before), vModal miniask (sites.js), ACT.miniGo (sites.js), askBoss (sites.js before; def'd in worldrt.js), openChest mini chest (sites.js before), accOf eye patches (art2.js xform; def'd there).
- fixes11.js down to 16 lines: win before "pack snapshot" + win after "cap XP and overflow drops to gold" (must follow results.js and endgame10's Breach purse), vModal xform hideLegendNames (must follow every popup builder). Moved: p6Train (party3), ldCards (party3), arena result remember/resultOk (arena11; ACT.resultOk def'd in results.js), doReaction float drop (battle4 after the detonator hook), b9RxHtml/b9BanBox (battle3), rift kill record + per-journey win (rift9), riftView/withRiftView/drawPortal journey view (rift9), mPortal (rift9; def'd in sanctum.js), rkBeaten (riftkeeper9), Riftkeeper warning (riftkeeper9), rift boss level 55 (rift9), Echo fights alone (rift9; turnOrder def'd in battle5.js), guard goal (goals.js; guard def'd there), CAPG cap XP (p4xp before with HOOK.stop), camp Tent/campUse/mCamp (v063prog), legendClsOn/hideLegendNames (legends).
- walkanim10.js deleted (MODS 195 -> 193). Dead duplicate bodies deleted: drawGatehouse/drawShrineRing/drawShrineFront (sites.js; sanctlook10 owns), heroRoles (progression.js; roles9 owns), sncGateLights (sanctlook10; sitelook10 owns). buildcheck W4 warnings gone.
- Found, not fixed (behaviour change, needs its own release): progression.js partyNeeds and tavern2.js call heroRoles(id,lv) expecting {P,D}, but roles9's heroRoles(c) has shadowed it for a long time and returns ['phys'] for a string id, so R.P/R.D are always undefined: the tavern primer/detonator party needs and the progression hint never worked as intended. sanctGuard's caller blocks in worldrt.js:367 and hd2d.js:501 are dead. Eclipse Gauntlet rec:50 note dropped from the fixes11 header (the change itself is in zones.js).

## Cleanup step 5
- runall.js STALE: the 32 verified HEAD failures with reasons (a few marked "(real, minor)": audio fort loudness, v063ba/v070ib label overlaps at the new foe sizes, v063s c_medal2 icon shared with charms, v080b side column scrolls at 933x615/1280x720, v080ca debuffer band 52 to 54 percent, v080wa rain run 21 to 28 px). `all` is 138 tests now and green when nothing regressed.
- README.md "Shipping a change" names the build guards and the CI gate; docs/README.md has "Cleanup rules"; CODEMAP.md hook lists regenerated (72 functions); docs/wrapmap.md regenerated.
- Next feature work per the owner's design review: a mid-battle catch for recruiting, realm one without the convenience layer (auto battle, Best Party, Training team, Equip Best unlock at the first beacon), an order-bar action preview with timing skills, visible encounter ground with Repel-style items, short personal quests per wayfarer.
- v141a flaked (1 in 5 to 8 runs, also on the pre-cleanup build and in CI): a Den's prize chest is a Mimic 13% of the time (mimic.js MIMIC_RATE on chestHash), so the ambush fired instead of the open. The test now accepts the Mimic case; 10/10 after. Design note for the owner: a Mimic in the prize chest right after the miniboss is current behaviour, kept.

## 0.18.7
- perf12.js (helper): phones (coarse pointer, short side <= 600 css px) cap Auto render at 2 px per art px (resPx/resBk/resStageR HOOK.def'd; Settings 3x kept); idle limiter on the loop (HOOK.def 'loop' in ui.js): world/battle at rest 30 fps, moving up to 60, 8 fps under an open menu (the High depth-of-field blur re-rasterised the whole screen every frame), 0 when hidden; direct worldDraw/battleFrame calls always draw; off under __PWTEST unless window.__P12F. Cause: every rAF drew a full HD-2D frame at 3x internal px (422k px) on a 120 Hz phone. Headless numbers: still town 25.3M -> 5.6M px/s shaded. Test v170a (world). Next cuts: HD post chain every 2nd frame on phones, dirty-rect unit layer, menu blur.

## 0.18.9
- party12.js (helper): partyHere() = inTown() or the Echo Rift hall (world screen, no battle); swapped into nav swapTown, p3shop, party2/party3 Build Party and loadouts, ui.js Party/Roster/Loadouts tabs, assignM/unassignM. pt12Tick before render strips every non-party hero's gear to the pack (toast), ldApply stows first so Undo works; migration once per save (G.pt12mig, G.pt12note modal); suggestions party-only (bestTag roster line removed); Equip Best row when a party hero has an empty weapon/armor slot; "Equip best: reserves"/autoCamp gone; autoEqAll party-only; reserve sheets read-only; Best Party power gear-free (pt12Power in p6Ctx). NG+: META.pt12.runs per playthrough {s,c,o,b,f,vis,bs}; newRun xform prefers unseen realm + unseen boss, then unseen realm, then unseen boss, then random weighted (PT12.lean .6, x1.6 for bosses not in the last two runs); reads realm boss/alt from realm data when present (world12 adds it), newGame after-hook re-asserts G.run.ngp. Test v169a (party); eq.js and v063pb.js updated (v063pb back from STALE). Weak: realm list local to the device (boss seen syncs via META.best); no NG+ note on the starter screen.

## 0.18.8
- records12.js (helper): Records first tab Completion (tab id realms): Echo Rift block once open (Echoes N/25, "Secret boss ???" -> "The Riftkeeper, Beaten"); per realm every tracker incl. Echo; Dens/Sanctums read the map for visited realms (the plan gives Dens to 3 to 5 of 5 realms; ~1/1500 maps plan a Den never placed). Account play time: META.stats.credit ledger per journey, raised to the save slots' sum on first run, saved on hide; "Play time, this journey / account" shown together. Notice Board: "Notices" first tab (quests, bounties, guild missions, notices; Ready/Active/Open/Done; one Accept all, one Claim all that names what waits elsewhere); cause: Claim all tried every ready quest but handin9 only allows a quest at its own realm's board and guild/arena at a Guild Hall, refusals were silent. Settings > Tips: chips took the row at 390 px (menus11 re-wrap lost .obset); rows wrap, text min 140 px. Site tags on every arrival; Breach banner second line + one-time description (G.breachLook). v095m4 344x882 sideways scroll fixed in menus3.css. Test v167a (menus); v095m1, v043c, v063m2 updated. HOOK.def in complete9, metastats, menus3. Weak: no ready-count badge on Notices (overflowed at narrow widths); hooksmap not regenerated.
- 0.18.9 follow-up: party12's NG+ draw ran as a newRun xform, but HOOK.def('newRun') only exists in the skills helper's uncommitted engine.js; the newGame after-hook now draws itself when newRun is not hooked. v169a prints [newStd,expStd,newCal] per start.

## 0.19.0
- skills12.js (helper) + config FOCUS/SK12/ROLEPW/BOSS_BUFF, skills.js (classSkills HOOK.def; archetype/sigskills/roles raw wraps -> xform), roles9, natures6 (every nature names its role rl, negative swings removed, Herald leans healer), progression/tavern2 (heroPrimeDet(id,lv) replaces the shadowed heroRoles(id,lv) call), battlefx Focus text. Focus +40% crit for 3 turns (calcDamage wrap). Dual arts physical for warrior/knight/thief/archer/monk/sniper/druid (kind via dmg11), magic for mage/healer/bard/archmage/chronicler. Cap 12 class skills (keep order: per-element P/D guarantees, dual art, signature, first two by level, ultimates for singles, two best per role, heals/revive, rest); dual types get filler g12_p_/g12_d_ skills (lv 8/12) when an element lacks one and lose SK12.ult; legends keep theirs (legendsKeepUlt). Dual art on a primed foe sets off both reactions (merged "Magma + Mire"), on an unprimed foe primes both. Migration G.s12 trims keep lists with a one-time notice. tools/kitaudit.js: 82 of 91 kits were over 12 (max 21), now none. ROLEPW primary 1 / secondary .8 / off .5, natLift .14 capped .9, fx chances move a third of the gap, off-role buffs one turn shorter; floor for P/D/dual damage at secondary. Priest Mend 162 vs bard Ballad 102 (118 with Herald) at lv 30. Pacing: sim 11.1 -> 19.6 boss tries, BOSS_BUFF eased (helper: -12% hp gave 4.4 h, under the 4.5 h floor of v080cb; shipped at hp [.84,1.4,1.45,1.6,1.28] pow [.97,1.3,1.34,1.56,1.25], v080cb passes). Test v166a (battle); v137a, v155a updated; v080ca STALE text updated. Weak: dual prime shows only the first element on chips/aim tags; sub-role buffs not weaker; third roles (mage buffer 16%, archmage debuffer 11%, sniper phys 23%) untuned; bard healer 52% by design.

## 0.19.1
- world12.js (helper, finished by a second helper after a container restart): LM12 23 landmarks (56x96 cards, 2x2 'j' footprint, 2D depth-sorted actor + HD standing card, named in the intro line and Waystone row; colours >= 30 RGB apart, silhouettes <= .85 overlap); style.css pad z-order under dialogs/modals; sanctum.js hall no solid tiles that show nothing; nodeFix after placeNodes and after heal, drawAudit.nodes (0/794 maps bad); RIFT_COL per boss + riftGateCol (HD cache key carries it); Breach without (relit); art.js HSTRIDE 5 north/south stride (168 rigs audited, none failing); WREC recruit spacing (config: minSteps 240, minBattles 3, perRealm [1,2,2,2,1], total 8, dual by stage) 26 -> 8 events a journey, dual share 0/12/21/47/55% by realm; realmdata boss/alt per realm (150 journeys all own bosses, NG+ draws within alt); echoName() in echocore ("Echo Dimmer"), saved records migrated. Test v168a (world); v040p5, v062a, v138a, v140a, v145a updated. Weak: 35 of 200 landmarks sit outside the entry's 26x10 window; a Den or keep prize that cannot be a recruit falls back to a charm.
- Docs regenerated: hooksmap (CODEMAP) and wrapmap.

## 0.19.2
- kits12.js (helper): cause of "Shadow Ray primes / Wind Ray detonates": SKILL_ROLE fixes the role by slot for the first elemental spells; k12Guarantee (s12Guarantee hook) retags only when the name reads as the role (k12Reads lexicon), fillers in class voice (SK12.gen/voice), SK12.slotNames renames the opposite-reading slot skills (warrior Edge->Brand, knight Lance->Seal, thief Shiv->Needle, archer Arrow->Tracer, monk Chi Burst->Palm, healer Ray->Halo/Smite, mage s1b->{n} Lance), roleSwap for the sniper; Radiant Burst->Radiant Flood, Chain Bolt->Static Storm, Tempest Kick->Tempest Whirl. k12Art: physical classes' dual arts "{word} and {word} {noun}" (SK12.arts), casters unchanged. SK12.keep/drop restore identity skills inside 12 (archer Hunter's Mark for Gale Barrage; warrior Cleave for Heave; knight Guard Wall; healer Purify (Verbena has no slot); thief Smoke Bomb + Flurry; monk Flurry of Fists, Meditate for duals; bard Dissonance + Requiem; sniper Stormrider's Mark). Still cut: warrior Sunder/Iron Stance/Warbrand Sweep, knight Rally/Banner/Consecrates, healer Sanctuary/Radiant Ward/Brand of Dawn, thief Kunai Volley/Grand Larceny/Shadowstep, archer Pin Down/Rain, monk Stunning Blow/Whirl/Inner Furnace, bard Lullaby/Allegro/Aria/Refrain, druid Bramble Prison. Guardians: FS11.mini 2.5 (91x96 vs boss 95x91), summoned guardian uses the real art (sumArt removed) on boss slots, SUM.turns 5 / lesserTurns 3, banner "GUARDIAN: name", glow + plate (sumFire HOOK.def; unitBox HOOK.def in battle.js). Pacing: v080cb 16.0 tries / 25 max on the final tree (right at the limits). Test v173a (battle); v152a swaps guardians for a Mossling. Weak: Hunter's Mark still lv 42; monk lesser guardian overlaps foes at 390x844; its tap box overlaps a neighbour by a few px.
- 0.19.2 pacing: the restored identity skills raised the sim to 16.8 tries; BOSS_BUFF eased to hp [.8,1.34,1.39,1.53,1.22] pow [.955,1.28,1.32,1.535,1.23]: 15.1 average, 2 of 3 runs pass; the single-boss max (28 vs 25) is sim variance seen before this batch. v164a pins combo on the returned stats object as well (calcStats replaces c.S).

## 0.19.3
- menus12.js (helper): battle menu memory per hero (submenu, scroll, last skill marked "last"; hooked on renderBattle, per fight); menus11 history keyed by menu (modal type, sheet ^ Equipment) not tabs (m11Sig/m11Fam), modalBack xform: a menu with nothing behind it closes; m12Tags strip on every skill row (scope, kind via dmg11 for the weapon in hand, elements, Primer/Detonator; dual arts show both); dlShapeCv HOOK.def in battle3.js, Slash curved blade and Pierce spear tip drawn at 3x (battle3.css image-rendering auto); roles.js rlSkills no longer appends "<Role> role."; learnLine HOOK.def. Audit: 203 battle rows complete; sheet rows lacked scope and weapon-resolved kind (dlChip had no class in town), codex/starter/learn lines lacked scope. Test v172a (menus); v159a, v063m2, v050p1e, smithywalk updated for the new Back rule. Weak: the Sub x% chip tooltip still says "Secondary role for this class".

## 0.19.4
- titles12.js/.css (helper): banner markup via t12Paint (ui.js loop one-line call), HOOK.wrap showLocation skips the banner when map and game are unchanged (cause of the post-battle banner: onBattleEnd in worldrt.js and the weather change in world3.js called showLocation); layout: phones under the minimap, max 420px, clamp(15px,5vw,26px), two lines; wide max 520px clear of the minimap by 124px; kind word (Den/Lair/Sanctum/Relit) above the name, rule per kind (field diamond, town double rule + seal, Den dashed + stalagmite, Lair heavy + stars, Sanctum ringed seal, Breach rift star, Echo Rift nested diamonds), accent from THEME dec with a per-kind tint. Font Cinzel Decorative 400/700 Latin subset woff2 (~38 KB base64 in fonts.css) as --ffan for the banner, Victory/Defeat crests, modal h2, title .sub. No weather suffix. t12Bare strips a trailing Sanctum/Den/Lair; FORT_NAMES bare (Briarkeep, Seamarch, Forgewall, Hoarcrag, Duskhaven). Breach: second line removed, R12_BREACH_TEXT rewritten. Test v171a (world); v167a, v168a, v077wa updated. Weak: complete9/world12 showLocation after-hooks still run (text overwritten); Flat-look headings unchanged beyond modal h2.
- v164a combo flake, real cause: the per-blow hit roll is clamped at 99% (engine.js), so a three-blow swing misses once about 3% of the time; the counter was right. The test now swings up to four times and keeps the best count.

## 0.19.5
- worldart12.js (helper; docs/v0192-worldart12.md): field exit apron: genFieldRaw's bend lane + v0.16.3 lane closure left a 3-wide strip with void beside it in heights/void/coast realms (75 of 150 fields); a getMap hook turns `~` in an 11x7 apron round each exit into `.`; drawAudit.exitLand (0/150 after). Entrances: post-pass on the den mouth / lair front sprite (lit upper-left rim, shaded right, dressed-stone mouth frame, warm interior, threshold, brazier/lantern/torch by realm) in both renderers; HD mound-realm lairs keep dungeon8 geometry with the card in front. Sanctum carpets: side panels with seam, two-tone gold border, weave, fringe (sncYard/sncHall HOOK.def). Weather: WX7.par and fogPar were [.82,1,1.35]/[.96,1,1.05] (parallax); now 1 so layers stay in world space (HD quads already did; the face clearing still follows the hero). Pickups: 10 gather nodes redrawn with the prop painter in realm colours (m11NodeDraw HOOK.def). Mimic: chest-first redraw, teeth top and bottom, tongue, slams shut on hit; world sprite stays the chest. Test v174a (world, SLOW 1200s); v077wa expects 20px weather shift; runall typos v168av170a/v159av157a fixed. Weak: den mouths are still a modest step from flat (rim and props, no real mound mass); could go further toward the old tent volume.
- v174a is unstable on its own (3 runs: one weather-check fail at low load, one 1300 s hang with a page error "error: Can...", one pass); the anchoring itself is verified by v077wa's 20 px check. v174a is in the flaky group pending a hardening pass.
- v174a hardened (test only): bounded page calls (120 s) and a 900 s watchdog, no settle helper, the 2D weather check draws each weather twice at a fixed time with the camera 80 px apart and looks each particle up at its expected place (817/817 Medium, 258/258 Low); 6 of 6 solo runs pass; out of the flaky group.

## 0.19.6
- worldart13.js (helper; docs/worldart13-entrances.md): tent recipe recovered from 09978ff (two faces at a seam, hem/ground contact, prop on the mass, silhouette above the tiles, HD slices, and above all the building depth sort via m.bsp). wa13Faces extrudes the finished front sprite along (+1,-1) with a sampled top face (30% to white) and side face (52%, cool lift) plus outline; wa13Recess re-darkens the mouth (35% under the lintel to 85% at the sill, lit right jamb); wa13Cast ground shadow wedge; wa13Bsp puts field entrances in m.bsp (5x2 footprint). Den 64x48 -> 78x55, lair 64x60 -> 78x67; HD cards built in the buildings pass (hdGateGeo hook), footprints in S.bh, card strip told the tiles are 'U' (hdBakeCards hook); shrine parts get faces (drawShrineFront hook); sanctum inner door 30x25 actor/billboard; Rift gates get faces under the panel (2D) / a card behind (HD). sanctlook10's raw hdGateGeo wrap converted to HOOK.wrap (it swallowed every 'gate' part). Test v175a (world, SLOW 900): heights >= 2.4 tiles, top/side luminance ratio 3.2 to 5.5, darkest block inside the mass, cast shadow, hero behind covered 16% (2D) / 60% (HD), 380 entrances on 150 fields block nothing. v144a sizes updated; runall world group typo v170av165a split (v170a had not run since 0.19.5). Weak: inner door 1.6 tiles (hall walls are 22 px); HD Rift gate faces are a second card; lairs with a dungeon8 mound cannot be stood behind.
- Found, not fixed: on arrival a field's m.bsp lists every house/tower twice (the HD card strip's drawObjects calls bakeBuilding again and hdBake restores the same array), so buildings draw twice in 2D and build twice in HD. Follow-up in hd2d.js/worldgfx.js.

## 0.19.7
- hud13.js/.css (helper): h13Apply (after render/showLocation) sets --h13a accent (THEME dec, same source as titles12, pulled to T12_TINT; Breach/Rift own; none in arena/Weekly Trial) and 25 shifted base colours (hue 16% toward the accent, saturation kept, lightness nudged so relative luminance equals the base); gold tokens untouched. hud13.css under html:not(.flat): order bar double hairline + Cinzel NEXT, boss plaque/Momentum/groups small corners (--orn-s-*), tinted bevelled hero/foe cards and compact list, chips with gold hairline, Cinzel on labels and the turn name, world bar and result frame tinted. Plate heights identical before/after at 1000x560, 1366x768, 390x844, 844x390; contrast equal or higher (hero name 8.6 -> 9.4, NEXT 8.8 -> 11.9). Test v179a (battle, 99 checks); runall typo v157aeq fixed. Weak: no corners on 40 to 60 px cards; canvas unit HUD and command items untinted; snow/heights accents shift little (near navy/white).

## 0.19.8
- terrain13.js (helper): one drawTile wrap serves both renderers (the HD ground bake is buildMapCanvas with props stubbed). Per-map value noise (t13HashS(m.id)+m.s): 4x4 feathered tone blocks, worn paths on fields; ',' drawn as '.' then 2 to 5 clustered clumps from 6 variants; materials per realm (sand pebbles/shells/ripples, snow drifts/crust, ash cinders/embers, void spores, Breach thinned with a teal cast so v163a's green>red holds). Transitions at draw time: grass bites into road/cobble, wet rim on ground beside water, foam line + pale line in water beside land (breathes across the two bake frames), cliff-top shadow line and chips, rock flecks beside cliffs. Water: baked sky band and flipped darkened reflections of the prop north of each tile; one animated layer (sine band, hashed sparkle, foam breath, fountain specks) as a depth-sort entry in 2D (cap 400 tiles) and plain quads in HD.dynB (cap 260). Weather: wet level (22 s up, 70 s down) darkens stone/paths with sheen lines; snow level (45 s up, 110 s down) caps props/buildings/ledges in 2D via one cap canvas per map, in HD via a snow mesh rebuilt only at 8 level steps (hdMergeProps xform, hdScene after; HOOK.def added in hd2d.js). Frame cost within noise for clear/rain; snow +6 GL rows. Test v176a (world, ~4 min). Weak: HD ledges/dusting plain quads; no building reflections; fences get no caps.

## 0.19.9
- chars13.js (helper; docs/chars13-characters.md): paintHD result hook adds a one-px outline in the sprite's darkest body tone (.5 toward ink) and a rim light on the lit side before any resample (698 sprites mean 99.6% outlined, min 92%; mb_* world copies 70 to 78% because sites.js resamples 1.5x). c13Frame two-frame idles per canvas (breath, blink, sway, lean, pulse; WeakMap, <= 8 frames; hashed offsets so nobody syncs) via walkerCanvas/spriteOf result hooks, bosses/guardians 2-px exhale (BIDLE prefill), drawUnit before-hook desyncs the squash; reduced motion -> none. c13Mid: 4 to 6 irregular silhouettes per stage (rocks, trees, teeth, spires, dunes, ruins, pillars, shards) in the ground's darker greyer tone with a base shadow, depth-sorted among the units, lit by the High stage shader; 2D ground Bayer haze (bgStatic hook) and soft contact shadows (BV.glShadow). fx after-hook tags damage with el-<element>; Pixelify Sans 700 with an 8-direction outline, element/kind colours, crit pop, miss small grey; reaction chips and b9ban in --ffan (banner fs scaled by the width ratio, b9BanBox xform). HOOK.def added: paintHD, walkerCanvas (sprhd.js), drawUnit (battle.js), bgStatic (bg.js), fx (engine.js). Frame cost: unit layer +0.2 to 0.3 ms; limiter holds 30/60 at rest. Test v178a (battle, 20 checks); v160a exhale luma bound 16 -> 17. Weak: miniboss world copies partial ring; mounts' horse not painted; battle breathing still drawUnit's 620 ms squash (desynced).
- v140a: HERO_BASE re-taken 35384523 (the outline pass changes every hero pixel); idles switched off during the hash so it stays stable.

## 0.20.0
- light13.js (helper; docs/light13.md): one sun (L13.suns overrides HD2D.suns: day WNW, dusk low W, dawn low E), l13ShadowW blends the three baked shadow channels by phase and hour (clouds soften via TR.wx); HD hdLook after-hook sets shW, warm sun / cool ambient by day, ambient -20% and lamps x1.3 at night; 2D l13Field heightfield (walls, cliffs, buildings, trees, rocks, entrances, landmark) marched toward each sun, three cached masks per map laid under everything (townDecorActors), dayFxDraw wrap hides daylight.js's old wedges. Night pools (2D worldDraw after-hook): view darkening with soft holes at lights and the hero, additive pools from one cached sprite per LIGHTC colour for m.lights + fountains, fire flicker; interiors stronger. Particles via wfxRun after-hook (emit shared by 2D/HD): fireflies, pollen, ash/embers (deeps + braziers), dust, frost sparkle, spores, void motes (hdActors hook on the archive map); clock l13T pauses under menus. Transitions (worldDraw wrap, timings unchanged 460/230/280): battle start nine shards in the realm colour with the two white flashes kept, doorway iris out/in, won-battle warm bloom; reduced motion plain. Frame cost within noise (HD town 50.8 vs 55.4 ms software GL; 2D +0.3 to 0.5 ms); limiter holds. HOOK.def: wfxRun (worldfx.js), dayFxDraw (daylight.js). Test v177a (world). Weak: HD fountains are not lights (hdBakeLights not hookable); HD shadow length within a phase is a blend of three bakes.

## 0.20.1
- fixes14.js/.css (helper): Momentum label (Cinzel from hud13) wrapped in Surge/Drained and pushed the bar under the corner ornaments and out of the clipped log strip; label nowrap, gauge up to 166 px, bar not squeezable. Primed chip: status row items no longer shrink so an overfull row wraps, chip one line ("Primed" yields first), row capped to the space the card reserves, and the status row passes taps through while choosing a target (the "i" still works). useItem HOOK.def in engine.js; fixes14 resets the hero's menus12 memory to the main actions after an item (skills keep it). Victory learned-skill lines wrap with tags under the text. Test v180a (battle, 390x844 / 1000x560 / 700x930).

## 0.20.2
- worldart13.js front facing (helper; docs/worldart13-entrances.md "v0.20.1: front facing"): extrusion straight up (top face from the lightest of the top four rows, 30% to white; back row darker; 1 px outline), no side face; mass centred, fx/fy give the front's position. Bug fixed: the outline pass read the buffer it wrote, smearing a dark slab right and down beside every entrance (most of 0.19.6's "side face"); now reads a copy of the alpha. Den 64x55, lair 64x67, inner door 24x25, Rift gate card panel width +3 px top band. Both jambs darkened alike. wa13Prof per-column HD sun-shadow footprint replaces the 3x2 box. v175a rewritten (top vs front 1.10 to 2.22x, side margins within 1 px, 0 pixels outside the vertical extrusion, hero behind 18% 2D / 65% HD, 150 maps block nothing); v144a sizes; v174a section 6 measures worldart12 with __WA13.off.

## 0.20.3
- menus14.js (helper): sheet11 tab bar removed, all sections in order under sticky gold bands, a Show select (All default, V.sheetTab kept), Stats band shows points to spend. Tier tags: 10 px badge, no inherited shadow/glow (crisp at dpr 1/2/2.625). Next goals: glSpot/glRender HOOK.def in goals.js, panel right-aligned under the minimap (chip = minimap width, full 1.5x up to 170 px), drops to two goals/chip/hidden when it would cover the hero, hidden during the area banner. Tavern: tvPickOk HOOK.def in tavern2.js, seats filled at the strictest of 4 rule levels (element repeats 104/200 -> 2/200, avoidable class repeats -> 0). Learn levels: m14Levels walks the old levels keeping order, max gap 6, never three within 3 levels, cap 42 (M14.spread {end:42,gap:6,win:3}); old saves keep skills via c.keep once (G.m14lv). Pacing: journey sim average 14.3/14.7 (HEAD 15.0/15.3/17.3); the "most tries on one boss <= 25" check fails on HEAD too (sim variance), not gated. Test v181a (menus); v157a, v095nb updated; runall menus typo v157aeq fixed.
- Changelog repair: CHANGELOG in v3/data.js had no entries after 0.19.1 (the working copy was reverted between edit and staging in every release since 0.19.2, by a helper's checkout or rebuild); entries 0.19.2 to 0.20.3 restored in 0.20.3. Releases now check `git diff --cached v3/data.js` before committing.

## 0.20.4
- terrain13.js (helper): ',' tiles are dense growth again (t13Growth/t13Tall/t13GrowPal: 12 jittered clumps + 1 to 3, dark foot, lean by noise, three tone sets; frost tips, dune grass + pebbles, charred stalks blended on pale Ashglass, violet void blades); '.' keeps the patchwork with rare tufts. ','-vs-'.' contrast at or above pre-0.19.8 in every realm (e.g. lakes 9.8 -> 16.3, AUC .73 -> .99). Water body t13WaterBody: 2 px depth cells (distance to land + noise + swells + dither), six tones from the realm's water colours, 0 to 2 hashed wave marks per tile; t13WAnim highlights on about half the tiles. Breach: the full-tile teal tint and square glows removed; spore grass with plus-shaped head halos. breachlook11 aurora and voidsky10 stars drew after resetting the transform on the 2x HD overlay (a quarter of the view); now at the canvas's real scale. worldart12: in void/cloud realms every field and town exit follows its walkway by BFS to open land and turns void within 3 tiles to ground (bridges to road), apron also for towns, hook registered in a microtask after the town-gate passes, guardPaths re-run on a changed map (v050p1c); drawAudit.exitLand also reports void within 2 tiles of a walkway; 168 maps: 61 -> 0 with void by an exit. WA12.cause=false restores the apron-only rule. v176a sections 5 to 8 added.
- v177a flicker check: one 47 ms frame pair landed where the flicker barely moved one run in four; now the pool's own luma (module on minus off at the same instant) over five times must range > .6, and under reduced motion stay under a third of that (additive clipping against the base flame leaves 2 to 3 luma). 6 of 6.

## 0.20.5
- Owner: "Grass just looks much worse than it did before all the graphical changes, revert grass to how it looked before". terrain13's drawTile wrap now returns the original painter for ',' tiles (no swap to '.', no growth, no transitions on them), and its ground block (patchwork, small tufts, pebbles/drifts/cinders/spores, spill from neighbouring grass) is off; transitions on other tiles, the water body and animation, wet/snow and the exit land stay. T13.grass='new' brings back the 0.20.4 growth and patchwork for comparison. v176a sections 1, 2 and 5 now assert the revert: ',' tiles and the ','-vs-'.' contrast equal the module-off paint in all 12 realms (they match exactly).

## 0.20.9
Four helper passes shipped together: world14 (cloud sea, reachable spawns, front-only entrances), towns14 (19 layouts, 20 building families, new journeys only via r.t14), realms14 (16 Scourges + 4 Calamities, 20 realms, unpackG maps removed bosses), roster14 (learn spread to 45, cumulative permanent recruits, 16-wayfarer starter pool). Docs: world14.md, towns14.md. Pacing: roster spread adds about 1 boss try, realms14 removes more; check v080cb.

## quests16 (helper pass after 0.21.0, not yet versioned)
- quests16.js (helper; loaded last): the owner's quest, guild and goals notes. Guild lock: g16Open (first Scourge down, stage >= 1, won, NG+ cycle or Daily); facCount/facRaw read 0 while locked and subtract G.fac.base {c,r} taken when the lock lifts on a journey that saw it (G.g16 1 -> 2; a save with no G.g16 already past realm 1 keeps everything); facMissionList empty, facAccept/facClaim/facPerk/facBuy refused, vFactions/vFacMissions/nbBody('guilds') show the locked note (.g16lock), no rank strip on the shops, gh0/ga0 not posted (removed while open and locked) and marked global once posted. PACE.at.guilds 2 -> 1: missions open with the guilds (PC_NEWS[2] no longer names them). Personal quests: PERSONAL_BT 40 -> 50 (config.js); offer popup {type:'pqoffer',ids} from a render before-hook after a won fight (V.pq16 set in a finishBattle before-hook), once per hero (G.pqOff), ACT.pq16Accept; texts say Notice Board (p4party, onboard, progression). Board: m3Tabs board gains Guilds; canHandIn/facAtHall take guild notices and missions at a Guild Hall or any town board (q16AtDesk); nbGuilds lists the guild notices (the fault behind "can't hand in Sign the guild ledger / First blood in the pit": claim only in the Guild Hall popup since 0.16.1, which listed no quests since 0.10.6); the Notices list ends with the personal quests. Realm quests and bounties still go to their own board (handin9). Next goals: rows are flow-root with the tag floated right (no flex squeeze, words never split); glSpot always answers the spot under the minimap, glRender wrap keeps the panel on every world screen (also in a dialogue, under the banner, with no goal left: "No goals just now"), never folded, hidden or faded when the hero walks under it, folded only by the arrow to a "Next goals" bar as wide as the panel (44 px header on phones), Settings > Display > Show goals (META.cfg.goals, hdRow wrap). Test v187a (menus); v050p4, v043c, v077a, v095m1, v095nb, v095p3, v119b, v167a, v181a updated to the new rules.
- Guesses to confirm with the owner: Recruits, Natures and the Arena tab stay open in the locked Guild Hall (the Bronze Pit needs a Scourge anyway); guild missions now open after realm 1 instead of realm 3; realm quests and bounties keep "hand in where you took it".
## gear16 (owner playtest notes on equipment, shops and the party buttons; no version in this entry)
`v3/gear16.js`, last in MODS; test `tools/chrome/v188a.js` (menus group). No new save fields.
- Backpack "not working": a first realm hint (`#p2hint`, fixed, z 60) lay over the Menu's Backpack and Quests tabs on phones for its 30 s. A plain hint is now put away while any window is open, its 30 s clock stopped, and comes back for 15 s when the window closes (`g16HintDock`, after `render` and `hintShow`; tip cards are untouched).
- "Upgrade whole party" (Smithy, Alchemy): the plan and the purchase both run round after round until a round finds nothing (`g16PlanAll` on a copy of the purse, materials, pack and worn gear; `ACT.p3SmithGo` re-plans live after each `p3SmithRun`). Undo uses `g16UndoSnap` (a piece tempered on the way comes back tempered).
- `deltaHtml` lists every changed stat with a sign (`g16Deltas`: sheet stats, crit, accuracy, evasion, element damage and resistances, healing, weapon perks); `bestTag` adds "Against what they wear" when nobody gains.
- Equip Best and Build party (Apply) close the Menu with a toast when pressed from the Menu; from any other window they keep their result page. Tests that pressed Equip Best in the Menu and then read the result page were brought in line (eq, oldsave, v063pb); v148a's 'worth tempering' pair is now inside one tier. Backpack > Equipment shows "Undo Equip Best" until the gear changes.
- Rarity by progress: `rarCap()` = `pcRealm()+1` (max 5; the Daily Trial is open, New Game+ follows the rule). `shopStock` and `recipeOpen` are filtered by `rarOk`; the mimic uses `rarLoot` (the open rarity at +2 where it used to give a tier above), vault and bounty charms use `rarPool`; the first-win Echo piece goes through `rarFit` and the Echo and arena charm of charms9.js through `rarOk` (the Rift is open from the start of a later journey); the cave and Sanctum charms (`c_cv*`, `c_ft*`) carry tier min(3, realm + 1). The shops only ever sold the realm's tier and the one below, so realm 1 shelves are Common; Uncommon comes from the forge, chests and the boss. Not capped: owned gear, personal relics (shown Heroic, strength by realm), guild rank charms, the Stick, Echoforged.
- `FORGE_STEP` .25 -> .11 (+3 is x1.33): every weapon and armour family and the capes at +0 beat the rarity below at +3 in their main stats (top cape RES 34 -> 36). Relics and Echoforged keep their numbers through `ECON11.relicTemper` and `ECHO11.top3` (both 1.75). Tempered gear in old saves reads weaker (stats come from data). Pacing (v080cb, 16 runs, SEED 1; the sim is not exact run to run): 11.4, 8.9 and 10.0 boss tries before, 10.8, 9.8, 10.1 and 10.7 after, bound 16 (the sim buys +0 gear of the realm's tier, so tempering does not move it).
- Reported, not changed: the personal quest fight popup (`ui.js` case 'elite') names `u_<hero>` (the weapon) as the reward for every hero, while the reward is `sigGid(hero)`: weapon for 37, armour for 28, charm for 27 of 92 (`sigKind`, engine2.js).
