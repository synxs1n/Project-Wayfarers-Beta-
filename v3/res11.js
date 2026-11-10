// ===== res11.js (v0.17.3): render resolution follows the display =====
// Owner: "On bigger screens the game looks too pixelated, starts to blur. Increase the amount of pixels we are using."
// d = device pixels per art pixel = view scale x page zoom (deskscale.js) x devicePixelRatio. A 1920x1080 window runs at page zoom 4/3, scale 3:
// d = 4; a 2560x1440 one at zoom 2: d = 6; a phone at dpr 3 and scale 2: d = 6. The constants are RENDER (config.js).
//   HD-2D world (hd2d.js hdPxOf): internal pixels per art pixel = clamp(floor(d / RENDER.k + RENDER.bias), 1, tier pxMax) (d 4 -> 2, d 6 -> 3);
//     ground, props and buildings are doubled with EPX (resEpx) from 2 px on; the characters are sampled at the same density as the scene.
//   Flat view (worldrt.js worldSizeCanvas -> resScale): the integer scale is moved by one when that makes an art pixel a whole number of
//     device pixels (dpr 1.25 / 1.5), and scale 4 or 5 is allowed on boxes RENDER.sc4W / sc5W wide.
//   Battle (hdstage.js hbPlace -> resStageR; here: the unit layer's backing density, battle11.js boss resample).
//   Settings > Render scale: Auto / 1x / 2x / 3x (META.cfg.render).
function resDpr(){try{return Math.max(1,window.devicePixelRatio||1);}catch(e){return 1;}}
function resZoom(){try{return typeof dsZoom==='function'?dsZoom():1;}catch(e){return 1;}}
function resDev(){return resDpr()*resZoom();}
// 0 = Auto, else 1, 2 or 3
function resCfg(){try{const v=META&&META.cfg&&META.cfg.render;return v==='1'||v==='2'||v==='3'?+v:0;}catch(e){return 0;}}
function resPx(d,cap){const c=resCfg();if(c)return Math.min(c,RENDER.max);
  return Math.max(1,Math.min(Math.max(1,Math.min(RENDER.max,cap||RENDER.max,RES.cap||RENDER.max)),Math.floor(d/RENDER.k+RENDER.bias)));}
// Auto steps down by itself on a machine that cannot keep up: gfx6.js Auto graphics measures the frame rate over 3 s windows and, below
// GFX_AUTO.down, would drop the whole tier. While the HD-2D view (or the GL stage) renders above 1x, the first step is one internal pixel
// less (RES.cap; the battle stage and unit layer fall back to their old density, RES.st). It never goes back up on that device (kept in
// localStorage, not in the save: another device has other hardware). Picking a Render scale in Settings clears it. Not under tests
// (window.__PWTEST), which need a fixed value.
const RES={cap:0,st:0,drops:0};
try{RES.cap=+localStorage.getItem('wf_rescap')||0;RES.st=+localStorage.getItem('wf_resst')||0;}catch(e){}
function resKeep(){try{localStorage.setItem('wf_rescap',String(RES.cap||0));localStorage.setItem('wf_resst',String(RES.st||0));}catch(e){}}
{const f0=gfxAutoFeed;gfxAutoFeed=function(fps){try{if(!window.__PWTEST&&resCfg()===0&&gfxCfg()==='auto'&&fps<GFX_AUTO.down){
  if(V.screen==='world'&&HD.live&&HD.pxI>1){RES.cap=HD.pxI-1;RES.drops++;resKeep();GFX.fps=Math.round(fps);GFX.decisions++;return gfxTier();}
  if(V.screen==='battle'&&!RES.st&&(HB.on||resBk()>SPR.k)){RES.st=1;RES.drops++;resKeep();GFX.fps=Math.round(fps);GFX.decisions++;try{resSS($('bcv'),resBk());hbPlace();}catch(e){}return gfxTier();}}}catch(e){}
  return f0.apply(this,arguments);};}
{const c0=ACT.cfg;ACT.cfg=function(arg){const r=c0.apply(this,arguments);try{const a=typeof arg==='string'?JSON.parse(arg):arg;if(a&&a[0]==='render'){RES.cap=0;RES.st=0;resKeep();}}catch(e){}return r;};}
// ----- the flat view's scale -----
function resScale(sc,boxW,zz,cssH){try{let want=sc;if(boxW>=RENDER.sc5W&&cssH>=RENDER.scH)want=Math.max(want,5);else if(boxW>=RENDER.sc4W&&cssH>=RENDER.scH)want=Math.max(want,4);
  const dev=resDpr()*(zz||1),ok=s=>Math.abs(s*dev-Math.round(s*dev))<.02;
  if(ok(want))return want;
  for(const o of [1,-1,2,-2]){const s=want+o;if(s>=2&&s<=5&&ok(s)&&boxW/s>=RENDER.minVw)return s;}
  return want;}catch(e){return sc;}}
// ----- EPX (Scale2x) on a canvas: the pixel art scaler sprhd.js epx() uses on palette indices, here on RGBA words. An edge pixel takes the
// colour of its two neighbours when they agree and differ from the other two; borders repeat; transparent pixels compare equal. -----
function resEpx(cv){const w=cv._rw||cv.width,h=cv._rh||cv.height,x=cv.getContext('2d'),img=x.getImageData(0,0,w,h),A=new Uint32Array(img.data.buffer),N=new Uint32Array(A.length);
  for(let i=0;i<A.length;i++)N[i]=(A[i]>>>24)?A[i]:0;
  const W2=w*2,o=mkCv(W2,h*2),ox=o.getContext('2d'),oi=ox.createImageData(W2,h*2),B=new Uint32Array(oi.data.buffer);
  for(let y=0;y<h;y++){const r0=y*w,ru=y>0?r0-w:r0,rd=y<h-1?r0+w:r0,ob=y*2*W2;
    for(let xx=0;xx<w;xx++){const i=r0+xx,P=A[i],a=N[ru+xx],d=N[rd+xx],c=N[xx>0?i-1:i],b=N[xx<w-1?i+1:i];
      let p1=P,p2=P,p3=P,p4=P;
      if(c===a&&c!==d&&a!==b)p1=A[ru+xx];
      if(a===b&&a!==c&&b!==d)p2=A[ru+xx];
      if(d===c&&d!==b&&c!==a)p3=A[rd+xx];
      if(b===d&&b!==a&&d!==c)p4=A[rd+xx];
      // the corner takes the neighbour's own word (it is the same colour as the matching pair)
      if(p1!==P)p1=xx>0?A[i-1]:p1;
      if(p2!==P)p2=xx<w-1?A[i+1]:p2;
      if(p3!==P)p3=xx>0?A[i-1]:p3;
      if(p4!==P)p4=xx<w-1?A[i+1]:p4;
      const q=ob+xx*2;B[q]=p1;B[q+1]=p2;B[q+W2]=p3;B[q+W2+1]=p4;}}
  ox.putImageData(oi,0,0);return o;}
// the same on a hdCv-style canvas for the battle: n passes of EPX on a bitmap, as a plain canvas (raw pixels)
function resEpxRaw(cv,passes){let c=cv;for(let i=0;i<passes;i++)c=resEpx(c);return c;}
// ----- the battle unit layer: backing pixels per logical pixel (the 2x HD paint doubles evenly into 4) -----
function resBk(){try{if(typeof BL==='undefined'||!BL||!BL.sc||RES.st&&!resCfg())return SPR.k;const d=BL.sc*resDev(),c=resCfg();
  if(c)return c>=3?RENDER.bkHi:SPR.k;return d>=RENDER.bk?RENDER.bkHi:SPR.k;}catch(e){return SPR.k;}}
function resSS(cv,K){if(!cv||!(K>=1)||cv._ss===K)return;
  if(!cv._ss){ssCanvas(cv,K);return;}
  const P=HTMLCanvasElement.prototype,dw=Object.getOwnPropertyDescriptor(P,'width'),dh=Object.getOwnPropertyDescriptor(P,'height'),lw=cv.width,lh=cv.height;
  cv._ss=0;dw.set.call(cv,lw);dh.set.call(cv,lh);ssCanvas(cv,K);
  try{Object.keys(IMG).forEach(k=>{if(k.indexOf('bm:')===0)delete IMG[k];});}catch(e){}}// foes are resampled for the new density
if(typeof SPRITE_HD!=='undefined'&&SPRITE_HD){
  HOOK.after('layoutBattle','res11','resolution of the battle canvas',function(r){try{const cv=$('bcv');if(cv&&cv._ss&&sprHiRes())resSS(cv,resBk());}catch(e){}});
  HOOK.before('battleFrame','res11','resolution of the battle canvas',function(){try{const cv=$('bcv');if(cv&&cv._ss&&sprHiRes()){const K=resBk();if(cv._ss!==K)resSS(cv,K);}}catch(e){}});
}
// the HD-2D characters are sampled at the scene's own density (worldzoom10.js multiplies HD.px by WZ10.px): 2 texels per art pixel at 1x and 2x,
// 3 at 3x, so a card texel is one internal pixel
try{if(typeof WZ10!=='undefined'){const base=WZ10.px;Object.defineProperty(WZ10,'px',{get(){const p=(typeof HD!=='undefined'&&HD.px)||1;return Math.max(base,p)/p;},set(v){},configurable:true});}}catch(e){}
// ----- Settings > Render scale -----
HOOK.xform('settingsBody','res11','Render scale row after Graphics',function(h){try{const row=rsRow();const m=/<div class="rows gfxrows">[\s\S]*?<\/div><\/div><\/div>/.exec(h);
  if(m)return h.slice(0,m.index+m[0].length)+row+h.slice(m.index+m[0].length);return h+row;}catch(e){return h;}});
