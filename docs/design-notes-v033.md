# Aurelis Wayfarers: design notes (Beta v0.3.3 to v0.4.0)

Copied from the Wayfarers project (claude/aurelis-design-notes-v033.md) so every session can read it from the repo. `docs/design-notes-v041.md` covers v0.4.1 to v0.4.3 and wins where they disagree. Old artifact publishing and "rebuild from bundles" steps are dropped: the source of truth is now `v3/` in this repo, built with `sh build.sh`.

## Compatibility
- Save keys (`aurelis-wayfarers-v3`, slot keys, `aurelis-meta-v1`) and db schema versions are unchanged. New optional fields all default on read: `G.loadouts` (8 slots), `META.cfg.lists` (sort and filter state), `META.q` (offline queue: `{prof, fb:[]}`).
- Daily Trial untouched. Player text still renders only through `esc()`.
- Old saves load (tested: `chrome/oldsave.js`).

## Beta v0.3.3: QoL, equipment logic, battle screen, bug pass
Build order additions: `equip2` after `equip`, `party2`, `town2`, `offline` after `town2`, `sanctum` after `echo2`, `battleui` after `anim`. `fonts.css` (embedded base64 woff2: Nunito, Pixelify Sans, Jacquard 24) is prepended to the CSS; the page has no external URLs. The build also writes `out/sw.js` from `v3/sw.js`.

- Battle screen revamp in `battleui.js` (see its header).
- Equipment logic (`equip2.js`): `planGear` is a greedy global planner. Modes via `autoRun`: `party`, `all`, `one`. Each opens an "autoEq" summary with rows and Undo (`snapAuto` / `undoAuto` restore party, gear, eq and companion `with`). Companions: `compGainFor`, `planComp`, `applyComp`. Equipment tab buttons "Auto best gear: party" and "Equip best for everyone". "Best for" lists use `gainersFor` and `cmpPanel`. `queueNewGear` prefers party gainers.
- Party tools (`party2.js`): sort and filter (`lsort`, `lmatch`, `filterBar`, state in `META.cfg.lists`); XP bars (`xpLine`, `xpMini`, `xpRows`); Loadouts (`G.loadouts`, 8 slots, membership changes need `inTown()`, Undo); Best Party (`bestParty` / `mBestParty`); field skills are heal and revive only. Guild Hall has no party tab (Menu > Party).
- Inn, bonds, popups (`town2.js`): Inn modal with Rest first, Save journey, Leave. Bonds (`bondSheet`, `bondCodex`), campfire talks (`G.talks`). Weather and time chips open `wxInfoBody`.
- Echo Sanctum (`sanctum.js`): map `s0`, 28x19 hub with 16 portal gates and an Echo Warden; unlocks after all five story echoes (`G.echoStory[0..4]`). Entry from the waystone row (`riftRow`, `ACT.toSanctum`), gates call `ACT.riftFight`.
- Offline (`offline.js`, `sw.js`): queued feedback (`offQueueFb`), profile union merge (`profileSync`), pending pill, 60 s retry. Service worker network first with cache fallback (`aurelis-offline-v1`), registers only on https or localhost.

## Beta v0.3.4: save recovery and account saves (`saves.js`)
- `G.gv` = game version that last wrote the save; loading a save with a different `gv` writes a rolling raw backup first.
- Backups `aurelis-bak-<slot>-<0..2>` = `{raw,why,at,gv,savedAt}`, index `aurelis-bak-idx`. Written before a version migration, a new journey over a slot, a slot clear, an import, a restore, a cloud pull, the first cloud upload. Identical raw not duplicated; if storage is full other slots' backups are freed first. The original slot key is never deleted by a load.
- `svParse` validates; a bad slot is never cleared (shows "could not be read", Retry, Export raw `AWRAW1.`, Recover Saves). `svfail` modal keeps raw data; `G` only set on a clean load. Failed writes retry once after freeing backups, then toast "Could not save on this device".
- Recover Saves (title, slot chooser, Journey tab) scans localStorage for slots, orphan keys and backups; restore asks for a target slot and backs up what it replaces (title only).
- Export: `AWSAVE1.`+base64 per slot, `.awsave` download. Import: paste or file, `svDecode` validation, pick slot, confirm with both summaries, backup first. Never auto overwrites.
- Cloud (db): `saves/<uid>/s/<slot>` `{v:1,sv:3,gv,slot,savedAt,score,prog,dev,hash,hi,pushedAt,why,n,data}` (`data` packed `z1.` gzip base64 or `p1.` plain, first 180,000 chars; chunks in `saves/<uid>/c/...` written first); history `saves/<uid>/h/<slot>-<0..2>`.
- Sync: local is the fast cache; `saveGame` marks dirty; one pass 6 s after the last save (debounced), on `online`, on visible, and from Sync in the Journey tab. Per slot (`svCheck`): local only -> back up and upload; cloud only -> restore into an empty slot; same hash -> synced; one side newer by > 2 s and at equal or more progress -> it wins (loser backed up or pushed to history); otherwise divergence: never merged or overwritten, the title offers Keep this device / Use my account / Decide later and holds the slot.
- Status icon (bottom left and Journey row): synced, syncing, offline queued, error (retry 60 s), local only, attention. Visitors without db write stay local with an Export reminder.
- Delete Cloud Save removes the main doc and chunks; history stays until "Delete all cloud history".
- Tests: `saveformats.js`, `savesys.js` (all of the above), hook `__A` exports SV and sv* functions.

## Beta v0.3.5: content, systems and UI pass
New optional fields: `G.wv` (world version), `G.gmig`, per-hero `nat`/`nrr`, tavern state `G.tv*`, `META.seen` additions.
- Terminology: "wayfarers" in all player text.
- UI fixes: `.lfbar` class, sticky Continue on rewards, `groundProps()` in worldgen.js keeps props valid and door fronts clear (`propaudit.js`), `MAPICO_*` icons shared by minimap, map and signs.
- Battle clarity: Primed aura, chip "PRIMED: element, turns left", sound `prime`, detonator target highlights. One element icon set (`elShapeCv`). Purple Limit Break bar. Legendary stamp.
- `CHART_DEF` in data.js (commented); elements no longer resist themselves by default. Natures: 3 to 5 per class template, `natRoll` seeded by the run seed; Guild Hall reroll or choose.
- 65 non-legendary wayfarers; journey subset of about 30 with coverage guarantees (tavern2.js); Codex records every wayfarer seen on the account.
- Tavern: at most 4 offers, hiring leaves an empty seat, shuffles after an inn rest or stage clear with a cooldown, per-town pools. (v0.5.0: no per area recruit cap any more; see design-notes-v050.md 1.1.)
- Weapons (`CLS_WPN` in items.js): Warrior sword, axe, greatsword; Knight sword, lance, mace; Mage staff, tome; Healer staff, tome, mace; Thief dagger, short sword; Archer bow, longbow, crossbow; Monk knuckles, claws, quarterstaff; Bard lute, harp, flute; legendaries sniper, druid, archmage, chronicler. `WPERK` perks per family (sword +4% acc +8% crit dmg; axe +12% hit-all; greatsword +12% phys, 6% slower; lance +22% vs foes that acted; mace stun +50%, 10% basic stun; staff -15% MP +10% elemental; tome +10% spell power; dagger +6% crit; short sword +5% evasion +4% crit; bow ignores 10% DEF; longbow 16% and 4% slower; crossbow 8% and +15% crit dmg; knuckles 30% extra hit; claws ailments +25% bleed +50% +4% crit; quarterstaff +5% acc +6% eva; lute debuffs +25% +1 turn; harp +10% healing, buffs +1 turn; flute 5% faster, buffs +1 turn). Daily Trial ignores perks.
- Armor weights: Light (casters, Bard), Medium (Archer, Thief, Monk), Heavy (Warrior, Knight). `canEquip` is the single gate. `gearmig.js` moves illegal gear back to the pack on load and reports it.
- World: `bosstheme.js` (16 themes, never names the boss); two fields per town for world v2; larger fields and dungeons; `worldtest.js N`.

## Beta v0.4.0: the "massive shift" build
- Phase 1 bugs: foe targeting by tap, click, keys and pad; field skills needing a target; shield pips row; input stops at battle start; dungeon stairs protected in validation; Auto label.
- Phase 2 battle: tap reserve to switch, Auto settings in the menu, Undead and healing damage, archetypes and delivery tags (`archetype.js`: Flying, Armored, Jelly, Undead, Swarm, Beast...; delivery Slash, Blunt, Piercing, Ranged, Magic, Heal).
- Phase 3 menus: seven groups with sub tabs (`MENU_GROUPS` in ui.js), Forge naming, craft order, purchase feedback, Best For, Pork Chop Sandwich to the last town, dusk and dawn (a day of 900 steps, `CLK_PH` in config.js), starter sheets, Legacy counted against the three starters, item strength borders (`ITEM_TIERS`).
- Phase 4 wayfarers: 64 single type (8 classes x 8 elements), signature skills (`sigskills.js`), starter pool and draw (`starter.js`).
- Phase 5 connected world (`world4.js`, `worldgen.js`, `worldrt.js`, `map.js`): `G.wv` 3 for new journeys, old saves keep their maps; `worldPlan()` sets gate sides from the seed; fields built in a canonical frame then rotated (`xfRows`, `xfPt`); maps record `gates`; exits carry `to:{m,g}`. One long field per town pair. Side caves (`placeCaveMouth`, `buildCave`, `caveReward`). World map (`worldGraph`, `openWorldMap`). `node worldtest.js 520`.
- Phase 6 dungeons (`buildDungeon3`): 80x50 at stage 1 growing per stage; order lever, key room, key, boss door (`leverOrderBad`, `barsText`).
- Phase 7 weather: snow, rare skies with `sup:1` (Blood Moon, Solar Eclipse, Meteor Shower, Elemental Surge) in `SUPER_TABLE`; Daily Trial picks from `WX_BASE` only.
- Phase 8 chance encounters (`chance.js`): help, duel, trader; pool from `G.sub`; about 1 in 170 steps after a 30 step gap, 2 per area, fields and caves only; state `G.ce`.
- Phase 9 factions (shown to players as Guilds since v0.5.0) (`factions.js`, `G.fac`, `META.facBest`): Wayfarers' Guild, Smiths' Union, Alchemists' Circle, Beastwardens, Archivists (and later The Steady Hand); ranks at standing 0, 40, 110, 230, 400, 640 (`REP_AT`); perks off in the Daily Trial. UI: Records > Factions, Guides > Factions (missions).
- Phase 10 balance (`balance10.js`, `bossim.js`, `echosim.js`, `xpcurve2.js`, `hours10.js`): see the numbers in git history of the old notes; pacing about 31 minutes per stage on the required path.
- Phase 11 code: `config.js` loads first and holds every tunable; data split into data, heroes, skills, items, foes, zones.

### Developer guide: how to add things
- **Hero:** a row in `RAW` (heroes.js): id, name, class, elements, trait, bio, source tag (`s` starter, `tN` tavern from stage N, `rN` rare, `x`/`L` special), look. Signature skill name in `sigskills.js` (`SIG_NAMES`).
- **Skill:** skill tables in `skills.js`; delivery tag in `archetype.js`.
- **Monster:** `MON` in `foes.js`; a zone `pool` in `zones.js`; archetypes in `archetype.js`; drops in `MON_DROPS`.
- **Item or gear:** `ITEMS` or `addGear` in `items.js`; tier from `ITEM_TIERS`; recipes through `R({...})`.
- **Zone:** `ZONES` in `zones.js` with a theme (meadow, coast, cave, snow, heights, void); weather in `WX_TABLE` and `SUPER_TABLE` (config.js).
- **Faction:** `FAC` in `factions.js` (id, name, six ranks, five perks), counter in `facRaw`, missions `FMIS`, stock `FSTOCK`, charm in items.js.
- **Weather:** `WEATHER` in engine2.js (or world3.js for rare skies), `WX_TABLE`/`SUPER_TABLE`, drawn in `weatherFX` (worldrt.js). Never touch `WX_BASE` unless the Daily Trial plans may change.
- **Tunable number:** `config.js` first.
