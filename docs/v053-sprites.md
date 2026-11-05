# v0.5.3 HD sprites (heroes, townsfolk, monsters)

Goal: higher detail pixel art in the spirit of HD-2D games: taller heroes, more shading steps, rim light, coloured line art, readable
faces, and monsters with more volume. Everything is still drawn by code from the same look data, and one switch restores the old sprites.

## Switch
`config.js`: `SPRITE_HD` (true) and `SPR` (`k` 2 = detail factor, `addH` 6 = extra hero rows, `rimA` rim light strength, `outA` line art
darkness). `SPRITE_HD=false` gives the v0.5.2 sprites and canvases exactly: `sprhd.js` and `sprhd2.js` then define their helpers and change nothing.

## How it works
Nothing in the look data changed: heroes still come from `heroes.js` RAW looks, `art.js` / `art2.js` parts (bodies, hair, hats, faces,
weapons, flair, races, sizes), `capes.js`, `heroLook` (signature gear), `sprites.js` tier colours for gear icons, and monsters from `MART`,
`MEXTRA`, realm variants (`realms.js`), echoes (`echo2.js`), night forms (`world3.js`), minibosses and rivals (they reuse `MART` / hero looks).
The key grids those builders make are painted by a new painter instead of `paint()`.

`v3/sprhd.js` (right after `art3.js`):
- `paintHD(grid, pal, opt)`, the shared shading helper:
  1. Scale2x (EPX) doubles the key grid: corners round off, diagonals smooth, no new colours.
  2. `opt.detail` edits the doubled grid (heroes: `faceHD`, eyes with a dark lid row, iris with a white catchlight, lighter lower iris, a
     brow pixel and a blush pixel).
  3. Light from the upper left. Each pixel's tone comes from how far it is from the edges of its own part (run lengths up, down, left,
     right) blended with its distance to the edges of the whole figure, so parts read as rounded and the whole figure is lit as one.
     Cast shadow under an overlapping part (two rows), darker underside, a seam where a part meets a brighter part.
  4. Six step hue shifted ramps per material (`hdRamp`): specular, highlight, light, base, shadow, deep. Highlights lean warm, shadows
     cool violet. Materials: skin (warm red shadows, no hard highlight), hair (sheen band, strands), metal (high contrast, specular glints,
     plate edges), cloth (folds on big cloth parts), everything else.
  5. Rim light: a cool light on the shadow side edge of the silhouette (right and upper right).
  6. Line art: the darkest tone of the part it outlines mixed toward the ink colour, lighter on the lit side, one extra pixel on the
     shadow side (bottom and right) so the silhouette still reads at small sizes. `rim` (dark monsters) and `glow` options as before.
  7. Monster families (`monTex`, from `MON_TY` / `BOSS_TY` in archetype.js, also for variants and echoes): fur strands (beasts), plate
     edges (armored), feather rows (flying), leaf spots (plants), a wet sheen (jellies), tattered folds (undead).
- `stretchHero`: heroes stand `SPR.addH` (6) logical rows taller. Rows of the chest, hips, thighs and shins are repeated (relative to the
  feet on row 36 of the old grid), the head keeps its size and its row, so heads are a smaller share of the body (about 1:3.2 instead of
  1:2.7). Small and stout heroes get fewer extra rows and are padded at the top, so the feet of every hero land on the same row.
- Overrides `heroGridSide`, `heroGridView`, `heroCanvas`, `walkerCanvas`, `monCanvas`, `monURL` (only when `SPRITE_HD`).
- `sprHD(canvas, k)`: an HD canvas keeps its real bitmap but its `width` / `height` read (and set) the logical size; `_rw` / `_rh` are the
  real size. A small `drawImage` patch scales the 3 argument form to the logical size and the source rectangle of the 9 argument form by
  `k`; the 5 argument form already gives a destination size. So every consumer that places sprites with `c.width` / `c.height` (battle
  `unitBox`, `drawSprite`, breathing and squash cuts, KO pose, mounts) keeps its logical numbers, and a WebGL renderer that uploads the
  canvas gets the full detail with the logical quad size.
- `hdCv(w, h)`: a fresh HD canvas whose context already draws in logical units.

`v3/sprhd2.js` (last in the build): the consumers.
- `ssCanvas`: the world canvas (`#wcv`) and battle canvas (`#bcv`) render at `SPR.k` with the same trick (logical width / height, every
  resize resets a `k` transform), hooked from `worldSizeCanvas`, `layoutBattle` and `battleFrame`. All drawing code keeps logical numbers.
- `whiteOf` (hit flashes, target pulse, Limit glow), `mountCanvas`, `petCanvas` (now 46 tall), `halfCanvas` build HD canvases.
- Idle warm up: when the world view sizes, the leader's 8 walk frames and every party hero's battle sprites are built in idle slices
  (6 ms each), so the first step and the first battle do not pay for them.
- Portrait crops: hero pictures are 6 rows taller with the head where it was, so `.port` crops, the title lineup and `.oc` keep their width
  and take `height:auto` (same scale, same crop, nothing squashed). `.himg`, `.bossv`, `.tame`, `.mimg` get `object-fit:contain`. Injected
  as a small style element (`html.sprhd`), so `style.css` is untouched and the fallback has none of it.

## Sizes
| sprite | before (logical) | now (logical) | real bitmap |
|---|---|---|---|
| hero side, front, back, walk frames, townsfolk | 36x40, feet on row 36 | 36x46, feet on row 42 | 72x92 |
| hero on horseback / with pets | 54x48 / 46x40 | 54x48 / 46x46 | x2 |
| monster | 40x40 | 40x40 | 80x80 |
| guardian, Scourge, Calamity | 60x60 | 60x60 | 120x120 |
| portraits (data URLs) | 36x40 png | 72x92 png shown at the same CSS width | |
| world and battle canvases | logical view size | same logical size, bitmap x2 | |

Battle slots are unchanged: feet stay on the slot (2.1 ground rule, `v050p2bg.js` passes), heroes are 6 px taller on a 150 px stage.
World anchoring is unchanged: `drawSprite` puts the canvas bottom at the foot point and the soles keep their 3 rows of margin.

## Performance
Sprite build cost, `tools/chrome/v053sperf.js`, 4x CPU throttle, median of 5 runs, every builder called uncached:
- town (6 heroes x 8 walk frames + every t0 townsfolk front and side): before 107 ms, now 311 to 350 ms over several runs (about 5 to 6 ms per sprite)
- battle (6 heroes stand and walk, 5 foes and a guardian, 6 portrait data URLs): before 62 ms, now 121 to 194 ms
Most of a sprite's cost is now the canvas and `putImageData`; the painter itself works on typed arrays with per colour tables (`hdKey`).
Caching is unchanged (`imgOf`, `cvURL`, `lookKey` keys), and the idle warm up builds the frames a town and a battle need before they are
needed. Frame draw cost: see the v050p6perf figures below.

Frame draw cost, `tools/chrome/v050p6perf.js 4 2000` with `REPS=2`, 4x CPU throttle, 390x844 at 2x, every 2D canvas CPU backed (the
harness forces `willReadFrequently`, so this is the worst case of raster work; a GPU canvas pays far less for the 2x bitmap). "base" is
the same build with `SPRITE_HD=false` (medium tier). Draw ms per frame | fps (share of frames over 20 ms), headless, noisy:

| build | town (night) | field (rain) | dungeon | battle (auto, rain) |
|---|---|---|---|---|
| base, SPRITE_HD=false | 0.71 ms, 57.8 fps | 1.67 ms, 60.2 | 0.79 ms, 56.3 | 0.23 ms, 43.7 |
| HD, low | 0.98 ms, 53.6 | 1.37 ms, 59.2 | 4.36 ms, 43.3 | 0.70 ms, 40.5 |
| HD, medium | 1.50 ms, 57.4 | 0.94 ms, 59.1 | 2.36 ms, 39.7 | 0.70 ms, 44.8 |
| HD, high | 1.44 ms, 53.8 | 1.56 ms, 58.9 | 2.76 ms, 46.7 | 0.71 ms, 49.9 |

Draw cost goes up about 2 to 3x (four times the pixels) but stays far under a 16 ms frame. The dungeon's frame rate drops the most in this
CPU raster harness; if that shows on real phones, the cheapest lever is to skip `ssCanvas` for the world on the low tier (HD sprites then
draw nearest-sampled at 1x, close to the old look).

## Tests
- `tools/chrome/v053s.js`: all heroes (10 frames each), all monster arts (base, realm variants, echoes, night forms), townsfolk and
  generated villagers render at the expected logical sizes and at 2x; soles on one row; nothing clipped at the top; drawImage 3/5/9
  argument forms; world canvas at 2x with logical size; portraits keep aspect with the face in the crop; title lineup not squashed;
  battle boxes, stage canvas at 2x, HD hit flashes; legend mount and pets; no console errors.
- `tools/chrome/v053sperf.js`: the build cost above.
- `tools/chrome/v053sheet.js`: sprite sheets and in-game shots into `tools/chrome/shots-v053s/` (not committed): `TAG=before` with a
  `SPRITE_HD=false` build, `TAG=after` with the HD build. heroes0..3 (side stand, side walk, front 0, front 1, back 0 for every hero),
  heroes_zoom, mons, mons_big, mons_variants, mons_zoom, villagers, town, party, codex, bestiary, battle_tall, battle_wide, field_land, title.
- Also passing: v050p2bg, v050p1g, v050p6a, v051a, wide, v050p3a, v043c (v043c's "every town gate lands on a road" is flaky in both builds).

## Limits and next steps
- The detail comes from the painter, not from new hand drawn 2x parts: the silhouettes and poses are the v0.5.2 templates (arms in the
  front view are still straight columns). The next step would be 2x templates for the head and hands, where it shows most.
- Light is from the sprite's own upper left; heroes are mirrored in battle, so their light comes from the upper right there.
- The world and battle canvases render at 2x through `ssCanvas`; the helpers working on the WebGL world renderer and the battle stage
  can drop that hook if their renderers draw at device resolution: sprites still report logical sizes and carry the full bitmap.
- Gear icons (`sprites.js`), element icons and status symbols are unchanged.
