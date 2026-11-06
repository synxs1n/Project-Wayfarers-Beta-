# v0.8.2 themed dungeons and the boss lair

Two reports from the owner: "Dungeon design should match the battle backgrounds better, ice cavern should look like that instead of a
regular dungeon layout etc." and "We also need a clearer indication of what is the boss's lair in the overworld, as they currently look a
bit like regular cave entrances." The version number and the changelog are not touched here (the merge does that).

Files: `v3/dungeon8.js` (new, right after `pathguard.js` in `v3build.py`), `v3/worldrt.js` (two lines: the dungeon dark tint and hero glow
read the material, light holes off the view are skipped), `v3build.py`. Tests: `tools/chrome/v082da.js` (map data), `tools/chrome/v082db.js`
(drawing, lair, saves), `tools/chrome/v082dperf.js` (frame rate against the build before); screenshots `tools/chrome/v082dshots.js` (to
`tools/chrome/shots-v082d/`, ignored by git).

No save key, slot or db schema change, no new save field. Generation is untouched: everything new uses its own seeded generator
(`hashS` of the journey seed and the map id) and runs after a map is built; the game RNG is never read. The Daily Trial is unchanged
(nothing here runs there; `v050p2daily` passes against the build before).

## 1. Each place in its battle backdrop's material

Battles in a dungeon are fought on the `d_<theme>` hall, in caves on the `c_<theme>` cavern, against bosses on `boss_<theme>`
(`battle.js`, `p2world.js`, `hdstage.js`), all painted from `DTHEME[theme]`. The map was the same brick rooms in every realm. Now every
main dungeon, side cave and fortress has a material (`D8M`), chosen by realm (`D8_REALM`), by zone theme for the six old zones (`D8_ZONE`)
and by tileset for side caves (`D8_CAVE`); fortresses are keeps:

| realm (dungeon) | material | layout |
|---|---|---|
| Glacier Teeth (The Frozen Choir), old Frostmere | ice cavern: icy rock walls with icicles, crystal clusters at the foot, frozen floor with cracks and frost, frozen pools, cold blue light | organic |
| Rimewatch Tundra (Rimewatch Vault) | ice vault: ice brick with icicles and frost, crystal pillars | built |
| Cinderhollow Deeps (The Deep Smelter), The Ashen Expanse (The Cinder Throne) | volcanic cavern: basalt, glowing cracks, lava pools that light the room, ember vents, ash | organic |
| Ironroot Mines (The Ironroot Foundry), old Emberdeep Forge | basalt forge: dark masonry, forge grates, lava channels | built |
| Gullreach Strand (Gullreach Sea Caves), old Drowned Grotto | sea cave: wet rock, barnacles and weed, coral, puddles and tide pools, dripping light | organic |
| Mirefen Marsh (The Sunken Abbey), Willowmere Lakes (The Drowned Mill), The Drowned Crown | flooded halls: wet mossy masonry, water stains, murky pools | built |
| Glowroot Grottos (The Glowroot Heart) | root cavern: hanging roots, moss, glowing fungi on walls and floor, giant mushrooms, bog pools | organic |
| Thistlewold Downs (Barrow), Amberglade Orchards (Cellars), old Verdane Barrow | crypt: masonry, skull niches, green banners, bones, tombs | built |
| Sunspire Mesa (The Sunspire) | sandstone: carved glyph bands, sand drifts against the walls, obelisks | built |
| Galecrest Peaks, The Shattered Sky, old Storm Spire | keep: masonry, red banners, brazier pillars, inlaid floor | built |
| The Starless Wastes (The Hollow Observatory), old Hollow Star | astral halls: glowing runes, star specks | built |
| side caves | root (meadow), sea (coast), volcanic (cave), ice (snow), mountain rock with crystals (heights), astral (void) | organic |
| fortresses | keep | built |

What the material changes, in both renderers:
- 2D: `drawDTile` (wall faces, wall tops, floor, liquids, rubble, rune circle, stairs) is replaced by `d8Tile` for themed maps; the decor
  props `P` (and `g` in crypts) are drawn in the material (`d8Prop`, at least 23 px tall like before, so `PG_PROP_H` and `pgHides` still
  hold); the dark tint and the hero's glow follow the material (`m.d8dark`, `m.d8hero`, read in `worldrt.js`).
- HD-2D: the block faces and tops (`hdStructCanvas`) are repainted with the same art; decorated faces are variants 2 and 3, which are the
  tiles `d8tv(x,y)` decorates in 2D, so a crystal, a fungus or a banner is on the same wall in both views; liquids sink like water and lava
  glows (`hdKind`); every light (crystals, fungi, lava, runes, torches in built places) is on the map's light list, so both renderers light
  from it.
- The palette is the material leaning a fifth of the way toward the realm and boss look (`d8Var`, a `DTHEME` entry `<thv>%<mat>`), so each
  realm still has its own tint. `applyBossTheme` is wrapped so the look survives the overlay lifting.
- Battles started there (`startBattle` notes `spec.d8`) use the same material: `battleTheme` returns `d_d8<mat>` for built places and
  `c_d8<mat>` (the cavern stage) for organic ones, `boss_d8<mat>` for the boss. The keys are the existing backdrops of the realm's theme
  painted with the material palette (`DTHEME['d8<mat>']`), plus a few material touches (icicles, a lava glow on the horizon, pools, roots
  and fungi, sand drifts, banners). The HD-2D stage reads the same palette through its key (`hbInfo`).

## 2. Organic caverns

Organic materials reshape their walls once the map is built and the path guard has placed everything (`d8Shape`, `getMap` wrapper):
- Carving (`d8Carve`): six passes over wall tiles that touch open floor, accepted by seeded value noise (bulges, wider winding tunnels,
  rounded chambers, notches filled). A wall tile is carved only when its open side neighbours are already joined through the 3x3 ring
  around it (`d8Simple`), so carving never joins two places that were apart: no new route, no way past bars or the boss door, the lever
  order and the "lever far from the stairs" rule keep their meaning. Nothing is carved within `D8_KEEP` (2) tiles of a chest, key, lever,
  stairs, door, bars, rune circle, decor prop, the start, the lost wayfarer or the boss.
- Liquids (`d8Pools`): some walls by open floor become `'~'` (still solid, drawn as the material's liquid, low in HD-2D). Built flooded
  halls and forges get their pools and lava channels the same way; their rooms are not carved.
- Checks: the reshaped map must have no more `validateDungeon` / `mapIssues` problems and no more path assets (`pathAssets`) than before,
  otherwise it is redone with a wider keep-out, then without liquid, then dropped. Over 200 seeds per organic material none was dropped.
- Because the guard ran first, chests, key chests, levers, the stairs, the start, the boss and their saved opened state are exactly those of
  the unreshaped map (`v082da` compares them, and the roamers, with the same map built with `__D8OFF`). Gathering spots are placed before
  the reshape. Roamers keep their count, kinds and elite rolls; their patrol spots come from the (now larger) floor.
- 2D draws the rock round: rounded outer corners on the rock mass, rock fillets in the inner corners, rough face tops and feet.

## 3. The boss lair on the field

v0.8.9 redesign. The owner, with a Fold screenshot of Glacier Teeth in HD-2D: "Lair sprite is flat and I don't like its design. It should
be more natural looking; can keep a special image on maps but it should be obviously a lair but doesn't need wording on it saying lair;
make the entrance feel more like it's part of the land, as the boss would have dug it out / built it." The v0.8.8 lair (a flat 64x100
card: a brick tower, a red LAIR plaque, a skull gate, a violet beacon whose light washed the snow pink) is gone. Now the entrance is dug
into a mound raised from the field's own ground (`d8LairShape`, a `getMap` wrapper after the path guard):

- Tiles: the entrance (`E`) and its approach are unchanged. Its `U` footprint and the open ground the generator always leaves around an
  entrance (3 rows deep, 5 wide, on the side away from the way it faces) become field rock `'#'`, solid like a cliff, never the approach
  lane (three tiles out of the mouth), an exit, a sign or a townsperson. The mound is kept only if `mapIssues` and `pathAssets` are no
  worse than without it (otherwise only the old footprint, otherwise nothing and the old entrance look); a mound tile goes again if it would
  hide a prop up to three rows north of it (`pgHides`). Over 800 fields (200 seeds, stages 1 to 4) 799 have a mound, 720 to 746 of at least 9
  tiles; no field has a target the player cannot reach or an asset on a path that it did not have before; the same seed builds the same
  mound.
- Look, from the dungeon's material leaning a quarter toward the field's own cliff colours: frozen rock under a snow and ice cap with
  icicles (ice cavern, ice vault), basalt with ash and a few ember cracks (volcanic, forge), earth with roots and grass (root cavern,
  crypt), sandstone strata (sandstone), wet rock with weed and moss (sea cave, flooded halls), mountain rock (keep, mountain caves), dark
  crystal rock (astral).
- Heights (art px): facing the camera (south) the hill rises right behind the mouth (about 20 at the front, 36 behind the mouth, 30 at the
  back), any other way it is a low hill with the mouth at its foot, rising away (18, 30, 26). Corner heights average the tiles around them
  and fall off at the outer edge (a hill sloping into the ground, not a box); each tile's height is capped so a prop up to three rows north
  of it still shows by the `pgHides` rule with the real height (`d8LairHidden`, checked in `v082da`).
- HD-2D: real geometry, built like the fortress gatehouse (`hdBakeBuildings` gets a `d8lair` part, `hdBldKind` and `hdGateGeo` are wrapped):
  a heightfield of sloped top quads (cap where it is flat, rock where it is steep), rock faces where it meets the ground, and the mouth's
  face (a dark arch, claw gouges either side, rubble and bones at the sill, a gradient of the inner light) on the face toward the entrance.
  The mound tiles are ground for the block pass (`hdKind` now gets the tile position). Billboards: two torches by the mouth, a broken
  banner of the Scourge (its cloth and emblem) and a skull pile on top, a faint plume of the mouth's colour rising from the top (skipped
  while the hero stands right in front of it), a small glow in the mouth. No point lights of its own and the 2D lights are left out of the
  HD-2D bake, so nothing tints the field.
- 2D: the mound tiles show only the ground; the hill is drawn once in the prop pass of its bottom row as a small heightfield seen from the
  south and above (each ground pixel lifted by its height, painted north to south, lit from the north west, cap on the flat, rock on the
  steep, a dark rim and a soft shadow on the ground), with the mouth cut into the face over the entrance, or, when the entrance faces away,
  a dark hole with a rubble rim at the hill's foot. Torches, banner and skull pile, the mouth's glow and the plume are drawn over it each
  frame, never inside the hero's box (clipped out).
- Around it: a trampled lane out of the mouth with claw marks, bones and rubble on the ground nearby (ground art, so both renderers).
- Relit (the boss beaten): gold light in the mouth and the plume, a slower pulse, gold torches, no banner, skull pile, bones or rubble,
  a fainter lane.
- No text anywhere. A cave mouth is still a small rock arch on flat ground with a blue glow and a fortress a grey gatehouse; the lair is a
  hill about 5 x 3 tiles with a lit mouth, torches and the Scourge's marks.
- Map: its own icon (a mound with a dark mouth and a red glow, gold when relit) and legend entry, "Lair" / "Lair (relit)", on the full
  map and the minimap. The world map keeps its dark tower vignette with the gold beacon once relit.
- Also fixed (`hd2d.js`): a v0.8.0 comment had swallowed the line that sets the scene shader's `uEmis` and `uAct` uniforms, so in HD-2D
  the emissive pixels and the readability floor of characters stayed at whatever the GL program last held; snow fields read washed out.

## 4. Old saves

Maps are rebuilt from the seed on every load, so an old save inside a reshaped dungeon finds the same chests, keys and levers. Carving only
turns walls into floor, so a saved floor tile stays floor. A saved tile that became liquid (or anything solid) now loads on the nearest open
tile of the same dungeon (`enterWorldFromSave` wrapper) instead of the town inn; a field save on a tile a lair mound now covers loads
beside the mound.

## Tests
- `v082da.js` (default 200 seeds per organic material and for the flooded and forge pools, 40 for the other built materials, with the side
  caves of every realm): material on every map; organic walls in every dungeon (wall corners per wall edge x1.7 to x1.8 the unreshaped map);
  every target reachable and nothing on a path (`mapIssues`, `pathAssets`); chests, keys, levers, stairs, start, boss and roamers equal to the
  `__D8OFF` build; the same seed builds the same tiles; built layouts not carved; no generation errors.
- `v082db.js` (Low and Medium, 933x705): the 2D tiles drew in the material only (render hook `D8.n2d`), the props in the material, HD-2D live
  with the material's faces (`D8.hd`); battle backdrops in the material (cavern for organic places); side caves organic, fortresses keeps;
  the lair (journey 1034, stage 3, entrance facing south): own icon and legend entry; a mound of solid field rock around the unchanged
  entrance with its way in open and every target reachable; no flat sprite or lettering (the entrance prop draws nothing); the raised 2D
  hill, glow and plume; HD-2D geometry (27 quads, about 39 px tall) with the mouth in its south face; nothing of it over the hero's face
  (2D: the pixels of the hero's box are the same with and without the lair effects; HD-2D: the plume is skipped in front); the relit look
  (gold light, a cleared mouth, "lairlit" icon); a field save on a mound tile loads beside it; a save on a now liquid tile loads next to it
  in the same dungeon, saves on carved floor and on the start load where they were; no page errors.
- `v082da.js` also sweeps the lair fields (`LAIRONLY=1` runs only that part).
- `v082dperf.js`: Low and Medium, an ice cavern, a volcanic cavern, a crypt and the lair field, in turns with the build before.
  v0.8.9 lair (CPU x4, 390x844 at 2x, best of 3 against v0.8.9 main): Low lair field 60.2 -> 60.2, Medium lair field 58.8 -> 58.2,
  Low volcanic dungeon 60.3 -> 60.1, Medium 58.8 -> 59.9.
- Rerun and passing: v050p1c (550 dungeons), v050p2world, v071wa (400 dungeons, 309 caves, 320 fortresses: nothing hidden that blocks),
  v071wb, v071wt, v063wo, v041p1c, v051c, v080r, v050p2daily (against `git show HEAD:index.html`), liveupdate.

## Known limits
- Built materials keep the generator's rectangular rooms (as asked); only the organic ones change shape. The start room and the room
  corners that hold chests stay square-ish because nothing is carved next to an asset.
- HD-2D block heights are the same for every wall (`HD2D.wall.dungeon`), so the path guard's hiding rule holds unchanged; the organic look
  comes from the outline and the art.
- The camera looks north. Of 798 mounds 107 face south (the mouth in the face toward the camera), 557 east or west (the mouth in a side
  face, seen at an angle, plus the trampled lane) and 134 north: those have the mouth on the far side of the hill, shown as a dark hole with
  a rubble rim at the hill's foot from the lane; from the south you see the hill and its marks.
- In about 8% of fields a chest, a sign or the clearing's edge keeps the mound smaller than 9 tiles; in 1 of 800 none fitted and the old
  entrance look stays.
- The minimap and full map colour liquid tiles with the theme's water colour (`mapCol`), not the material's.
