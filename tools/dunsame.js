const fs=require('fs');
const load=dir=>{const src=['config.js','data.js','heroes.js','skills.js','items.js','foes.js','zones.js','art.js','engine.js','engine2.js','worldgen.js'].map(f=>fs.readFileSync(__dirname+'/'+dir+'/'+f,'utf8')).join('\n');return (new Function(src+`\nfunction render(){}\nreturn {get G(){return G},newGame,getMap,resetMaps};`))();};
global.localStorage={getItem:()=>null,setItem:()=>{}};
const A=load('v3_pre_030'),B=load('v3');let same=0,diff=0,decorOnly=0;const fx={};
for(let seed=0;seed<120;seed++)for(let s=0;s<5;s++){[A,B].forEach(X=>{X.newGame(['brann','mira','sable']);X.G.run.seed=seed*7919+13;X.resetMaps();});
  const a=A.getMap('d'+s),b=B.getMap('d'+s);Object.keys(b.fixed||{}).forEach(k=>{fx[k]=(fx[k]||0)+b.fixed[k];});
  let d=0,nd=0;a.t.forEach((r,y)=>r.forEach((c,x)=>{if(c!==b.t[y][x]){d++;if(!('PvgNQL'.includes(c)&&('PvgNQL.'.includes(b.t[y][x])))){nd++;if(nd<3&&process.env.V)console.log(seed,s,x,y,JSON.stringify(c),'->',JSON.stringify(b.t[y][x]));}}}));
  if(!d)same++;else if(!nd)decorOnly++;else diff++;}
console.log(`layouts identical ${same}, decor-only changes ${decorOnly}, different layout ${diff}`);console.log('fixes applied (decor tiles removed, wanderer moves):',JSON.stringify(fx));
