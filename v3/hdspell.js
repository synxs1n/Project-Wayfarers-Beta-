// ===== hdspell.js (v0.5.3): HD-2D battle spells, impacts and camera =====
// With the GL stage on (hdstage.js), element hits get their own set piece drawn into the unit layer (so they bloom), a point light on the
// stage and, for some, a glowing circle on the floor: fire tongues, ice spikes, a lightning bolt from the sky, a water geyser with ripples,
// earth spikes with dust, a wind funnel, a beam of light, a shadow vortex that darkens the stage. Casters get a floor circle and a light,
// orbs in flight light the floor, big hits push the camera, Limit Breaks get a spotlight, a gold circle and a longer push.
// Counts scale with HD_BATTLE[tier].spell and are capped by GFX_Q.parts (part()); nothing is spawned under reduced motion or with the GL
// stage off, so Low and the 2D stage stay exactly as they were. Pure drawing: no game state, no battle RNG.
const HBS={u:null};
function hbsOn(){return HB.on&&!gfxStill()&&!GFX.off&&(hbQ().spell||0)>0;}
function hbsP(o){o.hb=1;part(o);}
const HBS_COL={fire:'#ff7a2a',ice:'#9ae6ff',lightning:'#fff2a0',water:'#5aa8ff',earth:'#d0a060',wind:'#9af0c8',light:'#fff0c0',shadow:'#a070e0',arcane:'#c8a0ff',hit:'#fff4d8'};
// the hit set pieces: x,y is the target's centre, gy its ground line
function hbsHit(x,y,el,start,big,u){const m=hbQ().spell||1,R=Math.random,b=u&&unitBox(u),gy=b&&b.gy!=null?b.gy:y+10,h=b?b.h:20,w=b?Math.min(b.w,40):20,col=HBS_COL[el]||HBS_COL.hit,C=hbRGB(col);
  const L=(int,r,life,o)=>hbLight(Object.assign({x,y,foot:gy,r,col:C,int:int*(big?1.25:1),t0:start,life},o||{}));
  const D=(r,a,life,o)=>hbDecal(Object.assign({x,y:gy,r,col:C,a,t0:start,life,grow:1,spin:.12},o||{}));
  switch(el){
    case 'fire':L(1.6,74,760);D(w*.9,.5,520);hbsP({k:'hbFc',x,y:gy,r:w*.55,hm:h,t0:start,life:620});for(let i=0;i<(big?8:6)*m;i++)hbsP({k:'hbF',x:x+(R()-.5)*w*.8,y:gy-R()*4,hmax:h*(.7+R()*.7),wd:4+R()*3,t0:start+R()*140,life:440+R()*280,ph:R()*9});break;
    case 'ice':L(1.2,62,620,{col:[.7,.92,1]});D(w*1.05,.55,700);{const n=(big?7:5)+(m>1?2:0);for(let i=0;i<n;i++){const a=(i/n)*Math.PI*2+R()*.4;hbsP({k:'hbI',x:x+Math.cos(a)*w*.42,y:gy+Math.sin(a)*3,lean:Math.cos(a)*.35,hm:h*(.35+R()*.4),t0:start+i*25,life:560+R()*120});}}break;
    case 'lightning':L(2.4,96,360,{fade:'pulse',y:y-8});hbsP({k:'hbL',x,y,t0:start,life:300,seed:R()*1e4,w:big?3:2});if(m>1)hbsP({k:'hbL',x:x+(R()-.5)*10,y,t0:start+70,life:200,seed:R()*1e4,w:1});
      for(let i=0;i<6*m;i++){const a=-Math.PI*R();hbsP({k:'p',x,y:gy-2,vx:Math.cos(a)*60,vy:Math.sin(a)*60,g:200,t0:start,life:260+R()*200,col:R()<.5?'#ffffff':'#fff6a0',sz:1});}break;
    case 'water':L(.9,60,640);D(w*.8,.5,620,{spin:.03});D(w*1.3,.35,800,{t0:start+140,spin:.02});hbsP({k:'hbW',x,y:gy,hm:h*1.1,t0:start,life:520});
      for(let i=0;i<8*m;i++){const a=-Math.PI*(.15+.7*R());hbsP({k:'p',x:x+(R()-.5)*6,y:gy-h*.8,vx:Math.cos(a)*50,vy:Math.sin(a)*70,g:300,t0:start+120+R()*120,life:420+R()*200,col:R()<.5?'#bfe6ff':'#ffffff',sz:R()<.4?2:1});}break;
    case 'earth':L(.55,54,560,{col:[.9,.7,.45]});{const n=(big?6:4)+(m>1?2:0);for(let i=0;i<n;i++){const a=(i/n)*Math.PI*2+R()*.5;hbsP({k:'hbE',x:x+Math.cos(a)*w*.45,y:gy+Math.sin(a)*3,lean:Math.cos(a)*.5,hm:h*(.3+R()*.35),wd:3+Math.floor(R()*3),t0:start+i*30,life:620});}}
      for(let i=0;i<4*m;i++)hbsP({k:'hbDu',x:x+(R()-.5)*w,y:gy-1,r0:3,r1:9+R()*8,t0:start+60+R()*120,life:520+R()*200});
      if(!BV.shake||BV.shake.t<start-100)BV.shake={t:start,life:240,amp:2};break;
    case 'wind':L(.6,56,620);for(let i=0;i<4*m;i++)hbsP({k:'hbA',x,y:gy,hm:h*1.15,ph:i*1.6+R(),t0:start+i*30,life:560+R()*120});break;
    case 'light':L(1.5,90,700,{y:y-10});D(w*.95,.6,650,{spin:.06});hbsP({k:'hbH',x,y:gy,t0:start,life:520,w:big?12:9});break;
    case 'shadow':hbLight({x,y,foot:gy,r:70,col:[1,1,1],int:-.75,t0:start,life:760,fade:'pulse'});L(.5,40,620,{col:[.62,.4,.9]});hbsP({k:'hbS',x,y:y+2,r:w*.75,t0:start,life:640});break;
    case 'arcane':L(.9,54,480);D(w*.75,.45,480);break;
    default:L(.7,34,180,{col:[1,.96,.86]});hbsP({k:'hbX',x,y,r:big?10:7,t0:start,life:170});}
  // v0.12.6: the pieces the set pieces above lack (embers, a wave arc, a fan of shards, rock chunks, curved slashes, sparkles, sinking wisps), from anim.js, drawn additively
  try{if(typeof anElem==='function'&&el!=='arcane')anElem(el,x,y,start,big,u,1);}catch(e){}
  if(big&&GFX.q.camera&&typeof HD_CAM!=='undefined')gfxCamPush(x,y,HD_CAM.big);}
{const ba0=burstAt;burstAt=function(x,y,el,start,big){const r=ba0.apply(this,arguments);try{if(hbsOn())hbsHit(x,y,el,start,big,HBS.u);}catch(e){}return r;};}
{const of0=onFx;onFx=function(u,txt,cls){HBS.u=u;try{return of0.apply(this,arguments);}finally{HBS.u=null;
  try{if(hbsOn()&&u&&B&&V.screen==='battle'){const c=centerOf(u),b=unitBox(u);if(c&&b){
    if(cls==='heal')hbLight({x:c.x,y:c.y,foot:b.gy!=null?b.gy:b.y,r:46,col:[.5,1,.6],int:.8,life:620,fade:'pulse'});
    else if(cls==='react')hbLight({x:c.x,y:c.y,foot:b.gy!=null?b.gy:b.y,r:110,col:hbRGB(ELC[u.reactEl]||'#ffd04a'),int:1.8,t0:performance.now()+IMPACT,life:700});}}}catch(e){}}};}
// casters: a floor circle, a growing light and motes drawn in
{const oa0=onAction;onAction=function(a,now){const r=oa0.apply(this,arguments);try{if(hbsOn()&&a&&a.actKind&&a.actKind!=='phys'){const c=centerOf(a),b=unitBox(a);if(c&&b){
  const el=a.actEl||(a.actKind==='mag'?'arcane':null),col=el?(HBS_COL[el]||ELC[el]||'#c8a0ff'):a.actKind==='heal'?'#7aff8a':'#fff6a0',C=hbRGB(col),gy=b.gy!=null?b.gy:b.y,m=hbQ().spell||1;
  hbDecal({x:c.x,y:gy,r:Math.max(12,b.w*.6),col:C,a:.7,t0:now,life:IMPACT+420,grow:1,spin:.25});
  hbLight({x:c.x,y:c.y,foot:gy,r:52,col:C,int:.95,t0:now,life:IMPACT+360,fade:'in'});
  for(let i=0;i<5*m;i++){const ag=Math.random()*Math.PI*2,d=14+Math.random()*10;hbsP({k:'hbC',x:c.x,y:c.y,dx:Math.cos(ag)*d,dy:Math.sin(ag)*d*.6,t0:now+i*20,life:IMPACT+60,col});}}}}catch(e){}return r;};}
// Limit Breaks: spotlight, gold circle and light, a longer camera push
{const bf0=battleFrame;battleFrame=function(now){try{if(hbsOn()&&B)for(let i=0;i<B.front.length;i++){const u=B.front[i];if(u.actLimit&&u.actLimit!==u._hblim){u._hblim=u.actLimit;
  if(Date.now()-u.actLimit<400){const c=centerOf(u),b=unitBox(u);if(c&&b){HB.spot={x:c.x,y:c.y,t0:now,life:1100};
    hbDecal({x:c.x,y:b.gy!=null?b.gy:b.y,r:Math.max(18,b.w*.9),col:[1,.82,.35],a:.85,t0:now,life:1100,grow:1,spin:.3});
    hbLight({x:c.x,y:c.y-4,foot:b.gy!=null?b.gy:b.y,r:110,col:[1,.85,.5],int:1.6,t0:now,life:1100,fade:'pulse'});
    if(GFX.q.camera)gfxCamPush(c.x,c.y,HD_CAM.limit);}}}}}catch(e){}return bf0.apply(this,arguments);};}
// ----- drawing (into the unit layer, after the original particles) -----
function hbsDraw(ctx,p,now){const t=now-p.t0;if(t<0)return;const q=t/p.life;if(q>=1)return;const R=Math.round;
  switch(p.k){
    case 'hbF':{// a flame tongue: grows, flickers, thins out
      const hh=p.hmax*Math.sin(Math.min(1,q*1.4)*Math.PI*.5)*(1-q*.5),n=Math.max(2,R(hh/2)),W0=p.wd||4;ctx.globalCompositeOperation='lighter';
      for(let i=0;i<n;i++){const k=i/n,wv=Math.sin(now/60+p.ph+i*.7)*1.6*k,wd=Math.max(1,R((1-k)*W0*(1-q*.5)));ctx.globalAlpha=(1-q)*(1-k*.6);
        ctx.fillStyle=k<.25?'#fff4b0':k<.55?'#ffb04a':k<.8?'#ff6a1a':'#c83a1a';ctx.fillRect(R(p.x+wv-wd/2),R(p.y-i*2-2),wd,2);}
      ctx.globalCompositeOperation='source-over';break;}
    case 'hbFc':{// the fire's hot core: a soft column of glow
      const k=Math.sin(Math.min(1,q*2)*Math.PI*.5)*(1-q);ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.5*k;ctx.fillStyle='#ff8a2a';ctx.beginPath();ctx.ellipse(p.x,p.y-p.hm*.45,p.r,p.hm*.55,0,0,7);ctx.fill();
      ctx.globalAlpha=.5*k;ctx.fillStyle='#ffd27a';ctx.beginPath();ctx.ellipse(p.x,p.y-p.hm*.3,p.r*.5,p.hm*.32,0,0,7);ctx.fill();ctx.globalCompositeOperation='source-over';break;}
    case 'hbI':{// an ice spike out of the ground, then it shatters
      const grow=Math.min(1,q/.18),hh=p.hm*grow,sh=q>.72;ctx.globalAlpha=sh?Math.max(0,1-(q-.72)/.28):1;
      const tipx=p.x+p.lean*hh,bx=p.x,by=p.y,half=Math.max(1.5,hh*.16);
      if(!sh){ctx.fillStyle='#4a9ac8';ctx.beginPath();ctx.moveTo(bx-half,by);ctx.lineTo(tipx,by-hh);ctx.lineTo(bx+half,by);ctx.closePath();ctx.fill();
        ctx.fillStyle='#9ae6ff';ctx.beginPath();ctx.moveTo(bx-half*.4,by);ctx.lineTo(tipx,by-hh);ctx.lineTo(bx+half,by);ctx.closePath();ctx.fill();
        ctx.fillStyle='#ffffff';ctx.fillRect(R(tipx),R(by-hh),1,Math.max(1,R(hh*.4)));}
      else{const s=(q-.72)*600;for(let i=0;i<4;i++){ctx.fillStyle=i%2?'#ffffff':'#bfefff';ctx.fillRect(R(bx+(i-1.5)*s*.08),R(by-hh*.5+s*s*.0008*(i+1)),2,1);}}
      break;}
    case 'hbL':{// a bolt from the top of the stage, re-forked every 40 ms, flickering
      if(Math.floor(t/40)%4===3)break;const Rr=mulberry(Math.floor(p.seed+t/40));let x=p.x+(Rr()-.5)*30,y=0;const pts=[[x,y]];
      while(y<p.y){y+=5+Rr()*6;x+=(Rr()-.5)*9;x+=(p.x-x)*.25;pts.push([x,Math.min(y,p.y)]);}
      ctx.globalCompositeOperation='lighter';ctx.globalAlpha=1-q*.6;ctx.lineCap='round';
      [[p.w+2,'#c8a020'],[p.w,'#fff6a0'],[Math.max(1,p.w-1),'#ffffff']].forEach(([lw,c])=>{ctx.strokeStyle=c;ctx.lineWidth=lw;ctx.beginPath();pts.forEach(([a,b],i)=>i?ctx.lineTo(a,b):ctx.moveTo(a,b));ctx.stroke();});
      const fk=pts[Math.floor(pts.length*.45)];if(fk){ctx.strokeStyle='#fff6a0';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(fk[0],fk[1]);ctx.lineTo(fk[0]+(Rr()-.5)*26,fk[1]+10+Rr()*10);ctx.stroke();}
      ctx.globalCompositeOperation='source-over';break;}
    case 'hbW':{// a geyser: the column rises, holds, falls back
      const up=q<.3?q/.3:q<.65?1:1-(q-.65)/.35,hh=p.hm*up,wd=7;ctx.globalAlpha=.85;
      for(let i=0;i<hh;i+=2){const k=i/Math.max(1,hh),wv=Math.sin(now/70+i*.5)*1.2,ww=R(wd*(1-k*.35));ctx.fillStyle=k>.85?'#ffffff':k>.5?'#8ad0ff':'#3f8fe0';ctx.fillRect(R(p.x+wv-ww/2),R(p.y-i-2),ww,2);
        if(i%6===0){ctx.fillStyle='#e8f6ff';ctx.fillRect(R(p.x+wv-ww/2),R(p.y-i-2),1,2);}}
      if(hh>4){ctx.fillStyle='#ffffff';ctx.fillRect(R(p.x-4),R(p.y-hh-3),8,2);ctx.fillRect(R(p.x-2),R(p.y-hh-5),4,2);}break;}
    case 'hbE':{// a rock spike: erupts, holds, sinks back and crumbles
      const up=q<.14?q/.14:q<.7?1:1-(q-.7)/.3,hh=p.hm*up,half=p.wd,tipx=p.x+p.lean*hh;ctx.globalAlpha=1;
      ctx.fillStyle='#5a4a2a';ctx.beginPath();ctx.moveTo(p.x-half,p.y);ctx.lineTo(tipx,p.y-hh);ctx.lineTo(p.x+half,p.y);ctx.closePath();ctx.fill();
      ctx.fillStyle='#a8844a';ctx.beginPath();ctx.moveTo(p.x-half*.2,p.y);ctx.lineTo(tipx,p.y-hh);ctx.lineTo(p.x+half,p.y);ctx.closePath();ctx.fill();
      ctx.fillStyle='#d8b878';ctx.fillRect(R(tipx),R(p.y-hh),1,Math.max(1,R(hh*.3)));break;}
    case 'hbDu':{const r=p.r0+(p.r1-p.r0)*Math.sqrt(q);ctx.globalAlpha=(1-q)*.45;ctx.fillStyle='#c8b08a';ctx.beginPath();ctx.ellipse(p.x,p.y-r*.4-q*4,r,r*.55,0,0,7);ctx.fill();break;}
    case 'hbA':{// a wind funnel: streaks wound around the target, rising and widening
      ctx.globalCompositeOperation='lighter';ctx.lineWidth=1;
      for(let j=0;j<4;j++){const k=(q*1.3+j/4)%1,yy=p.y-k*p.hm,rr=5+k*14,a0=now/80+p.ph+j*1.7;ctx.globalAlpha=(1-q)*(1-k*.4);ctx.strokeStyle=j%2?'#e8fff4':'#7ae8b8';ctx.beginPath();ctx.ellipse(p.x,yy,rr,rr*.32,0,a0,a0+2.6);ctx.stroke();ctx.beginPath();ctx.ellipse(p.x,yy-1,rr*.8,rr*.25,0,a0+.4,a0+2);ctx.stroke();}
      ctx.globalCompositeOperation='source-over';break;}
    case 'hbH':{// a beam from the sky
      const k=q<.2?q/.2:1-(q-.2)/.8,wd=p.w*k;ctx.globalCompositeOperation='lighter';
      [[wd,.25,'#ffc850'],[wd*.6,.42,'#fff0c0'],[Math.max(1,wd*.22),.75,'#ffffff']].forEach(([ww,a,c])=>{ctx.globalAlpha=a*k;ctx.fillStyle=c;ctx.fillRect(R(p.x-ww/2),0,Math.max(1,R(ww)),R(p.y));});
      ctx.globalAlpha=k;ctx.fillStyle='#fff6d0';ctx.beginPath();ctx.ellipse(p.x,p.y,wd*1.1,wd*.3,0,0,7);ctx.fill();ctx.globalCompositeOperation='source-over';break;}
    case 'hbS':{// a shadow vortex
      const k=Math.sin(q*Math.PI),r=p.r*(.4+.6*Math.min(1,q*2.5));ctx.globalAlpha=.4*k;ctx.fillStyle='#14061e';ctx.beginPath();ctx.ellipse(p.x,p.y,r,r*.8,0,0,7);ctx.fill();
      ctx.globalAlpha=.8*k;ctx.lineWidth=1;for(let j=0;j<4;j++){const a0=now/120*(j%2?1:-1)+j*1.57,rr=r*(.35+j*.18);ctx.strokeStyle=j%2?'#a070e0':'#5a2a8a';ctx.beginPath();ctx.ellipse(p.x,p.y,rr,rr*.75,0,a0,a0+2.4);ctx.stroke();}break;}
    case 'hbX':{const r=Math.round(p.r*Math.sin(Math.min(1,q*2)*Math.PI*.5)*(1-q*.4));ctx.globalCompositeOperation='lighter';ctx.globalAlpha=1-q;ctx.fillStyle='#ffffff';
      ctx.fillRect(R(p.x-r),R(p.y),r*2+1,1);ctx.fillRect(R(p.x),R(p.y-r),1,r*2+1);ctx.globalAlpha=(1-q)*.6;ctx.fillStyle='#ffe08a';ctx.fillRect(R(p.x-r*.6),R(p.y-r*.6),2,2);ctx.fillRect(R(p.x+r*.6-1),R(p.y+r*.6-1),2,2);ctx.globalCompositeOperation='source-over';break;}
    case 'hbC':{const e=1-q*q,x=p.x+p.dx*e,y=p.y+p.dy*e;ctx.globalCompositeOperation='lighter';ctx.globalAlpha=Math.min(1,q*3);ctx.fillStyle=p.col;ctx.fillRect(R(x),R(y),1,1);ctx.globalCompositeOperation='source-over';break;}}}
{const dp0=drawParts;drawParts=function(ctx,now){const r=dp0.apply(this,arguments);if(!HB.on)return r;try{const P=BV.P;for(let i=0;i<P.length;i++)if(P[i].hb)hbsDraw(ctx,P[i],now);}catch(e){}ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.lineCap='butt';return r;};}

// ----- v0.17.7: the kind vocabulary on the HD stage (fxkind11.js calls hbsKind): a light and a floor decal per kind of skill, so slash, blunt, pierce,
// ranged, heal, buff, debuff, song and a summon each read on the lit stage as they do on the 2D one (the particles themselves draw on both) -----
const HBS_KIND={slash:'#dfe9ff',blunt:'#ffc880',pierce:'#ffffff',ranged:'#f0e0b0',heal:'#7aff8a',buff:'#7affd0',debuff:'#a070e0',song:'#ffd04a',summon:'#ffe9a0'};
function hbsKind(fx,x,y,gy,start,o){if(!hbsOn()||fx==='mag')return;o=o||{};const col=HBS_KIND[fx];if(!col)return;const C=hbRGB(col),w=o.w||20,big=o.big?1.25:1;
  const L=(int,r,life,e)=>hbLight(Object.assign({x,y,foot:gy,r,col:C,int:int*big,t0:start,life},e||{}));
  const D=(r,a,life,e)=>hbDecal(Object.assign({x,y:gy,r,col:C,a,t0:start,life,grow:1,spin:.1},e||{}));
  switch(fx){
    case 'slash':L(1.3,46,260,{fade:'pulse'});D(w*.7,.3,300,{spin:.3});break;
    case 'blunt':L(1.6,64,400);D(w*1.45,.62,540,{spin:.02});if(o.big&&GFX.q.camera&&typeof HD_CAM!=='undefined')gfxCamPush(x,y,HD_CAM.big);break;
    case 'pierce':L(2.2,28,200,{fade:'pulse'});break;
    case 'ranged':L(1,32,220);break;
    case 'heal':L(.9,52,640,{fade:'pulse'});D(w*.9,.5,640,{spin:.1});break;
    case 'buff':L(.8,46,600);D(w*1.05,.5,660,{spin:.3});break;
    case 'debuff':hbLight({x,y,foot:gy,r:54,col:[1,1,1],int:-.55,t0:start,life:560,fade:'pulse'});D(w*.9,.5,620,{col:[.55,.3,.8],spin:-.2});break;
    case 'song':L(.8,50,620,{fade:'pulse'});D(w*1.1,.45,640,{spin:.2});break;
    case 'summon':L(1.8,100,800);D(w*1.3,.8,800,{spin:.2});if(GFX.q.camera&&typeof HD_CAM!=='undefined')gfxCamPush(x,y,HD_CAM.big);break;}}
