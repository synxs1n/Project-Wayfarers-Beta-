# Tests that fail on main, and why (as of 0.22.53)

A red run should mean something. These are the tests that fail or flicker on an untouched build. Fix or retire them before trusting a full run.

## Fail every time
| Test | What fails | Cause | Status |
|---|---|---|---|
| v166a | crashes at line 68 (`pw` of undefined) | reads a healer skill by an id the kits no longer have (the kits changed in 0.22.36) | the first check (a Primer and a Detonator per element) was updated in 0.22.53 to count Dual arts; the later section still needs its skill ids updated |
| v095na | "the Echoforge card waits until the Echoforge tab was opened once" | not looked into; fails the same way since at least 0.22.41 | open |
| v095na | "OLDHTML given" | needs an old build passed in the OLDHTML variable; not a game fault | run it with OLDHTML set |
| v095m3 | "Upgrade picks the brute force best step" and three more | the test's brute force ranks by gain today; the game ranks by the end at max temper since 0.22.17 | rewrite against upgBest (see v225a) or retire |
| v095m4 | text clipped on board, guild and upgrade screens at phone sizes | fails since the phone menu of 0.22.29; chips run past the panel edge | open: may be a real layout fault |
| v095m1 | "Menu > Quests shows the Notices list" and three more | written for the menu before 0.22.29 | update to the new menu |
| v080wa | "no straight hard edge in the weather layer" (gale, heat) | not looked into | open |

## Flaky (pass on a rerun)
v053b, v095p2, v158a, v194a, v152a, v041p1h, v070ob, v186a (check 3), v053ub (contrast 4.49 against 4.5).

## Fail often on an untouched build (random journeys; measured on 0.22.53 before and after the layering cleanup)
| Test | What fails | How often | Status |
|---|---|---|---|
| v225a | "1 the preview of Upgrade whole party is what happens" (state 3: a charm planned for one hero ends on another; state 6: gold planned 616, spent 676, or a charm planned +0 and got +1) | about 14 of 30 runs before the cleanup, 14 and 4 of 30 after | open: the preview and the run can disagree on charms; a game fault worth a look, not a test fault |
| v188a | "2 hand-me-down" (the plan buys a greatsword for one warrior instead of the blade) | most runs, with a different hero each time | open: depends on which two warriors the journey draws |
| v228a | "7 a phone (390x844) shows the same boxes" | now and then | open |
| sanct, v141a | one check each (Echo gates count, Breach foes) | rarely, pass on a rerun | flaky |

## Fixed or passing again
v050p1d passes on 0.22.53.

## Balance, 0.22.54
The 12 fight numbers below were rerun at 180 fights a cell and acted on: see `docs/balance54.md`. Hollow King and Hoarwyrm were noise; the real low end was Siren, Frost Lich and Drake. `v080ca` is stale (same eight failures on 0.22.53).

## Balance simulation, 0.22.53 (tools/fullsim.js, SEED=7)
- `early`: first realm field and roamer fights at the intended levels win 96 to 100% with 8 to 29% HP lost. Roamers met too early (level 3 party, level 8 foes) win 41%.
- `gim 12` (12 fights each, so rough): careful play beats a Scourge at the expected level 50 to 92% of the time in every realm; auto play 8 to 83%. Opening reactions in the first realm (0.22.42) did not make the first Scourge easy: 50 to 92% careful, 17 to 67% auto.
- Hardest: Ysolde (25 to 50% careful), Hoarwyrm (50 to 75%), Hollow King (42%). Worth a look with more runs before changing numbers.
