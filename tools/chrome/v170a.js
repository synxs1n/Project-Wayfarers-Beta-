// v0.18.7 perf12.js: a phone on High stays cool. On a phone (coarse pointer, short side <= 600 css px) and only there:
//  1. Auto render scale caps at 2 internal pixels per art pixel (HD-2D scene, battle stage GL canvas, battle unit layer backing); an explicit
//     Settings > Render scale 3x is kept; a big screen (tablet, fold, computer) keeps 3x and 4x
//  2. the idle frame limiter: a still world draws 30 frames a second, a moving one up to 60 (a 120 Hz phone does not draw 120), a world under
//     an open menu 8, a hidden tab none; a battle waiting for a command draws 30, one with an effect running 60. Only frames the game loop
//     draws are limited: a direct worldDraw / battleFrame call (tests, resize) always draws
//  3. under tests the module is off unless window.__P12F is set (no other test sees a change); detection is natural on a phone viewport
// The limiter is driven with synthetic frame times (16.7 ms apart, 8.3 for 120 Hz) so the result does not depend on how busy the machine is.
// Usage (from tools/chrome): PWHTML=../../out/aurelis3.html node v170a.js
const {open,chk,done}=require('./pw');
const META=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,autoStats:true,autoEquip:false,gfx:'high',rmotion:false,hints:false,hd2d:true}}));`;
const COUNT=p=>p.addInitScript(()=>{window.__P12F=1;window.__GLD=0;const o=WebGLRenderingContext.prototype.drawElements;WebGLRenderingContext.prototype.drawElements=function(){window.__GLD++;return o.apply(this,arguments);};});
const NOFLAG=p=>p.addInitScript(()=>{window.__GLD=0;const o=WebGLRenderingContext.prototype.drawElements;WebGLRenderingContext.prototype.drawElements=function(){window.__GLD++;return o.apply(this,arguments);};});
const start=H=>H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(i=>A.ACT.pickS(i));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.META.cfg.gfx='high';A.render();});
// n frames of the world through the limiter at a synthetic rate; returns how many drew and skipped
const SYN=`(a)=>{const T=__A.TW.get,P=T('P12'),wd=T('worldDraw'),n0=Object.assign({},P.n);let t=a.t0;P.inLoop=1;if(a.hid)Object.defineProperty(document,'hidden',{get:()=>true,configurable:true});
  try{for(let i=0;i<a.n;i++){t+=a.dt;wd(t);}}finally{P.inLoop=0;if(a.hid)delete document.hidden;}
  return {draw:P.n.wDraw-n0.wDraw,skip:P.n.wSkip-n0.wSkip,hid:P.n.hid-n0.hid,t};}`;
const SYNB=SYN.replace(/wd=T\('worldDraw'\)/,"wd=T('battleFrame')").replace(/P\.n\.wDraw-n0\.wDraw/,'P.n.bDraw-n0.bDraw').replace(/P\.n\.wSkip-n0\.wSkip/,'P.n.bSkip-n0.bSkip');
(async()=>{
  const H=await open({w:390,h:844,mobile:true,dpr:3,pre:META,before:COUNT});await start(H);
  await H.until(()=>__A.V.screen==='world'&&__A.HD.live,null,{timeout:15000});await H.wait(600);
  const nat=await H.ev(()=>{const T=__A.TW.get;return {ph:T('p12Phone')(),on:T('p12On')(),px:__A.HD.pxI,size:__A.HD.size.split(':')[0]};});
  chk(`phone viewport 390x844 dpr 3: detected as a phone (${nat.ph}), High HD-2D at ${nat.px} px per art pixel (${nat.size})`,nat.ph===true&&nat.on===true&&nat.px===2);
  // ---- resolution ----
  const rs=await H.ev(()=>{const T=__A.TW.get,o={};o.phone=T('resPx')(6);o.phone4=T('resPx')(9);__A.TW.get('P12');window.__P12P=false;o.big=T('resPx')(6);o.big9=T('resPx')(9);window.__P12P=true;
    __A.META.cfg.render='3';o.explicit=T('resPx')(6);__A.META.cfg.render='2';o.two=T('resPx')(6);delete __A.META.cfg.render;delete window.__P12P;o.after=T('resPx')(6);return o;});
  chk(`resPx on a phone: d 6 -> ${rs.phone}, d 9 -> ${rs.phone4} (2 at most); on a big screen ${rs.big} and ${rs.big9} (3 as before); Render scale 3x kept (${rs.explicit}), 2x (${rs.two}); back to ${rs.after}`,rs.phone===2&&rs.phone4===2&&rs.big===3&&rs.big9===3&&rs.explicit===3&&rs.two===2&&rs.after===2);
  // ---- world limiter ----
  // the game's own loop is stopped (its frames would mix real times into the synthetic ones); restarted for the battle
  await H.ev(()=>{window.__raf=window.requestAnimationFrame;window.requestAnimationFrame=()=>0;});await H.wait(200);
  await H.ev(()=>{const A=__A;A.WS.held=[];A.WS.target=null;A.WS.path=null;A.V.modal=null;});await H.wait(900);
  const run=(a)=>H.ev(`(${SYN})`+'('+JSON.stringify(a)+')');
  let t0=await H.ev(()=>performance.now());
  let r=await run({t0,n:40,dt:16.7});// settle: the first frames after a change draw at full rate
  r=await run({t0:r.t,n:60,dt:16.7});
  chk(`still world, 60 Hz: ${r.draw} of 60 frames drawn (30 a second), ${r.skip} skipped`,r.draw>=28&&r.draw<=32&&r.draw+r.skip===60);
  r=await run({t0:r.t,n:120,dt:8.33});
  chk(`still world, 120 Hz: ${r.draw} of 120 frames drawn (30 a second)`,r.draw>=28&&r.draw<=32);
  await H.ev(()=>{__A.WS.held=['r'];});
  r=await run({t0:r.t,n:60,dt:16.7});
  chk(`walking, 60 Hz: ${r.draw} of 60 frames drawn (every frame)`,r.draw===60);
  r=await run({t0:r.t,n:120,dt:8.33});
  chk(`walking, 120 Hz: ${r.draw} of 120 frames drawn (60 a second)`,r.draw>=58&&r.draw<=62);
  await H.ev(()=>{__A.WS.held=[];});
  r=await run({t0:r.t,n:60,dt:16.7});// the walk's grace (350 ms) runs out
  r=await run({t0:r.t,n:60,dt:16.7});
  chk(`back at rest 1 s after the walk: ${r.draw} of 60 frames drawn`,r.draw>=28&&r.draw<=32);
  await H.ev(()=>{__A.V.modal={type:'menu',tab:'settings'};});
  r=await run({t0:r.t,n:60,dt:16.7});
  chk(`world under an open menu: ${r.draw} of 60 frames drawn (8 a second)`,r.draw>=7&&r.draw<=9);
  await H.ev(()=>{__A.V.modal=null;});
  r=await run({t0:r.t,n:60,dt:16.7});
  chk(`menu closed: ${r.draw} of 60 frames drawn (30 a second again)`,r.draw>=28&&r.draw<=32);
  // a map change or a camera glide is movement
  const g=await H.ev(()=>{const A=__A,T=A.TW.get,P=T('P12');let t=performance.now()+5e4;P.inLoop=1;const wd=T('worldDraw');for(let i=0;i<30;i++){t+=16.7;wd(t);}
    const n0=P.n.wDraw;A.WS.cam.x+=40;for(let i=0;i<10;i++){t+=16.7;wd(t);}P.inLoop=0;return P.n.wDraw-n0;});
  chk(`a camera glide draws every frame (${g} of 10)`,g===10);
  // hidden tab
  r=await run({t0:r.t+9e4,n:30,dt:16.7,hid:1});
  chk(`hidden tab: ${r.draw} frames drawn, ${r.hid} skipped for the tab`,r.draw===0&&r.hid===30);
  // a direct call always draws (resize, tests)
  const d=await H.ev(()=>{const T=__A.TW.get,P=T('P12'),wd=T('worldDraw'),g0=window.__GLD;P.inLoop=0;const t=performance.now()+2e5;for(let i=0;i<6;i++)wd(t+i*3);return {gl:window.__GLD-g0,skip:P.n.wSkip};});
  chk(`direct worldDraw calls (not from the loop) draw every time: ${d.gl} GL draws for 6 calls`,d.gl>=6);
  // ---- battle ----
  await H.ev(()=>{window.requestAnimationFrame=window.__raf;window.requestAnimationFrame(__A.TW.get('loop'));__A.TW.get('P12').w.last=0;});
  await H.ev(()=>{__A.TW.get('startBattle')({stage:0,kind:'field'});});
  await H.until(()=>{const T=__A.TW.get;return __A.V.screen==='battle'&&T('B').mode==='cmd'&&!T('animating')()&&!T('BV').P.length&&!T('BV').flash&&!T('B').banner;},null,{timeout:20000});await H.wait(800);
  const bk=await H.ev(()=>{const T=__A.TW.get;const o={bk:T('resBk')(),st:T('resStageR')({})};window.__P12P=false;o.bkBig=T('resBk')();o.stBig=T('resStageR')({});delete window.__P12P;return o;});
  chk(`battle on a phone: unit layer backing ${bk.bk} (2x HD paint), stage ${bk.st} backing px per css px (2 at most); big screen ${bk.bkBig} and ${bk.stBig}`,bk.bk===2&&bk.st<=2&&bk.bkBig===4&&bk.stBig===3);
  const bs=async(a)=>H.ev(`(${SYNB})`+'('+JSON.stringify(a)+')');
  t0=await H.ev(()=>performance.now()+3e5);
  let b=await bs({t0,n:40,dt:16.7});b=await bs({t0:b.t,n:60,dt:16.7});
  chk(`battle waiting for a command: ${b.draw} of 60 frames drawn (30 a second)`,b.draw>=28&&b.draw<=32);
  await H.ev(()=>{const T=__A.TW.get;T('BV').shake={t:performance.now()+4e5,life:1e9,amp:0};});
  b=await bs({t0:b.t,n:60,dt:16.7});
  chk(`battle with an effect running: ${b.draw} of 60 frames drawn (every frame)`,b.draw===60);
  await H.ev(()=>{const T=__A.TW.get;T('BV').shake=null;T('V').modal={type:'menu',tab:'settings'};});
  b=await bs({t0:b.t,n:60,dt:16.7});await H.ev(()=>{__A.TW.get('V').modal=null;});
  b=await bs({t0:b.t,n:80,dt:16.7});
  chk(`battle settled again: ${b.draw} of 80 frames drawn (about 30 a second)`,b.draw>=36&&b.draw<=44);
  await H.ev(()=>{const T=__A.TW.get;T('P12').inLoop=0;});
  // ---- a computer: nothing changes, and under tests the module is off without the flag ----
  const H2=await open({w:1280,h:800,pre:META,before:NOFLAG});await start(H2);await H2.until(()=>__A.V.screen==='world'&&__A.HD.live,null,{timeout:15000});await H2.wait(500);
  const c=await H2.ev(()=>{const T=__A.TW.get,P=T('P12'),wd=T('worldDraw');const ph=T('p12Phone')();let t=performance.now();P.inLoop=1;for(let i=0;i<20;i++){t+=16.7;wd(t);}P.inLoop=0;return {ph,on:T('p12On')(),n:Object.assign({},P.n),px:__A.HD.pxI};});
  chk(`computer under tests without __P12F: module off (${c.on}), no frame skipped (${c.n.wSkip}), not a phone (${c.ph})`,c.on===false&&c.n.wSkip===0&&c.n.wDraw===0&&c.ph===false);
  const c2=await H2.ev(()=>{window.__P12F=1;const T=__A.TW.get,P=T('P12'),wd=T('worldDraw');const ph=T('p12Phone')(),g0=window.__GLD;let t=performance.now()+1e5;P.inLoop=1;for(let i=0;i<60;i++){t+=16.7;wd(t);}P.inLoop=0;return {ph,skip:P.n.wSkip,gl:window.__GLD-g0,px:T('resPx')(9)};});
  chk(`computer with the module on: not a phone (${c2.ph}), no frame skipped (${c2.skip}; ${c2.gl} GL draws for 60 frames), no 2x cap (resPx(9) = ${c2.px})`,c2.ph===false&&c2.skip===0&&c2.gl>=60&&c2.px===3);
  await H2.browser.close();
  done(H);
})().catch(e=>{console.error(e);process.exit(1);});
