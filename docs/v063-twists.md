# Twists for repeat content (v0.6.3 work)

Two small rule changes for content people play again: a weekly twist on the Daily Trial and optional New Game+ modifiers.
Code: `v3/twists.js` (built just before `qready.js`). Tunables and every text: the `TWISTS` block at the end of `v3/config.js`.
Everything wraps existing functions; no shared file holds twist logic. Shared edits: `config.js` (TWISTS), `v3build.py` (MODS),
`shell.html` (one `__A.TW` getter for tests), `tools/chrome/v050p2daily.js` (switches the twist off, see below).

## Daily Trial weekly twist
- One twist per ISO 8601 week (Monday to Sunday) of the trial's own date key (`dailyKey()`, the same key the trial and its
  leaderboard use). The week is computed in UTC from that calendar date, so a given date always has the same twist on every device.
- Pick: `TWISTS.daily[(isoYear*53 + isoWeek) mod n]`. No `Math.random`, no `RNG()`. Two weeks in a row never share a twist
  (the index moves by 1 or 2 each week, including across New Year) and every twist comes up within n weeks.
- It only acts while a Daily Trial battle is running (`B.spec.kind==='daily'`); journeys never see it.
- Shown on the Daily Trial entry screen (gold box "This week's twist", name and one line), on the end screen (one note), and as a
  gold chip next to the weather chip in its battles. Tapping the chip opens a small window with the line (it uses the `wxinfo`
  window, so the fight pauses like the weather popup).
- Leaderboard: scores are stored per day (`scores/<uid>.days[YYYY-MM-DD]`), and every player on a given day has the same twist,
  so no board mixes twists. Schema unchanged.

| id | Name | Rule | Hook |
| --- | --- | --- | --- |
| fire2 | Fire reactions deal double | a reaction with Fire as primer or detonator: x2 | `doReaction` |
| heal | Healing halved | heal skills (via `WX().heal`) and potions x0.5 | `WX`, `useItem` |
| shield | Shields start one pip higher | the Daily Terror and the Echo +1 shield pip | wave start |
| weak | Weak spots hurt more | super effective hits +25%, both sides | `calcDamage` |
| linger | Status effects last a turn longer | every status set in the trial +1 turn | `addSt` |
| primed | Every foe is primed at start | each foe enters primed for 3 turns (element from the reaction primers, by wave and slot) | wave start |
| crit | Sharp eyes | crit chance +10%, everyone | `WX().crit` |
| ward | Warded entry | the front three start each wave with Ward | wave start |
| limit | Limits half charged | Limit gauges start at 50 | first wave |
| glass | Glass foes | foes -20% HP, +20% attack and magic | wave start |

"Gold doubled, items cost double" and "Back row deals +25%" were left out: the trial has no shop or gold, and the back row is the
bench (it does not attack).

Determinism: no twist calls `RNG()` or `Math.random`, so the seeded fight runs the same way for the same inputs. The twist changes
outcomes (that is the point), but the same date on the same build always gives the same twist and therefore the same fights.

## New Game+ modifiers
- Offered only on the starter screen of a New Game+ cycle (`V.ngCycle>0`), in a "Modifiers" panel above the hero cards. Nothing
  picked by default; up to `TWISTS.ng.max` (2); a third tap says to drop one first.
- Stored as `G.ngMods` (array of ids). Optional: old saves have no field and load with none. Ironman also keeps `G.ngDown` (ids
  of fallen heroes). Both live at the top level of the save, so `packG`/`unpackG`, export codes and cloud sync carry them as they are.
  Save keys and the meta key are unchanged.
- Shown on the save card ("Modifiers: ..."), in the header next to NG+ (a small "✦2" with the names as a tooltip) and in
  Menu > Journey under New Game+ (one row each with its risk and reward).
- Rewards: each modifier's `xp`/`gold` multiply battle rewards through `facMul()` (read once per win).
- None of them act in the Daily Trial.

| id | Name | Risk | Reward |
| --- | --- | --- | --- |
| brutal | Foes hit harder | foes +30% attack and magic | +30% XP and gold |
| coldinn | Cold inns | an inn rest restores half of the missing HP and MP (a fallen hero wakes at half) | +50% gold |
| elites | Elites everywhere | in every field, dungeon and cave fight the highest level foe becomes "Elite ...": 2 shield pips, +50% HP | +25% XP and gold |
| react | Reactions only | weak hits and skills no longer chip foe shields, only reactions do | reactions +30%, +15% XP |
| iron | Ironman | a hero who falls stays at 0 HP until an inn rest: feathers, salts, tents, field and battle revives do nothing (no item is used up; KO'd heroes cannot be targeted) | +40% XP |

"Reactions only from primers" in the request: reactions already need a primer and a detonator in this game, so the modifier makes
reactions the only way to crack a guard instead.
Ironman safety: a lost fight still puts everyone back on their feet (as without the modifier), so a journey cannot lock.

## Tests
- `tools/chrome/v063wa.js`: the week rule (same twist Monday to Sunday, different next week, ISO weeks across New Year, every twist
  comes up, no `Math.random`), each twist measured against the same trial with it off, the twist stays out of journeys, entry
  screen, chip and its window at 390x844 and 933x705, and determinism with a twist on (two full auto runs of the same date on a
  fake clock end with the same score, turns, knockouts and battle log, for "primed" and "glass"). About 8 minutes.
- `tools/chrome/v063wb.js`: picker only on NG+, nothing by default, at most two, stored and kept through save, load and export,
  old saves load with none, save card, header and Journey, each modifier measured, layouts at both sizes.
- `tools/chrome/v050p2daily.js` sets `__A.TW.off=true` before starting the trial so it still compares the base trial with the
  previous build like for like; the twist itself is covered by v063wa.

## Known limits
- On a 390 px wide phone the header's NG+ chip was already partly under the gold wallet before this change; the "✦2" sits there
  too. The full list is in Menu > Journey and on the save card.
- Ironman: auto battle can still pick a revive on a hero who stays down; the turn is spent with no effect.
- Healing halved covers heal skills and potions, not Regen ticks or drain.
