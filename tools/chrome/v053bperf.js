// v0.5.3 HD-2D battle stage: battle frame rate before and after, CPU throttled (CDP Emulation.setCPUThrottlingRate, default 4x), at
// 390x844 and 844x390 with a device pixel ratio of 2. Scene: a field battle on auto in rain, every unit unkillable, so the DOM refresh,
// the 2D unit layer and (Medium, High) the GL stage all run as in play. Every 2D canvas is CPU backed (willReadFrequently), as on a phone
// without GPU canvas (same as v050p6perf.js). fps is the requestAnimationFrame rate over MS ms (best of REPS runs), with the share of
// frames slower than 20 ms; gl is the GL stage's own JS cost per frame (upload, uniforms, draw calls).
// Usage: PWHTML=../../out/aurelis3.html PWBASE=<build before> REPS=2 node v053bperf.js [rate] [ms]
const {open,chk}=require('./pw');const fs=require('fs');
const RATE=+process.argv[2]||4,MS=+process.argv[3]||3000,REPS=+process.env.REPS||2,TIERS=(process.env.TIERS||'low,medium,high').split(',');
async function run(html,w,h,tiers){
  const H=await open({w,h,mobile:true,dpr:2,html,pre:`(()=>{const gc=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t,o){return gc.call(this,t,t==='2d'?Object.assign({willReadFrequently:true},o||{}):o);};})();(()=>{let s=2;Math.random=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};})();localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,autoStats:true,autoEquip:false,gfx:'medium',rmotion:false,hints:false}}));`});
  const {ev,wait,page,ctx}=H;const cdp=await ctx.newCDPSession(page);const out={};
  await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.render();A.startBattle({stage:0,kind:'field',weather:'rain'});});
  await page.waitForFunction(()=>__A.B&&__A.B.mode==='cmd',{timeout:30000}).catch(()=>{});
  await ev(()=>{const A=__A,B=A.B;B.en.forEach(e=>{e.S.mhp=e.hp=999999;});B.front.forEach(c=>{c.hp=c.S.mhp=999999;});A.ACT.auto();});
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:RATE});
  for(const t of tiers){await ev(t=>{const A=__A;A.META.cfg.gfx=t;A.gfxApply();},t);await wait(800);
    const r=await ev(ms=>new Promise(res=>{let n=0,slow=0,last=performance.now();const t0=last;const f=()=>{const t=performance.now();if(t-last>20)slow++;last=t;n++;if(t-t0<ms)requestAnimationFrame(f);else res([+(n*1000/(t-t0)).toFixed(1),+(slow/n*100).toFixed(0)]);};requestAnimationFrame(f);}),MS);
    const gl=await ev(()=>__A.HB?{on:__A.HB.on,ms:+__A.HB.ms.toFixed(2),px:__A.HB.cv?__A.HB.cv.width+'x'+__A.HB.cv.height:'',draws:__A.HB.frames,skips:__A.HB.skips}:null);
    out[t]={fps:r[0],slow:r[1],gl};}
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:1});await H.browser.close();return out;}
(async()=>{const cur=fs.readFileSync(process.env.PWHTML||__dirname+'/../../out/aurelis3.html','utf8'),base=process.env.PWBASE?fs.readFileSync(process.env.PWBASE,'utf8'):null;
  const rows=[];const best=(a,b)=>!a||b.fps>a.fps?b:a;
  for(const [n,w,h] of [['portrait 390x844',390,844],['landscape 844x390',844,390]]){const acc={};
    for(let r=0;r<REPS;r++){if(base){const b=await run(base,w,h,TIERS);Object.keys(b).forEach(t=>acc['before '+t]=best(acc['before '+t],b[t]));}
      const a=await run(cur,w,h,TIERS);Object.keys(a).forEach(t=>acc['after '+t]=best(acc['after '+t],a[t]));}
    Object.keys(acc).forEach(k=>rows.push([n,k,acc[k]]));}
  console.log(`\nCPU x${RATE}, dpr 2, battle on auto in rain. fps (share of frames over 20 ms) | GL stage JS ms per frame | GL backing size`);
  rows.forEach(([n,k,r])=>console.log(n.padEnd(20)+k.padEnd(16)+`${r.fps} (${r.slow}%)`.padEnd(14)+(r.gl&&r.gl.on?`gl ${r.gl.ms} ms  ${r.gl.px}  GL draws ${r.gl.draws}, skipped ${r.gl.skips}`:'2D')));
  fs.writeFileSync(__dirname+'/v053bperf.out.json',JSON.stringify(rows,null,1));chk('measured',rows.length>0);process.exit(0);})();
