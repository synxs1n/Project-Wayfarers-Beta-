# Aurelis Wayfarers: design notes, Beta v0.4.1 addendum

Read after `docs/design-notes-v033.md` (v0.3.3 to v0.4.0). Where they disagree, this file wins. Later builds: `docs/audio-notes-v045.md` (v0.4.5 audio, v0.4.6 Android live updates). Older paths in these notes (`chrome/...`, `/home/claude/backups/...`, artifact links) come from the pre GitHub workspace; in this repo the tests are in `tools/` and `tools/chrome/`, and the site is GitHub Pages.

## Beta v0.4.1: fix and rebalance pass

### Compatibility
- Save keys and db schema versions unchanged. Every new field is optional and defaults safely: per-hero `ail` (persistent ailments) and `bt` (battles together; old saves estimate (level-3)x5), `G.dunRev`, auto settings, `G.loreHeard`, `G.npcT`, `G.roamDead`, `G.miniDone`, `G.fortWon`, `G.fac.ctr.manual`, `G.run.rv`.
- `G.run.rv===2` marks a journey made with the sixteen realms. Older journeys (no `rv`) keep the six original realms and play exactly as before (no overlays on monsters or weather, no fortresses). Visual boss themes lift on boss defeat for every journey (3.7).
- Town generation now clears a tree or bush standing on a doorstep (worldgen.js). This can change a single tile in an old town.
- Old saves: `chrome/v041old.js`, `saveformats.js`, `oldsave.js`.

### New modules (build order)
`realmdata.js` (right after zones.js: the 16 realms, boss overlays BOV, Calamity effects CAL_FX), `mapheal.js`, `ailments.js`, `ceword.js` (after chance), `npc2.js`, `realms.js`, `roam.js`, `sites.js`, `sprites.js`, then `saves.js`, `economy.js` last. Check `v3build.py` for the authoritative list.

### Phases 1 to 3 (bugs, battle rules, balance)
- Phase 1 bugs 1.1 to 1.12 fixed with tests (`v041p1a`, `v041p1b`).
- 2.1 dead stay dead, 2.2 persistent ailments (Poison, Curse, boss Wound; cures salts, ash, bandage), 2.3 delivery rebalance (`archtest.js`), 2.4 no auto in elite, miniboss and challenge fights, 2.6 parties of 1 to 6 (`v041p26`), 2.7 Lore in battle, 2.8 weather and time tags always shown.
- 2.5 auto (ban list lifted on request): on `AUTO_NERF.smart` (60%) of its turns auto plays like the careful brain; otherwise it swings with type-chart awareness `aware` (60%), Limit Breaks `limit` (50%) and detonators `det` (50%), heals below `healAt` (40%), and auto damage is `power` (75%). Sims: party 6 turns x1.31 to x1.78, HP loss x1.13 to x1.93; party 3 turns x1.19 to x1.61, HP loss x1.24 to x1.62 (target +40% turns, +35 to 50% HP loss).
- 3.1 to 3.7: pack tactics, boss level rule, echo levels, small-party scaling, economy (gold x0.75, XP x0.85, gear and items x2, recruits x3.5), world strength creep (+5% per base boss).

### Phase 4: sixteen realms
- 4.1 `REALMS` (realmdata.js) adds ZONES 6 to 21: 12 standard (Thistlewold Downs, Amberglade Orchards, Gullreach Strand, Mirefen Marsh, Cinderhollow Deeps, Glowroot Grottos, Rimewatch Tundra, Glacier Teeth, Galecrest Peaks, Sunspire Mesa, Willowmere Lakes, Ironroot Mines) and 4 Calamity realms (The Ashen Expanse, The Drowned Crown, The Starless Wastes, The Shattered Sky). Each reuses one of six tilesets for layout and adds a palette lean, roofs, decorations, ground motif, ambient particles, a monster mix with realm variants (`MONV` in realms.js, recoloured sprites with their own names, elements, drops and archetypes), a weather table (`R.wx`, clear the largest share), townsfolk, quests and a music shift. `newRun` draws 4 standard and 1 Calamity realm from the run seed; bosses are drawn independently.
- 4.1b `BOV`: per boss, an overlay monster joins the realm pool (one slot), a weather push, wayfarer element weighting, an NPC line, a Guides line (Guides > Lore, no names) and a boss quest. `bovAt(s)` is active while the boss lives; `liftOverlay(s)` runs on defeat (look, NPC lines, signs, pool), with a toast that the Echo waits. Overlay monsters are listed in the Bestiary as variants.
- 4.2 `CAL_FX`: Dimming sky (Shadow +15%, Light -12%), Drifting ash (Fire +15%, +10% Burn on foe fire hits, answered by Remedy, Purify or Clarity), Pressure (everyone 8% slower, Lightning +12%), Corrupted dawn (Light +15%, Fire +8%). Both sides feel the element shifts. Calamity realms carry two special quests each (a gather and a hunt) and favour wayfarer elements that answer them.
- 4.3 weighting: chance meetings x2.5 for realm elements and x1.5 for overlay elements; tavern fit x1.4 and x1.25. Never guaranteed, still the journey subset.
- 4.4 weather is per realm, towns included (visuals and tag; combat effects where they were).
- 4.5 dusk and dawn (`daylight.js`): multiply colour grade, long soft building shadows away from the low sun, horizon glow, lit windows, fireflies and swallows at dusk, light mist and dew at dawn. Reduced motion gives still frames.
- 4.6 roaming enemies (`roam.js`): 3 + stage per main dungeon, on open room tiles only, at least 9 tiles from the entrance, patrol within 4 tiles of home, see `ROAM.sight` tiles in a cone, chase slower than you walk and give up. Tougher (level +2, HP x1.3) with 20% elites (no auto). Beaten ones stay beaten.
- 4.7 sites (`sites.js`): caves get their own palette (`#cave`), drips and music; side fortresses (62x40, stages 2 to 5 in new journeys) with a gatehouse on the field, courtyard, barracks, keep and their own palette (`#fort`), music and map marker. Prizes: +2 gear (weapon or armor), rare items, challenge recruits (never legendaries), unique charms `c_ft0` to `c_ft4`.
- 4.8 minibosses: 90% of caves and fortresses (seeded). Opening the prize chest wakes it; no auto; a win adds gold, a Dread Core and 3 realm materials.
- 4.9 validation: `node worldtest.js 20 120 --rv2` (600 dungeons, 463 caves, all 16 realms placed, all valid); `chrome/v041p4.js` (all 160 boss and realm pairings build clean maps, overlays apply and lift); `chrome/v041p47.js` (520 fortresses valid); `chrome/v041p46.js` (roamers).

### Phases 5 and 6
- 5.1 chance wording, 5.2 wayfarer dialogue (1,144 unique lines), 5.3 NPC dialogue (`npc2.js`), 5.4 dynamic title screen, 5.5 start with 1 to 3 wayfarers.
- 6.1 Backpack, 6.2 shop sort and filters, 6.3 Craft only tag, 6.4 sprites (`sprites.js`: shaded parts with roles, rarity palettes `TIER_METAL`/`TIER_GEM`, consumable icons via `itemIcon`), 6.5 The Steady Hand, 6.6 personal quest requirements, 6.7 personal quest rewards (40/30/30 weapon, armor, charm; legendaries keep weapons).

### Balance review (7.1), sims in node
- Late bosses, party of 6 (`balance10.js 6`), v0.4.1 vs v0.4.0: lv 30 Scourge 56% vs 93%, Calamity 7% vs 40%; lv 35 74% vs 100%, 29% vs 76%; lv 40 93% vs 100%, 71% vs 96%; lv 45 90% vs 100%, 61% vs 90%. (The Echo column of balance10 reads 100% in both builds: its `storyEcho` spec is not what the game uses; echo levels are covered by `echolvtest.js`.)
- On-level bosses (`bosswin.js 48`): party 6 54/59/53/62/53%; party 3 5/7/9/8/5%.
- Regular encounters, party 3 (careful brain): about 8 to 32% HP per fight by stage.
- Pacing (`pacing.js`): fights to be boss-ready with 6 heroes 191 to 219 (v0.4.0 139 to 147); ready level about 39 at the Calamity.
- Gold (`goldsim.js 30`): per won fight 39/78/130/166/219 (v0.4.0 49/112/168/244/309); a tier sword now costs 300/760/1500/2800/4800 (was 150 to 2400), so about 2.6x more fights per piece.
- Auto vs manual: see 2.5.

### Tests
Chrome: `v041p1a, v041p1b, v041p2, v041p4, v041p5, v041p6, v041p6b, v041p26, v041p44, v041p46, v041p47, v041p53, v041p54, v041p64, v041p65, v041p67, v041old`, plus updated `v040p3`, `v040p789`, `v030`. Node: `archtest, echolvtest, phase3test, cewordtest, bosswin, pacing, autosim, goldsim, worldtest (also --rv2), healtest, levertest, gatetest, balance10`. (Not every one of these files made it into the repo's `tools/`; check what is there.)

## Beta v0.4.3
Version string `Beta v0.4.3` (0.4.2 skipped on request). Save keys and db schemas unchanged; new optional fields `c.eq.k` (cape), `G.echoReady`, `G.miniPick`, `META.cfg.updSeen`.
- **Capes** (`capes.js`, after sprites.js): slot `k` in `EQSL` (data.js, the one list of slots), `k_cape_0..5` (Traveler's Cloak to Mythweave Cape: HP, RES, a little SPD, about a quarter of armor), sold with armor, tempered with logs and hide, shown on the hero (cape in the tier colour; `lookKey` is the sprite cache key). Sims equip a cape at the party's tier (`CAPES=off` to skip).
- **Re-tune with capes**: `BOSS_BUFF {hp:[1.62,2.1,1.8,2.0,1.52],pow:[1.36,1.6,1.44,1.6,1.28]}` gives on-level 6-party wins 59/64/58/61/59% and 3-party 6/8/7/9/7%; `FIELD_FOE {hp:[1.55,1.45,1.32,1.28,1.28],pow:[1.75,1.52,1.3,1.3,1.3]}` gives regular fights 6.7/22/17/17/20% HP (party 3, careful play; stage 1 stays gentle).
- Save safety: `svupdate` popup at the title when any slot was saved by another version: Export per slot, Continue marks the version seen.
- Fallen heroes earn no XP. `AUTO_REW .6`. `ENC_RATE {low:.05,normal:.095,high:.14}`, `ENC_MIN_STEPS 8`.
- Travel packs: `packContents()` rolls 3 or 4 picks from `PACK_TABLE` (stage-gated), sometimes 2 realm materials.
- Rivals (`rivals.js`): `rv_<hero>` per hero, unique names (prefix x suffix), base, colour and an element the hero is weak to. Accepted quests in old saves keep their rival.
- Minibosses: 20 designs in `MINIS` (sites.js) with their own names, looks, elements and trait; `miniFor` deals them per journey without repeats (`G.miniPick`).
- Tempering lists only temperable gear, rarest then highest temper first. In battle, a detonator shows `detLive` ("Can set off X on Y") only when a foe is Primed for it right now. Menu > Party is a 3 + 3 grid (front line, reserve) that fits one screen, compact rows on landscape phones.
- Bosses: you stay where you won; story echoes wait until you leave the dungeon (`echoHold`, `G.echoReady`; older saves always ready). Echo wins pay more (shard 65%, essence 4 first / 2-3, core 75%, 3 materials, gold). Boss bar across the top of boss, elite and miniboss fights (`bossBarHtml`).
- Inn on PC: keyboard clicks are ignored while the key that opened a popup is still held (town2.js).
- Tamer's Stick: `stickCount` measures against `bestAll()` (the Bestiary as listed).
- Tuning: personal Oathmantle (tier 4 armor x1.08) and Token (tier 4), signature weapons tier 4 x1.08, fortress charms up a step, The Steady Hand charm HP 140 ATK 12. Fortress gatehouse painted into the field base layer.
- Tests: `chrome/v043.js`, `chrome/v043b.js`.
- Second pass (same version): start gold 400; `FIELD_FOE` stage 1 eased to hp 1.15 pow 1.15 (stage 2 hp 1.35 pow 1.42), `BOSS_BUFF` stage 1 hp 1.45 pow 1.24 (party 6 at lv 7 wins 72%, party 3 10%); `earlysim.js` (fresh party of 3 at lv 3: careful 90% / auto 98% wins, about 20% HP lost). `ECON {gold:.9,gear:1.6,items:1.6,recruit:3,rareRecruit:2.6,inn base 30 per 25}`, `AUTO_REW .66`, `AUTO_NERF.power .85`.
- Duels: a beaten wayfarer always takes a tavern seat (`tvSlots` wrapper in tavern2.js) and the popup says so. The Inn closes after a rest. Settings > Back to the main menu (`ACT.quitTitle`, saves first). Accept all / Claim all (`allq.js`) on the Quest Board, Guild bounties and faction missions.
- Starters: 24 (`'s'` in heroes.js; added Gideon, Zia, Tamsin, Ashwin, Halden, Pomona, Brook, Kage), three per class and three per element.
- Towns: `townLinkGates` (worldgen.js) carves a road from each gate's landing tile to the nearest road and clears trees, bushes, crates and barrels beside it.
- Tests: `chrome/v043c.js`.
- Third pass (difficulty revert, same version): `FIELD_FOE {hp:[.9,.9,1,1.05,1.08],pow:[.85,.86,.97,1,1.02]}`; `PACK.fromStage 2` (no pack focus or frenzy in realms 1 and 2); after-win recovery 25/20/15/12/12% HP by stage (was 8%); `CREEP.field .5` (field foes get half the world creep, bosses full); `BOSS_BUFF` stage 1 and 2 hp 1.3/1.75 pow 1.15/1.4 (party 6: 80/80%, party 3: 17/15%). `chainsim.js` (a party of 3 fighting on with no rest): fights won before a wipe, v0.4.0 vs now: realm 1 at lv 3 9.1 vs 11.3, realm 2 at lv 9 5.2 vs 6.9 (9.7 with capes), realm 3 at lv 16 8.7 vs 7.2, realm 4 at lv 23 6.5.

## Versioning
GAME_VERSION file at the repo root (one line). Last digit +1 per game change; the middle digit only when the last would pass 9 or Jason calls a massive shift. Beta v0.4.4 moved the game to GitHub, v0.4.5 the orchestral audio, v0.4.6 Android live updates.
