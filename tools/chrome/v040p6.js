// v0.4.0 Phase 6: dungeon order in the real game (lever -> key -> door), bars text, map marker
const {open,chk,done}=require('./pw');
(async()=>{
const H=await open({w:430,h:800,mobile:true});
const r=await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;const o={};
  const bfs=(m,sx,sy,pass)=>{pass=pass||'';const D=m.t.map(r=>r.map(()=>-1)),Q=[[sx,sy]];D[sy][sx]=0;for(let q=0;q<Q.length;q++){const [x,y]=Q[q];for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(ny<0||nx<0||ny>=m.t.length||nx>=m.t[0].length||D[ny][nx]>=0)continue;const c=A.tileAt(m,nx,ny);if(A.SOLID.includes(c)&&!pass.includes(c))continue;D[ny][nx]=D[y][x]+1;Q.push([nx,ny]);}}return D;};
  const find=(m,c)=>{for(let y=0;y<m.t.length;y++)for(let x=0;x<m.t[0].length;x++)if(m.t[y][x]===c)return [x,y];};
  o.stages=[];
  for(let s=0;s<5;s++){A.placeAt('d'+s,A.getMap('d'+s).start[0],A.getMap('d'+s).start[1],'d');A.V.modal=null;A.rebuildBase();const m=A.WS.m,st=m.start,lev=find(m,'l'),key=find(m,'K'),door=find(m,'D'),d={s,kb:!!m.keyBarred,w:m.w,h:m.h};
    const D0=bfs(m,st[0],st[1],'');const reach=p=>p&&[[0,1],[1,0],[0,-1],[-1,0]].some(([a,b])=>D0[p[1]+b]&&D0[p[1]+b][p[0]+a]>=0);
    d.leverReach=reach(lev);d.keyReachBefore=reach(key);d.doorReachBefore=reach(door);
    // pull the lever for real, then re-check with the live map
    A.placeAt('d'+s,st[0],st[1],'d');A.V.modal=null;A.G.levers['d'+s]=1;A.rebuildBase();const m2=A.WS.m;
    const D1=bfs(m2,st[0],st[1],'');const reach1=p=>p&&[[0,1],[1,0],[0,-1],[-1,0]].some(([a,b])=>D1[p[1]+b]&&D1[p[1]+b][p[0]+a]>=0);
    d.keyReachAfter=reach1(key);d.doorReachAfter=reach1(door);delete A.G.levers['d'+s];A.rebuildBase();
    d.barsLeft=!!find(A.WS.m,'|');o.stages.push(d);}
  A.V.modal={type:'menu',tab:'help'};A.render();o.help=1;
  return o;});
console.log(JSON.stringify(r.stages));
chk('6 every new dungeon has barred key room and lever',r.stages.every(d=>d.kb));
chk('6 lever room is reachable first, the barred key room is not',r.stages.every(d=>d.leverReach&&!d.keyReachBefore));
chk('6 pulling the lever opens the key room and the way to the door',r.stages.every(d=>d.keyReachAfter&&d.doorReachAfter));
chk('6 bars come back after reset',r.stages.every(d=>d.barsLeft));
await done(H);
})();
