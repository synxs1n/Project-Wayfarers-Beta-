// =================== BATTLE RENDERER (canvas, 60fps) ===================
const IMPACT=190; // ms between an action starting and its hit landing on screen
const BV={P:[],shake:null,flash:null,lastBanner:0,last:0};
let BL={W:316,H:150,sc:3};
// ----- extra backdrops: dungeon halls and the arena -----
ELK.forEach(()=>{});
['meadow','coast','cave','snow','heights','void'].forEach(th=>{
  BG['d_'+th]=function(ctx,W,H,R){
    const D=DTHEME[th];
    gradBands(ctx,0,0,W,bgGY(H),[D.top,shade(D.w[3],1.2),D.w[1],D.w[0]]);
    // back wall bricks
    for(let y=Math.floor(H*.12);y<bgGY(H)-2;y+=6){const off=(y/6)%2?0:7;for(let x=-off;x<W;x+=14){ctx.fillStyle=R()<.3?D.w[2]:R()<.5?D.w[0]:shade(D.w[0],.9);ctx.fillRect(x,y,13,5);}}
    ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(0,0,W,Math.floor(H*.14));
    // pillars and arches
    for(let i=0;i<4;i++){const x=Math.floor(W*(.08+i*.28));ctx.fillStyle=D.w[3];ctx.fillRect(x-1,0,12,bgGY(H));ctx.fillStyle=D.w[2];ctx.fillRect(x,0,10,bgGY(H));ctx.fillStyle=D.w[0];ctx.fillRect(x+7,0,3,bgGY(H));ctx.fillStyle=D.acc;ctx.fillRect(x+3,Math.floor(H*.24),4,4);}
    for(let i=0;i<3;i++){const x=Math.floor(W*(.22+i*.28)),y=Math.floor(H*.24);ctx.fillStyle='#2a1a10';ctx.fillRect(x,y,2,6);ctx.fillStyle='#ffb04a';ctx.fillRect(x-1,y-4,4,4);ctx.fillStyle='#fff0a0';ctx.fillRect(x,y-3,2,2);}
    if(th==='snow')for(let x=0;x<W;x+=4){ctx.fillStyle='#e8faff';ctx.fillRect(x,Math.floor(H*.14),2,2+((x*7)%5));}
    if(th==='meadow')for(let i=0;i<14;i++){const x=Math.floor(R()*W);ctx.fillStyle='#4a3a22';ctx.fillRect(x,Math.floor(H*.14),1,6+Math.floor(R()*14));ctx.fillStyle=D.acc;ctx.fillRect(x-1,Math.floor(H*.14),3,2);}
    groundPlane(ctx,W,H,bgGY(H),[D.f[2],D.f[0],D.f[1],D.f[3]],R,D.f[3]);
    for(let i=0;i<8;i++){const x=Math.floor(R()*W),y=Math.floor(bgGY(H)+4+R()*(H-bgGY(H)-6));ctx.fillStyle=D.acc;ctx.globalAlpha=.5;ctx.fillRect(x,y,3,1);ctx.globalAlpha=1;}
  };
});
BG.arena=function(ctx,W,H,R){
  gradBands(ctx,0,0,W,H,['#3a5a9a','#6a8ac0','#c8b090','#a88a60']);
  for(let i=0;i<3;i++){const y=Math.floor(H*(.1+i*.11));ctx.fillStyle=['#6a4a3a','#7a5a42','#8a6a4a'][i];ctx.fillRect(0,y,W,Math.floor(H*.11));for(let x=0;x<W;x+=3){ctx.fillStyle=['#e8c0a0','#c8805a','#f0d080','#5a7ac8','#c84a4a'][Math.floor(R()*5)];ctx.fillRect(x,y+1+Math.floor(R()*3),2,2);}}
  for(let x=6;x<W;x+=40){ctx.fillStyle='#c83a3a';ctx.fillRect(x,Math.floor(H*.1),8,14);ctx.fillStyle='#f0c050';ctx.fillRect(x+3,Math.floor(H*.1)+4,2,2);}
  ctx.fillStyle='#8a7a6a';ctx.fillRect(0,bgGY(H)-Math.floor(H*.07),W,Math.floor(H*.07));
  groundPlane(ctx,W,H,bgGY(H),['#e0c890','#d0b47a','#c0a068','#a88a58'],R,'#b89a68');
};
function battleTheme(){if(!B)return 'meadow';const th=ZS(B.stage).theme,k=B.spec.kind;if(k==='arena')return 'arena';if(k==='dungeon'||k==='boss'||k==='echoBoss')return 'd_'+th;return th;}
// ----- layout -----
// v0.6.3: slots come from B3.slots (config.js) as [x share, depth on the ground band 0..1]; depth d lands at BATTLE_GROUND top + d*(bot-top)
// through p2GroundY (p2world.js), so feet stay on the ground plane (2.1). The old tables (slotsFor0) are kept for reference.
function slotsFor(side,n,boss){const T=B3.slots[BL.W<260?'tall':'wide'],t=side==='p'?T.p:boss?T.boss[Math.min(3,n)-1]:T.e[Math.min(5,n)-1];
  const r=t.map(([x,d])=>[x,+(.48+d*.49).toFixed(4)]);while(r.length<n)r.push(r[r.length-1]);return r;}
function slotsFor0(side,n,boss){
  if(BL.W<260){ // phones: taller stage, more vertical spread
    if(side==='e'){
      if(boss)return n>2?[[.24,.78],[.44,.5],[.44,.94]]:n>1?[[.24,.8],[.44,.52]]:[[.27,.8]];
      return [[[.27,.78]],[[.2,.6],[.3,.9]],[[.28,.52],[.12,.72],[.32,.92]],[[.28,.5],[.1,.66],[.36,.76],[.18,.94]]][n-1]||[[.27,.5],[.1,.66],[.36,.76],[.18,.94],[.3,.62]];
    }
    return [[.78,.56],[.9,.74],[.7,.92]];
  }
  if(side==='e'){
    if(boss)return n>2?[[.2,.86],[.42,.64],[.44,.88]]:n>1?[[.22,.86],[.42,.66]]:[[.25,.86]];
    return [[[.26,.84]],[[.18,.7],[.32,.88]],[[.27,.62],[.11,.76],[.37,.88]],[[.27,.6],[.1,.72],[.38,.78],[.2,.9]]][n-1]||[[.26,.84],[.1,.72],[.38,.78],[.2,.9],[.3,.62]];
  }
  return [[.76,.64],[.9,.77],[.7,.9]];
}
// v0.3.3: the stage keeps a fixed aspect ratio. Portrait phones keep the tall stage (width follows the screen, 2x scale).
// Everything wider (tablets, desktops, landscape phones at 16:9, 19.5:9 or 21:9) uses ONE fixed 320x150 logical stage that is
// scaled uniformly and centred (pillarbox or letterbox), never stretched. Landscape phones also put the command panel beside the scene.
const WIDE_W=320,WIDE_H=150;
function battleMode(){const vw=window.innerWidth,vh=window.visualViewport?window.visualViewport.height:window.innerHeight,sc=$('screen'),cont=sc?sc.clientWidth:vw-32;
  if(cont<560)return 'tall';return (vh<=560&&vw>vh*1.25)?'side':'wide';}
function layoutBattle(){
  const wrap=$('bwrap');if(!wrap)return;
  const bat=wrap.parentNode,mode=battleMode();
  bat.classList.toggle('bside',mode==='side');bat.classList.toggle('m-tall',mode==='tall');bat.classList.toggle('m-wide',mode==='wide');wrap.style.width='';
  // v0.6.3: on landscape phones the stage column is sized from the screen (the right column keeps at least B3.sideCol px)
  const w=mode==='side'&&bat.clientWidth?Math.max(200,Math.min(bat.clientWidth-B3.sideCol,bat.clientWidth*.62)):(wrap.clientWidth||window.innerWidth-32),cv=$('bcv'),st=$('bstage');
  if(mode==='tall'){
    const sc=2;BL={W:Math.floor(w/sc),H:BL.fitH?BL.fitH:(w<520?196:160),sc,fitH:BL.fitH,short:false,mode};
    cv.width=BL.W;cv.height=BL.H;cv.style.width=BL.W*sc+'px';cv.style.height=BL.H*sc+'px';wrap.style.height=BL.H*sc+'px';
    st.style.width=BL.W+'px';st.style.height=BL.H+'px';st.style.transform=`scale(${sc})`;return;}
  const vh=window.visualViewport?window.visualViewport.height:window.innerHeight,hd=$('hdr')?$('hdr').offsetHeight:0,od=(mode==='side'?0:($('border')?$('border').offsetHeight:0))+b3Extra(mode),bb=document.querySelector('.bbottom');
  // v0.6.3: the wide stage leaves room for the commands (the cards beside them may run on and scroll)
  const cmdEl=$('bcmd'),budget=mode==='side'?vh-hd-od-34:vh-hd-od-(cmdEl&&cmdEl.offsetHeight?cmdEl.offsetHeight:(bb?bb.offsetHeight:0))-34;
  let sc=Math.min((w-8)/WIDE_W,Math.max(budget-8,0)/WIDE_H);sc=Math.max(mode==='side'?1.25:B3.minSc,Math.min(3,Math.floor(sc*4)/4));
  // v0.7.6: the wide layout sizes the stage from what the two columns under it need (b3WideSc), so the screen fits the viewport
  if(mode==='wide')sc=b3WideSc(w,vh,wrap,bat);
  BL={W:WIDE_W,H:WIDE_H,sc,fitH:0,short:false,mode};
  cv.width=WIDE_W;cv.height=WIDE_H;cv.style.width=WIDE_W*sc+'px';cv.style.height=WIDE_H*sc+'px';
  wrap.style.width=Math.round(WIDE_W*sc+8)+'px';wrap.style.height=Math.round(WIDE_H*sc+8)+'px';bat.style.setProperty('--b3w',Math.round(WIDE_W*sc+8)+'px');
  st.style.width=WIDE_W+'px';st.style.height=WIDE_H+'px';st.style.transform=`scale(${sc})`;
  if(mode==='wide')b3WideBot(wrap,bat);else bat.style.removeProperty('--b3bot');
}
function spriteOf(u,walk){if(u.heroArt)return imgOf('bhe:'+u.heroArt,()=>heroCanvas(u.heroArt,walk));return u.side==='p'?imgOf('bh:'+u.id+(walk?':w':'')+lookKey(u.id),()=>heroCanvas(u.id,walk)):imgOf('bm:'+u.art,()=>monCanvas(u.art));}
function unitBox(u){
  const W=BL.W,H=BL.H;
  if(u.side==='p'){const i=B.front.indexOf(u);if(i<0)return null;const [fx,fy]=slotsFor('p',3)[i];const c=spriteOf(u);return {x:Math.round(fx*W),y:Math.round(fy*H),w:c.width,h:c.height,i};}
  const i=B.en.indexOf(u),sl=slotsFor('e',B.en.length,B.boss)[i]||[.26,.86];
  if(u.heroArt){const c=spriteOf(u);return {x:Math.round(sl[0]*W),y:Math.round(sl[1]*H),w:c.width,h:c.height,i};}
  const sz=MON_SIZE(u.art);return {x:Math.round(sl[0]*W),y:Math.round(sl[1]*H),w:sz,h:sz,i};
}
const WHITE={};
function whiteOf(c,key,col){const k=key+(col||'');if(WHITE[k])return WHITE[k];const o=mkCv(c.width,c.height),x=o.getContext('2d');x.drawImage(c,0,0);x.globalCompositeOperation='source-in';x.fillStyle=col||'#ffffff';x.fillRect(0,0,c.width,c.height);return WHITE[k]=o;}
const ICV={};
function iconCv(el){return elShapeCv(el);}
// ----- particles -----
function part(o){o.t0=o.t0||performance.now();BV.P.push(o);if(BV.P.length>500)BV.P.splice(0,BV.P.length-500);}
const ELFX={
 fire:{c:['#ff5a1a','#ffb04a','#ffe08a'],up:-40},water:{c:['#3f8fe0','#8ad0ff','#ffffff'],g:120},earth:{c:['#8a6a3a','#b08a4a','#5a4a2a'],g:200},
 wind:{c:['#5fc9a0','#c8f0e0','#ffffff'],swirl:1},lightning:{c:['#f2c93a','#ffffff','#fff6a0'],bolt:1},ice:{c:['#8fdcf0','#ffffff','#bfefff'],g:40},
 light:{c:['#fff6c8','#f6e7a8','#ffffff'],rays:1},shadow:{c:['#9a6ae0','#3a2a5a','#c8a0ff'],up:-20},hit:{c:['#ffffff','#ffe08a','#ffd04a'],slash:1},arcane:{c:['#c8a0ff','#ffffff','#8a6ad0'],g:0}
};
function burstAt(x,y,el,start,big){
  const E=ELFX[el]||ELFX.hit,n=big?26:14;
  if(E.slash){part({k:'slash',x,y,t0:start,life:180,col:'#ffffff'});}
  if(E.bolt){part({k:'bolt',x,y,t0:start,life:200,col:'#fff6a0',seed:Math.random()*1000});BV.flash={t:start,life:90,col:'rgba(255,255,220,.35)'};}
  if(E.rays)part({k:'rays',x,y,t0:start,life:320,col:'#fff6c8'});
  part({k:'ring',x,y,t0:start,life:260,col:E.c[0],r:big?22:12});
  for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=30+Math.random()*(big?90:60);
    part({k:'p',x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s+(E.up||0),g:E.g||0,swirl:E.swirl?(Math.random()<.5?-1:1):0,t0:start+Math.random()*40,life:280+Math.random()*260,col:E.c[i%3],sz:Math.random()<.3?2:1});}
}
function sparkleUp(x,y,col,start,n){for(let i=0;i<(n||10);i++)part({k:'p',x:x+(Math.random()-.5)*20,y:y-Math.random()*20,vx:(Math.random()-.5)*10,vy:-20-Math.random()*30,g:0,t0:start+Math.random()*200,life:500+Math.random()*300,col,sz:Math.random()<.3?2:1});}
function shatterAt(x,y,start){for(let i=0;i<22;i++){const a=Math.random()*Math.PI*2,s=50+Math.random()*90;part({k:'p',x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-30,g:220,t0:start,life:500+Math.random()*300,col:i%2?'#ffd04a':'#ffffff',sz:2});}part({k:'ring',x,y,t0:start,life:360,col:'#ffd04a',r:30});BV.shake={t:start,life:300,amp:3};BV.flash={t:start,life:120,col:'rgba(255,230,140,.4)'};}
function centerOf(u){const b=unitBox(u);if(!b)return null;return {x:b.x,y:b.y-b.h*.5};}
// engine hook: every popup also spawns matching effects on the canvas
function onFx(u,txt,cls){
  if(!B||V.screen!=='battle')return;const c=centerOf(u);if(!c)return;
  const now=performance.now(),dot=/poison|burn|bleed/.test(cls),start=dot?now:now+IMPACT;
  if(/dmg/.test(cls)){
    if(dot){const col=/poison/.test(cls)?'#b07ae0':/burn/.test(cls)?'#ff8a3a':'#e04848';sparkleUp(c.x,c.y,col,now,8);}
    else{burstAt(c.x,c.y,u.fxEl||'hit',start,/crit|weak/.test(cls));if(/crit/.test(cls))BV.shake={t:start,life:220,amp:2};}
    if(typeof sfx==='function')later(()=>sfx(/crit/.test(cls)?'crit':/weak/.test(cls)?'weak':'hit'),dot?0:IMPACT);
  }else if(cls==='heal'){sparkleUp(c.x,c.y+10,'#7aff8a',now,12);sparkleUp(c.x,c.y+10,'#ffffff',now,4);if(typeof sfx==='function')sfx('heal');}
  else if(cls==='react'){const col=ELC[u.reactEl]||'#ffd04a',pc=ELC[u.reactP]||'#ffffff';part({k:'ring',x:c.x,y:c.y,t0:start,life:460,col:pc,r:44});part({k:'ring',x:c.x,y:c.y,t0:start+60,life:420,col,r:34});part({k:'ring',x:c.x,y:c.y,t0:start+140,life:420,col:'#ffffff',r:22});burstAt(c.x,c.y,u.reactP||'arcane',start,true);burstAt(c.x,c.y,u.reactEl||'arcane',start+90,true);BV.shake={t:start,life:380,amp:3};BV.flash={t:start,life:180,col:(col.length===7?col+'59':col)};if(typeof sfx==='function')later(()=>sfx('react'),IMPACT);}
  else if(txt==='BREAK'){shatterAt(c.x,c.y,start);if(typeof sfx==='function')later(()=>sfx('break'),IMPACT);}
  else if(/good/.test(cls)){part({k:'ring',x:c.x,y:c.y+12,t0:now,life:400,col:'#7affd0',r:16,flat:1});sparkleUp(c.x,c.y+8,'#fff6a0',now,5);}
  else if(/bad/.test(cls)){part({k:'ring',x:c.x,y:c.y,t0:start,life:300,col:'#d07a8a',r:12});}
}
// new actions: casting circles and projectiles
function onAction(a,now){
  const c=centerOf(a);if(!c)return;
  const tg=B.en.concat(B.front).filter(u=>u!==a&&u.fxT&&Math.abs(u.fxT-a.actT)<60);
  const el=a.actEl||(a.actKind==='mag'?'arcane':null);
  if(a.actKind==='mag'||a.actKind==='heal'||a.actKind==='status'||a.actKind==='buff'){
    part({k:'circle',x:c.x,y:unitBox(a).y-1,t0:now,life:420,col:el?ELC[el]||'#c8a0ff':a.actKind==='heal'?'#7aff8a':'#fff6a0'});
    if(typeof sfx==='function')sfx(a.actKind==='heal'?'heal':'cast');
  }else if(typeof sfx==='function')sfx('swing');
  if(a.actKind==='mag')tg.forEach(t=>{const d=centerOf(t);if(d)part({k:'orb',x:c.x,y:c.y,x2:d.x,y2:d.y,t0:now+30,life:IMPACT-30,col:ELC[el]||'#c8a0ff'});});
}
// ----- per-frame draw -----
function battleFrame(now){
  const cv=$('bcv');if(!cv||!B)return;
  const ctx=cv.getContext('2d');ctx.imageSmoothingEnabled=false;
  const W=BL.W,H=BL.H,dt=Math.min(50,now-(BV.last||now));BV.last=now;
  let sx=0,sy=0;if(BV.shake){const p=(now-BV.shake.t)/BV.shake.life;if(p>=0&&p<1){sx=Math.round((Math.random()-.5)*2*BV.shake.amp*(1-p));sy=Math.round((Math.random()-.5)*2*BV.shake.amp*(1-p));}else if(p>=1)BV.shake=null;}
  BV.sx=sx;BV.sy=sy;
  // v0.5.3: with the HD-2D stage (hdstage.js) the backdrop is drawn in WebGL under this canvas, which then only holds units and effects
  if(BV.glStage)ctx.clearRect(0,0,W,H);
  ctx.save();ctx.translate(sx,sy);
  if(BV.glStage&&BV.glUnder)BV.glUnder(ctx,W,H,now);
  const th=battleTheme();if(!BV.glStage){ctx.drawImage(bgStatic(th,W,H),0,0);
  // v0.4.1 1.5: indoor (d_) backdrops have no sky, so no drifting clouds, butterflies or sea glints
  if(!th.startsWith('d_'))bgAnim(ctx,th,W,H,now);}
  if(B.banner&&B.banner.t!==BV.lastBanner){BV.lastBanner=B.banner.t;BV.flash={t:now,life:160,col:'rgba(255,255,255,.35)'};}
  // detect fresh actions
  B.en.concat(B.front,B.back).forEach(u=>{if(u.actT&&u.actT!==u._act){u._act=u.actT;onAction(u,now);}});
  const tgMode=B.mode==='cmd'&&B.menu==='target'&&B.pend;
  const units=B.en.map(u=>({u,b:unitBox(u)})).concat(B.front.map(u=>({u,b:unitBox(u)}))).filter(o=>o.b).sort((a,b)=>a.b.y-b.b.y);
  if(B.weather&&B.weather!=='clear'&&typeof w7BattleGround==='function')w7BattleGround(ctx,W,H,now);// v0.7.7: puddles, ripples, settling flakes, low fog under the units
  units.forEach(({u,b})=>drawUnit(ctx,u,b,now,tgMode));
  // turn arrow
  // v0.6.3: the turn arrow sits where the stage layout put it (b3Lay), drawn with the HUD below
  drawParts(ctx,now);
  // Limit II: a golden sunburst with the hero's element behind it
  if(B.lim2T){const p=(Date.now()-B.lim2T.t)/1100;if(p>=1)B.lim2T=null;else{const cx=W/2,cy=H*.45,col=ELC[B.lim2T.el]||'#ffd04a';ctx.save();ctx.globalAlpha=(1-p)*.75;
    for(let i=0;i<16;i++){const a=i/16*Math.PI*2+p*1.5,r0=10+p*30,r1=r0+40+p*90;ctx.strokeStyle=i%2?col:'#fff2a0';ctx.lineWidth=i%2?2:1;ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*r0,cy+Math.sin(a)*r0);ctx.lineTo(cx+Math.cos(a)*r1,cy+Math.sin(a)*r1);ctx.stroke();}
    ctx.globalAlpha=(1-p)*.35;ctx.fillStyle='#fff2a0';ctx.beginPath();ctx.arc(cx,cy,8+p*60,0,7);ctx.fill();ctx.restore();if(p<.05)BV.shake={t:now,life:500,amp:4};}}
  if(B.weather&&B.weather!=='clear')weatherFX(ctx,B.weather,W,H,now,true);
  // v0.5.8: bars, pips and element badges last, over every sprite, spell particle and weather (unitHud)
  units.forEach(({u,b})=>{try{unitHud(ctx,u,b,now);}catch(e){}});try{b3Arrow(ctx,now);}catch(e){}
  ctx.restore();
  if(BV.flash){const p=(now-BV.flash.t)/BV.flash.life;if(p>=0&&p<1){ctx.fillStyle=BV.flash.col;ctx.globalAlpha=1-p;ctx.fillRect(0,0,W,H);ctx.globalAlpha=1;}else if(p>=1)BV.flash=null;}
}
function targetable(u){
  if(!(B.mode==='cmd'&&B.menu==='target'&&B.pend))return false;
  if(u.side==='e')return !!(B.pend.sk&&u.hp>0&&(B.pend.sk.t==='one'||(typeof healsUndead==='function'&&healsUndead(B.pend.sk,u))));
  return allyTargetable(u);
}
function drawUnit(ctx,u,b,now,tgMode){
  const hero=u.side==='p',dir=hero?-1:1,T=Date.now();
  let x=b.x,y=b.y,alpha=1,walk=false,white=0,lying=false;
  // death and knockouts
  if(!hero&&u.hp<=0){const d=T-(u.deathT||0)-IMPACT;if(u.deathT&&d>700)return;if(d>0){alpha=1-d/700;y+=Math.round(d/700*4);white=d<120?1:0;if(!u._dz){u._dz=1;const c=centerOf(u);for(let i=0;i<18;i++)part({k:'p',x:c.x+(Math.random()-.5)*b.w*.6,y:c.y+(Math.random()-.5)*b.h*.6,vx:(Math.random()-.5)*20,vy:-20-Math.random()*40,g:-10,t0:now,life:600+Math.random()*400,col:i%2?'#ffffff':'#c8a0ff',sz:1});if(typeof sfx==='function')sfx('ko');}}}
  if(hero&&u.hp<=0)lying=true;
  // entrance slide
  const en=T-(u.enterT||0);if(en<450){const p=1-en/450;x+=Math.round(p*p*70)*-dir;}
  // action lunge or cast step
  const a=T-(u.actT||0);
  const AP=a<520&&u.hp>0&&typeof animPose==='function'?animPose(u,a,dir,b):null;
  if(AP){x+=AP.dx||0;y+=AP.dy||0;walk=!!AP.walk;}
  else if(a<520&&u.hp>0){
    if(u.actKind==='phys'){const reach=24;let off;if(a<160)off=reach*(a/160)**.7;else if(a<280)off=reach;else off=reach*(1-(a-280)/240);x+=Math.round(off)*dir;walk=a<160||a>280?Math.floor(a/80)%2===0:false;}
    else{x+=Math.round(Math.sin(Math.min(1,a/520)*Math.PI)*4)*dir;}
  }
  // hit reaction
  const h=T-(u.hitT||0)-IMPACT;
  if(h>=0&&h<320&&!lying){x+=Math.round((1-h/320)*4)*-dir+(Math.floor(h/40)%2?1:-1)*(h<200?1:0);white=white||(h<90?1:0);}
  // break stagger
  if(u.broken&&u.hp>0)x+=Math.floor(now/90)%2;
  const c0=spriteOf(u,walk),c=BV.tint?BV.tint(c0):c0;// v0.5.3: the GL stage (Medium) tints sprites to the light of the scene
  const breathe=!lying&&u.hp>0&&a>520&&Math.floor(now/(hero?620:760)+b.i*.5)%2===1;
  // shadow
  // v0.5.0 2.1: the shadow always sits on the ground plane (b.gy); flying foes hover above theirs with a gentle bob
  if(b.hov&&u.hp>0)y+=Math.round(Math.sin(now/320+b.i)*1.5);
  u._gx=x;u._gt=now;u._ga=alpha;// v0.5.3: where this unit was drawn, for the GL stage's soft shadow
  if(BV.glShadow)BV.glShadow(ctx,x,b.gy!=null?b.gy:b.y,b,alpha);
  else if(!BV.glStage){ctx.fillStyle='rgba(10,6,24,.3)';const sw=Math.round(Math.min(b.w,40)*.4);ctx.beginPath();ctx.ellipse(x,b.gy!=null?b.gy+(y-b.y)*(b.hov?0:1):y,b.hov?Math.max(4,sw-2):sw,b.hov?2:3,0,0,7);ctx.fill();}// the GL stage draws a soft shadow instead
  ctx.globalAlpha=alpha;
  // casting aura
  if(a<520&&u.hp>0&&u.actKind&&u.actKind!=='phys'){const col=ELC[u.actEl]||(u.actKind==='heal'?'#7aff8a':'#fff6a0');const g=ctx.createRadialGradient(x,y-b.h*.45,2,x,y-b.h*.45,b.h*.7);g.addColorStop(0,col+'88');g.addColorStop(1,col+'00');ctx.fillStyle=g;ctx.fillRect(x-b.h,y-b.h*1.2,b.h*2,b.h*1.4);}
  if(lying){ctx.save();ctx.translate(x+(hero?-4:4),y-2);ctx.rotate(hero?-Math.PI/2:Math.PI/2);ctx.globalAlpha=.75;ctx.drawImage(whiteOf(c,'ko'+u.id,'#6a6a7a'),-c.width/2,-c.height+6);ctx.globalAlpha=.55;ctx.drawImage(c,-c.width/2,-c.height+6);ctx.restore();ctx.globalAlpha=1;return;}
  const flip=hero;
  const draw=(img)=>{const dx=Math.round(x-img.width/2),dy=Math.round(y-img.height+1);
    if(breathe){const cut=Math.floor(img.height*.55);
      if(flip){ctx.save();ctx.translate(dx+img.width,dy);ctx.scale(-1,1);ctx.drawImage(img,0,cut,img.width,img.height-cut,0,cut,img.width,img.height-cut);ctx.drawImage(img,0,0,img.width,cut,0,1,img.width,cut);ctx.restore();}
      else{ctx.drawImage(img,0,cut,img.width,img.height-cut,dx,dy+cut,img.width,img.height-cut);ctx.drawImage(img,0,0,img.width,cut,dx,dy+1,img.width,cut);}
      return;}
    if(flip){ctx.save();ctx.translate(dx+img.width,dy);ctx.scale(-1,1);ctx.drawImage(img,0,0);ctx.restore();}else ctx.drawImage(img,dx,dy);};
  if(hero&&typeof stickGlowOf==='function'){const gc=stickGlowOf(G.roster[u.id]);if(gc){const p=.5+.5*Math.sin(now/240);ctx.globalAlpha=.2+.25*p;ctx.fillStyle=gc;ctx.beginPath();ctx.ellipse(x,y-b.h*.45,b.w*.45+p*2,b.h*.5+p*2,0,0,7);ctx.fill();ctx.globalAlpha=alpha;}}
  draw(c);
  if(white)draw(whiteOf(c,(hero?'h':'m')+(u.id||u.art)));
  // v0.6.3: a foe the aimed detonator sets off glows in the detonating element's colour, with a ring at its feet; other targets pulse white
  if(tgMode&&targetable(u)){const dg=typeof detGlow==='function'?detGlow(u):null,k=(hero?'h':'m')+(u.id||u.art);
    if(dg){const p=.5+.5*Math.sin(now/110);ctx.globalAlpha=.3+.3*p;draw(whiteOf(c,k,dg));ctx.globalAlpha=.55+.35*p;ctx.strokeStyle=dg;ctx.lineWidth=1;const gy=b.gy!=null?b.gy:b.y,rw=Math.max(8,Math.min(b.w,44)*.42+p*2);
      ctx.beginPath();ctx.ellipse(b.x,gy,rw,rw*.32,0,0,7);ctx.stroke();ctx.beginPath();ctx.ellipse(b.x,gy,rw*.62,rw*.2,0,0,7);ctx.stroke();ctx.globalAlpha=alpha;}
    else{ctx.globalAlpha=(B.pend&&B.pend.sk&&B.pend.sk.role==='det'?.12:.22)+.18*Math.sin(now/120);draw(whiteOf(c,k));ctx.globalAlpha=alpha;}}
  if(u.side==='p'&&lbReady(u)&&u.hp>0){ctx.globalAlpha=.25+.2*Math.sin(now/150);draw(whiteOf(c,'lb'+u.id,'#ffd04a'));ctx.globalAlpha=alpha;}
  ctx.globalAlpha=1;
  // status flourishes
  const top=y-b.h+(hero?6:4);
  if(has(u,'stun')){for(let i=0;i<3;i++){const t=now/300+i*2.1;ctx.fillStyle='#f2c93a';ctx.fillRect(Math.round(x+Math.cos(t)*7),Math.round(top+Math.sin(t)*2),2,2);}}
  if(has(u,'ward')){ctx.strokeStyle=`rgba(246,231,168,${.45+.25*Math.sin(now/200)})`;ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(x,y-b.h*.45,b.w*.45,b.h*.55,0,0,7);ctx.stroke();}
  if(has(u,'poison')&&Math.floor(now/250)%3===0){ctx.fillStyle='#b07ae0';ctx.fillRect(x-4+Math.floor(now/250)%8,top+6-Math.floor(now/80)%6,2,2);}
  if(has(u,'burn')){ctx.fillStyle=Math.floor(now/100)%2?'#ff8a3a':'#ffd04a';ctx.fillRect(x+3-Math.floor(now/170)%7,y-6-Math.floor(now/60)%10,1,2);}
  if(has(u,'regen')&&Math.floor(now/300)%2){ctx.fillStyle='#7aff8a';ctx.fillRect(x-6+Math.floor(now/300)%12,y-10-Math.floor(now/50)%12,1,1);}
  if(has(u,'haste')){ctx.fillStyle='rgba(122,255,208,.6)';for(let i=0;i<3;i++)ctx.fillRect(x-dir*(10+((now/30+i*7)%8)),y-8-i*7,5,1);}
  if(has(u,'slow')){ctx.fillStyle='rgba(122,168,216,.5)';ctx.fillRect(x-b.w*.3,y-2,b.w*.6,1);}
  // v0.5.8: the HP bar, shield pips, primed mark and element badges draw in a second pass after every sprite (unitHud),
  // so a unit standing in front can no longer cover another unit's bar or element icon
  u._hud={x,y};
}
// v0.5.8: one unit's HUD (bar, limit bar, shield pips, primed mark); battleui.js adds the element badges by wrapping it
function unitHud(ctx,u,b,now){const hero=u.side==='p';const x=(u._hud?u._hud.x:b.x),y=(u._hud?u._hud.y:b.y);
  const bw=hero?24:Math.min(40,Math.round(b.w*.66)),bx=Math.round(x-bw/2),by=y+3;
  if(u.hp>0){
    u._dh=u._dh==null?u.hp:u._dh+(u.hp-u._dh)*Math.min(1,.18);if(Math.abs(u._dh-u.hp)<.5)u._dh=u.hp;
    u._lag=u._lag==null?u.hp:(u._lag>u._dh?Math.max(u._dh,u._lag-u.S.mhp*.006):u._dh);
    ctx.fillStyle='#150b17';ctx.fillRect(bx-1,by-1,bw+2,4);ctx.fillStyle='#3a2a3a';ctx.fillRect(bx,by,bw,2);
    ctx.fillStyle='#ffffff';ctx.fillRect(bx,by,Math.round(bw*u._lag/u.S.mhp),2);
    const pct=u._dh/u.S.mhp;ctx.fillStyle=hero?(pct<.25?'#e8504a':pct<.5?'#f2c93a':'#5ad06a'):'#e8504a';ctx.fillRect(bx,by,Math.round(bw*pct),2);
    if(hero&&limitOpen(u)){const lp=(u.lb||0)/100;ctx.fillStyle='#150b17';ctx.fillRect(bx-1,by+3,bw+2,3);ctx.fillStyle=lp>=1?(Math.floor(now/150)%2?'#c79bff':'#f1e4ff'):'#8a4be0';ctx.fillRect(bx,by+4,Math.round(bw*lp),1);}
    if(u.maxShield){for(let i=0;i<u.maxShield;i++){const px=bx+i*5,py=by+5;ctx.fillStyle='#150b17';ctx.fillRect(px,py,4,4);ctx.fillStyle=u.broken?'#5a3a3a':i<u.shield?'#ffd04a':'#4a4a5a';ctx.fillRect(px+1,py+1,2,2);}}
    // v0.5.3: alpha 254 marks HUD pixels (bars and pips), so the GL stage leaves them unlit and out of the bloom
    if(BV.glFull){ctx.save();ctx.globalCompositeOperation='destination-out';ctx.globalAlpha=1/255;ctx.fillRect(bx-1,by-1,Math.max(bw+2,(u.maxShield||0)*5+1),u.maxShield?10:hero?7:4);ctx.restore();}
    // v0.5.9: no sphere, ring or sparks around a primed unit any more: the floating element badge (primedTag, ui.js) marks it
  }
}

function drawParts(ctx,now){
  const keep=[];
  BV.P.forEach(p=>{
    const t=now-p.t0;if(t<0){keep.push(p);return;}const q=t/p.life;if(q>=1)return;keep.push(p);
    if(p.k==='p'){const s=t/1000;let x=p.x+p.vx*s,y=p.y+p.vy*s+.5*(p.g||0)*s*s;if(p.swirl){const a=s*12*p.swirl;x=p.x+Math.cos(a)*p.vx*s*.6;y=p.y+Math.sin(a)*p.vx*s*.4-s*20;}
      ctx.globalAlpha=1-q*q;ctx.fillStyle=p.col;ctx.fillRect(Math.round(x),Math.round(y),p.sz||1,p.sz||1);}
    else if(p.k==='ring'){const r=Math.max(1,Math.round(p.r*Math.sqrt(q)));ctx.globalAlpha=1-q;ctx.strokeStyle=p.col;ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(p.x,p.y,r,p.flat?r*.35:r*.75,0,0,7);ctx.stroke();}
    else if(p.k==='circle'){const r=Math.round(14*Math.min(1,q*3));ctx.globalAlpha=(1-q)*.9;ctx.strokeStyle=p.col;ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(p.x,p.y,r,r*.3,0,0,7);ctx.stroke();ctx.beginPath();ctx.ellipse(p.x,p.y,r*.6,r*.18,0,0,7);ctx.stroke();
      for(let i=0;i<4;i++){const a=now/200+i*1.57;ctx.fillStyle=p.col;ctx.fillRect(Math.round(p.x+Math.cos(a)*r),Math.round(p.y+Math.sin(a)*r*.3)-Math.round(q*10),1,2);}}
    else if(p.k==='orb'){const e=q*q*(3-2*q),x=p.x+(p.x2-p.x)*e,y=p.y+(p.y2-p.y)*e-Math.sin(q*Math.PI)*10;ctx.globalAlpha=1;ctx.fillStyle=p.col;ctx.fillRect(Math.round(x)-2,Math.round(y)-2,5,5);ctx.fillStyle='#ffffff';ctx.fillRect(Math.round(x)-1,Math.round(y)-1,3,3);
      if(Math.random()<.7)part({k:'p',x,y,vx:(Math.random()-.5)*20,vy:(Math.random()-.5)*20,g:0,t0:now,life:200,col:p.col,sz:1});}
    else if(p.k==='slash'){ctx.globalAlpha=1-q;ctx.fillStyle=p.col;const L=Math.round(20*Math.min(1,q*3));for(let i=-L;i<L;i++){ctx.fillRect(Math.round(p.x+i*.8),Math.round(p.y-i*.6),2,1);}}
    else if(p.k==='bolt'){ctx.globalAlpha=1-q;ctx.fillStyle=p.col;let x=p.x,y=p.y-60;const R=mulberry(Math.floor(p.seed+t/50));while(y<p.y){const nx=x+Math.round((R()-.5)*8);ctx.fillRect(Math.min(x,nx),y,Math.abs(nx-x)+2,4);x=nx;y+=4;}ctx.fillStyle='#ffffff';ctx.fillRect(p.x-1,p.y-2,3,3);}
    else if(p.k==='rays'){ctx.globalAlpha=(1-q)*.8;ctx.fillStyle=p.col;for(let i=0;i<8;i++){const a=i/8*Math.PI*2+q;for(let r=4;r<4+q*24;r+=2)ctx.fillRect(Math.round(p.x+Math.cos(a)*r),Math.round(p.y+Math.sin(a)*r),1,1);}}
  });
  ctx.globalAlpha=1;BV.P=keep;
}

// phones: grow or shrink the stage so the whole battle screen fits without scrolling
function fitBattle(){
  b3TagFit();{const bt=document.querySelector('.battle.b3');if(bt){bt.classList.toggle('b3list',!!document.querySelector('#bcmd .menu.list'));}}
  const wrap=$('bwrap');if(!wrap||(B&&B.menu!=='root'))return;
  const mode=battleMode();
  if(mode!=='tall'){const old=BL.sc,om=BL.mode;layoutBattle();if(Math.abs(BL.sc-old)>.01||om!==BL.mode)renderBattle(true);return;}
  const vh=window.visualViewport?window.visualViewport.height:window.innerHeight;
  const other=($('hdr')?$('hdr').offsetHeight:0)+($('border')?$('border').offsetHeight:0)+b3Extra('tall')+b3Below()+34;
  const room=vh-other,H=clamp(Math.floor(room/BL.sc),140,230);
  if(BL.mode!=='tall'){layoutBattle();renderBattle(true);return;}
  if(Math.abs(H-BL.H)>6&&!fitBattle.busy){fitBattle.busy=1;BL.fitH=H;layoutBattle();renderBattle(true);setTimeout(()=>{fitBattle.busy=0;},300);}
}
