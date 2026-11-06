# Wayfarers (Beta): design notes, Beta v0.5.0 and v0.5.1

Versioning: Phases 1 to 5 shipped as Beta v0.5.0. Build IDs, Phase 6, the final Phase 7 pass and the follow up fixes ship as Beta v0.5.1 (one bump for the rest of the pass). After that only the last digit goes up per game change (next: v0.5.2).

Read after `design-notes-v033.md`, `design-notes-v041.md` and `audio-notes-v045.md`. Where they disagree, this file wins.
The spec for this pass is `v050-prompt.md`; the rollback point is `rollback-v046.md` (commit `2c9f47f`, Beta v0.4.6).

## Compatibility
- Save keys (`aurelis-wayfarers-v3`, slot keys, `aurelis-meta-v1`) and db schema versions are unchanged. Every new field is optional and defaults safely (listed per phase below).
- Daily Trial stays seeded and deterministic.

## Phase 1: bugs
- **1.1 Tavern, no area cap.** `tvLeft()` always reports room and `hireOK()` only checks the hero exists; `TV_CAP` is `Infinity` (config.js). Limits are four seats (`TV_SLOTS`), a hired seat stays empty until the next shuffle, the shuffle needs a rest or stage clear plus `TV_CD` battles, and gold. The tavern screen has no "Recruits left" counter and no "No room" button; a Hire button is disabled only when gold is short. `G.tv.n` still counts recruits per area for records. Help (Guides > Help, "The tavern") explains the rules. Test: `chrome/v050p1a.js`, `chrome/tavern.js` updated.
- **1.2 Wide screen after battle.** The world view was sized in `buildScreen()` before the header for the world screen was drawn, so after a battle it used the battle header's height; a resize while the results were up measured a detached canvas. Now `worldSizeCanvas()` ignores a detached or hidden canvas, `render()` sizes the view again once the new header is in place and once more on the next frame, a ResizeObserver on the header resizes it when the header changes height, and switching between world and battle resets page scroll. Test: `chrome/v050p1b.js` (16:9, 19.5:9, 21:9, portrait, with level ups and rotating mid battle), `chrome/wide.js`.
- **1.3 Paths are protected (`pathguard.js`, last in the build since v0.5.1).** Works on the tile grid, so it covers every generator and every old save. Walkable counts assets as floor. A room tile is inside some fully walkable 3x3 block. A corridor tile is walkable and not a room tile; an alcove (one walkable neighbour, which is a room tile) is allowed. Protected: corridor tiles (dead ends and loops included), roads and bridges (`=` and `B`; a `:` plaza counts as open ground), a prop standing on a road line, doorways (the room tile a corridor opens into and the tile inside it), the start tile, every required target that is not itself solid and its neighbours, and any tile whose loss would cut its neighbours apart (`pgCuts`). Assets: chests and key chests, levers, dungeon stairs `E`, loose props and decor (`xbhkuavgNPeLm`), and standing NPC homes (gate guards excepted). `pathAssets(m)` lists offenders; `guardPaths(m)` moves them: chests keep their entry, contents, opened state (the `G.chests` key is copied) and mimic roll (`entry.from` feeds `chestHash`); stairs move to a wall alcove whose floor is a room tile off every corridor (the start tile and the lost wayfarer follow); levers and key chests stay in their room (never through bars or doors); decor on a path is removed; NPC homes move. Every move is checked with `mapIssues()`. It runs on every map as it is built (`getMap`, and the fortress builder in sites.js), so a new journey and an old save get the same map and old saves heal on load. Test: `chrome/v050p1c.js 110` (raw generation shows the old bug; after the guard 550 towns, 550 fields, 550 dungeons, about 420 caves and 440 fortresses have no asset on a path tile and every target is reachable).
- **1.4 Battle Back.** The command header (`.who.cmdhead`, sticky) carries a Back button at every level: greyed at the top, otherwise one step up (target to Skills or Items, Skills, Items and Switch to the top). Esc and pad B do the same. Test: `chrome/v050p1d.js`.
- **1.5 Shop back arrows.** `modalBack()` (nav.js) gives the Smithy, Alchemy, Guild Hall, Tavern, Inn and Quest Board the back arrow next to the X on every screen: a sub tab or Forge category goes back to the shop's first tab, the first tab leaves the shop. Test: `chrome/v050p1e.js` (25 screens).
- **1.6 Minimap everywhere.** An unknown weather key made `wkwUpdate()` throw before the minimap was inserted. The weather chip now falls back to Clear, `ensureMini()` runs after `wkwUpdate` in its own try and after every world render. The small phone default (off below 560 px) and the toggle are unchanged. Test: `chrome/v050p1f.js`.
- **1.7 Inn.** "A warm bed for your wayfarers." Test: `chrome/v050p1h.js`.
- **1.8 Status symbols (`stsym.js`).** `ST_SYM` holds a 10x10 SVG per status (drop, drips, flame, hourglass, star, crossed eye, roots, down arrow, cracked block, skull, torn cross, up arrow, shield, double chevron, heart, ring, exclamation, crosshair, broken shield), each with its own shape and colour. `stSym(k)` is used on the battle stage tags, battle cards, the switch list, Party, Roster (roster cards now show ailments too) and Equipment rows, the status popup and Lore. Tapping a symbol still explains it. Test: `chrome/v050p1g.js` (no letters, every symbol inside its box, all distinct).
- **1.9 Tempering order.** `temperRank()` (temper.js): pieces that can be tempered now come first, biggest improvement first (for the wearer, or the best party member for a spare, via `gainFor`); the rest follow by how close they are (70% materials in hand, 30% gold), then by improvement. Test: `chrome/v050p1h.js`.

## Phase 2: battle and world logic
Full report: `v050-phase2.md`. Code in `p2world.js` (next to last in the build, before `pathguard.js`; it wraps `startBattle`, `encounterFoes`, `getMap`, `battleTheme`, `unitBox`, `tvPool`, `subReq`, `settingsBody`, `mMenu` and replaces `placeNodes`) plus `bg.js` and `battle.js`. Config: `BATTLE_GROUND`, `SURPRISE`, `DUAL_FROM`, `TOWN_LANE`, `HINTS_UNTIL`, `HINT_DELAY`. New optional fields: `META.hints`, `META.cfg.hints`.
- 2.1 one ground plane per backdrop from `BATTLE_GROUND.gy`; water, lava and sky only above it; every unit's feet on it; flyers hover with a shadow; backdrop from the starting tile; boss, echo and miniboss stages. Test `chrome/v050p2bg.js` (91 backdrops, 6 heroes and 5 foes, both stages).
- 2.2 an unaware roamer gives a free first round with a Surprise! banner; elites keep no auto.
- 2.3 gathering spots beside matching terrain with a matching prop, never on roads, stairs or doors.
- 2.4 every town gate has a clear lane at least 2 tiles wide to the main roads; a gate may slide along its own edge.
- 2.5 seven new entrance looks plus the facade, by realm.
- 2.6 no dual type wayfarers or regular monsters before the second realm (`DUAL_FROM`); bosses, minibosses, elites and specials exempt; Bestiary explains.
- 2.7 seven once-only first realm hints using the party's names; Settings toggle; Guides > Hints.
- Daily Trial checked identical to v0.4.6 (`chrome/v050p2daily.js`).

## Phase 3: shops, gear and items
Full report: `v050-phase3.md`. Code in `p3shop.js` (after `economy.js`). Config: `ITEM_MAX` (50), `ITEM_MAX_DAILY` (9, the Daily Trial keeps its old limit), `invCap()`, `SHOP_BEST`, `SMITH_PLAN`, `BP_AWARE`, `READY`, `PORK`. New optional fields: `G.hwAuto`, `G.p3pork`, `META.cfg.shopF.p3`.
- 3.1 "Best for party" sort (default) with tradeoff lines; Tempering uses `temperOrder` (ready first by gain, then by closeness, which is also 1.9). 3.2 duplicates name the second hero's gain. 3.3 Smithy "Buy, craft and equip best gear" plan with confirm, Undo and a stop when gold runs out. 3.4 Best Party scores delivery coverage, legal weapons and the Bestiary (area foes, the boss's element and archetype) with reasons, then offers to equip; Detonators were never counted before (role key `det`). 3.5 team gaps with one tap swaps. 3.6 boss readiness that never blocks or spoils. 3.7 Holy Water reapply. 3.8 stack limit 50. 3.9 two Pork Chop Sandwiches from the first boss; "Use 2: return to town" in dungeons.

## Phases 4 and 5: party, guilds, quests, settings, saving, title
Full report: `v050-phase45.md`. Code in `p4xp.js`, `p4party.js`, `p5settings.js`, `p5trans.js`, `p45hook.js`. Config: `PERSONAL_BT` (40), `PERSONAL_REALM`, `XPCU` (+10% per level gap, up to +50%, reserve half), `TRANS` (time of day 11 s, weather 6.5 s), `SAVE_UI`. New optional fields: `META.cfg.master`, `muteMusic`, `muteSfx`.
- 4.1 personal quests need 40 battles together and the second realm; old started or finished quests and estimated battle counts untouched. 4.2 Factions shown as Guilds (text only; keys and ids unchanged), The Steady Hand Guild, a Guilds tab in the Guild Hall. 4.3 XP catch up replaces the old flat x1.4; result screen row; ending level still 39. 4.4 the lingering energy message after each base boss.
- 5.1 Master, Music and Sound effect sliders with mutes. 5.2 debounced auto sync plus a push when the page hides; visitors stay local. 5.3 "Wayfarers (Beta)" everywhere a player reads the title (`package.json` productName kept so the Windows save folder does not move). 5.4 blended time of day and weather; instant under reduced motion. 5.5 pinned Save button with slot and time, a corner Saving / Saved note with Retry, the cloud icon beside it.

## Beta v0.5.1
- **Build IDs.** `v3build.py` hashes the page's code (every module except appver.js, plus fonts.css, style.css, shell.html, liveboot.js) and writes `APP_BUILD` into `v3/appver.js` and `build` into `version.json`. `liveboot.js` treats a newer version, or the same version with a different build, as an update; never an older version. Details in `audio-notes-v045.md` (Android live updates). Test: `chrome/liveupdate.js`.
- **Fix: defeated mimics after a chest move.** `healMap` clears an opened mimic chest at the position it was built on, but the path guard could move that chest afterwards, so a beaten Mimic came back. `guardPaths` now runs the same cleanup at the end. Test: `chrome/v041p1c.js` (failed on 0.5.0, passes now).
- **Fix: battle hints over the foe cards.** A 2.7 hint during a battle sat at the bottom of the screen over the foe cards and their shield pips. `hintPlace()` (p2world.js) now puts it in the sky at the top of the battle stage. Test: `chrome/v051a.js` (failed on 0.5.0, passes now), `chrome/v040p1.js` no longer fails at random.
- `chrome/smithywalk.js` updated for 1.5: Esc from a Smithy sub tab goes back to the first tab, a second Esc closes.
- Workflow: actions on their Node 24 majors (checkout v7, setup-node v7, setup-java v6, upload-artifact v7, download-artifact v8, action-gh-release v3), Node 24 for the builds, Linux jobs pinned to `ubuntu-24.04`.
- **3.1 finished: Tempering tradeoff line.** `temperWhy(list)` (p3shop.js) marks neighbours in the Tempering order that improve the same hero by close amounts (the shop rule, `SHOP_BEST`) and adds a short line on the second row: what each temper adds for that hero's class, the weapon family perk when the families differ, which costs less gold. Test: `chrome/v051b.js`.
- **Tempering speed.** Identical spares share one row ("Pack (x2)"; tempering works on the first copy) and gains are memoised; the minimap check after a render runs on the next animation frame and caches the screen width, so a render no longer forces a layout. `chrome/smithy3.js` (every piece twice in the pack) renders Tempering in about 0.5 s, down from about 1 s in v0.4.6 and v0.5.0.
- **Fix: town NPCs back on a path.** Phase 2's town lane fix (p2world.js) wraps `getMap` from outside and moves NPCs after the path guard ran. `pathguard.js` is now last in the build, so the guard is the outermost `getMap` wrapper and checks the finished map. Test: `chrome/v050p1c.js`.
- **Balance sims on the real game: `tools/fullsim.js`.** Loads every v3 module in build order in headless Chrome and drives battles with the same queue loop as `tools/v3sim.js`, so every v0.5.0 system is live. The "win it manually once first" auto lock on bosses (prog2.js, not loaded by the old node sims) is lifted inside the sims, which stand in for a player who plays every fight. `node tools/fullsim.js boss|stage1|xp|journey [n]`; `SIMROOT=<checkout>` runs the same sims on another build (before/after).

## Phase 6: graphical upgrade (shipped in v0.5.1)
Full report and frame rate tables: `v050-phase6.md`. Code in `gfx6.js`, `gfx6world.js`, `gfx6battle.js` (after `p2world.js`), wrappers and extra drawing passes only. Config: `GFX_Q` (per tier: particle cap 140/280/500 and which passes run), `GFX_AUTO`, `GFX_PARA`, `GFX_CAM`. New optional fields: `META.cfg.gfx` ('auto' when missing), `META.cfg.gfxAuto`.
- 6.1 glow on lamps, windows, torches, braziers, crystals and spells (cached sprites), townsfolk shadows sorted by depth, soft shading at the foot of cliffs and walls baked into the map, vignette, parallax in battle and on the title, menus dim or blur the scene. Lighting reads `phaseProg()` and the weather every frame, so the 5.4 blends carry over.
- 6.2 softer panels, crisper text, press feedback, focus rings, gliding bars, smoother menu entrance; status symbols, shield pips, the primed marker, element icons and the save indicator untouched.
- 6.3 water glints, swaying grass, drifting leaves, sand, ash or dust, birds, critters that hide, townsfolk gestures, wind that follows the weather. Skipped: swaying trees (baked into the map) and new townsfolk routes (positions are game state).
- 6.4 hit dust, victory hops, impact frames; breathing, walk cycles, weapon family poses and KO poses kept. Skipped: cloth and hair motion and turn frames (need new sprite frames).
- 6.5 camera pushes on crits, reactions, breaks and Limit Breaks (canvas and unit layer move together), capped shake, element effects; parallax moves sky and far bands only, never the ground band of 2.1.
- 6.6 Low drops glow, leaves, birds, critters, grass, parallax, impact frames and element particles; Auto starts on Medium, drops a tier below 45 fps, climbs at 57 fps, never back to a tier that failed this session. Reduced motion draws still frames.
- Test: `chrome/v050p6a.js`; frame rates: `chrome/v050p6perf.js`; screenshots: `chrome/v050p6shots.js`.

## Beta v0.5.1 follow ups (after a phone report)
- **World view after battles on foldables and the Android app.** The view could be measured while the screen was still settling (about a third of its box) with no resize event afterwards. The world screen now re-checks its size every 0.5 s (`worldSizeCanvas` only touches the canvas when the numbers change) and on orientation changes. Test: `chrome/v051c.js` (shrinks the measurement mid transition, no resize event, checks the view recovers).
- **New skills lead the battle results** (`.learntop`, first section of `mResult`). Test: `chrome/v051c.js`.
- **Quests ready to hand in (`qready.js`).** A Quest Board quest or Guild mission that is complete and waiting is announced once with a toast; the Menu button carries a count (`.qdot`), the Quests chip says "N ready", ready rows are tagged. New optional field `G.qNote`. Test: `chrome/v051c.js`.
- **Party menu:** status symbols sit on their own line under the hero's name (`.swstrow`); the portrait in that card no longer repeats them (`port(id,'noail')`). Test: `chrome/v051c.js`.

## Phase 7: balance and code check
All sims below run on the real game: `tools/fullsim.js` loads every module in build order in headless Chrome (v0.4.6 through `SIMROOT`). The old node sims (`tools/*.js` with `v3sim.js`) load 17 core files only and cannot see any v0.5.0 system.
- **Late bosses (careful play, `fullsim.js boss 6`), v0.4.6 → v0.5.1.** Party of 6: lv 30 Scourge 53→56%, Calamity 11→8%, Echo 63→72%, Echo Calamity 15→18%; lv 35 71→75%, 39→33%, 83→85%, 40→44%; lv 40 94→94%, 78→75%, 90→96%, 86→81%; lv 45 90→94%, 60→65%, 89→86%, 81→78%. Party of 3: lv 30 10→7%, 0→0%, 7→15%, 1→1%; lv 35 25→26%, 1→0%, 40→40%, 15→8%; lv 40 42→38%, 8→11%, 57→61%, 36→33%; lv 45 44→39%, 14→8%, 44→49%, 43→43%. Within sim noise; no change made.
- **Stage 1 (`fullsim.js stage1 400`), party of 3 at level 3.** Careful 95→96% wins, HP lost 11→13%; auto 94→93%, 14→13%. Dual type foes 563/832 → 0/877. Roamers at level 7: unaware give a Surprise round 196/196 (win 100%, HP lost 1%), aware 0/196 (win 99%, HP lost 3%).
- **XP catch up (`fullsim.js xp 30`).** Newcomers 3 to 10 levels behind gain faster than before, the top hero never gets a bonus, every fight with a gap shows the result row.
- **Full journey pacing (`fullsim.js journey 8`).** Each stage's required route on the real maps at the real encounter rate, a recruit per realm up to six, each boss fought until it falls (5 more fights after each loss). Top hero's ending level: v0.4.6 mean 43.0 (39 to 48), v0.5.1 mean 40.4 (median 41, 32 to 47); party average 41.6 → 39.5. Jason accepted 40 as the target ending level, so no balance change was made. Quests, chests and side caves are not counted.
- **Gold, prices, hours (node sims, unchanged code paths).** Gold per won fight 44/104/158/220/269 → 47/94/149/222/274 against unchanged prices; minutes per stage 12 to 15 in both.
- **7.2 code.** Every new tunable lives in config.js: `TV_CAP`, `ITEM_MAX`, `ITEM_MAX_DAILY`, `SHOP_BEST`, `SMITH_PLAN`, `BP_AWARE`, `READY`, `PORK`, `BATTLE_GROUND`, `SURPRISE`, `DUAL_FROM`, `TOWN_LANE`, `HINTS_UNTIL`, `HINT_DELAY`, `PERSONAL_BT`, `PERSONAL_REALM`, `XPCU`, `TRANS`, `SAVE_UI`, `GFX_Q`, `GFX_AUTO`, `GFX_PARA`, `GFX_CAM`.

## Beta v0.5.2
- **Fix: the map view after battles on a Galaxy Z Fold opened.** The world canvas is rebuilt after a battle and starts at the browser default 300x150 with no CSS size. `worldSizeCanvas` only resized when the computed size differed from the stored one or from the canvas width; on a view exactly 300 logical pixels wide (about 932 to 934 CSS px wide, the Fold 8 inner screen) nothing differed, so the canvas showed at 300x150. It now also compares the canvas height and its CSS size. Test: `chrome/v051c.js` sweeps widths 920 to 946 through a battle (fails on v0.5.1 at 932, 933 and 934; passes now).

## Beta v0.5.3: UI overhaul ("Gilded Night")
Full write-up: `v053-ui.md`. One new stylesheet, `v3/ui3.css`, built after `style.css` (and into the build ID). Original style: night blue panels with a faint texture, thin gold double borders and SVG corner ornaments; gold means selected or primary. Gold tab strip for menu groups, underlined sub tabs, a diamond cursor on battle commands, framed portraits, wine red foe cards, framed order and boss bars, a slim world HUD plaque, a framed title. Readability items (status symbols, pips, primed marker, element icons, save and cloud indicators, quest tags, hint position) untouched. Touch targets at least 40 px (several were 29 to 35 px before). Tests: `chrome/v053ua.js` (no overflow on every screen at five sizes, Party 3+3 visible, touch targets), `chrome/v053ub.js` (4.5:1 contrast on 17 screens, focus rings, reduced motion).

## Beta v0.5.4: HD sprites
Full write-up: `v053-sprites.md`. `SPRITE_HD` (config.js, with `SPR={k:2,addH:6,...}`) switches it; false restores the v0.5.2 sprites. `sprhd.js` (after art3.js) keeps every look builder and replaces the painting step (`paintHD`: Scale2x, a six step ramp per material, rim light, coloured outlines, faces, hair sheen, metal plate edges, cloth folds, monster surfaces by archetype; `stretchHero` makes heroes 6 rows taller). HD canvases keep the full bitmap but report their logical size, so every consumer works unchanged. `sprhd2.js` (last) renders the world and battle canvases at 2x through the sizing hooks, only above the Low graphics tier (`sprHiRes()`), and warms the party's sprites in idle time. Sprite build cost about 3x (about 5 ms each). Tests: `chrome/v053s.js`, `chrome/v053sperf.js`; `chrome/v043c.js` now accepts a bridge as the road a town gate lands on (2.4 lanes in river towns).

## Beta v0.5.5: HD-2D battle stages
Full write-up: `v053-battle.md`. `hdstage.js` and `hdspell.js` (after `gfx6battle.js`). A WebGL1 canvas `#bgl` sits under the 2D unit canvas `#bcv` (now transparent) in the same box; `#bstage` stays on top, so numbers, tags, pips and taps are unchanged. Far backdrop blurred and bloomed; a perspective floor per ground type starting at `bgGY(H)` (2.1 rules hold); theme and spell lights, unit shadows, grade by time and weather, rim light, shafts, vignette; boss stages with braziers and a rune circle. Medium bakes the lit stage and redraws GL only on changes (fps unchanged: 55 to 56 throttled); High renders units through GL too. Low, no WebGL, a GL error or a lost context run the old 2D path. Config: `HD_BATTLE`, `HD_FLOOR`, `HD_LOOK`, `HD_CAM`. Test: `chrome/v053b.js` (36 checks); Daily Trial identical (`chrome/v050p2daily.js`).

## Beta v0.5.6: HD-2D world renderer
Full write-up: `v053-hd2d.md`. `hd2dgl.js` and `hd2d.js` (before `pathguard.js`). WebGL1, a 40 degree tilted camera following the hero; walls, cliffs and town walls extruded with code-drawn faces, houses as boxes with gabled roofs cut from their sprites, props as upright cards from `drawObjects`; billboards for every character with soft shadows; an x-ray circle and silhouette keep the hero visible. Ambient and sun per phase and place (blended with 5.4), baked sun shadows, a per-frame light map for every light source, fog, bloom, tilt-shift focus, shafts, grading, vignette. Weather and fades still draw on the 2D canvas on top. Taps pick a character or ray-cast to the tile. New optional `META.cfg.hd2d` (Settings > HD-2D world, default on). Low, no WebGL, a lost context, the setting off or any renderer error use the old 2D renderer. Throttled software WebGL: Medium 48 to 60 fps, High 42 to 56. Known limits: a building just south of the hero hides the street in front of a door except through the x-ray circle; tapping a tree canopy picks the ground behind; water glints, swaying grass, critters, birds, bunting, swallows and fireflies are not drawn in HD-2D yet. Test: `chrome/v053a.js` (29 checks).

## Beta v0.5.7
- **Fix: characters sliced in the HD-2D world.** `H2Atlas.get` (hd2dgl.js) sized each billboard slot by the canvas's `width`/`height`, but HD sprite canvases (sprhd.js) report their logical size while holding a 2x bitmap, and `texSubImage2D` uploads the whole bitmap. Slots and UVs now use the real bitmap (`_rw`/`_rh`); the quad keeps the logical size. The world renderer and the HD sprites were built in parallel, so neither branch's tests saw the combination. Test: `chrome/v056a.js` (fails on v0.5.6: a 36x46 slot for a 72x92 bitmap; passes now).

## Beta v0.5.8
- **Fix: element badges and bars covered on the battle stage.** The HP bar, limit bar, shield pips, primed mark (battle.js) and the element badges (a wrapper in battleui.js) were drawn right after each unit's own sprite, in y order, so a unit standing lower covered the badge of the unit behind it (the owner's report: a knight's element icon under the mage in front), and rain and snow drew over all of them. They now live in `unitHud(ctx,u,b,now)`, which `battleFrame` calls for every unit after all sprites, particles and weather; `drawUnit` records the animated position in `u._hud`. Test: `chrome/v058a.js` (Low and Medium, clear, snow and rain, portrait and landscape): fails on v0.5.7 in all 8 cases, passes now.

## Beta v0.5.9
- **Primed marker.** `primedTag` (ui.js) is a small floating element badge with the turns left (`.primed.pmin`, a gentle bob, still under reduced motion), replacing the "PRIMED ICE 1T" chip. The canvas sphere, ground ring and orbiting sparks in `unitHud` are gone, and the stage status row no longer repeats a primed chip (`stItems(u,{noPrime:true})`); the foe card's "PRIMED: element, turns" line and the tap popup keep the details.
- **HD-2D focus band.** `HD2D.dof` is now `{shift:.06,band:.24,ramp:.5,max:.7}` (was band .1, ramp .32, max 1), and the post shader blurs the near side (below the hero) at 35% of the far side. On a portrait phone the whole lower half used to smear.
- Test: `chrome/v059a.js`.

## Beta v0.6.0
Versioning: the last digit passed 9 after v0.5.9, so the middle digit went up (CLAUDE.md rule); next is v0.6.1.
- **No update popup.** The `svupdate` export offer after each version change is off (saves.js; the modal code stays for reference). Saves sync to the account; Export remains in the Journey tab. Test: `chrome/v043b.js` updated.
- **Title menu.** `.tmenu`: `.tmain` (Continue first and gold when any slot has a journey, then New journey, Daily Trial), `.tmore` (Settings, Help / Feedback), and `details.ttools` "Saves and codes" (Import save, Recover saves, Redeem code).
- **Clean type.** `--fd` (titles, banners, labels) is Nunito instead of Pixelify Sans in style.css and ui3.css; the save message and cloud icon too. The blackletter logo (Jacquard 24) stays. Test: no element in the page computes to the pixel font.
- **Targeting.** No outline box on targetable foes (`.unit.tg`): the canvas already pulses a glow on them; keyboard focus is a soft radial glow. Name and effectiveness hints stack above the foe.
- Test: `chrome/v060a.js` (title order and grouping, no popup, no pixel font, no target box; screenshots in `shots-v053/`).

## Beta v0.6.1: battle rewards screen
`results.js` (after `p45hook.js`) replaces `mResult`: the tame card first (`.rs-tame`), new skills, who joined (`rsJoin`: "Legendary" only for legend joins; chance meetings set `info.legendKind` to `wayfarer` or `duel` in chance.js), a rewards grid (`rsGrid`), every hero in the fight with the XP they gained (`info.xpBy`, measured by wrapping `win()` and comparing each hero's total XP before and after, so the catch up bonus is included), the catch up percent and level ups on that hero's row (`rsParty`; the old separate Catch up row from p4party.js is folded in), then quests, bonds and notes. `ACT.resultOk` with a tame pending sets `info.tameWarn` and the footer offers Tame it or Leave it and continue (`ACT.resultLeave`). The save note moves to the bottom corner while a window is open. Tests: `chrome/v061a.js`; `chrome/v050p4.js` reads catch up from the hero rows.

## Beta v0.6.2: sprites in the HD-2D scenes
Full write-up: `v058-sprites-in-scene.md`. World (`hd2d.js`, `hd2dgl.js`): characters have their own shader (`char_f`): scene ambient, sun or moon inside the baked shadow, the light map at the feet (spread so a lamp lights its side), shading toward the feet, a slight desaturation before the grade, fog and a rim on the edge facing the key light; billboards at 2/3 size with crisp 3:1 copies (`hdSmall`); soft contact shadows. Bugs fixed: the blended pass had the ground texture bound (hard dark bars, tinted glow boxes), the x-ray silhouette drew below the ground (pale line), the light map clipped at 1 (a torch changed nothing). Battle (`hdstage.js`): High lights units per pixel by their feet; Medium caches a lit copy per lighting state (`hbLit`, refreshed every 250 ms); HUD stays unlit (alpha 254, element badges through an `elShapeCv` copy). Config: `HD2D.spr`, `HD_SPR`. Test: `chrome/v062a.js` (fails on v0.5.7: day/night, torch, dark bar, cache).

## Beta v0.6.3: party tools
Details in `v063-party.md`. Best Party formations (Balanced, Boss ready / Area answer, Fresh mix, Rotation fallback) and Training team in `v3/party3.js` (tunables `BP6` in config.js); catch up XP gap measured against the roster's top level (`p4xp.js`, XPCU unchanged, journey mean top level 41.6); "Equip best: at camp" for heroes outside the party; Legendary only for LEGEND_IDS, Epic for other rare heroes. Tests `chrome/v063pa.js`, `chrome/v063pb.js`.
Beta v0.6.4: heroes outside the party are the Reserves and the back three of the party the Rearguard (owner's choice, replaces "At camp").

## Beta v0.6.5: taming log, bond goals, camping
Details and the pacing audit in `v063-progression.md` (`v3/v063prog.js`, `CAMP` block in config.js, test `chrome/v063g.js`). Audit: nearly every system unlocks in realm 1 and levels 15 to 30 get little new; camping is gated to realm 3, other gate moves are proposals in that doc.

## Beta v0.6.6: weekly Daily Trial twist and New Game+ modifiers
Details in `v063-twists.md` (`v3/twists.js`, `TWISTS` in config.js, tests `chrome/v063wa.js`, `chrome/v063wb.js`). Twist = TWISTS.daily[(isoYear*53+isoWeek) % 10], deterministic. Known: Ironman auto may waste a turn trying to revive; Healing halved skips Regen and drain; Glass foes may be harsh.

## Beta v0.6.7: no capes on sprites, one icon per item
Details in `v063-art.md` (`v3/icons.js`, `v3/icons2.js`, test `chrome/v063s.js`): 381 icons, 0 duplicates; capes keep stats but draw nothing; Camp Supplies has its own bedroll icon.

## Beta v0.6.8: world fixes and the world map
Details in `v063-world.md` (`v3/worldfx.js`, `WFX`/`WMAP` in config.js, test `chrome/v063wo.js`). Root cause of the boxes over the hero: the HD-2D overlay cleared only a quarter of the 2x canvas.

## Beta v0.6.9: shops and menus
Details in `v063-menus.md` (`v3/menus3.js`, tests `chrome/v063m1.js`, `chrome/v063m2.js`). Panels sized from the visible screen height (the 92vh cap counted the area behind the browser bar). smithy3 Tempering render sits at the 600 ms line on v0.6.8 too.

## Beta v0.7.0: battle screen
Details in `v063-battle.md` (`v3/battle3.js`, `v3/battle3.css`, `B3` in config.js, tests `chrome/v063ba.js` to `v063bd.js`). One layout pass places every stage label off sprites and off each other; the start flash draws at the canvas backing scale; detonator targets glow with the reaction named.

## Beta v0.7.1: Vanguard, catch up curve, remembered toggles
Front three are the Vanguard (all user facing "front line" text). XPCU {per:.15,sq:.02,max:3,bench:.5}: bonus = per*gap + sq*gap^2 (cap +300%); the top hero never gets it, so the journey pacing for the top hero is unchanged. `v3/remember.js` stores Auto and Run in META.cfg.autoOn/runOn. Quest lists sort claimable, active, open, done. Best Party's Equip best gear becomes a done note once used. Test `chrome/v071a.js`.

## Beta v0.7.2: pacing spread and Rearguard XP
Owner approved the v063-progression.md proposals: `v3/pacing.js` gates guild missions and Tempering behind the first Scourge (Tempering stays open with tempered gear), the Tamer's Stick quest moves to stage 1, PERSONAL_REALM=2. XP_REAR=1 and XPCU.bench=1: the Rearguard earns the same XP and catch up as the Vanguard. Test `chrome/v072a.js` (+ v050p4, v071a).

## Beta v0.7.3: tips (onboarding)
Details and every card in `v070-onboarding.md` (`v3/onboard.js`, tests `chrome/v070oa.js`, `chrome/v070ob.js`). META.tips holds seen/used; Tips toggle and Reset tips in Settings; Guides > How it works.

## Beta v0.7.4: title scene, wordmark, emblem and app icons
Details in `v071-title.md` (`v3/logo.js`, `v3/title7.js`, icons generated by `tools/mkicons.js`, test `chrome/v071t.js`). Windows icon is now `assets/icon.ico`; Android launcher and adaptive icons in `android-res/`.

## Beta v0.7.5: battle information and mechanics
Details in `v070-battle-info.md` (`v3/battle5.js`: turn forecast bar, foe intents planned in advance by foePlan/foeChoose, timed hits) and `v070-battle-mech.md` (`v3/battle4.js`: detonation MP refund, free swap, Momentum, foe roles and the Scourge Cataclysm; roles fold into foePlan via b4RolePlan). Forecast tests relaxed (v070ia) because auto now Guards against telegraphs and uses free swaps. Also fixed the onboarding tip on the rewards window judging itself by the battle screen underneath (flashed on and off; test `chrome/v075a.js`). Open: journey 8 measures 42 to 44 for the top hero, a little above the accepted 38 to 42.

## Beta v0.7.6: tap to walk and the hidden blocker sweep
Details in `v071-world.md`. Root cause of the Hearthholm stuck spot: a bush on the row just north of the town wall, fully hidden by the wall in HD-2D but still solid. `pathguard.js` now moves or clears every prop HD-2D would hide (pgHides), keeps door aprons clear, fills holes in buildings, and laneFix steps gate arrivals back instead of paving a building. Tap to walk in `map.js` (A* over seen tiles). Tests `chrome/v071wa.js`, `v071wb.js`, `v071wt.js`.

## Beta v0.7.7: mission progress, detonator symbols, no tap flash
facProg counts the journey total (acc only marks a mission taken); detonator notes in the skill list are element symbols with the words in the tooltip (ui.js detNote, battle3.js detList); global -webkit-tap-highlight-color:transparent and no selection on the world and stage. Test `chrome/v077a.js`.

## Beta v0.7.8: unique challenge lines
Details in `v077-duel-lines.md` (`v3/duellines.js`, 736 lines, 8 per hero plus bond replies and Guild challengers; fallback built from name, class, element and trait; picks by journey seed, never the game RNG). Test `chrome/v077d.js`.

## Beta v0.7.9: wide battle layout
Details in `v076-battle-layout.md` (battle3.js/css, B3.wideMin/wideStep in config.js, test `chrome/v076b.js`). Two columns under the stage: commands over foes, party (Vanguard then Rearguard rows). No page scroll at 933x705 to 1280x800; aim tags shrink to fit their box. Type chips left off wide foe cards (still in the i panel).

## Beta v0.8.0: weather in layers, old visuals pass
Details in `v077-weather.md` (`v3/weather7.js`, `v3/visuals7.js`, `WX7` in config.js, tests `chrome/v077wa.js`, `v077wb.js`). No game RNG used; lightning at most 2 flashes per strike, under 100 ms, peak 0.42. Victory crest, Arena backdrop and minimap upgraded.

## Beta v0.8.1: Build Party
Renamed Best Party to Build Party. p6Train: the lowest levels on the roster; a missing tank or healer is filled by the lowest level hero with that role (replacing the highest non unique member). p6Fly + BP6.fly: flying share of the area (seen foes, else the pool) and a flying boss reward ranged deliveries (one 1.2, two +0.35, an Archer +0.45), since piercing and magic only half answer flyers and Archers were never picked. Tests `chrome/v081a.js`, `v063pa.js` (training rule).

## Beta v0.8.2: rival ghosts, quiet rewards exit
Details in `v080-rivals.md` (`v3/rivalghost.js`; test `chrome/v080r.js`). Leaving the rewards screen is silent: no level jingle in resultOk, and qready's chime waits 5 s after a battle ends (V.endT set in results.js). window.__SFX records sound names for tests (`chrome/v082s.js`).

## Beta v0.8.3: chest opening, softer chest sound, Equipment lists the party
worldfx.js: WFX_OPEN plays the opening on top in both renderers (lid at 45% of WFX.chestAnim.open, glint, hold while the find text or a window is up, then fade). sfx2.js chest noise halved; the item jingle is celesta led and its gain 2.5 -> 1.1; classic chest chime is a soft triangle. vEquipTab lists G.party only. Test `chrome/v083a.js`.

## Beta v0.8.4: secondary roles and balance
Details in `v080-roles-balance.md` (`v3/roles.js` heroRoleSet, ROLES in config.js, 7 role weapon families, 6 role charms; ENC_RATE, ECON.xp, BOSS_BUFF and four outlier bosses eased; fullsim journey models gear buying, 40% manual fights, exploring, and a time model). party3.js p6Role reads heroRoleSet: a secondary tank or healer counts as half (p6StepF). Tests `chrome/v080ca.js`, `v080cb.js`.

## Beta v0.8.5: battle screen on phones and the Fold
Details in `v080-battle-phones.md` (battle3.js/css, battle.js portrait fit; test `chrome/v080b.js`). Transition root cause: the v0.6.3 hdOverlay setTransform x2 wrapper doubled hd2d.js's own 2x transform in the game loop (drawn at 4x); now only identity calls are scaled. Damage type symbols dlIco(d) on foe cards (weak/resist from archetypes), skill delivery chips and aim tags. Stage settles before the first frame (b8CmdEst measures the real menu).

## Beta v0.8.6: fog and weather fixes, walking title
Details in `v080-weather-title.md`. Clarity boxes: w7Bank puffs clipped to a rectangle (fixed with an edge fade), High stage lit weather as unit pixels in a hard column, and the hero box exclusion is now a feathered face ellipse (WX7.face). Title: six heroes walk through cycling realms with parallax; emblem beside the wordmark. Tests `chrome/v080wa.js`, `v080wt.js`.

## Beta v0.8.7: cross-device save sync
Details in `v085-sync.md` (saves.js, cloud.js, p5settings.js, SAVE_UI sync timings, electron/main.js close hook; tests `chrome/v085s.js`, `v085s2.js` with `syncmock.js`). Base version tracking (local key aurelis-sync-v1), transactional push on Firebase, save then push on leaving, Continue waits for the first check, re-check every 60 s and on return, prompt instead of the permanent hold.

## Beta v0.8.8: themed dungeons and the boss lair
Details in `v082-dungeons.md` (`v3/dungeon8.js` after pathguard.js; tests `chrome/v082da.js`, `v082db.js`, perf `v082dperf.js`). Materials per realm match the battle backdrops; organic materials carve wall edges with their own seeded RNG under the reachability and content checks; the lair is a tower, skull gate and beacon with its own map icon and relit look.

## Beta v0.8.9: Fold battle layout follow up
Details in `v080-battle-phones.md` (follow up section; battle3.js/css; test `chrome/v080b.js` with 412x810, 933x615 and 6h/2f). Wide: the arrangement with the largest stage wins (right column 340/370/410 px, log and foes may sit in either column), last panels reach the bottom. Portrait: commands before the party cards, acting hero HP/MP in the command header, bottom padding uses env(safe-area-inset-bottom).

## Beta v0.9.0: title heroes at the world's scale
title7.js uses the overworld walker sprite shrunk like the HD-2D world (hdSmall at HD2D.spr.sc) at a whole device pixel scale, about 1/8 of the scene height (T7.cfg.heroFrac); props banded by distance. Tests `chrome/v080wt.js`, `v071t.js`.

## Beta v0.9.1: title music at launch
ui.js boot calls audioInit() 300 ms after load (the context starts running where autoplay is allowed, else waits suspended for the first tap). The release workflow patches MainActivity to setMediaPlaybackRequiresUserGesture(false); electron/main.js sets autoplayPolicy no-user-gesture-required.

## Beta v0.9.2: natural lair, HD-2D uniforms
dungeon8.js lair section: a rock mound of field rock tiles around the unchanged entrance (kept only if reachability is no worse), HD-2D geometry built like the fortress gatehouse, 2D shaded heightfield, no text; relit look in gold. hd2d.js: the line setting uEmis and uAct had joined a comment in v0.8.0 and never ran. Tests `chrome/v082da.js`, `v082db.js`.
