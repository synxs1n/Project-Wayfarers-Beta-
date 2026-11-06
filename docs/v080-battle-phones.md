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

## Follow up (after v0.8.6): two more real-device screenshots
GAME_VERSION and the changelog are untouched here too.

**Fold open** (933 x about 615 CSS px visible): the stage was about 470x225 in the upper left, under it the commands and two foe cards,
the right column held the turn bar, the log strip, the Vanguard and the Rearguard, and both columns ended in an empty band (about 90 px,
the right one 80 px higher). Measured on the previous build: bands of 71 to 393 px under the right column (the left 4 to 58 px).
- The column arrangement is now planned from both columns' stacks (`b3WideSc`): the right column is 340, 370, 410 px or the old 1fr share
  (`B8.R`), and the log strip and the foes each go under the stage or into the right column (`b8lr`, `b8fr`), whichever gives the
  largest stage, then the least empty space. Heights at each width come from hidden copies (`b8HAt`: the top level commands, the foes
  panel, the party column, each only growing within a battle). With two or three foes the foes usually sit in the right column under
  the party, so the stage takes the whole left column width (552x263 at 933x615 against 440x211 before).
- The grid rows are built from both stacks (`b3WideBot`, `--b8r`, `--gr-*`); each column's last panel reaches the bottom of the screen
  (the commands panel's rows grow when it is last; the foes panel or the party column's last group stretches), so no column ends in an
  empty band.
- The party rows keep HP, MP and Limit side by side down to a 300 px wide group (was 340), so a 340 px right column still has one line of bars.
- Compaction starts under 1.7 (was 1.35); in it the foe cards show ▲ / ▼ instead of the words Weak / Res, so their rows fit one line.
- Fixes on the way: the secondary command row is one flex row with a wider Summon button (its name was cut at some widths); a foe card
  in a row with a taller one fills its cell (its status row could hang under a shorter frame); card status rows are checked afresh for
  wrapping on every fit (the card widths change with the arrangement); the switch list's entries are at least 168 px; the commands panel
  keeps its planned row in every state (the foes under it no longer jump up on a foe's turn or in auto).
- `v076b`: its "foes right under the commands" check also accepts the foes beside the commands under the party column (the intended
  change); nothing else in it changed.

**Fold closed** (412 x about 810 CSS px): the last command row (Pause / Start auto / Speed / ⚙) was cut off under the party cards.
- Portrait order is now: turn order, stage, log strip, **the commands**, the party cards, the compact foe list, then the foe cards and
  the Rearguard. The command header carries the acting hero's HP and MP (bars and numbers under the name), since the cards now follow.
- The bottom padding of the battle screen is `max(4px, env(safe-area-inset-bottom))`: with `viewport-fit=cover` an edge to edge app draws
  under the navigation bar, and the last row could sit behind it (headless Chrome has no inset, so the tests cannot show this one).
- Turn order bar: the sky chips now clip inside their own box (`.osky` can shrink, a chip's icon is capped), so a wider device glyph
  (the report showed "☁!" over NEXT) cannot run over the NEXT label or the entries. This could not be reproduced in headless Chrome,
  even with text drawn 125% larger; the new check guards it.

| size | before (6h/5f miniboss · 6h/5f · 6h/2f · 3h/2f) | after |
|---|---|---|
| 933x615 | 408x196 · 408x196 · 440x211 · 440x211 | 408x196 · 456x218 · 552x263 · 552x263 |
| 933x620 | 424x203 · 424x203 · - · 456x218 | 424x203 · 456x218 · 552x263 · 552x263 |
| 933x660 | 504x241 · 504x241 · 520x248 · 520x248 | 504x241 · 552x263 · 552x263 · 552x263 |
| 933x705 | 520x248 · 472x226 · 520x248 · 520x248 | 552x263 · 552x263 · 552x263 · 552x263 |
| 1280x720 | 456x218 · 536x256 · - · 568x271 | 584x278 · 648x308 · 648x308 · 648x308 |
| portrait (344x882, 360x780, 390x844, 412x810, 412x915) | unchanged stage sizes | unchanged (312x348 to 380x408); the commands first |

`v080b` additions: 412x810 and 933x615, a 6 heroes / 2 foes case; wide: no empty band over 24 px at the bottom of either column;
portrait: every command row on screen with the party cards after them, the acting hero's HP and MP on screen (header or card); the turn
order bar's chips clear of NEXT and the entries (every layout case, and every weather with 125% text at five sizes). On the previous
build: 80 fails at 933x615, 933x660, 933x705, 412x810, 390x844 (48 bands of 25 to 393 px, 32 portrait checks with the cards before the
commands); after: passes (1663 checks for the whole file). The regression list passes after (v076b with the one check change above).

## Second follow up (after v0.8.9): the Fold closed upright and sideways, label spacing, hero sprite size

**Fold closed, upright** (412 x about 812 CSS px visible): the party cards were cut off at the bottom with no way to reach them, and
the owner asked for a bigger action menu that fills the space and pushes the other menus down.
- `b8TallPlan` (battle3.js) shares the room under the stage: the commands at their natural height plus up to `B8.tallGrow` (28 px:
  the main row 44 to 56 px, the others 40 to 48 px), the top `B8.peek` (46 px) of the party cards, the stage takes the rest (never under
  240 px). The commands panel fills the box down to that peek. The party cards, the compact foe list, the foe cards and the Rearguard
  follow in the box under the commands, which scrolls (back to the top at each hero turn); the header keeps the acting hero's HP and MP.
  On a small phone the rows grow less before the stage gives way.

**Fold closed, sideways and other short landscape screens** (705x455, 740x360, 750x475, 800x380, 844x390, 915x412): the old "side"
layout (stage left, everything else in one scrolling column) left an empty area under the stage and squeezed the commands
("Atta", "Skil"). Every screen at least 560 px wide now goes through the wide planner, which gained:
- a **commands-right** arrangement (`b8cr`): stage, log strip and the party (then the foes) in the left column; the boss bar, the
  turn order and the commands (then the foes, `b8fr`) in the right one, 260 to 380 px wide (`B8.Rc`). The commands always fit whole;
- a narrow command panel (container query, under 360 px): the four main commands two by two with full labels, the secondary row and
  the auto row smaller; the panel never grows wider than its column (it was 9 px wider and scrolled sideways);
- on screens under 430 px tall (`B8.shortH`, `b8short`) the game header gives its row to the battle (Pause keeps Settings and Help);
- last resorts, in this order, when not everything fits whole: the party and the foes share what the stage leaves (each scrolls inside
  its panel, the party never under 56 px, the foes never under one row of cards, 100 px); then the **compact foe list** stands in for
  the foe cards (`b8fs`; tap a foe on the stage or in the list for its details). An arrangement that shows everything whole always wins
  over one that squeezes, then the larger stage.

**Labels too close across the sides** ("one of the heroes' HP bars has its elements too close to the enemy"): while `b3Lay` places a
unit's labels (`B3SG`), they keep 5 px from the other side's sprites and labels and a hero's labels stay on the heroes' half of the
stage; when no spot allows that the gap steps down (4, 3, 2 px, then a wider search) before the old rules apply.

**Hero sprites in battle** ("heroes look oversized compared to the world"): the battle hero sprites (36x46 logical at 2x) stood
38.5 px tall against about 33 px for the taller humanoid foes. In battle they are drawn at 5/6 (`B8H.k`): the 2x bitmap is resampled
once, nearest neighbour (crisp), into a new 2x canvas (so they keep the foes' pixel density); `spriteOf` hands that canvas to the
stage, the layout pass, the GL stage and the hit flashes. Heroes are now about 32 px tall. Tamed monsters fighting as heroes keep their
size. (sprhd.js reads 9-argument `drawImage` source rectangles in logical units; the resample uses the raw `_hdDI`.)

Tests (`v080b`): the six landscape sizes and 412x812 join the layout cases (short landscape: the party and the foes shown or
reachable in their panels; portrait: the party cards and every foe reachable by scrolling the box under the commands, main commands
at least 50 px tall on screens 800 px and taller, the right column inside the screen); a `sides` section (random battles at 390x844,
412x812, 844x390, 933x660): no hero label under 2 px from a foe sprite or label and at most 5% under 4 px, hero labels on the heroes'
half, the tallest hero at most 1.1x the taller foes, 2x pixels for both.

Results (the build this follow up started from, v0.8.9, against this one; `v080b` 3170 checks pass after):
- 412x812 (6h/5f miniboss · 6h/5f · 6h/2f · 3h/2f): stage 380x278 · 380x304 · 380x304 · 380x304 before, the party cards cut off at the
  bottom with nothing to scroll (96 fails: the acting hero's card, the party not reachable); after 380x326 · 380x352 · 380x352 · 380x352,
  main commands 56 px tall, the party cards and foes in the box under them.
- Short landscape (705x455, 740x360, 750x475, 800x380, 844x390, 915x412): before, the side layout with a 408x196 (915: 488x233) stage
  and an empty area under it, the page 29 to 37 px taller than the screen at 740x360 to 915x412, the commands clipped ("Attack" 69/54);
  after, no page scroll, every command whole, the party and the foes shown or reachable in their panels; the stage is 360x173 with a
  full party (392x188 to 440x211 with three heroes), smaller than the old (overflowing) one: the commands, the party and the foes now
  share the height instead of falling off the screen.
- Label spacing (`sides`, before): 8 of 49 hero labels within 4 px of a foe at 390x844, 4 of them within 2 px; after at most one.
- Hero height: 38.5 px before against 33.5 to 34.5 px for the taller foes; about 32 px after.
- `v063bd`: its "active hero's card on screen" check at 390x844 also accepts the hero's HP and MP in the command header (the cards now
  follow the commands, as asked). The rest of the regression list passes unchanged.
