// ===== p5trans.js (v0.5.0): smooth time of day and weather transitions =====
// The clock and the weather still change in one step (world3.js), but what you see and hear now blends:
// - time of day: when the phase changes (day, dusk, night, dawn), the old look fades out and the new one fades in over TRANS.tod ms of
//   world screen time. Night tint (world3 tintFor), the dusk and dawn grade, shadows, glow, windows and motes (daylight dayFxDraw) are scaled
//   by their weight; a multiply grade drawn at alpha a equals a grade of lerp(white, colour, a), so the light really slides.
// - weather: when a realm's weather changes, the old weather's particles, clouds and tint fade out and the new ones fade in over TRANS.wx ms.
//   During the blend each weather is painted once into one reused offscreen canvas at view size, then composited with its alpha.
// - ambience beds ramp over TRANS.ambWx / TRANS.ambTod seconds for those changes (2.5 s for everything else, as before).
// Reduced motion: every blend is instant. Nothing here touches game state. Only the world view blends (battles start fresh).
const TR={ph:null,from:null,fromP:1,lastP:0,k:1,last:0,inDraw:0,wx:{key:null,cur:null,from:null,k:1},cv:null,force:null};
const trEase=k=>k<=0?0:k>=1?1:k*k*(3-2*k);
function trRM(){try{return typeof reducedMotion==='function'&&reducedMotion();}catch(e){return false;}}
function trWorldOn(){const m=WS.m;return !!(m&&G&&m.kind!=='dungeon'&&!m.archive);}
function trUpdate(now){
  const dt=TR.last?Math.min(100,Math.max(0,now-TR.last)):0;TR.last=now;const m=WS.m,rm=trRM();
  if(!G||!m){TR.ph=null;TR.k=1;TR.wx.key=null;return;}
  const {ph,p}=phaseProg();
  if(TR.ph==null){TR.ph=ph;TR.k=1;}
  else if(ph!==TR.ph){TR.from=TR.k<.5&&TR.from?TR.from:TR.ph;TR.fromP=TR.ph==='dusk'||TR.ph==='dawn'?TR.lastP:1;TR.ph=ph;TR.k=0;}
  TR.lastP=p;if(TR.k<1)TR.k=rm?1:Math.min(1,TR.k+dt/TRANS.tod);if(TR.k>=1)TR.from=null;
  const W=TR.wx,key=m.kind==='field'||m.kind==='town'?'r'+m.s:null,w=key&&G.weather?(G.weather[m.s]||'clear'):null;
  if(key!==W.key){W.key=key;W.cur=w;W.from=null;W.k=1;}
  else if(w!==W.cur){W.from=W.k<.5&&W.from?W.from:W.cur;W.cur=w;W.k=0;}
  if(W.k<1)W.k=rm?1:Math.min(1,W.k+dt/TRANS.wx);if(W.k>=1)W.from=null;}
// weight of a phase's look right now (1 = fully shown)
function trPhW(ph){if(TR.k>=1||!TR.from)return ph===TR.ph?1:0;const e=trEase(TR.k);return (ph===TR.ph?e:0)+(ph===TR.from?1-e:0);}
// night tint, scaled while blending
{const t0=tintFor;tintFor=function(t){const T=t0.apply(this,arguments);if(!TR.inDraw||TR.k>=1||!TR.from)return T;const w=trPhW('night');if(w<=0)return null;
  const base=T||t0(CLK_PH.find(x=>x[0]==='night')[1]+1);if(!base)return null;return [base[0],base[1],base[2],base[3]*w];};}
// dusk and dawn, scaled while blending
{const d0=dayFxDraw;dayFxDraw=function(ctx,vw,vh,now,cam,ph,p){if(!TR.inDraw||TR.k>=1||!TR.from)return d0.apply(this,arguments);
  const w=ph===TR.ph?trEase(TR.k):ph===TR.from?1-trEase(TR.k):1;if(w<=.002)return;const a=ctx.globalAlpha;ctx.globalAlpha=a*w;try{d0.apply(this,arguments);}finally{ctx.globalAlpha=a;}};}
function trCanvas(W,H){let c=TR.cv;if(!c){c=TR.cv=document.createElement('canvas');}if(c.width!==W||c.height!==H){c.width=W;c.height=H;}return c;}
{const f0=weatherFX;weatherFX=function(ctx,w,W,H,now,battle){const X=TR.wx;
  if(battle||!TR.inDraw||X.k>=1||!X.from||X.from===w&&X.cur===w)return f0.apply(this,arguments);
  const e=trEase(X.k),c=trCanvas(W,H),o=c.getContext('2d'),a0=ctx.globalAlpha;
  const layer=(wx,al)=>{if(!wx||wx==='clear'||al<=.002)return;o.setTransform(1,0,0,1,0,0);o.globalAlpha=1;o.globalCompositeOperation='source-over';o.clearRect(0,0,W,H);
    f0.call(this,o,wx,W,H,now,false);ctx.globalAlpha=a0*al;ctx.drawImage(c,0,0);};
  try{layer(X.from,1-e);layer(w,e);}finally{ctx.globalAlpha=a0;}};}
{const wd=worldDraw;worldDraw=function(now){try{trUpdate(now);}catch(e){}TR.inDraw=1;
  try{wd.apply(this,arguments);
    // the phase being left, when daylight.js no longer draws it (dusk into night, dawn into day)
    if(TR.from&&TR.k<1&&(TR.from==='dusk'||TR.from==='dawn')&&TR.from!==TR.ph&&trWorldOn()&&!G.daily)dayFxDraw(WS.ctx,WS.vw,WS.vh,now,WS.cam,TR.from,TR.fromP);
  }finally{TR.inDraw=0;}};}
// ambience: weather and time of day changes ramp slower
function trAmbDur(){let dur=2.5;try{const m=WS.m;if(G&&m&&V.screen==='world'){
    const w=G.weather?G.weather[m.s]||'clear':null,ph=clockPhase();
    if((TR.wx.cur&&w!==TR.wx.cur)||TR.wx.k<1)dur=TRANS.ambWx;else if((TR.ph&&ph!==TR.ph)||TR.k<1)dur=TRANS.ambTod;}}catch(e){}return dur;}
{const s0=ambSet;ambSet=function(name,v){const dur=trAmbDur();TR.ambDur=dur;if(dur===2.5)return s0.apply(this,arguments);
  const L=ambBed(name);if(!L)return;const c=AU2.g.ctx,p=L.out.gain;p.cancelScheduledValues(c.currentTime);p.setValueAtTime(p.value,c.currentTime);p.linearRampToValueAtTime(v,c.currentTime+dur);};}
