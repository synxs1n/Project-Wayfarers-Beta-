# v0.7.1 title pass: HD-2D camp title, new wordmark, emblem and app icons

The owner's three asks: the title screen still showed the old look (small sprites on a pixel backdrop), the blackletter
"Wayfarers" should get a new style, and the game needs a logo used as the app image.

## The title scene (`v3/title7.js`, after `sprhd2.js`)
- A dusk camp on the road to a walled town: sky gradient with stars and a crescent moon (placed under the wordmark, dropped when there
  is no room), two hill ridges with a warm horizon haze, the town (walls, houses, a keep with a pennant, lit windows with bloom), pines
  framing the edges, a road from the camp to the town gate, a tent, a stone ring and logs, soft grass at the front. Far layers and the
  front grass are blurred (depth of field), like the HD-2D world.
- Heroes: six from `titleScene()` (the old pool: starters plus legacy heroes, monsters left out), drawn from `heroCanvas()`'s real 2x
  bitmap (the original `drawImage`, `CanvasRenderingContext2D.prototype._hdDI`, so sprhd.js's logical-unit patch does not halve it),
  at a whole device-pixel scale with smoothing off. Left group faces the fire, the right group is mirrored.
- Lighting (v0.5.8 language, baked per hero once): dusk ambient (cool, slightly desaturated), warm fire light on the side facing the
  fire and stronger toward the feet, a warm rim on the fire-side edge (its own layer, pulses with the flicker), a cool sky rim on top
  edges, a blurred cast shadow away from the fire and a soft contact shadow. Grade on top: vignette, a darker band behind the wordmark,
  a fade at the bottom.
- Motion: fire flicker (flames, ground light, bloom), breathing (a second frame with the upper body one bitmap pixel up), rising
  embers (pixel squares), twinkling stars, a new lineup every 24 s with a cross fade. About 30 fps, under 1 ms per frame.
- Reduced motion: one still frame. Low tier: one still frame, drawn at 1x, no blur filters (same HD sprites).
- Layout: portrait stacks the scene (44% of the screen height, 250 to 520 px) over the menu; landscape (width at least 700 px and
  wider than tall) puts the menu in a 260 to 340 px column beside the scene, which fills the screen height. Menu, notes and the
  version line move into `.t7side`; tagline, legacy heroes and the pitch stay below. Faces never sit under the menu or the wordmark
  (the test measures it).
- ui.js's `titleDraw`, `TTS` and the `.lineup` code stay but no longer draw (there is no `#tcv` or `.lineup`).
- Tests read `window.__A.T7`: `drawn` (bitmap and draw sizes per hero), `faces` (page rects), `frames`, `still`, `bakeMs`, `frameMs`.

## Wordmark and emblem (`v3/logo.js`, `WF_LOGO`)
- Code-drawn SVG, no font: "WAYFARERS" as polygon capitals on a 100 unit cap height (thick and thin strokes, flat wedge serifs, a
  spear-tip A with a chevron bar, a contrast S built from two arc bands) and a four-point waystar over the W. Layers: drop shadow,
  dark outline, gold gradient, bevel highlight (a mask of the glyph minus itself shifted), a glow on the star. `wordmark({rule})` adds
  a gilt rule with a centre star.
- Used on the title (over the sky, with "Beta" under it) and in the header (`.brand b.wfm`, 24 px, 17 px on phones) instead of the
  Jacquard blackletter. The blackletter font stays bundled for the victory crest.
- `emblem({bg,scale,simple})`: a compass badge (gold ring, degree ticks, four main and four minor points, a dark medallion) with the
  W and its waystar at the centre. `simple` (48 px and smaller) drops the ticks and minor points and enlarges the W.

## Icons (`tools/mkicons.js`, run `node tools/mkicons.js` from the repo root; renders `v3/logo.js` with Playwright)
| File | Size | Used by |
|---|---|---|
| icons/icon-192.png, icons/icon-512.png | 192, 512 | manifest (any); icon-512 is also the Electron window icon (electron/main.js) |
| icons/icon-maskable-512.png | 512 | manifest (maskable, full bleed, emblem at 80%) |
| icons/icon.svg | any | manifest and the page's favicon (SVG) |
| icons/favicon-32.png, icons/favicon-16.png | 32, 16 | page favicons (shell.html) |
| icons/apple-touch-icon.png | 180 | Apple touch icon (opaque) |
| assets/icon.ico | 16, 24, 32, 48, 64, 128, 256 | Windows app and installer (package.json build.win.icon, was assets/icon-only.png) |
| assets/icon-only.png | 1024 | kept up to date (no longer referenced by the build) |
| android-res/mipmap-*/ic_launcher.png, ic_launcher_round.png | 48 to 192 | legacy Android launchers |
| android-res/mipmap-*/ic_launcher_foreground.png | 108 to 432 | adaptive icon foreground (badge inside the 66 dp safe circle) |
| android-res/values/ic_launcher_background.xml | #0E0A1A | adaptive icon background colour |

release.yml copies `icons/` into the web bundle and `android-res/*` into the Capacitor res folder (unchanged).
The manifest background colour is now #0e0a1a to match the emblem.

## Tests
- `tools/chrome/v071t.js`: at 390x844, 844x390, 933x705 (mobile, dpr 2) and 1280x720, with and without a save: the scene canvas and
  no old lineup, at least 4 heroes, every hero drawn from the 2x bitmap at a whole scale, wordmark on the title and in the header, no
  blackletter in the header, menu, wordmark and Beta label clear of every face, no sideways scroll, the first menu button on screen,
  Continue first with a save; Medium animates, Low is one still 1x frame, reduced motion is still; manifest, page links, Android,
  Windows .ico, Electron and the workflow paths all resolve at the right pixel sizes. No page errors.
- Still passing: v060a, v059a, v053ua, liveupdate, v063m1, v050p5c (its dawn-to-day blend check is flaky on v0.7.0 too: 1 in 8 runs).
- Screenshots: `tools/chrome/v071tshots.js <tag> [tier]` writes `tools/chrome/shots-v071t/` (gitignored).

## Limits
- The scene is 2D canvas, not the WebGL HD-2D renderer (cheaper and works on every tier); it is one fixed camp, not the realm themes.
- A world hint that is still open when the player goes back to the title shows over the scene (older behaviour, not from this pass).
