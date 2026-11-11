// v0.18.7 party12.js: (1) the party can be changed in the Echo Rift hall (not in a rift fight, still not in fields), (2) reserves keep no gear
// (leaving the six returns it to the pack, old saves migrated once, suggestions judge the party only, Equip Best offered to a reserve who
// joins, loadouts and Best Party still work), (3) New Game+ draws realms and bosses not seen yet (sim over 10 starts on one account).
// Usage: PWHTML=../../out/aurelis3.html node v169a.js
const {open,chk,done}=require('./pw');
const PRE=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',music:0,sfx:0,gfx:'low',hints:false}}));`;
(async()=>{const H=await open({w:430,h:800,mobile:true,pre:PRE});const {ev,wait}=H;
await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(i=>A.ACT.pickS(i));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;});await wait(250);

// a roster of six: three in the party, three reserves; every hero wears gear (as an old save would have it), a pack holds spares
const SETUP=()=>{const A=__A,G=A.G,T=A.TW.get,GEAR=A.GEAR;G.roster={};const ids=['mira','lumen','oren','brann','tess','sable'];ids.forEach(id=>{const c=A.newChar(id,10,1);G.roster[id]=c;});
  G.party=['mira','lumen','oren'];G.gear=[];const ks=Object.keys(GEAR).filter(k=>!GEAR[k].stick&&!GEAR[k].only&&!/_ef/.test(k));
  const by=sl=>ks.filter(k=>GEAR[k].slot===sl);
  ids.forEach(id=>{const c=G.roster[id];c.eq={w:null,a:null,c:null,k:null};['w','a'].forEach(sl=>{const it=by(sl).find(k=>A.canEquip(c,k)&&GEAR[k].tier<=1);if(it)c.eq[sl]=it;});});
  G.gear=by('w').filter(k=>GEAR[k].tier===2).slice(0,12).concat(by('a').filter(k=>GEAR[k].tier===2).slice(0,9));
  Object.values(G.roster).forEach(c=>{c.S=A.calcStats(c);c.hp=c.S.mhp;c.mp=c.S.mmp;});G.daily=0;A.V.modal=null;A.V.screen='world';};
const SETUPS=SETUP.toString();

// ================= 1. the Echo Rift hall =================
let r=await ev(([S])=>{const A=__A,G=A.G,o={};eval('('+S+')')();
  G.won=true;G.echoStory={0:1,1:1,2:1,3:1,4:1};A.ACT.toSanctum();return true;},[SETUPS]);await wait(900);
r=await ev(()=>{const A=__A,G=A.G,o={};o.hall=!!(A.WS.m&&A.WS.m.sanctum);o.here=__PT12.partyHere();o.screen=A.V.screen;
  A.V.modal={type:'menu',tab:'party'};A.render();o.note=/You must be in town/.test(document.querySelector('#modal')?.textContent||'');
  const before=G.party.join();A.ACT.swapTap('p:0');A.ACT.swapTap('r:brann');o.swapped=G.party.join();o.changed=G.party.join()!==before&&G.party.includes('brann');
  A.ACT.p3Swap('tess,lumen');o.p3=G.party.join();
  // Build Party applies in the hall
  A.ACT.bpOpen();const P=A.V.modal.plan;o.bpBtnDisabled=(()=>{A.render();const b=document.querySelector('#modal [data-act="bpApply"]');return b?b.disabled:null;})();
  return o;});
console.log(JSON.stringify(r));
chk('standing in the Echo Rift hall: partyHere() is true and the Party tab no longer says "you must be in town"',r.hall&&r.here&&!r.note||JSON.stringify(r));
chk('in the hall the swap taps and the Team check swap change the six',r.changed&&r.p3.includes('tess')&&!r.p3.includes('lumen')||JSON.stringify(r));
chk('in the hall Build Party can be applied',r.bpBtnDisabled===false||JSON.stringify(r));
// a rift fight keeps the lock
r=await ev(()=>{const A=__A,G=A.G,T=A.TW.get,o={};A.V.modal=null;const spec=Object.assign({},T('echoSpec')('thornwarden'),{rift:1});o.started=A.startBattle(spec)!==false;o.screen=A.V.screen;o.here=__PT12.partyHere();
  const before=G.party.join();A.V.modal={type:'menu',tab:'party'};A.ACT.swapTap('p:0');A.ACT.swapTap('r:sable');A.ACT.p3Swap('sable,oren');o.same=G.party.join()===before;return o;});
console.log(JSON.stringify(r));
chk('during a rift fight the party cannot be changed (battle screen, partyHere() false)',r.started&&r.screen==='battle'&&!r.here&&r.same||JSON.stringify(r));
// fields keep the lock
await ev(()=>{const A=__A;if(A.B){A.B.over=true;A.finishBattle('fled');}A.V.modal=null;});await wait(300);
r=await ev(([S])=>{const A=__A,G=A.G,o={};eval('('+S+')')();const m=A.getMap('f0'),g0=m.gates&&m.gates.start&&m.gates.start.arrive;A.placeAt('f0',g0?g0[0]:2,g0?g0[1]:(m.sy||2),'r');A.V.screen='world';A.V.modal={type:'menu',tab:'party'};A.render();
  o.kind=A.WS.m.kind;o.here=__PT12.partyHere();const before=G.party.join();A.ACT.p3Swap('brann,mira');o.same=G.party.join()===before;
  A.placeAt('t0',6,6,'r');o.townHere=__PT12.partyHere();return o;},[SETUPS]);
console.log(JSON.stringify(r));
chk('in a field the lock stays; in town it still works',r.kind==='field'&&!r.here&&r.same&&r.townHere||JSON.stringify(r));

// ================= 2. reserves keep no gear =================
r=await ev(([S])=>{const A=__A,G=A.G,o={};eval('('+S+')')();const rs=['brann','tess','sable'];
  const worn=id=>Object.values(G.roster[id].eq).filter(Boolean).length;o.before=rs.map(worn);const pk0=G.gear.length;
  A.render();o.after=rs.map(worn);o.packGain=G.gear.length-pk0;o.expect=o.before.reduce((a,b)=>a+b,0);o.partyKeeps=['mira','lumen','oren'].every(id=>worn(id)>=2);
  // swap a geared party hero out for a reserve (in town): their gear goes to the pack, the newcomer is bare and gets Equip Best offered
  A.placeAt('t0',6,6,'r');A.V.modal={type:'menu',tab:'party'};const miraEq=Object.assign({},G.roster.mira.eq),pk1=G.gear.length;
  A.ACT.p3Swap('brann,mira');A.render();o.partyNow=G.party.join();o.miraBare=worn('mira');o.brannBare=worn('brann');o.packAfterSwap=G.gear.length-pk1;o.miraGearInPack=Object.values(miraEq).filter(Boolean).every(id=>G.gear.includes(id));
  o.offer=!!document.querySelector('#modal .pt12eq [data-act="autoEqParty"]');
  A.ACT.autoEqParty();A.V.modal=null;A.render();o.brannGeared=worn('brann')>=2;
  // camp / reserve button of the sheet: gear slots on a reserve's sheet are read only
  A.V.modal={type:'char',char:'mira',edit:true};A.render();o.sheetDis=document.querySelectorAll('#modal .eqsrow[disabled]').length;
  return o;},[SETUPS]);
console.log(JSON.stringify(r));
chk('every reserve is stripped on the next render and the pieces land in the pack',r.expect>0&&r.after.every(n=>n===0)&&r.packGain===r.expect&&r.partyKeeps||JSON.stringify(r));
chk('swapping a geared hero out: all their gear returns to the pack, the newcomer is bare',r.partyNow.startsWith('brann')&&r.miraBare===0&&r.brannBare===0&&r.miraGearInPack||JSON.stringify(r));
chk('the Party tab offers Equip Best for the newcomer and Equip Best gears them from the pack',r.offer&&r.brannGeared||JSON.stringify(r));
chk('a reserve\'s sheet shows the slots read only',r.sheetDis===4||JSON.stringify(r));
// every way out of the six: reserve button, loadout, Best Party, Undo, daily
r=await ev(([S])=>{const A=__A,G=A.G,T=A.TW.get,o={};eval('('+S+')')();A.render();A.placeAt('t0',6,6,'r');
  const worn=id=>Object.values(G.roster[id].eq).filter(Boolean).length;
  // geared party
  A.ACT.autoEqParty();A.V.modal=null;A.render();const base=Object.assign({},G.roster.mira.eq);o.partyGeared=['mira','lumen','oren'].map(worn);
  // loadout 1 = the current six with their gear
  A.ACT.ldSave(0);const L=G.loadouts[0];o.ldHasGear=!!L.eq.mira&&Object.values(L.eq.mira).filter(Boolean).length>0;
  // swap mira out through the Party tab's reserve button and a sheet swap
  A.V.swapSel=null;A.V.modal={type:'menu',tab:'party'};A.render();A.ACT.swapTap('p:0');A.ACT.swapOut();A.render();o.afterReserve=[worn('mira'),G.party.includes('mira')];
  // the loadout brings mira back: she gets her saved gear from the pack
  A.ACT.ldApply(0);o.afterLd=G.party.join();o.miraBack=JSON.stringify(G.roster.mira.eq)===JSON.stringify(base);
  const ldMsg=A.V.modal&&A.V.modal.msgs;o.ldMiss=ldMsg?ldMsg.miss.length:-1;
  // undo restores the six and their gear
  if(A.V.modal&&A.V.modal.type==='ldRes'){A.ACT.ldUndo();}A.render();o.undoParty=G.party.join();o.undoMiraBare=worn('mira')===0&&G.roster.lumen.eq.w!=null;
  // a loadout card still draws with gear-less reserves
  A.V.modal={type:'menu',tab:'loadouts'};A.render();o.cards=document.querySelectorAll('#modal .ldcard').length;
  // Best Party and the Training team run with gear-less reserves
  G.roster.sable.lv=3;G.roster.sable.S=A.calcStats(G.roster.sable);const bp=A.TW.get('bestParty')();o.bpOpts=bp.opts.map(x=>x.key);o.trainOK=bp.opts.some(x=>x.key==='train');
  const w=id=>__PT12.pt12Power(G.roster[id]);o.powerSame=Math.abs(w('brann')-(()=>{const c=G.roster.brann,e=c.eq;c.eq={w:null,a:null,c:null,k:null};const v=__PT12.pt12Power(c);c.eq=e;return v;})())<1e-9;
  // Equip Best everyone no longer hands a reserve gear
  A.ACT.autoEqAll();A.V.modal=null;A.render();o.reserveBare=['brann','tess','sable'].every(id=>worn(id)===0);
  return o;},[SETUPS]);
console.log(JSON.stringify(r));
chk('the reserve button returns the hero\'s gear to the pack',r.afterReserve[0]===0&&r.afterReserve[1]===false||JSON.stringify(r));
chk('a loadout brings the hero back and re-equips them from the pack, nothing reported lost',r.ldHasGear&&r.miraBack&&r.ldMiss===0||JSON.stringify(r));
chk('Undo of the loadout puts the six and the gear back as before it (Mira out and bare, the others geared)',r.undoParty==='lumen,oren'&&r.undoMiraBare||JSON.stringify(r));
chk('the Loadouts tab (ldCards) draws, Best Party and the Training team work with gear-less reserves',r.cards>=1&&r.bpOpts.length>=2&&r.trainOK||JSON.stringify(r));
chk('Best Party power ignores gear for everyone, Equip Best (all) gears the party only',r.powerSame&&r.reserveBare||JSON.stringify(r));
// suggestions judge the party only
r=await ev(([S])=>{const A=__A,G=A.G,T=A.TW.get,GEAR=A.GEAR,o={};eval('('+S+')')();A.render();
  // an item only a reserve could use (a class the party lacks): find one
  const party=G.party.map(id=>G.roster[id]),res=['brann','tess','sable'].map(id=>G.roster[id]);
  const cand=Object.keys(GEAR).find(k=>GEAR[k].slot==='w'&&GEAR[k].tier===4&&!GEAR[k].only&&!party.some(c=>A.canEquip(c,k))&&res.some(c=>A.canEquip(c,k)));
  o.cand=cand||null;if(cand){G.gear.push(cand);o.fits=T('fitsFor')(cand).map(x=>x.c.id);o.gainers=T('gainersFor')(cand).map(x=>x.c.id);o.tag=T('bestTag')(cand);o.queued=(()=>{A.V.gearQueue=[];T('queueNewGear')([cand],false);return (A.V.gearQueue||[]).length;})();}
  // an upgrade for a party hero is suggested
  const any=Object.keys(GEAR).find(k=>GEAR[k].slot==='w'&&GEAR[k].tier===5&&!GEAR[k].only&&A.canEquip(party[0],k));G.gear.push(any);A.V.gearQueue=[];T('queueNewGear')([any],false);o.partyQueued=(A.V.gearQueue||[]).length;
  return o;},[SETUPS]);
console.log(JSON.stringify(r));
chk('gear only a reserve could use is not suggested, and the shop line "Also helps in your roster" is gone',r.cand&&r.fits.length===0&&r.gainers.length===0&&r.queued===0&&!/Also helps in your roster/.test(r.tag)||JSON.stringify(r));
chk('a pick-up that is better for a party hero is still suggested',r.partyQueued===1||JSON.stringify(r));
// migration of an old save, once, with a message
r=await ev(([S])=>{const A=__A,G=A.G,T=A.TW.get,o={};eval('('+S+')')();
  const raw=JSON.parse(JSON.stringify(T('packG')()));delete raw.pt12mig;const n=['brann','tess','sable'].reduce((a,id)=>a+Object.values(raw.roster[id].eq).filter(Boolean).length,0);
  const pk=raw.gear.length;const g=T('unpackG')(JSON.parse(JSON.stringify(raw)));
  o.n=n;o.bare=['brann','tess','sable'].every(id=>Object.values(g.roster[id].eq).filter(Boolean).length===0);o.pack=g.gear.length-pk;o.note=g.pt12note;o.flag=g.pt12mig;
  const raw2=JSON.parse(JSON.stringify(Object.assign({},raw,{pt12mig:1})));const g2=T('unpackG')(raw2);o.second=g2.pt12note!==undefined;
  // the message appears once
  A.V.modal=null;G.pt12note=n;A.render();o.modal=A.V.modal&&A.V.modal.type;o.msg=A.V.modal&&A.V.modal.text;A.ACT.storyOk();A.render();o.once=!A.V.modal&&G.pt12note===undefined;
  // daily trial: nothing is stripped
  G.daily=1;G.roster.brann.eq.w='w_blade_0';const pk2=G.gear.length;A.render();o.daily=G.roster.brann.eq.w==='w_blade_0'&&G.gear.length===pk2;G.daily=0;
  return o;},[SETUPS]);
console.log(JSON.stringify(r));
chk('migration: every non-party hero is unequipped into the pack once, the count is kept for the message',r.n>0&&r.bare&&r.pack===r.n&&r.note===r.n&&r.flag===1&&!r.second||JSON.stringify(r));
chk('the one-time message names the count and shows once',r.modal==='story'&&new RegExp(r.n+' piece').test(r.msg||'')&&r.once||JSON.stringify(r));
chk('the Daily Trial is not touched',r.daily);

// ================= 3. New Game+ =================
// real starts on one account: each NG+ start, then the player visits every realm and faces every boss of it
r=await ev(()=>{const A=__A,T=A.TW.get,M=A.TW.get('META'),o={rows:[]};
  const names=i=>__PT12.pt12RealmName(i);
  M.pt12={v:1,runs:[]};M.best={};
  // playthrough 0 (cycle 0): everything of it is seen
  const play=()=>{const G=A.G,rec=__PT12.pt12Rec(G);G.run.order.forEach((i,s)=>{if(!rec.vis.includes(i))rec.vis.push(i);});G.run.bosses.concat([G.run.final]).forEach(k=>{if(!rec.bs.includes(k))rec.bs.push(k);const d=T('guardianDef')(k);M.best[d.n]={seen:1,kills:1,scan:0,known:{}};});};
  A.TW.get('newGame')(['mira','lumen','oren'],0,[]);play();
  const STD=T('REALM_STD'),GP=T('GPOOL'),FP=T('FPOOL');
  for(let k=1;k<=10;k++){
    const seenR=new Set(),seenB=new Set();M.pt12.runs.forEach(r=>{r.vis.forEach(i=>seenR.add(i));r.bs.forEach(b=>seenB.add(b));});
    const unR=STD.filter(i=>!seenR.has(i)).length,unG=GP.filter(b=>!seenB.has(b)).length,unF=FP.filter(b=>!seenB.has(b)).length;
    T('newGame')(['mira','lumen','oren'],k,[]);
    const G=A.G,run=G.run,std=run.order.slice(0,4),cal=run.order[4],bs=run.bosses.concat([run.final]);
    o.rows.push({k,realms:run.order.map(names),bosses:run.bosses.map(b=>T('guardianDef')(b).n),final:T('guardianDef')(run.final).n,
      newStd:std.filter(i=>!seenR.has(i)).length,newCal:seenR.has(cal)?0:1,newBoss:run.bosses.filter(b=>!seenB.has(b)).length,newFinal:seenB.has(run.final)?0:1,
      expStd:Math.min(4,unR),expBoss:Math.min(4,unG),expFinal:Math.min(1,unF),distinct:new Set(run.order).size===5&&new Set(run.bosses).size===4,
      quests:G.quests.some(q=>q.stage===0),coupled:__PT12.pt12Select({runs:[],seenBoss:()=>false},()=>.5).coupled});
    play();
  }
  o.runs=M.pt12.runs.length;return o;});
const pad=(s,n)=>String(s).padEnd(n).slice(0,n);
console.log('\nNG+ sim, 10 starts on one account (realm 1-4 / Calamity realm | Scourges | Calamity | new realms std+cal | new Scourges | new Calamity)');
r.rows.forEach(x=>console.log(pad('#'+x.k,4),pad(x.realms.join(' / '),104),pad(x.bosses.join(', '),84),pad(x.final,22),`std ${x.newStd}/${x.expStd} cal ${x.newCal} | scourges ${x.newBoss}/${x.expBoss} | calamity ${x.newFinal}/${x.expFinal}`));
const coupled=r.rows[0].coupled;
chk('NG+ guarantee: every start takes as many unseen standard realms as remain (4 per start), and an unseen Calamity realm while any is left',r.rows.every(x=>x.newStd===x.expStd)&&r.rows.slice(0,3).every(x=>x.newCal===1)||'[newStd,expStd,newCal] per start '+JSON.stringify(r.rows.map(x=>[x.newStd,x.expStd,x.newCal])));
chk(coupled?'bosses follow their realm (realm data names a boss per realm)':'NG+ guarantee: every start faces as many unseen Scourges (4) and an unseen Calamity as remain',coupled||(r.rows.every(x=>x.newBoss===x.expBoss&&x.newFinal===x.expFinal))||JSON.stringify(r.rows.map(x=>[x.newBoss,x.expBoss,x.newFinal,x.expFinal])));
chk('every start has five distinct realms, four distinct Scourges, and the first realm has its quests',r.rows.every(x=>x.distinct&&x.quests)||JSON.stringify(r.rows.map(x=>[x.distinct,x.quests])));
// once everything is seen: random, with a lean toward what was not in the last two playthroughs (compared with the same draw without the lean)
r=await ev(()=>{const A=__A,T=A.TW.get,GP=T('GPOOL'),FP=T('FPOOL'),STD=T('REALM_STD'),CAL=T('REALM_CAL'),o={};
  // 8 playthroughs, newest last: the last two met these eight Scourges; the older ones met the rest, so all 20 are seen
  const mk=()=>{const runs=[];for(let n=0;n<8;n++){const bs=n===7?GP.slice(0,4):n===6?GP.slice(4,8):GP.slice(8+((n*4)%12),8+((n*4)%12)+4);runs.push({s:n+1,c:n,o:[],b:[],f:FP[n%FP.length],vis:n>=6?STD.slice(0,4):STD.slice(4+(n%2)*4,8+(n%2)*4),bs:bs.concat([FP[n%FP.length]])});}
    GP.slice(12).forEach(k=>runs[0].bs.push(k));runs[0].vis=STD.slice().concat(CAL);FP.forEach(k=>runs[0].bs.push(k));return runs;};
  const run=lean=>{const P=__PT12.PT12,l0=P.lean;P.lean=lean;try{const ctx={runs:mk(),seenBoss:()=>true},cnt={},rc={};GP.forEach(k=>cnt[k]=0);STD.forEach(i=>rc[i]=0);let unseen=0;const N=3000;
    for(let i=0;i<N;i++){let a=i*7919+13;const S=__PT12.pt12Select(ctx,()=>{a=(a*1664525+1013904223)>>>0;return a/4294967296;});S.bosses.forEach(k=>cnt[k]++);S.order.slice(0,4).forEach(x=>rc[x]++);if(S.newBosses||S.newRealms)unseen++;}
    const rec=GP.slice(0,8).reduce((a,k)=>a+cnt[k],0)/8,old=GP.slice(8).reduce((a,k)=>a+cnt[k],0)/12,rr=STD.slice(0,4).reduce((a,i)=>a+rc[i],0)/4,ro=STD.slice(4).reduce((a,i)=>a+rc[i],0)/8;
    return {rec,old,ratio:old/rec,rRatio:ro/rr,unseen,recMin:Math.min(...GP.slice(0,8).map(k=>cnt[k])),coupled:__PT12.pt12Select(ctx,()=>.5).coupled};}finally{P.lean=l0;}};
  o.flat=run(0);o.lean=run(__PT12.PT12.lean);o.gain=o.lean.ratio/o.flat.ratio;o.rGain=o.lean.rRatio/o.flat.rRatio;return o;});
console.log('\nlean test (2000 draws, everything seen): bosses old/recent no lean',r.flat.ratio.toFixed(2),'lean',r.lean.ratio.toFixed(2),'gain x'+r.gain.toFixed(2),'| realms gain x'+r.rGain.toFixed(2),'| coupled',r.lean.coupled);
chk('everything seen: nothing is flagged unseen, and the draw leans toward bosses not in the last two playthroughs (recent ones still appear)',r.lean.unseen===0&&r.gain>1.1&&r.gain<2&&r.lean.recMin>0||JSON.stringify(r));
chk('the same lean applies to realms (weaker)',r.rGain>1.02&&r.rGain<2||JSON.stringify(r));
await done(H);})();
