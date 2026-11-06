// ===== results.js (v0.6.1): the battle rewards screen (mResult) =====
// One screen, top to bottom by how much it needs the player:
//   1. a beaten foe that can be tamed (it used to sit in the middle of the list and was easy to miss);
//   2. new skills; 3. who joined (Legendary only for the legendary heroes; a wayfarer met on the road says so);
//   4. a compact rewards grid (gold, total XP, materials, items, spoils, bounty, arena, personal quest);
//   5. every hero who took part with the XP they actually gained (catch-up bonus included), level ups and points to spend;
//   6. quest, bond and story notes.
// Continue with a tame still pending does not throw it away: the footer asks "Tame it" or "Leave it".
// Per-hero XP is measured, not guessed: win() is wrapped to snapshot each hero's total XP before and after (info.xpBy).
function rsTotXp(c){let t=c.xp||0;for(let l=1;l<c.lv;l++)t+=need(l);return t;}
{const w0=win;win=function(){let snap=null;try{if(B&&G&&B.spec&&B.spec.kind!=='daily'){snap={};B.front.concat(B.back).forEach(c=>{if(c&&c.id&&G.roster[c.id])snap[c.id]={xp:rsTotXp(G.roster[c.id]),lv:G.roster[c.id].lv,front:B.front.includes(c),alive:c.hp>0};});}}catch(e){snap=null;}
  const r=w0.apply(this,arguments);
  try{const info=(B&&B.result)||(V.modal&&V.modal.info);if(snap&&info){info.xpBy=Object.keys(snap).map(id=>{const c=G.roster[id],s=snap[id];return {id,name:c.name,gain:Math.max(0,rsTotXp(c)-s.xp),lv0:s.lv,lv:c.lv,front:s.front,alive:s.alive};});}}catch(e){}
  try{if(V.modal&&V.modal.type==='result')render();}catch(e){}
  return r;};}
function rsTame(i){if(!i.tame||i.tamed)return '';const t=i.tame,mo=MON[t.mon]||guardianDef(t.mon);
  return `<div class="rs-tame ${i.tameWarn?'warn':''}" role="group" aria-label="Tame ${esc(t.name)}"><img src="${monURL(mo.art)}" alt=""><div class="grow"><b>${esc(t.name)} is beaten but breathing</b>
    <small>${t.bb?'Nikaris kneels and whistles softly. Beastbond: it would join with +12% stats and keep its own move. ':''}Tame it and it travels with you as a Companion. ${i.tameWarn?'<strong>Leave now and it is gone for good.</strong>':''}</small>
    <div class="btnrow"><button class="btn sm gold" data-act="tame">Tame it</button><button class="btn sm" data-act="untame">Let it go</button></div></div></div>`;}
function rsJoin(i){const out=[];
  if(i.tamed)out.push(`<div class="rs-join"><b>${esc(i.tamed)}</b><span>Tamed, now a Companion</span></div>`);
  if(i.gift)out.push(`<div class="rs-join">${port(i.gift,'sm')}<b>${TPL[i.gift].n} joins you</b><span>${elChips(TPL[i.gift].el)}</span></div>`);
  if(i.legend){const lab=i.legendKind==='duel'?'Duel won':i.legendKind==='wayfarer'?'A wayfarer joins':'Legendary';
    out.push(`<div class="rs-join ${lab==='Legendary'?'leg':''}"><b>${lab}</b><span>${esc(i.legend)}</span></div>`);}
  return out.length?`<div class="rs-sec">${out.join('')}</div>`:'';}
function rsGrid(i){const cell=(k,v,cls)=>`<div class="rs-cell ${cls||''}"><small>${k}</small><b>${v}</b></div>`,c=[];
  c.push(cell('Gold','+'+fmt(i.gold),'gold'));c.push(cell('Experience','+'+fmt(i.xp),'xp'));
  const mats=Object.keys(i.mats||{});if(mats.length)c.push(cell('Materials',mats.map(k=>i.mats[k]+' '+esc(MATS[k]||k)).join(', '),'wide'));
  if((i.drops||[]).length)c.push(cell('Found',i.drops.map(d=>`<span class="tfr" style="${tierVars(iTierIdx(d))}">${ITEMS[d].n} ${itemChip(d)}</span>`).join(' '),'wide'));
  if(i.gear){const g=gearOf(i.gear);c.push(`<div class="rs-cell wide tr" style="${tierVars(gTierIdx(g),g)}"><small>${i.personal?esc(i.personal)+"'s quest complete":'Spoils'}</small><b class="tfr">${gearIcon(i.gear)} ${g.n} ${tierChip(g)}</b></div>`);}
  if(i.bounty)c.push(cell('Bounty claimed',esc(i.bounty),'wide gift'));if(i.arena)c.push(cell('Arena cleared',esc(i.arena),'wide gift'));
  return `<div class="rs-grid">${c.join('')}</div>`;}
function rsParty(i){const cu={};(i.catchup||[]).forEach(r=>{cu[r.id]=r;});const ups={};(i.ups||[]).forEach(u=>{ups[u.name]=u;});
  const L=i.xpBy&&i.xpBy.length?i.xpBy:G.party.map(id=>G.roster[id]).filter(Boolean).map(c=>({id:c.id,name:c.name,gain:null,lv0:c.lv,lv:c.lv,alive:c.hp>0}));
  const top=(i.catchup||[]).reduce((a,r)=>Math.max(a,r.top||0),0);
  return `<h4>Your party</h4>${top?`<p class="note rs-cunote"><small>Catch up: heroes below your top wayfarer (Lv ${top}, counting your reserves) earn more XP.</small></p>`:''}<div class="rs-party">${L.map(o=>{const c=G.roster[o.id];if(!c)return '';const up=ups[c.name],k=cu[o.id];
    const gain=o.gain==null?'':!o.alive?'<em class="rs-none">Fallen: no XP</em>':`<em class="rs-gain">+${fmt(o.gain)} XP</em>`;
    return `<div class="rs-hero ${up?'up':''} ${o.alive?'':'ko'}">${port(c.id,'sm')}<div class="grow"><div class="rs-top"><b>${esc(c.name)}</b>${gain}${k?`<span class="rs-cu" title="Catch up: ${k.gap?k.gap+' level'+(k.gap===1?'':'s')+' below':'below'} your top wayfarer${k.top?' (Lv '+k.top+')':''}, counting your reserves. The further behind, the more XP">+${k.pct}% catch up</span>`:''}</div>
      ${up?`<div class="rs-lv">Level up! <b>Lv ${up.lv}</b>${up.pts?` <span class="up">${up.pts} stat point${up.pts>1?'s':''} to spend</span>`:''}</div>`:`<small>Lv ${c.lv}</small>`}${xpLine(c)}</div></div>`;}).join('')}</div>`;}
function rsNotes(i){const rows=[];(i.quests||[]).forEach(q=>rows.push(`<div class="row"><b>Quest ready</b><span>${esc(q)}</span></div>`));
  (i.bonds||[]).forEach(b=>rows.push(`<div class="row bondr"><b>Bond grows</b><span>${esc(b.a)} and ${esc(b.b)}: level ${b.lv}${b.lv===2?' (joint tech unlocked)':b.lv===1||b.lv===3?' (new campfire talk: make camp or open their sheets)':''}</span></div>`));
  return (rows.length?`<div class="rows">${rows.join('')}</div>`:'')+(i.notes||[]).map(n=>`<p class="note echonote">${esc(n)}</p>`).join('')+(i.autoCut?`<p class="note autocut">Won mostly on auto: ${Math.round(i.autoCut*100)}% XP and gold. Drops and loot are unchanged.</p>`:'');}
function mResult(i){
  const pend=i.tame&&!i.tamed,foot=pend&&i.tameWarn?`<p class="rs-ask">${esc(i.tame.name)} is still waiting. Tame it, or leave it behind?</p><button class="btn gold" data-act="tame">Tame it</button><button class="btn" data-act="resultLeave">Leave it and continue</button>`:'<button class="btn gold" data-act="resultOk">Continue</button>';
  return `<div class="modal"><div class="panel box result rs"><h2>Victory</h2>
    ${rsTame(i)}
    ${(i.learn||[]).length?`<div class="learntop"><h4>New skills</h4><div class="rows">${i.learn.map(o=>`<div class="row learnr">${learnLine(o)}</div>`).join('')}</div></div>`:''}
    ${rsJoin(i)}${rsGrid(i)}${rsParty(i)}${rsNotes(i)}
    <div class="btnrow stickyb rs-foot">${foot}</div></div></div>`;}
{const ok0=ACT.resultOk;ACT.resultOk=function(){const i=V.modal&&V.modal.info;if(i&&i.tame&&!i.tamed&&!i.tameWarn){i.tameWarn=1;try{sfx('blip');}catch(e){}render();const p=document.querySelector('#modal .panel');if(p)p.scrollTop=0;return;}return ok0.apply(this,arguments);};}
ACT.resultLeave=function(){const i=V.modal&&V.modal.info;if(i)i.tame=null;return ACT.resultOk();};
try{const css=document.createElement('style');css.textContent=`
.rs .rs-tame{display:flex;gap:10px;align-items:center;padding:10px;margin:2px 0 10px;border:2px solid #7affc8;border-radius:8px;background:rgba(122,255,200,.08);box-shadow:0 0 12px rgba(122,255,200,.25)}
.rs .rs-tame img{width:56px;height:56px;image-rendering:pixelated;flex:0 0 auto}.rs .rs-tame b{display:block;font-size:1.02rem}.rs .rs-tame small{display:block;margin:2px 0 6px}
.rs .rs-tame.warn{border-color:#ffd04a;box-shadow:0 0 14px rgba(255,208,74,.45);animation:rsPulse 1s ease-in-out 2}
@keyframes rsPulse{50%{transform:scale(1.015)}}@media (prefers-reduced-motion:reduce){.rs .rs-tame.warn{animation:none}}
.rs .rs-sec{display:grid;gap:6px;margin:0 0 10px}.rs .rs-join{display:flex;gap:8px;align-items:center;padding:6px 8px;border-radius:6px;background:rgba(255,255,255,.04)}.rs .rs-join b{white-space:nowrap}.rs .rs-join span{opacity:.9}
.rs .rs-join.leg{border:1px solid #ffd04a;background:rgba(255,208,74,.08)}
.rs .rs-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:0 0 12px}.rs .rs-cell{padding:6px 8px;border-radius:6px;background:rgba(255,255,255,.05)}.rs .rs-cell.wide{grid-column:1/-1}
.rs .rs-cell small{display:block;opacity:.75;font-size:.72rem;letter-spacing:.04em;text-transform:uppercase}.rs .rs-cell b{font-size:1.02rem}.rs .rs-cell.gold b{color:#ffd04a}.rs .rs-cell.xp b{color:#9ad0ff}
.rs .rs-party{display:grid;gap:6px;margin:0 0 10px}.rs .rs-hero{display:flex;gap:8px;align-items:center;padding:6px 8px;border-radius:6px;background:rgba(255,255,255,.04)}
.rs .rs-hero.up{background:rgba(255,208,74,.09);border:1px solid rgba(255,208,74,.5)}.rs .rs-hero.ko{opacity:.6}
.rs .rs-top{display:flex;gap:8px;align-items:baseline;flex-wrap:wrap}.rs .rs-gain{font-style:normal;color:#9ad0ff;font-weight:800}.rs .rs-none{font-style:normal;opacity:.75}
.rs .rs-cu{font-size:.72rem;color:#7affc8}.rs .rs-lv{color:#ffd04a;font-weight:700}.rs .rs-ask{width:100%;margin:0 0 6px;font-weight:700;color:#ffd04a}
.rs .rs-foot{flex-wrap:wrap}`;document.head.appendChild(css);}catch(e){}
