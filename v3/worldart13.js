// ===== worldart13.js (v0.19.6): every entrance stands as a solid mass, the way the tents did =====
// The owner: "do whatever is needed to make all entrances, dens, sanctums and lairs appear 3 dimensional like the tents used to". The v0.12.13 tents read
// as solid because each had a lit left face and a shaded right face meeting at a seam, a hem and a base shadow on the ground, a pole standing on top of
// the cloth (not beside it), a silhouette taller than the tiles round it, and, being a building sprite (m.bsp), the depth sort: a walker north of the
// front edge was hidden behind it, one south of it stood in front. The den mouths, lair fronts and the Sanctum shrine had the lit rim and the props
// (worldart12) but were still one front face painted into the ground, with the hero always drawn over them. One recipe now, for every entrance, in both
// renderers (docs/worldart13-entrances.md):
//   VOLUME   wa13Faces (v0.20.1 front facing; the owner: "just make all den, sanctum and dungeon entrances front facing for now"): the finished front
//            sprite rises straight up (0.19.6 extruded it along (+1,-1) into a three quarter block with a side face down its right edge): every pixel
//            of its silhouette is copied N steps up, so a top face shows along its upper edge, painted in a lighter tone of the material there (the
//            lightest of its top rows, pulled toward white), as wide as the front, and nothing at the sides; an outline goes round the whole mass and
//            the mass is centred in its canvas. The realm's material survives because the tone is sampled from the sprite itself.
//   MOUTH    the opening is a recess: its lintel and both jambs inside are darkened (set back into the mass, the same on either side); worldart12's lit
//            threshold stone and the props at the foot stay.
//   SHADOW   a cast shadow on the ground to the lower right of the mass (the light is upper left), painted into the ground tiles so the 2D view and the
//            HD-2D ground bake both have it; in HD-2D the mass also stands in the sun shadow heightfield like a building (S.bh).
//   DEPTH    each field entrance (den mouth, lair front, the Sanctum shrine) is a building sprite in m.bsp (buildMapCanvas hook): the 2D depth sort
//            draws it over a hero standing behind it and under one in front, exactly as the tents were; in HD-2D the same entry stands as a card on the
//            footprint's front edge (hdGateGeo), lit by the scene, never thinned by the x-ray round the hero, and casting the sun shadow from a
//            footprint that follows its outline column by column (wa13Prof).
//   DOORS    the Sanctum's inner door (the E tile of the hall) gets a standing stone doorway with the same faces (a 2D actor in the depth sort, a
//            billboard in HD-2D); the Echo Rift gates get a top face behind their panel (2D) and the same as a card behind the panel (HD-2D).
// Look only: no tile, collision, save field, game number or random draw changes. window.__WA13 (counters, `off`, api) is the test hook; tools/chrome/v175a.js.
const WA13={n:{vol:0,bsp:0,geo:0,cast:0,door:0,rift:0,gate:0},off:false,err:[],N:7};
function wa13Err(w,e){if(WA13.err.length<20)WA13.err.push(w+': '+(e&&e.message||e));}
const WA13_OUT='#120c14';
// ---------- the extrusion: a top face over a front sprite (front facing, v0.20.1) ----------
// The owner after 0.19.6: "just make all den, sanctum and dungeon entrances front facing for now". The front faces the camera squarely: every pixel of
// its silhouette is copied o.n steps straight up (default WA13.N), so what shows round the front is only a top face along its upper edge, as wide as the
// front itself (no side face, left and right stay as the sprite drew them); an outline goes round the whole mass. The result is W x (H+n) with the front
// at (fx, fy) = (dx, n), dx centring the front's opaque box in the canvas (its art can carry a prop on one side; a field entrance is drawn centred on
// its door, so the mass then stands square over it; at most a few px). `ext` holds only what was added (transparent under the front), so a caller that already has the front on the ground can lay the
// top face under it; `cv` is the whole mass. topL: mean luminance of the top face, frontL: of the front just under it (its first n rows past the outline).
const WA13_FC=new WeakMap();
function wa13Faces(src,o){o=o||{};const n=o.n||WA13.N,key=n+':'+(o.k||'');let e=WA13_FC.get(src);if(e&&e.key===key)return e;
  const W=src.width,H=src.height,OW=W,OH=H+n;const sc=mkCv(W,H).getContext('2d');sc.drawImage(src,0,0);const sd=sc.getImageData(0,0,W,H).data;
  const sil=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&sd[(y*W+x)*4+3]>180,lum=i=>sd[i]*.3+sd[i+1]*.59+sd[i+2]*.11;
  let bx0=W,bx1=-1;for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(sil(x,y)){if(x<bx0)bx0=x;if(x>bx1)bx1=x;}const fx=bx1<0?0:Math.trunc(((W-1-bx1)-bx0)/2);
  // the tone of the top face comes from the lightest of the first four pixels downward (past the outline, which the outline rule tints with the
  // material, onto the cap of moss, snow or salt), averaged over its two neighbours along the edge (a cap of alternating pixels would otherwise
  // stripe the face)
  const samp1=(x,y)=>{let b=(y*W+x)*4,bl=-1;for(let k=0;k<=3;k++){const Y=y+k;if(!sil(x,Y))break;const i=(Y*W+x)*4,l=lum(i);if(l>bl){bl=l;b=i;}}return b;};
  const sc3=[0,0,0],samp=(x,y)=>{let c=0;sc3[0]=sc3[1]=sc3[2]=0;for(let j=-1;j<=1;j++){if(!sil(x+j,y))continue;const i=samp1(x+j,y);sc3[0]+=sd[i];sc3[1]+=sd[i+1];sc3[2]+=sd[i+2];c++;}
    if(c){sc3[0]/=c;sc3[1]/=c;sc3[2]/=c;}return sc3;};
  const out=mkCv(OW,OH),oc=out.getContext('2d'),img=oc.createImageData(OW,OH),d=img.data,top=new Uint8Array(OW*OH);
  // each column: every run of the silhouette that starts at (x,y) (nothing above it) rises n steps; the face is lit evenly across, a touch darker at
  // its back edge (it recedes), with the same sparse grain as before
  for(let x=0;x<W;x++)for(let y=0;y<H;y++){if(!sil(x,y)||sil(x,y-1))continue;const q=samp(x,y),t=.3;
    const r0=Math.min(255,(q[0]+(255-q[0])*t)*1.04),g0=Math.min(255,(q[1]+(250-q[1])*t)*1.04),b0=Math.min(255,(q[2]+(235-q[2])*t)*1.02);
    for(let i=1;i<=n;i++){const Y=y+n-i;if(Y<0)break;const k=(i===n&&n>2?.9:1)*(((x*3+(y-i)*5)%13)===0?.92:1);
      const o3=(Y*OW+x+fx)*4;d[o3]=Math.round(r0*k);d[o3+1]=Math.round(g0*k);d[o3+2]=Math.round(b0*k);d[o3+3]=255;top[Y*OW+x+fx]=1;}}
  // the front over it, then an outline round the whole mass
  oc.putImageData(img,0,0);oc.drawImage(src,fx,n);
  // (the outline reads a copy of the alpha: reading the buffer it writes made each outline pixel the neighbour of the next, and 0.19.6 filled the
  // whole box right of and under the mass's first outline pixel with it, a dark slab that read as a side face)
  {const fd=oc.getImageData(0,0,OW,OH),a=fd.data,al=new Uint8Array(OW*OH);for(let i=0;i<OW*OH;i++)al[i]=a[i*4+3]>120?1:0;const at=(x,y)=>x>=0&&y>=0&&x<OW&&y<OH&&al[y*OW+x]===1;let tl=0,tn=0;
    for(let y=0;y<OH;y++)for(let x=0;x<OW;x++){const i=(y*OW+x)*4;if(a[i+3]>120){if(!sil(x-fx,y-n)&&top[y*OW+x]){tl+=a[i]*.3+a[i+1]*.59+a[i+2]*.11;tn++;}continue;}
      if([[1,0],[-1,0],[0,1],[0,-1]].some(([p,q])=>at(x+p,y+q))){const c=hx(WA13_OUT);a[i]=c[0];a[i+1]=c[1];a[i+2]=c[2];a[i+3]=255;}}
    oc.putImageData(fd,0,0);
    // the front just under the top face: per column, the n rows under the front's own top outline
    let fl=0,fn=0;for(let x=0;x<W;x++){let y=0;while(y<H&&!sil(x,y))y++;if(y>=H)continue;for(let k=1;k<=n&&y+k<H;k++)if(sil(x,y+k)){fl+=lum(((y+k)*W+x)*4);fn++;}}
    // the face alone (transparent wherever the front is), for callers that draw the front themselves
    const ext=mkCv(OW,OH),xc=ext.getContext('2d');xc.drawImage(out,0,0);const ed=xc.getImageData(0,0,OW,OH),b2=ed.data;
    for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(sd[(y*W+x)*4+3]>0&&x+fx>=0&&x+fx<OW){const i=((y+n)*OW+x+fx)*4;b2[i+3]=0;}xc.putImageData(ed,0,0);
    e={key,cv:out,ext,n,fx,fy:n,w:OW,h:OH,topL:tn?tl/tn:0,frontL:fn?fl/fn:0,nTop:tn};}
  WA13_FC.set(src,e);WA13.n.vol++;return e;}
// ---------- the mouth as a recess ----------
// worldart12 warmed the whole opening toward the realm's light, so it read as a lit panel in the face, not a hole. The opening is found on the sprite as
// sitelook10 drew it (`base`, where it is still dark; on the finished sprite only the threshold's outline is dark enough) and darkened again from the lintel
// down (35% under the lintel, 85% where it meets the lit inside), both jambs inside darker still (set back into the mass, the same on either side: the
// front faces the camera; 0.19.6 lit the right one for its three quarter light). The lit sill is worldart12's threshold stone, which stays.
function wa13Recess(src,acc,base){const W=src.width,H=src.height,cv=mkCv(W,H),c=cv.getContext('2d');c.drawImage(src,0,0);
  const id=c.getImageData(0,0,W,H),d=id.data;let door=null;if(typeof wa12Door==='function'){if(base&&base.width===W&&base.height===H){const bc=mkCv(W,H).getContext('2d');bc.drawImage(base,0,0);door=wa12Door(bc.getImageData(0,0,W,H).data,W,H);}if(!door)door=wa12Door(d,W,H);}
  if(!door)return src;
  const inD=new Set(door.q),hD=Math.max(1,door.y1-door.y0);
  door.q.forEach(p=>{const x=p%W,y=(p/W)|0,o=p*4,t=(y-door.y0)/hD;let k=.35+.5*Math.pow(t,1.6);
    if(x<door.x0+2||x>door.x1-2)k*=.7;
    for(let i=0;i<3;i++)d[o+i]*=k;});
  // the lintel's shadow drops onto the stone right over the opening
  for(let x=door.x0;x<=door.x1;x++)for(let y=door.y0-2;y<door.y0;y++){if(y<0)continue;const o=(y*W+x)*4;if(d[o+3]>180&&!inD.has(y*W+x))for(let i=0;i<3;i++)d[o+i]*=.8;}
  c.putImageData(id,0,0);return cv;}
const WA13_VC=new WeakMap();
function wa13Vol(src,kind,info){if(WA13.off)return src;let r=WA13_VC.get(src);if(r)return r;
  try{const rec=wa13Recess(src,info&&info.acc,info&&info.base),F=wa13Faces(rec,{k:kind});r=F.cv;r.__wa13={n:F.n,fx:F.fx,fy:F.fy,topL:F.topL,frontL:F.frontL,nTop:F.nTop,w0:src.width,h0:src.height,front:rec};}catch(e){wa13Err(kind,e);r=src;}
  WA13_VC.set(src,r);return r;}
HOOK.xform('slDenByKey','worldart13','den mouths as solid masses',function(cv,key){try{const L=SL_DEN[key]||{};return wa13Vol(cv,'den',{acc:L.acc,base:SL_DENC['den:'+key]});}catch(e){wa13Err('den',e);return cv;}});
HOOK.xform('slLairByKit','worldart13','lair fronts as solid masses',function(cv,K,lit){try{return wa13Vol(cv,'lair',{acc:WA12_LT[K&&K.lt],base:SL_LAIRC['lair:'+K.id+':'+(lit?1:0)]});}catch(e){wa13Err('lair',e);return cv;}});
// ---------- the entrances of a field ----------
// every field entrance has the 3 x 2 'U'/'E' footprint (world4 placeCaveMouth, worldgen, sites): the mass stands on it with its foot on the E tile's
// south edge (where sitelook10 and worldgfx2 put the sprite), five tiles wide for the drawing, three for the shadow
function wa13Sites(m){if(!m||m.kind!=='field'||WA13.off)return [];const key=(m.caves||[]).length+':'+(m.ent||[]).join()+':'+(m.fortAt||[]).join()+':'+(G&&G.cleared&&G.cleared[m.s]?1:0)+':'+(m.d8lair?1:0);
  if(m.__wa13&&m.__wa13.key===key)return m.__wa13.list;const list=[];
  try{(m.caves||[]).forEach(c=>{if(c.kind==='fort')return;const cv=slDenSprite(m);list.push({kind:'den',ex:c.x,ey:c.y,cv,sw:cv.width,sh:cv.height,hw:(cv.__wa13?cv.__wa13.w0:cv.width)/2});});
    if(m.ent){const cv=slLairSprite(m);if(cv)list.push({kind:'lair',ex:m.ent[0],ey:m.ent[1],cv,sw:cv.width,sh:cv.height,hw:(cv.__wa13?cv.__wa13.w0:cv.width)/2});}
    if(m.fortAt)list.push({kind:'gate',ex:m.fortAt[0],ey:m.fortAt[1],cv:null,sw:60,sh:50,hw:24});}
  catch(e){wa13Err('sites',e);}
  m.__wa13={key,list};return list;}
// 2D: a building sprite per entrance, drawn by worldDraw at (b.x*TS-BSP_X, b.y*TS-BSP_TOP) and sorted by its front edge
function wa13Bsp(m){const list=wa13Sites(m);if(!list.length)return;
  list.forEach(s=>{const b={x:s.ex-2,y:s.ey-1,w:5,h:2,k:'wa13'+s.kind,door:[s.ex,s.ey],ent:s},cv=mkCv(b.w*TS+BSP_X*2,b.h*TS+BSP_TOP+6),c=cv.getContext('2d');c.imageSmoothingEnabled=false;
    if(s.kind==='gate'){const keep=SNCX.fm;SNCX.fm=m;try{drawShrineFront(c,BSP_X+TS,BSP_TOP);}finally{SNCX.fm=keep;}WA13.n.gate++;}
    else{const x=Math.round(BSP_X+2*TS+8-s.sw/2),y=TS+BSP_TOP+17-s.sh;c.drawImage(s.cv,x,y);s.ox=x;s.oy=y;}
    (m.bsp=m.bsp||[]).push({b,cv});WA13.n.bsp++;});}
HOOK.after('buildMapCanvas','worldart13','field entrances stand in the depth sort',function(r,m){try{if(m&&m.kind==='field'&&!WA13.off)wa13Bsp(m);}catch(e){wa13Err('bsp',e);}});
// ---------- the cast shadow on the ground (lower right of the mass) ----------
function wa13Cast(ctx,m,x,y){const list=wa13Sites(m);if(!list.length)return;const c=tileAt(m,x,y);if(SOLID.includes(c)||c==='~')return;const px=x*TS,py=y*TS;
  list.forEach(s=>{const cx=s.ex*TS+8,by=s.ey*TS+17,r=cx+s.hw;const P=s.kind==='gate'?[[r-2,by-12],[r+18,by-4],[r+20,by+2],[r-2,by+2]]:[[r-6,by-18],[r+20,by-8],[r+23,by+2],[r-6,by+2]];
    const x0=Math.min(...P.map(p=>p[0])),x1=Math.max(...P.map(p=>p[0])),y0=Math.min(...P.map(p=>p[1])),y1=Math.max(...P.map(p=>p[1]));if(x1<px||x0>px+TS||y1<py||y0>py+TS)return;
    ctx.save();ctx.beginPath();ctx.rect(px,py,TS,TS);ctx.clip();const g=ctx.createLinearGradient(x0,0,x1,0);g.addColorStop(0,'rgba(16,10,30,.42)');g.addColorStop(1,'rgba(16,10,30,.1)');ctx.fillStyle=g;
    ctx.beginPath();ctx.moveTo(P[0][0],P[0][1]);for(let i=1;i<P.length;i++)ctx.lineTo(P[i][0],P[i][1]);ctx.closePath();ctx.fill();ctx.restore();WA13.n.cast++;});}
HOOK.after('drawTile','worldart13','cast shadows of the entrances',function(r,ctx,m,x,y){try{if(m&&m.kind==='field'&&!WA13.off&&!(typeof SLX!=='undefined'&&SLX.noAO))wa13Cast(ctx,m,x,y);}catch(e){wa13Err('cast',e);}});
// ---------- HD-2D ----------
// the card strip (hdBakeCards) leaves the den and lair E tiles alone: their fronts stand as building cards below (so the taller sprites are not clipped
// to the strip and the mass has a footprint in the sun shadow)
HOOK.wrap('hdBakeCards','worldart13','entrance fronts stand as building cards, not strip cards',function(next,m,S,g0,g1){const sw=[];
  try{if(m&&m.kind==='field'&&!WA13.off&&m.t)wa13Sites(m).forEach(s=>{if(s.kind==='gate')return;const row=m.t[s.ey];if(row&&row[s.ex]==='E'){sw.push([s.ex,s.ey]);row[s.ex]='U';}});}catch(e){wa13Err('strip',e);}
  try{return next(m,S,g0,g1);}finally{sw.forEach(([x,y])=>{m.t[y][x]='E';});}});
HOOK.xform('hdBldKind','worldart13','entrance parts take the gate path',function(k,m,b){return b&&b.k&&b.k.indexOf('wa13')===0?'gate':k;});
HOOK.wrap('hdGateGeo','worldart13','entrance cards with a depth footprint',function(next,m,S,b,Q,U,Vv,p,V,bt){
  if(!b||!b.k||b.k.indexOf('wa13')!==0)return next(m,S,b,Q,U,Vv,p,V,bt);
  try{const s=b.ent;if(b.k==='wa13gate'||!s||!s.cv)return;// the Sanctum shrine is geometry already (slSaGeo on hdGatePart)
    const cx=s.ex*TS+8,zf=(s.ey+1)*TS+.5,x0=cx-s.sw/2,x1=cx+s.sw/2,yb=-1*V,yt=(s.sh-1)*V;
    Q([x0,yt,zf,x1,yt,zf,x1,yb,zf,x0,yb,zf],U(p,s.ox),Vv(p,s.oy),U(p,s.ox+s.sw),Vv(p,s.oy+s.sh),255,[0,.45,.89],2);
    // the footprint in the sun shadow heightfield follows the front's outline, one tile column at a time (a 3 x 2 box cast a square slab of shadow
    // beside a round mouth, which read as a side face)
    wa13Prof(s).forEach(([tx,h])=>S.bh.push({b:{x:tx,y:s.ey-1,w:1,h:2},h:h*V,wa13:1}));WA13.n.geo++;}catch(e){wa13Err('geo',e);}});
// the height of the mass over each tile column it covers (px over the ground, less the 9 px the old box took off for the set back)
function wa13Prof(s){if(s.prof)return s.prof;const cv=s.cv,w=cv.width,h=cv.height,d=cv.getContext('2d').getImageData(0,0,w,h).data,x0=Math.round(s.ex*TS+8-w/2),out=[];
  for(let tx=s.ex-3;tx<=s.ex+3;tx++){let top=h;for(let px=Math.max(0,tx*TS-x0);px<Math.min(w,tx*TS+TS-x0);px++)for(let y=0;y<top;y++)if(d[(y*w+px)*4+3]>180){top=y;break;}
    const H=h-top-9;if(top<h&&H>=6)out.push([tx,H]);}
  return s.prof=out;}
// ---------- the Sanctum shrine in 2D: faces under its parts ----------
const WA13_SG={};
function wa13ShrineExt(th){if(WA13_SG[th])return WA13_SG[th];const o=slSaParts(th),P0=SNC_P(th),S=sncStone(P0),r={};
  const F=(cv,n)=>wa13Faces(cv,{n:n||5,k:'sa'});
  r.niche=F(o.niche,5);r.guard=F(o.guard,4);if(o.post)r.post=F(o.post,4);if(o.lintel)r.lintel=F(o.lintel,5);
  {const w=mkCv(11,10),c=w.getContext('2d');c.fillStyle=S[1];c.fillRect(0,0,11,10);c.fillStyle=S[0];c.fillRect(0,0,11,1);c.fillStyle=S[2];c.fillRect(0,8,11,2);r.wing=F(w,4);}
  return WA13_SG[th]=r;}
HOOK.wrap('drawShrineFront','worldart13','the shrine parts stand with a top face',function(next,ctx,x,y){
  try{if(!WA13.off){const m=sncFieldM(),th=slSaKey(m),cfg=SL_SA[th]||SL_SA.meadow,E=wa13ShrineExt(th),put=(F,X,Y)=>ctx.drawImage(F.ext,X-F.fx,Y-F.fy);
    put(E.wing,x,y+22);put(E.wing,x+37,y+22);put(E.niche,x+14,y-5);put(E.guard,x+2,y+6);put(E.guard,x+32,y+6);
    if(cfg.torii&&E.post){put(E.post,x,y-9);put(E.post,x+43,y-9);put(E.lintel,x-6,y-14);}}}
  catch(e){wa13Err('shrine',e);}
  return next(ctx,x,y);});
// ---------- the Sanctum's inner door ----------
function wa13SanctDoor(m){if(!m||!m.fort||!m.cave)return null;if(m.__wa13d!==undefined)return m.__wa13d;let d=null;
  try{for(let y=0;y<m.h&&!d;y++)for(let x=0;x<m.w;x++)if(m.t[y][x]==='E'){d={x,y};break;}}catch(e){}return m.__wa13d=d;}
function wa13DoorCv(m){const th=m&&m.theme||'meadow',key='wa13door:'+th;return imgOf(key,()=>{const P0=SNC_P(SNC[th]?th:'meadow'),S=sncStone(P0),cv=mkCv(24,22),c=cv.getContext('2d'),f=(col,x,y,w,h)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
    // two jambs and a lintel of the Sanctum's stone, a cap of the realm's weathering, the accent band, a warm light at the top of the opening
    f(S[3],1,3,22,19);f(S[1],2,4,20,18);f(S[0],2,4,20,1);f(S[0],2,4,1,18);f(S[2],20,5,2,17);f(S[2],3,9,18,1);
    f('#2a2230',6,9,12,13);const g=c.createLinearGradient(0,9,0,22);g.addColorStop(0,P0.acc2);g.addColorStop(.6,'rgba(0,0,0,0)');c.fillStyle=g;c.globalAlpha=.55;c.fillRect(6,9,12,13);c.globalAlpha=1;
    f(P0.acc,3,7,18,1);f(S[3],0,2,24,2);f(S[1],1,2,22,1);f(S[0],1,2,22,1);try{sncCap((col,a,b,w,h)=>f(col,a,b,w,h),1,3,22,P0,mulberry(19));}catch(e){}
    const F=wa13Faces(cv,{n:3,k:'door'});return F.cv;});}
HOOK.after('townDecorActors','worldart13','the Sanctum inner door in the 2D depth sort',function(r,actors,now,cx,cy){try{const m=WS.m,ctx=WS.ctx;if(!m||!ctx||WA13.off)return;const d=wa13SanctDoor(m);if(!d)return;
  const cv=wa13DoorCv(m),px=d.x*TS+8-cv.width/2+1-cx,py=(d.y+1)*TS-cv.height+1-cy;if(px<-40||py<-40||px>WS.vw+40||py>WS.vh+40)return;
  actors.push({y:d.y*TS+.25,draw:()=>{ctx.drawImage(cv,Math.round(px),Math.round(py));WA13.n.door++;}});}catch(e){wa13Err('door',e);}});
HOOK.after('hdActors','worldart13','the Sanctum inner door and the Rift gate faces in HD-2D',function(r,m,now,ts){try{if(!m||WA13.off)return;const V=HD.S.V,B=HD.dyn;
  const d=wa13SanctDoor(m);if(d){const cv=wa13DoorCv(m);if(Math.abs(d.x*TS-HD.cam.x)<520&&Math.abs(d.y*TS-HD.cam.z)<640){hdBill(B,'wa13door:'+m.theme,cv,d.x*TS+8+1,0,(d.y+1)*TS+.5,false,1,255,255,255,255,2);WA13.n.door++;}}
  if(m.sanctum)(m.npcs||[]).forEach(n=>{if(!n.portal||n.forge||n.key===RIFT_FORGE_KEY)return;const nx=n.x*TS,ny=n.y*TS;if(Math.abs(nx-HD.cam.x)>420||Math.abs(ny-HD.cam.z)>520)return;
    const E=wa13RiftExt(n);if(!E)return;hdBill(B,E.key,E.ext,nx+8+E.dx,(E.below-1)*V,ny+14-.4,false,1,255,255,255,255,2);WA13.n.rift++;});}catch(e){wa13Err('hdDoor',e);}});
// ---------- the Echo Rift gates: faces behind the panel ----------
// the panel is drawn by drawPortal (sanctum.js, rift9 arch, riftkeeper9); its silhouette is taken once per gate kind from an offscreen draw, extruded
// three steps and laid under the panel (2D) or stood as a card just behind it (HD-2D, hdActors above)
const WA13_RC={};
function wa13RiftExt(n){const open=typeof riftKeys==='function'&&riftKeys().includes(n.key),key='wa13rift:'+n.key+':'+(n.cal?1:0)+':'+(open?1:0);if(WA13_RC[key]!==undefined)return WA13_RC[key];let r=null;
  try{const cv=mkCv(48,48),c=cv.getContext('2d');WA13.inRift=1;try{drawPortal(c,16,24,Object.assign({},n,{x:0}),0);}finally{WA13.inRift=0;}
    const d=c.getImageData(0,0,48,48).data;let x0=48,x1=-1,y0=48,y1=-1;for(let y=0;y<48;y++)for(let x=0;x<48;x++)if(d[(y*48+x)*4+3]>180){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
    if(x1>=x0){const fw=x1-x0+1,fh=y1-y0+1,fr=mkCv(fw,fh);fr.getContext('2d').drawImage(cv,x0,y0,fw,fh,0,0,fw,fh);const F=wa13Faces(fr,{n:3,k:'rift'});
      // 2D: the faces go at (px+ox, py+oy); HD: the card bottom (row 20 of the 16 x 20 card drawn at oy 3) is `below` px under the panel's foot, dx from its middle
      r={key,ext:F.ext,n:F.n,fw:fw,fh:fh,ox:x0-16-F.fx,oy:y0-24-F.fy,below:19-(y1-21),dx:(x0+x1+1)/2-16-8};}}
  catch(e){wa13Err('rift',e);}
  return WA13_RC[key]=r;}
HOOK.wrap('drawPortal','worldart13','the Rift gate faces under its panel (2D)',function(next,ctx,px,py,n,now){
  try{if(!WA13.off&&!WA13.inRift&&n&&!n.forge&&n.key!==RIFT_FORGE_KEY&&ctx.canvas&&ctx.canvas.width>24){const E=wa13RiftExt(n);if(E){ctx.drawImage(E.ext,px+E.ox,py+E.oy);WA13.n.rift++;}}}catch(e){wa13Err('rift2d',e);}
  return next(ctx,px,py,n,now);});
// test hooks
try{window.__WA13=WA13;WA13.api={faces:wa13Faces,sites:wa13Sites,vol:wa13Vol,recess:wa13Recess,door:wa13DoorCv,doorAt:wa13SanctDoor,rift:wa13RiftExt,shrine:wa13ShrineExt,prof:wa13Prof};}catch(e){}
