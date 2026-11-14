# Keyboard mapping (v3/keymap.js)

- Action table `KM_ACTIONS` with defaults. Overrides live in `META.keys` as `{action:[key,...]}` (saved with `saveMeta`). Missing action = defaults; an empty array = unset.
- `kmIs(e,action)` tests an event (letters case-insensitive), `kmLabel(action[,n])` gives help text, `kmDir(e)` gives u/d/l/r, `kmHeld(action)` checks `KEYS_DOWN`, `kmMoveLabel()` gives "Arrows or WASD" or the custom keys.
- `KEYDIR` in ui.js is rebuilt in place by `kmRebuild()`; the ui.js handlers read directions through `kmDir`.
- Settings > Keys (popup `keys`, hidden unless `(pointer:fine)`): Change waits for the next key, Esc cancels, a key used elsewhere is moved. Reset to defaults clears `META.keys`.
- Defaults: up ArrowUp/W, down ArrowDown/S, left ArrowLeft/A, right ArrowRight/D, run Shift, interact Z/Enter/Space, menu M, map N, mute K, back Escape (Escape also opens the menu in the world when no popup is open).
- Never hardcode `e.key` for these actions; use `kmIs`.
- Several keys per action (battle pass 16): in the Keys popup, Add key appends the next key pressed (`kmAdd`, up to `KM.max` = 4; the key leaves any other action), a key chip removes that key while more than one is left (`kmDrop`), Change still replaces all of an action's keys with one (`kmSet`).
- The action button (`interact`) also continues prompts (`v3/battle16.js` `b16Key`, `b16Next`): the rewards screen, "The party falls", story cards, campfire talks and any popup whose only control beside the corner close button is one button. One press is one step (key repeat is ignored), the press does not reach the world under the popup, and Space does not scroll the page. Test: `tools/chrome/v189a.js`.
