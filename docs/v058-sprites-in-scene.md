# v0.5.8: sprites that belong to the HD-2D scenes

The owner's report: "Sprites don't look right with the new world that surrounds them." Characters and monsters looked like flat, evenly lit,
high contrast stickers on top of lit, graded, soft focus dioramas, the hero was nearly three tiles tall in the world, and a hard dark bar
with a pale line sat under the hero's feet. This pass changes only rendering and integration (no sprite art builder, no game state, no save
field, no new setting). Low graphics and devices without WebGL are unchanged. GAME_VERSION and the changelog are untouched.

## What was wrong (root causes)
- **The dark bar under every character (world).** The blended pass that draws contact shadows, glows and rings (`hdScene`, `dynB`/`dynA`)
  still had the *ground* texture bound from the pass before. The shadow's uvs pointed into the atlas but sampled opaque ground texels, so
  every soft shadow came out as a solid dark rectangle (the "hard dark bar"), and glows as tinted boxes. Fixed by binding the atlas.
- **The pale line under the feet (world).** The hero's x-ray silhouette pass (`depthFunc GREATER`) also drew where the bottom of his quad is
  under the ground in front of his feet. The silhouette now skips anything below 0.75 px of height.
- **The dark box beside every unit (battle, Medium).** `hbShadow2D`'s cached gradient was centred on the sprite's right edge (a scaled
  transform), so each unit's shadow was half a blob with a hard vertical edge. Now a whole soft ellipse with a darker contact core.
- **Flat, evenly lit.** World characters had a light floor of 0.58 to 0.62 (`max(L, uAct)`), so in dungeons and at night they all sat at the
  same grey light whatever was around them; by day battle units on Medium were not tinted at all (`hbTint` returned the raw sprite when the
  ambient was near white) and never graded, and their tinted copies were 1x (the HD detail was lost).
- **Lights did not reach characters.** The world light map clipped at 1.0: the hero's own lantern (dungeons, caves, dark realms) filled it at
  his feet, so a torch next to him added nothing.

## World (hd2d.js, hd2dgl.js; Medium and High)
- **Scale.** Characters are drawn at `HD2D.spr.sc` = 2/3 of their 2D size: a hero's quad is 24x31 art px, the visible figure about 26 px,
  1.5 to 1.6 tiles (16 px). The GL view renders one pixel per art pixel, so a 2/3 billboard straight from the 2x HD bitmap would skip texels
  (shimmer, broken outlines). `hdSmall` builds, once per sprite canvas (WeakMap), a copy on the GL pixel grid: each pixel is exactly 3x3
  texels of the HD bitmap and takes the colour that covers most of that box (the sprite's own palette, no blends), except that a clearly
  darker colour (outline, eye, seam) wins when it covers a third of the box; coverage decides what is solid. Bottom aligned, so the feet keep
  their row. Drawn 1:1 with NEAREST: crisp. Heroes, townsfolk, wanderers, legends, elites, the Scourge or Echo and dungeon roamers all use it
  (`hdChar`); markers, pips and arrows above them follow the new height; tap boxes stay at least 16x22 px.
- **Lit like the scene** (their own program `char_f`, batches `HD.dynC` and `HD.dynCB`): the per vertex colour now carries the quad's side and height (only its alpha
  multiplies), the normal bytes carry the rim side, rim strength and the flip.
  - The light map is read at the feet, spread `HD2D.spr.spread` (9 px) to each side, so a lamp, torch, brazier, lava tile or crystal on one
    side lights that side; ambient by time of day, place and weather (the same `H2L` look as the ground), the sun or moon inside the baked sun
    shadow at the feet, brighter on the sun's side.
  - A little darker toward the feet (ambient occlusion over the lowest 40% of the figure), a touch of sky on top edges.
  - Raw sprite colours are softened before the light and the grade (`sat` 0.86, `con` 0.9): sprites are drawn more saturated and contrasty
    than the graded diorama; the scene's own grade (exposure, contrast, saturation, lift, gain) and distance fog then apply as to the ground.
  - Rim light: `hdRim` sums this frame's lights near the character (world copies of the light map discs, `HD.lw`) and the sun or moon into a
    side and strength; the shader lights silhouette texels whose neighbour toward that side is empty, in the key light's colour plus the light
    map's colour there.
  - Readability: instead of a grey floor, characters get at least `act` (0.3 outdoors at night, 0.34 in dungeons) added in the ambient's own
    hue; the rim keeps silhouettes apart from dark backgrounds.
  - The light map now stores half the light and is read x2 (headroom), and most of the hero's own lantern (80%) is left out on characters:
    it sits at his feet and washed him out at night. Torches next to him now light him (v058a: 1.15x or more).
- **Contact shadow** (`hdShadowC`, `hdBlob2`): an ellipse as wide as the body (0.8 of the quad), 0.55 as deep, with a darker core and a soft
  penumbra, nudged away from the light and stretched a little with its strength. Config `HD2D.spr.shadow`.
- The x-ray circle and the hero's silhouette through walls are unchanged (the silhouette uses the hero's new quad).

## Battle (hdstage.js; Medium 'under', High 'full')
- **High ('full')**, in the stage shader: unit colours are softened (`HD_SPR.sat`, `con`) before the light; each unit pixel finds its unit
  from the nearest feet (the shadow list) below it, which gives its height (ambient occlusion toward the feet, `HD_SPR.ao`) and side (the side
  facing the key light or a light is brighter); every light adds with that side bias; the two strongest lights put a rim on the edge facing
  them, the key light its own. Then the stage grade, as before.
- **Medium ('under')**, in 2D: `BV.tint` is now `hbLit`. Each unit's lighting state (`hbUnitLight`, recomputed every 250 ms) is the stage
  ambient, the theme lights near it (hall torches, braziers, lava glow, the boss rune light) and the strongest effect light (spells,
  orbs), with the side they come from and the rim side, quantised into one integer. A state change costs one pixel pass over the full HD
  bitmap (`hbLitBuild`: soften, light, darker feet, brighter facing side, rim, then the stage's grade with its soft shoulder), kept in a
  per canvas Map (at most 40 states); every other frame is a lookup. The lit copy keeps the 2x HD bitmap (the old tint copy was 1x).
  The unit being drawn is the one `spriteOf` was last asked for (a wrapper notes it), so `battle.js` is untouched.
- Element badges by the HP bars (battleui.js) are HUD: on the full stage they are drawn from a copy whose solid pixels carry alpha 254 (the
  HUD mark), so the GL lighting leaves them unlit. HP bars, pips and the primed marker keep the existing marking in `drawUnit`; damage
  numbers, tags, names and tap targets are DOM and unaffected. Note for the HUD second pass in `battle.js`: under `BV.glFull`, mark what
  it draws with `destination-out` at 1/255 (as the bars are) or draw from alpha 254 copies, so it stays unlit wherever it lands.

## Files
- `v3/hd2dgl.js`: the character program `char_f` (lighting, rim, silhouette cut), light map read x2, atlas cleared when it starts over.
- `v3/hd2d.js`: `hdSmall`, `hdRim`, `hdChar`, `hdShadowC`, `hdBlob2`, actors through `hdChar`, the atlas bound for blended passes, lights
  before actors, new uniforms, light map at half.
- `v3/hdstage.js`: full shader units, `hbUnitLight`, `hbLitBuild`, `hbLit`, the `spriteOf` and `elShapeCv` wrappers, the 2D shadow sprite.
- `v3/config.js`: `HD2D.spr` (world) and `HD_SPR` (battle).
- `v3/shell.html`: `__A.SC58` (tests).
- Tests: `tools/chrome/v058a.js`, `tools/chrome/v058perf.js`, `tools/chrome/v058shots.js` (PNG to `tools/chrome/shots-v058/`, not committed).

## Tests
`v058a.js` (Medium and High, then Low): HD-2D live; the hero's body luminance is higher by day than at night at the same spot; the hero quad
is 24 to 34 art px tall; no hard dark bar (a run of 8+ px under the feet darker than 0.3 of the ground beside them) in town and in the
dungeon (next to a torch and far from any light); the same dungeon spot is brighter with its torches than with them put out; the hero quad
is still the silhouette quad; Medium battle: lit sprites are built while warming up and none in the next 60 frames, a cave unit takes the
lava's warm light; High battle: HUD pixels (bars, pips, element badges) come out of GL unchanged, unit pixels are lit and graded; Low: 2D
world, 2D stage, no lit sprites; no console errors. The v0.5.7 build fails the day/night, torch, dark bar and cache checks.

## Frame rates
Headless Chromium, WebGL on SwiftShader (software), CPU throttled 4x, 390x844 at dpr 2. The machine was shared and noisy: compare rows of
the same table; before = the v0.5.7 build, interleaved.

Battle, Medium ('under'), `PWBASE=<v0.5.7> REPS=3 node v058perf.js` (auto battle, every 2D canvas CPU backed), best of 3:

| scene | before | after | lit sprites built during the 3 s window |
|---|---|---|---|
| field, rain | 51.3 (26% of frames over 20 ms) | 54.6 (16%) | 18 |
| cave (lava lights) | 57.1 (9%) | 55.8 (10%) | 15 |

World, `node v053perf.js`, two runs each, old and new interleaved (town at night | field in rain | dungeon):

| build | Medium | High |
|---|---|---|
| before, run 1 | 56.4, 58.2, 56.5 | 49.0, 53.6, 50.1 |
| after, run 1 | 54.4, 58.7, 58.6 | 49.8, 54.8, 50.1 |
| before, run 2 | 53.6, 60.6, 55.3 | 50.5, 56.4, 51.0 |
| after, run 2 | 58.7, 57.6, 47.8 | 50.5, 50.8, 47.2 |

A first version kept the character lighting as a branch inside the scene shader; on SwiftShader that cost about 8 fps in town and in
dungeons even though only characters take it (software GL pays for every fragment), so characters got their own program (`char_f`), drawn
from their own batch first; the scene program is back to its v0.5.7 cost. Rendering the GL world at 2 px per art px (so the HD sprites could
show more detail at the new scale) was measured too: about 20 fps on Medium, so it stays at 1 px per art px.

## Screenshots
`TAG=before PWHTML=<v0.5.7> node v058shots.js` and `TAG=after PWHTML=../../out/aurelis3.html node v058shots.js` write world (town day and
night by a lamp, field, a dungeon next to a wall torch, a cave) and battle (field by day and at night, cave, boss stage) shots on Medium and
High at 390x844 and 933x705 to `tools/chrome/shots-v058/` (not committed). The maps are generated per run, so before and after show the same
kind of scene, not the same tiles.

## Limits and next steps
- At 1 GL pixel per art pixel the world sprites are 24x31 px: faces read as a few pixels. A finer GL grid on fast GPUs (High) would let
  `hdSmall` keep more of the HD bitmap (`px` 2 gives 48x62); it is too slow on software GL today.
- Medium battle units are lit by spells only through the quantised state (5 steps), so a fast spell light steps rather than fades; the
  floor pools and halos under the units stay smooth.
- The world rim side comes from the strongest pull of the lights in view plus the sun, one side per character (no per pixel normal).
- `hdBlit` (frames drawn outside the game loop, tests only) copies the GL frame into the top left quarter of the 2x `#wcv` bitmap; tests read
  it 1:1 there. Play is unaffected (the loop never reads the GL canvas back).
