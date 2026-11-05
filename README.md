# Project Aurelis: Wayfarers (Beta)

Turn-based pixel art medieval fantasy RPG. Beta v0.4.4.

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
