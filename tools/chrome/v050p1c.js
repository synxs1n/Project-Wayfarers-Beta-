// Beta v0.5.0 1.3: no stairs, chest, lever, prop, decor or standing NPC on a path tile, in every field, town, dungeon, cave and fortress.
// Runs N seeds (default 110 = 550 dungeons) twice: raw generation (guard off) to show the old bug, then the real build.
const {open,chk,done}=require('./pw');const N=+process.argv[2]||110;
(async()=>{
const H=await open({w:430,h:880,mobile:true});const {ev}=H;
await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;});
const scan=async off=>ev(([N,off])=>{const A=__A,G=A.G,o={maps:{},bad:{},ex:[],issues:0,err:[]};window.__PGOFF=off;const seed0=G.run.seed;
  for(let k=0;k<N;k++){G.run.seed=k*7919+101;G.sub=null;A.resetMaps();
    for(let s=0;s<5;s++){const ids=['t'+s,'f'+s,'d'+s];let f;try{f=A.getMap('f'+s);}catch(e){o.err.push('f'+s+':'+e.message);continue;}(f.caves||[]).forEach(c=>ids.push(c.id));
      for(const id of ids){let m;try{m=A.getMap(id);}catch(e){o.err.push(id+':'+e.message);continue;}const kind=m.fort?'fort':m.cave?'cave':m.kind;o.maps[kind]=(o.maps[kind]||0)+1;
        const b=A.pathAssets(m);if(b.length){o.bad[kind]=(o.bad[kind]||0)+1;if(o.ex.length<6)o.ex.push(id+' seed'+G.run.seed+' '+b.slice(0,3).map(q=>q.c+'@'+q.x+','+q.y+' '+q.why).join(' | '));}
        if(!off&&A.mapIssues(m).length)o.issues++;}}}
  G.run.seed=seed0;A.resetMaps();window.__PGOFF=false;return o;},[N,off]);
const raw=await scan(true);console.log('raw (guard off):',JSON.stringify(raw.bad),raw.ex.slice(0,3).join('\n  '));
chk('the old generation does put assets on paths (bug reproduced)',Object.keys(raw.bad).length>0||'none found');
const r=await scan(false);console.log('maps:',JSON.stringify(r.maps));
chk(`dungeons scanned >= 500 (${r.maps.dungeon})`,r.maps.dungeon>=500);
['town','field','dungeon','cave','fort'].forEach(k=>chk(`${k}: ${r.maps[k]||0} maps, none with an asset on a path tile`,(r.maps[k]||0)>0&&!r.bad[k]||((r.bad[k]||0)+' bad: '+r.ex.join(' || '))));
chk('every target still reachable after the guard',r.issues===0||r.issues);
chk('no generation errors',r.err.length===0||r.err.slice(0,4).join(' '));
await done(H);})();
