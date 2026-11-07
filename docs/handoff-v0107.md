# Handoff after the v0.10.x pass (Phases 1 to 8)

Shipped to main so far: 0.10.0 (Phase 1 fixes), 0.10.1 (page zoom, keys, Flat look, account totals), 0.10.2 (wild recruit popup, Build Party takes, one Equip Best), 0.10.3 (connected world map, phone minimap, icons), 0.10.4 (Chain, planned targets and the Guard cue, skill rows). Committed and pushed one at a time after the "Build and release" run of the previous one went green.
Local, pushed after their checks: 0.10.5 (56 reactions, early roles, prime refresh, typed attacks, natures as sub-roles, mastery perks), 0.10.6 (board vs Guild Hall, guild notices, town gated notices, Medals, Guides tabs, roamer grace after a fight), 0.10.7 (Sanctums and Summons, Priest rename).

Owner decisions during the pass: keep Momentum and Taming (a removal was started and reverted); do the menus sweep inside Phase 7; helpers (sonnet) only for mechanical work, the rest by Fable.

Known open items:
- Pork Chop at the top of the Backpack was not reproduced (the Items tab now sorts rarity then name).
- Tests to watch: v063ba (label overlaps: intent tags now reserve room for the aim text), v063bc (skill list detonator chips), v095nb (goals panel vs A/B buttons in landscape, was a load flake), v063wa times out under the full runner but passes alone.
- The Daily Trial outcomes differ from 0.10.3 (planned targets), still deterministic per day.
- Phase 6 natures: new wayfarers start on a sub-role; existing heroes keep their old nature until rerolled in the Guild Hall.

Docs per phase: v0100-phase1.md, v0101-stats.md, keymap.md, v0102-party.md, v0103-map.md, v0104-battle.md, v0105-combat.md, v0106-guild.md, v0107-sanctums.md.
