// =================== Beta v0.5.3: HD-2D world renderer ===================
// Towns, fields, dungeons, caves, forts, the Echo Sanctum and the Archive drawn as a lit diorama under a tilted perspective camera:
// the map's own ground art is the floor, walls, cliffs and town walls are extruded into blocks with code drawn faces, buildings become
// boxes with gabled roofs cut from their baked sprites, every row of props (trees, lamps, stalls, chests...) stands up as a card, and
// characters are upright billboards with soft shadows. Lighting: ambient and a sun (or moon) by time of day and weather (blended like
// Phase 5's smooth changes), a baked soft sun shadow, point lights from every lamp, torch, window, brazier, crystal and lava tile, glowing
// windows and lamps at night, then bloom, tilt shift depth of field, light shafts, colour grading and a vignette.
// The 2D renderer stays as it was: Low graphics, no WebGL, a lost context, Settings > HD-2D world off, or any error fall back to it.
// Gameplay is untouched: same maps, collision, input (taps go through the camera with a ray cast), minimap and full map.
// Files: hd2dgl.js (WebGL helpers), this file, config.js HD2D, style.css (block at the end). META.cfg.hd2d (optional, default on).
const HD={gl:null,cv:null,P:null,broken:false,lost:false,why:'',live:false,dirty:true,map:null,S:null,rt:null,size:'',atl:null,ib:null,fs:null,
  dyn:null,dynB:null,dynA:null,vb:[null,null,null],cam:null,lastT:0,mats:{p:new Float32Array(16),v:new Float32Array(16),vp:new Float32Array(16)},
  eye:[0,0,0],fwd:[0,0,0],rgt:[0,0,0],up:[0,0,0],tanH:0,asp:1,pk:new Float32Array(7*160),pkn:0,heroQ:-1,frames:0,bakeMs:0,bakes:0,lmv:null,lmR:null,lmn:0,xr:new Float32Array(4),gm:new Float32Array(9),gb:new Float32Array(3),heroNdc:new Float32Array(2),dynUp:0,pt:new Float32Array(4)};
const H2P=new Float32Array(12);
function hdCfgOn(){try{return !(META&&META.cfg&&META.cfg.hd2d===false);}catch(e){return true;}}
function hdTierQ(){let t='medium';try{t=gfxTier();}catch(e){}return HD2D.tiers[t]||null;}
function hdWant(){return !HD.broken&&!HD.lost&&hdCfgOn()&&!(typeof GFX!=='undefined'&&GFX.off)&&!!hdTierQ();}
function hdV(){return 1/Math.cos(HD2D.pitch*Math.PI/180);}
function hdRgb(h){const c=hx(h);return [c[0]/255,c[1]/255,c[2]/255];}
function hdRgba(s){const m=/rgba?\(([^)]+)\)/.exec(s||'');if(!m)return [1,.8,.5,.3];const a=m[1].split(',').map(Number);return [a[0]/255,a[1]/255,a[2]/255,a[3]==null?1:a[3]];}
// ----- context and resources -----
function hdInitGL(){if(HD.gl)return !HD.lost;if(HD.broken)return false;
  try{const cv=document.createElement('canvas');cv.className='wgl';cv.setAttribute('aria-hidden','true');
    const gl=cv.getContext('webgl',{alpha:false,antialias:false,depth:true,stencil:false,premultipliedAlpha:false,preserveDrawingBuffer:false});
    if(!gl){HD.broken=true;HD.why='WebGL is not available';return false;}
    cv.addEventListener('webglcontextlost',e=>{e.preventDefault();HD.lost=true;HD.P=null;HD.rt=null;HD.size='';HD.S=null;HD.map=null;},false);
    cv.addEventListener('webglcontextrestored',()=>{try{hdResources();HD.lost=false;HD.dirty=true;}catch(e){HD.broken=true;HD.why='restore failed';}},false);
    HD.cv=cv;HD.gl=gl;hdResources();return true;
  }catch(e){HD.broken=true;HD.why=String(e&&e.message||e);HD.gl=null;return false;}}
function hdResources(){const gl=HD.gl,A=['aP','aT','aC','aN'];
  HD.P={scene:h2Program(gl,H2SRC.scene_v,H2SRC.scene_f,A),char:h2Program(gl,H2SRC.scene_v,H2SRC.char_f,A),down:h2Program(gl,H2SRC.quad_v,H2SRC.down_f,['aP']),
    blur:h2Program(gl,H2SRC.quad_v,H2SRC.blur_f,['aP']),comp:h2Program(gl,H2SRC.quad_v,H2SRC.comp_f,['aP']),lm:h2Program(gl,H2SRC.lm_v,H2SRC.lm_f,['aP','aQ','aC']),lms:h2Program(gl,H2SRC.lms_v,H2SRC.lms_f,['aP'])};
  HD.ib=h2QuadIndex(gl);HD.fs=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,HD.fs);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  HD.atl=new H2Atlas(gl,1024);HD.vb=[gl.createBuffer(),gl.createBuffer(),gl.createBuffer(),gl.createBuffer(),gl.createBuffer(),gl.createBuffer()];
  HD.dyn=new H2Batch(512);HD.dynB=new H2Batch(256);HD.dynA=new H2Batch(64);HD.dynC=new H2Batch(64);HD.dynCB=new H2Batch(8);// v0.5.8: characters (opaque, blended) for the character program
  HD.lmv=new Float32Array(HD2D.lmMax*4*7);HD.lw=new Float32Array(HD2D.lmMax*4);HD.lmR=new Float32Array(4);
  HD.rt=null;HD.size='';HD.S=null;HD.map=null;HD.dirty=true;HD.blurOk=false;}
// ----- the GL canvas sits under the world view's 2D canvas (WS.cv), same place and CSS size; WS.cv stays on top for taps, weather,
// fades and the battle flash (transparent elsewhere). The view's sizing (worldSizeCanvas), the canvas rebuilt after a battle and the
// CSS upscale stay exactly as for the 2D view: the GL canvas just follows WS.cv each frame (and moves into a rebuilt view).
function hdAttach(){const wc=WS.cv;if(!wc||!wc.isConnected||!wc.parentElement||!(WS.vw>0))return false;const p=wc.parentElement;
  if(HD.cv.parentElement!==p)p.insertBefore(HD.cv,wc);if(!p.classList.contains('hd'))p.classList.add('hd');
  const s=HD.cv.style,W=wc.style.width||wc.width*WS.scale+'px',H=wc.style.height||wc.height*WS.scale+'px',L=wc.offsetLeft+'px',T=wc.offsetTop+'px';
  if(s.width!==W)s.width=W;if(s.height!==H)s.height=H;if(s.left!==L)s.left=L;if(s.top!==T)s.top=T;return true;}
function hdDetach(){HD.live=false;HD.ovClear=null;try{const p=HD.cv&&HD.cv.parentElement;if(p)p.classList.remove('hd');}catch(e){}}
// internal resolution: the tier's pixels per art pixel (1 = the 2D view's own grid: the same pixels as the 2D canvas over it)
function hdSize(q){const sc=WS.scale||2,w=Math.max(16,Math.round(WS.vw*q.px)),h=Math.max(16,Math.round(WS.vh*q.px)),cw=WS.vw*sc,ch=WS.vh*sc,key=w+'x'+h+':'+q.bloom+':'+q.lmap+':'+q.blur;
  if(key!==HD.size){const gl=HD.gl;if(HD.rt)Object.values(HD.rt).forEach(o=>h2RTFree(gl,o));HD.cv.width=w;HD.cv.height=h;
    const qw=Math.max(4,Math.round(w/q.blur)),qh=Math.max(4,Math.round(h/q.blur));
    const cp=h2Tex(gl,gl.LINEAR);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,w,h,0,gl.RGB,gl.UNSIGNED_BYTE,null);// RGB: the canvas has no alpha, and a copy needs matching channels
    HD.rt={cp:{t:cp,f:null,rb:null,w,h},q1:h2RT(gl,qw,qh,false),q2:h2RT(gl,qw,qh,false),lm:h2RT(gl,q.lmap,q.lmap,false)};
    if(q.bloom>1){const ew=Math.max(4,Math.round(qw/2)),eh=Math.max(4,Math.round(qh/2));HD.rt.e1=h2RT(gl,ew,eh,false);HD.rt.e2=h2RT(gl,ew,eh,false);}
    HD.size=key;}
  return {cw,ch,w,h,r:w/cw};}
// =================== per map bake ===================
const H2_OBJ='TtRCcSFWLbxhkmuagNQPeYqoGKl|Dy';
function hdKind(m,c){const dun=m.kind==='dungeon',T=dun?null:THM(m);
  if(c==='#')return dun?1:2;if(c==='Z')return 3;
  if(c==='~'||c==='o'){if(T&&(T.cloud||T.stars))return 5;if(m.theme==='cave'&&!dun)return 6;return 4;}return 0;}
function hdFreeMap(){const gl=HD.gl,S=HD.S;if(!S||!gl)return;['tg0','tg1','tst','tbl','tcd','tsh'].forEach(k=>{if(S[k])gl.deleteTexture(S[k]);});
  ['mg','mst','mbl','mcd'].forEach(k=>h2ChunksFree(gl,S[k]));h2MeshFree(gl,S.mmisc);HD.S=null;}
// code drawn faces and tops for blocks: 4 variants each, 16 px wide
function hdStructCanvas(m,S){const dun=m.kind==='dungeon',T=dun?THEME[m.theme]||THEME.meadow:THM(m),D=DTH(m)||DTHEME.meadow,cv=mkCv(64,128),c=cv.getContext('2d'),HA=S.hArt;
  const f=(col,x,y,w,h)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};S.sy={};
  // band A (rows 0..47): the main block face (dungeon wall, cliff) at full art height
  for(let v=0;v<4;v++){const R=mulberry(v*997+m.s*31+7),x0=v*16,H=HA;
    if(dun){const W=D.w;f(W[0],x0,0,16,H);for(let r=0;r<H;r+=4){const off=(r/4+v)%2?0:4;for(let i=-off;i<16;i+=8){const col=R()<.25?W[2]:R()<.5?W[0]:shade(W[0],.92);f(col,x0+Math.max(0,i),r,Math.min(7,16-Math.max(0,i)),3);f(tint(col,.18),x0+Math.max(0,i),r,Math.min(7,16-Math.max(0,i)),1);}f(W[1],x0,r+3,16,1);}
      f(D.top,x0,0,16,2);f(W[2],x0,2,16,1);f(W[3],x0,H-1,16,1);f('rgba(0,0,0,.18)',x0,H-4,16,3);
      if(m.theme==='meadow'&&R()<.6){const rx=2+Math.floor(R()*10);f('#4a3a22',x0+rx,3,1,8);f('#4a3a22',x0+rx+1,10,1,5);f(D.acc,x0+rx-1,3,3,1);}
      if(m.theme==='coast'&&R()<.6)f(D.acc,x0+Math.floor(R()*12),H-6,4,2);
      if(m.theme==='cave'&&R()<.5){const cx=2+Math.floor(R()*10);f('#ff5a1a',x0+cx,8,1,6);f('#ffb04a',x0+cx,9,1,2);}
      if(m.theme==='snow')for(let i=0;i<16;i+=3)f('#eefaff',x0+i,2,2,1+((i*7+v)%5));
      if(m.theme==='void'&&R()<.6)f(D.acc,x0+Math.floor(R()*14),5+Math.floor(R()*(H-10)),2,2);
      if(m.theme==='heights'&&R()<.4){f(D.acc,x0+6,7,4,1);f(D.acc,x0+7,6,2,3);}}
    else{const C=T.cl;f(C[1],x0,0,16,H);// rough stone blocks, not strata (stripes read as scanlines once tilted)
      for(let r=2;r<H;){const bh=3+Math.floor(R()*3);let sx=-Math.floor(R()*5);while(sx<16){const bw=4+Math.floor(R()*5),a=Math.max(0,sx),w=Math.min(16,sx+bw)-a;if(w>0){f(R()<.3?C[2]:C[0],x0+a,r,w-1,bh-1);f(tint(C[0],.12),x0+a,r,w-1,1);}sx+=bw;}r+=bh;}
      for(let k=0;k<2;k++)if(R()<.5){const cx=2+Math.floor(R()*10),cy=4+Math.floor(R()*Math.max(1,H-9));f(C[3],x0+cx,cy,1,4);f(C[3],x0+cx+1,cy+3,1,2);}
      f(T.lip,x0,0,16,3);for(let i=0;i<16;i+=2)f(T.lip,x0+i,3,1,1+Math.floor(R()*3));f(tint(T.lip,.25),x0,0,16,1);f(C[3],x0,H-2,16,2);
      if(m.theme==='meadow'&&R()<.5)f('#5a8a4a',x0+Math.floor(R()*12),5+Math.floor(R()*6),2,3);}}
  // band B (48..79): town wall face
  {const Sx=T.stone,H=S.zArt;for(let v=0;v<4;v++){const R=mulberry(v*131+m.s),x0=v*16,y0=48;
    if(T.palisade){f(T.g[0],x0,y0,16,H);for(let i=0;i<16;i+=4){f('#5a3a22',x0+i,y0+2,3,H-2);f('#7a5232',x0+i,y0+2,1,H-2);f('#3a2414',x0+i+2,y0+2,1,H-2);f('#5a3a22',x0+i+1,y0,1,2);}continue;}
    f(Sx[1],x0,y0,16,H);for(let r=5;r<H;r+=4){const off=(r/4)%2?0:4;for(let i=-off;i<16;i+=8){f(R()<.3?Sx[2]:Sx[0],x0+Math.max(0,i),y0+r,Math.min(7,16-Math.max(0,i)),3);f(Sx[2],x0+Math.max(0,i),y0+r,1,1);}}
    f(Sx[2],x0,y0+3,16,2);for(let i=0;i<16;i+=6){f(Sx[0],x0+i,y0,4,3);f(Sx[2],x0+i,y0,4,1);}f(Sx[3],x0,y0+H-1,16,1);if(R()<.4)f('#5a8a4a',x0+Math.floor(R()*12),y0+H-4,3,1);}}
  // band C (80..95): tops. dungeon rock, cliff top (grass lip), town wall walk
  for(let v=0;v<4;v++){const R=mulberry(v*71+m.s+3),x0=v*16,y0=80;
    if(dun){f(D.top,x0,y0,16,16);for(let i=0;i<3;i++)f(shade(D.w[3],1.5),x0+Math.floor(R()*14),y0+Math.floor(R()*14),1,1);}
    else{const lip=T.lip;f(lip,x0,y0,16,16);for(let i=0;i<4;i++){const bx=Math.floor(R()*13),by=Math.floor(R()*13);f(R()<.5?shade(lip,.9):tint(lip,.12),x0+bx,y0+by,3,3);}
      if(T.tg)for(let i=0;i<3;i++){const gx=Math.floor(R()*13),gy=Math.floor(R()*12)+2;f(T.tg[0],x0+gx,y0+gy,1,2);f(T.tg[1],x0+gx+1,y0+gy-1,1,3);}}}
  for(let v=0;v<4;v++){const x0=v*16,y0=96,Sx=T.stone;f(Sx[1],x0,y0,16,16);for(let r=0;r<16;r+=4){const off=(r/4+v)%2?0:4;for(let i=-off;i<16;i+=8)f(Sx[0],x0+Math.max(0,i),y0+r,Math.min(7,16-Math.max(0,i)),3);}}
  // band D (112..127): earth bank under the ground (by water), or a rock drop (cloud sea, the void)
  for(let v=0;v<4;v++){const R=mulberry(v*53+m.s+9),x0=v*16,y0=112,deep=T.cloud||T.stars,C=T.cl,base=deep?C[1]:shade((T.g||D.f)[3],.62);
    f(base,x0,y0,16,16);for(let r=0;r<16;r+=3)f(deep?C[3]:shade(base,.8),x0,y0+r+2,16,1);for(let i=0;i<4;i++)f(deep?C[2]:shade(base,1.25),x0+Math.floor(R()*14),y0+Math.floor(R()*15),2,1);
    if(!deep&&T.lip)f(T.lip,x0,y0,16,1);}
  return cv;}
// strips of every prop row: drawObjects (with every wrapper: dungeon props, boards, boats, gates, entrances) onto a row strip; their soft
// ground shadows land on the ground canvases instead
function hdBakeCards(m,S,g0,g1){const fa=m.kind==='field'&&m.fortAt&&m.t[m.fortAt[1]]?m.fortAt:null,fc=fa?m.t[fa[1]][fa[0]]:null;// v0.6.3: no cave mouth card on the gatehouse
  if(fa)m.t[fa[1]][fa[0]]='U';try{return hdBakeCards0(m,S,g0,g1);}finally{if(fa)m.t[fa[1]][fa[0]]=fc;}}
function hdBakeCards0(m,S,g0,g1){const W=m.w*TS,SH=64,UP=58,CW=8,st=mkCv(W,SH),sc=st.getContext('2d',{willReadFrequently:true});
  const want=c=>H2_OBJ.indexOf(c)>=0||(c==='E'&&m.kind==='field');
  const pk=new H2Pack(2048),items=[];const sh0=shadowAt,c0=g0.getContext('2d'),c1=g1.getContext('2d');
  shadowAt=function(ctx,cx,cy,rx,ry){sh0(c0,cx,cy,rx,ry);sh0(c1,cx,cy,rx,ry);};
  try{for(let y=0;y<m.h;y++){let any=false;for(let x=0;x<m.w&&!any;x++)if(want(tileAt(m,x,y)))any=true;if(!any)continue;
    sc.setTransform(1,0,0,1,0,0);sc.clearRect(0,0,W,SH);sc.imageSmoothingEnabled=false;sc.setTransform(1,0,0,1,0,-((y+1)*TS-UP));
    drawObjects(sc,m,y);sc.setTransform(1,0,0,1,0,0);
    // only what was drawn becomes geometry: per 8 px column, the rows that hold any pixel; neighbouring columns merge into one quad
    const d=sc.getImageData(0,0,W,SH).data,nc=Math.ceil(W/CW),top=new Int16Array(nc).fill(-1),bot=new Int16Array(nc);
    for(let c=0;c<nc;c++){const x0=c*CW,x1=Math.min(W,x0+CW);let t=-1,b=-1;
      for(let r=0;r<SH&&t<0;r++)for(let x=x0;x<x1;x++)if(d[(r*W+x)*4+3]>40){t=r;break;}
      if(t<0)continue;for(let r=SH-1;r>=t&&b<0;r--)for(let x=x0;x<x1;x++)if(d[(r*W+x)*4+3]>40){b=r;break;}top[c]=t;bot[c]=b;}
    let c=0;while(c<nc){if(top[c]<0){c++;continue;}let e=c,t=top[c],b=bot[c];
      while(e+1<nc&&top[e+1]>=0&&Math.abs(top[e+1]-t)<12&&(e+1-c)*CW<256){e++;t=Math.min(t,top[e]);b=Math.max(b,bot[e]);}
      const x0=c*CW,w=Math.min(W,(e+1)*CW)-x0,h=b-t+1,r=pk.add(w,h),cv=mkCv(w,h);cv.getContext('2d').drawImage(st,x0,t,w,h,0,0,w,h);
      items.push({r,cv,x0,w,t,h,z:(y+1)*TS+.5});c=e+1;}}}
  finally{shadowAt=sh0;}
  if(!items.length)return null;const AW=2048,AH=Math.min(HD.maxTex||4096,pk.height()),at=mkCv(AW,AH),ac=at.getContext('2d');
  const V=S.V,bt=new H2Chunks(m.w*TS,m.h*TS,HD2D.chunk*TS);
  items.forEach(it=>{if(it.r.y+it.h>AH)return;ac.drawImage(it.cv,it.r.x,it.r.y);const u0=it.r.x,u1=it.r.x+it.w,v0=it.r.y,v1=it.r.y+it.h;// atlas pixels, scaled when the atlases merge
    const yt=(UP-it.t)*V,yb=(UP-it.t-it.h)*V;H2P.set([it.x0,yt,it.z,it.x0+it.w,yt,it.z,it.x0+it.w,yb,it.z,it.x0,yb,it.z]);bt.at(it.x0+it.w/2,it.z-8).quad(H2P,u0,v0,u1,v1,255,255,255,255,0,.45,.89,2|8);});
  return {cv:at,bt};}
// v0.6.3: the fortress gatehouse in a field (sites.js) was painted flat into the ground art, with the cave mouth card standing in front
// of it. In HD-2D it is now built like the buildings: two towers (front, sides, top, merlons) and a recessed curtain wall with the gate
// arch and portcullis between them, over its 3 x 2 tile footprint (the 'U' tiles and the 'E' gate), textured from a small code drawn
// sheet. The 2D view keeps its flat painting.
const H2G={W:96,H:48,tw:14,th:40,ch:28,rec:6};
function hdGateTex(){return hdSpr('gatehouse',H2G.W,H2G.H,(c)=>{const f=(col,x,y,w,h)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
  const brick=(x,y,w,h,base,dk,lt,sd)=>{f(base,x,y,w,h);let r=sd;for(let yy=y+4;yy<y+h;yy+=5){f(dk,x,yy,w,1);const off=((yy-y)/5)%2?0:3;for(let xx=x+off;xx<x+w;xx+=6)f(dk,xx,yy-4,1,4);}
    for(let i=0;i<w*h/40;i++){r=(r*1103515245+12345)>>>0;f(lt,x+r%w,y+(r>>8)%h,2,1);}};
  // tower front (0,0 14x40): bricks, an arrow slit, a red banner with a gold mark, dark edges
  brick(0,0,14,40,'#6e6e7a','#4a4a54','#8a8a96',7);f('#3a3a44',0,0,1,40);f('#3a3a44',13,0,1,40);f('#9a9aa6',0,0,14,1);
  f('#120c10',6,6,2,7);f('#2a2a34',3,14,8,1);f('#c0392b',4,15,6,14);f('#9a2a20',4,27,2,2);f('#9a2a20',8,27,2,2);f('#ffd04a',6,18,2,3);f('#ffd04a',5,19,4,1);
  // tower side (14,0 32x40)
  brick(14,0,32,40,'#5c5c68','#40404a','#74747e',11);f('#9a9aa6',14,0,32,1);f('#120c10',29,8,2,6);
  // curtain front (46,0 20x28): bricks, the gate arch with its portcullis, a keystone
  brick(46,0,20,28,'#7a7a86','#55555f','#9a9aa6',5);f('#9a9aa6',46,0,20,1);
  c.fillStyle='#120c10';c.beginPath();c.ellipse(56,12,6,5,0,Math.PI,0);c.fill();f('#120c10',50,12,12,16);
  f('#3a2a1a',50,10,12,1);for(let i=0;i<4;i++)f('#3a2a1a',51+i*3,10,1,18);f('#3a2a1a',50,17,12,1);f('#3a2a1a',50,23,12,1);
  f('#b0b0bc',55,5,2,2);f('#4a4a54',49,9,1,19);f('#4a4a54',62,9,1,19);
  // merlons: tower (66,0 14x6), curtain (66,8 20x5), tower side (0,42 32x6); transparent gaps (cut out by the depth pass)
  const mer=(x,y,w,h,base,lt)=>{f(base,x,y+h-2,w,2);for(let xx=x;xx<x+w;xx+=5){f(base,xx,y,Math.min(3,x+w-xx),h);f(lt,xx,y,Math.min(3,x+w-xx),1);}};
  mer(66,0,14,6,'#6e6e7a','#9a9aa6');mer(66,8,20,5,'#7a7a86','#a8a8b4');mer(0,42,32,6,'#5c5c68','#8a8a96');});}
function hdGatePart(m){if(!m||m.kind!=='field'||!m.fortAt)return null;const [fx,fy]=m.fortAt;return {b:{x:fx-1,y:fy-1,w:3,h:2,k:'gatehouse',door:[fx,fy]},cv:hdGateTex()};}
function hdGateGeo(m,S,b,Q,U,Vv,p,V,bt){const G2=H2G,x0=b.x*TS,x1=x0+b.w*TS,zb=b.y*TS,zf=(b.y+b.h)*TS,tw=G2.tw,hT=G2.th*V,hC=G2.ch*V,zc=zf-G2.rec,xl=x0+tw,xr=x1-tw,mt=6*V,mc=5*V;
  const top=hdRgb('#8a8a94').map(v=>Math.round(v*235)),ctop=hdRgb('#92929c').map(v=>Math.round(v*235)),flat=(a,c)=>{H2P.set(a);bt.quad(H2P,-1,0,-1,0,c[0],c[1],c[2],255,0,1,0,8);};
  [[x0,xl],[xr,x1]].forEach(([a,e])=>{
    Q([a,hT,zf,e,hT,zf,e,0,zf,a,0,zf],U(p,0),Vv(p,0),U(p,tw),Vv(p,G2.th),255,[0,0,1],2|8);// front
    Q([a,hT,zb,a,hT,zf,a,0,zf,a,0,zb],U(p,14),Vv(p,0),U(p,46),Vv(p,G2.th),255,[-1,0,0],8);// west side
    Q([e,hT,zf,e,hT,zb,e,0,zb,e,0,zf],U(p,14),Vv(p,0),U(p,46),Vv(p,G2.th),255,[1,0,0],8);// east side
    flat([a,hT,zb,e,hT,zb,e,hT,zf,a,hT,zf],top);
    Q([a,hT+mt,zf,e,hT+mt,zf,e,hT,zf,a,hT,zf],U(p,66),Vv(p,0),U(p,80),Vv(p,6),255,[0,0,1],2|8);// merlons, front and back
    Q([a,hT+mt,zb+.5,e,hT+mt,zb+.5,e,hT,zb+.5,a,hT,zb+.5],U(p,66),Vv(p,0),U(p,80),Vv(p,6),255,[0,0,1],8);
    Q([a+.5,hT+mt,zb,a+.5,hT+mt,zf,a+.5,hT,zf,a+.5,hT,zb],U(p,0),Vv(p,42),U(p,32),Vv(p,48),255,[-1,0,0],8);
    Q([e-.5,hT+mt,zf,e-.5,hT+mt,zb,e-.5,hT,zb,e-.5,hT,zf],U(p,0),Vv(p,42),U(p,32),Vv(p,48),255,[1,0,0],8);});
  Q([xl,hC,zc,xr,hC,zc,xr,0,zc,xl,0,zc],U(p,46),Vv(p,0),U(p,66),Vv(p,G2.ch),255,[0,0,1],2|8);// the curtain wall with the gate
  flat([xl,hC,zb,xr,hC,zb,xr,hC,zc,xl,hC,zc],ctop);
  Q([xl,hC+mc,zc,xr,hC+mc,zc,xr,hC,zc,xl,hC,zc],U(p,66),Vv(p,8),U(p,86),Vv(p,13),255,[0,0,1],2|8);
  S.bh.push({b,h:hT});}
// buildings: roofed houses become boxes with a gabled roof cut from their 2D sprite; keeps a box with battlements; tents, the lighthouse
// and anything unusual stand up as one card. Signs and landmark props (towngfx) come from the town decor pass as a card on the facade.
function hdBldKind(m,b){if(b.k==='gatehouse')return 'gate';if(b.k==='lighthouse')return 'card';const T=THM(m);let mat=T.mat;if(['guild','keep','chapel','tower','windmill'].includes(b.k))mat=m.theme==='void'?'tent':'stone';
  if(mat==='tent'||b.k==='bigtent')return 'card';if(b.k==='keep'||b.k==='tower')return 'keep';return 'roof';}
function hdBakeBuildings(m,S,bsp,deco){const V=S.V,sin=Math.sin(HD2D.pitch*Math.PI/180),pk=new H2Pack(1024),parts=[];
  {const g=hdGatePart(m);if(g)bsp=(bsp||[]).concat([g]);}// v0.6.3: the fortress gatehouse stands up as towers and a curtain wall
  (bsp||[]).forEach(q=>{parts.push({q,r:pk.add(q.cv.width,q.cv.height)});});
  const decoParts=[];if(deco){m.bld.forEach(b=>{if(!SVC_LOOK||!SVC_LOOK[b.k])return;const x=b.x*TS-28,y=(b.y+b.h)*TS-50,w=b.w*TS+56,h=56;decoParts.push({b,x,y,w,h,r:pk.add(w,h)});});
    (m._qb||[]).forEach(([qx,qy])=>{const x=qx*TS-12,y=qy*TS+14,w=40,h=16;decoParts.push({board:1,qx,qy,x,y,w,h,r:pk.add(w,h)});});}
  if(!parts.length&&!decoParts.length)return null;
  const AW=1024,AH=Math.min(HD.maxTex||4096,pk.height()),at=mkCv(AW,AH),ac=at.getContext('2d'),CB=new H2Chunks(m.w*TS,m.h*TS,HD2D.chunk*TS);let bt=null;
  parts.forEach(p=>{if(p.r.y+p.q.cv.height<=AH)ac.drawImage(p.q.cv,p.r.x,p.r.y);});
  decoParts.forEach(p=>{if(p.r.y+p.h<=AH)ac.drawImage(deco,p.x,p.y,p.w,p.h,p.r.x,p.r.y,p.w,p.h);});
  const U=(p,sx)=>p.r.x+sx,Vv=(p,sy)=>p.r.y+sy;// atlas pixels, scaled when the atlases merge
  const Q=(a,u0,v0,u1,v1,sh,n,fl)=>{H2P.set(a);bt.quad(H2P,u0,v0,u1,v1,sh,sh,sh,255,n[0],n[1],n[2],fl);};
  S.bh=[];S.mills=[];S.smoke=[];
  parts.forEach(p=>{const b=p.q.b,cv=p.q.cv,k=hdBldKind(m,b),w=b.w*TS,h=b.h*TS,x0=b.x*TS,x1=x0+w,zf=(b.y+b.h)*TS,zb=b.y*TS,zm=(zf+zb)/2;
    if(p.r.y+cv.height>AH)return;bt=CB.at(x0+w/2,zm);
    if(k==='card'){const yb=-6*V,yt=(cv.height-6)*V,cx0=x0-BSP_X;Q([cx0,yt,zf+.2,cx0+cv.width,yt,zf+.2,cx0+cv.width,yb,zf+.2,cx0,yb,zf+.2],U(p,0),Vv(p,0),U(p,cv.width),Vv(p,cv.height),255,[0,.45,.89],2|8);
      S.bh.push({b,h:cv.height*.55*V});return;}
    if(k==='gate'){hdGateGeo(m,S,b,Q,U,Vv,p,V,bt);return;}
    const top=BSP_TOP;
    if(k==='keep'){const Hk=Math.max(22,Math.round(h+10-h*sin)),cr=9,yk=Hk*V,yc=(Hk-cr)*V;
      Q([x0,yc,zf,x1,yc,zf,x1,0,zf,x0,0,zf],U(p,BSP_X),Vv(p,top+h-(Hk-cr)),U(p,BSP_X+w),Vv(p,top+h),255,[0,0,1],2|8);
      Q([x0,yk,zf,x1,yk,zf,x1,yc,zf,x0,yc,zf],U(p,BSP_X),Vv(p,top-11),U(p,BSP_X+w),Vv(p,top-11+cr),255,[0,0,1],2|8);
      const sx0=BSP_X+3,sx1=BSP_X+11,sy0=top+12,sy1=top+h-6;
      Q([x0,yk,zb,x0,yk,zf,x0,0,zf,x0,0,zb],U(p,sx0),Vv(p,sy0),U(p,sx1),Vv(p,sy1),255,[-1,0,0],8);
      Q([x1,yk,zf,x1,yk,zb,x1,0,zb,x1,0,zf],U(p,sx0),Vv(p,sy0),U(p,sx1),Vv(p,sy1),255,[1,0,0],8);
      const st=hdRgb(THM(m).stone[2]).map(v=>Math.round(v*235));H2P.set([x0,yk,zb,x1,yk,zb,x1,yk,zf,x0,yk,zf]);bt.quad(H2P,-1,0,-1,0,st[0],st[1],st[2],255,0,1,0,8);
      if(top-11>2){const ah=top-11;Q([x0-BSP_X,yk+ah*V,zm,x0-BSP_X+cv.width,yk+ah*V,zm,x0-BSP_X+cv.width,yk,zm,x0-BSP_X,yk,zm],U(p,0),Vv(p,0),U(p,cv.width),Vv(p,ah),255,[0,.45,.89],2|8);}
      S.bh.push({b,h:yk});return;}
    // roofed house
    const roofH=Math.floor(h*.5),wy=roofH-1,rt=-6,WH=h-wy,rows=roofH-(rt-1),dh=h/2+3,RH=Math.max(6,rows-dh*sin),yw=WH*V,yr=(WH+RH)*V,ze=zf+3,zbe=zb-3;
    Q([x0,yw,zf,x1,yw,zf,x1,0,zf,x0,0,zf],U(p,BSP_X),Vv(p,top+wy),U(p,BSP_X+w),Vv(p,top+h),255,[0,0,1],2|8);
    const sx0=BSP_X+2,sx1=BSP_X+9,sy0=top+wy+4,sy1=top+h-5;
    Q([x0,yw,zb,x0,yw,zf,x0,0,zf,x0,0,zb],U(p,sx0),Vv(p,sy0),U(p,sx1),Vv(p,sy1),255,[-1,0,0],8);
    Q([x1,yw,zf,x1,yw,zb,x1,0,zb,x1,0,zf],U(p,sx0),Vv(p,sy0),U(p,sx1),Vv(p,sy1),255,[1,0,0],8);
    Q([x0,yr,zm,x0,yr,zm,x0,yw,zf,x0,yw,zb],U(p,sx0),Vv(p,sy0),U(p,sx1),Vv(p,sy0+6),255,[-1,0,0],8);
    Q([x1,yr,zm,x1,yr,zm,x1,yw,zb,x1,yw,zf],U(p,sx0),Vv(p,sy0),U(p,sx1),Vv(p,sy0+6),255,[1,0,0],8);
    const rx0=x0-5,rx1=x1+5,ys=(WH-1)*V,nf=Math.hypot(ze-zm,yr-ys),nb=Math.hypot(zm-zbe,yr-ys);
    Q([rx0,yr,zm,rx1,yr,zm,rx1,ys,zbe,rx0,ys,zbe],U(p,BSP_X-5),Vv(p,top+rt-1),U(p,BSP_X+w+5),Vv(p,top+roofH),215,[0,(zm-zbe)/nb,-(yr-ys)/nb],8);
    Q([rx0,yr,zm,rx1,yr,zm,rx1,ys,ze,rx0,ys,ze],U(p,BSP_X-5),Vv(p,top+rt-1),U(p,BSP_X+w+5),Vv(p,top+roofH),255,[0,(ze-zm)/nf,(yr-ys)/nf],2|8);
    const ah=top+rt-1;if(ah>2)Q([x0-BSP_X,yr+ah*V,zm+.3,x0-BSP_X+cv.width,yr+ah*V,zm+.3,x0-BSP_X+cv.width,yr,zm+.3,x0-BSP_X,yr,zm+.3],U(p,0),Vv(p,0),U(p,cv.width),Vv(p,ah),255,[0,.45,.89],2|8);
    S.bh.push({b,h:(WH+RH*.6)*V});
    if(b.k==='windmill')S.mills.push([x0+w/2,(WH+RH*.8)*V,ze+2]);
    if(b.k!=='guild'&&b.k!=='chapel'&&b.k!=='windmill')S.smoke.push([x0+Math.floor(w*.72)+3,yr+7*V,zm+.5]);
    if(b.k==='smithy'&&SVC_LOOK&&SVC_LOOK.smithy)S.smoke.push([x0+9,yr+16*V,zm+.5]);});
  decoParts.forEach(p=>{if(p.r.y+p.h>AH)return;bt=CB.at(p.x+p.w/2,p.y+p.h-8);if(p.board){const z=(p.qy+1)*TS+1.5,yt=p.h*V;Q([p.x,yt,z,p.x+p.w,yt,z,p.x+p.w,0,z,p.x,0,z],U(p,0),Vv(p,0),U(p,p.w),Vv(p,p.h),255,[0,.45,.89],0);return;}
    const zf=(p.b.y+p.b.h)*TS+.8,yb=-6*V,yt=(p.h-6)*V;Q([p.x,yt,zf,p.x+p.w,yt,zf,p.x+p.w,yb,zf,p.x,yb,zf],U(p,0),Vv(p,0),U(p,p.w),Vv(p,p.h),255,[0,.2,.98],2|8);});
  return {cv:at,bt:CB};}
// one texture for props and buildings (cards atlas on top, buildings below): one texture bind and one draw group fewer per frame
function hdMergeProps(cards,blds){if(!cards&&!blds)return null;const ch=cards?cards.cv.height:0,bh=blds?blds.cv.height:0,AW=2048,AH=Math.min(HD.maxTex||4096,ch+bh),cv=mkCv(AW,AH),c=cv.getContext('2d');
  if(cards)c.drawImage(cards.cv,0,0);if(blds)c.drawImage(blds.cv,0,ch);if(cards)cards.bt.mapUV(1/AW,0,1/AH,0);if(blds)blds.bt.mapUV(1/AW,0,1/AH,ch/AH);return cv;}
// town decor (signs, landmark props, the board's label), drawn once onto a map sized canvas through the town's own decor pass
function hdBakeDeco(m){if(m.kind!=='town'||typeof townDecorActors!=='function')return null;const W=m.w*TS,H=m.h*TS,dc=mkCv(W,H),sv={ctx:WS.ctx,vw:WS.vw,vh:WS.vh,m:WS.m},bs=boardState;
  try{WS.ctx=dc.getContext('2d');WS.vw=W;WS.vh=H;WS.m=m;boardState=()=>null;const arr=[];townDecorActors(arr,0,0,0);
    arr.forEach(a=>{if(a.deco&&(a.deco.indexOf('building:')===0||a.deco==='board')){try{a.draw();}catch(e){}}});}
  finally{WS.ctx=sv.ctx;WS.vw=sv.vw;WS.vh=sv.vh;WS.m=sv.m;boardState=bs;}return dc;}
// soft sun shadows: a heightfield (blocks, buildings, trees, rocks, pillars) marched toward three suns: day (R), dusk (G), dawn (B)
function hdBakeShadow(m,S){const k=4,MW=Math.ceil(m.w*TS/k),MH=Math.ceil(m.h*TS/k),HF=new Float32Array(MW*MH),V=S.V;let any=false;
  for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++){const h=S.HT[y*m.w+x];if(h>0){any=true;for(let j=0;j<4;j++)for(let i=0;i<4;i++)HF[(y*4+j)*MW+x*4+i]=h;}}
  (S.bh||[]).forEach(o=>{const b=o.b;any=true;for(let y=b.y*4;y<(b.y+b.h)*4;y++)for(let x=b.x*4;x<(b.x+b.w)*4;x++)if(y>=0&&x>=0&&y<MH&&x<MW)HF[y*MW+x]=Math.max(HF[y*MW+x],o.h);});
  const OB={T:[7,26],t:[6,10],R:[6,8],Y:[9,34],P:[4,24],N:[4,22],e:[8,14],W:[4,20],k:[7,10],x:[5,10],b:[4,10],h:[6,8]};
  for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++){const o=OB[tileAt(m,x,y)];if(!o)continue;any=true;const cx=(x*TS+8)/k,cz=(y*TS+11)/k,r=o[0]/k,hh=o[1]*V;
    for(let j=Math.floor(cz-r);j<=Math.ceil(cz+r);j++)for(let i=Math.floor(cx-r);i<=Math.ceil(cx+r);i++){if(i<0||j<0||i>=MW||j>=MH)continue;const d=((i-cx)**2+(j-cz)**2)/(r*r);if(d<=1)HF[j*MW+i]=Math.max(HF[j*MW+i],hh*(1-.35*d));}}
  if(!any)return null;let mx=0;for(let i=0;i<HF.length;i++)if(HF[i]>mx)mx=HF[i];
  const out=new Uint8Array(MW*MH*4),suns=HD2D.suns;
  [suns.day,suns.dusk,suns.dawn].forEach((L,ch)=>{const lh=Math.hypot(L[0],L[2]),dx=L[0]/lh,dz=L[2]/lh,rise=L[1]/lh,tmax=mx/rise,step=k;
    for(let j=0;j<MH;j++)for(let i=0;i<MW;i++){const h0=HF[j*MW+i];if(h0>0)continue;let s=0;
      for(let t=step;t<=tmax;t+=step){const ii=Math.floor(i+dx*t/k),jj=Math.floor(j+dz*t/k);if(ii<0||jj<0||ii>=MW||jj>=MH)break;if(HF[jj*MW+ii]>t*rise){s=1;break;}}
      out[(j*MW+i)*4+ch]=s*255;}});
  // soften: one 3x3 box pass
  const o2=new Uint8Array(out.length);for(let j=0;j<MH;j++)for(let i=0;i<MW;i++)for(let ch=0;ch<3;ch++){let a=0,n=0;for(let b=-1;b<=1;b++)for(let c=-1;c<=1;c++){const ii=i+c,jj=j+b;if(ii<0||jj<0||ii>=MW||jj>=MH)continue;a+=out[(jj*MW+ii)*4+ch];n++;}o2[(j*MW+i)*4+ch]=a/n;}
  for(let i=3;i<o2.length;i+=4)o2[i]=255;return {w:MW,h:MH,d:o2};}
// lights in 3D: the 2D light lists (building lanterns, wall torches, the stairs, plus scanLights' lamps, braziers, waystones, gates,
// crystals, lava and runes) placed on the object they belong to, with their 2D colour
const H2_LT={L:['lamp',22,1,1],v:['fire',12,1,1.2],W:['cyan',16,.5,1],G:['gold',14,.5,1],K:['cyan',6,.5,1],P:['violet',16,.5,1],'~':['lava',2,-8,1],N:['cyan',16,.5,1]};
function hdBakeLights(m,S,lights){const V=S.V,out=[],T=m.kind==='dungeon'?null:THM(m),push=(x,y,z,r,type,k)=>{const c=hdRgba(LIGHTC[type]||LIGHTC.lamp),s=Math.min(1.15,c[3]*2.4)*(k||1);out.push(x,y,z,r,c[0]*s,c[1]*s,c[2]*s,['lamp','fire','cyan','gold','violet','lava','torch','day'].indexOf(type));};
  S.torch=[];S.beam=[];
  for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++){const c=tileAt(m,x,y),L=H2_LT[c];if(!L)continue;
    if(c==='P'&&!(m.theme==='cave'||m.theme==='void'))continue;if(c==='~'&&!(m.theme==='cave'&&m.kind!=='dungeon'&&(x+y)%3===0))continue;if(c==='N'&&!(m.kind==='field'&&G.cleared[m.s]))continue;
    const z=c==='~'?y*TS+8:(y+1)*TS+L[2];push(x*TS+8,L[1]*V,z,(c==='L'?24:c==='v'?30:c==='~'?22:c==='G'?26:c==='K'?18:c==='P'?16:c==='W'?20:18)*2.6,L[0],L[3]);}
  (lights||[]).forEach(L=>{const t=L[3]||'lamp',lx=L[0],ly=L[1],tx=Math.floor(lx/TS),ty=Math.floor(ly/TS),r=(L[2]||18)*2.5;
    if(t==='torch'){const z=(ty+1)*TS+3,yy=S.hArt*.6*V;push(lx,yy,z+5,r*.9,'torch');S.torch.push([lx,yy,z-2.4]);return;}
    if(t==='day'){push(lx,30*V,ty*TS+10,r*1.1,'day',.7);S.beam.push([lx,ty*TS+9]);return;}
    const b=m.bld.find(b=>lx>=b.x*TS-6&&lx<=(b.x+b.w)*TS+6&&ly>=b.y*TS-64&&ly<=(b.y+b.h)*TS+6);
    if(b){const zf=(b.y+b.h)*TS;push(lx,Math.max(4,zf-ly)*V,zf+4,r,t);return;}
    push(lx,10*V,ly+10,r,t);});
  return new Float32Array(out);}
// what the ground, blocks and sun shadows depend on: tile kinds with props folded (a chest opening, a lever or bars only re-cut the cards)
function hdSig(m){let s=m.id+':'+(m.thv||'')+':'+(GFX.q&&GFX.q.ao?1:0)+':'+(G.cleared&&G.cleared[m.s]?1:0)+':';const F={c:'C',K:'C','|':'.',D:'.',l:'.'};
  for(let y=0;y<m.h;y++){let r='';for(let x=0;x<m.w;x++){const c=tileAt(m,x,y);r+=F[c]||c;}s+=r;}return s;}
function hdBakeProps(m){const S=HD.S,gl=HD.gl,t0=performance.now(),save={lights:m.lights,smoke:m.smoke,bsp:m.bsp,torches:m.torches&&m.torches.slice(),mills:m.mills&&m.mills.slice()};
  ['tcd'].forEach(k=>{if(S[k])gl.deleteTexture(S[k]);S[k]=null;});['mcd','mbl'].forEach(k=>{h2ChunksFree(gl,S[k]);S[k]=null;});
  let cards,deco,blds;const dummy=mkCv(1,1);
  try{cards=hdBakeCards(m,S,dummy,dummy);deco=hdBakeDeco(m);blds=hdBakeBuildings(m,S,save.bsp,deco);}
  finally{m.lights=save.lights;m.smoke=save.smoke;m.bsp=save.bsp;if(save.torches)m.torches=save.torches;if(save.mills)m.mills=save.mills;}
  S.L=hdBakeLights(m,S,(save.lights||[]).concat([]));
  {const pc=hdMergeProps(cards,blds);if(pc)S.tcd=h2TexFrom(gl,pc);}if(cards)S.mcd=cards.bt.build(gl);if(blds)S.mbl=blds.bt.build(gl);
  HD.dirty=false;HD.bakeMs=performance.now()-t0;HD.bakes++;HD.partial=(HD.partial||0)+1;}
function hdBake(m){const sig=hdSig(m);if(HD.S&&HD.S.m===m&&HD.S.sig===sig&&HD.map===m)return hdBakeProps(m);
  const t0=performance.now(),gl=HD.gl,V=hdV(),S={m,V,sig,hArt:m.kind==='dungeon'?HD2D.wall.dungeon:HD2D.wall.cliff,zArt:HD2D.wall.town};hdFreeMap();
  HD.maxTex=gl.getParameter(gl.MAX_TEXTURE_SIZE)||4096;
  const save={lights:m.lights,smoke:m.smoke,bsp:m.bsp,torches:m.torches&&m.torches.slice(),mills:m.mills&&m.mills.slice()};
  let g0,g1,cards=null,blds=null,deco=null,sh=null;const d0=drawObjects;
  const fa=m.fortAt;// v0.6.3: the gatehouse is geometry in HD-2D (hdGateGeo), not paint on the ground
  try{drawObjects=function(){};try{m.fortAt=null;g0=buildMapCanvas(m,0);g1=buildMapCanvas(m,1);}finally{drawObjects=d0;m.fortAt=fa;}
    m.lights=save.lights;m.smoke=save.smoke;m.bsp=save.bsp;
    const W=m.w,H=m.h,HT=new Float32Array(W*H),KD=new Uint8Array(W*H);S.HT=HT;S.KD=KD;
    const hOf=k=>k===1?HD2D.wall.dungeon*V:k===2?HD2D.wall.cliff*V:k===3?HD2D.wall.town*V:k===4?HD2D.water*V:k===5?HD2D.deep*V:k===6?HD2D.water*V:0;
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){const k=hdKind(m,tileAt(m,x,y));KD[y*W+x]=k;HT[y*W+x]=hOf(k);}
    cards=hdBakeCards(m,S,g0,g1);deco=hdBakeDeco(m);blds=hdBakeBuildings(m,S,save.bsp,deco);
    m.lights=save.lights;m.smoke=save.smoke;m.bsp=save.bsp;if(save.torches)m.torches=save.torches;if(save.mills)m.mills=save.mills;
    if(m.kind!=='dungeon')sh=hdBakeShadow(m,S);
    S.L=hdBakeLights(m,S,(save.lights||[]).concat([]));
    // geometry: ground and water tops (ground texture), block tops and faces and banks (struct texture)
    const st=hdStructCanvas(m,S),MWp=W*TS,MHp=H*TS,dun=m.kind==='dungeon',CS=HD2D.chunk,GC=new H2Chunks(MWp,MHp,CS*TS),SC=new H2Chunks(MWp,MHp,CS*TS),misc=new H2Batch(8);
    const hAt=(x,y)=>x<0||y<0||x>=W||y>=H?0:HT[y*W+x];// past the edge counts as ground, so edge blocks get their faces
    const T=dun?null:THM(m),D=DTH(m);
    for(let y=0;y<H;y++){let x=0;while(x<W){const k=KD[y*W+x],h=HT[y*W+x];
      if(k===1||k===2||k===3){x++;continue;}let e=x+1;while(e<W&&KD[y*W+e]===k&&HT[y*W+e]===h&&e%CS!==0)e++;// runs stop at chunk edges
      H2P.set([x*TS,h,y*TS,e*TS,h,y*TS,e*TS,h,(y+1)*TS,x*TS,h,(y+1)*TS]);GC.at(x*TS+1,y*TS+8).quad(H2P,x*TS/MWp,y*TS/MHp,e*TS/MWp,(y+1)*TS/MHp,255,255,255,255,0,1,0,k===6||(k===5&&T&&T.stars)?4:1);x=e;}}
    const tv=(x,y)=>((x*7+y*13)%4+4)%4;
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){const k=KD[y*W+x],h=HT[y*W+x],v=tv(x,y),u0=v*16/64,u1=(v*16+16)/64;
      if(k===1||k===2||k===3){H2P.set([x*TS,h,y*TS,(x+1)*TS,h,y*TS,(x+1)*TS,h,(y+1)*TS,x*TS,h,(y+1)*TS]);
        // a wall top that the 2D view drew as a top (its south neighbour is wall too) keeps that art and its rims; face tiles get a plain top
        if(k!==2&&y+1<H&&KD[(y+1)*W+x]===k){GC.at(x*TS+8,y*TS+8).quad(H2P,x*TS/MWp,y*TS/MHp,(x+1)*TS/MWp,(y+1)*TS/MHp,255,255,255,255,0,1,0,8);}
        else{const top=k===3?96:80;SC.at(x*TS+8,y*TS+8).quad(H2P,u0,top/128,u1,(top+16)/128,255,255,255,255,0,1,0,8);}}
      const fy0=k===3?48:k===1||k===2?0:112,fh=k===3?S.zArt:k===1||k===2?S.hArt:16,fl=k>=1&&k<=3?8:0;
      const face=(hn,P,n)=>{if(hn>=h)return;const span=(h-hn)/V,v1=(fy0+Math.min(fh,span))/128;H2P.set(P);SC.at(x*TS+8,y*TS+8).quad(H2P,u0,fy0/128,u1,v1,255,255,255,255,n[0],n[1],n[2],fl);};
      const hs=hAt(x,y+1),hw=hAt(x-1,y),he=hAt(x+1,y);
      face(hs,[x*TS,h,(y+1)*TS,(x+1)*TS,h,(y+1)*TS,(x+1)*TS,hs,(y+1)*TS,x*TS,hs,(y+1)*TS],[0,0,1]);
      face(hw,[x*TS,h,y*TS,x*TS,h,(y+1)*TS,x*TS,hw,(y+1)*TS,x*TS,hw,y*TS],[-1,0,0]);
      face(he,[(x+1)*TS,h,(y+1)*TS,(x+1)*TS,h,y*TS,(x+1)*TS,he,y*TS,(x+1)*TS,he,(y+1)*TS],[1,0,0]);}
    // the world past the map's edge: a skirt of the edge's own kind (rock above dungeons, dark ground outdoors), lost in fog
    {const B=1600,hs=dun?HD2D.wall.dungeon*V:0,col=dun?hdRgb(D.top):hdRgb(shade(T.g[3],.8)),c=col.map(v=>Math.round(v*255));
      [[-B,-B,MWp+B,0],[-B,MHp,MWp+B,MHp+B],[-B,0,0,MHp],[MWp,0,MWp+B,MHp]].forEach(([a,b2,c2,d])=>{H2P.set([a,hs,b2,c2,hs,b2,c2,hs,d,a,hs,d]);misc.quad(H2P,-1,0,-1,0,c[0],c[1],c[2],255,0,1,0,0);});}
    // upload
    // one texture per water frame for the ground and the block faces: the code drawn faces sit in a strip under the map's ground art
    const GH=MHp+st.height,mk=g=>{const c=mkCv(Math.max(MWp,st.width),GH),x=c.getContext('2d');x.drawImage(g,0,0);x.drawImage(st,0,MHp);return c;},G0=mk(g0),G1=mk(g1),GW=G0.width;
    GC.mapUV(MWp/GW,0,MHp/GH,0);SC.mapUV(st.width/GW,0,st.height/GH,MHp/GH);
    S.tg0=h2TexFrom(gl,G0);S.tg1=h2TexFrom(gl,G1);S.mg=GC.build(gl);S.mst=SC.build(gl);S.mmisc=h2Mesh(gl,misc);
    {const pc=hdMergeProps(cards,blds);if(pc)S.tcd=h2TexFrom(gl,pc);}if(cards)S.mcd=cards.bt.build(gl);if(blds)S.mbl=blds.bt.build(gl);
    if(sh){S.tsh=h2Tex(gl,gl.LINEAR);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,sh.w,sh.h,0,gl.RGBA,gl.UNSIGNED_BYTE,sh.d);S.shInv=[1/(sh.w*4),1/(sh.h*4)];}
    else{S.tsh=h2Tex(gl,gl.NEAREST);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([0,0,0,255]));S.shInv=[0,0];}
    S.W=MWp;S.H=MHp;S.maxH=Math.max(HD2D.wall.dungeon,HD2D.wall.cliff)*V+70*V;
  }finally{drawObjects=d0;m.lights=save.lights;m.smoke=save.smoke;m.bsp=save.bsp;}
  HD.S=S;HD.map=m;HD.dirty=false;HD.bakeMs=performance.now()-t0;HD.bakes++;}
// =================== lighting state: time of day, weather, place ===================
const H2L={gfog:[0,0,0],amb:[0,0,0],sun:[0,0,0],sd:[0,0,0],fog:[0,0,0],fogA:0,fogS:1,exp:1,con:1,sat:1,vig:0,lift:[0,0,0],gain:[1,1,1],emis:0,lamp:0,shW:[0,0,0],shA:0,shaft:0,shC:[0,0,0],pl:0,plC:[1.05,.85,.6],plR:90,bloom:0};
function hdMix(o,a,w){o.amb[0]+=a.amb[0]*w;o.amb[1]+=a.amb[1]*w;o.amb[2]+=a.amb[2]*w;o.sun[0]+=a.sun[0]*w;o.sun[1]+=a.sun[1]*w;o.sun[2]+=a.sun[2]*w;
  o.fog[0]+=a.fog[0]*w;o.fog[1]+=a.fog[1]*w;o.fog[2]+=a.fog[2]*w;o.fogA+=a.fogA*w;o.exp+=a.exp*w;o.con+=a.con*w;o.sat+=a.sat*w;o.vig+=a.vig*w;
  for(let i=0;i<3;i++){o.lift[i]+=a.lift[i]*w;o.gain[i]+=a.gain[i]*w;o.sd[i]+=a.sd[i]*w;o.shW[i]+=(a.sh||[0,0,0])[i]*w;o.shC[i]+=(a.shC||[1,.9,.7])[i]*w;}
  o.emis+=a.emis*w;o.lamp+=a.lamp*w;o.shaft+=(a.shaft||0)*w;o.pl+=(a.pl||0)*w;o.bloom+=(a.bloom||0)*w;}
function hdZero(o){['amb','sun','fog','lift','gain','sd','shW','shC'].forEach(k=>{o[k][0]=o[k][1]=o[k][2]=0;});o.fogA=o.exp=o.con=o.sat=o.vig=o.emis=o.lamp=o.shaft=o.pl=o.bloom=0;}
function hdLook(m,now){const o=H2L,P=HD2D.look;hdZero(o);const dun=m.kind==='dungeon',T=dun?null:THM(m);
  if(dun){const D=DTH(m),a=hdRgb(D.acc),base=m.archive?P.hall:m.cave?P.cave:P.dungeon;hdMix(o,base,1);for(let i=0;i<3;i++){o.amb[i]*=.8+.4*a[i];o.fog[i]=o.fog[i]*.6+hdRgb(D.top)[i]*.6;}}
  else{let wsum=0;const pp=phaseProg();['day','dusk','night','dawn'].forEach(ph=>{const w=typeof trPhW==='function'?trPhW(ph):(pp.ph===ph?1:0);if(w<=0)return;wsum+=w;
      let L=P[ph];if(ph==='dusk'||ph==='dawn'){// late dusk and early dawn lean toward night; a phase being blended out keeps the progress it had
        const pr=ph===pp.ph?pp.p:(typeof TR!=='undefined'&&TR.from===ph?TR.fromP:1),q=ph==='dusk'?pr:1-pr,k=Math.max(0,q-.45)*.7;if(k>0){hdMix(o,L,w*(1-k));hdMix(o,P.night,w*k);return;}}hdMix(o,L,w);});
    if(wsum<=0)hdMix(o,P.day,1);
    if(T&&T.dark){const k=P.darkRealm;for(let i=0;i<3;i++){o.amb[i]*=k.amb[i];o.sun[i]*=k.sun;}o.emis=Math.max(o.emis,.8);o.lamp=Math.max(o.lamp,1);o.pl=Math.max(o.pl,.6);}
    // weather (blended like the Phase 5 weather fade)
    const X=typeof TR!=='undefined'?TR.wx:null,cur=G.weather?G.weather[m.s]||'clear':'clear';let wl=[[cur,1]];
    if(X&&X.from&&X.k<1){const e=trEase(X.k);wl=[[X.cur||cur,e],[X.from,1-e]];}
    const acc={amb:0,sun:0,fog:[0,0,0],fogA:0,sat:0,shaft:0,warm:0};wl.forEach(([w,k])=>{const M=HD2D.weather[w]||HD2D.weather.clear;acc.amb+=M.amb*k;acc.sun+=M.sun*k;acc.fogA+=(M.fogA||0)*k;acc.sat+=(M.sat||1)*k;acc.shaft+=(M.shaft==null?1:M.shaft)*k;acc.warm+=(M.warm||0)*k;
      const fc=M.fog||o.fog;for(let i=0;i<3;i++)acc.fog[i]+=fc[i]*k;});
    for(let i=0;i<3;i++){o.amb[i]*=acc.amb;o.sun[i]*=acc.sun;o.fog[i]=o.fog[i]*(1-Math.min(1,acc.fogA))+acc.fog[i]*Math.min(1,acc.fogA);}
    o.fogA=Math.min(.92,o.fogA+acc.fogA*.6);o.sat*=acc.sat;o.shaft*=acc.shaft;o.gain[0]*=1+acc.warm*.06;o.gain[2]*=1-acc.warm*.06;
    // legends that bend the sky: the wildcaller's night, the rider's dusk
    try{const LQ=typeof legendQ==='function'&&m.kind==='field'?legendQ(m):[];if(LQ.some(q=>q.hero==='nikaris')){for(let i=0;i<3;i++){o.amb[i]*=.55;o.sun[i]*=.3;}o.emis=1;o.lamp=1;}
      else if(LQ.some(q=>q.hero==='kaevan')){o.gain[0]*=1.08;o.gain[2]*=.9;}}catch(e){}
    if(m.kind==='field'&&G.cleared[m.s]){o.gain[0]*=1.03;o.gain[1]*=1.02;}}
  const l=Math.hypot(o.sd[0],o.sd[1],o.sd[2])||1;o.sd[0]/=l;o.sd[1]/=l;o.sd[2]/=l;o.shA=1;
  return o;}
// the grade as one affine map M*c+B (column major): exposure e, contrast k, saturation s, then gain g and lift l per channel
function hdGrade(o){const e=o.exp,k=o.con,sa=o.sat,M=HD.gm,B=HD.gb,W=[.299,.587,.114];
  for(let i=0;i<3;i++){const g=o.gain[i]-o.lift[i];for(let j=0;j<3;j++){const sat=(i===j?sa:0)+(1-sa)*W[j];M[j*3+i]=g*k*e*sat;}
    B[i]=g*(.5-.5*k)+o.lift[i];}}
// =================== per frame ===================
function hdCamera(m,now,sz,q){const S=HD.S,still=gfxStill(),pitch=HD2D.pitch*Math.PI/180,asp=sz.cw/sz.ch,Sc=WS.scale*HD2D.zoom;
  // wide views (phones held sideways) keep the horizontal field of view in check, so props at the sides do not skew
  const fov=Math.min(HD2D.fov*Math.PI/180,2*Math.atan(Math.tan(HD2D.maxHfov*Math.PI/360)/asp));
  const D=sz.ch/(2*Sc*Math.tan(fov/2)),sin=Math.sin(pitch),cos=Math.cos(pitch),Hc=D*sin,Dc=D*cos;
  const half=sz.cw/2/Sc,zb=Dc-Hc/Math.tan(pitch+fov/2),zt=pitch>fov/2?Hc/Math.tan(pitch-fov/2)-Dc:1e4;
  let tx=WS.px+8,tz=WS.py+8;
  tx=S.W<=half*2?S.W/2:clamp(tx,half,S.W-half);
  const zmin=Math.min(zt*HD2D.topSlack,S.H/2),zmax=S.H-zb;tz=zmax<zmin?(S.H/2+zt*HD2D.topSlack-zb)/2:clamp(tz,zmin,zmax);
  const dt=HD.lastT?Math.min(100,now-HD.lastT):16;HD.lastT=now;
  if(!HD.cam||HD.cam.m!==m||Math.abs(HD.cam.x-tx)>200||Math.abs(HD.cam.z-tz)>200)HD.cam={m,x:tx,z:tz};
  else{const k=1-Math.exp(-dt/HD2D.follow);HD.cam.x+=(tx-HD.cam.x)*k;HD.cam.z+=(tz-HD.cam.z)*k;if(Math.abs(tx-HD.cam.x)<.05)HD.cam.x=tx;if(Math.abs(tz-HD.cam.z)<.05)HD.cam.z=tz;}
  let cx=HD.cam.x,cz=HD.cam.z,pa=pitch;
  if(!still&&HD2D.sway.amp>0){const a=now/HD2D.sway.ms*Math.PI*2;cx+=Math.sin(a)*HD2D.sway.amp;pa+=Math.sin(a*.7+1)*HD2D.sway.pitch*Math.PI/180;}
  // snap the focus point to whole internal pixels so the pixel art stays steady while the camera glides
  const snap=1/(Sc*sz.r);cx=Math.round(cx/snap)*snap;cz=Math.round(cz/snap)*snap;
  const ex=cx,ey=D*Math.sin(pa),ez=cz+D*Math.cos(pa);HD.eye[0]=ex;HD.eye[1]=ey;HD.eye[2]=ez;
  h2Persp(HD.mats.p,fov,asp,Math.max(20,D*.25),D*4+600);h2Look(HD.mats.v,ex,ey,ez,cx,0,cz);h2Mul(HD.mats.vp,HD.mats.p,HD.mats.v);
  const fl=Math.hypot(cx-ex,ey,cz-ez);HD.fwd=[(cx-ex)/fl,-ey/fl,(cz-ez)/fl];HD.rgt=[1,0,0];HD.up=[0,-HD.fwd[2]*-1,0];
  HD.up=[HD.fwd[1]*0-HD.fwd[2]*0,HD.fwd[2]*1-HD.fwd[0]*0,HD.fwd[0]*0-HD.fwd[1]*1];// up = right x fwd with right=(1,0,0) -> (0,-f.z,f.y)
  HD.up=[0,-HD.fwd[2],HD.fwd[1]];HD.tanH=Math.tan(fov/2);HD.asp=asp;HD.D=D;
  // the light map covers the ground in view (wider at the top, where perspective opens out)
  {const R=HD.lmR,hw=Math.max(half*2.2,260)+120;R[0]=cx-hw;R[2]=hw*2;R[1]=cz-Math.min(zt,900)*1.05-120;R[3]=cz+zb+120-R[1];}
  // a 2D equivalent camera for code that reads WS.cam
  WS.cam={x:cx-WS.vw/2,y:cz-WS.vh/2};WS.camT=now;}
const H2F={};// small cached sprites made in code (blob shadow, glow, ring, beam, markers, sconce flames, sails, grass)
function hdSpr(key,w,h,fn){let c=H2F[key];if(!c){c=H2F[key]=mkCv(w,h);fn(c.getContext('2d'),w,h);}return c;}
function hdBlob(){return hdSpr('blob',32,16,(c,w,h)=>{const g=c.createRadialGradient(16,8,1,16,8,16);g.addColorStop(0,'rgba(255,255,255,.62)');g.addColorStop(.55,'rgba(255,255,255,.34)');g.addColorStop(1,'rgba(255,255,255,0)');c.setTransform(1,0,0,.5,0,4);c.fillStyle=g;c.fillRect(0,0,32,32);});}
function hdGlowS(){return hdSpr('glow',32,32,(c)=>{const g=c.createRadialGradient(16,16,1,16,16,16);g.addColorStop(0,'rgba(255,255,255,.9)');g.addColorStop(.4,'rgba(255,255,255,.35)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,32,32);});}
function hdRing(){return hdSpr('ring',32,32,(c)=>{c.strokeStyle='#fff';c.lineWidth=2;c.beginPath();c.arc(16,16,13,0,7);c.stroke();});}
function hdBeamS(){return hdSpr('beam',16,64,(c)=>{const g=c.createLinearGradient(0,0,0,64);g.addColorStop(0,'rgba(255,240,200,0)');g.addColorStop(.25,'rgba(255,240,200,.5)');g.addColorStop(1,'rgba(255,240,200,.05)');c.fillStyle=g;c.fillRect(0,0,16,64);
  const h=c.getImageData(0,0,16,64);for(let y=0;y<64;y++)for(let x=0;x<16;x++){const e=Math.sin(Math.PI*(x+.5)/16);h.data[(y*16+x)*4+3]*=e*e;}c.putImageData(h,0,0);});}
function hdMark(col){return hdSpr('mk'+col,7,14,(c)=>{c.fillStyle='#150b17';c.fillRect(0,0,7,14);c.fillStyle=col;c.fillRect(1,1,5,8);c.fillRect(1,11,5,2);});}
function hdPip(col){return hdSpr('pip'+col,7,5,(c)=>{c.fillStyle=col;c.fillRect(2,0,3,3);c.fillRect(0,2,7,1);});}
function hdArrow(){return hdSpr('arrow',9,7,(c)=>{c.fillStyle='#150b17';c.fillRect(0,0,9,6);c.fillStyle='#ffe08a';c.fillRect(1,4,7,1);c.fillRect(2,3,5,1);c.fillRect(3,2,3,1);c.fillRect(4,1,1,1);});}
function hdTorchS(f){return hdSpr('torch'+f,6,12,(c)=>{c.fillStyle='#3a2a1a';c.fillRect(2,5,2,7);c.fillStyle='#5a4a3a';c.fillRect(1,9,4,2);c.fillStyle='#ff7a2a';c.fillRect(1,1-(f===1?1:0)+1,4,4);c.fillStyle='#ffd870';c.fillRect(2,2-(f===2?1:0)+1,2,3);c.fillStyle='#fff6c8';c.fillRect(3,3,1,1);});}
function hdGrassS(m){const T=THM(m);return hdSpr('grass'+m.theme+(m.thv||''),16,7,(c)=>{c.fillStyle=T.tg[1];for(let i=0;i<7;i++)c.fillRect(1+i*2+(i%2),(i%3),1,5-(i%3));c.fillStyle=T.tg[2];for(let i=0;i<7;i+=2)c.fillRect(1+i*2+(i%2),(i%3),1,1);});}
function hdSails(step){return hdSpr('sail'+step,48,48,(c)=>{const a=step/24*Math.PI*2;c.fillStyle='#6a4a2a';for(let k=0;k<4;k++){const ang=a+k*Math.PI/2;for(let r=0;r<22;r++){const px=Math.round(24+Math.cos(ang)*r),py=Math.round(24+Math.sin(ang)*r);c.fillRect(px,py,2,2);if(r>6){c.fillStyle='#e8dcc0';c.fillRect(px+Math.round(Math.cos(ang+1.57)*2),py+Math.round(Math.sin(ang+1.57)*2),2,2);c.fillStyle='#6a4a2a';}}}c.fillStyle='#3a2a1a';c.fillRect(22,22,4,4);});}
// one upright billboard: the sprite's bottom centre stands at (fx, fy, fz); art pixels keep their shape on screen
function hdBill(bt,key,cv,fx,fy,fz,flip,sc,r,g,b,a,fl){const R=HD.atl.get(key,cv);if(!R)return -1;const V=HD.S.V,w=R.w*(sc||1),h=R.h*(sc||1)*V,x0=fx-w/2,x1=fx+w/2;
  H2P[0]=x0;H2P[1]=fy+h;H2P[2]=fz;H2P[3]=x1;H2P[4]=fy+h;H2P[5]=fz;H2P[6]=x1;H2P[7]=fy;H2P[8]=fz;H2P[9]=x0;H2P[10]=fy;H2P[11]=fz;
  bt.quad(H2P,flip?R.u1:R.u0,R.v0,flip?R.u0:R.u1,R.v1,r,g,b,a,0,.45,.89,fl);return bt.n-1;}
// a flat decal lying on the ground, centred at (cx, cz)
function hdDecal(bt,key,cv,cx,cz,w,d,r,g,b,a,y){const R=HD.atl.get(key,cv);if(!R)return;const yy=y||.6;
  H2P[0]=cx-w/2;H2P[1]=yy;H2P[2]=cz-d/2;H2P[3]=cx+w/2;H2P[4]=yy;H2P[5]=cz-d/2;H2P[6]=cx+w/2;H2P[7]=yy;H2P[8]=cz+d/2;H2P[9]=cx-w/2;H2P[10]=yy;H2P[11]=cz+d/2;bt.quad(H2P,R.u0,R.v0,R.u1,R.v1,r,g,b,a,0,1,0,4);}
function hdShadow(cx,cz,w){hdDecal(HD.dynB,'blob',hdBlob(),cx,cz,w,w*.42,10,6,24,255);}// white sprite, dark vertex colour (no colour fringes from low alpha texels)
// ----- v0.5.8: characters belong to the scene -----
// a contact shadow with a darker core under the feet and a soft penumbra (white sprite, dark vertex colour)
function hdBlob2(){return hdSpr('blob2',24,12,(c,w,h)=>{const d=c.createImageData(w,h),P=HD2D.spr.shadow;for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const dx=(x+.5-w/2)/(w/2),dy=(y+.5-h/2)/(h/2),r=Math.sqrt(dx*dx+dy*dy),sm=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);};
  const a=Math.min(1,P[2]*(1-sm(.12,.5,r))+P[3]*(1-sm(.3,1,r))),o=(y*w+x)*4;d.data[o]=d.data[o+1]=d.data[o+2]=255;d.data[o+3]=Math.round(a*255);}c.putImageData(d,0,0);});}
// a sprite shrunk to the scene's scale on the GL pixel grid (px texels per art px), once per sprite canvas. Pixel art does not survive an
// average (faces and outlines turn to mush), so each target pixel takes the colour that covers most of its box in the full HD bitmap
// (the sprite's own palette, no blends), except that a clearly darker colour (an outline, an eye, a seam) wins when it covers a fair
// share of the box; coverage decides what is solid. At the default scale (2/3) one target pixel is exactly 3x3 texels. Drawn one texel
// per pixel with NEAREST: crisp, no shimmer from skipped texels.
const H2SM=new WeakMap(),H2SMc=new Int32Array(64),H2SMw=new Float32Array(64);
function hdSmall(cv,s,px){const k=s*1000+px;let e=H2SM.get(cv);if(e&&e.k===k)return e.c;
  const W0=cv._rw||cv.width,H0=cv._rh||cv.height,tw=Math.max(2,Math.round(cv.width*s*px/2)*2),fx=W0/tw,fy=fx,th=Math.max(2,Math.ceil(H0/fy-.01));
  let src;try{src=cv.getContext('2d').getImageData(0,0,W0,H0).data;}catch(_){return cv;}
  const o=mkCv(tw,th),oc=o.getContext('2d'),img=oc.createImageData(tw,th),d=img.data,C=H2SMc,Wt=H2SMw,L=c=>((c>>16)&255)*.3+((c>>8)&255)*.59+(c&255)*.11;
  for(let ty=0;ty<th;ty++){const y1=H0-(th-1-ty)*fy,y0=y1-fy;// bottom aligned: the feet keep their row
    for(let tx=0;tx<tw;tx++){const x0=tx*fx,x1=x0+fx;let sw=0,sa=0,n=0,tot=0;
      for(let sy=Math.max(0,Math.floor(y0));sy<Math.ceil(y1)&&sy<H0;sy++){const wy=Math.min(y1,sy+1)-Math.max(y0,sy);if(wy<=0)continue;
        for(let sx=Math.floor(x0);sx<Math.ceil(x1)&&sx<W0;sx++){const w=(Math.min(x1,sx+1)-Math.max(x0,sx))*wy,i=(sy*W0+sx)*4,a=src[i+3]/255;sw+=w;sa+=w*a;if(a<=.5)continue;
          const c=(src[i]<<16)|(src[i+1]<<8)|src[i+2];let j=0;while(j<n&&C[j]!==c)j++;if(j===n){if(n>=64)continue;C[n]=c;Wt[n]=0;n++;}Wt[j]+=w;tot+=w;}}
      if(!n||!sw||sa/sw<.34)continue;let bi=0,di=0;for(let j=1;j<n;j++){if(Wt[j]>Wt[bi])bi=j;if(L(C[j])<L(C[di]))di=j;}
      if(L(C[di])<Math.min(L(C[bi])-70,120)&&Wt[di]>=tot*.3)bi=di;const c=C[bi],o4=(ty*tw+tx)*4;d[o4]=(c>>16)&255;d[o4+1]=(c>>8)&255;d[o4+2]=c&255;d[o4+3]=255;}}
  oc.putImageData(img,0,0);H2SM.set(cv,{k,c:o});return o;}
// which side the light comes from at a character's feet: the lights of this frame's light map (within reach, weighted like the map) and
// the sun or moon. HD.rimD is -1 (left) or 1 (right), HD.rimS the rim strength 0..1. No allocation.
function hdRim(x,z){const L=HD.lw,o=H2L;let dx=0;for(let i=0;i<HD.lmn;i++){const j=i*4,ddx=L[j]-x,ddz=L[j+1]-z,r=L[j+2],dd=ddx*ddx+ddz*ddz;if(dd>=r*r)continue;
    const dist=Math.sqrt(dd),k=1-dist/r;dx+=L[j+3]*k*k*ddx/(dist+6);}
  const sl=(o.sun[0]*.3+o.sun[1]*.59+o.sun[2]*.11)*1.5;dx+=sl*o.sd[0];HD.rimD=dx>=0?1:-1;HD.rimS=Math.min(1,Math.abs(dx)*2.2);}
// a character billboard: the scene scaled copy, per vertex side (r) and height (b) for the shader, the rim side and strength and the
// flip in the normal bytes. Returns the quad index (the hero's is drawn again for his silhouette).
function hdChar(bt,cv,fx,fy,fz,flip,a,fl,sc){bt=bt===HD.dynB?HD.dynCB:HD.dynC;const s=sc==null?HD2D.spr.sc:sc,px=HD.px||1,sm=s===1||!cv.width?cv:hdSmall(cv,s,px),R=HD.atl.get(sm,sm);if(!R)return -1;
  const V=HD.S.V,w=s===1?R.w:sm.width/px,h=(s===1?R.h:sm.height/px)*V,x0=fx-w/2,x1=fx+w/2,y1=fy+h;hdRim(fx,fz);HD.chW=w;HD.chH=h;
  if(bt.n>=bt.max)bt.grow();const i=bt.n*4,X=HD.rimD>0?255:0,Y=Math.round(HD.rimS*255),Z=flip?0:255,u0=flip?R.u1:R.u0,u1=flip?R.u0:R.u1;
  bt.v(i,x0,y1,fz,u0,R.v0,0,255,255,a,X,Y,Z,fl);bt.v(i+1,x1,y1,fz,u1,R.v0,255,255,255,a,X,Y,Z,fl);bt.v(i+2,x1,fy,fz,u1,R.v1,255,255,0,a,X,Y,Z,fl);bt.v(i+3,x0,fy,fz,u0,R.v1,0,255,0,a,X,Y,Z,fl);
  return bt.n++;}
// the contact shadow of the character just placed by hdChar: as wide as its body, nudged away from the light
function hdShadowC(cx,cz,k){const P=HD2D.spr.shadow,w=Math.max(8,HD.chW*P[0]*(k||1)),off=-HD.rimD*HD.rimS*P[4];hdDecal(HD.dynB,'blob2',hdBlob2(),cx+off,cz,w*(1+HD.rimS*.12),w*P[1],8,5,20,255);}
function hdPickAdd(id,fx,fz,h,w,tx,ty){if(HD.pkn>=160)return;const p=HD.pt;h2Proj(p,HD.mats.vp,fx,0,fz);const x0=p[0],y0=p[1];h2Proj(p,HD.mats.vp,fx+w/2,h,fz);const o=HD.pkn++*7,K=HD.pk;K[o]=x0-(p[0]-x0);K[o+1]=y0;K[o+2]=p[0];K[o+3]=p[1];K[o+4]=tx;K[o+5]=ty;K[o+6]=id;}
function hdActors(m,now,ts){const B=HD.dyn,BB=HD.dynB,BA=HD.dynA,V=HD.S.V,still=gfxStill();HD.pkn=0;
  // the hero
  const lid=leaderId(),t=TPL[lid],view=WS.dir==='u'?'back':WS.dir==='d'?'front':'side',lk=heroLook(lid),frame=walkFrame(view,!!WS.mv,now);
  const hc=walkerCanvas(lid+lookKey(lid),lk,t.el,lid,view,frame),hx0=Math.round(WS.px)+8,hz=WS.py+12.5;
  // v0.5.8: every character goes through hdChar (scene scale, lit like the scene, rim light) with a contact shadow under its feet
  const sp=HD2D.spr.sc;HD.heroQ=hdChar(B,hc,hx0,(-2.5+(frame&&view==='side'?1:0))*sp*V,hz,view==='side'&&WS.face==='l',255,16);HD.heroH=HD.chH;hdShadowC(hx0,hz+1);
  try{const col=typeof stickGlowOf==='function'&&stickGlowOf(G.roster[G.party[0]]);if(col){const p=.5+.5*Math.sin(ts/260),c=hdRgb(col);hdDecal(BB,'ring',hdRing(),hx0,hz+1,(20+p*4)*.8,(8+p*2)*.8,c[0]*255,c[1]*255,c[2]*255,(.3+.3*p)*255);}}catch(e){}
  if(tileAt(m,WS.x,WS.y)===','&&!WS.mv&&m.kind!=='dungeon'){const gc=hdGrassS(m);hdBill(B,gc,gc,WS.x*TS+8,-1*V,WS.y*TS+15,false,1,255,255,255,255,0);}
  // townsfolk and gates
  m.npcs.forEach((n,i)=>{let nx=n.x*TS,ny=n.y*TS,moving=false;if(n.mv){const p=Math.min(1,(now-n.mv.t0)/420);nx=(n.mv.fx+(n.x-n.mv.fx)*p)*TS;ny=(n.mv.fy+(n.y-n.mv.fy)*p)*TS;moving=p<1;}
    if(Math.abs(nx-HD.cam.x)>420||Math.abs(ny-HD.cam.z)>520)return;
    if(n.portal){const ph=ts/320+n.x,st=((Math.round(ph/(Math.PI*2/24))%24)+24)%24,key='portal:'+n.key+':'+st;let c=H2F[key];
      if(!c){c=H2F[key]=mkCv(16,20);drawPortal(c.getContext('2d'),0,3,Object.assign({},n,{x:0}),st*(Math.PI*2/24)*320);}
      hdBill(B,key,c,nx+8,-1*V,ny+14,false,1,255,255,255,255,2);hdPickAdd(i,nx+8,ny+14,20*V,16,n.x,n.y);return;}
    const v=n.view||'front',fm=moving?walkFrame(v,true,now):0,c=walkerCanvas('npc:'+n.name+m.id,n.look,['light'],null,v,fm),bob=moving||still?0:Math.floor(now/700+n.hx)%2;
    hdChar(B,c,Math.round(nx)+8,-2.5*sp*V,ny+12.5,v==='side'&&n.face==='l',255,16);hdShadowC(Math.round(nx)+8,ny+13.5);hdPickAdd(i,nx+8,ny+12.5,Math.max(HD.chH,22*V),Math.max(HD.chW,16),n.x,n.y);});
  // bounty elites, lost wayfarers, roaming legends
  dynActors(m).forEach(a=>{const fx=a.x*TS+8,fz=a.y*TS+12.5,bob=still?0:Math.floor(now/450)%2;
    if(a.type==='legend'){const g=.5+.5*Math.sin(ts/240);hdDecal(BB,'glow',hdGlowS(),fx,fz+1,30,12,255,215,90,(.25+.3*g)*255);
      const c=a.mon?imgOf('mapmon:'+MON[a.mon].art,()=>monCanvas(MON[a.mon].art)):walkerCanvas('leg:'+TPL[a.q.hero].id,TPL[a.q.hero].look,TPL[a.q.hero].el,TPL[a.q.hero].id,'front',0);
      hdChar(B,c,fx,(bob*.6-(a.mon?1:2.5)*sp)*V,fz,!!a.mon,255,16);hdShadowC(fx,fz+1);hdBill(B,'pipg',hdPip('#ffd24a'),fx,HD.chH+(3+bob)*V,fz,false,1,255,255,255,255,4);hdPickAdd(-1,fx,fz,Math.max(HD.chH,22*V),Math.max(HD.chW,16),a.x,a.y);return;}
    if(a.type==='elite'){const mo=MON[a.b.mon],c=imgOf('mapmon:'+mo.art,()=>monCanvas(mo.art)),p=.5+.5*Math.sin(ts/200);hdDecal(BB,'glow',hdGlowS(),fx,fz+1,30,12,255,60,60,(.3+.3*p)*255);
      hdChar(B,c,fx,(bob*.6-sp)*V,fz,true,255,16);hdShadowC(fx,fz+1);hdBill(B,'mkr',hdMark('#ff4a4a'),fx,HD.chH+(3+bob)*V,fz,false,1,255,255,255,255,4);hdPickAdd(-1,fx,fz,Math.max(HD.chH,22*V),Math.max(HD.chW,16),a.x,a.y);return;}
    const tt=TPL[a.q.hero],c=walkerCanvas('wand:'+tt.id,tt.look,tt.el,tt.id,'front',0);hdChar(B,c,fx,(bob*.6-2.5*sp)*V,fz,false,255,16);hdShadowC(fx,fz+1);
    hdBill(B,'pipy',hdPip('#ffe08a'),fx,HD.chH+3*V,fz,false,1,255,255,255,255,4);hdPickAdd(-1,fx,fz,Math.max(HD.chH,22*V),Math.max(HD.chW,16),a.x,a.y);});
  // the Scourge or Calamity on its rune circle, or its Echo
  const dun=m.kind==='dungeon';
  const echoUp=dun&&m.bossAt&&!m.safe&&G.cleared[m.s]&&typeof storyEchoUp==='function'&&storyEchoUp(m.s);
  if(dun&&m.bossAt&&!m.safe&&(!G.cleared[m.s]||echoUp)){const def=guardianDef(bossKeyFor(m.s)),[bx,by]=m.bossAt;
    const c=echoUp?imgOf('mapecho:'+def.art,()=>monCanvas(MART['echo_'+def.art]?'echo_'+def.art:def.art)):imgOf('mapboss:'+def.art,()=>monCanvas(def.art)),bob=still?0:Math.sin(now/420)*1.5;
    const D=DTH(m),ac=hdRgb(D.acc);hdDecal(BA,'glow',hdGlowS(),bx*TS+8,by*TS+9,44*.8,26*.8,ac[0]*255,ac[1]*255,ac[2]*255,110);
    hdChar(echoUp?BB:B,c,bx*TS+8,(bob*.6-sp)*V,by*TS+12,true,echoUp?Math.round((.72+.18*Math.sin(ts/300))*255):255,16);hdShadowC(bx*TS+8,by*TS+13);hdPickAdd(-1,bx*TS+8,by*TS+12,Math.max(HD.chH,22*V),Math.max(HD.chW,16),bx,by);}
  // roaming foes in dungeons: their sprite, an elite ring, a faint sight cone, "!" while chasing
  if(dun&&m.roam&&typeof ROAM!=='undefined')m.roam.forEach(r=>{if(r.dead)return;let x=r.x*TS,y=r.y*TS;if(r.t0&&r.fx!=null){const p=Math.min(1,(now-r.t0)/(r.mode==='chase'?ROAM.chaseMs:ROAM.patrolMs));x=(r.fx+(r.x-r.fx)*p)*TS;y=(r.fy+(r.y-r.fy)*p)*TS;}
    if(Math.abs(x-HD.cam.x)>420||Math.abs(y-HD.cam.z)>520)return;const img=imgOf('rm:'+MON[r.mon].art,()=>monCanvas(MON[r.mon].art)),bob=still?0:Math.floor(now/300+r.i)%2;
    const [a,b]=DIRV[r.dir],S2=ROAM.sight*TS,cx=x+8,cz=y+8,ch=r.mode==='chase';H2P.set([cx,.5,cz,cx+a*S2-b*S2/2,.5,cz+b*S2-a*S2/2,cx+a*S2+b*S2/2,.5,cz+b*S2+a*S2/2,cx,.5,cz]);
    BB.quad(H2P,-1,0,-1,0,ch?255:255,ch?90:230,ch?60:150,ch?46:26,0,1,0,4);
    if(r.elite)hdDecal(BB,'ring',hdRing(),cx,y+13,20,8,255,200,61,230);
    hdChar(B,img,cx,(bob*.6-sp)*V,y+12,false,255,16);hdShadowC(cx,y+13);if(ch)hdBill(B,'mkr',hdMark('#ff5a3a'),cx,HD.chH+4*V,y+12,false,.7,255,255,255,255,4);});
  // mimic tells: a red glint in the keyhole now and then
  if(dun&&m.chests&&typeof isMimic==='function')m.chests.forEach(([x,y])=>{if(G.chests[m.id+':'+x+','+y]||!isMimic(m,x,y))return;if(Math.floor(now/700+x)%5===0)hdBill(B,'pipr',hdPip('#ff4a4a'),x*TS+8,7*V,(y+1)*TS+1.2,false,.4,255,255,255,255,4);});
  // gathering spots, shelves, fountains, braziers, wall torches, windmill sails
  G.gath=G.gath||{};(m.nodes||[]).forEach(n=>{if(G.gath[m.id+':'+n.x+','+n.y])return;if(Math.abs(n.x*TS-HD.cam.x)>420||Math.abs(n.y*TS-HD.cam.z)>520)return;
    const tw=still?3:Math.floor(now/260+n.x*3+n.y)%9,st=tw<2?tw:2,key='node:'+n.k+':'+st;let c=H2F[key];if(!c){c=H2F[key]=mkCv(16,16);drawNode(c.getContext('2d'),{k:n.k,x:0,y:0},0,0,st*260+1);}
    hdBill(B,key,c,n.x*TS+8,-1*V,n.y*TS+14,false,1,255,255,255,255,0);});
  (m.shelves||[]).forEach(([sx,sy])=>{const key='shelf:'+m.id+':'+sx+','+sy;let c=H2F[key];if(!c){c=H2F[key]=mkCv(16,25);drawShelf(c.getContext('2d'),sx,sy,0,9);}hdBill(B,key,c,sx*TS+8,0,(sy+1)*TS+.5,false,1,255,255,255,255,2|8);});
  const fr=Math.floor(now/520)%2,x0=Math.max(0,Math.floor((HD.cam.x-420)/TS)),x1=Math.min(m.w-1,Math.ceil((HD.cam.x+420)/TS)),y0=Math.max(0,Math.floor((HD.cam.z-520)/TS)),y1=Math.min(m.h-1,Math.ceil((HD.cam.z+300)/TS));
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const c=tileAt(m,x,y);
    if(c==='O'&&tileAt(m,x-1,y)!=='O'&&tileAt(m,x,y-1)!=='O'){const c2=objCanvas(m.theme,'fountain',still?0:fr);hdBill(B,c2,c2,x*TS-1+c2.width/2,-1*V,(y+2)*TS-2,false,1,255,255,255,255,2|8);}
    else if(c==='v'){const c2=objCanvas(m.theme,'brazier',still?0:Math.floor(now/160+x)%2);hdBill(B,c2,c2,x*TS+1+c2.width/2,-1*V,(y+1)*TS+.5,false,1,255,255,255,255,4|8);}}
  (HD.S.torch||[]).forEach(T=>{if(Math.abs(T[0]-HD.cam.x)>420||Math.abs(T[2]-HD.cam.z)>520)return;const f=still?0:Math.floor(now/110+T[0])%3,c=hdTorchS(f);hdBill(B,'torch'+f,c,T[0],T[1]-6*V,T[2],false,1,255,255,255,255,4);
    hdBill(BA,'glow',hdGlowS(),T[0],T[1]-14*V,T[2]+.6,false,1.1,255,170,80,90,4);});
  (HD.S.mills||[]).forEach(M=>{const st=still?0:Math.floor(now/900/(Math.PI*2)*24)%24,c=hdSails(st);hdBill(B,'sail'+st,c,M[0],M[1]-24*V,M[2],false,1,255,255,255,255,0);});
  (HD.S.beam||[]).forEach(b2=>{const p=still?.8:.8+.2*Math.sin(ts/900);hdBill(BA,'beam',hdBeamS(),b2[0],-2*V,b2[1],false,2.2,255,240,200,Math.round(110*p),4);});
  // quest board marker, the dungeon's way out
  if(m.kind==='town'&&m._qb){const stt=typeof boardState==='function'?boardState():null;if(stt)m._qb.forEach(([qx,qy])=>{const bob=still?0:Math.round(Math.sin(ts/220)*2),col=stt==='ready'?'#7aff8a':'#ffd04a';
    hdBill(BA,'glow',hdGlowS(),qx*TS+8,(30+bob)*V-10,(qy+1)*TS+2,false,.8,255,240,160,110,4);hdBill(B,'mk'+col,hdMark(col),qx*TS+8,(30+bob)*V,(qy+1)*TS+2,false,1,255,255,255,255,4);});}
  if(dun&&m.start&&!(Math.abs(WS.x-m.start[0])<=1&&Math.abs(WS.y-m.start[1])<=1)){const e=m.start,/* v0.6.3: not while the hero stands by it (it floated over his body) */bob=still?0:Math.round(Math.sin(now/200)*2);hdBill(B,'arrow',hdArrow(),e[0]*TS+8,(18+bob)*V,e[1]*TS+8,false,1,255,255,255,255,4);}
  // chimney smoke
  (HD.S.smoke||[]).forEach((s,i)=>{for(let k=0;k<4;k++){const p=still?(k/4+.1):((ts/1600+k/4+i*.37)%1),r=1+Math.floor(p*3),dx=Math.sin(p*6+i)*3+p*6;
    H2P.set([s[0]+dx-r,s[1]+(p*26+r)*V,s[2],s[0]+dx+r,s[1]+(p*26+r)*V,s[2],s[0]+dx+r,s[1]+(p*26-r)*V,s[2],s[0]+dx-r,s[1]+(p*26-r)*V,s[2]]);BB.quad(H2P,-1,0,-1,0,225,225,235,Math.round(120*(1-p)),0,.45,.89,0);}});}
// ----- v0.6.3: the world's drifting ambience (worldfx.js) as part of the scene -----
// Relit field sparkles, snow, wind streaks, butterflies, spray, motes, dungeon dust, festival lanterns, Phase 6 leaves, dusk fireflies,
// dawn dew and the passing flock: the same world positions as the 2D view, placed in the scene as small upright quads (blended, depth
// tested, so walls and buildings hide them), glowing ones unlit. None is drawn over the hero: a particle whose screen position falls in
// his box is left out. Until v0.6.2 these were screen space dots on the 2D canvas over the GL frame (they slid along with the camera).
const HW={hx:0,hz:0,b:new Float32Array(4),p:new Float32Array(4),n:0};
function hdWfxEmit(x,z,h,w,hh,c,a,g){const R=HD.lmR;if(x<R[0]||x>R[0]+R[2]||z<R[1]||z>R[1]+R[3])return;const V=HD.S.V,y0=h*V,y1=(h+hh)*V;
  if(Math.abs(x-HW.hx)<26&&z>HW.hz-8&&z<HW.hz+160){const p=HW.p,B=HW.b;h2Proj(p,HD.mats.vp,x,(y0+y1)/2,z);if(p[0]>B[0]&&p[0]<B[2]&&p[1]>B[1]&&p[1]<B[3])return;}
  const C=wfxRgb(c),al=Math.round(255*a*C[3]);if(al<3)return;const P=H2P,x0=x-w/2,x1=x+w/2;
  P[0]=x0;P[1]=y1;P[2]=z;P[3]=x1;P[4]=y1;P[5]=z;P[6]=x1;P[7]=y0;P[8]=z;P[9]=x0;P[10]=y0;P[11]=z;HD.dynB.quad(P,-1,0,-1,0,C[0],C[1],C[2],al,0,.45,.89,g?4:0);HW.n++;}
function hdWfxBird(x,z,h,f){const R=HD.lmR;if(x<R[0]||x>R[0]+R[2]||z<R[1]||z>R[1]+R[3])return;
  hdDecal(HD.dynB,'blob',hdBlob(),x+6,z,5,2,10,6,24,60);hdWfxEmit(x,z,h,1,1,'#1c1624',.85,0);hdWfxEmit(x-1.5,z,h+1-f,2,1,'#1c1624',.85,0);hdWfxEmit(x+1.5,z,h+1-f,2,1,'#1c1624',.85,0);}
function hdWfx(m,ts){if(m.archive)return;HW.n=0;HW.hx=Math.round(WS.px)+8;HW.hz=WS.py+12.5;
  // the hero's box on screen (NDC), padded a little
  {const p=HW.p,B=HW.b,hw=Math.max(8,(HD.chW||14)*.6),hh=HD.heroH||24;h2Proj(p,HD.mats.vp,HW.hx-hw,0,HW.hz);B[0]=p[0];B[1]=p[1];h2Proj(p,HD.mats.vp,HW.hx+hw,hh*1.08,HW.hz);B[2]=p[0];B[3]=p[1];
    const px=8/Math.max(64,WS.vw);B[0]-=px;B[2]+=px;B[1]-=px;B[3]+=px;}
  const R=HD.lmR,C=WFX.cell,Px=Math.ceil(R[2]/C)*C,Pz=Math.ceil((WFX.hdZ[0]+WFX.hdZ[1])/C)*C,cx=HD.cam.x,cz=HD.cam.z-(WFX.hdZ[0]-WFX.hdZ[1])/2;
  wfxRun('amb',m,ts,cx,cz,Px,Pz,hdWfxEmit);wfxRun('leaf',m,ts,cx,cz,Px,Pz,hdWfxEmit);
  if(m.kind!=='dungeon'&&!G.daily){const ph=wfxPhase();if(ph==='dusk'||ph==='dawn')wfxRun('day',m,ts,cx,cz,Px,Pz,hdWfxEmit);}
  wfxBirds(m,ts,cx,cz,Px,Pz,hdWfxBird);}
// every light near the view becomes a soft disc in the light map (flicker and day/night weight in its colour); no allocation
function hdLmAdd(x,z,r,cr,cg,cb){if(HD.lmn>=HD2D.lmMax)return;const R=HD.lmR,v=HD.lmv,W=HD.lw,j=HD.lmn*4,o=HD.lmn++*28;W[j]=x;W[j+1]=z;W[j+2]=r;W[j+3]=cr*.3+cg*.59+cb*.11;// v0.5.8: kept in world units too, for the characters' rim side
  const X0=(x-r-R[0])/R[2]*2-1,X1=(x+r-R[0])/R[2]*2-1,Z0=(z-r-R[1])/R[3]*2-1,Z1=(z+r-R[1])/R[3]*2-1;
  v[o]=X0;v[o+1]=Z0;v[o+2]=-1;v[o+3]=-1;v[o+7]=X1;v[o+8]=Z0;v[o+9]=1;v[o+10]=-1;v[o+14]=X1;v[o+15]=Z1;v[o+16]=1;v[o+17]=1;v[o+21]=X0;v[o+22]=Z1;v[o+23]=-1;v[o+24]=1;
  for(let k=0;k<4;k++){v[o+k*7+4]=cr*.5;v[o+k*7+5]=cg*.5;v[o+k*7+6]=cb*.5;}}// v0.5.8: stored at half (headroom), the scene shader reads it x2
const H2_FL=[.06,.14,.03,.05,.04,.08,.14,0];
function hdLights(m,ts,q,o){const L=HD.S.L,n=L?L.length/8:0,R=HD.lmR,still=gfxStill(),dun=m.kind==='dungeon';HD.lmn=0;
  for(let i=0;i<n;i++){const o8=i*8,x=L[o8],z=L[o8+2],r=L[o8+3];if(x+r<R[0]||x-r>R[0]+R[2]||z+r<R[1]||z-r>R[1]+R[3])continue;
    const type=L[o8+7];let w=(type===0||type===7)&&!dun?o.lamp:1;if(w<=.01)continue;
    const fl=H2_FL[type]||.05;if(!still)w*=1+fl*(Math.sin(ts/(70+(x%23))+L[o8+1])+.6*Math.sin(ts/31+x));
    const k=w*HD2D.lightK;hdLmAdd(x,z,r,L[o8+4]*k,L[o8+5]*k,L[o8+6]*k);}
  // the hero's own little light: a lantern in dungeons, caves and dark realms, a faint one at night
  HD.plR=0;if(o.pl>.01){const pc=o.plC;HD.plR=HD2D.heroLight*(.7+.3*o.pl);hdLmAdd(WS.px+8,WS.py+12,HD.plR,pc[0]*o.pl,pc[1]*o.pl,pc[2]*o.pl);}
  if(dun&&m.bossAt&&!m.safe&&(!G.cleared[m.s]||(typeof storyEchoUp==='function'&&storyEchoUp(m.s)))){const D=hdRgb(DTH(m).acc);hdLmAdd(m.bossAt[0]*TS+8,m.bossAt[1]*TS+8,110,D[0]*.8,D[1]*.8,D[2]*.8);}
  try{const col=typeof stickGlowOf==='function'&&stickGlowOf(G.roster[G.party[0]]);if(col){const c=hdRgb(col);hdLmAdd(WS.px+8,WS.py+12,60,c[0]*.5,c[1]*.5,c[2]*.5);}}catch(e){}
  return HD.lmn;}
function hdDrawLM(gl,n,o){const P=HD.P.lm,rt=HD.rt.lm,S=HD.S,Rr=HD.lmR;gl.bindFramebuffer(gl.FRAMEBUFFER,rt.f);gl.viewport(0,0,rt.w,rt.h);gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT);
  // alpha: 1 = in full sun, lower = in the baked shadow (the light map's patch of the map's shadow texture, weighted by time of day)
  const sw=o.shW,ss=sw[0]+sw[1]+sw[2];if(S.shInv[0]&&ss>0){const L=HD.P.lms;gl.useProgram(L.p);gl.enableVertexAttribArray(0);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,S.tsh);gl.uniform1i(L.u.uT,0);
    gl.uniform4f(L.u.uM,Rr[0]*S.shInv[0],Rr[1]*S.shInv[1],Rr[2]*S.shInv[0],Rr[3]*S.shInv[1]);gl.uniform4f(L.u.uW,sw[0],sw[1],sw[2],1);hdFS(gl);}
  if(!n)return;
  gl.useProgram(P.p);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);gl.colorMask(true,true,true,false);gl.bindBuffer(gl.ARRAY_BUFFER,HD.vb[3]);gl.bufferData(gl.ARRAY_BUFFER,HD.lmv.subarray(0,n*28),gl.DYNAMIC_DRAW);
  for(let i=0;i<3;i++)gl.enableVertexAttribArray(i);gl.vertexAttribPointer(0,2,gl.FLOAT,false,28,0);gl.vertexAttribPointer(1,2,gl.FLOAT,false,28,8);gl.vertexAttribPointer(2,3,gl.FLOAT,false,28,16);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,HD.ib);gl.drawElements(gl.TRIANGLES,n*6,gl.UNSIGNED_SHORT,0);gl.disable(gl.BLEND);gl.colorMask(true,true,true,true);}
function hdDrawMesh(gl,ms){if(!ms)return;for(const o of ms){gl.bindBuffer(gl.ARRAY_BUFFER,o.vb);h2Attribs(gl);gl.drawElements(gl.TRIANGLES,o.n*6,gl.UNSIGNED_SHORT,0);}}
// only the chunks under the view (the light map's rectangle plus a chunk of margin for tall things)
function hdDrawChunks(gl,C){if(!C)return;const R=HD.lmR,cs=C.cs,c0=Math.max(0,Math.floor((R[0]-cs)/cs)),c1=Math.min(C.nc-1,Math.floor((R[0]+R[2]+cs)/cs)),r0=Math.max(0,Math.floor((R[1]-cs)/cs)),r1=Math.min(C.nr-1,Math.floor((R[1]+R[3]+cs*1.5)/cs));
  let bound=-1;for(let r=r0;r<=r1;r++){const row=C.rows[r];if(!row)continue;let a=-1,b=-1;for(let c=c0;c<=c1;c++)if(row.ct[c]){if(a<0)a=c;b=c;}if(a<0)continue;
    if(row.seg!==bound){bound=row.seg;gl.bindBuffer(gl.ARRAY_BUFFER,C.segs[bound].ms[0].vb);h2Attribs(gl);}
    const q0=row.st[a],n=row.st[b]+row.ct[b]-q0;gl.drawElements(gl.TRIANGLES,n*6,gl.UNSIGNED_SHORT,q0*12);}}
function hdDrawDyn(gl,i,bt,full){if(!bt.n)return;gl.bindBuffer(gl.ARRAY_BUFFER,HD.vb[i]);if(!(HD.dynUp&(1<<i))){HD.dynUp|=1<<i;gl.bufferData(gl.ARRAY_BUFFER,bt.f.subarray(0,bt.n*28),gl.DYNAMIC_DRAW);}h2Attribs(gl);gl.drawElements(gl.TRIANGLES,bt.n*6,gl.UNSIGNED_SHORT,0);}
function hdPost(gl,P,prog,src,dst,w,h){gl.bindFramebuffer(gl.FRAMEBUFFER,dst?dst.f:null);gl.viewport(0,0,w,h);gl.useProgram(prog.p);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,src.t);gl.uniform1i(prog.u.uT,0);}
function hdFS(gl){gl.bindBuffer(gl.ARRAY_BUFFER,HD.fs);gl.vertexAttribPointer(0,2,gl.FLOAT,false,8,0);gl.drawArrays(gl.TRIANGLES,0,3);}
// one pass over the whole scene into the bound target: static meshes, characters, then blended shadows, glows and smoke
function hdScene(gl,S,o,now,still,full){const P=HD.P,u=P.scene.u,uc=P.char.u,fr=still?0:Math.floor(now/520)%2,dm=HD.dbg||31;
  gl.clearColor(o.gfog[0],o.gfog[1],o.gfog[2],1);gl.clearDepth(1);gl.depthMask(true);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.BLEND);
  // near things first, the ground last: the depth test then skips the ground under walls, roofs, props and characters
  gl.bindTexture(gl.TEXTURE_2D,HD.atl.t);gl.useProgram(P.char.p);gl.uniform1i(uc.uMode,0);hdDrawDyn(gl,4,HD.dynC,full);
  gl.useProgram(P.scene.p);gl.uniform1i(u.uMode,0);gl.uniform4fv(u.uXr,HD.xr);hdDrawDyn(gl,0,HD.dyn,full);
  if(S.tcd){gl.bindTexture(gl.TEXTURE_2D,S.tcd);if(dm&8)hdDrawChunks(gl,S.mcd);if(dm&4)hdDrawChunks(gl,S.mbl);}
  gl.bindTexture(gl.TEXTURE_2D,fr?S.tg1:S.tg0);if(dm&2){hdDrawChunks(gl,S.mst);hdDrawMesh(gl,S.mmisc);}if(dm&1)hdDrawChunks(gl,S.mg);
  gl.depthMask(false);gl.enable(gl.BLEND);gl.uniform1i(u.uMode,2);gl.uniform4f(u.uXr,0,0,1,0);
  // v0.5.8: shadows, glows and rings live in the sprite atlas. Until v0.5.7 this pass still had the ground texture bound, so every soft
  // shadow came out as a solid dark rectangle under the feet (opaque ground texels), the "hard dark bar" under characters
  gl.bindTexture(gl.TEXTURE_2D,HD.atl.t);
  gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);hdDrawDyn(gl,1,HD.dynB,full);
  gl.blendFunc(gl.SRC_ALPHA,gl.ONE);hdDrawDyn(gl,2,HD.dynA,full);
  gl.useProgram(P.char.p);gl.uniform1i(uc.uMode,2);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);hdDrawDyn(gl,5,HD.dynCB,full);// the Echo, see-through
  // the hero shows through whatever stands in front of him as a soft silhouette
  if(full&&HD.heroQ>=0){gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthFunc(gl.GREATER);gl.uniform1i(uc.uMode,1);gl.uniform4f(uc.uSil,.98,.9,.62,.5);
    gl.bindBuffer(gl.ARRAY_BUFFER,HD.vb[4]);h2Attribs(gl);gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,HD.heroQ*12);gl.depthFunc(gl.LEQUAL);}
  gl.depthMask(true);gl.disable(gl.BLEND);gl.disable(gl.DEPTH_TEST);gl.useProgram(P.scene.p);}
// Frame: light map, the scene straight onto the canvas (graded per pixel), a copy of it shrunk and blurred (the depth of field and bloom
// source), then one blended pass lays the blur over the top and bottom of the view (tilt shift) with bloom, light shafts and the vignette.
// One pass over the geometry per frame, culled to the chunks in view; nothing full size is rendered off screen.
function hdFrame(now){const m=WS.m,gl=HD.gl,q=hdTierQ(),still=gfxStill(),ts=still?0:now;
  if(HD.dirty||HD.map!==m||!HD.S||HD.baseRef!==WS.base[0]){hdBake(m);HD.baseRef=WS.base[0];}
  const sz=hdSize(q);hdCamera(m,now,sz,q);const o=hdLook(m,now),S=HD.S;
  HD.px=q.px||1;const nl=hdLights(m,ts,q,o);HD.dyn.n=0;HD.dynB.n=0;HD.dynA.n=0;HD.dynC.n=0;HD.dynCB.n=0;hdActors(m,now,ts);try{hdWfx(m,ts);}catch(e){HD.wfxErr=String(e&&e.message||e);}HD.dynUp=0;// v0.5.8: lights first, the characters read them
  hdDrawLM(gl,nl,o);
  const P=HD.P,sp=P.scene,u=sp.u,RT=HD.rt;
  for(let i=0;i<4;i++)gl.enableVertexAttribArray(i);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,HD.ib);gl.disable(gl.CULL_FACE);
  for(const pr of [P.char,sp]){const u=pr.u;gl.useProgram(pr.p);// v0.5.8: the same uniforms for the scene and the character program
  gl.uniformMatrix4fv(u.uVP,false,HD.mats.vp);gl.uniform3f(u.uO,HD.cam.x,0,HD.cam.z);
  gl.uniform3fv(u.uAmb,o.amb);gl.uniform3fv(u.uSunC,o.sun);gl.uniform3fv(u.uSunD,o.sd);
  const R=HD.lmR;gl.uniform4f(u.uLR,R[0],R[1],1/R[2],1/R[3]);
  gl.uniform3f(u.uCam,HD.eye[0]-HD.cam.x,HD.eye[1],HD.eye[2]-HD.cam.z);gl.uniform3fv(u.uFogC,o.fog);
  gl.uniform3f(u.uFog,HD.D*HD2D.fogStart,HD.D*HD2D.fogEnd,o.fogA);gl.uniform1f(u.uEmis,o.emis);gl.uniform1f(u.uAct,m.kind==='dungeon'?HD2D.spr.act.dun:HD2D.spr.act.out*Math.min(1,o.emis+.2));
  // v0.5.8 characters: pre-grade softening, light map spread, rim strength and colour (the sun or moon; lamps add their own colour in the
  // shader), the ambient's hue for the readability floor, one atlas texel (the rim reads the neighbour toward the light)
  {const P=HD2D.spr,a=o.amb,al=Math.max(.05,a[0]*.3+a[1]*.59+a[2]*.11),sn=o.sun,sl=Math.max(.05,sn[0]*.3+sn[1]*.59+sn[2]*.11),rk=Math.min(1,sl*2.2);
    gl.uniform4f(u.uSpr,P.sat,P.con,P.spread,P.rim);gl.uniform1f(u.uSpZ,P.spread);gl.uniform3f(u.uRimC,sn[0]/sl*.42*rk,sn[1]/sl*.42*rk,sn[2]/sl*.42*rk);
    gl.uniform3f(u.uAmbN,a[0]/al,a[1]/al,a[2]/al);gl.uniform1f(u.uAtl,1/HD.atl.s);
    const pc=o.plC,pl=HD.plR?o.pl:0;gl.uniform3f(u.uPL,WS.px+8-HD.cam.x,WS.py+12-HD.cam.z,HD.plR||1);gl.uniform3f(u.uPLC,pc[0]*pl,pc[1]*pl,pc[2]*pl);}// uPL relative to uO, like vW
  hdGrade(o);gl.uniformMatrix3fv(u.uGM,false,HD.gm);gl.uniform3fv(u.uGB,HD.gb);
  // x-ray: props and walls in front of the hero thin out around him
  {const p=HD.pt;h2Proj(p,HD.mats.vp,WS.px+8,(HD.heroH||24)*.45,WS.py+12);const rr=(m.kind==='dungeon'?HD2D.xray.dun:HD2D.xray.out)*WS.scale*HD2D.zoom/(sz.ch/2);
    HD.xr[0]=p[0];HD.xr[1]=p[1];HD.xr[2]=HD.asp;HD.xr[3]=rr*rr;gl.uniform1f(u.uXd,WS.py+13-HD.cam.z);HD.heroNdc[0]=p[0];HD.heroNdc[1]=p[1];}
  gl.uniform1i(u.uTex,0);gl.uniform1i(u.uLM,2);}gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,RT.lm.t);gl.activeTexture(gl.TEXTURE0);
  // graded fog colour for the clear (what shows past everything)
  {const g=o.gfog,f=o.fog,M=HD.gm,B=HD.gb;for(let i=0;i<3;i++)g[i]=Math.max(0,Math.min(1,M[i]*f[0]+M[3+i]*f[1]+M[6+i]*f[2]+B[i]));}
  const q1=RT.q1,q2=RT.q2,post=q.dof||q.bloom;
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,sz.w,sz.h);hdScene(gl,S,o,now,still,true);
  for(let i=1;i<4;i++)gl.disableVertexAttribArray(i);
  if(!post){HD.frames++;return;}
  // the blurred copy is remade every q.every frames (Medium: every other frame; the parts it softens are out of focus anyway), and at once
  // after a jump of the camera; the composite below runs every frame
  const camMv=Math.abs(HD.cam.x-(HD.lastBx||0))+Math.abs(HD.cam.z-(HD.lastBz||0));HD.postN=(HD.postN||0)+1;
  const redo=!HD.blurOk||HD.postN>=(q.every||1)||camMv>48||HD.blurSize!==HD.size||HD.syncDraw;
  if(redo){HD.postN=0;HD.blurOk=true;HD.blurSize=HD.size;HD.lastBx=HD.cam.x;HD.lastBz=HD.cam.z;
  // the finished frame, copied (one call, no second pass over the scene) and shrunk: the source of the blur
    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,RT.cp.t);gl.copyTexSubImage2D(gl.TEXTURE_2D,0,0,0,0,0,sz.w,sz.h);
    // horizontal blur straight from the full size copy into the small target (it shrinks as it blurs), then vertical; a second round on dof 2
    hdPost(gl,P,P.blur,RT.cp,q2,q2.w,q2.h);gl.uniform2f(P.blur.u.uD,q.blur/sz.w,0);gl.uniform1f(P.blur.u.uThr,0);hdFS(gl);
    hdPost(gl,P,P.blur,q2,q1,q1.w,q1.h);gl.uniform2f(P.blur.u.uD,0,1/q2.h);hdFS(gl);
    if(q.dof>1){hdPost(gl,P,P.blur,q1,q2,q2.w,q2.h);gl.uniform2f(P.blur.u.uD,1/q1.w,0);hdFS(gl);hdPost(gl,P,P.blur,q2,q1,q1.w,q1.h);gl.uniform2f(P.blur.u.uD,0,1/q2.h);hdFS(gl);}
    // High: a wider bloom, thresholded while it shrinks to an eighth
    if(RT.e1){hdPost(gl,P,P.blur,q1,RT.e2,RT.e2.w,RT.e2.h);gl.uniform2f(P.blur.u.uD,2/q1.w,0);gl.uniform1f(P.blur.u.uThr,HD2D.bloom.thr);hdFS(gl);
      hdPost(gl,P,P.blur,RT.e2,RT.e1,RT.e1.w,RT.e1.h);gl.uniform2f(P.blur.u.uD,0,1.5/RT.e2.h);gl.uniform1f(P.blur.u.uThr,0);hdFS(gl);}
  }
  let glowT=RT.e1||q1,thr=RT.e1?0:HD2D.bloom.thr;
  const C=P.comp;gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,sz.w,sz.h);gl.useProgram(C.p);
  gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,q1.t);gl.uniform1i(C.u.uB,1);
  gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,glowT.t);gl.uniform1i(C.u.uG,2);gl.activeTexture(gl.TEXTURE0);
  const fy=HD.heroNdc[1]*.5+.5,dof=HD2D.dof,bl=HD2D.bloom;
  const wide=Math.max(1,Math.min(2.6,sz.w/sz.h));// sideways views are short: a wider sharp band keeps the street in focus
  gl.uniform4f(C.u.uDof,fy+dof.shift,dof.band*wide,dof.ramp*Math.sqrt(wide),q.dof?dof.max:0);
  gl.uniform4f(C.u.uBl,thr,(q.bloom>1?bl.high:bl.med)*(1+o.bloom),RT.e1?1:0,0);
  gl.uniform4f(C.u.uSh,q.shafts&&m.kind!=='dungeon'?o.shaft*HD2D.shaft:0,ts/1000,0,0);gl.uniform3fv(C.u.uShC,o.shC);gl.uniform2f(C.u.uAsp,sz.w/sz.h,1);gl.uniform1f(C.u.uVig,o.vig);
  gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);hdFS(gl);gl.disable(gl.BLEND);
  HD.frames++;}
// ----- the 2D canvas on top: weather, ambience particles, festival lanterns, battle flash and fades (all screen space) -----
// the GL frame copied into the 2D canvas, under the weather: only for worldDraw calls from outside the game's frame loop (see the loop
// hook below), so what they read back is the whole picture. Frames of the game loop never read the GL canvas back.
function hdBlit(){const ctx=WS.ctx;ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='copy';ctx.imageSmoothingEnabled=false;ctx.drawImage(HD.cv,0,0,WS.vw,WS.vh);ctx.globalCompositeOperation='source-over';}
function hdOverlayBusy(m,now,still){const w=(m.kind==='field'||m.kind==='town')?(G.weather[m.s]||'clear'):'clear';
  return w!=='clear'||(typeof TR!=='undefined'&&TR.wx&&TR.wx.k<1)||!!m.amb||(WS.flash&&now-WS.flash<460)||(WS.fade&&now-WS.fade<230)||(WS.fadeIn&&now-WS.fadeIn<280);}
// v0.6.3: how far the ground at the focus moves on screen per art px of camera travel (x, z), so the full screen weather and theme
// layers scroll with the world (wfxTiled) instead of sitting still on the glass
function hdOvOffset(o){const p=HD.pt,M=HD.mats.vp,cx=HD.cam.x,cz=HD.cam.z;h2Proj(p,M,cx,0,cz);const x0=p[0],y0=p[1];h2Proj(p,M,cx+16,0,cz);const kx=(p[0]-x0)/2*WS.vw/16;
  h2Proj(p,M,cx,0,cz+16);const kz=-(p[1]-y0)/2*WS.vh/16;o[0]=cx*kx;o[1]=cz*kz;return o;}
const HOV=[0,0];
// the 2D canvas over the GL frame: only weather, the cave and dungeon theme layers, the battle flash and fades. The drifting ambience
// particles (sparkles, snow, wind, butterflies, motes, lanterns) are in the GL scene since v0.6.3 (hdWfx), anchored in the world.
function hdOverlay(now,composed){const ctx=WS.ctx,m=WS.m,vw=WS.vw,vh=WS.vh,still=gfxStill(),ts=still?0:now;
  if(composed){hdBlit();HD.ovClear=null;}
  else{// nothing to show and already clear: leave the 2D canvas alone (no repaint, no recomposite)
    const busy=hdOverlayBusy(m,now,still);if(!busy&&HD.ovClear===WS.cv)return;HD.ovClear=busy?null:WS.cv;
    // v0.6.3: clear the whole bitmap. Above Low the world canvas holds a 2x bitmap (sprhd2.js ssCanvas) and this cleared, and drew,
    // only its top left quarter: anything an earlier 2D frame left in the other three quarters stayed on screen over the GL view
    ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.clearRect(0,0,WS.cv._rw||vw,WS.cv._rh||vh);if(!busy){const k0=Math.max(1,(WS.cv._rw||vw)/vw);ctx.setTransform(k0,0,0,k0,0,0);return;}}
  // frames of the game loop draw the overlay at the canvas's own scale (the whole view); composed frames (tests) at logical size, like hdBlit
  const k=composed?1:Math.max(1,(WS.cv._rw||vw)/vw);
  ctx.setTransform(k,0,0,k,0,0);ctx.globalAlpha=1;ctx.imageSmoothingEnabled=false;
  let w=(m.kind==='field'||m.kind==='town')?(G.weather[m.s]||'clear'):null;const amb=m.amb&&!still;if(w==='clear'&&!(typeof TR!=='undefined'&&TR.wx&&TR.wx.k<1))w=null;
  if(w||amb){hdOvOffset(HOV);wfxTiled(ctx,vw,vh,HOV[0],HOV[1],c=>{if(w)weatherFX(c,w,vw,vh,ts,false);if(amb)themeFX(c,m,vw,vh,now);});}
  if(WS.flash&&now-WS.flash<460){const p=(now-WS.flash)/460;ctx.fillStyle=`rgba(255,255,255,${Math.floor(p*7)%2?0.85:0})`;ctx.fillRect(0,0,vw,vh);
    ctx.fillStyle='#0a0612';for(let i=0;i<8;i++){const a=i/8*Math.PI*2+p*4;ctx.save();ctx.translate(vw/2,vh/2);ctx.rotate(a);ctx.fillRect(0,-3,Math.max(vw,vh)*p,6);ctx.restore();}}
  if(WS.fade&&now-WS.fade<230){ctx.fillStyle=`rgba(8,4,2,${(now-WS.fade)/230})`;ctx.fillRect(0,0,vw,vh);}
  else if(WS.fadeIn&&now-WS.fadeIn<280){ctx.fillStyle=`rgba(8,4,2,${1-(now-WS.fadeIn)/280})`;ctx.fillRect(0,0,vw,vh);}
  {const k0=Math.max(1,(WS.cv._rw||vw)/vw);ctx.setTransform(k0,0,0,k0,0,0);}}// leave the canvas in its own scale for the 2D renderer
// ----- taps: through the camera. A tap on a character picks its tile; otherwise a ray walks the height map to the first block or ground -----
function hdPick(e){const cv=WS.cv;if(!cv||!WS.m||!HD.S)return null;const r=cv.getBoundingClientRect();if(!r.width||!r.height)return null;
  const nx=(e.clientX-r.left)/r.width*2-1,ny=1-(e.clientY-r.top)/r.height*2;
  const K=HD.pk;for(let i=HD.pkn-1;i>=0;i--){const o=i*7;if(nx>=K[o]&&nx<=K[o+2]&&ny>=K[o+1]&&ny<=K[o+3])return {px:K[o+4]*TS+8,py:K[o+5]*TS+8,tx:K[o+4],ty:K[o+5]};}
  const F=HD.fwd,U=HD.up,t=HD.tanH,dx=F[0]+nx*t*HD.asp,dy=F[1]+ny*t*U[1],dz=F[2]+ny*t*U[2],l=Math.hypot(dx,dy,dz),d=[dx/l,dy/l,dz/l];
  const S=HD.S,m=WS.m,E=HD.eye,hAt=(x,z)=>{const tx=Math.floor(x/TS),tz=Math.floor(z/TS);if(tx<0||tz<0||tx>=m.w||tz>=m.h)return 0;let h=Math.max(0,S.HT[tz*m.w+tx]);
    for(const o of S.bh||[]){const b=o.b;if(tx>=b.x&&tx<b.x+b.w&&tz>=b.y&&tz<b.y+b.h){h=Math.max(h,o.h);break;}}return h;};
  if(d[1]>=-.01)return null;let tt=Math.max(0,(E[1]-S.maxH)/-d[1]);const tEnd=(E[1]+2)/-d[1];
  for(;tt<=tEnd;tt+=2){const x=E[0]+d[0]*tt,y=E[1]+d[1]*tt,z=E[2]+d[2]*tt;if(y<=hAt(x,z)){return {px:x,py:z,tx:Math.floor(x/TS),ty:Math.floor(z/TS)};}}
  const x=E[0]+d[0]*tEnd,z=E[2]+d[2]*tEnd;return {px:x,py:z,tx:Math.floor(x/TS),ty:Math.floor(z/TS)};}
function hdActive(){return !!HD.live;}
// ----- hooks -----
// the game's own frame loop: frames drawn there present the GL canvas directly; a worldDraw called from anywhere else (a test drawing
// frames and reading the 2D canvas back) gets the GL frame composed into the 2D canvas, so it sees the whole picture
{const lp0=loop;loop=function(){HD.inLoop=1;try{return lp0.apply(this,arguments);}finally{HD.inLoop=0;}};}
{const rb0=rebuildBase;rebuildBase=function(){const r=rb0.apply(this,arguments);HD.dirty=true;return r;};}
{const mp0=mapPoint;mapPoint=function(e){if(!HD.live)return mp0.apply(this,arguments);try{return hdPick(e)||mp0.apply(this,arguments);}catch(_){return mp0.apply(this,arguments);}};}
{const wd0=worldDraw;worldDraw=function(now){
  const m=WS.m;if(!m||!WS.cv||!WS.ctx||!hdWant()||!hdInitGL()||HD.lost||!hdAttach()){if(HD.live||HD.cv&&HD.cv.parentElement)hdDetach();return wd0.apply(this,arguments);}
  try{try{trUpdate(now);}catch(e){}TR.inDraw=1;try{const t=performance.now(),sync=!HD.inLoop;HD.syncDraw=sync;
      hdFrame(now);HD.live=true;hdOverlay(now,sync);}finally{TR.inDraw=0;}}
  catch(e){HD.broken=true;HD.why=String(e&&e.message||e);hdDetach();try{hdFreeMap();}catch(_){}return wd0.apply(this,arguments);}};}
// Settings > HD-2D world (META.cfg.hd2d: true or missing = on, false = off). Only Medium and High use it.
function hdRow(){const on=hdCfgOn();if(!HD.gl&&!HD.broken){try{hdInitGL();}catch(e){}}
  const note=HD.broken?' Not available on this device, so the classic view is used.':(hdTierQ()?'':' Graphics is on Low, which keeps the classic view.');
  return `<div class="rows hdrows"><div class="row"><div><b>HD-2D world</b><small>Towns, fields and dungeons as a lit diorama: tilted camera, depth of field, glow and shadows. Medium and High graphics.${note}</small></div><div class="chips"><button class="chip ${on?'on':''}" data-act="cfg" data-arg='["hd2d",true]'>On</button><button class="chip ${on?'':'on'}" data-act="cfg" data-arg='["hd2d",false]'>Off</button></div></div></div>`;}
{const sb0=settingsBody;settingsBody=function(){return sb0.apply(this,arguments)+hdRow();};}
