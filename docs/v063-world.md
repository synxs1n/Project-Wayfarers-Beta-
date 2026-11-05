# v0.6.3 world pass

Six reports from the owner (Galaxy Z Fold, open 933x705 and folded 390x844, Medium graphics, HD-2D world on), all in the world
renderers, the map and the naming. The version number and the changelog are not touched here (the merge does that).

Files: `v3/worldfx.js` (new, before `qready.js`), `v3/hd2d.js`, `v3/worldrt.js`, `v3/gfx6world.js`, `v3/daylight.js`, `v3/map.js`,
`v3/sites.js` (one name), `v3/config.js` (`WFX`, `WMAP`, above `HD2D`), `v3/shell.html` (one `__A.W63` test line),
`v3build.py`. Tests: `tools/chrome/v063wa.js`; screenshots: `tools/chrome/v063wshots.js` (to `tools/chrome/shots-v063w/`, ignored).

No save key, slot or db schema changes, and no new save fields. The Daily Trial is untouched.

## 1. Flat assets in HD-2D: the fortress gatehouse
The gatehouse of a fortress in a field was painted into the field's ground art (`sites.js`, `buildMapCanvas` wrapper), and the field's
`drawObjects` pass drew a cave mouth on its `E` tile, so in HD-2D a white rock arch stood upright in front of a flat grey painting.
- `hdBake` bakes the ground with `m.fortAt` cleared (no paint), `hdBakeCards` bakes the prop cards with the gate tile read as `U`
  (no cave mouth card).
- `hdBakeBuildings` gets a `gatehouse` part (`hdGatePart`) over the 3 x 2 footprint, built by `hdGateGeo` like the keeps: two towers
  (front with arrow slit and red banner, sides, a stone top, merlons front, back and sides) and a curtain wall set 6 px back with the
  gate arch and portcullis, from a small code drawn sheet (`hdGateTex`, 96 x 48). It is in the sun shadow height field and in the tap
  height field (`S.bh`), lit like the buildings, thinned by the x-ray circle.
- The 2D view keeps its flat painting (characters always draw in front of it there, as before).
- Checked on every map kind with `v063wshots.js ents` and `kinds`: dungeon entrances in every 2.5 style, cave mouths, waystones, signs,
  quest boards, wells and standing stones are already upright cards in HD-2D (they come from `drawObjects`); only the gatehouse was paint.

## 2. Ambience that slid with the camera
Everything that drifts (relit field sparkles, snow on snowy maps, wind streaks in the heights, butterflies in meadows, sea spray,
void motes, dungeon dust, festival sky lanterns, Phase 6 leaves and dust, the passing flock and its shadows, dusk fireflies and
swallows, dawn dew) was drawn at screen positions, so walking carried it along. In HD-2D it sat on the 2D canvas over the GL frame.
- `worldfx.js`: every particle has a world position (x, z, height in art px): a base point on a lattice of cells about one view in size
  (`WFX.cell`, `WFX.margin`), plus its own motion, wrapped to the copy nearest the camera (`wfxRun`, `wfxBirds`). The same particles in
  both renderers. Counts are per view area (`WFX.n`, `WFX.ref`), so the density matches the old screen.
- 2D (`worldrt.js`, `gfx6world.js`, `daylight.js`): drawn at `(x - cam.x, z - h - cam.y)` (`wfxDraw2D`, `wfxBirds2D`).
- HD-2D (`hdWfx`): small upright quads in the blended dynamic batch, depth tested (walls and roofs hide them), glowing ones unlit,
  leaves and butterflies lit by the scene; birds get a soft shadow decal.
- Weather (`weatherFX`) and the realm theme layers (`themeFX`: drips, embers, spores...) stay full screen effects but scroll with the
  world: drawn once into a view sized layer and laid as four tiles offset by the camera (`wfxTiled`; HD-2D uses the screen motion of the
  ground at the focus, `hdOvOffset`). `weatherFX` itself is unchanged (battles share it).
- Reduced motion: a still frame, as before. Water glints, swaying grass and critters are still not drawn in HD-2D (as in v0.5.6).

## 3. Things stuck on the screen, over the hero's face
- Found: above Low the world canvas holds a 2x bitmap (`sprhd2.js ssCanvas`), and the HD-2D overlay reset the transform to 1 before
  clearing and drawing. It cleared only the top left quarter of the bitmap and drew the weather, fades and the battle flash into that
  quarter only. Whatever an earlier 2D frame had left in the other three quarters (a frame drawn before HD-2D came on, after a battle,
  after toggling the setting) stayed on screen over the GL view. The overlay now clears the whole bitmap and draws at the canvas scale in
  the game loop (frames composed for tests keep their logical layout), and leaves the canvas in its own scale for the 2D renderer.
- The meadow butterflies (white, yellow, pink) were screen locked rows: one could sit on the hero's face for as long as the camera did.
  No ambience particle is drawn over the hero now: 2D skips any particle inside his box (`WFX.hero`), HD-2D any whose projected position
  falls in his screen box. Townsfolk gesture bubbles (2D) skip too. The dungeon's way out arrow is hidden while the hero stands next to the
  stairs (it floated over his body in HD-2D).

## 4. Opened chests vanish
- `objCanvas(...,'chestOpen')` returns an empty canvas (both renderers: the 2D base and the HD-2D prop cards), and `solidAt` lets the
  party walk over an opened chest (unless someone stands there). The ground under every chest is painted like the ground around it
  (`floorLike`), so nothing odd shows where it stood.
- `G.chests` keeps the opened state as before: quests, vaults, the Beacon Key, `chestsLeft`, mimics (`dropChest`) all read it unchanged.
  `tileAt` still returns `c` for an opened chest.
- Minimap: opened chests (`chestopen`, `vaultopen`, `keyopen`) are left out. Full map: shown at 45% opacity. `WFX.chestGone` switches
  the whole thing off.

## 5. The world map
`map.js drawWorldMap` (the layout from `worldGraph` is unchanged) now draws an illustrated chart, all in code and cached:
parchment with grain, stains, a double border and a burnt edge, a compass rose; a soft wash of each realm's land colour; each place as a
vignette in its realm's colours (`wmVignette`: towns as clusters of roofs inside a wall, fields as countryside with trees, hills or
peaks, palms and water, a road running through; dungeons as dark towers that carry a gold beacon once relit; caves as rock arches;
fortresses as gatehouses with red banners; a green tick on looted caves and fortresses); roads between the gates as dashed paths, red with
a crossed seal past a sealed gate, fainter toward unvisited places; unvisited places under clouds with a "?"; a red pin for the party.
Names are written under places when a place is at least `WMAP.names` px; otherwise (most phones) a tap on a place shows its name
(`ACT.wmTap`, the canvas has its own `data-act`, so a tap no longer closes the map; tapping outside the chart still does). Short
landscape screens get smaller places so the whole chart fits (`WMAP.cell[2]`). Sharp on high density screens (canvas at up to 2x).
The legend is drawn with the same sprites. State: `WMS` (not saved).

## 6. Naming
Player facing "Side fortress" is now "Fortress" (`MAPICO_NAME.fort`, the map legend and the world map legend); "Fortress" was already
used elsewhere. Ids (`o1`..`o4`, `kind:'fort'`) and save keys (`G.fortWon`, `G.miniDone`) are unchanged.

## Tests
`tools/chrome/v063wa.js` (24 checks). On v0.6.2 (`git show HEAD:index.html`, before this branch) 18 fail and 6 pass (the console error
checks and the landscape height check); now all pass:
- 2D (Low): the same moment drawn with the camera in two places, particle rects move with the camera (v0.6.2: all stayed on the glass);
  150 frames in a relit meadow field, no particle over the hero (v0.6.2: 57 of 3397).
- Chest: the ground where an opened chest stood equals bare ground; opened, saved, walkable; minimap has no marker; full map dims it.
- HD-2D (Medium, 933x705): no ambience drawn on the 2D canvas, particles in the GL scene, a particle's world position does not depend on
  the camera; a stale magenta frame on the world canvas is fully cleared (v0.6.2: 3 of 4 quarters kept it); rain covers all four
  quarters (v0.6.2: one); the gatehouse bake has geometry and no flat banner paint.
- World map, portrait and landscape: parchment, fits the width (landscape: the height too), legend entries, a tap shows a name and keeps
  the map open; "Fortress" and no "side fortress" on screen.

`tools/chrome/v053a.js`: `state()` now draws one frame before it reads the GL canvas size (it read it right after a layout change, before
the first frame had followed it, and failed 5 checks at HEAD on CSS height 560 vs 536).

Rerun: v053a, v056a, v062a, v059a, wide, v051c, v050p1b, v050p1f, v050p2world pass. v050p1c with 12 seeds passes every path check (its
"dungeons scanned >= 500" line needs the default 110 seeds). v050p5b (3 menu save note checks) and v050p5c (heat and starfall dawn to day
blend) fail the same way at HEAD: menus and time of day, outside this pass.

## Known limits
- Tall props are still single cards (as in v0.5.6); only the gatehouse became a box.
- Particles are drawn in the blended pass without writing depth: walls, buildings, props and characters in front of them hide them, but two particles do not sort against each other (they are a pixel or two, it does not show).
  behind them; a particle in front of a card shows in front).
- The weather layer is a screen effect that scrolls with the ground at the focus: far ground in HD-2D moves less than the rain does.
