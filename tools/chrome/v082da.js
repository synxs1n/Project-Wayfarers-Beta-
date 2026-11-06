// v0.8.2 themed dungeons, part 1: map data over many seeds (docs/v082-dungeons.md).
// For every material (dungeon8.js D8M) it builds the main dungeon of a realm that uses it over N journey seeds (default 200), and the side
// caves of each tileset, and checks: the map carries the material; organic materials are reshaped (more wall corners per wall edge than the
// same map built with __D8OFF); every target is reachable and nothing stands on a path (mapIssues, pathAssets: the v050p1c and v071 rules);
// chests, keys, levers, the stairs, the start, the boss and the roamers match the unreshaped build (every 4th seed); building twice gives the
// same tiles. Usage: PWHTML=../../out/aurelis3.html node v082da.js [N]
const {open,chk,done}=require('./pw');const N=+process.argv[2]||200;
(async()=>{
const H=await open({w:430,h:880,mobile:true});const {ev}=H;
await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;});
const plan=await ev(()=>{const A=__A,D=__D8,out={};A.ZONES.forEach((z,i)=>{const st=D.styleFor? null:null;});
  // one realm per material (first in ZONES order), old zones included
  A.ZONES.forEach((z,i)=>{const sv=A.G.run.order[1];A.G.run.order[1]=i;const st=D.styleFor(1,false,false);A.G.run.order[1]=sv;if(!out[st.mat])out[st.mat]={i,key:z.key||'zone'+i,org:st.org};});return out;});
console.log('materials:',JSON.stringify(plan));
const run=(mat,P,N)=>ev(([mat,P,N])=>{const A=__A,G=A.G,D=__D8,o={n:0,mat:0,shaped:0,issues:[],eq:0,eqBad:[],det:0,corner:[0,0],carved:0,pools:0,err:[],caves:0,caveShaped:0,ms:0,cmat:{}};
  const seed0=G.run.seed,ord=G.run.order.slice();
  const corners=m=>{let c=0,e=0;const w=(x,y)=>A.SOLID.includes(A.tileAt(m,x,y))&&A.tileAt(m,x,y)!=='C'&&A.tileAt(m,x,y)!=='c'?1:0;
    for(let y=0;y<m.h-1;y++)for(let x=0;x<m.w-1;x++){const s=w(x,y)+w(x+1,y)+w(x,y+1)+w(x+1,y+1);if(s===1||s===3)c++;if(w(x,y)!==w(x+1,y))e++;if(w(x,y)!==w(x,y+1))e++;}return [c,e];};
  const sig=m=>{const S=[];for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++){const c=m.t[y][x];if('CKlEDX|'.includes(c))S.push(c+x+','+y);}
    return S.join(' ')+'|'+[m.start,m.bossAt,m.wander].map(String).join('|')+'|chests '+(m.chests||[]).map(q=>q.slice(0,2).join(',')+(q[2]||'')).sort().join(' ')+'|roam '+(A.roamSpawn(m)||[]).map(r=>r.mon+(r.elite?'*':'')).join(',');};
  try{for(let k=0;k<N;k++){G.run.seed=k*7919+101;G.run.order=ord.slice();G.run.order[1]=P.i;G.sub=null;A.resetMaps();window.__D8OFF=false;
    const t0=performance.now();let m;try{m=A.getMap('d1');}catch(e){o.err.push(k+':'+e.message);continue;}o.ms+=performance.now()-t0;o.n++;
    if(m.d8===mat)o.mat++;if(m.d8carved>0||(!P.org&&m.d8pools>0))o.shaped++;o.carved+=m.d8carved||0;o.pools+=m.d8pools||0;
    const iss=A.mapIssues(m).length,pa=A.pathAssets(m).length;if(iss||pa)o.issues.push(`seed${G.run.seed} issues ${iss} path ${pa}`);
    const cn=corners(m),s1=sig(m),rows=m.t.map(r=>r.join('')).join('/');
    A.resetMaps();const m2=A.getMap('d1');if(m2.t.map(r=>r.join('')).join('/')===rows)o.det++;
    if(k%4===0){A.resetMaps();window.__D8OFF=true;let m0;try{m0=A.getMap('d1');}finally{window.__D8OFF=false;}const c0=corners(m0);o.corner[0]+=c0[0]/Math.max(1,c0[1]);o.corner[1]+=cn[0]/Math.max(1,cn[1]);
      if(sig(m0)===s1)o.eq++;else if(o.eqBad.length<3)o.eqBad.push('seed'+G.run.seed+' '+sig(m0).slice(0,120)+' VS '+s1.slice(0,120));}
    // side caves of this realm's tileset
    if(k%2===0){A.resetMaps();const f=A.getMap('f1');(f.caves||[]).filter(c=>c.kind!=="fort").forEach(c=>{const q=A.getMap(c.id);o.caves++;o.cmat[q.d8]=1;if(q.d8carved>0)o.caveShaped++;const a=A.mapIssues(q).length+A.pathAssets(q).length;if(a)o.issues.push('cave '+c.id+' seed'+G.run.seed+' '+a);});}}}
  finally{G.run.seed=seed0;G.run.order=ord;window.__D8OFF=false;A.resetMaps();}
  o.ms=Math.round(o.ms/Math.max(1,o.n));return o;},[mat,P,N]);
for(const [mat,P] of Object.entries(plan)){if(process.env.LAIRONLY)break;const n=P.org||mat==='flood'||mat==='forge'?N:Math.max(20,Math.round(N/5));const r=await run(mat,P,n);
  const ratio=r.corner[0]?r.corner[1]/r.corner[0]:1;
  console.log(`${mat} (${P.key}, ${P.org?'organic':'built'}): ${r.n} dungeons, ${r.ms} ms each, carved ${Math.round(r.carved/Math.max(1,r.n))}/map, pools ${Math.round(r.pools/Math.max(1,r.n))}/map, corner density x${ratio.toFixed(2)}, caves ${r.caves} (${r.caveShaped} reshaped)`);
  chk(`${mat}: ${r.n} dungeons (>= ${n}), every one in its material`,r.n>=n&&r.mat===r.n||`${r.mat}/${r.n} ${r.err.slice(0,2)}`);
  chk(`${mat}: every target reachable, nothing on a path (dungeons and caves)`,r.issues.length===0||r.issues.slice(0,4).join('; '));
  chk(`${mat}: chests, keys, levers, stairs, start, boss and roamers match the unreshaped build (${r.eq} of ${Math.ceil(r.n/4)})`,r.eq===Math.ceil(r.n/4)||r.eqBad.join(' || '));
  chk(`${mat}: the same seed builds the same tiles`,r.det===r.n||`${r.det}/${r.n}`);
  if(P.org){chk(`${mat}: organic walls in at least 95% of dungeons (${r.shaped}/${r.n})`,r.shaped>=r.n*.95);chk(`${mat}: wall corners per wall edge up by at least 40% (x${ratio.toFixed(2)})`,ratio>=1.4);}
  else chk(`${mat}: built layout kept (no carving)`,r.carved===0||r.carved);
  chk(`${mat} realm: side caves reshaped (${r.caveShaped}/${r.caves}, materials ${Object.keys(r.cmat)})`,r.caves===0||r.caveShaped>=r.caves*.9);
  chk(`${mat}: no generation errors`,r.err.length===0||r.err.slice(0,3).join(' '));}
// the lair mounds: every stage's field over N seeds
{const r=await ev(N=>{const A=__A,G=A.G,D=__D8,o={n:0,mound:0,big:0,issues:[],hidden:[],out:0,face:{}};const seed0=G.run.seed;
  try{for(let k=0;k<N;k++){G.run.seed=k*7919+101;G.sub=null;A.resetMaps();for(let s=0;s<5;s++){let f;try{A.resetMaps();f=A.getMap('f'+s);}catch(e){continue;}if(!f.ent)continue;o.n++;const L=f.d8lair;
    if(L){o.mound++;if(L.tiles.length>=9)o.big++;o.face[String(L.fv)]=(o.face[String(L.fv)]||0)+1;}
    const iss=A.mapIssues(f).length,pa=A.pathAssets(f).length;if(iss||pa){const keep=A.MAPS;window.__D8OFF=true;A.resetMaps();const f0=A.getMap('f'+s),i0=A.mapIssues(f0).length,p0=A.pathAssets(f0).length;window.__D8OFF=false;A.resetMaps();f=A.getMap('f'+s);
      if(iss>i0||pa>p0)o.issues.push('seed'+G.run.seed+' f'+s+' '+iss+'/'+pa+' (without the mound '+i0+'/'+p0+')');else o.pre=(o.pre||0)+1;}
    if(k%5===0){const sig=f.t.map(r=>r.join('')).join('/');A.resetMaps();const f2=A.getMap('f'+s);if(f2.t.map(r=>r.join('')).join('/')!==sig)o.nondet=(o.nondet||0)+1;f=f2;}
    const h=D.lairHidden(f);if(h.length&&o.hidden.length<4)o.hidden.push('seed'+G.run.seed+' f'+s+' '+JSON.stringify(h[0]));if(h.length)o.out++;
    const E=f.t[f.ent[1]][f.ent[0]];if(E!=='E')o.issues.push('entrance tile '+E);}}}finally{G.run.seed=seed0;A.resetMaps();}return o;},N);
  console.log(`lair mounds: ${r.mound}/${r.n} fields, ${r.big} of 9+ tiles, facing ${JSON.stringify(r.face)}`);
  chk(`lair: a mound around ${r.mound} of ${r.n} entrances (>= 95%), ${r.big} of at least 9 tiles (>= 85%)`,r.mound>=r.n*.95&&r.big>=r.n*.85);
  chk(`lair: no field has more unreachable targets or path assets than without its mound (${r.pre||0} fields with the same ones as before), the entrance tile unchanged`,r.issues.length===0||r.issues.slice(0,4).join('; '));
  chk('lair: the same seed builds the same mound',!r.nondet||r.nondet);
  chk('lair: no prop north of a mound hidden by its real height',r.out===0||r.hidden.join('; '));}
await done(H);})();
