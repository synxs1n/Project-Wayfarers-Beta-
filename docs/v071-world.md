# v0.7.1 world pass: what is drawn and what blocks agree, tap the map to walk

Two reports from the owner. The version number and the changelog are not touched here (the merge does that).

Files: `v3/pathguard.js` (the rules and `drawAudit`), `v3/p2world.js` (gate arrival tiles), `v3/mapheal.js` (`mapEntry`), `v3/map.js`
(tap to walk, world map travel offer), `v3/shell.html` (one `__A.W71` test line). Tests: `tools/chrome/v071wa.js` (audit),
`tools/chrome/v071wb.js` (the Alchemy case and the HD-2D rule against real frames), `tools/chrome/v071wt.js` (tap to walk).

No save key, slot or db schema changes, and no new save fields (`WS.auto` lives only in memory). The Daily Trial is untouched (nothing is
explored there, so every map tap says "You have not been there yet").

## 1. Stuck beside the Alchemy shop in Hearthholm

**The spot.** Hearthholm (Glacier Teeth, the snow town layout) as the third town: Alchemy is 4x4 at (11,22), door (12,25), step (12,26).
On (13,26), right of the step, the generator left a bush. The hero at the shop's front right corner (14,26) could not walk left.

**Why it happened (three causes).**
- `townFinish` scatters bushes (`t`) and flowers on grass away from roads, and `groundProps` only checks crates, barrels, hay, carts and
  banners beside a door, never bushes or trees. (`getMap` cleared a bush on the step itself, not beside it.)
- In HD-2D the camera looks north and down (`HD2D.pitch` 40 degrees), so a wall, cliff or town wall hides everything on the row just north
  of it that is lower than the wall. The town wall is 14 art px, the bush 12: hidden whole, while its tile still blocked. The top of the
  town wall is paved like the street, so the player saw street. Checked in a real frame (`v071wb.js`): a bush put on (13,26) changes no
  pixel. The same holds in every map kind: chests, key chests, levers, graves and pillars on the row north of a dungeon wall (22 px; a
  chest even two rows north shows only 3 px), rocks, bushes and fences north of a cliff, tents in the void town, the road sign by the
  east gate in the void and cave towns.
- A second kind of mismatch the sweep found: when a town gate moves along its edge (`laneFix`), its arrival tile two tiles in could land
  inside a building, and "the arrival tile must be open ground" paved it: a walkable hole in a wall that is drawn whole (Hearthholm as the
  fifth town, Alchemy (13,25); 7 in 400 towns).
- Also found: `mapEntry` started the reach of a town whose first exit is a north or south gate on the wall tile beside it, so the reach
  was empty and `mapIssues` / `healMap` never checked those towns.

**The fix (rules on the tile grid, every map kind, as each map is built, so old saves heal on load).**
- `pgHides(m,x,y,c)`: HD-2D hides a prop when the walls south of it stand within `PG_VIS` (5 px) of its height. Heights per prop
  (`PG_PROP_H`) are the lowest art over every theme, measured by `drawAudit`; the walls are `HD2D.wall`; a wall k rows south hides what is
  lower than its height less the drop of the line of sight over the gap. No solid prop stays on such a tile: chests, key chests and
  levers are reported by `pathAssets` and moved by `guardPaths` (contents, opened state and mimic roll kept, as in v0.5.0 1.3);
  `pgSpot` never picks a hidden tile; loose decor and trees go; signs, waystones and quest boards step to the nearest tile that shows
  (a sign keeps its words). Boss doors, bars and sealed gates stand in a wall line: hidden by that wall they read as the wall they are.
- Door aprons (`pgClearAprons`): the step in front of every door, the tiles either side of it and the one below it hold no loose decor or
  prop (`PG_APRON_DECOR`), so a shop front can be reached from every side it opens to.
- `pgPlugHoles`: walkable tiles inside a building footprint become wall again (unless that cuts off a target). `laneFix` now steps a
  moved gate's arrival tile back toward the gate instead of paving a building.
- `mapEntry`: any gate's arrival tile first, else one step in from the first exit on its own edge.

**The audit (`drawAudit(m)`, `v071wa.js`).** For every map it draws each row of props the way `hdBakeCards` does and measures each prop's
real art height. Counted: tiles that block but show nothing (2D: no art; HD-2D: art lower than the walls in front of it plus 5 px; a
solid tile nothing draws; a wall tile with no building), walkable holes in a drawn building, decor on a door apron, door steps and open
apron tiles the strict reach (props and NPC homes solid) cannot get to. 80 journeys, each with other realms at each stage, so every realm's
town shows up at every stage: 400 towns, 400 fields, 400 dungeons, 309 caves, 320 fortresses, plus the Archive and the Echo sanctum.

| | towns | fields | dungeons | caves | fortresses | interiors |
|---|---|---|---|---|---|---|
| blocked but not shown, before | 554 | 1077 | 4912 | 1233 | 584 | 0 |
| holes in buildings, before | 7 | 0 | 0 | 0 | 0 | 0 |
| decor on a door apron, before | 26 | 134 | - | - | - | - |
| all of these, now | 0 | 0 | 0 | 0 | 0 | 0 |

"Before" is the same build with the guard and the v0.7.1 fixes off (`__PGOFF`, `__W71OFF`). Every one of the 2798 door steps and their
open apron tiles is reachable, before and after.

## 2. Tap the map to walk there

- Full map (Map button, N) and minimap: a tap on a tile the party has seen on this map closes the map and walks the hero there. The minimap
  now takes taps (it let them through to the world view before); it is on by default from 560 px wide, and Settings can show it on phones.
- The route: A* (`awPath`) over the real collision grid (`solidAt`, townsfolk included), 8 ways with `diagOk` (no corner cutting, no
  diagonal onto doors, exits or stairs), through seen tiles only. Doors, exits, stairs, cave mouths, gates and boss circles are never
  walked through.
- A door or any part of a building, a shop, an exit, stairs or anything solid: the walk ends on the tile in front of it (the step for a
  door, one tile in from the edge for a gate, the nearest open side otherwise), faces it and does not go in.
- A tile not seen yet: the full map stays open and says "You have not been there yet" (the minimap shows it as a toast); no way known:
  "There is no way there that you know of".
- The walk is one more movement source (`WS.auto`, source `auto`): it animates step by step like keys, and it stops on any key, any press
  in the world view or on the joystick, a newer pad, joystick, drag or tap input, a random encounter (encounters roll as usual; `haltInput`
  ends the walk), a dialog or menu opening, a new map, and a way that stays blocked ("Something blocks the way"). A townsfolk stepping into
  the route: the route is planned again around them.
- Both renderers: the maps are 2D overlays and the walk is gameplay, so the 2D view and HD-2D behave the same (tested in both).
- World map: the game's only fast travel is the waystone (touch one, pick a visited town). A tap on a visited town on the world map now
  offers that same travel ("Travel to ...") only while the party stands at a waystone; elsewhere it says a waystone can carry you there.
  Nothing new.

## Tests
- `v071wa.js` (default 80 journeys, about 1 1/2 minutes): the table above; fails on the old rules, passes now.
- `v071wb.js`: the Alchemy case. Old rules: bush on (13,26), hidden, the hero does not move left. Now: apron clear, the hero reaches the
  step, left, right and below are open. Then `pgHides` against real HD-2D frames (Medium, 933x705): a bush on (13,26) changes 0 pixels,
  one on open street about 1700; a dungeon chest just north of a wall 0, one with open floor south of it about 1200.
- `v071wt.js` (81 checks): at 390x844, 844x390, 933x705 (touch) and 1280x720 (mouse), 2D and HD-2D: full map tap on the Alchemy door
  walks over the real path (every tile open, one tile per step, no corner cut) to the step, facing it, not inside; an unseen tile is refused
  with the note; a minimap tap walks there. At 933x705 in both renderers: a key stops the walk short and it does not resume, a road gate
  tap stops in front of the gate in town, a dialog stops it, a random encounter stops it and the battle starts, the world map's waystone
  offer. No page errors.
- Rerun, all pass: v050p1c (110 seeds; its raw scan now also counts hidden chests and levers as path assets), v050p2world, v063wo,
  v041p1c, v051c, wide, v050p1f, liveupdate.

## Known limits
- HD-2D still hides open floor on the row north of a wall (the hero shows through the x-ray circle and silhouette); only solid things are
  kept off those rows. Lowering the walls nearest the camera would show the floor too but changes the look of every map.
- The minimap is hidden by default below 560 px wide (as before); turn it on in Settings to tap it on a phone.
- Tap to walk uses only tiles the party has seen, so a shorter way through unexplored ground is not taken.
- Joystick and gamepad stops are covered by the same input rule; the tests press keys and taps, not the joystick.
