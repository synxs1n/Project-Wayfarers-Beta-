# Beta v0.5.0, Phase 3: shops, gear and items (worktree report)

Scope: items 3.1 to 3.9 of `docs/v050-prompt.md`. GAME_VERSION, the changelog and the design notes are not touched here (the lead merges those). Save keys and db schemas unchanged; the Daily Trial is untouched (every new path checks `G.daily`, and the Trial keeps its old item cap of 9).

## Status

| Item | Status | Notes |
|---|---|---|
| 3.1 Best for party ordering | Done (Tempering tradeoff lines partial) | New default sort chip "Best for party" in Smithy, Alchemy charms and Forge. Rarity borders, filters, "Rarest first" and "Ready first" kept. Forge keeps craftable first. Tempering ordered by gain for the party. Tradeoff lines show in shop and Forge lists; Tempering rows do not get the tradeoff line (each row is a different item, so the "two options for the same slot" case rarely applies). |
| 3.2 Suggest duplicates | Done | A row whose item a party member already wears says so and names the next hero it would still upgrade, with their gain. Such items still sort among the upgrades, and the Smithy plan (3.3) buys a second copy when it helps. |
| 3.3 Smithy best gear button | Done | "Buy, craft and equip best gear" on the Smithy's Weapons, Armor and Forge tabs. Plan, confirm, run, Undo, clean stop. |
| 3.4 Best Party awareness | Done | Bestiary and boss aware scoring, legal weapon delivery, reasons per pick, "Equip best gear for this party" after Apply. Also fixes an old bug: Detonators were never counted (party2.js looked for role `detonator`, skills use `det`). |
| 3.5 Team build hints | Done | Team check on Menu > Party and in Best Party, with fillers and a one tap swap (town only, like every membership change). |
| 3.6 Boss readiness | Done | Boss prompt, story Echo prompt, and the Bestiary entry of this journey's living boss. Never blocks, no skills or turning points shown. |
| 3.7 Holy Water repeat | Done | Toggle in Menu > Backpack > Items. |
| 3.8 Item limit 50 | Done | One constant; every hard coded 9 replaced. |
| 3.9 Pork Chop Sandwiches | Done | Two after the first boss win with a hint; "Use 2: return to town" in dungeons. Battle and other rules unchanged. |

## What changed

### New file `v3/p3shop.js`
Added to `v3build.py` right after `economy.js`. Everything is a wrapper or a reassignment, so shared files stay almost untouched:
- render wrapper: per render cache `P3C` (tradeoff lines, hero kits).
- 3.1: `shopFBar` (replaced, adds the "Best for party" chip), wrappers on `shopSortIds` and `recipeList`, `p3BestSort`, `p3MarkClose`, `p3Tradeoff` (e.g. "Oren: Mace: stuns land 50% more often, more RES. Lance: +22% vs foes that already acted, more ATK."), `partyGainOf(id)`.
- 3.1 Tempering: `temperOrder(list)`, `temperGain(o)`, `temperClose(o)`, `temperReady(o)` (see the Phase 1 note below).
- 3.2: `bestTag` wrapper (duplicate line `.p3dup` and tradeoff line `.p3why`).
- 3.3: `p3SmithPlan()`, `mP3Plan` (modal type `p3plan`), `p3SmithRun(plan)`, `mShop` wrapper (the button), `mAutoEq` wrapper (mode `smith` result title and note). Actions `p3Smith`, `p3SmithGo`.
- 3.4: `p3Kit(c)` (deliveries, with the basic attack following a weapon the hero may legally hold; heal, revive, Primer, Detonator, tank, area, elements), `p3Threats(s)` (monsters of the area seen in the Bestiary, plus the boss's element and archetype from `BOSS_TY` and its theme), `p3TeamScore`, `bpScore` and `bestParty` reassigned, `p3Reasons`, `mBestParty` replaced (threat summary, a reason line per pick, team check). `ACT.bpApply` and `mLdRes` wrappers add "Equip best gear for this party" (runs `autoRun('party')`, so its Undo works too).
- 3.5: `p3Gaps(ids)`, `p3GapsHtml`, `vSwap` wrapper (Party tab), action `p3Swap`.
- 3.6: `p3Ready(s,lv)`, `p3ReadyHtml`, wrappers on `mBoss`, `mEchoAsk`, `mBeast`.
- 3.7: `wkwUpdate` wrapper (it is the hook the step code calls right after the ward ticks down), action `p3HwAuto`.
- 3.9: `win` wrapper (first boss victory), `p3Pork2`, `p3PorkWhy`, action `p3Pork2`; `ITEMS.porkchop.d` gets one more sentence.
- Menu > Items post processing (vModal wrapper) for the Holy Water toggle and the two sandwich button.
- A small `<style>` block is injected from the module (no edits to `style.css`).
- Test hook `window.__P3` (lazy, our own object, so `shell.html` is not touched).

### Small edits to shared files
- `v3/config.js`: new block at the end (keys below).
- `v3/temper.js` (`vTemper`): the sort line now calls `temperOrder(...)`.
- 3.8 constant swaps, `9` to `invCap()`: `engine.js` (`craft`, steal in battle, battle drops), `factions.js` (Archmage extra, faction stock), `progression.js` (Next tab craft list), `ui.js` (tavern food button, `ACT.buyItem`), `ui2.js` (`recipeReady`, Alchemy buy button), `sites.js` and `world4.js` (vault items), `worldrt.js` (chests), `chance.js` (traveller packs).
- `tools/chrome/v041p6.js`: the 6.2 rarity checks now pick "Rarest first" first (3.1 made "Best for party" the default).

### New config keys (`v3/config.js`)
`ITEM_MAX=50`, `ITEM_MAX_DAILY=9`, `invCap()`, `SHOP_BEST{closeAbs,closeRel,minPct}`, `SMITH_PLAN{minPct}`, `BP_AWARE{arch,el,boss,dl}`, `READY{lvGap,potions,revives}`, `PORK{firstBoss,toTown}`.

### New save fields (all optional, default off)
- `G.hwAuto` (Holy Water toggle), `G.p3pork` (the first boss sandwiches were given).
- `META.cfg.shopF.p3` (one time switch of the shop sort to "Best for party"; players can pick another sort after that and it is remembered as before).

## How the pieces behave
- **3.1 order.** Shop lists: party upgrades first (best gain of any active party member, then the sum), best to worst, then everything else in the old rarity order. Forge: ready to craft first, then the same upgrade order. Two neighbouring upgrades for the same hero and slot within `SHOP_BEST` get a tradeoff line on the second one: cheaper, weapon perk, the two stats it gives most of for that hero's class, already tempered.
- **3.3 plan.** For each party hero and the Smithy's slots (weapon, armor, cape) it ranks every spare in the pack, every piece on sale and every open Forge recipe by gain. Heroes with the biggest gains go first. Each pick uses a spare if there is one (free), otherwise the cheaper of buying or forging that you can pay for right now (forging only with materials you own, buying wins ties so materials are kept). Better pieces you cannot pay for are listed under "Out of reach for now" with the gold or materials they need. Confirm runs every purchase first, then takes the Undo snapshot (`snapAuto`), then equips. If the gold runs out partway (for example gold changed since the plan), it stops, says "Stopped: the gold ran out after N of M", and still equips what it bought. Undo (`undoAuto`) restores the gear; purchases stay in the pack.
- **3.4 Best Party.** Same greedy plus swap search as before, scored by `p3TeamScore`: strength, healer, tank, Primer, Detonator, elements, plus `BP_AWARE.dl` per delivery covered (piercing, blunt, ranged, magic), `BP_AWARE.arch` for every known archetype answered, `BP_AWARE.el` for element answers to the known monsters and (weighted by `BP_AWARE.boss`) the boss. The boss counts even before it is met: its element and archetype come from its theme (the screen says "the Scourge" until it is seen). Reasons per pick, for example "Oren: ranged answer to the flyers here; tank", "Mira: Water hits the Scourge hard".
- **3.5 Team check.** Gaps: healer, tank, ranged, blunt, piercing and magic answers (marked as wanted when the area's known archetypes want them), Primer, Detonator, element answer for the area (when half or more of the known monsters are not hit hard), element answer for the boss. Each names up to three roster heroes who could fill it, and the best swap (the party member whose loss costs the team score least). Collapsed by default on the Party tab so the 3 + 3 grid still fits one screen.
- **3.6 Readiness.** Rows: level against the boss (`READY.lvGap`), gear tier against the realm, healer, archetype deliveries, element answer, Primer and Detonator, potions and revives (`READY`). Each failed row has a concrete hint, often naming a roster hero. It only uses the level and element the prompt already shows plus the archetype from the theme.
- **3.7.** When the ward runs out and the toggle is on, another flask is used at once (before the encounter roll of that step) with a toast; with none left, a toast says so and nothing is used.
- **3.9.** First boss victory of a journey (no realm cleared before it): +2 sandwiches (capped at the stack limit), shown under Found, with a hint appended to the story text. Old saves past their first boss do not get them. In a dungeon the item row offers "Use 1: dungeon entrance" and "Use 2: return to town" (the last town's Inn; it also releases a held story echo the way leaving the dungeon does). In battle, a sandwich is still a single sure escape from ordinary fights.

## Note for Phase 1 (1.9 Tempering order)
`vTemper` (temper.js) now sorts with `temperOrder(list)` from p3shop.js. It already does 1.9: ready to temper right now first, sorted by the biggest improvement for the party (`temperGain`), then the rest by how close you are (`temperClose`, share of materials and gold owned), then gain and rarity. If Phase 1 writes its own 1.9 sort on that same line, the merge should keep the `temperOrder(...)` call (or make Phase 1's sort call `temperGain(o)` as its "improvement" key and `temperClose(o)` as its "how close" key). Both accept the `{where,ref,id}` entries vTemper builds.

## Tests
New:
- `tools/chrome/v050p3a.js`: 3.8 (50 cap on buying, Alchemy button, Daily Trial keeps 9, no hard coded 9 left), 3.1 (default chip, shop order best to worst, borders and filters kept, tradeoff line, Rarest first still works, Forge craftable first then by gain, Tempering ready first by gain), 3.2 (duplicate line names the second hero with gain, item sorts among upgrades), 3.3 (button, plan first with nothing spent, every hero and a total, confirm spends exactly the total and equips, Undo restores equips and keeps purchases, cheaper of buy or forge, clean stop when gold runs out, unaffordable list). ALL PASS.
- `tools/chrome/v050p3b.js`: 3.4 (threats from Bestiary and boss, reason lines, every pick explained, Detonators counted, legal weapon delivery, "Equip best gear for this party" opens auto equip), 3.5 (gaps named, fillers and swap button, swap works, shown in Best Party), 3.6 (readiness on the boss prompt, Fight never disabled, hints for a weak party, no skill names or turning point, Bestiary entry), 3.7 (toggle, reapply with message, stop with message, off is off), 3.9 (2 sandwiches on the first boss win with hint, not on the second, Use 2 lands at the last town's Inn and costs 2, Use 1 still goes to the entrance, no Use 2 outside dungeons, battle escape still costs 1). ALL PASS.

Old bugs reproduced by these tests on the pre-phase build: buying a 10th potion (3.8), Detonators counted as 0 in Best Party (3.4).

Existing tests (pre-phase build vs this build): smithy, smithy2, smithyfuzz, smithywalk, eq, eq2, v043b, v043c, p4b, v040p789, oldsave, tavern, v041p6 (after the sort pick) pass. Same failures as before this phase, unrelated: smithy3 "render forge slow" (about 850 to 1100 ms against a 600 ms bar on both builds), v043 "version is Beta v0.4.3", v040p3 "Records ... Music Room". `gear.js` and `saveformats.js` read `tools/out/aurelis.html` (an old path) and do not run here. The wider sweep is listed below.

Wider sweep, same result on the pre-phase build and on this one: v041p1a, v041p1b, v041p2, v041p26, v041p5, v041p53, v041p54, v041p64, v041p65, v041p67, v041old, v040p1, v040p5, v041p44, v041p46 all pass; v040p2 times out on both; v50, p3, p4, p5 and prog need `@sparticuz/chromium`, which is not installed, so they do not run on either build.
