# v0.6.3 battle screen pass

Four requests from the owner (phone: Galaxy Z Fold open 933x705, portrait 390x844, Medium graphics). GAME_VERSION and the changelog are
untouched (the lead merges those). No save key, db schema or game state changed; the Daily Trial is identical (`v050p2daily`).

## 1. Stage labels never cover a face, a sprite or each other
"The top person's element is blocking someone's face": the HP bar, limit bar, shield pips and element badges sat at fixed offsets under
each unit's feet, status rows, names, hints and the primed badge at fixed offsets too, so a unit standing behind and above another put its
badges on the front unit's face.

**One layout pass** (`b3Lay`, `v3/battle3.js`) now places every stage label, in logical stage pixels, for the whole stage at once:
- **Obstacles:** every unit's visible sprite: the alpha bounds of its sprite canvas (`sprVB`, the full HD bitmap read through `_rw`/`_rh`
  and divided by its scale, mirrored for heroes, rotated for a knocked out hero, a bob margin for flyers), plus `B3.body` px.
- **Labels, in priority order:** the HP plate (HP bar, limit bar, shield pips and element badges as one block, drawn on the canvas by
  `unitHud`), the primed badge, the turn arrow, the status row, the target tag while aiming (name, effectiveness, the reaction a
  detonator sets off). Effect texts are placed in the same way by `b3FxRects` (fx2.js) with every label above as an obstacle.
- **Where:** each label tries anchors around its unit (units at the back of the ground band over the head where the sky is open, units
  in front under the feet, then beside the body toward the middle, then the other side), and around each anchor a spiral of offsets up
  to `B3.R` px, nearest first (`b3Find`). Status rows and primed badges stack beside the unit's plate, on the side away from its body.
- **Fallbacks:** the HP plate tries a row (badges left of the bars), then a column (badges over the bars); a status row tries all
  icons, then 2 + "+N", then a lone "+N"; a target tag drops the name; a target tag first looks within `B3.tagR` px so it stays next to
  its unit. A label that finds no spot at all is left off the stage (listed in `L.hidden`); the cards then show that information
  (`b3OnStage`).
- **Stable:** plates are placed first so they do not jump when statuses change; the result is cached by a key of everything that
  moves a label (units, boxes, statuses count, primes, shields, limit, the current unit, target mode, stage size). The canvas reuses it
  for `B3.memo` ms without rebuilding the key; the DOM render always checks.
- **Unit slots** (`B3.slots`, config.js) were respread for this: depth on the ground band 0..0.84 (so front units have room under their
  feet), foes over 8..52% of the stage width, heroes staggered. Feet stay on the ground plane (2.1 rules: through `p2GroundY`).
- The DOM labels get exactly the laid out boxes (`battle3.css`: fixed icon sizes, `box-sizing`, the drift of effect texts inside the box).
- The save message (`p5save`) also keeps clear of the stage labels (`p5Avoid` wrapper).
- The weather icon is no longer repeated in every unit's status row (it is in the order bar).

## 2. The battle start flash covers the view
On Medium and High the world 2D canvas holds a 2x bitmap (sprhd2.js `ssCanvas`); the HD-2D overlay (`hdOverlay`, `hdBlit` in hd2d.js)
reset it with `setTransform(1,0,0,1,0,0)`, so the encounter flash, the swirl and the fades covered one quarter of the view, and its
`clearRect` cleared only that quarter, leaving the swirl on the rest. battle3.js wraps both functions: while they run, `setTransform` on
that context is scaled by the canvas's backing scale (only the outermost call installs it, since `hdOverlay` calls `hdBlit`). hd2d.js
itself is unchanged. Low draws the 2D world at 1x and was fine.

## 3. Detonators
- While a detonator is aimed, a foe it will set off glows in the detonating element's colour with a double ring at its feet
  (`detGlow`, battle.js `drawUnit`); other targets pulse faintly. Its stage tag reads "✸ Melt" with the primed and the detonating element
  icons (`.b3tg.det`), its card is marked and its primed chip names the reaction.
- The skill list names every foe the detonator sets off right now, with both icons and the reaction (`detList`); with none it shows what
  it reacts with (`detNote`).
- When the reaction fires, its name floats over the detonated foe in the effect list as a purple chip with both element icons
  (`doReaction` wrapper notes `rp`/`rd` on the effect entry; fx2.js draws it).

## 4. The screen
- **Order:** boss bar, turn order (sky chips on its right, icons only on phones), stage, log ticker (the last log line and the Log button
  under the stage, nothing on the scene's corners), then cards and commands.
- **Portrait:** the party's three cards (name, HP, MP, limit; the active hero framed in gold with a marker), the commands right under them,
  then the foes (two columns: name, HP, element icons, known weaknesses and resistances, effects not shown on the stage) and the
  rearguard as small chips. The stage height is fitted so that the party and the commands fit the screen (`b3Below`).
- **Commands:** Attack, Skills, Items, Guard in one row; Scan, Lore, Switch, Flee (and Summon) in a smaller row; Pause, Auto (with the
  lock reason), Speed and the auto settings below. The header says whose turn it is and keeps the pinned Back; MP shows there while
  picking a skill. The header no longer repeats the hero's effects or MP at the top level.
- **Wide (Fold open, tablets, desktops):** commands on the left, foes and the party in two columns beside them; the stage scales down
  to `B3.minSc` so the commands fit under it.
- **Landscape phones:** the stage and the log on the left (sized from the screen, `B3.sideCol` kept for the right), the turn order,
  commands and cards in a scrolling column on the right.
- **No duplication:** a card shows a unit's effects and primed chip only when the stage does not show them in full; the weather is in the
  order bar only.
- Kept: status symbols, shield pips, primed badges, element icons, the pinned Back button, the auto lock message, the save indicator,
  the 2.1 ground rules; tap targets 40 px or more.

## Files
- `v3/battle3.js` (new, after `hdspell.js`): the layout pass, the canvas HUD (`unitHud` replaced), the turn arrow, stage DOM labels,
  effect text placement, the flash fix, detonator helpers, screen helpers.
- `v3/battle3.css` (new, after `ui3.css` in v3build.py): stage labels, effect texts, the screen layout.
- `v3/battle.js`: slots from `B3.slots`, the arrow and the detonation glow, layout and fit budgets for the new screen.
- `v3/battlefx.js` `stageTags`, `v3/fx2.js` `fxLayer`, `v3/battleui.js` cards and primed chip, `v3/ui.js` battle skeleton, order bar,
  command panel, skill list.
- `v3/config.js`: block "v0.6.3 battle screen" (`B3`).
- `v3/shell.html`: one line exposing the new functions to the tests (getters only for keys not already on `__A`).

## Tests (tools/chrome)
- `v063ba.js` (1): random battles at 390x844, 844x390, 933x705, 1280x800 (parties of 1 to 6 with the rearguard, 1 to 5 foes, bosses,
  flyers, statuses, primes, shields, effect texts, aiming): every pair of labels and every label against every sprite (measured
  independently from the sprite canvases) is checked, plus that content fits its box and that almost no label falls back to the cards.
- `v063bb.js` (2): the flash whitens all four quarters of the world view and leaves no swirl, Low, Medium and High at the four sizes.
- `v063bc.js` (3): the skill list, the stage tag, the glow, the foe card, then the reaction text with both icons over the foe.
- `v063bd.js` (4): grouped commands, the active hero marked, no repeated bars or effects, the log under the stage, tap targets, readability
  rules, what is on screen without scrolling, the log opens and closes, the auto lock reason.
- `v063bshots.js [prefix] [scenes]`: screenshots into `tools/chrome/shots-v063b/` (not committed).
- `v063suite.sh`: the regression list for this pass plus the four tests. `v058a.js` now reads the badge position from the layout
  (`u._plate`) when there is one.
- Shared helpers: `v063lib.js`.

## Results
Before = a build of the commit this pass started from (v0.6.2, `63cb2da`), after = this pass, same session.

| test | before | after |
|---|---|---|
| `v063ba` (14 random battles per size) | fails at all 4 sizes: every battle has overlaps; labels on sprites: 186 at 390x844, 58 at 844x390, 68 at 933x705, 67 at 1280x800 | passes; 0 of 275 HP plates and 5 of about 1000 labels fall back to the cards |
| `v063bb` (flash, 12 size and tier cases) | 15 fails: on Medium and High the flash whitens only the top left quarter (0.94 / 0 / 0 / 0) and the swirl stays on the rest | all pass (every quarter 0.87 to 0.96) |
| `v063bc` (detonators, 4 sizes) | 24 of 28 checks fail (no per foe list, no reaction tag, no glow, no icons on the reaction text) | all pass |
| `v063bd` (screen, 4 sizes) | 25 fails (no grouped commands, the log on the stage, the header repeating MP and effects, 29 px sky chips, 38 px commands at 390x844, ...) | all pass |

Regression list (`v063suite.sh`): v053b, v058a, v059a, v060a, v061a, v050p2bg, v050p1d, v050p1g, v051a, v053ua, v053ub, wide, v050p2b,
v050p2daily (Daily Trial identical to the old build) pass. Changed tests: `v058a` reads the badge position from the layout; `v062a` reads
the world canvas at its backing scale (it was written against the quarter sized copy this pass fixes; its "hero lit day vs night" world
check failed on the starting commit too; with the full size copy the whole test passes now). `v053b`'s "tags above the GL canvas" check needed the stage
status rows to take taps across their whole box (they do now).

Frame rate (`v053bperf.js`, `TIERS=medium REPS=3`, CPU 4x, dpr 2, a field battle on auto in rain; the machine was shared with other
test runs, best of 3, before and after interleaved):

| size | before Medium | after Medium |
|---|---|---|
| 390x844 | 50.2 fps (30% of frames over 20 ms) | 54.2 (25%) |
| 844x390 | 55.3 (27%) | 56.0 (19%) |

The layout pass runs only when something that moves a label changes (about 1 to 3 ms then); the canvas reuses it between changes.

## Limits
- With five foes and three heroes on a portrait stage some labels stand a little away from their unit (the nearest free spot); a label
  with no spot at all is left to the card (rare: see the test numbers).
- Labels are laid out for the units' resting poses; while a unit lunges or is knocked back (a fraction of a second) its sprite can pass
  under a neighbour's label.
- The save message and the hint card are transient overlays and may sit on the stage for a moment (they avoid the units and labels).
- The flash fix wraps `hdOverlay` and `hdBlit` from battle3.js rather than editing hd2d.js (another pass owns it); the cleaner fix is
  `setTransform(k,0,0,k,0,0)` in those two functions, and the wrapper becomes a no-op once that lands.
