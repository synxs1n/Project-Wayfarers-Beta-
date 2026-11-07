// Beta v0.5.0 1.3: no stairs, chest, lever, prop, decor or standing NPC on a path tile, in every field, town, dungeon, cave and fortress.
// Runs N seeds (default 110 = 550 dungeons) twice: raw generation (guard off) to show the old bug, then the real build.
const {open,chk,done}=require('./pw');const N=+process.argv[2]||110;
(async()=>{
// v0.9.9: the journey's realms (drawn from Date.now) decide which themes the scan meets; H.det pins them so every run scans the same maps
const H=await open({w:430,h:880,mobile:true,freeze:true});const {ev}=H;
await H.det(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;});
// v0.9.9: each seed also gets its own realm draw (the same draw realms.js makes for a new journey, from a seed of k), so the scan covers
// many realm orders and every run covers the same ones (the first realm, the one most maps are built for, goes round all of them); before, all seeds shared the one order the journey drew from Date.now
const scan=async off=>ev(([N,off])=>{const A=__A,G=A.G,o={maps:{},bad:{},ex:[],issues:0,err:[]};window.__PGOFF=off;const seed0=G.run.seed,order0=G.run.order.slice();
  const STD=A.TW.get('REALM_STD'),CAL=A.TW.get('REALM_CAL'),seeded=A.TW.get('seeded');
  for(let k=0;k<N;k++){G.run.seed=k*7919+101;G.sub=null;{const R=seeded((k*2654435761+97)>>>0),first=STD[k%STD.length];G.run.order=[first].concat(STD.filter(x=>x!==first).sort(()=>R()-.5).slice(0,3)).concat([CAL[Math.floor(R()*CAL.length)]]);}A.resetMaps();
    for(let s=0;s<5;s++){const ids=['t'+s,'f'+s,'d'+s];let f;try{f=A.getMap('f'+s);}catch(e){o.err.push('f'+s+':'+e.message);continue;}(f.caves||[]).forEach(c=>ids.push(c.id));
      for(const id of ids){let m;try{m=A.getMap(id);}catch(e){o.err.push(id+':'+e.message);continue;}const kind=m.fort?'fort':m.cave?'cave':m.kind;o.maps[kind]=(o.maps[kind]||0)+1;
        const b=A.pathAssets(m);if(b.length){o.bad[kind]=(o.bad[kind]||0)+1;if(o.ex.length<6)o.ex.push(id+' seed'+G.run.seed+' realms '+G.run.order.join('/')+' '+b.slice(0,3).map(q=>q.c+'@'+q.x+','+q.y+' '+q.why).join(' | '));}
        if(!off&&A.mapIssues(m).length)o.issues++;}}}
  G.run.seed=seed0;G.run.order=order0;A.resetMaps();window.__PGOFF=false;return o;},[N,off]);
const raw=await scan(true);console.log('raw (guard off):',JSON.stringify(raw.bad),raw.ex.slice(0,3).join('\n  '));
chk('the old generation does put assets on paths (bug reproduced)',Object.keys(raw.bad).length>0||'none found');
const r=await scan(false);console.log('maps:',JSON.stringify(r.maps));
chk(`dungeons scanned >= 500 (${r.maps.dungeon})`,r.maps.dungeon>=500);
['town','field','dungeon','cave','fort'].forEach(k=>chk(`${k}: ${r.maps[k]||0} maps, none with an asset on a path tile`,(r.maps[k]||0)>0&&!r.bad[k]||((r.bad[k]||0)+' bad: '+r.ex.join(' || '))));
chk('every target still reachable after the guard',r.issues===0||r.issues);
chk('no generation errors',r.err.length===0||r.err.slice(0,4).join(' '));
await done(H);})();
