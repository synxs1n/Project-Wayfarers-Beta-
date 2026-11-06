// v0.8.2 themed dungeons: frame rate, this build against the one before (PWBASE), measured in turns (before, after, before, after...) so a
// busy machine weighs on both alike; best of REPS. Scenes: an ice cavern (Glacier Teeth), a volcanic cavern (Cinderhollow Deeps), a crypt
// (Thistlewold) and the lair field (standing south of the lair), on Low (2D) and Medium (HD-2D), CPU throttled RATE x (CDP), 390x844 at 2x.
// Rows must stay within 3 fps of before. Usage: PWHTML=../../out/aurelis3.html PWBASE=<old.html> node v082dperf.js
const {open,chk,done}=require('./pw');const fs=require('fs');
const RATE=+process.env.RATE||4,MS=+process.env.MS||3000,REPS=+process.env.REPS||3;
const META=t=>`(()=>{let s=2;Math.random=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};})();localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,autoStats:true,autoEquip:false,gfx:'${t}',rmotion:false,hints:false}}));`;
const FPS=ms=>new Promise(res=>{let n=0,last=performance.now();const t0=last;const f=()=>{const t=performance.now();last=t;n++;if(t-t0<ms)requestAnimationFrame(f);else res(+(n*1000/(t-t0)).toFixed(1));};requestAnimationFrame(f);});
const SC=[['glacier','d'],['deeps','d'],['thistle','d'],['glacier','f']].filter(q=>!process.env.SCN||process.env.SCN.split(',').includes(q[0]+q[1]));
async function run(html,tier){const H=await open({w:390,h:844,mobile:true,dpr:2,html,pre:META(tier)});const {ev,wait,page,ctx}=H;const cdp=await ctx.newCDPSession(page);const out={};
  await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.G.run.seed=424242;A.resetMaps();A.render();});await wait(400);
  for(const [k,kind] of SC){await ev(([k,kind])=>{const A=__A,G=A.G;G.clock=150;G.run.order[1]=A.ZONES.findIndex(z=>z.key===k);A.resetMaps();G.weather[1]='clear';
      if(kind==='d'){const d=A.getMap('d1');d.roam=[];A.placeAt('d1',d.start[0],d.start[1],'d');}else{const f=A.getMap('f1');let p=null;const o=f.entOut||[f.ent[0],f.ent[1]+1],fv=[o[0]-f.ent[0],o[1]-f.ent[1]];for(const k of [4,3,5,2,1])if(!p&&!A.solidAt(f,f.ent[0]+fv[0]*k,f.ent[1]+fv[1]*k))p=[f.ent[0]+fv[0]*k,f.ent[1]+fv[1]*k];A.placeAt('f1',p[0],p[1],'u');}A.V.modal=null;A.render();},[k,kind]);
    await wait(900);await cdp.send('Emulation.setCPUThrottlingRate',{rate:RATE});await wait(300);out[tier+' '+k+' '+(kind==='d'?'dungeon':'lair field')]=await ev(FPS,MS);await cdp.send('Emulation.setCPUThrottlingRate',{rate:1});}
  await H.browser.close();return out;}
(async()=>{const cur=fs.readFileSync(process.env.PWHTML||__dirname+'/../../out/aurelis3.html','utf8'),base=fs.readFileSync(process.env.PWBASE,'utf8');const A={},B={};const best=(o,k,v)=>{if(!o[k]||v>o[k])o[k]=v;};
  for(let r=0;r<REPS;r++)for(const t of (process.env.TIERS||'low,medium').split(',')){const b=await run(base,t);Object.keys(b).forEach(k=>best(B,k,b[k]));const a=await run(cur,t);Object.keys(a).forEach(k=>best(A,k,a[k]));}
  console.log(`CPU x${RATE}, 390x844 @2x, best of ${REPS}, runs in turns`);Object.keys(A).forEach(k=>console.log(k.padEnd(30)+`before ${B[k]}`.padEnd(16)+`after ${A[k]}`));
  for(const k of Object.keys(A))chk(`${k}: within 3 fps of before (${B[k]} -> ${A[k]})`,A[k]>=B[k]-3);
  await done({browser:{close:async()=>{}}});})();
