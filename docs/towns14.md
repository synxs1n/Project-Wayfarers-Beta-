# towns14: every realm's town is its own place (v0.20.6)

Owner's note: "Realms need a bit of a rework, most towns layouts are too similar, buildings should look different in each realm."

Before: a town was one of six layouts picked by the realm's THEME (`TOWNGEN[Z.theme]`), so Thistlewold, Amberglade, Willowmere and Boneharrow stood on the same
grid, and every house was one of three roof kinds in a different tint. Now `v3/towns14.js` (last in MODS) picks a layout and a building family per realm.

## Where it hooks in (no raw wrappers)
- `townGen(Z,s,R)` (worldgen.js, `HOOK.def`): getMap and p2world's `laneMain` build the town through it. towns14 wraps it: the layout of the realm, checked (`t14Check`,
  three tries), else the old theme layout (`T14.fallback` counts them; the test wants 0). The map carries `m.arch` and `m.sty`.
- `drawBuilding` (worldgfx.js, now `HOOK.def`): a wrap paints the family's building for the service kinds (inn, tavern, smithy, workshop, guild, chapel, house).
  towngfx.js skips its tint and forge chimney for those (`m.sty`) and reads the sign colours from `signLook` (`HOOK.def`, a `xform` gives each family its wood, stone, bone or ice).
- HD-2D: `hdBldKind` (existing hook) returns the family's body (`roof` a gabled box, `keep` a flat topped box, `card` a cone) and `hdRoofProf` (new `HOOK.def` in hd2d.js,
  one line in the roofed house) the roof pitch. Everything above the ridge in the sprite stands up as the card hd2d.js already cuts there (spires, antlers, masts).

## Layouts (`T14.arch`, 19; `v` mirrors one)
ring (plaza and ring road), street (stalls and a paved walk, houses both sides, back lane), harbour (hill, market, lighthouse, quay, piers), canal (canals under bridges),
cross (market cross, walled), keep (outer ward, inner wall, courtyard), green (cottages round a pond), terrace (three terraces, cliffs, stairs), ledges (islands in a ladder),
cave (under a cliff, the guild hall in the mouth), ruin (broken wall lines, rubble, flooded pockets), lake (islets, boardwalks, boats), camp (v0 ring of tents in a palisade,
v1 rows of pavilions), fork (a hall and three galleries), bowl (amphitheatre), islands (floating islands, rope bridges), meander (a winding road), farmstead (fenced paddocks,
stone circle), close (churchyard and a lane of shops).
Each is hand placed with `T.B` and a few helpers (`t14Frame`, `t14Ell`); `t14Link` joins every door step to the nearest road, plaza, bridge or stair (over water: a boardwalk);
`t14Deco` adds crates and lamps away from doors, bridges and stairs; the sign stands at (W-3, road+1) before the linking so a path never runs through it.
Required in every town: inn, tavern, smithy, alchemy (`workshop`), guild hall, the waystone and the board, the road gates (west and east on the road row, which getMap widens
and `townGates3` may move to another side), the sign. The checks are in `t14Check`; the test repeats them on the finished maps.

## Families (`T14.fam`, 20) and how to add one
A family is a wall painter (`TWL14`: half timber, plank, blocks, plaster, bark, facets, plates, ribs), a roof shape (`TRF14`: gable with a profile bell / tri / round / hip /
gambrel and a surface pattern, stepped, pagoda, hull, dome, shed, saw, flat, cone), a palette, windows (`TWN14`), a door (`TDR14`), a chimney (`TCH14`), a crown above the ridge
(`TCR14`: dormer, cupola, hoist, lookout, horns, turret, antlers, mast, steep, stacks, shards, upper, pinnacles), a wing at one side (`TWG14`: lean-to, porch, tower),
an inset (a narrow stalk under a cap) and extras (`TXT14`). `tf14('name',{...})` registers one; the sprite follows the bands hd2d.js cuts (see the header of the painter section).
Silhouette, not tint: roof profile, overhang, crown, wing, body width and the HD body differ per family.

## Assignment
`T14_TAB` (key -> layout, mirrored, family) for the 20 realms and the six base zones. A key it does not know is guessed by `t14Guess` from the theme (`theme0`), the ground motif
and the mood (`lean.motif`): the family by mood (ember obsidian, frost ice or salt, spore mud or mushroom, bolt and feather cloud, gear iron, eclipse crystal ...), the layout by the least
used one of the theme's candidates (`T14_CAND`), mirrored when it repeats. So a new realm in REALMS is a distinct town without touching this file; add a row to `T14_TAB` to choose by hand.

## Numbers and tests
`tools/chrome/v183a.js` (world group): fingerprints (building centroid distribution, street graph, where the five services stand), silhouettes (alpha masks of inn, smithy, house),
150 towns checked (mapIssues 0, pathAssets 0, drawAudit clean, door steps, gates, landmark window), both renderers, frame cost, the module off (`T14.off`) giving the old towns back.
The tables are printed by the test.
