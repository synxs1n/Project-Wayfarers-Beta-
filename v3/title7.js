// ===== v0.7.1: the title screen in the HD-2D look =====
// A dusk camp on the road to a walled town: the HD hero sprites at their real 2x bitmap (integer scaled, nearest neighbour), lit like
// the HD-2D scenes (dusk ambient, warm fire light on the side facing the fire, a rim on that edge, a cool sky rim on top, soft contact
// and cast shadows, grade and vignette), a far town and hills with depth of field. Motion: fire flicker, breathing, rising embers,
// twinkling stars; all still under reduced motion and on the Low graphics tier (Low also draws at 1x and once only).
// The wordmark (logo.js) sits over the sky; the menu is below the scene in portrait and beside it in landscape, never over a face.
// The canvas is #t7cv (the old #tcv and .lineup are gone, so ui.js's title branch draws nothing). Tests read T7 (window.__A.T7).
const T7={key:'',bg:null,fg:null,spr:{},lit:{},heroes:[],faces:[],drawn:[],frames:0,still:false,dpr:1,k:1,W:0,H:0,fire:null,embers:[],last:0,ids:null,prev:null,fadeT:0,next:0,logo:'',hlogo:''};
const T7C={every:24000,fade:900,fps:30};
function t7Low(){try{return typeof GFX!=='undefined'&&GFX.tier==='low';}catch(e){return false;}}
function t7Still(){return t7Low()||(typeof reducedMotion==='function'&&reducedMotion());}
function t7Pool(){let o=[];try{o=titlePool();}catch(e){o=STARTERS.slice();}return o.filter(id=>TPL[id]&&!TPL[id].mon);}
function t7Pick(avoid){const pool=t7Pool().filter(id=>!(avoid||[]).includes(id)),src=pool.length>=6?pool:t7Pool(),ids=[];const p=src.slice();
  while(ids.length<6&&p.length)ids.push(p.splice(Math.floor(Math.random()*p.length),1)[0]);return ids;}
function t7Ids(){if(!T7.ids){let ids=[];try{ids=titleScene().ids.filter(id=>TPL[id]&&!TPL[id].mon);}catch(e){}if(ids.length<6)ids=ids.concat(t7Pick(ids)).slice(0,6);T7.ids=ids;}return T7.ids;}
function t7Rng(s){return ()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
function t7Cv(w,h){const c=document.createElement('canvas');c.width=Math.max(1,Math.round(w));c.height=Math.max(1,Math.round(h));return c;}
// ----- sprites: the HD bitmap (72x92 for a 36x46 hero), lit for the camp -----
function t7Sprite(id){const k=id+(typeof lookKey==='function'?lookKey(id):'');if(T7.spr[k])return T7.spr[k];
  const c=heroCanvas(id),rw=c._rw||c.width,rh=c._rh||c.height;
  const b=t7Cv(rw,rh),x=b.getContext('2d'),DI=CanvasRenderingContext2D.prototype._hdDI||CanvasRenderingContext2D.prototype.drawImage;DI.call(x,c,0,0,rw,rh,0,0,rw,rh);// the real bitmap, unscaled (sprhd.js patches drawImage to logical units)
  const d=x.getImageData(0,0,rw,rh).data;let x0=rw,x1=0,y0=rh,y1=0;for(let y=0;y<rh;y++)for(let i=0;i<rw;i++)if(d[(y*rw+i)*4+3]>40){if(i<x0)x0=i;if(i>x1)x1=i;if(y<y0)y0=y;if(y>y1)y1=y;}
  return T7.spr[k]={id,c:b,rw,rh,lw:c.width,lh:c.height,box:{x0,x1,y0,y1}};}
// lit copy: dir = +1 when the fire is to the right of the hero on screen. Two breathing frames (the upper body one bitmap pixel up).
function t7Lit(s,flip,dir){const key=s.id+':'+s.rw+':'+(flip?1:0)+':'+dir;if(T7.lit[key])return T7.lit[key];
  const {rw,rh}=s,o=t7Cv(rw,rh),x=o.getContext('2d');if(flip){x.translate(rw,0);x.scale(-1,1);}x.drawImage(s.c,0,0);x.setTransform(1,0,0,1,0,0);
  const im=x.getImageData(0,0,rw,rh),d=im.data;
  const alpha=new Uint8Array(rw*rh);for(let i=0;i<rw*rh;i++)alpha[i]=d[i*4+3];
  const a=(i,y)=>i<0||y<0||i>=rw||y>=rh?0:alpha[y*rw+i];
  const rim=x.createImageData(rw,rh),r=rim.data,{y0,y1}=s.box,hh=Math.max(1,y1-y0);
  for(let y=0;y<rh;y++)for(let i=0;i<rw;i++){const p=(y*rw+i)*4;if(alpha[y*rw+i]<40)continue;
    const lf=Math.max(0,Math.min(1,((i/rw-.5)*dir)*1.4+.5)),vf=.55+.45*Math.max(0,Math.min(1,(y-y0)/hh)),w=lf*vf*.62;
    let R=d[p],G=d[p+1],B=d[p+2];const l=(R*.3+G*.59+B*.11);R=R*.9+l*.1;G=G*.9+l*.1;B=B*.9+l*.1;
    d[p]=Math.min(255,R*(.6+w*1.05));d[p+1]=Math.min(255,G*(.58+w*.66));d[p+2]=Math.min(255,B*(.78+w*.3));
    // rim on the edge facing the fire (one or two pixels in), a cool rim where the sky is above
    const e1=a(i+dir,y)<40,e2=!e1&&a(i+dir*2,y)<40,up=a(i,y-1)<40;
    if(e1||e2){const k=e1?1:.45;r[p]=255;r[p+1]=196;r[p+2]=118;r[p+3]=Math.round(235*k*(.55+.45*vf));}
    else if(up){r[p]=168;r[p+1]=186;r[p+2]=255;r[p+3]=110;}}
  x.putImageData(im,0,0);const rc=t7Cv(rw,rh);rc.getContext('2d').putImageData(rim,0,0);
  // breathing frame: rows above the waist one pixel up (drawn from the lit and rim copies, so both frames stay clean)
  const split=Math.round(s.box.y0+(s.box.y1-s.box.y0)*.55),br=c=>{const b=t7Cv(rw,rh),bx=b.getContext('2d');bx.drawImage(c,0,split,rw,rh-split,0,split,rw,rh-split);bx.drawImage(c,0,0,rw,split,0,-1,rw,split);bx.drawImage(c,0,split-1,rw,1,0,split-1,rw,1);return b;};
  const sil=t7Cv(rw,rh),sx=sil.getContext('2d');sx.drawImage(o,0,0);sx.globalCompositeOperation='source-in';sx.fillStyle='#06040c';sx.fillRect(0,0,rw,rh);
  return T7.lit[key]={f:[o,br(o)],rim:[rc,br(rc)],sil};}
// ----- layout: hero scale, slots and the fire for this stage size -----
function t7Layout(W,H,dpr){const ids=t7Ids();let k=Math.max(1,Math.round(H*.22/74));
  const fit=k=>{const slot=44*k,gap=64*k;return Math.max(0,Math.min(6,Math.floor((W*.94-gap)/slot)));};
  while(k>1&&fit(k)<4)k--;if(k>1&&fit(k)<6&&fit(k-1)>fit(k)&&(k-1)*74>=H*.15)k--;let n=fit(k);if(n<2)n=2;
  const fx=W/2,gy=H*.9,slot=44*k,gap=64*k,L=Math.ceil(n/2),R=n-L,hs=[];
  for(let i=0;i<L;i++)hs.push({id:ids[i],side:-1,i,x:fx-gap/2-slot*(i+.5),y:gy-(L-1-i)*5*k});
  for(let i=0;i<R;i++)hs.push({id:ids[L+i],side:1,i,x:fx+gap/2+slot*(i+.5),y:gy-(R-1-i)*5*k});
  hs.forEach((h,j)=>{h.s=t7Sprite(h.id);h.flip=h.side>0;h.dir=-h.side;h.ph=j*1.37;h.L=t7Lit(h.s,h.flip,h.dir);const b=h.s.box,c=(b.x0+b.x1+1)/2;h.cx=h.flip?h.s.rw-c:c;});
  hs.sort((a,b)=>a.y-b.y);
  T7.heroes=hs;T7.k=k;T7.fire={x:fx,y:gy-6*k,s:k};T7.gy=gy;T7.hy=H*.56;}
// ----- the backdrop, baked once per size: sky, stars, moon, hills, the town, the road, the camp and the shadows -----
function t7Bake(W,H,dpr){const low=t7Low(),c=t7Cv(W,H),x=c.getContext('2d'),hy=T7.hy,gy=T7.gy,k=T7.k,rnd=t7Rng(7177);
  const sky=x.createLinearGradient(0,0,0,hy);sky.addColorStop(0,'#0c1030');sky.addColorStop(.38,'#261d4e');sky.addColorStop(.7,'#6b3658');sky.addColorStop(.9,'#c8634a');sky.addColorStop(1,'#f0a25a');
  x.fillStyle=sky;x.fillRect(0,0,W,hy+2);
  for(let i=0;i<90;i++){const sx=rnd()*W,sy=rnd()*hy*.75,a=(1-sy/(hy*.75))*.8*rnd()+.1,z=(rnd()<.12?2:1)*dpr;x.fillStyle=`rgba(255,246,220,${a.toFixed(2)})`;x.fillRect(Math.round(sx),Math.round(sy),z,z);}
  {const mr=Math.max(8,Math.min(W,H)*.035),mx=W*.88,my=Math.min(hy-mr*3,(T7.logoB||0)+mr*2.2);if(my>(T7.logoB||0)+mr*1.2){const g=x.createRadialGradient(mx,my,mr*.5,mx,my,mr*4);g.addColorStop(0,'rgba(255,240,210,.22)');g.addColorStop(1,'rgba(255,240,210,0)');x.fillStyle=g;x.fillRect(mx-mr*4,my-mr*4,mr*8,mr*8);
    x.fillStyle='#f6ecd2';x.beginPath();x.arc(mx,my,mr,0,7);x.fill();x.fillStyle=sky;x.beginPath();x.arc(mx+mr*.42,my-mr*.2,mr*.9,0,7);x.fill();}}
  // far layers on their own canvas, blurred (depth of field)
  const far=t7Cv(W,H),f=far.getContext('2d');
  const ridge=(y0,amp,col,seed,step)=>{const r=t7Rng(seed);f.fillStyle=col;f.beginPath();f.moveTo(0,H);let y=y0;for(let i=0;i<=W+step;i+=step){y=y0-amp*(.5+.5*Math.sin(i/W*6+seed))-r()*amp*.35;f.lineTo(i,y);}f.lineTo(W,H);f.closePath();f.fill();};
  ridge(hy-H*.03,H*.11,'#4a2e5a',3,W/34);
  {const g=f.createLinearGradient(0,hy-H*.14,0,hy);g.addColorStop(0,'rgba(240,150,100,0)');g.addColorStop(1,'rgba(240,150,100,.45)');f.fillStyle=g;f.fillRect(0,hy-H*.14,W,H*.14);}
  ridge(hy+H*.01,H*.05,'#33234a',9,W/22);
  // the town on the far right shoulder: walls, houses, a keep, lit windows
  const tx0=W*.56,tx1=W*.95,ty=hy+H*.005,u=Math.max(2,H/120);f.fillStyle='#24193a';
  f.beginPath();f.moveTo(tx0-u*6,ty+u*4);f.quadraticCurveTo((tx0+tx1)/2,ty-u*3,tx1+u*6,ty+u*4);f.lineTo(tx1+u*6,ty+u*8);f.lineTo(tx0-u*6,ty+u*8);f.fill();
  f.fillRect(tx0,ty-u*3,tx1-tx0,u*5);for(let i=tx0;i<tx1;i+=u*3)f.fillRect(i,ty-u*4.5,u*1.6,u*1.6);
  const tr=t7Rng(41),win=[];
  for(let i=0;i<9;i++){const hx=tx0+u*2+(tx1-tx0-u*8)*(i/8)+tr()*u*2,hw=u*(4+tr()*3),hh=u*(4+tr()*4),by=ty-u*3;f.fillRect(hx,by-hh,hw,hh);f.beginPath();f.moveTo(hx-u*.6,by-hh);f.lineTo(hx+hw/2,by-hh-u*(2.5+tr()*2));f.lineTo(hx+hw+u*.6,by-hh);f.fill();
    if(tr()<.8)win.push([hx+hw*.3,by-hh*.6]);if(tr()<.5)win.push([hx+hw*.65,by-hh*.35]);}
  {const kx=tx0+(tx1-tx0)*.62,kw=u*6,kh=u*16,by=ty-u*3;f.fillRect(kx,by-kh,kw,kh);f.beginPath();f.moveTo(kx-u,by-kh);f.lineTo(kx+kw/2,by-kh-u*8);f.lineTo(kx+kw+u,by-kh);f.fill();f.fillRect(kx+kw/2-u*.15,by-kh-u*11,u*.3,u*3);win.push([kx+kw*.45,by-kh*.7]);
    f.fillStyle='#e0b04a';f.beginPath();f.moveTo(kx+kw/2,by-kh-u*11);f.lineTo(kx+kw/2+u*2.4,by-kh-u*10.2);f.lineTo(kx+kw/2,by-kh-u*9.4);f.fill();}
  f.fillStyle='#ffcf78';win.forEach(([a,b])=>f.fillRect(a,b,u*.9,u*1.1));
  f.globalCompositeOperation='lighter';win.forEach(([a,b])=>{const g=f.createRadialGradient(a,b,0,a,b,u*3.2);g.addColorStop(0,'rgba(255,190,90,.38)');g.addColorStop(1,'rgba(255,190,90,0)');f.fillStyle=g;f.fillRect(a-u*4,b-u*4,u*8,u*8);});f.globalCompositeOperation='source-over';
  // trees framing the far left
  const pine=(px,py,ph,col)=>{f.fillStyle=col;for(let j=0;j<4;j++){const w=ph*(.36-j*.06),yy=py-ph*j*.22;f.beginPath();f.moveTo(px-w,yy);f.lineTo(px,yy-ph*.42);f.lineTo(px+w,yy);f.fill();}f.fillRect(px-ph*.03,py,ph*.06,ph*.08);};
  for(let i=0;i<5;i++)pine(W*(.02+i*.07)+tr()*W*.02,hy+H*.02,H*(.16+tr()*.08),'#1b1532');
  for(let i=0;i<3;i++)pine(W*(.985-i*.05),hy+H*.03,H*(.14+tr()*.06),'#1b1532');
  if(!low&&'filter' in x){x.filter=`blur(${(1.2*dpr).toFixed(1)}px)`;x.drawImage(far,0,0);x.filter='none';}else x.drawImage(far,0,0);
  // the ground: dusk meadow, darker toward the viewer
  {const g=x.createLinearGradient(0,hy,0,H);g.addColorStop(0,'#3a2a44');g.addColorStop(.25,'#252136');g.addColorStop(1,'#12131c');x.fillStyle=g;
    x.beginPath();x.moveTo(0,hy+H*.035);x.quadraticCurveTo(W*.5,hy+H*.005,W,hy+H*.04);x.lineTo(W,H);x.lineTo(0,H);x.closePath();x.fill();}
  // the road from the camp to the town gate
  {const gx=W*.7,gyy=hy+H*.03;x.fillStyle='#4b3a40';x.beginPath();x.moveTo(gx-u*.8,gyy);x.lineTo(gx+u*.8,gyy);x.bezierCurveTo(W*.78,hy+H*.14,W*.52,gy-H*.12,W*.62,H);x.lineTo(W*.3,H);x.bezierCurveTo(W*.36,gy-H*.12,W*.7,hy+H*.12,gx-u*.8,gyy);x.fill();
    const rg=x.createLinearGradient(0,hy,0,H);rg.addColorStop(0,'rgba(240,160,110,.25)');rg.addColorStop(1,'rgba(10,8,16,.35)');x.fillStyle=rg;x.fill();
    const rr=t7Rng(5);x.fillStyle='rgba(20,14,24,.28)';for(let i=0;i<40;i++){const t=rr(),yy=gyy+(H-gyy)*t*t,ww=(u*.6+t*u*2.2);x.fillRect(W*(.66-.2*t)+(rr()-.5)*W*.22*t,yy,ww,ww*.5);}}
  // a tent behind the left of the camp, a log seat, a pack
  {const s=k,bx=W*.5-Math.min(W*.36,s*150),by=gy-s*18,tw=s*54,th=s*36;if(bx>s*10){x.fillStyle='#3d2e3a';x.beginPath();x.moveTo(bx-tw/2,by);x.lineTo(bx,by-th);x.lineTo(bx+tw/2,by);x.fill();
    x.fillStyle='#5e4446';x.beginPath();x.moveTo(bx,by-th);x.lineTo(bx+tw/2,by);x.lineTo(bx+tw*.12,by);x.fill();x.fillStyle='#120c16';x.beginPath();x.moveTo(bx-tw*.05,by);x.lineTo(bx+tw*.02,by-th*.62);x.lineTo(bx+tw*.12,by);x.fill();
    x.strokeStyle='#2a1e26';x.lineWidth=s;x.beginPath();x.moveTo(bx,by-th);x.lineTo(bx,by-th-s*5);x.stroke();}}
  // grass tufts at the front (near depth of field: soft)
  {const gc=t7Cv(W,H),g=gc.getContext('2d'),gr=t7Rng(99);g.fillStyle='#0a0c12';for(let i=0;i<W/(3*dpr);i++){const px=gr()*W,ph=H*(.02+gr()*.05),py=H+2;g.beginPath();g.moveTo(px-ph*.12,py);g.quadraticCurveTo(px+ph*.1,py-ph*.6,px+ph*(gr()-.5)*.8,py-ph);g.quadraticCurveTo(px+ph*.05,py-ph*.5,px+ph*.14,py);g.fill();}
    if(!low&&'filter' in x){x.filter=`blur(${(1.4*dpr).toFixed(1)}px)`;x.drawImage(gc,0,0);x.filter='none';}else x.drawImage(gc,0,0);}
  // camp: the stone ring and logs (the flames are drawn live)
  {const F=T7.fire,s=F.s;x.fillStyle='#2b2228';for(let i=0;i<9;i++){const a=i/9*Math.PI*2,ex=F.x+Math.cos(a)*s*15,ey=F.y+Math.sin(a)*s*4.5;x.beginPath();x.ellipse(ex,ey,s*4,s*2.6,0,0,7);x.fill();}
    x.fillStyle='#7a5a4a';for(let i=0;i<9;i++){const a=i/9*Math.PI*2,ex=F.x+Math.cos(a)*s*15,ey=F.y+Math.sin(a)*s*4.5;x.beginPath();x.ellipse(ex,ey-s*.9,s*3,s*1.2,0,0,7);x.fill();}
    x.save();x.translate(F.x,F.y-s*2);x.rotate(.35);x.fillStyle='#3a2418';x.fillRect(-s*12,-s*2,s*24,s*4);x.fillStyle='#6a4028';x.fillRect(-s*12,-s*2,s*24,s*1.2);x.rotate(-.7);x.fillStyle='#3a2418';x.fillRect(-s*12,-s*2,s*24,s*4);x.fillStyle='#7a4a2c';x.fillRect(-s*12,-s*2,s*24,s*1.2);x.restore();}
  // shadows: contact ellipses and the long cast shadows away from the fire
  T7.heroes.forEach(h=>{const kk=T7.k,{rw,rh,box}=h.s,cx=h.x,fy=h.y;
    x.save();x.globalAlpha=.42;if(!low&&'filter' in x)x.filter=`blur(${(1.5*kk).toFixed(1)}px)`;
    const sk=-h.dir*1.1;x.setTransform(1,0,sk,-.32,cx,fy);x.drawImage(h.L.sil,-h.cx*kk,-(box.y1+1)*kk,rw*kk,rh*kk);x.restore();
    const g=x.createRadialGradient(cx,fy,0,cx,fy,kk*16);g.addColorStop(0,'rgba(4,2,8,.7)');g.addColorStop(1,'rgba(4,2,8,0)');x.fillStyle=g;x.save();x.translate(cx,fy);x.scale(1,.3);x.beginPath();x.arc(0,0,kk*16,0,7);x.fill();x.restore();});
  T7.bg=c;
  // grade on top: vignette, a darker sky band for the wordmark, a fade into the page at the bottom
  const o=t7Cv(W,H),q=o.getContext('2d');const v=q.createRadialGradient(W/2,H*.62,Math.min(W,H)*.25,W/2,H*.55,Math.max(W,H)*.78);v.addColorStop(0,'rgba(8,6,18,0)');v.addColorStop(1,'rgba(8,6,18,.62)');q.fillStyle=v;q.fillRect(0,0,W,H);
  const tb=q.createLinearGradient(0,0,0,H*.4);tb.addColorStop(0,'rgba(6,6,20,.5)');tb.addColorStop(1,'rgba(6,6,20,0)');q.fillStyle=tb;q.fillRect(0,0,W,H*.4);
  const bt=q.createLinearGradient(0,H*.9,0,H);bt.addColorStop(0,'rgba(11,12,24,0)');bt.addColorStop(1,'rgba(11,12,24,.55)');q.fillStyle=bt;q.fillRect(0,H*.9,W,H*.1);
  T7.fg=o;}
// ----- live parts: fire light, heroes, flames, embers -----
function t7Flick(t){return .82+.1*Math.sin(t*.011)+.06*Math.sin(t*.027+1.3)+.04*Math.sin(t*.051+.4);}
function t7Frame(now,force){const cv=document.getElementById('t7cv');if(!cv)return;const st=cv.parentElement;if(!st)return;
  const still=t7Still(),low=t7Low(),dpr=low?1:Math.min(3,Math.max(1,window.devicePixelRatio||1)),cw=st.clientWidth,ch=st.clientHeight;if(!cw||!ch)return;
  t7Ids();const W=Math.round(cw*dpr),H=Math.round(ch*dpr),key=W+'x'+H+':'+low+':'+(T7.ids||[]).join(',');
  let dirty=!!force;if(key!==T7.key||cv.width!==W||cv.height!==H){cv.width=W;cv.height=H;T7.key=key;T7.W=W;T7.H=H;T7.dpr=dpr;try{const lg=st.querySelector('.t7logo');T7.logoB=lg?(lg.getBoundingClientRect().bottom-st.getBoundingClientRect().top+14)*dpr:0;}catch(e){T7.logoB=0;}const b0=performance.now();t7Layout(W,H,dpr);t7Bake(W,H,dpr);T7.bakeMs=Math.round(performance.now()-b0);T7.bakes=(T7.bakes||0)+1;dirty=true;}
  if(T7.still!==still){T7.still=still;dirty=true;}
  if(still&&!dirty)return;if(!still&&!dirty&&now-T7.last<1000/T7C.fps)return;
  // a new lineup now and then (cross fade); not while still
  if(!still){if(!T7.next)T7.next=now+T7C.every;if(now>=T7.next&&!document.hidden){T7.prev={heroes:T7.heroes};T7.ids=t7Pick(T7.ids);T7.fadeT=now;T7.next=now+T7C.every;T7.key='';return t7Frame(now,true);}}
  T7.last=now;const x=cv.getContext('2d'),t=still?0:now,k=T7.k,F=T7.fire,fl=still?.9:t7Flick(t);
  x.setTransform(1,0,0,1,0,0);x.globalCompositeOperation='source-over';x.globalAlpha=1;x.drawImage(T7.bg,0,0);
  // twinkle: a few stars brighten (not baked)
  if(!still){const r=t7Rng(3);x.fillStyle='#fff6dc';for(let i=0;i<14;i++){const sx=r()*W,sy=r()*T7.hy*.6,a=Math.max(0,Math.sin(t*.0017+i*2.1));if(a>.6){x.globalAlpha=(a-.6)*2;x.fillRect(Math.round(sx),Math.round(sy),dpr*1.5,dpr*1.5);}}x.globalAlpha=1;}
  // fire light on the ground
  x.globalCompositeOperation='lighter';{const R=k*(95+8*fl);const g=x.createRadialGradient(F.x,F.y,0,F.x,F.y,R);g.addColorStop(0,`rgba(255,150,60,${(.42*fl).toFixed(3)})`);g.addColorStop(.45,`rgba(230,100,40,${(.16*fl).toFixed(3)})`);g.addColorStop(1,'rgba(200,80,30,0)');
    x.fillStyle=g;x.save();x.translate(F.x,F.y);x.scale(1,.42);x.beginPath();x.arc(0,0,R,0,7);x.fill();x.restore();}
  x.globalCompositeOperation='source-over';
  // heroes (and the outgoing lineup while it fades)
  const fadeK=T7.prev&&!still?Math.min(1,(now-T7.fadeT)/T7C.fade):1;if(fadeK>=1)T7.prev=null;
  const drawSet=(hs,alpha,rec)=>{x.imageSmoothingEnabled=false;hs.forEach(h=>{const {rw,rh,box}=h.s,br=still?0:(Math.sin(t*.0042+h.ph)>.35?1:0),dw=rw*k,dh=rh*k,dx=Math.round(h.x-h.cx*k),dy=Math.round(h.y-(box.y1+1)*k);
      x.globalAlpha=alpha;x.drawImage(h.L.f[br],dx,dy,dw,dh);x.globalAlpha=alpha*Math.min(1,fl*1.05);x.drawImage(h.L.rim[br],dx,dy,dw,dh);
      if(rec){const fx0=h.flip?rw-1-box.x1:box.x0,fx1=h.flip?rw-1-box.x0:box.x1;rec.push({id:h.id,rw,rh,lw:h.s.lw,lh:h.s.lh,k,x:dx,y:dy,w:dw,h:dh,face:{x:dx+fx0*k,y:dy+box.y0*k,w:(fx1-fx0+1)*k,h:Math.round((box.y1-box.y0)*.42*k)}});}});x.globalAlpha=1;};
  if(T7.prev)drawSet(T7.prev.heroes,1-fadeK,null);const rec=[];drawSet(T7.heroes,T7.prev?fadeK:1,rec);T7.drawn=rec;
  // flames
  {const s=F.s,bx=F.x,by=F.y-s*3;const tongue=(ox,hgt,wid,col,ph)=>{const sw=still?0:Math.sin(t*.013+ph)*s*1.6,hh=hgt*(still?1:(.86+.18*Math.sin(t*.021+ph*2)));x.fillStyle=col;x.beginPath();x.moveTo(bx+ox-wid,by);
      x.bezierCurveTo(bx+ox-wid,by-hh*.45,bx+ox+sw-wid*.3,by-hh*.7,bx+ox+sw,by-hh);x.bezierCurveTo(bx+ox+sw+wid*.3,by-hh*.7,bx+ox+wid,by-hh*.45,bx+ox+wid,by);x.closePath();x.fill();};
    tongue(0,s*30,s*9,'rgba(255,90,30,.9)',0);tongue(-s*4,s*20,s*5,'rgba(255,110,40,.85)',2.1);tongue(s*4.5,s*22,s*5,'rgba(255,100,35,.85)',4.2);
    tongue(0,s*21,s*6,'rgba(255,180,60,.95)',1.1);tongue(0,s*12,s*3.6,'rgba(255,244,190,.95)',3.3);}
  // bloom: a soft halo over the camp
  x.globalCompositeOperation='lighter';{const R=k*(60+10*fl),cy=F.y-k*14;const g=x.createRadialGradient(F.x,cy,0,F.x,cy,R);g.addColorStop(0,`rgba(255,170,80,${(.34*fl).toFixed(3)})`);g.addColorStop(1,'rgba(255,120,50,0)');x.fillStyle=g;x.fillRect(F.x-R,cy-R,R*2,R*2);}
  // embers: square sparks rising and drifting (pixel sized, in device pixels so they stay crisp)
  if(!still){const E=T7.embers,dt=Math.min(.1,(now-(T7.et||now))/1000);T7.et=now;T7.espawn=(T7.espawn||0)+dt*9;while(T7.espawn>=1&&E.length<22){T7.espawn--;E.push({x:F.x+(Math.random()-.5)*k*12,y:F.y-k*(8+Math.random()*10),vy:-(14+Math.random()*26)*k,vx:(Math.random()-.5)*k*8,ph:Math.random()*6,life:0,max:1.4+Math.random()*2});}
    for(let i=E.length-1;i>=0;i--){const e=E[i];e.life+=dt;e.y+=e.vy*dt;e.x+=(e.vx+Math.sin(e.life*2.6+e.ph)*k*10)*dt;if(e.life>e.max){E.splice(i,1);continue;}const a=1-e.life/e.max;x.fillStyle=`rgba(255,${Math.round(150+80*a)},80,${(a*.9).toFixed(2)})`;const z=Math.max(1,Math.round(k*(a>.5?1:.75)));x.fillRect(Math.round(e.x),Math.round(e.y),z,z);}}
  x.globalCompositeOperation='source-over';x.drawImage(T7.fg,0,0);T7.frames++;T7.frameMs=Math.round((performance.now()-now)*10)/10;
  // face boxes in page pixels (tests and the layout check)
  try{const b=cv.getBoundingClientRect(),sc=b.width/W;T7.faces=rec.map(r=>({id:r.id,left:b.left+r.face.x*sc,top:b.top+r.face.y*sc,right:b.left+(r.face.x+r.face.w)*sc,bottom:b.top+(r.face.y+r.face.h)*sc}));}catch(e){}}
// ----- the screen: restructure the title section built by ui.js (and renamed by p5settings.js) -----
function t7Size(){const st=document.querySelector('.t7stage');if(!st)return;const sec=st.closest('.t7');const vw=window.innerWidth,vh=window.visualViewport?window.visualViewport.height:window.innerHeight;
  const wide=vw>=700&&vw/vh>1.12;sec.classList.toggle('t7wide',wide);
  const top=st.getBoundingClientRect().top+(window.scrollY||0),w=st.clientWidth;let h;
  if(wide)h=Math.max(260,Math.min(vh-top-14,w*.95));else h=Math.max(250,Math.min(vh*.44,w*1.05,520));
  h=Math.round(h);if(Math.abs(st.offsetHeight-h)>1)st.style.height=h+'px';}
{const b0=buildScreen;buildScreen=function(){const r=b0.apply(this,arguments);try{if(V.screen==='title')t7Build();}catch(e){console.warn('title7',e);}return r;};}
function t7Build(){const sec=document.querySelector('#screen section.title');if(!sec||sec.classList.contains('t7'))return;sec.classList.add('t7');
  ['.tstage','.pre','.logo','.sub'].forEach(s=>{const e=sec.querySelector(':scope > '+s);if(e)e.remove();});
  if(!T7.logo)T7.logo=WF_LOGO.wordmark({glow:1,rule:1});
  const top=document.createElement('div');top.className='t7top';
  top.innerHTML=`<div class="t7stage"><canvas id="t7cv" aria-hidden="true"></canvas><h1 class="logo t7logo"><span class="sr">Wayfarers</span>${T7.logo}<span class="t7beta">Beta</span></h1></div><div class="t7side"></div>`;
  const side=top.querySelector('.t7side'),menu=sec.querySelector(':scope > .tmenu');
  sec.insertBefore(top,sec.firstChild);
  if(menu){let n=menu;const mv=[];while(n&&!(n.classList&&(n.classList.contains('legacy')||n.classList.contains('pitch')))){mv.push(n);n=n.nextElementSibling;}mv.forEach(e=>side.appendChild(e));}
  const ver=sec.querySelector(':scope > .ver');if(ver)side.appendChild(ver);
  T7.key='';T7.embers=[];t7Size();requestAnimationFrame(()=>{t7Size();t7Frame(performance.now(),true);});}
{const lp0=loop;loop=function(){try{if(V.screen==='title')t7Frame(performance.now());}catch(e){if(!T7.err){T7.err=1;console.warn('title7 frame',e);}}return lp0.apply(this,arguments);};}
window.addEventListener('resize',()=>{try{if(V.screen==='title'){t7Size();t7Frame(performance.now(),true);}}catch(e){}});
// the header wordmark (small)
{const h0=vHeader;vHeader=function(){let h=String(h0.apply(this,arguments));if(!T7.hlogo)T7.hlogo=WF_LOGO.wordmark({shadow:false,outline:8,idp:'h'});
  return h.replace(/<div class="brand"><b>(?:Wayfarers|Aurelis)<\/b>/,`<div class="brand"><b class="wfm" role="img" aria-label="Wayfarers">${T7.hlogo}</b>`);};}
try{const st=document.createElement('style');st.id='t7-css';st.textContent=`
.title.t7{gap:12px}.t7top{display:grid;gap:12px;align-items:center}
.t7stage{position:relative;width:100%;height:340px;overflow:hidden;border:1px solid #6f5730;border-radius:6px;background:#140f24;
  box-shadow:inset 0 0 0 1px #000,0 0 0 1px #000,0 0 0 4px rgba(217,180,106,.16),0 16px 40px rgba(0,0,0,.6);line-height:0}
.t7stage canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.t7logo{position:absolute;left:50%;top:5%;transform:translateX(-50%);width:min(90%,560px);margin:0;line-height:0;pointer-events:none;text-shadow:none;letter-spacing:0;font-size:0}
.t7logo svg{display:block;width:100%;height:auto;filter:drop-shadow(0 0 16px rgba(255,190,90,.22))}
.t7beta{position:absolute;left:50%;bottom:-2px;transform:translate(-50%,100%);font:700 11px/1 var(--fb);letter-spacing:.42em;padding-left:.42em;color:#e9d29a;text-transform:uppercase;text-shadow:0 1px 2px #000;white-space:nowrap}
.t7 .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.t7side{display:grid;gap:8px;justify-items:center;min-width:0}.t7side .tmenu{margin-top:0}.t7side .ver{margin:2px 0 0}
.t7.t7wide .t7top{grid-template-columns:minmax(0,1fr) minmax(260px,340px)}
.t7.t7wide .t7logo{width:min(84%,520px)}
.brand b.wfm{display:block;height:24px;line-height:0;font-size:0;font-family:var(--fb);text-shadow:none}.brand b.wfm svg{height:100%;width:auto;display:block}
@media (max-width:480px){.brand b.wfm{height:17px}}`;document.head.appendChild(st);}catch(e){}
