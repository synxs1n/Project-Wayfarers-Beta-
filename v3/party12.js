// ===== party12.js (v0.18.7): party changes in the Echo Rift hall, reserves keep no gear, New Game+ draws what you have not seen =====
// 1. partyHere(): the Party tab's swap, reserve, Build Party and loadout actions were locked to town (inTown(), ui2.js: world screen on a town
//    map). The lock was the v0.2.0 rule "the six are set in town" (plus the v0.10.2 wild recruit exception). The Echo Rift hall is a safe hub
//    (map.sanctum, safe:1) where gates are fought one at a time, so the six may change there between gates. In a rift fight V.screen is
//    'battle', so partyHere() is false and the battle screen has no swapping beyond the free swap of its own six. Everything else outside
//    town (fields, dungeons, caves) keeps the old lock.
// 2. Reserves keep no gear. Gear lives on the six; a hero who is not in the party has everything back in the pack (G.gear). One sweep
//    (pt12Tick, before render) enforces it for every way a hero can leave the six (swap, reserve, Build Party, loadout, wild recruit, Undo),
//    ldApply calls pt12StowOutside before it hands out gear. Old saves are migrated once (unpackG hook, G.pt12mig) with a one-time message.
//    Gear suggestions already compare only the party (fitsFor/gainersFor use G.party); the roster side line in bestTag is removed here.
//    A reserve who joins the six gets "Equip Best" offered on the Party tab. Best Party compares power without gear (pt12Power).
//    Pets are not gear and stay with their hero. Nothing runs in the Daily Trial.
// 3. New Game+ (cycle > 0): the four standard realms, the Calamity realm and their bosses are drawn from what the account has not seen yet.
//    META.pt12.runs holds one record per playthrough in order: {s:seed,c:cycle,o:order,b:bosses,f:final,vis:realms visited,bs:bosses faced}.
//    Unseen realms and unseen bosses come first; when everything is seen the draw is random with a lean (PT12.lean) toward whatever was not
//    in the last two playthroughs. Bosses use META.best[name].seen too (it syncs with the account), the realm list is local to the device.
//    A realm names its own Scourge (realmdata.js boss; realms14 removed the stand-ins, alt, so a realm has exactly one boss; world12.js), so the draw picks (realm, boss) pairs; a realm with no boss
//    named draws its boss the old way. It runs as a newRun hook (after realms.js, look9.js and world12.js) and newGame re-asserts it.
//    The run also carries G.run.ngp = {b,f}, the bosses drawn.
// New save fields: G.pt12mig (the gear migration ran), G.pt12note (message pending), G.run.ngp. New META field: META.pt12 = {v:1,runs:[...]}. Tunable: PT12.

const PT12={lean:.6,recent:2,keep:40};

// ---------- 1. changing the party in the Echo Rift hall ----------
function partyHere(){try{return inTown()||!!(V.screen==='world'&&!B&&WS.m&&WS.m.sanctum);}catch(e){return false;}}

// ---------- 2. reserves keep no gear ----------
// every hero outside `keep` (an array of ids; default: the party) hands all their gear to the pack; returns {n,by:{id:count}}
function pt12StowOutside(keep,g){g=g||G;const out={n:0,by:{}};if(!g||g.daily||!g.roster)return out;const K=new Set(keep||g.party||[]);
  Object.keys(g.roster).forEach(id=>{if(K.has(id))return;const c=g.roster[id];if(!c||!c.eq)return;let k=0;
    EQSL.forEach(sl=>{const it=c.eq[sl];if(it){g.gear.push(it);c.eq[sl]=null;k++;}});
    if(k){out.n+=k;out.by[id]=k;try{refresh(c);}catch(e){}}});
  return out;}
// power without gear: a reserve has none, so nobody's gear counts when Best Party compares heroes
function pt12Power(c){try{return loadoutScore(c,calcStats(Object.assign({},c,{eq:{}})));}catch(e){return loadoutScore(c,c.S);}}
const pt12Names=ids=>ids.map(id=>G.roster[id]&&G.roster[id].name).filter(Boolean);
function pt12Tick(){
  if(!G||G.daily||B||V.screen==='battle')return;
  if(V.pt12G!==G){V.pt12G=G;V.pt12P=G.party.slice();}
  const cur=G.party.slice(),prev=V.pt12P||cur,left=prev.filter(id=>!cur.includes(id)&&G.roster[id]),came=cur.filter(id=>!prev.includes(id)&&G.roster[id]);V.pt12P=cur;
  const r=pt12StowOutside();
  if(r.n){saveGame();const who=left.filter(id=>r.by[id]);
    if(who.length){const k=who.reduce((a,id)=>a+r.by[id],0);toast(`${pt12Names(who).join(', ')} left the six: ${k} piece${k>1?'s':''} of gear back in the pack.`);}}
  const bare=came.filter(id=>{const c=G.roster[id];return c&&!c.eq.w&&!c.eq.a;});
  if(bare.length&&!r.n)toast(`${pt12Names(bare).join(', ')} joins the six with no gear. Equip Best is on the Party tab.`);
  if(G.pt12note&&V.screen==='world'&&!V.modal&&!WS.dlg){const n=G.pt12note;delete G.pt12note;saveGame();
    V.modal={type:'story',title:'Gear back in the pack',text:`Heroes outside your six no longer carry gear. ${n} piece${n>1?'s':''} of gear from your reserves went back to the pack. Equip Best gears the six in your party, and a hero who joins the six can be geared from the pack.`,btn:'OK'};}
}
HOOK.before('render','party12','reserves keep no gear (the sweep)',function(){try{pt12Tick();}catch(e){console.error(e);}});
// old saves: every hero outside the six is unequipped into the pack once
HOOK.after('unpackG','party12','migrate: reserves keep no gear',function(g,o){try{if(!g||g.daily||g.pt12mig)return;g.pt12mig=1;const G0=G;G=g;let r;try{r=pt12StowOutside(null,g);}finally{G=G0;}if(r&&r.n)g.pt12note=r.n;}catch(e){}});
// the Party tab: a reserve who has joined the six and has nothing to wear gets Equip Best offered
HOOK.xform('vSwap','party12','Equip Best offer for heroes in the six with empty weapon or armor slots',function(h,where){try{
  if(!G||G.daily||typeof h!=='string'||where==='guild')return h;
  const bare=G.party.map(id=>G.roster[id]).filter(c=>c&&['w','a'].some(sl=>!c.eq[sl]&&G.gear.some(id=>slotOk(c,sl,id))));
  if(!bare.length)return h;
  return h+`<div class="pt12eq row"><div class="grow"><b>${bare.map(c=>esc(c.name)).join(', ')}</b><small>${bare.length>1?'have':'has'} an empty weapon or armor slot and the pack has gear that fits. Heroes outside the six keep no gear.</small></div><button class="btn sm gold" data-act="autoEqParty">Equip Best</button></div>`;}catch(e){return h;}});
// a reserve's sheet: the slots are shown but cannot be changed (the gear is in the pack)
HOOK.xform('mChar','party12','reserve sheet: gear slots are read only',function(h,id,edit){try{if(!G||G.daily||typeof h!=='string'||G.party.includes(id)||!G.roster[id])return h;
  h=h.replace(/<button class="row tr eqsrow" data-act="gearSlot" data-arg="\w"/g,'<button class="row tr eqsrow" disabled');
  return h.replace('On the roster.','On the roster (a reserve). Reserves keep no gear: it waits in the pack until they join the six.');}catch(e){return h;}});

// ---------- 3. New Game+: realms and bosses you have not seen ----------
const PT12_TIER={thistle:1,orchard:1,strand:1,lakes:1,moors:1,mire:2,grotto:2,tundra:2,peaks:2,bamboo:2,deeps:3,mines:3,glacier:3,mesa:3,bone:3,ashglass:3},PT12_WANT=[[1],[1,2],[2,3],[3]];// the fantasy ladder of realms.js
const pt12Meta=()=>{const m=META.pt12=META.pt12&&Array.isArray(META.pt12.runs)?META.pt12:{v:1,runs:[]};return m;};
const pt12RealmKey=i=>{try{return REALMS[i-REALM_BASE].key;}catch(e){return '';}};
const pt12RealmName=i=>{try{return REALMS[i-REALM_BASE].n;}catch(e){return String(i);}};
// the record of one playthrough (created when it starts, or, for a journey begun before this existed, when it is first looked at)
function pt12Rec(g){g=g||G;if(!g||g.daily||!g.run||!g.run.order)return null;const M=pt12Meta();let r=M.runs.find(x=>x.s===g.run.seed);
  if(!r){r={s:g.run.seed,c:g.run.cycle||0,o:g.run.order.slice(),b:(g.run.bosses||[]).slice(),f:g.run.final,vis:[],bs:[]};M.runs.push(r);if(M.runs.length>PT12.keep)M.runs.splice(0,M.runs.length-PT12.keep);}return r;}
function pt12Track(g){try{g=g||G;const r=pt12Rec(g);if(!r)return;let ch=false;
  (g.visited||[]).forEach(st=>{const i=g.run.order[st];if(i!=null&&!r.vis.includes(i)){r.vis.push(i);ch=true;}});
  (g.cleared||[]).forEach((c,s)=>{if(!c)return;const k=s<4?(g.run.bosses||[])[s]:g.run.final;if(k&&!r.bs.includes(k)){r.bs.push(k);ch=true;}});
  if(ch)saveMeta();}catch(e){}}
HOOK.before('newGame','party12','close the record of the journey that ends',function(){try{if(G&&!G.daily)pt12Track(G);}catch(e){}});
HOOK.after('arrive','party12','realms visited',function(){pt12Track();});
HOOK.after('win','party12','bosses beaten',function(){pt12Track();});
HOOK.after('startBattle','party12','bosses faced',function(r,spec){try{if(r===false||!G||G.daily||!spec||spec.kind!=='boss')return;const k=bossKeyFor(spec.stage|0),rec=pt12Rec();if(rec&&k&&!rec.bs.includes(k)){rec.bs.push(k);saveMeta();}}catch(e){}});
// the draw. ctx = {runs: [records, oldest first], seenBoss(k): the account has met this boss}; R = random function. Pure: the test sim uses it too.
// A realm names its own Scourge (realmdata.js: boss; an optional alt list is still read but realms14 has none; world12.js), so the draw picks (realm, boss) pairs:
// pairs with an unseen realm and an unseen boss first, then an unseen realm, then an unseen boss, then random weighted by recency.
function pt12Age(runs,test){for(let i=runs.length-1,a=1;i>=0;i--,a++)if(test(runs[i]))return a;return Infinity;}
const pt12Cands=(i,pool)=>{try{const R=ZONES[i],l=[R.boss].concat(R.alt||[]).filter(k=>k&&pool.includes(k)&&guardianDef(k));return l.length?l:null;}catch(e){return null;}};
// one boss from `pool` the old way (no realm connection): unseen first, then weighted by how long ago it was met
function pt12Loose(pool,n,R,seen,age){const left=pool.slice(),out=[];while(out.length<n&&left.length){const un=left.filter(k=>!seen(k));let k;
  if(un.length)k=un[Math.floor(R()*un.length)];else{const w=left.map(x=>age(x)>PT12.recent?1+PT12.lean:1),tot=w.reduce((a,b)=>a+b,0);let r=R()*tot,i=0;for(;i<left.length-1;i++){if((r-=w[i])<0)break;}k=left[i];}
  out.push(k);left.splice(left.indexOf(k),1);}return out;}
function pt12Select(ctx,R){
  const runs=ctx.runs,seenR=new Set();runs.forEach(r=>(r.vis||[]).forEach(i=>seenR.add(i)));
  const bossSeen=k=>ctx.seenBoss(k)||runs.some(r=>(r.bs||[]).includes(k));
  const rAge=i=>pt12Age(runs,r=>(r.vis||[]).includes(i)),bAge=k=>pt12Age(runs,r=>(r.bs||[]).includes(k));
  const used=new Set(),usedB=new Set(),order=[],bosses=[];let coupled=true;
  // one slot: ts = the tiers the slot wants (null for the Calamity realm), realms = the candidates, pool = the bosses allowed
  function slot(ts,realms,pool){const U=[];
    realms.forEach(i=>{if(used.has(i))return;const L=(pt12Cands(i,pool)||[]).filter(b=>!usedB.has(b)),dist=ts?Math.min(...ts.map(t=>Math.abs((PT12_TIER[pt12RealmKey(i)]||2)-t))):0;
      (L.length?L:[null]).forEach(b=>{const rs=seenR.has(i),bs=b?bossSeen(b):false;U.push({i,b,dist,cls:!rs&&(!b||!bs)?0:!rs?1:(b&&!bs)?1.5:2});});});
    const best=Math.min(...U.map(u=>u.cls));let P=U.filter(u=>u.cls===best);const d=Math.min(...P.map(u=>u.dist));P=P.filter(u=>u.dist===d);let u;
    if(best<2)u=P[Math.floor(R()*P.length)];
    else{const w=P.map(x=>(x.b&&bAge(x.b)>PT12.recent?1+PT12.lean:1)*(rAge(x.i)>PT12.recent?1+PT12.lean/2:1)),tot=w.reduce((a,b)=>a+b,0);let r=R()*tot,k=0;for(;k<P.length-1;k++){if((r-=w[k])<0)break;}u=P[k];}
    used.add(u.i);if(u.b)usedB.add(u.b);else coupled=false;return u;}
  PT12_WANT.forEach(ts=>{const u=slot(ts,REALM_STD,GPOOL);order.push(u.i);bosses.push(u.b);});
  const c=slot(null,REALM_CAL,FPOOL);order.push(c.i);let final=c.b;
  // a realm with no boss of its own named (or all taken): drawn the old way, unseen first
  const hole=bosses.map((b,k)=>b?-1:k).filter(k=>k>=0);
  if(hole.length){const f=pt12Loose(GPOOL.filter(k=>!usedB.has(k)),hole.length,R,bossSeen,bAge);hole.forEach((k,j)=>bosses[k]=f[j]);}
  if(!final)final=pt12Loose(FPOOL,1,R,bossSeen,bAge)[0];
  return {order,bosses,final,coupled,newRealms:order.filter(i=>!seenR.has(i)).length,newBosses:bosses.concat([final]).filter(k=>!bossSeen(k)).length};}
const pt12Ctx=()=>({runs:pt12Meta().runs,seenBoss:k=>{try{return ((META.best||{})[guardianDef(k).n]||{}).seen>0;}catch(e){return false;}}});
// New Game+ (cycle > 0) draws its run here, after realms.js, look9.js and world12.js have drawn theirs: the realms and their bosses are replaced
HOOK.xform('newRun','party12','New Game+ draws realms and bosses not seen yet',function(r,cycle){try{if((cycle||0)>0&&r&&r.order&&r.rv===2){
  const S=pt12Select(pt12Ctx(),seeded((r.seed^0x12a7)>>>0));r.order=S.order;r.bosses=S.bosses;r.final=S.final;r.ngp={b:S.bosses.slice(),f:S.final};}}catch(e){console.error(e);}return r;});
// whatever load order the modules have, the bosses chosen here stand (and the first realm's quests are made again if a later hook changed them)
HOOK.after('newGame','party12','keep the New Game+ draw, record the playthrough',function(r,ids,cycle){try{if(!G||G.daily||!G.run)return;
  // newRun is only hookable once engine.js defines it (HOOK.def); without that the draw happens here, after the fact
  if((cycle||0)>0&&!G.run.ngp&&G.run.order&&G.run.rv===2){const S=pt12Select(pt12Ctx(),seeded((G.run.seed^0x12a7)>>>0));G.run.order=S.order;G.run.bosses=S.bosses;G.run.final=S.final;G.run.ngp={b:S.bosses.slice(),f:S.final};try{if(typeof lookSync==='function')lookSync();}catch(e){}G.quests=[];genQuests(0);}
  const p2=G.run.ngp;
  if(p2&&((G.run.bosses||[]).join()!==p2.b.join()||G.run.final!==p2.f)){G.run.bosses=p2.b.slice();G.run.final=p2.f;try{if(typeof lookSync==='function')lookSync();}catch(e){}G.quests=[];genQuests(0);}
  pt12Rec(G);saveMeta();}catch(e){console.error(e);}});
// ---------- styles ----------
try{const st=document.createElement('style');st.textContent='.pt12eq{margin:.5em 0;padding:.4em .5em;border:1px solid rgba(255,208,74,.4);border-radius:6px}';document.head.appendChild(st);}catch(e){}
// ---------- test hook (our own object; window.__A is not touched) ----------
window.__PT12={PT12,partyHere,pt12StowOutside,pt12Tick,pt12Power,pt12Select,pt12Ctx,pt12Rec,pt12Track,pt12RealmName,get META(){return META;}};
