const fs=require('fs');
const src=['config.js','hooks.js','data.js','heroes.js','skills.js','items.js','foes.js','zones.js','art.js','engine.js','engine2.js','worldgen.js'].map(f=>fs.readFileSync(__dirname+'/v3/'+f,'utf8')).join('\n');
global.localStorage={getItem:()=>null,setItem:()=>{}};
const A=(new Function(src+`
function render(){}
return {get G(){return G},newGame,getMap,resetMaps,SOLID,ZS};`))();
const N=+process.argv[2]||60;const bad={holes:0,stray:0,overlap:0,doorBelow:0,maps:0};const ex=[];
for(let seed=0;seed<N;seed++){A.newGame(['brann','mira','sable']);A.G.run.seed=seed*7919+13;A.resetMaps();
 for(let s=0;s<5;s++)for(const id of ['t'+s,'f'+s]){const m=A.getMap(id);bad.maps++;const cov=m.t.map(r=>r.map(()=>0));
  (m.bld||[]).forEach(b=>{for(let y=b.y;y<b.y+b.h;y++)for(let x=b.x;x<b.x+b.w;x++){cov[y][x]++;if(m.t[y][x]!=='H'){bad.holes++;(bad[id[0]+"_"+m.t[y][x]]=(bad[id[0]+"_"+m.t[y][x]]||0)+1);if(ex.length<8)ex.push(`${id} s${seed} ${b.k} hole ${x},${y} '${m.t[y][x]}'`);}}
   const d=m.t[b.door[1]+1]?.[b.door[0]];if(A.SOLID.includes(d)){bad.doorBelow++;if(ex.length<8)ex.push(`${id} s${seed} ${b.k} door blocked below '${d}'`);}});
  m.t.forEach((r,y)=>r.forEach((c,x)=>{if(cov[y][x]>1)bad.overlap++;if(c==='H'&&!cov[y][x]){bad.stray++;if(ex.length<8)ex.push(`${id} s${seed} stray H ${x},${y}`);}}));}}
console.log(JSON.stringify(bad));console.log(ex.join('\n'));
