// ===== pathguard.js (v0.5.0): paths are protected: path assets, guard passes, hidden props =====
// =================== Beta v0.5.0 1.3: paths are protected (file: pathguard.js) ===================
// Every walkable corridor and path tile, dead ends and alternate routes included, is protected. Stairs, chests, levers, key chests,
// props, decor and standing NPCs may only sit in room interiors, corners, sides and alcoves that are not on a path tile.
// The rule works on the tile grid alone (rooms are not stored on maps), so it covers every generator and every old save:
// - walkable: open ground, with every asset counted as open ground (we judge the place, not what stands on it)
// - room tile: inside some fully walkable 3x3 block (every room, plaza and field clearing is at least 3x3)
// - corridor tile: walkable and not a room tile (one or two wide passages, gaps between trees and walls, dead ends)
// - alcove: a corridor tile with exactly one walkable neighbour, which is a room tile (a niche off a room side): allowed
// - path tile: a corridor tile (not an alcove), a road, trail or bridge tile, a doorway (room tile beside a corridor) and the room
//   tile just inside it, a tile on or beside a required target (exit, gate, door step, cave mouth, entrance), and any tile whose
//   loss would cut its neighbours apart (a local cut point)
// pathAssets(m) lists assets on path tiles; guardPaths(m) moves them (chests keep their contents, opened state and mimic roll,
// stairs move into a wall alcove off a room with the start tile beside them, NPCs move their home) or removes loose decor.
// It runs on every map as it is built (getMap), after healMap, so generation and old saves both get the same result.
const PG_ASSET_PROP='xbhkuavgNPeLm';                 // loose props and decor (not boats, crops or fountains, which belong where they are)
const PG_ASSET_KEY='CKl';                            // chests, key chests, levers: they move, never vanish
const PG_PATH_CH='=B';                             // roads and bridges (a ':' plaza is open ground, like a room)
function pgIsAsset(m,c){return PG_ASSET_PROP.includes(c)||PG_ASSET_KEY.includes(c)||(c==='E'&&m.kind==='dungeon');}
function pgGrid(m){
  const g=m.t,H=g.length,W=g[0].length,ex=new Set((m.exits||[]).map(e=>e.x+','+e.y));
  const walk=g.map((r,y)=>r.map((c,x)=>!SOLID.includes(c)||pgIsAsset(m,c)||c==='X'||c==='G'||c==='D'||c==='|'||ex.has(x+','+y)));
  const W8=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&walk[y][x];
  // room tiles: covered by some 3x3 all-walkable block
  const room=g.map(r=>r.map(()=>false));
  for(let y=0;y+2<H;y++)for(let x=0;x+2<W;x++){let ok=true;for(let j=0;j<3&&ok;j++)for(let i=0;i<3&&ok;i++)if(!walk[y+j][x+i])ok=false;
    if(ok)for(let j=0;j<3;j++)for(let i=0;i<3;i++)room[y+j][x+i]=true;}
  const N4=[[1,0],[-1,0],[0,1],[0,-1]],prot=g.map(r=>r.map(()=>false)),mark=(x,y)=>{if(x>=0&&y>=0&&x<W&&y<H)prot[y][x]=true;};
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(!walk[y][x])continue;const c=g[y][x];
    if(PG_PATH_CH.includes(c)){mark(x,y);continue;}
    // a prop standing on a road line: road on two opposite sides
    if(pgIsAsset(m,c)&&((PG_PATH_CH.includes((g[y]||[])[x-1])&&PG_PATH_CH.includes((g[y]||[])[x+1]))||(PG_PATH_CH.includes((g[y-1]||[])[x])&&PG_PATH_CH.includes((g[y+1]||[])[x])))){mark(x,y);continue;}
    if(room[y][x])continue;
    const nb=N4.filter(([a,b])=>W8(x+a,y+b));
    if(nb.length===1&&room[y+nb[0][1]][x+nb[0][0]])continue;  // alcove off a room
    if(nb.length===0)continue;                                 // a sealed pocket, nothing to protect
    mark(x,y);
    // doorway: the room tile this corridor opens into, and the tile just inside it
    nb.forEach(([a,b])=>{const rx=x+a,ry=y+b;if(room[ry][rx]){mark(rx,ry);if(W8(rx+a,ry+b))mark(rx+a,ry+b);}});}
  const corr=prot.map(r=>r.slice());
  // required targets and the tiles beside them
  try{mapTargets(m).forEach(t=>{if(t.solid)return;mark(t.x,t.y);N4.forEach(([a,b])=>{if(W8(t.x+a,t.y+b))mark(t.x+a,t.y+b);});});}catch(e){}
  if(m.start){mark(m.start[0],m.start[1]);}
  return {walk,room,prot,corr,W,H,W8};
}
// would a solid thing at (x,y) cut its walkable neighbours apart? (checked inside the 8 tiles around it)
function pgCuts(P,x,y){
  const ring=[[-1,-1],[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0]],open=ring.map(([a,b])=>P.W8(x+a,y+b));
  const n4=[1,3,5,7].filter(i=>open[i]);if(n4.length<2)return false;
  // walk the ring: 4-adjacent ring cells are consecutive entries; a corner cell links its two side cells
  const seen=new Set([n4[0]]),st=[n4[0]];
  while(st.length){const i=st.pop();for(const j of [(i+1)%8,(i+7)%8]){if(open[j]&&!seen.has(j)){seen.add(j);st.push(j);}}}
  return n4.some(i=>!seen.has(i));
}
function pgNpcAt(m){return (m.npcs||[]).map(n=>({n,x:n.hx!=null?n.hx:n.x,y:n.hy!=null?n.hy:n.y}));}
function pathAssets(m,P){
  if(!m||!m.t||m.archive||m.sanctum)return [];P=P||pgGrid(m);const out=[];
  for(let y=0;y<P.H;y++)for(let x=0;x<P.W;x++){const c=m.t[y][x];if(!pgIsAsset(m,c))continue;
    if(c==='E'){ // the stairs out
      // in a wall alcove: its one floor tile must be a room tile off every corridor and doorway; on a room side: the usual rule
      const f=pgStairsFront(m,P,x,y);if(f?(!P.room[f[1]][f[0]]||P.corr[f[1]][f[0]]):(P.prot[y][x]||pgCuts(P,x,y)))out.push({x,y,c,why:'stairs'});continue;}
    if(P.prot[y][x]||pgCuts(P,x,y))out.push({x,y,c,why:P.prot[y][x]?'path':'cut'});}
  pgNpcAt(m).forEach(q=>{if(q.n.guard||/guard/i.test(q.n.name||''))return;if(P.prot[q.y]&&P.prot[q.y][q.x])out.push({x:q.x,y:q.y,c:'npc',npc:q.n,why:'npc'});});
  return out;
}
// stairs: the stairs tile itself must be off every route: a wall alcove (three solid sides) whose one open side is the start tile
function pgStairsOnRoute(m,P,x,y){return !pgStairsFront(m,P,x,y);}
function pgStairsFront(m,P,x,y){const open=[[1,0],[-1,0],[0,1],[0,-1]].map(([a,b])=>[x+a,y+b]).filter(([a,b])=>P.W8(a,b));return open.length===1?open[0]:null;}
// the nearest allowed spot for a tile asset: a room tile on plain floor, not protected, not a cut, with no asset next to it
const PG_NOPASS='D|XG';
function pgSpot(m,P,x,y,floorOk,maxR,loose){
  const H=P.H,W=P.W,seen=new Set([x+','+y]),q=[[x,y,0]];
  for(let i=0;i<q.length;i++){const [cx,cy,d]=q[i];if(d>(maxR||40))break;
    if(!(cx===x&&cy===y)&&floorOk(m.t[cy][cx])&&(P.room[cy][cx]||loose)&&!P.prot[cy][cx]&&!pgCuts(P,cx,cy)&&cx>1&&cy>1&&cx<W-2&&cy<H-2&&!(typeof pgHides==='function'&&pgHides(m,cx,cy,'C'))){
      let crowd=false;for(let j=-1;j<=1&&!crowd;j++)for(let k=-1;k<=1&&!crowd;k++){const c=(m.t[cy+j]||[])[cx+k];if((j||k)&&c&&pgIsAsset(m,c))crowd=true;}
      if(!crowd&&!pgNpcAt(m).some(n=>n.x===cx&&n.y===cy))return [cx,cy];}
    for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=cx+a,ny=cy+b,k=nx+','+ny;if(seen.has(k)||!P.W8(nx,ny)||PG_NOPASS.includes(m.t[ny][nx]))continue;seen.add(k);q.push([nx,ny,d+1]);}}
  return null;
}
function pgFloorOf(m,x,y){const c=typeof floorLike==='function'?floorLike(m,x,y):(m.kind==='dungeon'?'.':',');return PG_PATH_CH.includes(c)?(m.kind==='dungeon'?'.':','):c;}
// stairs: a wall alcove next to a room tile that is not a path tile, nearest the old start
function pgStairsSpot(m,P,x,y){
  const H=P.H,W=P.W,c=[];
  for(let yy=1;yy<H-1;yy++)for(let xx=1;xx<W-1;xx++){if(m.t[yy][xx]!=='#')continue;
    const fl=[[0,1],[1,0],[0,-1],[-1,0]].map(([a,b])=>[xx+a,yy+b]).filter(([a,b])=>P.walk[b][a]);if(fl.length!==1)continue;
    const [fx,fy]=fl[0];if(!P.room[fy][fx]||P.corr[fy][fx]||m.t[fy][fx]!=='.')continue;
    c.push({x:xx,y:yy,fx,fy,d:Math.abs(fx-x)+Math.abs(fy-y)});}
  c.sort((a,b)=>a.d-b.d);return c;
}
function guardPaths(m){
  if(!m||!m.t||m.archive||m.sanctum)return [];const log=[];
  for(let pass=0;pass<4;pass++){
    const P=pgGrid(m),bad=pathAssets(m,P);if(!bad.length)break;let moved=false;
    for(const b of bad){
      if(b.c==='npc'){const sp=pgSpot(m,P,b.x,b.y,c=>c==='.'||c===','||c===':'||c==='f',24);if(!sp)continue;
        const n=b.npc;n.x=sp[0];n.y=sp[1];if(n.hx!=null){n.hx=sp[0];n.hy=sp[1];}log.push({x:b.x,y:b.y,what:'npc',to:sp});moved=true;continue;}
      if(b.c==='E'){const cs=pgStairsSpot(m,P,b.x,b.y);const old={s:m.start&&m.start.slice(),w:m.wander&&m.wander.slice()};
        m.t[b.y][b.x]=pgStairsOnRoute(m,P,b.x,b.y)?'.':'#';
        let ok=false;for(const s of cs.slice(0,30)){m.t[s.y][s.x]='E';m.start=[s.fx,s.fy];
          if((typeof mapIssues!=='function'||!mapIssues(m).length)&&!pathAssets(m).some(q=>q.c==='E')){ok=true;
            if(m.wander&&old.w&&old.s&&m.wander[0]===old.s[0]&&m.wander[1]===old.s[1]+1)m.wander=[s.fx,s.fy+1];
            if(m.gates&&m.gates.start&&m.gates.start.arrive)m.gates.start.arrive=[s.fx,s.fy];
            log.push({x:b.x,y:b.y,what:'stairs',to:[s.x,s.y]});break;}
          m.t[s.y][s.x]='#';}
        if(!ok){m.t[b.y][b.x]='E';m.start=old.s;}else moved=true;continue;}
      if(PG_ASSET_PROP.includes(b.c)){m.t[b.y][b.x]=pgFloorOf(m,b.x,b.y);if(m.tl)m.tl=null;log.push({x:b.x,y:b.y,what:'decor '+b.c});moved=true;continue;}
      // chests, key chests and levers move to the nearest allowed room tile
      const fl=m.kind==='dungeon'?(c=>c==='.'):(c=>c==='.'||c===',');
      const R0=b.c!=='C'?10:m.kind==='dungeon'?24:60,sp=pgSpot(m,P,b.x,b.y,fl,R0)||pgSpot(m,P,b.x,b.y,fl,R0,true)||(b.c==='C'&&m.kind!=='dungeon'?pgSpot(m,P,b.x,b.y,c=>c==='.'||c===','||c==='f',999,true):null);if(!sp)continue;  // a room tile first, then any alcove off the paths
      const c=b.c,floor=pgFloorOf(m,b.x,b.y);m.t[b.y][b.x]=floor;m.t[sp[1]][sp[0]]=c;
      if(typeof mapIssues==='function'&&mapIssues(m).length){m.t[sp[1]][sp[0]]=floor==='.'||floor===','?(m.kind==='dungeon'?'.':','):floor;m.t[b.y][b.x]=c;continue;}
      if(c==='C'||c==='K'){const e=(m.chests||[]).find(q=>q[0]===b.x&&q[1]===b.y);
        if(e){const from=e.from||[b.x,b.y];e[0]=sp[0];e[1]=sp[1];e.from=from;}
        try{if(G&&G.chests){const ok=m.id+':'+b.x+','+b.y,nk=m.id+':'+sp[0]+','+sp[1];if(G.chests[ok]&&!G.chests[nk])G.chests[nk]=G.chests[ok];}}catch(e2){}}
      if(c==='l'&&m.lever&&m.lever[0]===b.x&&m.lever[1]===b.y)m.lever=[sp[0],sp[1]];
      if(c==='K'&&m.key&&m.key[0]===b.x&&m.key[1]===b.y)m.key=[sp[0],sp[1]];
      if(m.tl)m.tl=null;log.push({x:b.x,y:b.y,what:c,to:sp});moved=true;}
    if(!moved)break;}
  // a defeated mimic leaves nothing behind (healMap checks this too, but it ran before the chest moved here)
  try{if(G&&G.chests&&typeof isMimic==='function'&&m.chests)m.chests.slice().forEach(([x,y])=>{if(G.chests[m.id+':'+x+','+y]&&isMimic(m,x,y)){dropChest(m,x,y);log.push({x,y,what:'mimic gone'});}});}catch(e){}
  m.guarded=log;return log;
}
// a moved chest keeps the mimic roll of the spot it was built on
{const im=isMimic;isMimic=function(m,x,y){try{const c=m&&(m.chests||[]).find(q=>q[0]===x&&q[1]===y);if(c&&c.from&&(c.from[0]!==x||c.from[1]!==y)){if(!m||m.kind!=='dungeon'||m.archive||m.t[y][x]!=='C'||c[2]==='vault')return false;return chestHash(m,c.from[0],c.from[1])<MIMIC_RATE;}}catch(e){}return im.apply(this,arguments);};}
{const g0=getMap;getMap=function(id){const had=!!MAPS[id];const m=g0(id);if(!had&&m&&!m.__guarded&&!(typeof HEAL_OFF!=='undefined'&&HEAL_OFF)&&!window.__PGOFF){m.__guarded=true;try{guardPaths(m);}catch(e){try{wdLog('guardPaths '+id+': '+e.message);}catch(_){}}}return m;};}

// =================== Beta v0.7.1: what is drawn and what blocks always agree ===================
// The owner's report: in Hearthholm (snow) at night the hero could not walk left from the Alchemy shop's front right corner toward its
// door; the tile looked like paved street. It held a bush. townFinish scatters bushes on grass away from roads and groundProps never
// checked bushes beside a door. In HD-2D the camera looks north and down (HD2D.pitch), so a wall, cliff or town wall hides everything on
// the row just north of it that is lower than the wall, and the top of the town wall is paved like the street: the bush on the last row
// before the wall was not drawn at all, while it still blocked. The same held for chests, levers, rocks, graves and pillars on the row
// north of a dungeon wall (22 px, the most common case), and for decor north of cliffs.
// Rules (every map kind, as the map is built, so old saves heal on load):
// - pgHides(m,x,y,c): HD-2D hides a prop c on (x,y) when the walls south of it stand within PG_VIS px of its height (PG_PROP_H);
//   no solid prop may stand there: chests, key chests and levers move (pathAssets reports them, guardPaths moves them with their
//   contents, opened state and mimic roll; pgSpot never picks such a spot), loose decor goes
// - a door apron (the step in front of a door, the tiles either side of it and the one below it) holds no loose decor or prop
// - a building footprint has no walkable hole (a gate's arrival tile used to pave one: p2world laneFix)
// drawAudit(m) measures the drawing (each prop's real art height, in the strip hdBakeCards draws) against the collision: tiles that block
// but show nothing in 2D or HD-2D, holes in a building, decor on an apron, door steps and apron tiles the strict reach cannot get to.
const PG_APRON_DECOR='tTxbhkmuavgNPeLR';  // loose decor and props that never stand on a door apron (lamps, braziers and anvils included)
const PG_SEEN_CH='#Z~OvXUAE';             // solid tiles drawn by the ground pass, the dynamic layer or as geometry
const PG_HIDE_DECOR='tRxbhkuavgNPeLmTQF'; // decor that goes when HD-2D would hide it
const PG_HIDE_MOVE='SWq';                  // signs, waystones and quest boards step to the nearest open tile that shows (a sign keeps its words)
const PG_IN_WALL='D|G';                   // boss doors, bars and sealed gates stand in a wall line: hidden by it, they read as the wall they block like
// the lowest art of each prop over every theme, in art px above the ground (drawAudit measures the real art; v071wa checks this table)
const PG_PROP_H={T:20,t:11,R:11,C:11,K:12,l:15,S:14,F:13,W:27,L:26,b:14,x:13,h:11,k:15,m:24,u:30,a:11,g:15,N:26,Q:22,P:23,e:18,Y:34,q:21,o:11,G:30,'|':22,D:22};
const PG_VIS=5;                           // a prop must show at least this many px above the walls in front of it
function pgWallH(m,x,y){if(x<0||y<0||x>=m.w||y>=m.h)return 0;const c=tileAt(m,x,y),W=typeof HD2D!=='undefined'?HD2D.wall:{dungeon:22,cliff:12,town:14};
  return c==='#'?(m.kind==='dungeon'?W.dungeon:W.cliff):c==='Z'?W.town:0;}
// how much (art px above the ground) the walls south of (x,y) hide in HD-2D: a wall k rows south hides what is lower than its height less
// the drop of the line of sight over the gap (the prop's card stands on its tile's south edge, as hdBakeCards puts it)
function pgOcclude(m,x,y){const T=Math.tan((typeof HD2D!=='undefined'?HD2D.pitch:40)*Math.PI/180),zp=(y+1)*TS+.5;let o=0;
  for(let k=1;k<=3;k++){const h=pgWallH(m,x,y+k);if(h<=0)continue;const v=h-((y+k)*TS-zp)*T;if(v>o)o=v;}return o;}
function pgHides(m,x,y,c){if(!m||m.archive||m.sanctum)return false;const h=PG_PROP_H[c];return h!=null&&h-pgOcclude(m,x,y)<PG_VIS;}
// solid props HD-2D would hide; chests, key chests and levers are reported as path assets so guardPaths moves them
function pgHiddenAssets(m){const out=[];if(!m||!m.t||m.archive||m.sanctum)return out;
  for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++){const c=m.t[y][x];if(!'CKl'.includes(c))continue;if(c==='C'&&tileAt(m,x,y)==='c'&&typeof WFX!=='undefined'&&WFX.chestGone)continue;
    if(pgHides(m,x,y,c))out.push({x,y,c,why:'hidden'});}
  return out;}
{const pa0=pathAssets;pathAssets=function(m,P){const out=pa0.apply(this,arguments);try{pgHiddenAssets(m).forEach(q=>{if(!out.some(o=>o.x===q.x&&o.y===q.y))out.push(q);});}catch(e){}return out;};}
function pgDropHidden(m){const log=[];if(!m||!m.t||m.archive||m.sanctum)return log;
  for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++){const c=m.t[y][x];if(!pgHides(m,x,y,c))continue;
    if(PG_HIDE_DECOR.includes(c)){m.t[y][x]=pgFloorOf(m,x,y);log.push({x,y,what:'hidden '+c});continue;}
    if(PG_HIDE_MOVE.includes(c)){const to=pgMoveSeen(m,x,y,c);if(to)log.push({x,y,what:'hidden '+c,to});}}
  if(log.length&&m.tl)m.tl=null;return log;}
// the nearest open ground (4 steps at most) where c shows, is off the roads and blocks nothing (mapIssues); a sign's words move with it
function pgMoveSeen(m,x,y,c){const fl=pgFloorOf(m,x,y),q=[[x,y,0]],seen=new Set([x+','+y]);m.t[y][x]=fl;
  for(let i=0;i<q.length;i++){const [cx,cy,d]=q[i];
    if(d>0&&'.,:'.includes(m.t[cy][cx])&&!pgHides(m,cx,cy,c)&&!pgInBld(m,cx,cy)&&!(m.npcs||[]).some(n=>n.x===cx&&n.y===cy)&&!(m.bld||[]).some(b=>Math.abs(b.door[0]-cx)<=1&&b.door[1]+1<=cy&&cy<=b.door[1]+2)){
      const was=m.t[cy][cx];m.t[cy][cx]=c;if(typeof mapIssues!=='function'||!mapIssues(m).length){const k0=x+','+y,k1=cx+','+cy;if(m.signs&&m.signs[k0]!=null){m.signs[k1]=m.signs[k0];delete m.signs[k0];}return [cx,cy];}m.t[cy][cx]=was;}
    if(d>=4)continue;for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=cx+a,ny=cy+b,k=nx+','+ny;if(seen.has(k)||nx<1||ny<1||nx>=m.w-1||ny>=m.h-1||SOLID.includes(m.t[ny][nx]))continue;seen.add(k);q.push([nx,ny,d+1]);}}
  m.t[y][x]=c;return null;}
function pgInBld(m,x,y){return (m.bld||[]).find(b=>x>=b.x&&x<b.x+b.w&&y>=b.y&&y<b.y+b.h)||null;}
function pgApron(b){const [dx,dy]=b.door;return [[dx,dy+1,'step'],[dx-1,dy+1,'left'],[dx+1,dy+1,'right'],[dx,dy+2,'below']];}
function pgClearAprons(m){const log=[];if(!m||!m.t||!m.bld||!m.bld.length)return log;const W=m.t[0].length,H=m.t.length;
  m.bld.forEach(b=>{if(!b.door)return;pgApron(b).forEach(([x,y])=>{const c=m.t[y]&&m.t[y][x];
    if(c&&PG_APRON_DECOR.includes(c)&&!pgInBld(m,x,y)&&x>0&&y>0&&x<W-1&&y<H-1){m.t[y][x]=pgFloorOf(m,x,y);log.push({x,y,what:'apron '+c});}});});
  if(log.length&&m.tl)m.tl=null;return log;}
// a walkable tile inside a drawn building footprint becomes wall again (unless that would cut off a gate, door or exit)
function pgPlugHoles(m){const log=[];if(!m||!m.t||!m.bld)return log;
  m.bld.forEach(b=>{for(let y=b.y;y<b.y+b.h;y++)for(let x=b.x;x<b.x+b.w;x++){const c=m.t[y]&&m.t[y][x];if(c==null||SOLID.includes(c))continue;
    m.t[y][x]='H';if(typeof mapIssues==='function'&&mapIssues(m).length){m.t[y][x]=c;continue;}log.push({x,y,what:'hole '+c});}});
  if(log.length&&m.tl)m.tl=null;return log;}
{const gp0=guardPaths;guardPaths=function(m){const pre=(m&&m.t&&!m.archive&&!m.sanctum)?pgPlugHoles(m).concat(pgClearAprons(m),pgDropHidden(m)):[];const log=gp0.apply(this,arguments);
  if(pre.length&&Array.isArray(log)){log.unshift(...pre);m.guarded=log;}return log;};}
// blocks movement because of the tile itself (characters are drawn, so they never count)
function pgBlocksTile(m,x,y){const c=tileAt(m,x,y);if(c==='c')return !(typeof WFX!=='undefined'&&WFX.chestGone);return SOLID.includes(c);}
let PG_ACV=null;
// one row of props drawn the way hdBakeCards draws it (no shadows); returns the strip canvas
function pgDrawRow(m,y){const SH=64,UP=58;if(!PG_ACV||PG_ACV.width!==m.w*TS)PG_ACV=mkCv(m.w*TS,SH);const sc=PG_ACV.getContext('2d',{willReadFrequently:true});
  const sh0=shadowAt,keep={lights:m.lights,smoke:m.smoke,torches:m.torches,mills:m.mills};shadowAt=function(){};
  try{sc.setTransform(1,0,0,1,0,0);sc.clearRect(0,0,PG_ACV.width,SH);sc.imageSmoothingEnabled=false;sc.setTransform(1,0,0,1,0,-((y+1)*TS-UP));try{drawObjects(sc,m,y);}catch(e){}sc.setTransform(1,0,0,1,0,0);}
  finally{shadowAt=sh0;Object.assign(m,keep);}return sc;}
// the drawn height of the prop on (x,y): the highest opaque pixel over its own tile's columns, in art px above the ground (0: nothing)
function pgArtH(sc,x){const SH=64,UP=58,d=sc.getImageData(x*TS,0,TS,SH).data;for(let r=0;r<SH;r++)for(let i=0;i<TS;i++)if(d[(r*TS+i)*4+3]>40)return UP-r;return 0;}
function drawAudit(m){const out={hidden:[],holes:[],apron:[],door:[],props:0,heights:{}};if(!m||!m.t)return out;
  const W=m.w||m.t[0].length,H=m.h||m.t.length,OBJ=typeof H2_OBJ==='string'?H2_OBJ:'',hd=!m.archive&&!m.sanctum;
  for(let y=0;y<H;y++){const xs=[];
    for(let x=0;x<W;x++){if(!pgBlocksTile(m,x,y))continue;const c=tileAt(m,x,y);
      if(c==='H'){if(!pgInBld(m,x,y))out.hidden.push({x,y,c,why:'wall with no building drawn'});continue;}
      if(PG_SEEN_CH.includes(c)||(m.shelves&&m.shelves.some(q=>q[0]===x&&q[1]===y)))continue;// the Archive's shelves are drawn by the dynamic layer
      if(OBJ.includes(c)){xs.push(x);continue;}
      out.hidden.push({x,y,c,why:'solid tile nothing draws'});}
    if(!xs.length)continue;const sc=pgDrawRow(m,y);
    xs.forEach(x=>{out.props++;const c=tileAt(m,x,y),h=pgArtH(sc,x),k=m.theme+':'+c;if(out.heights[k]==null||h<out.heights[k])out.heights[k]=h;
      if(h<=0){out.hidden.push({x,y,c,why:'2D: nothing drawn'});return;}
      const o=hd&&!PG_IN_WALL.includes(c)?pgOcclude(m,x,y):0;if(h-o<PG_VIS)out.hidden.push({x,y,c,why:`HD-2D: ${h} px of art behind ${Math.round(o)} px of wall to the south`});});}
  // holes: walkable ground inside a building that is drawn whole
  (m.bld||[]).forEach(b=>{for(let y=b.y;y<b.y+b.h;y++)for(let x=b.x;x<b.x+b.w;x++)if(m.t[y]&&!pgBlocksTile(m,x,y))out.holes.push({x,y,c:m.t[y][x],b:b.k});});
  // door aprons, and the strict reach (props and NPC homes solid) to the step and every open apron tile
  const off=window.__W71OFF;window.__W71OFF=false;let s=null;try{s=typeof mapEntry==='function'?mapEntry(m):null;}finally{window.__W71OFF=off;}const R=s&&typeof healReach==='function'?healReach(m,s,true,false):null;
  (m.bld||[]).forEach(b=>{if(!b.door)return;pgApron(b).forEach(([x,y,side])=>{if(x<0||y<0||x>=W||y>=H||pgInBld(m,x,y))return;const c=m.t[y][x];
    if(PG_APRON_DECOR.includes(c))out.apron.push({x,y,c,b:b.k,side});
    else if(R&&!pgBlocksTile(m,x,y)&&!R[y][x])out.door.push({x,y,b:b.k,side,why:side==='step'?'door step unreachable':'apron tile unreachable'});});});
  return out;}
