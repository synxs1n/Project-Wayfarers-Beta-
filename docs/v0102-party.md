# Beta v0.10.2: Phase 3, party and equipment

- `recruit3.js`: `recruit(id,true)` with a full six sets `G.pendRecruit`; a render after hook opens the `recruitAsk` popup once the world is quiet (no dialog, popup or lock). View sheet opens the char popup with `recruitAsk` set so Back returns; Swap in replaces `G.party[i]` on the spot (the wild is allowed for this one swap); Keep in reserves clears the field. The field saves with G (packG copies G), so a reload asks again.
- `party3.js`: `P.shuf` (press counter per formation) and `P.hist` (sixes shown); `bestParty(shuf,hist)` adds a seeded jitter per hero (`p6Noise`, `P6_SHUF`) and never repeats a six while an alternative exists. Counter 0 is the old suggestion.
- `equip.js`, `equip2.js`: one Equip Best (party mode); `fitsFor` and `mEquipNow` list party heroes only; `autoEqCharms` (slot 'c' only) behind the Alchemy Charms tab button (`m3CharmBtn` in menus3.js). `autoEqAll` and `autoEqCamp` still exist but no button reaches them.
- `ui.js` roleTag: symbol only (⟐ / ✸) with the tooltip.
