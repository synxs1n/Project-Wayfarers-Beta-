# Code map

The game is ~140 files in `v3/`, joined by `v3build.py` in its `MODS` order into one strict-mode IIFE (`v3/shell.html`
wraps it; `boot()` runs at the end). Everything shares one scope, so a later file can wrap or replace an earlier
file's function: `{const f0=fn;fn=function(){...f0.apply(this,arguments)...};}`. Function declarations are hoisted,
wrappers run in load order, and the last wrapper installed is the outermost (it runs first). Every module's first line
says what it owns; this page indexes them.

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
| world movement, gates, chests, encounters | `worldrt.js`, `roam.js`, `chance.js`, `mimic.js`, `stuck.js`, `travel.js` |
| world drawing (2D) | `worldgfx.js`, `worldgfx2.js`, `towngfx.js`, `worldrt.js` (worldDraw), `gfx6world.js`, `worldfx.js`, `daylight.js` |
| HD-2D world (Medium and High graphics) | `hd2d.js` (worldDraw replacement), `hd2dgl.js` (WebGL layer), `config.js` 8 (HD2D) |
| weather and day/night | `world3.js` (tables, rolls, clock), `engine2.js` (WEATHER defs, battle weather), `p5trans.js` (blends), `weather7.js` (layers), `config.js` 6 and 8 |
| minimap, area map, world map | `map.js`, `visuals7.js` (drawMini) |
| menus and shops | `menus3.js` (tabs, filters, Smithy, Alchemy, Tavern, Guild, Board), `ui.js` (vModal, mMenu, mChar), `ui2.js` (crafting, sort filters), `p3shop.js` (Best for party, Smithy plan), `temper.js`, `equip.js`/`equip2.js`, CSS `menus3.css` |
| party, Best Party, loadouts, roster | `party2.js`, `p3shop.js` (scoring), `party3.js` (formations, Training team), `nav.js` (swaps), `tavern2.js` (journey roster, tavern tables), `progression.js` |
| companions and taming | `comp.js`, `comp2.js`, `engine2.js` (registerTamed), `v063prog.js` (Taming log) |
| quests, factions, guilds | `engine.js` (genQuests, claimQuest), `factions.js`, `p4party.js` (personal quests by realm), `allq.js`, `qready.js` |
| saves and slots | `engine.js` (packG/unpackG, saveGame), `saves.js` (slots, backups, import/export, loadRaw), `gearmig.js` (old gear), `cloud.js` + `account.js` (accounts). Keys: `aurelis-wayfarers-v3` (+`-s1`, `-s2`), `aurelis-meta-v1` |
| Daily Trial and twists | `engine2.js` (dailyGo, seeded RNG), `ui2.js` (screens), `twists.js`, `config.js` 9 |
| audio | `audio.js` (chiptune fallback), `audio2.js` (orchestral engine), `musicdata.js` (score), `music2.js` (wiring), `sfx2.js`, `ambience.js` |
| graphics tiers and settings | `gfx6.js` (GFX tiers), `p5settings.js`, `ui.js` settingsBody (wrapped by several modules) |
| onboarding, hints, What next? | `onboard.js` (tip cards), `p2world.js` (hints), `progression.js` (What next?), `pacing.js` (unlock timing) |
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
- `rivals.js` rivals · `sprites.js` item palettes · `capes.js` capes · `saves.js` save recovery and slots · `cloud.js` Firebase accounts
- `update.js` update prompt · `allq.js` Accept all / Claim all · `economy.js` ECON price pass

v0.4.5 to v0.6
- `p3shop.js` shops, gear and items (Best for party, Smithy plan, Best Party scoring) · `music2.js` music wiring, Music Room · `sfx2.js` layered sfx · `ambience.js` ambience
- `p4xp.js` XP catch up · `p4party.js` personal quests by realm, guild text, boss energy · `p5settings.js` settings, save indicator · `p5trans.js` smooth transitions
- `p45hook.js` test handles · `results.js` battle rewards screen · `p2world.js` backdrops from the terrain, ground plane, surprise starts, single/dual types, hints
- `gfx6.js` graphics tiers · `gfx6world.js` world life · `gfx6battle.js` battle presentation · `hdstage.js` HD-2D battle stage · `hdspell.js` HD-2D spells
- `menus3.js` shops and menus · `party3.js` Best Party formations · `v063prog.js` Taming log, bond goals, Make camp · `twists.js` twists
- `icons.js` / `icons2.js` code-drawn item icons · `worldfx.js` world-space ambience

v0.7
- `battle3.js` battle screen pass (labels, unitHud) · `battle5.js` forecast, foe intents, timed hits · `battle4.js` detonation refund, free swap, Momentum, roles
- `remember.js` remember Auto and Run · `pacing.js` unlock pacing · `onboard.js` tip cards · `duellines.js` duel voices · `qready.js` quests ready
- `hd2dgl.js` HD-2D WebGL layer · `hd2d.js` HD-2D world renderer · `weather7.js` layered weather · `pathguard.js` path protection
- `sprhd2.js` HD sprite consumers · `logo.js` wordmark · `title7.js` HD-2D title · `visuals7.js` minimap tiles, victory crest, arena

v0.8
- `roles.js` class roles: secondary role skills and charms, chi heals, roleOut / roleTable / heroRoleSet (built right after `sigskills.js`)

CSS: `fonts.css`, `style.css`, `ui3.css` (v0.5.3 Gilded Night), `menus3.css`, `battle3.css`, `battle5.css`, `battle4.css`.
Shell: `shell.html` (page, `window.__A`), `liveboot.js` (Android live update boot), `sw.js` (service worker).

## Wrapper chains (load order: 1 is the base, the last one runs first)

Line numbers drift; search for the wrapper text (`render=function`, `startBattle=function`, ...) in the file.

### render (17 wrappers)
1. `ui.js` base: draws the header, the screen and the modal
2. `feedback.js` logs screen and modal changes for bug reports
3. `equip.js` per-render fit cache (FITC) · 4. `equip.js` opens "Equip this now?" for queued new gear
5. `town2.js` focuses Rest in the Inn · 6. `town2.js` notes the key that opened a popup (key guard)
7. `mimic.js` mimic loot popup after the fight · 8. `learn.js` queues new skill notices
9. `map.js` makes sure the minimap exists (next frame) · 10. `anim.js` popup open fade
11. `saves.js` save status icon · 12. `p3shop.js` per-render Best Party cache (P3C)
13. `p4party.js` the boss's lingering energy popup · 14. `gfx6.js` menu depth of field class
15. `menus3.js` keeps dropdown focus · 16. `v063prog.js` progression notes · 17. `onboard.js` keeps the tip card placed · 18. `qready.js` quests ready badge

### startBattle (15 wrappers)
1. `engine.js` base: builds B from the spec (foes, weather, seeded RNG)
2. `feedback.js` logs the start · 3. `travel.js` Ambush! banner
4. `ailments.js` carries hero ailments in · 5. `ailments.js` foe ailments (window.__ailFoes) first
6. `prog2.js` auto counters, boss auto lock · 7. `realms.js` syncs pools, Calamity effects, stage cleared flag
8. `p2world.js` backdrop from the terrain (spec.bg) · 9. `p2world.js` surprise start · 10. `p2world.js` battle hint
11. `hdstage.js` resets the HD-2D stage lights · 12. `v063prog.js` camp boon · 13. `twists.js` twist waves, elites, Iron clamp
14. `battle5.js` plans every foe (foePlan) · 15. `battle4.js` installs the role hooks, Momentum start · 16. `remember.js` remembered Auto

### finishBattle (17 wrappers)
1. `engine.js` base · 2. `feedback.js` log · 3. `account.js` codex and Archive sync · 4. `progression.js` tavern reroll on a stage clear
5. `tavern2.js` tavern event · 6. `battlefx.js` keeps the last log lines · 7. `journey.js` won/fled/lost stats · 8. `world3.js` clock ticks
9. `factions.js` faction credit · 10. `ailments.js` ailments carried out · 11. `comp.js` companions step back · 12. `realms.js` overlay lifts
13. `roam.js` beaten roamers · 14. `sites.js` miniboss prizes · 15. `music2.js` stage clear music · 16. `p2world.js` win hint
17. `v063prog.js` camp boon countdown · 18. `duellines.js` duel flee lines

### win (11 wrappers)
1. `engine.js` base: rewards and the result modal · 2. `equip.js` new gear watch · 3. `mimic.js` mimic bonus · 4. `echo2.js` echo rewards
5. `sanctum.js` opens the Rift · 6. `comp.js` companions step back · 7. `learn.js` new skills on the result · 8. `prog2.js` boss won manually
9. `p3shop.js` first boss Pork Chops · 10. `p4xp.js` XP catch up · 11. `p4party.js` first boss energy · 12. `results.js` reward screen data

### renderBattle (4 wrappers)
1. `ui.js` base: the DOM half of the battle view · 2. `battleui.js` boss bar · 3. `battle3.js` target tags fit · 4. `battle5.js` forecast bar fit · 5. `battle4.js` Momentum bar

### enemyTurn0 and foePlan
- `engine.js` enemyTurn calls `enemyTurn0(u)` inside the turn watchdog.
- `battle5.js` defines `enemyTurn0` (the engine's original was removed as dead): it executes `foePlan(u)`, the plan the intents show.
- `battle4.js` wraps both at the first battle start (`b4HookPlan`, `b4HookTurn`): role moves join the plan and the turn.

### vModal (24 wrappers)
1. `ui.js` base: the core popups by `m.type`. Dispatch wrappers (each adds types) in order: `stuck.js` stuck, `equip.js` eqPick/autoEq/equipNow,
`party2.js` ldRes/ldMgr/bp/field, `gearmig.js` gmig, `town2.js` wxinfo, `describe.js` statInfo, `chance.js` cev.
Then `factions.js` post-processes the shop popups (faction rows). `ailments.js` battlelore, `echo2.js` echoAsk, `sanctum.js` portal, `comp.js` compPick,
`map.js` map and worldmap, `autoset.js` autoset, `starter.js` starterSheet, `saves.js` the save popups, `p3shop.js` bp/p3plan, then `p3shop.js` adds
the menu's team check. `p4party.js` passes every popup above it through guildText, then adds bossEnergy; `v063prog.js` camp, `twists.js` the twist info,
`duellines.js` duel lines (post-processing). Order matters: a popup added after `p4party.js` does not get guildText.

### worldDraw (9 wrappers)
1. `worldrt.js` base: the 2D world · 2. `legends.js` legend markers · 3. `equip.js` stick glow · 4. `world3.js` night tint · 5. `mimic.js` chest tells
6. `daylight.js` dusk and dawn · 7. `roam.js` roamers · 8. `p5trans.js` smooth transitions (sets TR) · 9. `gfx6world.js` lighting and life
10. `hd2d.js` Medium and High: draws the HD-2D scene and its overlay instead of the 2D chain; falls back to the chain when HD-2D is off, unavailable or fails

Other well-wrapped functions (search for `name=function`): `encounterFoes` (10), `calcDamage` (8), `settingsBody` (8), `getMap` (6),
`placeAt` (6), `drawObjects`, `battleFrame`, `mBeast`, `arrive`, `restAll`, `perform`, `unpackG` (5 each).

## Notes for edits
- Do not reorder `MODS` lightly: wrappers depend on what is already installed when they load.
- A wrapper that never calls its captured original is a full replacement; the original's body is dead (the cleanup pass removed
  those; `SPRITE_HD=false` fallbacks in art.js/art2.js/legends.js/battle.js are kept on purpose).
- Daily Trial and sims depend on the order of `Math.random` and seeded RNG calls: do not add or move random calls in battle or
  generation code. Checks: `tools/chrome/v050p2daily.js` (OLDHTML = previous build), `tools/chrome/v063wa.js`, and
  `SEED=1 node tools/fullsim.js stage1` (and `xp`) before and after.
