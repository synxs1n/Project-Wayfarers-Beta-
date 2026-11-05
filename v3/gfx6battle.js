// =================== Beta v0.5.0 Phase 6: battle presentation (6.1 glow, 6.4 poses, 6.5 camera, impact, elements, parallax) ===================
// Everything wraps the existing renderer; backdrop choice, unit slots and the ground plane are untouched (Phase 2 owns those).
//  - parallax: during battleFrame, PARA.on makes bgStatic() return the layered composite (gfx6.js); the sky and far bands drift a few
//    pixels with a slow idle sway and with the camera, the ground band never moves.
//  - camera: a short push (CSS transform on #bcv and #bstage together, so damage numbers and tap targets stay aligned) toward crits,
//    reactions, shield breaks and Limit Breaks (GFX_CAM). Off under reduced motion.
//  - impact frame: one dark frame with a hot glow where a crit, break or reaction lands (medium and high).
//  - screen shake capped at GFX.q.shake pixels; the particle cap is GFX.q.parts.
//  - richer elements: each element hit adds its own particles (embers, shards, droplets, rocks, leaves, arcs, wisps) and a soft glow.
//  - victory: standing heroes hop when the last foe falls.
const CAM={on:false,t0:0,dur:0,z:1,fx:0,fy:0,applied:false};
const G6I={t:0,x:0,y:0,col:'#ffffff'};
const G6V={win:false,t0:0};
function gfxCamPush(x,y,spec){if(!GFX.q.camera||gfxStill()||!spec)return;const now=performance.now();
  if(CAM.on&&now-CAM.t0<CAM.dur*.6&&CAM.z>=spec[0])return;// a bigger push already running
  CAM.on=true;CAM.t0=now;CAM.z=spec[0];CAM.dur=spec[1];CAM.fx=x;CAM.fy=y;}
function g6CamEnv(now){if(!CAM.on)return 0;const t=(now-CAM.t0)/CAM.dur;if(t<0)return 0;if(t>=1){CAM.on=false;return 0;}const e=q=>q*q*(3-2*q);return t<.25?e(t/.25):t<.6?1:1-e((t-.6)/.4);}
function g6CamApply(now){const cv=document.getElementById('bcv'),st=document.getElementById('bstage');if(!cv||!st)return;const k=g6CamEnv(now);
  const gl=document.getElementById('bgl');// v0.5.3: the HD-2D stage canvas moves with the camera too
  if(k<=0||gfxStill()){if(CAM.applied){cv.style.transform='';if(gl)gl.style.transform='';st.style.transform=`scale(${BL.sc})`;CAM.applied=false;}return;}
  const z=1+(CAM.z-1)*k,sc=BL.sc,fx=Math.max(0,Math.min(BL.W,CAM.fx))*sc,fy=Math.max(0,Math.min(BL.H,CAM.fy))*sc,t=`translate(${fx.toFixed(1)}px,${fy.toFixed(1)}px) scale(${z.toFixed(4)}) translate(${(-fx).toFixed(1)}px,${(-fy).toFixed(1)}px)`;
  cv.style.transform=t;if(gl)gl.style.transform=t;st.style.transform=t+` scale(${sc})`;CAM.applied=true;}
{const lb0=layoutBattle;layoutBattle=function(){const r=lb0.apply(this,arguments);CAM.applied=false;try{const cv=document.getElementById('bcv');if(cv)cv.style.transform='';const gl=document.getElementById('bgl');if(gl)gl.style.transform='';}catch(e){}return r;};}
// ----- particle cap by tier -----
{const pt0=part;part=function(o){const cap=GFX.q.parts;if(BV.P.length>=cap)BV.P.splice(0,BV.P.length-cap+1);return pt0.apply(this,arguments);};}
// ----- richer elemental hits -----
const G6EL={fire:'#ff8a3a',water:'#6ab8ff',earth:'#c89a5a',wind:'#8ae8c0',lightning:'#fff07a',ice:'#bfefff',light:'#fff6c8',shadow:'#b07ae0',hit:'#ffe08a',arcane:'#d0b0ff'};
function g6P(o){o.g6=1;part(o);}
function g6Burst(x,y,el,start,big){const lv=GFX.q.elfx;if(!lv||gfxStill()||GFX.off)return;const n=Math.round((big?8:5)*(lv>1?1:.6)),R=Math.random,col=G6EL[el]||G6EL.hit;
  g6P({k:'g6gl',x,y,t0:start,life:big?360:260,r:big?26:18,col:g6Rgba(col,.8)});
  for(let i=0;i<n;i++){const a=R()*Math.PI*2,s=20+R()*40;
    if(el==='fire')g6P({k:'g6em',x:x+(R()-.5)*14,y:y+(R()-.5)*8,vx:(R()-.5)*16,vy:-24-R()*30,t0:start+R()*80,life:520+R()*300,col:R()<.5?'#ffb04a':'#ff5a1a'});
    else if(el==='ice')g6P({k:'g6sh',x,y,vx:Math.cos(a)*s*1.4,vy:Math.sin(a)*s,t0:start,life:320+R()*160,col:R()<.5?'#ffffff':'#bfefff',a});
    else if(el==='water')g6P({k:'g6dr',x,y,vx:Math.cos(a)*s,vy:-30-R()*40,g:260,t0:start,life:420+R()*200,col:R()<.5?'#8ad0ff':'#ffffff'});
    else if(el==='earth')g6P({k:'g6rk',x,y,vx:(R()-.5)*70,vy:-40-R()*50,g:320,floor:y+10+R()*6,t0:start,life:600+R()*200,col:R()<.5?'#8a6a3a':'#5a4a2a'});
    else if(el==='wind')g6P({k:'g6lf',x,y,r:6+R()*14,a,sp:(R()<.5?-1:1)*(5+R()*4),t0:start,life:460+R()*200,col:R()<.5?'#c8f0e0':'#5fc9a0'});
    else if(el==='lightning'){if(i<3)g6P({k:'g6ar',x:x+(R()-.5)*20,y:y+(R()-.5)*16,t0:start+i*40,life:140,col:'#fff6a0',seed:R()*1000});}
    else if(el==='shadow')g6P({k:'g6ws',x:x+(R()-.5)*16,y,vy:-18-R()*14,ph:R()*6,t0:start+R()*80,life:620+R()*200,col:R()<.5?'#3a2a5a':'#9a6ae0'});
    else if(el==='light'){if(i<4)g6P({k:'g6x',x:x+(R()-.5)*24,y:y+(R()-.5)*20,t0:start+i*50,life:300,col:'#ffffff'});}
    else if(i<3)g6P({k:'g6x',x:x+(R()-.5)*16,y:y+(R()-.5)*12,t0:start+i*40,life:220,col});}
  if(el==='water'||el==='ice')g6P({k:'ring',x,y:y+8,t0:start+60,life:340,col:el==='ice'?'#e8faff':'#8ad0ff',r:big?22:14,flat:1});}
{const ba0=burstAt;burstAt=function(x,y,el,start,big){ba0.apply(this,arguments);try{g6Burst(x,y,el,start,big);}catch(e){}};}
// drawing the new kinds (the original drawParts keeps and expires them by life)
function g6DrawPart(ctx,p,now){const t=now-p.t0;if(t<0)return;const q=t/p.life;if(q>=1)return;const s=t/1000;
  switch(p.k){
    case 'g6gl':{const r=p.r*(.6+.4*Math.sqrt(q));ctx.globalCompositeOperation='lighter';ctx.globalAlpha=(1-q)*.9;ctx.drawImage(g6Glow(p.col),p.x-r,p.y-r,r*2,r*2);ctx.globalCompositeOperation='source-over';break;}
    case 'g6em':{const x=p.x+p.vx*s+Math.sin(s*9+p.y)*2,y=p.y+p.vy*s;ctx.globalAlpha=(1-q)*(Math.floor(t/60)%2?1:.6);ctx.fillStyle=p.col;ctx.fillRect(Math.round(x),Math.round(y),1,q<.3?2:1);break;}
    case 'g6sh':{const x=p.x+p.vx*s,y=p.y+p.vy*s,dx=Math.cos(p.a),dy=Math.sin(p.a);ctx.globalAlpha=1-q;ctx.fillStyle=p.col;for(let i=0;i<3;i++)ctx.fillRect(Math.round(x-dx*i),Math.round(y-dy*i),1,1);break;}
    case 'g6dr':{const x=p.x+p.vx*s,y=p.y+p.vy*s+.5*p.g*s*s;ctx.globalAlpha=1-q*q;ctx.fillStyle=p.col;ctx.fillRect(Math.round(x),Math.round(y),1,2);break;}
    case 'g6rk':{const x=p.x+p.vx*s;let y=p.y+p.vy*s+.5*p.g*s*s;if(y>p.floor)y=p.floor-Math.abs(Math.sin(s*14))*2*(1-q);ctx.globalAlpha=1-q*q*q;ctx.fillStyle=p.col;ctx.fillRect(Math.round(x),Math.round(y),2,2);break;}
    case 'g6lf':{const a=p.a+p.sp*s,r=p.r*(.4+q),x=p.x+Math.cos(a)*r,y=p.y+Math.sin(a)*r*.5-q*10;ctx.globalAlpha=1-q;ctx.fillStyle=p.col;ctx.fillRect(Math.round(x),Math.round(y),2,1);break;}
    case 'g6ar':{ctx.globalAlpha=1-q;ctx.fillStyle=p.col;let x=p.x,y=p.y;const R=mulberry(Math.floor(p.seed+t/40));for(let i=0;i<6;i++){const nx=x+Math.round((R()-.5)*6),ny=y+Math.round(R()*4)-1;ctx.fillRect(Math.min(x,nx),ny,Math.abs(nx-x)+1,1);x=nx;y=ny;}break;}
    case 'g6ws':{const y=p.y+p.vy*s,x=p.x+Math.sin(s*5+p.ph)*4;ctx.globalAlpha=(1-q)*.8;ctx.fillStyle=p.col;ctx.fillRect(Math.round(x),Math.round(y),2,3);ctx.fillRect(Math.round(x)+1,Math.round(y)-2,1,2);break;}
    case 'g6x':{const r=Math.round(1+3*Math.sin(q*Math.PI));ctx.globalAlpha=1-q;ctx.fillStyle=p.col;ctx.fillRect(Math.round(p.x)-r,Math.round(p.y),r*2+1,1);ctx.fillRect(Math.round(p.x),Math.round(p.y)-r,1,r*2+1);break;}}}
function g6Orbs(ctx,p,now){if(p.k!=='orb')return;const t=now-p.t0;if(t<0)return;const q=t/p.life;if(q>=1)return;const e=q*q*(3-2*q),x=p.x+(p.x2-p.x)*e,y=p.y+(p.y2-p.y)*e-Math.sin(q*Math.PI)*10;
  ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.7;ctx.drawImage(g6Glow(g6Rgba(p.col,.8)),x-10,y-10,20,20);ctx.globalCompositeOperation='source-over';}
{const dp0=drawParts;drawParts=function(ctx,now){const r=dp0.apply(this,arguments);if(GFX.off)return r;try{const P=BV.P,bl=GFX.q.bloom>1;for(let i=0;i<P.length;i++){const p=P[i];if(p.g6)g6DrawPart(ctx,p,now);else if(bl)g6Orbs(ctx,p,now);}}catch(e){}ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';return r;};}
// ----- camera pushes and impact frames come from the same hooks that spawn hit effects -----
{const of0=onFx;onFx=function(u,txt,cls){of0.apply(this,arguments);try{if(!B||V.screen!=='battle'||!u||GFX.off)return;const c=centerOf(u);if(!c)return;const now=performance.now(),start=now+IMPACT;
  // hit reaction: a little dust kicked up at the feet as the unit is knocked back
  if(/dmg/.test(cls||'')&&!/poison|burn|bleed/.test(cls)&&GFX.q.elfx&&!gfxStill()){const b=unitBox(u);if(b){const dir=u.side==='p'?1:-1;for(let i=0;i<4;i++)g6P({k:'p',x:b.x+(Math.random()-.5)*8,y:b.y-1,vx:dir*(14+Math.random()*22),vy:-6-Math.random()*8,g:40,t0:start,life:300+Math.random()*160,col:i%2?'rgba(220,210,190,.8)':'rgba(160,150,130,.7)',sz:i%2?2:1});}}
  const crit=/crit/.test(cls||''),react=cls==='react',brk=txt==='BREAK';if(!(crit||react||brk))return;
  gfxCamPush(c.x,c.y,brk?GFX_CAM.brk:react?GFX_CAM.react:GFX_CAM.crit);
  if(GFX.q.impact&&!gfxStill()){G6I.t=start;G6I.x=c.x;G6I.y=c.y;G6I.col=react?(ELC[u.reactEl]||'#ffd04a'):brk?'#ffd04a':'#ffffff';}}catch(e){}};}
function g6Impact(ctx,W,H,now){const d=now-G6I.t;if(!G6I.t||d<0||d>70)return;ctx.fillStyle='rgba(10,6,24,.34)';ctx.fillRect(0,0,W,H);
  ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.9;ctx.drawImage(g6Glow(g6Rgba(G6I.col,.9)),G6I.x-30,G6I.y-30,60,60);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';}
// ----- victory hop -----
{const ub0=unitBox;unitBox=function(u){const b=ub0.apply(this,arguments);try{if(b&&G6V.win&&u&&u.side==='p'&&u.hp>0){const d=performance.now()-G6V.t0;if(d>0&&d<2400)b.y-=Math.round(Math.abs(Math.sin(d/150+b.i*.9))*3*(1-d/2400));}}catch(e){}return b;};}
// ----- the frame -----
{const bf0=battleFrame;battleFrame=function(now){if(!B||GFX.off)return bf0.apply(this,arguments);const q=GFX.q,still=gfxStill();
  try{if(BV.shake&&!BV.shake._g6){BV.shake._g6=1;BV.shake.amp=Math.min(BV.shake.amp,q.shake);}
    // Limit Breaks push the camera toward the hero
    for(let i=0;i<B.front.length;i++){const u=B.front[i];if(u.actLimit&&u.actLimit!==u._g6lim){u._g6lim=u.actLimit;if(Date.now()-u.actLimit<400){const c=centerOf(u);if(c)gfxCamPush(c.x,c.y,GFX_CAM.limit);}}}
    const won=!!B.over&&B.en.length>0&&!B.en.some(g6Alive);if(won&&!G6V.win)G6V.t0=performance.now();G6V.win=won&&!still;
    PARA.on=!!q.parallax;PARA.off=still?0:.45*Math.sin(now/12000*Math.PI*2)-(CAM.on?(CAM.fx/BL.W-.5)*1.1*g6CamEnv(now):0);}catch(e){}
  let r;try{r=bf0.apply(this,arguments);}finally{PARA.on=false;}
  try{const cv=document.getElementById('bcv');if(cv&&!BV.glFull){const ctx=cv.getContext('2d');if(q.impact&&!still)g6Impact(ctx,BL.W,BL.H,now);if(q.vignette&&!BV.glStage)ctx.drawImage(g6Vignette(BL.W,BL.H,.2),0,0);}g6CamApply(now);}catch(e){}
  return r;};}
function g6Alive(e){return e.hp>0;}
