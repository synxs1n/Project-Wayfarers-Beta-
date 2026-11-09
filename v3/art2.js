// ===== art2.js (base): hero races, sizes and new weapons on the 36x40 hero canvas (heroCanvas, heroURL, walkerCanvas) =====
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

// ===== v0.12.x per-hero accents: every wayfarer (not Legendary, not Vaelith) gets a few personal details chosen from the hero id (hashS) =====
// hair colour tweak, skin tone tweak, hair style (only when two heroes of a class would share hair and hat), 1 or 2 accessories from a set of 12,
// and a tint on the weapon. Nothing here uses Math.random. A hero's own look fields (hair, hat, face, back, skin, pal) are never replaced, only added to.
// Both the plain and HD paths go through heroGridSide / heroGridView / heroPal, so wrapping those three covers overworld, battle, portraits.
const ACC_SLOT={scarf:'neck',clasp:'neck',headband:'head',bandana:'head',circlet:'head',goggles:'head',eyepatch:'face',earrings:'face',shoulder:'body',satchel:'body',pouch:'body'};
const ACC_LIST=['scarf','headband','eyepatch','earrings','shoulder','satchel','clasp','pouch','bandana','circlet','goggles','earrings'];
const ACC_COL=['#c8453c','#3f8fe0','#4aa05a','#e8b840','#b06ad0','#e8e0d0','#2a2a3a','#e07a2a','#3fc0b0','#d0507a'];
const HAIR_NAT=['#2a1a12','#4a2c1a','#6b3f22','#8a5a2a','#c8a050','#e8d090','#a8402a','#1e1620','#8a8a98','#d8d0c0'];
const HAIR_DYE=['#3fb0d0','#d0507a','#4aa05a','#b06ad0','#e8b840','#e8e8f0','#e07a2a'];
const WT_COL=['#7ac8ff','#ffb060','#c8f0a0','#e0a0ff','#ff8a8a','#a0f0e0','#f0e08a','#9aa8ff'];
const HAIR_POOL=['short','spiky','wild','long','ponytail','bun','braid','curly','bob','swept'];
const HAIR_COVER=['hood','helm','greathelm'];
let _accMap=null;
function _accBuild(){
  _accMap={};const seen={};
  RAW.forEach(r=>{const id=r[0],t=TPL[id],L=t&&t.look;if(!L||t.src==='L'||t.src==='x'||L.mount||L.pets||L.scourge)return;
    const h=hashS('acc:'+id),o={};
    // hair style: keep it, unless the same class already has this exact hair and hat; then step through the pool to a free one
    const covered=HAIR_COVER.includes(L.hat);let hair=L.hair||'short';
    if(!covered&&HAIR_POOL.includes(hair)){let k=cl=>t.cls+'|'+cl+'|'+(L.hat||'');let n=0;
      while(seen[k(hair)]&&n<HAIR_POOL.length){hair=HAIR_POOL[(HAIR_POOL.indexOf(hair)+1+(h>>>5)%3)%HAIR_POOL.length];n++;}
      seen[k(hair)]=1;if(hair!==(L.hair||'short'))o.hair=hair;}
    // hair colour: heroes without one get a natural colour; the rest are nudged toward a dye now and then
    const H=L.pal&&L.pal.H;
    if(!H&&hair!=='bald')o.hc=HAIR_NAT[(h>>>2)%HAIR_NAT.length];
    else if(H&&(h>>>9)%3===0)o.hc=mix(H,HAIR_DYE[(h>>>11)%HAIR_DYE.length],.3);
    // skin: a small shift in depth and warmth; heroes with their own skin colour (race) keep it exactly
    if(!L.skin)o.sf=.93+((h>>>13)%9)*.015;
    // accessories: one head/face/neck/body piece, plus a second from a different slot for most heroes
    const hat=L.hat&&L.hat!=='none',back=L.back||[],face=L.face||[];
    const ok=a=>{
      if((ACC_SLOT[a]==='head')&&(hat||L.halo||L.ears==='fox'||L.ears==='cat'||L.ears==='wolf'||L.antlers||L.crest||L.hair==='flame'||L.hair==='mohawk'))return false;
      if(a==='eyepatch'&&(face.includes('mask')||face.includes('scar')||L.glasses||face.includes('eyepatch')))return false;
      if(a==='scarf'&&back.includes('scarf'))return false;
      if(a==='clasp'&&!back.includes('cape'))return false;
      if(a==='satchel'&&(back.includes('pack')||back.includes('cape')))return false;
      if(a==='shoulder'&&(L.b==='heavy'||(FLAIR[id]&&(FLAIR[id].f||[]).includes('pauldron'))))return false;
      if(a==='pouch'&&L.b==='monk')return false;
      if(a==='earrings'&&(L.hair==='long'||L.hair==='bob'||L.hair==='curly'||L.hair==='wild'||HAIR_COVER.includes(L.hat)))return false;
      return true;};
    const pick=(start,not)=>{for(let i=0;i<ACC_LIST.length;i++){const a=ACC_LIST[(start+i)%ACC_LIST.length];if(ok(a)&&ACC_SLOT[a]!==not)return a;}return null;};
    const a1=pick(h%ACC_LIST.length);if(a1){o.acc=[a1];
      if((h>>>17)%4!==0){const a2=pick((h>>>3)%ACC_LIST.length,ACC_SLOT[a1]);if(a2&&a2!==a1)o.acc.push(a2);}}
    o.ac=ACC_COL[(h>>>7)%ACC_COL.length];o.wt=WT_COL[(h>>>15)%WT_COL.length];o.ws=.2+((h>>>19)%5)*.05;
    _accMap[id]=o;});
}
function accOf(id){if(!_accMap){try{_accBuild();}catch(e){_accMap={};}}return id&&_accMap[id]||null;}
function accLook(L,id){const o=L&&accOf(id);if(!o)return L;if(L._acc===id)return L;const n=Object.assign({},L);if(o.hair)n.hair=o.hair;n._acc=id;return n;}
// accessories drawn over the finished body. Coordinates are the 32x32 grid used by the side, front and back painters. a = accessory colour, d = its shade.
function drawAcc(g,L,id,view){
  const o=accOf(id);if(!o||!o.acc)return;const front=view==='front',side=view==='side';
  o.acc.forEach(a=>{
    if(a==='scarf'){if(side){g.rect(12,12,8,1,'a');g.rect(12,13,7,1,'d');g.px([[11,13],[10,14],[10,15],[11,15]],'a');}
      else{g.rect(12,12,8,1,'a');g.rect(12,13,8,1,'d');g.px(front?[[13,14],[13,15]]:[[18,14],[18,15],[18,16]],'a');}}
    else if(a==='clasp'){if(side)g.px([[13,12],[13,13]],'G');else if(front){g.px([[13,12],[18,12]],'G');g.rect(14,12,4,1,'d');}else g.rect(15,12,2,1,'G');}
    else if(a==='headband'){g.rect(11,5,10,1,'a');if(side)g.px([[9,6],[8,7],[9,7]],'a');else g.px([[10,6],[9,7]],'a');}
    else if(a==='bandana'){g.rect(11,4,10,2,'a');g.px([[13,4],[16,5],[19,4]],'d');g.px(side?[[9,5],[8,6],[9,7]]:[[10,6],[10,7]],'a');}
    else if(a==='circlet'){g.rect(11,5,10,1,'G');g.s(side?19:15,5,'C');if(!side)g.s(16,5,'C');}
    else if(a==='goggles'){g.rect(11,4,10,1,'d');if(side)g.rows(17,3,["aa.","aCa"]);else g.rows(12,3,["aaa..aaa","aCa..aCa"]);}
    else if(a==='eyepatch'){if(side){g.rect(18,6,3,3,'d');g.px([[17,5],[15,5],[13,4],[12,4]],'d');}else if(front){g.rect(12,6,3,3,'d');g.line(14,6,20,4,'d');}else g.rect(11,5,10,1,'d');}
    else if(a==='earrings'){if(side)g.px([[12,9]],'a');else g.px([[10,9],[21,9]],'a');}
    else if(a==='shoulder'){if(side)g.rows(14,12,[".aaaa","aaaaaa",".dddd"]);else g.rows(8,12,[".aaa","aaaa",".dd."]);}
    else if(a==='satchel'){if(side){g.line(12,13,19,20,'d');g.rect(10,18,4,4,'a');g.rect(10,18,4,1,'d');g.s(11,19,'G');}
      else if(front){g.line(11,12,20,21,'d');g.rect(20,19,4,4,'a');g.rect(20,19,4,1,'d');g.s(21,20,'G');}
      else{g.line(11,13,20,20,'d');g.rect(14,15,5,5,'a');g.rect(14,15,5,1,'d');}}
    else if(a==='pouch'){if(side){g.rect(13,18,3,3,'a');g.rect(13,18,3,1,'d');g.s(14,19,'G');}else if(front){g.rect(19,18,3,3,'a');g.rect(19,18,3,1,'d');g.s(20,19,'G');}else g.rect(20,18,3,3,'a');}
  });
}
// weapon tint: the weapon is drawn into a scratch grid, its metal and haft recoloured (keys v x y), then composited. Active only inside our wrappers.
let _wtOn=false;
Object.keys(WPN).forEach(k=>{const d0=WPN[k].draw;if(!d0)return;WPN[k].draw=function(g){
  if(!_wtOn)return d0.apply(this,arguments);
  const t=new PG(g.w,g.h,g.ox,g.oy);d0.call(this,t);const R={M:'v',N:'x',W:'y'};
  for(let i=0;i<t.a.length;i++)if(t.a[i])g.a[i]=R[t.a[i]]||t.a[i];};});
const _weaponFB1=weaponFB;
weaponFB=function(g,L,view){if(!_wtOn)return _weaponFB1(g,L,view);
  const t=new PG(g.w,g.h,g.ox,g.oy);_weaponFB1(t,L,view);const R={M:'v',N:'x',W:'y'};
  for(let i=0;i<t.a.length;i++)if(t.a[i])g.a[i]=R[t.a[i]]||t.a[i];};
let _accId=null;
function _withAcc(id,fn){_wtOn=!!accOf(id);_accId=id;try{return fn();}finally{_wtOn=false;_accId=null;}}
const _hgs2=heroGridSide,_hgv2=heroGridView;
heroGridSide=function(L,walk,id){const o=accOf(id);if(!o)return _hgs2(L,walk,id);L=accLook(L,id);
  return _withAcc(id,()=>_hgs2(L,walk,id));};
heroGridView=function(L,view,frame,id){const o=accOf(id);if(!o)return _hgv2(L,view,frame,id);L=accLook(L,id);
  return _withAcc(id,()=>_hgv2(L,view,frame,id));};
// the accessory pass has to run before toTall/applySize, so hook it into drawFlair, which runs at that point in both painters
const _drawFlair2=drawFlair;
drawFlair=function(g,L,id,view){_drawFlair2(g,L,id,view);try{if(view==='side')drawAcc(g,L,id,'side');}catch(e){}};
// front and back painters draw the head before the hat and back items; the accessories go on once those are down
const _backItems2=backItemsFB;
backItemsFB=function(g,L,view,pass){_backItems2(g,L,view,pass);try{if(pass==='over')drawAcc(g,L,_accId,view);}catch(e){}};
const _heroPal2=heroPal;
heroPal=function(L,els,id){const p=_heroPal2(L,els,id),o=accOf(id);if(!o)return p;
  if(o.hc){const oh=p.H;p.H=o.hc;if(p.T===oh)p.T=o.hc;}
  if(o.sf&&!(L&&L.skin)){p.S=shade(p.S,o.sf);p.e=shade(p.S,.82);}
  p.a=o.ac;p.d=shade(o.ac,.62);
  p.v=mix(p.M,o.wt,.12+o.ws*.7);p.x=shade(p.v,.68);p.y=mix(p.W,o.wt,o.ws*.6);
  return p;};
