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
