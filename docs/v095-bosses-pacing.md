# v0.9.5 fewer, better fights; boss realm gimmicks; companion growth; depth by realm (worktree report)

Four owner approved changes, built on v0.9.4. GAME_VERSION and the changelog are not touched (the lead merges those). Save keys are
unchanged; every new save field is optional: `G.pcV` (a journey started on v0.9.5, gated by realm), `G.pcN` (which realm notices were
shown), `o.bt` on a companion (battles won beside its hero). Older saves miss them and keep working (see 4).
The Daily Trial is unchanged: no gimmicks, no gating, no ENC rewards there, and its random streams are untouched
(`v050p2daily` against the v0.9.4 build: identical start; `v063wa` passes).

## 1. Fewer, better fights

What changed (config.js unless noted):
- `ENC_RATE` normal .13 -> .035 (low .07 -> .02, high .18 -> .06) and `ENC_MIN_STEPS` 7 -> 12: one random battle about every 41 steps
  on a field instead of about every 15 (`v095p1` counts 200 in 8000 steps, v0.8.2 rate: about 545). Dungeons keep their x0.6.
- `ROAM.base` 3 -> 4 (dungeon roamers 4 + 1 per realm) and new field roamers (`ROAM.field`, 2 + 1 per realm), so 6 to 14 visible foes
  per realm instead of 3 to 7. They stand on open grass or ground, at least 7 tiles from exits, caves, the dungeon door, people and the
  start (`roamKeepOut`), patrol, chase and give up exactly like the dungeon ones, and give the surprise round when touched unaware
  (p2world.js, unchanged). Drawn in 2D (roam.js) and HD-2D (one condition in `hd2d.js`).
- Roles: `roamPick` puts one of each foe role in the realm's pool first (`ROAM.roles`), so each realm's roamers show its roles
  (all of them in the dungeon, as many as fit on the field; every one of the sixteen realm pools is covered by a dungeon's four).
- `ENC` (new): ordinary fights pay more now that there are fewer of them: XP x`ENC.rew.xp` by stage [2, 1.6, 1.2, 1, 0.85] (the early
  realms lost the most fights), gold x1.45, and a roamer x1.1 XP / x1.15 gold on top. Applied through `facMul` (the same hook as the NG+
  modifiers) only to random field and dungeon battles and roamers (`encRewMul` in roam.js); bosses, elites, minibosses, the arena and
  the Trial are untouched.
- Time now comes from content: the visible roamers (tougher, chosen fights with a walk to reach them), the side sites (cave and
  fortress with their minibosses) and the bosses (gimmicks, below).

### The journey sim (`tools/fullsim.js journey 16`)
The sim (mine) now models what replaces the random battles:
- the roamers the journey really spawns on each field and in each dungeon are real roamer fights (`ROAMSHARE` .8 of them fought, half
  caught unaware, elites by hand); before, the sim played `3+s` plain dungeon fights for them.
- the side sites (each field's cave and fortress, `SITESHARE` .7 visited once the realm's boss has fallen): `siteSteps` 110 walked (their
  random battles at the dungeon rate), `siteTime` 300 s of chests and prizes, and the real miniboss fight by hand. `TIME.side` (the rest
  of the optional content) 480 -> 300 s per realm, since the sites were in it. A roamer adds `roamWalk` 30 steps.
- elite roamers and minibosses are played by hand in the sims (`autoBan` lifted in the harness, like the boss auto lock).
- SUMMARY splits fights into roamers, random and minibosses; each run lists its bosses. `gim [N]` is new (below).

Numbers (`SEED=n node tools/fullsim.js journey 16`; before = v0.9.4 through `SIMROOT`; "old sim" = v0.9.4's own fullsim.js):

| build and sim | top level mean (sd, range) | fights (roamers / random / minibosses) | boss tries per journey (max) | hours typical / all by hand |
|---|---|---|---|---|
| v0.9.4, old sim, SEED 1 | 40.2 (1.2, 39-43) | 209 (175-298) | 13.4 (31) | 4.55 / 5.28 |
| v0.9.4, old sim, SEED 2 | 40.1 (2.0, 38-46) | 217 (174-372) | 14.8 (45) | 4.72 / 5.47 |
| v0.9.4, new sim, SEED 1 | 43.2 (0.9, 42-45) | 231 (20 / 164 / 4.3) | 13.6 (21) | 5.12 / 5.88 |
| v0.9.4, new sim, SEED 2 | 43.3 (1.6, 42-49) | 240 (20 / 164 / 4.3) | 15.3 (62) | 5.29 / 6.09 |
| **v0.9.5, SEED 1** | **40.9 (2.0, 38-46)** | **153 (40 / 59 / 4.3)** | 14.9 (32) | **4.72 / 5.25** |
| **v0.9.5, SEED 2** | **41.0 (2.2, 38-47)** | **161 (40 / 59 / 4.3)** | 16.4 (51) | **4.90 / 5.46** |
| **v0.9.5, SEED 3** | **40.1 (1.8, 38-46)** | **145 (40 / 59 / 4.3)** | 13.3 (39) | **4.60 / 5.13** |

- Fights per journey: 33 to 34% fewer than v0.9.4 under the same sim (231 -> 153, 240 -> 161), 26 to 27% fewer than the old sim's
  209 and 217 (that sim left out the side sites and counted 3 to 7 plain fights for the roamers). Random battles: 164 -> 59 (-64%);
  the rest is roamers (40, chosen), minibosses and the fights after a lost boss.
- Ending level 40.1 to 41.0 (target 38 to 42). Under the new sim v0.9.4 ends at 43.2 because the side sites (miniboss XP) now count.
- Time 4.6 to 4.9 hours typical (5.1 to 5.5 by hand): it now comes from the sites, the roamers and the bosses rather than random battles.
- Boss tries are close to before (13.3 to 16.4 against 13.4 to 15.3); the long tails are parties with no healer at one boss, as before.
- `stage1 300` (party of 3 at level 3, realm 1 field): careful 94% -> 95% won, 13% HP lost; auto 88% -> 89%; roamers 100% / 99-100%,
  surprise rounds on every unaware roamer.
- `v080cb` (journey 16, SEED 1: mean 39 to 41, sd <= 2.5, at most 25 tries on one boss, <= 16 per journey, 4.5 to 6 hours) passes:
  40.9, 2.0, 13, 14.9, 4.72.

## 2. Bosses as events: one realm gimmick each

Code: battle4.js section 5 (`b4Gim*`), data and tunables in `BOSS_GIM` (config.js section 3). Every Scourge (12) and Calamity (4):

| boss | gimmick | type | telegraph (its turn) | lands (its next turn) | the answer |
|---|---|---|---|---|---|
| Thornback Warden | Thorn Snare | slot | roots creep under one Vanguard spot (Marked) | 14% max HP + Root | Guard (half, no Root), or swap a sturdier hero in |
| Maelstrom Drake | Rising Tide | tide | the water swells | tide +1 (max 3): heroes without Water 5% slower per level, Water skills +8% per level | an Earth skill dams it one level |
| Cinderking Varroth | Lava Vents | slot | the ground glows red under one spot | 17% + Burn | Guard, swap |
| Hoarwyrm | Blizzard | chill | the blizzard thickens | every hero not guarding: Chill +1 (12% slower each); 3 = Frozen (a lost turn) | Guard; a Fire skill (or a cleanse) thaws |
| Stormcaller Ysolde | Lightning Rod | rod | the strongest hero is marked (the mark follows the hero) | 20% to them, 35% of that to each neighbour | Guard halves; swap the hero out and it grounds |
| Bone Colossus | Reassemble | sac | bones rattle toward it | heals 12% | 7% of its HP in damage before its turn scatters them |
| Queen Mantis | Brood | sac | an egg sac swells | a Gust Imp hatches | 7% damage bursts it |
| Gloomcap Matriarch | Spore Bloom | sac | a spore pod swells | Poison on every hero not guarding | a Fire hit or 6% damage pops it; Guard |
| Iron Sentinel | Overheat | sac | its furnace glows white | Might + Haste | a Water or Ice hit, or 8% damage, cools it |
| Siren of the Deep | Mirror Song | mirror | her song turns glassy | for a round: magic deals 35% less and 12% splashes back | use weapons that round |
| Ashen Wyvern | Take Wing | wing | it spreads its wings | airborne a round (non Ranged weapon hits 35% less), marks the weakest spot | Ranged or magic; then it dives at the spot for 16%: Guard it |
| Frost Lich | Grave Mist | veil | frost mist gathers | veiled a round: 50% less damage | a Scan or a Light skill reveals it |
| The Dimmer | Swallowed Light | dark | the lights gutter | darkness +1 (max 2): heroes deal 10% less per level | a Fire or Light skill lights a torch (back to 0) |
| Nidhra | Eclipse Form | phase2 | cracks of black fire at 65% HP | at 50%: three new moves and its shield whole again | save a weakness hit for after |
| The Hollow King | Royal Guard | sac | he raises his hand to call a servant | a Void Spawn joins | Break his shield or 8% damage |
| Seraph of Ash | Pillars of Ash | slot (2) | light gathers over two spots | 12% + Blind on each | Guard, swap |

Rules:
- The first telegraph is on the boss's 2nd turn (`first`), then every `every` turns (4; tide and dark 3; Siren and Wyvern 5). It lands at
  the start of its next turn, before its usual move; one-round effects (mirror, veil, airborne) end at the turn after. A stun or a Break
  delays it (the boss's turn is skipped). Hits are a share of the hero's max HP, x`stageK` [.5, .85, 1, 1, 1] (the first Scourge is the
  gentle introduction), halved by Guard. They interleave with the Cataclysm (every 4th turn) rather than stack on it.
- Shown: the fight's opening log line "Realm gimmick: <name>: <one line>." (after the boss's intro); at the telegraph a log line with the
  answer, a "Telegraph" chip on the boss and "Marked" / "Lightning rod" chips on the heroes it will hit (they move with swaps and falls,
  `b4GimSync` on every render); "Airborne", "Veiled", "Mirror", "Rising Tide", "Darkness" and "Chill" chips while active. Each chip has
  its own symbol (`ST_SYM`) and a description in Lore. The i panel (`uDetHtml`, wrapped) has a "Realm gimmick" row: the line and where
  it stands now ("Telegraphed: ... lands on its next turn", "Level 2 of 3", ...). A Scan of the boss repeats the line.
- Deterministic: no RNG, no clock. Spots come from the boss key and the telegraph count, the rod from the heroes' stats.
  So a telegraph read in advance is what happens. Only in the first fight with a Scourge or Calamity (kind 'boss'): Echoes keep their own
  extra phase and are unchanged. Off in the Daily Trial (`BOSS_GIM.daily` false), so the Trial's Echo wave is unchanged.
- Auto works through it (it does not read telegraphs; auto is locked on a first boss attempt anyway). The sims' careful player
  (`b4GimSmart`, before the role rules) guards a marked spot that would hurt, hits a readied move with the needed element or its best
  single target, thaws, dams, lights torches, reveals the veil (Light skill or Scan), uses weapons into a mirror and Ranged or magic at a
  flyer.
- Balance: the gimmick adds pressure, so `BOSS_BUFF.hp` went [1.15, 1.65, 1.7, 2.0, 1.52] -> [.9, 1.5, 1.55, 1.76, 1.36] and the first
  Scourge's power 1.05 -> 1 (the first realm also has no reactions now, see 4).

Win rates, before (v0.9.4) -> after:

`bossgrid 12` (every boss 12 times at each stage, journey party sizes, the careful player; the "all" column):

| stage, party | boss lv -2 | boss lv | boss lv +2 |
|---|---|---|---|
| 1, party 3 | 19 -> 18 | 56 -> 52 | 65 -> 63 |
| 2, party 4 | 20 -> 16 | 45 -> 47 | 62 -> 54 |
| 3, party 5 | 38 -> 35 | 52 -> 52 | 55 -> 53 |
| 4, party 6 | 57 -> 46 | 65 -> 64 | 63 -> 61 |
| 5, party 6 (Calamities) | 50 -> 46 | 52 -> 63 | 63 -> 56 |

`b4 60` (party of 6 at the boss level, 60 fights per row; rows move about +-10 between runs, the stage 5 row by more):

| boss | auto before -> after | careful before -> after |
|---|---|---|
| stage 1 | 88 -> 92% | 97 -> 100% |
| stage 2 | 75 -> 67% | 87 -> 92% |
| stage 3 | 72 -> 48% | 72 -> 63% |
| stage 4 | 52 -> 53% | 67 -> 77% |
| stage 5 | 45 -> 32% | 62 -> 47% (58% in a run before the last stage 4 tweak) |

- Careful play is about where it was at the boss's level (within the noise, -4 to +11 in `bossgrid`); a level under the boss it lost a
  few points. Auto lost more at stages 3 and 5: it does not read telegraphs (auto is locked on the first try of every boss anyway).
- `gim 10` (careful, at the boss level): every gimmick telegraphs 1 to 4 times and lands 1 to 4 times a fight; the readied moves (sac) are
  stopped 1 to 2 times a fight; the direct gimmick damage (slot, rod, dive) is 3 to 10% of the party's total HP per fight.

## 3. Taming payoff (comp3.js, `TAME`)
- A companion counts the battles won while its hero is anywhere in the six (`o.bt`, optional; old companions start at 0). Not in the Trial.
- At `TAME.skillAt` (12) it learns a second skill by family, in its own element: Feral Rush (beast), Gale Sweep (flyer), Spirit Flare
  (spirit), Shell Bash (shell), Engulf (ooze), Dread Roar (lesser Scourge). The summoned companion uses it.
- At `TAME.evoAt` (30) it evolves: the species gets a family title (Alpha, Sky, Elder, Iron, Grand, Dread: "Grand Mossling"), its hero's
  bonus +3% (`compBonus`), and a recoloured sprite: `ev_<art>` registered in MART with the realm variants' palette repaint toward the
  family colour (`recol`, k .45), so no new art; BIG_ART is extended for 60 px arts. The summoned unit uses it (TPL art, set on load too).
- A toast at each milestone. Progress ("Bond 1 · 14 battles won together · Knows Engulf. Evolves into Grand Mossling after 16 more
  battles" and a bar) on the Companions menu and the hero sheet (`compBonusText`), and a "Your companions" list at the top of the
  Taming log.

## 4. Depth unlocks by realm (pacing.js, `PACE`)
- `pcUnlocked(system)` is the one test; systems: elements, combat, taming (realm 1), reactions, gear, bonds (realm 2), camp, guilds
  (realm 3), echoforge, arenaGold, ngplus (realm 4). `pcRealm()` is the realm reached (max of the stage and the beacons lit),
  `pcLockText(system)` gives "opens in the third realm". For the onboarding / What next? helper: ask `pcUnlocked('reactions')` (etc.)
  before showing a system's tip card; `window.__P95` exposes them for tests.
- Gated only on journeys started on v0.9.5 (`newGame` sets `G.pcV=1`; a New Game+ cycle does not). A journey from before keeps every system
  (and the v0.7.2 gates still apply to it); the Daily Trial has everything. Nothing is ever removed.
- Realm 1: a primer skill is a plain hit (no mark, so no reactions; one log line says when reactions awaken). Bonds do not grow and the
  Bonds page says when they open; the hero sheet hides the bond rows.
- Realm 2: reactions and bonds; Tempering keeps its v0.7.2 rule (after the first Scourge).
- Realm 3: guild missions (were: after the first Scourge; old journeys keep that) and camp (`CAMP.fromStage` 2, unchanged).
- Realm 4: the Echoforge tab (or once the journey is won); the Golden Coliseum already needs three Scourges (`ARENA.min` 3);
  the New Game+ teaser is in the realm 4 notice.
- One toast per realm the first time you enter one of its towns: "New in this realm: ..." (`G.pcN`).

## Tests (tools/chrome, `PWHTML=../../out/aurelis3.html`)
- `v095p1.js`: random battles per step against the configured rate and v0.8.2; field and dungeon roamers in every realm of a journey,
  with the realm's roles, on open ground away from exits; all sixteen realm pools covered; a field roamer touched on patrol starts a
  roamer battle with a surprise round and the ENC reward; a boss fight is not rewarded by ENC.
- `v095p2.js`: all 16 gimmicks: named at the start, nothing on turn 1, telegraph on turn 2 (log, chip, marks), the i panel row, the
  landing and its effect (and the dive, the magic cut); Guard halves a marked hit and blocks its status; the rod grounds after a free
  swap; damage bursts the egg sac; Water cools the Sentinel; Scan reveals the Lich; no RNG in a telegraph and the same spots every time;
  none in the Daily Trial; the chips on the screen; auto battle against a gimmick boss.
- `v095p3.js`: companion milestones (12 and 30 battles), the second skill in the summon, the evolved name, sprite and bonus, progress text
  on the menu, sheet and Taming log, the save round trip and an old companion; realm gates for a new journey (systems per realm,
  primers, bonds, guild missions, the Echoforge, the notice), an old journey, NG+ and the Trial keep everything.
- Updated on purpose: `v072a.js` and `v063g.js` now say their journey is from before v0.9.5 (`delete G.pcV`), since a new journey opens guild
  missions in realm 3 and bonds in realm 2. `v080ca.js` waits for Continue (it waits for the save sync since v0.8.5; the test failed on
  v0.9.4 as well).

All pass (each run alone, PWHTML = this build): v095p1, v095p2, v095p3, v070m1, v070m2, v080ca, v080cb, v063g, v080r, v041p1c, v071wa,
v071wt, v063wa, v041p6, liveupdate, v072a, v050p2daily (OLDHTML = the v0.9.4 build: same start).

## Limits
- The time model is an estimate: the site minutes, the roamer walk and the share of roamers and sites a first run takes are guesses
  (no playtest timings in docs).
- The journey sim's party is the careful player; a party with no healer can still grind one boss for a long time (as before).
- Gimmick targets are deterministic and readable, so a player can plan around them; that is the point, but it also makes them learnable.
