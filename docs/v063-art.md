# v0.6.3 art pass: hero looks and item icons

Two requests from the owner:
1. "Don't like that capes appear on sprites, only weapon should change the look of someone for now, that or their personal quest reward."
2. "Many item sprites are exactly the same, need these to be updated and generally unique, especially for rarer items."

Save keys and db schemas are unchanged. `GAME_VERSION` and the changelog are untouched by this pass.

## 1. Capes no longer drawn on heroes
- `capes.js`: the `heroLook` wrapper that added a `cape` part in the cape's tier colour is gone, and so is the `hasSignature` wrapper that
  counted a cape as a signature. Capes are still gear: slot `k`, `k_cape_0..5`, stats, shop stock, tempering and auto-equip are as before.
- `engine2.js` `lookKey` (the sprite cache key): now only the hero's own personal reward in `w`, `a` or `c` (`u_<id>`, `ua_<id>`,
  `uc_<id>`) splits the cache. Capes (`k_`) and shop armor never did change the drawing and no longer split the cache either.
- What still changes a hero's look (all through `heroLook`): the signature weapon (weapon swap via `ALTW`), the Oathmantle (cape and gold
  trim, it is the personal reward) and the Token (circlet, bright gems). A hero whose base look has a cape (Brann, Oren, Corwin...) keeps it.
- Every consumer goes through `heroLook` + `lookKey`: world walk frames (`worldrt.js`, `hd2d.js`, `sprhd2.js` warm-up), battle sprites
  (`spriteOf`), portraits and the codex (`heroURL`), the title lineup (base looks). Old saves with a cape equipped simply keep the cape's
  stats and draw no cape (`c.eq.k` is untouched, it is just not drawn).
- `engine2.js` `SIGW` also names the three legendary signature weapons, which read "Kaevan's undefined" before:
  Horizon Arbalest (sniper), Packcall Bow (druid), Stormglass Rod (archmage).

## 2. One icon per item
### Before (audit, `tools/chrome/v063sheet.js` with a v0.6.2 build)
- 342 icons (328 gear, 14 consumables; materials had no icon, only a colour dot). 159 distinct images, 6 groups of identical icons,
  189 items sharing an icon:
  - 147: every signature weapon (`u_`), Oathmantle (`ua_`) and Token (`uc_`). `gearFamOf('u_brann')` is `brann`, so all of them fell back to
    the plain charm silhouette in tier 4 gold.
  - 16: the cave, faction rank and fortress charms (`c_cv*`, `c_fa*`, `c_ft*`); 10: Swift, Clarity and the eight element charms;
    8: Saint and the seven attribute charms; 6: the faction signature charms (`c_fb*`); 2: Vital and Mana.
- Near identical: the six tiers of every weapon family, armor weight and cape shared one silhouette and differed only in palette
  (22 families x 15 tier pairs with 0 pixels of shape difference). The consumable bottles differed only in liquid colour.
- The cache key was `gi2:<family>:<tier>:<plus>`, so even a new drawing could not tell two items of one family and tier apart.

### Now
- `v3/icons.js` (engine and families) and `v3/icons2.js` (charms, personal rewards, Echoforged, consumables, materials, hooks), in
  `v3build.py` before `qready.js`. `sprites.js` keeps only the tier palettes (`TIER_METAL`, `TIER_GEM`, `TIER_TRIM`).
- Engine: each icon is a 16x16 grid of material keys (metal, trim, gem, wood, grip, cloth, page, bone, string, feather, element glow,
  glint, dark inset), painted in one pass with a bevel from the upper left, a coloured outline (the darkest tone of the part it touches),
  and for rare pieces an aura ring and sparkles. Weapons are drawn along the diagonal (`icUV`: s along the blade, v across), so blades,
  hafts and tips stay crisp 2 or 3 px stairs; armor, charms, books, bows and instruments are upright.
- Tiers change the shape, not only the palette: every family has six designs (the longsword goes plain, ricasso, curved saber, wide
  dawnsteel with fuller and quillons, serrated storm blade with a glowing fuller, broad star blade with a star guard and glow), plus
  `IC_SIL` pixels each tier adds outside the family silhouette. Tier 0 is plain, gems from tier 2, gold trim from tier 3, a glint at 4,
  an aura at 5.
- Every charm has its own design (`IC_CHARM`: pendant body, inset glyph, cord, chain or pin): heart, drop, wing, eye, halo and cross,
  fist, leaf, shell, swirl, feather, clover, mossy stone, pearl in a shell, cinder seal, icy fang, falling star, guild pin, anvil, vial,
  paw, quill page, knot; the faction signatures in gold with an aura; element charms by element.
- Personal rewards (`icSigDraw`): a silhouette per reward kind and class: Heirloom Edge (falchion), Vow Blade (winged cross-guard),
  Lost Focus (floating crystal), Lamp Relic (hanging lantern), Debt Collector (wavy kris with a coin pommel), Second Shot (bow with an
  element arrowhead), Master's Wraps (white wraps striped in the element), Final Verse (lyre), the legendary kits (Horizon Arbalest,
  Packcall Bow, Stormglass Rod, Lost Folio), the Oathmantle (white and gold mantle with the element crest) and the Token (medallion with
  the class glyph and element ribbons). Colours come from the hero's elements (first element: runes, crystal, ribbons; second element:
  grip, haft, guard, trims), and a per-hero variant (`icSigVar`, the hero's place among heroes with the same kind and elements) changes
  the metal, trim and wood tones, so no two heroes share an icon.
- Echoforged: the tier 5 design of the family in echo colours with an echo ring, still on the violet framed background (`echo2.js` now
  calls `drawGearIcon` with the id).
- Consumables: each its own vessel (round flask, banded greater flask, slim vial, gourd with a leaf, square bottle with a red cross,
  star-stoppered elixir with a glow, conical flask, holy phial with a cross), plus the feather, pouch, urn, bandage, sandwich and tent.
- Materials: `matIcon(id)` draws all 39 (ores, logs, herbs, monster parts, realm relics, Echo Essence and the 16 Echo shards: 4 crystal
  shapes x 4 runes in the Echo's element colour). It is available for the menus; this pass does not change where materials are listed
  (the colour dot in `matChips` is in `ui.js`).
- Hooks: `drawGearIcon(x, fam, col, tier, glow, id)` draws the item's own design when given an id and the shop design of the family and
  tier without one (old callers). `gearIcon` (equip.js) caches by item: `gi3:<base id>:<tier or glow>:<plus>`; tempered +N pips, the tier
  frame (`tiers.js`) and the Stick's Bestiary glow are unchanged. `itemIcon` caches as `ii3:`, materials as `mi3:`.

### Numbers after
- 381 icons (328 gear, 14 consumables, 39 materials), 381 distinct, 0 identical pairs; the closest two items differ in 11 pixels
  (two Oathmantles); tier variants of one family differ in at least 4 pixels of silhouette; colours per icon rise with the tier
  (average 9.9, 11.7, 12.8, 13.4, 15.7, 16.5 from tier 0 to 5).

## Tests
- `tools/chrome/v063s.js` (new): capes (three heroes, tier 0/3/5 and a tempered cape: side, walk, world front, back and side frames
  identical; shop armor does not change the sprite; an old save with a cape keeps it but draws none; portrait key not split), the
  signature weapon still changes the sprite and the key, the Oathmantle and Token looks are kept, base-look capes stay; icons: every
  gear, item and material icon draws, no two identical, every pair at least 8 pixels apart, tier variants at least 4 pixels of shape
  apart, rarer is more ornate, personal rewards and Echoforged differ from the shop piece, +N pips and frames, the Smithy renders.
- `tools/chrome/v063sheet.js`: icon sheets (1x, 2x, 3x), zoom pages (64 px, a row per family) and two in-game shots into
  `tools/chrome/shots-v063s/` (not committed), plus the duplicate report (`dups_<TAG>.txt`). `TAG=before` with a v0.6.2 build.
- `v043.js`: the cape check now expects capes not to change the look (its "version is Beta v0.4.3" check was already failing).
- Also passing: v053s, v050p2bg, v050p1g, v061a, v041p6, v041p64, eq, eq2. v062a and v053ua fail intermittently on the v0.6.2 build too
  (lighting thresholds and 39 px touch targets); `gear.js` does not run (it expects `out/aurelis.html`).

## Limits
- Icons are shown at 24 CSS px (`.gico`), a 1.5x scale of the 16 px canvas, so pixels are uneven on 1x screens; a 2x (32 px) display
  size would be crisper (style.css, menus).
- Materials have icons but menus still show the colour dot; wiring `matIcon` into `matChips` (ui.js) is left to the menus pass.
