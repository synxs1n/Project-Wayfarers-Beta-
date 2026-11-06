// =================== HERO RACES, SIZES & NEW WEAPONS ===================
// Heroes now render on a 36x40 canvas so big folk, wings, halos and ears fit. Feet sit on row 36.
HP.hair.flame={ear:1,p:[[8,-2,["...H...H.H.....","..HH..HHHH.H...",".HHHH.HHHHHHH..","HHHHHHHHHHHHHH.",".HHHHHHHHHHHHHH","HHHHHHHHHHHHHH.",".HHHHH.HHH.H.HH",".HHHH..........","HHHHH..........",".HHH..........."]]]};
HAIR_FB.flame={f:["..H..H","..HHHH",".HHHHH","HHHHHH",".HHHHH","HH.H.H","HH....","HH....","H....."],b:10,spike:1};
// new weapons, side view (hand at 20,17; crossbow uses the extended arm at 22,15)
WPN.katana={draw(g){g.path([[21,16],[21,9],[22,4],[24,0]],'M');g.path([[22,15],[22,9],[23,4]],'w');g.rect(19,16,5,1,'G');g.rect(21,19,1,2,'K');}};
WPN.scythe={draw(g){g.line(21,0,21,29,'W');g.poly([[21,0],[13,-1],[6,2],[2,7],[8,4],[14,2],[21,2]],'M');g.path([[3,6],[8,3],[14,1]],'w');g.rect(20,1,3,1,'G');}};
WPN.trident={draw(g){g.line(21,3,21,29,'W');g.rect(18,2,7,1,'G');g.rect(18,-2,1,4,'M');g.rect(21,-4,1,6,'M');g.rect(24,-2,1,4,'M');g.px([[18,-3],[21,-5],[24,-3]],'w');}};
WPN.mace={draw(g){g.line(21,9,21,23,'W');g.ell(21.5,5.5,3.3,3.3,'M');g.px([[21,1],[16,5],[26,5],[21,10],[18,2],[25,2]],'N');g.rect(19,9,5,1,'G');}};
WPN.crossbow={x:1,draw(g){g.rect(17,15,10,2,'W');g.path([[26,9],[27,12],[27,19],[26,22]],'M');g.line(24,10,24,21,'w');g.rect(19,14,10,1,'M');g.s(29,14,'G');}};
WPN.fan={draw(g){for(let a=-150;a<=-30;a+=4){const r=a*Math.PI/180;g.line(21,17,21+Math.cos(r)*8,17+Math.sin(r)*8,'Q');}for(let a=-150;a<=-30;a+=20){const r=a*Math.PI/180;g.line(21,17,21+Math.cos(r)*8,17+Math.sin(r)*8,'G');}}};
const _weaponFB0=weaponFB;
weaponFB=function(g,L,view){
  const w=L.wpn||'none',front=view==='front',hx=8,hy=18;
  if(!['katana','scythe','trident','mace','crossbow','fan'].includes(w))return _weaponFB0(g,L,view);
  const hk=HP.body[L.b].hand;
  if(front){
    if(w==='katana'){g.path([[hx,hy-1],[hx,hy-8],[hx-1,hy-13]],'M');g.rect(hx-1,hy-1,4,1,'G');}
    if(w==='scythe'){g.line(hx+1,hy-17,hx+1,hy+10,'W');g.poly([[hx+1,hy-17],[hx+9,hy-16],[hx+13,hy-12],[hx+7,hy-15]],'M');}
    if(w==='trident'){g.line(hx+1,hy-14,hx+1,hy+10,'W');g.rect(hx-2,hy-15,7,1,'G');g.rect(hx-2,hy-19,1,4,'M');g.rect(hx+1,hy-20,1,5,'M');g.rect(hx+4,hy-19,1,4,'M');}
    if(w==='mace'){g.line(hx+1,hy-8,hx+1,hy+3,'W');g.ell(hx+1.5,hy-10,3,3,'M');g.px([[hx+1,hy-14],[hx-3,hy-10],[hx+5,hy-10]],'N');}
    if(w==='crossbow'){g.rect(12,17,8,2,'W');g.rect(10,15,12,1,'M');g.px([[9,16],[22,16]],'M');}
    if(w==='fan'){for(let a=180;a<=330;a+=5){const r=a*Math.PI/180;g.line(hx+1,hy,hx+1+Math.cos(r)*6,hy+Math.sin(r)*6,'Q');}g.px([[hx-4,hy-2],[hx-2,hy-5],[hx+2,hy-5]],'G');}
    g.rect(hx,hy,2,2,hk);
    if(L.sh==='kite')g.rows(21,14,["MMMMMM","MZZZZM","MZGGZM","MZZZZM",".MZZM.","..MM.."]);
  }else{
    if(['katana','scythe','trident','mace'].includes(w))g.line(10,7,21,26,w==='katana'||w==='mace'?'M':'W',2);
    if(w==='scythe')g.poly([[10,5],[18,3],[22,6],[16,6]],'M');
    if(w==='trident'){g.rect(7,3,7,1,'G');g.rect(7,0,1,3,'M');g.rect(10,-1,1,4,'M');g.rect(13,0,1,3,'M');}
    if(w==='mace')g.ell(9.5,5.5,3,3,'M');
    if(w==='crossbow'){g.rect(11,14,10,6,'W');g.rect(10,13,12,1,'M');}
    if(w==='fan')g.ell(21,17,3,2,'Q');
    if(L.sh==='kite')g.rows(12,13,["MMMMMMMM","MZZZZZZM","MZZGGZZM","MZGGGGZM","MZZGGZZM",".MZZZZM.","..MZZM..","...MM..."]);
  }
};
// draw a part only into empty cells, so it sits behind what is already there
function behind(g,fn){const t=new PG(g.w,g.h,g.ox,g.oy);fn(t);for(let i=0;i<g.a.length;i++)if(!g.a[i]&&t.a[i])g.a[i]=t.a[i];}
function tailKind(L){return L.ears==='cat'?'cat':L.ears==='fox'?'fox':L.ears==='wolf'?'wolf':L.crest?'lizard':'cat';}
function raceSide(g,L){
  const hooded=L.hat==='hood'||L.hat==='greathelm';
  behind(g,t=>{
    if(L.tail){const k=tailKind(L);
      if(k==='cat')t.path([[12,20],[8,21],[5,19],[4,15],[6,12]],'T',2);
      if(k==='fox'){t.ell(7,22,4.5,3.2,'T');t.ell(10,20,3,2.2,'T');t.ell(3.5,23.5,2.2,2,'w');}
      if(k==='wolf')t.path([[12,19],[8,21],[5,24],[4,27]],'T',3);
      if(k==='lizard'){t.poly([[13,19],[13,24],[4,29],[0,31],[2,28]],'T');t.px([[10,22],[7,25],[4,27]],'h');}}
    if(L.wings==='feather'){t.poly([[13,12],[7,5],[2,5],[0,9],[1,15],[4,21],[9,23],[13,19]],'U');for(let i=0;i<4;i++)t.line(3+i*2,8+i,5+i*2,20,'u');}
    if(L.wings==='fae'){t.ell(7,11,5.5,4.2,'U');t.ell(7,19,4,3,'u');t.px([[5,10],[8,12],[6,19]],'w');}
  });
  if(L.tusks)g.px([[19,9],[19,10],[17,10]],'w');
  if(L.glasses)g.px([[15,6],[16,6],[17,6],[18,6],[19,6],[20,6],[15,7],[17,7],[18,7],[20,7]],'M');
  if(L.fur)g.rows(9,11,["...FFFFFFFF..",".FFFFFFFFFFFF","FFFFFFFFFFFFF"]);
  if(L.marks)g.px([[15,14],[16,15],[17,16],[18,17],[17,9],[18,9],[13,15],[13,17]],'X');
}
function raceTop(g,L){
  const hooded=L.hat==='hood'||L.hat==='greathelm';
  if(L.ears&&!hooded||L.ears==='long'||L.ears==='fin'){
    if(L.ears==='long')g.px([[11,7],[10,6],[9,5],[8,4],[10,7]],'S');
    if(L.ears==='fin')g.rows(7,5,["..V.","VVVV",".VVV","..VV"]);
    if(L.ears==='cat'){g.rows(12,0,["H...","HH..","HrH."]);g.rows(16,0,["..H.",".HH.","HrH."]);}
    if(L.ears==='fox'){g.rows(11,-2,["H...","HH..","HrH.","HrHH"]);g.rows(16,-2,["...H","..HH",".HrH","HHrH"]);}
    if(L.ears==='wolf'){g.rows(11,-3,["H..","HH.","HHH","HrH","HHH"]);g.rows(16,-2,["..H",".HH","HHH","HrH"]);}
  }
  if(L.crest)g.px([[12,2],[13,1],[14,0],[15,1],[16,0],[17,1],[11,3],[10,4],[11,5]],'T');
  if(L.antlers){g.path([[14,2],[13,-1],[11,-3]],'I');g.path([[13,0],[15,-3]],'I');g.path([[17,2],[18,-1],[20,-3]],'I');g.path([[18,0],[17,-2]],'I');}
  if(L.halo){const hy=L.hat?-6:-3;g.rows(12,hy,[".OOOOOO.","O......O",".OOOOOO."]);}
  if(L.hair==='flame')g.px([[11,-2],[15,-2],[17,-2],[19,-1],[8,2],[22,3],[13,-1]],'D');
}
function raceFB(g,L,view,pass){
  const front=view==='front',hooded=L.hat==='hood'||L.hat==='greathelm';
  if(pass==='under'){
    if(L.wings==='feather'&&front){g.sym(1,8,["....UU","..UUUU",".UUUUu","UUUUu.","UUUu..",".Uu...","..u..."]);}
    if(L.wings==='fae'&&front){g.sym(2,8,[".UUU..","UUUUU.","UUUUU.",".UUu..","..uuu.","..uu.."]);}
    if(L.tail&&front){const k=tailKind(L);if(k==='fox'){g.ell(24,24,2.6,2.2,'T');g.s(26,25,'w');}else g.path([[21,22],[24,24],[25,27]],'T',2);}
    return;
  }
  if(!front){
    if(L.wings==='feather')g.sym(4,9,["..UUUU","UUUUUU","UUUUUu",".UUUuu",".UUuu.","..Uu..","...u.."]);
    if(L.wings==='fae')g.sym(4,9,[".UUU..","UUUUU.","UUUUU.",".UUu..","..uuu.","..uu.."]);
    if(L.tail){const k=tailKind(L);if(k==='fox'){g.ell(16,27,3.4,3,'T');g.ell(16,30,2,1.5,'w');}else if(k==='lizard')g.poly([[14,21],[18,21],[17,30],[16,33],[15,30]],'T');else g.path([[16,21],[16,26],[18,29]],'T',2);}
  }
  if((L.ears&&!hooded)||L.ears==='long'||L.ears==='fin'){
    if(L.ears==='long'){g.px([[9,6],[8,5],[7,4]],'S');g.px([[22,6],[23,5],[24,4]],'S');}
    if(L.ears==='fin')g.sym(7,5,["..V","VVV",".VV","..V"]);
    if(L.ears==='cat')g.sym(11,0,["H..","HH.",front?"HrH":"HHH"]);
    if(L.ears==='fox')g.sym(10,-2,["H...","HH..",front?"HrH.":"HHH.",front?"HrHH":"HHHH"]);
    if(L.ears==='wolf')g.sym(11,-3,["H..","HH.","HHH",front?"HrH":"HHH"]);
  }
  if(L.crest)g.rect(15,-1,2,4,'T');
  if(L.antlers){g.sym(8,-3,["I...","II.I",".III","..II"]);}
  if(L.halo)g.sym(11,L.hat?-5:-3,["..OOO",".O...","..OOO"]);
  if(front){
    if(L.tusks)g.px([[14,9],[17,9],[14,10],[17,10]],'w');
    if(L.glasses){g.px([[12,6],[13,6],[14,6],[17,6],[18,6],[19,6],[12,7],[14,7],[15,7],[16,7],[17,7],[19,7]],'M');}
    if(L.marks)g.px([[12,9],[19,9],[9,15],[9,17],[22,15],[22,17]],'X');
  }else if(L.marks)g.px([[9,15],[22,15],[13,14],[18,14]],'X');
  if(L.fur)g.sym(8,11,["..FFFFFF","FFFFFFFF"]);
  if(L.hair==='flame')g.px([[12,-1],[15,-2],[16,-2],[19,-1],[9,3],[22,3]],'D');
}
// copy a grid into a 36x40 canvas grid, then apply body size
function toTall(g,dy){
  const W=36,H=40,o=new PG(W,H,0,0);
  for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++){const k=g.a[y*g.w+x];if(!k)continue;const nx=x+1,ny=y+dy;if(nx>=0&&ny>=0&&nx<W&&ny<H)o.a[ny*W+nx]=k;}
  return o;
}
function cutRows(o,from,n){ // remove rows [from,from+n), shift everything above down
  const W=o.w;for(let y=from+n-1;y>=0;y--)for(let x=0;x<W;x++)o.a[y*W+x]=y-n>=0?o.a[(y-n)*W+x]:0;
}
function addRows(o,at,n){ // duplicate row 'at' n times, shifting everything above it up
  const W=o.w;for(let y=0;y<=at-n;y++)for(let x=0;x<W;x++)o.a[y*W+x]=o.a[(y+n)*W+x];
  for(let k=1;k<=n;k++)for(let x=0;x<W;x++)o.a[(at-k)*W+x]=o.a[at*W+x];
}
function widen(o,col,y0,y1,n){ // duplicate a column for rows y0..y1, pushing the right side out
  const W=o.w;for(let y=y0;y<=y1;y++){const row=o.a.slice(y*W,(y+1)*W);const out=row.slice(0,col+1);for(let k=0;k<n;k++)out.push(row[col]);out.push(...row.slice(col+1));for(let x=0;x<W;x++)o.a[y*W+x]=out[x]||0;}
}
function applySize(o,L){
  // rows: head ~7-18, torso ~19-27, thighs ~28-32, feet 36
  if(L.size==='small'){cutRows(o,29,3);cutRows(o,24,1);}
  else if(L.size==='stout'){cutRows(o,29,3);widen(o,17,19,36,2);}
  else if(L.size==='big'){addRows(o,23,2);widen(o,17,17,36,1);}
}
const RACEPAL={T:null,U:'#efe8d8',u:'#c8bca8',O:'#ffe27a',I:'#c8a070',V:'#6ad0c8',F:'#d8c8a8',X:'#ffd04a',D:'#ffe08a'};
const _heroPal1=heroPal;
heroPal=function(L,els,id){
  const p=_heroPal1(L,els,id);
  if(L.skin){p.S=L.skin;p.e=shade(L.skin,.82);}
  if(L.eyes)p.E=L.eyes;
  p.T=p.T||p.H;p.U=(L.pal&&L.pal.W2)||RACEPAL.U;p.u=shade(p.U,.82);
  if(L.wings==='fae'){p.U='#f6c8e8';p.u='#a8e8f0';}
  p.O=RACEPAL.O;p.I=RACEPAL.I;p.V=L.skin?mix(L.skin,'#7ae0f0',.45):RACEPAL.V;p.F=RACEPAL.F;p.X=L.marks||RACEPAL.X;p.D=RACEPAL.D;
  return p;
};
const HFLAT='EmeCrhOXD';
function heroGridSide(L,walk,id){const g=_heroGrid0(L,walk);if(id)drawFlair(g,L,id,'side');raceSide(g,L);const o=toTall(g,6);const v=new PG(36,40,2,7);v.a=o.a;raceTop(v,L);applySize(o,L);return o;}
function heroGridView(L,view,frame,id){
  if(view==='side')return heroGridSide(L,frame>0,id);
  const g=new PG(34,38,1,5);
  backItemsFB(g,L,view,'under');raceFB(g,L,view,'under');
  legsFB(g,L,frame);torsoFB(g,L,view);drawFlair(g,L,id,view);headFB(g,L,view);faceFB(g,L,view);
  if(L.hat)hatFB(g,L,view);
  backItemsFB(g,L,view,'over');raceFB(g,L,view,'over');weaponFB(g,L,view);
  const o=toTall(g,2);applySize(o,L);return o;
}
function heroCanvas(id,walk){const t=TPL[id];if(t.mon)return monCanvas(t.art);const L=heroLook(id);return paint(heroGridSide(L,walk,id),heroPal(L,t.el,id),{flat:HFLAT,noAO:'SHe'});}
function heroURL(id,walk){if(TPL[id]&&TPL[id].mon)return monURL(TPL[id].art);return cvURL('h3:'+id+(walk?':w':'')+lookKey(id),()=>heroCanvas(id,walk));}
function walkerCanvas(key,L,els,id,view,frame){
  if(id&&TPL[id]&&TPL[id].mon)return imgOf('wkm:'+id,()=>monCanvas(TPL[id].art));
  return imgOf('wk3:'+key+':'+view+':'+frame,()=>paint(heroGridView(L,view,frame,id),heroPal(L,els,id),{flat:HFLAT,noAO:'SHe'}));
}
// a bust for portraits: top 26 rows of the side view
