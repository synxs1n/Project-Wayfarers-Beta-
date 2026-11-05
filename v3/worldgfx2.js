// =================== DUNGEON TILES ===================
const DTHEME={
 meadow:{f:['#6e5e48','#5e4e3a','#86745a','#46382a'],w:['#62503e','#4c3e30','#86705a','#241a12'],top:'#1a120c',acc:'#6aa04a',acc2:'#a8d070',name:'barrow'},
 coast:{f:['#4e6e6c','#40605e','#628482','#2e4a4a'],w:['#3e6064','#2e4c50','#5e9090','#122024'],top:'#0c181a',acc:'#5ad0c0',acc2:'#f0a0b0',name:'grotto'},
 cave:{f:['#4e3e3a','#42322e','#604c46','#2e2220'],w:['#503a36','#3e2a28','#745650','#180e0c'],top:'#100806',acc:'#ff7a2a',acc2:'#ffd04a',name:'forge'},
 snow:{f:['#a4bcd4','#94acc4','#bcd2e6','#7890a8'],w:['#7aa0c8','#6890b8','#b0d8f6','#26365a'],top:'#141e34',acc:'#dff8ff',acc2:'#8fdcf0',name:'ice'},
 heights:{f:['#8c8a9c','#7c7a8c','#a6a4b6','#5c5a6c'],w:['#7e7c94','#6a6880','#a4a2bc','#201e2c'],top:'#14121c',acc:'#f2c93a',acc2:'#8ad0ff',name:'spire'},
 void:{f:['#30284a','#282042','#3e345c','#1a1430'],w:['#3c305e','#30264e','#5e4e90','#0a0616'],top:'#05030c',acc:'#b080ff',acc2:'#5fc9a0',name:'sanctum'}
};
function drawDTile(ctx,m,x,y,frame){
  const D=DTH(m),c=tileAt(m,x,y),px=x*TS,py=y*TS,R=mulberry(x*5113+y*2671+m.s*7);
  const f=(col,a,b,w,h)=>{ctx.fillStyle=col;ctx.fillRect(px+a,py+b,w,h);};
  const isW=(dx,dy)=>tileAt(m,x+dx,y+dy)==='#';
  if(c==='#'){
    if(!isW(0,1)){
      // wall face
      const W=D.w;f(W[0],0,0,16,16);
      for(let r=0;r<16;r+=4){const off=(r/4+x)%2?0:4;for(let i=-off;i<16;i+=8){const col=R()<.25?W[2]:R()<.5?W[0]:shade(W[0],.92);f(col,Math.max(0,i),r,Math.min(7,16-Math.max(0,i)),3);f(tint(col,.18),Math.max(0,i),r,Math.min(7,16-Math.max(0,i)),1);}f(W[1],0,r+3,16,1);}
      f(D.top,0,0,16,2);f(W[2],0,2,16,1);f(W[3],0,15,16,1);
      if(m.theme==='meadow'&&R()<.5){const rx=2+Math.floor(R()*10);f('#4a3a22',rx,3,1,6);f('#4a3a22',rx+1,8,1,4);f(D.acc,rx-1,3,3,1);}
      if(m.theme==='coast'&&R()<.5)f(D.acc,Math.floor(R()*12),12,4,2);
      if(m.theme==='cave'&&R()<.4){const cx=2+Math.floor(R()*10);f('#ff5a1a',cx,6,1,4);f('#ffb04a',cx,7,1,1);}
      if(m.theme==='snow'){for(let i=0;i<16;i+=3)f('#eefaff',i,2,2,1+((i*7+x)%4));}
      if(m.theme==='void'&&R()<.5)f(D.acc,Math.floor(R()*14),4+Math.floor(R()*8),2,2);
      if(m.theme==='heights'&&R()<.3){f(D.acc,6,5,4,1);f(D.acc,7,4,2,3);}
      // torch sconces
      if((x*3+y*5)%7===0&&tileAt(m,x,y+1)!=='#'){f('#3a2a1a',7,6,2,6);f('#5a4a3a',6,10,4,2);m.lights=m.lights||[];m.lights.push([px+8,py+5,34,'torch']);m.torches=m.torches||[];m.torches.push([px+8,py+5]);}
    }else{
      f(D.top,0,0,16,16);
      if(R()<.4)f(shade(D.w[3],1.3),Math.floor(R()*13),Math.floor(R()*13),2,1);
      // rim where the wall meets open floor diagonally/laterally
      if(!isW(-1,0))f(D.w[1],0,0,2,16);if(!isW(1,0))f(D.w[1],14,0,2,16);if(!isW(0,-1))f(D.w[1],0,0,16,2);
    }
    return;
  }
  // floor
  const F=D.f;f(F[0],0,0,16,16);
  for(let j=0;j<2;j++)for(let i=0;i<2;i++){const ox=i*8+(j%2?(y%2?4:0):(y%2?0:4))%8,col=R()<.3?F[2]:R()<.5?F[0]:F[1];f(col,(i*8),(j*8),7,7);f(tint(col,.12),i*8,j*8,7,1);}
  f(F[3],7,0,1,16);f(F[3],15,0,1,16);f(F[3],0,7,16,1);f(F[3],0,15,16,1);
  if(R()<.25){const cx=Math.floor(R()*12)+2,cy=Math.floor(R()*12)+2;f(F[3],cx,cy,3,1);f(F[3],cx+2,cy+1,1,2);}
  if(m.theme==='meadow'&&R()<.25)f(D.acc,Math.floor(R()*14),Math.floor(R()*14),2,1);
  if(m.theme==='coast'&&R()<.12){f('#5a9ab0',3,6,8,4);f('#8ad0e0',4,6,3,1);}
  if(m.theme==='cave'&&R()<.12){f('#2a1410',2,9,10,1);f('#ff6a1a',3,9,7,1);}
  if(m.theme==='snow'&&R()<.2)f('#ffffff',Math.floor(R()*14),Math.floor(R()*14),2,1);
  if(m.theme==='void'&&R()<.3)f(R()<.5?D.acc:D.acc2,Math.floor(R()*15),Math.floor(R()*15),1,1);
  if(isW(0,-1)){ctx.fillStyle='rgba(6,2,12,.38)';ctx.fillRect(px,py,16,4);}
  if(isW(-1,0)){ctx.fillStyle='rgba(6,2,12,.2)';ctx.fillRect(px,py,2,16);}
  if(c==='E'){f('#2a1a10',0,0,16,16);for(let i=0;i<5;i++){const yy=12-i*3;f('#c8b8a0',1+i,yy,14-i*2,2);f('#8a7a68',1+i,yy+2,14-i*2,1);}f('#fff0b0',5,0,6,3);f('#ffe08a',1,0,1,16);f('#ffe08a',14,0,1,16);m.lights=m.lights||[];m.lights.push([px+8,py+2,46,'day']);}
  if(c==='X'||(tileAt(m,x,y)==='.'&&m.bossAt&&x===m.bossAt[0]&&y===m.bossAt[1])){
    // rune circle under the guardian
    ctx.strokeStyle=D.acc;ctx.globalAlpha=.7;for(let a=0;a<24;a++){const t=a/24*Math.PI*2;f(D.acc,8+Math.round(Math.cos(t)*7)-0,8+Math.round(Math.sin(t)*5),1,1);}ctx.globalAlpha=1;
  }
  if(c==='r'){for(let i=0;i<5;i++){f(D.w[Math.floor(R()*3)],Math.floor(R()*13),Math.floor(R()*13),2+Math.floor(R()*2),2);}}
}
// =================== EXTRA OBJECTS ===================
const OBJ2={};
function obj2(theme,kind,v){
  const key=theme+':'+kind+':'+(v||0);if(OBJ2[key])return OBJ2[key];
  const T=THEME[theme],D=DTHEME[theme];let g,pal,opt={};const P=(w,h)=>new PG(w+2,h+2,1,1);
  if(kind==='board'){g=P(20,22);g.rect(2,8,2,14,'W');g.rect(16,8,2,14,'W');g.rect(0,1,20,13,'L');g.rect(0,1,20,2,'D');g.rect(2,4,5,6,'p');g.rect(8,5,5,5,'q');g.rect(14,4,4,7,'p');g.px([[4,4],[10,5],[16,4]],'R');g.rect(3,6,3,1,'K');g.rect(9,7,3,1,'K');g.rect(15,6,2,1,'K');g.rect(15,8,2,1,'K');
    pal={W:'#6a4424',L:'#a8743a',D:'#7a4a24',p:'#f4ecd4',q:'#e8d8a8',R:'#d8403a',K:'#5a4a3a'};opt.flat='Kpq';}
  else if(kind==='boat'){g=P(26,14);g.poly([[0,6],[26,6],[22,13],[4,13]],'W');g.rect(1,6,24,1,'L');g.rect(12,-8,1,14,'K');g.poly([[13,-8],[22,2],[13,3]],'S');g.rect(4,9,18,1,'D');
    pal={W:['#8a5a2a','#6a4a2a','#9a6a3a'][v%3],L:'#c8a070',K:'#4a3020',S:['#f4ecdc','#e8c0a0','#c8d8f0'][v%3],D:'#5a3a1a'};}
  else if(kind==='gate'){g=P(16,30);g.rect(0,2,16,28,'S');g.rect(2,6,12,24,'K');for(let i=3;i<14;i+=3)g.rect(i,6,1,24,'M');for(let j=9;j<30;j+=5)g.rect(2,j,12,1,'M');g.ell(8,15,4.5,4.5,'C');g.ell(8,15,2.5,2.5,'Y');g.px([[8,9],[8,21],[2,15],[14,15]],'C');g.rect(0,0,16,3,'T');
    pal={S:T.stone[1],T:T.stone[2],K:'#140c10',M:'#6a6a78',C:'#ffd04a',Y:'#fff6c8'};opt.flat='CY';opt.glow='#ffd04a';}
  else if(kind==='keychest'){g=P(16,14);g.rect(2,4,12,9,'W');g.rect(2,4,12,3,'L');g.rect(2,7,12,1,'G');g.rect(6,7,4,4,'G');g.rect(7,8,2,2,'K');g.rect(2,4,1,9,'G');g.rect(13,4,1,9,'G');pal={W:'#4a5a8a',L:'#6a7ab0',G:'#e8e8f8',K:'#1a1a2a'};opt.glow='#bfe6ff';}
  else if(kind==='lever'){g=P(12,14);g.rect(2,10,8,4,'S');g.rect(3,11,6,2,'D');if(!v)g.line(6,11,2,2,'M',1);else g.line(6,11,10,2,'M',1);g.ell(v?10:2,2,1.6,1.6,'R');pal={S:D.w[2],D:D.w[3],M:'#8a8a98',R:v?'#5ad06a':'#e04848'};}
  else if(kind==='bars'){g=P(16,22);g.rect(0,0,16,3,'S');for(let i=1;i<16;i+=3)g.rect(i,3,2,19,'M');g.rect(0,10,16,1,'N');pal={S:D.w[2],M:'#7a7a88',N:'#4a4a58'};}
  else if(kind==='door'){g=P(16,22);g.rect(0,0,16,22,'S');g.ell(8,5,6,5,'W');g.rect(2,5,12,17,'W');for(let i=4;i<14;i+=3)g.rect(i,3,1,19,'D');g.rect(2,10,12,1,'M');g.rect(2,17,12,1,'M');g.rect(7,13,2,3,'G');g.s(7,14,'K');pal={S:D.w[0],W:'#6a4424',D:'#4a2c14',M:'#5a5a68',G:'#f0c050',K:'#140a08'};}
  else if(kind==='facade'){
    const th=theme;g=P(52,44);
    if(th==='meadow'){g.ell(26,30,26,16,'A');g.ell(26,26,20,12,'B');g.rect(14,18,24,26,'S');g.rect(11,15,30,5,'T');g.rect(17,22,18,22,'K');g.px([[8,24],[44,22],[20,14],[33,13]],'F');g.rect(16,20,2,24,'U');g.rect(34,20,2,24,'U');
      pal={A:'#4f9441',B:'#5ea64c',S:'#9a9488',T:'#bab4a6',U:'#7a766c',K:'#0e0806',F:'#f6e06a'};}
    else if(th==='coast'){g.poly([[0,44],[6,14],[18,2],[34,2],[46,12],[52,44]],'A');g.poly([[14,44],[16,24],[26,14],[36,24],[38,44]],'K');g.ell(10,30,3,2,'C');g.ell(44,24,2.5,2,'C');g.path([[18,8],[16,16],[18,22]],'G',2);g.path([[38,10],[40,18]],'G',2);g.rect(4,40,44,4,'B');
      pal={A:'#b09a78',B:'#d0b898',K:'#0a1416',C:'#f0a8a0',G:'#3a8a4a'};}
    else if(th==='cave'){g.rect(4,4,44,40,'A');g.rect(8,0,36,6,'B');g.rect(14,14,24,30,'K');g.rect(12,12,28,3,'M');g.rect(12,12,3,32,'M');g.rect(37,12,3,32,'M');g.ell(26,7,5,3.5,'G');g.px([[24,6],[28,6]],'R');g.rect(23,9,6,1,'R');g.rect(18,20,16,2,'R');
      pal={A:'#6a5a5a',B:'#8a7a78',K:'#100604',M:'#4a4a56',G:'#c8a050',R:'#ff6a1a'};opt.flat='R';}
    else if(th==='snow'){g.poly([[2,44],[4,10],[26,0],[48,10],[50,44]],'A');g.poly([[14,44],[14,22],[26,14],[38,22],[38,44]],'K');for(let i=6;i<46;i+=5)g.poly([[i,10+((i*3)%4)],[i+2,10+((i*3)%4)],[i+1,16+((i*7)%5)]],'I');g.rect(2,40,48,4,'B');g.line(10,20,10,38,'B');g.line(42,20,42,38,'B');
      pal={A:'#9ac8e8',B:'#d8f0ff',K:'#0c1424',I:'#eefaff'};}
    else if(th==='heights'){g.rect(2,8,48,4,'B');g.poly([[0,8],[26,-2],[52,8]],'A');[6,16,32,42].forEach(px=>g.rect(px,12,5,30,'S'));g.rect(18,16,16,28,'K');g.rect(0,40,52,4,'B');g.ell(26,4,3,2,'G');
      pal={A:'#8a8aa0',B:'#c0c0cc',S:'#e8e8f0',K:'#100e18',G:'#f2c93a'};opt.flat='G';}
    else{g.poly([[4,44],[8,6],[26,-2],[44,6],[48,44]],'A');g.poly([[16,44],[16,20],[26,12],[36,20],[36,44]],'K');[[12,14],[40,14],[10,28],[42,28],[26,6]].forEach(p=>g.ell(p[0],p[1],1.5,1.5,'R'));g.rect(4,40,44,4,'B');
      pal={A:'#2a2240',B:'#3e3456',K:'#000000',R:'#c8a0ff'};opt.flat='R';opt.glow='#8b5fd0';}
  }
  else if(kind==='cavemouth'){g=P(38,28);g.ell(19,20,19,9,'A');g.ell(19,15,15,9,'B');g.rect(5,15,28,13,'A');g.ell(19,19,7,10,'K');g.rect(12,19,14,9,'K');
    g.px([[6,12],[11,8],[27,9],[32,13],[15,5],[22,5]],'M');g.rect(10,17,2,11,'M');g.rect(26,17,2,11,'M');g.rect(10,16,18,2,'M');
    pal={A:T.stone[1],B:T.stone[2],K:'#07040a',M:'#8a8a98'};opt.glow='#9ad0ff';}
  else if(kind==='lighthouse'){g=P(48,96);
    g.poly([[14,96],[18,24],[30,24],[34,96]],'W');for(let y=34;y<96;y+=16)g.poly([[18-(y-24)*.05,y],[30+(y-24)*.05,y],[30+(y+8-24)*.06,y+8],[18-(y+8-24)*.06,y+8]],'R');
    g.rect(14,18,20,6,'K');g.rect(16,8,16,10,'Y');g.rect(18,10,12,6,'L');g.poly([[14,8],[24,0],[34,8]],'R');g.rect(20,70,8,26,'D');g.rect(21,72,6,22,'K');g.rect(22,46,4,6,'Y');
    pal={W:'#f4f0e8',R:'#c83a3a',K:'#3a3a48',Y:'#fff0a0',L:'#ffd04a',D:'#5a4a3a'};opt.flat='YL';}
  return OBJ2[key]=paint(g,pal,opt);
}
const _drawObjects0=drawObjects;
drawObjects=function(ctx,m,y){
  if(m.kind==='dungeon'){
    for(let x=0;x<m.w;x++){const c=tileAt(m,x,y),px=x*TS,py=y*TS,th=m.theme;const at=(cv,ox,oy)=>ctx.drawImage(cv,px+ox,py+16-cv.height+oy);
      if(c==='C')at(objCanvas(th,'chest'),-1,0);else if(c==='c')at(objCanvas(th,'chestOpen'),-1,0);else if(c==='K')at(obj2(th,'keychest'),-1,0);
      else if(c==='l')at(obj2(th,'lever',G.levers[m.id]?1:0),1,0);else if(c==='|')at(obj2(th,'bars'),-1,1);else if(c==='D')at(obj2(th,'door'),-1,1);
      else if(c==='g')at(objCanvas(th,'grave'),1,0);else if(c==='P'){shadowAt(ctx,px+8,py+14,5,2);at(objCanvas(th,'pillar'),1,1);}
      else if(c==='|'&&G.levers[m.id]){/* raised */}}
    return;
  }
  _drawObjects0(ctx,m,y);
  for(let x=0;x<m.w;x++){const c=tileAt(m,x,y),px=x*TS,py=y*TS,th=m.theme;const at=(cv,ox,oy)=>ctx.drawImage(cv,px+ox,py+16-cv.height+oy);
    if(c==='q'){shadowAt(ctx,px+8,py+14,9,2);at(obj2(th,'board'),-3,1);}
    else if(c==='o')at(obj2(th,'boat',x),-5,4);
    else if(c==='G')at(obj2(th,'gate',m.s),-1,1);
    else if(c==='E'&&m.kind==='field'){const cv=(m.caves||[]).find(q=>q.x===x&&q.y===y),face=cv?cv.face:(m.entFace||[0,1]),spr=obj2(th,cv?'cavemouth':'facade'),ang=0;/* v0.4.1 1.6: entrances are always drawn upright, whichever way the trail approaches them */
      ctx.save();ctx.translate(px+8,py+8);ctx.rotate(ang);ctx.drawImage(spr,-spr.width/2,8-spr.height+1);ctx.restore();}
    else if(c==='K')at(obj2(th,'keychest'),-1,0);}
};
const _drawBuilding0=drawBuilding;
drawBuilding=function(ctx,m,b){
  if(b.k==='lighthouse'){const c=obj2(m.theme,'lighthouse');ctx.drawImage(c,b.x*TS+b.w*TS/2-c.width/2,(b.y+b.h)*TS-c.height+1);m.lights=m.lights||[];m.lights.push([b.x*TS+b.w*TS/2,(b.y+b.h)*TS-c.height+14,46]);return;}
  return _drawBuilding0(ctx,m,b);
};
