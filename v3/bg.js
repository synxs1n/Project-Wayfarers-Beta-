// ===== bg.js (base): battle backdrops (2D, per theme) =====
const BAYER=[[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]];
function gradBands(ctx,x0,y0,w,h,stops){
  // stops: array of colors top->bottom; dithered pixel gradient
  const n=stops.length-1;
  for(let y=0;y<h;y++){
    const t=y/(h-1||1)*n,i=Math.min(n-1,Math.floor(t)),f=t-i;
    for(let x=0;x<w;x++){const th=(BAYER[y%4][x%4]+.5)/16;ctx.fillStyle=f>th?stops[i+1]:stops[i];ctx.fillRect(x0+x,y0+y,1,1);}
  }
}
function ridgeLine(R,W,base,amp,step){
  const pts=[];let y=base;
  for(let x=0;x<=W+step;x+=step){y+=(R()-.5)*amp;y=clamp(y,base-amp*1.8,base+amp*1.4);pts.push(y);}
  const out=[];for(let x=0;x<W;x++){const i=Math.floor(x/step),f=(x%step)/step;out.push(Math.round(pts[i]+(pts[i+1]-pts[i])*f));}
  return out;
}
function fillRidge(ctx,hs,col,H,hi){hs.forEach((y,x)=>{ctx.fillStyle=col;ctx.fillRect(x,y,1,H-y);if(hi){ctx.fillStyle=hi;ctx.fillRect(x,y,1,1);}});}
function pxCircle(ctx,cx,cy,r,col){ctx.fillStyle=col;for(let y=-r;y<=r;y++){const w=Math.floor(Math.sqrt(r*r-y*y));ctx.fillRect(cx-w,cy+y,w*2+1,1);}}
function cloudBlob(ctx,x,y,w,col,sh){pxCircle(ctx,x,y,Math.floor(w/5),col);pxCircle(ctx,x+Math.floor(w/3),y-2,Math.floor(w/4),col);pxCircle(ctx,x+Math.floor(w*.62),y,Math.floor(w/5),col);ctx.fillStyle=col;ctx.fillRect(x-Math.floor(w/5),y,Math.floor(w*1.05),Math.floor(w/5)+1);if(sh){ctx.fillStyle=sh;ctx.fillRect(x-Math.floor(w/5),y+Math.floor(w/5),Math.floor(w*1.05),1);}}
function groundPlane(ctx,W,H,gy,cols,R,lineCol){
  gradBands(ctx,0,gy,W,H-gy,cols);
  let y=gy+2,s=2;while(y<H){ctx.fillStyle=lineCol;for(let x=0;x<W;x+=1){if(R()<.35)ctx.fillRect(x,y,1,1);}y+=s;s=Math.ceil(s*1.45);}
}
// v0.5.0 2.1: every backdrop has one solid ground plane from bgGY(H) down (BATTLE_GROUND.gy in config.js). Units only ever stand on it.
// Water, lava, cloud seas and sky are drawn above that line as far scenery. BG_HAZ lists their colours so tests can prove the ground is clean.
const BG_HAZ={water:['#3a5a9a','#2f6aa8','#2a7ab8','#8ac8f0'],lava:['#ff8a2a','#e8551a','#ff7a2a','#ffb04a'],cloud:['#9aa6c8','#c4d0e4']};
const pkR=(R,a)=>a[Math.floor(R()*a.length)]; // backdrops draw from their own seeded R, never from the battle RNG
const bgGY=H=>Math.floor(H*((typeof BATTLE_GROUND!=='undefined'&&BATTLE_GROUND.gy)||.5));
const BG={
 meadow(ctx,W,H,R){const gy=bgGY(H);
  gradBands(ctx,0,0,W,gy,['#5aa8e8','#7cc0f0','#a8d8f6','#d8eefa']);
  pxCircle(ctx,Math.floor(W*.78),16,12,'#fff6c8');pxCircle(ctx,Math.floor(W*.78),16,9,'#fffbe8');
  fillRidge(ctx,ridgeLine(R,W,gy-Math.floor(H*.15),9,12),'#8ab0d0',gy,'#c8dcf0');
  fillRidge(ctx,ridgeLine(R,W,gy-Math.floor(H*.09),7,7),'#6a9a7a',gy,'#8ab89a');
  const hills=ridgeLine(R,W,gy-Math.floor(H*.04),4,6);fillRidge(ctx,hills,'#4a8a4a',gy,'#6aa860');
  for(let i=0;i<Math.floor(W/9);i++){const x=Math.floor(R()*W),y=Math.min(gy-2,hills[Math.min(W-1,x)]-1);pxCircle(ctx,x,y,2+Math.floor(R()*2),'#2f6a2e');ctx.fillStyle='#4a8a3a';ctx.fillRect(x-1,y-2,2,1);}
  groundPlane(ctx,W,H,gy,['#6ab858','#5aa048','#4c8f3e','#3f7f32'],R,'#3a7a30');
  for(let i=0;i<W/3;i++){const x=Math.floor(R()*W),y=Math.floor(gy+2+R()*(H-gy-3));ctx.fillStyle=R()<.5?'#86c860':'#2f6a2e';ctx.fillRect(x,y,1,2);}
  for(let i=0;i<W/12;i++){const x=Math.floor(R()*W),y=Math.floor(gy+4+R()*(H-gy-6));ctx.fillStyle=pkR(R,['#f06a8a','#f6e06a','#ffffff']);ctx.fillRect(x,y,2,2);}
 },
 coast(ctx,W,H,R){const gy=bgGY(H),sea=gy-Math.floor(H*.14);
  gradBands(ctx,0,0,W,sea,['#5a3a7a','#b85a7a','#f08a6a','#f8c88a']);
  pxCircle(ctx,Math.floor(W*.5),sea-3,14,'#ffd88a');pxCircle(ctx,Math.floor(W*.5),sea-3,10,'#fff0c0');
  ctx.fillStyle='#8a4a6a';ctx.fillRect(Math.floor(W*.12),sea-8,30,4);ctx.fillRect(Math.floor(W*.16),sea-10,16,2);
  // the sea is far scenery: a band between the horizon and the beach
  gradBands(ctx,0,sea,W,gy-sea,BG_HAZ.water.slice(0,3));
  groundPlane(ctx,W,H,gy,['#f0dcaa','#e2cf98','#cfb880','#b8a070'],R,'#c0a878');
  ctx.fillStyle='#d8c08a';ctx.fillRect(0,gy,W,2);
  for(let i=0;i<W/14;i++){const x=Math.floor(R()*W),y=Math.floor(gy+4+R()*(H-gy-5));ctx.fillStyle=pkR(R,['#f6e8d8','#f0a8a0']);ctx.fillRect(x,y,2,1);}
  const foot=gy+Math.floor((H-gy)*.35);
  [[2,1],[W-24,-1]].forEach(([px,dir])=>{ctx.fillStyle='#4a2a3a';for(let i=0;i<34;i++)ctx.fillRect(px+10+Math.round(Math.sin(i/9)*3*dir),foot-i,3,1);
    ctx.fillStyle='#2a3a2a';[[-14,4],[14,3],[-10,-4],[10,-5]].forEach(([dx,dy])=>{for(let k=0;k<14;k++)ctx.fillRect(px+11+Math.round(dx*k/14),foot-34+Math.round(dy*k/14)+Math.floor(k*k/40),3,1);});});
 },
 cave(ctx,W,H,R){const gy=bgGY(H);
  gradBands(ctx,0,0,W,gy,['#140c0e','#24161a','#3a2020','#4a2418']);
  for(let i=0;i<W/10;i++){const x=Math.floor(R()*W),l=6+Math.floor(R()*18);ctx.fillStyle='#1a1214';for(let k=0;k<l;k++){const w=Math.max(1,Math.floor((l-k)/4));ctx.fillRect(x-Math.floor(w/2),k,w,1);}}
  // a far lava river glows in a chasm behind the rock shelf
  const lv=gy-Math.floor(H*.1);gradBands(ctx,0,lv,W,4,[BG_HAZ.lava[0],BG_HAZ.lava[1]]);
  fillRidge(ctx,ridgeLine(R,W,gy-Math.floor(H*.05),5,8),'#2e2024',gy,'#4a3034');
  for(let i=0;i<5;i++){let x=Math.floor(R()*W),y=Math.floor(H*.12+R()*H*.1);ctx.fillStyle='#ff7a2a';for(let k=0;k<10&&y<lv-2;k++){ctx.fillRect(x,y,1,1);x+=R()<.5?1:-1;y+=1;}}
  groundPlane(ctx,W,H,gy,['#3a2c2c','#4a3a38','#3a2e2e','#2a2020'],R,'#2a1c1c');
  for(let i=0;i<W/8;i++){const x=Math.floor(R()*W),y=Math.floor(gy+3+R()*(H-gy-4));ctx.fillStyle=pkR(R,['#5a4844','#241818','#6a5650']);ctx.fillRect(x,y,2,1);}
 },
 snow(ctx,W,H,R){const gy=bgGY(H);
  gradBands(ctx,0,0,W,gy,['#1a2a5a','#3a5a9a','#8aaed8','#d8e8f6']);
  for(let i=0;i<30;i++){ctx.fillStyle='#ffffff';ctx.fillRect(Math.floor(R()*W),Math.floor(R()*H*.2),1,1);}
  const m1=ridgeLine(R,W,gy-Math.floor(H*.2),12,14);fillRidge(ctx,m1,'#8aa0c8',gy);
  m1.forEach((y,x)=>{ctx.fillStyle='#f4faff';ctx.fillRect(x,y,1,4);});
  fillRidge(ctx,ridgeLine(R,W,gy-Math.floor(H*.09),7,8),'#6a84b0',gy,'#c8dcf0');
  const tl=ridgeLine(R,W,gy-2,2,6);
  for(let x=0;x<W;x+=5+Math.floor(R()*4)){const y=Math.min(gy,tl[x]);ctx.fillStyle='#2a4a4a';for(let k=0;k<12;k++){const w=Math.floor(k/2.5);ctx.fillRect(x-w,y-12+k,w*2+1,1);}ctx.fillStyle='#f4faff';ctx.fillRect(x,y-12,1,2);ctx.fillRect(x-2,y-7,5,1);}
  groundPlane(ctx,W,H,gy,['#f4faff','#e4eef6','#ccdcea','#b8cce0'],R,'#c8d8e8');
 },
 heights(ctx,W,H,R){const gy=bgGY(H);
  gradBands(ctx,0,0,W,gy,['#1e2238','#2e3456','#4a5478','#7a86a8']);
  for(let i=0;i<5;i++)cloudBlob(ctx,Math.floor(R()*W),8+Math.floor(R()*24),30+Math.floor(R()*20),'#3a4060','#262a44');
  // a sea of cloud far below the plateau, with floating isles above it
  const cs=gy-Math.floor(H*.1);gradBands(ctx,0,cs,W,gy-cs,BG_HAZ.cloud);
  for(let i=0;i<3;i++){const x=Math.floor(R()*(W-40))+10,y=Math.floor(H*.18+R()*H*.12),w=18+Math.floor(R()*16);ctx.fillStyle='#5a7a4a';ctx.fillRect(x,y,w,3);ctx.fillStyle='#4a4a5a';for(let k=0;k<10;k++)ctx.fillRect(x+Math.floor(k/2),y+3+k,w-k,1);ctx.fillStyle='#8ab0d8';ctx.fillRect(x+Math.floor(w/2),y+3,1,Math.max(0,Math.min(16,cs-y-4)));}
  groundPlane(ctx,W,H,gy,['#7a9a5a','#68884c','#56743e','#4a6436'],R,'#4a6a3a');
  ctx.fillStyle='#4a5a3a';ctx.fillRect(0,gy,W,1);
  for(let i=0;i<W/6;i++){ctx.fillStyle='#a0c070';ctx.fillRect(Math.floor(R()*W),Math.floor(gy+2+R()*(H-gy-3)),1,2);}
 },
 void(ctx,W,H,R){const gy=bgGY(H);
  gradBands(ctx,0,0,W,gy,['#05030c','#0e0820','#1a1034','#2a1a4a']);
  for(let i=0;i<4;i++){const x=Math.floor(R()*W),y=Math.floor(R()*gy*.7);for(let k=0;k<60;k++){ctx.fillStyle=k%3?'rgba(120,60,180,.25)':'rgba(80,140,200,.2)';ctx.fillRect(x+Math.floor((R()-.5)*50),y+Math.floor((R()-.5)*16),2,2);}}
  const cx=Math.floor(W*.7),cy=Math.floor(H*.2);pxCircle(ctx,cx,cy,18,'#f6e7a8');pxCircle(ctx,cx,cy,16,'#000000');pxCircle(ctx,cx,cy,14,'#0a0614');
  ctx.fillStyle='#8b5fd0';for(let a=0;a<64;a++){const ang=a/64*Math.PI*2;ctx.fillRect(cx+Math.round(Math.cos(ang)*20),cy+Math.round(Math.sin(ang)*20),1,1);}
  fillRidge(ctx,ridgeLine(R,W,gy-Math.floor(H*.06),6,6),'#1a1230',gy,'#3a2a5a');
  for(let i=0;i<6;i++){const x=Math.floor(R()*W),h=10+Math.floor(R()*18),y=gy;ctx.fillStyle='#5a3a9a';for(let k=0;k<h;k++){const w=Math.max(1,Math.floor((h-k)/5));ctx.fillRect(x-w,y-k,w*2,1);}ctx.fillStyle='#b080ff';ctx.fillRect(x,y-h+2,1,h-4);}
  groundPlane(ctx,W,H,gy,['#2c2440','#221c34','#1a1428','#120e1e'],R,'#3a2a5a');
  for(let i=0;i<10;i++){let x=Math.floor(R()*W),y=Math.floor(gy+4+R()*(H-gy-6));ctx.fillStyle='#8b5fd0';for(let k=0;k<5;k++){ctx.fillRect(x,y,2,1);x+=2;y+=R()<.5?1:0;}}
 }
};
const BG_CACHE={};
function bgStatic(theme,W,H,seed){
  const key=theme+W+'x'+H;if(BG_CACHE[key])return BG_CACHE[key];
  const cv=mkCv(W,H),ctx=cv.getContext('2d');BG[theme](ctx,W,H,mulberry(seed||theme.length*97));
  return BG_CACHE[key]=cv;
}
function bgAnim(ctx,theme,W,H,now){
  const t=now/1000,gy=bgGY(H);if(theme.startsWith('f:'))theme=theme.split(':')[1]; // v0.5.0 2.1: field backdrops animate like their realm's sky
  if(theme==='meadow'){[[0,14,34],[1,30,26],[2,8,22]].forEach(([i,y,w])=>{const x=Math.floor(((t*(4+i*2)+i*120)%(W+80))-40);cloudBlob(ctx,x,y,w,'#ffffff','#d8e8f4');});
    for(let i=0;i<3;i++){const x=Math.floor((i*97+t*14)%W),y=Math.floor(H*.6+Math.sin(t*3+i)*6+i*10);ctx.fillStyle=['#f6e06a','#ffffff','#f08ab0'][i];ctx.fillRect(x,y,2,1);if(Math.floor(t*8+i)%2)ctx.fillRect(x-1,y-1,1,1),ctx.fillRect(x+2,y-1,1,1);}}
  if(theme==='coast'){const sea=gy-Math.floor(H*.14),n=Math.max(1,Math.floor((gy-sea-2)/2));for(let i=0;i<n;i++){const y=sea+1+i*2,o=Math.floor((t*8+i*13)%W);ctx.fillStyle=i<2?'#ffe0a8':'#8ac8f0';ctx.fillRect(o,y,6+i%4,1);ctx.fillRect((o+W/2)%W,y,4,1);}
    const wx=Math.floor((Math.sin(t*.8)+1)*3);ctx.fillStyle='#ffffff';ctx.fillRect(0,gy-1-wx%2,W,1);
    for(let i=0;i<2;i++){const x=Math.floor((t*10+i*150)%(W+20))-10,y=20+i*12+Math.floor(Math.sin(t*2+i)*2);ctx.fillStyle='#2a1a2a';ctx.fillRect(x,y,2,1);ctx.fillRect(x+3,y,2,1);ctx.fillRect(x+2,y+1,1,1);}}
  if(theme==='cave'){const f=Math.floor(t*6)%2;ctx.fillStyle=f?'#ffb04a':'#ff8a2a';ctx.fillRect(0,gy-Math.floor(H*.1)+1,W,1);
    for(let i=0;i<16;i++){const x=Math.floor((i*61+Math.sin(t+i)*6)%W),y=Math.floor(H-((t*12+i*23)%(H*.7)));ctx.fillStyle=i%3?'#ff8a2a':'#ffe08a';ctx.fillRect(x,y,1,1);}}
  if(theme==='snow'){for(let i=0;i<4;i++){ctx.fillStyle=['rgba(90,255,170,.18)','rgba(120,200,255,.16)','rgba(180,120,255,.12)','rgba(90,255,200,.12)'][i];for(let x=0;x<W;x+=2){const y=10+i*5+Math.floor(Math.sin(x/18+t*.8+i)*5);ctx.fillRect(x,y,2,8);}}
    ctx.fillStyle='#ffffff';for(let i=0;i<50;i++){const x=Math.floor((i*37+t*(6+i%5)+Math.sin(t+i)*4)%W),y=Math.floor((i*53+t*(14+i%7))%H);ctx.fillRect(x,y,1,1);}}
  if(theme==='heights'){ctx.fillStyle='rgba(180,200,230,.35)';for(let i=0;i<40;i++){const x=Math.floor((i*41-t*60)%W+W)%W,y=Math.floor((i*29+t*160)%H);ctx.fillRect(x,y,1,3);}
    const cyc=t%5;if(cyc<.12||(cyc>.2&&cyc<.28)){ctx.fillStyle='rgba(255,255,240,.55)';ctx.fillRect(0,0,W,H);let x=Math.floor(W*.3+((Math.floor(t/5)*97)%Math.floor(W*.5))),y=0;ctx.fillStyle='#fff6c8';while(y<H*.5){ctx.fillRect(x,y,2,4);x+=Math.floor(Math.sin(y*7+t)*3);y+=4;}}
    for(let i=0;i<5;i++){const x=Math.floor((i*70+t*20)%(W+40))-20,y=Math.floor(H*.6+i*8);ctx.fillStyle='rgba(255,255,255,.5)';ctx.fillRect(x,y,12,1);}}
  if(theme==='void'){for(let i=0;i<40;i++){const x=(i*73)%W,y=(i*41)%Math.floor(H*.55);ctx.fillStyle=Math.floor(t*2+i)%4===0?'#ffffff':'#6a5a9a';ctx.fillRect(x,y,1,1);}
    for(let i=0;i<6;i++){const x=Math.floor((i*53+t*5)%W),y=Math.floor(H*.3+Math.sin(t+i)*10+i*6);ctx.fillStyle='#b080ff';ctx.fillRect(x,y,1,3);ctx.fillRect(x-1,y+1,3,1);}}
}
