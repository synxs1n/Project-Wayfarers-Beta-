# v0.7.0 battle information and input

Three requests the owner approved from similar games: a turn order bar with a real forecast, foe intent icons, and optional timed hits.
GAME_VERSION and the changelog are untouched (the lead merges those). No save key or db schema changed; the one new setting
(`META.cfg.timedHits`) is optional and off when missing. The Daily Trial stays deterministic (`v050p2daily`, `v063wa`).

Words: the party's front three are the **Vanguard**, the back three the **Rearguard**, heroes outside the party are **Reserves**.

## 1. Turn order bar
The bar above the stage (`#border`, outside the stage, so it never covers a face or a stage label) now shows the next turns from the
engine's own model:
- **Model (engine.js):** every live unit has a time `u.next`; `advance0` gives the turn to the smallest (heroes win ties); after acting a
  unit waits `delayOf(u, cost)` (speed, tempo, weather, haste x0.65, slow x1.5, root x1.25). Statuses tick down at the end of their owner's
  turn. Stunned and broken units still use up their turn slot.
- **Forecast (`b5Order`, battle5.js):** steps that model forward with the same tie rule, calling `delayOf` itself (so anything that
  wraps `delayOf` later, such as the Momentum work, is followed automatically), running haste, slow and root out after the turns they have
  left, and knowing the frenzy quirk (a frenzied foe acts again 60 time units later every third turn). The engine's `turnOrder` now
  returns the same forecast.
- **Shown:** 6 entries on portrait phones (`B5.order.tall`), 8 elsewhere (`B5.order.wide`); entries that do not fit the row are dropped
  from the end (at least 4 stay; on a 390 px phone it shows 5 or 6), so the bar never scrolls. The unit acting now is framed in gold.
  Foe entries carry the foe's intent badge to the right of the portrait.
- **Updates:** the bar is rebuilt on every battle render, so a haste, slow, stun, KO, swap, summon or surprise start shows at once.
- **Preview:** while a skill, item or Scan is aimed and its cost is not 1 (Scan 0.5, items 0.8, skills with their own cost), the bar shows
  the order "If used" and marks the hero's next turn with a dashed frame. What a skill does to other units (a slow on the target, say) is
  not previewed: that needs the hit roll.

## 2. Foe intents
- **The plan is real.** `enemyTurn0` is split in two: `foePlan(u)` decides the foe's next action, `enemyTurn0` then does exactly that
  action (the target is still chosen as before, when it acts). `foeChoose(u, rand, n)` holds the original weights (a missing buff 22%,
  a boss's party-wide skill every third turn, a skill 55%, else Attack). The plan for turn n is drawn from a stream seeded by the battle
  seed, the wave, the foe's slot and n, so it is the same whenever it is first asked for, and the Daily Trial stays deterministic. The
  main battle RNG no longer draws for the foe's choice (targets, hits and effects still use it). A plan is only dropped when the foe
  cannot act (stunned, broken: the plan then waits for its next real turn) or the fight ends.
  To change what foes do (foe roles), wrap `foeChoose` (or `foePlan`): the icon follows automatically.
- **Categories (`b5Cat`):** Attack, Big hit (party wide or power at least `B5.bigPw`), Power up (self buff), Status (a status chance of at
  least `B5.stCh`, or a status skill), Heal (heal, revive, regen), Guard (ward, bulwark, taunt), Summon (a skill with `summon`; none of
  today's foes has one, the summons come from boss phases).
- **Who sees it:** the icon shows once the foe type's moves are known in the Bestiary: the same rule as the unit details panel already used
  for "Stats and skills are known", the **Studied** tier (`tierOf >= 2`: scanned, or 10 defeated; a Scourge or Calamity once beaten or
  scanned). A Scan in battle reveals it at once. Unknown foes show "?". This rewards the Scan command and the Bestiary the game already
  has, instead of adding a new kind of knowledge.
- **Where:** on the stage a small label (`B5.it`, 11 x 10 stage px) placed by the layout pass (`b3Lay` is wrapped: after the other
  labels it places one intent label per live foe beside its HP plate, then over or under it, then around the body, with every sprite and
  label as an obstacle; one that finds no spot is listed in `L.hidden` and the bar still shows it). In the bar, the badge sits beside the
  foe's portrait (never on it). Both carry a title such as "Next: Rime Fang (Big hit)".

## 3. Timed hits (Settings, off by default)
- Settings has a "Timed hits" row (Off / On), stored as `META.cfg.timedHits` (missing = Off).
- When on, a hero's single target attack or skill (physical or magic, on a foe) opens a ring over the target: an outer ring closes onto the
  target ring in `B5.ringMs` ms; a press within `B5.win` ms of the moment they meet gives `B5.atkUp` (+15%) damage and "Timed!". When a foe
  aims a single target attack at a hero, the ring opens over the hero and a timed press takes `B5.defDown` (15%) off ("Timed guard").
  An early press is a miss (one try), no press is a miss; the action then goes on at normal damage.
- Input: any tap or click (pointerdown, captured so it does not reach a button), any key except Tab, Escape and modifiers (key repeats
  ignored), a gamepad face button (A, B, X, Y; `padPoll` is wrapped while the ring is up). Presses in the first `B5.grace` ms are ignored
  so the tap that chose the target cannot count.
- Never on auto battle (auto skips it entirely, so it never waits), never in the Daily Trial even when on (fair scores), never for
  companions, party wide skills, heals or buffs.
- Reduced motion (the game's Motion setting or the device setting): the closing ring is not drawn; the target ring lights up for a wider
  window (`B5.winRM`) instead.
- Damage: `calcDamage` is wrapped; the multiplier applies only to the chosen action, its actor and its target.

## Files
- `v3/battle5.js` (new, right after `battle3.js` in v3build.py): the forecast, the bar markup, plans and the new `enemyTurn0`, intent
  labels (wrappers of `b3Lay` and `b3StageHtml`), timed hits (wrappers of `exec`, `calcDamage`, `padPoll`, `settingsBody`), and the
  bar fitting (`renderBattle` wrapper).
- `v3/battle5.css` (new, after `battle3.css` in both CSS lines of v3build.py): the intent label and badge, the preview, the ring.
- `v3/config.js`: block `B5`.
- `v3/ui.js`: one line, the order bar markup comes from `b5OrderHtml()`.
- `v3/shell.html`: `window.__A.B5` (a getter, a new key) for the tests.

## Tests (tools/chrome)
- `v070ia.js` (1, 2): 20 long auto battles at 390x844 and 933x705, about 30 turns each: the bar starts with the acting unit every turn,
  shows the forecast in order, highlights the acting unit; the forecast's next actor and whole window against what actually happened;
  each foe action against the icon the screen showed for it just before (studied foes), "?" for unknown foes, a scan reveals the intent,
  slow and haste move units in the forecast.
- `v070ib.js` (1, 2): random battles (as `v063ba`) at 390x844, 844x390, 933x705, 1280x720, half with studied foes: no label (intent
  labels included) on another label or a sprite; the bar off the stage, every entry fully visible, no badge on a portrait; almost every
  live foe has its intent on the stage.
- `v070ic.js` (3): off by default (no ring, normal damage, Settings row Off); on: keyboard, mouse, touch and gamepad presses each give
  +15%; an early press and no press give nothing; the guard ring takes 15% off a foe's attack; auto shows no ring and keeps going;
  reduced motion; the Daily Trial keeps it off.

## Results
Before = a build of the commit this pass started from (Beta v0.7.0, `b878c1d`), after = this pass, same session (the machine was
shared with other test runs).

| test | before | after |
|---|---|---|
| `v070ia` | new (no `__A.B5`) | passes: 617 turns in 20 battles; next actor as forecast 590 of 597 (98.8%), whole forecast window 3562 of 3843 (92.7%, the misses are player and auto choices that cost other than 1, statuses that land, KOs); studied foes showed the action they did 145 of 145; unknown foes showed "?" 88 of 88; the bar showed 4 to 6 entries at 390 px, 8 at 933 px |
| `v070ib` (10 battles per size) | new | passes at all four sizes; 0 overlaps; every live foe had its intent on the stage |
| `v070ic` | new | passes (13 checks) |

Regression list: v063ba, v063bb, v063bc, v063bd, v058a, v053b, v060a, v050p1d, v051a, v063wa, v050p2daily (Daily Trial identical to the
old build), v041p6, liveupdate pass before and after. `v062a` has one world lighting check that flips between runs on both builds (before:
"torch close by lights the hero" in one run, after: "torch" in one run and "hero lit like the scene" in another; 21 of 22 pass each time);
it tests the world, which this pass does not touch.

Frame rate (`v053bperf.js`, `TIERS=medium REPS=3`, CPU 4x, dpr 2, a field battle on auto in rain, best of 3):

| size | before Medium | after Medium |
|---|---|---|
| 390x844 | 45.9 fps (30% of frames over 20 ms) | 49.1 (30%) |
| 844x390 | 40.9 (46%) | 40.1 (50%) |

The forecast runs on battle renders only (a few dozen steps), the intent labels join the cached layout pass.

## Limits
- The forecast cannot know what the player will choose (a Guard costs 0.6, an item 0.8), nor random effects yet to happen (a slow that
  may land, Vex's Double Time, a bond skill pushing a partner back, a KO); it assumes a cost of 1 for everyone after the current unit.
  It is exact otherwise.
- The preview shows only the hero's own cost, not what the skill would do to other units.
- With many units on a portrait stage an intent label may sit a little away from its foe (the nearest free spot); one that finds no spot
  is only in the bar.
- Timed hits are judged on the ring's clock, not on the attack animation's frames.
