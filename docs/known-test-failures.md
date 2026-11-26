# Tests that fail on main, and why

As of 0.22.54: none. A full run of every group (`ci battle menus party world saves`) is green, three times in a row (see "How it was
checked" below). A red run means something again. If a test starts to fail or flicker, add it here with what is known, and fix or
retire it before trusting a full run.

The tests in `STALE` (`tools/chrome/runall.js`, each with its reason) are still not part of a group run: they were written for screens
that have since been replaced. They are not counted here.

## What the 0.22.53 list turned into (0.22.54)

The list written for 0.22.53 named six failing tests and nine flaky ones. Working through it found eleven more that failed or flickered
on an untouched 0.22.53 build and were not on the list. Five of all these were faults in the game; they are fixed in 0.22.54
(`docs/handoff-v0111.md`, section 0.22.54).

### Faults in the game (fixed in 0.22.54)
| Test | What it had found | Fix |
|---|---|---|
| v095m4 | On phones (344, 390 and 412 px wide): the Menu's top bar ran over itself when Quests had rewards ready (the title read "Quests 8 ready", the Save button was squeezed to 10 px over the gold); with a Back arrow, Back and Close were stacked and Close covered the sub tabs; in the Guild Hall the gold was pushed under Back and Close; the Sort and Show lists cut their chosen words ("All eleme...") | `v3/menus29.js`, `v3/shops31.js` |
| v166a | The hero sheet showed a secondary role skill's Power before the role cut (154 where the battle row said 123), since 0.22.49 | `v3/skills12.js` |
| v190a | Opening a chest took 140 to 250 ms instead of 30 to 70: since 0.22.52 every chest opened (and every look at a Barred hoard quest) built a dungeon map that had never been entered | `v3/fix52.js` |
| v050p1c | In marsh towns with realm 9 first (seeds 277266 and 530674 of the scan) the Town crier stood in a pocket behind a building, shut in by a tree and a fence: nobody could walk to him and the path guard could not move him out | `v3/pathguard.js` |

### Tests that were out of date (the game was right)
| Test | What changed in the game | What the test does now |
|---|---|---|
| v166a | Kit levels moved in 0.22.36 (Full Mend 35, Restoring Chorus 31, Toxic Cloud 35, the mage's Burst 6); heals are .88 of what they were | reads the kits at level 45; Healing Ballad Power 123 |
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
| v053b | cause 4: units measured while the entrance slide or the camera push still moved them | measured at rest (`H.settle`) |
| v225a | `facRank` is remembered for 250 ms (factions.js); the test's states follow each other faster, so a plan read the Smithy prices of the state before ("planned 616, spent 676"). Not something a player meets: the preview is on screen far longer | each state clears the memo; journey and states pinned with `H.det` |
| v188a | cause 1; and the hand-me-down scenario was a near tie (17.8% against 17.2%) that the stat rolls decided | pinned; the high level warrior wears an Uncommon blade, so the low level one clearly gains more |
| v177a | cause 2: the hero's spot came from the town drawn before the seed was set; the desktop view is 7 tiles high and often held no building foot or lamp; the plain fade was judged by two spots' own brightness | seed pinned, the camera is parked beside a building and under a lamp, the fade is judged by how much each spot darkens |
| v186a | cause 2: only the maps that existed at boot had their weather cleared; a field entered later rolled its own (check 3 "hovered around zero") | clear skies on the map itself; seed pinned |
| v050p1b, v051c | cause 3 | Medium pinned |
| v190a (check 2) | cause 2: the "far tile" was the last of a scan and lay in view of the entrance on fields entered from the east | the tile farthest from the entrance |
| v161a | cause 2: one of the three click candidates on screen, and that one right, failed an `n >= 2` | `n >= 1`, as its sibling check since 0.20.6 |
| v192a | the sampled palette of the peaks town's grass lands 20 to 24.2 from the painted average (scatter drawn with `Math.random`); the limit was 22 | limit 26 (a wrong colour is 60 or more away) |
| v041p1h | none: it takes about 520 s and the default limit is 600 | its own limit (1500 s) in `SLOW` |

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

## Balance simulation, 0.22.53 (tools/fullsim.js, SEED=7)
- `early`: first realm field and roamer fights at the intended levels win 96 to 100% with 8 to 29% HP lost. Roamers met too early (level 3 party, level 8 foes) win 41%.
- `gim 12` (12 fights each, so rough): careful play beats a Scourge at the expected level 50 to 92% of the time in every realm; auto play 8 to 83%. Opening reactions in the first realm (0.22.42) did not make the first Scourge easy: 50 to 92% careful, 17 to 67% auto.
- Hardest: Ysolde (25 to 50% careful), Hoarwyrm (50 to 75%), Hollow King (42%). Worth a look with more runs before changing numbers.
