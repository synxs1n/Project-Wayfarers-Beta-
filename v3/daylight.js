// ===== daylight.js (v0.4.0): dusk and dawn light =====
// Drawn over the world after the colour tint (world3.js). Dusk: amber glow from the low sun, slanting light shafts, fireflies.
// Dawn: cool low mist, gold shafts, dew sparkles. Pure drawing, no game state, and a still frame under reduced motion.
// Tune: DAYFX.shaft is the shaft strength, DAYFX.motes the ambient count.
const DAYFX={shaft:.16,glow:.2,motes:12,mist:3};
function phaseProg(){const t=((((G&&G.clock)||0)%CLK_LEN)+CLK_LEN)%CLK_LEN,c=CLK_PH.find(p=>t>=p[1]&&t<p[2])||CLK_PH[0];return {ph:c[0],p:(t-c[1])/(c[2]-c[1])};}
// v0.4.1 4.5: dusk and dawn redone. No bright wash and no additive light shafts any more: a multiply colour grade (warm amber at dusk
// sliding to violet, cool blue sliding to gold at dawn), a soft horizon glow along the top edge, long soft shadows cast by buildings away
// from the low sun, lit windows coming on through dusk, fireflies near the ground and a few swallows. Dawn uses the same pieces.
function dayFxDraw(ctx,vw,vh,now,cam,ph,p){
  const still=typeof reducedMotion==='function'&&reducedMotion(),ts=still?0:now,dusk=ph==='dusk',ramp=Math.sin(Math.PI*Math.min(1,Math.max(0,p)))*.7+.3;
  const L=(a,b,t)=>Math.round(a+(b-a)*t),m=WS.m,cx=Math.round(cam.x),cy=Math.round(cam.y);
  ctx.save();
  // 1. colour grade (multiply darkens and tints without washing out)
  const q=dusk?p:1-p;// 0 = closest to day, 1 = closest to night
  const gr=dusk?[L(255,150,q),L(214,132,q),L(170,190,q)]:[L(255,140,q),L(226,150,q),L(196,200,q)];
  ctx.globalCompositeOperation='multiply';ctx.fillStyle=`rgb(${gr[0]},${gr[1]},${gr[2]})`;ctx.fillRect(0,0,vw,vh);
  // 2. long soft shadows: buildings cast away from the low sun (east at dusk, west at dawn), longer as the sun sinks
  ctx.globalCompositeOperation='source-over';
  if(m&&m.bld&&m.bld.length){const len=TS*(1.5+2.5*q),dir=dusk?1:-1,a=(.16+.12*q).toFixed(3);ctx.fillStyle=`rgba(30,20,50,${a})`;
    m.bld.forEach(b=>{const x=b.x*TS-cx,y=b.y*TS-cy,w=b.w*TS,h=b.h*TS;if(x>vw+len||x+w<-len||y>vh||y+h<0)return;
      ctx.beginPath();if(dir>0){ctx.moveTo(x+w,y+h*.25);ctx.lineTo(x+w+len,y+h*.25+len*.35);ctx.lineTo(x+w+len,y+h+len*.35);ctx.lineTo(x+w,y+h);}
      else{ctx.moveTo(x,y+h*.25);ctx.lineTo(x-len,y+h*.25+len*.35);ctx.lineTo(x-len,y+h+len*.35);ctx.lineTo(x,y+h);}ctx.closePath();ctx.fill();});}
  // 3. horizon glow along the top edge, toward the sun's side
  const hg=ctx.createLinearGradient(0,0,0,vh*.35);hg.addColorStop(0,dusk?`rgba(255,140,70,${(.22*ramp).toFixed(3)})`:`rgba(255,200,140,${(.2*ramp).toFixed(3)})`);hg.addColorStop(1,'rgba(255,140,70,0)');
  ctx.fillStyle=hg;ctx.fillRect(0,0,vw,vh*.35);
  const sx=dusk?vw:0,sg=ctx.createRadialGradient(sx,0,2,sx,0,vw*.6);sg.addColorStop(0,`rgba(255,${dusk?150:210},${dusk?80:150},${(.18*ramp).toFixed(3)})`);sg.addColorStop(1,'rgba(255,150,80,0)');ctx.fillStyle=sg;ctx.fillRect(0,0,vw,vh*.5);
  // 4. lit windows coming on through dusk (and going out through dawn)
  const lit=Math.max(0,(q-.35)/.65);
  if(lit>0&&m&&m.lights){ctx.globalCompositeOperation='lighter';m.lights.forEach(Lt=>{const x=Lt[0]-cx,y=Lt[1]-cy,r=(Lt[2]||18)*1.2;if(x<-r||y<-r||x>vw+r||y>vh+r)return;
    const g=ctx.createRadialGradient(x,y,1,x,y,r);g.addColorStop(0,`rgba(255,190,110,${(.3*lit).toFixed(3)})`);g.addColorStop(1,'rgba(255,190,110,0)');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);});
    ctx.globalCompositeOperation='source-over';}
  if(dusk){
    // 5, 6. fireflies near the ground and a few swallows high up: v0.6.3 world particles (worldfx.js), they stay put as the camera moves
    WFXD.ph=ph;WFXD.pq=q;try{wfxDraw2D(ctx,'day',m,cx,cy,vw,vh,ts);}finally{WFXD.ph=null;}
  }else{
    // dawn: low mist and dew sparkles, both gentle
    for(let i=0;i<DAYFX.mist;i++){const drift=((ts/(60+i*25)+i*vw*.4+cam.x*.3)%(vw*1.6)+vw*1.6)%(vw*1.6)-vw*.3,y=vh*(.55+.17*i),rx=vw*.55,ry=vh*.09;
      ctx.save();ctx.translate(drift,y);ctx.scale(1,ry/rx);const mg=ctx.createRadialGradient(0,0,0,0,0,rx);mg.addColorStop(0,`rgba(215,230,250,${(.1*ramp).toFixed(3)})`);mg.addColorStop(1,'rgba(215,230,250,0)');ctx.fillStyle=mg;ctx.beginPath();ctx.arc(0,0,rx,0,6.283);ctx.fill();ctx.restore();}
    WFXD.ph=ph;WFXD.pq=q;try{wfxDraw2D(ctx,'day',m,cx,cy,vw,vh,ts);}finally{WFXD.ph=null;}// dew sparkles in world space (v0.6.3)
  }
  ctx.restore();
}
HOOK.after('worldDraw','daylight','dusk and dawn',function(_,now){try{const m=WS.m;if(!m||(typeof mapIndoor==='function'?mapIndoor(m):m.kind==='dungeon'||m.archive)||!G||G.daily)return;const {ph,p}=phaseProg();if(ph!=='dusk'&&ph!=='dawn')return;
  dayFxDraw(WS.ctx,WS.vw,WS.vh,now,WS.cam,ph,p);}catch(e){}});
