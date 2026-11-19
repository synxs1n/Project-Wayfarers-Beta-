// ===== gear46.js (v0.22.46): one engine behind Equip Best, Best upgrade for each slot and Upgrade whole party =====
// Asked: "upgrade whole party, best upgrade for each slot, and equip best seem to disagree and be a bit broken, rework these systems from
// the ground up to ensure they work properly and agree with each other".
// Before, each had its own list of candidates and its own order: Equip Best stripped the party and dealt the pieces out again by TODAY's
// stats (equip2.js planGear), the per slot Upgrade ranked by where a piece ENDS at max temper (p3shop.js upgOpts / upgBest), and Upgrade
// whole party had a third planner with its own rules (p3SmithPlan). So Equip Best could put on a piece the Upgrade then swapped back.
// Now there is one rule, THE RULE, and all three are the same step taken a different number of times:
//   for a hero and a slot, the candidates are what upgOpts lists (a spare from the pack, a buy, a forge, a temper step, a chain, an
//   Echoforge); a candidate must make the hero stronger today; the one that ENDS best at max temper comes first (p3Ult, a hero's own relic
//   above everything), then the bigger gain today, then the cheaper (upgCmp); the first one that can be paid for now is the step (upgBest).
//  - Best upgrade for each slot shows that step for the hero it helps most (as before).
//  - Upgrade whole party takes that same step for every hero and slot, biggest gain first, again and again until none is left (gp46Plan
//    for the preview on a copy of the purse and pack, ACT.p3SmithGo for real: both walk gp46Round and re-ask upgBest before every step).
//  - Equip Best is the same walk with only the free steps from the pack (gp46PlanGear, behind planGear): nobody is stripped first, a hero
//    keeps what they wear unless a spare is a gain today, and the spare that ends best comes first. It may still take pieces from heroes
//    outside the party. Heroes in the party no longer trade pieces among themselves.
// What follows from it (tools/chrome/v225a.js checks these on random packs): after Upgrade whole party nothing is left to do in any of the
// three; after Equip Best no row offers a spare from the pack; pressing a per slot Upgrade again and again never ends below a step it showed
// earlier; the preview of Upgrade whole party is what then happens.
const GP46={rounds:14,off:false,err:'',tP:[],tR:[]};/* tP, tR: the steps of the last preview and of the last run, for tests */
const gp46Cmp=(a,b)=>p3UltCmp(a,b)||(b.d-a.d)||(a.id<b.id?-1:a.id>b.id?1:0);
// ---------- Equip Best: the free steps from the pack ----------
function gp46PlanGear(heroIds,takeIds,fair,slots){const SL=slots||GSLOTS;
  const heroes=heroIds.map(id=>G.roster[id]).filter(Boolean),hs=new Set(heroes.map(c=>c.id)),pool=[];
  G.gear.forEach(id=>pool.push({id,from:null}));
  (takeIds||[]).forEach(hid=>{const c=G.roster[hid];if(!c||hs.has(hid))return;GSLOTS.forEach(sl=>{if(SL.includes(sl)&&c.eq[sl])pool.push({id:c.eq[sl],from:hid,sl});});});
  const eq={},sc={},src={};heroes.forEach(c=>{eq[c.id]=Object.assign({},c.eq);src[c.id]={};sc[c.id]=scoreEq(c,eq[c.id]);});
  for(let it=0;it<400;it++){const ids=[...new Set(pool.map(e=>e.id))].sort();let best=null;
    heroes.forEach((c,hi)=>{const real=c.eq;c.eq=eq[c.id];/* a shield is only allowed beside the weapon the plan has given so far (canEquip reads c.eq) */try{SL.forEach((sl,si)=>{const cur=eq[c.id][sl]||null;if(typeof f38Own==='function'&&f38Own(c,cur))return;let top=null;
      ids.forEach(id=>{if(id===cur||!slotOk(c,sl,id))return;const d=scoreEq(c,Object.assign({},eq[c.id],{[sl]:id}))-sc[c.id];if(d<=.01)return;
        const o={id,d,pct:sc[c.id]>0?d/sc[c.id]:0,u:p3Ult(c,sl,id)};if(!top||gp46Cmp(o,top)<0)top=o;});
      if(top&&(!best||top.pct>best.pct+1e-9||(Math.abs(top.pct-best.pct)<=1e-9&&(hi<best.hi||(hi===best.hi&&si<best.si)))))best=Object.assign({c,sl,hi,si},top);});}finally{c.eq=real;}});
    if(!best)break;
    const pick=pool.map((e,i)=>({e,i})).filter(o=>o.e.id===best.id).sort((a,b)=>(a.e.from?1:0)-(b.e.from?1:0))[0];pool.splice(pick.i,1);
    const c=best.c,old=eq[c.id][best.sl],was=src[c.id][best.sl];if(old)pool.push(was||{id:old,from:null});
    eq[c.id][best.sl]=best.id;src[c.id][best.sl]=pick.e.from?pick.e:null;
    // a weapon that leaves no hand for the shield puts the shield back (shields20.js)
    if(typeof sh20Ok==='function'&&eq[c.id].s){const real=c.eq;let ok=true;try{c.eq=eq[c.id];ok=sh20Ok(c);}catch(e){}finally{c.eq=real;}if(!ok){pool.push(src[c.id].s||{id:eq[c.id].s,from:null});eq[c.id].s=null;src[c.id].s=null;}}
    sc[c.id]=scoreEq(c,eq[c.id]);}
  const used=[];heroes.forEach(c=>SL.forEach(sl=>{const id=eq[c.id][sl];if(!id)return;const e=src[c.id][sl];used.push({hid:c.id,sl,id,from:e?e.from:null,fromSl:e?e.sl:undefined});}));
  return {heroes,eq,used,slots:SL};}
{const pg0=planGear;planGear=function(heroIds,takeIds,fair,slots){if(GP46.off)return pg0.apply(this,arguments);try{return gp46PlanGear(heroIds,takeIds,fair,slots);}catch(e){GP46.err=String(e&&e.message||e);return pg0.apply(this,arguments);}};}
// one hero (the hero sheet's Auto best gear): the same walk for that hero, pack only; the companion part is equip2.js's
{const ao0=autoOne;autoOne=function(c){if(GP46.off||!c)return ao0.apply(this,arguments);
  try{applyGear(planGear([c.id],[],false));refresh(c);}catch(e){GP46.err=String(e&&e.message||e);return ao0.apply(this,arguments);}
  try{const cur=compOf(c);let bo=cur,bg=cur?compGainFor(cur,c):0;(G.tamed||[]).forEach(o=>{if(o.with&&o.with!==c.id)return;const g=compGainFor(o,c);if(g>bg+.01){bg=g;bo=o;}});
    if(bo&&bo!==cur){G.tamed.forEach(x=>{if(x.with===c.id)x.with=null;});bo.with=c.id;}}catch(e){}
  Object.values(G.roster).forEach(refresh);};}
// ---------- Upgrade whole party: the per slot step for everyone, until none is left ----------
// the step each party hero and slot would take now, in the order they are taken (the biggest gain first)
function gp46Round(){const L=[];partyChars().forEach((c,hi)=>P3_SLOTS.forEach((sl,si)=>{let o=null;try{o=upgBest(c,sl).best;}catch(e){}if(o)L.push({o,hi,si});}));
  return L.sort((a,b)=>(b.o.pct-a.o.pct)||(a.hi-b.hi)||(a.si-b.si));}
// what a step does to the purse, the materials, the pack and the hero, without doing it (the plan runs on copies: see gp46Plan)
function gp46Virt(o){const c=G.roster[o.cid],sl=o.sl;G.gold-=o.gold||0;
  // the Smiths' Union gives part of a forging's price back (factions.js, craft): the purse needs the full price, then gets the rebate
  try{if((o.k==='forge'||(o.k==='chain'&&o.src==='forge'))&&RECIPES[o.ri]){const rb=facSmithRebate();if(rb>0)G.gold+=Math.round(RECIPES[o.ri].g*rb);}}catch(e){}
  if(o.m)Object.keys(o.m).forEach(k=>{G.mats[k]=Math.max(0,(G.mats[k]||0)-o.m[k]);});
  // a temper step that buys its missing parts at the counter: the counter's stock of monster parts is limited (engine.js partLeft)
  try{if(o.buy&&o.buy.buy)o.buy.buy.forEach(([k,n,t])=>{if(t==='part'){G.pbuy=G.pbuy||{};G.pbuy[k]=(G.pbuy[k]||0)+n;}});}catch(e){}
  const take=id=>{const i=G.gear.indexOf(id);if(i>=0)G.gear.splice(i,1);};let keepOld=true;
  if(o.k==='pack')take(o.id);else if(o.k==='chain'){if(o.src==='pack')take(o.base);}else if(o.k==='temper')keepOld=false;
  else if(o.k==='ef'){if(o.src==='eq')keepOld=false;else{const b=efBaseIn(o.f);if(b)G.gear.splice(b.i,1);}}
  const old=c.eq[sl];if(old&&keepOld)G.gear.push(old);c.eq[sl]=o.id;try{if(typeof sh20Drop==='function')sh20Drop(c);}catch(e){}c.S=calcStats(c);}
const gp46Src=o=>o.k==='pack'?'pack':o.k==='buy'?'buy':o.k==='forge'?'craft':o.k==='temper'?'temper':o.k==='chain'?(o.src==='forge'?'craft':o.src):'craft';
function gp46Plan(){const P=partyChars(),real={gold:G.gold,mats:G.mats,gear:G.gear,pbuy:G.pbuy,eq:{},S:{}},f0=FITC;P.forEach(c=>{real.eq[c.id]=c.eq;real.S[c.id]=c.S;});
  const picks=[],cant=[];let n=0,net=0;GP46.tP=[];
  try{G.mats=Object.assign({},G.mats);G.gear=G.gear.slice();G.pbuy=Object.assign({},G.pbuy||{});P.forEach(c=>{c.eq=Object.assign({},c.eq);});
    while(n<GP46.rounds){FITC={};const L=gp46Round();if(!L.length)break;n++;let did=0;
      for(const e of L){const c=P[e.hi],sl=e.o.sl;FITC={};const o=upgBest(c,sl).best;if(!o)continue;const from=c.eq[sl]||null,last=picks[picks.length-1]&&picks.filter(p=>p.cid===c.id&&p.sl===sl).pop();
        if(o.k==='temper'&&last&&last.id===from){// another temper step on the piece this plan already put on: one row
          last.id=o.id;last.gold+=o.gold||0;last.k=(last.k||0)+1;last.pct+=o.pct;if(o.m){last.m=Object.assign({},last.m||{});Object.keys(o.m).forEach(k=>{last.m[k]=(last.m[k]||0)+o.m[k];});}}
        else picks.push({cid:c.id,sl,id:o.id,base:o.k==='chain'?o.base:o.k==='temper'?from:o.id,k:o.k==='chain'?o.steps:o.k==='temper'?1:0,src:gp46Src(o),gold:o.gold||0,m:o.m||null,pct:o.pct,alt:[],from,round:n,kind:o.k});
        GP46.tP.push(c.id+' '+sl+' '+o.key+' g'+G.gold);gp46Virt(o);did++;}
      if(!did)break;}
    FITC={};P.forEach(c=>P3_SLOTS.forEach(sl=>{let R=null;try{R=upgBest(c,sl);}catch(e){}const g=R&&R.goal;if(g)cant.push({cid:c.id,sl,id:g.id,gold:g.gold||0,m:g.m||null,pct:g.pct,why:(g.m&&!hasMats(g.m))?'mats':'gold'});}));
    net=real.gold-G.gold;
  }finally{G.gold=real.gold;G.mats=real.mats;G.gear=real.gear;G.pbuy=real.pbuy;P.forEach(c=>{c.eq=real.eq[c.id];c.S=real.S[c.id];});FITC=f0;}
  return {picks,cant,total:Math.max(0,net),gold0:real.gold,rounds:n,steps:GP46.tP.length,gp46:1};}/* total: what the purse ends lower by (a Union rebate on forging already taken off) */
{const pa0=g16PlanAll;g16PlanAll=function(slots){if(GP46.off)return pa0.apply(this,arguments);return gp46Plan();};}
// for real: the same walk with upgApply
function gp46Run(){const T={stop:null,spent:0,bought:0,forged:0,tempered:0,done:0,of:0,rounds:0},f0=FITC;GP46.tR=[];
  try{while(T.rounds<GP46.rounds){FITC={};const L=gp46Round();if(!L.length)break;T.rounds++;let did=0;
      for(const e of L){const c=partyChars()[e.hi];if(!c)continue;FITC={};const o=upgBest(c,e.o.sl).best;if(!o)continue;T.of++;const g0=G.gold;FITC=null;GP46.tR.push(c.id+' '+e.o.sl+' '+o.key+' g'+G.gold);const r=upgApply(o);if(!r)continue;did++;T.done++;T.spent+=g0-G.gold;
        if(o.k==='buy'||(o.k==='chain'&&o.src==='buy'))T.bought++;if(o.k==='forge'||(o.k==='chain'&&o.src==='forge'))T.forged++;if(o.k==='temper'||o.k==='ef')T.tempered++;/* an Echoforge reworks a piece that is already owned */if(o.k==='chain')T.tempered+=o.steps||0;}
      if(!did)break;}}finally{FITC=f0;}
  return T;}
ACT.p3Smith=function(){if(!G||G.daily)return;V.modal={type:'p3plan',plan:g16PlanAll(),from:V.modal};render();};
ACT.p3Alch=function(){ACT.p3Smith();};
{const go0=ACT.p3SmithGo;ACT.p3SmithGo=function(){if(GP46.off)return go0.apply(this,arguments);const m=V.modal;if(!m||m.type!=='p3plan')return;const eq0={},pw0={};
  Object.values(G.roster).forEach(c=>{eq0[c.id]=Object.assign({},c.eq);pw0[c.id]=loadoutScore(c,c.S);});
  const T=gp46Run();Object.values(G.roster).forEach(refresh);
  // the purse shrank between the preview and the confirm: say so (the walk did what the gold still allowed)
  try{const want=m.plan&&m.plan.steps||0;if(T.done<want){T.stop='gold';T.of=want;}}catch(e){}
  const rows=[];Object.values(G.roster).forEach(c=>{const b=eq0[c.id],ch=[];EQSL.forEach(sl=>{if((b[sl]||null)!==(c.eq[sl]||null))ch.push({sl,from:b[sl]||null,to:c.eq[sl]||null});});
    if(ch.length)rows.push({id:c.id,name:c.name,inParty:G.party.includes(c.id),ch,comp:null,pw0:pw0[c.id],pw1:loadoutScore(c,c.S)});});
  saveGame();sfx(T.done?'buy':'deny');V.modal={type:'autoEq',mode:'smith',rows,snap:g16UndoSnap(eq0),from:m.from,p3:T};render();};}
try{window.__GP46={GP46,plan:gp46Plan,round:gp46Round,run:gp46Run,planGear:gp46PlanGear};}catch(e){}
