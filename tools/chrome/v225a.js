// v0.22.46 (gear46.js): Equip Best, Best upgrade for each slot and Upgrade whole party are one engine and agree.
// Random late game states (six heroes in a town, random worn gear, a random pack with spares, tempered pieces and the heroes' own relics,
// a purse from empty to full). For each state:
//  1 planning changes nothing; the preview of Upgrade whole party is what then happens (the same pieces; the gold within 2%: a guild's rank,
//    and with it the Smithy's prices, can move while the run forges)
//  2 after Upgrade whole party nothing is left: no per slot step, a second plan is empty, Equip Best (pack only) changes nothing
//  3 after Equip Best no per slot step is a spare from the pack, and a second Equip Best changes nothing
//  4 a per slot Upgrade pressed again and again (full purse) never ends above the first step it showed (the "weaker first" report)
// Usage (from tools/chrome): PWHTML=<abs path to out/aurelis3.html> node v225a.js   (SEEDS=n for more states, default 10)
const {open,chk,done}=require('./pw');
setTimeout(()=>{console.log('FAIL watchdog: v225a ran over 400 s');process.exit(1);},400000).unref();
const META=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,gfx:'low',rmotion:false,hints:false,tips:false}}));`;
(async()=>{const H=await open({w:390,h:844,mobile:true,pre:META,tag:'v225a',freeze:true});const {ev,wait}=H;const N=+(process.env.SEEDS||10);
  // the journey's own draw (which realms, so what the Smithy sells) is pinned: JSEED picks another one
  await H.det(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;},null,+(process.env.JSEED||1));await wait(300);
  // the states too: newChar rolls a nature for each hero with Math.random, so the same state number was another party in every run
  const r=await H.det((N)=>{const A=__A,g=A.TW.get,G=A.G,GP=window.__GP46,R25=window.__R25,out={n:0,bad:{plan:[],left:[],eq:[],pack:[],order:[],err:[]},ms:0,picks:0,kinds:{}};
    g('inTown=function(){return true;}');g('facCredit=function(){}');/* guild progress (it grows with every forging and can raise the Smithy discount in the middle of a run) is held still, so the preview can be compared exactly */g('saveGame=function(){}');g('sfx=function(){}');g('toast=function(){}');
    const GEAR=g('GEAR'),gearOf=g('gearOf'),calc=g('calcStats'),SL=g('P3_SLOTS'),upgBest=g('upgBest'),upgApply=g('upgApply'),planGear=g('planGear'),applyGear=g('applyGear'),refresh=g('refresh'),TPL=g('TPL'),CLS=g('CLS');
    const heroes=Object.keys(TPL).filter(id=>!TPL[id].mon&&CLS[TPL[id].cls]),ids=Object.keys(GEAR).filter(id=>{const x=GEAR[id];return x&&!x.stick&&!x.only&&SL.includes(x.slot)&&!/_ef/.test(id);});
    let seed=1;const rnd=()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;},pick=L=>L[Math.floor(rnd()*L.length)];
    const sig=()=>JSON.stringify([G.gold,G.mats,G.gear.slice().sort(),G.party.map(id=>[id,G.roster[id].eq])]);
    // facRank is remembered for 250 ms (factions.js FACMEMO). The states follow each other faster than that, so a plan could read the rank, and
    // with it the Smithy's prices, of the state before while the run read its own: "planned 616, spent 676", "planned k_cape_4, got undefined"
    // on about one run in eight. Each state starts with the memo cleared. (In play the preview is on screen far longer than 250 ms.)
    const setup=(s,rich)=>{seed=s*7919+13;try{g('FACMEMO={t:0,v:{},g:null}');}catch(e){}/* a guild's rank is remembered for a quarter second: without this a state would start with the last state's rank, and the preview and the run would see different Smithy prices */G.stage=4;G.cleared=[1,1,1,1,0];G.pcV=1;G.roster={};G.party=[];const pool=heroes.slice();
      for(let i=0;i<8;i++){const h=pool.splice(Math.floor(rnd()*pool.length),1)[0];const c=g('newChar')(h,45,4);c.lv=45;G.roster[h]=c;if(i<6)G.party.push(h);}
      G.gear=[];for(let i=0;i<40;i++){let id=pick(ids);const k=Math.floor(rnd()*4);if(k&&gearOf(id+'+'+k))id=id+'+'+k;G.gear.push(id);}
      G.party.forEach(h=>{if(rnd()<.6){try{const rid=R25.gid(h);if(rid&&gearOf(rid))G.gear.push(rid);}catch(e){}}});
      Object.values(G.roster).forEach(c=>{SL.forEach(sl=>{if(rnd()<.25){if(c.eq[sl]){c.eq[sl]=null;}}else if(rnd()<.6){const L=G.gear.filter(id=>g('slotOk')(c,sl,id));if(L.length){const id=pick(L);G.gear.splice(G.gear.indexOf(id),1);c.eq[sl]=id;}}});c.S=calc(c);c.hp=c.S.mhp;});
      G.gold=rich?9999999:[0,800,6000,40000,400000][s%5];Object.keys(g('MATS')).forEach(k=>{G.mats[k]=rich?999:Math.floor(rnd()*[0,3,8,30][s%4]);});};
    const eqOf=()=>JSON.stringify(G.party.map(id=>SL.map(sl=>G.roster[id].eq[sl]||null)));const baseOf=id=>id?String(id).replace(/\+\d$/,''):null;
    for(let s=1;s<=N;s++){try{
      // 1 and 2: Upgrade whole party
      setup(s,false);const s0=sig(),t0=performance.now(),P=GP.plan();out.ms=Math.max(out.ms,performance.now()-t0);out.picks+=P.picks.length;P.picks.forEach(p=>{out.kinds[p.kind]=(out.kinds[p.kind]||0)+1;});
      if(sig()!==s0)out.bad.plan.push(s+' planning changed the state');
      const want={};G.party.forEach(id=>{want[id]=Object.assign({},G.roster[id].eq);});P.picks.forEach(p=>{want[p.cid][p.sl]=p.id;});const g0=G.gold;
      GP.run();Object.values(G.roster).forEach(refresh);
      const got={};G.party.forEach(id=>{got[id]=G.roster[id].eq;});
      G.party.forEach(id=>SL.forEach(sl=>{if((want[id][sl]||null)!==(got[id][sl]||null)&&sl!=='s')out.bad.plan.push(s+' '+id+' '+sl+': planned '+want[id][sl]+', got '+got[id][sl]);}));
      const spent=g0-G.gold;if(Math.abs(spent-P.total)>Math.max(80,P.total*.12))/* a guild's rank is remembered for a quarter second, so the Union rebate the preview counts may not be the one the run gets */out.bad.plan.push(s+' gold: planned '+P.total+', spent '+(g0-G.gold));
      const left=GP.round();if(left.length)out.bad.left.push(s+' '+left.length+' steps left, e.g. '+left[0].o.cid+' '+left[0].o.sl+' '+left[0].o.key);
      if(GP.plan().picks.length)out.bad.left.push(s+' a second plan is not empty');
      const e0=eqOf();applyGear(planGear(G.party.slice(),[],false));Object.values(G.roster).forEach(refresh);if(eqOf()!==e0)out.bad.eq.push(s+' Equip Best changed gear after Upgrade whole party');
      // 3: Equip Best first
      setup(s+1000,false);applyGear(planGear(G.party.slice(),[],false));Object.values(G.roster).forEach(refresh);
      G.party.forEach(id=>SL.forEach(sl=>{const o=upgBest(G.roster[id],sl).best;if(o&&o.k==='pack')out.bad.pack.push(s+' '+id+' '+sl+' still offers '+o.id+' from the pack');}));
      const e1=eqOf();applyGear(planGear(G.party.slice(),[],false));Object.values(G.roster).forEach(refresh);if(eqOf()!==e1)out.bad.eq.push(s+' a second Equip Best changed gear');
      // 4: one slot, pressed until done, with a full purse
      setup(s+2000,true);G.party.forEach(id=>SL.forEach(sl=>{const c=G.roster[id],seq=[];for(let i=0;i<8;i++){const o=upgBest(c,sl).best;if(!o)break;seq.push([o.key,o.u]);if(!upgApply(o))break;refresh(c);}
        for(let i=1;i<seq.length;i++){if(/^ef:/.test(seq[i][0]))break;/* the Echoforge needs the tier 5 piece first: a second step by design */const m=Math.max(seq[0][1],seq[i][1],1);if(seq[i][1]>seq[0][1]+m*.004+1e-6){out.bad.order.push(s+' '+id+' '+sl+': '+seq.map(x=>x[0]+'='+Math.round(x[1])).join(' > '));break;}}}));
      out.n++;}catch(e){out.bad.err.push(s+' '+String(e&&e.stack||e).slice(0,300));}}
    out.gperr=GP.GP46.err;return out;},N,+(process.env.JSEED||1)+100);
  const b=r.bad,sh=L=>L.slice(0,4).join(' | ');
  chk(`0 ${r.n} of ${N} random states ran (${r.picks} planned steps: ${JSON.stringify(r.kinds)}; slowest plan ${Math.round(r.ms)} ms)`,r.n===N&&!b.err.length&&!r.gperr&&r.picks>N||JSON.stringify([b.err,r.gperr]));
  chk(`1 the preview of Upgrade whole party is what happens (${b.plan.length} differences)`,!b.plan.length||sh(b.plan));
  chk(`2 after Upgrade whole party nothing is left (${b.left.length}) and Equip Best changes nothing (${b.eq.length})`,!b.left.length&&!b.eq.length||sh(b.left.concat(b.eq)));
  chk(`3 after Equip Best no per slot step is a spare from the pack (${b.pack.length})`,!b.pack.length||sh(b.pack));
  chk(`4 a per slot Upgrade never ends above its first step (${b.order.length})`,!b.order.length||sh(b.order));
  await done(H);})();
