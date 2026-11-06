# Docs

Read these before a big pass:
- `CODEMAP.md`: what every module owns, "to change X, look in Y", and the wrapper chains of the most wrapped functions (start here).
- `design-notes-v033.md`: Beta v0.3.3 to v0.4.0 systems (saves, cloud sync, equipment, world, factions, developer guide).
- `design-notes-v041.md`: Beta v0.4.1 to v0.4.3 (sixteen realms, roamers, sites, capes, balance numbers). Wins over v033 where they disagree.
- `design-notes-v050.md`: Beta v0.5.0 (the big fix, logic, shops, party, settings and graphics pass). Wins over the older notes. Phase reports: `v050-phase2.md`, `v050-phase3.md`, `v050-phase45.md`.
- `v053-ui.md`: the v0.5.3 UI pass ("Gilded Night" menus, HUD and battle panels in `v3/ui3.css`), its design language, tests and limits.
- `v063-menus.md`: the shops and menus pass (two-level shop tabs, dropdown filters, regrouped menu, panels sized to the visible screen, the clipping test).
- `v053-hd2d.md`: Beta v0.5.3 HD-2D world renderer (WebGL diorama view of the world maps on Medium and High graphics).
- `v058-sprites-in-scene.md`: characters and monsters lit, graded, scaled and grounded in the HD-2D world and battle stages (Medium, High).
- `v063-party.md`: Beta v0.6.3 party systems (Best Party formations and Training team, XP catch up against the roster's top level, "Equip best: at camp", Legendary only for legends and Epic tags).
- `v063-progression.md`: Beta v0.6.3 progression goals (Taming log, bond goals, Make camp) and the pacing audit of when each system first appears.
- `v063-twists.md`: the Daily Trial weekly twist and the optional New Game+ modifiers (`twists.js`, `TWISTS` in config.js).
- `v063-art.md`: v0.6.3 art pass: capes no longer drawn on heroes (only the weapon and the personal reward change the look) and one code-drawn icon per item (`icons.js`, `icons2.js`), with the before/after audit.
- `v063-world.md`: the v0.6.3 world pass (fortress gatehouse in HD-2D, ambience in world space, the HD-2D overlay quarter bug, opened chests vanish, the illustrated world map, "Fortress").
- `v071-world.md`: the v0.7.1 world pass (props HD-2D hides behind walls kept off those tiles, clear door aprons, no holes in buildings, the `drawAudit` sweep over every map kind; tap the full map or minimap to walk there).
- `v077-weather.md`: the v0.7.7 weather and old visuals pass (every weather in layers in 2D, in the HD-2D scene and on the battle stage, safe lightning, tiers, the victory crest, minimap tiles, the arena backdrop).
- `v080-rivals.md`: personal quest rivals drawn see through (2D, HD-2D, map) and passable while their wayfarer is not in your six; talking names the hero with their portrait (`v3/rivalghost.js`).
- `v080-weather-title.md`: the v0.8.0 weather and title pass (the boxes of clarity: hard edged bank sprites, weather lit as units on the High stage, the rectangular hero cut out; soft face falloff; smooth fog with distance; the title's six wayfarers walking through the realms).
- `v082-dungeons.md`: each realm's dungeon in its battle backdrop's material (ice cavern, volcanic, sea cave, roots, crypt, sandstone...), organic cavern walls for the cave themes, the boss lair on the field (`v3/dungeon8.js`).
- `v063-battle.md`: the v0.6.3 battle screen pass (one layout pass for every stage label, the battle start flash, detonator targeting, the new battle screen layout).
- `v070-onboarding.md`: one short tip card the first time the player meets each system (`v3/onboard.js`), Guides > How it works, What next? "Not tried yet", Settings Tips and Reset tips, battle cards placed clear of sprites.
- `v071-title.md`: the title pass (HD-2D camp title scene, the code-drawn wordmark and emblem in `logo.js`, app icons from `tools/mkicons.js`).
- `v070-battle-info.md`: the v0.7.0 battle information and input pass (turn forecast bar, foe intents from planned actions, optional timed hits; `v3/battle5.js`).
- `v070-battle-mech.md`: the v0.7.0 battle mechanics (detonation MP refund, free swap, Momentum, foe roles and the boss Cataclysm, `b4RolePlan` for intents) with the auto vs careful sim numbers.
- `v080-roles-balance.md`: v0.8.2 class roles (a primary and secondary roles per class, role skills, weapons and charms, the 55 to 75% band) and the pacing pass (journey sim with gear and a time model, encounters, the eased Scourges).
- `v076-battle-layout.md`: the v0.7.6 wide battle layout (commands with the foes under them, the party column with one hero per row, the stage sized so the screen fits, no text cut, aim tags that always fit).
- `v080-battle-phones.md`: the v0.8.0 battle screen on phones and the Galaxy Z Fold (sized from the visible viewport, the column arrangement and compaction on short wide screens, portrait commands always on screen, the compact foe list), the battle transition drawn at 4x on Medium and High, damage type symbols.
- `v085-sync.md`: save sync between devices (v0.8.5): what was wrong, who wins (last matched version, then progress and server corrected time), leaving and coming back, Continue waits for the cloud, the newer save prompt, the two device tests.
- `audio-notes-v045.md`: the orchestral audio (v0.4.5) and Android live updates (v0.4.6).
- `v050-prompt.md`: the full spec for the Beta v0.5.0 pass. Rollback point: `rollback-v046.md`.

Testing tips:
- Chrome tests: `tools/chrome/*.js` (Playwright, `pw.js`). Run from `tools/chrome` with `PWHTML=../../out/aurelis3.html`. Audio and update tests serve the repo over http themselves: `audio.js`, `audioplay.js`, `liveupdate.js`.
- Node sims (worldtest, gatetest, healtest, levertest, phase3test, archtest, chainsim, balance10, bosswin, pacing...) expect `tools/v3`: run `ln -s ../v3 tools/v3`, run from the repo root, remove the link before committing.
- The game is one IIFE in strict mode; tests reach it through `window.__A` (lazy getters for G, B, V, ACT and many functions) and `window.__AU` (audio).
