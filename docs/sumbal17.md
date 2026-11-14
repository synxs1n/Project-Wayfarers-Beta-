# Summon balance (after 0.21.6): `tools/chrome/sumbal.js`

The owner: "Add summons to balance testing and offer changes if they are too strong/weak etc". The journey sim (`v080cb.js`, `tools/fullsim.js`) never summons, so pacing numbers say nothing about pets, guardians or recruited bosses. `sumbal.js` plays the real game (every module, the game's battle code, its careful auto) with a caller that does summon, and compares each fight with the same party that does not. Nothing was retuned from these numbers: the offers at the end are for the owner to pick.

## How it measures
- Run: `cd tools/chrome && node sumbal.js 80` (80 fights a cell, about 5 minutes on an idle machine, 16 under load; not in any runall group). `POINTS=boss3,calamity`, `SOURCES=gMonk,sPriest`, `SEED=<n>`, `CFGSET='SUM.monkPray=1;SUM.lesser=0.7'` (tries other numbers without editing the game), `SIMROOT=<checkout>`.
- Points of a journey: boss 1 (party of 4 at level 6), boss 3 (5 at level 22), boss 4 (6 at level 30), the Calamity (6 at level 38), each a little under the boss's level with the realm's gear so the fight without a summon is no sure win; field fights of realms 1, 3 and 5. Bosses rotate through all sixteen Scourges and the four Calamities; guardians through all Sanctum guardians; Lesser Scourges through all sixteen.
- Parties: the same six with the caller in the Vanguard: Brann for pets (he calls it in his own place), Lumen (Priest), Nikaris, Taro (Monk).
- Two callers: "first" calls the first turn it can; "hurt" waits until the Vanguard is under 55% HP on average or one hero is under 30%.
- Per cell: win rate, the battle clock of a won fight against the same party without the summon (x1.2 = 20% longer), the share of the party's HP gone at the end, the summon's share of all damage the party's side did, and how often the call happened. The pairing bonus of a pet is on in both runs, so the difference is the Summon command alone. Healing by summons is 0% everywhere (no monster skill heals allies), so that column is left out.
- Noise: 80 fights a cell is about 5 points of win rate either way; the "By source" table (320 boss fights a source) about 4. Smaller differences mean nothing.

## The run (0.21.6 + roster17, SEED 7, 80 fights a cell)
| point | source | win % (none > first / hurt) | length (first / hurt) | HP lost % (none > first / hurt) | dmg share % (first / hurt) | used % (first / hurt) |
|---|---|---|---|---|---|---|
| boss1    | Pet, weak monster            |  73 >  78 /  81 | x0.86 / x0.94 | 44 > 39 / 40 |  9 /  6 | 100 /  70 |
| boss1    | Pet, middle monster          |  74 >  80 /  78 | x0.87 / x0.96 | 43 > 37 / 39 | 13 /  7 | 100 /  73 |
| boss1    | Pet, strong monster          |  74 >  83 /  83 | x0.92 / x0.99 | 44 > 36 / 41 | 10 /  7 | 100 /  70 |
| boss1    | Pet, strong, Beastbond       |  73 >  81 /  85 | x0.89 / x0.95 | 45 > 34 / 38 | 16 /  9 | 100 /  68 |
| boss1    | Guardian, Priest (Invoke)    |  74 >  85 /  71 | x1.33 / x1.20 | 44 > 36 / 47 | 20 /  9 | 100 /  89 |
| boss1    | Guardian, Nikaris (Invoke)   |  58 >  81 /  68 | x1.33 / x1.16 | 59 > 44 / 51 | 18 / 14 | 100 /  91 |
| boss1    | Guardian, Monk (Spirit Call) |  81 >  81 /  81 | x1.00 / x1.00 | 48 > 48 / 48 |  0 /  0 |   0 /   0 |
| boss1    | Lesser Scourge, Priest       |  76 >  80 /  78 | x1.51 / x1.22 | 41 > 43 / 38 | 11 /  9 | 100 /  84 |
| boss1    | Lesser Scourge, Nikaris      |  64 >  70 /  81 | x1.34 / x1.26 | 54 > 49 / 51 | 11 / 10 | 100 /  90 |
| boss1    | Lesser Scourge, Monk         |  78 >  78 /  78 | x1.00 / x1.00 | 43 > 43 / 43 |  0 /  0 |   0 /   0 |
| boss3    | Pet, weak monster            |  23 >  33 /  29 | x0.94 / x1.06 | 64 > 65 / 65 |  8 /  5 | 100 /  73 |
| boss3    | Pet, middle monster          |  24 >  41 /  25 | x0.86 / x0.91 | 67 > 61 / 65 |  8 /  8 | 100 /  78 |
| boss3    | Pet, strong monster          |  24 >  35 /  33 | x0.99 / x1.01 | 65 > 62 / 66 |  9 /  6 | 100 /  76 |
| boss3    | Pet, strong, Beastbond       |  29 >  28 /  31 | x0.87 / x0.96 | 65 > 64 / 66 | 12 /  8 | 100 /  78 |
| boss3    | Guardian, Priest (Invoke)    |  29 >  31 /  21 | x1.31 / x1.36 | 60 > 64 / 66 | 13 /  7 |  99 /  78 |
| boss3    | Guardian, Nikaris (Invoke)   |  20 >  24 /  25 | x1.12 / x1.11 | 68 > 66 / 68 | 11 /  8 | 100 /  78 |
| boss3    | Guardian, Monk (Spirit Call) |  23 >  16 /  19 | x1.04 / x1.16 | 68 > 67 / 69 |  5 /  1 | 100 /  76 |
| boss3    | Lesser Scourge, Priest       |  26 >  36 /  24 | x1.05 / x0.98 | 63 > 61 / 66 | 11 /  8 |  99 /  78 |
| boss3    | Lesser Scourge, Nikaris      |  31 >  26 /  25 | x1.14 / x1.13 | 65 > 68 / 65 | 12 /  9 | 100 /  83 |
| boss3    | Lesser Scourge, Monk         |  28 >  24 /  30 | x1.31 / x1.29 | 66 > 65 / 66 |  5 /  3 | 100 /  84 |
| boss4    | Pet, weak monster            |  30 >  33 /  34 | x1.08 / x1.02 | 67 > 63 / 66 |  6 /  5 | 100 /  83 |
| boss4    | Pet, middle monster          |  34 >  39 /  33 | x1.02 / x1.00 | 65 > 63 / 64 |  9 /  7 | 100 /  83 |
| boss4    | Pet, strong monster          |  28 >  38 /  33 | x1.04 / x0.97 | 66 > 63 / 66 | 10 /  8 | 100 /  84 |
| boss4    | Pet, strong, Beastbond       |  26 >  41 /  39 | x1.06 / x1.01 | 67 > 61 / 65 | 12 /  9 | 100 /  81 |
| boss4    | Guardian, Priest (Invoke)    |  34 >  39 /  34 | x1.25 / x1.17 | 64 > 65 / 66 | 11 /  6 |  99 /  71 |
| boss4    | Guardian, Nikaris (Invoke)   |  55 >  54 /  50 | x1.30 / x1.14 | 59 > 61 / 59 |  8 /  5 | 100 /  76 |
| boss4    | Guardian, Monk (Spirit Call) |  50 >  38 /  36 | x1.14 / x1.12 | 59 > 62 / 62 |  3 /  1 | 100 /  66 |
| boss4    | Lesser Scourge, Priest       |  36 >  39 /  38 | x1.11 / x1.15 | 64 > 63 / 62 | 11 /  7 |  99 /  68 |
| boss4    | Lesser Scourge, Nikaris      |  54 >  49 /  66 | x1.18 / x1.08 | 59 > 59 / 57 | 11 /  6 | 100 /  73 |
| boss4    | Lesser Scourge, Monk         |  51 >  54 /  51 | x1.13 / x1.12 | 60 > 61 / 62 |  4 /  3 | 100 /  80 |
| calamity | Pet, weak monster            |  15 >   9 /  15 | x1.06 / x1.07 | 69 > 70 / 69 |  5 /  3 | 100 /  69 |
| calamity | Pet, middle monster          |  15 >   8 /  15 | x1.02 / x1.06 | 68 > 70 / 68 | 10 /  7 | 100 /  70 |
| calamity | Pet, strong monster          |  15 >  21 /  21 | x1.10 / x1.06 | 69 > 69 / 67 |  7 /  4 | 100 /  66 |
| calamity | Pet, strong, Beastbond       |  16 >  16 /  19 | x1.08 / x1.10 | 68 > 69 / 67 |  9 /  4 | 100 /  71 |
| calamity | Guardian, Priest (Invoke)    |  14 >  10 /  14 | x1.18 / x1.10 | 67 > 69 / 69 | 11 /  5 | 100 /  66 |
| calamity | Guardian, Nikaris (Invoke)   |  39 >  25 /  41 | x1.27 / x1.26 | 65 > 68 / 67 |  7 /  6 | 100 /  76 |
| calamity | Guardian, Monk (Spirit Call) |  34 >  18 /  15 | x1.04 / x1.06 | 67 > 68 / 69 |  3 /  1 | 100 /  73 |
| calamity | Lesser Scourge, Priest       |  20 >  11 /  14 | x1.20 / x1.00 | 66 > 69 / 67 |  8 /  5 | 100 /  58 |
| calamity | Lesser Scourge, Nikaris      |  44 >  36 /  40 | x1.24 / x1.18 | 59 > 65 / 64 |  6 /  6 | 100 /  76 |
| calamity | Lesser Scourge, Monk         |  41 >  31 /  48 | x1.13 / x1.14 | 65 > 64 / 62 |  2 /  2 | 100 /  81 |
| field1   | Pet, weak monster            | 100 > 100 / 100 | x1.01 / x1.00 |  1 >  1 /  1 | 23 /  0 |  85 /   0 |
| field1   | Pet, middle monster          | 100 > 100 / 100 | x0.91 / x1.00 |  1 >  1 /  1 | 32 /  1 |  85 /   1 |
| field1   | Pet, strong monster          | 100 > 100 / 100 | x1.00 / x1.00 |  1 >  1 /  1 | 26 /  0 |  85 /   0 |
| field1   | Pet, strong, Beastbond       | 100 > 100 / 100 | x0.99 / x1.00 |  1 >  1 /  1 | 28 /  0 |  85 /   0 |
| field1   | Guardian, Priest (Invoke)    | 100 > 100 / 100 | x1.72 / x1.00 |  1 >  2 /  1 | 36 /  0 |  89 /   1 |
| field1   | Guardian, Nikaris (Invoke)   | 100 > 100 / 100 | x2.01 / x1.00 |  2 >  2 /  2 | 38 /  0 |  93 /   0 |
| field1   | Guardian, Monk (Spirit Call) | 100 > 100 / 100 | x1.00 / x1.00 |  1 >  1 /  1 |  0 /  0 |   0 /   0 |
| field1   | Lesser Scourge, Priest       | 100 > 100 / 100 | x1.80 / x1.01 |  1 >  1 /  1 | 55 /  0 |  90 /   1 |
| field1   | Lesser Scourge, Nikaris      | 100 > 100 / 100 | x2.09 / x1.00 |  1 >  1 /  1 | 60 /  0 |  93 /   0 |
| field1   | Lesser Scourge, Monk         | 100 > 100 / 100 | x1.00 / x1.00 |  1 >  1 /  1 |  0 /  0 |   0 /   0 |
| field3   | Pet, weak monster            | 100 > 100 / 100 | x1.38 / x1.00 |  3 >  5 /  3 | 27 /  0 |  95 /   1 |
| field3   | Pet, middle monster          | 100 > 100 / 100 | x1.35 / x1.00 |  3 >  4 /  3 | 24 /  0 |  95 /   1 |
| field3   | Pet, strong monster          | 100 > 100 / 100 | x1.50 / x1.00 |  3 >  5 /  3 | 14 /  0 |  95 /   1 |
| field3   | Pet, strong, Beastbond       | 100 > 100 / 100 | x1.50 / x1.01 |  3 >  4 /  3 | 16 /  0 |  95 /   3 |
| field3   | Guardian, Priest (Invoke)    | 100 > 100 / 100 | x2.35 / x1.00 |  2 >  3 /  3 | 26 /  0 |  96 /   5 |
| field3   | Guardian, Nikaris (Invoke)   | 100 > 100 / 100 | x2.01 / x1.05 |  4 >  2 /  4 | 27 /  0 |  98 /   3 |
| field3   | Guardian, Monk (Spirit Call) | 100 > 100 / 100 | x1.46 / x1.01 |  2 >  5 /  2 |  4 /  0 |  98 /   1 |
| field3   | Lesser Scourge, Priest       | 100 > 100 / 100 | x2.86 / x1.00 |  2 >  2 /  2 | 41 /  0 |  96 /   0 |
| field3   | Lesser Scourge, Nikaris      | 100 > 100 / 100 | x2.18 / x1.02 |  3 >  2 /  3 | 43 /  1 |  98 /   3 |
| field3   | Lesser Scourge, Monk         | 100 > 100 / 100 | x2.25 / x1.01 |  2 >  1 /  2 | 18 /  1 |  98 /   3 |
| field5   | Pet, weak monster            | 100 > 100 / 100 | x1.02 / x0.98 |  2 >  2 /  2 | 17 /  0 |  93 /   1 |
| field5   | Pet, middle monster          | 100 > 100 / 100 | x0.82 / x0.97 |  2 >  2 /  2 | 25 /  1 |  93 /   1 |
| field5   | Pet, strong monster          | 100 > 100 / 100 | x1.05 / x0.97 |  2 >  2 /  2 | 13 /  0 |  93 /   1 |
| field5   | Pet, strong, Beastbond       | 100 > 100 / 100 | x1.08 / x1.00 |  2 >  2 /  2 | 15 /  0 |  93 /   0 |
| field5   | Guardian, Priest (Invoke)    | 100 > 100 / 100 | x2.61 / x1.04 |  2 >  3 /  3 | 31 /  1 |  98 /   4 |
| field5   | Guardian, Nikaris (Invoke)   | 100 > 100 / 100 | x1.96 / x1.04 |  2 >  3 /  3 | 24 /  0 |  98 /   3 |
| field5   | Guardian, Monk (Spirit Call) | 100 > 100 / 100 | x2.56 / x1.00 |  1 >  4 /  1 |  7 /  0 |  99 /   0 |
| field5   | Lesser Scourge, Priest       | 100 > 100 / 100 | x2.24 / x1.05 |  2 >  2 /  2 | 40 /  1 |  98 /   4 |
| field5   | Lesser Scourge, Nikaris      | 100 > 100 / 100 | x1.75 / x1.02 |  3 >  1 /  3 | 42 /  1 |  98 /   3 |
| field5   | Lesser Scourge, Monk         | 100 > 100 / 100 | x2.79 / x1.00 |  1 >  1 /  1 | 17 /  0 |  99 /   0 |

By source (every boss point together, every field point together):
| source | boss win % (none > first / hurt) | boss length (first / hurt) | boss dmg share % (first / hurt) | field length (first) | field HP lost % (none > first) | field dmg share % (first) |
|---|---|---|---|---|---|---|
| Pet, weak monster            |  35 >  38 /  40 | x0.98 / x1.02 |  7 /  5 | x1.14 |  2 >  3 | 22 |
| Pet, middle monster          |  37 >  42 /  38 | x0.95 / x0.98 | 10 /  7 | x1.03 |  2 >  2 | 27 |
| Pet, strong monster          |  35 >  44 /  42 | x1.01 / x1.01 |  9 /  6 | x1.18 |  2 >  2 | 18 |
| Pet, strong, Beastbond       |  36 >  42 /  43 | x0.98 / x1.01 | 12 /  8 | x1.19 |  2 >  2 | 20 |
| Guardian, Priest (Invoke)    |  38 >  41 /  35 | x1.27 / x1.21 | 14 /  7 | x2.23 |  2 >  3 | 31 |
| Guardian, Nikaris (Invoke)   |  43 >  46 /  46 | x1.26 / x1.17 | 11 /  8 | x1.99 |  3 >  2 | 30 |
| Guardian, Monk (Spirit Call) |  47 >  38 /  38 | x1.06 / x1.09 |  3 /  1 | x1.67 |  1 >  4 |  4 |
| Lesser Scourge, Priest       |  40 >  42 /  38 | x1.22 / x1.09 | 10 /  7 | x2.30 |  2 >  1 | 45 |
| Lesser Scourge, Nikaris      |  48 >  45 /  53 | x1.23 / x1.16 | 10 /  8 | x2.01 |  2 >  1 | 48 |
| Lesser Scourge, Monk         |  49 >  47 /  52 | x1.14 / x1.14 |  3 /  2 | x2.01 |  1 >  1 | 12 |

Two more runs for the offers (bosses 3, 4 and the Calamity only, 240 fights a source): Spirit Call with one turn of stillness instead of two: 34 > 27 / 28 (two turns: 36 > 24 / 23). Spirit Call with one turn, lesser power .8 and 4 turns: 34 > 26 / 28. A Priest's guardian at the power it had before 0.21.4 (x.95 instead of x.835): 26 > 29 / 26.

## What it says
- Nothing here is too strong for a caller who plays like the auto. Every source moves the boss win rate by single digits; none is a reliable win button.
- Pets: fine, a small plus. +3 to +9 points on bosses (a strong monster +9), 7 to 12% of the party's damage for the three turns one hero steps out; fights are as long as without. The monster's base stats matter little (a pet fights at its hero's level); Beastbond's extra turn shows as damage share (12% against 9%).
- Guardians by a Priest or Nikaris: neutral in power, slow. a Priest's +3 points called at once and -3 called late, Nikaris's +3 either way (all inside the noise); 11 to 14% of the damage while three heroes sit out for five turns, so won boss fights take 26% longer and field fights twice as long. What a guardian really gives is a second HP bar (its HP is the whole Vanguard's, and the heroes cannot be hit while it stands), not damage. The 12% power cut of 0.21.4 does not show at this resolution (over bosses 3, 4 and the Calamity: 26 > 29 / 26 at the old power, 26 > 27 / 23 now): power is not the lever, HP and the length of the stay are.
- Lesser Scourges (Priest, Nikaris): neutral. -3 to +5 points; about 10% of the damage on bosses. On field fights one does nearly half the damage and still doubles the length: it is a boss fight tool, wasted on ordinary fights, which is fine.
- A Monk's Lesser Scourge: neutral (-2 / +3), 3% of the damage: at .6 power for three turns it is mostly a shield.
- A Monk's Spirit Call: too weak. -9 points on bosses (from 47% to 38%), both callers; the lesser guardian does 3% of the damage, and the Monk gives up two turns of stillness and then his own place for three more. Half of the loss is the second turn of stillness (one turn: -7 instead of -12 on the late bosses); more power or a longer stay does not help, because the Monk himself out-hits the lesser form.
- Level gates: a Monk cannot call anything at boss 1 (level 10 gate, the realm ends near level 8). That reads as intended.

## Offers (pick any; none is applied)
1. Spirit Call, too weak: `SUM.monkPray` 2 -> 1 (one turn of stillness, like a Priest's prayer). Expected: about +5 points on late bosses, still a little under not calling. To make it a real choice, also let the lesser guardian stand for `SUM.lesserTurns` 3 -> 4 and refund the Monk's MP cost by half (`SUM.mp` .3 -> .15 for a Monk); or change what it is: the lesser form fights beside the Monk instead of in his place (a code change in `sumFire`, about a dozen lines), which would make it a plain plus of about the size of a pet.
2. Guardians by a Priest or Nikaris, fine: no change. If they still feel too strong in hand play, cut what they are strong at: `SUM.hpK` 1.055 -> .9 (15% less of the second HP bar) or `SUM.turns` 5 -> 4; a further power cut would not be felt. If they feel like a wasted turn instead, the cheap fix is the other way: `SUM.turns` 5 -> 4 with `SUM.powM` .835 -> 1 (a shorter, harder visit: about the same damage, the heroes back a turn sooner).
3. Lesser Scourges by a Priest or Nikaris, fine: no change. Same levers if wanted: `B16.boss.hp` .88 (HP), `COMP_TURNS + 1` = 4 turns, `B16.boss.pw` .88.
4. A Monk's Lesser Scourge, fine as a shield, weak as a summon: no change needed; if the owner wants a Monk's call to hit, `SUM.lesser` .6 -> .75 applies to both Monk calls (expected: damage share 3% -> about 4%, no visible change in wins).
5. Pets, fine: no change. The strong-monster pet is the best value in the list (+9 points for one hero's three turns); if anything were trimmed it would be `COMP_TURNS` 3 -> 2 for ordinary pets, which is not recommended.
6. Field fights: no summon is worth calling there (twice the length for the boss-sized ones). No change; a one line hint in the Summons tab ("made for boss fights") would save new players the turn.

## What the sim cannot model
- Timing by a person: calling a guardian or a Scourge the turn before a telegraphed boss blow (the Cataclysm, a realm gimmick), so that the summon eats it and the Vanguard returns untouched. This is the strongest use and the likely reason they felt too strong in play; the two callers here do not read telegraphs.
- Calling when the Vanguard is about to fall and reserves are spent, as a last stand; the reserve swap rules around a summon; items used while it stands.
- The Faith stat (`ROLE9.fthSum`, +0.8% summon power a point): the sim's heroes spend points the default way, so a Faith built Priest's guardian is stronger than measured.
- Pet growth (bond levels, second skill, evolution) and pet perks: pets here are fresh (bond 0).
- Pets by "tier" are monsters sorted by base stats, not by realm; a pet fights at its hero's level, so the realm it came from does not matter to the numbers.
- The auto never prays or summons in the real game either, so all of this only matters in fights played by hand.
- Damage over time a summon leaves on a foe (poison, burn, bleed ticks) is not counted in its damage share; reaction damage it sets off is.

## legends17a: Joseth's summons and the class comparison (after the two new legends)
New in the tool: sources `jPack` (Call the Pack the first turn he can), `jGuard` (Invoke, paid in HP), `jCer` (Cerberus; the gauge is filled for the call, so this is the Limit at its best), a `jose` party (Joseth, Brann, Mira, Sable, Oren, Tess), and `CMP=1`: the same six with one hero in the first seat (`CMPH=dist,pip` limits the rows), boss 3, boss 4 and the Calamity, with what the hero did himself (his summons and clone count as his). In the source tables Joseth's own auto summoning is off (`L17.simOff`), so a row shows only the call it names.

`SOURCES=jPack,jGuard,jCer POINTS=boss3,boss4,calamity,field3 node sumbal.js 80` (SEED 7):
| point | source | win % (none > first / hurt) | length (first / hurt) | HP lost % (none > first / hurt) | dmg share % (first / hurt) |
|---|---|---|---|---|---|
| boss3 | the pack | 34 > 44 / 50 | x0.80 / x0.95 | 63 > 55 / 56 | 12 / 10 |
| boss3 | guardian (HP) | 34 > 26 / 30 | x1.21 / x1.13 | 63 > 64 / 65 | 13 / 8 |
| boss3 | Cerberus | 34 > 23 / 21 | x1.17 / x0.99 | 63 > 64 / 64 | 7 / 4 |
| boss4 | the pack | 36 > 53 / 39 | x0.75 / x0.86 | 63 > 53 / 60 | 16 / 8 |
| boss4 | guardian (HP) | 36 > 40 / 31 | x1.26 / x1.03 | 63 > 61 / 64 | 13 / 7 |
| boss4 | Cerberus | 36 > 50 / 39 | x0.90 / x0.97 | 63 > 60 / 63 | 19 / 10 |
| calamity | the pack | 24 > 30 / 36 | x0.89 / x1.00 | 69 > 65 / 64 | 12 / 8 |
| calamity | guardian (HP) | 24 > 14 / 19 | x1.47 / x1.36 | 69 > 69 / 69 | 12 / 7 |
| calamity | Cerberus | 24 > 23 / 19 | x1.06 / x1.09 | 69 > 68 / 68 | 19 / 10 |
| field3 | the pack | 100 > 100 / 100 | x0.94 / x1.00 | 4 > 4 / 4 | 17 / 0 |
| all bosses | the pack | 31 > 42 / 42 | x0.81 / x0.93 | | 13 / 9 |
| all bosses | guardian (HP) | 31 > 27 / 27 | x1.31 / x1.17 | | 13 / 7 |
| all bosses | Cerberus | 31 > 32 / 26 | x1.04 / x1.02 | | 15 / 8 |

- The pack is the strongest summon in the game: +11 points of boss win rate (a strong pet: +8 in the same run; a Priest's guardian: +1), and it is the only summon that makes won fights shorter (x0.81), because nobody steps out for it. That is what three pets at once beside the Vanguard means; its power (.7), HP (60%), stay (4 turns) and costs are the owner's numbers and were kept. What was tuned are the dogs' own moves.
- His guardian is a little worse than a Priest's (-4 against +1): the 25% of his HP is a real price and the Vanguard still sits out. It is there for the second HP bar, as for everyone.
- Cerberus is about neutral (+1 called at once, -5 called late) at boss 3 and the Calamity and good at boss 4, where Limit II opens (36 > 50): it does 15% of the damage for free, but calling it sends the pack home.

`CMP=1 node sumbal.js 100` (300 boss fights a hero, about 5 points of noise either way):
| hero | win % | hero's damage + healing a fight | share of the party's % |
|---|---|---|---|
| Sable (Thief, Shadow) | 29 | 1057 | 20 |
| Pip (Thief, Water) | 35 | 1099 | 20 |
| Dist (Chief Bandit, Water) | 38 | 959 | 17 |
| Lumen (Priest, Light) | 27 | 1290 | 24 |
| Brigid (Priest, Fire) | 37 | 1687 | 28 |
| Ione (Priest, Lightning) | 28 | 1213 | 23 |
| Joseth, no summons | 32 | 1006 | 19 |
| Joseth, summons as the auto plays him | 37 | 1403 | 26 |

Target: about 10 to 20% stronger than the base class in a boss fight, not more.
- Dist: 38% against 32% for the two Thieves (+19%; +9% against Pip, the Thief of his own element). His own damage is a little under a Thief's (959 against 1078): under the auto he spends turns on Pick Up the Pace, Water Clone, Smoke Bomb and Slip Under, and what he adds is the party's speed and his own survival. Tuned on the way: attack and HP a little down (about +10% and +5% over a Thief; the proposal had +13% and +10%), Pick Up the Pace 14 MP and 20% (12 MP and 30%). Before: 44% with the proposal's numbers (60 fights a point). Tried in runs of 60: without Pick Up the Pace 42 falls to 38, without the clone 41, without the 10% evasion 40; Barnacle Edge as a detonator changed nothing (the auto does not chain his own marks).
- Joseth: 37% against 31% for the three Priests (+20%), and level with Brigid, the Fire Priest. Without the pack he is at 32% and does less than any Priest (1006: fewer MP, no Lampglow, no Miracle), so the pack is what makes him the upgrade. Tuned on the way: the dogs' moves about 22% under the proposal (Warm Nuzzle 1.3 > 1.0, Bolt Fang 1.5 > 1.15, Skyhowl 1.0 > .75, Hamstring 1.1 > .9 ...), his speed the Priest's (8, .7; the proposal had 9, .8), Pyre Chain 1.05 > .95, Bloodstorm 3.0 > 2.7. With the proposal's numbers: 40 to 44% over three runs.
- How a foe's single blow is shared out does not matter: with pack pets taking none of them (`L17.pack.draw` .01) the result was the same (38 against 39), so the lever was left at 1 (a pet is a target like any unit).
- Not modelled: a person calling the pack and then Cerberus on its last turn, Sic, a tamed pet or a recruited boss in his slots, and gold (Light Fingers, Toll Toss).
