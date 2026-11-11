# v0.19.2 world art pass (`v3/worldart12.js`)

Six owner requests, all look and layout, no save field, no game number, no random draw. One new module, last in `MODS`; the other modules got only
`HOOK.def` lines so it can change their functions through registered hooks (`sncYard`, `sncHall` in sanctlook10.js, `slDenByKey`, `slLairByKit` in
sitelook10.js, `m11NodeDraw` in mats11.js). `window.__WA12` (counters `n`, `err`, the switch `off` that gives the old look back, `api`) is the test hook.
Test: `tools/chrome/v174a.js` (group `world`).

1. **A field's exit sits on land.** "Some land is missing in the path to the next area." Realms that have void (`~`: heights, void, and the sea in coast) left the mouth of
   the lane that leaves a field (the exit to the next town, and the one back to the town) as a 3 wide strip with void beside and under it: `genFieldRaw` carves the
   bend lane (x = ex-1..ex+1) after the field and its lane closure (v0.16.3) turned everything beside the lane into `~` or `#`. Cases: heights and void (53 and 26 of 200
   fields in the test, every one of them at the next-area exit), coast (21). The pass (`getMap` hook, new fields only) turns every `~` in an 11 wide, 7 deep apron round each exit group
   into plain ground `.` (never tall grass, which would roll fights); walls, trees, gates, chests and everything else stay. `drawAudit(m).exitLand` lists any void left in an
   apron (`wa12ExitIssues`), checked by v174a over 40 journeys (200 fields, 360 exits). `mapIssues` is not changed: it reports unreachable targets, and the apron adds only open ground.
2. **Entrances with volume.** The den mouths (`SL_DEN`) and lair fronts (`SL_LD`) were flat, front on, one tone per material. `wa12Entrance` is a pass over the finished sprite, so
   every realm keeps its own material and the 2D paint and the HD-2D card (one sprite) both get it: a lit upper left rim (the top highlight) and a cool shaded right and
   under side, a left to right sweep and ground shading in 1/8 steps (the two faces of the old tents), the mouth found by flood fill and framed (a two px ring of dressed stone lit
   left and top, shaded right; its inside warms toward the realm's light at the sill), a threshold stone, and a prop each side at the foot (a brazier for fire, a crystal
   lantern for ice, sea, fungus and stars, a torch otherwise) with a halo. The cast shadow on the ground is still `slCast`. In HD-2D the lair of a realm with a mound (dungeon8)
   is also real geometry with its own torches; the sprite is the front card on it.
3. **Sanctum side carpets.** Each side of the aisle is a set of panels (`wa12Panel`): a 2 px flagstone seam with a shade line, a dark edge, a two tone gold border, a woven border
   band, a diamond weave, fringe where a panel ends at a garden path, a small flower in open tiles. In the garden (nave) they replace the lawn and the raked gravel and fill the
   floor out to the pillars (which stand on the outer column); in the hall one panel each side of the candles (3 to 6 tiles from the runner), none on the runner or the dais.
   Both are mirror exact (canonical coordinates).
4. **Weather stays in the world.** `WX7.par` was [.82, 1, 1.35] and `WX7.fogPar` [.96, 1, 1.05] (parallax of the far, mid and near layers against the camera), so when the hero
   walked rain, snow and ash slid past him at three speeds, and the face clearing followed him. Both are now 1 for every layer: each particle of the 2D view and of the HD-2D
   overlay moves by exactly the camera's travel; the HD-2D scene's quads were already anchored (`wfxW` around the camera). v077wa's "near layer leads the camera" check now expects
   20 px for a 20 px camera.
5. **Gather nodes as props.** `m11NodeDraw` drew the inventory icon pile; now ten sprites (copper, iron, mythril, oak, ash, elder, healroot, bluecap, sunpetal, starbloom) painted with
   the world's own painter (`PG`, `pDiag`, `paintP`: lit upper left, three tones, outline, cool rim) on the realm's stone and bush green, a contact shadow and the old twinkle steps. The HD-2D
   card cache (`M11HD`) is cleared on arrival because the sprites follow the map's theme.
6. **Mimic.** `MART.mimic` redrawn as the realm chest first (same wood, lid and gold as `objCanvas` 'chest'): planked body, a band each end with rivets, a lock plate, a banded lid,
   claw feet. The mouth is the gap: teeth hang from the lid and stand on the body across the width, a tongue over the lip; the lunge opens it wide, a hit slams it shut. Same frame
   API and anchors as before. In the world the mimic is still the dungeon chest (its tell is the red glint).
