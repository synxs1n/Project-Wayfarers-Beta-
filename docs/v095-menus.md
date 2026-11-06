# Menus pass v0.9.5: Notice Board, three guild ranks, Upgrade button

The owner approved four changes. The aim is to keep depth optional (the auto tools let anyone skip it), lead players into each system, and make the menus simpler to get around. GAME_VERSION and the changelog are untouched. Save keys and data formats are unchanged, and nothing here runs in the Daily Trial.

| # | Request | Status |
|---|---|---|
| 1 | One Notice Board for quests, guild missions, bounties and the arena | Done (`v3/menus3.js`) |
| 2 | About three ranks per guild, no perk lost | Done (`v3/factions.js`) |
| 3 | One Upgrade button per gear slot | Done (`v3/p3shop.js`) |
| 4 | Build Party and Equip best come first on the Party and Equipment tabs | Done (`v3/nav.js`, `v3/equip.js`) |

## 1. The Notice Board (`menus3.js`, NB_*)
The board has four tabs: **Quests, Guilds, Bounties, Arena**. The owner's list said "Guild". The tab reads "Guilds" because it holds all six guilds, and because the Guild Hall test (`v050p4`) expects a tab named Guilds.

Each tab has its own sections. Every list shows claimable rows first, then rows under way, then open ones, and a ready row carries a Ready tag.

| Tab | Sections |
|---|---|
| Quests | All, Ready, Active, Open, Done, Personal (personal quests also appear under All once a hero has one) |
| Guilds | All, Ready, Active, Open. All also shows "Ranks and perks": one card per guild |
| Bounties | All, Active, Open, Done |
| Arena | none (the Echoes note sits under the arena list) |

The same bodies (`nbBody(tab, sec)`) are drawn in three places:
- **The town board building** (`{type:'board'}`): its own four tabs. It opens on Quests.
- **The Guild Hall**: the four board tabs, then Recruits and Natures. It opens on Guilds (`M3_HOME.guild = 'guilds'`).
- **Menu > Quests**: the group's tabs are now Quests, Guilds, Bounties and Arena (menu tab ids `quests`, `factions`, `qbounty`, `qarena`; `NB_MENU` maps them to the board tabs). The sections sit under the menu's tabs (`.chips.nbsec`). `ui.js mMenu` asks `nbMenuBody(m)` for these tabs. Records no longer has its own Guilds tab, because it moved here.

Accept all and Claim all are still there: `qAcceptAll`/`qClaimAll` on Quests, `bountyAll` on Bounties, `facAcceptAll`/`facClaimAll` on Guilds (`allq.js`; the bar comes from the `vFacMissions` wrapper, and the old `vFactions` wrapper was removed so the bar shows only once).

**Claiming from the menu.** Quests can be accepted and claimed from the menu anywhere, because the board is the same in every place. The qready toast now points to "the Notice Board (Menu > Quests)". The one exception is the arena: its Enter buttons are disabled in the menu outside a town, with a note to enter from any town.

**Old ids still land** (`M3_LEG`, `m3Norm`):
- Guild Hall tab ids: `personal` goes to Quests > Personal and `party` goes to Recruits. `quests`, `bounties`, `arena`, `guilds`, `recruit` and `nature` are tab ids of their own.
- `{type:'board', sec:'ready'}` lands on Quests > Ready.
- Menu `fmis`, from `ACT.menuTab` or a direct `V.modal`, lands on Quests > Guilds.
- `gtab`, `sTab` and `sSec` work as before. The shops' rank strip button still calls `menuTab('factions')`.

Back (`nav.js modalBack`) still goes up one level: a section goes back to All, a tab goes back to the home tab (Quests on the board, Guilds in the Guild Hall), and the home tab leaves.

**Ready counts (`qready.js`).** The Menu button and the Quests group chip carry the total ready count. Inside the group, the Quests and Guilds tabs carry their own counts. The old regex that tagged menu rows is gone, because the rows tag themselves.

## 2. Three ranks per guild (`factions.js`, FAC3)
Standing still climbs the six old steps. `facRank`, `REP_AT`, `META.facBest`, `G.fac.seen` and the claim keys `'id:step'` keep their meaning, and `G.fac` keeps its shape with no new fields.

The player sees three ranks: step 1 is rank 1, steps 2 to 4 are rank 2 (at 40 standing), and steps 5 and 6 are rank 3 (at 400 standing). `facTierOf(step)` maps one to the other, and `facTier(id)` gives a guild's current rank.

Every old perk now belongs to the rank that holds its step (`facPerks` returns every perk of the ranks reached). A perk therefore opens at the same standing as before or earlier, so nobody loses one. Perks of the same kind merge, and the best one counts:

| Guild | Rank 2 (40) | Rank 3 (400) |
|---|---|---|
| Wayfarers' Guild (Recruit, Pathfinder, Guildmaster) | Inn 10% less, battle gold +5%, a challenge only wayfarer | Guildmark Pin and Guildmaster's Seal, title |
| Smiths' Union (Apprentice, Journeyman, Grandsmith) | Tempering 10% less, 10% of forging gold back, Union counter | Anvilmark Charm and Grandsmith's Hammerpin, title |
| Alchemists' Circle (Initiate, Distiller, Archmage of Vials) | 15% of brewing gold back, Circle counter | 15% chance of an extra brew, Vialmark Charm and Archmage's Phial, title |
| Beastwardens (Pup, Handler, Warden of Wilds) | XP +5%, Warden counter | Wildcall Charm and Wild Heart, title |
| Archivists (Reader, Cataloguer, Keeper of the Last Page) | XP +3%, Archive counter, a challenge only wayfarer | Inkmark Charm and The Last Page, title |
| The Steady Hand (Onlooker, Sure Hand, The Steady Hand) | XP +2%, battle gold +3%, inn 5% less | Steady Knot and The Steady Hand, title |

Rank 1 everywhere: "Take the guild's missions and earn standing."

**Claims.** One Claim per rank hands over every charm of that rank that has not been claimed, under the old keys. An old save that claimed only the step 5 charm sees Claim for the step 6 charm and gets just that one. A claimed recruit (`guild:4`, `archive:4`) stays claimed. `ACT.facPerk('id:step')` with an old key still works.

**Rank gates.**
- Missions open by rank: `facTierOf(m.r)`, so the old step 3 and 4 missions show from rank 2.
- Missions still count everything done on the journey, as in v0.7.7.
- Counter stock is sold from the rank that holds the old stock step.
- The Archmage's extra brew needs rank 3.

**Messages and titles.**
- The rank up toast names the rank and its line.
- Account titles show for rank 3 (META.facBest step 5 or more).
- The shop rank strip shows the rank name and its line. The Notice Board building no longer carries a strip.

**Note.** Other modules that read `facRank` (onboard's "New rank" tip at step 2, the music rank jingle) are unchanged. Step 2 is where rank 2 now starts, so the tip lines up. The jingle can still play at the invisible steps 3, 4 and 6.

## 3. The Upgrade button (`p3shop.js`, upg*)
`upgOpts(c, slot)` lists every single next step for one hero and one slot:
- equip a better spare from the pack;
- buy a piece (Smithy stock, or Alchemy charms for the charm slot);
- forge an open recipe;
- temper the worn piece. If ore, logs or parts are missing and the Smithy sells them, buying them is part of the step and its gold;
- Echoforge a tier 6 weapon, from the pack or the one worn.

The gain of each step is the change in the hero's gear score (`gainFor`/`loadoutScore`, the same score Auto best gear and "Best for party" use).

`upgBest` picks the step with the most gain among those the player can pay for now. On a tie it takes less gold, then fewer materials, then pack before buy before forge before temper before Echoforge. It also names a "Save up for" goal when a better step is out of reach.

Two limits:
- Shop steps need a town. Away from town only pack spares count, and the popup says so.
- Tempering follows the pacing gate in `pacing.js` (`pcTemperOpen`).

Where the button appears:
- **Hero sheet.** Each of the four slots has an Upgrade button showing the gain (`Upgrade +23%`).
- **The popup** (`{type:'upg', cid, sl}`). It shows the piece worn now, the best next step with its tier, gain, stats before and after, and cost (materials and gold), plus the goal line. Its buttons are **Upgrade: N gold** (one tap does it and equips the result), **Show all options** and Back.
- **Show all options** opens, in town, the Smithy at the matching list: Tempering for a temper, Echoforge, the Forge for a recipe, the Shop section of the slot, or Alchemy for charms. Away from town it opens the gear picker. Back comes back to the popup.
- **The Smithy's Shop tab** starts with "Best upgrade for each slot": weapon, armor and cape, each for the party hero it helps most, with a one tap gold button. Then come **Upgrade whole party** (the old Smithy plan `p3Smith`, renamed from "Buy, craft and equip best gear"; the Forge tab keeps it too), the filters and the shelves.
- **Alchemy > Shop > Charms** starts with the best charm step.

`upgDo` works out the best step again before acting. If it changed, the player gets a toast and a fresh screen instead.

The best per slot rows use their own action (`upgDo`) and classes, so the shop rows that `v050p3a` and `v063m2` read (`buyGear`, `.shoprow`) are unchanged.

## 4. Team help first
- **Party tab.** The first buttons are Build party (gold), Equip best: party (`autoEqParty`) and Equip best: reserves (`autoEqCamp`, disabled with no reserves), then Field skills, Bonds and Make camp.
- **Equipment tab.** The buttons come before the note: Build party, Equip best: party, Equip best for everyone, Equip best: reserves.
- "Auto best gear: party" is now called "Equip best: party", on its summary too.
- The auto battle settings are where they were.

## Files
- `v3/menus3.js`: Notice Board (NB_TABS, NB_MENU, nbSecs, nbBody, nbMenuBody), Guild Hall and board screens, the menu's Quests group, the Smithy's best per slot list.
- `v3/menus3.css`: board sections, guild cards, Upgrade styles.
- `v3/factions.js`: FAC3, facTier, ranks and claims, the screens.
- `v3/allq.js`: no bar on the ranks page.
- `v3/qready.js`: counts per tab, the board wording.
- `v3/p3shop.js`: Upgrade (upgOpts, upgBest, upgApply, mUpg, upgBtn, upgSlotsHtml) and the renamed whole party plan.
- `v3/nav.js`: home tabs, eqPick back to Upgrade, Party tab buttons.
- `v3/equip.js` and `v3/equip2.js`: the Equipment tab buttons and the label.
- `v3/ui.js`: mMenu asks nbMenuBody; the old quests body was removed.

## Tests (`tools/chrome`, run one at a time with `PWHTML=../../out/aurelis3.html node <file>`)
New tests:
- `v095m1.js`: board tabs and sections in all three places, the Guild Hall opening on Guilds, every old id, Accept all and Claim all (quests, bounties, missions), claimable first, back one level, arena Enter only in town, and the ready counts.
- `v095m2.js`: three ranks with one line each, steps mapped 1,2,2,2,3,3, and no perk lost at any standing (each old perk present, no number lower). It also loads an old save with old claims (G.fac fields unchanged, claims kept, only the missing charm claimable once) and checks the thresholds, the toast, the double charm claim, counter stock, mission progress and the Daily Trial.
- `v095m3.js`: a brute force really performs every single step on a plain copy of the journey, for 5 heroes x 4 slots x 5 purses. It checks that the Upgrade pick is the best gain the player can pay for, for no more gold. It then presses Upgrade and checks gold, materials and gear against the brute force (buy, forge, temper with materials bought, Echoforge). It also covers the pack only rule away from town, Show all options and back, the hero sheet buttons, the Smithy list, Alchemy charms and the Daily Trial.
- `v095m4.js`: layout at 344x882, 390x844, 412x812, 705x455, 844x390, 933x705 and 1280x720 (72 screens each: every board tab and section in all three places, hero sheets, Upgrade popups, Party, Equipment, Smithy, Alchemy, the whole party plan). Nothing clipped, nothing sideways, no button text wider than its button, no page errors.

Updated test: `v063m2.js`, for the new structure only (Guild Hall tabs, board sections, guild bounties landing on the Bounties tab, the menu's Quests tabs).

Still passing: v063m1, v040p789, v043c, v077a, v050p3a, v050p3b, v051b, smithy, smithywalk, tavern, v050p4, v072a, v081a, v083a, liveupdate.

`smithy3` "render forge" sits over its 600 ms line on this shared machine. The build before this pass measured 703 ms there too, so the check is timing noise, not this change.
