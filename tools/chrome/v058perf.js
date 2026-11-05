// v0.5.8 sprites in the scene: Medium battle frame rate before and after, CPU throttled 4x (CDP), 390x844 at dpr 2, every 2D canvas CPU
// backed (as v053bperf.js), a field battle on auto in rain (every unit unkillable), plus a cave battle (lava lights). Before and after
// interleaved, best of REPS. Passes when after is within BUDGET fps (3) of before for every scene.
// Usage: PWHTML=../../out/aurelis3.html PWBASE=<build before> REPS=3 node v058perf.js [rate] [ms]
const {open,chk}=require('./pw');const fs=require('fs');
const RATE=+process.argv[2]||4,MS=+process.argv[3]||3000,REPS=+process.env.REPS||3,BUDGET=+process.env.BUDGET||3,TIER=process.env.TIER||'medium';
const SC={field:{stage:0,kind:'field',weather:'rain'},cave:{stage:0,kind:'field',weather:'clear',bg:{th:'cave',k:'cave'}}};
async function run(html,sc){
  const H=await open({w:390,h:844,mobile:true,dpr:2,html,pre:`(()=>{const gc=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t,o){return gc.call(this,t,t==='2d'?Object.assign({willReadFrequently:true},o||{}):o);};})();(()=>{let s=2;Math.random=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};})();localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,autoStats:true,autoEquip:false,gfx:'${TIER}',rmotion:false,hints:false}}));`});
  const {ev,wait,page,ctx}=H;const cdp=await ctx.newCDPSession(page);
  await ev(sp=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.render();A.startBattle(sp);},SC[sc]);
  await page.waitForFunction(()=>__A.B&&__A.B.mode==='cmd',{timeout:30000}).catch(()=>{});
  await ev(()=>{const A=__A,B=A.B;B.en.forEach(e=>{e.S.mhp=e.hp=999999;});B.front.forEach(c=>{c.hp=c.S.mhp=999999;});A.ACT.auto();});await wait(1500);
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:RATE});await wait(500);
  const r=await ev(ms=>new Promise(res=>{let n=0,slow=0,last=performance.now();const t0=last;const f=()=>{const t=performance.now();if(t-last>20)slow++;last=t;n++;if(t-t0<ms)requestAnimationFrame(f);else res([+(n*1000/(t-t0)).toFixed(1),+(slow/n*100).toFixed(0)]);};requestAnimationFrame(f);}),MS);
  const lit=await ev(()=>__A.HB.litN||0);
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:1});await H.browser.close();return {fps:r[0],slow:r[1],lit};}
(async()=>{const cur=fs.readFileSync(process.env.PWHTML||__dirname+'/../../out/aurelis3.html','utf8'),base=fs.readFileSync(process.env.PWBASE,'utf8');const out={};
  for(const sc of Object.keys(SC)){out[sc]={before:null,after:null};for(let i=0;i<REPS;i++){const b=await run(base,sc),a=await run(cur,sc);
      if(!out[sc].before||b.fps>out[sc].before.fps)out[sc].before=b;if(!out[sc].after||a.fps>out[sc].after.fps)out[sc].after=a;console.log(sc,'rep',i,'before',JSON.stringify(b),'after',JSON.stringify(a));}}
  console.log(`\nCPU x${RATE}, 390x844 dpr 2, ${TIER} battle on auto, best of ${REPS}: fps (share of frames over 20 ms)`);
  for(const [sc,r] of Object.entries(out)){console.log(sc.padEnd(6),'before',`${r.before.fps} (${r.before.slow}%)`.padEnd(12),'after',`${r.after.fps} (${r.after.slow}%)`,`lit sprites built ${r.after.lit}`);
    chk(`${TIER} ${sc}: after ${r.after.fps} fps within ${BUDGET} of before ${r.before.fps}`,r.after.fps>=r.before.fps-BUDGET);}
  process.exit(0);})();
