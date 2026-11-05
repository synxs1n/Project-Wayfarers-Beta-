# Shops and menus pass (worktree for Beta v0.6.3)

The owner asked for five things from a Galaxy Z Fold (933x705 open, 390x844 folded): a separate place for charms at Alchemy, the same two-level tabs in every shop, dropdowns for every filter, menus that make more sense, and no cut-off text. GAME_VERSION and the changelog are untouched (the lead merges those). Save keys and db schemas are unchanged. New META.cfg fields are optional, and the Daily Trial is unaffected (`chrome/v063m2.js` checks the Smithy in a Trial).

## Status

| # | Request | Status |
|---|---|---|
| 1 | Charms in their own tab at Alchemy | Done: Alchemy > Shop > **Charms** section, which lists only charms. Potions, Cures and Travel have their own sections. |
| 2 | Shop and craft tabs in every shop, each with All and then sections | Done for the Smithy, Alchemy, Tavern, Guild Hall and Quest Board (table below). Back still steps up one level. |
| 3 | Every filter is a dropdown, plus new filters | Done: shop sort and show, roster, party bench, codex, Bestiary, Items, the equipment picker and Tempering. New filters: For (one hero), Rarity, Upgrades only, Can afford or craft, Cheapest first, Name, roster Show, Items Show, Bestiary Show and Region. |
| 4 | Reorganise shops and menus | Done: menu groups regrouped, Materials split off Items, long help text folded away in Tempering and the Bestiary, every shop title shows your gold, empty states share one style. |
| 5 | Cut-off text | Fixed: panels are sized from the visible viewport, and a test walks 70 screens at five sizes, with and without a browser bar. |

## 1 and 2: shop structure (`v3/menus3.js`)
Every shop draws two rows of navigation, the same two levels as the Menu. Main tabs sit in the gilt strip (`.chips.mgrp.stabs`). Section chips sit under them in the underlined row (`.chips.msub.ssec`), with a count on each one. "All" is always first and shows every section under its own heading.

| Shop | Main tabs | Sections |
|---|---|---|
| Smithy | Shop, Forge, Tempering, Sell, (Echoforge) | Shop: All, Weapons, Armor, Capes, Materials. Forge: All, Weapons, Armor. Tempering: All, Weapons, Armor, Capes, Charms. Sell: All, Weapons, Armor, Capes, Materials |
| Alchemy | Shop, Brew & craft, Sell, Pouch | Shop: All, Potions, Cures, Travel, Charms, Herbs, (Festival in relit towns). Craft: All, Potions, Charms, Travel. Sell: All, Charms, Herbs |
| Tavern | Hire, Kitchen | none |
| Guild Hall | Recruits, Quests, Natures, Arena, Guilds | Quests: All, Personal quests, Bounties |
| Quest Board | (one page) | All, Ready, Active, Open, Done (ready ones first in All) |
| Inn | (one page, unchanged) | none |

Capes have no Forge recipes, so the Forge has no Capes section. Materials buying is under Smithy > Shop > Materials, and selling them is under Smithy > Sell > Materials. Before, both were on one Materials tab.

**State.** The modal state is `V.modal.tab` (main tab) plus `V.modal.sec` (section, `'all'` when missing). `m3Norm(m)` maps the old ids so every old link and test still lands (`M3_LEG`):
- Smithy `weapons`, `armor` and `mats` go to Shop with that section, and `craft` with `cat` goes to the Forge section.
- Alchemy `relit` and `herbs` go to Shop > Festival and Shop > Herbs.
- Guild `personal` and `bounties` go to Quests with that section.

When the tab changes, the section resets to All. A fresh modal object keeps the section it names. Actions: `sTab`, `sSec` (new), plus `tab`, `wcat` and `gtab`, which still work. The Guild Hall tabs keep `gtab`.

**Back (`nav.js modalBack`, 1.5).** Each press goes up one level: a section goes back to All, a hero picked on Natures goes back to the hero list, a tab goes back to the shop's first tab, and the first tab leaves the shop. Esc and pad B do the same.

`mShop`, `mWorkshop`, `mTavern`, `mGuild` and `mBoard` are reassigned in `menus3.js`. They draw the Smithy plan button (3.3), the accept-all bars (allq) and the Guilds tab themselves, so the old string wrappers in `p3shop.js`, `allq.js` and `p4party.js` no longer run for these screens. The functions they call are unchanged. The factions rank strip and the guild text pass still wrap `vModal` as before.

## 3: dropdowns
`ddSel(label, action, prefix, options, current)` draws a labelled native `<select>` that is styled to the UI, at least 40 px tall, with a gold chevron and a focus ring. `ddBar([...])` lays them out in a grid that wraps.
- A change calls `ACT[action](prefix + ':' + value)`. These are the same actions and argument shapes the chips used (`shopF`, `lSort`, `lEl`, `lCl`), plus `lSh`, `lRg` and `tShow`. Focus returns to the dropdown after the re-render.
- On a gamepad, A steps a focused dropdown to its next choice, and `padFocus` includes selects. Typing in a focused select no longer triggers game keys, but Esc still goes back.

Filters are stored where they were before:
- `META.cfg.shopF`: `sort` (`best`, `rarity`, `ready`, `price`, `name`), `show` (`all`, `afford`, `usable`, `upg`), plus new `who` (a party hero id), `rar` (a rarity index) and `tsh` (Tempering: `all`, `ready`, `eq`, `spare`).
- `META.cfg.lists.<list>`: `s`, `el`, `cl`, plus new `sh` and `rg` for `roster`, `items`, `beasts` and `eqpick`.

`shopFBar(ctx)` replaces the chip bar (same name). `shopSortIds` and `recipeList` are wrapped once more, outermost, for For, Rarity, Upgrades only, Cheapest first and Name. `filterBar(n, codex)` in `party2.js` keeps its name and callers and now returns dropdowns. Its roster list adds Show: Everyone, In the party, Reserves, Unspent points, Hurt or ailing (`lshow` in `lmatch`).

## 4: menus
- **Groups.** Party (Party, Roster, Loadouts, Companions), Backpack (Equipment, Items, **Materials**), **Quests (Quests, Guild missions)**, Map, Records (Journey, **Lore**, Bestiary, Codex, Guilds, Music Room), Guides (What next?, Foe types, Hints, Help), Settings.
  - Guild missions moved from Guides to Quests, and Lore (the story so far) moved to Records.
  - Tab ids are unchanged. `pouch` is the new Materials tab, which used to be the end of Items.
  - Records still opens on Journey, and a group still remembers its last sub tab.
- **Shop titles** carry the purse (`.hgold`), because on phones the panel covers the world header.
- **Less clutter.** Tempering's long explanation and the Bestiary's rules are folded into "How tempering works" and "How the Bestiary works" (`details.m3how`), so the filters and lists come first. Empty lists use one style (`.note.empty`) with a hint about which filter to change.
- **Short landscape** (844x390): main tabs and sections share one row, and the dropdown labels sit beside their boxes.
- Wording follows the v0.6.4 decision: heroes outside the party are "Reserves".

## 5: cut-off text
- **Cause.** The panel was capped at `92vh`. On Android Chrome and in the app, `vh` counts the screen behind the browser and system bars, so the panel's bottom sat below the visible screen. The panel's own scroll ended there, so its last rows ("Also helps in your roster") were cut by the screen edge. The fixed backdrop had to be scrolled separately to reach them.
- **Fix.** `menus3.js` writes the visual viewport height to `--vvh`, on resize, viewport resize and orientation change. `menus3.css` caps `.box` at `min(92vh, var(--vvh, 100dvh) - 32px)` and centres it with `safe center`, so a tall panel never loses its top either.
- **"Wa..." in the header.** This is the world header's "Wayfarers" logo peeking out behind a centred panel. Its brand is hidden while a popup is open on screens up to 1000 px wide, and the shop title shows the gold instead.
- A row's text column may shrink (`min-width:0` on `.grow`) and long words wrap, so nothing pushes a row past the panel.

## Files
- New: `v3/menus3.js` (in `v3build.py` before `qready.js`; `pathguard.js` and `sprhd2.js` stay last), `v3/menus3.css` (built after `ui3.css` and part of the build ID hash).
- Edited:
  - `v3/nav.js` (back logic)
  - `v3/party2.js` (filterBar, lshow, lSh and lRg)
  - `v3/temper.js` (`temperList()` and `vTemper(opt)` with slot, show and bar; `vTemper()` with no argument works as before)
  - `v3/ui.js` (MENU_GROUPS, Items and Materials tabs, Bestiary filters, select-aware keys)
  - `v3/ui2.js` (gamepad and selects)
  - `v3/equip.js` (equipment picker filters)
  - `v3build.py`
- Test hook: `window.__M3` (`m3Norm`, `m3Tabs`, `m3Secs`, `MENU_GROUPS`, ...).

## Tests
- New: `tools/chrome/v063m1.js` covers item 5. It walks every menu tab and every shop tab and section, plus the Inn, the equipment picker and a hero sheet (70 screens), at 360x740, 390x844, 844x390, 933x705 and 1280x800.
  - Each size runs twice, once plain and once with a 110 px browser bar (the visual viewport shorter than `100vh`).
  - It fails on: a panel outside the visible screen, a scroll that cannot reach the end, sideways scroll, text cut by hidden overflow or an ellipsis, text outside the panel, or a dropdown whose chosen option does not fit.
  - It fails on v0.6.2 with the browser bar on every size (the owner's report) and passes now.
- New: `tools/chrome/v063m2.js` covers items 1 to 4: structure of every shop, Charms only in the Charms section, old ids, back one level at a time and Esc, no chip filter rows left, real `<select>` changes that are stored and remembered, For, Upgrades only, Rarity and Cheapest first, the roster, Items and Bestiary filters, the menu groups, the pinned Save button, and the Daily Trial.
- Updated expectations, only where the structure intentionally changed:
  - `v050p1e`: back from Tempering lands on `shop`, not `weapons`.
  - `smithywalk`: Esc from a sub tab lands on `shop`.
  - `v050p3a`: the default sort and the show filters are read from the dropdowns.
  - `v041p6`: the remembered filter is read from the selected option.
  - `v050p4`: the missions tab reads "Guild missions", and the Guild Hall has five tabs (Personal quests and Bounties are sections of Quests).
  - `tavern`: the Pork Chop Sandwich is on the Kitchen tab.
  - `v053ua`: no expectation changed. The touch target check now waits for the panel's 0.18 s entrance scale (0.975) to finish before measuring. Under load, the busier All pages could otherwise read 39 px buttons mid-animation.
  - `v040p3`: the new menu groups. The test still stops later at line 126 (`getImageData` on null), the same as on v0.6.2 before this pass; that is a canvas check outside the menus.
- Screenshots: `node tools/chrome/v063mshots.js [filter]` writes portrait, landscape and Fold shots of every shop (with a dropdown shown expanded) and the menu tabs to `tools/chrome/shots-v063m/` (not committed).
