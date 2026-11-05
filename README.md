# Project Aurelis: Wayfarers (Beta)

Turn-based pixel art medieval fantasy RPG. Beta v0.4.3.

Play in browser (installable as an app from the browser menu): https://synxs1n.github.io/Project-Wayfarers-Beta-/

No sign-in needed. Saves stay on your device.

## Developing

Source lives in `v3/` (vanilla JS). Build with `python3 v3build.py`, which writes `out/aurelis3.html`. Copy that to `index.html` to update the GitHub Pages build. Build order is the file list in `v3build.py`. Test and sim scripts are in `tools/`.

Build everything with `sh build.sh`. Pushing a tag like `v0.4.3` runs GitHub Actions, which builds the Android APK and Windows installer and attaches them to a GitHub Release.
