// ===== worldart13.js (v0.19.6): every entrance stands as a solid mass, the way the tents did =====
// The owner: "do whatever is needed to make all entrances, dens, sanctums and lairs appear 3 dimensional like the tents used to". The v0.12.13 tents read
// as solid because each had a lit left face and a shaded right face meeting at a seam, a hem and a base shadow on the ground, a pole standing on top of
// the cloth (not beside it), a silhouette taller than the tiles round it, and, being a building sprite (m.bsp), the depth sort: a walker north of the
// front edge was hidden behind it, one south of it stood in front. The den mouths, lair fronts and the Sanctum shrine had the lit rim and the props
// (worldart12) but were still one front face painted into the ground, with the hero always drawn over them. One recipe now, for every entrance, in both
// renderers (docs/worldart13-entrances.md):
//   VOLUME   wa13Faces: the finished front sprite is extruded up and to the right (a three quarter view): every pixel of its silhouette is copied N steps
//            along (+1,-1); what stays visible round the front is a top face along its upper edge, painted in a lighter tone of the material there, and a
//            side face along its right edge in a darker, cooler tone; an outline goes round the whole mass. The realm's material survives because the
//            face tones are sampled from the sprite itself (ice stays ice, roots stay roots, sandstone stays sandstone).
//   MOUTH    the opening is a recess: its lintel and left jamb inside are darkened (set back into the mass), the right jamb inside catches the realm's
//            light; worldart12's threshold stone and the props at the foot stay.
//   SHADOW   a cast shadow on the ground to the lower right of the mass (the light is upper left), painted into the ground tiles so the 2D view and the
//            HD-2D ground bake both have it; in HD-2D the mass also stands in the sun shadow heightfield like a building (S.bh).
//   DEPTH    each field entrance (den mouth, lair front, the Sanctum shrine) is a building sprite in m.bsp (buildMapCanvas hook): the 2D depth sort
//            draws it over a hero standing behind it and under one in front, exactly as the tents were; in HD-2D the same entry stands as a card on the
//            footprint's front edge (hdGateGeo), lit by the scene, never thinned by the x-ray round the hero, and casting the sun shadow.
//   DOORS    the Sanctum's inner door (the E tile of the hall) gets a standing stone doorway with the same faces (a 2D actor in the depth sort, a
//            billboard in HD-2D); the Echo Rift gates get a top and a side face behind their panel (2D) and the same as a card behind the panel (HD-2D).
// Look only: no tile, collision, save field, game number or random draw changes. window.__WA13 (counters, `off`, api) is the test hook; tools/chrome/v175a.js.
const WA13={n:{vol:0,bsp:0,geo:0,cast:0,door:0,rift:0,gate:0},off:false,err:[],N:7};
function wa13Err(w,e){if(WA13.err.length<20)WA13.err.push(w+': '+(e&&e.message||e));}
const WA13_OUT='#120c14';
// ---------- the extrusion: a top face and a side face round a front sprite ----------
// o.n steps (default WA13.N); the result is (W+2n) x (H+n) with the front at (n, n). `ext` holds only what was added (transparent under the front), so a
// caller that already has the front on the ground can lay the faces under it; `cv` is the whole mass. topL/sideL: mean luminance of the two faces.
const WA13_FC=new WeakMap();
function wa13Faces(src,o){o=o||{};const n=o.n||WA13.N,key=n+':'+(o.k||'');let e=WA13_FC.get(src);if(e&&e.key===key)return e;
  const W=src.width,H=src.height,OW=W+2*n,OH=H+n;const sc=mkCv(W,H).getContext('2d');sc.drawImage(src,0,0);const sd=sc.getImageData(0,0,W,H).data;
  const sil=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&sd[(y*W+x)*4+3]>180,lum=i=>sd[i]*.3+sd[i+1]*.59+sd[i+2]*.11;
  // the tone of a face comes from the first pixel inward that is not the outline, averaged over its two neighbours along the edge (a cap of
  // alternating pixels would otherwise stripe the face)
  const samp1=(x,y,dx,dy)=>{for(let k=0;k<=3;k++){const X=x+dx*k,Y=y+dy*k;if(!sil(X,Y))break;const i=(Y*W+X)*4;if(lum(i)>40)return i;}return (y*W+x)*4;};
  const sc3=[0,0,0],samp=(x,y,dx,dy)=>{let n=0;sc3[0]=sc3[1]=sc3[2]=0;for(let j=-1;j<=1;j++){const X=x+dy*j,Y=y+dx*j;if(!sil(X,Y))continue;const i=samp1(X,Y,dx,dy);sc3[0]+=sd[i];sc3[1]+=sd[i+1];sc3[2]+=sd[i+2];n++;}
    if(n){sc3[0]/=n;sc3[1]/=n;sc3[2]/=n;}return sc3;};
  const out=mkCv(OW,OH),oc=out.getContext('2d'),img=oc.createImageData(OW,OH),d=img.data,kind=new Uint8Array(OW*OH);
  const put=(x,y,r,g,b,k)=>{if(x<0||y<0||x>=OW||y>=OH)return;const i=(y*OW+x)*4;d[i]=r;d[i+1]=g;d[i+2]=b;d[i+3]=255;kind[y*OW+x]=k;};
  for(let i=n;i>=1;i--)for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(!sil(x,y))continue;
    const top=!sil(x,y-1),side=!sil(x+1,y);let r,g,b;if(top||side){const q=top?samp(x,y,0,1):samp(x,y,-1,0);r=q[0];g=q[1];b=q[2];}else{const q=(y*W+x)*4;r=sd[q];g=sd[q+1];b=sd[q+2];}
    if(top){const t=.3;r=Math.min(255,(r+(255-r)*t)*1.04);g=Math.min(255,(g+(250-g)*t)*1.04);b=Math.min(255,(b+(235-b)*t)*1.02);if(((x*3+y*5)%13)===0){r*=.92;g*=.92;b*=.94;}}
    else if(side){r=r*.52;g=g*.52;b=Math.min(255,b*.56+22);if((y+i)%3===0){r*=.86;g*=.86;b*=.9;}}
    else{r*=.78;g*=.78;b*=.82;}
    put(x+n+i,y+n-i,Math.round(r),Math.round(g),Math.round(b),top?1:side?2:3);}
  // the front over it, then an outline round the whole mass
  oc.putImageData(img,0,0);oc.drawImage(src,n,n);
  {const fd=oc.getImageData(0,0,OW,OH),a=fd.data,at=(x,y)=>x>=0&&y>=0&&x<OW&&y<OH&&a[(y*OW+x)*4+3]>120;let tl=0,tn=0,sl=0,sn=0;
    for(let y=0;y<OH;y++)for(let x=0;x<OW;x++){const i=(y*OW+x)*4;if(a[i+3]>120){const fx=x-n,fy=y-n;if(sil(fx,fy))continue;const k=kind[y*OW+x],L=a[i]*.3+a[i+1]*.59+a[i+2]*.11;if(k===1){tl+=L;tn++;}else if(k===2){sl+=L;sn++;}continue;}
      if([[1,0],[-1,0],[0,1],[0,-1]].some(([p,q])=>at(x+p,y+q))){const c=hx(WA13_OUT);a[i]=c[0];a[i+1]=c[1];a[i+2]=c[2];a[i+3]=255;}}
    oc.putImageData(fd,0,0);
    // the faces alone (transparent wherever the front is), for callers that draw the front themselves
    const ext=mkCv(OW,OH),xc=ext.getContext('2d');xc.drawImage(out,0,0);const ed=xc.getImageData(0,0,OW,OH),b2=ed.data;
    for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(sd[(y*W+x)*4+3]>0){const i=((y+n)*OW+x+n)*4;b2[i+3]=0;}xc.putImageData(ed,0,0);
    e={key,cv:out,ext,n,w:OW,h:OH,topL:tn?tl/tn:0,sideL:sn?sl/sn:0,nTop:tn,nSide:sn};}
  WA13_FC.set(src,e);WA13.n.vol++;return e;}
// ---------- the mouth as a recess ----------
// worldart12 warmed the whole opening toward the realm's light, so it read as a lit panel in the face, not a hole. The opening is found on the sprite as
// sitelook10 drew it (`base`, where it is still dark; on the finished sprite only the threshold's outline is dark enough) and darkened again from the lintel
// down (35% under the lintel, 85% at the sill, so the lit threshold stays), the left jamb inside darker still, the right jamb inside catching the light.
function wa13Recess(src,acc,base){const W=src.width,H=src.height,cv=mkCv(W,H),c=cv.getContext('2d');c.drawImage(src,0,0);
  const id=c.getImageData(0,0,W,H),d=id.data;let door=null;if(typeof wa12Door==='function'){if(base&&base.width===W&&base.height===H){const bc=mkCv(W,H).getContext('2d');bc.drawImage(base,0,0);door=wa12Door(bc.getImageData(0,0,W,H).data,W,H);}if(!door)door=wa12Door(d,W,H);}
  if(!door)return src;
  const q=hx(acc||'#ffc070'),inD=new Set(door.q),hD=Math.max(1,door.y1-door.y0);
  door.q.forEach(p=>{const x=p%W,y=(p/W)|0,o=p*4,t=(y-door.y0)/hD;let k=.35+.5*Math.pow(t,1.6);
    if(x<door.x0+2)k*=.7;
    if(x>=door.x1-1&&y>=door.y0+3){const m=.22*t;for(let i=0;i<3;i++)d[o+i]=d[o+i]*(1-m)+q[i]*m;}
    for(let i=0;i<3;i++)d[o+i]*=k;});
  // the lintel's shadow drops onto the stone right over the opening
  for(let x=door.x0;x<=door.x1;x++)for(let y=door.y0-2;y<door.y0;y++){if(y<0)continue;const o=(y*W+x)*4;if(d[o+3]>180&&!inD.has(y*W+x))for(let i=0;i<3;i++)d[o+i]*=.8;}
  c.putImageData(id,0,0);return cv;}
const WA13_VC=new WeakMap();
function wa13Vol(src,kind,info){if(WA13.off)return src;let r=WA13_VC.get(src);if(r)return r;
  try{const rec=wa13Recess(src,info&&info.acc,info&&info.base),F=wa13Faces(rec,{k:kind});r=F.cv;r.__wa13={n:F.n,topL:F.topL,sideL:F.sideL,nTop:F.nTop,nSide:F.nSide,w0:src.width,h0:src.height,front:rec};}catch(e){wa13Err(kind,e);r=src;}
  WA13_VC.set(src,r);return r;}
HOOK.xform('slDenByKey','worldart13','den mouths as solid masses',function(cv,key){try{const L=SL_DEN[key]||{};return wa13Vol(cv,'den',{acc:L.acc,base:SL_DENC['den:'+key]});}catch(e){wa13Err('den',e);return cv;}});
HOOK.xform('slLairByKit','worldart13','lair fronts as solid masses',function(cv,K,lit){try{return wa13Vol(cv,'lair',{acc:WA12_LT[K&&K.lt],base:SL_LAIRC['lair:'+K.id+':'+(lit?1:0)]});}catch(e){wa13Err('lair',e);return cv;}});
// ---------- the entrances of a field ----------
// every field entrance has the 3 x 2 'U'/'E' footprint (world4 placeCaveMouth, worldgen, sites): the mass stands on it with its foot on the E tile's
// south edge (where sitelook10 and worldgfx2 put the sprite), five tiles wide for the drawing, three for the shadow
function wa13Sites(m){if(!m||m.kind!=='field'||WA13.off)return [];const key=(m.caves||[]).length+':'+(m.ent||[]).join()+':'+(m.fortAt||[]).join()+':'+(G&&G.cleared&&G.cleared[m.s]?1:0)+':'+(m.d8lair?1:0);
  if(m.__wa13&&m.__wa13.key===key)return m.__wa13.list;const list=[];
  try{(m.caves||[]).forEach(c=>{if(c.kind==='fort')return;const cv=slDenSprite(m);list.push({kind:'den',ex:c.x,ey:c.y,cv,sw:cv.width,sh:cv.height,hw:(cv.width-2*WA13.N)/2});});
    if(m.ent){const cv=slLairSprite(m);if(cv)list.push({kind:'lair',ex:m.ent[0],ey:m.ent[1],cv,sw:cv.width,sh:cv.height,hw:(cv.width-2*WA13.N)/2});}
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
    S.bh.push({b:{x:s.ex-1,y:s.ey-1,w:3,h:2},h:(s.sh-9)*V});WA13.n.geo++;}catch(e){wa13Err('geo',e);}});
// ---------- the Sanctum shrine in 2D: faces under its parts ----------
const WA13_SG={};
function wa13ShrineExt(th){if(WA13_SG[th])return WA13_SG[th];const o=slSaParts(th),P0=SNC_P(th),S=sncStone(P0),r={};
  const F=(cv,n)=>wa13Faces(cv,{n:n||5,k:'sa'}).ext;
  r.niche=F(o.niche,5);r.guard=F(o.guard,4);if(o.post)r.post=F(o.post,4);if(o.lintel)r.lintel=F(o.lintel,5);
  {const w=mkCv(11,10),c=w.getContext('2d');c.fillStyle=S[1];c.fillRect(0,0,11,10);c.fillStyle=S[0];c.fillRect(0,0,11,1);c.fillStyle=S[2];c.fillRect(0,8,11,2);r.wing=F(w,4);r.wn=4;}
  return WA13_SG[th]=r;}
HOOK.wrap('drawShrineFront','worldart13','the shrine parts stand with a top and a side face',function(next,ctx,x,y){
  try{if(!WA13.off){const m=sncFieldM(),th=slSaKey(m),cfg=SL_SA[th]||SL_SA.meadow,E=wa13ShrineExt(th);
    ctx.drawImage(E.wing,x-E.wn,y+22-E.wn);ctx.drawImage(E.wing,x+37-E.wn,y+22-E.wn);
    ctx.drawImage(E.niche,x+14-5,y-5-5);ctx.drawImage(E.guard,x+2-4,y+6-4);ctx.drawImage(E.guard,x+32-4,y+6-4);
    if(cfg.torii&&E.post){ctx.drawImage(E.post,x-4,y-9-4);ctx.drawImage(E.post,x+43-4,y-9-4);ctx.drawImage(E.lintel,x-6-5,y-14-5);}}}
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
      r={key,ext:F.ext,ox:x0-16-3,oy:y0-24-3,below:19-(y1-21),dx:(x0+x1+1)/2-16-8};}}
  catch(e){wa13Err('rift',e);}
  return WA13_RC[key]=r;}
HOOK.wrap('drawPortal','worldart13','the Rift gate faces under its panel (2D)',function(next,ctx,px,py,n,now){
  try{if(!WA13.off&&!WA13.inRift&&n&&!n.forge&&n.key!==RIFT_FORGE_KEY&&ctx.canvas&&ctx.canvas.width>24){const E=wa13RiftExt(n);if(E){ctx.drawImage(E.ext,px+E.ox,py+E.oy);WA13.n.rift++;}}}catch(e){wa13Err('rift2d',e);}
  return next(ctx,px,py,n,now);});
// test hooks
try{window.__WA13=WA13;WA13.api={faces:wa13Faces,sites:wa13Sites,vol:wa13Vol,recess:wa13Recess,door:wa13DoorCv,doorAt:wa13SanctDoor,rift:wa13RiftExt,shrine:wa13ShrineExt};}catch(e){}
