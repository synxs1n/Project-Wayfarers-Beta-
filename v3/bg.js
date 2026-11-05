// =================== BATTLE BACKDROPS ===================
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
const BG={
 meadow(ctx,W,H,R){
  gradBands(ctx,0,0,W,H,['#5aa8e8','#7cc0f0','#a8d8f6','#d8eefa']);
  pxCircle(ctx,Math.floor(W*.78),18,13,'#fff6c8');pxCircle(ctx,Math.floor(W*.78),18,10,'#fffbe8');
  fillRidge(ctx,ridgeLine(R,W,Math.floor(H*.42),10,12),'#8ab0d0',H,'#c8dcf0');
  const snow=ridgeLine(R,W,Math.floor(H*.40),12,10);
  fillRidge(ctx,ridgeLine(R,W,Math.floor(H*.48),8,7),'#6a9a7a',H,'#8ab89a');
  const hills=ridgeLine(R,W,Math.floor(H*.53),6,6);fillRidge(ctx,hills,'#4a8a4a',H,'#6aa860');
  for(let i=0;i<Math.floor(W/9);i++){const x=Math.floor(R()*W),y=hills[Math.min(W-1,x)]-2;pxCircle(ctx,x,y,3+Math.floor(R()*2),'#2f6a2e');ctx.fillStyle='#4a8a3a';ctx.fillRect(x-1,y-2,2,1);}
  groundPlane(ctx,W,H,Math.floor(H*.58),['#6ab858','#5aa048','#4c8f3e','#3f7f32'],R,'#3a7a30');
  for(let i=0;i<W/3;i++){const x=Math.floor(R()*W),y=Math.floor(H*.6+R()*H*.4);ctx.fillStyle=R()<.5?'#86c860':'#2f6a2e';ctx.fillRect(x,y,1,2);}
  for(let i=0;i<W/12;i++){const x=Math.floor(R()*W),y=Math.floor(H*.62+R()*H*.35);ctx.fillStyle=pick(['#f06a8a','#f6e06a','#ffffff']);ctx.fillRect(x,y,2,2);}
 },
 coast(ctx,W,H,R){
  gradBands(ctx,0,0,W,Math.floor(H*.5),['#5a3a7a','#b85a7a','#f08a6a','#f8c88a']);
  pxCircle(ctx,Math.floor(W*.5),Math.floor(H*.47),16,'#ffd88a');pxCircle(ctx,Math.floor(W*.5),Math.floor(H*.47),12,'#fff0c0');
  ctx.fillStyle='#8a4a6a';ctx.fillRect(Math.floor(W*.12),Math.floor(H*.44),30,4);ctx.fillRect(Math.floor(W*.16),Math.floor(H*.42),16,2);
  gradBands(ctx,0,Math.floor(H*.5),W,Math.floor(H*.22),['#3a5a9a','#2f6aa8','#2a7ab8']);
  groundPlane(ctx,W,H,Math.floor(H*.72),['#f0dcaa','#e2cf98','#cfb880','#b8a070'],R,'#c0a878');
  for(let i=0;i<W/14;i++){const x=Math.floor(R()*W),y=Math.floor(H*.75+R()*H*.25);ctx.fillStyle=pick(['#f6e8d8','#f0a8a0']);ctx.fillRect(x,y,2,1);}
  [[4,1],[W-26,-1]].forEach(([px,dir])=>{ctx.fillStyle='#4a2a3a';for(let i=0;i<34;i++)ctx.fillRect(px+10+Math.round(Math.sin(i/9)*3*dir),Math.floor(H*.78)-i,3,1);
    ctx.fillStyle='#2a3a2a';[[-14,4],[14,3],[-10,-4],[10,-5]].forEach(([dx,dy])=>{for(let k=0;k<14;k++)ctx.fillRect(px+11+Math.round(dx*k/14),Math.floor(H*.78)-34+Math.round(dy*k/14)+Math.floor(k*k/40),3,1);});});
 },
 cave(ctx,W,H,R){
  gradBands(ctx,0,0,W,H,['#140c0e','#24161a','#3a2020','#4a2418']);
  for(let i=0;i<W/10;i++){const x=Math.floor(R()*W),l=6+Math.floor(R()*22);ctx.fillStyle='#1a1214';for(let k=0;k<l;k++){const w=Math.max(1,Math.floor((l-k)/4));ctx.fillRect(x-Math.floor(w/2),k,w,1);}}
  fillRidge(ctx,ridgeLine(R,W,Math.floor(H*.45),12,8),'#2e2024',H,'#4a3034');
  for(let i=0;i<6;i++){let x=Math.floor(R()*W),y=Math.floor(H*.45+R()*10);ctx.fillStyle='#ff7a2a';for(let k=0;k<14;k++){ctx.fillRect(x,y,1,1);x+=R()<.5?1:-1;y+=1;}}
  gradBands(ctx,0,Math.floor(H*.58),W,6,['#ff8a2a','#e8551a']);
  groundPlane(ctx,W,H,Math.floor(H*.62),['#3a2c2c','#4a3a38','#3a2e2e','#2a2020'],R,'#2a1c1c');
  for(let i=0;i<8;i++){let x=Math.floor(R()*W),y=Math.floor(H*.66+R()*H*.3);ctx.fillStyle='#c8501a';for(let k=0;k<6;k++){ctx.fillRect(x,y,2,1);x+=1;y+=R()<.5?1:0;}}
 },
 snow(ctx,W,H,R){
  gradBands(ctx,0,0,W,H,['#1a2a5a','#3a5a9a','#8aaed8','#d8e8f6']);
  for(let i=0;i<30;i++){ctx.fillStyle='#ffffff';ctx.fillRect(Math.floor(R()*W),Math.floor(R()*H*.25),1,1);}
  const m1=ridgeLine(R,W,Math.floor(H*.38),16,14);fillRidge(ctx,m1,'#8aa0c8',H);
  m1.forEach((y,x)=>{ctx.fillStyle='#f4faff';ctx.fillRect(x,y,1,4);});
  fillRidge(ctx,ridgeLine(R,W,Math.floor(H*.5),10,8),'#6a84b0',H,'#c8dcf0');
  const tl=ridgeLine(R,W,Math.floor(H*.56),3,6);
  for(let x=0;x<W;x+=5+Math.floor(R()*4)){const y=tl[x];ctx.fillStyle='#2a4a4a';for(let k=0;k<12;k++){const w=Math.floor(k/2.5);ctx.fillRect(x-w,y-12+k,w*2+1,1);}ctx.fillStyle='#f4faff';ctx.fillRect(x,y-12,1,2);ctx.fillRect(x-2,y-7,5,1);}
  groundPlane(ctx,W,H,Math.floor(H*.6),['#f4faff','#e4eef6','#ccdcea','#b8cce0'],R,'#c8d8e8');
 },
 heights(ctx,W,H,R){
  gradBands(ctx,0,0,W,H,['#1e2238','#2e3456','#4a5478','#7a86a8']);
  for(let i=0;i<5;i++)cloudBlob(ctx,Math.floor(R()*W),8+Math.floor(R()*30),30+Math.floor(R()*20),'#3a4060','#262a44');
  for(let i=0;i<3;i++){const x=Math.floor(R()*(W-40))+10,y=Math.floor(H*.3+R()*H*.15),w=18+Math.floor(R()*16);ctx.fillStyle='#5a7a4a';ctx.fillRect(x,y,w,3);ctx.fillStyle='#4a4a5a';for(let k=0;k<10;k++)ctx.fillRect(x+Math.floor(k/2),y+3+k,w-k,1);ctx.fillStyle='#8ab0d8';ctx.fillRect(x+Math.floor(w/2),y+3,1,16);}
  gradBands(ctx,0,Math.floor(H*.55),W,Math.floor(H*.1),['#9aa6c8','#c4d0e4']);
  groundPlane(ctx,W,H,Math.floor(H*.62),['#7a9a5a','#68884c','#56743e','#4a6436'],R,'#4a6a3a');
  for(let i=0;i<W/6;i++){ctx.fillStyle='#a0c070';ctx.fillRect(Math.floor(R()*W),Math.floor(H*.64+R()*H*.36),1,2);}
 },
 void(ctx,W,H,R){
  gradBands(ctx,0,0,W,H,['#05030c','#0e0820','#1a1034','#2a1a4a']);
  for(let i=0;i<4;i++){const x=Math.floor(R()*W),y=Math.floor(R()*H*.5);for(let k=0;k<60;k++){ctx.fillStyle=k%3?'rgba(120,60,180,.25)':'rgba(80,140,200,.2)';ctx.fillRect(x+Math.floor((R()-.5)*50),y+Math.floor((R()-.5)*16),2,2);}}
  const cx=Math.floor(W*.7),cy=Math.floor(H*.25);pxCircle(ctx,cx,cy,20,'#f6e7a8');pxCircle(ctx,cx,cy,18,'#000000');pxCircle(ctx,cx,cy,16,'#0a0614');
  ctx.fillStyle='#8b5fd0';for(let a=0;a<64;a++){const ang=a/64*Math.PI*2;ctx.fillRect(cx+Math.round(Math.cos(ang)*22),cy+Math.round(Math.sin(ang)*22),1,1);}
  fillRidge(ctx,ridgeLine(R,W,Math.floor(H*.55),10,6),'#1a1230',H,'#3a2a5a');
  for(let i=0;i<6;i++){const x=Math.floor(R()*W),h=10+Math.floor(R()*20),y=Math.floor(H*.6);ctx.fillStyle='#5a3a9a';for(let k=0;k<h;k++){const w=Math.max(1,Math.floor((h-k)/5));ctx.fillRect(x-w,y-k,w*2,1);}ctx.fillStyle='#b080ff';ctx.fillRect(x,y-h+2,1,h-4);}
  groundPlane(ctx,W,H,Math.floor(H*.62),['#2c2440','#221c34','#1a1428','#120e1e'],R,'#3a2a5a');
  for(let i=0;i<10;i++){let x=Math.floor(R()*W),y=Math.floor(H*.66+R()*H*.3);ctx.fillStyle='#8b5fd0';for(let k=0;k<5;k++){ctx.fillRect(x,y,2,1);x+=2;y+=R()<.5?1:0;}}
 }
};
const BG_CACHE={};
function bgStatic(theme,W,H,seed){
  const key=theme+W+'x'+H;if(BG_CACHE[key])return BG_CACHE[key];
  const cv=mkCv(W,H),ctx=cv.getContext('2d');BG[theme](ctx,W,H,mulberry(seed||theme.length*97));
  return BG_CACHE[key]=cv;
}
function bgAnim(ctx,theme,W,H,now){
  const t=now/1000;
  if(theme==='meadow'){[[0,14,34],[1,30,26],[2,8,22]].forEach(([i,y,w])=>{const x=Math.floor(((t*(4+i*2)+i*120)%(W+80))-40);cloudBlob(ctx,x,y,w,'#ffffff','#d8e8f4');});
    for(let i=0;i<3;i++){const x=Math.floor((i*97+t*14)%W),y=Math.floor(H*.65+Math.sin(t*3+i)*6+i*10);ctx.fillStyle=['#f6e06a','#ffffff','#f08ab0'][i];ctx.fillRect(x,y,2,1);if(Math.floor(t*8+i)%2)ctx.fillRect(x-1,y-1,1,1),ctx.fillRect(x+2,y-1,1,1);}}
  if(theme==='coast'){for(let i=0;i<12;i++){const y=Math.floor(H*.52)+i*3,o=Math.floor((t*8+i*13)%W);ctx.fillStyle=i<4?'#ffe0a8':'#8ac8f0';ctx.fillRect(o,y,6+i%4,1);ctx.fillRect((o+W/2)%W,y,4,1);}
    const wx=Math.floor((Math.sin(t*.8)+1)*3);ctx.fillStyle='#ffffff';ctx.fillRect(0,Math.floor(H*.72)-1-wx%2,W,1);
    for(let i=0;i<2;i++){const x=Math.floor((t*10+i*150)%(W+20))-10,y=20+i*12+Math.floor(Math.sin(t*2+i)*2);ctx.fillStyle='#2a1a2a';ctx.fillRect(x,y,2,1);ctx.fillRect(x+3,y,2,1);ctx.fillRect(x+2,y+1,1,1);}}
  if(theme==='cave'){const f=Math.floor(t*6)%2;ctx.fillStyle=f?'#ffb04a':'#ff8a2a';ctx.fillRect(0,Math.floor(H*.58)+2,W,1);
    for(let i=0;i<16;i++){const x=Math.floor((i*61+Math.sin(t+i)*6)%W),y=Math.floor(H-((t*12+i*23)%(H*.7)));ctx.fillStyle=i%3?'#ff8a2a':'#ffe08a';ctx.fillRect(x,y,1,1);}}
  if(theme==='snow'){for(let i=0;i<4;i++){ctx.fillStyle=['rgba(90,255,170,.18)','rgba(120,200,255,.16)','rgba(180,120,255,.12)','rgba(90,255,200,.12)'][i];for(let x=0;x<W;x+=2){const y=10+i*5+Math.floor(Math.sin(x/18+t*.8+i)*5);ctx.fillRect(x,y,2,8);}}
    ctx.fillStyle='#ffffff';for(let i=0;i<50;i++){const x=Math.floor((i*37+t*(6+i%5)+Math.sin(t+i)*4)%W),y=Math.floor((i*53+t*(14+i%7))%H);ctx.fillRect(x,y,1,1);}}
  if(theme==='heights'){ctx.fillStyle='rgba(180,200,230,.35)';for(let i=0;i<40;i++){const x=Math.floor((i*41-t*60)%W+W)%W,y=Math.floor((i*29+t*160)%H);ctx.fillRect(x,y,1,3);}
    const cyc=t%5;if(cyc<.12||(cyc>.2&&cyc<.28)){ctx.fillStyle='rgba(255,255,240,.55)';ctx.fillRect(0,0,W,H);let x=Math.floor(W*.3+((Math.floor(t/5)*97)%Math.floor(W*.5))),y=0;ctx.fillStyle='#fff6c8';while(y<H*.5){ctx.fillRect(x,y,2,4);x+=Math.floor(Math.sin(y*7+t)*3);y+=4;}}
    for(let i=0;i<5;i++){const x=Math.floor((i*70+t*20)%(W+40))-20,y=Math.floor(H*.6+i*8);ctx.fillStyle='rgba(255,255,255,.5)';ctx.fillRect(x,y,12,1);}}
  if(theme==='void'){for(let i=0;i<40;i++){const x=(i*73)%W,y=(i*41)%Math.floor(H*.55);ctx.fillStyle=Math.floor(t*2+i)%4===0?'#ffffff':'#6a5a9a';ctx.fillRect(x,y,1,1);}
    for(let i=0;i<6;i++){const x=Math.floor((i*53+t*5)%W),y=Math.floor(H*.3+Math.sin(t+i)*10+i*6);ctx.fillStyle='#b080ff';ctx.fillRect(x,y,1,3);ctx.fillRect(x-1,y+1,3,1);}}
}
