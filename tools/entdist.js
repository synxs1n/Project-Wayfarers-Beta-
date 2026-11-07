const fs=require('fs');const DIR=__dirname+'/'+(process.env.V3DIR||'v3')+'/';
const src=['config.js','hooks.js','data.js','heroes.js','skills.js','items.js','foes.js','zones.js','art.js','engine.js','engine2.js','worldgen.js'].map(f=>fs.readFileSync(DIR+f,'utf8')).join('\n');
global.localStorage={getItem:()=>null,setItem:()=>{}};
const A=(new Function(src+`\nfunction render(){}\nreturn {get G(){return G},newGame,getMap,resetMaps,SOLID};`))();
function bfs(m,sx,sy){const g=m.t,H=g.length,W=g[0].length,D=g.map(r=>r.map(()=>-1)),Q=[[sx,sy]];D[sy][sx]=0;for(let q=0;q<Q.length;q++){const [x,y]=Q[q];for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=W||ny>=H||D[ny][nx]>=0)continue;if(A.SOLID.includes(g[ny][nx]))continue;D[ny][nx]=D[y][x]+1;Q.push([nx,ny]);}}return D;}
const N=+process.argv[2]||200;const R=[];let under=0,unr=0;
for(let seed=0;seed<N;seed++){A.newGame(['brann','mira','sable']);A.G.run.seed=seed*7919+13;A.resetMaps();
  for(let s=0;s<5;s++){const f=A.getMap('f'+s),D=bfs(f,2,f.sy),d=D[f.ent[1]+1][f.ent[0]];
    let road=0;f.t.forEach((r,y)=>r.forEach((c,x)=>{if(x<f.bx&&(c==='='||c==='B'))road++;}));
    if(d<0){unr++;continue;}const r=d/road;R.push(r);if(r<.4)under++;}}
R.sort((a,b)=>a-b);const q=p=>R[Math.floor(p*(R.length-1))].toFixed(2);
console.log(`${process.env.V3DIR||'v3'}: ${R.length} fields, walk distance / road length: min ${q(0)}, p10 ${q(.1)}, median ${q(.5)}, p90 ${q(.9)}; under 0.4: ${under}; unreachable: ${unr}`);
