// ===== p3shop.js (v0.5.0): shops, gear and items: Best for party sorting, Smithy plan, Best Party scoring, pack size =====
// =================== Beta v0.5.0 PHASE 3: SHOPS, GEAR AND ITEMS ===================
// 3.1 "Best for party" order in shops, Forge and Tempering, with a tradeoff line when two upgrades are close.
// 3.2 an item one hero already wears is still suggested when it would help another party member (the second hero's gain is shown).
// 3.3 Smithy: "Upgrade whole party" (v0.9.5 name; was "Buy, craft and equip best gear": plan, confirm, run, Undo for the equips, clean stop when gold runs out).
// 3.4 Best Party reads the area and its boss (Bestiary, theme): delivery coverage, legal weapons, archetype and element answers, reasons per pick.
// 3.5 Team check on the Party tab and in Best Party: what is missing, who could fill it, one tap swap.
// 3.6 Boss readiness on the boss prompt, the story echo prompt and the Bestiary entry. Never blocks, never names unknown mechanics.
// 3.7 Holy Water: "Reapply automatically". 3.9 Pork Chop Sandwiches: two after the first boss win, "Use 2: return to town" in dungeons.
// Tunables: SHOP_BEST, SMITH_PLAN, BP_AWARE, READY, PORK, ITEM_MAX (config.js).
// New optional save fields: G.hwAuto (Holy Water toggle), G.p3pork (first boss sandwiches given). New META field: META.cfg.shopF.p3.
// Nothing here runs in the Daily Trial.

// ----- per render cache (gains are asked for many times while one screen is drawn) -----
let P3C=null;
HOOK.wrap('render','p3shop','per-render Best Party cache (P3C)',function(next,...a){P3C={why:{},kit:{}};try{return next(...a);}finally{P3C=null;}});
const p3c=()=>P3C||{why:{},kit:{}};

// ===================== 3.1 / 3.2: best for party =====================
// party gain of an item: the best share any active party member gains, and the sum over the party
function partyGainOf(id){const L=gainersFor(id);return L.length?{top:L[0].g.pct,sum:L.reduce((a,o)=>a+o.g.pct,0),c:L[0].c}:{top:0,sum:0,c:null};}
// the shop sort chips: "Best for party" is the new default (one time switch for players who never picked a sort)
function p3ShopDefault(){try{const o=META.cfg.shopF=META.cfg.shopF||{};if(!o.p3){o.p3=1;o.sort='best';try{saveMeta();}catch(e){}}}catch(e){}}
// short labels for the tradeoff line
const P3_GK={hp:'mhp',mp:'mmp'};
function p3Label(a,b){const ga=gearOf(a),gb=gearOf(b);if(ga.fam&&gb.fam&&ga.fam!==gb.fam&&WT_NAME[ga.fam]&&WT_NAME[gb.fam])return [WT_NAME[ga.fam],WT_NAME[gb.fam]];
  if(ga.weight&&gb.weight&&ga.weight!==gb.weight)return [ARM_NAME[ga.weight],ARM_NAME[gb.weight]];return [ga.n,gb.n];}
function p3Pros(a,b,c,costA,costB){const ga=gearOf(a),gb=gearOf(b),W=CLASS_W[TPL[c.id].cls]||{atk:1,mag:1},out=[];
  if(costA!=null&&costB!=null&&costA<costB*.9)out.push('cheaper');
  if(ga.fam&&ga.fam!==gb.fam&&WPERK[ga.fam])out.push(WPERK[ga.fam].s.replace(/^[^:]*:\s*/,''));
  const st=ST.map(s=>({s,d:(ga[s]||0)-(gb[s]||0)})).filter(o=>o.d>0).map(o=>Object.assign(o,{w:o.d*((W[P3_GK[o.s]||o.s])||.15)})).sort((x,y)=>y.w-x.w);
  st.slice(0,2).forEach(o=>out.push('more '+STN[o.s]));
  if(plusOf(a)>plusOf(b))out.push('already tempered');
  return out.slice(0,3);}
function p3Tradeoff(a,b,c,costA,costB){const [la,lb]=p3Label(a,b),A=p3Pros(a,b,c,costA,costB),Bp=p3Pros(b,a,c,costB,costA);if(!A.length&&!Bp.length)return '';
  return `${esc(c.name)}: ${esc(la)}: ${A.join(', ')||'about the same'}. ${esc(lb)}: ${Bp.join(', ')||'about the same'}.`;}
// mark close neighbours in an ordered list of {id,cost}; the line shows on the second row of each close pair
function p3MarkClose(rows){const W=p3c().why;
  for(let i=1;i<rows.length;i++){const a=rows[i-1],b=rows[i];if(!a.id||!b.id)continue;const pa=partyGainOf(a.id),pb=partyGainOf(b.id);
    if(!pa.c||!pb.c||pa.c!==pb.c||pa.top<SHOP_BEST.minPct||pb.top<SHOP_BEST.minPct)continue;
    if(gearOf(a.id).slot!==gearOf(b.id).slot)continue;
    const d=Math.abs(pa.top-pb.top);if(d>Math.max(SHOP_BEST.closeAbs,SHOP_BEST.closeRel*pa.top))continue;
    const t=p3Tradeoff(a.id,b.id,pa.c,a.cost,b.cost);if(t&&!W[b.id])W[b.id]=t;}}
function p3BestSort(ids,costOf){const A=ids.map((id,i)=>({id,i,g:partyGainOf(id)}));
  A.sort((x,y)=>(y.g.top>=SHOP_BEST.minPct)-(x.g.top>=SHOP_BEST.minPct)||y.g.top-x.g.top||y.g.sum-x.g.sum||x.i-y.i);
  p3MarkClose(A.filter(o=>o.g.top>=SHOP_BEST.minPct).map(o=>({id:o.id,cost:costOf(o.id)})));return A.map(o=>o.id);}
{const ss0=shopSortIds;shopSortIds=function(ids){p3ShopDefault();const r=ss0.apply(this,arguments);if(SHOPF().sort!=='best'||!G)return r;
  return p3BestSort(r,id=>GEAR[id]?GEAR[id].price:null);};}
// Forge: craftable first (the v0.4.0 rule), then the best upgrade for the party, then rarity
{const rl0=recipeList;recipeList=function(list){p3ShopDefault();const r=rl0.apply(this,arguments);if(SHOPF().sort!=='best'||!G)return r;
  const A=r.map((x,i)=>({r:x,i,ok:recipeReady(x),g:x.id?partyGainOf(x.id):{top:0,sum:0}}));
  A.sort((x,y)=>(y.ok-x.ok)||(y.g.top>=SHOP_BEST.minPct)-(x.g.top>=SHOP_BEST.minPct)||y.g.top-x.g.top||y.g.sum-x.g.sum||x.i-y.i);
  [true,false].forEach(ok=>p3MarkClose(A.filter(o=>o.ok===ok&&o.r.id&&o.g.top>=SHOP_BEST.minPct).map(o=>({id:o.r.id,cost:o.r.g}))));
  return A.map(o=>o.r);};}
// Tempering order (called from vTemper in temper.js). Ready now first, by the biggest gain for the party (1.9 and 3.1);
// then the rest by how close you are (materials and gold), then gain. Phase 1's 1.9 can use temperGain/temperClose as its keys.
function temperGain(o,c,memo){c=c||forgeCost(o.id);if(!c)return 0;
  if(o.where==='eq'){const h=G.roster[o.ref.cid],g=h&&gainFor(h,c.next);return g?Math.max(0,g.pct):0;}
  if(memo&&memo[c.next]!=null)return memo[c.next];const v=partyGainOf(c.next).top;if(memo)memo[c.next]=v;return v;}
function temperClose(o,c){c=c||forgeCost(o.id);if(!c)return 0;let n=0,t=0;Object.keys(c.m).forEach(k=>{t++;n+=Math.min(1,(G.mats[k]||0)/c.m[k]);});t++;n+=Math.min(1,G.gold/Math.max(1,c.gold));return n/t;}
function temperReady(o,c){c=c||forgeCost(o.id);return !!c&&hasMats(c.m)&&G.gold>=c.gold;}
function temperOrder(list){const memo={},fc={},A=list.map((o,i)=>{const c=fc[o.id]||(fc[o.id]=forgeCost(o.id)),ok=temperReady(o,c);return {o,i,ok,g:temperGain(o,c,memo),cl:ok?1:temperClose(o,c),t:gTierIdx(gearOf(o.id))};});
  A.sort((x,y)=>(y.ok-x.ok)||(x.ok?(y.g-x.g||y.t-x.t):(y.cl-x.cl||y.g-x.g||y.t-x.t))||plusOf(y.o.id)-plusOf(x.o.id)||(x.o.where==='eq'?0:1)-(y.o.where==='eq'?0:1)||x.i-y.i);
  return A.map(x=>x.o);}
// v0.5.1 3.1: the tradeoff line in Tempering. Two neighbours in the ordered list that improve the same hero by close amounts
// (the shop rule: SHOP_BEST.closeAbs or closeRel) get a short reason on the second row: what each temper adds for that hero's class,
// which costs less gold, which is ready now. Returns {index in the list: text}.
function temperWho(o,c){if(o.where==='eq')return G.roster[o.ref.cid];const g=partyGainOf(c.next);return g.c||null;}
function temperWhy(list){const out={},memo={};const R=list.map(o=>{const c=forgeCost(o.id);return c?{o,c,g:temperGain(o,c,memo),ok:temperReady(o,c),who:temperWho(o,c)}:null;});
  for(let i=1;i<R.length;i++){const a=R[i-1],b=R[i];if(!a||!b||!a.who||!b.who||a.who!==b.who||a.ok!==b.ok)continue;
    if(a.g<SHOP_BEST.minPct||b.g<SHOP_BEST.minPct)continue;if(Math.abs(a.g-b.g)>Math.max(SHOP_BEST.closeAbs,SHOP_BEST.closeRel*Math.max(a.g,b.g)))continue;
    const W=CLASS_W[TPL[a.who.id].cls]||{atk:1,mag:1},adds=x=>{const now=gearOf(x.o.id),nx=gearOf(x.c.next);return ST.map(st=>({st,d:((nx[st]||0)-(now[st]||0))*((W[P3_GK[st]||st])||.15)})).filter(q=>q.d>0).sort((p,q)=>q.d-p.d).slice(0,2).map(q=>'more '+STN[q.st]);};
    const pros=(x,y)=>{const L=adds(x),fx=gearOf(x.o.id).fam,fy=gearOf(y.o.id).fam;if(fx&&fx!==fy&&WPERK[fx])L.unshift(WPERK[fx].s.replace(/^[^:]*:\s*/,''));if(x.c.gold<y.c.gold*.9)L.unshift('cheaper');return L.slice(0,3);};
    const n=x=>gearOf(x.o.id).n+' to +'+plusOf(x.c.next);
    out[i]=`${esc(a.who.name)}: ${esc(n(a))}: ${pros(a,b).join(', ')||'about the same'}. ${esc(n(b))}: ${pros(b,a).join(', ')||'about the same'}.`;}
  return out;}
// 3.1 tradeoff line and 3.2 duplicate line, shown with the "Best for" tag of each row
{const bt0=bestTag;bestTag=function(id){let h=bt0.apply(this,arguments);try{if(!G||G.daily)return h;const g=gearOf(id);if(!g)return h;
    const wear=G.party.map(x=>G.roster[x]).filter(c=>c&&c.eq&&c.eq[g.slot]===id),L=gainersFor(id);
    if(wear.length&&L.length)h+=`<small class="p3dup">${wear.map(c=>esc(c.name)).join(' and ')} already ${wear.length>1?'wear':'wears'} one. A second one is still an upgrade for ${esc(L[0].c.name)} <em class="up">${pctTxt(L[0])}</em>.</small>`;
    const w=p3c().why[id];if(w)h+=`<small class="p3why">⇄ ${w}</small>`;}catch(e){}return h;};}

// ===================== 3.3: Smithy plan =====================
const P3_SLOTS=['w','a','k'];
function p3Recipes(){const o={};RECIPES.forEach(r=>{if(r.id&&SMITH_CATS.includes(r.cat)&&recipeOpen(r)&&!o[r.id])o[r.id]=r;});return o;}
function p3SmithPlan(){
  const party=partyChars();let gold=G.gold;const mats=Object.assign({},G.mats),pack={};G.gear.forEach(id=>{pack[id]=(pack[id]||0)+1;});
  const shop=new Set(shopStock('weapons').concat(shopStock('armor')).filter(id=>GEAR[id])),rec=p3Recipes();
  const cands=[...new Set([...shop,...Object.keys(rec),...Object.keys(pack)])].filter(id=>{const g=gearOf(id);return g&&!g.stick&&P3_SLOTS.includes(g.slot);});
  const ent=[];
  party.forEach(c=>P3_SLOTS.forEach(sl=>{const opts=cands.filter(id=>slotOk(c,sl,id)).map(id=>({id,g:gainFor(c,id)})).filter(o=>o.g&&o.g.d>.01&&o.g.pct>=SMITH_PLAN.minPct).sort((a,b)=>b.g.pct-a.g.pct||b.g.d-a.g.d);
    if(opts.length)ent.push({c,sl,opts});}));
  ent.sort((a,b)=>b.opts[0].g.pct-a.opts[0].g.pct);
  const hasM=m=>Object.keys(m).every(k=>(mats[k]||0)>=m[k]);
  const picks=[],cant=[];
  ent.forEach(e=>{let missed=null;
    for(const o of e.opts){const id=o.id,ways=[];
      if((pack[id]||0)>0)ways.push({src:'pack',gold:0});
      if(shop.has(id))ways.push({src:'buy',gold:GEAR[id].price});
      if(rec[id]){const m=recipeMats(rec[id]);ways.push({src:'craft',gold:rec[id].g,m,mOk:hasM(m)});}
      if(!ways.length)continue;
      const ok=ways.filter(w=>w.gold<=gold&&(w.src!=='craft'||w.mOk)).sort((a,b)=>a.gold-b.gold||(a.src==='buy'?-1:1));
      if(!ok.length){if(!missed){const cheapest=ways.slice().sort((a,b)=>a.gold-b.gold)[0];missed={cid:e.c.id,sl:e.sl,id,gold:cheapest.gold,pct:o.g.pct,why:ways.some(w=>w.src==='craft'&&!w.mOk)&&!ways.some(w=>w.src!=='craft')?'mats':'gold'};}continue;}
      const w=ok[0],alt=ways.filter(x=>x!==w&&x.src!=='pack').map(x=>({src:x.src,gold:x.gold}));
      if(w.src==='pack')pack[id]--;gold-=w.gold;if(w.src==='craft')Object.keys(w.m).forEach(k=>{mats[k]-=w.m[k];});
      picks.push({cid:e.c.id,sl:e.sl,id,src:w.src,gold:w.gold,m:w.m||null,pct:o.g.pct,alt,from:e.c.eq[e.sl]||null});
      if(missed&&missed.pct>o.g.pct+.001)cant.push(missed);missed=null;break;}
    if(missed)cant.push(missed);});
  const total=picks.reduce((a,p)=>a+p.gold,0);return {picks,cant,total,gold0:G.gold};}
const p3Src=p=>p.src==='pack'?'From your pack':p.src==='buy'?`Buy for <b class="nums">${fmt(p.gold)}</b> gold`:`Forge for <b class="nums">${fmt(p.gold)}</b> gold and materials you own`;
function mP3Plan(m){const P=m.plan,cn=id=>G.roster[id]?esc(G.roster[id].name):'?';
  const rows=P.picks.map(p=>{const c=G.roster[p.cid];if(!c)return '';const alt=p.alt.length?` <small class="mute">(${p.alt.map(a=>a.src==='buy'?'buying: '+fmt(a.gold):'forging: '+fmt(a.gold)+' and materials').join(', ')})</small>`:'';
    return `<div class="row p3pl">${port(p.cid,'sm')}<div class="grow"><b>${cn(p.cid)}</b> <em class="up">+${Math.max(1,Math.round(p.pct*100))}%</em><small>${SLOTN[p.sl]}: ${p.from?esc(gearOf(p.from).n):'nothing'} → <span class="up">${esc(gearOf(p.id).n)}</span> ${tierChip(gearOf(p.id))}</small><small>${p3Src(p)}${alt}</small><small>${deltaHtml(c,p.id)}</small></div></div>`;}).join('');
  const cant=P.cant.map(x=>`<div class="row"><div class="grow"><small><b>${cn(x.cid)}</b>: ${esc(gearOf(x.id).n)} (+${Math.max(1,Math.round(x.pct*100))}%) ${x.why==='mats'?'needs materials you do not have':`needs ${fmt(x.gold)} gold`}.</small></div></div>`).join('');
  const short=G.gold<P.total;
  const body=P.picks.length?`<p class="note">For each hero in your party, the best piece the Smithy can sell or forge right now, or a spare from your pack. When both buying and forging work, the cheaper one is picked. Nothing happens until you confirm.</p>
    <div class="rows">${rows}</div>${cant?`<h4>Out of reach for now</h4><div class="rows">${cant}</div>`:''}
    <p class="nums p3tot"><b>Total: ${fmt(P.total)} gold</b> · You have ${fmt(G.gold)} · Left after: ${fmt(Math.max(0,G.gold-P.total))}</p>${short?'<p class="warn">You no longer have enough gold for all of it. It will stop when the gold runs out.</p>':''}
    <p class="note"><small>Undo afterwards puts everyone's gear back as it was; what you bought or forged stays in your pack.</small></p>`
    :`<p>Nothing to buy or forge: your party already has the best the Smithy can offer${P.cant.length?' for the gold and materials you have':''}.</p>${cant?`<h4>Out of reach for now</h4><div class="rows">${cant}</div>`:''}`;
  return box('Upgrade whole party',body,`<button class="btn" data-act="xBack">Cancel</button>${P.picks.length?`<button class="btn gold" data-act="p3SmithGo">Confirm: ${fmt(P.total)} gold</button>`:''}`,true);}
function p3SmithRun(plan){
  const got=[];let stop=null,spent=0,bought=0,forged=0;
  for(const p of plan.picks){const c=G.roster[p.cid];if(!c)continue;
    if(p.src==='pack'){if(!G.gear.includes(p.id))continue;}
    else if(p.src==='buy'){const g=GEAR[p.id];if(G.gold<g.price){stop='gold';break;}G.gold-=g.price;G.gear.push(p.id);spent+=g.price;bought++;}
    else{const r=p3Recipes()[p.id];if(!r)continue;if(G.gold<r.g){stop='gold';break;}if(!hasMats(recipeMats(r))){stop='mats';break;}const g0=G.gold;if(!craft(r)){stop='gold';break;}spent+=g0-G.gold;forged++;}
    got.push(p);}
  // the equips come after every purchase, so Undo only touches gear (bought items stay in the pack)
  const snap=snapAuto(),before={};Object.values(G.roster).forEach(c=>{before[c.id]={eq:Object.assign({},c.eq),pw:loadoutScore(c,c.S)};});
  got.forEach(p=>{const c=G.roster[p.cid];if(c&&G.gear.includes(p.id)&&canEquip(c,p.id))equipGear(c,p.id);});
  Object.values(G.roster).forEach(refresh);
  const rows=[];Object.values(G.roster).forEach(c=>{const b=before[c.id],ch=[];EQSL.forEach(sl=>{if((b.eq[sl]||null)!==(c.eq[sl]||null))ch.push({sl,from:b.eq[sl]||null,to:c.eq[sl]||null});});
    if(ch.length)rows.push({id:c.id,name:c.name,inParty:G.party.includes(c.id),ch,comp:null,pw0:b.pw,pw1:loadoutScore(c,c.S)});});
  saveGame();return {rows,snap,stop,spent,bought,forged,done:got.length,of:plan.picks.length};}
{const ma0=mAutoEq;mAutoEq=function(m){let h=ma0.apply(this,arguments);if(!m||m.mode!=='smith')return h;const R=m.p3||{};
  const note=`<p class="note p3res">${R.stop?`<b class="warn">Stopped: ${R.stop==='gold'?'the gold ran out':'materials ran out'} after ${R.done} of ${R.of}.</b> Everything bought before that is equipped. `:''}Spent ${fmt(R.spent||0)} gold: bought ${R.bought||0}, forged ${R.forged||0}. Undo puts the gear back; purchases stay in your pack.</p>`;
  return h.replace(/<h2>[^<]*<\/h2>/,`<h2>Best gear: bought, forged and equipped</h2>${note}`);};}

// ===================== 3.4 / 3.5: Best Party and the team check =====================
const ARCH_PL={flying:'flyers',armored:'armored foes',jelly:'jellies',undead:'undead',swarm:'swarms',beast:'beasts',plant:'plants'};
// what one hero brings: deliveries (basic attack follows a weapon the hero may legally hold), roles and elements
function p3Kit(c){const C=p3c().kit;if(C[c.id])return C[c.id];const t=TPL[c.id],sk=classSkills(t).filter(s=>skillKnown(c,s)),dl=new Set();
  sk.forEach(s=>{if(s.k==='phys'||s.k==='mag'){const d=s.dl||dlFor(t.cls,s);if(d)dl.add(d);}});
  const w=c.eq&&c.eq.w&&canEquip(c,c.eq.w)?gearOf(c.eq.w):null;dl.add((w&&WT_DL[w.fam])||DL_CLS[t.cls]||'slash');
  const heal=sk.some(s=>s.k==='heal'||s.k==='revive');if(heal)dl.add('heal');
  const els=new Set(c.el||[]);sk.forEach(s=>{if(s.k==='phys'||s.k==='mag')skEls(s).forEach(e=>els.add(e));});
  return C[c.id]={dl,heal,revive:sk.some(s=>s.k==='revive'||s.revive),pr:sk.some(s=>s.role==='primer'),de:sk.some(s=>s.role==='det'||s.role==='detonator'),
    tank:['knight','warrior','monk'].includes(t.cls),area:sk.some(s=>(s.k==='phys'||s.k==='mag')&&(s.t==='all'||s.t==='rand')),els:[...els]};}
// what the area ahead is known to hold: monsters seen in the Bestiary, plus the boss's element and archetype (its theme gives those away)
function p3Stage(){return G?Math.max(0,Math.min(4,G.stage||0)):0;}
function p3Threats(s){s=s==null?p3Stage():s;const T={arch:{},els:{},mons:[],boss:null,s};
  try{(ZS(s).pool||[]).forEach(k=>{const d=MON[k];if(!d||!(META.best[d.n]||{}).seen)return;T.mons.push(k);tyOf(d.art).forEach(a=>{T.arch[a]=(T.arch[a]||0)+1;});});
    const key=bossAtStage(s),d=key&&guardianDef(key);
    if(d&&!(G.cleared||[])[s]){const ty=BOSS_TY[d.art]||[];T.boss={key,el:d.el||[],ty,cls:bossClass(key),seen:!!(META.best[d.n]||{}).seen,n:d.n};ty.forEach(a=>{T.arch[a]=(T.arch[a]||0)+BP_AWARE.boss;});}}catch(e){}
  return T;}
const p3BossName=b=>b.seen?esc(b.n):'the '+b.cls;
// a delivery that answers an archetype well (or the area attacks that shred swarms)
function p3Answer(kit,a){const A=ARCH[a];if(!A)return null;const good=Object.keys(A.dl||{}).filter(k=>A.dl[k]>=1.1).sort((x,y)=>A.dl[y]-A.dl[x]);
  const d=good.find(k=>kit.dl.has(k));if(d)return DL_NAME[d].toLowerCase();if(A.area&&kit.area)return 'area';
  const e=Object.keys(A.el||{}).find(k=>A.el[k]>1&&kit.els.includes(k));return e?EL[e]:null;}
const p3Beats=(kit,els)=>kit.els.find(e=>matchup(e,els)>1)||null;
function p3TeamScore(set,pw,mx,T){const K=set.map(p3Kit),els=new Set();set.forEach(c=>c.el.forEach(e=>els.add(e)));
  let v=set.reduce((a,c)=>a+pw[c.id]/mx,0);const nh=K.filter(k=>k.heal).length;v+=nh?(.35+(nh>1?.05:0)):0;v+=els.size*.08;v+=K.some(k=>k.pr)?.12:0;v+=K.some(k=>k.de)?.12:0;v+=K.some(k=>k.tank)?.15:0;
  const dls=new Set();K.forEach(k=>k.dl.forEach(d=>dls.add(d)));['piercing','blunt','ranged','magic'].forEach(d=>{if(dls.has(d))v+=BP_AWARE.dl;});
  const tot=Object.values(T.arch).reduce((a,b)=>a+b,0)||1;Object.keys(T.arch).forEach(a=>{if(K.some(k=>p3Answer(k,a)))v+=BP_AWARE.arch*Math.min(1.5,T.arch[a]/tot*2);});
  if(T.mons.length){const cov=T.mons.filter(k=>K.some(kit=>p3Beats(kit,MON[k].el))).length/T.mons.length;v+=BP_AWARE.el*cov;}
  if(T.boss&&T.boss.el.length&&K.some(k=>p3Beats(k,T.boss.el)))v+=BP_AWARE.el*BP_AWARE.boss;
  return v;}
function p3Reasons(set,T){const K=new Map(set.map(c=>[c.id,p3Kit(c)])),out={},used=new Set();
  set.forEach(c=>{out[c.id]=[];});
  const give=(c,t,key)=>{if(key&&used.has(key))return;if(key)used.add(key);if(out[c.id].length<2)out[c.id].push(t);};
  Object.keys(T.arch).sort((a,b)=>T.arch[b]-T.arch[a]).forEach(a=>{const c=set.find(h=>p3Answer(K.get(h.id),a));if(c){const how=p3Answer(K.get(c.id),a),boss=T.boss&&T.boss.ty.includes(a);
    give(c,`${how==='area'?'area attacks':how} answer to ${boss&&!T.mons.some(k=>tyOf(MON[k].art).includes(a))?p3BossName(T.boss)+' ('+ARCH[a].n.toLowerCase()+')':'the '+ARCH_PL[a]+' here'}`,'a:'+a);}});
  if(T.boss&&T.boss.el.length){const c=set.find(h=>p3Beats(K.get(h.id),T.boss.el));if(c)give(c,`${EL[p3Beats(K.get(c.id),T.boss.el)]} hits ${p3BossName(T.boss)} hard`,'boss');}
  const hl=set.filter(c=>K.get(c.id).heal);if(hl.length)give(hl[0],'healer','heal');
  const tk=set.filter(c=>K.get(c.id).tank);if(tk.length)give(tk[0],'tank','tank');
  const pr=set.find(c=>K.get(c.id).pr);if(pr)give(pr,'Primer','pr');const de=set.find(c=>K.get(c.id).de);if(de)give(de,'Detonator','de');
  set.forEach(c=>{if(!out[c.id].length)out[c.id].push('strong with the gear you own');});return out;}
// 3.5 what a party is missing, who on the roster could fill it, and the best one tap swap
function p3Gaps(ids,T){T=T||p3Threats();const set=ids.map(id=>G.roster[id]).filter(Boolean),K=set.map(p3Kit),bench=Object.values(G.roster).filter(c=>!ids.includes(c.id));
  const pw={};Object.values(G.roster).forEach(c=>{pw[c.id]=Math.max(1,loadoutScore(c,c.S));});const mx=Math.max(1,...Object.values(pw));
  const needDl=d=>Object.keys(T.arch).filter(a=>ARCH[a]&&ARCH[a].dl&&(ARCH[a].dl[d]||0)>=1.1);
  const G0=[];const add=(k,label,why,has)=>{const fill=bench.filter(c=>has(p3Kit(c))).sort((a,b)=>pw[b.id]-pw[a.id]);G0.push({k,label,why,fill:fill.slice(0,3).map(c=>c.id)});};
  if(!K.some(k=>k.heal))add('heal','Healer','Nobody can heal or revive.',k=>k.heal);
  if(!K.some(k=>k.tank))add('tank','Tank','No Knight, Warrior or Monk to take the hits.',k=>k.tank);
  ['ranged','blunt','piercing','magic'].forEach(d=>{if(K.some(k=>k.dl.has(d)))return;const n=needDl(d);add(d,DL_NAME[d]+' answer',n.length?`Wanted here: ${n.map(a=>ARCH_PL[a]).join(', ')}.`:`Nobody deals ${DL_HINT[d]}.`,k=>k.dl.has(d));});
  if(!K.some(k=>k.pr))add('pr','Primer','Nobody can prime a foe for a reaction.',k=>k.pr);
  if(!K.some(k=>k.de))add('de','Detonator','Nobody can set off a primed foe.',k=>k.de);
  const miss=T.mons.filter(m=>!K.some(k=>p3Beats(k,MON[m].el)));
  if(T.mons.length&&miss.length*2>T.mons.length){const me=[...new Set(miss.flatMap(m=>MON[m].el))];add('el','Element answer for this area',`Nothing in your party hits the ${me.map(e=>EL[e]).join(', ')} foes here hard.`,k=>miss.some(m=>p3Beats(k,MON[m].el)));}
  if(T.boss&&T.boss.el.length&&!K.some(k=>p3Beats(k,T.boss.el)))add('bel','Element answer for '+(T.boss.seen?esc(T.boss.n):'the '+T.boss.cls),`Its element: ${T.boss.el.map(e=>EL[e]).join(', ')}.`,k=>!!p3Beats(k,T.boss.el));
  // the swap: put the filler in for whoever costs the team least
  G0.forEach(g=>{const inn=g.fill[0];if(!inn)return;if(set.length<6){g.swap={in:inn,out:null};return;}let best=null;
    set.forEach(c=>{const t=set.map(x=>x===c?G.roster[inn]:x),v=p3TeamScore(t,pw,mx,T);if(!best||v>best.v)best={v,out:c.id};});g.swap={in:inn,out:best.out};});
  return G0;}
function p3GapsHtml(ids,T,open){const L=p3Gaps(ids,T),town=inTown(),nm=id=>esc(G.roster[id].name);
  if(!L.length)return `<div class="p3gaps ok"><small class="up">✓ Team check: healer, tank, every delivery, Primer, Detonator and element answers for this area are covered.</small></div>`;
  return `<details class="p3gaps" ${open?'open':''}><summary><b>Team check:</b> missing ${L.map(g=>g.label).join(', ')}</summary><div class="rows">${L.map(g=>`<div class="row"><div class="grow"><b>${g.label}</b><small>${g.why}</small><small>${g.fill.length?'Could fill: '+g.fill.map(nm).join(', '):'Nobody on your roster yet. The tavern and Guild Hall may have someone.'}</small></div>${g.swap?`<button class="btn sm" data-act="p3Swap" data-arg="${g.swap.in},${g.swap.out||''}" ${town?'':'disabled'} title="${town?'':'Swapping roster heroes into your six happens in town.'}">${g.swap.out?`Swap ${nm(g.swap.in)} in for ${nm(g.swap.out)}`:`Add ${nm(g.swap.in)}`}</button>`:''}</div>`).join('')}</div>${town?'':'<p class="note"><small>Swapping happens in town.</small></p>'}</details>`;}
function p3ThreatLine(T){const a=Object.keys(T.arch).filter(k=>T.mons.some(m=>tyOf(MON[m].art).includes(k)));
  const parts=[];if(a.length)parts.push(`Known in ${esc(ZS(T.s).n)}: ${a.map(k=>ARCH_PL[k]).join(', ')}`);
  if(T.boss)parts.push(`${p3BossName(T.boss)}: ${T.boss.el.map(e=>EL[e]).join('/')}${T.boss.ty.length?', '+T.boss.ty.map(k=>ARCH[k].n).join(', '):''}`);
  const t=parts.join(' · ');return t?`<p class="note p3thr">${t.charAt(0).toUpperCase()+t.slice(1)}.</p>`:'';}
{const vm0=vModal;vModal=function(m){if(m){if(m.type==='bp')return mBestParty(m);if(m.type==='p3plan')return mP3Plan(m);}return vm0.apply(this,arguments);};}
// after Best Party: offer Auto best gear for the new six right away
{const ba0=ACT.bpApply;ACT.bpApply=function(){const r=ba0.apply(this,arguments);if(V.modal&&V.modal.type==='ldRes'){V.modal.p3bp=1;render();}return r;};}
{const lr0=mLdRes;mLdRes=function(m){let h=lr0.apply(this,arguments);if(m&&m.p3bp){const i=h.lastIndexOf('<div class="btnrow">');if(i>=0)h=h.slice(0,i)+(m.p3bpDone?'<p class="note p3eqb done">Best gear equipped for this party.</p>':'<div class="btnrow p3eqb"><button class="btn gold" data-act="autoEqParty">Equip best gear for this party</button></div>')+h.slice(i);}return h;};}
// v0.7.1: once used from this screen the button is replaced by a done note (it used to stay after equipping)
{const ae0=ACT.autoEqParty;ACT.autoEqParty=function(){const m=V.modal;if(m&&m.type==='ldRes'&&m.p3bp)m.p3bpDone=1;return ae0.apply(this,arguments);};}
// the Party tab gets the team check under the grid
{const vs0=vSwap;vSwap=function(where){const h=vs0.apply(this,arguments);try{if(!G||G.daily||where!=='menu')return h;return h+p3GapsHtml(G.party.slice(),null,false);}catch(e){return h;}};}

// ===================== 3.6: boss readiness =====================
// Uses only what the boss prompt already shows (level, element) and its archetype, which its theme gives away. No skills, no turning point.
function p3Ready(s,lv){const P=partyChars(),K=P.map(p3Kit),out=[],bench=Object.values(G.roster).filter(c=>!G.party.includes(c.id)),key=bossAtStage(s),d=guardianDef(key),ty=BOSS_TY[d.art]||[],nm=c=>esc(c.name);
  const who=f=>{const L=bench.filter(c=>f(p3Kit(c))).sort((a,b)=>b.lv-a.lv).slice(0,2);return L.length?` ${L.map(nm).join(' or ')} on your roster could.`:'';};
  const add=(ok,label,hint)=>out.push({ok,label,hint});
  const avg=P.length?P.reduce((a,c)=>a+c.lv,0)/P.length:0,av=Math.round(avg);
  add(avg>=lv-READY.lvGap,`Level: your party averages ${av}, it is level ${lv}`,avg>=lv-READY.lvGap?'':`Win a few more fights first; about level ${lv-READY.lvGap} or higher is a fair match.`);
  const want=Math.min(5,s),low=P.filter(c=>['w','a'].some(sl=>{const g=gearOf(c.eq[sl]);return !g||gTierIdx(g)<want;}));
  add(!low.length,`Gear: tier ${ITEM_TIERS[want].n} or better`,low.length?`${low.map(nm).join(', ')} ${low.length>1?'still carry':'still carries'} older or missing gear. The Smithy's Upgrade whole party button, or Upgrade on each slot of a hero sheet, sorts it out.`:'');
  add(K.some(k=>k.heal),'Healer',K.some(k=>k.heal)?'':'Nobody in your party can heal.'+who(k=>k.heal));
  const good=[...new Set(ty.flatMap(a=>Object.keys((ARCH[a]||{}).dl||{}).filter(x=>ARCH[a].dl[x]>=1.1)))];
  if(good.length){const has=good.filter(x=>K.some(k=>k.dl.has(x)));add(has.length>0,`${ty.map(a=>ARCH[a].n).join(' and ')}: ${good.map(x=>DL_NAME[x]).join(' or ')} attacks`,has.length?'':`Nobody brings ${good.map(x=>DL_NAME[x].toLowerCase()).join(' or ')} attacks.`+who(k=>good.some(x=>k.dl.has(x))));}
  if(d.el&&d.el.length){const b=K.some(k=>p3Beats(k,d.el)),strong=ELK.filter(e=>matchup(e,d.el)>1);
    add(b,`Element: something strong against ${d.el.map(e=>EL[e]).join('/')}`,b?'':`Try ${strong.map(e=>EL[e]).join(', ')} attacks.`+who(k=>!!p3Beats(k,d.el)));}
  add(K.some(k=>k.pr)&&K.some(k=>k.de),'Primer and Detonator',K.some(k=>k.pr)&&K.some(k=>k.de)?'':`Reactions crack its Break shield. Missing: ${[K.some(k=>k.pr)?'':'a Primer',K.some(k=>k.de)?'':'a Detonator'].filter(Boolean).join(' and ')}.`+who(k=>!K.some(q=>q.pr)?k.pr:k.de));
  const pots=(G.inv.potion||0)+(G.inv.hipotion||0)+(G.inv.elixir||0),rev=(G.inv.plume||0),rs=K.some(k=>k.revive);
  add(pots>=READY.potions&&(rev>=READY.revives||rs),`Supplies: ${pots} potions, ${rev} ${ITEMS.plume.n}${rev===1?'':'s'}`,pots>=READY.potions&&(rev>=READY.revives||rs)?'':`Alchemy sells ${pots<READY.potions?`potions (carry ${READY.potions} or more)`:''}${pots<READY.potions&&!(rev>=READY.revives||rs)?' and ':''}${!(rev>=READY.revives||rs)?`${ITEMS.plume.n}s (nobody in your party can revive)`:''}.`);
  return out;}
function p3ReadyHtml(s,lv){try{if(!G||G.daily)return '';const R=p3Ready(s,lv),n=R.filter(r=>r.ok).length;
  return `<div class="p3ready"><h4>Readiness <small class="nums">${n}/${R.length}</small></h4><div class="rows compact">${R.map(r=>`<div class="row ${r.ok?'':'warnr'}"><b class="p3mk ${r.ok?'up':'warn'}" aria-label="${r.ok?'Good':'Could be better'}">${r.ok?'✓':'!'}</b><div class="grow"><b>${r.label}</b>${r.hint?`<small>${r.hint}</small>`:''}</div></div>`).join('')}</div><p class="note"><small>Only suggestions: you can fight whenever you like.</small></p></div>`;}catch(e){return '';}}
const p3Ins=(h,x)=>{const i=h.lastIndexOf('<div class="btnrow">');return i>=0?h.slice(0,i)+x+h.slice(i):h+x;};
{const mb0=mBoss;mBoss=function(s){const h=mb0.apply(this,arguments);return p3Ins(h,p3ReadyHtml(s,bossLvFor(s)));};}
{const me0=mEchoAsk;mEchoAsk=function(m){const h=me0.apply(this,arguments);return m?p3Ins(h,p3ReadyHtml(m.s,storyEchoLv(m.s))):h;};}
{const mbe0=mBeast;mBeast=function(m){const h=mbe0.apply(this,arguments);try{if(!h||!m||!G||!G.run||G.daily)return h;const k=String(m.k);const bs=(G.run.bosses||[]).indexOf(k),sg=bs>=0?bs:(G.run.final===k?4:-1);
  if(sg<0||(G.cleared||[])[sg])return h;return p3Ins(h,p3ReadyHtml(sg,bossLvFor(sg)));}catch(e){return h;}};}

// ===================== 3.7: Holy Water, reapply automatically =====================
let P3HW={g:null,w:0};
{const wu0=wkwUpdate;wkwUpdate=function(){try{if(G&&!G.daily){const was=P3HW.g===G?P3HW.w:0;
    if(was>0&&!(G.ward>0)){if(G.hwAuto&&(G.inv.holywater||0)>0){G.inv.holywater--;G.ward=ITEMS.holywater.ward;saveGame();toast(`The ward fades, and you uncork another Holy Water. ${G.inv.holywater} left.`);}
      else if(G.hwAuto)toast('The Holy Water\'s ward fades. No Holy Water left to reapply.');}
    P3HW={g:G,w:G.ward||0};}}catch(e){}return wu0.apply(this,arguments);};}

// ===================== 3.9: Pork Chop Sandwiches =====================
ITEMS.porkchop.d+=`. In a dungeon you can also eat ${PORK.toTown} at once to walk all the way back to the last town's Inn`;
function p3PorkWhy(){const w=travelWhyNot('porkchop');if(w)return w;if(!WS.m||WS.m.kind!=='dungeon')return 'Only in a dungeon.';if((G.inv.porkchop||0)<PORK.toTown)return `You need ${PORK.toTown}.`;return '';}
function p3Pork2(){const why=p3PorkWhy();if(why){toast(why);sfx('deny');return false;}
  const m=WS.m,lt=G.lastTown||0;G.inv.porkchop-=PORK.toTown;try{if(G.echoReady&&G.cleared&&G.cleared[m.s])G.echoReady[m.s]=1;}catch(e){}
  V.modal=null;saveGame();render();toast(`Two sandwiches later, you follow the smell all the way back to the inn in ${ZS(lt).town}.`);
  fadeTo(()=>{const [ix,iy]=innSpot(lt);placeAt('t'+lt,ix,iy,'d');showLocation();saveGame();});return true;}
{const w0=win;win=function(){const first=!!(B&&B.spec&&B.spec.kind==='boss'&&G&&!G.daily&&!G.p3pork&&!(G.cleared||[]).some(Boolean));const r=w0.apply(this,arguments);
  try{if(first&&G.cleared.some(Boolean)){G.p3pork=1;const n=Math.max(0,Math.min(PORK.firstBoss,invCap()-(G.inv.porkchop||0)));G.inv.porkchop=(G.inv.porkchop||0)+n;
    const info=B&&B.result;if(info){for(let i=0;i<n;i++)info.drops.push('porkchop');const hint=` The innkeeper's lad runs up with ${PORK.firstBoss} Pork Chop Sandwiches "for the road". One walks you back to a dungeon's entrance; eat ${PORK.toTown} in a dungeon and you are back at the last town's Inn.`;
      if(info.story)info.story.text+=hint;else info.p3hint=hint;}saveGame();render();}}catch(e){}return r;};}
// Menu > Items: the Holy Water toggle and the two sandwich button
{const vm1=vModal;vModal=function(m){let h=vm1.apply(this,arguments);try{if(!m||m.type!=='menu'||!G||G.daily||typeof h!=='string')return h;
  h=h.replace(/(<button class="btn sm" data-act="useTravel" data-arg="holywater"[^>]*>Use<\/button>)/,(x)=>`<div class="btnrow tight col">${x}<button class="btn sm ${G.hwAuto?'gold':''}" data-act="p3HwAuto" aria-pressed="${!!G.hwAuto}" title="When the ward ends, use another Holy Water if you have one">Reapply automatically: ${G.hwAuto?'On':'Off'}</button></div>`);
  if(WS.m&&WS.m.kind==='dungeon'&&(G.inv.porkchop||0)>0)h=h.replace(/(<button class="btn sm" data-act="useTravel" data-arg="porkchop"[^>]*>Use<\/button>)/,(x)=>`<div class="btnrow tight col">${x.replace('>Use<','>Use 1: dungeon entrance<')}<button class="btn sm" data-act="p3Pork2" ${p3PorkWhy()?'disabled':''} title="${esc(p3PorkWhy())}">Use ${PORK.toTown}: return to town</button></div>`);}catch(e){}return h;};}

// ===================== v0.9.5: one Upgrade button per gear slot =====================
// For one hero and one slot, every single next step is listed (upgOpts): equip a better spare from the pack, buy a piece (Smithy, or
// Alchemy for charms), forge a recipe (Smithy, or Alchemy for charms), temper the piece worn now (buying the ore, logs or parts the
// Smithy sells if any are missing), or Echoforge a tier 6 weapon. upgBest picks the one that raises this hero's gear score
// (loadoutScore, the same score as Auto best gear and "Best for party") the most among those the player can pay for now, the
// cheaper on a tie. Shop steps need a town (the pack works anywhere). upgApply does it in one tap. Off in the Daily Trial.
const UPG_KIND=['pack','buy','forge','temper','ef'];
const UPG_LBL={pack:'Equip from your pack',buy:'Buy',forge:'Forge',temper:'Temper',ef:'Echoforge'};
function upgTown(){try{return inTown();}catch(e){return false;}}
function upgShop(sl){if(sl==='c')return shopStock('charms');if(sl==='w')return shopStock('weapons');return shopStock('armor').filter(id=>gearOf(id)&&gearOf(id).slot===sl);}
function upgOpts(c,sl){const out=[];if(!G||G.daily||!c)return out;const cur=c.eq[sl]||null,town=upgTown();
  const add=o=>{if(!gearOf(o.id))return;const g=gainFor(c,o.id);if(!g||g.d<=.01)return;o.d=g.d;o.pct=g.pct;o.cid=c.id;o.sl=sl;o.key=o.k+':'+(o.k==='forge'?o.ri:o.k==='ef'?o.f:o.id);out.push(o);};
  [...new Set(G.gear)].forEach(id=>{if(slotOk(c,sl,id))add({k:'pack',id,gold:0,ok:true});});
  upgShop(sl).forEach(id=>{if(GEAR[id]&&slotOk(c,sl,id))add({k:'buy',id,gold:GEAR[id].price,ok:town&&G.gold>=GEAR[id].price,town:1});});
  RECIPES.forEach((r,i)=>{if(!r.id||!recipeOpen(r)||!slotOk(c,sl,r.id))return;const m=recipeMats(r);add({k:'forge',id:r.id,ri:i,gold:r.g,m,ok:town&&G.gold>=r.g&&hasMats(m),town:1});});
  if(cur&&(typeof pcTemperOpen!=='function'||pcTemperOpen())){const fc=forgeCost(cur);if(fc){const have=hasMats(fc.m),P=have?null:buyPlan(fc.m),buy=P&&P.ok&&P.any?P:null;
    add({k:'temper',id:fc.next,gold:fc.gold+(buy?buy.gold:0),m:fc.m,buy,cant:P&&!P.ok?P.cant:null,ok:town&&(have||!!buy)&&G.gold>=fc.gold+(buy?buy.gold:0),town:1});}}
  if(sl==='w'&&typeof ECHOFORGE!=='undefined'&&typeof efBaseIn==='function')Object.keys(ECHOFORGE).forEach(f=>{const base=efBaseIn(f),worn=cur&&baseIdOf(cur)==='w_'+f+'_5'?plusOf(cur):-1;
    let plus=-1,src=null;if(base){plus=base.plus;src='pack';}if(worn>plus){plus=worn;src='eq';}if(!src)return;const m=efCost(f);
    add({k:'ef',f,src,id:'w_'+f+'_ef'+(plus?'+'+plus:''),gold:EF_GOLD,m,ok:town&&hasMats(m)&&G.gold>=EF_GOLD,town:1});});
  return out;}
// the order: most gain, then less gold, then fewer materials, then pack before buying before forging
const upgCmp=(a,b)=>(b.d-a.d)||(a.gold-b.gold)||(upgMatN(a)-upgMatN(b))||(UPG_KIND.indexOf(a.k)-UPG_KIND.indexOf(b.k));
function upgMatN(o){return o.m?Object.values(o.m).reduce((s,v)=>s+v,0):0;}
function upgBest(c,sl){const L=upgOpts(c,sl).sort(upgCmp),best=L.find(o=>o.ok)||null;
  // what to save up for: the best step overall when it beats what can be done now
  const goal=L.find(o=>!o.ok&&(!best||o.d>best.d+.01))||null;return {best,goal,all:L};}
function upgWhat(o,here){const g=gearOf(o.id),n=g?g.n:'?';
  if(o.k==='pack')return `Equip ${esc(n)} from your pack`;if(o.k==='buy')return here?`Buy ${esc(n)}`:`Buy ${esc(n)} at ${gearOf(o.id).slot==='c'?'Alchemy':'the Smithy'}`;
  if(o.k==='forge')return `Forge ${esc(n)}`;if(o.k==='temper')return `Temper to ${esc(n)}`;return `Echoforge ${esc(n)}`;}
function upgCost(o){if(!o.gold&&!o.m)return 'Free';return `${o.m?matChips(o.m):''}<span class="matc gold ${G.gold>=o.gold?'':'short'}"><i></i><b class="nums">${fmt(o.gold)}</b> gold</span>${o.buy?`<small class="note">Includes ${fmt(o.buy.gold)} gold for ${o.buy.buy.map(([k,n])=>n+' '+esc(MATS[k])).join(', ')} from the Smithy.</small>`:''}`;}
// before and after for the stats that change
function upgBA(c,o){const a=c.S,b=statsWith(c,o.sl,o.id),p=[];DSTAT.forEach(([k,n])=>{const x=Math.round(a[k]||0),y=Math.round(b[k]||0);if(x!==y)p.push(`<span>${n} <b class="nums">${x}</b> → <b class="nums ${y>x?'up':'dn'}">${y}</b></span>`);});return p.length?`<div class="upgba">${p.join('')}</div>`:'';}
const upgPct=o=>'+'+Math.max(1,Math.round(o.pct*100))+'%';
// one tap: do the step, equip the result
function upgApply(o){const c=G.roster[o.cid];if(!c)return false;const sl=o.sl;
  if(o.k==='pack'){if(!G.gear.includes(o.id))return false;}
  else if(o.k==='buy'){const g=GEAR[o.id];if(!g||G.gold<g.price)return false;G.gold-=g.price;G.gear.push(o.id);}
  else if(o.k==='forge'){const r=RECIPES[o.ri];if(!r||!craft(r))return false;}
  else if(o.k==='temper'){if(o.buy&&!doBuyPlan(buyPlan(forgeCost(c.eq[sl]).m)))return false;const r=forge('eq',{cid:c.id,slot:sl});if(!r)return false;saveGame();return r;}
  else if(o.k==='ef'){const m=efCost(o.f);if(!hasMats(m)||G.gold<EF_GOLD)return false;
    if(o.src==='eq'){if(baseIdOf(c.eq.w||'')!=='w_'+o.f+'_5')return false;G.gold-=EF_GOLD;payMats(m);c.eq.w=o.id;refresh(c);saveGame();return o.id;}
    const base=efBaseIn(o.f);if(!base)return false;G.gold-=EF_GOLD;payMats(m);G.gear.splice(base.i,1);G.gear.push(o.id);}
  if(!G.gear.includes(o.id))return false;equipGear(c,o.id);saveGame();return o.id;}
// the Upgrade popup: the best step, its cost and before/after, one button to do it, and the full lists for tinkerers
function upgOpenM(cid,sl){V.modal={type:'upg',cid,sl,from:V.modal&&V.modal.type!=='upg'?V.modal:(V.modal&&V.modal.from)||null};render();}
function mUpg(m){const c=G.roster[m.cid];if(!c)return box('Upgrade','<p>That hero is not here.</p>','<button class="btn gold" data-act="xBack">Back</button>');
  const sl=m.sl,cur=c.eq[sl],R=upgBest(c,sl),o=R.best,town=upgTown();
  const curRow=`<div class="row eqcur">${cur?gearIcon(cur):'<span class="gico empty"></span>'}<div class="grow"><small>Now</small><b>${cur?esc(gearOf(cur).n):'Nothing'}</b> ${cur?tierChip(gearOf(cur)):''}<small>${cur?gearDesc(cur):''}</small></div></div>`;
  const card=o?`<div class="upgcard"><span class="upgk">Best next step</span><div class="row">${gearIcon(o.id)}<div class="grow"><b>${upgWhat(o)}</b> ${tierChip(gearOf(o.id))} <em class="up">${upgPct(o)}</em><small>${gearDesc(o.id)}</small>${upgBA(c,o)}<div class="mats">${upgCost(o)}</div></div></div></div>`
    :`<p class="note empty">Nothing better for this slot that you can pay for right now.</p>`;
  const goal=R.goal?`<p class="note upggoal"><b>Save up for:</b> ${upgWhat(R.goal)} (${upgPct(R.goal)}), ${R.goal.town&&!town?'in town':R.goal.cant?'needs '+R.goal.cant.map(k=>esc(MATS[k])).join(', '):R.goal.m&&!hasMats(R.goal.m)?'needs materials':fmt(R.goal.gold)+' gold'}.</p>`:'';
  const far=!town&&R.all.some(x=>x.town)?'<p class="note">Buying, forging and tempering happen in town. Here only spares in your pack count.</p>':'';
  return box(`Upgrade: ${SLOTN[sl]} for ${esc(c.name)}`,curRow+card+goal+far,
    `<button class="btn" data-act="upgAll">Show all options</button>${o?`<button class="btn gold" data-act="upgDo" data-arg="${c.id},${sl},${o.key}">Upgrade${o.gold?': '+fmt(o.gold)+' gold':''}</button>`:''}<button class="btn" data-act="xBack">Back</button>`,true);}
// the button on a slot: shows the gain when there is a step to take
function upgBtn(c,sl,cls){if(!G||G.daily)return '';const o=upgBest(c,sl).best;
  return `<button class="btn sm upgb ${o?'gold':''} ${cls||''}" data-act="upgOpen" data-arg="${c.id},${sl}" title="${o?esc(upgWhat(o).replace(/<[^>]*>/g,''))+' '+upgPct(o):'Nothing better to buy, forge or temper right now'}">Upgrade${o?` <em>${upgPct(o)}</em>`:''}</button>`;}
// shops: the best step for each slot first (the hero it helps most), one tap each
function upgSlotsHtml(slots,noPlan){if(!G||G.daily)return '';const rows=slots.map(sl=>{let b=null;partyChars().forEach(c=>{const o=upgBest(c,sl).best;if(o&&(!b||o.pct>b.pct+1e-9||(Math.abs(o.pct-b.pct)<=1e-9&&o.gold<b.gold)))b=o;});return b;}).filter(Boolean);
  return `<div class="upgbest">${m3H('Best upgrade for each slot')}${rows.length?`<div class="rows">${rows.map(o=>{const c=G.roster[o.cid];
    return `<div class="row">${gearIcon(o.id)}<div class="grow"><small>${SLOTN[o.sl]} for ${esc(c.name)}</small><b>${upgWhat(o,1)}</b> <em class="up">${upgPct(o)}</em><small>${deltaHtml(c,o.id)}</small></div><button class="btn sm gold" data-act="upgDo" data-arg="${c.id},${o.sl},${o.key}">${o.gold?fmt(o.gold)+' gold':'Equip'}</button></div>`;}).join('')}</div>`:m3Empty('Your party already has the best you can pay for here.')}${noPlan?'':`<div class="btnrow p3smith"><button class="btn" data-act="p3Smith" title="Plans the best upgrade for each hero in your party, shows it, and only buys after you confirm">Upgrade whole party</button></div>`}</div>`;}
{const vm0=vModal;vModal=function(m){if(m&&m.type==='upg')return mUpg(m);return vm0.apply(this,arguments);};}
// the hero sheet: an Upgrade button on each slot
{const mc0=mChar;mChar=function(id,edit){let h=mc0.apply(this,arguments);try{const c=G&&G.roster[id];if(!c||G.daily||typeof h!=='string')return h;
  h=h.replace(/<h4>Equipment<\/h4><div class="eq">[\s\S]*?<\/div>/,()=>`<h4>Equipment</h4><div class="eq upgeq">${EQSL.map(sl=>`<div class="upgslot">${edit?`<button class="btn sm" data-act="gearSlot" data-arg="${sl}"><small>${SLOTN[sl]}</small> ${c.eq[sl]?gearOf(c.eq[sl]).n:'Empty'}</button>`:`<span class="eqv"><small>${SLOTN[sl]}</small> ${c.eq[sl]?gearOf(c.eq[sl]).n:'Empty'}</span>`}${upgBtn(c,sl)}</div>`).join('')}</div>`);}catch(e){}return h;};}
Object.assign(ACT,{
  upgOpen(a){const [cid,sl]=String(a).split(',');if(!G||G.daily||!G.roster[cid]||!EQSL.includes(sl))return;upgOpenM(cid,sl);},
  upgDo(a){const [cid,sl,key]=String(a).split(',');const c=G&&G.roster[cid];if(!c||G.daily)return;const o=upgBest(c,sl).best;
    if(!o||o.key!==key){toast('Something changed. Here is the best step now.');render();return;}
    const was=c.eq[sl],r=upgApply(o);if(!r){sfx('deny');toast('That could not be done right now.');render();return;}
    sfx(o.k==='pack'?'equip':'chest');toast(`${c.name}: ${was?gearOf(was).n:'nothing'} → ${gearOf(c.eq[sl]).n} (${upgPct(o)}).`);render();},
  upgAll(){const m=V.modal;if(!m||m.type!=='upg')return;const c=G.roster[m.cid],sl=m.sl,o=upgBest(c,sl).best||upgBest(c,sl).goal,from=m;
    if(!upgTown()){V.modal={type:'eqPick',char:m.cid,slot:sl,list:[m.cid],from};render();return;}
    const sec={w:'weapons',a:'armor',k:'capes',c:'charms'}[sl];
    if(o&&o.k==='temper')V.modal={type:'smithy',tab:'forge',sec,from};
    else if(o&&o.k==='ef')V.modal={type:'smithy',tab:'echo',from};
    else if(sl==='c')V.modal=o&&o.k==='forge'?{type:'workshop',tab:'craft',sec:'charm',from}:{type:'workshop',tab:'shop',sec:'charm',from};
    else if(o&&o.k==='forge')V.modal={type:'smithy',tab:'craft',from};
    else V.modal={type:'smithy',tab:'shop',sec,from};
    render();}
});

// ===================== actions =====================
Object.assign(ACT,{
  p3Smith(){if(!G||G.daily)return;V.modal={type:'p3plan',plan:p3SmithPlan(),from:V.modal};render();},
  p3SmithGo(){const m=V.modal;if(!m||m.type!=='p3plan')return;const R=p3SmithRun(m.plan);sfx(R.done?'buy':'deny');
    V.modal={type:'autoEq',mode:'smith',rows:R.rows,snap:R.snap,from:m.from,p3:R};render();},
  p3Swap(a){if(!G||G.daily)return;if(!inTown()){toast('Swapping roster heroes into your six happens in town.');return;}const [inn,out]=String(a).split(',');if(!G.roster[inn]||G.party.includes(inn))return;
    const P=G.party.slice();if(out&&P.includes(out))P[P.indexOf(out)]=inn;else if(P.length<6)P.push(inn);else return;G.party=P;saveGame();sfx('blip');
    toast(out&&G.roster[out]?`${G.roster[inn].name} joins the six; ${G.roster[out].name} waits on the roster.`:`${G.roster[inn].name} joins the six.`);
    if(V.modal&&V.modal.type==='bp')V.modal.plan=bestParty();render();},
  p3HwAuto(){if(!G||G.daily)return;G.hwAuto=!G.hwAuto;saveGame();toast(G.hwAuto?'Holy Water: reapply automatically is on.':'Holy Water: reapply automatically is off.');render();},
  p3Pork2(){p3Pork2();}
});

// ----- styles (kept here so style.css stays untouched by this phase) -----
try{const st=document.createElement('style');st.textContent=`.p3why,.p3dup,.p3bpwhy{display:block;color:var(--gold,#ffd04a);opacity:.92}.p3dup{color:#9ad0ff}
.p3smith{margin:.4em 0}.p3gaps{margin:.5em 0;padding:.35em .5em;border:1px solid rgba(255,208,74,.35);border-radius:6px}.p3gaps summary{cursor:pointer}.p3gaps.ok{border-color:rgba(122,232,154,.35)}
.p3ready{margin-top:.5em}.p3ready .warnr b{color:#ffcf6a}.p3mk{flex:0 0 1.4em;text-align:center;font-size:1.1em}.p3tot{margin:.5em 0}.p3thr{margin:.3em 0}`;document.head.appendChild(st);}catch(e){}

// ----- test hook (window.__A is built after all modules; this one is ours) -----
window.__P3={upgOpts:(c,sl)=>upgOpts(c,sl),upgBest:(c,sl)=>upgBest(c,sl),upgApply:o=>upgApply(o),partyGainOf,shopSortIds:(a)=>shopSortIds(a),recipeList:(a)=>recipeList(a),temperOrder,temperGain,p3SmithPlan,p3SmithRun,p3Kit,p3Threats,p3Gaps,p3Ready,p3Pork2,p3PorkWhy,
  bestParty:()=>bestParty(),invCap,get ITEM_MAX(){return ITEM_MAX;},get P3C(){return P3C;},p3Tradeoff,withCache:f=>{const o=P3C;P3C={why:{},kit:{}};try{return f(P3C);}finally{P3C=o;}}};
