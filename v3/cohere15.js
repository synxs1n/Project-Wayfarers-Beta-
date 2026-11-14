// ===== cohere15.js (v0.20.10): the cohesion pass: the current art style, made uniform (docs/cohere15.md) =====
// The owner: "lean closer to the current style, just more uniform, everything looking like it belongs in the world". No sprite design, map,
// tile paint (the encounter grass stays the 0.20.5 paint) or game number changes: only how the existing art is sampled, outlined, tinted and lit.
//  1 SHARPNESS  one sharpness level: the HD-2D tilt shift blur is off (depth from the distance haze, a little thicker), the battle backdrop is
//               baked without its depth of field blur and sampled nearest (crisp like the units), the battle floor has no mip blur bias.
//  2 OUTLINE    one outline language for things that stand up (props, chests, rocks, buildings, entrances): one texel, the darkest tone of
//               the colour it touches mixed toward the ink #1a1028, never pure black; a second dark ring is folded into the shade of the colour
//               inside it. Sprites keep the chars13 rule (the same ink mix); its faint second drop edge is removed, so every outline is one texel.
//  3 LIGHT      sprites take the realm grade like the ground: in HD-2D the characters' ambient leans toward the realm's ground hue; in the flat
//               view walkers and battle units get the same lean (and the battle units the stage's light on Low). The rim light and contact
//               shadows stay as v0.5.8 / chars13 made them.
//  4 TEXEL      roofs get tile courses and per tile colour variation at sprite texel density (both renderers; the HD-2D slope is cut from it).
//  5 OCCLUSION  the hero is drawn solid over whatever stands in front of him in HD-2D (the roof around him still thins out): he no longer
//               dissolves into the roof's dither.
//  6 BATTLE     units 1.25x on every stage (drawn about their feet; unit boxes grow with them so bars and labels follow), backdrop crisp (1).
//  7 PALETTE    props and buildings lean toward the realm's ground palette (greys and stone most, saturated paint least).
// Toggle: META.cfg.cohere (missing = on), Settings > Display "Unified look". window.__CH15 (tests): .off switches the module off at runtime.
const CH15={off:false,ink:[26,16,40],inkK:.5,dark:56,shade:.74,tintB:.12,tintS:.26,amb:.16,unit:1.25,fog:.05,
  n:{bsp:0,obj:0,roof:0,spr:0,hero:0,flush:0,tint:0},err:[],last:null,dof:{},bk:0};
function ch15On(){if(CH15.off)return false;try{return !(META&&META.cfg&&META.cfg.cohere===false);}catch(e){return true;}}
function ch15Err(e){if(CH15.err.length<20)CH15.err.push(String(e&&e.message||e));}
// the realm's ground hue as a multiplier with luma 1 (the mean of the theme's ground tones), cached per theme
const CH15T={};
function ch15Tint(theme){if(!theme)return null;if(CH15T[theme])return CH15T[theme];const T=THEME[theme];if(!T||!T.g)return null;
  let r=0,g=0,b=0;T.g.forEach(h=>{const c=hx(h);r+=c[0];g+=c[1];b+=c[2];});const n=T.g.length;r/=n;g/=n;b/=n;const l=Math.max(1,r*.299+g*.587+b*.114);
  return CH15T[theme]=[r/l,g/l,b/l];}
function ch15MapTint(m){try{if(!m)return null;if(m.kind==='dungeon'||(typeof mapIndoor==='function'&&mapIndoor(m)))return null;return ch15Tint(m.thv||m.theme);}catch(e){return null;}}
// ----- the outline and palette pass on a standing thing's canvas (a copy; the source is kept for the toggle) -----
// a copy at the source's own pixel density (HD canvases report their logical size; their pixels are the backing store, _rw x _rh)
function ch15Copy(src){if(src.hd){const c=hdCv(src.width,src.height,src.hd),x=c.getContext('2d');x.setTransform(1,0,0,1,0,0);x.imageSmoothingEnabled=false;(x._hdDI||x.drawImage).call(x,src,0,0,src._rw,src._rh,0,0,src._rw,src._rh);x.setTransform(src.hd,0,0,src.hd,0,0);if(src._k13)c._k13=src._k13;return c;}
  const c=mkCv(src.width,src.height);c.getContext('2d').drawImage(src,0,0);return c;}
const ch15W=cv=>cv._rw||cv.width,ch15H=cv=>cv._rh||cv.height;
function ch15Ink(cv,tint,o){o=o||{};const w=ch15W(cv),h=ch15H(cv);if(w<2||h<2)return cv;const x=cv.getContext('2d');let img;try{img=x.getImageData(0,0,w,h);}catch(e){return cv;}
  const d=img.data,N=w*h,S=new Uint8Array(N),D=new Uint8Array(N),E=new Uint8Array(N),L=new Float32Array(N),I=CH15.ink,dk=CH15.dark;
  for(let i=0;i<N;i++){const a=d[i*4+3];if(a<128)continue;S[i]=1;const l=d[i*4]*.299+d[i*4+1]*.587+d[i*4+2]*.114;L[i]=l;if(l<dk)D[i]=1;}
  const nb=[-1,1,-w,w],ok=(i,k)=>{const xx=i%w;if(k===0&&xx===0)return false;if(k===1&&xx===w-1)return false;const j=i+nb[k];return j>=0&&j<N;};
  for(let i=0;i<N;i++){if(!S[i])continue;for(let k=0;k<4;k++){if(!ok(i,k)||!S[i+nb[k]]){E[i]=1;break;}}}
  const out=new Uint8ClampedArray(d);
  // a non dark solid neighbour's colour (the tone the line touches)
  const inner=i=>{let best=-1,bl=-1;for(let k=0;k<4;k++){if(!ok(i,k))continue;const j=i+nb[k];if(S[j]&&!D[j]&&L[j]>bl){bl=L[j];best=j;}}return best;};
  for(let i=0;i<N;i++){if(!S[i]||!D[i])continue;const p=i*4;
    if(E[i]){const j=inner(i);const c=j>=0?[d[j*4]*.45,d[j*4+1]*.45,d[j*4+2]*.45]:[d[p],d[p+1],d[p+2]];
      // an outline pixel: the darkest tone of what it touches toward the ink (never pure black)
      out[p]=c[0]+(I[0]-c[0])*CH15.inkK;out[p+1]=c[1]+(I[1]-c[1])*CH15.inkK;out[p+2]=c[2]+(I[2]-c[2])*CH15.inkK;continue;}
    // a second dark ring right inside an outline pixel: folded into the shade of the colour inside it (one texel outlines)
    let edgeN=false;for(let k=0;k<4;k++){if(ok(i,k)&&E[i+nb[k]]&&D[i+nb[k]]){edgeN=true;break;}}
    const j=inner(i);
    if(edgeN&&j>=0&&o.thin!==false){const s=CH15.shade;out[p]=d[j*4]*s;out[p+1]=d[j*4+1]*s;out[p+2]=d[j*4+2]*s;continue;}
    // interior line art: never pure black, it takes the ink's hue
    if(L[i]<26){out[p]=d[p]+(I[0]-d[p])*.7;out[p+1]=d[p+1]+(I[1]-d[p+1])*.7;out[p+2]=d[p+2]+(I[2]-d[p+2])*.7;}}
  // the realm's palette: greys and stone take most of the ground's hue, saturated paint the least
  if(tint){for(let i=0;i<N;i++){if(!S[i]||D[i])continue;const p=i*4,r=out[p],g=out[p+1],b=out[p+2],mx=Math.max(r,g,b),mn=Math.min(r,g,b),sat=mx?(mx-mn)/mx:0;
    if(o.keepWarm&&sat>.55)continue;// lamps, windows, glows
    const l=r*.299+g*.587+b*.114,k=Math.min(CH15.tintS,CH15.tintB+(CH15.tintS-CH15.tintB)*Math.max(0,1-sat*2.2))*(1-Math.max(0,(l-140)/115)*.7);// light plaster and paper keep their colour
    out[p]=r+(l*tint[0]-r)*k;out[p+1]=g+(l*tint[1]-g)*k;out[p+2]=b+(l*tint[2]-b)*k;}}
  img.data.set(out);x.putImageData(img,0,0);return cv;}
// ----- roofs: tile courses and per tile colour variation in the roof band of a house sprite (m.bsp), at the sprite's own texel size -----
function ch15Roof(cv,b,m){try{if(typeof hdBldKind==='function'&&hdBldKind(m,b)!=='roof')return;}catch(e){return;}
  const w=b.w*TS,h=b.h*TS,x0=Math.max(0,BSP_X-5),x1=Math.min(cv.width,BSP_X+w+5),y0=Math.max(0,BSP_TOP-7),y1=Math.min(cv.height,BSP_TOP+Math.floor(h*.5)),W=x1-x0,H=y1-y0;if(W<4||H<4)return;
  const x=cv.getContext('2d'),img=x.getImageData(x0,y0,W,H),d=img.data,hist={};
  const hue=(r,g,b)=>{const mx=Math.max(r,g,b),mn=Math.min(r,g,b);if(mx-mn<14)return -1;let hh;if(mx===r)hh=((g-b)/(mx-mn)+6)%6;else if(mx===g)hh=(b-r)/(mx-mn)+2;else hh=(r-g)/(mx-mn)+4;return Math.floor(hh*4);};
  for(let i=0;i<d.length;i+=4){if(d[i+3]<200)continue;const l=d[i]*.299+d[i+1]*.587+d[i+2]*.114;if(l<60)continue;const k=hue(d[i],d[i+1],d[i+2]);hist[k]=(hist[k]||0)+1;}
  let best=null,bn=0;for(const k in hist)if(hist[k]>bn){bn=hist[k];best=+k;}if(best==null||bn<W*3)return;
  // how flat the roof already is: a textured roof (thatch, slate families) only takes the colour variation
  let s=0,s2=0,n=0;for(let i=0;i<d.length;i+=4){if(d[i+3]<200)continue;const k=hue(d[i],d[i+1],d[i+2]);if(Math.abs(k-best)>1&&!(best<=1&&k>=23)&&!(best>=23&&k<=1))continue;const l=d[i]*.299+d[i+1]*.587+d[i+2]*.114;s+=l;s2+=l*l;n++;}
  if(!n)return;const sd=Math.sqrt(Math.max(0,s2/n-(s/n)*(s/n))),flat=sd<16;
  for(let yy=0;yy<H;yy++){const course=Math.floor(yy/3),line=yy%3===2,off=(course&1)*2;
    for(let xx=0;xx<W;xx++){const i=(yy*W+xx)*4;if(d[i+3]<200)continue;const k=hue(d[i],d[i+1],d[i+2]);if(k<0||(Math.abs(k-best)>1&&!(best<=1&&k>=23)&&!(best>=23&&k<=1)))continue;
      const l=d[i]*.299+d[i+1]*.587+d[i+2]*.114;if(l<60)continue;
      const tx=Math.floor((xx+x0+off)/4),hsh=hashS(b.x+','+b.y+':'+course+':'+tx)%7;let f=1+(hsh-3)*.03;
      if(line&&flat)f*=.86;else if((xx+x0+off)%4===0)f*=flat?.88:.92;else if(yy%3===0)f*=1.05;
      const warm=(hsh&1)?1.02:.985;d[i]=Math.min(255,d[i]*f*warm);d[i+1]=Math.min(255,d[i+1]*f);d[i+2]=Math.min(255,d[i+2]*f/warm);}}
  x.putImageData(img,x0,y0);CH15.n.roof++;}
// buildings (and entrances) of a map: once per built canvas; the original is kept on the entry so the toggle can put it back
function ch15Bsp(m){const on=ch15On(),tint=ch15MapTint(m);(m.bsp||[]).forEach(q=>{if(!q||!q.cv)return;
    if(!on){if(q._ch15o){q.cv=q._ch15o;q._ch15o=null;}return;}
    if(q._ch15o&&q._ch15s===q.cv)return;const src=q._ch15o||q.cv;
    // the same building is baked several times per rebuild (two water frames, the HD-2D card pass): one pass per content, kept on the map
    const C=m.__ch15c||(m.__ch15c=new Map()),key=(q.b?q.b.k+'@'+q.b.x+','+q.b.y:'?')+':'+src.width+'x'+src.height+':'+ch15Hash(src);let c=C.get(key);
    if(!c){c=ch15Copy(src);ch15Roof(c,q.b,m);ch15Ink(c,tint,{keepWarm:true});C.set(key,c);CH15.n.bsp++;}q._ch15o=src;q.cv=c;q._ch15s=c;});}
// a content hash of a canvas (FNV over its pixels as 32 bit words)
function ch15Hash(cv){try{const w=ch15W(cv),h=ch15H(cv),u=new Uint32Array(cv.getContext('2d').getImageData(0,0,w,h).data.buffer);let x=2166136261;for(let i=0;i<u.length;i++){x^=u[i];x=Math.imul(x,16777619);}return (x>>>0).toString(36);}catch(e){return 'x';}}
HOOK.after('buildMapCanvas','cohere15','one outline, roof courses and the realm palette on building sprites',function(r,m){try{ch15Bsp(m);}catch(e){ch15Err(e);}});
// the HD-2D card pass draws the rows again with m.bsp in place, so the buildings it bakes are added there too: those get the same pass
HOOK.after('hdBakeCards','cohere15','the same pass on the buildings the card bake adds',function(r,m){try{ch15Bsp(m);}catch(e){ch15Err(e);}});
// props drawn from objCanvas (rocks, chests, signs, pillars, tents ...): a processed copy per canvas, the source untouched (OBJ_CACHE)
const CH15O=new WeakMap();
HOOK.xform('objCanvas','cohere15','one outline and the realm palette on props',function(cv,theme,kind){try{if(!cv||!ch15On()||!cv.width)return cv;
  let e=CH15O.get(cv);if(e)return e;e=ch15Ink(ch15Copy(cv),ch15Tint(theme),{keepWarm:true});CH15O.set(cv,e);CH15.n.obj++;return e;}catch(err){ch15Err(err);return cv;}});
// sprites: the chars13 drop edge (alpha 150, the old second pixel at 235) goes, so every sprite outline is one texel
HOOK.xform('paintHD','cohere15','one texel outlines on sprites (no second drop edge)',function(cv){try{if(!cv||!ch15On())return cv;const x=cv.getContext('2d'),img=x.getImageData(0,0,ch15W(cv),ch15H(cv)),d=img.data;let n=0;
  for(let i=3;i<d.length;i+=4){const a=d[i];if(a===150||a===235){d[i]=0;n++;}}if(n){x.putImageData(img,0,0);CH15.n.spr++;}}catch(e){ch15Err(e);}return cv;});
// ----- HD-2D world -----
// 4: roofs a little lower in HD-2D: the ridge stood so close to the camera that its texels came out four times a sprite's (the "slabs")
HOOK.xform('hdRoofProf','cohere15','lower roofs, nearer the sprites\' texel size',function(r){return ch15On()?r*.78:r;});
// 1: no tilt shift blur (one sharpness for the ground and the sprites); depth from a little more distance haze
HOOK.xform('hdLook','cohere15','no tilt shift blur, a little more haze',function(o){try{const D=HD2D.dof;if(CH15.dof.w==null)CH15.dof.w=D.max;const on=ch15On();D.max=on?0:CH15.dof.w;
  if(on&&o)o.fogA=Math.min(.92,o.fogA+CH15.fog);if(window.__PWTEST&&o)CH15.lk={amb:o.amb.slice(),sun:o.sun.slice(),gain:o.gain.slice(),fogA:o.fogA,sat:o.sat,exp:o.exp,shaft:o.shaft};}catch(e){ch15Err(e);}return o;});
// 3: the characters' ambient leans toward the realm's ground hue (the ground's palette carries it; the sprites' did not)
HOOK.before('hdScene','cohere15','sprites take the realm hue',function(gl,S,o){try{if(!ch15On()||!o)return;const t=ch15MapTint(WS.m);if(!t)return;const P=HD.P.char,a=o.amb,k=CH15.amb;
  gl.useProgram(P.p);gl.uniform3f(P.u.uAmb,a[0]*(1-k+k*t[0]),a[1]*(1-k+k*t[1]),a[2]*(1-k+k*t[2]));CH15.n.tint++;}catch(e){ch15Err(e);}});
// 5: the hero solid over whatever stands in front of him (drawn last, lit like the scene, no depth test); the roof round him still thins out
HOOK.after('hdScene','cohere15','the hero stays solid in front of roofs',function(r,gl,S,o,now,still,full){try{if(!ch15On()||!full||!(HD.heroQ>=0))return;const P=HD.P.char;
  gl.useProgram(P.p);gl.uniform1i(P.u.uMode,0);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,HD.atl.t);gl.disable(gl.DEPTH_TEST);gl.disable(gl.BLEND);
  gl.bindBuffer(gl.ARRAY_BUFFER,HD.vb[4]);h2Attribs(gl);gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,HD.heroQ*12);gl.useProgram(HD.P.scene.p);CH15.n.hero++;}catch(e){ch15Err(e);}});
// ----- the flat view: walkers lean toward the realm hue like the HD-2D ones -----
const CH15W=new WeakMap();
function ch15Lean(cv,t,key){if(!cv||!t||!cv.width)return cv;let e=CH15W.get(cv);if(e&&e.k===key)return e.c;
  const c=ch15Copy(cv),x=c.getContext('2d'),img=x.getImageData(0,0,ch15W(c),ch15H(c)),d=img.data,k=CH15.amb;
  for(let i=0;i<d.length;i+=4){if(!d[i+3])continue;d[i]*=1-k+k*t[0];d[i+1]*=1-k+k*t[1];d[i+2]*=1-k+k*t[2];}x.putImageData(img,0,0);CH15W.set(cv,{k:key,c});return c;}
HOOK.xform('walkerCanvas','cohere15','flat view: walkers take the realm hue',function(cv){try{if(!ch15On()||(typeof HD!=='undefined'&&HD.live)||typeof V==='undefined'||V.screen!=='world')return cv;
  const m=WS.m,t=ch15MapTint(m);if(!t)return cv;return ch15Lean(cv,t,m.thv||m.theme);}catch(e){ch15Err(e);return cv;}});
// ----- battle -----
// 1/6: the backdrop baked without the depth of field blur and sampled nearest; the floor without the mip blur bias
function ch15Dof(){try{const on=ch15On();['medium','high'].forEach(t=>{const q=HD_BATTLE[t];if(!q)return;if(CH15.dof[t]==null)CH15.dof[t]=q.dof;q.dof=on?0:CH15.dof[t];});}catch(e){ch15Err(e);}}
HOOK.wrap('hbBake','cohere15','a crisp backdrop',function(next,...a){ch15Dof();const on=ch15On();CH15.bk=on?1:0;let K;try{K=next(...a);}finally{CH15.bk=0;}
  try{if(on&&K&&K.F&&K.F.tex){const gl=HB.gl;gl.bindTexture(gl.TEXTURE_2D,K.F.tex);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);}
    if(K)K._ch15=on;}catch(e){ch15Err(e);}return K;});
HOOK.wrap('hbTex','cohere15','the backdrop source sampled nearest while it bakes',function(next,gl,o){if(CH15.bk&&o&&o.src&&o.pm&&!o.near)o=Object.assign({},o,{near:true});return next(gl,o);});
// 6: units 1.25x about their feet; the boxes grow with them (bars, labels, taps follow), drawUnit gets the unscaled box
function ch15Sc(u){return ch15On()&&typeof B!=='undefined'&&B&&!(u&&u.side==='e'&&!u.boss)?CH15.unit:1;}/* 0.21.1: regular foes keep their own size; heroes and bosses grow */
// a copy (some boxes are handed out again, so the scale is never written into them). A raw wrap, not a hook: battle11.js (foe sizes),
// gfx6battle.js and p2world.js wrap unitBox the old way outside the hook chain and battle11 rewrites a foe's w and h, so this must sit
// outside all of them (cohere15 loads last)
// A unit that would rise past the top of the stage grows less and stands lower; one at a side grows only up to the edge, as battle11 places its big foes (top margin FS11.top)
{const ub0=unitBox;unitBox=function(u){const r=ub0.apply(this,arguments);try{let s=ch15Sc(u);if(r&&s!==1&&!r._ch15){const H=BL.H,top=typeof FS11!=='undefined'&&FS11.top!=null?FS11.top:2;
  s=Math.max(1,Math.min(s,(H-2-top)/Math.max(1,r.h),2*Math.min(r.x,BL.W-r.x)/Math.max(1,r.w)));/* at a side of the stage it grows only as far as the edge */const h=Math.round(r.h*s),o=Object.assign({},r,{w:Math.round(r.w*s),h,_ch15:s});
  if(o.y-h<top){const y=Math.min(top+h,H-2);if(o.gy!=null)o.gy+=y-o.y;o.y=y;}
  return o;}}catch(e){}return r;};}
HOOK.xform('b3Body','cohere15','the body box grows with the unit',function(r,u,b){try{if(!r)return r;const bb=b&&b._ch15?b:unitBox(u),s=bb&&bb._ch15;if(!s||s===1)return r;const fx=bb.x,fy=bb.y+1;
  return {x:fx+(r.x-fx)*s,y:fy+(r.y-fy)*s,w:r.w*s,h:r.h*s};}catch(e){return r;}});
HOOK.wrap('drawUnit','cohere15','battle units 1.25x, drawn about their feet',function(next,ctx,u,b,now,tg){const s=b&&b._ch15;if(!s||s===1)return next(ctx,u,b,now,tg);
  // chars13's mid-ground silhouettes are drawn before the unit; drawn here first, unscaled (its own call then finds them done)
  try{if(typeof C13F!=='undefined'&&C13F.L&&C13F.t===now){c13MidDraw(ctx,b.y);if(u===C13F.last)c13MidDraw(ctx,null);}}catch(e){}
  const b2=Object.assign({},b,{w:Math.round(b.w/s),h:Math.round(b.h/s)}),gy=b.gy!=null?b.gy:b.y;let tint=null;
  // Low (the plain 2D stage): units take the backdrop's realm hue and the stage's light like the floor does
  if(!BV.glStage&&!BV.tint){try{tint=ch15BTint();}catch(e){}}
  ctx.save();const bt=BV.tint;try{ctx.translate(b.x,gy);ctx.scale(s,s);ctx.translate(-b.x,-gy);if(tint)BV.tint=c=>ch15Lean(c,tint,tint.k);return next(ctx,u,b2,now,tg);}finally{BV.tint=bt;ctx.restore();}});
// the 2D stage's tint for units: the realm's ground hue and, outdoors, the time of day's ambient (hdstage hbLook), as one multiplier
function ch15BTint(){const key=battleTheme(),m=WS.m,t=ch15MapTint(m)||[1,1,1];let a=[1,1,1];try{if(typeof hbLook==='function'&&typeof hbInfo==='function'){const L=hbLook(hbInfo(key));if(L&&L.amb){const mx=Math.max(L.amb[0],L.amb[1],L.amb[2],.01);a=L.amb.map(v=>Math.min(1,v/Math.max(mx,1)));}}}catch(e){}
  const r=[t[0]*a[0],t[1]*a[1],t[2]*a[2]];r.k=key+':'+r.map(v=>v.toFixed(2)).join(',');return r;}
// ----- the toggle: caches built under the other state are dropped once, the map and the battle backdrop rebuilt -----
function ch15Sync(){const on=ch15On();if(CH15.last===on)return;const first=CH15.last==null;CH15.last=on;if(first)return;CH15.n.flush++;
  try{Object.keys(IMG).forEach(k=>{delete IMG[k];});}catch(e){}
  try{if(typeof rebuildBase==='function'&&WS.m)rebuildBase();}catch(e){ch15Err(e);}
  try{if(typeof HD!=='undefined'){HD.dirty=true;if(HD.atl&&HD.atl.reset)HD.atl.reset();}}catch(e){}
  try{ch15Dof();if(typeof HB!=='undefined'&&HB.bake)HB.bake.id='';}catch(e){}}
// CH15.last stays null until the first frame (META is read then): what was built before it used ch15On() at build time, so nothing to flush
HOOK.before('worldDraw','cohere15','the Unified look toggle',function(){try{ch15Sync();ch15UI();}catch(e){ch15Err(e);}});
HOOK.before('battleFrame','cohere15','the Unified look toggle',function(){try{ch15Sync();ch15Dof();}catch(e){ch15Err(e);}});
// ----- the menus (owner, after the first pass): the UI chrome in the same language, behind the same toggle -----
// body.ch15 switches it (nothing else changes: no layout, no sizes, no behaviour). The HD skin's surfaces (ui3.css tokens) take the
// world's dark tint, leaning a little toward the realm's ground hue; every frame (panels, dialog and text boxes, buttons, chips, rows,
// cards, slots, the battle command menu and party cards, the HUD chips) gets one dark tinted outline and a 1 px top left highlight bevel
// (the sprite outline and rim light rule), no pure black, no glassy blur behind menus. Text keeps its colours (AA over the darker tint).
// The Flat look (Low) keeps its wood colours and takes only the outline and bevel. Icons drawn through cvURL get the sprite outline pass.
const CH15U={key:'',n:0};
function ch15Mix(a,b,t){return a.map((v,i)=>v+(b[i]-v)*t);}
function ch15Hex(a){return rh(a.map(v=>Math.max(0,Math.min(255,v))));}
function ch15UIVars(theme){const t=ch15Tint(theme)||[1,1,1],I=CH15.ink;
  // a base colour of the old skin pulled toward the same colour's luma in the realm hue, then 20% toward the ink
  const lean=(h,k)=>{const c=hx(h),l=c[0]*.299+c[1]*.587+c[2]*.114,r=ch15Mix(c,[l*t[0],l*t[1],l*t[2]],k);return ch15Hex(ch15Mix(r,I,.2));};
  const g=ch15Mix([200,190,170],[200*t[0],190*t[1],170*t[2]],.5);
  return {'--ch-0':lean('#0b0d17',.3),'--ch-1':lean('#1b1f33',.3),'--ch-2':lean('#121526',.3),'--ch-3':lean('#262b47',.3),'--ch-f':lean('#171a2c',.3),
    '--ch-b0':lean('#2d3354',.28),'--ch-b1':lean('#1e2239',.28),'--ch-h0':lean('#3a4270',.28),'--ch-h1':lean('#262b4a',.28),
    '--ch-ink':ch15Hex(ch15Mix(I,[I[0]*t[0],I[1]*t[1],I[2]*t[2]],.4)),'--ch-hi':'rgba('+g.map(v=>Math.round(Math.min(255,v))).join(',')+',.26)',
    '--ch-line':ch15Hex(ch15Mix([70,58,52],[70*t[0],58*t[1],52*t[2]],.5))};}
function ch15UIRealm(){try{const m=WS&&WS.m;if(m&&!(m.kind==='dungeon'))return m.thv||m.theme;const z=G&&G.run&&ZONES[G.run.order[G.stage||0]];return z?z.theme:'meadow';}catch(e){return 'meadow';}}
function ch15UI(){const b=document.body;if(!b)return;const on=ch15On();if(b.classList.contains('ch15')!==on)b.classList.toggle('ch15',on);if(!on)return;
  const th=ch15UIRealm()||'meadow';if(th===CH15U.key)return;CH15U.key=th;CH15U.n++;const v=ch15UIVars(th);Object.keys(v).forEach(k=>b.style.setProperty(k,v[k]));}
{const st=document.createElement('style');st.id='ch15css';st.textContent=`
html:not(.flat) body.ch15{--ui-ink:var(--ch-ink);--ui-0:var(--ch-0);--ui-1:var(--ch-1);--ui-2:var(--ch-2);--ui-3:var(--ch-3);--ui-face:var(--ch-f);--ink:var(--ch-ink);
  --wood:var(--ch-f);--wood2:var(--ch-3);--wood3:var(--ch-2);
  --ui-panel:linear-gradient(180deg,rgba(255,228,170,.04),rgba(255,228,170,0) 140px),var(--orn-tex),linear-gradient(180deg,var(--ch-1),var(--ch-2));
  --ui-btn:linear-gradient(180deg,var(--ch-b0) 0%,var(--ch-b1) 100%);--ui-btn-h:linear-gradient(180deg,var(--ch-h0) 0%,var(--ch-h1) 100%);
  --ui-shadow:0 0 0 1px var(--ch-ink),0 8px 18px rgba(20,12,34,.45)}
body.ch15 :is(.panel,.dlg,.btn,.chip:not(.chips.mgrp .chip):not(.chips.msub .chip),.row,.card,.slot,button.mini,.eqrow,.swc,.eqs,.mclose,.mback,.wallet,.wchip,.savebar,.tvbar,.ddsel,.upgcard,.upgslot,.sh14-sec,.shopnav,.m11h,.battle .mi,.battle .pc,.battle .fc,.battle .cmdhead,.battle .order,.b4mo){
  border-color:var(--ch-ink);box-shadow:inset 1px 1px 0 var(--ch-hi),0 0 0 1px var(--ch-ink)}
body.ch15 .panel:not(.scroll){box-shadow:inset 1px 1px 0 var(--ch-hi),inset 0 0 0 3px var(--ui-2),inset 0 0 0 4px var(--ui-line-s),0 0 0 1px var(--ch-ink),0 10px 24px rgba(20,12,34,.45)}
body.ch15 .btn,body.ch15 .chip{text-shadow:0 1px 0 var(--ch-ink)}
body.ch15 .btn.gold{border-color:#5f4115;text-shadow:0 1px 0 rgba(255,244,205,.55)}
body.ch15 .btn:disabled{box-shadow:0 0 0 1px var(--ch-ink)}
body.ch15 .chips.mgrp .chip,body.ch15 .chips.msub .chip{border-color:var(--ch-ink)}
body.ch15 :is(.chip.on:not(.chips.mgrp .chip):not(.chips.msub .chip),.card.sel,.swc.sel){box-shadow:inset 1px 1px 0 var(--ch-hi),0 0 0 1px var(--ch-ink),0 0 0 2px var(--ui-gold-lo)}
html.mopen.gq-dof2 body.ch15 #screen{filter:saturate(.85) brightness(.82)}
body.ch15 *{-webkit-backdrop-filter:none!important;backdrop-filter:none!important}
body.ch15 img.gico,body.ch15 .port img,body.ch15 .pbig img{image-rendering:pixelated}
`;document.head.appendChild(st);}
HOOK.after('render','cohere15','body.ch15 and the realm tint of the menus',function(){try{ch15UI();}catch(e){ch15Err(e);}});
// icons drawn through cvURL (items, materials, gear, charms ...): the sprite outline pass on their canvas, a separate cache entry
{const cu0=cvURL;cvURL=function(key,fn){if(!ch15On())return cu0.apply(this,arguments);return cu0.call(this,key+'#ch15',()=>{const c=fn();try{if(c&&c.getContext)ch15Ink(c,null,{thin:true});}catch(e){ch15Err(e);}return c;});};}
// Settings > Display: Unified look (right under HD-2D world)
{const r0=hdRow;hdRow=function(){const on=ch15On();return r0.apply(this,arguments)+`<div class="rows"><div class="row"><div><b>Unified look</b><small>One sharpness, one outline and the realm's light on everything that stands in the world: ground, characters, props, buildings and the battle stage. Off shows the older mixed look.</small></div><div class="chips"><button class="chip ${on?'on':''}" data-act="cfg" data-arg='["cohere",true]'>On</button><button class="chip ${on?'':'on'}" data-act="cfg" data-arg='["cohere",false]'>Off</button></div></div></div>`;};}
try{M11_RANK.unshift(['display',2.5,/"cohere",/]);}catch(e){}
try{window.__CH15=CH15;Object.assign(CH15,{ui:ch15UI,uiVars:ch15UIVars,U:CH15U,on:ch15On,sync:ch15Sync,ink:CH15.ink,inkFn:ch15Ink,tint:ch15Tint,mapTint:ch15MapTint,lean:ch15Lean});}catch(e){}
