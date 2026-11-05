// v0.3.5 1.3: flags town props that float (no grounding), sit in front of a door, or stand on an invalid tile.
// usage: node propaudit.js [seeds]   ; exported check is also used by the negative test at the bottom
const fs=require('fs');
const src=['config.js','data.js','heroes.js','skills.js','items.js','foes.js','zones.js','art.js','engine.js','engine2.js','worldgen.js'].map(f=>fs.readFileSync(__dirname+'/v3/'+f,'utf8')).join('\n');
global.localStorage={getItem:()=>null,setItem:()=>{}};
const A=(new Function(src+`
function render(){}
return {get G(){return G},newGame,getMap,resetMaps,ZS,propIssues:typeof propIssues==='function'?propIssues:null};`))();
const N=+process.argv[2]||40;let tot=0,maps=0;const kinds={},ex=[];
function check(m){return A.propIssues?A.propIssues(m.t,m.bld):[];}
for(let seed=0;seed<N;seed++){A.newGame(['brann','mira','sable']);A.G.run.seed=seed*7919+13;A.resetMaps();
  for(let s=0;s<5;s++){const m=A.getMap('t'+s);maps++;
    check(m).forEach(i=>{tot++;kinds[i.why]=(kinds[i.why]||0)+1;if(ex.length<10)ex.push(`seed${seed} t${s} ${m.theme} ${i.c}@${i.x},${i.y} ${i.why}`);});}}
console.log('maps',maps,'issues',tot,JSON.stringify(kinds));console.log(ex.join('\n'));
// negative: a hand-made grid with a lone banner, a crate on a door-front and a barrel on grass must be flagged
if(A.propIssues){const g=['.........','.HHH.....','.HHH.....','.HdH.....','.........'].map(r=>r.split(''));
  g[3][2]='H';g[4][2]='x';g[4][6]='u';g[2][7]='b';
  const bad=A.propIssues(g,[{x:1,y:1,w:3,h:3,door:[2,3],k:'tavern'}]);
  console.log('negative flagged',bad.length,JSON.stringify(bad.map(b=>b.why)));
  if(bad.length<3){console.log('FAIL negative');process.exit(1);}}
process.exit(tot&&A.propIssues?1:0);
