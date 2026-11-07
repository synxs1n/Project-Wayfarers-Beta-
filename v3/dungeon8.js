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
// 3. The boss lair on the field: the main dungeon entrance is dug into a rock mound raised from the field's own ground (solid field rock
//    around the unchanged entrance), geometry in HD-2D and a raised hill in 2D, with a lit mouth, claw gouges, torches, a broken banner of
//    the Scourge, bones and a trampled lane, and a faint plume. Relit: gold light, cleared. Its own map icon and legend entry ("Lair").
// 4. A save made on a tile that became solid (a dungeon liquid, a lair mound tile) loads on the nearest open tile instead of the town inn.
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
      if((x*3+y*5)%(org?14:7)===0&&tileAt(m,x,y+1)!=='~'){f('#3a2a1a',7,6,2,6);f('#5a4a3a',6,10,4,2);L.push([px+8,py+5,34,'torch']);m.torches=m.torches||[];m.torches.push([px+8,py+5]);}}
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
{const do0=drawObjects;drawObjects=function(ctx,m,y){if(m&&m.kind==='field'&&m.d8lair&&!D8.card&&!window.__D8OFF){try{const Lr=m.d8lair;if(y===Math.max(...Lr.tiles.map(t=>t[1]))){const h=d8Hill2D(m,Lr);ctx.drawImage(h.cv,h.x,h.y);}}catch(e){}}const keep=D8.dm;D8.dm=m&&m.kind==='dungeon'&&m.d8?m:null;
  try{const r=do0.apply(this,arguments);if(D8.dm){const g=m.theme==='cave'||m.theme==='void'?null:D8_PGLOW[m.d8];if(g)for(let x=0;x<m.w;x++)if(tileAt(m,x,y)==='P'){m.lights=m.lights||[];m.lights.push([x*TS+8,y*TS-4,g==='torch'?26:16,g]);}}return r;}
  finally{D8.dm=keep;}};}

// =================== 1. the look, HD-2D ===================
{const hk0=hdKind;hdKind=function(m,c){if(c==='~'&&m&&m.kind==='dungeon'&&m.d8){const q=D8M[m.d8].liq;return q==='lava'?6:q==='void'?5:4;}return hk0.apply(this,arguments);};}
{const hs0=hdStructCanvas;hdStructCanvas=function(m,S){const cv=hs0.apply(this,arguments);try{if(m&&m.kind==='dungeon'&&m.d8&&D8M[m.d8]){const c=cv.getContext('2d'),D=DTH(m),HA=S.hArt;
    for(let v=0;v<4;v++){const x0=v*16,R=mulberry(v*997+m.s*31+7),f=(col,x,y,w,h)=>{c.fillStyle=col;c.fillRect(x0+x,y,w,h);};c.clearRect(x0,0,16,HA);d8FaceArt(f,R,m.d8,D,HA,v>=2,m.d8org,null,v*16,0);f('rgba(0,0,0,.18)',0,HA-4,16,3);
      const R2=mulberry(v*71+m.s+3),g=(col,x,y,w,h)=>{c.fillStyle=col;c.fillRect(x0+x,80+y,w,h);};d8TopArt(g,R2,m.d8,D,m.d8org);}
    D8.hd.struct=m.d8;D8.hd.id=m.id;}}catch(e){}return cv;};}

// =================== 1. battles fought here use the same material ===================
HOOK.before('startBattle','dungeon8','realm dungeon material for the backdrop (spec.d8)',function(spec){try{if(spec&&typeof spec==='object'&&!(G&&G.daily)&&spec.kind!=='daily'&&spec.kind!=='arena'&&!spec.bg&&V.screen==='world'&&WS.m&&WS.m.d8){spec.d8=WS.m.d8;spec.d8org=WS.m.d8org?1:0;}}catch(e){}});
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
// v0.8.9 (owner: "the lair sprite is flat ... it should be more natural looking ... part of the land, as the boss would have dug it out"):
// the main dungeon's entrance (E, unchanged) is dug into a rock mound raised from the field's own ground. The entrance's footprint ('U')
// and the open clearing behind and beside it (the generator keeps 5 x 4 tiles open around every entrance) become field rock ('#', solid
// like a cliff), never the entrance tile, its approach lane (three tiles out the way it faces) or an exit; the mound is kept only if every
// target stays reachable and nothing ends up on a path (mapIssues, pathAssets), and a mound tile goes again if it would hide a prop north
// of it (pgHides). Drawn from the dungeon's material (frozen rock, basalt, earth and roots, sandstone, wet rock, mountain rock, crystal),
// leaning toward the field's own cliff colours:
// - HD-2D: real geometry (hdBakeBuildings, like the fortress gatehouse): a heightfield hill over the mound tiles, highest at the back and
//   the middle, a rock face at the front with the cave mouth in it (dark, claw gouged, lit from inside), sloping into the ground at the
//   sides; heights are capped so a prop north of it still shows (the pgHides rule with the real heights). Torches on the front faces, a
//   broken banner of the Scourge and a skull pile on top, a faint plume of the mouth's light rising from the top (not over the hero).
// - 2D: the same mound drawn on its tiles (front faces, a stepped top with the ground showing at the rounded corners), the mouth in its
//   face, torches, banner and skull pile as the entrance's prop, the glow and the plume over it (clipped out of the hero's box).
// - around it: a trampled lane out of the mouth with claw marks, bones and rubble on the ground (ground art, both renderers).
// - relit: gold light, calm torches, no banner, bones or rubble, a faint gold plume.
const D8LR={
 ice:{r:['#5e7290','#4a5c76','#8098b4','#283448'],cap:'#a4b8d0',cap2:'#e4eef8',glow:'#7ab8ff'},
 basalt:{r:['#3e3432','#2e2624','#5a4a44','#141010'],cap:'#2c2422',cap2:'#4a3a34',glow:'#ff5a1a'},
 earth:{r:['#6a5038','#56402c','#86684a','#2e2216'],cap:'#4e8a3c',cap2:'#3a6a2e',glow:'#d8a040'},
 sand:{r:['#c09060','#a87a4e','#dcb07a','#6a4a2a'],cap:'#e8cc96',cap2:'#d4b47c',glow:'#ff9a3a'},
 wet:{r:['#3e5052','#2e3e40','#5a7070','#141e1e'],cap:'#3e6a4a',cap2:'#2e5038',glow:'#4ad0b8'},
 grey:{r:['#6e6c7a','#5a5866','#8a889a','#2a2834'],cap:'#8a9a6a',cap2:'#6a7a52',glow:'#ff7a2a'},
 crystal:{r:['#3a3050','#2a2240','#54487a','#120c20'],cap:'#4a3e6a',cap2:'#3a2e58',glow:'#9a6aff'}};
const D8_LMAT={ice:'ice',icevault:'ice',lava:'basalt',forge:'basalt',root:'earth',crypt:'earth',sand:'sand',sea:'wet',flood:'wet',keep:'grey',rock:'grey',astral:'crystal'};
function d8LairState(m){const s=m.s,st=d8StyleFor(s,false,false),lit=!!(G&&G.cleared&&G.cleared[s]);let bk=null;try{bk=bossAtStage(s);}catch(e){}const B=(typeof BTHEME!=='undefined'&&BTHEME[bk])||null;
  const lk=D8_LMAT[st.mat]||'grey',P0=D8LR[lk];let cl=null;try{cl=THM(m).cl;}catch(e){}const r=P0.r.map((c,i)=>cl&&cl[i]?lerpHex(c,cl[i],.25):c);
  return {mat:st.mat,lk,lit,bk,cloth:B?B.mix:'#5a2a4a',em:B?B.dec[0]:'#e8c070',motif:B?B.motif:'crown',r,cap:P0.cap,cap2:P0.cap2,glow:lit?'#ffd870':P0.glow,key:lk+':'+(lit?1:0)+':'+bk+':'+(cl?cl[0]:'')};}
const d8LH=(x,y,k)=>((Math.imul(x*73856093^y*19349663,k*83492791+1)>>>0)%1000)/1000;
// the mound: which tiles, their heights (art px) and the hill's corner heights
function d8LairShape(m){if(m.kind!=='field'||!m.ent||m.d8lair!==undefined||window.__D8OFF)return;m.d8lair=null;
  const [ex,ey]=m.ent,out=m.entOut||[ex,ey+1],fv=[out[0]-ex,out[1]-ey],g=m.t,H=g.length,W=g[0].length,lane=new Set(),ex8=new Set((m.exits||[]).map(e=>e.x+','+e.y));
  for(let k=1;k<=3;k++)lane.add((ex+fv[0]*k)+','+(ey+fv[1]*k));
  const core=[],extra=[],bk=[-fv[0],-fv[1]],sd=[fv[1],fv[0]],rel={};
  for(let b=0;b<=2;b++)for(let s2=-2;s2<=2;s2++){if(!b&&!s2)continue;const x=ex+bk[0]*b+sd[0]*s2,y=ey+bk[1]*b+sd[1]*s2,k=x+','+y;rel[k]=[b,s2];if(x<1||y<1||x>=W-1||y>=H-1||lane.has(k)||ex8.has(k))continue;const c=g[y][x];
    if(c==='U')core.push([x,y,c]);else if('.,f'.includes(c)&&!(m.signs&&m.signs[k]!=null)&&!(m.npcs||[]).some(n=>n.x===x&&n.y===y))extra.push([x,y,c]);}
  const iss=()=>(typeof mapIssues==='function'?mapIssues(m).length:0)+(typeof pathAssets==='function'?pathAssets(m).length:0),i0=iss();
  const put=L=>L.forEach(([x,y])=>{g[y][x]='#';}),back=L=>L.forEach(([x,y,c])=>{g[y][x]=c;});
  const hides=([x,y])=>{for(let k=1;k<=3;k++){const yy=y-k,c=g[yy]&&g[yy][x];if(c&&PG_PROP_H[c]!=null&&c!=='#'&&pgHides(m,x,yy,c))return true;}return false;};
  let tiles=core.concat(extra);put(tiles);
  for(let pass=0;pass<5;pass++){const bad=tiles.filter(hides);if(!bad.length)break;back(bad);tiles=tiles.filter(t=>!bad.includes(t));}
  if(iss()>i0){back(tiles);tiles=core.filter(t=>!hides(t));put(tiles);if(iss()>i0){back(tiles);tiles=[];}}
  if(!tiles.length)return;
  const mask=new Set(tiles.map(([x,y])=>x+','+y)),under={};tiles.forEach(([x,y,c])=>{under[x+','+y]=c==='U'?'.':c;});
  const Th=Math.tan(((typeof HD2D!=='undefined'&&HD2D.pitch)||40)*Math.PI/180),hmax={},hh={};
  const south=fv[0]===0&&fv[1]===1;
  // facing the camera (south): the hill rises right behind the mouth; any other way: a low hill with the mouth at its foot, rising away
  tiles.forEach(([x,y])=>{const q=rel[x+','+y]||[1,0],b=q[0],a=Math.abs(q[1]);let h=south?[24,36,32][b]-6*a:[18,30,26][b]-5*a;h+=Math.round((d8LH(x,y,3)-.5)*8);
    // a prop up to three rows north still shows (the pgHides rule, with this height instead of a cliff's)
    let cap=60;for(let k=1;k<=3;k++){const yy=y-k,c=g[yy]&&g[yy][x];if(!c||mask.has(x+','+yy))continue;const ph=PG_PROP_H[c];if(ph!=null)cap=Math.min(cap,ph-PG_VIS+((k-1)*TS-.5)*Th-1);}
    hmax[x+','+y]=Math.max(8,cap);hh[x+','+y]=Math.max(8,Math.min(h,cap));});
  const isM=(x,y)=>mask.has(x+','+y),mt=[ex+bk[0],ey+bk[1]],mouth=isM(mt[0],mt[1])?mt:null,cor={};
  for(let cy=ey-3;cy<=ey+3;cy++)for(let cx=ex-3;cx<=ex+4;cx++){const A4=[[cx-1,cy-1],[cx,cy-1],[cx-1,cy],[cx,cy]],adj=A4.filter(([x,y])=>isM(x,y));if(!adj.length){cor[cx+','+cy]=0;continue;}
    let n=adj.length;if(south&&mouth&&A4.some(([x,y])=>x===ex&&y===ey)&&A4.some(([x,y])=>x===mouth[0]&&y===mouth[1]))n=5;// the mouth's face keeps its full height
    const mean=adj.reduce((a,[x,y])=>a+hh[x+','+y],0)/adj.length,f=n>=5?1:n===4?1.05:n===3?.72:n===2?.38:.14,cap=Math.min(...adj.map(([x,y])=>hmax[x+','+y]));
    cor[cx+','+cy]=Math.max(0,Math.min(cap,mean*f+(d8LH(cx,cy,5)-.5)*(n>=4?7:3)));}
  const torches=[[ex+sd[0],ey+sd[1]],[ex-sd[0],ey-sd[1]]].filter(([x,y])=>isM(x,y)),deco=[[ex+bk[0]-sd[0],ey+bk[1]-sd[1]],[ex+bk[0]+sd[0],ey+bk[1]+sd[1]]].map(t=>isM(t[0],t[1])?t:null);
  m.d8lair={tiles:tiles.map(t=>[t[0],t[1]]),mask,under,hh,cor,mouth,torches,deco,south,ex,ey,fv,lane:[...lane].map(k=>k.split(',').map(Number)),top:Math.max(...Object.values(hh))};m.tl=null;}
{const g0=getMap;getMap=function(id){const had=!!MAPS[id],m=g0.apply(this,arguments);if(!had&&m&&m.kind==='field'){try{d8LairShape(m);}catch(e){try{wdLog('d8 lair '+id+': '+e.message);}catch(_){}}}return m;};}
// ----- art: one 64x64 sheet per look (A rock face, B top, C the mouth's face, D side face) -----
function d8LairTex(L){return imgOf('d8ltex:'+L.key,()=>{const c=mkCv(64,64),x=c.getContext('2d'),R=mulberry(hashS(L.key)),r=L.r;const f=(col,a,b,w,h)=>{x.fillStyle=col;x.fillRect(a,b,w,h);};
  const rock=(ox,oy,k)=>{f(shade(r[0],k),ox,oy,32,32);for(let i=0;i<26;i++){const w=3+Math.floor(R()*7),h=2+Math.floor(R()*4),a=ox+Math.floor(R()*30),b=oy+Math.floor(R()*30);f(shade(R()<.4?r[2]:R()<.6?r[1]:r[0],k*(.92+R()*.12)),a,b,Math.min(w,ox+32-a),Math.min(h,oy+32-b));f(shade(tint(r[0],.15),k),a,b,Math.min(w,ox+32-a),1);}
    for(let i=0;i<6;i++){let a=ox+2+Math.floor(R()*26),b=oy+3+Math.floor(R()*24);const dx=R()<.5?1:-1;for(let s=0;s<4;s++){f(shade(r[3],k),a,b,2,1);a+=dx*2;b+=R()<.5?1:0;if(a<ox||a>=ox+31||b>=oy+32)break;}}
    if(L.lk==='ice'){for(let a=ox;a<ox+32;a+=3){const l=2+Math.floor(R()*7);f('#e8f6ff',a,oy,2,2);f('#c8e8ff',a,oy+2,1,l);}for(let i=0;i<4;i++)f('rgba(230,248,255,.4)',ox+Math.floor(R()*30),oy+4,1,24);}
    else if(L.lk==='basalt'){if(!L.lit&&ox===0&&oy===0){let a=ox+9+Math.floor(R()*14),b=oy+10;for(let s=0;s<4;s++){f(s%2?'#ff6a1a':'#c84a1a',a,b,1,2);a+=R()<.5?1:-1;b+=3;}}}
    else if(L.lk==='earth'){for(let i=0;i<4;i++){let a=ox+1+Math.floor(R()*30),b=oy;for(let s=0;s<3;s++){f('#3a2614',a,b,1,2);b+=2;a+=R()<.3?1:R()<.5?-1:0;}}for(let i=0;i<6;i++)f(R()<.5?'#8a7a68':'#5a5048',ox+Math.floor(R()*28),oy+8+Math.floor(R()*22),3,2);for(let a=ox;a<ox+32;a+=2)if(R()<.7)f('#4a7a34',a,oy,2,1+Math.floor(R()*3));}
    else if(L.lk==='sand'){for(let b=oy+3;b<oy+32;b+=6){f(shade(tint(r[0],.18),k),ox,b,32,2);f(shade(r[1],k*.9),ox,b+2,32,1);}}
    else if(L.lk==='wet'){for(let i=0;i<5;i++)f('rgba(200,250,255,.22)',ox+Math.floor(R()*31),oy+2,1,26);for(let a=ox+1;a<ox+32;a+=4)f('#2a6a4a',a,oy+26-Math.floor(R()*4),1,6);}
    else if(L.lk==='crystal'){for(let i=0;i<3;i++){const a=ox+3+Math.floor(R()*24),b=oy+8+Math.floor(R()*16);f('#8b5fd0',a,b,2,6);f('#d8c0ff',a,b,1,2);}}
    else for(let a=ox;a<ox+32;a+=3)if(R()<.5)f('#5a7a4a',a,oy,2,1+Math.floor(R()*2));};
  rock(0,0,1);rock(32,32,.8);
  // B: the top of the hill
  f(L.cap,32,0,32,32);for(let i=0;i<30;i++)f(R()<.5?L.cap2:tint(L.cap,.12),32+Math.floor(R()*29),Math.floor(R()*30),2+Math.floor(R()*4),1+Math.floor(R()*2));
  if(L.lk==='ice')for(let i=0;i<10;i++)f('#bcd2ea',32+Math.floor(R()*28),Math.floor(R()*30),4,1);
  else if(L.lk==='basalt'&&!L.lit)for(let i=0;i<6;i++)f('#ff6a1a',32+Math.floor(R()*31),Math.floor(R()*31),1,1);
  else if(L.lk==='earth'||L.lk==='grey'||L.lk==='wet')for(let i=0;i<14;i++){const a=32+Math.floor(R()*30),b=Math.floor(R()*28);f(shade(L.cap,.75),a,b,1,3);f(tint(L.cap,.2),a+1,b+1,1,2);}
  for(let i=0;i<6;i++)f(shade(r[1],.9),32+Math.floor(R()*28),Math.floor(R()*28),3,2);
  // C: the face with the mouth: a dark arch dug into the rock, claw gouged, with rubble at its sill
  rock(0,32,.96);const cx=16,by=63;x.fillStyle=shade(r[3],.7);x.beginPath();x.ellipse(cx,by-17,8.5,7,0,Math.PI,0);x.fill();f(shade(r[3],.7),cx-8.5,by-17,17,18);
  const gl=hx(L.glow);for(let y=0;y<22;y++){const t=y/21,k=L.lit?.32:.42;const col=`rgb(${Math.round(6+gl[0]*k*t*t)},${Math.round(4+gl[1]*k*t*t)},${Math.round(10+gl[2]*k*t*t)})`;const half=y<6?Math.round(Math.sqrt(Math.max(0,36-(6-y)*(6-y)))*1.15):7;f(col,cx-half,by-22+y,half*2,1);}
  for(let a=-9;a<=9;a+=3){f(tint(r[2],.1),cx+a,by-25+Math.round(Math.abs(a)*.6),2,2);}
  [[-1],[1]].forEach(([sd])=>{for(let i=0;i<3;i++){const x0=cx+sd*(11+i*2);for(let s=0;s<9;s++){f(shade(r[3],.8),x0+sd*Math.round(s*.4),by-26+s*2,1,2);f(tint(r[1],.2),x0+sd*Math.round(s*.4)+1,by-26+s*2,1,1);}}});
  if(!L.lit){f('#e8e0d0',cx-6,by-2,3,1);f('#e8e0d0',cx+3,by-3,4,1);f('#e8e0d0',cx+5,by-4,1,3);f(r[1],cx-9,by-3,3,3);f(r[2],cx+8,by-2,2,2);}
  return c;});}
function d8LairExtras(L){return imgOf('d8lext:'+L.key,()=>{const c=mkCv(48,24),x=c.getContext('2d'),f=(col,a,b,w,h)=>{x.fillStyle=col;x.fillRect(a,b,w,h);};
  // 0..15: a broken banner of the Scourge on a leaning pole; 16..31: a skull and bones; 32..47 spare
  for(let i=0;i<22;i++)f('#3a2a1a',6+Math.round(i*.12),2+i,2,1);f(L.cloth,8,4,7,9);f(shade(L.cloth,.75),8,13,2,4);f(shade(L.cloth,.75),12,13,2,6);f('#150b17',10,8,2,2);d8Glyph(f,L.motif,11,8,L.em);
  f('#e8e0d0',20,15,8,6);f('#e8e0d0',21,13,6,3);f('#150b17',21,16,2,2);f('#150b17',25,16,2,2);f('#150b17',23,19,2,1);f('#d8d0c0',17,21,14,2);f('#c8c0b0',18,20,2,3);f('#c8c0b0',28,20,2,3);
  return c;});}
function d8Plume(){return imgOf('d8plume',()=>{const c=mkCv(16,128),x=c.getContext('2d');for(let y=0;y<128;y++){const t=y/127,a=Math.pow(t,1.6)*.55,w=3+Math.sin(y/9)*1.5+t*3;x.fillStyle=`rgba(255,255,255,${a.toFixed(3)})`;x.fillRect(Math.round(8-w/2+Math.sin(y/13)*2),y,Math.round(w),1);}return c;});}
function d8Glyph(f,k,x,y,col){const P={thorn:[[0,-3,1,6],[-2,-1,2,1],[1,1,2,1]],tide:[[-3,-1,6,1],[-2,1,4,1]],ember:[[-1,-3,2,6],[-2,0,4,2]],frost:[[0,-3,1,7],[-3,0,7,1]],bolt:[[0,-3,2,3],[-1,0,2,3]],
  bone:[[-3,-1,7,2]],comb:[[-2,-2,4,1],[-2,1,4,1]],spore:[[-1,-1,2,2]],gear:[[-2,-2,4,4]],pearl:[[-1,-1,3,3]],ash:[[-2,-1,5,2]],grave:[[0,-3,1,6],[-1,-1,3,1]],eclipse:[[-2,-2,4,4]],scale:[[-2,-1,4,1],[-2,1,4,1]],
  crown:[[-3,-1,7,2],[-3,-2,1,1],[0,-2,1,1],[3,-2,1,1]],feather:[[0,-3,1,6]]}[k]||[[-1,-1,3,3]];P.forEach(([a,b,w,h])=>f(col,x+a,y+b,w,h));}
// ----- HD-2D: the hill as building geometry -----
{const bb0=hdBakeBuildings;hdBakeBuildings=function(m,S,bsp,deco){try{const Lr=m&&m.kind==='field'&&m.d8lair;if(Lr&&!window.__D8OFF){const L=d8LairState(m);
    const xs=Lr.tiles.map(t=>t[0]),ys=Lr.tiles.map(t=>t[1]),bx=Math.min(...xs),by=Math.min(...ys);bsp=(bsp||[]).concat([{b:{x:bx,y:by,w:Math.max(...xs)-bx+1,h:Math.max(...ys)-by+1,k:'d8lair',door:[Lr.ex,Lr.ey]},cv:d8LairTex(L)}]);}}catch(e){}return bb0.call(this,m,S,bsp,deco);};}
{const bk0=hdBldKind;hdBldKind=function(m,b){if(b&&b.k==='d8lair')return 'gate';return bk0.apply(this,arguments);};}
{const gg0=hdGateGeo;hdGateGeo=function(m,S,b,Q,U,Vv,p,V,bt){if(b&&b.k==='d8lair')return d8LairGeo(m,S,b,Q,U,Vv,p,V);return gg0.apply(this,arguments);};}
function d8LairGeo(m,S,b,Q,U,Vv,p,V){const Lr=m.d8lair,isM=(x,y)=>Lr.mask.has(x+','+y),C=(x,y)=>(Lr.cor[x+','+y]||0)*V;let n=0,top=0;
  Lr.tiles.forEach(([x,y])=>{const x0=x*TS,x1=x0+TS,z0=y*TS,z1=z0+TS,a=C(x,y),bq=C(x+1,y),c=C(x+1,y+1),d=C(x,y+1);top=Math.max(top,a,bq,c,d);
    const dx=((bq+c)-(a+d))/2/TS,dz=((d+c)-(a+bq))/2/TS,l=Math.hypot(dx,1,dz),u0=((x+y)%2)*16,v0=(y%2)*16;
    const steep=Math.abs(dx)+Math.abs(dz)>.55*V,tu=steep?((x*3)%2)*16:32+u0;Q([x0,a,z0,x1,bq,z0,x1,c,z1,x0,d,z1],U(p,tu),Vv(p,v0),U(p,tu+16),Vv(p,v0+16),255,[-dx/l,1/l,-dz/l],8);n++;
    const isE=(a2,b2)=>a2===Lr.ex&&b2===Lr.ey,reg=(e)=>e?[8,32]:null;
    if(!isM(x,y+1)&&(d>.5||c>.5)){const ah=Math.min(32,Math.max(d,c)/V),me=reg(isE(x,y+1)),ox=me?me[0]:((x*5)%2)*16,oy=me?me[1]:0;
      Q([x0,d,z1,x1,c,z1,x1,0,z1,x0,0,z1],U(p,ox),Vv(p,oy+32-ah),U(p,ox+16),Vv(p,oy+32),255,[0,0,1],2|8);n++;}
    if(!isM(x-1,y)&&(a>.5||d>.5)){const ah=Math.min(32,Math.max(a,d)/V),me=reg(isE(x-1,y)),ox=me?me[0]:32,oy=me?me[1]:32;Q([x0,a,z0,x0,d,z1,x0,0,z1,x0,0,z0],U(p,ox),Vv(p,oy+32-ah),U(p,ox+16),Vv(p,oy+32),255,[-1,0,0],8);n++;}
    if(!isM(x+1,y)&&(bq>.5||c>.5)){const ah=Math.min(32,Math.max(bq,c)/V),me=reg(isE(x+1,y)),ox=me?me[0]:48,oy=me?me[1]:32,w=me?16:16;Q([x1,c,z1,x1,bq,z0,x1,0,z0,x1,0,z1],U(p,ox),Vv(p,oy+32-ah),U(p,ox+w),Vv(p,oy+32),255,[1,0,0],8);n++;}});
  S.bh.push({b,h:top});D8.lair.hd=Object.assign(D8.lair.hd||{},{geo:n,top:+(top/V).toFixed(1),id:m.id});}
// a mound tile is ground for the block pass (the hill above stands in its place)
{const hk1=hdKind;hdKind=function(m,c,x,y){if(m&&m.kind==='field'&&m.d8lair&&x!=null&&m.d8lair.mask.has(x+','+y))return 0;return hk1.apply(this,arguments);};}
{const ha0=hdActors;hdActors=function(m,now,ts){ha0.apply(this,arguments);try{const Lr=m&&m.kind==='field'&&m.d8lair;if(!Lr||window.__D8OFF)return;const V=HD.S.V,ex=Lr.ex*TS+8;
  if(Math.abs(ex-HD.cam.x)>480||Math.abs(Lr.ey*TS-HD.cam.z)>640)return;const L=d8LairState(m),still=gfxStill(),gl=hdRgb(L.glow).map(v=>Math.round(v*255)),p=still?.85:.8+.2*Math.sin(ts/(L.lit?1100:520));
  // light spilling from the mouth
  const mzx=ex-Lr.fv[0]*7,mzz=Lr.ey*TS+8-Lr.fv[1]*7+(Lr.south?.2:0);if(Lr.mouth)hdBill(HD.dynA,'glow',hdGlowS(),mzx,(Lr.south?4:2)*V,mzz,false,.5,gl[0],gl[1],gl[2],Math.round((L.lit?30:45)*p),4);
  // torches on the front faces
  const hAt0=(x,y)=>((Lr.cor[x+','+y]||0)+(Lr.cor[(x+1)+','+y]||0)+(Lr.cor[x+','+(y+1)]||0)+(Lr.cor[(x+1)+','+(y+1)]||0))/4;
  Lr.torches.forEach(([x,y],i)=>{const f=still?0:Math.floor(now/110+x)%3,tx=x*TS+8+Lr.fv[0]*7,tz=y*TS+8+Lr.fv[1]*8.4,ty=Lr.south?7:hAt0(x,y)+4;hdBill(HD.dyn,'torch'+f,hdTorchS(f),tx,ty*V,tz,false,1,255,255,255,255,4);
    hdBill(HD.dynA,'glow',hdGlowS(),tx,(ty+8)*V,tz+.6,false,L.lit?.8:1,255,L.lit?200:150,L.lit?110:70,L.lit?60:85,4);});
  const ex2=d8LairExtras(L),tpx=0,hAt=(x,y)=>((Lr.cor[x+','+y]||0)+(Lr.cor[(x+1)+','+y]||0)+(Lr.cor[x+','+(y+1)]||0)+(Lr.cor[(x+1)+','+(y+1)]||0))/4;
  if(!L.lit){const bt=Lr.deco[0],sk=Lr.deco[1];
    // cut regions of the extras sheet as their own sprites
    const sub=(k,sx,w)=>imgOf('d8lsub:'+L.key+k,()=>{const c=mkCv(w,24);c.getContext('2d').drawImage(ex2,sx,0,w,24,0,0,w,24);return c;});
    if(bt)hdBill(HD.dyn,'d8ban:'+L.key,sub('b',0,16),bt[0]*TS+8,(hAt(bt[0],bt[1])-2)*V,bt[1]*TS+9,false,1,255,255,255,255,2|8);
    if(sk)hdBill(HD.dyn,'d8sk:'+L.key,sub('s',16,16),sk[0]*TS+8,(hAt(sk[0],sk[1])-2)*V,sk[1]*TS+9,false,1,255,255,255,255,2|8);}
  // the plume rising from the top: faint, the mouth's colour; not while the hero stands right in front of it
  const tp=Lr.tiles.reduce((a,t)=>Lr.hh[t+'']>=Lr.hh[a+'']?t:a,Lr.tiles[0]),pz=tp[1]*TS+8,hx=WS.px+8,hz=WS.py+12,front=Math.abs(hx-ex)<22&&hz<pz;D8.lair.hd=Object.assign(D8.lair.hd||{},{front,lit:L.lit,plume:front?0:1});
  if(!front)hdBill(HD.dynA,'d8plume:'+L.glow,d8Tint(d8Plume(),L.glow),tp[0]*TS+8,(Lr.top-4)*V,pz,false,1,255,255,255,Math.round((L.lit?35:50)*p),4);}catch(e){}};}
// the lair's 2D lights (marked) are left out of the HD-2D bake: hdLights adds its own, smaller ones
{const bl0=hdBakeLights;hdBakeLights=function(m,S,lights){return bl0.call(this,m,S,(lights||[]).filter(L=>L[4]!==1));};}
// ----- 2D: the mound on its tiles, the ground around it, the extras as the entrance's prop -----
// 2D: the hill as a small heightfield seen from the south and above: each ground pixel is lifted by its height (bilinear over the tile's
// corner heights, 0 off the mound), drawn north to south so the near slope covers the far one; slopes facing the light are lighter,
// flat ground is the cap (snow, ash, grass, sand, moss), steep ground the rock; the mouth is cut into the face over the entrance
const D8_K2=.62;
function d8Hill2D(m,Lr){const L=d8LairState(m);return imgOf('d8hill:'+m.id+':'+L.key+':'+Lr.tiles.length+':'+(m.s||0)+':'+(G.run&&G.run.seed),()=>{
  const xs=Lr.tiles.map(t=>t[0]),ys=Lr.tiles.map(t=>t[1]),bx=Math.min(...xs),by=Math.min(...ys),W=(Math.max(...xs)-bx+1)*TS,H=(Math.max(...ys)-by+1)*TS,M=Math.ceil(Lr.top*D8_K2)+3;
  const cv=mkCv(W,H+M),c=cv.getContext('2d'),img=c.createImageData(W,H+M),d=img.data,R=mulberry(hashS(m.id+L.key));
  const hgt=(gx,gy)=>{const tx=bx+Math.floor(gx/TS),ty=by+Math.floor(gy/TS);if(!Lr.mask.has(tx+','+ty))return 0;const u=(gx%TS)/TS,v=(gy%TS)/TS,C=(a,b)=>Lr.cor[a+','+b]||0;
    return (C(tx,ty)*(1-u)+C(tx+1,ty)*u)*(1-v)+(C(tx,ty+1)*(1-u)+C(tx+1,ty+1)*u)*v;};
  const NZ=d8Noise(hashS(m.id+'hill'),W,H,7),HF=new Float32Array(W*H);for(let gy=0;gy<H;gy++)for(let gx=0;gx<W;gx++){const h0=hgt(gx,gy);HF[gy*W+gx]=h0>0?h0*(.72+.56*NZ(gx,gy))-2+(d8LH(gx,gy,11)-.5)*1.2:0;}
  const rk=L.r.map(hx),cp=hx(L.cap),cp2=hx(L.cap2),put=(x,y,col,k)=>{if(x<0||y<0||x>=W||y>=H+M)return;const o=(y*W+x)*4;d[o]=Math.min(255,col[0]*k);d[o+1]=Math.min(255,col[1]*k);d[o+2]=Math.min(255,col[2]*k);d[o+3]=255;};
  for(let gx=0;gx<W;gx++)for(let gy=0;gy<H;gy++){const h=HF[gy*W+gx];if(h<1.2)continue;
    const hx1=gx>0?HF[gy*W+gx-1]:0,hx2=gx<W-1?HF[gy*W+gx+1]:0,hy1=gy>0?HF[(gy-1)*W+gx]:0,hy2=gy<H-1?HF[(gy+1)*W+gx]:0,sx=(hx2-hx1)/2,sy=(hy2-hy1)/2,st=Math.min(1,Math.hypot(sx,sy)/1.4);
    const lit=Math.max(.55,Math.min(1.25,1+(sx*.35+sy*.5)*.55)),grain=.94+d8LH(gx*3,gy*5,13)*.12;
    const top=st>.45?rk[d8LH(gx>>2,gy>>2,17)<.3?2:0]:(d8LH(gx>>1,gy>>1,19)<.25?cp2:cp),y0=M+gy-Math.round(h*D8_K2);
    const fy=M+gy;for(let y=y0+1;y<=fy;y++){const t=(y-y0)/Math.max(1,fy-y0);put(gx,y,rk[t>.75?3:1],(.95-.3*t)*grain);}
    put(gx,y0,top,lit*grain);}
  // a dark rim where the surface meets the sky behind it, so the hill stands off the ground (snow on snow too)
  for(let x=0;x<W;x++){let y=0;while(y<H+M&&d[(y*W+x)*4+3]===0)y++;if(y<H+M){const o=(y*W+x)*4;d[o]*=.55;d[o+1]*=.55;d[o+2]*=.6;}}
  for(let y=0;y<H+M;y++)for(let x=0;x<W;x++){const o=(y*W+x)*4;if(!d[o+3])continue;const l=x>0&&d[o-1]===0,r2=x<W-1&&d[o+7]===0;if(l||r2){d[o]*=.6;d[o+1]*=.6;d[o+2]*=.65;}}
  c.putImageData(img,0,0);
  for(let i=0;i<18;i++){const gx=Math.floor(R()*W),gy=Math.floor(R()*H),h=HF[gy*W+gx];if(h<6)continue;const y=M+gy-Math.round(h*D8_K2);c.fillStyle=L.r[3];c.fillRect(gx,y+2,1,3);}
  if(L.lk==='ice')for(let gx=0;gx<W;gx+=3){for(let gy=H-1;gy>=0;gy--){const h=HF[gy*W+gx];if(h>4){const y=M+gy-Math.round(h*D8_K2);c.fillStyle='#e8f6ff';c.fillRect(gx,y+1,1,2+(gx*7)%4);break;}}}
  else if(L.lk==='basalt'&&!L.lit)for(let i=0;i<5;i++){const gx=4+Math.floor(R()*(W-8)),gy=Math.floor(R()*H),h=HF[gy*W+gx];if(h<6)continue;const y=M+gy-Math.round(h*D8_K2);c.fillStyle='#ff6a1a';c.fillRect(gx,y+1,1,4);}
  else if(L.lk==='earth')for(let i=0;i<8;i++){const gx=Math.floor(R()*W),gy=Math.floor(R()*H),h=HF[gy*W+gx];if(h<6)continue;const y=M+gy-Math.round(h*D8_K2);c.fillStyle='#3a2614';c.fillRect(gx,y+1,1,5);}
  if(Lr.south&&Lr.mouth){const mx=(Lr.ex-bx)*TS+8,gyE=(Lr.ey-by)*TS,hm=((Lr.cor[Lr.ex+','+Lr.ey]||0)+(Lr.cor[(Lr.ex+1)+','+Lr.ey]||0))/2,top=Math.round(hm*D8_K2),fy=M+gyE;
    const ah=Math.max(9,Math.min(top+2,18)),gl=hx(L.glow);c.fillStyle=L.r[3];c.beginPath();c.ellipse(mx,fy-ah+5,7.5,5.5,0,Math.PI,0);c.fill();c.fillRect(mx-7.5,fy-ah+5,15,ah-5);
    for(let y=0;y<ah-2;y++){const t=y/(ah-3),k=L.lit?.3:.45;c.fillStyle=`rgb(${Math.round(6+gl[0]*k*t*t)},${Math.round(4+gl[1]*k*t*t)},${Math.round(10+gl[2]*k*t*t)})`;const half=y<4?4+y:6;c.fillRect(mx-half,fy-ah+3+y,half*2,1);}
    for(const sd of [-1,1])for(let i=0;i<2;i++)for(let s2=0;s2<4;s2++){c.fillStyle=L.r[3];c.fillRect(mx+sd*(9+i*2)+sd*Math.round(s2*.4),fy-ah+2+s2*2,1,2);}}
  const out=mkCv(W+8,H+M+6),oc=out.getContext('2d');oc.fillStyle='rgba(10,6,16,.28)';oc.beginPath();oc.ellipse(4+W/2,M+H-4,W/2+3,H/2,0,0,7);oc.fill();oc.drawImage(cv,4,0);
  return {cv:out,x:bx*TS-4,y:by*TS-M};});}
function d8LairGround2D(ctx,m,x,y,Lr){const L=d8LairState(m),c=tileAt(m,x,y),px=x*TS,py=y*TS,R=mulberry(x*313+y*199+m.s*7),f=(col,a,b,w,h)=>{ctx.fillStyle=col;ctx.fillRect(px+a,py+b,w,h);};
  if(x===Lr.ex&&y===Lr.ey){// the way in, going down into the dark
    if(Lr.south){for(let row=0;row<16;row++){const t=row/15;ctx.fillStyle=`rgba(8,4,12,${(.85-.6*t).toFixed(2)})`;ctx.fillRect(px+2,py+row,12,1);}}
    else{// dug into the ground at the hill's foot: a dark hole with a rubble rim, lit from below
      const gl=hx(L.glow);ctx.fillStyle=L.r[1];ctx.beginPath();ctx.ellipse(px+8,py+8,7.5,6.5,0,0,7);ctx.fill();ctx.fillStyle='#07040a';ctx.beginPath();ctx.ellipse(px+8,py+8,6,5,0,0,7);ctx.fill();
      ctx.fillStyle=`rgba(${gl[0]},${gl[1]},${gl[2]},${L.lit?.25:.35})`;ctx.beginPath();ctx.ellipse(px+8,py+10,3.5,2,0,0,7);ctx.fill();for(let a=0;a<8;a++){const t=a/8*6.283;f(L.r[2],8+Math.round(Math.cos(t)*7)-1,8+Math.round(Math.sin(t)*6)-1,2,2);}}
    if(!L.lit){f('#e8e0d0',4,12,3,1);f('#e8e0d0',10,13,2,1);}return;}
  if(SOLID.includes(c)||'=B'.includes(c))return;const onLane=Lr.lane.some(([a,b])=>a===x&&b===y);
  if(onLane){ctx.fillStyle=L.lit?'rgba(70,50,30,.16)':'rgba(40,24,12,.3)';ctx.fillRect(px+2,py,12,16);ctx.fillRect(px+4,py-1,8,18);
    if(!L.lit)for(let i=0;i<3;i++){const a=3+i*4,b=3+Math.floor(R()*6);for(let s=0;s<4;s++)f('rgba(20,10,6,.55)',a+s,b+s,1,1);}}
  if(L.lit)return;const d=Math.abs(x-Lr.ex)+Math.abs(y-Lr.ey);if(d>4)return;
  if(d8LH(x,y,7)<.45){f('#e8e0d0',2+Math.floor(R()*9),3+Math.floor(R()*9),4,1);if(R()<.5)f('#d8d0c0',3+Math.floor(R()*8),6+Math.floor(R()*6),1,3);}
  if(d8LH(x,y,9)<.55)for(let i=0;i<3;i++){const a=Math.floor(R()*13),b=Math.floor(R()*13);f(L.r[1],a,b,2,2);f(L.r[2],a,b,1,1);}}
{const dt0=drawTile;drawTile=function(ctx,m,x,y,frame){const Lr=m&&m.kind==='field'&&m.d8lair;if(!Lr||window.__D8OFF)return dt0.apply(this,arguments);const k=x+','+y;
  if(Lr.mask.has(k)){const c=m.t[y][x];m.t[y][x]=Lr.under[k]||'.';try{dt0.apply(this,arguments);}finally{m.t[y][x]=c;}D8.lair.n2d=(D8.lair.n2d||0)+1;return;}
  const r=dt0.apply(this,arguments);if(Math.abs(x-Lr.ex)<=4&&Math.abs(y-Lr.ey)<=4)d8LairGround2D(ctx,m,x,y,Lr);return r;};}
const D8_EMPTY=mkCv(1,1);
// the entrance's prop: in 2D the torches on the front faces, the banner and the skull pile on top (the mouth is in the face art);
// in HD-2D nothing (the hill and its billboards are geometry)
{const o2=obj2;obj2=function(theme,kind,v){const m=typeof P2!=='undefined'&&P2.dm;if(kind==='facade'&&m&&m.kind==='field'&&m.ent&&m.d8lair&&!window.__D8OFF){try{const Lr=m.d8lair,L=d8LairState(m);
      m.lights=m.lights||[];if(Lr.mouth)m.lights.push([Lr.ex*TS+8-Lr.fv[0]*6,Lr.ey*TS+8-Lr.fv[1]*6,20,L.lit?'gold':'fire',1]);Lr.torches.forEach(([tx,ty])=>m.lights.push([tx*TS+8+Lr.fv[0]*8,ty*TS+(Lr.south?0:4),12,L.lit?'gold':'torch',1]));
      D8.lair.drawn=(D8.lair.drawn||0)+1;D8.lair.last={id:m.id,lit:L.lit,lk:L.lk,part:'mound',tiles:Lr.tiles.length,south:Lr.south};}catch(e){}return D8_EMPTY;}
  return o2.apply(this,arguments);};}
{const hc0=hdBakeCards;hdBakeCards=function(){D8.card=1;try{return hc0.apply(this,arguments);}finally{D8.card=0;}};}
function d8LairFx(m){if(!m||m.kind!=='field'||!m.d8lair||window.__D8OFF)return null;const Lr=m.d8lair;return {L:d8LairState(m),Lr,x:Lr.ex*TS+8,y:(Lr.ey+1)*TS};}
function d8Tint(cv,col){return imgOf('d8tint:'+col+cv.width+'x'+cv.height,()=>{const c=mkCv(cv.width,cv.height),x=c.getContext('2d');x.drawImage(cv,0,0);x.globalCompositeOperation='source-in';x.fillStyle=col;x.fillRect(0,0,c.width,c.height);return c;});}
// 2D: the light from the mouth, the torch flames and the plume, never inside the hero's box
{const wd0=worldDraw;worldDraw=function(now){wd0.apply(this,arguments);try{if(typeof hdActive==='function'&&hdActive())return;const m=WS.m,ctx=WS.ctx,o=d8LairFx(m);if(!o||!WS.cam)return;
  const cx=Math.round(WS.cam.x),cy=Math.round(WS.cam.y),still=gfxStill(),t=still?0:now,X=o.x-cx,Y=o.y-cy;if(X<-80||X>WS.vw+80||Y<-60||Y>WS.vh+200)return;
  const hx=Math.round(WS.px)+8-cx,hy=Math.round(WS.py)-cy;ctx.save();ctx.beginPath();ctx.rect(0,0,WS.vw,WS.vh);ctx.rect(hx-10,hy-10,20,28);ctx.clip('evenodd');
  const p=.8+.2*Math.sin(t/(o.L.lit?1100:520)),gl=hx2(o.L.glow);ctx.globalCompositeOperation='lighter';
  if(o.Lr.mouth){const mx=X-o.Lr.fv[0]*6,my=Y-8-o.Lr.fv[1]*6+(o.Lr.south?-2:0),g=ctx.createRadialGradient(mx,my,1,mx,my,18);g.addColorStop(0,`rgba(${gl},${(o.L.lit?.28:.4)*p})`);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(mx-18,my-18,36,36);}
  {const tp=o.Lr.tiles.reduce((a,q)=>o.Lr.hh[q+'']>=o.Lr.hh[a+'']?q:a,o.Lr.tiles[0]);ctx.globalAlpha=(o.L.lit?.18:.26)*p;ctx.drawImage(d8Tint(d8Plume(),o.L.glow),tp[0]*TS-cx,tp[1]*TS-cy-128+4);}ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  const fl=Math.floor(t/140)%2,Lr=o.Lr,hAt=(x,y)=>((Lr.cor[x+','+y]||0)+(Lr.cor[(x+1)+','+y]||0)+(Lr.cor[x+','+(y+1)]||0)+(Lr.cor[(x+1)+','+(y+1)]||0))/4,tile=(tx,ty)=>[tx*TS+8-cx,ty*TS+10-cy-Math.round(hAt(tx,ty)*D8_K2)];
  if(!o.L.lit){const ex2=d8LairExtras(o.L);if(Lr.deco[0]){const [a,b]=tile(...Lr.deco[0]);ctx.drawImage(ex2,0,0,16,24,a-8,b-24-4,16,24);}if(Lr.deco[1]){const [a,b]=tile(...Lr.deco[1]);ctx.drawImage(ex2,16,0,16,24,a-8,b-24-4,16,24);}}
  Lr.torches.forEach(([tx,ty],i)=>{let [a,b]=tile(tx,ty);a+=Lr.fv[0]*6;b=Lr.south?(ty+1)*TS-cy-4:b+Lr.fv[1]*5;ctx.fillStyle='#3a2a1a';ctx.fillRect(a-1,b-8,2,8);ctx.fillStyle='#5a4a3a';ctx.fillRect(a-2,b-5,4,2);
    ctx.fillStyle=o.L.lit?(fl^i?'#ffe08a':'#ffd04a'):(fl^i?'#ffb04a':'#ff7a2a');ctx.fillRect(a-2,b-12-(fl^i),4,4);ctx.fillStyle='#fff0b0';ctx.fillRect(a-1,b-11,2,2);});
  ctx.restore();D8.lair.fx2d={x:X,y:Y,lit:o.L.lit,a:+p.toFixed(2)};}catch(e){}};}
function hx2(c){const h=hx(c);return h.join(',');}
// the map: its own icon and legend entry
MAPICO_X.lair=[[2,4,6,1,'#6a5a4c'],[1,5,8,5,'#5a4a3e'],[0,7,10,3,'#4a3c32'],[3,3,4,1,'#7a6a5a'],[4,6,2,4,'#0a0710'],[4,9,2,1,'#ff6a3a'],[3,2,1,1,'#e8e0d0'],[6,1,1,2,'#3a2a1a'],[7,1,2,1,'#c0392b']];
MAPICO_X.lairlit=[[2,4,6,1,'#7a6a5c'],[1,5,8,5,'#6a5a4e'],[0,7,10,3,'#5a4c42'],[3,3,4,1,'#8a7a6a'],[4,6,2,4,'#0a0710'],[4,9,2,1,'#ffd04a'],[4,1,2,2,'#ffd04a']];
MAPICO_NAME.lair='Lair';MAPICO_NAME.lairlit='Lair (relit)';MKN.lair='Lair';MKN.lairlit='Lair (relit)';MK.lair=['#ff5a3a','☗'];MK.lairlit=['#ffd04a','☗'];
{const mm0=mapMarks;mapMarks=function(m){const L=mm0.apply(this,arguments);try{if(m&&m.kind==='field'&&!window.__D8OFF)L.forEach(o=>{if(o.k==='dungeon')o.k=G.cleared&&G.cleared[m.s]?'lairlit':'lair';});}catch(e){}return L;};}

// =================== 4. saves made inside a reshaped dungeon ===================
{const ew0=enterWorldFromSave;enterWorldFromSave=function(){try{const p=G&&G.pos;if(p&&/^[dkofg]\d/.test(String(p.m))){resetMaps();const m=getMap(p.m);if(m&&(m.kind==='dungeon'||m.kind==='field')&&solidAt(m,p.x,p.y)){const s=d8Nearest(m,p.x,p.y);if(s){p.x=s[0];p.y=s[1];D8.moved=[p.m,s[0],s[1]];}}}}catch(e){}
  return ew0.apply(this,arguments);};}
function d8Nearest(m,x,y){const seen=new Set([x+','+y]),q=[[x,y]];for(let i=0;i<q.length&&i<20000;i++){const [cx,cy]=q[i];if(!(cx===x&&cy===y)&&!solidAt(m,cx,cy)&&tileAt(m,cx,cy)!=='E')return [cx,cy];
  for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=cx+a,ny=cy+b,k=nx+','+ny;if(nx<0||ny<0||nx>=m.w||ny>=m.h||seen.has(k))continue;seen.add(k);q.push([nx,ny]);}}return m.start||null;}
// test hook: props up to three rows north of the mound that its real (HD-2D) height would hide (the pgHides rule)
function d8LairHidden(m){const Lr=m&&m.d8lair;if(!Lr)return [];const out=[],Th=Math.tan(HD2D.pitch*Math.PI/180);Lr.tiles.forEach(([x,y])=>{const h=Math.max(Lr.cor[x+','+y]||0,Lr.cor[(x+1)+','+y]||0,Lr.cor[x+','+(y+1)]||0,Lr.cor[(x+1)+','+(y+1)]||0);
  for(let k=1;k<=3;k++){const yy=y-k,c=m.t[yy]&&m.t[yy][x];if(!c||Lr.mask.has(x+','+yy))continue;const ph=PG_PROP_H[c];if(ph==null||c==='#')continue;const v=h-((k-1)*TS-.5)*Th;if(ph-v<PG_VIS)out.push({x,y:yy,c,ph,v:+v.toFixed(1)});}});return out;}
try{window.__D8={D8,D8M,D8_REALM,D8_ZONE,D8_CAVE,styleFor:d8StyleFor,styleOf:d8StyleOf,simple:d8Simple,lair:m=>d8LairFx(m),lairTex:L=>d8LairTex(L),lairState:m=>d8LairState(m),nearest:d8Nearest,issues:d8Issues,enterFromSave:()=>enterWorldFromSave(),mMap:()=>mMap(),BG:k=>!!BG[k],D8P:()=>Object.keys(D8P),lairFx:()=>d8LairFx(WS.m),lairHidden:m=>d8LairHidden(m),facade:m=>{const k=P2.dm;P2.dm=m;try{const c=obj2(m.theme,'facade');return [c.width,c.height];}finally{P2.dm=k;}}};}catch(e){}
