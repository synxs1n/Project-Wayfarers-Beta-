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
| monsters, bosses, archetypes | `foes.js`, `monsters2.js`, `art3.js` (guardians), `archetype.js`, `echocore.js` (echo forms) |
| damage, statuses, reactions | `engine.js` (calcDamage, addSt, doReaction), `data.js` (REACT, STS), `ailments.js`, `archetype.js`, `battle4.js` (Momentum) |
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
| minimap, area map, world map | `map.js`, `visuals7.js` (drawMini) |
| menus and shops | `menus3.js` (tabs, filters, Smithy, Alchemy, Tavern, Guild, Board), `ui.js` (vModal, mMenu, mChar), `ui2.js` (crafting, sort filters), `p3shop.js` (Best for party, Smithy plan "Upgrade whole party", the Upgrade button upgOpts/upgBest), `temper.js`, `equip.js`/`equip2.js`, CSS `menus3.css` |
| party, Best Party, loadouts, roster | `party2.js`, `p3shop.js` (scoring), `party3.js` (formations, Training team), `nav.js` (swaps), `tavern2.js` (journey roster, tavern tables), `progression.js` |
| companions and taming | `comp.js`, `comp2.js`, `engine2.js` (registerTamed), `v063prog.js` (Taming log) |
| quests, factions, guilds | `engine.js` (genQuests, claimQuest), `menus3.js` (the Notice Board: NB_TABS, nbBody, nbMenuBody), `factions.js` (FAC3: three ranks over six steps), `p4party.js` (personal quests by realm), `allq.js`, `qready.js` |
| companions and taming | `comp.js`, `comp2.js`, `comp3.js` (growth: second skill, evolution, TAME), `engine2.js` (registerTamed), `v063prog.js` (Taming log) |
| quests, factions, guilds | `engine.js` (genQuests, claimQuest), `factions.js`, `p4party.js` (personal quests by realm), `allq.js`, `qready.js` |
| saves and slots | `engine.js` (packG/unpackG, saveGame), `saves.js` (slots, backups, import/export, loadRaw), `gearmig.js` (old gear), `cloud.js` + `account.js` (accounts). Keys: `aurelis-wayfarers-v3` (+`-s1`, `-s2`), `aurelis-meta-v1`. Sync between devices (svMark, svFlush, svCheck/svDecide, svLeave, svGate, the newer save prompt; `aurelis-sync-v1`): `saves.js`, see `docs/v085-sync.md` |
| Daily Trial and twists | `engine2.js` (dailyGo, seeded RNG), `ui2.js` (screens), `twists.js`, `config.js` 9 |
| audio | `audio.js` (chiptune fallback), `audio2.js` (orchestral engine), `musicdata.js` (score), `music2.js` (wiring), `sfx2.js`, `ambience.js` |
| graphics tiers and settings | `gfx6.js` (GFX tiers; Low = Flat: `html.flat` keeps the style.css menus, ui3.css is scoped by the build), `p5settings.js`, `ui.js` settingsBody (wrapped by several modules) |
| page zoom on computers, Screen size row | `deskscale.js` (CSS zoom on html; `dsZoom()` in worldrt.js divides viewport measures) |
| keyboard mapping, the Keys screen | `keymap.js` (kmIs, kmLabel, META.keys), KEYDIR rebuilt from it |
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
### vModal (24 hooks)
Registered (load order; 1 is next to the base):
1. `stuck.js` before: Stuck? popup
2. `equip.js` before: eqPick, autoEq, equipNow popups
3. `party2.js` before: ldRes, ldMgr, bp, field popups
4. `gearmig.js` before: gmig popup (old gear)
5. `town2.js` before: wxinfo popup (weather, time of day)
6. `describe.js` before: statInfo popup
7. `chance.js` before: cev popup (chance meetings)
8. `factions.js` result: faction rank row on the shop popups
9. `ailments.js` before: battlelore popup
10. `echo2.js` before: echoAsk popup
11. `sanctum.js` before: portal popup
12. `comp.js` before: compPick popup
13. `map.js` before: map and worldmap popups
14. `autoset.js` before: autoset popup
15. `starter.js` before: starterSheet popup
16. `saves.js` before: the save popups (slots, export, import, recover, sync)
17. `p3shop.js` before: bp and p3plan popups
18. `p3shop.js` result: menu: Holy Water and Pork Chop buttons
19. `p3shop.js` before: upg popup (the Upgrade button)
20. `p4party.js` result: guild text on every popup above it
21. `p4party.js` around: bossEnergy popup, energy line on the Legacy choice
22. `v063prog.js` before: camp and bonds popups
23. `twists.js` before: twist info popup
24. `duellines.js` result: duel lines on chance meetings, defeat and rival popups

Runs: 23 twists → 22 v063prog → 21 p4party (around) → 19 p3shop → 17 p3shop → 16 saves → 15 starter → 14 autoset → 13 map → 12 comp → 11 sanctum → 10 echo2 → 9 ailments → 7 chance → 6 describe → 5 town2 → 4 gearmig → 3 party2 → 2 equip → 1 stuck → **base** → 8 factions (result) → 18 p3shop (result) → 20 p4party (result) → 21 p4party (around) → 24 duellines (result)

### finishBattle (19 hooks)
Registered (load order; 1 is next to the base):
1. `feedback.js` before: log the end
2. `account.js` after: codex and Archive sync
3. `progression.js` around: tavern reroll on a stage clear
4. `tavern2.js` around: tavern event on a stage clear
5. `battlefx.js` before: keep the last log lines
6. `journey.js` before: won/fled/lost stats
7. `world3.js` before: clock ticks
8. `factions.js` around: faction credit
9. `ailments.js` before: ailments carried out
10. `comp.js` before: companions step back
11. `realms.js` around: overlay lifts on a first clear
12. `roam.js` around: beaten roamers
13. `sites.js` around: miniboss prizes
14. `music2.js` around: stage clear music
15. `results.js` before: when the last battle ended (V.endT)
16. `p2world.js` after: win hint
17. `v063prog.js` around: camp boon stats back
18. `goals.js` after: Next goals panel
19. `duellines.js` around: duel flee lines

Runs: 19 duellines (around) → 17 v063prog (around) → 15 results → 14 music2 (around) → 13 sites (around) → 12 roam (around) → 11 realms (around) → 10 comp → 9 ailments → 8 factions (around) → 7 world3 → 6 journey → 5 battlefx → 4 tavern2 (around) → 3 progression (around) → 1 feedback → **base** → 2 account → 3 progression (around) → 4 tavern2 (around) → 8 factions (around) → 11 realms (around) → 12 roam (around) → 13 sites (around) → 14 music2 (around) → 16 p2world → 17 v063prog (around) → 18 goals → 19 duellines (around)

### render (18 hooks)
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
18. `qready.js` after: quests ready badge on the menu button

Runs: 12 p4party → 11 p3shop (around) → 9 anim (around) → 6 mimic → 5 town2 → 3 equip → 2 equip (around) → 1 feedback → **base** → 2 equip (around) → 4 town2 → 7 learn → 8 map → 9 anim (around) → 10 saves → 11 p3shop (around) → 13 gfx6 → 14 menus3 → 15 v063prog → 16 onboard → 17 goals → 18 qready

### startBattle (18 hooks)
Registered (load order; 1 is next to the base):
1. `feedback.js` after: log the start
2. `travel.js` after: Ambush! banner
3. `ailments.js` after: carry hero ailments in
4. `ailments.js` before: foe ailments (window.__ailFoes) first
5. `prog2.js` after: auto counters, boss auto lock
6. `realms.js` around: sync pools, Calamity effects, stage cleared flag
7. `p2world.js` before: backdrop from the terrain (spec.bg)
8. `p2world.js` before: surprise start: was the roamer still on patrol
9. `p2world.js` after: surprise start: the free round
10. `p2world.js` after: battle hint
11. `hdstage.js` before: reset the HD-2D stage lights
12. `v063prog.js` after: camp boon
13. `twists.js` after: twist waves, elites, Iron clamp
14. `battle5.js` after: plan every foe (foePlan)
15. `battle4.js` before: install the role, plan and gimmick hooks
16. `battle4.js` after: Momentum start, gimmick start, roles seen
17. `remember.js` before: remembered Auto
18. `dungeon8.js` before: realm dungeon material for the backdrop (spec.d8)

Runs: 18 dungeon8 → 17 remember → 15 battle4 → 11 hdstage → 8 p2world → 7 p2world → 6 realms (around) → 4 ailments → **base** → 1 feedback → 2 travel → 3 ailments → 5 prog2 → 6 realms (around) → 9 p2world → 10 p2world → 12 v063prog → 13 twists → 14 battle5 → 16 battle4

### win (14 hooks)
Registered (load order; 1 is next to the base):
1. `equip.js` around: new gear watch (queues new gear)
2. `mimic.js` around: mimic bonus gold, loot on the map
3. `echo2.js` around: Echo rewards (story Echo, Rift)
4. `sanctum.js` after: opens the Rift
5. `comp.js` before: companions step back
6. `learn.js` after: new skills on the result
7. `prog2.js` around: boss won by hand, auto per foe type opens
8. `p3shop.js` around: first boss Pork Chops
9. `p4xp.js` around: XP catch up (XPC)
10. `p4party.js` around: first boss energy
11. `results.js` around: reward screen data
12. `pacing.js` around: bonds stay closed until their realm
13. `comp3.js` around: companion growth (second skill, evolution)
14. `goals.js` after: goal counters from the fight

Runs: 13 comp3 (around) → 12 pacing (around) → 11 results (around) → 10 p4party (around) → 9 p4xp (around) → 8 p3shop (around) → 7 prog2 (around) → 5 comp → 3 echo2 (around) → 2 mimic (around) → 1 equip (around) → **base** → 1 equip (around) → 2 mimic (around) → 3 echo2 (around) → 4 sanctum → 6 learn → 7 prog2 (around) → 8 p3shop (around) → 9 p4xp (around) → 10 p4party (around) → 11 results (around) → 12 pacing (around) → 13 comp3 (around) → 14 goals

### worldDraw (11 hooks)
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

Runs: 10 hd2d (around) → 7 p5trans (around) → **base** → 1 legends → 2 equip → 3 world3 → 4 mimic → 5 daylight → 6 roam → 7 p5trans (around) → 8 gfx6world → 9 worldfx → 10 hd2d (around) → 11 dungeon8

### calcDamage (10 hooks)
Registered (load order; 1 is next to the base):
1. `engine.js` after: pack frenzy, auto nerf on the acting hero
2. `insight.js` after: bestiary perk damage
3. `echocore.js` after: Echoforged boss and primed damage
4. `archetype.js` after: archetype delivery multiplier and its tag
5. `roles.js` after: ranged power, taunt defence (roles)
6. `realms.js` after: Calamity element multipliers and burn
7. `twists.js` after: twist: weakness damage
8. `battle5.js` after: timed hit multiplier
9. `battle4.js` after: Momentum, Hex, guard cover
10. `battle4.js` after: boss gimmick damage

Runs: **base** → 1 engine → 2 insight → 3 echocore → 4 archetype → 5 roles → 6 realms → 7 twists → 8 battle5 → 9 battle4 → 10 battle4

### encounterFoes (10 hooks)
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

Runs: 9 p2world (around) → 8 sites (around) → 7 roam (around) → 6 echocore → 5 mimic → 4 chance → 3 world3 (around) → 1 legends → **base** → 2 travel → 3 world3 (around) → 7 roam (around) → 8 sites (around) → 9 p2world (around) → 10 duellines

### settingsBody (9 hooks)
Registered (load order; 1 is next to the base):
1. `saves.js` around: Main menu row
2. `music2.js` around: Ambience, Music style, Credits rows
3. `p5settings.js` result: volume sliders replace the sound rows
4. `p2world.js` around: Hints row
5. `gfx6.js` around: Graphics row
6. `battle3.js` result: Expert battle info row
7. `battle5.js` result: Timed hits row
8. `onboard.js` around: Tips row
9. `hd2d.js` around: HD-2D world row

Runs: 9 hd2d (around) → 8 onboard (around) → 5 gfx6 (around) → 4 p2world (around) → 2 music2 (around) → 1 saves (around) → **base** → 1 saves (around) → 2 music2 (around) → 3 p5settings (result) → 4 p2world (around) → 5 gfx6 (around) → 6 battle3 (result) → 7 battle5 (result) → 8 onboard (around) → 9 hd2d (around)

### getMap (8 hooks)
Registered (load order; 1 is next to the base):
1. `bosstheme.js` around: stage look from its boss (new maps)
2. `mapheal.js` around: path healing (new maps)
3. `realms.js` before: sync pools before a new map
4. `sites.js` around: fortress maps; place the fortress on its field
5. `p2world.js` around: town lanes, gathering spots on open tiles (new maps)
6. `pathguard.js` around: path protection (new maps)
7. `dungeon8.js` around: realm dungeon materials and organic caves (new maps)
8. `dungeon8.js` around: boss lair on the field (new maps)

Runs: 8 dungeon8 (around) → 7 dungeon8 (around) → 6 pathguard (around) → 5 p2world (around) → 4 sites (around) → 3 realms → 2 mapheal (around) → 1 bosstheme (around) → **base** → 1 bosstheme (around) → 2 mapheal (around) → 4 sites (around) → 5 p2world (around) → 6 pathguard (around) → 7 dungeon8 (around) → 8 dungeon8 (around)

### perform (8 hooks)
Registered (load order; 1 is next to the base):
1. `ailments.js` around: hard cleanse flag for revive and cleanse skills
2. `archetype.js` around: heals hurt the undead
3. `prog2.js` around: hand and auto turn counters, goal counters
4. `anim.js` before: Limit Break pose time
5. `roles.js` around: chi heals use the role heal power
6. `twists.js` around: Iron clamp after every action
7. `battle4.js` around: boss gimmick answers
8. `pacing.js` around: primers are plain hits until reactions open

Runs: 8 pacing (around) → 7 battle4 (around) → 6 twists (around) → 5 roles (around) → 4 anim → 3 prog2 (around) → 2 archetype (around) → 1 ailments (around) → **base** → 1 ailments (around) → 2 archetype (around) → 3 prog2 (around) → 5 roles (around) → 6 twists (around) → 7 battle4 (around) → 8 pacing (around)

### renderBattle (7 hooks)
Registered (load order; 1 is next to the base):
1. `battleui.js` after: boss bar
2. `battle3.js` after: fit the target tags
3. `battle3.js` after: tall layout: bottom panel back to the top on a new turn
4. `battle3.js` after: fit check once the whole render has run (microtask)
5. `battle3.js` before: Expert battle info class (b9x)
6. `battle5.js` after: forecast bar fit
7. `battle4.js` around: gimmick sync before, Momentum bar after

Runs: 7 battle4 (around) → 5 battle3 → **base** → 1 battleui → 2 battle3 → 3 battle3 → 4 battle3 → 6 battle5 → 7 battle4 (around)

### newGame (6 hooks)
Registered (load order; 1 is next to the base):
1. `account.js` after: codex roster
2. `tavern2.js` after: journey roster and tavern reset
3. `prog2.js` after: auto per foe type starts closed
4. `map.js` before: forget the explored map
5. `pacing.js` after: pacing version on a new journey
6. `goals.js` after: goals start empty

Runs: 4 map → **base** → 1 account → 2 tavern2 → 3 prog2 → 5 pacing → 6 goals

### placeAt (6 hooks)
Registered (load order; 1 is next to the base):
1. `legends.js` after: Jaeson's storm
2. `progression.js` after: places been
3. `stuck.js` around: Stuck? return point
4. `world3.js` around: weather on arrival
5. `map.js` after: reveal around, redraw the minimap
6. `map.js` before: stop tap to walk

Runs: 6 map → 4 world3 (around) → 3 stuck (around) → **base** → 1 legends → 2 progression → 3 stuck (around) → 4 world3 (around) → 5 map

### genQuests (4 hooks)
Registered (load order; 1 is next to the base):
1. `legends.js` after: legend quests
2. `equip.js` after: the Tamer's Stick quest
3. `realms.js` around: realm quests (pools, rival)
4. `pacing.js` after: Tamer quest step for the pacing

Runs: 3 realms (around) → **base** → 1 legends → 2 equip → 3 realms (around) → 4 pacing

### openChest (4 hooks)
Registered (load order; 1 is next to the base):
1. `equip.js` around: new gear watch (queues new gear)
2. `mimic.js` before: a mimic in the chest
3. `sites.js` before: cave reward chests
4. `worldfx.js` around: chest opening sparkle

Runs: 4 worldfx (around) → 3 sites → 2 mimic → 1 equip (around) → **base** → 1 equip (around) → 4 worldfx (around)

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
