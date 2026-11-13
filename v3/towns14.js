// ===== towns14.js (v0.20.6): every realm's town is its own place: nineteen layouts and nineteen building styles, chosen by realm key and theme family =====
// Owner's note: "most towns layouts are too similar, buildings should look different in each realm". Before this pass the town was one of six layouts
// chosen by the realm's THEME, so Thistlewold, Amberglade, Willowmere and Boneharrow all stood on the same grid, and every house was the same
// three roof kinds in a different tint. Now:
//   1 LAYOUTS (T14.arch): ring round a plaza, main street, harbour with piers, canal town with bridges, market cross, walled keep, village green,
//     terraced hillside, ladder of ledges, cave mouth, ruined town, stilt town, tent camp, tunnel fork, amphitheatre bowl, floating islands,
//     meandering road, fenced farmsteads, churchyard close. Each generates the same service buildings (inn, tavern, smithy, alchemy, guild hall, a chapel
//     or houses), the waystone and the board, the road gates and the sign, and every door is linked to the roads (t14Link) and checked (t14Check)
//     before the town is accepted; a layout that fails a check three times falls back to the old theme layout (T14.fallback counts them).
//   2 STYLES (T14.fam): a building family per realm (timber and thatch, cider barns, whitewash and blue tile, stilt shingle, mud brick and reed,
//     mushroom and root, obsidian and ember, riveted iron, ice block and turf, snow chalet, slate stone, cloud stone and spires, sandstone flats and
//     awnings, bamboo pagodas, salt pavilions, bone and ivory, charred timber, driftwood and shell, crystal and void glass). A family is a wall
//     painter, a roof SHAPE (gable, flat, dome, spire, pagoda, hull, sawtooth, shed, pavilion), a palette, windows, door and chimney, drawn in
//     2D (drawBuilding, through a hook) and shaped in HD-2D (hdBldKind and hdRoofProf, both hooks): the silhouette changes, not just the tint.
//   3 ASSIGNMENT (t14Assign): read from REALMS / ZONES at run time. Known keys have a table row; any other key gets a layout and a family by its
//     theme, ground motif and mood, the least used layout of its theme first, so a new realm is a distinct town on its own.
// Tests: tools/chrome/v183a.js (layout fingerprints, silhouette masks, every town checked), shots with SHOTDIR.
const T14={arch:{},fam:{},fallback:0,made:0,off:false,tab:{}};
// ---------- the kit ----------
function t14T(W,H,road,th){const T=new Gr(W,H,'.');T.road=road;T.th=th||'meadow';T.rect(0,road,W,1,'=');return T;}
function t14Frame(T,ch,towers,thick){const W=T.W,H=T.H,r=T.road,t=thick||1;for(let k=0;k<t;k++){for(let x=0;x<W;x++){T.put(x,k,ch);T.put(x,H-1-k,ch);}for(let y=0;y<H;y++){T.put(k,y,ch);T.put(W-1-k,y,ch);}}
  T.rect(0,r,W,1,'=');if(towers)[[0,0],[W-1,0],[0,H-1],[W-1,H-1],[0,r-1],[0,r+1],[W-1,r-1],[W-1,r+1]].forEach(([x,y])=>T.put(x,y,'Y'));}
const t14Bd=(T,k,x,y,w,h)=>T.B(k,x,y,w,h);
function t14Put(T,list,c){list.forEach(([x,y])=>T.put(x,y,c));}
function t14Ell(T,cx,cy,rx,ry,c,only){for(let y=Math.floor(cy-ry);y<=cy+ry;y++)for(let x=Math.floor(cx-rx);x<=cx+rx;x++){if(((x-cx)/rx)**2+((y-cy)/ry)**2<=1&&(!only||only.includes(T.get(x,y))))T.put(x,y,c);}}
// every door step joins the nearest road, plaza, bridge or stair through open ground (or water: a boardwalk when wet is set)
function t14Link(T,wet){const g=T.g,W=T.W,H=T.H,net=c=>c==='='||c===':'||c==='B'||c==='s',fr=c=>'.,ftxbhkm'.includes(c)||(wet&&c==='~');
  T.bld.forEach(b=>{const sx=b.door[0],sy=b.door[1]+1;if(sy>=H-1||net(g[sy][sx]))return;const prev={},Q=[[sx,sy]];prev[sx+','+sy]=null;let end=null;
    for(let i=0;i<Q.length&&!end;i++){const [x,y]=Q[i];for(const [a,c] of [[0,1],[0,-1],[1,0],[-1,0]]){const nx=x+a,ny=y+c,k=nx+','+ny;if(nx<1||ny<1||nx>=W-1||ny>=H-1||k in prev)continue;const t=g[ny][nx];if(!net(t)&&!fr(t))continue;prev[k]=[x,y];if(net(t)){end=[nx,ny];break;}Q.push([nx,ny]);}}
    if(!end)return;let p=prev[end[0]+','+end[1]];while(p){const [x,y]=p;if(g[y][x]==='~')g[y][x]='B';else if(g[y][x]!=='B')g[y][x]='=';p=prev[x+','+y];}});}
// a few crates and barrels beside the buildings, a lamp every so often along the main road; nothing near a door
function t14Deco(T,R,o){o=o||{};const g=T.g,W=T.W,H=T.H,df=new Set();T.bld.forEach(b=>{for(let a=-2;a<=2;a++)for(let d=0;d<=2;d++)df.add((b.door[0]+a)+','+(b.door[1]+d));});
  const nb=(x,y)=>[[0,0],[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>'Bs'.includes((g[y+b]||[])[x+a]||' '));
  const ok=(x,y)=>x>2&&y>1&&x<W-3&&y<H-2&&g[y][x]==='.'&&!df.has(x+','+y)&&!nb(x,y)&&!(Math.abs(y-T.road)<=2&&(x<5||x>W-6));
  if(o.crates!==0)T.bld.forEach(b=>{if(b.k==='lighthouse')return;if(R()<.7){const d=R()<.5?-1:1,sx=d<0?b.x-1:b.x+b.w,y=b.y+b.h-1-(R()<.5?0:1);if(ok(sx,y)&&[1,2,3].every(k=>g[y]&&g[y][sx+d*k]!=='H'&&g[y][sx+d*k]!==undefined))T.put(sx,y,R()<.5?'x':'b');}});
  const L=o.lamp||'L';for(let x=6;x<W-6;x+=o.lampStep||7){for(const y of [T.road-1,T.road+1]){if(ok(x,y)&&['=',':'].some(c=>[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>g[y+b][x+a]===c))){T.put(x,y,L);break;}}}
  // a light by each gate, so the way in is lit at night in every layout
  [[10,9,8,11,12,7,6,5],[W-11,W-10,W-9,W-12,W-13,W-8,W-7,W-6]].forEach(xs=>{let done=0;for(const x of xs)for(const y of [T.road+2,T.road-2,T.road+3,T.road-3,T.road+1,T.road-1,T.road+4,T.road-4]){if(!done&&ok(x,y)&&[[2,0],[-2,0],[0,2],[0,-2],[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>'=:B'.includes((g[y+b]||[])[x+a]))){T.put(x,y,L);done=1;}}});
  [[1,T.road-2],[W-2,T.road-2]].forEach(([x,y])=>{if(g[y]&&g[y][x]==='.')T.put(x,y,'u');});}
// the hand placed towns below are checked: buildings in bounds and apart, every door step and the waystone and board reached from the west gate
function t14Check(t){const g=t.g,H=g.length,W=g[0].length,r=t.road,out=[];let area=0;const kinds={};
  t.bld.forEach(b=>{area+=b.w*b.h;kinds[b.k]=(kinds[b.k]||0)+1;if(b.x<1||b.y<1||b.x+b.w>W-1||b.y+b.h>H-1)out.push('out '+b.k);});
  let hn=0;g.forEach(row=>row.forEach(c=>{if(c==='H')hn++;}));if(hn!==area)out.push('overlap '+hn+'/'+area);
  ['inn','tavern','smithy','workshop','guild'].forEach(k=>{if(!kinds[k])out.push('no '+k);});
  const D=walkDist(g,1,r,0),ok=(x,y)=>D[y]&&D[y][x]>=0;if(!ok(1,r)||!ok(W-2,r))out.push('gates apart');
  t.bld.forEach(b=>{const [dx,dy]=b.door;if(g[dy][dx]!=='H')out.push('door '+b.k);else if(!ok(dx,dy+1))out.push('step '+b.k+' '+dx+','+(dy+1));});
  let w=0,q=0,free=0;g.forEach((row,y)=>row.forEach((c,x)=>{if(c==='W'||c==='q'){const near=[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>ok(x+a,y+b));if(!near)out.push('prop '+c);if(c==='W')w++;else q++;}if((c==='.'||c===':')&&ok(x,y)&&x>2&&x<W-3&&y>1&&y<H-2&&y!==r)free++;}));
  if(!w||!q)out.push('no waystone or board');if(free<40)out.push('few free tiles '+free);
  if(g[r+1][W-3]!=='S')out.push('no sign');return out;}
function t14Flip(T){const W=T.W;T.g.forEach(r=>r.reverse());T.bld.forEach(b=>{b.x=W-b.x-b.w;b.door=[W-1-b.door[0],b.door[1]];});}
// ---------- the layouts: each returns a Gr with .road and .th; v 1 mirrors it ----------
const TA14=T14.arch;
// ring round a central plaza: a ring road hugs the plaza, the buildings stand round it, a lane under the southern row
TA14.ring=(R,v)=>{const T=t14T(38,28,14,'meadow'),W=38;t14Frame(T,'Z',1);
  T.rect(12,10,14,9,':');T.rect(18,13,2,2,'O');T.hline(11,26,9,'=');T.hline(11,26,19,'=');T.vline(11,9,19,'=');T.vline(26,9,19,'=');T.hline(3,34,25,'=');T.vline(14,19,25,'=');T.vline(27,19,25,'=');
  t14Bd(T,'inn',8,4,6,5);t14Bd(T,'tavern',16,4,6,5);t14Bd(T,'guild',24,3,7,6);t14Bd(T,'chapel',2,9,6,4);
  t14Bd(T,'smithy',8,21,6,4);t14Bd(T,'workshop',16,21,4,4);t14Bd(T,'house',22,21,4,4);t14Bd(T,'house',29,21,4,4);t14Bd(T,'house',2,17,4,4);t14Bd(T,'house',31,9,4,4);t14Bd(T,'house',31,16,4,4);
  t14Put(T,[[13,11],[14,11],[23,11],[24,11],[13,17],[24,17]],'m');T.put(15,15,'W');T.put(22,15,'q');t14Put(T,[[12,10],[25,10],[12,18],[25,18]],'L');return T;};
// a main street: stalls and a paved walk, houses and shops on both sides, alleys through the southern row to a back lane
TA14.street=(R,v)=>{const T=t14T(42,24,11,'meadow'),W=42;t14Frame(T,'T',0,2);T.rect(2,10,W-4,1,':');T.rect(2,12,W-4,1,':');T.hline(3,38,20,'=');
  [11,26,35].forEach(x=>T.vline(x,13,20,'='));
  t14Bd(T,'inn',4,5,6,5);t14Bd(T,'tavern',13,5,6,5);t14Bd(T,'guild',22,4,7,6);t14Bd(T,'workshop',32,6,4,4);t14Bd(T,'house',38,5,3,5);
  t14Bd(T,'smithy',4,15,6,5);t14Bd(T,'house',13,16,4,4);t14Bd(T,'chapel',17,15,6,5);t14Bd(T,'house',28,16,4,4);t14Bd(T,'house',37,16,3,4);
  T.put(15,13,'W');T.put(21,13,'q');t14Put(T,[[3,13],[24,13],[31,13]],'m');return T;};
// a harbour: houses on the hill, a market and the lighthouse above a stone quay, piers and boats on the water
TA14.harbour=(R,v)=>{const T=t14T(40,28,9,'coast'),W=40,H=28;for(let x=0;x<W;x++){T.put(x,0,'#');T.put(x,1,x%5?'#':'T');}
  for(let x=0;x<W;x++){const top=16+Math.round(Math.sin(x/4));for(let y=top;y<H;y++)T.put(x,y,'~');}
  T.hline(1,W-2,15,':');[[9,10],[20,21],[31,32]].forEach(([a,b])=>{T.vline(a,16,24,'B');T.vline(b,16,24,'B');T.hline(a,b,24,'B');});
  [6,18,31].forEach(x=>T.vline(x,10,14,'='));
  t14Bd(T,'inn',3,4,6,5);t14Bd(T,'tavern',11,4,6,5);t14Bd(T,'chapel',19,3,6,6);t14Bd(T,'guild',27,3,7,6);t14Bd(T,'house',35,4,3,4);
  t14Bd(T,'smithy',3,10,6,5);t14Bd(T,'workshop',12,11,4,4);t14Bd(T,'lighthouse',34,10,3,5);t14Bd(T,'house',26,11,4,4);
  T.rect(19,11,6,4,':');t14Put(T,[[19,12],[24,12]],'m');T.put(21,13,'W');T.put(22,13,'q');[[13,22],[25,22],[36,21]].forEach(([x,y])=>T.put(x,y,'o'));return T;};
// a canal town: two canals cross the road under bridges, a third runs along the southern bank, narrow tall houses on the islands
TA14.canal=(R,v)=>{const T=t14T(40,28,13,'meadow'),W=40,H=28;t14Frame(T,'T',0,2);
  [[12,13],[26,27]].forEach(([a,b])=>{T.rect(a,2,2,20,'~');T.put(a,13,'B');T.put(b,13,'B');T.put(a+1,13,'B');T.put(b-1+1,13,'B');});T.rect(1,21,W-2,2,'~');
  T.rect(12,13,2,1,'B');T.rect(26,13,2,1,'B');T.hline(2,11,20,'=');T.hline(14,25,20,'=');T.hline(28,37,20,'=');[[12,20],[13,20],[26,20],[27,20]].forEach(([x,y])=>T.put(x,y,'B'));
  [[6],[19],[33]].forEach(([x])=>{T.rect(x,21,1,2,'B');T.rect(x,23,1,1,'=');});T.hline(2,37,23,'=');T.rect(1,24,W-2,2,'.');
  t14Bd(T,'inn',3,8,6,5);t14Bd(T,'tavern',15,8,6,5);t14Bd(T,'house',22,8,3,5);t14Bd(T,'guild',29,6,7,6);
  t14Bd(T,'smithy',3,15,6,5);t14Bd(T,'workshop',15,16,4,4);t14Bd(T,'house',21,15,3,5);t14Bd(T,'chapel',29,15,6,5);
  T.rect(4,2,6,5,':');T.rect(16,14,5,1,':');T.put(17,15,'W');T.put(19,15,'q');t14Put(T,[[3,22],[20,22],[34,22],[9,23]],'o');return T;};
// a market cross: the east road meets a north-south road at a square of stalls, a quarter of the town in each corner, walled
TA14.cross=(R,v)=>{const T=t14T(40,28,14,'meadow'),W=40,H=28;t14Frame(T,'Z',1);T.vline(19,1,H-2,'=');T.vline(20,1,H-2,'=');T.rect(14,10,12,9,':');
  T.hline(3,17,22,'=');T.hline(22,36,22,'=');T.hline(3,17,7,'=');T.hline(22,36,7,'=');
  t14Bd(T,'inn',4,8,6,6);t14Bd(T,'tavern',27,8,6,6);t14Bd(T,'house',12,3,4,4);t14Bd(T,'house',24,3,4,4);t14Bd(T,'smithy',4,16,6,5);t14Bd(T,'workshop',12,17,4,4);t14Bd(T,'guild',26,16,7,6);t14Bd(T,'house',35,17,3,4);
  t14Put(T,[[15,11],[16,11],[23,11],[24,11],[15,17],[24,17]],'m');T.put(17,13,'W');T.put(22,13,'q');t14Put(T,[[14,10],[25,10],[14,18],[25,18]],'u');return T;};
// a walled keep: an outer ward with the trades and gate towers, an inner wall round the keep and its courtyard
TA14.keep=(R,v)=>{const T=t14T(40,30,15,'snow'),W=40,H=30;t14Frame(T,'Z',1);
  for(let x=10;x<=29;x++){T.put(x,5,'Z');T.put(x,24,'Z');}for(let y=5;y<=24;y++){T.put(10,y,'Z');T.put(29,y,'Z');}
  [14,15,16].forEach(y=>{T.put(10,y,'=');T.put(29,y,'=');});[13,17].forEach(y=>{T.put(10,y,'Y');T.put(29,y,'Y');});[19,20].forEach(x=>{T.put(x,24,'=');T.vline(x,25,28,'=');});
  T.rect(11,6,18,18,':');t14Bd(T,'keep',14,6,12,8);T.rect(19,14,2,1,':');t14Bd(T,'guild',11,17,7,6);T.rect(22,18,6,4,':');T.rect(24,19,2,2,'O');T.put(22,16,'W');T.put(27,16,'q');
  t14Bd(T,'inn',2,17,6,5);t14Bd(T,'tavern',31,17,6,5);t14Bd(T,'smithy',2,8,6,5);t14Bd(T,'workshop',31,8,4,5);t14Bd(T,'house',3,24,4,4);t14Bd(T,'house',32,24,4,4);
  T.hline(1,9,22,'=');T.hline(30,38,22,'=');T.hline(1,38,3,'=');T.hline(1,38,28,'=');t14Put(T,[[12,7],[27,7],[12,22],[28,22]],'v');return T;};
// a village green: cottages scattered round a pond and an open green, dirt paths from every door
TA14.green=(R,v)=>{const T=t14T(40,28,15,'meadow'),W=40,H=28;t14Frame(T,'T',0,2);t14Ell(T,20,10,5,3,'~');t14Ell(T,20,10,8,5,',',['.']);T.hline(14,26,14,'=');
  t14Bd(T,'inn',4,3,6,5);t14Bd(T,'house',13,3,4,4);t14Bd(T,'workshop',23,3,4,4);t14Bd(T,'tavern',31,4,6,5);t14Bd(T,'house',3,10,4,4);t14Bd(T,'house',31,11,4,4);
  t14Bd(T,'smithy',4,18,6,5);t14Bd(T,'house',13,19,4,4);t14Bd(T,'chapel',20,18,8,5);t14Bd(T,'guild',30,18,7,6);
  T.put(17,13,'W');T.put(23,13,'q');t14Put(T,[[9,7],[10,16],[27,16],[28,9]],'t');t14Put(T,[[12,14],[28,14]],'L');return T;};
// a terraced hillside: three terraces behind cliffs, stairs between them, each building facing the lane at the foot of its terrace
TA14.terrace=(R,v)=>{const T=t14T(38,30,17,'snow'),W=38,H=30;for(let x=0;x<W;x++){T.put(x,0,'#');T.put(x,H-1,'#');T.put(x,H-2,'#');}for(let y=0;y<H;y++){T.put(0,y,'#');T.put(W-1,y,'#');}T.rect(0,17,W,1,'=');
  T.hline(1,W-2,10,'#');T.hline(1,W-2,19,'#');[[8,10],[9,10],[28,10],[29,10],[18,19],[19,19],[27,19]].forEach(([x,y])=>T.put(x,y,'s'));T.hline(2,35,8,'=');T.hline(2,35,26,'=');T.vline(8,8,11,'=');T.vline(28,8,11,'=');T.vline(8,18,19,'=');T.vline(28,18,19,'=');T.vline(8,20,26,'=');T.vline(28,20,26,'=');
  t14Bd(T,'guild',3,3,7,5);t14Bd(T,'chapel',12,3,7,5);t14Bd(T,'house',23,4,4,4);t14Bd(T,'house',30,4,4,4);t14Bd(T,'inn',3,12,6,5);t14Bd(T,'tavern',29,12,6,5);
  T.rect(13,12,12,5,':');T.put(15,14,'W');T.put(22,14,'q');t14Bd(T,'smithy',3,21,6,5);t14Bd(T,'workshop',14,22,4,4);t14Bd(T,'house',22,21,4,5);t14Bd(T,'house',31,22,4,4);
  t14Put(T,[[11,11],[26,11],[12,18],[25,18]],'L');return T;};
// a ladder of ledges in the sky: three islands joined by rope bridges, the road on the middle one
TA14.ledges=(R,v)=>{const T=t14T(38,32,17,'heights'),W=38,H=32;T.rect(0,0,W,H,'~');T.rect(8,3,24,7,'.');T.rect(2,13,34,9,'.');T.rect(10,24,18,6,'.');
  [[8,3],[31,3],[8,9],[31,9],[2,13],[35,13],[2,21],[35,21],[10,24],[27,24],[10,29],[27,29]].forEach(([x,y])=>T.put(x,y,'~'));T.rect(0,17,W,1,'=');
  T.hline(9,30,8,'=');T.vline(10,10,12,'B');T.vline(29,10,12,'B');T.vline(10,9,9,'=');T.vline(29,9,9,'=');T.rect(18,22,2,2,'B');T.hline(11,26,28,'=');T.vline(18,24,27,'=');T.vline(19,24,27,'=');
  t14Bd(T,'guild',9,3,7,5);t14Bd(T,'inn',19,3,6,5);t14Bd(T,'house',27,4,3,4);t14Bd(T,'tavern',4,13,6,4);t14Bd(T,'workshop',12,13,4,4);t14Bd(T,'house',21,13,4,4);t14Bd(T,'smithy',29,13,6,4);
  T.rect(13,18,10,3,':');T.put(15,19,'W');T.put(20,19,'q');t14Bd(T,'chapel',11,24,6,4);t14Bd(T,'house',21,24,5,4);t14Put(T,[[6,19],[32,19],[24,21]],'u');return T;};
// a cave mouth: the town huddles under a cliff, the guild hall deep inside the opening, a crescent of houses along the cliff foot
TA14.cave=(R,v)=>{const T=t14T(40,28,17,'cave'),W=40,H=28,n=valueNoise(R,W,H,4);for(let y=0;y<H;y++)for(let x=0;x<W;x++){const e=Math.min(x,y,W-1-x,H-1-y);if(y<9||e<2||(e<4&&n(x,y)>.55))T.put(x,y,'#');}
  T.rect(15,3,10,6,'.');T.rect(1,14,3,7,'.');T.rect(36,14,3,7,'.');T.rect(0,17,W,1,'=');T.vline(19,9,16,'=');T.vline(20,9,16,'=');T.rect(15,18,10,4,':');T.hline(4,35,24,'=');T.vline(15,18,24,'=');T.vline(24,18,24,'=');
  t14Bd(T,'guild',16,3,7,6);t14Bd(T,'inn',3,13,6,4);t14Bd(T,'tavern',11,11,6,6);t14Bd(T,'smithy',25,11,6,6);t14Bd(T,'workshop',32,13,4,4);t14Bd(T,'house',5,20,4,4);t14Bd(T,'house',30,20,4,4);
  T.put(17,19,'W');T.put(22,19,'q');t14Put(T,[[16,9],[25,9],[10,15],[31,15],[8,18],[32,18]],'v');t14Put(T,[[18,5],[22,5],[14,13],[27,13]],'P');return T;};
// a ruined town: broken wall lines, pillars and rubble, flooded pockets, five roofs that still stand and half-buried houses
TA14.ruin=(R,v)=>{const T=t14T(38,28,14,'void'),W=38,H=28;t14Frame(T,'#',0,1);T.rect(0,14,W,1,'=');
  [[2,3,9,7],[26,3,9,6],[2,18,8,7],[27,19,9,6]].forEach(([x,y,w,h])=>{for(let i=0;i<w;i++){if(i%4!==3)T.put(x+i,y,'Q');if(i%5!==2)T.put(x+i,y+h-1,'Q');}for(let j=0;j<h;j++){if(j%3!==1)T.put(x,y+j,'Q');if(j%4!==2)T.put(x+w-1,y+j,'Q');}});
  T.rect(13,8,12,5,':');T.rect(14,16,10,3,':');T.hline(3,34,22,'=');T.vline(12,15,22,'=');T.vline(25,15,22,'=');t14Ell(T,31,12,3,2,'~');t14Ell(T,6,16,3,1,'~');t14Ell(T,30,25,4,1,'~');
  t14Bd(T,'inn',11,3,6,5);t14Bd(T,'tavern',19,3,6,5);t14Bd(T,'guild',28,10,7,5);t14Bd(T,'smithy',3,9,6,4);t14Bd(T,'workshop',13,18,4,4);t14Bd(T,'house',21,18,4,4);t14Bd(T,'house',6,22,4,4);t14Bd(T,'chapel',26,23,6,3);
  T.put(15,10,'W');T.put(22,10,'q');t14Put(T,[[13,8],[24,8],[13,12],[24,12],[30,17],[8,13],[16,22],[34,20],[4,18]],'P');t14Put(T,[[10,12],[27,13],[19,17],[23,22],[3,15],[35,15],[16,16],[32,8],[20,9]],'r');t14Put(T,[[33,7],[34,8],[7,6]],'g');return T;};
// a stilt town: islets of mud joined by boardwalks over open water, boats, the buildings on platforms
TA14.lake=(R,v)=>{const T=t14T(40,28,14,'coast'),W=40,H=28;T.rect(0,0,W,H,'~');T.rect(0,14,W,1,'B');
  [[7,8,6,4],[20,6,6,4],[33,8,5,4],[7,19,6,4],[20,19,6,4],[33,19,5,4]].forEach(([cx,cy,rx,ry])=>t14Ell(T,cx,cy,rx,ry,'.'));t14Ell(T,20,14,7,2,'.');
  T.hline(0,W-1,14,'B');t14Put(T,[[1,14],[2,14],[W-2,14],[W-3,14]],'B');
  t14Bd(T,'inn',4,5,6,5);t14Bd(T,'house',12,6,3,4);t14Bd(T,'tavern',17,3,6,5);t14Bd(T,'guild',30,4,7,5);t14Bd(T,'chapel',24,6,4,4);t14Bd(T,'smithy',3,16,6,5);t14Bd(T,'workshop',17,17,4,4);t14Bd(T,'house',23,17,4,4);t14Bd(T,'house',31,17,4,4);
  T.rect(18,12,5,3,':');T.put(18,13,'W');T.put(22,13,'q');[[14,12],[27,20],[1,24],[38,24],[12,26],[28,25]].forEach(([x,y])=>T.put(x,y,'o'));return T;};
// a tent camp inside a palisade: v0 is a ring of tents round a bonfire, v1 rows of pavilions on a flat with a windbreak
TA14.camp=(R,v)=>{const T=t14T(36,26,13,v?'heights':'void'),W=36,H=26;
  if(!v){t14Ell(T,17.5,12.5,15,10.5,'F');t14Ell(T,17.5,12.5,14,9.5,'.');T.rect(0,0,W,H,'.');for(let y=0;y<H;y++)for(let x=0;x<W;x++){const d=((x-17.5)/16)**2+((y-12.5)/11.5)**2;if(d>1)T.put(x,y,'#');else if(d>.84)T.put(x,y,'F');}
    T.rect(0,13,W,1,'=');[[0,12],[0,14],[1,12],[1,14],[W-1,12],[W-1,14],[W-2,12],[W-2,14]].forEach(([x,y])=>T.put(x,y,'F'));T.rect(1,13,2,1,'=');T.rect(W-3,13,2,1,'=');
    T.rect(13,10,10,6,':');t14Put(T,[[17,12],[18,12],[17,13],[18,13]],'v');
    t14Bd(T,'inn',4,8,5,4);t14Bd(T,'tavern',11,3,5,4);t14Bd(T,'guild',21,3,6,4);t14Bd(T,'smithy',28,8,5,4);t14Bd(T,'workshop',9,16,4,4);t14Bd(T,'house',22,15,4,4);t14Bd(T,'house',27,15,4,4);t14Bd(T,'chapel',5,15,4,4);
    T.put(15,15,'W');T.put(21,15,'q');t14Put(T,[[7,6],[30,6],[6,22],[30,21]],'e');t14Put(T,[[3,3],[32,3]],'N');}
  else{t14Frame(T,'F',0,1);T.rect(0,13,W,1,'=');T.hline(1,W-2,9,'=');T.hline(1,W-2,17,'=');
    T.hline(1,W-2,3,'#');T.hline(1,W-2,23,'#');T.hline(1,W-2,22,'=');[11,19,26].forEach(x=>T.vline(x,17,22,'='));T.rect(14,10,8,7,':');
    t14Bd(T,'inn',3,5,5,4);t14Bd(T,'tavern',10,5,5,4);t14Bd(T,'guild',17,4,6,5);t14Bd(T,'chapel',26,5,5,4);t14Bd(T,'smithy',3,18,5,4);t14Bd(T,'workshop',11,18,4,4);t14Bd(T,'house',19,18,4,4);t14Bd(T,'house',26,18,4,4);t14Bd(T,'house',31,5,3,4);
    T.put(16,12,'W');T.put(20,12,'q');t14Put(T,[[14,10],[21,10],[14,16],[21,16]],'u');t14Put(T,[[2,12],[33,12],[2,15],[33,15]],'e');}
  return T;};
// a fork of tunnels: an open hall in the west, three galleries branching east between walls of rock, the road in the middle one
TA14.fork=(R,v)=>{const T=t14T(40,28,16,'cave'),W=40,H=28;T.rect(0,0,W,H,'#');T.rect(1,1,15,25,'.');T.rect(16,1,22,7,'.');T.rect(16,10,23,7,'.');T.rect(16,19,22,7,'.');T.rect(0,16,W,1,'=');
  T.hline(16,36,7,'=');T.hline(16,36,25,'=');T.rect(3,12,12,9,':');T.vline(8,2,10,'=');T.vline(9,2,10,'=');T.vline(8,21,25,'=');T.vline(9,21,25,'=');
  t14Bd(T,'guild',18,2,7,5);t14Bd(T,'house',28,3,4,4);t14Bd(T,'house',33,3,3,4);t14Bd(T,'inn',18,11,6,5);t14Bd(T,'tavern',27,11,6,5);t14Bd(T,'smithy',18,20,6,5);t14Bd(T,'workshop',27,21,4,4);t14Bd(T,'chapel',32,20,5,5);
  T.put(5,14,'W');T.put(12,14,'q');t14Put(T,[[4,13],[13,13],[4,19],[13,19],[10,17],[6,17]],'v');t14Put(T,[[15,8],[15,18]],'a');t14Put(T,[[2,2],[13,2],[2,24],[13,24]],'P');return T;};
// an amphitheatre bowl: a ring wall of stone steps round a sunken plaza of candles and standing stones
TA14.bowl=(R,v)=>{const T=t14T(38,28,14,'void'),W=38,H=28;t14Frame(T,'#',0,1);for(let y=0;y<H;y++)for(let x=0;x<W;x++){const d=((x-18.5)/10)**2+((y-13.5)/7)**2;if(d>.82&&d<=1.1)T.put(x,y,'Z');else if(d<=.82)T.put(x,y,':');}
  T.rect(0,14,W,1,'=');[[9,14],[10,14],[27,14],[28,14],[18,6],[19,6],[18,21],[19,21]].forEach(([x,y])=>T.put(x,y,'s'));T.rect(9,13,2,3,'=');T.rect(27,13,2,3,'=');T.vline(18,5,6,'=');T.vline(19,5,6,'=');T.vline(18,21,24,'=');T.vline(19,21,24,'=');T.hline(3,34,24,'=');
  t14Bd(T,'inn',4,5,6,5);t14Bd(T,'tavern',13,0+2,6,3);t14Bd(T,'guild',24,3,7,5);t14Bd(T,'smithy',3,16,6,5);t14Bd(T,'workshop',29,17,4,4);t14Bd(T,'house',9,21,4,4);t14Bd(T,'house',24,21,4,4);t14Bd(T,'house',31,9,3,4);
  T.put(16,12,'W');T.put(21,12,'q');t14Put(T,[[18,13],[19,13],[18,15],[19,15]],'v');t14Put(T,[[14,10],[23,10],[14,18],[23,18]],'N');return T;};
// floating islands: a hub island on the road, five more round it, every island with its own roofs, joined by rope bridges
TA14.islands=(R,v)=>{const T=t14T(40,30,15,'heights'),W=40,H=30;T.rect(0,0,W,H,'~');
  [[5,15,6,4],[20,15,7,4],[35,15,6,4],[10,5,7,3],[29,5,7,3],[10,25,7,3],[29,25,7,3]].forEach(([cx,cy,rx,ry])=>t14Ell(T,cx,cy,rx,ry,'.'));
  T.hline(0,W-1,15,'B');T.hline(0,10,15,'=');T.hline(14,26,15,'=');T.hline(30,W-1,15,'=');T.vline(10,8,11,'B');T.vline(29,8,11,'B');T.vline(10,19,22,'B');T.vline(29,19,22,'B');T.vline(10,12,14,'=');T.vline(29,12,14,'=');T.vline(10,16,18,'=');T.vline(29,16,18,'=');
  t14Bd(T,'inn',7,3,6,4);t14Bd(T,'tavern',26,3,6,4);t14Bd(T,'smithy',7,23,6,4);t14Bd(T,'workshop',26,23,5,4);t14Bd(T,'guild',16,10,7,4);t14Bd(T,'house',16,18,4,3);t14Bd(T,'house',32,10,4,4);t14Bd(T,'chapel',2,10,5,4);
  T.put(22,16,'W');T.put(24,16,'q');t14Put(T,[[14,14],[26,14],[3,13],[37,17]],'u');return T;};
// a meandering road: the way winds in three waves, houses leaning out along it, groves of cane between the bends
TA14.meander=(R,v)=>{const T=t14T(40,30,15,'meadow'),W=40,H=30;t14Frame(T,'T',0,2);const yy=x=>15+Math.round(5*Math.sin(x*Math.PI/13));let py=15;
  for(let x=0;x<W;x++){const y=yy(x);T.put(x,y,'=');const s=Math.sign(y-py);for(let k=py;k!==y;k+=s)T.put(x,k,'=');py=y;}
  const up=(k,x,w,h)=>{let m=99;for(let i=0;i<w;i++)m=Math.min(m,yy(x+i));return t14Bd(T,k,x,m-h,w,h);};
  up('inn',5,6,5);up('tavern',16,6,5);up('guild',29,7,6);up('smithy',23,5,4);up('workshop',12,4,4);
  t14Bd(T,'house',4,21,4,4);t14Bd(T,'house',14,19,4,4);t14Bd(T,'chapel',25,22,6,4);t14Bd(T,'house',34,22,3,4);
  T.hline(4,35,3,'=');T.hline(4,35,26,'=');T.put(12,yy(12)+2,'W');T.put(22,yy(22)+2,'q');t14Put(T,[[8,4],[9,5],[10,4],[24,26],[25,27],[26,26],[34,6],[35,7],[5,26],[6,27],[16,26],[17,27]],'T');return T;};
// fenced farmsteads: every building in its own paddock with a gate to the road, a stone circle with the board and waystone south of the road
TA14.farmstead=(R,v)=>{const T=t14T(40,28,14,'meadow'),W=40,H=28;t14Frame(T,'T',0,1);const pad=(x,y,w,h,gx)=>{for(let i=0;i<w;i++){T.put(x+i,y,'F');T.put(x+i,y+h-1,'F');}for(let j=0;j<h;j++){T.put(x,y+j,'F');T.put(x+w-1,y+j,'F');}T.put(gx,y+h-1,'.');};
  pad(2,2,12,10,7);pad(16,2,12,10,21);pad(30,2,9,10,34);pad(2,16,12,10,7);pad(30,16,9,10,34);
  t14Bd(T,'inn',4,4,6,5);t14Bd(T,'tavern',18,4,6,5);t14Bd(T,'guild',31,3,7,6);t14Bd(T,'smithy',4,18,6,5);t14Bd(T,'chapel',31,19,6,5);t14Bd(T,'house',25,4,3,4);t14Bd(T,'workshop',17,19,4,4);t14Bd(T,'house',23,19,4,4);
  t14Put(T,[[17,16],[21,16],[16,20],[24,24],[18,24],[22,17],[14,22],[26,21]],'N');T.put(19,17,'W');T.put(21,17,'q');t14Put(T,[[6,6],[7,7],[34,19],[33,21],[5,21],[10,23]],'y');return T;};
// a churchyard close: the chapel and its graves behind a fence at the west, a lane north from the road with the shops, row houses to the south
TA14.close=(R,v)=>{const T=t14T(40,28,14,'meadow'),W=40,H=28;t14Frame(T,'T',0,1);T.vline(24,2,13,'=');T.vline(25,2,13,'=');T.hline(3,38,21,'=');[9,20,30].forEach(x=>T.vline(x,15,21,'='));
  for(let x=3;x<=19;x++){T.put(x,3,'F');T.put(x,12,'F');}for(let y=3;y<=12;y++){T.put(3,y,'F');T.put(19,y,'F');}T.put(11,12,'.');T.put(12,12,'.');T.rect(11,13,2,1,'=');
  t14Bd(T,'chapel',7,4,8,5);for(let i=0;i<4;i++){T.put(5+i*3,10,'g');T.put(6+i*3,11,'g');T.put(17,5+i*2,'g');}t14Put(T,[[5,5],[17,9],[14,10]],'T');
  t14Bd(T,'tavern',27,3,6,5);t14Bd(T,'guild',27,9,7,4);t14Bd(T,'inn',20,3,3,0+5);t14Bd(T,'smithy',4,16,6,5);t14Bd(T,'workshop',12,16,4,4);t14Bd(T,'house',22,16,4,4);t14Bd(T,'house',27,16,4,4);t14Bd(T,'house',33,16,4,4);
  T.put(22,12,'W');T.put(29,14,'q');return T;};
// ---------- fixing up a hand placed town ----------
function t14Make(arch,R,v){const T=TA14[arch](R,v),W=T.W;
  if(v&1)t14Flip(T);
  if(T.get(W-3,T.road+1)==='~')T.put(W-3,T.road+1,'.');T.put(W-3,T.road+1,'S');
  t14Link(T,arch==='lake'||arch==='islands'||arch==='canal'||arch==='harbour');
  t14Deco(T,R,{crates:arch==='ruin'?0:1,lamp:T.th==='cave'||T.th==='void'?'v':'L'});
  const t=townFinish(T,T.th,R,T.road);t.arch=arch;return t;}
T14.make=t14Make;
// ---------- assignment: layout and family per realm, read from REALMS / ZONES at run time ----------
// [layout, mirrored, family]. An unknown key (a realm added later) is guessed from its theme, ground motif and mood by t14Guess.
const T14_TAB={thistle:['green',0,'timber'],orchard:['street',0,'cider'],strand:['harbour',0,'coast'],mire:['lake',0,'mud'],deeps:['ring',0,'obsidian'],grotto:['cave',0,'shroom'],
  tundra:['keep',0,'ice'],glacier:['terrace',0,'chalet'],peaks:['ledges',0,'cloud'],mesa:['cross',0,'mesa'],lakes:['canal',0,'lake'],mines:['fork',0,'iron'],
  ashglass:['camp',1,'salt'],moors:['farmstead',0,'stone'],bamboo:['meander',0,'cane'],bone:['close',0,'bone'],
  ashen:['camp',0,'cinder'],drowned:['ruin',0,'drift'],starless:['bowl',0,'crystal'],shattered:['islands',0,'shard'],
  base0:['ring',1,'timber'],base1:['harbour',1,'coast'],base2:['cave',1,'stone'],base3:['keep',1,'stone'],base4:['ledges',1,'cloud'],base5:['camp',0,'crystal']};
const T14_CAND={meadow:['green','street','cross','canal','close','farmstead','meander','ring'],coast:['harbour','lake','canal','ruin','street'],cave:['cave','fork','ring','terrace','keep'],
  snow:['keep','terrace','street','ring','cross'],heights:['ledges','islands','cross','terrace','meander','camp'],void:['camp','bowl','ruin','islands','ring']};
const T14_MOOD={ember:'obsidian',ash:'cinder',frost:{snow:'ice',heights:'salt'},bolt:'cloud',feather:'cloud',gear:'iron',eclipse:'crystal',spore:{coast:'mud',cave:'shroom'},pearl:{coast:'drift',meadow:'lake'},comb:{heights:'mesa',meadow:'cider'},tide:'coast',thorn:'timber'};
const T14_THEMEFAM={meadow:'timber',coast:'coast',cave:'stone',snow:'ice',heights:'cloud',void:'crystal'};
function t14Key(Z){return Z.key||('base'+ZONES.indexOf(Z));}
function t14Guess(Z,cnt){const th=Z.theme0||Z.theme,L=Z.lean||{};let fam=T14_THEMEFAM[th]||'timber';const md=T14_MOOD[L.motif];if(md)fam=typeof md==='string'?md:(md[th]||fam);
  if(Z.mat==='shell'&&th==='coast'&&!md)fam='coast';const cand=T14_CAND[th]||T14_CAND.meadow;let best=cand[0];cand.forEach(c=>{if((cnt[c]||0)<(cnt[best]||0))best=c;});
  return [best,(cnt[best]||0)%2,fam];}
function t14Init(){if(T14.n===ZONES.length)return;T14.n=ZONES.length;T14.tab={};const cnt={};
  ZONES.forEach(Z=>{const r=T14_TAB[t14Key(Z)];if(r){T14.tab[t14Key(Z)]={arch:r[0],v:r[1],fam:r[2]};cnt[r[0]]=(cnt[r[0]]||0)+1;}});
  ZONES.forEach(Z=>{const k=t14Key(Z);if(T14.tab[k])return;const r=t14Guess(Z,cnt);T14.tab[k]={arch:r[0],v:r[1],fam:r[2],guessed:1};cnt[r[0]]=(cnt[r[0]]||0)+1;});}
function t14Assign(Z){t14Init();return T14.tab[t14Key(Z)];}
T14.assign=t14Assign;
// journeys started from now on carry t14 (like look9's tv): a journey in progress keeps the towns it was drawn with, so a saved hero is never inside a new house
HOOK.xform('newRun','towns14','new journeys get the towns of v0.20.6 (r.t14)',function(r){try{r.t14=1;}catch(e){}return r;});
const t14On=()=>{try{return !!(G&&(G.daily||(G.run&&G.run.t14)));}catch(e){return false;}};
HOOK.wrap('townGen','towns14','a layout and a building family for every realm (checked; the old theme layout is the fallback)',function(next,Z,s,R){
  if(T14.off||!t14On())return next(Z,s,R);const a=t14Assign(Z);
  for(let k=0;k<3;k++){try{const t=t14Make(a.arch,k?mulberry(hashS(a.arch+':'+s+':'+k)):R,a.v);if(!t14Check(t).length){t.sty=a.fam;T14.made++;return t;}}catch(e){}}
  T14.fallback++;return next(Z,s,R);});
// ---------- styles: the painters ----------
// A family = a wall texture, a roof shape and pattern, a palette, window / door / chimney kinds and a few extras, with an HD-2D body (hd: 'roof' a gabled
// box whose pitch is rp, 'keep' a flat topped box, 'card' a cone). The sprite follows the bands the HD-2D renderer cuts (hd2d.js hdBakeBuildings): a roofed
// body has its roof in rows -6..h/2 and its wall below; a keep its parapet in rows -11..-2 and its door and windows in the lowest 24 rows; a cone fills
// the triangle from its apex (-10) to the full width at the foot.
const TF14=T14.fam,TST14={inn:1,tavern:1,smithy:1,workshop:1,guild:1,chapel:1,house:1};
const TWL14={};
// stone like courses: o.bw x o.bh blocks, offset on alternate rows, colours o.c, mortar o.m
TWL14.blocks=(P,o)=>{const {f,w,h,wy,R}=P;f(o.m,0,wy,w,h-wy);let i=0;for(let r=wy;r<h-3;r+=o.bh,i++){const off=i%2?Math.floor(o.bw/2):0;for(let x=-off;x<w;x+=o.bw){const xx=Math.max(0,x),ww=Math.min(x+o.bw-1,w)-xx;if(ww<=0)continue;const c=o.c[Math.floor(R()*o.c.length)];
    f(c,xx,r,ww,o.bh-1);f(tint(c,.2),xx,r,ww,1);if(o.sp&&R()<.2)f(o.sp,xx+1+Math.floor(R()*Math.max(1,ww-2)),r+1,1,1);}}f(tint(o.c[0],.15),0,wy,1,h-wy);f(shade(o.c[0],.75),w-1,wy,1,h-wy);};
TWL14.plank=(P,o)=>{const {f,w,h,wy,R}=P;f(o.m,0,wy,w,h-wy);if(o.v){for(let x=0;x<w;x+=o.pw||4){const c=o.c[Math.floor(R()*o.c.length)];f(c,x,wy,(o.pw||4)-1,h-wy);f(tint(c,.15),x,wy,1,h-wy);if(R()<.4)f(shade(c,.8),x+1,wy+3+Math.floor(R()*(h-wy-8)),1,3);}}
  else for(let r=wy,i=0;r<h-3;r+=o.pw||4,i++){const c=o.c[Math.floor(R()*o.c.length)];f(c,0,r,w,(o.pw||4)-1);f(tint(c,.15),0,r,w,1);if(o.knot&&R()<.5)f(o.m,2+Math.floor(R()*(w-5)),r+1,2,1);if(i%2)f(shade(c,.85),Math.floor(R()*w*.8),r+1,3,1);}
  if(o.band)for(let x=0;x<w;x+=o.band[0])f(o.band[1],x,wy,1,h-wy);f(shade(o.c[0],.7),w-1,wy,1,h-wy);};
TWL14.half=(P,o)=>{const {f,w,h,wy}=P;f(o.c[0],0,wy,w,h-wy);const be=o.m;f(be,0,wy,w,2);f(be,0,wy+Math.floor((h-wy)/2)-1,w,2);for(let i=0;i<w;i+=12){f(be,i,wy,2,h-wy);if(i+12<=w)for(let s=0;s<10;s++){f(be,i+2+s,wy+2+Math.floor(s*.8),1,1);f(be,i+11-s,wy+2+Math.floor(s*.8),1,1);}}f(be,w-2,wy,2,h-wy);};
TWL14.plaster=(P,o)=>{const {f,w,h,wy,R}=P;f(o.c[0],0,wy,w,h-wy);for(let i=0;i<7;i++)f(o.c[1]||shade(o.c[0],.94),Math.floor(R()*(w-4)),wy+3+Math.floor(R()*(h-wy-8)),3,1);f(o.m,0,wy,2,h-wy);f(o.m,w-2,wy,2,h-wy);if(o.band)f(o.band,0,wy,w,2);};
TWL14.bark=(P,o)=>{const {f,w,h,wy,R}=P;for(let x=0;x<w;x++){const t=Math.abs((x/w)-.5)*2,c=mix(o.c[0],o.c[1],Math.min(1,t*1.1));f(c,x,wy,1,h-wy);}for(let i=0;i<w/5;i++)f(o.m,2+Math.floor(R()*(w-4)),wy+2+Math.floor(R()*(h-wy-6)),1,2+Math.floor(R()*3));for(let r=wy+4;r<h-4;r+=7)f(shade(o.c[0],.8),Math.floor(w*.15),r,Math.floor(w*.7),1);};
TWL14.facet=(P,o)=>{const {f,w,h,wy,R}=P;f(o.c[0],0,wy,w,h-wy);for(let i=0;i<w+h;i+=7){for(let j=0;j<h-wy;j++){const x=i-j;if(x>=0&&x<w)f(o.c[1],x,wy+j,1,1);}}for(let i=0;i<w;i+=11)f(o.c[2],i,wy,1,h-wy);
  if(o.g)for(let i=0;i<5;i++){const x=3+Math.floor(R()*(w-8)),y=wy+4+Math.floor(R()*(h-wy-12));f(o.g,x,y,1,3);f(o.g,x+1,y+3,1,2);f(tint(o.g,.4),x,y,1,1);}f(shade(o.c[0],.6),w-1,wy,1,h-wy);};
TWL14.plate=(P,o)=>{const {f,w,h,wy,R}=P;f(o.m,0,wy,w,h-wy);for(let x=0;x<w;x+=12)for(let y=wy;y<h-3;y+=9){const c=o.c[Math.floor(R()*o.c.length)],ww=Math.min(11,w-x);f(c,x,y,ww,8);f(tint(c,.2),x,y,ww,1);f(o.rv,x+1,y+1,1,1);f(o.rv,x+ww-2,y+1,1,1);f(o.rv,x+1,y+6,1,1);f(o.rv,x+ww-2,y+6,1,1);if(o.rust&&R()<.25)f(o.rust,x+3+Math.floor(R()*4),y+2,2,4);}};
TWL14.ribs=(P,o)=>{const {f,w,h,wy}=P;f(o.c[0],0,wy,w,h-wy);for(let x=3;x<w-2;x+=8){f(o.m,x,wy+2,1,h-wy-4);f(o.c[1],x+1,wy+2,1,h-wy-4);f(o.m,x-2,wy+1,5,1);f(o.m,x-3,wy+2,1,2);f(o.m,x+3,wy+2,1,2);}f(shade(o.c[0],.78),0,h-6,w,2);};
// roofs. gable: a trapezoid of rows, o.pat the surface, o.over the overhang, o.flare lifts the corners
TWL14.dummy=0;
const TRF14={};
// the half width of the roof at row yy: bell (the old gable), tri (an A-frame), round (a barrel), hip (a broad flat top), gambrel (a barn)
function tr14Row(P,o,yy){const {w,roofH,rt}=P,ov=o.over==null?4:o.over,t=Math.max(0,Math.min(1,(yy-rt)/(roofH-rt))),full=w/2+ov,pr=o.prof||'bell';let hf;
  if(pr==='bell'){const inset=Math.max(0,Math.floor((roofH-yy)/4)-1);hf=full-inset;}
  else if(pr==='tri')hf=full*(.05+.95*t);else if(pr==='round')hf=full*Math.max(.3,Math.sqrt(Math.max(0,1-Math.pow(1-t,2.2))));else if(pr==='hip')hf=full*(.62+.38*t);
  else hf=full*(t<.4?.5+.5*t/.4*.8:.9+.1*(t-.4)/.6);hf=Math.round(hf);return [Math.round(w/2-hf),hf*2,0,ov];}
TRF14.gable=(P,o)=>{const {f,w,h,roofH,rt,R,ctx}=P,c=P.roof,ov=o.over==null?4:o.over,pat=o.pat;{const [rx,rw]=tr14Row(P,o,rt);f(OUTC,rx-1,rt-1,rw+2,1);f(OUTC,-ov-1,roofH-2,w+ov*2+2,3);}
  for(let yy=rt;yy<roofH;yy++){const [x0,ww,inset]=tr14Row(P,o,yy);let col=c;
    if(pat==='thatch')col=(yy+Math.floor(R()*2))%3===0?shade(o.t||'#c8a050',.8):(o.t||'#d4ae5a');else if(pat==='tile')col=(yy%4===3)?shade(c,.7):c;else if(pat==='slate')col=(yy%3===2)?shade(c,.65):c;
    else if(pat==='shingle')col=(yy%3===2)?shade(c,.72):c;else if(pat==='snow')col=yy<rt+Math.floor((roofH-rt)*(o.sn||.5))?'#f4faff':((yy%3===2)?shade(c,.7):c);else if(pat==='turf')col=yy<rt+3?o.g||'#5a8a4a':yy<rt+8?'#6a9a54':(yy%4===3?'#4a3a2a':'#5a4630');
    else if(pat==='reed')col=(yy%2)?c:shade(c,.88);else if(pat==='scale')col=c;else if(pat==='metal')col=(yy%2)?c:shade(c,.8);else if(pat==='plank')col=c;else if(pat==='char')col=yy%3===0?shade(c,.7):c;
    f(OUTC,x0-1,yy,ww+2,1);f(col,x0,yy,ww,1);
    if(pat==='tile'&&yy%4===1)for(let i=x0;i<x0+ww;i+=4)f(shade(c,.8),i,yy,1,2);if(pat==='slate'&&yy%3===0)for(let i=x0+(yy%2)*3;i<x0+ww;i+=6)f(shade(c,.7),i,yy,1,2);
    if(pat==='thatch'&&R()<.5)f(o.t2||'#f0d070',x0+Math.floor(R()*ww),yy,3,1);if(pat==='shingle'||pat==='scale'){const sw=pat==='scale'?4:5;for(let i=x0+((yy>>1)%2)*Math.floor(sw/2);i<x0+ww;i+=sw){f(shade(c,.68),i,yy,1,1);if(pat==='scale'&&yy%2===0)f(tint(c,.25),i+1,yy,1,1);}}
    if(pat==='plank'&&true)for(let i=x0;i<x0+ww;i+=5)f(shade(c,.75),i,yy,1,1);if(pat==='reed')for(let i=x0+(yy%3);i<x0+ww;i+=3)f(tint(c,.18),i,yy,1,1);if(pat==='char'&&R()<.3)f('#ff6a2a',x0+Math.floor(R()*ww),yy,1,1);if(pat==='turf'&&yy>=rt+8&&R()<.25)f('#7a6a50',x0+Math.floor(R()*ww),yy,1,1);}
  {const [rx,rw]=tr14Row(P,o,rt);f(o.ridge||shade(c,.55),rx,rt,rw,2);}f(o.eave||shade(c,.45),-ov,roofH-2,w+ov*2,2);
  if(o.sag){const cx=Math.floor(w/2);for(let i=0;i<6;i++)ctx.clearRect(P.x0+cx-9+i,P.y0+rt-1,18-i*2,6-i);f('#150b17',cx-9,rt+5,18,1);for(let i=0;i<5;i++){f(OUTC,cx-9+i,rt+5-i,1,1);f(OUTC,cx+8-i,rt+5-i,1,1);}}
  if(o.flare)for(const s of [-1,1]){const ex=s<0?-ov-1:w+ov;f(OUTC,ex-(s<0?1:0),roofH-6,2,6);f(c,ex-(s<0?0:0),roofH-5,1,4);f(c,ex+s,roofH-7,1,2);}
  if(pat==='snow'){for(let i=-ov+2;i<w+ov-2;i+=5)f('#dff4ff',i,roofH,1,2+(i%3));}
  if(o.ice)for(let i=-ov+3;i<w+ov-2;i+=4){const L=2+((i*7)&3);f('#e8faff',i,roofH,1,L);f('#8ad0f0',i,roofH+L-1,1,1);}
  f('rgba(10,6,24,.35)',0,roofH,w,3);};
// stepped gable parapets over a slate roof (stone): little crow steps at both ends, above the roof band
TRF14.stepped=(P,o)=>{TRF14.gable(P,o);const {f,w,roofH,rt}=P,sc=shade(P.F.w[0],.9);for(const e of [0,1]){const x=e?w-9:-1;for(let i=0;i<4;i++){const xx=e?x+i*2:x+8-i*2-2;f(OUTC,xx-1,rt-3-i*3,4,4);f(sc,xx,rt-2-i*3,2,3);f(tint(sc,.25),xx,rt-2-i*3,2,1);}}};
// two stacked tiers, the upper smaller (pagoda), the whole above the lower roof band rising into the HD card
TRF14.pagoda=(P,o)=>{const {f,w,roofH,rt,R}=P;TRF14.gable(P,Object.assign({},o,{flare:1}));const c=shade(P.roof,.92),u=[Math.floor(w*.22),Math.floor(w*.78)];
  f(OUTC,u[0]-1,rt-14,u[1]-u[0]+2,15);f(shade(P.F.w[0],.9),u[0],rt-8,u[1]-u[0],8);f(tint(P.F.w[0],.2),u[0],rt-8,1,8);for(let yy=rt-16;yy<rt-8;yy++){const k=rt-8-yy,ins=Math.max(0,3-Math.floor(k/2));f(OUTC,u[0]-3+ins-1,yy,u[1]-u[0]+6-ins*2+2,1);f(c,u[0]-3+ins,yy,u[1]-u[0]+6-ins*2,1);}
  f(tint(c,.25),u[0]-3,rt-9,u[1]-u[0]+6,1);f(OUTC,Math.floor(w/2)-1,rt-24,3,9);f('#e8c040',Math.floor(w/2),rt-23,1,8);f('#e8c040',Math.floor(w/2)-1,rt-18,3,1);};
// an upturned hull: the roof is a boat keel up, ribs along it
TRF14.hull=(P,o)=>{const {f,w,roofH,rt,R}=P,c=P.roof;f(OUTC,Math.floor(w*.3)-1,rt-1,Math.floor(w*.4)+2,1);for(let yy=rt;yy<roofH;yy++){const k=(yy-rt)/(roofH-rt),ins=Math.round(Math.pow(1-k,2.2)*(w*.34)),x0=-5+ins,ww=w+10-ins*2;f(OUTC,x0-1,yy,ww+2,1);f(yy%3===2?shade(c,.78):c,x0,yy,ww,1);if(yy%4===1)for(let i=x0+2;i<x0+ww;i+=7)f(shade(c,.62),i,yy,1,1);}
  f(shade(c,.5),Math.floor(w*.3),rt,Math.floor(w*.4),2);f(OUTC,-6,roofH-2,w+12,1);f(shade(c,.55),-5,roofH-2,w+10,2);f('rgba(10,6,24,.35)',0,roofH,w,3);for(let i=0;i<5;i++)f(R()<.5?'#e8e0c8':'#d8a070',-3+Math.floor(R()*(w+4)),roofH-5-Math.floor(R()*8),2,1);};
// a mushroom cap: a dome with a pale underside and spots
TRF14.dome=(P,o)=>{const {f,w,roofH,rt,R}=P,c=P.roof,hh=roofH-rt,rx=w/2+6;for(let yy=rt-1;yy<roofH;yy++){const k=(yy-rt)/hh,e=Math.sqrt(Math.max(0,1-Math.pow(1-k,2)));const half=Math.round(rx*(.35+.65*Math.min(1,e*1.2)));f(OUTC,w/2-half-1,yy,half*2+2,1);if(yy<rt)continue;const lit=k<.35;f(lit?tint(c,.12):yy>roofH-4?shade(c,.62):c,w/2-half,yy,half*2,1);}
  for(let i=0;i<7;i++){const sx=Math.floor(R()*(w-2)),sy=rt+3+Math.floor(R()*(hh-8));f(o.spot||'#f4ecd8',sx,sy,2+Math.floor(R()*2),2);}f(tint(c,.35),Math.floor(w*.25),rt+2,Math.floor(w*.2),2);f(shade(c,.7),0,roofH-3,w,1);f(o.gill||'#e8d8b8',-2,roofH-1,w+4,2);f('rgba(10,6,24,.35)',0,roofH+1,w,3);};
TRF14.shed=(P,o)=>{const {f,w,roofH,rt,R}=P,c=P.roof;for(let yy=rt;yy<roofH;yy++){const k=(yy-rt)/(roofH-rt),x0=-4+Math.round((1-k)*w*.38);f(OUTC,x0-1,yy,w+8-(x0+4)+2,1);f(yy%3===2?shade(c,.7):c,x0,yy,w+8-(x0+4),1);if(R()<.2)f(tint(c,.4),x0+Math.floor(R()*(w-x0)),yy,1,1);}
  f(tint(c,.3),w*.6,rt,w*.4+4,2);for(let i=0;i<4;i++){const x=Math.floor(R()*(w-8)),y=rt+3+Math.floor(R()*(roofH-rt-6));f('#ffffff',x,y,1,4);f('#ffffff',x+1,y+4,1,3);}f('rgba(10,6,24,.35)',0,roofH,w,3);};
// sawtooth: a row of teeth with glazed faces, and a flat tar edge under
TRF14.saw=(P,o)=>{const {f,w,roofH,rt,R}=P,c=P.roof;f(OUTC,-5,rt+2,w+10,roofH-rt+1);f(c,-4,rt+8,w+8,roofH-rt-8);f(shade(c,.7),-4,rt+8,w+8,1);for(let y=rt+10;y<roofH;y+=3)f(shade(c,.82),-4,y,w+8,1);
  const n=Math.max(2,Math.round(w/24)),tw=Math.floor((w+8)/n);for(let i=0;i<n;i++){const x=-4+i*tw;f(OUTC,x-1,rt-8,tw+2,17);for(let k=0;k<tw-3;k++){const hg=Math.round(14*(k/(tw-3)));f(tint(c,.12),x+k,rt+8-hg,1,hg);}f(OUTC,x+tw-4,rt-8,3,17);f('#a8d8e8',x+tw-6,rt-7,2,14);f('#e8faff',x+tw-6,rt-7,1,14);f(shade(c,.5),x+tw-4,rt-8,3,17);f(shade(c,.55),x,rt+7,tw,2);}f('rgba(10,6,24,.35)',0,roofH,w,3);};
// flat roof with a parapet band (keep boxes): o.pin spires on the corners, o.cren merlons
TRF14.flat=(P,o)=>{const {f,w,top,R}=P,c=P.F.w[0];f(tint(c,.22),0,top,w,3);f(shade(c,.7),0,top+3,w,1);
  if(o.cren)for(let i=0;i<w;i+=8){f(c,i,top-4,5,4);f(tint(c,.25),i,top-4,5,1);f(OUTC,i+5,top-4,3,3);}
  if(o.pin)for(const x of [0,w-4]){f(OUTC,x-1,top-15,6,16);f(P.roof,x,top-14,4,14);f(tint(P.roof,.3),x,top-14,1,14);f(shade(P.roof,.6),x+3,top-14,1,14);f(tint(P.roof,.4),x+1,top-17,2,3);}
  if(o.spire){const x=Math.floor(w/2)-2;f(OUTC,x-1,top-34,6,36);f(P.roof,x,top-33,4,34);f(tint(P.roof,.3),x,top-33,1,34);f(shade(P.roof,.6),x+3,top-33,1,34);f(tint(P.roof,.5),x+1,top-38,2,5);f(OUTC,x+1,top-42,2,5);f('#f0d040',x+1,top-41,2,3);}
  if(o.pot)for(const x of [Math.floor(w*.2),Math.floor(w*.62)]){f(OUTC,x-1,top-9,8,9);f('#b8643a',x,top-8,6,7);f('#d88a5a',x,top-8,2,7);f('#8a4a2a',x+4,top-8,2,7);f('#5a8a3a',x+1,top-11,4,3);}};
// a tall cone (crystal, pavilion, beehive): the triangle from the apex to the foot
TRF14.cone=(P,o)=>{const {f,w,h,top,R}=P,c=P.roof,cx=Math.floor(w/2),H=h-top,N=o.n||6;const tri=yy=>Math.round(3+((yy-top)/H)*(w/2+1));
  const half=yy=>{let hf=tri(yy);if(o.dome)hf=Math.max(hf,Math.round((w/2+3)*Math.sqrt(Math.max(0,1-Math.pow(1-(yy-top)/H,2)))));if(o.skirt&&yy>h-o.skirt)hf+=Math.round((yy-(h-o.skirt))/o.skirt*7)+2;return hf;};
  if(o.apex)for(let r=0;r<o.apex;r++){const ww=Math.max(1,3-Math.floor(r*3/o.apex));f(OUTC,cx-Math.floor(ww/2)-1,top-1-r,ww+2,1);}
  if(o.apex)for(let r=0;r<o.apex;r++){const ww=Math.max(1,3-Math.floor(r*3/o.apex));f(r%3?tint(c,.3):'#ffffff',cx-Math.floor(ww/2),top-1-r,ww,1);}
  if(o.shards)for(const s of [-1,1]){const bx=cx+s*(Math.floor(w/2)-2),hh=Math.round(H*.58),hw=Math.round(w*.2);for(let yy=0;yy<hh;yy++){const wd=Math.round(hw*(yy/hh))+1,y=h-hh+yy;f(OUTC,bx-wd-1,y,wd*2+2,1);}for(let yy=0;yy<hh;yy++){const wd=Math.round(hw*(yy/hh))+1,y=h-hh+yy;f(yy%5===0?tint(c,.35):s<0?tint(c,.15):shade(c,.78),bx-wd,y,wd*2,1);}}
  for(let yy=top;yy<h;yy++){const hf=half(yy);f(OUTC,cx-hf-1,yy,hf*2+2,1);}
  for(let yy=top+1;yy<h-1;yy++){const hf=half(yy),p=(yy-top)/H;for(let x=-hf;x<hf;x++){const u=x/hf,k=Math.floor((u+1)/2*N),ab=k%2===0;let col=o.stripe?(ab?c:o.stripe):(ab?c:shade(c,.9));if(o.facet){col=u<-.3?tint(c,.18):u<.25?c:shade(c,.7);if(((x+yy)>>2)%5===0)col=tint(col,.2);}else{if(u<-.6)col=tint(col,.2);else if(u>.5)col=shade(col,.72);}
      if(o.rows&&yy%o.rows===0)col=shade(col,.78);if(p>.9)col=shade(col,.85);f(col,cx+x,yy,1,1);}}
  if(o.skirt)for(let x=-half(h-1);x<half(h-1);x+=6){f(shade(c,.6),cx+x,h-3,4,1);f(OUTC,cx+x,h-2,4,1);}
  if(o.glow)for(let i=0;i<4;i++)f(o.glow,cx-6+Math.floor(R()*12),top+10+Math.floor(R()*(H-24)),1,3);
  f('rgba(0,0,0,.3)',cx-half(h-1)-2,h-1,half(h-1)*2+4,2);};
// chimneys (roof kinds): brick, stone, tall metal stack, a crooked pipe, a smoke hole is just smoke
const TCH14={};
TCH14.brick=(P,o)=>{const {f,w,rt}=P,x=Math.floor(w*.72),S=P.F.w;f(OUTC,x-1,rt-8,8,10);f(o.c||'#8a5a4a',x,rt-7,6,9);f(tint(o.c||'#8a5a4a',.2),x,rt-7,6,1);f(shade(o.c||'#8a5a4a',.7),x,rt-2,6,1);P.smoke(x+3,rt-8);};
TCH14.stack=(P,o)=>{const {f,w,rt}=P,x=Math.floor(w*.7);f(OUTC,x-1,rt-18,6,20);f('#52525e',x,rt-17,4,19);f('#7a7a88',x,rt-17,1,19);f('#2e2e36',x+3,rt-17,1,19);f('#8a8a9a',x-1,rt-18,6,2);f(OUTC,x-1,rt-18,6,1);f('#ff7a2a',x+1,rt-19,2,1);P.smoke(x+2,rt-20);};
TCH14.pipe=(P,o)=>{const {f,w,rt}=P,x=Math.floor(w*.6);f(OUTC,x-1,rt-12,5,14);f(o.c||'#3a2e2a',x,rt-11,3,13);f(o.c||'#3a2e2a',x+2,rt-14,3,4);f('#5a4a42',x,rt-11,1,13);P.smoke(x+3,rt-15);};
TCH14.none=()=>{};
// windows
const TWN14={};
TWN14.sq=(P,x,y,o)=>{const {f}=P,F=P.F;f(OUTC,x-1,y-1,10,11);f(F.wf,x,y,8,9);f(F.wg,x+1,y+1,6,7);f(tint(F.wg,.6),x+1,y+1,2,2);f(F.wf,x+4,y+1,1,7);f(F.wf,x+1,y+4,6,1);
  if(o&&o.shut){f(o.shut,x-3,y,2,9);f(o.shut,x+9,y,2,9);}if(o&&o.box){f('#6a4a2a',x-1,y+9,10,2);for(let i=0;i<4;i++)f(P.F.fl[(i+Math.floor(P.R()*4))%P.F.fl.length],x+i*2,y+8,2,1);}};
TWN14.arch=(P,x,y,o)=>{const {f}=P,F=P.F;f(OUTC,x-1,y-1,10,12);f(F.wf,x,y+2,8,9);f(F.wf,x+1,y,6,2);f(F.wg,x+1,y+3,6,7);f(F.wg,x+2,y+1,4,2);f(tint(F.wg,.6),x+2,y+3,2,2);f(F.wf,x+4,y+3,1,7);};
TWN14.round=(P,x,y,o)=>{const {f}=P,F=P.F;for(let j=0;j<9;j++){const hw=[2,3,4,4,4,4,4,3,2][j];f(OUTC,x+4-hw-1,y+j,hw*2+2,1);}for(let j=0;j<9;j++){const hw=[2,3,4,4,4,4,4,3,2][j]-1;f(F.wf,x+4-hw-1,y+j,1,1);f(F.wg,x+4-hw,y+j,hw*2,1);f(F.wf,x+4+hw,y+j,1,1);}f(tint(F.wg,.6),x+2,y+2,2,2);f(F.wf,x+4,y+1,1,7);f(F.wf,x+1,y+4,7,1);};
TWN14.slit=(P,x,y,o)=>{const {f}=P,F=P.F;f(OUTC,x+2,y-1,5,12);f(F.wg,x+3,y,3,10);f(tint(F.wg,.5),x+3,y,1,10);};
TWN14.lancet=(P,x,y,o)=>{const {f}=P,F=P.F;f(OUTC,x,y-1,8,13);f(F.wf,x+1,y+3,6,8);f(F.wf,x+2,y+1,4,2);f(F.wf,x+3,y,2,1);f(F.wg,x+2,y+4,4,6);f(F.wg,x+3,y+2,2,3);f(tint(F.wg,.6),x+3,y+4,1,4);};
TWN14.port=TWN14.round;
// doors: a leaf in the family colours F.dr
const TDR14={};
TDR14.plank=(P,x,y,dh)=>{const {f,F}=P,[a,b]=F.dr,hy=Math.round(dh*.4);f(OUTC,x+1,y-1,14,dh+1);f(F.base[0],x+2,y,12,dh);f(a,x+3,y+1,10,dh-1);f(b,x+4,y+3,8,dh-3);f(a,x+7,y+3,1,dh-3);f(b,x+5,y+1,6,2);f('#c8c8d0',x+5,y+hy,1,1);f('#c8c8d0',x+10,y+hy,1,1);f('#f0c050',x+10,y+hy+3,1,2);};
TDR14.arch=(P,x,y,dh)=>{const {f,F}=P,[a,b]=F.dr;f(OUTC,x+1,y-1,14,dh+1);f(F.base[0],x+2,y,12,dh);f(a,x+3,y+2,10,dh-2);f(a,x+4,y+1,8,1);f(b,x+4,y+3,8,dh-3);f(b,x+5,y+2,6,1);f(a,x+7,y+2,1,dh-2);f(F.base[1],x+2,y,12,1);f('#f0c050',x+10,y+Math.round(dh*.5),1,2);};
TDR14.round=(P,x,y,dh)=>{const {f,F}=P,[a,b]=F.dr,cx=x+8,r=Math.min(7,Math.floor(dh/2)),cy=y+dh-r;for(let j=-r;j<=0;j++){const hw=Math.round(Math.sqrt(Math.max(0,r*r-j*j)));f(OUTC,cx-hw-1,cy+j,hw*2+2,1);}f(OUTC,cx-r-1,cy,r*2+2,r+1);f(a,cx-r,cy,r*2,r);for(let j=-r+1;j<=0;j++){const hw=Math.round(Math.sqrt(Math.max(0,r*r-j*j)))-1;f(a,cx-hw,cy+j,hw*2,1);f(b,cx-hw+1,cy+j,Math.max(0,hw*2-2),1);}f(a,cx,cy-r+1,1,r*2);f('#f0c050',cx+2,cy,1,2);};
TDR14.hatch=(P,x,y,dh)=>{const {f,F}=P,[a,b]=F.dr;f(OUTC,x+2,y+1,12,dh-1);f(a,x+3,y+2,10,dh-2);f(b,x+4,y+3,8,dh-4);f(a,x+4,y+3,1,dh-4);f(a,x+11,y+3,1,dh-4);f(a,x+4,y+dh-5,8,1);for(let i=0;i<5;i++){f(a,x+4+i,y+3+i,1,1);f(a,x+11-i,y+3+i,1,1);}f('#c8c8d0',x+9,y+Math.round(dh*.5),1,1);};
TDR14.curtain=(P,x,y,dh)=>{const {f,F}=P,[a,b]=F.dr;f(OUTC,x+1,y-2,14,dh+2);f('#2a1a10',x+2,y,12,dh);f(a,x+2,y-1,12,3);for(let i=0;i<12;i+=3){f(i%6?b:a,x+2+i,y+2,3,dh-3);f(shade(b,.7),x+2+i,y+dh-3,3,1);}f(tint(a,.3),x+2,y-1,12,1);for(let i=0;i<4;i++)f(i%2?'#e8c040':'#fff0c0',x+3+i*3,y+3,1,1);};
TDR14.gate=(P,x,y,dh)=>{const {f,F}=P,[a,b]=F.dr;f(OUTC,x,y-2,16,dh+2);f(F.base[0],x+1,y-1,14,dh+1);f(a,x+2,y+1,12,dh-1);f(b,x+3,y+2,5,dh-2);f(b,x+8,y+2,5,dh-2);f(a,x+7,y+1,2,dh-1);f(F.base[2],x+2,y+4,12,1);f(F.base[2],x+2,y+dh-5,12,1);f('#9a9eaa',x+3,y+4,1,1);f('#9a9eaa',x+12,y+4,1,1);if(F.glowd)f(F.glowd,x+7,y+dh-2,2,1);};
// extras: small dressings drawn after the body (all inside the building's footprint or just above it)
const TXT14={};
TXT14.barrel=(P)=>{const {f,w,h,doorX}=P,x=doorX>w/2?4:w-14;f(OUTC,x-1,h-13,12,14);f('#8a5a2a',x,h-12,10,12);f('#b0804a',x,h-12,3,12);f('#5a3a1a',x,h-9,10,1);f('#5a3a1a',x,h-4,10,1);f('#9aa0aa',x,h-8,10,1);f('#d03a2a',x+6,h-14,3,3);f('#e05a3a',x+3,h-14,3,3);};
TXT14.pots=(P)=>{const {f,w,h,doorX}=P,x=doorX>w/2?3:w-12;for(const [dx,c] of [[0,'#d88a5a'],[6,'#c86a3a']]){f(OUTC,x+dx-1,h-9,6,9);f(c,x+dx,h-8,4,7);f(tint(c,.25),x+dx,h-8,1,7);f('#5aa84a',x+dx,h-11,4,3);f('#f06a8a',x+dx+1,h-12,2,1);}};
TXT14.net=(P)=>{const {f,w,h,wy}=P,x=Math.floor(w*.55);f('#4a3a2a',x,wy+3,12,1);for(let i=0;i<12;i+=2)for(let j=0;j<8;j+=2)f('#c8b890',x+i,wy+4+j,1,1);for(let i=1;i<12;i+=4)f('#e05a3a',x+i,wy+4+(i%2?10:8),2,2);};
TXT14.stilts=(P)=>{const {f,w,h}=P;for(const x of [2,Math.floor(w/2)-1,w-6]){f(OUTC,x-1,h-2,5,8);f('#4a3422',x,h-1,3,6);f('#6a4a32',x,h-1,1,6);}f('rgba(20,50,60,.5)',0,h+3,w,2);};
TXT14.lantern=(P)=>{const {f,w,h,wy}=P;for(const x of [Math.floor(w*.2),Math.floor(w*.5),w-10]){f('#3a2a1a',x+3,wy-1,1,4);f(OUTC,x,wy+3,7,9);f(P.F.lan||'#e8503a',x+1,wy+4,5,7);f(tint(P.F.lan||'#e8503a',.6),x+2,wy+5,2,4);f('#3a2a1a',x+1,wy+3,5,1);f('#f0c040',x+1,wy+11,5,1);}};
TXT14.awning=(P)=>{const {f,w,h,wy,doorX,acc,F}=P,a=F.r[0],b='#f4ecd8';const y=h-30;const aw=(x0,ww,dy)=>{f(OUTC,x0-1,dy-1,ww+2,8);for(let i=0;i<ww;i+=4){f((i/4)%2?b:a,x0+i,dy,Math.min(4,ww-i),6);}f(shade(a,.7),x0,dy+5,ww,1);for(let i=0;i<ww;i+=4)f((i/4)%2?shade(b,.8):shade(a,.78),x0+i,dy+6,Math.min(4,ww-i),2);};aw(doorX-4,24,h-27);if(w>=64)aw(4,w>=96?20:16,wy+8);};
TXT14.vigas=(P)=>{const {f,w}=P,top=P.top;for(let x=6;x<w-4;x+=9){f(OUTC,x-1,top+5,5,4);f('#6a4428',x,top+6,3,2);f('#8a5a38',x,top+6,3,1);}};
TXT14.roots=(P)=>{const {f,w,h,R}=P;for(const x of [-2,w-4]){f(OUTC,x-1,h-8,6,10);f('#8a6a48',x,h-7,4,8);f('#a8845a',x,h-7,1,8);}for(let i=0;i<w;i+=7)f('#8a6a48',i+R()*3|0,h-2,3,3);f('#7affd8',4,h-9,2,2);f('#7affd8',w-8,h-12,2,2);};
TXT14.glowcap=(P)=>{const {f,w,h}=P;for(const [x,c] of [[3,'#7affd8'],[w-8,'#c0a0ff']]){f(OUTC,x-1,h-7,6,6);f(c,x,h-6,4,3);f(tint(c,.5),x,h-6,4,1);f('#e8dcc0',x+1,h-3,2,3);}};
TXT14.ember=(P)=>{const {f,w,h,doorX}=P;f('rgba(255,120,40,.35)',doorX-2,h-4,20,4);f('#ff7a2a',doorX+1,h-2,2,1);f('#ffd04a',doorX+12,h-2,2,1);};
TXT14.ash=(P)=>{const {f,w,h,R}=P;for(let i=0;i<5;i++){const x=Math.floor(R()*(w-10));f('#5a5250',x,h-4,8+i%3*2,3);f('#7a726e',x+1,h-4,5,1);}f('#ff6a2a',3,h-3,1,1);};
TXT14.gear=(P)=>{const {f,w,h,wy}=P,x=w-14,y=wy+4;f(OUTC,x-1,y-1,12,12);f('#8a6a3a',x,y,10,10);f('#6a4a28',x+2,y+2,6,6);f('#2a2c34',x+4,y+4,2,2);for(const [a,b] of [[4,-2],[4,10],[-2,4],[10,4]])f('#8a6a3a',x+a,y+b,2,2);};
TXT14.pipes=(P)=>{const {f,w,h,wy}=P;f(OUTC,1,wy+2,3,h-wy-6);f('#7a7e8a',2,wy+2,1,h-wy-6);f('#4a4e5a',3,wy+2,1,h-wy-6);f(OUTC,1,wy+2,10,3);f('#7a7e8a',2,wy+3,9,1);f('#c8a040',5,wy+2,2,3);};
TXT14.pennant=(P)=>{const {f,w,top,roof}=P;for(const x of [Math.floor(w*.5)]){const y=top-34;f(OUTC,x-1,y-1,2,12);f('#c0c4e0',x,y,1,11);f(OUTC,x,y-1,9,6);f(P.roof,x+1,y,7,4);f(tint(P.roof,.4),x+1,y,7,1);}};
TXT14.skull=(P)=>{const {f,w,rt}=P,x=Math.floor(w/2)-5;f(OUTC,x-1,rt-12,12,12);f('#f4eed8',x,rt-11,10,8);f('#d8d0b8',x,rt-5,10,2);f('#2a1a10',x+2,rt-9,2,3);f('#2a1a10',x+6,rt-9,2,3);f('#2a1a10',x+4,rt-6,2,1);f('#e8e0c8',x-3,rt-9,3,1);f('#e8e0c8',x+10,rt-9,3,1);f('#e8e0c8',x-3,rt-10,1,2);f('#e8e0c8',x+12,rt-10,1,2);};
TXT14.antlers=TXT14.skull;
TXT14.shells=(P)=>{const {f,w,h,R}=P;for(let i=0;i<5;i++){const x=2+Math.floor(R()*(w-8)),y=h-7-Math.floor(R()*5);f('#f0e0d0',x,y,3,2);f('#e8a0a0',x,y,1,1);f('#c8b8a0',x+1,y+1,2,1);}};
TXT14.vines=(P)=>{const {f,w,h,wy,R}=P;for(let i=0;i<3;i++){const x=i===0?1:w-3-i*2;let y=wy+2;for(let k=0;k<7+i*3;k++){f('#3a6a30',x+((k>>1)%2),y+k,1,1);if(k%3===1)f('#5a9a44',x+1+((k>>1)%2),y+k,2,1);}}};
TXT14.shield=(P)=>{const {f,w,wy}=P,x=w-18,y=wy+3;f(OUTC,x-1,y-1,10,13);f('#c8c8d0',x,y,8,10);f('#3a4a6a',x+1,y+1,3,5);f('#a82a2a',x+4,y+1,3,5);f('#a82a2a',x+1,y+6,3,3);f('#3a4a6a',x+4,y+6,3,3);};
TXT14.bargeboard=(P)=>{const {f,w,roofH,rt}=P;for(const e of [0,1]){const x=e?w+3:-5;for(let i=0;i<8;i++){f(OUTC,x+(e?-i:i)-1,rt+4+i*3,3,4);f('#c04a3a',x+(e?-i:i),rt+5+i*3,1,3);f('#f4ecd8',x+(e?-i-1:i+1),rt+5+i*3,1,1);}}};
TXT14.woodpile=(P)=>{const {f,w,h,doorX}=P,x=doorX>w/2?3:w-14;f(OUTC,x-1,h-10,12,11);for(let r=0;r<3;r++)for(let c=0;c<3;c++){f('#8a5a2a',x+c*4,h-9+r*3,3,2);f('#d8b070',x+c*4+1,h-9+r*3,1,2);}};
TXT14.snowdrift=(P)=>{const {f,w,h}=P;f('#ffffff',-2,h-4,12,4);f('#dff0ff',0,h-3,10,2);f('#ffffff',w-10,h-5,12,5);f('#dff0ff',w-9,h-3,10,3);};
TXT14.apples=(P)=>{const {f,w,h,doorX}=P,x=doorX>w/2?3:w-13;f(OUTC,x-1,h-8,11,9);f('#8a5a2a',x,h-7,9,7);f('#b0804a',x,h-7,9,1);for(let i=0;i<3;i++){f('#d03a2a',x+1+i*3,h-9,2,2);f('#e8c040',x+2+i*3,h-8,1,1);}};
TXT14.cracks=(P)=>{const {f,w,h,wy}=P;for(const x of [Math.floor(w*.3),Math.floor(w*.7)]){let cx=x;for(let y=wy;y<h-4;y+=2){cx+=(y%4?1:-1);f('#6a60a0',cx,y,1,2);}}f('#ffffff',Math.floor(w*.3),wy,1,1);};
// crowns: shapes standing above the ridge (they stand up in HD-2D as the card above the roof); wings: an annex at a side. Both are part of a family's silhouette.
const TCR14={};
TCR14.dormer=(P)=>{const {f,w,rt,F}=P,x=Math.floor(w/2)-10,c=F.w[0];f(OUTC,x-1,rt-9,22,20);f(c,x,rt-8,20,18);f(tint(c,.2),x,rt-8,2,18);f(shade(c,.78),x+18,rt-8,2,18);TWN14[F.win](P,x+6,rt-5,F.winO);for(let i=0;i<11;i++){f(OUTC,x-3+i-1,rt-9-i,26-i*2+2,1);f(P.roof,x-3+i,rt-9-i,26-i*2,1);}f(shade(P.roof,.6),x+8,rt-20,4,1);};
TCR14.cupola=(P)=>{const {f,w,rt,F}=P,x=Math.floor(w/2)-7,c=F.w[0];f(OUTC,x-1,rt-11,16,13);f(c,x,rt-10,14,12);f(F.wg,x+3,rt-8,3,6);f(F.wg,x+8,rt-8,3,6);for(let i=0;i<8;i++){f(OUTC,x-3+i-1,rt-11-i,20-i*2+2,1);f(P.roof,x-3+i,rt-11-i,20-i*2,1);}f(OUTC,x+6,rt-24,2,6);f('#c8c8d0',x+7,rt-23,1,5);};
TCR14.hoist=(P)=>{const {f,w,rt}=P;f(OUTC,w*.5-2,rt-9,w*.5+14,5);f('#6a4a2a',w*.5-1,rt-8,w*.5+12,3);f('#8a6a3a',w*.5-1,rt-8,w*.5+12,1);f(OUTC,w+9,rt-8,3,16);f('#c8c8d0',w+10,rt-7,1,14);f('#8a6a3a',w+8,rt+7,5,3);};
TCR14.lookout=(P)=>{const {f,w,rt,F}=P,x=Math.floor(w*.16),c=F.w[0];f(OUTC,x-1,rt-21,15,26);f(c,x,rt-20,13,24);f(tint(c,.2),x,rt-20,2,24);f(F.wf,x+4,rt-16,5,7);f(F.wg,x+5,rt-15,3,5);f(F.wf,x-2,rt-22,17,2);for(let i=0;i<9;i++){f(OUTC,x-3+i-1,rt-23-i,19-i*2+2,1);f(P.roof,x-3+i,rt-23-i,19-i*2,1);}f(OUTC,x+6,rt-36,2,6);f('#e8f4ff',x+7,rt-35,1,5);};
TCR14.horns=(P)=>{const {f,w,rt}=P,c=shade(P.roof,.7);for(const s of [0,1]){for(let i=0;i<12;i++){const x=s?w+3-Math.round(i*.7):-4+Math.round(i*.7),y=rt+2-Math.round(i*i/9);f(OUTC,x-2,y-2,5,5);}for(let i=0;i<12;i++){const x=s?w+3-Math.round(i*.7):-4+Math.round(i*.7),y=rt+2-Math.round(i*i/9);f(i%2?c:tint(P.roof,.2),x-1,y-1,3,3);}}};
TCR14.turret=(P)=>{const {f,w,h,rt,F}=P,x=-8,c=F.w[0],tw=17,top=rt-12;f(OUTC,x-1,top,tw+2,h-top);f(c,x,top+1,tw,h-top-1);f(tint(c,.25),x,top+1,3,h-top-1);f(shade(c,.72),x+tw-3,top+1,3,h-top-1);for(let r=top+6;r<h-4;r+=5)f(shade(c,.85),x,r,tw,1);f(F.wf,x+6,top+14,5,9);f(F.wg,x+7,top+15,3,7);
  for(let i=0;i<14;i++){f(OUTC,x-3+Math.floor(i*.2)-1,top-i,tw+6-Math.floor(i*.2)*2+2-i*0,1);f(P.roof,x-2+Math.floor(i*.4),top-i,Math.max(1,tw+4-Math.floor(i*.4)*2-i*.2|0),1);}f(OUTC,x+7,top-24,2,10);f('#a82a2a',x+9,top-23,5,3);};
TCR14.antlers=(P)=>{const {f,w,rt}=P,cx=Math.floor(w/2);for(const s of [-1,1]){for(let i=0;i<20;i++){const x=cx+s*(2+Math.round(i*.6)),y=rt-2-i;f(OUTC,x-2,y-1,4,3);}for(let i=0;i<20;i++){const x=cx+s*(2+Math.round(i*.6)),y=rt-2-i;f('#e8e0c8',x-1,y,2,2);if(i%6===3)for(let k=0;k<5;k++)f('#e8e0c8',x+s*k,y-k,2,2);}}f('#f4eed8',cx-4,rt-9,8,6);f('#2a1a10',cx-3,rt-8,2,2);f('#2a1a10',cx+1,rt-8,2,2);};
TCR14.mast=(P)=>{const {f,w,rt}=P,x=Math.floor(w*.32);f(OUTC,x-2,rt-34,5,38);f('#6a5a4a',x-1,rt-33,3,36);f(OUTC,x-8,rt-26,17,4);f('#8a7a64',x-7,rt-25,15,2);f(OUTC,x+2,rt-34,12,7);f('#c85a3a',x+3,rt-33,10,5);f(tint('#c85a3a',.4),x+3,rt-33,10,1);f(OUTC,x-5,rt-12,2,4);f('#e8e0c8',x-5,rt-11,2,2);};
TCR14.steep=(P)=>{const {f,w,rt}=P;f(OUTC,Math.floor(w/2)-1,rt-30,3,32);f(P.F.dr[1],Math.floor(w/2),rt-29,1,30);f(OUTC,Math.floor(w/2)-5,rt-30,11,4);f(P.roof,Math.floor(w/2)-4,rt-29,9,2);};
TCR14.stacks=(P)=>{const {f,w,rt}=P;for(const x of [Math.floor(w*.18),Math.floor(w*.4)]){f(OUTC,x-1,rt-26,7,28);f('#52525e',x,rt-25,5,27);f('#7a7a88',x,rt-25,1,27);f('#2e2e36',x+4,rt-25,1,27);f('#8a8a9a',x-1,rt-26,7,2);P.smoke(x+3,rt-28);}};
TCR14.shards=(P)=>{const {f,w,top}=P;for(let x=2;x<w-6;x+=8){const hh=8+((x*7)%9);for(let r=0;r<hh;r++){const ww=Math.max(1,5-Math.floor(r*5/hh));f(OUTC,x+Math.floor((5-ww)/2)-1,top-1-r,ww+2,1);}for(let r=0;r<hh;r++){const ww=Math.max(1,5-Math.floor(r*5/hh));f(r%3?P.roof:tint(P.roof,.4),x+Math.floor((5-ww)/2),top-1-r,ww,1);}}};
TCR14.upper=(P)=>{const {f,w,top,F}=P,c=F.w[0],x=6,ww=Math.floor(w*.42),y=top-22;f(OUTC,x-1,y-1,ww+2,24);f(c,x,y,ww,23);f(tint(c,.2),x,y,2,23);f(shade(c,.7),x+ww-2,y,2,23);f(F.wf,x+ww/2-3|0,y+7,6,9);f(F.wg,x+ww/2-2|0,y+8,4,7);f(tint(c,.25),x,y,ww,3);const tx=w-22;f(OUTC,tx-1,top-17,19,17);f('#7a8a8a',tx,top-16,17,15);f('#a8b8b8',tx,top-16,3,15);f('#5a6a6a',tx+14,top-16,3,15);f('#4a5a5a',tx,top-17,17,2);};
TCR14.pinnacles=(P)=>{const {f,w,top}=P;for(const x of [Math.floor(w*.3),Math.floor(w*.55),Math.floor(w*.78)]){f(OUTC,x-1,top-13,5,14);f(P.roof,x,top-12,3,12);f(tint(P.roof,.4),x,top-12,1,12);f(tint(P.roof,.5),x,top-15,3,3);}};
const TWG14={};
TWG14.lean=(P,side)=>{const {f,w,h,F}=P,ww=9,x=side<0?-ww:w,c=F.w[0];f(OUTC,x-(side<0?1:0),h-27,ww+1,28);f(c,x,h-26,ww,26);f(side<0?tint(c,.15):shade(c,.78),x,h-26,2,26);for(let i=0;i<ww+2;i++){const y=h-34+Math.floor(i*(side<0?.8:-.8)+(side<0?0:ww*.8));f(OUTC,x-1+i,y-1,1,5);f(P.roof,x-1+i,y,1,4);}f(F.dr[0],x+2,h-12,5,12);};
TWG14.porch=(P,side)=>{const {f,w,h,F}=P,ww=10,x=side<0?-ww:w;f(OUTC,x-1,h-21,ww+2,22);f(F.base[1],x,h-20,ww,20);f(F.base[0],x+1,h-19,ww-2,19);f(F.base[2],x,h-20,ww,2);f(OUTC,x+2,h-13,ww-4,13);f('#2a2a34',x+3,h-12,ww-6,12);};
TWG14.tower=(P,side)=>{const {f,w,h,F}=P,ww=10,x=side<0?-ww:w,c=F.w[0];f(OUTC,x-1,h-39,ww+2,40);f(c,x,h-38,ww,38);f(tint(c,.25),x,h-38,2,38);f(shade(c,.72),x+ww-2,h-38,2,38);for(let i=0;i<ww+2;i++){const y=h-38-Math.min(i,ww-i)*1;f(OUTC,x-1+i,y-1,1,3);f(P.roof,x-1+i,y,1,2);}};
// the family painter. P carries the geometry; F the look.
function tk14P(ctx,m,b,F){const x0=b.x*TS,y0=b.y*TS,w=b.w*TS,h=b.h*TS,R=mulberry(b.x*97+b.y*13+realmOf(m.s)),k=b.k,roofH=Math.floor(h*.5),ri={inn:0,tavern:1,smithy:2,guild:3,chapel:3,workshop:4};
  const P={ctx,m,b,F,k,R,w,h,x0,y0,doorX:(b.door[0]-b.x)*TS,roofH,rt:-6,top:-10,wy:F.hd==='roof'?roofH-1:-10};
  P.f=(c,x,y,ww,hh)=>{ctx.fillStyle=c;ctx.fillRect(x0+x,y0+y,ww,hh);};
  P.roof=F.r[(ri[k]!=null?ri[k]:Math.floor(R()*F.r.length))%F.r.length];P.acc=(typeof SVC_LOOK!=='undefined'&&SVC_LOOK[k])?SVC_LOOK[k].roof:'#a82a2a';
  P.smoke=(x,y)=>{m.smoke=m.smoke||[];const X=x0+x,Y=y0+y;if(!m.smoke.some(s=>s[0]===X&&s[1]===Y))m.smoke.push([X,Y]);};return P;}
const T14ICON={inn:[[2,4,8,2,'#5a6ab0'],[2,3,3,1,'#ffffff'],[2,6,1,1,'#5a3a1a'],[9,6,1,1,'#5a3a1a']],tavern:[[3,2,5,5,'#e0a030'],[3,2,5,1,'#ffffff'],[8,3,2,3,'#c08020']],smithy:[[2,5,8,2,'#6a6a7a'],[4,3,4,2,'#8a8a9a'],[5,1,1,4,'#c0c0d0']],
  workshop:[[4,1,4,1,'#8a8a9a'],[5,2,2,2,'#c8c8d0'],[3,4,6,4,'#3aa860'],[4,5,2,1,'#b8f0c8'],[9,1,2,3,'#5a3a1a'],[8,1,3,1,'#9a9aa8']],guild:[[3,1,6,6,'#b8483a'],[5,2,2,4,'#f0c050'],[3,7,1,1,'#b8483a'],[8,7,1,1,'#b8483a']]};
function t14Sign(P,sx,sy,hang){const {f,F}=P,ic=T14ICON[P.k];if(!ic)return;const s=F.sg;if(hang){f(F.base[2],sx+5,sy-3,10,1);f(F.base[2],sx+6,sy-3,1,3);}f(OUTC,sx-1,sy-1,14,11);f(s[0],sx,sy,12,9);f(s[1],sx,sy,12,1);f(shade(s[0],.75),sx,sy+8,12,1);f(s[2],sx,sy,1,9);ic.forEach(([a,bb,ww,hh,c])=>f(c,sx+a,sy+bb,ww,hh));}
function t14Windows(P,wyy,o,two){const {w,F}=P,N=TWN14[F.win];if(w>=64){N(P,6,wyy,o);N(P,w-14,wyy,o);if(w>=96){N(P,Math.floor(w/2)-20,wyy,o);N(P,Math.floor(w/2)+12,wyy,o);}}else N(P,w>48?8:4,wyy,o);}
function t14Paint(ctx,m,b,F){const P=tk14P(ctx,m,b,F),{f,w,h,k,wy,doorX}=P,hd=F.hd;m.lights=m.lights||[];
  if(hd==='card'){TRF14.cone(P,F.roofO);const top=P.top,cx=Math.floor(w/2);
    for(let yy=0;yy<14;yy++){const hw=Math.round(2+yy*.45);f('#1a1010',doorX+8-hw,h-14+yy,hw*2,1);}for(let yy=0;yy<14;yy++){const hw=Math.round(2+yy*.45);f(tint(P.roof,.2),doorX+8-hw-1,h-14+yy,1,1);f(shade(P.roof,.55),doorX+8+hw,h-14+yy,1,1);}f(F.wg,doorX+6,h-6,4,4);
    f(tint(P.roof,.4),cx-1,top+1,3,3);f('#3a2a1a',cx,top-6,1,7);f(P.acc,cx+1,top-6,6,3);f(tint(P.acc,.4),cx+1,top-6,6,1);
    if(F.wing)try{TWG14[F.wing[0]](P,F.wing[1]);}catch(_){}
    (F.ext||[]).forEach(e=>{try{TXT14[e](P);}catch(_){}});m.lights.push([tx0l(P)+doorX+8,P.y0+h-4,22]);t14Sign(P,doorX+18,h-22,0);return;}
  const top=P.top,ox=F.inset||0,Q=ox?Object.assign(Object.create(P),{w:w-2*ox,doorX:Math.max(0,Math.min(w-2*ox-16,doorX-ox)),f:(c,x,y,ww,hh)=>P.f(c,x+ox,y,ww,hh)}):P;
  if(hd==='keep'){f(OUTC,-1,top-1,w+2,h-top+2);TWL14[F.wall.k](P,F.wall);f(F.base[0],0,h-4,w,4);f(F.base[1],0,h-4,w,1);TRF14.flat(P,F.roofO);}
  else{Q.f(OUTC,-1,wy-1,Q.w+2,h-wy+2);TWL14[F.wall.k](Q,F.wall);Q.f(F.base[0],0,h-4,Q.w,4);Q.f(F.base[1],0,h-4,Q.w,1);for(let i=0;i<Q.w;i+=6)Q.f(F.base[2],i,h-3,1,3);TRF14[F.roofO.shape](P,F.roofO);
    const ch=(k==='smithy'&&F.chim.k!=='none')?{k:'stack'}:F.chim;if(k!=='guild'&&k!=='chapel'&&ch.k!=='none')TCH14[ch.k](P,ch);}
  const wyy=hd==='keep'?h-34:wy+4;t14Windows(Q,wyy,F.winO);if(hd==='keep'&&h>=64&&F.up)t14Windows(P,top+16,F.winO);
  const dh=hd==='keep'?18:16,dy=h-dh,dX=Q.doorX;TDR14[F.door](Q,dX,dy,dh);
  Q.f('#2a2a34',dX+15,dy+2,1,4);Q.f(F.lan?F.lan:'#ffd870',dX+15,dy+3,2,3);m.lights.push([P.x0+ox+dX+16,P.y0+dy+4,18]);
  if(k==='guild'){for(const [bx,col] of [[4,P.acc],[w-12,P.acc]]){f('#3a2a1a',bx,wy+1,8,1);f(col,bx+1,wy+2,6,h-wy-16);f('#f0c050',bx+3,wy+5,2,4);f(col,bx+1,h-14,2,2);f(col,bx+5,h-14,2,2);}}
  if(k==='chapel'){const tw=Math.floor(w/2)-7,ty=(hd==='keep'?top:P.rt)-4;f(OUTC,tw-1,ty-18,16,20);f(F.w[0],tw,ty-17,14,19);f(tint(F.w[0],.2),tw,ty-17,2,19);f(shade(F.w[0],.7),tw+12,ty-17,2,19);f(OUTC,tw+4,ty-14,6,8);f('#2a2430',tw+5,ty-13,4,6);f('#e8c040',tw+6,ty-10,2,2);
    for(let i=0;i<9;i++){f(P.roof,tw+i-1,ty-18-i,16-i*2,1);}f(OUTC,tw+6,ty-30,2,8);f('#e8c040',tw+6,ty-31,2,6);f('#e8c040',tw+4,ty-27,6,1);}
  (F.crown||[]).forEach(c=>{try{TCR14[c](P);}catch(_){}});if(F.wing)try{TWG14[F.wing[0]](P,F.wing[1]);}catch(_){}
  (F.ext||[]).forEach(e=>{try{TXT14[e](Q);}catch(_){}});
  if(P.k!=='guild'&&P.k!=='chapel')t14Sign(Q,dX-14,dy-2,1);}
const tx0l=P=>P.x0;
HOOK.wrap('drawBuilding','towns14','a realm\'s own building family',function(next,ctx,m,b){const F=m&&m.sty&&TF14[m.sty];if(!F||!TST14[b.k]||T14.off)return next(ctx,m,b);try{t14Paint(ctx,m,b,F);}catch(e){try{wdLog('towns14 paint '+m.sty+' '+b.k+': '+e.message);}catch(_){}return next(ctx,m,b);}});
HOOK.xform('hdBldKind','towns14','the HD-2D body of a family building: a gabled box, a flat topped box or a cone',function(k,m,b){const F=m&&m.sty&&TF14[m.sty];return F&&b&&TST14[b.k]&&!T14.off?F.hd:k;});
HOOK.xform('hdRoofProf','towns14','the roof pitch of a family',function(r,m,b){const F=m&&m.sty&&TF14[m.sty];return F&&b&&TST14[b.k]&&!T14.off?F.rp:r;});
// ---------- styles: the families ----------
function tf14(n,o){o.n=n;TF14[n]=o;return o;}
const TFL4=['#f06a8a','#f6e06a','#ffffff','#b080ff'];
tf14('timber',{hd:'roof',crown:['dormer'],rp:1,wall:{k:'half',c:['#efe2c0'],m:'#5a3a20'},base:['#888070','#a8a090','#5e584c'],roofO:{shape:'gable',pat:'thatch',over:4,t:'#d4ae5a',t2:'#f0d070',ridge:'#8a6a2a'},r:['#b8483a','#9a6a3a','#c87a3a','#7a8a3a'],w:['#efe2c0'],wf:'#5a3a20',wg:'#ffd98a',fl:TFL4,dr:['#4a2a14','#7a4a24'],chim:{k:'brick',c:'#8a5a4a'},win:'sq',winO:{box:1,shut:'#b8483a'},door:'plank',ext:[],sg:['#5a3a1e','#7a5228','#9a6a38']});
tf14('cider',{hd:'roof',crown:['cupola','hoist'],wing:['lean',1],rp:.95,wall:{k:'plank',v:1,pw:4,c:['#a85a34','#b86a3c','#984e2c'],m:'#6a3020',band:[12,'#e8dcc0']},base:['#8a7a6a','#a89888','#6a5a4a'],roofO:{shape:'gable',pat:'tile',over:5,prof:'gambrel'},r:['#c0542a','#a84a28','#d0642e','#8a3a20'],w:['#a85a34'],wf:'#e8dcc0',wg:'#ffd98a',fl:TFL4,dr:['#5a2a14','#8a4a24'],chim:{k:'brick',c:'#a85a34'},win:'sq',winO:{shut:'#e8dcc0'},door:'plank',ext:['barrel','apples'],sg:['#8a4a26','#a85a30','#6a3a1e']});
tf14('coast',{hd:'roof',crown:['lookout'],rp:.8,wall:{k:'plaster',c:['#f6f2e8','#e4ded0'],m:'#3a6a9a',band:'#3a6a9a'},base:['#c8c0b0','#e8e0d0','#9a9284'],roofO:{shape:'gable',pat:'tile',over:6,prof:'hip'},r:['#3a7ab8','#2a8a9a','#5a6ab8','#3a9a8a'],w:['#f6f2e8'],wf:'#3a6a9a',wg:'#b8e0f8',fl:TFL4,dr:['#2a5a8a','#3a7ab8'],chim:{k:'brick',c:'#e4ded0'},win:'round',winO:{},door:'arch',ext:['pots','net'],sg:['#3a6a9a','#5a8ab8','#e8f4ff']});
tf14('lake',{hd:'roof',crown:['horns'],rp:1.1,wall:{k:'plank',v:1,pw:3,c:['#6a4a34','#5a3a28','#7a5a40'],m:'#2a1a12'},base:['#4a3a2e','#6a5a48','#2a1a12'],roofO:{shape:'gable',pat:'shingle',over:5,flare:1,ridge:'#2a3a38',prof:'hip'},r:['#3a5a58','#4a6a60','#2a4a50','#5a4a40'],w:['#6a4a34'],wf:'#2a1a12',wg:'#ffc060',fl:TFL4,dr:['#2a1a12','#4a3022'],chim:{k:'none'},win:'arch',winO:{},door:'plank',ext:['stilts','lantern'],lan:'#ffc060',sg:['#3a2a22','#5a4030','#8a6a48']});
tf14('mud',{hd:'card',wing:['lean',-1],rp:1,wall:{k:'blocks'},base:['#8a6a46','#a8845a','#6a4a30'],roofO:{shape:'cone',n:8,rows:4,dome:1},r:['#a8845a','#9a7a52','#b08a5a','#8a6a46'],w:['#9a7a52'],wf:'#4a3220',wg:'#ffd070',fl:TFL4,dr:['#3a2616','#6a4a2a'],chim:{k:'none'},win:'round',door:'hatch',ext:['net'],sg:['#6a4a2a','#8a6a3a','#c8a868']});
tf14('shroom',{hd:'roof',inset:9,rp:1,wall:{k:'bark',c:['#e8dcc0','#c8b894'],m:'#8a7a5a'},base:['#8a7a5a','#a89a78','#6a5a3e'],roofO:{shape:'dome',spot:'#f4ecd8',gill:'#e8d8b8'},r:['#c84a5a','#8a5ac8','#e8a030','#4aa8a0'],w:['#e8dcc0'],wf:'#4a3a2a',wg:'#7affd8',fl:TFL4,dr:['#4a3a2a','#8a6a4a'],chim:{k:'none'},win:'round',door:'round',ext:['roots','glowcap'],lan:'#7affd8',sg:['#4a3a2a','#6a5a3a','#8a8a5a']});
tf14('obsidian',{hd:'keep',crown:['shards'],rp:1,wall:{k:'facet',c:['#2a2230','#403650','#1a1420'],g:'#ff6a2a'},base:['#3a3040','#5a4a60','#1a1420'],roofO:{pin:0},r:['#5a2a3a','#4a2a4a','#6a3a2a','#3a2a4a'],w:['#2a2230'],wf:'#1a1420',wg:'#ff8a3a',fl:TFL4,dr:['#1a1420','#3a2a40'],glowd:'#ff6a2a',chim:{k:'none'},win:'slit',door:'gate',ext:['ember'],lan:'#ff8a3a',sg:['#2a2230','#4a3a58','#ff6a2a']});
tf14('iron',{hd:'roof',crown:['stacks'],rp:.6,wall:{k:'plate',c:['#6a6e7a','#5a5e6a','#7a7e8a'],m:'#2a2c34',rv:'#9a9eaa',rust:'#8a4a2a'},base:['#4a4e58','#6a6e7a','#2a2c34'],roofO:{shape:'saw'},r:['#4a4e5a','#5a4a4a','#3a3e4a','#6a5a4a'],w:['#6a6e7a'],wf:'#2a2c34',wg:'#ffa04a',fl:TFL4,dr:['#2a2c34','#4a4e5a'],chim:{k:'none'},win:'slit',door:'gate',ext:['gear','pipes'],lan:'#ffa04a',sg:['#3a3c46','#5a5c68','#c8a040']});
tf14('ice',{hd:'roof',wing:['porch',-1],rp:.85,wall:{k:'blocks',bw:12,bh:6,c:['#bfe6ff','#a8d8f4','#d4f0ff'],m:'#8ac0e0',sp:'#ffffff'},base:['#8ac0e0','#d4f0ff','#6aa0c8'],roofO:{shape:'gable',pat:'turf',over:3,ice:1,g:'#5a8a4a',prof:'round'},r:['#5a8a4a','#4a7a44','#6a9a54','#3a6a3a'],w:['#bfe6ff'],wf:'#4a7aa8',wg:'#e8faff',fl:['#ffffff','#bfe6ff','#ff7a8a','#8fdcf0'],dr:['#3a6a98','#6aa0d0'],chim:{k:'brick',c:'#a8d8f4'},win:'arch',winO:{},door:'arch',ext:['snowdrift'],lan:'#ffe8a0',sg:['#8ac0e0','#bfe6ff','#ffffff']});
tf14('chalet',{hd:'roof',crown:['steep'],rp:1.7,wall:{k:'plank',pw:4,knot:1,c:['#9a6a3a','#8a5a2a','#aa7a48'],m:'#3a2210'},base:['#8a8a90','#a8a8b0','#5a5a62'],roofO:{shape:'gable',pat:'snow',over:7,sn:.65,ice:1,prof:'tri'},r:['#c04a3a','#3a6a9a','#d08a3a','#5a5a7a'],w:['#9a6a3a'],wf:'#c04a3a',wg:'#ffd98a',fl:TFL4,dr:['#4a2a14','#7a4a24'],chim:{k:'brick',c:'#8a8a90'},win:'sq',winO:{shut:'#c04a3a',box:1},door:'plank',ext:['bargeboard','woodpile'],sg:['#6a3a1e','#8a5028','#c04a3a']});
tf14('stone',{hd:'roof',crown:['turret'],rp:1.15,wall:{k:'blocks',bw:10,bh:5,c:['#8a8e9a','#7a7e8a','#9a9eaa'],m:'#4a4e58'},base:['#6a6e7a','#8a8e9a','#3a3e48'],roofO:{shape:'stepped',pat:'slate',over:3},r:['#4a5a6a','#5a4a4a','#3a4a5a','#6a6a7a'],w:['#8a8e9a'],wf:'#3a3e48',wg:'#ffd98a',fl:TFL4,dr:['#2a2e38','#5a4a3a'],chim:{k:'brick',c:'#6a6e7a'},win:'arch',winO:{},door:'gate',ext:['vines','shield'],sg:['#3a3e48','#6a6e7a','#c8c8d0']});
tf14('cloud',{hd:'keep',wing:['tower',1],rp:1,wall:{k:'blocks',bw:10,bh:6,c:['#e8eaf6','#d8dcee','#f4f6ff'],m:'#b0b4d0',sp:'#ffffff'},base:['#b0b4d0','#e8eaf6','#8a8eb0'],roofO:{pin:1,spire:1},up:1,r:['#7a8ad8','#c8b8f0','#6ab0e8','#f0c0d8'],w:['#e8eaf6'],wf:'#6a70a0',wg:'#c8e8ff',fl:TFL4,dr:['#6a70a0','#a8b0e0'],chim:{k:'none'},win:'lancet',door:'arch',ext:['pennant'],lan:'#c8e8ff',sg:['#8a90c0','#b0b8e8','#ffffff']});
tf14('mesa',{hd:'keep',crown:['upper'],rp:1,wall:{k:'blocks',bw:14,bh:6,c:['#d8a868','#c89858','#e0b878'],m:'#a8783e'},base:['#a8783e','#c89858','#7a5428'],roofO:{pot:1},up:1,r:['#e0722a','#2a9a8a','#d0a030','#b04a3a'],w:['#d8a868'],wf:'#4a2a14',wg:'#3a2a30',fl:TFL4,dr:['#5a2a14','#c8582a'],chim:{k:'none'},win:'arch',winO:{},door:'curtain',ext:['awning','vigas'],lan:'#ffc060',sg:['#8a5a30','#b87a3e','#e8c880']});
tf14('cane',{hd:'roof',rp:1.3,wall:{k:'plank',v:1,pw:4,c:['#c0cc6a','#a8b858','#d0dc7a'],m:'#6a7a30',band:[8,'#7a8a38']},base:['#6a7a30','#8a9a44','#4a5a20'],roofO:{shape:'pagoda',pat:'tile',over:9},r:['#3a7a5a','#c8a030','#4a8a6a','#2a6a4a'],w:['#c0cc6a'],wf:'#5a6a28',wg:'#ffe890',fl:TFL4,dr:['#5a6a28','#8a9a44'],chim:{k:'none'},win:'round',winO:{},door:'round',ext:['lantern'],lan:'#e8503a',sg:['#8a9a3a','#b8c858','#e8f0a0']});
tf14('salt',{hd:'card',rp:1,wall:{k:'blocks'},base:['#c8c8d0','#f0f0f4','#9a9aa8'],roofO:{shape:'cone',n:6,stripe:'#f0d890',skirt:14,apex:6},r:['#f4f0e4','#f0e0c0','#e8f0f0','#f0d8d0'],w:['#f4f0e4'],wf:'#8a7a5a',wg:'#ffe8a0',fl:TFL4,dr:['#8a6a3a','#d8a850'],chim:{k:'none'},win:'arch',door:'curtain',ext:[],sg:['#a89868','#d8c890','#fff8e0']});
tf14('bone',{hd:'roof',crown:['antlers'],rp:1.4,wall:{k:'ribs',c:['#e8e0c8','#f4eed8'],m:'#8a7a5a'},base:['#8a7a5a','#b8a888','#5a4a34'],roofO:{shape:'gable',pat:'thatch',over:4,t:'#4a3e34',t2:'#6a5a4a',ridge:'#d8d0b8',prof:'tri'},r:['#4a3e34','#5a4a3a','#3a2e28','#6a5a48'],w:['#e8e0c8'],wf:'#4a3e34',wg:'#ffd98a',fl:TFL4,dr:['#3a2e28','#6a5a48'],chim:{k:'none'},win:'lancet',winO:{},door:'arch',ext:[],sg:['#d8d0b8','#f0e8d0','#8a7a5a']});
tf14('cinder',{hd:'roof',wing:['lean',1],rp:.55,wall:{k:'plank',v:1,pw:4,c:['#3a2e2a','#2a201c','#4a3a34'],m:'#150b17'},base:['#2a2220','#4a3a34','#150b17'],roofO:{shape:'gable',pat:'char',over:6,sag:1},r:['#2a2220','#3a2a24','#4a2e22','#2a1e1a'],w:['#3a2e2a'],wf:'#150b17',wg:'#ff8a3a',fl:TFL4,dr:['#150b17','#3a2a24'],chim:{k:'pipe',c:'#3a2e2a'},win:'slit',door:'hatch',ext:['ash','ember'],lan:'#ff6a2a',sg:['#2a2220','#4a3a34','#ff6a2a']});
tf14('drift',{hd:'roof',crown:['mast'],rp:.8,wall:{k:'plank',pw:4,knot:1,c:['#8a8070','#a09484','#6a6258','#b0a490'],m:'#2a2620'},base:['#5a5248','#7a7266','#3a342c'],roofO:{shape:'hull'},r:['#6a5a4a','#7a6a58','#5a4a3e','#8a7a64'],w:['#8a8070'],wf:'#3a342c',wg:'#c8e8e8',fl:TFL4,dr:['#3a342c','#6a5a4a'],chim:{k:'pipe',c:'#6a5a4a'},win:'port',winO:{},door:'hatch',ext:['net','shells'],sg:['#6a5a4a','#8a7a64','#e8dcc8']});
tf14('crystal',{hd:'card',rp:1,wall:{k:'blocks'},base:['#3a2a6a','#6a4aaa','#1a1030'],roofO:{shape:'cone',n:5,facet:1,glow:'#e0d0ff',shards:1,apex:14},r:['#6a4ac8','#4a8ae0','#a05ad8','#3a9ab8'],w:['#4a3a7a'],wf:'#2a1a50',wg:'#e0d0ff',fl:TFL4,dr:['#2a1a50','#6a4aaa'],chim:{k:'none'},win:'arch',door:'arch',ext:[],sg:['#3a2a6a','#6a4aaa','#d8c8ff']});
tf14('shard',{hd:'roof',rp:2,wall:{k:'blocks',bw:10,bh:6,c:['#d8d0f0','#c8c0e0','#e8e0ff'],m:'#9890b8',sp:'#ffffff'},base:['#9890b8','#c8c0e0','#6a608a'],roofO:{shape:'shed'},r:['#9a8ad8','#b8a8f0','#8a9ae8','#d0b0e8'],w:['#d8d0f0'],wf:'#6a608a',wg:'#d8f0ff',fl:TFL4,dr:['#6a608a','#a89cd0'],chim:{k:'none'},win:'lancet',winO:{},door:'arch',ext:['cracks'],sg:['#8a80b0','#a89cd0','#ffffff']});
HOOK.xform('signLook','towns14','the plank sign over a door in the family\'s own material',function(r,m,b){const F=m&&m.sty&&TF14[m.sty];if(!F||T14.off||!TST14[b.k])return r;const s=F.sg;return {a:s[0],b:s[1],c:s[2],d:mix(s[0],s[1],.5),e:shade(s[0],.6),f:tint(s[2],.2)};});
