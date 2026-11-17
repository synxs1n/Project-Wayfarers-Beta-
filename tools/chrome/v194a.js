// legends17a.js: the two new Legendary wayfarers, Joseth Kynmar the Bloodhowl (Blood Summoner) and Dist, Taker of Hearts (Chief Bandit).
// 1) data: both are legends (LEGEND_IDS, legend classes), out of the starter pool, the tavern pool and the Daily Trial; kits of 14 on the roster17 levels,
//    exactly three known at level 10, two marked as the hero's own; the Daily Trial's seeded pick and the arena pool are untouched (nothing added to MON)
// 2) unlock by code (LEGEND-JOSE, LEGEND-DINO) and by quest with no code: the quest posts from a later realm, its steps can be played
//    (a Potion for Junah, the fights with Odin and Zeus, the duel; the toll, the Runner who is cornered by three blows or gets away, Dist and his crew),
//    the hero joins and is unlocked on the account
// 3) every skill of both kits can be used in a battle; the blood summon runs (poses jblood and jslam, the ring, the summon hidden until its smoke)
// 4) Joseth: HP costs (12 / 30 / 25 / 15%), three dogs out at once beside the Vanguard, each acting in its role (Junah heals, gives Regen, cleanses;
//    Odin slows, weakens, breaks, strips; Zeus casts lightning), four turns then home, one call-back a battle, one summon layer (Cerberus, a guardian or
//    a recruited boss send the pack home), one recruited boss among the three slots, Cerberus I and II, the fight's end leaves only heroes
// 5) Dist: Water Clone repeats a damaging skill at 45%, Pick Up the Pace (longer Haste, sooner turns), Slip Under (not a target, half from area moves,
//    not twice running), Toll Toss spends gold, Shakedown strips a boon and lifts gold, Light Fingers under its cap, both Limits (every foe at least once)
// Battles are driven by hand with the battle clock held (battlePaused), so the test does not depend on the machine's speed.
// Usage: PWHTML=<abs path to out/aurelis3.html> node v194a.js
const {open,chk,done}=require('./pw');
const PRE=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',music:0,sfx:0,gfx:'low',hints:false,tips:false,hd2d:false,timedHits:false}}));`;
const START=ids=>{const A=__A;A.ACT.new();ids.forEach(i=>A.ACT.pickS(i));A.ACT.begin();try{A.ACT.storyOk();}catch(e){}A.V.modal=null;A.render();};
(async()=>{
const H=await open({w:390,h:844,pre:PRE});const {ev}=H;const cerr=[];H.page.on('console',m=>{if(m.type()==='error')cerr.push(m.text().slice(0,200));});
// ---------- 1. data ----------
{const r=await ev(()=>{try{window.__R25.R25.off=true;}catch(e){}/* 0.22.25: kits of 14; a worn personal relic adds a fifteenth skill (v209a) */const A=__A,g=A.TW.get,TPL=g('TPL'),CLS=g('CLS'),R=__R17.R17,o={};
  o.leg=g('LEGEND_IDS').join(',');o.cls=['bloodcaller','chief'].map(k=>CLS[k]&&CLS[k].legend&&CLS[k].n).join(',');o.names=TPL.jose.title+'|'+TPL.dist.title+'|'+TPL.dist.n;
  o.kits=['jose','dist'].map(id=>{const K=g('classSkills')(TPL[id]),L=K.map(s=>s.lv);return {n:K.length,lv:L.join()===R.lv.join(),at10:L.filter(x=>x<=10).length,ids:new Set(K.map(s=>s.id)).size,names:new Set(K.map(s=>s.n)).size,own:K.filter(s=>s.own).map(s=>s.n).join('+'),data:K.every(s=>s.d&&s.n&&s.k),role:K.some(s=>/primer|detonator/i.test(s.d))};});
  o.pool=g('ro14Pool')().filter(id=>id==='jose'||id==='dist'||TPL[id].j17hid).length;o.tav=g('POOL_IDS')().filter(id=>id==='jose'||id==='dist').length;
  o.daily=g('dailyPlan')('2026-11-14').ids.filter(id=>id==='jose'||id==='dist').length;o.mon=Object.keys(g('MON')).filter(k=>/junah|odin|zeus|cerberus|rv_jose|rv_dist/.test(k)).length;
  o.tplN=Object.keys(TPL).filter(id=>TPL[id].j17hid).length;o.uniq=(()=>{const U=__R17.unique();return ['jose','dist'].map(id=>U[id]?U[id].n+':'+U[id].own.length:'none').join(',')+' hidden '+Object.keys(U).filter(id=>TPL[id].j17hid).length;})();
  o.gear=['u_jose','u_dist'].map(k=>{const q=g('GEAR')[k];return q&&q.only&&q.relic&&q.bound?q.n:'missing';}).join('|');
  o.lim=['bloodcaller','chief'].map(k=>g('LIMIT')[k].n+' / '+g('LIMIT2')[k].n).join(' | ');
  o.sprites=(()=>{try{const hc=g('heroCanvas'),pc=g('heroPoseCanvas'),wc=g('walkerCanvas'),mc=g('monCanvas'),u=c=>c.toDataURL().length;const S=new Set();let n=0;
    ['jose','dist'].forEach(id=>{S.add(u(hc(id,false)));n++;['swing','thrust','smash','shoot','cast','pray','guard','cheer','hit'].forEach(p=>[0,1].forEach(f=>{pc(id,p,f);}));['front','side','back'].forEach(v=>[0,1].forEach(f=>{const c=wc('v194'+id,TPL[id].look,TPL[id].el,id,v,f);if(c.width>0)n++;}));if(g('portraitURL')(id).length>500)n++;});
    const P=[['jblood',0],['jblood',1],['jslam',0],['jslam',1]].map(p=>pc('jose',p[0],p[1]).toDataURL());const idle=hc('jose',false).toDataURL();
    const dogs=['junah','odin','zeus','cerberus','cerberus2'].map(k=>mc(k,{t:'idle',i:0}).toDataURL()!==mc(k,{t:'atk',i:0}).toDataURL());
    return {n,poses:new Set(P.concat(idle)).size,dogs:dogs.join(),clone:hc(__L17A.hid('dist_wc'),false).toDataURL()!==hc('dist',false).toDataURL(),big:g('MON_SIZE')('cerberus')===60&&g('MON_SIZE')('junah')===40};}catch(e){return 'error '+e.message;}})();
  return o;});
 chk('both are legends: '+r.leg,/jose/.test(r.leg)&&/dist/.test(r.leg)||r.leg);
 chk('legend classes Blood Summoner and Chief Bandit; names: '+r.names,r.cls==='Blood Summoner,Chief Bandit'&&r.names==='Joseth Kynmar, the Bloodhowl|Dist, Taker of Hearts|Dist'||r.cls+' '+r.names);
 r.kits.forEach((k,i)=>chk(`${i?'Dist':'Joseth'}: 14 skills on the roster17 levels, three known at level 10, two of his own (${k.own})`,k.n===14&&k.lv&&k.at10===3&&k.ids===14&&k.names===14&&k.own.split('+').length===2&&k.data&&!k.role||JSON.stringify(k)));
 chk('never in the starter pool, the tavern pool or the Daily Trial; nothing added to MON (the Daily pick and the arena stay as they were); no helper template before one is needed',r.pool===0&&r.tav===0&&r.daily===0&&r.mon===0&&r.tplN===0||JSON.stringify([r.pool,r.tav,r.daily,r.mon]));
 chk('the roster17 measure counts both with 14 skills and two or more of their own, and no hidden template: '+r.uniq,/^14:(\d+),14:(\d+) hidden 0$/.test(r.uniq)&&r.uniq.split(/[:, ]/).filter((x,i)=>i===1||i===3).every(x=>+x>=2)||r.uniq);
 chk('signature weapons exist and are bound relics: '+r.gear,!/missing/.test(r.gear)||r.gear);
 chk('Limits: '+r.lim,r.lim==='Cerberus, the Bound Pack / Cerberus Stormcrown | Tidecrew Rush / Clean Sweep'||r.lim);
 chk('sprites: battle idle, every pose, walkers in three views (the fourth is the side view mirrored), portraits; four summon frames that differ; dogs and Cerberus have a cast frame; the clone is a different paint',
   r.sprites&&r.sprites.n===2*(1+6+1)&&r.sprites.poses===5&&r.sprites.dogs==='true,true,true,true,true'&&r.sprites.clone&&r.sprites.big||JSON.stringify(r.sprites));}
// ---------- 2. unlock by code, and by quest with no code ----------
{const r=await ev(async()=>{const A=__A,g=A.TW.get,o={},rc=g('redeemCode'),RED=g('REDEEM');
  const bad=await rc('WRONG-CODE');RED.until=0;const a=await rc(' legend-jose ');RED.until=0;const b=await rc('LEGEND-DINO');RED.until=0;const c=await rc('legend-dino');RED.until=0;
  o.code=[bad.ok,a.ok&&a.id,b.ok&&b.id,c.already,g('legendOn')('jose'),g('legendOn')('dist')].join();
  o.redeem=g('vRedeem')().includes('Three Whistles')&&g('vRedeem')().includes('The Toll on the Water');
  return o;});
 chk('redeem codes unlock both on the account (a wrong code does not; a second use says already): '+r.code,r.code==='false,jose,dist,true,true,true'||r.code);
 chk('the redeem screen names both quests',r.redeem===true);
 await ev(START,['mira','sable','oren']);
 const q=await ev(()=>{const A=__A,g=A.TW.get,G=A.G,o={},mr=Math.random;
  // with the code: the older legends' rule (legendRoll); Dist from the second realm, Joseth (a dual type) from the third
  G.lrRun={n:99,r:{}};/* keep the codeless roll out of this part; 0.22.7: a coded legend posts for sure, even on a high roll */Math.random=()=>.99;G.stage=1;__L17A.questRoll(1);o.code1=G.quests.filter(x=>x.type==='legend').map(x=>x.hero).join();G.stage=2;__L17A.questRoll(2);o.code2=G.quests.filter(x=>x.type==='legend').map(x=>x.hero).sort().join();
  // with no code (0.22.6): one rare roll a realm, chance 8% +1% a clear to 15%, at most 1+clears a run, no pity
  const META=g('META');META.legends={};G.quests=G.quests.filter(x=>x.type!=='legend');G.legRoll={};G.legMiss={};delete G.lrRun;const c0=META.clears;
  META.clears=0;o.ch0=__L17A.lr19.chance();o.cap0=__L17A.lr19.cap();META.clears=3;o.ch3=__L17A.lr19.chance();o.cap3=__L17A.lr19.cap();META.clears=20;o.ch20=__L17A.lr19.chance();o.cap20=__L17A.lr19.cap();META.clears=0;
  Math.random=()=>.5;G.stage=1;__L17A.questRoll(1);G.stage=2;__L17A.questRoll(2);G.stage=3;__L17A.questRoll(3);o.miss=G.quests.filter(x=>x.type==='legend').length;
  Math.random=()=>0;__L17A.questRoll(3);o.again=G.quests.filter(x=>x.type==='legend').length;
  G.stage=4;__L17A.questRoll(4);o.hit=G.quests.filter(x=>x.type==='legend').length;
  delete G.lrRun.r[4];__L17A.questRoll(4);o.capped=G.quests.filter(x=>x.type==='legend').length;
  META.clears=1;delete G.lrRun.r[4];__L17A.questRoll(4);o.cap1=G.quests.filter(x=>x.type==='legend').length;
  // the board shape: post both of Joseth and Dist
  G.quests=G.quests.filter(x=>x.type!=='legend');delete G.lrRun;__L17A.LR19.force=1;for(let i=0;i<8&&!(__L17A.quest('dist')&&__L17A.quest('jose'));i++){if(G.lrRun)G.lrRun.r={};__L17A.questRoll(4);}__L17A.LR19.force=0;
  META.clears=c0;Math.random=mr;
  const Q=__L17A.quest('dist'),J=__L17A.quest('jose');o.shape=[Q.id,Q.state,Q.step,Q.title,J.title].join('|');
  o.board=(()=>{try{const h=g('nbBody')('quests');return /The Toll on the Water/.test(h)&&/Three Whistles/.test(h)&&/Dist, Taker of Hearts may join you/.test(h);}catch(e){return 'error '+e.message;}})();
  return o;});
 chk('with the code the quests post like the older legends\' (Dist from realm 2, Joseth from realm 3): '+q.code1+' / '+q.code2,q.code1==='dist'&&q.code2==='dist,jose'||JSON.stringify(q));
 chk(`with no code it is rare: ${Math.round(q.ch0*100)}% a realm and 1 a run at 0 clears, ${Math.round(q.ch3*100)}% and ${q.cap3} at 3, capped at ${Math.round(q.ch20*100)}% and ${q.cap20}`,Math.abs(q.ch0-.08)<1e-9&&q.cap0===1&&Math.abs(q.ch3-.11)<1e-9&&q.cap3===4&&Math.abs(q.ch20-.15)<1e-9&&q.cap20===5||JSON.stringify(q));
 chk(`misses post nothing and there is no pity (${q.miss}); one roll a realm (${q.again}); a hit posts one (${q.hit}); the run cap holds at 0 clears (${q.capped}) and rises with a clear (${q.cap1})`,q.miss===0&&q.again===0&&q.hit===1&&q.capped===1&&q.cap1===2||JSON.stringify(q));
 chk('the quests are on the Notice Board with the hero as the reward: '+q.shape,q.board===true&&/^Ldist\|open\|0\|The Toll on the Water\|Three Whistles$/.test(q.shape)||JSON.stringify(q));
 // play both quests
 const p=await ev(()=>{const A=__A,g=A.TW.get,G=A.G,o={log:[]},ACT=A.ACT,V=A.V;g('battlePaused=function(){return true;}');
  ['mira','sable','oren'].forEach(id=>{G.roster[id]=A.newChar(id,40,4);});G.party=['mira','sable','oren'];G.gold=1000;G.inv.potion=0;
  const kill=()=>{const B=A.B;B.en.forEach(e=>{if(e.hp>0){e.hp=0;g('fallen')(e);}});g('checkEnd')();g('win')();const m=V.modal,info=m&&m.info;const t=info&&info.legend;V.modal=null;g('finishBattle')('won');return t||'';};
  const actor=id=>{const q=__L17A.quest(id);const m={kind:'field',part:0,s:q.stage,free:[[3,3],[4,4],[5,5]],nodes:[]};return g('dynActors')(m).filter(a=>a.type==='legend'&&a.q.hero===id).length;};
  try{
  // --- Dist ---
  const Q=__L17A.quest('dist');ACT.qAccept(Q.id);o.actor=actor('dist');o.prog0=g('legendProg')(Q);
  const cv=k=>{const t=g('TPL').dist;return g('walkerCanvas')('leg:dist',t.look,t.el,'dist','front',0).toDataURL().length;};o.w0=cv();
  g('actorTalk')({type:'legend',q:Q});o.m0=V.modal&&V.modal.type+':'+(V.modal.btns||[]).map(b=>b[0]).join();o.html0=/toll keeper/i.test(g('vModal')(V.modal)||document.getElementById('modal').innerHTML);
  const g0=G.gold;ACT.j17TollNo();o.toll=g0-G.gold;o.step1=Q.step;o.w1=cv();V.modal=null;
  g('actorTalk')({type:'legend',q:Q});o.m1=V.modal&&V.modal.type+':'+(V.modal.btns||[]).map(b=>b[0]).join();ACT.j17Fight();
  // the Runner gets away on his fourth turn: no loss, the step stays
  {const B=A.B;o.run=B&&B.en.length===1&&B.en[0].j17run&&B.en[0].heroArt;B.en[0].turns=3;B.cur=B.en[0];g('enemyTurn0')(B.en[0]);o.away=B.over===true&&Q.step===1;g('finishBattle')('fled');}
  V.modal=null;g('actorTalk')({type:'legend',q:Q});ACT.j17Fight();
  {const B=A.B,e=B.en[0];const hp0=e.hp;for(let i=0;i<3&&!B.over&&e.hp>0;i++){B.cur=B.front[i%3];B.mode='cmd';const e0=e.hp;let n=0;while(e.hp===e0&&n++<8){B.cur.S.acc=5;g('perform')(B.cur,g('ATTACK'),[e]);}}
   o.cornered=e.hp<=0&&hp0>0&&B.j17q.n===3;g('checkEnd')();g('win')();o.t1=(V.modal&&V.modal.info&&V.modal.info.legend||'').slice(0,40);V.modal=null;g('finishBattle')('won');o.step2=Q.step;o.w2=cv();}
  V.modal=null;g('actorTalk')({type:'legend',q:Q});ACT.j17Fight();o.duel=A.B.en.map(e=>e.name+(e.heroArt?'*':'')).join();const g1=G.gold;o.t2=kill().slice(0,60);
  o.joined=!!G.roster.dist&&G.party.includes('dist')&&Q.state==='claimed'&&g('META').legends.dist===1;o.back=G.gold-g1>=o.toll;
  // --- Joseth ---
  const J=__L17A.quest('jose');ACT.qAccept(J.id);V.modal=null;G.inv.potion=0;g('actorTalk')({type:'legend',q:J});o.j0=(V.modal.btns||[]).map(b=>b[0]+':'+b[2]).join();ACT.j17Give();o.jstay=J.step;
  G.inv.potion=1;V.modal=null;g('actorTalk')({type:'legend',q:J});ACT.j17Give();o.jstep1=J.step+':'+G.inv.potion+':'+(J.purse>0);V.modal=null;
  const gj=G.gold;g('actorTalk')({type:'legend',q:J});ACT.j17Fight();o.f1=A.B.en.map(e=>e.name).join();o.tj1=kill().slice(0,20);o.purse=G.gold-gj>=J.purse;
  V.modal=null;g('actorTalk')({type:'legend',q:J});ACT.j17Fight();o.f2=A.B.en.map(e=>e.name).join();kill();o.jstep3=J.step;
  V.modal=null;g('actorTalk')({type:'legend',q:J});ACT.j17Fight();o.f3=A.B.en.map(e=>e.name+(e.heroArt?'*':'')).join();o.tj3=kill().slice(0,45);
  o.jjoined=!!G.roster.jose&&J.state==='claimed'&&g('META').legends.jose===1;o.best=['Junah','Odin','Zeus'].every(n=>(g('META').best[n]||{}).seen>0);
  o.bestiary=g('bestAll')().filter(x=>x.j17).map(x=>x.k).join();
  }catch(e){o.err=String(e&&e.stack||e).slice(0,400);}
  return o;});
 chk('quest play ran without an error',!p.err||p.err);
 chk('The Toll on the Water: an actor on the field, the toll keeper scene with two answers, both cost gold ('+p.toll+')',p.actor===1&&p.m0==='j17evt:j17TollPay,j17TollNo'&&p.html0&&p.toll>0&&p.step1===1||JSON.stringify(p));
 chk('the actor changes with the step (toll keeper, Runner, Dist)',p.w0!==p.w1&&p.w1!==p.w2&&p.w0!==p.w2||[p.w0,p.w1,p.w2].join());
 chk('the Runner: gone on his fourth turn with no loss, cornered by three blows that hurt',p.run==='dist_c1'&&p.away===true&&p.cornered===true&&p.step2===2||JSON.stringify([p.run,p.away,p.cornered,p.step2]));
 chk('the far bank: Dist and two of his crew ('+p.duel+'); he joins, the toll comes back, the account is unlocked',p.duel==='Dist*,Tidecrew Cutter A*,Tidecrew Cutter B*'&&p.joined===true&&p.back===true&&/Dist, Taker of Hearts joins you/.test(p.t2)||JSON.stringify([p.duel,p.joined,p.back,p.t2]));
 chk('Three Whistles: Junah wants a Potion (without one the step stays), Odin gives the purse back, Zeus, then Joseth with all three dogs ('+p.f3+')',/j17Give:false/.test(p.j0)&&p.jstay===0&&p.jstep1==='1:0:true'&&p.f1==='Odin'&&p.purse===true&&p.f2==='Zeus'&&p.jstep3===3&&p.f3==='Joseth Kynmar*,Junah,Odin,Zeus'||JSON.stringify(p));
 chk('he joins and is unlocked on the account; the dogs are in the Bestiary once met ('+p.bestiary+')',p.jjoined===true&&p.best===true&&p.bestiary==='junah,odin,zeus'&&/Joseth Kynmar, the Bloodhowl joins you/.test(p.tj3)||JSON.stringify([p.jjoined,p.best,p.bestiary,p.tj3]));}
// ---------- 3 to 5. battle ----------
{const r=await ev(()=>{const A=__A,g=A.TW.get,G=A.G,o={err:[]},V=A.V,MON=g('MON'),STS=g('STS'),has=(u,k)=>!!(u.st&&u.st[k]);
  g('battlePaused=function(){return true;}');try{g('B4').off=true;}catch(e){}/* no Momentum: the damage ratios below are the skills' own */
  ['jose','dist','oren','mira'].forEach(id=>{G.roster[id]=A.newChar(id,46,4);});G.party=['jose','dist','oren','mira'];G.gold=5000;G.stage=2;G.tamed=[];G.summons={};
  const fight=(n,opt)=>{if(A.B)g('finishBattle')('x');V.modal=null;Object.values(G.roster).forEach(c=>{c.hp=c.S.mhp;c.mp=c.S.mmp;c.st={};c.lb=0;});
    A.startBattle(Object.assign({stage:2,kind:'field',weather:'clear',foes:['frostwolf','cinderpup','mossling'].slice(0,n||3).map(k=>A.makeEnemy(MON[k],40,{hpM:60,powM:.1}))},opt||{}));const B=A.B;B.time=B.time||0;return B;};
  const U=id=>A.B.front.concat(A.B.back).find(c=>c.id===id);
  const use=(id,sid,tg)=>{const B=A.B,a=U(id);B.cur=a;B.mode='cmd';B.menu='root';B.over=false;const s=sid==='limit'?g('limitSkill')(a):g('known')(a).find(x=>x.id===sid);if(!s)return 'unknown '+sid;
    const why=__L17A.block(a,s);if(why)return 'blocked: '+why;a.mp=a.S.mmp;const foes=B.en.filter(e=>e.hp>0),fr=B.front.filter(c=>c.hp>0),t=s.t;
    try{g('exec')(s,tg||(t==='all'||t==='rand'?foes:t==='self'?[a]:t==='allyAll'?fr:t==='ally'?[fr[0]]:t==='dead'?[B.front.concat(B.back).find(c=>c.hp<=0)||a]:[foes[0]]));return 'ok';}catch(e){o.err.push(sid+': '+String(e&&e.stack||e).slice(0,300));return 'error';}};
  const names=()=>A.B.front.map(u=>u.name+(u.j17?'*':'')+(u.j17gone?'x':'')).join();
  try{
  // ---- every skill of both kits ----
  let B=fight();const all=[];
  g('classSkills')(g('TPL').jose).forEach(s=>{if(s.j17==='pack')return;if(s.k==='revive'){const m=U('mira');m.hp=0;}all.push(s.id+'='+use('jose',s.id));__L17A.tick();});
  B=fight();all.push('j_pack='+use('jose','j_pack'));
  B=fight();g('classSkills')(g('TPL').dist).forEach(s=>{const a=U('dist');if(s.j17==='slip')delete a.st.slip;all.push(s.id+'='+use('dist',s.id));});
  o.all=all.filter(x=>!/=ok$/.test(x)).join(' ');o.nAll=all.length;
  // ---- the blood summon ----
  B=fight();{const a=U('jose'),hp0=a.hp,mp0=a.mp,sp=g('spriteOf'),idle=sp(a);o.w=use('jose','j_whistle');const u=__L17A.out()[0];
   o.cost1=Math.round((hp0-a.hp)/a.S.mhp*100)+':'+(mp0-a.mp);o.anim=!!a.j17anim&&__L17A.V.fx.length>=1&&sp(a)!==idle;o.pose=__L17A.animPose(100)+'|'+__L17A.animPose(200)+'|'+__L17A.animPose(400)+'|'+__L17A.animPose(900);
   o.hidden=g('PAUSE')>=300?(u.j17in>Date.now()):true;o.dog1=u.name+':'+u.compTurns+':'+(u.hp===u.S.mhp)+':'+B.front.includes(a);
   try{const cvs=document.getElementById('bcv');for(let i=0;i<3;i++)g('battleFrame')(performance.now()+i*16);o.frame=!!cvs;}catch(e){o.err.push('frame: '+e.message);}}
  // ---- three dogs at once, each in its role ----
  B=fight();{const a=U('jose'),hp0=a.hp;o.pk=use('jose','j_pack');const P=__L17A.out();o.three=P.map(u=>u.name+':'+u.j17dog+':'+u.compTurns).join();o.cost3=Math.round((hp0-a.hp)/a.S.mhp*100);o.front=B.front.length+':'+names();
   const box=P.map(u=>{const b=g('unitBox')(u);return b&&b.x>0&&b.x<g('BL').W&&b.y>0&&b.y<=g('BL').H;}).join();o.box=box;
   const ju=P[0],od=P[1],ze=P[2],foes=B.en.filter(e=>e.hp>0),pw=ju.S.mhp/A.newChar('j17_junah',46,4).S.mhp;o.packHp=+pw.toFixed(2);
   // Junah: heals the weakest ally under half, cleanses a sick one, Regen for the line, else barks
   const m=U('oren');m.hp=Math.round(m.S.mhp*.3);o.j1=__L17A.dogPick(ju,foes)[0].n;const h0=m.hp;__L17A.turn(ju);o.j1h=m.hp>h0;
   m.hp=m.S.mhp;m.st.poison={t:3};o.j2=__L17A.dogPick(ju,foes)[0].n;__L17A.turn(ju);o.j2c=!m.st.poison;
   B.front.forEach(c=>{c.hp=Math.round(c.S.mhp*.7);delete c.st.regen;});o.j3=__L17A.dogPick(ju,foes)[0].n;__L17A.turn(ju);o.j3r=B.front.filter(c=>!c.j17&&c.st.regen).length;
   B.front.forEach(c=>{c.hp=c.S.mhp;c.st.regen={t:3};});o.j4=__L17A.dogPick(ju,foes)[0].k;
   // Odin: slows and weakens, breaks, tears a boon off, steals
   const f=foes.slice().sort((x,y)=>y.hp-x.hp)[0];o.o1=__L17A.dogPick(od,foes)[0].n;f.st.slow={t:3};o.o2=__L17A.dogPick(od,foes)[0].n;foes[1].st.might={t:3};const pk=__L17A.dogPick(od,foes);o.o3=pk[0].n+':'+(pk[1][0]===foes[1]);
   g('RNG=function(){return .01;}');__L17A.turn(od);o.o3s=!foes[1].st.might;delete f.st.slow;__L17A.turn(od);o.o4=Object.keys(f.st).filter(k=>/slow|weaken|break/.test(k)).length>0;
   // Zeus: Static Coat first, then lightning on one or on all
   ze.turns=1;o.z1=__L17A.dogPick(ze,foes)[0].n;ze.turns=0;__L17A.turn(ze);o.z1b=has(ze,'haste')&&has(ze,'focus');const e0=foes.map(e=>e.hp);__L17A.turn(ze);o.z2=foes.filter((e,i)=>e.hp<e0[i]).length;o.z3=!!ze.j17head;
   g('RNG=Math.random');
   // four turns, then home
   o.left=[ju,od,ze].map(u=>u.compTurns).join();while(ju.compTurns>0&&!ju.j17gone)__L17A.turn(ju);__L17A.tick();o.home=ju.j17gone===1&&!B.front.includes(ju)&&B.front.includes(a);}
  // ---- one call-back a battle ----
  B=fight();{const a=U('jose');use('jose','j_whistle');use('jose','j_whistle');use('jose','j_whistle');o.i0=__L17A.whistleInfo(a).why||'';const u=__L17A.out()[1];g('hurt')(u,99999);__L17A.tick();
   const I=__L17A.whistleInfo(a);o.i1=I.mode+':'+I.cost;const hp0=a.hp;o.b1=use('jose','j_whistle');const v=__L17A.out().find(x=>x.j17slot===1);o.back=v&&v.name+':'+v.compTurns+':'+Math.round((hp0-a.hp)/a.S.mhp*100);
   g('hurt')(v,99999);__L17A.tick();o.b2=use('jose','j_whistle');o.b3=use('jose','j_pack');}
  // ---- one layer: Cerberus, a guardian, a recruited boss ----
  B=fight();{const a=U('jose');a.lv=20;use('jose','j_pack');const hp0=a.hp;a.lb=100;o.c1=use('jose','limit');const c=__L17A.cer();__L17A.tick();o.cer1=c&&c.name+':'+c.turnsLeft+':'+(hp0===a.hp)+':'+__L17A.out().length+':'+B.front.filter(u=>!u.j17).length;
   o.c1b=use('jose','j_whistle');o.c1g=g('sumCan')(a);const pw1=c.S.atk;const foes=B.en.filter(e=>e.hp>0);const e0=foes.map(e=>e.hp);__L17A.turn(c);__L17A.turn(c);o.c1d=foes.some((e,i)=>e.hp<e0[i]);__L17A.turn(c);__L17A.tick();o.c1gone=!__L17A.cer()&&B.front.length===3;
   a.lv=46;a.lb=100;B.front.forEach(x=>{if(!x.j17)x.hp=Math.round(x.S.mhp*.5);});o.c2=use('jose','limit');const d=__L17A.cer();o.cer2=d&&d.name+':'+d.turnsLeft+':'+(d.S.atk>pw1);const pk=__L17A.dogPick?null:null;
   d.turns=0;const l0=B.log.length;__L17A.turn(d);o.c2m=B.log.slice(l0).some(x=>/Stormcrown Howl/.test(x));const hh=U('oren').hp;while(d.turnsLeft>0&&!d.j17gone)__L17A.turn(d);o.c2heal=U('oren').hp>hh;__L17A.tick();o.best=(g('META').best['Cerberus Stormcrown']||{}).seen>0;}
  B=fight();{const a=U('jose');const mi=g('MINIS')[0];G.summons={[mi[0]]:{mon:mi[0],name:mi[2],mod:mi[5]}};use('jose','j_pack');B.cur=a;B.mode='cmd';const hp0=a.hp,mp0=a.mp;o.g0=g('sumClassOf')(a)+':'+g('sumCan')(a);
   o.g1=g('sumPray')(a,mi[0])+':'+Math.round((hp0-a.hp)/a.S.mhp*100)+':'+(mp0-a.mp);o.g2=__L17A.out().length;const ok=g('sumFire')(a,G.summons[mi[0]],false);o.g3=ok+':'+B.front.length+':'+!!B.sum+':'+__L17A.out().length;
   o.g4=__L17A.whistleInfo(a).why||'';g('sumEnd')('done');o.g5=B.front.map(u=>u.id).join();G.summons={};}
  // ---- one recruited boss among the three slots ----
  {const mk=(id,mon,sc)=>{const d=MON[mon]||g('guardianDef')(mon);const p={id,mon,name:(sc?'Lesser ':'')+d.n,cls:g('tameClass')(d),trait:g('tameTrait')(d),bb:0,scourge:sc?1:0,with:null,bt:0};g('registerTamed')(p);return p;};
   const GP=g('GPOOL');G.tamed=[mk('tmA',GP[0],1),mk('tmB',GP[1],1),mk('tmC','frostwolf',0)];A.ACT.j17SlotSet('0,tmA');A.ACT.j17SlotSet('1,tmB');A.ACT.j17SlotSet('2,tmC');
   o.slots=__L17A.slots().map(e=>e.o?e.o.id:e.dog).join();o.caller=g('b16Caller')(G.roster.jose)+':'+g('canSummon')(G.roster.jose);
   const sv=g('unpackG')(JSON.parse(JSON.stringify(g('packG')())));o.save=(sv.tamed||[]).filter(x=>x.with==='jose').map(x=>x.id+x.j17s).join();
   V.modal={type:'compPick',id:'tmA'};A.ACT.compSet('jose');V.modal=null;o.slots2=__L17A.slots().map(e=>e.o?e.o.id:e.dog).join();
   o.note=__L17A.names('Only Nikaris, a Priest or a Monk of level 10 can summon a recruited boss.');o.tab=(()=>{try{const h=g('vCompanions')();return /Joseth's pack/.test(h)&&/Whistle or Call the Pack/.test(h)&&/Nikaris, Joseth, a Priest or a Monk/.test(h);}catch(e){return 'error '+e.message;}})();
   o.sheet=(()=>{try{V.modal={type:'char',char:'jose'};const h=g('mChar')('jose',true);V.modal=null;return /Joseth's pack/.test(h)&&/Blood Summoner/.test(h)&&/Cerberus, the Bound Pack/.test(h);}catch(e){return 'error '+e.message;}})();
   B=fight();const a=U('jose');o.pk2=use('jose','j_pack');o.out2=__L17A.out().map(u=>u.name).join();B.cur=a;B.mode='cmd';B.menu='root';
   o.btn=/data-act="j17Boss"/.test(g('cmdHtml')());const hp0=a.hp;A.ACT.j17Boss();o.boss=!!(B.sum&&B.sum.b16)+':'+B.front.length+':'+Math.round((hp0-a.hp)/a.S.mhp*100)+':'+__L17A.out().length;g('sumEnd')('done');G.tamed=[];}
  // ---- the fight ends: only heroes are left ----
  B=fight(1);{use('jose','j_pack');B.en.forEach(e=>{e.hp=0;g('fallen')(e);});g('checkEnd')();g('win')();o.win=G.party.join()+':'+Object.keys(G.roster).filter(k=>/j17|sum_/.test(k)).length+':'+(V.modal&&V.modal.type);V.modal=null;g('finishBattle')('won');}
  // ---- the auto: summons when it can afford it, never under half HP ----
  B=fight();{const a=U('jose');B.auto=true;B.cur=a;B.mode='cmd';o.auto1=__L17A.auto(a)+':'+__L17A.out().length;B=fight();const b=U('jose');B.auto=true;B.cur=b;B.mode='cmd';b.hp=Math.round(b.S.mhp*.55);o.auto2=__L17A.auto(b)+':'+__L17A.out().length;B.auto=false;}
  // ---- Dist ----
  const pin=()=>g('RNG=function(){return .5;}');/* (startBattle seeds RNG anew: pinned after every fight) */
  B=fight(1);pin();{const a=U('dist'),e=B.en[0],L=()=>{const h=e.hp;use('dist','d_cut',[e]);return h-e.hp;};const d1=L();o.cl=use('dist','d_clone');o.clst=has(a,'wclone');const l0=B.log.length;const d2=L();
   o.echo=+(B.j17.echoD/B.j17.mainD).toFixed(2)+':'+B.log.slice(l0).filter(x=>/Cutwater \(Water Clone\)/.test(x)).length+':'+B.j17.echoN+':'+(d2>d1*1.3);use('dist','d_stab',[e]);use('dist','d_stab',[e]);o.clend=has(a,'wclone');const d3=L();o.after=+(d3/d1).toFixed(2);
   // the clone is drawn: a see-through copy on the water palette behind him
   a.st.wclone={t:3};try{g('battleFrame')(performance.now());o.cdraw=true;}catch(x){o.err.push('clone frame: '+x.message);}delete a.st.wclone;}
  B=fight();pin();{const a=U('dist'),o2=U('oren'),j=U('jose');B.time=1000;[a,o2,j].forEach((c,i)=>{c.next=B.time+400+i*100;});const n0=[o2.next,j.next];o.pc=use('dist','d_pace');
   o.pace=[has(o2,'haste')&&o2.st.haste.t===STS.haste.t+1,+((o2.next-B.time)/(n0[0]-B.time)).toFixed(2),+((j.next-B.time)/(n0[1]-B.time)).toFixed(2)].join();
   const exp=g('delayOf')(a,1)*(1-__L17A.L17.pace.pull);o.pself=Math.abs((a.next-B.time)-exp)<2;o.pull=__L17A.L17.pace.pull;}
  B=fight(1);pin();{const a=U('dist'),e=B.en[0],o2=U('oren');o.sl=use('dist','d_slip');o.slst=has(a,'slip');o.sl2=use('dist','d_slip');const hp0=a.hp,h1=o2.hp+U('jose').hp;const sk={id:'x',n:'Bite',k:'phys',pw:2,t:'one',el:null,mp:0,cost:1,hits:1};
   e.S.atk=900;e.S.acc=5;g('perform')(e,sk,[a]);o.redir=a.hp===hp0&&(o2.hp+U('jose').hp)<h1;const cd=g('calcDamage'),x1=cd(e,sk,a).dmg;delete a.st.slip;const x2=cd(e,sk,a).dmg;o.half=+(x1/x2).toFixed(2);
   a.st.slip={t:1};const c1=a.S.crit;g('RNG=function(){return .45;}');const cr=cd(a,{id:'y',k:'phys',pw:1,el:null},e).crit;delete a.st.slip;const cr2=cd(a,{id:'y',k:'phys',pw:1,el:null},e).crit;o.crit=cr+':'+cr2+':'+(a.S.crit===c1);g('RNG=function(){return .5;}');}
  B=fight();pin();{const a=U('dist'),e=B.en[0];const hpE=()=>B.en.reduce((q,x)=>q+x.hp,0),g0=G.gold,h0=hpE();a.S.acc=5;o.tt=use('dist','d_toll',[e]);o.toll=(g0-G.gold)+':'+__L17A.toll()+':'+(hpE()<h0);G.gold=10;o.tt2=use('dist','d_toll',[e]);G.gold=5000;
   e.st.might={t:3};e.st.haste={t:3};const b0=B.gold;use('dist','d_shake',[e]);o.shake=Object.keys(e.st).filter(k=>k==='might'||k==='haste').length+':'+(B.gold>b0);
   // Light Fingers: every hit rolls; the cap is 40% of the fight's own gold
   g('RNG=function(){return .01;}');const cap=Math.round(B.en.reduce((q,x)=>q+g('goldFor')(x),0)*.4);B.j17.lift=0;const b1=B.gold;for(let i=0;i<40;i++){a.mp=a.S.mmp;use('dist','d_cut',[e]);}o.lf=(B.gold>b1)+':'+(B.j17.lift<=cap+60)+':'+(B.j17.lift>=cap);g('RNG=function(){return .5;}');
   o.eva=+(a.S.eva-g('calcStats')(Object.assign({},a,{id:'sable'})).eva).toFixed(2);}
  // ---- the Limits ----
  B=fight();pin();{const a=U('dist');a.lv=20;a.lb=100;const e0=B.en.map(e=>e.hp);const l0=B.log.length;o.l1=use('dist','limit');o.l1all=B.en.every((e,i)=>e.hp<e0[i]);o.l1n=B.log.slice(l0).filter(x=>/ takes \d+/.test(x)).length+':'+B.log.slice(l0).filter(x=>/ uses /.test(x)).length;o.crew=!!B.j17.crewT;
   try{g('battleFrame')(performance.now());}catch(x){o.err.push('crew frame: '+x.message);}
   a.lv=46;a.lb=100;B.en.forEach(e=>{e.st.might={t:3};e.maxShield=5;e.shield=5;e.broken=0;});const b0=B.gold,e1=B.en.map(e=>e.hp),l1=B.log.length;o.l2=use('dist','limit');
   o.l2all=B.en.every((e,i)=>e.hp<e1[i])+':'+B.log.slice(l1).filter(x=>/ takes \d+/.test(x)).length+':'+B.en.filter(e=>e.st.might).length+':'+(B.gold>b0)+':'+B.en.map(e=>e.shield).join('');a.lb=0;}
  g('RNG=Math.random');
  // ---- menus in battle: greyed rows say why; the Daily Trial has no pets ----
  B=fight();{const a=U('jose');use('jose','j_pack');B.cur=a;B.mode='cmd';B.menu='skills';const h=g('cmdHtml')();o.grey=/data-arg="j_pack" disabled/.test(h)&&/j17why/.test(h)&&/12% HP|15% HP/.test(h);
   const d=U('dist');B.cur=d;B.menu='skills';G.gold=3;const h2=g('cmdHtml')();o.grey2=/data-arg="d_toll" disabled/.test(h2)&&/Needs \d+ gold/.test(h2)&&/>120 gold</.test(h2);G.gold=5000;B.menu='root';
   const pc=g('pcard')(__L17A.out()[0],false);o.card=/j17pc/.test(pc)&&/Healer/.test(pc);G.daily=1;o.daily=__L17A.whistleInfo(a).why||'';G.daily=0;}
  g('finishBattle')('x');
  // ---- outside battle: Equip Best, Build party and a save round trip with both in the roster ----
  {V.modal=null;G.gear=(G.gear||[]).concat(['w_staff_4','a_robe_4','w_dagger_4','a_vest_4']);try{A.ACT.autoEqParty();}catch(e){o.err.push('equip best: '+e.message);}V.modal=null;
   o.eq=[G.roster.jose.eq.w,G.roster.jose.eq.a,G.roster.dist.eq.w,G.roster.dist.eq.a].map(x=>String(x).replace(/\+\d+$/,'')).join();
   try{const bp=g('bestParty')();o.bp=!!bp;}catch(e){o.err.push('best party: '+e.message);}
   try{const sv=g('unpackG')(JSON.parse(JSON.stringify(g('packG')())));o.rt=!!(sv.roster.jose&&sv.roster.dist)&&sv.roster.jose.lv===G.roster.jose.lv;}catch(e){o.err.push('save: '+e.message);}
   o.legacy=(()=>{try{const h=g('heroURL')('jose').length+g('heroURL')('dist').length;return h>2000;}catch(e){return 'error '+e.message;}})();}
  }catch(e){o.err.push('test: '+String(e&&e.stack||e).slice(0,500));}
  return o;});
 chk('battle script ran without an error',!r.err.length||r.err.join(' | '));
 chk(`every skill of both kits can be used in a battle (${r.nAll} uses)`,r.nAll===28&&r.all===''||r.all);
 chk('Whistle: 12% of max HP, no MP; the blood summon runs (poses, the ring, the dog hidden until its smoke); he stays on the field: '+r.cost1+' '+r.pose,r.w==='ok'&&r.cost1==='12:0'&&r.anim===true&&r.pose==='jblood,0|jblood,1|jslam,0|jslam,1'&&r.hidden===true&&r.dog1==='Junah:4:true:true'&&r.frame===true||JSON.stringify([r.w,r.cost1,r.anim,r.pose,r.hidden,r.dog1,r.frame]));
 chk('Call the Pack: three dogs at once for 30% of max HP, 4 turns each, 60% of a pet\'s HP, each with a place on the stage: '+r.three,r.pk==='ok'&&r.three==='Junah:junah:4,Odin:odin:4,Zeus:zeus:4'&&r.cost3===30&&/^6:/.test(r.front)&&r.box==='true,true,true'&&Math.abs(r.packHp-.6)<.07||JSON.stringify([r.three,r.cost3,r.front,r.box,r.packHp]));
 chk(`Junah heals the weakest (${r.j1}), cleanses (${r.j2}), gives Regen (${r.j3}), else attacks`,r.j1==='Warm Nuzzle'&&r.j1h&&r.j2==='Fetch'&&r.j2c&&r.j3==='Golden Hour'&&r.j3r===3&&r.j4==='mag'||JSON.stringify([r.j1,r.j1h,r.j2,r.j2c,r.j3,r.j3r,r.j4]));
 chk(`Odin slows and weakens (${r.o1}), breaks (${r.o2}), tears a boon off (${r.o3})`,r.o1==='Hamstring'&&r.o2==='Throat Hold'&&r.o3==='Throat Hold:true'&&r.o3s===true&&r.o4===true||JSON.stringify([r.o1,r.o2,r.o3,r.o3s,r.o4]));
 chk(`Zeus: ${r.z1} (Focus and Haste), then lightning on the foes`,r.z1==='Static Coat'&&r.z1b===true&&r.z2>=1||JSON.stringify([r.z1,r.z1b,r.z2,r.z3]));
 chk('a pack pet goes home after its four turns; the hero is untouched',r.home===true||r.left);
 chk('one call-back a battle (15% HP, 3 turns), then Whistle and Call the Pack are closed: '+r.back,r.i0!==''&&r.i1==='back:0.15'&&r.b1==='ok'&&r.back==='Odin:3:15'&&/^blocked/.test(r.b2)&&/^blocked/.test(r.b3)||JSON.stringify([r.i0,r.i1,r.b1,r.back,r.b2,r.b3]));
 chk('Limit I Cerberus, the Bound Pack: no HP cost, the pack goes home, it stands with the Vanguard for 3 turns, nothing else can be called: '+r.cer1,r.c1==='ok'&&r.cer1==='Cerberus, the Bound Pack:3:true:0:3'&&/^blocked/.test(r.c1b)&&r.c1g===false&&r.c1d===true&&r.c1gone===true||JSON.stringify([r.c1,r.cer1,r.c1b,r.c1g,r.c1d,r.c1gone]));
 chk('Limit II Cerberus Stormcrown: 4 turns, stronger, opens with Stormcrown Howl, heals the Vanguard when it leaves, in the Bestiary: '+r.cer2,r.c2==='ok'&&r.cer2==='Cerberus Stormcrown:4:true'&&r.c2m===true&&r.c2heal===true&&r.best===true||JSON.stringify([r.c2,r.cer2,r.c2m,r.c2heal,r.best]));
 chk('a guardian: he Invokes like a Priest, pays 25% HP and no MP, and the pack goes home when it takes the field: '+[r.g0,r.g1,r.g3].join(' '),r.g0==='priest:true'&&r.g1==='true:25:0'&&r.g2===3&&r.g3==='true:1:true:0'&&r.g4!==''&&r.g5==='jose,dist,oren'||JSON.stringify([r.g0,r.g1,r.g2,r.g3,r.g4,r.g5]));
 chk('slots: at most one recruited boss among the three (the second takes its place): '+r.slots+' / '+r.slots2,r.slots==='junah,tmB,tmC'&&r.slots2==='junah,tmA,tmC'&&r.caller==='true:false'&&r.save==='tmB1,tmC2'||JSON.stringify([r.slots,r.slots2,r.caller,r.save]));
 chk('notes and menus name him: '+r.note,/Nikaris, Joseth, a Priest or a Monk/.test(r.note)&&r.tab===true&&r.sheet===true||JSON.stringify([r.note,r.tab,r.sheet]));
 chk('a tamed pet in a slot is called with the pack; the recruited boss has its own command (25% HP) and sends the pack home: '+r.out2+' '+r.boss,r.pk2==='ok'&&r.out2==='Junah,Frost Wolf'&&r.btn===true&&r.boss==='true:1:25:0'||JSON.stringify([r.pk2,r.out2,r.btn,r.boss]));
 chk('a win with the pack out leaves only heroes in the party and the roster: '+r.win,r.win==='jose,dist,oren,mira:0:result'||r.win);
 chk('auto battle summons when he can afford it and never under half HP: '+r.auto1+' / '+r.auto2,r.auto1==='true:3'&&r.auto2==='false:0'||r.auto1+' '+r.auto2);
 chk('Water Clone: the next Cutwater is repeated at 45% of what it did (echo / main), for 3 of his turns, then no more: '+r.echo+' then x'+r.after,r.cl==='ok'&&r.clst===true&&/^0\.(3[89]|4\d|5[0-2]):1:1:true$/.test(r.echo)&&r.clend===false&&Math.abs(r.after-1)<.1&&r.cdraw===true||JSON.stringify([r.cl,r.clst,r.echo,r.clend,r.after,r.cdraw]));
 chk('Pick Up the Pace: Haste a turn longer, the others 20% sooner, and himself: '+r.pace,r.pc==='ok'&&r.pull===.2&&r.pace==='true,0.8,0.8'&&r.pself===true||JSON.stringify([r.pc,r.pace,r.pself]));
 chk('Slip Under: not a target (the blow goes elsewhere), half from area moves, +50% crit on his next attack, not two turns running: '+r.half+' '+r.crit,r.sl==='ok'&&r.slst===true&&/^blocked/.test(r.sl2)&&r.redir===true&&Math.abs(r.half-.5)<.1&&r.crit==='true:false:true'||JSON.stringify([r.sl,r.slst,r.sl2,r.redir,r.half,r.crit]));
 chk('Toll Toss spends gold (40 x the realm number) and is closed without it: '+r.toll,r.tt==='ok'&&r.toll==='120:120:true'&&/^blocked: Needs 120 gold/.test(r.tt2)||JSON.stringify([r.tt,r.toll,r.tt2]));
 chk('Shakedown strips one boon and lifts gold; Light Fingers lifts gold up to its cap; he is 10% harder to hit: '+r.shake+' '+r.lf+' '+r.eva,r.shake==='1:true'&&r.lf==='true:true:true'&&r.eva>=.05||JSON.stringify([r.shake,r.lf,r.eva]));
 chk('Limit I Tidecrew Rush: nine hits, every foe at least once, one announcement, the crew crosses the stage: '+r.l1n,r.l1==='ok'&&r.l1all===true&&/^[5-9]:1$/.test(r.l1n)&&r.crew===true||JSON.stringify([r.l1,r.l1all,r.l1n,r.crew]));
 chk('Limit II Clean Sweep: twelve hits, every foe hit, a boon off each, gold, 2 shield pips each: '+r.l2all,r.l2==='ok'&&/^true:1[2-4]:0:true:[0-3]{3}$/.test(r.l2all)||r.l2all);
 chk('greyed skill rows say why (with the HP or gold cost), the pack pet has the short card with its role, no pets in the Daily Trial',r.grey===true&&r.grey2===true&&r.card===true&&/Daily/.test(r.daily)||JSON.stringify([r.grey,r.grey2,r.card,r.daily]));
 chk('Equip Best gears them with their class gear, Build party runs, a save round trip keeps both: '+r.eq,/^w_staff_\d,a_robe_\d,w_(dagger|shortsword|thrown)_\d,a_vest_\d$/.test(r.eq)&&r.bp===true&&r.rt===true&&r.legacy===true||JSON.stringify([r.eq,r.bp,r.rt,r.legacy]));}
chk('no console errors',cerr.length===0||cerr.slice(0,3).join(' | '));
await done(H);
})();
