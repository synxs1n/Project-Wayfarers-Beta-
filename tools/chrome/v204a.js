// towns21.js (v0.22.15): buildings in a town tell each other apart, flat roofed towns get real rooftops.
//  1 in every building family the five service roofs (inn, tavern, smithy, guild, workshop) are pairwise apart (colour distance over 40),
//    and houses at different spots do not all share one roof colour; with towns21 off the old colours come back
//  2 every town of a journey paints with towns21 on (no error), each building from its own variant
//  3 a flat roofed (keep) town in HD-2D: the top faces are laid by towns21 (one per keep building a frame), no error
// Usage (from tools/chrome): PWHTML=<abs path to out/aurelis3.html> node v204a.js
const {open,chk,done}=require('./pw');
setTimeout(()=>{console.log('FAIL watchdog: v204a ran over 240 s');process.exit(1);},240000).unref();
const META=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,gfx:'medium',rmotion:false,hints:false,tips:false}}));`;
(async()=>{const H=await open({w:1000,h:560,pre:META,tag:'v204a'});const {ev,wait}=H;
  await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.G.run.seed=4242;try{A.resetMaps();A.syncPools();}catch(e){}});await wait(300);
  const a=await ev(()=>{const T=window.__T21,hx=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)),d=(p,q)=>{const A=hx(p),B=hx(q);return Math.hypot(A[0]-B[0],A[1]-B[1],A[2]-B[2]);};
    const svc=['inn','tavern','smithy','guild','workshop'],out=[];T.fams().forEach(f=>{const c=svc.map((k,i)=>T.roof(f,{k,x:3+i*5,y:4,w:4}));let mn=1e9;for(let i=0;i<5;i++)for(let j=i+1;j<5;j++)mn=Math.min(mn,d(c[i],c[j]));
      const hs=new Set();for(let i=0;i<12;i++)hs.add(T.roof(f,{k:'house',x:2+i*3,y:5+i,w:3}));out.push({f,mn:Math.round(mn),houses:hs.size});});return out;});
  const bad=a.filter(r=>r.mn<40||r.houses<2);
  chk(`1 ${a.length} families: service roofs apart (least ${Math.min(...a.map(r=>r.mn))}), houses in ${Math.min(...a.map(r=>r.houses))} or more roof colours`,(a.length>=19&&!bad.length)||JSON.stringify(bad));
  const b=await ev(()=>{const A=__A,T=window.__T21.T21,bm=A.TW.get('buildMapCanvas');const n0=T.n.var,out=[];for(let i=0;i<5;i++){const m=A.getMap('t'+i);try{bm(m,0);out.push([m.sty,m.bld.length]);}catch(e){out.push(['ERR '+e.message,0]);}}return {out,vars:T.n.var-n0,err:T.err||null};});
  chk(`2 five towns paint (${b.out.map(o=>o[0]).join(', ')}), ${b.vars} building variants made`,(b.out.every(o=>!String(o[0]).startsWith('ERR'))&&b.vars>10&&!b.err)||JSON.stringify(b));
  const c=await ev(()=>{const A=__A,g=A.TW.get,TF=g('TF14'),keep=window.__T21.keep()[0];const m=A.getMap('t0');m.sty=keep;delete m._bc;try{A.TW.get('hdFreeMap')();}catch(e){}A.placeAt('t0',...A.mapEntry(m),'d');A.V.modal=null;A.render();window.__T21.T21.n.top=0;return {keep,n:m.bld.length};});
  await wait(2500);
  const d2=await ev(()=>({top:window.__T21.T21.n.top,err:window.__T21.T21.err||null,live:!!__A.TW.get('HD').live}));
  chk(`3 a ${c.keep} town in HD-2D: ${d2.top} flat roofs laid by towns21 (HD-2D live ${d2.live})`,(d2.top>=3&&!d2.err&&d2.live)||JSON.stringify(d2));
  await done(H);})();
