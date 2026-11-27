# Tests that fail on main, and why

As of 0.22.59: none. A full run of every group (`ci battle menus party world saves`) is green, three times in a row (see "How it was
checked" below). A red run means something again. If a test starts to fail or flicker, add it here with what is known, and fix or
retire it before trusting a full run.

The tests in `STALE` (`tools/chrome/runall.js`, each with its reason) are still not part of a group run: they were written for screens
that have since been replaced. They are not counted here.

## What the 0.22.53 list turned into (0.22.56)

The list written for 0.22.53 named six failing tests and nine flaky ones (a later note on main added v225a, v188a, v228a, sanct and v141a).
Working through it found more than a dozen others that failed or flickered on an untouched 0.22.53 build and were not on the list. Six of
all these were faults in the game; they are fixed in 0.22.56 (`docs/handoff-v0111.md`, section 0.22.56). The work was done on 0.22.53 and
merged onto 0.22.55 (the balance pass and the layering cleanup); everything below was run again on the merged game.

### Faults in the game (fixed in 0.22.56)
| Test | What it had found | Fix |
|---|---|---|
| v095m4 | On phones (344, 390 and 412 px wide): the Menu's top bar ran over itself when Quests had rewards ready (the title read "Quests 8 ready", the Save button was squeezed to 10 px over the gold); with a Back arrow, Back and Close were stacked and Close covered the sub tabs; in the Guild Hall the gold was pushed under Back and Close; the Sort and Show lists cut their chosen words ("All eleme...") | `v3/menus29.js`, `v3/shops31.js` |
| v166a | The hero sheet showed a skill's Power before the role cut, since 0.22.49 (on 0.22.53: Healing Ballad 154 where the battle row said 123; since 0.22.54 only off role skills are cut: Ombra's Grave Tithe 210 where the battle row says 105) | `v3/skills12.js` |
| v053b | On a phone, in a fight against three foes, a wide foe in the slot nearest the left edge (a Glass Gull) was cut off by the edge of the stage: its box began 9 stage px outside. This was the test's "flake": it failed whenever the journey's first fight had three foes. The same on a guardian or boss on a phone (102 px wide on a slot 37 px from the edge: its left side was cut; v173a now expects it as near the slot as the edge allows) | `v3/cohere15.js` |
| v190a | Opening a chest took 140 to 250 ms instead of 30 to 70: since 0.22.52 every chest opened (and every look at a Barred hoard quest) built a dungeon map that had never been entered | `v3/fix52.js` |
| v050p1c | In marsh towns with realm 9 first (seeds 277266 and 530674 of the scan) the Town crier stood in a pocket behind a building, shut in by a tree and a fence: nobody could walk to him and the path guard could not move him out | `v3/pathguard.js` |

### Tests that were out of date (the game was right)
| Test | What changed in the game | What the test does now |
|---|---|---|
| v051b | 0.22.57: swords have a perk of their own ("Guard blocks 65%"), the axe's is worded "+12% when it hits all foes" | knows both |
| v173a | 0.22.56: a foe's box is kept inside the stage, so a guardian on a phone stands as near its slot as the edge allows | expects that, and the whole figure inside the stage |
| v166a | Kit levels moved in 0.22.36 (Full Mend 35, Restoring Chorus 31, Toxic Cloud 35, the mage's Burst 6); since 0.22.54 a sub role skill has no percent cut (docs/balance54.md) | reads the kits at level 45; a bard's heal per cast is under a priest's like for like; the sheet and the battle row agree on an off role skill's Power |
| v095na | The Echoforge is the anvil in the Echo Rift hall (rift9.js): `efTabOn` asks for `WS.m.sanctum` | judges the Echoforge card standing in the hall. The tip gate in `v3/onboard.js` was right |
| v095m3 | The Upgrade step is the one that ends best at max temper (0.22.17), and can be a chain | the brute force performs chains too and ranks by that rule (`beats`); the sheet has gear rows and no Upgrade button since 0.17.1; charms are at the Smithy |
| v095m1 | menus11.js (0.18.4): Back leaves a board at once, the Menu remembers its last tab; quests16.js: a Personal section on Notices, guild notices taken at the Guild Hall; lists keep their order while open | follows all four |
| v095m4 | The phone frames of menus29.js and shops31.js | a row that slides sideways and a two line description are not faults; everything else is still checked (and found the faults above) |
| v080wa | The stage canvas is drawn at 4 px per stage px since the 0.18.x repaint (it was 2) | the edge limits are stage units (14 and 40 stage px) and scale with the canvas. `v3/weather7.js` was right: gale and heat streaks are no longer than before |
| nature | 0.22.10: a Legendary has one locked nature of its own (legnat20.js) | a Legendary's pool is that one nature |
| v050p5 | On a phone the Menu bar keeps the time and puts the slot in the state's title (menus29.js) | reads both |

These five are back in their groups (they were in `STALE`): v095m1, v095m3, v095m4, v095na, v080wa.

### Tests that flickered, and what made them
The common causes, for the next one that flickers:
1. **A seed that is not one.** `Math.random` replaced by a seeded generator in the page's startup script is drained by every frame drawn
   before the test starts its journey, a different count on a busy machine. Pin with `H.det` (pw.js, needs `open({freeze:true})`) around
   the start of the journey and around the step that rolls (`newChar` rolls a nature).
2. **A fight or a view the journey drew.** A random first fight can have one foe (a one target skill then fires with no target step); the
   hero's own spot, the first town's layout and a field's weather differ per journey.
3. **Auto graphics.** Headless Chrome draws WebGL in software; left on Auto the game drops to Low, which is the Flat look with smaller
   buttons, in the middle of a layout test. Pin `cfg.gfx`.
4. **A fixed sleep** where a state should be waited for.

| Test | Cause | Now |
|---|---|---|
| v050p1d | cause 2: a single foe, so no target step and no Back button | a fixed fight with two foes |
| v228a | cause 2: the wild foes decide which skill boxes carry a "strong against" line, so 4 or 5 boxes were in view | a fixed foe |
| v095p2 | cause 4: 6 s of auto battle was not always three boss turns; the guarded and the open hit were two different rolls | waits for the turns (40 s at most); both hits from one seed |
| v225a | `facRank` is remembered for 250 ms (factions.js); the test's states follow each other faster, so a plan read the Smithy prices of the state before ("planned 616, spent 676", a charm planned for one hero and worn by another). Not a fault in the game, as the note on main feared: a player's preview is on screen far longer than 250 ms. Found on main and here independently | each state clears the memo; journey and states pinned with `H.det` |
| v188a | cause 1; and the hand-me-down scenario was a near tie (17.8% against 17.2%) that the stat rolls decided | pinned; the high level warrior wears an Uncommon blade, so the low level one clearly gains more |
| v177a | cause 2: the hero's spot came from the town drawn before the seed was set; the desktop view is 7 tiles high and often held no building foot or lamp; the plain fade was judged by two spots' own brightness | seed pinned, the camera is parked beside a building and under a lamp, the fade is judged by how much each spot darkens |
| v186a | cause 2: only the maps that existed at boot had their weather cleared; a field entered later rolled its own (check 3 "hovered around zero"). And the tundra field could wear its Scourge's theme variant, whose ground is no bluer than the mesa's | clear skies on the map itself; seed pinned; the realms' own themes are compared |
| v050p1b, v051c | cause 3 | Medium pinned |
| v190a (check 2) | cause 2: the "far tile" was the last of a scan and lay in view of the entrance on fields entered from the east | the tile farthest from the entrance |
| v161a | cause 2: one of the three click candidates on screen, and that one right, failed an `n >= 2` | `n >= 1`, as its sibling check since 0.20.6 |
| v192a | the sampled palette of the peaks town's grass lands 20 to 24.2 from the painted average (scatter drawn with `Math.random`); the limit was 22 | limit 26 (a wrong colour is 60 or more away) |
| v041p1h | none: it takes about 520 s and the default limit is 600 | its own limit (1500 s) in `SLOW` |
| v142a | cause 4: a fixed 1.5 s for the HD-2D scene to bake | waits for the bake (15 s at most) |
| v059a | cause 2: the area compared reaches above the foe's head, where the badge floats, so how much of the badge it held (4 to 8 against a limit of 6) followed the foe the journey drew | a fixed foe; four grabs each way, the closest pair counts |
| v080r | `interact()` does nothing while the map change still holds the hero or a line of talk is open | those are cleared first |
| v158a | a blow that missed drew no shock ring and no hit count: any blow misses about once in thirty, even against a foe with no evasion (traced: a "Miss" popup on the failing blow) | a fixed fight, an attacker that cannot miss, real frames |
| v095m4 | headless Chrome now and then stops handing out animation frames on a Guild Hall screen at 705x455 (the page stays alive; the same on 0.22.53) and the test waited for frames alone, until the runner killed it | a frame or 300 ms; `H.frames`, `H.until` and `H.settle` in pw.js fall back to a timer the same way |
| v063pb | cause 2: the journey's fight could pay enough for the hero who is behind to level up, and the gain is read off the xp counter | a fixed fight |
| v095b | the camera punch lasts a few frames; a frame loop on a slow renderer saw the punch flag and never the scaled canvas | the stage's transform is watched as it is written |
| v191a | cause 2: 80% of the blow was more MP than the hero had left after casting the Mantle | MP to spare |
| v195a | two whole damage numbers gave a ratio of 1.38 for a factor of 1.4, with a tolerance under .02 | within .04 |
| v207a | in a lakeside town whose south gate stands one tile west of the avenue (run seed 1037402) the avenue has a one tile step in it; the test wanted one column | the road is followed from the plaza and must reach both ends |
| v070ic | the timed guard was pressed in time but the foe's blow never came to a damage roll on that hero (another hero covered) | tried again, 3 at most |
| sanct, v141a | noted on main as failing rarely; not seen in these runs | watch |

`runall.js` also fetches the old build a comparison test needs (v095na, v080ca, v050p2daily) by its full commit id when the clone is
shallow (a cloud session, a CI checkout): "OLDHTML given" failed there for no other reason.

### Left for the owner
- The hero sheet has had no Upgrade button per slot since 0.17.1: `ui.js` draws the Equipment block as `.eqsheet` rows, and the
  `p3shop.js` hook that added the buttons still looks for the old block. The popup works from the Smithy rows. v095m3 now checks what
  is there. Say if the buttons should come back.

## How it was checked
A full run is longer than one two hour job on a cloud machine, so it is two commands, one after the other (never two at once):
```
PWHTML=<abs path to out/aurelis3.html> node runall.js ci battle menus party
PWHTML=<abs path to out/aurelis3.html> node runall.js world saves
```
About 65 and 75 minutes on 4 CPUs.

## Balance, 0.22.54
The 12 fight numbers below were rerun at 180 fights a cell and acted on: see `docs/balance54.md`. Hollow King and Hoarwyrm were noise; the real low end was Siren, Frost Lich and Drake. `v080ca` is stale (same eight failures on 0.22.53).

## Balance simulation, 0.22.53 (tools/fullsim.js, SEED=7)
- `early`: first realm field and roamer fights at the intended levels win 96 to 100% with 8 to 29% HP lost. Roamers met too early (level 3 party, level 8 foes) win 41%.
- `gim 12` (12 fights each, so rough): careful play beats a Scourge at the expected level 50 to 92% of the time in every realm; auto play 8 to 83%. Opening reactions in the first realm (0.22.42) did not make the first Scourge easy: 50 to 92% careful, 17 to 67% auto.
- Hardest: Ysolde (25 to 50% careful), Hoarwyrm (50 to 75%), Hollow King (42%). Worth a look with more runs before changing numbers.
