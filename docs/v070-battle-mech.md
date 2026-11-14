# v0.7.0 battle mechanics

These are the five owner approved changes to how battles play: the detonation reward, the free swap, Momentum, foe roles and the auto battle check. GAME_VERSION and the changelog were not touched; the lead merges those.
Save keys, db schemas and saved state are unchanged. Every new field lives only on the battle (`B.b4mo`, `B.b4swT`, `B.b4line`,
`u.role`, `u.b4slot`, `u.st.hex`, `u.st.charge`), and the battle is never saved. The Daily Trial is deterministic. No new code reads
the clock for game logic or calls `Math.random`; only the battle's seeded RNG is used. The trial's start is identical to v0.7.0
(`v050p2daily`), and `v063wa` passes, which checks twists and determinism.
Words: the Vanguard is the party's front three. The Rearguard is the back three, who only swap in. The Reserves are heroes outside the party.
The Bravely Default style bank or boost turns system is not added (owner's call).

Code: `v3/battle4.js` and `v3/battle4.css`, built right after `battle3.js` / `battle3.css`. Tunables: the `B4` block at the end of
`v3/config.js`. Everything wraps existing functions (`doReaction`, `exec`, `useItem`, `guard`, `scan`, `canSwap`, `makeEnemy`,
`enemyTurn0`, `calcDamage`, `autoTurnSmart`, `startBattle`, `renderBattle`, `cmdHtml`, `ACT.sw`, `mBeast`). engine.js, battle.js and
foes.js are unchanged. `shell.html` has one getter, `__A.B4`, for the tests.

## 1. Detonation reward
- When a hero detonates a reaction (a primer and then a detonator), that hero gets back `det.mpPct` (10%) of max MP, at least `det.mpMin` (4).
  The MP never goes past the maximum. One action gets at most `det.maxPerAct` (2) refunds, because an all foes detonator can set off several reactions.
- The floating reaction text reads "Melt +4 MP". The log says "X draws N MP from the blast."
- I chose MP over "your next turn comes sooner". It is easy to read and it feeds the next primer or detonator. The turn order stays readable for the intents work.

## 2. Free swap
- On a hero's turn, any other Vanguard hero can trade places with a Rearguard hero. The acting hero keeps the turn: the clock and the
  command menu stay the same. The newcomer takes over the slot and the clock of the hero who steps back. That hero loses ailments, buffs and
  its mark, as with the old Switch.
- The limit is once every `swap.cd` (3) party turns, about one turn cycle of the Vanguard. A Rooted hero cannot step back. A rooted acting
  hero can still open Switch to swap someone else.
- When the acting hero steps back itself, it is the old Switch, unchanged: the newcomer acts at once. This does not use the free swap.
- Screen: Switch opens "Steps back": the acting hero ("Uses this turn") and the other two ("Free", "Free in N", "Rooted"). Then it lists who
  comes in. The hint explains the free swap.
- Auto battle uses it only through the old switch rules (`autoSwitchPick`), now applied to the other Vanguard heroes as well, and only for the
  rules in `swap.autoWhy`: a hurt or ailing hero falls back, or a healer comes in for a line that is getting hurt. The auto settings toggles still apply.
  Auto uses it only on its careful turns (`AUTO_NERF.smart`), the same turns on which it could switch before.

## 3. Momentum
- This is a party gauge, 0 to 100, with a zone from 40 to 75. Every battle starts at 20. Each hero action has a kind: attack; a skill's
  element, delivery and target count; guard; heal; item; support (by its status); scan; limit.
  - The same kind as the party's last action adds `rep` (22). Repeating pushes the gauge toward overheat.
  - A different kind moves it toward the middle of the zone by `vary` (14).
  - Guard above the middle cools it by `guard` (26).
- In the zone, heroes deal 10% more and take 10% less. Reaching 100 overheats it: heroes deal 5% less and take 5% more until it falls back to 75.
  Hot (above the zone, not yet overheated) gives nothing.
- UI: a 98x40 button at the left of the log ticker under the stage. It shows "Momentum", the state ("Build", "+10%", "Hot", "Over")
  and a bar with the zone marked. Tapping it explains it in the log. It changes neither the ticker's height nor `b3Lay`, and it is never over the stage.
- It runs in the Daily Trial too. It is deterministic.

## 4. Foe roles
Each role has a `role` field on the monster, from `B4.roleOf`. Realm, night and overlay variants inherit their base's role. Minibosses and rivals
do not. Bosses are never given a role; they get the Cataclysm (below). The role shows on Scan ("Role: ..." in the log) and in the Bestiary
(a "Role" line).

| role | foes | what it does | the mistake it punishes |
| --- | --- | --- | --- |
| Shieldbearer (`guard`) | Shellguard, Icebound Knight, Husk Watcher (+ Crownshell, Quarry Knight, Drowned Watcher, Charred Husk) | 2 shield pips. While they hold, its allies take 40% less from heroes ("Covered") | hitting the others before you break its shield (weak hits, reactions) |
| Hexer (`hex`) | Ash Wraith, Eclipse Wraith, Rime Wight, Gale Phantom (+ Lightless Wraith) | every other turn, a Hex on the hero with the most stacks (-8% damage per stack). At 3 stacks the next Hex bursts for 30% of max HP | not cleansing (a cleanse, a Remedy, or stepping back clears it) |
| Charger (`charge`) | Barrow Bones, Frostling Yeti, Slag Golem, Skyshaper, Drowned Sailor (+ Dune Golem, Sky Shard) | every 3rd turn it winds up at the weakest hero ("Winding up" icon). On its next turn it hits that slot for 2.6x | not guarding (Guard halves it). A stun or stripping its boons stops it, and swapping a tank into the slot works too |
| Leech (`leech`) | Tide Jelly, Void Spawn, Cave Bat (+ Kiln Bat, Soot Spawn) | every other turn, Siphon on each Vanguard hero who is not guarding (0.6x), healing 7% of its max HP per hero hit | a crowded, unguarded Vanguard and leaving it alive |
| Skirmisher (`flank`) | Frost Wolf, Thunder Hawk, Star Eater, Glass Gull (+ Rime Stalker, Sun Hawk, Moor Tern, Cinder Eater) | once the same three heroes have stood in the Vanguard for 6 party actions, it hits the weakest for 1.9x every turn | never changing the Vanguard (any swap resets the count) |
| boss (`boss`) | every Scourge and Calamity | every 4th turn it gathers power (that turn is spent). On its next turn, a Cataclysm (3.0x) hits the whole Vanguard | not guarding. Guard halves it for each hero who guards. A Break (reeling) loses it |

The first realm has only one role, the Charger (Barrow Bones), which teaches Guard.
Hex and Winding up are two new statuses (`STS.hex`, `STS.charge`), each with its own symbol (`ST_SYM`), so they show on the stage, the cards and in Lore.

**Intents (battle5.js).** `b4RolePlan(u)` returns what the role makes foe `u` do on its next turn, or `null` for its usual move.
For example: `{role:'charge',kind:'windup'|'unleash',n:'Crushing Charge',tg:[hero]}`. The kinds are windup, unleash, hex, doom, siphon, flank,
gather and cataclysm. It never touches the RNG (tested), so it can be read at any time. The role move itself runs inside the foe's action
choice (the `enemyTurn0` wrapper) from that same plan. The other helper should call `b4RolePlan(u)` first when deciding a foe's next action,
then fall back to its own pick.

## 5. Auto battle check (`tools/fullsim.js b4 150`, new)
Setup:
- Parties of 6 (3 Vanguard, 3 Rearguard). Field fights at the middle of each stage's level band +1; bosses at `STAGE_BOSS_LV`. 150 fights per row and policy. Each fight starts at full HP.
- "auto" is the game's auto battle (`autoTurn`). "careful" is the sims' careful player (`autoTurnSmart`).
  On v0.7.0 the careful player also reads roles (`b4Smart`): it guards a coming Charge or Cataclysm that would take over 40% of its HP,
  cleanses Hex at 2 stacks, uses the free swap (Hex, a charge at a weak hero, the Skirmisher's count), breaks the Shieldbearer's
  shield with weak hits, bursts Leeches, and changes its move when Momentum runs hot.
- Before = the commit this pass started from (b878c1d, through `SIMROOT`). After = this pass.
- Columns: win rate / party actions per fight / HP lost (the whole party).
- The battle seeds come from the clock, so rows move by about ±5 points between runs.

| fight | auto before | auto after | careful before | careful after |
| --- | --- | --- | --- | --- |
| stage 1 field, lv 6 | 100% / 9.2 / 2% | 100% / 8.3 / 2% | 100% / 6.0 / 1% | 100% / 5.3 / 0% |
| stage 2 field, lv 12 | 100% / 7.8 / 3% | 100% / 7.3 / 2% | 100% / 5.1 / 1% | 100% / 4.7 / 1% |
| stage 3 field, lv 20 | 100% / 7.6 / 4% | 100% / 7.3 / 3% | 100% / 5.6 / 2% | 100% / 5.7 / 2% |
| stage 4 field, lv 28 | 100% / 8.4 / 4% | 100% / 7.6 / 4% | 100% / 6.1 / 3% | 100% / 5.6 / 3% |
| stage 5 field, lv 36 | 100% / 9.5 / 5% | 100% / 10.6 / 4% | 100% / 6.7 / 5% | 100% / 5.7 / 3% |
| stage 1 boss, lv 8 | 85% / 43.3 / 40% | 75% / 35.3 / 41% | 94% / 27.6 / 24% | 95% / 26.7 / 26% |
| stage 2 boss, lv 16 | 71% / 48.8 / 45% | 65% / 41.0 / 48% | 87% / 39.8 / 36% | 83% / 37.8 / 39% |
| stage 3 boss, lv 24 | 57% / 53.5 / 55% | 46% / 42.4 / 57% | 70% / 44.8 / 45% | 75% / 39.9 / 46% |
| stage 4 boss, lv 32 | 54% / 50.8 / 53% | 43% / 40.8 / 59% | 72% / 43.6 / 45% | 62% / 41.0 / 52% |
| stage 5 boss, lv 40 | 33% / 47.3 / 58% | 28% / 41.3 / 63% | 53% / 43.7 / 50% | 45% / 38.3 / 56% |

Small parties (`fullsim.js stage1 400`: party of 3 at level 3, realm 1 field fights):

| | win | HP lost |
| --- | --- | --- |
| careful | 94% before, 97% after | 13% before, 9% after |
| auto | 96% before, 91% after | 12% before, 15% after |

Normal fights:
- Auto still wins every normal fight with six heroes and 91% with three at level 3. It takes 28 to 86% more actions than careful play (it was 36 to 53%) and loses more HP.
- Careful play got faster: reactions refund MP, Momentum stays in the zone, and roles are answered.

Bosses:
- Auto lost 5 to 11 points of win rate at every boss.
- The gap to careful play is now 17 to 29 points (it was 9 to 20).
- Careful play is about where it was, within noise. The stage 4 and 5 rows are lower in this run, but the 100 fight runs during tuning
  gave 63 to 74% and 53 to 56% for them.
- Bosses now mostly need smart play: auto wins under half of the stage 3 to 5 bosses.

What each piece does (`B4OFF=swap|mo|det|roles node tools/fullsim.js b4 60`, careful at the bosses):
- Momentum is worth the most, about +5 to +15 points.
- The free swap with auto's full switch rules hurt careful play (rule 4, "swap to hit a weakness", trades away strong heroes). That is why auto may use it only for the hurt, ailing and healer rules.
- The Cataclysm at 1.9x hardly moved auto. 2.4x and 3.0x with the "guard only when it hurts" rule opened the gap.
- `B4SET=roles.boss.pw=3,mo.dmg=.1` tries other values.

**Pacing (`fullsim.js journey 8`, top hero's ending level).** The journey sims use the careful player.

| build | journey 8 runs (mean of 8) | 24 runs |
| --- | --- | --- |
| before | 42.4, 43.3, 44.0, 41.9 | 44.0 |
| after | 43.6, 42.9, 43.8, 42.6 | 43.5 |

- The pacing is unchanged within noise. The start of this pass already measures 42 to 44, not the 40.4 of v0.5.1 / 41.6 of v0.6.3. That drift is older than this pass.
- The lead's v0.7.1 XP catch up change (`XPCU {per:.15,sq:.02,max:3,bench:.5}`) is not in this branch, so re-run `journey 8` after the merge.

## Tests (tools/chrome)
- `v070m1.js`: the rules.
  - Detonation: the exact refund once per reaction, the "+N MP" reaction text, no refund without a reaction, the per-action cap with an all foes detonator, the MP cap.
  - Free swap: no turn used (same hero, same clock, still in the command menu), the cooldown, ready again after it, Rooted blocks it, not for the acting hero, the menu flow for a rooted acting hero.
  - Momentum: start, the rise on repeats, building toward the zone, overheat, Guard cooling, staying in the zone with varied moves, the exact +10% / -10% and -5% / +5% damage.
  - Roles: each role and the boss Cataclysm against its plan, the plan untouched by the RNG, Scan lines for all five roles, Bestiary lines (and none for Mossling).
- `v070m2.js`: the screen at 390x844, 844x390, 933x705 and 1280x720.
  - The gauge: every state, inside the log ticker and the screen, off the stage, the log text and the Log button, 40 px tall, its text fits, a spoken label, tapping explains it, the ticker keeps its height.
  - No sideways scroll.
  - The switch menu: 3 + 3 buttons, at least 40 px, inside the screen, not clipped, with the free swap hint.
  - A few seconds of auto battle against the roles.
- Kept passing: v063ba, v063bb, v063bc, v063bd, v058a, v050p1d, v050p1g (the two new status symbols are distinct), v050p2b, v050p4, v061a, v041p6, v063wa, v063wb, v050p2daily (OLDHTML = `git show HEAD:index.html`), liveupdate.

## Limits
- The careful sim player is a script. A real player who reads the intents should do at least as well.
- Momentum counts every hero action, so an action you are forced into (a revive, say) still counts for or against the streak.
- The free swap hands the newcomer the outgoing hero's clock. Swapping in a slower hero right before its turn does not delay it.
- Roles ride on existing skills and art. A role foe's own skill shows on its normal turns.
