// v0.22.37 (towns37.js): the land under the town plans.
//  1 the island towns (mire, peaks, drowned, shattered) have water and bridges; lakes and bamboo have canals with bridges; grotto, mesa,
//    mines and starless have ledges with stairs; a plain town (orchard) has none of the three
//  2 every one of the 20 realms still gets a towns24 plan (no fallback) that passes both checks, over three journeys
//  3 in every town every gate can be walked to from the plaza, and every building's door from the plaza
// Usage (from tools/chrome): PWHTML=<abs path to out/aurelis3.html> node v220a.js
const {open,chk,done}=require('./pw');
setTimeout(()=>{console.log('FAIL watchdog: v220a ran over 280 s');process.exit(1);},280000).unref();
const META=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,gfx:'low',rmotion:false,hints:false,tips:false}}));`;
(async()=>{const H=await open({w:800,h:600,pre:META,tag:'v220a'});const {ev,wait}=H;const all={land:{},bad:[],n:0,fb:0};
  for(let j=0;j<3;j++){await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;});await wait(200);
    const r=await ev(()=>{const A=__A,g=A.TW.get,Z=g('ZONES'),SOLID=g('SOLID'),out={land:{},bad:[],n:0};const fb0=window.__T24.T24.n.fallback;
      for(const z of Z){if(!z.key)continue;const G=g('G');G.run.order[1]=Z.indexOf(z);A.resetMaps();const m=A.getMap('t1'),t=m.t,Hh=t.length,W=t[0].length;out.n++;
        const cnt=c=>t.reduce((n,row)=>n+row.filter(x=>x===c).length,0);out.land[z.key]={w:cnt('~'),b:cnt('B'),l:cnt('#'),s:cnt('s'),arch:m.arch};
        if(!/^n_/.test(m.arch||''))out.bad.push(z.key+' plan '+m.arch);
        // walk from the plaza
        let st=null;for(let y=0;y<Hh&&!st;y++)for(let x=0;x<W;x++)if(t[y][x]===':'){st=[x,y];break;}if(!st){out.bad.push(z.key+' no plaza');continue;}
        const seen=new Set([st.join()]),Q=[st];for(let i=0;i<Q.length;i++){const [x,y]=Q[i];for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+a,ny=y+b,k=nx+','+ny;if(nx<0||ny<0||nx>=W||ny>=Hh||seen.has(k))continue;if(SOLID.includes(t[ny][nx]))continue;seen.add(k);Q.push([nx,ny]);}}
        Object.entries(m.gates||{}).forEach(([k,q])=>{if(!q||!q.arrive)return;const [gx,gy]=q.arrive;/* the arrival tile or one beside it (the gate tile itself can be an exit tile) */if(![[0,0],[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>seen.has((gx+a)+','+(gy+b))))out.bad.push(z.key+' gate '+k+' cut off at '+gx+','+gy+' '+((t[gy]||[])[gx]));});
        (m.bld||[]).forEach(b=>{if(b.door&&!seen.has(b.door[0]+','+(b.door[1]+1)))out.bad.push(z.key+' door of '+b.k+' cut off');});}
      out.fb=window.__T24.T24.n.fallback-fb0;return out;});
    all.n+=r.n;all.fb+=r.fb;all.bad.push(...r.bad);if(!j)all.land=r.land;}
  const L=all.land,isl=['mire','peaks','drowned','shattered'].map(k=>L[k]),can=['lakes','bamboo'].map(k=>L[k]),ter=['grotto','mesa','mines','starless'].map(k=>L[k]);
  chk(`1 isles (water ${isl.map(o=>o.w)}, bridges ${isl.map(o=>o.b)}); canals (water ${can.map(o=>o.w)}, bridges ${can.map(o=>o.b)}); terraces (ledge ${ter.map(o=>o.l)}, stairs ${ter.map(o=>o.s)}); orchard plain`,
    (isl.every(o=>o.w>150&&o.b>=8)&&can.every(o=>o.w>=20&&o.b>=2)&&ter.every(o=>o.l>=20&&o.s>=3)&&L.orchard.w===0&&L.orchard.l===0)||JSON.stringify(L).slice(0,700));
  chk(`2 ${all.n} towns over three journeys, ${all.fb} fell back to an old plan`,(all.n>=57&&all.fb===0&&!all.bad.some(x=>/ plan /.test(x)))||JSON.stringify([all.fb,all.bad.filter(x=>/ plan /.test(x)).slice(0,6)]));
  const cut=all.bad.filter(x=>/cut off|no plaza/.test(x));
  chk(`3 every gate and every door can be walked to from the plaza (${cut.length} cut off)`,!cut.length||JSON.stringify(cut.slice(0,8)));
  await done(H);})();
