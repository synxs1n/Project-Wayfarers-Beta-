// ===== dungeon8.js (v0.8.2): themed dungeons that match their battle backdrops, organic caverns, the boss lair on the field =====
// 1. Every main dungeon, side cave and fortress gets a material (D8M) picked by its realm (D8_REALM), its zone theme (D8_ZONE) or, for
//    side caves, its tileset (D8_CAVE): ice cavern, ice vault, volcanic cavern, basalt forge, sea cave, flooded masonry, root cavern,
//    crypt, sandstone, keep, astral halls, mountain rock. The material sets the wall and floor art (2D drawDTile, the HD-2D block faces
//    and tops in hdStructCanvas), the decor props (P, g, r), liquids, lights and the dark tint, and the battle backdrop of fights started
//    there (the same material palette on the d_ / c_ / boss_ stages, organic places fight on the cavern stage).
// 2. Organic materials (the cave themes) reshape their walls after generation: wall tiles touching open floor are carved into floor
//    by seeded noise (bulges, wider winding tunnels, rounded chambers), only where carving joins nothing that was not already joined in
//    the 3x3 around it (so no new route, no way past bars or doors), never within D8_KEEP tiles of a chest, key, lever, stairs, door, bars,
//    rune circle, prop or the lost wayfarer. Some walls by open floor turn into liquid ('~', still solid). This runs after the path guard
//    (pathguard.js) has placed everything, so chests, keys, levers, the stairs and their opened state are exactly those of the unreshaped
//    map; the reshaped map must then pass the same checks (validateDungeon, mapIssues, pathAssets), otherwise the reshape is dropped (first
//    with a wider keep-out, then without liquid, then entirely). Only wall shapes change. Generation and the game RNG are untouched: all of
//    this uses its
//    own seeded generator (hashS of the journey seed and map id), and every map rebuilds the same way from its seed.
// 3. The boss lair on the field: the main dungeon entrance is a skull-carved gate under a dark tower with a beacon, braziers, the
//    Scourge's banner and a LAIR plaque, with a light column over the beacon. Relit (boss beaten): a gold beacon, warm braziers, a calm
//    gold column. Its own map icon and legend entry ("Lair"). Both renderers (the tower and the column are billboards in HD-2D).
// 4. A save made inside a dungeon whose tile became solid (it cannot happen with carving only, but liquids or a future reshape could)
//    loads on the nearest open tile instead of the town inn.
// window.__D8OFF (tests) switches all of it off for maps built while it is set.
const D8M={
 ice:{n:'Ice cavern',f:['#a8c6de','#96b4ce','#c6def0','#7090ae'],w:['#78a8d4','#6290bc','#bfe4fa','#22365c'],top:'#122038',acc:'#dff8ff',acc2:'#8fdcf0',liq:'ice',lt:'ice',dark:'rgba(4,10,28,.76)',hero:'rgba(170,220,255,.18)'},
 icevault:{n:'Ice vault',f:['#9cb2c8','#8ca2b8','#b4c8dc','#6a8098'],w:['#7a9cc0','#6688ac','#acd0ee','#24345a'],top:'#141e34',acc:'#dff8ff',acc2:'#8fdcf0',lt:'ice',dark:'rgba(4,8,24,.78)',hero:'rgba(190,220,255,.16)'},
 lava:{n:'Volcanic cavern',f:['#4a3a34','#3e2e2a','#5c4840','#2a1c18'],w:['#3a2a28','#2a1e1c','#5c4440','#0e0808'],top:'#0a0505',acc:'#ff7a2a',acc2:'#ffd04a',liq:'lava',lt:'lava',dark:'rgba(14,3,2,.74)',hero:'rgba(255,150,80,.18)'},
 forge:{n:'Basalt forge',f:['#4c4442','#3e3634','#5e5450','#2a2220'],w:['#4e403c','#3c302c','#70605a','#181010'],top:'#0c0808',acc:'#ff8a3a',acc2:'#ffd04a',liq:'lava',lt:'lava',dark:'rgba(12,4,2,.76)',hero:'rgba(255,170,100,.16)'},
 sea:{n:'Sea cave',f:['#4a6c68','#3c5c58','#5e827c','#2a4644'],w:['#3a5a5e','#2c4a4e','#5a8a8a','#0e1e22'],top:'#081618',acc:'#5ad0c0',acc2:'#f0a0b0',liq:'water',lt:'cyan',dark:'rgba(2,10,14,.78)',hero:'rgba(150,240,230,.15)'},
 flood:{n:'Flooded halls',f:['#5c6862','#4e5a54','#707c74','#36403c'],w:['#5a645c','#46504a','#7c8880','#161c1a'],top:'#0c1210',acc:'#7ad0c8',acc2:'#c8e0a0',liq:'murk',lt:'cyan',dark:'rgba(3,10,10,.78)',hero:'rgba(180,240,220,.15)'},
 root:{n:'Root cavern',f:['#5a4834','#4c3c2a','#6e5a42','#32261a'],w:['#4e3c2a','#3e2e20','#6e583e','#1a1008'],top:'#0e0904',acc:'#7af0a0',acc2:'#c890f0',liq:'bog',lt:'fungus',dark:'rgba(4,8,4,.78)',hero:'rgba(170,255,190,.14)'},
 crypt:{n:'Crypt',f:['#6e685a','#5e584c','#86806c','#464036'],w:['#665e50','#504a3e','#8a8270','#221e16'],top:'#16120c',acc:'#9ac060',acc2:'#e8c070',lt:'torch',dark:'rgba(6,4,6,.8)',hero:'rgba(255,200,130,.16)'},
 sand:{n:'Sandstone halls',f:['#c8a476','#b89468','#dcbc8c','#8a6c48'],w:['#b48c5c','#9c7648','#dab27c','#4a3420'],top:'#2a1c10',acc:'#f2c93a',acc2:'#e8703a',lt:'torch',dark:'rgba(16,8,2,.7)',hero:'rgba(255,210,140,.18)'},
 keep:{n:'Keep',f:['#8a889a','#7a788a','#a2a0b2','#5a5868'],w:['#7c7a92','#68667e','#a2a0ba','#201e2c'],top:'#14121c',acc:'#f2c93a',acc2:'#c0392b',lt:'torch',dark:'rgba(4,3,10,.8)',hero:'rgba(255,200,130,.16)'},
 astral:{n:'Astral halls',f:['#30284a','#282042','#3e345c','#1a1430'],w:['#3c305e','#30264e','#5e4e90','#0a0616'],top:'#05030c',acc:'#b080ff',acc2:'#5fc9a0',liq:'void',lt:'violet',dark:'rgba(4,2,12,.8)',hero:'rgba(190,160,255,.16)'},
 rock:{n:'Mountain cave',f:['#7a7886','#6c6a78','#8e8c9a','#4c4a58'],w:['#686678','#565466','#88869e','#1a1824'],top:'#100e16',acc:'#8ad0ff',acc2:'#f2c93a',lt:'ice',dark:'rgba(4,4,12,.8)',hero:'rgba(200,220,255,.15)'}
};
// [material, organic]
const D8_REALM={thistle:['crypt',0],orchard:['crypt',0],strand:['sea',1],mire:['flood',0],deeps:['lava',1],grotto:['root',1],tundra:['icevault',0],glacier:['ice',1],
  peaks:['keep',0],mesa:['sand',0],lakes:['flood',0],mines:['forge',0],ashen:['lava',1],drowned:['flood',0],starless:['astral',0],shattered:['keep',0]};
const D8_ZONE={meadow:['crypt',0],coast:['sea',1],cave:['forge',0],snow:['ice',1],heights:['keep',0],void:['astral',0]};
const D8_CAVE={meadow:'root',coast:'sea',cave:'lava',snow:'ice',heights:'rock',void:'astral'};
const D8_KEEP=2;            // carving stays this many tiles (Chebyshev) away from every asset
const D8={stat:{shaped:0,pools:0,dropped:0,poolsDropped:0,maps:0},n2d:{},hd:{},lair:{},card:0,dm:null};
LIGHTC.ice='rgba(150,215,255,.3)';LIGHTC.fungus='rgba(120,255,190,.28)';
function d8StyleFor(s,cave,fort){if(fort)return {mat:'keep',org:0};let Z=null;try{Z=ZS(s);}catch(e){}const th=(Z&&Z.theme)||'meadow';
  if(cave)return {mat:D8_CAVE[th]||'rock',org:1};const r=(Z&&Z.key&&D8_REALM[Z.key])||D8_ZONE[th]||['crypt',0];return {mat:r[0],org:r[1]};}
function d8StyleOf(m){if(!m||m.kind!=='dungeon'||m.archive||m.sanctum||typeof m.s!=='number')return null;return d8StyleFor(m.s,!!m.cave&&!m.fort,!!m.fort);}
// the map palette: the material, leaning a fifth of the way toward the realm and boss look (DTHEME[thv]) so each realm still reads as its own
function d8Var(thv,mat){const id=(thv||'meadow')+'%'+mat;if(DTHEME[id])return id;const M=D8M[mat],B=DTHEME[thv]||DTHEME.meadow,k=.2;
  DTHEME[id]={f:M.f.map((c,i)=>lerpHex(c,B.f[i],k)),w:M.w.map((c,i)=>lerpHex(c,B.w[i],k)),top:lerpHex(M.top,B.top,k*.5),acc:M.acc,acc2:M.acc2,name:mat};
  if(!THEME[id])THEME[id]=THEME[thv]||THEME[String(thv).split(/[@~#%]/)[0]]||THEME.meadow;return id;}
function d8Look(m){if(!m.d8)return;const base=m.thv||m.theme;if(String(base).includes('%'))return;m.thv=d8Var(base,m.d8);const M=D8M[m.d8];m.d8dark=M.dark;m.d8hero=M.hero;}
{const ab0=applyBossTheme;applyBossTheme=function(m){const r=ab0.apply(this,arguments);try{if(m&&m.d8)d8Look(m);}catch(e){}return r;};}

// =================== 2. reshaping organic places ===================
function d8Noise(seed,W,H,cell){const R=mulberry(seed),gw=Math.ceil(W/cell)+2,gh=Math.ceil(H/cell)+2,g=new Float32Array(gw*gh);for(let i=0;i<g.length;i++)g[i]=R();
  const s=t=>t*t*(3-2*t);return (x,y)=>{const fx=x/cell,fy=y/cell,ix=Math.floor(fx),iy=Math.floor(fy),u=s(fx-ix),v=s(fy-iy),a=g[iy*gw+ix],b=g[iy*gw+ix+1],c=g[(iy+1)*gw+ix],d=g[(iy+1)*gw+ix+1];
    return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;};}
const D8_RING=[[-1,-1],[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0]];
// carving (x,y) joins nothing new: its open side neighbours are already joined through the ring around it
function d8Simple(g,x,y){const op=D8_RING.map(([a,b])=>{const c=g[y+b]&&g[y+b][x+a];return c!=null&&!SOLID.includes(c);}),n4=[1,3,5,7].filter(i=>op[i]);if(!n4.length)return false;
  const seen=new Set([n4[0]]),st=[n4[0]];while(st.length){const i=st.pop();for(const j of [(i+1)%8,(i+7)%8])if(op[j]&&!seen.has(j)){seen.add(j);st.push(j);}}return n4.every(i=>seen.has(i));}
function d8Protect(m,rad){const g=m.t,H=g.length,W=g[0].length,P=g.map(r=>r.map(()=>false)),mark=(x,y)=>{for(let j=-rad;j<=rad;j++)for(let i=-rad;i<=rad;i++){const yy=y+j,xx=x+i;if(yy>=0&&xx>=0&&yy<H&&xx<W)P[yy][xx]=true;}};
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)if('EDX|KlCcPvgNQL'.includes(g[y][x]))mark(x,y);
  [m.start,m.wander,m.bossAt,m.lever,m.keyBar,m.vaultBar,m.prize].forEach(p=>{if(p)mark(p[0],p[1]);});(m.chests||[]).forEach(c=>mark(c[0],c[1]));
  return P;}
function d8Carve(m,rad){const g=m.t,H=g.length,W=g[0].length,sd=hashS('d8:'+((G.run&&G.run.seed)||0)+':'+m.id),N=d8Noise(sd,W,H,4.5),N2=d8Noise(sd+77,W,H,2.2),P=d8Protect(m,rad);let n=0;
  const open=(x,y)=>{const c=g[y]&&g[y][x];return c!=null&&!SOLID.includes(c);},k4=(x,y)=>[[1,0],[-1,0],[0,1],[0,-1]].filter(([a,b])=>open(x+a,y+b)).length;
  const pass=(ok)=>{const L=[];for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){if(g[y][x]!=='#'||P[y][x])continue;const k=k4(x,y);if(k&&ok(x,y,k,N(x,y)*.7+N2(x,y)*.3))L.push([x,y]);}
    L.forEach(([x,y])=>{if(g[y][x]==='#'&&k4(x,y)&&d8Simple(g,x,y)){g[y][x]='.';n++;}});};
  pass((x,y,k,v)=>v>.46);pass((x,y,k,v)=>k>=2&&v>.36);pass((x,y,k,v)=>v>.56);pass((x,y,k,v)=>k>=2&&v>.5);pass((x,y,k,v)=>v>.66);pass((x,y,k)=>k>=3);
  return n;}
function d8Pools(m,rad){const g=m.t,H=g.length,W=g[0].length,sd=hashS('d8p:'+((G.run&&G.run.seed)||0)+':'+m.id),N=d8Noise(sd,W,H,3),P=d8Protect(m,rad);let n=0;const cap=Math.round(W*H/70);
  const open=(x,y)=>{const c=g[y]&&g[y][x];return c!=null&&!SOLID.includes(c);},k4=(x,y)=>[[1,0],[-1,0],[0,1],[0,-1]].filter(([a,b])=>open(x+a,y+b)).length;
  for(let y=2;y<H-2&&n<cap;y++)for(let x=2;x<W-2&&n<cap;x++){if(g[y][x]!=='#'||P[y][x]||!k4(x,y)||N(x,y)<.66)continue;g[y][x]='~';n++;
    for(const [a,b] of [[1,0],[-1,0],[0,-1]]){const xx=x+a,yy=y+b;if(n<cap&&g[yy][xx]==='#'&&!P[yy][xx]&&yy>1&&xx>1&&xx<W-2&&N(xx,yy)>.62){g[yy][xx]='~';n++;}}}
  return n;}
function d8Issues(m){const d={rows:m.t,start:m.start,boss:m.bossAt,chests:m.chests||[],wander:m.wander||m.start,keyBarred:m.keyBarred};let a=0;
  try{if(m.bossAt)a+=validateDungeon(d).length;}catch(e){a+=99;}try{if(typeof mapIssues==='function')a+=mapIssues(m).length;}catch(e){a+=99;}return a;}
function d8Shape(m){const M=D8M[m.d8];if(!m.d8org&&!(M.liq&&(m.d8==='flood'||m.d8==='forge')))return;
  const t0=m.t.map(r=>r.slice()),i0=d8Issues(m),pa=()=>typeof pathAssets==='function'?pathAssets(m).length:0,p0=pa();
  const reset=()=>{m.t=t0.map(r=>r.slice());};
  const tries=m.d8org?[[D8_KEEP,1,1],[D8_KEEP+2,1,1],[D8_KEEP,1,0],[D8_KEEP+3,1,0]]:[[D8_KEEP,0,1],[D8_KEEP+3,0,1]];
  for(const [rad,carve,pools] of tries){reset();const nc=carve?d8Carve(m,rad):0,np=pools&&M.liq?d8Pools(m,rad):0;if(!nc&&!np)continue;
    if(d8Issues(m)<=i0&&pa()<=p0){m.d8carved=nc;m.d8pools=np;m.d8try=rad;if(nc)D8.stat.shaped++;if(np)D8.stat.pools++;if(pools===0&&M.liq)D8.stat.poolsDropped++;m.tl=null;return;}}
  reset();D8.stat.dropped++;m.d8carved=0;m.d8pools=0;}
{const g0=getMap;getMap=function(id){const had=!!MAPS[id],m=g0.apply(this,arguments);
  if(!had&&m&&!m.d8&&!window.__D8OFF){try{const st=d8StyleOf(m);if(st){m.d8=st.mat;m.d8org=st.org;D8.stat.maps++;if(!m.fort)d8Shape(m);d8Look(m);}}catch(e){try{wdLog('d8 '+id+': '+e.message);}catch(_){}}}
  return m;};}

// =================== 1. the look, 2D ===================
const d8tv=(x,y)=>((x*7+y*13)%4+4)%4;   // the block face variant HD-2D picks for a tile (hd2d.js tv); decorated faces are variants 2 and 3
const D8_LIQ={ice:['#a8d4f0','#c8e8fa','#eefaff','#7aa8cc'],lava:['#e8551a','#ff8a2a','#ffd04a','#6a1a0a'],water:['#1e5a66','#2a7482','#6ac0c4','#123a44'],murk:['#173634','#22504c','#6aa898','#0c2020'],
  bog:['#26301c','#34442a','#7a9a4a','#161c10'],void:['#0a0616','#1a1030','#b080ff','#05030c']};
// one wall face (16 wide, H tall) for a material; f draws relative to the face, R is seeded. deco: the decorated variant (crystals,
// fungi, banners...) at the same tiles in both renderers
function d8FaceArt(f,R,mat,D,H,deco,org,lights,px,py){const W=D.w,M=D8M[mat];
  if(org){f(W[0],0,0,16,H);for(let i=0;i<9;i++){const w=3+Math.floor(R()*6),h=2+Math.floor(R()*4),x=Math.floor(R()*14)-1,y=2+Math.floor(R()*(H-4));f(R()<.4?W[2]:R()<.6?shade(W[0],.86):W[1],x,y,w,h);f(tint(W[0],.12),x,y,w,1);}
    for(let i=0;i<3;i++){const x=1+Math.floor(R()*13),y=3+Math.floor(R()*(H-7));f(W[3],x,y,1,3);f(W[3],x+1,y+2,1,2);}
    for(let x=0;x<16;x+=2){const d=1+Math.floor(R()*3);f(D.top,x,0,2,d);}f(W[3],0,H-1,16,1);for(let x=0;x<16;x+=3)f(shade(W[1],.8),x,H-2-Math.floor(R()*2),3,2);}
  else{f(W[0],0,0,16,H);for(let r=0;r<H;r+=4){const off=(r/4+px/16)%2?0:4;for(let i=-off;i<16;i+=8){const col=R()<.25?W[2]:R()<.5?W[0]:shade(W[0],.92),a=Math.max(0,i),w=Math.min(7,16-a);f(col,a,r,w,3);f(tint(col,.18),a,r,w,1);}f(W[1],0,r+3,16,1);}
    f(D.top,0,0,16,2);f(W[2],0,2,16,1);f(W[3],0,H-1,16,1);}
  const L=(t,x,y,r)=>{if(lights)lights.push([px+x,py+y,r,t]);};
  if(mat==='ice'||mat==='icevault'||mat==='rock'){if(mat!=='rock'){for(let x=1;x<16;x+=3){const l=2+((x*5+Math.floor(R()*5))%(mat==='ice'?6:4));f('#eefaff',x,1,2,1);f('#d4f0ff',x,2,1,l);f('#ffffff',x,2,1,1);}
      for(let i=0;i<3;i++)f('rgba(230,248,255,.35)',2+Math.floor(R()*12),3,1,H-6);}
    if(deco){const c=mat==='rock'?[D.acc,D.acc2]:['#bfe6ff','#ffffff'];f(shade(c[0],.7),4,H-9,3,8);f(c[0],5,H-11,2,10);f(c[1],5,H-11,1,3);f(c[0],8,H-7,3,6);f(c[1],8,H-7,1,2);f(c[0],11,H-5,2,4);L('ice',8,H-6,12);}}
  else if(mat==='lava'||mat==='forge'){if(mat==='forge'){f(shade(W[1],.8),3,3,1,H-5);f(shade(W[1],.8),12,3,1,H-5);}
    if(R()<.6){let x=3+Math.floor(R()*9),y=3;f('#ff5a1a',x,y,1,2);for(let k=0;k<5&&y<H-3;k++){y+=2;x+=R()<.5?1:-1;f('#ff7a2a',x,y,1,2);}}
    if(deco){if(mat==='forge'){f('#1a1210',4,H-10,8,6);f('#ff7a2a',5,H-9,6,4);f('#ffd04a',6,H-8,4,2);for(let i=5;i<11;i+=2)f('#1a1210',i,H-9,1,4);}else{f('#1a0a06',3,H-6,10,3);f('#ff8a2a',4,H-5,8,1);f('#ffd04a',6,H-5,3,1);}L('lava',8,H-5,22);}}
  else if(mat==='sea'||mat==='flood'){for(let i=0;i<3;i++){const x=1+Math.floor(R()*14);f('rgba(200,250,255,.25)',x,2,1,H-4);}
    if(mat==='flood'){f('#4a6a3a',0,1,16,1);for(let x=0;x<16;x+=2)if(R()<.6)f('#5a8a4a',x,2,1,1+Math.floor(R()*3));f('rgba(20,40,40,.35)',0,H-5,16,4);}
    else{for(let i=0;i<4;i++)f('#c8d8d0',1+Math.floor(R()*14),4+Math.floor(R()*(H-8)),1,1);for(let x=1;x<16;x+=4)f('#2a6a4a',x,H-5-Math.floor(R()*3),1,5);}
    if(deco){if(mat==='sea'){f('#f0a0b0',3,H-8,2,7);f('#f0a0b0',2,H-6,1,2);f('#ff8aa0',5,H-6,1,2);f('#e87a9a',9,H-6,2,5);f('#f8c0c8',9,H-6,1,1);f('#5ad0c0',12,H-4,2,3);L('cyan',8,H-5,14);}
      else{f(W[3],5,4,6,H-6);f('#7ad0c8',7,6,2,2);f(shade(W[2],.9),4,3,8,1);}}}
  else if(mat==='root'){for(let i=0;i<4;i++){let x=1+Math.floor(R()*14),y=0;f('#3a2614',x,0,1,2);for(let k=0;k<H/3;k++){y+=2;x+=R()<.3?1:R()<.5?-1:0;f(k%2?'#4a301a':'#3a2614',x,y,1,2);}}
    for(let x=0;x<16;x+=2)if(R()<.7)f('#4a7a3a',x,0,2,1+Math.floor(R()*3));
    if(deco){f('#e8e0c8',4,H-6,1,4);f('#7af0a0',2,H-8,5,2);f('#c8ffd8',3,H-8,2,1);f('#e8e0c8',10,H-4,1,3);f('#c890f0',8,H-6,5,2);f('#f0d0ff',9,H-6,2,1);L('fungus',7,H-6,18);}}
  else if(mat==='crypt'||mat==='keep'){if(deco&&(px*3+py*5)%7!==0){const cl=mat==='keep'?['#8a1a2a','#c0392b']:['#3a4a2a','#6a7a3a'];if(d8tv(px/16,py/16)===2){f('#3a2a1a',4,2,8,1);f(cl[0],5,3,6,H-6);f(cl[1],6,3,4,H-7);f(D.acc,7,6,2,2);f(cl[0],5,H-3,2,1);f(cl[0],9,H-3,2,1);}
      else{f(W[3],5,4,6,7);f('#e8e0d0',6,6,4,3);f('#150b17',6,7,1,1);f('#150b17',9,7,1,1);f(W[3],6,11,4,1);}}
    if(mat==='crypt')for(let x=0;x<16;x+=3)if(R()<.4)f('#4a6a3a',x,H-3,2,2);}
  else if(mat==='sand'){f(D.acc,0,6,16,1);for(let x=1;x<16;x+=4){f(shade(W[1],.75),x,8,2,2);f(shade(W[1],.75),x+1,10,1,1);}f(tint(W[0],.2),0,H-4,16,3);for(let x=0;x<16;x+=2)f('#e0c494',x,H-3-((x*3)%3),2,3);
    if(deco&&(px*3+py*5)%7!==0){f(shade(W[1],.7),5,3,6,9);f(D.acc,7,5,2,2);f(D.acc2,7,8,2,1);}}
  else if(mat==='astral'){if(R()<.6)f(D.acc,2+Math.floor(R()*12),4+Math.floor(R()*(H-8)),2,2);if(deco){f(D.acc,7,4,2,7);f(D.acc,5,7,6,1);f(D.acc2,7,H-5,2,2);L('violet',8,8,16);}}
  void M;}
function d8TopArt(f,R,mat,D,org){const base=org?lerpHex(D.top,D.w[1],mat==='ice'?.55:.38):D.top;f(base,0,0,16,16);
  if(org)for(let i=0;i<5;i++){const w=2+Math.floor(R()*5),h=1+Math.floor(R()*3),x=Math.floor(R()*14),y=Math.floor(R()*14);f(R()<.5?shade(base,.8):tint(base,.08),x,y,w,h);}
  for(let i=0;i<3;i++)f(shade(D.w[3],1.5),Math.floor(R()*14),Math.floor(R()*14),1,1);
  if(mat==='ice'||mat==='icevault')for(let i=0;i<5;i++)f('rgba(220,245,255,.35)',Math.floor(R()*13),Math.floor(R()*14),3,1);
  else if(mat==='lava'&&R()<.4)f('#ff5a1a',Math.floor(R()*14),Math.floor(R()*14),1,1);
  else if(mat==='root'||mat==='flood')for(let i=0;i<3;i++)f('#2a4a22',Math.floor(R()*13),Math.floor(R()*13),3,2);
  else if(mat==='sand')for(let i=0;i<3;i++)f(shade(D.w[3],1.4),Math.floor(R()*12),Math.floor(R()*14),4,1);
  else if(mat==='astral'&&R()<.5)f(D.acc,Math.floor(R()*15),Math.floor(R()*15),1,1);}
function d8Floor(f,R,mat,D,org,x,y,m,lights,px,py){const F=D.f;
  if(org){f(F[0],0,0,16,16);for(let i=0;i<10;i++){const s=1+Math.floor(R()*3);f(R()<.4?F[2]:R()<.6?F[1]:shade(F[0],.94),Math.floor(R()*15),Math.floor(R()*15),s+1,s);}
    for(let i=0;i<3;i++)f(F[3],Math.floor(R()*15),Math.floor(R()*15),2,1);}
  else{f(F[0],0,0,16,16);for(let j=0;j<2;j++)for(let i=0;i<2;i++){const col=R()<.3?F[2]:R()<.5?F[0]:F[1];f(col,i*8,j*8,7,7);f(tint(col,.12),i*8,j*8,7,1);}
    f(F[3],7,0,1,16);f(F[3],15,0,1,16);f(F[3],0,7,16,1);f(F[3],0,15,16,1);if(R()<.25){const cx=Math.floor(R()*12)+2,cy=Math.floor(R()*12)+2;f(F[3],cx,cy,3,1);f(F[3],cx+2,cy+1,1,2);}}
  const c=tileAt(m,x,y),plain=c==='.'||c==='r',L=(t,xx,yy,r)=>{if(lights)lights.push([px+xx,py+yy,r,t]);};
  if(mat==='ice'||mat==='icevault'){if(R()<.35){let a=Math.floor(R()*12)+2,b=Math.floor(R()*12)+2;for(let k=0;k<5;k++){f('#e4f6ff',a,b,1,1);f('#7898b8',a+1,b,1,1);a+=R()<.5?1:-1;b+=1;}}
    for(let i=0;i<3;i++)f('#ffffff',Math.floor(R()*15),Math.floor(R()*15),1,1);if(R()<.2)f('rgba(255,255,255,.4)',Math.floor(R()*10),Math.floor(R()*12),5,2);}
  else if(mat==='lava'||mat==='forge'){for(let i=0;i<3;i++)f('#6a5e5a',Math.floor(R()*15),Math.floor(R()*15),1,1);
    if(plain&&R()<(mat==='lava'?.05:.025)){f('#1a0a06',4,6,8,4);f('#ff6a1a',5,7,6,2);f('#ffd04a',7,7,2,1);L('lava',8,8,14);}}
  else if(mat==='sea'||mat==='flood'){if(plain&&R()<.1){const w0=mat==='sea'?'#3a7a8a':'#3a5a56',w1=mat==='sea'?'#5a9ab0':'#4a6e68';f(shade(F[3],.9),5,7,6,1);f(shade(F[3],.9),3,8,10,3);f(shade(F[3],.9),4,11,8,1);f(w0,5,8,6,1);f(w0,4,9,8,2);f(w1,5,10,6,1);f('#a8e0e8',6,8,2,1);}
    else if(R()<.25)f('rgba(170,230,240,.18)',Math.floor(R()*10),Math.floor(R()*12),5,1);if(mat==='sea'&&R()<.15)f('#f0b8c0',Math.floor(R()*14),Math.floor(R()*14),2,1);
    if(mat==='flood'&&R()<.3)f('#4a6a3a',Math.floor(R()*13),Math.floor(R()*13),3,1);}
  else if(mat==='root'){if(R()<.35){f('#3e5a2a',Math.floor(R()*12),Math.floor(R()*12),4,2);f('#4e7a34',Math.floor(R()*12),Math.floor(R()*12),3,1);}
    if(R()<.2){let a=0,b=Math.floor(R()*14);for(let k=0;k<8;k++){f('#3a2614',a,b,2,1);a+=2;b+=R()<.3?1:R()<.5?-1:0;}}
    if(plain&&R()<.06){f('#e8e0c8',7,9,1,3);f('#7af0a0',5,8,5,2);L('fungus',8,9,12);}}
  else if(mat==='crypt'){if(R()<.12){f('#e8e0d0',4,9,5,1);f('#e8e0d0',3,8,1,3);f('#e8e0d0',9,8,1,3);}if(R()<.2)f('#4a6a3a',Math.floor(R()*13),Math.floor(R()*13),2,1);}
  else if(mat==='sand'){const wN=tileAt(m,x,y-1)==='#',wW=tileAt(m,x-1,y)==='#';if(wN||wW||R()<.25){f('#e0c494',0,wN?0:6,16,wN?6:5);for(let i=0;i<16;i+=2)f('#ecd4a4',i,(wN?5:9)+((i*3+x)%3),2,1);}
    if(R()<.12)f(shade(F[3],.9),Math.floor(R()*12),Math.floor(R()*12),4,1);}
  else if(mat==='keep'){if(!org&&(x+y*3)%11===0){f(shade(F[3],.9),6,6,4,4);f(D.acc,7,7,2,2);}}
  else if(mat==='astral'){for(let i=0;i<2;i++)if(R()<.4)f(R()<.5?D.acc:D.acc2,Math.floor(R()*15),Math.floor(R()*15),1,1);}
  else if(mat==='rock'){for(let i=0;i<4;i++)f(shade(F[0],R()<.5?1.2:.8),Math.floor(R()*15),Math.floor(R()*15),2,1);}}
function d8Rubble(f,R,mat,D){const K={ice:['#eefaff','#bfe6ff'],icevault:['#eefaff','#bfe6ff'],lava:['#2a1a16','#ff7a2a'],forge:['#2a2220','#ff8a3a'],sea:['#f0b8c0','#e8e0d0'],flood:['#5a6a5a','#4a7a3a'],
  root:['#4a301a','#7af0a0'],crypt:['#e8e0d0','#8a8270'],sand:['#a8845a','#e0c494'],keep:['#6a687a','#a2a0b2'],astral:['#5e4e90','#b080ff'],rock:['#5a5866','#8ad0ff']}[mat]||[D.w[1],D.w[2]];
  for(let i=0;i<5;i++)f(i===2?K[1]:K[0],Math.floor(R()*13),Math.floor(R()*13),2+Math.floor(R()*2),2);}
function d8Liquid(f,R,liq,x,y,frame,m,lights,px,py){const C=D8_LIQ[liq]||D8_LIQ.water,open=(dx,dy)=>{const c=tileAt(m,x+dx,y+dy);return c!=='#'&&c!=='~';};
  f(C[0],0,0,16,16);
  if(liq==='lava'){for(let i=0;i<4;i++){const yy=(i*4+frame*2+x)%16;f(C[1],0,yy,16,2);}for(let i=0;i<3;i++)f(C[2],(x*5+i*6+frame*3)%14,(y*3+i*5)%14,2,1);for(let i=0;i<2;i++)f(C[3],Math.floor(R()*12),Math.floor(R()*12),4,2);
    if(lights)lights.push([px+8,py+8,26,'lava']);}
  else if(liq==='ice'){f(C[1],0,0,16,3);for(let i=0;i<3;i++){let a=Math.floor(R()*14),b=Math.floor(R()*10)+3;for(let k=0;k<5;k++){f(C[3],a,b,1,1);a+=1;b+=R()<.5?1:0;}}f(C[2],2+(frame?5:0),4,4,1);f(C[2],9-(frame?4:0),10,3,1);
    if(lights)lights.push([px+8,py+8,14,'ice']);}
  else if(liq==='void'){for(let i=0;i<4;i++)f(i%2?C[2]:'#5fc9a0',(x*7+i*5+frame)%15,(y*5+i*7)%15,1,1);if(lights)lights.push([px+8,py+8,16,'violet']);}
  else{for(let i=0;i<3;i++){const yy=3+i*5,xx=(x*5+i*4+frame*3)%10;f(C[1],xx,yy,6,1);}f(C[2],(x*3+frame*5)%12,(y*7)%12+2,3,1);f(C[3],0,15,16,1);
    if(liq==='bog'){if(R()<.5){f('#4a6a2a',3,5,4,3);f('#6a8a3a',4,5,2,1);}if(R()<.3)f('#c8e08a',10,9,1,1);}
    if(liq==='water'&&lights)lights.push([px+8,py+8,12,'cyan']);}
  if(open(0,-1))f(tint(C[0],.35),0,0,16,1);if(open(-1,0))f(tint(C[0],.25),0,0,1,16);if(open(1,0))f(tint(C[0],.25),15,0,1,16);if(open(0,1))f(shade(C[0],.7),0,15,16,1);
  if(tileAt(m,x,y-1)==='#'){f('rgba(0,0,0,.35)',0,0,16,3);}}
// the 2D tile for a themed dungeon (replaces drawDTile for maps with a material)
function d8Tile(ctx,m,x,y,frame){const mat=m.d8,D=DTH(m),org=m.d8org,c=tileAt(m,x,y),px=x*TS,py=y*TS,R=mulberry(x*5113+y*2671+m.s*7),L=m.lights=m.lights||[];
  const f=(col,a,b,w,h)=>{ctx.fillStyle=col;ctx.fillRect(px+a,py+b,w,h);};const isW=(dx,dy)=>tileAt(m,x+dx,y+dy)==='#';D8.n2d[mat]=(D8.n2d[mat]||0)+1;
  if(c==='#'){
    if(!isW(0,1)){d8FaceArt(f,R,mat,D,16,d8tv(x,y)>=2,org,(x*3+y*5)%(org?11:7)===3?L:null,px,py);
      if(!org&&(x*3+y*5)%7===0&&tileAt(m,x,y+1)!=='~'){f('#3a2a1a',7,6,2,6);f('#5a4a3a',6,10,4,2);L.push([px+8,py+5,34,'torch']);m.torches=m.torches||[];m.torches.push([px+8,py+5]);}}
    else{d8TopArt(f,R,mat,D,org);if(!isW(-1,0))f(D.w[1],0,0,2,16);if(!isW(1,0))f(D.w[1],14,0,2,16);if(!isW(0,-1))f(D.w[1],0,0,16,2);
      if(org){// rounded outer corners of the rock mass
        if(!isW(-1,0)&&!isW(0,-1)){f(D.f[1],0,0,3,1);f(D.f[1],0,0,1,3);}if(!isW(1,0)&&!isW(0,-1)){f(D.f[1],13,0,3,1);f(D.f[1],15,0,1,3);}}}
    return;}
  if(c==='~'){d8Liquid(f,R,D8M[mat].liq||'water',x,y,frame,m,(x*3+y*5)%5===0&&!(m.theme==='cave'&&(x+y)%3===0)?L:null,px,py);return;}
  d8Floor(f,R,mat,D,org,x,y,m,(x*5+y*3)%9===0?L:null,px,py);
  if(org){// rock fillets in the inner corners, so chambers read round
    const fil=(cx,cy,sx,sy)=>{for(let k=0;k<4;k++)f(D.w[1],cx+(sx>0?0:-(3-k)),cy+(sy>0?k:-k),3-k+1,1);};
    if(isW(-1,0)&&isW(0,-1))fil(0,0,1,1);if(isW(1,0)&&isW(0,-1)){f(D.w[1],12,0,4,1);f(D.w[1],13,1,3,1);f(D.w[1],14,2,2,1);f(D.w[1],15,3,1,1);}
    if(isW(-1,0)&&isW(0,1)){f(D.w[0],0,15,4,1);f(D.w[0],0,14,3,1);f(D.w[0],0,13,1,1);}if(isW(1,0)&&isW(0,1)){f(D.w[0],12,15,4,1);f(D.w[0],13,14,3,1);f(D.w[0],15,13,1,1);}
    if(isW(-1,0))for(let j=0;j<16;j+=4)if(R()<.5)f(D.w[1],0,j,1,2);if(isW(1,0))for(let j=0;j<16;j+=4)if(R()<.5)f(D.w[1],15,j,1,2);}
  if(isW(0,-1)||tileAt(m,x,y-1)==='~'){ctx.fillStyle='rgba(6,2,12,.38)';ctx.fillRect(px,py,16,4);}
  if(isW(-1,0)){ctx.fillStyle='rgba(6,2,12,.2)';ctx.fillRect(px,py,2,16);}
  if(c==='E'){f('#2a1a10',0,0,16,16);for(let i=0;i<5;i++){const yy=12-i*3;f(tint(D.f[0],.3),1+i,yy,14-i*2,2);f(shade(D.f[0],.8),1+i,yy+2,14-i*2,1);}f('#fff0b0',5,0,6,3);f('#ffe08a',1,0,1,16);f('#ffe08a',14,0,1,16);L.push([px+8,py+2,46,'day']);}
  if(c==='X'||(c==='.'&&m.bossAt&&x===m.bossAt[0]&&y===m.bossAt[1])){ctx.globalAlpha=.7;for(let a=0;a<24;a++){const t=a/24*Math.PI*2;f(D.acc,8+Math.round(Math.cos(t)*7),8+Math.round(Math.sin(t)*5),1,1);}ctx.globalAlpha=1;}
  if(c==='r')d8Rubble(f,R,mat,D);}
{const dt0=drawDTile;drawDTile=function(ctx,m,x,y,frame){if(m&&m.d8&&D8M[m.d8])return d8Tile(ctx,m,x,y,frame);return dt0.apply(this,arguments);};}
// decor props in the material (P stands at least PG_PROP_H.P = 23 px tall in every material, g 15)
const D8P={};
function d8Prop(mat,kind,D){const key=mat+':'+kind+':'+D.acc+D.w[0];if(D8P[key])return D8P[key];const cv=mkCv(14,30),c=cv.getContext('2d'),f=(col,x,y,w,h)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};const W=D.w;
  if(kind==='grave'){f(W[3],1,16,12,2);f(W[1],2,8,10,9);f(W[2],3,7,8,2);f(W[0],3,9,8,7);f('#e8e0d0',5,10,4,3);f('#150b17',5,11,1,1);f('#150b17',8,11,1,1);f(D.acc,2,16,3,1);return D8P[key]=cv;}
  if(mat==='ice'||mat==='icevault'){f('#6a9ac0',3,27,9,2);f('#9ad0f0',4,6,4,22);f('#dff8ff',5,4,2,4);f('#ffffff',5,7,1,14);f('#bfe6ff',8,12,3,16);f('#eefaff',9,10,1,4);f('#8fc8e8',1,17,3,11);f('#dff8ff',2,15,1,3);}
  else if(mat==='lava'||mat==='forge'){f('#1a1210',2,27,11,2);f('#2e2220',3,5,8,23);f('#44302c',4,4,6,2);f('#3a2a26',9,8,2,19);f('#ff6a1a',6,9,1,4);f('#ff8a2a',7,12,1,5);f('#ffd04a',6,16,1,2);f('#ff6a1a',5,19,1,5);}
  else if(mat==='sea'||mat==='flood'){if(mat==='sea'){f(W[1],2,22,11,7);f(W[2],3,21,9,2);f('#f0a0b0',5,6,2,16);f('#f0a0b0',2,9,2,6);f('#f0a0b0',3,14,3,1);f('#ff8aa0',9,8,2,14);f('#ff8aa0',11,11,2,1);f('#f8c8d0',5,6,1,1);f('#f8c8d0',9,8,1,1);f('#5ad0c0',3,24,2,2);}
    else{f(W[3],2,27,10,2);f(W[0],3,8,8,20);f(W[2],3,8,8,2);f(W[1],8,10,2,17);f('#4a7a3a',3,10,2,6);f('#5a8a4a',9,18,2,5);f(W[2],2,5,4,3);f(W[0],7,6,3,2);}}
  else if(mat==='root'){f('#5a4a30',5,12,4,17);f('#6e5a3a',6,12,1,17);f('#3a2a14',3,27,8,2);f('#2a8a5a',0,6,14,6);f('#7af0a0',1,5,12,5);f('#c8ffd8',3,5,4,1);f('#c8ffd8',9,7,2,1);f('#e8e0c8',4,11,6,1);}
  else if(mat==='crypt'){f(W[3],2,27,10,2);f(W[1],3,10,8,18);f(W[0],4,10,6,17);f(W[2],4,4,6,7);f(W[0],5,5,4,5);f('#150b17',5,7,1,1);f('#150b17',8,7,1,1);f(W[2],2,12,2,8);f(W[2],10,12,2,8);}
  else if(mat==='sand'){f(W[3],2,27,10,2);f(W[1],4,4,6,24);f(W[0],5,5,4,22);f(W[2],6,2,2,3);f(D.acc,6,9,2,2);f(D.acc,6,14,2,1);f(D.acc2,6,18,2,2);f(D.acc,6,23,2,1);}
  else if(mat==='keep'){f(W[3],3,27,8,2);f(W[1],5,10,4,18);f(W[2],6,10,1,18);f('#2a2a34',2,8,10,3);f('#5a4a40',3,7,8,2);f('#ff7a2a',4,3,6,4);f('#ffe08a',6,2,2,4);}
  else if(mat==='astral'){f(W[3],2,27,10,2);f(W[1],4,4,6,24);f(W[0],5,4,4,23);f(D.acc,6,7,2,8);f(D.acc,5,10,4,1);f(D.acc2,6,19,2,2);f('#ffffff',6,7,1,1);}
  else{f(W[3],2,27,10,2);f(W[1],4,7,6,21);f(W[0],5,5,4,23);f(W[2],6,4,2,3);f(D.acc,6,3,2,3);f('#ffffff',6,3,1,1);f(D.acc2,8,15,1,2);}
  return D8P[key]=cv;}
const D8_PGLOW={ice:'ice',icevault:'ice',lava:'lava',forge:'lava',root:'fungus',keep:'torch',astral:'violet',rock:'ice'};
{const oc0=objCanvas;objCanvas=function(theme,kind,v){const m=D8.dm;if(m&&m.d8&&(kind==='pillar'||(kind==='grave'&&m.d8==='crypt')))return d8Prop(m.d8,kind,DTH(m));return oc0.apply(this,arguments);};}
{const do0=drawObjects;drawObjects=function(ctx,m,y){const keep=D8.dm;D8.dm=m&&m.kind==='dungeon'&&m.d8?m:null;
  try{const r=do0.apply(this,arguments);if(D8.dm){const g=m.theme==='cave'||m.theme==='void'?null:D8_PGLOW[m.d8];if(g)for(let x=0;x<m.w;x++)if(tileAt(m,x,y)==='P'){m.lights=m.lights||[];m.lights.push([x*TS+8,y*TS-4,g==='torch'?26:16,g]);}}return r;}
  finally{D8.dm=keep;}};}

// =================== 1. the look, HD-2D ===================
{const hk0=hdKind;hdKind=function(m,c){if(c==='~'&&m&&m.kind==='dungeon'&&m.d8){const q=D8M[m.d8].liq;return q==='lava'?6:q==='void'?5:4;}return hk0.apply(this,arguments);};}
{const hs0=hdStructCanvas;hdStructCanvas=function(m,S){const cv=hs0.apply(this,arguments);try{if(m&&m.kind==='dungeon'&&m.d8&&D8M[m.d8]){const c=cv.getContext('2d'),D=DTH(m),HA=S.hArt;
    for(let v=0;v<4;v++){const x0=v*16,R=mulberry(v*997+m.s*31+7),f=(col,x,y,w,h)=>{c.fillStyle=col;c.fillRect(x0+x,y,w,h);};c.clearRect(x0,0,16,HA);d8FaceArt(f,R,m.d8,D,HA,v>=2,m.d8org,null,v*16,0);f('rgba(0,0,0,.18)',0,HA-4,16,3);
      const R2=mulberry(v*71+m.s+3),g=(col,x,y,w,h)=>{c.fillStyle=col;c.fillRect(x0+x,80+y,w,h);};d8TopArt(g,R2,m.d8,D,m.d8org);}
    D8.hd.struct=m.d8;D8.hd.id=m.id;}}catch(e){}return cv;};}

// =================== 1. battles fought here use the same material ===================
{const sb0=startBattle;startBattle=function(spec){try{if(spec&&typeof spec==='object'&&!(G&&G.daily)&&spec.kind!=='daily'&&spec.kind!=='arena'&&V.screen==='world'&&WS.m&&WS.m.d8){spec.d8=WS.m.d8;spec.d8org=WS.m.d8org?1:0;}}catch(e){}
  return sb0.apply(this,arguments);};}
function d8BgExtra(ctx,W,H,R,mat,pre){const gy=bgGY(H),D=DTHEME['d8'+mat],f=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h);};
  if(mat==='ice'||mat==='icevault'){for(let x=0;x<W;x+=3+Math.floor(R()*4)){const l=3+Math.floor(R()*10);f('#eefaff',x,0,2,2);f('#cfeeff',x,2,1,l);}for(let i=0;i<6;i++){const x=Math.floor(R()*W),y=gy+2+Math.floor(R()*(H-gy-4));f('#ffffff',x,y,4,1);f('#bfe6ff',x+1,y-1,2,1);}}
  else if(mat==='lava'||mat==='forge'){f(D8_LIQ.lava[1],0,gy-3,W,2);f(D8_LIQ.lava[2],0,gy-3,W,1);for(let i=0;i<5;i++){const x=Math.floor(R()*W),y=gy+3+Math.floor(R()*(H-gy-5));f('#1a0a06',x,y,7,2);f('#ff6a1a',x+1,y,5,1);}}
  else if(mat==='sea'||mat==='flood'){for(let i=0;i<5;i++){const x=Math.floor(R()*W),y=gy+4+Math.floor(R()*(H-gy-7)),w=8+Math.floor(R()*10);f(D8_LIQ.water[3],x,y,w,3);f(D8_LIQ.water[1],x+1,y,w-2,2);f(D8_LIQ.water[2],x+2,y,3,1);}
    for(let i=0;i<12;i++)f('rgba(200,250,255,.5)',Math.floor(R()*W),Math.floor(R()*gy*.6),1,3);}
  else if(mat==='root'){for(let i=0;i<10;i++){let x=Math.floor(R()*W),y=0;for(let k=0;k<6+Math.floor(R()*10);k++){f('#3a2614',x,y,1,2);y+=2;x+=R()<.3?1:R()<.5?-1:0;}}for(let i=0;i<6;i++){const x=Math.floor(R()*W),y=gy-1;f('#e8e0c8',x,y-3,1,3);f(R()<.5?'#7af0a0':'#c890f0',x-2,y-5,5,2);}}
  else if(mat==='sand'){for(let i=0;i<4;i++){const x=Math.floor(R()*W),y=gy+2+Math.floor(R()*(H-gy-4));ctx.fillStyle='#e0c494';ctx.beginPath();ctx.ellipse(x,y,14+R()*10,3,0,0,7);ctx.fill();}}
  else if(mat==='crypt'||mat==='keep'){[W*.12,W*.88].forEach(x=>{f('#3a2a1a',x-6,H*.1,12,1);f(mat==='keep'?'#8a1a2a':'#3a4a2a',x-5,H*.1+1,10,H*.18);f(D.acc,x-1,H*.16,2,3);});}
  else if(mat==='astral'){for(let i=0;i<18;i++)f(R()<.5?D.acc:D.acc2,Math.floor(R()*W),Math.floor(R()*gy),1,1);}
  void pre;}
function d8BgKey(pre,mat,base){const id='d8'+mat,M=D8M[mat];if(!DTHEME[id])DTHEME[id]={f:M.f.slice(),w:M.w.slice(),top:M.top,acc:M.acc,acc2:M.acc2,name:mat};
  const key=pre+id;if(!BG[key]&&BG[pre+base])BG[key]=function(ctx,W,H,R){const keep=DTHEME[base];DTHEME[base]=DTHEME[id];try{BG[pre+base](ctx,W,H,R);}finally{DTHEME[base]=keep;}d8BgExtra(ctx,W,H,R,mat,pre);};
  return BG[key]?key:null;}
{const bt0=battleTheme;battleTheme=function(){const k=bt0.apply(this,arguments);try{const sp=B&&B.spec;if(!sp||!sp.d8||!D8M[sp.d8])return k;const mt=/^(d_|c_|boss_)([a-z]+)$/.exec(k);if(!mt)return k;
  const pre=mt[1]==='d_'&&sp.d8org?'c_':mt[1];return d8BgKey(pre,sp.d8,mt[2])||k;}catch(e){return k;}};}

// =================== 3. the boss lair on the field ===================
function d8LairState(m){const s=m.s,st=d8StyleFor(s,false,false),lit=!!(G&&G.cleared&&G.cleared[s]);let bk=null;try{bk=bossAtStage(s);}catch(e){}const B=(typeof BTHEME!=='undefined'&&BTHEME[bk])||null;
  return {mat:st.mat,lit,bk,cloth:B?B.mix:'#5a2a4a',em:B?B.dec[0]:'#e8c070',motif:B?B.motif:'crown'};}
const D8L={W:64,H:100};
// part: 'all' (2D), 'card' (HD-2D: the gate, braziers and plaque, at most 56 px tall), 'tower' (HD-2D billboard behind the gate)
function d8LairCanvas(L,part){const key='lair:'+L.mat+':'+L.bk+':'+(L.lit?1:0)+':'+part;return imgOf(key,()=>{const W=D8L.W,H=D8L.H,cv=mkCv(W,H),c=cv.getContext('2d'),M=D8M[L.mat],b=H-1;let w=M.w;
  const f=(col,x,y,ww,hh)=>{c.fillStyle=col;c.fillRect(x,y,ww,hh);};const ww0=w;w=ww0.map(q=>shade(q,.72));const eye=L.lit?'#8a6a3a':'#ff3a2a',fire=L.lit?['#ffd04a','#fff6c0']:['#ff3a2a','#ffb04a'],beac=L.lit?['#ffd04a','#fff6c8']:['#c03aff','#ff6a4a'];
  const tower=part!=='card',gate=part!=='tower';
  if(tower){// the dark tower, tapering, with lit slits and the beacon cage on top
    const t0=8;f('#150b17',20,t0+6,24,b-t0-6);f(shade(w[1],.55),21,t0+7,22,b-t0-8);for(let y=t0+10;y<b-30;y+=5)f(shade(w[0],.62),22,y,20,3);
    f(shade(w[3],1.1),21,t0+7,2,b-t0-8);f(shade(w[0],.75),40,t0+7,2,b-t0-8);
    for(let i=0;i<4;i++)f('#150b17',19+i*7,t0+2,5,5),f(shade(w[1],.7),20+i*7,t0+3,3,4);
    [t0+18,t0+32].forEach(y=>{f('#150b17',30,y,4,8);f(L.lit?'#ffd88a':'#ff4a3a',31,y+1,2,6);});
    // the beacon: a cage with a burning orb
    f('#150b17',26,0,12,t0+3);f('#3a3040',27,1,10,t0+1);f(beac[0],29,1,6,t0-1);f(beac[1],31,2,2,t0-4);f('#3a3040',28,1,1,t0);f('#3a3040',35,1,1,t0);
    // the Scourge's banner (relit: the realm's gold pennant)
    const by=t0+40;f('#2a1a10',25,by-1,14,2);f(L.lit?'#c89a3a':L.cloth,26,by+1,12,22);f(L.lit?'#e8c060':shade(L.cloth,1.25),26,by+1,12,2);f(L.lit?'#c89a3a':L.cloth,26,by+23,4,3);f(L.lit?'#c89a3a':L.cloth,34,by+23,4,3);
    d8Glyph(f,L.lit?'sun':L.motif,32,by+11,L.lit?'#fff2b0':L.em);}
  if(gate){const gy=b-42;// the skull-carved gate
    f('#150b17',6,gy-1,52,b-gy+2);f(w[1],7,gy,50,b-gy);f(w[0],8,gy+1,48,b-gy-2);for(let y=gy+4;y<b-2;y+=5)for(let x=8+((y/5)%2?0:5);x<56;x+=10)f(shade(w[0],.85),x,y,9,1);
    f(w[2],7,gy,50,2);for(let x=7;x<57;x+=6)f(w[2],x,gy-3,4,3);
    // horns
    c.fillStyle=tint(w[2],.35);c.beginPath();c.moveTo(14,gy+2);c.lineTo(4,gy-12);c.lineTo(18,gy+2);c.fill();c.beginPath();c.moveTo(50,gy+2);c.lineTo(60,gy-12);c.lineTo(46,gy+2);c.fill();
    // the skull over the door
    const sx=32,sy=gy+10;c.fillStyle='#e8e0d0';c.beginPath();c.ellipse(sx,sy,10,8,0,0,7);c.fill();f('#e8e0d0',sx-6,sy+4,12,6);f('#c8c0b0',sx-10,sy+1,2,4);f('#c8c0b0',sx+8,sy+1,2,4);
    f('#150b17',sx-7,sy-1,5,5);f('#150b17',sx+2,sy-1,5,5);f(eye,sx-6,sy,3,3);f(eye,sx+3,sy,3,3);f('#150b17',sx-1,sy+4,2,2);for(let i=-5;i<6;i+=2)f('#150b17',sx+i,sy+8,1,2);
    // the doorway over the entrance tile (canvas x 24..40)
    f('#150b17',23,b-24,18,24);f('#05030a',24,b-22,16,22);c.fillStyle='#05030a';c.beginPath();c.ellipse(32,b-22,8,5,0,Math.PI,0);c.fill();
    for(let x=26;x<39;x+=4)f(L.lit?'#4a3a2a':'#3a2a2a',x,b-20,1,8);f(L.lit?'#4a3a2a':'#3a2a2a',25,b-14,14,1);
    // flanking spiked pillars with braziers
    [[1,9],[55,9]].forEach(([x,ww])=>{f('#150b17',x-1,b-34,ww+2,35);f(w[1],x,b-33,ww,33);f(w[2],x,b-33,ww,2);f('#2a2a34',x-1,b-38,ww+2,5);f('#5a4a40',x,b-39,ww,2);f(fire[0],x+1,b-45,ww-2,6);f(fire[1],x+3,b-43,ww-6,3);
      c.fillStyle=tint(w[2],.3);c.beginPath();c.moveTo(x,b-33);c.lineTo(x+ww/2,b-38);c.lineTo(x+ww,b-33);c.fill();});
    // the plaque: LAIR
    f('#150b17',19,gy-12,26,10);f(L.lit?'#7a5a2a':'#4a1a1a',20,gy-11,24,8);f(L.lit?'#9a7a3a':'#6a2a2a',20,gy-11,24,1);c.font='bold 7px "Trebuchet MS",Verdana,sans-serif';c.textAlign='center';c.textBaseline='alphabetic';
    c.fillStyle='#000';c.fillText('LAIR',33,gy-4);c.fillStyle=L.lit?'#ffe8a0':'#ffb0a0';c.fillText('LAIR',32,gy-5);
    // material touches
    if(L.mat==='ice'||L.mat==='icevault'||L.mat==='rock')for(let x=8;x<56;x+=3)f('#eefaff',x,gy+2,1,2+((x*7)%5));
    else if(L.mat==='lava'||L.mat==='forge'){f('#ff6a1a',10,b-6,8,1);f('#ff6a1a',46,b-9,6,1);f('#ffd04a',12,b-6,3,1);}
    else if(L.mat==='root'){for(let i=0;i<5;i++){let x=10+i*10,y=gy;for(let k=0;k<6;k++){f('#3a2614',x,y,1,2);y+=2;x+=k%2?1:-1;}}f('#7af0a0',10,b-4,4,2);f('#c890f0',50,b-4,4,2);}
    else if(L.mat==='sea'||L.mat==='flood'){f('#2a6a4a',8,b-8,2,8);f('#2a6a4a',54,b-10,2,10);f('#f0a0b0',12,b-5,3,4);}
    else if(L.mat==='sand'){f('#e0c494',6,b-5,20,5);f('#e0c494',40,b-4,18,4);}
    else if(L.mat==='astral'){f(M.acc,12,gy+12,2,2);f(M.acc,50,gy+12,2,2);}}
  return cv;});}
function d8Glyph(f,k,x,y,col){const P={thorn:[[0,-5,1,10],[-3,-2,3,1],[1,1,3,1]],tide:[[-4,-1,8,1],[-3,1,6,1],[-2,3,4,1]],ember:[[-1,-4,2,8],[-3,-1,6,3]],frost:[[0,-4,1,9],[-4,0,9,1],[-3,-3,1,1],[3,-3,1,1],[-3,3,1,1],[3,3,1,1]],
  bolt:[[0,-5,2,4],[-2,-1,4,2],[-1,1,2,4]],bone:[[-4,-1,9,2],[-5,-2,2,4],[4,-2,2,4]],comb:[[-3,-3,6,1],[-4,-2,1,4],[3,-2,1,4],[-3,2,6,1]],spore:[[-1,-1,3,3],[-4,-3,2,2],[3,2,2,2]],gear:[[-2,-2,5,5],[-4,0,9,1],[0,-4,1,9]],
  pearl:[[-2,-2,4,4],[-1,-3,2,1]],ash:[[-3,-1,7,2],[-2,1,5,1]],grave:[[0,-4,1,9],[-2,-2,5,1]],eclipse:[[-3,-3,6,6],[-1,-1,2,2]],scale:[[-3,-2,6,1],[-2,0,6,1],[-3,2,6,1]],crown:[[-4,-1,9,3],[-4,-3,1,2],[0,-3,1,2],[4,-3,1,2]],
  feather:[[0,-5,1,10],[-2,-3,2,1],[1,-1,2,1]],sun:[[-2,-2,5,5],[0,-5,1,2],[0,4,1,2],[-5,0,2,1],[4,0,2,1]]}[k]||[[-2,-2,5,5]];P.forEach(([a,b,w,h])=>f(col,x+a,y+b,w,h));}
// the entrance tile's 'facade' sprite: the lair. Lights for the beacon and the braziers go on the map's light list (both renderers bake them)
{const o2=obj2;obj2=function(theme,kind,v){const m=typeof P2!=='undefined'&&P2.dm;if(kind==='facade'&&m&&m.kind==='field'&&m.ent&&!window.__D8OFF){try{const L=d8LairState(m),cv=d8LairCanvas(L,D8.card?'card':'all');
      const ex=m.ent[0]*TS+8,ey=(m.ent[1]+1)*TS;m.lights=m.lights||[];m.lights.push([ex-27,ey-44,22,L.lit?'gold':'fire'],[ex+27,ey-44,22,L.lit?'gold':'fire']);if(!D8.card)m.lights.push([ex,ey-96,30,L.lit?'gold':'violet']);
      D8.lair.drawn=(D8.lair.drawn||0)+1;D8.lair.last={id:m.id,lit:L.lit,mat:L.mat,part:D8.card?'card':'all',w:cv.width,h:cv.height};return cv;}catch(e){}}
  return o2.apply(this,arguments);};}
{const hc0=hdBakeCards;hdBakeCards=function(){D8.card=1;try{return hc0.apply(this,arguments);}finally{D8.card=0;}};}
// the light column over the beacon, its pulse and the brazier flames (2D); none of it over the hero
function d8LairFx(m){if(!m||m.kind!=='field'||!m.ent||window.__D8OFF)return null;const L=d8LairState(m);return {L,x:m.ent[0]*TS+8,y:(m.ent[1]+1)*TS};}
function d8Beam(){return imgOf('d8beam',()=>{const c=mkCv(12,160),x=c.getContext('2d'),g=x.createLinearGradient(0,160,0,0);g.addColorStop(0,'rgba(255,255,255,.75)');g.addColorStop(.3,'rgba(255,255,255,.35)');g.addColorStop(1,'rgba(255,255,255,0)');
  x.fillStyle=g;x.fillRect(3,0,6,160);x.globalAlpha=.4;x.fillRect(0,0,12,160);return c;});}
function d8Tint(cv,col){return imgOf('d8tint:'+col,()=>{const c=mkCv(cv.width,cv.height),x=c.getContext('2d');x.drawImage(cv,0,0);x.globalCompositeOperation='source-in';x.fillStyle=col;x.fillRect(0,0,c.width,c.height);return c;});}
{const wd0=worldDraw;worldDraw=function(now){wd0.apply(this,arguments);try{if(typeof hdActive==='function'&&hdActive())return;const m=WS.m,ctx=WS.ctx,o=d8LairFx(m);if(!o||!WS.cam)return;
  const cx=Math.round(WS.cam.x),cy=Math.round(WS.cam.y),still=gfxStill(),t=still?0:now,X=o.x-cx,Y=o.y-cy;if(X<-80||X>WS.vw+80||Y<-40||Y>WS.vh+260)return;
  const hx=Math.round(WS.px)+8-cx,hy=Math.round(WS.py)-cy;ctx.save();ctx.beginPath();ctx.rect(0,0,WS.vw,WS.vh);ctx.rect(hx-10,hy-10,20,28);ctx.clip('evenodd');
  const p=.75+.25*Math.sin(t/(o.L.lit?900:420)),col=o.L.lit?'#ffd870':'#c84aff';ctx.globalCompositeOperation='lighter';ctx.globalAlpha=(o.L.lit?.35:.55)*p;
  ctx.drawImage(d8Tint(d8Beam(),col),X-6,Y-96-160+4);const g=ctx.createRadialGradient(X,Y-92,1,X,Y-92,26);g.addColorStop(0,o.L.lit?'rgba(255,220,120,.6)':'rgba(220,70,255,.6)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.globalAlpha=p;ctx.fillStyle=g;ctx.fillRect(X-26,Y-118,52,52);
  ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;const fl=Math.floor(t/140)%2;[[-27,0],[27,1]].forEach(([dx,k])=>{ctx.fillStyle=o.L.lit?(fl^k?'#ffe08a':'#ffd04a'):(fl^k?'#ff6a3a':'#ff3a2a');ctx.fillRect(X+dx-2,Y-47-(fl^k),4,3);});
  ctx.restore();D8.lair.fx2d={x:X,y:Y,lit:o.L.lit,a:+(p).toFixed(2)};}catch(e){}};}
// HD-2D: the tower behind the gate card, the beacon glow and the column (skipped while the hero stands in front of them), and their lights
{const ha0=hdActors;hdActors=function(m,now,ts){ha0.apply(this,arguments);try{const o=d8LairFx(m);if(!o)return;const V=HD.S.V,tw=d8LairCanvas(o.L,'tower'),fx=o.x,fz=o.y-TS+2;
  if(Math.abs(fx-HD.cam.x)>480||Math.abs(fz-HD.cam.z)>640)return;hdBill(HD.dyn,'d8tower:'+o.L.mat+o.L.bk+(o.L.lit?1:0),tw,fx,0,fz,false,1,255,255,255,255,2|8);
  const hx=WS.px+8,hz=WS.py+12,front=Math.abs(hx-fx)<22&&hz<fz;D8.lair.hd={front,lit:o.L.lit};if(front)return;
  const p=gfxStill()?.85:.75+.25*Math.sin(ts/(o.L.lit?900:420)),c=o.L.lit?[255,215,110]:[210,80,255];
  hdBill(HD.dynA,'glow',hdGlowS(),fx,92*V,fz+1,false,1,c[0],c[1],c[2],Math.round(90*p),4);
  hdBill(HD.dynA,'d8beam:'+(o.L.lit?1:0),d8Tint(d8Beam(),o.L.lit?'#ffd870':'#c84aff'),fx,96*V,fz+.5,false,1,255,255,255,Math.round((o.L.lit?80:120)*p),4);D8.lair.hd.beam=1;}catch(e){}};}
{const hl0=hdLights;hdLights=function(m,ts,q,o2){const n=hl0.apply(this,arguments);try{const o=d8LairFx(m);if(!o)return n;const p=gfxStill()?1:.8+.2*Math.sin(ts/(o.L.lit?900:420)),k=HD2D.lightK||1;
  if(o.L.lit)hdLmAdd(o.x,o.y-20,100,.7*p*k,.55*p*k,.28*p*k);else hdLmAdd(o.x,o.y-20,110,.6*p*k,.18*p*k,.75*p*k);return HD.lmn;}catch(e){return n;}};}
// the map: its own icon and legend entry
MAPICO_X.lair=[[4,0,2,2,'#ff5a3a'],[4,0,1,1,'#ffd0a0'],[3,2,4,3,'#3a2c44'],[1,5,8,5,'#5a4a5e'],[0,3,1,3,'#c8c0b0'],[9,3,1,3,'#c8c0b0'],[3,5,4,2,'#e8e0d0'],[3,5,1,1,'#ff3a3a'],[6,5,1,1,'#ff3a3a'],[4,7,2,3,'#0a0710']];
MAPICO_X.lairlit=[[4,0,2,2,'#ffd04a'],[4,0,1,1,'#fff6c8'],[3,2,4,3,'#4a3c4c'],[1,5,8,5,'#6a5a5e'],[0,3,1,3,'#c8c0b0'],[9,3,1,3,'#c8c0b0'],[3,5,4,2,'#e8e0d0'],[3,5,1,1,'#7a6a5a'],[6,5,1,1,'#7a6a5a'],[4,7,2,3,'#0a0710']];
MAPICO_NAME.lair='Lair';MAPICO_NAME.lairlit='Lair (relit)';MKN.lair='Lair';MKN.lairlit='Lair (relit)';MK.lair=['#ff5a3a','☗'];MK.lairlit=['#ffd04a','☗'];
{const mm0=mapMarks;mapMarks=function(m){const L=mm0.apply(this,arguments);try{if(m&&m.kind==='field'&&!window.__D8OFF)L.forEach(o=>{if(o.k==='dungeon')o.k=G.cleared&&G.cleared[m.s]?'lairlit':'lair';});}catch(e){}return L;};}

// =================== 4. saves made inside a reshaped dungeon ===================
{const ew0=enterWorldFromSave;enterWorldFromSave=function(){try{const p=G&&G.pos;if(p&&/^[dko]\d/.test(String(p.m))){resetMaps();const m=getMap(p.m);if(m&&m.kind==='dungeon'&&solidAt(m,p.x,p.y)){const s=d8Nearest(m,p.x,p.y);if(s){p.x=s[0];p.y=s[1];D8.moved=[p.m,s[0],s[1]];}}}}catch(e){}
  return ew0.apply(this,arguments);};}
function d8Nearest(m,x,y){const seen=new Set([x+','+y]),q=[[x,y]];for(let i=0;i<q.length&&i<20000;i++){const [cx,cy]=q[i];if(!(cx===x&&cy===y)&&!solidAt(m,cx,cy)&&tileAt(m,cx,cy)!=='E')return [cx,cy];
  for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=cx+a,ny=cy+b,k=nx+','+ny;if(nx<0||ny<0||nx>=m.w||ny>=m.h||seen.has(k))continue;seen.add(k);q.push([nx,ny]);}}return m.start||null;}
try{window.__D8={D8,D8M,D8_REALM,D8_ZONE,D8_CAVE,styleFor:d8StyleFor,styleOf:d8StyleOf,simple:d8Simple,lair:m=>d8LairFx(m),lairCanvas:(L,p)=>d8LairCanvas(L,p),nearest:d8Nearest,issues:d8Issues,enterFromSave:()=>enterWorldFromSave(),mMap:()=>mMap(),BG:k=>!!BG[k],D8P:()=>Object.keys(D8P),lairFx:()=>d8LairFx(WS.m)};}catch(e){}
