# Beta v0.6.3: party systems (worktree report)

Scope: Best Party formations, the Training team, XP catch up against the whole roster, "Equip best: reserves" (renamed in v0.6.4), and the Legendary / Epic labels.
GAME_VERSION and the changelog are not touched (the lead merges those). Save keys and db schemas are unchanged, and there are no new save fields.
Best Party and auto equip stay off in the Daily Trial, and the Trial's XP is untouched.

## Status

| Item | Status | Notes |
|---|---|---|
| 1. Best Party formations | Done | Balanced, Boss ready (Area answer once the boss is down), Fresh mix, Training team, plus a Rotation when fewer than 3 different sixes come out. Chips pick one; each has a summary line and a reason per hero; front line and reserve are placed. 3.4 and 3.5 are kept (reasons, threat line, team check with one tap swaps, "Equip best gear for this party" after Apply). |
| 2. Training team | Done | Up to 4 heroes 3 or more levels below the roster's top level, behind the strongest tank and healer who are not trainees. Each trainee's line says how far behind they are and their catch up bonus in that slot. |
| 3. XP catch up vs the roster's top | Done | The gap is measured against the highest level on the whole roster (party and heroes at camp). XPCU unchanged (+10% per level, +50% cap, reserve half). The fallen still get nothing, the Daily Trial is untouched. Rewards screen: a note names the top level, and the tooltip on each hero's "+N% catch up" gives the gap. |
| 4. Equip best: at camp | Done | Equipment tab button. Plans only for the heroes outside the party, from the pack plus what those heroes already wear. Never takes gear or companions from the party. Same summary and Undo (`snapAuto` / `undoAuto`). |
| 5. Legendary only for legends | Done | `isLeg` is now `LEGEND_IDS` only (Kaevan, Nikaris, Jaeson). Rare tavern visitors (src `r2`..`r4`), Scourge gifts (`g0`..`g4`) and Vaelith (`x`) show an EPIC tag on hero cards, roster cards, Codex tiles, the Codex entry and the hero sheet. |

## Name for heroes outside the party: "At camp"
They rest at the campfire while the six travel, and "Campfire talks" already live there, so it fits the tone. It is used on the Party tab
("At camp, N waiting"), the Equipment tab heading, the button "Equip best: reserves" (renamed in v0.6.4), the auto equip summary ("(at camp)") and Best Party
("Going to camp: ..."). The menu's Roster tab is left alone (MENU_GROUPS belongs to the menus pass). "Reserve" was ruled out because the back
three of the six are already called the Reserve. Alternatives for the owner: "the Rearguard", "Waiting at the inn".

## Code
New file `v3/party3.js` (in `v3build.py` after `hdspell.js`, before `qready.js`). It reassigns `bestParty` and `mBestParty` (after
p3shop.js) and wraps `ACT.bpOpen` (Daily guard), `ACT.p3Swap` (keeps the chosen formation), `mAutoEq` and `vEquipTab`. New actions
`bpPick`, `autoEqCamp`. Test hook `window.__P6` (our own object; `__A` is not touched).

Small edits elsewhere: `p4xp.js` (roster top level; the old x1.4 is still divided back out against the party's top level, which is what
engine.js used), `results.js` (catch up note and tooltip), `ui.js` (`isLeg`, `isEpic`, `epicTag`, `heroTag`, heroCard, the sheet's name),
`nav.js` (roster card tag, "At camp" heading), `account.js` (Codex tile tag and the entry's "· Epic"), `config.js` (`BP6`),
`tools/fullsim.js` (new `xpcamp` sim).

### How Best Party scores a six (`p6Score`, tunables `BP6`)
- Roles first: the 1st, 2nd and 3rd tank are worth 1, .15, -.4; healers 1, .3, -.3; support (Bards, or allies' buffs from a non tank,
  non healer) .35, -.05, -.2; damage dealers .4, .35, .12; the first Primer and Detonator .4 each; each extra hero of a class already in the
  six -.28; each delivery covered (piercing, blunt, ranged, magic) .08; each element .05.
- Then the 3.4 answers (`BP_AWARE`): known archetypes, the area's elements, the boss's element. Boss ready multiplies the boss's element
  (x3) and archetype (x2); Area answer multiplies the area's archetypes and elements (x2.5).
- Strength last: `BP6.str` (.5) x sqrt(power / best power) per hero, so a level or gear lead counts little. A hero below 55% of the best
  power costs 1.6 x the shortfall (not in the Training team).
- Distinct suggestions: Fresh mix pays .32 per hero shared with Balanced; Rotation pays .32 per hero shared with every earlier formation.
  Boss ready pays nothing: when it matches Balanced the screen says "Boss ready would pick the same six".
- Search: greedy fill, then three swap passes (the old method).

### Placement
The front line is who fights; the reserve swaps in when someone falls or tires (`doSwap` and the auto swap). So the front holds the
best tank, the best healer and the best damage dealer (Boss ready: the one who answers the boss), and the reserve starts with the backup
healer and tank. Training team: the anchor tank and healer and the strongest trainee in front, the other trainees in reserve (they get the
reserve's share and half the catch up, but they are safe).

## Tests (tools/chrome, `PWHTML=../../out/aurelis3.html`)
- `v063pa.js` (ALL PASS): at least 3 distinct formations on four varied rosters (one with everyone at the same level), named formations,
  a reason per pick, Fresh mix shares at most 4 with Balanced, Balanced has a tank and healer, the front three hold the tank and healer,
  a Lv 13 healer beats a third Lv 24 tank, four Lv 26 mages do not crowd out a Lv 19 archer and thief, Training team picks the four furthest
  behind and keeps a strong tank and healer, it explains who trains, no Training team when nobody is behind, the screen's chips, Front line
  and Reserve, pick and Apply in that order, "Equip best gear for this party" still offered, off in the Daily Trial, LEGENDARY only on
  LEGEND_IDS, EPIC on rare and epic tier wayfarers, roster cards for Zephra, Kaevan and Brann, the "At camp" heading.
- `v063pb.js` (ALL PASS): catch up measured against a Lv 14 hero at camp (+20% for Lv 12, +50% cap, reserve half), the hero at camp gets
  nothing, real XP ratio 1.25, the rewards screen, no bonus for the top hero in the party, no rows without a gap, XPCU unchanged; at camp
  auto equip: button and heading, equips the heroes at camp from the pack, party gear untouched, a party hero's companion untouched,
  summary only lists heroes at camp, Undo restores gear, pack and companions exactly, Daily Trial unaffected.
- Still passing: v050p3a, v050p3b, v050p4, v061a, v043c, v041p6, eq, eq2, tavern, smithy, v050p1h, ucards, v041p5.
- Same result as the pre-change build (pre-existing): p4b "result screen shows xp rows" fails on both; v040p3 stops on a canvas
  `getImageData` error on both; gear.js reads `tools/out/aurelis.html` (old path) and does not run.

## Pacing (`node tools/fullsim.js ...`, before = HEAD build via SIMROOT)
- `journey 8`, top hero's ending level, three batches each (the sim is noisy: boss tries vary from 1 to 40):
  before 43.6, 40.8, 44.1 (pooled mean 42.8); after 40.6, 40.0, 44.3 (pooled mean 41.6). In this sim every recruit joins the six
  (the roster is the party), so the new rule is the same as the old one there and the difference is noise. The top hero never gets a
  catch up bonus, so XPCU cannot move this number. Inside 38 to 42: XPCU not changed.
- `xp 30` (newcomers in a party of 6): same rule in this sim, within noise (for example stage 3, 10 behind: front 7.7 / reserve 8.0
  before, 6.8 / 7.6 after).
- `xpcamp 30` (new: a party of 6 that is G levels below a veteran resting at camp), levels gained, front / reserve:
  stage 2, 3 behind 3.69/2.84 before, 3.74/2.78 after; stage 3, 5 behind 4.22/3.30 → 5.13/3.60; stage 4, 8 behind 4.61/3.79 → 5.83/5.72;
  stage 5, 4 behind 3.66/4.16 → 4.93/4.00. Fights with a catch up row: 63 to 70 of 90 before (only gaps inside the party), 90 of 90 after.

## Left for the lead
- Confirm "At camp" with the owner (alternatives: "the Rearguard", "Waiting at the inn").
- The Roster menu tab name (MENU_GROUPS) and the battle detail panel (battleui.js) were not renamed; the battle panel's legend strip
  already uses `isLeg`, which is now LEGEND_IDS only.
- Design notes and changelog lines for v0.6.3.
