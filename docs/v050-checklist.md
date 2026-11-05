# Beta v0.5.0 / v0.5.1 checklist

Spec: `v050-prompt.md`. Phases 1 to 5 shipped as Beta v0.5.0; build IDs, Phase 6, the Phase 7 pass and the follow ups shipped as Beta v0.5.1.
Details per item: `design-notes-v050.md` and the phase reports (`v050-phase2.md`, `v050-phase3.md`, `v050-phase45.md`, `v050-phase6.md`).

"Proof" for a bug fix: its test was run on the build before the fix (v0.4.6 = `2c9f47f`, v0.5.0 = `73b0a19`, or v0.5.1 before the follow ups = `0275a0d`) and on the build after it.

## Phase 1: bugs
| Item | Status | Test | Before the fix | After |
|---|---|---|---|---|
| 1.1 Tavern area cap | done | `chrome/v050p1a.js` | v0.4.6: fails (3 hired, the 4th blocked by "No room this area") | passes |
| 1.2 Wide screen after battle | done | `chrome/v050p1b.js`, `chrome/v051c.js` | v0.4.6: fails (view shrinks after a battle); v0.5.1 (`0275a0d`): `v051c` fails (a view measured while the screen settles never recovers) | both pass |
| 1.3 Assets on paths | done | `chrome/v050p1c.js` (550 towns, fields, dungeons, about 420 caves and 440 fortresses) | the detector is new code, so the proof is the same build with the guard switched off: every map kind has assets on path tiles | passes, every target still reachable |
| 1.4 Battle Back always visible | done | `chrome/v050p1d.js` | v0.4.6: fails (no Back at the top level, Back off screen at the bottom of long lists) | passes |
| 1.5 Shop back arrows | done | `chrome/v050p1e.js` (25 screens) | v0.4.6: fails (no arrow on Smithy, Alchemy, Guild Hall, Tavern, Inn, Board) | passes |
| 1.6 Minimap everywhere | done | `chrome/v050p1f.js` | v0.4.6: fails (an unknown sky throws in the HUD and the minimap is never added) | passes |
| 1.7 Inn text | done | `chrome/v050p1h.js` | v0.4.6: fails ("for all N heroes on your roster") | passes |
| 1.8 Status symbols | done | `chrome/v050p1g.js` | v0.4.6: fails (letter tags, and they spill out of their boxes at every size) | passes |
| 1.9 Temper order | done | `chrome/v050p1h.js` | v0.4.6: fails (ready rows mixed in: 110010111101) | passes |

## Phase 2: battle and world logic
| Item | Status | Test | Notes |
|---|---|---|---|
| 2.1 Backdrops and ground | done | `chrome/v050p2bg.js` (91 backdrops, 6 heroes and 5 foes, both stages) | units stood on sea and lava before (measured with the fix off) |
| 2.2 Surprise advantage | done | `chrome/v050p2b.js`, `fullsim.js stage1` | 196/196 unaware roamers give a Surprise round, 0/196 aware |
| 2.3 Material placement | done | `chrome/v050p2world.js` | the old rule misplaced 1745 of 3323 spots |
| 2.4 Town exits | done | `chrome/v050p2world.js` | 136 of 660 gates failed the lane check before, 0 after |
| 2.5 Entrance variety | done | `chrome/v050p2world.js` | seven looks plus the facade |
| 2.6 Dual types later | done | `chrome/v050p2b.js`, `fullsim.js stage1` | stage 1 dual type foes 563/832 → 0/877 |
| 2.7 Early hints | done | `chrome/v050p2b.js`, `chrome/v051a.js` | v0.5.0: `v051a` fails (a battle hint covered the foe cards' shield pips); v0.5.1 passes |

## Phase 3: shops, gear and items
| Item | Status | Test |
|---|---|---|
| 3.1 Best for party ordering | done (Tempering line finished in v0.5.1) | `chrome/v050p3a.js`, `chrome/v051b.js` (v0.5.0: fails, no Tempering line; v0.5.1: passes) |
| 3.2 Suggest duplicates | done | `chrome/v050p3a.js` |
| 3.3 Smithy best gear button | done | `chrome/v050p3a.js` |
| 3.4 Best Party awareness | done (also fixes Detonators never counted) | `chrome/v050p3b.js` |
| 3.5 Team build hints | done | `chrome/v050p3b.js` |
| 3.6 Boss readiness | done | `chrome/v050p3b.js` |
| 3.7 Holy Water repeat | done | `chrome/v050p3b.js` |
| 3.8 Item limit 50 | done (Daily Trial keeps 9) | `chrome/v050p3a.js` |
| 3.9 Pork Chop Sandwiches | done | `chrome/v050p3b.js` |

## Phase 4: party, guilds and quests
| Item | Status | Test |
|---|---|---|
| 4.1 Personal quests | done | `chrome/v050p4.js`, old saves `chrome/v050p4b.js` |
| 4.2 Guilds | done (text only, keys unchanged) | `chrome/v050p4.js` |
| 4.3 XP catch up | done | `chrome/v050p4.js`, `fullsim.js xp` |
| 4.4 Boss energy message | done | `chrome/v050p4.js` |

## Phase 5: settings, saving and title
| Item | Status | Test |
|---|---|---|
| 5.1 Volume options | done | `chrome/v050p5.js` |
| 5.2 Auto sync | done | `chrome/v050p5.js`, `chrome/savesys.js` |
| 5.3 Name | done (package.json productName kept so the Windows save folder does not move) | `chrome/v050p5.js` |
| 5.4 Smooth transitions | done (84 phase and 80 weather pairs) | `chrome/v050p5b.js` |
| 5.5 Save visibility | done | `chrome/v050p5c.js` (390x844, 360x740, 844x390, 740x360, 1280x720) |

## Phase 6: graphical upgrade
| Item | Status | Notes |
|---|---|---|
| 6.1 Lighting and depth | done | |
| 6.2 Cleaner UI | done (light touch) | readability rules kept |
| 6.3 World feels alive | partial | skipped swaying trees (baked into the map, too costly per frame) and new townsfolk routes (positions are game state) |
| 6.4 Characters | partial | skipped cloth and hair motion and turn frames: they need new sprite frames |
| 6.5 Battle presentation | done | |
| 6.6 Performance | done | fps before and after in `v050-phase6.md`; test `chrome/v050p6a.js` |

## Phase 7: balance and code check
| Item | Status | Notes |
|---|---|---|
| 7.1 Balance review | done | numbers in `design-notes-v050.md` (Phase 7), all on the real game (`tools/fullsim.js`); ending level about 40, accepted |
| 7.2 Code organisation | done | every new tunable in config.js |

## Follow ups in v0.5.1
| Item | Test | Before | After |
|---|---|---|---|
| Build IDs (same version rebuilds reach the apps) | `chrome/liveupdate.js` | new behaviour | passes |
| A beaten mimic came back after its chest moved | `chrome/v041p1c.js` | v0.5.0: fails | passes |
| Town NPCs back on a path after the lane fix | `chrome/v050p1c.js` | v0.5.1 (`29a0870`): fails (one NPC) | passes |
| Tempering slow with a full pack | `chrome/smithy3.js` | v0.4.6 and v0.5.0: fail (about 0.8 to 1 s) | passes (about 0.5 s) |
| New skills first on the results, quest ready notice and tags, symbols under names in the Party menu | `chrome/v051c.js` | v0.5.1 (`0275a0d`): fails | passes |
| v0.5.2: map view stuck at 300x150 after a battle on a Galaxy Z Fold opened | `chrome/v051c.js` (widths 920 to 946) | v0.5.1: fails at 932, 933, 934 | passes |
| Workflow on Node 24 actions, ubuntu-24.04 | the Build and release run | warnings | green, no annotations |

## Tests that cannot run here
- `chrome/gear.js`, `chrome/saveformats.js`, `chrome/world6.js`, `chrome/v040p2.js`: read the pre-v3 `out/aurelis.html`, which is not in the repo (same on v0.4.6).
- `chrome/v50.js`, `p3.js`, `p4.js`, `p5.js`, `prog.js`, `lever.js`, `v030.js`: need `@sparticuz/chromium` (the old workspace's Chrome), not installed.
- `chrome/v043.js`: checks for the version string "Beta v0.4.3" (fails on v0.4.6 too).
- Node `stairs.js`, `propaudit.js`, `dunaudit.js`, `bldaudit.js`, `entdist.js`, `dailycmp.js`: their file lists predate world4.js (`buildDungeon3`, `townGates3`, `buildField3`, `classSkills` not defined) and crash the same way on v0.4.6. `dunsame.js` needs an old `tools/v3_pre_030` snapshot. Their checks are covered by `worldtest.js`, `stairs2.js`, `healtest.js` and the v0.5.0 Chrome tests.
