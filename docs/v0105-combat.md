# v0.10.5 combat: full reaction matrix, early roles, prime refresh, typed Attack

## Reactions (data.js REACT)
Every ordered pair of two different elements now reacts (56 reactions, 8 elements). A reaction needs a Primer
element on the foe and a Detonator element hitting it, and the direction matters: `reactFor(primed, det)` only
returns an entry whose `p` is the primed element and `d` the detonator. A forward pair keeps its sorted key `'a+b'`
(weather uses these keys, e.g. `'fire+water'`); the reverse direction has its own entry keyed `'primed>det'`.
`reactKey(primed, det)` returns whichever key matches that direction. Same element never reacts.

Forward (primed, then detonator, name, multiplier): ice>fire Melt 1.8; water>fire Steam 1.3; fire>wind Wildfire 1.2;
earth>fire Magma 1.3; fire>lightning Overload 1.5; fire>light Solar Flare 1.4; shadow>fire Hellflame 1.3;
water>lightning Conduct 1.3; water>ice Freeze 1.2; water>earth Mire 1.15; wind>water Squall 1.2; light>water Purge 1.2;
shadow>water Drown 1.3; earth>wind Sandblast 1.2; lightning>earth Grounded 1.3; ice>earth Permafrost 1.2;
earth>light Crystalize 1.3; earth>shadow Grave 1.3; wind>lightning Storm Surge 1.3; wind>ice Frostbite 1.2;
light>wind Radiant Gale 1.2; shadow>wind Nightshear 1.3; ice>lightning Shatter 1.7; lightning>light Judgement 1.6;
lightning>shadow Blackout 1.3; ice>light Prism 1.3; shadow>ice Deathchill 1.4; light>shadow Eclipse 2.0.

Reverse (new): fire>ice Thermal Shock 1.3; fire>water Scald 1.3; wind>fire Firestorm 1.3; fire>earth Cinderfall 1.25;
lightning>fire Ignition 1.5; light>fire Sunfire 1.4; fire>shadow Cinder Curse 1.3; lightning>water Static Rain 1.3;
ice>water Glaze 1.2; earth>water Mudslide 1.2; water>wind Waterspout 1.25; water>light Baptism 1.2;
water>shadow Undertow 1.3; wind>earth Dust Devil 1.2; earth>lightning Fulgurite 1.3; earth>ice Frostheave 1.2;
light>earth Monolith 1.3; shadow>earth Entomb 1.3; lightning>wind Thunderclap 1.3; ice>wind Blizzard 1.3;
wind>light Halo Gust 1.2; wind>shadow Gloom Gale 1.3; lightning>ice Superconduct 1.5; light>lightning Heaven's Bolt 1.5;
shadow>lightning Voidshock 1.3; light>ice Diamond Dust 1.3; ice>shadow Black Ice 1.4; shadow>light Dawnbreak 1.5.

The Lore guide (ui.js) builds its list from REACT grouped by primed element, so it shows all of them.

## Early roles (skills.js, SKILL_ROLE in data.js)
Front line (warrior, knight, monk): the earliest elemental skill is a Detonator, a Primer follows by lv 8 to 10.
Warrior and monk keep edge1/chi1 (det) then brand/palm2 (primer). Knight: lance1 is now the det (lv 4), the old
Shield Burst became the primer Shield Brand (lv 8). Everyone else (mage, healer, thief, archer, bard): the earliest
elemental skill is a Primer, the Detonator follows (lv 4 to 8). Dual-element heroes are handled by a swap in
respaceSkills. Both roles exist in the late band (lv 18+) for every class as before.

| class | early order |
|---|---|
| warrior | det (lv 1), primer (lv 8) |
| knight | det (lv 4), primer (lv 8) |
| monk | det (lv 1), primer (lv 8) |
| mage | primer (lv 1), det (lv 4) |
| healer | primer (lv 4), det (lv 8) |
| thief | primer (lv 4), det (lv 8) |
| archer | primer (lv 1), det (lv 8) |
| bard | primer (lv 4), det (lv 8) |

## Prime refresh (engine.js, perform)
Foe not primed: prime it (counts B.nPrime). Primed with the same element: timer reset to 2 turns, floating text
"Primed again", no stacking and no counter. Primed with another element: nothing, the first prime stays.

## Typed basic Attack (atk6.js, CLS_ATK in config.js 2)
`CLS_ATK={warrior:{pw:1.15},knight:{pw:1.05},monk:{pw:1.15,hits:1},thief:{pw:1.1},archer:{pw:1.2},mage:{k:'mag',pw:1.1},healer:{k:'mag',pw:.95},bard:{k:'mag',pw:1}}`.
Hero Attacks go through a `perform` wrap that passes `Object.assign({},sk,CLS_ATK[cls])` (id stays 'attack').
`atkFor(a)` returns that copy; the Attack row in the root menu uses it for its delivery icon (a mage's staff shows
as magic via deliveryOf; an archer's bow stays ranged through the weapon table).

## Natures and mastery (natures6.js)
- NAT6: three natures per class (NAT6_CLASS), 10 to 15% swings and one perk each; keys past the plain stat keys (critDmg, acc, mpEff, guardM, low, chi) are applied by a calcStats wrapper and a calcDamage xform. Old natures stay defined; `natPool` returns the three sub-roles plus the hero's current old nature; `newChar` picks the nearest sub-role to the template's trait (nat6Default). Daily Trial heroes keep the template trait (natOf).
- Mastery: MASTERY_BONUS .25; MAST6 adds 10% MP and a quarter less damage from the hero's own element; MASTERY.light.heal is 0 and light gets vs undead and shadow (+15%). Shadow keeps its drain.
- Momentum and companions stay (the removal was reverted at the owner's request). battle4.css: the Momentum bar wraps its Surge label.
