# The three first Legendaries reworked (`v3/legends17b.js`)

The owner: "from a design perspective the legendaries are like upgraded versions of current classes with their special abilities ... Nick and
Kevin are archers with unique abilities, Jason is a mage the same way". Module `legends17b.js` (after `roster17.js` in `MODS`), test
`tools/chrome/v195a.js` (party group), balance tool `tools/chrome/legbal.js`, screenshots `tools/chrome/l17shots.js`. Hero ids, class keys
(`druid`, `sniper`, `archmage`), elements, stat lines and traits are unchanged. The Druid class is shown as "Hunter".

## Kits (14 skills on 1, 1, 6, 11, 14, 18, 21, 25, 28, 31, 35, 38, 42, 45; `L17.kit`)

| Lv | Nikaris, the Hunter | Kaevan, the Sniper | Jace, the Weatherwright (id `jaeson`) |
|---|---|---|---|
| 1 | Shade Arrow 1.45 | Thunder Quarrel 1.3 chain | Frost Spark 1.4 |
| 1 | Call Hawk .62 x2 | Shadow Quarrel 1.6 | Volt Lance 1.35 chain |
| 6 | Call Wolf 1.55 | Hoofbeat Charge 1.8 | **Static Field** .9 all |
| 11 | **Quiver Run** .75 x4 | **Steady Draw*** (cost .7: next shot +60%, cannot miss) | **Call Thunderstorm** (cost .5) |
| 14 | Healing Sap | Wheeling Volley .95 all | Wellspring Mantle |
| 18 | Nightbloom Arrow 1.75 | Longshot **2.0, pierce** | **Call Blizzard** (cost .5) |
| 21 | **Snare Line** (the one trap: Root .7, Slow .6) | Khan's Focus | Quicken (Haste an ally: the ally support that stays) |
| 25 | **Hawk's Watch*** | **Stillwind Bolt** 1.3, Stun .45, Slow (was Hobbling Bolt) | **Lightning Rod*** (cost .6) |
| 28 | Pack Hunt 1.0 all | Flash Bolt .9 all | Glacial Tempest **1.2** all, Slow .4 |
| 31 | Wild Mend | Feigned Retreat* 2.0, cost .6 | **Sleetstep*** (cost .5: Ward and Haste on himself) |
| 35 | Moonless Volley **.55 x3** all (arrow rain) | Shadowstorm **3.4, cost 1.4** | **Thunderhead** 1.5 all (id `lattice`) |
| 38 | Call Boar* 1.9 | Stormrider's Mark 1.0 all | Hoarfrost Field 1.0 all |
| 42 | **Split Arrow** 2.6 chain | Eclipse Bolt 2.8 pierce | **Whiteout** 1.4 all, Blind .5 |
| 45 | Heart of the Old Wood 1.9 all | **Horizon Shot** 5.2, pierce, cost 1.5 (id `tenk`) | Zero Point 2.3 all |

`*` = marked the hero's own. Dropped from the kits and kept by any saved hero who knew them (`L17.legacy`, `c.keep`, the `known` wrapper):
Tangleroot, Wild Hunt, Bramble Prison; Black Squall; Lightning Glyph, Rimebolt, Prism Ward, Cryo Spark, Frost Mail, Absolute Zero Surge. `G.l17k` marks a migrated
save (`l17Keep` reads the levels the save was written with: `lv12`, `lvP`, `lvQ`, `lvR`, or roster17's `lvS`).

## Mechanics
- **Hawk's Watch** (status `l17watch`, three of his turns): after every damaging action of his side the hawk dives at the foe that was hit for
  `L17.nik.dive` (.55) of his attack and may Blind; at most `diveMax` 12 dives a watch.
- **Steady Draw** (status `l17steady`): the next physical skill deals x1.6 and cannot miss (accuracy at the engine's 99% ceiling, Blind set aside for
  the shot, the roll kept under it), then the status is spent. **Horizon Shot** never takes more than `L17.kae.cap` (18%) of a boss's max HP.
- **Weather calls**: in battle `B.weather` is set for `L17.jace.wxTurns` (5) of his turns (`B.l17wx`), then the sky the fight began under returns. On
  the field they are Field skills (`fsSkills`/`fsCast`): `G.weather[s]`, `G.wx[s]` = 160 steps, a "Called" chip beside the weather chip. Refused
  indoors (`mapIndoor`) and where a sky is held (`G.wxSave`, the storm of his own legend quest). A rare sky is replaced like any other; when the
  steps run out the realm rolls its weather as usual.
- **Storm bolts** (`weatherEvent` wrapped only while Jace stands in the Vanguard): chance `strike` .16 a party turn (the plain storm: .07), a bolt
  meant for an ally bends to him, and a bolt on him heals `heal` 10% of max HP and adds a stack of Stormfed (+4% magic, +3% speed, five at most).
- **Lightning Rod** (status `l17rod`, three turns): strike chance .45 and 85% of bolts on him; every enemy Lightning attack (single or area) is
  absorbed by him the same way (`l17Act`), `foePlan` names him as the target and `c5Est` counts 0.
- **Snow** (Blizzard or Snowfall): his Ice x1.15 on top of the weather and it may Slow or Stun, he takes x.8 damage, the party is not slowed.
- His spells on every foe deal x1.1 when one foe is left. Twin Weave is unchanged.
- **Limit**: Hailfall (3 waves of .95) and Absolute Tempest (4 of .92): Lightning in a thunderstorm, Ice in snow, else alternating at x.9.
- Auto battle (`l17Auto` in front of the careful auto): Jace calls the sky that suits the foes, raises the Rod under a storm or against foes with
  Lightning moves; Kaevan steadies when he can pay for a heavy shot and then fires his heaviest; Nikaris sets the hawk watching.

## Looks
Look records for the hero rig plus parts drawn as keys on the rig's grid (so every view, pose, walker and portrait has them): Nikaris a feathered
cap, a pelt collar and a hawk on the shoulder (`l17Hawk`); Kaevan a hood, a scarf, an arbalest with a sight (the crossbow drawers add it while
`L17.art.k==='sniper'`) and a horse drawn as a key grid (`l17HorseGrid`, painted by `paintHD`; `mountCanvas` replaced); Jace blue hair and eyes,
thin round glasses (a pale wire ring, the eyes open), a deep blue mantle. Battle effects: one particle kind `l17` (dive, tracer, reticle, feed,
arc, hail) and two lasting drawings (the circling hawk, the rod of light).

## Unlocking
Codes: unchanged (`LEGEND_CODES` in `legends.js` holds only their SHA-256 hashes). With a code the old meeting posts on a board as before.
Without one a trail posts (a legend quest with `trail:1`): Nikaris from the second realm ("Tracks at the Treeline"), Kaevan and Jace from the third
("Feathers on the Wind", "The Storm That Stays"; Jace's in a snow or heights realm, or any realm from the fourth). Steps: win four fights in that
realm's fields; one fight on the field (The Pack Mother and two pups; The Rider's Stormhawk and two hawks in a gale; The Eye of the Squall and two
wisps in a thunderstorm); then the old meeting (the pup and the hawk, the ride, the frozen lake). Joining unlocks him on the account.

## Balance (legbal.js, 40 boss fights a cell, five boss points, the careful auto)
See the last section of `handoff-v0111.md` for the numbers of the run that shipped.
