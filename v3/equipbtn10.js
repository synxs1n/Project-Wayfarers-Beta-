// ===== equipbtn10.js (v0.14.6): an Equip button beside Sheet on every party card =====
// The owner: "add equip button next to sheet button on party cards, it opens the equip menu for that character." The Party tab's cards
// (and the Guild Hall's swap view) get an Equip button next to Sheet; it opens Backpack > Equipment with that hero's row scrolled into view
// and lit for a moment. No save fields.
{const vs0=vSwap;vSwap=function(where){let h=vs0.apply(this,arguments);try{h=h.replace(/<button class="btn sm swsheet" data-act="(\w+)" data-arg="([^"]+)" aria-label="Open ([^"]*)'s sheet">Sheet<\/button>/g,
  (m,act,id,name)=>`<div class="swbtns"><button class="btn sm swsheet" data-act="${act}" data-arg="${id}" aria-label="Open ${name}'s sheet">Sheet</button><button class="btn sm sweq" data-act="eqOpen" data-arg="${id}" aria-label="Equip ${name}" title="Open the Equipment page at ${name}">Equip</button></div>`);}catch(e){}return h;};}
{const ve0=vEquipTab;vEquipTab=function(){let h=ve0.apply(this,arguments);try{const L=(V.charList||[]).slice();let i=0;h=h.replace(/<div class="eqrow">/g,()=>`<div class="eqrow" data-hero="${L[i++]||''}">`);}catch(e){}return h;};}
ACT.eqOpen=function(id){if(!G||!G.roster[id])return;V.modal={type:'menu',tab:'equip',from:V.modal&&V.modal.type!=='menu'?V.modal:undefined};render();
  setTimeout(()=>{try{const el=document.querySelector(`#modal .eqrow[data-hero="${id}"]`);if(!el)return;el.scrollIntoView({block:'center',behavior:'smooth'});el.classList.add('eqfocus');setTimeout(()=>el.classList.remove('eqfocus'),1800);}catch(e){}},30);};
{const st=document.createElement('style');st.textContent=`.swc .swbtns{position:absolute;left:50%;bottom:4px;transform:translateX(-50%);display:flex;gap:4px;z-index:2}.swc .swbtns .swsheet,.swc .swbtns .sweq{position:static;transform:none;white-space:nowrap}
.swc.row .swbtns{position:static;transform:none;align-self:center;margin:0 8px 0 0;flex-direction:column;gap:4px}.swc.row .swbtns .swsheet{margin:0}.swlist.g3 .swbtns .btn{min-height:30px;padding:2px 8px}
.eqrow.eqfocus{box-shadow:0 0 0 3px var(--gold),0 0 18px var(--gold);transition:box-shadow .3s}`;document.head.appendChild(st);}
