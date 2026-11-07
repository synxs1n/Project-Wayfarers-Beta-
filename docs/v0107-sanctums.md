# Beta v0.10.7: Phase 8, Sanctums and Summons

## Design
- Sanctums: the side fortresses (sites.js, `m.fort`, ids `o<stage>`) keep their maps and prizes; `siteHasMini` is always true for them, so each ends in one unique guardian from MINIS (one guardian per site per journey, `G.miniPick`). The names are "<Realm> Sanctum" (FORT_NAMES). Caves keep their 90% chance of a guardian; a cave guardian also becomes a summon.
- Binding: a win over a `spec.mini` fight calls `sumUnlock(mon,name,mod)` into `G.summons` (optional field; `unpackG` rebuilds it from `G.miniDone` and `G.miniPick` on old saves). The results screen says the guardian is bound.
- Priest (class `healer`, now named Priest): the root battle menu shows **Invoke** when `sumCan(a)`: a summon exists, none is out or being prayed for, no summon fell this battle, this Priest has not summoned yet, MP >= `sumCost` (SUM.mp of max MP, at least SUM.mpMin), not the Daily Trial, not auto. One summon: Invoke prays at once; several: a list (`B.menu==='summons'`). Praying (`B.pray={by,mon,n}`) ends the turn. On the Priest's next turn (the advance wrapper) the summon fires: `sumMake` builds the unit with `makeEnemy` (elite, at the Vanguard's average level + SUM.lvUp, power SUM.powM), side 'p', `isSum`, HP = SUM.hpK x the Vanguard's total max HP (at least the guardian's own), its moves from MON[mon].sk; `B.sum={u,front,by}` and `B.front=[u]`. It acts on its own turns (`sumTurn`: buffs 15%, an all-foes move 65% when it has one, else a random move, aiming at weaknesses) for SUM.turns turns, then `sumEnd` restores `B.front` with staggered `next` times. Fallen summon: `sumEnd('ko')` and `B.sumDead` (no more summons). The Vanguard is always restored before win and finishBattle, so XP and saves only ever see heroes. Swaps are blocked while praying or summoned.
- Monk: from SUM.monkLv, **Spirit Call**: SUM.monkPray turns of praying, then a lesser form (SUM.lesser power, HP from the Monk's own max HP) in the Monk's own slot for SUM.lesserTurns turns.
- Foes: they target the summon (it is the only live Vanguard unit), planned targets included. Boss gimmicks that pick Vanguard slots fall on it.
- Auto: never prays. Daily Trial: off. Save data: `G.summons` only.

## Balance
At stage 0 (level 3 party) the guardian came in with 244 HP and hit for about 2x a hero's attack with its all-foes move; three turns of it is roughly a strong round for the whole Vanguard with the party's HP untouched meanwhile, at the cost of the Priest's turn and 30% of their MP. It is the Priest's "save the fight" button, not the default plan.

## Tests
Script used: a real time battle at speed 3 with the Priest praying on their first turn (`tools/chrome` style, see the session's p8b script): fired, Vanguard hidden, three turns, restored. Chrome tests that read the words Fortress or Healer in UI text were updated to Sanctum and Priest.
