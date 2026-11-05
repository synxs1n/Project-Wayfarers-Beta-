# Audio (v0.4.5) and Android live updates (v0.4.6)

## Audio
- Files (v3build.py order): `audio.js` (classic chiptune, untouched), `audio2.js` (engine), `musicdata.js` (score and notation compiler), then near the end `music2.js` (wiring, settings, Music Room, credits), `sfx2.js`, `ambience.js`.
- Samples: `audio/<inst>.ogg` + `.mp3` + `inst.json`, built by `tools/audio/build_instruments.py` from the gleitz/midi-js-soundfonts FluidR3_GM renders (CC BY 3.0; FluidR3 MIT). About 2.2 MB ogg and 2.6 MB mp3; one format loads per device. Credits in README and Settings > Credits.
- Notation: see the header of musicdata.js. Tracks are `MTRACK[id](opt)` -> `{bpm,ts,tr,mode,tonic,room,intro,form,sec}`. Field arrangements per tileset come from `MTRACK.field` (night, cal, bright options). Meridian motif: `G4q C5q. D5e E5q | D5q B4q C5h`; minor form `MER_MINOR`.
- `au2Want()` (music2.js) picks the track from the game state; `au2Sync()` plays it. Stems: `tense` (battles under 30% HP), `phase` (boss), `chase` (dungeon roamer). Calamity is `cal1`/`cal2`/`cal3` by HP.
- Volumes: buses music, amb, sfx, ui into master, compressor, limiter, out (-1 dBFS). `au2Vol()` reads `META.cfg.music`, `.sfx`, `.amb` (default .3), `.mute`; it runs inside `audioVol()`. A master slider (5.1 in v0.5.0) should set `AU2.g.master.gain` and the classic `AU.master.gain`.
- Settings keys: `META.cfg.amb`, `META.cfg.mstyle` ('orch' default or 'chip'). `META.heard` = Music Room unlocks.
- Ambience (`ambience.js`): beds ramp over 2.5 s in `ambSet`; `ambWant()` reads place, realm, weather and time.
- Loudness table `MGAIN` (musicdata.js) from `node tools/chrome/audio.js --gains` (full run about 40 minutes; `--only=a,b` for a subset). Gameplay check: `tools/chrome/audioplay.js`.
- Service worker serves `/audio/` cache first; the Android workflow copies `audio/` into `www/`.
- Test hook: `window.__AU` (end of ambience.js).

## Android live updates (v0.4.6, build IDs in v0.5.1)
- `v3/liveboot.js` runs in its own script before the game (v3build.py wraps it with appver.js into the shell's `/*BOOT*/`). Native only.
- Build IDs (v0.5.1): `v3build.py` hashes every module except appver.js, plus fonts.css, style.css, shell.html and liveboot.js (SHA-256, first 12 hex characters), before the page is written, so the ID never depends on itself. It writes `const APP_VER="x";const APP_BUILD="id";` into `v3/appver.js` and `{"version":"x","build":"id"}` into `version.json`. The same sources always give the same ID, so the CI builds match the committed site.
- An update is a live build with a newer version, or the same version with a different build ID. An older version is never downloaded or applied.
- The background check downloads the live `index.html` into Cache Storage (`aur-live-build`) only if it holds exactly the expected `APP_VER` and `APP_BUILD`, then offers Restart now. On the next launch (or restart) the packed game is skipped (`window.__SKIPMAIN`, checked at the top of the main IIFE) and the cached page is swapped in with DOMParser, re-creating its scripts. Same origin, so saves and sign in stay.
- Inside a swapped-in build the boot script runs again: it never swaps a second time (`__LIVEBOOTED`, the game never runs twice) but it does run the background check with the build ID rules, on the same cache and keys (`__LIVECHECK` keeps it to one checker per page). APKs from 0.4.6 to 0.5.0 only compare version numbers in their own boot script; once they run a swapped 0.5.1 build, that build's check picks up same version rebuilds, and the old boot script swaps them in because 0.5.1 is newer than what it packs.
- If the live site matches the APK's own packed build and a different build of that version sits in the cache, the cached one is dropped.
- localStorage: `aur-live-ver` and `aur-live-build` (what is cached), `aur-live-try`, `aur-live-ok`, `aur-live-bad` (ids `ver#build`; old boot scripts write plain `ver`). A build that never draws its first screen is marked bad and the packed one runs. A newer APK beats an older download.
- The website (`update.js`) shows its update bar when the live version or build ID differs from the running one.
- Instruments fall back to the live site when the APK lacks a file (`au2Fetch`).
- Test: `tools/chrome/liveupdate.js` (newer version, same version rebuild, older version refused, a 0.5.0 APK picking up the new build, a 0.4.6 APK on a swapped build picking up a rebuild, the website bar; `liveboot-v046.js` is the old boot script it uses). APKs older than 0.4.6 need one manual install.
