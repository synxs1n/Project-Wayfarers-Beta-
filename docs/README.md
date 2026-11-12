# Docs

Read these before a big pass:
- `CODEMAP.md`: what every module owns, "to change X, look in Y", and the ordered hook lists of the core functions (start here).
- `v099-hooks.md`: the hook registry (`v3/hooks.js`): one definition per core function (render, startBattle, vModal, ...), how to add a hook, what was converted.
- `design-notes-v033.md`: Beta v0.3.3 to v0.4.0 systems (saves, cloud sync, equipment, world, factions, developer guide).
- `design-notes-v041.md`: Beta v0.4.1 to v0.4.3 (sixteen realms, roamers, sites, capes, balance numbers). Wins over v033 where they disagree.
- `design-notes-v050.md`: Beta v0.5.0 (the big fix, logic, shops, party, settings and graphics pass). Wins over the older notes. Phase reports: `v050-phase2.md`, `v050-phase3.md`, `v050-phase45.md`.
- `v053-ui.md`: the v0.5.3 UI pass ("Gilded Night" menus, HUD and battle panels in `v3/ui3.css`), its design language, tests and limits.
- `v063-menus.md`: the shops and menus pass (two-level shop tabs, dropdown filters, regrouped menu, panels sized to the visible screen, the clipping test).
- `v095-menus.md`: the Notice Board (Quests, Guilds, Bounties, Arena in one place), three ranks per guild, the Upgrade button on each gear slot, team help first on the Party and Equipment tabs.
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
- `v095-battle-clarity.md`: the v0.9.5 battle clarity pass (one key weakness per foe, Expert battle info, damage groups Physical / Ranged / Magic, reaction flash, banner, sound and camera punch, Guard / interrupt / cleanse cues).
- `v085-sync.md`: save sync between devices (v0.8.5): what was wrong, who wins (last matched version, then progress and server corrected time), leaving and coming back, Continue waits for the cloud, the newer save prompt, the two device tests.
- `v095-bosses-pacing.md`: v0.9.5 fewer, better fights (lower encounter rate, roamers on fields with the realm's roles, ordinary fights pay more), a realm gimmick for every Scourge and Calamity, companion growth (second skill, evolution), depth unlocks by realm (`pcUnlocked`), with the journey and boss sim numbers.
- `v095-nudges.md`: leading players into the systems (v0.9.5): the manual bonus line, system bonuses on the rewards screen, auto per foe type, tip cards as invitations (basic and expert), the Next goals panel; economy numbers and tests.
- `v099-tests.md`: the v0.9.9 test hardening pass: the Chrome tests that were flaky under machine load and why, what changed per test, the frozen clock and wait helpers in `pw.js`, the runner `tools/chrome/runall.js` and its groups.
- `handoff-v0107.md`: where the v0.10.x pass stands, open items and the tests to watch.
- `v0107-sanctums.md`: Phase 8 (Sanctums, guardians as summons, Invoke and Spirit Call, Priest rename).
- `v0106-guild.md`: Phase 7 (board and Guild Hall split, guild notices, town gated notices, Medals, Guides tabs, roamer grace).
- `v0105-combat.md`: Phase 6 (56 reactions, early roles, prime refresh, typed attacks, natures as sub-roles, mastery perks).
- `v0104-battle.md`: Phase 5 (Chain, planned foe targets and the Guard cue, skill rows with target type and numbers).
- `v0103-map.md`: Phase 4 (connected world map with routes across maps, phone minimap and button, map icons).
- `v0102-party.md`: Phase 3 (wild recruit popup, Build Party another take, one Equip Best, charms button).
- `v0101-stats.md`: account totals (META.stats) fields and hooks · `keymap.md`: the key mapping · v0.10.1 also: deskscale.js (page zoom on computers) and the Flat look (gfx6.js Low tier, ui3.css scoped under html:not(.flat) by v3build.py).
- `v0100-phase1.md`: the v0.10.0 tester fixes (gates, tap to walk, roamers, arena auto, wipe view, weather indoors, phones) and the one report not reproduced.
- `audio-notes-v045.md`: the orchestral audio (v0.4.5) and Android live updates (v0.4.6).
- `v050-prompt.md`: the full spec for the Beta v0.5.0 pass. Rollback point: `rollback-v046.md`.
- `v0192-worldart12.md`: the v0.19.2 world art pass (`v3/worldart12.js`): field exits on land, den and lair entrances with volume, Sanctum side carpets as panels, weather anchored in world space, gather nodes drawn as props, the Mimic as a chest; test `tools/chrome/v174a.js`.
- `light13.md`: light and shadow on the ground, night and interior light pools, the realm particles and the screen transitions (`v3/light13.js`): one sun for both renderers (cast shadow masks in 2D, the hour's weights and a warm key in HD-2D), lamps and fires pooling light at night, fireflies, pollen, ash, dust, frost, spores and void motes, the battle shatter, doorway iris and victory bloom; test `tools/chrome/v177a.js`.
- `worldart13-entrances.md`: the entrances-with-volume pass (`v3/worldart13.js`): the tent recipe recovered (top, front and side faces, a recessed mouth, a cast shadow, the depth sort), applied to den mouths, lair fronts, the Sanctum shrine and inner door and the Rift gates in both renderers; test `tools/chrome/v175a.js`.
- `chars13-characters.md`: the characters pass (`v3/chars13.js`): one outline rule on every HD sprite (audit numbers), two-frame idle life in the world and in battle, the mid-ground silhouettes and the horizon haze on the stage, damage numbers in the pixel face coloured by element; test `tools/chrome/v178a.js`.

Cleanup rules (v0.18.6, cleanup steps 1 to 5):
- A function another module changes is `HOOK.def`'d once in its owner and the change is a registered hook (`HOOK.before/after/xform/wrap` with the module name and a few words of purpose). The raw `{const f0=fn;fn=function...}` idiom is for one-off wraps of functions nobody else touches; `python3 tools/wrapmap.py` (`--write` for `docs/wrapmap.md`, `NAME` for one chain) shows what is still raw. Hook order is load order (last registered outermost); when a hook must sit outside another, it lives in the later module and says so.
- New behaviour goes in the module that owns the feature, never in a fix pile. `fixes11.js` keeps only the hooks that must load last, each with the reason.
- `tools/buildcheck.py` runs inside `v3build.py`: E1 MODS names a missing file, E2 a `v3/*.js` is in no list, E3 a top-level const is reassigned, E4 a top-level name is declared twice, W1 a `//` comment swallows code, W2 `node --check` on the joined script, W4 a function is declared twice (the later wins silently).
- CI: `.github/workflows/release.yml` job `test` builds and runs `runall.js ci` (group `ci`, about 5 minutes); `android` and `windows` need it. Group `flaky` holds timing-sensitive tests; run them alone when touching what they cover. The `STALE` list in `runall.js` names every test that fails for an old reason, with the reason; `all` skips them, `--stale` runs them. A cleanup commit (no game change, no version bump) needs `runall.js all` green before and after.
- `node tools/hooksmap.js --write` regenerates the hook lists in `CODEMAP.md` from the running game.

Testing tips:
- Chrome tests: `tools/chrome/*.js` (Playwright, `pw.js`). Run from `tools/chrome` with `PWHTML=../../out/aurelis3.html`. Audio and update tests serve the repo over http themselves: `audio.js`, `audioplay.js`, `liveupdate.js`.
- Run many at once with the runner (one test at a time, a timeout per test, a summary table and a JSON report):
  `cd tools/chrome && PWHTML=../../out/aurelis3.html node runall.js [set ...] [--repeat N] [--timeout SEC] [--json FILE] [--stale] [--list]`.
  A set is `all` (every runnable test that is not stale; the default), a group, test names, or `stale`. `node runall.js --list` prints the groups:
  - `battle`: battle screen, labels, order bar, timed hits, mechanics, roles, rewards screen (ucards, wide, v041p1a/b/d, v041p2, v041p26, v050p1d/g, v050p2b/bg, v051a, v053b, v058a to v063bd, v070*, v075a, v076b, v080b, v080ca, v095b, v095na, v095p2)
  - `world`: maps, movement, HD-2D, weather, day and night, ambience, dungeons, tap to walk (collide, roof, nature, sanct, v040fs, v040p5/5b/6, v041p1c to v041p53, v050p1b/c/f, v050p2world, v050p5c, v051c, v053a, v056a, v062a, v063wo, v071wa/wb/wt, v077wa/wb, v080r, v080wa, v082da/db, v083a, v095p1)
  - `menus`: shops, Smithy, menus, Notice Board, tip cards, text clipping (eq, eq2, smithy*, tavern, v041p6/64/67, v050p1a/e/h, v050p3a/b, v050p4, v051b, v053ua/ub, v063m1/m2, v063s, v070oa/ob, v072a, v095m1 to m4, v095nb)
  - `party`: Best Party, Training team, Daily Trial and twists, duel lines, pacing sims (v063g, v063pa/pb, v063wa/wb, v071a, v077d, v080cb, v081a, v095p3, v050p2daily)
  - `saves`: old saves, backups, offline, sync between devices (savesys, offline, v041old, v041p1k, v043b, v050p4b, v050p5, v085s, v085s2)
  - `audio` (audio, audioplay, v082s, v083a), `title` (v060a, v071t, v080wt), `app` (liveupdate, v050p6a)
  Tests that compare with an older build (v050p2daily, v095na, v080ca) get the committed index.html of a fixed revision by default, or the
  file OLDHTML names. `PWFREEZE=0` runs the tests that freeze the clock on the real one. Details, stale tests and the helpers: `v099-tests.md`.
- Node sims (worldtest, gatetest, healtest, levertest, phase3test, archtest, chainsim, balance10, bosswin, pacing...) expect `tools/v3`: run `ln -s ../v3 tools/v3`, run from the repo root, remove the link before committing.
- The game is one IIFE in strict mode; tests reach it through `window.__A` (lazy getters for G, B, V, ACT and many functions) and `window.__AU` (audio).
