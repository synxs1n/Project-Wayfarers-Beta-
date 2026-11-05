# Docs

Read these before a big pass:
- `design-notes-v033.md`: Beta v0.3.3 to v0.4.0 systems (saves, cloud sync, equipment, world, factions, developer guide).
- `design-notes-v041.md`: Beta v0.4.1 to v0.4.3 (sixteen realms, roamers, sites, capes, balance numbers). Wins over v033 where they disagree.
- `audio-notes-v045.md`: the orchestral audio (v0.4.5) and Android live updates (v0.4.6).
- `v050-prompt.md`: the full spec for the Beta v0.5.0 pass (not started yet).

Testing tips:
- Chrome tests: `tools/chrome/*.js` (Playwright, `pw.js`). Run from `tools/chrome` with `PWHTML=../../out/aurelis3.html`. Audio and update tests serve the repo over http themselves: `audio.js`, `audioplay.js`, `liveupdate.js`.
- Node sims (worldtest, gatetest, healtest, levertest, phase3test, archtest, chainsim, balance10, bosswin, pacing...) expect `tools/v3`: run `ln -s ../v3 tools/v3`, run from the repo root, remove the link before committing.
- The game is one IIFE in strict mode; tests reach it through `window.__A` (lazy getters for G, B, V, ACT and many functions) and `window.__AU` (audio).
