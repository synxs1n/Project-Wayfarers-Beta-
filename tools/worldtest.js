const fs=require('fs');
const src=['config.js','hooks.js','data.js','heroes.js','skills.js','items.js','foes.js','zones.js','realmdata.js','art.js','engine.js','engine2.js','worldgen.js','world4.js'].map(f=>fs.readFileSync(__dirname+'/v3/'+f,'utf8')).join('\n');
global.localStorage={getItem:()=>null,setItem:()=>{}};
const A=(new Function(src+`
function render(){}
return {REALM_STD,REALM_CAL,ZONES,get G(){return G},newGame,getMap,resetMaps,tileAt,SOLID,ZS,flood,worldPlan,SIDE_OPP,dunStepsTo,caveOk,CAVE_NAMES,validateDungeon:typeof validateDungeon==='function'?validateDungeon:null};`))();
let fails=0;const out=[];const DN={n:0,ok:0,fx:{},withDecor:0,echo:0};
function fl(m,sx,sy,extra){const ok=c=>!A.SOLID.includes(c)||(extra||'').includes(c);const g=m.t.map(r=>r.slice());
  const H=g.length,W=g[0].length,seen=g.map(r=>r.map(()=>false)),st=[[sx,sy]];
  while(st.length){const [x,y]=st.pop();if(x<0||y<0||x>=W||y>=H||seen[y][x])continue;if(!ok(g[y][x]))continue;seen[y][x]=true;st.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);}return seen;}
const adj=(S,x,y)=>[[0,1],[1,0],[0,-1],[-1,0]].some(([a,b])=>S[y+b]&&S[y+b][x+a]);
const N=+process.argv[2]||40;
for(let seed=0;seed<N;seed++){
  A.newGame(['brann','mira','sable']);A.G.wv=2;A.G.run.seed=seed*7919+13;A.resetMaps();
  for(let s=0;s<5;s++){
    const tag=`seed${seed} s${s} ${A.ZS(s).theme}`;
    const t=A.getMap('t'+s),S=fl(t,0,t.road);
    const err=[];
    t.exits.forEach(e=>{if(!S[e.y][e.x])err.push('exit '+e.x+','+e.y);});if(t.exits.length<6)err.push('narrow gates '+t.exits.length);
    t.bld.forEach(b=>{if(['inn','tavern','smithy','guild','workshop'].includes(b.k)&&!S[b.door[1]+1]?.[b.door[0]])err.push('door '+b.k);});
    t.t.forEach((r,y)=>r.forEach((c,x)=>{if((c==='W'||c==='q')&&!adj(S,x,y))err.push('unreach '+c);}));
    if(!S[t.road][t.w-1])err.push('east exit');
    const g1=A.getMap('g'+s),G1=fl(g1,0,g1.sy);
    if(g1.part!==1)err.push('g part');if(!G1[g1.ey][g1.w-1])err.push('g east exit');g1.chests.forEach(([x,y])=>{if(!adj(G1,x,y))err.push('gchest '+x+','+y);});
    if(g1.t.some(r=>r.includes('E')||r.includes('G')))err.push('g has dungeon/gate');
    if(t.exits[1].to.m!=='g'+s)err.push('town east exit');if(g1.exits.length<2||g1.exits[1].to.m!=='f'+s)err.push('g exits');
    DN.gsz=g1.w+'x'+g1.h;DN.gch=(DN.gch||0)+g1.chests.length;
    const f=A.getMap('f'+s),F=fl(f,0,f.sy);DN.fsz=f.w+'x'+f.h;DN.fch=(DN.fch||0)+f.chests.length;if(f.exits[0].to.m!=='g'+s)err.push('f west exit');
    if(!F[f.ent[1]+1]?.[f.ent[0]])err.push('field entrance');if(f.t[f.ent[1]][f.ent[0]]!=='E'||f.t[f.ent[1]-1][f.ent[0]]!=='U')err.push('facade broken');
    if(!F[f.ey][f.bx-1])err.push('gate west');
    f.chests.forEach(([x,y])=>{if(!adj(F,x,y))err.push('chest '+x+','+y);});
    const F2=fl(f,0,f.sy,'G');if(s<4&&!F2[f.ey][f.w-1])err.push('east after gate');
    const d=A.getMap('d'+s),D1=fl(d,d.start[0],d.start[1]);
    let key=null;d.t.forEach((r,y)=>r.forEach((c,x)=>{if(c==='K')key=[x,y];}));
    if(!key||!adj(D1,key[0],key[1]))err.push('key');
    const D2=fl(d,d.start[0],d.start[1],'D');
    if(!adj(D2,d.bossAt[0],d.bossAt[1]))err.push('boss');
    if(adj(D1,d.bossAt[0],d.bossAt[1]))err.push('boss reachable w/o key');
    let lev=null;d.t.forEach((r,y)=>r.forEach((c,x)=>{if(c==='l')lev=[x,y];}));
    if(lev&&!adj(D2,lev[0],lev[1]))err.push('lever');
    const D3=fl(d,d.start[0],d.start[1],'D|');d.chests.forEach(([x,y])=>{if(!adj(D3,x,y))err.push('dchest');});
    if(!D1[d.start[1]][d.start[0]])err.push('start');
    // Beta v0.3.2: the story echo waits on the boss's rune circle (solid X): reachable through the boss door, and every other target is reachable without passing it
    if(d.t[d.bossAt[1]][d.bossAt[0]]==='X'&&adj(D2,d.bossAt[0],d.bossAt[1]))DN.echo++;else err.push('echo spot');
    DN.n++;if(A.validateDungeon){const v=A.validateDungeon({rows:d.t,start:d.start,boss:d.bossAt,chests:d.chests,wander:d.wander});if(v.length){err.push('validate '+v.join('/'));}else DN.ok++;}
    Object.keys(d.fixed||{}).forEach(k=>{DN.fx[k]=(DN.fx[k]||0)+d.fixed[k];});if(d.fixed&&Object.keys(d.fixed).some(k=>k!=='wanderer'))DN.withDecor++;
    if(err.length){fails++;out.push(tag+': '+err.join(', '));}
  }
}
console.log('fails',fails);console.log('field sizes',DN.gsz,DN.fsz,'avg chests g/f',(DN.gch/DN.n).toFixed(1),(DN.fch/DN.n).toFixed(1));console.log(out.slice(0,40).join('\n'));console.log(`echo spots: ${DN.echo}/${DN.n} valid (on the rune circle, reachable through the boss door, blocking nothing)`);console.log(`dungeons: ${DN.n} generated, ${DN.ok} pass validation (key before boss door, lever before vault, exit, chests, wanderer clear)`);console.log('fixes the generator applied: decor tiles cleared off routes',JSON.stringify(DN.fx),'in',DN.withDecor,'dungeons');

// ===== v0.4.0 Phase 5: the connected world (wv 3) =====
if(!process.argv.includes('--legacy-only')){
const V3={dun:{},seeds:0,fields:0,towns:0,caves:0,gatesOk:0,pairs:0,dirs:{},caveKinds:{},errs:{},fsz:'',graphOk:0};
const add=(k,t)=>{(V3.errs[k]=V3.errs[k]||[]).push(t);};
const fl2=(m,sx,sy,ex)=>A.flood(m.t,sx,sy,0,c=>!A.SOLID.includes(c)||(ex||'').includes(c));
const NN=+process.argv[3]||N;
for(let seed=0;seed<NN;seed++){
  A.newGame(['brann','mira','sable']);A.G.run.seed=seed*7919+13;
  if(process.argv.includes('--rv2')){let q=seed*2654435761>>>0;const rnd=()=>{q=(q*1103515245+12345)>>>0;return q/4294967296;};const st=A.REALM_STD.slice().sort(()=>rnd()-.5).slice(0,4);A.G.run.order=st.concat([A.REALM_CAL[seed%4]]);A.G.run.rv=2;
    st.concat([A.REALM_CAL[seed%4]]).forEach((r,i)=>{V3.realm=V3.realm||{};const n=A.ZONES[r].n;V3.realm[n]=V3.realm[n]||{n:0,err:0};V3.realm[n].n++;});}
  A.resetMaps();V3.seeds++;
  const P=A.worldPlan();
  // graph: nodes are maps, edges are gate links; walk it from town 0 with every sealed gate opened in order
  const reach=new Set(['t0']),Q=['t0'];
  for(let s=0;s<5;s++){
    const tag='seed'+seed+' s'+s;
    try{
      const t=A.getMap('t'+s),f=A.getMap('f'+s);V3.towns++;V3.fields++;V3.fsz=f.w+'x'+f.h+' (or turned)';
      const S=fl2(t,1,t.road);
      ['prev','next'].forEach(g=>{const r=t.gates[g];if(!r){if(!(g==='prev'&&s===0))add('town gate missing',tag+' '+g);return;}
        if(!S[r.arrive[1]]||!S[r.arrive[1]][r.arrive[0]])add('town arrive unreachable',tag+' '+g);
        const es=t.exits.filter(e=>e.to&&e.to.g===(g==='next'?'start':'end'));if(es.length<3)add('town gate narrow',tag+' '+g);
        es.forEach(e=>{if(!S[e.y][e.x])add('town exit unreachable',tag+' '+g);});V3.gatesOk++;
        V3.dirs[g+':'+r.side]=(V3.dirs[g+':'+r.side]||0)+1;});
      t.bld.forEach(b=>{if(['inn','tavern','smithy','guild','workshop'].includes(b.k)&&!S[b.door[1]+1]?.[b.door[0]])add('town door',tag+' '+b.k);});
      t.t.forEach((r,y)=>r.forEach((c,x)=>{if((c==='W'||c==='q')&&!adj(S,x,y))add('town unreachable '+c,tag);}));
      const F=fl2(f,f.gates.start.arrive[0],f.gates.start.arrive[1]);
      if(!F[f.gates.start.arrive[1]][f.gates.start.arrive[0]])add('field arrive solid',tag);
      f.exits.filter(e=>e.to&&e.to.g==='start'||e.to&&e.to.g==='prev').forEach(e=>{});
      if(f.gates.start.side!==A.SIDE_OPP[t.gates.next.side])add('pair town.next/field.start',tag);
      if(t.exits.some(e=>e.to&&e.to.g==='start'&&e.to.m!=='f'+s))add('town.next target',tag);
      f.exits.filter(e=>e.to&&e.to.m==='t'+s).forEach(e=>{if(!F[e.y][e.x])add('field start exit unreachable',tag);});
      if(f.exits.filter(e=>e.to&&e.to.m==='t'+s).length<3)add('field start narrow',tag);
      V3.pairs++;
      if(s<4){const t2=A.getMap('t'+(s+1));
        if(!t2.gates.prev||f.gates.end.side!==A.SIDE_OPP[t2.gates.prev.side])add('pair field.end/town.prev',tag);
        const F2=fl2(f,f.gates.start.arrive[0],f.gates.start.arrive[1],'G'),ee=f.exits.filter(e=>e.to&&e.to.m==='t'+(s+1));
        if(ee.length<3)add('field end narrow '+ee.length,tag);
        ee.forEach(e=>{if(!F2[e.y][e.x])add('field end unreachable after gate',tag);if(F[e.y][e.x])add('field end open before gate',tag);});
        if(f.gateIn&&!F[f.gateIn[1]][f.gateIn[0]])add('gate approach unreachable',tag);
        V3.pairs++;reach.add('f'+s);reach.add('t'+(s+1));}
      else reach.add('f4');
      if(!F[f.entOut[1]][f.entOut[0]])add('entrance unreachable',tag);
      if(f.t[f.ent[1]][f.ent[0]]!=='E')add('entrance tile',tag);
      f.chests.forEach(([x,y])=>{if(!adj(F,x,y))add('field chest',tag);});
      if(f.t[f.gateAt[1]][f.gateAt[0]]!=='G')add('gate tile',tag);
      // the dungeon: valid, and hung off this field
      const d=A.getMap('d'+s),dv=A.validateDungeon({rows:d.t,start:d.start,boss:d.bossAt,chests:d.chests,wander:d.wander,keyBarred:d.keyBarred});if(dv.length)add('dungeon invalid '+dv.join('/'),tag);
      {const R=V3.dun[s]=V3.dun[s]||{n:0,ok:0,rooms:0,route:0,lever:0,chests:0};R.n++;if(!dv.length)R.ok++;R.rooms+=d.rooms||0;R.route+=d.route||0;R.chests+=d.chests.length;
       let lv=null,kv=null;d.t.forEach((r,y)=>r.forEach((c,x)=>{if(c==='l')lv=[x,y];if(c==='K')kv=[x,y];}));if(lv)R.lever+=A.dunStepsTo(d.t,d.start,'',lv);
       if(!d.keyBarred)add('dungeon not v3',tag);if(d.t.flat().filter(c=>c==='l').length!==1)add('lever count',tag);if(A.dunStepsTo(d.t,d.start,'',kv)>=0)add('key reachable without lever',tag);}
      // caves
      if(!!P[s].cave!==(f.caves.length>0))add('cave missing',tag);
      f.caves.forEach(c=>{V3.caves++;V3.caveKinds[c.kind]=(V3.caveKinds[c.kind]||0)+1;if(!F[c.out[1]][c.out[0]])add('cave unreachable',tag);
        const k=A.getMap(c.id);if(!A.caveOk({rows:k.t,start:k.start,chests:k.chests}))add('cave invalid',tag);if(k.w*k.h>=d.w*d.h)add('cave not smaller than dungeon',tag);reach.add(c.id);});
    }catch(e){add('throw',tag+' '+e.stack.split('\n').slice(0,3).join('|'));}
  }
  // connected from the start to the final area: every field and town reached through gates alone
  if(reach.size>=11)V3.graphOk++;else add('graph not connected',seed+' '+reach.size);
}
console.log('--- v0.4.0 connected world ---');
console.log(JSON.stringify({seeds:V3.seeds,towns:V3.towns,fields:V3.fields,caves:V3.caves,caveKinds:V3.caveKinds,gateRecords:V3.gatesOk,linkPairs:V3.pairs,connectedStartToFinal:V3.graphOk+'/'+V3.seeds,gateSides:V3.dirs}));
console.log('dungeons by realm (stage): count | valid | avg rooms | avg route to boss door | avg steps to lever | avg chests');
Object.keys(V3.dun).forEach(k=>{const r=V3.dun[k];console.log(' '+A.ZS(+k).n+' ('+k+'): '+r.n+' | '+r.ok+' | '+(r.rooms/r.n).toFixed(1)+' | '+(r.route/r.n).toFixed(0)+' | '+(r.lever/r.n).toFixed(0)+' | '+(r.chests/r.n).toFixed(1));});
const tot=Object.values(V3.dun).reduce((a,r)=>({n:a.n+r.n,ok:a.ok+r.ok,rooms:a.rooms+r.rooms,route:a.route+r.route}),{n:0,ok:0,rooms:0,route:0});
console.log('all realms: '+tot.n+' dungeons, '+tot.ok+' valid, avg rooms '+(tot.rooms/tot.n).toFixed(1)+', avg route '+(tot.route/tot.n).toFixed(0)+' steps');
if(V3.realm){console.log('--- v0.4.1 realms (rv2) ---');Object.keys(V3.realm).sort().forEach(k=>console.log(' '+k+': '+V3.realm[k].n+' stage slots'));}
const ek=Object.keys(V3.errs);console.log(ek.length?'V3 FAILS':'V3 ALL OK');ek.forEach(k=>console.log(k,V3.errs[k].length,V3.errs[k].slice(0,3).join(' ; ')));
}
