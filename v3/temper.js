// ===== temper.js (v0.2.0): tempering (+1 to +3, was the Forge) =====
// Each +1 (up to +3) needs the item's raw material at its tier, a monster part for its family, this realm's relic,
// and a Dread Core for +3. Gold is the old forge gold minus what the raw material costs at the Smithy, so buying the
// raw material and tempering costs the same gold as before, and the monster parts are the new gate on top.
// TEMPER: in config.js
const FAM_RAW=Object.assign(Object.fromEntries(Object.entries(FAM_MAT_V35).map(([k,v])=>[k,v[0]])),{tome:'wood',blade:'ore',dagger:'ore',crossbow:'ore',mail:'ore',staff:'wood',bow:'wood',robe:'wood',vest:'wood',charm:'herb'});
const FAM_PART=Object.assign(Object.fromEntries(Object.entries(FAM_MAT_V35).map(([k,v])=>[k,v[1]])),{tome:'ichor',blade:'fang',dagger:'fang',crossbow:'fang',staff:'ichor',bow:'hide',mail:'scale',robe:'ichor',vest:'hide',charm:'grit'});
function gearFam(id){const b=baseIdOf(id);if(b.startsWith('c_'))return 'charm';const p=b.split('_');return p[1]||'blade';}
function temperRaw(id){const g=gearOf(baseIdOf(id)),f=FAM_RAW[gearFam(id)]||'ore',t=g?(g.tier<=1?0:g.tier<=3?1:2):0;return TIERED[f][t];}
function forgeCost(id){
  const n=plusOf(id),g=gearOf(baseIdOf(id));if(!g||n>=3||g.stick||g.relic)return null;/* v0.16.1: a personal relic is already at its top */
  const raw=temperRaw(id),part=FAM_PART[gearFam(id)],rel=ZS(G.stage).mat,m={};
  const add=(k,v)=>{if(v)m[k]=(m[k]||0)+v;};
  add(raw,TEMPER.raw[n]);add(part,TEMPER.part[n]);add(rel,TEMPER.relic[n]);add('core',TEMPER.core[n]);
  const old=Math.round(g.price*TEMPER.goldK[n]),rawCost=(MAT_PRICE[raw]||0)*TEMPER.raw[n];
  return {gold:Math.max(Math.round(old*TEMPER.floor),old-rawCost),m,next:baseIdOf(id)+'+'+(n+1),old};
}
// what the Smithy can sell you toward a cost, and what it can't
function buyPlan(m){let gold=0,ok=true;const buy=[],cant=[];
  Object.keys(m).forEach(k=>{const miss=Math.max(0,m[k]-(G.mats[k]||0));if(!miss)return;
    if(MAT_PRICE[k]&&MAT_OF[k].k!=='herb'&&smithMatStock().includes(k)){buy.push([k,miss,'mat']);gold+=MAT_PRICE[k]*miss;}
    else if(MAT_PRICE[k]&&MAT_OF[k].k==='herb'&&herbStock().includes(k)){cant.push(k);ok=false;}
    else if(PART_PRICE[k]&&partLeft(k)>=miss){buy.push([k,miss,'part']);gold+=partPrice(k)*miss;}
    else{cant.push(k);ok=false;}});
  return {gold,buy,cant,ok,any:buy.length>0};}
function doBuyPlan(P){if(!P.any||G.gold<P.gold)return false;P.buy.forEach(([k,n,t])=>{if(t==='part')buyPart(k,n);else buyMat(k,n);});saveGame();return true;}
// v0.5.0 1.9: how much a temper improves the piece (for the wearer, or the best party member for a spare) and how close it is
function temperRank(o){const c=forgeCost(o.id);if(!c)return {ready:0,gain:0,close:0};
  const have=hasMats(c.m),ready=have&&G.gold>=c.gold?1:0;let gain=0;
  try{if(o.where==='eq'){const g=gainFor(G.roster[o.ref.cid],c.next);gain=g?g.d:0;}
    else gain=Math.max(0,...partyChars().map(h=>{const g=gainFor(h,c.next);return g?g.d:0;}));}catch(e){}
  let need=0,got=0;Object.keys(c.m).forEach(k=>{need+=c.m[k];got+=Math.min(c.m[k],G.mats[k]||0);});
  const close=(need?got/need:1)*.7+Math.min(1,c.gold?G.gold/c.gold:1)*.3;
  return {ready,gain,close};}
// v0.6.3: the ordered Tempering list on its own (section counts), and vTemper(o) with o.slot ('w','a','k','c'), o.show ('all','ready','eq','spare') and o.bar (the dropdown)
function temperList(){
  const list=[];partyChars().forEach(c=>EQSL.forEach(sl=>{if(c.eq[sl])list.push({where:'eq',ref:{cid:c.id,slot:sl},id:c.eq[sl],who:c.name});}));
  // v0.5.1: identical spares share one row (tempering works on the first copy); a full pack listed hundreds of the same rows
  {const seen={};G.gear.forEach((id,i)=>{if(seen[id]){seen[id].n++;seen[id].who='Pack (x'+seen[id].n+')';return;}list.push(seen[id]={where:'spare',ref:i,id,who:'Pack',n:1});});}
  // v0.4.3: only what can be tempered, highest rarity first, then the highest temper level
  return temperOrder(list.filter(o=>gearOf(o.id)&&forgeCost(o.id)));// v0.5.0 3.1 (and 1.9): temperOrder lives in p3shop.js
}
function vTemper(opt){opt=opt||{};
  let tl=temperList();const n0=tl.length;
  if(opt.slot)tl=tl.filter(o=>gearOf(o.id).slot===opt.slot);
  if(opt.show==='ready')tl=tl.filter(o=>temperReady(o));else if(opt.show==='eq')tl=tl.filter(o=>o.where==='eq');else if(opt.show==='spare')tl=tl.filter(o=>o.where!=='eq');
  const why=typeof temperWhy==='function'?temperWhy(tl):{};// v0.5.1 3.1: tradeoff line between close options
  const rowOf=(o,ti)=>{const c=forgeCost(o.id),g=gearOf(o.id);if(!g)return '';
    if(!c)return `<div class="row rec tr" style="${tierVars(gTierIdx(g),g)}">${gearIcon(o.id)}<div class="grow"><b>${g.n}</b> ${tierChip(g)}<small>${esc(o.who)}. ${gearDesc(g)}</small><small class="up">${g.stick?'The Stick grows with your Bestiary, not the anvil.':'Fully tempered.'}</small></div></div>`;
    const have=hasMats(c.m),ok=have&&G.gold>=c.gold,P=have?null:buyPlan(c.m),nx=gearOf(c.next);
    const herbNote=P&&P.cant.some(k=>MAT_OF[k]&&MAT_OF[k].k==='herb')?' Herbs are at Alchemy.':'';
    return `<div class="row rec tr ${ok?'ready':''}" style="${tierVars(gTierIdx(g),g)}">${gearIcon(o.id)}<div class="grow"><b>${g.n} → +${plusOf(c.next)}</b> ${tierChip(g)}<div class="mats tcost" aria-label="Cost of this temper">${matChips(c.m)}<span class="matc gold ${G.gold>=c.gold?'':'short'}"><i></i><b class="nums">${fmt(c.gold)}</b> gold</span></div><small>${o.where==='eq'?vsMark(G.roster[o.ref.cid],c.next):vsParty(c.next)}</small>${maxTemperLine(o,c)}${why[ti]?`<small class="p3why">⇄ ${why[ti]}</small>`:''}<small>${esc(o.who)}. Now: ${gearDesc(g)}</small><small>Next: ${gearDesc(nx)}</small>${o.where==='eq'?`<small>${esc(o.who)}: ${deltaHtml(G.roster[o.ref.cid],c.next)}</small>`:bestTag(c.next)}
      ${P&&P.cant.length?`<small class="warn">Still need ${P.cant.map(k=>MATS[k]).join(', ')}: ${P.cant.some(k=>MAT_OF[k]&&(MAT_OF[k].k==='relic'))?'relics and Dread Cores come from foes. ':''}${P.cant.some(k=>PART_PRICE[k])?'the counter is out of that part until you rest. ':''}${herbNote}</small>`:''}</div>
      <div class="btnrow tight col">${P&&P.any?`<button class="btn sm" data-act="temperBuy" data-arg='${JSON.stringify({w:o.where,r:o.ref})}' ${G.gold>=P.gold?'':'disabled'} title="Buy the missing ore, logs and parts here">Buy missing <span class="nums">${fmt(P.gold)}</span></button>`:''}<button class="btn sm ${ok?'gold':''}" data-act="forge" data-arg='${JSON.stringify({w:o.where,r:o.ref})}' ${ok?'':'disabled'} title="${ok?'Temper for '+fmt(c.gold)+' gold and the materials shown':'Missing gold or materials: '+fmt(c.gold)+' gold needed'}">Temper · <span class="nums">${fmt(c.gold)}g</span></button></div></div>`;};
  const rows=tl.map(rowOf).join('');
  const bar=opt.bar&&typeof ddBar==='function'?ddBar([ddSel('Show','tShow','t',[['all','Everything'],['ready','Ready to temper'],['eq','Worn by the party'],['spare','Spares in the pack']],opt.show||'all')],'shopf'):'';
  const empty=n0&&(opt.slot||(opt.show&&opt.show!=='all'))?'<p class="note empty">Nothing here matches. Try another section or Show: Everything.</p>':'<p class="note empty">Nothing to temper right now. Fully tempered gear and the Tamer\'s Stick are not listed.</p>';
  return `${bar}<details class="m3how"><summary>How tempering works</summary><p class="note">Each level adds 25% to an item's stats, up to +3. Every level needs the item's own raw material (ore, logs or herbs at its tier), a monster part for its kind (fangs for blades and daggers, scales for mail, ichor for staves and robes, hide for bows and garb, grit for charms), this realm's relic (${MATS[ZS(G.stage).mat]}), and gold. +3 also needs a Dread Core. The Smithy sells ore, logs and a few parts right here.</p></details>${rows?`<div class="rows">${rows}</div>`:empty}`;
}
Object.assign(ACT,{
  temperBuy(a){const o=JSON.parse(a),id=o.w==='spare'?G.gear[o.r]:G.roster[o.r.cid].eq[o.r.slot];const c=id&&forgeCost(id);if(!c)return;
    if(doBuyPlan(buyPlan(c.m))){sfx('buy');toast('Bought what the Smithy had.');}else sfx('deny');render();}
});
ACT.forge=function(a){const o=JSON.parse(a);const r=forge(o.w,o.r);if(r){toast('Tempered: '+gearOf(r).n);sfx('chest');}else sfx('deny');render();};

// ===== v0.16.1: max-temper projection =====
// The top of the ladder for a piece is its +3 form (TEMPER arrays have three steps). Gear is judged at that ceiling when asking "is it worth
// tempering" and "is this really an upgrade": a candidate beats the worn piece only if its +3 value beats the worn piece's +3 value (ties
// stay with the worn one). Equip best still equips by what the pieces give TODAY.
const TEMPER_TOP=TEMPER.raw.length;
function maxTemperId(id){if(!id)return id;const b=baseIdOf(id),g=gearOf(b);if(!g||g.stick||g.relic)return id;return b+'+'+TEMPER_TOP;}
function maxStats(c,sl,id){return statsWith(c,sl,maxTemperId(id));}
function maxScoreOf(c,sl,id){const k='ms'+c.id+'|'+sl+'|'+(id||'');if(typeof FITC!=='undefined'&&FITC&&FITC[k]!=null)return FITC[k];
  const v=loadoutScore(c,id?maxStats(c,sl,id):statsWith(c,sl,null));if(typeof FITC!=='undefined'&&FITC)FITC[k]=v;return v;}
// {d,pct} : candidate id at +3 against what the hero wears in its slot at +3 (nothing worn: against an empty slot)
function maxGainFor(c,id){const g=gearOf(id);if(!g||!canEquip(c,id))return null;const sl=g.slot,w=c.eq[sl]||null,a=maxScoreOf(c,sl,w),b=maxScoreOf(c,sl,id);return {d:b-a,pct:a>0?(b-a)/a:0,sl};}
const maxBeats=g=>!!g&&g.d>.01&&g.pct>=.005;
function ceilOk(c,id){const g=maxGainFor(c,id);return !!g&&maxBeats(g);}
// "+14 ATK, +30 HP" : the biggest gains (weighted by what the class values) of candidate +3 over the worn +3; vs 'now' compares to today's stats
function maxDeltaTxt(c,id,vsNow){const g=gearOf(id);if(!g)return '';const sl=g.slot,w=c.eq[sl]||null,A=vsNow?c.S:(w?maxStats(c,sl,w):statsWith(c,sl,null)),B=maxStats(c,sl,id),W=CLASS_W[TPL[c.id].cls]||{atk:1,mag:1};
  return DSTAT.map(([k,n])=>({n,d:Math.round((B[k]||0)-(A[k]||0)),k})).filter(x=>x.d>0).sort((x,y)=>y.d*(W[y.k]||.1)-x.d*(W[x.k]||.1)).slice(0,3).map(x=>'+'+x.d+' '+x.n).join(', ');}
// a line for a Tempering row: the piece at +3 against what the hero wears now, or against the best party member for a pack spare
function maxTemperLine(o,c){try{if(!G)return '';const mid=maxTemperId(c.next);if(plusOf(c.next)>=TEMPER_TOP)return '';
  let h=o.where==='eq'?G.roster[o.ref.cid]:null,t='';
  if(h){t=maxDeltaTxt(h,o.id,true);return t?`<small class="mxt">At max temper (+${TEMPER_TOP}): ${t} over now</small>`:'';}
  const L=partyChars().filter(x=>canEquip(x,o.id)).map(x=>({x,g:maxGainFor(x,o.id)})).filter(q=>q.g&&maxBeats(q.g)).sort((a,b)=>b.g.pct-a.g.pct);
  if(!L.length)return '';t=maxDeltaTxt(L[0].x,o.id,false);return `<small class="mxt">At max temper (+${TEMPER_TOP}): ${esc(L[0].x.name)} ${t||'gains'} over what they wear at max</small>`;}catch(e){return '';}}
