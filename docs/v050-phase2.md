# Beta v0.5.0, Phase 2: battle and world logic (worktree report)

Scope: items 2.1 to 2.7 of `docs/v050-prompt.md`. GAME_VERSION, the changelog and the design notes are untouched (the lead merges those).
Save keys and db schemas are unchanged. The Daily Trial is unchanged (checked against the pre-phase build, see Tests).

Most of the work lives in one new file, `v3/p2world.js`, loaded last (`v3build.py`: after `ambience.js`). It wraps existing functions with the
usual `{const f=orig;orig=function(){...}}` pattern. Direct edits to shared files are small: `v3/bg.js` (the six field backdrops redrawn on
one ground line), `v3/battle.js` (the dungeon hall and arena backdrops on the same line, and two lines in `drawUnit` for the shadow and the
flyer bob), `v3/config.js` (one new block after the encounter settings) and `v3build.py` (one file added).

New config keys (`v3/config.js`, block "Beta v0.5.0 phase 2"): `BATTLE_GROUND {gy:.5,top:.56,bot:.96,hover:9}`, `SURPRISE {free:1}`,
`DUAL_FROM 1`, `TOWN_LANE 2`, `HINTS_UNTIL 1`, `HINT_DELAY 1400`.

New optional save fields (all default safely; nothing in the journey save `G` changed):
- `META.hints` `{id: text}`: hints already shown (account wide), read back by Guides > Hints. Missing means none shown.
- `META.cfg.hints`: `false` turns hints off. Missing means on.
- Map objects (rebuilt from the seed, never saved): `m.lane` (town lane tiles), `m.laneDone`, `gates[g].moved`; battle spec `spec.bg`
  (terrain under the party), `spec.surprise`, `B.surprise`; foe `e.single` (shown with one type in the first realm).

Test hook: `window.__P2` (in p2world.js) exposes the phase 2 functions and live getters, so `shell.html`'s `__A` line did not need edits.

## Checklist

| Item | Status | Notes |
|---|---|---|
| 2.1 Battle backdrops and ground | Done | Terrain picked backdrops, one ground plane for every backdrop, flyers hover over a shadow, boss stages |
| 2.2 Surprise advantage | Done | Free first round with a "Surprise!" banner; elite no auto rule kept |
| 2.3 Material placement | Done | Wood by trees, ore by rock/cliff/wall, herbs on grass/flowers; never on roads; matching prop under each |
| 2.4 Town exits | Done | 2 wide clear lane from every gate to the main roads; gates with only a detour move along their own edge |
| 2.5 Dungeon entrance variety | Done | 7 new looks plus the old facade, picked per realm; upright, lit, distinct from cave mouths and gatehouses |
| 2.6 Dual types come later | Done | Wayfarer pools, subset draw, regular monster types and the Bestiary; stage 1 balance re-run |
| 2.7 Early game hints | Done | 7 hints, once each, skippable, Settings toggle, Guides > Hints |

### 2.1 Battle backdrops and ground (done)
- Every backdrop now has one solid ground plane from `bgGY(H)` (`BATTLE_GROUND.gy`, 50% of the stage) down. Water (the coast sea), lava
  (the cave river) and cloud seas (heights) are drawn only above that line as far scenery. `BG_HAZ` (bg.js) lists their colours.
  Before: the coast drew the sea from 50% to 72% of the stage height and the cave a lava band from 58% to 64%, while unit feet start at
  49% (phone stage) or 60% (wide stage), so units stood on water and lava, and the meadow hills and heights cloud band sat under the back row.
- `unitBox` is wrapped: slot heights map into `[top, bot]` of the stage (`p2GroundY`), so every unit's feet land on the ground plane
  in both the tall phone stage and the 320x150 wide stage. Boxes get `gy` (ground y). Flying foes (`e.ty` includes `flying`) get `hov` and
  are drawn `hover` px above `gy` with a gentle bob; `drawUnit` draws the shadow at `gy`, smaller for flyers.
- Backdrop from terrain: `startBattle` notes `spec.bg={th,k,g}` when a battle starts in the world (never in the Daily Trial). `bgGroundAt`
  reads the tile under the party: road, bridge or plaza = road; rubble = rock; 3+ trees within 2 tiles = forest; flowers; tall grass; else the
  theme's natural ground (meadow grass, coast sand, cave rock, snow, heights highland grass, void stone). Party tiles are never hazards.
  Keys: `f:<theme>:<ground>` (66 combinations, theme sky plus `bgPaintGround`), `c_<theme>` natural caves for side caves,
  `d_<theme>` halls for dungeons and fortresses, `boss_<theme>` purpose built boss stages (gate, braziers, banners, dais, rune circle) for
  boss, echoBoss, storyEcho and mini fights, `arena` unchanged. Daily and arena keep the old choice of key.
- Backdrops draw from their own seeded R (`pkR`), never from the battle RNG (the old meadow/coast painters used `pick`, which consumes
  `RNG()` the first time a backdrop is drawn).
- Files: `v3/bg.js` (BG themes, `BG_HAZ`, `bgGY`, `pkR`, `bgAnim` uses the new lines and animates `f:` keys like their theme),
  `v3/battle.js` (`d_` and arena on `bgGY`; `drawUnit` shadow and bob), `v3/p2world.js` (`bgGroundAt`, `bgPaintGround`, `c_`, `boss_`,
  `battleTheme` and `unitBox` wrappers).

### 2.2 Surprise advantage (done)
- `roamFight` is wrapped to note whether the roamer was still on patrol (it had not seen the party). A roamer chasing you, or walking home
  after losing you, saw you first and fights normally.
- On a surprise start (`p2Surprise`): every front line hero gets the next turn, and every foe's first turn waits until just before the
  earliest second action of any hero (`SURPRISE.free` rounds), so the whole line acts once before any foe. Banner "Surprise!" and a log line.
- Elite roamers still get the surprise but keep "No auto in elite fights" (`autoBan` unchanged). Never in the Daily Trial.

### 2.3 Material placement (done)
- `placeNodes` replaced (same seed, same counts): a spot must fit its type (`nodeFits`): wood beside a tree (`T`), ore beside rock, cliff or
  wall (`# R Z r`), herbs on tall grass or flowers or beside flowers. Never on roads, plazas, bridges, stairs, doors or gates. If a map has no
  fitting spot for the drawn type (dungeons have no trees), another type that fits is used. Spots that a later step makes solid (fortress
  gatehouse) are dropped in the `getMap` wrapper.
- Field spots now come from every reachable open tile, not only the off-road list, so wood and ore can sit at forest edges and cliff feet.
- `drawNode` adds a matching prop: a stump by the log, a vein streak by the ore, turf under the herbs.
- The old rule is kept as `P2.placeNodes0` for the test (it put 1745 of 3323 spots on unmatched ground).

### 2.4 Town exits (done)
- `laneFix` (getMap wrapper, towns only, deterministic): for each gate, a cheapest 2x2 block path (`laneFind`, `TOWN_LANE` wide) from the
  gate mouth to the main roads (the `=` and `:` tiles of the town plan before any gate was cut, `laneMain`). Decoration in the way (trees,
  bushes, crates, barrels, hay, carts, stalls, lamps, banners, anvils, braziers, graves, stones, tents, pillars, rubble) is cleared and the
  lane is paved; water is bridged at a high cost. Buildings, walls, signs, boards, fountains, waystones and chests are never moved.
- If the only lane is a long detour, the gate moves along its own edge (`laneMove`, the side never changes, so the world plan, the gate's
  name and diagonal rules stay; nearer spots preferred): the old opening is closed with the edge's wall, the exits keep their `to`, and the
  gate's `cells`, `x`, `y` and `arrive` move with it. Gate width stays 3 tiles.
- Townsfolk standing in a lane are moved out (`laneEvict`), cannot wander into one (`npcTick` wrapper), and festival visitors are moved out.
- Old saves: a town rebuilt from the seed gets the same lanes every time. A save made standing on a closed old gate tile falls back to the
  inn (existing `enterWorldFromSave` rule).

### 2.5 Dungeon entrance variety (done)
- `ENT_STYLES` per tileset, picked by the realm index (`entStyleFor`): roots (a great hollow stump), barrow (a grassy mound with a stone
  door), well (a collapsed well with a broken beam), trapdoor (an open hatch with a ladder), rock face (a carved door in a cliff), hole (a pit
  with a rope ladder and a flag), ruin (broken columns over stairs), and the old carved facade. 8 looks across the 22 realms.
- All are drawn upright (as before), have a dark opening on the entrance tile and two warm lamps so they read clearly; side caves keep the
  rock arch with a blue glow and fortresses the grey gatehouse with red banners. Drawn through an `obj2('facade')` wrapper for field maps.

### 2.6 Dual types come later (done)
- `DUAL_FROM` (1 = the second realm). Wayfarers: `tvPool`, `challEligible`, `rarePool` and `cePool` drop dual type wayfarers while
  `G.stage < DUAL_FROM` (so the tavern, the challenge board, rare visitors and chance meetings, duels included).
- Subset draw: `subReq` also requires 4 early (`s` or `t0`) single type wayfarers besides the starters, so the first tavern is never empty.
  Affects new journeys only (saved subsets are kept).
- Monsters: `encounterFoes` is wrapped (`p2SingleFoes`): in field and dungeon battles at stages below `DUAL_FROM`, regular foes show only
  their first type (a new array, the monster table is untouched). Bosses, minibosses, elites (bounties and elite roamers), mimics, duels,
  the arena, legend fights and the Daily Trial keep both types. Old journeys (six original realms) open in Verdane Meadows, whose pool is
  single type already, so they play as before.
- Bestiary: a dual type foe's page says "In the first realm it shows only its X type; both types appear from the second realm on."
- Balance, see below.

### 2.7 Early game hints (done)
- `HINTS` (7): `sheet` (the lead hero's weapon families and where the sheet is), `types` (first battle: elements and foe types), `flyer`
  (a battle with a flyer; names the party's ranged heroes, e.g. "Tess is strong against flying foes"), `primer` (names the party's primer and
  detonator skills when they have them), `weapons` (after a win: weapon families and perks for a hero), `armor` (back in town: armor weights,
  with each party member's weight), `rest` (after a win with a hurt hero).
- Each shows once per account, only while `G.stage < HINTS_UNTIL`, never in the Daily Trial, and only when Settings > Hints is on. One at
  a time, after `HINT_DELAY`, as a small card (top in the world, bottom in battle) that never blocks input: Got it, or Turn off hints. It
  hides itself after 16 s. Reduced motion drops the fade.
- Settings gets a Hints On/Off row (wrapped `settingsBody`, appended at the end). Guides gets a Hints tab before Help listing every hint
  shown, with Turn hints on/off and Show them again.

## Tests

New tests (all pass on this branch):
- `tools/chrome/v050p2bg.js` (2.1): every key in `BG` (91 backdrops) in the tall phone stage (390x844) and the wide stage (932x430), with
  6 heroes and 5 foes (2 flyers): every foot (or flyer shadow) on the ground plane, no hazard colour under any unit or anywhere on the ground
  plane, flyers hover, ground units do not float, the live battle uses the requested backdrop and draws a frame; road tile gives the road
  backdrop, tall grass reads as tall grass, boss fights use a boss stage. Screenshots `/tmp/pw_p2bg_*.png`.
- `tools/chrome/v050p2world.js [seeds]` (2.3, 2.4, 2.5): every realm (22) at every stage (5) for 3 seeds: 330 towns of all six types, 660
  gates: the old layouts fail the lane check (136 of 660), the new ones all have a clear 2 wide lane, no long detour (64 gates moved), every
  exit, gate arrival and service door reachable, every gate on its own edge with its 3 tile width; 904 fields, dungeons and caves: one
  check per node type (wood 1152, ore 7452, herb 2487 spots, all fitting; the old rule misplaced 1745 of 3323); entrances: 8 looks across
  the realms, all upright with an opening on the entrance tile, none equal to the cave mouth. Screenshot `/tmp/pw_p2_entrances.png`.
- `tools/chrome/v050p2b.js` (2.2, 2.6, 2.7): surprise from an unaware roamer (order heroes first), none from a chaser, elite keeps no
  auto; no dual type regular foes at stage 1 in Mirefen Marsh (0 of about 1250), dual types at stage 2, elites keep both, tavern/challenge/
  chance/rare pools single type at stage 1 and dual later, subset worst case 4 early single type wayfarers over 60 seeds, Bestiary note;
  hints show, close, never repeat, run during battle without blocking, name party heroes, turn off, Settings row, Guides list, none in realm 2.
- `tools/chrome/v050p2daily.js`: starts the Daily Trial in the pre-phase build (`OLDHTML`) and this build: same seed, weather, heroes, foes
  with their types, turn order and backdrop key; no surprise. PASS.
- `tools/v050p2sim.js N level [off]` (node, needs `tools/v3`): the stage 1 balance sweep below.

Existing tests re-run on this branch and on the pre-phase build, same results on both: `wide` 38/38, `v043` 13 pass 2 fail (version string
check, pre-existing), `v043b`, `v043c`, `v041p46` (roamers), `v041p4`, `v041p47` (fortresses), `v041p2`, `v041p26`, `v041p44`, `v041p5`,
`v041p6`, `v041p6b`, `v041p64`, `sanct`, `v041old`, `v041p1a`, `v041p1b`, `oldsave`, `collide`, `tavern`, `v040p5`, `v040p789`, `savesys` 38/38 all pass.
(`lever`, `v030` need `@sparticuz/chromium`, `saveformats` and `world6` read `out/aurelis.html`: they cannot run here on either build.)
`node tools/worldtest.js 20`: V3 ALL OK. No page errors in any run.

## Balance (2.6), stage 1, party of 3 at level 3

`node tools/v050p2sim.js 100 3 off` (before) and `node tools/v050p2sim.js 100 3` (after): 100 field battles in each of the 13 realms that
can open a journey (Verdane Meadows and the 12 standard realms) placed at stage 1, careful brain and auto. (The sim loads realmdata and the
realm variants but not the boss overlays or realm weather.)

| | careful win | careful HP lost | auto win | auto HP lost | dual type foes |
|---|---|---|---|---|---|
| before | 95.8% | 10.6% | 96.0% | 10.1% | 50.3% |
| after | 96.3% | 9.5% | 96.6% | 9.2% | 0% |

The biggest moves per realm (careful HP lost, before to after): Mirefen Marsh 8 to 5%, Gullreach Strand 11 to 8%, Cinderhollow Deeps 12 to 8%,
Glacier Teeth 22 to 14%. Realms with few dual types (Verdane, Thistlewold, Willowmere) are unchanged. Stage 1 stays gentle; no retune needed.

Also re-run (no expected change, the numbers move only by sim noise since battle seeds are random):
- `earlysim.js 100 3` (Verdane Meadows): before careful 100% / 4% HP, auto 99% / 5%; after (with the phase 2 rule loaded) careful 99% / 5%,
  auto 99% / 5%.
- `bosswin.js 48 6 -1 0` and `bosswin.js 48 3 -1 0` (stage 1 Scourge at level 7): before party 6 83%, party 3 17%; after 84%, 16%.
  Bosses keep both types.

## Risks for merging
- `v3/bg.js`: the six themes were rewritten in place (one ground line). Phase 6 (parallax that follows 2.1) should build on this file.
- `v3/battle.js`: hunks in the `d_`/arena backdrop block (top of file) and in `drawUnit` (the shadow line). Phase 1 (wide screen after
  battle, back button) is likely to touch `layoutBattle` and the menu, which are separate hunks.
- `v3/config.js`: one block inserted after the `CE_ODDS` line (not at the end of the file, to avoid append conflicts).
- `v3build.py`: `p2world.js` appended after `ambience.js`; keep it last (it wraps `startBattle`, `encounterFoes`, `getMap`, `battleTheme`,
  `unitBox`, `obj2`, `drawObjects`, `tvPool`, `cePool`, `challEligible`, `rarePool`, `subReq`, `settingsBody`, `mMenu`, `showLocation`,
  `finishBattle`, `roamFight`, `npcTick`, `festive`, `drawNode`, and replaces `placeNodes`).
- Phase 1 1.1 (tavern cap removal) edits `tavern2.js`; phase 2 only wraps `tvPool` and `subReq` from p2world.js, so they compose.
- Phase 1 1.3 (assets off paths) may also validate gathering spots or town props: p2world.js runs after generation (`getMap` wrapper) and
  only clears decoration, so a validation that runs inside `getMap` sees phase 2's lanes only if it runs after this wrapper.
- Phase 5 settings work: the Hints row is appended to whatever `settingsBody` returns, so it survives a Settings rewrite as long as the
  function keeps its name.
- `tools/chrome/pw.js` was edited locally to `require('playwright')` and is not committed (the lead has that fix).
