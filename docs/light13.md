# v0.19.7: light and shadow on the ground, night light, world particles, screen transitions (light13.js)

The owner asked for four things. All of it is look only: no tile, collision, save field, game number or random draw changes (particles come from
`wfxH` hashes, flicker from a hash of time). `v3/light13.js` is the module; `window.__L13` is the test hook (`off` switches the whole module
off at runtime, `n` counts, `err` collects caught errors); `tools/chrome/v177a.js` is the test (world group).

## 1. Light and shadow on the ground
- One sun, one shadow function. `l13ShadowW(m)` gives the weights of the three baked shadow directions (day, dusk, dawn) from the time of day
  blend (`trPhW`) and the hour within a phase: a day's first quarter leans to the long dawn shadow, its last to the long dusk shadow, late dusk
  and early dawn to the faint moon shadow (as the HD-2D presets already did), and a clouded sky softens all three (`HD2D.weather[w].sun`).
- The sun directions (`HD2D.suns`, overridden at load from `L13.suns`) now stand north-west by day and low in the west at dusk, the east at
  dawn, so shadows fall to the lower right as the props are lit and in front of buildings, where the ground is seen. The HD-2D facade lighting
  (`look.*.sd`) is untouched.
- HD-2D: `hdLook` hook: `o.shW` takes the hour's weights; by day the sun is warmer and the ambient cooler (a warm key, a cool fill); at night the
  ambient drops by a fifth and the lamps weigh more. The baked shadow heightfield (`hdBakeShadow`) is unchanged.
- 2D: `l13Field` builds the same heightfield at 4 px cells (walls and cliffs through `hdKind`, buildings by `hdBldKind` kind, trees, rocks and
  pillars from the `hdBakeShadow` table, the entrances of worldart13, the landmark); `l13March` marches it toward each sun and softens it twice;
  the three masks are canvases cached on the map (`m.__l13sh`). The `townDecorActors` hook pushes one actor at the bottom of the depth sort that
  lays the masks under everything at the hour's weights, upscaled with smoothing. `dayFxDraw` (daylight.js, now `HOOK.def`'d) no longer draws its
  building wedges at dusk and dawn (a wrap hides `m.bld` for the call).

## 2. Night and interior lighting (2D)
- Outdoors at night (`l13NightW`: the night blend plus late dusk and early dawn) a view sized layer darkens the view further between the lights,
  with soft holes at every light and round the hero; then every light of `m.lights` and `m.tl` (lamps, windows, braziers, torches, waystones,
  crystals, lava, runes) plus the fountains pools its `LIGHTC` colour on the ground as a soft ellipse (additive, one cached 64 px sprite per
  colour). Fire kinds (fire, torch, lava) flicker by a hash of time; still under reduced motion. The hero carries a faint lantern pool.
- Interiors (dungeons, caves, lairs, the halls) keep their own darkness canvas and get the same pools, a little stronger.
- HD-2D keeps its light map; the darker night ambient (above) makes its pools stand out.

## 3. Particles in the world
`wfxRun` (worldfx.js, now `HOOK.def`'d) gets one after hook: every emitter is world anchored like the rest of the ambience, drawn by the same
`emit` in both renderers (nothing over the hero, no random draw). Fireflies at night in meadow realms, pollen by day in meadow and heights
realms, ash and embers in Kilnscar (`realmAt(m.s).key === 'deeps'`), embers over every brazier (`v` tiles, cached per map), dust in the
mesa by day and in sand dungeons (`m.d8 === 'sand'`), frost sparkle in the tundra and glacier realms, spores in the Breach, void motes in the
Echo Rift (an archive map: a `hdActors` hook puts them into the HD-2D scene, which skips archive maps in `hdWfx`). Their clock (`l13T`) stops
under a menu and resumes where it stopped; counts scale with the view like `WFX.n`, 0.6x on Low.

## 4. Screen transitions
The `worldDraw` wrap hides the stamps (`WS.flash`, `WS.fade`, `WS.fadeIn`) from the frame, so neither renderer draws the plain fades, and draws
the transition after it at the canvas's real backing scale (sets `HD.ovClear = null` so the HD-2D overlay clears it next frame). Timings are
unchanged (460, 230, 280 ms), so `v063bb` and the fade tests hold.
- Battle start: nine horizontal shards in the realm's colour (`THM(m).dec[0]`, `DTH(m).acc` indoors) race in from alternating sides with a bright
  leading edge until they cover the view, the two white flashes are kept (p = .14 to .29 and .43 to .57), the last third darkens toward the cut.
- Doorways: an iris closing on the hero (230 ms) and opening from him again (280 ms), with a soft rim.
- The return from a won battle (`finishBattle` hook marks it) is a warm bloom clearing from the hero outward.
- Reduced motion: plain fades (the realm's colour for the battle start).
- The idle limiter (perf12) reads the stamps for its busy signature; a `before` hook keeps it busy while a transition runs (never after).

## Frame cost (probe in the style of v170a: 390x844, dpr 3, High, night, direct worldDraw calls, SwiftShader)
Town: HD-2D 50.8 ms on / 55.4 ms off (noise of the software GL), 2D 0.57 / 0.31 ms. Field: HD-2D 42.8 / 44.3 ms, 2D 1.39 / 0.86 ms.
The limiter holds: a still night town draws 30 of 60 frames, walking 60, under a menu 7, during a fade in every frame, settled again after.
