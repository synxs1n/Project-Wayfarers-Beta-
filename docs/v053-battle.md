# v0.5.3 battle stage: HD-2D look (WebGL1)

The battle stage now reads as a lit diorama: pixel-art units stand on a perspective ground plane in front of a softly blurred, layered
backdrop, with point lights (torches, braziers, lava, crystals, a lantern at night, every spell), bloom, a colour grade by time of day and
weather, soft unit shadows, a key light rim and light shafts. Element spells got their own set pieces, impacts and camera pushes. The look
follows the general idea of "HD-2D" (pixel sprites, high resolution light and depth of field); no asset, name or art of any game was used:
every texture, prop and effect is drawn in code.

GAME_VERSION and the changelog are untouched (the lead merges those). No save key, db schema or game state changed.

## How it works
- `#bcv` (the old 2D battle canvas) keeps drawing the units, bars, pips, particles, weather and the flash at the logical stage size, but
  on a transparent background (`BV.glStage`): the backdrop blit and the 2D cloud and glint animation are skipped. Everything else in
  `battleFrame` and `drawUnit` is unchanged.
- A new WebGL1 canvas `#bgl` sits in `#bwrap` right before `#bcv`, with exactly the same CSS box (left, top, width, height,
  transform-origin) and `pointer-events:none`. The DOM unit layer `#bstage` (z-index 3) stays above both, so damage numbers, tags,
  shield pips, status symbols, the primed marker, element icons and tap targets are where they were. Camera pushes (gfx6battle.js)
  transform `#bgl` together with `#bcv` and `#bstage`.
- **The bake** (once per backdrop key, stage size, tier, time of day and weather; `hbBake`):
  - far backdrop: `bgStatic(key)` above the ground line `bgGY(H)` plus far props on the back edge of the floor (trees, pines, palms,
    rocks, standing stones, crystals, stalagmites, crates, torch stands, a lantern at night) and soft clouds by day, drawn into a 2D canvas,
    then blurred in GL (depth of field, premultiplied 9 tap gaussian at 2x) with its bright parts bloomed in;
  - floor: a 128x128 tileable pixel texture per ground kind (grass, tall grass, flowers, forest, sand, snow, rock, cave, void, highland,
    dungeon flagstones, boss flagstones with inlays, cavern rock with crystals, arena sand, plus a cobbled road band for road backdrops),
    mipmapped; glowing pixels (lava cracks, void veins, crystals, boss inlays) carry an emissive mask in the alpha channel;
  - theme lights: hall torches and side torch stands, boss braziers and the boss rune circle, lava glow along the cave horizon, crystal
    and void glows, a lantern at night outdoors;
  - the look (`hbLook`): `HD_LOOK` by `phaseProg()` outdoors (not in the Daily Trial, which keeps day), `indoor` in caves, halls and boss
    stages, then the weather's tweak; key light position per realm (where the sun sits in that realm's backdrop).
- **The stage shader** (`hbMainFS`): the floor is a perspective projection of the floor texture below `bgGY(H)` (depth from the screen
  row, `HD_FLOOR.persp`), sampled with a mip bias that keeps the band where units stand sharp and softens toward the horizon and the
  bottom edge (tilt shift); a road band, soft unit shadows (perspective squashed, nudged away from the key light), point lights as floor
  pools and air halos, glowing floor circles (boss runes, casting circles, water ripples), cloud shadows drifting by day, fog where the
  floor meets the backdrop, a haze band over the seam, light shafts, then the grade (gain, lift, saturation, contrast), a vignette and a
  soft shoulder for bright spots.
- **Two modes** (`HD_BATTLE[tier].mode`):
  - `full` (High): every frame the unit canvas is uploaded as a texture (nearest, so pixels stay crisp) and composited by GL: units are
    lit by the ambient and nearby lights, get a rim light from the key light, are graded with the stage, and bright effects bloom
    (half size bright pass of the unit layer, two blur passes). HUD pixels are kept unlit and out of the bloom: `drawUnit` marks the bar
    and pip strip with alpha 254 (`destination-out` at 1/255) while `BV.glFull` is set, and the shader passes those pixels through
    ungraded. The impact frame and the Limit Break spotlight are drawn in GL.
  - `under` (Medium): the full shader runs once into a still (with the theme lights at rest and the boss circle); `#bcv` stays visible on
    top, and the GL canvas is only drawn again when the still changes (new backdrop, size, tier, weather or time of day) or for the Limit
    spotlight; the shake moves it with CSS `translate` (composed with the camera transform). Spell and caster lights become soft additive
    pools on the floor and halos in the air drawn in 2D under the units (cached glow sprites), the shadow vortex a dark pool. Shadows are a cached soft sprite drawn in 2D under each unit (`hbShadow2D`),
    floor circles are drawn in 2D under the units (`hbUnder`, through the new `BV.glUnder` hook), sprites are tinted to the scene's light
    with a cached multiplied copy per sprite canvas (`hbTint`, through `BV.tint`), the impact frame stays the 2D one from gfx6battle.js.
    No parallax, torches do not flicker and light shafts stand still on Medium.
- **Fallbacks.** Low, no WebGL (`getContext('webgl')` fails), `GFX.off`, a shader or GL error (`HB.dead`, logged once with
  `console.warn`) and a lost context (`webglcontextlost`, `HB.lost`) all draw the old 2D stage exactly: `BV.glStage` stays false, so
  battle.js and gfx6battle.js run their old code paths, `#bgl` is hidden and `#bcv` is opaque again. A restored context rebuilds the GL
  resources on the next frame (and a new battle retries).
- **Spells, impacts, camera** (`hdspell.js`, GL stage only, never under reduced motion): fire tongues and a hot core, ice spikes that
  shatter, a bolt from the top of the stage that re-forks and flickers, a water geyser with ripples, earth spikes with dust and a small
  shake, a wind funnel, a beam of light, a shadow vortex with a negative light that darkens the stage around it, a star flash on physical
  hits; each with a point light and most with a floor circle. Casters get a floor circle, a growing light and motes drawn in. Orbs in
  flight light the floor. Big hits (weak or crit) push the camera (`HD_CAM.big`), Limit Breaks get a spotlight, a gold circle, a big light
  and a longer push (`HD_CAM.limit`). Counts scale with `HD_BATTLE[tier].spell` and are capped by the tier's particle cap (`part()`).
- Reduced motion: still frames (time 0 for shafts, cloud shadows and circles), no flicker, no set pieces, lights, circles, spotlight or
  camera push (gfx6's rules for the rest).

## 2.1 (ground plane rules)
The GL floor starts at `bgGY(H)`, the same line as the 2D ground plane; water, lava and cloud seas only ever come from the backdrop above
it; `unitBox` is untouched (feet on the ground, flyers `hover` px above their shadow, which is drawn at `gy`); boss, echo and mini fights keep
their purpose built stages (gate, braziers, banners from the backdrop; braziers light the floor, the rune circle glows in the floor). The
Daily Trial keeps its foes, order and backdrop choice (only the look changes, and the Daily keeps the day grade).

## Files
- `v3/hdstage.js` (new): the GL stage: context, shaders, bake, floor textures, props, lights, both modes, fallbacks, the `battleFrame`,
  `layoutBattle` and `startBattle` wrappers.
- `v3/hdspell.js` (new): spell set pieces, caster circles, Limit spotlight; wrappers on `burstAt`, `onFx`, `onAction`, `battleFrame`,
  `drawParts`.
- `v3/battle.js`: `battleFrame` notes the shake (`BV.sx`, `BV.sy`), clears instead of drawing the backdrop while `BV.glStage`, calls
  `BV.glUnder`; `drawUnit` notes where each unit was drawn (`u._gx`, `u._gt`, `u._ga`), uses `BV.tint` and `BV.glShadow`, skips the hard
  2D shadow on the GL stage, marks HUD pixels while `BV.glFull`.
- `v3/gfx6battle.js`: the camera push also moves `#bgl`; no 2D impact frame or vignette on the full GL stage, no 2D vignette on the under
  stage (the still has its own).
- `v3/config.js`: block "v0.5.3 HD-2D battle stage" at the end: `HD_BATTLE`, `HD_FLOOR`, `HD_LOOK`, `HD_CAM`.
- `v3/shell.html`: one `Object.assign(window.__A,{HB,...})` line for the tests.
- `v3build.py`: `hdstage.js`, `hdspell.js` after `gfx6battle.js`, before `qready.js`, `pathguard.js`.
- Tests: `tools/chrome/v053b.js` (functional), `tools/chrome/v053bshots.js` (screenshots to `tools/chrome/shots-v053b/`, not committed),
  `tools/chrome/v053bperf.js` (frame rates).

## Config keys (config.js)
- `HD_BATTLE[low|medium|high]`: `on`, `mode` (`full` or `under`), `res` (backing pixels per CSS pixel, capped by the device pixel
  ratio), `maxPx`, `lights`, `shadows`, `decals`, `bloomK`, `dof`, `rays`, `rim`, `spell`, `props`.
- `HD_FLOOR`: `persp` (perspective offset), `tile` (world size of a floor tile), `sq` (depth squash of floor circles and shadows),
  `focus` (sharp band), `fog`.
- `HD_LOOK`: `day`, `dusk`, `night`, `dawn`, `indoor` (gain, lift, sat, con, amb, key, vig, sky) and `wx` (per weather gain, sat, fog).
- `HD_CAM`: `big`, `limit` camera pushes `[zoom, ms]`.
- No new META.cfg keys: the existing Graphics setting (`META.cfg.gfx`, Auto, Low, Medium, High) picks the stage.

## Frame rates
`tools/chrome/v053bperf.js`: headless Chromium (GL is SwiftShader, software), CPU throttled 4x with CDP
`Emulation.setCPUThrottlingRate`, dpr 2, every 2D canvas CPU backed (as in `v050p6perf.js`), a field battle on auto in rain with every
unit unkillable. Best of 3 runs, before (the current main build, v0.5.2) and after interleaved in the same session. The machine was shared
with other test runs, so single numbers swing by several fps; compare rows of the same table.

Final build (`TIERS=medium REPS=3`):

| size | before Medium (2D) | after Medium (GL, under) | GL draws / frames skipped in the window |
|---|---|---|---|
| 390x844 | 56.0 (21% of frames over 20 ms) | 55.1 (16%) | 2 / 253 |
| 844x390 | 53.3 (27%) | 55.6 (27%) | 1 / 334 |

All tiers, an earlier build of the same day (Medium then still drew its GL composite every time a light or shadow moved):

| size | before Low / Medium / High | after Low / Medium / High |
|---|---|---|
| 390x844 | 55.5 / 55.9 / 54.4 | 54.8 / 38.4 / 3.7 |
| 844x390 | 55.8 / 53.5 / 50.9 | 55.1 / 46.7 / 6.9 |

That Medium was 17 fps under the old one, so Medium was simplified as the brief asks: it became the `under` mode (the lit stage is baked
once; spell lights, shadows, floor circles and the sprite tint moved to cheap 2D draws on the unit canvas; the shake moves the GL canvas with
CSS `translate`). Now an auto battle redraws the GL canvas about once per bake, and Medium matches the old Medium within noise. Low is
unchanged code (the old 2D path). High (`full`, every frame through GL at up to 2x the CSS size) costs a full screen software shader per
frame here, so it runs at 4 to 7 fps under SwiftShader; on a phone GPU that pass is small. Auto starts on Medium and only climbs to High at
57 fps or more, and drops back below 45 (never returning to a tier that failed), so phones without a fast GPU stay on Medium.

## Tests
- `tools/chrome/v053b.js` (all pass): Medium and High use the GL stage (High `full` with `#bcv` hidden, Medium `under` with `#bcv` on top)
  and draw a lit frame; the GL canvas has the 2D canvas's box; on High the bar and pip pixels come out unlit (worst difference 0 of 255);
  tags, pips and unit buttons are above the GL canvas and get the taps; all 8 element spells spawn their set piece and lights; particles stay
  under the tier cap; every backdrop key (91) builds and draws on the GL stage at 390x844 and 932x430 with every unit's feet (or a flyer's
  shadow) on the ground plane and the GL ground line equal to `bgGY(H)`, plus the base, arena and boss keys drawn directly; a lost context
  (`WEBGL_lose_context`) falls back to the 2D stage with its backdrop and comes back after a restore; Low, and Medium and High without WebGL,
  draw the old 2D stage (every pixel opaque) with no set pieces or lights; reduced motion keeps the GL stage but spawns no set pieces, lights
  or circles and pushes no camera; at 390x844, 844x390, 933x705 and 1280x800 the GL canvas, the 2D canvas and the unit layer line up and
  units sit inside; no console errors anywhere.
- Re-run, all pass: `v050p2bg` (91 backdrops, both stages), `v050p6a`, `v051a`, `v050p1d`, `v050p1g`, `wide` (38/38), `v050p1b`,
  `v050p2daily` with `OLDHTML` = the current main build (same seed, weather, heroes, foes, turn order, backdrop, no surprise).
- Screenshots: `tools/chrome/v053bshots.js [tiers]` writes portrait and landscape shots of 12 stages (meadow day, meadow road at dusk,
  forest at night, coast, snow at dawn, heights in rain, void, cave, a dungeon hall, two boss stages, the arena), 8 spells mid cast and a
  Limit Break to `tools/chrome/shots-v053b/` (not committed).

## Limits and notes
- Medium (`under`) trades some of the look for speed: units are not lit by spell lights (only tinted to the scene), no bloom on the unit
  layer beyond gfx6's glow sprites, no parallax, still torches and shafts. High has all of it, every frame; on a phone GPU that is a
  single full screen pass with a handful of lights, but in headless Chrome with SwiftShader (software GL, as in these measurements) it is
  slow, so Auto keeps phones on Medium unless they hold 57 fps there (and never returns to a tier that failed).
- The floor textures repeat (a 128 px tile); far away the repeat is hidden by the mip blur and fog, close up the macro patches help.
- Far props are baked into the backdrop and blurred with it, so they are always behind every unit; nothing is ever drawn in front of a
  unit except effects.
- Spell lights light units only on High. The HUD marking (alpha 254) also catches any sprite pixel that overlaps a bar strip drawn
  earlier; such a pixel stays unlit (never seen in the screenshots).
- The camera push is still a CSS transform (as in Phase 6), so the GL canvas is scaled with the others rather than re-rendered at the new
  zoom; at the pushes used (up to 7%) this is invisible.
