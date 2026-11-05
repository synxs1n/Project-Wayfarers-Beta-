# Beta v0.5.0 Phase 6: graphical upgrade (6.1 to 6.6)

Cleaner, more modern 2D presentation over the same pixel art, with a Graphics quality setting and reduced motion support. Everything is
added around the existing renderer (wrappers and extra passes in new files), so the old drawing code is unchanged.

## Files
- `v3/gfx6.js` (after `ambience.js`): quality state and Auto, shared cached sprites (glow, soft shadow, vignette), the parallax hook for baked
  backdrops (`bgStatic` and `groundPlane` wrappers), title screen parallax (`titleDraw` wrapper), menu depth of field (`render` wrapper adds
  `html.mopen`), Settings > Graphics row (`settingsBody` wrapper appends `gfxRow()`), frame sampler (`loop` wrapper), `applyCfg` wrapper.
  `GFX.off` (tests only, never saved) bypasses every Phase 6 pass for before and after measurements.
- `v3/gfx6world.js`: world passes. `buildMapCanvas` wrapper bakes ambient occlusion; `townDecorActors` wrapper pushes two entries into the
  depth sort (ground layer `g6Ground`, sky layer `g6Sky`, both under the night tint and dusk grade); outermost `worldDraw` wrapper draws
  bloom (`g6Bloom`) and the vignette.
- `v3/gfx6battle.js`: battle passes. Wrappers on `battleFrame` (shake cap, Limit Break camera, victory state, parallax on, impact frame,
  vignette, camera apply), `onFx` (camera push, impact frame, hit dust), `burstAt` (element particles), `part` (cap), `drawParts` (new kinds,
  orb bloom), `unitBox` (victory hop only while the battle is won), `layoutBattle` (camera reset).
- `v3/config.js`: `GFX_Q`, `GFX_AUTO`, `GFX_PARA`, `GFX_CAM` (end of file, marked Phase 6).
- `v3/style.css`: block at the end marked "Beta v0.5.0 Phase 6".
- `v3/shell.html`: one new `Object.assign(window.__A,{...})` line (line after the existing exports) for the tests.
- `v3build.py`: `gfx6.js`, `gfx6world.js`, `gfx6battle.js` appended after `ambience.js`.
- Tests: `tools/chrome/v050p6a.js` (functional), `tools/chrome/v050p6shots.js` (screenshots), `tools/chrome/v050p6perf.js` (frame cost and fps).

## Settings and save fields
- `META.cfg.gfx` (new, optional): `'auto'` (also when missing), `'low'`, `'medium'`, `'high'`. Settings > Graphics (Auto, Low, Medium, High).
- `META.cfg.gfxAuto` (new, optional): the tier Auto last settled on, used as its starting tier next time (default `GFX_AUTO.start`, Medium).
- No save key, slot or db schema change. Old metas load as Auto. The Daily Trial is untouched (no game state is read or written).
- Reduced motion: `reducedMotion()` (`META.cfg.rmotion` or the device setting). Every new motion is drawn at time 0 (a still frame):
  leaves, water glints, grass, critters, birds, bloom flicker, parallax drift; no camera push, impact frame, gestures, victory hop or extra
  element particles; screen shake stays off (anim.js) and the new CSS transitions are off under `html.rm`.

## Quality tiers (config.js GFX_Q)
| feature | Low | Medium | High |
|---|---|---|---|
| battle particle cap | 140 | 280 | 500 |
| drifting leaves or dust | off | 10 | 22 |
| birds, critters | off | 3, 3 | 5, 5 |
| swaying grass | off | on | on |
| water glints, AO (baked), vignette, soft townsfolk shadows, gestures | on | on | on |
| bloom | off | lights | lights + battle orbs, larger |
| parallax (battle, title) | off | on | on |
| camera push | on | on | on |
| impact frame | off | on | on |
| element particles | off | some | more |
| menu depth of field | dim | dim | blur |
| screen shake cap | 1 px | 2 px | 2 px |

Auto (`GFX_AUTO`): measures 3 s windows of frames on the world and battle screens (no menu open, tab visible, gaps over 250 ms skipped);
below 45 fps it steps down a tier, at 57 fps or more it steps up, but never back up to a tier that failed this session.

## Items
- **6.1 Lighting and depth: done (partial on "every prop").** Bloom: soft additive glow (cached sprite, no gradients per frame) on every
  lamp, window, torch, brazier, crystal and lava light, each with its own flicker; windows and lamps only bloom from dusk to dawn and in dark
  places. Spell glow in battle: a glow at every element hit and (High) around spell orbs; casting auras are the existing ones. Soft shadows:
  townsfolk on the map (the hero, trees, bushes and props already had them; battle units keep their shadow ellipse). Ambient occlusion:
  soft contact shading baked into the map under cliffs and dungeon walls, beside walls and along building fronts (zero per frame cost).
  Vignette on the world (stronger at night and in dungeons) and a light one in battle. Parallax: battle and title backdrops (see 6.5).
  Depth of field: an open menu dims the scene behind it (Low, Medium) or blurs it (High). Lighting reads the current phase through
  `phaseProg()` each frame and draws after the night tint and dusk grade, so a later smooth blend (Phase 5, 5.4) carries over unchanged.
- **6.2 Cleaner UI: done (light touch).** Softer panel depth (inner highlight, soft drop shadow), crisper text rendering, a slightly
  brighter muted text colour for contrast, a touch more row spacing, button and chip press feedback with transitions, keyboard focus
  rings, bars that glide to new values with a highlight, a smoother menu entrance. Not restyled on purpose: status symbols, shield pips,
  primed marker, element icons and the save indicator.
- **6.3 World feels alive: partial.** Done: animated water glints that drift with the wind, swaying tall grass, drifting leaves (meadow,
  heights), sand (coast), ash and embers (cave), motes (void) and dust (dungeons and caves), per light flicker, birds with ground shadows
  (fields and towns, by day and dawn, not in rain or storms), hopping critters (rabbits, crabs on the coast) that duck away when you come
  close, townsfolk idle gestures (speech bubbles: thinking, humming, surprise, heart), wind strength from the weather (`WX_WIND`).
  Already in the game and kept: chimney smoke, fountains, braziers, shop props (forge embers, alchemy bubbles, inn lamp, guild banners),
  townsfolk wandering. Skipped: swaying trees (trees are baked into the map; redrawing them per frame costs too much on phones) and longer
  walking routes for townsfolk (would change where NPCs can stand, which is game state and collision).
- **6.4 Characters: partial.** Kept: idle breathing, walk cycles, the weapon family poses with anticipation and recovery (anim.js), KO poses.
  Added: hit reaction dust at the feet, victory hops for standing heroes when the last foe falls, the impact frame. Skipped: cloth and hair
  motion and walk turn frames (need new sprite frames, a redraw; out of scope for "not a redraw").
- **6.5 Battle presentation: done.** Camera pushes (CSS transform on the canvas and the unit layer together, so damage numbers and tap
  targets stay aligned) on crits, reactions, breaks and Limit Breaks (`GFX_CAM`); impact frames; screen shake capped (`GFX_Q.*.shake`);
  richer elements: fire embers, ice shards and frost ring, water droplets and splash ring, earth rocks that bounce, wind leaves, lightning
  arcs, shadow wisps, light and arcane sparkles, each with a glow; cleaner damage numbers (crisp outline, soft drop, smoother pop).
  Parallax: while a battle or title frame draws, `bgStatic()` returns a composite of a slightly wider bake: the sky band and the far band
  drift (idle sway and against the camera), the ground band (found from the `groundPlane()` call that drew it) never moves, so units stand
  exactly where they stood. It does not choose backdrops or change slots; Phase 2's new backdrops get it for free if they draw through
  `bgStatic` and `groundPlane` (others fall back to a ground line at 62% of the height).
- **6.6 Performance: done.** Particle cap per tier, cached sprites and canvases reused (glow, shadow, vignette, the parallax composite),
  no gradients, arrays or closures made per frame in the new passes. Measured below. Low drops what cost the most for little gain on small
  screens: bloom, leaves, birds, critters, grass, parallax, impact frames, element particles and the blur.

## Frame rates (tools/chrome/v050p6perf.js)
Headless Chromium, CPU throttled 4x with CDP `Emulation.setCPUThrottlingRate` (a mid range phone), 390x844 at 2x, every 2D canvas CPU
backed (as on a phone without GPU canvas). Scenes: town at night, field in rain, dungeon, battle on auto in rain. `fps` is the real
requestAnimationFrame rate over 3 s, with the share of frames slower than 20 ms. `P6` is the cost of the new world passes alone (ground
layer, sky layer, bloom; minimum over many runs). "P6 passes off" is this build with every Phase 6 pass bypassed (`GFX.off`, tests only),
measured interleaved with the tiers in the same page. Command: `REPS=2 PWHTML=../../out/aurelis3.html PWBASE=<v0.4.6 build> node v050p6perf.js`.

| build | town (night) fps | field (rain) fps | dungeon fps | battle (auto, rain) fps | P6 world passes, ms per frame (town / field / dungeon) |
|---|---|---|---|---|---|
| before: v0.4.6 build | 60.2 (12%) | 60.3 (6%) | 56.0 (28%) | 54.6 (19%) | n/a |
| before: P6 passes off | 60.2 (17%) | 59.8 (12%) | 60.0 (19%) | 45.6 (38%) | 0 |
| after: Low | 59.8 (16%) | 60.2 (14%) | 57.8 (26%) | 43.7 (36%) | 0.01 / 0.01 / 0.00 |
| after: Medium | 59.8 (20%) | 60.3 (19%) | 57.8 (24%) | 47.1 (39%) | 0.05 / 0.07 / 0.11 |
| after: High | 59.6 (13%) | 60.3 (20%) | 56.3 (31%) | 46.3 (38%) | 0.06 / 0.07 / 0.17 |

Reading the numbers: the world holds the 60 fps cap at every tier and the new passes cost under 0.2 ms per frame at 4x throttle (about
1% of a frame). Whole frame draw times were also logged (`v050p6perf.out.json`), but on this shared machine they swing between 0.2 and
5 ms for the same scene even with the passes off, so they cannot show a sub millisecond difference; the isolated P6 figure can. Battle
sits at 44 to 55 fps in every row, the old build included: the cost there is the battle screen's DOM refresh (renderBattle every 110 ms
while animating), not the canvas, and the spread between rows is run to run noise (the "off" and tier rows come from the same page).
Nothing measured needed dropping beyond what Low already turns off.

## Merge notes
- `config.js` and `style.css`: blocks appended at the end of the file; `v3build.py`: three names after `ambience.js`; `shell.html`: one new line after the export lines.
- Wrappers sit on `worldDraw`, `townDecorActors`, `buildMapCanvas`, `battleFrame`, `onFx`, `burstAt`, `part`, `drawParts`, `unitBox`,
  `layoutBattle`, `bgStatic`, `groundPlane`, `titleDraw`, `render`, `settingsBody`, `applyCfg`, `loop`. As long as other phases keep these
  names, the order in v3build.py (Phase 6 files last) keeps the passes on top.
- Phase 5 (5.4 blends): the new lighting reads `phaseProg()` and `G.weather` each frame and draws after the tint, so a blended grade works
  as is; `WX_WIND` could later be blended the same way.
- Phase 2 (2.1): parallax never moves the ground band or unit slots; the victory hop only applies while a battle is won.
