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

The main dungeon's entrance (`E` with its `U` footprint, unchanged) is drawn as a lair (`d8LairCanvas`, 64x100) instead of the 2.5
entrance styles: a dark tower with lit slits and a burning beacon cage on top, the Scourge's banner on the tower (the boss theme's cloth and
emblem: thorn, tide, ember, frost, bolt, bone, comb, spore, gear, pearl, ash, grave, eclipse, scale, crown, feather), a skull-carved gate
with horns and glowing eyes over the doorway, spiked pillars with braziers either side and a `LAIR` plaque over the skull. The gate
stone and its touches (icicles, lava, roots, coral, sand) come from the dungeon's material.
- A cave mouth is a 40x30 rock arch with a blue glow, the fortress a grey gatehouse with red banners; the lair is twice their height.
- 2D: the whole sprite in the base layer; a light column over the beacon with a pulse and flickering brazier flames are drawn on top, and
  never inside the hero's box (clipped out).
- HD-2D: the gate, braziers and plaque are the prop card (cards are 58 px tall at most); the tower is a billboard behind it, the beacon glow
  and the column are glowing billboards, skipped while the hero stands right in front of them; the beacon lights the ground (`hdLights`).
- Relit (the boss beaten): a gold beacon and pennant, gold braziers and plaque, dark eyes, a softer gold column and a slower pulse.
- Map: its own icon and legend entry, "Lair" (relit: "Lair (relit)"), on the full map and the minimap (`mapMarks` turns the field's
  `dungeon` mark into `lair` / `lairlit`). The world map keeps its dark tower vignette with the gold beacon once relit (it already drew
  dungeons that way).

## 4. Old saves

Maps are rebuilt from the seed on every load, so an old save inside a reshaped dungeon finds the same chests, keys and levers. Carving only
turns walls into floor, so a saved floor tile stays floor. A saved tile that became liquid (or anything solid) now loads on the nearest open
tile of the same dungeon (`enterWorldFromSave` wrapper) instead of the town inn.

## Tests
- `v082da.js` (default 200 seeds per organic material and for the flooded and forge pools, 40 for the other built materials, with the side
  caves of every realm): material on every map; organic walls in every dungeon (wall corners per wall edge x1.7 to x1.8 the unreshaped map);
  every target reachable and nothing on a path (`mapIssues`, `pathAssets`); chests, keys, levers, stairs, start, boss and roamers equal to the
  `__D8OFF` build; the same seed builds the same tiles; built layouts not carved; no generation errors.
- `v082db.js` (Low and Medium, 933x705): the 2D tiles drew in the material only (render hook `D8.n2d`), the props in the material, HD-2D live
  with the material's faces (`D8.hd`); battle backdrops in the material (cavern for organic places); side caves organic, fortresses keeps;
  the lair: own icon and legend entry, the 64x100 structure, the 2D column, the HD-2D card and billboards, nothing of it over the hero's
  face (2D: the pixels of the hero's box are the same with and without the lair effects; HD-2D: skipped in front), the relit look (gold
  beacon and plaque, "lairlit" icon); a save on a now liquid tile loads next to it in the same dungeon, saves on carved floor and on the
  start load where they were; no page errors.
- `v082dperf.js`: Low and Medium, an ice cavern, a volcanic cavern, a crypt and the lair field, in turns with the build before.
- Rerun and passing: v050p1c (550 dungeons), v050p2world, v071wa (400 dungeons, 309 caves, 320 fortresses: nothing hidden that blocks),
  v071wb, v071wt, v063wo, v041p1c, v051c, v080r, v050p2daily (against `git show HEAD:index.html`), liveupdate.

## Known limits
- Built materials keep the generator's rectangular rooms (as asked); only the organic ones change shape. The start room and the room
  corners that hold chests stay square-ish because nothing is carved next to an asset.
- HD-2D block heights are the same for every wall (`HD2D.wall.dungeon`), so the path guard's hiding rule holds unchanged; the organic look
  comes from the outline and the art.
- The tower and beacon stand about 100 art px tall; on wide landscape views the camera, which looks north, cuts them while the hero is
  close to the gate (the gate, plaque and braziers always show). From further south, and on phones, the whole lair and its column show.
- The minimap and full map colour liquid tiles with the theme's water colour (`mapCol`), not the material's.
