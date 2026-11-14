// ===== econ11.js (v0.16.x): owner economy pass: forging starts at +0, selling consumables and safer gear sales, personal relics =====
// Runs last in MODS (after portrait10.js). Everything here wraps or rewrites at load; no new save fields.
//  1) Forged gear starts at +0 (it used to come out at +1, +2 late), same temper ladder as bought gear. Gold is re-priced so that gold plus the ore,
//     logs and herbs bought at the counter is ECON11.craftK (85%) of the shop price: cheaper than buying by a modest margin, with the monster
//     parts and the realm relic as the real gate (those are drops).
//  2) Selling: Alchemy's Sell tab gets an Items section (potions, tonics, cures, travel gear) at 40% of the list price (the same rule as gear:
//     0.4 x the pre-multiplier price, which is ECON11.sellK of what the shop charges today); tempered gear sells for its base value plus a quarter
//     of what the tempering added to its price; a confirm for Rare or better, tempered or unique gear; never worn gear (it is not in the pack),
//     the Stick, personal relics, bound, legend, signature and Medal gear, nor Camp Supplies.
//  3) Personal quest rewards (u_, ua_, uc_) are relics: they follow the best piece the shops can sell (tier = realm progress + 1, max 5) for the
//     hero's preferred weapon or armour type, at +3, plus the old 8% edge. Stats are computed from G, never saved, so old saves upgrade by themselves.
//  4) Best-in-slot thinking: bestTag shows what a piece gives at max temper (+3) and flags "worth tempering"; Equip best lists pack pieces that are
//     weaker today but beat the worn piece at max temper. Equip best itself still equips by today's stats.
const ECON11={craftK:.85,sellK:.4,itemSell:.4,tempBonus:.25,confirmTier:2,relicEdge:1.08,relicTemper:1.75/* gear16: the old +3 factor as a number; FORGE_STEP changed and relics keep their strength */};

// ----- 1) forged gear starts at +0 -----
(function(){const buy=m=>Object.keys(m).reduce((s,k)=>s+(MAT_PRICE[k]||0)*m[k],0);/* relics ($rel...) are not in MAT_PRICE: not counted */
  RECIPES.forEach(r=>{if(!r.id||!SMITH_CATS.includes(r.cat))return;const q=String(r.id).match(/^(.*)\+(\d)$/);if(!q)return;const g0=GEAR[q[1]];if(!g0)return;
    r.id=q[1];r.g=Math.max(Math.round(g0.price*.15),Math.round(g0.price*ECON11.craftK-buy(r.m)));r.plus0=1;});
  _recOut=null;})();
{const mr0=m3Recipes;m3Recipes=function(cats,sec,blurb){if(/^Smithy gear comes out already tempered/.test(blurb||''))blurb='Forged gear starts at +0, just like a shop piece, and is tempered at the same price afterwards. It costs a little less in gold and ore than buying, and every piece wants monster parts. Metal wants ore, wooden gear wants logs.';return mr0.call(this,cats,sec,blurb);};}

// ----- 3) personal relics -----
const REL_RE=/^u[ac]?_/;
const relicCache={};
function relicTierNow(){if(!G)return 4;const S=Math.max(G.stage||0,(G.cleared||[]).filter(Boolean).length);return Math.min(5,S+1);}
function relicBuild(id,t){const b=GEAR[id],hero=b.only,tp=TPL[hero];if(!tp)return b;const cls=tp.cls,k=ECON11.relicEdge*ECON11.relicTemper,o=Object.assign({},b);
  const name=String(b.n).replace(/^(.*?)'s\s+/,(m,n)=>n+"'s Relic ");
  if(b.slot==='c'){const f=Math.max(1,WP[t]/WP[4]*ECON11.relicTemper);ST.forEach(s=>{if(b[s]>0)o[s]=Math.round(b[s]*f);});}
  else{const fam=b.slot==='w'?'w_'+CF[cls][0]+'_'+t:'a_'+ARM_FAM[CLS_ARM[cls]||'medium']+'_'+t,base=GEAR[fam];
    if(base)ST.forEach(s=>{if(base[s]>0){o[s]=Math.max(b[s]||0,Math.round(base[s]*k));}else if(base[s]&&b[s]==null)o[s]=base[s];});}/* penalties (armour SPD and MP) stay as they were */
  if(b.attr)o.attr=Object.assign({},b.attr,Object.fromEntries(Object.keys(b.attr).map(a=>[a,b.attr[a]+(t>=4?6:t>=3?4:2)])));
  o.n=name;o.tier=Math.max(b.tier||0,Math.min(5,t));o.relic=1;o.plus=0;return o;}
function relicGear(id){const t=relicTierNow(),key=id+'|'+t;return relicCache[key]||(relicCache[key]=relicBuild(id,t));}
Object.keys(GEAR).forEach(id=>{const g=GEAR[id];if(REL_RE.test(id)&&g.only&&TPL[g.only]&&id.endsWith('_'+g.only)){g.relic=1;g.bound=1;}});
{const go0=gearOf;gearOf=function(id){if(typeof id==='string'&&id.charCodeAt(0)===117&&G){const g=GEAR[id];if(g&&g.relic)return relicGear(id);}return go0.apply(this,arguments);};}

// ----- selling -----
// who never goes over the counter
function sellBlocked(id){const g=gearOf(id);return !g||!!(g.stick||g.only||g.bound||g.relic||g.medal||g.legend||g.sig||/^(u_|ua_|uc_|uk_|sg_)/.test(String(id)));}
function sellConfirm(id){const g=gearOf(id);return !!g&&(gTierIdx(g)>=ECON11.confirmTier||plusOf(id)>0||!!g.unique||!!g.ef);}
// base value (sellVal: 0.4 x the pre-multiplier price) plus a quarter of what tempering added to the price
function sellGold(id){const g=gearOf(id);if(!g)return 0;const b=GEAR[baseIdOf(id)]||g,sc=(b.price0&&b.price)?b.price0/b.price:1,add=Math.max(0,(g.price||0)-(b.price||0))*sc;return Math.max(1,sellVal(b)+Math.round(add*ECON11.tempBonus));}
{const sr0=m3SellRows;m3SellRows=function(slots){if(E11.item)return '';let h=sr0.apply(this,arguments);
  try{h=h.replace(/<button class="btn sm" data-act="sell" data-arg="([^"]+)">Sell \d+<\/button>/g,(m,id)=>sellBlocked(id)?`<span class="sellno nums" title="Keepsakes and relics are never bought">Keepsake</span>`:`<button class="btn sm" data-act="sellAsk" data-arg="${id}">Sell ${fmt(sellGold(id))}</button>`);}catch(e){}return h;};}
ACT.sell=function(id){const i=G.gear.indexOf(id);if(i>=0&&!sellBlocked(id)){G.gear.splice(i,1);G.gold+=sellGold(id);saveGame();sfx('buy');}else if(i>=0){sfx('deny');toast('That one is not for sale.');}render();};
ACT.sellAsk=function(id){if(!G||sellBlocked(id)||!G.gear.includes(id)){sfx('deny');render();return;}
  if(sellConfirm(id)){V.modal={type:'sellask',id,from:V.modal};render();}else ACT.sell(id);};
ACT.sellGo=function(id){const m=V.modal,from=m&&m.type==='sellask'?m.from:null;if(from)V.modal=from;ACT.sell(id);};
HOOK.before('vModal','econ11','confirm selling good gear',function(m){if(!m||m.type!=='sellask')return;const id=m.id,g=gearOf(id);if(!g||!G.gear.includes(id))return HOOK.stop(box('Sell this?','<p>That piece is no longer in your pack.</p>','<button class="btn gold" data-act="xBack">OK</button>'));
  return HOOK.stop(box('Sell this?',`<div class="row tr" style="${tierVars(gTierIdx(g),g)}">${gearIcon(id)}<div class="grow"><b>${esc(g.n)}</b> ${tierChip(g)}<small>${gearDesc(g)}</small></div></div><p class="note">The counter pays <b class="nums">${fmt(sellGold(id))}</b> gold. Buying it back costs ${fmt(GEAR[baseIdOf(id)].price)} gold or more.</p>`,
    `<button class="btn" data-act="xBack">Keep it</button><button class="btn gold" data-act="sellGo" data-arg="${id}">Sell for ${fmt(sellGold(id))}</button>`));});
// consumables at Alchemy
function itemBuyValue(id){const o=ITEMS[id];if(!o)return 0;if(o.price0||o.price)return o.price0||o.price;
  const r=RECIPES.find(x=>x.item===id);if(!r)return 0;return r.g+Object.keys(recipeMats(r)).reduce((s,k)=>s+(MAT_PRICE[k]||PART_PRICE[k]||12)*recipeMats(r)[k],0);}
const ITEM_NOSELL=['campkit'];
function itemSellGold(id){return Math.max(1,Math.round(itemBuyValue(id)*ECON11.itemSell));}
function sellableItems(){return Object.keys(G.inv||{}).filter(id=>ITEMS[id]&&(G.inv[id]||0)>0&&!ITEM_NOSELL.includes(id)&&!ITEMS[id].key&&!ITEMS[id].quest);}
function itemSellRows(){const L=sellableItems().sort((a,b)=>iTierIdx(b)-iTierIdx(a)||ITEMS[a].n.localeCompare(ITEMS[b].n));
  return L.map(id=>{const o=ITEMS[id],n=G.inv[id];return `<div class="row tr" style="${tierVars(iTierIdx(id))}"><div class="grow"><b>${itemIcon(id)} ${o.n}</b> ${itemChip(id)}<small class="nums">You have ${n}. ${itemSellGold(id)} gold each.</small></div><div class="btnrow tight"><button class="btn sm" data-act="sellItem" data-arg="${id},1">Sell 1 · ${fmt(itemSellGold(id))}</button>${n>=5?`<button class="btn sm" data-act="sellItem" data-arg="${id},5">Sell 5</button>`:''}</div></div>`;}).join('')||'<p class="note">No potions, tonics or travel gear to sell.</p>';}
ACT.sellItem=function(a){const [id,n0]=String(a).split(','),n=Math.max(1,Math.min(+n0||1,G.inv[id]||0));if(!G||!ITEMS[id]||ITEM_NOSELL.includes(id)||(G.inv[id]||0)<n){sfx('deny');render();return;}
  G.inv[id]-=n;if(G.inv[id]<=0)delete G.inv[id];G.gold+=itemSellGold(id)*n;saveGame();sfx('buy');render();};
const E11={item:false,on:false,all:false};
{const ms0=m3Secs;m3Secs=function(t,tab){const S=ms0.apply(this,arguments);try{if(t==='workshop'&&tab==='sell'&&G)return S.concat([['item','Items',sellableItems().length]]);}catch(e){}return S;};}
{const mh0=matSellRows;matSellRows=function(kinds){const h=mh0.apply(this,arguments);if(!E11.on||!(kinds.length===1&&kinds[0]==='herb'))return h;
  return E11.item?itemSellRows():!E11.all?h:h+'</div>'+m3H('Items')+'<div class="rows">'+itemSellRows();};}
{const jb0=junkBar;junkBar=function(){return E11.item?'':jb0.apply(this,arguments);};}
{const ma0=m3Alchemy;m3Alchemy=function(m){if(!m||m.tab!=='sell')return ma0.apply(this,arguments);E11.on=true;E11.item=m.sec==='item';E11.all=m.sec==='all';
  try{let h=ma0.apply(this,arguments);if(E11.item)h=h.replace('<p class="note empty">No spare charms. Weapons and armor sell at the Smithy.</p>','');return h;}finally{E11.on=false;E11.item=false;E11.all=false;}};}
{const sm0=m3Smithy;m3Smithy=function(m){let h=sm0.apply(this,arguments);try{h=h.replace('Charms and herbs sell at Alchemy.','Charms, herbs, potions and tonics sell at Alchemy.');}catch(e){}return h;};}

// ----- 4) best in slot at max temper -----
{const bt1=bestTag;bestTag=function(id){let h=bt1.apply(this,arguments);try{if(!G||G.daily)return h;const g=gearOf(id);if(!g||g.stick||g.relic)return h;
  const L=partyChars().filter(c=>canEquip(c,id)).map(c=>({c,g:maxGainFor(c,id)})).filter(o=>maxBeats(o.g)).sort((a,b)=>b.g.pct-a.g.pct);if(!L.length)return h;
  if(!gainersFor(id).length)h=h.replace('Would not help anyone in your active party.','Not better today, but worth tempering.');
  h+=`<small class="mxt"><b>At max temper (+${TEMPER_TOP}):</b> ${L.slice(0,3).map(o=>`${esc(o.c.name)} ${esc(maxDeltaTxt(o.c,id,false)||'better')} <em class="up">+${Math.max(1,Math.round(o.g.pct*100))}%</em>`).join('; ')}</small>`;}catch(e){}return h;};}
{const vm0=vsMark;vsMark=function(c,id){let h=vm0.apply(this,arguments);try{const g=gainFor(c,id);if(g&&!(g.d>.01&&g.pct>=.005)&&maxBeats(maxGainFor(c,id)))h+=' <span class="vs better mx">▲ Better at max temper</span>';}catch(e){}return h;};}
{const vp0=vsParty;vsParty=function(id){let h=vp0.apply(this,arguments);try{if(/vs worse|vs same/.test(h)&&partyChars().some(c=>canEquip(c,id)&&maxBeats(maxGainFor(c,id))))h+=' <span class="vs better mx">▲ Better at max temper</span>';}catch(e){}return h;};}
// Equip best: by today's stats (unchanged), then a note for pack pieces that need tempering to beat what is worn
function worthTempering(){const out=[];if(!G)return out;partyChars().forEach(c=>EQSL.forEach(sl=>{let best=null;
  [...new Set(G.gear)].forEach(id=>{if(!slotOk(c,sl,id)||!forgeCost(id))return;const g=gainFor(c,id);if(g&&g.d>.01)return;const mg=maxGainFor(c,id);if(!maxBeats(mg))return;if(!best||mg.d>best.mg.d)best={id,mg};});
  if(best)out.push({c,sl,id:best.id,mg:best.mg});}));return out.sort((a,b)=>b.mg.pct-a.mg.pct);}
{const ma1=mAutoEq;mAutoEq=function(m){let h=ma1.apply(this,arguments);try{if(!m||!G||m.mode==='smith')return h;const W=worthTempering().slice(0,5);if(!W.length)return h;
  const i=h.lastIndexOf('<div class="btnrow">');if(i<0)return h;
  const blk=`<div class="e11worth"><h4>Worth tempering</h4><p class="note">Weaker than what they wear today, so Equip best left them in the pack, but better at max temper (+${TEMPER_TOP}).</p><div class="rows">${W.map(o=>`<div class="row tr" style="${tierVars(gTierIdx(gearOf(o.id)),gearOf(o.id))}">${gearIcon(o.id)}<div class="grow"><b>${esc(gearOf(o.id).n)}</b> for ${esc(o.c.name)}<small class="mxt">${esc(maxDeltaTxt(o.c,o.id,false)||'better')} at max temper <em class="up">+${Math.max(1,Math.round(o.mg.pct*100))}%</em></small></div></div>`).join('')}</div></div>`;
  h=h.slice(0,i)+blk+h.slice(i);}catch(e){}return h;};}
try{const st=document.createElement('style');st.textContent=`.mxt{display:block;color:#9fe0b0}.mxt b{color:inherit}.vs.mx{margin-left:4px}.sellno{opacity:.6;font-size:.82rem;padding:2px 6px;border:1px dashed currentColor}.tcost{margin:4px 0}.e11worth{margin-top:.5em}`;document.head.appendChild(st);}catch(e){}
window.__E11={ECON11,sellGold,sellBlocked,sellConfirm,itemSellGold,sellableItems,relicGear,relicTierNow,worthTempering,maxGainFor:(c,id)=>maxGainFor(c,id),maxTemperId,ceilOk:(c,id)=>ceilOk(c,id),get G(){return G}};
