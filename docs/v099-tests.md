# v0.9.9 tests: flaky tests hardened, the runner

Owner's goal: "A few tests fail under machine load and slow every release; harden them." Only `tools/` and `docs/` changed; no game code.

## How it was measured

Every runnable Chrome test (149, stale ones included) ran three times, one test at a time, on the v0.9.8 build (`sh build.sh`,
`PWHTML=../../out/aurelis3.html`), with `tools/chrome/runall.js`. The machine was shared: other helpers ran their own builds and tests at
the same time (each row of the runner's report records the load average before and after it). Before = the tests as they were at
976c677; after = this pass. The container restarted twice during the measurement, so the runs came in pieces (each test has 3 runs, the
first 25 alphabetically 4); load average over the "before" runs: median 4.2 on 4 CPUs (0.7 to 8.7), over the "after" runs: median 2.2
(0.7 to 7.1). Because "after" happened to see less load, the formerly flaky and timing sensitive tests were also run 3 more times with six
extra busy loops on the CPUs (load 7 to 9.5): v050p5c, v071wt, v050p6a, audioplay, smithy3, smithyfuzz, v077wb, v063ba, v053ua,
v062a, v063wo, v041p46, v041p1b, v070m2 and v070ic all passed 3 of 3 (v070ic after its last change, below; that stress run is what found it).

### Flaky before (passed some runs, failed others)

| test | before | after | failing check before | cause |
|---|---|---|---|---|
| audio | 3/4 | 3/3 | cal2 seamless loop: seam step 0.726 vs 0.347 (and the -0.99 dBFS peak of the cleanup baseline) | percussion noise starts at a `Math.random` offset |
| audioplay | 3/4 | 6/6 | p95 frame time 66.7 ms (limit 34) at load 4.7 | raw ms limit on a busy machine |
| smithyfuzz | 3/4 | 3/3 | crash in `shopStock` (G null) | a random click quit to the title, the next Smithy opened with no game |
| v050p1c | 2/3 | 0/3 | field: f0 seed 807839, chest on a path tile | realm draw from `Date.now`; a real game bug (below) |
| v050p5c | 2/3 | 3/3 (+3 under stress) | time of day: dawn > day did not blend | clocks read by the draw moved between frames; realm and tier not fixed (below) |
| v050p6a | 2/3 | 3/3 | Auto keeps High while frames are fast: medium | the machine itself under 45 fps |
| v071wt | 2/3 | 3/3 | the road gate walk stopped with why "input" | walk started while the key's step was still under way (not reproduced since) |
| v077wb | 1/3 | 3/3 | medium field rain / fog: at least 50 fps (45.3, 47.9) | raw fps line on a busy machine |
| v077wa | 3/3 (cleanup baseline: flaky) | 0/3 | 2D medium storm: 1 weather particle on the hero's face (in a later "after" round of the old version) | realm draw and camera not at rest; a real game bug (below) |

Also listed as flaky by the owner and passing every run here, hardened anyway: v063wo, v062a, v080b, v063ba, v053ua, smithy3, v041p46.

### Failed every run before, for a reason this pass fixed in the test

| test | before | after | why it failed |
|---|---|---|---|
| v041old, v050p4b | 0/3 | 3/3 | read `G` in the same tick as Continue (since v0.8.5 Continue waits for the save sync) |
| v041p1b, v070ia, v070ic, v070m2 | 0/3 | 3/3 | Auto per foe type (v0.9.8) left Auto locked; v070ia timed out at 900 s |
| v041p47 | 0/3 | 3/3 | look keys gained a `%material` suffix (v0.8.2) |
| v095m2 | 0/3 | 3/3 | written before the realm gates were merged (missions open in the third realm) |

After: 127 of the 129 non-stale tests passed 3 of 3. The two that fail every run fail on real game bugs (below); nothing is flaky in this
measurement. Stale tests: 20, each failing its known check (run once).

## Stale tests (fail the same way on every run, for an old reason)

They are listed in `STALE` in `runall.js` with the reason, are left out of `all` and run with `node runall.js stale` (or `--stale`).
From the v0.8.0 cleanup baseline: liveboot-v046, p4b, sw, v040p1, v040p3, v041p1e, v041p1g, v041p5, v041p54, v041p6b, v050p5b, v053s.
`v050p5` passes now and left the list. Found stale in this pass (a rule a later version changed on purpose; the test was not updated):

| test | failing check | why |
|---|---|---|
| oldsave | every new screen renders on the old save (bond row) | bonds open in the second realm since v0.9.5 (pacing.js) |
| p5b | hero sheet bond button | the same |
| v040p789 | mission claim gives standing | three guild ranks since v0.9.5 |
| v041p65 | using Auto marks the battle | Auto is locked per foe type until beaten by hand since v0.9.8 |
| v043c | Accept all on bounties and faction missions | the Notice Board replaced those lists in v0.9.5 |
| v077a | a mission already done can be claimed after accepting | guild missions moved to the Notice Board in v0.9.5 |
| v080cb | journey sim: top hero level 39 to 41 | v0.9.5 retuned encounters and rewards; the seeded sim reads 42.3 every run |
| v041p1g | (sanity) the meadow field backdrop animates | the first field is not always a meadow since the realms, and no field backdrop moves in the sampled band any more |

Tests that failed every run for an old reason and were cheap to bring up to date (the check itself unchanged):
oldsave, v041old, v050p4b (Continue waits for the save sync since v0.8.5: the test now waits for the journey instead of reading `G` in
the same tick; oldsave then stops at its stale bond check), v041p47 (look keys end in `%material` since v0.8.2), v095m2 (written before
the realm gates were merged: its journey drops `G.pcV` like an old journey; the gates are checked in v095p3), v070ia, v070ic, v070m2 and
v041p1b (Auto per foe type, v0.9.8: the foes of the test battle count as beaten by hand, see `AUTO_OK` below).

## Real game issues found (reported, not fixed: v3/ is out of scope)

1. Chest on a path (`v050p1c`, fails 3 of 3 now). The test was "flaky" because each run scanned the maps of whatever realms the journey
   drew from `Date.now`. It now scans a fixed set of realm draws (the first realm goes round all twelve), and one of them fails every time:
   the first field `f0` with the run seed 807839 (k = 102) and realm 12 first puts a chest on a path tile at 20,28 (`pathAssets`:
   `C@20,28 path`; any order with 12 first gives it). A map generation bug (worldgen / pathguard).
2. Rain ripples over the hero's face (`v077wa`, fails 3 of 3 now). On the pinned journey, 2D Medium, rain and storm: the ripple rings of
   a puddle just north of the hero land inside his face ellipse in 57 of 150 moments. `w7Puddles` (weather7.js) fades a puddle and its
   rings by `w7HeroK` at the puddle's centre only, and the 2D weather layer is drawn after the actors (worldrt.js worldDraw), so the rings
   paint over his face. Unpinned runs met it rarely (one hit in 124,623 once), which is why the test looked flaky.
3. Surge weathers mostly jump at dawn > day (borderline, `v050p5c` passes on its pinned journey). With a surge weather, the mid blend
   frame of dawn > day is already 85 to 90% of the way to day in every realm (the test wants each half above 15%: measured 13 to 22% for
   the second half), so the outcome depended on the realm drawn. Not a test problem: part of that look follows the clock phase without the
   blend.
4. Fog at Low does not blend the time of day (`v050p5c` with gfx Low: dusk > night and dawn > day start from a different look, d0 15).
   The test runs at Medium (Auto's start tier); before, a busy machine could drop Auto to Low and fail it.

## The helpers (tools/chrome/pw.js)

- `open({freeze:true})` installs a controllable clock before the game loads: `Date.now` and `new Date()` run from a fixed epoch
  (2026-01-01) and never go backwards.
- `H.det(fn,arg,seed)` evaluates `fn` with `Math.random` seeded and the clock pinned to a fixed instant (the k-th pin of a page gets the
  k-th instant), so the journey's realm draw, map picks and anything else read in that call are the same on every run.
  `PWFREEZE=0` turns `det` into a plain evaluate on the real clock and `Math.random`, to run a test unfrozen.
- `H.frames(n)`, `H.until(fn,arg,{timeout})` (poll every frame until `fn` is truthy, or `{timeout:true,last}`),
  `H.settle(fn,arg,{frames,timeout})` (until `fn`'s JSON is the same for N frames in a row: layout stable, camera at rest).
- `H.cpu()` / `loadFactor(page)`: the larger of a fixed JS loop timed in the page against `CPU_REF` (12 ms on this container, `PWCPUREF`
  overrides) and the 1 minute load average per CPU; at least 1.
- `perfChk(H,name,ms,limit)`: a time limit that passes under `limit x loadFactor` and prints the raw number and the factor.
- `frameFactor(browser)`: an empty page's p95 frame interval / 17 ms (reported by frame rate checks).
- `v063lib.js`: `rest(H)` (the camera punch over and the stage, order bar and boss bar boxes still for 3 frames; `rects` calls it first)
  and `AUTO_OK` (the current foes count as beaten by hand and a boss fight as won once, for tests that run a battle on Auto).

Nothing retries a whole test. Polls are used only where the thing tested is asynchronous (a fade, a save sync, a battle in real time).

## What changed per test

Load and timing (the flaky ones):
- `v050p5c` (dawn > day and other blends): the frames are drawn by hand at a fixed `now`, but the draw also reads the location banner's
  fade (`Date.now`), the arrival fade-in and the chest animations (`performance.now`); on a busy machine more time passed between two
  frames and the banner's alpha moved the "start from the old look" difference over its line. Each hand drawn frame now holds both clocks
  at the frame's moment (the test's stated intent: "only the blend moves"). The journey is pinned (`H.det`) and the tier is Medium, so
  the scene is the same every run (issues 3 and 4 above). The blend cost check alternates plain and blending batches and keeps the best
  of each.
- `v071wt` (the road gate walk stopped with why "input"): the gate walk now starts from rest (no step under way, no key, drag, tap, pad
  or joystick held; `H.until`, 8 s), and when a walk stops early the check prints the input sources the walk saw (`inputSources()`), so
  a repeat names its cause. It could not be reproduced again in 8 runs (4 with extra CPU load); no game bug is known here.
- `v063ba` (label overlaps during the camera zoom) and every test using `v063lib.rects` (v063bb/bc/bd, v070ib, v070ob, v076b, v095b):
  `rects` measures after `rest(H)`: the camera punch over and the stage boxes still for 3 frames, instead of a fixed 160 ms.
- `v053ua` (touch targets): the battle and results buttons are measured once they exist and every finite animation has finished (as the
  menu ones already were), instead of after a fixed 0.7 / 0.9 s.
- `v063wo` (chest, ambience counts) and `v062a` (lighting): the journey is started inside `H.det`, so the realms, the meadow field, the
  chest picked, the town's lamps and the first dungeon's theme are the same every run; the opened chest's fade is polled for up to 6 s
  instead of one 1.4 s sleep.
- `v050p1c`: the start is pinned and every seed gets its own fixed realm draw (see the bug above).
- `v041p46` (roamer battle): the journey is pinned; the roamer used is one the hero can reach (one behind the locked door sent the hero
  back to the entrance, so contact never happened on some journeys); contact gets 20 s of real time to turn into a battle.
- `v050p6a`: "Auto keeps High while frames are fast" is checked against the frame rate the page really measured (a busy machine under
  45 fps must step down; `GFX.fps` is rounded); the "layers move" check runs on a pinned journey (some towns have no moving decor);
  `page.waitForFunction` became `H.until`.
- `smithy3` (render time limits): `perfChk`, the 600 ms line times the load factor.
- `audioplay` (p95 frame time): over 34 ms the line is scaled by the load factor, and the same battle is measured with the audio context
  suspended as the run's own baseline: the music may not cost more than a quarter of the battle's own frame time.
- `v077wb` (50 fps budget): without PWBASE the 50 fps line is divided by the load factor measured right after each sample (PWBASE, the
  before/after comparison on the same machine, is unchanged).
- `audio` (peak, seam): percussion started its noise at a `Math.random` offset, so the cal2 peak and its loop seam moved from run to run
  (-0.99 dBFS once; seam 0.726 vs 0.347 once). The samples are loaded first, then the render runs with a seeded `Math.random`; every
  track now renders the same on every run (cal2: peak -1.39 dBFS, seam 0.591 vs 0.362). `PWFREEZE=0` renders with the real one.
- `smithyfuzz`: a random click can leave the journey (Menu > quit to title); the next Smithy was then drawn with no game at all and
  crashed in `shopStock`. A fresh journey is started instead.
- `v041p1b`, `v070ia`, `v070ic`, `v070m2`: Auto per foe type (v0.9.8) kept Auto locked, so the battles stood at the first hero turn and
  the checks only passed when enough enemy moves came first (or timed out: v070ia ran 900 s). `AUTO_OK` marks the foes as beaten by
  hand; the battle watches are time based (until N moves or 20 to 40 s) instead of a count of short sleeps. v070ic waits for a timed
  press's damage to land before reading it, and under heavy load (load 8 on 4 CPUs) its guard ring check met the game's turn watchdog
  (engine.js `WD_MS`, 4 s), which replaces a stalled enemy turn with a plain attack that carries no timed result: only when the watchdog
  fired during that turn is the guard tried again (3 at most); the failure message lists the watchdog entries.

Old reasons (failed every run): `oldsave`, `v041old`, `v050p4b` (wait for the journey after Continue), `v041p47` (look key), `v095m2`
(journey without the realm gates), listed above.

- `v077wa` (particle on face counts): the journey is pinned and the 2D sweeps wait for the camera to rest (`H.settle` on the camera and
  the hero's tile, 5 frames) after placing the hero, since the weather scrolls with the camera; this exposed issue 2 above.

`v080b` (battle start shift) passed every run before and after and is unchanged: its check already reads layout boxes on every frame
and waits for the first hero turn.

## The runner (tools/chrome/runall.js)

```
cd tools/chrome
PWHTML=../../out/aurelis3.html node runall.js                 # every runnable test that is not stale, once
PWHTML=../../out/aurelis3.html node runall.js battle --repeat 3
PWHTML=../../out/aurelis3.html node runall.js v063wo v071wt   # named tests
node runall.js --list                                          # groups, stale tests and why, the skipped scripts
```

- Sets: `all`, a group (`battle`, `world`, `menus`, `party`, `saves`, `audio`, `title`, `app`), test names, `stale`. `--stale` adds the
  stale tests to `all` or a group (they are reported as STALE, not as failures).
- One test at a time (they measure layout, frame times and timings), each in its own process group, killed with its browsers after its
  timeout (`--timeout SEC`, default 600; slow tests have their own in `SLOW`).
- Prints a line per run (PASS / FAIL / STALE, seconds, round, load average before and after, the first failing check) and a summary table
  (pass count per test, average and longest time, every distinct failing check), and writes a JSON report (`--json FILE`, default
  `runall-report.json` in `RUNALL_OUT` or the temp dir) after every test, so a stopped run keeps what it measured.
- `PWHTML` is the build under test. Tests that compare with an older build get `OLDHTML` (that file for all of them) or, by default, the
  committed index.html of the revision in `OLD` (v050p2daily and v095na: fab13f2, v0.9.7; v080ca: 927e63e, v0.8.1) taken with git show.
- Exit code 0 only when every non-stale test passed every round.
- Not runnable here (listed by `--list`): the puppeteer/@sparticuz tests, the ones that need the pre-v3 build, helpers, the runners
  `v050p6suite.js`, `v053suite.sh`, `v063suite.sh`, and the `*shots*`, `*sheet*`, `*perf*` scripts.
