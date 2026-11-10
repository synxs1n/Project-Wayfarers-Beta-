// ===== art2.js (base): hero races, body sizes, the tone pass and the grid builders on the 40x56 hero canvas (heroCanvas, heroURL, walkerCanvas) =====
// The hero rig lives in art.js (rigSide, rigFB). Heroes render on a 40x56 canvas (feet on row 52) so big folk, wings, halos and ears fit.
// draw a part only into empty cells, so it sits behind what is already there
function behind(g,fn){const t=new PG(g.w,g.h,g.ox,g.oy);if(g.sc)t.sc=g.sc;fn(t);for(let i=0;i<g.a.length;i++)if(!g.a[i]&&t.a[i])g.a[i]=t.a[i];}
function tailKind(L){return L.ears==='cat'?'cat':L.ears==='fox'?'fox':L.ears==='wolf'?'wolf':L.crest?'lizard':'cat';}
// ----- race, side view (the head and the face are at x 16..24, rows 9..15; the hips at (16,32)) -----
function raceSide(g,L){
  behind(g,t=>{
    if(L.tail){const k=tailKind(L);
      if(k==='cat')t.path([[16,34],[11,36],[8,33],[7,27],[9,22]],'T',3);
      if(k==='fox'){t.ell(9.5,37,5.4,3.8,'T');t.ell(14,35,3.6,2.8,'T');t.ell(4.4,39.5,2.4,2.2,'w');}
      if(k==='wolf')t.path([[16,33],[11,36],[8,41],[7,46]],'T',3.6);
      if(k==='lizard'){t.poly([[17,31],[17,38],[8,46],[1,49],[4,43]],'T');t.px([[13,38],[10,42],[6,45]],'h');}}
    if(L.wings==='feather'){t.poly([[17,19],[10,10],[4,10],[1,15],[3,25],[8,33],[14,35],[17,31]],'U');for(let i=0;i<4;i++)t.line(4+i*3,11+i*2,6+i*3,30,'u');}
    if(L.wings==='fae'){t.ell(9,18,6.6,5.2,'U');t.ell(9,28,4.8,3.8,'u');t.px([[7,16],[10,19],[8,28]],'w');}
  });
}
function raceTop(g,L){
  const hooded=L.hat==='hood'||L.hat==='greathelm';
  if(L.tusks)g.px([[25,15],[26,15],[26,14]],'w');
  if(L.glasses){g.px([[20,11],[21,11],[22,11],[23,11],[20,12],[23,12],[20,13],[23,13],[20,14],[21,14],[22,14],[23,14],[24,11],[25,11],[26,11],[26,12],[26,13],[24,14],[25,14],[26,14]],'M');g.line(20,12,16,12,'M');}
  if(L.fur){g.rows(15,16,["..FFFFFFFF.","FFFFFFFFFFF","FFFFFFFFFFF"]);g.px([[16,19],[24,19]],'F');}
  if(L.marks){g.px([[19,21],[20,22],[21,23],[22,24],[23,10],[21,31],[22,32]],'X');}
  if(L.ears&&!hooded||L.ears==='long'||L.ears==='fin'){
    if(L.ears==='long')g.px([[16,11],[15,10],[14,9],[13,8],[15,11]],'S');
    if(L.ears==='fin')hsh(g,t=>t.poly([[16.4,9.4],[13,7],[11.6,12.4],[16.4,14.4]],'x'),['V','V','V'],{cap:2});
    if(L.ears==='cat'){hsh(g,t=>{t.poly([[19,8.6],[18,3.6],[22.6,7.4]],'x');t.poly([[15.4,9.6],[14,4.8],[18.4,8]],'x');},HAIRK,{cap:2});g.px([[19,6],[19,7]],'r');}
    if(L.ears==='fox'){hsh(g,t=>{t.poly([[19,8.6],[18,1.4],[23.2,7.2]],'x');t.poly([[15.4,9.6],[14.2,2.4],[18.4,8]],'x');},HAIRK,{cap:2});g.px([[19,5],[19,6],[19,7]],'r');}
    if(L.ears==='wolf'){hsh(g,t=>{t.poly([[18.6,8.6],[18.4,2],[23.4,7.2]],'x');t.poly([[15,9.6],[14.4,3],[18.2,8]],'x');},HAIRK,{cap:2});g.px([[19,5],[19,6],[20,7]],'r');}
  }
  if(L.crest)g.px([[23,7],[22,6],[21,5],[19,4],[18,5],[17,5],[16,7],[15,8],[14,10],[14,12],[21,6],[17,6]],'T');
  if(L.antlers){g.path([[19,8],[18,3],[15,0]],'I',2);g.path([[18,5],[21,2]],'I');g.path([[22,8],[23,3],[26,0]],'I',2);g.path([[23,5],[20.4,3]],'I');}
  if(L.halo){const hy=L.hat&&L.hat!=='none'?1.6:3;g.ell(20.5,hy,6.6,2,'O');g.ell(20.5,hy,4.6,.9,0);}
  if(L.hair==='flame')g.px([[18,3],[22,2],[24,4],[16,5],[20,1],[26,7],[13,8]],'D');
}
// ----- race, front and back views -----
function raceFB(g,L,view,pass){
  const front=view==='front',hooded=L.hat==='hood'||L.hat==='greathelm';
  if(pass==='under'){
    if(L.wings==='feather'&&front)hmirror(g,t=>{t.poly([[14,18],[8,9],[3,9],[1,15],[3,24],[8,31],[14,30]],'U');for(let i=0;i<3;i++)t.line(4+i*3,10+i*2,6+i*3,28,'u');});
    if(L.wings==='fae'&&front)hmirror(g,t=>{t.ell(9,17,5.4,4.6,'U');t.ell(10,26,4,3.2,'u');});
    if(L.tail&&front){const k=tailKind(L);if(k==='fox'){g.ell(27,40,3.4,3,'T');g.ell(29,42,1.6,1.4,'w');}else g.path([[22,36],[26,40],[27,46]],'T',3);}
    return;}
  if(!front){
    if(L.wings==='feather')hmirror(g,t=>{t.poly([[16,18],[9,9],[3,9],[1,15],[3,24],[8,31],[15,32]],'U');for(let i=0;i<3;i++)t.line(4+i*3,10+i*2,7+i*3,30,'u');});
    if(L.wings==='fae')hmirror(g,t=>{t.ell(10,17,5.4,4.6,'U');t.ell(11,26,4,3.2,'u');});
    if(L.tail){const k=tailKind(L);if(k==='fox'){g.ell(20,42,4,3.6,'T');g.ell(20,46,2.2,1.8,'w');}else if(k==='lizard')g.poly([[18,32],[22,32],[21,42],[20,48],[19,42]],'T');else g.path([[20,33],[20,40],[23,45]],'T',3);}
  }
  if(L.fur)g.rows(13,16,["..FFFFFFFFFFFF..",".FFFFFFFFFFFFFF.","FFFFFFFFFFFFFFFF"].map(r=>r.slice(0,14)));
  if((L.ears&&!hooded)||L.ears==='long'||L.ears==='fin'){
    if(L.ears==='long'){g.px([[15,11],[14,10],[13,9],[12,8],[24,11],[25,10],[26,9],[27,8]],'S');}
    if(L.ears==='fin')hmirror(g,t=>t.poly([[15.4,9],[12,7],[11,12],[15.4,14]],'V'));
    if(L.ears==='cat')hmirror(g,t=>{t.poly([[16,9],[15,3],[19,8]],'H');t.px([[16,6],[16,7]],'r');});
    if(L.ears==='fox')hmirror(g,t=>{t.poly([[16,9],[15,1.4],[19.4,8]],'H');t.px([[16,5],[16,6],[16,7]],'r');});
    if(L.ears==='wolf')hmirror(g,t=>{t.poly([[15.6,9],[15,2],[19.6,8]],'H');t.px([[16,5],[16,6],[17,7]],'r');});
  }
  if(L.crest)g.rect(19,2,2,8,'T');
  if(L.antlers){hmirror(g,t=>{t.path([[16,8],[14,3],[11,0]],'I',2);t.path([[14,5],[17,2]],'I');});}
  if(L.halo)g.ell(20,L.hat&&L.hat!=='none'?1.6:3,6.4,2,'O'),g.ell(20,L.hat&&L.hat!=='none'?1.6:3,4.4,.9,0);
  if(front){
    if(L.tusks)g.px([[17,14],[22,14],[17,13],[22,13]],'w');
    if(L.glasses)g.px([[16,11],[17,11],[18,11],[19,11],[16,12],[19,12],[16,13],[19,13],[16,14],[17,14],[18,14],[19,14],[20,11],[21,11],[22,11],[23,11],[20,12],[23,12],[20,13],[23,13],[20,14],[21,14],[22,14],[23,14]],'M');
    if(L.marks)g.px([[19,10],[20,10],[17,22],[18,23],[22,22],[21,23],[11,28],[28,28]],'X');
  }else if(L.marks)g.px([[11,28],[28,28],[19,24],[20,24]],'X');
  if(L.hair==='flame')g.px([[17,2],[20,1],[23,2],[14,6],[26,6]],'D');
}
// the grid is already the final canvas (rows and columns of the rig): kept so callers that still ask for the old lift keep working
function toTall(g,dy){return g;}
function cutRows(o,from,n){ // remove rows [from,from+n), shift everything above down
  const W=o.w;for(let y=from+n-1;y>=0;y--)for(let x=0;x<W;x++)o.a[y*W+x]=y-n>=0?o.a[(y-n)*W+x]:0;
}
function addRows(o,at,n){ // duplicate row 'at' n times, shifting everything above it up
  const W=o.w;for(let y=0;y<=at-n;y++)for(let x=0;x<W;x++)o.a[y*W+x]=o.a[(y+n)*W+x];
  for(let k=1;k<=n;k++)for(let x=0;x<W;x++)o.a[(at-k)*W+x]=o.a[at*W+x];
}
function widen(o,col,y0,y1,n){ // duplicate a column for rows y0..y1, pushing the right side out; the row is then shifted left by half so the figure stays centred
  const W=o.w,sh=n>>1;for(let y=y0;y<=y1;y++){const row=o.a.slice(y*W,(y+1)*W);const out=row.slice(0,col+1);for(let k=0;k<n;k++)out.push(row[col]);out.push(...row.slice(col+1));for(let x=0;x<W;x++)o.a[y*W+x]=out[x+sh]||0;}
}
function applySize(o,L){
  // rows: head 9-15, torso 18-31, thighs 32-39, knee 40, feet 52 (the compact rig scales them by o.sc.f)
  const f=o.sc?o.sc.f:1,R=v=>Math.max(1,Math.round(v*f)),Y=v=>Math.round(v*f);
  if(L.size==='small'){cutRows(o,Y(42),R(5));cutRows(o,Y(26),R(2));}
  else if(L.size==='stout'){cutRows(o,Y(42),R(4));widen(o,Y(20),Y(19),Y(52),R(2));}
  else if(L.size==='big'){addRows(o,Y(26),1);addRows(o,Y(40),1);widen(o,Y(20),Y(19),Y(52),1);}
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
// ===== the hero tone pass: hand-shaded looking garments from one rule, run on every finished side, front and back grid =====
// Light comes from the top left: in each row the last 1 or 2 cells of a run of cloth, trousers, hood or steel become the shade key (P>p J>j Y>z K>k M>N);
// steel gets a glint pixel (c) on its top left corner. Hair (h H l), skin and the explicit shade keys are drawn by the rig itself. Running the pass twice
// (the pose builder does) changes nothing. Villagers (look.vill) keep the two tone of npcart9.js.
const HT_FAM={P:'P',p:'P',J:'J',j:'J',Y:'Y',z:'Y',K:'K',k:'K',M:'M',N:'M',Q:'Q',q:'Q'},HT_SH={P:'p',J:'j',Y:'z',K:'k',M:'N',Q:'q'};
function heroTone(o,view){
  const W=o.w,H=o.h,A=o.a,O=A.slice(),fam=k=>HT_FAM[k]||'';
  for(let y=0;y<H;y++){let x=0;while(x<W){const f=fam(A[y*W+x]);if(!f){x++;continue;}
    let x1=x;while(x1+1<W&&fam(A[y*W+x1+1])===f)x1++;
    const n=x1-x+1;
    if(n>=4&&f!=='Q'&&!(f==='M'&&n>=6)){
      const band=n>=9?2:1,sh=HT_SH[f];
      for(let i=0;i<band;i++){const c=x1-i;if(A[y*W+c]===f&&(c-x)>=2)O[y*W+c]=sh;}
      if(false&&f==='M'&&n>=3&&A[y*W+x]==='M'&&(y===0||!A[(y-1)*W+x])&&(y+1<H&&A[(y+1)*W+x]==='M'))O[y*W+x]='c';
    }
    x=x1+1;}}
  for(let i=0;i<A.length;i++)A[i]=O[i];
}
// the derived keys of the hero palette: shades of cloth, hair and steel, the steel glint, the eye catchlight. Villager palettes already carry theirs.
function heroPalD(p){
  const T=(k,c,f)=>{if(!p[k]&&c)p[k]=f?f(c):c;};
  const dk=(c,f)=>mix(shade(c,f),'#2c1458',.12);
  T('p',p.P,c=>dk(c,.78));T('j',p.J,c=>dk(c,.76));T('z',p.Y,c=>dk(c,.78));T('k',p.K,c=>dk(c,.72));T('q',p.Q,c=>dk(c,.8));
  T('l',p.H,c=>dk(c,.66));T('h',p.H,c=>tint(c,.34));
  T('c',p.M,c=>tint(c,.78));T('9','#ffffff');
  return p;
}
const HNOAO='SHepjkzlq',HFLAT9=HFLAT+'9';
function heroGridSide(L,walk,id){const g=rigSide(L,walk,id);raceSide(g,L);applySize(g,L);if(!L.vill)heroTone(g,'side');return g;}
function heroGridView(L,view,frame,id){
  if(view==='side')return heroGridSide(L,frame>0,id);
  const g=rigFB(L,view,frame,id);
  raceFB(g,L,view,'over');
  applySize(g,L);if(!L.vill)heroTone(g,view);return g;
}
function heroCanvas(id,walk){const t=TPL[id];if(t.mon)return monCanvas(t.art);const L=heroLook(id);return paint(heroGridSide(L,walk,id),heroPalD(heroPal(L,t.el,id)),{flat:HFLAT9,noAO:HNOAO});}
function heroURL(id,walk){if(TPL[id]&&TPL[id].mon)return monURL(TPL[id].art);return cvURL('h3:'+id+(walk?':w':'')+lookKey(id),()=>heroCanvas(id,walk));}
function walkerCanvas(key,L,els,id,view,frame){
  if(id&&TPL[id]&&TPL[id].mon)return imgOf('wkm:'+id,()=>monCanvas(TPL[id].art));
  return imgOf('wk3:'+key+':'+view+':'+frame,()=>paint(heroGridView(L,view,frame,id),heroPalD(heroPal(L,els,id)),{flat:HFLAT9,noAO:HNOAO}));
}
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
accOf=HOOK.def('accOf',accOf);
// v0.14.1 (was fixes10.js):
// 3) Eye patches went to 23 of 92 heroes; now about one in five of those keeps it, the rest swap it for a pouch or satchel, and a third
//    of the scarves and earrings go too, so each piece stays a distinguishing mark.
HOOK.xform('accOf','art2','eye patches, scarves and earrings are rarer',function(o,id){try{if(o&&o.acc&&!o._f10){o._f10=1;const h=hashS(String(id)+'acc10'),L=(TPL[id]&&TPL[id].look)||{};
  if(o.acc.includes('eyepatch')&&h%5!==0){o.acc=o.acc.filter(a=>a!=='eyepatch');if(!o.acc.length)o.acc.push(L.b==='monk'?'satchel':'pouch');}
  if(o.acc.includes('earrings')&&(h>>>3)%3===0&&o.acc.length>1)o.acc=o.acc.filter(a=>a!=='earrings');
  if(o.acc.includes('scarf')&&(h>>>5)%3===0&&o.acc.length>1)o.acc=o.acc.filter(a=>a!=='scarf');}}catch(e){}return o;});
function accLook(L,id){const o=L&&accOf(id);if(!o)return L;if(L._acc===id)return L;const n=Object.assign({},L);if(o.hair)n.hair=o.hair;n._acc=id;return n;}
// accessories drawn over the finished body. Coordinates are the 32x32 grid used by the side, front and back painters. a = accessory colour, d = its shade.
// accessories drawn over the finished body. Coordinates are the 40x56 rig. a = accessory colour, d = its shade. part: 'head' (head, face; goes on the head layer) or 'body' (neck, body)
function drawAcc(g,L,id,view,part){
  const o=accOf(id);if(!o||!o.acc)return;const front=view==='front',side=view==='side';
  o.acc.forEach(a=>{
    const sl=ACC_SLOT[a],isHead=sl==='head'||sl==='face';if(part==='head'?!isHead:isHead)return;
    if(a==='scarf'){if(side){g.rect(18,16,6,2,'a');g.rect(18,18,5,1,'d');g.px([[17,17],[16,19],[16,20],[17,21]],'a');}
      else{g.rect(17,16,6,2,'a');g.rect(17,18,6,1,'d');g.px(front?[[21,19],[21,20],[21,21],[21,22]]:[[20,19],[20,20],[20,21],[20,22]],'a');}}
    else if(a==='clasp'){if(side)g.px([[18,18],[18,19]],'G');else if(front){g.px([[17,18],[22,18]],'G');g.rect(18,18,4,1,'d');}else g.rect(19,18,2,1,'G');}
    else if(a==='headband'){g.rect(side?17:16,9,side?9:8,1,'a');g.px(side?[[16,10],[15,11],[15,12]]:[[15,10],[14,11],[14,12]],'a');}
    else if(a==='bandana'){g.rect(side?17:16,8,side?9:8,2,'a');g.px([[18,8],[21,9],[24,8]],'d');g.px(side?[[16,10],[15,11],[15,12],[16,12]]:[[15,10],[14,11],[14,12]],'a');}
    else if(a==='circlet'){g.rect(side?17:16,9,side?9:8,1,'G');if(!(view==='back'))g.s(side?24:19,9,'C');if(front)g.s(20,9,'C');}
    else if(a==='goggles'){g.rect(side?17:16,9,side?9:8,1,'d');if(side)g.rows(22,7,["aaa","aCa"]);else g.rows(17,7,["aaa..aaa","aCa..aCa"]);}
    else if(a==='eyepatch'){if(side){g.rect(21,12,2,2,'d');g.line(20,11,16,10,'d');}else if(front){g.rect(17,12,2,2,'d');g.line(16,11,23,10,'d');}else g.rect(16,10,8,1,'d');}
    else if(a==='earrings'){if(side)g.px([[19,15]],'a');else g.px([[15,14],[24,14]],'a');}
    else if(a==='shoulder'){if(side){g.rect(17,19,6,2,'a');g.rect(18,21,4,1,'d');}else{g.rect(11,18,5,2,'a');g.rect(24,18,5,2,'a');g.rect(12,20,3,1,'d');g.rect(25,20,3,1,'d');}}
    else if(a==='satchel'){if(side){g.line(18,19,23,29,'d');g.rect(14,28,5,5,'a');g.rect(14,28,5,1,'d');g.s(15,29,'G');}
      else if(front){g.line(15,19,25,29,'d');g.rect(24,27,5,5,'a');g.rect(24,27,5,1,'d');g.s(25,28,'G');}
      else{g.line(15,19,25,29,'d');g.rect(13,27,5,5,'a');g.rect(13,27,5,1,'d');}}
    else if(a==='pouch'){if(side){g.rect(17,29,4,3,'a');g.rect(17,29,4,1,'d');g.s(18,30,'G');}else if(front){g.rect(24,29,4,4,'a');g.rect(24,29,4,1,'d');g.s(25,30,'G');}else g.rect(24,29,4,4,'a');}
  });
}
// weapon tint: the rig draws weapons through hTint (art.js), which recolours metal and haft (keys v x y) while HWT.on is set by _withAcc below.
let _accId=null;
function _withAcc(id,fn){HWT.on=!!accOf(id);_accId=id;try{return fn();}finally{HWT.on=false;_accId=null;}}
const _hgs2=heroGridSide,_hgv2=heroGridView;
heroGridSide=function(L,walk,id){const o=accOf(id);if(!o)return _hgs2(L,walk,id);L=accLook(L,id);
  return _withAcc(id,()=>_hgs2(L,walk,id));};
heroGridView=function(L,view,frame,id){const o=accOf(id);if(!o)return _hgv2(L,view,frame,id);L=accLook(L,id);
  return _withAcc(id,()=>_hgv2(L,view,frame,id));};
const _heroPal2=heroPal;
heroPal=function(L,els,id){const p=_heroPal2(L,els,id),o=accOf(id);if(!o)return p;
  if(o.hc){const oh=p.H;p.H=o.hc;if(p.T===oh)p.T=o.hc;}
  if(o.sf&&!(L&&L.skin)){p.S=shade(p.S,o.sf);p.e=shade(p.S,.82);}
  p.a=o.ac;p.d=shade(o.ac,.62);
  p.v=mix(p.M,o.wt,.12+o.ws*.7);p.x=shade(p.v,.68);p.y=mix(p.W,o.wt,o.ws*.6);
  return p;};
