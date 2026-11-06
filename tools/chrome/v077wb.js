// v0.7.7 weather pass: frame rate budget. A field in rain, storm, snow, blizzard and fog and a battle in rain, CPU throttled 4x (CDP),
// 390x844 at 2x, Low and Medium (High is reported, it may cost more). fps is the requestAnimationFrame rate over MS ms, best of REPS.
// With PWBASE (the build before, e.g. git show HEAD:index.html saved to a file) each row is measured on both and Medium and Low must
// stay within 3 fps of before; without it they must hold 50 fps. Usage: PWHTML=../../out/aurelis3.html PWBASE=<old.html> node v077wb.js
const {open,chk,done}=require('./pw');const fs=require('fs');
const RATE=+process.env.RATE||4,MS=+process.env.MS||3000,REPS=+process.env.REPS||2;
const META=t=>`(()=>{let s=2;Math.random=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};})();localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,autoStats:true,autoEquip:false,gfx:'${t}',rmotion:false,hints:false}}));`;
const FPS=ms=>new Promise(res=>{let n=0,slow=0,last=performance.now();const t0=last;const f=()=>{const t=performance.now();if(t-last>20)slow++;last=t;n++;if(t-t0<ms)requestAnimationFrame(f);else res([+(n*1000/(t-t0)).toFixed(1),+(slow/n*100).toFixed(0)]);};requestAnimationFrame(f);});
async function run(html){const out={};
  for(const t of ['low','medium','high']){const H=await open({w:390,h:844,mobile:true,dpr:2,html,pre:META(t)});const {ev,wait,page,ctx}=H;const cdp=await ctx.newCDPSession(page);
    await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.render();});await wait(400);
    for(const w of ['rain','storm','snow','blizzard','fog']){await ev(w=>{const A=__A,G=A.G;G.clock=100;G.weather[0]=w;const m=A.getMap('f0');let best=null;for(let y=2;y<m.h-2&&!best;y++)for(let x=Math.floor(m.w/2);x<m.w-2;x++){if(A.tileAt(m,x,y)===','&&!A.solidAt(m,x,y)){best=[x,y];break;}}
        if(!best)best=Object.values(m.gates)[0].arrive;A.placeAt('f0',best[0],best[1],'d');A.TR.wx.key=null;A.render();},w);await wait(700);
      await cdp.send('Emulation.setCPUThrottlingRate',{rate:RATE});await wait(300);const r=await ev(FPS,MS);await cdp.send('Emulation.setCPUThrottlingRate',{rate:1});
      out[t+' field '+w]=r;}
    await ev(()=>{const A=__A;A.startBattle({stage:0,kind:'field',weather:'rain'});});await page.waitForFunction(()=>__A.B&&__A.B.mode==='cmd',{timeout:30000}).catch(()=>{});
    await ev(()=>{const A=__A,B=A.B;B.en.forEach(e=>{e.S.mhp=e.hp=999999;});B.front.forEach(c=>{c.hp=c.S.mhp=999999;});A.ACT.auto();});await wait(500);
    await cdp.send('Emulation.setCPUThrottlingRate',{rate:RATE});await wait(300);out[t+' battle rain']=await ev(FPS,MS);await cdp.send('Emulation.setCPUThrottlingRate',{rate:1});
    await H.browser.close();}
  return out;}
(async()=>{const cur=fs.readFileSync(process.env.PWHTML||__dirname+'/../../out/aurelis3.html','utf8'),base=process.env.PWBASE?fs.readFileSync(process.env.PWBASE,'utf8'):null;
  const A={},B={};const best=(o,k,v)=>{if(!o[k]||v[0]>o[k][0])o[k]=v;};
  for(let r=0;r<REPS;r++){if(base){const b=await run(base);Object.keys(b).forEach(k=>best(B,k,b[k]));}const a=await run(cur);Object.keys(a).forEach(k=>best(A,k,a[k]));}
  console.log(`CPU x${RATE}, 390x844 @2x, best of ${REPS}. fps (share of frames over 20 ms)`);
  Object.keys(A).forEach(k=>console.log(k.padEnd(22)+(base?`before ${B[k][0]} (${B[k][1]}%)`.padEnd(20):'')+`after ${A[k][0]} (${A[k][1]}%)`));
  for(const k of Object.keys(A)){if(k.startsWith('high'))continue;chk(`${k}: ${base?`within 3 fps of before (${B[k][0]} -> ${A[k][0]})`:`at least 50 fps (${A[k][0]})`}`,base?A[k][0]>=B[k][0]-3:A[k][0]>=50);}
  await done({browser:{close:async()=>{}}});})();
