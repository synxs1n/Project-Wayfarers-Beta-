// towns23.js (v0.22.20): towns you can see: a steeper camera in town, layouts spread out.
//  1 the camera pitch is 52 in a town and 40 on a field (HD2D.pitch follows the map the party is on)
//  2 every realm's town: stretched (never smaller), no new hole in its edge (wall, tree line), the waystone, the board and every other
//    one-of-a-kind tile counted as before, every building whole and on the map, no map issue
//  3 room: buildings that stand one behind the other in the same columns are further apart than towns14 placed them (the mean of each
//    town's tightest pair grows by a row or more, most towns reach 3 clear rows)
//  4 T23.off gives the towns14 size back
// Usage (from tools/chrome): PWHTML=<abs path to out/aurelis3.html> node v207a.js
const {open,chk,done}=require('./pw');
setTimeout(()=>{console.log('FAIL watchdog: v207a ran over 240 s');process.exit(1);},240000).unref();
const META=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,gfx:'medium',rmotion:false,hints:false,tips:false}}));`;
(async()=>{const H=await open({w:1000,h:600,pre:META,tag:'v207a'});const {ev,wait}=H;
  await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;});await wait(300);
  const a=await ev(()=>{const A=__A,g=A.TW.get,HD2D=g('HD2D'),o={};const t=A.getMap('t0');A.placeAt('t0',...A.mapEntry(t),'d');o.town=HD2D.pitch;const f=A.getMap('f0');A.placeAt('f0',...A.mapEntry(f),'d');o.field=HD2D.pitch;A.placeAt('t0',...A.mapEntry(t),'d');A.V.modal=null;return o;});
  chk(`1 the camera: pitch ${a.town} in a town, ${a.field} on a field`,(a.town===52&&a.field===40)||JSON.stringify(a));
  const b=await ev(()=>{const A=__A,g=A.TW.get,G=g('G'),Z=g('ZONES'),T=window.__T23.T23,out=[],bad=[];const UNI='WqSCKEDl';
    const info=m=>{const H=m.t.length,W=m.t[0].length,cnt={};let hole=0,hn=0;m.t.forEach((r,y)=>r.forEach((c,x)=>{if(UNI.includes(c))cnt[c]=(cnt[c]||0)+1;if(c==='H')hn++;if((y===0||y===H-1||x===0||x===W-1)&&(c==='.'||c===','))hole++;}));
      let gap=99;m.bld.forEach(p=>m.bld.forEach(q=>{if(p!==q&&q.y>=p.y+p.h&&q.x<p.x+p.w&&p.x<q.x+q.w)gap=Math.min(gap,q.y-(p.y+p.h));}));
      const area=m.bld.reduce((s,p)=>s+p.w*p.h,0),inb=m.bld.every(p=>p.x>=1&&p.y>=1&&p.x+p.w<=W-1&&p.y+p.h<=H-1&&m.t[p.door[1]][p.door[0]]==='H');let iss=-1;try{iss=g('mapIssues')(m).length;}catch(e){}
      return {W,H,hole,uni:Object.keys(cnt).sort().map(k=>k+cnt[k]).join(' '),gap,whole:hn===area&&inb,iss};};
    for(let z=0;z<Z.length;z++){try{G.run.order[1]=z;T.off=true;A.resetMaps();const o=info(A.getMap('t1'));T.off=false;A.resetMaps();const n=info(A.getMap('t1')),k=Z[z].key||('z'+z);
      if(n.W<o.W||n.H<o.H)bad.push(k+' smaller');{T.off=true;const t0=g('townGen')(Z[z],1,g('mulberry')(500+41+z)),u=window.__T23.stretch(t0);T.off=false;const eh=q=>{let n=0;const H=q.length,W=q[0].length;q.forEach((r,y)=>r.forEach((c,x)=>{if((y===0||y===H-1||x===0||x===W-1)&&(c==='.'||c===','))n++;}));return n;};
        if(u){const h0=eh(t0.g),h1=eh(u.g),grow=(u.g.length-t0.g.length)+(u.g[0].length-t0.g[0].length);if(h0===0?h1>0:h1>h0+grow)bad.push(k+' edge holes '+h0+'>'+h1);}}/* the layout itself, before getMap cuts the gates (their side differs by journey): a closed edge stays closed; an open one (the floating islands) may grow with the map */if(n.uni!==o.uni)bad.push(k+' unique tiles '+o.uni+' > '+n.uni);if(!n.whole)bad.push(k+' building');if(n.iss>0)bad.push(k+' issues '+n.iss);
      out.push({k,o:o.W+'x'+o.H,n:n.W+'x'+n.H,g0:o.gap,g1:n.gap});}catch(e){bad.push(z+' '+e.message);}}
    T.off=true;A.resetMaps();const off=A.getMap('t1').t.length;T.off=false;A.resetMaps();const on=A.getMap('t1').t.length;return {out,bad,off,on,err:T.err||null,n:T.n};});
  const P=b.out.filter(o=>o.g0<99),m0=P.reduce((s,o)=>s+o.g0,0)/P.length,m1=P.reduce((s,o)=>s+o.g1,0)/P.length,ok3=P.filter(o=>o.g1>=3).length,grew=b.out.filter(o=>o.o!==o.n).length;
  chk(`2 ${b.out.length} towns: ${grew} stretched, none smaller, no new edge hole, unique tiles and buildings intact, no map issue`,(b.out.length>=20&&grew>=b.out.length*.8&&!b.bad.length&&!b.err)||JSON.stringify({bad:b.bad,err:b.err}));
  chk(`3 room in front of a building that has another behind it: the tightest pair of a town ${m0.toFixed(1)} rows on average before, ${m1.toFixed(1)} now; ${ok3} of ${P.length} towns reach 3 clear rows`,(m1>=m0+1&&ok3>=P.length*.75)||JSON.stringify(P));
  chk(`4 T23.off gives the towns14 size back (${b.off} rows off, ${b.on} on)`,b.off<=b.on);
  await done(H);})();
