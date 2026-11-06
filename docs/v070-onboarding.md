# v0.7.x onboarding: every system explains itself the first time you meet it

The owner's report: the game has many systems, a new player meets about 12 of them but learns half. Now each system shows one short card at the moment the player really meets it (the first primed foe, the first shield, the first tame offer, the first time Alchemy sells Camp Supplies), with **Got it** and **More** (More opens Guides > How it works at that system).

Code: `v3/onboard.js` (in `v3build.py` MODS after `battle3.js`, before `qready.js`; `qready.js`, `pathguard.js` and `sprhd2.js` stay last). It wraps existing functions only. Battle code (`battle4.js`, `battle5.js`, engine battle functions) is not edited; battle moments are read from the battle state by a 400 ms check. GAME_VERSION and the changelog are untouched. Content gates are unchanged (none of the pacing proposals in `v063-progression.md` were applied): this only teaches.

## Rules
- **One card at a time.** Moments join a queue in the order they happen. The next card waits about 1.1 s after the last one closes. A queued card whose moment has passed (the battle ended, the shop closed) leaves the queue without being marked seen, so it comes back at the next such moment. A card that was on screen for less than 2.5 s when its moment ended goes back too.
- **Never during a boss's first turn**: from the start of a boss fight until the boss has acted once and the party has had a turn after it. A card already up when that starts goes back to the queue. The first realm hints (p2world 2.7) follow the same rule.
- **Never in the Daily Trial.** The trial's twist already has its own box on the entry screen (`twists.js`); no new card was added there. `chrome/v050p2daily.js` still matches the v0.7.0 build exactly.
- **Not over stories, campfire talks, the title, save dialogs or the defeat screen.**
- **Battle cards need the commands to have come up once** (`B.pturns >= 1`) and no window open over the fight.
- **Where a card sits.** World: the 2.7 hint spot at the top of the screen. Any window (shop, menu, rewards): inside the window, under its title, so it never covers the window's content or buttons. Starter screen: just above the New Game+ modifiers. Battle: see below.
- **Look.** It is the 2.7 hint card (`#p2hint`, same panel, colours and hintPlace), labelled "Tip", with Got it and More. Two lines of text at most; texts are 70 to 95 characters, plain words, no hyphen strings. It closes by itself after 18 s.

## Battle placement
`hintPlace` (p2world.js) is replaced, so the first realm hints get this too:
1. Every box on the stage from the layout pass (`b3Lay(true)` in battle3.js: each unit's sprite body from its alpha bounds, the HP plates, primed badges, status rows, target tags, the turn arrow) is mapped to the page, plus the foe and hero cards, the commands, the boss bar and the sky chips.
2. The card tries 420 and 340 px widths (clamped to the stage), first clear of everything, then clear of sprites and cards only, topmost spot first, centred where possible, and only at widths where its text takes two lines.
3. On a crowded stage (short landscape screens such as 844x390) it becomes a slim card over the log line under the stage, buttons beside the text, still clear of every sprite.
4. The corner save note (`p5Avoid`) keeps clear of the card.

## Settings
- **Tips** (On / Off, `META.cfg.tips`, on by default) and **Reset tips**, at the end of Settings. An old save that turned the first realm hints off (`cfg.hints === false`) and never set Tips starts with Tips off, so nobody who asked for quiet gets new popups.
- Tips off also stops the first realm hints; the old **Hints** row stays for those alone.
- Reset tips clears the seen list and turns Tips on. Guides > How it works has the same two buttons.

## Saved state
New optional field `META.tips = {s:{id:1}, u:{id:1}}`: `s` the cards seen, `u` the systems used (Scan, Switch, Limit, Summon, Best Party, Equip best: reserves, Make camp, Bonds). Old saves have none. Save keys, slot keys, `aurelis-meta-v1` and the cloud profile doc are unchanged (the profile only carries best, codex, legends, facBest and archivist).

## Guides
- **Guides > How it works** (new tab `sysg`, after What next?): every system you have met, by group (Battle, Creatures, Party, Town, Later), each folded with a longer explanation and, where it helps, a button to the screen (Foe types, Bestiary, Taming log, Companions, Bonds, Best Party, Guild missions, Equipment, Lore). More opens the matching entry, open and highlighted. Opened from a shop or the rewards screen, Close (and Back) return to that window.
- **Guides > What next? > Not tried yet**: systems met but never used. Lines: "You have N Camp Supplies: Make camp from the Party tab" (Camp Supplies carried, no camp made), a tamed creature with no partner, campfire talks ready, Scan never used, Switch never used, Limit never used, Summon never used, no guild mission ever accepted, Best Party never opened, Equip best: reserves never used while reserves and spare gear exist, a charm in the pack with an empty charm slot. Each line goes once the system has been used. Tempering, crafting, personal quests, the Arena, bounties and quests were already listed in What next? and are not repeated.

## The cards
| system | moment (first time it is true) | card text |
|---|---|---|
| Elements | a hero hits a weakness (`B.hitWeak`) | Weak spot! Each foe has an element; when you aim, its tag says Weak, Neutral or Resists. |
| Foe types (archetypes) | a battle with a foe that has a type | *Foe* is *Flying*. A foe's type decides which kinds of hits work best on it. |
| Deliveries (kinds of hits) | the first ▲ or ▼ delivery text over a foe | ▲ over a foe: your kind of hit suits it. ▼: it glances off. Weapons decide the kind. |
| Shields and Break | a battle with a shielded foe (elite, Scourge, Calamity) | *Foe* has a shield (the diamonds). Weak hits and reactions crack it; at zero it Breaks. |
| Primers | the first primed foe | *Foe* is Primed with *Fire*! A Detonator of another element sets it off. |
| Reactions and Detonators | the first reaction (`B.nDet`) | *Melt*! A Primer then a Detonator makes a reaction: a big hit that cracks shields too. |
| Statuses | the first bad status on a hero or foe | *Name* has a status. Tap a hero or foe to read its icons; a Remedy cures bad ones. |
| Limit | a hero's turn with a full Limit bar | *Name*'s Limit is full! Its gold button now tops the commands: a big move. |
| Switching (Vanguard and Rearguard) | a Vanguard hero's turn below 40% HP with a Rearguard hero able to come in | *Name* is hurt. Switch trades them for a Rearguard hero, who acts at once. |
| Scan and Lore | the first command turn against an elite or boss not scanned yet | Scan shows a foe's exact stats and hidden quirk for half a turn. Lore explains the rest. |
| Summons | the first turn of a hero who can summon a companion | *Name* can Summon *Creature*: it fights in their place for a few turns. |
| Echoes | the first battle against an Echo | *Echo Name* is an Echo, a stronger form of a beaten boss. Its shards forge rare weapons. |
| Taming | the rewards screen offers a tame | *Creature* wants to join you! Tame it, then pair it with a hero who can summon it. |
| Companions | back in the world with a tamed creature that has no partner | *Creature* needs a partner. Pair it with a hero in Party > Companions. |
| The Tamer's Stick | the Quest Board with Wren's quest open or active | Wren's Tamer's Stick grows with every Bestiary entry. Log 6 creatures to earn it. |
| Bonds and campfire talks | back in the world after the first win side by side of a bonded pair | *A* and *B* won side by side. More wins bring a campfire talk, then a joint tech. |
| Make camp and boons | Alchemy first sells Camp Supplies (third realm), or Camp Supplies in the pack in the world | New here: Camp Supplies. In the field, Make camp from the Party tab for a heal and a boon. (in the world: You carry Camp Supplies. ...) |
| Reserves and Equip best | the world with a hero outside the party | *Name* is a Reserve, outside the party. Swap heroes in town from the Party tab. |
| Best Party and Training team | the Party tab while you have Reserves | Best Party suggests a party for this area. Training team helps heroes who fell behind. |
| Guilds and guild missions | back in the world after the first guild rank up | New rank with the *Guild*! Guild missions in Quests earn rank even faster. |
| Personal quests | the world when a party hero's personal quest is open | *Name* has a personal quest! Start it at the Guild Hall for a reward of their own. |
| Bounties | the Guild Hall while a bounty is posted | Bounties are elite beasts in the fields. Beat one for gold and a charm, maybe a tame. |
| Arena | the Guild Hall once an Arena tier is open and unbeaten | The Arena is open: waves of foes back to back for prizes. No fleeing, no rest. |
| Tempering | the Smithy when an equipped piece can be tempered now | Tempering raises gear by +1 with parts and gold. Look in the Tempering tab. |
| Crafting | the Smithy or Alchemy when a recipe can be made now | Smithy: Your materials can become gear here. Open the Forge tab to see what you can make. Alchemy: Your herbs and parts can be brewed here. Open Brew & craft to see what you can make. |
| Charms | the world with a charm in the pack | You found a charm! Each hero has one charm slot. Equip it in Backpack > Equipment. |
| Echoforge | the Smithy once its Echoforge tab is open | The Echoforge tab turns Echo Shards and Essence into Echoforged weapons. |
| Legends | the Quest Board with a legend quest open or active | A legend quest! Follow its steps to meet a Legendary wayfarer who may join you. |
| New Game+ modifiers | the hero picking screen of a New Game+ cycle | Modifiers add risk for more reward for this whole cycle. Pick up to 2, or none. |
| Daily Trial twist | the trial's entry screen (existing twist box) | no new card; Guides > How it works explains it |

Existing first realm hints (p2world 2.7: sheet, types, flyer, primer, weapons, armor, rest) are unchanged and share the one card spot with these.

## Tests
- `tools/chrome/v070oa.js` (52 checks): every system's moment (off before, on at the moment, off when its window closes), battle moments wait while a window is open over the fight, a card fires once and never again, the seen state in `META.tips`, two moments give one card and the second after the gap, a moment that passed leaves the queue unseen, Tips off shows none (first realm hints too), Reset tips brings them back, old saves with hints off start with tips off, a shop card sits inside the shop, More opens How it works at that system and Close returns to the shop, What next? "You have 3 Camp Supplies: Make camp from the Party tab" and that it goes once camp is made, the Settings rows, no card in a boss's first turn, none in the Daily Trial.
- `tools/chrome/v070ob.js` (28 checks): at 390x844, 844x390, 933x705 and 1280x720, random battles (1 to 6 heroes, 1 to 5 foes, flyers, statuses, effect texts): the battle card never overlaps a sprite (alpha bounds measured independently, as in v063ba, and the b3Lay body boxes), a foe or hero card or a command, stays on the stage or the log line under it, two lines at most, nothing cut. World card, shop card, How it works (every entry open, end reachable) and the New Game+ starter card fit with nothing cut.
- Still passing: v050p2b, v051a, v063m1, v063m2, v063g, v063ba, v041p6, liveupdate, v050p2daily (against the v0.7.0 build).

## Wording
Follows the owner's v0.7.1 decision: the party's front three are the Vanguard, the back three the Rearguard, heroes outside the party the Reserves.

## Not done / notes
- The pacing proposals are left for the owner. The cards make realm 1 a little busier, but each waits for its own moment (opening the shop, the first shield), so the first town no longer explains everything at once.
- Battle moments are polled every 400 ms, not hooked into battle code, so a card can appear up to half a second after the moment.
