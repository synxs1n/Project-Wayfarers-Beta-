# Save sync between devices (v0.8.5 pass)

The report: "If I switch from the phone app to Windows or the webpage, the save is not the most recent one from the phone."

Code: `v3/saves.js` (cloud section), `v3/cloud.js` (Firebase `txn` and server time), `v3/p5settings.js` (5.2 now only keeps `p5FlushNow`), `v3/config.js` (`SAVE_UI`), `electron/main.js` (save before the window closes). Tests: `tools/chrome/v085s.js`, `tools/chrome/v085s2.js`, shared cloud mock `tools/chrome/syncmock.js`.

## What was wrong (all confirmed in the code)

1. **Leaving a device lost the newest progress.**
   - `saveGame` only runs at events (battles end, travel, rest, shops, equip, doors...). Walking, steps, play time and position were only in memory, so the local slot was often behind what the player saw.
   - The autosave only marked the slot dirty; the push waited a 6 s debounce.
   - On `visibilitychange: hidden` / `pagehide`, `p5FlushNow` pushed only when something was already dirty, `SV.db` was ready and no pass was running (`SV.busy`); it never saved the current journey first. When a pass was in flight the leave push was simply skipped.
   - A push takes about six sequential round trips (read, read the old copy, read the history doc, write history, write save). Android suspends the app right after it goes to the background, so the push often never finished.
   - `svFlush` and `svInit` cleared the dirty flag after `svCheck` returned, so a save made while a pass was running was marked clean without being pushed.
2. **Opening another device opened the old local copy.** `svInit` ran on a fixed 2.8 s timer (and on Firebase it then waited for the SDK and auth, often several seconds more). Continue did not wait: the old local save opened, the slot became "live", and when the cloud was newer `svCheck` could not pull a live slot, fell into the `div` branch and set `SV.hold[slot]=1`. Held slots were skipped by every later pass, so that session never pulled or pushed the slot again (and the player's new progress on that device stayed local too).
3. **A client left open never looked again.** `svInit` ran once per page; `visible` only flushed dirty slots. A Windows app or browser tab left open kept its old copy forever.
4. **Clocks decided.** The newer side was picked from `savedAt`, which comes from each device's clock (with a progress check). A phone whose clock was a few minutes off could lose to an older save, or a fast clock could make an old save look newer.

Also found: Electron's user agent no longer says "Electron" (main.js strips it for Google sign in), so nothing in the page could tell it runs in the Windows app; closing the window killed any push in flight.

## What changed

### Who wins (`svDecide`)
- Each device remembers, per slot, the cloud version it last matched (pushed, pulled or found equal): `aurelis-sync-v1` `{u, b:{slot:hash}, k:{slot:hash}, sk}`. Reset when another account signs in.
- Local unchanged since then and the cloud changed: **pull**. Local changed and the cloud did not: **push**. No clock involved, so skew cannot matter in the normal "play here, then there" flow.
- The cloud doc carries `par` (the cloud hash it replaced): a cloud copy made from exactly this device's copy is pulled.
- Only when both changed (or nothing is known, e.g. the first run after this update) do progress and time decide: progress dominance now includes play time; if one side has at least as much of everything and the other does not, it wins as long as the clocks disagree by less than 15 min; otherwise the time decides only when it agrees with progress, else the player is asked (title: the existing "which save is right?" modal; in a journey: the new prompt).
- Times are put on the server clock: writes through Firebase carry `srvAt` (server timestamp) and `pushedAt` (the writer's clock at commit), so `srvAt - pushedAt` is the writer's offset; a device learns its own offset from its own docs (`SV.skew`).
- **Never overwrite a newer cloud save:** on Firebase the history copy and the new save are one transaction (`DB.txn` in cloud.js) that only commits while the cloud still holds the version the decision was made on; otherwise it fails with `changed` and the pass looks again. A push that resumes late after the app was frozen therefore cannot land over a newer save. The claude.ai db has no transactions: there the writes stay sequential (history first, chunks before the main doc) after the fresh read in the same pass.
- History of the last three replaced cloud versions per slot, local backups before a pull: unchanged. `svPush` reuses the doc it already read (one read less; the old data comes from the doc itself unless it is chunked).

### Leaving (`svLeave`)
- On `visibilitychange: hidden`, `pagehide`, `freeze`, window `blur`, document `pause` (Capacitor/Cordova) and the Capacitor `App` plugin `pause` / `appStateChange` (used if the plugin is installed; it is not in package.json yet, the document events and visibility cover the Android WebView): save the journey first when it is safe (world screen, no battle, no transition; only if it differs from the stored copy), then push at once, bypassing the debounce. In a battle the slot keeps the pre-battle save (the last save before the fight) and that is pushed.
- If a pass is in flight, another pass is chained right after it (`SV.again`), never dropped.
- Windows app: `electron/main.js` holds the window close, calls `window.svBeforeClose()` (save, push, wait until it landed, at most 3.5 s), then closes (4 s cap). Needs the next installer build; the site part works at once.
- The Firestore web SDK has no keepalive or beacon option for writes, and offline persistence was not turned on on purpose: a write queued in IndexedDB by a killed app would land later, possibly over a newer save from another device. Instead the leave push is started immediately and is two round trips on Firebase (read, one atomic commit).

### While playing
- Debounce `SAVE_UI.syncDelay` 6 s to 2 s, and `SAVE_UI.syncMax` 30 s: saves that keep coming still push at least every 30 s.
- The dirty flag is cleared before the read, and restored on an error, so no save is lost by a pass that was already running.

### Opening a device
- The first pass runs 400 ms after the page has loaded (cloud.js has set up the account by then; on Firebase it waits for auth inside `capOf`), not on a 2.8 s timer.
- Continue and loading a slot (`ACT.cont`, `ACT.slotLoad`) wait for that first pass with a "Checking cloud saves…" panel, at most `SAVE_UI.cloudWait` 6 s ("Use this device now" skips), then open the slot; a slot flagged as different opens the choice instead. Skipped when the account is local only, offline, the slot was changed on this device this session (import, restore) or the slot cannot be read.

### Coming back and staying open
- `visible`, `focus`, `pageshow` (from the back/forward cache), document `resume` and the App plugin `resume` re-check every slot.
- Every 60 s (`SAVE_UI.recheck`) while the page is visible, title or journey, every slot is compared again.
- At the title a newer cloud save is pulled silently (with a backup) and the title refreshes.
- With a journey open on that slot nothing is switched under the player: once they are free (world screen, no menu, battle or transition) the prompt "A newer save from <device>, <time> exists for slot N" offers **Load it** (this device's journey is saved, backed up, then the cloud copy is pulled and opened) or **Keep this one** (this device's journey is saved and uploaded, the cloud copy goes to the cloud history). While it waits the slot is held against that cloud version only: autosaves stay local, and a further change in the cloud is decided again.
- "Decide later" on the title choice no longer pops up again every minute for the same cloud version.

Save keys and doc fields are unchanged; new optional fields: `par`, `srvAt` (cloud doc), and the new local key `aurelis-sync-v1` (skipped by Recover Saves).

## Test matrix

Run one at a time from `tools/chrome` with `PWHTML=../../out/aurelis3.html`.

| Test | What it covers | Result |
| --- | --- | --- |
| `v085s.js` | A plays with unsaved progress, goes hidden and is killed 1.2 s later: the progress is in the cloud (well under 1.2 s) and the old cloud copy is in history. B taps Continue right after opening: "Checking cloud saves", then A's save opens, nothing held, nothing older pushed. B left on the title gets A's newer save within 60 s. B with a journey open: focus shows the prompt naming A's device; autosaves while it waits do not upload; Load it opens A's save and backs up B's. Both changed: B is asked, nothing overwritten while asking; Keep this one uploads B's, A's is in the cloud history (3 entries kept), A reopened gets B's and keeps its own as a backup. No page errors. | pass |
| `v085s2.js` | Clock +10 min on P, -10 min on Q: Q's newer save stays and P opens it; Q learns its offset from the server time. A fresh device with a fast clock and an older save takes the cloud save (backup kept); a fresh device with a slow clock and more progress is uploaded (old cloud in history). Offline: saved and queued, no writes; online: synced. A push in flight when leaving: the second push lands the latest progress. A stale push is refused by the atomic write. A journey open on a slot another device changed is asked, Load it works. Saves every second still reach the cloud within 30 s. Document `pause`, the Capacitor App `pause`, and `svBeforeClose` (Windows close) push. Leaving in a battle keeps the pre-battle save. A db without txn (claude.ai) still restores, pushes and gates Continue. No page errors. | pass |
| `savesys.js` | Save recovery, backups, import/export, first upload, debounce, divergence, newer cloud wins, offline, db failure, visitors, chunks. Test 1 now waits 1.5 s before Continue (Continue waits for the first cloud check by design). | pass |
| `v050p5.js` | 5.2 auto sync, hide push, visitors | 5.2 checks pass; the two title brand checks fail the same way on the unchanged v0.8.4 build (not part of this pass) |
| `v050p5c.js`, `liveupdate.js`, `v041p6.js`, `v071a.js`, `v063wb.js` | unchanged behaviour | pass |

Two-device harness: `syncmock.js` keeps the cloud in node and gives each page `doc().get/set/delete` and `txn` through `page.exposeFunction`; each device is its own browser context (own localStorage) and can be reopened like an app restart. Options: `skew` (ms added to `Date.now`), `noTxn`, `seed` (localStorage items), `prejs`. `pw.js` gained `opt.browser`, `opt.mock`, `opt.before`, `opt.tag`.

## Limits
- If Android kills the app within the first few hundred ms of going to the background, or the device is offline, the progress stays on the phone until it next opens online; it is never lost, and the other device then asks or follows the base rules once it arrives.
- Two devices playing the same slot at the same time cannot be merged: one is asked to choose, and the other version is always kept (cloud history or local backup, see Recover Saves).
- The claude.ai db has no transactions or server time: there the check and the write are separate, and times use device clocks (the base rule still avoids clocks in the normal flow).
