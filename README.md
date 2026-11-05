# Wayfarers (Beta)

Turn-based pixel art medieval fantasy RPG. Beta v0.4.6.

Play in browser (installable as an app from the browser menu): https://synxs1n.github.io/Project-Wayfarers-Beta-/

No sign-in needed. Saves stay on your device.

## Developing

Source lives in `v3/` (vanilla JS). Build with `python3 v3build.py`, which writes `out/aurelis3.html`. Copy that to `index.html` to update the GitHub Pages build. Build order is the file list in `v3build.py`. Test and sim scripts are in `tools/`.

Build everything with `sh build.sh`. Changing `RELEASE_VERSION` (for example to `v0.4.4`) and pushing runs GitHub Actions, which builds the Android APK and Windows installer and attaches them to a GitHub Release.

## Shipping a change (every game edit)

1. Edit files in `v3/`.
2. Run `sh build.sh` (builds `index.html`, `sw.js`, `version.json`).
3. Bump `GAME_VERSION` (last digit +1 per game change; middle digit only if the last would pass 9 or it is a big shift). Never touch version numbers for build only changes.
4. Commit and push to `main`. The push updates the website (GitHub Pages) and the Windows app (it loads the site live), and GitHub Actions rebuilds the Android APK and Windows installer into the single rolling release `latest`.
5. Report the play link: https://synxs1n.github.io/Project-Wayfarers-Beta-/

Do not delete the `latest` release; the app update links use it.

The Android app updates itself from the live site (`v3/liveboot.js`): it downloads a newer `index.html` into its own cache and swaps it in on the next launch, falling back to the packed build if that version fails to start. Only a change to the native shell (plugins, icons, permissions) needs a new APK. Test: `node tools/chrome/liveupdate.js`.

## Audio

The orchestral soundtrack is composed by hand in `v3/musicdata.js` (notation explained at the top of that file) and played by the sampler and sequencer in `v3/audio2.js`. Wiring to the game is `v3/music2.js`, sound effects `v3/sfx2.js`, ambience `v3/ambience.js`. The original chiptune engine (`v3/audio.js`) stays as Settings > Music style > Classic chiptune and as the fallback when samples cannot load.

Instrument sprites live in `audio/` (`<instrument>.ogg`, an `.mp3` copy for browsers without Ogg Vorbis, and `inst.json`). Rebuild them with `python3 tools/audio/build_instruments.py <folder of FluidR3_GM *-ogg.js files> audio`. The audio test is `node tools/chrome/audio.js` (add `--gains` to print loudness levelling values).

## CREDITS

- Music: composed for Aurelis around one theme, the Meridian. All sound effects and ambience are synthesized in code.
- Instruments: the FluidR3_GM General MIDI soundfont by Frank Wen, released under the MIT license, as rendered to per-note audio files by Benjamin Gleitzman in [midi-js-soundfonts](https://github.com/gleitz/midi-js-soundfonts), which publishes those renders under the Creative Commons Attribution 3.0 license (https://creativecommons.org/licenses/by/3.0/). The notes were trimmed, resampled to 32 kHz mono, re-encoded and packed into one sprite per instrument for this game.
