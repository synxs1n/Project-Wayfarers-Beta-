# Art style guide (sprite overhaul, v0.13)

Everything is code-drawn with `PG` key grids painted by `paint()` (v3/art.js): each key letter maps to a base colour and `rampFor()` gives
four shades (highlight, base, shade, deep); `paint` adds a 1px outline and a top-light shade step; `opt.flat` keys skip shading, `opt.glow`
adds a glow. Keep that pipeline. The overhaul is about what we draw with it.

## Rules
1. **Silhouette first.** Every sprite must be recognisable as a black shape. One dominant mass, one or two secondary masses, a clear "front".
   Flyers show both wings; crawlers are wide and low; golems are tall and top-heavy; wraiths taper down.
2. **Light from the top left.** Highlights (`rampFor` index 0) go on top-left edges; use explicit light keys (uppercase) on the lit side and
   shade keys (lowercase) on the lower right. Do not rely on the automatic AO alone: block in two tones per mass by hand.
3. **Four shades per material, no more.** One material = one key family (e.g. `B` body, `b` body shade). Two materials for small foes,
   three for bosses, plus one accent (eyes, glow, gems) as a `flat` key so it stays saturated.
4. **Outline:** `paint` outlines automatically. Interior lines are lowercase shade pixels, not black.
5. **Scale:** overworld walkers 16x24 (heroes), battle sprites 40x40 (foes, heroes), 60x60 (bosses, guardians). Keep 2px of margin.
6. **Readable eyes.** One 2x2 eye (or two 1x2) with a 1px highlight; no eyes on swarms and slimes beyond a glint.
7. **Variants are not recolours.** A realm variant changes at least one shape (horns, fins, a mantle, a different tail) besides the palette.
8. **Palette discipline.** Element accents: fire #ff8a3a, water #4aa8ff, ice #bfe6ff, lightning #ffe14a, earth #b8894a, wind #8ad0a0,
   light #fff0a0, shadow #9a6adf. Body colours stay desaturated so accents read.

## Animation
Frames are functions of `now` (see battle.js drawUnit and art3.js bossIdle). Every unit has:
- idle: 2 frames, 1px breathing; cloth or hair offset by 1px on frame B.
- hit: 1 frame, flinch 1px back + white flash (existing).
- down: existing pose.
Heroes add pose frames selected by the skill's kind and delivery (anim.js `animStyle`): **swing** (slash: weapon arc over the head), **thrust**
(piercing: weapon forward, body leaning), **smash** (blunt: two-handed overhead), **shoot** (ranged: bow drawn / crossbow raised), **cast**
(magic: hands up, orb at the palm), **pray** (heal/revive/invoke: head down, hands together), **guard** (shield up, body low), **cheer** (buffs:
one arm up). Each pose is a 2-frame cycle (wind-up, release). Foes add **attack** (lunge 2px forward with the dominant mass stretched) and bosses
add **telegraph** (existing swell) and **roar** (mouth or core open, glow pulse).

## Per-family notes (foes)
- beasts (pup, hound, wolf): four legs in a diagonal stance, tail up, ears distinct per species; variants change ear shape and mane.
- toads/slimes: squash-and-stretch idle (wide frame A, tall frame B).
- crawlers/crabs: six legs visible as pairs, claws forward.
- gulls/hawks/bats/rays: wingspan wider than body; rays undulate.
- wisps/jellies/wraiths: translucent core (`flat` glow key) with trailing tendrils; wraiths carry one prop (lantern, scythe).
- golems/husks/knights: blocky, plated; a glowing core or visor as the accent.
- swarms (gnat, locust): a cloud of 8 to 12 dots arranged in a drifting ring, two frames rotate the ring.
- bosses: a unique silhouette each, never a scaled foe; one "tell" part that animates (crown, maw, core).

## Verification
`node tools/chrome/sheets.js <html> <out.png> heroes|foes|bosses|npcs|poses` renders contact sheets at 3x; look at them before and after. A
family is done when every sprite in it passes rules 1, 2, 6 and 7 at a glance and the idle and attack frames read on the sheet.
