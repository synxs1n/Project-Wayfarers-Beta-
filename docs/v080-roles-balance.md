# v0.8.2 class roles and pacing (worktree report)

Two owner requests: every class gets a primary role and one or two secondary roles, delivered by skills and gear (secondary output
about 55 to 75% of a dedicated class), and the journey is tuned so the game is beaten near level 40 in 4.5 to 6 hours.
GAME_VERSION and the changelog are not touched (the lead merges those). Save keys are unchanged; there are no new save fields.

## 1. Roles

Code: `v3/roles.js` (new, built right after `sigskills.js`), tunables and the skill table in the `ROLES` block of `v3/config.js`
(section 5). The role weapons are new families in `v3/items.js` (names, stats, perks, recipes), their delivery in `v3/archetype.js`
and their icons in `v3/icons.js`; the role charm icons are in `v3/icons2.js`.

Roles: tank, physical damage, magic damage, ranged (Ranged delivery, which catches flyers), healer, support (buffs), debuffer.
Every class also primes and detonates (skills.js ROLE_FILL), so primer/detonator stays a shared tag, not a secondary.

| class | primary | secondary | new skills (level) | role gear |
|---|---|---|---|---|
| Warrior | Physical damage | Tank 57%, Debuffer 60% | Sunder (11, Break), Intimidating Shout (16, Weaken all), Iron Stance (20, Taunt + Regen) | Warhammer (debuffs +25% chance, +1 turn), Warden's Badge |
| Knight | Tank | Support 66% | Shield Ally (13, Bulwark + Regen), Raise the Banner (19, Haste all) | War standard (buffs +1 turn, Piercing), Herald's Horn |
| Archer | Ranged | Debuffer 58% | Crippling Shot (15, Weaken + Slow), Flare Arrow (18, Blind all) | Hexer's Eye, Kunai Pouch (+10% Ranged) |
| Thief | Debuffer | Ranged 63% | Throwing Stars (4, Ranged x2), Hamstring (12), Kunai Volley (16, Ranged all), Toxic Cloud (18), Fuma Shuriken (24, Ranged, pierce) | Throwing stars / kunai (basic attacks are Ranged), Kunai Pouch |
| Monk | Physical damage | Healer 61%, Support 62% | Chi Mend (7), Harmony Meditation (14, Focus all + 10% heal), Lotus Circle (21, heal all) | Prayer beads (+15% healing, buffs +1 turn), Mender's Locket |
| Mage | Magic damage | Debuffer 72% | Time Snare (16, Slow + Weaken all) | Wand (debuffs +30% chance, +1 turn), Hexer's Eye |
| Healer | Healer | Support 69% | Blessing (10, Might + Regen), Holy Aegis (17, Bulwark all) | Censer (buffs +1 turn, +5% healing), Herald's Horn |
| Bard | Support | Magic damage 66%, Healer 57% | Aria (5), Healing Ballad (8), Anthem of Valor (14, Might + Haste all), Restoring Chorus (18, heal all + Regen), Storm Song (26); Tunes pw .9 -> 1.0 | Lyre (+10% spell damage), Spellstring Charm, Mender's Locket |
| Steppe Sniper (legend) | Ranged | Debuffer 72% | Hobbling Bolt (14), Flash Bolt (20, Blind + Slow all) | |
| Druid (legend) | Ranged | Healer 59%, Debuffer 64% | Tangleroot (12), Healing Sap (7, chi); Wild Mend uses chi, pw .9 -> 1.15; his arrows are Ranged | |
| Archmage (legend) | Magic damage | Support 66% | Frost Mail (18, Bulwark all + 10% heal) | |
| Chronicler | Magic damage | Debuffer 60%, Healer 63% | Corrected Draft (18, heal all); Annotate and Redact a little stronger | |

Shares are at level 30 (tier 3 gear); at level 40 (tier 5) they are within 2 points, except Bard magic 71% and Druid healer 63%.
All secondary shares land between 57 and 72%. Primaries: the dedicated classes are 100% by definition; Monk physical 97%,
Druid ranged 80%, Sniper ranged 117%, Archmage magic 108%, Chronicler magic 145% (the legends and the Chronicler were already strong).

How a share is measured (`roleOut`, `roleTable`):
- Each class is measured as a plain template (no signature skill, no hero quirk, nature Keen, points spent by the class preference,
  the class's standard weapon and armor of the same tier, element from `ROLES.ref`), so every class is on equal level and gear.
- Damage roles: `calcDamage` on a dummy at the same level (Ranged: a flying dummy, so the x1.4 Ranged bonus counts), with the
  element stripped and the RNG fixed at the middle (no crits). Per move: damage x hits, x2 for an all-foes move, / the move's time cost.
  Physical damage leaves out Ranged moves (they are the ranged role).
- Healer: power x healing power (chi heals: the better of healing power and chiK x attack) x (1 + healing bonus), x2 for the whole Vanguard, / time.
- Support: status weights (`ROLES.w.buff`) x turns (+ buffT from gear) x targets (x2 for the Vanguard, x0.6 for self only), / time.
- Debuffer: chance (with gear multipliers, at most 1) x weight (`ROLES.w.debuff`) x turns (+ debT), x2 for all foes, / time.
- A role's value is the sum of the hero's best two moves for it (`ROLES.w.top`); tank is effective HP against a standard hit, x0.55
  without a taunt, /0.7 with a Bulwark of its own. The share is that value over the dedicated class's (`ROLES.ded`).

Mechanics:
- The new skills are appended to the class lists at fixed levels after the respacer, so no older skill changes level. Old saves
  learn every new skill at or below their level on load (`skillKnown` reads the level) and the "learned" notice announces them.
- Chi heals (`chi:1`: Chi Mend, Lotus Circle, Healing Sap, Wild Mend) use max(healing power, ROLES.w.chiK x attack), so a Monk
  or Druid heals from body strength. A `perform` wrapper swaps the healing power for that one action.
- Role charms (stall from the second realm, tier 2): Mender's Locket (+12% healing), Spellstring Charm (+8% spell damage),
  Kunai Pouch (+10% Ranged damage), Herald's Horn (buffs +1 turn), Hexer's Eye (debuffs +20% chance, +1 turn), Warden's Badge
  (15% less damage while Taunting). Charm perks join the weapon perks in `calcStats` (never in the Daily Trial).
- Each new skill's text ends with its role ("Healer role."). The class card on the hero sheet and in the Codex has a "Role ... · Also ..." line.
- Archetypes: thrown weapons deliver Ranged (`WT_DL.thrown`), so a thief's basic attack catches a flying foe for x1.4 (a dagger
  is Piercing, x1.1); Throwing Stars, Kunai Volley and Fuma Shuriken are Ranged; the Druid's arrows are Ranged; the War standard is Piercing.

### For the lead: party scoring
`heroRoleSet(c)` (roles.js; `progression.js` already owns the name `heroRoles(id,lv)`, so it is not reused) returns
`{cls, primary, secondary:[...], has:{role:true|false}, out:{role:share}}`. `has[r]` is true for the primary, and for a secondary
once the hero knows a skill tagged for it (`s.rl===r`) or its share already reaches the band. `out[r]` is the hero's share against a
dedicated class hero of the same level and weapon tier (cached per hero, level, weapon and charm). p6Role could read:
tank = primary tank or has.tank; heal = primary healer, else has.healer as a half healer (out.healer about .6);
sup = primary buffer or has.buffer; dmg = primary phys/magic/ranged. `ROLES.names` has display names.

## 2. Pacing

### The sim
`tools/fullsim.js journey` changed so it plays like a first run (all optional: NOGEAR=1, ALLAUTO=1, EXPLORE=1 restore the old sim):
- The party buys the realm's tier of weapon, armor and cape in each new town. Before this, the journey party kept its starting
  gear all game, which is what made the old sim need up to 40 tries and 200 extra fights on a boss.
- 40% of ordinary fights and every boss are played by hand, so they pay full XP; the rest pay AUTO_REW (before, every sim win
  counted as an auto win, because the sim drives the battle through auto).
- The party explores 1.5x the required route (EXPLORE), with the encounters on those steps.
- New: a time model (`TIME` at the top of fullsim.js), a SUMMARY line (mean, sd, range, fights, boss tries, hours),
  CFGSET='OBJ.key=value;...' to try config values, and `bossgrid [N]` (every boss at each stage, journey party sizes, boss level -2/0/+2).

Time model (seconds): a fight is fightIn 4 + fightOut 7 + every action on screen x 1.35 (0.9 with auto at 1.5x) + every hero
turn x 2.6 for the choice (0 with auto); a boss adds 25 and is always by hand; a typical player autos 60% of ordinary fights.
Walking: steps x 1.4 at 4.2 tiles/s. Per realm: town 10 min, story 5 min, side content 8 min; 1 min to walk back after a lost
boss; 5 min for the start. Calibration: PAUSE 750 ms per battle step (engine.js), the v0.4.0 hours10 model (4.2 tiles/s,
45 s per fight) and the v0.4.0 note of about 31 minutes per realm on the required path. There is no playtest timing in docs, so
the town, story and side minutes are estimates.

### Numbers (`SEED=n node tools/fullsim.js journey 16`)

| build and sim | top level mean (sd, range) | fights | boss tries per journey (most on one boss) | hours typical / all by hand |
|---|---|---|---|---|
| v0.8.1, old sim (SEED 1) | 42.5 (3.3, 38-48) | 372 (238-532) | 59.1 (40) | (old sim had no time model) |
| v0.8.1, new sim SEED 1 | 38.2 (1.9, 35-44) | 194 | 16.3 (32) | 4.62 / 5.30 |
| v0.8.1, new sim SEED 2 | 39.3 (2.0, 36-43) | 205 | 18.4 (25) | 4.81 / 5.50 |
| v0.8.2 SEED 1 | 40.1 (1.7, 39-46) | 207 (182-332) | 12.9 (15) | 4.62 / 5.36 |
| v0.8.2 SEED 2 | 40.0 (1.7, 37-44) | 208 (173-288) | 13.1 (23) | 4.61 / 5.36 |
| v0.8.2 SEED 3 | 40.3 (2.1, 38-46) | 212 (173-283) | 13.9 (20) | 4.67 / 5.41 |

Estimated play time for a typical first playthrough: about 4.6 hours (3.7 to 6.8 across runs), 5.4 hours if every fight is
played by hand, 4.1 hours with every ordinary fight on auto. The run that ends at 46 is a party with no healer and no tank
(Mage, two Monks, two Thieves, Warrior) that grinds two bosses.

What changed (config.js unless noted):
- ENC_RATE {low .05 -> .07, normal .095 -> .13, high .14 -> .18}, ENC_MIN_STEPS 8 -> 7: about 30% more fights on the same walk.
- ECON.xp .85 -> .87.
- BOSS_BUFF hp [1.3, 1.75, 1.8] -> [1.15, 1.65, 1.7] and pow [1.15, 1.4, 1.44] -> [1.05, 1.34, 1.38] for the first three Scourges
  (the fourth and the Calamity are unchanged).
- foes.js: the Frost Lich (mag 1.4 -> 1.25, ward every 3 -> 4 turns), Stormcaller Ysolde (mag 1.35 -> 1.25, spd 1.15 -> 1.08),
  the Iron Sentinel (def 1.45 -> 1.35) and the Siren (mag 1.35 -> 1.28). In `bossgrid` they won 0 to 40% where the other Scourges
  won 50 to 90%; now 40 to 70% at the boss's level.
- Kept: XPCU (catch up), XP_REAR=1 (Rearguard full XP), pacing.js gates, BOSS_LV, the Cataclysm (B4.roles.boss). With gear bought
  per realm the Cataclysm was not the wall: B4.roles.boss.pw 3 -> 2 moved the old sim by about one level and left the walls.

Auto vs careful (`SEED=1 node tools/fullsim.js b4 60`, win rates, before -> after): bosses, auto 72/63/42/43/37% -> 97/78/57/52/42%,
careful 95/88/70/65/55% -> 95/88/82/70/65%. Field fights stay 100% won; late field fights take a little longer (careful 5.6 -> 7.3
party actions at stage 5) because the new support and debuff moves get used.
Stage 1 (`stage1 300`, party of 3 at level 3): identical before and after (careful 95% won, 13% HP lost; auto 92%, 15%; roamers 100%).

## 3. Daily Trial
The Trial's heroes are level 26, so they know the new skills (all but the Bard's Storm Song) and the Bard's Tunes hit a little
harder; the Trial's foes include the eased Scourges. So the Trial's battles play out differently from v0.8.1 once a hero uses a new skill. Its start is identical:
`v050p2daily.js` (OLDHTML = the v0.8.1 build) passes (same seed, weather, heroes, stats, foes, turn order, backdrop). Nothing new reads the clock or calls Math.random: the skill lists are built from fixed tables, `roleOut`
fixes RNG only while measuring and restores it, the charm perks are off in the Trial, and the encounter and XP changes do not apply
to it (ECON is exempt there). `v063wa.js` (twists and determinism) passes.

## Tests (tools/chrome, PWHTML=../../out/aurelis3.html)
- `v080ca.js`: an old v0.8.1 save (made by the v0.8.1 build, OLDHTML or `git show 927e63e:index.html`) loads and its Lv 30 Monk,
  Bard and Thief know their new skills, with the "learned" notice; every class has a primary and 1 to 2 secondaries; every
  secondary is 55 to 75% at Lv 30 and Lv 40 and every primary at least 80%; every secondary has a tagged class skill; role weapon
  families (6 tiers, perk, name, delivery), role charms in the stall and their perks; a thief's thrown Attack is Ranged and hits a
  flyer x1.4 (dagger: Piercing), its Ranged skills too; Chi Mend heals by chi power in battle; the 48 new gear icons are unique;
  heroRoleSet and the class card line.
- `v080cb.js`: runs `fullsim.js journey 16` (SEED 1): mean ending level 39 to 41, sd at most 2.5, at most 25 tries on one boss and
  16 per journey, a typical first run 4.5 to 6 hours.
- Helper (not a test): `rlmeasure.js` prints the role table at LVS=20,30,40.
- Run one at a time, all ALL PASS on this branch: v080ca, v080cb, v063pa, v063pb, v070m1, v070ia, v070ic, v063s (430 icons, all distinct),
  v061a, v041p6, v050p3a, v050p3b, v063wa, liveupdate, v081a, v050p2daily (OLDHTML = v0.8.1).
