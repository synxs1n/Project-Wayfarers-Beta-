// Beta v0.5.0 Phase 3, part B: 3.4 Best Party awareness, 3.5 team check, 3.6 boss readiness, 3.7 Holy Water repeat, 3.9 Pork Chop Sandwiches.
const {open,chk,done}=require('./pw');
(async()=>{const h=await open();const {ev,wait,page}=h;
await ev(()=>{__A.ACT.new();['mira','lumen','oren'].forEach(id=>__A.ACT.pickS(id));__A.ACT.begin();__A.ACT.storyOk();__A.V.modal=null;__A.render();});await wait(400);
const town=await ev(()=>({screen:__A.V.screen,kind:__A.WS.m&&__A.WS.m.kind}));
chk('starts in town',town.kind==='town'||JSON.stringify(town));

// ---- 3.4: Best Party reads the Bestiary and the boss, and explains each pick ----
const bp=await ev(()=>{const A=__A,G=A.G;['tess','brann','sable','kael'].forEach(id=>{if(!G.roster[id])A.recruit(id,true);});
  Object.values(G.roster).forEach(c=>{c.lv=12;c.S=A.calcStats(c);c.hp=c.S.mhp;});G.party=['mira','lumen','oren'];
  // realm 1's monsters are known in the Bestiary (whatever realm this journey drew)
  const pool=A.ZS(0).pool;pool.forEach(k=>{const n=A.MON[k].n;A.META.best[n]=Object.assign(A.META.best[n]||{kills:0,scan:0,known:{}},{seen:1});});
  const T=__P3.p3Threats(0);const P=__P3.bestParty();
  A.ACT.bpOpen();A.render();const txt=document.querySelector('#modal').innerText;
  return {pool,mons:T.mons,arch:T.arch,boss:!!T.boss,ids:P.ids,why:P.why,info:P.info,txt};});
console.log('bp',JSON.stringify({pool:bp.pool,arch:bp.arch,ids:bp.ids,why:bp.why,info:bp.info}));
chk('3.4 threats come from the Bestiary (known monsters) and the boss',bp.mons.length===bp.pool.length&&bp.boss&&Object.keys(bp.arch).length>0||JSON.stringify(bp));
chk('3.4 a reason names an answer to what is known here ("X: ranged answer to the flyers here")',/\w+: [a-z ]+ answer to (the [a-z ]+ here|the (Scourge|Calamity)|[A-Z][a-z]+ \()/i.test(bp.txt)||bp.txt.slice(0,900));
chk('3.4 the threat summary is shown',/Known in /.test(bp.txt)||bp.txt.slice(0,400));
chk('3.4 every pick has a reason line',bp.ids.every(id=>(bp.why[id]||[]).length>0)||JSON.stringify(bp.why));
chk('3.4 Detonators are counted (old bug: role "det" was never matched, always 0)',bp.info.de>0||JSON.stringify(bp.info));
const fl=await ev(()=>{const A=__A,G=A.G;const kit=id=>__P3.withCache(()=>__P3.p3Kit(G.roster[id]));return {tess:[...kit('tess').dl],mira:[...kit('mira').dl]};});
console.log('kits',JSON.stringify(fl));
chk('3.4 the archer brings ranged delivery',fl.tess.includes('ranged')||JSON.stringify(fl));
const leg=await ev(()=>{const A=__A,G=A.G;const c=G.roster.mira;const old=c.eq.w;G.gear.push('w_bow_0');c.eq.w='w_bow_0';// an illegal weapon for a Mage
  const k=__P3.withCache(()=>__P3.p3Kit(c));c.eq.w=old;return {ranged:k.dl.has('ranged')};});
chk('3.4 delivery coverage only counts weapons the hero may legally hold',leg.ranged===false||JSON.stringify(leg));
const ap=await ev(()=>{const A=__A;A.ACT.bpApply();A.render();const b=document.querySelector('#modal [data-act="autoEqParty"]');const ok=!!b;const party=A.G.party.slice();if(b)b.click();return {ok,party,modal:A.V.modal&&A.V.modal.type};});
chk('3.4 after Apply: "Equip best gear for this party" runs auto equip',ap.ok&&ap.modal==='autoEq'||JSON.stringify(ap));

// ---- 3.5: team check on the Party tab, with a one tap swap ----
const gp=await ev(()=>{const A=__A,G=A.G;const all=Object.keys(G.roster);let best=null;
  // find a six that misses something a benched hero can fill
  for(let i=0;i<all.length&&!best;i++){const six=all.filter((_,j)=>j!==i).slice(0,6);const g=__P3.p3Gaps(six).filter(x=>x.swap);if(g.length)best={six,g};}
  if(!best)return {none:true};G.party=best.six;A.V.modal={type:'menu',tab:'party'};A.render();
  const d=document.querySelector('#modal .p3gaps');const txt=d?d.textContent:'';const b=document.querySelector('#modal [data-act="p3Swap"]');
  return {txt,gaps:best.g.map(x=>x.label),btn:b?b.dataset.arg:null,btxt:b?b.textContent:null,dis:b?b.disabled:null};});
console.log('gaps',JSON.stringify(gp));
chk('3.5 the Party tab names what is missing',!!gp.txt&&gp.gaps.every(l=>gp.txt.includes(l.replace(/<[^>]*>/g,'')))||JSON.stringify(gp));
chk('3.5 it names roster heroes who could fill it, with a one tap swap',!!gp.btn&&/Could fill/.test(gp.txt)&&/^(Swap .+ in for .+|Add .+)$/.test(gp.btxt)&&gp.dis===false||JSON.stringify(gp));
const sw=await ev((arg)=>{const A=__A,G=A.G;A.ACT.p3Swap(arg);return {party:G.party.slice(),in:arg.split(',')[0],out:arg.split(',')[1]};},gp.btn||',');
chk('3.5 one tap swap puts the filler in the six',sw.party.includes(sw.in)&&!sw.party.includes(sw.out)&&sw.party.length===6||JSON.stringify(sw));
const bpg=await ev(()=>{__A.ACT.bpOpen();__A.render();return !!document.querySelector('#modal .p3gaps');});
chk('3.5 Best Party shows the team check too',bpg);

// ---- 3.6: readiness on the boss prompt, never blocking, no spoilers ----
const rd=await ev(()=>{const A=__A,G=A.G;G.party=['mira','oren','brann'];Object.values(G.roster).forEach(c=>{c.lv=3;c.S=A.calcStats(c);});G.inv.potion=0;G.inv.plume=0;
  A.V.modal={type:'boss',s:0};A.render();const m=document.querySelector('#modal');const r=m.querySelector('.p3ready');const fight=m.querySelector('[data-act="fightBoss"]');
  const key=G.run.bosses[0],d=A.guardianDef(key);const skills=(d.sk||[]).filter(Array.isArray).map(x=>x[0]);const txt=r?r.innerText:'';
  return {has:!!r,fight:!!fight&&!fight.disabled,txt,spoil:skills.filter(n=>txt.includes(n)),phase:/turning point|pattern/i.test(txt),warn:r?r.querySelectorAll('.warnr').length:0};});
console.log('ready',rd.txt.replace(/\n/g,' | ').slice(0,700));
chk('3.6 the boss prompt shows a readiness check',rd.has||JSON.stringify(rd));
chk('3.6 it never blocks the fight',rd.fight);
chk('3.6 actionable hints (level, healer, supplies) for a weak party',rd.warn>=3&&/level/i.test(rd.txt)&&/healer|heal/i.test(rd.txt)&&/Alchemy/.test(rd.txt)||rd.txt);
chk('3.6 no spoilers: no skill names, no turning point',rd.spoil.length===0&&!rd.phase||JSON.stringify(rd.spoil));
const rd2=await ev(()=>{const A=__A,G=A.G;const key=G.run.bosses[0],d=A.guardianDef(key);A.META.best[d.n]=Object.assign(A.META.best[d.n]||{kills:0,scan:0,known:{}},{seen:1});
  A.V.modal={type:'beast',k:key};A.render();return !!document.querySelector('#modal .p3ready');});
chk('3.6 the Bestiary entry of this journey\'s boss shows it too',rd2);

// ---- 3.7: Holy Water, reapply automatically ----
const hw=await ev(()=>{const A=__A,G=A.G;A.V.modal={type:'menu',tab:'items'};A.render();const t=document.querySelector('#modal [data-act="p3HwAuto"]');const has=!!t;if(t)t.click();
  const on=!!G.hwAuto;G.inv.holywater=2;G.ward=2;A.wkwUpdate();G.ward--;A.wkwUpdate();G.ward--;A.wkwUpdate();const re1={ward:G.ward,inv:G.inv.holywater,toast:document.getElementById('toast').textContent};
  G.ward=1;A.wkwUpdate();G.ward=0;A.wkwUpdate();G.ward=0;A.wkwUpdate();G.ward=1;A.wkwUpdate();G.ward=0;A.wkwUpdate();const re2={ward:G.ward,inv:G.inv.holywater,toast:document.getElementById('toast').textContent};
  G.hwAuto=false;G.inv.holywater=3;G.ward=1;A.wkwUpdate();G.ward=0;A.wkwUpdate();const re3={ward:G.ward,inv:G.inv.holywater};A.V.modal=null;A.render();return {has,on,re1,re2,re3};});
console.log('hw',JSON.stringify(hw));
chk('3.7 Holy Water has a "Reapply automatically" toggle',hw.has&&hw.on||JSON.stringify(hw));
chk('3.7 when the ward ends, another flask is used, with a message',hw.re1.ward===150&&hw.re1.inv===1&&/another Holy Water/.test(hw.re1.toast)||JSON.stringify(hw.re1));
chk('3.7 stops with a message when none are left',hw.re2.ward===0&&hw.re2.inv===0&&/No Holy Water left/.test(hw.re2.toast)||JSON.stringify(hw.re2));
chk('3.7 off means off',hw.re3.ward===0&&hw.re3.inv===3||JSON.stringify(hw.re3));

// ---- 3.9: Pork Chop Sandwiches ----
await ev(()=>{const A=__A,G=A.G;A.setPause(30);G.inv.porkchop=0;G.party=['mira','lumen','oren'];Object.values(G.roster).forEach(c=>{c.lv=20;c.S=A.calcStats(c);c.hp=c.S.mhp;});A.startBattle({stage:0,kind:'boss'});});
await page.waitForFunction(()=>__A.B&&__A.B.mode==='cmd',{timeout:15000}).catch(()=>{});
const pk=await ev(()=>{const A=__A,G=A.G;A.B.en.forEach(e=>{e.hp=0;});A.win();const info=A.B&&A.B.result;return {inv:G.inv.porkchop,drops:info?info.drops.filter(d=>d==='porkchop').length:-1,hint:info&&info.story?/Pork Chop Sandwiches/.test(info.story.text)&&/dungeon/.test(info.story.text):false,flag:G.p3pork};});
chk('3.9 first boss victory gives 2 Pork Chop Sandwiches',pk.inv===2&&pk.drops===2||JSON.stringify(pk));
chk('3.9 with a hint that they take you out of a dungeon',pk.hint||JSON.stringify(pk));
await ev(()=>{__A.finishBattle('won');__A.V.modal=null;});await wait(200);
await ev(()=>{const A=__A,G=A.G;A.startBattle({stage:1,kind:'boss'});});
await page.waitForFunction(()=>__A.B&&__A.B.mode==='cmd',{timeout:15000}).catch(()=>{});
const pk2=await ev(()=>{const A=__A,G=A.G;A.B.en.forEach(e=>{e.hp=0;});A.win();const n=G.inv.porkchop;A.finishBattle('won');A.V.modal=null;return n;});
chk('3.9 only the first boss victory gives them',pk2===2||pk2);
await wait(200);
// in a dungeon: Use 1 (entrance) and Use 2 (last town's Inn)
await ev(()=>{const A=__A,G=A.G;G.inv.porkchop=5;G.lastTown=0;A.enterDungeon(0);});await wait(500);
const dn=await ev(()=>{const A=__A,G=A.G;A.V.modal=null;A.WS.lock=false;A.V.modal={type:'menu',tab:'items'};A.render();const b2=document.querySelector('#modal [data-act="p3Pork2"]'),b1=document.querySelector('#modal [data-act="useTravel"][data-arg="porkchop"]');
  return {kind:A.WS.m.kind,b2:!!b2&&!b2.disabled,b2t:b2&&b2.innerText,b1:b1&&b1.innerText};});
chk('3.9 in a dungeon the item menu offers "Use 2: return to town" next to the single use',dn.kind==='dungeon'&&dn.b2&&/Use 2: return to town/.test(dn.b2t)&&/Use 1/.test(dn.b1||'')||JSON.stringify(dn));
await ev(()=>{document.querySelector('#modal [data-act="p3Pork2"]').click();});await wait(700);
const tw=await ev(()=>{const A=__A,G=A.G;const [ix,iy]=A.innSpot(0);return {m:A.WS.m.id,x:A.WS.x,y:A.WS.y,ix,iy,inv:G.inv.porkchop};});
chk('3.9 Use 2 consumes 2 and lands in front of the last town\'s Inn',tw.m==='t0'&&tw.x===tw.ix&&tw.y===tw.iy&&tw.inv===3||JSON.stringify(tw));
await ev(()=>{__A.enterDungeon(0);});await wait(500);
await ev(()=>{const A=__A;A.WS.lock=false;A.V.modal=null;const d=A.getMap(A.WS.m.id);A.placeAt(A.WS.m.id,d.start[0]+0,d.start[1],'d');A.useTravel('porkchop');});await wait(700);
const one=await ev(()=>{const A=__A,G=A.G;const d=A.getMap(A.WS.m.id);return {kind:A.WS.m.kind,inv:G.inv.porkchop,at:[A.WS.x,A.WS.y],start:d.start};});
chk('3.9 the single use still returns to the dungeon entrance',one.kind==='dungeon'&&one.inv===2&&one.at[0]===one.start[0]&&one.at[1]===one.start[1]||JSON.stringify(one));
const out=await ev(()=>{const A=__A;A.V.modal=null;const f=A.getMap('f0');A.placeAt('f0',f.ent[0],f.ent[1]+1,'d');A.V.modal={type:'menu',tab:'items'};A.render();return {kind:A.WS.m.kind,b2:!!document.querySelector('#modal [data-act="p3Pork2"]')};});
chk('3.9 outside a dungeon there is no "Use 2"',out.kind!=='dungeon'&&!out.b2||JSON.stringify(out));
// in battle the old rule stays: one sandwich, a sure escape from ordinary fights
await ev(()=>{const A=__A;A.V.modal=null;A.startBattle({stage:0,kind:'field'});});
await page.waitForFunction(()=>__A.B&&__A.B.mode==='cmd',{timeout:15000}).catch(()=>{});
const bt=await ev(()=>{const A=__A,G=A.G;const n0=G.inv.porkchop;A.ACT.item('porkchop');return {n0,n1:G.inv.porkchop,over:!!(A.B&&A.B.over)};});
chk('3.9 in battle one sandwich still means a sure escape',bt.n1===bt.n0-1&&bt.over||JSON.stringify(bt));
await wait(400);
await done(h);})();
