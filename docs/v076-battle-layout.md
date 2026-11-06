# v0.7.6 wide battle layout

The owner's report, from a Galaxy Z Fold 8 open (about 933x705 CSS px, wide layout class `m-wide`): use the space better, put the foes
under the actions and stretch both, list the Rearguard one hero per row like the Vanguard, the screen ran past the bottom of the phone,
words came off their buttons. A second report, during a boss fight while aiming a skill: the target tags on the stage ("The Gallow ★",
"Resists", "⟐ Prim...") were cut at their edges and the foe cards' names, "SHIELD ... BROKEN" and the type chips were cut.
GAME_VERSION and the changelog are untouched (the lead merges those). No save key, game state or rule changed.

Measured on Beta v0.7.5 at 933x705: the page was 860 to 890 px tall (it scrolled), under the stage three columns (commands 309 px wide,
foes 290 px with lots of empty space, the party with the Rearguard two across), and "Attack", "Start auto", "Speed 1x" overflowed.

## The wide layout (`m-wide`: the Fold open, tablets, desktops)
- **Two columns under the stage** (`.bbottom` grid, `1.42fr` / `1fr`): left the commands with the foes right under them, right the party
  column (`.b3pty`, a new wrapper in `ui.js` around the Vanguard and Rearguard groups; `display:contents` in every other layout, so the
  portrait and landscape phone layouts are unchanged). Both columns stretch over the full width.
- **Commands:** the same rows (Attack, Skills, Items, Guard / Scan, Lore, Switch, Flee / Pause, Auto, Speed, settings) stretched over the
  column; tighter padding (prime row 42 px, the others 40 px).
- **Foes:** compact cards (icon, name, element icons, HP bar and value, shield pips, the i button) on a six track grid: 3 a row, 2 a row for
  2 or 4 foes, a lone foe the whole row, 5 foes as 3 then 2 wider ones (no empty slot). A narrow column (under 430 px) takes 2 a row.
  The level shows where the card is at least 215 px wide; the word "Shield" where it is at least 215 px (the pips keep their spoken
  label); the type chips (Armored, Plant...) are left to the i panel, as on portrait phones (`battleui.js`).
- **Vanguard:** one hero per row, 42 px: portrait, name and level on top, HP, MP and Limit side by side under it, the i button. In a party
  column under 340 px (small tablets in portrait) the bars go back to one per line.
- **Rearguard:** one hero per row like the Vanguard, 40 px, one line: portrait, name, level, element icons, HP bar and value, the i button.
  The dashed tap-to-switch frame (`.swapok`) and the tap-to-switch behaviour are unchanged.
- **Group titles** sit as small tabs on each panel's top edge, so the cards start right under the edge.
- **Boss fights:** the boss bar and the turn order share one row (the order bar drops entries from its end as before, at least 4 stay).
- **Sub menus:** a list menu (skills, items, switch) takes the whole left column (the foes come back for the target step; the stage
  keeps every foe's plate) and the list runs two across (switch: three across). The commands panel scrolls inside itself when a list is
  longer than the column; the command header (with Back) is sticky inside it.
- **Fit:** `layoutBattle` sizes the wide stage from what the columns need (`b3WideSc`, `b3WideNeed` in `battle3.js`): the stage is as large
  as the width allows, small enough that the columns fit under it, in steps of `B3.wideStep` (0.05), never below `B3.wideMin` (1.35, so at
  least 210 px tall at 933x705), same 320x150 aspect and the same HD canvas. The commands count at their tallest top level height seen
  in the battle and the need only grows within a battle, so the stage never jumps between turns, menus or auto (it may shrink a few
  times, for example when a Limit button first appears). `b3WideBot` sets `--b3bot`, the height left for the columns. Last resort
  only: if a column is still taller (many statuses on many cards at the minimum stage), its own panel scrolls (the foe cards, or the
  party column), never the page. The body's bottom padding is 4 px on this screen (it was 40 px).
- The turn order bar (46 px), the sky chips, the Momentum gauge and the log strip stay where they were, always on screen.

## Text never cut
- Command labels (`.cmd .mi`, `.cmd .btn`, the auto row) wrap to a second line instead of running out of the button (words are not split).
  Only names end in an ellipsis (cards, the command header, the boss bar, the switch menu).
- Card status rows that do not fit their line wrap to a second one (`b3TagFit` adds `.tagwrap`; every layout).
- **Aim tags on the stage:** the layout pass measures the text with the canvas font; where the device draws it wider (its own font or
  text scaling), the tag's font now shrinks to fit its laid out box (`b3FitTags`, remembered per text in `B3TK` so it does not flicker;
  the box and so its place off faces stay exactly as `b3Lay` placed them). The primer hint is now "⟐" plus the element's symbol instead of
  "⟐ Prime" (shorter, with a title).

## Files
- `v3/battle3.css`: the old wide block replaced by the v0.7.6 block at the end (columns, compact cards, tabs, boss row, list menus, fit),
  label wrapping, `.tagwrap`.
- `v3/battle3.js`: `b3WideNeed`, `b3WideSc`, `b3WideBot`, `b3TagFit`, `b3FitTags` (+ a `renderBattle` wrapper while aiming), the shorter
  primer hint in the target tag.
- `v3/battle.js`: `layoutBattle` uses `b3WideSc` / `b3WideBot` in the wide mode; `fitBattle` runs `b3TagFit` and sets `.b3list`.
- `v3/ui.js`: the `.b3pty` wrapper. `v3/battleui.js`: no type chips on wide foe cards. `v3/config.js`: `B3.wideMin`, `B3.wideStep`.

## Tests (tools/chrome)
- `v076b.js` (new): at 933x705, 1024x768, 1280x720, 1280x800, battles with 3 to 6 heroes and 1 to 5 foes plus a boss fight, in every menu
  state (root, skills, items, target, switch, speed 1.5x, auto): no page scroll, the order bar, sky chips, stage, Momentum and log strip
  on screen, the foes right under the commands in the same column (hidden only while a list menu takes it), the party column beside it
  with the Vanguard then the Rearguard, rows one per line and full width, the Rearguard with level, HP bar and value and its dashed
  switch frame, the columns spanning the width (each 33 to 66%), the stage at least 210 px at 933x705, tap targets 40 px, fonts; and
  no text cut (scrollWidth / scrollHeight against the box, labels inside their button) at those sizes and at 390x844 and 844x390.
  Then aim tags: a plain, a primer and a detonator skill aimed at a boss fight (elite name, broken shield) and a field fight with
  primed foes, at all six sizes, also with the tag text drawn wider than measured (`letter-spacing`): every tag's text inside its box,
  the box inside the stage and off every sprite and label (`overlaps` from `v063lib.js`), no card text cut.
  `node v076b.js shots` writes screenshots into `tools/chrome/shots-v076b/` (not committed).

## Results
Before = a build of Beta v0.7.5 (`c73ac13`), after = this pass, same session.

| test | before | after |
|---|---|---|
| `v076b` | 762 fails: the page scrolls at every wide size (891 to 1047 px tall in the menus), the foes beside the commands, the Rearguard two across, three columns of about 33% each, "Attack" / "Start auto" / "Speed 1.5x" / "Auto locked" cut, aim tags cut when the text is drawn wider ("Neutral ⟐ Prime" 55 px in a 51 px tag), a card status row cut at 844x390 | passes (2363 checks) |

Layout after, 6 heroes and 5 foes (document height = viewport height at every size):

| size | stage | left column (commands + foes) | party column |
|---|---|---|---|
| 933x705 | 440x211 (scale 1.35, the minimum; 456x218 with some seeds) | 525 px | 370 px |
| 1024x768 | 568x271 (1.75) | 579 px | 407 px |
| 1280x720 (content 1000 px wide) | 472x226 (1.45) | 583 px | 411 px |
| 1280x800 | 648x308 (2.0) | 583 px | 411 px |

With fewer units the stage grows (933x705, 3 heroes and 2 foes: 552x263; 1280x800, 3 heroes and 2 foes: 760x361).

Regression list (after): v063ba, v063bb, v063bc, v063bd, v070ia, v070ib, v070ic, v070m1, v070m2, v058a, v053b, v060a, v050p1d, v051a,
v070ob, v041p6, wide, liveupdate pass (liveupdate logs its own simulated "broken build" page error, as before).

## Limits
- At the minimum stage (6 heroes, 5 foes on 933x705) the stage is 440x211 to 456x218 and the columns are full; a boss fight at that size adds the
  lock reason line, which still fits. Many card status rows at once may make one panel scroll inside itself.
- Foe names in three-across cards are short (about 10 letters, then an ellipsis; the full name is on the stage tag, the card's spoken
  label and the i panel).
- The type chips are not on wide foe cards any more (they never were on portrait cards); the i panel lists them.
