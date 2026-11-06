# v0.7.7 weather and old visuals pass

The owner: "Upgrade the weathers graphically, as well as any lingering textures or structures from old builds."
Visual only. No save key, slot, db schema or game state change; the Daily Trial is untouched (no weather visual reads or calls the game
RNG or `Math.random`; positions come from a hash of the particle index and the time, the cloud bank sprites from their own seeded
`mulberry(7707)`). GAME_VERSION and the changelog are not touched here (the merge does that).

Files: `v3/weather7.js` (new, after `hd2d.js`), `v3/visuals7.js` (new, last), `v3/config.js` (`WX7`, above `WMAP`), `v3/worldrt.js`
(2D world call site), `v3/hd2d.js` (overlay call site, heat shimmer uniforms), `v3/hd2dgl.js` (composite shader: shimmer), `v3/battle.js`
(one line: the weather's ground layer under the units), `v3/shell.html` (`__A.W7` test hook), `v3build.py`. Tests `tools/chrome/v077wa.js`,
`tools/chrome/v077wb.js`; screenshots `tools/chrome/v077wshots.js` (to `tools/chrome/shots-v077w/`, ignored by git).

## Every weather
The 12 base skies (`WEATHER` in engine2.js): clear, rain, storm (Thunderstorm), heat (Heatwave), snow (Snowfall), blizzard, fog, gale,
sand (Sandstorm), aurora, starfall, ashfall. The rare skies (world3.js): bloodmoon (night), eclipse (day), meteor (Meteor Shower, night) and
six Elemental Surges (`surge_earth`, `water`, `fire`, `ice`, `wind`, `shadow`). "Indoors" is not a weather: dungeons, caves, fortresses,
the Sanctum and the Archive draw none (as before). Each combines with the four phases (day, dusk, night, dawn): particle colours dim and
cool at night (`w7Night`, blended with Phase 5's time of day weights), the HD-2D lighting does the rest (GL particles are lit by the scene).

| weather | world 2D (Medium, High) | HD-2D scene (GL) + overlay | battle |
|---|---|---|---|
| rain | wet tint and a far rain curtain; far, mid and near streak layers (slanted sprites, near ones long and soft); puddles on open ground (cached per map cell, sky rim highlight) with ripple rings; splashes (crown and ring) | 420 streaks per view, lit, depth tested, smaller with distance; puddle decals with a sky glint (additive) and rings; splash crowns and rings where drops land; wet grade (less saturation, more contrast, a touch of bloom); overlay: near streaks, curtain | wet floor gradient and sheen lines, puddles and ripples, splashes under the units; three layers over them |
| storm | rain, denser and more slanted, plus lightning | as rain; a strike lights the whole scene (ambient + exposure) | as rain, bolt in the sky band |
| snow | soft flakes in three layers with sway; flakes settle on the ground and fade | flakes lit by the scene, settling dots | settling flakes on the floor; three layers |
| blizzard | fast slanted flakes, whiteout gust banks sweeping across (`w7Gust`), a white veil that swells with gusts | flakes plus gust banks (billboards) racing low over the ground | gusts across the stage |
| fog | volumetric banks in three layers (far, mid, near) with their own drift and parallax, near banks fade around the hero | 16 banks per view as lit billboards at 2 to 22 px above the ground, drifting, hidden by walls and roofs, fading where they would cover the hero | low banks at the horizon behind the units, a near layer over the floor |
| gale | wind streak layers, tumbling leaves | streaks at 8 to 52 px, leaves tumbling | streaks |
| sand | warm haze gradient, grains in three layers, dust gust bands | grains streaming low, dust banks | grains and bands |
| heat | warm gradient, heat shimmer (rows of the far half shifted by a slow wave), rising haze wisps | composite pass shimmer above the hero's head toward the far ground; rising wisps | shimmer band at the horizon (2D stage), mirage lines, wisps |
| ashfall | ash specks and tumbling flakes, glowing embers (additive, flicker), near out of focus ash; ash settles | ash lit, embers unlit and glowing | settling ash; layers |
| aurora | soft ribbon curtains (gradient strips) in three colours with their own parallax, sky glow | overlay (the sky is the top of the view) | sky band |
| starfall | twinkling far stars (parallax 0.5), streaks with gradient tails and glowing heads | overlay, top band | sky band |
| meteor | starfall engine: fewer, bigger, fiery heads and orange tails | overlay | sky band |
| bloodmoon, eclipse, surges | v0.4.0 art kept, drawn in a view sized layer that scrolls with the world (as before), faded by the blend | overlay | as before |
| clear | nothing | nothing | nothing |

Smooth transitions: `w7List` reads Phase 5's weather blend (`TR.wx`) and draws each weather at its own weight (rain fading into snow is
both at once, no offscreen layer). HD-2D lighting and the wet grade blend the same way (`hdLook`).

### Lightning (safe flash rules)
Strikes come on a fixed schedule from a hash of the strike index: one per slot of 7.6 s at a hashed offset, so strikes are 4.2 to 11 s
apart. A strike flashes twice at most (`WX7.bolt.pulses`: 70 ms at 0.42 white, then 60 ms at 0.24 after 150 ms), every third strike is
a distant one (a fainter flash, a shorter bolt). So there are never more than 2 flashes in any second, each under 100 ms, never above 0.5
white. The bolt (glow, core, a branch) is drawn for 260 ms in the sky part of the view. Reduced motion: no strikes at all.
`v077wa.js` checks 10 minutes of storm: at most 3 flashes in any second (2 in practice), longest flash, peak, shortest gap.

### Depth and parallax
`WX7.par` [0.82, 1, 1.35]: far particles lag the camera, mid ones move with it, near ones lead it (2D views and the overlay; the overlay's
camera is the ground's screen motion, `hdOvOffset`). The ground layer (puddles, splashes, settling) is world anchored exactly. In HD-2D the
particles are in the 3D scene, so depth, size and parallax come from the camera itself; walls, roofs, props and characters hide them.

### Tiers (`WX7.tier`)
- Low: cheap and simple, the classic look kept: one or two pixel layers (rain 46 + 24, snow 40 + 22...), no soft sprites, no near layer,
  no ground layer, no banks (the old fog puffs), no shimmer, no GL weather; at most `cap` 90 particles a frame (`v077wa.js` checks it).
- Medium: three layers, soft near sprites, ground layer, banks, shimmer, GL weather (`glN` 1, `glCap` 900 quads).
- High: more of each (`glN` 1.7, `glCap` 1800), a second flake size, more banks.
Battles use at most 0.9 of the view counts (the unit canvas redraws everything each frame).

### Rules kept
- Nothing over the hero: 2D weather particles skip his box (`WFX.hero` plus `WX7.heroPad`); GL quads skip any whose projected centre
  falls in his screen box (`w7Emit`, on top of `hdWfxEmit`'s own test); banks fade by their screen distance to him (`w7BankFade`); the
  HD-2D shimmer starts above his head; the overlay's near layer uses the same box (`HW.b`). Checked by `v077wa.js` (2D 150 moments per
  weather, GL 40 frames per weather, overlay 60 frames) and `v063wo.js`.
- Battle labels: DOM over the canvas (b3Lay unchanged), unit HUD drawn after the weather (v0.5.8): checked.
- Reduced motion: a still frame (t = 0), no flashes, no gusts.

## Old visuals: the review
Screenshots of every map kind (town, town at night, field, dungeon, cave, fortress, Sanctum, Archive), every weather by day and night, the
battle stage per backdrop and weather (meadow, forest, coast, snow, heights, cave, void, dungeon, boss, arena), the results window, the
menus and the world map, at 933 x 705 and 390 x 844 (Medium): `node v077wshots.js medium kinds,wx,bt,menus,wmap` (and with a prefix
`before_` on the v0.7.6 build). What still looked old, worst first:

| what | before | now |
|---|---|---|
| world weather | screen locked dots and sticks on the 2D canvas over the HD-2D diorama (one layer, no depth), a flat tint for fog | the layered weather above |
| fog sprite | one flat radial puff stamped six times | soft cloud banks (44 faint puffs per bank sprite), three layers, in the GL scene in HD-2D |
| victory crest | blackletter "Victory" (Jacquard 24), the last blackletter in the game next to the new wordmark | heavy capitals in the Nunito UI face with a gold bevel, dark outline, soft glow and compass stars (wordmark style); `--flogo` now falls back to Nunito, so no blackletter can show anywhere |
| arena backdrop | flat bands with confetti dots for a crowd, square banners, flat sky | a sunlit colosseum: sky with soft clouds, two tiers of crowd (heads and shoulders, shaded rows), striped awnings, banners with folds and gold trim, an arcade with lit piers and dark arches, a podium wall in stone blocks with a shadow on the sand |
| minimap tiles | flat 4 x 4 blocks cut from a 2 px colour map, a hard stair step where the explored area ends | shaded tiles: lit tops and shadowed feet on walls, trees and buildings, a drop shadow on the ground below them, grain on grass and floors, glints on water, a soft explored edge, a vignette, a glow under the party marker; same 112 x 84 canvas and 4 px a tile, so taps and markers line up as before |

Left as they are (and why):
- Low graphics keeps the classic 2D world and battle backdrops by design (the cheap tier).
- The rare skies (Blood Moon, Solar Eclipse, Elemental Surges) keep their v0.4.0 overlay art.
- Small HD-2D markers (the dungeon way out arrow, quest marks, pips) are still flat pixel sprites.
- The minimap stays a 1x pixel canvas (a 2x canvas would change the tap maths `v071wt.js` and the markers rely on).
- The fortress gatehouse in the 2D view is still painted flat (v0.6.3 limit); the title screen's legacy weather (`ui.js`) is only the
  fallback behind the v0.7.4 title scene.
- Menus (Gilded Night), the world map (v0.6.3 illustrated chart), dungeon, cave, fortress and hall interiors in HD-2D, and the battle
  backdrops other than the arena already match the HD-2D look.

## Frame rates
Headless Chromium, SwiftShader WebGL, CPU throttled 4x, 390 x 844 at 2x. `v077wb.js` (before = v0.7.6 `git show HEAD:index.html`):

| row | before | after |
|---|---|---|
| Low field rain / storm / snow / blizzard / fog | 60.3 / 60.3 / 60.3 / 60.2 / 60.3 | 60.3 / 60.2 / 60.3 / 60.2 / 60.1 |
| Low battle rain | 57.1 | 54.9 |
| Medium (HD-2D) field rain / storm / snow / blizzard / fog | 60.3 / 60.3 / 60.3 / 60.2 / 60.3 | 60.2 / 60.2 / 60.1 / 59.9 / 60.3 |
| Medium battle rain | 53.9 | 53.8 |
| High field rain / storm / snow / blizzard / fog | 60.3 / 60.2 / 60.2 / 60.3 / 60.2 | 60.2 / 60.2 / 60.2 / 60.3 / 60.3 |
| High battle rain (SwiftShader, already this slow before) | 4.5 | 4.4 |

`v053perf.js` (field in rain): Medium HD-2D 57.8 fps before, 59.3 after; Low 60.4 / 60.6. `v053bperf.js` (battle on auto in rain):
Medium 59.3 / 58.9 portrait, 58.2 / 58.1 landscape (same session). High may cost more: High fog was 37 fps in a first version and was cut
to 59 by fewer banks.

## Tests
- `v077wa.js` (all pass): lightning rules; no `Math.random` from the weather; world 2D (Medium, HD-2D off): far, mid and near layers,
  ground layer, banks, shimmer, the near layer leads the camera (27 px for 20), nothing over the hero, reduced motion, rare skies, blends;
  Low: cap, no near or ground layer, every weather still draws; HD-2D (Medium, High): GL particles per weather, rain decals, overlay
  layers, shimmer, no GL quad over the hero, a strike lights the scene and draws a bolt, overlay near streaks off the hero, reduced motion;
  battle (Medium, Low): ground layer under the units, layers, banks, every weather, rare skies, HUD after the weather, reduced motion;
  the victory crest is not blackletter and no text on screen is; the minimap is styled at the same scale; the arena is the colosseum;
  no console errors.
- `v077wb.js`: frame rate budget against the build before (Medium and Low within 3 fps).
- Rerun and passing: v063wo, v062a, v053a, v053b, v050p5c, v050p2bg, v056a, v058a, v059a, v060a, v063ba, v071t, v071wb, v050p2daily
  (against v0.7.6), liveupdate. v050p5b fails the same 3 checks on v0.7.6 (the menu save note at 740 x 360), outside this pass.
