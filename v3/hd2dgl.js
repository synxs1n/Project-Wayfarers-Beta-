// ===== hd2dgl.js (v0.5.3): HD-2D world renderer, the WebGL layer =====
// WebGL1 only (widest phone support). Shader programs, render targets, textures, a packed sprite atlas and a quad batch for hd2d.js.
// Nothing here knows about the game. One vertex layout everywhere (28 bytes): position xyz (float), uv (float, u<0 = plain white),
// colour rgba (bytes, multiplies the texel), normal xyz + flags (bytes). Flags: 1 receives the baked sun shadow, 2 may glow at night
// (bright warm or cyan texels: windows, lamps, crystals), 4 unlit (drawn at full colour: lava, markers, blob shadows), 8 x-ray fade
// (cards and buildings thin out over the hero when they stand in front of him), 16 a character (kept readable in the dark).
// Point lights are not looped per pixel: they are drawn as soft discs into a small light map each frame, whose alpha carries the baked
// sun shadow for the same patch of ground (one texture read per pixel gives both). v0.5.8: the map holds half the light (read back x2),
// so the hero's lantern and a torch next to it no longer clip at 1 and both still count.
const H2V_STRIDE=28,H2_QMAX=16383;
const H2SRC={
scene_v:`attribute vec3 aP;attribute vec2 aT;attribute vec4 aC;attribute vec4 aN;
uniform mat4 uVP;uniform vec3 uO;uniform vec4 uLR;uniform vec3 uCam;uniform vec3 uFog;
varying vec2 vT;varying vec4 vC;varying vec3 vN;varying vec3 vW;varying float vF;varying vec4 vX;varying vec2 vL;varying float vFo;
uniform float uSpZ;
void main(){vT=aT;vC=aC;vN=aN.xyz*2.0-1.0;vF=floor(aN.w*255.0+0.5);vW=aP-uO;
  // v0.5.8: characters (flag 16) read the light map at their feet, spread sideways (colour r = 0 left edge, 1 right edge), so a lamp on
  // one side lights that side; everything else reads it at its own position, nudged along its normal
  if(vF>15.5)vL=(vec2(aP.x+(aC.r*2.0-1.0)*uSpZ,aP.z+3.0)-uLR.xy)*uLR.zw;else vL=(aP.xz+vN.xz*6.0-uLR.xy)*uLR.zw;
  float fd=length(vW-uCam);vFo=clamp((fd-uFog.x)/(uFog.y-uFog.x),0.0,1.0)*uFog.z;gl_Position=uVP*vec4(aP,1.0);vX=gl_Position;}`,
scene_f:`precision mediump float;
uniform sampler2D uTex;uniform sampler2D uLM;
uniform vec3 uAmb;uniform vec3 uSunC;uniform vec3 uSunD;
uniform vec3 uFogC;uniform float uEmis;uniform int uMode;uniform vec4 uSil;uniform vec4 uXr;uniform float uXd;
uniform mat3 uGM;uniform vec3 uGB;
varying vec2 vT;varying vec4 vC;varying vec3 vN;varying vec3 vW;varying float vF;varying vec4 vX;varying vec2 vL;varying float vFo;
void main(){
  vec4 t=vT.x<0.0?vec4(1.0):texture2D(uTex,vT);vec4 c=t*vC;
  if(uMode==2){if(c.a<0.01)discard;}else if(c.a<0.5)discard;
  if(uMode==1){gl_FragColor=uSil;return;}
  float f=floor(vF+0.5),fSh=mod(f,2.0),fEm=mod(floor(f*0.5),2.0),fUn=mod(floor(f*0.25),2.0),fXr=mod(floor(f*0.125),2.0);
  if(fXr>0.5&&uXr.w>0.0&&vW.z>uXd){vec2 sp=vX.xy/vX.w;vec2 d=(sp-uXr.xy)*vec2(uXr.z,1.0);float r=dot(d,d);
    if(r<uXr.w){float k=r/uXr.w;if(fract((gl_FragCoord.x+gl_FragCoord.y*2.0)*0.25+0.125)>k*1.6-0.3)discard;}}
  vec3 col=c.rgb;
  if(fUn<0.5){vec4 lm=texture2D(uLM,vL);lm.rgb*=2.0;float sh=fSh>0.5?lm.a:1.0;
    vec3 L=uAmb*(0.82+0.18*sh)+uSunC*(max(dot(vN,uSunD),0.0)*sh)+lm.rgb;
    col=c.rgb*L;
    if(fEm>0.5&&uEmis>0.0){float k=step(0.78,min(t.r,t.g))*step(t.b,0.8)+step(0.82,t.g)*step(0.88,t.b)*step(t.r,0.62);col=mix(col,t.rgb*1.15,clamp(k,0.0,1.0)*uEmis);}}
  col=mix(col,uFogC,vFo);
  // colour grade (exposure, contrast, saturation, lift and gain by time of day and weather), folded into one affine map
  col=uGM*col+uGB;
  gl_FragColor=vec4(clamp(col,0.0,1.0),uMode==2?c.a:1.0);}`,
// v0.5.8: characters have their own program (a branch in the scene shader cost every fragment of the scene on software GL).
// The vertex colour carries the quad's side (r) and height (b) instead of a tint (only its alpha multiplies); the normal bytes carry the
// rim side (x), rim strength (y) and the flip (z). Lit by the scene like the ground they stand on (ambient, sun or moon in the baked sun
// shadow at their feet, every lamp, torch and spell in the light map, stronger on the side facing it), a little darker toward the feet,
// softened before the grade (raw sprite colours are more saturated and contrasty than the graded diorama), a rim light on the silhouette
// edge facing the key light, and a soft floor so they still read in the dark (in the ambient's hue, not grey). Mode 1 is the hero's
// silhouette through whatever stands in front of him, cut at the ground (it drew a pale line under his feet).
char_f:`precision mediump float;
uniform sampler2D uTex;uniform sampler2D uLM;
uniform vec3 uAmb;uniform vec3 uSunC;uniform vec3 uSunD;uniform vec3 uFogC;uniform int uMode;uniform vec4 uSil;uniform float uAct;
uniform mat3 uGM;uniform vec3 uGB;uniform vec4 uSpr;uniform vec3 uRimC;uniform vec3 uAmbN;uniform float uAtl;uniform vec3 uPL;uniform vec3 uPLC;
varying vec2 vT;varying vec4 vC;varying vec3 vN;varying vec3 vW;varying float vF;varying vec4 vX;varying vec2 vL;varying float vFo;
void main(){
  vec4 t=texture2D(uTex,vT);vec4 c=vec4(t.rgb,t.a*vC.a);
  if(uMode==2){if(c.a<0.01)discard;}else if(c.a<0.5)discard;
  if(uMode==1){if(vW.y<0.75)discard;gl_FragColor=uSil;return;}
  vec3 col=c.rgb;
  float side=vC.r*2.0-1.0,hv=vC.b,l0=dot(col,vec3(.299,.587,.114));col=mix(vec3(l0),col,uSpr.x);col=(col-0.5)*uSpr.y+0.5;
  vec4 lm=texture2D(uLM,vL);lm.rgb*=2.0;float sh=lm.a;
  // most of the hero's own lantern is left out on characters (it sits at his feet, so it washed him out at night)
  {vec2 q=(uPL.xy-vW.xz-vec2(0.0,3.0))/uPL.z;float a=max(1.0-length(q),0.0);lm.rgb=max(lm.rgb-uPLC*(a*a)*0.8,0.0);}
  vec3 L=uAmb*(0.8+0.2*sh)*(0.94+0.12*hv)+uSunC*(max(dot(vec3(0.0,0.45,0.89),uSunD),0.0)*sh*(1.0-0.4*side*uSunD.x))+lm.rgb*1.1;
  L*=mix(0.74,1.0,smoothstep(0.0,0.42,hv));
  float ll=dot(L,vec3(.299,.587,.114));L+=uAmbN*max(uAct-ll,0.0)*0.92;
  col=max(col,0.0)*L;
  vec2 ro=vec2(vN.x*vN.z*uAtl,0.0);float rs=vN.y*0.5+0.5;
  float edge=1.0-step(0.5,texture2D(uTex,vT+ro).a),top=1.0-step(0.5,texture2D(uTex,vT-vec2(0.0,uAtl)).a);
  col+=(uRimC+lm.rgb*0.8)*(edge*rs*uSpr.w*(0.55+0.45*hv))+uAmb*(top*0.07);
  col=mix(col,uFogC,vFo);col=uGM*col+uGB;
  gl_FragColor=vec4(clamp(col,0.0,1.0),uMode==2?c.a:1.0);}`,
// the light map: every point light as a soft disc, added up in a small texture laid over the ground around the camera
lm_v:`attribute vec2 aP;attribute vec2 aQ;attribute vec3 aC;varying vec2 q;varying vec3 c;void main(){q=aQ;c=aC;gl_Position=vec4(aP,0.0,1.0);}`,
lm_f:`precision mediump float;varying vec2 q;varying vec3 c;void main(){float a=max(1.0-length(q),0.0);gl_FragColor=vec4(c*(a*a),1.0);}`,
lms_v:`attribute vec2 aP;uniform vec4 uM;varying vec2 t;void main(){vec2 n=aP*0.5+0.5;t=uM.xy+n*uM.zw;gl_Position=vec4(aP,0.0,1.0);}`,
lms_f:`precision mediump float;uniform sampler2D uT;uniform vec4 uW;varying vec2 t;void main(){vec3 s=texture2D(uT,t).rgb;float k=(t.x<0.0||t.y<0.0||t.x>1.0||t.y>1.0)?0.0:clamp(dot(s,uW.rgb),0.0,1.0)*uW.a;gl_FragColor=vec4(0.0,0.0,0.0,1.0-k);}`,
quad_v:`attribute vec2 aP;varying vec2 v;void main(){v=aP*0.5+0.5;gl_Position=vec4(aP,0.0,1.0);}`,
down_f:`precision mediump float;uniform sampler2D uT;uniform vec2 uPx;varying vec2 v;
void main(){gl_FragColor=(texture2D(uT,v+uPx*vec2(-1.0,-1.0))+texture2D(uT,v+uPx*vec2(1.0,-1.0))+texture2D(uT,v+uPx*vec2(-1.0,1.0))+texture2D(uT,v+uPx*vec2(1.0,1.0)))*0.25;}`,
blur_f:`precision mediump float;uniform sampler2D uT;uniform vec2 uD;uniform float uThr;varying vec2 v;
vec3 g(vec2 p){vec3 c=texture2D(uT,p).rgb;return uThr>0.0?max(c-uThr,0.0)/(1.0-uThr):c;}
void main(){vec3 c=g(v)*0.227027+(g(v+uD*1.3846154)+g(v-uD*1.3846154))*0.3162162+(g(v+uD*3.2307692)+g(v-uD*3.2307692))*0.0702703;gl_FragColor=vec4(c,1.0);}`,
comp_f:`precision mediump float;uniform sampler2D uB;uniform sampler2D uG;uniform sampler2D uC;uniform vec4 uHt;
uniform vec4 uDof;uniform vec4 uBl;uniform vec4 uSh;uniform vec3 uShC;uniform vec2 uAsp;uniform float uVig;varying vec2 v;
void main(){vec3 b=texture2D(uB,v).rgb;float dy=v.y-uDof.x;float k=clamp((abs(dy)-uDof.y)/uDof.z,0.0,1.0);k=k*k*(3.0-2.0*k)*uDof.w*(dy<0.0?0.35:1.0);
  vec3 g=uBl.z>0.5?texture2D(uG,v).rgb:max(b-uBl.x,0.0)/(1.0-uBl.x);vec3 add=g*uBl.y;
  if(uSh.x>0.0){float a=dot(v*uAsp,vec2(0.80,0.60));float w=sin(a*7.0+uSh.y*0.17)*0.5+0.5;w=w*w;w*=w;add+=uShC*(w*uSh.x*smoothstep(0.15,1.0,v.y));}
  vec2 q=(v-0.5)*vec2(uAsp.x,1.0)*1.15;float vg=1.0-uVig*smoothstep(0.18,0.62,dot(q,q));
  // v0.7.7 heat shimmer: the sharp frame, shifted sideways by a slow wave, above the hero's head (toward the far ground), uHt = (strength, s, from v.y, 1/width)
  float hm=0.0;vec3 hc=vec3(0.0);if(uHt.x>0.0){hm=clamp(uHt.x,0.0,1.0)*smoothstep(uHt.z,uHt.z+0.22,v.y);vec2 o=vec2(sin(v.y*140.0+uHt.y*4.3)+0.5*sin(v.y*53.0-uHt.y*2.1),0.0)*uHt.w*(0.4+0.9*hm);hc=texture2D(uC,v+o).rgb;}
  gl_FragColor=vec4((b*k)*vg+add+hc*(hm*(1.0-k)*vg),1.0-(1.0-k)*vg*(1.0-hm));}`
};
function h2Shader(gl,type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);
  if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)&&!gl.isContextLost()){const e=gl.getShaderInfoLog(s);gl.deleteShader(s);throw new Error('hd2d shader: '+e);}return s;}
function h2Program(gl,vs,fs,attrs){const p=gl.createProgram();gl.attachShader(p,h2Shader(gl,gl.VERTEX_SHADER,vs));gl.attachShader(p,h2Shader(gl,gl.FRAGMENT_SHADER,fs));
  (attrs||[]).forEach((a,i)=>gl.bindAttribLocation(p,i,a));gl.linkProgram(p);
  if(!gl.getProgramParameter(p,gl.LINK_STATUS)&&!gl.isContextLost())throw new Error('hd2d link: '+gl.getProgramInfoLog(p));
  const u={},n=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS)||0;for(let i=0;i<n;i++){const a=gl.getActiveUniform(p,i);if(!a)continue;const k=a.name.replace(/\[0\]$/,'');u[k]=gl.getUniformLocation(p,a.name);}
  return {p,u};}
function h2Tex(gl,filter){const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,filter);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,filter);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return t;}
function h2TexFrom(gl,src,filter){const t=h2Tex(gl,filter||gl.NEAREST);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,src);return t;}
// a colour render target (texture) with an optional depth+stencil renderbuffer (24 bit depth on WebGL1)
function h2RT(gl,w,h,depth,filter){const t=h2Tex(gl,filter||gl.LINEAR);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
  const f=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,f);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,t,0);let rb=null;
  if(depth){rb=gl.createRenderbuffer();gl.bindRenderbuffer(gl.RENDERBUFFER,rb);gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_STENCIL,w,h);gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_STENCIL_ATTACHMENT,gl.RENDERBUFFER,rb);}
  const ok=gl.checkFramebufferStatus(gl.FRAMEBUFFER)===gl.FRAMEBUFFER_COMPLETE;gl.bindFramebuffer(gl.FRAMEBUFFER,null);
  if(!ok&&depth){gl.deleteFramebuffer(f);gl.deleteRenderbuffer(rb);gl.deleteTexture(t);// some drivers refuse DEPTH_STENCIL: plain 16 bit depth
    const t2=h2Tex(gl,filter||gl.LINEAR);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,null);const f2=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,f2);
    gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,t2,0);const r2=gl.createRenderbuffer();gl.bindRenderbuffer(gl.RENDERBUFFER,r2);gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,w,h);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,r2);gl.bindFramebuffer(gl.FRAMEBUFFER,null);return {t:t2,f:f2,rb:r2,w,h};}
  return {t,f,rb,w,h};}
function h2RTFree(gl,r){if(!r)return;gl.deleteTexture(r.t);if(r.f)gl.deleteFramebuffer(r.f);if(r.rb)gl.deleteRenderbuffer(r.rb);}
// ----- quad batch: a growable interleaved vertex array; quads are 4 vertices (top left, top right, bottom right, bottom left) -----
function H2Batch(maxQ){this.max=maxQ||1024;this.buf=new ArrayBuffer(this.max*4*H2V_STRIDE);this.f=new Float32Array(this.buf);this.b=new Uint8Array(this.buf);this.n=0;}
H2Batch.prototype.grow=function(){const nb=new ArrayBuffer(this.buf.byteLength*2),b=new Uint8Array(nb);b.set(this.b);this.buf=nb;this.b=b;this.f=new Float32Array(nb);this.max*=2;};
// one vertex: i = vertex index
H2Batch.prototype.v=function(i,x,y,z,u,w,r,g,b,a,nx,ny,nz,fl){const o=i*7,f=this.f,B=this.b,c=o*4+20;f[o]=x;f[o+1]=y;f[o+2]=z;f[o+3]=u;f[o+4]=w;
  B[c]=r;B[c+1]=g;B[c+2]=b;B[c+3]=a;B[c+4]=nx;B[c+5]=ny;B[c+6]=nz;B[c+7]=fl;};
// a quad from 4 corners (12 numbers), a uv box, a colour (0..255) and a normal (-1..1, packed) with flags
H2Batch.prototype.quad=function(P,u0,v0,u1,v1,r,g,b,a,nx,ny,nz,fl){if(this.n>=this.max)this.grow();const i=this.n*4,X=Math.round((nx*.5+.5)*255),Y=Math.round((ny*.5+.5)*255),Z=Math.round((nz*.5+.5)*255);
  this.v(i,P[0],P[1],P[2],u0,v0,r,g,b,a,X,Y,Z,fl);this.v(i+1,P[3],P[4],P[5],u1,v0,r,g,b,a,X,Y,Z,fl);this.v(i+2,P[6],P[7],P[8],u1,v1,r,g,b,a,X,Y,Z,fl);this.v(i+3,P[9],P[10],P[11],u0,v1,r,g,b,a,X,Y,Z,fl);this.n++;};
// static mesh: the batch split into GPU buffers of at most H2_QMAX quads (16 bit indices)
function h2Mesh(gl,bt){const out=[];for(let q=0;q<bt.n;q+=H2_QMAX){const n=Math.min(H2_QMAX,bt.n-q),vb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vb);
  gl.bufferData(gl.ARRAY_BUFFER,new Uint8Array(bt.buf,q*4*H2V_STRIDE,n*4*H2V_STRIDE),gl.STATIC_DRAW);out.push({vb,n});}return out;}
function h2MeshFree(gl,ms){(ms||[]).forEach(o=>gl.deleteBuffer(o.vb));}
function h2QuadIndex(gl){const a=new Uint16Array(H2_QMAX*6);for(let q=0;q<H2_QMAX;q++){const i=q*4,o=q*6;a[o]=i;a[o+1]=i+1;a[o+2]=i+2;a[o+3]=i;a[o+4]=i+2;a[o+5]=i+3;}
  const ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,a,gl.STATIC_DRAW);return ib;}
function h2Attribs(gl){gl.vertexAttribPointer(0,3,gl.FLOAT,false,H2V_STRIDE,0);gl.vertexAttribPointer(1,2,gl.FLOAT,false,H2V_STRIDE,12);
  gl.vertexAttribPointer(2,4,gl.UNSIGNED_BYTE,true,H2V_STRIDE,20);gl.vertexAttribPointer(3,4,gl.UNSIGNED_BYTE,true,H2V_STRIDE,24);}
// ----- static geometry in square chunks (CS world px): one buffer per chunk row, chunks of a row contiguous, so the chunks in view are
// one draw call per row (frustum culling for the price of a few calls) -----
function H2Chunks(W,H,CS){this.cs=CS;this.nc=Math.max(1,Math.ceil(W/CS));this.nr=Math.max(1,Math.ceil(H/CS));this.b=new Array(this.nc*this.nr);this.n=0;}
H2Chunks.prototype.at=function(x,z){const c=Math.max(0,Math.min(this.nc-1,Math.floor(x/this.cs))),r=Math.max(0,Math.min(this.nr-1,Math.floor(z/this.cs))),i=r*this.nc+c;this.n++;return this.b[i]||(this.b[i]=new H2Batch(32));};
H2Chunks.prototype.build=function(gl){const rows=[],segs=[];let cur=null;
  const flush=()=>{if(cur&&cur.n){segs.push({ms:h2Mesh(gl,cur)});}cur=null;};
  for(let r=0;r<this.nr;r++){let tot=0;for(let c=0;c<this.nc;c++){const b=this.b[r*this.nc+c];if(b)tot+=b.n;}if(!tot){rows.push(null);continue;}
    if(!cur||cur.n+tot>H2_QMAX){flush();cur=new H2Batch(Math.min(H2_QMAX,Math.max(tot,256)));}
    const st=new Int32Array(this.nc),ct=new Int32Array(this.nc);
    for(let c=0;c<this.nc;c++){const b=this.b[r*this.nc+c];st[c]=cur.n;if(!b||!b.n)continue;while(cur.max<cur.n+b.n)cur.grow();new Uint8Array(cur.buf).set(new Uint8Array(b.buf,0,b.n*4*H2V_STRIDE),cur.n*4*H2V_STRIDE);cur.n+=b.n;ct[c]=b.n;}
    rows.push({seg:segs.length,st,ct});}
  flush();this.b=null;return {rows,segs,cs:this.cs,nc:this.nc,nr:this.nr};};
// rescale the uv of every textured vertex (u >= 0) of the chunks not yet built: u' = u*a+b, v' = v*c+d (to merge atlases)
H2Chunks.prototype.mapUV=function(a,b,c,d){for(const bt of this.b){if(!bt)continue;const f=bt.f;for(let i=0;i<bt.n*4;i++){const o=i*7;if(f[o+3]<0)continue;f[o+3]=f[o+3]*a+b;f[o+4]=f[o+4]*c+d;}}};
function h2ChunksFree(gl,C){if(!C)return;C.segs.forEach(g=>h2MeshFree(gl,g.ms));}
// ----- shelf packed atlas for sprite canvases (dynamic: characters, animated props). Keyed by the canvas object or a string. -----
function H2Atlas(gl,size){this.gl=gl;this.s=size;this.t=h2Tex(gl,gl.NEAREST);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,size,size,0,gl.RGBA,gl.UNSIGNED_BYTE,null);this.reset();}
H2Atlas.prototype.reset=function(){this.m=new Map();this.x=1;this.y=1;this.sh=0;this.full=0;};
H2Atlas.prototype.get=function(key,cv){let r=this.m.get(key);if(r)return r;if(!cv||!cv.width||!cv.height)return null;
  // v0.5.6: HD sprite canvases (sprhd.js) hold a k-times bitmap (_rw x _rh) but report their logical size as width/height.
  // The upload sends the whole bitmap, so the slot and the UVs use the real size; w/h stay logical for the quad on screen.
  const w=cv.width,h=cv.height,pw=cv.hd&&cv._rw?cv._rw:w,ph=cv.hd&&cv._rh?cv._rh:h,S=this.s;if(pw+2>S||ph+2>S)return null;
  if(this.x+pw+1>S){this.x=1;this.y+=this.sh+2;this.sh=0;}
  if(this.y+ph+1>S){this.full++;this.reset();const g=this.gl;g.bindTexture(g.TEXTURE_2D,this.t);g.texImage2D(g.TEXTURE_2D,0,g.RGBA,S,S,0,g.RGBA,g.UNSIGNED_BYTE,null);return this.get(key,cv);}// v0.5.8: cleared, so the gaps a rim light reads stay transparent// full: start over (rare; a frame or two may re-upload)
  const gl=this.gl;gl.bindTexture(gl.TEXTURE_2D,this.t);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);gl.texSubImage2D(gl.TEXTURE_2D,0,this.x,this.y,gl.RGBA,gl.UNSIGNED_BYTE,cv);
  r={u0:this.x/S,v0:this.y/S,u1:(this.x+pw)/S,v1:(this.y+ph)/S,w,h};this.m.set(key,r);this.x+=pw+2;this.sh=Math.max(this.sh,ph);return r;};
// ----- a static shelf packer over a 2D canvas (per map atlases: object cards, building pieces) -----
function H2Pack(w){this.w=w;this.x=0;this.y=0;this.sh=0;this.items=[];}
H2Pack.prototype.add=function(w,h){if(this.x+w>this.w){this.x=0;this.y+=this.sh+2;this.sh=0;}const r={x:this.x,y:this.y,w,h};this.x+=w+2;this.sh=Math.max(this.sh,h);this.items.push(r);return r;};
H2Pack.prototype.height=function(){return this.y+this.sh+2;};
// ----- matrices (column major, as WebGL wants) -----
function h2Persp(o,fovy,asp,n,f){const t=1/Math.tan(fovy/2);o.fill(0);o[0]=t/asp;o[5]=t;o[10]=(f+n)/(n-f);o[11]=-1;o[14]=2*f*n/(n-f);return o;}
function h2Look(o,ex,ey,ez,cx,cy,cz){let zx=ex-cx,zy=ey-cy,zz=ez-cz;let l=Math.hypot(zx,zy,zz);zx/=l;zy/=l;zz/=l;
  let xx=zz,xy=0,xz=-zx;l=Math.hypot(xx,xz)||1;xx/=l;xz/=l;// x = up(0,1,0) cross z
  const yx=zy*xz-zz*xy,yy=zz*xx-zx*xz,yz=zx*xy-zy*xx;
  o[0]=xx;o[1]=yx;o[2]=zx;o[3]=0;o[4]=xy;o[5]=yy;o[6]=zy;o[7]=0;o[8]=xz;o[9]=yz;o[10]=zz;o[11]=0;
  o[12]=-(xx*ex+xy*ey+xz*ez);o[13]=-(yx*ex+yy*ey+yz*ez);o[14]=-(zx*ex+zy*ey+zz*ez);o[15]=1;return o;}
function h2Mul(o,a,b){for(let c=0;c<4;c++)for(let r=0;r<4;r++){o[c*4+r]=a[r]*b[c*4]+a[4+r]*b[c*4+1]+a[8+r]*b[c*4+2]+a[12+r]*b[c*4+3];}return o;}
// project a world point with a view-projection matrix: writes clip x,y (-1..1), depth and w into o
function h2Proj(o,M,x,y,z){const X=M[0]*x+M[4]*y+M[8]*z+M[12],Y=M[1]*x+M[5]*y+M[9]*z+M[13],Z=M[2]*x+M[6]*y+M[10]*z+M[14],W=M[3]*x+M[7]*y+M[11]*z+M[15];
  o[0]=X/W;o[1]=Y/W;o[2]=Z/W;o[3]=W;return o;}
