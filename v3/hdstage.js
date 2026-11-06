// ===== hdstage.js (v0.5.3): HD-2D battle stage (WebGL1) =====
// Medium and High draw the battle stage in WebGL under the DOM unit layer (#bstage): the old canvas (#bcv) keeps drawing the units, bars,
// particles and weather on a transparent background at the logical stage size, and this file composites it over a lit diorama:
//  - the far backdrop is the baked 2D backdrop (bgStatic) above the ground line plus a few far props on the floor's back edge, blurred once
//    when the stage is built (depth of field) with its bright parts bloomed in;
//  - one perspective ground plane per backdrop (code drawn, tileable pixel textures with mipmaps; sharp where the units stand, softer
//    toward the horizon and the bottom edge, a road band for road backdrops, rune circles on boss stages), fog where it meets the backdrop;
//  - point lights (theme torches, braziers, lava, crystals, lanterns at night, spells, orbs in flight), soft unit shadows, a rim light on
//    units from the key light, light shafts (High), bloom from bright effects, a colour grade by time of day and weather, a vignette.
// 2.1 is kept: the ground plane starts at bgGY(H) exactly where the 2D one does, water, lava and cloud seas stay in the backdrop, unit
// boxes are untouched (the GL canvas has the same CSS box as #bcv, so damage numbers, tags, pips and tap targets stay aligned).
// Low, no WebGL, a lost context, a GL error or GFX.off: the old 2D stage, exactly (BV.glStage stays false). Tunables: HD_BATTLE, HD_FLOOR,
// HD_LOOK, HD_CAM (config.js). Nothing here reads or writes game state or the battle RNG (props use their own seeded R).
const HB={force:null/* tests only: draw this backdrop key */,skips:0,redraw:true,on:false,ok:null,why:'',gl:null,cv:null,R:null,lost:false,dead:false,noGL:false,bake:null,L:[],D:[],frames:0,ms:0,err:'',hp:'mediump',
  arr:{L:null,LC:null,S:null,D:null,DC:null},prog:{},fps:0};
function hbQ(){return (typeof HD_BATTLE!=='undefined'&&HD_BATTLE[GFX.tier])||{on:0};}
function hbWanted(){return !!(B&&!GFX.off&&hbQ().on&&!HB.noGL&&!HB.lost&&!HB.dead&&V.screen==='battle');}
function hbStill(){return gfxStill();}
// ----- shaders -----
const HB_VS='attribute vec2 aP;varying vec2 vUv;void main(){vUv=aP*.5+.5;gl_Position=vec4(aP,0.,1.);}';
// 9 tap gaussian along uDir; uThr>0 keeps only the bright part (bloom); input and output premultiplied
const HB_FS_BLUR=`precision mediump float;varying vec2 vUv;uniform sampler2D uT;uniform vec2 uDir;uniform float uThr;
vec4 tap(vec2 o){vec4 c=texture2D(uT,vUv+o);if(uThr>0.){float m=max(c.r,max(c.g,c.b));c.rgb*=smoothstep(uThr,1.,m);c.a=0.;}return c;}
void main(){vec4 s=tap(vec2(0.))*.2270;s+=(tap(uDir)+tap(-uDir))*.1946;s+=(tap(uDir*2.)+tap(-uDir*2.))*.1216;s+=(tap(uDir*3.)+tap(-uDir*3.))*.0541;s+=(tap(uDir*4.)+tap(-uDir*4.))*.0162;gl_FragColor=s;}`;
const HB_FS_ADD='precision mediump float;varying vec2 vUv;uniform sampler2D uA;uniform sampler2D uB;uniform float uK;void main(){vec4 a=texture2D(uA,vUv);vec3 b=texture2D(uB,vUv).rgb*uK;gl_FragColor=vec4(a.rgb+b*(1.-a.rgb*.5),a.a);}';
// bright pass of the unit layer for bloom (4 taps so 1 px sparks survive the half size target); HUD pixels (alpha 254) never bloom
const HB_FS_BRIGHT=`precision mediump float;varying vec2 vUv;uniform sampler2D uT;uniform vec2 uPx;uniform float uThr;
vec3 b(vec2 o){vec4 c=texture2D(uT,vUv+o);float hud=step(abs(c.a-.99608),.0025);float m=max(c.r,max(c.g,c.b));return c.rgb*c.a*(1.-hud)*smoothstep(uThr,1.,m);}
void main(){vec3 s=b(vec2(-.25,-.25)*uPx)+b(vec2(.25,-.25)*uPx)+b(vec2(-.25,.25)*uPx)+b(vec2(.25,.25)*uPx);gl_FragColor=vec4(s*.25,1.);}`;
function hbMainFS(o){return `#define NL ${o.nl}
#define NS ${o.ns}
#define ND ${o.nd}
#define RAYS ${o.rays?1:0}
#define RIM ${o.rim?1:0}
#define BLOOM ${o.bloom?1:0}
#define UNITS 1
precision ${HB.hp} float;varying vec2 vUv;
uniform sampler2D uBg,uFl,uFl2,uUn,uBl;
uniform vec2 uWH;uniform float uGy;uniform vec2 uOff;uniform float uPar;uniform vec4 uBgR;
uniform vec4 uFP;uniform vec4 uFoc;uniform vec2 uRoad;
uniform vec4 uL[NL];uniform vec4 uLC[NL];uniform vec4 uS[NS];uniform vec4 uD[ND];uniform vec4 uDC[ND];
uniform vec3 uAmbF;uniform vec3 uAmbB;uniform vec3 uAmbU;uniform vec3 uFog;uniform vec2 uFogP;
uniform vec3 uGain;uniform vec3 uLift;uniform vec4 uGrade;uniform vec4 uImp;uniform vec3 uImpC;uniform vec4 uSpot;
uniform vec4 uKey;uniform vec3 uKeyC;uniform vec2 uKeyP;uniform float uT;uniform vec3 uSky;uniform vec2 uCloud;uniform vec2 uUS;
float sq(float f){return uFP.w*(.5+.9*f);}
void main(){
  vec2 tc=vec2(vUv.x,1.-vUv.y);vec2 p=tc*uWH-uOff;
  float span=uWH.y-uGy;float f=clamp((p.y-uGy)/span,0.,1.);bool fl=p.y>=uGy;
  vec3 col=vec3(0.);vec3 em=vec3(0.);
  if(fl){float s=p.y-uGy+uFP.x*span;float z=(1.+uFP.x)*span/s;vec2 w=vec2((p.x-uWH.x*.5)*z,z*span*1.6);vec2 ft=w/uFP.y;
    float bias=uFoc.z*(max(0.,uFoc.x-f)/uFoc.x*2.4+max(0.,f-uFoc.y)/(1.-uFoc.y)*1.1);
    vec4 c=texture2D(uFl,ft,bias);
    if(uRoad.y>uRoad.x){vec4 r=texture2D(uFl2,ft,bias);float m=smoothstep(uRoad.x-.02,uRoad.x+.02,f)*(1.-smoothstep(uRoad.y-.02,uRoad.y+.02,f));c=mix(c,r,m*r.a+m*(1.-r.a));}
    float sh=1.;
    for(int i=0;i<NS;i++){vec4 S=uS[i];if(S.w>0.){vec2 d=(p-S.xy)/vec2(S.z,S.z*sq(f));float k=1.-smoothstep(.1,1.,length(d));sh*=1.-S.w*k;}}
    float cs=uCloud.x>0.?1.-uCloud.x*smoothstep(.25,.85,(.5+.5*sin(w.x*.021+uT*.11+sin(w.y*.013)*2.))*(.5+.5*sin(w.y*.017-uT*.07+w.x*.004))):1.;
    col=c.rgb*uAmbF*sh*cs*(1.-.24*smoothstep(.55,1.,f));em=c.rgb*(1.-c.a)*1.6;
    vec3 Lf=vec3(0.);
    for(int i=0;i<NL;i++){vec4 l=uL[i];if(l.w>0.){vec2 d=vec2(p.x-l.x,(p.y-l.z)/sq(f))/l.w;float k=max(0.,1./(1.+dot(d,d)*5.)-.14)*1.16;Lf+=uLC[i].rgb*k;}}
    col+=c.rgb*Lf*(.4+.6*sh)*1.4+em;
    for(int i=0;i<ND;i++){vec4 D=uD[i];if(D.z>0.){vec2 d=(p-D.xy)/vec2(D.z,D.z*sq(f));float L=length(d);if(L<1.25){float a=atan(d.y,d.x);
      float g=exp(-pow((L-1.)*13.,2.))+.75*exp(-pow((L-.8)*17.,2.));
      g+=step(.5,fract(a*1.9099+D.w))*exp(-pow((L-.9)*26.,2.))*.9;
      g+=.7*exp(-pow((L*(1.+.22*cos(6.*a+D.w*6.283))-.52)*15.,2.));g+=.22*(1.-smoothstep(0.,1.,L));
      col+=uDC[i].rgb*uDC[i].a*g;}}}
    float fo=uFogP.x*exp(-f*7.);col=mix(col,uFog,fo);
  }
  // far backdrop and its props (premultiplied, blurred and bloomed when baked)
  float py=p.y;if(py<uBgR.z){float par=uPar*clamp(1.-py/max(uGy,1.),0.,1.);vec2 bp=vec2((p.x+uBgR.x+par)/uBgR.y,max(py,0.)/uBgR.z);vec4 b=texture2D(uBg,bp);
    vec3 bc=b.rgb*mix(uSky,vec3(1.),clamp(py/max(uGy,1.)*1.3,0.,1.));if(!fl){float fb=uFogP.y*exp(-(uGy-py)/(uWH.y*.07));bc=mix(bc,uFog*b.a,fb);}col=col*(1.-b.a)+bc;}
  {float hz=exp(-pow((p.y-uGy)/(uWH.y*.035),2.));col=mix(col,uFog,hz*uFogP.y*.8);}
  // lights: a soft halo in the air (over the backdrop and around the units)
  vec3 La=vec3(0.);
  for(int i=0;i<NL;i++){vec4 l=uL[i];if(l.w>0.){vec2 d=(p-l.xy)/(l.w*.55);La+=uLC[i].rgb*exp(-dot(d,d)*2.2);}}
  col+=La*(fl?.18:.42);
#if RAYS
  {vec2 d=p-uKeyP;float a=atan(d.x,d.y);float r=length(d)/uWH.y;float sh=pow(.5+.5*sin(a*13.+uT*.21)*sin(a*5.3-uT*.13),3.);col+=uKeyC*sh*uKey.z*smoothstep(1.6,.1,r)*(fl?.35:1.);}
#endif
  // the unit layer (nearest, so pixels stay crisp); HUD pixels are unlit
  vec4 u=texture2D(uUn,tc);float hud=step(abs(u.a-.99608),.0025);
  if(u.a>0.){
    // v0.5.8: units take the stage's light like the floor does. Raw sprite colours are softened first (they are more saturated and
    // contrasty than the graded stage); the unit a pixel belongs to is found from the nearest feet (shadow) below it, which gives its
    // height (a little darker toward the feet) and its side (the side facing the key light or a lamp or spell is brighter); the two
    // strongest lights put a rim on the silhouette edge that faces them, the key light its own.
    vec3 ur=u.rgb;float l0=dot(ur,vec3(.299,.587,.114));ur=mix(vec3(l0),ur,uUS.x);ur=(ur-.5)*uUS.y+.5;
    // v0.8.0: the weather and soft glows share this layer; they are translucent, sprites are opaque. Only opaque pixels (un) take the
    // per unit shading, and it fades out toward the side of each unit's column (wc), so a fog bank, rain or snow crossing a unit's
    // column is no longer darkened or rim lit inside a hard edged box around it (the "boxes of clarity" in battle on High)
    float un=smoothstep(.55,.92,u.a);
    float hb=1e3,sx=p.x,sw=8.,wc=0.;for(int i=0;i<NS;i++){vec4 S=uS[i];float dx=abs(p.x-S.x)/(S.z*1.35);if(S.w>0.&&dx<1.){float h=S.y-p.y;if(h>-3.&&h<hb){hb=h;sx=S.x;sw=S.z;wc=1.-smoothstep(.72,1.,dx);}}}
    wc*=un*smoothstep(-3.,-1.,hb);
    float ao=hb<1e2?mix(1.,mix(.74,1.,smoothstep(0.,15.,hb)),wc):1.,sd=hb<1e2?clamp((p.x-sx)/sw,-1.,1.)*wc:0.;
    vec3 lu=uAmbU*ao*(1.+.14*sd*uKey.x);
    for(int i=0;i<NL;i++){vec4 l=uL[i];if(l.w>0.){vec2 d=(p-l.xy)/(l.w*.55);float sg=clamp((l.x-sx)/max(abs(l.x-sx),6.),-1.,1.);lu+=uLC[i].rgb*exp(-dot(d,d)*2.2)*1.1*(1.+.6*sd*sg);}}
#if RIM
    vec4 n=texture2D(uUn,tc+vec2(uKey.x,-.6)/uWH);float rim=step(n.a,.5)*(1.-hud)*un;lu+=uKeyC*rim*uKey.y;
    for(int i=0;i<2;i++){vec4 l=uL[i];if(l.w>0.){vec2 dl=l.xy-p;float dd=length(dl);vec2 d=(p-l.xy)/(l.w*.8);float k=exp(-dot(d,d)*1.4);
      vec4 m=texture2D(uUn,tc+dl/max(dd,1.)*1.5/uWH);lu+=uLC[i].rgb*step(m.a,.5)*(1.-hud)*un*k*.9;}}
#endif
    vec3 uc=mix(ur*lu,u.rgb,hud);col=mix(col,uc,u.a);}
#if BLOOM
  col+=texture2D(uBl,tc).rgb*uGrade.w;
#endif
  // impact frame, Limit spotlight, grade, vignette
  if(uImp.z>0.){vec2 d=(p-uImp.xy)/(uWH.y*.22);col=mix(col,col*.42,uImp.z*.75)+uImpC*uImp.z*exp(-dot(d,d))*1.2;}
  if(uSpot.z>0.){vec2 d=(p-uSpot.xy)/(uWH.y*.42);float k=exp(-dot(d,d));float lm=dot(col,vec3(.299,.587,.114));col=mix(col,mix(vec3(lm),col,.5+.5*k)*(.5+.5*k),uSpot.z);}
  col=col*uGain+uLift;float lm=dot(col,vec3(.299,.587,.114));col=mix(vec3(lm),col,uGrade.x);col=(col-.5)*uGrade.y+.5;
  vec2 q=tc-.5;col*=1.-uGrade.z*dot(q,q)*2.2;
  col=col/(1.+max(col-1.,0.)*.6);col=mix(col,u.rgb,hud);
  gl_FragColor=vec4(clamp(col,0.,1.),1.);}`;}
// ----- GL plumbing -----
function hbShader(gl,t,src){const s=gl.createShader(t);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)&&!gl.isContextLost())throw new Error('hb shader: '+gl.getShaderInfoLog(s));return s;}
function hbProgram(gl,fs){const p=gl.createProgram();gl.attachShader(p,hbShader(gl,gl.VERTEX_SHADER,HB_VS));gl.attachShader(p,hbShader(gl,gl.FRAGMENT_SHADER,fs));gl.bindAttribLocation(p,0,'aP');gl.linkProgram(p);
  if(!gl.getProgramParameter(p,gl.LINK_STATUS)&&!gl.isContextLost())throw new Error('hb link: '+gl.getProgramInfoLog(p));const u={};
  const n=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS)||0;for(let i=0;i<n;i++){const a=gl.getActiveUniform(p,i);const nm=a.name.replace(/\[0\]$/,'');u[nm]=gl.getUniformLocation(p,nm);}return {p,u};}
function hbTex(gl,o){const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);const f=o.near?gl.NEAREST:gl.LINEAR,w=o.rep?gl.REPEAT:gl.CLAMP_TO_EDGE;
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,o.magNear?gl.NEAREST:f);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,o.mip?gl.LINEAR_MIPMAP_LINEAR:f);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,w);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,w);
  if(o.src){gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!!o.pm);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,o.src);if(o.mip)gl.generateMipmap(gl.TEXTURE_2D);}
  else gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,o.w,o.h,0,gl.RGBA,gl.UNSIGNED_BYTE,null);return t;}
function hbFbo(gl,w,h){w=Math.max(1,Math.round(w));h=Math.max(1,Math.round(h));const tex=hbTex(gl,{w,h}),fb=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,fb);
  gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tex,0);gl.bindFramebuffer(gl.FRAMEBUFFER,null);return {fb,tex,w,h};}
function hbFboFree(gl,o){if(!o)return;try{gl.deleteFramebuffer(o.fb);gl.deleteTexture(o.tex);}catch(e){}}
function hbSetup(){
  if(HB.R)return true;let gl=HB.gl;
  if(!gl){const cv=document.createElement('canvas');cv.id='bgl';cv.className='bgl';cv.setAttribute('aria-hidden','true');
    cv.style.cssText='position:absolute;left:0;top:0;transform-origin:0 0;pointer-events:none;image-rendering:pixelated;display:none';
    const opt={alpha:false,antialias:false,depth:false,stencil:false,premultipliedAlpha:false,preserveDrawingBuffer:false,powerPreference:'default'};
    gl=cv.getContext('webgl',opt)||cv.getContext('experimental-webgl',opt);if(!gl){HB.ok=false;HB.why='no webgl';return false;}
    cv.addEventListener('webglcontextlost',e=>{e.preventDefault();HB.lost=true;HB.R=null;HB.bake=null;HB.why='context lost';hbShow(false);},false);
    cv.addEventListener('webglcontextrestored',()=>{HB.lost=false;HB.R=null;HB.bake=null;HB.prog={};HB.why='';},false);
    HB.gl=gl;HB.cv=cv;}
  if(gl.isContextLost()){HB.lost=true;return false;}
  try{const hf=gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER,gl.HIGH_FLOAT);HB.hp=hf&&hf.precision>0?'highp':'mediump';}catch(e){HB.hp='mediump';}
  const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);gl.disable(gl.DEPTH_TEST);gl.disable(gl.BLEND);
  HB.R={buf,blur:hbProgram(gl,HB_FS_BLUR),add:hbProgram(gl,HB_FS_ADD),bright:hbProgram(gl,HB_FS_BRIGHT),un:hbTex(gl,{w:1,h:1,near:true}),bl:null,bl2:null};HB.prog={};HB.ok=true;return true;}
function hbMain(q){const k=[q.lights,q.shadows,q.decals,q.rays,q.rim,q.bloomK>0].join(',');if(!HB.prog[k])HB.prog[k]=hbProgram(HB.gl,hbMainFS({nl:q.lights,ns:q.shadows,nd:q.decals,rays:q.rays,rim:q.rim,bloom:q.bloomK>0}));return HB.prog[k];}
function hbPass(prog,fbo,tex,setU){const gl=HB.gl;gl.bindFramebuffer(gl.FRAMEBUFFER,fbo?fbo.fb:null);gl.viewport(0,0,fbo?fbo.w:HB.cv.width,fbo?fbo.h:HB.cv.height);gl.useProgram(prog.p);
  (tex||[]).forEach((t,i)=>{gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,t);});if(setU)setU(prog.u,gl);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);}
function hbBlur(src,dst,dx,dy,thr){hbPass(HB.R.blur,dst,[src],(u,gl)=>{gl.uniform1i(u.uT,0);gl.uniform2f(u.uDir,dx,dy);gl.uniform1f(u.uThr,thr||0);});}
// ----- what a backdrop key is made of -----
function hbInfo(key){const D=th=>DTHEME[th]||DTHEME.meadow;
  if(key==='arena')return {key,base:'meadow',kind:'arena',g:'arena',out:true};
  let m;if((m=/^d_(\w+)$/.exec(key)))return {key,base:m[1],kind:'hall',g:'hall',D:D(m[1])};
  if((m=/^c_(\w+)$/.exec(key)))return {key,base:m[1],kind:'cavern',g:'cavern',D:D(m[1])};
  if((m=/^boss_(\w+)$/.exec(key)))return {key,base:m[1],kind:'boss',g:'boss',D:D(m[1])};
  if((m=/^f:(\w+):(\w+)$/.exec(key)))return {key,base:m[1],kind:'field',g:m[2],out:true,D:D(m[1])};
  return {key,base:key,kind:'field',g:(typeof BG_NATURAL!=='undefined'&&BG_NATURAL[key])||'grass',out:true,D:D(key)};}
function hbRGB(c){if(/^#[0-9a-f]{6}$/i.test(c)){const n=parseInt(c.slice(1),16);return [(n>>16)/255,((n>>8)&255)/255,(n&255)/255];}return [1,1,1];}
// ----- floor textures (128x128, tileable pixel art; alpha below 1 marks glowing pixels) -----
const HB_TS=128;
function hbGPal(info){const P=typeof BG_GPAL!=='undefined'?BG_GPAL:{},g=info.g,th=info.base;
  if(info.kind==='hall'||info.kind==='boss'||info.kind==='cavern'){const f=info.D.f;return [[f[2],f[0],f[1],f[3]],f[3]];}
  if(info.kind==='arena')return [['#e0c890','#d0b47a','#c0a068','#a88a58'],'#b89a68'];
  const nat=(typeof BG_NATURAL!=='undefined'&&BG_NATURAL[th])||'grass',gg=g==='road'?nat:g;
  if(th==='snow'&&gg!=='rock')return P.snow||[['#f4faff','#e4eef6','#ccdcea','#b8cce0'],'#c8d8e8'];
  return P[gg]||P.grass||[['#6ab858','#5aa048','#4c8f3e','#3f7f32'],'#3a7a30'];}
function hbFloorTile(info,road){const N=HB_TS,cv=mkCv(N,N),x=cv.getContext('2d'),R=mulberry(hashS(info.key+(road?':r':''))),glow=[];
  const P=hbGPal(info),c=P[0],ln=P[1],pk=a=>a[Math.floor(R()*a.length)];
  const px=(X,Y,w,h,col)=>{x.fillStyle=col;X=((Math.floor(X)%N)+N)%N;Y=((Math.floor(Y)%N)+N)%N;for(const ox of [0,-N])for(const oy of [0,-N])x.fillRect(X+ox,Y+oy,w,h);};
  const blot=(n,cols,smax)=>{for(let i=0;i<n;i++){const s=1+Math.floor(R()*smax);px(R()*N,R()*N,s+Math.floor(R()*2),s,pk(cols));}};
  const g=road?'road':info.g,th=info.base;
  x.fillStyle=c[1];x.fillRect(0,0,N,N);
  // macro patches first, so the floor reads in perspective (lighter and darker clumps)
  if(!road)for(let i=0;i<16;i++){const cx=R()*N,cy=R()*N,rr=6+R()*12,cc=i%2?shade(c[0],1.06):shade(c[2],.94);for(let k=0;k<rr*rr*1.4;k++){const a=R()*6.283,d=Math.sqrt(R())*rr;px(cx+Math.cos(a)*d,cy+Math.sin(a)*d*.8,2,1,cc);}}
  if(g==='road'){const rc=th==='snow'?['#d4dde8','#c4cede','#b4c0d0','#a4b0c4']:th==='cave'||th==='void'?['#6a6270','#5a5262','#4a4454','#3c3646']:['#c8a874','#b8986a','#a8885a','#94784c'];
    x.fillStyle=rc[1];x.fillRect(0,0,N,N);blot(500,rc,2);
    for(let y=0;y<N;y+=9)for(let X=((y/9)%2)*6;X<N;X+=12){const w=8+Math.floor(R()*3),h=6+Math.floor(R()*2),cc=pk(rc.slice(0,3));px(X,y,w,h,shade(rc[3],.85));px(X+1,y,w-2,h-1,cc);px(X+1,y,w-2,1,shade(cc,1.12));}
    blot(60,[shade(rc[3],.8)],1);}
  else if(g==='hall'||g==='boss'){const T=g==='boss'?32:16;blot(400,c,2);
    for(let y=0;y<N;y+=T)for(let X=((y/T)%2)*(T/2);X<N;X+=T){const cc=pk(c.slice(0,3));px(X+1,y+1,T-2,T-2,cc);for(let k=0;k<T*1.5;k++)px(X+1+R()*(T-3),y+1+R()*(T-3),1,1,pk(c));px(X+1,y+1,T-2,1,shade(cc,1.14));px(X,y,T,1,shade(c[3],.8));px(X,y,1,T,shade(c[3],.8));
      if(R()<.3){let cx=X+2+R()*(T-4),cy=y+2+R()*(T-4);for(let k=0;k<6;k++){px(cx,cy,1,1,shade(c[3],.85));cx+=R()<.5?1:-1;cy+=1;}}}
    if(th==='meadow')for(let i=0;i<40;i++)px(R()*N,R()*N,2,1,info.D.acc);
    if(g==='boss')for(let y=0;y<N;y+=T)for(let X=0;X<N;X+=T){px(X+T/2-2,y+T/2-2,4,4,shade(c[3],.9));px(X+T/2-1,y+T/2-1,2,2,info.D.acc);glow.push([X+T/2-1,y+T/2-1,2,2,.45]);}}
  else if(g==='cavern'){blot(900,c,3);for(let i=0;i<70;i++){const w=3+Math.floor(R()*6),X=R()*N,Y=R()*N;px(X,Y,w,2,shade(c[1],.8));px(X,Y,w,1,shade(c[0],1.18));}
    for(let i=0;i<9;i++){const X=R()*N,Y=R()*N;px(X,Y,2,1,info.D.acc);px(X+1,Y-1,1,1,info.D.acc2);glow.push([X,Y-1,2,2,.5]);}}
  else if(g==='arena'){blot(1200,c,2);for(let y=6;y<N;y+=16)for(let X=0;X<N;X+=2)if(R()<.7)px(X,y+Math.round(Math.sin(X/9)*1.5),2,1,shade(c[2],.92));}
  else if(g==='sand'||(th==='coast'&&g!=='grass'&&g!=='tall'&&g!=='flowers'&&g!=='forest'&&g!=='rock')){blot(1400,c,1);
    for(let y=4;y<N;y+=11){const ph=R()*6;for(let X=0;X<N;X++){const yy=y+Math.round(Math.sin(X/10+ph)*2);px(X,yy,1,1,shade(c[2],.96));if(X%3===0)px(X,yy-1,1,1,shade(c[0],1.04));}}
    for(let i=0;i<14;i++)px(R()*N,R()*N,2,1,pk(['#f6e8d8','#f0a8a0','#c8b080']));}
  else if(g==='snow'||(th==='snow'&&g!=='rock')){blot(900,c,2);for(let i=0;i<80;i++)px(R()*N,R()*N,3,1,'#ffffff');for(let i=0;i<60;i++)px(R()*N,R()*N,1,1,'#a8bcd4');
    for(let i=0;i<16;i++){const X=R()*N,Y=R()*N;px(X,Y,1,1,'#ffffff');glow.push([X,Y,1,1,.35]);}
    if(g==='forest'||g==='tall')for(let i=0;i<120;i++){const X=R()*N,Y=R()*N;px(X,Y,1,2,pk(['#4a6a5a','#2a4a4a']));}}
  else if(g==='rock'||g==='cave'||th==='cave'&&g!=='void'){blot(1000,c,3);
    for(let i=0;i<34;i++){const w=4+Math.floor(R()*10),h=3+Math.floor(R()*5),X=R()*N,Y=R()*N,cc=pk(c.slice(0,3));px(X,Y,w,h,shade(c[3],.85));px(X+1,Y,w-2,h-1,cc);px(X+1,Y,w-2,1,shade(cc,1.2));}
    for(let i=0;i<120;i++)px(R()*N,R()*N,1,1,shade(ln,.9));
    if(th==='cave')for(let i=0;i<6;i++){let X=R()*N,Y=R()*N;for(let k=0;k<8;k++){px(X,Y,1,1,'#ff7a2a');glow.push([X,Y,1,1,.6]);X+=1;Y+=R()<.5?1:0;}}}
  else if(g==='void'){blot(900,c,2);for(let y=0;y<N;y+=16)for(let X=((y/16)%2)*8;X<N;X+=16){px(X,y,16,1,shade(c[3],.8));px(X,y,1,16,shade(c[3],.8));}
    for(let i=0;i<10;i++){let X=R()*N,Y=R()*N;for(let k=0;k<9;k++){px(X,Y,2,1,'#8b5fd0');glow.push([X,Y,2,1,.55]);X+=2;Y+=R()<.5?1:-1;}}}
  else{// grass, tall, flowers, forest, high
    blot(1100,c,2);const bl=g==='tall'||g==='forest'?900:520;
    for(let i=0;i<bl;i++){const X=R()*N,Y=R()*N,h=g==='tall'?3+Math.floor(R()*3):2+Math.floor(R()*2),cc=R()<.5?shade(c[0],1.12):ln;px(X,Y,1,h,cc);if(R()<.4)px(X+1,Y+1,1,h-1,shade(cc,.9));}
    if(g==='forest')for(let i=0;i<110;i++)px(R()*N,R()*N,2,1,pk(['#a8742a','#c8902a','#7a4a1a','#5a3a1a']));
    if(g==='high')for(let i=0;i<24;i++){const X=R()*N,Y=R()*N,w=2+Math.floor(R()*4);px(X,Y,w,2,'#7a7468');px(X,Y,w,1,'#a8a094');}
    const fn=g==='flowers'?110:g==='grass'||g==='high'?22:6;
    for(let i=0;i<fn;i++){const X=R()*N,Y=R()*N,fc=pk(['#f06a8a','#f6e06a','#ffffff','#b07aff','#ff9a4a']);px(X,Y,2,2,fc);px(X,Y,1,1,shade(fc,1.25));}}
  if(glow.length){const d=x.getImageData(0,0,N,N),a=d.data;glow.forEach(([X,Y,w,h,e])=>{for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){const i=((((Math.floor(Y)+yy)%N+N)%N)*N+(((Math.floor(X)+xx)%N+N)%N))*4;a[i+3]=Math.round(255*(1-e));}});x.putImageData(d,0,0);}
  return cv;}
// ----- far props standing on the back edge of the floor (drawn into the backdrop before the blur), and the stage's own lights -----
function hbProps(ctx,info,BW,gy,strip,H,R,lights,night){
  const D=info.D||DTHEME.meadow,th=info.base,k=info.kind,g=info.g,f=(col,x,y,w,h)=>{ctx.fillStyle=col;ctx.fillRect(Math.round(x),Math.round(y),w,h);};
  const L=(x,y,foot,r,col,int,fl)=>lights.push({x,y,foot,r,col:hbRGB(col),int,fl:fl==null?1:fl});
  const tree=(x,y,s)=>{f('#4a3420',x-1,y-6*s,2,6*s);const cs=['#2f6a2e','#3f7f32','#5aa048'];for(let i=0;i<3;i++)pxCircle(ctx,Math.round(x+(i-1)*3*s),Math.round(y-8*s-(i===1?3*s:0)),Math.round(4*s),cs[i===1?2:i]);pxCircle(ctx,Math.round(x),Math.round(y-10*s),Math.round(2.4*s),'#6ab858');};
  const pine=(x,y,s,snow)=>{f('#3a2a1a',x,y-4,2,4);for(let i=0;i<Math.round(12*s);i++){const w=Math.floor(i/2.3);f(snow?'#2a4a4a':'#2a5a34',x+1-w,y-4-Math.round(12*s)+i,w*2+1,1);}if(snow){f('#f4faff',x,y-4-Math.round(12*s),2,2);f('#f4faff',x-2,y-4-Math.round(6*s),5,1);}};
  const bush=(x,y,col)=>{pxCircle(ctx,x,y-2,3,col);pxCircle(ctx,x+3,y-2,2,shade(col,1.1));f(shade(col,1.25),x-1,y-5,2,1);};
  const rock=(x,y,w,col)=>{f(shade(col,.75),x,y-3,w,3);f(col,x+1,y-4,w-2,3);f(shade(col,1.25),x+1,y-4,w-3,1);};
  const torch=(x,y)=>{f('#2a1a10',x,y-10,2,10);f('#5a3a1a',x-1,y-11,4,2);f('#ffb04a',x-1,y-15,4,4);f('#fff0a0',x,y-14,2,2);L(x+1,y-13,y,46,'#ffa040',.85,1);};
  const crystal=(x,y,col,col2)=>{f(shade(col,.6),x,y-7,3,7);f(col,x+1,y-9,2,8);f(col2,x+1,y-9,1,3);f(col,x+3,y-5,2,5);L(x+2,y-5,y,34,col,.5,.5);};
  const n=Math.max(4,Math.round(BW/34)),xs=[];for(let i=0;i<n;i++){const side=i%2?R()*.26:.74+R()*.26;xs.push(side*BW);}
  const yb=()=>gy+1+Math.floor(R()*Math.max(1,strip-3));
  if(k==='field'){
    for(const x of xs){const y=yb();
      if(th==='coast'){if(R()<.5){f('#4a2a3a',x,y-14,2,14);[[-6,2],[6,1],[-4,-2],[5,-3]].forEach(([dx,dy])=>{for(let j=0;j<6;j++)f('#2a3a2a',x+Math.round(dx*j/6),y-14+Math.round(dy*j/6)+Math.floor(j*j/12),2,1);});}else rock(x,y,6,'#a89070');}
      else if(th==='snow')R()<.7?pine(x,y,.9+R()*.5,true):rock(x,y,6,'#c8d8e8');
      else if(th==='heights'){if(R()<.5){f('#6a6880',x,y-11,4,11);f('#8a88a0',x+1,y-12,2,11);}else rock(x,y,7,'#7a7468');}
      else if(th==='cave'){f('#2e2024',x,y-9,4,9);f('#4a3034',x+1,y-11,2,3);}
      else if(th==='void'){if(R()<.5)crystal(x,y,'#8b5fd0','#e0c8ff');else rock(x,y,6,'#3a2a5a');}
      else{if(g==='forest'||R()<.4)tree(x,y,.7+R()*.4);else if(R()<.6)bush(x,y,'#3f7f32');else rock(x,y,5,'#8a8478');}}
    // a lantern at night (outdoors), lava glow behind a cave shelf
    if(night&&th!=='cave'&&th!=='void'){const x=Math.round(BW*(.12+R()*.1)),y=gy+2;f('#2a1a10',x,y-12,1,12);f('#3a2a1a',x-1,y-13,3,1);f('#ffd27a',x-1,y-12,3,3);L(x,y-11,y,52,'#ffc070',.9,.6);}
    if(th==='cave')[.15,.5,.85].forEach(t=>L(BW*t,gy-H*.1,gy+1,80,'#ff6a20',.55,.8));
    if(th==='void')L(BW*.5,gy-H*.2,gy+1,90,'#8b5fd0',.35,.3);}
  else if(k==='cavern'){for(const x of xs){const y=yb();if(R()<.5)crystal(x,y,D.acc,D.acc2);else{f(shade(D.w[0],.8),x,y-10,4,10);f(D.w[2],x+1,y-12,2,3);}}}
  else if(k==='hall'){for(let i=0;i<3;i++){const x=BW*(.22+i*.28),y=H*.24;L(x,y-2,gy+1,48,'#ffa040',.75,1);}
    [BW*.06,BW*.94].forEach(x=>torch(Math.round(x),gy+Math.max(2,strip-3)));
    for(const x of xs.slice(0,3)){const y=yb();if(R()<.5){f('#5a4020',x,y-6,7,6);f('#7a5a30',x,y-6,7,1);f('#3a2a10',x+3,y-6,1,6);}else rock(x,y,5,D.w[2]);}}
  else if(k==='boss'){[BW*.18,BW*.82].forEach(x=>L(Math.floor(x),gy-17,gy+1,62,'#ffa040',1.05,1));
    [BW*.04,BW*.96].forEach(x=>torch(Math.round(x),gy+Math.max(2,strip-3)));}
  else if(k==='arena'){for(let i=0;i<3;i++){const x=BW*(.15+i*.35),y=yb();rock(x,y,5,'#a88a58');}}
}
// ----- the look: grade, ambient and key light for this battle -----
function hbLook(info){const out=info.out&&!(typeof battleIndoors==='function'&&battleIndoors());let ph='day';
  if(out&&B&&B.spec&&B.spec.kind!=='daily'&&typeof phaseProg==='function'){try{ph=phaseProg().ph;}catch(e){}}
  const base=HD_LOOK[out?ph:'indoor']||HD_LOOK.day,wx=out&&B&&HD_LOOK.wx[B.weather]||{},o={ph:out?ph:'indoor',out};
  o.gain=base.gain.map((v,i)=>v*((wx.gain||[1,1,1])[i]));o.lift=base.lift;o.sat=base.sat*(wx.sat||1);o.con=base.con;o.amb=base.amb;o.key=base.key;o.vig=base.vig;o.fog=wx.fog||0;
  // the key light: where the sun (or moon) sits in each realm's backdrop, as a share of the stage
  const K={meadow:[.78,.06],coast:[.5,.3],snow:[.3,.04],heights:[.72,.02],void:[.5,-.1],cave:[.5,.42]}[info.base]||[.5,0];
  o.kp=out?K:[.5,-.2];o.sky=out?(base.sky||[1,1,1]):[1,1,1];o.cloud=out&&(o.ph==='day'||o.ph==='dawn')&&!/rain|storm|fog|snow|blizzard|sand/.test(B&&B.weather||'')?.16:0;o.kx=out?(o.kp[0]>.6?1:o.kp[0]<.4?-1:0):0;o.night=o.ph==='night';return o;}
// ----- bake: backdrop, floor and lights for this key and size -----
function hbBake(key,W,H){const gl=HB.gl,q=hbQ(),info=hbInfo(key),gy=bgGY(H),M=(typeof GFX_PARA!=='undefined'?GFX_PARA.px:4)+2,BW=W+2*M,strip=Math.max(4,Math.ceil(H*.07)),BH=gy+strip;
  const look=hbLook(info),old=HB.bake;
  const src=mkCv(BW,BH),c=src.getContext('2d');c.imageSmoothingEnabled=false;
  let base;try{base=bgStatic(key,BW,H);}catch(e){base=null;}
  if(base)c.drawImage(base,0,0,BW,gy,0,0,BW,gy);else{c.fillStyle='#334';c.fillRect(0,0,BW,gy);}
  // the drifting clouds of the 2D stage are baked in as soft far clouds (outdoors, by day)
  if(info.kind==='field'&&!look.night&&/meadow|heights|snow|coast/.test(info.base)&&typeof cloudBlob==='function'){const Rc=mulberry(hashS(key)+3),cc=info.base==='heights'?['#3a4060','#262a44']:info.base==='coast'?['#f8c8b0','#e8a890']:['#ffffff','#d8e8f4'];
    for(let i=0;i<3;i++)cloudBlob(c,Math.floor(Rc()*BW*.9),Math.floor(gy*(.12+Rc()*.3)),22+Math.floor(Rc()*18),cc[0],cc[1]);}
  const lights=[];if(q.props)hbProps(c,info,BW,gy,strip,H,mulberry(hashS(key)+W*7+H),lights,look.night);
  // fog: the colour of the backdrop just above the ground line
  let fog=[.6,.65,.7];try{const d=c.getImageData(0,Math.max(0,gy-3),BW,1).data;let r=0,g=0,b=0,n=0;for(let i=0;i<d.length;i+=4){if(d[i+3]>200){r+=d[i];g+=d[i+1];b+=d[i+2];n++;}}if(n)fog=[r/n/255,g/n/255,b/n/255];}catch(e){}
  // blur (depth of field) and bloom, once
  const tSrc=hbTex(gl,{src,pm:true}),k2=2,A=hbFbo(gl,BW*k2,BH*k2),Bf=hbFbo(gl,BW*k2,BH*k2),C=hbFbo(gl,BW/2,BH/2),Dd=hbFbo(gl,BW/2,BH/2),F=hbFbo(gl,BW*k2,BH*k2);
  const dof=q.dof||0,st=.34*dof;
  hbBlur(tSrc,A,st/BW,0);hbBlur(A.tex,Bf,0,st/BH);
  hbBlur(Bf.tex,C,1.6/BW*2,0,.9);hbBlur(C.tex,Dd,0,1.6/BH*2);
  hbPass(HB.R.add,F,[Bf.tex,Dd.tex],(u,gl)=>{gl.uniform1i(u.uA,0);gl.uniform1i(u.uB,1);gl.uniform1f(u.uK,.45);});
  [A,Bf,C,Dd].forEach(o=>hbFboFree(gl,o));gl.deleteTexture(tSrc);
  const fl=hbTex(gl,{src:hbFloorTile(info),rep:true,mip:true,magNear:true});
  const road=info.g==='road'?hbTex(gl,{src:hbFloorTile(info,true),rep:true,mip:true,magNear:true}):null;
  // theme lights in stage coordinates (the bake is M px wider on each side)
  lights.forEach(l=>{l.x-=M;});
  const decals=[];if(info.kind==='boss'){const D=info.D;decals.push({x:BW*.28-M,y:gy+(H-gy)*.55,r:W*.18,col:hbRGB(D.acc),a:.55,spin:.02,still:1});lights.push({x:BW*.28-M,y:gy+(H-gy)*.55,foot:gy+(H-gy)*.55,r:W*.22,col:hbRGB(D.acc),int:.35,fl:.3});}
  if(old){[old.F,old.S].forEach(o=>hbFboFree(gl,o));try{gl.deleteTexture(old.fl);if(old.road)gl.deleteTexture(old.road);}catch(e){}}
  const span=H-gy,rb=info.g==='road'?[.12,.94]:[0,0];
  const tg=look.amb.map((v,i)=>Math.max(0,Math.min(1,v*look.gain[i]*1.04))),tint=tg.every(v=>v>.97)?null:{k:tg.map(v=>v.toFixed(2)).join(','),css:`rgb(${tg.map(v=>Math.round(v*255)).join(',')})`};
  HB.bake={tint,id:key+'|'+W+'x'+H+'|'+GFX.tier+'|'+look.ph+'|'+(B&&B.weather),key,info,W,H,gy,M,BW,BH,F,fl,road,lights,decals,fog,look,rb,span};
  return HB.bake;}
function hbBakeId(key,W,H){const info=hbInfo(key);return key+'|'+W+'x'+H+'|'+GFX.tier+'|'+hbLook(info).ph+'|'+(B&&B.weather);}
// ----- lights and floor circles spawned by effects (hdspell.js) -----
// light: {x,y,foot,r,col:[r,g,b],int,t0,life,fade:'out'|'in'|'pulse'}; decal: {x,y,r,col,a,t0,life,spin}
function hbLight(o){if(!HB.on||hbStill())return;o.t0=o.t0||performance.now();HB.L.push(o);if(HB.L.length>24)HB.L.splice(0,HB.L.length-24);}
function hbDecal(o){if(!HB.on||hbStill())return;o.t0=o.t0||performance.now();HB.D.push(o);if(HB.D.length>10)HB.D.splice(0,HB.D.length-10);}
function hbEnv(o,now){const t=(now-o.t0)/o.life;if(t<0)return 0;if(t>=1)return -1;
  if(o.fade==='in')return t<.8?t/.8:1-(t-.8)/.2;if(o.fade==='pulse')return Math.sin(t*Math.PI);return t<.08?t/.08:Math.pow(1-(t-.08)/.92,1.6);}
// ----- canvas placement -----
function hbShow(on){const cv=HB.cv,bc=document.getElementById('bcv');if(cv){cv.style.display=on?'block':'none';if(!on)cv.style.translate='';}if(bc)bc.style.opacity=on&&hbQ().mode!=='under'?'0':'';HB.redraw=true;}
function hbPlace(){const wrap=document.getElementById('bwrap'),bc=document.getElementById('bcv'),cv=HB.cv;if(!wrap||!bc||!cv)return false;
  if(cv.parentNode!==wrap||cv.nextSibling!==bc){wrap.insertBefore(cv,bc);HB.redraw=true;}
  const op=hbQ().mode==='under'?'':'0';if(cv.style.display!=='block')cv.style.display='block';if(bc.style.opacity!==op)bc.style.opacity=op;
  const q=hbQ(),dpr=Math.max(1,window.devicePixelRatio||1),cw=BL.W*BL.sc,ch=BL.H*BL.sc;let r=Math.min(q.res||1,dpr);
  if(cw*ch*r*r>(q.maxPx||1e6))r=Math.sqrt((q.maxPx||1e6)/(cw*ch));
  const bw=Math.max(1,Math.round(cw*r)),bh=Math.max(1,Math.round(ch*r));
  if(cv.width!==bw||cv.height!==bh){cv.width=bw;cv.height=bh;HB.redraw=true;}
  const sw=cw+'px',sh=ch+'px';if(cv.style.width!==sw)cv.style.width=sw;if(cv.style.height!==sh)cv.style.height=sh;
  return true;}
// ----- the lite composite (Medium): the stage is baked once with the full shader (a still), each frame only adds shadows, lights, the
// unit layer, bloom, the impact frame and the grade for units; floor circles are drawn into the unit layer under the units (hbUnder) -----
function hbLiteFS(o){return `#define NL ${o.nl}
#define NS ${o.ns}
#define RIM ${o.rim?1:0}
#define BLOOM ${o.bloom?1:0}
#define UNITS ${o.units?1:0}
precision mediump float;varying vec2 vUv;uniform sampler2D uSt,uUn,uBl;
uniform vec2 uWH;uniform float uGy;uniform vec2 uOff;uniform float uSq;uniform vec4 uL[NL];uniform vec4 uLC[NL];uniform vec4 uS[NS];
uniform vec3 uAmbU;uniform vec3 uGain;uniform vec3 uLift;uniform vec4 uGrade;uniform vec4 uImp;uniform vec3 uImpC;uniform vec4 uSpot;uniform vec4 uKey;uniform vec3 uKeyC;
vec3 grade(vec3 c){c=c*uGain+uLift;float l=dot(c,vec3(.299,.587,.114));c=mix(vec3(l),c,uGrade.x);return (c-.5)*uGrade.y+.5;}
void main(){vec2 tc=vec2(vUv.x,1.-vUv.y);vec2 p=tc*uWH-uOff;vec2 sp=clamp(p/uWH,0.,1.);
  vec3 col=texture2D(uSt,vec2(sp.x,1.-sp.y)).rgb;float span=uWH.y-uGy;float f=clamp((p.y-uGy)/span,0.,1.);float sq=uSq*(.5+.9*f);bool fl=p.y>=uGy;
  vec3 La=vec3(0.);vec3 Lf=vec3(0.);
  for(int i=0;i<NL;i++){vec4 l=uL[i];if(l.w>0.){vec2 d=(p-l.xy)/(l.w*.55);La+=uLC[i].rgb*exp(-dot(d,d)*2.2);
    if(fl){vec2 e=vec2(p.x-l.x,(p.y-l.z)/sq)/l.w;Lf+=uLC[i].rgb*max(0.,1./(1.+dot(e,e)*5.)-.14)*1.16;}}}
  if(fl){float sh=1.;for(int i=0;i<NS;i++){vec4 S=uS[i];if(S.w>0.){vec2 d=(p-S.xy)/vec2(S.z,S.z*sq);float k=1.-smoothstep(.1,1.,length(d));sh*=1.-S.w*k;}}col*=sh;}
  col+=(col*Lf*1.4+La*(fl?.18:.42))*uGain;
  vec2 q=tc-.5;float vg=1.-uGrade.z*dot(q,q)*2.2;
#if UNITS
  vec4 u=texture2D(uUn,tc);float hud=step(abs(u.a-.99608),.0025);
  if(u.a>0.){vec3 lu=uAmbU+La*1.1;
#if RIM
    vec4 n=texture2D(uUn,tc+vec2(uKey.x,-.6)/uWH);lu+=uKeyC*step(n.a,.5)*(1.-hud)*smoothstep(.55,.92,u.a)*uKey.y;
#endif
    col=mix(col,grade(u.rgb*lu)*vg,u.a*(1.-hud));}
#endif
#if BLOOM
  col+=texture2D(uBl,tc).rgb*uGrade.w*uGain;
#endif
  if(uImp.z>0.){vec2 d=(p-uImp.xy)/(uWH.y*.22);col=mix(col,col*.42,uImp.z*.75)+uImpC*uImp.z*exp(-dot(d,d))*1.2;}
  if(uSpot.z>0.){vec2 d=(p-uSpot.xy)/(uWH.y*.42);float k=exp(-dot(d,d));float lm=dot(col,vec3(.299,.587,.114));col=mix(col,mix(vec3(lm),col,.5+.5*k)*(.5+.5*k),uSpot.z);}
  col=col/(1.+max(col-1.,0.)*.6);
#if UNITS
  col=mix(col,u.rgb,hud);
#endif
  gl_FragColor=vec4(clamp(col,0.,1.),1.);}`;}
function hbLite(q,units){const k='lite,'+[q.lights,q.shadows,q.rim,q.bloomK>0,units].join(',');if(!HB.prog[k])HB.prog[k]=hbProgram(HB.gl,hbLiteFS({nl:q.lights,ns:q.shadows,rim:q.rim&&units,bloom:q.bloomK>0&&units,units}));return HB.prog[k];}
// floor circles in the unit layer, under the units (Medium): two rings, turning ticks and a soft fill, added light
function hbUnder(ctx,W,H,now){const still=hbStill(),K=HB.bake;if(!K)return;
  // effect lights as soft pools on the floor and halos in the air (cached glow sprites)
  if(HB.L.length&&typeof g6Glow==='function'){ctx.save();for(const o of HB.L){const e=hbEnv(o,now);if(e<=0)continue;const v=o.int*e,neg=v<0,c=o.col,a=Math.min(1,Math.abs(v)*.55);if(a<.02)continue;
      const spr=g6Glow(neg?'rgba(12,2,24,.9)':`rgba(${Math.round(c[0]*255)},${Math.round(c[1]*255)},${Math.round(c[2]*255)},.85)`),fy=o.foot!=null?o.foot:o.y,f=Math.max(0,Math.min(1,(fy-K.gy)/K.span)),r=o.r*.9,ry=r*HD_FLOOR.sq*(.5+.9*f)*1.6;
      ctx.globalCompositeOperation=neg?'source-over':'lighter';ctx.globalAlpha=a;ctx.drawImage(spr,o.x-r,fy-ry,r*2,ry*2);ctx.globalAlpha=a*.6;ctx.drawImage(spr,o.x-r*.5,o.y-r*.5,r,r);}ctx.restore();}
  const L=K.decals.concat(HB.D);if(!L.length)return;ctx.save();ctx.globalCompositeOperation='lighter';
  for(const o of L){const e=o.t0?hbEnv(o,now):(still?1:.75+.25*Math.sin(now/700));if(e<=0)continue;if(!o.t0&&o.still)continue;// the boss circle is already in the still
    const grow=o.t0&&o.grow?Math.min(1,(now-o.t0)/(o.life*.25)):1,r=o.r*(.35+.65*grow),f=Math.max(0,Math.min(1,(o.y-K.gy)/K.span)),ry=r*HD_FLOOR.sq*(.5+.9*f);
    const c=`rgb(${Math.round(o.col[0]*255)},${Math.round(o.col[1]*255)},${Math.round(o.col[2]*255)})`,a=Math.min(1,o.a*e);ctx.strokeStyle=c;ctx.fillStyle=c;ctx.lineWidth=1;
    ctx.globalAlpha=a*.18;ctx.beginPath();ctx.ellipse(o.x,o.y,r,ry,0,0,7);ctx.fill();ctx.globalAlpha=a*.9;ctx.beginPath();ctx.ellipse(o.x,o.y,r,ry,0,0,7);ctx.stroke();
    ctx.globalAlpha=a*.6;ctx.beginPath();ctx.ellipse(o.x,o.y,r*.78,ry*.78,0,0,7);ctx.stroke();
    const ph=still?0:now/1000*(o.spin||.05)*6.283;ctx.globalAlpha=a;for(let i=0;i<8;i++){const g=ph+i*.785;ctx.fillRect(Math.round(o.x+Math.cos(g)*r*.89),Math.round(o.y+Math.sin(g)*ry*.89),1,1);}}
  ctx.restore();}
// ----- one frame -----
const HB_LS=[];
// 'under' mode: a soft shadow sprite on the 2D canvas, squashed like the GL floor, nudged away from the key light
let HB_SH=null;
function hbShadow2D(ctx,x,gy,b,alpha){const K=HB.bake;if(!K)return;if(!HB_SH){HB_SH=mkCv(64,32);const c=HB_SH.getContext('2d'),im=c.createImageData(64,32),d=im.data,sm=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);};
    // v0.5.8: the gradient used to be centred on the sprite's right edge (a scaled transform), so the shadow was half a blob with a hard
    // vertical edge (a dark box beside every unit). Now a whole soft ellipse with a darker contact core.
    for(let y=0;y<32;y++)for(let x=0;x<64;x++){const dx=(x+.5-32)/32,dy=(y+.5-16)/16,r=Math.sqrt(dx*dx+dy*dy),a=Math.min(1,.46*(1-sm(.1,.5,r))+.36*(1-sm(.3,1,r))),o=(y*64+x)*4;d[o]=8;d[o+1]=4;d[o+2]=20;d[o+3]=Math.round(a*255);}
    c.putImageData(im,0,0);}
  const rx=Math.max(5,Math.min(b.w,40)*.5)*(b.hov?.7:1)*1.08,f=Math.max(0,Math.min(1,(gy-K.gy)/K.span)),ry=Math.max(1.5,rx*HD_FLOOR.sq*(.5+.9*f)),a=(b.hov?.55:.95)*(alpha==null?1:alpha);
  ctx.save();ctx.globalAlpha=a;ctx.imageSmoothingEnabled=true;ctx.drawImage(HB_SH,x-K.look.kx*rx*.28-rx,gy+.5-ry,rx*2,ry*2);ctx.restore();}
function hbEq(a,b){if(!a||a.length!==b.length)return false;for(let i=0;i<a.length;i++)if(a[i]!==b[i])return false;return true;}
function hbCopy(a,b){if(!a||a.length!==b.length)a=new Float32Array(b.length);a.set(b);return a;}
// ----- v0.5.8 'under' mode (Medium): sprites lit and graded in 2D, one cached copy per sprite canvas and lighting state -----
// The state of a unit (hbUnitLight, every 250 ms, no allocation once warm): the stage ambient, the theme lights near it (torches,
// braziers, lava glow, the boss circle) and the strongest effect light (spells, casting circles), with the side they come from, and the
// key light's rim. It is folded into one integer (quantised), so a state change costs one 2D build of that sprite (hbLitBuild:
// a pixel pass over the full HD bitmap, about a millisecond) and every other frame is a Map lookup. The pass: soften the raw colours,
// light (ambient, a little darker toward the feet, the lights brighter on the side facing them), rim light on the silhouette edge
// facing the key light, then the stage's own grade (gain, lift, saturation, contrast), so units sit in the graded still under them.
const HB_LIT=new WeakMap();
function hbQc(v){return Math.max(0,Math.min(7,Math.round((v+.2)/1.6*7)));}
function hbUnitLight(u,K,now){let P=u._hbP;if(P&&P.K===K&&now-P.t<250)return P;if(!P)P=u._hbP={K:null,t:0,key:0,lc:[0,0,0],side:0,rd:1,rs:0,flip:false};
  const b=unitBox(u);P.K=K;P.t=now;P.flip=u.side==='p';if(!b){P.key=0;P.lc[0]=P.lc[1]=P.lc[2]=0;P.side=0;P.rs=0;return P;}
  const cx=b.x,cy=b.y-b.h*.5;let r=0,g=0,bl=0,sx=0;
  const add=(lx,ly,lr,col,k)=>{const dx=lx-cx,dy=ly-cy,d=Math.sqrt(dx*dx+dy*dy),e=k*Math.exp(-(d*d)/(lr*lr*.55));if(Math.abs(e)<.01)return;r+=col[0]*e;g+=col[1]*e;bl+=col[2]*e;sx+=e*(col[0]*.3+col[1]*.59+col[2]*.11)*dx/(d+8);};
  for(const l of K.lights)add(l.x,l.y,l.r,l.col,l.int*.9);
  let best=null,bv=0;for(const o of HB.L){const e=hbEnv(o,now);if(e<=0)continue;const v=Math.abs(o.int*e)*Math.exp(-((o.x-cx)**2+(o.y-cy)**2)/(o.r*o.r*.6));if(v>bv){bv=v;best=o;}}
  if(best)add(best.x,best.y,best.r,best.col,best.int*hbEnv(best,now)*1.2);
  P.lc[0]=r;P.lc[1]=g;P.lc[2]=bl;const kx=K.look.kx||0,ks=K.look.out?(K.look.night?.5:.8):.35;
  const side=sx*2.5,rimx=side+kx*ks*.5;P.side=Math.max(-1,Math.min(1,side));P.rd=rimx>=0?1:-1;P.rs=Math.min(1,Math.abs(rimx)*1.4+(K.look.out?.25:0));
  const sq=Math.round((P.side+1)*2),rq=Math.round(P.rs*3);P.key=hbQc(r)|hbQc(g)<<3|hbQc(bl)<<6|sq<<9|(P.rd>0?1:0)<<12|rq<<13|(P.flip?1:0)<<15;return P;}
function hbLitBuild(c,K,P){const look=K.look,W0=c._rw||c.width,H0=c._rh||c.height,o=c.hd?hdCv(c.width,c.height,c.hd):mkCv(c.width,c.height),x=o.getContext('2d');x.drawImage(c,0,0);
  let im;try{im=x.getImageData(0,0,W0,H0);}catch(e){return o;}const d=im.data,S=HD_SPR,am=look.amb,G=look.gain,Lf=look.lift,gs=look.sat,gc=look.con,lc=P.lc,kc=look.key,k=c.hd||1;
  const fl=P.flip?-1:1,rdx=P.rd*fl*Math.max(1,Math.round(k)),rim=P.rs*S.rim,sm=v=>v<=0?0:v>=1?1:v*v*(3-2*v),A=(xx,yy)=>xx<0||yy<0||xx>=W0||yy>=H0?0:d[(yy*W0+xx)*4+3];
  for(let y=0;y<H0;y++){const hv=1-(y+.5)/H0,ao=S.ao+(1-S.ao)*sm(hv/.42),am2=.94+.12*hv;
    for(let xx=0;xx<W0;xx++){const i=(y*W0+xx)*4;if(!d[i+3])continue;const sd=((xx+.5)/W0*2-1)*fl,ls=1+.6*sd*P.side,edge=A(xx+rdx,y)<128,top=A(xx,y-k)<128;
      let R=d[i]/255,Gc=d[i+1]/255,Bc=d[i+2]/255;const l0=R*.299+Gc*.587+Bc*.114;
      R=((l0+(R-l0)*S.sat)-.5)*S.con+.5;Gc=((l0+(Gc-l0)*S.sat)-.5)*S.con+.5;Bc=((l0+(Bc-l0)*S.sat)-.5)*S.con+.5;
      const ek=edge?rim*(.55+.45*hv):0,tk=top?.07:0;
      R=Math.max(0,R)*(am[0]*am2*ao*(1+.1*sd*(look.kx||0))+lc[0]*ls)+(kc[0]*.45+lc[0]*.6)*ek+am[0]*tk;
      Gc=Math.max(0,Gc)*(am[1]*am2*ao*(1+.1*sd*(look.kx||0))+lc[1]*ls)+(kc[1]*.45+lc[1]*.6)*ek+am[1]*tk;
      Bc=Math.max(0,Bc)*(am[2]*am2*ao*(1+.1*sd*(look.kx||0))+lc[2]*ls)+(kc[2]*.45+lc[2]*.6)*ek+am[2]*tk;
      // the stage grade (hbMainFS: gain, lift, saturation, contrast) and its soft shoulder
      R=R*G[0]+Lf[0];Gc=Gc*G[1]+Lf[1];Bc=Bc*G[2]+Lf[2];const l1=R*.299+Gc*.587+Bc*.114;
      R=((l1+(R-l1)*gs)-.5)*gc+.5;Gc=((l1+(Gc-l1)*gs)-.5)*gc+.5;Bc=((l1+(Bc-l1)*gs)-.5)*gc+.5;
      d[i]=Math.max(0,Math.min(255,R/(1+Math.max(R-1,0)*.6)*255));d[i+1]=Math.max(0,Math.min(255,Gc/(1+Math.max(Gc-1,0)*.6)*255));d[i+2]=Math.max(0,Math.min(255,Bc/(1+Math.max(Bc-1,0)*.6)*255));}}
  x.putImageData(im,0,0);return o;}
// BV.tint on the 'under' stage: the unit being drawn is the one spriteOf was last asked for (drawUnit asks right before it tints)
function hbLit(c){const K=HB.bake,u=HB.cu;if(!K||!u||!c||!c.width)return c;const P=hbUnitLight(u,K,performance.now());
  let m=HB_LIT.get(c);if(!m||m.K!==K){m={K,map:new Map()};HB_LIT.set(c,m);}let o=m.map.get(P.key);if(o)return o;
  if(m.map.size>40)m.map.clear();o=hbLitBuild(c,K,P);m.map.set(P.key,o);HB.litN=(HB.litN||0)+1;return o;}
{const so0=spriteOf;spriteOf=function(u){HB.cu=u;return so0.apply(this,arguments);};}
// v0.5.8: the element badges by the HP bars (battleui.js) are HUD too: on the full GL stage they are drawn from a copy whose solid pixels
// carry alpha 254 (the HUD mark), so the unit lighting leaves them crisp and unlit wherever they are drawn
if(typeof elShapeCv==='function'){const es0=elShapeCv,HB_EH={};elShapeCv=function(el){const c=es0.apply(this,arguments);if(!BV.glFull||!c)return c;let h=HB_EH[el];
  if(!h){h=HB_EH[el]=mkCv(c.width,c.height);const x=h.getContext('2d');x.drawImage(c,0,0);try{const im=x.getImageData(0,0,h.width,h.height),d=im.data;for(let i=3;i<d.length;i+=4)if(d[i]>0)d[i]=254;x.putImageData(im,0,0);}catch(e){}}return h;};}

function hbMainU(u,gl,K,look,q,o){const W=K.W,H=K.H,A=o.A;
  gl.uniform1i(u.uBg,0);gl.uniform1i(u.uFl,1);gl.uniform1i(u.uFl2,2);gl.uniform1i(u.uUn,3);gl.uniform1i(u.uBl,4);
  gl.uniform2f(u.uWH,W,H);gl.uniform1f(u.uGy,K.gy);gl.uniform2f(u.uOff,o.sx,o.sy);gl.uniform1f(u.uPar,o.par);gl.uniform4f(u.uBgR,K.M,K.BW,K.BH,0);
  gl.uniform4f(u.uFP,HD_FLOOR.persp,HD_FLOOR.tile,0,HD_FLOOR.sq);gl.uniform4f(u.uFoc,HD_FLOOR.focus[0],HD_FLOOR.focus[1],q.dof||0,0);gl.uniform2f(u.uRoad,K.rb[0],K.rb[1]);
  gl.uniform4fv(u.uL,A.L);gl.uniform4fv(u.uLC,A.LC);gl.uniform4fv(u.uS,A.S);gl.uniform4fv(u.uD,A.D);gl.uniform4fv(u.uDC,A.DC);
  const am=look.amb;gl.uniform3f(u.uAmbF,am[0]*.98,am[1]*.98,am[2]*.98);gl.uniform3f(u.uAmbB,1,1,1);gl.uniform3f(u.uAmbU,am[0],am[1],am[2]);
  gl.uniform3f(u.uFog,K.fog[0],K.fog[1],K.fog[2]);gl.uniform2f(u.uFogP,Math.min(.95,HD_FLOOR.fog+look.fog),.35+look.fog);
  gl.uniform3f(u.uGain,look.gain[0],look.gain[1],look.gain[2]);gl.uniform3f(u.uLift,look.lift[0],look.lift[1],look.lift[2]);gl.uniform4f(u.uGrade,look.sat,look.con,look.vig,q.bloomK||0);
  gl.uniform4f(u.uImp,o.ix,o.iy,o.imp,0);gl.uniform3f(u.uImpC,o.ic[0],o.ic[1],o.ic[2]);gl.uniform4f(u.uSpot,o.spx,o.spy,o.spot,0);
  gl.uniform4f(u.uKey,look.kx||.7,look.night?.22:.3,look.out&&!look.night&&look.ph!=='indoor'?.05:.035,0);gl.uniform3f(u.uKeyC,look.key[0],look.key[1],look.key[2]);gl.uniform2f(u.uKeyP,look.kp[0]*W,look.kp[1]*H);gl.uniform1f(u.uT,o.t);
  gl.uniform3f(u.uSky,look.sky[0],look.sky[1],look.sky[2]);gl.uniform2f(u.uCloud,look.cloud,0);if(u.uUS)gl.uniform2f(u.uUS,HD_SPR.sat,HD_SPR.con);}
function hbArr(nl,ns,nd){return {L:new Float32Array(nl*4),LC:new Float32Array(nl*4),S:new Float32Array(ns*4),D:new Float32Array(nd*4),DC:new Float32Array(nd*4)};}
function hbPutLights(A,list,n){A.L.fill(0);A.LC.fill(0);for(let i=0;i<Math.min(n,list.length);i++){const l=list[i];A.L[i*4]=l[0];A.L[i*4+1]=l[1];A.L[i*4+2]=l[2];A.L[i*4+3]=l[3];const s=l[5];A.LC[i*4]=l[4][0]*s;A.LC[i*4+1]=l[4][1]*s;A.LC[i*4+2]=l[4][2]*s;}}
function hbPutDecals(A,list,n,now,still){let di=0;for(let i=0;i<list.length&&di<n;i++){const o=list[i],e=o.t0?hbEnv(o,now):(still?1:.75+.25*Math.sin(now/700));if(e<=0)continue;const grow=o.t0&&o.grow?Math.min(1,(now-o.t0)/(o.life*.25)):1;
  A.D[di*4]=o.x;A.D[di*4+1]=o.y;A.D[di*4+2]=o.r*(.35+.65*grow);A.D[di*4+3]=still?0:((now/1000)*(o.spin||.05))%1;A.DC[di*4]=o.col[0];A.DC[di*4+1]=o.col[1];A.DC[di*4+2]=o.col[2];A.DC[di*4+3]=o.a*e;di++;}}
// the still for the lite path: the full shader with the theme lights at rest, the boss circle, no units, no shadows
function hbStillBake(K,q){const gl=HB.gl,w=HB.cv.width,h=HB.cv.height;if(K.S&&K.S.w===w&&K.S.h===h)return;hbFboFree(gl,K.S);K.S=hbFbo(gl,w,h);
  const sq={lights:8,shadows:1,decals:1,rays:q.rays,rim:0,bloomK:0,dof:q.dof},A=hbArr(8,1,1),list=K.lights.map(l=>[l.x,l.y,l.foot,l.r,l.col,l.int]).sort((a,b)=>b[5]-a[5]);hbPutLights(A,list,8);hbPutDecals(A,K.decals,1,0,true);
  const blank=HB.R.blank||(HB.R.blank=hbTex(HB.gl,{w:1,h:1,near:true}));
  hbPass(hbMain(sq),K.S,[K.F.tex,K.fl,K.road||K.fl,blank,blank],(u,gl)=>hbMainU(u,gl,K,K.look,sq,{A,sx:0,sy:0,par:0,ix:0,iy:0,imp:0,ic:[0,0,0],spx:0,spy:0,spot:0,t:0}));}
function hbFrame(now){const gl=HB.gl,q=hbQ(),W=BL.W,H=BL.H,key=HB.force||battleTheme(),still=hbStill(),t0=performance.now();
  if(!hbPlace())return false;
  if(!HB.bake||HB.bake.id!==hbBakeId(key,W,H))hbBake(key,W,H);
  const K=HB.bake,look=K.look,R=HB.R,bc=document.getElementById('bcv'),lite=q.mode==='under';
  if(lite)hbStillBake(K,q);
  // the unit layer (full mode only; in 'under' mode the 2D canvas stays visible on top)
  if(!lite){gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,R.un);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,bc);
  if(q.bloomK>0){const bw=Math.ceil(W/2),bh=Math.ceil(H/2);if(!R.bl||R.bl.w!==bw||R.bl.h!==bh){hbFboFree(gl,R.bl);hbFboFree(gl,R.bl2);R.bl=hbFbo(gl,bw,bh);R.bl2=hbFbo(gl,bw,bh);}
    hbPass(R.bright,R.bl,[R.un],(u,gl)=>{gl.uniform1i(u.uT,0);gl.uniform2f(u.uPx,1/bw,1/bh);gl.uniform1f(u.uThr,.62);});
    hbBlur(R.bl.tex,R.bl2,1.25/bw,0);hbBlur(R.bl2.tex,R.bl,0,1.25/bh);}}
  // lights: theme (flickering; on the lite path only the flicker, the rest is in the still), effects, orbs in flight; strongest first
  HB_LS.length=0;
  K.lights.forEach((l,i)=>{if(lite)return;const fk=still?0:l.fl*(.1*Math.sin(now*.013+i*1.7)+.06*Math.sin(now*.041+i*3.1));HB_LS.push([l.x,l.y,l.foot,l.r,l.col,l.int*(1+fk)]);});
  HB.L=HB.L.filter(o=>{const e=hbEnv(o,now);if(e<0)return false;if(e>0&&!lite)HB_LS.push([o.x,o.y,o.foot!=null?o.foot:o.y,o.r,o.col,o.int*e]);return true;});
  if(!still&&!lite&&BV.P)for(let i=0;i<BV.P.length;i++){const p=BV.P[i];if(p.k!=='orb')continue;const t=now-p.t0;if(t<0)continue;const qq=t/p.life;if(qq>=1)continue;const e=qq*qq*(3-2*qq),x=p.x+(p.x2-p.x)*e,y=p.y+(p.y2-p.y)*e-Math.sin(qq*Math.PI)*10;
    HB_LS.push([x,y,Math.max(K.gy+2,Math.min(H,y+18)),34,hbRGB(p.col),.9]);}
  HB_LS.sort((a,b)=>Math.abs(b[5])-Math.abs(a[5]));
  const nl=q.lights,ns=q.shadows,nd=lite?1:q.decals;let A=HB.arr;
  if(!A.L||A.L.length!==nl*4||A.S.length!==ns*4||A.D.length!==nd*4)A=HB.arr=hbArr(nl,ns,nd);
  hbPutLights(A,HB_LS,nl);A.S.fill(0);A.D.fill(0);A.DC.fill(0);
  // soft shadows where each unit was drawn this frame (battle.js notes the drawn x); in 'under' mode they are drawn in 2D (hbShadow2D)
  let si=lite?ns:0;const units=B.en.concat(B.front);for(let i=0;i<units.length&&si<ns;i++){const u=units[i];if(u._gt!==BV.last)continue;const b=unitBox(u);if(!b)continue;
    const rx=Math.max(5,Math.min(b.w,40)*.5)*(b.hov?.7:1),a=(b.hov?.34:.58)*(u._ga==null?1:u._ga);
    A.S[si*4]=Math.round(u._gx-look.kx*rx*.28);A.S[si*4+1]=(b.gy!=null?b.gy:b.y)+.5;A.S[si*4+2]=rx*1.08;A.S[si*4+3]=Math.round(a*20)/20;si++;}
  HB.D=HB.D.filter(o=>hbEnv(o,now)>=0);
  if(!lite)hbPutDecals(A,K.decals.concat(HB.D),nd,now,still);// floor circles: the boss rune circle, then effect circles
  // impact frame and Limit spotlight (gfx6battle.js state)
  let imp=0;if(!lite&&GFX.q.impact&&!still&&typeof G6I!=='undefined'&&G6I.t){const d=now-G6I.t;if(d>=0&&d<110)imp=1-d/110;}
  let spot=0,spx=0,spy=0;if(!still&&HB.spot){const d=now-HB.spot.t0;if(d>=0&&d<HB.spot.life){spot=Math.sin(Math.min(1,d/HB.spot.life)*Math.PI)*.8;spx=HB.spot.x;spy=HB.spot.y;}}
  const ic=imp?hbRGB(G6I.col&&G6I.col[0]==='#'?G6I.col:'#ffffff'):[0,0,0],bl=(R.bl&&q.bloomK>0)?R.bl.tex:R.un;
  if(lite){// redraw only when something on the stage changed (shadows, lights, shake, spotlight, size or backdrop)
    // the shake moves the canvas (CSS translate, composed with the camera transform) instead of redrawing it
    const tr=(BV.sx||BV.sy)?`${(BV.sx||0)*BL.sc}px ${(BV.sy||0)*BL.sc}px`:'';if(HB.cv.style.translate!==tr)HB.cv.style.translate=tr;
    const sig=HB.sig||(HB.sig={});const same=sig.K===K&&sig.S===K.S&&sig.spot===spot&&hbEq(sig.L,A.L)&&hbEq(sig.LC,A.LC)&&hbEq(sig.Sh,A.S);
    if(same&&!HB.redraw){HB.skips++;HB.ms=HB.ms*.9+(performance.now()-t0)*.1;return true;}
    HB.redraw=false;sig.K=K;sig.S=K.S;sig.spot=spot;sig.L=hbCopy(sig.L,A.L);sig.LC=hbCopy(sig.LC,A.LC);sig.Sh=hbCopy(sig.Sh,A.S);
    hbPass(hbLite(q,0),null,[K.S.tex,R.un,bl],(u,gl)=>{gl.uniform1i(u.uSt,0);gl.uniform1i(u.uUn,1);gl.uniform1i(u.uBl,2);
      gl.uniform2f(u.uWH,W,H);gl.uniform1f(u.uGy,K.gy);gl.uniform2f(u.uOff,0,0);gl.uniform1f(u.uSq,HD_FLOOR.sq);
      gl.uniform4fv(u.uL,A.L);gl.uniform4fv(u.uLC,A.LC);gl.uniform4fv(u.uS,A.S);const am=look.amb;gl.uniform3f(u.uAmbU,am[0],am[1],am[2]);
      gl.uniform3f(u.uGain,look.gain[0],look.gain[1],look.gain[2]);gl.uniform3f(u.uLift,look.lift[0],look.lift[1],look.lift[2]);gl.uniform4f(u.uGrade,look.sat,look.con,look.vig,q.bloomK||0);
      gl.uniform4f(u.uImp,G6I.x||0,G6I.y||0,imp,0);gl.uniform3f(u.uImpC,ic[0],ic[1],ic[2]);gl.uniform4f(u.uSpot,spx,spy,spot,0);
      gl.uniform4f(u.uKey,look.kx||.7,look.night?.22:.3,0,0);gl.uniform3f(u.uKeyC,look.key[0],look.key[1],look.key[2]);});}
  else{if(HB.cv.style.translate)HB.cv.style.translate='';const par=(GFX.q.parallax&&typeof PARA!=='undefined')?Math.max(-1,Math.min(1,PARA.off||0))*(GFX_PARA.px||4):0;
    hbPass(hbMain(q),null,[K.F.tex,K.fl,K.road||K.fl,R.un,bl],(u,gl)=>hbMainU(u,gl,K,look,q,{A,sx:BV.sx||0,sy:BV.sy||0,par,ix:G6I.x||0,iy:G6I.y||0,imp,ic,spx,spy,spot,t:still?0:now/1000}));}
  HB.frames++;HB.ms=HB.ms*.9+(performance.now()-t0)*.1;return true;}
// ----- the frame wrapper: GL when wanted and working, otherwise the old 2D stage exactly -----
{const bf0=battleFrame;battleFrame=function(now){
  const want=hbWanted()&&(HB.R||hbSetup());
  if(!want){if(HB.on){HB.on=false;hbShow(false);}BV.glStage=false;return bf0.apply(this,arguments);}
  if(!HB.on){HB.on=true;hbShow(true);}
  const under=hbQ().mode==='under';BV.glStage=true;BV.glFull=!under;BV.glUnder=under?hbUnder:null;BV.tint=under?hbLit:null;BV.glShadow=under?hbShadow2D:null;let r;try{r=bf0.apply(this,arguments);}finally{BV.glStage=false;BV.glFull=false;BV.glUnder=null;BV.tint=null;BV.glShadow=null;}
  try{if(!hbFrame(now)){HB.on=false;hbShow(false);}}catch(e){HB.dead=true;HB.err=String(e&&e.message||e);HB.why='gl error';HB.on=false;hbShow(false);try{console.warn('HD stage off:',HB.err);}catch(x){}
    // redraw this frame in 2D so nothing is missing
    try{bf0.apply(this,arguments);}catch(x){}}
  return r;};}
// a new battle screen: the canvas is re-attached on the first frame; effect lights and circles from the last fight are dropped
{const lb0=layoutBattle;layoutBattle=function(){const r=lb0.apply(this,arguments);try{if(HB.cv&&HB.on)hbPlace();}catch(e){}return r;};}
{const sb0=startBattle;startBattle=function(){HB.L.length=0;HB.D.length=0;HB.spot=null;if(HB.lost&&HB.gl&&!HB.gl.isContextLost())HB.lost=false;return sb0.apply(this,arguments);};}
