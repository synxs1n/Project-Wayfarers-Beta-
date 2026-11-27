// The three first Legendaries reworked (v3/legends17b.js): Nikaris the Hunter, Kaevan the Sniper, Jace the Weatherwright (hero id jaeson).
// 1) kits: 14 skills each on the roster17 levels, exactly three known at level 10, two marked the hero's own; every skill used in a battle without error
// 2) Nikaris: Quiver Run (four arrows), the arrow rain (three falls), Split Arrow (chain), one trap, Hawk's Watch (a dive after every attack of his side)
// 3) Kaevan: Steady Draw (a fast action, the next shot +60%, never a miss even Blinded, spent by the shot), Stillwind Bolt, Longshot pierces,
//    Horizon Shot (one bolt, pierce, capped against a boss), still mounted
// 4) Jace: the name; Call Thunderstorm and Call Blizzard on the field (the weather chip, not indoors, not over a held sky) and in battle (for a number
//    of his turns); a storm bolt heals and feeds him (capped) and does no damage; Lightning Rod draws enemy Lightning (single and area) to him, the
//    intent names him and the Guard cue counts nothing; blizzard: stronger Ice, less damage taken; six spells on every foe, the Mantle, Sleetstep,
//    Quicken; the Limit comes in waves in the weather's element
// 5) old saves marked none, 1, 2, 3 and 4 keep every skill a legend knew (also the ones the rework dropped)
// 6) unlocking: the code table still names the three; without a code a trail posts on the board, counts field wins, puts its own fight on the field
//    and hands over to the old meeting (Nikaris, after 0.22.3: he joins the moment his beasts are beaten, legends18.js; v197a); joining unlocks the
//    hero on the account
// 7) auto battle plays a boss fight with the three to the end and uses the signature moves; no page errors
// Usage: PWHTML=<abs path to out/aurelis3.html> node v195a.js
const {open,chk,done}=require('./pw');
const PRE=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',music:0,sfx:0,gfx:'low',hints:false,tips:false,hd2d:false,timedHits:false}}));`;
const START=()=>{const A=__A;A.ACT.new();['brann','mira','oren'].forEach(i=>A.ACT.pickS(i));A.ACT.begin();try{A.ACT.storyOk();}catch(e){}A.V.modal=null;A.render();};
const PARTY=(lv,ids)=>{const A=__A,g=A.TW.get,G=A.G;['nikaris','kaevan','jaeson'].forEach(id=>{G.roster[id]=g('newChar')(id,lv,3);});G.party=ids||['jaeson','kaevan','nikaris'];
  Object.values(G.roster).forEach(c=>{c.S=g('calcStats')(c);c.hp=c.S.mhp;c.mp=c.S.mmp;});};
(async()=>{
const H=await open({w:1000,h:560,pre:PRE});const {ev,wait}=H;await ev(START);
// ---------- 1. kits ----------
{const r=await ev(()=>{try{window.__R25.R25.off=true;}catch(e){}/* 0.22.25: kits of 14; a worn personal relic adds a fifteenth skill (v209a) */const g=__A.TW.get,TPL=g('TPL'),R=__R17.R17,o={};
  ['nikaris','kaevan','jaeson'].forEach(id=>{const K=g('classSkills')(TPL[id]),L=K.map(s=>s.lv);o[id]={n:K.length,lv:L.join(),at10:L.filter(x=>x<=10).length,own:K.filter(s=>s.own).map(s=>s.n),ids:new Set(K.map(s=>s.id)).size,names:new Set(K.map(s=>s.n)).size,
    bad:K.filter(s=>!s.n||!s.d||!s.k).map(s=>s.id),ownTxt:K.filter(s=>s.own).every(s=>/Only \w+ has this skill\.$/.test(s.d)),all:K.filter(s=>(s.k==='phys'||s.k==='mag')&&s.t==='all').map(s=>s.n),K:K.map(s=>s.id)};});
  o.sched=R.lv.join();o.name=[TPL.jaeson.n,TPL.jaeson.title,g('RAW').find(x=>x[0]==='jaeson')[1]];o.text=JSON.stringify([TPL.jaeson.bio,g('SIG').jaeson.d,g('CLS').archmage.role]).includes('Jaeson');return o;});
 console.log('kits:',JSON.stringify(r));
 ['nikaris','kaevan','jaeson'].forEach(id=>{const k=r[id];
  chk(`${id}: 14 skills on ${r.sched}, three at level 10, no two alike, two of his own (${k.own.join(', ')})`,k.n===14&&k.lv===r.sched&&k.at10===3&&k.ids===14&&k.names===14&&k.bad.length===0&&k.own.length===2&&k.ownTxt||JSON.stringify(k));});
 chk(`the Archmage is "${r.name[0]}" ("${r.name[1]}"), and no text of his names Jaeson`,r.name[0]==='Jace'&&r.name[2]==='Jace'&&/^Jace Vael, the /.test(r.name[1])&&r.text===false||JSON.stringify(r.name));
 chk(`Jace has six spells on every foe (${r.jaeson.all.join(', ')}), the Mantle, Sleetstep and Quicken`,r.jaeson.all.length===6&&['mantle','l17_blink','quick','l17_storm','l17_bliz','l17_rod'].every(x=>r.jaeson.K.includes(x))||JSON.stringify(r.jaeson));
 chk('Nikaris keeps the beast calls, the heals and one trap; Kaevan keeps the charge, the Focus and Feigned Retreat',['hawk','wolf','pack','s2_nikaris','r_sap','wildmend','thorn'].every(x=>r.nikaris.K.includes(x))&&!r.nikaris.K.includes('r_tangle')&&!r.nikaris.K.includes('bramble')&&['charge','khan','s2_kaevan','tenk'].every(x=>r.kaevan.K.includes(x))||JSON.stringify([r.nikaris.K,r.kaevan.K]));
}
// every skill of the three is used in a battle (as a player action through exec, the way the commands do)
{await ev(PARTY,46);
 const r=await ev(()=>{const A=__A,g=A.TW.get,o={used:0,err:[]};
  ['nikaris','kaevan','jaeson'].forEach(id=>{A.G.party=[id,'brann','oren'];Object.values(A.G.roster).forEach(c=>{c.hp=c.S.mhp;c.mp=c.S.mmp;});
    __L17.kit(id).concat([null]).forEach(s0=>{A.startBattle({stage:2,kind:'field',seed:3});const B=A.B,u=B.front.find(x=>x.id===id);B.cur=u;B.mode='cmd';B.auto=false;u.mp=u.S.mmp;
      const s=s0||__L17.limit(u),foes=B.en.filter(e=>e.hp>0),tg=s.t==='all'||s.t==='rand'?foes:s.t==='self'?[u]:s.t==='ally'?[B.front[1]]:s.t==='allyAll'?B.front.slice():[foes[0]];
      try{g('exec')(s,tg);o.used++;}catch(e){o.err.push(id+' '+s.id+': '+e.message);}});});
  A.finishBattle('x');A.G.party=['jaeson','kaevan','nikaris'];return o;});
 chk(`all 42 skills and the three Limits are used in a battle without an error (${r.used})`,r.used===45&&r.err.length===0||r.err.join(' | '));
}
// ---------- 2 to 4. the signature mechanics ----------
{const r=await ev(()=>{const A=__A,g=A.TW.get,o={};Object.values(A.G.roster).forEach(c=>{c.hp=c.S.mhp;c.mp=c.S.mmp;});
  const fresh=(kind)=>{A.startBattle({stage:2,kind:kind||'boss',seed:5});const B=A.B;B.auto=false;B.mode='cmd';B.en.forEach(e=>{e.S.mhp*=50;e.hp=e.S.mhp;e.S.eva=0;});return B;};
  const U=id=>A.B.front.find(u=>u.id===id),sk=(u,id)=>__L17.known(u).find(s=>s.id===id),flat=fn=>{const r0=__L17.RNG;__L17.RNG=()=>.5;try{return fn();}finally{__L17.RNG=r0;}};
  // Nikaris
  {const B=fresh(),N=U('nikaris'),K=U('kaevan'),boss=B.en[0],q=sk(N,'l17_quiver'),rain=sk(N,'s3a'),split=sk(N,'l17_split'),traps=__L17.kit('nikaris').filter(s=>s.k==='status'&&(s.fx||[]).some(f=>f[0]==='root'));
   const one=flat(()=>__L17.calc(N,Object.assign({},q,{hits:1}),boss).dmg);const h0=boss.hp;flat(()=>__L17.perform(N,q,[boss]));o.quiver=[q.hits,one,h0-boss.hp];
   o.rain=[rain.hits,rain.t,rain.pw];o.split=[split.t,split.pw];o.traps=traps.map(s=>s.n);
   __L17.perform(N,sk(N,'l17_watch'),[N]);o.watch=!!N.st.l17watch;const d0=B.l17dives||0,hb=boss.hp;
   __L17.perform(K,sk(K,'s1b'),[boss]);o.dAlly=(B.l17dives||0)-d0;__L17.perform(N,sk(N,'s1a'),[boss]);o.dSelf=(B.l17dives||0)-d0;o.diveLog=B.log.filter(x=>/hawk dives/.test(x)).length;
   __L17.perform(N,sk(N,'r_sap'),[K]);o.dHeal=(B.l17dives||0)-d0;
   delete N.st.l17watch;__L17.perform(K,sk(K,'s1b'),[boss]);o.dOff=(B.l17dives||0)-d0;o.lim=__L17.limit(N).n;o.look=JSON.stringify(g('TPL').nikaris.look);}
  // Kaevan
  {const B=fresh(),K=U('kaevan'),boss=B.en[0],st=sk(K,'l17_steady'),tenk=sk(K,'tenk'),s1b=sk(K,'s1b');
   o.stCost=st.cost;o.steadyK=__L17.L17.kae.steady;const a=flat(()=>__L17.calc(K,s1b,boss).dmg);__L17.perform(K,st,[K]);o.steady=!!K.st.l17steady;const b=flat(()=>__L17.calc(K,s1b,boss).dmg);o.steadyX=+(b/a).toFixed(2);
   // Blinded and steadied: 80 shots, none misses; each spends the status
   let miss=0,spent=0;for(let i=0;i<80;i++){K.st.blind={t:3};K.st.l17steady={t:3};boss.fx=[];__L17.perform(K,s1b,[boss]);if(boss.fx.some(f=>f.txt==='Miss'))miss++;if(!K.st.l17steady)spent++;}o.miss=miss;o.spent=spent;o.blindKept=!!K.st.blind;
   delete K.st.blind;let m2=0;for(let i=0;i<120;i++){K.st.blind={t:3};boss.fx=[];__L17.perform(K,s1b,[boss]);if(boss.fx.some(f=>f.txt==='Miss'))m2++;}o.missBlind=m2;delete K.st.blind;
   o.tenk=[tenk.n,tenk.t,tenk.hits,!!tenk.pierce,tenk.pw];boss.S.mhp=1000;boss.hp=1000;const d=flat(()=>__L17.calc(K,tenk,boss).dmg);o.cap=[d,Math.round(1000*__L17.L17.kae.cap)];
   const add=B.en.find(e=>!e.boss);if(add){add.S.mhp=1000;add.hp=1000;add.S.def=boss.S.def;add.S.elRes={};add.el=boss.el;o.noCap=flat(()=>__L17.calc(K,tenk,add).dmg);}
   const still=sk(K,'r_hobble'),ls=sk(K,'combo'),ss=sk(K,'s3a');o.still=[still.n,JSON.stringify(still.fx)];o.long=[!!ls.pierce,ls.pw];o.storm=[ss.pw,ss.cost];o.mount=!!g('TPL').kaevan.look.mount;o.klim=__L17.limit(K).n;o.trait=g('TPL').kaevan.trait;}
  // Jace
  {const B=fresh(),J=U('jaeson'),K=U('kaevan'),N=U('nikaris'),boss=B.en[0];B.cur=J;
   o.wx0=B.weather;__L17.perform(J,sk(J,'l17_storm'),[J]);o.wx1=B.weather;o.cost=sk(J,'l17_storm').cost;
   // a bolt: no damage, a heal, a stack; five at most
   J.hp=Math.round(J.S.mhp*.4);const hp0=J.hp,m0=flat(()=>__L17.calc(J,sk(J,'s1b'),boss).dmg),t0=g('delayOf')(J,1);B.pturns=3;const R0=__L17.RNG;__L17.RNG=()=>.01;__L17.weatherEvent();__L17.RNG=R0;
   o.strike=[hp0,J.hp,J.l17fed,B.l17abs,!!J.st.l17fed];o.strikeLog=B.log.filter(x=>/drinks it in/.test(x)).length;const m1=flat(()=>__L17.calc(J,sk(J,'s1b'),boss).dmg);o.fedMag=+(m1/m0).toFixed(3);o.fedSpd=+(t0/g('delayOf')(J,1)).toFixed(3);
   for(let i=0;i<8;i++)__L17.absorb(J,'x');o.fedCap=J.l17fed;
   // bolts never land on an ally while he stands: 200 forced strikes
   {const hK=K.hp,hN=N.hp;let seq=0;const R1=__L17.RNG;__L17.RNG=()=>{seq++;return seq%3===1?.01:((seq*37)%100)/100;};for(let i=0;i<200;i++){B.cur=J;__L17.weatherEvent();}__L17.RNG=R1;o.allySafe=K.hp===hK&&N.hp===hN;o.foeHit=B.en.some(e=>e.hp<e.S.mhp);}
   // Lightning Rod
   __L17.perform(J,sk(J,'l17_rod'),[J]);o.rod=!!J.st.l17rod;J.hp=Math.round(J.S.mhp*.4);
   const zap1={id:'eZ1',n:'Spark',el:'lightning',pw:1.5,t:'one',k:'mag',mp:0,cost:1,hits:1},zapA={id:'eZA',n:'Chain Storm',el:'lightning',pw:1.5,t:'all',k:'mag',mp:0,cost:1,hits:1},fire={id:'eF',n:'Cinder',el:'fire',pw:1.5,t:'one',k:'mag',mp:0,cost:1,hits:1};
   let hK=K.hp,hJ=J.hp,ab=B.l17abs;__L17.perform(boss,zap1,[K]);o.redir1=[K.hp===hK,J.hp>hJ,B.l17abs-ab];
   hK=K.hp;const hN=N.hp;hJ=J.hp=Math.round(J.S.mhp*.4);ab=B.l17abs;__L17.perform(boss,zapA,B.front.slice());o.redirA=[K.hp===hK&&N.hp===hN,J.hp>hJ,B.l17abs-ab];
   hK=K.hp;delete K.st.ward;__L17.perform(boss,fire,[K]);o.fire=K.hp<hK||K.fx.some(f=>/Miss|Parthian|Blocked/.test(f.txt));
   boss.sk=[zap1];boss._b5p=null;const p=__L17.foePlan(boss);o.plan=[p&&p.sk&&p.sk.n,p&&p.tgt&&p.tgt.id];o.est=[__L17.est(boss,zap1,J),__L17.est(boss,zap1,K)>0];
   delete J.st.l17rod;const p2=__L17.foePlan(boss);o.planOff=p2&&p2.tgt&&p2.tgt.id;hJ=J.hp;__L17.perform(boss,zap1,[J]);o.noRod=J.hp<hJ||J.fx.some(f=>/Miss|Blocked/.test(f.txt));
   // blizzard
   __L17.perform(J,sk(J,'l17_bliz'),[J]);o.wx2=B.weather;const ice=sk(J,'hoarfield');const d1=flat(()=>__L17.calc(J,ice,boss).dmg);const bw=B.weather;B.weather='snow';const dS=flat(()=>__L17.calc(J,ice,boss).dmg);B.weather='clear';const d2=flat(()=>__L17.calc(J,ice,boss).dmg);
   const hit={id:'eH',n:'Slam',el:null,pw:1.5,t:'one',k:'phys',mp:0,cost:1,hits:1},in0=flat(()=>__L17.calc(boss,hit,J).dmg);B.weather=bw;const in1=flat(()=>__L17.calc(boss,hit,J).dmg);
   o.ice=[d1,dS,d2,+(d1/d2).toFixed(2)];o.veil=[in1,in0,+(in1/in0).toFixed(2)];o.partyFast=+(g('delayOf')(K,1)/g('delayOf')(boss,1)*(boss.S.spd+18)/(K.S.spd+18)).toFixed(3);
   // the called sky lasts his turns, then the old one is back
   let n=0;while(B.l17wx&&n<12){try{g('endTurn')(J,1);}catch(e){}n++;}o.wxTurns=n;o.wxBack=B.weather;
   // the Limit: waves in the weather's element
   const lim=()=>{const L=__L17.limit(J),before=B.l17waves||0;__L17.perform(J,L,B.en.filter(e=>e.hp>0));return [L.n,L.l17waves,JSON.stringify(L.el),(B.l17waves||0)-before];};
   B.weather='storm';o.limS=lim();B.weather='blizzard';o.limB=lim();B.weather='clear';o.limC=lim();J.lv=20;o.lim1=lim();J.lv=46;
   o.blink=JSON.stringify(sk(J,'l17_blink').fx)+sk(J,'l17_blink').t;o.quick=JSON.stringify(sk(J,'quick').fx)+sk(J,'quick').t;o.look=g('TPL').jaeson.look;}
  A.finishBattle('x');return o;});
 console.log('mechanics:',JSON.stringify(r));
 chk(`Nikaris: Quiver Run is four arrows (${r.quiver[2]} damage for ${r.quiver[1]} an arrow), the volley falls three times on every foe, Split Arrow chains, one trap (${r.traps.join()})`,
  r.quiver[0]===4&&r.quiver[2]>r.quiver[1]*3&&r.rain[0]===3&&r.rain[1]==='all'&&r.split[0]==='chain'&&r.traps.length===1&&r.traps[0]==='Snare Line'||JSON.stringify([r.quiver,r.rain,r.split,r.traps]));
 chk(`Hawk's Watch: the hawk dives after an ally's attack and after his own (${r.dAlly}, ${r.dSelf}), not after a heal, not once the watch is over; his Limit is still ${r.lim}`,r.watch&&r.dAlly===1&&r.dSelf===2&&r.dHeal===2&&r.dOff===2&&r.diveLog===2&&r.lim==='Primal Stampede'||JSON.stringify(r));
 chk(`Steady Draw: a fast action (cost ${r.stCost}), the next shot x${r.steadyX}; Blinded and steadied 80 shots miss ${r.miss} times (${r.missBlind} of 120 without it) and each spends it; Blind stays`,
  r.stCost<1&&r.steady&&Math.abs(r.steadyX-r.steadyK)<=.04/* within .04 of the factor (it was under .02): the two shots are whole damage numbers against the boss the journey drew, and their ratio came out 1.38 for a factor of 1.4 on about one run in twenty */&&r.miss===0&&r.spent===80&&r.missBlind>25&&r.blindKept||JSON.stringify(r));
 chk(`Horizon Shot is one bolt (${r.tenk.join(' ')}), capped at ${r.cap[1]} of a 1000 HP boss (${r.cap[0]}) and not against other foes (${r.noCap}); Longshot pierces, Stillwind Bolt stops (${r.still[1]}), Shadowstorm ${r.storm.join(' at cost ')}`,
  r.tenk[0]==='Horizon Shot'&&r.tenk[1]==='one'&&r.tenk[2]===1&&r.tenk[3]===true&&r.cap[0]<=r.cap[1]/* a tanky random boss can take less than the cap */&&(r.noCap==null||r.noCap>r.cap[1])&&r.long[0]===true&&/stun/.test(r.still[1])&&/slow/.test(r.still[1])&&r.storm[1]>=1.4||JSON.stringify(r));
 chk(`Kaevan is still mounted, keeps Parthian Shot and the horde Limit (${r.klim})`,r.mount&&r.trait==='parthian'&&/Tempest|Hooves/.test(r.klim)||JSON.stringify([r.mount,r.trait,r.klim]));
 chk(`Call Thunderstorm in battle: ${r.wx0} -> ${r.wx1} (a fast action), back to ${r.wxBack} after ${r.wxTurns} of his turns`,r.wx0==='clear'&&r.wx1==='storm'&&r.cost<1&&r.wx2==='blizzard'&&r.wxBack==='clear'&&r.wxTurns>=5&&r.wxTurns<=7||JSON.stringify([r.wx0,r.wx1,r.wx2,r.wxBack,r.wxTurns]));
 chk(`a storm bolt on Jace: HP ${r.strike[0]} -> ${r.strike[1]}, Stormfed ${r.strike[2]} (magic x${r.fedMag}, speed x${r.fedSpd}), capped at ${r.fedCap}; with him standing 200 bolts never hit an ally`,
  r.strike[1]>r.strike[0]&&r.strike[2]===1&&r.strike[4]&&r.strikeLog===1&&r.fedMag>1.02&&r.fedSpd>1.01&&r.fedCap===5&&r.allySafe&&r.foeHit||JSON.stringify(r));
 chk(`Lightning Rod: an enemy bolt aimed at Kaevan and an area bolt both go to Jace and heal him, the others untouched; a fire spell is not moved; the intent names ${r.plan[1]} and the Guard cue counts ${r.est[0]}; without the Rod he is hit again`,
  r.rod&&r.redir1[0]&&r.redir1[1]&&r.redir1[2]===1&&r.redirA[0]&&r.redirA[1]&&r.redirA[2]===1&&r.fire&&r.plan[1]==='jaeson'&&r.est[0]===0&&r.est[1]&&r.planOff!=='jaeson'||JSON.stringify(r));
 chk(`blizzard: his Ice x${r.ice[3]} of clear weather (snow counts too), he takes x${r.veil[2]} of a blow, the party is not slowed (x${r.partyFast})`,r.ice[3]>1.35&&r.ice[1]>r.ice[2]&&r.veil[2]<.85&&r.veil[2]>.7&&r.partyFast<=1.001||JSON.stringify([r.ice,r.veil,r.partyFast]));
 chk(`the Limit in waves: storm ${r.limS.join(' ')}, blizzard ${r.limB.join(' ')}, clear ${r.limC.join(' ')}; Limit I ${r.lim1.join(' ')}`,
  r.limS[0]==='Absolute Tempest'&&r.limS[1]===4&&r.limS[3]===4&&r.limS[2]==='"lightning"'&&r.limB[2]==='"ice"'&&/ice.*lightning/.test(r.limC[2])&&r.lim1[0]==='Hailfall'&&r.lim1[1]===3&&r.lim1[3]===3||JSON.stringify([r.limS,r.limB,r.limC,r.lim1]));
 chk('Sleetstep is a ward and Haste on himself, Quicken still Hastes an ally; his look has no dark glasses, blue hair and eyes',/ward/.test(r.blink)&&/self$/.test(r.blink)&&/haste/.test(r.quick)&&/ally$/.test(r.quick)&&!r.look.glasses&&!(r.look.face||[]).includes('mask')&&/^#2f6f/.test(r.look.pal.H)&&/^#2f9a/.test(r.look.eyes)||JSON.stringify([r.blink,r.quick,r.look]));
}
// ---------- 4b. the weather on the field ----------
{const r=await ev(()=>{const A=__A,g=A.TW.get,G=A.G,o={},m=g('WS').m,J=G.roster.jaeson;G.party=['jaeson','brann','oren'];J.hp=J.S.mhp;J.mp=J.S.mmp;A.V.screen='world';
  const chip=()=>{g('wkwUpdate')();const w=document.getElementById('wkw');return w?w.textContent.replace(/\s+/g,' ').trim():'';};
  o.kind=m.kind;G.weather[m.s]='clear';delete G.l17wx;o.c0=chip();o.list=g('fsSkills')(J).filter(s=>s.k==='field').map(s=>s.n);
  const mp0=J.mp;g('fsCast')('jaeson','l17f_storm');o.msg=document.getElementById('toast').textContent+' hp '+J.hp+' mp '+J.mp+'/'+J.S.mmp;o.w1=G.weather[m.s];o.c1=chip();o.mp=mp0-J.mp;o.steps=G.wx[m.s];
  g('fsCast')('jaeson','l17f_storm');o.again=mp0-J.mp;g('fsCast')('jaeson','l17f_bliz');o.w2=G.weather[m.s];o.c2=chip();
  // a held sky and indoors
  G.wxSave=G.wxSave||{};G.wxSave[m.s]='clear';o.held=__L17.fldBlock('storm');delete G.wxSave[m.s];
  const ind=g('mapIndoor');o.indoor=(()=>{const k=m.kind;m.kind='dungeon';try{return __L17.fldBlock('storm');}finally{m.kind=k;}})();
  // a low level Jace has none of it; the battle under the called sky starts in it
  const c=g('newChar')('jaeson',8,1);o.low=__L17.fldOf(c).length;
  A.startBattle({stage:m.s,kind:'field',seed:2});o.battleWx=A.B.weather;A.finishBattle('x');G.party=['jaeson','kaevan','nikaris'];return o;});
 console.log('field:',JSON.stringify(r));
 chk(`Field skills list ${r.list.join(' and ')}; Call Thunderstorm turns "${r.c0}" into "${r.c1}" for ${r.steps} steps and ${r.mp} MP; Call Blizzard: "${r.c2}"`,
  r.list.length===2&&r.w1==='storm'&&/Thunderstorm/.test(r.c1)&&/Called/.test(r.c1)&&!/Thunderstorm/.test(r.c0)&&r.w2==='blizzard'&&/Blizzard/.test(r.c2)&&r.mp>0&&r.steps>=100||JSON.stringify(r));
 chk(`the same sky twice costs nothing more, a held sky and indoors refuse ("${r.held}" / "${r.indoor}"), a level 8 Jace has no weather yet, and a field battle starts in the called ${r.battleWx}`,r.again===r.mp&&!!r.held&&!!r.indoor&&r.low===0&&r.battleWx==='blizzard'||JSON.stringify(r));
}
// ---------- 5. old saves ----------
{const r=await ev(()=>{const g=__A.TW.get,TPL=g('TPL'),o={lost:[],kept:0,legacy:0,n:0,marks:[]};
  [undefined,1,2,3,4].forEach(mark=>{const was=mark>=4?'lvS':mark===3?'lvR':mark===2?'lvQ':mark===1?'lvP':'lv12';
    ['nikaris','kaevan','jaeson'].forEach(id=>{[3,6,9,12,15,19,23,27,30,33,36,40,43,45].forEach(lv=>{__L17.kit(id);const old=__L17.L17.old[id],c=g('newChar')(id,lv);c.lv=lv;delete c.keep;
      const knew=old.filter(s=>{const l=s[was]!=null?s[was]:(was==='lvS'?s.lv:null);return l!=null&&l<=lv;}).map(s=>s.id),G0={roster:{[id]:c}};if(mark!=null)G0.m14lv=mark;
      __R17.keep(G0);const now=new Set(__L17.known(c).map(s=>s.id));o.n++;o.kept+=(c.keep||[]).length;o.legacy+=__L17.L17.legacy[id].filter(s=>now.has(s.id)).length;
      const miss=knew.filter(x=>!now.has(x));if(miss.length||!G0.l17k||G0.m14lv!==4)o.lost.push(id+'@'+lv+' mark '+mark+': '+miss.join());});});});
  // a new hero of the same level has no legacy skill; a second pass changes nothing
  const c=g('newChar')('jaeson',40);c.lv=40;delete c.keep;o.fresh=__L17.known(c).filter(s=>s.l17old).length;o.freshN=__L17.known(c).length;
  const G1={roster:{jaeson:c},m14lv:4,l17k:1};__R17.keep(G1);o.again=(c.keep||[]).length;
  o.legacyIds={};['nikaris','kaevan','jaeson'].forEach(id=>{o.legacyIds[id]=__L17.L17.legacy[id].map(s=>s.n);});
  // the round trip of a journey keeps the mark
  try{const raw=JSON.parse(JSON.stringify(g('packG')()));o.rt=g('unpackG')(raw).l17k;}catch(e){o.rt='ERR '+e.message;}
  // a loaded hero's new skills are marked New
  {const c2=g('newChar')('kaevan',30);c2.lv=30;delete c2.keep;const G2={roster:{kaevan:c2},m14lv:4,skSeen:{kaevan:__L17.L17.old.kaevan.map(s=>s.id)}};__R17.keep(G2);o.newMarks=(G2.skNew&&G2.skNew.kaevan)||[];}
  return o;});
 console.log('saves:',JSON.stringify(r));
 chk(`old saves (marks none, 1, 2, 3, 4; 14 levels; ${r.n} heroes): nobody loses a skill it knew (${r.kept} kept by name, ${r.legacy} of them skills the rework dropped), every save is marked`,r.lost.length===0&&r.kept>0&&r.legacy>0||r.lost.slice(0,6).join(' | '));
 chk(`a new level 40 Jace knows ${r.freshN} skills and none of the dropped ones (${JSON.stringify(r.legacyIds)}); a marked save is left alone; the mark survives a save and load; new skills are marked New (${r.newMarks.join()})`,
  r.fresh===0&&r.freshN===12&&r.again===0&&r.rt===1&&r.newMarks.includes('l17_steady')||JSON.stringify(r));
}
// ---------- 6. unlocking ----------
{const r=await ev(async()=>{const A=__A,g=A.TW.get,G=A.G,o={};const M=g('META');
  o.codes=Object.values(g('LEGEND_CODES')).sort().join();o.codeFn=typeof g('redeemCode')==='function';
  ['nikaris','kaevan','jaeson'].forEach(id=>{delete G.roster[id];});G.party=['brann','mira','oren'];M.legends={};G.quests=G.quests.filter(q=>q.type!=='legend');
  o.ok=['nikaris','kaevan','jaeson'].map(id=>[0,1,2,3,4].map(s=>__L17.questOk(id,s)?1:0).join(''));
  const s=3;G.stage=s;g('genQuests')(s);/* 0.22.6: one rare roll a realm; force it and re-roll so all trails post */{const LR=__L17A.LR19;LR.force=1;for(let i=0;i<8;i++){if(G.lrRun)G.lrRun.r={};__L17A.lr19.roll(s);}LR.force=0;}const Q=G.quests.filter(q=>q.type==='legend');o.posted=Q.map(q=>q.hero+':'+q.title+':'+q.state);
  o.redeemTxt=/follow the trail/.test(g('vRedeem')());
  const out={};
  for(const id of ['nikaris','kaevan','jaeson']){const q=G.quests.find(x=>x.type==='legend'&&x.hero===id),x={};out[id]=x;if(!q)continue;A.ACT.qAccept(q.id);x.state=q.state;x.p0=g('legendProg')(q);
    const m=g('getMap')('f'+s);x.act0=g('dynActors')(m).filter(a=>a.type==='legend'&&a.q===q).length;
    for(let i=0;i<q.n;i++){A.startBattle({stage:s,kind:'field',seed:40+i});A.B.en.forEach(e=>{e.hp=0;});g('win')();A.V.modal=null;}
    x.have=q.have;x.t1=q.tstep;x.p1=g('legendProg')(q);const a=g('dynActors')(m).find(a=>a.type==='legend'&&a.q===q);x.actor=a&&a.mon;
    A.V.screen='world';g('actorTalk')(a);x.modal=A.V.modal&&A.V.modal.l17&&A.V.modal.fight;x.html=/tough fight/.test(document.getElementById('modal').innerHTML);
    A.ACT.legendFight();x.foes=A.B?A.B.en.map(e=>e.name):null;x.kind=A.B&&A.B.spec.kind;x.wx=A.B&&A.B.weather;A.B.en.forEach(e=>{e.hp=0;});g('win')();x.t2=q.tstep;x.joined0=!!G.roster[id];A.V.modal=null;
    if(id==='nikaris'){x.on1=!!(M.legends||{})[id];x.qs=q.state;A.finishBattle('win');delete G.l18meet;continue;}/* he joins at once (legends18.js) */
    const a2=g('dynActors')(m).find(a=>a.type==='legend'&&a.q===q);A.V.screen='world';g('actorTalk')(a2);x.meet=A.V.modal&&A.V.modal.type;x.meetL17=!!(A.V.modal&&A.V.modal.l17);A.V.modal=null;
    x.on0=!!(M.legends||{})[id];g('legendJoin')(id);x.joined=!!G.roster[id];x.on1=!!(M.legends||{})[id];x.qs=q.state;A.V.modal=null;}
  o.q=out;
  // with the code (the account flag) the old quest posts, not the trail
  ['nikaris','kaevan','jaeson'].forEach(id=>{delete G.roster[id];});G.quests=G.quests.filter(q=>q.type!=='legend');G.legRoll={};G.legMiss={nikaris:1,kaevan:1,jaeson:1};M.legends={nikaris:1,kaevan:1,jaeson:1};g('genQuests')(4);
  o.coded=G.quests.filter(q=>q.type==='legend').map(q=>q.hero+':'+(q.trail?'trail':'meeting'));
  A.finishBattle('x');return o;});
 console.log('unlock:',JSON.stringify(r));
 chk(`the code table still names the three (${r.codes}); Help > Redeem names the trail`,['jaeson','kaevan','nikaris'].every(k=>r.codes.split(',').includes(k))/* legends17a adds dist and jose */&&r.codeFn&&r.redeemTxt||JSON.stringify([r.codes,r.redeemTxt]));
 chk(`without a code the board of the fourth realm posts three trails (${r.posted.join(' | ')}); by realm: ${r.ok.join(' ')}`,['nikaris','kaevan','jaeson'].every(k=>r.posted.some(x=>x.startsWith(k+':')&&/:open$/.test(x)))/* legends17a posts its own trails too */&&r.ok[0]==='01111'&&r.ok[1]==='00111'&&/^00.11$/.test(r.ok[2])||JSON.stringify([r.posted,r.ok]));
 ['nikaris','kaevan','jaeson'].forEach(id=>{const x=r.q[id]||{};
  if(id==='nikaris')chk(`${id}'s trail: no actor while it counts (${x.p0}), four field wins move it on (${x.p1}), its own foe stands on the field (${x.actor}), the fight is ${(x.foes||[]).join(', ')}, and winning it he joins at once, unlocked on the account`,
   x.state==='active'&&x.act0===0&&x.have===4&&x.t1===1&&!!x.actor&&!!x.modal&&x.html&&(x.foes||[]).length===3&&x.kind==='legend'&&x.joined0&&x.on1&&x.qs==='claimed'||JSON.stringify(x));
  else chk(`${id}'s trail: no actor while it counts (${x.p0}), four field wins move it on (${x.p1}), its own foe stands on the field (${x.actor}), the fight is ${(x.foes||[]).join(', ')}${x.wx&&x.wx!=='clear'?' under a '+x.wx:''}, then the old meeting (${x.meet}), and joining unlocks him on the account`,
   x.state==='active'&&x.act0===0&&x.have===4&&x.t1===1&&!!x.actor&&!!x.modal&&x.html&&(x.foes||[]).length===3&&x.kind==='legend'&&x.t2===2&&!x.joined0&&!!x.meet&&!x.meetL17&&!x.on0&&x.joined&&x.on1&&x.qs==='claimed'||JSON.stringify(x));});
 chk(`with the code the old meeting posts instead (${r.coded.join()})`,r.coded.length>=2&&r.coded.includes('kaevan:meeting')&&r.coded.includes('nikaris:meeting')&&r.coded.every(x=>/:meeting$/.test(x))||JSON.stringify(r.coded));
}
// ---------- 6b. the Monk's call (after 0.22.3: the Priest's Invoke, summon8.js SUM.call; the beside-the-Monk guardian of 0.22.3 is gone; v197a) ----------
{const r=await ev(()=>{const A=__A,g=A.TW.get,G=A.G,o={},SUM=g('SUM'),MI=g('MINIS')[0];G.roster.taro=g('newChar')('taro',20,2);G.party=['taro','brann','oren'];Object.values(G.roster).forEach(c=>{c.S=g('calcStats')(c);c.hp=c.S.mhp;c.mp=c.S.mmp;});
  G.summons={[MI[0]]:{mon:MI[0],name:MI[2],mod:MI[5]}};A.V.auto=false;A.startBattle({stage:1,kind:'boss',seed:9});const B=A.B;B.auto=false;B.mode='cmd';const a=B.front.find(u=>u.id==='taro');B.cur=a;
  o.call=SUM.call.monk;o.can=g('sumCan')(a);const bare=g('sumMake')(G.summons[MI[0]],false,null),fk=1+((a.S.attr&&a.S.attr.fth)||0)*g('ROLE9').fthSum;g('sumFire')(a,G.summons[MI[0]],SUM.call.monk.turns);const u=B.sum&&B.sum.u;o.front=B.front.map(x=>x.isSum?'guardian':x.id);o.turns=u&&u.turnsLeft;
  o.pow=+(u.S.atk/bare.S.atk/fk).toFixed(2);/* the caller's Faith lifts it as it does a Priest's (roles9.js) */o.swap=g('canSwap')();
  g('sumEnd')('done');o.after=B.front.map(x=>x.id);o.hint=/made for boss fights/.test(g('vCompanions')());A.finishBattle('x');delete G.roster.taro;G.party=['brann','mira','oren'];return o;});
 console.log('monk call:',JSON.stringify(r));
 chk(`the Monk's call is the Priest's guardian: ${r.call.pray} turns of stillness, then ${r.turns} turns in the whole Vanguard's place (${r.front.join(', ')}), full strength (x${r.pow}), no switching while it stands; afterwards ${r.after.join(', ')}`,
  r.call.pray===2&&r.call.turns===4&&r.can&&r.front.join()==='guardian'&&r.turns===4&&r.pow===1&&r.swap===false&&r.after.length===3&&r.after.includes('taro')||JSON.stringify(r));
 chk('the Summons tab says guardians and Lesser Scourges are made for boss fights',r.hint||JSON.stringify(r.hint));
}
// ---------- 7. auto battle ----------
{await ev(START);await ev(PARTY,46);
 const r=await ev(()=>new Promise(res=>{const A=__A,g=A.TW.get,o={used:{}};A.setPause(0);g('SIM_SMART');try{A.TW.get('SIM_SMART=true');}catch(e){}
  g('HOOK').wrap('perform','v195a','count',function(next,...a){try{if(a[0].side==='p'&&a[1]&&a[1].id)o.used[a[1].id]=(o.used[a[1].id]||0)+1;if(a[0].side==='e'&&a[1]&&a[1].id==='eZ'){o.bolts=(o.bolts||0)+1;if(__L17.rodOn())o.boltsRod=(o.boltsRod||0)+1;}}catch(e){}return next(...a);});
  let fights=0,wins=0,t0=Date.now();const tally=()=>{const B=A.B;if(!B||B._t)return;B._t=1;o.redir=(o.redir||0)+(B.l17redir||0);o.dives=(o.dives||0)+(B.l17dives||0);o.steady=(o.steady||0)+(B.l17steady||0);o.abs=(o.abs||0)+(B.l17abs||0);};
  const one=()=>{if(fights>=3||Date.now()-t0>90000){tally();o.fights=fights;o.wins=wins;o.wd=(window.__WD||[]).map(x=>x.msg);res(o);return;}
    Object.values(A.G.roster).forEach(c=>{c.hp=c.S.mhp;c.mp=c.S.mmp;c.lb=fights%2?100:0;});A.V.auto=true;A.META.cfg.autoOn=true;A.V.modal=null;
    A.G.bossWon=new Proxy({},{get:()=>1});A.startBattle({stage:[2,3,4][fights],kind:'boss',seed:70+fights});if(A.B){A.B.auto=true;A.B.en.forEach(e=>{const z={id:'eZ',n:'Test Bolt',el:'lightning',pw:1.2,t:'all',k:'mag',mp:0,cost:1,hits:1};if(fights%2){e.sk=[z];e._b5p=null;e.S.mhp*=3;e.hp=e.S.mhp;e.S.mag*=.4;e.S.atk*=.4;}else e.sk.push(z);});}
    const tick=()=>{const m=A.V.modal;if(m&&(m.type==='result'||m.type==='lose')){fights++;if(m.type==='result')wins++;tally();A.V.modal=null;A.finishBattle('x');return setTimeout(one,0);}
      if(Date.now()-t0>90000)return one();setTimeout(tick,5);};tick();};one();}));
 console.log('auto:',JSON.stringify(r));
 chk(`auto plays ${r.fights} boss fights (${r.wins} won) with no watchdog entry; it calls a sky, steadies shots, sets the hawk watching and raises the Rod (dives ${r.dives}, steadied shots ${r.steady}, bolts taken in ${r.abs}, enemy bolts bent ${r.redir})`,
  r.fights>=2&&r.wd.length===0&&(r.used.l17_storm||0)+(r.used.l17_bliz||0)>0&&r.used.l17_steady>0&&r.used.l17_watch>0&&r.dives>0&&r.steady>0&&r.used.l17_rod>0&&((r.boltsRod||0)===0||r.redir>0)||JSON.stringify(r));
}
await done(H);})();
