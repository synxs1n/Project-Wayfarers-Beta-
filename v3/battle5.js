// ===== battle5.js (v0.7.0): battle information and input: turn forecast, foe intents, timed hits =====
// 1) The turn order bar shows the next turns (B5.order) from the engine's own turn model: every live unit acts when its `next` time
//    comes up (advance0 picks the smallest, heroes win ties), and after acting waits delayOf(u, cost). The forecast steps that model
//    forward: it calls delayOf (so speed, tempo, weather, haste, slow and root all count, and any later wrapper of delayOf too), lets
//    statuses run out after the turns they have left, and knows the frenzy quirk. While a skill, item or scan is aimed it previews where
//    its cost puts the hero.
// 2) Foe intents: each foe's next action is decided in advance (foePlan) from a stream seeded by the battle seed, the foe's slot and its
//    turn number (so the Daily Trial stays deterministic, and asking early or late gives the same plan); enemyTurn0 then does exactly
//    that action (the target is still picked when it acts). The icon shows once the foe type's skills are known in the Bestiary (the same
//    rule as the unit details: "Studied", i.e. scanned, or 10 defeated, a boss once); otherwise "?". On the stage the icon is a label
//    placed by the layout pass (b3Lay), in the order bar it sits beside the foe's portrait.
// 3) Timed hits (Settings, off by default, never in the Daily Trial or on auto): a ring closes over the target of a hero's single target
//    attack or skill; a press as it closes adds B5.atkUp damage. When a foe aims a single target attack at a hero, a timed press cuts the
//    damage by B5.defDown. Touch, mouse, keyboard and gamepad; with reduced motion the ring stays still and lights up for the window.

// ----- 2) foe plans -----
const B5R={trace:[],ring:null,last:null,shown:{}};
// the intent category of a foe skill
function b5Cat(sk){if(!sk)return 'attack';if(sk.summon)return 'summon';if(sk.k==='heal'||sk.k==='revive')return 'heal';
  const fx=sk.fx||[];
  if(sk.k==='buff'||sk.k==='status'||sk.t==='self'){if(fx.some(([k])=>k==='ward'||k==='bulwark'||k==='guard'||k==='taunt'))return 'guard';if(fx.some(([k])=>k==='regen'))return 'heal';
    return fx.some(([k])=>STS[k]&&STS[k].bad)?'status':'buff';}
  if(sk.t==='all'||(sk.pw||0)>=B5.bigPw)return 'big';
  if(fx.some(([k,c])=>STS[k]&&STS[k].bad&&(c==null||c>=B5.stCh)))return 'status';
  return 'attack';}
const B5CAT={attack:'Attack',big:'Big hit',buff:'Power up',status:'Status',heal:'Heal',guard:'Guard',summon:'Summon',unknown:'Unknown'};
// what a foe does on turn number n (u.turns+1 when it next acts): the same weights as the original enemyTurn0, drawn from rand
function foeChoose(u,rand,n){let sk=ATTACK;
  const buffs=u.sk.filter(s=>s.k==='buff'&&!(s.fx||[]).every(([k])=>has(u,k))),dmg=u.sk.filter(s=>s.k!=='buff');
  if(buffs.length&&rand()<.22)sk=buffs[0];
  else if(u.boss&&n%3===0&&dmg.some(s=>s.t==='all'))sk=dmg.find(s=>s.t==='all');
  else if(dmg.length&&rand()<.55)sk=dmg[Math.floor(rand()*dmg.length)];
  return sk;}
// the plan for the foe's next turn (cached per turn number; the stream depends only on the battle seed, wave, slot and turn)
function foePlan(u){if(!B||!u||u.side!=='e')return null;const n=(u.turns||0)+1;if(u._b5p&&u._b5p.n===n&&u._b5p.bid===B.id)return u._b5p;
  const i=Math.max(0,B.en.indexOf(u)),rand=seeded((B.seed^Math.imul(i+1,0x9E3779B1)^Math.imul(n,0x85EBCA77)^Math.imul(B.wave||1,0xC2B2AE35))>>>0);
  rand();const sk=foeChoose(u,rand,n);u._b5p={n,bid:B.id,sk,cat:b5Cat(sk)};return u._b5p;}
// does the player know this foe's moves? (the Bestiary's "Studied" tier: scanned, or 10 defeated; a boss: scanned or beaten once)
function b5Knows(u){try{return tierOf(bestEntry(u),u.boss)>=2;}catch(e){return false;}}
function b5Intent(u){if(!B||!u||u.side!=='e'||u.hp<=0)return null;const p=foePlan(u);if(!p)return null;const k=b5Knows(u);
  return {cat:k?p.cat:'unknown',sk:p.sk,known:k,title:k?`Next: ${p.sk.n} (${B5CAT[p.cat]})`:'Next move unknown. Scan it or study it in the Bestiary.'};}
// enemyTurn0 split in two: the planned choice (foePlan), then the original targeting and the action
function enemyTurn0(u){
  if(!B||B.over||u.hp<=0)return;
  const live=B.front.filter(c=>c.hp>0);
  if(!live.length){advance();return;}
  const plan=foePlan(u),shown=b5Shown(u);
  u.turns++;
  if(u.boss&&!u.enraged&&u.hp<u.S.mhp*.3){u.enraged=true;u.S.atk*=1.15;u.S.mag*=1.15;log(`${u.name} flies into a rage!`);fx(u,'Enraged','stat bad');}
  let sk=plan&&plan.sk&&(plan.sk===ATTACK||u.sk.includes(plan.sk))?plan.sk:ATTACK;
  let tg;
  if(sk.t==='self')tg=[u];
  else if(sk.t==='all')tg=live;
  else{const taunt=live.filter(c=>has(c,'taunt'));
    if(taunt.length)tg=[taunt[0]];
    else{const low=live.slice().sort((a,b)=>a.hp/a.S.mhp-b.hp/b.S.mhp)[0];
      const packed=!u.boss&&!u.elite&&!(G&&G.daily)&&(B.stage||0)>=(PACK.fromStage||0)&&B.en.filter(e=>e.hp>0&&!e.boss&&!e.elite).length>1;
      if(packed&&B.packT&&B.packT.hp>0&&live.includes(B.packT)&&RNG()<PACK.focus)tg=[B.packT];
      else{tg=[RNG()<.3?low:pick(live)];if(packed)B.packT=tg[0];}}}
  if(sk.hits===1&&u.multi>1&&sk.t==='one')sk=Object.assign({},sk,{hits:u.multi});
  B5R.trace.push({foe:u.name,turn:u.turns,plan:plan&&plan.cat,did:b5Cat(sk),sk:sk.n,shown,known:b5Knows(u)});if(B5R.trace.length>400)B5R.trace.shift();
  const go=m=>{B.b5m=m;try{perform(u,sk,tg);}finally{if(B)B.b5m=null;}endTurn(u,1);};
  if(b5TimedOk(u,sk,tg)){const bt=B,t=tg[0];b5Ring(t,'def',ok=>{if(B!==bt||B.over||B.cur!==u||u.hp<=0)return;try{if(ok)fx(t,'Timed guard','stat good');go(ok?{a:u,t,m:1-B5.defDown}:null);}catch(e){wdForce(u,'timed guard: '+(e&&e.message||e));}});return;}
  go(null);}
// the icon the screen shows for a foe right now (read back from the stage label, else from the order bar): what the tests compare
function b5Shown(u){try{const r=unitRef(u),e=document.querySelector(`#bstage .b5it[data-u="${r}"]`)||document.querySelector(`#border .b5oi[data-u="${r}"]`);return e?e.dataset.cat:null;}catch(e){return null;}}

// ----- intent icons (inline SVG, 16 x 16) -----
const B5SVG={attack:'<path d="M3 13L13 3M4.5 8.5l3 3M3 13l-1 1" stroke-width="2.4"/>',big:'<path d="M3 13L13 3M13 13L3 3" stroke-width="2.6"/><circle cx="8" cy="8" r="1.6" fill="currentColor" stroke="none"/>',
  buff:'<path d="M8 2L14 9H10.5V14H5.5V9H2Z" fill="currentColor" stroke="none"/>',status:'<path d="M8 14L2 7H5.5V2H10.5V7H14Z" fill="currentColor" stroke="none"/>',
  heal:'<path d="M6 2h4v4h4v4h-4v4H6v-4H2V6h4z" fill="currentColor" stroke="none"/>',guard:'<path d="M8 1.5L14 3.5V8C14 11.3 11.3 13.6 8 14.8C4.7 13.6 2 11.3 2 8V3.5Z" fill="currentColor" stroke="none"/>',
  summon:'<circle cx="8" cy="8" r="5.6" fill="none" stroke-width="2"/><path d="M8 5v6M5 8h6" stroke-width="2"/>'};
function b5Icon(cat){if(cat==='unknown'||!B5SVG[cat])return '<b>?</b>';return `<svg viewBox="0 0 16 16" aria-hidden="true" stroke="currentColor" fill="none" stroke-linecap="round">${B5SVG[cat]}</svg>`;}

// ----- the stage label, placed by the layout pass after everything else -----
function b5LayIntents(L){L.intent=new Map();const W=L.W,H=L.H,h=B5.it.h;
  B.en.forEach(u=>{if(u.hp<=0)return;const w=b9IntW(u);const b=unitBox(u);if(!b)return;const bo=L.bodies.find(q=>q.u===u),bd=bo?bo.r:{x:b.x-b.w/2,y:b.y-b.h,w:b.w,h:b.h},p=L.plates.get(u),A=[];
    // beside the HP plate first (toward the middle of the stage, then outward), then over and under it, then around the body
    if(p){const my=Math.round(p.y+p.h/2-h/2);A.push({x:p.x+p.w+1,y:my,c:0},{x:p.x-w-1,y:my,c:1},{x:Math.round(p.x+p.w/2-w/2),y:p.y-h-1,c:2},{x:Math.round(p.x+p.w/2-w/2),y:p.y+p.h+1,c:3});}
    const cx=Math.round(b.x-w/2);A.push({x:cx,y:bd.y-h-1,c:4},{x:bd.x+bd.w+1,y:bd.y,c:6},{x:bd.x-w-1,y:bd.y,c:6},{x:cx,y:Math.max(b.y,bd.y+bd.h)+1,c:8});
    const r=b3Find(w,h,A,L.obs,W,H);
    if(r){const o=Object.assign({kind:'intent',u},r);L.obs.push(o);L.all.push(o);L.intent.set(u,o);}else L.hidden.push({kind:'intent',u});});}
{const lay0=b3Lay;b3Lay=function(){const L=lay0.apply(this,arguments);if(L&&!L._b5&&B){L._b5=1;try{b5LayIntents(L);}catch(e){}}return L;};}
{const sh0=b3StageHtml;b3StageHtml=function(){let h=sh0.apply(this,arguments);try{const L=B3L.L;if(L&&L.intent){const px=v=>v+'px';
  L.intent.forEach((o,u)=>{const I=b5Intent(u);if(!I)return;const T=o.w>B5.it.w&&b9TelePlan(u),ti=T?`${I.title}. Guard halves it; a stun or stripping its boons stops it.`:I.title;h+=`<span class="b5it b3l ${I.cat}${T?' b9tel':''}" data-u="${unitRef(u)}" data-cat="${I.cat}" style="left:${px(o.x)};top:${px(o.y)};width:${px(o.w)};height:${px(o.h)}" title="${esc(ti)}" aria-label="${esc(u.name)}: ${esc(ti)}">${b5Icon(I.cat)}${T?`<em>${B9W.g}</em>`:''}</span>`;});}}catch(e){}return h;};}

// ----- 1) the turn forecast -----
// steps the engine's model forward: [{u,t}] for the next n turns. cost: what the acting hero's chosen action costs (preview)
function b5Order(n,cost){if(!B)return [];const live=liveUnits(),SP={slow:1,haste:1,root:1};
  const sim=live.map(u=>{const st={};for(const k in u.st||{})if(SP[k])st[k]=Object.assign({},u.st[k]);return {u,t:u.next,st,turns:u.turns||0,frz:u.frenzied||0};});
  const out=[];
  for(let i=0;i<n&&sim.length;i++){let s=null;for(const x of sim)if(!s||x.t<s.t||(x.t===s.t&&x.u.side==='p'))s=x;
    out.push({u:s.u,t:s.t});
    const c=i===0&&s.u===B.cur&&B.mode==='cmd'&&cost!=null?cost:1,p=Object.create(s.u);p.st=s.st;
    const t0=s.t;s.t=t0+delayOf(p,c);
    if(s.u.side==='e'){s.turns++;if(s.u.mod==='frenzy'){if(s.turns%3===0&&!s.frz){s.frz=1;s.t=t0+60;}else s.frz=0;}}
    for(const k in s.st){s.st[k].t--;if(s.st[k].t<=0)delete s.st[k];}}
  return out;}
// the engine's own helper now uses the same forecast
turnOrder=function(n){return b5Order(n).map(o=>o.u);};
// the cost of what is being aimed right now (null when nothing is)
function b5PendCost(){if(!B||B.mode!=='cmd'||!B.pend)return null;const P=B.pend;if(P.scan)return .5;if(P.item)return .8;if(P.sk)return P.sk.cost||1;return null;}
function b5OrderHtml(){const n=BL.mode==='tall'?B5.order.tall:B5.order.wide,pc=b5PendCost(),pv=pc!=null&&pc!==1,L=b5Order(n,pv?pc:null),cur=B.cur;
  const acting=cur&&cur.hp>0&&(B.mode==='cmd'||B.mode==='enemy');let seen=0;
  const items=L.map((o,i)=>{const u=o.u,now=i===0&&acting&&u===cur,mine=pv&&u===cur&&i>0&&!seen++;
    const img=`<img src="${u.heroArt?heroURL(u.heroArt):u.side==='p'?heroURL(u.id):monURL(u.art)}" alt="">`;
    const chip=`<span class="oc ${u.side} ${now?'now':''} ${mine?'b5pv':''}" style="--c:${ELC[u.el[0]]}" title="${esc(u.name)}${now?' (acting now)':''}">${img}</span>`;
    if(u.side!=='e')return chip;const I=b5Intent(u);if(!I)return chip;
    return `<span class="b5oe">${chip}<i class="b5oi ${I.cat}" data-u="${unitRef(u)}" data-cat="${I.cat}" title="${esc(u.name)}. ${esc(I.title)}">${b5Icon(I.cat)}</i></span>`;});
  return `<span class="ocs b5o ${pv?'pv':''}" aria-label="Turn order"><small>${pv?'If used':'Next'}</small>${items.join('')}</span>`;}

// ----- 3) timed hits -----
function b5TimedOn(){try{return META.cfg.timedHits===true&&!(G&&G.daily)&&!(B&&B.spec&&B.spec.kind==='daily');}catch(e){return false;}}
// a hero's single target attack or skill on a foe, or a foe's single target attack on a hero; never on auto
function b5TimedOk(a,sk,tg){if(!B||B.auto||!b5TimedOn()||!a||!sk||!tg||tg.length!==1||V.screen!=='battle')return false;const t=tg[0];
  if(!t||t.hp<=0||sk.t!=='one'||!(sk.k==='phys'||sk.k==='mag'))return false;
  if(a.side==='p')return !a.isComp&&t.side==='e';return a.side==='e'&&t.side==='p';}
// show the ring over unit t; done(true) on a press inside the window, done(false) on an early press or none
function b5Ring(t,kind,done){const wrap=$('bwrap'),b=unitBox(t),sc=BL.sc||2;if(!wrap||!b){done(false);return;}
  const rm=trRM(),win=rm?B5.winRM:B5.win,T=B5.ringMs,el=document.createElement('div');
  el.className=`b5ring ${kind} ${rm?'rm':''}`;el.setAttribute('role','status');el.setAttribute('aria-live','assertive');
  const cx=b.x*sc,cy=(b.y-b.h*.55)*sc,R=Math.max(24,Math.min(44,b.h*sc*.42));
  el.style.cssText=`left:${cx}px;top:${cy}px;--r:${R}px;--ms:${T}ms`;
  el.innerHTML=`<i class="tgt"></i><i class="cl"></i><b>${kind==='def'?'Guard!':'Strike!'}</b>`;wrap.appendChild(el);
  const t0=performance.now(),R0=B5R.ring={t0,T,win,kind,el,done:false,res:null};
  const lit=setTimeout(()=>{el.classList.add('lit');},Math.max(0,T-win));
  const end=(ok,why)=>{if(R0.done)return;R0.done=true;R0.res=ok;R0.why=why;clearTimeout(lit);clearTimeout(miss);el.classList.add(ok?'hit':'miss');
    B5R.last=Object.assign({},B5R.last||{},{ok,kind,why,dt:Math.round(performance.now()-t0-T)});
    setTimeout(()=>{try{el.remove();}catch(e){}if(B5R.ring===R0)B5R.ring=null;},ok?260:160);
    // the action goes on as soon as the press is judged; a paused battle waits
    later(()=>done(ok),ok?120:60);};
  R0.press=()=>{const dt=performance.now()-t0;if(dt<B5.grace||R0.done)return false;const d=dt-T;end(Math.abs(d)<=win,d<-win?'early':d>win?'late':'timed');return true;};
  const miss=setTimeout(()=>end(false,'none'),T+win+20);}
function b5Press(){const R=B5R.ring;return !!(R&&!R.done&&R.press());}
// input while a ring is up: any tap or click, a key (not Tab, Escape or a modifier), a gamepad face button; nothing else gets it
document.addEventListener('pointerdown',e=>{const R=B5R.ring;if(!R||R.done)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();b5Press();},true);
window.addEventListener('keydown',e=>{const R=B5R.ring;if(!R||R.done)return;if(['Tab','Escape','Shift','Control','Alt','Meta'].includes(e.key))return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();if(!e.repeat)b5Press();},true);
{const pp0=padPoll;padPoll=function(now){const R=B5R.ring;if(R&&!R.done){try{const gps=navigator.getGamepads?navigator.getGamepads():[],gp=gps&&Array.from(gps).find(Boolean);
  if(gp){const b=i=>!!(gp.buttons[i]&&gp.buttons[i].pressed),st={A:b(0),B:b(1),X:b(2),Y:b(3)},hit=['A','B','X','Y'].some(k=>st[k]&&!PAD.prev[k]);Object.assign(PAD.prev,st);if(hit)b5Press();}}catch(e){}return;}
  return pp0.apply(this,arguments);};}
// a hero's timed attack: the ring first, then the action as chosen
{const ex0=exec;exec=function(sk,tgts){const a=B&&B.cur;
  if(b5TimedOk(a,sk,tgts)){const bt=B,t=tgts[0],self=this;B.mode='wait';B.menu='root';B.pend=null;render();
    b5Ring(t,'atk',ok=>{if(B!==bt||B.over||B.cur!==a||a.hp<=0)return;if(t.hp<=0){B.mode='cmd';render();return;}
      if(ok)fx(t,'Timed!','stat good');B.b5m=ok?{a,sk,t,m:1+B5.atkUp}:null;try{ex0.call(self,sk,tgts);}finally{if(B)B.b5m=null;}});return;}
  return ex0.apply(this,arguments);};}
{const cd0=calcDamage;calcDamage=function(a,sk,t){const r=cd0.apply(this,arguments);try{const m=B&&B.b5m;if(m&&r&&m.a===a&&m.t===t&&(!m.sk||m.sk===sk)){const d0=r.dmg;r.dmg=Math.max(1,Math.round(d0*m.m));B5R.last=Object.assign({},B5R.last||{},{base:d0,dmg:r.dmg,m:m.m});}}catch(e){}return r;};}
// the setting
{const sb0=settingsBody;settingsBody=function(){let h=sb0.apply(this,arguments);try{const on=META.cfg.timedHits===true;
  const row=`<div class="row b5set"><div><b>Timed hits</b><small>A ring closes over the target of your single target attacks: press as it closes for ${Math.round(B5.atkUp*100)}% more damage, or when a foe strikes a hero for ${Math.round(B5.defDown*100)}% less. Never on auto or in the Daily Trial.</small></div><div class="chips"><button class="chip ${on?'':'on'}" data-act="cfg" data-arg='["timedHits",false]'>Off</button><button class="chip ${on?'on':''}" data-act="cfg" data-arg='["timedHits",true]'>On</button></div></div>`;
  const k=h.indexOf('<div class="btnrow"><button class="btn" data-act="autoOpen"');
  h=k>=0?h.slice(0,k)+`<div class="rows">${row}</div>`+h.slice(k):h+`<div class="rows">${row}</div>`;}catch(e){}return h;};}

// plans exist from the first frame of a battle; a new wave (or a summon) gets one when it is first drawn
HOOK.after('startBattle','battle5','plan every foe (foePlan)',function(r){try{if(r!==false&&B){B5R.ring=null;B.en.forEach(foePlan);}}catch(e){}});

// the bar never scrolls: entries that do not fit the row are dropped from the end (at least 4 stay)
function b5Fit(){try{const o=document.querySelector('#border .ocs');if(!o)return;let k=0;
  // v0.7.5: also drop entries whose box (intent badge included) pokes past the bar's edge, down to 3 entries
  const out=()=>{const R=o.getBoundingClientRect(),L=o.querySelectorAll(':scope>.oc,:scope>.b5oe');const l=L[L.length-1];if(!l)return false;const q=l.getBoundingClientRect();return q.right>R.right+.5;};
  while((o.scrollWidth>o.clientWidth+1||out())&&k++<10){const L=o.querySelectorAll(':scope>.oc,:scope>.b5oe');if(L.length<=3)break;L[L.length-1].remove();}}catch(e){}}
{const rb0=renderBattle;renderBattle=function(stageOnly){const r=rb0.apply(this,arguments);if(!stageOnly)b5Fit();return r;};}

// ----- v0.9.5: battle clarity on the stage and the command panel -----
// The key weakness tag: one small label per foe (battle3.js b9Key: a reaction setup first), placed after the intents, beside them or the
// HP plate (never on a sprite or another label; a foe whose tag finds no spot keeps it on its card only). A telegraphed big hit (a
// Charger's Crushing Charge, a boss's Cataclysm, any big hit a foe is winding up for) widens that foe's intent label to "Guard!", and
// the acting hero's command panel says what to do: Guard (it glows) when the hit lands on this hero before its next turn, "Interrupt:
// stun or strip buffs" while a foe winds up, and the cleanse (Skills or Items glows) when a Hex is stacked on a hero.
const B9W={w:11,h:10,g:'Guard!'};
function b9TelePlan(u){if(!B||!u||u.side!=='e'||u.hp<=0)return null;let P=null;try{P=typeof b4RolePlan==='function'?b4RolePlan(u):null;}catch(e){}
  if(P&&(P.kind==='unleash'||P.kind==='cataclysm'))return {u,n:P.n,tg:P.tg||[]};
  try{if(has(u,'charge')){const p=foePlan(u);if(p&&p.cat==='big')return {u,n:p.sk&&p.sk.n||'Big hit',tg:B.front.filter(c=>c.hp>0)};}}catch(e){}return null;}
function b9IntW(u){return b9TelePlan(u)?B5.it.w+Math.ceil(b3TextW(B9W.g,5,900)*1.1)+3:B5.it.w;}
function b9LayWeak(L){L.wk=new Map();const W=L.W,H=L.H,w=B9W.w,h=B9W.h;
  B.en.forEach(u=>{if(u.hp<=0)return;const k=b9Key(u);if(!k)return;const b=unitBox(u);if(!b)return;const bo=L.bodies.find(q=>q.u===u),bd=bo?bo.r:{x:b.x-b.w/2,y:b.y-b.h,w:b.w,h:b.h},p=L.plates.get(u),it=L.intent&&L.intent.get(u),A=[];
    if(it){const my=Math.round(it.y+it.h/2-h/2);A.push({x:it.x+it.w+1,y:my,c:0},{x:it.x-w-1,y:my,c:1});}
    if(p){const my=Math.round(p.y+p.h/2-h/2);A.push({x:p.x+p.w+1,y:my,c:1.5},{x:p.x-w-1,y:my,c:2},{x:Math.round(p.x+p.w/2-w/2),y:p.y-h-1,c:3},{x:Math.round(p.x+p.w/2-w/2),y:p.y+p.h+1,c:3.5});}
    const cx=Math.round(b.x-w/2);A.push({x:cx,y:bd.y-h-1,c:5},{x:bd.x+bd.w+1,y:bd.y,c:6},{x:bd.x-w-1,y:bd.y,c:6},{x:cx,y:Math.max(b.y,bd.y+bd.h)+1,c:8});
    B3SG={u};const r=b3Find(w,h,A,L.obs,W,H,B3.R*.6);B3SG=null;if(r){const o=Object.assign({kind:'weak',u,k},r);L.obs.push(o);L.all.push(o);L.wk.set(u,o);}});}
{const lay0=b3Lay;b3Lay=function(){const L=lay0.apply(this,arguments);if(L&&!L._b9&&B){L._b9=1;try{b9LayWeak(L);}catch(e){}}return L;};}
// the layout is rebuilt when a foe's key weakness or its telegraph changes
{const k0=b3Key;b3Key=function(units){let k=k0.apply(this,arguments);try{k+='|w'+B.en.map(e=>{if(e.hp<=0)return '-';const x=b9Key(e);return (x?x.k[0]+x.id+x.s:'')+(b9TelePlan(e)?'T':'');}).join(',');}catch(e){}return k;};}
{const sh0=b3StageHtml;b3StageHtml=function(){let h=sh0.apply(this,arguments);try{const L=B3L.L;if(L&&L.wk){const px=v=>v+'px';
  L.wk.forEach((o,u)=>{const k=b9Key(u)||o.k,t=b9KeyTip(u,k);h+=`<span class="b9wk b3l ${k.s>1?'rx':''}" data-u="${unitRef(u)}" data-k="${k.k}:${k.id}" data-s="${k.s}" style="left:${px(o.x)};top:${px(o.y)};width:${px(o.w)};height:${px(o.h)}" title="${esc(t)}" aria-label="${esc(u.name)}: ${esc(t)}">${k.k==='el'?ico(k.id):dgIco(k.id)}</span>`;});}}catch(e){}return h;};}
// what the acting hero should know before choosing: {k:'guard'|'int'|'hex', txt, tip, glow:'guard'|'skills'|'items'}
function b9CanStop(a){try{return known(a).find(s=>a.mp>=(s.mp||0)&&(s.k==='phys'||s.k==='mag')&&(s.strip||(s.fx||[]).some(([k])=>k==='stun')))||null;}catch(e){return null;}}
function b9Cleanse(a){try{const s=known(a).find(s=>s.cleanse&&a.mp>=(s.mp||0)&&(s.t==='ally'||s.t==='allyAll'));if(s)return 'skills';if(G&&G.inv&&(G.inv.remedy||0)>0)return 'items';}catch(e){}return null;}
function b9Cue(){if(!B||B.over||B.auto||B.mode!=='cmd'||!B.cur||B.cur.side!=='p'||B.cur.isComp)return null;const a=B.cur;let ord=null;
  const before=u=>{ord=ord||b5Order(12);for(let i=1;i<ord.length;i++){const x=ord[i].u;if(x===a)return false;if(x===u)return true;}return false;};
  for(const u of B.en){const T=b9TelePlan(u);if(T&&T.tg.includes(a)&&before(u))return {k:'guard',u,glow:'guard',txt:`Guard! ${T.n} next`,tip:`${u.name}'s ${T.n} hits ${T.tg.length>1?'the whole Vanguard':a.name} before ${a.name} acts again. Guard halves it.`};}
  const wind=B.en.find(u=>u.hp>0&&has(u,'charge'));
  if(wind){const s=b9CanStop(a);return {k:'int',u:wind,glow:s?'skills':null,txt:'Interrupt: stun or strip buffs',tip:`${wind.name} is winding up. A stun or stripping its boons stops it.`+(s?` ${a.name} can: ${s.n}.`:'')};}
  let hx=null;try{hx=B.front.filter(c=>c.hp>0&&!c.isComp&&b4Hex(c)>=2).sort((x,y)=>b4Hex(y)-b4Hex(x))[0];}catch(e){}
  if(hx){const via=b9Cleanse(a);if(via)return {k:'hex',u:hx,glow:via,txt:`Hex ${b4Hex(hx)} on ${hx.name}: cleanse it`,tip:`${hx.name} carries ${b4Hex(hx)} Hex stacks; at ${B4.roles.hexMax} the next one bursts. ${via==='skills'?'A cleanse skill':'A Remedy'} clears it.`};}
  return null;}
{const ch0=cmdHtml;cmdHtml=function(){let h=ch0.apply(this,arguments);try{if(!B||B.menu!=='root'||B.swapAsk)return h;const C=b9Cue();if(!C)return h;
  const cls=C.k==='guard'?'g':C.k==='int'?'it':'hx',cue=`<span class="b9cue inhead ${cls}" role="status" title="${esc(C.tip)}" aria-label="${esc(C.tip)}">${esc(C.txt)}</span>`,bk='<button class="btn sm cmdback"';
  if(h.indexOf(bk)>=0)h=h.replace(bk,cue+bk);
  if(C.glow==='guard')h=h.replace('data-arg="guard">Guard</button>',`data-arg="guard" title="${esc(C.tip)}">Guard!</button>`).replace('<button class="mi" data-act="cmd" data-arg="guard"','<button class="mi b9glow" data-act="cmd" data-arg="guard"');
  else if(C.glow==='skills')h=h.replace('<button class="mi" data-act="cmd" data-arg="skills"',`<button class="mi b9glow ${C.k==='hex'?'cl':''}" title="${esc(C.tip)}" data-act="cmd" data-arg="skills"`);
  else if(C.glow==='items')h=h.replace('<button class="mi" data-act="cmd" data-arg="items"',`<button class="mi b9glow cl" title="${esc(C.tip)}" data-act="cmd" data-arg="items"`);}catch(e){}return h;};}

// tests: window.__A.B5
const B5API={cfg:B5,R:B5R,order:(n,c)=>b5Order(n,c),plan:u=>foePlan(u),intent:u=>b5Intent(u),cat:sk=>b5Cat(sk),knows:u=>b5Knows(u),press:()=>b5Press(),timedOn:()=>b5TimedOn(),choose:(u,r,n)=>foeChoose(u,r,n)};
