// v0.4.1 1.7: lever placement over N dungeons per realm. node levertest.js N [old]
const fs=require('fs');const old=process.argv[3]==='old';
const src=['config.js','hooks.js','data.js','heroes.js','skills.js','items.js','foes.js','zones.js','art.js','engine.js','engine2.js','worldgen.js','world4.js'].map(f=>fs.readFileSync(__dirname+'/v3/'+f,'utf8')).join('\n');
global.localStorage={getItem:()=>null,setItem:()=>{}};
const A=(new Function(src+`
function render(){}
return {get G(){return G},newGame,getMap,resetMaps,dunDist,dunStepsTo,genDungeon,DUN_LEVER};`))();
const N=+process.argv[2]||100;const lcg=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
const by={},bad={near:0,hops:0,chain:0,n:0};
for(let i=0;i<N;i++)for(let s=0;s<5;s++){
  A.newGame(['brann','mira','sable']);Math.random=lcg(i*7+s);A.G.run.seed=i*7919+13;A.resetMaps();if(old)A.G.dunRev=1;
  let m;try{m=A.getMap('d'+s);}catch(e){continue;}
  // independent measure on the finished map: hops via rooms is only known to the builder, so use the stored info or recompute distance
  const g=m.t,st=m.start,lev=m.lever;const d=A.dunStepsTo(g,st,'',lev),door=(()=>{for(let y=0;y<g.length;y++)for(let x=0;x<g[0].length;x++)if(g[y][x]==='D')return [x,y];})();
  const route=A.dunStepsTo(g,st,'',door);const k=by[s]=by[s]||{n:0,d:[],frac:[]};k.n++;k.d.push(d);k.frac.push(d/route);bad.n++;
  if(d<Math.ceil(route/3))bad.near++;
  {// rooms entered before the lever room, from the finished map
    const D2=A.dunDist(g,st,'D'),inR=(x,y,r)=>x>=r.x&&x<r.x+r.w&&y>=r.y&&y<r.y+r.h;let cx=lev[0],cy=lev[1],bd=1e9;
    [[0,1],[1,0],[0,-1],[-1,0]].forEach(([a,c])=>{const v=(D2[lev[1]+c]||[])[lev[0]+a];if(v>=0&&v<bd){bd=v;cx=lev[0]+a;cy=lev[1]+c;}});
    const seq=[];let gd=0;while(gd++<5000){const r=m.rects.find(q=>inR(cx,cy,q));if(r&&seq[seq.length-1]!==r)seq.push(r);const d0=D2[cy][cx];if(d0<=0)break;let mv=false;for(const [a,c] of [[0,-1],[-1,0],[0,1],[1,0]]){const v=(D2[cy+c]||[])[cx+a];if(v>=0&&v===d0-1){cx+=a;cy+=c;mv=true;break;}}if(!mv)break;}
    seq.reverse();const hops=seq.filter(r=>!(r.x===m.startRect.x&&r.y===m.startRect.y)).length-1;(k.h=k.h||[]).push(hops);if(hops<1)bad.hops++;}
}
const q=(a,p)=>{a=a.slice().sort((x,y)=>x-y);return a[Math.min(a.length-1,Math.floor(p*a.length))];};
console.log(old?'OLD rules':'NEW rules','dungeons',bad.n,'lever inside first third of route:',bad.near,'| lever in the first two rooms:',bad.hops);
Object.keys(by).forEach(s=>{const k=by[s];console.log('realm',s,'n',k.n,'path dist min/p10/med/p90/max',q(k.d,0),q(k.d,.1),q(k.d,.5),q(k.d,.9),q(k.d,.999),' hops min/med',Math.min(...k.h),q(k.h,.5),' fraction of route min/med',Math.min(...k.frac).toFixed(2),q(k.frac,.5).toFixed(2));});
