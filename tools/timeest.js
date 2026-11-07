// 6.3: rough time per stage, old single field/dungeon vs new two fields/dungeon. Walking = BFS over passable tiles; a "visit everything" tour = nearest-neighbour over chests.
const fs=require('fs');
const src=['config.js','hooks.js','data.js','heroes.js','skills.js','items.js','foes.js','zones.js','art.js','engine.js','engine2.js','worldgen.js'].map(f=>fs.readFileSync(__dirname+'/v3/'+f,'utf8')).join('\n');
global.localStorage={getItem:()=>null,setItem:()=>{}};
const A=(new Function(src+`function render(){}
return {get G(){return G},newGame,getMap,resetMaps,SOLID,ENC_RATE:typeof ENC_RATE!=='undefined'?ENC_RATE:{}};`))();
function bfs(m,sx,sy){const H=m.t.length,W=m.t[0].length,D=m.t.map(r=>r.map(()=>-1)),Q=[[sx,sy]];D[sy][sx]=0;for(let q=0;q<Q.length;q++){const [x,y]=Q[q];for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=W||ny>=H||D[ny][nx]>=0)continue;if(A.SOLID.includes(m.t[ny][nx]))continue;D[ny][nx]=D[y][x]+1;Q.push([nx,ny]);}}return D;}
function tour(m,sx,sy,pts){let cur=[sx,sy],tot=0,left=pts.slice();while(left.length){const D=bfs(m,cur[0],cur[1]);let bi=-1,bd=1e9;left.forEach((p,i)=>{const d=Math.min(...[[0,1],[1,0],[0,-1],[-1,0]].map(([a,b])=>{const v=D[p[1]+b]&&D[p[1]+b][p[0]+a];return v>=0?v:1e9;}));if(d<bd){bd=d;bi=i;}});if(bi<0)break;tot+=bd;cur=left.splice(bi,1)[0];}return tot;}
function encFrac(m){let e=0,n=0;m.t.forEach(r=>r.forEach(c=>{if(!A.SOLID.includes(c)){n++;if(m.kind==='field'?c===',':c==='.')e++;}}));return e/Math.max(1,n);}
function stat(v2,seeds){const out=[];for(let s=0;s<5;s++)out.push({steps:0,enc:0,chests:0,nodes:0});
  for(let seed=0;seed<seeds;seed++){A.newGame(['brann','mira','sable']);A.G.run.seed=seed*7919+13;A.G.wv=v2?2:1;A.resetMaps();
    for(let s=0;s<5;s++){const ids=v2?['g'+s,'f'+s]:['f'+s],r=out[s];let steps=0,enc=0;
      ids.forEach(id=>{const m=A.getMap(id),D=bfs(m,2,m.sy);const road=D[m.ey][m.bx>0?Math.min(m.bx,m.w-2):m.w-2];
        const pts=(m.chests||[]).map(c=>[c[0],c[1]]).concat((m.nodes||[]).map(n=>[n.x,n.y]));if(m.ent)pts.push(m.ent);
        const t=tour(m,2,m.sy,pts)+Math.max(0,road);steps+=t;enc+=t*encFrac(m)*.62*0.11;r.chests+=(m.chests||[]).length;r.nodes+=(m.nodes||[]).length;});
      const d=A.getMap('d'+s),dd=bfs(d,d.start[0],d.start[1]);const toBoss=dd[d.bossAt[1]+1]?.[d.bossAt[0]]??dd[d.bossAt[1]][d.bossAt[0]];
      const dpts=d.chests.map(c=>[c[0],c[1]]);const dt=tour(d,d.start[0],d.start[1],dpts)+Math.max(0,toBoss);steps+=dt;enc+=dt*encFrac(d)*.8*0.11;r.chests+=d.chests.length;
      r.steps+=steps;r.enc+=enc;}}
  return out.map(r=>({steps:Math.round(r.steps/seeds),enc:+(r.enc/seeds).toFixed(1),chests:+(r.chests/seeds).toFixed(1),nodes:+(r.nodes/seeds).toFixed(1)}));}
const N=+process.argv[2]||12,o=stat(false,N),n=stat(true,N);
console.log('stage | old steps/enc/chests | new steps/enc/chests | old min | new min');
let to=0,tn=0;
for(let s=0;s<5;s++){const mo=o[s].steps/4.2/60+o[s].enc*0.75+o[s].chests*.1+o[s].nodes*.05,mn=n[s].steps/4.2/60+n[s].enc*0.75+n[s].chests*.1+n[s].nodes*.05;to+=mo;tn+=mn;
 console.log(s,'|',o[s].steps,o[s].enc,o[s].chests,'|',n[s].steps,n[s].enc,n[s].chests,'|',mo.toFixed(1),'|',mn.toFixed(1));}
console.log('total minutes old',to.toFixed(0),'new',tn.toFixed(0),'(walking 4.2 tiles/s, 45 s per fight, 6 s per chest, 3 s per node)');
