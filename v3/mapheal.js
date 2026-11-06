// ===== mapheal.js (v0.4.1): nothing may block a path: map healing on load =====
// Chests, props and standing NPCs are solid. mapIssues(m) floods from the map's entry twice: once treating them as walkable
// (the optimistic reach) and once as solid (the strict reach). Any required tile (exit, gate, stairs, entrance, lever, boss door,
// building door, cave mouth) that only the optimistic flood reaches is "blocked". healMap(m) clears or moves the blockers on the
// shortest optimistic route until nothing is blocked. It runs on every map as it is built, so older saves heal when a map loads.
const HEAL_LOOSE='C'+PROP_CH;
function mapEntry(m){
  if(m.gates&&m.gates.start&&m.gates.start.arrive)return m.gates.start.arrive;
  if(m.start)return m.start;
  // v0.7.1: a town whose first exit is a north or south gate used to start from the wall tile beside it (x-1 on row 0), so the reach was
  // empty and nothing in that town was ever checked; any gate's arrival tile, else one step in from the exit's own edge
  if(m.gates&&!window.__W71OFF){const q=Object.values(m.gates).find(g=>g&&g.arrive);if(q)return q.arrive;}
  if(m.kind==='town'||m.kind==='field'){const e=(m.exits||[])[0];if(e&&window.__W71OFF)return [e.x===0?1:Math.max(0,e.x-1),e.y];if(e){const W=m.t[0].length,H=m.t.length;return e.x===0?[1,e.y]:e.x===W-1?[W-2,e.y]:e.y===0?[e.x,1]:e.y===H-1?[e.x,H-2]:[e.x,e.y];}}
  if(m.entOut)return m.entOut;
  return null;
}
function mapTargets(m){
  const T=[];const add=(p,why,solid)=>{if(p&&p.length>=2)T.push({x:p[0],y:p[1],why,solid:!!solid});};
  (m.exits||[]).forEach(e=>add([e.x,e.y],'exit'));
  if(m.gates)Object.values(m.gates).forEach(g=>{if(g&&g.arrive)add(g.arrive,'gate');});
  if(m.entOut)add(m.entOut,'entrance');if(m.ent)add(m.ent,'entrance',1);
  (m.caves||[]).forEach(c=>{if(c.out)add(c.out,'cave');});
  (m.bld||[]).forEach(b=>{if(b.door)add([b.door[0],b.door[1]+1],'door');});
  if(m.bossAt)add(m.bossAt,'boss',1);
  if(m.lever)add(m.lever,'lever',1);
  if(m.kind==='dungeon'||m.cave)(m.t||[]).forEach((r,y)=>r.forEach((c,x)=>{if(c==='<'||c==='>'||c==='l'||c==='U'||c==='D')add([x,y],'stairs',1);}));
  return T;
}
function healReach(m,start,strict,npcs){
  const g=m.t,H=g.length,W=g[0].length,seen=g.map(r=>r.map(()=>false)),st=[start],ex=new Set((m.exits||[]).map(e=>e.x+','+e.y));
  const blockNpc=new Set(npcs?(m.npcs||[]).map(n=>(n.hx!=null?n.hx:n.x)+','+(n.hy!=null?n.hy:n.y)):[]);
  while(st.length){const [x,y]=st.pop();if(x<0||y<0||x>=W||y>=H||seen[y][x])continue;const c=g[y][x];
    const free=!SOLID.includes(c)||c==='X'||c==='G'||ex.has(x+','+y)||(!strict&&HEAL_LOOSE.includes(c));
    if(!free)continue;if(strict&&blockNpc.has(x+','+y)&&!(x===start[0]&&y===start[1]))continue;
    seen[y][x]=true;st.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);}
  return seen;
}
const reachT=(R,t)=>t.solid?[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>R[t.y+b]&&R[t.y+b][t.x+a]):!!(R[t.y]&&R[t.y][t.x]);
// returns [{x,y,why}] for targets the strict reach loses
function mapIssues(m){
  if(!m||!m.t||m.archive||m.sanctum)return [];const s=mapEntry(m);if(!s)return [];
  const A=healReach(m,s,false,false),Bs=healReach(m,s,true,true);
  return mapTargets(m).filter(t=>reachT(A,t)&&!reachT(Bs,t));
}
// shortest optimistic route (blockers passable) to a target; returns the loose tiles / npcs on it
function healRoute(m,start,t){
  const g=m.t,H=g.length,W=g[0].length,prev=new Map(),k=(x,y)=>y*W+x,q=[start];prev.set(k(...start),null);
  const ex=new Set((m.exits||[]).map(e=>e.x+','+e.y));
  const free=(x,y)=>{const c=g[y][x];return !SOLID.includes(c)||c==='X'||c==='G'||ex.has(x+','+y)||HEAL_LOOSE.includes(c);};
  let end=null;
  for(let i=0;i<q.length;i++){const [x,y]=q[i];
    if(t.solid?Math.abs(x-t.x)+Math.abs(y-t.y)===1:(x===t.x&&y===t.y)){end=[x,y];break;}
    for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+a,ny=y+b;if(nx<0||ny<0||nx>=W||ny>=H||prev.has(k(nx,ny))||!free(nx,ny))continue;prev.set(k(nx,ny),[x,y]);q.push([nx,ny]);}}
  const out=[];let p=end;while(p){out.push(p);p=prev.get(k(...p));}return out;
}
function floorLike(m,x,y){const g=m.t;for(const [a,b] of [[0,1],[0,-1],[1,0],[-1,0],[1,1],[-1,-1]]){const c=(g[y+b]||[])[x+a];if(c&&!SOLID.includes(c)&&c!=='='&&c!=='X'&&c!=='G')return c;}return m.kind==='dungeon'?'.':',';}
function dropChest(m,x,y){m.chests=(m.chests||[]).filter(c=>!(c[0]===x&&c[1]===y));m.t[y][x]=floorLike(m,x,y);if(m.tl)m.tl=null;}
// move a loose tile to the nearest spot that blocks nothing; false when none found (then it is removed)
function relocateLoose(m,x,y){
  const c=m.t[y][x],chest=c==='C',entry=chest?(m.chests||[]).find(q=>q[0]===x&&q[1]===y):null;
  m.t[y][x]=floorLike(m,x,y);if(chest)m.chests=m.chests.filter(q=>q!==entry);
  if(!chest){return false;}
  const W=m.t[0].length,H=m.t.length;
  for(let r=1;r<=8;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){
    if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;const nx=x+dx,ny=y+dy;if(nx<2||ny<2||nx>=W-2||ny>=H-2)continue;
    const t=m.t[ny][nx];if(t!=='.'&&t!==',')continue;
    if((m.chests||[]).some(q=>Math.abs(q[0]-nx)+Math.abs(q[1]-ny)<2))continue;
    // dead-end friendly: at most 2 open neighbours in the 4-neighbourhood keeps it out of the way, but any spot that blocks nothing is fine
    m.t[ny][nx]='C';const bad=mapIssues(m).length;
    if(!bad){m.chests.push(entry?[nx,ny].concat(entry.slice(2)):[nx,ny]);return [nx,ny];}
    m.t[ny][nx]=t;}
  return false;
}
function healMap(m){
  if(!m||!m.t||m.archive||m.sanctum)return [];const log=[];
  // defeated mimics leave nothing behind (older saves kept the opened chest standing)
  if(G&&G.chests&&typeof isMimic==='function'&&m.chests)(m.chests.slice()).forEach(([x,y])=>{if(G.chests[m.id+':'+x+','+y]&&isMimic(m,x,y)){dropChest(m,x,y);log.push({x,y,why:'mimic gone'});}});
  for(let it=0;it<40;it++){
    const iss=mapIssues(m);if(!iss.length)break;const s=mapEntry(m);let fixed=false;
    for(const t of iss){const route=healRoute(m,s,t);
      const npcs=(m.npcs||[]).filter(n=>route.some(([x,y])=>x===(n.hx!=null?n.hx:n.x)&&y===(n.hy!=null?n.hy:n.y)));
      const loose=route.filter(([x,y])=>HEAL_LOOSE.includes(m.t[y][x]));
      if(loose.length){const [x,y]=loose[0];const was=m.t[y][x];const to=relocateLoose(m,x,y);log.push({x,y,why:'moved '+was,to});fixed=true;break;}
      if(npcs.length){const n=npcs[0];const nx=n.hx!=null?n.hx:n.x,ny=n.hy!=null?n.hy:n.y;
        let done=false;for(let r=1;r<=6&&!done;r++)for(let dy=-r;dy<=r&&!done;dy++)for(let dx=-r;dx<=r&&!done;dx++){
          if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;const tx=nx+dx,ty=ny+dy;const c=(m.t[ty]||[])[tx];if(c!=='.'&&c!==','&&c!==':')continue;
          if(route.some(([x,y])=>x===tx&&y===ty))continue;
          const ox=n.x,oy=n.y,ohx=n.hx,ohy=n.hy;n.x=tx;n.y=ty;if(n.hx!=null){n.hx=tx;n.hy=ty;}
          if(!mapIssues(m).some(q=>q.x===t.x&&q.y===t.y)){done=true;log.push({x:nx,y:ny,why:'npc moved',to:[tx,ty]});}else{n.x=ox;n.y=oy;n.hx=ohx;n.hy=ohy;}}
        if(done){fixed=true;break;}
      }
    }
    if(!fixed)break;
  }
  m.healed=log;return log;
}
{const g0=getMap;getMap=function(id){const had=!!MAPS[id];const m=g0(id);if(!had&&m&&!m.__healed&&!(typeof HEAL_OFF!=='undefined'&&HEAL_OFF)){m.__healed=true;try{healMap(m);}catch(e){try{wdLog('healMap '+id+': '+e.message);}catch(_){}}}return m;};}
