# cohere15: the cohesion pass (v0.20.10)

The owner turned down a full restyle: "lean closer to the current style, just more uniform, everything looking like it belongs in the
world". `v3/cohere15.js` (last in MODS) tunes the existing renderers. It changes no sprite design, map, tile paint (the encounter grass
keeps the 0.20.5 paint), game number or save field. Test: `tools/chrome/v186a.js` (world group).

Toggle: `META.cfg.cohere` (missing = on). Settings > Display > "Unified look" sits right under HD-2D world. Changing it drops the sprite
cache (`IMG`) once, rebuilds the map's base and HD-2D bake, and rebakes the battle backdrop (`ch15Sync`, run from the `worldDraw` and
`battleFrame` hooks). For tests, `window.__CH15` has `.off` (module off at runtime), `.n` (counters), `.err` (caught errors) and `.lk`
(the last HD-2D look, tests only).

## The seven items
1. **Sharpness.** HD-2D: the tilt shift blur is off (`HD2D.dof.max` 0 while on). At wide views it already covered everything, so this
   matters on phones in portrait. The distance haze is slightly thicker (`fogA` +0.05). Battle (Medium, High): the backdrop is baked
   without its depth of field blur and sampled nearest (`hbBake` / `hbTex` hooks; the composite texture is set to NEAREST after the bake),
   and the floor has no mip blur bias (`HD_BATTLE[tier].dof` 0).
2. **Outline.** Everything that stands up (props from `objCanvas`, building and entrance sprites in `m.bsp`) goes through `ch15Ink` on
   a copy. Each silhouette pixel takes the darkest tone of the colour it touches (0.45 of it) mixed halfway toward the ink `#1a1028`,
   never pure black. A second dark ring just inside is folded into the shade of the colour within (one texel lines), and interior
   near-black takes the ink's hue. Painted HD sprites lose chars13's faint second drop edge (alpha 150 / 235). The ground gets none.
3. **Light.** HD-2D: the characters' ambient (`uAmb` of the char program) leans 16% toward the realm ground palette's hue, which
   normalises to luma 1. Flat view: walkers get the same lean (`walkerCanvas` result, cached per canvas and realm). Low battle: units
   get the lean times the stage's ambient. Rim light and contact shadows are left as v0.5.8 and chars13 made them.
4. **Texel size.** Roofed houses (`hdBldKind` 'roof') get tile courses: three-row courses, staggered 4 px seams, and a per-tile tone and
   warmth jitter from a hash. The jitter is always added; the course lines only on flat roofs. HD-2D roofs are 0.78x as tall
   (`hdRoofProf`). Close to the camera the old ridges came out at about four times a sprite's texel size.
5. **Occlusion.** HD-2D draws the hero quad once more after the scene, lit, with no depth test (`hdScene` after hook). Under a roof he
   is solid instead of the pale see-through silhouette over the roof's dither. The roof still thins out around him.
6. **Battle.** Units are 1.25x on every stage, drawn about their feet (`drawUnit` wrap; chars13's mid-ground silhouettes are drawn
   unscaled first). Unit boxes are a scaled copy. This is a raw `unitBox` wrap because battle11, gfx6battle and p2world wrap it raw
   outside the hook chain. `b3Body` (new `HOOK.def`) grows the body box, so bars and labels follow. A unit that would rise past the top of the stage grows less and stands lower, as battle11
   places its big foes. One at a side of the stage grows only as far as the edge.
7. **Palette.** The same `ch15Ink` pass leans props and buildings toward the realm's ground palette. Greys and stone lean most (up to
   26%), saturated paint least (12%). Light plaster and paper lean up to 70% less, and lamps and windows (saturation over 0.55) not at all.

## The menus (same toggle)
`body.ch15` is set from the `render` and `worldDraw` hooks (`ch15UI`). Turning the look off removes the class; v186a checks that the
computed frames come back exactly and that no box moves or resizes. There are no layout, size or behaviour changes, so tap targets stay
as they were.
- **HD skin palette.** The `ui3.css` surface tokens (`--ui-0..3`, `--ui-face`, `--ui-panel`, `--ui-btn(-h)`, `--wood*`, `--ink`) are
  the same colours pulled about 30% toward their own luma in the realm's ground hue, then 20% toward the ink (`ch15UIVars`, set as
  `--ch-*` on body per realm). The Flat look (Low) keeps its wood colours and takes only the frame rule below.
- **One frame rule.** Panels, dialog and text boxes, buttons, chips, rows, cards, slots, the HUD wallet and chips, the battle command
  items, party and foe cards, the order bar, shop sections and dropdowns all get the same treatment. The border is the dark tinted ink,
  and `box-shadow` is a 1 px top left highlight bevel (`--ch-hi`) plus a 1 px ink outline: the sprite outline and rim light rule. Panels
  keep their gold inner line and corner ornaments. Selected chips and cards keep a gold ring outside the ink. Menu tabs (`.chips.mgrp`,
  `.chips.msub`) keep their joined bar and only take the ink border.
- **No pure black, no glassy blur.** Shadows are tinted with the ink. The menu backdrop dims and desaturates the screen without the
  1.6 px blur, and `backdrop-filter` is off.
- **Icons.** Icons drawn through `cvURL` (items, materials, gear, charms) get the sprite outline pass (`ch15Ink`, no palette tint) under
  a separate cache key.
- **Contrast.** Text colours are unchanged over the darker tint. v186a measures every visible text in the menu, Settings, a shop, the
  dialog box, the header and the battle command menu at 1000x560 and 390x844: none is under 4.5:1, with the look on or off.

## Hook points added (one line each)
`hbTex` and `hbBake` (hdstage.js), `b3Body` (battle3.js). Raw wraps (functions no hook list covers, or ones wrapped raw outside the
chain): `unitBox` (outside battle11/gfx6battle/p2world), `cvURL`, `hdRow`.

## Numbers (SwiftShader, from v186a)
- Frame (HD-2D High, town, 390x844 dpr 2, direct draws, median): on 10.0 to 10.8 ms, off 10.0 to 11.9 ms. That is within noise, never
  over +2%.
- Map rebuild plus first frame: cached on again, the same as off (217 vs 243 ms). The first entry of a map pays the ink pass once,
  about 50 to 100 ms.
- Ground band below the hero on a phone: high-frequency energy +9 to 12% on (no blur). The far band is within 10%, since it takes the haze.
- Building outline: second-ring pixels 8 -> 2, 1 -> 43 dark tones (tinted by what they touch), 0 pure black.

## Stale expectations updated (one line note in each)
`v140a` hashes the hero walkers with the look off. `v152a` and `v160a` read the box as canvas x the box's own scale. `v183a`: base roof
pitch .78. `v070ob`: the stage area is the union with the log line (on 1280x720 the line sits above the stage).

## Not done
- The QUESTS sign's text keeps its size (town decor is drawn per frame in 2D from `townDecorActors`).
- The x-ray dither round the hero is unchanged; only the hero is now solid over it.
- Props drawn with plain fills rather than `objCanvas` (fences, a few town props) keep their old lines.
