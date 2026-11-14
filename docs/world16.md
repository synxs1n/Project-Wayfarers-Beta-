# World pass after v0.21.0 (`v3/world16.js`)

The owner's playtest notes for the overworld, five of them. One new module, last in `MODS`; the owners got `HOOK.def` lines (`rebuildBase` in worldrt.js,
`worldPlan` in world4.js) and two conditions in `townGates3` (world4.js). `window.__W16` (counters `n`, the switch `off`, `err`, `api`) is the test hook.
Test: `tools/chrome/v190a.js` (group `world`). Names audit: `tools/chrome/names16.js`.

## 1. "chest take a second to open, used to open immediately"

Cause: `openChest` ends in `rebuildBase()`, which repaints the whole map twice (the two water frames). Since the terrain, light and cohesion passes a map is
millions of `fillRect` calls: about 300 ms on a desktop for a long field (measured 213 to 450 ms on the test machine), a second on a phone, all of it before
the find text is shown. On Medium and High the HD-2D scene then re-cut its prop cards in the next frame, before that frame was shown (another 80 to 180 ms).
No single commit added it; each ground art pass made `buildMapCanvas` dearer.

Fix: when the chest tile is the only tile that changed (the map's `tileAt` string before and after), only the 3 x 4 tiles around it are repainted, with the
same painters and hooks: `W16.clip` makes `drawTile` and `drawObjects` skip everything outside a 9 x 10 window, the whole `buildMapCanvas` chain runs, and
the 3 x 4 box is copied into the base canvases that are kept (so HD-2D keeps its ground and only re-cuts cards). The result is pixel for pixel the full
repaint (the test compares both frames). A key chest, which moves bars elsewhere, still gets the full repaint.
- Flat look: the patch runs inside the call (20 to 45 ms on a loaded machine).
- HD-2D: nothing is painted inside the call. The find text goes up first; the patch and the card re-cut follow `W16.hdWait` (110 ms) later, while the opening
  chest of worldfx.js still shows its closed frame over the baked one.

## 2. "cant click to walk somewhere I've been before on PC if I went there on phone app"

Cause: the seen map is `G.explored` (one bitset per map) inside the journey save, and journey saves sync whole (docs/v085-sync.md): one device's copy
replaces the other's, never merged. The plain "play here, then there" flow does carry it (checked with two devices: Continue, and Load it on an open journey).
It is lost whenever this device's copy wins without having been built on the other's latest: Keep this one / Keep this device, a conflict decided by
progress, or an app killed before its leave save landed (walking only updates `G.explored` in memory; `saveGame` runs at events). Tap to walk refuses unseen
tiles (`awPlan`), so the PC said "You have not been there yet". Which of these happened to the owner could not be told from here.

Chosen: sync it (the other option, tap to walk on any reachable tile of a visited map, would have made the fog on the map meaningless as well).
- `META.seen16 = {<journey key>:{t, m:{<map id>:'<bytes>:<packed>'}}}`, journey key = `j<seed>c<cycle>`; mirrored in `profile/<uid>.flags.seen` through the
  existing `profileOf` / `applyRemote` hooks (flags are compared by `sameProfile`, so a change is written).
- Packed: the bitset as run lengths (zeros first, alternating), varints, base64. The test journey's field and town: 189 bytes against 1029 raw. The three
  latest journeys are kept (the open one always).
- Merged as a union per journey and map, both ways, on every profile sync (`applyRemote`), and folded into the journey when a save is loaded (`unpackG`).
  Bitsets of different sizes are never mixed.
- The account copy is refreshed when the map changes, every 45 s of play, and on leaving the page.

## 3. "waystone in breach should be in the center"

The Breach Waystone stood three tiles north of the hub's centre. `w16BreachStone` (getMap hook) moves it to the nearest free tile to the centre of the ring
of standing stones (the map's centre when no ring is found), checked: every walkable tile stays walkable and a walked tile touches the stone. The Breach is
rebuilt from the journey seed on load, so old journeys get it too. A save standing on that tile is stepped to the next open one (`placeAt` hook).

## 4. "town exits rarely seem to be west ... some town exits and entrances didn't have the post next to them properly"

Measured on the untouched build (200 towns): a town's way out was north 31%, south 40%, east 29%, **west 0%** (`worldPlan` drew from e, n, s only; only
entrances could be west). A town had one sign, at (W-3, road+1): inside the east gate's lane, and nowhere near a gate on any other side (of 360 gates, 54 had
a post within reach, all east exits).

- Plan revision 3 (`G.dunRev` 3, set for new journeys; `worldPlan` hook): all four sides, never back through the gate just used, a field goes straight on 40%
  of the time, and a plan whose towns and fields would share a square of the world map is drawn again. 600 journeys: exits w 24%, e 25%, n 25%, s 26%; the
  first town w 25%, e 25%, n 26%, s 24%. Old journeys keep revision 2.
- `townGates3` closed the default west or east gate before checking whether the other gate needed it (never possible before): fixed in world4.js.
- A post beside every town gate, old journeys too (`w16TownSigns`): on open ground touching the gate's lane from the side, never on it (the old east sign
  steps aside and keeps its words). Where water, wall or houses leave no ground there: a bush, tree, crate or rock beside the lane gives its tile, then paving
  at the edge of a wide road, then the nearest ground along the way in (about 7% of gates: lake, harbour, camp towns; the reason for each tile beside the lane
  is kept in `m.w16signs`). Never in a building, on a doorstep, where a townsperson stands, hidden behind a wall in HD-2D, or closing a passage.
- Found on the way: a town could be left with no gate at all on a side (`townCarve` runs while the town is half built; Reedwade as second town with a north
  gate, 15 of 1500 towns on the untouched build, old journeys too: a dead end). `w16FixGates` carves it once the town is finished.
- Gate guards no longer say the realm "lies east" when it does not.
- A post never narrows the ground so that a crate, banner or townsperson's spot beside it ends up on a path (`pathAssets` no higher than without it; the
  first version failed `v183a.js` on exactly that).
- Tests: under the harness (`window.__PWTEST`, pw.js) a new journey stays on plan revision 2 unless the page sets `window.__W16REV3` (v190a.js does):
  the older tests stand on tiles of journeys they know by seed, and those were laid out by revision 2. Players always get revision 3 for a new journey.

## 5. "too many things with similar words in the name, example 'hollow'"

`W16.api.names()` lists every display name by kind (realm, town, dungeon incl. dens and sanctums, boss incl. guardians, foe, wayfarer, skill, item, guild,
quest); `tools/chrome/names16.js` finds the roots (a root counts once per name when a word is it, starts with it or ends with it).
Limits applied: at most 2 names per root across realms, towns, dungeons and bosses; at most 4 across those plus foes, wayfarers, guilds and quests.
Before: 54 roots over (hollow 10 places, frost 6, cinder 5, crown 5, root 5, deep 5, mere 5, spire 5, brine, storm, glass, ember, star, king, salt 4 ...).
After: none, but for three guild rank words left alone (warden 5, master 6, hand 5: rank titles such as Guildmaster and the Steady Hand's own ranks).
Skills and gear are not counted against the limit: element words and tier families repeat by design (Frostbitten X, Dawnsteel Y). For the nine roots the
owner named they were still brought down: hollow 3, ash 6, ember 4, thorn 5, gloam 3, bone 5, mist 2, spire 2, cinder 5 across everything.

Display names only: ids, realm keys and save keys did not change. Bestiary records live under the monster's name, so `BEST_RENAME` (account.js) carries
the old names of foes, guardians, Echoes and rivals to the new ones. Quest text already written into a save keeps the old words.

**Realms, towns, dungeons, dens, sanctums** (32)

| Old | New |
| --- | --- |
| Cinderhollow Deeps | Kilnscar Depths |
| Hollowmere | Larkspur |
| Reedhollow | Reedwade |
| Hollow Star Sanctum | Eventide Sanctum |
| The Hollow Observatory | The Blind Observatory |
| Mossback Hollow | Mossback Burrow |
| Starfall Hollow | Cometfall Crater |
| Frostmere Ice Halls | Kestrel Ice Halls |
| Frostgate | Whitehearth |
| Frostcrag | Hoarcrag |
| Cinderseam Cave | Coalseam Pit |
| Storm Spire | Thunderhead Keep |
| The Bellfry Spire | The High Bellfry |
| Duskspire | Duskhaven |
| Dunecrown | Dunemark |
| The Sunken Crown | The Sunken Court |
| The Glowroot Heart | The Fungal Heart |
| The Ironroot Foundry | The Great Foundry |
| The Deep Smelter | The Black Smelter |
| Emberdeep Forge | Underforge |
| Emberwall | Forgewall |
| Cidermere | Ciderbrook |
| Rimefang Grotto | Icefang Cleft |
| The Drowned Mill | The Flooded Mill |
| Briarwatch | Briarkeep |
| Brinewick | Kelpwharf |
| Saltwick | Glarepan |
| Saltwhisper Cave | Saltwhisper Cove |
| Saltmarch | Seamarch |
| The Glass Cathedral | The Mirror Cathedral |
| The Rookery Barrow | The Corvid Cairn |
| Ashgate | Kilngate |

**Bosses, guardians and foes** (29)

| Old | New |
| --- | --- |
| The Hollow Abbot | The Silent Abbot |
| Frostmother | Snowmother |
| Cinderwing Elder | Sootwing Elder |
| Sunscorch Ooze | Scorchsand Ooze |
| Stormcrown Matriarch | Old Thunderwing |
| Rootmother | Tanglemother |
| The Brine Hag | The Kelp Hag |
| The Glass Widow | The Mirror Widow |
| Candleking Moth | Emperor Candlemoth |
| Old Shellking | Old Shellgrim |
| Skullbell Sentinel | Tollskull Sentinel |
| Lanternmaw | Glowmaw |
| Hollow Herald | Void Herald |
| Nightfrost Harpy | Nightsnow Harpy |
| Cinderwing Gull | Sootwing Skua |
| Cinder Shade | Soot Shade |
| Eclipse Cinder | Eclipse Mote |
| Nightstorm Hawk | Nightbolt Hawk |
| Stormtide Crawler | Surge Crawler |
| Ember Bat | Kiln Bat |
| Brine Jelly | Tide Jelly |
| Brine Spitter | Salt Spitter |
| Glass Wisp | Mirror Wisp |
| Starless Wraith | Lightless Wraith |
| Moor Gull | Moor Tern |
| Ash Spawn | Soot Spawn |
| Ashen Husk | Charred Husk |
| Duskwing Imp | Gloamwing Imp |
| Siren's Wisp | Siren's Lure |

**Rivals (first word; the epithet stays)** (16)

| Old | New |
| --- | --- |
| Ashtongue | Sourtongue |
| Hollowfang | Grimhowl |
| Brinescar | Reefscar |
| Ironjaw | Anviljaw |
| Wraithwing | Palltalon |
| Emberback | Scorchback |
| Stormtusk | Squalltusk |
| Glassfang | Shardfang |
| Rotroot | Rotbark |
| Sunscald | Noonscald |
| Saltgrave | Marlgrave |
| Bonechime | Knellchime |
| Frostgnaw | Chillgnaw |
| Cinderhook | Charhook |
| Gloomspur | Murkspur |
| Rimeback | Sleetback |

**Skills** (11)

| Old | New |
| --- | --- |
| Hollow Drum | Earthen Drum |
| Hollow Slam | Husk Slam |
| Hollow Hand | Snuffing Hand |
| Ember Hymn | Kindling Hymn |
| Ember Bite | Scorch Bite |
| Ash Gale | Soot Gale |
| Cinder Wail | Smoulder Wail |
| Cinder Dive | Scorch Dive |
| Cinder Bloom | Flare Bloom |
| Cinderstorm | Sparkstorm |
| Cinder and X (two element arts) | Blaze and X |

**Items** (17)

| Old | New |
| --- | --- |
| Hollow Star Rod | Lodestar Rod |
| Hollow Star Codex | Lodestar Codex |
| Hollow Star Lute | Lodestar Lute |
| Hollow Star Harp | Lodestar Harp |
| Hollow Star Flute | Lodestar Flute |
| Hollow Star Lyre | Lodestar Lyre |
| Hollowcleave | Voidcleave |
| Bone Flute | Antler Flute |
| Bone Wand | Horn Wand |
| Ash Longbow | Elm Longbow |
| Ash Wand | Hazel Wand |
| Ash Quarterstaff | Elm Quarterstaff |
| Ashwood Log | Elmwood Log |
| Ember Ore | Kiln Ore |
| Starfall Charm | Cometfall Charm |
| Cinderseam Charm | Coalseam Charm |
| Rimefang Charm | Icefang Charm |


## Tests

`tools/chrome/v190a.js` (74 checks): chests (both looks, field and dungeon, the patch against a full repaint pixel for pixel, the module off), the explored
map over two devices (syncmock), the Breach stone over 24 journeys and every way the Breach is turned, the exit sides over 600 plans, every gate of 420
towns with their fields (round trip, post, map issues, `pathAssets`) and 1500 more towns, the world map and the connected map with a west gate walked
through, the name roots, an old save.

`node runall.js ci world` on this build (70 tests, 55 min on a loaded machine): 65 pass. The five that fail also fail on the untouched build:
`v177a` (2D night in a town: no lamp in view), `v050p1b` and `v051c` (the view size after a battle / recovering its size), `v050p1c` (a townsperson's spot
on a path tile in Glarepan as first town: there without the posts too), and `v141a` (travel to the Breach checked after a fixed 900 ms: 1 failure in 5 runs
on the untouched build under the same load). `v152a` (a double click) failed once under load and passes when run again, on both builds.
Changed tests: `v182a` looks for its island over a few journeys; `v183a` counts a west gate as a way on. With every test journey forced onto plan
revision 3, `v182a`, `v183a`, `v184a`, `v063wo`, `v040p5`, `v040p5b`, `v071wa`, `v165a` and `v145a` pass.

## Left open
- The chest patch on the flat look still costs 20 to 45 ms on a loaded test machine (the full `buildMapCanvas` hook chain runs once per water frame over a
  clipped window). It could be deferred like the HD-2D one.
- About 8% of town gates have their post farther along the way in, not touching the lane (lake, harbour and camp towns, where the lane is a pier or runs
  between palisades).
- Glarepan (the salt flat camp town) as the first town has a townsperson's home spot on a path tile; not from this pass, not fixed here.
- Quest text already saved in a journey keeps the old names.
