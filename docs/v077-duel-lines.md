# v0.7.7 duel lines: every wayfarer who challenges you speaks for themselves

Owner report: "Dialogue when a wayfarer challenges you is the same no matter who you run into." The road duel used one line per class
(`CW_CLS[cls].challenge`, `.win`, `.decline` in `ceword.js`), so every fighter said the same thing, and the half health shout was
"<name> grins and digs in." for everyone.

All lines now live as data in `v3/duellines.js` (loaded just before `qready.js`), keyed by hero id. No save keys change, and nothing
reads the game RNG: a line with variants (an array) is picked from the journey seed, so the Daily Trial stays deterministic.

## Where a wayfarer (not a monster) challenges or confronts the party

| Context | Code | What the hero says now |
| --- | --- | --- |
| Road duel, opening (chance encounter, `type:'duel'`) | `chance.js` `ceStart`, text from `ceword.js` | `o`, after the existing description from `cwIntro` |
| Road duel, a bond partner in your six speaks up | `skills.js` `BONDS` pairs | `DUEL_REPLY['challenger>partner']`, shown under the challenge |
| Road duel, Decline | `ACT.cevPick('no')` toast (`cwDecline`) | `d` |
| Road duel, half health (banner and log) | `duelFoes` `phase.say` | `m` (24 letters at most, the banner does not wrap) |
| Road duel won ("Duel won" on the rewards screen, `legendKind:'duel'`) | `challengeWin` wrapper | `w` (they say they will wait at a tavern) |
| Road duel lost (the "party falls" window) | `vModal` `lose` | `l` |
| Ran from the duel | `finishBattle('fled')` toast | `f` |
| Personal quest rival (a monster, but the hero in your six speaks to it) | `vModal` `elite` with `b.personal` | `r` before, `rw` on the rewards screen after |
| Legend: Kaevan's Dusk Rider ride (a real fight) | `legends.js` `legendTalk`, `legendJoin` | `o` opens the ride, `w` on joining, `l` on a loss, `f` on fleeing |
| Legend: Nikaris (his beasts are the fight) and Jaeson (a puzzle) | `legendJoin`; fleeing Nikaris's beasts | `w` on joining ("A voice in the dark:" + `f` when you flee the pup or hawk) |
| Guild Hall recruitment challenges (14 heroes, no fight, "show me first") | `progression.js` `challText`, `ACT.chClaim` | `DUEL_GUILD[id].g` on the board, `.j` in the join toast |

Looked at and left alone, as they are not a hero challenging you: the "wayfarer in need" and ambush meetings (they are being
attacked, the thanks line is unchanged), the arena (monster waves), the lost wayfarer in dungeons, the cave recruit, Vaelith at the
Archive (she joins by talking, her lines are there for her personal quest and any later use), tavern hires.

## Data

- `DUEL_LINES`: 92 heroes x 8 lines (`o m w l f d r rw`) = 736 lines. Every opening is unique, and no two heroes share any line of
  the same kind. Legends and Vaelith never duel on the road, so their lines fit their own events.
- `DUEL_REPLY`: 38 reply lines, both directions of the 19 bond pairs.
- `DUEL_GUILD`: 14 heroes x 2 = 28 lines.
- `dlFallback(id,k)`: any hero with no entry (a future wayfarer) gets lines built from their name, class, first element and trait, so
  it is still distinct (for example "They call me Glint, and the dawn walks with me. One fair bout, my quick fingers against yours?").

Voice: from each hero's class, elements, trait and bio. One or two short sentences, no hyphens or dashes, no modern slang.

## Samples

- Brann (warrior, fire): "I used to beat iron flat for a living. Let us see if you ring true or crack." / at half health "Now the forge is hot!" / loses: "Ha! You've a good temper on you, like proper steel. I'll be at the tavern, warming a stool."
- Fenn (mage, ice): "I have catalogued nine thousand snowflakes and not one good fighter. Kindly be entry number one."
- Tamsin (thief, earth): "Sorry about this. Truly. One quick bout, and I'll apologise properly after." / you decline: "Of course, of course. Sorry to have bothered you."
- Zia (mage, lightning): "Today's forecast: scattered sparks, heavy thunder, and one short duel. Shall we?" / you run: "Clearing skies to the east. That's you, running."
- Kage (monk, shadow): "I was taught that silence is a technique. You will not hear me coming." / to his rival: "Master. No more words. Only this."
- Deryn (knight, water): "Lovely drizzle today. Perfect weather for a friendly trial, don't you think?"
- Gilda in your six when Brann challenges: "Careful. He swings at doors too, and loses."
- Hollis on the Guild board: "I keep count of the ones who got home. Bring everyone home from the dark, five times."

## Tests

`tools/chrome/v077d.js` (from `tools/chrome`, `PWHTML=../../out/aurelis3.html`), at 390x844 and 933x705: every hero has every line,
unique openings and unique lines per kind, a distinct fallback, no dashes, short banner shouts, seed variants stable; every road duel
hero (88) opens with their own line and declines with their own line; the bond reply; for 12 heroes the real fight (half health shout,
rewards line, loss window, flee toast); the banner fits; personal rival before and after; Kaevan open, loss, flee and join; the Guild
board and join toast; nothing clipped, no page errors. Test handle: `window.__DL` (separate from `window.__A`).
