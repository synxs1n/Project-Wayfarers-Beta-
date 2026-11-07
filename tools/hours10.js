// Phase 10: time and fights per stage in the v0.4.0 world. Walk 4.2 tiles/s, 45 s per fight, encounter rate 11% on grass/dungeon floor (x.75 for tiles never stepped twice)
const fs=require('fs');
const src=['config.js','hooks.js','data.js','heroes.js','skills.js','items.js','foes.js','zones.js','art.js','engine.js','engine2.js','worldgen.js','world4.js'].map(f=>fs.readFileSync(__dirname+'/v3/'+f,'utf8')).join('\n');
global.localStorage={getItem:()=>null,setItem:()=>{}};
const A=(new Function(src+`function render(){}
return {get G(){return G},newGame,getMap,resetMaps,SOLID};`))();
function bfs(m,sx,sy){const g=m.t,H=g.length,W=g[0].length,D=g.map(r=>r.map(()=>-1)),Q=[[sx,sy]];D[sy][sx]=0;for(let q=0;q<Q.length;q++){const [x,y]=Q[q];for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=W||ny>=H||D[ny][nx]>=0||A.SOLID.includes(g[ny][nx]))continue;D[ny][nx]=D[y][x]+1;Q.push([nx,ny]);}}return D;}
const N=+process.argv[2]||8,out=[0,1,2,3,4].map(()=>({n:0,fs:0,ff:0,fw:0,fwf:0,ds:0,df:0}));
for(let seed=0;seed<N;seed++){A.newGame(['brann','mira','sable']);A.G.wv=3;A.G.run.seed=seed*7919+13;A.resetMaps();
 for(let s=0;s<5;s++){const f=A.getMap('f'+s),r=out[s];const st=f.gates.start,D=bfs(f,st.arrive[0],st.arrive[1]);
  const g=f.gateIn||f.exits[1]&&[f.exits[1].x,f.exits[1].y];const need=D[g[1]][g[0]];
  // road steps through encounter tiles
  let fl=0,n=0;f.t.forEach(rw=>rw.forEach(c=>{if(!A.SOLID.includes(c)){n++;if(c===',')fl++;}}));const ef=fl/n;
  const ch=f.chests.length;const steps=need*1.15;// the main road plus a little wandering
  const full=need+ch*14+60;// chests are off the road: ~14 steps each way-ish, plus the cave detour
  const fights=(st)=>st*ef*1.6*.11*.75;// road tiles are mostly grass edge; 1.6 = grass tiles near the road per step
  r.n++;r.fs+=steps;r.ff+=fights(steps);r.fw+=steps/4.2/60+fights(steps)*.75;r.fwf+=full/4.2/60+fights(full)*.75+ch*.1;
 }}
console.log('stage | field road steps | fights | min (road only) | min (explore chests)');
out.forEach((r,i)=>console.log(i,'|',(r.fs/r.n).toFixed(0),'|',(r.ff/r.n).toFixed(1),'|',(r.fw/r.n).toFixed(1),'|',(r.fwf/r.n).toFixed(1)));
