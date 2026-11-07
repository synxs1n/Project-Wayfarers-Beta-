# Beta v0.10.0: Phase 1 fixes (tester patch notes)

Done in this phase (files):
- Gate direction: `zones.js` `gateDirWord(stage[,'field'])` reads the real side of the forward gate; the town 0 west road message is rewritten by a `getMap` hook; static NPC lines no longer name a side.
- Wide gates: `world4.js` townCarve paints a road from a north or south gate to the first road tile or the main road; `map.js` awGoal treats every cell of a gate (m.gates[*].cells) as one goal, so the corner cell plans a walk.
- Tap to walk through a battle: `map.js` keeps the plan in `WS.awResume` (startBattle before hook) and resumes it from worldTick once the party is back on the same map (`WS.awPend`).
- Roamer contact: `roam.js` also tests the drawn (interpolated) roamer position against the hero's drawn position (0.75 tile).
- Arena auto: `prog2.js` Stop auto always works while auto runs; `nextWave` wrapper stops auto when the new wave locks it.
- Fallen heroes and XP: goal rewards (`goals.js` glPay) skip heroes at 0 HP; battle XP already did (engine win share 0).
- Party wipe: `lose()` revives in the state at once and sets `B.wipe`; `battle.js`, `battle3.js`, `battleui.js` draw the party down while the popup is up; `polish.js` fades in at the Inn.
- Standing still: `config.js` HD2D.sway amp and pitch 0 (the idle camera drift crossed pixel boundaries and the whole scene jumped a pixel).
- Weather indoors: `hd2d.js` hdLook takes the weather only on fields and towns.
- Heat haze: GL strength x0.45 (`hd2d.js`), 2D shimmer amp half and gradient lighter (`weather7.js`).
- Phones: `ui2.js` blocks contextmenu, selectstart and touchstart on the stick, pad and world canvas; `style.css` user-select and touch-action.
- Goals: `goals.js` counts every swap path (doSwap, b4FreeSwap, swapTap).
- MP items: `ui.js` useOn and `engine.js` useItem report who got how much MP.
- Battle log panel: newest first (`battlefx.js`, `style.css`).
- Items tab default sort: rarity then name (`ui.js`).
- Title: New Journey; starter sheet heading "Starting skills".

Foes re-rolling on the battle screen (roamer fights): `worldrt.js` worldTick's lock watchdog read `WS.fade`, which fadeTo never cleared, so the lock of an encounter flash was released on the next tick after any earlier fade; the roamer then called roamFight every tick for 420 ms (each a new startBattle with new foes) and the hero kept walking. Now the watchdog has its own stamp (`WS.fadeLock`, cleared when the fade ends) and an encounter in flight (`WS.encPend`) is never started twice (roam.js, worldrt.js).

Next: Phase 2 (screen scale on web and Windows, key map screen, account stats, Flat vs HD-2D switch).
