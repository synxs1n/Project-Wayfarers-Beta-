# Entrances as solid masses (`v3/worldart13.js`)

The owner, after the v0.19.5 pass: "do whatever is needed to make all entrances, dens, sanctums and lairs appear 3 dimensional like the tents used to."
One new module, last in `MODS`; the owners got only `HOOK.def` lines (`buildMapCanvas` in worldgfx.js, `hdBakeCards`, `hdBldKind`, `hdGateGeo` in hd2d.js,
`drawShrineFront` in sitelook10.js) and sanctlook10's raw wrap of `hdGateGeo` became a registered hook (it took every 'gate' part, these cards included).
`window.__WA13` (counters `n`, `err`, the switch `off` that gives the v0.19.5 look back, `api`) is the test hook. Test: `tools/chrome/v175a.js` (group `world`).
Look only: no tile, collision, save field, game number or random draw changes (v175a checks 150 fields against the pass switched off).

## What made the tents solid (v0.12.13, `drawTent` in worldgfx.js, `hdTentCone` in hd2d.js)

Recovered from the history (`git show 09978ff`): the tent of Last Ember and Wick's End was a cone with panels that converge on the pole, the left face lit
(`tint(col,.22)`) and the right in shade (`shade(col,.78)`), a darker hem sagging between pegs, guy ropes to pegs, a base shadow on the ground and a brighter
cap under the pennant; the pole and pennant stood on top of the cloth, not beside it. In HD-2D it stood as 18 slices round an ellipse on its footprint, each
slice textured from its own wedge of the sprite, so the lit face and the seams wrapped round. And because a tent is a building sprite (`m.bsp`, drawn in
`worldDraw`'s depth sort by its front edge), a walker north of its front edge was hidden behind it and one south of it stood in front. The entrances had the
lit rim and the props (worldart12) but were still one front face painted into the ground, with the hero always drawn over them.

## v0.20.1: front facing

The owner after 0.19.6: "just make all den, sanctum and dungeon entrances front facing for now". Every entrance now faces the camera squarely: the mass
rises straight up from its front (a top face along the upper edge, as wide as the front), with no side face and nothing added at the left or right. What
stays: the mass above its footprint, the lighter top face, the recessed mouth with worldart12's lit threshold, the cast shadow, the props, the realm's
materials, the depth sort in both renderers. Also fixed: the outline round the mass read the buffer it was writing, so it spread right and down from the
first outline pixel and filled the box beside every mass with a dark slab (in 0.19.6 that slab sat behind the side face and made it look heavier).
The sections below describe 0.19.6; where they differ, this is the current state:

- **Volume** (`wa13Faces`): each silhouette pixel is copied N steps along (0,-1). The result is W x (H+N), with the front at (fx, N). fx centres the
  front's opaque box in the canvas (at most 1 px on the current sprites: the orchard lair's tree, the observatory's telescope). The top face takes the
  lightest of the first four pixels down from the edge (past the outline, which the 0.19.9 outline rule tints with the material, onto the cap), averaged
  along the edge and pulled 30% toward white; its back row is 10% darker. Stats: `topL`, `frontL` (the front's first N rows under its outline), `fx`, `fy`.
- **Mouth** (`wa13Recess`): the lintel and both jambs inside are darkened the same way. The lit right jamb of the three quarter light is gone.
- **Sizes**: den 64 x 55 (was 78 x 55), lair 64 x 67 (was 78 x 67), Sanctum inner door 24 x 25 (was 30 x 25), Rift gate face card = panel width,
  panel height + 3.
- **HD-2D footprint** (`wa13Prof`): one 1 x 2 entry in `S.bh` per tile column the front covers (ex-2..ex+2). Its height is the front's over that column,
  less 9 px (the top face is depth, not height). The old 3 x 2 box at sh-9 cast a square slab of shadow beside a round mouth. light13's 2D masks still use
  the 3 x 2 box.
- **Shrine (2D)**: its parts get top faces only, placed through `fx/fy`. HD-2D is unchanged (slSaGeo boxes).

v175a numbers now (34 den mouths and lair fronts): 38 to 67 px tall. The top face is 1.10x to 2.22x as light as the front under it. Left and right
margins differ by at most 1 px. 0 of 15261 added pixels lie off the straight-up extrusion (no side face). The hero one tile behind a den is 18% covered
in 2D and 65% in HD-2D. On 150 fields, 380 entrances block nothing. HD footprint of the thistle den: 20, 28, 29, 28, 20 px across five columns.

## The recipe, applied to every entrance (v0.19.6)

- **Volume** (`wa13Faces`): the finished front sprite is extruded up and to the right (a three quarter view). Every pixel of its silhouette (alpha over 180) is
  copied N steps (7 for a field entrance, 5 and 4 for the shrine's parts, 3 for a door or gate) along (+1,-1); what stays visible round the front is a top face
  along its upper edge and a side face along its right edge. The top face takes the tone of the sprite there (the first pixel inward that is not the outline,
  averaged with its two neighbours along the edge) pulled 30% toward white; the side face takes it at 52% with a cool lift in blue; a 1 px outline goes round
  the whole mass. So the realm's material survives: ice stays ice, roots stay roots, sandstone stays sandstone, basalt stays basalt. `ext` holds only the added
  faces (transparent under the front) for callers that already draw the front.
- **Mouth** (`wa13Recess`): the opening found by worldart12's flood fill is a recess: its lintel row and left jamb inside are darkened (set back into the mass),
  its right jamb inside catches the realm's light, and the stone right over it carries the lintel's shadow. worldart12's threshold stone and the two props at
  the foot stay, standing on the mass's front.
- **Cast shadow** (`wa13Cast`, a `drawTile` hook): a wedge of shadow on the ground to the lower right of each mass (the light is upper left), painted into the
  ground tiles, so the 2D view and the HD-2D ground bake both have it; never on water or solid tiles.
- **Depth** (`wa13Bsp`, a `buildMapCanvas` hook): each field entrance (den mouth, lair front, Sanctum shrine) is a building sprite in `m.bsp` on a 5 x 2
  footprint whose front edge is the E tile's row. `worldDraw` sorts it like a house: a hero north of the E row is drawn behind it, one on or south of it in
  front. The base canvas keeps its copy (same pixels), so nothing moves.

| entrance | 2D | HD-2D |
|---|---|---|
| den mouth (`SL_DEN`, 17 realms) | the 64 x 48 sprite becomes 78 x 55 with faces and a recessed mouth, in `m.bsp` | a card at the footprint's front edge in the buildings pass (`hdGateGeo` hook), lit like a building front, x-ray never thins it, a 3 x 2 footprint in the sun shadow heightfield (`S.bh`) |
| lair front (`SL_LD`, 17 kits) | 64 x 60 becomes 78 x 67, the same | the same card; with a mound (dungeon8) the hill geometry stays under it |
| Sanctum shrine (field) | its parts (shrine block, guardians, wings, torii posts and lintel) get faces laid under them (`drawShrineFront` hook), the whole front in `m.bsp` | geometry as before (`slSaGeo`: boxes with top and side tones) |
| Sanctum inner door (the hall's E tile) | a 30 x 25 stone doorway with faces, an actor in the depth sort (`townDecorActors` hook) | a billboard on the tile's front edge (`hdActors` hook) |
| Echo Rift gates | faces laid under each panel (`drawPortal` hook, from an offscreen draw of the panel's silhouette) | the faces as a card just behind the panel (`hdActors` hook) |

The HD-2D card strip (`hdBakeCards`) is told the den and lair E tiles are 'U' while it bakes, so their fronts are not stood twice and the 67 px lair fronts
are not clipped to the strip's 58 px.

## Numbers (v175a on the HEAD build)
- 34 den mouths and lair fronts: 38 to 67 px tall (2.4 to 4.2 tiles; the old sprites 30 and 60), top face 3.2x to 5.5x as light as the side face, the mouth's
  darkest column inside the mass.
- the shrine's building sprite 42 px tall (2.6 tiles).
- cast shadow: the ground tile right of a den is 4 luminance units darker with the pass than without (the tile left of it unchanged), the shrine's 9.
- a hero one tile behind a den (the row north of its 3 x 2 footprint): 16% of his box changes when the sprite leaves the depth sort in 2D (0% in front).
- 150 fields: 380 entrances, none blocks its own door tile or its way out, mapIssues 0 with and without the pass.

## Known limits
- The lair with a mound (dungeon8) has solid rock behind its door, so nobody can stand "one tile behind" it; the depth sort still applies to the tiles beside it.
- The Sanctum inner door is 25 px (1.6 tiles): a 2.2 tile doorway would stand above the hall's 22 px walls.
- The Rift gate faces in HD-2D are a second card 0.4 px behind the panel (the panel's own 16 x 20 card is cut by hd2d.js and cannot grow without editing it).
- `m.bsp` of a field holds every building sprite twice on arrival (before this pass too, see the report); the entrance sprites are added once per build.
