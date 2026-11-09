// ===== equipbtn10.js (v0.14.6): an Equip button beside Sheet on every party card =====
// The owner: "add equip button next to sheet button on party cards, it opens the equip menu for that character." The Party tab's cards
// (and the Guild Hall's swap view) get an Equip button next to Sheet; it opens Backpack > Equipment with that hero's row scrolled into view
// and lit for a moment. No save fields.
{const vs0=vSwap;vSwap=function(where){let h=vs0.apply(this,arguments);try{h=h.replace(/<button class="btn sm swsheet" data-act="(\w+)" data-arg="([^"]+)" aria-label="Open ([^"]*)'s sheet">Sheet<\/button>/g,
  (m,act,id,name)=>`<div class="swbtns"><button class="btn sm swsheet" data-act="${act}" data-arg="${id}" aria-label="Open ${name}'s sheet">Sheet</button><button class="btn sm sweq" data-act="eqOpen" data-arg="${id}" aria-label="Equip ${name}" title="Open the Equipment page at ${name}">Equip</button></div>`);}catch(e){}return h;};}
{const ve0=vEquipTab;vEquipTab=function(){let h=ve0.apply(this,arguments);try{const L=(V.charList||[]).slice(),f=V.eqFocus&&Date.now()-V.eqFocus.t<2500?V.eqFocus.id:null;let i=0;h=h.replace(/<div class="eqrow">/g,()=>{const id=L[i++]||'';return `<div class="eqrow${id===f?' eqfocus':''}" data-hero="${id}">`;});}catch(e){}return h;};}
ACT.eqOpen=function(id){if(!G||!G.roster[id])return;V.eqFocus={id,t:Date.now()};V.modal={type:'menu',tab:'equip',from:V.modal&&V.modal.type!=='menu'?V.modal:undefined};render();
  setTimeout(()=>{try{const el=document.querySelector(`#modal .eqrow[data-hero="${id}"]`);if(el)el.scrollIntoView({block:'center',behavior:'smooth'});}catch(e){}},30);
  setTimeout(()=>{try{const el=document.querySelector(`#modal .eqrow[data-hero="${id}"]`);if(el)el.classList.remove('eqfocus');V.eqFocus=null;}catch(e){}},2200);};
// v0.14.8: the button row is part of the card's flow (a grid row under the hero), never laid over the HP/MP/XP bars (the open Galaxy Fold showed that)
{const st=document.createElement('style');st.textContent=`.swc:not(.row) .swbtns{position:static;transform:none;display:flex;gap:4px;justify-content:center;padding:2px 4px 6px;z-index:2}.swc:not(.row) .swm,.swlist.g3 .swc:not(.row) .swm{padding-bottom:4px}
.swc .swbtns .swsheet,.swc .swbtns .sweq{position:static;transform:none;white-space:nowrap;min-height:32px;padding:3px 10px}
.swc.row .swbtns{position:static;transform:none;align-self:center;margin:0 8px 0 0;display:flex;flex-direction:column;gap:4px}.swc.row .swbtns .swsheet{margin:0}
.eqrow.eqfocus{box-shadow:0 0 0 3px var(--gold),0 0 18px var(--gold);transition:box-shadow .3s}
@media (max-width:720px){.eqrow{flex-wrap:wrap}.eqrow>.btn{margin-left:auto}}
.swlist.g3 .swbtns .btn{padding:3px 6px;font-size:.74rem;min-width:0;flex:1 1 auto}.swc:not(.row) .swbtns{flex-wrap:wrap;min-width:0}
@media (max-width:480px){.swlist.g3 .swc:not(.row) .swbtns{flex-direction:column;align-items:stretch;gap:3px}}
.petslot .eqs.petbtn{cursor:pointer}`;document.head.appendChild(st);}
// the pet slot is a slot like the others: tap it to choose, change or remove the pet (the picker has Remove)
{const ps0=petSlotHtml;petSlotHtml=function(c,mini){try{if(!c||G.daily)return '';const o=compOf(c),any=(G.tamed||[]).length>0;if(!any&&!o)return ps0.apply(this,arguments);
  return `<div class="petslot"><button class="eqs petcur petbtn" data-act="petPick" data-arg="${c.id}" title="${o?'Change or remove the pet':'Choose a pet'}">${o?`<img class="gico" alt="" src="${monURL(compDef(o).art)}">`:'<span class="gico empty"></span>'}<span><small>Pet</small>${o?esc(o.name):'Choose a pet'}</span></button></div>`;}catch(e){return ps0.apply(this,arguments);}};}
