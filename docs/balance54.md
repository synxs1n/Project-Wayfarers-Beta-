# Balance pass, 0.22.54

What changed, why, and how to measure it again. Every number is in `v3/config.js` or `v3/foes.js`; nothing here moved a skill's learn level or a kit.

## The rules this pass sets

1. **Realm ramp.** A careful party at the expected level and size wins a little less each realm, and a won boss fight takes a few more hero turns each realm.
   Aim: about 66 / 63 / 60 / 57 / 53% and about 28 / 31 / 35 / 39 / 43 turns for realms 1 to 4 and the Calamity.
2. **Boss band.** Inside a realm every Scourge sits within about 10 points of the realm's mean. A boss outside it for two seeds at 50+ fights is tuned,
   the easy ones as well as the hard ones.
3. **Class order.** Mages and Archers deal the most damage. The Warrior is the third damage dealer and the sturdy front line. The Monk does a bit of
   everything and is best at nothing. Thieves hit lightly but act most often and bring the debuffs and the Breaks. Knights, Bards and Priests are judged on
   what they add, not on damage.
4. **Sub roles.** A sub role skill is weaker by its own numbers only (lower base power, and the hero's stats follow the main role). No percent cut on top.
   Skills outside a class's three roles stay at 50%.
5. Learn levels are fixed. Main role skills are the strongest.

## Tools (all in `tools/`, run from the repo root)

| Command | What it answers |
|---|---|
| `SEED=7 node tools/fullsim.js gim 50` | win rate of every boss in every realm, careful and auto |
| `SEED=7 node tools/fullsim.js out 30` | the same parties, with how fights go: turns in wins and losses, damage taken, the first KO, boss HP left at a wipe. `BOSSES=`, `BG_STAGES=`, `GIM_AUTO=0`, `CFGSET='BOSS_BUFF.pow=[...]'` try numbers without editing |
| `node tools/fullsim.js eff 10` | battle effectiveness per class: direct damage, damage over time, damage enabled (Break, Might, Haste), healing, buffs, debuffs, damage soaked, KOs, actions, shield pips and Breaks |
| `CLS=warrior,mage node tools/fullsim.js cls 10` | win value of a class: the same party with and without one hero of it (paired). About 3 points of noise at 680 pairs |
| `node tools/fullsim.js diag 6` | a shorter per class table (damage per action, actions, stats); `DCLS=warrior` lists the skills used |
| `node tools/roleaudit.js [out.json]` | sub role skills against main role skills of the same kind; the JSON proves a change moved no kit and no learn level |
| `SEED=1 node tools/fullsim.js journey 16`, `boss 6` | pacing (level 38 to 42, at most 16 boss tries a journey and 25 on one boss) and party sizes |

## Bosses

`BOSS_BUFF` pow `[.955,1.28,1.32,1.535,1.23]` -> `[.88,1.14,1.38,1.87,1.22]`, hp `[.8,1.34,1.39,1.53,1.22]` -> `[1.2,1.55,1.6,2.05,1.78]`.

Before (0.22.53, 180 fights a cell): careful 64 / 48 / 59 / 71 / 60%. Losses were wipes by hero turn 20 with the boss at 45 to 70% HP and the first KO near turn 7.
The spread inside a realm was 25% (Frost Lich) to 73% (Bone Colossus).

After (two seeds, 100 fights a cell, one step before the last nudge to realms 2, 4 and 5): careful 66 / 60 / 60 / 61 / 60%, turns in a win 29 / 32 / 35 / 40 / 44,
every Scourge between 42 and 79%. The last nudge (30 fights a cell) gave 64 / 65 / 59 / 58 / 61; the Calamity power went up once more after it (1.2 -> 1.22),
which earlier trials put near 50%. Auto: 40 / 35 / 46 / 47 / 47% (was 39 / 27 / 47 / 58 / 50).

Per boss (old value in the comment above `FINALS` in `foes.js`): eased Frost Lich, Siren, Drake, Ysolde, Ashen Wyvern, Iron Sentinel, Seraph; raised Bone Colossus,
Cinderking, Crow Regent, Thornwarden, Geyser Matron, Queen Mantis, Candlemoth.

Gimmicks (`BOSS_GIM`): marked hits raised (slot .14/.17/.12 -> .24/.28/.2, rod .2 -> .28, dive .16 -> .22); `answer.pips` 2: a stopped readied move, a marked hit
every marked hero guarded, or a grounded or guarded rod knocks two pips off the boss's shield (`b4GimAnswered`). Tide `dmg` .08 -> .05 and `spd` .05 -> .04 (the
Drake's own Water skills rode it), veil `cut` .5 -> .4, wing `cut` .35 -> .25, Reassemble heal .12 -> .15 and both `thr` .07 -> .1.

Other battle rules:
- `STUN_CAP`: a hero who has just lost a turn to a stun or a freeze cannot be stunned again until after their next turn.
- `TAUNT.cut` .3: a hero under Taunt takes 30% less damage.
- `AUTO_NERF.guardMark`: auto guards a hero the gimmick has marked (`b4GimAutoGuard`).
- `BOSS_SIZE.expect` / `short`: the benchmark party is 3, 4, 5, 6, 6 by realm. A shorter party eases the boss by 8% HP and 5% power a hero; before, every hero
  short of six made it stronger. Party of 3 at level 40: Scourge 4 47 -> 76%, Calamity 13 -> 42%.

Pacing after (journey 16, SEED 1, before the last class and ramp nudges): top level 40.3 (sd .7), 8.3 boss tries a journey, 10 the most on one boss, 4.18 hours.

## Classes

Gear, not the class growth table, carries most of a hero's stats (a 19% change to Warrior attack growth moved damage 2%), so the class pass is a
multiplier on the final stats: `CLS_TUNE` in `config.js`, applied in `calcStats` (not in the Daily Trial).

`CLS_TUNE={warrior:{atk:1.1,hp:1.15,res:1.3,spd:1.15},knight:{atk:1.1,spd:1.1},archer:{atk:1.34},monk:{atk:.82}}`

`eff 10` (realms 2 to 4, per hero per fight), before -> after:

| class | total damage | direct | healing | debuffs | soak | actions |
|---|---|---|---|---|---|---|
| Mage | 1,921 -> 1,708 | 1,751 -> 1,550 | 33 -> 29 | 1.8 -> 1.3 | 73% -> 73% | 4.8 -> 4.2 |
| Archer | 1,406 -> 1,695 | 1,307 -> 1,608 | 29 -> 23 | 1.6 -> 1.4 | 91% -> 84% | 5.9 -> 5.2 |
| Bard | 1,538 -> 1,409 | 1,034 -> 1,034 | 238 -> 204 | 1.3 -> 1.4 | 91% -> 88% | 6.1 -> 5.3 |
| Warrior | 1,691 -> 1,393 | 1,571 -> 1,298 | 38 -> 40 | 1.7 -> 1.4 | 121% -> 120% | 5.8 -> 5.2 |
| Monk | 1,884 -> 1,343 | 1,715 -> 1,214 | 273 -> 225 | 2.1 -> 1.9 | 108% -> 113% | 7.5 -> 7.4 |
| Thief | 1,502 -> 1,338 | 1,316 -> 1,164 | 29 -> 22 | 3.4 -> 3.1 | 87% -> 90% | 9.6 -> 8.5 |
| Priest | 1,138 -> 1,023 | 1,003 -> 905 | 367 -> 305 | 0.8 -> 0.6 | 99% -> 97% | 6.7 -> 5.5 |
| Knight | 968 -> 971 | 759 -> 759 | 118 -> 95 | 1.4 -> 1.3 | 126% -> 133% | 6.1 -> 5.5 |

"Before" in this table is the first run of `eff`, taken after the first class and boss changes (the sim did not exist on 0.22.53). On 0.22.53 itself `diag`
gave damage per action x actions: Mage 382 x 4.4, Warrior 229 x 3.9, Monk 208 x 5.9, Archer 199 x 5.0, Thief 107 x 8.8, Knight 89 x 4.7.
Total = direct + damage over time + the Break, Might and Haste share of what others dealt (a Bard's 308 of 1,409 is that share). The Thief causes about twice
the Breaks of any other class (0.47 a fight).

Win value (`cls 10`, points of win rate for one hero of the class in place of an average one), 0.22.53 -> the last full run (before the final Warrior, Archer
and Mage numbers): Priest +10.3 -> +8.1, Archer +2.5 -> +3.4, Monk +2.6 -> +0.9, Knight -3.2 -> -0.3, Mage -1.3 -> -1.5, Bard +3.5 -> -1.9, Thief -1.8 -> -2.2,
Warrior -7.9 -> -8.1.

### Open
- **Warrior win value.** Its damage, resistance, speed and HP are fixed and it is still the least valuable seat (-4 to -8 across runs). Ruled out as the main
  cause: stats, Taunt (`NOTAUNT=1`), War Cry (`NOSK=cry`), Breaks. Not yet tried: seat position, and the sim brain's skill choices for a Warrior.
- **Priest win value.** About +8: a party with no Priest loses clearly more often. Left alone in this pass.
- Summoner as a lead role and a second tank class need new skills, not numbers.

## Roles
- `ROLEPW.secondary` .8 -> 1, `natCap` .9 -> 1, `natLift` .14 -> .05 (it now only lifts an off role skill, .5 -> .55).
- `ROLEPW.own`: skills that count as the class's main role whatever their delivery says. Piercing Shot (a bow shot that counted as a Striker sub role skill and
  still out-hit every Marksman shot) is the Archer's own at power 2.4. Setting `rl` on the skill instead reshuffled the 12 skill kit and moved learn levels,
  which is why it is done in `sk12Mult`.
- `roleaudit.js` after: the best sub role skill of each kind lands at 23 to 58% of the main role median; no sub role hero beats the best main role hero.
- `CLS_ATK`: Archmage, Chronicler and Blood Summoner attack with magic like the Mage, Priest and Bard.

## Skill text
111 skills renamed and 249 descriptions rewritten (text only; a dump of 1,488 skills before and after differs in nothing but name and description).
The generators that produced the wrong text were fixed: `sigFlavour` (a class flavour skill named by an element it does not have), `s36Regen` (broken
sentences where Regen was stripped), `k12Fx` (physical pierce said "resistance"), `r25Skill` (relic text). Left on purpose: Priest "Light Halo" beside
"Halo of Light" and "Light Smite" beside "Smite" (pinned by test `v173a`).

## Tests
`v137a` and `v095p2` follow the new rules. `v080ca` fails the same eight checks on 0.22.53 (stale: it pins the v0.8.2 55 to 75% band).
