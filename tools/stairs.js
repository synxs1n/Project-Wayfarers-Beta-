const fs=require('fs');
const src=['config.js','data.js','heroes.js','skills.js','items.js','foes.js','zones.js','art.js','engine.js','engine2.js','worldgen.js'].map(f=>fs.readFileSync(__dirname+'/v3/'+f,'utf8')).join('\n');
global.localStorage={getItem:()=>null,setItem:()=>{}};
const A=(new Function(src+`
function render(){}
return {get G(){return G},newGame,getMap,resetMaps,tileAt,SOLID,ZS,flood,validateDungeon:typeof validateDungeon==='function'?validateDungeon:null};`))();
let n=0,bad=0,dirs={l:0,r:0,d:0,u:0};
for(let seed=0;seed<100;seed++){A.newGame(['brann','mira','sable']);A.G.run.seed=seed*7919+13;A.resetMaps();
 for(let s=0;s<5;s++){const m=A.getMap('d'+s),x=m.start[0],y=m.start[1]-1;n++;if(m.t[y][x]!=='E'){bad++;continue;}
  const open=(a,b)=>!A.SOLID.includes(m.t[b][a]);if(open(x-1,y))dirs.l++;if(open(x+1,y))dirs.r++;if(open(x,y+1))dirs.d++;if(open(x,y-1))dirs.u++;}}
console.log('dungeons',n,'not on stairs',bad,'open neighbours',JSON.stringify(dirs));
