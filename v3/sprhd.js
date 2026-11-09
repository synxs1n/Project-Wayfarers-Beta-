// ===== sprhd.js (v0.5.3): HD sprites: twice the detail, light ramps, rim light (SPRITE_HD in config.js) =====
// Every hero, townsfolk and monster is still built from the same key grids (art.js, art2.js, art3.js, capes, realm and echo recolours), but
// painted by paintHD at SPR.k times the detail:
//  1. the key grid is doubled with Scale2x (EPX), which rounds corners and smooths diagonals without inventing colours;
//  2. heroes get eyes with lid, iris and catchlight (faceHD);
//  3. each pixel's light comes from how far it sits from the edges of its own part and of the whole figure (light from the upper left),
//     on a five step hue shifted ramp per material (skin, hair, metal, cloth, the rest), with cast shadow under overlapping parts;
//  4. coloured line art (the darkest tone of the part it outlines, lighter on the lit side), a cool rim light on the shadow side edge, glow.
// Heroes also stand SPR.addH logical rows taller: rows of the legs and torso are repeated (stretchHero), the head keeps its size and place.
// The canvas that comes out is SPR.k times larger but reports its logical size through width/height (sprHD), and drawImage scales it back
// (see the patch below), so battle slots, world anchoring, unit boxes and every other consumer keep working with logical numbers.
// SPRITE_HD=false in config.js leaves all of this out.
function sprHD(c,k){const P=HTMLCanvasElement.prototype,dw=Object.getOwnPropertyDescriptor(P,'width'),dh=Object.getOwnPropertyDescriptor(P,'height');
  if(c.hd)return c;c.hd=k;
  Object.defineProperty(c,'_rw',{get(){return dw.get.call(this);},configurable:true});Object.defineProperty(c,'_rh',{get(){return dh.get.call(this);},configurable:true});
  Object.defineProperty(c,'width',{get(){return dw.get.call(this)/k;},set(v){dw.set.call(this,Math.round(v*k));},configurable:true});
  Object.defineProperty(c,'height',{get(){return dh.get.call(this)/k;},set(v){dh.set.call(this,Math.round(v*k));},configurable:true});
  return c;}
// a fresh HD canvas of logical size w x h whose context already draws in logical units
function hdCv(w,h,k){k=k||SPR.k;const c=mkCv(Math.round(w*k),Math.round(h*k));sprHD(c,k);const x=c.getContext('2d');x.setTransform(k,0,0,k,0,0);x.imageSmoothingEnabled=false;return c;}
if(SPRITE_HD&&typeof CanvasRenderingContext2D!=='undefined'&&!CanvasRenderingContext2D.prototype._hdDI){
  const P=CanvasRenderingContext2D.prototype,DI=P.drawImage;P._hdDI=DI;
  P.drawImage=function(img,a,b,c,d,e,f,g,h){const k=img&&img.hd;if(!k)return DI.apply(this,arguments);
    const n=arguments.length;
    if(n===3)return DI.call(this,img,0,0,img._rw,img._rh,a,b,img._rw/k,img._rh/k);
    if(n===5)return DI.call(this,img,a,b,c,d);
    return DI.call(this,img,a*k,b*k,c*k,d*k,e,f,g,h);};
}
// ----- Scale2x on a key grid -----
function epx(A,W,H){const W2=W*2,O=new Array(W2*H*2).fill(0);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x,P=A[i],a=y>0?A[i-W]:0,b=x<W-1?A[i+1]:0,c=x>0?A[i-1]:0,d=y<H-1?A[i+W]:0;
    let p1=P,p2=P,p3=P,p4=P;
    if(c===a&&c!==d&&a!==b)p1=a;if(a===b&&a!==c&&b!==d)p2=b;if(d===c&&d!==b&&c!==a)p3=c;if(b===d&&b!==a&&d!==c)p4=d;
    const o=(y*2)*W2+x*2;O[o]=p1;O[o+1]=p2;O[o+W2]=p3;O[o+W2+1]=p4;}
  return O;}
// ----- ramps: [specular, highlight, light, base, shadow, deep] -----
const HDR={};
function hdRamp(c,mat){const key=c+mat;if(HDR[key])return HDR[key];let R;
  if(mat==='s')R=[mix(tint(c,.34),'#fff0dc',.3),mix(tint(c,.22),'#fff0d8',.2),tint(c,.1),c,mix(shade(c,.86),'#c84a5a',.2),mix(shade(c,.68),'#7a2848',.34)];
  else if(mat==='m')R=[mix(tint(c,.82),'#ffffff',.5),mix(tint(c,.5),'#fff6dc',.2),tint(c,.22),c,mix(shade(c,.68),'#283068',.22),mix(shade(c,.44),'#120c2c',.36)];
  else if(mat==='h')R=[mix(tint(c,.5),'#fff6e0',.3),mix(tint(c,.34),'#fff2d0',.2),tint(c,.14),c,mix(shade(c,.74),'#301a5a',.2),mix(shade(c,.52),'#140a30',.32)];
  else R=[mix(tint(c,.42),'#fff4d0',.26),mix(tint(c,.3),'#fff2c8',.2),mix(tint(c,.13),'#fff0c8',.08),c,mix(shade(c,.75),'#2c1a5a',.2),mix(shade(c,.52),'#140a30',.32)];
  return HDR[key]=R.map(hx);}
function hdSat(c){const [r,g,b]=hx(c),M=Math.max(r,g,b),m=Math.min(r,g,b);return M?(M-m)/M:0;}
function hdLum(c){const [r,g,b]=hx(c);return .3*r+.59*g+.11*b;}
// mat per key: s skin, h hair, m metal, c everything else. Heroes name their keys; monsters guess metal from grey M, N and G.
const HD_HERO_MAT={S:'s',e:'s',H:'h',T:'h',h:'h',l:'h',M:'m',N:'m',c:'m',G:'m',I:'m'};
function hdMats(pal,hero){const o={};Object.keys(pal).forEach(k=>{if(!pal[k])return;if(hero)o[k]=HD_HERO_MAT[k]||'c';
  else o[k]=(k==='G'||((k==='M'||k==='N')&&hdSat(pal[k])<.32))?'m':'c';});return o;}
// everything a pixel of this colour and material needs, built once per colour
const HDK={};
function hdKey(col,m){const key=col+m;if(HDK[key])return HDK[key];const R=hdRamp(col,m),OUT=hx(OUTC),lit=SPR.outA-.15,dk=SPR.outA+.12;
  return HDK[key]={m,R,base:hx(col),lum:hdLum(col),rim:hx(mix(tint(col,.55),'#dcecff',.45)),
    olL:R[5].map((v,j)=>v*(1-lit)+OUT[j]*lit),olD:R[5].map((v,j)=>v*(1-dk)+OUT[j]*dk),ol2:R[5].map((v,j)=>v*.25+OUT[j]*.75)};}
// Paint a key grid at SPR.k (2) times the detail. opt: flat, noAO, rim (outline colour), glow, hero (material names), detail(K,W,H) hook.
function paintHD(g,pal,opt){
  opt=opt||{};const W0=g.w,H0=g.h,W=W0*2,H=H0*2,KC=epx(g.a,W0,H0);
  if(opt.detail)opt.detail(KC,W,H);
  const flat=opt.flat||'',noAO=opt.noAO||'',mats=hdMats(pal,opt.hero),N=W*H;
  // keys become small numbers with everything a pixel needs looked up once per key
  const ids={},T=[null];const K=new Uint8Array(N);
  for(let i=0;i<N;i++){const c=KC[i];if(!c||!pal[c])continue;let n=ids[c];
    if(n===undefined){const m=mats[c]||'c';n=ids[c]=T.length;T.push(Object.assign({c,flat:flat.includes(c),ao:!noAO.includes(c)||m==='s'},hdKey(pal[c],m)));}
    K[i]=n;}
  const id=new ImageData(W,H),d=id.data;
  // run lengths of the same key (part) and of any key (silhouette) in four directions
  const kU=new Uint8Array(N),kD=new Uint8Array(N),kL=new Uint8Array(N),kR=new Uint8Array(N),sU=new Uint8Array(N),sD=new Uint8Array(N),sL=new Uint8Array(N),sR=new Uint8Array(N);
  for(let i=W;i<N;i++){const k=K[i];if(!k)continue;const a=K[i-W],b=K[i-1];
    if(a){const v=sU[i-W];sU[i]=v<250?v+1:v;if(a===k){const w=kU[i-W];kU[i]=w<250?w+1:w;}}
    if(b&&i%W){const v=sL[i-1];sL[i]=v<250?v+1:v;if(b===k){const w=kL[i-1];kL[i]=w<250?w+1:w;}}}
  for(let i=N-W-1;i>=0;i--){const k=K[i];if(!k)continue;const a=K[i+W],b=K[i+1];
    if(a){const v=sD[i+W];sD[i]=v<250?v+1:v;if(a===k){const w=kD[i+W];kD[i]=w<250?w+1:w;}}
    if(b&&(i+1)%W){const v=sR[i+1];sR[i]=v<250?v+1:v;if(b===k){const w=kR[i+1];kR[i]=w<250?w+1:w;}}}
  const put=(i,c,a)=>{const j=i*4;d[j]=c[0];d[j+1]=c[1];d[j+2]=c[2];d[j+3]=a===undefined?255:a;};
  const tone=new Int8Array(N),tex=opt.tex,rA=SPR.rimA,nk=T.length,TF=new Uint8Array(nk),TA=new Uint8Array(nk),TL=new Float32Array(nk),TM=new Uint8Array(nk);
  for(let k=1;k<nk;k++){TF[k]=T[k].flat?1:0;TA[k]=T[k].ao?1:0;TL[k]=T[k].lum;TM[k]=T[k].m==='m'?1:T[k].m==='s'?2:T[k].m==='h'?3:0;}
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x,k=K[i];if(!k)continue;const j=i*4;
    if(TF[k]){tone[i]=-1;const c=T[k].base;d[j]=c[0];d[j+1]=c[1];d[j+2]=c[2];d[j+3]=255;continue;}
    const mm=TM[k],u=kU[i],dd=kD[i],l=kL[i],r=kR[i];
    const a1=u<14?u:14,b1=dd<14?dd:14,l1=l<14?l:14,r1=r<14?r:14,su=sU[i],sd=sD[i],sl=sL[i],sr=sR[i];
    const a2=su<30?su:30,b2=sd<30?sd:30,l2=sl<30?sl:30,r2=sr<30?sr:30;
    const t=.58*(a1+.55*l1+.5)/(a1+b1+.55*(l1+r1)+1)+.42*(a2+.55*l2+.5)/(a2+b2+.55*(l2+r2)+1);
    let q=t<.13?1:t<.33?2:t<.64?3:t<.85?4:5;
    if(mm===1&&t<.08&&u+dd>3)q=0;
    if(mm===2&&q===1)q=2;
    // cast shadow under a different part (two rows), unless that part is flat detail
    if(TA[k]&&y>0){const up=K[i-W];
      if(up&&up!==k&&!TF[up])q+=mm===2?1:2;
      else if(up===k&&y>1&&mm!==2){const u2=K[i-2*W];if(u2&&u2!==k&&!TF[u2])q++;}
      if(q>5)q=5;}
    if(tex){q=tex(q,x,y,T[k].c,T[k].m,u,dd,l,r,t);if(q<0)q=0;else if(q>5)q=5;}
    // underside of the silhouette
    if(y<H-1&&!K[i+W]&&q<4)q=4;
    // a darker seam where a part meets a brighter part on its left
    if(x>0&&q<5){const lf=K[i-1];if(lf&&lf!==k&&!TF[lf]&&TL[lf]>TL[k]+18)q++;}
    tone[i]=q;
    const c=T[k].R[q];
    // rim light on the right hand edge of the silhouette (the side away from the light)
    if(q>=3&&x<W-1&&(!K[i+1]||(y>0&&!K[i-W+1]&&!K[i-W]))){const R=T[k].rim;d[j]=c[0]+(R[0]-c[0])*rA;d[j+1]=c[1]+(R[1]-c[1])*rA;d[j+2]=c[2]+(R[2]-c[2])*rA;}
    else{d[j]=c[0];d[j+1]=c[1];d[j+2]=c[2];}
    d[j+3]=255;}
  // line art: the darkest tone of the part it touches, mixed toward the ink colour; softer on the lit (top and left) side, and one pixel
  // heavier on the shadow (bottom and right) side so silhouettes still read at small sizes
  const oc=opt.rim?hx(opt.rim):null,ol=new Uint8Array(N);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x;if(K[i])continue;
    const up=y>0?K[i-W]:0,lf=x>0?K[i-1]:0,n=up||lf||(y<H-1?K[i+W]:0)||(x<W-1?K[i+1]:0);if(!n)continue;ol[i]=n;
    put(i,oc||(!up&&!lf?T[n].olL:T[n].olD));}
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x;if(K[i]||ol[i])continue;
    const a=x>1&&ol[i-1]&&K[i-2]?i-1:y>1&&ol[i-W]&&K[i-2*W]?i-W:-1;if(a<0)continue;
    put(i,oc||T[ol[a]].ol2,oc?200:235);}
  if(opt.glow){const gc=hx(opt.glow),A=new Uint8Array(N);for(let i=0;i<N;i++)if(d[i*4+3]===255)A[i]=1;
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x;if(d[i*4+3])continue;let best=0;
      for(let b=-3;b<=3&&best<120;b++){const yy=y+b;if(yy<0||yy>=H)continue;for(let a=-3;a<=3;a++){const xx=x+a;if(xx<0||xx>=W||!A[yy*W+xx])continue;const r=Math.max(a<0?-a:a,b<0?-b:b),v=r<=1?120:r===2?70:34;if(v>best)best=v;}}
      if(best)put(i,gc,best);}}
  // catchlights: the top left pixel of every flat eye blob of three or more pixels
  if(!opt.hero&&ids.E){const e=ids.E,cl=hx(tint(pal.E,.72));for(let i=W+1;i<N-W-1;i++){if(K[i]!==e||!T[e].flat)continue;
    if(K[i-W]===e||K[i-1]===e)continue;if(K[i+1]===e&&K[i+W]===e)put(i,cl);}}
  const cv=mkCv(W,H);cv.getContext('2d').putImageData(id,0,0);return sprHD(cv,2);
}
// ----- heroes -----
// eyes: a dark lid row, iris (hair coloured) with a catchlight, a lighter lower iris. Works on the doubled grid.
function faceHD(K,W,H){
  for(let i=0;i<K.length;i++)if(K[i]==='9')K[i]='E';// the catchlight marker of the logical grid is part of the eye here (the HD eye makes its own)
  for(let i=0;i<K.length;i++){if(K[i]!=='E')continue;const x=i%W,y=(i/W)|0;if(y>0&&K[i-W]==='E')continue;
    let n=0;while(y+n<H&&K[i+n*W]==='E')n++;if(n<3)continue;const left=!(x>0&&K[i-1]==='E');
    for(let j=1;j<n;j++){const p=i+j*W;K[p]=j===n-1?'2':(j===1&&left?'3':'1');}
    // brow above, a touch of blush below
    if(y>=2&&K[i-2*W]==='S')K[i-2*W]='5';
    const b=i+(n+1)*W;if(y+n+1<H&&K[b]==='S'&&left)K[b]='4';}
}
// hair strands, cloth folds and metal plate edges on the doubled grid
function texHD(q,x,y,k,m,u,d,l,r){
  if(m==='h'){if((u===3||u===4)&&d>4&&q>=2&&q<=3&&(x+y)%7!==0)return 1;if(q>=2&&q<=4){const s=(x+(y>>2))%4;if(s===0)return q+1;if(s===2&&q===3&&u>1)return 2;}return q;}
  if(m==='m'){if(u===1&&d>2&&q>1)return q-1;return q;}
  if(m==='c'&&'PKJYQB'.includes(k)&&l+r>=6&&u+d>=8&&u>=3){const s=(x*5+k.charCodeAt(0)+(y>>3))%11;if(s===0&&q>=3)return Math.min(5,q+1);if(s===1&&q===3)return 2;}
  return q;}
const IRIS=['#3a5aa0','#6a4428','#2e7058','#7a5a2a','#5a3a8a','#2a6a8a'];
function heroPalHD(p){const o=Object.assign({},p);const E=p.E||'#1a1020',dark=hdLum(E)<60;
  const iris=dark?IRIS[hashS((p.H||'')+(p.S||'')+(p.P||''))%IRIS.length]:E;o.E=mix(E,'#140a18',.5);o['1']=iris;o['2']=tint(iris,.34);o['3']='#ffffff';o['4']=mix(p.S||'#f6d1b0','#ff7a8a',.38);o['5']=mix(shade(p.H||'#4a2c1a',.6),'#1a1020',.3);return o;}
const HFLAT_HD=HFLAT9+'12345';
// monster families (archetype.js types) get their own surface: fur, plates, feathers, leaf spots, a wet sheen, tattered folds
function monFam(art){try{const b=String(art).replace(/^echo_/,'');const t=(MON_TY[art]||BOSS_TY[art]||MON_TY[b]||BOSS_TY[b]||[]);
  if(t.length)return t;const r=typeof REALMS!=='undefined'&&Object.keys(MON_TY).find(k=>b.endsWith('_'+k)||b.startsWith(k+'_'));return r?MON_TY[r]:[];}catch(e){return [];}}
function monTex(art){const T=monFam(art),f=T.includes('jelly')?'jelly':T.includes('armored')?'armor':T.includes('beast')?'fur':T.includes('plant')?'plant':T.includes('undead')?'cloth':T.includes('flying')?'feather':'';
  if(!f)return null;
  return function(q,x,y,k,m,u,d,l,r,t){const big=u+d>6&&l+r>6;if(!big||q<1)return q;const h=((x*73856093)^(y*19349663))>>>0;
    if(f==='fur'){if(q>=3&&q<=4&&u>1&&(x+(y>>1))%6===0&&((y+x*3)%7)<3)return q+1;if(q===3&&(x+(y>>1))%6===3&&((y+x*5)%9)<2)return 2;return q;}
    if(f==='armor'){if(u===1&&q>1)return q-1;if(d===1&&q<5)return q+1;return q;}
    if(f==='feather'){if(q===3&&(y%6===5)&&((x+((y/6|0)%2)*3)%6)<3)return 4;return q;}
    if(f==='plant'){if(q>=2&&q<=4&&h%23===0)return q-1;if(q>=3&&h%31===0)return q+1;return q;}
    if(f==='jelly'){if(t<.2&&u+l<6)return 0;if(t>.3&&t<.55&&q>=3)return 2;return q;}
    if(f==='cloth'){const s=(x*5+k.charCodeAt(0)+(y>>3))%9;if(s===0&&q>=3&&u>=3)return Math.min(5,q+1);if(s===1&&q===3)return 2;return q;}
    return q;};}
// the rig (art.js) is already drawn at its final height, so the old HD stretch is gone: this keeps the name and returns the grid as it is
function stretchHero(o,L){return o;}
const HERO_OPT={flat:HFLAT_HD,noAO:HNOAO,hero:1,detail:faceHD,tex:texHD};
if(SPRITE_HD){
  const hgs0=heroGridSide,hgv0=heroGridView;
  heroGridSide=function(L,walk,id){return stretchHero(hgs0(L,walk,id),L);};
  heroGridView=function(L,view,frame,id){const g=hgv0(L,view,frame,id);return view==='side'?g:stretchHero(g,L);};
  heroCanvas=function(id,walk){const t=TPL[id];if(t.mon)return monCanvas(t.art);const L=heroLook(id);return paintHD(heroGridSide(L,walk,id),heroPalHD(heroPalD(heroPal(L,t.el,id))),HERO_OPT);};
  walkerCanvas=function(key,L,els,id,view,frame){
    if(id&&TPL[id]&&TPL[id].mon)return imgOf('wkm:'+id,()=>monCanvas(TPL[id].art));
    return imgOf('wk3:'+key+':'+view+':'+frame,()=>paintHD(heroGridView(L,view,frame,id),heroPalHD(heroPalD(heroPal(L,els,id))),HERO_OPT));};
  monCanvas=function(art,f){return monFramed(art,f,()=>{const s=MON_SIZE(art),g=new PG(s,s,0,0),o=MART[art](g,f);const pal=Object.assign({},o.pal);if(MEXTRA[art])MEXTRA[art](g,pal);
    return paintHD(g,pal,{flat:o.flat||'',rim:o.rim,glow:o.glow,tex:monTex(art)});});};
  monURL=function(art){return cvURL('m3:'+art,()=>monCanvas(art));};
}

// ===== overworld walkers use the compact rig (28x40, the rig drawn at scale .7: art.js HRS / rigScale); a 'big:' key keeps the 40x56 rig (title scene, sheets) =====
// every walker consumer (the player, townsfolk, legend actors, wanderers, the HD-2D billboards) goes through walkerCanvas, so this one wrapper covers them. Caches stay per size: compact keys end in '|c'.
{const wc0=walkerCanvas;walkerCanvas=function(key,L,els,id,view,frame){
  if(typeof key!=='string'||(id&&TPL[id]&&TPL[id].mon))return wc0.apply(this,arguments);
  if(key.slice(0,4)==='big:')return wc0.call(this,key.slice(4),L,els,id,view,frame);
  return rigScale(.8,()=>wc0.call(this,key+"|c8",L,els,id,view,frame));};}/* v0.15.8: back to .8 (32x45): at .9 the walkers stood taller than the doors again; battle stays .9 (scale10.js) */
