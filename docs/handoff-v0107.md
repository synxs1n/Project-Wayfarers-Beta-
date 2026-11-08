# Handoff after the v0.10.x pass (Phases 1 to 8)

Shipped to main, each after a green "Build and release" run of the one before: 0.10.0 (Phase 1 fixes), 0.10.1 (page zoom, keys, Flat look, account totals), 0.10.2 (wild recruit popup, Build Party takes, one Equip Best), 0.10.3 (connected world map, phone minimap, icons), 0.10.4 (Chain, planned targets and the Guard cue, skill rows), 0.10.5 (56 reactions, early roles, prime refresh, typed attacks, natures as sub-roles, mastery perks), 0.10.6 (board vs Guild Hall, guild notices, town gated notices, Medals, Guides tabs, roamer grace), 0.10.7 (Sanctums and Summons, Priest rename). Main is at 0.10.7; the session branch ccr-5835bd27-8dgy6s is only a backup mirror of main (CLAUDE.md says push to main, no branches; follow CLAUDE.md).

Owner decisions during the pass: keep Momentum and Taming (a removal was started and reverted); do the menus sweep inside Phase 7; helpers (sonnet) only for mechanical work, the rest by Fable.

Known open items:
- Pork Chop at the top of the Backpack was not reproduced (the Items tab now sorts rarity then name). Ask the tester for a screenshot if it comes back.
- The Daily Trial outcomes differ from 0.10.3 (planned foe targets), still deterministic per day.
- Existing heroes keep their old nature until rerolled in the Guild Hall; only new wayfarers start on a sub-role (natures6.js nat6Default).
- Rain's weather bonus covers only the forward reaction keys (fire+water, lightning+water); the 28 reverse reactions (keys 'primed>det') get no weather boost.
- Balance tweak made to keep a test band: ROLES.band top .75 -> .78 in config.js (natures lift the chronicler's secondary healing to .755).

Fixes found by the tests late in the pass (worth knowing if something regresses):
- battle5.js timed hit multiplier now matches the skill by id (atk6.js passes a typed copy of ATTACK, not ATTACK itself).
- battleui.js: a tap on a foe while a timed ring is up, or mid action, no longer opens the info panel (it used to freeze the action under reduced motion).
- battle3.js b3FxRects: a reaction float takes the spot over its foe's head first and may sit over that foe's own plate, intent and prime marker.
- chain5.js: the planned aim is applied inside enemyTurn0 (c5PlanAim) before the guard ring, so the ring and the hit agree; the aim shows on the hero card (⚔) and in the intent tooltip, not as text on the stage (it broke label layout).
- summon8.js resets its battle state in a startBattle after hook (a before hook ran before B existed).

Tests and tooling:
- The full runall.js suite takes about 75 min per four groups on this container and the background command limit is 2 h, so run groups in separate background jobs (battle world, then saves audio, then menus party title app). Copy out/aurelis3.html to a scratch file first and point PWHTML at the copy, so a rebuild mid run does not change the build under test.
- v095na needs OLDHTML (the previous build) for its comparison checks: `git show <old commit>:index.html > old.html`.
- v063wa (Daily Trial twists) can time out inside the runner under load but passes alone.
- Tests updated in this pass to the new design (not weakened): v063pb, eq (one Equip Best), v053a (no camera sway), v041p2 (wipe view), v050p6a (Flat / HD-2D labels), v063bc (full reaction matrix), v095b (key weakness off the stage, levels always shown), v095na (56 reactions), v040p5b, v071wt, v063wo, v050p1f, v080r (connected world map, minimap on by default, icon sampling), p2 and v063wo (Priest, Sanctum), v080ca (chi nature).
- Sims after the pass: SEED=1 node tools/fullsim.js stage1: careful 97% wins, auto 90%; xp: catch up unchanged. Single vs dual element output at level 20 within 1%.

Docs per phase: v0100-phase1.md, v0101-stats.md, keymap.md, v0102-party.md, v0103-map.md, v0104-battle.md, v0105-combat.md, v0106-guild.md, v0107-sanctums.md.
