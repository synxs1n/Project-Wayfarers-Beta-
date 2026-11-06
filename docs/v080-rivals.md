# v0.8.0 rivals: a personal quest rival waits, see through, for its wayfarer

Owner report: "Need overworld indicator of rivals you can't battle because you don't have the wayfarers in your party, maybe rivals
are see through in this situation, you can still talk to them to find out what wayfarer you need."

## Which roamers need a hero

Every actor on a world map comes from `dynActors(m)` (`worldgen.js`, wrapped in `legends.js`):

| Actor | Where | Needs a hero? |
| --- | --- | --- |
| Personal quest rival (`G.personal[id]`, `state:'active'`, `type:'elite'` with `b.personal`) | the field of the realm where it was accepted | Yes: `b.personal` must be in `G.party` |
| Bounty elite (`G.bounties`) | its realm's field | No |
| Roaming legend (Kaevan, Nikaris and his beasts, Jaeson) | field | No (anyone may face them) |
| Lost wayfarer (`wanderer` quest) | dungeon | No |
| Dungeon roamers (`roam.js`), minibosses (`sites.js`) | dungeons, caves, forts | No |

So only personal quest rivals have a requirement. The rule is the one `actorTalk` always used: the hero must be in `G.party`, the six,
Vanguard or Rearguard alike. Roster only does not count.

## Behaviour (hero not in the six)

- 2D (`worldrt.js` world draw) and HD-2D (`hd2d.js` `hdActors`): drawn at about 45% opacity (0.40 to 0.50, a slow pulse), from a
  half desaturated, slightly cool copy of the map sprite (`rgGhostCanvas`, cached per art), with a faint pale ground glow and two
  pale motes drifting up through it in 2D. No red aura, no red marker. HD-2D draws it in the blended character batch (as the Echo is)
  so the alpha holds; it can still be tapped (`hdPickAdd`).
- Not solid: `solidAt` (worldgen.js) and `diagOk` (worldrt.js) skip it, so pathfinding and walking go through or around it.
- Bumping into it with keys, pad, joystick or drag shows the hint once per rival per map visit, then you walk through. A tap walk
  (pathfinding) passes through without stopping. Facing it and pressing A, or tapping it when you are near (the tap walks you beside it
  and talks, as for any actor), always shows the hint. It never starts a battle and never opens the fight window.
- The hint: speaker is the rival's name, the line is "This one waits for Kage. Bring Kage in your party to face it.", with Kage's
  portrait in the dialogue box (`WS.dlg.por`, drawn by a `renderWorldUI` wrapper). The duel lines in `duellines.js` were checked for
  something to reuse: the rival lines (`r`, `rw`) are spoken by the hero to the rival, so they only fit when the hero is there (they
  still play in the fight window and on the rewards screen). The hint is a short narrator line instead.
- Minimap and full map: a hollow star `☆` (`questghost`) drawn at 45% alpha (`MK_GHOST` in `map.js`) instead of the green `★`. The
  map legend calls it "Rival waiting for a wayfarer not in your party".
- Text: Guild Hall > Personal quests row adds "Needs Kage in your party." after "It prowls ...". The menu Quests tab gets a row per
  active rival ("Rival: <name>", the hero's portrait, where it roams, and the need). Guides > What next? gets "Rival: <name>" with
  "Needs Kage in your party." or "Kage is in your party: face it."

## Hero in the six

Draws as before (red aura and marker, full colour), is solid, bumping or A opens the fight window, Fight starts the elite battle.
The map star is the normal `★`.

## Rules kept

No save key changes (nothing new is saved: `WS.rgMap`, `WS.rgSaid`, `WS.inSrc` live only in memory). Nothing reads or advances the
game RNG (the shimmer uses the clock and `hashS` of the rival id), so the Daily Trial is unaffected.

## Code

- `v3/rivalghost.js` (new, after `duellines.js`): `rivalNeed(b)`, `ghostActor(a)`, `rivalNeedText`, `rivalNeedShort`, `ghostTalk`,
  `rgGhostCanvas`, `rgDraw2D`, `rgDrawHD`, `rgBump`, the `renderWorldUI` and `worldInputDir` wrappers, and the test handle `window.__RG`
  (`need`, `ghost`, `text`, `alpha.d2` / `alpha.hd`: the alpha each renderer last drew each ghost with, `actors`, `marks`).
- Call sites: `worldgen.js` `solidAt`; `worldrt.js` `diagOk`, `tryStepDir`, `actorTalk`, the 2D actor draw; `hd2d.js` `hdActors`;
  `map.js` `mapMarks`, `MK`, `MKN`, `MK_GHOST`, `drawMarks`; `p4party.js` `vPersonal`; `ui.js` Quests tab; `progression.js` `vNext`;
  `style.css` `.dlg.por`, `.dlgpor`, `.rgneed`.

## Tests

`tools/chrome/v080r.js` (from `tools/chrome`, `PWHTML=../../out/aurelis3.html`), at 390x844 and 933x705: ghost when Kage is out of the
six (2D alpha about 45%, HD-2D alpha about 45%), not solid, hollow star on the map, minimap star drawn dimmed, A shows the line with
Kage's name and portrait and no battle, the line not clipped, the bump hint then walking through with no battle, a tap path crosses the
tile, the Quests tab, What next? and Personal quests rows say "Needs Kage in your party", menus not clipped; with Kage in the six: solid,
drawn normally (no ghost alpha in either renderer), the normal star, A opens the fight window, What next? drops the need, the fight
starts; no page errors.
