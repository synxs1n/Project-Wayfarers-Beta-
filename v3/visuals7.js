// =================== v0.7.7: lingering old visuals (visuals7.js) ===================
// The worst offenders of the v0.7.7 review (docs/v077-weather.md), brought to the HD-2D look. Visual only: no game state, no save field.
//  1. The victory crest: the blackletter "Victory" (Jacquard 24) is now set like the Wayfarers wordmark (logo.js): heavy capitals in the
//     Nunito UI face, a gold bevel with a dark outline, a soft glow and compass stars either side. No blackletter is left on screen.
//  2. The minimap: each tile was one flat 4 x 4 block cut from a 2 px colour map, with a hard stair step edge where the explored area
//     ends. Tiles are now shaded like the map they show (lit top edges and shadowed feet on walls, trees and buildings, a drop shadow on
//     the ground below them, grain on grass and floors, glints on water), the explored edge fades out, and the frame gets a soft vignette.
//     Same canvas, same scale (4 px a tile, 112 x 84), so taps and markers line up exactly as before.
//  3. The arena backdrop: flat bands with confetti dots for a crowd. Now a sunlit colosseum: sky with soft clouds, a sweeping two tier
//     arcade with lit piers and shadowed arches, a crowd of heads and shoulders in rows that fall into shade, striped awnings, hanging
//     banners with folds and gold trim, and a podium wall in stone blocks with a cast shadow on the sand. Drawn once (bgStatic cache)
//     from its own seeded generator, so no game RNG is touched.
(function(){const st=document.createElement('style');st.textContent=`
html:root{--flogo:'Nunito',system-ui,-apple-system,'Segoe UI',sans-serif}
html body .panel.result>.mclose+h2,html body .panel.result>.mnav+h2{font:900 2.05rem/1.05 var(--fb);letter-spacing:.2em;text-transform:uppercase;color:#ffe9b0;
  text-shadow:0 -1px 0 #fff6d8,0 1px 0 #c98f34,0 2px 0 #7a4c16,0 3px 0 #2a1606,0 4px 6px rgba(0,0,0,.6),0 0 22px rgba(255,196,96,.42);padding-left:64px;padding-right:64px}
html body .panel.result>.mclose+h2::before,html body .panel.result>.mnav+h2::before,html body .panel.result>.mclose+h2::after,html body .panel.result>.mnav+h2::after{content:"✦";display:inline-block;font-size:.55em;vertical-align:.32em;color:#f6d27a;letter-spacing:0;margin:0 .55em;text-shadow:0 0 8px rgba(255,210,120,.8),0 1px 0 #5a3410}
`;document.head.appendChild(st);})();
// ----- 2. minimap -----
const MM7={cv:null,key:'',gen:0,t:0,img:null};
{const mb0=mapBase;mapBase=function(m){const was=!!(MAPCV.dirty||MAPCV.id!==m.id||!MAPCV.cv);const r=mb0.apply(this,arguments);if(was)MM7.gen++;return r;};}
function mm7Base(m){const base=mapBase(m),key=m.id+':'+MM7.gen,now=performance.now();
  if(MM7.key===key&&MM7.cv)return MM7.cv;if(MM7.cv&&MM7.key.split(':')[0]===m.id&&now-MM7.t<300)return MM7.cv;// at most ~3 rebuilds a second while exploring
  const T=4,W=m.w*T,H=m.h*T;let c=MM7.cv;if(!c||c.width!==W||c.height!==H)c=MM7.cv=mkCv(W,H);const x=c.getContext('2d');
  const src=base.getContext('2d').getImageData(0,0,m.w*2,m.h*2).data,img=x.createImageData(W,H),d=img.data,MW=m.w*2;
  const col=(i,y)=>{const o=((y*2)*MW+i*2)*4;return src[o+3]?o:-1;};
  const solid=(i,y)=>{const r=m.t[y];const ch=r&&r[i];return !!ch&&ch!=='~'&&SOLID.indexOf(ch)>=0;},water=(i,y)=>{const r=m.t[y];return !!r&&r[i]==='~';};
  for(let y=0;y<m.h;y++)for(let i=0;i<m.w;i++){const o=col(i,y);if(o<0)continue;const R0=src[o],G0=src[o+1],B0=src[o+2],sd=solid(i,y),wt=water(i,y),h=wfxH(i*7+y*131,903);
    const up=y>0&&col(i,y-1)>=0,dn=y<m.h-1&&col(i,y+1)>=0,lf=i>0&&col(i-1,y)>=0,rt=i<m.w-1&&col(i+1,y)>=0,sAbove=y>0&&solid(i,y-1)&&!sd;
    for(let py=0;py<T;py++)for(let px=0;px<T;px++){let k=1,a=255;
      if(sd){if(py===0&&!(y>0&&solid(i,y-1)))k=1.3;else if(py>=T-1&&!(y<m.h-1&&solid(i,y+1)))k=.62;else if(px===0)k=1.08;else if(px===T-1)k=.86;}
      else if(wt){k=((px+py*2+i+y)%7===0)?1.28:1-(py/T)*.06;}
      else{k=1+((px*3+py*5+((h*16)|0))%9===0?.09:0)-((px+py+((h*8)|0))%11===0?.07:0);if(sAbove&&py===0)k*=.72;else if(sAbove&&py===1)k*=.86;}
      // the explored edge fades out instead of a hard stair step
      if(!up&&py===0||!dn&&py===T-1||!lf&&px===0||!rt&&px===T-1)a=150;
      const q=((y*T+py)*W+i*T+px)*4;d[q]=Math.min(255,R0*k);d[q+1]=Math.min(255,G0*k);d[q+2]=Math.min(255,B0*k);d[q+3]=a;}}
  x.putImageData(img,0,0);MM7.key=key;MM7.t=now;return c;}
function mm7Vig(W,H){return MM7.vig&&MM7.vig.width===W?MM7.vig:(MM7.vig=(()=>{const v=mkCv(W,H),g=v.getContext('2d'),r=g.createRadialGradient(W/2,H/2,Math.min(W,H)*.32,W/2,H/2,Math.max(W,H)*.62);r.addColorStop(0,'rgba(6,4,14,0)');r.addColorStop(1,'rgba(6,4,14,.62)');g.fillStyle=r;g.fillRect(0,0,W,H);return v;})());}
drawMini=function(){const cv=document.getElementById('mmap');if(!cv)return;const m=WS.m;if(!m||!G||!miniOn()){cv.style.display='none';return;}cv.style.display='block';
  const W=cv.width,H=cv.height,x=cv.getContext('2d'),sc=4;x.imageSmoothingEnabled=false;
  {const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#141026');g.addColorStop(1,'#0a0712');x.fillStyle=g;x.fillRect(0,0,W,H);}
  const ox=Math.round(W/2-(WS.x+.5)*sc),oy=Math.round(H/2-(WS.y+.5)*sc);let b=null;try{b=mm7Base(m);}catch(e){b=null;}
  if(b)x.drawImage(b,ox,oy);else x.drawImage(mapBase(m),ox,oy,m.w*sc,m.h*sc);
  x.drawImage(mm7Vig(W,H),0,0);
  const vis=mapMarks(m).filter(o=>!MK_DONE[o.k]&&Math.abs(o.x-WS.x)<W/sc&&Math.abs(o.y-WS.y)<H/sc);drawMarks(x,m,vis,sc,ox,oy);
  {const g=x.createRadialGradient(W/2,H/2,0,W/2,H/2,9);g.addColorStop(0,'rgba(255,236,170,.5)');g.addColorStop(1,'rgba(255,236,170,0)');x.fillStyle=g;x.fillRect(W/2-9,H/2-9,18,18);}
  drawPlayer(x,sc,W/2,H/2);};
// ----- 3. the arena backdrop -----
BG.arena=function(ctx,W,H,R){const gy=bgGY(H),S=(c,a)=>{const h=hx(c);return `rgba(${h[0]},${h[1]},${h[2]},${a})`;};
  // sky with soft clouds
  {const g=ctx.createLinearGradient(0,0,0,gy);g.addColorStop(0,'#3e66b0');g.addColorStop(.55,'#7fa4d8');g.addColorStop(1,'#d8c8a8');ctx.fillStyle=g;ctx.fillRect(0,0,W,gy);}
  for(let i=0;i<5;i++){const cx=R()*W,cy=H*(.04+R()*.08),r=10+R()*16;for(let k=0;k<5;k++){const g=ctx.createRadialGradient(cx+k*r*.6,cy+(R()-.5)*4,0,cx+k*r*.6,cy,r);g.addColorStop(0,'rgba(255,255,255,.5)');g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ctx.fillRect(cx+k*r*.6-r,cy-r,r*2,r*2);}}
  // the arcade: a curve that rises toward the sides (the bowl seen from the floor)
  const top=y=>H*.1+Math.pow(Math.abs(y/W-.5)*2,2)*H*.04,wallB=gy-Math.floor(H*.07);
  const T0=x=>top(x),T1=x=>T0(x)+H*.09,T2=x=>T1(x)+H*.1,T3=x=>wallB;
  // stone body of the stands, shaded from the lit centre
  for(let x=0;x<W;x+=2){const t=T0(x),e=Math.abs(x/W-.5)*2;const g=ctx.createLinearGradient(0,t,0,wallB);g.addColorStop(0,`rgb(${196-e*40|0},${168-e*36|0},${130-e*30|0})`);g.addColorStop(1,`rgb(${132-e*30|0},${104-e*26|0},${80-e*22|0})`);ctx.fillStyle=g;ctx.fillRect(x,t,2,wallB-t);}
  // striped awnings along the top
  for(let x=0;x<W;x+=12){const t=T0(x);ctx.fillStyle=(x/12|0)%2?'#c8453a':'#f0e2c0';ctx.beginPath();ctx.moveTo(x,t-6);ctx.lineTo(x+12,T0(x+12)-6);ctx.lineTo(x+12,T0(x+12)-1);ctx.quadraticCurveTo(x+6,t+3,x,t-1);ctx.fill();}
  ctx.fillStyle='rgba(0,0,0,.18)';for(let x=0;x<W;x+=2)ctx.fillRect(x,T0(x)-1,2,3);
  // crowd rows in the two tiers: heads and shoulders in varied cloth, darker toward the back of each tier
  const cloth=['#c84a4a','#4a7ac8','#e0b050','#5aa060','#a060c0','#e08a50','#e8e0d0','#507080'],skin=['#f0c8a0','#d8a070','#a87048','#7a4a2a'];
  for(const [ya,yb] of [[T0,T1],[T1,T2]]){for(let row=0;row<4;row++)for(let x=-2;x<W;x+=4){const y0=ya(x)+3,y1=yb(x)-4,y=y0+(y1-y0)*(row/4)+R()*1.2,sh=.62+row*.12;if(R()<.08)continue;
      const c=hx(cloth[Math.floor(R()*cloth.length)]),s=hx(skin[Math.floor(R()*skin.length)]),bob=R()<.15?-1:0;
      ctx.fillStyle=`rgb(${c[0]*sh|0},${c[1]*sh|0},${c[2]*sh|0})`;ctx.fillRect(x+R()*1.5,y+3+bob,4,3);ctx.fillStyle=`rgb(${s[0]*sh|0},${s[1]*sh|0},${s[2]*sh|0})`;ctx.fillRect(x+1+R()*1.5,y+bob,2,3);}
    // a balustrade under each tier
    for(let x=0;x<W;x+=1){const y=yb(x)-2;ctx.fillStyle=x%5===0?'#7a5e44':'#b89a76';ctx.fillRect(x,y,1,3);}ctx.fillStyle='rgba(255,240,210,.35)';for(let x=0;x<W;x+=2)ctx.fillRect(x,yb(x)-3,2,1);}
  // the lower arcade: piers and dark arches
  for(let x=4;x<W;x+=22){const t=T2(x)+2,b=wallB-1,w=12;ctx.fillStyle='#3a2a22';ctx.beginPath();ctx.moveTo(x,b);ctx.lineTo(x,t+6);ctx.quadraticCurveTo(x+w/2,t-2,x+w,t+6);ctx.lineTo(x+w,b);ctx.fill();
    const g=ctx.createLinearGradient(0,t,0,b);g.addColorStop(0,'rgba(0,0,0,.35)');g.addColorStop(1,'rgba(40,24,16,0)');ctx.fillStyle=g;ctx.fillRect(x,t,w,b-t);
    ctx.fillStyle='rgba(255,236,200,.28)';ctx.fillRect(x+w+1,t,2,b-t);ctx.fillStyle='rgba(0,0,0,.2)';ctx.fillRect(x-2,t,2,b-t);}
  // banners hanging from the top tier, with folds and gold trim
  for(let x=10;x<W;x+=44){const t=T0(x)+1,h=Math.floor(H*.13),w=9;const g=ctx.createLinearGradient(x,0,x+w,0);g.addColorStop(0,'#8a1e22');g.addColorStop(.4,'#d03a34');g.addColorStop(.7,'#a82a2a');g.addColorStop(1,'#701818');
    ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(x,t);ctx.lineTo(x+w,t);ctx.lineTo(x+w,t+h);ctx.lineTo(x+w/2,t+h-4);ctx.lineTo(x,t+h);ctx.fill();
    ctx.fillStyle='#f0c050';ctx.fillRect(x,t,w,2);ctx.fillRect(x+w/2-1.5,t+h*.35,3,3);ctx.fillStyle='rgba(255,230,150,.5)';ctx.fillRect(x+1,t+h*.35+1,1,1);}
  // the podium wall in stone blocks with a lit coping and its shadow on the sand
  const ph=Math.floor(H*.07);{const g=ctx.createLinearGradient(0,wallB,0,gy);g.addColorStop(0,'#a8927a');g.addColorStop(1,'#6e5a48');ctx.fillStyle=g;ctx.fillRect(0,wallB,W,ph);}
  ctx.fillStyle='rgba(40,26,18,.4)';for(let r=0;r<3;r++){const y=wallB+Math.round(ph*(r+1)/3)-1;ctx.fillRect(0,y,W,1);for(let x=(r%2)*7;x<W;x+=14)ctx.fillRect(x,wallB+Math.round(ph*r/3),1,Math.round(ph/3));}
  ctx.fillStyle='#e8d6b4';ctx.fillRect(0,wallB-1,W,2);ctx.fillStyle='rgba(255,255,255,.25)';ctx.fillRect(0,wallB-1,W,1);
  groundPlane(ctx,W,H,gy,['#e0c890','#d0b47a','#c0a068','#a88a58'],R,'#b89a68');
  {const g=ctx.createLinearGradient(0,gy,0,gy+H*.06);g.addColorStop(0,'rgba(60,40,20,.35)');g.addColorStop(1,'rgba(60,40,20,0)');ctx.fillStyle=g;ctx.fillRect(0,gy,W,H*.06);}
  for(let i=0;i<40;i++){const x=R()*W,y=gy+4+R()*(H-gy-6);ctx.fillStyle=R()<.5?'rgba(255,240,200,.35)':'rgba(120,90,50,.3)';ctx.fillRect(x,y,2+R()*3,1);}};
