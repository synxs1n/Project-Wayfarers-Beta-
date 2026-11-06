// ===== battle4.js (v0.7.0): battle mechanics: detonation MP refund, free swap, Momentum, foe roles, the boss Cataclysm =====
// 1) Detonation reward: the hero who sets off a reaction gets MP back, shown in the floating reaction text ("+N MP").
// 2) Free swap: on a hero's turn another Vanguard hero can trade places with a Rearguard hero without using the turn, once every
//    B4.swap.cd party turns. Rooted heroes cannot step back. Auto battle uses it only where its own switch rules say it helps.
// 3) Momentum (v0.9.4, simpler): different moves fill the gauge, repeating a move or only attacking drains it. Full: a Surge (heroes deal
//    more, take less). Empty: Drained (a light penalty). Shown in the log ticker; tap it for the rule in the log.
// 4) Foe roles (Shieldbearer, Hexer, Charger, Leech, Skirmisher): each punishes one mistake. Data in B4.roleOf (config.js), a role
//    field on the monster; the role line shows on Scan and in the Bestiary.
//    Intents (battle5.js): b4RolePlan(u) says, without touching the RNG, what the role makes the foe do on its next turn (null =
//    its usual move). With battle5.js loaded, foePlan (what the intents show) carries the role move too, and the outer enemyTurn0
//    wrapper below executes it from that same plan,
//    so a plan read in advance is what happens, unless the fight changes first (a hero guards, swaps, cleanses, stuns or strips it).
// Every tunable lives in B4 (config.js). Nothing here reads the clock for game logic or calls Math.random: the Daily Trial stays
// deterministic. New fields are battle-only (B.b4mo, B.b4swT, B.b4line, u.role, u.b4slot, u.st.hex, u.st.charge); nothing is saved.

// ----- on / off -----
function b4On(k){if(!B||B4.off||!B4[k]||!B4[k].on)return false;if(B.spec&&B.spec.kind==='daily'&&!B4.daily[k])return false;return true;}
function b4RolesAllowed(){return !B4.off&&B4.roles.on&&!(G&&G.daily&&!B4.daily.roles);}

// ----- statuses: Hex (on heroes, stacks) and Winding up (on a Charger) -----
STS.hex={n:'Hex',a:'HEX',bad:1,t:99,c:'#c45ad8',d:'Deals 8% less damage per stack. At 3 stacks the next Hex bursts for 30% of max HP. A cleanse, a Remedy or stepping back clears it.'};
STS.charge={n:'Winding up',a:'CHG',t:2,c:'#ff9a3a',d:'Its next turn is a Crushing Charge at one hero. Guard halves it; a stun or stripping its boons stops it.'};
ST_SYM.hex='<path d="M5 .6 6.2 3.2 9.2 3.5 7 5.6 7.6 8.6 5 7.1 2.4 8.6 3 5.6.8 3.5 3.8 3.2Z" fill="none" stroke="currentColor" stroke-width="1.3"/><circle cx="5" cy="5" r="1.2"/>';
ST_SYM.charge='<path d="M1 2.2h2.2L6.4 5 3.2 7.8H1L4.2 5ZM5.2 1h1.6v8H5.2ZM7.6 1H9v8H7.6Z"/>';
const b4Hex=c=>(c&&c.st&&c.st.hex&&c.st.hex.v)||0;

// ----- 1) detonation reward -----
function b4DetGain(a){const D=B4.det;return Math.max(D.mpMin,Math.round(((a.S&&a.S.mmp)||0)*D.mpPct));}
{const dr0=doReaction;doReaction=function(a,t,el){const R=dr0.apply(this,arguments);
  try{if(R&&a&&a.side==='p'&&b4On('det')){const act=B.actN||0;if(B.b4detAct!==act){B.b4detAct=act;B.b4detK=0;}
    if(B.b4detK<B4.det.maxPerAct){B.b4detK++;const n=Math.min(b4DetGain(a),Math.max(0,a.S.mmp-a.mp));a.mp+=n;B.b4det=(B.b4det||0)+1;B.b4detMp=(B.b4detMp||0)+n;
      if(t&&t.fx)for(let i=t.fx.length-1;i>=0;i--){const f=t.fx[i];if(f.cls==='react'&&f.txt===R.n){f.txt=R.n+' +'+n+' MP';f.b4mp=n;break;}}
      log(`${a.name} draws ${n} MP from the blast.`);}}}catch(e){}
  return R;};}

// ----- 3) momentum: the kind of an action, the gauge, its effect -----
function b4Sig(sk){if(!sk)return 'atk';if(sk.limit)return 'limit';if(sk.id==='attack')return 'atk';if(sk.k==='heal'||sk.k==='revive'||sk.k==='mpself')return 'heal';
  if(sk.k==='phys'||sk.k==='mag')return 'd:'+(skEls(sk)[0]||'-')+':'+sk.k+':'+(sk.t==='all'||sk.t==='rand'?'all':'one');return 'sup:'+((sk.fx&&sk.fx[0]&&sk.fx[0][0])||sk.k);}
function b4MoS(){return B.b4mo||(B.b4mo={m:B4.mo.start,last:null,full:0,empty:0,offRun:0,n:0,hist:[]});}
// v0.9.4: states are build (in between), full (Surge, a bonus) and empty (Drained, a penalty)
function b4MoState(){if(!b4On('mo'))return 'off';const S=b4MoS();return S.full?'full':S.empty?'empty':'build';}
const b4Off=sig=>sig==='atk'||sig==='limit'||/^d:/.test(sig||'');
function b4MoAct(sig){const S=b4MoS(),M=B4.mo,m0=S.m,off=b4Off(sig);let m=m0;
  S.offRun=off?(S.offRun||0)+1:0;
  if(sig===S.last)m-=M.rep;                         // the same kind of move again
  else if(off&&S.offRun>M.offN)m-=M.off;            // only attacking for too long
  else m+=M.vary;                                   // something different
  m=Math.max(0,Math.min(M.max,m));S.m=m;S.last=sig;S.n++;
  if(m>=M.max&&!S.full){S.full=1;S.empty=0;log(`Momentum Surge: heroes deal ${Math.round(M.dmg*100)}% more and take ${Math.round(M.taken*100)}% less.`);}
  else if(S.full&&m<M.fullOff){S.full=0;log('The Surge fades.');}
  if(m<=0&&!S.empty){S.empty=1;S.full=0;log(`Momentum drained: heroes deal ${Math.round(M.pen*100)}% less and take ${Math.round(M.pen*100)}% more. Mix up your moves.`);}
  else if(S.empty&&m>M.emptyOff){S.empty=0;log('Momentum recovers.');}
  S.hist.push([sig,m0,m]);if(S.hist.length>40)S.hist.shift();}
// every hero action: momentum, and how long the same three heroes have stood in the Vanguard (the Skirmisher reads it)
function b4PartyAct(a,sig){if(!B||!a||a.side!=='p')return;
  const key=B.front.map(c=>c.id).join(',');if(key!==B.b4line){B.b4line=key;B.b4lineN=1;}else B.b4lineN=(B.b4lineN||0)+1;
  if(b4On('mo'))b4MoAct(sig);}
{const ex0=exec;exec=function(sk,tgts){const a=B&&B.cur,sig=b4Sig(sk);const r=ex0.apply(this,arguments);try{b4PartyAct(a,sig);}catch(e){}return r;};}
{const ui0=useItem;useItem=function(id,t){const a=B&&B.cur,n0=G&&G.inv?G.inv[id]||0:0;const r=ui0.apply(this,arguments);try{if(G&&G.inv&&(G.inv[id]||0)<n0)b4PartyAct(a,'item');}catch(e){}return r;};}
{const gu0=guard;guard=function(){const a=B&&B.cur;const r=gu0.apply(this,arguments);try{b4PartyAct(a,'guard');}catch(e){}return r;};}
{const sc0=scan;scan=function(t){const a=B&&B.cur;const r=sc0.apply(this,arguments);try{b4PartyAct(a,'scan');const ln=b4RoleLine(t);if(ln){log('Role: '+ln);if(typeof render==='function')render();}}catch(e){}return r;};}

// ----- 2) free swap -----
function b4FreeLeft(){if(!b4On('swap'))return 99;const s=B.b4swT;return s==null?0:Math.max(0,B4.swap.cd-((B.pturns||0)-s));}
function b4FreeReady(){return !!B&&b4On('swap')&&B.mode==='cmd'&&b4FreeLeft()===0&&B.back.some(c=>c.hp>0);}
function b4CanOut(c){return !!c&&!!B&&c!==B.cur&&B.front.includes(c)&&!has(c,'root');}
function b4FreeSwap(fi,bi){if(!B||B.over||B.mode!=='cmd')return false;const out=B.front[fi],inn=B.back[bi];
  if(!out||!inn||inn.hp<=0||!b4CanOut(out)||!b4FreeReady())return false;
  B.front[fi]=inn;B.back[bi]=out;out.st={};out.guard=false;out.kindle=0;out.primed=null;inn.guard=false;
  inn.next=Math.max(B.time,out.hp>0&&out.next!=null?out.next:B.time);inn.enterT=Date.now();inn.swapInT=B.pturns||0;
  B.b4swT=B.pturns||0;B.b4swN=(B.b4swN||0)+1;B.menu='root';B.b4out=null;
  log(`Free swap: ${out.name} falls back and ${inn.name} steps in. ${B.cur.name} keeps the turn.`);fx(inn,'Swap in','stat good');
  try{render();}catch(e){}return true;}
// auto: the same switch rules as before (autoSwitchPick), now also for the other Vanguard heroes through the free swap, but only the
// rules in B4.swap.autoWhy (a hurt or ailing hero falls back, a healer comes in for a hurting line)
function b4AutoFree(){if(!b4FreeReady()||!B.auto)return false;
  for(const h of B.front.slice()){if(h===B.cur||h.hp<=0||!b4CanOut(h))continue;const o=autoSwitchPick(h);if(!o||!B4.swap.autoWhy.includes(o.why))continue;
    B.autoSwapT=B.pturns||0;B.autoSwaps=(B.autoSwaps||0)+1;const ok=b4FreeSwap(B.front.indexOf(h),B.back.indexOf(o.inn));if(ok){log(`Auto: ${h.name} steps back (${o.why}), free swap.`);return true;}}
  return false;}
// a Rearguard card or the Switch command is open while a free swap is ready, even when the acting hero is rooted
{const cs0=canSwap;canSwap=function(){if(cs0.apply(this,arguments))return true;try{return b4FreeReady()&&B.front.some(c=>c.hp>0&&b4CanOut(c));}catch(e){return false;}};}

// ----- 4) foe roles -----
const B4ROLE={guard:'Shieldbearer',hex:'Hexer',charge:'Charger',leech:'Leech',flank:'Skirmisher',boss:'Gathers power'};
function b4RoleOfMon(m){if(!m)return null;if(m.role)return m.role;let k=m.art,d=m,g=0;while(d&&g++<4){if(B4.roleOf[k])return B4.roleOf[k];if(!d.base||!(d.variant||d.night))break;k=d.base;d=MON[k];}return null;}
// the role field on every monster (realm, night and overlay variants inherit their base's role; minibosses and rivals do not)
Object.keys(MON).forEach(k=>{const m=MON[k];if(m&&!m.role){const r=b4RoleOfMon(m);if(r)m.role=r;}});
function b4Role(u){if(!u||u.side!=='e'||!b4On('roles'))return null;if(u.boss)return B4.roles.boss&&B4.roles.boss.on?'boss':null;return u.role||null;}
function b4RoleLine(u){const r=u&&(u.boss?(B4.roles.boss&&B4.roles.boss.on?'boss':null):(u.role||b4RoleOfMon(u)));if(!r)return '';const R=B4.roles,p=x=>Math.round(x*100)+'%';
  return {guard:`Shieldbearer. While its shield holds, its allies take ${p(R.cover)} less damage. Break the shield first (weak hits, reactions).`,
    hex:`Hexer. Every other turn it lays a Hex on a hero (${p(R.hexDmg)} less damage per stack); at ${R.hexMax} the next one bursts for ${p(R.doom)} of max HP. Cleanse it or swap that hero out.`,
    charge:`Charger. Every ${R.chargeEvery} turns it winds up, then hits that hero very hard next turn. Guard halves it; a stun stops it.`,
    leech:`Leech. Every ${R.leechEvery===2?'other':R.leechEvery} turn it drains every Vanguard hero who is not guarding and heals from each. Burst it down or Guard.`,
    boss:`Every ${R.boss.every}th turn it gathers power, then strikes your whole Vanguard next turn. Guard halves it for each hero who guards.`,
    flank:`Skirmisher. Once the same three heroes have stood in the Vanguard for ${R.flankAt} actions, it strikes the weakest from the flank. Swap to break it up.`}[r]||'';}
{const me0=makeEnemy;makeEnemy=function(m,lv,opt){const e=me0.apply(this,arguments);
  try{const r=b4RoleOfMon(m);if(r&&e&&!e.boss&&b4RolesAllowed()){e.role=r;if(r==='guard'&&!e.maxShield){e.maxShield=B4.roles.pips;e.shield=e.maxShield;e.broken=0;}}}catch(x){}return e;};}
// what the role makes this foe do on its next turn (null: its usual move). Deterministic: no RNG, no clock.
function b4RolePlan(u){const r=b4Role(u);if(!r||!B||u.hp<=0)return null;const R=B4.roles,live=B.front.filter(c=>c.hp>0);if(!live.length)return null;const n=(u.turns||0)+1;
  const ix=c=>B.front.indexOf(c),taunt=live.find(c=>has(c,'taunt'));
  const weakest=()=>taunt||live.slice().sort((x,y)=>x.hp/x.S.mhp-y.hp/y.S.mhp||ix(x)-ix(y))[0];
  if(r==='charge'){if(has(u,'charge')){const t=B.front[u.b4slot];return {role:r,kind:'unleash',n:'Crushing Charge',tg:[taunt||(t&&t.hp>0?t:weakest())]};}
    return n%R.chargeEvery===0?{role:r,kind:'windup',n:'Wind up',tg:[weakest()]}:null;}
  if(r==='hex'){if(n%2!==1)return null;const t=live.slice().sort((x,y)=>b4Hex(y)-b4Hex(x)||ix(x)-ix(y))[0];const doom=b4Hex(t)>=R.hexMax;return {role:r,kind:doom?'doom':'hex',n:doom?'Doom':'Hex',tg:[t]};}
  if(r==='leech')return n%R.leechEvery===0?{role:r,kind:'siphon',n:'Siphon',tg:live.filter(c=>!c.guard)}:null;
  if(r==='boss'){if(has(u,'charge'))return {role:r,kind:'cataclysm',n:'Cataclysm',tg:live};return n%R.boss.every===0?{role:r,kind:'gather',n:'Gather power',tg:live}:null;}
  if(r==='flank')return (B.b4lineN||0)>=R.flankAt?{role:r,kind:'flank',n:'Flanking Strike',tg:[weakest()]}:null;
  return null;}
function b4RoleDo(u,P){const live=B.front.filter(c=>c.hp>0);if(!live.length)return false;const R=B4.roles,el=(u.el&&u.el[0])||null,now=Date.now();
  u.turns++;B.b4roles=B.b4roles||{};B.b4roles[P.kind]=(B.b4roles[P.kind]||0)+1;
  if(P.kind==='windup'){const t=P.tg[0];u.st.charge={t:2};u.b4slot=B.front.indexOf(t);u.actT=now;u.buffT=now;fx(u,'Winding up!','stat bad');log(`${u.name} winds up a Crushing Charge at ${t.name}! Guard halves it.`);}
  else if(P.kind==='gather'){u.st.charge={t:2};u.actT=now;u.buffT=now;fx(u,'Gathering power!','stat bad');log(`${u.name} gathers power for a Cataclysm! Guard to halve it.`);}
  else if(P.kind==='cataclysm'){delete u.st.charge;perform(u,{id:'b4cata',n:'Cataclysm',k:'mag',pw:R.boss.pw,t:'all',el,hits:1,cost:1,mp:0},B.front.filter(c=>c.hp>0));}
  else if(P.kind==='unleash'){delete u.st.charge;u.b4slot=null;perform(u,{id:'b4charge',n:'Crushing Charge',k:'phys',pw:R.chargePw,t:'one',el,hits:1,cost:1,mp:0},P.tg);}
  else if(P.kind==='hex'||P.kind==='doom'){const t=P.tg[0];u.actT=now;u.actKind='mag';u.actEl='shadow';
    if(P.kind==='doom'){delete t.st.hex;const d=Math.max(1,Math.round(t.S.mhp*R.doom));t.fxEl='shadow';t.fxT=now;fx(t,String(d),'dmg');log(`The Hex on ${t.name} bursts for ${d}!`);hurt(t,d);}
    else{const v=b4Hex(t)+1;t.st.hex={t:99,v};fx(t,'Hex '+v,'stat bad');log(`${u.name} lays a Hex on ${t.name} (${v} of ${R.hexMax}).`);}}
  else if(P.kind==='siphon'){const tg=live.filter(c=>!c.guard);
    if(!tg.length){u.actT=now;fx(u,'No opening','stat');log(`${u.name} reaches for the Vanguard, but every hero is guarding.`);}
    else{const h0=tg.map(c=>c.hp);perform(u,{id:'b4siphon',n:'Siphon',k:'mag',pw:R.leechPw,t:'all',el,hits:1,cost:1,mp:0},tg);
      const hit=tg.filter((c,i)=>c.hp<h0[i]).length,n=Math.min(u.S.mhp-u.hp,Math.round(u.S.mhp*R.leechHeal*hit));
      if(n>0&&u.hp>0){u.hp+=n;fx(u,'+'+n,'heal');log(`${u.name} drinks ${n} HP from the crowded Vanguard.`);}}}
  else if(P.kind==='flank'){log(`${u.name} slips around the unchanged Vanguard!`);perform(u,{id:'b4flank',n:'Flanking Strike',k:'phys',pw:R.flankPw,t:'one',el,hits:1,cost:1,mp:0},P.tg);}
  endTurn(u,1);return true;}
// the foe's action choice: a role move from the plan, otherwise its usual move
// the role move as a skill, for the intents (battle5.js foePlan / b5Cat read sk.k, sk.t, sk.pw and sk.fx)
function b4RoleSk(P,u){const R=B4.roles,el=(u&&u.el&&u.el[0])||null;
  return {windup:{id:'b4wind',n:'Wind up',k:'buff',t:'self',pw:0,fx:[['charge',1]]},gather:{id:'b4gather',n:'Gather power',k:'buff',t:'self',pw:0,fx:[['charge',1]]},
    unleash:{id:'b4charge',n:'Crushing Charge',k:'phys',pw:R.chargePw,t:'one',el},hex:{id:'b4hex',n:'Hex',k:'mag',pw:0,t:'one',fx:[['hex',1]]},
    doom:{id:'b4doom',n:'Doom',k:'mag',pw:9,t:'one'},siphon:{id:'b4siphon',n:'Siphon',k:'mag',pw:R.leechPw,t:'all',el},
    flank:{id:'b4flank',n:'Flanking Strike',k:'phys',pw:R.flankPw,t:'one',el},cataclysm:{id:'b4cata',n:'Cataclysm',k:'mag',pw:R.boss.pw,t:'all',el}}[P.kind]||null;}
// battle5.js plans every foe's next action in advance (foePlan) and its enemyTurn0 executes that plan. The role move is folded into the
// plan the intents read (recomputed on every call, so it follows guards, swaps and cleanses), and executed by the outer enemyTurn0
// wrapper below from the same b4RolePlan. Both hooks are (re)installed at load and again at every battle start, so this works whether
// battle5.js loads before or after this file (battle5.js replaces enemyTurn0 outright when it runs).
function b4HookPlan(){if(typeof foePlan!=='function'||foePlan.__b4)return;const fp0=foePlan;
  foePlan=function(u){const p=fp0.apply(this,arguments);try{const P=p&&b4RolePlan(u),sk=P&&b4RoleSk(P,u);if(sk)return Object.assign({},p,{sk,cat:typeof b5Cat==='function'?b5Cat(sk):p.cat,b4:P});}catch(e){}return p;};foePlan.__b4=1;}
function b4HookTurn(){if(enemyTurn0.__b4)return;const et0=enemyTurn0;
  enemyTurn0=function(u){try{if(B&&!B.over&&u&&u.hp>0&&b4Role(u)){const P=b4RolePlan(u);if(P){let tr=null;
        try{if(typeof B5R!=='undefined'&&B5R.trace){const sk=b4RoleSk(P,u),cat=typeof b5Cat==='function'?b5Cat(sk):P.kind;tr={foe:u.name,turn:(u.turns||0)+1,plan:cat,did:cat,sk:sk.n,shown:typeof b5Shown==='function'?b5Shown(u):null,known:typeof b5Knows==='function'?b5Knows(u):false,role:P.kind};}}catch(_){}
        if(b4RoleDo(u,P)){if(tr){B5R.trace.push(tr);if(B5R.trace.length>400)B5R.trace.shift();}return;}}}}
    catch(e){try{wdLog('b4 role: '+(e&&e.message||e),u);}catch(_){}}
    return et0.apply(this,arguments);};enemyTurn0.__b4=1;}
b4HookPlan();b4HookTurn();
// damage: momentum, Hex, Shieldbearer cover
{const cd0=calcDamage;calcDamage=function(a,sk,t){const r=cd0.apply(this,arguments);
  try{if(!B||!r||!r.dmg||!a||!t)return r;let m=1;
    if(b4On('mo')&&(a.side==='p'||t.side==='p')){const s=b4MoState(),M=B4.mo;if(s==='full')m*=a.side==='p'?1+M.dmg:1-M.taken;else if(s==='empty')m*=a.side==='p'?1-M.pen:1+M.pen;}
    if(a.side==='p'&&b4Hex(a))m*=Math.max(.5,1-B4.roles.hexDmg*b4Hex(a));
    if(a.side==='p'&&t.side==='e'&&t.hp>0&&b4Role(t)!=='guard'&&b4On('roles')){const sb=B.en.find(e=>e!==t&&e.hp>0&&b4Role(e)==='guard'&&e.shield>0&&!e.broken);
      if(sb){m*=1-B4.roles.cover;if(B.b4covAct!==B.actN){B.b4covAct=B.actN;fx(t,'Covered','stat');log(`${sb.name}'s shield covers ${t.name}.`);}}}
    if(m!==1)r.dmg=Math.max(1,Math.round(r.dmg*m));}catch(e){}
  return r;};}

// ----- smart play for the sims (SIM_SMART, the "careful player" yardstick): reads roles, guards telegraphs, swaps, varies -----
function b4Smart(){const a=B.cur;if(!a||a.side!=='p')return false;const foes=B.en.filter(e=>e.hp>0),fr=B.front.filter(c=>c.hp>0);if(!foes.length)return false;
  const R=B4.roles,ratio=c=>c.hp/c.S.mhp,ks=known(a).filter(s=>a.mp>=(s.mp||0));
  if(b4FreeReady()){const others=fr.filter(c=>c!==a&&b4CanOut(c)),bench=B.back.filter(c=>c.hp>0&&ratio(c)>.5).sort((x,y)=>ratio(y)-ratio(x));
    const ch=foes.find(e=>b4Role(e)==='charge'&&has(e,'charge')),ct=ch&&B.front[ch.b4slot];
    const out=others.find(c=>b4Hex(c)>=2)||(ct&&others.includes(ct)&&ratio(ct)<.7?ct:null)||(foes.some(e=>b4Role(e)==='flank')&&(B.b4lineN||0)>=R.flankAt-2?others.slice().sort((x,y)=>ratio(x)-ratio(y))[0]:null);
    if(out&&bench[0])b4FreeSwap(B.front.indexOf(out),B.back.indexOf(bench[0]));else b4AutoFree();}
  // a Crushing Charge or a Cataclysm comes at this hero before its next turn and would hurt (over 40% of its HP): Guard
  const ch=foes.find(e=>has(e,'charge')&&(b4Role(e)==='boss'||b4Role(e)==='charge'&&B.front[e.b4slot]===a));
  if(ch&&ch.next<=B.time+delayOf(a,.6)){const boss=b4Role(ch)==='boss',est=calcDamage(ch,{id:'b4est',k:boss?'mag':'phys',pw:boss?R.boss.pw:R.chargePw,t:boss?'all':'one',el:(ch.el||[])[0]||null},a).dmg;
    if(est>a.hp*.4){guard();return true;}}
  // a Hex at 2 or more: cleanse it
  const hexed=fr.filter(c=>b4Hex(c)>=2).sort((x,y)=>b4Hex(y)-b4Hex(x));
  if(hexed.length){const pur=ks.find(s=>s.cleanse&&s.t==='ally')||ks.find(s=>s.cleanse&&s.t==='allyAll');if(pur){exec(pur,pur.t==='allyAll'?fr:[hexed[0]]);return true;}
    if(b4Hex(hexed[0])>=R.hexMax&&G.inv&&G.inv.remedy>0){useItem('remedy',hexed[0]);return true;}}
  if(fr.some(c=>ratio(c)<.5))return false;// heals first (the base brain)
  const dmg=ks.filter(s=>(s.k==='phys'||s.k==='mag')&&!s.limit&&!s.steal&&s.t!=='self');
  // break a Shieldbearer's shield with a weak hit while it covers others
  const sb=foes.find(e=>b4Role(e)==='guard'&&e.shield>0&&!e.broken)&&foes.length>1?foes.find(e=>b4Role(e)==='guard'&&e.shield>0&&!e.broken):null;
  if(sb){const s=dmg.filter(s=>bestMult(s,sb,a)>1).sort((x,y)=>y.pw*(y.hits||1)-x.pw*(x.hits||1))[0];if(s){exec(s,s.t==='all'||s.t==='rand'?foes:[sb]);return true;}}
  // a Leech: burst it
  const lc=foes.find(e=>b4Role(e)==='leech');
  if(lc&&foes.length>1){const s=dmg.filter(s=>s.t==='one').sort((x,y)=>y.pw*(y.hits||1)*bestMult(y,lc,a)-x.pw*(x.hits||1)*bestMult(x,lc,a))[0];if(s&&s.pw*bestMult(s,lc,a)>=1.1){exec(s,[lc]);return true;}}
  // momentum running hot: a different kind of action than the party's last
  const st=b4MoState(),MS=b4MoS();if(st!=='off'&&(MS.offRun>=B4.mo.offN||st==='empty'||MS.last==='atk')){const last=MS.last,opts=dmg.concat([ATTACK]).filter(s=>b4Sig(s)!==last);
    if(opts.length){let best=null,bv=0,bt=null;opts.forEach(s=>{const t=foes.slice().sort((x,y)=>bestMult(s,y,a)-bestMult(s,x,a)||x.hp-y.hp)[0];const v=s.pw*(s.hits||1)*bestMult(s,t,a)*(s.t==='all'?Math.min(3,foes.length)*.7:1);if(v>bv){bv=v;best=s;bt=t;}});
      if(best&&st==='over'||best&&b4Sig(best)!=='atk'){exec(best,best.t==='all'||best.t==='rand'?foes:[bt]);return true;}}}
  return false;}
{const ats0=autoTurnSmart;autoTurnSmart=function(){try{if(B&&!B.over&&B.mode==='cmd'&&B.auto){if(SIM_SMART&&b4Smart())return;if(B&&B.mode==='cmd')b4AutoFree();}}catch(e){}
  if(!B||B.over||B.mode!=='cmd')return;return ats0.apply(this,arguments);};}

// ----- start of battle -----
{const sb0=startBattle;startBattle=function(){try{b4HookPlan();b4HookTurn();}catch(e){}const r=sb0.apply(this,arguments);try{if(r!==false&&B){B.b4mo=null;if(b4On('mo'))b4MoS();
  const roles=[...new Set(B.en.filter(e=>b4Role(e)).map(e=>e.role))];if(roles.length)B.b4seen=roles;}}catch(e){}return r;};}

// ----- UI: the momentum gauge in the log ticker under the stage -----
function b4MoHtml(){const S=b4MoS(),M=B4.mo,st=b4MoState(),pc=v=>Math.round(100*v/M.max);
  const lab={build:'',full:'Surge +'+Math.round(M.dmg*100)+'%',empty:'Drained'}[st]||'';
  return `<span class="b4mt"><b>Momentum</b><em>${lab}</em></span><span class="b4bar"><i class="v" style="width:${pc(S.m)}%"></i></span>`;}
function b4MoLabel(){const S=b4MoS(),M=B4.mo,st=b4MoState(),p=x=>Math.round(x*100)+'%';
  return `Momentum ${Math.round(S.m)} of ${M.max}: `+{build:`different moves fill it, repeating a move or only attacking drains it. Full: a Surge (heroes deal ${p(M.dmg)} more, take ${p(M.taken)} less). Empty: Drained (deal ${p(M.pen)} less, take ${p(M.pen)} more).`,full:`Surge: heroes deal ${p(M.dmg)} more and take ${p(M.taken)} less while it stays above ${M.fullOff}.`,empty:`Drained: heroes deal ${p(M.pen)} less and take ${p(M.pen)} more until it climbs above ${M.emptyOff}. Mix up your moves.`}[st];}
function b4MoDraw(){const bl=document.getElementById('bline');if(!bl)return;let el=document.getElementById('b4mo');
  if(!B||!b4On('mo')){if(el)el.remove();return;}
  if(!el){el=document.createElement('button');el.id='b4mo';el.type='button';el.dataset.act='b4mo';bl.insertBefore(el,bl.firstChild);}
  const st=b4MoState(),h=b4MoHtml(),lab=b4MoLabel();if(el.dataset.h!==h){el.dataset.h=h;el.innerHTML=h;el.className='b4mo '+st;el.setAttribute('aria-label',lab);el.title=lab;}}
{const rb0=renderBattle;renderBattle=function(stageOnly){const r=rb0.apply(this,arguments);try{if(!stageOnly)b4MoDraw();}catch(e){}return r;};}
ACT.b4mo=function(){if(!B||!b4On('mo'))return;log(b4MoLabel());render();};

// ----- UI: the switch menu (who steps back, then who comes in) -----
function b4SwapBody(a){const fr=B.front,ready=b4FreeReady(),left=b4FreeLeft(),cd=B4.swap.cd;
  if(B.b4out!=null&&!(fr[B.b4out]===a?!has(a,'root'):b4CanOut(fr[B.b4out])&&ready))B.b4out=null;
  if(B.b4out==null)B.b4out=!has(a,'root')?fr.indexOf(a):fr.findIndex(c=>c.hp>0&&b4CanOut(c)&&ready);
  const sel=B.b4out>=0?fr[B.b4out]:null,self=sel===a;
  const row=`<div class="b4out" role="group" aria-label="Who steps back"><span class="b4ol">Steps back</span>${fr.map((c,i)=>{const me=c===a,dis=me?has(c,'root'):(c.hp<=0||has(c,'root')||!ready);
    return `<button class="mi b4o ${c===sel?'on':''}" data-act="b4out" data-arg="${i}" ${dis?'disabled':''} aria-pressed="${c===sel}"><span class="n">${esc(c.name)}</span><small>${has(c,'root')?'Rooted':me?'Uses this turn':ready?'Free':'Free in '+left}</small></button>`;}).join('')}</div>`;
  const hint=!sel?`<p class="hint">Nobody can step back right now.</p>`:self?`<p class="hint">Who takes ${esc(a.name)}'s place? They act right away. ${esc(a.name)}'s ailments, buffs and mark are cleared.</p>`
    :`<p class="hint"><b>Free swap:</b> ${esc(sel.name)} steps back (ailments, buffs and mark cleared) and the newcomer takes that place. ${esc(a.name)} keeps this turn. One free swap every ${cd} party turns.</p>`;
  const list=sel?`<div class="menu list">${B.back.map((c,i)=>`<button class="mi" data-act="sw" data-arg="${i}" ${c.hp>0?'':'disabled'}><span class="n">${port(c.id,'sm')}${esc(c.name)}</span><span class="m">${c.hp}/${c.S.mhp}</span><small>Lv ${c.lv} ${CLS[TPL[c.id].cls].n} ${c.el.map(ico).join('')}</small></button>`).join('')}</div>`:'';
  return row+hint+list;}
{const ch0=cmdHtml;cmdHtml=function(){let h=ch0.apply(this,arguments);
  try{if(B&&!B.auto&&!B.over&&B.mode==='cmd'&&B.cur){if(B.menu!=='swap')B.b4out=null;
    if(B.menu==='swap'&&b4On('swap')){const i=h.indexOf('<p class="hint">Who takes');if(i>=0)h=h.slice(0,i)+b4SwapBody(B.cur);}
    else if(B.menu==='root'&&b4FreeReady()){if(has(B.cur,'root')&&canSwap())h=h.replace(/title="Rooted: cannot switch out">Rooted<\/button>/,'title="Free swap: another Vanguard hero can step back">Switch</button>');
      h=h.replace(/(data-arg="swap"[^>]*title=")([^"]*)(")/,'$1$2 (a free swap is ready)$3');}}}catch(e){}
  return h;};}
ACT.b4out=function(i){if(!B||B.mode!=='cmd')return;B.b4out=+i;render();};
{const sw0=ACT.sw;ACT.sw=function(i){if(B&&B.mode==='cmd'&&B.b4out!=null&&B.front[B.b4out]&&B.front[B.b4out]!==B.cur){if(b4FreeSwap(B.b4out,+i)===false)render();return;}return sw0.apply(this,arguments);};}

// ----- Bestiary: the role in one plain line -----
if(typeof mBeast==='function'){const mb0=mBeast;mBeast=function(m){let h=mb0.apply(this,arguments);try{if(!h||!m)return h;const d=MON[m.k],g=!d&&typeof guardianDef==='function'&&guardianDef(m.k);const ln=g?b4RoleLine({boss:1}):d&&b4RoleLine({role:b4RoleOfMon(d)});
  if(ln)h=h.replace('<h4>Skills</h4>',`<h4>Role</h4><p class="note b4role">${esc(ln)}</p><h4>Skills</h4>`);}catch(e){}return h;};}

// ----- tests -----
const B4X={get cfg(){return B4;},plan:u=>b4RolePlan(u),roleLine:u=>b4RoleLine(u),roleOf:m=>b4RoleOfMon(m),ROLE:B4ROLE,freeSwap:(f,b)=>b4FreeSwap(f,b),freeReady:()=>b4FreeReady(),freeLeft:()=>b4FreeLeft(),
  mo:()=>B?b4MoS():null,moState:()=>b4MoState(),sig:s=>b4Sig(s),hex:c=>b4Hex(c),smart:()=>b4Smart(),detGain:a=>b4DetGain(a),
  foeTurn:u=>{B.cur=u;B.mode='enemy';enemyTurn0(u);},exec:(s,t)=>exec(s,t),guard:()=>guard(),calc:(a,s,t,b)=>calcDamage(a,s,t,b),rng:f=>{RNG=f||Math.random;},doSwap:i=>doSwap(i)};
