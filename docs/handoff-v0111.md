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
