# early17: a gentle start in the first field

Owner playtest: "Early game enemies are a bit too tough and high level for a party of 3 to take down. The grass in the beginning of the 1st
field should have slightly weaker foes that are easier to take down."

Module `v3/early17.js` (last in MODS), test `tools/chrome/v193a.js` (world group), sim `node tools/fullsim.js early [N]`.
Nothing is shown to the player and nothing is saved.

## What was measured (before)

A new journey starts with three heroes at level 3 (not 1) and two skills each. First realm: thistle, orchard, strand, lakes or moors.
`SEED=1 node tools/fullsim.js early 150`, 40 maps and 150 fights per row, a random three of the starter pool, the game's own auto.

- Random grass on the first field was the same everywhere: 1 to 3 foes (about 20/45/35%) of level 2 to 7 (mean 4.5).
- Roamers on the first field all lead at level 9 with one or two mates at level 8, one in five an elite. They may stand 7 tiles from the gate:
  the nearest one is at 5% to 84% of the way across (median 40%), in the near third on 17 of 40 maps, and it chases.

| party level | fight (before) | win | HP lost | fights costing over 35% | rounds |
|---|---|---|---|---|---|
| 1 | grass | 85% | 39% | 45% | 7.0 |
| 2 | grass | 99% | 23% | 22% | 4.9 |
| 3 (a fresh party) | grass | 97 to 100% | 21 to 25% | 17 to 20% | 3.9 to 4.5 |
| 4 | grass | 98% | 18% | 12% | 3.6 |
| 5 | grass | 100% | 15% | 8% | 3.1 |
| 3 | roamer | 35% | 81% | 86% | 6.2 |
| 3 | elite roamer | 1% | 100% | 100% | 3.7 |
| 4 | roamer / elite | 53% / 7% | 66% / 97% | | |
| 5 | roamer / elite | 62% / 9% | 61% / 96% | | |
| 6 | roamer / elite | 85% / 28% | 41% / 85% | | |

So the grass was winnable but costly (one fight in five took over a third of the party's HP, with no healer guaranteed), and the first
roamers a fresh party meets were beyond it. Both are softened near the start.

## The ramp (after)

The first field is cut in three bands by walking distance (a flood from the gate the party enters by; 0 at that gate, 1 at the far gate).
Grass tiles fall 29% / 39% / 32% in the near / middle / far band. Numbers live in `E17` at the top of `early17.js`.

| band | random grass | roamers living there |
|---|---|---|
| near (first third) | level 2 to 3, never above the party's lowest level; one or two foes (a pair 3 times in 5); no night power | lead level 4, one mate at 3, never elite |
| middle | level 3 to 5, at most one above the party's lowest level; up to three foes (a trio half as often) | lead level 6, one mate at 5, never elite |
| far (last third, where the dungeon door is) | as before: level 2 to 7, 1 to 3 foes | as before: level 9, one in five elite |

Random foes in the first realm were already single type and never elite; that stays. Roamer places and monsters do not change, only
their level, company and the elite flag.

Fresh party (level 3), auto, 150 fights per row:

| fight | win | HP lost | over 35% | rounds | foes | foe level | foe HP per fight | foe XP per fight |
|---|---|---|---|---|---|---|---|---|
| grass before (anywhere) | 100% | 21% | 17% | 3.9 | 2.15 | 4.4 (top 7) | 147 | 38 |
| grass near | 100% | 6% | 1% | 1.8 | 1.51 | 2.5 (top 3) | 75 | 14 |
| grass middle | 100% | 13% | 2% | 2.9 | 1.96 | 3.6 (top 4) | 119 | 26 |
| grass far | 98% | 24% | 17% | 4.2 | 2.24 | 4.5 (top 7) | 159 | 41 |
| roamer near (was 35% win) | 100% | 20% | 10% | 3.7 | 2 | 3.5 | 149 | 26 |
| roamer middle | 96% | 35% | 38% | 5.5 | 2 | 5.5 | 197 | 45 |

At party level 4 the middle roamer is 99% / 24% lost, at level 5 99% / 25%, at 6 100% / 15%. At levels 1 and 2 (no journey starts there)
near grass is level 1 and 2 foes: 100% win, 5 to 6% lost. "Rounds" is hero turns divided by three; a single near foe falls in about one
round, a pair in two to three.

## Where it does not apply

Only stage 1 of a first journey: not New Game+ (`G.run.cycle`), not the Daily Trial, not later realms. Not the Mimic, duels, bounties,
dens, the dungeon or the Scourge. Once the first Scourge has fallen the field's grass gives its stronger echo fights as before (the
roamers keep their softening). A fight started while the party is not standing on the first field is untouched unless the spec carries
`e17` (0 near, 1 middle, 2 far), which the sims and tests use. `E17.off=1` switches everything off.

Old saves: the bands come from the save's own first field, so a save still there gets the ramp; nothing else moves and no field is added
to the save. An old two part world counts its first stretch as the first half.

## Pacing guard

`tools/chrome/v080cb.js` (16 runs, SEED 1; the sim is not exact run to run). The journey sim now puts the first field's random fights in
the band of the route they fall in; roamer fights follow the roamer's home.

| | top level | boss tries per journey (worst on one boss) | hours | fights |
|---|---|---|---|---|
| before | 41.1 | 12.0 (15) | 4.60 | 139 |
| after | 40.9 | 10.9 (11) | 4.52 | 133 |

Same sim with the module switched off and on (`CFGSET='E17.off=1'`), tries on the first Scourge: SEED 1 2.9 -> 2.4, SEED 2 2.6 -> 1.8;
ordinary fights lost per journey 4.8 -> 3.1 and 4.4 -> 3.3; top level 40.8 -> 40.8 and 41.0 -> 40.1. The lower XP near the gate does not
slow the first dungeon: the far third and the dungeon pay as before.

## Guesses to confirm with the owner

- "Slightly weaker": near foes are level 2 to 3 against a level 3 party (not level 1), so fights still take a round or two.
- Roamers near the start were softened as well, because they were the fights a fresh party could not win.
- The middle roamer at level 6 is still a real fight for a level 3 party (96%, a third of its HP).
- The ramp ends when the first Scourge falls (echo fights), and never applies in New Game+.
