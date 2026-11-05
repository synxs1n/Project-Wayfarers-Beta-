# Standing instructions for this repo

Whenever you change the game, you also ship it to GitHub yourself, every time, without me asking. Repo: synxs1n/Project-Wayfarers-Beta- (branch main). The source is in v3/ (vanilla JS). The README has a "Shipping a change" section with these same steps. Design notes, specs and test tips are in docs/ (start with docs/README.md).

For every change:
1. Edit the files in v3/ (never edit index.html by hand).
2. Run `sh build.sh`. It rebuilds index.html, sw.js and version.json. Check that it succeeds and the game still loads with no console errors.
3. Bump GAME_VERSION (one line, like 0.4.4). Only the last digit goes up by 1 for each real game change. The middle digit only changes when the last would pass 9 or I say it is a massive shift. Do not change version numbers for build, icon or setup changes.
4. Commit and push to main. Do not make a branch or a pull request.
5. Wait for the GitHub Actions run "Build and release" to finish and confirm it is green. The push updates the website and the Windows app (it loads the site live), and rebuilds the Android APK and Windows installer into the single rolling release called "latest".
6. Reply with the play link https://synxs1n.github.io/Project-Wayfarers-Beta-/ plus a two line summary of what changed and the new version number.

Rules:
- Never delete the "latest" release. Never create new version tagged releases.
- Do not touch the Firebase config, android-debug.keystore, or android-google-services.json.
- If a build fails, fix it and push again, then tell me what went wrong in one line.
- If I only ask a question or ask for a plan, do not push anything.
