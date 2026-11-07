// v0.4.1 1.2: raw vs healed blockers across seeds. node healtest.js N [off]
const fs=require('fs');const off=process.argv[3]==='off';
const src=['config.js','hooks.js','data.js','heroes.js','skills.js','items.js','foes.js','zones.js','art.js','engine.js','engine2.js','worldgen.js','world4.js','mapheal.js'].map(f=>fs.readFileSync(__dirname+'/v3/'+f,'utf8')).join('\n');
global.localStorage={getItem:()=>null,setItem:()=>{}};
const A=(new Function((off?'var HEAL_OFF=true;':'')+src+`
function render(){}
return {get G(){return G},newGame,getMap,resetMaps,ZS,mapIssues,healMap,worldPlan};`))();
const N=+process.argv[2]||40;let maps=0,bad=0,healed=0;const kinds={},ex=[];
const lcg=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
for(let seed=1;seed<=N;seed++){Math.random=lcg(seed*31);
  A.newGame(['brann','mira','sable']);A.G.run.seed=seed*7919+13;A.resetMaps();
  const ids=[];for(let s=0;s<=4;s++){ids.push('t'+s,'f'+s,'d'+s);}
  for(const id of ids){let m;try{m=A.getMap(id);}catch(e){continue;}
    const list=[m];(m.caves||[]).forEach(c=>{try{list.push(A.getMap(c.id));}catch(e){}});
    for(const mm of list){maps++;const iss=A.mapIssues(mm);const k=mm.kind+(mm.cave?'-cave':'');kinds[k]=(kinds[k]||0)+1;
      if(iss.length){bad++;if(ex.length<5)ex.push(seed+' '+mm.id+' '+JSON.stringify(iss[0]));}
      if(mm.healed&&mm.healed.length)healed+=mm.healed.length;}}
}
console.log((off?'RAW':'HEALED'),'maps',maps,'with blocked targets',bad,'heal actions',healed,JSON.stringify(kinds));ex.forEach(e=>console.log(' ',e));
process.exit(bad?1:0);
