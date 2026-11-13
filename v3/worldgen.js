// ===== worldgen.js (base): world generation: towns, fields, dungeons, validation, map assembly, the Archive =====
// =================== WORLD GENERATION ===================
const TS=16;
// Tiles: . ground , tall grass = road : plaza ~ water/lava/cloud/void # cliff/rock Z wall Y tower s stairs
// T tree t bush R rock f flowers F fence B bridge C chest K key chest W waystone S sign q quest board X Scourge or Calamity rune circle
// O fountain L lamp b barrel x crate h hay k cart m stall u banner a anvil v brazier g grave N standing stone
// Q ruin wall P pillar/crystal e tent y crops r rubble o boat G sealed gate E dungeon door/stairs U entrance facade
// D locked door | bars l lever H building j town landmark footprint (v0.18.7)
const SOLID='T#ZYtR~FWSqCKXOLbxhkmuavgNQPeoUD|lHGAj';// v0.18.7: j is a town landmark's footprint (world12.js draws it)
const SERVICE={inn:1,tavern:1,smithy:1,guild:1,workshop:1};
let MAPS={};
function resetMaps(){MAPS={};}
function valueNoise(R,W,H,cell){
  const gw=Math.ceil(W/cell)+2,gh=Math.ceil(H/cell)+2,v=[];for(let i=0;i<gw*gh;i++)v.push(R());
  const sm=t=>t*t*(3-2*t);
  return (x,y)=>{const gx=x/cell,gy=y/cell,x0=Math.floor(gx),y0=Math.floor(gy),fx=sm(gx-x0),fy=sm(gy-y0);
    const a=v[y0*gw+x0],b=v[y0*gw+x0+1],c=v[(y0+1)*gw+x0],d=v[(y0+1)*gw+x0+1];return a+(b-a)*fx+(c-a)*fy+(a-b-c+d)*fx*fy;};
}
function ri2(R,a,b){return a+Math.floor(R()*(b-a+1));}
class Gr{
  constructor(W,H,c){this.W=W;this.H=H;this.g=[];for(let y=0;y<H;y++)this.g.push(Array(W).fill(c));this.bld=[];}
  in(x,y){return x>=0&&y>=0&&x<this.W&&y<this.H;}
  get(x,y){return this.in(x,y)?this.g[y][x]:'#';}
  put(x,y,c){if(this.in(x,y))this.g[y][x]=c;}
  rect(x,y,w,h,c){for(let j=0;j<h;j++)for(let i=0;i<w;i++)this.put(x+i,y+j,c);}
  hline(x0,x1,y,c){for(let x=Math.min(x0,x1);x<=Math.max(x0,x1);x++)this.put(x,y,c);}
  vline(x,y0,y1,c){for(let y=Math.min(y0,y1);y<=Math.max(y0,y1);y++)this.put(x,y,c);}
  blob(cx,cy,rx,ry,c,R,jag){for(let y=Math.floor(cy-ry-2);y<=cy+ry+2;y++)for(let x=Math.floor(cx-rx-2);x<=cx+rx+2;x++){const d=((x-cx)/rx)**2+((y-cy)/ry)**2;if(d<=1-(jag?R()*jag:0))this.put(x,y,c);}}
  B(k,x,y,w,h,extra){this.rect(x,y,w,h,'H');const b=Object.assign({k,x,y,w,h,door:[x+Math.floor((w-1)/2),y+h-1]},extra||{});this.bld.push(b);return b;}
  rows(){return this.g;}
}
const ENT_MIN=.4;
// breadth-first walking distance (4-way) from a start tile over passable ground; -1 where unreachable
function walkDist(g,sx,sy,maxX){const H=g.length,W=g[0].length,D=g.map(r=>r.map(()=>-1)),Q=[[sx,sy]];D[sy][sx]=0;
  for(let q=0;q<Q.length;q++){const [x,y]=Q[q];for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=W||ny>=H||(maxX&&nx>=maxX)||D[ny][nx]>=0)continue;if(SOLID.includes(g[ny][nx]))continue;D[ny][nx]=D[y][x]+1;Q.push([nx,ny]);}}
  return D;}
function flood(g,sx,sy,maxX,passable){
  const H=g.length,W=g[0].length,seen=g.map(r=>r.map(()=>false)),st=[[sx,sy]];
  const ok=passable||(c=>!SOLID.includes(c)||c==='C'||c==='K');
  while(st.length){const [x,y]=st.pop();if(x<0||y<0||x>=W||y>=H||(maxX&&x>=maxX)||seen[y][x])continue;if(!ok(g[y][x]))continue;seen[y][x]=true;st.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);}
  return seen;
}

// =================== TOWNS ===================
// Every realm has its own layout. All share: inn, tavern, smithy, guild hall, waystone, quest board, west/east exits on the road row.
// v0.3.5 1.3: prop grounding audit. A prop must touch a building, wall, fence, cliff, tree or path edge (directly, or through a chain of
// props of the same cluster), and nothing may stand on or beside a door-front tile. Returns [{x,y,c,why}] (empty = clean).
const PROP_CH='xbhkuavgNPeoLmyO',PROP_CLUSTER='xbhk',PROP_ANCHOR='HFZ#TYtRQ',PROP_PATH='=:B';
function propIssues(g,bld){
  const H=g.length,W=g[0].length,out=[],at=(x,y)=>(g[y]||[])[x],N4=[[0,1],[1,0],[0,-1],[-1,0]];
  const anch=(x,y)=>N4.some(([a,b])=>PROP_ANCHOR.includes(at(x+a,y+b)||' '));
  const path=(x,y)=>N4.some(([a,b])=>PROP_PATH.includes(at(x+a,y+b)||' '));
  const ok=new Set(),q=[];
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const c=g[y][x];if(!PROP_CLUSTER.includes(c)&&c!=='u')continue;if(anch(x,y)||path(x,y)){ok.add(x+','+y);q.push([x,y]);}}
  while(q.length){const [x,y]=q.pop();N4.forEach(([a,b])=>{const c=at(x+a,y+b);if(c&&PROP_CLUSTER.includes(c)&&PROP_CLUSTER.includes(g[y][x])&&!ok.has((x+a)+','+(y+b))){ok.add((x+a)+','+(y+b));q.push([x+a,y+b]);}});}
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const c=g[y][x];if((PROP_CLUSTER.includes(c)||c==='u')&&!ok.has(x+','+y))out.push({x,y,c,why:'floating '+c});}
  (bld||[]).forEach(b=>{const [dx,dy]=b.door;for(let a=-1;a<=1;a++){const c=at(dx+a,dy+1);if(c&&(PROP_CH.includes(c)&&c!=='y'&&c!=='O'))out.push({x:dx+a,y:dy+1,c,why:'door-front '+c});}
    if(at(dx,dy)!=='H')out.push({x:dx,y:dy,c:at(dx,dy),why:'door not in wall'});});
  return out;
}
// v0.3.5 1.3: re-seat or remove every ungrounded prop (called from townFinish). Moves to the nearest free grass tile that touches an anchor or a path edge.
function groundProps(G0){
  const g=G0.g,H=g.length,W=g[0].length,N4=[[0,1],[1,0],[0,-1],[-1,0]];
  const doorFront=new Set();G0.bld.forEach(b=>{for(let a=-2;a<=2;a++)for(let d=1;d<=2;d++)doorFront.add((b.door[0]+a)+','+(b.door[1]+d));});
  const bad=propIssues(g,G0.bld).filter(i=>i.why.startsWith('floating')||i.why.startsWith('door-front'));
  bad.forEach(i=>{g[i.y][i.x]='.';});
  bad.forEach(i=>{let best=null,bd=99;
    for(let y=2;y<H-2;y++)for(let x=2;x<W-2;x++){if(g[y][x]!=='.'||doorFront.has(x+','+y))continue;
      const t=N4.some(([a,b])=>PROP_ANCHOR.includes(g[y+b][x+a]));if(!t&&!N4.some(([a,b])=>PROP_PATH.includes(g[y+b][x+a])))continue;
      if(N4.some(([a,b])=>g[y+b][x+a]==='='&&y+b===G0.road))continue; // keep the main road edge clear
      const d=Math.abs(x-i.x)+Math.abs(y-i.y);if(d<bd&&d<=6){bd=d;best=[x,y];}}
    if(best)g[best[1]][best[0]]=i.c;});
}
function townFinish(G0,th,R,road){
  const W=G0.W,H=G0.H,g=G0.g;
  // v0.3.3: roads, plazas and braziers were painted over some building footprints, leaving walkable holes. Stamp every footprint solid again.
  G0.bld.forEach(b=>G0.rect(b.x,b.y,b.w,b.h,'H'));
  for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){if(g[y][x]!=='.')continue;const near=[[0,1],[1,0],[0,-1],[-1,0]].some(([a,b])=>'=:sB'.includes((g[y+b]||[])[x+a]));if(near)continue;const r=R();if(r<.06)G0.put(x,y,'f');else if(r<.08&&th!=='cave'&&th!=='void'&&th!=='heights')G0.put(x,y,'t');}
  G0.bld.forEach(b=>{const [dx,dy]=b.door;if(g[dy+1]&&'.f,'.includes(g[dy+1][dx]))G0.put(dx,dy+1,'=');});
  G0.road=road;groundProps(G0);
  return {g,bld:G0.bld,road};
}
function townMeadow(R){
  const W=36,H=26,T=new Gr(W,H,'.'),road=13;
  for(let x=0;x<W;x++){T.put(x,0,'Z');T.put(x,H-1,'Z');}for(let y=0;y<H;y++){T.put(0,y,'Z');T.put(W-1,y,'Z');}
  [[0,0],[W-1,0],[0,H-1],[W-1,H-1],[0,road-1],[0,road+1],[W-1,road-1],[W-1,road+1]].forEach(([x,y])=>T.put(x,y,'Y'));
  T.rect(0,road,W,1,'=');T.rect(2,8,W-4,1,'=');T.rect(2,22,W-4,1,'=');
  T.rect(5,8,1,6,'=');T.rect(27,8,1,6,'=');T.rect(10,13,1,10,'=');T.rect(24,13,1,10,'=');T.rect(17,8,1,2,'=');
  T.rect(13,9,10,9,':');T.rect(17,11,2,2,'O');
  [[14,10],[15,10],[20,10],[21,10],[14,16],[21,16]].forEach(([x,y])=>T.put(x,y,'m'));
  T.put(17,15,'W');T.put(19,15,'q');
  T.B('inn',3,3,6,5);T.B('chapel',14,3,8,5);T.B('tavern',25,3,6,5);T.B('smithy',3,17,6,5);T.B('workshop',13,18,4,4);T.B('house',19,18,4,4);T.B('guild',26,16,7,6);
  [[12,9],[23,9],[12,17],[23,17],[9,12],[26,14]].forEach(([x,y])=>T.put(x,y,'L'));
  T.put(9,20,'a');T.put(9,18,'v');T.put(2,21,'x');T.put(2,20,'b');T.put(24,6,'b');T.put(31,6,'b');T.put(32,7,'x');T.put(31,7,'x');
  T.put(12,12,'u');T.put(23,12,'u');T.put(1,road-2,'u');T.put(W-2,road-2,'u');T.put(W-3,road+1,'S');
  T.rect(29,9,5,3,'y');T.rect(28,12,7,1,'F');T.vline(28,9,11,'F');T.put(3,10,'h');T.put(4,10,'h');T.put(3,11,'k');T.put(2,15,'T');T.put(8,15,'T');T.put(33,2,'T');T.put(2,2,'t');
  return townFinish(T,'meadow',R,road);
}
function townCoast(R){
  const W=38,H=26,T=new Gr(W,H,'.'),road=9;
  for(let x=0;x<W;x++){T.put(x,0,'#');T.put(x,1,R()<.5?'#':'T');}
  for(let x=0;x<W;x++){const top=18+Math.round(Math.sin(x/4)*1);for(let y=top;y<H;y++)T.put(x,y,'~');}
  T.rect(0,road,W,1,'=');T.rect(1,16,W-2,1,'B');
  [8,19,30].forEach(px=>{T.vline(px,17,23,'B');T.put(px-1,23,'B');T.put(px+1,23,'B');});
  [[6,20],[12,22],[24,21],[33,22]].forEach(([x,y])=>T.put(x,y,'o'));
  T.B('inn',3,4,6,5);T.B('tavern',11,4,6,5);T.B('guild',27,3,7,6);T.B('chapel',19,3,6,6);
  T.B('smithy',3,11,6,5);T.B('workshop',11,12,4,4);T.B('house',23,12,4,4);T.B('lighthouse',33,11,3,5);
  T.rect(16,10,6,5,':');[[16,11],[17,11],[20,11],[21,11]].forEach(([x,y])=>T.put(x,y,'m'));T.put(18,13,'W');T.put(19,13,'q');
  T.vline(5,10,15,'=');T.vline(13,10,15,'=');T.vline(25,10,15,'=');T.vline(34,15,15,'=');T.vline(18,14,15,':');T.vline(19,14,15,':');
  [[9,10],[15,15],[22,15],[28,10],[31,15]].forEach(([x,y])=>T.put(x,y,'L'));
  [[1,10],[2,10],[9,14],[10,14],[29,14],[30,14],[36,14]].forEach(([x,y],i)=>T.put(x,y,i%2?'b':'x'));
  [[2,3],[9,3],[36,3],[25,6]].forEach(([x,y])=>T.put(x,y,'T'));
  T.put(W-3,road+1,'S');T.put(1,road-1,'u');T.put(W-2,road-1,'u');
  return townFinish(T,'coast',R,road);
}
function townCave(R){
  const W=38,H=28,T=new Gr(W,H,'.'),road=14,n=valueNoise(R,W,H,4);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const edge=Math.min(x,y,W-1-x,H-1-y);if(edge<2||(edge<4&&n(x,y)>.55))T.put(x,y,'#');}
  T.vline(18,0,H-1,'~');T.vline(19,0,H-1,'~');
  T.rect(0,road,W,1,'=');T.put(18,road,'B');T.put(19,road,'B');
  T.rect(3,9,14,1,':');T.rect(21,9,14,1,':');T.rect(3,22,14,1,':');T.rect(21,22,14,1,':');
  T.vline(8,9,22,':');T.vline(29,9,22,':');
  T.put(18,9,'B');T.put(19,9,'B');T.put(18,22,'B');T.put(19,22,'B');
  T.B('inn',3,4,6,5);T.B('keep',10,3,7,6);T.B('tavern',21,4,6,5);T.B('guild',28,3,7,6);
  T.B('smithy',3,17,9,5);T.B('workshop',21,18,4,4);T.B('house',27,18,4,4);
  T.rect(11,16,4,4,':');T.put(12,17,'W');T.put(13,17,'q');
  [[3,10],[16,10],[21,10],[34,10],[3,21],[16,21],[21,21],[34,21],[7,13],[30,13],[7,15],[30,15]].forEach(([x,y])=>T.put(x,y,'v'));
  [[13,19],[14,19]].forEach(([x,y])=>T.put(x,y,'a'));T.put(12,22,'k');T.put(25,13,'k');
  [[4,12],[33,12],[4,16],[33,17],[24,16],[11,12]].forEach(([x,y])=>T.put(x,y,'P'));
  [[2,15],[35,15]].forEach(([x,y])=>T.put(x,y,'x'));
  T.put(W-3,road+1,'S');
  return townFinish(T,'cave',R,road);
}
function townSnow(R){
  const W=36,H=28,T=new Gr(W,H,'.'),road=11;
  for(let x=0;x<W;x++){T.put(x,0,'Z');T.put(x,H-1,'Z');}for(let y=0;y<H;y++){T.put(0,y,'Z');T.put(W-1,y,'Z');}
  [[0,0],[W-1,0],[0,H-1],[W-1,H-1],[0,road-1],[0,road+1],[W-1,road-1],[W-1,road+1]].forEach(([x,y])=>T.put(x,y,'Y'));
  // a cliff splits the hold into an upper and lower terrace, joined by stairs
  for(let x=1;x<W-1;x++)T.put(x,16,'#');T.put(9,16,'s');T.put(26,16,'s');T.put(17,16,'s');T.put(18,16,'s');
  T.rect(0,road,W,1,'=');T.rect(2,20,W-4,1,'=');T.vline(9,12,15,'=');T.vline(26,12,15,'=');T.vline(9,17,19,'=');T.vline(26,17,19,'=');T.vline(17,12,15,':');T.vline(18,12,15,':');T.vline(17,17,19,'=');
  T.B('keep',12,1,12,8);T.B('inn',2,4,6,5);T.B('tavern',28,4,6,5);
  T.rect(12,9,12,2,':');T.put(14,9,'W');T.put(21,9,'q');
  T.B('guild',2,21,7,5);T.B('smithy',27,21,6,5);T.B('workshop',11,22,4,4);T.B('house',21,22,4,4);
  T.rect(13,17,3,2,'~');T.rect(20,17,3,2,'~');
  [[2,2],[8,2],[27,2],[33,2],[3,13],[6,14],[30,13],[33,14],[16,24],[19,24]].forEach(([x,y])=>T.put(x,y,'T'));
  [[11,12],[24,12],[11,19],[24,19]].forEach(([x,y])=>T.put(x,y,'L'));
  [[10,9],[25,9]].forEach(([x,y])=>T.put(x,y,'u'));[[34,19],[1,19],[34,18]].forEach(([x,y])=>T.put(x,y,'x'));
  T.put(W-3,road+1,'S');
  return townFinish(T,'snow',R,road);
}
function townHeights(R){
  const W=40,H=28,T=new Gr(W,H,'~');
  T.blob(7,13,7,10,'.',R,.15);T.blob(21,8,7,6,'.',R,.15);T.blob(33,15,7,10,'.',R,.15);T.blob(20,21,6,5,'.',R,.15);
  const road=13;
  T.hline(0,13,road,'=');T.hline(14,26,road,'B');T.hline(26,W-1,road,'=');T.vline(21,8,road,'=');T.vline(20,road+1,17,'B');T.vline(20,18,21,'=');
  for(let x=0;x<3;x++)T.put(x,road,'=');for(let x=W-3;x<W;x++)T.put(x,road,'=');
  T.B('inn',2,7,5,4);T.B('tavern',8,7,5,4);T.B('guild',17,2,7,5);T.B('smithy',30,8,6,5);T.B('workshop',30,17,4,4);T.B('windmill',17,18,4,4);
  T.put(4,road+2,'W');T.put(5,road+2,'q');
  T.vline(4,11,12,'=');T.vline(10,11,12,'=');T.vline(20,7,7,'=');T.vline(32,13,13,'=');T.vline(32,21,21,'=');T.vline(31,14,20,'=');
  [[3,17],[6,19],[10,17],[37,11],[36,18],[25,9],[17,10],[24,23]].forEach(([x,y])=>T.put(x,y,'N'));
  [[12,12],[27,12],[23,7],[18,7]].forEach(([x,y])=>T.put(x,y,'u'));
  [[8,road+2],[34,road+2]].forEach(([x,y])=>T.put(x,y,'L'));
  T.put(W-3,road+1,'S');
  return townFinish(T,'heights',R,road);
}
function townVoid(R){
  const W=36,H=26,T=new Gr(W,H,'.'),road=13;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const d=((x-17.5)/17)**2+((y-12.5)/12)**2;if(d>1)T.put(x,y,'~');else if(d>.82)T.put(x,y,'Z');}
  T.rect(0,road,W,1,'=');T.rect(8,6,20,1,'=');T.rect(8,20,20,1,'=');T.vline(8,6,20,'=');T.vline(27,6,20,'=');
  T.B('inn',4,8,5,4);T.B('tavern',10,2,5,4);T.B('bigtent',15,7,6,5);T.B('guild',22,2,6,4);T.B('smithy',28,8,5,4);T.B('workshop',11,15,4,4);T.B('house',21,15,4,4);
  T.rect(15,14,6,4,':');T.put(17,15,'v');T.put(18,15,'v');T.put(16,17,'W');T.put(19,17,'q');
  [[9,9],[26,9],[9,17],[26,17],[13,13],[22,13],[6,13],[29,13]].forEach(([x,y])=>T.put(x,y,'L'));
  [[4,17],[6,18],[29,17],[31,18],[5,4],[30,4]].forEach(([x,y])=>T.put(x,y,'e'));[[3,16],[32,16]].forEach(([x,y])=>T.put(x,y,'g'));
  for(let x=0;x<W;x++)if(T.get(x,road)!=='=')T.put(x,road,'=');
  T.put(W-3,road+1,'S');
  return townFinish(T,'void',R,road);
}
const TOWNGEN={meadow:townMeadow,coast:townCoast,cave:townCave,snow:townSnow,heights:townHeights,void:townVoid};
// v0.20.6: the town of a realm comes from townGen (one definition): towns14.js picks the layout by the realm's key and theme family; the six theme layouts above stay as the fallback
function townGen(Z,s,R){return TOWNGEN[Z.theme](R);}
townGen=HOOK.def('townGen',townGen);

// =================== FIELDS ===================
const STAMPS={
 ruin:["QQ.QQ","Qr..Q","P...P","Q.r.Q","QQ.QQ"],
 stones:[".N.N.","N...N","..C..","N...N",".N.N."],
 farm:["FFFFFFF","FyyyyyF","FyyyyyF","FFF.FFF","h.....h"],
 homestead:["HHHH.","HHHH.","HHHHh",".....","f..f."],
 tower:["AAA","AAA","AAA","AAA","..."],
 camp:[".e..e.","..xvx.","......"],
 graves:["FFFFF","Fg.gF","F.g.F","FF.FF"],
 crystals:["P..P",".P..","..PP","P..."],
 wreck:["..xx..",".kbbk.","..xx.."],
 shrine:[".N.",".W.","..."]
};
const LANDMARKS={meadow:['farm','homestead','ruin','stones','tower'],coast:['wreck','homestead','ruin','camp'],cave:['ruin','camp','crystals','crystals'],
 snow:['graves','ruin','camp','tower'],heights:['stones','ruin','camp','crystals'],void:['graves','ruin','stones','crystals']};
function windPath(R,W,H,sy,ey,bx,amp,step){
  let y=sy;const path=[];
  for(let x=0;x<W;x++){
    const target=x<bx-14?Math.round(H/2+Math.sin(x/7+R()*0)*amp):ey;
    if(x>1&&y!==target&&(x>=bx-14||x%step===0)){path.push([x,y]);y+=Math.sign(target-y);}
    if(x===bx-3)while(y!==ey){path.push([x,y]);y+=Math.sign(ey-y);}
    y=clamp(y,4,H-5);path.push([x,y]);
  }
  return path;
}
// v0.3.5 6.2/6.3: journeys started on v0.3.5 (G.wv===2) get two fields per town and bigger maps; older saves keep the single 48x30 field.
const worldV2=()=>typeof G!=='undefined'&&!!G&&G.wv>=2;
// v0.4.0 5.1/5.2: journeys started on v0.4.0 (G.wv===3) get one long field per stretch, gates on any side and optional side caves. Older saves keep their maps.
const worldV3=()=>typeof G!=='undefined'&&!!G&&G.wv>=3;
function fieldBase(s,R,th,part){
  if(part===3){ // v0.4.0 5.1: the one long field. The road starts in a high, middle or low band and ends in another, so the route really crosses the map.
    const W=F3_W,H=F3_H,F=new Gr(W,H,'.'),bands=[Math.round(H*.2),Math.round(H*.5),Math.round(H*.8)],bi=Math.floor(R()*3),bj=R()<.65?2-bi:Math.floor(R()*3);
    const sy=bands[bi]+ri2(R,-2,2),ey=bands[bj]+ri2(R,-2,2);
    return {F,W,H,sy,ey,bx:W-8,part:3};
  }
  const v2=worldV2()&&part,W=v2?(part===1?56:64):48,H=v2?(part===1?34:38):30,F=new Gr(W,H,'.'),sy=Math.floor(H/2)+ri2(R,-3,3),ey=Math.floor(H/2)+ri2(R,-3,3),bx=part===1?W-3:W-8;
  return {F,W,H,sy,ey,bx,part:v2?part:0};
}
const F3_W=112,F3_H=44;
// Longer ground to cover: side trails that end in a clearing with a chest, and loop trails that join two far bends of the main road (shortcuts).
function carveTrail(F,R,x0,y0,x1,y1){
  let x=x0,y=y0,n=0;const cells=[];
  while((x!==x1||y!==y1)&&n++<500){const dx=x1-x,dy=y1-y;
    if(dy===0||(dx!==0&&(Math.abs(dx)>Math.abs(dy)?R()<.8:R()<.25)))x+=Math.sign(dx);else y+=Math.sign(dy);
    x=Math.max(3,Math.min(F.W-4,x));y=Math.max(3,Math.min(F.H-4,y));cells.push([x,y]);}
  cells.forEach(([x,y])=>{for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const xx=x+i,yy=y+j;if(xx>1&&yy>1&&xx<F.W-2&&yy<F.H-2&&'TtRP#'.includes(F.g[yy][xx]))F.g[yy][xx]='.';}});
  cells.forEach(([x,y])=>{F.g[y][x]=F.g[y][x]==='~'?'B':'=';});
  return cells.length;
}
function addTrails(F,R,path,bx,th){
  const ends=[],L=path.length,want=F.W>=F3_W?7:th==='void'||th==='heights'?3:4;
  for(let k=0,tries=0;k<want&&tries<40;tries++){
    const i=ri2(R,10,L-22),[px,py]=path[i];if(px>bx-8)continue;
    const up=py>F.H/2?-1:1,tx=Math.max(5,Math.min(bx-5,px+ri2(R,-9,9))),ty=Math.max(5,Math.min(F.H-6,py+up*ri2(R,8,13)));
    if(ends.some(([ex,ey])=>Math.abs(ex-tx)+Math.abs(ey-ty)<10))continue;
    if(Math.abs(ty-py)<6)continue;
    carveTrail(F,R,px,py,tx,ty);F.blob(tx,ty,2,2,'.',R,.2);ends.push([tx,ty]);k++;}
  // shortcuts: two bends of the road that sit close together but far apart along the road
  let loops=0;const maxLoops=F.W>=F3_W?4:2;
  for(let t=0;t<(F.W>=F3_W?160:60)&&loops<maxLoops;t++){const i=ri2(R,6,L-60),j=i+ri2(R,45,Math.min(80,L-i-8));if(j>=L)continue;const [ax,ay]=path[i],[bx2,by2]=path[j];
    if(bx2>bx-10||Math.abs(ax-bx2)+Math.abs(ay-by2)>13||Math.abs(ax-bx2)+Math.abs(ay-by2)<5)continue;
    carveTrail(F,R,ax,ay,bx2,by2);loops++;}
  return ends;
}
function genFieldShape(s,R,th,ctx){
  const {F,W,H,sy,ey,bx}=ctx,n1=valueNoise(R,W,H,5),n3=valueNoise(R,W,H,4),n5=valueNoise(R,W,H,3);
  let path;
  if(th==='meadow'||th==='coast'||th==='snow'){
    path=windPath(R,W,H,sy,ey,bx,ctx.part===3?(th==='snow'?12:11):ctx.part?(th==='snow'?10:9):(th==='snow'?8:6),th==='snow'?2:3);
    if(th==='snow'){F.rect(0,0,W,H,'#');path.forEach(([x,y])=>{const r=2+Math.round(n5(x,y)*2);for(let j=-r;j<=r;j++)for(let i=-2;i<=2;i++)F.put(x+i,y+j,'.');});
      for(let k=0;k<5;k++){const cx=ri2(R,6,bx-6),cy=ri2(R,4,H-5);F.blob(cx,cy,ri2(R,3,5),ri2(R,2,4),'.',R,.2);}
      F.blob(ri2(R,10,30),ri2(R,6,H-7),4,2.5,'~',R,.1);}
    else{for(let x=0;x<W;x++){const t=2+(n5(x,0)>.6?1:0),b=2+(n5(x,H)>.6?1:0);for(let j=0;j<t;j++)F.put(x,j,'#');for(let j=0;j<b;j++)F.put(x,H-1-j,'#');}for(let y=0;y<H;y++){F.put(0,y,'#');F.put(1,y,'#');F.put(W-1,y,'#');F.put(W-2,y,'#');}}
    if(th==='coast'){for(let x=2;x<W-2;x++){const top=H-8+Math.round(Math.sin(x/5)*1.5);for(let y=top;y<H;y++)F.put(x,y,'~');}
      for(let k=0;k<4;k++)F.blob(ri2(R,6,bx-4),ri2(R,H-12,H-10),2,1.2,'~',R,0);}
    if(th==='meadow'){const rx0=Math.floor(W*.42)+ri2(R,-3,3);for(let y=0;y<H;y++){const rx=rx0+Math.round(Math.sin(y/5+s)*2);F.put(rx,y,'~');F.put(rx+1,y,'~');}
      if(ctx.part===3){const rx1=Math.floor(W*(rx0<W*.42?.22:.7))+ri2(R,-3,3);for(let y=0;y<H;y++){const rx=rx1+Math.round(Math.sin(y/6+s+2)*2);F.put(rx,y,'~');F.put(rx+1,y,'~');}}}
  }else if(th==='cave'){
    F.rect(0,0,W,H,'#');
    for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++)if(R()<.56)F.put(x,y,'.');
    for(let it=0;it<4;it++){const c=F.g.map(r=>r.slice());for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){let n=0;for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++)if(c[y+j][x+i]==='#')n++;F.g[y][x]=n>=5?'#':'.';}}
    path=windPath(R,W,H,sy,ey,bx,ctx.part===3?10:6,2);
    path.forEach(([x,y])=>{for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++)F.put(x+i,y+j,'.');});
    for(let k=0;k<5;k++){const cx=ri2(R,5,bx-4),cy=ri2(R,3,H-4);F.blob(cx,cy,ri2(R,2,4),ri2(R,1,3),'~',R,.2);}
  }else{
    // islands over cloud or void
    F.rect(0,0,W,H,'~');path=windPath(R,W,H,sy,ey,bx,ctx.part===3?10:7,3);
    for(let i=0;i<path.length;i+=9){const [x,y]=path[i];F.blob(x+ri2(R,-1,2),y+ri2(R,-1,1),ri2(R,4,6),ri2(R,3,5),'.',R,.25);}
    for(let k=0;k<6;k++)F.blob(ri2(R,6,bx-4),ri2(R,4,H-5),ri2(R,3,5),ri2(R,2,4),'.',R,.25);
    F.blob(bx-3,ey,5,4,'.',R,.1);F.blob(W-4,ey,4,3,'.',R,.1);F.blob(3,sy,4,3,'.',R,.1);
  }
  // grass, trees, rocks, flowers
  for(let y=2;y<H-2;y++)for(let x=2;x<W-2;x++){
    if(F.g[y][x]!=='.')continue;
    if(n3(x,y)>.52)F.g[y][x]=',';
    else if(n1(x,y)>.8&&th!=='cave')F.g[y][x]=R()<.6?'T':'t';
    else if(n1(x,y)>.75&&R()<.3)F.g[y][x]=th==='cave'||th==='void'?'P':'t';
    else if(R()<.02)F.g[y][x]='R';
    else if(R()<.045)F.g[y][x]=th==='cave'?'r':'f';
  }
  // road: clear around it, bridges over water
  path.forEach(([x,y])=>{for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const yy=y+j,xx=x+i;if(yy>0&&yy<H-1&&xx>0&&xx<W-1&&'TtRP#'.includes(F.g[yy][xx]))F.g[yy][xx]=(th==='heights'||th==='void')&&F.g[yy][xx]==='#'?'~':'.';}});
  path.forEach(([x,y])=>{F.g[y][x]=F.g[y][x]==='~'?'B':'=';});
  if(ctx.part)path.ends=addTrails(F,R,path,bx,th);
  return path;
}
function genField(s,part){const r=genFieldRaw(s,part);r.bld=stampBuildings(r.rows);return r;}
function genFieldRaw(s,part){
  const th=ZS(s).theme,R=mulberry(G.run.seed+9001+s*131+(part===1?7001:0)),ctx=fieldBase(s,R,th,part),{F,W,H,sy,ey,bx}=ctx,first=ctx.part===1,first3=ctx.part===3;
  const path=genFieldShape(s,R,th,ctx);
  const onPath={};path.forEach(([x,y])=>{onPath[x+','+y]=1;});
  const nearPath=(x,y,d)=>{for(let j=-d;j<=d;j++)for(let i=-d;i<=d;i++)if(onPath[(x+i)+','+(y+j)])return true;return false;};
  // landmarks
  const chests=[];
  (first3?LANDMARKS[th].concat(LANDMARKS[th]):LANDMARKS[th]).forEach(name=>{const S=STAMPS[name],sh=S.length,sw=S[0].length;
    for(let t=0;t<80;t++){const x0=ri2(R,3,bx-sw-3),y0=ri2(R,3,H-sh-3);let ok=true;
      for(let j=-1;j<=sh&&ok;j++)for(let i=-1;i<=sw&&ok;i++){const c=F.g[y0+j][x0+i];if(!'.,f'.includes(c)||nearPath(x0+i,y0+j,1))ok=false;}
      if(!ok)continue;
      for(let j=0;j<sh;j++)for(let i=0;i<sw;i++){const c=S[j][i];F.g[y0+j][x0+i]=c==='.'?'.':c;if(c==='C')chests.push([x0+i,y0+j]);}break;}});
  (path.ends||[]).forEach(([x,y])=>{if('.,f'.includes(F.g[y][x])||F.g[y][x]==='='){F.g[y][x]='C';chests.push([x,y]);}});
  if(first){
    // first field: an open road east into the second field, no gate, no dungeon
    for(let x=bx;x<W;x++){F.g[ey][x]='=';for(const dy of [-1,1])if(SOLID.includes(F.g[ey+dy][x])&&x>=W-3)F.g[ey+dy][x]='#';}
    F.g[sy][0]='=';F.g[sy][1]='=';F.g[ey][W-1]='=';F.g[ey][W-2]='=';
  }else{
  // sealed gate: walls on land across two columns, gate on the road
  for(let y=0;y<H;y++){[bx,bx+1].forEach(x=>{if(y!==ey&&!'~'.includes(F.g[y][x]))F.g[y][x]='Z';});}
  if(F.g[ey-1][bx]==='Z')F.g[ey-1][bx]='Y';if(F.g[ey+1][bx]==='Z')F.g[ey+1][bx]='Y';
  F.g[ey][bx]='G';F.g[ey][bx+1]='=';
  for(let x=bx+2;x<W-2;x++)for(let y=2;y<H-2;y++){if(Math.abs(y-ey)>1&&!'~'.includes(F.g[y][x]))F.g[y][x]=Math.abs(y-ey)>2?(th==='heights'||th==='void'?'~':'#'):'t';}
  F.g[sy][0]='=';F.g[sy][1]='=';
  if(first3){
    // v0.4.0 5.2: canonical frame has the road entering on the west edge. The way on leaves east, or bends north or south after the gate (the whole map is turned later).
    const bend=fieldEndSide(s);ctx.endSide=bend;
    if(s>=4){F.g[ey][W-1]='#';F.g[ey][W-2]='#';}
    else if(bend==='e'){F.g[ey][W-1]='=';F.g[ey][W-2]='=';}
    else{const ex=bx+4,top=bend==='n';
      for(let y=top?0:ey;y<=(top?ey:H-1);y++)for(let x=ex-1;x<=ex+1;x++)F.g[y][x]=x===ex?'=':'.';
      for(let x=bx+2;x<=ex+1;x++){F.g[ey][x]='=';}
      // v0.16.3: the lane past the bend is closed off, so the only way on is the road north or south (the owner saw "two roads" after the gate)
      for(let x=ex+2;x<W;x++)for(let y=ey-1;y<=ey+1;y++)if(F.g[y]&&!'~'.includes(F.g[y][x]))F.g[y][x]=th==='heights'||th==='void'?'~':'#';
      ctx.endAt=[ex,top?0:H-1];}
    if(s>=4)for(let x=bx+3;x<W;x++)for(let y=ey-1;y<=ey+1;y++)if(F.g[y]&&!'~'.includes(F.g[y][x]))F.g[y][x]=th==='heights'||th==='void'?'~':'#';// v0.16.3: the Calamity field's lane ends two tiles past the seal
  }else if(s<4){F.g[ey][W-1]='=';F.g[ey][W-2]='=';}else{F.g[ey][W-1]='#';F.g[ey][W-2]='#';}
  }
  // the dungeon entrance hides somewhere off the road; its spot changes every playthrough
  let reach=flood(F.g,2,sy,bx,c=>!SOLID.includes(c));let ent=null;
  if(!first){
  const cands=[];
  for(let y=4;y<=H-6;y++)for(let x=6;x<=bx-4;x++){
    if(!reach[y+1]||!reach[y+1][x])continue;
    let ok=true;for(let j=-2;j<=1&&ok;j++)for(let i=-2;i<=2&&ok;i++){const c=F.get(x+i,y+j);if(!'.,f'.includes(c)||nearPath(x+i,y+j,1))ok=false;}
    if(ok)cands.push([x,y]);}
  // Beta v0.2.0: keep it well away from the town gate. Walking distance from the west entry must be at least
  // ENT_MIN of the road's length; on narrow maps the bar drops in steps, and failing that the farthest spot wins.
  if(cands.length){const D=walkDist(F.g,2,sy,bx),dOf=([x,y])=>D[y+1]&&D[y+1][x]>=0?D[y+1][x]:-1,L=path.filter(([x])=>x<bx).length;
    let pool=cands.filter(c=>dOf(c)>=L*ENT_MIN);
    if(first3){const far=pool.filter(c=>dOf(c)>=L*.62);if(far.length>=4)pool=far;}
    // v0.11.1 (new journeys): the lair sits in the final third of the route
    if(typeof lay3On==='function'&&lay3On()){const dEnd=Math.max(1,...path.filter(([x])=>x<bx).map(c=>Math.max(0,dOf(c)))),fin=pool.filter(c=>dOf(c)>=dEnd*2/3);if(fin.length)pool=fin;}
    // narrow map: accept a tighter clearing (3x3 instead of 5x4) as long as it is far enough
    if(!pool.length)for(let y=4;y<=H-6;y++)for(let x=6;x<=bx-4;x++){if(!reach[y+1]||!reach[y+1][x]||dOf([x,y])<L*ENT_MIN)continue;
      let ok=true;for(let j=-1;j<=1&&ok;j++)for(let i=-1;i<=1&&ok;i++){const c=F.get(x+i,y+j);if(!'.,f'.includes(c)||nearPath(x+i,y+j,1))ok=false;}if(ok)pool.push([x,y]);}
    // still nothing: fall through to the spot beside the sealed gate, the far end of the field
    cands.length=0;pool.forEach(c=>cands.push(c));}
  if(cands.length){const [x,y]=cands[Math.floor(R()*cands.length)];F.rect(x-1,y-1,3,1,'U');F.put(x-1,y,'U');F.put(x+1,y,'U');F.put(x,y,'E');ent=[x,y];}
  if(!ent){const x=bx-6,y=ey-3;F.rect(x-2,y-1,5,2,'.');F.rect(x-1,y-1,3,1,'U');F.put(x-1,y,'U');F.put(x+1,y,'U');F.put(x,y,'E');for(let yy=y+1;yy<ey;yy++)F.put(x,yy,F.get(x,yy)==='~'?'B':'=');ent=[x,y];}
  }
  // v0.4.0 5.3: a side cave off a branch trail, well away from the dungeon entrance
  let cave=null;
  if(first3&&caveStage(s)){cave=placeCaveMouth(F,R,path,ent,bx,sy,H,nearPath);}
  reach=flood(F.g,2,sy,bx);
  // drop landmark chests that ended up in sealed pockets
  const reachS=flood(F.g,2,sy,bx,c=>!SOLID.includes(c));
  for(let i=chests.length-1;i>=0;i--){const [cx,cy]=chests[i];if(![[0,1],[1,0],[0,-1],[-1,0]].some(([a,b])=>reachS[cy+b]&&reachS[cy+b][cx+a])){F.g[cy][cx]='.';chests.splice(i,1);}}
  const spots=[];for(let y=3;y<H-3;y++)for(let x=3;x<bx-2;x++){if(reachS[y][x]&&(F.g[y][x]===','||F.g[y][x]==='.')&&!nearPath(x,y,3)&&!(ent&&Math.abs(x-ent[0])<=2&&y>=ent[1]-2&&y<=ent[1]+3)&&!(cave&&Math.abs(x-cave[0])<=2&&y>=cave[1]-2&&y<=cave[1]+3))spots.push([x,y]);}
  const corridor=(x,y)=>{const sol=(i,j)=>SOLID.includes(F.get(x+i,y+j));return (sol(-1,0)&&sol(1,0))||(sol(0,-1)&&sol(0,1))||[[-1,0],[1,0],[0,-1],[0,1]].filter(([i,j])=>sol(i,j)).length>=2;};
  while(chests.length<(first3?9:ctx.part?5:3)&&spots.length){const k=Math.floor(R()*spots.length);const [cx,cy]=spots.splice(k,1)[0];if(corridor(cx,cy))continue;F.g[cy][cx]='C';chests.push([cx,cy]);for(let j=spots.length-1;j>=0;j--)if(Math.abs(spots[j][0]-cx)+Math.abs(spots[j][1]-cy)<10)spots.splice(j,1);}
  if('.,f'.includes(F.g[sy-1][3])&&!corridor(3,sy-1))F.g[sy-1][3]='S';
  // final pass: nothing placed may seal a pocket; drop any chest the hero cannot reach
  {const fin=flood(F.g,2,sy,bx,c=>!SOLID.includes(c));for(let i=chests.length-1;i>=0;i--){const [cx,cy]=chests[i];if(![[0,1],[1,0],[0,-1],[-1,0]].some(([a,b])=>fin[cy+b]&&fin[cy+b][cx+a])){F.g[cy][cx]='.';chests.splice(i,1);}}}
  // guarantee the entrance is reachable: if anything sealed it, dig the shortest way back to the reachable area
  [ent,cave].forEach(ent=>{if(ent){const fin=flood(F.g,2,sy,bx,c=>!SOLID.includes(c)),sx=ent[0],sy2=ent[1]+1;
   if(!fin[sy2]||!fin[sy2][sx]){const prev={},Q=[[sx,sy2]];prev[sx+','+sy2]=null;let end=null;
    while(Q.length&&!end){const [x,y]=Q.shift();for(const [dx,dy] of [[0,1],[1,0],[-1,0],[0,-1]]){const nx=x+dx,ny=y+dy,k=nx+','+ny;if(k in prev||nx<2||ny<2||nx>=bx-1||ny>=H-2)continue;if('UEZYG'.includes(F.g[ny][nx]))continue;prev[k]=x+','+y;if(fin[ny][nx]){end=k;break;}Q.push([nx,ny]);}}
    for(let k=end;k;k=prev[k]){const [x,y]=k.split(',').map(Number);const c=F.g[y][x];if(SOLID.includes(c)){F.g[y][x]=c==='~'?'B':'.';const ci=chests.findIndex(q=>q[0]===x&&q[1]===y);if(ci>=0)chests.splice(ci,1);}}}}});
  const free=spots.filter(([x,y])=>F.g[y][x]===','||F.g[y][x]==='.');
  return {rows:F.g,sy,ey,bx,chests,ent,free,cave,endAt:ctx.endAt||null,endSide:ctx.endSide||'e',W,H};
}
function stampBuildings(g){
  const out=[],seen={};
  for(let y=0;y<g.length;y++)for(let x=0;x<g[0].length;x++){const c=g[y][x];if((c==='H'||c==='A')&&!seen[x+','+y]){
    let w=0;while(g[y][x+w]===c)w++;let h=0;while(g[y+h]&&g[y+h][x]===c)h++;
    for(let j=0;j<h;j++)for(let i=0;i<w;i++){seen[(x+i)+','+(y+j)]=1;g[y+j][x+i]='H';}
    out.push({k:c==='A'?'tower':'house',x,y,w,h,door:[x+Math.floor((w-1)/2),y+h-1]});}}
  return out;
}

// =================== DUNGEONS ===================
// Rooms on a left-to-right chain. The boss room (Scourge or Calamity) hangs off the last room behind a locked door; a barred vault hangs off a side room.
// Every layout is checked with a flood fill and regenerated until the puzzle works.
function buildDungeon(R,th){
  const v2=worldV2(),W=v2?60:44,H=v2?40:32,MAXR=v2?15:10,D=new Gr(W,H,'#'),rooms=[];
  const ov=(r,o,p)=>r.x<o.x+o.w+p&&r.x+r.w+p>o.x&&r.y<o.y+o.h+p&&r.y+r.h+p>o.y;
  const boss={x:W-12,y:ri2(R,8,H-17),w:9,h:8};rooms.push(boss);
  const start={x:2,y:ri2(R,8,H-15),w:7,h:6};rooms.push(start);
  for(let t=0;t<(v2?900:400)&&rooms.length<MAXR;t++){const r={x:ri2(R,2,W-21),y:ri2(R,2,H-9),w:ri2(R,5,8),h:ri2(R,4,6)};if(!rooms.some(o=>ov(r,o,2)))rooms.push(r);}
  rooms.forEach(r=>D.rect(r.x,r.y,r.w,r.h,'.'));
  const cen=r=>[r.x+Math.floor(r.w/2),r.y+Math.floor(r.h/2)];
  const inR=(x,y,r,p)=>x>=r.x-p&&x<r.x+r.w+p&&y>=r.y-p&&y<r.y+r.h+p;
  const forbid=[boss];
  const lpath=(x0,y0,x1,y1,hfirst)=>{const P=[];let x=x0,y=y0;P.push([x,y]);
    if(hfirst){while(x!==x1){x+=Math.sign(x1-x);P.push([x,y]);}while(y!==y1){y+=Math.sign(y1-y);P.push([x,y]);}}
    else{while(y!==y1){y+=Math.sign(y1-y);P.push([x,y]);}while(x!==x1){x+=Math.sign(x1-x);P.push([x,y]);}}return P;};
  const carve=(a,b,extraForbid)=>{const [x0,y0]=cen(a),[x1,y1]=cen(b);const fb=forbid.concat(extraForbid||[]).filter(r=>r!==a&&r!==b);
    const opts=R()<.5?[true,false]:[false,true];
    for(const h of opts){const P=lpath(x0,y0,x1,y1,h);if(P.some(([x,y])=>fb.some(r=>inR(x,y,r,1))))continue;P.forEach(([x,y])=>{if(D.get(x,y)==='#')D.put(x,y,'.');});return P;}
    return null;};
  const others=rooms.filter(r=>r!==boss&&r!==start).sort((a,b)=>a.x-b.x);
  if(others.length<4)return null;
  const chain=[start].concat(others.slice(0,Math.max(3,Math.ceil(others.length*.6))));
  const side=others.filter(r=>!chain.includes(r));
  const vault=side.length>=2?side[side.length-1]:null;if(vault)forbid.push(vault);
  for(let i=0;i+1<chain.length;i++)if(!carve(chain[i],chain[i+1]))return null;
  side.forEach(r=>{if(r===vault)return;let ok=false;for(let k=0;k<4&&!ok;k++)ok=!!carve(r,chain[Math.floor(R()*chain.length)]);if(!ok)return;});
  // v0.3.5 6.3: loops. Extra corridors join rooms that are already linked, so the dungeon has more than one way round (and shortcuts back).
  if(v2){const pool=rooms.filter(r=>r!==boss&&r!==start&&r!==vault);for(let k=0;k<3&&pool.length>3;k++){const a=pool[Math.floor(R()*pool.length)],b=pool[Math.floor(R()*pool.length)];if(a!==b&&Math.abs(cen(a)[0]-cen(b)[0])+Math.abs(cen(a)[1]-cen(b)[1])<34)carve(a,b);}}
  // boss corridor: ends in a door set into the boss room's west wall
  const ante=chain.reduce((a,b)=>cen(b)[0]>cen(a)[0]?b:a),bc=cen(boss),ey=bc[1],ex=boss.x-1;
  const ac=cen(ante);
  const P=lpath(ac[0],ac[1],ex-1,ey,true);if(P.some(([x,y])=>inR(x,y,boss,1)||(vault&&inR(x,y,vault,1))))return null;
  P.forEach(([x,y])=>{if(D.get(x,y)==='#')D.put(x,y,'.');});D.put(ex,ey,'D');
  // vault behind bars, hung off a side or chain room
  const chests=[];
  if(vault){const host=side.find(r=>r!==vault)||chain[1];const vc=cen(vault),hc=cen(host);
    const fb=[boss];let VP=null;for(const h of [true,false]){const Q=lpath(hc[0],hc[1],vc[0],vc[1],h);if(!Q.some(([x,y])=>inR(x,y,boss,1))){VP=Q;break;}}
    if(!VP)return null;VP.forEach(([x,y])=>{if(D.get(x,y)==='#')D.put(x,y,'.');});
    let bar=null;for(let i=VP.length-1;i>=0;i--){const [x,y]=VP[i];if(!inR(x,y,vault,0)){bar=[x,y];break;}}
    if(!bar)return null;D.put(bar[0],bar[1],'|');D.put(vc[0],vc[1],'C');chests.push([vc[0],vc[1],'vault']);
    const lr=chain[1];D.put(lr.x,lr.y,'l');}
  // the key waits in a side room (or deep in the chain)
  const keyRoom=side.find(r=>r!==vault)||chain[chain.length-2];D.put(keyRoom.x+keyRoom.w-1,keyRoom.y,'K');
  chain.slice(1).forEach((r,i)=>{if(i%2===0&&D.get(r.x+r.w-1,r.y+r.h-1)==='.'){D.put(r.x+r.w-1,r.y+r.h-1,'C');chests.push([r.x+r.w-1,r.y+r.h-1]);}});
  const sc=cen(start);D.put(sc[0],start.y,'E');D.put(bc[0],bc[1]-1,'X');
  // decor in room corners; rejected by validation if it blocks anything
  rooms.forEach(r=>{if(r===start)return;const dec=th==='cave'?'v':th==='meadow'&&R()<.2?'g':'P';if(r.w>=6&&r.h>=5){if(D.get(r.x,r.y+r.h-1)==='.')D.put(r.x,r.y+r.h-1,dec);}
    for(let i=0;i<2;i++){const x=ri2(R,r.x,r.x+r.w-1),y=ri2(R,r.y,r.y+r.h-1);if(D.get(x,y)==='.'&&R()<.6)D.put(x,y,'r');}});
  [[boss.x,boss.y+boss.h-1],[boss.x+boss.w-1,boss.y+boss.h-1],[boss.x,boss.y],[boss.x+boss.w-1,boss.y]].forEach(([x,y])=>D.put(x,y,'v'));
  const wroom=side.find(r=>r!==vault&&r!==keyRoom)||keyRoom;
  return {rows:D.g,start:[sc[0],start.y+1],boss:[bc[0],bc[1]-1],chests,wander:[wroom.x,wroom.y+wroom.h-1]};
}
function dungeonOk(d){
  const g=d.rows,H=g.length,W=g[0].length;
  const fl=(extra)=>{const seen=g.map(r=>r.map(()=>false)),st=[d.start.slice()];const ok=c=>!SOLID.includes(c)||extra.includes(c);
    while(st.length){const [x,y]=st.pop();if(x<0||y<0||x>=W||y>=H||seen[y][x])continue;if(!ok(g[y][x]))continue;seen[y][x]=true;st.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);}return seen;};
  const adj=(S,x,y)=>[[0,1],[1,0],[0,-1],[-1,0]].some(([a,b])=>S[y+b]&&S[y+b][x+a]);
  const find=c=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(g[y][x]===c)return [x,y];return null;};
  const S1=fl(''),S2=fl('D'),S3=fl('D|');
  const key=find('K'),lev=find('l');
  if(d.keyBarred){const SB=fl('|');if(!key||adj(S1,key[0],key[1])||!adj(SB,key[0],key[1]))return false;if(!lev||!adj(S1,lev[0],lev[1]))return false;}
  else if(!key||!adj(S1,key[0],key[1]))return false;
  if(adj(S1,d.boss[0],d.boss[1])||!adj(S2,d.boss[0],d.boss[1]))return false;
  if(lev&&!adj(S1,lev[0],lev[1]))return false;
  if(!d.chests.some(c=>c[2]==='vault'))return false;
  if(d.chests.some(([x,y,k])=>k==='vault'?(adj(S2,x,y)||!adj(S3,x,y)):!adj(S1,x,y)))return false;
  if(!S1[d.wander[1]][d.wander[0]])return false;
  if(g[d.wander[1]][d.wander[0]]!=='.'&&g[d.wander[1]][d.wander[0]]!=='r')return false;
  return true;
}
function genDungeon(s){
  const th=ZS(s).theme;
  // Beta v0.3.0: an accepted layout is the same one older builds made (so saves keep their place), then fixDungeon clears
  // any decor on or beside the progress routes and moves the lost wayfarer off them. Only a layout that still fails is rerolled.
  for(let a=0;a<(worldV3()?200:80);a++){const R=mulberry(G.run.seed+777+s*53+a*101);const d=worldV3()?buildDungeon3(R,th,s):buildDungeon(R,th);if(d&&dungeonOk(d)){fixStairs(d);if(fixDungeon(d))return d;}}
  throw new Error('dungeon generation failed');
}
// ----- dungeon validation (Beta v0.3.0) -----
const DUN_DECOR='PvgNQL';
function dunBfs(g,start,pass,block){const H=g.length,W=g[0].length,P=g.map(r=>r.map(()=>null)),Q=[start];P[start[1]][start[0]]=start;
  for(let q=0;q<Q.length;q++){const [x,y]=Q[q];for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=W||ny>=H||P[ny][nx])continue;
    if(block&&block[0]===nx&&block[1]===ny)continue;if(SOLID.includes(g[ny][nx])&&!pass.includes(g[ny][nx]))continue;P[ny][nx]=[x,y];Q.push([nx,ny]);}}return P;}
function dunTargets(d){const g=d.rows,find=c=>{for(let y=0;y<g.length;y++)for(let x=0;x<g[0].length;x++)if(g[y][x]===c)return [x,y];return null;};
  // [tile, doors that may be open on the way] in the order the player needs them: key and lever first, then the boss door, then the vault
  const T=[['exit',find('E'),''],['key',find('K'),d.keyBarred?'|':''],['lever',find('l'),''],['door',find('D'),'']];
  d.chests.forEach(c=>T.push([c[2]==='vault'?'vault':'chest',[c[0],c[1]],c[2]==='vault'?'D|':'']));
  T.push(['boss',d.boss,'D']);T.push(['echo',d.boss,'D']);return T.filter(t=>t[1]);}
// which targets the player cannot reach (4-way, so diagonal corner rules never matter), with the wayfarer standing at d.wander
// v0.4.0 1.5: the way out ('E', the stairs) is a protected tile. Every target must stay reachable with the stairs treated as a wall,
// and no route the player needs may run beside them (the start tile that hangs off the stairs is the one allowed neighbour).
function stairsBad(d){
  const g=d.rows,H=g.length,W=g[0].length;let E=null;for(let y=0;y<H&&!E;y++)for(let x=0;x<W;x++)if(g[y][x]==='E'){E=[x,y];break;}
  if(!E)return ['stairs-missing'];
  const bad=[],st=d.start,keep=g[E[1]][E[0]];g[E[1]][E[0]]='#';
  try{
    const near=new Set();[[0,1],[1,0],[0,-1],[-1,0]].forEach(([a,b])=>near.add((E[0]+a)+','+(E[1]+b)));
    dunTargets(d).forEach(([k,p,pass])=>{if(k==='exit')return;const P=dunBfs(g,st,pass,null);
      const nb=[[0,1],[1,0],[0,-1],[-1,0]].map(([a,b])=>[p[0]+a,p[1]+b]).find(([x,y])=>P[y]&&P[y][x]);
      if(!nb){bad.push('stairs-on-route:'+k);return;}
      let c=nb;while(c){if(near.has(c[0]+','+c[1])&&!(c[0]===st[0]&&c[1]===st[1])){bad.push('stairs-beside-route:'+k);break;}const pr=P[c[1]][c[0]];if(!pr||(pr[0]===c[0]&&pr[1]===c[1]))break;c=pr;}});
  }finally{g[E[1]][E[0]]=keep;}
  // the start tile must be right next to the stairs, or the player could not walk back out
  if(Math.abs(E[0]-st[0])+Math.abs(E[1]-st[1])!==1)bad.push('stairs-detached');
  return bad;
}
// Move the stairs into a rock alcove off the start room when they sit on or beside a needed route. Leaves a safe layout exactly as it was.
function fixStairs(d){
  if(!stairsBad(d).length)return false;
  const g=d.rows,H=g.length,W=g[0].length;let E=null;for(let y=0;y<H&&!E;y++)for(let x=0;x<W;x++)if(g[y][x]==='E'){E=[x,y];break;}
  if(!E)return false;const old=d.start.slice(),sx=old[0],sy=old[1];
  const cands=[];for(let y=Math.max(1,sy-9);y<Math.min(H-1,sy+9);y++)for(let x=Math.max(1,sx-8);x<Math.min(W-1,sx+8);x++){
    if(g[y][x]!=='#')continue;const nb=[[0,1],[1,0],[0,-1],[-1,0]].map(([a,b])=>[x+a,y+b]),fl=nb.filter(([a,b])=>g[b]&&g[b][a]==='.'),wall=nb.filter(([a,b])=>g[b]&&g[b][a]==='#');
    if(fl.length===1&&wall.length===3){const [fx,fy]=fl[0];
      // the floor tile must be a room tile (open on at least five of its eight sides) so the player is not stepping out of a corridor
      let open=0;for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++)if((i||j)&&g[fy+j]&&g[fy+j][fx+i]&&!SOLID.includes(g[fy+j][fx+i]))open++;
      if(open>=5)cands.push({x,y,fx,fy,dist:Math.abs(fx-sx)+Math.abs(fy-sy)});}}
  cands.sort((a,b)=>a.dist-b.dist);
  g[E[1]][E[0]]='.';
  for(const c of cands){g[c.y][c.x]='E';d.start=[c.fx,c.fy];
    if(!stairsBad(d).length&&!validateDungeon(d).length){d.stairsMoved=true;return true;}
    g[c.y][c.x]='#';}
  g[E[1]][E[0]]='E';d.start=old;return false;
}
function validateDungeon(d){
  const g=d.rows,bad=[],adjOf=(P,p)=>[[0,1],[1,0],[0,-1],[-1,0]].some(([a,b])=>P[p[1]+b]&&P[p[1]+b][p[0]+a]);
  const st=d.start;if(SOLID.includes(g[st[1]][st[0]]))bad.push('start');
  if(![[1,0],[-1,0],[0,1]].some(([a,b])=>g[st[1]+b]&&!SOLID.includes(g[st[1]+b][st[0]+a])))bad.push('start walled');
  dunTargets(d).forEach(([k,p,pass])=>{const P=dunBfs(g,st,pass,d.wander);if(!adjOf(P,p))bad.push(k);});
  // the wayfarer must stand somewhere reachable that cuts nothing off
  const P0=dunBfs(g,st,'D|',null);if(!P0[d.wander[1]][d.wander[0]])bad.push('wanderer');
  stairsBad(d).forEach(b=>bad.push(b));
  if(d.keyBarred)leverOrderBad(d).forEach(b=>bad.push(b));
  return bad;
}
function fixDungeon(d){
  const g=d.rows,H=g.length,W=g[0].length,prot=g.map(r=>r.map(()=>false)),fixed={};
  // protect the shortest route to every target, plus the stairs, the start and the boss door's approach
  const mark=(x,y)=>{if(y>=0&&y<H&&x>=0&&x<W)prot[y][x]=true;};
  dunTargets(d).forEach(([k,p,pass])=>{const P=dunBfs(g,d.start,pass,null);
    const nb=[[0,1],[1,0],[0,-1],[-1,0]].map(([a,b])=>[p[0]+a,p[1]+b]).find(([x,y])=>P[y]&&P[y][x]);if(!nb)return;
    let c=nb;while(c){mark(c[0],c[1]);const pr=P[c[1]][c[0]];if(!pr||(pr[0]===c[0]&&pr[1]===c[1]))break;c=pr;}});
  mark(d.start[0],d.start[1]);
  // decor may not sit on or beside a protected tile
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(!DUN_DECOR.includes(g[y][x]))continue;let near=false;
    for(let j=-1;j<=1&&!near;j++)for(let i=-1;i<=1&&!near;i++)if(prot[y+j]&&prot[y+j][x+i])near=true;
    if(near){fixed[g[y][x]]=(fixed[g[y][x]]||0)+1;g[y][x]='.';}}
  // the lost wayfarer stands on open floor with all eight neighbours clear, off every route
  const W0=d.wander,okSpot=(x,y)=>g[y]&&(g[y][x]==='.'||g[y][x]==='r')&&!prot[y][x]&&[[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]].every(([i,j])=>!SOLID.includes(g[y+j][x+i]));
  if(!okSpot(W0[0],W0[1])||validateDungeon(d).includes('wanderer')||validateDungeon(d).length){
    const P0=dunBfs(g,d.start,'D|',null);let best=null;
    for(let y=1;y<H-1&&!best;y++)for(let x=1;x<W-1;x++){if(okSpot(x,y)&&P0[y][x]&&(Math.abs(x-d.start[0])+Math.abs(y-d.start[1])>6)){const t=d.wander;d.wander=[x,y];if(!validateDungeon(d).length){best=[x,y];break;}d.wander=t;}}
    if(best&&(best[0]!==W0[0]||best[1]!==W0[1]))fixed.wanderer=1;}
  d.fixed=fixed;
  return validateDungeon(d).length===0;
}

// =================== MAP ASSEMBLY ===================
// v5.0: town gates and field edge exits are three tiles wide, so they are easy to hit on a phone or moving diagonally.
// The rows above and below the gate road are opened up to three tiles in, and each gets its own exit.
function widenGate(m,x,y,inward,proto){
  const H=m.t.length,W=m.t[0].length;
  for(const dy of [-1,1]){const yy=y+dy;if(yy<1||yy>=H-1)continue;
    let ok=true;for(let k=0;k<3;k++){const xx=x+inward*k;if(xx<0||xx>=W)continue;if(m.t[yy][xx]==='H'||m.bld.some(b=>xx>=b.x&&xx<b.x+b.w&&yy>=b.y&&yy<b.y+b.h))ok=false;}
    if(!ok)continue;
    for(let k=0;k<3;k++){const xx=x+inward*k,c=m.t[yy][xx];if('SWqCKEXG'.includes(c))continue;if(SOLID.includes(c)||c==='~'||c==='#'){m.t[yy][xx]=m.t[y][xx]==='B'?'B':(m.kind==='town'?'=':m.t[y][xx]);}}
    if(!m.exits.some(e=>e.x===x&&e.y===yy))m.exits.push(Object.assign({},proto,{x,y:yy}));
    // keep a tower or cliff framing the wider gate
    const fy=y+dy*2;if(m.kind==='town'&&fy>0&&fy<H-1&&!SOLID.includes(m.t[fy][x]))m.t[fy][x]='Y';
  }
  m.npcs=m.npcs.filter(n=>!(Math.abs(n.y-y)<=1&&Math.abs(n.x-x)<=2));
}
function getMap(id){
  if(MAPS[id])return MAPS[id];
  if(id==='a0')return MAPS[id]=buildArchive();
  if(id==='s0')return MAPS[id]=buildSanctum();
  const s=+id.slice(1),kind=id[0]==='t'?'town':(id[0]==='f'||id[0]==='g')?'field':'dungeon',Z=ZS(s);
  const m={id,z:s,s,kind,theme:Z.theme,exits:[],npcs:[],bld:[],signs:{}};
  if(kind==='town'){
    const t=townGen(Z,s,mulberry(500+s*41+realmOf(s)));m.t=t.g;m.bld=t.bld;m.road=t.road;m.arch=t.arch||null;m.sty=t.sty||null;
    const W=m.t[0].length;
    const v3=worldV3();
    m.exits.push({x:0,y:t.road,to:s>0?(v3?{m:'f'+(s-1),g:'end'}:{m:'f'+(s-1),side:'e'}):null,msg:`The west road from ${Z.town} is closed. Your path runs east.`});
    m.exits.push({x:W-1,y:t.road,to:v3?{m:'f'+s,g:'start'}:{m:(worldV2()?'g':'f')+s,side:'w'}});
    let G3=null;if(v3)G3=townGates3(m,s);
    // v0.4.3: every town gate is joined to the town's roads, and no tree, bush or crate stands in the way
    try{townLinkGates(m);}catch(e){}
    // v0.4.1 4.9: a tree or bush never stands on a doorstep (new realms put every town layout at every stage)
    m.bld.forEach(b=>{if(!b.door)return;const y=b.door[1]+1,x=b.door[0];if(m.t[y]&&'tbx'.includes(m.t[y][x]))m.t[y][x]='.';});
    const dn=g=>G3&&G3[g]?SIDE_NAME[G3[g].side]:null;
    const cap=x=>x[0].toUpperCase()+x.slice(1);
    m.signs[(W-3)+','+(t.road+1)]=v3?`${Z.town}. ${cap(dn('next')||'east')}: ${Z.n}.`+(s>0?` ${cap(dn('prev')||'west')}: ${ZS(s-1).n}.`:''):`${Z.town}. East: ${Z.n}.${s>0?' West: '+ZS(s-1).n+'.':''}`;
    const R=mulberry(77+s*3+realmOf(s)),free=[];m.t.forEach((r,y)=>{r.forEach((c,x)=>{if((c===':'||c==='.')&&x>2&&x<W-3&&y>1&&y<m.t.length-2&&y!==t.road)free.push([x,y]);});});
    const used={};const take=()=>{for(let i=0;i<60;i++){const p=free[Math.floor(R()*free.length)];if(p&&!used[p]&&!m.bld.some(b=>b.door[0]===p[0]&&Math.abs(b.door[1]+1-p[1])<=1)){used[p]=1;return p;}}return free[0];};
    Z.npc.forEach(n=>{const p=take();m.npcs.push({x:p[0],y:p[1],hx:p[0],hy:p[1],name:n[0],line:n[1],look:villagerLook(n[0]),view:'front',face:'r',wander:true});});
    TOWNFOLK.forEach(n=>{const p=take();m.npcs.push({x:p[0],y:p[1],hx:p[0],hy:p[1],name:n[0],line:n[1](Z,s),look:villagerLook(n[0]+s),view:'front',face:'r',wander:true});});
    const gl=[1,t.road+1],gr=[W-2,t.road+1],openW=!v3||(m.gates&&m.gates.prev&&m.gates.prev.side==='w')||s===0,openE=!v3||(m.gates&&m.gates.next&&m.gates.next.side==='e');
    if(openW&&!SOLID.includes(m.t[gl[1]][gl[0]]))m.npcs.push({x:gl[0],y:gl[1],name:'Gate guard',line:`Keep to the roads and keep your blade loose. ${Z.n} lies east.`,look:GUARD,view:'front',face:'r'});
    if(openE&&!SOLID.includes(m.t[gr[1]][gr[0]]))m.npcs.push({x:gr[0],y:gr[1],name:'Gate guard',line:'Past this gate the tall grass hides teeth. Rest at the inn first if you are hurt.',look:GUARD,view:'front',face:'l'});
    {const eW=m.exits.find(e=>e.x===0),eE=m.exits.find(e=>e.x===W-1);if(eW)widenGate(m,0,t.road,1,eW);if(eE)widenGate(m,W-1,t.road,-1,eE);}
    // v0.4.0 5.2: keep every gate's mouth and landing tile clear of townsfolk
    if(v3&&m.gates)Object.values(m.gates).forEach(g=>{if(!g.arrive)return;m.npcs=m.npcs.filter(n=>Math.abs(n.x-g.arrive[0])+Math.abs(n.y-g.arrive[1])>4&&Math.abs(n.x-g.x)+Math.abs(n.y-g.y)>3);});
    // guards step aside to flank the wider gates
    [[2,t.road+2,'r','Keep to the roads and keep your blade loose.',openW],[W-3,t.road+2,'l','Past this gate the tall grass hides teeth. Rest at the inn first if you are hurt.',openE]].forEach(([gx,gy,f,line,op])=>{if(op&&gy<m.t.length-1&&!SOLID.includes(m.t[gy][gx])&&m.t[gy][gx]!=='~'&&!m.npcs.some(n=>n.x===gx&&n.y===gy))m.npcs.push({x:gx,y:gy,name:'Gate guard',line,look:GUARD,view:'front',face:f});});
  }else if(kind==='field'){
    if(worldV3()){
      buildField3(m,s,Z);
      const dir=g=>m.gates[g]?DIR_NAME[m.gates[g].label]:'';
      m.signs[(m.gates.start.arrive[0]+(m.gates.start.side==='n'||m.gates.start.side==='s'?2:0))+','+(m.gates.start.arrive[1]+(m.gates.start.side==='w'||m.gates.start.side==='e'?-2:0))]=
        `${Z.n}. One long road, with side trails, landmarks and a few shortcuts. Foes hide in the tall grass; the road itself is safe. The ${Z.dungeon} lies somewhere along it.`+(m.caves.length?' Some trails hide older places.':'')+(s<4?` The gate to the ${dir('end')} stays sealed until the ${bossClass(bossKeyFor(s))} falls.`:' The Calamity waits at the bottom.');
    }else{
    const part=id[0]==='g'?1:worldV2()?2:0,f=genField(s,part);m.part=part;m.t=f.rows;m.sy=f.sy;m.ey=f.ey;m.bx=f.bx;m.chests=f.chests;m.ent=f.ent;m.free=f.free;m.bld=f.bld;
    // v5.1: narrow realms (the Hollow Star's platforms) can leave no spots far from the road; fall back to any reachable open tile off the road
    if(!m.free||m.free.length<10){const seen=flood(m.t,2,f.sy,f.bx,c=>!SOLID.includes(c)),out=[];m.t.forEach((r,y)=>r.forEach((c,x)=>{if(x>3&&x<f.bx-1&&seen[y][x]&&(c===','||c==='.')&&!(f.ent&&Math.abs(x-f.ent[0])<=1&&Math.abs(y-f.ent[1])<=2))out.push([x,y]);}));m.free=(m.free||[]).concat(out.filter((p,i)=>i%2===0));}
    m.exits.push({x:0,y:f.sy,to:{m:part===2?'g'+s:'t'+s,side:'e'}});
    if(part===1){m.exits.push({x:m.t[0].length-1,y:f.ey,to:{m:'f'+s,side:'w'}});}
    else if(s<4)m.exits.push({x:m.t[0].length-1,y:f.ey,to:{m:'t'+(s+1),side:'w'}});
    widenGate(m,0,f.sy,1,m.exits[0]);{const ee=m.exits.find(e=>e.x===m.t[0].length-1&&e.y===f.ey);if(ee)widenGate(m,m.t[0].length-1,f.ey,-1,ee);}
    if(part===1)m.signs['3,'+(f.sy-1)]=`${Z.n}, first stretch. Side trails lead to caches; the main road runs east to the deeper fields.`;
    else m.signs['3,'+(f.sy-1)]=`${Z.n}${part===2?', deeper fields':''}. Foes hide in the tall grass. The ${Z.dungeon} lies somewhere ahead; its ${s<4?bossClass(bossKeyFor(s)):'Calamity'} waits at the bottom.${s<4?' Until it falls, the eastern gate stays sealed.':''}`;
    }
  }else if(id[0]==='k'){buildCaveMap(m,s);
  }else{
    const d=genDungeon(s);m.t=d.rows;m.start=d.start;m.bossAt=d.boss;m.chests=d.chests;m.wander=d.wander;m.fixed=d.fixed;if(d.v3){m.v3=true;m.keyBarred=true;m.keyBar=d.keyBar;m.vaultBar=d.vaultBar;m.lever=d.lever;m.rooms=d.roomCount;m.route=d.route;m.leverInfo=d.leverInfo;m.rects=d.rects;m.startRect=d.startRect;}
  }
  m.w=m.t[0].length;m.h=m.t.length;
  if(kind!=='town')placeNodes(m);
  m.tone=valueNoise(mulberry(31+s*7+(kind==='town'?1:kind==='field'?2:3)),m.w,m.h,6);
  return MAPS[id]=m;
}
getMap=HOOK.def('getMap',getMap);// v0.9.9: one definition; modules add hooks (hooks.js)
// v0.12 (new journeys, new maps only): no building or tall decor hides a town gate. A building stands up in the picture (its roof is drawn
// above its footprint), so one right south of a gate on the top edge covers it. For every exit cell the three tiles south of it must be free of
// building footprints and tall decor (trees, lamps, pillars, standing stones): decor is removed, a building is moved one to three tiles
// (down first, then sideways, smallest move first) onto open ground, its doorstep kept clear and the town still connected (mapIssues).
// A building that cannot move is left as it is.
const TOWN_TALL='TtLPNy';
function townExitClear(m){if(!m||m.kind!=='town'||m.exitClear)return;m.exitClear=1;const g=m.t,H=g.length,W=g[0].length;
  const inB=(x,y,skip)=>m.bld.some(b=>b!==skip&&x>=b.x&&x<b.x+b.w&&y>=b.y&&y<b.y+b.h);
  const cells=(m.exits||[]).filter(e=>e.y<H-4);const front=[];cells.forEach(e=>{for(let j=1;j<=3;j++)front.push([e.x,e.y+j]);});
  front.forEach(([x,y])=>{if(y<H&&x>=0&&x<W&&TOWN_TALL.includes(g[y][x])&&!inB(x,y))g[y][x]='.';});// tall decor in front: removed
  const hit=()=>{const o=[];m.bld.forEach(b=>{if(front.some(([x,y])=>x>=b.x&&x<b.x+b.w&&y>=b.y&&y<b.y+b.h)&&!o.includes(b))o.push(b);});return o;};
  const ok=(b,nx,ny)=>{if(nx<2||ny<2||nx+b.w>W-2||ny+b.h>H-3)return false;
    for(let j=-1;j<=b.h;j++)for(let i=-1;i<=b.w;i++){const x=nx+i,y=ny+j,inOld=x>=b.x&&x<b.x+b.w&&y>=b.y&&y<b.y+b.h,inNew=i>=0&&i<b.w&&j>=0&&j<b.h;
      if(inOld&&inNew)continue;const c=(g[y]||[])[x];if(c==null)return false;
      if(inNew){if(inOld)continue;if(!(c==='.'||TOWN_DECOR.includes(c)))return false;if(inB(x,y,b)||m.npcs.some(n=>n.x===x&&n.y===y)||m.signs[x+','+y]!==undefined)return false;}
      else if(j===b.h&&i>=0&&i<b.w){if(SOLID.includes(c)&&!TOWN_DECOR.includes(c)&&!(x>=b.x&&x<b.x+b.w&&y>=b.y&&y<b.y+b.h))return false;}// the doorstep row stays open
      else if(inB(x,y,b))return false;}// no touching neighbours
    if(front.some(([x,y])=>x>=nx&&x<nx+b.w&&y>=ny&&y<ny+b.h))return false;return true;};
  hit().forEach(b=>{const base=(()=>{try{return typeof mapIssues==='function'?mapIssues(m).length:0;}catch(e){return 0;}})();
    const tries=[[0,1],[0,2],[0,3],[-1,0],[1,0],[-2,0],[2,0],[-3,0],[3,0],[-1,1],[1,1],[-1,2],[1,2],[-2,1],[2,1],[-2,2],[2,2]];
    for(const [dx,dy] of tries){const nx=b.x+dx,ny=b.y+dy;if(!ok(b,nx,ny))continue;
      const old={x:b.x,y:b.y,door:b.door.slice()},snap=[];
      for(let j=-1;j<=b.h+1;j++)for(let i=-1;i<=b.w+1;i++)for(const [bx,by] of [[old.x+i,old.y+j],[nx+i,ny+j]])if(g[by]&&g[by][bx]!=null&&!snap.some(q=>q[0]===bx&&q[1]===by))snap.push([bx,by,g[by][bx]]);
      for(let j=0;j<b.h;j++)for(let i=0;i<b.w;i++)g[old.y+j][old.x+i]='.';
      b.x=nx;b.y=ny;b.door=[old.door[0]+dx,old.door[1]+dy];for(let j=0;j<b.h;j++)for(let i=0;i<b.w;i++)g[ny+j][nx+i]='H';
      const dy2=b.door[1]+1,dx2=b.door[0];if(g[dy2]&&TOWN_DECOR.includes(g[dy2][dx2]))g[dy2][dx2]='.';
      let bad=false;try{if(typeof mapIssues==='function')bad=mapIssues(m).length>base;}catch(e){}
      if(bad||hit().includes(b)){snap.forEach(([x,y,c])=>{g[y][x]=c;});b.x=old.x;b.y=old.y;b.door=old.door;continue;}
      m.exitMoved=(m.exitMoved||0)+1;break;}});}
// when no building can move, the top edge gate itself slides along the wall (smallest slide first) to columns whose three tiles south are clear
// (decor removed), digging a short three wide lane down to open ground. The exits, the arrival tile and the gate record follow it.
function townGateSlide(m){const g=m.t,H=g.length,W=g[0].length,top=(m.exits||[]).filter(e=>e.y===0);if(top.length<2)return;
  const xs=top.map(e=>e.x).sort((p,q)=>p-q),mid=xs[Math.floor(xs.length/2)],rec=Object.values(m.gates||{}).find(q=>q&&q.cells&&q.cells.some(c=>c[1]===0&&xs.includes(c[0])));if(!rec)return;
  const inB=(x,y)=>m.bld.some(b=>x>=b.x&&x<b.x+b.w&&y>=b.y&&y<b.y+b.h),npc=(x,y)=>m.npcs.some(n=>n.x===x&&n.y===y);
  const walk=c=>!SOLID.includes(c)||TOWN_DECOR.includes(c)||TOWN_TALL.includes(c);
  const base=(()=>{try{return mapIssues(m).length;}catch(e){return 0;}})();
  const wallCh=(()=>{const cnt={};for(let x=0;x<W;x++){const c=g[0][x];if(SOLID.includes(c)&&c!=='Y')cnt[c]=(cnt[c]||0)+1;}return Object.keys(cnt).sort((p,q)=>cnt[q]-cnt[p])[0]||'Z';})();
  const cand=[];for(let a=5;a<W-5;a++)if(a!==mid)cand.push(a);cand.sort((p,q)=>Math.abs(p-mid)-Math.abs(q-mid));
  for(const a of cand.slice(0,24)){
    // the lane: three columns, from the border down to the first row that is open road or ground (at most 8 rows), no building, no npc on it
    let end=-1,bad=false;for(let d=1;d<=8&&!bad&&end<0;d++){for(let k=-1;k<=1;k++){const x=a+k,c=g[d][x];if(inB(x,d)||c==null||!walk(c)||npc(x,d)||m.signs[x+','+d]!==undefined){bad=true;break;}}
      if(!bad&&d>=3){const row=[-1,0,1].map(k=>g[d][a+k]);if(row.every(c=>c==='='||c==='.'))end=d;}}
    if(bad||end<0)continue;
    // nothing tall or building in the three tiles south of it, and a flank on each side must be wall
    if([-1,0,1].some(k=>[1,2,3].some(j=>inB(a+k,j))))continue;
    const snap=[];const keep=(x,y)=>{if(g[y]&&!snap.some(q=>q[0]===x&&q[1]===y))snap.push([x,y,g[y][x]]);};
    for(let y=0;y<=end;y++)for(let x=Math.min(a,mid)-3;x<=Math.max(a,mid)+3;x++)keep(x,y);
    const exs=m.exits.slice(),old=rec.cells.map(c=>c.slice()),q0={x:rec.x,y:rec.y,arrive:rec.arrive&&rec.arrive.slice()};
    xs.forEach(x=>{g[0][x]=wallCh;});
    for(let d=0;d<=end;d++)for(let k=-1;k<=1;k++){const x=a+k,c=g[d][x];if(d===0||TOWN_TALL.includes(c)||TOWN_DECOR.includes(c)||SOLID.includes(c))g[d][x]='=';}
    [a-2,a+2].forEach(x=>{if(g[0][x]!=null&&SOLID.includes(g[0][x]))g[0][x]='Y';});
    const proto=top[0];m.exits=m.exits.filter(e=>e.y!==0||!xs.includes(e.x));[-1,0,1].forEach(k=>m.exits.push(Object.assign({},proto,{x:a+k,y:0})));
    rec.cells=[-1,0,1].map(k=>[a+k,0]);if(rec.x!=null)rec.x=a;if(rec.arrive)rec.arrive=[a,2,rec.arrive[2]];
    let ok=true;try{ok=mapIssues(m).length<=base;}catch(e){}
    if(ok){m.gateSlid=a-mid;m.npcs=m.npcs.filter(n=>Math.abs(n.x-a)>2||n.y>3);return;}
    snap.forEach(([x,y,c])=>{g[y][x]=c;});m.exits=exs;rec.cells=old;rec.x=q0.x;rec.y=q0.y;rec.arrive=q0.arrive;}}
function townExitPass(m){townExitClear(m);const H=m.t.length;
  const front=[];(m.exits||[]).filter(e=>e.y<H-4).forEach(e=>{for(let j=1;j<=3;j++)front.push([e.x,e.y+j]);});
  if(front.some(([x,y])=>m.bld.some(b=>x>=b.x&&x<b.x+b.w&&y>=b.y&&y<b.y+b.h)))townGateSlide(m);
  if(m.exitMoved||m.gateSlid){try{if(typeof guardPaths==='function'&&!window.__PGOFF)guardPaths(m);}catch(e){}}}// paths changed: pathguard clears assets off the new ones
// registered after every other getMap hook (a microtask after this script ran): p2world's lane pass may move a gate, so the check is last
queueMicrotask(()=>{try{HOOK.wrap('getMap','townexit','new towns: nothing hides a gate',function(next,...a){const id=a[0],fresh=typeof id==='string'&&id[0]==='t'&&!MAPS[id];const m=next(...a);
  try{if(fresh&&m&&m.kind==='town'&&typeof lay3On==='function'&&lay3On()&&!(G&&G.daily))townExitPass(m);}catch(e){}return m;});}catch(e){}});
// gathering spots: herb patches, ore glints and fallen logs. Walk over one to collect it. They regrow when you rest at an inn.
const NODE_MIX={meadow:['herb','herb','wood','wood','ore'],coast:['herb','herb','wood','ore'],cave:['ore','ore','ore','herb'],snow:['ore','ore','wood','herb'],heights:['wood','wood','ore','herb'],void:['herb','herb','ore','wood']};
placeNodes=HOOK.def('placeNodes',placeNodes);// v0.18.7: world12.js moves a node off a chest, a prop or an unreachable tile
function placeNodes(m){
  const R=mulberry(G.run.seed+4242+m.s*97+(m.kind==='dungeon'?7:0)),mix=NODE_MIX[m.theme]||NODE_MIX.meadow;
  let spots=[];
  if(m.kind==='field'){spots=(m.free||[]).slice();m.free=(m.free||[]).filter((p,i)=>i%3!==1);spots=spots.filter((p,i)=>i%3===1);}
  else{const seen=flood(m.t,m.start[0],m.start[1]);m.t.forEach((r,y)=>r.forEach((c,x)=>{if(c==='.'&&seen[y][x]&&Math.abs(x-m.start[0])+Math.abs(y-m.start[1])>4&&!(m.bossAt&&Math.abs(x-m.bossAt[0])<5&&Math.abs(y-m.bossAt[1])<5))spots.push([x,y]);}));}
  const n=m.kind==='field'?(worldV3()?18:worldV2()?10:8):worldV3()?9:4,out=[],used={};
  for(let i=0;i<n*8&&out.length<n&&spots.length;i++){const p=spots[Math.floor(R()*spots.length)],k=p[0]+','+p[1];
    if(used[k]||out.some(o=>Math.abs(o.x-p[0])+Math.abs(o.y-p[1])<5))continue;used[k]=1;
    const c=m.t[p[1]][p[0]];if(SOLID.includes(c)||c==='E'||c==='s')continue;
    out.push({x:p[0],y:p[1],k:m.kind==='dungeon'&&R()<.6?'ore':mix[Math.floor(R()*mix.length)]});}
  m.nodes=out;
}
// =================== THE ARCHIVE (hidden; opens when the account bestiary logs every Scourge and Calamity) ===================
function buildArchive(){
  const rows=[
   '###################',
   '#QQQQQQQ.QQQQQQQQ##',
   '#.................#',
   '#.v.QQ.......QQ.v.#',
   '#....Q...P...Q....#',
   '#.................#',
   '#.QQ.....g.....QQ.#',
   '#.QQ...........QQ.#',
   '#.................#',
   '#.v.....P.P.....v.#',
   '#.................#',
   '########.E.########',
   '###################'].map(r=>r.split(''));
  // g is a placeholder for Vaelith's lectern spot; it renders as floor
  rows[6][9]='.';
  const m={id:'a0',z:4,s:4,kind:'dungeon',theme:'void',safe:1,archive:1,exits:[],npcs:[],bld:[],signs:{},t:rows,start:[9,10],bossAt:null,chests:[],wander:[0,0],nodes:[]};
  m.w=rows[0].length;m.h=rows.length;m.tone=valueNoise(mulberry(4242),m.w,m.h,6);
  m.shelves=[];rows.forEach((r,y)=>r.forEach((c,x)=>{if(c==='Q')m.shelves.push([x,y]);}));
  if(!(G&&G.roster&&G.roster.vaelith))m.npcs.push({x:9,y:5,hx:9,hy:5,name:'Vaelith Ashgrave',line:'',look:TPL.vaelith.look,view:'front',face:'r',act:'archivist',id:'vaelith'});
  return m;
}
const TOWNFOLK=[['Market trader',(Z,s)=>`Fresh bread, wool, river fish! Prices doubled since the beacon died, sorry, love. ${Z.town} has to eat.`],['Town crier',(Z,s)=>`Hear ye! The beacon in the ${Z.dungeon} has gone dark. Brave souls, check the quest board in the square!`]];
const GUARD={b:'heavy',hair:'short',hat:'helm',wpn:'spear',sh:'kite',sk:1,pal:{P:'#8a2a2a',Q:'#f0c050',Z:'#8a2a2a'}};
function villagerLook(name){
  const R=mulberry(hashS(name)),pk=a=>a[Math.floor(R()*a.length)];
  const cloth=['#a84a3a','#4a7a3a','#3a5a9a','#9a7a2a','#7a3a7a','#2a7a7a','#c87a3a','#5a5a7a','#b8a070','#8a5a3a'];
  return {b:pk(['light','light','robe']),hair:pk(['short','long','bun','curly','ponytail','bald','swept','bob']),hat:pk([null,null,'bandana','widebrim','beret','headband','hood']),
    face:pk([[],[],['beard'],['freckles'],['mustache'],['blush']]),wpn:'none',sk:Math.floor(R()*6),back:pk([[],[],['pack'],['scarf']]),size:pk([null,null,null,'small','big']),
    pal:{H:pk(['#2a1d1a','#6b3f22','#9a3f22','#e8c860','#b8c0cc','#1e1a1a','#c86a2a']),P:pk(cloth),Q:pk(['#e8dcc0','#c8b890','#a8c0a0','#d8c0a0','#f0d8a0']),J:pk(cloth),Y:pk(cloth)}};
}
function tileAt(m,x,y){
  if(x<0||y<0||x>=m.w||y>=m.h)return m.kind==='dungeon'?'#':'Z';
  let c=m.t[y][x];
  if(c==='X'&&G.cleared[m.s]&&!(typeof storyEchoUp==='function'&&storyEchoUp(m.s)))return '.';
  if(c==='G'&&G.cleared[m.s])return '=';
  if((c==='C'||c==='K')&&G.chests[m.id+':'+x+','+y])return 'c';
  if(c==='D'&&G.keys[m.id])return '.';
  if(c==='|'&&G.levers[m.id])return '.';
  return c;
}
function solidAt(m,x,y){const c=tileAt(m,x,y);if(c==='c')return true;if(SOLID.includes(c))return true;return m.npcs.some(n=>n.x===x&&n.y===y)||dynActors(m).some(a=>a.x===x&&a.y===y&&!ghostActor(a));}
// actors that depend on game state: bounty elites in fields, the lost wayfarer in dungeons
function dynActors(m){
  const out=[];
  if(m.kind==='field'&&m.part!==1){(G.bounties||[]).concat(Object.values(G.personal||{})).forEach((b,i)=>{if(b.state==='active'&&b.stage===m.s&&m.free&&m.free.length){let k=hashS(b.id)%m.free.length,p=m.free[k];for(let j=0;j<m.free.length&&out.some(o=>o.x===p[0]&&o.y===p[1]);j++)p=m.free[(k+j*7)%m.free.length];out.push({type:'elite',x:p[0],y:p[1],b});}});}
  if(m.kind==='dungeon'&&!m.cave){(G.quests||[]).forEach(q=>{if(q.type==='wanderer'&&q.state==='active'&&!q.found&&q.stage===m.s)out.push({type:'wanderer',x:m.wander[0],y:m.wander[1],q});});}
  return out;
}
dynActors=HOOK.def('dynActors',dynActors);

// v0.4.3: carve a road from each gate's landing tile to the nearest road tile, clearing decoration (trees, bushes, crates, barrels)
// on the way and right beside the landing; buildings, walls, water, lamps, signs and services are never moved
const TOWN_DECOR='tTfxbhkmy';
function townLinkGates(m){const g=m.t,H=g.length,W=g[0].length;const gs=m.gates?Object.values(m.gates).filter(q=>q&&q.arrive):[];
  const land=gs.map(q=>q.arrive.slice(0,2));if(!gs.length&&m.exits)m.exits.forEach(e=>{const x=e.x===0?1:e.x===W-1?W-2:e.x,y=e.y===0?1:e.y===H-1?H-2:e.y;land.push([x,y]);});
  const passable=c=>!SOLID.includes(c)||TOWN_DECOR.includes(c);
  land.forEach(([sx,sy])=>{if(!g[sy]||g[sy][sx]==null)return;
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const c=(g[sy+dy]||[])[sx+dx];if(c&&TOWN_DECOR.includes(c))g[sy+dy][sx+dx]='.';}
    const prev=new Map(),k=(x,y)=>y*W+x,Q=[[sx,sy]];prev.set(k(sx,sy),null);let end=null;
    for(let i=0;i<Q.length&&!end;i++){const [x,y]=Q[i];if(g[y][x]==='='&&!(x===sx&&y===sy)){end=[x,y];break;}
      for(const [a,b] of [[0,1],[0,-1],[1,0],[-1,0]]){const nx=x+a,ny=y+b;if(nx<1||ny<1||nx>=W-1||ny>=H-1||prev.has(k(nx,ny)))continue;if(!passable(g[ny][nx]))continue;prev.set(k(nx,ny),[x,y]);Q.push([nx,ny]);}}
    if(!end)return;let p=prev.get(k(...end));while(p){const [x,y]=p;if(g[y][x]!=='=')g[y][x]='=';p=prev.get(k(x,y));}
    // keep the new road's edges clear too
    let q=prev.get(k(...end));while(q){const [x,y]=q;[[1,0],[-1,0],[0,1],[0,-1]].forEach(([a,b])=>{const c=(g[y+b]||[])[x+a];if(c&&'tTxbhk'.includes(c))g[y+b][x+a]='.';});q=prev.get(k(x,y));}});}
