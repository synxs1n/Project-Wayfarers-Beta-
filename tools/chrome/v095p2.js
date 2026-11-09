// Beta v0.9.5 boss realm gimmicks (battle4.js, BOSS_GIM in config.js): every Scourge (16) and Calamity (5) has one. Each is announced at
// the start ("Realm gimmick: ..."), telegraphed on the boss's turn (a log line, the Telegraph chip, marks on the heroes it will hit) and
// lands on its next turn with its effect; the i panel explains it and where it stands; answers work (Guard halves a marked hit, swapping
// grounds the rod, heavy damage or the right element stops a readied move, Scan reveals the veil); the telegraph does not touch the RNG;
// none in the Daily Trial; a few seconds of auto battle against a gimmick boss run clean. Usage: PWHTML=../../out/aurelis3.html node v095p2.js
const {open,chk,done}=require('./pw');
const PRE=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',music:0,sfx:0,gfx:'low',hints:false}}));`;
// a journey with six heroes (three in the Rearguard) at lv 30 against boss k at level 16, paused (nothing advances on its own)
const SETUP=`window.__setup=function(k,stage){const A=__A;if(!window.__began){A.ACT.new();['oren','mira','lumen'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;window.__began=1;}const G=A.G;
  ['brann','sable','gilda'].forEach(id=>{if(A.TPL[id]&&!G.party.includes(id))A.recruit(id,true);});if(!window.__keepDaily)G.daily=null;
  G.party.forEach(id=>{const c=G.roster[id];c.lv=30;A.refresh(c);c.hp=c.S.mhp;c.mp=c.S.mmp;});const s=stage==null?1:stage;
  const foes=[A.makeEnemy(A.guardianDef(k),16,{boss:true,key:k,stage:s,final:s===4})];if(s<4)G.run.bosses[s]=k;else G.run.final=k;G.stage=s;
  A.setPause(999999);A.startBattle({stage:s,kind:'boss',weather:'clear',foes});const B=A.B;B.front.concat(B.back).forEach(c=>{c.S.mhp=c.hp=5000;});B.en[0].S.mhp=B.en[0].hp=99999;A.B4.rng(()=>.5);
  B.cur=B.front[0];B.mode='cmd';B.menu='root';B.pturns=10;A.render();return B;};
  window.__heal=function(){const B=__A.B;B.front.concat(B.back).forEach(c=>{c.hp=c.S.mhp;c.st=Object.assign({},c.st);});};
  window.__turn=function(u){const B=__A.B;__A.B4.foeTurn(u);B.cur=B.front.find(c=>c.hp>0);B.mode='cmd';};`;
(async()=>{const H=await open({w:390,h:844,mobile:true,pre:PRE});const {ev,wait}=H;await ev(SETUP);
const keys=await ev(()=>Object.keys(__A.B4.GIM.def));
chk(`every Scourge and Calamity has a gimmick (${keys.length})`,keys.length===21&&['locustchoir','ironmaw','candlemoth','brinehag','hollowsun','thornwarden','drake','cinderking','hoarwyrm','ysolde','bonecolossus','queenmantis','gloomcap','ironsentinel','siren','ashwyvern','frostlich','dimmer','nidhra','hollowking','seraph'].every(k=>keys.includes(k))||keys.join(','));
const R=await ev(keys=>{const A=__A,T=A.TW.get,out={};
  for(const k of keys){const final=['dimmer','nidhra','hollowking','seraph','hollowsun'].includes(k),B=window.__setup(k,final?4:1),u=B.en[0],S=A.B4.gim(),D=S&&S.D,o={k,t:D&&D.t};out[k]=o;
    o.intro=B.log.some(l=>/Realm gimmick:/.test(typeof l==='string'?l:(l&&l.t)||''));
    const logTxt=()=>B.log.map(l=>typeof l==='string'?l:(l&&l.t)||'').join(' | ');
    if(D.t==='phase2'){u.hp=Math.round(u.S.mhp*.6);T('hurt')(u,1);o.tele=!!(u.st.g_tele)&&S.warned===1;const sk0=u.sk.map(s=>s.n).join(',');u.shield=0;u.broken=1;T('hurt')(u,Math.round(u.S.mhp*.15));
      o.land=S.done===1&&u.sk.map(s=>s.n).join(',')!==sk0&&u.shield===u.maxShield;B.uDet={ref:'e:0'};o.panel=/Realm gimmick: /.test(T('uDetHtml')());B.uDet=null;continue;}
    window.__turn(u);o.t1=!S.pend;window.__heal();if(D.t==='sac'&&D.fx==='heal')u.hp=Math.round(u.S.mhp*.5);
    window.__turn(u);o.tele=!!S.pend&&!!u.st.g_tele;o.marks=B.front.filter(c=>c.st.g_mark).length+B.front.filter(c=>c.st.g_rod).length;o.log=new RegExp(D.n).test(logTxt());
    B.uDet={ref:'e:0'};const ph=T('uDetHtml')();o.panel=ph.includes('Realm gimmick: '+D.n)&&ph.includes('Telegraphed');B.uDet=null;
    const L0=B.b4gLand||0,H0=B.b4gHits||0,n0=B.en.length,hp0=u.hp;window.__heal();
    B.front.forEach(c=>{c.guard=false;});window.__turn(u);
    o.landed=(B.b4gLand||0)>L0;o.hits=(B.b4gHits||0)-H0;
    o.fx={slot:o.hits>0,rod:o.hits>0,chill:B.front.some(c=>c.st.g_chill||c.st.stun),tide:S.lvl===1,dark:S.lvl===1,mirror:S.act&&S.act.t==='mirror'&&!!u.st.g_mirror,veil:S.act&&S.act.t==='veil'&&!!u.st.g_veil,
      wing:S.act&&S.act.t==='air'&&!!u.st.g_air&&B.front.some(c=>c.st.g_mark),
      sac:D.fx==='summon'?B.en.length>n0:D.fx==='heal'?u.hp>Math.round(u.S.mhp*.5):D.fx==='spores'?B.front.some(c=>c.st.poison):D.fx==='buff'?(D.buff||[]).every(b=>u.st[b]):false}[D.t];
    if(D.t==='wing'){const h1=B.b4gHits||0;window.__heal();window.__turn(u);o.dive=(B.b4gHits||0)>h1;}
    if(D.t==='mirror'||D.t==='veil'){const a=B.front[0],sk={id:'tm',n:'Test Bolt',k:'mag',pw:1,t:'one',el:null,mp:0,cost:1,hits:1};const d1=A.B4.calc(a,sk,u).dmg;const act=S.act;S.act=null;const d0=A.B4.calc(a,sk,u).dmg;S.act=act;o.cut=d1<d0;}
  }
  return out;},keys);
for(const k of keys){const o=R[k];console.log(JSON.stringify(o));
  chk(`${k}: the gimmick is named when the fight starts`,o.intro===true||JSON.stringify(o));
  if(o.t==='phase2'){chk(`${k}: cracks (telegraph) before half HP, then the new form with new moves and its shield back`,o.tele&&o.land||JSON.stringify(o));chk(`${k}: the i panel explains it`,o.panel===true);continue;}
  chk(`${k} (${o.t}): nothing on its first turn, a telegraph on its second (log line, Telegraph chip${o.t==='slot'||o.t==='rod'?', marked heroes':''})`,o.t1&&o.tele&&o.log&&(o.t!=='slot'&&o.t!=='rod'||o.marks>0)||JSON.stringify(o));
  chk(`${k}: the i panel names the gimmick and says it is telegraphed`,o.panel===true||JSON.stringify(o));
  chk(`${k}: it lands on the next turn with its effect`,o.landed&&o.fx===true||JSON.stringify(o));
  if(o.t==='wing')chk(`${k}: then dives at the marked spot`,o.dive===true||JSON.stringify(o));
  if(o.t==='mirror'||o.t==='veil')chk(`${k}: magic deals less while it is up`,o.cut===true||JSON.stringify(o));}
// answers: Guard halves a marked hit; the rod grounds when its hero steps back; heavy damage stops a readied move; an element stops one; Scan reveals
const Q=await ev(()=>{const A=__A,T=A.TW.get,o={};
  let B=window.__setup('cinderking',1),u=B.en[0],S=A.B4.gim();window.__turn(u);window.__turn(u);const sl=S.pend.slots[0],c=B.front[sl];window.__heal();c.guard=true;const h0=B.b4gHits||0;window.__turn(u);o.guarded=(B.b4gHits||0)-h0;
  B=window.__setup('cinderking',1);u=B.en[0];S=A.B4.gim();window.__turn(u);window.__turn(u);const c2=B.front[S.pend.slots[0]];window.__heal();c2.guard=false;const h2=B.b4gHits||0;window.__turn(u);o.open=(B.b4gHits||0)-h2;o.burn=!!c2.st.burn;
  B=window.__setup('ysolde',1);u=B.en[0];S=A.B4.gim();window.__turn(u);window.__turn(u);const rid=S.pend.id,ri=B.front.findIndex(x=>x.id===rid);B.cur=B.front.find(x=>x.id!==rid);B.mode='cmd';
  B.b4swT=null;B.pturns=20;o.swap=A.B4.freeSwap(ri,0);const H0=B.b4gHits||0;window.__heal();window.__turn(u);o.grounded=(B.b4gHits||0)===H0;
  B=window.__setup('queenmantis',1);u=B.en[0];S=A.B4.gim();window.__turn(u);window.__turn(u);u.hp-=Math.ceil(u.S.mhp*.08);const n0=B.en.length;window.__turn(u);o.stopped=B.en.length===n0&&(B.b4gStop||0)>0;
  B=window.__setup('ironsentinel',1);u=B.en[0];S=A.B4.gim();window.__turn(u);window.__turn(u);const a=B.front[0];B.cur=a;A.perform(a,{id:'tw',n:'Test Wave',k:'mag',pw:.2,t:'one',el:'water',mp:0,cost:1,hits:1},[u]);o.elStop=S.pend&&S.pend.stop===1;window.__turn(u);o.noBuff=!u.st.might;
  B=window.__setup('frostlich',1);u=B.en[0];S=A.B4.gim();window.__turn(u);window.__turn(u);window.__turn(u);const veil=S.act&&S.act.t==='veil';B.cur=B.front[0];B.mode='cmd';T('scan')(u);o.revealed=veil&&!S.act&&!u.st.g_veil;
  // the telegraph does not use the battle RNG
  B=window.__setup('seraph',4);u=B.en[0];S=A.B4.gim();u.turns=1;let n=0;A.B4.rng(()=>{n++;return .5;});A.B4.gimTurn(u);o.rngCalls=n;o.slots=S.pend&&S.pend.slots.join(',');
  B=window.__setup('seraph',4);u=B.en[0];S=A.B4.gim();u.turns=1;A.B4.gimTurn(u);o.slots2=S.pend&&S.pend.slots.join(',');
  // the Daily Trial: no gimmick
  A.G.daily={key:'test'};window.__keepDaily=1;B=window.__setup('cinderking',1);o.daily=A.B4.gim();window.__keepDaily=0;A.G.daily=null;
  return o;});
console.log(JSON.stringify(Q));
chk(`Guard halves a marked hit (${Q.guarded} against ${Q.open}) and keeps its Burn off`,Q.guarded>0&&Q.guarded<=Math.ceil(Q.open/2)+1&&Q.open>0&&Q.burn===true||JSON.stringify(Q));
chk('the lightning rod grounds when its hero steps back (free swap)',Q.swap===true&&Q.grounded===true||JSON.stringify(Q));
chk('heavy damage bursts the egg sac before it hatches',Q.stopped===true||JSON.stringify(Q));
chk('a Water hit cools the Iron Sentinel: no overclock',Q.elStop===true&&Q.noBuff===true||JSON.stringify(Q));
chk('a Scan reveals the veiled Lich',Q.revealed===true||JSON.stringify(Q));
chk(`the telegraph uses no battle RNG and is the same every time (spots ${Q.slots} and ${Q.slots2})`,Q.rngCalls===0&&Q.slots&&Q.slots===Q.slots2||JSON.stringify(Q));
chk('no gimmick in the Daily Trial',Q.daily==null||JSON.stringify(Q.daily));
// the screen: the boss chip and the hero marks render; a few seconds of auto battle against a gimmick boss
const S2=await ev(async()=>{const A=__A,B=window.__setup('cinderking',1),u=B.en[0];window.__turn(u);window.__turn(u);A.render();const html=document.getElementById('app').innerHTML;
  const o={chip:/data-st="g_tele"|Telegraph/.test(html),mark:/data-st="g_mark"|Marked/.test(html)};
  B.en[0].S.mhp=B.en[0].hp=4000;A.G.bossWon=A.G.bossWon||{};A.G.bossWon[A.TW.get('bossFightKey')(B.spec)]=1;A.setPause(60);A.V.auto=true;B.auto=true;A.B4.rng(Math.random);B.mode='wait';A.TW.get('advance')();await new Promise(r=>setTimeout(r,6000));
  o.turns=u.turns;o.tells=B.b4gTells||0;o.over=B.over;A.setPause(999999);return o;});
console.log(JSON.stringify(S2));
chk('the Telegraph chip and the hero mark are drawn on the battle screen',S2.chip&&S2.mark||JSON.stringify(S2));
chk(`auto battle runs against a gimmick boss (boss turns ${S2.turns}, telegraphs ${S2.tells})`,S2.turns>=3&&(S2.tells>=2||S2.over&&S2.tells>=1)||JSON.stringify(S2));
await done(H);})();
