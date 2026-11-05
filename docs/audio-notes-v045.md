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

## Android live updates (v0.4.6)
- `v3/liveboot.js` runs in its own script before the game (v3build.py wraps it with appver.js into the shell's `/*BOOT*/`). Native only.
- It checks the live `version.json`, downloads a newer `index.html` into Cache Storage (`aur-live-build`), and on the next launch (or Restart now) skips the packed game (`window.__SKIPMAIN`, checked at the top of the main IIFE) and swaps the downloaded page in with DOMParser, re-creating its scripts. Same origin, so saves and sign in stay.
- localStorage flags: `aur-live-ver`, `aur-live-try`, `aur-live-ok`, `aur-live-bad`. A build that never draws its first screen is marked bad and the packed one runs. A newer APK beats an older download.
- Instruments fall back to the live site when the APK lacks a file (`au2Fetch`).
- Test: `tools/chrome/liveupdate.js`. APKs older than 0.4.6 need one manual install.
