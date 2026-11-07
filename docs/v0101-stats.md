# Account totals (v3/metastats.js)

`META.stats` holds counters across all journeys and the Daily Trial. Every field defaults to 0 on read (`ms()`), so old
accounts migrate safely; no existing META key changed. `META.clears` stays and is kept in sync with `stats.clears`.

Fields: `play` (ms), `battles`, `won`, `fled`, `lost`, `steps`, `journeys`, `clears`, `bosses`, `dailies`, `gold`
(battle gold from the win info), `levelUps`, `recruits`, `chests`, `first` (timestamp), `seeded` (migration flag).

Seed on first use (once): `clears` from `META.clears`, `journeys` from `META.cycles` plus 1 if any save slot exists.

Hooks: `HOOK.after` newGame (skipped while startDaily runs), startBattle, finishBattle (won/fled/lost, not Daily);
`HOOK.wrap` win (gold, bosses = kind 'boss' wins, clears) and openChest (new chests only); wrappers on arrive (steps),
addXp (level ups), recruit (roster grew), dailyWin and dailyLose (won/lost + dailies). A 15 s interval adds play time
(journey or Daily Trial, page visible). Saves: immediately on events, at most once a minute for the timer.
Daily Trial counts battles, won, lost and play, never steps or gold.

Shown by `metaBlock()` under "Account totals" in the Journey tab. Tests: `window.__MS.stats`, `window.__MS.tick(ms)`.
