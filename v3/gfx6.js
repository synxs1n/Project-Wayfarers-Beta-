// =================== Beta v0.5.0 Phase 6: graphics quality, shared sprites, parallax hook, menu depth of field ===================
// Tiers and every tunable are in config.js (GFX_Q, GFX_AUTO, GFX_PARA, GFX_CAM). META.cfg.gfx is optional ('auto' when missing),
// META.cfg.gfxAuto remembers the last tier Auto settled on. Nothing here touches the save, the Daily Trial or game state.
// World passes are in gfx6world.js, battle passes in gfx6battle.js. All new motion freezes under reduced motion (gfxStill()).
const GFX_TIERS=['low','medium','high'];
const GFX={q:GFX_Q.medium,tier:'medium',auto:null,failed:{},last:0,n:0,sum:0,fps:0,decisions:0};
function gfxCfg(){const c=META&&META.cfg&&META.cfg.gfx;return GFX_TIERS.includes(c)?c:'auto';}
function gfxAutoStart(){const r=META&&META.cfg&&META.cfg.gfxAuto;return GFX_TIERS.includes(r)?r:GFX_AUTO.start;}
function gfxTier(){const c=gfxCfg();if(c!=='auto')return c;if(!GFX.auto)GFX.auto=gfxAutoStart();return GFX.auto;}
function gfxStill(){return typeof reducedMotion==='function'&&reducedMotion();}
function gfxApply(){const t=gfxTier(),prevAo=GFX.q&&GFX.q.ao,was=GFX.tier;GFX.tier=t;GFX.q=GFX_Q[t];
  try{const h=document.documentElement;GFX_TIERS.forEach(k=>h.classList.toggle('gq-'+k,k===t));[0,1,2].forEach(k=>h.classList.toggle('gq-dof'+k,GFX.q.dof===k));}catch(e){}
  if(was!==t||prevAo!==GFX.q.ao){try{if(typeof WS!=='undefined'&&WS.m&&V.screen==='world')rebuildBase();}catch(e){}}
  return t;}
// Auto: a pure decision from one measured window, so tests can drive it
function gfxAutoDecide(tier,fps,failed){const i=GFX_TIERS.indexOf(tier);if(i<0)return GFX_AUTO.start;
  if(fps<GFX_AUTO.down&&i>0)return GFX_TIERS[i-1];
  if(fps>=GFX_AUTO.up&&i<2&&!(failed&&failed[GFX_TIERS[i+1]]))return GFX_TIERS[i+1];
  return tier;}
function gfxAutoFeed(fps){if(gfxCfg()!=='auto')return gfxTier();const cur=gfxTier(),nx=gfxAutoDecide(cur,fps,GFX.failed);GFX.fps=Math.round(fps);GFX.decisions++;
  if(nx!==cur){if(GFX_TIERS.indexOf(nx)<GFX_TIERS.indexOf(cur))GFX.failed[cur]=1;GFX.auto=nx;try{META.cfg.gfxAuto=nx;saveMeta();}catch(e){}gfxApply();}
  return GFX.auto;}
// frame sampler: only the world and battle screens with no menu open, in a visible tab; long gaps are skipped
function gfxSample(now){const dt=now-GFX.last;GFX.last=now;if(gfxCfg()!=='auto'||!(dt>0)||dt>GFX_AUTO.gap)return;
  if((V.screen!=='world'&&V.screen!=='battle')||V.modal||document.hidden)return;
  GFX.n++;GFX.sum+=dt;if(GFX.sum>=GFX_AUTO.windowMs){const fps=GFX.n*1000/GFX.sum;GFX.n=0;GFX.sum=0;gfxAutoFeed(fps);}}
{const lp0=loop;loop=function(){try{gfxSample(performance.now());}catch(e){}return lp0.apply(this,arguments);};}
{const ac0=applyCfg;applyCfg=function(){const r=ac0.apply(this,arguments);try{gfxApply();}catch(e){}return r;};}
// ----- cached sprites (built once, stamped with drawImage; no gradients or arrays per frame) -----
const G6C={glow:{},shadow:null,vig:{}};
function g6Glow(col){let c=G6C.glow[col];if(c)return c;c=mkCv(32,32);const x=c.getContext('2d'),g=x.createRadialGradient(16,16,0,16,16,16);
  g.addColorStop(0,col);g.addColorStop(.45,col.replace(/[\d.]+\)$/,m=>(parseFloat(m)*.35).toFixed(3)+')'));g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,32,32);return G6C.glow[col]=c;}
function g6Shadow(){if(G6C.shadow)return G6C.shadow;const c=mkCv(24,8),x=c.getContext('2d');x.translate(12,4);x.scale(1,1/3);const g=x.createRadialGradient(0,0,0,0,0,12);
  g.addColorStop(0,'rgba(10,6,24,.42)');g.addColorStop(.6,'rgba(10,6,24,.2)');g.addColorStop(1,'rgba(10,6,24,0)');x.fillStyle=g;x.fillRect(-12,-12,24,24);return G6C.shadow=c;}
function g6Vignette(w,h,a){const k=w+'x'+h+':'+a;let c=G6C.vig[k];if(c)return c;if(Object.keys(G6C.vig).length>8)G6C.vig={};c=mkCv(w,h);const x=c.getContext('2d'),r=Math.hypot(w,h)/2;
  const g=x.createRadialGradient(w/2,h/2,r*.55,w/2,h/2,r);g.addColorStop(0,'rgba(8,4,16,0)');g.addColorStop(1,`rgba(8,4,16,${a})`);x.fillStyle=g;x.fillRect(0,0,w,h);return G6C.vig[k]=c;}
// a hex or rgb colour as an rgba() string, for glow sprites
function g6Rgba(col,a){if(/^#[0-9a-f]{6}$/i.test(col)){const n=parseInt(col.slice(1),16);return `rgba(${n>>16},${(n>>8)&255},${n&255},${a})`;}if(/^rgba?\(/.test(col))return col.replace(/rgba?\(([^,]+),([^,]+),([^,)]+)(,[^)]+)?\)/,`rgba($1,$2,$3,${a})`);return `rgba(255,240,200,${a})`;}
// ----- parallax hook for baked backdrops -----
// bgStatic() bakes a backdrop into one canvas. While PARA.on is set (battle and title frames only), bgStatic() hands back a reused canvas
// composed from a slightly wider bake: the sky band drifts by PARA.off*px, the far band by half that, and the ground plane (from the
// groundPlane() call that drew it) never moves, so units keep standing exactly where they stood. Backdrop choice is untouched.
const PARA={on:false,off:0,cv:null,gy:{},cap:null};
const PARA_SPLIT={meadow:.3,coast:.5,cave:.3,snow:.18,heights:.5,void:.42};// sky/far cut as a share of height; indoor halls drift as one layer
{const gp0=groundPlane;groundPlane=function(ctx,W,H,gy){if(PARA.cap)PARA.gy[PARA.cap]=gy;return gp0.apply(this,arguments);};}
{const bs0=bgStatic;bgStatic=function(theme,W,H,seed){
  if(!PARA.on||!GFX.q.parallax)return bs0.apply(this,arguments);
  try{const P=GFX_PARA.px,WW=W+2*P,key=theme+WW+'x'+H;PARA.cap=key;const wide=bs0.call(this,theme,WW,H,seed);PARA.cap=null;
    const gy=PARA.gy[key]!=null?PARA.gy[key]:Math.floor(H*.62);
    if(!PARA.cv||PARA.cv.width!==W||PARA.cv.height!==H){PARA.cv=mkCv(W,H);}
    const c=PARA.cv.getContext('2d'),o=Math.max(-1,Math.min(1,PARA.off));
    const indoor=/^d_|arena/.test(theme),sp=indoor?0:Math.floor(H*(PARA_SPLIT[theme]!=null?PARA_SPLIT[theme]:.3));
    const band=(y0,y1,k)=>{if(y1<=y0)return;c.drawImage(wide,P+Math.round(o*k*P),y0,W,y1-y0,0,y0,W,y1-y0);};
    band(0,Math.min(sp,gy),1);band(Math.min(sp,gy),gy,.5);band(gy,H,0);return PARA.cv;}
  catch(e){PARA.cap=null;return bs0.apply(this,arguments);}};}
// title screen: a slow drift of the backdrop layers (frozen under reduced motion)
{const td0=titleDraw;titleDraw=function(ctx,W,H,now){PARA.on=!!GFX.q.parallax;PARA.off=gfxStill()?0:Math.sin(now/GFX_PARA.titleMs*Math.PI*2);try{return td0.apply(this,arguments);}finally{PARA.on=false;}};}
// ----- menus: depth of field (the scene behind an open menu dims or blurs, by tier) -----
{const r0=render;render=function(){const r=r0.apply(this,arguments);try{document.documentElement.classList.toggle('mopen',!!V.modal&&(V.screen==='world'||V.screen==='battle'));}catch(e){}return r;};}
// ----- Settings > Graphics -----
function gfxRow(){const c=gfxCfg(),lab={auto:'Auto',low:'Low',medium:'Medium',high:'High'},T=gfxTier();
  const chips=['auto','low','medium','high'].map(k=>`<button class="chip ${c===k?'on':''}" data-act="cfg" data-arg='["gfx","${k}"]'>${lab[k]}</button>`).join('');
  const now=c==='auto'?`Auto is using ${lab[T]}${GFX.fps?' ('+GFX.fps+' fps)':''}.`:'';
  return `<div class="rows gfxrows"><div class="row"><div><b>Graphics</b><small>Lighting, glow, drifting leaves, birds and battle camera. Auto picks by frame rate. ${now}</small></div><div class="chips">${chips}</div></div></div>`;}
{const sb0=settingsBody;settingsBody=function(){return sb0.apply(this,arguments)+gfxRow();};}
