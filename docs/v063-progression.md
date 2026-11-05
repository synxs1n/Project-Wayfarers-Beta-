# v0.6.3 progression goals: Taming log, bond goals, Make camp, pacing audit

All code is in `v3/v063prog.js` (built just before `qready.js`). It wraps existing functions; the only shared edits are the `CAMP` block at the end of `v3/config.js` and one entry in `v3build.py` MODS. Test: `tools/chrome/v063g.js` (run from `tools/chrome` with `PWHTML=../../out/aurelis3.html`). Test hook: `window.__V063` (separate from `__A`, so no getter on `__A` is touched).

New optional save fields, all missing on old saves and read with defaults: `G.camp {b, left, at}`, `G.tameLog {monster name: 1}`, `G.talkN` (talks already announced), `G.campNote` (camp unlock notice shown). Save keys, slot keys, `aurelis-meta-v1` and the profile doc are unchanged. Nothing in the file runs in the Daily Trial (`chrome/v050p2daily.js` still matches the old build exactly).

## 1. Taming log
Records > Bestiary has two chips at the top: **All creatures** (the old Bestiary) and **Taming log**.
- Lists every foe that can join you: realm monsters (day and night forms, which bounty beasts and Nikaris's Beastbond can tame), the uneasy realm monsters (Beastbond), and the lesser whelps of the twelve Scourges (Beastbond). Calamities, Echoes and Mimics are left out. Entries are de-duplicated by name, grouped by realm like the Bestiary, with a per group count.
- Header: "Tamed X of Y this journey, Z seen", plus one line on how taming works.
- Tamed: green frame and a "Tamed" tag. Seen (account Bestiary) but not tamed: "Seen" and where it roams ("Roams Verdane Meadows at night.", "Roams a realm while Thornwarden still rules it.", or the Beastbond note for Scourges). Unseen: a black silhouette, "???" and "Not seen yet", no location.
- Tamed means in this journey: `G.tamed` plus `G.tameLog`, which `tameElite` now fills, so the log keeps a tame even if the companion list changes.

## 2. Bond goals
The real measure is the existing counter `G.bonds[k]`: +1 for each won fight where both heroes stand in the front line at the end. Thresholds stay `BOND_LV=[4,10,20]` (talk, joint tech, second talk or stronger tech). Nothing about pacing changed.
- `bondGoal(k)` gives the next step: "3 more wins side by side until the campfire talk." or "4 more wins side by side until the joint tech, 14 until the next talk." or "Bond maxed."
- Hero sheet (`bondSheet`, replaced in v063prog.js with the same rows and buttons): the goal line and a bar toward the next step, plus one line on what counts as a win side by side.
- New **Bonds** page (Party tab button "Bonds", and in the camp screen): every pair you have recruited, ready talks first, then closest goal; a "Watch the talk" button when one is ready; how many bonds wait with heroes not yet recruited.
- Notice: when `G.talks` grows, a toast in the world says "Campfire talk ready: A and B. Make camp or open a sheet to listen." once (`G.talkN`).

## 3. Make camp
- **Camp Supplies** (`ITEMS.campkit`, 40 gold, sold at Alchemy from the third realm). Use it from Backpack > Items or the Party tab's **Make camp** button (shown from the third realm, or whenever you carry some).
- Where: fields and dungeons. Not in town ("No camping in town. The inn is cheaper and better."), not in the Archive, not next to a guardian, not in battle, not in the Daily Trial. Once per `CAMP.cool` battles.
- What: standing heroes in your six get back 25% of max HP and MP; fallen heroes stay down. The inn restores everything and the Tent gives 60% and wakes the fallen, so camp is the small top up, never a replacement for either. No ambush roll.
- Pick one boon for the next 3 battles (counted at each battle start, shown in the battle log and on the Party tab):
  - Whetstone: +10% attack and magic.
  - Watch fire: +10% defense and resistance.
  - Early rise: every hero's first turn comes much sooner (first turn delay x0.35).
  - Forager's luck: +25% drop chance (through `perkDropMul`).
  Stat boons are applied to the battle copies after `startBattle` and removed with `refresh` at `finishBattle`. A new camp replaces the old boon.
- After making camp the screen shows what was healed, the boon, and any ready campfire talks with a Listen button (the talk returns to the camp screen). Name: "Make camp" for the action and "Camp" for the screen; heroes outside the six ("At camp" in the Party tab) are not mentioned, so the two do not read as the same place.

### Tunables (`CAMP` in config.js)
| key | value | meaning |
|---|---|---|
| price | 40 | Camp Supplies price (not scaled by ECON.items) |
| fromStage | 2 | first stage (0 based) where Alchemy sells it: the third realm, about level 20 |
| heal | .25 | share of max HP and MP for standing heroes |
| cool | 2 | battles between camps |
| dur | 3 | battles a boon lasts |
| atk, def | .1 | Whetstone and Watch fire bonus |
| first | .35 | Early rise first turn delay multiplier |
| drop | .25 | Forager's luck extra drop chance |

## 4. Pacing audit
Levels come from `node tools/fullsim.js journey` (DBG=1, 3 runs): realm 1 about level 2 to 9 (boss won at 9), realm 2 about 9 to 20, realm 3 about 20 to 26, realm 4 about 26 to 32, realm 5 about 32 to 40. Gates come from the code.

| system | first shown to the player | level (about) | gate in code |
|---|---|---|---|
| Elements and foe types | first battle | 2 | always; `types` hint in the first battle |
| Primers and detonators | first battles (hint); first role skills at 6 to 9 | 2 to 9 | `primer` hint, ROLE_FILL learn levels |
| Reactions | as soon as a primer and a detonator meet | 5 to 9 | skills above |
| Shields and Break | first bounty elite or the first Scourge | 8 to 11 | elites and bosses carry pips |
| Bounties | first town board | 2 | `genBounties` on entering a town |
| Taming | first beaten bounty beast (elite lv = realm top + 4) | 9 to 11 | bounties; Nikaris widens it |
| Taming log | from the start (Bestiary) | 2 | new |
| Tamer's Stick quest | first town board | 2 | `STICK_Q=6` Bestiary entries |
| Bonds | first bonded pair winning side by side | 2 to 14 | `BOND_LV` 4/10/20; depends on recruits |
| Guilds (factions, missions) | first town | 2 | Guild Hall in every town |
| Crafting (Alchemy, Smithy) | first town | 2 | herbs, parts from realm 1 |
| Charms | first town (Alchemy shop) | 2 | shop stock |
| Tempering | first Smithy visit with parts | 3 to 8 | needs parts and the realm relic |
| Dual type foes and wayfarers | realm 2 | 9 | `DUAL_FROM=1` |
| Legends (quest events) | realm 2 boards (30% roll per realm) | 9 to 20 | `LEG_Q ok: s>=1` |
| Personal quests | realm 2 and 40 battles beside you | 12 to 16 | `PERSONAL_REALM=1`, `PERSONAL_BT=40` |
| Arena | Bronze after boss 1, Silver after boss 2, Gold after boss 3 | 9 / 20 / 26 | `ARENA[].min` |
| Pack tactics | realm 3 | 20 | `PACK.fromStage=2` |
| Camping | realm 3 (Camp Supplies at Alchemy) | 20 | new, `CAMP.fromStage=2` |
| Echoes, Sanctum, Nightmare | after the bosses, end game | 30 to 50 | `ECHO_LV` |

**Finding.** Realm 1 (levels 2 to 9) introduces almost everything at once: elements, types, primers, reactions, shields, bounties, taming, the Stick, guilds, crafting, charms and tempering, all within the first town and the first few fights. Levels 15 to 30 get only the Silver and Gold arenas, pack tactics and (by luck) legends and bonds.

**Done here (gate timing only).** Camping, the one new system, opens in realm 3 (`CAMP.fromStage=2`, about level 20) with a one time toast in the first realm 3 town. No other gate was changed, because each would move existing content and other helpers are working on those screens.

**Proposed spread (not implemented, all gate or hint timing):**
- Guild missions board (factions) from realm 2: the Guild Hall still recruits in realm 1, missions show "Opens after the first Scourge falls". Ranks already earned keep counting from the start.
- Tempering hint (and the Smithy temper tab badge) after the first boss instead of the first visit; tempering above +1 already needs a Dread Core.
- Tamer's Stick quest on the realm 2 board (it needs 6 Bestiary entries, which realm 1 players often have by the end anyway).
- A short hint per system at its real first use, outside the first realm only hint window (`HINTS_UNTIL=1`): reactions at the first primed foe in realm 2, companions at the first tame, bonds at the first joint tech, camp at the first Camp Supplies bought. That needs a small change to `hintEligible` per hint and belongs with the hints owner.
- Personal quests could show their first goal at realm 3 (`PERSONAL_REALM=2`) to land in the 15 to 30 band; this is one config number.

## Tests
`chrome/v063g.js` (42 checks): taming log counts, silhouettes and "???" for unseen, location only for seen, Bestiary toggle; bond goal text against `G.bonds` (1, 2, 6 and 25 wins), on the sheet and the Bonds page; talk ready toast; Party tab buttons; camp blocked in town and the Daily Trial, allowed in the field, sold only from realm 3; camp heals 25%, the inn about 70% more on the same party; Whetstone gives x1.10 attack in 3 battles counting 2, 1, 0, gone in the 4th, stats normal afterwards; cooldown ends after battles; no clipped text in the camp, camp done, Bonds, Taming log, Party and hero sheet screens at 390x844 and 933x705; no page errors. Still passing: v061a, v050p4, v043c, v041p6, v059a, liveupdate, v050p2daily (against the v0.6.2 build). `v053ua` reports 39 px menu tabs at some sizes on the v0.6.2 build too (not from this change).
