# Code map

The game is ~140 files in `v3/`, joined by `v3build.py` in its `MODS` order into one strict-mode IIFE (`v3/shell.html`
wraps it; `boot()` runs at the end). Everything shares one scope, so a later file can wrap or replace an earlier
file's function. The most wrapped core functions (render, startBattle, finishBattle, win, vModal, worldDraw, ...) are defined
once (`render=HOOK.def('render',render);` under the base body) and modules add ordered hooks to them (`v3/hooks.js`,
`docs/v099-hooks.md`); their lists are below. Smaller chains still use the old wrapper form
`{const f0=fn;fn=function(){...f0.apply(this,arguments)...};}`: wrappers run in load order, and the last one installed is the
outermost (it runs first). Every module's first line says what it owns; this page indexes them.

Tunables: `v3/config.js` (loads first) holds every gameplay number in nine numbered sections with a table of contents
(search `// ==== 3.` to jump to section 3). Data tables (heroes, skills, items, foes, zones, music) live in their own
data files. Test hooks: `window.__A` (end of `v3/shell.html`, lazy getters over the IIFE's names; `TW.get('name')`
evals any name), `window.__AU` (ambience.js), `__P2` (p2world.js), `__P3` (p3shop.js), `__P6` (party3.js), `__M3`
(menus3.js), `__OB` (onboard.js), `__V063` (v063prog.js), `__DL` (duellines.js), `p45hook.js` (phases 4 and 5).
`__P2` copies some functions at load time (for example the original `turnOrder`): keep those originals.

## To change X, look in Y

| To change | Look in |
|---|---|
| any balance number (XP, drops, boss muscle, prices, encounter rates, weather odds, roles, Momentum) | `config.js` (sections 1 to 9) |
| XP curve, level cap, Limit Break levels, catch up XP | `config.js` 1; `engine.js` (gainXP, `need`), `p4xp.js` |
| hero roster, classes, looks | `heroes.js`, `data.js` (classes, growth), `art.js`/`art2.js` (sprites), `sprhd.js` (HD paint) |
| skills, Limit Breaks, bonds | `skills.js`; bond scenes `town2.js`, bond goals `v063prog.js` |
| class roles (primary and secondary), role skills, role charms, roleOut | `roles.js`, `ROLES` in `config.js` 5; role weapon families in `items.js`, icons in `icons.js` |
| Focus (crit chance for turns), the 12 skill kit (cap, dual type primers and detonators, no dual ultimates), dual arts (class kind, prime and set off both elements), skill power by role (primary, secondary, off-role, nature lift), `heroPrimeDet` for the tavern | `skills12.js`; numbers in `config.js` (`FOCUS`, `SK12`, `ROLEPW`), `COMBO` and `ROLE_FILL` in `skills.js`, `ROLE9.cls` in `roles9.js`, `rl` on every nature in `natures6.js` |
| monsters, bosses, archetypes | `foes.js`, `monsters2.js`, `art3.js` (guardians), `archetype.js`, `echocore.js` (echo forms) |
| damage, statuses, reactions | `engine.js` (calcDamage, addSt, doReaction), `data.js` (REACT, STS), `ailments.js`, `archetype.js`, `battle4.js` (Momentum) |
| typed basic attacks (CLS_ATK) | `atk6.js` |
| natures as sub-roles, single element mastery perks | `natures6.js` (NAT6, NAT6_CLASS, MAST6; MASTERY_BONUS in data.js) |
| Chain targeting, planned foe targets and telegraphs, the Guard cue and reward | `chain5.js` (CHAIN and G5 in `config.js` 2) |
| battle flow (turn order, enemy AI, auto) | `engine.js` (startBattle, advance, enemyTurn, autoTurn), `battle5.js` (forecast order, foePlan, enemyTurn0), `battle4.js` (roles, free swap), `prog2.js` (auto lock) |
| battle screen (stage, labels, HUD, commands, cards) | `battle.js` (BL layout, drawUnit), `battle3.js` (labels, unitHud, FX placement), `battle5.js`/`battle4.js` (forecast, Momentum bar), `battleui.js` (cards, badges), `ui.js` renderBattle, CSS `battle3.css`, `battle5.css`, `battle4.css`, `ui3.css` |
| battle effects and animation | `anim.js`, `fx2.js` (floating text), `gfx6battle.js`, `hdspell.js` |
| battle backdrops, HD-2D battle stage | `bg.js`, `p2world.js` (backdrop from the terrain), `hdstage.js`, `visuals7.js` (arena) |
| world maps (generation) | `worldgen.js`, `world4.js` (the connected world, caves, dungeons), `sites.js`, `realms.js`, `mapheal.js`, `pathguard.js` |
| dungeon looks per realm, organic cave walls, the boss lair entrance | `dungeon8.js` (D8M materials, D8_REALM) |
| world movement, gates, chests, encounters | `worldrt.js`, `roam.js`, `chance.js`, `mimic.js`, `stuck.js`, `travel.js` |
| world drawing (2D) | `worldgfx.js`, `worldgfx2.js`, `towngfx.js`, `worldrt.js` (worldDraw), `gfx6world.js`, `worldfx.js`, `daylight.js` |
| HD-2D world (Medium and High graphics) | `hd2d.js` (worldDraw replacement), `hd2dgl.js` (WebGL layer), `config.js` 8 (HD2D) |
| weather and day/night | `world3.js` (tables, rolls, clock), `engine2.js` (WEATHER defs, battle weather), `p5trans.js` (blends), `weather7.js` (layers), `config.js` 6 and 8 |
| minimap, area map, world map | `map.js`, `visuals7.js` (drawMini); the connected world map and routes across maps `bigmap.js` (bmLayout, bmRoute, WS.route) |
| menus and shops | `menus3.js` (tabs, filters, Smithy, Alchemy, Tavern, Guild, Board), `ui.js` (vModal, mMenu, mChar), `ui2.js` (crafting, sort filters), `p3shop.js` (Best for party, Smithy plan "Upgrade whole party", the Upgrade button upgOpts/upgBest), `temper.js`, `equip.js`/`equip2.js`, CSS `menus3.css` |
| party, Best Party, loadouts, roster | `party2.js`, `p3shop.js` (scoring), `party3.js` (formations, Training team), `nav.js` (swaps), `tavern2.js` (journey roster, tavern tables), `progression.js` |
| companions and taming | `comp.js`, `comp2.js`, `engine2.js` (registerTamed), `v063prog.js` (Taming log) |
| quests, factions, guilds | `records12.js` (Notices tab: one list and one Claim all), `engine.js` (genQuests, claimQuest), `menus3.js` (the Notice Board: NB_TABS, nbBody, nbMenuBody), `factions.js` (FAC3: three ranks over six steps), `p4party.js` (personal quests by realm), `allq.js`, `qready.js` |
| companions and taming | `comp.js`, `comp2.js`, `comp3.js` (growth: second skill, evolution, TAME), `engine2.js` (registerTamed), `v063prog.js` (Taming log) |
| quests, factions, guilds | `engine.js` (genQuests, claimQuest), `factions.js`, `p4party.js` (personal quests by realm), `allq.js`, `qready.js` |
| saves and slots | `engine.js` (packG/unpackG, saveGame), `saves.js` (slots, backups, import/export, loadRaw), `gearmig.js` (old gear), `cloud.js` + `account.js` (accounts). Keys: `aurelis-wayfarers-v3` (+`-s1`, `-s2`), `aurelis-meta-v1`. Sync between devices (svMark, svFlush, svCheck/svDecide, svLeave, svGate, the newer save prompt; `aurelis-sync-v1`): `saves.js`, see `docs/v085-sync.md` |
| Daily Trial and twists | `engine2.js` (dailyGo, seeded RNG), `ui2.js` (screens), `twists.js`, `config.js` 9 |
| audio | `audio.js` (chiptune fallback), `audio2.js` (orchestral engine), `musicdata.js` (score), `music2.js` (wiring), `sfx2.js`, `ambience.js` |
| phone heat: frame limiter (idle 30 fps, menu 8, hidden 0), 2x internal pixel cap on phones | `perf12.js` (hooks on `loop`, `worldDraw`, `battleFrame`, `resPx`, `resBk`, `resStageR`; off under tests unless `window.__P12F`), test `v170a.js` |
| graphics tiers and settings | `gfx6.js` (GFX tiers; Low = Flat: `html.flat` keeps the style.css menus, ui3.css is scoped by the build), `p5settings.js`, `ui.js` settingsBody (wrapped by several modules) |
| page zoom on computers, Screen size row | `deskscale.js` (CSS zoom on html; `dsZoom()` in worldrt.js divides viewport measures) |
| keyboard mapping, the Keys screen | `keymap.js` (kmIs, kmLabel, META.keys), KEYDIR rebuilt from it |
| Sanctums (side forts) and their guardians as summons, Invoke and Spirit Call | `summon8.js` (SUM, G.summons, B.pray, B.sum) |
| board vs Guild Hall tabs, guild notices, town gated notices, arena Medals, the Guides tabs (Charts, Ailments, Boons, Boss gimmicks) | `guild7.js` |
| Records > Completion (Echo Rift block, every tracker per realm), account play time ledger, Notices tab, site tags on every arrival, Breach line | `records12.js` |
| a wild recruit asking where to stand (swap in or reserves) | `recruit3.js` (G.pendRecruit, the recruitAsk popup) |
| account totals across journeys | `metastats.js` (META.stats, hooks on finishBattle, win, newGame, openChest), shown in `journey.js` |
| onboarding, hints, What next? | `onboard.js` (tip cards), `goals.js` (Next goals panel), `p2world.js` (hints), `progression.js` (What next?), `pacing.js` (unlock timing; `pcUnlocked(system)`, PACE) |
| boss realm gimmicks (telegraphs, landings, answers) | `battle4.js` (b4Gim*), `BOSS_GIM` in `config.js` 3 |
| encounter rate, roamers on fields and in dungeons, ordinary fight rewards | `ENC_RATE`, `ENC`, `ROAM` in `config.js`; `worldrt.js` (arrive), `roam.js` |
| title screen | `title7.js`, `logo.js`, `ui.js` (title scene) |
| test hooks | `v3/shell.html` (`window.__A`), `p45hook.js`, the `window.__*` objects above |

## Modules in load order

Data and art
- `config.js` every tunable number (nine sections, contents at the top)
- `fbconfig.js` Firebase web config (do not edit) · `appver.js` generated by `build.sh`
- `data.js` GAME_VERSION, elements, type chart, reactions, statuses, attributes and class growth
- `heroes.js` hero roster (RAW, TPL), starters, legends, gifts · `skills.js` skills, Limit Breaks, bonds
- `items.js` items, materials, gear, weapon and armor rules, recipes · `foes.js` monsters, bosses, guardians
- `zones.js` realms, campaign stages, quests and bounties · `realmdata.js` the sixteen realms, overlays, Calamity effects
- `art.js` pixel engine, hero and monster sprites, flair, front and back views · `art2.js` hero races and sizes (heroCanvas, walkerCanvas) · `art3.js` 60x60 guardians · `sprhd.js` HD sprites

Core
- `engine.js` state (G, B, V, META), stats, saves, town services, quests, damage, the battle engine and auto battle
- `engine2.js` weather defs, personal quests and signature weapons, taming, the Daily Trial, save slots and export

World
- `worldgen.js` towns, fields, dungeons, validation, map assembly, the Archive · `world4.js` the connected world
- `worldgfx.js` tile themes and objects · `worldgfx2.js` dungeon tiles · `worldrt.js` overworld runtime and drawing · `bosstheme.js` stage look from its boss

Battle view, audio, UI
- `bg.js` battle backdrops · `battle.js` battle renderer (BL, units, particles, battleFrame)
- `audio.js` chiptune fallback, sfx, playMusic · `audio2.js` orchestral engine · `musicdata.js` the score
- `ui.js` render, screens, battle view, vModal, ACT, loop, input, boot · `ui2.js` Daily Trial screens, pad and touch, crafting, shop filters

Systems (v0.1 to v0.4)
- `natures.js` natures · `feedback.js` help and feedback · `account.js` account bestiary and codex · `legends.js` legendary heroes
- `progression.js` recruit fit, challenges, What next? · `tavern2.js` journey roster and tavern tables · `travel.js` travel items and ambushes
- `insight.js` matchups, quirks, bestiary perks · `battlefx.js` battle log, status icons · `nav.js` menu back and close, swaps
- `temper.js` tempering · `journey.js` Journey tab and stats · `stuck.js` Stuck? rescue · `polish.js` inn fade, reduced motion
- `towngfx.js` town look · `equip.js` equipment menu, Auto best gear, the Tamer's Stick · `equip2.js` Auto gear logic · `party2.js` party tools
- `gearmig.js` gear migration · `town2.js` Inn, bonds on the sheet, popup key guard · `offline.js` offline play · `describe.js` stat descriptions
- `world3.js` day and night, weather tables · `chance.js` chance meetings · `ceword.js` wayfarer voices · `factions.js` factions
- `mimic.js` mimics · `mapheal.js` path healing · `ailments.js` persistent ailments · `stsym.js` status symbols
- `echocore.js` echo rules, Echoforged · `echo2.js` echoes in the world · `sanctum.js` Echo Sanctum · `comp2.js` companion perks · `comp.js` companions
- `world12.js` (v0.18.7) town landmarks (`LM12`, the 'j' footprint tiles, drawn in 2D and HD-2D), node checks (`nodeIssues`/`nodeFix`, drawAudit.nodes), wild recruit spacing (`WREC` in config.js, `wrAllow`/`wrNote`), each realm's own Scourge (`REALMS` boss/alt in realmdata.js, newRun hook), no "(relit)" on the Breach; `echoName` in echocore.js names every Echo; `RIFT_COL` (realmdata.js) colours the Rift gates
- `monsters2.js` six new foes · `archetype.js` archetypes and delivery · `fx2.js` battle text · `learn.js` new skill notices · `prog2.js` auto rules
- `map.js` area map, minimap, world map · `anim.js` battle poses · `battleui.js` badges, cards, detail panel · `autoset.js` auto settings
- `shopfx.js` purchase feedback · `daylight.js` dusk and dawn · `starter.js` starter sheets and draw · `tiers.js` tier chips, Craft only
- `sigskills.js` signature skills · `npc2.js` NPC dialogue · `realms.js` realms logic · `roam.js` roamers · `sites.js` side sites, minibosses
- `rivals.js` rivals · `rivalghost.js` rivals waiting for a hero not in your six (see through, passable, the hint) · `sprites.js` item palettes · `capes.js` capes · `saves.js` save recovery and slots · `cloud.js` Firebase accounts
- `update.js` update prompt · `allq.js` Accept all / Claim all · `economy.js` ECON price pass

v0.4.5 to v0.6
- `p3shop.js` shops, gear and items (Best for party, Smithy plan, Best Party scoring) · `music2.js` music wiring, Music Room · `sfx2.js` layered sfx · `ambience.js` ambience
- `p4xp.js` XP catch up · `p4party.js` personal quests by realm, guild text, boss energy · `p5settings.js` settings, save indicator · `p5trans.js` smooth transitions
- `p45hook.js` test handles · `results.js` battle rewards screen · `p2world.js` backdrops from the terrain, ground plane, surprise starts, single/dual types, hints
- `gfx6.js` graphics tiers · `gfx6world.js` world life · `gfx6battle.js` battle presentation · `hdstage.js` HD-2D battle stage · `hdspell.js` HD-2D spells
- `menus3.js` shops and menus · `party3.js` Best Party formations · `v063prog.js` Taming log, bond goals, Make camp · `twists.js` twists
- `icons.js` / `icons2.js` code-drawn item icons · `worldfx.js` world-space ambience

v0.7
- `battle3.js` battle screen pass (labels, unitHud; v0.8.0: phone and Fold fit, compact foe list, damage type symbols `dlIco`) · `battle5.js` forecast, foe intents, timed hits · `battle4.js` detonation refund, free swap, Momentum, roles
- `remember.js` remember Auto and Run · `pacing.js` unlock pacing (v0.9.5: by realm, pcUnlocked) · `comp3.js` companion growth (v0.9.5) · `onboard.js` tip cards · `duellines.js` duel voices · `qready.js` quests ready
- `battle3.js` battle screen pass (labels, unitHud; v0.8.0: phone and Fold fit, compact foe list, damage type symbols `dlIco`); v0.9.5 section 9: key weakness `b9Key`, Expert battle info, damage groups `foeDg`, reaction moment `b9React` · `battle5.js` forecast, foe intents, timed hits · `battle4.js` detonation refund, free swap, Momentum, roles
- `remember.js` remember Auto and Run · `pacing.js` unlock pacing · `onboard.js` tip cards · `duellines.js` duel voices · `qready.js` quests ready
- `remember.js` remember Auto and Run · `pacing.js` unlock pacing (v0.9.5: by realm, pcUnlocked) · `comp3.js` companion growth (v0.9.5) · `onboard.js` tip cards · `goals.js` Next goals panel (v0.9.5 nudges) · `duellines.js` duel voices · `qready.js` quests ready
- `hd2dgl.js` HD-2D WebGL layer · `hd2d.js` HD-2D world renderer · `weather7.js` layered weather · `pathguard.js` path protection
- `sprhd2.js` HD sprite consumers · `logo.js` wordmark · `title7.js` title (v0.8.0: six wayfarers walking through the realms) · `visuals7.js` minimap tiles, victory crest, arena

v0.8
- `roles.js` class roles: secondary role skills and charms, chi heals, roleOut / roleTable / heroRoleSet (built right after `sigskills.js`)
- `skills12.js` (v0.19, loads last) Focus, the 12 skill kit and its guarantees, dual arts, role power (`sk12Role`, `sk12Mult`), `heroPrimeDet`; ends the `classSkills` hook chain
- `hd2dgl.js` HD-2D WebGL layer · `hd2d.js` HD-2D world renderer · `weather7.js` layered weather · `pathguard.js` path protection · `dungeon8.js` themed dungeons (materials, organic caverns), the boss lair on the field
- `sprhd2.js` HD sprite consumers · `logo.js` wordmark · `title7.js` HD-2D title · `visuals7.js` minimap tiles, victory crest, arena

CSS: `fonts.css`, `style.css`, `ui3.css` (v0.5.3 Gilded Night), `menus3.css`, `battle3.css`, `battle5.css`, `battle4.css`.
Shell: `shell.html` (page, `window.__A`), `liveboot.js` (Android live update boot), `sw.js` (service worker).

## Core functions and their hooks

Generated: `sh build.sh && node tools/hooksmap.js --write` rewrites the lists between the markers from the running game.
Each list is in registration (load) order, 1 next to the base; "Runs" is the order the parts run in (before parts from the
last registered to the first, then the base, then after parts from the first registered to the last; an around hook has both).
To add one see `docs/v099-hooks.md`.

<!-- hooksmap:start -->
### vModal (47 hooks)
Registered (load order; 1 is next to the base):
1. `stuck.js` before: Stuck? popup
2. `equip.js` before: eqPick, autoEq, equipNow popups
3. `party2.js` before: ldRes, ldMgr, bp, field popups
4. `gearmig.js` before: gmig popup (old gear)
5. `town2.js` before: wxinfo popup (weather, time of day)
6. `town2.js` before: Inn: rest anyway? and talks after a rest
7. `describe.js` before: statInfo popup
8. `chance.js` before: cev popup (chance meetings)
9. `factions.js` result: faction rank row on the shop popups
10. `ailments.js` before: battle guide popup
11. `ailments.js` before: battlelore popup
12. `echo2.js` before: echoAsk popup
13. `sanctum.js` before: portal popup
14. `comp.js` before: compPick popup
15. `comp.js` before: petPick popup
16. `map.js` before: map and worldmap popups
17. `autoset.js` before: autoset popup
18. `starter.js` before: starterSheet popup
19. `sites.js` before: miniboss ask
20. `saves.js` before: the save popups (slots, export, import, recover, sync)
21. `p3shop.js` before: bp and p3plan popups
22. `p3shop.js` result: menu: Holy Water and Pork Chop buttons
23. `p3shop.js` before: what you need popup
24. `p3shop.js` before: upg popup (the Upgrade button)
25. `p4party.js` result: guild text on every popup above it
26. `p4party.js` around: bossEnergy popup, energy line on the Legacy choice
27. `keymap.js` before: keys popup
28. `v063prog.js` before: camp and bonds popups
29. `twists.js` before: twist info popup
30. `recruit3.js` before: wild recruit popup
31. `bigmap.js` before: the connected world map
32. `duellines.js` result: duel lines on chance meetings, defeat and rival popups
33. `junk9.js` before: Sell junk confirm
34. `guidance9.js` before: goal guide popup
35. `guidance9.js` before: Hint log
36. `rift9.js` before: Echoforge anvil in the Rift
37. `riftkeeper9.js` before: Riftkeeper gate card, Warden rest
38. `riftkeeper9.js` result: Riftkeeper warning
39. `roles9.js` before: role picker
40. `endgame10.js` result: Breach row on the Waystone
41. `rk10.js` result: Riftkeeper naming
42. `econ11.js` before: confirm selling good gear
43. `fixes11.js` result: hide legendary class names
44. `arena11.js` result: Daily Trial reads Weekly Trial (changelog text untouched)
45. `menus11.js` before: Leave this journey? confirm
46. `menus11.js` result: the slot picker, opened from a journey: Load asks first, the open slot cannot be deleted
47. `world12.js` result: the landmark on each Waystone row

Runs: 45 menus11 → 42 econ11 → 39 roles9 → 37 riftkeeper9 → 36 rift9 → 35 guidance9 → 34 guidance9 → 33 junk9 → 31 bigmap → 30 recruit3 → 29 twists → 28 v063prog → 27 keymap → 26 p4party (around) → 24 p3shop → 23 p3shop → 21 p3shop → 20 saves → 19 sites → 18 starter → 17 autoset → 16 map → 15 comp → 14 comp → 13 sanctum → 12 echo2 → 11 ailments → 10 ailments → 8 chance → 7 describe → 6 town2 → 5 town2 → 4 gearmig → 3 party2 → 2 equip → 1 stuck → **base** → 9 factions (result) → 22 p3shop (result) → 25 p4party (result) → 26 p4party (around) → 32 duellines (result) → 38 riftkeeper9 (result) → 40 endgame10 (result) → 41 rk10 (result) → 43 fixes11 (result) → 44 arena11 (result) → 46 menus11 (result) → 47 world12 (result)

### win (32 hooks)
Registered (load order; 1 is next to the base):
1. `metastats.js` around: gold earned, boss wins, journey clears
2. `equip.js` around: new gear watch (queues new gear)
3. `mimic.js` around: mimic bonus gold, loot on the map
4. `echo2.js` around: Echo rewards (story Echo, Rift)
5. `sanctum.js` after: opens the Rift
6. `comp.js` before: companions step back
7. `learn.js` after: new skills on the result
8. `prog2.js` around: boss won by hand, auto per foe type opens
9. `p3shop.js` around: first boss Pork Chops
10. `p4xp.js` around: XP catch up (XPC)
11. `p4party.js` around: first boss energy
12. `results.js` around: reward screen data
13. `pacing.js` around: bonds stay closed until their realm
14. `comp3.js` around: companion growth (second skill, evolution)
15. `goals.js` after: goal counters from the fight
16. `guild7.js` after: arena Medals
17. `summon8.js` after: a beaten guardian becomes a summon
18. `summon8.js` before: the summon leaves
19. `handin9.js` around: bounty reward waits at the board
20. `bonds9.js` after: after-the-battle talks
21. `rift9.js` after: rift gate kill record
22. `rift9.js` after: rift win per journey
23. `riftkeeper9.js` around: Riftkeeper rewards
24. `arena9.js` after: arena rare purse and Pit perks
25. `charms9.js` after: Epic and Heroic charms from Echoes and the arena
26. `endgame10.js` after: Breach purse
27. `endgame10.js` after: Breach opens
28. `endgame10.js` after: open the seal to the Breach
29. `fixes11.js` before: pack snapshot for cap drops
30. `fixes11.js` after: cap XP and overflow drops to gold
31. `arena11.js` after: arena score and best per tier
32. `party12.js` after: bosses beaten

Runs: 29 fixes11 → 23 riftkeeper9 (around) → 19 handin9 (around) → 18 summon8 → 14 comp3 (around) → 13 pacing (around) → 12 results (around) → 11 p4party (around) → 10 p4xp (around) → 9 p3shop (around) → 8 prog2 (around) → 6 comp → 4 echo2 (around) → 3 mimic (around) → 2 equip (around) → 1 metastats (around) → **base** → 1 metastats (around) → 2 equip (around) → 3 mimic (around) → 4 echo2 (around) → 5 sanctum → 7 learn → 8 prog2 (around) → 9 p3shop (around) → 10 p4xp (around) → 11 p4party (around) → 12 results (around) → 13 pacing (around) → 14 comp3 (around) → 15 goals → 16 guild7 → 17 summon8 → 19 handin9 (around) → 20 bonds9 → 21 rift9 → 22 rift9 → 23 riftkeeper9 (around) → 24 arena9 → 25 charms9 → 26 endgame10 → 27 endgame10 → 28 endgame10 → 30 fixes11 → 31 arena11 → 32 party12

### render (26 hooks)
Registered (load order; 1 is next to the base):
1. `feedback.js` before: log screen and popup changes for bug reports
2. `equip.js` around: per-render fit cache (FITC)
3. `equip.js` before: open "Equip this now?" for queued new gear
4. `town2.js` after: focus Rest in the Inn
5. `town2.js` before: note the key that opened a popup (key guard)
6. `mimic.js` before: mimic loot after the fight, back on the map
7. `learn.js` after: queue new skill notices
8. `map.js` after: make sure the minimap exists (next frame)
9. `anim.js` around: popup open fade
10. `saves.js` after: save status icon
11. `p3shop.js` around: per-render Best Party cache (P3C)
12. `p4party.js` before: the boss's lingering energy popup
13. `gfx6.js` after: menu depth of field class
14. `menus3.js` after: keep dropdown focus
15. `v063prog.js` after: progression notes
16. `onboard.js` after: keep the tip card placed
17. `goals.js` after: Next goals panel
18. `recruit3.js` after: ask where a wild recruit stands
19. `qready.js` after: quests ready badge on the menu button
20. `guidance9.js` after: Log button on the tip card
21. `arena11.js` after: title button and battle chip say Weekly
22. `menus11.js` before: history: note the view change before the popup html is built (the back arrow needs the stack)
23. `menus11.js` after: history: a hook inside render may have opened a popup; restore the scroll of a view we went back to
24. `zoomfix11.js` after: zoom vars and page lock
25. `party12.js` before: reserves keep no gear (the sweep)
26. `skills12.js` after: one notice after an old save is trimmed

Runs: 25 party12 → 22 menus11 → 12 p4party → 11 p3shop (around) → 9 anim (around) → 6 mimic → 5 town2 → 3 equip → 2 equip (around) → 1 feedback → **base** → 2 equip (around) → 4 town2 → 7 learn → 8 map → 9 anim (around) → 10 saves → 11 p3shop (around) → 13 gfx6 → 14 menus3 → 15 v063prog → 16 onboard → 17 goals → 18 recruit3 → 19 qready → 20 guidance9 → 21 arena11 → 23 menus11 → 24 zoomfix11 → 26 skills12

### startBattle (26 hooks)
Registered (load order; 1 is next to the base):
1. `feedback.js` after: log the start
2. `travel.js` after: Ambush! banner
3. `metastats.js` after: battles started
4. `ailments.js` after: carry hero ailments in
5. `ailments.js` before: foe ailments (window.__ailFoes) first
6. `prog2.js` after: auto counters, boss auto lock
7. `map.js` before: keep the tap to walk through the fight
8. `realms.js` around: sync pools, Calamity effects, stage cleared flag
9. `p2world.js` before: backdrop from the terrain (spec.bg)
10. `p2world.js` before: surprise start: was the roamer still on patrol
11. `p2world.js` after: surprise start: the free round
12. `p2world.js` after: battle hint
13. `hdstage.js` before: reset the HD-2D stage lights
14. `v063prog.js` after: camp boon
15. `twists.js` after: twist waves, elites, Iron clamp
16. `battle5.js` after: plan every foe (foePlan)
17. `battle4.js` before: install the role, plan and gimmick hooks
18. `battle4.js` after: Momentum start, gimmick start, roles seen
19. `remember.js` before: remembered Auto
20. `bigmap.js` before: keep the route through the fight
21. `summon8.js` after: fresh battle
22. `dungeon8.js` before: realm dungeon material for the backdrop (spec.d8)
23. `look9.js` before: realm layout tileset for this journey
24. `riftkeeper9.js` after: Riftkeeper fight state
25. `breachlook11.js` after: tag a fight begun in the Breach for its backdrop (roamers too)
26. `party12.js` after: bosses faced

Runs: 23 look9 → 22 dungeon8 → 20 bigmap → 19 remember → 17 battle4 → 13 hdstage → 10 p2world → 9 p2world → 8 realms (around) → 7 map → 5 ailments → **base** → 1 feedback → 2 travel → 3 metastats → 4 ailments → 6 prog2 → 8 realms (around) → 11 p2world → 12 p2world → 14 v063prog → 15 twists → 16 battle5 → 18 battle4 → 21 summon8 → 24 riftkeeper9 → 25 breachlook11 → 26 party12

### finishBattle (25 hooks)
Registered (load order; 1 is next to the base):
1. `feedback.js` before: log the end
2. `account.js` after: codex and Archive sync
3. `progression.js` around: tavern reroll on a stage clear
4. `tavern2.js` around: tavern event on a stage clear
5. `battlefx.js` before: keep the last log lines
6. `journey.js` before: won/fled/lost stats
7. `metastats.js` after: won, fled and lost (journey fights)
8. `polish.js` after: fade in at the Inn after a wipe
9. `world3.js` before: clock ticks
10. `factions.js` around: faction credit
11. `ailments.js` before: ailments carried out
12. `comp.js` before: companions step back
13. `map.js` after: resume the tap to walk
14. `realms.js` around: overlay lifts on a first clear
15. `roam.js` around: beaten roamers
16. `sites.js` around: miniboss prizes
17. `music2.js` around: stage clear music
18. `results.js` before: when the last battle ended (V.endT)
19. `p2world.js` after: win hint
20. `v063prog.js` around: camp boon stats back
21. `goals.js` after: Next goals panel
22. `summon8.js` before: the summon leaves
23. `duellines.js` around: duel flee lines
24. `arena11.js` before: remember an arena fight
25. `world12.js` before: battles since the last wild recruit event

Runs: 25 world12 → 24 arena11 → 23 duellines (around) → 22 summon8 → 20 v063prog (around) → 18 results → 17 music2 (around) → 16 sites (around) → 15 roam (around) → 14 realms (around) → 12 comp → 11 ailments → 10 factions (around) → 9 world3 → 6 journey → 5 battlefx → 4 tavern2 (around) → 3 progression (around) → 1 feedback → **base** → 2 account → 3 progression (around) → 4 tavern2 (around) → 7 metastats → 8 polish → 10 factions (around) → 13 map → 14 realms (around) → 15 roam (around) → 16 sites (around) → 17 music2 (around) → 19 p2world → 20 v063prog (around) → 21 goals → 23 duellines (around)

### getMap (20 hooks)
Registered (load order; 1 is next to the base):
1. `zones.js` after: closed west gate names the real forward direction
2. `bosstheme.js` around: stage look from its boss (new maps)
3. `mapheal.js` around: path healing (new maps)
4. `realms.js` before: sync pools before a new map
5. `sites.js` around: sanctum maps; place the sanctum on its field
6. `p2world.js` around: town lanes, gathering spots on open tiles (new maps)
7. `pathguard.js` around: path protection (new maps)
8. `dungeon8.js` around: realm dungeon materials and organic caves (new maps)
9. `dungeon8.js` around: boss lair on the field (new maps)
10. `look9.js` before: realm layout tileset for this journey
11. `look9.js` around: realm look terrain on new fields
12. `endgame10.js` around: the Meridian Breach map
13. `endgame10.js` around: the Calamity field opens onto the Breach
14. `sanctlook10.js` around: sanctum look (after the dungeon material is set)
15. `sitelook10.js` around: lair mound: a low embankment under the realm front
16. `breach10.js` around: the Meridian Breach, its own islands in the void
17. `breachlook11.js` around: the Breach palette (m.thv)
18. `world12.js` around: nodes checked again once the map is healed
19. `townexit.js` around: new towns: nothing hides a gate
20. `world12.js` around: a landmark for every new town (after the exit pass)

Runs: 20 world12 (around) → 19 townexit (around) → 18 world12 (around) → 17 breachlook11 (around) → 16 breach10 (around) → 15 sitelook10 (around) → 14 sanctlook10 (around) → 13 endgame10 (around) → 12 endgame10 (around) → 11 look9 (around) → 10 look9 → 9 dungeon8 (around) → 8 dungeon8 (around) → 7 pathguard (around) → 6 p2world (around) → 5 sites (around) → 4 realms → 3 mapheal (around) → 2 bosstheme (around) → **base** → 1 zones → 2 bosstheme (around) → 3 mapheal (around) → 5 sites (around) → 6 p2world (around) → 7 pathguard (around) → 8 dungeon8 (around) → 9 dungeon8 (around) → 11 look9 (around) → 12 endgame10 (around) → 13 endgame10 (around) → 14 sanctlook10 (around) → 15 sitelook10 (around) → 16 breach10 (around) → 17 breachlook11 (around) → 18 world12 (around) → 19 townexit (around) → 20 world12 (around)

### settingsBody (16 hooks)
Registered (load order; 1 is next to the base):
1. `battleui.js` result: Single target skills row
2. `saves.js` around: Main menu row
3. `music2.js` around: Ambience, Music style, Credits rows
4. `p5settings.js` result: volume sliders replace the sound rows
5. `keymap.js` around: Keys row
6. `deskscale.js` around: Screen size row
7. `p2world.js` around: Hints row
8. `gfx6.js` around: Graphics row
9. `battle3.js` result: Expert battle info row
10. `battle3.js` result: Skill tags row
11. `battle5.js` result: Timed hits row
12. `onboard.js` around: Tips row
13. `hd2d.js` around: HD-2D world row
14. `guidance9.js` result: Hint log button
15. `res11.js` result: Render scale row after Graphics
16. `menus11.js` result: titled sections in order of convenience: Play, Display, Sound, Controls, Account and Saves, Help and Feedback, Danger zone

Runs: 13 hd2d (around) → 12 onboard (around) → 8 gfx6 (around) → 7 p2world (around) → 6 deskscale (around) → 5 keymap (around) → 3 music2 (around) → 2 saves (around) → **base** → 1 battleui (result) → 2 saves (around) → 3 music2 (around) → 4 p5settings (result) → 5 keymap (around) → 6 deskscale (around) → 7 p2world (around) → 8 gfx6 (around) → 9 battle3 (result) → 10 battle3 (result) → 11 battle5 (result) → 12 onboard (around) → 13 hd2d (around) → 14 guidance9 (result) → 15 res11 (result) → 16 menus11 (result)

### worldDraw (16 hooks)
Registered (load order; 1 is next to the base):
1. `legends.js` after: legend markers
2. `equip.js` after: the Tamer's Stick glow
3. `world3.js` after: night tint
4. `mimic.js` after: chest tells
5. `daylight.js` after: dusk and dawn
6. `roam.js` after: roamers
7. `p5trans.js` around: smooth transitions (sets TR)
8. `gfx6world.js` after: lighting and life
9. `worldfx.js` after: world-space ambience
10. `hd2d.js` around: Medium and High: the HD-2D scene instead of the 2D chain (falls back to it)
11. `dungeon8.js` after: boss lair entrance effects (2D)
12. `npcart9.js` before: record the world clock for the idle frames
13. `voidsky10.js` after: stars over the void sky band
14. `rk10.js` before: the keeper leaves and returns
15. `breachlook11.js` after: aurora over the Breach sky band
16. `perf12.js` before: idle frame limiter: a still world draws 30 fps on phones, 8 under a menu, nothing in a hidden tab

Runs: 16 perf12 → 14 rk10 → 12 npcart9 → 10 hd2d (around) → 7 p5trans (around) → **base** → 1 legends → 2 equip → 3 world3 → 4 mimic → 5 daylight → 6 roam → 7 p5trans (around) → 8 gfx6world → 9 worldfx → 10 hd2d (around) → 11 dungeon8 → 13 voidsky10 → 15 breachlook11

### perform (14 hooks)
Registered (load order; 1 is next to the base):
1. `ailments.js` around: hard cleanse flag for revive and cleanse skills
2. `archetype.js` around: heals hurt the undead
3. `prog2.js` around: hand and auto turn counters, goal counters
4. `anim.js` before: Limit Break pose time
5. `roles.js` around: chi heals use the role heal power
6. `atk6.js` around: typed basic attack by class
7. `natures6.js` around: chi heal nature perk
8. `twists.js` around: Iron clamp after every action
9. `battle4.js` around: boss gimmick answers
10. `chain5.js` before: Chain leaps
11. `chain5.js` before: a guarded planned hit makes the hero quick
12. `pacing.js` around: primers are plain hits until reactions open
13. `skills12.js` around: off role buffs last shorter
14. `skills12.js` around: dual arts prime both elements and set off both reactions; a second prime element can be set off

Runs: 14 skills12 (around) → 13 skills12 (around) → 12 pacing (around) → 11 chain5 → 10 chain5 → 9 battle4 (around) → 8 twists (around) → 7 natures6 (around) → 6 atk6 (around) → 5 roles (around) → 4 anim → 3 prog2 (around) → 2 archetype (around) → 1 ailments (around) → **base** → 1 ailments (around) → 2 archetype (around) → 3 prog2 (around) → 5 roles (around) → 6 atk6 (around) → 7 natures6 (around) → 8 twists (around) → 9 battle4 (around) → 12 pacing (around) → 13 skills12 (around) → 14 skills12 (around)

### calcDamage (13 hooks)
Registered (load order; 1 is next to the base):
1. `engine.js` after: pack frenzy, auto nerf on the acting hero
2. `insight.js` after: bestiary perk damage
3. `echocore.js` after: Echoforged boss and primed damage
4. `archetype.js` after: archetype delivery multiplier and its tag
5. `roles.js` after: ranged power, taunt defence (roles)
6. `natures6.js` result: nature and mastery perks on damage
7. `realms.js` after: Calamity element multipliers and burn
8. `twists.js` after: twist: weakness damage
9. `battle5.js` after: timed hit multiplier
10. `battle4.js` after: Momentum, Hex, guard cover
11. `battle4.js` after: boss gimmick damage
12. `riftkeeper9.js` after: phase 2 shield while shades live
13. `skills12.js` around: Focus adds crit chance for its turns (it no longer forces the next crit)

Runs: 13 skills12 (around) → **base** → 1 engine → 2 insight → 3 echocore → 4 archetype → 5 roles → 6 natures6 (result) → 7 realms → 8 twists → 9 battle5 → 10 battle4 → 11 battle4 → 12 riftkeeper9 → 13 skills12 (around)

### encounterFoes (13 hooks)
Registered (load order; 1 is next to the base):
1. `legends.js` before: legend fights
2. `travel.js` after: ambush: foes hit harder
3. `world3.js` around: night pool and night power on fields
4. `chance.js` before: duel foes
5. `mimic.js` before: the mimic
6. `echocore.js` before: story Echo and Rift Echo fights
7. `roam.js` around: roamer fights
8. `sites.js` around: miniboss fights
9. `p2world.js` around: single types in the first realm (p2SingleFoes)
10. `duellines.js` after: duel opening line
11. `riftkeeper9.js` before: the Riftkeeper fight
12. `endgame10.js` before: Breach fights
13. `endgame10.js` around: Breach roamer level

Runs: 13 endgame10 (around) → 12 endgame10 → 11 riftkeeper9 → 9 p2world (around) → 8 sites (around) → 7 roam (around) → 6 echocore → 5 mimic → 4 chance → 3 world3 (around) → 1 legends → **base** → 2 travel → 3 world3 (around) → 7 roam (around) → 8 sites (around) → 9 p2world (around) → 10 duellines → 13 endgame10 (around)

### newGame (11 hooks)
Registered (load order; 1 is next to the base):
1. `account.js` after: codex roster
2. `progression.js` after: draw the 5 guild recruits for this journey
3. `tavern2.js` after: journey roster and tavern reset
4. `metastats.js` after: new journey counted (not the Daily Trial start)
5. `prog2.js` after: auto per foe type starts closed
6. `map.js` before: forget the explored map
7. `pacing.js` after: pacing version on a new journey
8. `goals.js` after: goals start empty
9. `look9.js` after: realm layout tileset for this journey
10. `party12.js` before: close the record of the journey that ends
11. `party12.js` after: keep the New Game+ draw, record the playthrough

Runs: 10 party12 → 6 map → **base** → 1 account → 2 progression → 3 tavern2 → 4 metastats → 5 prog2 → 7 pacing → 8 goals → 9 look9 → 11 party12

### arrive (9 hooks)
Registered (load order; 1 is next to the base):
1. `journey.js` before: step count
2. `metastats.js` before: lifetime steps
3. `world3.js` before: clock ticks
4. `chance.js` after: chance meeting step
5. `ailments.js` after: out of battle poison
6. `map.js` after: reveal around, redraw the minimap
7. `field9.js` around: step counters, lure, the song
8. `party12.js` after: realms visited
9. `world12.js` after: steps since the last wild recruit event

Runs: 7 field9 (around) → 3 world3 → 2 metastats → 1 journey → **base** → 4 chance → 5 ailments → 6 map → 7 field9 (around) → 8 party12 → 9 world12

### battleFrame (9 hooks)
Registered (load order; 1 is next to the base):
1. `anim.js` before: no shake when still
2. `gfx6battle.js` around: camera, parallax, vignette
3. `hdstage.js` around: GL stage frame
4. `hdspell.js` before: Limit Break spotlight
5. `sprhd2.js` before: supersample the battle canvas
6. `battle11.js` around: foe size scaling on
7. `res11.js` before: resolution of the battle canvas
8. `fxkind11.js` before: hit stop and lingering looks
9. `perf12.js` before: idle frame limiter: a waiting battle draws 30 fps on phones, 8 under a menu, nothing in a hidden tab

Runs: 9 perf12 → 8 fxkind11 → 7 res11 → 6 battle11 (around) → 5 sprhd2 → 4 hdspell → 3 hdstage (around) → 2 gfx6battle (around) → 1 anim → **base** → 2 gfx6battle (around) → 3 hdstage (around) → 6 battle11 (around)

### cmdHtml (9 hooks)
Registered (load order; 1 is next to the base):
1. `battle3.js` result: tall layout: HP/MP bars and the auto note in the command head
2. `battle5.js` result: cue and glow on the command menu
3. `battle4.js` result: swap menu body and free swap label
4. `summon8.js` around: summons menu and Invoke button
5. `battle9.js` result: one Summon button
6. `skillfilt9.js` result: skill filter chips
7. `battle11.js` result: command head without the HP/MP mini bars
8. `skillrows11.js` result: skill numbers on the battle skill list
9. `skills12.js` result: role tier on the battle skill rows

Runs: 4 summon8 (around) → **base** → 1 battle3 (result) → 2 battle5 (result) → 3 battle4 (result) → 4 summon8 (around) → 5 battle9 (result) → 6 skillfilt9 (result) → 7 battle11 (result) → 8 skillrows11 (result) → 9 skills12 (result)

### mChar (9 hooks)
Registered (load order; 1 is next to the base):
1. `comp.js` result: Pet row on the hero sheet
2. `learn.js` around: New badges on the hero sheet skills
3. `p3shop.js` result: Upgrade button on each equipment slot
4. `p4party.js` result: Battles together line
5. `roles9.js` result: role row on the hero sheet
6. `sheet11.js` result: hero sheet tabs
7. `skillrows11.js` result: skill numbers on the hero sheet rows
8. `party12.js` result: reserve sheet: gear slots are read only
9. `skills12.js` result: role power on the hero sheet skill rows

Runs: 2 learn (around) → **base** → 1 comp (result) → 2 learn (around) → 3 p3shop (result) → 4 p4party (result) → 5 roles9 (result) → 6 sheet11 (result) → 7 skillrows11 (result) → 8 party12 (result) → 9 skills12 (result)

### renderBattle (9 hooks)
Registered (load order; 1 is next to the base):
1. `battleui.js` after: boss bar removed
2. `battle3.js` after: fit the target tags
3. `battle3.js` after: tall layout: bottom panel back to the top on a new turn
4. `battle3.js` after: fit check once the whole render has run (microtask)
5. `battle3.js` before: Expert battle info class (b9x)
6. `battle5.js` after: forecast bar fit
7. `battle4.js` around: gimmick sync before, Momentum bar after
8. `chain5.js` after: planned targets on the intent tags and the party cards
9. `summon8.js` after: praying badge

Runs: 7 battle4 (around) → 5 battle3 → **base** → 1 battleui → 2 battle3 → 3 battle3 → 4 battle3 → 6 battle5 → 7 battle4 (around) → 8 chain5 → 9 summon8

### calcStats (8 hooks)
Registered (load order; 1 is next to the base):
1. `ailments.js` after: wound shrinks max HP
2. `echocore.js` after: Echoforged weapon perks
3. `comp.js` after: paired pet stat bonus
4. `roles.js` after: charm perks
5. `natures6.js` after: nature and mastery stat perks
6. `riftkeeper9.js` after: Riftwalker key perks
7. `roles9.js` after: faith perks
8. `echo11.js` after: Echoforged weapon and armour perks

Runs: **base** → 1 ailments → 2 echocore → 3 comp → 4 roles → 5 natures6 → 6 riftkeeper9 → 7 roles9 → 8 echo11

### placeAt (8 hooks)
Registered (load order; 1 is next to the base):
1. `legends.js` after: Jaeson's storm
2. `progression.js` after: places been
3. `stuck.js` around: Stuck? return point
4. `world3.js` around: weather on arrival
5. `map.js` after: reveal around, redraw the minimap
6. `map.js` before: stop tap to walk
7. `bigmap.js` after: next leg of a route
8. `field9.js` after: Lantern ends on another map

Runs: 6 map → 4 world3 (around) → 3 stuck (around) → **base** → 1 legends → 2 progression → 3 stuck (around) → 4 world3 (around) → 5 map → 7 bigmap → 8 field9

### unpackG (8 hooks)
Registered (load order; 1 is next to the base):
1. `tavern2.js` after: journey roster subset
2. `comp.js` after: migrate companions
3. `learn.js` after: record skills of loaded heroes
4. `prog2.js` after: old saves: bosses won
5. `map.js` before: forget the explored map
6. `summon8.js` after: old saves: beaten guardians become summons
7. `party12.js` after: migrate: reserves keep no gear
8. `skills12.js` after: trim old saves to the capped kit

Runs: 5 map → **base** → 1 tavern2 → 2 comp → 3 learn → 4 prog2 → 6 summon8 → 7 party12 → 8 skills12

### hdActors (7 hooks)
Registered (load order; 1 is next to the base):
1. `worldfx.js` after: opening chests in HD-2D
2. `dungeon8.js` after: lair glow, torches and plume in HD-2D
3. `guidance9.js` after: guild door marker in HD-2D
4. `npcmark9.js` after: quest markers over NPCs in HD-2D
5. `npcart9.js` before: record the clock for the idle frames
6. `echo11.js` after: the Echoforge in HD-2D
7. `world12.js` after: the town landmark in HD-2D

Runs: 5 npcart9 → **base** → 1 worldfx → 2 dungeon8 → 3 guidance9 → 4 npcmark9 → 6 echo11 → 7 world12

### onFx (7 hooks)
Registered (load order; 1 is next to the base):
1. `anim.js` around: heal and buff popup shapes
2. `sfx2.js` before: hit element and popup sounds
3. `gfx6battle.js` after: camera push and impact frame
4. `hdspell.js` around: HD-2D popup lights
5. `fxkind11.js` after: poison, burn and bleed tick looks
6. `fxkind11.js` around: which blow this popup is
7. `fxkind11.js` after: foe telegraph and wind-up looks

Runs: 6 fxkind11 (around) → 4 hdspell (around) → 2 sfx2 → 1 anim (around) → **base** → 1 anim (around) → 3 gfx6battle → 4 hdspell (around) → 5 fxkind11 → 6 fxkind11 (around) → 7 fxkind11

### doReaction (6 hooks)
Registered (load order; 1 is next to the base):
1. `prog2.js` after: count reactions
2. `twists.js` after: twist: stronger reactions
3. `battle3.js` around: reaction icons on the effect entry
4. `battle4.js` after: detonator MP gain
5. `battle4.js` after: drop the reaction float during the ban
6. `skills12.js` around: a dual art sets off the reaction of each of its elements

Runs: 6 skills12 (around) → 3 battle3 (around) → **base** → 1 prog2 → 2 twists → 3 battle3 (around) → 4 battle4 → 5 battle4 → 6 skills12 (around)

### drawObjects (6 hooks)
Registered (load order; 1 is next to the base):
1. `worldgfx2.js` around: dungeon props, contact shadows, boards and boats
2. `p2world.js` around: entrance style context (P2.dm)
3. `dungeon8.js` around: lair hill, pillar glow lights
4. `sanctlook10.js` around: sanctum prop context (SNCX.dm)
5. `sitelook10.js` around: lair sprite over the props
6. `breachlook11.js` around: Breach prop context (BRL.dm)

Runs: 6 breachlook11 (around) → 5 sitelook10 (around) → 4 sanctlook10 (around) → 3 dungeon8 (around) → 2 p2world (around) → 1 worldgfx2 (around) → **base** → 1 worldgfx2 (around) → 2 p2world (around) → 3 dungeon8 (around) → 4 sanctlook10 (around) → 5 sitelook10 (around) → 6 breachlook11 (around)

### mMenu (6 hooks)
Registered (load order; 1 is next to the base):
1. `music2.js` around: Music Room tab
2. `p5settings.js` result: menu title, save pin and version
3. `p2world.js` around: Hints tab
4. `menus3.js` before: old fmis tab opens Guilds
5. `onboard.js` around: System Guide tab
6. `guild7.js` around: guide bodies on the menu tabs

Runs: 6 guild7 (around) → 5 onboard (around) → 4 menus3 → 3 p2world (around) → 1 music2 (around) → **base** → 1 music2 (around) → 2 p5settings (result) → 3 p2world (around) → 5 onboard (around) → 6 guild7 (around)

### objCanvas (6 hooks)
Registered (load order; 1 is next to the base):
1. `worldgfx2.js` before: scene props through paintP
2. `worldfx.js` before: the opened chest is gone
3. `dungeon8.js` before: themed pillars and graves
4. `look9.js` around: look sprites for trees and bushes
5. `sanctlook10.js` before: sanctum pillars and lanterns
6. `breachlook11.js` around: Breach props

Runs: 6 breachlook11 (around) → 5 sanctlook10 → 4 look9 (around) → 3 dungeon8 → 2 worldfx → 1 worldgfx2 → **base** → 4 look9 (around) → 6 breachlook11 (around)

### openChest (6 hooks)
Registered (load order; 1 is next to the base):
1. `metastats.js` around: chests opened
2. `equip.js` around: new gear watch (queues new gear)
3. `mimic.js` before: a mimic in the chest
4. `sites.js` before: cave reward chests
5. `sites.js` before: prize chest waits for the miniboss
6. `worldfx.js` around: chest opening sparkle

Runs: 6 worldfx (around) → 5 sites → 4 sites → 3 mimic → 2 equip (around) → 1 metastats (around) → **base** → 1 metastats (around) → 2 equip (around) → 6 worldfx (around)

### recruit (6 hooks)
Registered (load order; 1 is next to the base):
1. `account.js` after: codex entry for a recruit
2. `tavern2.js` after: recruit joins the subset
3. `tavern2.js` around: recruit count per stage
4. `metastats.js` around: recruit count
5. `music2.js` after: recruit jingle
6. `recruit3.js` around: ask where a wild recruit stands

Runs: 6 recruit3 (around) → 4 metastats (around) → 3 tavern2 (around) → **base** → 1 account → 2 tavern2 → 3 tavern2 (around) → 4 metastats (around) → 5 music2 → 6 recruit3 (around)

### showLocation (6 hooks)
Registered (load order; 1 is next to the base):
1. `feedback.js` after: log the arrival
2. `p2world.js` after: location hints
3. `pacing.js` after: news on arriving in town
4. `complete9.js` after: site kind in the location name
5. `records12.js` after: Den, Lair and Sanctum tags on every arrival; the Meridian Breach line and its first-visit description
6. `world12.js` after: no (relit) on the Meridian Breach

Runs: **base** → 1 feedback → 2 p2world → 3 pacing → 4 complete9 → 5 records12 → 6 world12

### spriteOf (6 hooks)
Registered (load order; 1 is next to the base):
1. `hdstage.js` before: remember the unit being lit
2. `battle3.js` result: small battle sprites
3. `heropose9.js` result: hero pose frames
4. `anim10.js` result: all-foe slash spin
5. `scale10.js` around: battle sprite scale
6. `battle11.js` around: foe size scaling on

Runs: 6 battle11 (around) → 5 scale10 (around) → 1 hdstage → **base** → 2 battle3 (result) → 3 heropose9 (result) → 4 anim10 (result) → 5 scale10 (around) → 6 battle11 (around)

### addSt (5 hooks)
Registered (load order; 1 is next to the base):
1. `insight.js` before: immune foes shrug off a status
2. `ailments.js` around: wound becomes an ailment
3. `comp2.js` before: a pet wards off a status
4. `twists.js` around: twist: statuses linger
5. `roles9.js` before: faith shrugs off a status

Runs: 5 roles9 → 4 twists (around) → 3 comp2 → 2 ailments (around) → 1 insight → **base** → 2 ailments (around) → 4 twists (around)

### applyBossTheme (5 hooks)
Registered (load order; 1 is next to the base):
1. `realms.js` around: realm look, cleared maps relit
2. `sites.js` after: cave and fort variants
3. `dungeon8.js` after: dungeon look
4. `sanctlook10.js` after: sanctum look
5. `breachlook11.js` after: the Breach palette

Runs: 1 realms (around) → **base** → 1 realms (around) → 2 sites → 3 dungeon8 → 4 sanctlook10 → 5 breachlook11

### battleTheme (5 hooks)
Registered (load order; 1 is next to the base):
1. `echo2.js` around: story echo backdrop
2. `p2world.js` result: stage theme from the fight spec
3. `dungeon8.js` result: dungeon backdrop key
4. `riftkeeper9.js` around: Riftkeeper backdrop
5. `breachlook11.js` result: Breach backdrop

Runs: 4 riftkeeper9 (around) → 1 echo2 (around) → **base** → 1 echo2 (around) → 2 p2world (result) → 3 dungeon8 (result) → 4 riftkeeper9 (around) → 5 breachlook11 (result)

### drawParts (5 hooks)
Registered (load order; 1 is next to the base):
1. `anim.js` before: arrow and note particles
2. `anim.js` after: element shapes and tint
3. `gfx6battle.js` after: new particle kinds and orbs
4. `hdspell.js` after: HD-2D particle kinds
5. `fxkind11.js` after: kind particles

Runs: 1 anim → **base** → 2 anim → 3 gfx6battle → 4 hdspell → 5 fxkind11

### genQuests (5 hooks)
Registered (load order; 1 is next to the base):
1. `legends.js` after: legend quests
2. `equip.js` after: the Tamer's Stick quest
3. `realms.js` around: realm quests (pools, rival)
4. `pacing.js` after: Tamer quest step for the pacing
5. `guild7.js` after: notices that need the Guild Hall

Runs: 3 realms (around) → **base** → 1 legends → 2 equip → 3 realms (around) → 4 pacing → 5 guild7

### makeEnemy (5 hooks)
Registered (load order; 1 is next to the base):
1. `insight.js` after: foe quirks
2. `archetype.js` after: foe types
3. `twists.js` after: twist: foes hit harder
4. `battle4.js` after: foe roles
5. `rift9.js` around: rift boss level

Runs: 5 rift9 (around) → **base** → 1 insight → 2 archetype → 3 twists → 4 battle4 → 5 rift9 (around)

### mapMarks (5 hooks)
Registered (load order; 1 is next to the base):
1. `sanctum.js` after: Echo gate markers
2. `dungeon8.js` after: lair markers
3. `complete9.js` after: done flag on site markers
4. `handin9.js` after: quest targets before their tile is seen
5. `rift9.js` after: the anvil legend marker

Runs: **base** → 1 sanctum → 2 dungeon8 → 3 complete9 → 4 handin9 → 5 rift9

### modalBack (5 hooks)
Registered (load order; 1 is next to the base):
1. `comp.js` around: pet popups go back to where they were opened
2. `recruit3.js` before: recruit prompt popup goes back to the ask
3. `bigmap.js` before: big map and world map back targets
4. `menus9.js` before: world map opened from the menu goes back to it
5. `menus11.js` before: back goes through the history

Runs: 5 menus11 → 4 menus9 → 3 bigmap → 2 recruit3 → 1 comp (around) → **base** → 1 comp (around)

### onAction (5 hooks)
Registered (load order; 1 is next to the base):
1. `anim.js` after: physical, magic and heal shapes
2. `anim.js` after: limit break flash
3. `sfx2.js` before: weapon and element context
4. `hdspell.js` after: HD-2D caster circle
5. `fxkind11.js` around: kind looks of an action

Runs: 5 fxkind11 (around) → 3 sfx2 → **base** → 1 anim → 2 anim → 4 hdspell → 5 fxkind11 (around)

### restAll (5 hooks)
Registered (load order; 1 is next to the base):
1. `progression.js` after: new tavern visitors after a rest
2. `tavern2.js` after: tavern event after a rest
3. `world3.js` after: morning after a rest
4. `ailments.js` after: the inn clears ailments
5. `twists.js` around: twist: cold inns

Runs: 5 twists (around) → **base** → 1 progression → 2 tavern2 → 3 world3 → 4 ailments → 5 twists (around)

### scan (5 hooks)
Registered (load order; 1 is next to the base):
1. `prog2.js` after: scan unlocks auto
2. `battle3.js` after: foe type line
3. `battle4.js` around: party action and role line
4. `battle4.js` around: realm gimmick reveal
5. `goals.js` after: scan goal

Runs: 4 battle4 (around) → 3 battle4 (around) → **base** → 1 prog2 → 2 battle3 → 3 battle4 (around) → 4 battle4 (around) → 5 goals

### vSwap (5 hooks)
Registered (load order; 1 is next to the base):
1. `p3shop.js` result: team check under the Party grid
2. `menus3.js` result: Equip Best button on the Party tab
3. `v063prog.js` result: Bonds and Make camp on the Party tab
4. `equipbtn10.js` result: Equip button beside each Sheet button
5. `party12.js` result: Equip Best offer for heroes in the six with empty weapon or armor slots

Runs: **base** → 1 p3shop (result) → 2 menus3 (result) → 3 v063prog (result) → 4 equipbtn10 (result) → 5 party12 (result)

### bestAll (4 hooks)
Registered (load order; 1 is next to the base):
1. `world3.js` result: night variants under their realm
2. `mimic.js` result: Mimics with the dungeon oddities
3. `echo2.js` result: echo forms are their own entries
4. `realms.js` result: realm oddities in the Bestiary

Runs: **base** → 1 world3 (result) → 2 mimic (result) → 3 echo2 (result) → 4 realms (result)

### burstAt (4 hooks)
Registered (load order; 1 is next to the base):
1. `anim.js` after: element or physical hit shape
2. `gfx6battle.js` after: richer elemental hits
3. `hdspell.js` after: HD-2D hit shapes
4. `fxkind11.js` around: class look of a blow, spell signature

Runs: 4 fxkind11 (around) → **base** → 1 anim → 2 gfx6battle → 3 hdspell → 4 fxkind11 (around)

### checkPhase (4 hooks)
Registered (load order; 1 is next to the base):
1. `echocore.js` around: second boss phase
2. `anim.js` around: boss phase burst
3. `sfx2.js` around: phase sound
4. `riftkeeper9.js` after: keeper phase sync

Runs: 3 sfx2 (around) → 2 anim (around) → 1 echocore (around) → **base** → 1 echocore (around) → 2 anim (around) → 3 sfx2 (around) → 4 riftkeeper9

### classSkills (4 hooks)
Registered (load order; 1 is next to the base):
1. `archetype.js` result: tag every skill with its damage kind once
2. `sigskills.js` result: the wayfarer's signature skill and element flavour
3. `roles.js` result: secondary role skills and adjustments
4. `skills12.js` result: the 12 skill kit, dual type primers and detonators, dual art kind (last hook: sees the finished list)

Runs: **base** → 1 archetype (result) → 2 sigskills (result) → 3 roles (result) → 4 skills12 (result)

### drawPortal (4 hooks)
Registered (load order; 1 is next to the base):
1. `rift9.js` around: anvil, won glow, Calamity arch
2. `rift9.js` around: gate card reads the journey view of the Echo records
3. `riftkeeper9.js` around: the Riftkeeper's gate
4. `echo11.js` around: the Echoforge landmark

Runs: 4 echo11 (around) → 3 riftkeeper9 (around) → 2 rift9 (around) → 1 rift9 (around) → **base** → 1 rift9 (around) → 2 rift9 (around) → 3 riftkeeper9 (around) → 4 echo11 (around)

### drawTile (4 hooks)
Registered (load order; 1 is next to the base):
1. `worldfx.js` around: ground under a gone chest
2. `dungeon8.js` around: lair mound ground in 2D
3. `sitelook10.js` after: den and lair ground, cast shadows
4. `breachlook11.js` after: Breach tiles

Runs: 2 dungeon8 (around) → 1 worldfx (around) → **base** → 1 worldfx (around) → 2 dungeon8 (around) → 3 sitelook10 → 4 breachlook11

### fallen (4 hooks)
Registered (load order; 1 is next to the base):
1. `comp.js` before: a pet leaves instead of falling
2. `twists.js` after: twist: ironman downed list
3. `summon8.js` before: a summon is driven off instead of falling
4. `riftkeeper9.js` around: shades are no Echo kills

Runs: 4 riftkeeper9 (around) → 3 summon8 → 1 comp → **base** → 2 twists → 4 riftkeeper9 (around)

### gearDesc (4 hooks)
Registered (load order; 1 is next to the base):
1. `echo2.js` result: Echoforge perk text
2. `archetype.js` result: weapon delivery text
3. `roles.js` result: charm role text
4. `riftkeeper9.js` result: Riftwalker key text

Runs: **base** → 1 echo2 (result) → 2 archetype (result) → 3 roles (result) → 4 riftkeeper9 (result)

### hdLook (4 hooks)
Registered (load order; 1 is next to the base):
1. `weather7.js` after: weather grade
2. `sanctlook10.js` after: pale stone grade
3. `voidsky10.js` after: void fog
4. `breachlook11.js` after: Breach fog and grade

Runs: **base** → 1 weather7 → 2 sanctlook10 → 3 voidsky10 → 4 breachlook11

### layoutBattle (4 hooks)
Registered (load order; 1 is next to the base):
1. `gfx6battle.js` after: reset camera transform
2. `hdstage.js` after: place the GL canvas
3. `sprhd2.js` after: supersample the battle canvas
4. `res11.js` after: resolution of the battle canvas

Runs: **base** → 1 gfx6battle → 2 hdstage → 3 sprhd2 → 4 res11

### mBeast (4 hooks)
Registered (load order; 1 is next to the base):
1. `echo2.js` result: Echo note on echo entries
2. `archetype.js` result: Type section on the Bestiary card
3. `p3shop.js` result: Ready check on boss entries
4. `battle4.js` result: Role line on the Bestiary card

Runs: **base** → 1 echo2 (result) → 2 archetype (result) → 3 p3shop (result) → 4 battle4 (result)

### newRun (4 hooks)
Registered (load order; 1 is next to the base):
1. `realms.js` result: draw the journey's realms (seeded)
2. `look9.js` result: new journeys carry tv 2 (the v0.13 look)
3. `party12.js` result: New Game+ draws realms and bosses not seen yet
4. `world12.js` result: each realm brings its own Scourge (a Calamity in its Calamity realm)

Runs: **base** → 1 realms (result) → 2 look9 (result) → 3 party12 (result) → 4 world12 (result)

### vFacMissions (4 hooks)
Registered (load order; 1 is next to the base):
1. `allq.js` result: accept all and claim all bar
2. `p4party.js` result: guild text
3. `pacing.js` result: guild missions lock note
4. `pacing.js` result: guild missions lock note (gated pacing)

Runs: **base** → 1 allq (result) → 2 p4party (result) → 3 pacing (result) → 4 pacing (result)

### vJourney (4 hooks)
Registered (load order; 1 is next to the base):
1. `saves.js` result: Sync button and save bar row
2. `twists.js` result: active modifiers list
3. `complete9.js` result: Realms section
4. `arena11.js` result: Arena medals row

Runs: **base** → 1 saves (result) → 2 twists (result) → 3 complete9 (result) → 4 arena11 (result)

### wkwUpdate (4 hooks)
Registered (load order; 1 is next to the base):
1. `world3.js` after: time of day chip
2. `map.js` around: keep the minimap; log HUD errors
3. `p3shop.js` before: Holy Water reapply
4. `field9.js` after: field skill chips

Runs: 3 p3shop → 2 map (around) → **base** → 1 world3 → 2 map (around) → 4 field9

### worldTick (4 hooks)
Registered (load order; 1 is next to the base):
1. `map.js` before: stop tap to walk under a menu or dialog
2. `map.js` before: resume a pending walk
3. `roam.js` after: roamers spawn and move
4. `bigmap.js` before: route legs

Runs: 4 bigmap → 2 map → 1 map → **base** → 3 roam

### actorTalk (3 hooks)
Registered (load order; 1 is next to the base):
1. `legends.js` before: legend talk
2. `legends.js` before: a challenger that is not ready answers
3. `sites.js` before: talk to the miniboss

Runs: 3 sites → 2 legends → 1 legends → **base**

### enemyTurn0 (3 hooks)
Registered (load order; 1 is next to the base):
1. `battle4.js` around: foe role turn
2. `chain5.js` before: remember the plan a foe acts on
3. `riftkeeper9.js` around: Riftkeeper turn

Runs: 3 riftkeeper9 (around) → 2 chain5 → 1 battle4 (around) → **base** → 1 battle4 (around) → 3 riftkeeper9 (around)

### dynActors (2 hooks)
Registered (load order; 1 is next to the base):
1. `legends.js` result: legend quest actors
2. `sites.js` result: field actors off walls, the miniboss waits at the end

Runs: **base** → 1 legends (result) → 2 sites (result)

### mPortal (2 hooks)
Registered (load order; 1 is next to the base):
1. `rift9.js` result: the gate card says it is beaten
2. `rift9.js` around: gate card reads the journey view of the Echo records

Runs: 2 rift9 (around) → **base** → 1 rift9 (result) → 2 rift9 (around)

### accOf (1 hook)
Registered (load order; 1 is next to the base):
1. `art2.js` result: eye patches, scarves and earrings are rarer

Runs: **base** → 1 art2 (result)

### ACT.campOpen (1 hook)
Registered (load order; 1 is next to the base):
1. `v063prog.js` after: no Supplies but a Tent: pick the Tent

Runs: **base** → 1 v063prog

### ACT.resultOk (1 hook)
Registered (load order; 1 is next to the base):
1. `arena11.js` around: back to the arena page

Runs: 1 arena11 (around) → **base** → 1 arena11 (around)

### addXp (1 hook)
Registered (load order; 1 is next to the base):
1. `p4xp.js` before: at the level cap, XP becomes gold

Runs: 1 p4xp → **base**

### askBoss (1 hook)
Registered (load order; 1 is next to the base):
1. `sites.js` before: a den asks the miniboss

Runs: 1 sites → **base**

### b9BanBox (1 hook)
Registered (load order; 1 is next to the base):
1. `battle3.js` around: box measured with the MP text

Runs: 1 battle3 (around) → **base** → 1 battle3 (around)

### b9RxHtml (1 hook)
Registered (load order; 1 is next to the base):
1. `battle3.js` result: the banner carries the MP line

Runs: **base** → 1 battle3 (result)

### caveRecruitPool (1 hook)
Registered (load order; 1 is next to the base):
1. `world12.js` result: spacing and dual types for cave and keep recruits

Runs: **base** → 1 world12 (result)

### caveReward (1 hook)
Registered (load order; 1 is next to the base):
1. `world12.js` around: a cave prize that is a wayfarer follows the spacing

Runs: 1 world12 (around) → **base** → 1 world12 (around)

### cePick (1 hook)
Registered (load order; 1 is next to the base):
1. `world12.js` around: dual type wayfarers turn up in the later realms

Runs: 1 world12 (around) → **base** → 1 world12 (around)

### ceStart (1 hook)
Registered (load order; 1 is next to the base):
1. `world12.js` after: a chance meeting counts as a wild recruit event

Runs: **base** → 1 world12

### ceStep (1 hook)
Registered (load order; 1 is next to the base):
1. `world12.js` before: chance meetings wait for the spacing and the realm budget

Runs: 1 world12 → **base**

### drawAudit (1 hook)
Registered (load order; 1 is next to the base):
1. `world12.js` result: landmark footprints draw; nodes are checked

Runs: **base** → 1 world12 (result)

### fortReward (1 hook)
Registered (load order; 1 is next to the base):
1. `world12.js` around: the keep cells follow the spacing

Runs: 1 world12 (around) → **base** → 1 world12 (around)

### guard (1 hook)
Registered (load order; 1 is next to the base):
1. `goals.js` before: a Guard under a foe telegraph counts for the goal

Runs: 1 goals → **base**

### interact (1 hook)
Registered (load order; 1 is next to the base):
1. `world12.js` before: facing a landmark reads its line

Runs: 1 world12 → **base**

### loop (1 hook)
Registered (load order; 1 is next to the base):
1. `perf12.js` around: marks the frames the game loop draws (the limiter skips only those, never a direct call)

Runs: 1 perf12 (around) → **base** → 1 perf12 (around)

### mCamp (1 hook)
Registered (load order; 1 is next to the base):
1. `v063prog.js` result: a Use row: Camp Supplies or a Tent

Runs: **base** → 1 v063prog (result)

### metaBlock (1 hook)
Registered (load order; 1 is next to the base):
1. `records12.js` result: both play times in the account block

Runs: **base** → 1 records12 (result)

### msTick (1 hook)
Registered (load order; 1 is next to the base):
1. `records12.js` around: a journey adds its own play time to the account (the ledger), a Daily Trial counts its ticks

Runs: 1 records12 (around) → **base** → 1 records12 (around)

### nbBody (1 hook)
Registered (load order; 1 is next to the base):
1. `records12.js` before: all-notices tab body

Runs: 1 records12 → **base**

### nbMenuBody (1 hook)
Registered (load order; 1 is next to the base):
1. `records12.js` before: Records > Completion

Runs: 1 records12 → **base**

### nbSecs (1 hook)
Registered (load order; 1 is next to the base):
1. `records12.js` result: all-notices tab sections

Runs: **base** → 1 records12 (result)

### p6Train (1 hook)
Registered (load order; 1 is next to the base):
1. `party3.js` result: Training team keeps only real trainees

Runs: **base** → 1 party3 (result)

### placeNodes (1 hook)
Registered (load order; 1 is next to the base):
1. `world12.js` after: a node never lands on a chest, a prop or an unreachable tile

Runs: **base** → 1 world12

### REALM_DONE (1 hook)
Registered (load order; 1 is next to the base):
1. `records12.js` result: Den and Sanctum rows follow the map, a Den the map has but the plan lacks is listed

Runs: **base** → 1 records12 (result)

### resBk (1 hook)
Registered (load order; 1 is next to the base):
1. `perf12.js` result: phones: the battle unit layer keeps the 2x HD paint (no 4x backing)

Runs: **base** → 1 perf12 (result)

### resPx (1 hook)
Registered (load order; 1 is next to the base):
1. `perf12.js` result: phones: Auto never goes above 2 internal pixels per art pixel

Runs: **base** → 1 perf12 (result)

### resStageR (1 hook)
Registered (load order; 1 is next to the base):
1. `perf12.js` result: phones: the battle stage GL canvas at 2 backing pixels per CSS pixel at most

Runs: **base** → 1 perf12 (result)

### rkBeaten (1 hook)
Registered (load order; 1 is next to the base):
1. `riftkeeper9.js` around: Echo records read through the journey view (rift9.js withRiftView)

Runs: 1 riftkeeper9 (around) → **base** → 1 riftkeeper9 (around)

### scanLights (1 hook)
Registered (load order; 1 is next to the base):
1. `world12.js` after: night light of a landmark

Runs: **base** → 1 world12

### townDecorActors (1 hook)
Registered (load order; 1 is next to the base):
1. `world12.js` after: the town landmark in the 2D depth sort

Runs: **base** → 1 world12

### turnOrder (1 hook)
Registered (load order; 1 is next to the base):
1. `rift9.js` before: an Echo fights alone

Runs: 1 rift9 → **base**

<!-- hooksmap:end -->

### enemyTurn0 and foePlan
- `engine.js` enemyTurn calls `enemyTurn0(u)` inside the turn watchdog.
- `battle5.js` defines `enemyTurn0` (the engine's original was removed as dead): it executes `foePlan(u)`, the plan the intents show.
- `battle4.js` wraps both at the first battle start (`b4HookPlan`, `b4HookTurn`, `b4HookGim`, still the wrapper form): role moves join the plan and the turn.

Still wrapped the old way (search for `name=function`, 5 or fewer each): `unpackG`, `scan`, `restAll`, `mMenu`, `mBeast`, `battleFrame`, `arrive` (5),
`vFacMissions`, `recruit`, `makeEnemy`, `mChar`, `drawObjects`, `doReaction`, `calcStats`, `bestAll`, `addSt` (4), and the `ACT.*` handlers (3 or fewer each).

## Notes for edits
- Do not reorder `MODS` lightly: wrappers and hooks run in load order (a later module's before hook runs first, its after hook last).
- A wrapper that never calls its captured original is a full replacement; the original's body is dead (the cleanup pass removed
  those; `SPRITE_HD=false` fallbacks in art.js/art2.js/legends.js/battle.js are kept on purpose).
- Daily Trial and sims depend on the order of `Math.random` and seeded RNG calls: do not add or move random calls in battle or
  generation code. Checks: `tools/chrome/v050p2daily.js` (OLDHTML = previous build), `tools/chrome/v063wa.js`, and
  `SEED=1 node tools/fullsim.js stage1` (and `xp`) before and after.

## v0.10.8 to v0.11.x additions
- `field9.js` (last in MODS) travel field skills: Haste, Shadowstep, Ward, Lure, Lantern, Marching Song (FLD9, G.fsx counters ticked in arrive)
- `data.js` REACT is 28 order-free pairs (key = sorted pair); REACT_V holds both orientations as views for lists by prime; reactFor(primed,det) reads REACT_V
- `ui.js` skPurpose / purposeTag (one purpose tag per skill, read from k, fx, t, cleanse, summon), skTagsFull (Settings > Skill tags)
- `guild7.js` g7OnBoard: one rule for the board list and its "!" marker (boardState)
