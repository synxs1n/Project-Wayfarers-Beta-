# v0.8.0 weather and title pass

The owner's two reports:
1. "Fog seems a bit off out of battle, and in battle there are these boxes of clarity around characters that just don't make sense,
   check for issues like this with all weathers."
2. "Window main menu cuts off the 6th wayfarer around the campfire, I also preferred the way the main menu screen was before with 6
   heroes moving and the worlds changing behind them."

Visual only: no save key, slot, db schema or game state change. No weather or title visual reads or calls the game RNG (particles come
from a hash of their index and the time, bank sprites from weather7.js's own seeded `mulberry(7707)`, the title's realm order from the
clock); the Daily Trial is untouched (`v050p2daily.js`). GAME_VERSION and the changelog are not touched here.

Files: `v3/weather7.js`, `v3/hd2d.js`, `v3/hdstage.js`, `v3/config.js` (`WX7.face`, `WX7.fogPar`, `HD2D.weather.*.fogN`),
`v3/title7.js` (scene rewritten). Tests: `tools/chrome/v080wa.js`, `tools/chrome/v080wt.js` (new), `v077wa.js` and `v071t.js` (updated
for the intended changes). Screenshots: `tools/chrome/v080wshots.js <prefix> [tiers] [groups]` writes `tools/chrome/shots-v080w/`
(ignored by git; `before_*` from the v0.8.0 build before this pass, `after_*` from this one).

## The boxes of clarity: root cause
Three things drew hard edged rectangles in the weather, all of them most visible where the units stand:

1. **The bank sprite had straight edges** (all tiers above Low, world 2D, HD-2D world, battle). `w7Bank` stamped 44 soft puffs into a
   192 x 80 canvas, but a puff's radius (up to 40 px, stretched 1.35 or 2.2 times sideways) was not kept inside the canvas, so the
   heap was cut by the canvas border: every fog, blizzard gust and dust bank was a soft cloud inside a hard rectangle. In battle the
   back and near bank layers sit exactly on the band where the units stand, so the rectangles framed the units ("boxes of clarity":
   the inside of a box was clearer than the next bank's edge beside it). Measured on the Medium stage, the alpha of the weather layer
   alone (no units drawn) showed the boxes; drawing the units changed no weather pixel.
   Fix: puffs are clamped inside the sprite and the heap is multiplied by a feathered elliptical mask (alpha 0 well before every edge).
   One sprite feeds the 2D banks, the HD-2D billboards and the battle stage, so all of them are fixed at once.
2. **High battle stage: weather lit as unit pixels inside a hard column above every unit.** The weather is drawn on the unit layer,
   and the composite shader (`hbMainFS`) shaded every non transparent pixel of that layer as a unit: it searched the nearest shadow
   below within `|x - S.x| < S.z * 1.35` (a hard edged column) and applied ambient occlusion (down to 0.74), side light and rim light.
   Translucent fog, rain and snow inside each column came out darker or rim lit, a box per unit. Fix: only opaque pixels (sprites,
   `smoothstep(.55, .92, alpha)`) take the per unit shading, which also fades out toward the column's sides and below the feet; rim
   lights need opaque pixels too (fog banks no longer get a rim along every pixel).
3. **"Nothing over the hero" was a rectangle** (world 2D, the HD-2D overlay, the HD-2D GL scene). Every particle whose box touched
   the hero's padded box was skipped, every GL quad whose centre projected into his screen box was dropped, puddles and decals under
   him were dropped, and the heat shimmer skipped every row (the full width) at his height. In dense rain, snow or ash that left a clear
   box that followed him; fog banks faded to nothing by their centre's distance to him (a quarter of the view), a clear bubble.
   Fix: a feathered ellipse around his face (`WX7.face`: centre 0.28 of his box from the top, radii 0.85 and 0.4 of the box, nothing
   drawn inside the squared distance 0.22, then a smoothstep to full at the rim). Particles over his body and legs stay (he stands in
   the weather like the ground around him). Ground items (puddles, ripples, splashes, settling flakes) fade by a feathered ellipse
   around his whole body instead of popping. A near fog bank in front of him thins to `WX7.face.bank` (40 %) of its alpha where it
   covers his face, smoothly, and banks behind him are left alone (his sprite hides them). The shimmer keeps his columns still and still
   shifts the rest of the row. GL quads go through `hdFaceK` (hd2d.js), the same ellipse in screen space, for weather and ambience.

## Per weather
| weather | what was off | now |
|---|---|---|
| fog | hard bank rectangles (2D, HD-2D, battle); 2D banks slid with the falling particles' strong parallax (far 0.82, near 1.35) although fog lies on the ground; a 2D near bank layer on the HD-2D overlay slid over the 3D ground (screen locked); a clear bubble around the hero; a grey haze at night (the same light grey tint by day and night, the colour switched at a hard threshold); HD-2D distance fog only started at 1.15 camera distances, so the field near the hero had none and then it ramped in | feathered banks; ground banks with `WX7.fogPar` [0.96, 1, 1.05]; no 2D near banks on the HD-2D overlay (the lit GL banks and the distance fog do it, only a faint even veil); banks sit lower (bottom 2 px under the ground, the feathered edge meets it, no seam) and denser in front; colour and density follow the time of day smoothly (darker, 30 % thinner by night); HD-2D: `fogN` 0.3, the distance fog starts at 0.3 of the usual distance and thickens smoothly with distance; a weather's fog colour takes the scene's light by night (`hdLook`), so it never glows grey over a night field |
| blizzard | gust banks with hard rectangles; colour switched day/night at a threshold | feathered; colour blended; distance fog `fogN` 0.55 |
| sand | dust banks with hard rectangles | feathered; `fogN` 0.65 |
| rain, storm | a clear box around the hero (2D, overlay, GL); puddles and ripples vanished in a box under him; night colours switched at a threshold; in battle the wet floor started with a hard line at the horizon and three hard 1 px sheen lines crossed the stage | face ellipse, puddles fade under him (splash droplets also test the face); colours blend smoothly from day to night; the wet floor fades in, the sheen lines are soft 3 px bands |
| snow | clear box around the hero; settling flakes popped under him; colour threshold | face ellipse; settle fades; blended colours |
| ashfall | clear box around the hero | face ellipse (embers stay additive, few) |
| gale | clear box around the hero | face ellipse |
| heat | the shimmer skipped full rows at the hero's height (a still band across the view); in battle the warm gradient started with a hard line across the stage 40 px above the floor | his columns stay still, the rest of the row shimmers; the battle gradient fades in |
| aurora, starfall, meteor | ribbons, stars and meteor trails were cut in a box around the hero | face ellipse (meteors fade by the head and the middle of the trail) |
| surges | a 2 px rectangle stroked around the view; in the world the layer scrolls with the ground, so the rectangle slid across the map | a soft glow along the view's edges (`surgeGlow`, world3.js), drawn in screen space in the world (weather7.js) |
| bloodmoon, eclipse | (v0.4.0 art kept, the blood moon is a 10 px pixel square on purpose) | unchanged, checked for errors in every tier |
| all, High battle | weather lit as unit pixels in hard columns | only opaque sprite pixels get the unit lighting |

Indoors (dungeons, caves, fortresses, the Sanctum, the Archive) draws no weather, as before (`w7World` and `w7Gl` only run on fields
and towns). Low keeps its cheap look (the old radial fog puffs had no hard edge; the face ellipse applies there too).

## The title: six wayfarers on the road (`v3/title7.js`)
- **Party**: six heroes from the title lineup (starters plus legacy heroes), drawn from the real 2x HD bitmap at one whole scale,
  nearest neighbour. They walk to the right in a staggered file (back and front rows alternate, the back row a little higher), the
  rightmost is the lead. Each has a two frame walk cycle (the stand and walk bitmaps of `heroCanvas`, 210 ms a step, phases spread),
  a one pixel bob on the passing step and a slow sway in the file. A new lineup every 36 s (cross fade, never during a realm change).
- **Realms** (`T7R`): fields by day, a misty forest at dawn, snow under an overcast sky, the desert at noon with mesas, volcanic lands
  by night (a glowing crater, lava cracks), the coast at sunset (sea glints, palms), a town at dusk (lit windows, lanterns on the road),
  the heights at night (stars, a soft aurora, a crescent moon). Each visit lasts 8 to 12 s and cross fades (1.8 s) into the next; the
  order is shuffled from the clock at load and always starts in the fields. Weather per visit from the realm's list: rain (fields,
  coast, town), fog (forest), snow (snow), sand (desert), ash and embers (volcanic).
- **Parallax**: sky and sun fixed, far ridges and clouds at 0.06 of the travel, the mid layer (hills and trees, pines, dunes and mesas,
  crags, the sea, the town, peaks) at 0.25, the road and its props at 1, the blurred front grass at 1.5. Every strip is one stage
  width and tiles (periodic shapes, wrapped props; blurred strips are blurred as three copies so the seam stays sharp).
- **Light**: the heroes are relit per realm (a lit copy per hero, frame and realm, built once): the realm's ambient, the key light
  on the side it comes from with a rim on that edge, a sky rim on the top edge, soft contact shadows. Grade on top: vignette, a darker
  band for the wordmark, a fade at the bottom.
- **Fit**: the scale is the largest whole scale at which the six (their own widths plus gaps) fit 94 % of the stage width and the
  space between the wordmark and the ground, capped so a hero is about 30 % of the stage height. All six are always drawn (v0.7.1
  dropped heroes when they did not fit: at 1280 x 720 it drew 5, the 6th was cut). The menu stays below the scene (portrait) or in its
  column (landscape); the wordmark, Continue first when saves exist and the grouped menu are unchanged.
- **Cost**: each realm is baked once per stage size (8 to 21 ms, the next realm is baked ahead between transitions, at most 4 kept);
  a frame is about 8 drawImage calls plus 6 to 12 sprites and up to 70 particles: 0.3 to 0.7 ms at 1280 x 720 (headless, software
  canvas), 1.3 ms average with realm changes every 1.5 s (`v080wt.js`), 30 fps cap as before.
- **Crest**: the emblem (`WF_LOGO.emblem`, the compass badge of the app icon) stands beside the wordmark as the game's crest (a
  fifth of the title block, 66 px on a phone, 114 px on a desktop window), SVG so it is crisp at any size; the block keeps its place
  under the top edge and above the party at every window size (`v080wt.js` checks it is whole and clear of the heroes, the menu and
  the wordmark).
- **Low and reduced motion**: one still frame (the party standing in the fields, no particles), Low at 1x with no blur filters.
- Test hooks (`window.__A.T7`): `drawn` (bitmap, scale and boxes per hero), `faces`, `bodies` (page px), `stageR`, `realm`, `rN`
  (realm changes), `frames`, `fms` (average frame ms), `bakeMs`, `still`, `cfg` (timings, tests shorten them).

## Tests
- `v080wa.js` (all pass; `SECT=1234`, `TIERS`, `WXS` pick parts): battle Medium and High, every weather plus a rare sky and a surge:
  the longest straight hard edge in the weather layer (vertical runs under 28 px at 2x, horizontal under 80 px, full width bands
  excepted; v0.7.7: blizzard 69, fog 55, sand 57, surge 292, now 10 to 21), the mean step in weather coverage across every unit box
  edge (under 8/255), and on High a uniform translucent veil on the unit layer comes out the same inside and outside each unit's
  lighting column (v0.7.7: a 16.6 step, now 0.6); world 2D: no hard edge, nothing on the face, particles do reach his body box (no
  cut out); HD-2D fog is there at the hero (0.28 of full strength, v0.7.7: none before 1.15 camera distances) and rises monotonically
  with distance (largest step 0.01 per 10 px); every weather (12 base, the rare skies, all six surges) by day and night in the world
  (Low 2D, Medium and High in 2D and HD-2D) and in battle (Low, Medium, High) with no page, console or weather errors.
- `v080wt.js` (all pass): at 800x600, 1024x768, 1280x720, 1920x1080 (desktop, 1x) and 390x844, 844x390, 933x705 (phone, 2x), with and
  without a save: six heroes, each whole inside the visible scene, at a whole scale of the 2x bitmap, none under the menu, the
  wordmark or the Beta label, none hiding another; the crest present and whole beside the wordmark; the party walks and the scene
  moves; the realm changes over time (several in a row); six through a realm change; frame cost under 2 ms; Low and reduced motion still.
- Updated for the intended changes: `v077wa.js` (nothing on the hero's face instead of nothing in his box: the face ellipse from
  `W7.stats.face`, GL quads by `hdFaceK`), `v071t.js` (six heroes, the wordmark selector `.t7wm svg`, wording).
- Rerun and passing: v077wa, v077wb (PWBASE = HEAD's index.html), v063wo, v062a, v053a, v053b, v071t, v058a, v063ba, v050p2daily
  (OLDHTML = HEAD's index.html: the Daily Trial is identical), liveupdate.

## Frame rates
`v077wb.js` (CPU 4x, 390x844 at 2x, best of 2, before = HEAD): Low within 0.3 fps everywhere (battle rain 52.6 to 56); Medium field
rain 44 to 45, storm 45.1 to 52.4, snow 47.4 to 54.3, blizzard 36.4 to 52.6, fog 41 to 49.8 (fewer near banks and no 2D bank layer
over the HD-2D overlay), battle rain 52.2 to 53.7. `v053bperf.js` (battle on auto in rain, best of 3): portrait Low 54.7 / 55.3, Medium
55.8 / 56.7; landscape Low 56 / 56.3, Medium 56.6 / 56.1 (a first run of best of 2 read 54.3 / 46.9 portrait Medium, noise on the shared
machine; the rerun is above). High battle on SwiftShader stays at 2 to 4 fps as before.

## Limits
- The 2D world weather is still drawn over the hero sprite (2D has no depth); the face ellipse keeps his face clear, his body is in
  the weather. In HD-2D the depth test hides what is behind him.
- Bank billboards in HD-2D still cut straight where they pass through a wall or tree (no soft particles); the feathered sprite keeps
  the cut faint.
- The title scene is 2D canvas (cheap on every tier), not the WebGL renderer.

## v0.8.9 follow up: heroes sized like the overworld
The owner, on a phone: "Title screen sprites look off, should be sized more like overworld in game." The v0.8.0 party used the battle
sprite's 2x HD bitmap at the largest whole scale that fit (a hero was about 30 % of the scene high, each pixel 4 to 5 device pixels on
a phone), blocky and unlike the heroes in the world; the night realms' ground was a flat dark band at phone size.
- Sprites: the overworld walker (`walkerCanvas`, side view, its two walk frames), shrunk to the world's own sprite grid exactly as the
  HD-2D world does it (`hdSmall` at `HD2D.spr.sc`, 2/3: about 24 x 31 texels, each the dominant colour of its 3 x 3 pixels of the HD
  bitmap), then drawn at a whole number of device pixels per texel with smoothing off. Same proportions and pixel density as in the
  world, crisp. Rim light one texel wide.
- Size: a hero is about an eighth of the scene high (`T7.cfg.heroFrac` 8; 12 to 14 % at the listed sizes), still the largest whole
  scale that fits the width and the room under the wordmark. The file is tighter (4 texel gaps), the horizon at 0.58 and the road at
  0.86 of the scene, the travel speed about three quarters of a hero's height a second.
- Ground: every prop and detail on the ground is sized from the heroes' height: a hazy band of small props toward the horizon, the far
  side of the road, and a front band of low props only (bushes, rocks, mounds, hedges: nothing in front of the party reaches up over
  it); tufts and stones lit from the realm's key side, soft lighter and darker patches, a lit far edge on the road, pebbles and ruts,
  and by night the sky's glow toward the horizon and front grass that is no longer black. The town's far band is hedges (fewer lamps).
  Props are drawn from their own seed on both sides of a wrap (identical at the tile seam).
- Tests: `v080wt.js` checks the overworld sprite grid at a whole scale and the height (7.5 to 19 % of the scene); `v071t.js` the same
  sprite rule.

