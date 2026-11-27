# Balance pass 2, 0.22.57: gear, class value, bosses tuned with items

Follows `balance54.md` (same tools). Numbers are in `v3/config.js`, `v3/items.js`, `v3/data.js` (class tables), `v3/foes.js`.

## Rules (the owner's)
1. Boss win rate for a careful party at the expected level, in the realm's shop gear, **using its items**, steps down 3 to 5 points a realm: about
   66 / 62 / 58 / 54 / 50%. Hero turns in a won fight step up a little each realm.
2. No boss above 70% unless the party is over-levelled, has the realm's best gear fully tempered, or is built against that boss.
3. Every class within about 3 points of zero win value (`fullsim.js cls`), with and without items.
4. Mage and Archer deal the most damage, the Warrior is third and holds the line, the Monk does a bit of everything.

## Item use in the sims
`ITEMS=1 node tools/fullsim.js <any sim>`: the party carries a bag sized for the realm (`SIM_BAG` in the harness; `ITEMBAG='potion:4,plume:1'` overrides) and
the careful player uses it by the game's own auto rules (`auto39.js a39Pick`). Run a sim with and without to see what items are worth.

Before this pass's boss retune, items moved the realm means from 64 / 66 / 61 / 58 / 49% to 68 / 67 / 71 / 73 / 77%: little early, a lot late (revive items).

## Gear (`items.js`, `GEAR_LV`)
- `WP` [6,14,25,39,57,80] -> [8,14,20,27,35,45], `AP` [5,11,18,27,38,52] -> [6,11,16,22,29,37]. What the steep tiers added now comes with level: `GEAR_LV`
  (`calcStats`, `gearLvAt`, `gearLvShape`) adds old minus new at each realm's usual level (8, 16, 24, 32, 40), in the shape of the class's own weapon and
  armor family. Heroes at the benchmarks are within 3% of before; Mythic at level 40 is 7 to 10% weaker.
- `FORGE_STEP` .11 -> .07 (a +3 piece stays under the next rarity; test `v188a`).
- Mail: no speed penalty, resistance .4 -> `ARM_MAIL_RES` .55 of its defense. Shields: resistance [2,4,7,11,15,21] -> [4,8,13,19,27,37].
- `WPERK`: sword `guardCut` .65 (Guard blocks 65%), dagger `exploit` .15 (+15% to a foe with an ailment).
- Correction to `balance54.md`: gear is about 30% of a hero's attack or magic and about 60% of defense and resistance, not "most of the stats".
  The class tables do move damage; the first test of them was too small to show it.

## Classes
- `CLS_TUNE` is gone. Its values live in the `CLS` tables (old values in the comment above `CLS`).
- Priest: the lead (+8 to +10 points) was the Limit Break, not the heals. A Priest with every healing skill removed was still worth +11; with only the
  mass revive removed (`CFGSET='LIMIT.healer.revive=0'`) +2.6. Benediction no longer revives (it leaves Regen); Seraph's Grace revives one hero at 50%
  (`reviveN`). Mend, Mend All, Full Mend, Raise and Smite are at their old numbers. `REGEN.hero` .08 -> .07.
- Warrior: with War Cry, Intimidating Shout and Iron Stance removed it gained 3 points, so those cost more than they gave: War Cry and Iron Stance
  are half a turn (`cost:.5`), the Shout .7. Plus the mail, shield and sword changes above.
- Monk: Chi Mend 1.6 -> 1.85, Harmony Meditation heal .2 -> .23. Thief: atk growth 1.9 -> 2.15. `DOT_BOSS.poison` .02 -> .03.

Win value, 680 paired fights a class (about 3 points of noise), 0.22.53 -> before the last boss retune:

| class | 0.22.53 | no items | with items |
|---|---|---|---|
| Knight | -3.2 | +2.9 | +2.9 |
| Monk | +2.6 | +1.2 | +0.6 |
| Priest | +10.3 | +1.0 | -1.6 |
| Mage | -1.3 | +0.4 | -2.6 |
| Archer | +2.5 | +0.3 | +2.4 |
| Bard | +3.5 | -0.3 | +3.2 |
| Thief | -1.8 | -0.4 | -0.3 |
| Warrior | -7.9 | -2.6 | -2.8 |

A later, smaller run with items (408 pairs, about 4 points of noise) gave Priest -5.4, Thief +5.1, Knight +4.2, Warrior -3.7: with items a Priest is
worth less than an average hero. `REGEN.hero` went back up from .06 to .07 after it. Worth one more reading at full size.

`eff 10` (total damage per hero per fight): Mage 1,748, Archer 1,584, Warrior 1,530, Thief 1,493, Monk 1,295, Bard 1,289, Knight 1,068, Priest 984.

## Bosses
`BOSS_BUFF` hp [1.28,1.6,1.65,2.0,1.8], pow [.9,1.185,1.57,2.8,1.9] (was hp [1.2,1.55,1.6,2.05,1.78], pow [.88,1.14,1.38,1.87,1.22]).

`BOSS_FIT` (new): power of one Scourge in one realm, or of one Calamity. A boss could be easy in one realm and hard in another (Ashen Wyvern 85% in
realm 1, 43% in realm 4). Computed from `gim 60` with items on two seeds: 1 + (win rate - target) / 110, within .85 to 1.18, where a cell was 5 or more off.

Verification before `BOSS_FIT` (with items, two seeds, 120 fights a cell): 67 / 63 / 60 / 55 / 55%, ten cells above 70%. Without items: 62 / 63 / 51 / 41 / 36.
Auto with items: 34 / 32 / 49 / 41 / 46. Two levels over, with items: 74 / 76 / 69 / 60 / 56.
After `BOSS_FIT` (with items, 30 fights a cell, one seed): 63 / 62 / 55 / 55 / 46, turns in a win 29 / 32 / 36 / 40 / 45. Realms 1, 3 and 5 were nudged up
once more after that (pow .92 -> .9, 1.6 -> 1.57, 1.94 -> 1.9). **Not yet re-measured at full size with `BOSS_FIT`**: run `SEED=7 ITEMS=1 GIM_AUTO=0 node tools/fullsim.js gim 60`
on two seeds and recompute `BOSS_FIT` from it if cells are still outside.

Journey with items (16 runs, before `BOSS_FIT`): level 40.2, 7.4 boss tries a journey, 4.09 hours. Without items (before the with-items retune): 41.2, 10.8 tries, 14 on one boss.

## Known costs
- Tuning to item use pushed realm 4 power from 2.04 to 2.8 and the Calamity from 1.42 to 1.9. Losses there start early (first KO near hero turn 5), and a
  party that brings no items wins about 41% and 36% of those fights.
- The first realm's field fights are 99% wins with about 1% HP lost. That is the same on 0.22.56 (before the gear change).

## 0.22.58: the full size check, and the skill pass

Full size check of 0.22.57 with items (two seeds, 120 fights a cell): 69 / 62 / 61 / 58 / 51%. Every boss between 44 and 74%; five cells above 70, all in the
first realm (71 to 74). `BOSS_BUFF.pow` then went to [.925,1.12,1.57,2.9,1.95] (the second realm came down because the skill pass below weakened
early parties: a 30 fight check gave 65 / 55 / 55 / 53 / 61 before that last step). Bone Colossus realm 3 and 4 and Candlemoth realm 3 got a `BOSS_FIT` step.
**The last step is not measured at full size.**

Skills (`tools`: the scratch duplicate finder compares, inside one hero's kit, kind, target, elements, statuses, heal, hits and special flags):
- 54 of 88 heroes had sets of skills that differed only in power. Each capstone has its own effect now: Titan Blow and the Mage's great spell `shieldChip:1`,
  Judgement `self` Bulwark, Dragon Fist `drain` .25, Grand Finale Weaken .6, Verdict Blind .6, Full Mend `cleanse`, Rune Weaken .5; `SIG_EXTRA` for the two
  signature skills that copied a class skill. A primer and a detonator of one element are not counted as copies.
- The effects were chosen so they do not match any hero's signature skill of that class (Bulwark on Full Mend, Stun on Dragon Fist and Break on Rune did).
- Giving Assassinate `execute` reshuffled the Thief's 12 skill kit and moved learn levels, so it was taken back out. Check any new skill flag with a kit dump.
- Power: Burst Arrow 1.6 -> 1.9, Archer element arrows 1.6 -> 1.45, Rune 1.3 -> 1.6 (mp 9 -> 8), Judgement 3 -> 2.7, Knight Lance 1.75 -> 1.6, Aria 2.1 -> 1.7,
  Death Lotus .72 -> .58 a hit, Ascension Fist .95 -> .88 a hit, Heavenpiercer 4.4 -> 4.2, Dragon Fist 3.1 -> 2.9. Mage magic growth 2.55 -> 2.7.
- `eff` with items after: Archer 1,687, Mage 1,590 (before the growth fix), Warrior 1,575, Monk 1,401, Bard 1,335, Thief 1,332, Knight 892, Priest 834.

## 0.22.59: class values after the skill pass
0.22.58 at full size with items: bosses 64 / 63 / 59 / 52 / 52% (one cell at 71), but classes out: Monk -6.1, Thief +4.6, Knight +3.9, Warrior -3.7 (544 pairs).
Changes: Dragon Fist 2.9 -> 3.1, Monk atk growth 1.75 -> 1.9; dagger `exploit` .15 -> .1; Knight atk growth 2.5 -> 2.3 (the owner: Taunt is not to be cut);
Warrior atk growth 2.85 -> 2.95; then Aria 1.7 -> 1.9, Bard mag growth 2 -> 2.12, Archer arrows 1.45 -> 1.5 and atk growth 3.36 -> 3.5.
`cls 20` with items (1,360 pairs, about 2.2 points of noise): Knight +2.4 / +3.2 (two runs), Monk -1.7 / +2.1, Bard -4.6 then +1.0 after its change, Archer -3.2 then -2.6,
Mage +0.9, Priest +0.7, Thief -0.4, Warrior -1.3.
`gim 60` with items, two seeds, on those numbers: 67 / 63 / 61 / 54 / 49%, three cells at 73 to 74 (Drake realm 1, Iron Sentinel realm 2, Queen Mantis realm 3):
their `BOSS_FIT` was raised and realm 3 power 1.57 -> 1.6. That last step is not re-measured.
