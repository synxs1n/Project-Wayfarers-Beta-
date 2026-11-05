// v0.4.1 1.8: share of forward exits (town + field ends) facing east, per journey. node gatetest.js N [old]
const fs=require('fs');const old=process.argv[3]==='old';
const src=['config.js','data.js','heroes.js','skills.js','items.js','foes.js','zones.js','art.js','engine.js','engine2.js','worldgen.js','world4.js'].map(f=>fs.readFileSync(__dirname+'/v3/'+f,'utf8')).join('\n');
global.localStorage={getItem:()=>null,setItem:()=>{}};
const A=(new Function(src+`
function render(){}
return {get G(){return G},newGame,worldPlan,GATE_EAST_MAX};`))();
const N=+process.argv[2]||1000;let tot=0,east=0,over=0,max=0;const hist={};
for(let i=0;i<N;i++){A.newGame(['brann','mira','sable']);A.G.run.seed=i*7919+13;if(old)A.G.dunRev=1;const P=A.worldPlan();
  const e=P.filter(q=>q.tn==='e').length+P.filter(q=>q.fe==='e').length;tot+=10;east+=e;hist[e]=(hist[e]||0)+1;max=Math.max(max,e);if(e>A.GATE_EAST_MAX*10)over++;}
console.log(old?'OLD rules':'NEW rules','journeys',N,'east share',(east/tot*100).toFixed(1)+'%','journeys over the cap:',over,'max east exits of 10:',max,JSON.stringify(hist));
process.exit(over?1:0);
