// towns22.js (v0.22.16): props that mark a building's role.
//  1 every prop kind paints (a canvas with pixels) in four themes, and the kinds differ from each other
//  2 over the towns of a journey: every town gets props, the tavern, smithy and inn each get their own first prop where there is room,
//    each prop stands on plain ground at its building (the front row, a corner, a side, or one step out), never on a door apron, an NPC or a road; the map has no new issue
//  3 nothing is lost: the reach with the props is the reach without them minus the prop tiles; the same town twice gives the same props
//  4 both renderers draw them: the 2D row of a prop differs from the crate it replaces, HD-2D bakes the town without an error
//  5 T22.off: a new town gets no role props
// Usage (from tools/chrome): PWHTML=<abs path to out/aurelis3.html> node v205a.js
const {open,chk,done}=require('./pw');
setTimeout(()=>{console.log('FAIL watchdog: v205a ran over 240 s');process.exit(1);},240000).unref();
const META=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,gfx:'medium',rmotion:false,hints:false,tips:false}}));`;
(async()=>{const H=await open({w:1000,h:560,pre:META,tag:'v205a'});const {ev,wait}=H;
  await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.G.run.seed=4242;try{A.resetMaps();A.syncPools();}catch(e){}});await wait(300);
  const a=await ev(()=>{const A=__A,oc=A.TW.get('objCanvas'),ks=window.__T22.kinds(),sig={},bad=[];
    ks.forEach(k=>['meadow','cave','snow','void'].forEach(t=>{try{const c=oc(t,k),d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0,s=c.width+'x'+c.height+':';for(let i=3;i<d.length;i+=4){if(d[i]>40)n++;s+=d[i]>40?1:0;}if(n<30)bad.push(k+' '+t+' '+n);if(t==='meadow')sig[k]=s;}catch(e){bad.push(k+' '+t+' '+e.message);}}));
    return {n:ks.length,uniq:new Set(Object.values(sig)).size,bad};});
  chk(`1 ${a.n} prop kinds paint in four themes, ${a.uniq} different silhouettes`,(a.n>=14&&a.uniq===a.n&&!a.bad.length)||JSON.stringify(a));
  const b=await ev(()=>{const A=__A,T=window.__T22.T22,out=[],bad=[];A.resetMaps();for(let i=0;i<5;i++){const m=A.getMap('t'+i),rp=m.rp&&m.rp.at;if(!rp){bad.push('t'+i+' none');continue;}
      const first={tavern:'rp_kegs',smithy:'anvil',inn:'rp_bench'},got={};
      Object.keys(rp).forEach(key=>{const [x,y]=key.split(',').map(Number);if(m.t[y][x]!=='x')bad.push('t'+i+' '+key+' tile '+m.t[y][x]);
        const b=m.bld.find(b=>(y===b.y+b.h&&x>=b.x&&x<b.x+b.w)||(y===b.y+b.h+1&&x>=b.x-1&&x<=b.x+b.w)||(y<=b.y+b.h&&y>=b.y+b.h-2&&(x===b.x-1||x===b.x+b.w)));if(!b){bad.push('t'+i+' '+key+' touches no building');return;}
        if(!T.set[b.k]||!T.set[b.k].includes(rp[key]))bad.push('t'+i+' '+key+' '+rp[key]+' at a '+b.k);got[b.k+':'+rp[key]]=1;
        m.bld.forEach(q=>{if(q.door&&Math.abs(x-q.door[0])<=1&&y>q.door[1]&&y<=q.door[1]+2)bad.push('t'+i+' '+key+' on a door apron');});
        if(m.npcs.some(n=>n.x===x&&n.y===y))bad.push('t'+i+' '+key+' on an NPC');});
      const miss=Object.keys(first).filter(k=>m.bld.some(b=>b.k===k)&&!got[k+':'+first[k]]);
      let iss=-1;try{iss=A.TW.get('mapIssues')(m).length;}catch(e){}out.push({t:i,sty:m.sty,n:m.rp.n,miss,iss});if(iss>0)bad.push('t'+i+' issues '+iss);}
    return {out,bad,err:T.err||null};});
  const missAll=b.out.reduce((s,o)=>s+o.miss.length,0);
  chk(`2 five towns: ${b.out.map(o=>o.sty+' '+o.n).join(', ')} props; ${missAll} signature props without room`,(b.out.length===5&&b.out.every(o=>o.n>=3)&&b.out.reduce((s,o)=>s+o.n,0)>=30&&!b.bad.length&&!b.err&&missAll<=8)||JSON.stringify(b));
  const c=await ev(()=>{const A=__A,T=window.__T22.T22,g=A.TW.get,reach=m=>{const R=g('healReach')(m,A.mapEntry(m),true,true);let n=0;R.forEach(r=>r.forEach(v=>{if(v)n++;}));return n;},out=[];
    for(let i=0;i<5;i++){T.off=false;A.resetMaps();const m1=A.getMap('t'+i),r1=reach(m1),k1=JSON.stringify(m1.rp&&m1.rp.at),n=m1.rp?m1.rp.n:0;A.resetMaps();const k2=JSON.stringify(A.getMap('t'+i).rp.at);
      T.off=true;A.resetMaps();const m0=A.getMap('t'+i),r0=reach(m0);T.off=false;out.push({t:i,r0,r1,n,same:k1===k2,off:!m0.rp});}A.resetMaps();return out;});
  chk(`3 the reach loses only the prop tiles (${c.map(o=>o.r0+'>'+o.r1).join(', ')}), the same town twice is the same`,c.every(o=>o.r1>=o.r0-o.n&&o.r1<=o.r0&&o.same)||JSON.stringify(c));
  chk('5 with T22.off a new town gets no role props',c.every(o=>o.off)||JSON.stringify(c));
  const d=await ev(()=>{const A=__A,T=window.__T22.T22,g=A.TW.get,m=A.getMap('t0'),y=+Object.keys(m.rp.rows)[0],TS=16,row=on=>{T.off=!on;const c=document.createElement('canvas');c.width=m.t[0].length*TS;c.height=64;const x=c.getContext('2d');x.setTransform(1,0,0,1,0,-((y+1)*TS-58));g('drawObjects')(x,m,y);T.off=false;const dd=x.getImageData(0,0,c.width,64).data;let s=0;for(let i=0;i<dd.length;i+=4)s=(s*31+dd[i]+dd[i+1]*3+dd[i+3]*7)>>>0;return s;};
    const on=row(true),off=row(false);A.placeAt('t0',...A.mapEntry(m),'d');A.V.modal=null;A.render();return {on,off,kept:m.rp.rows[y].every(p=>m.t[y][p.x]==='x')};});
  await wait(2500);
  const e=await ev(()=>({live:!!__A.TW.get('HD').live,err:window.__T22.T22.err||null,bakes:__A.TW.get('HD').bakes}));
  chk(`4 the prop row draws its own sprites in 2D, the tiles stay crates; HD-2D live ${e.live}, no error`,(d.on!==d.off&&d.kept&&e.live&&!e.err)||JSON.stringify({d,e}));
  await done(H);})();
