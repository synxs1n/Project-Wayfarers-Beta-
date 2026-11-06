# v0.9.5 battle clarity: the simple layer, damage groups, reaction moments, intent cues

Four owner approved changes to how the battle screen presents what is already there. The design principle: depth stays optional (auto
tools let anyone skip it) but the screen leads players into the systems, and it stays readable on phones.

GAME_VERSION and the changelog are untouched (the lead merges those). No rule, number, RNG call or AI choice changed: damage, plans and the
Daily Trial are identical (`v050p2daily` against the previous build, `v063wa`). The one new setting is optional
(`META.cfg.expertBattle`, off when missing). The only new battle fields are view state (`B.b9x`, `B.b9rx`) and the counter `B.nReact`.

Code: `v3/battle3.js` section 9 (weakness picture, setting, reaction moment), `v3/battle5.js` (stage weakness tag, "Guard!" tag, command
cues), `v3/fx2.js` (the flash and banner ride in the effect layer), `v3/battleui.js` (primed chip pulse), `v3/sfx2.js` and `v3/audio.js`
(the new sound), CSS at the end of `v3/battle3.css` and `v3/battle5.css`, test getter `__A.B9` in `v3/shell.html`.

## 1. Simple battle layer (default)
- **One key weakness per foe**, on its card (a small chip) and on the stage (an 11x10 tag placed by `b3Lay` after the intents, beside them
  or the HP plate, never on a sprite or another label; when no spot is free the card still has it). `b9Key(e)` picks among the foe's
  *known* weaknesses (elements learned by hitting or scanning, damage groups once the type is revealed, as before):
  - score 3: the element detonates the foe's current prime and a Vanguard hero has a detonator in it;
  - score 2: a hero primes with it and another hero's detonator sets it off (or the reverse);
  - score 1: a hero uses it in a primer or detonator; then the highest multiplier.
  A reaction setup (score 2 or 3) is drawn purple with ✸ (card and stage tag); the tooltip names the reaction ("prime it, then Water sets
  off Purge"). A "+" on the chip says there is more.
- **Tap for the rest:** the key chip is a button; it expands that card to the full chips (with "−" to fold back). The foe's i panel shows the
  chips and the plain type line too.
- **Settings > Expert battle info** (Off / On, `META.cfg.expertBattle`): every foe card shows the full chips, hero cards their level and class.
- **Hero cards (simple):** name, element, HP / MP / Limit and the statuses (at most three icons on wide cards, "+N" for the rest; portrait
  already capped at three). Level and class live in the i panel and Expert mode. Rearguard cards keep their level (it matters for a swap).

## 2. The weakness picture, also in Expert mode
- Damage types are three groups the player reasons about, each with one symbol (the `dlIco` art): **Physical** (slash, blunt and piercing:
  the sword), **Ranged** (the arrow), **Magic** (the star), and **Heal** (the cross) for the Undead. A group's multiplier is the mean of its
  members (each clamped as `archMult` does); weak at x1.1 or more, resists at x0.9 or less. Armored: weak to Magic, resists Ranged and
  Physical. Flying: weak to Ranged. Undead: weak to Heal, resists Ranged and Magic.
- **At most two weak and two resist chips per foe**, strongest multipliers first (elements before groups on a tie).
- **Foe types are one plain line** (`ARCH_LINE`): in the i panel and logged by Scan, e.g. "Flying: ranged hits hard.", "Armored: magic and
  piercing cut through, other hits glance off.", "Undead: healing and Light burn it, blunt blows shatter it."
- Unchanged on purpose: the skill list's delivery chip and the aim tag keep the precise delivery symbol of the skill (blunt vs slash still
  matters against an Undead, and the type line says so); the real damage rules are untouched.

## 3. Reaction moments (`b9React`, called from the `doReaction` wrapper)
- **Flash:** one full-stage flash in a gradient of the primed and the detonating element's colours, 100 ms (under 120), peak opacity 0.42,
  at most one per 400 ms, none under reduced motion (the game's Motion setting or the device's). It replaces the 180 ms canvas flash the
  reaction used to set (`BV.flash`), so it is the only flash. It runs from its first render, so a busy frame cannot drop or lengthen it.
- **Banner:** "[primed][detonator] ✸ Melt!" across the stage for 0.9 s, 20 screen px text. `b9BanBox` places it once from the `b3Lay`
  layout: clear of every face, label and the top banner strip if it can, else of faces and plates, else of faces (smaller text as a last
  resort); it is inside the stage, so never on the turn bar. Effect texts placed later keep clear of it. Under reduced motion it stands still.
- **Sound:** a new `reaction` effect on the sfx bus. Orchestral: a timpani punch with a low drop, a short soft brass stab (C, G, C, E), the
  detonating element's impact through a 0.55 gain and a few high pings, with a light music duck. Classic: a triangle drop, a noise hit and
  a quick square arpeggio. It replaces the older `react` sound on the same hit (that one stays for the Archive's convergence puzzle).
- **Camera punch:** a quick zoom (1.085, 320 ms, fast in, eased out) on the target through the existing camera (`CAM`, gfx6battle.js),
  which moves both stage renderers: the 2D canvas and the HD-2D GL stage. Not under reduced motion.
- **`B.nReact`** counts reactions in the battle, for the rewards screen (another pass owns results.js).
- **Primed badge pulse:** a foe's primed badge (stage) and primed chip (card) pulse gently while the acting hero has a detonator, with the
  MP, that sets that prime off (`b9Ready`). Static glow under reduced motion.

## 4. Intent clarity (`b9Cue`, `b9TelePlan`)
- A **telegraphed big hit** (a Charger's Crushing Charge, a boss's Cataclysm after Gather power, or any foe winding up for a big hit)
  widens that foe's stage intent tag to "[icon] Guard!" (its `data-cat` is unchanged).
- When that hit lands on the acting hero before the hero's next turn (from the turn forecast), the **Guard button glows and reads
  "Guard!"**, and the command header says "Guard! Crushing Charge next" (tooltip: who, and that Guard halves it).
- While a foe is **winding up** and the acting hero is not its target: "Interrupt: stun or strip buffs"; Skills glows when the hero has a
  stun or boon strip skill with the MP.
- A **stacked Hex** (2+) on a Vanguard hero: "Hex 2 on Mira: cleanse it"; Skills glows (green) when the acting hero has a cleanse skill with
  the MP, else Items when there is a Remedy.
- The cue sits in the command header between the name and Back (it wraps; it never makes the header taller), so nothing moves. Auto battle
  shows none.

## Tests (tools/chrome)
- `v095b.js` (new; `node v095b.js [weak|expert|groups|react|cue|fit]`, 183 checks): one key weakness per foe on card and stage, a reaction
  setup whenever one exists (random battles and a built primed case); the Expert toggle (off when missing, the Settings row, capped chips,
  strongest first, hero level), tap to expand, the i panel; the groups and the type line (cards, i panel, Scan); a real detonation on
  Medium, Low, High and reduced motion: one flash under 120 ms (none under reduced motion), one banner clear of faces, the turn bar and the
  stage edge, one sound, a camera punch on the 2D canvas and the GL stage, `B.nReact` 1, the badge pulse; the Guard, interrupt and Hex
  cues; at 344x882, 390x844, 412x812, 705x455, 844x390, 933x615, 933x705, 1280x720, simple and expert, with the cues showing: no page
  scroll, no text cut, the commands and the cue on screen, no stage label on another or on a sprite. No page errors.
- `v095lib.js` (the shared scene), `v095bshots.js` (screenshots into `shots-v095b/`, not committed).
- `v080b.js` damage types section: the intended change (groups, capped chips, in Expert mode); nothing else in it changed.

## Limits
- A weakness is only shown once known (hit with that element, or the type revealed), as before; a fresh foe shows no chip.
- Group multipliers are a summary: an Undead's Physical is neutral on average (blunt 1.2, piercing 0.8); the type line carries the nuance.
- With several reactions from one party wide detonator the banner shows the last one; the flash and sound fire once for the action.
- The cue reads the forecast, which assumes a cost of 1 for later turns (as the turn bar does).
