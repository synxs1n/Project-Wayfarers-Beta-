# Docs

Read these before a big pass:
- `design-notes-v033.md`: Beta v0.3.3 to v0.4.0 systems (saves, cloud sync, equipment, world, factions, developer guide).
- `design-notes-v041.md`: Beta v0.4.1 to v0.4.3 (sixteen realms, roamers, sites, capes, balance numbers). Wins over v033 where they disagree.
- `design-notes-v050.md`: Beta v0.5.0 (the big fix, logic, shops, party, settings and graphics pass). Wins over the older notes. Phase reports: `v050-phase2.md`, `v050-phase3.md`, `v050-phase45.md`.
- `v053-ui.md`: the v0.5.3 UI pass ("Gilded Night" menus, HUD and battle panels in `v3/ui3.css`), its design language, tests and limits.
- `v053-hd2d.md`: Beta v0.5.3 HD-2D world renderer (WebGL diorama view of the world maps on Medium and High graphics).
- `v058-sprites-in-scene.md`: characters and monsters lit, graded, scaled and grounded in the HD-2D world and battle stages (Medium, High).
<<<<<<< HEAD
- `v063-party.md`: Beta v0.6.3 party systems (Best Party formations and Training team, XP catch up against the roster's top level, "Equip best: at camp", Legendary only for legends and Epic tags).
=======
- `v063-progression.md`: Beta v0.6.3 progression goals (Taming log, bond goals, Make camp) and the pacing audit of when each system first appears.
>>>>>>> worktree-agent-ada527f147eb4c9ee
- `audio-notes-v045.md`: the orchestral audio (v0.4.5) and Android live updates (v0.4.6).
- `v050-prompt.md`: the full spec for the Beta v0.5.0 pass. Rollback point: `rollback-v046.md`.

Testing tips:
- Chrome tests: `tools/chrome/*.js` (Playwright, `pw.js`). Run from `tools/chrome` with `PWHTML=../../out/aurelis3.html`. Audio and update tests serve the repo over http themselves: `audio.js`, `audioplay.js`, `liveupdate.js`.
- Node sims (worldtest, gatetest, healtest, levertest, phase3test, archtest, chainsim, balance10, bosswin, pacing...) expect `tools/v3`: run `ln -s ../v3 tools/v3`, run from the repo root, remove the link before committing.
- The game is one IIFE in strict mode; tests reach it through `window.__A` (lazy getters for G, B, V, ACT and many functions) and `window.__AU` (audio).
