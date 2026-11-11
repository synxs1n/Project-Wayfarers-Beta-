// ===== worldgfx2.js (base): dungeon tiles, objects and buildings, second pass =====
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
  if(kind==='board'){g=P(20,22);g.rect(2,8,1,14,'V');g.rect(3,8,1,14,'W');g.rect(16,8,1,14,'V');g.rect(17,8,1,14,'W');g.rect(0,1,20,13,'D');g.rect(1,3,18,10,'L');g.rect(1,3,18,1,'Z');g.rect(0,1,20,1,'T');
    g.rect(2,5,5,6,'z');g.rect(8,6,5,5,'z');g.rect(14,5,4,7,'z');g.rect(2,4,5,6,'p');g.rect(8,5,5,5,'q');g.rect(14,4,4,7,'p');g.px([[4,4],[10,5],[16,4]],'R');g.px([[3,4],[9,5],[15,4]],'N');g.rect(3,6,3,1,'K');g.rect(9,7,3,1,'K');g.rect(15,6,2,1,'K');g.rect(15,8,2,1,'K');g.rect(9,8,3,1,'K');g.rect(3,8,2,1,'K');
    g.rect(19,3,1,10,'S');g.rect(0,13,20,1,'S');g.rect(2,14,2,1,'Z');g.rect(16,14,2,1,'Z');
    pal={V:'#8a5a30',W:'#5a381c',L:'#a8743a',D:'#7a4a24',T:'#a8743a',Z:'#5a381c',z:'#6a4424',S:'#4a2e16',p:'#f4ecd4',q:'#e8d8a8',R:'#d8403a',N:'#ff9a8a',K:'#5a4a3a'};opt.flat='KpqRNzZ';}
  else if(kind==='boat'){g=P(26,14);g.poly([[0,6],[26,6],[22,13],[4,13]],'W');pOver(g,'W','w',(x,y)=>y<=8&&x<=18);pOver(g,'W','d',(x,y)=>y>=11||x>=21);g.rect(1,6,24,1,'L');g.rect(12,-8,1,14,'K');g.poly([[13,-8],[22,2],[13,3]],'S');pDiag(g,'S','a','b',13,-8,22,3,.3,.62);g.rect(4,9,18,1,'D');g.px([[5,8],[8,8],[12,8],[16,8]],'L');g.line(13,-7,13,3,'T');
    pal={W:['#8a5a2a','#6a4a2a','#9a6a3a'][v%3],w:['#a8743a','#86623a','#b8804a'][v%3],d:['#5e3c1a','#4a3220','#6a4424'][v%3],L:'#c8a070',K:'#4a3020',T:'#2a1c12',S:['#f4ecdc','#e8c0a0','#c8d8f0'][v%3],a:'#ffffff',b:['#b8b0a0','#b89478','#94a6c0'][v%3],D:'#5a3a1a'};}
  else if(kind==='gate'){g=P(16,30);g.rect(0,2,16,28,'S');pOver(g,'S','s',(x)=>x>=14);g.rect(2,6,12,24,'K');g.rect(2,6,12,3,'Q');for(let j=9;j<30;j+=5){g.rect(0,j,2,1,'E');g.rect(14,j,2,1,'E');}for(let i=3;i<14;i+=3)g.rect(i,9,1,21,'M');for(let j=12;j<30;j+=5)g.rect(2,j,12,1,'M');g.ell(8,15,4.5,4.5,'C');g.ell(8,15,2.5,2.5,'Y');g.px([[8,9],[8,21],[2,15],[14,15]],'C');g.rect(0,0,16,3,'T');g.rect(0,0,16,1,'U');
    pal={S:T.stone[1],s:shade(T.stone[1],.78),T:T.stone[2],U:tint(T.stone[2],.3),K:'#140c10',Q:'#08040a',E:shade(T.stone[1],.6),M:'#6a6a78',C:'#ffd04a',Y:'#fff6c8'};opt.flat='CY';opt.glow='#ffd04a';}
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
    pOver(g,'W','w',(x)=>x>=27);pOver(g,'W','v',(x)=>x<=19);pOver(g,'R','r',(x)=>x>=27);pOver(g,'R','t',(x)=>x<=19);
    pal={W:'#f4f0e8',w:'#b4b4c4',v:'#fffaf0',R:'#c83a3a',r:'#8a2630',t:'#e85a56',K:'#3a3a48',Y:'#fff0a0',L:'#ffd04a',D:'#5a4a3a'};opt.flat='YL';}
  return OBJ2[key]=paint(g,pal,opt);
}

// =================== PROPS PASS (v0.15.6): shaded props ===================
// Same canvas sizes and anchors as before. Light from the upper left: a lit face, a base tone and a shade tone per material (extra keys), a darker
// outline from paint(), a cool rim light on the shadow edge (paintP), highlights on metal, glass and water. Flat keys stay flat (paper, glass, flames, runes).
function pOver(g,from,to,f){for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++){if(g.a[y*g.w+x]===from&&f(x-g.ox,y-g.oy))g.a[y*g.w+x]=to;}return g;}
function pDiag(g,k,kl,kd,x0,y0,x1,y1,a,b){a=a||.3;b=b||.68;for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++){if(g.a[y*g.w+x]!==k)continue;
  const t=(((x-g.ox)-x0)/(x1-x0)+((y-g.oy)-y0)/(y1-y0))/2;g.a[y*g.w+x]=t<a?kl:t>b?kd:k;}return g;}
function paintP(g,pal,opt){opt=opt||{};const cv=paint(g,pal,opt),ctx=cv.getContext('2d'),W=cv.width,H=cv.height,id=ctx.getImageData(0,0,W,H),d=id.data,flat=opt.flat||'',rm=hx('#8fa2ee');
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const k=g.g(x,y);if(!k||flat.includes(k)||g.g(x+1,y)||!pal[k])continue;
    const i=(y*W+x)*4;if(d[i+3]!==255)continue;d[i]=d[i]*.82+rm[0]*.18;d[i+1]=d[i+1]*.82+rm[1]*.18;d[i+2]=d[i+2]*.82+rm[2]*.18;}
  ctx.putImageData(id,0,0);return cv;}
const OBJ3={};
const P2K={
 barrel:(th,v,T)=>{const g=new PG(14,16,1,1);g.ell(6,7,5,6.5,'W');pOver(g,'W','L',(x)=>x<=3);pOver(g,'W','D',(x)=>x>=8);
  g.rect(1,3,10,1,'M');g.rect(1,10,10,1,'M');pOver(g,'M','N',(x)=>x<=3);pOver(g,'M','O',(x)=>x>=8);
  g.ell(6,2,4,1.4,'T');g.ell(6,2,2.4,.7,'U');g.px([[4,5],[4,6],[4,7],[4,8],[4,12],[7,5],[7,6],[7,7],[7,8],[7,12]],'S');g.px([[3,2],[4,1]],'T');
  return [g,{W:'#9a6a3a',L:'#bd8a4c',D:'#6e4624',M:'#5a5a62',N:'#9a9aaa',O:'#34343e',T:'#cf9c58',U:'#6a4220',S:'#7c5028'}];},
 crate:(th,v,T)=>{const g=new PG(16,15,1,1);g.rect(1,1,12,11,'W');g.rect(1,1,12,1,'L');g.rect(1,6,12,1,'S');g.line(2,2,12,11,'B');g.line(12,2,2,11,'B');
  g.rect(1,1,1,11,'L');g.rect(12,1,1,11,'D');g.rect(1,11,12,1,'D');g.px([[2,2],[11,2],[2,10],[11,10]],'N');pOver(g,'W','X',(x,y)=>x>=9&&x<=11&&y>=3);
  return [g,{W:'#a8783a',L:'#cfa05a',D:'#6a4624',S:'#8a5e2c',B:'#82582a',X:'#966a32',N:'#e8d8a8'},{flat:'N'}];},
 hay:(th,v,T)=>{const g=new PG(18,14,1,1);g.ell(8,7,7.5,5,'A');pDiag(g,'A','B','C',1,2,15,11,.34,.7);g.ell(7,5,5,2.2,'B');g.rect(1,8,14,1,'T');pOver(g,'T','U',(x)=>x>=9);
  g.px([[3,5],[5,4],[9,6],[11,5],[6,9],[10,10],[4,10],[12,8]],'B');g.px([[4,7],[8,9],[12,7],[7,6],[13,9],[2,8]],'C');
  return [g,{A:'#d8b04a',B:'#f2d878',C:'#a07c34',T:'#b88a3a',U:'#7a5a26'}];},
 cart:(th,v,T)=>{const g=new PG(20,16,1,1);g.rect(1,2,14,6,'W');g.rect(1,2,14,1,'L');g.rect(1,5,14,1,'S');g.rect(1,2,1,6,'L');g.rect(14,2,1,6,'D');g.rect(1,7,14,1,'D');
  g.ell(8,1,4,2,'H');pDiag(g,'H','J','I',4,-1,12,3,.3,.7);g.line(15,6,18,8,'W');g.line(15,5,18,7,'L');
  [4,13].forEach(cx=>{g.ell(cx,10,3,3,'K');g.ell(cx,10,2,2,'R');g.ell(cx,10,1,1,'M');g.line(cx-2,10,cx+2,10,'K');g.line(cx,8,cx,12,'K');g.px([[cx-2,8],[cx-1,7]],'Q');});
  return [g,{W:'#8a5a2a',L:'#b8864e',D:'#5e3a1a',S:'#74481f',K:'#3a2616',R:'#6a4a2a',Q:'#a07a4a',M:'#b8b8c4',H:'#d8b04a',J:'#f2d878',I:'#a07c34'}];},
 stall:(th,v,T)=>{const g=new PG(18,26,1,1);const aw=[['#c83a3a','#f4ecdc'],['#3a6ac8','#f4ecdc'],['#3a9a4a','#f6e7a8'],['#c8902a','#f4ecdc']][v%4];
  const goods=[['#e04a3a','#f2c93a','#6ab048'],['#8a5ad0','#3ad0c0','#f06aa8'],['#c8a060','#e8d8b0','#a86a3a'],['#5aa0e0','#f0f0f0','#2a6a9a']][v%4];
  g.rect(2,8,12,6,'I');g.rect(2,8,12,2,'Z');
  g.rect(1,4,1,18,'K');g.rect(14,4,1,18,'k');g.rect(0,14,16,8,'W');g.rect(0,14,16,2,'L');g.rect(0,16,16,1,'S');
  for(let i=4;i<16;i+=5)g.rect(i,17,1,5,'S');g.rect(0,21,16,1,'D');g.rect(15,14,1,8,'D');
  for(let i=0;i<16;i+=4){g.rect(i,1,1,6,'A');g.rect(i+1,1,1,6,'a');g.rect(i+2,1,1,6,'B');g.rect(i+3,1,1,6,'b');}
  g.rect(0,7,16,1,'D');for(let i=0;i<16;i+=4){g.px([[i+1,7],[i+3,7]],'D');}g.rect(0,0,16,1,'T');
  for(let i=0;i<5;i++){g.ell(2+i*3,12.5,1.4,1.4,String(1+i%3));g.s(1+i*3,11+(i%2?0:0),'h');}
  g.rect(1,13,14,1,'Y');
  return [g,{K:'#6a4a2e',k:'#3a2616',W:'#8a5a2a',L:'#b8864e',S:'#6e4620',D:'#4a2c14',I:'#241810',Z:'#120a08',A:aw[0],a:shade(aw[0],.78),B:aw[1],b:shade(aw[1],.84),T:tint(aw[0],.3),Y:'#5a3a1c',1:goods[0],2:goods[1],3:goods[2],h:'#ffffff'},{flat:'hZ'}];},
 banner:(th,v,T)=>{const g=new PG(14,32,1,1);const c=['#a82a2a','#2a5aa8','#6a2a8a','#2a7a5a','#a86a1a','#4a2a6a'][(v||0)%6];
  g.rect(2,2,1,27,'K');g.rect(3,2,1,27,'k');g.s(2,1,'G');g.s(3,1,'g');g.rect(1,28,4,1,'k');
  g.rect(3,3,8,14,'A');g.poly([[3,17],[11,17],[7,21]],'A');pOver(g,'A','b',(x)=>x<=4);pOver(g,'A','a',(x)=>x>=9);pOver(g,'A','a',(x,y)=>x===6&&y>5);
  g.rect(3,3,8,1,'G');g.rect(5,7,4,4,'G');g.rect(6,8,2,2,'C');g.rect(5,7,4,1,'g');g.px([[4,16],[10,16]],'G');
  return [g,{K:'#4a3626',k:'#2a1c12',G:'#f0c050',g:'#fff0a0',A:c,a:shade(c,.72),b:tint(c,.2),C:ELC[ELK[(v||0)%8]]},{flat:'Cg'}];},
 anvil:(th,v,T)=>{const g=new PG(18,14,1,1);g.rect(2,2,12,3,'M');g.poly([[14,2],[16,3],[14,4]],'M');g.rect(2,2,12,1,'H');g.rect(5,5,6,4,'N');g.rect(3,9,10,2,'N');
  pOver(g,'N','n',(x)=>x>=8);pOver(g,'M','m',(x,y)=>x>=11&&y>2);g.px([[3,2],[4,2],[5,2]],'G');g.rect(3,10,10,1,'n');
  return [g,{M:'#6a6a78',m:'#4e4e5c',H:'#9c9cac',G:'#e8e8f6',N:'#4a4a58',n:'#30303c'},{flat:'G'}];},
 fountain:(th,v,T)=>{const g=new PG(34,32,1,1);g.ell(16,20,15,8,'S');pOver(g,'S','s',(x,y)=>y>=25);pDiag(g,'S','T','s',1,12,31,28,.22,.7);
  g.ell(16,19,12,6,'W');pDiag(g,'W','w','V',4,13,28,25,.25,.7);
  const r=v?[3.5,6.5,9.5]:[4.5,7.5,10.5];r.forEach((q,i)=>{for(let a=0;a<28;a++){const t=a/28*Math.PI*2,x=Math.round(16+Math.cos(t)*q*1.15),y=Math.round(19+Math.sin(t)*q*.5);if(g.g(x+1,y+1)&&'wWV'.includes(g.g(x+1,y+1)))g.s(x,y,i===1?'Q':'R');}});
  g.rect(14,6,4,14,'S');pOver(g,'S','T',(x,y)=>x===14&&y<20&&y>=6);pOver(g,'S','s',(x,y)=>x===17&&y<20&&y>=6);
  g.ell(16,6,5,2.2,'S');pDiag(g,'S','T','s',11,4,21,8,.25,.7);g.ell(16,6,3.5,1.2,'W');g.px([[14,6],[15,5]],'R');
  g.px(v?[[13,9],[19,9],[11,13],[21,13],[16,2]]:[[12,10],[20,10],[16,3],[14,13],[18,13]],'Y');g.px(v?[[16,4],[16,3],[15,8],[17,8]]:[[16,4],[15,6],[17,6]],'Y');
  g.px([[13,15],[19,15],[12,17],[20,17]],'R');
  return [g,{S:'#b8b0a0',T:'#dcd6c6',s:'#867e72',W:'#4a98dc',w:'#74bcf0',V:'#2e6cae',R:'#a8e0ff',Q:'#e6f8ff',Y:'#e8f8ff'},{flat:'YRQ'}];},
 lamp:(th,v,T)=>{const g=new PG(12,28,1,1);g.rect(4,8,1,17,'Q');g.rect(5,8,1,17,'K');g.rect(2,24,6,2,'K');g.rect(2,24,6,1,'Q');g.rect(3,22,4,2,'K');g.px([[4,22],[3,22]],'Q');
  g.rect(4,0,2,2,'M');g.rect(1,2,8,1,'Q');g.rect(2,3,6,5,'M');g.rect(3,3,4,4,'Y');g.rect(4,4,2,2,'Z');g.px([[3,3],[3,4]],'H');g.px([[6,6],[5,6],[6,5]],'X');
  g.rect(2,3,1,5,'Q');g.rect(7,3,1,5,'K');g.rect(2,7,6,1,'K');
  return [g,{K:'#2a2a34',Q:'#6a6a7a',M:'#4a4a58',Y:'#ffd870',Z:'#fff4b8',H:'#ffffff',X:'#e8a038'},{flat:'YZHX'}];},
 brazier:(th,v,T)=>{const g=new PG(16,20,1,1);g.rect(5,10,2,7,'Q');g.rect(7,10,2,7,'K');g.rect(2,15,10,2,'K');g.rect(2,15,10,1,'Q');
  g.ell(7,9,5,2.5,'M');pDiag(g,'M','m','n',2,6,12,12,.3,.7);g.px([[3,9],[5,10],[9,10],[11,9]],'E');
  g.poly([[3,8],[7,v?0:2],[11,8]],'F');g.poly([[4,8],[7,v?2:3],[10,8]],'O');g.poly([[5,8],[7,v?3:4],[9,8]],'Y');
  return [g,{K:'#2a2a34',Q:'#5a5a6a',M:'#5a4a40',m:'#8a7468',n:'#3a2c28',F:'#ff7a2a',O:'#ffa83a',Y:'#ffe08a',E:'#ff8a3a'},{flat:'FOYE'}];},
 sign:(th,v,T)=>{const g=new PG(18,18,1,1);g.rect(7,8,1,8,'W');g.rect(8,8,1,8,'P');g.rect(1,2,14,7,'L');g.rect(1,2,1,7,'M');g.rect(14,2,1,7,'D');g.rect(1,8,14,1,'D');g.rect(7,9,2,1,'P');
  g.rect(3,4,10,1,'K');g.rect(3,6,7,1,'K');g.px([[2,3],[13,3]],'N');
  return [g,{W:'#8a5a30',P:'#4e3018',L:'#b08a52',M:'#cfa86e',D:'#7a5a30',K:'#5a3a1a',N:'#e8d8b0'},{flat:'KN'}];},
 waystone:(th,v,T)=>{const g=new PG(18,30,1,1);g.poly([[3,27],[5,6],[8,1],[11,6],[13,27]],'A');pDiag(g,'A','a','d',3,1,13,27,.34,.62);g.rect(2,25,12,3,'B');pOver(g,'B','b',(x,y)=>y===25);pOver(g,'B','e',(x)=>x>=10);
  g.poly([[8,8],[10,12],[8,16],[6,12]],'C');g.px([[8,19],[7,21],[9,21]],'C');g.px([[8,7],[11,12],[8,17],[5,12],[8,18],[6,21],[10,21]],'h');g.px([[6,9],[5,18],[11,22]],'x');
  return [g,{A:'#8a8ea0',a:'#b4b8cc',d:'#5e6278',B:'#5a5e70',b:'#80849a',e:'#3e4256',C:'#7af0ff',h:'#2e8aa0',x:'#40445a'},{flat:'Chx',glow:'#7af0ff'}];},
 grave:(th,v,T)=>{const g=new PG(14,18,1,1);g.rect(2,5,8,10,'A');g.ell(6,5,4,3,'A');pDiag(g,'A','a','d',2,2,10,14,.3,.66);g.rect(5,4,2,6,'D');g.rect(3,6,6,2,'D');g.px([[7,10],[9,8]],'e');
  g.rect(1,14,10,2,'B');g.rect(1,14,10,1,'b');g.px([[2,14],[3,14],[8,14],[10,14]],'G');
  return [g,{A:T.stone[0],a:tint(T.stone[0],.28),d:shade(T.stone[0],.7),B:T.stone[1],b:tint(T.stone[1],.2),D:T.stone[3],e:tint(T.stone[0],.4),G:T.tg[1]},{flat:'D'}];},
 standing:(th,v,T)=>{const g=new PG(14,28,1,1);g.poly([[2,25],[3,4],[6,0],[9,3],[10,25]],'A');pDiag(g,'A','a','d',2,0,10,25,.36,.62);g.px([[5,9],[6,10],[5,11],[6,15],[5,16]],'C');g.px([[4,9],[7,10],[4,11],[7,15],[4,16]],'h');
  g.ell(5,20,2,1.5,'M');g.px([[5,19],[4,20]],'m');g.rect(2,24,9,1,'d');
  return [g,{A:T.stone[1],a:tint(T.stone[1],.26),d:shade(T.stone[1],.68),C:'#7af0ff',h:'#2e7c90',M:'#6a9a4a',m:'#9ad06a'},{flat:'Ch'}];},
 ruinwall:(th,v,T)=>{const g=new PG(18,24,1,1);g.rect(0,6,16,16,'A');g.poly([[0,6],[4,2],[7,6],[10,0],[16,4],[16,6]],'A');
  for(let r=8,i=0;r<22;r+=4,i++){g.rect(0,r,16,1,'D');for(let x=(i%2?3:6);x<16;x+=6)g.rect(x,r+1,1,3,'D');}
  pOver(g,'A','a',(x,y)=>((Math.floor((x+(Math.floor((y-8)/4)%2?3:0))/6)+Math.floor((y-8)/4))%2===0)&&y>=6);pOver(g,'A','d',(x)=>x>=13);
  g.ell(4,10,3,2,'M');g.px([[3,9],[4,9]],'N');g.px([[1,22],[14,22],[15,21]],'D');g.px([[5,3],[7,2]],'a');
  return [g,{A:T.stone[0],a:tint(T.stone[0],.2),d:shade(T.stone[0],.78),D:T.stone[1],M:'#5a8a4a',N:'#86b866'}];},
 pillar:(th,v,T)=>{const g=new PG(14,30,1,1);
  if(th==='cave'||th==='void'){const A=th==='cave'?'#c890ff':'#8a5fd0',B=th==='cave'?'#8a5ad0':'#5a3a9a';g.poly([[3,27],[6,2],[9,27]],'A');g.poly([[6,27],[8,10],[11,27]],'B');g.px([[6,8],[8,16]],'C');
   g.line(5,22,6,6,'L');g.line(9,24,9,14,'E');g.px([[6,5],[5,12],[6,16]],'W');
   return [g,{A:A,B:B,C:'#ffffff',L:tint(A,.4),E:shade(B,.6),W:'#ffffff'},{flat:'CW',glow:th==='cave'?'#c890ff':'#8b5fd0'}];}
  g.rect(3,6,6,20,'A');pOver(g,'A','a',(x)=>x<=3);pOver(g,'A','d',(x)=>x>=7);g.rect(2,4,8,3,'B');pOver(g,'B','b',(x,y)=>y===4);pOver(g,'B','e',(x)=>x>=8);g.rect(2,25,8,2,'B');pOver(g,'B','e',(x,y)=>y===26);g.rect(5,6,1,20,'D');g.poly([[3,4],[6,0],[9,4]],'A');pOver(g,'A','a',(x,y)=>y<4&&x<=5);pOver(g,'A','d',(x,y)=>y<4&&x>=7);
  return [g,{A:T.stone[0],a:tint(T.stone[0],.24),d:shade(T.stone[0],.7),B:T.stone[2],b:tint(T.stone[2],.25),e:shade(T.stone[2],.72),D:T.stone[1]}];},
 tent:(th,v,T)=>{const tc=['#c8a87a','#a85a5a','#5a7aa8'][v%3];const g=new PG(22,20,1,1);g.poly([[10,0],[19,16],[1,16]],'A');g.poly([[10,0],[5,16],[1,16]],'L');g.poly([[10,0],[19,16],[14,16]],'B');g.poly([[10,0],[13,16],[7,16]],'B');
  g.poly([[10,7],[12,16],[8,16]],'K');g.rect(1,15,18,1,'H');for(let x=1;x<19;x++)for(let y=11;y<13;y++)if(['A','L','B'].includes(g.g(x+1,y+1)))g.s(x,y,y===11?'T':'U');
  g.line(10,7,8,16,'J');g.rect(9,13,2,3,'E');g.line(10,0,10,-1,'W');g.px([[10,-1]],'F');g.px([[0,16],[19,16]],'W');
  return [g,{A:tc,L:tint(tc,.22),B:shade(tc,.78),H:shade(tc,.55),T:tint(tc,.35),U:shade(tc,.66),K:'#2a1a12',E:'#120a08',J:tint(tc,.1),W:'#6a4424',F:'#f6e7a8'},{flat:'F'}];},
 tower:(th,v,T)=>{const g=new PG(24,36,1,1);g.rect(2,12,18,21,'A');pOver(g,'A','a',(x)=>x<=6);pOver(g,'A','d',(x)=>x>=15);for(let r=14;r<33;r+=4)g.rect(2,r,18,1,'D');
  g.rect(1,8,20,5,'B');for(let i=1;i<21;i+=5)g.rect(i,4,3,4,'B');pOver(g,'B','b',(x,y)=>x<=6||y===4);pOver(g,'B','e',(x)=>x>=16);
  g.rect(9,18,4,7,'K');g.rect(10,19,2,5,'Y');g.line(11,4,11,-3,'W');g.rect(12,-3,6,4,'F');
  return [g,{A:T.stone[0],a:tint(T.stone[0],.2),d:shade(T.stone[0],.72),B:T.stone[2],b:tint(T.stone[2],.2),e:shade(T.stone[2],.72),D:T.stone[1],K:OUTC,Y:'#ffd98a',W:'#3a2a1a',F:'#a82a2a'},{flat:'YK'}];},
 rock:(th,v,T)=>{const g=new PG(18,16,1,1);g.ell(8,8,7,5.5,'A');pDiag(g,'A','B','C',1,2,15,13,.3,.66);g.ell(6,6,3,2,'B');g.px([[11,9],[12,10]],'D');g.px([[5,5],[6,5]],'E');
  return [g,{A:T.stone[0],B:tint(T.stone[0],.28),C:shade(T.stone[0],.72),D:T.stone[3],E:tint(T.stone[0],.5)}];}
};
// the three scene kinds (board, boat, gate and the lighthouse) are shaded inside obj2 above (kind branches), through the same helpers
HOOK.before('objCanvas','worldgfx2','scene props through paintP',function(theme,kind,v){const f=P2K[kind];if(!f)return;
  const key=theme+':'+kind+':'+(v||0);if(OBJ3[key])return HOOK.stop(OBJ3[key]);const T=THEME[theme];if(!T||!T.stone)return;
  const r=f(theme,v||0,T);return HOOK.stop(OBJ3[key]=paintP(r[0],r[1],r[2]));});
const _fence0=fenceDraw;
fenceDraw=function(ctx,m,x,y){const px=x*TS,py=y*TS,isF=(dx,dy)=>tileAt(m,x+dx,y+dy)==='F';
  const f=(c,a,b,w,h)=>{ctx.fillStyle=c;ctx.fillRect(px+a,py+b,w,h);};
  const W='#9a7448',L='#c8a068',D='#5a3e22',S='#7a5a36';
  f('rgba(10,6,24,.26)',5,15,7,1);
  if(isF(-1,0)||isF(1,0)){const a=isF(-1,0)?0:6,b=isF(1,0)?16:10;f('rgba(10,6,24,.2)',a,8,b-a,1);f('rgba(10,6,24,.2)',a,13,b-a,1);
    [5,10].forEach(r=>{f(D,a,r,b-a,3);f(W,a,r,b-a,2);f(L,a,r,b-a,1);f(S,a,r+1,b-a,1);});}
  f(D,6,2,4,13);f(W,6,2,3,12);f(L,6,2,1,12);f(S,8,3,1,11);f('#e6c88e',6,2,2,1);f('#8a6a42',8,2,1,1);
  if(isF(-1,0)||isF(1,0)){[5,10].forEach(r=>{f(L,6,r,1,1);});}
  if(isF(0,-1)){f(D,7,0,2,3);f(W,7,0,1,3);f(L,7,0,1,1);}if(isF(0,1)){f(D,7,14,2,2);f(W,7,14,1,2);}
};
HOOK.wrap('drawObjects','worldgfx2','dungeon props, contact shadows, boards and boats',function(next,ctx,m,y){
  if(m.kind==='dungeon'){
    for(let x=0;x<m.w;x++){const c=tileAt(m,x,y),px=x*TS,py=y*TS,th=m.theme;const at=(cv,ox,oy)=>ctx.drawImage(cv,px+ox,py+16-cv.height+oy);
      if(c==='C')at(objCanvas(th,'chest'),-1,0);else if(c==='c')at(objCanvas(th,'chestOpen'),-1,0);else if(c==='K')at(obj2(th,'keychest'),-1,0);
      else if(c==='l')at(obj2(th,'lever',G.levers[m.id]?1:0),1,0);else if(c==='|')at(obj2(th,'bars'),-1,1);else if(c==='D')at(obj2(th,'door'),-1,1);
      else if(c==='g')at(objCanvas(th,'grave'),1,0);else if(c==='P'){shadowAt(ctx,px+8,py+14,5,2);at(objCanvas(th,'pillar'),1,1);}
      else if(c==='S')at(objCanvas(th,'sign'),-1,1);/* v0.18.7: the Echo Rift's bay signs are solid; a dungeon never drew an 'S', so they were empty squares that blocked the way */
      else if(c==='|'&&G.levers[m.id]){/* raised */}}
    return;
  }
  for(let x=0;x<m.w;x++){const c=tileAt(m,x,y),px=x*TS,py=y*TS;// contact shadows for props that had none (the light is upper left: the shadow falls to the lower right)
    if(c==='L')shadowAt(ctx,px+9,py+15,3,1);else if(c==='m')shadowAt(ctx,px+9,py+15,8,2);else if(c==='u')shadowAt(ctx,px+9,py+15,3,1);else if(c==='a')shadowAt(ctx,px+9,py+14,6,2);
    else if(c==='h')shadowAt(ctx,px+9,py+14,8,2);else if(c==='Q')shadowAt(ctx,px+9,py+15,8,2);else if(c==='g')shadowAt(ctx,px+9,py+15,5,1);}
  next(ctx,m,y);
  for(let x=0;x<m.w;x++){const c=tileAt(m,x,y),px=x*TS,py=y*TS,th=m.theme;const at=(cv,ox,oy)=>ctx.drawImage(cv,px+ox,py+16-cv.height+oy);
    if(c==='q'){shadowAt(ctx,px+8,py+14,9,2);at(obj2(th,'board'),-3,1);}
    else if(c==='o')at(obj2(th,'boat',x),-5,4);
    else if(c==='G')at(obj2(th,'gate',m.s),-1,1);
    else if(c==='E'&&m.kind==='field'){const cv=(m.caves||[]).find(q=>q.x===x&&q.y===y),face=cv?cv.face:(m.entFace||[0,1]),spr=obj2(th,cv?'cavemouth':'facade'),ang=0;/* v0.4.1 1.6: entrances are always drawn upright, whichever way the trail approaches them */
      ctx.save();ctx.translate(px+8,py+8);ctx.rotate(ang);ctx.drawImage(spr,-spr.width/2,8-spr.height+1);ctx.restore();}
    else if(c==='K')at(obj2(th,'keychest'),-1,0);}
});
const _drawBuilding0=drawBuilding;
drawBuilding=function(ctx,m,b){
  if(b.k==='lighthouse'){const c=obj2(m.theme,'lighthouse');ctx.drawImage(c,b.x*TS+b.w*TS/2-c.width/2,(b.y+b.h)*TS-c.height+1);m.lights=m.lights||[];m.lights.push([b.x*TS+b.w*TS/2,(b.y+b.h)*TS-c.height+14,46]);return;}
  return _drawBuilding0(ctx,m,b);
};
