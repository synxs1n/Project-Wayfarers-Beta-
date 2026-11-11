// ===== sitelook10.js (v0.15.x): the field entrances speak for what is behind them =====
// The owner: "Den entrances should be built better, they should speak to the theming of what's inside a bit", "Sanctum entrances just look like a big gate
// now", "dungeon entrances just look like tents right now and they should have characteristics of whatever land they are on".
// Look only. Every tile, collision, 'E'/'U' footprint, cave record, lair mound mask and map check is exactly what worldgen / world4 / sites / dungeon8 build;
// this module swaps what is drawn (2D paint and the HD-2D cards / geometry / ground paint come from the same functions):
//  DEN MOUTH   (m.caves, the 'E' tile of a den): a 64 x 48 mouth sprite shaped from the realm (mound, dome, ice crown, cliff, slab) in the interior's own
//              palette (the root cavern's glowing fungus, the sea cave's kelp and cyan, the volcanic den's embers, the ice cavern's icicles, mountain rock with
//              pennants, astral stone with stars), the realm's own touch on top (thistles, apples, reeds, willow, ore timbers, salt, shards), a path of worn
//              stones leading out, a pool of the accent colour on the ground and a light of it (seen at dusk and at night).
//  LAIR FRONT  (m.ent, the main dungeon): the old tent-like hill and ent sprites get a real facade per realm in front of the door: a barrow with standing
//              stones, a cellar door under an orchard tree, a sea cave arch with a wrecked hull, a smelter gate with chimneys, a frozen vault door, a bell tower
//              base, a sunken mill wheel, a foundry gate, and for the Calamity realms the grand ruined door of the dungeon's own fiction. Any other realm gets the
//              look of its theme. The sprite is drawn on the entrance tile (the same slot the old facade had), so the footprint is unchanged.
//  SANCTUM     (m.fortAt, the 3 x 2 'U'/'E' gate): a shrine approach, not a gate: a low stone threshold, a worn stair, two guardian beasts and two lantern
//              pillars, a torii-like lintel only for the realms that suggest it (heights, coast, void), a small lit shrine niche where the door was, prayer ribbons,
//              and the realm's material (moss, salt, ember, frost, gilt, star dust). 2D paints it; HD-2D stands the pillars, lintel and stair up as geometry
//              and the statues and ribbons as cards.
const SLX={m:null,n:{den:0,lair:0,sanct:0}};
// ---------- small pixel painter: crisp ellipses and polygons, a mass shaded from the top left, an outline ----------
function slPix(w,h){const cv=mkCv(w,h),c=cv.getContext('2d');c.imageSmoothingEnabled=false;
  const P={w,h,cv,c,
    f(col,x,y,ww,hh){c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.round(ww),Math.round(hh));return P;},
    px(col,x,y){c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),1,1);return P;},
    ell(col,cx,cy,rx,ry){c.fillStyle=col;for(let y=Math.ceil(cy-ry-.5);y<=Math.floor(cy+ry-.5);y++){const dy=(y+.5-cy)/ry,s=1-dy*dy;if(s<0)continue;const hw=rx*Math.sqrt(s),x0=Math.round(cx-hw),x1=Math.round(cx+hw);c.fillRect(x0,y,Math.max(1,x1-x0),1);}return P;},
    poly(col,pts){c.fillStyle=col;let y0=1e9,y1=-1e9;pts.forEach(p=>{y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1]);});
      for(let y=Math.floor(y0);y<=Math.ceil(y1);y++){const yy=y+.5,xs=[];for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];if((a[1]<=yy&&b[1]>yy)||(b[1]<=yy&&a[1]>yy))xs.push(a[0]+(yy-a[1])/(b[1]-a[1])*(b[0]-a[0]));}
        xs.sort((p,q)=>p-q);for(let i=0;i+1<xs.length;i+=2){const x0=Math.round(xs[i]),x1=Math.round(xs[i+1]);if(x1>x0)c.fillRect(x0,y,x1-x0,1);}}return P;},
    line(col,x0,y0,x1,y1){c.fillStyle=col;const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))|0;for(let i=0;i<=n;i++){const t=n?i/n:0;c.fillRect(Math.round(x0+(x1-x0)*t),Math.round(y0+(y1-y0)*t),1,1);}return P;},
    // a mass: `shape(M)` paints it white on a mask painter; pixels are lit from the top left in the four tones rk (light, base, shade, deep)
    mass(shape,rk,o){o=o||{};const M=slPix(w,h);shape(M);const d=M.c.getImageData(0,0,w,h).data,at=(x,y)=>x>=0&&y>=0&&x<w&&y<h&&d[(y*w+x)*4+3]>100,R=mulberry(o.seed||7);
      for(let y=0;y<h;y++)for(let x=0;x<w;x++){if(!at(x,y))continue;const up=at(x,y-1),lf=at(x-1,y),dn=at(x,y+1),rt=at(x+1,y),n=(x*7+y*13+((x*y)%5))%11;
        let col=rk[1];if(n<1)col=rk[2];else if(n===5&&(x+y)%2)col=rk[0];
        if(o.brick){const ry=y%o.brick,row=Math.floor(y/o.brick),bx=Math.floor((x+(row%2)*4)/8),bn=(bx*7+row*13+(o.seed||0))%9,mort=lerpHex(rk[2],rk[3],.45);
          if(ry===o.brick-1||((x+(row%2)*4)%8)===0)col=mort;else{if(bn<2)col=rk[0];else if(bn===4||bn===5)col=lerpHex(rk[1],rk[2],.55);if(ry===0)col=lerpHex(col,rk[0],.5);}}
        if(!up||!at(x,y-2)&&R()<.5)col=rk[0];if(!lf&&up)col=rk[0];if(!rt||!dn)col=rk[2];if(!dn&&!rt)col=rk[3];
        if(o.fall&&y>h*.72&&col===rk[1])col=rk[2];
        c.fillStyle=col;c.fillRect(x,y,1,1);}
      return {at,w,h};},
    // 1px dark line round whatever is drawn so far
    outline(col){const d=c.getImageData(0,0,w,h),a=d.data,add=[];for(let y=0;y<h;y++)for(let x=0;x<w;x++){if(a[(y*w+x)*4+3]>0)continue;
        const n=[[1,0],[-1,0],[0,1],[0,-1]].some(([i,j])=>{const X=x+i,Y=y+j;return X>=0&&Y>=0&&X<w&&Y<h&&a[(Y*w+X)*4+3]>120;});if(n)add.push([x,y]);}
      c.fillStyle=col;add.forEach(([x,y])=>c.fillRect(x,y,1,1));return P;},
    // form light (upper left): a five step ramp across every part from the distance to its silhouette edges (lit left and top, shaded right and bottom) and a
    // diagonal gradient over the whole sprite, a cool rim on the shadow edge, a darker contact band at the foot, a halo on emissive pixels
    light(o){o=o||{};const k=o.k==null?1:o.k,d=c.getImageData(0,0,w,h),a=d.data,src=new Uint8ClampedArray(a),A=(x,y)=>x>=0&&x<w&&y>=0&&y<h?src[(y*w+x)*4+3]>100:(x>=0&&x<w&&y>=h),
      E=(x,y)=>{const i=(y*w+x)*4;return src[i+3]>100&&slEm(src[i],src[i+1],src[i+2]);},dd=(x,y,dx,dy)=>{let n=0;while(n<4&&A(x+dx*(n+1),y+dy*(n+1)))n++;return n;},
      mx=(i,t,r,g,b)=>{a[i]=a[i]+(r-a[i])*t;a[i+1]=a[i+1]+(g-a[i+1])*t;a[i+2]=a[i+2]+(b-a[i+2])*t;},ed=n=>n===0?1:n<3?.5:0;
      for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;if(src[i+3]<=100||E(x,y))continue;const lum=src[i]*.3+src[i+1]*.59+src[i+2]*.11;
        let L=ed(dd(x,y,0,-1))+ed(dd(x,y,-1,0))-ed(dd(x,y,1,0))-ed(dd(x,y,0,1))-(x/w+y/h-1)*2.1;const s=Math.max(-2,Math.min(2,Math.round(L*k)));
        if(s>0&&lum>46)mx(i,.12*s,255,244,214);else if(s<0)mx(i,.15*-s,22,16,52);
        if(!A(x+1,y)&&y<h-3&&lum>46&&s<=0)mx(i,.22,110,150,230);
        if(o.base!==0&&y>=h-3&&lum>30)mx(i,y===h-1?.42:y===h-2?.26:.12,22,16,44);}
      for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(E(x,y)){const i=(y*w+x)*4;[[1,0],[-1,0],[0,1],[0,-1]].forEach(([p,q])=>{const X=x+p,Y=y+q;if(X<0||Y<0||X>=w||Y>=h||src[(Y*w+X)*4+3]<=100||E(X,Y))return;mx((Y*w+X)*4,.26,src[i],src[i+1],src[i+2]);});}
      c.putImageData(d,0,0);return P;},
    // a line round whatever is drawn so far in a darker shade of the colour it borders (glowing parts keep a warm edge)
    outline2(col){const d=c.getImageData(0,0,w,h),a=d.data,add=[],B=hx(col),at=(x,y)=>x>=0&&y>=0&&x<w&&y<h&&a[(y*w+x)*4+3]>120;
      for(let y=0;y<h;y++)for(let x=0;x<w;x++){if(a[(y*w+x)*4+3]>0)continue;let r=0,g=0,b=0,n=0,em=0;
        [[1,0],[-1,0],[0,1],[0,-1]].forEach(([i,j])=>{const X=x+i,Y=y+j;if(!at(X,Y))return;const o=(Y*w+X)*4;r+=a[o];g+=a[o+1];b+=a[o+2];n++;if(slEm(a[o],a[o+1],a[o+2]))em++;});
        if(!n)continue;r/=n;g/=n;b/=n;const t=em?.45:.72,T=em?[70,18,10]:B;add.push([x,y,'rgb('+Math.round(r+(T[0]-r)*t)+','+Math.round(g+(T[1]-g)*t)+','+Math.round(b+(T[2]-b)*t)+')']);}
      add.forEach(([x,y,col])=>{c.fillStyle=col;c.fillRect(x,y,1,1);});return P;},
    glow(col,cx,cy,r,al){const g=c.createRadialGradient(cx,cy,0,cx,cy,r);const q=hx(col);g.addColorStop(0,'rgba('+q.join(',')+','+al+')');g.addColorStop(1,'rgba('+q.join(',')+',0)');c.fillStyle=g;c.fillRect(cx-r,cy-r,r*2,r*2);return P;}};
  return P;}
function slEm(r,g,b){const mx=Math.max(r,g,b),mn=Math.min(r,g,b);return mx>185&&(mx-mn)/mx>.42;}
// an arch cut into a face: dark above, the interior's colour glowing at the sill
function slOpen(P,cx,by,w,h,inner,o){o=o||{};const r=w/2,top=by-h;
  for(let y=top;y<=by;y++){const t=(y-top)/h,hw=y<top+r?Math.sqrt(Math.max(0,r*r-(top+r-y-.5)*(top+r-y-.5))):r;const col=lerpHex('#06040a',inner,Math.pow(t,2)*(o.k||.6));P.f(col,Math.round(cx-hw),y,Math.round(hw*2),1);}
  return P;}
function slCol(a,b,t){return lerpHex(a,b,t);}
function slDrip(P,mask,x0,x1,col,col2,len,seed){const R=mulberry(seed||3);for(let x=x0;x<x1;x++){let y=0;while(y<P.h&&!mask.at(x,y))y++;if(y>=P.h)continue;if(R()<.7){const l=1+Math.floor(R()*len);P.f(col,x,y-1,1,l+1);if(col2&&R()<.4)P.px(col2,x,y+l);}}}
// ---------- the realm ----------
function slZone(m){let z=null;try{z=ZS(m.s);}catch(e){}return z||{};}
function slKey(m){const z=slZone(m),th=m&&m.theme||z.theme||'meadow';return {key:z.key||'',th,dun:z.dungeon||'',cal:!!z.cal,lean:z.lean||{},z};}
const SL_TH={meadow:'thistle',coast:'strand',cave:'deeps',snow:'tundra',heights:'peaks',void:'starless'};
const slRealmKey=m=>{const k=slKey(m);return k.key&&SL_DEN[k.key]?k.key:(SL_TH[k.th]||'thistle');};
// ---------- DENS ----------
// the interior (dungeon8 D8_CAVE by theme): meadow root cavern (fungus glow), coast sea cave, cave volcanic, snow ice cavern, heights mountain, void astral
const SL_ROCK={g:['#a8a496','#8a8678','#6a665a','#3c382e'],w:['#8f9aa0','#6f7c82','#505c62','#2a3438'],b:['#6a5a52','#544640','#3c302c','#1a1210'],i:['#cfe2f2','#a6c0da','#7e9ab8','#3e5578'],
  m:['#9a98a8','#7e7c8e','#5e5c70','#2c2a3c'],v:['#5a4e80','#443a66','#322a4c','#150f26'],s:['#d4b080','#b8946a','#8c6c48','#4a3420'],u:['#6a6260','#524a48','#3a3432','#18120f'],t:['#8c7a58','#72623e','#564a2e','#2a2214']};
const SL_DEN={
 thistle:{shape:'mound',rk:'g',cap:'#6aa044',cap2:'#4e8a34',deco:['roots','thistle'],inner:'#3a6a3a',acc:'#7af0a0',acc2:'#c890f0',lt:'fungus',lc:'rgba(120,255,190,.3)'},
 orchard:{shape:'mound',rk:'t',cap:'#8a9a3a',cap2:'#5a7a2a',deco:['roots','apples'],inner:'#7a5a1a',acc:'#ffb04a',acc2:'#ff6a3a',lt:'gold'},
 lakes:{shape:'mound',rk:'w',cap:'#5a9a58',cap2:'#3e7a44',deco:['willow','lily'],inner:'#2a6a62',acc:'#7af0c8',acc2:'#c0f0a0',lt:'fungus'},
 strand:{shape:'dome',rk:'w',cap:'#e8e0c0',cap2:'#c8c09a',deco:['kelp','barnacle'],inner:'#1a6670',acc:'#5ad0c0',acc2:'#f0a0b0',lt:'cyan'},
 mire:{shape:'mound',rk:'u',cap:'#4a7a3a',cap2:'#34602a',deco:['reeds','kelp'],inner:'#2a5a46',acc:'#9ad07a',acc2:'#c8e0a0',lt:'cyan'},
 drowned:{shape:'dome',rk:'v',cap:'#4a6a8a',cap2:'#34506a',deco:['kelp','pearl'],inner:'#1a5a70',acc:'#70e8d8',acc2:'#f0b0e0',lt:'cyan'},
 deeps:{shape:'cliff',rk:'b',cap:'#3a3230',cap2:'#2a2220',deco:['ember','smoke'],inner:'#9a3010',acc:'#ff8a3a',acc2:'#ffd04a',lt:'fire'},
 grotto:{shape:'dome',rk:'b',cap:'#3a5a4a',cap2:'#2a4a3a',deco:['mush','ember'],inner:'#7a3a18',acc:'#7af0d0',acc2:'#c0a0ff',lt:'cyan'},
 mines:{shape:'slab',rk:'u',cap:'#4a4440',cap2:'#34302c',deco:['timber','ore'],inner:'#6a3a14',acc:'#ffb040',acc2:'#ff7a2a',lt:'torch'},
 tundra:{shape:'ice',rk:'i',cap:'#ffffff',cap2:'#d8ecfa',deco:['ice'],inner:'#2e5a9a',acc:'#bfe6ff',acc2:'#e8f8ff',lt:'ice',lc:'rgba(150,215,255,.3)'},
 glacier:{shape:'ice',rk:'i',cap:'#f4faff',cap2:'#cfe4f4',deco:['ice','pennant'],inner:'#3a64aa',acc:'#8fd0ff',acc2:'#ffd04a',lt:'ice',lc:'rgba(150,215,255,.3)'},
 peaks:{shape:'cliff',rk:'m',cap:'#e8eef4',cap2:'#c0ccd8',deco:['pennant','cairn'],inner:'#3a4a6a',acc:'#8ad0ff',acc2:'#f2c93a',lt:'ice',lc:'rgba(150,215,255,.3)'},
 mesa:{shape:'slab',rk:'s',cap:'#e8cc96',cap2:'#d4b47c',deco:['sand','pennant'],inner:'#6a4418',acc:'#f2c93a',acc2:'#e8703a',lt:'gold'},
 shattered:{shape:'cliff',rk:'m',cap:'#c8c8d8',cap2:'#9a9ab0',deco:['shards'],inner:'#3a3460',acc:'#ffe08a',acc2:'#8ad0ff',lt:'gold'},
 ashglass:{shape:'dome',rk:'s',cap:'#f4f8f4',cap2:'#bfe8e0',deco:['salt'],inner:'#3a4a60',acc:'#e8f4ff',acc2:'#8adccc',lt:'cyan'},
 ashen:{shape:'cliff',rk:'b',cap:'#2a2624',cap2:'#1a1614',deco:['ember','stars'],inner:'#7a2a14',acc:'#ff6a3a',acc2:'#b080ff',lt:'fire'},
 starless:{shape:'cliff',rk:'v',cap:'#3a3060',cap2:'#2a2248',deco:['stars'],inner:'#3a2a6a',acc:'#b080ff',acc2:'#8ae6d4',lt:'violet'}};
function slDenShape(P,sh){const W=P.w,H=P.h;
  if(sh==='mound')return M=>{M.ell('#fff',32,36,28,14);M.f('#fff',4,36,56,12);M.ell('#fff',32,30,20,10);};
  if(sh==='dome')return M=>{M.ell('#fff',32,32,26,18);M.f('#fff',6,32,52,16);M.ell('#fff',14,38,10,8);M.ell('#fff',50,38,10,8);};
  if(sh==='ice')return M=>{M.poly('#fff',[[3,47],[6,26],[12,18],[16,8],[22,16],[27,3],[33,15],[39,6],[44,17],[50,12],[56,24],[61,47]]);};
  if(sh==='slab')return M=>{M.f('#fff',4,16,56,32);M.f('#fff',2,26,60,22);M.f('#fff',10,12,20,6);};
  return M=>{M.poly('#fff',[[2,47],[5,24],[14,12],[24,6],[34,5],[46,10],[56,22],[62,47]]);M.ell('#fff',32,24,22,14);};}
const SL_DENC={};
function slDenSprite(m){return slDenByKey(slRealmKey(m));}
function slDenByKey(key){const L=SL_DEN[key];const id='den:'+key;if(SL_DENC[id])return SL_DENC[id];
  const P=slPix(64,48),rk=SL_ROCK[L.rk],cx=32,by=47,R=mulberry(hashS(id)),oh=L.shape==='slab'||L.shape==='cliff'?17:15,ow=L.shape==='ice'?14:16;
  const mass=P.mass(slDenShape(P,L.shape),rk,{seed:hashS(id),fall:1,brick:L.shape==='slab'?6:0});
  // the face and a ledge of lighter stone round the opening
  P.poly(rk[0],[[cx-ow/2-3,by],[cx-ow/2-3,by-oh+3],[cx,by-oh-3],[cx+ow/2+3,by-oh+3],[cx+ow/2+3,by]]);
  P.poly(rk[2],[[cx-ow/2-2,by],[cx-ow/2-2,by-oh+3],[cx,by-oh-2],[cx+ow/2+2,by-oh+3],[cx+ow/2+2,by]]);
  slOpen(P,cx,by,ow,oh,L.inner,{k:.8});
  P.f(rk[3],cx-ow/2-3,by-oh+2,1,oh-1);P.f(rk[3],cx+ow/2+2,by-oh+2,1,oh-1);// reveal shadows
  // the cap on the top (moss, snow, salt, ash)
  slDrip(P,mass,6,58,L.cap,L.cap2,L.shape==='ice'?2:3,hashS(id)+1);
  for(let x=0;x<64;x++){let y=0;while(y<48&&!mass.at(x,y))y++;if(y<48&&((x*5+y)%3)){P.px(L.cap,x,y);P.px(L.cap2,x,y+1);}}
  const D={P,rk,L,cx,by,oh,ow,mass,R};L.deco.forEach(d=>{const f=SL_DECO[d];if(f)f(D);});
  P.light();P.outline2('#120c14');
  // soft light from the opening (a glow over the sill) after the outline so it stays soft
  P.glow(L.acc,cx,by-3,13,.22);
  return SL_DENC[id]=P.cv;}
slDenByKey=HOOK.def('slDenByKey',slDenByKey);// v0.19.2: worldart12.js gives the den mouth volume
const SL_DECO={
 roots:D=>{const {P,cx,by,oh,ow}=D;[[-1,0],[1,0]].forEach(([s])=>{for(let i=0;i<3;i++){let x=cx+s*(ow/2-i*2),y=by-oh+3+i;for(let k=0;k<7+i*2;k++){P.px(i%2?'#5a3a1e':'#7a4e28',x,y+k);if(k%3===1)x+=s*(i%2?-1:1);}}});
    P.f('#7a4e28',cx-ow/2-5,by-6,3,6);P.f('#7a4e28',cx+ow/2+2,by-5,3,5);P.px('#9a6a38',cx-ow/2-5,by-6);},
 thistle:D=>{const {P}=D;[[8,43],[13,45],[48,44],[54,42],[20,46],[41,46]].forEach(([x,y],i)=>{P.f('#4e8a34',x,y-1,1,3);P.f('#b58ad0',x-1,y-3,3,2);P.px('#e8c8f0',x,y-3);if(i%2)P.px('#7a4a9a',x+1,y-2);});},
 apples:D=>{const {P,L}=D;[[10,45],[16,46],[46,46],[52,44],[22,47]].forEach(([x,y])=>{P.f('#c8382a',x,y-2,3,3);P.px('#ff8a6a',x,y-2);P.px('#3a2a1a',x+1,y-3);});P.f('#5a7a2a',6,22,6,3);P.f('#7a9a3a',8,21,4,2);P.px('#e05a3a',9,24);P.px('#ffd040',11,22);},
 willow:D=>{const {P}=D;[[10,18],[16,20],[22,22],[40,22],[46,20],[52,18]].forEach(([x,y],i)=>{for(let k=0;k<12+i%3*3;k++)P.px(k%4===3?'#7ac07a':'#4a8a4a',x+(k>6?(i<3?-1:1):0),y+k);});},
 lily:D=>{const {P}=D;P.ell('#1a5a62',32,46,15,2);[[24,46],[40,46],[44,47]].forEach(([x,y])=>{P.ell('#4a9a5a',x,y,3,1);P.px('#f0a0c0',x,y-1);});},
 kelp:D=>{const {P,cx,by,oh,ow}=D;[[cx-ow/2-1],[cx+ow/2+1],[cx-ow/2-6],[cx+ow/2+6]].forEach(([x],i)=>{let xx=x;for(let k=0;k<12+(i%2)*5;k++){P.px(k%5<2?'#3a8a4a':'#2a6a3a',xx,by-oh+2+k);if(k%3===2)xx+=(k%6<3?1:-1);}});
    P.f('#1a3a3a',8,44,48,3);for(let i=0;i<8;i++)P.px('#5a9a8a',9+i*6,43+(i%2));},
 barnacle:D=>{const {P}=D;for(let i=0;i<16;i++){const x=6+((i*13)%50),y=30+((i*7)%15);if(x>24&&x<40&&y>30)continue;P.f('#e8e0d0',x,y,2,1);P.px('#fff8e8',x,y);}[[12,46],[50,45]].forEach(([x,y])=>{P.f('#f0a0b0',x,y-1,3,2);P.px('#fff0f0',x+1,y-1);});},
 reeds:D=>{const {P}=D;[[7,18],[10,22],[54,20],[57,24]].forEach(([x,y],i)=>{P.f('#5a7a3a',x,y,1,26-y+22);P.f('#7a4a2a',x-1,y-5,3,5);P.px('#a8744a',x,y-5);});for(let i=0;i<6;i++)P.f('#5a7a3a',10+i*8,43,1,4);},
 pearl:D=>{const {P}=D;[[10,44],[16,46],[48,45]].forEach(([x,y])=>{P.f('#f6ecf4',x,y,3,3);P.px('#ffffff',x,y);});for(let i=0;i<4;i++)P.f(i%2?'#f08aa8':'#8ae0d0',8+i*13,38+i%2*3,2,5);},
 ember:D=>{const {P,L,rk,mass}=D;const cr=(x,y,l,s)=>{for(let k=0;k<l;k++){P.px(k%3===2?L.acc2:L.acc,x,y+k);if(k%3===1)x+=s;}};cr(14,24,12,1);cr(50,26,10,-1);cr(10,36,8,1);cr(54,36,8,-1);cr(22,18,6,1);
    for(let i=0;i<7;i++)P.px(i%2?L.acc2:L.acc,12+((i*9)%40),12+((i*5)%28));},
 smoke:D=>{const {P}=D;for(let k=0;k<10;k++){const a=.5-k*.045;P.c.fillStyle='rgba(190,185,190,'+a.toFixed(2)+')';P.c.fillRect(30+Math.round(Math.sin(k/2)*3)+k%2,3-Math.floor(k/3),2+(k>4?1:0),1);}},
 mush:D=>{const {P,L,cx,by}=D;const mk=(x,y,s,c1,c2)=>{P.f('#e8e0d0',x,y-s,1+(s>3?1:0),s);P.ell(c1,x+(s>3?1:.5),y-s-1,1+s*.7,1+s*.3);P.px(c2,x,y-s-2);};
    [[9,47,5,L.acc,'#ffffff'],[14,47,3,L.acc2,'#ffffff'],[19,47,2,L.acc,'#ffffff'],[45,47,3,L.acc2,'#ffffff'],[50,47,5,L.acc,'#ffffff'],[55,47,3,L.acc2,'#ffffff'],[12,26,3,L.acc,'#ffffff'],[52,28,4,L.acc2,'#ffffff'],[22,17,2,L.acc,'#ffffff']].forEach(a=>mk(...a));},
 ice:D=>{const {P,cx,by,oh,ow}=D;for(let x=cx-ow/2-3;x<=cx+ow/2+3;x+=2){const l=2+((x*7)%6);P.f('#e8f6ff',x,by-oh+(Math.abs(x-cx)>ow/2?3:-1)-0,1,l);P.px('#ffffff',x,by-oh-1+(Math.abs(x-cx)>ow/2?4:0));}
    for(let i=0;i<4;i++)P.f('rgba(240,250,255,.5)',10+i*13,20+i*3,1,10);P.f('#bfe6ff',10,44,10,1);P.f('#bfe6ff',44,45,10,1);[[8,45],[15,46],[48,46],[54,45]].forEach(([x,y])=>{P.poly('#d8f0ff',[[x,y],[x+1,y-5],[x+2,y]]);P.px('#ffffff',x+1,y-4);});},
 pennant:D=>{const {P,L}=D;P.f('#3a2a1a',8,10,1,24);P.f('#3a2a1a',55,12,1,22);P.line('#c8b090',9,11,55,13);[[14,12,L.acc2],[22,12,L.acc],[30,13,L.acc2],[38,13,L.acc],[46,13,L.acc2]].forEach(([x,y,c])=>{P.poly(c,[[x,y],[x+5,y],[x+2.5,y+6]]);});},
 cairn:D=>{const {P,rk}=D;[[10,47,5],[10,44,4],[11,41,3],[51,47,6],[52,44,4],[52,41,3]].forEach(([x,y,w])=>{P.f(rk[0],x,y-2,w,3);P.f(rk[2],x,y,w,1);});},
 timber:D=>{const {P,cx,by,oh,ow}=D;const x0=cx-ow/2-2,x1=cx+ow/2+1;P.f('#5a3a1e',x0,by-oh,3,oh+1);P.f('#7a4e28',x0,by-oh,1,oh+1);P.f('#5a3a1e',x1-1,by-oh,3,oh+1);P.f('#7a4e28',x1-1,by-oh,1,oh+1);P.f('#5a3a1e',x0-2,by-oh-3,ow+8,3);P.f('#7a4e28',x0-2,by-oh-3,ow+8,1);P.f('#3a2a1a',x0-2,by-oh,ow+8,1);
    P.f('#2a2a30',cx-8,by,16,1);P.f('#8a8a98',cx-8,by-1,16,1);for(let i=0;i<5;i++)P.f('#5a3a1e',cx-8+i*4,by,2,1);P.f('#d8a838',x0+1,by-oh-6,3,3);P.px('#fff0a0',x0+2,by-oh-6);},
 ore:D=>{const {P,L}=D;[[10,30],[16,38],[46,32],[52,40],[12,22]].forEach(([x,y])=>{P.f(L.acc,x,y,2,2);P.px('#fff0b0',x,y);});P.f('#5a5a68',48,42,8,4);P.f('#8a8a98',48,42,8,1);P.f('#b0a090',49,40,6,2);},
 sand:D=>{const {P,rk}=D;for(let y=22;y<46;y+=6){P.f(rk[0],4,y,56,1);P.f(rk[2],4,y+1,56,1);}[[12,45],[50,46]].forEach(([x,y])=>{P.f('#f2c93a',x,y,3,1);P.px('#fff6c0',x,y);});},
 shards:D=>{const {P,L}=D;[[14,6,5],[26,2,4],[40,5,6],[50,11,4]].forEach(([x,y,s],i)=>{P.poly(i%2?L.acc2:L.acc,[[x,y+s],[x+s/2,y],[x+s,y+s],[x+s/2,y+s+3]]);P.px('#ffffff',x+s/2-1,y+2);});},
 salt:D=>{const {P,L}=D;for(let i=0;i<18;i++){const x=6+((i*17)%52),y=18+((i*11)%26);if(x>22&&x<42&&y>28)continue;P.f(i%3?L.cap:L.acc2,x,y,2,1);}[[9,46],[14,47],[48,46],[54,47]].forEach(([x,y])=>{P.poly('#f4f8f4',[[x,y],[x+1,y-5],[x+3,y]]);P.px('#8adccc',x+1,y-3);});P.f('#bfe8e0',5,47,54,1);},
 stars:D=>{const {P,L}=D;for(let i=0;i<14;i++)P.px(i%3?'#ffffff':L.acc2,6+((i*19)%52),8+((i*13)%34));[[10,45],[53,44],[16,46]].forEach(([x,y])=>{P.poly(L.acc,[[x,y],[x+1.5,y-6],[x+3,y]]);P.px('#e8d8ff',x+1,y-4);});[[44,16],[18,14]].forEach(([x,y])=>{P.px('#ffffff',x,y);P.px(L.acc2,x-1,y);P.px(L.acc2,x+1,y);P.px(L.acc2,x,y-1);P.px(L.acc2,x,y+1);});}};
// ---------- the ground in front of a den mouth (tile local): worn path stones, a pool of the accent colour, the interior's small signs ----------
function slSites(m){if(!m||m.kind!=='field')return null;const key=(m.caves||[]).length+':'+(m.ent||[]).join()+':'+(m.d8lair?1:0)+':'+(m.fortAt||[]).join();if(m.__sls&&m.__sls.s===key)return m.__sls;
  const o={s:key,tiles:{},dens:[],lair:null,sh:[]};
  (m.caves||[]).forEach(c=>{if(c.kind==='fort')return;const fv=c.face||[0,1];o.dens.push(c);for(let k=0;k<=3;k++){const x=c.x+fv[0]*k,y=c.y+fv[1]*k;o.tiles[x+','+y]={den:c,k,fv};}
    [[-1,1],[1,1],[-1,2],[1,2],[0,1]].forEach(([a,b])=>{const x=c.x+(fv[1]?a:b*fv[0]),y=c.y+(fv[0]?a:b*fv[1]);const kk=x+','+y;if(!o.tiles[kk])o.tiles[kk]={den:c,k:-1,fv,side:1};});});
  if(m.ent){const fv=m.entFace||[0,1];o.lair={x:m.ent[0],y:m.ent[1],fv};for(let k=1;k<=4;k++){const x=m.ent[0]+fv[0]*k,y=m.ent[1]+fv[1]*k;o.tiles[x+','+y]={lair:o.lair,k,fv};}}
  // cast shadows on the ground (light from the upper left: the shadow falls to the lower right): [x, y, rx, ry] in map px
  (m.caves||[]).forEach(c=>{if(c.kind!=='fort')o.sh.push([c.x*TS+11,c.y*TS+10,31,4,1]);});
  if(m.ent&&!m.d8lair)o.sh.push([m.ent[0]*TS+11,m.ent[1]*TS+10,31,4,1]);
  if(m.fortAt)o.sh.push([m.fortAt[0]*TS+11,(m.fortAt[1]+1)*TS+1,28,4]);
  m.__sls=o;return o;}
const SL_PATHOK='.,f=';
function slStones(ctx,px,py,fv,rk,R,wet){const hz=!!fv[0];for(let i=0;i<3;i++){const t=2+i*5,l=((i*3+R(2))%3)-1,w=hz?4:6,h=hz?6:4,x=hz?t:(5+l*2),y=hz?(5+l*2):t;
    ctx.fillStyle='rgba(20,16,24,.28)';ctx.fillRect(px+x+1,py+y+h-1,w,2);ctx.fillStyle=rk[3];ctx.fillRect(px+x-1,py+y-1,w+2,h+2);ctx.fillStyle=rk[1];ctx.fillRect(px+x,py+y,w,h);ctx.fillStyle=rk[0];ctx.fillRect(px+x,py+y,w,1);ctx.fillRect(px+x,py+y,1,h);ctx.fillStyle=rk[2];ctx.fillRect(px+x+1,py+y+h-1,w-1,1);if(wet)for(let k=0;k<2;k++){ctx.fillStyle=wet;ctx.fillRect(px+x+1+k*2,py+y+1,1,1);}}}
function slDenGround(ctx,m,x,y,T){const L=SL_DEN[slRealmKey(m)],rk=SL_ROCK[L.rk],c=T.den,px=x*TS,py=y*TS,R=mulberry(x*131+y*71+m.s*13),rr=n=>Math.floor(R()*n);
  const ch=tileAt(m,x,y);if(!SL_PATHOK.includes(ch))return;
  ctx.save();ctx.beginPath();ctx.rect(px,py,16,16);ctx.clip();
  // the pool of light and weathering on the ground in front of the mouth
  const fv=T.fv,gx=(c.x+.5+fv[0]*.6)*TS,gy=(c.y+.5+fv[1]*.6)*TS;ctx.globalAlpha=.2;const g=ctx.createRadialGradient(gx,gy,1,gx,gy,24);const q=hx(L.acc);g.addColorStop(0,'rgba('+q.join(',')+',.7)');g.addColorStop(1,'rgba('+q.join(',')+',0)');ctx.fillStyle=g;ctx.fillRect(px,py,16,16);ctx.globalAlpha=1;
  if(T.k>=1&&T.k<=3&&!T.side){slStones(ctx,px,py,fv,rk,i=>(x*3+y*5+i)%3,L.shape==='dome'||L.shape==='ice'?(L.cap2):null);}
  // the signs of what lies inside, scattered at the sides of the path
  const bits=L.deco.includes('mush')||L.deco.includes('roots')&&L.lt==='fungus'?'mush':L.deco.includes('ice')?'ice':L.deco.includes('kelp')?'kelp':L.deco.includes('ember')?'ember':L.deco.includes('salt')?'salt':L.deco.includes('stars')?'stars':L.deco.includes('thistle')?'thistle':L.deco.includes('apples')?'apples':L.deco.includes('timber')?'ore':L.deco.includes('sand')?'sand':L.deco.includes('shards')?'shards':'moss';
  const n=T.side?2:2;for(let i=0;i<n;i++){const bx=px+1+rr(13),by=py+2+rr(12),s=T.k>=1&&T.k<=3&&Math.abs(bx-px-8)<4&&!fv[0]?1:0;if(s)continue;
    if(bits==='mush'){ctx.fillStyle='#e8e0d0';ctx.fillRect(bx,by,1,2);ctx.fillStyle=i%2?L.acc:L.acc2;ctx.fillRect(bx-1,by-1,3,1);ctx.fillStyle='#fff';ctx.fillRect(bx,by-1,1,1);}
    else if(bits==='ice'){ctx.fillStyle='#e8f6ff';ctx.fillRect(bx,by-2,1,3);ctx.fillStyle='#fff';ctx.fillRect(bx,by-2,1,1);ctx.fillStyle='#9ac8e8';ctx.fillRect(bx+1,by,1,1);}
    else if(bits==='kelp'){ctx.fillStyle=i%2?'#f0a0b0':'#e8e0d0';ctx.fillRect(bx,by,2,1);ctx.fillStyle='#2a6a3a';ctx.fillRect(bx+2,by-2,1,3);}
    else if(bits==='ember'){ctx.fillStyle='#1a1412';ctx.fillRect(bx,by,2,1);ctx.fillStyle=i%2?L.acc:L.acc2;ctx.fillRect(bx+2,by,1,1);}
    else if(bits==='salt'){ctx.fillStyle='#f4f8f4';ctx.fillRect(bx,by-1,1,2);ctx.fillStyle='#8adccc';ctx.fillRect(bx+1,by,1,1);}
    else if(bits==='stars'){ctx.fillStyle=i%2?'#ffffff':L.acc;ctx.fillRect(bx,by,1,1);ctx.fillStyle=L.acc2;ctx.fillRect(bx+1,by,1,1);ctx.fillRect(bx,by+1,1,1);}
    else if(bits==='thistle'){ctx.fillStyle='#4e8a34';ctx.fillRect(bx,by,1,3);ctx.fillStyle='#b58ad0';ctx.fillRect(bx-1,by-1,3,2);}
    else if(bits==='apples'){ctx.fillStyle='#c8382a';ctx.fillRect(bx,by,2,2);ctx.fillStyle='#ff8a6a';ctx.fillRect(bx,by,1,1);}
    else if(bits==='ore'||bits==='sand'||bits==='shards'){ctx.fillStyle=L.acc;ctx.fillRect(bx,by,1,1);ctx.fillStyle=rk[0];ctx.fillRect(bx+1,by+1,2,1);}
    else{ctx.fillStyle='#5a8a3a';ctx.fillRect(bx,by,1,2);ctx.fillRect(bx+1,by+1,1,1);}}
  ctx.restore();}
// ---------- hooks: 2D tiles and the HD ground share drawTile ----------
HOOK.after('drawTile','sitelook10','den and lair ground, cast shadows',function(r,ctx,m,x,y,frame){
  try{if(m&&m.kind==='field'&&!m.fort){const S=slSites(m),T=S&&S.tiles[x+','+y];if(T){if(T.den)slDenGround(ctx,m,x,y,T);else if(T.lair)slLairGround(ctx,m,x,y,T);}
    if(S&&!SLX.noAO){slCast(ctx,m,S,x,y);if(m.d8lair)slMoundAO(ctx,m,x,y);}}}catch(e){slErr('tile',e);}});
// the contact shadow of a front on the ground (a wide soft one and a dark core under the foot, thrown to the lower right) and the ambient occlusion where a lair mound meets
// the ground (dark at the foot of its right and lower sides, a faint one on the left): drawn into the ground tiles, so 2D and the HD-2D ground bake share it
function slCast(ctx,m,S,x,y){if(!S.sh.length||'~#'.includes(tileAt(m,x,y)))return;const px=x*TS,py=y*TS;
  const hd=typeof hdActive==='function'&&hdActive();// the HD-2D card stands on the line at the foot of its row: the shadow goes in front of it
  S.sh.forEach(([ax,ay,rx,ry,card])=>{if(card&&hd)ay+=7;if(ax+rx<px||ax-rx>px+TS||ay+ry<py||ay-ry>py+TS)return;ctx.save();ctx.beginPath();ctx.rect(px,py,TS,TS);ctx.clip();
    ctx.fillStyle='rgba(24,16,40,'+(hd?.4:.28)+')';ctx.beginPath();ctx.ellipse(ax,ay,rx,ry,0,0,7);ctx.fill();ctx.fillStyle='rgba(18,10,32,'+(hd?.55:.38)+')';ctx.beginPath();ctx.ellipse(ax+1,ay-1,rx*.8,ry*.62,0,0,7);ctx.fill();
    ctx.fillStyle='rgba(14,8,26,.28)';ctx.fillRect(Math.max(px,ax-rx*.78),Math.max(py,ay-2),Math.min(rx*1.56,TS),2);ctx.restore();});}
function slMoundAO(ctx,m,x,y){const mk=m.d8lair.mask;if(mk.has(x+','+y))return;const px=x*TS,py=y*TS,has=(a,b)=>mk.has((x+a)+','+(y+b)),n=[has(-1,0),has(1,0),has(0,-1),has(0,1)];if(!n.some(Boolean)&&!has(-1,-1)&&!has(1,-1))return;
  ctx.save();ctx.beginPath();ctx.rect(px,py,TS,TS);ctx.clip();
  const band=(x0,y0,x1,y1,a)=>{const g=ctx.createLinearGradient(x0,y0,x1,y1);g.addColorStop(0,'rgba(14,8,26,'+a+')');g.addColorStop(1,'rgba(14,8,26,0)');ctx.fillStyle=g;ctx.fillRect(px,py,TS,TS);};
  if(n[0])band(px,py,px+9,py,.46);if(n[1])band(px+TS,py,px+TS-6,py,.2);if(n[2])band(px,py,px,py+8,.34);if(n[3])band(px,py+TS,px,py+TS-6,.18);
  if(!n[0]&&!n[2]&&has(-1,-1))band(px,py,px+8,py+8,.3);
  ctx.restore();}
const SLE=[];function slErr(w,e){if(SLE.length<20)SLE.push(w+': '+(e&&e.message||e));}
// objects: the den mouth replaces the old rock arch, the lair front replaces the old facade. A lair with a mound (dungeon8) draws its front after the hill in 2D
// (drawObjects below) and as a card in HD-2D (the cards bake sets D8.card); a lair without a mound draws it in the old facade slot.
{const o0=obj2;obj2=function(theme,kind,v){
  if((kind==='cavemouth'||kind==='facade')&&SLX.m&&SLX.m.kind==='field'){const m=SLX.m;
    try{if(kind==='cavemouth'){SLX.n.den++;return slDenSprite(m);}
      const r=o0.apply(this,arguments);if(m.d8lair&&!window.__D8OFF&&!D8.card)return r;const s=slLairSprite(m);if(s){SLX.n.lair++;return s;}return r;}catch(e){slErr(kind,e);}}
  return o0.apply(this,arguments);};}
HOOK.wrap('drawObjects','sitelook10','lair sprite over the props',function(next,ctx,m,y){const keep=SLX.m;SLX.m=m;try{const r=next(ctx,m,y);
  if(m&&m.kind==='field'&&m.ent&&m.d8lair&&!window.__D8OFF&&!D8.card&&y===Math.max(...m.d8lair.tiles.map(t=>t[1]))){try{const s=slLairSprite(m);if(s){SLX.n.lair++;ctx.drawImage(s,m.ent[0]*TS+8-s.width/2,m.ent[1]*TS+17-s.height);}}catch(e){slErr('lair2d',e);}}
  return r;}finally{SLX.m=keep;}});
// the mound under the front is a low embankment (dungeon8 raised it into a tall hill that hid the door from some sides); heights, hill, torches and banners follow
HOOK.wrap('getMap','sitelook10','lair mound: a low embankment under the realm front',function(next,...a){const m=next(...a);try{const L=m&&m.kind==='field'&&m.d8lair;if(L&&!L.__low){L.__low=1;const K=.32;for(const k in L.cor)L.cor[k]*=K;for(const k in L.hh)L.hh[k]*=K;L.top*=K;}}catch(e){slErr('low',e);}return m;});
// the cave mouth is drawn on the 'E' tile with its centre on the tile (worldgfx2): the new sprite is 64 wide; its base meets the old base line
// lights: dens glow in the interior's colour (dusk and night), lairs carry the glow of their kit
function slLights(m){const o=[];try{const S=slSites(m);if(!S)return o;S.dens.forEach(c=>{const L=SL_DEN[slRealmKey(m)];o.push([c.x*TS+8,c.y*TS+5,22,L.lt]);const fv=c.face||[0,1];o.push([(c.x+fv[0]*1.2)*TS+8,(c.y+fv[1]*1.2)*TS+10,14,L.lt]);});
  if(S.lair){const K=slLairKit(m);if(K&&K.lt)o.push([S.lair.x*TS+8,S.lair.y*TS+3,K.lr||20,K.lt]);}}catch(e){slErr('lights',e);}return o;}
{const sl0=scanLights;scanLights=function(m){const r=sl0.apply(this,arguments);try{if(m&&m.kind==='field'&&!m.fort){m.tl=(m.tl||[]).concat(slLights(m));}}catch(e){}return r;};}
{const hb0=hdBakeLights;hdBakeLights=function(m,S,lights){let add=null;try{if(m&&m.kind==='field'&&!m.fort)add=slLights(m);}catch(e){}return hb0.call(this,m,S,add&&add.length?(lights||[]).concat(add):lights);};}
// ---------- LAIRS: the realm's own front for the main dungeon (64 x 60, the door on the 'E' tile) ----------
const SL_LK={thistle:'thistle',orchard:'orchard',strand:'strand',mire:'mire',deeps:'smelter',grotto:'grotto',tundra:'vault',glacier:'choir',peaks:'bell',mesa:'sunspire',lakes:'mill',mines:'foundry',
  ashen:'throne',drowned:'crown',starless:'obs',shattered:'zenith',ashglass:'cathedral'};
const SL_LKIT={thistle:{lt:'lamp',lr:20,bits:'thistle',rk:'g'},orchard:{lt:'gold',lr:22,bits:'apples',rk:'t'},strand:{lt:'cyan',lr:20,bits:'kelp',rk:'w'},mire:{lt:'cyan',lr:18,bits:'kelp',rk:'u'},
  smelter:{lt:'fire',lr:26,bits:'ember',rk:'b'},grotto:{lt:'fungus',lr:24,bits:'mush',rk:'b'},vault:{lt:'ice',lr:24,bits:'ice',rk:'i'},choir:{lt:'ice',lr:22,bits:'ice',rk:'i'},bell:{lt:'lamp',lr:18,bits:'moss',rk:'m'},
  sunspire:{lt:'gold',lr:22,bits:'sand',rk:'s'},mill:{lt:'cyan',lr:18,bits:'kelp',rk:'w'},foundry:{lt:'fire',lr:26,bits:'ore',rk:'u'},throne:{lt:'fire',lr:28,bits:'ember',rk:'b'},crown:{lt:'cyan',lr:24,bits:'kelp',rk:'v'},
  obs:{lt:'violet',lr:24,bits:'stars',rk:'v'},zenith:{lt:'gold',lr:24,bits:'shards',rk:'m'},cathedral:{lt:'cyan',lr:24,bits:'salt',rk:'s'}};
function slLairKit(m){const k=slKey(m);let id=k.key&&SL_LK[k.key]||{meadow:'thistle',coast:'strand',cave:'smelter',snow:'vault',heights:'bell',void:'obs'}[k.th]||'thistle';return Object.assign({id},SL_LKIT[id]);}
function slArch(P,col,cx,by,w,h){const r=w/2,top=by-h;for(let y=top;y<=by;y++){const hw=y<top+r?Math.sqrt(Math.max(0,r*r-(top+r-y-.5)*(top+r-y-.5))):r;P.f(col,Math.round(cx-hw),y,Math.round(hw*2),1);}}
// a pointed arch (gothic): two arcs meeting at a peak
function slPoint(P,col,cx,by,w,h){const r=w/2,top=by-h;for(let y=top;y<=by;y++){const t=(y-top)/Math.max(1,h*.55),hw=t<1?r*Math.pow(t,.62):r;P.f(col,Math.round(cx-hw),y,Math.round(hw*2),1);}}
// a framed door: jambs round the dark opening
function slDoor(P,rk,cx,by,w,h,inner,o){o=o||{};const A=o.point?slPoint:slArch;A(P,rk[3],cx,by,w+6,h+3);A(P,rk[0],cx,by,w+4,h+2);A(P,rk[2],cx,by,w+2,h+1);
  if(o.point){const r=w/2,top=by-h;for(let y=top;y<=by;y++){const t=(y-top)/Math.max(1,h*.55),hw=t<1?r*Math.pow(t,.62):r;P.f(slCol('#06040a',inner,Math.pow((y-top)/h,2)*(o.k||.85)),Math.round(cx-hw),y,Math.round(hw*2),1);}}else slOpen(P,cx,by,w,h,inner,{k:o.k||.85});}
function slLamp(P,x,y,lit,col){P.f('#3a2a1a',x,y,1,6);P.f('#5a4a3a',x-1,y+5,3,1);P.f(col||(lit?'#ffe08a':'#ffb04a'),x-1,y-3,3,3);P.px('#fff6c8',x,y-2);}
function slGrass(P,x0,x1,y,c1,c2,seed){const R=mulberry(seed||5);for(let x=x0;x<x1;x++)if(R()<.5){const h=1+Math.floor(R()*3);P.f(R()<.5?c1:c2,x,y-h,1,h+1);}}
function slWater(P,y,x0,x1,c1,c2){P.f(c1,x0,y,x1-x0,59-y+1);for(let x=x0;x<x1;x+=3)P.f(c2,x,y+((x/3)%2),2,1);P.f(c2,x0,y,x1-x0,1);}
const SL_LD={
 thistle:P=>{const rk=SL_ROCK.g,gr=['#6aa044','#4e8a34','#8cc060'];
   P.mass(M=>{M.ell('#fff',32,52,31,15);M.f('#fff',2,52,60,8);},['#8a7a52','#6e6040','#52462e','#2a2218'],{seed:2,fall:1});slDrip(P,{at:(x,y)=>{const d=P.c.getImageData(x,y,1,1).data;return d[3]>100;},w:64,h:60},4,60,gr[0],gr[2],2,4);
   for(let i=0;i<24;i++)P.px(i%3?'#b58ad0':'#e8c8f0',6+((i*11)%52),38+((i*7)%14));
   // the door: two upright stones and a lintel slab with a carved sign
   P.mass(M=>{M.f('#fff',20,30,6,29);M.f('#fff',38,30,6,29);M.f('#fff',17,25,30,7);},rk,{seed:4,brick:0});P.f('#0a0608',26,36,12,23);slOpen(P,32,59,12,22,'#4a6a2a',{k:.5});P.f(rk[3],26,33,12,3);
   P.f('#7a9a58',19,26,4,1);P.f(gr[0],18,25,10,1);P.f(gr[1],34,25,9,1);P.f('#e8e0d0',31,27,2,3);P.f('#e8e0d0',29,28,6,1);P.px('#3a362e',31,28);
   // standing stones
   P.mass(M=>{M.poly('#fff',[[3,52],[5,16],[9,12],[13,17],[14,52]]);},rk,{seed:6});P.mass(M=>{M.poly('#fff',[[50,54],[51,24],[55,20],[60,25],[61,54]]);},rk,{seed:8});
   P.f(gr[0],5,17,6,2);P.f(gr[0],52,25,7,2);P.f('#e8e0d0',7,24,1,6);P.f('#e8e0d0',55,31,1,5);P.px('#3a362e',7,25);},
 orchard:P=>{const rk=SL_ROCK.t;
   P.mass(M=>{M.f('#fff',10,36,46,23);},rk,{seed:3,brick:5});P.f('#5a7a2a',10,35,46,2);P.f('#7a9a3a',12,35,10,1);
   // the tree: trunk, a broad canopy with apples
   P.f('#4a2e18',17,18,5,22);P.f('#7a4e28',17,18,2,22);P.poly('#4a2e18',[[17,38],[14,41],[17,40]]);P.poly('#4a2e18',[[22,38],[25,41],[22,40]]);
   P.ell('#2f6a28',20,12,19,11);P.ell('#4a9a3a',16,10,12,8);P.ell('#6ab84a',13,7,6,4);P.ell('#4a9a3a',34,14,10,7);[[8,10],[14,15],[24,8],[30,13],[36,16],[20,18],[10,16]].forEach(([x,y],i)=>{P.f('#c8382a',x,y,3,3);P.px('#ff8a6a',x,y);if(i%2)P.px('#ffd040',x+2,y+2);});
   // the cellar: slanted doors under a stone lintel, one leaf flung open
   P.mass(M=>{M.f('#fff',23,29,34,30);},['#9a9488','#7e786c','#5e5a50','#2e2a24'],{seed:9,brick:5});
   P.poly('#4a2c14',[[26,34],[38,34],[38,38],[26,38]]);slArch(P,'#0a0608',32,59,18,24);slOpen(P,32,59,16,24,'#8a5a1a',{k:.9});
   for(let i=0;i<5;i++)P.f(i%2?'#5a3a1e':'#7a4e28',44+i*2,32+i,2,20-i*2);P.poly('#3a2a1a',[[43,31],[53,36],[53,52],[43,56]]);P.f('#8a5a2a',44,35,8,16);P.f('#c8a070',44,35,1,16);P.f('#3a3a48',45,40,8,1);P.f('#3a3a48',45,46,8,1);
   P.f('#c8c8d0',50,43,2,2);P.f('#6a4424',22,54,6,5);P.f('#c8382a',23,53,2,2);P.f('#ffd040',26,53,2,2);slLamp(P,57,38,0,'#ffb04a');slGrass(P,4,60,59,'#5a9a3a','#7ac04a',9);},
 strand:P=>{const rk=SL_ROCK.w;
   P.mass(M=>{M.poly('#fff',[[0,59],[3,22],[12,8],[28,3],[44,8],[56,22],[63,59]]);},rk,{seed:2,fall:1});
   P.f('#e8e0c0',10,6,30,2);P.f('#e8e0c0',6,14,6,2);P.f('#e8e0c0',50,14,6,2);
   P.poly(rk[2],[[18,59],[18,36],[32,26],[46,36],[46,59]]);slArch(P,'#06080c',32,59,22,30);slOpen(P,32,59,20,30,'#1a6670',{k:.9});
   // wet line and a pool at the sill
   P.f('#1a3a44',2,52,60,7);P.f('#2a6a7a',2,52,60,1);for(let x=3;x<62;x+=4)P.f('#5ad0c0',x,53+(x%8===3?1:0),2,1);P.ell('#2a8a94',32,58,16,2);
   // a wrecked hull
   P.poly('#5a3a1e',[[2,56],[5,44],[16,40],[28,48],[26,56]]);P.poly('#7a4e28',[[4,52],[6,45],[16,42],[24,48]]);P.f('#3a2410',6,48,18,1);P.f('#3a2410',8,51,16,1);P.f('#9a6a38',9,43,1,5);P.f('#9a6a38',14,42,1,6);P.f('#9a6a38',19,44,1,6);
   P.f('#5a3a1e',10,20,2,24);P.poly('#d8d0c0',[[12,22],[22,30],[12,32]]);P.line('#c8a870',12,20,22,30);
   for(let i=0;i<10;i++)P.f('#e8e0d0',40+((i*7)%18),22+((i*9)%24),2,1);[[10,56],[14,57],[50,56]].forEach(([x,y])=>{P.f('#f0a0b0',x,y-1,3,2);});
   for(let i=0;i<3;i++){let x=13+i*3;for(let k=0;k<16;k++){P.px('#3a8a4a',x,36-k*0+k);if(k%3===2)x+=k%6<3?1:-1;}}},
 mire:P=>{const rk=SL_ROCK.u;
   P.mass(M=>{M.f('#fff',8,22,48,38);M.poly('#fff',[[8,22],[12,14],[22,12],[22,22]]);M.poly('#fff',[[42,22],[44,14],[52,16],[56,22]]);},rk,{seed:5,brick:6});
   P.f('#4a7a3a',8,21,48,2);for(let i=0;i<6;i++)P.f('#34602a',10+i*8,22,1,3+i%3);
   slDoor(P,rk,32,59,16,30,'#2a5a46',{point:1});P.f('#d8c860',29,16,6,5);P.f('#8a7020',29,16,6,1);P.f('#f6e890',30,17,2,3);P.f('#3a3a40',31,12,2,4);P.f('#3a3a40',28,12,8,1);// a small bell in the gable
   slWater(P,50,2,62,'#1e4a46','#6ab0a0');P.f('#2a6a5a',2,50,60,1);
   [[5,38],[9,34],[55,36],[58,40]].forEach(([x,y])=>{P.f('#5a7a3a',x,y,1,50-y);P.f('#7a4a2a',x-1,y-4,3,4);});for(let i=0;i<7;i++)P.f('#5a7a3a',4+i*9,48,1,5);[[20,52],[44,53]].forEach(([x,y])=>{P.ell('#4a9a5a',x,y,4,1);});},
 smelter:P=>{const rk=['#7a5a4a','#5e4438','#44302a','#1c1210'];
   P.mass(M=>{M.f('#fff',6,24,52,36);},rk,{seed:2,brick:4});P.f('#2a1a14',6,24,52,3);P.f('#8a6a58',6,24,52,1);
   // two chimneys with smoke
   [[10,2],[46,6]].forEach(([x,y],i)=>{P.mass(M=>{M.f('#fff',x,y,9,24-y);},rk,{seed:3+i,brick:4});P.f('#2a1a14',x-1,y,11,2);P.f('#8a6a58',x-1,y,11,1);P.f('#ff7a2a',x+2,y+1,5,1);for(let k=0;k<7;k++){P.c.fillStyle='rgba(120,112,116,'+(0.5-k*.06).toFixed(2)+')';P.c.fillRect(x+3+Math.round(Math.sin(k)*1.5),y-2-k,3+(k>3?1:0),1);}});
   // the gate: an iron arch with bars raised, a furnace glow behind
   slDoor(P,rk,32,59,18,26,'#c84a1a',{k:1});for(let x=24;x<=40;x+=3)P.f('#2a2a32',x,34,1,10);P.f('#3a3a44',22,34,20,2);P.f('#8a8a98',22,34,20,1);
   for(let x=10;x<56;x+=8){P.px('#ffb040',x,46);P.px('#ffb040',x,52);}P.f('#ff7a2a',12,29,6,2);P.f('#ffd070',13,29,3,1);P.f('#ff7a2a',46,29,6,2);P.f('#ffd070',47,29,3,1);
   P.f('#1a1412',2,57,60,3);for(let i=0;i<9;i++)P.px(i%2?'#ff8a3a':'#ffd070',4+((i*7)%56),53+(i%4));},
 grotto:P=>{const rk=SL_ROCK.b;
   P.mass(M=>{M.poly('#fff',[[0,59],[2,30],[12,14],[26,8],[40,10],[54,18],[63,34],[63,59]]);},rk,{seed:4,fall:1});
   slDoor(P,rk,32,59,16,26,'#3a8a7a',{k:1});
   // glowing mushrooms the size of houses flank the door, small ones spill out
   const mk=(x,y,s,c1,c2)=>{P.f('#d8d0c0',x,y-s,2+(s>8?2:0),s);P.f('#a8a090',x+1+(s>8?2:0),y-s,1,s);P.ell(c1,x+(s>8?2:1),y-s-2,s*.8,s*.38+1);P.ell(c2,x+(s>8?2:1)-s*.25,y-s-3,s*.35,1);P.px('#ffffff',x+(s>8?2:1)-s*.3,y-s-3);for(let i=0;i<3;i++)P.px('#ffffff',x+(s>8?2:1)-s*.5+i*(s*.5),y-s-1);};
   mk(8,56,14,'#7af0d0','#c8fff0');mk(50,57,18,'#c0a0ff','#eadcff');mk(18,58,6,'#c0a0ff','#eadcff');mk(44,59,5,'#7af0d0','#c8fff0');mk(58,58,7,'#7af0d0','#c8fff0');mk(3,59,5,'#c0a0ff','#eadcff');
   [[30,16],[18,24],[46,26],[12,34]].forEach(([x,y],i)=>{P.f('#7af0d0',x,y,2,1);P.px('#ffffff',x,y);P.f(i%2?'#c0a0ff':'#7af0d0',x+1,y+1,1,2);});
   for(let k=0;k<12;k++){P.px('#4a7a5a',27,12+k);P.px('#4a7a5a',37,13+k);}},
 vault:P=>{const rk=['#cfe2f2','#a6c0da','#7e9ab8','#3e5578'];
   P.mass(M=>{M.f('#fff',4,14,56,46);M.f('#fff',10,8,44,8);},rk,{seed:2,brick:6});P.f('#ffffff',4,13,56,2);P.f('#ffffff',10,7,44,2);for(let x=5;x<60;x+=2)P.f('#e8f6ff',x,15,1,2+((x*7)%5));
   // the vault door: a round steel hatch, rimed, swung open to the side
   P.ell('#2a3a58',32,40,17,19);P.ell('#5a6a88',32,40,15,17);slOpen(P,32,59,16,28,'#2e5a9a',{k:1});P.ell('#8a9aba',32,40,15,17);P.ell('#3a4a68',32,40,12,14);
   P.f('#06040a',24,34,16,25);slOpen(P,32,59,14,26,'#2e5a9a',{k:1});
   P.ell('#8a9aba',48,40,3,16);P.ell('#d8e8f8',47,40,1,15);for(let i=0;i<8;i++){const a=i/8*6.283;P.px('#d8e8f8',Math.round(32+Math.cos(a)*14),Math.round(40+Math.sin(a)*16));}
   P.f('#e8f6ff',46,26,1,6);P.f('#e8f6ff',16,28,1,5);P.f('#ffffff',20,30,4,1);for(let i=0;i<6;i++)P.f('rgba(255,255,255,.55)',8+i*9,20,1,12);
   [[6,59],[56,59]].forEach(([x,y])=>{P.poly('#ffffff',[[x-3,y],[x,y-7],[x+3,y]]);});},
 choir:P=>{const rk=['#d8ecfa','#a6c8e4','#7a9cc4','#3e5a88'];
   // organ pipes of ice
   [[4,34,9],[13,24,7],[20,16,8],[41,16,8],[49,24,7],[56,34,9]].forEach(([x,h,w],i)=>{P.mass(M=>{M.f('#fff',x-w/2+0,59-h-14,w,h+14);},rk,{seed:i+2});P.f('#06040a',x-w/2+2,59-h-9,w-4,3);P.f('#e8f8ff',x-w/2,59-h-14,w,1);});
   P.mass(M=>{M.f('#fff',16,36,32,23);},rk,{seed:9,brick:5});P.f('#ffffff',16,35,32,2);slDoor(P,rk,32,59,16,26,'#3a64aa',{point:1});
   for(let x=17;x<48;x+=3){P.f('#e8f6ff',x,36,1,2+((x*5)%5));}P.f('#ffd04a',29,18,6,6);P.f('#06040a',32,20,1,3);P.px('#fff6c8',30,19);P.poly('#ffd04a',[[34,23],[36,23],[35,27]]);
   for(let i=0;i<5;i++)P.f('rgba(255,255,255,.6)',10+i*11,14+i%2*6,1,8);},
 bell:P=>{const rk=SL_ROCK.m;
   P.mass(M=>{M.f('#fff',12,6,40,54);M.f('#fff',8,50,48,10);},rk,{seed:2,brick:6});
   // belfry window with a bell, a steep roof line and a band of the realm's colour
   P.f('#fff',12,5,40,1);P.poly('#5a5c70',[[10,8],[32,-6],[54,8]]);P.poly('#7e7c8e',[[12,8],[32,-3],[52,8]]);
   P.f('#06040a',24,12,16,15);slArch(P,'#06040a',32,27,16,15);P.f('#e8c050',27,14,10,8);P.ell('#e8c050',32,19,6,7);P.f('#fff0a0',28,16,2,4);P.f('#6a5a2a',34,18,3,5);P.f('#3a3a40',31,12,2,3);P.px('#f6f0d0',32,25);
   P.f('#8ad0ff',12,32,40,2);P.f('#8ad0ff',12,36,40,1);
   slDoor(P,rk,32,59,16,22,'#3a4a6a',{point:1});P.f('#c8b090',16,46,32,1);for(let i=0;i<4;i++)P.poly(i%2?'#f2c93a':'#8ad0ff',[[18+i*8,46],[24+i*8,46],[21+i*8,53]]);
   P.f('#e8eef4',6,50,6,3);P.f('#e8eef4',52,50,6,3);},
 sunspire:P=>{const rk=SL_ROCK.s;
   P.mass(M=>{M.poly('#fff',[[8,59],[12,26],[20,8],[32,0],[44,8],[52,26],[56,59]]);M.f('#fff',2,50,60,10);},rk,{seed:3,brick:5});
   P.f('#e8c050',28,2,8,10);P.ell('#f2c93a',32,16,9,9);P.ell('#fff2a8',32,16,6,6);for(let i=0;i<8;i++){const a=i/8*6.283;P.f('#f2c93a',Math.round(32+Math.cos(a)*12),Math.round(16+Math.sin(a)*12),1,1);P.f('#f2c93a',Math.round(32+Math.cos(a)*11),Math.round(16+Math.sin(a)*11),1,1);}
   slDoor(P,rk,32,59,16,24,'#8a5a1a',{k:1});P.f('#f2c93a',17,32,30,1);P.f('#e8703a',17,34,30,1);for(let i=0;i<6;i++)P.f(i%2?'#e8703a':'#f2c93a',19+i*5,36,3,1);
   P.f('#e8703a',3,40,2,14);P.poly('#e8703a',[[5,40],[12,43],[5,46]]);P.f('#f2c93a',59,40,2,14);P.poly('#f2c93a',[[59,40],[53,43],[59,46]]);},
 mill:P=>{const rk=SL_ROCK.w;
   P.mass(M=>{M.f('#fff',20,18,40,42);},['#8a7a5a','#6e6044','#52462e','#2a2218'],{seed:3,brick:5});P.poly('#4a2e18',[[16,20],[40,6],[64,20]]);P.poly('#6a4424',[[18,20],[40,8],[62,20]]);for(let x=22;x<60;x+=4)P.f('#4a2e18',x,12+Math.abs(x-40)/3,1,2);
   slDoor(P,['#9a7a5a','#6a4424','#4a2e18','#1a1008'],34,59,14,20,'#2a6a6a',{k:.7});P.f('#c8a070',30,40,8,1);P.f('#3a2a1a',30,38,8,2);
   // the mill wheel, half under water
   P.ell('#2a1a0e',12,38,14,14);P.ell('#4a2e18',12,38,12,12);P.ell('#2a6a6a',12,38,9,9);for(let i=0;i<8;i++){const a=i/8*6.283+.2;P.line('#7a4e28',12,38,Math.round(12+Math.cos(a)*12),Math.round(38+Math.sin(a)*12));P.f('#6a4424',Math.round(12+Math.cos(a)*12)-1,Math.round(38+Math.sin(a)*12)-1,3,3);}P.ell('#7a4e28',12,38,3,3);P.px('#c8a070',11,37);
   slWater(P,50,0,64,'#1e5a5e','#7ac0c0');P.ell('#2a7a80',32,56,22,3);[[40,52],[52,53]].forEach(([x,y])=>{P.ell('#4a9a5a',x,y,4,1);P.px('#f0a0c0',x,y-1);});for(let i=0;i<6;i++)P.f('#5a7a3a',46+i*3,46,1,5);},
 foundry:P=>{const rk=SL_ROCK.u;
   P.mass(M=>{M.f('#fff',4,16,56,44);},['#6a5a52','#52463e','#3a3028','#1a1410'],{seed:2,brick:4});P.f('#1a1410',4,16,56,3);P.f('#8a7a6a',4,16,56,1);P.mass(M=>{M.f('#fff',48,2,9,16);},rk,{seed:6,brick:4});P.f('#1a1410',47,2,11,2);P.f('#ff7a2a',50,3,5,1);
   for(let k=0;k<6;k++){P.c.fillStyle='rgba(120,112,116,'+(0.5-k*.07).toFixed(2)+')';P.c.fillRect(51+Math.round(Math.sin(k)),-1-k+3,3,1);}
   // the gate: a big iron double door, ajar, a gear above, an ore cart on a rail
   slArch(P,'#0a0608',32,59,24,32);P.f('#3a3a44',16,28,32,3);slOpen(P,32,59,16,30,'#d8501a',{k:1});P.f('#4a4a58',18,30,6,29);P.f('#8a8a98',18,30,1,29);P.f('#4a4a58',40,30,6,29);P.f('#8a8a98',45,30,1,29);for(let y=34;y<58;y+=6){P.f('#2a2a32',18,y,6,1);P.f('#2a2a32',40,y,6,1);}
   P.ell('#8a8a98',32,21,6,6);P.ell('#4a4a58',32,21,4,4);P.px('#0a0608',32,21);for(let i=0;i<8;i++){const a=i/8*6.283;P.f('#8a8a98',Math.round(32+Math.cos(a)*7),Math.round(21+Math.sin(a)*7),2,2);}
   P.f('#2a2a30',6,58,52,1);P.f('#8a8a98',6,57,52,1);P.f('#5a5a68',8,50,10,6);P.f('#8a8a98',8,50,10,1);P.f('#d8a838',9,48,8,2);P.ell('#2a2a30',11,57,2,1);P.ell('#2a2a30',16,57,2,1);
   for(let i=0;i<7;i++)P.px(i%2?'#ffb040':'#ffe090',4+((i*9)%56),44+(i%5)*2);},
 throne:P=>{const rk=['#4a3e3c','#362c2a','#241c1a','#0c0808'];
   // a throne-back door: tall broken arch with spikes and a crown notch, molten cracks
   P.mass(M=>{M.poly('#fff',[[4,59],[6,30],[4,18],[10,22],[14,4],[20,16],[26,8],[32,14],[38,8],[44,16],[50,4],[54,22],[60,18],[58,30],[60,59]]);},rk,{seed:2,fall:1});
   P.mass(M=>{M.f('#fff',8,40,6,19);M.f('#fff',50,40,6,19);},['#5a4a46','#443836','#2e2422','#0c0808'],{seed:8});
   slDoor(P,rk,32,59,20,34,'#e8501a',{point:1,k:1});
   const cr=(x,y,l,s)=>{for(let k=0;k<l;k++){P.px(k%3===2?'#ffd04a':'#ff6a1a',x,y+k);if(k%3===1)x+=s;}};cr(14,22,18,1);cr(50,20,20,-1);cr(8,34,14,1);cr(56,36,12,-1);cr(22,16,8,1);cr(42,14,8,-1);
   P.f('#ff6a1a',27,6,2,6);P.px('#ffd04a',28,6);P.f('#1a1412',2,57,60,3);for(let i=0;i<12;i++)P.px(i%2?'#ff8a3a':'#ffd070',3+((i*13)%58),46+((i*5)%12));
   for(let k=0;k<8;k++){P.c.fillStyle='rgba(150,140,140,'+(0.45-k*.05).toFixed(2)+')';P.c.fillRect(30+Math.round(Math.sin(k/1.5)*2),2-k+2,3,1);}},
 crown:P=>{const rk=['#7a8aa6','#5a6a86','#3e4a66','#161e30'];
   P.mass(M=>{M.f('#fff',6,22,52,38);M.poly('#fff',[[6,22],[8,12],[14,20],[20,6],[26,20],[32,2],[38,20],[44,6],[50,20],[56,12],[58,22]]);},rk,{seed:4,brick:6,fall:1});
   // the crown stands half sunk over the door, pearls in its points
   [[8,12],[20,6],[32,2],[44,6],[56,12]].forEach(([x,y])=>{P.f('#f6ecf4',x-1,y-1,3,3);P.px('#ffffff',x-1,y-1);});
   slDoor(P,rk,32,59,16,28,'#1a6a80',{point:1});
   // coral and kelp, water in the doorway
   [[10,40,'#f08aa8'],[14,46,'#8ae0d0'],[50,38,'#f08aa8'],[54,44,'#8ae0d0']].forEach(([x,y,c])=>{P.f(c,x,y,2,10);P.f(c,x-2,y+2,2,3);P.f(c,x+2,y+3,2,3);P.px('#ffffff',x,y);});
   slWater(P,50,0,64,'#14405a','#5ad0e0');P.ell('#2a8aa8',32,56,20,3);for(let i=0;i<3;i++){let x=22+i*10;for(let k=0;k<14;k++){P.px('#2a7a5a',x,26+k);if(k%3===2)x+=k%6<3?1:-1;}}},
 obs:P=>{const rk=SL_ROCK.v;
   // a broken dome over a drum, with a slit and a telescope tube
   P.mass(M=>{M.f('#fff',8,28,48,32);M.ell('#fff',32,28,24,22);M.f('#fff',8,28,48,3);},rk,{seed:3,brick:6,fall:1});P.f('#06040a',29,4,6,24);P.f('#8a70d0',29,4,1,24);
   P.f('#06040a',0,0,64,0);P.f('#3a2a5a',36,4,22,5);P.f('#5a4a8a',36,4,22,1);P.f('#c8a0ff',58,3,3,7);P.f('#e8d8ff',58,3,1,7);
   slDoor(P,rk,32,59,16,26,'#3a2a6a',{point:1});P.ell('#06040a',32,36,0.5,0.5);
   for(let i=0;i<14;i++)P.px(i%3?'#ffffff':'#8ae6d4',6+((i*17)%52),4+((i*11)%40));
   for(let i=0;i<12;i++){const a=i/12*6.283;P.px('#8ae6d4',Math.round(14+Math.cos(a)*5),Math.round(46+Math.sin(a)*5));}P.px('#06040a',14,46);
   [[8,58],[54,57]].forEach(([x,y])=>{P.poly('#b080ff',[[x-1,y],[x+1,y-8],[x+3,y]]);P.px('#e8d8ff',x+1,y-6);});},
 zenith:P=>{const rk=['#e8e8f2','#c0c0d4','#8a8aa4','#3a3a58'];
   // a white arch with the keystone gone and a cracked sun disc floating above in two halves
   P.mass(M=>{M.f('#fff',6,22,10,38);M.f('#fff',48,22,10,38);M.poly('#fff',[[6,22],[10,12],[22,6],[28,10],[30,22]]);M.poly('#fff',[[58,22],[54,12],[42,6],[38,10],[36,22]]);},rk,{seed:2,brick:6});
   P.f('#06040a',16,24,32,35);slDoor(P,['#e8e8f2','#c0c0d4','#8a8aa4','#3a3a58'],32,59,18,30,'#3a3460',{k:1});
   P.poly('#f2c93a',[[20,2],[30,0],[31,10],[20,12]]);P.poly('#fff2a8',[[22,3],[29,1],[29,8],[22,10]]);P.poly('#f2c93a',[[35,0],[45,2],[45,12],[34,10]]);P.poly('#fff2a8',[[36,1],[43,3],[43,10],[35,8]]);P.f('#06040a',31,0,3,12);
   [[12,14],[52,12],[24,18],[40,18]].forEach(([x,y],i)=>{P.poly(i%2?'#8ad0ff':'#ffe08a',[[x,y+4],[x+2,y],[x+4,y+4],[x+2,y+7]]);});
   for(let i=0;i<5;i++)P.f('rgba(255,255,255,.5)',2+i*14,30+i%2*8,10,1);},
 cathedral:P=>{const rk=['#f0f6f8','#c8dce4','#98b4c4','#3e5468'];
   P.mass(M=>{M.f('#fff',6,18,52,42);M.poly('#fff',[[6,18],[18,8],[32,0],[46,8],[58,18]]);},rk,{seed:3,brick:6});
   // a rose window of cracked glass, a tall pointed door, salt crust on every ledge
   P.ell('#2a3a50',32,16,9,9);P.ell('#8ae0f0',32,16,7,7);for(let i=0;i<8;i++){const a=i/8*6.283;P.line('#e8f8ff',32,16,Math.round(32+Math.cos(a)*7),Math.round(16+Math.sin(a)*7));}P.ell('#fff2a8',32,16,2,2);P.f('#2a3a50',24,14,5,1);P.f('#e8f8ff',34,9,1,6);
   slDoor(P,rk,32,59,16,30,'#4a7a9a',{point:1});for(let x=6;x<58;x+=2)if((x*7)%5<3)P.f('#ffffff',x,19+((x*3)%3),1,1);
   [[8,30],[52,30]].forEach(([x,y])=>{P.f('#2a3a50',x,y,4,14);P.f('#8ae0f0',x+1,y+1,2,10);P.f('#e8f8ff',x+1,y+1,1,4);});for(let i=0;i<10;i++)P.f(i%2?'#f4f8f4':'#bfe8e0',4+((i*6)%56),56+(i%3),3,1);
   [[10,59],[54,59]].forEach(([x,y])=>{P.poly('#f4f8f4',[[x-2,y],[x,y-8],[x+2,y]]);P.px('#8adccc',x,y-5);});}};
const SL_LAIRC={};
function slLairSprite(m){return slLairByKit(slLairKit(m),!!(G&&G.cleared&&G.cleared[m.s]));}
function slLairByKit(K,lit){const id='lair:'+K.id+':'+(lit?1:0);if(SL_LAIRC[id])return SL_LAIRC[id];
  const P=slPix(64,60);SL_LD[K.id](P);
  if(lit){// relit: gold in the doorway, a lamp each side, flowers at the sill
    P.c.globalCompositeOperation='source-over';slLamp(P,12,48,1,'#ffe08a');slLamp(P,52,48,1,'#ffe08a');P.glow('#ffd870',32,56,12,.3);[[22,58],[42,58],[26,59]].forEach(([x,y],i)=>{P.f('#fff6a0',x,y,2,1);P.px(i%2?'#ff8a8a':'#ffd040',x+1,y-1);});}
  P.light();P.outline2('#120c14');P.glow(K.lt==='fire'?'#ff7a2a':K.lt==='cyan'||K.lt==='ice'?'#8ad0ff':K.lt==='violet'?'#b080ff':K.lt==='fungus'?'#7af0d0':'#ffd070',32,57,12,.2);
  return SL_LAIRC[id]=P.cv;}
slLairByKit=HOOK.def('slLairByKit',slLairByKit);// v0.19.2: worldart12.js gives the lair front volume
// the lane in front of the door: worn stones and the realm's signs
function slLairGround(ctx,m,x,y,T){const K=slLairKit(m),rk=SL_ROCK[K.rk],px=x*TS,py=y*TS,R=mulberry(x*97+y*31+m.s*7),ch=tileAt(m,x,y);if(!SL_PATHOK.includes(ch)||T.k>3)return;
  ctx.save();ctx.beginPath();ctx.rect(px,py,16,16);ctx.clip();if(T.k<=3)slStones(ctx,px,py,T.fv,rk,i=>(x*3+y*5+i)%3,K.bits==='kelp'||K.bits==='ice'?'#9ac8e8':null);
  const n=1+Math.floor(R()*2);for(let i=0;i<n;i++){const bx=px+1+Math.floor(R()*13),by=py+2+Math.floor(R()*12);ctx.fillStyle=K.bits==='ember'||K.bits==='ore'?'#ff8a3a':K.bits==='ice'||K.bits==='salt'?'#e8f6ff':K.bits==='stars'?'#c8a0ff':K.bits==='shards'?'#ffe08a':K.bits==='mush'?'#7af0d0':K.bits==='kelp'?'#5ad0c0':K.bits==='sand'?'#f2c93a':K.bits==='apples'?'#c8382a':'#b58ad0';ctx.fillRect(bx,by,1,1);ctx.fillRect(bx+1,by+1,1,1);}
  ctx.restore();}
// ---------- SANCTUM: a shrine approach (replaces sanctlook10's tall gate; its ring of light ground, path and the interior stay) ----------
// local geometry (px, from the top left of the 3 x 2 footprint, 48 x 32): the E tile is x 16..32, y 16..32. Low wings on the 'U' tiles, a three step stair on the E tile
// climbing to a small lit shrine (x 13..35), two guardians (cx 12 and 36) or lantern pillars, a torii-like lintel on the outer posts only where the realm suggests it.
const SL_SA={meadow:{g:'fox',torii:0},cave:{g:'lion',torii:0},snow:{g:'wolf',torii:0},heights:{g:'hawk',torii:1},coast:{g:'lamp',torii:1},void:{g:'obel',torii:1}};
const SL_SAC={};
function slSaP(m){const th=m&&m.theme||'meadow';return SNC_P(SNC[th]?th:'meadow');}
function slSaKey(m){const th=m&&m.theme||'meadow';return SNC[th]?th:'meadow';}
function slSaParts(th){if(SL_SAC[th])return SL_SAC[th];const P0=SNC_P(th),S=sncStone(P0),rk=[S[0],S[1],S[2],S[3]],cfg=SL_SA[th]||SL_SA.meadow,R=mulberry(hashS('sa'+th)),o={};
  const cap=(P,x,y,w)=>sncCap((col,a,b,ww,hh)=>P.f(col,a,b,ww,hh),x,y,w,P0,R);
  // the shrine: a block with a pitched cap roof and a door of the realm's light
  {const P=slPix(20,26);P.mass(M=>{M.f('#fff',2,9,16,17);},rk,{seed:3,brick:4});P.mass(M=>{M.f('#fff',0,5,20,5);M.f('#fff',3,2,14,4);},[S[0],S[0],S[1],S[3]],{seed:5});P.f(S[3],0,9,20,1);P.f(P0.acc,3,8,14,1);
    cap(P,0,5,20);cap(P,3,2,14);
    P.f(S[3],5,11,10,15);slOpen(P,10,26,8,14,P0.acc,{k:1});const dv=P.c.createLinearGradient(0,14,0,26);dv.addColorStop(0,P0.acc2);dv.addColorStop(1,'#fff8dc');P.c.fillStyle=dv;
    for(let y=15;y<26;y++){const hw=y<18?2+(y-15):4;P.f(lerpHex(P0.acc2,'#fff8dc',(y-15)/11),10-hw,y,hw*2,1);}
    P.f('#fff8dc',9,21,2,5);P.f(P0.acc2,9,11,2,2);P.f('#fff8dc',9,11,1,1);P.f(S[2],2,25,16,1);o.niche=P.light().outline2('#16101a').cv;}
  // the guardians
  const mkG=(kind)=>{const P=slPix(14,22);
    if(kind==='lamp'){// a shell lantern pillar: a stone post, a lit firebox and a scalloped cap
      P.mass(M=>{M.f('#fff',5,14,4,8);M.f('#fff',3,20,8,2);},rk,{seed:2});P.mass(M=>{M.f('#fff',3,8,8,7);},rk,{seed:4});P.f('#3a2c1c',4,9,6,5);P.f(P0.acc,5,10,4,3);P.f('#fff8dc',6,10,2,2);P.mass(M=>{M.f('#fff',1,5,12,4);M.f('#fff',4,3,6,3);},[S[0],S[0],S[2],S[3]],{seed:6});cap(P,1,5,12);P.f(P0.acc2,6,1,2,2);return P.light().outline2('#16101a').cv;}
    if(kind==='obel'){P.mass(M=>{M.poly('#fff',[[3,22],[4,6],[7,0],[10,6],[11,22]]);},rk,{seed:2});P.f('#2a1a4a',5,7,4,10);P.f(P0.acc,6,8,2,8);P.f(P0.acc2,6,9,1,3);P.f('#ffffff',6,9,1,1);P.f(P0.acc,3,19,8,1);cap(P,3,20,8);return P.light().outline2('#16101a').cv;}
    const body=M=>{M.ell('#fff',7,14,4.2,5.5);M.ell('#fff',7,7,4.2,3.6);M.f('#fff',3,14,2,6);M.f('#fff',9,14,2,6);M.f('#fff',1,19,12,3);
      if(kind==='hawk'){M.f('#fff',5,2,4,3);M.poly('#fff',[[2,10],[1,18],[4,18]]);M.poly('#fff',[[12,10],[13,18],[10,18]]);}
      else{M.poly('#fff',[[3,6],[3,1],[6,4]]);M.poly('#fff',[[11,6],[11,1],[8,4]]);M.ell('#fff',12,16,1.6,3.2);}};
    P.mass(body,rk,{seed:kind.length+3});
    if(kind==='hawk'){P.poly('#d8a838',[[6,8],[8,8],[7,11]]);P.px(P0.acc2,5,6);P.px(P0.acc2,9,6);P.f(P0.acc,4,13,6,1);P.f(P0.acc,5,14,1,3);P.f(P0.acc,8,14,1,3);}
    else{P.px(kind==='lion'?'#ff8a3a':kind==='wolf'?'#bfe6ff':P0.acc2,5,6);P.px(kind==='lion'?'#ff8a3a':kind==='wolf'?'#bfe6ff':P0.acc2,9,6);P.f(S[3],6,9,2,1);P.f(P0.acc,4,12,6,1);if(kind==='wolf'){P.px('#ffffff',6,10);P.px('#ffffff',8,10);}
      if(kind==='lion'){P.f('#ff8a3a',6,15,1,3);P.px('#ffd070',6,15);P.f('#ff8a3a',9,16,1,2);}}
    cap(P,3,3,8);cap(P,1,19,12);return P.light().outline2('#16101a').cv;};
  o.guard=mkG(cfg.g);
  // the torii posts and lintel (only where the realm suggests it)
  if(cfg.torii){const Pp=slPix(5,38);Pp.mass(M=>{M.f('#fff',0,0,5,38);},rk,{seed:7});Pp.f(P0.acc,0,9,5,1);Pp.f(P0.acc,0,22,5,1);Pp.f(S[3],0,34,5,4);cap(Pp,0,33,5);o.post=Pp.light().outline2('#16101a').cv;
    const Pl=slPix(60,12);Pl.mass(M=>{M.poly('#fff',[[0,2],[4,5],[56,5],[60,2],[58,9],[2,9]]);M.f('#fff',6,5,48,6);},[S[0],S[1],S[2],S[3]],{seed:9});Pl.f(P0.acc,6,9,48,1);cap(Pl,4,4,52);
    Pl.f(S[3],26,2,8,1);Pl.f(P0.acc2,28,5,4,3);Pl.f('#fff8dc',29,6,2,1);o.lintel=Pl.light().outline2('#16101a').cv;}
  // prayer ribbons: four cloth strips with a swallow tail and fringe
  {const P=slPix(16,12);[[P0.cloth[0]],[P0.cloth[1]],[P0.cloth[1]],[P0.cloth[0]]].forEach(([c],i)=>{const x=i*4,h=9+(i%2)*2;P.f(c,x,0,3,h);P.f(shade(c,.7),x+2,0,1,h);P.f('#f6eccb',x,0,3,1);P.px('#f6eccb',x+1,h);P.f(shade(c,.8),x,h,1,1);P.f(c,x+2,h,1,1);});o.rib=P.cv;}
  return SL_SAC[th]=o;}
// 2D: wings, stair, shrine, guardians, torii, ribbons (the ring of light ground and the stone path come from sanctlook10's drawShrineRing)
function slShrineFront(ctx,x,y){const m=sncFieldM(),th=slSaKey(m),P0=SNC_P(th),S=sncStone(P0),o=slSaParts(th),cfg=SL_SA[th],R=mulberry(((x*13+y*7)|0)+3),f=(c,a,b,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x+a,y+b,w,h);};
  ctx.save();
  ctx.fillStyle='rgba(20,18,30,.2)';ctx.beginPath();ctx.ellipse(x+24,y+32,25,4,0,0,7);ctx.fill();
  // a soft pool of the shrine's light on the stair
  const gl=ctx.createRadialGradient(x+24,y+26,1,x+24,y+26,20);gl.addColorStop(0,'rgba('+hx(P0.acc2).join(',')+',.2)');gl.addColorStop(1,'rgba('+hx(P0.acc2).join(',')+',0)');ctx.fillStyle=gl;ctx.fillRect(x+2,y+8,44,28);
  // low threshold wings on the 'U' tiles
  [[0],[37]].forEach(([a])=>{f(S[3],a-0,22,11,10);f(S[1],a+1,23,9,8);f(S[0],a+1,23,9,1);f(S[2],a+1,29,9,2);f(S[3],a,31,11,1);for(let i=0;i<2;i++)f(S[2],a+2+i*4,25+i,1,3);sncCap(f,a+1,23,9,P0,R);});
  // the worn stair on the E tile: three treads, wider toward the foot
  for(let i=0;i<3;i++){const w=16+i*3,sx=24-w/2,yy=28-i*3;f(S[3],sx-1,yy,w+2,4);f(S[0],sx,yy,w,1);f(S[1],sx,yy+1,w,2);f(S[2],sx+3,yy+1,w-6,1);f(S[3],sx,yy+3,w,1);for(let k=0;k<2;k++)f(S[2],sx+2+((k*7+i*5)%(w-4)),yy+1,1,1);
    if(P0.cap==='moss'){f('#5e9a3c',sx,yy+3,3,1);}else if(P0.cap==='snow'){f('#ffffff',sx,yy,w,1);}else if(P0.cap==='ember'){f('#ff8a3a',sx+3,yy+3,2,1);}else if(P0.cap==='salt'){f('#bfe8e0',sx+2,yy+3,4,1);}}
  ctx.drawImage(o.niche,x+14,y-5);
  // guardians
  ctx.drawImage(o.guard,x+2,y+6);ctx.drawImage(o.guard,x+32,y+6);
  if(cfg.torii){ctx.drawImage(o.post,x,y-9);ctx.drawImage(o.post,x+43,y-9);ctx.drawImage(o.lintel,x-6,y-14);
    f(S[3],6,-3,36,3);f(S[1],6,-3,36,2);f(S[0],6,-3,36,1);f(P0.acc,7,-1,34,1);}
  // ribbons on the shrine roof and, where there is a lintel, under it
  [[14,4],[17,4],[29,4],[32,4]].forEach(([a,b],i)=>ctx.drawImage(o.rib,i%4*4,0,3,8,x+a,y+b,3,8));
  if(cfg.torii)[[9,-2],[12,-2],[35,-2],[38,-2]].forEach(([a,b],i)=>ctx.drawImage(o.rib,(i+1)%4*4,0,3,9,x+a,y+b,3,9));
  ctx.restore();}
drawShrineFront=slShrineFront;
function sncGateLights(m){const [fx,fy]=m.fortAt,x=(fx-1)*TS,y=(fy-1)*TS;return [[x+24,y+17,7,'lamp'],[x+9,y+22,4,'lamp'],[x+39,y+22,4,'lamp']];}
// ---------- HD-2D: stair, shrine, wings, posts and lintel as geometry; guardians and ribbons as cards ----------
// sheet (px): niche 0,0 20x26 | guard 24,0 14x22 | post 40,0 5x38 | rib 48,0 16x12 | lintel 0,28 60x12 | tread 0,42 20x3 | wing 22,42 12x9 | roof cap 36,42 22x4
function slSaSheet(m){const th=slSaKey(m),P0=SNC_P(th),S=sncStone(P0).map(c=>shade(c,.93));return hdSpr('sasheet_'+th,96,56,(c)=>{const o=slSaParts(th),R=mulberry(11),f=(col,x,y,w,h)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
  c.drawImage(o.niche,0,0);c.drawImage(o.guard,24,0);if(o.post)c.drawImage(o.post,40,0);c.drawImage(o.rib,48,0);if(o.lintel)c.drawImage(o.lintel,0,28);
  f(S[3],0,42,20,3);f(S[1],0,42,20,2);f(S[0],0,42,20,1);for(let i=0;i<4;i++)f(S[2],2+i*5,43,2,1);
  f(S[3],22,42,12,9);f(S[1],23,43,10,7);f(S[0],23,43,10,1);f(S[2],23,49,10,2);sncCap((col,a,b,w,h)=>f(col,a,b,w,h),22,43,12,P0,R);
  f(S[3],36,42,22,4);f(S[0],36,42,22,1);f(S[1],36,43,22,2);});}
function slSaGeo(m,S,b,Q,U,Vv,p,V,bt){const th=slSaKey(m),P0=SNC_P(th),St=sncStone(P0),cfg=SL_SA[th],rgb=h=>hdRgb(h).map(v=>Math.round(v*235)),top=rgb(shade(St[0],.9)),side=rgb(shade(St[2],.72));
  const x0=b.x*TS,x1=x0+b.w*TS,zf=(b.y+b.h)*TS,F=(sx,sy,sw,sh)=>[U(p,sx),Vv(p,sy),U(p,sx+sw),Vv(p,sy+sh)];
  const box=(xa,xb,za,zb,ya,yb,fr,sc,tc,fl)=>{
    if(fr)Q([xa,yb,zb,xb,yb,zb,xb,ya,zb,xa,ya,zb],fr[0],fr[1],fr[2],fr[3],255,[0,0,1],fl==null?2|8:fl);
    sncFlat(bt,[xa,yb,za,xa,yb,zb,xa,ya,zb,xa,ya,za],sc,[-1,0,0]);sncFlat(bt,[xb,yb,zb,xb,yb,za,xb,ya,za,xb,ya,zb],sc,[1,0,0]);sncFlat(bt,[xa,yb,za,xb,yb,za,xb,yb,zb,xa,yb,zb],tc,[0,1,0]);};
  const hW=8*V;
  // wings on the front 'U' tiles: a low stone threshold
  [[x0+1,x0+12],[x1-12,x1-1]].forEach(([xa,xb])=>box(xa,xb,zf-14,zf-3,0,hW,F(22,42,12,9),side,top,8));
  // three treads up to the shrine
  for(let j=0;j<3;j++){const h=(j+1)*2.4*V,za=zf-7*(j+1)+1,zb=zf-7*j,xa=x0+14+(2-j)*0,xb=x1-14-0;Q([xa,h,zb,xb,h,zb,xb,0,zb,xa,0,zb],...F(0,42,20,3),255,[0,0,1],8);sncFlat(bt,[xa,h,za,xb,h,za,xb,h,zb,xa,h,zb],top,[0,1,0]);}
  // the shrine: a block on the top tread, a slab roof with its cap
  const base=7.2*V;box(x0+14,x1-14,zf-34,zf-20,base,base+19*V,F(0,7,20,19),side,top,2|8);
  box(x0+12,x1-12,zf-36,zf-18,base+19*V,base+22*V,F(36,42,22,4),side,top,8);box(x0+15,x1-15,zf-34,zf-20,base+22*V,base+24.6*V,null,side,top);
  // guardians: cards standing on the wings (or lantern pillars and obelisks, drawn as cards too: tall thin things)
  [x0+9,x1-9].forEach(cx=>Q([cx-7,hW+22*V,zf-9,cx+7,hW+22*V,zf-9,cx+7,hW,zf-9,cx-7,hW,zf-9],...F(24,0,14,22),255,[0,0,1],2|8));
  if(cfg.torii){[[x0+1,x0+6],[x1-6,x1-1]].forEach(([xa,xb])=>{const zb=zf-8,za=zf-12;Q([xa,38*V,zb,xb,38*V,zb,xb,0,zb,xa,0,zb],...F(40,0,5,38),255,[0,0,1],8);
      sncFlat(bt,[xa,38*V,za,xa,38*V,zb,xa,0,zb,xa,0,za],side,[-1,0,0]);sncFlat(bt,[xb,38*V,zb,xb,38*V,za,xb,0,za,xb,0,zb],side,[1,0,0]);sncFlat(bt,[xa,38*V,za,xb,38*V,za,xb,38*V,zb,xa,38*V,zb],top,[0,1,0]);});
    box(x0-6,x1+6,zf-13,zf-7,35*V,39.5*V,F(0,28,60,12),side,top,8);box(x0+5,x1-5,zf-11.5,zf-8.5,28*V,31*V,null,side,top);}
  // ribbons hang from the roof edges and the beam; cards
  [[x0+14,0],[x0+17,1],[x1-17,2],[x1-14,3]].forEach(([xa,i])=>Q([xa,base+19*V,zf-17.8,xa+3,base+19*V,zf-17.8,xa+3,base+11*V,zf-17.8,xa,base+11*V,zf-17.8],...F(48+i*4,0,3,8),255,[0,0,1],8));
  S.bh.push({b,h:(cfg.torii?39.5:base/V+24.6)*V});}
{const gp0=hdGatePart;hdGatePart=function(m){const r=gp0.apply(this,arguments);try{if(r&&m&&m.kind==='field')r.cv=slSaSheet(m);}catch(e){slErr('sasheet',e);}return r;};}
// HD-2D: the lair's mound goes straight to dungeon8's geometry (sanctlook10's gate wrap used to catch it too); the Sanctum shrine is mine
// the mound is lit from the upper left too: every face's shade follows its normal (top lightest, left lit, front mid, right darkest), so the hill reads as a form
const slLQ=Q=>(a,u0,v0,u1,v1,sh,n,fl)=>{const L=Math.max(0,-n[0]*.5+n[1]*.8+n[2]*.3);return Q(a,u0,v0,u1,v1,Math.round(sh*(.58+.42*Math.min(1,L/.85))),n,fl);};
// HD-2D x-ray: the entrance cards (den mouth, lair front) never thin out round the hero (doors and buildings are exempt the same way); flag 8 is cleared on those quads
{const bc0=hdBakeCards;hdBakeCards=function(m,S,g0,g1){const r=bc0.apply(this,arguments);try{if(r&&r.bt&&r.bt.b&&m&&m.kind==='field'){const src=[];(m.caves||[]).forEach(c=>{if(c.kind!=='fort')src.push([c.x*TS+8,(c.y+1)*TS+.5]);});if(m.ent)src.push([m.ent[0]*TS+8,(m.ent[1]+1)*TS+.5]);
  if(src.length)r.bt.b.forEach(bt=>{if(!bt)return;const f=bt.f,B=bt.b;for(let q=0;q<bt.n;q++){let x0=1e9,x1=-1e9;for(let k=0;k<4;k++){const x=f[(q*4+k)*7];x0=Math.min(x0,x);x1=Math.max(x1,x);}const z=f[(q*4)*7+2];
    if(src.some(([sx,sz])=>Math.abs(z-sz)<.6&&x1>sx-33&&x0<sx+33))for(let k=0;k<4;k++){const o=(q*4+k)*28+27;B[o]&=~8;}}});}}catch(e){slErr('xray',e);}return r;};}
{const gg0=hdGateGeo;hdGateGeo=function(m,S,b,Q,U,Vv,p,V,bt){if(b&&b.k==='d8lair')return d8LairGeo(m,S,b,slLQ(Q),U,Vv,p,V);
  if(b&&b.k==='gatehouse'){try{SLX.n.sanct++;return slSaGeo(m,S,b,Q,U,Vv,p,V,bt);}catch(e){slErr('sageo',e);}}return gg0.apply(this,arguments);};}
