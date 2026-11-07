// Beta v0.7.0 (3): timed hits. Off by default (no ring, normal damage, the Settings row reads Off); when on, a hero's single target
// attack shows the ring and a press as it closes gives +15% damage (keyboard, mouse, touch and gamepad each tried), an early press gives
// nothing, a foe's single target attack on a hero can be guarded for 15% less; auto battle never shows it and keeps going; the Daily
// Trial keeps it off; with reduced motion the ring does not move and still works. No page errors.
// Usage: PWHTML=../../out/aurelis3.html node v070ic.js
const {open,chk,done}=require('./pw');const {META,battle,AUTO_OK}=require('./v063lib');
// make the current hero's attack land (no miss, no ward), then attack foe 0 and wait for the ring (or for the turn to end)
const attack=H=>H.ev(async()=>{const A=__A,B=A.B,a=B.cur,e=B.en.find(x=>x.hp>0);a.S.acc=5;B.en.forEach(x=>{x.S.eva=0;if(x.st)delete x.st.ward;x.S.mhp=x.hp=99999;});A.B5.R.last=null;
  A.setPause(40);A.ACT.cmd('attack');A.ACT.tgtE(String(B.en.indexOf(e)));await new Promise(q=>setTimeout(q,30));const R=A.B5.R.ring;return R?{ring:true,wait:Math.round(R.t0+R.T-performance.now()),rm:R.el.classList.contains('rm'),kind:R.kind}:{ring:false};});
// v0.9.9: the result of a timed press gets its damage (base, dmg) when the hit lands, after the ring closes; on a busy machine that came
// later than the fixed 200 ms, so wait for the ring to close and then, for a timed press, for its damage (at most 5 s)
const after=H=>H.ev(async()=>{for(let i=0;i<60&&__A.B5.R.ring;i++)await new Promise(q=>setTimeout(q,25));await new Promise(q=>setTimeout(q,200));
  for(const t0=performance.now();performance.now()-t0<5000;){const l=__A.B5.R.last;if(!l||!l.ok||l.base!=null)break;await new Promise(q=>setTimeout(q,25));}return __A.B5.R.last;});
// back to a hero's command turn
const nextHero=H=>H.ev(async()=>{const A=__A,B=A.B;A.setPause(40);for(let i=0;i<200&&!(B.mode==='cmd'&&B.cur&&B.cur.side==='p');i++)await new Promise(q=>setTimeout(q,25));A.setPause(99999);return B.mode;});
(async()=>{
// ---- off by default ----
{const H=await open({w:390,h:844,mobile:true,pre:META('low')});await battle(H,{seed:5,heroes:3,foes:2});
  const s=await H.ev(()=>{const A=__A;A.V.modal={type:'settings'};A.render();const row=document.querySelector('.b5set');const on=row&&row.querySelector('.chip.on');const r={cfg:A.META.cfg.timedHits,on:A.B5.timedOn(),row:!!row,lab:on&&on.textContent};A.V.modal=null;A.render();return r;});
  chk('timed hits are off by default (setting unset, the Settings row reads Off)',s.cfg===undefined&&s.on===false&&s.row&&s.lab==='Off'||JSON.stringify(s));
  const a=await attack(H),l=await after(H);
  chk('off: an attack shows no ring and deals normal damage',!a.ring&&(!l||l.m==null)||JSON.stringify({a,l}));
  await H.browser.close();}
// ---- on: every input kind, early press, guard ----
{const H=await open({w:390,h:844,mobile:true,pre:META('low',{timedHits:true})});await battle(H,{seed:6,heroes:3,foes:2});
  const res={};
  const tryOne=async(kind)=>{await nextHero(H);const a=await attack(H);if(!a.ring)return {a};
    const box=await H.ev(()=>{const r=document.getElementById('bwrap').getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};});
    if(kind==='pad')await H.ev(w=>{const pad={buttons:Array.from({length:16},()=>({pressed:false})),axes:[0,0,0,0]};navigator.getGamepads=()=>[pad];setTimeout(()=>{pad.buttons[0].pressed=true;},w);setTimeout(()=>{pad.buttons[0].pressed=false;},w+150);},Math.max(0,a.wait-15));
    else{await H.wait(Math.max(0,a.wait-25));if(kind==='key')await H.page.keyboard.press(' ');else if(kind==='mouse')await H.page.mouse.click(box.x,box.y);else if(kind==='touch')await H.page.touchscreen.tap(box.x,box.y);else if(kind==='early'){}}
    if(kind==='early')await H.ev(()=>{});
    const l=await after(H);if(kind==='pad')await H.ev(()=>{delete navigator.getGamepads;});return {a,l};};
  for(const k of ['key','mouse','touch','pad']){let r=null;for(let t=0;t<3;t++){r=await tryOne(k);if(r.l&&r.l.base)break;}res[k]=r;}
  for(const k of ['key','mouse','touch','pad']){const r=res[k],l=r&&r.l;chk(`on: ${k} press as the ring closes: timed, +15% damage`,!!(r&&r.a.ring&&l&&l.ok&&l.base&&Math.abs(l.dmg/l.base-1.15)<.02+1/l.base)||JSON.stringify(r));}
  // early press: right after the ring opens (past the grace time) is outside the window
  {await nextHero(H);const a=await attack(H);await H.wait(120);await H.page.keyboard.press('Enter');const l=await after(H);chk('on: an early press is a miss and adds nothing',a.ring&&l&&l.ok===false&&l.why==='early'&&l.m==null||JSON.stringify({a,l}));}
  // no press at all: the attack still happens, normal damage
  {await nextHero(H);const a=await attack(H);const l=await after(H);chk('on: no press: the ring closes, the attack goes on at normal damage',a.ring&&l&&l.ok===false&&l.why==='none'||JSON.stringify({a,l}));}
  // a foe's single target attack on a hero: the guard ring, a timed press cuts the damage by 15%
  // v0.9.9: the game's turn watchdog (engine.js WD_MS, 4 s) replaces an enemy turn that stalls with a plain attack; on a very busy machine
  // it can fire while the guard ring waits, and the replaced attack carries no timed result. Only then the guard is tried again (3 at most)
  for(let tryN=0;tryN<3;tryN++){const wd0=await H.ev(()=>(window.__WD||[]).length);
  {await nextHero(H);const g=await H.ev(async()=>{const A=__A,B=A.B,e=B.en.find(x=>x.hp>0);e.sk=[];e.role=null;e._b5p=null;e.S.acc=5;B.front.forEach(c=>{c.S.eva=0;c.S.mhp=c.hp=99999;if(c.st)delete c.st.ward;});e.next=B.time+.01;A.B5.R.last=null;
      A.setPause(30);A.ACT.cmd('guard');for(let i=0;i<200&&!A.B5.R.ring;i++)await new Promise(q=>setTimeout(q,10));const R=A.B5.R.ring;return R?{ring:true,kind:R.kind,wait:Math.round(R.t0+R.T-performance.now())}:{ring:false,mode:B.mode,cur:B.cur&&B.cur.name};});
    if(g.ring){await H.wait(Math.max(0,g.wait-25));await H.page.keyboard.press(' ');}const l=await after(H);
    const wd=await H.ev(n=>(window.__WD||[]).slice(n).map(e=>e.msg),wd0);if(wd.length&&!(l&&l.base)&&tryN<2){console.log('  guard ring turn replaced by the watchdog ('+wd.join('; ')+'), again');continue;}
    chk('on: a foe attacks a hero: the guard ring, a timed press takes 15% off',g.ring&&g.kind==='def'&&l&&l.ok&&l.base&&Math.abs(l.dmg/l.base-.85)<.02+1/l.base||JSON.stringify({g,l,wd}));}break;}
  // auto: no ring, the fight goes on
  // v0.9.9: these foe types count as beaten by hand (Auto per foe type, v0.9.8, would leave Auto locked and the fight standing still)
  {await nextHero(H);const r=await H.ev(async ok=>{const A=__A,B=A.B;(0,eval)('('+ok+')')();let rings=0;const t0=B.pturns||0;A.setPause(30);A.ACT.auto();for(const s0=performance.now();performance.now()-s0<20000&&!B.over&&(B.pturns||0)<t0+6;){if(A.B5.R.ring||document.querySelector('.b5ring'))rings++;await new Promise(q=>setTimeout(q,25));}
    const n=(B.pturns||0)-t0;A.ACT.auto();A.setPause(99999);return {rings,n,over:B.over};},AUTO_OK.toString());
    chk('auto battle: no ring and the fight keeps going',r.rings===0&&(r.n>=4||r.over)||JSON.stringify(r));}
  await H.browser.close();}
// ---- reduced motion ----
{const H=await open({w:933,h:705,pre:META('low',{timedHits:true,rmotion:true})});await battle(H,{seed:8,heroes:3,foes:1});
  let a,l;for(let t=0;t<3;t++){await nextHero(H);a=await attack(H);if(a.ring){await H.wait(Math.max(0,a.wait-25));await H.page.keyboard.press('z');}l=await after(H);if(l&&l.base)break;}
  chk('reduced motion: the ring does not move (no closing ring) and a timed press still counts',a.ring&&a.rm&&l&&l.ok&&Math.abs(l.dmg/l.base-1.15)<.02+1/l.base||JSON.stringify({a,l}));
  const st=await H.ev(()=>{const A=__A;A.ACT.cmd('attack');A.ACT.tgtE('0');const c=document.querySelector('.b5ring .cl');return c?getComputedStyle(c).display:'none';});
  chk('reduced motion: the closing ring is not drawn',st==='none'||st);
  await H.browser.close();}
// ---- the Daily Trial keeps it off ----
{const H=await open({w:390,h:844,mobile:true,pre:META('low',{timedHits:true})});
  const r=await H.ev(async()=>{const A=__A;if(A.TW)A.TW.off=true;A.ACT.dailyGo();const B=A.B;if(!B)return {err:'no trial'};A.setPause(30);for(let i=0;i<200&&!(B.mode==='cmd');i++)await new Promise(q=>setTimeout(q,20));A.setPause(99999);
    const on=A.B5.timedOn();if(B.mode!=='cmd')return {on,mode:B.mode};const e=B.en.find(x=>x.hp>0);A.ACT.cmd('attack');A.ACT.tgtE(String(B.en.indexOf(e)));await new Promise(q=>setTimeout(q,40));return {on,ring:!!A.B5.R.ring};});
  chk('Daily Trial: no timed hits even with the setting on',r.on===false&&r.ring===false||JSON.stringify(r));
  await H.browser.close();}
const H=await open({});await done(H);})();
