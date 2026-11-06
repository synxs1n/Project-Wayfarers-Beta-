# v0.8.0 battle screen on phones and the Galaxy Z Fold, the battle transition, damage type symbols

The owner's report, with screenshots from a Galaxy Z Fold 8:
- **Fold open** (933 px wide; the screenshot is 2000x1510 px with the status bar and the navigation bar, so the web view is about
  933x620 to 933x660 CSS px, not 705): in a miniboss fight with "Summon Bloodmoon" and "Auto locked / No auto in miniboss fights", the party
  column scrolled (Vanguard cut at the top), the foes panel was squeezed to an empty strip at the bottom, the stage was small.
- **Fold closed** (cover screen, 904x2316 px at dpr 2.625 = 344x882 CSS px) and other tall phones: "Can't even see my attack options
  without scrolling."
- "Transition into battle animation looks like it's zoomed in and we are only looking at the top left of the animation."
- Added during the pass (lead): symbols for damage types (deliveries), and the foe cards showing which damage types a foe is weak to and
  resists, next to the elements.

GAME_VERSION and the changelog are untouched (the lead merges those). No save key, game state, rule or number changed.

## 1. The transition (root cause)
On Medium and High the world canvas holds a 2x bitmap (`sprhd2.js` `ssCanvas`). v0.6.3 fixed the encounter flash drawing a quarter of the
view by wrapping `hdOverlay` / `hdBlit` in `battle3.js`: while they run, every `setTransform` on the world canvas was multiplied by the
backing scale k. Later the world pass (v0.7.1, `hd2d.js`) made `hdOverlay` set `setTransform(k,0,0,k,0,0)` itself for frames of the game
loop. The wrapper then multiplied that again: the overlay (the white flash, the battle swirl, the fades and the weather near layer) was
drawn at k*k = 4x, so the swirl turned around the bottom right corner of the view and the screen showed the top left quarter of it,
zoomed in. Test frames (`worldDraw` called from outside the loop, "composed") use identity there, which is why `v063bb` kept passing.
Low (1x canvas) and the 2D world renderer on Medium (HD-2D off) were never affected; the battle canvas flash (`BV.flash`) and the
`p5trans.js` blends draw in logical units under the canvas's own transform and were fine.

Fix (`battle3.js`, hd2d.js is another pass's file): the wrapper scales only identity calls (`setTransform(1,0,0,1,e,f)`), so a transform
that already carries the scale is left alone. Measured from the real game loop (`v080b`, the swirl's dark arms sampled mid-animation):

| | before | after |
|---|---|---|
| Medium / High with HD-2D, every size | swirl centre at (0.66 to 0.82, 0.55 to 0.81) of the view, top left quarter 0 to 100 arm pixels against 600 to 700 in the bottom right | centre (0.50, 0.50), the four quarters within a few percent of each other |
| Low, Medium with the 2D world | centred | centred (unchanged) |

## 2. Sizing from the visible viewport
- Every height comes from `visualViewport.height` (`b3Vh()`), so the browser's address bar, the app's system bars and the Fold's two
  screens count; a `visualViewport` resize (bar shown or hidden, Fold opened or closed) lays the battle out again.
- The page never scrolls: portrait and wide both give the part under the stage exactly the rest of the visible height.

## 3. Wide (the Fold open, tablets, desktops): `b3WideSc`, `b3WideBot` (battle3.js)
- **Two arrangements, the larger stage wins** (the v0.7.6 one on a tie):
  - *stacked* (v0.7.6): boss bar and turn order on one row over the stage, the log strip under it, the two columns under that;
  - *column* (`b8col`): the stage and the log strip head the left column with the commands and the foes under them; the boss bar, the
    turn order and the party column (Vanguard, Rearguard) fill the right column from the top, using the space beside the stage that
    was empty before. The grid is as tall as the visible screen (`--b8h`), its rows are set from the measured heights (`--b8r`).
  On short wide screens with a full party the column arrangement wins; on tall ones (1280x800 with few units) the stacked one may.
- **Order of giving way:** the stage shrinks in `B3.wideStep` steps; under `B8.tightAt` (1.35) the screen compacts once per battle
  (`b8tight`): the auto lock note inline in the auto row ("Pause / Auto locked / No auto in miniboss fights / Speed / ⚙"), tighter
  command rows (40 px), hero rows and the header; in the compact column arrangement the log strip may move up under the turn order
  (`b8lr`) when the right column has room. The stage never goes under `B8.min` (1.1, 165 px tall). Only past that does a panel scroll
  inside itself.
- **The foes panel never collapses:** its grid row is at least 58 px (one row of cards); the commands panel scrolls inside first.
- The need of each column only grows within a battle (per compaction state), as in v0.7.6, so the stage does not jump between turns; one
  frame after each render the fit is checked again (wrappers after the base render can still change a panel).
- Fix on the way: the stacked fit forgot the empty boss row's grid gap (4 px) when there is no boss.

## 4. Portrait phones (the Fold closed, 344 to 412 px wide)
- Priority: stage, turn order, the acting hero's card and the commands always on screen. The stage is fitted to what is left
  (`fitBattle`, `B8.tallMin..tallMax` = 120..230 logical px, 240 to 460 on screen), measured from the stage's real top, the log strip,
  the party cards, the commands, the compact foe list and the body padding; a stage that would push them off always shrinks at once.
- Everything under the stage is one box as tall as the rest of the visible screen (`--b3bot`): party cards, commands, then the
  **compact foe list** (`b8Strip`: one row of 40 px buttons, name and HP bar per live foe, the same tap as the card: aim at it or open
  its details), then the full foe cards and the Rearguard, which scroll inside the box. The box returns to its top at each hero turn.
- Commands: Summon, Scan, Lore, Switch, Flee on one row (Summon wider, labels without the dot), tighter primary row; the auto lock note
  moves into the command header between the hero's name and Back. The header and the party cards are a little tighter.
- The Rearguard (in the scrolling part) runs two per row under 420 px, so its HP numbers fit.

## 4b. The battle start settles in one go
A later report: "Started a battle and the enemies kept shifting their position before the battle actually started." Measured (`v080b`
settle, every frame of a real battle start): the stage shrank once when the first hero turn opened the commands (portrait: the units
moved 14 to 68 px up; wide: the stage scaled, 3 to 30 px), and on portrait miniboss fights also once when the boss bar filled in.
Causes and fixes:
- During the intro the command panel shows only "..." and the auto row, and the fit used that height. `b8CmdEst` now measures, once per
  battle (and per panel width), the height the panel will have at the top level menu for the tallest Vanguard hero, from a hidden copy
  (the battle state is put back exactly, nothing random is drawn); both fits reserve it from the first frame.
- The boss bar, the turn order fit and Momentum are filled by `renderBattle` wrappers that run after the base render's fit. The fit is
  now checked again in a microtask after the whole render (still before the frame is painted).
- Portrait: the deferred second fit step (300 ms later) is gone; the fit settles synchronously, and within a battle the stage only
  shrinks (it grows back only when the visible viewport changes).
Camera shake and zoom on hits, and the units' entry and attack offsets, are scripted animation and unchanged.

## 5. Damage type symbols (`dlIco`, battle3.js section 7)
- One code-drawn 11x11 symbol per delivery in the element icons' style (dark outline, colour fill, light inner mark): Slash a sword,
  Blunt a hammer, Piercing a spear, Ranged an arrow, Magic a star, Heal a cross. The name is in `alt` and `title`.
- **Foe cards (every layout):** the Weak / Res rows (`foeWeak`, replaced) list the known elements, then the delivery weaknesses
  (archetype multiplier x1.1 or more, clamped like `archMult`) and resistances (x0.9 or less; dimmer and greyer); Undead also show Heal
  as a weakness. Shown once the foe type has been hit or scanned (`revealed()`, the rule the trait chips already used; element
  weaknesses are learned by hitting with them, as before). The words are in the tooltip ("Weak to Fire, Piercing, Magic"); on narrow
  cards the words give way to ▲ / ▼ and the rows drop their chip frame (11 px icons) so they fit one line.
- **Skill list:** the delivery chip (`dlChip`) is the symbol, the name and hint in its tooltip.
- **Aim tags and the effectiveness chip:** "▲ Slash" against a foe's archetype becomes ▲ and the symbol (numbers in the tooltip); the
  stage target tag gets it as well (sized by the layout pass like the other tag parts).

## Files
- `v3/battle3.js`: the transition fix; `b8CmdEst` (the commands' height reserved from the first frame); the post-render fit check; section 5 rewritten (`B8`, `b3WideNeed` returns both columns, `b3WideSc` with the arrangements and
  compaction, `b3WideBot` with the column grid); section 6 (portrait: `b8Strip`, `b8TallBot`, the header note, scroll reset, the
  re-check frame, the `visualViewport` listener); section 7 (damage type symbols); aim tag parts; `b3Below` counts the foe list.
- `v3/battle.js`: `fitBattle` portrait branch measured from the visible viewport.
- `v3/battle3.css`: the v0.8.0 block at the end (foes row minimum, column arrangement, compaction, portrait box, foe list, commands,
  symbols).
- `v3/shell.html`: test getters (`b8Strip`, `dlIco`, `foeDl`, `B8`, `EL`, `effOf`, ...).
- `tools/chrome/v080b.js` (new), `tools/chrome/v076b.js` (the compact foe list's names may end in an ellipsis), `.gitignore`
  (`shots-v080b/`), `docs/README.md`, `docs/CODEMAP.md`.

## Tests (tools/chrome)
`v080b.js` (`node v080b.js [shots] [layout|trans|dl]`, `SIZES=344x882,...`, `SHOTPFX=`):
- At 344x882, 360x780, 390x844, 412x915, 933x620, 933x660, 933x705, 1280x720, a miniboss fight (boss bar, "Summon Bloodmoon", the auto
  lock note, 6 heroes, 5 foes), a field fight with 6 heroes and 5 foes and one with 3 and 2, every foe type known (the longest Weak / Res
  rows), random statuses, primes and shields, at the start of four hero turns each: document height <= viewport, Attack / Skills /
  Items / Guard fully on screen and not clipped by a scrolling panel, the turn order, the stage and the acting hero's card on screen,
  the stage at least 165 px (wide) / 240 px (portrait), every live foe's card fully shown and nothing scrolling inside a panel (wide), the
  compact foe list showing every live foe (portrait), 40 px commands, no text cut, no card row over its card's name or bars.
- The transition on Low, Medium (HD-2D and 2D world) and High at 390x844, 344x882, 933x640, 1280x720: the swirl sampled from the world
  canvas in the real game loop is centred and reaches all four quarters.
- Damage types at 344x882, 933x620, 1280x720 (see section 5).
- Battle start at the eight sizes, a miniboss and a field fight started for real: every frame for 2 s and until 0.6 s after the first
  hero turn, the stage's layout box and every foe's place on the screen stay put (CSS transforms of the hit shake left out).

## Results
Before = the build this pass started from (`b9e38d9`), after = this pass, same session (the machine was shared with other test runs).

| test | before | after |
|---|---|---|
| `v080b` layout | fails at every size: the page scrolls at 344 to 412 px (document 991 to 1165 px at 344x882), no compact foe list, "Summon Bloodmoon", "Attack" and Rearguard HP cut at 344 to 412 px; at 933x620 and 933x660 the foes panel squeezed (3 of 5 cards shown, `fcs 98/50`) and the party column scrolling (`b3pty 315/282`) | passes (4 hero turns per case) |
| `v080b` transition | 24 fails: Medium and High with HD-2D at every size, the swirl centred at (0.66 to 0.82, 0.55 to 0.81) | passes (Low, Medium HD-2D, Medium 2D world, High; 4 sizes) |
| `v080b` damage types | throws (no `dlIco`) | passes |
| `v080b` battle start | 24 fails: the stage resized and foes moved 7 to 68 px at the first hero turn (all sizes), and on portrait miniboss fights when the boss bar filled in | passes |
| `v080b` total | | 847+ checks, all pass |

Layout after (6 heroes and 5 foes unless noted; the stage box is the canvas frame; document height = viewport height everywhere):

| size | miniboss (boss bar, summon, auto note) | field 6h/5f | field 3h/2f | arrangement |
|---|---|---|---|---|
| 344x882 | 312x348 | 312x374 | 312x374 | portrait |
| 360x780 | 328x246 | 328x272 | 328x272 | portrait |
| 390x844 | 358x310 | 358x336 | 358x336 | portrait |
| 412x915 | 380x382 | 380x408 | 380x408 | portrait |
| 933x620 | 424x203 | 424x203 | 456x218 | column, compact with the log on the right (3h/2f: column) |
| 933x660 | 504x241 | 504x241 | 520x248 | column, compact, log on the right (3h/2f: column) |
| 933x705 | 520x248 | 472x226 | 520x248 | column (miniboss compact); 3h/2f stacked |
| 1280x720 | 456x218 | 536x256 | 568x271 | column |

Before, at 933x705 the same 6h/5f fight had a 440x211 stage (scale 1.35) and at 933x620 the foes panel was a strip.

Regression list (after): v076b (one test change: the compact foe list's names may end in an ellipsis), v063ba, v063bb, v063bc, v063bd,
v070ia, v070ib, v070ic, v070m2, v058a, v053b, v060a, v050p1d, v051a, v070ob, v041p6, wide, v051c, liveupdate pass (liveupdate logs its
own simulated "broken build" page error, as before). One earlier v063ba run on a busy machine had one effect text touching the order bar
during a hit's camera zoom at 390x844; it did not repeat in two later runs.

Screenshots: `tools/chrome/shots-v080b/` (`before_*` and `after_*` per size and fight, `*_trans_*` mid-swirl, `*_dltypes`, `*_start`),
not committed.

## Limits
- At the smallest wide heights (933x620 with a full party, a boss, statuses on every card and every weakness known) the stage is 1.3
  (424x203); the compact state stays for the rest of that battle.
- On portrait phones the foe cards and the Rearguard are in the scrolling part under the compact foe list (the stage and the list show
  every foe); the Switch command lists the Rearguard too.
- A Limit Break becoming ready adds a row to the commands mid-battle; the stage then shrinks once (as in v0.7.6).
- Wide foe cards use 11 px symbols without the words Weak / Res under 215 px (▲ / ▼ instead; the words are in the tooltip).
