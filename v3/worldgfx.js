// ===== worldgfx.js (base): world tile themes and object sprites (THEME, drawObjects, buildings) =====
const THEME={
 meadow:{g:['#5ea64c','#4f9441','#72bc5c','#3f8034'],tg:['#2f6a28','#4a9a3a','#9ad868'],p:['#b8955c','#9a7a48','#d2b07a'],cb:['#9a9488','#7a766c','#bab4a6','#5a564e'],w:['#3a80c4','#5aa0e0','#c8ecff','#2a609a'],cl:['#8a7a62','#6a5c48','#a8987c','#4a3e30'],stone:['#a8a090','#888070','#c8c0b0','#5e584c'],
   dec:['#f06a8a','#f6e06a','#ffffff','#b080ff'],mat:'timber',roof:['#b8483a','#9a6a3a','#c87a3a','#7a8a3a'],roofKind:'thatch',tree:'leafy',lip:'#6fb85a'},
 coast:{g:['#e8d4a0','#d6c088','#f4e4b8','#c0a870'],tg:['#7a9a40','#9ab850','#c8e070'],p:['#c8a878','#a88a60','#e0c898'],cb:['#d0c8b8','#aaa294','#ece4d4','#8a8274'],w:['#2a86c0','#48a8dc','#d0f4ff','#1e6a9a'],cl:['#b09a78','#8a7658','#d0b898','#6a5840'],stone:['#e0d8c8','#c0b8a8','#f4eee0','#9a9284'],
   dec:['#f6e8d8','#f0a8a0','#ffffff','#8ad0f0'],mat:'white',roof:['#3a7ab8','#2a8a9a','#5a6ab8','#3a9a8a'],roofKind:'tile',tree:'palm',lip:'#e8d4a0'},
 cave:{g:['#62544e','#544640','#74645a','#463a36'],tg:['#5a4240','#7a5450','#ff8a3a'],p:['#6e5e54','#584a42','#86745e'],cb:['#857a7c','#6a6064','#a09496','#4a4044'],w:['#e8551a','#ff8a2a','#ffe08a','#a83a10'],cl:['#6e5e5a','#4e4240','#8e7e78','#2e2426'],stone:['#8a8088','#6a6268','#a49aa2','#4a444a'],
   dec:['#ff7a2a','#ffb04a','#c8a8ff','#ff5a3a'],mat:'stone',roof:['#6a4a3a','#7a3a2a','#5a5a62','#8a5a2a'],roofKind:'slate',tree:'stalagmite',lip:'#6e5e5c',dark:1},
 snow:{g:['#e8f0f8','#d2e0ee','#ffffff','#b8cce0'],tg:['#7a9ab8','#9ab8d4','#e8f6ff'],p:['#c8c0b8','#a8a098','#e0dad2'],cb:['#a8b0bc','#8890a0','#c8d0da','#606878'],w:['#5a9ac8','#7ab8e0','#e8faff','#3a7aa8'],cl:['#8aa0b8','#6a7e98','#b0c4d8','#4a5a70'],stone:['#a8b4c4','#8894a8','#c8d4e0','#5a6478'],
   dec:['#ffffff','#bfe6ff','#ff7a8a','#8fdcf0'],mat:'log',roof:['#5a6a8a','#7a4a3a','#4a6a5a','#6a5a7a'],roofKind:'snowy',tree:'pine',lip:'#ffffff'},
 heights:{g:['#7aa05a','#68904c','#92b870','#58783e'],tg:['#4a6a34','#6a8a4a','#b8d880'],p:['#a8a090','#8a8274','#c4bcac'],cb:['#9a98a4','#7a7884','#bab8c4','#5a5864'],w:['#e8eef8','#c8d4e8','#ffffff','#a8b4cc'],cl:['#7a7a88','#5a5a68','#9a9aa8','#3a3a48'],stone:['#a0a0ac','#80808c','#c0c0cc','#5a5a66'],
   dec:['#f2c93a','#ffffff','#c8e0f0','#e07ab0'],mat:'stone',roof:['#6a4a8a','#4a5a8a','#8a4a6a','#5a6a4a'],roofKind:'slate',tree:'crag',lip:'#92b870',cloud:1},
 void:{g:['#2e2644','#262038','#3c3256','#1c1630'],tg:['#3e2c5e','#5a3e86','#c8a0ff'],p:['#4a4060','#3a3250','#5e5478'],cb:['#4a4462','#3a3450','#5e5878','#26203a'],w:['#0c0818','#1a1030','#e8e0ff','#06040e'],cl:['#2a2240','#1a1428','#3e3456','#0e0a18'],stone:['#5a5272','#443c5a','#726a8c','#2e2840'],
   dec:['#b080ff','#f6e7a8','#5fc9a0','#ff8ad0'],mat:'tent',roof:['#7a3a5a','#3a5a7a','#6a5a2a','#4a3a7a'],roofKind:'tent',tree:'crystal',lip:'#3c3256',stars:1,dark:1,palisade:1}
};

// =================== TILE ART ===================
function shadeTone(T,m,x,y){const n=m.tone(x,y);return n<.38?T.g[3]:n>.66?T.g[2]:T.g[0];}
function drawTile(ctx,m,x,y,frame){
  if(m.kind==='dungeon')return drawDTile(ctx,m,x,y,frame);
  const T=THM(m),c0=tileAt(m,x,y),c=c0==='G'?'=':c0==='o'?'~':c0,px=x*TS,py=y*TS,R=mulberry(x*7349+y*1931+m.s*11+(m.kind==='town'?5:0));
  const relit=m.kind==='field'&&G.cleared[m.s];
  const f=(col,a,b,w,h)=>{ctx.fillStyle=col;ctx.fillRect(px+a,py+b,w,h);};
  const town=m.kind==='town';
  const ground=()=>{
    const base=shadeTone(T,m,x,y);f(base,0,0,16,16);
    for(let i=0;i<7;i++){const gx=Math.floor(R()*15),gy=Math.floor(R()*14);f(R()<.6?T.g[1]:T.g[2],gx,gy,1,R()<.5?2:1);}
    if(m.theme==='meadow'||m.theme==='heights'){for(let i=0;i<3;i++){const gx=Math.floor(R()*14),gy=Math.floor(R()*13)+1;f(T.tg[0],gx,gy+1,1,2);f(T.tg[1],gx+1,gy,1,3);}}
    if(m.theme==='coast'&&R()<.12)f('#ffffff',Math.floor(R()*13),Math.floor(R()*13),2,1);
    if(m.theme==='snow'&&R()<.5)f('#ffffff',Math.floor(R()*15),Math.floor(R()*15),1,1);
    if(m.theme==='cave'){if(R()<.3){const cx=Math.floor(R()*12);f(T.g[3],cx,Math.floor(R()*14),4,1);}if(R()<.12)f('#ff8a3a',Math.floor(R()*15),Math.floor(R()*15),1,1);}
    if(m.theme==='void'&&R()<.3)f(R()<.5?'#8a6ad0':'#5fc9a0',Math.floor(R()*15),Math.floor(R()*15),1,1);
    if(relit&&R()<.22){const fx=Math.floor(R()*12)+2,fy=Math.floor(R()*12)+2,col=T.dec[Math.floor(R()*4)];f(col,fx,fy,1,1);f(col,fx+1,fy+1,1,1);f('#fff6a0',fx,fy+1,1,1);}
    if(m.motif&&c!=='~')motifPaint(f,R,m.motif);
    const up=tileAt(m,x,y-1);if('#ZYH'.includes(up)||(up==='O')){ctx.fillStyle='rgba(10,6,20,.28)';ctx.fillRect(px,py,16,3);}
  };
  if(c==='~'){
    const w=T.w;f(w[0],0,0,16,16);
    const deep=['~'].includes(tileAt(m,x,y-1))&&['~'].includes(tileAt(m,x,y+1));if(deep)f(w[3],0,6,16,5);
    if(T.stars){for(let i=0;i<5;i++)f(R()<.5?w[2]:'#8a6ad0',Math.floor(R()*16),Math.floor(R()*16),1,1);if(frame)f(w[2],Math.floor(R()*16),Math.floor(R()*16),1,1);}
    else if(T.cloud){const o=frame?1:0,n=m.tone(x,y);if(n<.45){f(shade(w[1],.97),0,0,16,16);}for(let k=0;k<2;k++){const px0=Math.floor(R()*12)+o,py0=Math.floor(R()*12);f(w[1],px0-1,py0+2,9,2);f(w[2],px0,py0,7,3);f('#ffffff',px0+1,py0,4,1);f(w[2],px0+2,py0-1,3,1);}if(R()<.3)f(w[3],Math.floor(R()*12),Math.floor(R()*14),4,1);}
    else{const o=frame?3:0;f(w[1],(1+o)%12,3,5,1);f(w[1],(8+o)%12,9,6,1);f(w[2],(3+o)%12,3,2,1);f(w[2],(10+o)%12,9,2,1);if(m.theme==='cave')f('#ffd04a',(6+o*2)%14,13,3,1);}
    const edge=(dx,dy)=>{const n=tileAt(m,x+dx,y+dy);return n!=='~'&&n!=='B'&&n!=='o';};
    const foam=m.theme==='cave'?'#ffb04a':T.cloud?'#ffffff':T.stars?'#6a4aa8':'#e8f8ff';
    const upT=tileAt(m,x,y-1);
    if((T.cloud||T.stars)&&upT!=='~'&&upT!=='B'&&upT!=='o'){const C=T.cl;f(C[0],0,0,16,9);for(let i=0;i<16;i+=3){f(C[1],i,2+(i*7+x)%3,2,7);f(C[2],i+1,0,1,4);}
      for(let i=0;i<16;i+=2){const d=9+((i*5+x*3)%5);f(C[3],i,9,2,d-9);}f(C[3],0,0,16,1);
      if(T.cloud&&R()<.6){f('#5a8a3a',3+Math.floor(R()*8),9,1,4+Math.floor(R()*3));}if(T.stars)f('#8b5fd0',5,10,1,2);}
    else if(edge(0,-1)){f(T.lip,0,0,16,2);f(foam,0,2,16,1);if(frame)f(foam,3,3,4,1);}
    if(edge(-1,0)){f(foam,0,0,1,16);}if(edge(1,0)){f(foam,15,0,1,16);}if(edge(0,1)){f(shade(w[0],.8),0,15,16,1);}
    return;
  }
  if(c==='='||c==='X'||c===':'){
    const road=(dx,dy)=>{const t=tileAt(m,x+dx,y+dy);return '=X:BGsE'.includes(t);};
    if(town||c===':'){
      const C=T.cb;
      if(c===':'){f(C[2],0,0,16,16);f(C[0],0,0,8,8);f(C[0],8,8,8,8);f(C[3],0,7,16,1);f(C[3],7,0,1,16);f(C[3],15,0,1,16);f(C[3],0,15,16,1);f(tint(C[2],.2),1,1,3,1);f(tint(C[2],.2),9,9,3,1);if(R()<.3)f(C[1],2+Math.floor(R()*4),3,3,1);}
      else{f(C[3],0,0,16,16);for(let r=0;r<4;r++){let sx=(r%2)*-2;while(sx<16){const sw=3+Math.floor(R()*3);const col=R()<.3?C[1]:R()<.5?C[2]:C[0];f(col,Math.max(0,sx),r*4,Math.min(sw,16-Math.max(0,sx))-1,3);f(tint(col,.25),Math.max(0,sx),r*4,1,1);sx+=sw;}}}
      return;
    }
    f(T.p[0],0,0,16,16);
    for(let i=0;i<5;i++)f(R()<.5?T.p[1]:T.p[2],Math.floor(R()*14),Math.floor(R()*14),R()<.4?2:1,1);
    if(road(-1,0)&&road(1,0)){f(T.p[1],0,4,16,1);f(T.p[1],0,11,16,1);}
    if(road(0,-1)&&road(0,1)){f(T.p[1],4,0,1,16);f(T.p[1],11,0,1,16);}
    const g0=shadeTone(T,m,x,y);
    if(!road(0,-1)){f(g0,0,0,16,1);for(let i=0;i<16;i+=3)f(T.tg[1],i+Math.floor(R()*2),1,1,1);}
    if(!road(0,1)){f(g0,0,15,16,1);for(let i=0;i<16;i+=3)f(T.tg[1],i,14,1,1);}
    if(!road(-1,0))f(g0,0,0,1,16);if(!road(1,0))f(g0,15,0,1,16);
    return;
  }
  if(c==='B'){
    if(m.theme==='coast'&&town){f(T.w[0],0,0,16,16);f('#8a5a2a',1,0,14,16);for(let i=0;i<16;i+=4)f('#6a4424',1,i,14,1);f('#a8703a',1,1,14,1);return;}
    const S=T.stone;f(T.w[0],0,0,16,16);f(S[0],0,2,16,12);for(let i=0;i<16;i+=4){f(S[1],i,2,1,12);}f(S[2],0,2,16,1);f(S[3],0,1,16,1);f(S[3],0,14,16,1);f(S[1],0,13,16,1);
    f(S[2],0,0,16,1);f(S[2],0,15,16,1);return;
  }
  if(c==='#'){
    const C=T.cl,top=!'#'.includes(tileAt(m,x,y-1)),bot=!'#'.includes(tileAt(m,x,y+1));
    f(C[0],0,0,16,16);
    for(let r=0;r<16;r+=4){f(C[1],0,r+3,16,1);let sx=Math.floor(R()*5);while(sx<16){f(C[2],sx,r,2,1);sx+=5+Math.floor(R()*4);}}
    if(R()<.4){const cx=2+Math.floor(R()*10);f(C[3],cx,4,1,5);f(C[3],cx+1,8,1,3);}
    if(top){f(T.lip,0,0,16,3);for(let i=0;i<16;i+=2)f(T.lip,i,3,1,1+Math.floor(R()*2));f(tint(T.lip,.25),0,0,16,1);}
    if(bot){f(C[3],0,13,16,3);}
    return;
  }
  if(c==='Z'||c==='Y'){
    const S=T.stone,below=tileAt(m,x,y+1),face=!'ZY'.includes(below);
    if(T.palisade){f(T.g[0],0,0,16,16);for(let i=0;i<16;i+=4){f('#5a3a22',i,face?2:0,3,16);f('#7a5232',i,face?2:0,1,16);f('#3a2414',i+2,face?2:0,1,16);if(face){f('#5a3a22',i+1,0,1,2);}}return;}
    if(face){
      f(S[1],0,0,16,16);
      for(let r=5;r<16;r+=4){const off=(r/4)%2?0:4;for(let i=-off;i<16;i+=8){f(S[0],Math.max(0,i),r,Math.min(7,16-Math.max(0,i)),3);f(S[2],Math.max(0,i),r,1,1);}}
      f(S[2],0,3,16,2);for(let i=0;i<16;i+=6){f(S[0],i,0,4,3);f(S[2],i,0,4,1);}
      f(S[3],0,15,16,1);if(R()<.3)f('#5a8a4a',Math.floor(R()*12),12+Math.floor(R()*3),3,1);
    }else{
      const L=!'ZY'.includes(tileAt(m,x-1,y)),Rt=!'ZY'.includes(tileAt(m,x+1,y));
      f(S[1],0,0,16,16);for(let r=0;r<16;r+=4){const off=(r/4+y)%2?0:4;for(let i=-off;i<16;i+=8)f(R()<.25?S[2]:S[0],Math.max(0,i),r,Math.min(7,16-Math.max(0,i)),3);}
      if(L){f(OUTC,0,0,1,16);f(S[3],1,0,3,16);for(let j=(y%2)*4;j<16;j+=8){f(S[0],1,j,4,4);f(S[2],1,j,4,1);}}
      if(Rt){f(OUTC,15,0,1,16);f(S[3],12,0,3,16);for(let j=(y%2)*4;j<16;j+=8){f(S[0],11,j,4,4);f(S[2],11,j,4,1);}}
    }
    return;
  }
  if(c==='s'){const S=T.stone;f(S[3],0,0,16,16);for(let i=0;i<4;i++){f(S[i%2?0:2],0,i*4,16,3);f(S[1],0,i*4+3,16,1);f(tint(S[2],.3),0,i*4,16,1);}return;}
  if(c==='y'){f(m.theme==='heights'?'#7a6a4a':'#7a5a34',0,0,16,16);for(let r=1;r<16;r+=4){f('#5a3e22',0,r+2,16,1);for(let i=1;i<16;i+=3){f(m.theme==='snow'?'#a8c8a0':'#6ab048',i,r,2,2);f(m.theme==='snow'?'#ffffff':(R()<.3?'#f2d46a':'#9ad868'),i,r,1,1);}}return;}
  ground();
  if(c===','){
    for(let r=0;r<3;r++)for(let k=0;k<4;k++){const bx=k*4+Math.floor(R()*2)+(r%2)*2,by=r*5+3;
      f(T.tg[0],bx,by+1,1,4);f(T.tg[1],bx+1,by,1,5);f(T.tg[0],bx+2,by+2,1,3);f(T.tg[2],bx+1,by,1,1);}
  }
  if(c==='f'){for(let i=0;i<4;i++){const fx=Math.floor(R()*12)+2,fy=Math.floor(R()*12)+2,col=T.dec[Math.floor(R()*4)];f(T.tg[0],fx+1,fy+2,1,2);f(col,fx,fy,1,1);f(col,fx+2,fy,1,1);f(col,fx+1,fy-1,1,1);f(col,fx+1,fy+1,1,1);f('#fff6a0',fx+1,fy,1,1);}}
  if(c==='r'){for(let i=0;i<5;i++){const s=T.stone;f(s[Math.floor(R()*3)],Math.floor(R()*13),Math.floor(R()*13),2+Math.floor(R()*2),2);}}
}
drawTile=HOOK.def('drawTile',drawTile);
// ----- objects -----
const OBJ_CACHE={};
function objCanvas(theme,kind,v){
  const key=theme+':'+kind+':'+(v||0);if(OBJ_CACHE[key])return OBJ_CACHE[key];
  const T=THEME[theme];let g,pal,opt={};
  const P=(w,h)=>new PG(w+2,h+2,1,1);
  if(kind==='tree'){
    g=P(20,28);
    if(T.tree==='leafy'){g.rect(8,18,4,9,'W');g.px([[7,26],[12,26],[6,27],[13,27]],'W');g.ell(10,11,9,8,'A');g.ell(5,13,4.5,4.5,'B');g.ell(15,14,4.5,4,'B');g.ell(7,7,4,3.5,'C');g.ell(13,8,3,2.5,'C');if(v)g.px([[5,10],[14,12],[9,15]],'F');pal={W:'#6a4424',A:'#3f8a3a',B:'#2f6a2e',C:'#7ac860',F:'#e04a4a'};}
    else if(T.tree==='palm'){g.path([[10,27],[9,18],[10,9]],'W',3);[[[10,8],[2,10],[0,15]],[[10,8],[18,10],[20,15]],[[10,8],[5,2],[0,3]],[[10,8],[15,2],[20,3]],[[10,8],[10,1]]].forEach(p=>g.path(p,'A',2));g.ell(10,9,2.2,2,'C');pal={W:'#9a7448',A:'#4aaa3a',C:'#7a4a2a'};}
    else if(T.tree==='stalagmite'){g.poly([[3,27],[9,2],[12,7],[17,27]],'A');g.poly([[7,27],[10,12],[13,27]],'B');g.px([[9,14],[11,20],[8,22]],'C');pal={A:'#6a5a58',B:'#4e4244',C:'#ff8a3a'};opt.flat='C';}
    else if(T.tree==='pine'){g.rect(9,22,3,5,'W');g.poly([[10.5,1],[19,23],[2,23]],'A');g.poly([[10.5,1],[15,9],[6,9]],'S');g.poly([[5,13],[16,13],[14,15],[7,15]],'S');g.poly([[3,20],[18,20],[17,22],[4,22]],'S');pal={W:'#5a3a22',A:'#2f5a4a',S:'#f4faff'};}
    // v0.11.2 realm looks (look9.js): canopy forest, fir (boreal and mountain), dead tree (marsh, ash), cactus (desert), basalt spire (volcanic)
    else if(T.tree==='canopy'){g.rect(8,18,4,9,'W');g.px([[7,26],[12,26]],'W');g.ell(10,10,9.5,8.5,'A');g.ell(4.5,13,4.5,4.5,'B');g.ell(15.5,13.5,4.5,4,'B');g.ell(10,5,5,3,'C');g.ell(6,8,2.5,2,'C');pal={W:'#4a3018',A:T.leaf||'#2a6a2c',B:T.leaf2||'#1e4e22',C:T.leaf3||'#4a9a40'};}
    else if(T.tree==='fir'){g.rect(9,23,3,4,'W');g.poly([[10.5,0],[17,11],[4,11]],'A');g.poly([[10.5,5],[19,18],[2,18]],'A');g.poly([[10.5,11],[20,24],[1,24]],'B');if(T.snowcap)g.px([[10,1],[9,6],[11,6],[7,12],[14,12],[5,19],[16,19]],'S');pal={W:'#4a2e1a',A:T.leaf||'#1f4a38',B:T.leaf2||'#173a2c',S:'#f4faff'};}
    else if(T.tree==='dead'){g.path([[10,27],[10,7]],'W',3);g.path([[10,16],[4,9]],'W',2);g.path([[10,12],[16,5]],'W',2);g.path([[4,9],[2,4]],'W',1);g.path([[16,5],[18,1]],'W',1);g.path([[10,7],[8,2]],'W',1);if(T.moss)g.px([[5,9],[15,6],[10,10]],'M');pal={W:T.trunk||'#4a4038',M:T.moss||'#6a8a4a'};}
    else if(T.tree==='cactus'){g.rect(8,5,5,22,'A');g.rect(3,11,3,9,'A');g.rect(3,18,6,2,'A');g.rect(15,8,3,9,'A');g.rect(12,15,6,2,'A');g.px([[9,7],[9,11],[9,16],[9,21],[4,13],[16,10]],'C');g.px([[10,3],[11,4]],'F');pal={A:'#4a8a3a',C:'#7ac060',F:'#f05a8a'};}
    else if(T.tree==='basalt'){g.poly([[4,27],[6,7],[10,2],[14,8],[16,27]],'A');g.poly([[10,2],[14,8],[16,27],[11,27]],'B');g.px([[9,14],[10,15],[11,20],[8,22],[12,11]],'C');pal={A:'#3a3234',B:'#262022',C:'#ff6a2a'};opt.flat='C';opt.glow='#ff5a1a';}
    else if(T.tree==='crag'){g.poly([[2,27],[6,8],[10,2],[15,9],[18,27]],'A');g.poly([[10,2],[15,9],[18,27],[11,27]],'B');g.ell(9,4,3.5,1.6,'C');g.ell(14,12,2,1,'C');pal={A:'#8a8a98',B:'#6a6a78',C:'#7aa05a'};}
    else{g.poly([[5,27],[8,4],[11,27]],'A');g.poly([[10,27],[13,10],[17,27]],'B');g.poly([[1,27],[3,16],[6,27]],'B');g.px([[8,9],[13,14],[3,18]],'C');pal={A:'#9a6ae0',B:'#5a3a9a',C:'#fff6c8'};opt.flat='C';opt.glow='#8b5fd0';}
  }else if(kind==='bush'){g=P(16,14);g.ell(8,8,7.5,5.5,'A');g.ell(5,6,3,2.5,'C');g.ell(11,7,2.5,2,'C');if(theme==='snow')g.ell(8,4,6,2,'S');pal={A:theme==='void'?'#4a3a6a':theme==='cave'?'#5a4a48':theme==='coast'?'#5a8a3a':'#3a7a34',C:theme==='void'?'#6a5a9a':theme==='cave'?'#8a7a74':'#6ab858',S:'#ffffff'};}
  else if(kind==='rock'){g=P(16,14);g.ell(8,8,7,5.5,'A');g.ell(6,6,3,2,'B');g.px([[11,9],[12,10]],'D');pal={A:T.stone[0],B:T.stone[2],D:T.stone[3]};}
  else if(kind==='chest'||kind==='chestOpen'){g=P(16,14);
    if(kind==='chest'){g.rect(2,4,12,9,'W');g.rect(2,4,12,3,'L');g.rect(2,7,12,1,'G');g.rect(7,7,2,3,'G');g.rect(2,4,1,9,'G');g.rect(13,4,1,9,'G');}
    else{g.rect(2,7,12,6,'W');g.rect(2,2,12,3,'L');g.rect(3,7,10,2,'K');g.rect(2,7,1,6,'G');g.rect(13,7,1,6,'G');}
    pal={W:'#8a5a2a',L:'#a8703a',G:'#f0c050',K:'#2a1a10'};}
  else if(kind==='sign'){g=P(16,16);g.rect(7,8,2,8,'W');g.rect(1,2,14,7,'L');g.rect(3,4,10,1,'K');g.rect(3,6,7,1,'K');pal={W:'#6a4424',L:'#b08a52',K:'#5a3a1a'};opt.flat='K';}
  else if(kind==='waystone'){g=P(16,28);g.poly([[3,27],[5,6],[8,1],[11,6],[13,27]],'A');g.rect(2,25,12,3,'B');g.poly([[8,8],[10,12],[8,16],[6,12]],'C');g.px([[8,19],[7,21],[9,21]],'C');pal={A:'#8a8ea0',B:'#5a5e70',C:'#7af0ff'};opt.flat='C';opt.glow='#7af0ff';}
  else if(kind==='lamp'){g=P(10,26);g.rect(4,8,2,17,'K');g.rect(2,24,6,2,'K');g.rect(2,2,6,6,'M');g.rect(3,3,4,4,'Y');g.rect(4,0,2,2,'M');pal={K:'#2a2a34',M:'#4a4a58',Y:'#ffd870'};opt.flat='Y';}
  else if(kind==='brazier'){g=P(14,18);g.rect(5,10,4,7,'K');g.rect(2,15,10,2,'K');g.ell(7,9,5,2.5,'M');g.poly([[3,8],[7,v?0:2],[11,8]],'F');g.poly([[5,8],[7,v?3:4],[9,8]],'Y');pal={K:'#2a2a34',M:'#5a4a40',F:'#ff7a2a',Y:'#ffe08a'};opt.flat='FY';}
  else if(kind==='barrel'){g=P(12,14);g.ell(6,7,5,6.5,'W');g.rect(1,3,10,1,'M');g.rect(1,10,10,1,'M');g.ell(6,2,4,1.4,'L');pal={W:'#9a6a3a',L:'#b8844a',M:'#5a5a62'};}
  else if(kind==='crate'){g=P(14,13);g.rect(1,1,12,11,'W');g.rect(1,1,12,1,'L');g.line(2,2,12,11,'D');g.line(12,2,2,11,'D');g.rect(1,1,1,11,'D');g.rect(12,1,1,11,'D');pal={W:'#a8783a',L:'#c8984a',D:'#6a4a24'};}
  else if(kind==='hay'){g=P(16,12);g.ell(8,7,7.5,5,'A');g.ell(8,5,6,2.5,'B');g.rect(1,8,14,1,'C');pal={A:'#d8b04a',B:'#f0d070',C:'#a8803a'};}
  else if(kind==='cart'){g=P(18,14);g.rect(1,2,14,6,'W');g.rect(1,2,14,1,'L');g.ell(4,10,3,3,'K');g.ell(13,10,3,3,'K');g.ell(4,10,1,1,'M');g.ell(13,10,1,1,'M');g.line(15,6,18,8,'W');g.ell(8,1,4,2,'H');pal={W:'#8a5a2a',L:'#b0804a',K:'#4a3020',M:'#a8a8b0',H:'#d8b04a'};}
  else if(kind==='stall'){g=P(16,24);const aw=[['#c83a3a','#f4ecdc'],['#3a6ac8','#f4ecdc'],['#3a9a4a','#f6e7a8'],['#c8902a','#f4ecdc']][v%4];
    g.rect(1,4,1,18,'K');g.rect(14,4,1,18,'K');g.rect(0,14,16,8,'W');g.rect(0,14,16,1,'L');
    for(let i=0;i<16;i+=4){g.rect(i,1,2,6,'A');g.rect(i+2,1,2,6,'B');}g.rect(0,7,16,1,'D');
    const goods=[['#e04a3a','#f2c93a','#6ab048'],['#8a5ad0','#3ad0c0','#f06aa8'],['#c8a060','#e8d8b0','#a86a3a'],['#5aa0e0','#f0f0f0','#2a6a9a']][v%4];
    for(let i=0;i<5;i++)g.ell(2+i*3,12.5,1.4,1.4,'G'+i%3);
    pal={K:'#4a3020',W:'#8a5a2a',L:'#b0804a',A:aw[0],B:aw[1],D:shade(aw[0],.6),G0:goods[0],G1:goods[1],G2:goods[2]};
    // PG keys are single chars; remap goods
    g.a=g.a.map(k=>k==='G0'?'1':k==='G1'?'2':k==='G2'?'3':k);pal['1']=goods[0];pal['2']=goods[1];pal['3']=goods[2];}
  else if(kind==='banner'){g=P(12,30);g.rect(2,2,1,27,'K');g.s(2,1,'G');g.rect(3,3,8,14,'A');g.poly([[3,17],[11,17],[7,21]],'A');g.rect(5,7,4,4,'G');g.rect(6,8,2,2,'C');pal={K:'#3a2a1a',A:['#a82a2a','#2a5aa8','#6a2a8a','#2a7a5a','#a86a1a','#4a2a6a'][v%6],G:'#f0c050',C:ELC[ELK[v%8]]};opt.flat='C';}
  else if(kind==='anvil'){g=P(16,12);g.rect(2,2,12,3,'M');g.poly([[14,2],[16,3],[14,4]],'M');g.rect(5,5,6,4,'N');g.rect(3,9,10,2,'N');pal={M:'#6a6a78',N:'#4a4a56'};}
  else if(kind==='fountain'){g=P(32,30);g.ell(16,20,15,8,'S');g.ell(16,19,12,6,'W');g.rect(14,6,4,14,'S');g.ell(16,6,5,2.2,'S');g.ell(16,6,3.5,1.2,'W');
    g.px(v?[[13,9],[19,9],[11,13],[21,13],[16,2]]:[[12,10],[20,10],[16,3],[14,13],[18,13]],'Y');pal={S:'#b8b0a0',W:'#5aa0e0',Y:'#dff4ff'};opt.flat='Y';}
  else if(kind==='grave'){g=P(12,16);g.rect(2,5,8,10,'A');g.ell(6,5,4,3,'A');g.rect(5,4,2,6,'D');g.rect(3,6,6,2,'D');g.rect(1,14,10,2,'B');pal={A:T.stone[0],B:T.stone[1],D:T.stone[3]};}
  else if(kind==='standing'){g=P(12,26);g.poly([[2,25],[3,4],[6,0],[9,3],[10,25]],'A');g.px([[5,9],[6,10],[5,11],[6,15],[5,16]],'C');g.ell(5,20,2,1.5,'M');pal={A:T.stone[1],C:'#7af0ff',M:'#6a9a4a'};opt.flat='C';}
  else if(kind==='ruinwall'){g=P(16,22);g.rect(0,6,16,16,'A');g.poly([[0,6],[4,2],[7,6],[10,0],[16,4],[16,6]],'A');for(let r=8;r<22;r+=4)g.rect(0,r,16,1,'D');g.ell(4,10,3,2,'M');pal={A:T.stone[0],D:T.stone[1],M:'#5a8a4a'};}
  else if(kind==='pillar'){g=P(12,28);
    if(theme==='cave'||theme==='void'){g.poly([[3,27],[6,2],[9,27]],'A');g.poly([[6,27],[8,10],[11,27]],'B');g.px([[6,8],[8,16]],'C');pal={A:theme==='cave'?'#c890ff':'#8a5fd0',B:theme==='cave'?'#8a5ad0':'#5a3a9a',C:'#ffffff'};opt.flat='C';opt.glow=theme==='cave'?'#c890ff':'#8b5fd0';}
    else{g.rect(3,6,6,20,'A');g.rect(2,4,8,3,'B');g.rect(2,25,8,2,'B');g.rect(5,6,1,20,'D');g.poly([[3,4],[6,0],[9,4]],'A');pal={A:T.stone[0],B:T.stone[2],D:T.stone[1]};}}
  else if(kind==='tent'){const tc=['#c8a87a','#a85a5a','#5a7aa8'][v%3];g=P(20,18);g.poly([[10,0],[19,16],[1,16]],'A');g.poly([[10,0],[5,16],[1,16]],'L');g.poly([[10,0],[19,16],[14,16]],'B');g.poly([[10,0],[13,16],[7,16]],'B');g.poly([[10,7],[12,16],[8,16]],'K');g.rect(1,15,18,1,'H');g.line(10,0,10,-2,'W');g.px([[10,-2]],'F');pal={A:tc,L:tint(tc,.22),B:shade(tc,.78),H:shade(tc,.55),K:'#2a1a12',W:'#6a4424',F:'#f6e7a8'};opt.flat='F';}
  else if(kind==='fence'){g=P(16,14);pal={W:'#9a7448',L:'#b89058'};}
  else if(kind==='tower'){g=P(22,34);g.rect(2,12,18,21,'A');for(let r=14;r<33;r+=4)g.rect(2,r,18,1,'D');g.rect(1,8,20,5,'B');for(let i=1;i<21;i+=5)g.rect(i,4,3,4,'B');g.rect(9,18,4,7,'K');g.rect(10,19,2,5,'Y');g.line(11,4,11,-3,'W');g.rect(12,-3,6,4,'F');pal={A:T.stone[0],B:T.stone[2],D:T.stone[1],K:OUTC,Y:'#ffd98a',W:'#3a2a1a',F:['#a82a2a','#2a5aa8','#c8a02a','#6a2a8a','#2a8a6a','#4a2a6a'][0]};opt.flat='YK';}
  return OBJ_CACHE[key]=paint(g,pal,opt);
}
objCanvas=HOOK.def('objCanvas',objCanvas);
function fenceDraw(ctx,m,x,y){
  const px=x*TS,py=y*TS,isF=(dx,dy)=>tileAt(m,x+dx,y+dy)==='F';
  const f=(c,a,b,w,h)=>{ctx.fillStyle=c;ctx.fillRect(px+a,py+b,w,h);};
  const W='#9a7448',L='#c8a068',D='#5a3e22';
  f(D,6,2,4,13);f(W,6,2,3,12);f(L,6,2,1,12);
  if(isF(-1,0)||isF(1,0)){const a=isF(-1,0)?0:6,b=isF(1,0)?16:10;f(D,a,5,b-a,3);f(W,a,5,b-a,2);f(D,a,10,b-a,3);f(W,a,10,b-a,2);}
  if(isF(0,-1)){f(D,7,0,2,3);f(W,7,0,1,3);}if(isF(0,1)){f(D,7,14,2,2);f(W,7,14,1,2);}
}
function shadowAt(ctx,cx,cy,rx,ry){ctx.fillStyle='rgba(10,6,24,.22)';for(let j=-ry;j<=ry;j++){const w=Math.round(rx*Math.sqrt(1-(j*j)/(ry*ry)));ctx.fillRect(cx-w,cy+j,w*2,1);}}
function drawObjects(ctx,m,y){
  for(let x=0;x<m.w;x++){
    const c=tileAt(m,x,y),px=x*TS,py=y*TS,th=m.theme,v=(x*31+y*17)%5;
    const at=(cv,ox,oy)=>ctx.drawImage(cv,px+ox,py+16-cv.height+oy);
    if(c==='T'){shadowAt(ctx,px+8,py+14,8,3);at(objCanvas(th,'tree',v%2),-3,2);}
    else if(c==='t'){shadowAt(ctx,px+8,py+14,7,2);at(objCanvas(th,'bush'),-1,1);}
    else if(c==='R'){shadowAt(ctx,px+8,py+14,7,2);at(objCanvas(th,'rock'),-1,1);}
    else if(c==='C')at(objCanvas(th,'chest'),-1,0);
    else if(c==='c')at(objCanvas(th,'chestOpen'),-1,0);
    else if(c==='S')at(objCanvas(th,'sign'),-1,1);
    else if(c==='F')fenceDraw(ctx,m,x,y);
    else if(c==='W'){shadowAt(ctx,px+8,py+14,6,2);at(objCanvas(th,'waystone'),-1,1);}
    else if(c==='L'){at(objCanvas(th,'lamp'),2,1);}
    else if(c==='b'){shadowAt(ctx,px+8,py+14,5,2);at(objCanvas(th,'barrel'),1,0);}
    else if(c==='x'){shadowAt(ctx,px+8,py+14,6,2);at(objCanvas(th,'crate'),0,0);}
    else if(c==='h'){at(objCanvas(th,'hay'),-1,0);}
    else if(c==='k'){shadowAt(ctx,px+8,py+14,8,2);at(objCanvas(th,'cart'),-2,0);}
    else if(c==='m'){at(objCanvas(th,'stall',x+y),-1,0);}
    else if(c==='u'){at(objCanvas(th,'banner',realmOf(m.s)),1,0);}
    else if(c==='a'){at(objCanvas(th,'anvil'),-1,0);}
    else if(c==='g'){at(objCanvas(th,'grave'),1,0);}
    else if(c==='N'){shadowAt(ctx,px+8,py+14,5,2);at(objCanvas(th,'standing'),1,1);}
    else if(c==='Q'){at(objCanvas(th,'ruinwall'),-1,1);}
    else if(c==='P'){shadowAt(ctx,px+8,py+14,5,2);at(objCanvas(th,'pillar'),1,1);}
    else if(c==='e'){shadowAt(ctx,px+8,py+14,9,2);at(objCanvas(th,'tent',v),-3,1);}
    else if(c==='Y'){shadowAt(ctx,px+8,py+15,10,3);at(objCanvas(th,'tower'),-4,1);}
    else if(c==='O'&&tileAt(m,x-1,y)!=='O'&&tileAt(m,x,y-1)!=='O'){/* fountain drawn by the dynamic layer */}
  }
  m.bld.filter(b=>b.y+b.h-1===y).forEach(b=>bakeBuilding(m,b));
}
drawObjects=HOOK.def('drawObjects',drawObjects);
// v0.3.3: each building is its own sprite so it can be depth sorted against the party and townsfolk
const BSP_X=10,BSP_TOP=52;
function bakeBuilding(m,b){const cv=mkCv(b.w*TS+BSP_X*2,b.h*TS+BSP_TOP+6),c=cv.getContext('2d');c.translate(BSP_X-b.x*TS,BSP_TOP-b.y*TS);drawBuilding(c,m,b);(m.bsp=m.bsp||[]).push({b,cv});}
// ----- buildings -----
function drawBuilding(ctx,m,b){
  const T=THM(m),x0=b.x*TS,y0=b.y*TS,w=b.w*TS,h=b.h*TS,R=mulberry(b.x*97+b.y*13+realmOf(m.s));
  const f=(c,x,y,ww,hh)=>{ctx.fillStyle=c;ctx.fillRect(x0+x,y0+y,ww,hh);};
  const k=b.k;
  let mat=T.mat,roofKind=T.roofKind,roof=T.roof[Math.floor(R()*T.roof.length)];
  if(k==='guild'||k==='keep'||k==='chapel'||k==='tower'||k==='windmill')mat=m.theme==='void'?'tent':'stone';
  if(k==='inn')roof=T.roof[0];if(k==='tavern')roof=T.roof[1];if(k==='smithy'){roof=T.roof[2];if(mat!=='tent')mat=mat==='log'?'log':'stone';}
  if(k==='guild')roof=T.roof[3];if(k==='workshop'&&roofKind!=='thatch')roof='#3a7a52';
  if((k==='guild'||k==='chapel')&&roofKind!=='snowy'){roofKind='slate';roof=k==='chapel'?'#5a6478':'#4a4a6a';}
  if(mat==='tent'||k==='bigtent')return drawTent(ctx,m,b);
  if(k==='keep'||k==='tower')return drawKeep(ctx,m,b);
  const S=T.stone,roofH=Math.floor(h*.5),wy=roofH-1;
  // walls
  const wallBase={timber:'#efe2c0',white:'#f6f2e8',stone:S[0],log:'#9a6a3a'}[mat];
  f(OUTC,-1,wy-1,w+2,h-wy+2);f(wallBase,0,wy,w,h-wy);
  if(mat==='timber'){const beam='#5a3a20';f(beam,0,wy,w,2);f(beam,0,wy+Math.floor((h-wy)/2)-1,w,2);for(let i=0;i<w;i+=12){f(beam,i,wy,2,h-wy);if(i+12<=w){for(let s=0;s<10;s++){f(beam,i+2+s,wy+2+Math.floor(s*.8),1,1);f(beam,i+11-s,wy+2+Math.floor(s*.8),1,1);}}}f(beam,w-2,wy,2,h-wy);}
  if(mat==='white'){for(let i=0;i<6;i++)f('#e4ded0',Math.floor(R()*(w-4)),wy+3+Math.floor(R()*(h-wy-8)),3,1);f('#3a6a9a',0,wy,2,h-wy);f('#3a6a9a',w-2,wy,2,h-wy);}
  if(mat==='stone'){for(let r=wy;r<h;r+=4){const off=((r-wy)/4)%2?0:5;for(let i=-off;i<w;i+=10){const col=R()<.3?S[2]:R()<.5?S[0]:shade(S[0],.92);f(col,Math.max(0,i),r,Math.min(9,w-Math.max(0,i)),3);}f(S[1],0,r+3,w,1);}if(R()<.7)f('#5a8a4a',2,h-6,6,2);}
  if(mat==='log'){for(let r=wy;r<h;r+=4){f('#9a6a3a',0,r,w,3);f('#b8844a',0,r,w,1);f('#5a3a20',0,r+3,w,1);f('#c8a070',0,r,3,3);f('#c8a070',w-3,r,3,3);f('#8a5a2a',1,r+1,1,1);f('#8a5a2a',w-2,r+1,1,1);}}
  f(S[1],0,h-4,w,4);f(S[2],0,h-4,w,1);for(let i=0;i<w;i+=6)f(S[3],i,h-3,1,3);
  // roof
  const rt=-6;
  f(OUTC,-5,rt-1,w+10,roofH-rt+3);
  for(let yy=rt;yy<roofH;yy++){const inset=Math.max(0,Math.floor((roofH-yy)/4)-1);
    let col=roof;if(roofKind==='thatch')col=(yy+Math.floor(R()*2))%3===0?shade('#c8a050',.8):'#d4ae5a';
    if(roofKind==='tile')col=(yy%4===3)?shade(roof,.7):roof;
    if(roofKind==='slate')col=(yy%3===2)?shade(roof,.65):roof;
    if(roofKind==='snowy')col=yy<rt+Math.floor((roofH-rt)*.5)?'#f4faff':((yy%3===2)?shade(roof,.7):roof);
    f(col,-4+inset,yy,w+8-inset*2,1);
    if(roofKind==='tile'&&yy%4===1)for(let i=-4+inset;i<w+4-inset;i+=4)f(shade(roof,.8),i,yy,1,2);
    if(roofKind==='slate'&&yy%3===0)for(let i=-4+inset+(yy%2)*3;i<w+4-inset;i+=6)f(shade(roof,.7),i,yy,1,2);
    if(roofKind==='thatch'&&R()<.5)f('#f0d070',-4+inset+Math.floor(R()*(w+8-inset*2)),yy,3,1);
  }
  const ridge=roofKind==='thatch'?'#8a6a2a':roofKind==='snowy'?'#ffffff':shade(roof,.55);
  f(ridge,-4+Math.floor((roofH-rt)/4)-1,rt,w+8-(Math.floor((roofH-rt)/4)-1)*2,2);
  f(roofKind==='snowy'?'#d8e8f4':shade(roof,.45),-4,roofH-2,w+8,2);
  if(roofKind==='snowy')for(let i=-2;i<w+4;i+=5)f('#dff4ff',i,roofH,1,2+(i%3));
  f('rgba(10,6,24,.35)',0,roofH,w,3);
  // chimney
  if(k!=='guild'&&k!=='chapel'&&k!=='windmill'){const cx=Math.floor(w*.72);f(OUTC,cx-1,rt-8,8,10);f(S[1],cx,rt-7,6,9);f(S[2],cx,rt-7,6,1);f(S[3],cx,rt-2,6,1);m.smoke=m.smoke||[];if(!m.smoke.some(s=>s[0]===x0+cx+3&&s[1]===y0+rt-8))m.smoke.push([x0+cx+3,y0+rt-8]);}
  // windows
  const win=(wx,wyy)=>{f(OUTC,wx-1,wyy-1,10,11);f('#5a3a20',wx,wyy,8,9);f('#ffd98a',wx+1,wyy+1,6,7);f('#fff2c0',wx+1,wyy+1,2,2);f('#5a3a20',wx+4,wyy+1,1,7);f('#5a3a20',wx+1,wyy+4,6,1);
    if(k!=='smithy'&&mat!=='stone'){f(roof,wx-3,wyy,2,9);f(roof,wx+9,wyy,2,9);f('#6a4a2a',wx-1,wyy+9,10,2);for(let i=0;i<4;i++)f(T.dec[(i+Math.floor(R()*4))%4],wx+i*2,wyy+8,2,1);}};
  const wyy=wy+4,doorX=(b.door[0]-b.x)*TS;
  if(k==='windmill'){drawWindmillBody(ctx,m,b);}
  if(w>=64){win(6,wyy);win(w-14,wyy);if(w>=96){win(Math.floor(w/2)-20,wyy);win(Math.floor(w/2)+12,wyy);}}else win(w>48?8:4,wyy);
  // door
  /* v0.15.8: a taller door (22 px) wherever the wall below the roof can hold it, so a wayfarer (about 35 px) no longer towers over the doorway; two-tile houses keep the 16 px door */
  const dh=16,dy=h-dh,hy=Math.round(dh*.4);/* v0.16.1: back to 16 px doors (the 22 px ones looked out of place) */f(OUTC,doorX+1,dy-1,14,dh+1);f(S[1],doorX+2,dy,12,dh);f('#4a2a14',doorX+3,dy+1,10,dh-1);f('#7a4a24',doorX+4,dy+3,8,dh-3);f('#5a3418',doorX+7,dy+3,1,dh-3);
  f('#7a4a24',doorX+5,dy+1,6,2);f('#c8c8d0',doorX+5,dy+hy,1,1);f('#c8c8d0',doorX+10,dy+hy,1,1);f('#f0c050',doorX+10,dy+hy+3,1,2);
  // lantern by the door
  f('#2a2a34',doorX+15,dy+2,1,4);f('#ffd870',doorX+15,dy+3,2,3);m.lights=m.lights||[];m.lights.push([x0+doorX+16,y0+dy+4,18]);
  // hanging sign or emblem
  const ic={inn:[[2,4,8,2,'#5a6ab0'],[2,3,3,1,'#ffffff'],[2,6,1,1,'#5a3a1a'],[9,6,1,1,'#5a3a1a']],tavern:[[3,2,5,5,'#e0a030'],[3,2,5,1,'#ffffff'],[8,3,2,3,'#c08020']],smithy:[[2,5,8,2,'#6a6a7a'],[4,3,4,2,'#8a8a9a'],[5,1,1,4,'#c0c0d0']],workshop:[[4,1,4,1,'#8a8a9a'],[5,2,2,2,'#c8c8d0'],[3,4,6,4,'#3aa860'],[4,5,2,1,'#b8f0c8'],[9,1,2,3,'#5a3a1a'],[8,1,3,1,'#9a9aa8']],guild:[[3,1,6,6,'#b8483a'],[5,2,2,4,'#f0c050'],[3,7,1,1,'#b8483a'],[8,7,1,1,'#b8483a']],house:null,chapel:null,windmill:null}[k];
  if(ic){const sx=doorX-14,sy=dy-2;f('#3a2a1a',sx+5,sy-3,10,1);f('#3a2a1a',sx+6,sy-3,1,3);f(OUTC,sx-1,sy-1,14,11);f('#d8c090',sx,sy,12,9);f('#b89860',sx,sy+8,12,1);ic.forEach(([a,bb,ww,hh,c])=>f(c,sx+a,sy+bb,ww,hh));}
  if(k==='guild'){[[4,'#a82a2a'],[w-12,'#a82a2a']].forEach(([bx,col])=>{f('#3a2a1a',bx,wy,8,1);f(col,bx+1,wy+1,6,h-wy-12);f('#f0c050',bx+3,wy+4,2,4);f(col,bx+1,h-12,2,2);f(col,bx+5,h-12,2,2);});f('#f0c050',doorX+4,dy-6,8,4);f('#a82a2a',doorX+6,dy-5,4,2);}
  if(k==='chapel'){const sx=Math.floor(w/2)-8;f(OUTC,sx-1,rt-20,18,22);f(S[0],sx,rt-19,16,21);for(let r=rt-19;r<rt+2;r+=4)f(S[1],sx,r,16,1);
    for(let i=0;i<10;i++)f(shade(roof,.8),sx+i-1,rt-20-i+ (i>4?0:0),18-i*2+2,1);f(roof,sx+2,rt-29,12,9);f(shade(roof,.6),sx+7,rt-35,2,8);f('#f0c050',sx+5,rt-33,6,1);
    f(OUTC,sx+3,rt-14,10,10);const glass=['#e04a4a','#3a8ae0','#f2c93a','#6ab048'];for(let j=0;j<8;j++)for(let i=0;i<8;i++){if((i-3.5)**2+(j-3.5)**2<16)f(glass[(i+j)%4],sx+4+i,rt-13+j,1,1);}}
}
drawBuilding=HOOK.def('drawBuilding',drawBuilding);// v0.20.6: towns14.js paints a realm's own building family through a hook
function drawWindmillBody(ctx,m,b){m.mills=m.mills||[];const cx=b.x*TS+b.w*TS/2,cy=b.y*TS+2;if(!m.mills.some(q=>q[0]===cx))m.mills.push([cx,cy]);}
function drawKeep(ctx,m,b){
  const T=THM(m),S=T.stone,x0=b.x*TS,y0=b.y*TS,w=b.w*TS,h=b.h*TS,R=mulberry(b.x*11+b.y);
  const f=(c,x,y,ww,hh)=>{ctx.fillStyle=c;ctx.fillRect(x0+x,y0+y,ww,hh);};
  const top=-10;
  f(OUTC,-1,top-1,w+2,h-top+2);f(S[0],0,top,w,h-top);
  for(let r=top+8;r<h;r+=5){const off=((r-top)/5)%2?0:6;for(let i=-off;i<w;i+=12){f(R()<.3?S[2]:shade(S[0],R()<.5?1:.92),Math.max(0,i),r,Math.min(11,w-Math.max(0,i)),4);}f(S[1],0,r+4,w,1);}
  f(S[2],0,top+4,w,4);for(let i=0;i<w;i+=8){f(S[0],i,top,5,5);f(S[2],i,top,5,1);f(OUTC,i+5,top,3,4);}
  [[8,top+14],[w-12,top+14],[Math.floor(w/2)-2,top+12]].forEach(([sx,sy])=>{f(OUTC,sx,sy,4,10);f('#ffd98a',sx+1,sy+2,2,6);});
  const dx=(b.door[0]-b.x)*TS,dy=h-20;f(OUTC,dx-2,dy-2,20,22);f(S[1],dx-1,dy-1,18,21);f('#3a2414',dx+1,dy+2,14,18);for(let i=0;i<14;i+=3)f('#2a1a0e',dx+1+i,dy+2,1,18);f('#5a5a68',dx+1,dy+8,14,1);
  if(b.k==='keep'){const fx=Math.floor(w/2);f('#3a2a1a',fx,top-20,1,20);f(['#a82a2a','#2a5aa8','#c8a02a','#6a2a8a','#2a8a6a','#4a2a6a'][realmOf(m.s)],fx+1,top-19,10,7);f('#f0c050',fx+4,top-17,3,3);}
  m.lights=m.lights||[];m.lights.push([x0+dx+8,y0+dy+10,20]);
}
function drawTent(ctx,m,b){
  // v0.12.13: a tent is a cone of cloth, not a flat triangle: panels that converge on the pole, the left face lit and the right in shade,
  // a darker hem that sags between pegs, guy ropes to pegs, a shadow at the base and a brighter cap under the pennant. The 2D town and
  // the HD-2D billboard both draw from this canvas.
  const x0=b.x*TS,y0=b.y*TS,w=b.w*TS,h=b.h*TS,R=mulberry(b.x*7+b.y*5);
  const f=(c,x,y,ww,hh)=>{ctx.fillStyle=c;ctx.fillRect(x0+x,y0+y,ww,hh);};
  const col={inn:'#4a72b8',tavern:'#b84a4a',smithy:'#5a5a66',guild:'#7a4ab0',bigtent:'#3a9a6a',workshop:'#3a8a5a'}[b.k]||['#c8a87a','#b89a6a','#a8987a'][Math.floor(R()*3)];
  const lit=tint(col,.22),lit2=tint(col,.42),dk=shade(col,.78),dk2=shade(col,.58),seam=shade(col,.45),alt=tint(col,.10),altdk=shade(alt,.78);
  const top=-10,cx=Math.floor(w/2),H=h-top,N=Math.max(4,Math.round(w/14)*2);// N panels, even, so a seam runs down the middle
  const halfAt=yy=>Math.round(3+((yy-top)/H)*(w/2+1));
  for(let yy=top;yy<h;yy++){const half=halfAt(yy)+1;f(OUTC,cx-half-1,yy,half*2+2,1);}
  for(let yy=top+1;yy<h-1;yy++){const half=halfAt(yy),p=(yy-top)/H;
    for(let x=-half;x<half;x++){const u=x/half;// -1 left edge .. 1 right edge
      const k=Math.floor((u+1)/2*N),ab=k%2===0;let c=ab?col:alt;
      if(u<-.72)c=ab?lit2:tint(alt,.3);else if(u<-.3)c=ab?lit:tint(alt,.12);else if(u>.74)c=dk2;else if(u>.28)c=ab?dk:altdk;
      if(p>.86)c=shade(c,.86);if(p<.12)c=tint(c,.15);
      f(c,cx+x,yy,1,1);}
    for(let k=1;k<N;k++){const sx=cx-half+Math.round(k/N*half*2);if(sx>cx-half&&sx<cx+half)f(seam,sx,yy,1,1);}}
  // the hem: a darker band that sags between the pegs, and the cloth's shadow on the ground
  {const half=halfAt(h-1);for(let x=-half;x<half;x++){const sag=Math.abs(((x+half)%12)-6)<2?1:0;f(shade(col,.62),cx+x,h-2-sag,1,1+sag);}f('rgba(0,0,0,.35)',cx-half-3,h-1,half*2+6,2);}
  // guy ropes from the mid height to pegs on the ground, left and right
  {const ym=Math.round(top+H*.55),hm=halfAt(ym),hb=halfAt(h-1);[[-1,hm,hb],[1,hm,hb]].forEach(([s,a,bb])=>{const x1=cx+s*a,y1=ym,x2=cx+s*(bb+7),y2=h-2;const n=Math.max(Math.abs(x2-x1),Math.abs(y2-y1));
    for(let i=0;i<=n;i++)f('#d8c8a0',Math.round(x1+(x2-x1)*i/n),Math.round(y1+(y2-y1)*i/n),1,1);f('#6a4a2a',x2-1,y2-1,2,3);});}
  // the pole, a brighter cap and the pennant
  f(lit2,cx-1,top+1,3,3);f('#3a2a1a',cx,top-6,1,7);f('#f6e7a8',cx+1,top-6,6,3);f('#d8c080',cx+1,top-4,6,1);
  const dx=(b.door[0]-b.x)*TS;for(let yy=0;yy<14;yy++){const hw=Math.round(2+yy*.45);f('#1a1010',dx+8-hw,h-14+yy,hw*2,1);}
  for(let yy=0;yy<14;yy++){const hw=Math.round(2+yy*.45);f(lit,dx+8-hw-1,h-14+yy,1,1);f(dk2,dx+8+hw,h-14+yy,1,1);}f('#ffd98a',dx+6,h-6,4,4);
  m.lights=m.lights||[];m.lights.push([x0+dx+8,y0+h-4,22]);
  const ic={inn:[[2,4,8,2,'#5a6ab0'],[2,3,3,1,'#ffffff']],tavern:[[3,2,5,5,'#e0a030'],[3,2,5,1,'#ffffff'],[8,3,2,3,'#c08020']],smithy:[[2,5,8,2,'#6a6a7a'],[4,3,4,2,'#8a8a9a'],[5,1,1,4,'#c0c0d0']],workshop:[[4,1,4,1,'#8a8a9a'],[5,2,2,2,'#c8c8d0'],[3,4,6,4,'#3aa860'],[4,5,2,1,'#b8f0c8'],[9,1,2,3,'#5a3a1a'],[8,1,3,1,'#9a9aa8']],guild:[[3,1,6,6,'#b8483a'],[5,2,2,4,'#f0c050']]}[b.k];
  if(ic){const sx=dx+18,sy=h-22;f('#3a2a1a',sx+5,sy-4,1,4);f(OUTC,sx-1,sy-1,14,11);f('#d8c090',sx,sy,12,9);f('#b8a070',sx,sy+8,12,1);ic.forEach(([a,bb,ww,hh,c])=>f(c,sx+a,sy+bb,ww,hh));}
  if(b.k==='guild'){f('#3a2a1a',cx-1,top-14,1,10);f('#b8483a',cx,top-14,8,5);f('#f0c050',cx+3,top-13,2,2);}
}
function buildMapCanvas(m,frame){
  m.lights=[];m.smoke=[];m.bsp=[];
  const cv=mkCv(m.w*TS,m.h*TS),ctx=cv.getContext('2d');
  for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++)drawTile(ctx,m,x,y,frame);
  for(let y=0;y<m.h;y++)drawObjects(ctx,m,y);
  return cv;
}
buildMapCanvas=HOOK.def('buildMapCanvas',buildMapCanvas);// v0.19.6: worldart13.js stands the field entrances in the depth sort (m.bsp)

