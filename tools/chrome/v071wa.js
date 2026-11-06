// Beta v0.7.1 world pass, part 1: what is drawn and what blocks agree, on every map kind.
// For N journeys (default 80, 320 to 400 maps of each outdoor and dungeon kind) it builds every town, field, dungeon, cave and fortress, plus
// the two interiors (the Archive and the Echo sanctum), and runs drawAudit (pathguard.js): tiles that block but show nothing in 2D or HD-2D,
// walkable holes in a drawn building, loose decor on a door apron (the step, either side of it, below it), door steps and apron tiles the
// strict reach cannot get to. Twice: the old build (path guard off, v0.7.1 lane and entry fixes off (__W71OFF), HD-2D card half a
// pixel into the next tile) to show the bug, then the
// real build. Usage: PWHTML=../../out/aurelis3.html node v071wa.js [N]
const {open,chk,done}=require('./pw');const N=+process.argv[2]||80;
(async()=>{
const H=await open({w:430,h:880,mobile:true});const {ev}=H;
await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;});
const scan=async old=>ev(([N,old,EX])=>{window.__EXN=EX[0];window.__EXK=EX[1];const A=__A,G=A.G,W=A.W71,o={maps:{},hidden:{},holes:{},apron:{},door:{},props:0,ex:[],err:[],shops:0};
  window.__PGOFF=old;window.__W71OFF=old;const cin=A.HD2D.cardIn;A.HD2D.cardIn=old?-.5:cin;const seed0=G.run.seed,ord0=G.run.order.slice();
  const add=(k,id,r)=>{o.maps[k]=(o.maps[k]||0)+1;o.props+=r.props;['hidden','holes','apron','door'].forEach(q=>{if(r[q].length){o[q][k]=(o[q][k]||0)+r[q].length;if(o.ex.length<(window.__EXN||10)&&(!window.__EXK||window.__EXK.includes(k)))o.ex.push(q+' '+id+' seed'+G.run.seed+' '+r[q].slice(0,2).map(t=>(t.c||'')+'@'+t.x+','+t.y+' '+(t.why||t.b||'')+(t.side?' '+t.side:'')).join(' | '));}});};
  try{for(let k=0;k<N;k++){G.run.seed=k*7919+101;
    // every journey puts other realms at each stage, so every realm's town shows up at every stage
    const NZ=A.ZONES.length;G.run.order=ord0.map((z,i)=>(k*5+i*7)%NZ);
    G.sub=null;A.resetMaps();
    for(let s=0;s<5;s++){const ids=['t'+s,'f'+s,'d'+s];let f;try{f=A.getMap('f'+s);}catch(e){o.err.push('f'+s+':'+e.message);continue;}(f.caves||[]).forEach(c=>ids.push(c.id));
      for(const id of ids){let m;try{m=A.getMap(id);}catch(e){o.err.push(id+':'+e.message);continue;}const kind=m.fort?'fort':m.cave?'cave':m.kind;
        if(kind==='town')o.shops+=(m.bld||[]).filter(b=>b.door).length;
        try{add(kind,id,W.drawAudit(m));}catch(e){o.err.push(id+':'+e.message);}}}}
    ['a0','s0'].forEach(id=>{try{const m=A.getMap(id);add('interior',id,W.drawAudit(m));}catch(e){o.err.push(id+':'+e.message);}});}
  finally{G.run.seed=seed0;G.run.order=ord0;A.HD2D.cardIn=cin;A.resetMaps();window.__PGOFF=false;window.__W71OFF=false;}return o;},[N,old,[+process.env.EXN||10,process.env.EXK||'']]);
const sum=o=>['hidden','holes','apron','door'].map(q=>q+' '+JSON.stringify(o[q])).join('; ');
const raw=await scan(true);console.log('old build:',JSON.stringify(raw.maps));console.log('  '+sum(raw));raw.ex.forEach(e=>console.log('   ',e));
chk('the old build has blocked tiles that show nothing or decor on door aprons (bug reproduced)',Object.keys(raw.hidden).length+Object.keys(raw.apron).length>0||'none found');
const r=await scan(false);console.log('now:',JSON.stringify(r.maps),'props checked',r.props,'door aprons',r.shops);console.log('  '+sum(r));r.ex.forEach(e=>console.log('   ',e));
['town','field','dungeon','cave','fort'].forEach(k=>chk(`${k}: ${r.maps[k]||0} maps (>= 300), no tile blocks without showing anything, no hole in a building`,(r.maps[k]||0)>=300&&!r.hidden[k]&&!r.holes[k]||`${r.maps[k]} maps, hidden ${r.hidden[k]||0}, holes ${r.holes[k]||0}`));
chk(`interiors (${r.maps.interior||0}): nothing hidden`,(r.maps.interior||0)===2&&!r.hidden.interior&&!r.holes.interior||JSON.stringify([r.hidden.interior,r.holes.interior]));
chk(`every door apron free of decor (${r.shops} doors)`,!Object.keys(r.apron).length||JSON.stringify(r.apron));
chk('every door step and open apron tile reachable',!Object.keys(r.door).length||JSON.stringify(r.door));
chk('no generation errors',r.err.length===0||r.err.slice(0,4).join(' '));
await done(H);})();
