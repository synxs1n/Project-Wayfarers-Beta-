# World pass v0.20.6 (`v3/world14.js`)

The owner after v0.20.5, three notes. One new module, last of its group in `MODS`; the owners got only `HOOK.def` lines (`roamSpawn` in roam.js,
`mapIssues` in mapheal.js, `findPath` in worldrt.js). `window.__W14` (counters `n`, the switches `off`, `cloud`, `fix`, `front`,
`err`, `api`) is the test hook. Test: `tools/chrome/v182a.js` (group `world`).

## 1. "Clouds are filling the space and don't look as good as they used to"

Cause: worldgfx `drawTile` painted every cloud tile alone: two white blobs at random places and, when the tile above and below were cloud too, a dark
band across its middle (`f(w[3],0,6,16,5)`). Open sea was a regular grid of blobs on horizontal stripes 16 px apart, in 2D and in the HD-2D ground
bake (it reads the same base canvas). The history is one commit deep for this paint (it has not changed since the first commit); terrain13's water
passes never touched `T.cloud` tiles (`wetOk`), so the 0.19.7 build looks the same in structure and what changed is mostly the HD-2D light over it.
Fix: a `drawTile` hook repaints the body of every cloud tile from one noise field laid over the whole map (`w14Field`: wide billows plus two finer
octaves, a lit upper left and a shaded underside from the field's slope, seven tones from the realm's own `T.w`, an ordered dither, a few specks), so
nothing repeats by row or column. The shore is kept: under land the base's cliff front rows stay and the body goes under them, the white foam column
beside land and the dark line above the next tile are redrawn. `T.stars` (the void), the sea, lava and ordinary water are not touched (pixel for pixel
in v182a), nor are the wet and snow caps (they skip `~`).
Numbers (v182a, six heights realms): the row profile of a tile matches the tile below it at up to 0.36 with the old paint (the dark band), 0.03 to 0.05
now; the step across a tile border is 2.1x the step inside a tile, now 1.2x.

## 2. "Enemies spawns in an area I can't get to"

Cause: every spawn picked open ground without asking whether the entry reaches it. `roamSpawn` took any room tile; bounty beasts, legend challengers and
rivals (`dynActors`) take a tile of the field's `free` list; gather nodes (world12 `nodeFix`) were checked before worldart12's exit aprons and causeways
changed the ground; chests were never checked (mapIssues only looks at required targets). The terraces and islands of the heights fields are cut off
by cliffs and cloud, so a roamer on one stood where nobody could go.
Fix: `w14Reach(m)` is mapheal's strict reach (4 steps, props and standing NPCs solid, no flying; a diagonal never reaches what its sides do not) with
the progress doors passable (locked door, bars, sealed gate, boss rune). It is only final once worldart12's getMap wrap (registered in a microtask) has
run, so world14's getMap wrap is registered the same way (`m.__w14fin`). Then: roamers on an unreached tile are picked again among the interior tiles
the walk reaches (same rules: 6 apart, away from exits, caves, the door and people), or dropped for the visit when none is left (`r.gone`); bounty beasts and
the like go to the nearest reached open spot of `free` (memoised); chests, key chests and levers that no step reaches move to the nearest reached room
tile pathguard would allow, with their contents, opened state and mimic roll following the spot they were built on, as guardPaths moves them; nodes go
through `nodeFix` again. `drawAudit(m).unreach` lists what is left and `mapIssues(m,{actors:true})` adds it as targets; the plain `mapIssues` is unchanged
(pathguard and dungeon8 loop on its length).
Counts over 150 fields (30 journeys x 5 stages, v182a): unreachable roamers 36 of 600 (24 of 167 in the 42 heights fields) to 0, bounty beasts 1 of 900 to 0,
nodes 14 of 2692 to 0, chests 0 of 1334 (already fine), minibosses 0 of 229; no roamer had to be dropped. 150 main dungeons: 0 before and after.

## 3. "Make all dens, sanctums and lairs enterable through the front only for now"

Cause: worldart13 (0.20.2) draws every mass facing the camera, with the way in south of the door tile. World4 builds the field in a canonical frame and
then turns it (`xfRows`: a mirror and up to three quarter turns), and the entrance's `U` block turned with it, so on 219 of 379 entrances (58%) of 150
fields the solid mass stood beside or south of its door, `face` and `out` pointed the way the block had turned, and the way in was from the side or from
behind what was drawn. The Sanctum hall's inner door had open floor on both sides of it.
Fix (`w14Restamp`, on every field once its tiles are final): the mass is stood up again in the drawn orientation (three `U` north, one west and one east of
the `E` tile) at the same E tile, with the front tile and the two beside it cleared of trees, rock, cliff and bush if they stood in the way (mapheal's
rule: the generator clears the front), or at the nearest spot where it fits (10 tiles; 34 of 226 moved); records say south (`c.face`, `c.out`,
`m.entFace`, `m.entOut`); the change is refused when mapIssues grows or when any target or entrance front the walk reached before is cut off; the lair's
mound (dungeon8) is taken down and built again over the new mass, and removed when it would close the front. The door is entered by stepping north from
its front tile: the sides and back are solid (diagOk never allowed a diagonal onto `E`); a tap on the mass walks to the door (`findPath` hook); A on the
door from its front tile walks in (`interact` hook), A beside it does nothing. The Sanctum hall's inner door stands in a niche: the two floor tiles beside it become wall
(`w14SanctDoor`), so it too is entered from its one front tile only.
Counts (v182a, 150 fields, 388 entrances: 150 lairs, 118 dens, 120 shrines): front facing masses with the front open and reached and no other open
neighbour 160 of 379 before, 388 of 388 now; stepping into the door from the front 388 of 388, diagonally 0 of 776; 258 of 258 taps end north out of the
front tile; A on the door 147 of 147; a front closed by rock, a tree and a cliff is cleared in 16 of 16; 12 of 12 Sanctum halls with the inner door
in a niche (one open neighbour) and the reward chest on `m.prize`; mapIssues 0 before and after.

## Left out / limits
- The Sanctum hall is not turned to face the camera: the shrine on the field always faces south, so the hall is always walked north and its door is on the south
  wall (seen from behind by the camera). Walking the hall south was tried (a `fortDirOf` hook): the prize chest then stands against the south wall, where pgHides
  moves it off `m.prize` (miniboss gate and prize check read `m.prize`), and the hall's rows would have to be moved. Left for a pass on the hall itself.
- Old saves: a hero saved on a tile the restamp turns into mass (or inside a turned Sanctum hall) is moved by the existing stuck handling (ui.js).
- Dens' and lairs' own insides: their stairs out stand in alcoves (pgStairsSpot) on any wall; no art draws them as an entrance, so they were not changed.
- The roamer patrol and chase can only reach tiles joined to their home by open tiles, so they never cross to an island; nothing else needed.
