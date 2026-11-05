// v0.4.0 1.5: stairs are protected. Counts how often the OLD generator put the stairs on or beside a needed route, proves the new one never does,
// and keeps a hand built failing case that reproduces the original bug.
const fs=require('fs');
const src=['config.js','data.js','heroes.js','skills.js','items.js','foes.js','zones.js','art.js','engine.js','engine2.js','worldgen.js'].map(f=>fs.readFileSync(__dirname+'/v3/'+f,'utf8')).join('\n');
global.localStorage={getItem:()=>null,setItem:()=>{}};
const A=(new Function(src+`
function render(){}
return {get G(){return G},newGame,getMap,resetMaps,SOLID,ZS,mulberry,buildDungeon,dungeonOk,stairsBad,fixStairs,validateDungeon};`))();
let fail=0;const chk=(n,c)=>{console.log((c===true?'PASS ':'FAIL ')+n+(c===true?'':' -> '+c));if(c!==true)fail++;};
// ---- the original bug as a failing fixture: a corridor runs north through the stairs
{const rows=['##########','#........#','#...E....#','#........#','##########'].map(r=>r.split(''));
 // stairs on the only way east: corridor tile row 2 passes through x=4
 const g=['###########','#.........#','#####E#####','#####.#####','#####.#####','#....S....#','###########'];
 const grid=g.map(r=>r.replace('S','.').split(''));
 const d={rows:grid,start:[5,5],boss:[5,3],chests:[],wander:[1,5]};
 // key room beyond the stairs: put the key at the far side so the route must cross 'E'
 grid[1][9]='K';
 const b=A.stairsBad(d);
 chk('fixture: stairs on the only route are flagged',b.some(x=>x.startsWith('stairs-on-route'))||JSON.stringify(b));
 chk('fixture: validateDungeon reports it too',A.validateDungeon(d).some(x=>x.startsWith('stairs'))||JSON.stringify(A.validateDungeon(d)));
}
// ---- sweep
for(const wv of [1,2]){
 let n=0,oldBad=0,moved=0,stillBad=0,unfixable=0;
 for(let seed=0;seed<120;seed++){A.newGame(['brann','mira','sable']);A.G.wv=wv;A.G.run.seed=seed*7919+13;A.resetMaps();
  for(let s=0;s<5;s++){const th=A.ZS(s).theme;
   // the first accepted layout of the old pipeline
   let d=null;for(let a=0;a<80;a++){const R=A.mulberry(A.G.run.seed+777+s*53+a*101);const q=A.buildDungeon(R,th);if(q&&A.dungeonOk(q)){d=q;break;}}
   if(!d)continue;n++;const before=A.stairsBad(d);if(before.length)oldBad++;
   const mv=A.fixStairs(d);if(mv)moved++;if(before.length&&!mv)unfixable++;
   if(A.stairsBad(d).length&&mv)stillBad++;}}
 console.log(`wv${wv}: dungeons ${n}, old pipeline had stairs on/beside a route in ${oldBad} (${(oldBad/n*100).toFixed(1)}%), relocated ${moved}, unfixable ${unfixable}`);
 chk(`wv${wv}: relocated stairs are always safe`,stillBad===0||stillBad);
 // and the real generator
 let bad=0,tot=0;for(let seed=0;seed<60;seed++){A.newGame(['brann','mira','sable']);A.G.wv=wv;A.G.run.seed=seed*104729+5;A.resetMaps();for(let s=0;s<5;s++){const m=A.getMap('d'+s);tot++;const d={rows:m.t,start:m.start,boss:m.bossAt,chests:m.chests,wander:m.wander};if(A.stairsBad(d).length)bad++;}}
 chk(`wv${wv}: getMap dungeons (${tot}) never have stairs on or beside a route`,bad===0||bad);
}
console.log(fail?'FAILS '+fail:'ALL PASS');process.exit(fail?1:0);
