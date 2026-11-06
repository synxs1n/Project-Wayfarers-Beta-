# v0.9.5 nudges: lead players into the systems

The owner's principle: depth is optional and the auto tools let anyone skip it, but the game should lead players into the systems. The auto penalty exists to push manual play; it stays, shown in a smarter way. Five changes, all tunable in the `NUDGE` block at the end of `v3/config.js`. Nothing here runs in the Daily Trial. GAME_VERSION and the changelog are untouched.

Files: `v3/prog2.js` (auto rules, battle counters), `v3/results.js` (rewards screen), `v3/onboard.js` (tip cards), new `v3/goals.js` (Next goals panel, in `v3build.py` MODS right after `onboard.js`), `v3/autoset.js` (one sentence in Auto settings), `v3/config.js` (NUDGE), `tools/fullsim.js` (models the auto lock). Test hooks: `window.__GL` (goals) and `window.__NZ` (the rest), both separate from `__A`.

## 1. The auto cut becomes a manual bonus
Same economy: `autoRewardMul` and `AUTO_REW = .66` are unchanged, so a hand played win pays exactly what it paid before and an auto win pays 66% of that (test: the same seeded fight in the old and new builds gives the same gold and XP, by hand and on auto).
What changed is the framing. The rewards screen counts from the auto level up: a hand played win shows a gold line **"+52% for playing it yourself"** (52 = 1/AUTO_REW - 1) with the XP and gold that part is worth. The old "Won mostly on auto: 66% XP and gold" note is gone; an auto win instead shows a muted "Won on auto: play a fight yourself for +52% XP and gold." Auto settings say the same. The 52% part counts only the battle gold (bounty and arena prizes are fixed sums).

## 2. A bonus for using the systems
`B.nz` (set at each battle start in prog2.js) counts, for the party: reactions set off (a wrapper on `doReaction`, hero side only; the battle helper's `B.nReact` is not needed), shields broken (`chipShield`), telegraphed hits taken while guarding (a Crushing Charge or a Cataclysm from battle4.js landing on a guarded hero, read in the `perform` wrapper), and a Momentum Surge reached (`B.b4mo.full`). Taming is added on the rewards screen when the player presses Tame it.
Each system used pays `NUDGE.sys[k]` (5%) of the win's XP (each hero gets 5% of what they gained in it) and of its battle gold, once per battle, at most `NUDGE.sys.cap` (25%) per battle. The rewards screen lists one line per system under the rewards grid ("Reaction set off +5% XP and gold", ...) and a total ("the most one battle pays" at the cap). Auto wins earn them too; auto rarely triggers them. Bonus XP that crosses a level shows on the hero's row like any level up, and new skills join the list.

## 3. Auto unlocks per foe type
An ordinary fight allows auto when every foe type in it is open: beaten by hand `NUDGE.autoKills` (3) times this journey, or scanned. A win counts as by hand when auto ran at most half the hero turns (the same rule as the reward). Kills count when the whole fight is won (arena waves together). Bosses, Calamities, Echoes and legend fights keep the old rule (win that fight by hand once) and elite, miniboss and challenge fights still never allow auto.
- The Auto button reads "Auto locked" with the reason: "Beat a Frost Wolf by hand 2 more times to auto it" (plus "and N more foe types" when several are locked). Pressing it shows the reason in a toast.
- When a type opens: a toast "Auto unlocked against Frost Wolf." and a line on the rewards screen. Scanning a foe opens its type at once ("Scanned: auto unlocked against ...").
- Saved per journey in the optional field `G.autoOk` {foe name: hand kills}. A save without it (made before v0.9.5) starts from the account Bestiary: every foe with 3 or more kills or a scan is open, so nobody loses auto they had. A new journey starts empty.

## 4. Tip cards as invitations
Battle cards are now one line actions with a reason, for example:
- "Primed with Fire: try Mira's Gale Burst on Frost Wolf." (names a hero and a detonator the party knows that sets it off; otherwise "Frost Wolf is primed with Fire. Try a Wind Detonator on it.")
- "Thornwarden has a shield. Hit its weakness or set off a reaction on it to Break it."
- "Weak spot! Aim where the tag says Weak: more damage, and shields crack."
- Limit, Switch, Scan, Summon, Statuses, Foe types and Kinds of hits read the same way.
Basic cards show for everyone, as before. Expert cards (`x` in TIPS) wait until the player has opened that system once (recorded in `META.tips.u`): **Reactions in depth** (new; after Lore was opened: "Wildfire also burns. Every element pair reacts its own way; Lore lists all 28."), **Tempering** (after the Smithy's Tempering tab), **Echoforge** (after its tab), **guild ranks** (after the Guild Hall), **New Game+ modifiers** (after a modifier was tried). The gate is applied in the queue (`obEval`), so each card's own moment is unchanged. The Tips switch, Reset tips and Guides > How it works are unchanged.

## 5. Next goals
A compact list in the world view, 2 to 4 goals: the next story step and up to three system goals.
- Story: "Head out into <realm>", "Find the Scourge's lair in <realm>" (the Calamity's in the last realm), "Defeat the Scourge in the <dungeon>".
- System goals, offered in this order when they make sense and the player has not done them: Hit a foe on its weak spot, Win a fight without auto (after an auto win), Set off 3 reactions (once the party knows a primer and a detonator), Scan a foe, Take a quest from the board, Switch in a Rearguard hero (with more than three heroes), Break a foe's shield (level 7 or the second realm), Tame a creature (level 8 or the second realm), Beat a bounty (level 5 with one posted), Guard against a big hit (after a telegraph was seen), Reach a Momentum Surge (after 8 battles), Pair a companion, Temper a piece of gear (when tempering is open), Take on a guild mission (after the first Scourge), Make camp in the field (third realm). Counted goals show progress ("Set off 3 reactions 2/3") and count from when they were shown.
- Done: a toast ("Goal done: Set off 3 reactions. +40 gold, XP, Ether."), paid once: `NUDGE.goals.gold[realm]` gold (40 to 240), 5% of a level of XP for each party hero, and an item for some goals (Ether, Remedy, Potion, Camp Supplies). The next goal takes its place.
- Panel: top label "Next goals" folds to a small "Goals N" chip (remembered in `META.cfg.goalsMin`). It sits in a free corner of the view (bottom first, the save note lives top left), checked every 350 ms: never over the hero (the HD-2D hero box when that view is live, else the 2D camera), the stick, the A/B buttons, the minimap, the area banner, a dialogue line or a first realm hint card; if the full list does not fit it shows two goals, then the chip (which then opens What next?). Hidden in battle, with any window open and during dialogue. The save note keeps clear of it.
- Guides > What next? starts with the same goals and their rewards.
- Saved in the optional field `G.goals` {a: shown, d: done, c: counters, b: counter at the time a goal was shown}. A save without it marks every goal it already met as done without paying. Deterministic: no random calls; the list order decides.

## Economy
`SEED=1 node tools/fullsim.js journey 8` (the time model now charges a fight whose foe types are not open yet as a manual fight, and pays it at the manual rate; `NUDGE.on=false` reproduces the old numbers exactly):

| build | top level mean | range | hours typical | fights | by hand while auto was not open |
|---|---|---|---|---|---|
| before (v0.9.4) | 39.9 | 39-42 | 4.27 | 195 | 0 |
| after (v0.9.5) | 41.4 | 40-43 | 4.36 | 195 | 50 |

24 runs (more spread: a few runs hit a boss wall and grind): before 40.5 (38-45) / 4.97 h / 235 fights, after 41.9 (39-48) / 5.17 h / 239 fights.
Fights and boss tries are unchanged (195 and 10.6 over 8 runs). The level goes up about 1.5 (the system bonuses, goal XP and the fights forced to manual pay), inside the 38 to 42 band. Hours go up 2% (8 runs) to 4% (24 runs): the about 50 fights per journey that must be played by hand before their foe types open are timed as manual fights. That is within the run to run spread (sd about 0.3 h over 8 runs) but it is a real cost of the lock; `NUDGE.autoKills` is the lever (autoKills 1: 19 such fights, 40.3 / 4.33 h over 8 runs, 41.5 / 5.11 h over 24; autoKills 2: 37 fights, 41.6 / 4.64 h and 41.9 / 5.15 h).
First try was +6% per system, cap 30% and goal XP 8% of a level: 41.5 / 4.53 h over 8 runs, so the shares came down to 5%, 25% and 5%.

## Tests
- `tools/chrome/v095na.js` (OLDHTML = the previous build): manual and auto totals equal the old build; the +52% line and the auto line; the counters from the real functions; four bonus lines at +20%, the extra gold and XP, a tame to the 25% cap, the cap cutting a larger share, auto wins earning them; the auto lock text, button and toast, the countdown 3/2/1, the unlock toast and rewards line, auto wins not counting, scan unlocking, an old save keeping access from its Bestiary, the boss rule; Auto settings; basic tip texts; each expert card waiting for its system.
- `tools/chrome/v095nb.js`: the panel shows 2 to 4 goals with the story first; fold and unfold; What next?; hidden under windows; a done goal pays once with a toast and is replaced; the story moves on to the lair; progress and an item reward; an old save marks met goals without pay; nothing in the Daily Trial; at 390x844, 412x812, 844x390 and 933x705 with the hero walked over 25 spots of the map, the panel stays in the view and never covers the hero (measured independently), the stick, A/B or the minimap; no page errors.
- Still passing: v061a, v075a, v082s, v070oa, v070ob, v071a, v041p6, v050p4, liveupdate, v063wa, v050p2daily (OLDHTML = `git show HEAD:index.html`, the v0.9.4 build).
- Two existing tests changed with the design: `v070ob.js` marks Tempering and the New Game+ modifiers as opened before checking where their cards sit (they are expert cards now), and `v071a.js` leaves its fight with `finishBattle` instead of `A.B=null` (a no-op on the getter; the fight against new foe types now locks Auto, so pressing Auto there did nothing).
- Battle cards: a tip that still needs three lines in the slim card over the log line (short landscape stages) takes a smaller type (`#p2hint.ob.slim.tight`), so it stays at two lines.
