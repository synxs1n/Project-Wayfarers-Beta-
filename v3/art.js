// ===== art.js (base): pixel engine (PG grids, palettes, paint), hero and monster sprites, flair, front and back views =====
// =================== PIXEL ENGINE ===================
const OUTC='#150b17';
function hx(h){return [parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];}
function rh(a){return '#'+a.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');}
function shade(h,f){return rh(hx(h).map(v=>v*f));}
function tint(h,f){return rh(hx(h).map(v=>v+(255-v)*f));}
function mix(a,b,t){const A=hx(a),B=hx(b);return rh(A.map((v,i)=>v+(B[i]-v)*t));}
function mkCv(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function mulberry(a){return seeded(a);}// the art and map name for seeded() (engine.js): one mulberry32 generator
function hashS(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}

class PG{
  constructor(w,h,ox,oy){this.w=w;this.h=h;this.ox=ox||0;this.oy=oy||0;this.a=new Array(w*h).fill(0);}
  s(x,y,k){x=Math.floor(x)+this.ox;y=Math.floor(y)+this.oy;if(x>=0&&y>=0&&x<this.w&&y<this.h)this.a[y*this.w+x]=k||0;return this;}
  g(x,y){return(x<0||y<0||x>=this.w||y>=this.h)?0:this.a[y*this.w+x];}
  rows(x0,y0,R){R.forEach((r,j)=>{for(let i=0;i<r.length;i++){const c=r[i];if(c==='.'||c===' ')continue;this.s(x0+i,y0+j,c==='_'?0:c);}});return this;}
  rect(x,y,w,h,k){for(let j=0;j<h;j++)for(let i=0;i<w;i++)this.s(x+i,y+j,k);return this;}
  ell(cx,cy,rx,ry,k){for(let y=Math.floor(cy-ry-1);y<=Math.ceil(cy+ry+1);y++)for(let x=Math.floor(cx-rx-1);x<=Math.ceil(cx+rx+1);x++){const dx=(x+.5-cx)/rx,dy=(y+.5-cy)/ry;if(dx*dx+dy*dy<=1)this.s(x,y,k);}return this;}
  poly(P,k){let y0=1e9,y1=-1e9;P.forEach(p=>{y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1]);});
    for(let y=Math.floor(y0);y<=Math.ceil(y1);y++){const yc=y+.5,xs=[];
      for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length];if((a[1]<=yc&&b[1]>yc)||(b[1]<=yc&&a[1]>yc))xs.push(a[0]+(yc-a[1])/(b[1]-a[1])*(b[0]-a[0]));}
      xs.sort((p,q)=>p-q);for(let i=0;i+1<xs.length;i+=2)for(let x=Math.round(xs[i]);x<Math.round(xs[i+1]);x++)this.s(x,y,k);}
    return this;}
  line(x0,y0,x1,y1,k,t){t=t||1;const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0),1)*2;
    for(let i=0;i<=n;i++){const x=x0+(x1-x0)*i/n,y=y0+(y1-y0)*i/n;if(t<=1)this.s(Math.round(x),Math.round(y),k);else this.ell(Math.round(x)+.5,Math.round(y)+.5,t/2+.15,t/2+.15,k);}return this;}
  path(P,k,t){for(let i=0;i+1<P.length;i++)this.line(P[i][0],P[i][1],P[i+1][0],P[i+1][1],k,t);return this;}
  px(L,k){L.forEach(p=>this.s(p[0],p[1],k));return this;}
}
const RAMP={};
function rampFor(c){if(RAMP[c])return RAMP[c];return RAMP[c]=[mix(tint(c,.3),'#fff1c4',.22),c,mix(shade(c,.74),'#2c1458',.18),mix(shade(c,.55),'#1a0c3a',.25)].map(hx);}
// Turn a key grid into a shaded, outlined canvas.
function paint(g,pal,opt){
  opt=opt||{};const W=g.w,H=g.h,cv=mkCv(W,H),ctx=cv.getContext('2d'),id=ctx.createImageData(W,H),d=id.data;
  const flat=opt.flat||'',noAO=opt.noAO||'';
  const put=(x,y,c,a)=>{const i=(y*W+x)*4;d[i]=c[0];d[i+1]=c[1];d[i+2]=c[2];d[i+3]=a===undefined?255:a;};
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const k=g.g(x,y);if(!k||!pal[k])continue;const R=rampFor(pal[k]);
    if(flat.includes(k)){put(x,y,R[1]);continue;}
    const up=g.g(x,y-1),dn=g.g(x,y+1),rt=g.g(x+1,y),lf=g.g(x-1,y);
    let i=1;
    if(dn===0)i=(rt===0?3:2);
    else if(dn!==k)i=2;
    else if(up===0||(lf===0&&up===k&&g.g(x-1,y-1)===0))i=0;
    else if(rt===0)i=2;
    else if(up!==k&&!noAO.includes(k)&&!flat.includes(up))i=2;
    put(x,y,R[i]);
  }
  const oc=opt.rim?hx(opt.rim):null,OUT=hx(OUTC);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    if(g.g(x,y))continue;
    const n=[g.g(x,y-1),g.g(x,y+1),g.g(x-1,y),g.g(x+1,y)].filter(Boolean);
    if(!n.length)continue;
    if(oc){put(x,y,oc);continue;}
    const base=pal[n[0]]||'#000000',c=rampFor(base)[3];
    put(x,y,c.map((v,i)=>v*.45+OUT[i]*.55));
  }
  if(opt.glow){const gc=hx(opt.glow);
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=(y*W+x)*4;if(d[i+3])continue;
      if([[0,-1],[0,1],[-1,0],[1,0],[1,1],[-1,-1],[1,-1],[-1,1]].some(([a,b])=>{const xx=x+a,yy=y+b;return xx>=0&&yy>=0&&xx<W&&yy<H&&d[(yy*W+xx)*4+3]===255;}))put(x,y,gc,110);}
  }
  ctx.putImageData(id,0,0);return cv;
}
const URL_CACHE={};
function cvURL(key,fn){if(URL_CACHE[key])return URL_CACHE[key];const c=fn();return URL_CACHE[key]=c.toDataURL();}

// =================== HEROES ===================
// HERO RIG (0.15.0, pass two). Every hero is drawn on a 40 x 56 grid (feet on row 52, three empty rows under them, the body centre on the line between
// columns 19 and 20) at about 6.3 heads: the skull is rows 9 to 15 (7 rows), the neck 16 and 17, the shoulders row 18, the waist row 27, the hips row 31,
// the knee row 40, the ankle row 49. The side view faces right; the front and back views mirror about the centre (PG.sym). Parts are drawn as tubes,
// polygons and spans in a few base keys (cloth P p, trousers K k, boots B b, steel M N c, skin S e ...); heroTone (art2.js) adds the second tone and
// paint / paintHD the light. Poses (heropose9.js) ask for the figure with markers: '#' at the shoulder joint, '!' for the 2x2 resting hand.
const RIGW=40,RIGH=56;
const HRIG={bare:false};
// ----- the compact overworld rig: the same drawing calls, run on a grid whose .sc scales every operation (rects, ellipses, polygons, lines and single cells are
// rasterised at the smaller geometry, never resampled). HRS is the size the next grid is made at: 1 = the 40x56 battle rig, .7 = the 28x40 walker. -----
const HRS={f:1,W:40,H:56};
function rigScale(f,fn){const o=[HRS.f,HRS.W,HRS.H];HRS.f=f;HRS.W=f===1?40:Math.round(40*f);HRS.H=f===1?56:40;try{return fn();}finally{HRS.f=o[0];HRS.W=o[1];HRS.H=o[2];}}
function hnew(){const t=new PG(HRS.W,HRS.H,0,0);if(HRS.f!==1)t.sc={f:HRS.f,dx:0,dy:0,sw:40};return t;}
function hcopy(g){const t=new PG(g.w,g.h,g.ox,g.oy);if(g.sc)t.sc=g.sc;return t;}
{const P=PG.prototype,o={s:P.s,rect:P.rect,ell:P.ell,poly:P.poly,line:P.line};
  const raw=(t,fn)=>{const c=t.sc;t.sc=null;try{return fn();}finally{t.sc=c;}};
  P.s=function(x,y,k){const c=this.sc;if(!c)return o.s.call(this,x,y,k);return o.s.call(this,Math.floor((x+.5)*c.f)+c.dx,Math.floor((y+.5)*c.f)+c.dy,k);};
  P.rect=function(x,y,w,h,k){const c=this.sc;if(!c)return o.rect.call(this,x,y,w,h,k);
    let x0=Math.round(x*c.f)+c.dx,x1=Math.round((x+w)*c.f)+c.dx,y0=Math.round(y*c.f)+c.dy,y1=Math.round((y+h)*c.f)+c.dy;if(x1<=x0)x1=x0+1;if(y1<=y0)y1=y0+1;
    for(let j=y0;j<y1;j++)for(let i=x0;i<x1;i++)o.s.call(this,i,j,k);return this;};
  P.ell=function(cx,cy,rx,ry,k){const c=this.sc;if(!c)return o.ell.call(this,cx,cy,rx,ry,k);return raw(this,()=>o.ell.call(this,cx*c.f+c.dx,cy*c.f+c.dy,Math.max(.55,rx*c.f),Math.max(.55,ry*c.f),k));};
  P.poly=function(Q,k){const c=this.sc;if(!c)return o.poly.call(this,Q,k);return raw(this,()=>o.poly.call(this,Q.map(p=>[p[0]*c.f+c.dx,p[1]*c.f+c.dy]),k));};
  P.line=function(x0,y0,x1,y1,k,t){const c=this.sc;if(!c)return o.line.call(this,x0,y0,x1,y1,k,t);const m=(v,d)=>(v+.5)*c.f-.5+d;
    return raw(this,()=>o.line.call(this,m(x0,c.dx),m(y0,c.dy),m(x1,c.dx),m(y1,c.dy),k,(t||1)<=1?1:Math.max(1,t*c.f)));};
}
const HWT={on:false};// weapon tint (art2.js accessories): metal M N and haft W are drawn as v x y
function hTint(g,fn){if(!HWT.on)return fn(g);const t=hcopy(g);fn(t);const R={M:'v',N:'x',W:'y'};for(let i=0;i<t.a.length;i++)if(t.a[i])g.a[i]=R[t.a[i]]||t.a[i];return g;}// bare: the arm and the weapon are left out and the markers drawn instead (heropose9.js hpBare)
// a smooth tube along a path (Catmull-Rom), radius r0 to r1: [{x,y,r}]
function hpath(P,r0,r1,step){const n=P.length,rs=P.map((_,i)=>r0+(r1-r0)*(n>1?i/(n-1):0)),at=i=>P[Math.max(0,Math.min(n-1,i))],out=[];step=step||.5;
  for(let i=0;i<n-1;i++){const p0=at(i-1),p1=at(i),p2=at(i+1),p3=at(i+2),len=Math.hypot(p2[0]-p1[0],p2[1]-p1[1]),N=Math.max(2,Math.ceil(len/step));
    for(let j=(i?1:0);j<=N;j++){const u=j/N,u2=u*u,u3=u2*u,f=(a,b,c,d)=>.5*(2*b+(-a+c)*u+(2*a-5*b+4*c-d)*u2+(-a+3*b-3*c+d)*u3);
      out.push({x:f(p0[0],p1[0],p2[0],p3[0]),y:f(p0[1],p1[1],p2[1],p3[1]),r:rs[i]+(rs[i+1]-rs[i])*u});}}
  return out;}
function hlimb(g,P,r0,r1,k){hpath(P,r0,r1,.5).forEach(s=>g.ell(s.x,s.y,Math.max(.9,s.r),Math.max(.9,s.r),k));return g;}
// spans: rows from y0, each [x0,x1]; sym: rows from y0, each the left edge (the right one mirrors)
function hspan(g,y0,S,k){S.forEach((s,i)=>{if(!s)return;for(let x=s[0];x<=s[1];x++)g.s(x,y0+i,k);});return g;}
function hsym(g,y0,X,k){const c=g.sc;X.forEach((x0,i)=>{if(x0==null)return;
  if(!c){for(let x=x0;x<=RIGW-1-x0;x++)g.s(x,y0+i,k);return;}
  const a=Math.round(x0*c.f),b=Math.round((RIGW-x0)*c.f),yy=Math.floor((y0+i+.5)*c.f)+c.dy;
  if(yy<0||yy>=g.h)return;for(let x=a;x<b&&x<g.w;x++)if(x>=0)g.a[yy*g.w+x]=k;});return g;}
// paint a mask shape by shape with three tones from the top left (keys K[0] lit, K[1] base, K[2] shade), like the boss toolkit
function hsh(g,fn,K,o){o=o||{};const t=hcopy(g);fn(t);const A=t.a,W=g.w,H=g.h,cap=o.cap||9,bias=o.bias||0;
  const dep=(x,y,dx,dy)=>{let n=0;while(n<cap&&t.g(x+dx*(n+1),y+dy*(n+1)))n++;return n;};
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(!A[y*W+x])continue;const u=dep(x,y,-1,-1),d=dep(x,y,1,1),s=(u+.5)/(u+d+1)+bias;g.a[y*W+x]=s<.22?K[0]:s<.66?K[1]:K[2];}
  return g;}
PG.prototype.sym=function(x0,y0,R){R.forEach((r,j)=>{for(let i=0;i<r.length;i++){const c=r[i];if(c==='.'||c===' ')continue;const x=x0+i;this.s(x,y0+j,c);this.s((this.sc?this.sc.sw:this.w)-1-x,y0+j,c);}});return this;};
// mirror what a drawing function paints into g about the centre line (the right half is a copy of the left)
function hmirror(g,fn,k){const t=hcopy(g);fn(t);for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++){const c=t.a[y*g.w+x];if(!c)continue;g.a[y*g.w+x]=c;g.a[y*g.w+g.w-1-x]=c;}return g;}

// the hero's class, for the garments: from the template when the id is known, else guessed from the look (walkers of heroes pass the id)
function heroCls(L,id){
  const t=id&&typeof TPL!=='undefined'&&TPL[id];if(t&&t.cls)return t.cls;
  if(L.cls)return L.cls;
  const w=L.wpn||'none';
  if(L.b==='monk')return 'monk';
  if(L.b==='heavy')return L.sh?'knight':'warrior';
  if(L.b==='robe')return /staff_(sun|crook)|rod/.test(w)&&L.halo?'healer':w==='harp'||w==='lute'?'bard':'mage';
  if(w==='bow'||w==='longbow'||w==='crossbow')return 'archer';
  if(w==='lute'||w==='harp'||w==='fan')return 'bard';
  return 'thief';
}
// body types: the arm (shoulder joint S, rest hand H top left of its 2x2, sleeve key), what the figure wears
const HP={
 body:{
  light:{S:[20.5,20.8],H:[26,29],slv:'P',hand:'S'},
  robe:{S:[20.5,20.8],H:[26,29],slv:'P',hand:'S'},
  heavy:{S:[20.5,20.4],H:[26,29],slv:'M',hand:'N'},
  monk:{S:[20.5,20.8],H:[26,29],slv:'S',hand:'S'}
 },
 hair:{short:{ear:1},spiky:{ear:1},wild:{ear:0},long:{ear:0},ponytail:{ear:1},bun:{ear:1},mohawk:{ear:1},braid:{ear:1},curly:{ear:0},bob:{ear:0},swept:{ear:1},flame:{ear:1},bald:{ear:1}},
 hat:{helm:1,greathelm:1,wizard:1,hood:1,bandana:1,circlet:1,feathercap:1,crown:1,headband:1,mitre:1,beret:1,goggles:1,widebrim:1,plume:1,horns:1},
 face:{beard:1,mustache:1,handlebar:1,eyepatch:1,mask:1,scar:1,elfears:1,warpaint:1,freckles:1,blush:1},
 back:{cape:1,scarf:1,pack:1}
};
const SKINS=['#f6d1b0','#efc29a','#d9a074','#b07850','#7e4e30','#5a3620'];
function heroPal(L,els){
  const p=Object.assign({H:'#4a2c1a',P:'#6a6a8a',Q:'#d8c8a0',J:'#4a3a5a',M:'#c8ccd6',N:'#6c7488',L:'#7a4f2a',K:'#3a3348',B:'#5a3a22',b:'#2c1a12',G:'#f0b848',W:'#8b5a2b',w:'#efe8d8',E:'#1a1020',m:'#8a3a3a',r:'#c8453c',R:'#c8453c'},L.pal||{});
  p.S=SKINS[L.sk||0];p.e=shade(p.S,.82);p.C=p.C||ELC[els[0]];if(!p.Y)p.Y=p.J;if(!p.Z)p.Z=p.Q;
  return p;
}

// ---------- side view: legs ----------
function hFoot(g,ax,lift,k,k2){
  if(!lift){hspan(g,50,[[ax-2,ax+1],[ax-2,ax+4],[ax-2,ax+5]],k);g.rect(ax-2,52,8,1,k2);}
  else{hspan(g,49,[[ax-2,ax+1],[ax-2,ax+2],[ax-1,ax+4],[ax+1,ax+5]],k);g.rect(ax+1,52,5,1,k2);}
}
function hLegSide(g,L,pts,far,lift){
  const b=L.b,heavy=b==='heavy',monk=b==='monk',[h,k,a]=pts;
  const T=far?(monk?'p':'k'):(monk?'P':'K');
  const Bt=far?(heavy?'N':monk?'e':'b'):(heavy?'M':monk?'S':'B'),Bs=far?(heavy?'k':'b'):(heavy?'N':monk?'e':'b');
  hlimb(g,[h,k,a],monk?3.4:heavy?3.1:2.7,monk?2.3:heavy?2.4:1.9,T);
  const bx=Math.round(a[0]);
  if(heavy){
    
    g.ell(k[0]+.6,k[1]-.4,2.7,2.1,far?'N':'M');if(!far)g.s(Math.round(k[0]),Math.round(k[1])-2,'c');
    hlimb(g,[[k[0],k[1]+1.5],[a[0],a[1]-2],[a[0],a[1]+.5]],2.4,1.9,far?'N':'M');
    if(!far){g.s(Math.round(k[0]+(a[0]-k[0])*.4),Math.round(k[1]+(a[1]-k[1])*.4),'c');}
  }else if(monk){
    // bare calves wrapped in bands, bare feet
    hlimb(g,[[k[0],k[1]+2.4],[a[0],a[1]]],2.1,1.7,far?'e':'S');
    for(let y=Math.round(k[1])+3;y<=Math.round(a[1]);y+=2){const t=(y-k[1])/(a[1]-k[1]),x=k[0]+(a[0]-k[0])*t;g.rect(Math.round(x-1.6),y,4,1,far?'q':'w');}
  }else{
    // boots from the calf down: a cuff, the shaft, the foot
    const f=.38,c=[k[0]+(a[0]-k[0])*f,k[1]+(a[1]-k[1])*f];
    hlimb(g,[c,[a[0],a[1]-1],[a[0],a[1]+.6]],2.3,1.9,Bt);
    g.rect(Math.round(c[0]-2),Math.round(c[1]),5,1,far?'b':'L');
  }
  hFoot(g,bx,lift,Bt,Bs);
  if(heavy&&!far)g.px([[bx+4,51],[bx+3,50]],'c');
}
// legs + skirts, side view
function hLegsSide(g,L,walk){
  const b=L.b,robe=b==='robe';
  const near=walk?[[21,32],[24,39.6],[25,48.6]]:[[21,32],[21.6,40],[21.6,48.6]];
  const far=walk?[[19.5,32],[16.6,40],[13.8,47.6]]:[[19.5,32],[19,40],[18.4,48.6]];
  if(robe){// the hem hides the legs; two feet show under it
    hLegSide(g,Object.assign({},L,{b:'light'}),[[far[0][0],49],[far[1][0],49.5],far[2]],1,walk);
    hLegSide(g,Object.assign({},L,{b:'light'}),[[near[0][0],49],[near[1][0],49.5],near[2]],0,0);
    return;}
  hLegSide(g,L,far,1,walk);
  hLegSide(g,L,near,0,0);
}
// ---------- side view: torso ----------
const HS_TORSO={
 light:[[18,23],[17,23],[16,24],[16,24],[16,24],[16,23],[17,23],[17,22],[17,22],[17,22],[17,22],[16,23],[16,23],[16,24],[16,24],[16,24]],
 robe:[[18,23],[17,23],[16,24],[16,24],[16,24],[17,24],[17,23],[17,23],[17,22],[17,22],[17,22]],
 heavy:[[17,23],[15,25],[14,26],[14,26],[14,26],[15,26],[16,25],[16,24],[16,24],[16,24],[16,24],[15,25],[15,26],[15,26],[15,26],[15,26]],
 monk:[[18,23],[17,23],[16,24],[16,24],[16,24],[16,23],[17,23],[17,22],[17,22],[17,22],[17,22],[16,23],[16,23],[16,24]]
};
function hTorsoSide(g,L,walk,cls){
  const b=L.b,F=id=>0;
  const T=HS_TORSO[b];
  hspan(g,18,T,b==='heavy'?'P':'P');
  if(b==='light'){
    hspan(g,18,[[18,23]],'P');
    g.rect(16,33,9,1,'Q');// tunic hem trim
    g.rect(17,28,7,2,'L');g.rect(23,28,1,2,'G');// belt and buckle
    g.px([[21,18],[22,18],[22,19]],'Q');
  }else if(b==='robe'){
    // bodice, then the skirt: flares to the hem, folds, trim
    g.poly([[16,28.5],[24.5,28.5],[27.4,47.6],[12.6,47.6]],'P');
    g.rect(13,46,15,2,'Q');
    [[19,32,17,46],[22,32,24,46],[20.5,36,20.5,46]].forEach(q=>g.line(q[0],q[1],q[2],q[3],'p'));
    g.rect(17,27,7,2,'Q');g.s(23,27,'G');g.px([[21,18],[22,18],[22,19]],'Q');
  }else if(b==='heavy'){
    // plate over the chest, a tabard under the belt, a plated skirt
    hspan(g,19,[[17,25],[16,26],[16,26],[16,26],[17,25]],'M');
    g.rect(22,21,2,2,'N');g.rect(16,24,8,1,'N');
    g.rect(16,26,9,2,'L');g.rect(23,26,1,2,'G');
    g.rect(20,28,6,11,'P');g.rect(20,38,6,1,'Q');// tabard front
    g.rect(15,28,5,5,'L');g.rect(15,32,5,1,'N');// leather skirt
    g.px([[19,18],[20,18],[21,18]],'M');
  }else{// monk: a short gi top, bare chest in a V, sash
    hspan(g,19,[[17,24],[17,24],[17,23],[17,23],[17,23],[17,23]],'P');
    g.px([[22,19],[23,19],[23,20],[22,20],[22,21]],'S');
    g.rect(17,27,7,2,'Q');g.rect(16,29,2,6,'Q');g.rect(17,34,1,1,'q');
  }
}

// ---------- side view: arms, shield, back items ----------
// the sleeve of the near arm and the hand; the weapon decides whether the arm reaches out (W.x: bows and crossbows) or hangs ready
function hArmPts(L,W){const B=HP.body[L.b];const S=B.S;
  if(W&&W.x)return {S,P:[S,[24.3,22.6],[27.6,22.2]],H:[28,21]};
  return {S,P:[S,[21.2,27.2],[25.4,29.6]],H:[B.H[0],B.H[1]]};}
function hSleeve(g,L,pts,far,slvOnly){
  const b=L.b,heavy=b==='heavy',monk=b==='monk',robe=b==='robe',P=pts;
  const k=far?(heavy?'N':monk?'e':'p'):(heavy?'M':monk?'S':'P');
  hlimb(g,P,monk?2:heavy?2.2:2,monk?1.5:heavy?1.7:1.5,k);
  if(heavy&&!far){// pauldron over the shoulder, a vambrace on the forearm
    g.ell(P[0][0],P[0][1]-.5,4.2,3.1,'M');g.rect(Math.round(P[0][0])-3,Math.round(P[0][1])+1,7,1,'N');g.px([[Math.round(P[0][0])-2,Math.round(P[0][1])-2],[Math.round(P[0][0])-1,Math.round(P[0][1])-2]],'c');
    hlimb(g,[[(P[1][0]+P[2][0])/2,(P[1][1]+P[2][1])/2],P[2]],1.8,1.5,'M');
  }
  if(heavy&&far)g.ell(P[0][0],P[0][1]-.4,3.3,2.5,'N');
  if(robe&&!far){g.ell(P[2][0]-.4,P[2][1]+.3,2.7,2.1,'Q');}// the bell of the sleeve
  if(monk){const e=P[1],h=P[2];for(let i=0;i<3;i++){const t=.45+i*.2,x=e[0]+(h[0]-e[0])*t,y=e[1]+(h[1]-e[1])*t;g.rect(Math.round(x-1.5),Math.round(y-.5),3,1,far?'q':'w');}}
  if(!heavy&&!monk&&!robe&&!far){g.ell(P[2][0]-.3,P[2][1]+.2,1.9,1.3,'Q');}// a cuff
}
function hShieldSide(g,L){
  if(L.sh==='kite'){
    g.poly([[7,20],[17,19.4],[17,30],[12,39.6],[7,30]],'M');
    g.poly([[8.4,21.6],[15.6,21.2],[15.6,29.4],[12,36.4],[8.4,29.4]],'Z');
    g.line(12,21.5,12,36,'G');g.rect(9,26,6,1,'G');g.px([[11,25],[12,25],[13,25]],'G');g.s(8,22,'c');g.px([[7,21],[7,22]],'c');
  }else if(L.sh==='round'){
    g.ell(11.5,28.4,5.6,5.6,'M');g.ell(11.5,28.4,4.3,4.3,'Z');g.ell(11.5,28.4,1.6,1.6,'G');g.px([[7,25],[8,24]],'c');g.s(11,28,'9');
  }
}
function hBackSide(g,L,walk,cls){
  const bk=L.back||[],sw=walk?1:0;
  if(bk.includes('cape')){
    g.poly([[18.4,18.6],[16.4,19],[13.5,23],[11.5,31],[10.6+sw,41],[11+sw*2,48.4],[15.5+sw,49.4],[18.2,47.5],[18,30]],'Y');
    [[15,24,13+sw,46],[17,26,16,47]].forEach(q=>g.line(q[0],q[1],q[2],q[3],'z'));
    g.line(17.5,19.2,13.4,24,'Q');
  }
  if(bk.includes('pack')){
    g.poly([[10.6,22.6],[16.8,22],[17.2,33],[11.6,33.4]],'Y');g.rect(11,22,6,2,'L');g.rect(13,25,2,1,'G');g.rect(11,31,6,2,'L');
    g.line(17.6,19.6,22.6,28.2,'L');
  }
  if(L.wpn==='bow'||L.wpn==='longbow'){
    if(!L.vill&&!bk.includes('pack')){// the quiver behind the shoulder, feathers up
      hlimb(g,[[16.4,31],[13.6,24],[12,17.8]],2.1,2.1,'L');g.rect(11,17,3,1,'N');
      g.px([[10.6,15],[12,14],[13.4,15],[11.4,13]],'w');g.px([[11.6,12],[12.4,14],[13.6,13]],'R');g.px([[12,20],[13,24]],'G');
      g.line(17.6,19.6,22.6,28.2,'L');}
  }
  if(L.wpn==='twindagger')g.px([[17,29],[16,30],[15,31],[15,32]],'M');
  if(bk.includes('scarf')){
    g.rect(17,16,7,2,'Y');
    const w=walk?[[17,17],[13,18.4],[9,17.6],[5.4,20]]:[[17,17.6],[13,19.4],[9.4,20.6],[6.4,24]];
    hlimb(g,w,1.6,1,'Y');
  }
}

// ---------- the head: skull, face, hair, hats (views side, front, back) ----------
const SK_SIDE=[[18,22],[17,23],[16,24],[16,24],[16,24],[17,24],[19,23]],SK_FRONT=[[18,21],[17,22],[16,23],[16,23],[16,23],[17,22],[18,21]];
function hSkull(g,view){
  const s=view==='side';hspan(g,9,s?SK_SIDE:SK_FRONT,'S');
  if(s){g.rect(16,12,2,2,'S');g.px([[16,13],[17,13]],'e');g.s(25,13,'S');g.px([[24,14],[23,15]],'e');}
  else{g.px([[15,12],[15,13],[24,12],[24,13]],'S');g.px([[15,13],[24,13]],'e');g.px([[17,15],[22,15]],'e');}
}
// the face (front and side): brows, eyes with a catchlight (HD builds its own iris from the E run), nose, mouth, then the look's face fields
function hFace(g,L,view){
  const s=view==='side',F=L.face||[];
  if(view==='back'){return;}
  const brow=s?[[19,11],[20,11],[22,11],[23,11]]:[[17,11],[18,11],[21,11],[22,11]];
  g.px(brow,'l');
  const ex=s?[19,22]:[17,21];
  ex.forEach(x=>{g.s(x,12,'9');g.s(x+1,12,'E');g.s(x,13,'E');g.s(x+1,13,'E');});
  if(s){g.s(24,14,'m');g.s(23,14,'m');g.s(21,13,'e');}else{g.px([[19,14],[20,14]],'m');g.px([[19,13],[20,13]],'e');}
  F.forEach(f=>{
    if(f==='beard'){
      if(s){hspan(g,14,[[17,24],[17,24],[18,24],[19,23]],'H');g.px([[25,14],[24,13]],'H');g.px([[22,14],[23,14]],'l');g.rect(21,15,3,1,'l');}
      else{hspan(g,14,[[16,23],[16,23],[17,22],[18,21]],'H');g.rect(18,14,4,1,'H');g.px([[19,15],[20,15]],'l');g.px([[16,14],[23,14]],'l');}
    }
    else if(f==='mustache'){if(s)g.rect(22,14,3,1,'H');else g.rect(18,14,4,1,'H');}
    else if(f==='handlebar'){if(s){g.rect(22,14,3,1,'H');g.px([[25,13],[26,13]],'H');}else{g.rect(18,14,4,1,'H');g.px([[17,14],[16,13],[22,14],[23,13]],'H');}}
    else if(f==='eyepatch'){if(s){g.rect(22,12,2,2,'K');g.line(21,11,16,10,'K');}else{g.rect(17,12,2,2,'K');g.line(16,11,23,10,'K');}}
    else if(f==='mask'){if(s)hspan(g,13,[[19,24],[18,24],[19,23]],'K');else hspan(g,13,[[16,23],[17,22],[18,21]],'K');}
    else if(f==='scar'){if(s)g.px([[23,10],[23,11],[24,12],[24,13],[23,14]],'r');else g.px([[22,10],[22,11],[23,12],[23,13],[22,14]],'r');}
    else if(f==='warpaint'){if(s)g.px([[20,14],[21,14],[24,13]],'C');else g.px([[16,14],[17,14],[22,14],[23,14]],'C');}
    else if(f==='freckles'){if(s)g.px([[19,14],[21,14],[23,13],[24,14]],'e');else g.px([[16,14],[18,14],[21,14],[23,14],[16,13]],'e');}
    else if(f==='blush'){if(s)g.px([[21,14],[22,13]],'r');else g.px([[16,14],[17,14],[22,14],[23,14]],'r');}
    else if(f==='elfears'){if(s)g.px([[16,11],[15,10],[14,9],[15,11]],'S');else g.px([[15,11],[14,10],[13,9],[24,11],[25,10],[26,9]],'S');}
  });
}
// ----- hair: a cap plus what hangs, sticks up or is tied on (three tones: h lit, H, l dark) -----
const HAIRK=['h','H','l'];
function hairMirror(half){const m=half.map(p=>[RIGW-p[0],p[1]]).reverse();return half.concat(m);}
function hairCap(g,view,o){
  o=o||{};const s=view==='side',b=view==='back';
  if(s)hsh(g,t=>t.poly([[24.8,11.4],[25.4,9.7],[23.8,7.8],[20.6,7],[17.2,7.6],[14.8,9.8],[14.6,12.4],[15.4,14.4],[17.4,13.6],[17.4,11.8],[19,10.4],[22,10],[24,10.8]],'x'),HAIRK,{cap:6});
  else if(b)hsh(g,t=>t.poly(hairMirror([[20,6.8],[16.6,7.6],[14.8,9.8],[14.5,12.8],[15.3,15.4],[17.2,16.6],[20,16.8]]),'x'),HAIRK,{cap:6});
  else hsh(g,t=>t.poly(hairMirror([[20,6.8],[16.6,7.6],[14.8,9.8],[14.6,12.6],[15.4,14.4],[16.4,12.4],[16.8,10.8],[18.2,10.2],[20,10.9]]),'x'),HAIRK,{cap:6});
  // sheen and parting
  if(s){g.px([[18,8],[19,8],[20,8],[17,9]],'h');g.px([[23,8],[24,9]],'h');g.px([[22,9],[22,8]],'l');}
  else if(b){g.px([[18,8],[19,8],[17,9],[17,10]],'h');g.px([[20,8],[20,9],[20,10],[19,11]],'l');}
  else{g.px([[18,8],[19,8],[17,9]],'h');g.px([[21,8],[21,9]],'l');}
}
const HAIR_STYLE={
 short(g,v){hairCap(g,v);},
 swept(g,v){hairCap(g,v);if(v==='side')hsh(g,t=>t.poly([[20,10],[25.6,10.4],[26.2,12.2],[23.6,11],[20,11.2]],'x'),HAIRK);else if(v==='front')hsh(g,t=>t.poly([[19,10.4],[24,10.2],[24.6,12.2],[22,11.2],[19,11]],'x'),HAIRK);},
 spiky(g,v){hairCap(g,v);
   const sp=v==='side'?[[17,8,15,3.4,4],[19.6,7.6,19.4,2,4],[22.4,8,25,3,4],[24.6,9.4,28,6.4,3.6],[15.4,10,11.4,7.4,3.6]]:[[17,8,14.6,3.6,4],[19.4,7.4,19.4,2,4],[22.6,7.4,24.8,2.6,4],[24.6,9.2,27.6,6,3.6],[15,9.2,12.4,6,3.6]];
   hsh(g,t=>sp.forEach(q=>bspike(t,q[0],q[1],q[2],q[3],q[4],'x')),HAIRK,{cap:4});},
 wild(g,v){hairCap(g,v);
   const sp=v==='side'?[[16.6,8,13,2.4,4.4],[19.6,7.4,19,1.2,4.4],[22.6,8,26,2.6,4],[25,9.6,29,6.6,3.8],[15,10,9.6,7,4],[15,12.4,9,14.4,4],[16,14,11,19,3.4]]:[[17,8,12.4,2.6,4.4],[19.6,7.4,19.6,1,4.4],[22.6,7.6,27,2.6,4.4],[25,9.6,29,6.6,3.8],[15,10,10,8,4],[15,12.6,10,15.6,4],[25,12.4,30,15,3.6]];
   hsh(g,t=>sp.forEach(q=>bspike(t,q[0],q[1],q[2],q[3],q[4],'x')),HAIRK,{cap:4});},
 long(g,v){
   if(v==='side')hsh(g,t=>t.poly([[14.6,10],[17.6,11.4],[17.8,22],[17,32.6],[13,33.6],[12.4,24],[13.4,14]],'x'),HAIRK,{cap:5});
   else if(v==='back')hsh(g,t=>t.poly([[14.6,10],[25.4,10],[26.2,24],[24.6,34],[15.4,34],[13.8,24]],'x'),HAIRK,{cap:6});
   else{hsh(g,t=>t.poly([[14.6,11],[16.8,11],[17,20],[16.2,29],[13.4,27.6],[13.6,18]],'x'),HAIRK,{cap:4});hsh(g,t=>t.poly([[25.4,11],[23.2,11],[23,20],[23.8,29],[26.6,27.6],[26.4,18]],'x'),HAIRK,{cap:4});}
   hairCap(g,v);},
 bob(g,v){
   if(v==='side')hsh(g,t=>t.poly([[14.6,10],[17.4,11],[18,16.2],[14.8,17],[13.8,13]],'x'),HAIRK,{cap:5});
   else if(v==='back')hsh(g,t=>t.poly([[14.4,10],[25.6,10],[26,16.6],[14,16.6]],'x'),HAIRK,{cap:6});
   else{hsh(g,t=>t.poly([[14.4,11],[16.4,11],[16.6,17.4],[14,17]],'x'),HAIRK,{cap:4});hsh(g,t=>t.poly([[25.6,11],[23.6,11],[23.4,17.4],[26,17]],'x'),HAIRK,{cap:4});}
   hairCap(g,v);},
 ponytail(g,v){
   if(v==='side')hsh(g,t=>hlimb(t,[[16,9.6],[12.4,10.6],[10.4,15.6],[9.6,23]],2.3,1.2,'x'),HAIRK,{cap:4});
   else if(v==='back')hsh(g,t=>hlimb(t,[[20,8.6],[20,13],[20.6,19],[20,27]],2.4,1.3,'x'),HAIRK,{cap:4});
   else hsh(g,t=>hlimb(t,[[24.6,8],[26.4,11],[26.6,16]],1.8,1.1,'x'),HAIRK,{cap:3});
   hairCap(g,v);if(v==='side')g.px([[14,10],[14,11]],'A');else if(v==='back')g.rect(19,12,2,1,'A');},
 bun(g,v){hairCap(g,v);const c=v==='side'?[17.6,6]:[20,5.2];hsh(g,t=>t.ell(c[0],c[1],3.1,2.7,'x'),HAIRK,{cap:4});g.px([[Math.floor(c[0]),Math.floor(c[1])+3]],'A');},
 mohawk(g,v){
   if(v==='side')hsh(g,t=>t.poly([[16.4,11],[15.4,6],[18,3.2],[21.4,2.4],[24.6,3.8],[24.8,7],[23,9]],'x'),HAIRK,{cap:5});
   else hsh(g,t=>t.poly([[18,10],[17.6,4.4],[19,2.2],[21,2.2],[22.4,4.4],[22,10]],'x'),HAIRK,{cap:3});},
 braid(g,v){hairCap(g,v);
   const P=v==='side'?[[15.4,10.6],[13.4,17],[14.8,23],[13.2,29],[14.6,35]]:v==='back'?[[20,15],[19.2,21],[20.8,27],[19.4,33],[20.2,39]]:[[24.6,12],[25.4,19],[24.2,25],[25.4,31]];
   hsh(g,t=>hlimb(t,P,1.9,1.3,'x'),HAIRK,{cap:3});const e=P[P.length-1];
   hpath(P,1.9,1.3,1).forEach((s,i)=>{if(i%3===0)g.s(Math.round(s.x),Math.round(s.y),'l');});g.ell(e[0],e[1]-.2,1.5,1.1,'A');},
 curly(g,v){
   const c=v==='side'?20.4:20;
   hsh(g,t=>{t.ell(c,10,6.7,4.3,'x');t.ell(c-5.2,12.8,3,3.6,'x');t.ell(c+5,10.4,2.4,2.5,'x');t.ell(c-2.4,6.4,3.2,2.4,'x');t.ell(c+2.6,6.6,3,2.4,'x');if(v!=='side'){t.ell(c+5.6,12.8,3,3.6,'x');}},HAIRK,{cap:5});
   if(v==='front'){g.rect(17,11,6,3,0);hspan(g,11,[[17,22],[17,22],[17,22]],'S');g.px([[17,11],[18,11]],'l');}
   if(v==='side'){g.rect(18,11,7,3,0);hspan(g,11,[[18,24],[18,24],[18,24]],'S');}
   g.px([[18,6],[22,7],[16,9],[24,9],[19,9]],'h');},
 flame(g,v){HAIR_STYLE.spiky(g,v);},
 bald(g,v){g.px(v==='side'?[[19,9],[20,9],[21,9]]:[[18,9],[19,9]],'h');}
};
function hHair(g,L,view){
  const st=L.hair||'short',hat=L.hat,cov=hat==='hood'||hat==='greathelm'||hat==='helm'||hat==='plume'||hat==='horns';
  const f=HAIR_STYLE[st]||HAIR_STYLE.short;
  if(cov){// under a helm or hood only what hangs below is shown
    if(st==='long'||st==='bob'||st==='ponytail'||st==='braid'){const t=hcopy(g),r0=g.sc?Math.round(15*g.sc.f):15;f(t,view);for(let i=0;i<t.a.length;i++)if(t.a[i]&&Math.floor(i/g.w)>=r0)g.a[i]=t.a[i];}
    return;}
  f(g,view);
}

// ----- hats: drawn in two passes (back: before the skull, front: over the face and the hair); u runs across the head (-1 back .. +1 front in the side view) -----
const HAT_MET=['M','M','N'];
function hatDraw(g,L,view,pass){
  const h=L.hat;if(!h)return;const s=view==='side',fr=view==='front',bk=view==='back',cx=s?20.5:20,hw=s?5.4:5.1,X=u=>cx+u*hw,P=pts=>pts.map(p=>[X(p[0]),p[1]]);
  const poly=(pts,K)=>hsh(g,t=>t.poly(P(pts),'x'),K,{cap:6});
  if(pass==='back'){
    if(h==='hood'){
      if(s)hsh(g,t=>t.poly([[13.4,18.4],[12.6,11],[15.2,6.2],[20.6,4.4],[25,5.8],[26.4,9.6],[24.4,11],[19,10.4],[18,16],[19.6,18.6]],'x'),['J','J','j'],{cap:7});
      else hsh(g,t=>t.poly(hairMirror([[20,4.2],[16.4,5],[13.8,8],[13,13],[13.4,19],[16,19.6],[17,16],[16.4,11],[17.8,8.8],[20,8.4]]),'x'),['J','J','j'],{cap:7});
    }
    return;}
  if(h==='hood'){
    if(s){hsh(g,t=>t.poly([[22.4,8],[25.4,9.2],[26.4,12],[25.4,15.4],[23.4,17.6],[24.4,13],[23.4,10.6]],'x'),['J','J','j'],{cap:3});}
    else if(fr){hsh(g,t=>t.poly(hairMirror([[20,4.6],[16.4,5.4],[14,8.6],[13.4,14],[14,19],[15.8,19],[15.4,14],[16.2,10.4],[18,9],[20,8.6]]),'x'),['J','J','j'],{cap:7});}
    else{hsh(g,t=>t.poly(hairMirror([[20,4.2],[16.4,5],[13.8,8],[13,13],[13.4,19],[16,19.6],[20,19.8]]),'x'),['J','J','j'],{cap:7});g.line(20,5,20,18,'j');}
    // the cowl over the shoulders
    hsh(g,t=>t.poly(s?[[14,17],[20,16.4],[26,17.4],[27,21.4],[13,22]]:hairMirror([[20,16.6],[15,17],[12,19.6],[11.6,22.4],[20,23]]),'x'),['J','J','j'],{cap:5});
    return;}
  if(h==='helm'||h==='plume'||h==='horns'){
    poly([[-1.18,12.4],[-1.24,9.4],[-.84,6.9],[0,5.8],[.86,6.8],[1.24,9.4],[1.18,12]],HAT_MET);
    g.rect(Math.round(X(-1.2)),10,Math.round(X(1.2))-Math.round(X(-1.2))+1,1,'N');
    g.px([[Math.round(X(-.6)),7],[Math.round(X(-.6))+1,6],[Math.round(X(-.4)),8]],'c');
    if(s){hspan(g,12,[[15,18],[15,18],[16,18]],'M');g.rect(24,11,2,3,'N');g.px([[24,11]],'M');}
    else if(fr){g.rect(19,11,2,4,'N');g.rect(15,12,2,3,'M');g.rect(23,12,2,3,'M');}
    else{hspan(g,11,[[15,24],[15,24],[16,23],[16,23]],'M');g.rect(15,12,10,1,'N');}
    if(h==='plume'){
      if(s)hsh(g,t=>hlimb(t,[[19,6.4],[15.6,2.6],[10.8,2.2],[8.4,6.2]],1.5,1.5,'x'),['R','R','R'],{cap:2});
      else hsh(g,t=>hlimb(t,[[20,6],[20,2.4]],2.6,1.8,'x'),['R','R','R'],{cap:2});
      if(!bk)g.px(s?[[16,3],[12,3],[10,5]]:[[19,3],[20,4]],'D');
    }
    if(h==='horns'){
      if(s){hsh(g,t=>hlimb(t,[[17,8.4],[13.4,6.4],[12.2,2.4]],1.8,.6,'x'),['w','w','w'],{cap:2});hsh(g,t=>hlimb(t,[[23,7.6],[26.4,5],[27,1.6]],1.5,.6,'x'),['w','w','w'],{cap:2});}
      else{hsh(g,t=>hlimb(t,[[15,9],[11.6,7],[11,2.4]],1.9,.6,'x'),['w','w','w'],{cap:2});hsh(g,t=>hlimb(t,[[25,9],[28.4,7],[29,2.4]],1.9,.6,'x'),['w','w','w'],{cap:2});}
    }
    return;}
  if(h==='greathelm'){
    poly([[-1.2,16.4],[-1.4,9],[-1,6],[-.4,4.8],[.5,4.8],[1.2,6],[1.4,9.2],[1.2,16.2],[.5,17]],HAT_MET);g.rect(Math.round(X(-1.2)),9,Math.round(X(1.2))-Math.round(X(-1.2))+1,1,'N');
    if(s){g.rect(20,11,6,2,'K');g.px([[22,11],[24,11]],'C');g.px([[22,15],[24,15],[24,13],[25,16]],'N');g.rect(14,13,4,4,'N');g.px([[15,6],[16,5],[19,5]],'c');}
    else if(fr){g.rect(15,11,10,2,'K');g.px([[17,11],[22,11]],'C');g.rect(19,5,2,12,'N');g.px([[17,15],[22,15],[17,13],[22,13]],'N');g.px([[16,6],[17,5]],'c');}
    else{g.rect(15,12,10,1,'N');g.rect(19,5,2,12,'N');g.px([[17,6],[16,7]],'c');}
    return;}
  if(h==='wizard'){
    hsh(g,t=>t.poly(P([[-.9,9.6],[.9,9.6],[.62,5.6],[.14,2.4],[-.5,.8],[-.2,2.8],[-.56,5.6]]),'x'),['J','J','j'],{cap:7});
    g.px(P([[-.2,.6]]).map(p=>p.map(Math.floor)),'J');
    hsh(g,t=>t.ell(cx+(s?.3:0),9,9.9,1.9,'x'),['J','J','j'],{cap:6});
    g.rect(Math.round(X(-.86)),7,Math.round(X(.86))-Math.round(X(-.86))+1,2,'Q');
    g.px([[Math.round(X(.2)),8],[Math.round(X(-.1)),8]],'G');
    return;}
  if(h==='bandana'||h==='headband'){
    if(s)hsh(g,t=>t.poly([[14.8,11.2],[25.2,10.6],[25.2,8.8],[14.8,8.4]],'x'),['J','J','j'],{cap:3});
    else hsh(g,t=>t.poly(P([[-1.15,11],[1.15,11],[1.15,8.6],[-1.15,8.6]]),'x'),['J','J','j'],{cap:3});
    if(s){hsh(g,t=>hlimb(t,[[15,9.8],[11.6,12],[9.6,16.4]],1.1,.8,'x'),['J','J','j'],{cap:2});}
    else if(bk){g.rect(19,9,2,2,'j');hsh(g,t=>hlimb(t,[[19.6,11],[17,14],[16,18]],1,.7,'x'),['J','J','j'],{cap:2});hsh(g,t=>hlimb(t,[[20.4,11],[23,14],[24,18]],1,.7,'x'),['J','J','j'],{cap:2});}
    else hsh(g,t=>hlimb(t,[[14.6,9.8],[11.6,12.6],[10.6,16.4]],1,.7,'x'),['J','J','j'],{cap:2});
    return;}
  if(h==='circlet'){
    if(s)g.line(15.4,11,24.8,9.4,'G');else hspan(g,10,[[15,24]],'G');
    if(!bk)g.px(s?[[24,9],[24,10]]:[[19,9],[20,9]],'C');
    return;}
  if(h==='feathercap'){
    poly([[-1.2,10.6],[-1.2,8.5],[-.8,6.6],[0,5.8],[.8,6.4],[1.28,8.4],[1.5,10]],['J','J','j']);
    if(s){g.rect(18,10,8,1,'j');hsh(g,t=>hlimb(t,[[23,7],[19.4,3.2],[14,2.6],[10.4,5.4]],1.5,.6,'x'),['R','R','R'],{cap:2});g.line(22,6.4,12,3.8,'w');}
    else{g.rect(15,10,10,1,'j');hsh(g,t=>hlimb(t,[[24,7],[26.6,3.6],[28.4,1.6]],1.6,.7,'x'),['R','R','R'],{cap:2});g.line(24.4,6.4,27.6,2.4,'w');}
    return;}
  if(h==='crown'){
    g.rect(Math.round(X(-1.05)),8,Math.round(X(1.05))-Math.round(X(-1.05))+1,2,'G');
    [-.95,-.48,0,.48,.95].forEach((u,i)=>{const x=Math.round(X(u)),hgt=i%2?2:3;g.rect(x,8-hgt,1,hgt,'G');if(!(i%2))g.s(x,8-hgt-1,'G');});
    if(!bk)g.px([[Math.round(X(0)),8]],'C');g.px([[Math.round(X(-.6)),8]],'c');
    return;}
  if(h==='mitre'){
    poly([[-.84,9.2],[.84,9.2],[.7,5],[.2,1.6],[-.2,1.6],[-.7,5]],['w','w','w']);
    g.rect(Math.round(X(-.88)),8,Math.round(X(.88))-Math.round(X(-.88))+1,2,'G');
    if(!bk){g.rect(Math.round(X(0))-0,2,1,6,'G');}else g.line(X(-.2),3,X(-.2),8,'G');
    if(s)g.px([[15,10],[14,12],[13,14],[14,16],[15,16]],'w');else{g.px([[14,10],[14,12],[14,14],[25,10],[25,12],[25,14]],'w');}
    return;}
  if(h==='beret'){
    hsh(g,t=>t.ell(cx-(s?1.2:0),7.8,6.6,2.8,'x'),['J','J','j'],{cap:5});g.px([[Math.floor(cx-(s?1.2:0)),4]],'J');g.px([[Math.floor(cx-(s?1.2:0)),5]],'J');
    return;}
  if(h==='goggles'){
    g.rect(Math.round(X(-1.12)),9,Math.round(X(1.12))-Math.round(X(-1.12))+1,1,'K');
    const ls=s?[[22.4,7.6]]:[[17.4,8.2],[22.6,8.2]];
    ls.forEach(l=>{g.ell(l[0],l[1],2.3,1.9,'M');g.ell(l[0],l[1],1.4,1.1,'C');g.s(Math.floor(l[0])-1,Math.floor(l[1])-1,'9');});
    if(s)g.px([[15,9],[14,10]],'K');
    return;}
  if(h==='widebrim'){
    hsh(g,t=>t.ell(cx,8.4,10.4,1.9,'x'),['J','J','j'],{cap:6});
    hsh(g,t=>t.ell(cx,6,5.4,3.2,'x'),['J','J','j'],{cap:5});
    g.rect(Math.round(X(-1.02)),7,Math.round(X(1.02))-Math.round(X(-1.02))+1,1,'Q');
    return;}
}

// ---------- weapons: draw(g,x,y) with (x,y) the top left cell of the 2x2 hand; the grip column is x+1. keys: M steel, N shade, c glint, W wood, w bone, G gold, L leather,
// C element glow, 9 white glint, R fletching, J book cloth ----------
const WPN={
 sword:{draw(g,x,y){const c=x+1;g.rect(c,y-19,2,18,'M');g.rect(c,y-18,1,16,'c');g.s(c,y-20,'M');g.s(c+1,y-20,'c');g.rect(c+1,y-10,1,9,'N');g.rect(c-3,y-1,8,1,'G');g.px([[c-3,y-1],[c+4,y-1]],'L');g.rect(c,y+2,2,1,'L');g.rect(c,y+3,2,1,'G');}},
 greatsword:{draw(g,x,y){const c=x+1;g.rect(c-1,y-26,4,25,'M');g.line(c+1,y-24,c+1,y-3,'N');g.line(c-1,y-25,c-1,y-2,'c');g.px([[c,y-27],[c+1,y-27]],'M');g.s(c+2,y-26,'N');g.rect(c-4,y-1,10,1,'G');g.px([[c-4,y-1],[c+5,y-1]],'L');g.rect(c,y+2,2,2,'L');g.rect(c-1,y+4,4,1,'G');}},
 katana:{draw(g,x,y){const c=x+1;g.path([[c,y-1],[c,y-12],[c+1,y-18],[c+3,y-22]],'M');g.path([[c+1,y-2],[c+1,y-12],[c+2,y-18]],'c');g.s(c+3,y-22,'c');g.rect(c-2,y-1,5,1,'G');g.rect(c,y+2,2,3,'K');g.px([[c,y+3],[c+1,y+4]],'Q');g.s(c,y+5,'G');}},
 axe:{draw(g,x,y){const c=x+1;g.line(c,y+13,c,y-18,'W');g.px([[c-1,y-4],[c-1,y+3],[c-1,y+9]],'L');g.poly([[c+1,y-21],[c+7,y-23],[c+10,y-17],[c+9,y-9],[c+1,y-11]],'M');g.line(c+3,y-20,c+3,y-12,'N');g.path([[c+7,y-23],[c+10,y-17],[c+9,y-9]],'c');g.poly([[c,y-18],[c-4,y-17],[c,y-14]],'N');g.s(c-4,y-17,'c');g.rect(c,y+14,1,1,'G');}},
 hammer:{draw(g,x,y){const c=x+1;g.line(c,y-12,c,y+14,'W');g.px([[c-1,y-4],[c-1,y+4],[c-1,y+9]],'L');g.rect(c-5,y-22,11,8,'M');g.rect(c-5,y-22,11,1,'c');g.rect(c-5,y-19,11,1,'G');g.rect(c-6,y-21,1,6,'N');g.rect(c+6,y-21,1,6,'N');g.rect(c-5,y-15,11,1,'N');}},
 mace:{draw(g,x,y){const c=x+1;g.line(c,y-10,c,y+6,'W');g.ell(c+.5,y-14,4,4,'M');g.px([[c-1,y-16],[c,y-17]],'c');g.px([[c+.5,y-19],[c-4,y-14],[c+5,y-14],[c+.5,y-9],[c-3,y-18],[c+4,y-18]],'N');g.rect(c-2,y-10,5,1,'G');g.px([[c-1,y-4],[c-1,y+2]],'L');}},
 spear:{draw(g,x,y){const c=x+1;g.line(c,y-26,c,y+16,'W');g.px([[c-1,y-4],[c-1,y+3]],'L');g.rows(c-1,y-35,[".c.","cMM","MMN","MMN",".MN",".N."]);g.rect(c-1,y-29,3,1,'G');g.rows(c+1,y-28,["JJJJ","JJJ.","JJ.."]);g.s(c,y+17,'G');}},
 trident:{draw(g,x,y){const c=x+1;g.line(c,y-20,c,y+16,'W');g.rect(c-4,y-21,9,1,'G');g.rect(c-4,y-27,1,6,'M');g.rect(c,y-30,1,10,'M');g.rect(c+4,y-27,1,6,'M');g.px([[c-4,y-28],[c,y-31],[c+4,y-28]],'c');g.px([[c-1,y-4],[c-1,y+3]],'L');}},
 scythe:{draw(g,x,y){const c=x+1;g.line(c,y-26,c,y+16,'W');g.poly([[c,y-27],[c-9,y-28],[c-17,y-24],[c-22,y-17],[c-14,y-21],[c-8,y-24],[c,y-24]],'M');g.path([[c-20,y-18],[c-13,y-22],[c-6,y-25]],'c');g.px([[c-1,y-4],[c-1,y+3]],'L');g.rect(c-1,y-26,3,1,'G');}},
 dagger:{draw(g,x,y){g.rect(x+2,y,1,1,'G');g.rect(x+2,y-1,1,3,'G');g.path([[x+3,y],[x+8,y-3]],'M',2);g.path([[x+4,y-1],[x+8,y-4]],'c');g.s(x+9,y-4,'c');g.rect(x,y+1,2,1,'L');}},
 twindagger:{back:1,draw(g,x,y){g.rect(x+2,y,1,1,'G');g.rect(x+2,y-1,1,3,'G');g.path([[x+3,y],[x+8,y-3]],'M',2);g.path([[x+4,y-1],[x+8,y-4]],'c');g.s(x+9,y-4,'c');g.rect(x,y+1,2,1,'L');},
   drawBack(g,x,y){g.rect(x-1,y,3,1,'G');g.path([[x-1,y+1],[x-6,y+5]],'M',2);g.path([[x-1,y],[x-5,y+3]],'c');g.s(x-7,y+6,'c');}},
 bow:{x:1,before:1,draw(g,x,y){const c=x+1,t=y-13,b=y+13;g.path([[c-1,t],[c+2,t+4],[c+4,y-5],[c+5,y],[c+4,y+5],[c+2,b-4],[c-1,b]],'W',2);g.px([[c+4,y-3],[c+4,y+3]],'L');g.s(c-1,t-1,'G');g.s(c-1,b+1,'G');g.line(c-1,t,c-1,b,'w');g.line(c-8,y+1,c+5,y+1,'W');g.px([[c+6,y+1],[c+7,y+1]],'M');g.px([[c-9,y],[c-9,y+2],[c-8,y],[c-8,y+2]],'R');g.rect(c+3,y-1,3,3,'L');}},
 longbow:{x:1,before:1,draw(g,x,y){const c=x+1,t=y-19,b=y+19;g.path([[c-1,t],[c+2,t+5],[c+4,y-9],[c+5,y-3],[c+5,y+3],[c+4,y+9],[c+2,b-5],[c-1,b]],'W',2);g.px([[c+4,y-5],[c+5,y+5]],'L');g.s(c-1,t-1,'G');g.s(c-1,b+1,'G');g.line(c-1,t,c-1,b,'w');g.line(c-9,y+1,c+5,y+1,'W');g.px([[c+6,y+1],[c+7,y+1]],'M');g.px([[c-10,y],[c-10,y+2],[c-9,y],[c-9,y+2]],'Q');g.rect(c+3,y-1,3,3,'L');}},
 crossbow:{x:1,draw(g,x,y){const c=x+1;g.rect(c-12,y,18,3,'W');g.rect(c-12,y+1,6,1,'L');g.path([[c+4,y-8],[c+6,y-5],[c+6,y+7],[c+4,y+10]],'M',2);g.line(c+4,y-7,c-1,y+1,'w');g.line(c+4,y+9,c-1,y+1,'w');g.rect(c-5,y-1,10,1,'M');g.s(c+6,y-1,'c');g.s(c+4,y-8,'G');g.s(c+4,y+10,'G');}},
 staff_orb:{draw(g,x,y){const c=x+1;g.line(c,y-22,c,y+23,'W');g.px([[c-1,y-3],[c-1,y+4],[c-1,y-12]],'L');g.ell(c+.5,y-26,3.6,3.6,'C');g.px([[c-1,y-28],[c,y-29]],'9');g.px([[c-3,y-22],[c+4,y-22],[c-3,y-23],[c+4,y-23],[c-4,y-26],[c+5,y-26]],'G');g.rect(c,y-22,1,1,'G');}},
 staff_crook:{draw(g,x,y){const c=x+1;g.line(c,y-22,c,y+23,'W');g.px([[c-1,y-3],[c-1,y+4]],'L');g.path([[c,y-22],[c,y-27],[c+1,y-29],[c+4,y-29],[c+6,y-27],[c+6,y-24],[c+4,y-22]],'W',2);g.px([[c+4,y-26],[c+3,y-27]],'C');g.s(c+4,y-28,'9');g.px([[c,y-21],[c+1,y-20]],'G');}},
 staff_crystal:{draw(g,x,y){const c=x+1;g.line(c,y-20,c,y+23,'W');g.px([[c-1,y-3],[c-1,y+4]],'L');g.poly([[c+.5,y-32],[c+3.6,y-25],[c+.5,y-18],[c-2.6,y-25]],'C');g.px([[c,y-28],[c-1,y-26]],'9');g.px([[c-3,y-21],[c+4,y-21],[c-2,y-19],[c+3,y-19]],'G');}},
 staff_sun:{draw(g,x,y){const c=x+1;g.line(c,y-20,c,y+23,'G');g.px([[c-1,y-3],[c-1,y+4]],'L');g.ell(c+.5,y-26,4.6,4.6,'G');g.ell(c+.5,y-26,2.8,2.8,'C');g.px([[c,y-27]],'9');g.px([[c+.5,y-32],[c-5,y-26],[c+6,y-26],[c-3,y-30],[c+4,y-30]],'G');}},
 rod:{draw(g,x,y){const c=x+1;g.line(c,y-11,c,y+3,'G');g.ell(c+.5,y-14,2.6,2.6,'C');g.px([[c,y-15]],'9');g.rect(c-1,y-11,3,1,'G');g.px([[c-1,y-3],[c-1,y+1]],'L');}},
 tome:{draw(g,x,y){g.rect(x-1,y-7,10,9,'J');g.rect(x,y-6,8,7,'w');g.line(x+4,y-6,x+4,y,'L');g.rect(x-1,y-7,10,1,'j');g.px([[x+8,y+1],[x-1,y+1]],'G');g.px([[x+1,y-4],[x+2,y-4],[x+5,y-3],[x+6,y-3]],'L');}},
 grimoire:{draw(g,x,y){g.rect(x,y-16,12,10,'J');g.rect(x+1,y-15,10,8,'w');g.line(x+6,y-15,x+6,y-8,'J');g.rect(x,y-16,12,1,'j');g.px([[x,y-16],[x+11,y-16],[x,y-7],[x+11,y-7]],'G');g.px([[x+3,y-12],[x+8,y-11],[x+3,y-9],[x+9,y-14]],'C');g.px([[x-1,y-4],[x+12,y-18],[x+5,y-3]],'G');}},
 lute:{under:1,draw(g,x,y){g.ell(19.6,33,5.6,4.4,'L');g.ell(20,33.4,2.4,2,'K');g.s(20,32,'D');g.path([[23,32],[27,27],[32,17]],'W',2);g.line(23,33,31,18,'G');g.rect(31,13,3,4,'L');g.px([[30,14],[34,15],[30,16]],'G');g.px([[17,31],[18,30]],'9');}},
 harp:{draw(g,x,y){g.path([[x+2,y-14],[x+8,y-14],[x+10,y-10],[x+9,y+2],[x+4,y+6],[x+2,y+6],[x+2,y-14]],'G',2);g.line(x+4,y-12,x+4,y+4,'w');g.line(x+6,y-12,x+6,y+1,'w');g.line(x+8,y-11,x+8,y-2,'w');g.s(x+2,y-14,'9');}},
 fan:{draw(g,x,y){const c=x+1.5;for(let a=-165;a<=-15;a+=5){const r=a*Math.PI/180;g.line(c,y,c+Math.cos(r)*12,y+Math.sin(r)*12,'Q');}for(let a=-165;a<=-15;a+=30){const r=a*Math.PI/180;g.line(c,y,c+Math.cos(r)*12,y+Math.sin(r)*12,'G');}g.path([[c-12,y-3],[c-8,y-10],[c,y-12],[c+8,y-10],[c+12,y-3]],'G');}},
 fists:{hand:'w',draw(g,x,y){g.rect(x-1,y-1,4,4,'w');g.px([[x+3,y-1],[x+3,y+1]],'G');g.px([[x-1,y-1],[x,y-1]],'9');g.rect(x-1,y+3,4,1,'q');}},
 claws:{draw(g,x,y){g.path([[x+2,y],[x+10,y-5]],'M');g.path([[x+2,y+1],[x+11,y+1]],'M');g.path([[x+2,y+2],[x+10,y+7]],'M');g.px([[x+10,y-5],[x+11,y+1],[x+10,y+7]],'c');g.rect(x,y-1,3,4,'L');}},
 none:{draw(){}}
};

// ---------- the side figure ----------
function hHead(L,view,id){
  const g=hnew(),curly=(L.hair==='curly')&&!(L.hat==='hood'||L.hat==='helm'||L.hat==='greathelm'||L.hat==='plume'||L.hat==='horns');
  hatDraw(g,L,view,'back');
  if(curly){hHair(g,L,view);hSkull(g,view);}
  else{hSkull(g,view);hHair(g,L,view);}
  hFace(g,L,view);
  hatDraw(g,L,view,'front');
  return g;
}
function hNeck(g,view){if(view==='side'){g.rect(19,15,4,4,'S');g.px([[19,16],[19,17]],'e');}else{g.rect(18,15,4,4,'S');g.px([[18,17],[18,16],[19,18]],'e');}}
function hHandBlk(g,x,y,k){g.rect(x,y,2,2,k);}
function rigSide(L,walk,id){
  const g=hnew(),B=HP.body[L.b]||HP.body.light,W=WPN[L.wpn||'none']||WPN.none,cls=heroCls(L,id),bare=HRIG.bare;
  hBackSide(g,L,walk,cls);
  if(L.sh)hShieldSide(g,L);
  // the far arm swings with the stride
  const far=walk?[[19.6,20.8],[21,26.2],[22.8,30.2]]:[[19.6,20.8],[18.4,27],[18.8,31.4]];
  hSleeve(g,L,far,1);
  const fh=far[2],hk=W.hand||B.hand;
  g.rect(Math.round(fh[0])-1,Math.round(fh[1]),2,2,hk==='N'?'k':hk==='S'?'e':hk==='w'?'q':hk);
  if(L.wpn==='twindagger'&&!bare)hTint(g,t=>W.drawBack(t,Math.round(fh[0]),Math.round(fh[1])));
  hLegsSide(g,L,walk);
  hTorsoSide(g,L,walk,cls);
  hNeck(g,'side');
  drawFlair(g,L,id,'side');drawAcc(g,L,id,'side','body');
  if(W.under&&!bare)hTint(g,t=>W.draw(t,B.H[0],B.H[1]));
  // the head layer lands on the body (one pixel lower on the stride frame)
  const hd=hHead(L,'side',id),bob=walk&&!L.vill?1:0;raceTop(hd,L);drawAcc(hd,L,id,'side','head');
  for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++){const k=hd.a[y*g.w+x];if(!k)continue;const ty=y+bob;if(ty<g.h)g.a[ty*g.w+x]=k;}
  const A=hArmPts(L,W);
  if(bare){g.s(Math.floor(A.S[0]),Math.floor(A.S[1]),'#');g.rect(A.H[0],A.H[1],2,2,'!');return g;}
  if(W.before)hTint(g,t=>W.draw(t,A.H[0],A.H[1]));
  hSleeve(g,L,A.P,0);
  if(!W.before&&!W.under)hTint(g,t=>W.draw(t,A.H[0],A.H[1]));
  const wk=W.hand||B.hand;
  if(L.wpn!=='fists')g.rect(A.H[0],A.H[1],2,2,wk);
  if(wk==='S'&&W!==WPN.none)g.s(A.H[0]+1,A.H[1]+1,'e');
  return g;
}

// ---------- front and back views ----------
const HF_TORSO={
 light:[15,13,13,14,14,14,15,15,15,15,15,14,14,14,14,14],
 heavy:[13,11,11,12,12,13,14,14,14,14,14,13,13,13,13,13],
 robe:[15,13,13,14,14,15,15,15,15,15,15],
 monk:[15,13,13,14,14,14,15,15,15,15,15,14,14,14,14,14]
};
const HF_SKIRT=[14,14,14,13,13,13,13,12,12,12,12,12,11,11,11,11,11,11,11];
function hLegFront(g,L,lift,left){
  const b=L.b,heavy=b==='heavy',monk=b==='monk';
  const t=hnew(),ay=49-lift;
  const hip=[16.8,32],kn=[16.6,40-lift*.4],an=[16.9,ay];
  const T=monk?'P':'K',Bt=heavy?'M':monk?'S':'B',Bs=heavy?'N':monk?'e':'b';
  hlimb(t,[hip,kn,an],monk?3.2:heavy?2.8:2.6,monk?2.2:heavy?2.3:1.9,T);
  if(heavy){t.ell(kn[0],kn[1]-.4,2.7,2.1,'M');t.s(Math.round(kn[0])-1,Math.round(kn[1])-2,'c');hlimb(t,[[kn[0],kn[1]+1.5],[an[0],an[1]-2],[an[0],an[1]+.5]],2.4,1.9,'M');t.px([[15,Math.round(kn[1])+4],[15,Math.round(kn[1])+5]],'c');}
  else if(monk){hlimb(t,[[kn[0],kn[1]+2.4],[an[0],an[1]]],2.1,1.7,'S');for(let y=Math.round(kn[1])+3;y<=Math.round(an[1]);y+=2)t.rect(15,y,4,1,'w');}
  else{const c=[kn[0]+(an[0]-kn[0])*.38,kn[1]+(an[1]-kn[1])*.38];hlimb(t,[c,[an[0],an[1]-1],[an[0],an[1]+.6]],2.3,1.9,Bt);t.rect(Math.round(c[0]-2),Math.round(c[1]),5,1,'L');}
  hspan(t,50-lift,[[15,18],[14,18],[14,18]],Bt);t.rect(14,52-lift,5,1,Bs);
  if(heavy)t.px([[16,50-lift]],'c');
  for(let y=0;y<t.h;y++)for(let x=0;x<t.w;x++){const c=t.a[y*t.w+x];if(c)g.a[y*g.w+(left?x:g.w-1-x)]=c;}
}
function hLegsFront(g,L,frame){
  if(L.b==='robe'){
    const lift=[frame===1?2:0,frame===2?2:0];
    [[16,19],[20,23]].forEach((r,i)=>{for(let j=0;j<3;j++)g.rect(r[0],49-lift[i]+j,4,1,'B');g.rect(r[0],52-lift[i],4,1,'b');});
    return;}
  hLegFront(g,L,frame===1?2:0,true);hLegFront(g,L,frame===2?2:0,false);
}
function hArmFront(g,L,left,swing,dx){dx=dx||0;
  const b=L.b,heavy=b==='heavy',monk=b==='monk',robe=b==='robe';
  const t=hnew(),k=heavy?'M':monk?'S':'P';
  const P=[[12.4,20.6],[11.6+dx,26.6+swing],[12+dx,31.4+swing]];
  hlimb(t,P,2.1,1.6,k);
  if(heavy){t.ell(12,19.8,4.4,3.3,'M');t.rect(8,21,9,1,'N');t.px([[10,18],[11,18]],'c');hlimb(t,[[11.8,28.6+swing],[12,31.2+swing]],1.9,1.7,'M');}
  else if(robe){t.ell(12,31.8+swing,2.7,2,'Q');}
  else if(monk){for(let i=0;i<3;i++)t.rect(10,26+swing+i*2,4,1,'w');}
  else t.ell(12,31.6+swing,1.9,1.3,'Q');
  t.rect(10+dx,32+swing+(robe?1:0),3,3,heavy?'N':'S');
  for(let y=0;y<t.h;y++)for(let x=0;x<t.w;x++){const c=t.a[y*t.w+x];if(c)g.a[y*g.w+(left?x:g.w-1-x)]=c;}
}
function hTorsoFront(g,L,view,cls){
  const b=L.b,F=view==='front';
  hsym(g,18,HF_TORSO[b],'P');
  if(b==='light'){
    g.rect(15,28,10,2,'L');g.rect(19,28,2,2,'G');g.rect(14,33,12,1,'Q');
    g.px([[18,18],[19,19],[20,19],[21,18]],F?'Q':'P');
    if(F)g.px([[19,20],[20,22],[19,24]],'q');
  }else if(b==='robe'){
    hsym(g,29,HF_SKIRT,'P');g.rect(11,46,18,2,'Q');
    [[17,32,16,46],[22,32,23,46],[19.5,34,19.5,46],[14,34,13,46],[25,34,26,46]].forEach(q=>g.line(q[0],q[1],q[2],q[3],'p'));
    g.rect(15,27,10,2,'Q');if(F)g.rect(19,27,2,2,'G');
    if(F)g.px([[18,18],[19,19],[20,19],[21,18]],'Q');
  }else if(b==='heavy'){
    hsym(g,19,[14,14,14,14,15,16,17],'M');
    if(F){g.rect(19,19,2,7,'N');g.px([[16,20],[15,21],[24,20]],'c');g.rect(16,24,8,1,'N');}else{g.rect(19,19,2,8,'N');g.rect(15,22,10,1,'N');}
    g.rect(15,27,10,2,'L');g.rect(19,27,2,2,'G');
    g.rect(17,29,6,9,'P');g.rect(17,37,6,1,'Q');
    g.rect(13,29,4,6,'L');g.rect(23,29,4,6,'L');g.rect(13,34,4,1,'k');g.rect(23,34,4,1,'k');
    g.px([[18,18],[19,18],[20,18],[21,18]],'M');
  }else{
    hsym(g,19,[14,14,15,15,15,15],'P');
    if(F){g.px([[19,19],[20,19],[19,20],[20,20],[19,21],[20,21],[19,22]],'S');g.px([[18,19],[21,19],[18,20],[21,20]],'e');}
    g.rect(15,27,10,2,'Q');g.rect(16,29,2,6,'Q');g.rect(22,29,2,6,'Q');
  }
}
function hShieldFront(g,L,view){
  if(!L.sh)return;
  if(view==='back'){
    if(L.sh==='kite'){g.poly([[14.6,21],[25.4,21],[25.4,31],[20,40],[14.6,31]],'M');g.poly([[16,22.4],[24,22.4],[24,30],[20,37],[16,30]],'Z');g.line(20,23,20,36,'G');}
    else{g.ell(20,28,6,6,'M');g.ell(20,28,4.6,4.6,'Z');g.ell(20,28,1.6,1.6,'G');}
    return;}
  if(L.sh==='kite'){g.poly([[25,24],[33.6,23.4],[33.6,31.6],[29.2,40],[25,31.6]],'M');g.poly([[26.4,25.4],[32.2,25],[32.2,31],[29.2,37.4],[26.4,31]],'Z');g.line(29.2,25,29.2,37,'G');g.rect(26,29,6,1,'G');g.px([[26,25],[26,26]],'c');}
  else{g.ell(29.4,30,5.4,5.4,'M');g.ell(29.4,30,4.1,4.1,'Z');g.ell(29.4,30,1.6,1.6,'G');g.px([[26,27],[27,26]],'c');}
}
function hBackFront(g,L,view,pass){
  const F=view==='front',bk=L.back||[];
  if(bk.includes('cape')){
    if(F&&pass==='under'){g.rect(10,19,3,29,'Y');g.rect(27,19,3,29,'Y');g.px([[10,48],[29,48]],'z');}
    if(!F&&pass==='over'){hsh(g,t=>t.poly([[15,18.4],[25,18.4],[27.4,22],[28.6,34],[29.6,48.6],[10.4,48.6],[11.4,34],[12.6,22]],'x'),['Y','Y','z'],{cap:8});[[16,24,14,48],[20,22,20,48],[24,24,26,48]].forEach(q=>g.line(q[0],q[1],q[2],q[3],'z'));g.rect(15,18,10,2,'Q');g.px([[19,19],[20,19]],'G');}
  }
  if(bk.includes('scarf')&&pass==='over'){g.rect(16,16,8,3,'Y');if(F){g.rect(22,19,2,8,'Y');g.px([[22,27],[23,27]],'z');}else g.rect(19,19,2,7,'Y');}
  if(bk.includes('pack')){
    if(F&&pass==='over'){g.line(13.4,19,17.4,29,'L');g.line(26.4,19,22.4,29,'L');g.px([[15,24],[24,24]],'G');}
    if(!F&&pass==='over'){g.rect(13,21,14,12,'Y');g.rect(13,21,14,3,'L');g.rect(18,25,4,2,'G');g.rect(13,30,14,2,'L');g.rect(12,23,1,7,'z');g.rect(27,23,1,7,'z');}
  }
  if((L.wpn==='bow'||L.wpn==='longbow')&&!L.vill&&!bk.includes('pack')){
    if(F&&pass==='under'){hlimb(g,[[27,30],[28.4,22],[29.4,15.4]],1.9,1.9,'L');g.px([[28,13],[29,12],[30,13],[27,11]],'w');g.px([[29,11],[30,12]],'R');}
    if(!F&&pass==='over'){hlimb(g,[[24,33],[26.8,25],[28.4,17]],2.1,2.1,'L');g.rect(26,16,4,1,'N');g.px([[26,13],[28,12],[29,13],[27,11]],'w');g.px([[28,11],[29,12]],'R');g.line(13,19.4,24,31,'L');}
  }
}
function weaponFB(g,L,view){
  const w=L.wpn||'none',F=view==='front',W=WPN[w]||WPN.none;if(w==='none')return;
  if(F){
    if(w==='dagger'||w==='twindagger'){g.rect(10,36,1,6,'M');g.px([[10,43]],'c');g.rect(9,35,3,1,'G');if(w==='twindagger'){g.rect(29,36,1,6,'M');g.px([[29,43]],'c');g.rect(28,35,3,1,'G');}}
    else if(w==='claws'){g.path([[10,35],[9,41]],'M');g.path([[12,35],[12,42]],'M');g.path([[14,35],[15,41]],'M');}
    else if(w==='lute'){g.ell(26.4,36,4.4,3.4,'L');g.ell(26.4,36,1.7,1.5,'K');g.path([[24,34],[19,28],[15,21]],'W',2);g.rect(13,19,3,4,'L');g.px([[12,20],[16,20]],'G');}
    else if(w==='harp'){g.path([[23,22],[29,22],[30,26],[29,36],[24,40],[23,22]],'G',2);g.line(25,24,25,36,'w');g.line(27,24,27,34,'w');}
    else if(w==='bow'||w==='longbow'){const t=w==='bow'?14:19;g.path([[8,32-t],[11,32-t+4],[13,26],[14,32],[13,38],[11,32+t-4],[8,32+t]],'W',2);g.line(8,32-t,8,32+t,'w');g.rect(12,30,3,3,'L');}
    else if(w==='crossbow'){g.rect(9,33,10,3,'W');g.path([[8,31],[8,38]],'M',2);g.rect(11,32,6,1,'M');}
    else if(w==='tome'||w==='grimoire'){W.draw(g,6,w==='tome'?38:41);}
    else W.draw(g,8,32);
    if(w==='fists'){g.rect(28,31,4,4,'w');g.px([[28,31]],'9');}
  }else{
    const diag=(k,t,x0,y0,x1,y1)=>g.line(x0,y0,x1,y1,k,t);
    if(['sword','greatsword','katana'].includes(w)){diag('M',2,14,34,27,10);g.rect(13,33,4,1,'G');}
    else if(['axe','hammer','mace','spear','trident','scythe'].includes(w)||w.startsWith('staff')||w==='rod'){diag(w==='staff_sun'?'G':'W',2,13,38,28,6);
      if(w==='axe')g.poly([[26,5],[31,3],[32,9],[27,10]],'M');if(w==='hammer'||w==='mace')g.ell(28.4,6,3.6,3.2,'M');if(w==='spear'||w==='trident')g.px([[28,5],[29,4],[28,3]],'M');
      if(w==='scythe')g.poly([[26,6],[31,6],[33,10],[28,8]],'M');if(w.startsWith('staff'))g.ell(28.4,5.6,2.8,2.8,'C');}
    else if(w==='bow'||w==='longbow'){g.path([[26,9],[29,14],[29,24],[26,31]],'W',2);g.line(26,9,26,31,'w');}
    else if(w==='crossbow'){g.rect(14,22,12,3,'W');g.rect(13,21,14,1,'M');}
    else if(w==='lute'||w==='harp'){g.ell(26,28,4,5,w==='lute'?'L':'G');g.line(26,24,28,12,'W');}
    else if(w==='grimoire'||w==='tome'){g.rect(23,28,8,7,'J');g.rect(24,29,6,5,'w');g.px([[23,28],[30,28]],'G');}
    else if(w==='dagger'||w==='twindagger'){g.rect(13,31,1,5,'M');g.rect(26,31,1,5,'M');g.px([[13,30],[26,30]],'G');}
    else if(w==='claws'){g.px([[13,31],[14,31],[26,31],[27,31]],'M');}
    else if(w==='fan'){g.ell(26,27,4,3,'Q');}
    else if(w==='fists'){g.rect(8,33,4,4,'w');g.rect(28,33,4,4,'w');}
  }
}
function rigFB(L,view,frame,id){
  const g=hnew(),F=view==='front',cls=heroCls(L,id);
  hBackFront(g,L,view,'under');
  const sw=frame===1?1:frame===2?-1:0;
  if(!F&&L.sh)hShieldFront(g,L,view);
  const upright=F&&!['none','dagger','twindagger','claws','fists','lute','harp'].includes(L.wpn||'none');hArmFront(g,L,true,F?-sw:sw,upright?-2:0);hArmFront(g,L,false,F?sw:-sw);
  hLegsFront(g,L,frame);
  hTorsoFront(g,L,view,cls);
  hNeck(g,view);
  drawFlair(g,L,id,view);drawAcc(g,L,id,view,'body');
  const hd=hHead(L,view,id),bob=frame>0&&!L.vill?1:0;drawAcc(hd,L,id,view,'head');
  for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++){const k=hd.a[y*g.w+x];if(!k)continue;const ty=y+bob;if(ty<g.h)g.a[ty*g.w+x]=k;}
  hBackFront(g,L,view,'over');
  if(F&&L.sh)hShieldFront(g,L,view);
  hTint(g,t=>weaponFB(t,L,view));
  return g;
}


// =================== MONSTERS ===================
// Every foe is drawn facing right. Normal foes on a 40x40 grid, guardians on 60x60.
const MART={
 // ---- guardians (60x60) ----
 thornwarden(g){
  g.path([[14,48],[8,55],[3,57]],'b',3);g.path([[38,48],[44,55],[50,57]],'b',3);
  g.poly([[16,18],[42,16],[46,34],[42,52],[18,52],[12,34]],'B');
  g.path([[14,24],[6,16],[2,8]],'B',4);g.path([[6,16],[2,18]],'B',2);g.path([[2,8],[0,4]],'B',2);
  g.path([[42,26],[50,32],[55,40],[54,48]],'B',5);g.path([[55,40],[59,38]],'B',2);
  g.ell(17,18,6,4,'A');g.ell(40,16,6,4,'A');g.ell(29,13,9,4,'A');
  g.path([[24,8],[22,2],[18,0]],'b',2);g.path([[34,8],[37,2],[41,0]],'b',2);g.ell(18,1,3,2,'A');g.ell(42,1,3,2,'A');
  g.rect(31,24,4,4,'K');g.rect(39,24,4,4,'K');g.rect(32,25,2,2,'E');g.rect(40,25,2,2,'E');
  g.poly([[31,33],[44,32],[42,38],[33,38]],'K');g.ell(37,40,6,3,'A');
  [[14,30],[22,40],[45,42],[20,46],[26,30]].forEach(p=>g.line(p[0],p[1],p[0]+3,p[1]-1,'b'));
  g.path([[12,36],[18,44],[16,50]],'V',2);g.path([[46,24],[49,30]],'V',2);
  [[13,38],[17,45],[48,28]].forEach(p=>g.px([[p[0]-1,p[1]],[p[0]+1,p[1]-1]],'W'));
  return {pal:{B:'#6e4c2c',b:'#4c321c',A:'#5aa04a',K:'#1a0f08',E:'#ffe08a',V:'#2f6a2e',W:'#e8e0c8'},flat:'KEW'};
 },
 drake(g){
  g.ell(30,54,26,4,'C');
  g.path([[10,54],[6,46],[10,38],[20,34],[26,40],[24,50],[30,54]],'B',8);
  g.path([[22,36],[28,26],[34,18]],'B',8);
  g.path([[11,52],[8,44],[12,38]],'A',3);g.path([[25,38],[30,28],[35,20]],'A',3);
  g.ell(40,14,9,7,'B');g.poly([[44,12],[58,15],[57,19],[45,20]],'B');g.poly([[45,20],[56,21],[53,25],[44,22]],'b');
  g.px([[49,19],[52,19],[55,19],[48,21],[51,22]],'W');
  g.rect(42,11,3,3,'E');g.s(44,12,'K');
  g.poly([[34,9],[30,2],[37,6],[36,0],[41,7]],'Y');g.poly([[20,32],[13,26],[22,29]],'b');g.poly([[14,42],[5,40],[13,45]],'b');
  g.px([[4,20],[8,12],[52,32],[56,40],[46,44]],'Y');
  g.px([[16,54],[30,53],[44,55]],'W');
  return {pal:{B:'#2f6aa8',b:'#1f4878',A:'#a8e0f0',C:'#8fd0f0',E:'#fff06a',K:'#1a1020',W:'#ffffff',Y:'#f2d43a'},flat:'EKWY'};
 },
 cinderking(g){
  g.rect(16,40,9,16,'B');g.rect(31,40,9,16,'B');g.rect(14,53,12,4,'b');g.rect(29,53,12,4,'b');
  g.ell(10,30,6,10,'b');g.ell(9,42,6,5,'b');
  g.poly([[12,16],[46,14],[50,28],[44,42],[14,42],[10,28]],'B');
  g.rect(22,4,15,13,'B');g.rect(27,9,3,2,'E');g.rect(32,9,3,2,'E');g.rect(26,13,9,2,'C');
  g.rows(21,0,["M.M..M..M.M","MMMMMMMMMMM","MCMMMCMMMCM"]);
  g.poly([[44,18],[54,26],[54,40],[46,38]],'B');g.ell(51,44,7,6,'b');g.path([[47,40],[50,46],[55,44]],'C');
  [[16,20,22,26,19,32],[34,20,30,28,38,34],[22,34,28,38,26,41]].forEach(p=>g.path([[p[0],p[1]],[p[2],p[3]],[p[4],p[5]]],'C'));
  g.ell(29,27,3,3,'A');
  return {pal:{B:'#4a362e',b:'#33241e',C:'#ff7a2a',A:'#ffe08a',E:'#ffd04a',M:'#9a9aa8'},flat:'CAE'};
 },
 hoarwyrm(g){
  g.poly([[18,24],[2,6],[8,12],[4,2],[16,10],[16,2],[26,18]],'b');
  g.path([[12,44],[4,48],[2,56]],'B',4);
  g.ell(24,38,15,10,'B');g.ell(26,42,10,5,'A');
  g.rect(14,44,5,12,'B');g.rect(30,44,5,12,'B');g.px([[13,56],[15,56],[17,56],[29,56],[31,56],[33,56]],'W');
  g.path([[34,32],[40,22],[44,16]],'B',7);
  g.ell(47,13,6.5,5.5,'B');g.poly([[50,11],[59,15],[52,18]],'B');g.rect(48,10,3,2,'E');
  g.path([[44,9],[41,3],[42,0]],'W',2);g.path([[48,8],[49,2],[52,0]],'W',2);
  g.poly([[30,22],[44,8],[42,18],[52,14],[40,28]],'b');
  [[16,30],[22,28],[28,29],[34,26]].forEach(p=>g.poly([[p[0]-2,p[1]+2],[p[0],p[1]-4],[p[0]+2,p[1]+2]],'C'));
  g.px([[53,17],[55,17]],'W');g.px([[56,18],[58,20],[55,21]],'C');
  return {pal:{B:'#bfe0f0',b:'#7ab0d0',A:'#ffffff',C:'#8fe0ff',W:'#f4ffff',E:'#1a5aa8'},flat:'E'};
 },
 ysolde(g){
  g.poly([[24,6],[14,8],[6,16],[10,18],[16,14],[22,16]],'Y');
  g.poly([[24,18],[36,18],[42,40],[48,56],[30,52],[14,56],[18,40]],'B');
  g.poly([[30,18],[36,18],[42,40],[48,56],[36,53]],'b');
  g.rect(26,16,8,4,'G');
  g.ell(30,10,6,6.5,'A');g.poly([[23,6],[33,3],[37,8],[24,14],[20,20]],'Y');g.rect(31,10,2,2,'E');g.rect(34,10,1,2,'E');
  g.line(36,22,46,24,'B',3);g.ell(47,24,2,2,'A');
  g.line(48,8,48,56,'G');g.ell(48.5,6,3.5,3.5,'C');g.ell(48.5,6,1.8,1.8,'Y');
  g.path([[54,14],[57,20],[54,22],[58,30]],'Y');g.path([[8,30],[4,36],[7,38],[3,46]],'Y');
  g.line(24,24,22,34,'A',2);
  return {pal:{B:'#383a72',b:'#26285a',A:'#e8cfc0',G:'#f0c860',Y:'#fff2a8',E:'#3ad0ff',C:'#f2d43a'},flat:'EY',glow:'#fff2a8'};
 },
 dimmer(g){
  g.poly([[24,12],[36,12],[42,30],[46,58],[14,58],[18,30]],'B');
  g.path([[36,20],[48,28],[54,40],[52,50]],'B',4);g.path([[24,20],[14,30],[8,40],[10,48]],'B',4);
  g.path([[52,50],[56,54]],'B',2);g.path([[52,50],[50,56]],'B',2);g.path([[10,48],[6,52]],'B',2);g.path([[10,48],[12,54]],'B',2);
  g.ell(30,10,7,8,'B');g.ell(31,11,4,5,'K');g.rect(29,10,2,2,'W');g.rect(33,10,2,2,'W');
  [[22,2,'C'],[26,0,'D'],[30,-1,'F'],[34,0,'H'],[38,2,'I']].forEach(p=>{g.ell(p[0]+.5,p[1]+1.5,1.8,1.8,p[2]);});
  [[24,30],[34,36],[20,44],[38,48],[28,52],[30,24],[42,40]].forEach(p=>g.s(p[0],p[1],'A'));
  g.ell(30,38,4,5,'K');g.px([[30,37],[29,39],[31,40]],'F');
  return {pal:{B:'#16102a',K:'#05030a',W:'#ffffff',A:'#e8e0ff',C:'#e8553a',D:'#5fc9a0',F:'#f6e7a8',H:'#3f8fe0',I:'#f2c93a'},flat:'KWACDFHI',rim:'#6a4aa8',glow:'#8b5fd0'};
 }
};
// FAMILY1-BEGIN
// =================== FOE FRAME API + FAMILY 1 (v0.13 art pass, docs/art-style.md) ===================
// A MART drawing may take a second argument f = {t:'idle'|'atk'|'hit', i:0|1}; monCanvas(art,f) paints that frame and caches it per art+frame
// (key art+'#'+t+i). No f means idle 0, the old look. Wrappers that call MART[base](g) without f (night, realm, echo, pet recolours) still get the
// right frame: monCanvas sets MFR while it draws, and mfr() falls back to it. A drawing marked .fr (MFRAME below) has real frames; battle.js
// drawUnit only swaps frames for those. Frames are functions of f only: no Math.random in sprite code.
let MFR=null;
const MFRAME=new Set();
function mfr(f){f=f||MFR||{};const t=f.t==='atk'||f.t==='hit'?f.t:'idle',i=f.i?1:0;return {t,i,atk:t==='atk',hit:t==='hit',b:t==='idle'&&i===1};}
function monHasFrames(art){return MFRAME.has(art)||!!(MART[art]&&MART[art].fr);}
const MFCACHE={};
function monFrameKey(art,f){f=f||{};return art+'#'+(f.t==='atk'||f.t==='hit'?f.t:'idle')+(f.i?1:0);}
function monFramed(art,f,make){const k=monFrameKey(art,f);if(MFCACHE[k])return MFCACHE[k];const was=MFR;MFR=f||null;try{return MFCACHE[k]=make();}finally{MFR=was;}}
// a body mass in two hand blocked tones: shade key k everywhere, light key K on the top left (rule 2)
function sph(g,cx,cy,rx,ry,K,k){g.ell(cx,cy,rx,ry,k);g.ell(cx-rx*.2,cy-ry*.24,rx*.76,ry*.68,K);}
// an ellipse k drawn only where it is also inside the ellipse b (moss, plates, caps that follow a body's contour)
function ellIn(g,cx,cy,rx,ry,bx,by,brx,bry,k){for(let y=Math.floor(cy-ry-1);y<=Math.ceil(cy+ry+1);y++)for(let x=Math.floor(cx-rx-1);x<=Math.ceil(cx+rx+1);x++){const dx=(x+.5-cx)/rx,dy=(y+.5-cy)/ry,ex=(x+.5-bx)/brx,ey=(y+.5-by)/bry;if(dx*dx+dy*dy<=1&&ex*ex+ey*ey<=.97)g.s(x,y,k);}}
// a muzzle: upper jaw, lower jaw (drops by op in a lunge, over a dark gape with tongue and fangs). x,y = top of the snout base, L = length
function maw(g,x,y,L,op,kU,kL){
  if(op){g.poly([[x,y+3.2],[x+L,y+3],[x+L-.6,y+3.4+op],[x,y+5.4]],'K');g.rect(Math.round(x+1),Math.round(y+3.6+op*.5),Math.round(L-3),1,'R');}
  g.poly([[x,y+3.4+(op?op*.2:0)],[x+L-.7,y+3.6+op],[x+L-1.8,y+5+op],[x,y+5.6+(op?op*.2:0)]],kL);
  g.poly([[x,y],[x+L,y+1.3],[x+L-.6,y+3.4],[x,y+3.6]],kU);g.rect(Math.round(x+L-1.4),Math.round(y+.4),2,2,'K');
  if(op){g.px([[x+L-3,y+3.8],[x+L-5,y+3.8],[x+L-3.5,y+2.6+op]],'W');}
}
function clr(g,x,y,w,h){return g.rect(x,y,w,h,0);}
function limb(g,x0,y0,x1,y1,k,t,paw){g.path([[x0,y0],[x1,y1]],k,t);if(paw)g.rect(Math.round(x1)-1,Math.round(y1),3,1,paw);}
// family 2 helpers: wing() is a feathered or membrane wing (shoulder S, tip T, rear root R, n feathers, lit leading edge kl); returns the feather tips.
// tend() is a wavy tendril from (x,y) hanging len px, swaying amp with phase ph and drifting by dr, thick t0 then 1.
function lerp2(a,b,t){return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];}
function wing(g,S,T,R,k,kl,n,notch){n=n||4;notch=notch===undefined?2.4:notch;
  if(typeof R==='number'){const dx=T[0]-S[0],dy=T[1]-S[1],l=Math.hypot(dx,dy)||1;let px=-dy/l,py=dx/l;if(py<0){px=-px;py=-py;}R=[S[0]+px*R,S[1]+py*R];}// a number = wing width: the root sits that far from S, perpendicular to S-T on the lower side
  const mid=[(S[0]+T[0])/2+(T[1]-S[1])*.08,(S[1]+T[1])/2-1.5],P=[S,mid,T],tips=[T];
  for(let j=1;j<=n;j++){const q=lerp2(T,R,(j-.5)/n),dx=S[0]-q[0],dy=S[1]-q[1],l=Math.hypot(dx,dy)||1;P.push([q[0]+dx/l*notch,q[1]+dy/l*notch]);const t=lerp2(T,R,j/n);P.push(t);tips.push(t);}
  g.poly(P,k);g.path([S,mid,T],kl,1.5);return tips;}
function tend(g,x,y,len,amp,ph,k,t0,dr){const P=[];for(let i=0;i<=5;i++){const u=i/5;P.push([x+(dr||0)*u+Math.sin(u*4.2+ph)*amp*u,y+len*u]);}
  for(let i=0;i<5;i++)g.line(P[i][0],P[i][1],P[i+1][0],P[i+1][1],k,i<2?t0:1);return P[5];}
// family 3 helpers: slab() is a plated block (lit key K top left, shade key k right and bottom); spear() a 2px shaft with a leaf head (returns the tip)
function slab(g,x,y,w,h,K,k){g.rect(x,y,w,h,k);if(w>2&&h>2)g.rect(x,y,w-1,h-1,K);return g;}
function spear(g,x0,y0,x1,y1,k,hk,hl){hl=hl||5;const dx=x1-x0,dy=y1-y0,l=Math.hypot(dx,dy)||1,ux=dx/l,uy=dy/l,px=-uy,py=ux;g.line(x0,y0,x1,y1,k,2);
  g.poly([[x1+px*1.9,y1+py*1.9],[x1+ux*hl*.55+px*2,y1+uy*hl*.55+py*2],[x1+ux*hl,y1+uy*hl],[x1+ux*hl*.55-px*2,y1+uy*hl*.55-py*2],[x1-px*1.9,y1-py*1.9]],hk);return [Math.round(x1+ux*hl),Math.round(y1+uy*hl)];}
// family 4 helpers: eye() the standard foe eye (a 2x2 lamp k with a white glint; a closed 3x1 line K when hit); bolt() a zigzag lightning path from (x,y) down len px
// (dx = how far it kinks); core() a flat glow disc (ring kO, middle kI, white when hit); anchor() an iron anchor from its ring (x0,y0) to its flukes (x1,y1);
// blade() a straight sword from the hilt (x0,y0) to the tip (x1,y1) with a cross guard. Each returns its far point.
function eye(g,x,y,F,k){x=Math.round(x);y=Math.round(y);if(F&&F.hit){g.rect(x,y+1,3,1,'K');return;}g.rect(x,y,2,2,k||'E');g.s(x,y,'W');}
function bolt(g,x,y,len,dx,k,t){const P=[[x,y],[x+dx,y+len*.34],[x-dx*.4,y+len*.46],[x+dx*.7,y+len]];g.path(P,k,t||2);return P[3];}
function core(g,cx,cy,rx,ry,kO,kI,hit){g.ell(cx,cy,rx,ry,kO);g.ell(cx,cy,Math.max(.8,rx-1.5),Math.max(.8,ry-1.5),hit?'W':kI);}
function anchor(g,x0,y0,x1,y1,k,kl){const dx=x1-x0,dy=y1-y0,l=Math.hypot(dx,dy)||1,ux=dx/l,uy=dy/l,px=-uy,py=ux,at=(t,o)=>[x0+dx*t+px*o,y0+dy*t+py*o];
  g.ell(x0,y0,1.8,1.8,k);g.ell(x0,y0,.8,.8,0);g.line(x0+ux*1.6,y0+uy*1.6,x1,y1,k,2);
  const a=at(.2,-4.5),b=at(.2,4.5);g.line(a[0],a[1],b[0],b[1],k,2);g.s(Math.round(a[0]),Math.round(a[1])-1,kl);g.s(Math.round(b[0]),Math.round(b[1])+1,kl);
  const f1=at(1,-5.5),f2=at(1,5.5),c1=at(.86,-6.2),c2=at(.86,6.2);g.path([[x1,y1],f1,c1],k,2);g.path([[x1,y1],f2,c2],k,2);
  g.poly([[c1[0]+px*1.5,c1[1]+py*1.5],[c1[0]-ux*2.6-px*.5,c1[1]-uy*2.6-py*.5],[c1[0]-px*1.2,c1[1]-py*1.2]],k);g.poly([[c2[0]-px*1.5,c2[1]-py*1.5],[c2[0]-ux*2.6+px*.5,c2[1]-uy*2.6+py*.5],[c2[0]+px*1.2,c2[1]+py*1.2]],k);
  g.line(a[0],a[1],b[0],b[1],kl,1);return [Math.round(x1),Math.round(y1)];}
function blade(g,x0,y0,x1,y1,k,kl,kg){const dx=x1-x0,dy=y1-y0,l=Math.hypot(dx,dy)||1,ux=dx/l,uy=dy/l,px=-uy,py=ux;
  g.poly([[x0+ux*3+px*1.7,y0+uy*3+py*1.7],[x1-ux*3+px*1.7,y1-uy*3+py*1.7],[x1,y1],[x1-ux*3-px*1.7,y1-uy*3-py*1.7],[x0+ux*3-px*1.7,y0+uy*3-py*1.7]],k);
  g.line(x0+ux*4-px*.7,y0+uy*4-py*.7,x1-ux*2-px*.7,y1-uy*2-py*.7,kl);g.line(x0-px*4,y0-py*4,x0+px*4,y0+py*4,kg,2);g.line(x0-ux*3,y0-uy*3,x0,y0,kg,2);return [Math.round(x1),Math.round(y1)];}
Object.assign(MART,{
 // ---- Mossling: a mossy boulder slime with a sprout. Squash and stretch: A wide, B tall; lunge stretches forward and opens its mouth
 mossling(g,f){const F=mfr(f);
  let w=12,h=10,cx=19;if(F.b){w=10.8;h=11.6;}if(F.atk){w=13.4;h=9.2;cx=20.5;}if(F.hit){w=13.6;h=7.8;cx=17.5;}
  const cy=37-h,top=cy-h,my=cy-h*.38;
  sph(g,cx,cy,w,h,'D','d');
  g.px([[cx-w*.55,cy+h*.5],[cx-w*.15,cy+h*.62],[cx+w*.4,cy+h*.64],[cx-w*.75,cy+h*.2]],'r');
  ellIn(g,cx-.5,my-1,w*.98,h*.62,cx,cy,w,h,'m');ellIn(g,cx-w*.2-.5,my-h*.14-1,w*.74,h*.46,cx,cy,w,h,'M');
  [[-.78,2],[-.4,3],[.05,2],[.5,3],[.82,2]].forEach(([o,n])=>g.rect(Math.round(cx+o*w*.86),Math.round(my+h*.4)-1,2,n,'m'));
  const sx=Math.round(cx+1+(F.hit?-3:F.b?1:F.atk?2:0)),sy=Math.round(top+3),lean=F.hit?-2:F.atk?1:0;
  g.line(sx,sy,sx+lean,sy-5,'S');g.poly([[sx+lean,sy-3],[sx+lean-4,sy-5],[sx+lean-1,sy-6]],'M');g.poly([[sx+lean,sy-4],[sx+lean+4,sy-6],[sx+lean+1,sy-7]],'M');
  g.rect(sx+lean-1,sy-8,3,2,'F');g.s(sx+lean,sy-9,'F');g.s(sx+lean,sy-8,'Y');
  const mx=Math.round(cx-w*.64),my2=Math.round(cy-h*.52);
  g.rect(mx,my2,2,3,'W');g.ell(mx+1,my2-.5,3,2,'X');g.px([[mx,my2-1],[mx+2,my2-1]],'W');
  const ex=Math.round(cx+w*.3),ey=Math.round(cy+h*.02);g.ell(ex+3.5,ey+1.6,6,3.6,'f');
  if(F.hit){g.rect(ex,ey+1,3,1,'K');g.rect(ex+5,ey+1,3,1,'K');g.rect(ex+2,ey+4,3,1,'r');}
  else{g.rect(ex,ey,2,2,'K');g.s(ex,ey,'W');g.rect(ex+5,ey,2,2,'K');g.s(ex+5,ey,'W');
   if(F.atk){g.rect(ex,ey+3,8,3,'K');g.rect(ex+1,ey+5,6,1,'F');g.px([[ex+1,ey+3],[ex+6,ey+3]],'W');g.px([[ex+10,ey+2],[ex+11,ey+5],[ex+9,ey+7]],'Y');}
   else g.rect(ex+2,ey+4,3,1,'r');}
  return {pal:{f:'#c9a46a',D:'#a8824e',d:'#6a4e30',r:'#4a361e',M:'#8ccf62',m:'#4a8a3a',S:'#3f7f32',F:'#f08ab0',Y:'#ffe08a',X:'#d8403a',W:'#f4efe0',K:'#1a1020'},flat:'KWFY',a:{x:cx,y:cy,w,h,top,sx,sy,ex,ey}};
 },
 // ---- Dewtoad / Bog Toad family: wide squat toad, eye turret, throat sac. Wide A, tall B; the lunge lashes the tongue
 dewtoad(g,f){const F=mfr(f);
  let bw=13,bh=8,by=29,hx=27,hy=22,sac=1.6;
  if(F.b){bw=12.4;bh=8.9;by=28.1;hx=27;hy=20.8;sac=2.5;}if(F.atk){bw=13.8;bh=7.4;by=29.6;hx=29.4;hy=22.6;sac=.4;}if(F.hit){bw=13.8;bh=7;by=30;hx=25.6;hy=23.8;sac=.8;}
  const bx=F.hit?18:19;
  // hind leg: folded haunch, long foot (pushed out in the lunge)
  if(F.atk){limb(g,10,31,5,36,'b',4,'D');g.rect(2,36,5,1,'D');}
  sph(g,11,by+1,6.5,5.5,'B','b');g.rect(4,35,11,2,'b');g.px([[4,36],[6,36],[8,36]],'D');
  sph(g,bx,by,bw,bh,'B','b');
  g.ell(bx+3,by+3.4,8.5,4,'A');
  limb(g,hx-3,by+2,hx-1,36,'B',3);g.px([[hx-3,36],[hx-1,36],[hx+1,36]],'D');
  g.ell(hx+2.5,hy+5.4,3+sac*.6,sac+.9,'A');
  sph(g,hx,hy,8,6.5,'B','b');
  sph(g,hx-1.5,hy-6,3.7,3.4,'B','b');
  const ex=Math.round(hx-3.5),ey=Math.round(hy-8.5);
  if(F.hit){g.rect(ex,ey+1,4,1,'K');g.rect(ex,ey,4,1,'b');}
  else{g.rect(ex,ey,4,3,'W');g.rect(ex+1,ey+1,2,2,'K');g.s(ex+1,ey+1,'W');if(F.atk)g.rect(ex,ey-1,4,1,'b');}
  if(F.atk){g.poly([[hx+1,hy+2],[hx+9.5,hy-1.5],[hx+9.5,hy+6.5],[hx+1,hy+5]],'K');g.rect(hx+1,hy+4,8,1,'F');g.px([[hx+4,hy+2],[hx+7,hy+1]],'W');
   g.path([[hx+6,hy+4],[hx+9,hy+3]],'T',2);}
  else if(F.hit){g.path([[hx+1,hy+4],[hx+4,hy+3],[hx+7.5,hy+5]],'K');}
  else g.path([[hx+1,hy+3],[hx+4,hy+4],[hx+7.5,hy+2.5]],'K');
  g.ell(bx-7,by-4.5,2.1,1.5,'D');g.ell(bx-1,by-6,1.8,1.3,'D');g.ell(bx+5,by-4,1.6,1.2,'D');g.ell(bx-5,by+1,1.7,1.3,'D');
  [[-9,-4],[-3,-7],[3,-6],[8,-3]].forEach(([ox,oy])=>{g.s(bx+ox,by+oy,'Q');g.s(bx+ox,by+oy-1,'W');});
  return {pal:{B:'#4fa6a4',b:'#2f747c',A:'#cfe8d4',D:'#1f5a72',T:'#e9788a',F:'#e9788a',Q:'#4aa8ff',W:'#f4efe0',K:'#1a1020'},flat:'WKQTF',a:{bx,by,bw,bh,hx,hy,ex,ey}};
 },
 // ---- Cinder Pup: small body, big head, tall pointed ears, flame tail held up. Idle B lifts chest and head; lunge reaches the forelegs and opens the jaws
 cinderpup(g,f){const F=mfr(f),u=F.b?-1:0;
  let hx=27.5,hy=20+u,bx=16.5,by=27+(F.b?-.4:0);if(F.atk){hx=29.5,hy=22,bx=18,by=28;}if(F.hit){hx=25.5,hy=18.5,bx=16,by=27.5;}
  const r=F.atk?3:0,bk=F.atk?-2:0;
  g.path([[bx-8,by-1],[bx-12,by-5],[bx-13,by-10]],'B',3.4);g.path([[bx-7,by+.5],[bx-11,by-3]],'b',1);
  const tx=bx-13,ty=by-10,fl=F.i?[[-2,0],[0,-6],[.8,-3],[3,-8],[4.5,-2.5],[4.5,0]]:[[-3,0],[-2,-6],[-.5,-3],[1.5,-9],[3.5,-3],[4.5,0]];
  g.poly(fl.map(p=>[tx+p[0]+(F.hit?-1:0),ty+p[1]-(F.atk?1:0)]),'C');g.poly([[tx-1,ty],[tx+.5,ty-4],[tx+2,ty]],'R');g.s(tx+.5,ty-1,'Y');
  limb(g,bx-5,by+3,bx-8+bk,36,'b',3,'D');limb(g,bx+3,by+3,bx+3+r,36,'b',3,'D');
  sph(g,bx,by,8.8,5.3,'B','b');sph(g,bx+6.5,by+1,4.8,4.6,'B','b');g.ell(bx+7.5,by+2.2,2.4,2.8,'A');
  g.poly([[bx+4,by-4.5],[hx-3,hy-3.5],[hx+2.5,hy+3.5],[bx+9,by+3]],'B');
  g.px([[bx-3,by-3],[bx+1,by-4],[bx-6,by],[bx+3,by+1]],'b');
  limb(g,bx-4,by+3,bx-3+bk,36,'B',3,'D');limb(g,bx+6,by+3,bx+7+r,36,'B',3,'D');
  if(F.hit)g.poly([[hx+1,hy-4],[hx-3,hy-9],[hx+4,hy-4.5]],'b');else g.poly([[hx+1.5,hy-4.5],[hx+5.5,hy-11],[hx+6,hy-3.5]],'b');
  sph(g,hx,hy,6.2,5.6,'B','b');maw(g,hx+3,hy-1.8,6.4,F.atk?4:0,'B','b');g.ell(hx+4.5,hy+2.8,2.4,1.5,'A');
  if(F.hit){g.poly([[hx-4,hy-3.5],[hx-10,hy-5.5],[hx-3.5,hy]],'B');g.poly([[hx-4,hy-3.5],[hx-8,hy-5],[hx-3.5,hy-1.5]],'R');}
  else{g.poly([[hx-4.5,hy-3.5],[hx-4,hy-12.5],[hx+1.5,hy-4.5]],'B');g.poly([[hx-3.6,hy-4.5],[hx-3.2,hy-9.5],[hx-.2,hy-5]],'R');}
  const ex=Math.round(hx+1.5),ey=Math.round(hy-2.5);
  if(F.hit){g.rect(ex,ey+1,3,1,'K');g.s(ex+3,ey,'K');}else{g.rect(ex,ey,2,2,'E');g.s(ex+1,ey+1,'K');g.s(ex,ey,'W');}
  g.px(F.i?[[tx-1,ty-10],[tx+5,ty-7],[tx+7,ty-12]]:[[tx+1,ty-12],[tx-3,ty-8],[tx+6,ty-9]],'C');
  return {pal:{B:'#d9824c',b:'#a8522e',A:'#f2d9b0',C:'#ffd23a',R:'#ff6a2a',Y:'#fff0b0',E:'#ffc83a',K:'#1a1020',D:'#5a2a14',W:'#ffffff'},flat:'EKCRYW',a:{bx,by,hx,hy,ex,ey,tx,ty}};
 },
 // ---- Frost Wolf: long legged, lean, crystal mane along the back, bushy low tail. Lunge: jaws wide, mane flared
 frostwolf(g,f){const F=mfr(f),u=F.b?-1:0;
  let hx=28,hy=17+u,bx=16.5,by=24+(F.b?-.4:0);if(F.atk){hx=30.5,hy=19.5,bx=18,by=25;}if(F.hit){hx=26,hy=15.5,bx=15.5,by=24.5;}
  const r=F.atk?3:0,bk=F.atk?-2:0;
  g.path([[bx-9,by-1],[bx-13,by+2],[bx-14,by+8]],'B',4);g.ell(bx-14,by+9,2.2,2.6,'A');g.px([[bx-12,by+3],[bx-13,by+5]],'b');
  limb(g,bx-6,by+3,bx-8+bk,36,'b',3,'b');limb(g,bx+4,by+3,bx+4+r,36,'b',3,'b');
  g.rect(Math.round(bx-9+bk),35,4,1,'D');g.rect(Math.round(bx+3+r),35,4,1,'D');
  sph(g,bx,by,11,5.2,'B','b');sph(g,bx+8,by+1,4.6,4.8,'B','b');g.ell(bx+9.5,by+2.4,2.4,3.2,'A');g.px([[bx+10,by+1],[bx+9,by+4],[bx+11,by+5]],'A');
  g.poly([[bx+6,by-4.5],[hx-3,hy-3],[hx+2,hy+3.5],[bx+10,by+3]],'B');
  limb(g,bx-5,by+3,bx-5+bk,36,'B',3);limb(g,bx+7,by+3,bx+8+r,36,'B',3);
  g.px([[bx-5+bk,34],[bx+8+r,34]],'A');g.rect(Math.round(bx-6+bk),36,4,1,'D');g.rect(Math.round(bx+7+r),36,4,1,'D');
  [-7,-3.5,0,3.5,7].forEach((o,n)=>{const x=bx+o,top=by-5.2*Math.sqrt(1-(o/11)**2),hh=[4.5,6,7,6.5,5][n]+(F.hit?-2:F.atk?1:0)+(F.i&&n%2?1:0);
   g.poly([[x-2,top+1.8],[x+.5+(F.atk?-1.5:0)+(F.hit?-2:0),top-hh],[x+2.5,top+1.8]],'c');g.poly([[x-1.2,top+1.5],[x+.3+(F.atk?-1.2:0)+(F.hit?-1.5:0),top-hh+1],[x+.8,top+1.5]],'C');});
  if(F.hit)g.poly([[hx+1,hy-3.5],[hx-4,hy-7],[hx+4,hy-4]],'b');else g.poly([[hx+1,hy-3.5],[hx+4,hy-9],[hx+5.5,hy-3.5]],'b');
  sph(g,hx,hy,5.9,5.1,'B','b');maw(g,hx+3,hy-1.8,6.4,F.atk?4:0,'B','b');g.ell(hx+5,hy+2.2,2.8,1.2,'A');
  g.poly([[hx+.5,hy+3.5],[hx+3,hy+7.5],[hx+5.5,hy+3.5]],'A');
  if(F.hit){g.poly([[hx-3.5,hy-3],[hx-9.5,hy-4],[hx-3,hy+.5]],'B');g.poly([[hx-3.5,hy-3],[hx-7.5,hy-3.5],[hx-3,hy-1]],'c');}
  else{g.poly([[hx-3.5,hy-3],[hx-3,hy-10],[hx+1,hy-3.5]],'B');g.poly([[hx-2.6,hy-4],[hx-2.4,hy-8],[hx,hy-4]],'c');}
  const ex=Math.round(hx+1.5),ey=Math.round(hy-1.8);
  if(F.hit){g.rect(ex,ey+1,3,1,'K');}else{g.rect(ex,ey,2,2,'E');g.s(ex+1,ey+1,'K');g.s(ex,ey,'W');}
  return {pal:{B:'#d4e2ec',b:'#9ab4c8',A:'#ffffff',C:'#cfeeff',c:'#7fbcdc',E:'#3ad0ff',K:'#1a1020',W:'#ffffff',D:'#6a7e92',R:'#c0586a'},flat:'EKWC',a:{bx,by,hx,hy,ex,ey}};
 },
 // ---- Brine Crawler: wide and low, six legs in near and far pairs, eyestalks, two claws forward. Idle B shifts every other leg; lunge thrusts the claws open
 crawler(g,f){const F=mfr(f),u=F.b?-1:0;
  let bx=18,by=28.5+u,r=0,cy=0;if(F.atk){bx=19,by=29.5,r=3;}if(F.hit){bx=17,by=30,r=-3,cy=3;}
  const leg=(x,d,k,n)=>{const o=F.b&&n%2?1:0,kx=x+d*4,ky=by+.5,fx=x+d*7+o;limb(g,x,by+2.5,kx,ky,k,2);limb(g,kx,ky,fx,36,k,2);g.rect(Math.round(fx)-1,36,3,1,'D');};
  leg(bx-7,-1,'b',0);leg(bx+3,1,'b',1);leg(bx+8,1,'b',2);
  sph(g,bx,by,11,6,'B','b');g.ell(bx+.5,by+3.4,8.5,2.4,'A');
  g.poly([[bx-10.5,by-1],[bx-14,by-4.5],[bx-9.5,by-3.5]],'B');
  g.px([[bx-8,by-3],[bx-3,by-5],[bx+2,by-5],[bx-5,by-.5],[bx+4,by-.5]],'b');g.px([[bx-6,by-2],[bx,by-3],[bx+5,by-2]],'A');
  leg(bx-9,-1,'B',1);leg(bx-4,-1,'B',2);leg(bx+6,1,'B',0);
  const sh=F.hit?2:5;[[bx+3,0],[bx+6.5,1]].forEach(([x,d])=>{x=Math.round(x);g.line(x,by-5,x,by-5-sh+d,'b',1);const ey=by-7-sh+d;
   if(F.hit)g.rect(x-1,ey+1,3,1,'K');else{g.rect(x-1,ey,2,2,'K');g.s(x-1,ey,'W');}});
  const qx=Math.round(bx+12+r*.7),qy=Math.round(by-9+(F.b?-1:0)+cy*.6),op=F.atk?3.4:F.hit?0:1.4;
  const claw=(x,y,s,K,k,o)=>{g.poly([[x+1,y-1.5*s],[x+7*s,y-1.6*s-o],[x+7*s,y-.2*s-o*.7],[x+2*s,y+.9*s]],K);g.poly([[x+1,y+1.2*s],[x+7*s,y+1.3*s+o*.3],[x+6*s,y+3.2*s+o*.3],[x+1,y+3.4*s]],k);sph(g,x,y+1.2*s,3.6*s,3*s,K,k);};
  g.path([[bx+9,by+1],[qx-5,qy+8]],'b',2);claw(qx-7,qy+8,.8,'b','b',op*.5);
  g.path([[bx+8,by-1],[bx+10+r*.3,by-5+cy*.4],[qx-1,qy+2]],'B',3);
  claw(qx,qy,1.1,'B','b',op);
  g.px([[qx+8,qy-2-op],[qx+8,qy+2]],'A');
  return {pal:{B:'#3d86b8',b:'#25587f',A:'#a8e0f0',W:'#f4efe0',K:'#1a1020',D:'#173a58'},flat:'WK',a:{bx,by,qx,qy}};
 },
 // ---- Shellguard: domed plated shell with bone spikes, stout legs, a long neck. Idle B lifts the shell and the head; lunge stretches the neck and bites; a hit pulls the head in
 shellguard(g,f){const F=mfr(f);
  let cx=15.5,cy=22.5,hx=31.5,hy=24,r=0;if(F.b){cy=21.5;hy=23;}if(F.atk){cx=16.5;hx=34.2;hy=24.6;r=2;}if(F.hit){cx=14.8;cy=23;hx=28.3;hy=25.6;r=-1;}
  // head and neck first: the shell closes over the back of the neck
  sph(g,hx-3.4,hy+1.4,4.2,3.6,'X','x');sph(g,hx,hy,4.6,4,'X','x');g.poly([[hx+3,hy-1.5],[hx+7,hy+.5],[hx+6.5,hy+3.2],[hx+3,hy+3.5]],'X');
  const ex=Math.round(hx+1.5),ey=Math.round(hy-2);
  if(F.hit){g.rect(ex,ey+1,3,1,'K');}else{g.rect(ex,ey,2,2,'K');g.s(ex,ey,'W');g.rect(ex-1,ey-1,4,1,'x');}
  if(F.atk){g.poly([[hx+2,hy+1],[hx+8,hy-.5],[hx+8,hy+5.5],[hx+2.5,hy+4.5]],'K');g.rect(hx+3,hy+4,5,1,'F');g.px([[hx+4,hy+1],[hx+7,hy+.5],[hx+5,hy+4]],'W');}
  else g.path([[hx+3,hy+2.6],[hx+6.5,hy+2.2]],'K');
  g.poly([[cx-12.5,27],[cx-16,30],[cx-12,30.5]],'X');
  // shell
  sph(g,cx,cy,13.5,10.8,'B','b');clr(g,0,29,40,10);
  g.path([[cx-7,cy-7],[cx-5.5,cy+1],[cx-6.5,cy+6]],'r');g.path([[cx-.5,cy-10],[cx+.5,cy-2],[cx-1.5,cy+6]],'r');g.path([[cx+7,cy-6],[cx+5.5,cy+1],[cx+6.5,cy+6]],'r');
  g.path([[cx-11,cy-1],[cx-5.5,cy+1]],'r');g.path([[cx+.5,cy-2],[cx+5.5,cy+1],[cx+11,cy]],'r');g.path([[cx-4,cy-8],[cx+.5,cy-6],[cx+6,cy-6]],'r');
  g.ell(cx-4,cy-4,2.2,1.5,'M');g.ell(cx+3.5,cy+3,1.8,1.3,'M');g.ell(cx-8.5,cy+4,1.6,1.1,'M');g.px([[cx+9,cy-3],[cx+10,cy+3]],'L');
  [-6,0,6].forEach((o,n)=>{const x=cx+o,top=cy-10.8*Math.sqrt(1-(o/13.5)**2),hh=[4,5.5,4.5][n];g.poly([[x-2.2,top+1.8],[x+.2,top-hh],[x+2.4,top+1.8]],'w');g.poly([[x-1.4,top+1.6],[x,top-hh+1],[x+.6,top+1.6]],'W');});
  g.rect(Math.round(cx-12),28,25,2,'A');g.rect(Math.round(cx-12),30,25,1,'a');
  // legs (far pair dark), drawn over the rim
  [[cx-5,'x'],[cx+8+r,'x']].forEach(([x,k])=>{g.rect(Math.round(x),30,5,6,k);g.rect(Math.round(x)-1,35,7,2,k);});
  [[cx-10,0],[cx+5+r,r]].forEach(([x])=>{x=Math.round(x);g.rect(x,29,6,8,'x');g.rect(x,29,4,7,'X');g.rect(x-1,35,8,2,'x');g.rect(x-1,35,4,1,'X');g.px([[x,36],[x+3,36],[x+6,36]],'W');});
  return {pal:{B:'#9a8a54',b:'#5e5230',r:'#43391f',L:'#c2ae72',A:'#d8c890',a:'#a89a64',M:'#6aa04a',W:'#f2ecd6',w:'#b8b098',X:'#4f9c8c',x:'#2f6a62',F:'#e9788a',K:'#1a1020'},flat:'KWF',a:{cx,cy,hx,hy,top:cy-10.8}};
 },
 // ---- Magma Slime: an obsidian crust with a molten crater and glowing cracks. Idle A wide, B tall with a rising bubble; lunge stretches forward and erupts; a hit squashes it and flashes the cracks
 magmaslime(g,f){const F=mfr(f);
  let w=12.5,h=9.5,cx=19;if(F.b){w=11.2;h=11;}if(F.atk){w=13.6;h=8.6;cx=20.5;}if(F.hit){w=14;h=7.2;cx=18;}
  const cy=37-h,ty=cy-h+1,hot=F.hit?'W':'Y';
  sph(g,cx,cy,w,h,'B','b');
  g.px([[cx-8,cy-2],[cx-6,cy+4],[cx+6,cy+5],[cx+8,cy-3],[cx-3,cy+7]],'n');
  if(F.atk){g.poly([[cx-4,ty+2],[cx-5.5,ty-5],[cx-2,ty-1],[cx-.5,ty-8],[cx+2,ty-1],[cx+5,ty-5],[cx+4.5,ty+2]],'C');g.poly([[cx-2,ty+1],[cx-.5,ty-4],[cx+1.5,ty+1]],'Y');}
  g.ell(cx-1,ty+2,w*.55,3.1,'b');g.ell(cx-1,ty+2,w*.46,2.3,'C');g.ell(cx-1.5,ty+2,w*.28,1.3,hot);
  g.path([[cx-3,ty+4],[cx-5,cy-1],[cx-4,cy+3],[cx-7,cy+7]],F.atk||F.hit?'Y':'C');g.path([[cx+1,ty+4],[cx+2.5,cy-1],[cx+1,cy+4],[cx+3,cy+7]],F.atk||F.hit?'Y':'C');
  g.path([[cx+.5,cy+3],[cx+1,cy+8]],'R');g.px([[cx-5,cy-1],[cx+2,cy-1]],hot);
  g.rect(Math.round(cx-w*.5),Math.round(cy+h*.5),2,3,'R');g.s(Math.round(cx-w*.5),Math.round(cy+h*.5)+3,'C');
  const ex=Math.round(cx+w*.34),ey=Math.round(cy-.5);
  if(F.hit){g.rect(ex,ey+1,3,1,'W');g.rect(ex+5,ey+1,3,1,'W');}
  else{g.rect(ex,ey,2,2,'Y');g.s(ex,ey,'W');g.rect(ex+5,ey,2,2,'Y');g.s(ex+5,ey,'W');}
  if(F.atk){g.rect(ex-1,ey+3,9,3,'C');g.rect(ex,ey+4,7,1,'Y');g.px([[ex+1,ey+3],[ex+6,ey+3]],'K');}
  g.px(F.i?[[cx+1,ty-2],[cx+4,ty-5],[cx-5,ty-3]]:[[cx-2,ty-1],[cx+3,ty-3]],'Y');
  return {pal:{B:'#5a4e68',b:'#2e2538',n:'#6e6280',C:'#ff8a3a',R:'#e0501a',Y:'#ffe08a',W:'#ffffff',K:'#1a1020'},flat:'CRYWK',a:{cx,cy,w,h,ty}};
 }
});
['mossling','dewtoad','cinderpup','frostwolf','crawler','shellguard','magmaslime'].forEach(n=>{MART[n].fr=1;});
// FAMILY1-END
// FAMILY2-BEGIN
// =================== FAMILY 2 (v0.13 art pass): gull, thunderhawk, cave bat, cloud ray, tide wisp, ash wraith, eclipse wraith ===================
// Flyers show both wings (far wing dark, near wing lit) with a span wider than the body; the ray undulates; wisps and wraiths carry a flat glow core
// and trailing tendrils, wraiths one prop. All frames come from f (idle A/B, atk, hit); variants add a shape through SHP in realms.js.
Object.assign(MART,{
 // ---- Glass Gull: white seabird, wings in a V (idle A up, B spread level), lunge dives beak open with talons out, a hit throws the wings down
 gull(g,f){const F=mfr(f);
  let bx=17,by=24,hx=27,hy=18.5,nT=[7,4],fT=[30,3],op=0;
  if(F.b){by=24.8;hy=19.3;nT=[2,14];fT=[37,11];}
  if(F.atk){bx=18;by=23;hx=29.5;hy=21.5;nT=[2,8];fT=[17,2];op=1;}
  if(F.hit){bx=15;by=25;hx=24;hy=20;nT=[3,26];fT=[34,22];}
  const nS=[bx-1,by-4],fS=[bx+4,by-5];
  wing(g,fS,fT,8,'m','l',4,3);
  g.poly([[bx-7,by-2.5],[bx-16,by-.5],[bx-15.5,by+3],[bx-7,by+3]],'b');g.px([[bx-16,by+1],[bx-15,by+2],[bx-14,by+3]],'K');
  if(F.atk){limb(g,bx+5,by+4,bx+11,by+9,'F',1);g.px([[bx+12,by+9],[bx+12,by+10],[bx+10,by+10]],'K');}
  else if(F.hit){limb(g,bx+1,by+5,bx,by+9,'F',1);limb(g,bx+4,by+5,bx+5,by+9,'F',1);}
  else g.px([[bx+1,by+6],[bx+1,by+7],[bx+4,by+6],[bx+4,by+7]],'F');
  sph(g,bx,by,9.6,5.6,'B','b');g.ell(bx+1.5,by+3.2,7,2.3,'A');
  sph(g,hx,hy,4.4,4.1,'B','b');
  if(op){g.poly([[hx+3,hy-1.6],[hx+8.8,hy-.2],[hx+3,hy+.6]],'G');g.poly([[hx+3,hy+.4],[hx+8,hy+.8],[hx+3,hy+3.6]],'K');g.rect(Math.round(hx+4),Math.round(hy+2.6),3,1,'R');g.poly([[hx+3,hy+3],[hx+7.5,hy+4.6],[hx+3,hy+4.4]],'G');}
  else{g.poly([[hx+3.2,hy-1.4],[hx+10,hy+.8],[hx+3.4,hy+2.4]],'G');g.px([[hx+9,hy+1],[hx+9,hy+2]],'R');}
  const ex=Math.round(hx+.5),ey=Math.round(hy-2.6);
  if(F.hit){g.rect(ex,ey+1,3,1,'K');}else{g.rect(ex,ey,2,2,'K');g.s(ex,ey,'W');}
  const tips=wing(g,nS,nT,10,'M','L',4,3);tips.slice(0,3).forEach(t=>g.s(Math.round(t[0]),Math.round(t[1]),'K'));
  if(F.hit)g.px([[bx-12,by-8],[bx+10,by-9],[bx+6,by-12]],'W');
  return {pal:{B:'#eef2f6',b:'#a8bed4',A:'#ffffff',M:'#8fb0d0',L:'#d4e6f6',m:'#5c7a9c',l:'#7d9cc0',G:'#ffb83d',R:'#e0506a',F:'#e8863a',K:'#1a1020',W:'#ffffff'},flat:'KWGRF',a:{bx,by,hx,hy,tx:bx-15,ty:by+1,nT,fT,sx:nS[0],sy:nS[1]}};
 },
 // ---- Thunder Hawk: gold raptor, crest of three blades, hooked steel beak, blue lightning on the pinions. Same poses as the gull, harder edges
 thunderhawk(g,f){const F=mfr(f);
  let bx=17,by=23,hx=28,hy=18,nT=[6,2],fT=[28,1],op=0;
  if(F.b){by=23.8;hy=18.8;nT=[1,15];fT=[37,10];}
  if(F.atk){bx=17.5;by=22.5;hx=29.5;hy=21;nT=[2,8];fT=[18,2];op=1;}
  if(F.hit){bx=15;by=24;hx=25;hy=19.5;nT=[2,27];fT=[34,23];}
  const nS=[bx-1,by-4],fS=[bx+4,by-5];
  wing(g,fS,fT,9,'m','l',5,3.2);
  [[-16,-3,'m'],[-17,1,'b'],[-15,5,'m']].forEach(([dx,dy,k])=>{g.poly([[bx-6,by-1.5],[bx+dx,by+dy-1],[bx+dx+1,by+dy+1.5],[bx-6,by+2]],k);g.s(bx+dx,by+dy,'C');});
  if(F.atk){limb(g,bx+5,by+4,bx+12,by+9,'K',1);g.px([[bx+13,by+10],[bx+12,by+10],[bx+11,by+10]],'K');limb(g,bx+3,by+4,bx+9,by+10,'K',1);}
  else if(F.hit){limb(g,bx+1,by+5,bx-1,by+9,'K',1);limb(g,bx+4,by+5,bx+5,by+9,'K',1);}
  else g.px([[bx+1,by+6],[bx+1,by+7],[bx+4,by+6],[bx+4,by+7],[bx,by+8],[bx+3,by+8]],'K');
  sph(g,bx,by,10.4,6,'B','b');g.ell(bx+2,by+3.4,7,2.4,'A');g.poly([[bx+4,by-5],[bx+9,by-3],[bx+7,by-1]],'M');
  sph(g,hx,hy,4.6,4.3,'B','b');
  g.poly([[hx-2,hy-3.5],[hx-6,hy-11],[hx-.5,hy-5]],'B');g.poly([[hx-.5,hy-4],[hx-1.5,hy-12],[hx+2.5,hy-4]],'M');g.poly([[hx+2,hy-3.5],[hx+4,hy-10],[hx+5.5,hy-2.5]],'b');
  if(op){g.poly([[hx+3.4,hy-2],[hx+9.5,hy-.4],[hx+8.5,hy+1],[hx+3.4,hy+.6]],'S');g.poly([[hx+3.2,hy+.6],[hx+8,hy+1.2],[hx+3,hy+3.8]],'K');g.rect(Math.round(hx+4),Math.round(hy+2.6),3,1,'R');g.poly([[hx+3,hy+3],[hx+7.5,hy+4.4],[hx+3,hy+4.8]],'S');}
  else{g.poly([[hx+3.4,hy-2],[hx+10,hy+.4],[hx+9.4,hy+2.6],[hx+7,hy+1.6],[hx+3.4,hy+2.8]],'S');}
  const ex=Math.round(hx+1),ey=Math.round(hy-2);
  if(F.hit)g.rect(ex,ey+1,3,1,'K');else{g.rect(ex,ey,2,2,'E');g.s(ex,ey,'W');g.rect(ex-1,ey-1,4,1,'K');}
  const tips=wing(g,nS,nT,11,'M','L',5,3.2);tips.slice(0,3).forEach(t=>g.s(Math.round(t[0]),Math.round(t[1]),'C'));
  return {pal:{B:'#f2c93a',b:'#a8822a',A:'#fff2b8',M:'#c4902a',L:'#ffe27a',m:'#7a5a1a',l:'#b08a2a',S:'#7a8398',K:'#2a2a3a',E:'#3ad0ff',C:'#3ad0ff',R:'#e0506a',W:'#ffffff'},flat:'KECRW',a:{bx,by,hx,hy,tx:bx-14,ty:by+2,nT,fT,sx:nS[0],sy:nS[1]}};
 },
 // ---- Cave Bat: front view, the span is three times the body. Wings up on A, down on B; the lunge flares the wings and opens the jaw; a hit folds them in
 cavebat(g,f){const F=mfr(f);
  let wy=0,sp=0,hy=14,by=24,op=0;
  if(F.b){wy=7;}if(F.atk){wy=-3;sp=0;hy=16;by=25;op=1;}if(F.hit){wy=5;sp=-6;by=25;hy=15;}
  const side=s=>{const cl=s<0,k=cl?'M':'m',kb=cl?'O':'o',W=[20+s*(10+sp),9+wy],A=[20+s*(18+sp),15+wy*1.1],Bt=[20+s*(14+sp),25+wy*.9],C=[20+s*(9),28+wy*.5];
   const n1=lerp2(A,Bt,.5),n2=lerp2(Bt,C,.5),sh=[20+s*3,17];
   [n1,n2].forEach(n=>{n[0]+=(20-n[0])*.25;n[1]-=2;});
   g.poly([sh,W,A,n1,Bt,n2,C,[20+s*3,25]],k);g.path([sh,W],kb,2);[A,Bt,C].forEach(t=>g.line(W[0],W[1],t[0],t[1],kb,1));g.px([[W[0],W[1]-1]],'D');};
  side(1);side(-1);
  sph(g,20,by,5.2,6.4,'B','b');g.ell(20.5,by+1.5,3,3.8,'A');g.px([[18,by+7],[22,by+7]],'D');
  g.poly([[16,hy-2],[14.5,hy-11],[19.5,hy-4]],'B');g.poly([[24,hy-2],[26,hy-11],[20.5,hy-4]],'b');g.poly([[16.4,hy-3],[15.6,hy-8],[18.4,hy-4]],'R');g.poly([[23.6,hy-3],[24.6,hy-8],[21.6,hy-4]],'r');
  sph(g,20,hy,4.8,4.4,'B','b');g.ell(20.5,hy+2,2.6,1.8,'A');
  if(F.hit){g.rect(17,hy-1,2,1,'K');g.rect(22,hy-1,2,1,'K');}
  else{g.rect(17,hy-1,1,2,'E');g.rect(23,hy-1,1,2,'E');g.s(17,hy-1,'W');}
  if(op){g.rect(18,hy+2,5,3,'K');g.rect(19,hy+4,3,1,'R');g.px([[18,hy+2],[22,hy+2],[19,hy+4]],'W');}
  else g.px([[19,hy+3],[21,hy+3]],'W');
  return {pal:{B:'#6a5a7c',b:'#3a2e50',A:'#9a8ab0',M:'#7a4a7a',m:'#3e2646',O:'#c08ab8',o:'#6a3e6a',R:'#c86a8a',r:'#8a4a6a',E:'#ff5050',W:'#ffffff',D:'#241a2c',K:'#140a1a'},flat:'EWK',a:{hx:20,hy,by,wy,sp}};
 },
 // ---- Cloud Ray: the wing is the body. A wave runs through the fins (idle A and B in opposite phase), the head leads, a long tail streams behind and whips over the back in the lunge
 cloudray(g,f){const F=mfr(f);
  let ph=F.i?3.14:0,amp=2.4,cy=22,sq=1,x0=9,x1=33;
  if(F.atk){amp=3.4;ph=1.6;cy=24;x0=10;x1=34;}if(F.hit){amp=.7;ph=0;sq=.7;cy=25;x0=8;x1=32;}
  const prof=u=>Math.pow(u<.4?u/.4:(1-u)/.6,.85),wv=u=>Math.sin(u*5.2+ph)*amp*prof(u),L=x1-x0;
  const tail=[];for(let i=0;i<=6;i++){const u=i/6;tail.push(F.atk?[[x0,cy],[x0-3,cy-3],[x0-5,cy-8],[x0-2,cy-13],[x0+4,cy-15],[x0+9,cy-14],[x0+11,cy-11]][Math.min(i,6)]:[x0-u*(x0-1.5),cy+1+u*8+Math.sin(u*5+ph)*2.4]);}
  g.path(tail,'b',2);const te=tail[6];
  if(F.atk)g.poly([[te[0]-1,te[1]-3],[te[0]+3,te[1]+4],[te[0]+1.5,te[1]-1]],'K');else g.ell(te[0],te[1],1.6,1.4,'C');
  const edge=[];
  for(let x=x0;x<=x1;x++){const u=(x-x0)/L,h=prof(u),w=wv(u),top=Math.round(cy-8.8*h*sq+w),bot=Math.round(cy+6*h*sq+w),mid=top+(bot-top)*.5;edge.push([x,top,bot]);
   for(let y=top;y<=bot;y++)g.s(x,y,y>=bot&&bot-top>2?'A':y<=top+1&&u<.7?'L':y<mid?'B':'b');}
  [[.2,.4],[.34,.25],[.5,.5],[.62,.34],[.3,.7],[.46,.78]].forEach(([u,v])=>{const e=edge[Math.round(u*L)];if(e)g.s(e[0],Math.round(e[1]+(e[2]-e[1])*v),'d');});
  const hx=x1+.5,hy=cy-1+wv(.96);
  sph(g,hx,hy,3.6,3.2*sq+.4,'B','b');g.poly([[hx+2,hy-2],[hx+4.5,hy-4.5],[hx+4,hy-.5]],'b');g.poly([[hx+1.5,hy+2],[hx+4.5,hy+3.5],[hx+3.5,hy+.5]],'b');
  const ex=Math.round(hx-.5),ey=Math.round(hy-2);
  if(F.hit)g.rect(ex,ey+1,3,1,'K');else{g.rect(ex,ey,2,2,'K');g.s(ex,ey,'W');}
  g.px(F.atk?[[Math.round(hx+1),Math.round(hy+2)],[Math.round(hx+3),Math.round(hy+3)]]:[[Math.round(hx+1),Math.round(hy+2.5)]],'K');
  const dx=F.i?1:0;[[14+dx,cy+11,2.6],[27-dx,cy+9,2.4],[20+dx,cy+13,1.6]].forEach(([x,y,r])=>{if(y<37)g.ell(x,y,r,r*.4+.5,'C');});
  if(F.hit)g.px([[16,cy-12],[24,cy-13]],'C');
  return {pal:{B:'#62c4b2',b:'#36807f',A:'#d4f6ee',L:'#9ae6d4',d:'#2a6a68',K:'#10241f',W:'#ffffff',C:'#eafffa'},flat:'KWC',a:{cx:21,cy,hx,hy,x0,x1,L,edge}};
 },
 // ---- Tide Wisp: a glass bell with one flat glow core and an eye in it, five tendrils with bright beads; the lunge throws a bolt, a hit flattens the bell and flashes the core
 tidewisp(g,f){const F=mfr(f);
  let cx=19,cy=13,rx=11,ry=9,ph=F.i?3.14:0,spread=0;
  if(F.b){rx=10;ry=10;}if(F.atk){cx=18;rx=11.5;ry=7.8;}if(F.hit){rx=12.5;ry=6.5;cx=18;spread=3;ph=2;}
  const by=Math.round(cy+ry*.55),tp=[];
  sph(g,cx,cy,rx,ry,'A','B');g.ell(cx-rx*.35,cy-ry*.5,rx*.38,ry*.22,'W');clr(g,0,by,40,40);
  for(let x=Math.round(cx-rx+1);x<=cx+rx-1;x++){g.s(x,by-1,'b');if((x+F.i)%2===0)g.s(x,by,'b');}
  for(let n=0;n<5;n++){const x=cx-8+n*4,t=tend(g,x,by,13+(n%2?3:0)+(F.b?2:0),2.2,ph+n*1.3,'T',2,(n-2)*spread*.7+(F.atk?-3:0));tp.push(t);g.s(Math.round(t[0]),Math.round(t[1]),'C');g.s(Math.round(t[0]),Math.round(t[1])-3,'C');}
  const kx=Math.round(cx+1),ky=Math.round(cy+1);
  g.ell(kx,ky,5.8,4.4,'Y');g.ell(kx,ky,4.2,3,F.hit?'W':'G');
  if(F.hit)g.rect(kx-2,ky,3,1,'K');else{g.rect(kx,ky-1,2,2,'K');g.s(kx,ky-1,'W');}
  if(F.atk){g.poly([[cx+rx-1,cy-5],[cx+rx+4,cy-6],[cx+rx+2.5,cy-2.5],[cx+rx+7,cy-3],[cx+rx+1,cy+4],[cx+rx+2.5,cy-.5],[cx+rx-1,cy-1]],'Y');g.px([[cx+rx+1,cy-4],[cx+rx+3,cy-4]],'W');}
  return {pal:{B:'#7ab8f0',A:'#b8dcff',b:'#4a7ac8',T:'#4a7ac8',K:'#1a1040',W:'#ffffff',Y:'#fff09a',G:'#fffbe0',C:'#f2e04a'},flat:'KWYGC',glow:'#b8e0ff',a:{cx,cy,rx,ry,by,kx,ky,tp}};
 },
 // ---- Ash Wraith: a tattered hooded cloak that tapers to ribbons, an ember core in the chest, a staff with a hanging lantern. Lunge: leans in, lantern thrust; hit: reels back
 ashwraith(g,f){const F=mfr(f);
  let lean=0,sw=F.i?1:0,rise=F.b?-1:0;if(F.atk)lean=2;if(F.hit)lean=-3;
  const hx=21+lean,hy=11+rise,cx=20+lean*.4;
  const body=(k,l,r)=>g.poly([[hx-1,4+rise],[hx+7,8+rise],[30+lean*.5,19],[28,28],[26+sw,36],[24,33],[21-sw,39],[18,34],[15+sw,38],[13,31],[10,23],[11+lean*.4,15],[hx-7,8+rise]],k);
  body('b');g.poly([[hx-1,4+rise],[hx-7,8+rise],[11+lean*.4,15],[10,23],[13,31],[15+sw,38],[18,34],[20,20],[hx+1,9+rise]],'B');
  g.ell(hx,hy+.5,5,5.4,'K');g.rect(hx-3,hy-1,1,2,'E');g.rect(hx+2,hy-1,1,2,'E');g.s(hx-3,hy-1,'W');
  g.px([[hx-1,hy+3],[hx+1,hy+3]],'q');
  const kx=Math.round(cx),ky=24;g.ell(kx,ky,3.8+(F.atk?1:0),4.4+(F.atk?1:0),F.hit?'W':'R');g.ell(kx,ky,2,2.6,F.hit?'W':'Y');
  [[14,31],[20,35],[26,32]].forEach(([x,y],n)=>tend(g,x,y+2,4,1.6,sw*2+n,'b',2,(n-1)*(F.hit?2:0)));
  const sx=30+(F.atk?1:F.hit?-2:0);
  g.path([[27+lean,16],[sx-1,20]],'b',3.4);g.ell(sx,21,1.8,1.6,'H');
  g.line(sx,7,sx,37,'S',2);g.path([[sx,8],[sx,5],[sx+2,3.5],[sx+4,5]],'S',1.5);
  const lx=sx+2+(F.i?1:0)+(F.atk?1:0),ly=7+(F.hit?2:0);g.px([[sx+4,5],[sx+4,6]],'n');
  g.rect(lx,ly,5,6,'N');g.rect(lx,ly,5,1,'n');g.rect(lx,ly+5,5,1,'n');g.rect(lx+1,ly+1,3,4,'L');g.s(lx+2,ly+2,'Y');
  g.px(F.i?[[8,15],[34,9],[9,28],[36,22]]:[[8,14],[34,10],[10,27],[36,23]],'Y');
  return {pal:{B:'#5a4e52',b:'#352c32',q:'#2a2024',K:'#0e0c12',E:'#8aeaff',W:'#ffffff',R:'#ff8a3a',Y:'#ffe08a',H:'#d8cfc0',S:'#6a4a2a',N:'#8a7a6a',n:'#4a4038',L:'#ffb040'},flat:'KEWRYL',a:{hx,hy,cx,top:4+rise,lean,sx,lx,ly,by:34}};
 },
 // ---- Eclipse Wraith: a cloak split into a night half and a day half, a halo above the hood, an eclipse in the chest, a scythe. Same poses as the ash wraith
 eclipsewraith(g,f){const F=mfr(f);
  let lean=0,sw=F.i?1:0,rise=F.b?-1:0;if(F.atk)lean=2;if(F.hit)lean=-3;
  const hx=20+lean,hy=12+rise,cx=20+lean*.4;
  const shape=()=>[[hx,6+rise],[hx+7,10+rise],[29+lean*.4,22],[27,32],[28,36+sw],[24,34],[20,38-sw],[16,34],[12,36+sw],[13,32],[11,22],[hx-7,10+rise]];
  g.poly(shape(),'P');g.poly([[hx,6+rise],[hx-7,10+rise],[11,22],[13,32],[12,36+sw],[16,34],[20,38-sw],[hx,20]],'D');
  g.poly([[hx,6+rise],[hx+7,10+rise],[29+lean*.4,22],[hx+2,22],[hx,11]],'L');
  g.path([[hx+1,22],[hx+1,36]],'d');g.px([[13,26],[15,31],[12,33]],'V');g.px([[26,26],[28,31],[24,33]],'p');
  g.ell(hx+.5,hy+.5,4.6,4.6,'K');g.rect(hx-2,hy,1,2,'E');g.rect(hx+2,hy,1,2,'F');g.s(hx-2,hy,'W');
  g.ell(hx,4.4+rise,6.6,2,'G');g.ell(hx,4.4+rise,4.8,.9,0);
  const kx=Math.round(cx),ky=24,gr=F.atk?1:0;g.ell(kx,ky,4.8+gr,4.8+gr,F.hit?'W':'C');g.ell(kx,ky,3,3,'K');
  [[14,34],[20,37],[26,34]].forEach(([x,y],n)=>tend(g,x,y+1,3,1.4,sw*2+n,n===0?'D':n===1?'d':'p',2,(n-1)*(F.hit?2:0)));
  const sx=30+(F.atk?1:F.hit?-2:0),ty=F.hit?9:7;
  g.path([[27+lean,16],[sx-1,20]],'d',3.4);g.ell(sx,21,1.8,1.6,'H');
  g.line(sx,ty,sx,37,'S',2);
  g.poly([[sx-1,ty+1],[sx+2,ty-3],[sx+5.5,ty-2],[sx+7,ty+3],[sx+6,ty+8],[sx+5,ty+3],[sx+3,ty+1]],'N');g.path([[sx+2,ty-2],[sx+5.5,ty-1],[sx+6,ty+4]],'W',1);
  g.px(F.i?[[7,12],[33,16],[6,28]]:[[7,13],[33,15],[6,27]],'C');
  return {pal:{D:'#3a2a60',d:'#241a40',V:'#8a6ad0',P:'#d8d0f0',L:'#f4f0ff',p:'#a89cd0',K:'#0c0818',E:'#b48aff',F:'#fff0a0',W:'#ffffff',G:'#f0d060',C:'#fff0a0',S:'#5a4a38',N:'#b8c0d0',H:'#d8cfc0'},flat:'KEFWGC',glow:'#d8c8ff',a:{hx,hy,cx,top:6+rise,lean,sx,ty,by:36}};
 }
});
['gull','thunderhawk','cavebat','cloudray','tidewisp','ashwraith','eclipsewraith'].forEach(n=>{MART[n].fr=1;});
// FAMILY2-END
// FAMILY3-BEGIN
// =================== FAMILY 3 (v0.13 art pass): slag golem, icebound knight, husk watcher (barrow bones is in monsters2.js) ===================
// Blocky and plated, facing right. The upper body is one block that shifts: idle B breathes it 1px, the lunge (atk) pushes it 2px forward with the
// dominant mass stretched (the slam fist, the sword or spear thrust), a hit throws it 2px back with the core or visor flashing white (W).
// Variants add a shape through SHP in realms.js (anchors a: head hx,hy,top; core cx,cy; by = feet).
Object.assign(MART,{
 // ---- Slag Golem: tall and top-heavy, a small head sunk between huge pauldrons, a molten core with cracks, one giant slag fist (slams down in the lunge)
 slaggolem(g,f){const F=mfr(f);
  let L=0,dy=F.b?-1:0,fx=34,fy=29,fr=5;
  if(F.atk){L=2;dy=1;fx=35;fy=32;fr=5.6;}
  if(F.hit){L=-2;dy=1;}
  const lg=F.atk?1:0,hx=20+L,cx=20+L,cy=21+dy,H=L/2;
  slab(g,5+L,16+dy,5,12,'r','d');sph(g,7.5+L,29,3.8,3.2,'r','d');
  slab(g,12-lg,29,6,7,'R','r');slab(g,22+lg,29,6,7,'R','r');slab(g,11-lg,35,8,3,'R','d');slab(g,21+lg,35,8,3,'R','d');
  slab(g,12,26,17,4,'r','d');
  g.poly([[10+L,14+dy],[30+L,14+dy],[28+L,28],[13+H,28]],'r');g.poly([[10+L,14+dy],[29+L,14+dy],[27+L,23],[12+L,24]],'R');
  g.rect(13+H,26,15,1,'d');
  slab(g,5+L,11+dy,10,8,'R','r');slab(g,25+L,11+dy,10,8,'R','r');g.px([[7+L,13+dy],[32+L,13+dy]],'d');
  if(!F.atk&&!F.hit)g.rect(26+L,19+dy,8,1,'d');
  slab(g,15+L,3+dy,10,9,'R','r');g.rect(15+L,6+dy,10,1,'d');g.rect(17+L,10+dy,6,1,'d');
  if(F.hit){g.rect(17+L,8+dy,2,1,'E');g.rect(21+L,8+dy,2,1,'E');}else{g.rect(17+L,7+dy,2,2,'E');g.rect(21+L,7+dy,2,2,'E');g.s(17+L,7+dy,'W');g.s(21+L,7+dy,'W');}
  const cr=F.b?3.8:3.4;g.ell(cx,cy,cr,cr,'C');g.ell(cx,cy,2,2,F.hit?'W':'A');
  g.path([[cx-2,cy-2],[cx-6,cy-5],[cx-7,cy-8]],'C');g.path([[cx+2,cy-2],[cx+6,cy-4],[cx+7,cy-8]],'C');g.path([[cx-2,cy+2],[cx-5,cy+5]],'C');g.path([[cx+2,cy+2],[cx+5,cy+4],[cx+6,cy+6]],'C');
  if(F.hit){g.path([[cx,cy-3],[cx+1,cy-7],[cx-1,cy-10]],'C',2);g.path([[cx-3,cy+1],[cx-9,cy+1]],'C',2);g.path([[cx+3,cy+2],[cx+8,cy+2]],'C',2);g.px([[cx-9,cy-8],[cx+9,cy-7],[cx+10,cy+5]],'A');}
  g.px([[15-lg,31],[15-lg,32],[16-lg,33]],'C');
  slab(g,fx-2.5+(F.atk?-1:0),17+dy,6,Math.round(fy-17-dy-1),'R','r');
  sph(g,fx,fy,fr,fr-.8,'R','r');g.line(fx-fr*.6,fy+1,fx+fr*.6,fy+1,'d');
  g.px(F.b?[[fx+1,fy+fr+1],[fx+1,fy+fr+2]]:[[fx-2,fy+fr+1]],'C');
  if(F.atk)g.px([[fx+4,36],[fx+5,34],[fx-4,37],[fx+2,37]],'C');
  return {pal:{R:'#7a665c',r:'#54443c',d:'#34282a',C:'#ff7a2a',A:'#ffe08a',E:'#ffb040',W:'#ffffff'},flat:'CAEW',a:{cx,cy,hx,hy:7+dy,top:3+dy,fx,fy,fr,lx:7+L,ly:29,sx:31+L,sy:14+dy,by:37,L,dy}};
 },
 // ---- Icebound Knight: steel plate with an ice crest, a kite shield behind, a chest gem as the accent; sword upright, thrust forward in the lunge
 iceknight(g,f){const F=mfr(f);
  let L=0,dy=F.b?-1:0;if(F.atk){L=2;dy=0;}if(F.hit){L=-2;dy=1;}
  const lg=F.atk?1:0,hx=19+L,hy=9+dy,cx=19+L,cy=20+dy,H=L/2,sx=7+L;
  g.poly([[sx-1,14+dy],[sx+7,13+dy],[sx+7,28],[sx+3,34],[sx-1,28]],'N');g.poly([[sx-1,14+dy],[sx+6,14+dy],[sx+6,27],[sx+3,31],[sx-1,27]],'M');
  g.rect(sx+2,18+dy,2,9,'C');g.rect(sx,21+dy,6,2,'C');
  slab(g,13,28,5,8,'M','N');slab(g,21+lg,28,5,8,'M','N');slab(g,12,35,7,3,'N','D');slab(g,20+lg,35,7,3,'N','D');
  slab(g,12+H,25,15,5,'M','N');g.rect(12+H,24,15,1,'G');
  slab(g,12+L,14+dy,15,11,'M','N');g.rect(13+L,18+dy,13,1,'N');g.rect(13+L,22+dy,13,1,'N');
  sph(g,12+L,16+dy,4,3.4,'M','N');
  g.poly([[29+L,12+dy],[32+L,9+dy],[31+L,15+dy]],'C');
  sph(g,27+L,16+dy,4.4,3.6,'M','N');
  g.ell(cx+.5,cy+.5,2.4,2.4,'E');g.s(cx,cy-1,'W');
  sph(g,hx,hy,5.4,5.4,'M','N');
  g.rect(hx,hy,6,2,F.hit?'W':'K');if(!F.hit){g.rect(hx+1,hy,2,2,'E');g.s(hx+1,hy,'W');}
  g.poly([[hx-3,hy-4],[hx-2,hy-11-(F.b?1:0)],[hx,hy-5]],'C');g.poly([[hx-.5,hy-5],[hx+1,hy-12],[hx+2.5,hy-5]],'C');
  let sw=0;
  if(F.atk){slab(g,25+L,16,5,4,'M','N');g.path([[31,19],[39,20]],'W',3);g.line(31,20,38,21,'V');g.line(30,14,31,24,'G',2);slab(g,27+L,17,4,5,'M','N');sw=39;}
  else if(F.hit){g.line(29+L,25,27+L,4,'W',3);g.line(30+L,24,28+L,5,'V');g.rect(26+L,24,7,2,'G');g.rect(28+L,26,3,4,'L');slab(g,26+L,25,5,4,'M','N');sw=27+L;}
  else{const tx=F.b?31:30;g.line(30,24,tx,3,'W',3);g.line(31,24,tx+1,4,'V');g.rect(27,24,7,2,'G');g.rect(29,26,3,4,'L');slab(g,24,17+dy,5,4,'M','N');slab(g,28,25,5,4,'M','N');sw=tx;}
  return {pal:{M:'#8aa8c0',N:'#5a7894',D:'#3a526c',C:'#c8f0ff',K:'#10141f',E:'#5ad0ff',W:'#e8f8ff',V:'#9ab8d0',G:'#c8a050',L:'#5a3a22'},flat:'KEW',a:{cx,cy,hx,hy,top:hy-5,sx:27+L,sy:16+dy,gx:sw,by:37,L,dy}};
 },
 // ---- Husk Watcher: a hollow suit of sand-coloured plate with a tall bucket helm, an empty chest with a glowing core, a round shield behind, a vigil spear
 huskguard(g,f){const F=mfr(f);
  let L=0,dy=F.b?-1:0,lg=0;if(F.atk){L=2;dy=0;lg=1;}if(F.hit){L=-2;dy=1;}
  const hx=20+L,cx=20+L,cy=20+dy,H=L/2,shx=Math.round(9+H);
  g.ell(shx-1,22,5.4,8.4,'P');g.ell(shx-.6,21.6,4,6.8,'N');g.ell(shx-1,22,1.6,1.8,'M');g.px([[shx-1,18],[shx-1,26]],'E');
  slab(g,13-lg,28,5,9,'M','N');slab(g,22+lg,28,5,9,'M','N');slab(g,12-lg,35,7,3,'N','D');slab(g,21+lg,35,7,3,'N','D');g.px([[14-lg,31],[25+lg,31]],'E');
  slab(g,10+L,13+dy,20,15,'M','N');g.rect(11+H,26,18,2,'N');
  g.ell(cx,cy+1,4.6,5.6,'K');g.ell(cx,cy+1,F.b?2.8:2.4,F.b?2.8:2.4,F.hit?'W':'E');g.s(cx-1,cy,'W');
  slab(g,8+L,11+dy,8,6,'M','N');slab(g,24+L,11+dy,8,6,'M','N');
  slab(g,15+L,2+dy,10,11,'M','N');g.rect(16+L,7+dy,9,2,'K');g.px([[19+L,2+dy],[19+L,3+dy],[19+L,4+dy]],'N');
  if(F.hit){g.rect(17+L,8+dy,2,1,'W');g.rect(21+L,8+dy,2,1,'W');g.path([[22+L,3+dy],[21+L,7+dy]],'K');g.path([[cx+3,cy-3],[cx+6,cy+3]],'K');}
  else{g.rect(17+L,7+dy,2,2,'E');g.rect(21+L,7+dy,2,2,'E');g.s(17+L,7+dy,'W');g.s(21+L,7+dy,'W');}
  let tip;
  if(F.atk){tip=spear(g,14+L,26,32,19,'S','G',6);slab(g,27+L,18,5,4,'M','N');}
  else if(F.hit){tip=spear(g,36+L,37,31+L,12,'S','G',6);slab(g,29+L,21+dy,5,4,'M','N');}
  else{const sxp=F.b?33:32;tip=spear(g,sxp,37,sxp,9,'S','G',6);slab(g,sxp-3,19+dy,6,4,'M','N');}
  return {pal:{M:'#c8b890',N:'#8a7a5a',D:'#a89870',P:'#4e4332',K:'#0e0a16',E:'#f6e7a8',S:'#5a4a3a',G:'#f0c860',W:'#ffffff'},flat:'KEW',a:{cx,cy,hx,hy:7+dy,top:2+dy,sx:28+L,sy:11+dy,tip,by:37,L,dy}};
 }
});
['slaggolem','iceknight','huskguard'].forEach(n=>{MART[n].fr=1;});
// FAMILY3-END
// FAMILY4-BEGIN
// =================== FAMILY 4 (v0.13 art pass): imps and harpies, yeti, stormling, gargoyle, void things, mimic, drowned sailor, wights ===================
// Same frame API as families 1 to 3: f = {t:'idle'|'atk'|'hit', i:0|1}. Flyers (gust imp, snow harpy, gargoyle) show both wings with a span wider than the body;
// the yeti is tall and top-heavy; the voidspawn and the star eater are void things (a flat glow core, tendrils, a maw); the mimic is a chest whose lid opens on
// the lunge; the sailor, the rime wight and the gale phantom are undead with one prop each (anchor, frost blade, war horn). Variants add a shape through SHP.
Object.assign(MART,{
 // ---- Gust Imp: a green pot-bellied imp, bat ears, two horns, a barbed tail; wings up on A and level on B, the lunge dives claws first with the jaw open, a hit throws the wings down
 gustimp(g,f){const F=mfr(f);
  let bx=18,by=25,hx=24.5,hy=15,nT=[3,5],fT=[33,3],ar=[27,26],op=0;
  if(F.b){by=25.8;hy=15.8;nT=[1,17];fT=[36,13];ar=[26,27];}
  if(F.atk){bx=19;by=24;hx=27.5;hy=17.5;nT=[2,10];fT=[22,1];ar=[34,25];op=1;}
  if(F.hit){bx=16.5;by=26;hx=22;hy=17.5;nT=[4,27];fT=[31,24];ar=[22,32];}
  const nS=[bx-1,by-5],fS=[bx+3,by-6],tx=bx-12,ty=by+1;
  wing(g,fS,fT,11,'m','l',4,3);
  g.path([[bx-4,by+4],[bx-8,by+8],[bx-12,by+6],[bx-12,by+2]],'b',2);g.poly([[tx-2,ty+1],[tx+2,ty+1],[tx,ty-4]],'b');
  if(F.atk){limb(g,bx+1,by+5,bx+5,by+10,'B',2);g.px([[bx+5,by+11],[bx+3,by+11]],'W');}
  else{limb(g,bx-1,by+5,bx-2,by+10,'B',2);limb(g,bx+2,by+5,bx+3,by+10,'b',2);g.px([[bx-3,by+11],[bx-1,by+11],[bx+2,by+11],[bx+4,by+11]],'W');}
  sph(g,bx,by,5.8,6.6,'B','b');g.ell(bx+1.6,by+1.6,3.2,3.8,'A');
  limb(g,bx+2,by-2,ar[0],ar[1],'B',2);g.px([[ar[0]+1,ar[1]],[ar[0]+1,ar[1]+1],[ar[0],ar[1]+2]],'W');
  g.poly([[hx-4,hy-.5],[hx-11,hy-3.5],[hx-4.5,hy+3]],'b');g.poly([[hx-4,hy-.2],[hx-9,hy-2.4],[hx-4.4,hy+1.4]],'R');
  g.poly([[hx-3,hy-3.5],[hx-6.5,hy-11],[hx-.5,hy-4.8]],'b');g.poly([[hx+1,hy-4.6],[hx+3,hy-12],[hx+4.8,hy-3.8]],'B');
  sph(g,hx,hy,5.6,5,'B','b');g.ell(hx+4.2,hy+1.8,3,2.2,'B');
  if(op){g.poly([[hx+2.5,hy+1.2],[hx+9,hy+1.6],[hx+7.5,hy+6.8],[hx+3,hy+5.2]],'K');g.rect(hx+4,hy+4.6,3,1,'R');g.px([[hx+3,hy+2],[hx+6,hy+2],[hx+4,hy+5.6]],'W');}
  else{g.line(hx+2,hy+3.6,hx+7.5,hy+3.2,'K');g.px([[hx+5,hy+4.4],[hx+7,hy+4.2]],'W');}
  if(!F.hit)g.rect(Math.round(hx),Math.round(hy-3.6),5,1,'K');eye(g,hx+1.4,hy-2.4,F,'E');
  const tips=wing(g,nS,nT,12,'M','L',4,3);tips.slice(0,3).forEach(t=>g.s(Math.round(t[0]),Math.round(t[1]),'P'));
  g.px(F.i?[[3,31],[5,30],[7,31],[34,35],[36,34]]:[[2,30],[4,29],[6,30],[33,34],[35,33],[37,34]],'C');
  if(F.hit)g.px([[bx-12,by-12],[bx+12,by-12],[bx+9,by-15]],'W');
  return {pal:{B:'#5fc9a0',b:'#2f7a74',A:'#c8f4dc',M:'#8a6ad0',m:'#5a3e98',L:'#c8b0f4',l:'#8a6ad0',P:'#e04a6a',R:'#e0506a',E:'#fff06a',K:'#1a1020',W:'#ffffff',C:'#e4fff6'},flat:'EKWCP',a:{bx,by,hx,hy,tx,ty,nT,fT,sx:nS[0],sy:nS[1],ar,top:hy-12}};
 },
 // ---- Snow Harpy: a pale woman-bird, a mane of white hair, a gold beak, bare wings in a V (A up, B level), talons that lunge forward and reach in the dive
 snowharpy(g,f){const F=mfr(f);
  let bx=19,by=26,hx=22.5,hy=13.5,nT=[2,5],fT=[35,3],tl=0,op=0;
  if(F.b){by=26.8;hy=14.3;nT=[1,17];fT=[37,13];}
  if(F.atk){bx=19.5;by=25;hx=26;hy=17;nT=[2,9];fT=[19,1];tl=1;op=1;}
  if(F.hit){bx=17;by=27;hx=21;hy=17;nT=[3,28];fT=[33,25];}
  const nS=[bx-1,by-8],fS=[bx+3,by-9],sw=F.i?1:0;
  wing(g,fS,fT,13,'m','l',5,3.4);
  g.poly([[bx-3,by+5],[bx-9,by+10+sw],[bx-5,by+9],[bx-6,by+12],[bx,by+8],[bx+3,by+5]],'b');
  if(tl){limb(g,bx+3,by+5,bx+10,by+9,'G',1);limb(g,bx,by+5,bx+6,by+10,'G',1);g.px([[bx+11,by+10],[bx+10,by+11],[bx+7,by+11],[bx+6,by+11]],'W');}
  else if(F.hit){limb(g,bx,by+6,bx-1,by+10,'G',1);limb(g,bx+3,by+6,bx+4,by+10,'G',1);g.px([[bx-2,by+11],[bx+3,by+11]],'W');}
  else{limb(g,bx,by+6,bx-1,by+11,'G',1);limb(g,bx+3,by+6,bx+3,by+11,'G',1);g.px([[bx-2,by+12],[bx,by+12],[bx+2,by+12],[bx+4,by+12]],'W');}
  sph(g,bx,by,4.8,7.2,'B','b');g.ell(bx+1.5,by+1,2.8,4.6,'A');g.px([[bx-1,by-2],[bx+1,by],[bx-1,by+2],[bx+1,by+4]],'b');
  g.poly([[hx-3,hy-5],[hx+3,hy-5],[hx+4,hy+2],[hx+1,hy+9],[hx-5+sw,hy+13],[hx-9,hy+11],[hx-8,hy+3]],'h');g.poly([[hx-3,hy-5],[hx+2,hy-5.6],[hx+1,hy+1],[hx-4,hy+8],[hx-8,hy+4]],'H');
  g.path([[hx-4,hy+1],[hx-6,hy+8]],'h');
  sph(g,hx+1.5,hy,3.8,4.2,'A','a');
  if(op){g.poly([[hx+4,hy-1.2],[hx+9.5,hy-.2],[hx+4,hy+.8]],'G');g.poly([[hx+4,hy+1.4],[hx+9,hy+3.4],[hx+4,hy+3.6]],'G');g.rect(hx+5,hy+.8,3,1,'K');}
  else g.poly([[hx+4,hy-.8],[hx+10,hy+1.4],[hx+4,hy+2.6]],'G');
  eye(g,hx+.8,hy-2,F,'E');if(!F.hit)g.rect(Math.round(hx),Math.round(hy-3.4),4,1,'h');
  const tips=wing(g,nS,nT,14,'M','L',5,3.4);tips.slice(0,3).forEach(t=>g.s(Math.round(t[0]),Math.round(t[1]),'P'));
  g.px(F.i?[[8,34],[31,33],[20,36]]:[[6,33],[33,34],[24,37]],'W');
  if(F.hit)g.px([[bx-12,by-14],[bx+12,by-15],[bx+8,by-18]],'W');
  return {pal:{B:'#a8c4dc',b:'#6a8aa8',A:'#eef0f6',a:'#c8c0d4',H:'#f4f8ff',h:'#aab8d0',M:'#86aecc',m:'#4a6a8a',L:'#d4ecff',l:'#7a9cc0',G:'#e0b050',P:'#b080ff',E:'#5ae0ff',K:'#1a1020',W:'#ffffff'},flat:'KEWPG',a:{bx,by,hx,hy,tx:bx-7,ty:by+10,nT,fT,sx:nS[0],sy:nS[1],top:hy-6}};
 },
 // ---- Frostling Yeti: tall and top-heavy, huge shoulders and a small blue face sunk between them, short legs, long arms with big fists; the lunge slams the right fist down
 yeti(g,f){const F=mfr(f);
  let L=0,dy=F.b?-1:0,fx=31,fy=30;
  if(F.b){fy=31;}
  if(F.atk){L=2;dy=1;fx=36;fy=33;}
  if(F.hit){L=-2;dy=1;fx=29;fy=32;}
  const hx=23+L,hy=9+dy,cx=18+L,cy=21+dy;
  g.rect(12,31,6,6,'b');g.rect(21,31,6,6,'b');slab(g,11,35,8,3,'A','a');slab(g,20,35,8,3,'A','a');
  sph(g,6+L*.6,23+dy,3.6,8.5,'B','b');sph(g,5.4+L*.4,32,4.2,3.4,'B','b');
  g.poly([[cx-11,16+dy],[cx+11,16+dy],[cx+8,32],[cx-8,32]],'b');g.poly([[cx-11,16+dy],[cx+3,16+dy],[cx+1,32],[cx-8,32]],'B');
  [[-7,31],[-3,32],[1,31],[5,32]].forEach(([o,y])=>g.poly([[cx+o-2,y-1],[cx+o,y+3],[cx+o+2,y-1]],'b'));
  sph(g,cx,14+dy,13,6.6,'B','b');
  g.path([[cx+9,15+dy],[fx-.5,fy-4]],'b',6);g.path([[cx+8,15+dy],[fx-1.5,fy-4]],'B',5);
  sph(g,fx,fy,4.6,4,'B','b');g.px([[fx-2,fy+2],[fx,fy+3],[fx+2,fy+2]],'a');
  if(F.atk)g.px([[fx+4,36],[fx+6,34],[fx-4,37],[fx+2,37],[fx-6,36]],'W');
  sph(g,hx,hy,5.2,4.8,'S','s');g.ell(hx-.8,hy-4,5,2.4,'B');g.px([[hx-4,hy-2],[hx-2,hy-1],[hx+2,hy-1],[hx+4,hy-2]],'b');
  g.poly([[hx-2,hy-4],[hx-5,hy-9],[hx,hy-5]],'H');g.poly([[hx+2,hy-4],[hx+6,hy-9],[hx+5,hy-3]],'h');
  eye(g,hx+1.6,hy-1.4,F,'E');
  if(F.atk){g.rect(hx+1,hy+1.6,6,3,'K');g.rect(hx+2,hy+3.6,4,1,'R');g.px([[hx+1,hy+1],[hx+6,hy+1],[hx+3,hy+4.6]],'W');}
  else{g.line(hx+1,hy+3,hx+6,hy+3,'K');g.px([[hx+2,hy+4],[hx+5,hy+4]],'W');}
  [[10,18],[13,24],[20,27],[11,29],[24,21]].forEach(([x,y])=>g.px([[x+L,y+dy],[x+1+L,y+1+dy]],'b'));
  return {pal:{B:'#e4eef4',b:'#aebfd0',A:'#9ec0dc',a:'#6a8cac',S:'#6e98c4',s:'#46689a',H:'#e8e0c8',h:'#a8a088',E:'#ffe14a',K:'#1a1020',W:'#ffffff',R:'#d8506a'},flat:'EKWR',a:{hx,hy,top:hy-9,cx,cy,fx,fy,sx:cx+10,sy:14+dy,by:37,L,dy}};
 },
 // ---- Stormling: a thunderhead with one flat glow core, two eyes, hanging bolts and rain. B swells it, the lunge throws a bolt forward, a hit squashes it flat and flashes the core
 stormling(g,f){const F=mfr(f);
  let cx=20,cy=17,s=1,sq=1;
  if(F.b){s=1.06;cy=16;}if(F.atk){cx=17;s=1.04;}if(F.hit){sq=.74;cy=20;cx=19;s=1.08;}
  const P=[[12,19,7,6],[28,19,7,6],[21,13,8.5,7.5],[20,22,10,6]];
  P.forEach(([x,y,rx,ry])=>sph(g,cx+(x-20)*s,cy+(y-17)*sq+(F.b?-0:0),rx*s,ry*sq*s,'B','b'));
  g.ell(cx-3,cy-5.6*sq,3.6,1.5,'A');g.ell(cx+6,cy-.6*sq,2.4,1.1,'A');
  const kx=cx+1,ky=Math.round(cy+3*sq);
  bolt(g,kx-1,ky-1,F.hit?4:9,3,F.hit?'W':'C',2);
  const ex=cx-2,ey=cy-5*sq;
  if(F.hit){g.rect(ex,ey+1,3,1,'K');g.rect(ex+6,ey+1,3,1,'K');}else{g.rect(ex,ey,2,2,'E');g.s(ex,ey,'W');g.rect(ex+6,ey,2,2,'E');g.s(ex+6,ey,'W');g.line(ex-1,ey-2,ex+3,ey-1,'K');g.line(ex+5,ey-1,ex+9,ey-2,'K');}
  g.path([[ex+1,ey+5],[ex+3,ey+4],[ex+5,ey+5],[ex+7,ey+4]],'K');
  const by=Math.round(cy+9*sq),tips=[];
  if(F.atk){tips.push(bolt(g,cx-8,by,9,2,'C',2));tips.push(bolt(g,cx+3,by,6,-2,'C',2));
   g.path([[cx+13,cy+1],[cx+19,cy-1],[cx+16,cy+3],[cx+23,cy+2]],'C',3);g.path([[cx+13,cy+1],[cx+19,cy-1],[cx+16,cy+3],[cx+23,cy+2]],'W',1);g.px([[cx+22,cy-4],[cx+23,cy+6]],'E');}
  else{tips.push(bolt(g,cx-8,by,F.b?11:9,F.b?-3:3,'C',2));tips.push(bolt(g,cx+8,by,F.b?8:11,F.b?3:-3,'C',2));if(!F.hit)tips.push(bolt(g,cx-1,by+1,5,2,'C',1));}
  const dx=F.i?1:0;[[10+dx,34],[17-dx,36],[24+dx,35],[30-dx,34],[14,38-dx]].forEach(([x,y])=>{if(!(F.atk&&x>cx+9))g.px([[x,y],[x,y+1]],'A');});
  if(F.hit)g.px([[cx-14,cy-6],[cx+15,cy-8],[cx+12,cy+8]],'W');
  return {pal:{B:'#7a84a8',b:'#4a5478',A:'#c8d4f0',C:'#f2d43a',Y:'#c89a2a',E:'#fff6b8',K:'#141826',W:'#ffffff'},flat:'CYEKW',glow:'#f2d43a',a:{cx,cy,kx,ky,top:cy-9,by,tips,sq,s}};
 },
 // ---- Skyshaper (gargoyle): a crouched stone flyer, plated shoulders and chest, a horned head with a glowing visor slit, bat wings spread wide (A up, B level); the lunge leaps claws out, a hit folds the wings
 gargoyle(g,f){const F=mfr(f);
  let bx=18,by=26,hx=25,hy=16,nT=[3,3],fT=[34,2],cl=[27,35];
  if(F.b){by=26.8;hy=16.8;nT=[1,14];fT=[37,11];cl=[27,36];}
  if(F.atk){bx=19;by=25;hx=28;hy=18;nT=[1,9];fT=[21,0];cl=[34,30];}
  if(F.hit){bx=17;by=27;hx=23;hy=18;nT=[5,25];fT=[31,22];cl=[26,36];}
  const nS=[bx-2,by-7],fS=[bx+3,by-8];
  wing(g,fS,fT,13,'m','l',4,3.4);
  g.path([[bx-6,by+3],[bx-12,by+5],[bx-14,by+9]],'b',3);g.poly([[bx-17,by+8],[bx-12,by+7.5],[bx-13,by+13]],'b');
  slab(g,Math.round(bx-9),Math.round(by+3),7,7,'B','b');g.px([[bx-9,by+10],[bx-6,by+10],[bx-3,by+10]],'W');
  sph(g,bx,by,8,7,'B','b');slab(g,Math.round(bx-4),Math.round(by-4),9,7,'A','a');g.rect(Math.round(bx-3),Math.round(by-1),7,1,'a');g.px([[bx-3,by-3],[bx+4,by-3],[bx-3,by+1],[bx+4,by+1]],'W');
  limb(g,bx+5,by-1,cl[0],cl[1]-(F.atk?0:6),'B',3);g.px([[cl[0]-1,cl[1]],[cl[0]+1,cl[1]],[cl[0]+2,cl[1]-1]].slice(0,F.atk?3:3),'W');
  slab(g,Math.round(bx+3),Math.round(by-8),7,5,'A','a');
  g.poly([[hx-4,hy-3],[hx-8,hy-9],[hx-2,hy-5]],'a');g.poly([[hx+1,hy-4],[hx+3,hy-11],[hx+5,hy-3]],'A');
  slab(g,Math.round(hx-5),Math.round(hy-4),11,9,'A','a');
  g.rect(Math.round(hx-4),Math.round(hy-1),9,3,'K');g.rect(Math.round(hx-3),Math.round(hy-1),F.hit?7:7,F.hit?3:2,F.hit?'W':'E');if(!F.hit)g.s(Math.round(hx-3),Math.round(hy-1),'W');
  g.px(F.atk?[[hx-3,hy+4],[hx,hy+4],[hx+3,hy+4],[hx+5,hy+4]]:[[hx-2,hy+4],[hx+2,hy+4]],'W');
  const tips=wing(g,nS,nT,14,'M','L',4,3.4);tips.slice(0,3).forEach(t=>g.s(Math.round(t[0]),Math.round(t[1]),'K'));
  g.path([[bx-2,by-1],[bx-4,by+3]],'C');
  return {pal:{B:'#8a8a9c',b:'#555566',A:'#a8a8ba',a:'#6a6a7c',M:'#6e6e82',L:'#a0a0b4',m:'#44445a',l:'#707086',E:'#f2c93a',W:'#ece6d8',K:'#1a1020',C:'#f2c93a'},flat:'EWKC',a:{bx,by,hx,hy,top:hy-11,cx:bx,cy:by-1,nT,fT,sx:nS[0],sy:nS[1],tx:bx-14,ty:by+9}};
 },
 // ---- Void Spawn: a dark dome of void with stars in it, one flat glow core with a slit pupil, a maw that gapes on the lunge and five tendrils with glowing tips; a hit squashes it flat
 voidspawn(g,f){const F=mfr(f);
  let cx=19,cy=22,rx=13,ry=9.5,ph=F.i?3.14:0,sp=0;
  if(F.b){rx=12.2;ry=10.6;cy=21;}if(F.atk){cx=18;rx=14;ry=8.6;cy=23;}if(F.hit){rx=14.6;ry=7;cy=25;sp=3;ph=2;}
  const by=Math.round(cy+ry*.6),tp=[];
  for(let n=0;n<5;n++){const x=cx-9+n*4.5,t=tend(g,x,by-1,9+(n%2?3:0)+(F.b?1:0),2.2,ph+n*1.3,'b',2,(n-2)*sp*.7+(F.atk&&n>2?3:0));tp.push(t);g.s(Math.round(t[0]),Math.round(t[1]),'E');}
  sph(g,cx,cy,rx,ry,'B','b');sph(g,cx-6,cy-ry*.62,5,4.2,'B','b');sph(g,cx+4,cy-ry*.7,5.6,4.6,'B','b');
  const kx=Math.round(cx-3),ky=Math.round(cy-1);core(g,kx,ky,5.4,4.6*(F.hit?.8:1),'E','G',F.hit);
  if(F.hit)g.rect(kx-2,ky,4,1,'K');else{g.rect(kx-1,ky-2,2,4,'K');g.s(kx-1,ky-2,'W');}
  const mx=Math.round(cx+rx*.28),my=Math.round(cy+ry*.3),mo=F.atk?4:F.hit?0:1;
  if(F.hit)g.line(mx,my,mx+3,my,'K');else{g.ell(mx+4,my+1,5.2,1.2+mo*.8,'K');g.px([[mx+1,my-mo],[mx+3,my-mo],[mx+6,my-mo],[mx+2,my+2+mo],[mx+5,my+2+mo]],'W');if(F.atk)g.rect(mx+2,my+1,4,1,'R');}
  g.px(F.i?[[cx-11,cy+2],[cx+1,cy-8],[cx+9,cy+1],[cx-8,cy-6],[cx+11,cy-3]]:[[cx-10,cy+3],[cx,cy-9],[cx+10,cy],[cx-7,cy-6],[cx+12,cy-4]],'A');
  return {pal:{B:'#4a2c66',b:'#2c1c40',E:'#ff6ad0',G:'#ffc0ee',K:'#080410',W:'#f4e8ff',A:'#d8c0ff',R:'#d8305a'},flat:'EGKWAR',rim:'#5a3a8a',a:{cx,cy,rx,ry,kx,ky,mx,my,by,top:Math.round(cy-ry-3),tp}};
 },
 // ---- Star Eater: a hunched void hound with a violet back-ridge, a star clamped in its jaws and an ember star on the tail. The lunge opens the jaws wide on the star; a hit rears the head back
 stareater(g,f){const F=mfr(f);
  let bx=16,by=25,hx=29,hy=20.5,op=1.1,dy=F.b?-1:0;
  if(F.b){hy=21.5;op=1.6;}
  if(F.atk){bx=17;by=24;hx=28.5;hy=20;op=3.6;}
  if(F.hit){bx=14;by=26;hx=25.5;hy=22;op=0;}
  const tx=bx-12,ty=by-9+(F.i?1:0);
  g.path([[bx-8,by-1],[bx-12,by-3],[bx-13,by-7]],'b',3);
  g.px([[tx-1,ty],[tx,ty],[tx+1,ty],[tx,ty-1],[tx,ty+1],[tx,ty-2],[tx,ty+2]],'C');g.s(tx,ty,'A');
  limb(g,bx-5,by+4,bx-8,by+11,'b',3,'b');limb(g,bx+8,by+3,bx+10,by+11,'b',3,'b');
  sph(g,bx-5,by+3,5,4.6,'B','b');
  if(F.atk){limb(g,bx+7,by+3,hx-1,by+10,'B',3,'W');limb(g,bx+4,by+4,bx+8,by+11,'B',3,'W');}
  else{limb(g,bx+7,by+3,bx+9,by+11+(F.b?0:0),'B',3,'W');limb(g,bx+3,by+4,bx+3,by+11,'B',3,'W');}
  sph(g,bx,by+dy,11.5,6.2,'B','b');
  for(let k=0;k<4;k++){const x=bx-7+k*4.6,y=by+dy-5.2+(k==3?1.4:0);g.poly([[x-2,y+1],[x+.5,y-5.5-(k%2)],[x+3,y+1]],'D');}
  sph(g,hx-5,hy+1+dy*.5,5,5.2,'B','b');
  sph(g,hx,hy,5.8,5.2,'B','b');g.poly([[hx-3,hy-3],[hx-4,hy-8],[hx,hy-4]],'b');g.poly([[hx,hy-4],[hx+1,hy-9],[hx+3.5,hy-3]],'B');
  maw(g,hx+3,hy-1.2,7.5,op,'J','j');if(op>1)g.rect(hx+4,hy+2.4,2,Math.round(op*.8),'R');
  const sx=Math.round(hx+4+(op?2:3)),sy=Math.round(hy+(op?3.4:3.2));
  g.px([[sx,sy],[sx-1,sy],[sx+1,sy],[sx,sy-1],[sx,sy+1]],'C');if(op)g.px([[sx,sy-2],[sx,sy+2],[sx-2,sy],[sx+2,sy]],'C');g.s(sx,sy,'A');
  eye(g,hx-.4,hy-2.6,F,'E');if(!F.hit)g.rect(Math.round(hx-1),Math.round(hy-4),4,1,'K');
  g.px([[bx-6,by-1],[bx-1,by+2],[bx+3,by-2],[bx+6,by+1],[bx-9,by+2]],'A');
  return {pal:{B:'#3a3060',b:'#1e1838',D:'#8b5fd0',J:'#7a68b8',j:'#52408a',C:'#ff8a3a',R:'#ff6a3a',W:'#fff4e0',E:'#ff8a3a',K:'#0a0614',A:'#ffffff'},flat:'CRWEKA',rim:'#4a3a7a',a:{bx,by,hx,hy,tx,ty,top:hy-9,sx,sy}};
 },
 // ---- Mimic: a banded chest on stubby claw feet. Idle it sits with the lid cracked (A 2px, B 3px) and eyes in the gap; the lunge throws the lid wide with teeth and a long tongue; a hit slams it shut
 mimic(g,f){const F=mfr(f);
  let gap=F.b?4:3,fy=0;
  if(F.atk){gap=12;}if(F.hit){gap=0;fy=1;}
  const x0=6,w=28,top=24+fy,lid=top-gap-9;
  g.rect(x0,top,w,10,'w');
  slab(g,x0,top,w,10,'L','W');g.rect(x0,top+4,w,1,'w');
  g.rect(x0+6,top,2,10,'G');g.rect(x0+w-8,top,2,10,'G');g.px([[x0+6,top],[x0+w-8,top]],'Y');
  g.rect(x0-1,top+1,2,9,'w');g.rect(x0+w-1,top+1,2,9,'w');
  if(gap>0){g.rect(x0+1,top-gap,w-2,gap,'K');
   if(F.atk){g.rect(x0+2,top-gap,w-4,2,'M');}
   for(let x=x0+3;x<x0+w-3;x+=4){g.poly([[x,top-gap],[x+1.6,top-gap+(F.atk?4:2)],[x+3.2,top-gap]],'T');g.poly([[x,top],[x+1.6,top-(F.atk?4:2)],[x+3.2,top]],'T');}
   const tl=F.atk?9:2;g.poly([[x0+12,top-1],[x0+20,top-1],[x0+19,top+tl],[x0+13,top+tl+1]],'R');g.line(x0+16,top,x0+16,top+tl-1,'M');}
  slab(g,x0,lid+(F.hit?1:0),w,9,'L','W');g.rect(x0,lid+(F.hit?1:0)+6,w,1,'w');
  g.s(x0,lid+(F.hit?1:0),0);g.s(x0+w-1,lid+(F.hit?1:0),0);g.rect(x0+6,lid+(F.hit?1:0),2,9,'G');g.rect(x0+w-8,lid+(F.hit?1:0),2,9,'G');
  const ey=lid+(F.hit?1:0)+3;eye(g,x0+12,ey,F,'E');eye(g,x0+17,ey,F,'E');
  g.rect(x0+12,top+3,4,3,'G');g.rect(x0+13,top+4,2,1,'K');
  if(gap===0)g.px([[x0+9,top-1],[x0+11,top-1],[x0+13,top-1],[x0+20,top-1],[x0+22,top-1]],'T');
  g.rect(x0-2,34,6,3,'W');g.rect(x0+w-4,34,6,3,'W');g.px([[x0-2,37],[x0,37],[x0+2,37],[x0+w-3,37],[x0+w-1,37],[x0+w+1,37]],'T');
  if(F.hit)g.px([[x0+2,lid-3],[x0+w-3,lid-3],[x0+w/2,lid-5]],'T');
  return {pal:{W:'#8a5a2a',L:'#b07a3c',w:'#5a3a1a',G:'#e0b84a',Y:'#fff0a0',K:'#1a0a10',T:'#f4efe0',R:'#d8305a',M:'#6a1426',E:'#ff5a3a'},flat:'KTREY',a:{cx:20,cy:29,top:lid,gap}};
 },
 // ---- Drowned Sailor: a barnacled corpse in a tricorn and a sea-rotten coat, kelp trailing, an iron anchor for a weapon (planted on idle, swung forward in the lunge, dragged on a hit)
 drownedsailor(g,f){const F=mfr(f);
  let L=0,dy=F.b?-1:0,ring=[33,5],fl=[33,35],t=.55;
  if(F.b){ring=[34,5];}
  if(F.atk){L=2;ring=[22,2];fl=[39,30];t=.52;}
  if(F.hit){L=-2;dy=1;ring=[31,8];fl=[37,36];t=.6;}
  const hx=19+L,hy=9+dy,hand=lerp2(ring,fl,t),sw=F.i?1:0;
  g.path([[hx-4,16],[hx-7,22],[hx-8,28]],'b',3);g.px([[hx-9,29],[hx-8,30],[hx-7,29]],'B');
  g.rect(hx-5,29,3,8,'d');g.rect(hx+1,29,3,8,'d');g.rect(hx-6,36,5,2,'B');g.rect(hx,36,5,2,'B');
  g.poly([[hx-6,15],[hx+6,15],[hx+8,29],[hx+6,31],[hx+3,28],[hx,32],[hx-3,28],[hx-7,31]],'c');g.poly([[hx-6,15],[hx+3,15],[hx+3,28],[hx,31],[hx-3,28],[hx-7,30]],'C');
  g.rect(hx-6,22,13,1,'d');g.px([[hx+1,17],[hx+1,20],[hx+1,25]],'G');g.px([[hx-3,18],[hx+4,24],[hx-2,26],[hx+5,19]],'N');
  g.path([[hx-4,15],[hx-5,23],[hx-4,29]],'V');tend(g,hx-7,16,10,1.6,sw*2,'V',2,-1);tend(g,hx+6,26,7,1.4,sw*2+1,'V',1,1);
  g.poly([[hx-6,14],[hx+6,14],[hx+4,17],[hx-4,17]],'b');
  anchor(g,ring[0],ring[1],fl[0],fl[1],'S','I');
  g.path([[hx+5,16],[(hx+5+hand[0])/2+1,hand[1]-3],[hand[0],hand[1]]],'B',2);g.rect(Math.round(hand[0])-1,Math.round(hand[1])-1,3,3,'B');g.px([[hand[0]-1,hand[1]-1]],'W');
  sph(g,hx,hy,5.3,5.2,'B','b');g.poly([[hx+2,hy+2],[hx+6,hy+1],[hx+5,hy+5],[hx+2,hy+5]],'b');
  g.poly([[hx-10,hy-4],[hx-8,hy-8],[hx-3,hy-5],[hx,hy-9],[hx+3,hy-5],[hx+8,hy-8],[hx+10,hy-4],[hx+4,hy-2],[hx-4,hy-2]],'H');g.line(hx-9,hy-2.6,hx+9,hy-2.6,'h');g.px([[hx,hy-6],[hx+1,hy-6]],'G');
  eye(g,hx+1.6,hy-.4,F,'E');g.px([[hx+3,hy+3],[hx+5,hy+3],[hx+4,hy+4]],'W');
  g.px([[hx-4,hy+2],[hx-2,hy+4]],'N');
  return {pal:{B:'#9ab4a6',b:'#6a8478',C:'#4a6e80',c:'#2e4658',d:'#1e2e3c',H:'#3a4a5a',h:'#c8b060',G:'#d8c070',K:'#101a20',E:'#9affe8',S:'#8a90a4',I:'#d0d6e4',N:'#d8d4b8',V:'#3a8a4a',W:'#ffffff'},flat:'EKWG',a:{hx,hy,top:hy-9,cx:hx,cy:22,sx:Math.round(hand[0]),sy:Math.round(hand[1]),ring,fl,by:37,L,dy}};
 },
 // ---- Rime Wight: a frost-rimed hooded wraith, an icicle crown, an ice core in the chest, one prop: a rimed longsword (planted on idle, thrust in the lunge, dropped on a hit)
 rimewight(g,f){const F=mfr(f);
  let lean=0,sw=F.i?1:0,rise=F.b?-1:0,hl=[30,22],tp=[30,2];if(F.b)tp=[31,2];
  if(F.atk){lean=2;hl=[29,19];tp=[39,15];}
  if(F.hit){lean=-3;hl=[27,25];tp=[31,14];}
  const hx=20+lean,hy=11+rise,cx=20+lean*.4;
  const shape=[[hx,3+rise],[hx+7,7+rise],[30+lean*.4,18],[29,29],[30,35+sw],[25,33],[21,39-sw],[16,34],[11,36+sw],[11,29],[9,18],[hx-7,7+rise]];
  g.poly(shape,'b');g.poly([[hx,3+rise],[hx-7,7+rise],[9,18],[11,29],[11,36+sw],[16,34],[19,39-sw],[19,20],[hx+1,8+rise]],'B');
  g.px([[13,24],[15,29],[12,31],[26,26],[24,32],[28,22]],'C');g.px([[14,36+sw],[16,38],[22,38-sw],[26,35],[12,38]],'C');
  [[12,36],[17,35],[23,36],[27,34]].forEach(([x,y],n)=>g.poly([[x-1,y+sw*(n%2)],[x,y+3+n%2+sw],[x+1,y+sw*(n%2)]],'C'));
  g.ell(hx+.5,hy+.5,4.8,5,'K');g.rect(hx-2,hy,1,2,'E');g.rect(hx+2,hy,1,2,'E');g.s(hx-2,hy,'W');
  [[-5,5,4],[-3,3,8],[-1,1,5],[1,1,9],[3,3,6],[5,5,4]].forEach(([o,y,h])=>g.poly([[hx+o-1.2,3+rise+y],[hx+o,3+rise+y-h+3-(o?0:0)],[hx+o+1.2,3+rise+y]],'C'));
  const gr=F.atk?1:0;core(g,Math.round(cx),24,3.8+gr,4.4+gr,'X','C',F.hit);
  g.path([[26+lean*.5,16],[(26+hl[0])/2+1,(16+hl[1])/2],[hl[0],hl[1]]],'b',3.2);g.ell(hl[0],hl[1],1.8,1.6,'H');
  blade(g,hl[0],hl[1],tp[0],tp[1],'I','W','S');
  g.px(F.i?[[8,12],[34,10],[9,27]]:[[8,13],[34,11],[9,26]],'C');
  return {pal:{B:'#7a96c0',b:'#46608a',C:'#d4f0ff',K:'#0c1424',E:'#aaf4ff',W:'#ffffff',X:'#4ab8ff',H:'#c8dcf0',I:'#a8d0f0',S:'#5a7aa8'},flat:'EKCWX',glow:'#bfe6ff',a:{hx,hy,cx,top:3+rise,lean,sx:hl[0],sy:hl[1],tip:tp,by:36}};
 },
 // ---- Gale Phantom: a violet wind spirit, its cloak torn into streamers that blow back, a hollow hood with two lamps, one prop: a bone war horn (hung low on idle, blown in the lunge with sound rings, dropped on a hit)
 galephantom(g,f){const F=mfr(f);
  let lean=0,sw=F.i?1:0,rise=F.b?-1:0,hm=[28,24],he=[35,30],waves=0;
  if(F.b){he=[35,31];}
  if(F.atk){lean=1;hm=[25,14];he=[34,11];waves=1;}
  if(F.hit){lean=-3;hm=[26,26];he=[32,33];}
  const hx=20+lean,hy=11+rise,cx=hx;
  [[11,12,-6],[17,15,7],[24,17,-8],[31,13,6]].forEach(([y,l,ph],n)=>{const P=[];for(let i=0;i<=8;i++){const u=i/8;P.push([hx-7-u*l,y+rise*.3+Math.sin(u*6+ph+sw*1.4)*(1+u*2)+u*u*3]);}for(let i=0;i<8;i++)g.line(P[i][0],P[i][1],P[i+1][0],P[i+1][1],n%2?'b':'B',i<3?2:1);g.s(Math.round(P[8][0]),Math.round(P[8][1]),'W');});
  g.poly([[hx,3+rise],[hx+7,7+rise],[hx+9,17],[25,26],[26,32],[21,31],[18,38],[14,31],[11,30],[10,19],[hx-7,7+rise]],'b');g.poly([[hx,3+rise],[hx-7,7+rise],[10,19],[11,30],[14,31],[16,25],[hx+1,8+rise]],'B');
  g.path([[hx+1,18],[hx+2,30]],'b');g.px([[14,22],[17,29],[22,24],[20,34]],'W');
  g.ell(hx+.5,hy+.5,4.8,5,'K');g.rect(hx-2,hy,1,2,'E');g.rect(hx+2,hy,1,2,'E');g.s(hx-2,hy,'W');
  g.px([[hx-1,hy+3],[hx+1,hy+3]],'q');
  g.path([[hx+5,15],[(hx+5+hm[0])/2,(15+hm[1])/2+2],[hm[0],hm[1]]],'b',3);g.ell(hm[0],hm[1],1.7,1.6,'H');
  {const m=hm,e=he,dx=e[0]-m[0],dy=e[1]-m[1],l=Math.hypot(dx,dy)||1,ux=dx/l,uy=dy/l,px=-uy,py=ux;
   g.poly([[m[0]+px*.9,m[1]+py*.9],[e[0]-ux*3+px*1.8,e[1]-uy*3+py*1.8],[e[0]+px*3.4,e[1]+py*3.4],[e[0]-px*3.4,e[1]-py*3.4],[e[0]-ux*3-px*1.8,e[1]-uy*3-py*1.8],[m[0]-px*.9,m[1]-py*.9]],'N');
   g.line(e[0]+px*3.2,e[1]+py*3.2,e[0]-px*3.2,e[1]-py*3.2,'K',1);g.line(m[0]+ux*3,m[1]+uy*3,m[0]+ux*3+px*.1,m[1]+uy*3,'G',2);}
  if(waves){[[37,8],[38,11]].forEach(([x,y],n)=>g.path([[x,y-4-n],[x+1.5,y],[x,y+4+n]],'W',1));g.path([[33,4],[36,5]],'W');g.path([[34,18],[37,17]],'W');}
  g.px(F.i?[[6,14],[5,26],[8,34]]:[[7,13],[6,27],[7,35]],'W');
  return {pal:{B:'#8a88b8',b:'#54547e',K:'#0e0e22',E:'#c8a8ff',W:'#dff0ff',q:'#2a2850',N:'#e8e0c8',G:'#c8a850',H:'#c8c4e0'},flat:'EKW',glow:'#c8b8ff',a:{hx,hy,cx,top:3+rise,lean,hm,he,by:36}};
 }
});
['gustimp','snowharpy','yeti','stormling','gargoyle','voidspawn','stareater','mimic','drownedsailor','rimewight','galephantom'].forEach(n=>{MART[n].fr=1;});
// FAMILY4-END

const BIG_ART=['thornwarden','drake','cinderking','hoarwyrm','ysolde','dimmer','bonecolossus','queenmantis','gloomcap','ironsentinel','siren','ashwyvern','frostlich','nidhra','hollowking','seraph'];
const MON_SIZE=n=>BIG_ART.includes(n)?60:40;

// =================== ICONS ===================
function iconURL(el){return cvURL('i:'+el,()=>elShapeCv(el));} // v0.3.5: same set as the cards (see ELSHAPE in battleui.js)
function coinURL(){return cvURL('coin',()=>{const g=new PG(10,10,1,1);g.ell(4,4,4,4,'G');g.rect(3,2,2,4,'Y');return paint(g,{G:'#f0b848',Y:'#fff0a8'},{flat:'Y'});});}

// =================== FLAIR & COLOR ===================
// Per-hero accent color (A) and small costume details so the roster reads as 36 different people.
const FLAIR={
 brann:{A:'#f0b848',f:['emblem','belt2'],K:'#4a2e22',B:'#3a2418'},mira:{A:'#7ae0ff',f:['sash','gem'],B:'#2a3a6a'},sable:{A:'#e04a8a',f:['belt2'],K:'#221a2c'},
 tess:{A:'#f2d46a',f:['sash'],K:'#5a4a2a',B:'#6a3a1e'},oren:{A:'#3aa04a',f:['emblem','trim']},lumen:{A:'#7ac8ff',f:['trim','gem'],B:'#b08a4a'},
 kael:{A:'#3ad0ff',f:['pauldron','emblem'],K:'#1e2236'},pip:{A:'#f08a3a',f:['belt2'],K:'#4a3a2a',B:'#2a4a5a'},wren:{A:'#d8503a',f:['sash'],K:'#3a3a22'},
 gilda:{A:'#3ab0a0',f:['trim','sash'],K:'#5a2a3a',B:'#3a1e1e'},fenn:{A:'#f0b848',f:['trim','gem']},halden:{A:'#e04848',f:['emblem']},
 pomona:{A:'#f06a8a',f:['apron'],B:'#6a4a2a'},taro:{A:'#5a7ae0',f:['beads'],K:'#2a2a4a'},cass:{A:'#f2d46a',f:['pauldron','sash']},
 shen:{A:'#e0503a',f:['beads']},alder:{A:'#e8c060',f:['apron']},rook:{A:'#b0e04a',f:['chain','emblem']},
 marisol:{A:'#f0a03a',f:['sash','trim']},vael:{A:'#ff5ad0',f:['trim','gem']},corwin:{A:'#3a6ae0',f:['emblem','trim']},
 kit:{A:'#3ad0ff',f:['belt2','pauldron'],K:'#2a2a3a',B:'#5a3a2a'},frey:{A:'#5a7ae0',f:['trim'],K:'#3a5a7a',B:'#e8f0f8'},jun:{A:'#f2d46a',f:['beads']},
 lark:{A:'#e0503a',f:['sash'],K:'#3a5a4a'},sorrel:{A:'#f6e06a',f:['trim','gem']},
 sylva:{A:'#c8e04a',f:['sash','belt2'],K:'#3a4a3a'},gorm:{A:'#ffd04a',f:['beads']},dagna:{A:'#ff7a5a',f:['emblem','pauldron']},
 zephra:{A:'#ff9ad0',f:['trim','sash']},astra:{A:'#b080ff',f:['trim','gem']},ember:{A:'#3ad0ff',f:['trim','gem']},
 vex:{A:'#ff4a8a',f:['belt2','pauldron'],K:'#1e3434'},isolde:{A:'#f0c860',f:['trim','gem']},nyx:{A:'#c080ff',f:['pauldron']},ciro:{A:'#3a8ae0',f:['sash','belt2']}
};
const PANTS=['#3a3348','#4a3a2a','#2e3a4a','#5a2e2e','#2e4a3a','#4a4a52','#6a5a3a','#3a2a4a'];
const BOOTS=['#5a3a22','#3a2a1e','#6a4a2a','#2a2430','#7a3a2a','#4a4a5a'];
function flairOf(id){return FLAIR[id]||{f:[],A:null};}
const _heroPal0=heroPal;
heroPal=function(L,els,id){
  const p=_heroPal0(L,els),F=id?flairOf(id):{};const h=hashS(id||JSON.stringify(L.pal||{}));
  if(!(L.pal&&L.pal.K))p.K=F.K||PANTS[h%PANTS.length];
  if(!(L.pal&&L.pal.B))p.B=F.B||BOOTS[(h>>3)%BOOTS.length];
  p.A=F.A||tint(p.C,.2);
  return p;
};
function drawFlair(g,L,id,view){
  const F=flairOf(id).f||[];const robe=L.b==='robe',heavy=L.b==='heavy';
  F.forEach(f=>{
    if(view==='side'){
      if(f==='emblem'){g.rect(21,22,3,3,'A');g.px([[21,22],[23,24]],'G');}
      if(f==='sash')g.path([[18,19],[23,30]],'A',2);
      if(f==='gem'){g.px([[21,19],[23,19]],'G');g.px([[22,20],[22,21]],'C');}
      if(f==='trim'){if(robe)g.rect(13,45,15,1,'G');else g.rect(16,32,9,1,'G');}
      if(f==='belt2'){g.rect(16,29,3,3,'L');g.s(16,30,'G');}
      if(f==='pauldron'&&!heavy){g.ell(20.5,19.8,3.8,2.6,'M');g.rect(17,21,7,1,'N');g.px([[18,18],[19,18]],'c');}
      if(f==='apron'){g.rect(21,29,4,9,'w');g.rect(21,29,4,1,'A');}
      if(f==='beads')g.px([[19,20],[20,21],[21,22],[22,22],[23,21],[23,20]],'A');
      if(f==='chain')g.line(17,20,23,26,'M');
    }else{
      const front=view==='front';
      if(f==='emblem'&&front){g.rect(19,22,2,2,'A');g.px([[18,22],[21,22]],'G');}
      if(f==='sash')g.path(front?[[15,19],[25,30]]:[[25,19],[15,30]],'A',2);
      if(f==='gem'&&front){g.px([[17,19],[22,19]],'G');g.rect(19,19,2,2,'C');}
      if(f==='trim'){if(robe)g.rect(11,45,18,1,'G');else g.rect(14,32,12,1,'G');}
      if(f==='belt2'&&front){g.rect(24,28,2,3,'L');g.s(24,29,'G');}
      if(f==='pauldron'&&!heavy){g.rect(11,18,5,2,'M');g.rect(24,18,5,2,'M');g.rect(12,20,3,1,'N');g.rect(25,20,3,1,'N');g.px([[11,18],[12,18]],'c');}
      if(f==='apron'&&front){g.rect(16,29,8,9,'w');g.rect(16,29,8,1,'A');}
      if(f==='beads'&&front)g.px([[16,19],[17,20],[18,21],[19,21],[20,21],[21,21],[22,20],[23,19]],'A');
      if(f==='chain'&&front)g.line(15,19,24,24,'M');
    }
  });
}
function heroGrid(L,walk,id){return rigSide(L,walk,id);}

// =================== MONSTER DETAIL PASS ===================
// Extra color and pattern drawn over each base design.
const MEXTRA={
 thornwarden(g,p){[[18,22],[40,20],[24,46],[44,40]].forEach(q=>{g.ell(q[0],q[1],1.6,1.6,'F');g.s(q[0],q[1],'Y');});g.ell(13,16,2.5,2,'M');g.rect(12,17,3,3,'W');Object.assign(p,{F:'#f06a8a',Y:'#ffe08a',M:'#d8403a'});},
 drake(g,p){g.px([[16,40],[20,36],[28,32],[32,24],[9,46]],'S');g.path([[36,8],[38,4]],'Y');Object.assign(p,{S:'#5ad0ff'});},
 cinderking(g,p){g.rect(22,0,15,1,'G');g.px([[23,2],[29,2],[35,2]],'R');g.rect(14,30,4,2,'G');g.rect(40,30,4,2,'G');Object.assign(p,{G:'#f0c050',R:'#e04848'});},
 hoarwyrm(g,p){g.px([[10,10],[14,14],[8,6],[46,14],[44,20]],'P');g.line(18,42,32,44,'P');Object.assign(p,{P:'#5a8ae0'});},
 ysolde(g,p){g.rect(24,30,14,2,'G');g.rect(22,44,18,2,'G');g.px([[30,24],[28,36],[34,40]],'C');},
 dimmer(g,p){g.px([[18,34],[44,44],[12,50],[36,28]],'H');g.px([[24,44],[40,36]],'D');}
};
function monURL(art){return monURL2(art);}
const monURL2=function(art){return cvURL('m2:'+art,()=>{const s=MON_SIZE(art),g=new PG(s,s,0,0),o=MART[art](g);const pal=Object.assign({},o.pal);if(MEXTRA[art])MEXTRA[art](g,pal);return paint(g,pal,{flat:(o.flat||'')+'YFWCPRSTO'.split('').filter(k=>!o.pal[k]).join(''),rim:o.rim,glow:o.glow});});};
function monCanvas(art,f){return monFramed(art,f,()=>{const s=MON_SIZE(art),g=new PG(s,s,0,0),o=MART[art](g,f);const pal=Object.assign({},o.pal);if(MEXTRA[art])MEXTRA[art](g,pal);return paint(g,pal,{flat:o.flat||'',rim:o.rim,glow:o.glow});});}
