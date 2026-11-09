// ===== results.js (v0.6.1): the battle rewards screen (mResult) =====
// One screen, top to bottom by how much it needs the player:
//   1. a beaten foe that can be tamed (it used to sit in the middle of the list and was easy to miss);
//   2. new skills; 3. who joined (Legendary only for the legendary heroes; a wayfarer met on the road says so);
//   4. a compact rewards grid (gold, total XP, materials, items, spoils, bounty, arena, personal quest);
//   5. every hero who took part with the XP they actually gained (catch-up bonus included), level ups and points to spend;
//   6. quest, bond and story notes.
// Continue with a tame still pending does not throw it away: the footer asks "Tame it" or "Leave it".
// v0.9.5 (NUDGE in config.js): the manual bonus line (a hand played win shows "+52% for playing it yourself", the same totals as before)
// and small system bonuses (reaction, shield broken, telegraph guarded, Momentum Surge, tame), each a share of the win's XP and gold, capped.
// Per-hero XP is measured, not guessed: win() is wrapped to snapshot each hero's total XP before and after (info.xpBy).
function rsTotXp(c){let t=c.xp||0;for(let l=1;l<c.lv;l++)t+=need(l);return t;}
HOOK.wrap('win','results','reward screen data',function(next,...a){let snap=null;try{if(B&&G&&B.spec&&B.spec.kind!=='daily'){snap={};B.front.concat(B.back).forEach(c=>{if(c&&c.id&&G.roster[c.id])snap[c.id]={xp:rsTotXp(G.roster[c.id]),lv:G.roster[c.id].lv,front:B.front.includes(c),alive:c.hp>0};});}}catch(e){snap=null;}
  const r=next(...a);
  try{const info=(B&&B.result)||(V.modal&&V.modal.info);if(snap&&info&&!info.nzDone)nzApply(info,snap);}catch(e){}
  try{const info=(B&&B.result)||(V.modal&&V.modal.info);if(snap&&info){info.xpBy=Object.keys(snap).map(id=>{const c=G.roster[id],s=snap[id];return {id,name:c.name,gain:Math.max(0,rsTotXp(c)-s.xp),lv0:s.lv,lv:c.lv,front:s.front,alive:s.alive};});}}catch(e){}
  try{if(V.modal&&V.modal.type==='result')render();}catch(e){}
  return r;});
function rsTame(i){if(!i.tame||i.tamed)return '';const t=i.tame,mo=MON[t.mon]||guardianDef(t.mon);
  return `<div class="rs-tame ${i.tameWarn?'warn':''}" role="group" aria-label="Tame ${esc(t.name)}"><img src="${monURL(mo.art)}" alt=""><div class="grow"><b>${esc(t.name)} is beaten but breathing</b>
    <small>${t.bb?'Nikaris kneels and whistles softly. Beastbond: it would join with +12% stats and keep its own move. ':''}Tame it and it travels with you as a Pet. ${i.tameWarn?'<strong>Leave now and it is gone for good.</strong>':''}</small>
    <div class="btnrow"><button class="btn sm gold" data-act="tame">Tame it</button><button class="btn sm" data-act="untame">Let it go</button></div></div></div>`;}
function rsJoin(i){const out=[];
  if(i.tamed)out.push(`<div class="rs-join"><b>${esc(i.tamed)}</b><span>Tamed, now a Pet</span></div>`);
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
  return (rows.length?`<div class="rows">${rows.join('')}</div>`:'')+(i.notes||[]).map(n=>`<p class="note echonote">${esc(n)}</p>`).join('')+(i.autoNew&&i.autoNew.length?`<p class="note rs-autonew">Auto unlocked against ${i.autoNew.map(esc).join(', ')}: beaten by hand ${NUDGE.autoKills} times.</p>`:'');}
// ----- v0.9.5 bonuses -----
const NZ_LAB={react:'Reaction set off',brk:'Shield broken',guard:'Guarded a telegraphed hit',surge:'Momentum Surge reached',tame:'Creature tamed'};
// the battle part of a win's gold (bounty and arena prizes are fixed sums, outside the auto/manual gap and the bonuses)
function nzBattleGold(info,spec){let g=info.gold||0;try{if(spec&&spec.kind==='elite'&&spec.bounty&&!spec.bounty.personal)g-=econG(spec.bounty.reward.gold);if(spec&&spec.kind==='arena'&&ARENA[spec.tier])g-=econG(ARENA[spec.tier].reward.gold);}catch(e){}return Math.max(0,g);}
// pay a share p of the win: each hero gets p of the XP they gained in it, and p of the battle gold; returns {xp (the most one hero got), gold}
function nzPay(info,p){const out={xp:0,gold:0};if(!(p>0))return out;const base=info.nzBase||{};
  Object.keys(base.by||{}).forEach(id=>{const c=G.roster[id],g=base.by[id];if(!c||!(g>0))return;const add=Math.round(g*p);if(add<=0)return;const ups=addXp(c,add);out.xp=Math.max(out.xp,add);
    if(ups.length){info.ups=info.ups||[];let u=info.ups.find(x=>x.name===c.name);if(!u){u={name:c.name,lv:c.lv,learned:[],pts:c.pts};info.ups.push(u);}u.lv=c.lv;u.pts=c.pts;u.learned=(u.learned||[]).concat(ups.flatMap(x=>x.learned));}});
  const g=Math.round((base.gold||0)*p);if(g>0){G.gold+=g;info.gold+=g;out.gold=g;}
  info.xp=(info.xp||0)+Math.round((base.xp||0)*p);
  try{const L=learnScanAll();if(L.length)info.learn=(info.learn||[]).concat(L);}catch(e){}
  return out;}
function nzApply(info,snap){info.nzDone=1;if(!B||!G||G.daily||!B.spec||B.spec.kind==='daily'||typeof NUDGE==='undefined'||!NUDGE.on)return;
  const by={};Object.keys(snap).forEach(id=>{const c=G.roster[id];if(c)by[id]=Math.max(0,rsTotXp(c)-snap[id].xp);});
  const gold=nzBattleGold(info,B.spec);info.nzBase={by,gold,xp:info.xp||0};
  // 1. the manual bonus: what this win pays over the same win on auto (these totals are what the game always paid)
  if(!info.autoCut){const k=1-AUTO_REW;info.manual={pct:manualBonusPct(),xp:Math.round((info.xp||0)*k),gold:Math.round(gold*k)};}
  // 2. the systems used in this battle, once each, within the cap
  const z=B.nz||{},S=NUDGE.sys,lines=[];let pct=0;
  ['react','brk','guard','surge'].forEach(k=>{if((z[k]||0)>0&&S[k]>0){const p=Math.min(S[k],Math.max(0,S.cap-pct));if(p>0){pct+=p;lines.push({k,p});}}});
  info.nz={lines,pct,xp:0,gold:0};if(pct>0){const o=nzPay(info,pct);info.nz.xp=o.xp;info.nz.gold=o.gold;}}
function rsBonus(i){const L=[],pc=p=>Math.round(p*100)+'%';
  if(i.manual)L.push(`<div class="rs-bon man"><b>+${i.manual.pct}% for playing it yourself</b><span>+${fmt(i.manual.xp)} XP, +${fmt(i.manual.gold)} gold over an auto win</span></div>`);
  else if(i.autoCut)L.push(`<div class="rs-bon auto"><b>Won on auto</b><span>Play a fight yourself for +${manualBonusPct()}% XP and gold.</span></div>`);
  const z=i.nz;if(z&&z.lines.length){z.lines.forEach(o=>L.push(`<div class="rs-bon sys"><b>${NZ_LAB[o.k]||o.k}</b><span>+${pc(o.p)} XP and gold</span></div>`));
    L.push(`<div class="rs-bon tot"><small>Systems bonus +${pc(z.pct)}${z.pct>=NUDGE.sys.cap-1e-9?' (the most one battle pays)':''}: up to +${fmt(z.xp)} XP a hero, +${fmt(z.gold)} gold</small></div>`);}
  return L.length?`<div class="rs-bons">${L.join('')}</div>`:'';}
// a tame on the rewards screen adds its bonus (within the cap)
{const t0=ACT.tame;ACT.tame=function(){const i=V.modal&&V.modal.info,was=i&&i.tamed;const r=t0.apply(this,arguments);
  try{if(i&&!was&&i.tamed&&i.nz&&!i.nzTame&&G&&!G.daily){i.nzTame=1;const S=NUDGE.sys,p=Math.min(S.tame||0,Math.max(0,S.cap-i.nz.pct));
    if(p>0){const o=nzPay(i,p);i.nz.lines.push({k:'tame',p});i.nz.pct+=p;i.nz.xp+=o.xp;i.nz.gold+=o.gold;
      (i.xpBy||[]).forEach(x=>{const c=G.roster[x.id];if(c&&i.nzBase.by[x.id]>0){x.gain+=Math.round(i.nzBase.by[x.id]*p);x.lv=c.lv;}});render();}}}catch(e){}return r;};}
function mResult(i){
  const pend=i.tame&&!i.tamed,foot=pend&&i.tameWarn?`<p class="rs-ask">${esc(i.tame.name)} is still waiting. Tame it, or leave it behind?</p><button class="btn gold" data-act="tame">Tame it</button><button class="btn" data-act="resultLeave">Leave it and continue</button>`:'<button class="btn gold" data-act="resultOk">Continue</button>';
  return `<div class="modal"><div class="panel box result rs"><h2>Victory</h2>
    ${rsTame(i)}
    ${(i.learn||[]).length?`<div class="learntop"><h4>New skills</h4><div class="rows">${i.learn.map(o=>`<div class="row learnr">${learnLine(o)}</div>`).join('')}</div></div>`:''}
    ${rsJoin(i)}${rsGrid(i)}${rsBonus(i)}${rsParty(i)}${rsNotes(i)}
    <div class="btnrow stickyb rs-foot">${foot}</div></div></div>`;}
{const ok0=ACT.resultOk;ACT.resultOk=function(){const i=V.modal&&V.modal.info;if(i&&i.tame&&!i.tamed&&!i.tameWarn){i.tameWarn=1;try{sfx('blip');}catch(e){}render();const p=document.querySelector('#modal .panel');if(p)p.scrollTop=0;return;}return ok0.apply(this,arguments);};}
HOOK.before('finishBattle','results','when the last battle ended (V.endT)',function(){V.endT=Date.now();});// v0.8.2: when the last battle ended (qready stays quiet then)
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
.rs .rs-foot{flex-wrap:wrap}
.rs .rs-bons{display:grid;gap:4px;margin:-4px 0 12px}.rs .rs-bon{display:flex;gap:2px 8px;align-items:baseline;flex-wrap:wrap;padding:4px 8px;border-radius:6px;background:rgba(255,208,74,.07)}
.rs .rs-bon b{color:#ffd04a;font-size:.92rem}.rs .rs-bon span{font-size:.8rem;opacity:.9;min-width:0;overflow-wrap:anywhere}.rs .rs-bon.man{border:1px solid rgba(255,208,74,.55);background:rgba(255,208,74,.12)}
.rs .rs-bon.auto{background:rgba(255,255,255,.04)}.rs .rs-bon.auto b{color:var(--mute,#aab)}.rs .rs-bon.tot{background:none;padding:0 8px}.rs .rs-bon.tot small{opacity:.8}
.rs .rs-autonew{color:#7affc8}`;document.head.appendChild(css);}catch(e){}
// v0.8.2 test aid: the last sounds asked for, by name (window.__SFX, at most 50)
{const s0=sfx;sfx=function(n){try{const L=window.__SFX=window.__SFX||[];L.push(n);if(L.length>50)L.shift();}catch(e){}return s0.apply(this,arguments);};}
