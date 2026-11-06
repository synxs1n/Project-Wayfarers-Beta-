// Beta v0.7.0 battle mechanics (battle4.js), part 1: the rules. Detonation refund (once per detonation, at most B4.det.maxPerAct per
// action, shown in the reaction text), free swap (no turn used, the cooldown, Rooted), Momentum (rises on repeats, moves toward the zone
// on varied moves, Guard cools, overheat, the damage bonus and penalty), every foe role (Shieldbearer, Hexer, Charger, Leech, Skirmisher,
// the boss Cataclysm), the role line on Scan and in the Bestiary, the plan (b4RolePlan) matching what the foe then does, and that the
// plan does not touch the RNG. Usage: PWHTML=../../out/aurelis3.html node v070m1.js
const {open,chk,done}=require('./pw');
const PRE=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',music:0,sfx:0,gfx:'low',hints:false}}));`;
// a fresh journey with six heroes (three in the Rearguard) at opt.lv against opt.foes (MON keys, or a boss key with opt.boss); the
// fight is paused (nothing advances on its own) and the first front hero has the command
const SETUP=`window.__setup=function(o){const A=__A;A.ACT.new();['oren','mira','lumen'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;const G=A.G;
  ['brann','sable','gilda'].forEach(id=>{if(A.TPL[id]&&!G.party.includes(id))A.recruit(id,true);});
  G.party.forEach(id=>{const c=G.roster[id];c.lv=o.lv||20;A.refresh(c);c.hp=c.S.mhp;c.mp=c.S.mmp;});
  const foes=o.foes.map(k=>o.boss?A.makeEnemy(A.guardianDef(k),o.flv||20,{boss:true,key:k,stage:1}):A.makeEnemy(A.MON[k],o.flv||18));
  if(o.boss){G.run.bosses[1]=o.foes[0];G.stage=1;}
  A.setPause(999999);A.startBattle({stage:1,kind:o.boss?'boss':'field',weather:'clear',foes});const B=A.B;
  B.en.forEach(e=>{if(o.tough){e.S.mhp=e.hp=99999;}});A.B4.rng(()=>.5);
  B.cur=B.front[0];B.mode='cmd';B.menu='root';B.pturns=10;A.render();return B;};`;
(async()=>{
const H=await open({w:390,h:844,mobile:true,pre:PRE});const {ev,wait}=H;await ev(SETUP);
// ---------- 1) detonation refund ----------
const d=await ev(()=>{const A=__A,B=window.__setup({foes:['mossling','mossling','mossling'],tough:1}),a=B.cur,R=Object.values(A.REACT).find(r=>r.d==='fire');
  const det={id:'tdet',n:'Test Spark',k:'mag',pw:1,t:'one',el:'fire',role:'det',mp:5,cost:1,hits:1},all=Object.assign({},det,{id:'tdet2',t:'all'});
  a.mp=Math.max(0,a.S.mmp-60);const g=A.B4.detGain(a),o={g,p:R.p,n:R.n};
  B.en.forEach(e=>{e.primed={el:R.p,t:2,by:'x'};});
  let m0=a.mp;A.B4.exec(det,[B.en[0]]);o.one=a.mp-m0;o.fx=(B.en[0].fx||[]).filter(f=>f.cls==='react').map(f=>f.txt);o.cnt=B.b4det;
  B.cur=a;B.mode='cmd';m0=a.mp;A.B4.exec(det,[B.en[0]]);o.none=a.mp-m0;o.cnt2=B.b4det;// no prime left: no refund
  B.en.forEach(e=>{e.primed={el:R.p,t:2,by:'x'};});B.cur=a;B.mode='cmd';m0=a.mp;A.B4.exec(all,B.en.slice());o.all=a.mp-m0;o.cnt3=B.b4det;o.max=A.B4.cfg.det.maxPerAct;
  // the refund never goes past max MP
  B.en.forEach(e=>{e.primed={el:R.p,t:2,by:'x'};});a.mp=a.S.mmp;B.cur=a;B.mode='cmd';A.B4.exec(det,[B.en[0]]);o.cap=a.mp<=a.S.mmp;
  return o;});
chk(`detonation: one reaction refunds ${d.g} MP once (MP change ${d.one} = -5 + ${d.g})`,d.one===d.g-5&&d.cnt===1||JSON.stringify(d));
chk(`detonation: the reaction text shows it: ${JSON.stringify(d.fx)}`,d.fx.some(t=>t===d.n+' +'+d.g+' MP')||JSON.stringify(d.fx));
chk('detonation: no reaction, no refund',d.none===-5&&d.cnt2===1||JSON.stringify(d));
chk(`detonation: an all-foes detonator on 3 primed foes refunds at most ${d.max} times (MP change ${d.all})`,d.all===d.g*d.max-5&&d.cnt3===1+d.max||JSON.stringify(d));
chk('detonation: the refund stops at max MP',d.cap===true);
// ---------- 2) free swap ----------
const s=await ev(()=>{const A=__A,B=window.__setup({foes:['mossling'],tough:1}),o={};const cur=B.cur,out=B.front[1],inn=B.back[0],t0=B.time,n0=cur.next;
  o.ready=A.B4.freeReady();o.ok=A.B4.freeSwap(1,0);o.cur=B.cur===cur;o.mode=B.mode;o.front=B.front[1]===inn&&B.back[0]===out;o.time=B.time===t0&&cur.next===n0;o.left=A.B4.freeLeft();
  o.again=A.B4.freeSwap(2,1);// on cooldown
  B.pturns+=A.B4.cfg.swap.cd;o.ready2=A.B4.freeReady();
  B.front[2].st.root={t:3};o.rooted=A.B4.freeSwap(2,1);delete B.front[2].st.root;
  o.self=A.B4.freeSwap(0,1);// the acting hero cannot use the free swap on itself (that is the old Switch)
  // the menu: Switch opens on a rooted acting hero when a free swap is ready, and the menu offers who steps back
  cur.st.root={t:3};A.render();o.swBtn=!document.querySelector('#bcmd [data-arg="swap"]').disabled;A.ACT.cmd('swap');o.menu=B.menu;
  o.rows=[...document.querySelectorAll('#bcmd .b4o')].map(b=>(b.disabled?'x:':'')+b.textContent);A.ACT.b4out(2);const f2=B.front[2];A.ACT.sw(1);o.viaMenu=B.front[2]!==f2&&B.cur===cur&&B.mode==='cmd';
  delete cur.st.root;return o;});
chk('free swap: ready at the start',s.ready===true);
chk('free swap: another front hero trades places with a Rearguard hero',s.ok===true&&s.front===true||JSON.stringify(s));
chk('free swap: costs no turn (same hero still acts, same clock, still choosing a command)',s.cur&&s.time&&s.mode==='cmd'||JSON.stringify(s));
chk(`free swap: then on cooldown (${s.left} party turns) and refused`,s.left===3&&s.again===false||JSON.stringify(s));
chk('free swap: ready again after the cooldown',s.ready2===true);
chk('free swap: a Rooted hero cannot step back',s.rooted===false);
chk('free swap: not for the acting hero itself',s.self===false);
chk(`free swap: a rooted acting hero can open Switch and swap someone else through the menu (${s.rows.join(' | ')})`,s.swBtn&&s.menu==='swap'&&s.rows[0].startsWith('x:')&&s.viaMenu||JSON.stringify(s));
// ---------- 3) momentum (v0.9.4 rule: different moves fill, repeats or only attacking drain; full Surge, empty Drained) ----------
const m=await ev(()=>{const A=__A,B=window.__setup({foes:['mossling'],tough:1}),M=A.B4.cfg.mo,o={start:A.B4.mo().m};
  const act=f=>{B.cur=B.front[0];B.mode='cmd';f();return A.B4.mo().m;};const atk=()=>A.B4.exec(A.ATTACK||{id:'attack',n:'Attack',k:'phys',pw:1,mp:0,t:'one',cost:1,hits:1,el:null},[B.en[0]]);
  const fire={id:'tf',n:'Test Fire',k:'mag',pw:1,t:'one',el:'fire',mp:0,cost:1,hits:1},ice=Object.assign({},fire,{id:'ti',el:'ice'});
  o.a1=act(atk);o.a2=act(atk);                                     // first move fills, the same move again drains
  o.v1=act(()=>A.B4.exec(fire,[B.en[0]]));o.v2=act(()=>A.B4.exec(ice,[B.en[0]]));o.v3=act(atk);o.v4=act(()=>A.B4.exec(fire,[B.en[0]])); // offense run: 2 (fire after atk... ) 
  o.g1=act(()=>A.B4.guard());o.sg=A.B4.moState();                  // a non offensive move fills and resets the offense run
  // fill to full with varied moves
  const S=A.B4.mo();S.m=M.max-M.vary;S.last='guard';S.offRun=0;o.f1=act(atk);o.sf=A.B4.moState();
  S.m=M.rep;S.last='atk';S.full=0;S.empty=0;o.e1=act(atk);o.se=A.B4.moState();
  // damage: Surge bonus and Drained penalty, hero to foe and foe to hero
  const h=B.front[0],e=B.en[0],dm=(x,y)=>A.B4.calc(x,{id:'attack',k:'phys',pw:1,t:'one'},y).dmg;
  S.m=50;S.full=0;S.empty=0;const c0=dm(h,e),t0=dm(e,h);S.full=1;const c1=dm(h,e),t1=dm(e,h);S.full=0;S.empty=1;const c2=dm(h,e),t2=dm(e,h);S.empty=0;
  o.dmg=[c0,c1,c2,t0,t1,t2];A.render();o.gauge=document.getElementById('b4mo')?document.getElementById('b4mo').className:'';o.offRun=S.offRun;return o;});
const M=await ev(()=>__A.B4.cfg.mo);
chk(`momentum: starts at ${M.start}`,m.start===M.start);
chk(`momentum: a different move fills it by ${M.vary} (${m.start} -> ${m.a1}), the same move again drains ${M.rep} (${m.a2})`,m.a1===m.start+M.vary&&m.a2===m.a1-M.rep||JSON.stringify(m));
// the two opening attacks count: the fire spell is the 3rd offensive move in a row (fills), then every further attack drains
chk(`momentum: varied attacks fill up to ${M.offN} offensive moves in a row, then attacking drains ${M.off} (${m.a2} -> ${m.v1}, ${m.v2}, ${m.v3}, ${m.v4})`,m.v1===m.a2+M.vary&&m.v2===m.v1-M.off&&m.v3===m.v2-M.off&&m.v4===m.v3-M.off||JSON.stringify(m));
chk(`momentum: a non offensive move fills it and resets the run (${m.v4} -> ${m.g1})`,m.g1===m.v4+M.vary||JSON.stringify(m));
chk(`momentum: full gives the Surge (${m.f1}: ${m.sf}), empty gives Drained (${m.e1}: ${m.se})`,m.f1===M.max&&m.sf==='full'&&m.e1===0&&m.se==='empty'||JSON.stringify(m));
const [c0,c1,c2,t0,t1,t2]=m.dmg,near=(a,b)=>Math.abs(a-b)<=Math.max(1,b*.02);
chk(`momentum: Surge heroes deal +${M.dmg*100}% (${c0} -> ${c1}) and take -${M.taken*100}% (${t0} -> ${t1})`,near(c1,c0*(1+M.dmg))&&near(t1,t0*(1-M.taken))||JSON.stringify(m.dmg));
chk(`momentum: Drained heroes deal -${M.pen*100}% (${c2}) and take +${M.pen*100}% (${t2})`,near(c2,c0*(1-M.pen))&&near(t2,t0*(1+M.pen))||JSON.stringify(m.dmg));
chk('momentum: the gauge is on the screen',/b4mo/.test(m.gauge)||m.gauge);
// ---------- 4) roles ----------
const r=await ev(()=>{const A=__A,o={};const turn=e=>{A.B4.foeTurn(e);};
  // Shieldbearer: covers its allies until its shield breaks
  let B=window.__setup({foes:['shellguard','mossling'],tough:1});const sb=B.en[0],ally=B.en[1],h=B.front[0],atk={id:'attack',k:'phys',pw:1,t:'one'};
  o.sbRole=sb.role;o.sbPips=sb.maxShield;const cov=A.B4.calc(h,atk,ally).dmg;sb.broken=2;sb.shield=0;const open=A.B4.calc(h,atk,ally).dmg;o.cover=[cov,open];
  // Hexer: a Hex every other turn, stacking; at the cap the next one bursts
  B=window.__setup({foes:['ashwraith'],tough:1});const hx=B.en[0];o.hxRole=hx.role;
  const p1=A.B4.plan(hx);turn(hx);const t1=p1&&p1.tg[0];o.hex1=t1?A.B4.hex(t1):-1;o.hexPlan=p1&&p1.kind;
  const p2=A.B4.plan(hx);turn(hx);o.hexOff=p2===null;
  const p3=A.B4.plan(hx);turn(hx);o.hex2=A.B4.hex(p3.tg[0]);o.sameT=p3.tg[0]===t1;
  t1.st.hex={t:99,v:3};hx.turns=4;const p5=A.B4.plan(hx),hp0=t1.hp;turn(hx);o.doomPlan=p5&&p5.kind;o.doom=hp0-t1.hp;o.doomExp=Math.round(t1.S.mhp*A.B4.cfg.roles.doom);o.hexGone=A.B4.hex(t1);
  t1.st.hex={t:99,v:2};A.cleanse(t1);o.cleansed=A.B4.hex(t1);
  // the Hex weakens the hero's damage
  t1.st.hex={t:99,v:2};const hd=A.B4.calc(t1,atk,hx).dmg;delete t1.st.hex;const hn=A.B4.calc(t1,atk,hx).dmg;o.hexDmg=[hd,hn];
  // Charger: winds up on its 3rd turn, then hits that hero; Guard halves it
  B=window.__setup({foes:['yeti'],tough:1});const cg=B.en[0];o.cgRole=cg.role;cg.turns=2;const pc=A.B4.plan(cg);turn(cg);o.wind=!!(cg.st&&cg.st.charge);o.windPlan=pc&&pc.kind;
  const tgt=pc.tg[0],pu=A.B4.plan(cg);o.unPlan=pu&&pu.kind;o.unSame=pu&&pu.tg[0]===tgt;const hpa=tgt.hp;turn(cg);o.hitFull=hpa-tgt.hp;o.windGone=!(cg.st&&cg.st.charge);
  tgt.hp=tgt.S.mhp-1;cg.turns=2;turn(cg);o.sameAgain=B.front[cg.b4slot]===tgt;tgt.guard=true;const hpb=tgt.hp;turn(cg);o.hitGuard=hpb-tgt.hp;
  // Leech: every other turn drains every front hero who is not guarding and heals
  B=window.__setup({foes:['brinejelly'],tough:1});const lc=B.en[0];o.lcRole=lc.role;lc.turns=1;lc.hp=Math.round(lc.S.mhp/2);B.front[1].guard=true;
  const pl=A.B4.plan(lc),hps=B.front.map(c=>c.hp),lh=lc.hp;turn(lc);o.siphon=pl&&pl.kind;o.drained=B.front.map((c,i)=>hps[i]-c.hp);o.healed=lc.hp-lh;
  // Skirmisher: the same three heroes in front for flankAt actions; a swap resets the count
  B=window.__setup({foes:['frostwolf'],tough:1});const fw=B.en[0];o.fwRole=fw.role;o.flank0=A.B4.plan(fw);
  for(let i=0;i<A.B4.cfg.roles.flankAt;i++){B.cur=B.front[0];B.mode='cmd';A.B4.guard();}o.lineN=B.b4lineN;const pf=A.B4.plan(fw);o.flank=pf&&pf.kind;
  const ft=pf&&pf.tg[0],fh=ft&&ft.hp;turn(fw);o.flankHit=ft?fh-ft.hp:0;
  B.cur=B.front[0];B.mode='cmd';A.B4.freeSwap(1,0);A.B4.guard();o.lineAfter=B.b4lineN;o.flankAfter=A.B4.plan(fw);
  // boss: gathers power every 4th turn, then a Cataclysm on the whole front line
  B=window.__setup({foes:['thornwarden'],boss:1,flv:16,tough:1});const bs=B.en[0];bs.turns=3;const pg=A.B4.plan(bs);turn(bs);o.gather=pg&&pg.kind;o.gathered=!!(bs.st&&bs.st.charge);
  const pk=A.B4.plan(bs),vf=B.front.slice(),bh=vf.map(c=>c.hp);turn(bs);o.cata=pk&&pk.kind;o.cataHit=vf.map((c,i)=>bh[i]-c.hp);
  // the plan never touches the RNG (the intents can read it any time)
  B=window.__setup({foes:['ashwraith','yeti','brinejelly','frostwolf'],tough:1});let n=0;A.B4.rng(()=>{n++;return .5;});B.en.forEach(e=>{for(let i=0;i<5;i++)A.B4.plan(e);});o.rngCalls=n;A.B4.rng(()=>.5);
  return o;});
chk(`Shieldbearer (Shellguard, ${r.sbPips} pips): its ally takes ${r.cover[0]} while the shield holds, ${r.cover[1]} once it breaks`,r.sbRole==='guard'&&r.sbPips>0&&Math.abs(r.cover[0]-r.cover[1]*0.6)<=Math.max(1,r.cover[1]*.03)||JSON.stringify(r.cover));
chk(`Hexer (Ash Wraith): plans a Hex, lays stack 1, skips a turn, then stack 2 on the same hero`,r.hxRole==='hex'&&r.hexPlan==='hex'&&r.hex1===1&&r.hexOff&&r.hex2===2&&r.sameT||JSON.stringify(r));
chk(`Hexer: at 3 stacks the next one bursts for ${r.doom} (30% of max HP: ${r.doomExp}) and clears`,r.doomPlan==='doom'&&Math.abs(r.doom-r.doomExp)<=1&&r.hexGone===0||JSON.stringify(r));
chk('Hexer: a cleanse removes the Hex',r.cleansed===0);
chk(`Hexer: Hex 2 lowers the hero's damage (${r.hexDmg[0]} vs ${r.hexDmg[1]})`,r.hexDmg[0]<r.hexDmg[1]);
chk(`Charger (Frostling Yeti): winds up (${r.windPlan}), then a Crushing Charge on the same hero (${r.hitFull} damage)`,r.cgRole==='charge'&&r.wind&&r.windPlan==='windup'&&r.unPlan==='unleash'&&r.unSame&&r.hitFull>0&&r.windGone||JSON.stringify(r));
chk(`Charger: Guard halves it (${r.hitGuard} vs ${r.hitFull})`,r.sameAgain&&Math.abs(r.hitGuard-r.hitFull/2)<=Math.max(2,r.hitFull*.04)||JSON.stringify([r.hitGuard,r.hitFull]));
chk(`Leech (Brine Jelly): Siphon drains the front heroes who do not guard (${r.drained.join('/')}) and heals ${r.healed}`,r.lcRole==='leech'&&r.siphon==='siphon'&&r.drained[0]>0&&r.drained[1]===0&&r.drained[2]>0&&r.healed>0||JSON.stringify(r));
chk(`Skirmisher (Frost Wolf): nothing at first, a Flanking Strike once the same three stood in front for ${r.lineN} actions (${r.flankHit} damage)`,r.fwRole==='flank'&&r.flank0===null&&r.flank==='flank'&&r.flankHit>0||JSON.stringify(r));
chk(`Skirmisher: a swap resets the count (${r.lineAfter}) and the threat`,r.lineAfter===1&&r.flankAfter===null||JSON.stringify(r));
chk(`boss: gathers power on its 4th turn, then a Cataclysm hits the whole Vanguard (${r.cataHit.join('/')})`,r.gather==='gather'&&r.gathered&&r.cata==='cataclysm'&&r.cataHit.every(x=>x>0)||JSON.stringify(r));
chk('the plan does not touch the RNG',r.rngCalls===0||r.rngCalls);
// ---------- Scan and the Bestiary ----------
const q=await ev(async()=>{const A=__A,o={};const B=window.__setup({foes:['shellguard','ashwraith','yeti','brinejelly','frostwolf']});A.setPause(999999);
  o.scan=[];for(let i=0;i<B.en.length;i++){B.cur=B.front[0];B.mode='cmd';A.ACT.cmd('scan');A.ACT.tgtE(i);o.scan.push(B.log.filter(l=>/^Role: /.test(l)).pop()||'');B.log.length=0;}
  o.lines=B.en.map(e=>A.B4.roleLine(e));A.V.modal=null;
  o.best={};for(const k of ['shellguard','ashwraith','yeti','brinejelly','frostwolf','mossling','thornwarden']){A.ACT.beast(k);await new Promise(r=>setTimeout(r,30));const m=document.getElementById('modal');o.best[k]=(m.querySelector('.b4role')||{}).textContent||'';}
  A.V.modal=null;A.render();o.roles=Object.keys(A.MON).filter(k=>A.MON[k].role).map(k=>k+':'+A.MON[k].role);return o;});
const names=['Shieldbearer','Hexer','Charger','Leech','Skirmisher'];
names.forEach((n,i)=>chk(`Scan names the ${n}: "${q.scan[i]}"`,q.scan[i].startsWith('Role: '+n)||q.scan[i]));
['shellguard','ashwraith','yeti','brinejelly','frostwolf'].forEach((k,i)=>chk(`Bestiary ${k}: "${q.best[k]}"`,q.best[k].startsWith(names[i])||q.best[k]));
chk('Bestiary: no role line for a foe without one (Mossling)',q.best.mossling==='');
chk(`Bestiary: a Scourge names its Cataclysm: "${q.best.thornwarden}"`,/gathers power/.test(q.best.thornwarden)||q.best.thornwarden);
console.log('roles:',q.roles.join(' '));
await done(H);})();
