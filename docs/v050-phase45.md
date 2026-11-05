# Beta v0.5.0, phases 4 and 5 (party, guilds, quests; settings, saving, title)

Worktree branch work for `docs/v050-prompt.md` items 4.1 to 4.4 and 5.1 to 5.5. GAME_VERSION, the v0.5.0 changelog entry and the
design notes are left to the merge. Save keys (`aurelis-wayfarers-v3`, slot keys, `aurelis-meta-v1`), db paths and schema versions are unchanged.

## How it is built
All new code is in new files at the end of the build (`v3build.py`, after `ambience.js`), wrapping existing functions with the
`{const f=orig;orig=function(){...}}` pattern, so shared files are barely touched:

| file | what |
|---|---|
| `v3/p4xp.js` | 4.3 XP catch up (pure engine code, loadable by the node sims with `SIMEXTRA=v3/p4xp.js`) |
| `v3/p4party.js` | 4.1 personal quests, 4.2 Guilds, 4.3 result line, 4.4 boss energy message |
| `v3/p5settings.js` | 5.1 volume, 5.2 sync additions, 5.3 name, 5.5 Save pin, save message, cloud chip placement |
| `v3/p5trans.js` | 5.4 time of day and weather blends |
| `v3/p45hook.js` | test handles, added to `window.__A` in a microtask (no edit to the `__A` lines in shell.html) |

Shared files touched: `v3/config.js` (one block after `PERSONAL_BT`), `v3/shell.html` (the `<title>` line only), `v3build.py` (file list),
`manifest.webmanifest` (`name`), `README.md` (heading).

## New config keys (config.js)
- `PERSONAL_REALM=1` (0 based realm the party must have reached). `PERSONAL_BT=40` already existed and is the battle count.
- `XPCU={per:.10,max:.50,bench:.5}`.
- `TRANS={tod:11000,wx:6500,ambTod:10,ambWx:6}` (ms of world screen time; ambience ramps in s).
- `SAVE_UI={saving:350,hold:2000,fade:450,minGap:2500,syncDelay:6000}`.

## New save / settings fields
No new journey save fields. Settings (`META.cfg`, in `aurelis-meta-v1`): `master` (0..1, default 1), `muteMusic`, `muteSfx` (default false).
`music`, `sfx`, `mute` keep their meaning (sliders now write any value 0..1; the old chip values .25/.45/.7 etc. still read correctly).
Result screen info gets `info.catchup` (not saved).

## Checklist
### 4.1 Personal quests: done
- `personalEligible` / `personalLockText` (engine2.js) replaced in p4party.js: no level gate; needs `btOf(c)>=PERSONAL_BT` and `realmReached(PERSONAL_REALM)` (stage >= 1 or realm 1 cleared; the Daily Trial as before).
- `vPersonal` (Guild Hall) rewritten: only heroes who are eligible or have a started or finished quest are listed; before that, only a note
  ("Personal quests open in the second realm" / "No wayfarer is ready yet"). The What next? hint (progression.js) already used `personalEligible`.
- Hero sheet (`mChar` wrapper): "Battles together: X of 40" plus ". Unlocks in the second realm", ". Personal quest ready at the Guild Hall", ". Personal quest under way" or ". Personal quest done".
- Old saves: `G.personal` entries are never touched and still listed (even in realm 1); `bt` is not written when missing, so `btOf` keeps the (level-3)x5 estimate. `PERSONAL_LV` stays defined but is unused.

### 4.2 Guilds: done
- `guildText()` swaps Faction(s)/faction(s) for Guild(s)/guild(s) in text outside tags only (ids such as `data-arg="factions"` stay). Applied to `vFactions`, `vFacMissions`, every `vModal` output (shop rank strips, Help, changelog lines) and `toast`.
- `FACB.hand.n` = "The Steady Hand Guild" (rank 6 title and the charm keep their names). Perk texts rewritten in place. `MENU_SUB.factions/fmis` = "Guilds" (Records > Guilds, Guides > Guilds). Music Room jingle "Guild rank up".
- Guild Hall (`mGuild` wrapper): a Guilds tab after its own tabs (read from its tab bar, so tabs added by other phases stay) showing ranks, perks, counter stock and missions. Records keeps its Guilds page; Guild Hall name unchanged.
- Not renamed: `G.fac`, `META.facBest`, `FAC`, `fac*` functions, tab ids, music key `rank`. Design notes text: left for the merge.

### 4.3 XP catch up: done
- `p4xp.js` wraps `win` and `addXp`: during a win, a hero `gap` levels below the party's highest gets `1+min(max, per*gap)` (front row) or `1+min(max,per*gap)*bench` (reserve). Top level heroes: no bonus. The fallen still get nothing (addXp is not called for them). The old flat x1.4 for 4+ levels behind (engine.js) is divided back out so the two never stack. Daily Trial untouched.
- Result screen: a "Catch up" row ("Lumen +30% (+20 XP), Brann +25% (+10 XP)") after Gold (`mResult` wrapper).
- Pacing (node, `pacing.js 6 400 3` / `pacing.js 3 400 3`, highest/average level after each stage, boss levels 8/16/24/32/40):
  - before, party 6: `7/7 15/13 23/22 31/30 39/37` and `7/6 15/13 23/20 31/29 39/37`; after: `7/7 15/14 23/22 31/29 39/37` (x2), `7/7 15/14 23/21 31/29 39/37`.
  - before, party 3: `39/38` at the end in all three runs; after: `39/38` in all three runs.
  - `xpcurve2.js` (single hero, so the catch up never applies): unchanged, end 36 manual / 35 half auto / 33 all auto (x1.15 curve). `hours10.js` unchanged (no XP in it).
  - Ending level stays 39 (inside 35 to 40): the top hero never gets a bonus by design, so the ending level cannot move; the lower heroes close the gap faster.
- `tools/xpcatch.js` (new): two newcomers (one front, one reserve) G levels behind a party of 6; levels gained in 30 field fights (3 runs, noisy):
  old rule vs v0.5.0, front/reserve: stage 2, 3 behind 4.3/3.0 vs 5.7/3.7; stage 2, 8 behind 9.0/7.7 vs 9.3/7.0; stage 3, 10 behind 9.7/7.7 vs 7.7/7.0;
  stage 4, 5 behind 5.7/5.0 vs 7.0/5.0; stage 5, 6 behind 6.3/6.0 vs 5.3/5.0. The real gain is at small gaps (1 to 3 levels, where there used to be nothing);
  at 4+ levels the front row goes from x1.4 to x1.4..1.5 and the reserve from x1.4 to x1.2..1.25 ("benched heroes gaining a reduced share").
  The big-gap rows are within sim noise (low level heroes already level fast because the curve is steep).

### 4.4 Boss energy message: done
- `win` wrapper notes a first clear of a base boss (`kind:'boss'`, not the Daily Trial); once the battle has ended, any new-gear popups are done and the party is still in that place, an "Its energy lingers" popup says (with the boss and dungeon names): "X falls, but its energy lingers here... It clings to the rune circle in D. Return after leaving this place to face the stronger Echo." For the Calamity (realm 5) the line is carried at the top of the Legacy choice instead of a second popup.
- The earlier notices still show: the beacon toast and realms.js "breathes easier... Echo waits" toast. Tested for all five bosses in one journey.

### 5.1 Volume: done
- Settings: Master, Music, Sound effects sliders (0 to 100%) with Mute toggles; the old Sound row and the Music / Sound effects chips are removed from `settingsBody` output (regex on the rows; if another phase changes that markup the sliders are still added at the top). Ambience and Music style rows (music2.js) unchanged.
- `audioVol` and `au2Vol` wrappers (`p5Vol`): `AU.master.gain` and `AU2.g.master.gain` = master (0 when `mute`), music mute zeroes `AU.mus` and the orchestra music bus, effects mute zeroes `AU.fx`, sfx and ui buses. Instant on `input`, saved to `META.cfg` (debounced 400 ms, and on `change`). The top bar 🔊 still toggles `mute` (= Master mute).

### 5.2 Auto sync: done (most of it already existed)
- saves.js already syncs automatically: `saveGame` -> `svMark` -> one debounced `svFlush` (6 s) for signed in players with db write (`svCap`); visitors get status `local`, never upload, and see the Export reminder. Backups, history, divergence holds and the status icon are untouched.
- Added: the debounce reads `SAVE_UI.syncDelay`; hiding the page (`visibilitychange` hidden, `pagehide`) pushes a pending save at once (`p5FlushNow`). Sync now stays in the Journey tab.

### 5.3 Name: done
- `GAME_TITLE='Wayfarers (Beta)'`, `gameTitleVer()` = "Wayfarers (Beta) v0.4.6" (follows GAME_VERSION).
- Title screen (`buildScreen` wrapper): logo "Wayfarers", sub "(Beta)", no "Project", version line "Wayfarers (Beta) v...". `<title>` in shell.html "Wayfarers (Beta)", and `document.title` set to the title with the version at load. Top bar brand "Wayfarers" (`vHeader`). Menu footer, Help tab line, Help / Feedback "Wayfarers (Beta) changelog" heading and version line (`vFbHelp`), feedback context `game` and `title` (version stays `GAME_VERSION`), owner inbox copy text.
- `manifest.webmanifest` name "Wayfarers (Beta)"; README heading. Not changed on purpose: `package.json` productName (Electron derives the app data folder from it, so renaming it would hide Windows players' local saves), save keys, db paths, `aurelis-*` ids, file names like `aurelis-slot1-....awsave`, and in-world lore ("Aurelis" is the world's name).

### 5.4 Smooth transitions: done
- `p5trans.js`: `trUpdate` (run at the start of every world frame) tracks the phase and each realm's weather; a change starts a blend measured in world screen frame time (dt capped at 100 ms, so it pauses in battles and menus away from the world).
- Time of day: `tintFor` (night tint) and `dayFxDraw` (dusk and dawn grade, shadows, glow, windows, fireflies, mist) are scaled by the phase weights; the outgoing dusk or dawn is drawn by the wrapper when daylight.js no longer would. Smoothstep, 11 s.
- Weather: during a blend `weatherFX` paints the old and the new weather into one reused offscreen canvas (view size) and composites them at 1-e and e. 6.5 s. Battles keep their weather as before.
- Ambience: `ambSet` ramps beds over 6 s on a weather change and 10 s on a phase change (2.5 s otherwise).
- Reduced motion: blends are instant. Cost (headless Chrome, 844x390): plain frame 0.25 ms, blending frame 1.44 ms.

### 5.5 Save visibility: done
- Main menu: "💾 Save · Slot N · Saved X ago" pinned in the sticky menu header (`mMenu` wrapper), on every tab, visible after scrolling; tapping saves and confirms ("Saving…" then "Saved to slot N", button turns "Saved ✓"). Journey tab Save and Sync unchanged.
- Save message `#p5save`: every successful `saveGame` (autosave or manual) shows "Saving…" then "Saved", fading after about 2 s; a burst of autosaves shares one message; a failed write shows "Could not save" with a Retry button (the only part that takes taps). `pointer-events:none`, never focused, never calls render, shown during battle, no fade under reduced motion. The existing "Could not save on this device" toast stays.
- Placement (`p5Place`): candidates down the top left then top right corners of the game view (world canvas, battle canvas or screen; viewport corners when a popup is open), first one clear of the minimap, weather and time chips, location banner, pad, A/B buttons, bottom bar buttons, top bar buttons, boss bar, battle order strip, log and unit sprites.
- Cloud sync chip: the existing `#svicon` (saves.js) is moved from the bottom left corner (where it sat on the movement stick on portrait phones) to sit just left of the save message, with the same placement rules.

## Tests (tools/chrome, `PWHTML=../../out/aurelis3.html node <test>`)
- `v050p4.js` (4.1 to 4.4, 23 checks), `v050p4b.js` (7 checks: old v0.4.6 save with a started and a finished personal quest, missing `bt`, faction data), `v050p5.js` (28 checks: 5.1, 5.2 with the mock db: write access and view only, 5.3, 5.5), `v050p5b.js` (save message and cloud chip placement at 390x844, 360x740, 844x390, 740x360 and 1280x720 in town with the banner, field with the minimap, battle, boss battle and the menu), `v050p5c.js` (all 84 phase changes = 4 boundaries x 21 weathers, and 80 weather fades = 4 phases x 20 weathers in and out; durations, reduced motion, ambience ramps, frame cost). All pass.
- Node: `tools/xpcatch.js` (above).
- Regression, the same 44 Chrome tests on the pre-change build and on this one: savesys, oldsave, v041old, offline, v043b, v043c, v041p2/p5/p6/p6b/p26/p44/p53/p54/p64/p65/p67, v041p1a to p1k, v040p1/p5/p5b/p6/p789/fs, wide, nature, tavern, sanct, p4b, p5b: same result on both (pass, or the same pre-existing last line).
  Pre-existing failures, unchanged: v043 "version is Beta v0.4.3"; v040p3 "Records holds ..." (the Music Room tab was added in v0.4.5); saveformats and v040p2 need `out/aurelis.html` (an old build file not in the repo). v041p1g "meadow field backdrop still animates" failed once on this build and passed on two reruns (random field theme).
  Updated old tests: v040p3 expects the Guides and Records tab label "Guilds", and its dusk and dawn snapshots skip the 5.4 blend (its old dusk check failed before this pass and passes now). v043 "Space at the Inn" first failed because the energy popup took the place of the new-gear popup in its scripted run; fixed in the game (the energy message waits for gear popups and is dropped once you leave that dungeon), v043 passes that check again.

## Merge risks
- `settingsBody` regex removes the Sound row and the Music / Sound effects chip rows; Phase 2 adds a hints toggle to Settings. If it edits that same `return` line in ui.js the regex still matches as long as the `opt(...)` row markup is unchanged.
- `vModal` and `toast` pass through `guildText` (cheap: only strings containing "faction" are split). Any new player text with the word faction becomes guild, which is intended.
- `mResult`, `mMenu`, `mGuild`, `mChar`, `vHeader`, `buildScreen`, `vFbHelp` wrappers use string replacement on known markup (`<b>Gold</b>`, `<h2>Menu</h2>`, `<span class="verf">`, the Guild Hall `<div class="chips">`, `<p class="note nums">Battles together`, `<div class="brand"><b>Aurelis</b>`, `<h4>Version</h4>`). If Phase 1 or 6 changes those exact strings, the wrapper silently does nothing; the v050 tests will catch it.
- Phase 6 lighting: the time of day blend scales `tintFor` and `dayFxDraw`; new lighting layers that read the phase directly would still jump.
- `#svicon` is repositioned by inline style; Phase 6 UI restyles should keep its id.
- `saveGame` is wrapped last (outermost); the save message runs after the saves.js wrapper, so its success flag includes the backup-freeing retry.
