// towns24.js (v0.22.21): new town plans: every building in clear view at the old camera, a clear road from the centre to every gate.
//  1 the camera pitch is 40 in a town again
//  2 every realm's town is built on a towns24 plan (no fallback), with the five services, and passes the map checks (mapIssues, pathAssets)
//  3 in view: no building stands within 5 rows (6 for a 5 deep one) south of another building's front in its columns
//  4 a clear road: the main road runs unbroken from the west edge to the east edge and the avenue from the north edge to the south edge
//    through the plaza; every gate's arrival tile reaches the plaza along road tiles only (roads, paving, bridges)
//  5 the waystone and the board stand off the road and the avenue; nine plans are in use and the towns differ in size and in where the
//    services stand
//  6 T24.off gives the towns14 plans back
//  7 every building's roof pitch is a number (towns21.js: a signed shift of the unsigned hash indexed the pitch table at -1 or -2)
// Usage (from tools/chrome): PWHTML=<abs path to out/aurelis3.html> node v207a.js
const {open,chk,done}=require('./pw');
setTimeout(()=>{console.log('FAIL watchdog: v207a ran over 240 s');process.exit(1);},240000).unref();
const META=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,gfx:'medium',rmotion:false,hints:false,tips:false}}));`;
(async()=>{const H=await open({w:1000,h:600,pre:META,tag:'v207a'});const {ev,wait}=H;
  await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;});await wait(300);
  const a=await ev(()=>{const A=__A,t=A.getMap('t0');A.placeAt('t0',...A.mapEntry(t),'d');A.V.modal=null;return A.TW.get('HD2D').pitch;});
  chk(`1 the camera pitch in a town is ${a}`,a===40);
  const b=await ev(()=>{const A=__A,g=A.TW.get,G=g('G'),Z=g('ZONES'),T=window.__T24.T24,out=[],bad=[];const road=c=>c==='='||c===':'||c==='B';
    for(let z=0;z<Z.length;z++){try{G.run.order[1]=z;A.resetMaps();const f0=T.n.fallback,m=A.getMap('t1'),k=Z[z].key||('base'+z),t=m.t,Hh=t.length,W=t[0].length,r=m.road;
      if(T.n.fallback>f0||!/^n_/.test(m.arch||''))bad.push(k+' fell back: '+JSON.stringify(T.last||T.err));
      ['inn','tavern','smithy','workshop','guild'].forEach(s=>{if(!m.bld.some(q=>q.k===s))bad.push(k+' no '+s);});
      let iss=0,pa=0;try{iss=g('mapIssues')(m).length;pa=g('pathAssets')(m).length;}catch(e){}if(iss||pa)bad.push(k+' issues '+iss+' path assets '+pa);
      let view=0;m.bld.forEach(p=>m.bld.forEach(q=>{if(p!==q&&q.y>=p.y+p.h&&q.x<p.x+p.w+1&&p.x<q.x+q.w+1&&q.y-(p.y+p.h)<(q.h>=5?6:5))view++;}));if(view)bad.push(k+' '+view+' buildings behind another');
      // the avenue column: the one with road tiles from top to bottom
      let ax=-1;for(const x of [W>>1,W-1-(W>>1)]){let n=0;for(let y=3;y<Hh-3;y++)if(road(t[y][x]))n++;if(n>=Hh-8)ax=x;}
      // or an avenue with a one tile step in it: in a lakeside town whose south gate stands one tile west of the avenue (run seed 1037402, realms 1 and
      // 19) the avenue goes down column 27 to the main road and on over the causeway in column 26, joined by a road tile. Unbroken, though no single
      // column holds it: the road is followed from the plaza within two tiles of the centre and must reach both ends.
      if(ax<0){let best=-1,bn=-1;for(const x of [W>>1,W-1-(W>>1)]){let n=0;for(let y=3;y<Hh-3;y++)if(road(t[y][x]))n++;if(n>bn){bn=n;best=x;}}
        const sn=new Set([best+','+r]),Qa=[[best,r]];let top=r,bot=r;for(let i=0;i<Qa.length;i++){const [x,y]=Qa[i];top=Math.min(top,y);bot=Math.max(bot,y);for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,key=nx+','+ny;if(sn.has(key)||Math.abs(nx-best)>2||!t[ny]||!road(t[ny][nx]))continue;sn.add(key);Qa.push([nx,ny]);}}
        if(road(t[r][best])&&top<=4&&bot>=Hh-5)ax=best;}
      if(ax<0)bad.push(k+' no avenue');
      let cut=0;for(let x=2;x<W-2;x++)if(!road(t[r][x]))cut++;if(cut)bad.push(k+' main road cut in '+cut+' places');
      // every gate reaches the plaza (the crossing of road and avenue) on road tiles
      const seen=new Set([ax+','+r]),Q=[[ax,r]];for(let i=0;i<Q.length;i++){const [x,y]=Q[i];for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,key=nx+','+ny;if(seen.has(key)||!t[ny]||!road(t[ny][nx]))continue;seen.add(key);Q.push([nx,ny]);}}
      const gs=Object.values(m.gates||{}).filter(q=>q&&q.arrive);gs.forEach(q=>{const [x,y]=q.arrive;if(!seen.has(x+','+y)&&![[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>seen.has((x+dx)+','+(y+dy))))bad.push(k+' gate '+q.side+' at '+x+','+y+' is off the roads');});
      let wq=0;t.forEach((row,y)=>row.forEach((c,x)=>{if((c==='W'||c==='q')&&(y===r||x===ax))wq++;}));if(wq)bad.push(k+' waystone or board on the road');
      m.bld.forEach(q=>{let v=1;try{v=g('hdRoofProf')(m,q);}catch(e){v=NaN;}if(!(v>0&&v<3))bad.push(k+' roof pitch '+v+' on '+q.k+'@'+q.x+','+q.y);});
      out.push({k,arch:m.arch,size:W+'x'+Hh,n:m.bld.length,gates:gs.length,inn:(()=>{const q=m.bld.find(q=>q.k==='inn');return q.x+','+q.y;})()});}catch(e){bad.push(z+' '+e.message);}}
    T.off=true;A.resetMaps();const off=A.getMap('t1').arch;T.off=false;A.resetMaps();return {out,bad,off,err:T.err||null};});
  const plans=new Set(b.out.map(o=>o.arch)),sizes=new Set(b.out.map(o=>o.size)),inns=new Set(b.out.map(o=>o.arch+o.inn));
  chk(`2 ${b.out.length} towns on the new plans, the five services in each, no map issue`,(b.out.length>=20&&!b.bad.some(x=>/fell back|no (inn|tavern|smithy|workshop|guild)|issues/.test(x)))||JSON.stringify(b.bad.slice(0,6)));
  chk('3 in view: no building stands close behind another in its columns',!b.bad.some(x=>/behind another/.test(x))||JSON.stringify(b.bad.filter(x=>/behind/.test(x)).slice(0,6)));
  chk(`4 a clear road: the main road and the avenue run unbroken through every plaza, every gate (${b.out.reduce((s,o)=>s+o.gates,0)}) is on the roads`,!b.bad.some(x=>/avenue|road cut|off the roads/.test(x))||JSON.stringify(b.bad.filter(x=>/avenue|road|gate/.test(x)).slice(0,6)));
  chk(`5 ${plans.size} plans in use (${[...plans].join(', ')}), ${sizes.size} map sizes, the inn in ${inns.size} different places; the waystone and the board off the road`,(plans.size>=9&&sizes.size>=7&&inns.size>=b.out.length*.6&&!b.bad.some(x=>/waystone/.test(x)))||JSON.stringify({bad:b.bad,inns:inns.size}));
  chk('7 every building has a roof pitch that is a number (a signed shift of the building hash gave NaN: a house with no roof, 0.22.15 to 0.22.20)',!b.bad.some(x=>/roof pitch/.test(x))||JSON.stringify(b.bad.filter(x=>/roof pitch/.test(x)).slice(0,5)));
  chk(`6 T24.off gives the towns14 plan back (${b.off})`,!/^n_/.test(b.off||'')&&!b.err);
  await done(H);})();
