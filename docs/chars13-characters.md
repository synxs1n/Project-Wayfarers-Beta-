# chars13: the characters pass (outline rule, idle life, stage depth, damage text)

Module `v3/chars13.js` (last among the battle and sprite modules). Everything is a hook on an owner's function; the owners gained one
`HOOK.def` each: `paintHD` and `walkerCanvas` (sprhd.js), `drawUnit` (battle.js), `bgStatic` (bg.js), `fx` (engine.js). The raw wrappers
that already sat on those functions (npcart9, fxkind11, gfx6, insight, fx2) still wrap outside the chain. Test: `tools/chrome/v178a.js`.

## 1. One outline rule
A result hook on `paintHD` post-processes every HD painted sprite on its own 2x bitmap (so whole-pixel scaling keeps it crisp): a
one-pixel dark outline all round the silhouette in the sprite's own darkest painted body tone (eyes left out) mixed `C13.ink` (.5) toward
the ink colour; the old second pixel on the shadow side (and the light "rim" outline of dark foes) becomes one faint drop edge at alpha 150;
a one-pixel rim light on the lit (upper left) side lifts silhouette pixels `C13.rim` (.4) toward a warm white. The hook also keeps the
doubled key grid's kinds on the canvas (`c._k13`: body, eye, hair, cloth, skin) for the idle frames.

Audit (v178a and the sheet script): silhouette edge pixels (solid, with an empty 4-neighbour) with luma <= 72, over 698 sprites (hero
rigs, walkers, villagers, every world foe, every foe as the battle repaints it): before 96.8% mean, 39 sprites under 90% (dark foes with a
light rim outline at 0%); after 99.6% mean, min 92%, none under 90%. Not covered: the legend mounts (the horse is drawn straight, not
painted) and the world copies of the enlarged minibosses (sites.js resamples the painted canvas 1.5x, which drops part of the ring; in
battle they are repainted and reach 100%).

## 2. Idle life
`c13Frame(c, code)`: two-frame idles built once per canvas (a WeakMap, at most 8 frames per canvas, keyed by bits): breath (the band from
the shoulders to the hips rises one logical pixel), blink (the eye rows under the lid take the skin tone next to them, 140 ms every 4.3 s),
sway (hair below the chin and the cape, scarf and tail pixels hang one pixel further back), lean (plants and the undead), pulse (jellies).
The frame clocks (`battleFrame`, `worldDraw`) set `C13.t`; the result hooks on `walkerCanvas` (every standing walker in the world, 2D and
HD-2D) and `spriteOf` (battle heroes at rest) return the frame the clock asks for, each character offset by a hash of its key. Battle heroes
keep drawUnit's breathing squash (a `drawUnit` hook offsets each unit's phase by that hash, so the party no longer breathes in step) and add
blink and sway; bosses and guardians get a two-pixel exhale (`BIDLE` pre-filled with `c13Heavy`). Nothing moves under reduced motion, and
nothing marks the battle busy: the perf12 limiter still draws 30 fps at rest (v178a and v170a).

## 3. Stage depth
`c13Mid(key, W, H)`: two or three silhouettes per backdrop kind (rocks, trees, dunes, cave teeth, ice spires, ruins, pillars, Breach
shards) in the ground's own tone, darker and greyer, standing on the ground band at the side margins where no unit slot is. A `drawUnit`
hook draws each one before the first unit whose feet are further down (depth order), shifted a pixel or two against the camera punch. On
the Medium 'under' stage they take the bake's tint; on the High stage they ride the unit layer and are lit with it. The 2D ground plane
gets a dithered haze toward the horizon in the far sky's colour (a result hook on `bgStatic`, once per cached backdrop; the HD floor
already fogs with distance). The plain 2D stage gets a soft contact shadow under every unit (`BV.glShadow`, the hook drawUnit reads; the
GL stages keep their own).

## 4. Damage text
A result hook on `fx` tags each damage entry with its element as a class (`el-fire` ...). The module's style element sets the floating
numbers in Pixelify Sans with a solid dark outline: physical white, weak amber, resisted grey-blue, each element its colour, heal green,
crit gold with a scale pop and a white flash (`c13crit`), misses small and grey; the reaction chips and the reaction banner use the fantasy
face (`--ffan`), the banner's font size scaled by the measured Nunito/Cinzel width ratio (`b9BanBox` hook) so it fits the box the layout
measured. Boxes still come from `b3FxRects` and `b9BanBox`, so texts stay inside the stage and off faces.
