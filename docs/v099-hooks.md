# Hook registry (v0.9.9 code pass)

The most wrapped core functions used to be built as wrapper chains: every module that needed to do something around
`render` or `startBattle` captured the function and replaced it (`{const r0=render;render=function(){...r0.apply(this,arguments)...};}`).
`render` had 18 such wrappers, `vModal` 24. Each new system made the next bug harder to find, because the real body of the
function was spread over a dozen files and its order only existed in `MODS`.

Now each of these functions is defined once, right under its base body, and modules register ordered hooks with a module
name and a purpose. The behaviour is the same: the hooks compose exactly like the wrappers they replace, in the same order.

## The registry (`v3/hooks.js`, loads right after `config.js`)

```js
render=HOOK.def('render',render);   // under the base body (ui.js): the one definition
HOOK.before(name, mod, why, fn)  // fn(...args) runs first; `return HOOK.stop(v)` skips the rest of the chain and returns v
HOOK.after(name, mod, why, fn)   // fn(r, ...args) runs after the rest; the result r is returned unchanged
HOOK.xform(name, mod, why, fn)   // r = fn(r, ...args): replaces the result (HTML rewriting, a different return value)
HOOK.wrap(name, mod, why, fn)    // fn(next, ...args): a true around hook; call next(...args) for the rest of the chain
HOOK.snap(name)                  // the chain as registered so far (for old load-time copies such as window.__P2)
HOOK.list(name)                  // [{kind, mod, why}] in registration order; HOOK.list() lists the names
```

`HOOK.def` returns a small dispatcher; the composed chain is cached and rebuilt on the next call after any registration, so
hooks may also be registered at runtime. `this` and every argument are passed through. Tests reach it as `window.__A.HOOK`.

### Order

Hooks compose in registration (load) order and the last registered is the outermost, exactly like the wrappers did:

- before parts run from the last registered to the first, then the base body, then after parts from the first registered to the last;
- an around hook (`wrap`) has a part on both sides, at its own position;
- a before hook that stops returns its value to the hook outside it, so the after parts of the hooks registered later still run
  (as the outer wrappers' code still ran after an inner wrapper returned early).

`node tools/hooksmap.js` prints every list and its run order; `docs/CODEMAP.md` holds the generated copy
(`sh build.sh && node tools/hooksmap.js --write` refreshes it).

## Adding a hook

1. Pick the kind: `before` for work that only needs to happen first (or a popup type that answers with its own HTML:
   `if(m&&m.type==='mine')return HOOK.stop(mMine(m));`), `after` for work that follows and keeps the result, `xform` when the
   result changes, `wrap` when the hook needs both sides with shared locals, try/finally, other arguments, or calls the rest
   only sometimes.
2. Register it in your own module, at load time:
   `HOOK.after('finishBattle','mymod','what it does',function(r,how){...});`
3. Its place in the order is its module's place in `MODS`. Do not move modules lightly.
4. Rebuild, run `node tools/hooksmap.js` and check the new line sits where you expect, then refresh the doc with `--write`.

Keep random calls (`Math.random`, `RNG()`) where they were: Daily Trial and the sims depend on their order.

## How the wrappers were converted

One wrapper became one hook in the same file and the same place in the file, with the same body:

| wrapper shape | hook |
|---|---|
| `...; return f0.apply(this,arguments);` (work first, early `return x` possible) | `before`, `return x` becomes `return HOOK.stop(x)` |
| `const r=f0.apply(this,arguments); ...; return r;` (r not reassigned) | `after` (an early `return r` becomes `return`) |
| `let h=f0.apply(...); h=...; return h;` | `xform` |
| `f0(now); ...` with the result dropped (worldDraw, whose result nobody reads) | `after` |
| anything else: locals shared across the call, try/finally, changed arguments, the original called conditionally or twice | `wrap`, with `f0.apply(this,arguments)` as `next(...a)` and `f0.call(this,x,y)` as `next(x,y)` |

The only splits are `startBattle` in `p2world.js` (surprise start) and `battle4.js`: their before and after parts share no
locals, so each became a `before` and an `after` registered next to each other (the same order as one wrapper). `__P2.startBattle`,
`__P2.encounterFoes` and `__P2.getMap` still hold the chain as it stood when `p2world.js` loaded (`HOOK.snap`), as before.
The node sims that load a list of v3 files (`tools/worldtest.js`, `stairs2.js`, `healtest.js`, `v3sim.js`, ...) now load `hooks.js` too.
`tools/fullsim.js` reads `MODS`, so it picks `hooks.js` up by itself (its stub `render` still gets every render hook, as it got every wrapper).

## Before and after

Wrappers per function before (the `name=function` reassignments, plus `watchGear`) and hook registrations after:

| function | wrappers before | hooks after | kinds after (before / after / result / around) |
|---|---|---|---|
| vModal | 24 | 24 | 19 / 0 / 4 / 1 (the before hooks are popup types that stop with their HTML) |
| finishBattle | 19 | 19 | 7 / 3 / 0 / 9 |
| render | 18 | 18 | 5 / 10 / 0 / 3 |
| startBattle | 16 | 18 | 7 / 10 / 0 / 1 |
| win | 14 | 14 | 1 / 3 / 0 / 10 |
| worldDraw | 11 | 11 | 0 / 9 / 0 / 2 |
| calcDamage | 10 | 10 | 0 / 10 / 0 / 0 |
| encounterFoes | 10 | 10 | 4 / 2 / 0 / 4 |
| settingsBody | 9 | 9 | 0 / 0 / 3 / 6 |
| getMap | 8 | 8 | 1 / 0 / 0 / 7 |
| perform | 8 | 8 | 1 / 0 / 0 / 7 |
| renderBattle | 7 | 7 | 1 / 5 / 0 / 1 |
| newGame | 6 | 6 | 1 / 5 / 0 / 0 |
| placeAt | 6 | 6 | 1 / 3 / 0 / 2 |
| genQuests | 4 | 4 | 0 / 3 / 0 / 1 |
| openChest | 4 | 4 | 2 / 0 / 0 / 2 |

Across `v3/`, the `name=function` reassignments went from 657 to 487.

### Left as wrappers, and why

- Chains of 5 or fewer (`unpackG`, `scan`, `restAll`, `mMenu`, `mBeast`, `battleFrame`, `arrive`, then the 4s): short, each in a
  few files; they can move to `HOOK.def` the same way when they grow.
- `enemyTurn0` and `foePlan`: `battle4.js` wraps them at the first battle start (`b4HookPlan`, `b4HookTurn`, guarded so it
  happens once). Two wrappers, installed at runtime; documented in `docs/CODEMAP.md`.
- The `ACT.*` handlers: properties of one object, at most 3 wrappers each (`watchGear` on the shop and quest actions).
- `autoTurn`, `saveGame`, `exec`: 2 wrappers each.

## Verification

Baseline: the untouched v0.9.8 build (976c677, its `index.html` as OLDHTML), every runnable `tools/chrome` test (the list in
`docs/cleanup-baseline.md` plus the v0.8 and v0.9 tests: 148), one at a time, on a copy of the repository.

- New test `tools/chrome/v099hooks.js`: one synchronous script (seeded `Math.random` and engine RNG, frozen clocks) starts a journey,
  opens 42 popup types (straight and through `render`), builds maps, places the party, makes quests, opens a chest, draws foes,
  starts battles, runs `perform` and `calcDamage` for every hero, skill and foe, wins, flees, loses and starts a new game: all
  111 results (HTML, state, numbers) are identical to the old build. A one character change in one hook makes it fail.
  It passed on every commit of the pass (each build checked against the old one), together with `v050p2daily.js` and `v063wa.js`.
- World frames: `worldDraw` on Low, Medium and High (2D), with and without the battle swirl, gives pixel-identical canvases in both builds.
- Determinism: `v050p2daily.js` (OLDHTML = v0.9.8) and `v063wa.js` PASS after every commit; `SEED=4242 node tools/fullsim.js stage1 60`,
  `SEED=77 ... xp 10` and `SEED=77 ... journey 4` print byte-identical results (only the header line differs: 135 modules instead of 134, and the seconds).
- Full suite: 119 of 148 pass on the old build, 120 on the new one (plus `v099hooks.js`). The same 27 tests fail on both builds with the
  same checks (they predate later changes). Flips, all timing or randomness: `audio` (peak level; failed on the old build, passed on the new),
  `v077wb` (the same), `audioplay` (frame time), `v071wt` (HD-2D tap timing), `v077wa` and `v080wa` (a weather particle on the hero's face)
  failed once on the new build and passed on rerun; `v080b` (the battle swirl pixel count on Medium 2D) failed 3 of 7 runs on the old
  build and 3 of 8 on the new one, with world frames pixel-identical; `v050p5b` "the minimap is up" failed once in 4 runs (its two
  other checks fail on both builds every time).
