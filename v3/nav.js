// =================== MENU NAVIGATION (Beta v0.2.0) ===================
// Back arrow next to the X on every popup that has a parent. Back goes up one level; X closes everything.
// Esc and gamepad B go back (or close when there is nothing to go back to); gamepad X or Start closes all.
function modalBack(m){
  if(!m)return null;const t=m.type;
  if((t==='char'||t==='guild')&&m.gear)return ()=>{m.gear=null;};
  if(t==='char')return ()=>{V.modal={type:'menu',tab:V.lastMenuTab||'party'};};
  if(t==='guild'&&m.char)return ()=>{V.modal={type:'guild',tab:'recruit'};};
  if(t==='beast')return ()=>{V.modal={type:'menu',tab:'beasts'};};
  if(t==='eqPick')return ()=>{V.modal={type:'menu',tab:'equip'};};
  if(t==='compPick')return ()=>{V.modal={type:'menu',tab:'comp'};};
  if(t==='autoEq')return ()=>{V.modal=m.from&&m.from.type!=='autoEq'?m.from:{type:'menu',tab:'equip'};};
  if(t==='useitem')return ()=>{V.modal={type:'menu',tab:'items'};};
  if(t==='feedback'){
    if(m.tab==='mydetail')return ()=>{m.tab='mine';m.path=null;};
    if(m.tab==='detail')return ()=>{m.tab='inbox';m.path=null;};
    if(m.back==='pause')return ()=>{V.modal={type:'pause'};};
    if(m.back==='menu')return ()=>{V.modal={type:'menu',tab:V.lastMenuTab||'party'};};
    return null;
  }
  if(t==='fbcopy')return ()=>{V.modal=m.ret&&m.ret.type==='feedback'?m.ret:null;};
  if(t==='talk')return ()=>{V.modal=m.from||null;};
  if(t==='map')return ()=>{V.modal=m.from||null;};   // v0.4.1 1.9: the map has a back arrow next to the X (back to where it was opened from, else the world)
  // v0.5.0 1.5: every shop screen has the back arrow. v0.6.3: shops have main tabs and section chips (menus3.js), so back is one level:
  // a section (or a hero picked on the Natures tab) goes back to All, a tab goes back to the shop's first tab, the first tab leaves the shop.
  const SHOP_HOME={smithy:'shop',workshop:'shop',guild:'recruit',tavern:'hire',inn:null,board:null,archivist:null};
  if(t in SHOP_HOME){if(typeof m3Norm==='function')m3Norm(m);const home=SHOP_HOME[t],tab=m.tab&&m.tab!=='party'?m.tab:home;
    if(t==='guild'&&tab==='nature'&&m.nat)return ()=>{m.nat=null;};
    if(m.sec&&m.sec!=='all')return ()=>{m.sec='all';};
    if(home&&tab!==home)return ()=>{m.tab=home;m.sec='all';m._t=home;m.nat=null;};
    if(m.from)return ()=>{V.modal=m.from;};
    return ()=>{V.modal=null;};}
  if(m.from)return ()=>{V.modal=m.from;};
  return null;
}
// popups opened from another popup remember where they came from
['settings','slots'].forEach(k=>{const f=ACT[k];if(!f)return;ACT[k]=function(){const prev=V.modal;const r=f.apply(this,arguments);if(V.modal&&prev&&prev!==V.modal&&prev.type!==V.modal.type)V.modal.from=prev;return r;};});
{const wc0=withClose;withClose=function(h){const m=V.modal;const back=modalBack(m);
  return h.replace(/<div class="panel([^"]*)">/,(x)=>x+`<div class="mnav">${back?'<button class="mback" data-act="xBack" aria-label="Back" title="Back (Esc)">←</button>':''}<button class="mclose" data-act="xClose" aria-label="Close everything" title="Close">✕</button></div>`);};}
{const xc0=ACT.xClose;ACT.xClose=function(){const m=V.modal;V.swapSel=null;if(m&&m.type==='talk'){V.modal=null;render();return;}return xc0.apply(this,arguments);};}
ACT.xBack=function(){const f=modalBack(V.modal);if(!f)return ACT.xClose();V.swapSel=null;f();if(typeof sfx==='function')sfx('blip');render();const p=document.querySelector('#modal .panel');if(p)p.scrollTop=0;};

// =================== TAP TO SWAP (Beta v0.2.0) ===================
// Tap a party member to pick them, tap another to swap places. With someone picked, tap a roster hero (in town) to swap
// them in, or send the picked hero to the roster and fill the gap with the next hero you tap.
function partySlots(){const P=[];for(let i=0;i<6;i++)P.push(G.party[i]||null);return P;}
function setSlots(P){G.party=P.filter(Boolean);}
function swapTown(where){return where==='guild'||inTown();}
function vSwap(where){
  const town=swapTown(where),sel=V.swapSel,P=partySlots(),openAct=where==='guild'?'openChar':'viewChar';
  // v0.4.3: in the Menu the party is a 3 + 3 grid (front line on top, rearguard below) that fits one screen
  const grid=where==='menu';
  V.charList=G.party.slice();
  const name=id=>id&&G.roster[id]?esc(G.roster[id].name):'';
  const hint=!sel?'Tap a hero, then tap another to swap places. The front three start each fight.'
    :sel.r?`Tap a party slot to put ${name(sel.r)} there.`
    :sel.fill?'Tap a roster hero to fill the empty slot.'
    :`Tap who to swap with ${name(P[sel.i])}.${town?' Or tap a roster hero below to swap them in.':''}`;
  const card=(id,i)=>{const c=id&&G.roster[id],on=sel&&sel.i===i,lab=(i<3?'Front ':'Rearguard ')+(i%3+1);
    if(!c)return `<div class="swc ${grid?'':'row'} empty ${on?'sel':''}"><button class="swm" data-act="swapTap" data-arg="p:${i}" ${town||sel?'':'disabled'}><small>${lab}</small><span>Empty slot</span></button></div>`;
    // Beta v0.3.1: one readable row per hero: portrait, name, level and class, elements, HP and MP with numbers, KO or status marker
    const bad=[...new Set(Object.keys(c.st||{}).filter(k=>STS[k]&&STS[k].bad).concat(typeof ailOf==='function'?ailOf(c):[]))],mark=c.hp<=0?'<em class="swko">KO</em>':bad.length?`<em class="swst" aria-label="${bad.map(k=>STS[k].n).join(', ')}">${bad.map(k=>`<span class="ail" style="--c:${STS[k].c}" title="${STS[k].n}">${stSym(k)}</span>`).join('')}</em>`:'';
    return `<div class="swc ${grid?'':'row'} ${on?'sel':''} ${c.hp<=0?'ko':''}"><button class="swm" data-act="swapTap" data-arg="p:${i}" aria-pressed="${on}" aria-label="${esc(c.name)}, ${lab}${on?', selected':''}">${port(c.id,'noail')}<span class="swi"><span class="swn"><b>${esc(c.name)}</b><span class="els">${c.el.map(ico).join('')}</span></span>${mark?`<span class="swstrow">${mark}</span>`:''}<small>${grid?'':lab+' · '}Lv ${c.lv} ${CLS[TPL[c.id].cls].n}${c.pts?` · <span class="up">${c.pts} pts</span>`:''}</small><span class="swb"><span class="swbl">HP</span>${bar(c.hp,c.S.mhp,'var(--hp)')}<span class="nums">${c.hp}/${c.S.mhp}</span></span><span class="swb"><span class="swbl">MP</span>${bar(c.mp,c.S.mmp,'var(--mp)')}<span class="nums">${c.mp}/${c.S.mmp}</span></span>${grid?xpLine(c,true):xpLine(c)}</span></button><button class="btn sm swsheet" data-act="${openAct}" data-arg="${c.id}" aria-label="Open ${esc(c.name)}'s sheet">Sheet</button></div>`;};
  const bench=Object.values(G.roster).filter(c=>!G.party.includes(c.id)).filter(c=>lmatch('party',c));const benchS=lsort('party',bench,(a,b)=>b.lv-a.lv||a.name.localeCompare(b.name));
  return `${grid?'<div class="swgridwrap">':''}<div class="btnrow ptools"><button class="btn sm" data-act="bpOpen">Best party</button><button class="btn sm" data-act="fsOpen">Field skills</button>${(G.talks||[]).length?`<button class="btn sm gold" data-act="campfire">Campfire talks (${G.talks.length})</button>`:''}</div>${ldStrip()}<p class="note swhint ${sel?'on':''}">${hint}</p>
    <h4>Front line</h4><div class="swlist ${grid?'g3':''}">${[0,1,2].map(i=>card(P[i],i)).join('')}</div>
    <h4>Rearguard</h4><div class="swlist ${grid?'g3':''}">${[3,4,5].map(i=>card(P[i],i)).join('')}</div>
    ${sel&&sel.i!=null&&P[sel.i]?`<div class="btnrow">${town&&G.party.length>1?'<button class="btn sm" data-act="swapOut">Send to roster</button>':''}<button class="btn sm" data-act="swapCancel">Cancel</button></div>`:sel?'<div class="btnrow"><button class="btn sm" data-act="swapCancel">Cancel</button></div>':''}
    ${town?`<h4>Reserves <span class="cnt nums">${bench.length} waiting</span></h4>${filterBar('party')}<div class="grid mini">${benchS.map(c=>`<button class="mini ${sel&&sel.r===c.id?'sel':''} ${c.el.length>1?'dual':''} ${isLeg(c.id)?'leg':isEpic(c.id)?'epic':''}" data-act="swapTap" data-arg="r:${c.id}">${heroTag(c.id)}<img src="${heroURL(c.id)}" alt=""><b>${esc(c.name)}${c.legacy?' ★':''}</b><small>Lv ${c.lv} ${CLS[TPL[c.id].cls].n}</small><span class="els">${c.el.map(ico).join('')}</span></button>`).join('')||'<p class="note">Everyone you have recruited is already in your six.</p>'}</div>`
      :'<p class="note">Reordering works anywhere. Swapping roster heroes into your six happens in town.</p>'}${grid?'</div>':''}`;
}
Object.assign(ACT,{
  swapTap(a){
    const [k,v]=String(a).split(':'),where=V.modal&&V.modal.type==='guild'?'guild':'menu',town=swapTown(where),sel=V.swapSel,P=partySlots();
    if(k==='p'){const i=+v;
      if(!sel){if(P[i])V.swapSel={i};else if(town)V.swapSel={i,fill:1};}
      else if(sel.r){if(!town)return;const id=sel.r,j=P.indexOf(id);if(j>=0)[P[i],P[j]]=[P[j],P[i]];else P[i]=id;setSlots(P);V.swapSel=null;saveGame();sfx('blip');}
      else if(sel.i===i)V.swapSel=null;
      else if(sel.fill)V.swapSel=P[i]?{i}:{i,fill:1};
      else{if(!P[sel.i]&&!P[i]){V.swapSel=null;}else{[P[i],P[sel.i]]=[P[sel.i],P[i]];setSlots(P);V.swapSel=null;saveGame();sfx('blip');}}
    }else if(k==='r'){if(!town)return;const id=v;
      if(sel&&sel.fill){const L=G.party.slice();if(L.length>=6)return;L.splice(Math.min(sel.i,L.length),0,id);G.party=L;V.swapSel=null;saveGame();sfx('blip');}
      else if(sel&&sel.i!=null){P[sel.i]=id;setSlots(P);V.swapSel=null;saveGame();sfx('blip');}
      else V.swapSel=sel&&sel.r===id?null:{r:id};
    }
    render();
  },
  swapOut(){const sel=V.swapSel,where=V.modal&&V.modal.type==='guild'?'guild':'menu';if(!sel||sel.i==null||!swapTown(where)||G.party.length<=1)return;
    const P=partySlots();P[sel.i]=null;G.party=P.filter(Boolean);V.swapSel={i:Math.min(sel.i,G.party.length),fill:1};saveGame();sfx('blip');render();},
  swapCancel(){V.swapSel=null;render();}
});
{const mt0=ACT.menuTab;ACT.menuTab=function(){V.swapSel=null;return mt0.apply(this,arguments);};}
{const gt0=ACT.gtab;if(gt0)ACT.gtab=function(){V.swapSel=null;return gt0.apply(this,arguments);};}
