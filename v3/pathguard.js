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
    if(!(cx===x&&cy===y)&&floorOk(m.t[cy][cx])&&(P.room[cy][cx]||loose)&&!P.prot[cy][cx]&&!pgCuts(P,cx,cy)&&cx>1&&cy>1&&cx<W-2&&cy<H-2){
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
