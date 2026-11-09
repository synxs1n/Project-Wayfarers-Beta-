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
